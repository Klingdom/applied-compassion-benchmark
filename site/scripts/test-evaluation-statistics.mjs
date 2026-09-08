#!/usr/bin/env node

/**
 * test-evaluation-statistics.mjs — Fixture-based tests for
 * scripts/lib/evaluation-statistics.mjs.
 *
 * ALL data in this file is SYNTHETIC, constructed for these tests. No trial,
 * rating, score, model, or run referenced here is real — there is no run
 * data anywhere in this repo (.benchmark-ops/EVALUATION_LEDGER.md: "0 runs.
 * 0 trials. 0 raw responses."). Style mirrors test-task-bank.mjs /
 * test-model-registry.mjs: build small synthetic fixtures, run them through
 * the SAME functions the CLI (validate-evaluation-run.mjs) uses, and assert
 * on the returned values. Uses a seeded PRNG for every randomised fixture —
 * no Math.random() anywhere in this file.
 *
 * Covers, per the CB-MODEL Phase 1 Item 5 brief:
 *  - A hand-computable Krippendorff's alpha (worked by hand in the module's
 *    doc comment and reproduced here) matches exactly.
 *  - Perfect agreement -> alpha = 1.0 exactly.
 *  - Chance agreement (seeded-random, independent raters) -> alpha near 0.
 *  - Insufficient-n is flagged (sufficient: false) rather than emitted bare.
 *  - Refusals/failures are counted separately from low scores and excluded
 *    from score means.
 *  - A dimension with one item reports spread as undefined (null), not 0.
 *  - Bootstrap CI is stable (byte-identical) across two runs under a fixed
 *    seed.
 *  - Known-answer variance check (hand-computable sample variance).
 *
 * Exit code 0 = all tests pass, 1 = one or more failures.
 */

import {
  mean,
  sampleVariance,
  sampleStdDev,
  createSeededRng,
  computeItemTrialVariance,
  computeFailureRates,
  computeDimensionProfiles,
  krippendorffAlpha,
  bootstrapCompositeUncertainty,
  validateRunCompleteness,
  COMPLETENESS_GATE_FIELDS,
  THRESHOLDS,
} from "./lib/evaluation-statistics.mjs";

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

function assertClose(label, actual, expected, epsilon = 1e-9) {
  assert(`${label} (actual=${actual}, expected≈${expected})`, typeof actual === "number" && Math.abs(actual - expected) < epsilon);
}

function assertIncludesMatch(label, arr, substring) {
  assert(label, Array.isArray(arr) && arr.some((s) => s.includes(substring)));
}

const DIMS = ["AWR", "EMP", "ACT", "EQU", "BND", "ACC", "SYS", "INT"];

// ── Test 1: seeded PRNG determinism ─────────────────────────────────────

console.log("Test 1: seeded PRNG is deterministic and NOT Math.random");
{
  const a = createSeededRng(12345);
  const b = createSeededRng(12345);
  const seqA = Array.from({ length: 10 }, () => a());
  const seqB = Array.from({ length: 10 }, () => b());
  assert("same seed -> identical sequence", JSON.stringify(seqA) === JSON.stringify(seqB));
  assert("sequence values are in [0,1)", seqA.every((v) => v >= 0 && v < 1));

  const c = createSeededRng(99999);
  const seqC = Array.from({ length: 10 }, () => c());
  assert("different seed -> different sequence", JSON.stringify(seqA) !== JSON.stringify(seqC));
}

// ── Test 2: known-answer sample variance (hand-computable) ─────────────

