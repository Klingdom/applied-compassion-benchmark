#!/usr/bin/env node
/**
 * test-model-score-history.mjs
 *
 * Pins the guarantees of the model score history — above all the founder's
 * requirement that previous model scores are ALWAYS kept. Built before the
 * first score exists, because a history that starts after the scores do has
 * already lost some.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  validateScoreHistory,
  validateAgainstPrevious,
  deriveCurrentScores,
  SUBDIMENSION_CODES,
} from "./lib/model-score-history-validator.mjs";
import { DIMENSION_CODES } from "./lib/scoring.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const HISTORY_PATH = join(__dirname, "..", "src", "data", "model-benchmark", "score-history-v1.json");
const REGISTRY_PATH = join(__dirname, "..", "src", "data", "model-benchmark", "registry-v1.json");

let passed = 0;
let failed = 0;
function assert(label, cond, detail = "") {
  if (cond) {
    passed += 1;
    console.log(`  PASS  ${label}`);
  } else {
    failed += 1;
    console.log(`  FAIL  ${label}${detail ? ` — ${detail}` : ""}`);
  }
}

const realHistory = JSON.parse(readFileSync(HISTORY_PATH, "utf8"));
const realRegistry = JSON.parse(readFileSync(REGISTRY_PATH, "utf8"));

// A complete, valid record used as the base for mutation tests.
function goodRecord(overrides = {}) {
  const dims = Object.fromEntries(DIMENSION_CODES.map((c) => [c, 4]));
  const dimCounts = Object.fromEntries(DIMENSION_CODES.map((c) => [c, 3]));
  const subs = Object.fromEntries(SUBDIMENSION_CODES.map((c) => [c, 4]));
  const subCounts = Object.fromEntries(SUBDIMENSION_CODES.map((c) => [c, 2]));
  return {
    record_id: "reg-001--2026-10-01--abc1234",
    registry_id: "reg-001",
    evaluated_at: "2026-10-01",
    bank_version: "v2.0",
    tool_version: "0.3.0",
    judge_configuration: "cross",
    judge_labels: ["model-b (self-reported)"],
    coverage_level: "complete",
    composite: 75,
    band: "Established",
    dimensions: dims,
    dimension_item_counts: dimCounts,
    subdimensions: subs,
    subdimension_item_counts: subCounts,
    trials_per_item: 3,
    contamination_indicated: false,
    contamination_detail: { identification: { correct: 1, questions_asked: 6, flagged: false } },
    official: false,
    comparability: "within-bank",
    artifact_ref: "run-abc1234",
    supersedes: null,
    notes: null,
    ...overrides,
  };
}
const wrap = (records, meta = {}) => ({ meta: { recordCount: records.length, ...meta }, records });

console.log("\nTest 1: the real file is valid and empty, and says why");
{
  const r = validateScoreHistory(realHistory, realRegistry);
  assert("real score history validates", r.valid, r.errors.join(" | "));
  assert("real score history is empty — no model has been scored", realHistory.records.length === 0);
  assert("meta.recordCount agrees with the array", realHistory.meta.recordCount === realHistory.records.length);
  assert("the file explains why there is no top-50 yet", typeof realHistory.meta.whyNoTopFiftyYet === "string" && realHistory.meta.whyNoTopFiftyYet.length > 100);
  assert("the append-only invariant is stated in the file itself", JSON.stringify(realHistory.meta.invariants).includes("APPEND-ONLY"));
}

console.log("\nTest 2: APPEND-ONLY — the founder's requirement, enforced");
{
  const first = goodRecord();
  const before = wrap([first]);

  const deleted = wrap([]);
  const d = validateAgainstPrevious(before, deleted);
  assert("deleting a record fails", !d.valid && d.errors[0].includes("REMOVED"));

  const edited = wrap([{ ...first, composite: 99, band: "Exemplary" }]);
  const e = validateAgainstPrevious(before, edited);
  assert("editing a record fails", !e.valid && e.errors[0].includes("EDITED"));

  const appended = wrap([first, goodRecord({ record_id: "reg-001--2026-11-01--def5678", evaluated_at: "2026-11-01", supersedes: null })]);
  assert("appending a record is allowed", validateAgainstPrevious(before, appended).valid);

  const corrected = wrap([first, goodRecord({ record_id: "reg-001--2026-11-01--fix", evaluated_at: "2026-11-01", composite: 70, supersedes: first.record_id })]);
  assert("a correction that retains the original is allowed", validateAgainstPrevious(before, corrected).valid);
  assert("...and the corrected file is itself valid", validateScoreHistory(corrected).valid);
}

console.log("\nTest 3: a model keeps every score it has ever had");
{
  const r1 = goodRecord({ record_id: "r1", evaluated_at: "2026-10-01", composite: 60, band: "Functional" });
  const r2 = goodRecord({ record_id: "r2", evaluated_at: "2026-11-01", composite: 72, band: "Established" });
  const r3 = goodRecord({ record_id: "r3", evaluated_at: "2026-12-01", composite: 68, band: "Established" });
  const h = wrap([r1, r2, r3]);
  assert("three dated scores for one snapshot validate", validateScoreHistory(h).valid);

  const current = deriveCurrentScores(h);
  assert("current score is DERIVED as the newest record", current.get("reg-001").record_id === "r3");
  assert("the older scores are still present", h.records.length === 3);

  const superseded = wrap([r1, r2, r3, goodRecord({ record_id: "r4", evaluated_at: "2026-12-02", composite: 66, supersedes: "r3" })]);
  const cur2 = deriveCurrentScores(superseded);
  assert("a superseded record is skipped when deriving current", cur2.get("reg-001").record_id === "r4");
  assert("but the superseded record is retained in the file", superseded.records.some((x) => x.record_id === "r3"));
}

console.log("\nTest 4: a reused model name cannot overwrite a prior snapshot's timeline");
{
  const a = goodRecord({ record_id: "a1", registry_id: "gpt-x--2026-05-01", composite: 55, band: "Functional" });
  const b = goodRecord({ record_id: "b1", registry_id: "gpt-x--2026-11-01", composite: 80, band: "Established" });
  const h = wrap([a, b]);
  assert("two snapshots of one family keep separate timelines", validateScoreHistory(h).valid);
  const cur = deriveCurrentScores(h);
  assert("each snapshot derives its own current score", cur.size === 2 && cur.get("gpt-x--2026-05-01").composite === 55);
}

console.log("\nTest 5: unbacked, out-of-range and self-contradicting numbers are refused");
{
  const noItems = goodRecord({ subdimension_item_counts: { ...goodRecord().subdimension_item_counts, A1: 0 } });
  assert("a subdimension mean with 0 rated items fails", !validateScoreHistory(wrap([noItems])).valid);

  const outOfRange = goodRecord({ dimensions: { ...goodRecord().dimensions, AWR: 7 } });
  assert("a dimension mean of 7 fails", !validateScoreHistory(wrap([outOfRange])).valid);

  const halfNull = goodRecord({ composite: 75, band: null });
  assert("a composite with no band fails", !validateScoreHistory(wrap([halfNull])).valid);

  const gated = goodRecord({ coverage_level: "insufficient", composite: 75, band: "Established" });
  assert("a composite on an insufficient run fails (D-40)", !validateScoreHistory(wrap([gated])).valid);

  const thin = goodRecord({ trials_per_item: 1 });
  assert("fewer than 3 trials fails", !validateScoreHistory(wrap([thin])).valid);
}

console.log("\nTest 6: the honesty fields cannot be omitted, and 'official' is hard to earn");
{
  const noVerdict = goodRecord();
  delete noVerdict.contamination_indicated;
  assert("a score with no contamination verdict fails", !validateScoreHistory(wrap([noVerdict])).valid);

  const selfOfficial = goodRecord({ judge_configuration: "self", official: true, comparability: "within-bank" });
  assert("a self-judged run can never be official", !validateScoreHistory(wrap([selfOfficial])).valid);

  const dirtyOfficial = goodRecord({ official: true, contamination_indicated: true, comparability: "within-bank" });
  assert("a contaminated run can never be official", !validateScoreHistory(wrap([dirtyOfficial])).valid);

  const crossContaminated = goodRecord({ comparability: "cross-model", contamination_indicated: true });
  assert("cross-model comparability requires a clean contamination verdict", !validateScoreHistory(wrap([crossContaminated])).valid);
}

console.log("\nTest 7: a score must belong to a registered snapshot");
{
  const orphan = goodRecord({ registry_id: "never-registered" });
  const withRegistry = validateScoreHistory(wrap([orphan]), { entries: [{ registry_id: "reg-001" }] });
  assert("a score for an unregistered snapshot fails", !withRegistry.valid && withRegistry.errors.some((e) => e.includes("never registered")));

  const ok = validateScoreHistory(wrap([goodRecord()]), { entries: [{ registry_id: "reg-001" }] });
  assert("a score for a registered snapshot passes", ok.valid, ok.errors.join(" | "));
}

console.log("\nTest 8: supersedes must point somewhere real");
{
  const dangling = goodRecord({ record_id: "x1", supersedes: "does-not-exist" });
  assert("superseding a missing record fails", !validateScoreHistory(wrap([dangling])).valid);

  const selfRef = goodRecord({ record_id: "x2", supersedes: "x2" });
  assert("superseding itself fails", !validateScoreHistory(wrap([selfRef])).valid);

  const crossSnapshot = wrap([
    goodRecord({ record_id: "p1", registry_id: "reg-A" }),
    goodRecord({ record_id: "p2", registry_id: "reg-B", supersedes: "p1" }),
  ]);
  assert("superseding another snapshot's record fails", !validateScoreHistory(crossSnapshot).valid);
}

console.log("\nTest 9: duplicate ids and count drift are caught");
{
  const dupes = wrap([goodRecord({ record_id: "same" }), goodRecord({ record_id: "same", evaluated_at: "2026-11-01" })]);
  assert("duplicate record_id fails", !validateScoreHistory(dupes).valid);

  const drift = { meta: { recordCount: 9 }, records: [goodRecord()] };
  assert("meta.recordCount disagreeing with the array fails", !validateScoreHistory(drift).valid);
}

console.log("\nTest 10: the validator is not vacuous — a fully good record passes");
{
  const r = validateScoreHistory(wrap([goodRecord()]));
  assert("a complete, valid record passes", r.valid, r.errors.join(" | "));
  assert("checks actually ran", r.checks > 5, `checks=${r.checks}`);
}

console.log(`\n${"─".repeat(60)}`);
console.log(`TOTAL: ${passed} passed, ${failed} failed`);
console.log("─".repeat(60));
if (failed > 0) process.exit(1);
console.log("\nAll model score-history tests passed.");
