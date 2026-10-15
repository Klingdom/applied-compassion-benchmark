#!/usr/bin/env node

/**
 * test-scoring.mjs -- Tests for the scoring functions.
 *
 * Every function under test is the REAL one: src/lib/scoring.ts is imported
 * through scripts/lib/ts-alias-loader.mjs (the same mechanism the model-wave
 * tests use), and scripts/lib/scoring.mjs is imported directly. Nothing in this
 * file re-implements calcScores, compositeCore, getBand or the strict
 * completeness primitives, so a change to the shipped formula can no longer
 * leave this test green.
 *
 * Harm rule (published methodology, /methodology): the integration premium is
 * zeroed only when a DIMENSION mean is exactly 0 -- not when a single
 * subdimension is 0.
 *
 * Tests:
 *  - getBand: boundary values at 0, 20, 20.1, 40, 40.1, 60, 60.1, 80, 80.1, 100
 *  - getBandColor: all 5 named bands + unknown input fallback
 *  - calcScores: all-1, all-5, all-3, mixed with consistency penalty,
 *                one subdimension at 0 (no harm), a whole dimension at 0 (harm)
 *  - strict-completeness primitives
 *  - parity: scoring.ts vs scoring.mjs over a golden grid of >= 60 dimension
 *            vectors (composite, band, integrationPremium)
 *
 * Exit code 0 = all tests pass, 1 = one or more failures.
 */

import { importSiteModule } from "./lib/ts-alias-loader.mjs";

const ts = await importSiteModule("src/lib/scoring.ts");
const { DIMENSIONS } = await importSiteModule("src/data/dimensions.ts");
const canonical = await import("./lib/scoring.mjs");

const { calcScores, getBand, getBandColor, computeCompositeFromDimensions, computeCompositeFromDimensionsStrict } = ts;
const { isComplete, assertComplete, DIM_CODES } = ts;

const ALL_SUBDIM_CODES = DIMENSIONS.flatMap((d) => d.subdims.map((s) => s.code));

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
    console.error(`        expected: ~${expected} (+/-${tolerance})`);
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

// Builds a dimension-score object from an array of 8 values in DIM_CODES order
function dimsFrom(values) {
  return Object.fromEntries(DIM_CODES.map((code, i) => [code, values[i]]));
}

// Builds a subdim score object where every subdim of a dimension equals that dimension's value
function subdimsFromDims(dims) {
  const out = {};
  for (const d of DIMENSIONS) for (const s of d.subdims) out[s.code] = dims[d.code];
  return out;
}

// ---------------------------------------------------------------------------
// getBand tests
// ---------------------------------------------------------------------------

console.log("\ngetBand -- boundary values\n");

assert("score 0   -> Critical",   getBand(0),    "Critical");
assert("score 20  -> Critical",   getBand(20),   "Critical");
assert("score 20.1 -> Developing", getBand(20.1), "Developing");
assert("score 40  -> Developing", getBand(40),   "Developing");
assert("score 40.1 -> Functional", getBand(40.1), "Functional");
assert("score 60  -> Functional", getBand(60),   "Functional");
assert("score 60.1 -> Established",getBand(60.1),"Established");
assert("score 80  -> Established", getBand(80),  "Established");
assert("score 80.1 -> Exemplary",  getBand(80.1),"Exemplary");
assert("score 100 -> Exemplary",   getBand(100), "Exemplary");

// ---------------------------------------------------------------------------
// getBandColor tests
// ---------------------------------------------------------------------------

console.log("\ngetBandColor -- all bands + unknown fallback\n");

assert("Critical color",   getBandColor("Critical"),   "#f87171");
assert("Developing color", getBandColor("Developing"), "#fb923c");
assert("Functional color", getBandColor("Functional"), "#fcd34d");
assert("Established color",getBandColor("Established"),"#86efac");
assert("Exemplary color",  getBandColor("Exemplary"),  "#7dd3fc");
assert("Unknown -> fallback #7dd3fc", getBandColor("Unknown"), "#7dd3fc");
assert("Empty string -> fallback #7dd3fc", getBandColor(""), "#7dd3fc");

