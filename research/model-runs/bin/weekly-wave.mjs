#!/usr/bin/env node
/**
 * weekly-wave.mjs -- plan, check, collect and report on the weekly open-weight model wave.
 *
 *   node research/model-runs/bin/weekly-wave.mjs plan --date YYYY-MM-DD [--dry-run] [--allow-proposed]
 *   node research/model-runs/bin/weekly-wave.mjs check [--run-id wave-YYYY-MM-DD | --all]
 *   node research/model-runs/bin/weekly-wave.mjs collect (--latest | --run-id wave-YYYY-MM-DD) [--limit N] [--retry-failed]
 *   node research/model-runs/bin/weekly-wave.mjs status [--run-id wave-YYYY-MM-DD]
 *
 * plan     Generates research/model-runs/wave-<date>/{run-config.json, PREREGISTRATION.md, weekly.json} from
 *          weekly/PROTOCOL.json and weekly/QUEUE.json. Reads the local Ollama /api/tags to pin digest and size. Needs a
 *          RATIFIED protocol (--allow-proposed is for --dry-run only). Prints the git add pathspec the founder must
 *          approve; it never runs git add or commit.
 * check    Conformance of one wave (or every wave) with the frozen protocol, plus the pre-registration integrity check.
 * collect  Run by the OS scheduler, outside any Claude session. Refuses unless the plan is committed and unmodified,
 *          checks conformance and free memory, takes a lock, runs run-local-subjects.mjs (Ollama on localhost only),
 *          finalises, and writes operations/collect-status.json. Never runs a git write command, never publishes.
 * status   Phase of the newest wave and the next action. Exits 3 when the last collect failed or was deferred: that is
 *          the failure channel, and the session runbook runs it first.
 *
 * Exit codes: 0 ok or nothing to do, 1 refused, 2 usage, 3 failed, 4 locked, 5 deferred (low memory).
 */
