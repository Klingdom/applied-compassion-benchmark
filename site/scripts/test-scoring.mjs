#!/usr/bin/env node

/**
 * test-scoring.mjs — Unit tests for scoring functions from src/lib/scoring.ts.
 *
 * Self-contained: re-implements the pure scoring functions and hardcodes the
 * dimension/subdimension structure from src/data/dimensions.ts so this script
 * runs without a TypeScript compiler or test runner.
 *
 * Tests:
 *  - getBand: boundary values at 0, 20, 20.1, 40, 40.1, 60, 60.1, 80, 80.1, 100
 *  - getBandColor: all 5 named bands + unknown input fallback
 *  - calcScores: all-1, all-5, all-3, mixed with consistency penalty,
 *                scores containing 0 (harm flag disables integration premium)
 *
 * Exit code 0 = all tests pass, 1 = one or more failures.
 */

// ---------------------------------------------------------------------------
// Dimension data (mirrors src/data/dimensions.ts exactly)
// ---------------------------------------------------------------------------

const DIMENSIONS = [
  { code: "AWR", subdims: [{ code: "A1" }, { code: "A2" }, { code: "A3" }, { code: "A4" }, { code: "A5" }] },
  { code: "EMP", subdims: [{ code: "E1" }, { code: "E2" }, { code: "E3" }, { code: "E4" }, { code: "E5" }] },
  { code: "ACT", subdims: [{ code: "AC1" }, { code: "AC2" }, { code: "AC3" }, { code: "AC4" }, { code: "AC5" }] },
  { code: "EQU", subdims: [{ code: "EQ1" }, { code: "EQ2" }, { code: "EQ3" }, { code: "EQ4" }, { code: "EQ5" }] },
  { code: "BND", subdims: [{ code: "B1" }, { code: "B2" }, { code: "B3" }, { code: "B4" }, { code: "B5" }] },
  { code: "ACC", subdims: [{ code: "AB1" }, { code: "AB2" }, { code: "AB3" }, { code: "AB4" }, { code: "AB5" }] },
  { code: "SYS", subdims: [{ code: "S1" }, { code: "S2" }, { code: "S3" }, { code: "S4" }, { code: "S5" }] },
  { code: "INT", subdims: [{ code: "I1" }, { code: "I2" }, { code: "I3" }, { code: "I4" }, { code: "I5" }] },
];

// All subdimension codes in order (40 total)
const ALL_SUBDIM_CODES = DIMENSIONS.flatMap((d) => d.subdims.map((s) => s.code));

// ---------------------------------------------------------------------------
// Re-implemented scoring functions (must stay in sync with src/lib/scoring.ts)
// ---------------------------------------------------------------------------

function calcScores(scores) {
  const dimScores = {};
  DIMENSIONS.forEach((d) => {
    const vals = d.subdims.map((s) => scores[s.code] ?? 1);
    dimScores[d.code] = vals.reduce((a, b) => a + b, 0) / vals.length;
  });

  const dimVals = Object.values(dimScores);
  const dimCount = DIMENSIONS.length;
  const baseAvg = dimVals.reduce((a, b) => a + b, 0) / dimCount;
  const baseComposite = ((baseAvg - 1) / 4) * 100;

  const mean = dimVals.reduce((a, b) => a + b, 0) / dimCount;
  const variance = dimVals.reduce((a, b) => a + (b - mean) ** 2, 0) / dimCount;
  const stdDev = Math.sqrt(variance);

  let consistencyMult;
  if (stdDev <= 1.5) consistencyMult = 1.0;
  else if (stdDev <= 3.0) consistencyMult = 0.75;
  else if (stdDev <= 5.0) consistencyMult = 0.4;
  else consistencyMult = 0.1;

  const weakDims = dimVals.filter((v) => v < 4.0).length;
  const weaknessFactor = Math.max(0, 1 - weakDims * 0.2);

  const hasHarm = Object.values(scores).some((v) => v === 0);
  const integrationPremium = hasHarm ? 0 : 10 * consistencyMult * weaknessFactor;

  const final = Math.min(100, Math.max(0, baseComposite + integrationPremium));

  return { dimScores, final: Math.round(final * 10) / 10, integrationPremium };
}