// ---------------------------------------------------------------------------
// calcScores tests
// ---------------------------------------------------------------------------

console.log("\ncalcScores -- all scores = 1 (minimum)\n");

{
  // All subdims = 1 -> every dim avg = 1 -> baseComposite = 0; weakDims = 8 ->
  // weaknessFactor = 0 -> integrationPremium = 0 -> final = 0
  const result = calcScores(uniformScores(1));
  assert("all-1: final score = 0", result.final, 0);
  assert("all-1: band = Critical", getBand(result.final), "Critical");
  assertApprox("all-1: integrationPremium = 0", result.integrationPremium, 0);
  for (const dim of DIMENSIONS) {
    assertApprox(
      `all-1: dimScores[${dim.code}] = 1.0`,
      result.dimScores[dim.code],
      1.0,
    );
  }
}

console.log("\ncalcScores -- all scores = 5 (maximum)\n");

{
  // baseComposite = 100, premium = 10, final capped at 100
  const result = calcScores(uniformScores(5));
  assert("all-5: final score = 100", result.final, 100);
  assert("all-5: band = Exemplary", getBand(result.final), "Exemplary");
  assertApprox("all-5: integrationPremium = 10", result.integrationPremium, 10);
}

console.log("\ncalcScores -- all scores = 3 (midpoint)\n");

{
  // baseComposite = 50; weakDims = 8 -> weaknessFactor = 0 -> premium 0 -> final 50
  const result = calcScores(uniformScores(3));
  assert("all-3: final score = 50", result.final, 50);
  assert("all-3: band = Functional", getBand(result.final), "Functional");
  assertApprox("all-3: integrationPremium = 0", result.integrationPremium, 0);
}

console.log("\ncalcScores -- harm flag is DIMENSION-level (published methodology)\n");

{
  // CHANGED (was: any single subdimension at 0 zeroes the premium, which only
  // held for the old in-file copy). The shipped rule, and the one published on
  // /methodology, is "any single dimension at exactly 0". One subdimension at 0
  // with the other four in the dimension at 5 gives an AWR mean of 4.0, which is
  // not 0, so there is no harm flag and the premium is still earned.
  const scores = uniformScores(5);
  scores["A1"] = 0;

  const result = calcScores(scores);
  assert("one subdim at 0: AWR dimension mean = 4.0", result.dimScores.AWR, 4.0);
  assert("one subdim at 0: no harm -> integrationPremium > 0", result.integrationPremium > 0, true);
  assert("one subdim at 0: integrationPremium = 10 (all dims >= 4.0, stdDev small)", result.integrationPremium, 10);
  assertLte("one subdim at 0: final <= 100", result.final, 100);
  assertGte("one subdim at 0: final >= 0",   result.final, 0);
}

{
  // A whole dimension of five 0s: dimension mean is exactly 0 -> harm -> no premium.
  const scores = uniformScores(5);
  for (const code of ["A1", "A2", "A3", "A4", "A5"]) scores[code] = 0;

  const result = calcScores(scores);
  assert("whole AWR dimension at 0: AWR mean = 0", result.dimScores.AWR, 0);
  assert("whole AWR dimension at 0: harm -> integrationPremium = 0", result.integrationPremium, 0);
  // baseAvg = 35/8 = 4.375 -> baseComposite = 84.375 -> 84.4
  assert("whole AWR dimension at 0: final = 84.4 (base only, no premium)", result.final, 84.4);
}

console.log("\ncalcScores -- mixed high/low scores (consistency penalty + weak dims)\n");

{
  // dim averages: AWR=5, EMP=5, ACT=5, EQU=5, BND=1, ACC=1, SYS=1, INT=1
  // baseComposite = 50; stdDev = 2.0 -> consistencyMult 0.75; weakDims = 4 ->
  // weaknessFactor = 0.2; integrationPremium = 10 * 0.75 * 0.2 = 1.5; final 51.5
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
  assertApprox("mixed: baseComposite ~ 50 (reflected in final before premium)", result.final - result.integrationPremium, 50, 0.1);
  assertApprox("mixed: integrationPremium ~ 1.5", result.integrationPremium, 1.5, 0.01);
  assertApprox("mixed: final ~ 51.5", result.final, 51.5, 0.1);
  assert("mixed: band = Functional", getBand(result.final), "Functional");
}

