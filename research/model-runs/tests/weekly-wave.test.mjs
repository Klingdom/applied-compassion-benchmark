// weekly-wave.test.mjs
//
// The weekly-wave machinery (lib/weekly.mjs, bin/weekly-wave.mjs). No model is run, Ollama is not contacted, and the
// real repository's git state is never touched: git, free memory and the runner are injected.
//
// Controls: a clean generated config passes conformance (positive control), and each planted protocol change is refused.

import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { HarnessError, MODEL_RUNS_ROOT, loadBankFile } from "../lib/common.mjs";
import { parseJudgingConfig } from "../lib/judging-config.mjs";
import {
  COLLECT_LOCK,
  COLLECT_STATUS,
  DEFAULT_HEADROOM_BYTES,
  DEVIATIONS_HEADING,
  DEVIATIONS_PLACEHOLDER,
  EXIT,
  GIB,
  LOCK_STALE_MS,
  LockedError,
  acquireLock,
  anchorVerdict,
  asWrittenSha256,
  assertPlanAllowed,
  buildWaveConfig,
  checkConformance,
  checkPreregistration,
  collectWave,
  expectedComparisons,
  findOllamaModel,
  labelForTag,
  listWaveDirs,
  loadProtocol,
  loadQueue,
  measuredDevelopersOf,
  memoryPreflight,
  planCommitState,
  protocolSha256,
  releaseLock,
  renderPreregistration,
  resolvePins,
  selectSubjects,
  validateWaveConfig,
  wavePhase,
} from "../lib/weekly.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const BIN = path.resolve(here, "..", "bin", "weekly-wave.mjs");
const NL = String.fromCharCode(10);
const CR = String.fromCharCode(13);
const sha = (t) => createHash("sha256").update(t).digest("hex");
const clone = (o) => JSON.parse(JSON.stringify(o));

const realProtocol = loadProtocol();
const protocol = { ...clone(realProtocol), status: "ratified" }; // a ratified twin: the real file stays "proposed" until the founder ratifies
const queue = loadQueue();
const bank = loadBankFile();

function mkPins(picks, anchorSourceSubjects = 8) {
  return {
    models: Object.fromEntries(picks.map((p, i) => [p.tag, { digest: sha(p.tag), size_bytes: (3 + i) * 1e9 }])),
    anchorSourceSubjects,
    writtenAt: "2026-10-19T00:00:00Z",
  };
}
function mkConfig({ proto = protocol, q = queue, date = "2026-10-19" } = {}) {
  const picks = selectSubjects(q, proto, measuredDevelopersOf(q));
  return { config: buildWaveConfig({ protocol: proto, picks, date, pins: mkPins(picks) }), picks };
}
function scratch(fn) {
  const dir = mkdtempSync(path.join(os.tmpdir(), "weekly-wave-test-"));
  const done = () => rmSync(dir, { recursive: true, force: true });
  let r;
  try {
    r = fn(dir);
  } catch (e) {
    done();
    throw e;
  }
  if (r && typeof r.then === "function") return r.finally(done);
  done();
  return r;
}
const E = (over) => ({ tag: "t", developer: "D", family: "f", identity_terms: ["x"], approx_size_gb: 3, status: "queued", note: "", ...over });
const Q = (entries) => ({ selection_rule: "r", entries });

// ---------------------------------------------------------------------------
// Files
// ---------------------------------------------------------------------------
test("PROTOCOL.json and QUEUE.json load and validate", () => {
  assert.equal(realProtocol.protocol_version, "weekly-v1");
  assert.ok(["proposed", "ratified"].includes(realProtocol.status));
  assert.equal(realProtocol.trials, 3);
  assert.equal(realProtocol.reference.trials, 1);
  assert.equal(realProtocol.reference.label, "gemma2-9b-A");
  assert.equal(realProtocol.anchor.max_mean_abs_difference, 0.3);
  assert.equal(realProtocol.max_new_subjects_per_wave, 2);
  assert.ok(queue.entries.length >= 13);
  assert.deepEqual(measuredDevelopersOf(queue), ["Alibaba", "Google", "Meta", "Mistral AI"]);
});

test("validation refuses a protocol without a rationale and a queue with a duplicate tag", () => {
  const bad = { ...clone(realProtocol), rationale: "" };
  assert.throws(() => loadProtocolFromObject(bad), HarnessError);
  assert.throws(() => loadQueueFromObject(Q([E({ tag: "a" }), E({ tag: "a" })])), HarnessError);
  assert.throws(() => loadQueueFromObject(Q([E({ status: "nope" })])), HarnessError);
});
function loadProtocolFromObject(obj) {
  return scratch((dir) => { const f = path.join(dir, "p.json"); writeFileSync(f, JSON.stringify(obj)); return loadProtocol(f); });
}
function loadQueueFromObject(obj) {
  return scratch((dir) => { const f = path.join(dir, "q.json"); writeFileSync(f, JSON.stringify(obj)); return loadQueue(f); });
}

