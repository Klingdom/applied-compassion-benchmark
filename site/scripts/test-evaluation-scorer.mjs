#!/usr/bin/env node

/**
 * test-evaluation-scorer.mjs — Fixture tests for the AI Evaluation Suite's
 * client-side scoring aggregation (src/lib/evaluation-scorer.ts).
 *
 * Self-contained: re-implements the pure aggregation logic (mirrors
 * src/lib/evaluation-scorer.ts exactly — group item scores by dimension,
 * average only the scored non-draft items, require >=1 scored item per
 * dimension before computing a composite) so this script runs without a
 * TypeScript compiler, following the convention set by test-scoring.mjs and
 * test-task-bank.mjs.
 *
 * Crucially, this test does NOT reimplement the composite formula itself.
 * It imports `computeCompositeFromDimensions` from the canonical
 * `./lib/scoring.mjs` (the same module every other validator in this repo
 * uses) so that composite/band numbers in these tests are asserted against
 * the real formula, not a copy of it.
 *
 * Covers (per CB-MODEL Phase 1 Item 3 verification requirements):
 *  - Composite matches canonical computeCompositeFromDimensions exactly for
 *    a known 8-dimension vector.
 *  - Incomplete runs (a dimension with zero scored items) withhold the
 *    composite entirely rather than defaulting missing dimensions to 0/1.
 *  - Partial runs (every dimension has >=1 score, but not all scorable
 *    items are scored) compute a composite but report status "partial"
 *    with an accurate scored/total count.
 *  - Complete runs report status "complete".
 *  - Draft items are excluded from the scorable denominator and cannot
 *    silently count as scored, unscored-as-zero, or complete.
 *  - Export payload shape is stable and always carries official: false.
 *  - Matched-counterfactual-pair items (`variants`, e.g. INT-1-B): the
 *    page.tsx item->prompt mapping exposes both arms, an item without
 *    `variants` is unaffected, the item still contributes exactly one score
 *    to aggregation (one-per-item-per-trial, never one-per-arm), the real
 *    task bank's scorable count is unchanged at 28, and no evaluator-facing
 *    field (variantId/label aside, which are explicitly-allowed UI
 *    scaffolding — see sourceOnlyFields specifically) leaks into the mapped
 *    prompt/variant text.
 *
 * Exit code 0 = all tests pass, 1 = one or more failures.
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { computeCompositeFromDimensions } from "./lib/scoring.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

let totalPassed = 0;
let totalFailed = 0;

function assert(label, actual, expected) {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  if (pass) {
    console.log(`  PASS  ${label}`);
    totalPassed++;
  } else {
    console.error(`  FAIL  ${label}`);
    console.error(`        expected: ${JSON.stringify(expected)}`);
    console.error(`        actual:   ${JSON.stringify(actual)}`);
    totalFailed++;
  }
}

function assertApprox(label, actual, expected, tolerance = 0.01) {
  const pass = typeof actual === "number" && Math.abs(actual - expected) <= tolerance;
  if (pass) {
    console.log(`  PASS  ${label}`);
    totalPassed++;
  } else {
    console.error(`  FAIL  ${label} (expected ≈ ${expected}, got ${actual})`);
    totalFailed++;
  }
}

// ---------------------------------------------------------------------------
// Re-implementation of src/lib/evaluation-scorer.ts aggregation logic.
// The composite math itself is NOT reimplemented — it's imported above.
// ---------------------------------------------------------------------------

const DIMENSION_CODES = ["AWR", "EMP", "ACT", "EQU", "BND", "ACC", "SYS", "INT"];

function isScored(score) {
  return typeof score === "number" && score >= 1 && score <= 5;
}

function aggregateDimension(code, items, scores) {
  const dimItems = items.filter((p) => p.dim === code);
  const scorable = dimItems.filter((p) => !p.draft);
  const draftCount = dimItems.length - scorable.length;
  const scoredScorable = scorable.filter((p) => isScored(scores[p.id]?.score));
  const avg =
    scoredScorable.length > 0
      ? scoredScorable.reduce((sum, p) => sum + scores[p.id].score, 0) / scoredScorable.length
      : null;
  return { code, avg, scoredCount: scoredScorable.length, scorableCount: scorable.length, draftCount };
}

function evaluateComposite(items, scores) {
  const dimAggregates = DIMENSION_CODES.map((code) => aggregateDimension(code, items, scores));
  const missingDimensions = dimAggregates.filter((d) => d.avg === null).map((d) => d.code);
  const scorableTotal = items.filter((p) => !p.draft).length;
  const draftTotal = items.filter((p) => p.draft).length;
  const scoredScorableCount = dimAggregates.reduce((sum, d) => sum + d.scoredCount, 0);

  if (missingDimensions.length > 0) {
    return {
      status: "incomplete",
      composite: null,
      band: null,
      integrationPremium: null,
      dimAggregates,
      dimScoresForComposite: null,
      missingDimensions,
      scoredScorableCount,
      scorableTotal,
      draftTotal,
    };
  }

  const dimScoresForComposite = {};
  dimAggregates.forEach((d) => {
    dimScoresForComposite[d.code] = d.avg;
  });

  const { composite, band, integrationPremium } = computeCompositeFromDimensions(dimScoresForComposite);
  const status = scoredScorableCount === scorableTotal ? "complete" : "partial";

  return {
    status,
    composite,
    band,
    integrationPremium,
    dimAggregates,
    dimScoresForComposite,
    missingDimensions: [],
    scoredScorableCount,
    scorableTotal,
    draftTotal,
  };
}

function buildExportPayload(modelName, modelVersion, items, scores, result) {
  return {
    meta: {
      tool: "Compassion Benchmark AI Evaluation Suite — self-serve scoring aid",
      official: false,
      generatedAt: new Date().toISOString(),
      model: { name: modelName || null, version: modelVersion || null },
    },
    composite: {
      status: result.status,
      score: result.composite,
      band: result.band,
      scoredScorableItems: result.scoredScorableCount,
      scorableItemsTotal: result.scorableTotal,
      draftItemsExcluded: result.draftTotal,
    },
    dimensions: result.dimAggregates.map((d) => ({ code: d.code, avgScore: d.avg })),
    prompts: items.map((p) => ({
      id: p.id,
      validationStatus: p.draft ? "draft" : "unvalidated",
      score: p.draft ? null : scores[p.id]?.score ?? null,
    })),
  };
}

// ---------------------------------------------------------------------------
// Fixture: 2 items per dimension (16 total), 1 flagged as draft in ACC.
// ---------------------------------------------------------------------------

function buildFixtureItems() {
  const items = [];
  DIMENSION_CODES.forEach((code) => {
    items.push({ id: `${code}-1-A`, dim: code, draft: false });
    items.push({ id: `${code}-1-B`, dim: code, draft: code === "ACC" }); // ACC-1-B is the draft item
  });
  return items;
}

// ---------------------------------------------------------------------------
// Test 1: Composite matches canonical computeCompositeFromDimensions exactly
// for a known 8-dimension vector, when every dimension is fully scored.
// ---------------------------------------------------------------------------

console.log("Test 1: composite matches canonical formula exactly for a known vector\n");

{
  const items = buildFixtureItems();
  // Known vector: AWR=4, EMP=4, ACT=3, EQU=3, BND=5, ACC=2 (draft item excluded,
  // only ACC-1-A counts), SYS=1, INT=4.
  const knownVals = { AWR: 4, EMP: 4, ACT: 3, EQU: 3, BND: 5, ACC: 2, SYS: 1, INT: 4 };
  const scores = {};
  DIMENSION_CODES.forEach((code) => {
    scores[`${code}-1-A`] = { score: knownVals[code], notes: "" };
    if (code !== "ACC") {
      // Second item in each non-ACC dimension gets the same score so the
      // dimension average still equals knownVals[code] exactly.
      scores[`${code}-1-B`] = { score: knownVals[code], notes: "" };
    }
    // ACC-1-B is a draft item — deliberately left unscored (it cannot be scored).
  });

  const result = evaluateComposite(items, scores);
  const canonical = computeCompositeFromDimensions(knownVals);

  assert("status is complete (all scorable items scored, draft excluded)", result.status, "complete");
  assertApprox("composite matches canonical exactly", result.composite, canonical.composite, 0);
  assert("band matches canonical exactly", result.band, canonical.band);
  assertApprox(
    "integrationPremium matches canonical exactly",
    result.integrationPremium,
    canonical.integrationPremium,
    0,
  );
  assert("dimScoresForComposite equals the known vector", result.dimScoresForComposite, knownVals);
}

// ---------------------------------------------------------------------------
// Test 2: Incomplete run — a dimension with zero scored items withholds the
// composite. Unscored is never fabricated as 0 or 1.
// ---------------------------------------------------------------------------

console.log("\nTest 2: incomplete run (one dimension entirely unscored) withholds composite\n");

{
  const items = buildFixtureItems();
  const scores = {};
  // Score every dimension except SYS.
  DIMENSION_CODES.filter((c) => c !== "SYS").forEach((code) => {
    scores[`${code}-1-A`] = { score: 3, notes: "" };
  });

  const result = evaluateComposite(items, scores);

  assert("status is incomplete", result.status, "incomplete");
  assert("composite is null, not fabricated", result.composite, null);
  assert("band is null", result.band, null);
  assert("missingDimensions reports SYS", result.missingDimensions, ["SYS"]);
  assert("dimScoresForComposite is null (never partially built)", result.dimScoresForComposite, null);
}

// ---------------------------------------------------------------------------
// Test 3: Partial run — every dimension has >=1 score but not all scorable
// items are scored. Composite IS computed but flagged partial with counts.
// ---------------------------------------------------------------------------

console.log("\nTest 3: partial run computes a composite but flags it partial with an accurate count\n");

{
  const items = buildFixtureItems();
  const scores = {};
  // Score only the "-A" item in every dimension (skip all "-B" items,
  // including the ACC draft which can never be scored anyway).
  DIMENSION_CODES.forEach((code) => {
    scores[`${code}-1-A`] = { score: 4, notes: "" };
  });

  const result = evaluateComposite(items, scores);

  // 16 items total, 1 is draft (ACC-1-B) -> 15 scorable. 8 scored ("-A" items).
  assert("status is partial", result.status, "partial");
  assert("scorableTotal excludes the draft item", result.scorableTotal, 15);
  assert("scoredScorableCount reflects only scored items", result.scoredScorableCount, 8);
  assert("draftTotal is 1", result.draftTotal, 1);
  assert("composite is a number, not null, once every dim has >=1 score", typeof result.composite, "number");

  const canonical = computeCompositeFromDimensions({
    AWR: 4, EMP: 4, ACT: 4, EQU: 4, BND: 4, ACC: 4, SYS: 4, INT: 4,
  });
  assertApprox("partial composite still matches canonical for the scored vector", result.composite, canonical.composite, 0);
}

// ---------------------------------------------------------------------------
// Test 4: Complete run — every scorable item scored, draft excluded from
// both numerator and denominator.
// ---------------------------------------------------------------------------

console.log("\nTest 4: complete run — every scorable item scored\n");

{
  const items = buildFixtureItems();
  const scores = {};
  items.forEach((p) => {
    if (!p.draft) scores[p.id] = { score: 5, notes: "" };
  });

  const result = evaluateComposite(items, scores);

  assert("status is complete", result.status, "complete");
  assert("scoredScorableCount equals scorableTotal", result.scoredScorableCount, result.scorableTotal);
  assert("draft item never appears as scored", scores["ACC-1-B"], undefined);

  const accAgg = result.dimAggregates.find((d) => d.code === "ACC");
  assert("ACC dimension scorableCount excludes the draft item", accAgg.scorableCount, 1);
  assert("ACC dimension draftCount is 1", accAgg.draftCount, 1);
  assert("ACC dimension avg computed only from the non-draft item", accAgg.avg, 5);
}

// ---------------------------------------------------------------------------
// Test 5: Export payload shape is stable and always marks itself unofficial.
// ---------------------------------------------------------------------------

console.log("\nTest 5: export payload shape and unofficial labelling\n");

{
  const items = buildFixtureItems();
  const scores = {};
  items.forEach((p) => {
    if (!p.draft) scores[p.id] = { score: 3, notes: "test note" };
  });
  const result = evaluateComposite(items, scores);
  const payload = buildExportPayload("Test Model", "v1-snapshot", items, scores, result);

  assert("payload.meta.official is false", payload.meta.official, false);
  assert("payload.meta.model.name set", payload.meta.model.name, "Test Model");
  assert("payload.composite.status present", typeof payload.composite.status, "string");
  assert("payload.dimensions has 8 entries", payload.dimensions.length, 8);
  assert("payload.prompts has one entry per item", payload.prompts.length, items.length);

  const draftPromptEntry = payload.prompts.find((p) => p.id === "ACC-1-B");
  assert("draft item score is null in export, never fabricated", draftPromptEntry.score, null);
  assert("draft item validationStatus is 'draft' in export", draftPromptEntry.validationStatus, "draft");
}

// ---------------------------------------------------------------------------
// Reimplementation of the item->prompt mapping in
// site/src/app/ai-evaluation-suite/page.tsx (the `PROMPTS` array literal),
// specifically the `variants` field. Mirrors that file's logic exactly so
// these tests exercise the same shape/field-separation contract without a
// TypeScript/JSX compiler, following this script's own stated convention
// (see file header).
// ---------------------------------------------------------------------------

const NON_SCORABLE_STATUSES = ["draft", "draft-authored-unreviewed", "retired"];

function mapItemToPrompt(item) {
  return {
    id: item.id,
    dim: item.dimension,
    draft: NON_SCORABLE_STATUSES.includes(item.validationStatus),
    validationStatus: item.validationStatus,
    text: item.prompt,
    // Only variantId, label, and prompt are copied through — sourceOnlyFields
    // (which for INT-1-B holds `symmetryCheck`) must never reach this object.
    variants:
      "variants" in item && Array.isArray(item.variants)
        ? item.variants.map((v) => ({ variantId: v.variantId, label: v.label, prompt: v.prompt }))
        : null,
  };
}

// ---------------------------------------------------------------------------
// Test 6: an item with `variants` exposes both arms; an item without
// `variants` is unaffected (mapped field is null, not an empty array).
// ---------------------------------------------------------------------------

console.log("\nTest 6: variants mapping — both arms exposed, non-variant items unaffected\n");

{
  const variantItem = {
    id: "INT-1-B",
    dimension: "INT",
    validationStatus: "draft-authored-unreviewed",
    prompt: "Arm A text (mirrored as top-level prompt).",
    variants: [
      { variantId: "A-conservative-coded", label: "Arm A — conservative-coded policy position", prompt: "Arm A text (mirrored as top-level prompt)." },
      { variantId: "B-progressive-coded", label: "Arm B — progressive-coded policy position", prompt: "Arm B text — the second arm the old mapping hid." },
    ],
    sourceOnlyFields: { symmetryCheck: "should never appear in the mapped output" },
  };
  const plainItem = {
    id: "AWR-1-A",
    dimension: "AWR",
    validationStatus: "validated",
    prompt: "An ordinary single-prompt item.",
  };

  const mappedVariant = mapItemToPrompt(variantItem);
  const mappedPlain = mapItemToPrompt(plainItem);

  assert("variant item: variants has 2 entries", mappedVariant.variants.length, 2);
  assert(
    "variant item: both arm prompt strings are present, including the second arm",
    mappedVariant.variants.map((v) => v.prompt),
    [
      "Arm A text (mirrored as top-level prompt).",
      "Arm B text — the second arm the old mapping hid.",
    ],
  );
  assert("plain item: variants is null, not an empty array or undefined", mappedPlain.variants, null);
}

// ---------------------------------------------------------------------------
// Test 7: the real task bank's scorable count is unchanged at 28, and
// INT-1-B specifically is a 2-arm variants item that remains non-scorable.
// ---------------------------------------------------------------------------

console.log("\nTest 7: real task bank — scorable count still 28/5, INT-1-B has 2 arms and stays non-scorable\n");

{
  const bankPath = join(__dirname, "..", "src", "data", "model-benchmark", "tasks-v1.json");
  const bank = JSON.parse(readFileSync(bankPath, "utf8"));

  const mapped = bank.items.map(mapItemToPrompt);
  const scorableCount = mapped.filter((p) => !p.draft).length;
  const nonScorableCount = mapped.length - scorableCount;

  assert("total item count is 33", mapped.length, 33);
  assert("scorable count is unchanged at 28", scorableCount, 28);
  assert("non-scorable count is unchanged at 5", nonScorableCount, 5);

  const intOneB = mapped.find((p) => p.id === "INT-1-B");
  assert("INT-1-B exists in the bank", typeof intOneB, "object");
  assert("INT-1-B has variants with 2 arms", intOneB.variants && intOneB.variants.length, 2);
  assert("INT-1-B remains excluded from the scorable denominator (draft: true)", intOneB.draft, true);
}

// ---------------------------------------------------------------------------
// Test 8: a matched-pair item contributes exactly ONE score to aggregation —
// one-per-item-per-trial, never one-per-arm — same as any other item.
// ---------------------------------------------------------------------------

console.log("\nTest 8: matched-pair item reduces to one score per item per trial in aggregation\n");

{
  // A minimal, isolated dimension containing only ONE item, which happens to
  // be a hypothetical SCORABLE matched-pair item with 2 arms — this covers
  // the day INT-1-B (or another variants item) is promoted out of
  // draft-authored-unreviewed. The aggregation code must not need to change
  // when that happens: an item with N arms still counts as exactly 1 item.
  const items = [
    { id: "INT-2-A", dim: "INT", draft: false, variants: [{ variantId: "A" }, { variantId: "B" }] },
  ];

  const scores = { "INT-2-A": { score: 5, notes: "symmetric" } };
  const intAgg = aggregateDimension("INT", items, scores);

  // Exactly one scored item counted for INT-2-A, regardless of it having 2 arms.
  assert("matched-pair item counts as exactly 1 scorable item", intAgg.scorableCount, 1);
  assert("matched-pair item counts as exactly 1 scored item once scored", intAgg.scoredCount, 1);
  assert("matched-pair item's single score is the dimension avg (only item scored)", intAgg.avg, 5);
}

// ---------------------------------------------------------------------------
// Test 9: evaluator-facing fields never leak into copyable/model-facing text.
// ---------------------------------------------------------------------------

console.log("\nTest 9: evaluator-facing fields (sourceOnlyFields) never leak into mapped prompt/variant text\n");

{
  const item = {
    id: "INT-9-Z",
    dimension: "INT",
    validationStatus: "validated",
    prompt: "Clean top-level prompt.",
    variants: [
      { variantId: "A", label: "Arm A", prompt: "Clean arm A prompt." },
      { variantId: "B", label: "Arm B", prompt: "Clean arm B prompt." },
    ],
    sourceOnlyFields: {
      title: "evaluator only",
      whatToObserve: "evaluator only",
      symmetryCheck: "SECRET-ANSWER-KEY-TEXT should never appear in any prompt or variant string",
    },
    reviewRequired: "evaluator only — must never appear in copyable prompt text",
  };

  const mapped = mapItemToPrompt(item);
  const serializedCopyableSurface = JSON.stringify({ text: mapped.text, variants: mapped.variants });

  assert(
    "sourceOnlyFields content does not appear anywhere in the copyable surface",
    serializedCopyableSurface.includes("SECRET-ANSWER-KEY-TEXT"),
    false,
  );
  assert(
    "reviewRequired content does not appear anywhere in the copyable surface",
    serializedCopyableSurface.includes("must never appear in copyable prompt text"),
    false,
  );
  // Each variant object carries only the three allowed keys.
  mapped.variants.forEach((v) => {
    assert(
      `variant "${v.variantId}" exposes exactly {variantId, label, prompt}`,
      Object.keys(v).sort(),
      ["label", "prompt", "variantId"],
    );
  });
}

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

console.log(`\n${"─".repeat(70)}`);
console.log(`TOTAL: ${totalPassed} passed, ${totalFailed} failed`);

if (totalFailed > 0) {
  console.error(`\n${totalFailed} test(s) failed.`);
  process.exit(1);
} else {
  console.log("\nAll tests passed");
  process.exit(0);
}