console.log("\ncalcScores -- all dims at exactly 4.0 (weaknessFactor boundary)\n");

{
  // dim avg = 4 -> weakDims = 0, weaknessFactor 1.0, stdDev 0 -> mult 1.0
  // baseComposite = 75, premium = 10, final = 85
  const result = calcScores(uniformScores(4));
  assertApprox("all-4: final ~ 85", result.final, 85, 0.1);
  assertApprox("all-4: integrationPremium = 10", result.integrationPremium, 10, 0.01);
  assert("all-4: band = Exemplary", getBand(result.final), "Exemplary");
}

// ---------------------------------------------------------------------------
// Regression guard -- lenient functions still default missing input to 1.
//
// This is intentional, disclosed behaviour (SelfAssessment.tsx confirm
// dialog; bootstrapCompositeUncertainty in evaluation-statistics.mjs). A
// future agent must not "fix" calcScores or computeCompositeFromDimensions
// to throw on missing input without failing this test -- use the strict
// wrappers below instead.
// ---------------------------------------------------------------------------

console.log("\nRegression guard -- lenient functions still default missing input to 1\n");

{
  const dimsMissingInt = { AWR: 5, EMP: 5, ACT: 5, EQU: 5, BND: 5, ACC: 5, SYS: 5 };
  const withMissing = computeCompositeFromDimensions(dimsMissingInt);
  const withExplicitOne = computeCompositeFromDimensions({ ...dimsMissingInt, INT: 1 });
  assert(
    "lenient computeCompositeFromDimensions: missing INT === explicit INT=1 (composite)",
    withMissing.composite,
    withExplicitOne.composite,
  );
  assert(
    "lenient computeCompositeFromDimensions: missing INT === explicit INT=1 (band)",
    withMissing.band,
    withExplicitOne.band,
  );
}

{
  const scoresMissingInt = uniformScores(5);
  for (const code of ["I1", "I2", "I3", "I4", "I5"]) delete scoresMissingInt[code];
  const scoresExplicitOne = uniformScores(5);
  for (const code of ["I1", "I2", "I3", "I4", "I5"]) scoresExplicitOne[code] = 1;

  const withMissing = calcScores(scoresMissingInt);
  const withExplicitOne = calcScores(scoresExplicitOne);
  assert(
    "lenient calcScores: missing I1-I5 === explicit I1-I5=1 (final)",
    withMissing.final,
    withExplicitOne.final,
  );
  assertApprox(
    "lenient calcScores: missing INT dim scores to 1.0 (defaulted)",
    withMissing.dimScores.INT,
    1.0,
  );
}

// ---------------------------------------------------------------------------
// Strict-completeness primitives (Option B) -- the real exports of scoring.ts
// ---------------------------------------------------------------------------

console.log("\nisComplete -- never throws, correct for complete and incomplete input\n");

