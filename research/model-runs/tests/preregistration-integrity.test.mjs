// preregistration-integrity.test.mjs
//
// A pre-registration is only worth something if the plan cannot be quietly edited after the data exists.
// Rule (PREREGISTRATION.md, "Deviations (append-only, dated)"): after a run starts, the ONLY permitted change is
// appending dated deviations under that heading. This test makes that mechanical:
//
//  1. Every research/model-runs/<run>/PREREGISTRATION.md must have run-config.json `preregistration.as_written_sha256`.
//  2. Reconstructing the as-written file (everything above the Deviations heading, then the heading, then the
//     recorded placeholder) must reproduce that hash byte for byte. Any edit to the plan text fails.
//  3. Deviations must be numbered D1, D2, ... consecutively, each dated YYYY-MM-DD, so one cannot be silently removed.
//
// Positive/negative controls run on in-memory copies of the real file (V3/V8): a one-character plan edit must fail,
// a removed deviation must fail, and the untouched file must pass. Fail-on-zero: at least one run must be checked.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const RUNS = join(here, "..");
const HEADING = "## Deviations (append-only, dated)";
const NL = String.fromCharCode(10);

function checkPrereg(text, cfg) {
  const problems = [];
  if (text.includes(String.fromCharCode(13))) problems.push("contains CR characters; the hash is defined over LF text");
  const i = text.indexOf(HEADING);
  if (i < 0) return ["no '" + HEADING + "' heading"];
  const reconstructed = text.slice(0, i) + HEADING + NL + NL + cfg.deviations_placeholder + NL;
  const sha = createHash("sha256").update(reconstructed).digest("hex");
  if (sha !== cfg.as_written_sha256) problems.push("plan text above the Deviations heading changed: " + sha + " != " + cfg.as_written_sha256);
  const tail = text.slice(i + HEADING.length);
  const ids = [...tail.matchAll(/^- \*\*(\d{4}-\d{2}-\d{2}), D(\d+)\b/gm)].map((m) => Number(m[2]));
  const placeholderStill = tail.includes(cfg.deviations_placeholder);
  if (ids.length === 0 && !placeholderStill) problems.push("Deviations section has neither entries nor the placeholder");
  if (ids.length > 0 && placeholderStill) problems.push("placeholder left in place alongside deviations");
  ids.forEach((n, k) => { if (n !== k + 1) problems.push("deviation numbering broken at position " + (k + 1) + ": D" + n); });
  return problems;
}

function runsWithPrereg() {
  return readdirSync(RUNS, { withFileTypes: true })
    .filter((d) => d.isDirectory() && existsSync(join(RUNS, d.name, "PREREGISTRATION.md")))
    .map((d) => d.name);
}

test("fail-on-zero: at least one pre-registered run exists", () => {
  assert.ok(runsWithPrereg().length >= 1, "no run directory has a PREREGISTRATION.md");
});

for (const run of runsWithPrereg()) {
  const text = readFileSync(join(RUNS, run, "PREREGISTRATION.md"), "utf8");
  const cfgPath = join(RUNS, run, "run-config.json");

  test(run + ": run-config records the as-written hash", () => {
    assert.ok(existsSync(cfgPath), "missing run-config.json");
    const cfg = JSON.parse(readFileSync(cfgPath, "utf8")).preregistration;
    assert.ok(cfg && /^[0-9a-f]{64}$/.test(cfg.as_written_sha256 ?? ""), "preregistration.as_written_sha256 missing or malformed");
    assert.equal(typeof cfg.deviations_placeholder, "string");
  });

  test(run + ": plan text unchanged since it was written; deviations append-only", () => {
    const cfg = JSON.parse(readFileSync(cfgPath, "utf8")).preregistration;
    assert.deepEqual(checkPrereg(text, cfg), []);
  });

  test(run + ": controls - a plan edit and a removed deviation are both caught", () => {
    const cfg = JSON.parse(readFileSync(cfgPath, "utf8")).preregistration;
    const i = text.indexOf(HEADING);
    // Planted plan edit: change one character well inside the plan text.
    const k = Math.floor(i / 2);
    const edited = text.slice(0, k) + (text[k] === "x" ? "y" : "x") + text.slice(k + 1);
    assert.notEqual(edited, text, "control did not mutate");
    assert.ok(checkPrereg(edited, cfg).some((p) => p.startsWith("plan text")), "a plan edit was not caught");
    // Planted removal of the first deviation, if any exist.
    const first = text.indexOf(NL + "- **", i);
    if (first >= 0) {
      const second = text.indexOf(NL + "- **", first + 1);
      const removed = second >= 0 ? text.slice(0, first) + text.slice(second) : text.slice(0, first) + NL;
      assert.notEqual(removed, text, "control did not mutate");
      assert.ok(checkPrereg(removed, cfg).length > 0, "a removed deviation was not caught");
    }
  });
}
