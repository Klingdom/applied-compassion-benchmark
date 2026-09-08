#!/usr/bin/env node

/**
 * validate-model-registry.mjs — Data integrity checks for the CB-MODEL
 * immutable model registry (`site/src/data/model-benchmark/registry-v1.json`).
 *
 * Enforces `.benchmark-ops/MODEL_REGISTRY.md`'s invariants and
 * `02-RELEASE-INTELLIGENCE-SUPER-PROMPT.md`'s rule: "A provider reusing a
 * model name does not permit overwriting the prior record. Create a dated
 * snapshot when behavior materially changes."
 *
 * All check logic lives in scripts/lib/model-registry-validator.mjs
 * (validateRegistryState / validateRegistryTransition), which is the same
 * code test-model-registry.mjs exercises against fixtures — this file is a
 * thin CLI wrapper: load the real registry (and, if available, the AI Labs
 * Index and the last git-committed copy of the registry), run the shared
 * validators, print a report, set the exit code.
 *
 * Checks:
 *  1. Registry shape (meta, entries[]); an empty registry passes cleanly.
 *  2. Every entry's registry_id is the deterministic derivation of
 *     (developer, family, exact_snapshot) — never hand-assigned, never a
 *     counter — and is unique across the file.
 *  3. Every entry carries complete evidence: source_url, publisher,
 *     published_at, retrieved_at, archive_or_hash (content hash). An entry
 *     without provenance is invalid.
 *  4. Every entry's `developer` resolves to at most one AI Labs Index row
 *     (join-key cardinality, via scripts/lib/product-separation.mjs).
 *  5. If the registry file was previously committed to git, the working-
 *     tree copy is diffed against HEAD's copy: any change to a frozen
 *     field on an existing registry_id, or removal of an existing entry,
 *     is a blocking failure (append-only / no-overwrite enforcement). If
 *     git is unavailable or the file is not yet tracked, this check is
 *     skipped and reported as skipped, not silently passed.
 *
 * Exit code 0 = no blocking failures (warnings allowed), 1 = failures found.
 */

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { validateRegistryState, validateRegistryTransition } from "./lib/model-registry-validator.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REGISTRY_PATH = join(__dirname, "..", "src", "data", "model-benchmark", "registry-v1.json");
const LABS_INDEX_PATH = join(__dirname, "..", "src", "data", "indexes", "ai-labs.json");
const REPO_ROOT = join(__dirname, "..", "..");

let registry;
try {
  registry = JSON.parse(readFileSync(REGISTRY_PATH, "utf8"));
} catch (e) {
  console.error(`FATAL: cannot read/parse ${REGISTRY_PATH}: ${e.message}`);
  process.exit(1);
}

let labsRankings;
try {
  const labsIndex = JSON.parse(readFileSync(LABS_INDEX_PATH, "utf8"));
  labsRankings = Array.isArray(labsIndex.rankings) ? labsIndex.rankings : [];
} catch (e) {
  console.warn(`WARNING: could not read ${LABS_INDEX_PATH} (${e.message}) — developer join-key check will be skipped.`);
  labsRankings = undefined;
}

console.log(`\nValidating model registry: ${REGISTRY_PATH}`);

const { failures, warnings, checksRun, entryCount } = validateRegistryState(registry, { labsRankings });

// ── Opportunistic append-only / no-overwrite check against git HEAD ────────
// Best-effort: this repo's other validators (validate-task-bank.mjs,
// validate-indexes.mjs) validate a single working-tree state only. This one
// additionally tries to diff against the last committed copy, because the
// single most important property this store has to prove is that an
// existing entry was never overwritten — a property that is only visible
// across two states. If git or the prior copy is unavailable, this is
// reported as SKIPPED, never treated as a silent pass.
let transitionChecked = false;
let transitionFailures = [];
let transitionWarnings = [];
try {
  const relPath = "site/src/data/model-benchmark/registry-v1.json";
  const priorRaw = execFileSync("git", ["show", `HEAD:${relPath}`], { cwd: REPO_ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
  const priorRegistry = JSON.parse(priorRaw);
  const result = validateRegistryTransition(priorRegistry, registry);
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
console.log(`  Entries validated:              ${entryCount}`);
console.log(`  Checks run (state):              ${checksRun}`);
console.log(`  Append-only transition check:   ${transitionChecked ? `run (against HEAD)` : "SKIPPED (no committed prior version found)"}`);
console.log(`  Failures (blocking):            ${failures.length + transitionFailures.length}`);
console.log(`  Warnings (non-blocking):        ${warnings.length + transitionWarnings.length}`);

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
