/**
 * evaluation-statistics.mjs — CB-MODEL Phase 1 Item 5: the statistical
 * layer for evaluation runs. Pure library, no I/O, no process.exit, Node
 * built-ins only — mirrors the house pattern of task-bank-validator.mjs and
 * model-registry-validator.mjs: one canonical implementation shared
 * unchanged by the CLI (validate-evaluation-run.mjs) and the fixture tests
 * (test-evaluation-statistics.mjs), so "what ships" and "what is tested"
 * cannot drift.
 *
 * ── Why this file exists ─────────────────────────────────────────────────
 * docs/MODEL_EVALUATION_HARNESS_DESIGN.md: "Variance across repeated trials
 * is a measured property, not noise to average away." A composite score
 * with no uncertainty, no rater-agreement statistic, and no failure-rate
 * accounting is a number with no error bar. This module computes those
 * things from a set of trial/rating records. It never calls a model API,
 * never reads a file, and never invents a run — every function here takes
 * data as an argument and returns a plain object.
 *
 * ── Data model this module expects ───────────────────────────────────────
 * A "trial" record (one attempt at one item):
 *   { itemId: string, dimension: string, trialIndex: number,
 *     status: "completed" | "refused" | "filtered" | "failed" | "malformed",
 *     score: number | null,          // 1-5, ONLY meaningful when status === "completed"
 *     criticalHarmFlag?: boolean }   // a harm_screen determination, independent of status/score
 *
 * A "rating" record (one rater's score for one unit — used for inter-rater
 * agreement only, deliberately a separate shape from "trial" because
 * agreement is a property of independent HUMAN raters scoring the same
 * unit, not of repeated model trials):
 *   { unitId: string, raterId: string, value: number | null | undefined }
 *   // value === null/undefined means "this rater did not rate this unit" —
 *   // a real missing value, never coerced to 0 or dropped silently from n.
 *
 * ── The single most important property of this module ───────────────────
 * Every statistic returned by this file carries `n` (the count it rests
 * on) and `sufficient: boolean` (whether n clears a stated, named
 * threshold) plus the `threshold` itself. A statistic computed from too
 * little data is still computed — hiding the number is its own kind of
 * dishonesty — but it is never allowed to look identical to a
 * well-supported one. Callers (the CLI, any future page) must check
 * `sufficient` before treating a value as reportable without a caveat.
 *
 * ── Refusals are not low scores ──────────────────────────────────────────
 * Every function that computes a mean/variance over scores (
 * computeItemTrialVariance, computeDimensionProfiles,
 * bootstrapCompositeUncertainty) filters to `status === "completed"` first.
 * A refusal, a content-filter block, a network failure, or a malformed
 * response never enters a score aggregate — it only ever appears in
 * computeFailureRates.
 */

import { computeCompositeFromDimensions, DIMENSION_CODES } from "./scoring.mjs";