import { existsSync, readFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { parse, mainAsync } from "../lib/cli.mjs";
import { DEFAULT_BANK_PATH, MODEL_RUNS_ROOT, REPO_ROOT, bankSha256, loadBankFile, readJson, refuse, sha256, writeJson, writeText } from "../lib/common.mjs";
import { createOllamaClient } from "../lib/ollama.mjs";
import { loadRunConfig } from "../lib/local-subjects.mjs";
import {
  EXIT,
  PROTOCOL_FILE,
  QUEUE_FILE,
  UNPINNED,
  WAVE_DIR_PATTERN,
  anchorSourceSubjectCount,
  anchorVerdict,
  assertPlanAllowed,
  buildWaveConfig,
  canonicalJson,
  checkConformance,
  checkPreregistration,
  collectWave,
  listWaveDirs,
  largestModelBytes,
  loadProtocol,
  loadQueue,
  makeRunGit,
  measuredDevelopersOf,
  memoryPreflight,
  nextAction,
  planCommitState,
  protocolSha256,
  readCollectStatus,
  renderPreregistration,
  resolvePins,
  selectSubjects,
  validateDate,
  validateWaveConfig,
  wavePhase,
} from "../lib/weekly.mjs";

const COLLECTABLE = new Set(["planned-uncommitted", "planned", "collecting", "collect-failed", "collect-deferred"]);
const relDir = (name) => `research/model-runs/${name}`;

function usage() {
  console.error("usage: weekly-wave.mjs <plan|check|collect|status> [options]  (see the header of this file)");
  process.exit(2);
}

function pickWaveName(v, { required }) {
  if (v["run-id"] !== undefined) {
    if (!WAVE_DIR_PATTERN.test(v["run-id"])) refuse(`--run-id must be wave-YYYY-MM-DD (got ${JSON.stringify(v["run-id"])})`);
    if (!existsSync(path.join(MODEL_RUNS_ROOT, v["run-id"], "run-config.json"))) refuse(`${v["run-id"]} has no run-config.json`);
    return v["run-id"];
  }
  if (required) return null;
  const all = listWaveDirs();
  return all.length > 0 ? all[all.length - 1] : null;
}

// ---------------------------------------------------------------------------
async function cmdPlan(argv) {
  const v = parse({ date: { type: "string" }, "dry-run": { type: "boolean", default: false }, "allow-proposed": { type: "boolean", default: false } }, argv);
  if (v.date === undefined) { console.error("REFUSED: plan needs --date YYYY-MM-DD"); return 2; }
  const dryRun = v["dry-run"];
  const date = validateDate(v.date);

  const protocol = loadProtocol(PROTOCOL_FILE);
  assertPlanAllowed(protocol, { dryRun, allowProposed: v["allow-proposed"] });
  const queue = loadQueue(QUEUE_FILE);
  const measured = measuredDevelopersOf(queue);
  const picks = selectSubjects(queue, protocol, measured);
  if (picks.length === 0) refuse("the queue has no eligible entry (status queued, size within the limit): add entries to weekly/QUEUE.json");

  const name = `wave-${date}`;
  const waveDir = path.join(MODEL_RUNS_ROOT, name);
  if (existsSync(waveDir)) refuse(`${relDir(name)}/ already exists; a wave is planned once. Nothing was written.`);

  const liveBank = bankSha256(DEFAULT_BANK_PATH);
  if (liveBank !== protocol.bank_sha256) {
    refuse(`the task bank on disk (${liveBank}) is not the protocol's bank (${protocol.bank_sha256}). A new bank needs a new protocol version.`);
  }

  // Pin digests and sizes from the local Ollama (a read of /api/tags; no generation).
  let models = [];
  let ollamaNote = null;
  try {
    models = await createOllamaClient({ host: protocol.ollama_host, timeoutMs: 15000 }).listModels();
  } catch (e) {
    ollamaNote = `could not read ${protocol.ollama_host}/api/tags: ${e.message}`;
    if (!dryRun) refuse(`${ollamaNote}. Start Ollama and retry.`);
  }
  const { pins, missing, problems } = resolvePins({ models, protocol, picks });
  if (missing.length > 0) {
    console.log(`Not pulled locally (${missing.length}):`);
    for (const t of missing) console.log(`  ollama pull ${t}`);
  }
  if (ollamaNote) console.log(`NOTE: ${ollamaNote}`);
  for (const p of problems) console.log(`PROBLEM: ${p}`);
  if (!dryRun && (missing.length > 0 || problems.length > 0)) {
    refuse(`cannot pin the subjects${missing.length ? `: run the ollama pull command(s) above and retry` : ""}${problems.length ? `; fix the problem(s) above` : ""}. Nothing was written.`);
  }
  const modelPins = { ...pins };
  for (const pick of picks) if (!modelPins[pick.tag]) modelPins[pick.tag] = { digest: UNPINNED, size_bytes: null };

  const anchorSourceSubjects = anchorSourceSubjectCount(protocol);
  const writtenAt = new Date().toISOString().replace(/\.\d+Z$/, "Z");
  const config = buildWaveConfig({ protocol, picks, date, pins: { models: modelPins, anchorSourceSubjects, writtenAt } });

  // Validate with the existing loaders. A dry run with unpinned digests validates a copy with stand-in digests.
  const bank = loadBankFile(DEFAULT_BANK_PATH);
  const unpinned = picks.some((p) => modelPins[p.tag].digest === UNPINNED);
  const toValidate = unpinned
    ? buildWaveConfig({
        protocol,
        picks,
        date,
        pins: { models: Object.fromEntries(picks.map((p) => [p.tag, { digest: sha256(p.tag), size_bytes: null }])), anchorSourceSubjects, writtenAt },
      })
    : config;
  const { plan } = validateWaveConfig(toValidate, { bank });
  const conf = checkConformance(toValidate, protocol, { queue });
  if (conf.length > 0) refuse(`the generated run-config does not conform to the protocol (a bug):\n  ${conf.join("\n  ")}`);

  const prereg = renderPreregistration(config, protocol);
  const calls = plan.subjects.map((s) => `${s.label}: ${plan.items.length} items x ${s.trials.length} trial(s) = ${s.trials.length * plan.items.length} calls`);

  console.log(`${dryRun ? "DRY RUN (nothing is written)" : "PLAN"}: ${config.run_id}   protocol ${protocol.protocol_version} (${protocol.status}, content sha256 ${protocolSha256(protocol).slice(0, 12)}...)`);
  console.log(`Master seed ${config.master_seed}; bank ${protocol.bank_sha256.slice(0, 12)}... (matches the bank on disk); ${plan.items.length} items served.`);
  console.log(`Queue: developers with a measured build: ${measured.join(", ") || "none"}`);
  console.log("Picks:");
  for (const p of config.weekly.picks) {
    const pin = modelPins[p.tag];
    console.log(`  ${p.label.padEnd(24)} ${p.tag.padEnd(16)} ${p.developer} (queue #${p.queue_position}, ${p.developer_has_measured_build ? "developer already measured" : "new developer"})  digest ${pin.digest === UNPINNED ? UNPINNED : `${pin.digest.slice(0, 12)}...`}  size ${pin.size_bytes ? `${(pin.size_bytes / 1e9).toFixed(2)} GB` : "unknown"}`);
  }
  console.log(`Reference: ${protocol.reference.label} (${protocol.reference.tag}, 1 trial)`);
  console.log("Calls:");
  for (const c of calls) console.log(`  ${c}`);
  console.log(`  total ${plan.total_calls}`);
  console.log(`Comparisons (${config.comparisons.length}): ${config.comparisons.map((c) => `${c.a} vs ${c.b}`).join("; ")}`);
  console.log(`Anchor: ${config.bridge.total} replies (${config.bridge.per_source_subject} per source subject x ${anchorSourceSubjects}) from ${config.bridge.source_run}; mean |diff| above ${protocol.anchor.max_mean_abs_difference} marks the wave not comparable.`);
  const mem = memoryPreflight({ freeBytes: os.freemem(), modelSizeBytes: largestModelBytes(config, protocol) });
  console.log(`Memory now: ${mem.message}${mem.ok ? "" : " (collect would defer)"}`);
  console.log(`PREREGISTRATION.md: ${prereg.split(String.fromCharCode(10)).length} lines, as-written sha256 ${config.preregistration.as_written_sha256}${unpinned ? " (provisional: digests are unpinned)" : ""}`);

  if (dryRun) {
    console.log("Dry run: no file was written.");
    return 0;
  }

  const queueSha = sha256(canonicalJson(queue));
  writeJson(path.join(waveDir, "run-config.json"), config);
  writeText(path.join(waveDir, "PREREGISTRATION.md"), prereg);
  writeJson(path.join(waveDir, "weekly.json"), {
    kind: "weekly-wave-record",
    run_id: config.run_id,
    date,
    protocol_version: protocol.protocol_version,
    protocol_status: protocol.status,
    protocol_sha256: protocolSha256(protocol),
    queue_sha256: queueSha,
    developers_with_measured_build: measured,
    selection_rule: queue.selection_rule,
    picks: config.weekly.picks,
    pins: config.weekly.pins,
    created_at: writtenAt,
    note: "Record of how this wave was planned. Queue statuses are updated by the founder-approved session after collection, not by plan.",
  });
  const files = ["run-config.json", "PREREGISTRATION.md", "weekly.json"].map((f) => `${relDir(name)}/${f}`);
  console.log("");
  console.log(`Wrote ${relDir(name)}/ (3 files). Nothing was staged or committed.`);
  console.log("STOP. The founder must approve committing the plan before any data exists. Exact pathspec:");
  console.log(`  git add ${files.join(" ")}`);
  console.log("Collection (weekly-wave collect) refuses until these files are committed and unmodified.");
  return 0;
}

// ---------------------------------------------------------------------------
function checkOneWave(name, protocol, queue) {
  const dir = path.join(MODEL_RUNS_ROOT, name);
  const problems = [];
  let config = null;
  try {
    config = loadRunConfig(path.join(dir, "run-config.json"));
  } catch (e) {
    problems.push(`run-config.json: ${e.message}`);
  }
  if (config) {
    if (config.run_id !== name) problems.push(`run_id ${config.run_id} does not match the directory ${name}`);
    problems.push(...checkConformance(config, protocol, { queue }));
    const pf = path.join(dir, "PREREGISTRATION.md");
    if (!existsSync(pf)) problems.push("PREREGISTRATION.md is missing");
    else problems.push(...checkPreregistration(readFileSync(pf, "utf8"), config.preregistration ?? {}).map((p) => `PREREGISTRATION.md: ${p}`));
  }
  return problems;
}

async function cmdCheck(argv) {
  const v = parse({ "run-id": { type: "string" }, all: { type: "boolean", default: false } }, argv);
  const protocol = loadProtocol(PROTOCOL_FILE);
  const queue = loadQueue(QUEUE_FILE);
  let names;
  if (v["run-id"] !== undefined && !v.all) names = [pickWaveName(v, { required: true })];
  else names = listWaveDirs();
  if (names.length === 0) {
    console.log("No wave-* directories under research/model-runs/: nothing to check.");
    return 0;
  }
  let bad = 0;
  for (const name of names) {
    const problems = checkOneWave(name, protocol, queue);
    if (problems.length === 0) console.log(`OK    ${name} conforms to protocol ${protocol.protocol_version}`);
    else {
      bad += 1;
      console.log(`FAIL  ${name} (${problems.length} problem${problems.length === 1 ? "" : "s"})`);
      for (const p of problems) console.log(`      - ${p}`);
    }
  }
  console.log(`${names.length} wave(s) checked, ${bad} failing.`);
  return bad > 0 ? 1 : 0;
}

// ---------------------------------------------------------------------------
async function cmdCollect(argv) {
  const v = parse(
    { latest: { type: "boolean", default: false }, "run-id": { type: "string" }, limit: { type: "string" }, "retry-failed": { type: "boolean", default: false } },
    argv
  );
  if (!v.latest && v["run-id"] === undefined) { console.error("REFUSED: collect needs --latest or --run-id wave-YYYY-MM-DD"); return 2; }
  if (v.latest && v["run-id"] !== undefined) { console.error("REFUSED: give --latest or --run-id, not both"); return 2; }
  let limit;
  if (v.limit !== undefined) {
    limit = Number(v.limit);
    if (!Number.isInteger(limit) || limit < 1) refuse("--limit must be a positive integer");
  }
  const protocol = loadProtocol(PROTOCOL_FILE);
  const queue = loadQueue(QUEUE_FILE);

  // (a) the newest wave that still needs collecting
  let name;
  if (v["run-id"] !== undefined) {
    name = pickWaveName(v, { required: true });
    const phase = wavePhase(path.join(MODEL_RUNS_ROOT, name), { committed: false });
    if (!COLLECTABLE.has(phase)) { console.log(`${name} is already ${phase}; nothing to collect.`); return EXIT.OK; }
  } else {
    const candidates = listWaveDirs().filter((n) => COLLECTABLE.has(wavePhase(path.join(MODEL_RUNS_ROOT, n), { committed: false })));
    if (candidates.length === 0) { console.log("No wave needs collecting; nothing to do."); return EXIT.OK; }
    name = candidates[candidates.length - 1];
  }
  console.log(`Collecting ${name} on ${os.hostname()}`);
  const result = await collectWave({ waveDir: path.join(MODEL_RUNS_ROOT, name), repoRelDir: relDir(name), protocol, queue, limit, retryFailed: v["retry-failed"] });
  const out = result.code === EXIT.OK ? console.log : console.error;
  out(`${result.state}: ${result.message}`);
  return result.code;
}

// ---------------------------------------------------------------------------
async function cmdStatus(argv) {
  const v = parse({ "run-id": { type: "string" } }, argv);
  const protocol = loadProtocol(PROTOCOL_FILE);
  console.log(`Protocol ${protocol.protocol_version}: ${protocol.status}${protocol.status === "ratified" ? "" : " (a real plan needs the founder to ratify it)"}`);
  const name = pickWaveName(v, { required: false });
  if (name === null) {
    console.log("No weekly waves yet (no research/model-runs/wave-* directory).");
    console.log("Next: node research/model-runs/bin/weekly-wave.mjs plan --date <YYYY-MM-DD> --dry-run" + (protocol.status === "ratified" ? "" : " --allow-proposed"));
    return 0;
  }
  const dir = path.join(MODEL_RUNS_ROOT, name);
  const files = [`${relDir(name)}/PREREGISTRATION.md`, `${relDir(name)}/run-config.json`];
  const git = planCommitState({ runGit: makeRunGit(REPO_ROOT), files });
  const phase = wavePhase(dir, { committed: git.committed });
  console.log(`Newest wave: ${name}`);
  console.log(`Phase:       ${phase}`);
  if (!git.committed) for (const p of git.problems) console.log(`  plan: ${p}`);
  const st = readCollectStatus(dir);
  if (st) {
    console.log(`Last collect: ${st.state}${st.message ? ` - ${st.message}` : ""}`);
    console.log(`  started ${st.started_at ?? "?"}  finished ${st.finished_at ?? "-"}  runner exit ${st.exit_code ?? "-"}`);
    if (st.counts) console.log(`  counts ${JSON.stringify(st.counts)}`);
    if ((st.state === "failed" || st.state === "deferred-low-memory") && Array.isArray(st.stderr_tail) && st.stderr_tail.length > 0) {
      console.log("  stderr tail:");
      for (const l of st.stderr_tail.slice(-10)) console.log(`    ${l}`);
    }
  }
  const analysisFile = path.join(dir, "analysis.json");
  if (existsSync(analysisFile)) {
    const bd = readJson(analysisFile).bridge_drift;
    const verdict = anchorVerdict(bd, protocol);
    console.log(`Anchor:      ${verdict.comparable ? "comparable" : "NOT COMPARABLE"} (mean |diff| ${verdict.mean_abs_difference ?? "n/a"}, threshold ${verdict.threshold})`);
  }
  console.log(`Next:        ${nextAction(phase)}`);
  if (phase === "collect-failed" || phase === "collect-deferred") {
    console.error(`FAILURE: the last collect of ${name} ${phase === "collect-failed" ? "failed" : "was deferred"}. Report this first.`);
    return EXIT.FAILED;
  }
  return 0;
}

// ---------------------------------------------------------------------------
mainAsync(async () => {
  const [cmd, ...rest] = process.argv.slice(2);
  switch (cmd) {
    case "plan": return cmdPlan(rest);
    case "check": return cmdCheck(rest);
    case "collect": return cmdCollect(rest);
    case "status": return cmdStatus(rest);
    default: return usage();
  }
});
