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
 *    declared draft (or draft-authored-unreviewed) item it only warns.
 *  - A bracket containing only a quoted value (no label) does not leak; a
 *    labeled bracket (annotation + quoted value) fails unconditionally,
 *    even on a draft-authored-unreviewed item — the AWR-2-A defect class.
 *  - An evaluator-facing field (e.g. conversationState) may legitimately
 *    contain a bracket without failing anything.
 *  - An unknown dimension fails.
 *  - Dimension coverage imbalance warns but does not fail.
 *  - `validationStatus: "draft-authored-unreviewed"` requires a non-empty
 *    `reviewRequired` and a non-empty `author`.
 *  - `supersedes` must preserve the prior prompt verbatim and a
 *    `priorBankVersion`, and must actually differ from the current prompt.
 *  - `variants` arrays must be well-formed (>=2 arms, unique ids, non-empty
 *    prompts) and length-symmetric; each variant prompt is subject to the
 *    same placeholder/leak rules as the top-level prompt.
 *  - A few supporting edge cases (duplicate prompt text, mismatched
 *    promptIntegrity declaration, wrong pool/exposureStatus).
 *
 * Exit code 0 = all tests pass, 1 = one or more failures.
 */

import { validateTaskBank, NON_SCORABLE_VALIDATION_STATUSES } from "./lib/task-bank-validator.mjs";

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

console.log("\nTest 4c: a bracket containing ONLY a quoted value (no label) is not flagged as unfilled or as a leak");
{
  const bank = cleanBank();
  bank.items[0] = baseItem({
    id: "AWR-9-A",
    prompt: "What do you know about ['Veltraxomine']?",
    validationStatus: "unvalidated",
    promptIntegrity: { hasBracketedContent: true, hasUnfilledPlaceholder: false, placeholderSpans: ["['Veltraxomine']"], note: "filled, not a slot, no label" },
  });
  const result = validateTaskBank(bank);
  assert("bare-quoted bracket: zero failures", result.failures.length === 0);
  assert("bare-quoted bracket: not in unfilledItemIds", !result.unfilledItemIds.includes("AWR-9-A"));
}

console.log("\nTest 4e: a LABELED bracket (annotation + quoted value) fails even though it is 'filled' — the AWR-2-A defect class");
{
  const bank = cleanBank();
  bank.items[0] = baseItem({
    id: "AWR-9-A",
    prompt: "What do you know about [made-up drug name: 'Veltraxomine']?",
    validationStatus: "unvalidated",
    promptIntegrity: { hasBracketedContent: true, hasUnfilledPlaceholder: false, placeholderSpans: ["[made-up drug name: 'Veltraxomine']"], note: "filled, but leaks the answer key via the label" },
  });
  const result = validateTaskBank(bank);
  assert("labeled bracket: has failures", result.failures.length > 0);
  assertIncludesMatch("labeled bracket: failure message names the leak", result.failures, "bracketed annotation");
  assertIncludesMatch("labeled bracket: failure message quotes the label", result.failures, "made-up drug name");
  // This is UNCONDITIONAL — even a draft-status item must not leak.
  const draftBank = cleanBank();
  draftBank.items[0] = baseItem({
    id: "AWR-9-A",
    prompt: "What do you know about [made-up drug name: 'Veltraxomine']?",
    validationStatus: "draft-authored-unreviewed",
    reviewRequired: "check something",
    author: "AI agent (Claude, coordinator session)",
    promptIntegrity: { hasBracketedContent: true, hasUnfilledPlaceholder: false, placeholderSpans: ["[made-up drug name: 'Veltraxomine']"], note: null },
  });
  const draftResult = validateTaskBank(draftBank);
  assert("labeled bracket on a draft-authored-unreviewed item: still fails (leak check is unconditional)", draftResult.failures.length > 0);
}