{
  const completeDims = { AWR: 3, EMP: 3, ACT: 3, EQU: 3, BND: 3, ACC: 3, SYS: 3, INT: 3 };
  const check = isComplete(completeDims, "dimension");
  assert("isComplete: complete dims -> complete=true", check.complete, true);
  assert("isComplete: complete dims -> missing=[]", check.missing.length, 0);

  const incompleteDims = { AWR: 3, EMP: 3, ACT: 3, EQU: 3, BND: 3, ACC: 3, SYS: 3 }; // no INT
  const check2 = isComplete(incompleteDims, "dimension");
  assert("isComplete: missing INT -> complete=false", check2.complete, false);
  assert("isComplete: missing INT -> missing=['INT']", JSON.stringify(check2.missing), JSON.stringify(["INT"]));

  const completeSubdims = Object.fromEntries(ALL_SUBDIM_CODES.map((c) => [c, 3]));
  const check3 = isComplete(completeSubdims, "subdimension");
  assert("isComplete: complete subdims -> complete=true", check3.complete, true);

  const incompleteSubdims = Object.fromEntries(ALL_SUBDIM_CODES.map((c) => [c, 3]));
  delete incompleteSubdims["A1"];
  delete incompleteSubdims["B3"];
  const check4 = isComplete(incompleteSubdims, "subdimension");
  assert("isComplete: missing A1,B3 -> complete=false", check4.complete, false);
  assert(
    "isComplete: missing A1,B3 -> missing names both codes",
    check4.missing.includes("A1") && check4.missing.includes("B3") && check4.missing.length === 2,
    true,
  );

  let threw = false;
  try {
    isComplete({}, "dimension");
  } catch {
    threw = true;
  }
  assert("isComplete: empty input does not throw", threw, false);
}

console.log("\nassertComplete -- throws IncompleteScoreError naming missing codes\n");

{
  const incompleteDims = { AWR: 3, EMP: 3, ACT: 3, EQU: 3, BND: 3, ACC: 3, SYS: 3 }; // no INT
  let caught = null;
  try {
    assertComplete(incompleteDims, "dimension");
  } catch (e) {
    caught = e;
  }
  assert("assertComplete: missing dimension throws", caught !== null, true);
  assert("assertComplete: missing dimension error names INT", caught?.message.includes("INT"), true);
  assert("assertComplete: missing dimension error is IncompleteScoreError", caught?.name, "IncompleteScoreError");
  assert(
    "assertComplete: missing dimension error.missing = ['INT']",
    JSON.stringify(caught?.missing),
    JSON.stringify(["INT"]),
  );

  let threwOnComplete = false;
  try {
    assertComplete({ AWR: 3, EMP: 3, ACT: 3, EQU: 3, BND: 3, ACC: 3, SYS: 3, INT: 3 }, "dimension");
  } catch {
    threwOnComplete = true;
  }
  assert("assertComplete: complete dimension input does not throw", threwOnComplete, false);

  const incompleteSubdims = Object.fromEntries(ALL_SUBDIM_CODES.map((c) => [c, 3]));
  delete incompleteSubdims["A1"];
  delete incompleteSubdims["E3"];
  let caughtSub = null;
  try {
    assertComplete(incompleteSubdims, "subdimension");
  } catch (e) {
    caughtSub = e;
  }
  assert("assertComplete: missing subdimensions throws", caughtSub !== null, true);
  assert("assertComplete: missing subdimensions error names A1", caughtSub?.message.includes("A1"), true);
  assert("assertComplete: missing subdimensions error names E3", caughtSub?.message.includes("E3"), true);
  assert(
    "assertComplete: missing subdimensions error.missing names both codes",
    caughtSub?.missing.includes("A1") && caughtSub?.missing.includes("E3") && caughtSub?.missing.length === 2,
    true,
  );

  const completeSubdims = Object.fromEntries(ALL_SUBDIM_CODES.map((c) => [c, 3]));
  let threwOnCompleteSub = false;
  try {
    assertComplete(completeSubdims, "subdimension");
  } catch {
    threwOnCompleteSub = true;
  }
  assert("assertComplete: complete subdimension input does not throw", threwOnCompleteSub, false);
}

console.log("\ncomputeCompositeFromDimensionsStrict -- complete input matches lenient exactly\n");