// ---------------------------------------------------------------------------
// Selection
// ---------------------------------------------------------------------------
test("selection: developers with no measured build come first, then queue order", () => {
  const q = Q([
    E({ tag: "a", developer: "Seen" }),
    E({ tag: "b", developer: "New1" }),
    E({ tag: "c", developer: "Seen" }),
    E({ tag: "d", developer: "New2" }),
    E({ tag: "m", developer: "Seen", status: "measured" }),
  ]);
  const picks = selectSubjects(q, { ...protocol, max_new_subjects_per_wave: 3 }, measuredDevelopersOf(q));
  assert.deepEqual(picks.map((p) => p.tag), ["b", "d", "a"]);
  assert.deepEqual(picks.map((p) => p.developer_has_measured_build), [false, false, true]);
  assert.deepEqual(picks.map((p) => p.queue_position), [2, 4, 1]);
});

test("selection: the real queue picks phi4-mini then granite3.3:8b", () => {
  assert.deepEqual(selectSubjects(queue, protocol, measuredDevelopersOf(queue)).map((p) => p.tag), ["phi4-mini", "granite3.3:8b"]);
});

test("selection: size limit, measured, skipped and the reference build are never picked", () => {
  const q = Q([
    E({ tag: "big", developer: "A", approx_size_gb: 6.01 }),
    E({ tag: "edge", developer: "B", approx_size_gb: 6.0 }),
    E({ tag: "done", developer: "C", status: "measured" }),
    E({ tag: "skip", developer: "D", status: "skipped" }),
    E({ tag: protocol.reference.tag, developer: "Google" }),
    E({ tag: "ok", developer: "F" }),
  ]);
  const picks = selectSubjects(q, protocol, []);
  assert.deepEqual(picks.map((p) => p.tag), ["edge", "ok"]);
});

test("selection: deterministic, does not mutate the queue, and at most max_new_subjects_per_wave", () => {
  const before = JSON.stringify(queue);
  const a = selectSubjects(queue, protocol, measuredDevelopersOf(queue));
  const b = selectSubjects(queue, protocol, measuredDevelopersOf(queue));
  assert.deepEqual(a, b);
  assert.equal(JSON.stringify(queue), before);
  assert.equal(a.length, 2);
  assert.equal(selectSubjects(queue, { ...protocol, max_new_subjects_per_wave: 1 }, []).length, 1);
  const many = Q(Array.from({ length: 9 }, (_, i) => E({ tag: `m${i}`, developer: `Dev${i}` })));
  assert.equal(selectSubjects(many, { ...protocol, max_new_subjects_per_wave: 2 }, []).length, 2);
  assert.deepEqual(selectSubjects(Q([E({ status: "measured" })]), protocol, []), []);
});

test("labels and the generated comparison set", () => {
  assert.equal(labelForTag("gemma2:9b", "A"), "gemma2-9b-A");
  assert.equal(labelForTag("llama3.2:latest", "A"), "llama3.2-A");
  assert.equal(labelForTag("phi4-mini", "A"), "phi4-mini-A");
  assert.deepEqual(expectedComparisons("r", ["x", "y"]), [
    { a: "r", b: "x", kind: "build" },
    { a: "r", b: "y", kind: "build" },
    { a: "x", b: "y", kind: "build" },
  ]);
});

// ---------------------------------------------------------------------------
// Generated config
// ---------------------------------------------------------------------------
test("a generated config passes loadRunConfig, parseJudgingConfig and buildPlan with the expected call count", () => {
  const { config } = mkConfig();
  assert.equal(config.run_id, "wave-2026-10-19");
  assert.equal(config.master_seed, 20261019);
  assert.equal(config.bridge.seed, config.master_seed);
  assert.equal(config.bridge.total, 6 * 8);
  assert.equal(config.comparisons.length, 3);
  assert.equal(config.weekly.protocol_sha256, protocolSha256(protocol));
  const { config: loaded, plan } = validateWaveConfig(config, { bank });
  parseJudgingConfig(loaded);
  assert.equal(plan.items.length, 83);
  assert.equal(plan.total_calls, 2 * 3 * 83 + 83);
  assert.equal(plan.total_calls, 581);
  const byLabel = Object.fromEntries(plan.subjects.map((s) => [s.label, s.trials.length]));
  assert.deepEqual(byLabel, { "gemma2-9b-A": 1, "phi4-mini-A": 3, "granite3.3-8b-A": 3 });
  assert.equal(config.preregistration.deviations_placeholder, DEVIATIONS_PLACEHOLDER);
});

test("buildWaveConfig is deterministic, and refuses missing pins and too many picks", () => {
  assert.deepEqual(mkConfig().config, mkConfig().config);
  const picks = selectSubjects(queue, protocol, []);
  assert.throws(() => buildWaveConfig({ protocol, picks, date: "2026-10-19", pins: { models: {}, anchorSourceSubjects: 8 } }), HarnessError);
  assert.throws(() => buildWaveConfig({ protocol, picks: [...picks, ...picks, ...picks], date: "2026-10-19", pins: mkPins(picks) }), HarnessError);
  assert.throws(() => buildWaveConfig({ protocol, picks, date: "2026-02-31", pins: mkPins(picks) }), HarnessError);
});

