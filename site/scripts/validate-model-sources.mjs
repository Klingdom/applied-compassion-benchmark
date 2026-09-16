#!/usr/bin/env node

/**
 * validate-model-sources.mjs — Data integrity checks for the CB-MODEL
 * declared source registry (`site/src/data/model-benchmark/release-sources-v1.json`).
 *
 * Enforces `docs/ARCHITECTURE_RELEASE_WATCH_AND_BYO.md` §2.7's L1 schema
 * block: "A source is added by a human from a verified URL, never inferred."
 *
 * All check logic lives in scripts/lib/model-sources-validator.mjs
 * (validateSourceRegistry), which is the same code test-model-sources.mjs
 * exercises against fixtures — this file is a thin CLI wrapper: load the
 * real file, run the shared validator, print a report, set the exit code.
 *
 * Checks (see the lib module's header for the full S-numbered list):
 *  1. Shape (meta, sources[]); an empty registry passes cleanly.
 *  2. meta.sourceCount matches sources.length.
 *  3. meta.quorumRequired is null or does not exceed the number of
 *     tier-primary sources actually registered.
 *  4. Every source has all required fields; enums valid (source_type, tier,
 *     retrieval); url is an absolute https:// URL.
 *  5. source_id equals its deterministic derivation and is unique.
 *  6. added_at / last_retrieved_at are valid, non-future ISO datetimes.
 *
 * Exit code 0 = no failures, 1 = failures found. There are no warnings in
 * this validator today — every check here is a hard integrity rule.
 */

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { validateSourceRegistry } from "./lib/model-sources-validator.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SOURCES_PATH = join(__dirname, "..", "src", "data", "model-benchmark", "release-sources-v1.json");

let store;
try {
  store = JSON.parse(readFileSync(SOURCES_PATH, "utf8"));
} catch (e) {
  console.error(`FATAL: cannot read/parse ${SOURCES_PATH}: ${e.message}`);
  process.exit(1);
}

console.log(`\nValidating declared source registry: ${SOURCES_PATH}`);

const { failures, warnings, checksRun, sourceCount } = validateSourceRegistry(store);

console.log(`\n${"─".repeat(70)}`);
console.log(`SUMMARY`);
console.log(`${"─".repeat(70)}`);
console.log(`  Sources validated:                ${sourceCount}`);
console.log(`  Checks run:                       ${checksRun}`);
console.log(`  Failures (blocking):              ${failures.length}`);
console.log(`  Warnings (non-blocking):          ${warnings.length}`);

if (warnings.length > 0) {
  console.log(`\nWARNINGS (non-blocking)`);
  console.log("─".repeat(70));
  for (const w of warnings) console.log(`  ⚠️  ${w}`);
}

if (failures.length > 0) {
  console.log(`\nFAILURES (blocking)`);
  console.log("─".repeat(70));
  for (const f of failures) console.log(`  ❌ ${f}`);
}

console.log(`\n${"─".repeat(70)}`);
if (failures.length > 0) {
  console.log(`RESULT: FAIL (${failures.length} blocking failure(s))`);
  process.exit(1);
} else {
  console.log(`RESULT: PASS${warnings.length > 0 ? ` (${warnings.length} warning(s))` : ""}`);
  process.exit(0);
}
