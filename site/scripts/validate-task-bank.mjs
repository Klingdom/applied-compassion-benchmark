#!/usr/bin/env node

/**
 * validate-task-bank.mjs — Data integrity checks for the AI evaluation task bank.
 *
 * Validates site/src/data/model-benchmark/tasks-v1.json against the
 * 03-BENCHMARK-BATTERY-SUPER-PROMPT.md item schema and this repo's own
 * dimension canon (site/src/data/dimensions.ts). All check logic lives in
 * scripts/lib/task-bank-validator.mjs (validateTaskBank), which is the same
 * function test-task-bank.mjs exercises against fixtures — this file is a
 * thin CLI wrapper: load the real bank, run the shared validator, print a
 * report, set the exit code.
 *
 * Checks (full detail in lib/task-bank-validator.mjs):
 *  1. JSON parses; top-level shape (meta, items[]) present.
 *  2. Every item has a unique, immutable, non-empty ID.
 *  3. Every item's dimension is one of the 8 canonical codes in
 *     dimensions.ts; any claimed subdimension (indicator) must be real and
 *     belong to the declared dimension.
 *  4. Anchors complete and ordered: exactly 5, levels 1..5 in order, each
 *     description non-empty and distinct within the item.
 *  5. No unfilled template slots: scans prompt text for [...], {{...}}, and
 *     <...> placeholder forms. An unfilled slot on an item not marked
 *     validationStatus "draft"/"retired" is a blocking FAILURE; on a
 *     correctly-declared draft item it is a non-blocking WARNING. The
 *     item's own promptIntegrity.hasUnfilledPlaceholder must match this
 *     independent scan or the check fails (declaration cannot drift from
 *     the actual prompt text).
 *  6. Dimension coverage balance: WARNS (never fails) on gross imbalance —
 *     coverage is a design decision, not a defect.
 *  7. Prompt text non-empty and not duplicated across items.
 *  8. Every item declares pool: "core-public" and exposureStatus:
 *     "public-permanent".
 *
 * Exit code 0 = no blocking failures (warnings allowed), 1 = failures found.
 */

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { validateTaskBank, DIMENSION_CODES } from "./lib/task-bank-validator.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const TASK_BANK_PATH = join(__dirname, "..", "src", "data", "model-benchmark", "tasks-v1.json");

let bank;
try {
  bank = JSON.parse(readFileSync(TASK_BANK_PATH, "utf8"));
} catch (e) {
  console.error(`FATAL: cannot read/parse ${TASK_BANK_PATH}: ${e.message}`);
  process.exit(1);
}

const { failures, warnings, checksRun, dimCounts, unfilledItemIds } = validateTaskBank(bank);

const itemCount = Array.isArray(bank.items) ? bank.items.length : 0;
const evenShare = itemCount > 0 ? itemCount / DIMENSION_CODES.length : 0;

console.log(`\nValidating task bank: ${TASK_BANK_PATH}`);
console.log(`\nDimension coverage (${itemCount} items across ${DIMENSION_CODES.length} dimensions, even split = ${evenShare.toFixed(2)} each):`);
for (const code of DIMENSION_CODES) {
  const n = dimCounts[code] ?? 0;
  const pct = itemCount > 0 ? ((n / itemCount) * 100).toFixed(1) : "0.0";
  console.log(`  ${code}: ${n} items (${pct}%)`);
}

console.log(`\n${"─".repeat(70)}`);
console.log(`SUMMARY`);
console.log(`${"─".repeat(70)}`);
console.log(`  Items validated:            ${itemCount}`);
console.log(`  Checks run:                 ${checksRun}`);
console.log(`  Unfilled-placeholder items: ${unfilledItemIds.length} (${unfilledItemIds.join(", ") || "none"})`);
console.log(`  Failures (blocking):        ${failures.length}`);
console.log(`  Warnings (non-blocking):    ${warnings.length}`);

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