{
  const goldenComplete = [
    { AWR: 1, EMP: 1, ACT: 1, EQU: 1, BND: 1, ACC: 1, SYS: 1, INT: 1 },
    { AWR: 3, EMP: 3, ACT: 3, EQU: 3, BND: 3, ACC: 3, SYS: 3, INT: 3 },
    { AWR: 4, EMP: 4, ACT: 4, EQU: 4, BND: 4, ACC: 4, SYS: 4, INT: 4 },
    { AWR: 5, EMP: 5, ACT: 5, EQU: 5, BND: 5, ACC: 5, SYS: 5, INT: 5 },
    { AWR: 0, EMP: 5, ACT: 5, EQU: 5, BND: 5, ACC: 5, SYS: 5, INT: 5 },
    { AWR: 3.5, EMP: 3.25, ACT: 3.25, EQU: 4.0, BND: 2.75, ACC: 3.75, SYS: 4.0, INT: 3.5 }, // Glasgow
    { AWR: 4.5, EMP: 4.5, ACT: 4.3, EQU: 4.0, BND: 4.5, ACC: 4.5, SYS: 4.5, INT: 4.3 }, // Finland
    { AWR: 1.8, EMP: 1.8, ACT: 1.6, EQU: 1.6, BND: 1.5, ACC: 1.9, SYS: 1.8, INT: 1.9 }, // Venezuela
  ];

  for (const [i, dims] of goldenComplete.entries()) {
    const lenient = computeCompositeFromDimensions(dims);
    const strict = computeCompositeFromDimensionsStrict(dims);
    assert(
      `strict[${i}]: byte-identical to lenient (JSON deep-equal)`,
      JSON.stringify(strict),
      JSON.stringify(lenient),
    );
  }
}

console.log("\ncomputeCompositeFromDimensionsStrict -- missing dimension throws, names the code(s)\n");

{
  const missingOne = { AWR: 3, EMP: 3, ACT: 3, EQU: 3, BND: 3, ACC: 3, SYS: 3 }; // no INT
  let caught = null;
  try {
    computeCompositeFromDimensionsStrict(missingOne);
  } catch (e) {
    caught = e;
  }
  assert("strict: single missing dim throws", caught !== null, true);
  assert("strict: single missing dim names INT", caught?.missing.includes("INT"), true);
  assert("strict: single missing dim error is IncompleteScoreError", caught?.name, "IncompleteScoreError");

  const missingTwo = { AWR: 3, EMP: 3, ACT: 3, EQU: 3 }; // no BND, ACC, SYS, INT
  let caught2 = null;
  try {
    computeCompositeFromDimensionsStrict(missingTwo);
  } catch (e) {
    caught2 = e;
  }
  assert("strict: multiple missing dims throws", caught2 !== null, true);
  for (const code of ["BND", "ACC", "SYS", "INT"]) {
    assert(`strict: multiple missing dims names ${code}`, caught2?.missing.includes(code), true);
  }
  assert("strict: multiple missing dims count = 4", caught2?.missing.length, 4);

  let caught3 = null;
  try {
    computeCompositeFromDimensionsStrict({});
  } catch (e) {
    caught3 = e;
  }
  assert("strict: empty input throws", caught3 !== null, true);
  assert("strict: empty input names all 8 dims", caught3?.missing.length, 8);
}

// ---------------------------------------------------------------------------
// Parity gate -- scripts/lib/scoring.mjs vs src/lib/scoring.ts.
//
// Both modules are the real shipped code. A golden grid of dimension vectors is
// run through both and composite, band and integrationPremium must be
// identical. If the formula drifts in either file, this block fails.
// ---------------------------------------------------------------------------

console.log("\nscripts/lib/scoring.mjs -- parity with src/lib/scoring.ts\n");