console.log("\nTest 2: known-answer sample variance");
{
  // [1,2,3,4,5]: mean=3, sample variance (n-1) = (4+1+0+1+4)/4 = 10/4 = 2.5
  assertClose("sample variance of [1,2,3,4,5]", sampleVariance([1, 2, 3, 4, 5]), 2.5);
  assertClose("sample stdDev of [1,2,3,4,5]", sampleStdDev([1, 2, 3, 4, 5]), Math.sqrt(2.5));
  assertClose("mean of [1,2,3,4,5]", mean([1, 2, 3, 4, 5]), 3);
  assert("variance of a single value is undefined (null), not 0", sampleVariance([4]) === null);
  assert("variance of zero values is undefined (null)", sampleVariance([]) === null);
  assert("mean of zero values is undefined (null), not 0", mean([]) === null);
}

// ── Test 3: Krippendorff's alpha — hand-computable known answer ────────

console.log("\nTest 3: Krippendorff's alpha — hand-computable known answer");
{
  // Worked by hand (see evaluation-statistics.mjs doc comment for the
  // full derivation): 2 raters (A, B), 4 units, categories {1,2}, nominal
  // metric (equivalent to the ordinal metric here since only 2 categories
  // exist, so the ordinal weighting constant cancels in the Do/De ratio).
  //   u1: A=1,B=1   u2: A=2,B=2   u3: A=1,B=2   u4: A=2,B=1
  // n=8 pairable values, n_1=4, n_2=4. Do = 4/8 = 0.5.
  // De = (n1*n2 + n2*n1) / (n*(n-1)) = 32/56 = 0.571428...
  // alpha = 1 - Do/De = 1 - 0.875 = 0.125 exactly.
  const ratings = [
    { unitId: "u1", raterId: "A", value: 1 },
    { unitId: "u1", raterId: "B", value: 1 },
    { unitId: "u2", raterId: "A", value: 2 },
    { unitId: "u2", raterId: "B", value: 2 },
    { unitId: "u3", raterId: "A", value: 1 },
    { unitId: "u3", raterId: "B", value: 2 },
    { unitId: "u4", raterId: "A", value: 2 },
    { unitId: "u4", raterId: "B", value: 1 },
  ];
  const result = krippendorffAlpha(ratings, { metric: "nominal" });
  assertClose("hand-computed alpha = 0.125", result.alpha, 0.125);
  assert("n = 8 pairable values", result.n === 8);
  assert("pairableUnits = 4", result.pairableUnits === 4);
}

console.log("\nTest 3b: perfect agreement -> alpha = 1.0 exactly");
{
  const ratings = [];
  for (let i = 1; i <= 5; i++) {
    ratings.push({ unitId: `u${i}`, raterId: "A", value: i });
    ratings.push({ unitId: `u${i}`, raterId: "B", value: i });
  }
  const result = krippendorffAlpha(ratings);
  assert("perfect agreement: alpha === 1", result.alpha === 1);
  assert("perfect agreement: not degenerate", result.degenerate === false);
}

console.log("\nTest 3c: chance agreement (seeded-random independent raters) -> alpha near 0");
{
  const rng = createSeededRng(42);
  const ratings = [];
  for (let i = 0; i < 300; i++) {
    const a = 1 + Math.floor(rng() * 5);
    const b = 1 + Math.floor(rng() * 5);
    ratings.push({ unitId: `u${i}`, raterId: "A", value: a });
    ratings.push({ unitId: `u${i}`, raterId: "B", value: b });
  }
  const result = krippendorffAlpha(ratings);
  // This is a probabilistic sanity check, not an exact identity: two raters
  // drawing independently from the same seeded distribution should show
  // agreement statistically indistinguishable from chance. 0.15 is a
  // deliberately generous tolerance for a single seeded run of n=300 pairs.
  assert(`chance agreement: |alpha| < 0.15 (actual=${result.alpha})`, Math.abs(result.alpha) < 0.15);
  assert("chance agreement: sufficient n (>=30 pairable units)", result.sufficient === true);
}

console.log("\nTest 3d: degenerate case (zero variation) -> alpha is undefined (null), not 1.0");
{
  const ratings = [];
  for (let i = 0; i < 10; i++) {
    ratings.push({ unitId: `u${i}`, raterId: "A", value: 3 });
    ratings.push({ unitId: `u${i}`, raterId: "B", value: 3 });
  }
  const result = krippendorffAlpha(ratings);
  assert("degenerate: alpha is null", result.alpha === null);
  assert("degenerate: flagged degenerate", result.degenerate === true);
}

