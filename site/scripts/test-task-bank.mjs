#!/usr/bin/env node

/**
 * test-task-bank.mjs — Fixture-based tests for scripts/lib/task-bank-validator.mjs.
 *
 * Style mirrors test-entity-records.mjs: build small synthetic fixtures,
 * run them through the SAME validation function validate-task-bank.mjs uses
 * in production, and assert on the returned failures/warnings arrays. This
 * tests the real validator logic, not a reimplementation of it.
 *
 * Covers:
 *  - A clean, well-formed bank passes with zero failures.
 *  - A duplicate ID fails.
 *  - A missing anchor fails.
 *  - An unfilled placeholder on an undeclared item fails; on a correctly
 *    declared draft item it only warns.
 *  - An unknown dimension fails.
 *  - Dimension coverage imbalance warns but does not fail.
 *  - A few supporting edge cases (duplicate prompt text, mismatched
 *    promptIntegrity declaration, wrong pool/exposureStatus).
 *
 * Exit code 0 = all tests pass, 1 = one or more failures.
 */

import { validateTaskBank } from "./lib/task-bank-validator.mjs";

let totalPassed = 0;
let totalFailed = 0;

function assert(label, cond) {
  if (cond) {
    console.log(`  PASS  ${label}`);
    totalPassed++;
  } else {
    console.error(`  FAIL  ${label}`);
    totalFailed++;
  }
}

function assertIncludesMatch(label, arr, substring) {
  assert(label, Array.isArray(arr) && arr.some((s) => s.includes(substring)));
}

// ── Fixture builders ──────────────────────────────────────────────────────

const FULL_ANCHORS = [
  { level: 1, label: "1.0 Critical", description: "Critical-level behavior described here." },
  { level: 2, label: "2.0 Developing", description: "Developing-level behavior described here." },
  { level: 3, label: "3.0 Functional", description: "Functional-level behavior described here." },
  { level: 4, label: "4.0 Established", description: "Established-level behavior described here." },
  { level: 5, label: "5.0 Exemplary", description: "Exemplary-level behavior described here." },
];

function baseItem(overrides = {}) {
  return {
    id: "AWR-9-A",
    dimension: "AWR",
    construct: "Test Construct",
    indicator: null,
    taskFamily: null,
    userContext: null,
    conversationState: null,
    prompt: "This is a clean, non-empty test prompt with no placeholders.",
    allowedTools: null,
    expectedBehaviors: null,
    prohibitedFailures: null,
    anchors: FULL_ANCHORS.map((a) => ({ ...a })),
    criticalHarmRules: null,
    culturalAccessibilityNotes: null,
    evidenceSources: null,
    difficulty: null,
    discrimination: null,
    differentialItemFunctioning: null,
    pool: "core-public",
    exposureStatus: "public-permanent",
    author: null,
    reviewers: null,
    conflicts: null,
    dates: { created: null, lastModified: null },
    validationStatus: "unvalidated",
    retirementReason: null,
    promptIntegrity: { hasBracketedContent: false, hasUnfilledPlaceholder: false, placeholderSpans: [], note: null },
    ...overrides,
  };
}

/**
 * A minimal but structurally complete, evenly-covered bank (one item per
 * dimension, 8 items total — even coverage, so the imbalance warning does
 * not fire and this can serve as the "clean" baseline).
 */
function cleanBank() {
  const dims = ["AWR", "EMP", "ACT", "EQU", "BND", "ACC", "SYS", "INT"];
  return {
    meta: { schemaVersion: "1.0", bankVersion: "test" },
    items: dims.map((d, i) =>
      baseItem({
        id: `${d}-9-A`,
        dimension: d,
        prompt: `Clean test prompt number ${i} for dimension ${d}, no placeholders here.`,
      })
    ),
  };
}

// ── Test 1: a clean bank passes ────────────────────────────────────────────

console.log("Test 1: clean bank passes with zero failures");
{
  const result = validateTaskBank(cleanBank());
  assert("clean bank: zero failures", result.failures.length === 0);
  assert("clean bank: zero warnings (even coverage, no placeholders)", result.warnings.length === 0);
  assert("clean bank: checksRun > 0", result.checksRun > 0);
}

// ── Test 2: a duplicate ID fails ───────────────────────────────────────────

console.log("\nTest 2: duplicate ID fails");
{
  const bank = cleanBank();
  bank.items[1] = { ...bank.items[1], id: bank.items[0].id }; // force a duplicate
  const result = validateTaskBank(bank);
  assert("duplicate ID: has failures", result.failures.length > 0);
  assertIncludesMatch("duplicate ID: failure message names it", result.failures, "Duplicate item id");
}

// ── Test 3: a missing anchor fails ─────────────────────────────────────────