// ---------------------------------------------------------------------------
// Conformance: positive control and planted protocol changes
// ---------------------------------------------------------------------------
test("conformance: a clean generated config passes (positive control)", () => {
  const { config } = mkConfig();
  assert.deepEqual(checkConformance(config, protocol), []);
  assert.deepEqual(checkConformance(config, protocol, { queue }), []);
});

const PLANTED = [
  ["the system message", (c) => { c.system_message = "You are a helpful assistant. Reply in about 250 words."; }, /system_message differs/],
  ["the trial count", (c) => { c.trials = 5; }, /trials differs/],
  ["a judge", (c) => { c.judges[0].label = "claude-haiku"; }, /judges differs/],
  ["a judge removed", (c) => { c.judges.pop(); }, /judges differs/],
  ["the reference digest", (c) => { c.subjects[0].digest = "0".repeat(64); }, /reference has changed/],
  ["the reference trials", (c) => { c.subjects[0].trials = 3; }, /reference has changed/],
  ["the bank sha", (c) => { c.bank_sha256 = "f".repeat(64); }, /bank_sha256 differs/],
  ["the bootstrap replicates", (c) => { c.bootstrap_replicates = 200; }, /bootstrap_replicates differs/],
  ["the correction", (c) => { c.correction = "none"; }, /correction differs/],
  ["the batch size", (c) => { c.max_batch_entries = 40; }, /max_batch_entries differs/],
  ["the validity threshold", (c) => { c.judge_validity.max_unfound_quote_rate_percent = 20; }, /judge_validity differs/],
  ["an extra comparison", (c) => { c.comparisons.push({ a: c.subjects[1].label, b: c.subjects[0].label, kind: "build" }); }, /comparisons are not exactly/],
  ["a missing comparison", (c) => { c.comparisons.pop(); }, /comparisons are not exactly/],
  ["a new subject that is not a queue pick", (c) => {
    c.subjects.push({ label: "evil-7b-A", tag: "evil:7b", digest: "a".repeat(64), family: "x", identity_terms: ["evil"], arm: "A" });
  }, /neither the reference nor a recorded queue pick/],
  ["a new subject with its own trials", (c) => { c.subjects[1].trials = 1; }, /overrides trials/],
  ["a new subject with its own system message", (c) => { c.subjects[1].system_message = "Be brief."; }, /overrides the system message/],
  ["a new subject in another arm", (c) => { c.subjects[1].arm = "B"; }, /arm/],
  ["the anchor sample size", (c) => { c.bridge.per_source_subject = 12; }, /per_source_subject/],
  ["the anchor source run", (c) => { c.bridge.source_run = "pilot-2026-10-02"; }, /bridge.source_run/],
];
for (const [what, mutate, expected] of PLANTED) {
  test(`conformance refuses a planted change to ${what}`, () => {
    const { config } = mkConfig();
    const planted = clone(config);
    mutate(planted);
    assert.notDeepEqual(planted, config, "the control did not mutate anything");
    const problems = checkConformance(planted, protocol, { queue });
    assert.ok(problems.length > 0, "the change was not caught");
    assert.ok(problems.some((p) => expected.test(p)), `no problem matched ${expected}: ${problems.join(" | ")}`);
  });
}

test("conformance: a subject that is in the picks but not in the queue is caught when the queue is supplied", () => {
  const { config } = mkConfig();
  const planted = clone(config);
  planted.subjects.push({ label: "evil-7b-A", tag: "evil:7b", digest: "a".repeat(64), family: "x", identity_terms: ["evil"], arm: "A" });
  planted.weekly.picks.push({ tag: "evil:7b", label: "evil-7b-A", developer: "Evil", family: "x", approx_size_gb: 1, queue_position: 99, developer_has_measured_build: false });
  planted.comparisons = expectedComparisons(protocol.reference.label, planted.subjects.slice(1).map((s) => s.label));
  assert.ok(checkConformance(planted, protocol).some((p) => /3 new subjects exceed max_new_subjects_per_wave 2/.test(p)));
  assert.ok(checkConformance(planted, protocol, { queue }).some((p) => /not in QUEUE\.json/.test(p)));
});

test("conformance: a protocol that changed after planning is caught, and the reference build cannot be a new subject", () => {
  const { config } = mkConfig();
  const changed = { ...clone(protocol), anchor: { ...protocol.anchor, max_mean_abs_difference: 0.5 } };
  assert.ok(checkConformance(config, changed).some((p) => /protocol changed after this wave was planned/.test(p)));
  const dup = clone(config);
  dup.subjects[1].tag = protocol.reference.tag;
  assert.ok(checkConformance(dup, protocol).some((p) => /reference build under another label/.test(p)));
});