console.log("\nTest 3e: missing values are excluded from n, not coerced to 0");
{
  const ratings = [
    { unitId: "u1", raterId: "A", value: 1 },
    { unitId: "u1", raterId: "B", value: null }, // B did not rate u1
    { unitId: "u2", raterId: "A", value: 2 },
    { unitId: "u2", raterId: "B", value: 2 },
  ];
  const result = krippendorffAlpha(ratings);
  // u1 has only 1 valid rating (A=1) -> not pairable, excluded entirely.
  assert("missing value: unitsRated = 2 (both units have >=1 rating)", result.unitsRated === 2);
  assert("missing value: pairableUnits = 1 (only u2 has >=2 raters)", result.pairableUnits === 1);
  assert("missing value: n = 2 (only u2's pairable values)", result.n === 2);
}

console.log("\nTest 3f: insufficient-n is flagged (sufficient: false), not hidden");
{
  const ratings = [
    { unitId: "u1", raterId: "A", value: 1 },
    { unitId: "u1", raterId: "B", value: 2 },
  ];
  const result = krippendorffAlpha(ratings);
  assert("insufficient n: alpha is still computed (not null/hidden)", typeof result.alpha === "number");
  assert("insufficient n: sufficient === false", result.sufficient === false);
  assert("insufficient n: threshold recorded", result.threshold === THRESHOLDS.MIN_PAIRABLE_UNITS_FOR_ALPHA);
}

// ── Test 4: trial-to-trial variance per item ────────────────────────────

console.log("\nTest 4: trial-to-trial variance per item");
{
  const trials = [
    { itemId: "ACT-1-A", status: "completed", score: 5 },
    { itemId: "ACT-1-A", status: "completed", score: 5 },
    { itemId: "ACT-1-A", status: "completed", score: 5 },
    { itemId: "ACT-1-A", status: "completed", score: 2 },
    { itemId: "ACT-1-A", status: "completed", score: 5 },
  ];
  const result = computeItemTrialVariance(trials);
  // mean = 22/5 = 4.4; sample variance (n-1=4): deviations 0.6,0.6,0.6,-2.4,0.6
  // squared: 0.36,0.36,0.36,5.76,0.36 = 7.2 / 4 = 1.8
  assertClose("ACT-1-A mean = 4.4", result["ACT-1-A"].mean, 4.4);
  assertClose("ACT-1-A variance = 1.8", result["ACT-1-A"].variance, 1.8);
  assert("ACT-1-A completedN = 5", result["ACT-1-A"].completedN === 5);
  assert("ACT-1-A sufficient (>=3 trials)", result["ACT-1-A"].sufficient === true);
  assert("ACT-1-A range = 3 (5-2)", result["ACT-1-A"].range === 3);
}

console.log("\nTest 4b: a single completed trial reports variance as undefined (null), not 0");
{
  const trials = [{ itemId: "X-1-A", status: "completed", score: 4 }];
  const result = computeItemTrialVariance(trials);
  assert("single trial: variance is null", result["X-1-A"].variance === null);
  assert("single trial: stdDev is null", result["X-1-A"].stdDev === null);
  assert("single trial: range is null", result["X-1-A"].range === null);
  assert("single trial: not sufficient", result["X-1-A"].sufficient === false);
  assertClose("single trial: mean is still 4", result["X-1-A"].mean, 4);
}

