#!/usr/bin/env node
/**
 * test-method-claims.mjs — Mechanical gate against DC-02 recurrence
 * ("published method copy contradicts the canonical formula").
 *
 * This does NOT string-match prose. It recomputes the actual formula
 * (computeCompositeFromDimensions in lib/scoring.mjs) and checks it against
 * the same numeric constants the UI renders:
 *   - src/components/charts/consistencyStepsData.ts (STEPS, MAX_ACHIEVABLE_STD_DEV)
 *   - src/components/charts/integrationPremiumExamples.ts (EXAMPLES)
 *
 * Both of those modules are imported directly by ConsistencyStepChart.tsx and
 * IntegrationPremiumDiagram.tsx, so a change to the chart data is
 * automatically exercised here too — there is no separate copy to drift.
 *
 * The methodology page's prose (src/app/methodology/page.tsx) and the Abridge
 * worked example (ABRIDGE_DIM_DATA in that same file) are NOT importable here
 * without a JSX-aware loader, since the file also contains component markup.
 * Those numeric claims are re-declared as fixtures below with a comment
 * pointing at the source of truth in page.tsx — if either changes, update
 * both. This mirrors the existing convention in test-scoring.mjs.
 *
 * Checks:
 *  1. Reachable integration-premium set for 8 dimensions bounded [0, 5] is
 *     exactly {0, 1.5, 2, 3, 4, 4.5, 6, 8, 10} (grid + random search against
 *     computeCompositeFromDimensions).
 *  2. Every EXAMPLES.premium value (IntegrationPremiumDiagram) is a member of
 *     that reachable set, AND its base/premium/composite fields exactly match
 *     a recompute of EXAMPLES.profile.
 *  3. Maximum achievable σ across 8 dimensions bounded [0, 5] is 2.5, matching
 *     MAX_ACHIEVABLE_STD_DEV (ConsistencyStepChart / consistencyStepsData.ts).
 *  4. Every STEPS entry (ConsistencyStepChart) is marked reachable if and only
 *     if its lowerBound does not exceed MAX_ACHIEVABLE_STD_DEV.
 *  5. The Abridge worked example and the methodology page's balanced/spiky
 *     illustrative pairs recompute to the exact σ/premium/base/composite
 *     values published in src/app/methodology/page.tsx.
 *
 * Negative control (documented in HANDOFF, not run automatically): reintroduce
 * `premium: 0.5` in integrationPremiumExamples.ts, or flip a STEPS.reachable
 * flag to disagree with its lowerBound, and this script fails naming the
 * offending value. Revert and it passes again.
 *
 * Run: node site/scripts/test-method-claims.mjs
 */

import { computeCompositeFromDimensions, DIMENSION_CODES } from "./lib/scoring.mjs";
import { STEPS, MAX_ACHIEVABLE_STD_DEV } from "../src/components/charts/consistencyStepsData.ts";
import { EXAMPLES } from "../src/components/charts/integrationPremiumExamples.ts";

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
  } else {
    failed++;
    console.log(`  FAIL: ${message}`);
  }
}

// ─── Shared helpers ─────────────────────────────────────────────────────────

/** Population standard deviation, matching computeCompositeFromDimensions internals. */
function stdDevOf(vals) {
  const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
  const variance = vals.reduce((a, b) => a + (b - mean) ** 2, 0) / vals.length;
  return Math.sqrt(variance);
}

/** Recompute {stdDev, base, premium, composite} for an 8-value dimension profile. */
function recompute(profile) {
  if (profile.length !== DIMENSION_CODES.length) {
    throw new Error(`profile must have ${DIMENSION_CODES.length} values, got ${profile.length}`);
  }
  const dimScores = {};
  DIMENSION_CODES.forEach((c, i) => (dimScores[c] = profile[i]));
  const stdDev = stdDevOf(profile);
  const mean = profile.reduce((a, b) => a + b, 0) / profile.length;
  const base = Math.round((((mean - 1) / 4) * 100) * 10) / 10;
  const { composite, integrationPremium } = computeCompositeFromDimensions(dimScores);
  return { stdDev, base, premium: Math.round(integrationPremium * 100) / 100, composite };
}