{
  // 1. getBand parity at every band boundary (including the 20.05 half-step).
  for (const score of [0, 20, 20.05, 20.1, 40, 40.1, 60, 60.1, 80, 80.1, 100]) {
    assert(
      `getBand(${score}) agrees between scoring.ts and scoring.mjs`,
      canonical.getBand(score),
      getBand(score),
    );
  }
  assert("getBand(20.05) = Developing", getBand(20.05), "Developing");

  // 2. Golden grid of dimension vectors. `expected` is pinned only where the
  //    value was computed independently; every vector is checked for parity.
  const u = (v) => Array(8).fill(v);
  const grid = [
    // exact-value vectors (computed by the coordinator with scoring.mjs)
    { name: "all 3",                 v: u(3),                       expected: 50 },
    { name: "[1,1,1,1,5,5,5,5]",     v: [1, 1, 1, 1, 5, 5, 5, 5],   expected: 51.5 },
    { name: "[4,4,4,4,2,2,2,2]",     v: [4, 4, 4, 4, 2, 2, 2, 2],   expected: 52 },
    { name: "all 4.0",               v: u(4),                       expected: 85 },
    { name: "all 3.9",               v: u(3.9),                     expected: 72.5 },
    { name: "one 0.1, rest 5",       v: [0.1, 5, 5, 5, 5, 5, 5, 5], expected: 90.7 },
    { name: "one 0, rest 5",         v: [0, 5, 5, 5, 5, 5, 5, 5],   expected: 84.4 },
    { name: "all 1",                 v: u(1),                       expected: 0 },
    { name: "all 5",                 v: u(5),                       expected: 100 },
    // band edges reached through dimension vectors (premium is 0 for these)
    { name: "edge composite 0",      v: u(1),                       expected: 0,  band: "Critical" },
    { name: "edge composite 20",     v: u(1.8),                     expected: 20, band: "Critical" },
    { name: "edge composite 20.05",  v: u(1.8021),                  expected: 20.1, band: "Developing" },
    { name: "edge composite 40",     v: u(2.6),                     expected: 40, band: "Developing" },
    { name: "edge composite 60",     v: u(3.4),                     expected: 60, band: "Functional" },
    { name: "edge composite 80",     v: [3.72, 3.72, 3.72, 3.72, 3.72, 5, 5, 5], expected: 80, band: "Established" },
    { name: "edge composite 100",    v: u(5),                       expected: 100, band: "Exemplary" },
    // zeros: single dimension at 0 (harm) in each position, rest 4
    ...DIM_CODES.map((c, i) => ({
      name: `${c} = 0, rest 4`,
      v: u(4).map((x, j) => (j === i ? 0 : x)),
      harm: true,
    })),
    // consistency threshold sweep: four dims at 5, four at x. stdDev = (5-x)/2,
    // which straddles the 1.5 threshold (x = 2 -> 1.5 exactly, x = 1.9 -> 1.55)
    ...[2.4, 2.2, 2.1, 2.05, 2.0, 1.95, 1.9, 1.5, 1.0].map((x) => ({
      name: `4x5 + 4x${x}`,
      v: [5, 5, 5, 5, x, x, x, x],
    })),
    // quarter-step profiles and mid-range / high-range uniform vectors
    { name: "Glasgow",   v: [3.5, 3.25, 3.25, 4.0, 2.75, 3.75, 4.0, 3.5] },
    { name: "Finland",   v: [4.5, 4.5, 4.3, 4.0, 4.5, 4.5, 4.5, 4.3] },
    { name: "Venezuela", v: [1.8, 1.8, 1.6, 1.6, 1.5, 1.9, 1.8, 1.9] },
    ...[1.5, 2, 2.5, 3.5, 3.99, 4.01, 4.5].map((x) => ({ name: `uniform ${x}`, v: u(x) })),
  ];

  // deterministic pseudo-random vectors (LCG), quarter-step values in 0..5,
  // with zeros deliberately over-represented to exercise the harm branch.
  let seed = 20261014;
  const rnd = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  for (let n = 0; n < 40; n++) {
    const v = Array.from({ length: 8 }, () => (rnd() < 0.12 ? 0 : Math.round(rnd() * 20) / 4));
    grid.push({ name: `seeded #${n} ${JSON.stringify(v)}`, v });
  }

  assertGte("parity grid has at least 60 vectors", grid.length, 60);

  const round1 = (x) => Math.round(x * 10) / 10;
  for (const g of grid) {
    const dims = dimsFrom(g.v);
    const a = computeCompositeFromDimensions(dims); // scoring.ts
    const b = canonical.computeCompositeFromDimensions(dims); // scoring.mjs
    assert(`parity composite  [${g.name}]`, a.composite, b.composite);
    assert(`parity band       [${g.name}]`, a.band, b.band);
    // scoring.ts rounds the premium to 1 dp for its breakdown; scoring.mjs returns it raw.
    assert(`parity premium    [${g.name}]`, a.integrationPremium, round1(b.integrationPremium));
    if (g.expected !== undefined) {
      assert(`exact composite   [${g.name}] = ${g.expected}`, a.composite, g.expected);
    }
    if (g.band !== undefined) {
      assert(`band             [${g.name}] = ${g.band}`, a.band, g.band);
    }
    if (g.harm) {
      assert(`harm              [${g.name}] -> hasHarm`, a.hasHarm, true);
      assert(`harm              [${g.name}] -> premium 0 in both`, a.integrationPremium === 0 && b.integrationPremium === 0, true);
    }
  }

  // Harm is a DIMENSION-level rule in both implementations: 0.1 is not 0.
  assert("one dim at 0.1 (rest 5): ts hasHarm = false", computeCompositeFromDimensions(dimsFrom([0.1, 5, 5, 5, 5, 5, 5, 5])).hasHarm, false);
  assert("one dim at 0.1 (rest 5): mjs premium > 0", canonical.computeCompositeFromDimensions(dimsFrom([0.1, 5, 5, 5, 5, 5, 5, 5])).integrationPremium > 0, true);

  // calcScores (subdimension path) and computeCompositeFromDimensions must agree
  // when each dimension's subdims all equal the dimension value.
  for (const g of grid) {
    const dims = dimsFrom(g.v);
    const viaSubdims = calcScores(subdimsFromDims(dims));
    const viaDims = canonical.computeCompositeFromDimensions(dims);
    assert(`calcScores vs mjs composite [${g.name}]`, viaSubdims.final, viaDims.composite);
  }

  // 3. METHODOLOGY_VERSION and DIMENSION_CODES of scoring.mjs.
  assert("lib/scoring.mjs METHODOLOGY_VERSION === 'v1.2'", canonical.METHODOLOGY_VERSION, "v1.2");
  assert("lib/scoring.mjs DIMENSION_CODES length", canonical.DIMENSION_CODES.length, 8);
  assert(
    "lib/scoring.mjs DIMENSION_CODES equals scoring.ts DIM_CODES",
    JSON.stringify(canonical.DIMENSION_CODES),
    JSON.stringify(DIM_CODES),
  );
  for (const code of ["AWR","EMP","ACT","EQU","BND","ACC","SYS","INT"]) {
    assert(
      `lib/scoring.mjs DIMENSION_CODES contains ${code}`,
      canonical.DIMENSION_CODES.includes(code),
      true,
    );
  }
}