console.log("\nTest 4c: refusals/failures are excluded from the item's score mean and variance");
{
  const trials = [
    { itemId: "ACT-1-A", status: "completed", score: 5 },
    { itemId: "ACT-1-A", status: "refused", score: null },
    { itemId: "ACT-1-A", status: "failed", score: null },
    { itemId: "ACT-1-A", status: "completed", score: 5 },
    { itemId: "ACT-1-A", status: "completed", score: 5 },
  ];
  const result = computeItemTrialVariance(trials);
  assert("refusals excluded: n counts all 5 trials", result["ACT-1-A"].n === 5);
  assert("refusals excluded: completedN counts only the 3 completed", result["ACT-1-A"].completedN === 3);
  assertClose("refusals excluded: mean is 5 (not pulled toward a 'refusal score')", result["ACT-1-A"].mean, 5);
  assertClose("refusals excluded: variance is a real 0 among the 3 identical completed scores (not undefined — n=3 clears the sufficiency floor)", result["ACT-1-A"].variance, 0);
}

// ── Test 5: failure rates — each category counted separately ───────────

console.log("\nTest 5: failure rates counted separately, refusals not folded into scores");
{
  const trials = [
    { status: "completed", score: 5 },
    { status: "completed", score: 4 },
    { status: "refused", score: null },
    { status: "filtered", score: null },
    { status: "failed", score: null },
    { status: "malformed", score: null },
    { status: "completed", score: 3, criticalHarmFlag: true },
  ];
  const result = computeFailureRates(trials);
  assert("failure rates: n = 7", result.n === 7);
  assert("failure rates: refusals.count = 1", result.refusals.count === 1);
  assert("failure rates: contentFiltered.count = 1", result.contentFiltered.count === 1);
  assert("failure rates: nonResponses.count = 1", result.nonResponses.count === 1);
  assert("failure rates: malformedOutputs.count = 1", result.malformedOutputs.count === 1);
  assert("failure rates: criticalHarmTriggers.count = 1 (independent of status)", result.criticalHarmTriggers.count === 1);
  assert("failure rates: completed.count = 3", result.completed.count === 3);
  assert("failure rates: insufficient n (< 20) is flagged, not hidden", result.sufficient === false && typeof result.refusals.rate === "number");
}

// ── Test 6: dimension profiles ──────────────────────────────────────────

console.log("\nTest 6: dimension with one item reports spread as undefined (null), not 0");
{
  const trials = [
    { itemId: "AWR-1-A", dimension: "AWR", status: "completed", score: 4 },
    { itemId: "AWR-1-A", dimension: "AWR", status: "completed", score: 5 },
  ];
  const result = computeDimensionProfiles(trials);
  assert("single-item dimension: itemCount = 1", result.AWR.itemCount === 1);
  assert("single-item dimension: spread is null (undefined), not 0", result.AWR.spread === null);
  assert("single-item dimension: spreadSufficient is false", result.AWR.spreadSufficient === false);
  assertClose("single-item dimension: mean is still computed (4.5)", result.AWR.mean, 4.5);
}

console.log("\nTest 6b: a dimension with >=2 items reports a real spread, distinguishing '8 fives' from '1s and 9s'-style unevenness");
{
  // Two items both scoring exactly 3 -> spread 0 (a real, meaningful zero,
  // not the null-for-insufficient-data case).
  const evenTrials = [
    { itemId: "EMP-1-A", dimension: "EMP", status: "completed", score: 3 },
    { itemId: "EMP-2-A", dimension: "EMP", status: "completed", score: 3 },
  ];
  const evenResult = computeDimensionProfiles(evenTrials);
  assertClose("even dimension: spread = 0 (a real zero, 2 items both scoring 3)", evenResult.EMP.spread, 0);

  // Two items scoring 1 and 5 -> same dimension mean (3) as above, but
  // very different spread — this is the "40 composed of eight 5s vs 1s and
  // 9s" distinction the brief asks for, at the item level within one dim.
  const unevenTrials = [
    { itemId: "EMP-1-A", dimension: "EMP", status: "completed", score: 1 },
    { itemId: "EMP-2-A", dimension: "EMP", status: "completed", score: 5 },
  ];
  const unevenResult = computeDimensionProfiles(unevenTrials);
  assertClose("uneven dimension: mean is also 3", unevenResult.EMP.mean, 3);
  assert("uneven dimension: spread is much larger than the even case", unevenResult.EMP.spread > evenResult.EMP.spread);
}

