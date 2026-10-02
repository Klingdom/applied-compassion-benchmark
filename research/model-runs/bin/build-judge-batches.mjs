#!/usr/bin/env node
/**
 * build-judge-batches.mjs -- step 3.
 *
 * Anonymises every ingested response (random response id) and routes each to exactly two judges, load-balanced.
 * A batch quotes the item prompt, the full anchor ladder and the response verbatim; it carries no subject, trial,
 * brief code or item id. Entries are shuffled. The blinding key is written outside --out.
 *
 * Two modes:
 *   - first-pilot mode (no run-config.json `judges`): the judges are the other subjects, never the reply's own.
 *   - explicit judge set (run-config.json has `judges`, e.g. pilot-2026-10-02): judges are disjoint from the subjects,
 *     never of a reply's family, pairs balanced across subjects and items; the pre-registered bridge sample of
 *     first-pilot replies (section 6) is mixed in, indistinguishable, and recorded in the key only. Batches hold at most
 *     max_batch_entries entries.
 *
 *   node research/model-runs/bin/build-judge-batches.mjs --run-id <id> --out <dir> [--batch-size 40]
 *        [--key-out <dir>] [--keys <dir>] [--seed <n>] [--bank <file>] [--run-root <dir>] [--force]
 *        [--config <run-config.json>] [--bridge-root <dir>] [--dry-run [--partial]]
 *
 * --dry-run builds everything in memory (including the blinding self-check), prints per-judge counts (bridge included)
 * and the number of batches, and writes NOTHING. --partial (dry run only) reads the finished subject replies straight
 * from subject-answers/records/ instead of keys/ingested/answers.json, so the plan can be inspected while a subject run is
 * still in progress; its numbers are meaningless as a build and it never writes a key.
 */
import path from "node:path";
import { existsSync, readdirSync } from "node:fs";
import { parse, runRoot, main } from "../lib/cli.mjs";
import { readJson, loadBankFile, DEFAULT_BANK_PATH, assertKeyOutsideOut, randomSeed, refuse, SUBJECTS, bankSha256, sha256 } from "../lib/common.mjs";
import { buildJudgeBatches, writeJudgeBatches } from "../lib/judge-batches.mjs";
import { parseJudgingConfig, hasExplicitJudges } from "../lib/judging-config.mjs";
import { loadBridgePool, drawBridge } from "../lib/bridge.mjs";
import { routingStats } from "../lib/judge-routing.mjs";
import { recordsDir, readRecord } from "../lib/local-subjects.mjs";

function partialResponses(root, subjects) {
  const out = [];
  let n = 0;
  for (const subject of subjects) {
    const dir = path.join(recordsDir(root), subject);
    if (!existsSync(dir)) continue;
    for (const f of readdirSync(dir).filter((x) => x.endsWith(".json")).sort()) {
      const rec = readRecord(path.join(dir, f));
      if (!rec || rec.status !== "ok") continue;
      n += 1;
      out.push({ subject, trial: rec.trial, brief_id: `partial-b-${subject}-${rec.trial}`, code: `partial-q-${n}`, item_id: rec.item_id, response: rec.response });
    }
  }
  return out;
}

function printPlan({ result, judges, subjects, batchSize, seed }) {
  const { key, batches, records, bridgeRecords } = result;
  console.log(`Replies:    ${records.length} scored (${subjects.map((s) => `${s}=${records.filter((r) => r.subject === s).length}`).join("  ")}), ${bridgeRecords?.length ?? 0} bridge`);
  console.log(`Each scored reply is routed to ${key.judges_per_response} judges; judges: ${judges.join(", ")}`);
  console.log("Per judge (scored + bridge = total ratings requested, batches, entries per batch):");
  for (const j of judges) {
    const mine = batches.filter((b) => b.judge === j);
    const sizes = mine.map((b) => b.batch.entries.length);
    const main = key.judge_load_main?.[j] ?? key.judge_load[j];
    const bridge = key.judge_load_bridge?.[j] ?? 0;
    console.log(`  ${j}: ${main} + ${bridge} = ${main + bridge}   batches=${mine.length}   entries/batch ${sizes.length ? `${Math.min(...sizes)}-${Math.max(...sizes)}` : "-"}`);
  }
  console.log(`Batches:    ${batches.length} in total (size <= ${batchSize}); max entries in any batch ${Math.max(0, ...batches.map((b) => b.batch.entries.length))}`);
  if (key.bridge) {
    const bySrc = {};
    for (const b of key.bridge.entries) bySrc[b.source_subject] = (bySrc[b.source_subject] ?? 0) + 1;
    console.log(`Bridge:     ${key.bridge.entries.length} first-pilot replies from ${key.bridge.source_run} (${Object.entries(bySrc).map(([s, n]) => `${s}=${n}`).join("  ")}); seed ${key.bridge.seed}`);
    const bj = {};
    for (const b of key.bridge.entries) for (const j of b.judges) bj[j] = (bj[j] ?? 0) + 1;
    console.log(`            bridge ratings requested per judge: ${Object.entries(bj).map(([j, n]) => `${j}=${n}`).join("  ")}`);
    const stats = routingStats({ responses: records, routes: records.map((r) => r.judges) });
    for (const [s, p] of Object.entries(stats.perSubjectPair)) console.log(`Pairs for ${s}: ${Object.entries(p).map(([k, n]) => `${k}=${n}`).join("  ")}`);
    console.log(`Self-identifying replies (reported, not blocking): ${key.self_identifying_response_ids.length}`);
  }
  console.log(`Seed:       ${seed}`);
}

