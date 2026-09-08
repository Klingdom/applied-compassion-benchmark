#!/usr/bin/env node

/**
 * validate-evaluation-run.mjs — CB-MODEL Phase 1 Item 5: validates the
 * statistical completeness of executed evaluation runs against the
 * 00-MASTER-CONDUCTOR quality gate reproduced in
 * .benchmark-ops/EVALUATION_LEDGER.md:
 *
 *   "A run missing any of: exact model identity, configuration, benchmark
 *   version, task manifest, repeated trials, raw outputs, rating status,
 *   critical-harm review, analysis version, uncertainty, limitations,
 *   audit hashes — is NOT complete."
 *
 * All check logic lives in scripts/lib/evaluation-statistics.mjs
 * (validateRunCompleteness), which is the same function
 * test-evaluation-statistics.mjs exercises against synthetic fixtures —
 * this file is a thin CLI wrapper: find run records on disk (if any), run
 * the shared validator against each, print a report, set the exit code.
 *
 * ── Where this looks ──────────────────────────────────────────────────
 * docs/MODEL_EVALUATION_HARNESS_DESIGN.md §2.4 places the evidence store at
 * research/model-index/runs/<run_id>/. Neither that harness (Phase A) nor
 * the rating/analysis layer that would produce a completeness record
 * (Phase E/F) has been built yet. This CLI looks for
 * research/model-index/runs/<run_id>/run-record.json — the run-completeness
 * record shape documented next to COMPLETENESS_GATE_FIELDS in
 * evaluation-statistics.mjs — and reports 0 runs cleanly if the directory
 * does not exist, exactly as .benchmark-ops/EVALUATION_LEDGER.md's own "0
 * runs. 0 trials. 0 raw responses." state and
 * validate-model-registry.mjs's empty-registry handling both do. This tool
 * NEVER fabricates a run to demonstrate itself.
 *
 * Exit code 0 = no blocking failures (0 runs is a pass, not a failure),
 * 1 = failures found.
 */

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { validateRunCompleteness, COMPLETENESS_GATE_FIELDS } from "./lib/evaluation-statistics.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..", "..");
const RUNS_DIR = join(REPO_ROOT, "research", "model-index", "runs");
const RECORD_FILENAME = "run-record.json";

console.log(`\nValidating evaluation run statistical completeness`);
console.log(`Runs directory: ${RUNS_DIR}`);
console.log(`Gate fields checked per run: ${COMPLETENESS_GATE_FIELDS.map((f) => f.label).join(", ")}`);

let runDirNames = [];
if (existsSync(RUNS_DIR)) {
  try {
    runDirNames = readdirSync(RUNS_DIR).filter((name) => {
      try {
        return statSync(join(RUNS_DIR, name)).isDirectory();
      } catch {
        return false;
      }
    });
  } catch (e) {
    console.error(`FATAL: cannot read ${RUNS_DIR}: ${e.message}`);
    process.exit(1);
  }
}

// ── No runs directory / no runs — the expected pre-execution state ──────
if (runDirNames.length === 0) {
  console.log(`\n${"─".repeat(70)}`);
  console.log(`SUMMARY`);
  console.log(`${"─".repeat(70)}`);
  console.log(`  Runs found:                 0`);
  console.log(`  Checks run:                 0`);
  console.log(`  Failures (blocking):        0`);
  console.log(`  Warnings (non-blocking):    0`);
  console.log(
    `\nNo run records exist yet (${existsSync(RUNS_DIR) ? "runs directory exists but is empty" : "runs directory does not exist"}). ` +
      `Per .benchmark-ops/EVALUATION_LEDGER.md: "0 runs. 0 trials. 0 raw responses." This is the expected pre-execution ` +
      `state — no harness (docs/MODEL_EVALUATION_HARNESS_DESIGN.md Phase A/C) and no rating/analysis layer (Phase E/F) ` +
      `have been built yet. Nothing to validate. Mirrors validate-model-registry.mjs's handling of an empty registry — ` +
      `this is a clean PASS, not a defect, and this tool does not invent a run to demonstrate itself.`
  );
  console.log(`\n${"─".repeat(70)}`);
  console.log(`RESULT: PASS (0 runs — nothing to validate)`);
  process.exit(0);
}

// ── Runs found — validate each ───────────────────────────────────────────
const allFailures = [];
const allWarnings = [];
let checksRun = 0;
let runsValidated = 0;

for (const dirName of runDirNames.sort()) {
  const recordPath = join(RUNS_DIR, dirName, RECORD_FILENAME);
  checksRun++;
  if (!existsSync(recordPath)) {
    allFailures.push(`Run directory "${dirName}": no ${RECORD_FILENAME} found at ${recordPath} — cannot verify statistical completeness`);
    continue;
  }

  let run;
  try {
    run = JSON.parse(readFileSync(recordPath, "utf8"));
  } catch (e) {
    allFailures.push(`Run directory "${dirName}": ${RECORD_FILENAME} failed to parse: ${e.message}`);
    continue;
  }

  runsValidated++;
  const result = validateRunCompleteness(run);
  checksRun += result.checksRun;
  for (const f of result.failures) allFailures.push(`[${dirName}] ${f}`);
  for (const w of result.warnings) allWarnings.push(`[${dirName}] ${w}`);
}

console.log(`\n${"─".repeat(70)}`);
console.log(`SUMMARY`);
console.log(`${"─".repeat(70)}`);
console.log(`  Run directories found:      ${runDirNames.length}`);
console.log(`  Runs with a parseable record: ${runsValidated}`);
console.log(`  Checks run:                  ${checksRun}`);
console.log(`  Failures (blocking):         ${allFailures.length}`);
console.log(`  Warnings (non-blocking):     ${allWarnings.length}`);

if (allWarnings.length > 0) {
  console.log(`\nWARNINGS (non-blocking)`);
  console.log("─".repeat(70));
  for (const w of allWarnings) console.log(`  ⚠️  ${w}`);
}

if (allFailures.length > 0) {
  console.log(`\nFAILURES (blocking)`);
  console.log("─".repeat(70));
  for (const f of allFailures) console.log(`  ❌ ${f}`);
}

console.log(`\n${"─".repeat(70)}`);
if (allFailures.length > 0) {
  console.log(`RESULT: FAIL (${allFailures.length} blocking failure(s))`);
  process.exit(1);
} else {
  console.log(`RESULT: PASS${allWarnings.length > 0 ? ` (${allWarnings.length} warning(s))` : ""}`);
  process.exit(0);
}