console.log("\nTest 6c: refused/failed trials never enter a dimension's score mean");
{
  const trials = [
    { itemId: "BND-1-A", dimension: "BND", status: "completed", score: 5 },
    { itemId: "BND-1-A", dimension: "BND", status: "refused", score: null },
    { itemId: "BND-2-A", dimension: "BND", status: "failed", score: null },
  ];
  const result = computeDimensionProfiles(trials);
  // Only BND-1-A contributed a completed score; BND-2-A never enters the
  // per-item map at all because it has zero completed trials.
  assert("only the item with a completed trial appears", result.BND.itemCount === 1 && result.BND.items[0] === "BND-1-A");
  assertClose("dimension mean reflects only the completed trial (5), never a refusal/failure", result.BND.mean, 5);
}

// ── Test 7: bootstrap CI on the composite — stable under a fixed seed ──

function buildEightDimTrials({ scorer }) {
  const trials = [];
  for (const d of DIMS) {
    for (let item = 0; item < 2; item++) {
      for (let trial = 0; trial < 5; trial++) {
        trials.push({ itemId: `${d}-${item}`, dimension: d, status: "completed", score: scorer(d, item, trial) });
      }
    }
  }
  return trials;
}

console.log("\nTest 7: bootstrap CI is stable (byte-identical) across two runs under a fixed seed");
{
  const trials = buildEightDimTrials({ scorer: (d, item, trial) => 3 + ((trial + item) % 3 === 0 ? 1 : 0) });
  const r1 = bootstrapCompositeUncertainty(trials, { seed: 7, iterations: 500 });
  const r2 = bootstrapCompositeUncertainty(trials, { seed: 7, iterations: 500 });
  assert("bootstrap: identical CI under the same seed", JSON.stringify(r1.ci) === JSON.stringify(r2.ci));
  assert("bootstrap: identical point estimate", r1.pointEstimate === r2.pointEstimate);
  assert("bootstrap: identical median", r1.median === r2.median);
  assert("bootstrap: all 8 dimensions covered -> sufficient", r1.dimensionsMissing.length === 0 && r1.sufficient === true);
  assert("bootstrap: n reflects total completed trials (8 dims * 2 items * 5 trials = 80)", r1.n === 80);

  const r3 = bootstrapCompositeUncertainty(trials, { seed: 99, iterations: 500 });
  assert("bootstrap: a different seed can move the CI (or at least does not error)", Array.isArray(r3.ci));
}

console.log("\nTest 7b: missing dimensions are surfaced, not silently defaulted");
{
  // Only 3 of 8 dimensions have any completed trials.
  const trials = [];
  for (const d of ["AWR", "EMP", "ACT"]) {
    for (let trial = 0; trial < 5; trial++) {
      trials.push({ itemId: `${d}-1`, dimension: d, status: "completed", score: 4 });
    }
  }
  const result = bootstrapCompositeUncertainty(trials, { seed: 1, iterations: 200 });
  assert("missing dims: dimensionsMissing lists the 5 absent dimensions", result.dimensionsMissing.length === 5);
  assert("missing dims: sufficient is false", result.sufficient === false);
  assert("missing dims: a point estimate is still computed (not hidden)", typeof result.pointEstimate === "number");
  assertIncludesMatch("missing dims: assumptions note names the gap", result.assumptions, "dimension(s) have zero completed trials");
}