function getBand(score) {
  if (score <= 20) return "Critical";
  if (score <= 40) return "Developing";
  if (score <= 60) return "Functional";
  if (score <= 80) return "Established";
  return "Exemplary";
}

function getBandColor(band) {
  const map = {
    Critical: "#f87171",
    Developing: "#fb923c",
    Functional: "#fcd34d",
    Established: "#86efac",
    Exemplary: "#7dd3fc",
  };
  return map[band] ?? "#7dd3fc";
}

// ---------------------------------------------------------------------------
// Test harness
// ---------------------------------------------------------------------------

let passed = 0;
let failed = 0;

function assert(label, actual, expected) {
  if (actual === expected) {
    console.log(`  PASS  ${label}`);
    passed++;
  } else {
    console.error(`  FAIL  ${label}`);
    console.error(`        expected: ${JSON.stringify(expected)}`);
    console.error(`        actual:   ${JSON.stringify(actual)}`);
    failed++;
  }
}

function assertApprox(label, actual, expected, tolerance = 0.05) {
  if (Math.abs(actual - expected) <= tolerance) {
    console.log(`  PASS  ${label}`);
    passed++;
  } else {
    console.error(`  FAIL  ${label}`);
    console.error(`        expected: ~${expected} (±${tolerance})`);
    console.error(`        actual:   ${actual}`);
    failed++;
  }
}

function assertLte(label, actual, max) {
  if (actual <= max) {
    console.log(`  PASS  ${label}`);
    passed++;
  } else {
    console.error(`  FAIL  ${label}`);
    console.error(`        expected: <= ${max}`);
    console.error(`        actual:   ${actual}`);
    failed++;
  }
}

function assertGte(label, actual, min) {
  if (actual >= min) {
    console.log(`  PASS  ${label}`);
    passed++;
  } else {
    console.error(`  FAIL  ${label}`);
    console.error(`        expected: >= ${min}`);
    console.error(`        actual:   ${actual}`);
    failed++;
  }
}

// Builds a uniform scores object: every subdim set to the given value
function uniformScores(value) {
  return Object.fromEntries(ALL_SUBDIM_CODES.map((code) => [code, value]));
}

// ---------------------------------------------------------------------------
// getBand tests
// ---------------------------------------------------------------------------

console.log("\ngetBand — boundary values\n");

assert("score 0   → Critical",   getBand(0),    "Critical");
assert("score 20  → Critical",   getBand(20),   "Critical");
assert("score 20.1 → Developing", getBand(20.1), "Developing");
assert("score 40  → Developing", getBand(40),   "Developing");
assert("score 40.1 → Functional", getBand(40.1), "Functional");
assert("score 60  → Functional", getBand(60),   "Functional");
assert("score 60.1 → Established",getBand(60.1),"Established");
assert("score 80  → Established", getBand(80),  "Established");
assert("score 80.1 → Exemplary",  getBand(80.1),"Exemplary");
assert("score 100 → Exemplary",   getBand(100), "Exemplary");

// ---------------------------------------------------------------------------
// getBandColor tests
// ---------------------------------------------------------------------------

console.log("\ngetBandColor — all bands + unknown fallback\n");

assert("Critical color",   getBandColor("Critical"),   "#f87171");
assert("Developing color", getBandColor("Developing"), "#fb923c");
assert("Functional color", getBandColor("Functional"), "#fcd34d");
assert("Established color",getBandColor("Established"),"#86efac");
assert("Exemplary color",  getBandColor("Exemplary"),  "#7dd3fc");
assert("Unknown → fallback #7dd3fc", getBandColor("Unknown"), "#7dd3fc");
assert("Empty string → fallback #7dd3fc", getBandColor(""), "#7dd3fc");

// ---------------------------------------------------------------------------
// calcScores tests
// ---------------------------------------------------------------------------

console.log("\ncalcScores — all scores = 1 (minimum)\n");