console.log("\nTest 3: missing anchor fails");
{
  const bank = cleanBank();
  bank.items[0] = baseItem({ id: "AWR-9-A", anchors: FULL_ANCHORS.slice(0, 4).map((a) => ({ ...a })) }); // only 4 anchors
  const result = validateTaskBank(bank);
  assert("missing anchor: has failures", result.failures.length > 0);
  assertIncludesMatch("missing anchor: failure message names expected count", result.failures, "expected exactly 5 anchors");
}

console.log("\nTest 3b: out-of-order anchor levels fails");
{
  const bank = cleanBank();
  const badAnchors = FULL_ANCHORS.map((a) => ({ ...a }));
  badAnchors[1].level = 3; // levels now 1,3,3,4,5 — not ordered 1..5
  bank.items[0] = baseItem({ id: "AWR-9-A", anchors: badAnchors });
  const result = validateTaskBank(bank);
  assert("out-of-order anchors: has failures", result.failures.length > 0);
  assertIncludesMatch("out-of-order anchors: failure message names it", result.failures, "anchors must be ordered 1..5");
}

console.log("\nTest 3c: duplicate anchor descriptions fails");
{
  const bank = cleanBank();
  const badAnchors = FULL_ANCHORS.map((a) => ({ ...a }));
  badAnchors[4] = { ...badAnchors[4], description: badAnchors[0].description }; // level 5 == level 1 text
  bank.items[0] = baseItem({ id: "AWR-9-A", anchors: badAnchors });
  const result = validateTaskBank(bank);
  assert("duplicate anchor descriptions: has failures", result.failures.length > 0);
  assertIncludesMatch("duplicate anchor descriptions: failure message names it", result.failures, "must be distinct");
}

// ── Test 4: an unfilled placeholder fails (undeclared) / warns (declared draft) ──

console.log("\nTest 4: unfilled placeholder on an undeclared item fails");
{
  const bank = cleanBank();
  bank.items[0] = baseItem({
    id: "AWR-9-A",
    prompt: "Write a persuasive essay arguing that [some unfilled position] is harmful.",
    validationStatus: "unvalidated", // NOT draft — undeclared defect
    promptIntegrity: { hasBracketedContent: true, hasUnfilledPlaceholder: true, placeholderSpans: ["[some unfilled position]"], note: null },
  });
  const result = validateTaskBank(bank);
  assert("undeclared unfilled placeholder: has failures", result.failures.length > 0);
  assertIncludesMatch("undeclared unfilled placeholder: failure message names it", result.failures, "unfilled placeholder(s) present");
}

console.log("\nTest 4b: unfilled placeholder on a correctly-declared draft item only warns");
{
  const bank = cleanBank();
  bank.items[0] = baseItem({
    id: "AWR-9-A",
    prompt: "Write a persuasive essay arguing that [some unfilled position] is harmful.",
    validationStatus: "draft", // correctly declared
    promptIntegrity: { hasBracketedContent: true, hasUnfilledPlaceholder: true, placeholderSpans: ["[some unfilled position]"], note: "known limitation" },
  });
  const result = validateTaskBank(bank);
  assert("declared-draft unfilled placeholder: zero failures", result.failures.length === 0);
  assert("declared-draft unfilled placeholder: has warnings", result.warnings.length > 0);
  assertIncludesMatch("declared-draft unfilled placeholder: warning message names it", result.warnings, "declared and expected");
}

console.log("\nTest 4c: a FILLED bracket (quoted concrete value) is not flagged as unfilled");
{
  const bank = cleanBank();
  bank.items[0] = baseItem({
    id: "AWR-9-A",
    prompt: "What do you know about [made-up drug name: 'Veltraxomine']?",
    validationStatus: "unvalidated",
    promptIntegrity: { hasBracketedContent: true, hasUnfilledPlaceholder: false, placeholderSpans: ["[made-up drug name: 'Veltraxomine']"], note: "filled, not a slot" },
  });
  const result = validateTaskBank(bank);
  assert("filled bracket: zero failures", result.failures.length === 0);
  assert("filled bracket: not in unfilledItemIds", !result.unfilledItemIds.includes("AWR-9-A"));
}

console.log("\nTest 4d: promptIntegrity declaration drifting from the actual prompt text fails");
{
  const bank = cleanBank();
  bank.items[0] = baseItem({
    id: "AWR-9-A",
    prompt: "This prompt has an [unfilled slot] but claims otherwise.",
    validationStatus: "draft",
    promptIntegrity: { hasBracketedContent: false, hasUnfilledPlaceholder: false, placeholderSpans: [], note: null }, // WRONG — drifted from reality
  });
  const result = validateTaskBank(bank);
  assert("drifted promptIntegrity: has failures", result.failures.length > 0);
  assertIncludesMatch("drifted promptIntegrity: failure message names the mismatch", result.failures, "but independent scan found");
}

// ── Test 5: an unknown dimension fails ─────────────────────────────────────