function closeTo(a, b, eps = 0.05) {
  return Math.abs(a - b) <= eps;
}

// ─── Case 1/3: brute-force the reachable premium set and max σ ────────────

console.log("\nCase 1/3: reachable premium set and max achievable σ (grid + random search)");
{
  const EXPECTED_PREMIUM_SET = [0, 1.5, 2, 3, 4, 4.5, 6, 8, 10];

  let maxStdDev = 0;
  const premiumsSeen = new Set();

  function probe(vals) {
    const std = stdDevOf(vals);
    if (std > maxStdDev) maxStdDev = std;
    const dimScores = {};
    DIMENSION_CODES.forEach((c, i) => (dimScores[c] = vals[i]));
    const { integrationPremium } = computeCompositeFromDimensions(dimScores);
    premiumsSeen.add(Math.round(integrationPremium * 100) / 100);
  }

  // Exhaustive-ish grid: for each count of "weak" dims (k = 0..8), sweep a
  // strong value (4.0..5.0) and a weak value (0..3.9) — this is exactly how
  // the extremes that maximize/vary σ for a fixed weak-dim count arise.
  for (let k = 0; k <= 8; k++) {
    for (let strongVal = 4.0; strongVal <= 5.0001; strongVal += 0.05) {
      for (let weakVal = 0; weakVal <= 3.9; weakVal += 0.05) {
        const vals = Array(8).fill(strongVal);
        for (let i = 0; i < k; i++) vals[i] = weakVal;
        probe(vals);
      }
    }
  }

  // Random search as a sanity augmentation (catches anything the grid missed).
  for (let i = 0; i < 50000; i++) {
    probe(Array.from({ length: 8 }, () => Math.random() * 5));
  }

  const foundSet = [...premiumsSeen].sort((a, b) => a - b);
  const expectedSorted = [...EXPECTED_PREMIUM_SET].sort((a, b) => a - b);

  assert(
    JSON.stringify(foundSet) === JSON.stringify(expectedSorted),
    `reachable premium set mismatch: expected ${JSON.stringify(expectedSorted)}, found ${JSON.stringify(foundSet)}`
  );

  assert(
    closeTo(maxStdDev, 2.5, 0.001),
    `max achievable σ should be 2.5, found ${maxStdDev.toFixed(4)}`
  );

  assert(
    closeTo(MAX_ACHIEVABLE_STD_DEV, 2.5, 1e-9),
    `MAX_ACHIEVABLE_STD_DEV (consistencyStepsData.ts) is ${MAX_ACHIEVABLE_STD_DEV}, expected 2.5`
  );

  // Expose the set for case 2 below without recomputing.
  globalThis.__reachablePremiumSet = premiumsSeen;
}

// ─── Case 2: IntegrationPremiumDiagram EXAMPLES must be reachable + accurate ─

console.log("Case 2: IntegrationPremiumDiagram EXAMPLES are reachable and arithmetically correct");
{
  const reachable = globalThis.__reachablePremiumSet;
  for (const ex of EXAMPLES) {
    const isReachable = [...reachable].some((p) => closeTo(p, ex.premium, 1e-6));
    assert(
      isReachable,
      `EXAMPLES "${ex.label}" declares premium ${ex.premium}, which is not in the reachable set — impossible value published`
    );

    const r = recompute(ex.profile);
    assert(
      closeTo(r.base, ex.base, 0.05),
      `EXAMPLES "${ex.label}" declares base ${ex.base}, recompute of profile gives ${r.base}`
    );
    assert(
      closeTo(r.premium, ex.premium, 0.05),
      `EXAMPLES "${ex.label}" declares premium ${ex.premium}, recompute of profile gives ${r.premium}`
    );
    assert(
      closeTo(r.composite, ex.composite, 0.05),
      `EXAMPLES "${ex.label}" declares composite ${ex.composite}, recompute of profile gives ${r.composite}`
    );
    assert(
      closeTo(ex.base + ex.premium, ex.composite, 0.05),
      `EXAMPLES "${ex.label}" arithmetic inconsistent: base ${ex.base} + premium ${ex.premium} !== composite ${ex.composite}`
    );
  }
}