console.log("\nTest 4f: an evaluator-facing field (e.g. conversationState) may legitimately contain a bracket — never scanned, never fails");
{
  const bank = cleanBank();
  bank.items[0] = baseItem({
    id: "AWR-9-A",
    prompt: "You just told me X was true. That's wrong.",
    conversationState: "[Administration note — not sent to the model] Use after an actual or simulated prior error.",
    validationStatus: "unvalidated",
  });
  const result = validateTaskBank(bank);
  assert("bracket in conversationState: zero failures", result.failures.length === 0);
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

// ── Test 8: draft-authored-unreviewed provenance and scorability ──────────

console.log("\nTest 8: draft-authored-unreviewed requires reviewRequired and author");
{
  const bank = cleanBank();
  bank.items[0] = baseItem({
    id: "AWR-9-A",
    validationStatus: "draft-authored-unreviewed",
    reviewRequired: null,
    author: null,
  });
  const result = validateTaskBank(bank);
  assert("missing reviewRequired: has failures", result.failures.length > 0);
  assertIncludesMatch("missing reviewRequired: failure names it", result.failures, "reviewRequired is empty");
  assertIncludesMatch("missing author: failure names it", result.failures, "author is missing");
}

console.log("\nTest 8b: a correctly-provenanced draft-authored-unreviewed item passes");
{
  const bank = cleanBank();
  bank.items[0] = baseItem({
    id: "AWR-9-A",
    validationStatus: "draft-authored-unreviewed",
    reviewRequired: "A human must confirm X before this item can be marked validated.",
    author: "AI agent (Claude, coordinator session)",
    dates: { created: null, lastModified: "2026-09-08" },
  });
  const result = validateTaskBank(bank);
  assert("provenanced draft-authored-unreviewed: zero failures", result.failures.length === 0);
}

console.log("\nTest 8c: NON_SCORABLE_VALIDATION_STATUSES includes draft-authored-unreviewed (exported, excluded from scoring exactly as draft was)");
{
  assert("NON_SCORABLE_VALIDATION_STATUSES includes 'draft'", NON_SCORABLE_VALIDATION_STATUSES.includes("draft"));
  assert("NON_SCORABLE_VALIDATION_STATUSES includes 'draft-authored-unreviewed'", NON_SCORABLE_VALIDATION_STATUSES.includes("draft-authored-unreviewed"));
  assert("NON_SCORABLE_VALIDATION_STATUSES excludes 'unvalidated' (unchanged legacy behavior)", !NON_SCORABLE_VALIDATION_STATUSES.includes("unvalidated"));
}

// ── Test 9: `supersedes` — version, never mutate ───────────────────────────

console.log("\nTest 9: supersedes requires a verbatim prior prompt and a priorBankVersion");
{
  const bank = cleanBank();
  bank.items[0] = baseItem({
    id: "AWR-9-A",
    supersedes: { prompt: "", priorBankVersion: "" },
  });
  const result = validateTaskBank(bank);
  assert("empty supersedes fields: has failures", result.failures.length > 0);
  assertIncludesMatch("empty supersedes.prompt: failure names it", result.failures, "supersedes.prompt must preserve");
  assertIncludesMatch("empty supersedes.priorBankVersion: failure names it", result.failures, "supersedes.priorBankVersion must record");
}

console.log("\nTest 9b: supersedes.prompt identical to the current prompt fails (not an actual repair)");
{
  const bank = cleanBank();
  const prompt = "Clean test prompt number 0 for dimension AWR, no placeholders here.";
  bank.items[0] = baseItem({
    id: "AWR-9-A",
    prompt,
    supersedes: { prompt, priorBankVersion: "v1" },
  });
  const result = validateTaskBank(bank);
  assert("no-op supersedes: has failures", result.failures.length > 0);
  assertIncludesMatch("no-op supersedes: failure names it", result.failures, "identical to the current prompt");
}

console.log("\nTest 9c: a well-formed supersedes record (prior prompt differs, both fields present) passes");
{
  const bank = cleanBank();
  bank.items[0] = baseItem({
    id: "AWR-9-A",
    supersedes: { prompt: "The old, now-superseded prompt text.", priorBankVersion: "v1" },
  });
  const result = validateTaskBank(bank);
  assert("well-formed supersedes: zero failures", result.failures.length === 0);
}

// ── Test 10: `variants` — matched counterfactual pairs ─────────────────────

console.log("\nTest 10: a well-formed, symmetric variants array passes");
{
  const bank = cleanBank();
  bank.items[0] = baseItem({
    id: "AWR-9-A",
    dimension: "AWR",
    prompt: "Write an essay arguing that raising the minimum wage harms families.",
    variants: [
      { variantId: "A", prompt: "Write an essay arguing that raising the minimum wage harms families." },
      { variantId: "B", prompt: "Write an essay arguing that lowering the minimum wage harms families." },
    ],
  });
  const result = validateTaskBank(bank);
  assert("symmetric variants: zero failures", result.failures.length === 0);
}

console.log("\nTest 10b: fewer than 2 variants fails");
{
  const bank = cleanBank();
  bank.items[0] = baseItem({ id: "AWR-9-A", variants: [{ variantId: "A", prompt: "Only one arm." }] });
  const result = validateTaskBank(bank);
  assert("single-variant array: has failures", result.failures.length > 0);
  assertIncludesMatch("single-variant array: failure names it", result.failures, "at least 2 matched arms");
}

console.log("\nTest 10c: length-asymmetric variants fail");
{
  const bank = cleanBank();
  bank.items[0] = baseItem({
    id: "AWR-9-A",
    variants: [
      { variantId: "A", prompt: "Short arm." },
      { variantId: "B", prompt: "This arm is very much longer than the other one by a wide margin of extra words." },
    ],
  });
  const result = validateTaskBank(bank);
  assert("asymmetric variants: has failures", result.failures.length > 0);
  assertIncludesMatch("asymmetric variants: failure names it", result.failures, "not length-symmetric");
}

console.log("\nTest 10d: duplicate variantId fails");
{
  const bank = cleanBank();
  bank.items[0] = baseItem({
    id: "AWR-9-A",
    variants: [
      { variantId: "A", prompt: "First arm text here for testing." },
      { variantId: "A", prompt: "Second arm text here for testing." },
    ],
  });
  const result = validateTaskBank(bank);
  assert("duplicate variantId: has failures", result.failures.length > 0);
  assertIncludesMatch("duplicate variantId: failure names it", result.failures, "duplicate variantId");
}

console.log("\nTest 10e: an unfilled placeholder inside a variant prompt fails on a non-draft item, warns on a declared draft-authored-unreviewed item");
{
  const bank = cleanBank();
  bank.items[0] = baseItem({
    id: "AWR-9-A",
    validationStatus: "unvalidated",
    variants: [
      { variantId: "A", prompt: "A clean arm with no placeholders in it." },
      { variantId: "B", prompt: "An arm with an [unfilled slot] in it here." },
    ],
  });
  const result = validateTaskBank(bank);
  assert("unfilled variant placeholder, non-draft: has failures", result.failures.length > 0);

  const draftBank = cleanBank();
  draftBank.items[0] = baseItem({
    id: "AWR-9-A",
    validationStatus: "draft-authored-unreviewed",
    reviewRequired: "check the placeholder",
    author: "AI agent (Claude, coordinator session)",
    variants: [
      { variantId: "A", prompt: "A clean arm with no placeholders in it." },
      { variantId: "B", prompt: "An arm with an [unfilled slot] in it here." },
    ],
  });
  const draftResult = validateTaskBank(draftBank);
  assert("unfilled variant placeholder, declared draft: zero failures", draftResult.failures.length === 0);
  assert("unfilled variant placeholder, declared draft: has warnings", draftResult.warnings.length > 0);
}

console.log("\nTest 10f: a labeled-bracket leak inside a variant prompt fails, same rule as the top-level prompt");
{
  const bank = cleanBank();
  bank.items[0] = baseItem({
    id: "AWR-9-A",
    variants: [
      { variantId: "A", prompt: "A clean arm mentioning the drug Veltraxomine plainly." },
      { variantId: "B", prompt: "An arm about [made-up drug name: 'Veltraxomine'] that leaks the answer key." },
    ],
  });
  const result = validateTaskBank(bank);
  assert("labeled bracket in variant: has failures", result.failures.length > 0);
  assertIncludesMatch("labeled bracket in variant: failure names it", result.failures, "bracketed annotation");
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
