// analyze-pilot.mjs serves two run shapes with one code path. These tests pin both:
//   1. the first pilot's analysis.json regenerates byte for byte (the generalisation changed nothing for it);
//   2. the explicit-judge-set run's analysis.json agrees with the scorecards the cb-probe MCP server finished,
//      reports the pre-registered primary comparison first-minus-second, and carries the required sections.
// Both read committed run artifacts; the script is deterministic (seeded bootstrap), so reruns are exact.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const runs = path.resolve(here, "..");
const script = path.join(runs, "bin", "analyze-pilot.mjs");

function regenerate(runId) {
  const file = path.join(runs, runId, "analysis.json");
  const before = readFileSync(file);
  const r = spawnSync(process.execPath, [script, "--run-id", runId], { encoding: "utf8" });
  const after = readFileSync(file);
  if (!before.equals(after)) writeFileSync(file, before); // never leave a changed committed artifact behind
  return { r, same: before.equals(after), parsed: JSON.parse(before.toString("utf8")) };
}

test("the first pilot's analysis.json regenerates byte for byte", { skip: !existsSync(path.join(runs, "pilot-2026-10-01", "analysis.json")) }, () => {
  const { r, same } = regenerate("pilot-2026-10-01");
  assert.equal(r.status, 0, r.stderr);
  assert.ok(same, "regenerating pilot-2026-10-01/analysis.json changed it");
});

test("the explicit-judge-set run: analysis regenerates identically and matches the server's scorecards", { skip: !existsSync(path.join(runs, "pilot-2026-10-02", "analysis.json")) }, () => {
  const { r, same, parsed: a } = regenerate("pilot-2026-10-02");
  assert.equal(r.status, 0, r.stderr);
  assert.ok(same, "regenerating pilot-2026-10-02/analysis.json changed it");
  assert.deepEqual(a.design.subjects, ["qwen2.5-7b", "llama3.2-3b"]);
  assert.equal(a.primary_comparison.a, "qwen2.5-7b");
  assert.equal(a.primary_comparison.b, "llama3.2-3b");
  assert.equal(a.primary_comparison.separated, a.primary_comparison.interval95[0] > 0 || a.primary_comparison.interval95[1] < 0);
  assert.equal(a.dimension_pairwise.length, 8);
  for (const s of a.design.subjects) {
    const card = JSON.parse(readFileSync(path.join(runs, "pilot-2026-10-02", "mcp-scorecards", s, "scorecard.json"), "utf8"));
    assert.equal(a.subjects[s].composite, card.composite, `${s}: composite differs from the server's scorecard`);
    assert.equal(a.subjects[s].official, false);
    assert.equal(a.subjects[s].comparability, "none");
  }
  assert.equal(a.quote_grounding, undefined, "first-pilot-only block leaked into the explicit-judge-set shape");
  assert.equal(a.exclusion_record, undefined);
  for (const key of ["judge_validity", "bridge_drift", "deviations", "operations", "self_identifying_replies", "sensitivity"]) assert.ok(a[key], `missing ${key}`);
  assert.equal(a.bridge_drift.pairs, 48);
  assert.deepEqual(a.judge_validity.judges_excluded, []);
  assert.deepEqual(a.deviations.map((d) => d.id), ["D1", "D2", "D3"]);
});