// ---------------------------------------------------------------------------
// Plan gate
// ---------------------------------------------------------------------------
test("plan gate: a proposed protocol is refused unless --dry-run --allow-proposed", () => {
  const proposed = { ...protocol, status: "proposed" };
  assert.throws(() => assertPlanAllowed(proposed, {}), /not "ratified"/);
  assert.throws(() => assertPlanAllowed(proposed, { dryRun: true }), /not "ratified"/);
  assert.throws(() => assertPlanAllowed(proposed, { allowProposed: true }), /only allowed together with --dry-run/);
  assert.doesNotThrow(() => assertPlanAllowed(proposed, { dryRun: true, allowProposed: true }));
  assert.doesNotThrow(() => assertPlanAllowed(protocol, {}));
  assert.doesNotThrow(() => assertPlanAllowed(protocol, { dryRun: true }));
  assert.throws(() => assertPlanAllowed(protocol, { allowProposed: true }), /only allowed together with --dry-run/);
  assert.throws(() => assertPlanAllowed({ ...protocol, status: "retired" }, { dryRun: true, allowProposed: true }), HarnessError);
});

test("plan CLI: while the real protocol is proposed, a real plan and --allow-proposed without --dry-run both refuse and write nothing", { skip: realProtocol.status !== "proposed" }, () => {
  const wave = path.join(MODEL_RUNS_ROOT, "wave-2026-10-19");
  assert.ok(!existsSync(wave), "precondition: no wave-2026-10-19 directory");
  const a = spawnSync(process.execPath, [BIN, "plan", "--date", "2026-10-19"], { encoding: "utf8" });
  assert.equal(a.status, 1);
  assert.match(a.stderr, /not "ratified"/);
  const b = spawnSync(process.execPath, [BIN, "plan", "--date", "2026-10-19", "--allow-proposed"], { encoding: "utf8" });
  assert.equal(b.status, 1);
  assert.match(b.stderr, /only allowed together with --dry-run/);
  assert.ok(!existsSync(wave), "a refused plan must write nothing");
});

test("resolvePins: reads digest and size, handles :latest, and reports missing, mismatched and oversize builds", () => {
  const refDigest = protocol.reference.digest;
  const models = [
    { name: "phi4-mini:latest", digest: "sha256:" + "b".repeat(64), size: 2.5e9 },
    { name: "granite3.3:8b", digest: "c".repeat(64), size: 7e9 },
    { name: protocol.reference.tag, digest: "d".repeat(64), size: 5.4e9 },
  ];
  assert.equal(findOllamaModel(models, "phi4-mini").name, "phi4-mini:latest");
  const picks = [{ tag: "phi4-mini" }, { tag: "granite3.3:8b" }, { tag: "olmo2:7b" }];
  const r = resolvePins({ models, protocol, picks });
  assert.deepEqual(r.missing, ["olmo2:7b"]);
  assert.equal(r.pins["phi4-mini"].digest, "b".repeat(64));
  assert.ok(r.problems.some((p) => /granite3\.3:8b.*above max_model_size_gb/.test(p)));
  assert.ok(r.problems.some((p) => p.includes("differs from the protocol's pinned reference digest")));
  const ok = resolvePins({ models: [{ name: protocol.reference.tag, digest: refDigest, size: 5.4e9 }], protocol, picks: [] });
  assert.deepEqual(ok, { pins: { [protocol.reference.tag]: { digest: refDigest, size_bytes: 5.4e9 } }, missing: [], problems: [] });
});

// ---------------------------------------------------------------------------
// Pre-registration
// ---------------------------------------------------------------------------
// The integrity method of tests/preregistration-integrity.test.mjs, reimplemented here so this file stands alone.
function integrityProblems(text, cfg) {
  const problems = [];
  if (text.includes(CR)) problems.push("CR");
  const i = text.indexOf(DEVIATIONS_HEADING);
  if (i < 0) return ["no heading"];
  const reconstructed = text.slice(0, i) + DEVIATIONS_HEADING + NL + NL + cfg.deviations_placeholder + NL;
  if (sha(reconstructed) !== cfg.as_written_sha256) problems.push("plan text changed");
  const tail = text.slice(i + DEVIATIONS_HEADING.length);
  const ids = [...tail.matchAll(/^- \*\*(\d{4}-\d{2}-\d{2}), D(\d+)\b/gm)].map((m) => Number(m[2]));
  if (ids.length === 0 && !tail.includes(cfg.deviations_placeholder)) problems.push("neither entries nor placeholder");
  if (ids.length > 0 && tail.includes(cfg.deviations_placeholder)) problems.push("placeholder alongside deviations");
  ids.forEach((n, k) => { if (n !== k + 1) problems.push("numbering"); });
  return problems;
}