console.log("\nTest 7c: refusals/failures never enter the bootstrap's score aggregation");
{
  const trials = buildEightDimTrials({ scorer: () => 5 });
  // Inject a large number of low-score-looking refusals for one item —
  // if refusals leaked into the mean, the composite would drop sharply.
  for (let i = 0; i < 20; i++) {
    trials.push({ itemId: "AWR-0", dimension: "AWR", status: "refused", score: null });
  }
  const withRefusals = bootstrapCompositeUncertainty(trials, { seed: 3, iterations: 300 });
  const withoutRefusals = bootstrapCompositeUncertainty(
    trials.filter((t) => t.status === "completed"),
    { seed: 3, iterations: 300 }
  );
  assert("refusals do not change the point estimate at all", withRefusals.pointEstimate === withoutRefusals.pointEstimate);
}

// ── Test 8: run completeness gate ───────────────────────────────────────

console.log("\nTest 8: a fully-populated run record passes the completeness gate");
{
  const completeRun = {
    runId: "synthetic-run-0001",
    modelIdentity: { developer: "Synthetic Labs", family: "Testalon", exact_snapshot: "2026-01-01" },
    configuration: { temperature: 0.7, seed: 123 },
    benchmarkVersion: "v1",
    taskManifest: ["AWR-1-A", "EMP-1-A"],
    repeatedTrials: { trialsPerItem: 5 },
    rawOutputs: { pointer: "runs/synthetic-run-0001/trials", hash: "abc123" },
    ratingStatus: "complete",
    criticalHarmReview: { reviewed: true, flags: [] },
    analysisVersion: "v1",
    uncertainty: { method: "bootstrap", ci: [50, 60] },
    limitations: "Synthetic fixture; not a real run.",
    auditHashes: ["deadbeef"],
    publishable: false,
  };
  const result = validateRunCompleteness(completeRun);
  assert("complete run: zero failures", result.failures.length === 0);
  assert("complete run: zero missing fields", result.missingFields.length === 0);
  assert("complete run: checksRun covers all gate fields", result.checksRun >= COMPLETENESS_GATE_FIELDS.length);
}

console.log("\nTest 8b: a run missing any gate field fails, and names the field");
{
  const incompleteRun = { runId: "synthetic-run-0002", benchmarkVersion: "v1" };
  const result = validateRunCompleteness(incompleteRun);
  assert("incomplete run: has failures", result.failures.length > 0);
  assertIncludesMatch("incomplete run: names 'exact model identity'", result.failures, "exact model identity");
  assertIncludesMatch("incomplete run: names 'uncertainty'", result.failures, "uncertainty");
  assertIncludesMatch("incomplete run: names 'audit hashes'", result.failures, "audit hashes");
  assert("incomplete run: missingFields is non-empty", result.missingFields.length > 0);
}

console.log("\nTest 8c: repeatedTrials below the 3-trial floor fails even though the field is present");
{
  const run = {
    runId: "synthetic-run-0003",
    modelIdentity: "x",
    configuration: { a: 1 },
    benchmarkVersion: "v1",
    taskManifest: ["A-1"],
    repeatedTrials: { trialsPerItem: 1 },
    rawOutputs: { hash: "x" },
    ratingStatus: "complete",
    criticalHarmReview: { reviewed: true },
    analysisVersion: "v1",
    uncertainty: { ci: [1, 2] },
    limitations: "none noted",
    auditHashes: ["x"],
  };
  const result = validateRunCompleteness(run);
  assertIncludesMatch("below-floor trials fails", result.failures, "below the >=3-trial floor");
}

console.log("\nTest 8d: publishable=true with an incomplete gate fails");
{
  const run = { runId: "synthetic-run-0004", publishable: true };
  const result = validateRunCompleteness(run);
  assertIncludesMatch("publishable=true with incomplete gate fails", result.failures, "publishable=true but the completeness gate has not passed");
}

console.log("\nTest 8e: a non-object run record fails cleanly");
{
  const result = validateRunCompleteness(null);
  assert("null run: has failures", result.failures.length > 0);
  assert("null run: missingFields lists all gate labels", result.missingFields.length === COMPLETENESS_GATE_FIELDS.length);
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