main(() => {
  const v = parse({
    "run-id": { type: "string" },
    out: { type: "string" },
    "batch-size": { type: "string" },
    "key-out": { type: "string" },
    keys: { type: "string" },
    seed: { type: "string" },
    bank: { type: "string" },
    "run-root": { type: "string" },
    config: { type: "string" },
    "bridge-root": { type: "string" },
    "dry-run": { type: "boolean", default: false },
    partial: { type: "boolean", default: false },
    force: { type: "boolean", default: false },
  });
  const dry = v["dry-run"];
  if (!v["run-id"] || (!v.out && !dry)) {
    console.error("usage: build-judge-batches.mjs --run-id <id> --out <dir> [--batch-size 40] [--key-out <dir>] [--keys <dir>] [--seed <n>] [--config <file>] [--dry-run [--partial]]");
    return 2;
  }
  if (v.partial && !dry) refuse("--partial is for --dry-run only: a build from unfinished subject data would be useless and must not write a key");

  const root = runRoot(v);
  const keysDir = path.resolve(v.keys ?? path.join(root, "keys"));
  const configFile = path.resolve(v.config ?? path.join(root, "run-config.json"));
  const config = existsSync(configFile) ? readJson(configFile) : null;
  const explicit = config !== null && hasExplicitJudges(config);
  if (v.config && !explicit) refuse(`${configFile} has no \`judges\` array`);
  const judging = explicit ? parseJudgingConfig(config, configFile) : null;
  if (judging && judging.runId !== v["run-id"]) refuse(`run-config.json is for ${judging.runId}, not ${v["run-id"]}`);

  const outDir = v.out ? path.resolve(v.out) : null;
  const keyOut = path.resolve(v["key-out"] ?? keysDir);
  if (!dry) {
    assertKeyOutsideOut(outDir, keyOut);
    if (existsSync(path.join(keyOut, "judge-key.json")) && !v.force) {
      refuse("judge-key.json already exists; rebuilding would re-randomise every response id and orphan judge answers. Pass --force to overwrite deliberately.");
    }
  }

  const bank = loadBankFile(path.resolve(v.bank ?? DEFAULT_BANK_PATH));
  const seed = v.seed === undefined ? (judging ? judging.masterSeed : randomSeed()) : Number(v.seed);
  const batchSize = Number(v["batch-size"] ?? (judging ? judging.maxBatchEntries : 40));

  let subjects;
  let responses;
  let ingestedFile = null;
  if (v.partial) {
    if (!judging) refuse("--partial needs an explicit-judge-set run-config.json");
    subjects = judging.subjects;
    responses = partialResponses(root, subjects);
    console.log(`PARTIAL DRY RUN: ${responses.length} finished replies read from subject-answers/records (the subject run may still be in progress).`);
  } else {
    const subjectKey = readJson(path.join(keysDir, "subject-brief-key.json"));
    if (subjectKey.run_id !== v["run-id"]) refuse(`key is for run ${subjectKey.run_id}, not ${v["run-id"]}`);
    ingestedFile = path.join(keysDir, "ingested", "answers.json");
    const ingested = readJson(ingestedFile);
    if (ingested.run_id !== v["run-id"]) refuse(`ingested answers are for run ${ingested.run_id}`);
    subjects = subjectKey.subjects ?? SUBJECTS;
    responses = ingested.responses;
    if (judging && subjects.slice().sort().join() !== judging.subjects.slice().sort().join()) {
      refuse(`subject key subjects (${subjects.join(", ")}) differ from run-config.json (${judging.subjects.join(", ")})`);
    }
  }

  let judgingArg = null;
  if (judging) {
    const sourceRoot = path.resolve(v["bridge-root"] ?? path.join(path.dirname(root), judging.bridge.sourceRun));
    const pool = loadBridgePool({ sourceRoot, sourceKeyRel: judging.bridge.sourceKey, runJudges: judging.judges, currentBankSha: bankSha256(path.resolve(v.bank ?? DEFAULT_BANK_PATH)) });
    const drawn = drawBridge({ pool, seed: judging.bridge.seed, perSourceSubject: judging.bridge.perSourceSubject, expectedTotal: judging.bridge.total });
    judgingArg = {
      judges: judging.judges,
      familyOf: judging.familyOf,
      maxBatchEntries: judging.maxBatchEntries,
      bridge: drawn,
      bridgeSeed: judging.bridge.seed,
      identityTerms: judging.identityTerms,
    };
  }

  const result = buildJudgeBatches({ bank, responses, subjects, seed, batchSize, runId: v["run-id"], judging: judgingArg });

  if (dry) {
    console.log("DRY RUN: nothing is written (no batches, no key).");
    printPlan({ result, judges: judging ? judging.judges : subjects, subjects, batchSize, seed });
    return 0;
  }

  if (judging) result.key.run_config_sha256 = sha256(JSON.stringify(config));
  const keyFile = writeJudgeBatches({ result, outDir, keyDir: keyOut, ingestedFile });

  if (judging) {
    printPlan({ result, judges: judging.judges, subjects, batchSize, seed });
  } else {
    console.log(`Responses:  ${result.key.responses.length}, each routed to ${result.key.judges_per_response} other-model judges`);
    console.log(`Batches:    ${result.batches.length} (size <= ${v["batch-size"] ?? 40}) in ${outDir}`);
    console.log(`Load:       ${Object.entries(result.key.judge_load).map(([j, n]) => `${j}=${n}`).join("  ")}`);
  }
  console.log(`Key:        ${keyFile}   -- never send this to a judge (seed ${seed})`);
  return 0;
});