// ─── Case 4: ConsistencyStepChart STEPS reachability flags must be correct ──

console.log("Case 4: ConsistencyStepChart STEPS reachability flags match σ ≤ 2.5");
{
  for (const step of STEPS) {
    const expectedReachable = step.lowerBound <= MAX_ACHIEVABLE_STD_DEV + 1e-9;
    assert(
      step.reachable === expectedReachable,
      `STEPS "${step.label}" (lowerBound ${step.lowerBound}) has reachable=${step.reachable}, expected ${expectedReachable} given MAX_ACHIEVABLE_STD_DEV=${MAX_ACHIEVABLE_STD_DEV}`
    );
  }
}

// ─── Case 5: worked examples published in methodology/page.tsx ────────────

console.log("Case 5: worked-example vectors from methodology/page.tsx recompute correctly");
{
  // Mirrors ABRIDGE_DIM_DATA[].avg in src/app/methodology/page.tsx (line ~39).
  // Update both if either changes.
  const ABRIDGE_VECTOR = [3.5, 3.5, 3.5, 3.0, 3.5, 3.5, 3.5, 3.5];
  const abridge = recompute(ABRIDGE_VECTOR);
  assert(
    closeTo(abridge.stdDev, 0.1654, 0.001),
    `Abridge vector σ should be ≈0.1654 (page states "0.17"), recompute gives ${abridge.stdDev.toFixed(4)}`
  );
  assert(
    Math.round(abridge.stdDev * 100) / 100 === 0.17,
    `Abridge vector σ rounded to 2dp should display as "0.17", got ${(Math.round(abridge.stdDev * 100) / 100).toFixed(2)}`
  );
  assert(abridge.premium === 0, `Abridge premium should be 0.0, recompute gives ${abridge.premium}`);
  assert(closeTo(abridge.base, 60.9, 0.05), `Abridge base composite should be 60.9, recompute gives ${abridge.base}`);
  assert(closeTo(abridge.composite, 60.9, 0.05), `Abridge composite should be 60.9, recompute gives ${abridge.composite}`);

  // Mirrors the two balanced/spiky illustrative pairs in the v1.2 changelog
  // prose in src/app/methodology/page.tsx (line ~1294).
  const pairs = [
    { label: "8 dims at 4.0", vector: [4, 4, 4, 4, 4, 4, 4, 4], composite: 85 },
    { label: "4 dims at 5.0 + 4 dims at 3.0", vector: [5, 5, 5, 5, 3, 3, 3, 3], composite: 77 },
    { label: "8 dims at 3.8", vector: [3.8, 3.8, 3.8, 3.8, 3.8, 3.8, 3.8, 3.8], composite: 70 },
    { label: "4 dims at 5.0 + 4 dims at 2.6", vector: [5, 5, 5, 5, 2.6, 2.6, 2.6, 2.6], composite: 72 },
  ];
  for (const p of pairs) {
    const r = recompute(p.vector);
    assert(
      closeTo(r.composite, p.composite, 0.05),
      `methodology page pair "${p.label}" states composite ${p.composite}, recompute gives ${r.composite}`
    );
  }

  // The page claims the balanced-at-4.0 profile (85) beats the 5/3 spiky
  // profile (77), AND that a spiky profile (72) can beat a balanced-below-4.0
  // profile (70). Assert both directions hold, not just the individual values.
  const balancedAt4 = recompute(pairs[0].vector).composite;
  const spikyFiveThree = recompute(pairs[1].vector).composite;
  const balancedAt38 = recompute(pairs[2].vector).composite;
  const spikyFiveTwoSix = recompute(pairs[3].vector).composite;
  assert(balancedAt4 > spikyFiveThree, "balanced-at-4.0 profile should out-score the 5/3 spiky profile");
  assert(spikyFiveTwoSix > balancedAt38, "spiky 5/2.6 profile should out-score the balanced-at-3.8 profile");
}

// ─── Summary ────────────────────────────────────────────────────────────────

console.log(`\ntest-method-claims: ${passed} passed, ${failed} failed\n`);
process.exit(failed > 0 ? 1 : 0);