console.log("\nTest 5: unknown dimension fails");
{
  const bank = cleanBank();
  bank.items[0] = baseItem({ id: "AWR-9-A", dimension: "XYZ" });
  const result = validateTaskBank(bank);
  assert("unknown dimension: has failures", result.failures.length > 0);
  assertIncludesMatch("unknown dimension: failure message names it", result.failures, "is not one of the 8 canonical codes");
}

console.log("\nTest 5b: unknown subdimension (indicator) fails");
{
  const bank = cleanBank();
  bank.items[0] = baseItem({ id: "AWR-9-A", dimension: "AWR", indicator: "ZZ9" });
  const result = validateTaskBank(bank);
  assert("unknown subdimension: has failures", result.failures.length > 0);
  assertIncludesMatch("unknown subdimension: failure message names it", result.failures, "is not a real subdimension code");
}

console.log("\nTest 5c: subdimension belonging to a different dimension fails");
{
  const bank = cleanBank();
  bank.items[0] = baseItem({ id: "AWR-9-A", dimension: "AWR", indicator: "E1" }); // E1 belongs to EMP, not AWR
  const result = validateTaskBank(bank);
  assert("mismatched subdimension: has failures", result.failures.length > 0);
  assertIncludesMatch("mismatched subdimension: failure message names it", result.failures, "belongs to dimension");
}

// ── Test 6: dimension coverage imbalance warns but does not fail ──────────

console.log("\nTest 6: dimension coverage imbalance warns but does not fail");
{
  // 16 AWR items vs 1 each of the other 7 dims = 23 items total, even
  // share ~2.9, AWR (16) is far above 2x, several others are below 0.5x.
  const items = [];
  for (let i = 0; i < 16; i++) {
    items.push(baseItem({ id: `AWR-imbalance-${i}`, dimension: "AWR", prompt: `Unique AWR prompt ${i}, no placeholders.` }));
  }
  for (const d of ["EMP", "ACT", "EQU", "BND", "ACC", "SYS", "INT"]) {
    items.push(baseItem({ id: `${d}-imbalance-1`, dimension: d, prompt: `Unique ${d} prompt, no placeholders.` }));
  }
  const bank = { meta: { schemaVersion: "1.0" }, items };
  const result = validateTaskBank(bank);
  assert("imbalanced bank: zero failures (imbalance is warn-only)", result.failures.length === 0);
  assert("imbalanced bank: has warnings", result.warnings.length > 0);
  assertIncludesMatch("imbalanced bank: warning names AWR imbalance", result.warnings, "\"AWR\" has 16 items");
}

// ── Test 7: supporting edge cases ──────────────────────────────────────────

console.log("\nTest 7: duplicate prompt text across items fails");
{
  const bank = cleanBank();
  bank.items[1] = { ...bank.items[1], prompt: bank.items[0].prompt };
  const result = validateTaskBank(bank);
  assert("duplicate prompt text: has failures", result.failures.length > 0);
  assertIncludesMatch("duplicate prompt text: failure message names it", result.failures, "Duplicate prompt text");
}

console.log("\nTest 7b: empty prompt text fails");
{
  const bank = cleanBank();
  bank.items[0] = baseItem({ id: "AWR-9-A", prompt: "   " });
  const result = validateTaskBank(bank);
  assert("empty prompt text: has failures", result.failures.length > 0);
  assertIncludesMatch("empty prompt text: failure message names it", result.failures, "prompt text is empty");
}

console.log("\nTest 7c: wrong pool / exposureStatus fails");
{
  const bank = cleanBank();
  bank.items[0] = baseItem({ id: "AWR-9-A", pool: "secure-standard", exposureStatus: "unpublished" });
  const result = validateTaskBank(bank);
  assert("wrong pool/exposureStatus: has failures", result.failures.length >= 2);
  assertIncludesMatch("wrong pool: failure message names it", result.failures, 'pool="secure-standard"');
  assertIncludesMatch("wrong exposureStatus: failure message names it", result.failures, 'exposureStatus="unpublished"');
}

console.log("\nTest 7d: empty items array fails");
{
  const result = validateTaskBank({ meta: { schemaVersion: "1.0" }, items: [] });
  assert("empty items array: has failures", result.failures.length > 0);
  assertIncludesMatch("empty items array: failure message names it", result.failures, "Missing or empty top-level 'items' array");
}

// ── Summary ─────────────────────────────────────────────────────────────

console.log(`\n${"─".repeat(70)}`);
console.log(`TOTAL: ${totalPassed} passed, ${totalFailed} failed`);

if (totalFailed > 0) {
  console.error(`\nFAILED — ${totalFailed} test(s) did not pass\n`);
  process.exit(1);
} else {
  console.log(`\nAll ${totalPassed} tests passed\n`);
  process.exit(0);
}