// ---------------------------------------------------------------------------
// Record-derived edge cases
//
// EC-1  Harm-floor entity   (a dim == 0 -> integrationPremium forced to 0)
// EC-2  Quarter-step value  (university dims with .25/.75 -> exact composite)
// EC-3  Override entity     (Finland: formula != published composite)
// EC-4  Reconstructed entity behavior through calcScores path
// ---------------------------------------------------------------------------

console.log("\nRecord-derived edge cases -- scoring.mjs / scoring.ts lockstep\n");

{
  console.log("EC-1  Harm-floor dimension (AWR=0, all others=3)\n");

  {
    const harmDims = { AWR: 0, EMP: 3, ACT: 3, EQU: 3, BND: 3, ACC: 3, SYS: 3, INT: 3 };
    const res = canonical.computeCompositeFromDimensions(harmDims);

    assert(
      "EC-1 (scoring.mjs): harm-floor dim -> integrationPremium = 0",
      res.integrationPremium,
      0,
    );

    // baseAvg = 21/8 = 2.625 -> baseComposite = 40.625 -> 40.6
    assertApprox(
      "EC-1 (scoring.mjs): harm-floor dim -> composite = 40.6",
      res.composite,
      40.6,
      0.05,
    );

    assert(
      "EC-1 (scoring.mjs): harm-floor band = Functional",
      canonical.getBand(res.composite),
      "Functional",
    );

    // All AWR subdims = 0 (dimension mean 0), all others = 3, through the real calcScores.
    const calcRes = calcScores(subdimsFromDims(harmDims));
    assert(
      "EC-1 (calcScores): harm-floor subdims -> integrationPremium = 0",
      calcRes.integrationPremium,
      0,
    );
    assertApprox(
      "EC-1 (calcScores): harm-floor subdims -> composite matches scoring.mjs",
      calcRes.final,
      res.composite,
      0.05,
    );
  }

  console.log("\nEC-2  Quarter-step dims (University of Glasgow: 3.25 / 2.75 values)\n");

  {
    const glasgowDims = { AWR: 3.5, EMP: 3.25, ACT: 3.25, EQU: 4.0, BND: 2.75, ACC: 3.75, SYS: 4.0, INT: 3.5 };
    const res = canonical.computeCompositeFromDimensions(glasgowDims);

    // baseAvg = 3.5 -> baseComposite = 62.5; 6 weak dims -> premium 0 -> 62.5
    assertApprox(
      "EC-2 (scoring.mjs): Glasgow quarter-step dims -> composite = 62.5",
      res.composite,
      62.5,
      0.05,
    );
    assert(
      "EC-2 (scoring.mjs): Glasgow composite -> band = Established",
      res.band,
      "Established",
    );
    assert(
      "EC-2 (scoring.mjs): Glasgow -> integrationPremium = 0 (6 weak dims)",
      res.integrationPremium,
      0,
    );

    const calcResGlasgow = calcScores(subdimsFromDims(glasgowDims));
    assertApprox(
      "EC-2 (calcScores): reconstructed Glasgow subdims -> composite matches scoring.mjs",
      calcResGlasgow.final,
      res.composite,
      0.05,
    );
  }

  console.log("\nEC-3  Override entity (Finland: formula != published)\n");

  {
    const finlandDims = { AWR: 4.5, EMP: 4.5, ACT: 4.3, EQU: 4.0, BND: 4.5, ACC: 4.5, SYS: 4.5, INT: 4.3 };
    const res = canonical.computeCompositeFromDimensions(finlandDims);
    const publishedFinland = 84.4;

    assert(
      "EC-3 (scoring.mjs): Finland formula composite != published 84.4",
      res.composite !== publishedFinland,
      true,
    );

    // baseAvg=4.3875 -> baseComp=84.69, stdDev~0.169 -> mult 1.0, weakDims 0 ->
    // premium 10 -> raw 94.69 -> composite 94.7.
    assertApprox(
      "EC-3 (scoring.mjs): Finland formula composite ~ 94.7",
      res.composite,
      94.7,
      0.2,
    );

    const diffFinland = Math.abs(res.composite - publishedFinland);
    assertGte(
      "EC-3: diff(formula, published) >= 10 (confirms ceiling override magnitude)",
      diffFinland,
      10,
    );
  }

  console.log("\nEC-4  Reconstructed entity path (Venezuela dims through both entry points)\n");

  {
    const venezDims = { AWR: 1.8, EMP: 1.8, ACT: 1.6, EQU: 1.6, BND: 1.5, ACC: 1.9, SYS: 1.8, INT: 1.9 };
    const resFromDims = canonical.computeCompositeFromDimensions(venezDims);
    const resFromSubdims = calcScores(subdimsFromDims(venezDims));

    assertApprox(
      "EC-4: calcScores(reconstructed subdims) == computeCompositeFromDimensions(dims)",
      resFromSubdims.final,
      resFromDims.composite,
      0.05,
    );

    assertApprox(
      "EC-4 (scoring.mjs): Venezuela dims composite matches real calcScores",
      resFromDims.composite,
      resFromSubdims.final,
      0.05,
    );

    assert(
      "EC-4: Venezuela -> integrationPremium = 0 (all dims < 4.0, weaknessFactor = 0)",
      resFromDims.integrationPremium,
      0,
    );
  }
}

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

console.log(`\n${"-".repeat(60)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);

if (failed > 0) {
  console.error(`\nFAILED -- ${failed} test(s) did not pass\n`);
  process.exit(1);
} else {
  console.log(`\nAll ${passed} tests passed\n`);
  process.exit(0);
}