// ─────────────────────────────────────────────────────────────────────────
// Seeded PRNG
// ─────────────────────────────────────────────────────────────────────────
//
// mulberry32 — a tiny, dependency-free, widely-used deterministic 32-bit
// generator. Chosen over Math.random() because every random draw in this
// file (bootstrap resampling; and, in the test file, synthetic "chance
// agreement" fixtures) must be exactly reproducible from a stated seed. It
// is NOT cryptographically secure and is not used for anything security
// sensitive — only for resampling and for generating clearly-labelled
// synthetic test data. No function in this module or its tests calls
// Math.random().
export function createSeededRng(seed) {
  let a = (seed >>> 0) || 1;
  return function rng() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ─────────────────────────────────────────────────────────────────────────
// Small numeric helpers — all "undefined-safe": fewer than 2 points means
// spread is undefined (null), never silently coerced to 0.
// ─────────────────────────────────────────────────────────────────────────

function finiteNumbers(values) {
  return (values ?? []).filter((v) => typeof v === "number" && Number.isFinite(v));
}

/** Arithmetic mean. Returns null (undefined) for an empty input — never 0. */
export function mean(values) {
  const xs = finiteNumbers(values);
  if (xs.length === 0) return null;
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

/**
 * Sample variance (Bessel-corrected, n-1 denominator). This is a set of
 * REPEATED MEASUREMENTS (trials, or item-means within a dimension) treated
 * as a sample drawn from a wider population of possible trials/items, which
 * is the standard justification for n-1 over population variance (n). This
 * is deliberately a different formula from scoring.mjs's population
 * variance over the 8 FIXED dimension scores (that variance describes a
 * complete, non-sampled set of exactly 8 values feeding the composite
 * formula, not a sample of a larger population — a different statistical
 * object with a different denominator by design, not an inconsistency).
 * Returns null — undefined, not 0 — when fewer than 2 points are given.
 */
export function sampleVariance(values) {
  const xs = finiteNumbers(values);
  if (xs.length < 2) return null;
  const m = mean(xs);
  return xs.reduce((a, b) => a + (b - m) ** 2, 0) / (xs.length - 1);
}

export function sampleStdDev(values) {
  const v = sampleVariance(values);
  return v === null ? null : Math.sqrt(v);
}

// ─────────────────────────────────────────────────────────────────────────
// Thresholds — named, exported, and each one commented with WHY. None of
// these come from an external standard; where no universal citation exists
// this says so rather than inventing one.
// ─────────────────────────────────────────────────────────────────────────

export const THRESHOLDS = {
  // 04-MODEL-EVALUATION-RUN floors trials_per_item at >= 3. Below that a
  // "variance" is arithmetically possible (n=2) but is not what the design
  // doc means by a usable per-item spread. 3 is the same floor, reused here
  // rather than inventing a second number.
  MIN_TRIALS_PER_ITEM_FOR_VARIANCE: 3,

  // A spread across items within a dimension needs at least 2 items to mean
  // anything at all — this is not a judgment-call threshold, it is the
  // literal minimum for "spread" to be a defined quantity.
  MIN_ITEMS_PER_DIMENSION_FOR_SPREAD: 2,

  // Design choice, not a cited standard: with fewer than 20 trials, a
  // single additional refusal/failure moves the rate by >=5 percentage
  // points, which is too coarse to report as a rate without a caveat.
  MIN_TRIALS_FOR_FAILURE_RATE: 20,

  // Design choice, not a cited standard: Krippendorff's own writing gives
  // no universal minimum-n rule for alpha. This project treats an alpha
  // computed from fewer than 30 doubly-rated units as too unstable to
  // report without a caveat — chosen as a conservative round number, not a
  // derived statistical bound. An alpha from 3 ratings is not an alpha
  // from 300, and this threshold is how that distinction is surfaced
  // mechanically rather than left to a reader's judgment.
  MIN_PAIRABLE_UNITS_FOR_ALPHA: 30,

  // Structural, not a judgment call: agreement is undefined for a unit
  // rated by fewer than 2 raters. Units below this are excluded from n
  // entirely, not counted and then discounted.
  MIN_RATERS_PER_UNIT: 2,

  DEFAULT_BOOTSTRAP_ITERATIONS: 2000,
  DEFAULT_CI_LEVEL: 0.95,
};

// ─────────────────────────────────────────────────────────────────────────
// 1. Trial-to-trial variance per item
// ─────────────────────────────────────────────────────────────────────────

/**
 * Per-item trial-to-trial statistics. An item whose score swings across
 * trials is surfaced here as a first-class value (mean, variance, stdDev,
 * range) — never averaged into silence.
 *
 * @param {Array<{itemId:string,status:string,score:number|null}>} trials
 * @returns {Record<string, object>} keyed by itemId
 */
export function computeItemTrialVariance(trials) {
  const byItem = new Map();
  for (const t of trials ?? []) {
    if (!t || typeof t.itemId !== "string") continue;
    if (!byItem.has(t.itemId)) byItem.set(t.itemId, []);
    byItem.get(t.itemId).push(t);
  }

  const items = {};
  for (const [itemId, ts] of byItem) {
    const completed = ts.filter((t) => t.status === "completed" && typeof t.score === "number" && Number.isFinite(t.score));
    const scores = completed.map((t) => t.score);
    const completedN = scores.length;
    const sufficient = completedN >= THRESHOLDS.MIN_TRIALS_PER_ITEM_FOR_VARIANCE;

    items[itemId] = {
      itemId,
      n: ts.length,
      completedN,
      mean: mean(scores),
      variance: sampleVariance(scores),
      stdDev: sampleStdDev(scores),
      range: completedN >= 2 ? Math.max(...scores) - Math.min(...scores) : null,
      sufficient,
      threshold: THRESHOLDS.MIN_TRIALS_PER_ITEM_FOR_VARIANCE,
      note:
        completedN < 2
          ? "fewer than 2 completed trials — variance/stdDev/range are undefined (null), not zero"
          : sufficient
            ? null
            : `${completedN} completed trial(s) — below the ${THRESHOLDS.MIN_TRIALS_PER_ITEM_FOR_VARIANCE}-trial floor (04-MODEL-EVALUATION-RUN); value computed but not sufficient`,
    };
  }
  return items;
}

// ─────────────────────────────────────────────────────────────────────────
// 2. Failure rates — refusals, non-responses, malformed outputs, and
//    critical-harm triggers, each counted separately. None of these are
//    folded into a score mean.
// ─────────────────────────────────────────────────────────────────────────

/**
 * @param {Array<{status:string, criticalHarmFlag?:boolean}>} trials
 */
export function computeFailureRates(trials) {
  const list = trials ?? [];
  const n = list.length;
  const counts = { refused: 0, filtered: 0, failed: 0, malformed: 0, completed: 0, criticalHarm: 0 };

  for (const t of list) {
    if (!t) continue;
    if (t.status === "refused") counts.refused++;
    else if (t.status === "filtered") counts.filtered++;
    else if (t.status === "failed") counts.failed++;
    else if (t.status === "malformed") counts.malformed++;
    else if (t.status === "completed") counts.completed++;
    if (t.criticalHarmFlag === true) counts.criticalHarm++;
  }

  const rate = (c) => (n > 0 ? c / n : null);
  const sufficient = n >= THRESHOLDS.MIN_TRIALS_FOR_FAILURE_RATE;

  return {
    n,
    completed: { count: counts.completed, rate: rate(counts.completed) },
    // "refusals" — the model itself declined to answer.
    refusals: { count: counts.refused, rate: rate(counts.refused) },
    // "non-responses" — provider-side content filter block or a hard
    // execution failure (timeout/network/server error) with no text
    // returned at all. Kept distinct from a model-authored refusal because
    // they indicate different things (a moderation layer vs. an outage).
    contentFiltered: { count: counts.filtered, rate: rate(counts.filtered) },
    nonResponses: { count: counts.failed, rate: rate(counts.failed) },
    // "malformed outputs" — a response was returned but could not be
    // parsed/extracted into the expected shape.
    malformedOutputs: { count: counts.malformed, rate: rate(counts.malformed) },
    // "critical-harm triggers" — a harm_screen determination, tracked
    // independently of status: a `completed` trial (with a normal 1-5
    // score) can still trip a critical-harm flag, and a `refused` trial can
    // also be the correct, harm-avoiding response. Conflating this with the
    // score would be exactly the mistake the design doc warns against.
    criticalHarmTriggers: { count: counts.criticalHarm, rate: rate(counts.criticalHarm) },
    sufficient,
    threshold: THRESHOLDS.MIN_TRIALS_FOR_FAILURE_RATE,
    note: `Rates rest on n=${n} trials (threshold for a stable rate: ${THRESHOLDS.MIN_TRIALS_FOR_FAILURE_RATE}). Categories are independent, not mutually exclusive with criticalHarmTriggers, and none of them are ever included in a score mean — see computeItemTrialVariance / computeDimensionProfiles, which only use status === "completed" trials.`,
  };
}

// ─────────────────────────────────────────────────────────────────────────
// 3. Dimension profiles — per-dimension mean, spread, and item count.
// ─────────────────────────────────────────────────────────────────────────

/**
 * @param {Array<{itemId:string, dimension:string, status:string, score:number|null}>} trials
 */
export function computeDimensionProfiles(trials) {
  const byItem = new Map();
  for (const t of trials ?? []) {
    if (!t || t.status !== "completed" || typeof t.score !== "number" || !Number.isFinite(t.score)) continue;
    if (!byItem.has(t.itemId)) byItem.set(t.itemId, { dimension: t.dimension, scores: [] });
    byItem.get(t.itemId).scores.push(t.score);
  }

  const byDim = new Map();
  for (const [itemId, { dimension, scores }] of byItem) {
    if (!byDim.has(dimension)) byDim.set(dimension, []);
    byDim.get(dimension).push({ itemId, itemMean: mean(scores), n: scores.length });
  }

  const profiles = {};
  for (const [dim, items] of byDim) {
    const itemMeans = items.map((i) => i.itemMean);
    const spreadSufficient = items.length >= THRESHOLDS.MIN_ITEMS_PER_DIMENSION_FOR_SPREAD;
    profiles[dim] = {
      dimension: dim,
      itemCount: items.length,
      items: items.map((i) => i.itemId),
      n: items.reduce((a, i) => a + i.n, 0),
      mean: mean(itemMeans),
      // A dimension built from a single item has an UNDEFINED spread, not a
      // zero spread — a 0 would falsely claim perfect internal consistency
      // that a single data point cannot demonstrate either way.
      spread: itemMeans.length >= 2 ? sampleStdDev(itemMeans) : null,
      spreadSufficient,
      spreadThreshold: THRESHOLDS.MIN_ITEMS_PER_DIMENSION_FOR_SPREAD,
      note: spreadSufficient
        ? null
        : `${items.length} item(s) with completed trials — spread is undefined (null) below ${THRESHOLDS.MIN_ITEMS_PER_DIMENSION_FOR_SPREAD} items, so a "40 composed of eight 5s" cannot yet be distinguished from a "40 composed of 1s and 9s" on this dimension alone`,
    };
  }
  return profiles;
}

// ─────────────────────────────────────────────────────────────────────────
// 4. Inter-rater agreement — Krippendorff's alpha
// ─────────────────────────────────────────────────────────────────────────
//
// WHY Krippendorff's alpha, and what it cannot handle if you reach for a
// simpler statistic instead:
//   - It is the correct default for ORDINAL 1-5 rubric data (unlike plain
//     percent agreement or Cohen's kappa's usual nominal form, it can weight
//     a 1-vs-2 disagreement less than a 1-vs-5 disagreement via the ordinal
//     difference metric used below).
//   - It handles MISSING VALUES natively (a rater who did not rate a given
//     unit is simply absent from that unit's coincidence contribution,
//     rather than forcing an artificial pairwise-complete-cases subset).
//   - It generalises beyond exactly two raters, so it survives the design
//     moving from 2 to 3+ raters (adjudication) without a new formula.
// A simpler statistic — plain percent agreement, or two-rater-only Cohen's
// kappa — was rejected because percent agreement does not correct for
// chance and treats every disagreement as equally bad (no ordinal weighting), and
// Cohen's kappa is defined for exactly two raters and does not extend to
// adjudicated three-rater cases without a different formula. Neither
// handles missing data as a first-class case.
//
// This implementation follows the standard coincidence-matrix formulation
// (Krippendorff, "Computing Krippendorff's Alpha-Reliability", 2011):
//   alpha = 1 - Do/De
//   Do = (1/n) * sum_{c,k} o_ck * delta^2(c,k)
//   De = (1/(n(n-1))) * sum_{c,k} n_c * n_k * delta^2(c,k)
// where o_ck is the pairable-value coincidence matrix (each unit with m
// raters contributes 1/(m-1) to every ordered pair of its values), n_c is
// the marginal count of category c across all pairable values, and
// delta^2 is the ORDINAL difference metric:
//   delta^2_ordinal(c,k) = ( sum_{g=c..k} n_g  -  (n_c + n_k)/2 )^2

function ordinalDeltaSquared(c, k, categoryCounts) {
  if (c === k) return 0;
  const lo = Math.min(c, k);
  const hi = Math.max(c, k);
  let sumBetween = 0;
  for (const [g, cnt] of categoryCounts) {
    if (g >= lo && g <= hi) sumBetween += cnt;
  }
  const half = ((categoryCounts.get(c) ?? 0) + (categoryCounts.get(k) ?? 0)) / 2;
  const d = sumBetween - half;
  return d * d;
}

function nominalDeltaSquared(c, k) {
  return c === k ? 0 : 1;
}

/**
 * @param {Array<{unitId:string, raterId:string, value:number|null|undefined}>} ratings
 * @param {{metric?: "ordinal"|"nominal"}} [opts]
 */
export function krippendorffAlpha(ratings, opts = {}) {
  const metric = opts.metric ?? "ordinal";
  const delta2 = metric === "nominal" ? (c, k, counts) => nominalDeltaSquared(c, k) : ordinalDeltaSquared;

  const byUnit = new Map();
  for (const r of ratings ?? []) {
    if (!r || typeof r.unitId !== "string") continue;
    if (r.value === null || r.value === undefined) continue; // a real absence, not a zero
    if (!byUnit.has(r.unitId)) byUnit.set(r.unitId, []);
    byUnit.get(r.unitId).push(r.value);
  }

  const totalUnits = byUnit.size;
  const pairableUnits = [...byUnit.values()].filter((vs) => vs.length >= THRESHOLDS.MIN_RATERS_PER_UNIT);

  const categoryCounts = new Map();
  let n = 0;
  for (const vs of pairableUnits) {
    for (const v of vs) {
      categoryCounts.set(v, (categoryCounts.get(v) ?? 0) + 1);
      n += 1;
    }
  }
  const categories = [...categoryCounts.keys()].sort((a, b) => a - b);

  let sumODelta = 0;
  for (const vs of pairableUnits) {
    const m = vs.length;
    const w = 1 / (m - 1);
    for (let i = 0; i < m; i++) {
      for (let j = 0; j < m; j++) {
        if (i === j) continue;
        sumODelta += w * delta2(vs[i], vs[j], categoryCounts);
      }
    }
  }
  const Do = n > 0 ? sumODelta / n : null;

  let sumNNDelta = 0;
  for (const c of categories) {
    for (const k of categories) {
      sumNNDelta += categoryCounts.get(c) * categoryCounts.get(k) * delta2(c, k, categoryCounts);
    }
  }
  const De = n > 1 ? sumNNDelta / (n * (n - 1)) : null;

  let alpha = null;
  let degenerate = false;
  if (Do !== null && De !== null) {
    if (De > 0) alpha = 1 - Do / De;
    else {
      // No variation at all in the pairable data (every rater gave the
      // same single category everywhere). Chance disagreement is zero,
      // observed disagreement is zero, and 0/0 is genuinely undefined —
      // Krippendorff's own guidance is that alpha is undefined here, not
      // that it defaults to 1. Reporting 1.0 would falsely claim measured
      // agreement beyond a total absence of the variation needed to
      // measure anything.
      degenerate = true;
    }
  }

  const sufficient = pairableUnits.length >= THRESHOLDS.MIN_PAIRABLE_UNITS_FOR_ALPHA;

  return {
    alpha,
    metric,
    n,
    unitsRated: totalUnits,
    pairableUnits: pairableUnits.length,
    sufficient,
    threshold: THRESHOLDS.MIN_PAIRABLE_UNITS_FOR_ALPHA,
    degenerate,
    note: degenerate
      ? `alpha is undefined (null): every pairable rating shares one category, so there is no variation to measure agreement against (n=${n} pairable ratings, ${pairableUnits.length} units).`
      : `alpha rests on n=${n} pairable ratings across ${pairableUnits.length} unit(s) rated by >=${THRESHOLDS.MIN_RATERS_PER_UNIT} rater(s) (of ${totalUnits} total rated units; units with a single rater cannot contribute to a disagreement statistic and are excluded from n). An alpha from ${pairableUnits.length} units is not an alpha from ${THRESHOLDS.MIN_PAIRABLE_UNITS_FOR_ALPHA}+ units — see sufficient.`,
  };
}

// ─────────────────────────────────────────────────────────────────────────
// 5. Uncertainty on the composite — nonparametric percentile bootstrap
// ─────────────────────────────────────────────────────────────────────────
//
// WHY bootstrap, not a normal-approximation CI, stated as the brief
// requires:
//   1. computeCompositeFromDimensions (scoring.mjs) is a NONLINEAR,
//      piecewise, clamped transform of the 8 dimension means:
//      consistencyMult and weaknessFactor are threshold functions of the
//      cross-dimension spread, and a harm flag (any dimension === 0) zeroes
//      the integration premium outright. There is no closed-form variance
//      for a transform like that; a delta-method or normal approximation
//      would require linearising it, which would misrepresent exactly the
//      thresholds and clamps that make the formula meaningful.
//   2. Trial counts are SMALL by design (T=5 in the harness design's first
//      wave, floor of 3). A normal approximation for the sampling
//      distribution of a mean of 3-5 values is not reliable — the
//      bootstrap makes no distributional assumption at all.
//   3. Items are NOT independent draws from a larger item population — the
//      33/128-item form is enumerated by design, not sampled. So this
//      function resamples TRIALS WITHIN each item (the genuine repeated-
//      measurement / trial-to-trial noise the design doc calls out) and
//      holds the item set itself fixed. It is therefore a measure of
//      TRIAL-LEVEL uncertainty only — not item-selection uncertainty, and
//      not rater uncertainty (that is krippendorffAlpha's job).
//
// @param {Array<{itemId:string, dimension:string, status:string, score:number|null}>} trials
// @param {{seed?:number, iterations?:number, ciLevel?:number}} [opts]
export function bootstrapCompositeUncertainty(trials, opts = {}) {
  const seed = opts.seed ?? 1;
  const iterations = opts.iterations ?? THRESHOLDS.DEFAULT_BOOTSTRAP_ITERATIONS;
  const ciLevel = opts.ciLevel ?? THRESHOLDS.DEFAULT_CI_LEVEL;
  const rng = createSeededRng(seed);

  const byItem = new Map();
  for (const t of trials ?? []) {
    if (!t || t.status !== "completed" || typeof t.score !== "number" || !Number.isFinite(t.score)) continue;
    if (!byItem.has(t.itemId)) byItem.set(t.itemId, { dimension: t.dimension, scores: [] });
    byItem.get(t.itemId).scores.push(t.score);
  }
  const items = [...byItem.entries()].map(([itemId, v]) => ({ itemId, dimension: v.dimension, scores: v.scores }));

  const dimensionsCovered = [...new Set(items.map((i) => i.dimension))].sort();
  const dimensionsMissing = DIMENSION_CODES.filter((d) => !dimensionsCovered.includes(d));
  const totalCompletedTrials = items.reduce((a, i) => a + i.scores.length, 0);
  const minTrialsAcrossItems = items.length > 0 ? Math.min(...items.map((i) => i.scores.length)) : 0;

  function dimensionMeansFrom(itemMeans) {
    const byDim = new Map();
    for (const { dimension, m } of itemMeans) {
      if (!byDim.has(dimension)) byDim.set(dimension, []);
      byDim.get(dimension).push(m);
    }
    const dimScores = {};
    for (const [dim, ms] of byDim) dimScores[dim] = mean(ms);
    return dimScores;
  }

  const pointItemMeans = items.map((i) => ({ dimension: i.dimension, m: mean(i.scores) }));
  const pointDimScores = dimensionMeansFrom(pointItemMeans);
  const pointEstimate = items.length > 0 ? computeCompositeFromDimensions(pointDimScores).composite : null;

  const composites = [];
  if (items.length > 0) {
    for (let b = 0; b < iterations; b++) {
      const resampledItemMeans = items.map((i) => {
        const n = i.scores.length;
        let s = 0;
        for (let k = 0; k < n; k++) {
          const idx = Math.floor(rng() * n);
          s += i.scores[Math.min(idx, n - 1)];
        }
        return { dimension: i.dimension, m: s / n };
      });
      const dimScores = dimensionMeansFrom(resampledItemMeans);
      composites.push(computeCompositeFromDimensions(dimScores).composite);
    }
    composites.sort((a, b) => a - b);
  }

  const lowerP = (1 - ciLevel) / 2;
  const upperP = 1 - lowerP;
  const percentileIndex = (p) => Math.min(composites.length - 1, Math.max(0, Math.round(p * (composites.length - 1))));
  const ci = composites.length > 0 ? [composites[percentileIndex(lowerP)], composites[percentileIndex(upperP)]] : [null, null];
  const median = composites.length > 0 ? composites[percentileIndex(0.5)] : null;

  const sufficient = items.length > 0 && dimensionsMissing.length === 0 && minTrialsAcrossItems >= THRESHOLDS.MIN_TRIALS_PER_ITEM_FOR_VARIANCE;

  return {
    pointEstimate,
    ci,
    median,
    iterations,
    seed,
    ciLevel,
    n: totalCompletedTrials,
    itemsUsed: items.length,
    dimensionsCovered,
    dimensionsMissing,
    minTrialsAcrossItems,
    sufficient,
    threshold: THRESHOLDS.MIN_TRIALS_PER_ITEM_FOR_VARIANCE,
    method: "nonparametric percentile bootstrap; resamples trials WITH replacement within each item, holds the item set fixed, aggregates to dimension means, then applies the unmodified scoring.mjs composite formula per replicate",
    assumptions: [
      "Trials within an item are treated as exchangeable draws of the model's response to that exact item — only trial-to-trial noise is resampled, never which items exist (the item set is enumerated by design, not sampled from a larger population).",
      "A normal-approximation CI was rejected: with trial counts as low as 3-5, the sampling distribution of a per-item mean is not reliably Gaussian, and computeCompositeFromDimensions is a nonlinear, piecewise, clamped transform (consistencyMult/weaknessFactor are threshold functions of cross-dimension spread; a harm flag zeroes the integration premium outright). A percentile bootstrap propagates that nonlinearity without assuming a distributional shape.",
      "This interval reflects TRIAL-level (repeated-measurement) uncertainty only. It does not reflect item-selection uncertainty or rater uncertainty — see krippendorffAlpha for the latter.",
      dimensionsMissing.length > 0
        ? `${dimensionsMissing.length} dimension(s) have zero completed trials in this data (${dimensionsMissing.join(", ")}). computeCompositeFromDimensions silently defaults an absent dimension to score 1 (its documented, unmodified behavior) — this function does not change that, but surfaces the gap via dimensionsMissing/sufficient=false so a silently-defaulted composite is never mistaken for a complete one.`
        : "All 8 dimensions have at least one completed trial contributing to this estimate.",
    ],
  };
}

// ─────────────────────────────────────────────────────────────────────────
// 6. Run statistical completeness — the 00-MASTER-CONDUCTOR quality gate
// ─────────────────────────────────────────────────────────────────────────
//
// Per .benchmark-ops/EVALUATION_LEDGER.md's "Gate" schema group / 00's
// quality gates: "A run missing any of: exact model identity,
// configuration, benchmark version, task manifest, repeated trials, raw
// outputs, rating status, critical-harm review, analysis version,
// uncertainty, limitations, audit hashes — is NOT complete."
//
// This validates a RUN RECORD — the shape a rating/analysis layer would
// eventually produce once a harness (docs/MODEL_EVALUATION_HARNESS_DESIGN.md
// Phase A/C) and a rating workspace (Phase E) exist. Neither exists yet
// (0 runs — see EVALUATION_LEDGER.md), so this function defines the
// contract those future programs must satisfy rather than reading real
// data. validate-evaluation-run.mjs calls this against whatever run
// records exist on disk (today: none) and never fabricates one to
// demonstrate it.

export const COMPLETENESS_GATE_FIELDS = [
  { key: "modelIdentity", label: "exact model identity" },
  { key: "configuration", label: "configuration" },
  { key: "benchmarkVersion", label: "benchmark version" },
  { key: "taskManifest", label: "task manifest" },
  { key: "repeatedTrials", label: "repeated trials" },
  { key: "rawOutputs", label: "raw outputs" },
  { key: "ratingStatus", label: "rating status" },
  { key: "criticalHarmReview", label: "critical-harm review" },
  { key: "analysisVersion", label: "analysis version" },
  { key: "uncertainty", label: "uncertainty" },
  { key: "limitations", label: "limitations" },
  { key: "auditHashes", label: "audit hashes" },
];

function isRecorded(value) {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim() !== "";
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "number") return Number.isFinite(value);
  if (typeof value === "boolean") return true;
  if (typeof value === "object") return Object.keys(value).length > 0;
  return true;
}

/**
 * @param {Record<string, unknown>} run a proposed run-completeness record
 * @returns {{failures: string[], warnings: string[], checksRun: number, missingFields: string[]}}
 */
export function validateRunCompleteness(run) {
  const failures = [];
  const warnings = [];
  const missingFields = [];
  let checksRun = 0;

  if (!run || typeof run !== "object") {
    failures.push("Run record is not an object");
    return { failures, warnings, checksRun: 1, missingFields: COMPLETENESS_GATE_FIELDS.map((f) => f.label) };
  }

  const runLabel = typeof run.runId === "string" && run.runId ? run.runId : "(unlabelled run)";

  for (const { key, label } of COMPLETENESS_GATE_FIELDS) {
    checksRun++;
    if (!isRecorded(run[key])) {
      failures.push(`Run "${runLabel}": missing "${label}" (field "${key}") — 00-MASTER-CONDUCTOR completeness gate blocks publication of an incomplete run`);
      missingFields.push(label);
    }
  }

  // repeatedTrials must actually clear the >=3 floor, not merely be present.
  checksRun++;
  if (isRecorded(run.repeatedTrials)) {
    const t = typeof run.repeatedTrials === "number" ? run.repeatedTrials : run.repeatedTrials?.trialsPerItem;
    if (typeof t === "number" && t < THRESHOLDS.MIN_TRIALS_PER_ITEM_FOR_VARIANCE) {
      failures.push(`Run "${runLabel}": repeatedTrials=${t} is below the >=${THRESHOLDS.MIN_TRIALS_PER_ITEM_FOR_VARIANCE}-trial floor required by 04-MODEL-EVALUATION-RUN`);
    }
  }

  // publishable must never be true ahead of the gate actually passing.
  checksRun++;
  if (run.publishable === true && (failures.length > 0 || missingFields.length > 0)) {
    failures.push(`Run "${runLabel}": publishable=true but the completeness gate has not passed — publishable must be false until completeness AND PUBLICATION_LEDGER.md authorisation are both satisfied`);
  }

  return { failures, warnings, checksRun, missingFields };
}