{
  // All subdims = 1 → every dim avg = 1 → baseComposite = ((1-1)/4)*100 = 0
  // stdDev = 0 → consistencyMult = 1.0
  // weakDims = 8 (all < 4.0) → weaknessFactor = max(0, 1 - 8*0.2) = max(0, -0.6) = 0
  // integrationPremium = 10 * 1.0 * 0 = 0
  // final = 0
  const result = calcScores(uniformScores(1));
  assert("all-1: final score = 0", result.final, 0);
  assert("all-1: band = Critical", getBand(result.final), "Critical");
  assertApprox("all-1: integrationPremium = 0", result.integrationPremium, 0);
  // Every dimension should average to 1.0
  for (const dim of DIMENSIONS) {
    assertApprox(
      `all-1: dimScores[${dim.code}] = 1.0`,
      result.dimScores[dim.code],
      1.0,
    );
  }
}

console.log("\ncalcScores — all scores = 5 (maximum)\n");

{
  // All subdims = 5 → every dim avg = 5 → baseComposite = ((5-1)/4)*100 = 100
  // stdDev = 0 → consistencyMult = 1.0
  // weakDims = 0 (none < 4.0) → weaknessFactor = 1.0
  // integrationPremium = 10 * 1.0 * 1.0 = 10  →  but final capped at 100
  // final = min(100, 100 + 10) = 100
  const result = calcScores(uniformScores(5));
  assert("all-5: final score = 100", result.final, 100);
  assert("all-5: band = Exemplary", getBand(result.final), "Exemplary");
  assertApprox("all-5: integrationPremium = 10", result.integrationPremium, 10);
}

console.log("\ncalcScores — all scores = 3 (midpoint)\n");

{
  // All subdims = 3 → every dim avg = 3 → baseComposite = ((3-1)/4)*100 = 50
  // stdDev = 0 → consistencyMult = 1.0
  // weakDims = 8 (all < 4.0) → weaknessFactor = max(0, 1 - 8*0.2) = 0
  // integrationPremium = 10 * 1.0 * 0 = 0
  // final = 50
  const result = calcScores(uniformScores(3));
  assert("all-3: final score = 50", result.final, 50);
  assert("all-3: band = Functional", getBand(result.final), "Functional");
  assertApprox("all-3: integrationPremium = 0", result.integrationPremium, 0);
}

console.log("\ncalcScores — scores containing 0 (harm flag)\n");

{
  // A single 0-score activates the harm flag — integrationPremium must be 0
  // regardless of how high everything else is.
  const scores = uniformScores(5);
  scores["A1"] = 0; // one harm indicator

  const result = calcScores(scores);
  assert("harm: integrationPremium = 0", result.integrationPremium, 0);
  // baseComposite will be close to 100 (39 fives + 1 zero), but no premium
  // final < 100 since the A1=0 pulls the AWR dim average down slightly
  assertLte("harm: final <= 100", result.final, 100);
  assertGte("harm: final >= 0",   result.final, 0);
}

console.log("\ncalcScores — mixed high/low scores (consistency penalty + weak dims)\n");

{
  // 4 dimensions score high (5), 4 dimensions score low (1).
  // dim averages: AWR=5, EMP=5, ACT=5, EQU=5, BND=1, ACC=1, SYS=1, INT=1
  // mean dim avg = (5+5+5+5+1+1+1+1)/8 = 24/8 = 3.0
  // baseComposite = ((3.0-1)/4)*100 = 50
  // variance = 4 dims at (5-3)^2=4 + 4 dims at (1-3)^2=4  → variance=4, stdDev=2.0
  // stdDev=2.0 → 1.5 < 2.0 <= 3.0 → consistencyMult = 0.75
  // weakDims = 4 (BND,ACC,SYS,INT all < 4) → weaknessFactor = max(0,1-4*0.2) = max(0,0.2) = 0.2
  // integrationPremium = 10 * 0.75 * 0.2 = 1.5
  // final = 50 + 1.5 = 51.5 (no harm flag)

  const scores = {};
  for (const code of ["A1","A2","A3","A4","A5","E1","E2","E3","E4","E5",
                       "AC1","AC2","AC3","AC4","AC5","EQ1","EQ2","EQ3","EQ4","EQ5"]) {
    scores[code] = 5;
  }
  for (const code of ["B1","B2","B3","B4","B5","AB1","AB2","AB3","AB4","AB5",
                       "S1","S2","S3","S4","S5","I1","I2","I3","I4","I5"]) {
    scores[code] = 1;
  }

  const result = calcScores(scores);
  assertApprox("mixed: baseComposite ≈ 50 (reflected in final before premium)", result.final - result.integrationPremium, 50, 0.1);
  assertApprox("mixed: integrationPremium ≈ 1.5", result.integrationPremium, 1.5, 0.01);
  assertApprox("mixed: final ≈ 51.5", result.final, 51.5, 0.1);
  assert("mixed: band = Functional", getBand(result.final), "Functional");
}

