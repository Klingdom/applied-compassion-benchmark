#!/usr/bin/env node

/**
 * validate-model-releases.mjs — Data integrity checks for the release-watch
 * data layer (`site/src/data/model-benchmark/releases-v1.json`).
 *
 * Enforces `docs/ARCHITECTURE_RELEASE_WATCH_AND_BYO.md` Part 1 (ratified by
 * DECISIONS.md D-30) and `.benchmark-ops/RELEASE_WATCH.md`'s invariant:
 * "A scan that did not run is not a scan that found nothing."
 *
 * All check logic lives in scripts/lib/model-releases-validator.mjs
 * (validateReleaseStore / validateReleaseTransition / validateScanRecords),
 * which is the same code test-model-releases.mjs exercises against
 * fixtures — this file is a thin CLI wrapper: load the real files, run the
 * shared validators, print a report, set the exit code.
 *
 * Checks (see the lib module's header for the full K-numbered list):
 *  1. Store shape (meta, releases[]); an empty store passes cleanly.
 *  2. meta carries the scan-state fields (lastScanId, coverageThrough,
 *     scanState, coverageClaim, staleAfterDays) so the store can say
 *     "we have not looked", not just "no release happened" (C1).
 *  3. Every release's release_id is the deterministic derivation of
 *     (developer, family, snapshot_key) and unique across the file.
 *  4. product_scope is derived from classification, never authored, and a
 *     deployed-ai-audit/incident/non_material release may never carry a
 *     registry_id (D-23 three-product boundary).
 *  5. Every release carries complete evidence (same 5-field bar as the
 *     model registry, imported from model-registry-validator.mjs).
 *  6. Every non-null registry_id resolves in registry-v1.json.
 *  7. Every detected_in_scan resolves to a scan record file whose
 *     promoted_release_ids names this release (bidirectional FK).
 *  8. If the store was previously committed to git, the working-tree copy
 *     is diffed against HEAD's copy: frozen-field edits, release removal,
 *     evidence tampering, or a confirmation_status reversion are blocking
 *     failures. Skipped (and reported as skipped) when unavailable.
 *
 * Staleness (meta.scanState in {stale, degraded, never-scanned}) is ALWAYS
 * a warning, never a blocking failure — detection depends on WebSearch,
 * which is hard-capped and founder-owned (INC-008/BLK-001); see
 * ARCHITECTURE_RELEASE_WATCH_AND_BYO.md §3.4.
 *
 * Exit code 0 = no blocking failures (warnings allowed), 1 = failures found.
 */

import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { validateReleaseStore, validateReleaseTransition } from "./lib/model-releases-validator.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const RELEASES_PATH = join(__dirname, "..", "src", "data", "model-benchmark", "releases-v1.json");
const REGISTRY_PATH = join(__dirname, "..", "src", "data", "model-benchmark", "registry-v1.json");
const SCAN_RECORD_DIR = join(__dirname, "..", "..", "research", "model-index", "release-watch");
const REPO_ROOT = join(__dirname, "..", "..");

let store;
try {
  store = JSON.parse(readFileSync(RELEASES_PATH, "utf8"));
} catch (e) {
  console.error(`FATAL: cannot read/parse ${RELEASES_PATH}: ${e.message}`);
  process.exit(1);
}

let registry;
try {
  registry = JSON.parse(readFileSync(REGISTRY_PATH, "utf8"));
} catch (e) {
  console.warn(`WARNING: could not read ${REGISTRY_PATH} (${e.message}) — registry_id FK check will be skipped.`);
  registry = undefined;
}

// Scan record tree (research/model-index/release-watch/*.json) is OPTIONAL
// and, per the architecture doc's own sequencing (§8 Track R, item R7), does
// not exist yet. Its absence downgrades the affected checks to SKIPPED,
// reported by name — never a silent pass. If the directory exists (even
// empty), scanRecords becomes a real array and the FK/derivation checks run
// for real.
let scanRecords;
try {
  const files = readdirSync(SCAN_RECORD_DIR).filter((f) => f.endsWith(".json"));
  scanRecords = files.map((f) => JSON.parse(readFileSync(join(SCAN_RECORD_DIR, f), "utf8")));
} catch {
  scanRecords = undefined;
  console.log(`NOTE: scan record tree not found at ${SCAN_RECORD_DIR} — this is expected before Track R item R7 ships. K2/K12/K16-adjacent checks report as SKIPPED below, not as a pass.`);
}

console.log(`\nValidating release-watch store: ${RELEASES_PATH}`);

const { failures, warnings, checksRun, releaseCount } = validateReleaseStore(store, { registry, scanRecords });

// ── Opportunistic append-only / no-overwrite check against git HEAD ────────
// Mirrors validate-model-registry.mjs: best-effort diff against the last
// committed copy. If git or the prior copy is unavailable, this is reported
// as SKIPPED, never treated as a silent pass.
let transitionChecked = false;
let transitionFailures = [];
let transitionWarnings = [];
try {
  const relPath = "site/src/data/model-benchmark/releases-v1.json";
  const priorRaw = execFileSync("git", ["show", `HEAD:${relPath}`], { cwd: REPO_ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
  const priorStore = JSON.parse(priorRaw);
  const result = validateReleaseTransition(priorStore, store);
  transitionFailures = result.failures;
  transitionWarnings = result.warnings;
  transitionChecked = true;
} catch {
  // No committed prior version (new file, detached checkout, git
  // unavailable, etc.) — nothing to diff against yet. Not an error.
}

console.log(`\n${"─".repeat(70)}`);
console.log(`SUMMARY`);
console.log(`${"─".repeat(70)}`);
console.log(`  Releases validated:              ${releaseCount}`);
console.log(`  Checks run (state):              ${checksRun}`);
console.log(`  Scan record tree:                ${scanRecords === undefined ? "SKIPPED (not found)" : `${scanRecords.length} record(s) found`}`);
console.log(`  Append-only transition check:    ${transitionChecked ? `run (against HEAD)` : "SKIPPED (no committed prior version found)"}`);
console.log(`  Failures (blocking):             ${failures.length + transitionFailures.length}`);
console.log(`  Warnings (non-blocking):         ${warnings.length + transitionWarnings.length}`);

const allWarnings = [...warnings, ...transitionWarnings];
const allFailures = [...failures, ...transitionFailures];

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