test("preregistration: rendering is deterministic, LF-only, clean, and hashes the way the integrity test does", () => {
  const { config } = mkConfig();
  const a = renderPreregistration(config, protocol);
  const b = renderPreregistration(clone(config), protocol);
  assert.equal(a, b);
  assert.ok(!a.includes(CR));
  assert.ok(!/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(a), "raw control byte in the rendering");
  assert.ok(a.endsWith(DEVIATIONS_HEADING + NL + NL + DEVIATIONS_PLACEHOLDER + NL));
  assert.equal(config.preregistration.as_written_sha256, sha(a));
  assert.equal(asWrittenSha256(a), sha(a));
  assert.deepEqual(integrityProblems(a, config.preregistration), []);
  assert.deepEqual(checkPreregistration(a, config.preregistration), []);
  // pilot-3's section structure
  const headings = [...a.matchAll(/^## (.+)$/gm)].map((m) => m[1]);
  assert.deepEqual(headings, [
    "1. Questions",
    "2. Subjects (pinned)",
    "3. Answering protocol",
    "4. Judging",
    "5. Judge validity rule (unchanged)",
    "6. Bridge sample (the cross-wave anchor)",
    "7. Contamination through the MCP server",
    "8. Analysis",
    "9. Stopping and failure rules",
    "Deviations (append-only, dated)",
  ]);
  // it states the pins and every comparison
  for (const s of config.subjects) assert.ok(a.includes(s.digest));
  for (const c of config.comparisons) assert.ok(a.includes(`${c.a}`) && a.includes(`${c.b}`));
});

test("preregistration: a plan edit and a removed deviation are caught; an appended deviation is allowed", () => {
  const { config } = mkConfig();
  const text = renderPreregistration(config, protocol);
  const i = text.indexOf(DEVIATIONS_HEADING);
  const k = Math.floor(i / 2);
  const edited = text.slice(0, k) + (text[k] === "x" ? "y" : "x") + text.slice(k + 1);
  assert.ok(checkPreregistration(edited, config.preregistration).some((p) => p.startsWith("plan text")));
  const dev = text.slice(0, i + DEVIATIONS_HEADING.length) + NL + NL + "- **2026-10-20, D1 - a test deviation.**" + NL;
  assert.deepEqual(checkPreregistration(dev, config.preregistration), []);
  const both = dev + NL + DEVIATIONS_PLACEHOLDER + NL;
  assert.ok(checkPreregistration(both, config.preregistration).length > 0);
});

// ---------------------------------------------------------------------------
// Lock
// ---------------------------------------------------------------------------
test("lock: acquire, conflict, release, and release by a different pid does nothing", () => {
  scratch((dir) => {
    const file = path.join(dir, "operations", "collect.lock");
    const now = () => new Date("2026-10-19T02:00:00Z");
    acquireLock(file, { now, pid: 111, host: "h1" });
    const body = JSON.parse(readFileSync(file, "utf8"));
    assert.deepEqual(body, { pid: 111, acquired_at: "2026-10-19T02:00:00.000Z", host: "h1" });
    assert.throws(() => acquireLock(file, { now, pid: 222, host: "h2" }), (e) => e instanceof LockedError && e.holder.pid === 111);
    assert.equal(releaseLock(file, { pid: 222 }), false);
    assert.ok(existsSync(file));
    assert.equal(releaseLock(file, { pid: 111 }), true);
    assert.ok(!existsSync(file));
    assert.equal(releaseLock(file, { pid: 111 }), false);
    acquireLock(file, { now, pid: 222, host: "h2" });
  });
});

test("lock: a lock older than 12 h is stale and taken over with a warning; a fresh one is not", () => {
  scratch((dir) => {
    const file = path.join(dir, "operations", "collect.lock");
    acquireLock(file, { now: () => new Date("2026-10-19T00:00:00Z"), pid: 1, host: "old" });
    const warnings = [];
    const justFresh = () => new Date(Date.parse("2026-10-19T00:00:00Z") + LOCK_STALE_MS);
    assert.throws(() => acquireLock(file, { now: justFresh, pid: 2, host: "new" }), LockedError);
    const later = () => new Date(Date.parse("2026-10-19T00:00:00Z") + LOCK_STALE_MS + 1000);
    const got = acquireLock(file, { now: later, pid: 2, host: "new", warn: (m) => warnings.push(m) });
    assert.equal(got.tookOverStale, true);
    assert.equal(warnings.length, 1);
    assert.match(warnings[0], /stale lock/);
    assert.equal(JSON.parse(readFileSync(file, "utf8")).pid, 2);
  });
});

// ---------------------------------------------------------------------------
// Memory preflight and anchor verdict
// ---------------------------------------------------------------------------
test("memory preflight passes with headroom and defers without it", () => {
  assert.equal(DEFAULT_HEADROOM_BYTES, 1.5 * GIB);
  const model = 5 * GIB;
  assert.equal(memoryPreflight({ freeBytes: 8 * GIB, modelSizeBytes: model }).ok, true);
  assert.equal(memoryPreflight({ freeBytes: 6.5 * GIB, modelSizeBytes: model }).ok, true, "exactly model plus headroom passes");
  const low = memoryPreflight({ freeBytes: 6.4 * GIB, modelSizeBytes: model });
  assert.equal(low.ok, false);
  assert.match(low.message, /below the 6\.50 GiB needed/);
  assert.equal(memoryPreflight({ freeBytes: 0.6 * GIB, modelSizeBytes: model }).ok, false);
  assert.equal(memoryPreflight({ freeBytes: 3 * GIB, modelSizeBytes: model, headroomBytes: 0 }).ok, false);
  assert.equal(memoryPreflight({ freeBytes: 5.5 * GIB, modelSizeBytes: model, headroomBytes: 0.5 * GIB }).ok, true);
  assert.equal(memoryPreflight({ freeBytes: Number.NaN, modelSizeBytes: model }).ok, false);
});

test("anchorVerdict: below, at and above the threshold, and a missing figure", () => {
  assert.deepEqual(anchorVerdict({ mean_abs_difference: 0.146 }, protocol), { comparable: true, mean_abs_difference: 0.146, threshold: 0.3 });
  assert.equal(anchorVerdict({ mean_abs_difference: 0.3 }, protocol).comparable, true);
  assert.equal(anchorVerdict({ mean_abs_difference: 0.3000001 }, protocol).comparable, false);
  assert.deepEqual(anchorVerdict({ mean_abs_difference: 0.5 }, protocol), { comparable: false, mean_abs_difference: 0.5, threshold: 0.3 });
  assert.equal(anchorVerdict({ overall: { mean_abs_difference: 0.2 } }, protocol).comparable, true);
  assert.equal(anchorVerdict({}, protocol).comparable, false);
  assert.equal(anchorVerdict(undefined, protocol).mean_abs_difference, null);
});

// ---------------------------------------------------------------------------
// Phase
// ---------------------------------------------------------------------------
function mkWaveDir(dir) {
  mkdirSync(path.join(dir, "operations"), { recursive: true });
  writeFileSync(path.join(dir, "run-config.json"), "{}");
  return dir;
}
const putStatus = (dir, obj) => writeFileSync(path.join(dir, COLLECT_STATUS), JSON.stringify(obj));
const putLock = (dir) => writeFileSync(path.join(dir, COLLECT_LOCK), "{}");

test("wavePhase: every phase, from files and the collect status", () => {
  scratch((root) => {
    const phase = (name, setup, git = { committed: true }) => {
      const dir = mkWaveDir(path.join(root, name));
      setup(dir);
      return wavePhase(dir, git);
    };
    assert.throws(() => wavePhase(path.join(root, "nothing"), {}), HarnessError);
    assert.equal(phase("a", () => {}, { committed: false }), "planned-uncommitted");
    assert.equal(phase("b", () => {}, { committed: true }), "planned");
    assert.equal(phase("c", (d) => { putStatus(d, { state: "running" }); putLock(d); }), "collecting");
    assert.equal(phase("c2", (d) => putStatus(d, { state: "partial" })), "collecting");
    assert.equal(phase("d", (d) => putStatus(d, { state: "running" })), "collect-failed", "running with no lock means the process died");
    assert.equal(phase("e", (d) => putStatus(d, { state: "failed" })), "collect-failed");
    assert.equal(phase("f", (d) => putStatus(d, { state: "deferred-low-memory" })), "collect-deferred");
    assert.equal(phase("g", (d) => putStatus(d, { state: "collected" })), "collected");
    assert.equal(phase("h", (d) => { putStatus(d, { state: "collected" }); mkdirSync(path.join(d, "keys")); writeFileSync(path.join(d, "keys", "judge-key.json"), "{}"); }), "judging");
    assert.equal(phase("h2", (d) => { putStatus(d, { state: "collected" }); mkdirSync(path.join(d, "judge-batches")); writeFileSync(path.join(d, "judge-batches", "jb001.md"), "x"); }), "judging");
    assert.equal(phase("i", (d) => { putStatus(d, { state: "collected" }); writeFileSync(path.join(d, "analysis.json"), "{}"); }), "analysed");
    assert.equal(phase("j", (d) => writeFileSync(path.join(d, COLLECT_STATUS), "{not json"), { committed: true }), "collect-failed");
  });
});

test("listWaveDirs finds only wave-YYYY-MM-DD directories, sorted", () => {
  scratch((root) => {
    for (const n of ["wave-2026-10-26", "wave-2026-10-19", "pilot-2026-10-03", "wave-draft"]) mkdirSync(path.join(root, n));
    writeFileSync(path.join(root, "wave-2026-11-02"), "a file, not a directory");
    assert.deepEqual(listWaveDirs(root), ["wave-2026-10-19", "wave-2026-10-26"]);
  });
});

// ---------------------------------------------------------------------------
// Collect
// ---------------------------------------------------------------------------
const REL = "research/model-runs/wave-2026-10-19";
const gitClean = (args) => (args[0] === "log" ? { status: 0, stdout: "0123abcd" + NL } : { status: 0, stdout: "" });
function writeWave(dir, { proto = protocol } = {}) {
  const { config } = mkConfig({ proto });
  writeFileSync(path.join(dir, "run-config.json"), JSON.stringify(config, null, 2) + NL);
  writeFileSync(path.join(dir, "PREREGISTRATION.md"), renderPreregistration(config, proto));
  return config;
}
function fakeDeps(over = {}) {
  const calls = [];
  const deps = {
    runGit: gitClean,
    freemem: () => 16 * GIB,
    spawnRunner: async (args) => { calls.push(args); return { code: 0, stderrTail: ["a line"] }; },
    progress: () => ({ planned: 581, ok: 581, failed: 0, pending: 0 }),
    now: () => new Date("2026-10-20T02:00:00Z"),
    pid: 4242,
    host: "testhost",
    log: () => {},
    warn: () => {},
    ...over,
  };
  return { deps, calls };
}
const collect = (dir, deps, extra = {}) => collectWave({ waveDir: dir, repoRelDir: REL, protocol, queue, deps, ...extra });

test("collect precondition: an uncommitted plan is refused before anything else happens", async () => {
  await scratch(async (dir) => {
    writeWave(dir);
    const seen = [];
    const untracked = (args) => { seen.push(args); return args[0] === "log" ? { status: 0, stdout: "" } : { status: 0, stdout: "?? " + REL + "/run-config.json" + NL }; };
    const { deps, calls } = fakeDeps({ runGit: untracked });
    await assert.rejects(() => collect(dir, deps), (e) => e instanceof HarnessError && /not committed/.test(e.message));
    assert.equal(calls.length, 0, "the runner must not start");
    assert.ok(!existsSync(path.join(dir, COLLECT_LOCK)));
    assert.ok(!existsSync(path.join(dir, COLLECT_STATUS)));
    assert.ok(seen.every((a) => (a[0] === "log" || a[0] === "status") && a.includes("--")), "only read-only git commands are run");
    assert.ok(seen.some((a) => a.includes(REL + "/PREREGISTRATION.md")) && seen.some((a) => a.includes(REL + "/run-config.json")));
  });
});

test("collect precondition: a committed plan with later modifications is refused", async () => {
  await scratch(async (dir) => {
    writeWave(dir);
    const dirty = (args) => (args[0] === "log" ? { status: 0, stdout: "abc" + NL } : { status: 0, stdout: " M " + REL + "/PREREGISTRATION.md" + NL });
    const { deps, calls } = fakeDeps({ runGit: dirty });
    await assert.rejects(() => collect(dir, deps), /modified or untracked since the commit/);
    assert.equal(calls.length, 0);
  });
});

test("planCommitState: committed and clean passes; git failure is a problem", () => {
  assert.deepEqual(planCommitState({ runGit: gitClean, files: ["a", "b"] }), { committed: true, problems: [] });
  const broken = planCommitState({ runGit: () => ({ status: 128, stdout: "" }), files: ["a"] });
  assert.equal(broken.committed, false);
});

test("collect: a non-conforming config, an altered preregistration and a non-ratified protocol are refused", async () => {
  await scratch(async (dir) => {
    const config = writeWave(dir);
    const planted = clone(config);
    planted.system_message = "Be nice.";
    writeFileSync(path.join(dir, "run-config.json"), JSON.stringify(planted, null, 2) + NL);
    const a = fakeDeps();
    await assert.rejects(() => collect(dir, a.deps), /does not conform to the protocol/);
    assert.equal(a.calls.length, 0);

    writeWave(dir);
    writeFileSync(path.join(dir, "PREREGISTRATION.md"), readFileSync(path.join(dir, "PREREGISTRATION.md"), "utf8").replace("## 1. Questions", "## 1. Questions (edited)"));
    await assert.rejects(() => collect(dir, fakeDeps().deps), /integrity check/);

    writeWave(dir);
    await assert.rejects(() => collectWave({ waveDir: dir, repoRelDir: REL, protocol: { ...protocol, status: "proposed" }, queue, deps: fakeDeps().deps }), /not "ratified"/);
  });
});

test("collect: low free memory defers with exit 5, writes the status and releases the lock", async () => {
  await scratch(async (dir) => {
    writeWave(dir);
    const { deps, calls } = fakeDeps({ freemem: () => 0.6 * GIB });
    const r = await collect(dir, deps);
    assert.equal(r.code, EXIT.DEFERRED);
    assert.equal(r.code, 5);
    assert.equal(r.state, "deferred-low-memory");
    assert.equal(calls.length, 0, "no model may be loaded");
    const st = JSON.parse(readFileSync(path.join(dir, COLLECT_STATUS), "utf8"));
    assert.equal(st.state, "deferred-low-memory");
    assert.match(st.message, /below/);
    assert.ok(st.started_at && st.finished_at);
    assert.ok(!existsSync(path.join(dir, COLLECT_LOCK)), "the lock is released in finally");
    assert.equal(wavePhase(dir, { committed: true }), "collect-deferred");
  });
});

test("collect: a held lock gives exit 4 and leaves the other collector's lock and status alone", async () => {
  await scratch(async (dir) => {
    writeWave(dir);
    mkdirSync(path.join(dir, "operations"), { recursive: true });
    acquireLock(path.join(dir, COLLECT_LOCK), { now: () => new Date("2026-10-20T01:00:00Z"), pid: 9, host: "other" });
    const { deps, calls } = fakeDeps();
    const r = await collect(dir, deps);
    assert.equal(r.code, EXIT.LOCKED);
    assert.equal(calls.length, 0);
    assert.ok(existsSync(path.join(dir, COLLECT_LOCK)));
    assert.ok(!existsSync(path.join(dir, COLLECT_STATUS)));
  });
});

test("collect: a complete run is finalised, recorded as collected, and the lock is released", async () => {
  await scratch(async (dir) => {
    writeWave(dir);
    const { deps, calls } = fakeDeps({
      spawnRunner: async (args) => {
        calls.push(args);
        if (args.includes("--finalize")) {
          writeFileSync(path.join(dir, "operations", "subject-run-summary.json"), JSON.stringify({
            complete: true, incomplete_briefs: [], per_subject: { a: { planned: 581, ok: 581, failed: 0, missing: 0 } },
          }));
        }
        return { code: 0, stderrTail: [] };
      },
    });
    const r = await collect(dir, deps);
    assert.equal(r.code, 0);
    assert.equal(r.state, "collected");
    assert.equal(calls.length, 2);
    assert.ok(calls[0].some((a) => a.endsWith("run-local-subjects.mjs")));
    assert.deepEqual(calls[0].slice(1, 5), ["--run-id", "wave-2026-10-19", "--run-root", dir]);
    assert.ok(!calls[0].includes("--finalize") && calls[1].includes("--finalize"));
    const st = JSON.parse(readFileSync(path.join(dir, COLLECT_STATUS), "utf8"));
    assert.equal(st.state, "collected");
    assert.deepEqual(st.counts, { planned: 581, ok: 581, failed: 0, missing: 0 });
    assert.equal(st.exit_code, 0);
    assert.ok(st.started_at && st.finished_at);
    assert.ok(Array.isArray(st.stderr_tail));
    assert.ok(!existsSync(path.join(dir, COLLECT_LOCK)));
    assert.equal(wavePhase(dir, { committed: true }), "collected");
  });
});

test("collect: --limit is passed through and a partial run is not finalised",async () => {
  await scratch(async (dir) => {
    writeWave(dir);
    const { deps, calls } = fakeDeps({ progress: () => ({ planned: 581, ok: 10, failed: 0, pending: 571 }) });
    const r = await collect(dir, deps, { limit: 5 });
    assert.equal(r.code, 0);
    assert.equal(r.state, "partial");
    assert.equal(calls.length, 1);
    assert.deepEqual(calls[0].slice(-2), ["--limit", "5"]);
    assert.ok(!calls.some((a) => a.includes("--finalize")));
    assert.equal(wavePhase(dir, { committed: true }), "collecting", "a partial run is still collecting");
  });
});

test("collect: a runner failure gives exit 3 with the stderr tail, and the lock is still released", async () => {
  await scratch(async (dir) => {
    writeWave(dir);
    const tail = Array.from({ length: 40 }, (_, i) => `err ${i}`);
    const { deps } = fakeDeps({ spawnRunner: async () => ({ code: 1, stderrTail: tail }) });
    const r = await collect(dir, deps);
    assert.equal(r.code, EXIT.FAILED);
    assert.equal(r.state, "failed");
    const st = JSON.parse(readFileSync(path.join(dir, COLLECT_STATUS), "utf8"));
    assert.equal(st.exit_code, 1);
    assert.equal(st.stderr_tail.length, 40);
    assert.ok(!existsSync(path.join(dir, COLLECT_LOCK)));
    assert.equal(wavePhase(dir, { committed: true }), "collect-failed");
  });
});

test("collect: a thrown error becomes a failed status (exit 3), not a crash that leaves a lock", async () => {
  await scratch(async (dir) => {
    writeWave(dir);
    const { deps } = fakeDeps({ spawnRunner: async () => { throw new Error("spawn exploded"); } });
    const r = await collect(dir, deps);
    assert.equal(r.code, 3);
    assert.match(r.message, /spawn exploded/);
    assert.ok(!existsSync(path.join(dir, COLLECT_LOCK)));
  });
});

test("collect: finished with failed trials is a failure (judging cannot start), not 'collected'", async () => {
  await scratch(async (dir) => {
    writeWave(dir);
    const { deps } = fakeDeps({
      spawnRunner: async (args) => {
        if (args.includes("--finalize")) {
          writeFileSync(path.join(dir, "operations", "subject-run-summary.json"), JSON.stringify({
            complete: false, incomplete_briefs: ["x-trial-1"], per_subject: { a: { planned: 581, ok: 580, failed: 1, missing: 0 } },
          }));
        }
        return { code: 0, stderrTail: [] };
      },
    });
    const r = await collect(dir, deps);
    assert.equal(r.code, 3);
    assert.equal(r.state, "failed");
  });
});

// ---------------------------------------------------------------------------
// CLI: check and status read-only behaviour
// ---------------------------------------------------------------------------
test("check CLI: with no wave directory it exits 0 and says so; with waves it never exits 2", () => {
  const r = spawnSync(process.execPath, [BIN, "check", "--all"], { encoding: "utf8" });
  if (listWaveDirs().length === 0) {
    assert.equal(r.status, 0);
    assert.match(r.stdout, /nothing to check/);
  } else {
    assert.ok(r.status === 0 || r.status === 1, r.stderr);
  }
});

test("status CLI: runs, names the protocol, and exits 0 or 3 only", () => {
  const r = spawnSync(process.execPath, [BIN, "status"], { encoding: "utf8" });
  assert.ok(r.status === 0 || r.status === 3, r.stderr);
  assert.match(r.stdout, /Protocol weekly-v1/);
});

test("usage: an unknown subcommand and a collect without a target are usage errors (exit 2)", () => {
  assert.equal(spawnSync(process.execPath, [BIN, "bogus"], { encoding: "utf8" }).status, 2);
  assert.equal(spawnSync(process.execPath, [BIN, "collect"], { encoding: "utf8" }).status, 2);
});