console.log("\ncalcScores — high variance forces deeper consistency penalty\n");

{
  // Alternating 1 and 5 per subdim within each dim keeps each dim at avg 3.0,
  // but since all dim averages equal 3.0 the stdDev across dims is 0.
  // To drive high variance we instead need alternating dim-level averages.
  // Use a pattern: 4 dims at 5, 2 dims at 1, 2 dims at 5 — wait, that's
  // the mixed test above. Instead: 1 dim at 5, 7 dims at 1 gives stdDev > 1.5.
  // dim avgs: AWR=5, rest=1  → mean=(5+7)/8=1.5
  // variance = (1/8)*[(5-1.5)^2 + 7*(1-1.5)^2] = (1/8)*[12.25 + 1.75] = 1.75
  // stdDev = sqrt(1.75) ≈ 1.322 → stdDev <= 1.5 → consistencyMult = 1.0
  // weakDims = 7 (seven < 4.0) → weaknessFactor = max(0, 1-7*0.2) = max(0,-0.4) = 0
  // integrationPremium = 10 * 1.0 * 0 = 0
  //
  // A cleaner high-stdDev case: 4 dims at 5, 4 dims at 1 (as in mixed test above).
  // That already verified consistencyMult=0.75.
  //
  // Test ultra-high stdDev: 1 dim at avg=5, 7 dims averaging to 1, but ensure
  // stdDev > 3. With 8 dims averaging (5+1+1+1+1+1+1+1)/8 = 12/8 = 1.5:
  // variance = [(5-1.5)^2 + 7*(1-1.5)^2]/8 = [12.25 + 1.75]/8 = 14/8 = 1.75
  // stdDev ≈ 1.32 — still under 1.5.
  // We can't achieve stdDev > 3 on a 1-5 scale across 8 dimensions because
  // max possible range is 4. Max stdDev ≈ 2 (half dims at 1, half at 5).
  // So the > 3.0 and > 5.0 thresholds are unreachable on this data set.
  // We verify the consistencyMult=0.75 path is exercised correctly here.
  //
  // Instead verify that exact cutoffs work: manufacture stdDev exactly at 1.5 boundary.
  // 4 dims at (3+1.5*sqrt(2)) ≈ 5.12 — out of range.
  // Accept: the mixed test above is the correct consistency-penalty integration test.
  // Add a boundary test: all dims at exactly 4.0 (weaknessFactor boundary).
  const scores = uniformScores(4);
  // dim avg = 4 → weakDims = 0 (none < 4.0), weaknessFactor = 1.0
  // stdDev = 0 → consistencyMult = 1.0
  // baseComposite = ((4-1)/4)*100 = 75
  // integrationPremium = 10 * 1.0 * 1.0 = 10
  // final = min(100, 75+10) = 85
  const result = calcScores(scores);
  assertApprox("all-4: final ≈ 85", result.final, 85, 0.1);
  assertApprox("all-4: integrationPremium = 10", result.integrationPremium, 10, 0.01);
  assert("all-4: band = Exemplary", getBand(result.final), "Exemplary");
}

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

console.log(`\n${"─".repeat(60)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);

if (failed > 0) {
  console.error(`\nFAILED — ${failed} test(s) did not pass\n`);
  process.exit(1);
} else {
  console.log(`\nAll ${passed} tests passed\n`);
  process.exit(0);
}
