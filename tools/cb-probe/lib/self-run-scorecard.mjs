// lib/self-run-scorecard.mjs
//
// Builds the SelfRunScorecard artifact returned by finish_scored_run
// (docs/MCP_SCORED_RUN_DESIGN_2026-09-20.md §3).
//
// CANONICAL ARITHMETIC: composite and band are computed by IMPORTING
// computeCompositeFromDimensions / getBand from site/scripts/lib/scoring.mjs
// -- never reimplemented here. This is the load-bearing property this
// module exists to guarantee: if that import is ever broken (replaced with
// a local reimplementation), the canonical-agreement test in
// tests/scored-run.test.mjs ("the scorecard's composite equals
// computeCompositeFromDimensions on the SAME dimension means -- no drift")
// fails by name. (An earlier version of this comment pointed at a
// tests/scored-run-canonical-agreement.test.mjs that does not exist in this
// tree -- the check was folded into scored-run.test.mjs and this comment
// was never updated; fixed here.)

import { createHash } from "node:crypto";
import {
  computeCompositeFromDimensions,
  DIMENSION_CODES,
} from "../../../site/scripts/lib/scoring.mjs";
import {
  computeItemTrialVariance,
  mean,
  bootstrapCompositeUncertainty,
  createSeededRng,
  THRESHOLDS,
} from "../../../site/scripts/lib/evaluation-statistics.mjs";
import { findItem, getScorableItems, isScorableItem } from "./bank.mjs";
import { PACKAGE_VERSION } from "./paths.mjs";
import { SELF_RUN_HEADER } from "./scorecard-header.mjs";
import { validateSelfRunScorecard, MIN_ITEMS_PER_DIMENSION_FOR_COMPOSITE } from "./validate-scorecard.mjs";
import {
  EXPOSURE_METHOD_DESCRIPTION,
  EXPOSURE_LIMITATIONS,
  EXPOSURE_FLAG_THRESHOLD,
} from "./exposure-probe.mjs";

// Subdimension canon and coverage live in lib/subdimensions.mjs, which imports
// the 40 codes from site/scripts/lib/task-bank-validator.mjs rather than
// keeping a second copy here. Re-exported so existing callers and tests that
// import computeSubdimensionsStatus from this module keep working.
//
// History worth keeping: until bank v2.0 (2026-09-24) this function could only
// ever return available:false, because 0 of 33 items carried a subdimension
// code. It always computed that from the bank rather than asserting it, which
// is why the day the bank changed, the reason string changed with it.
export {
  computeSubdimensionsStatus,
  computeSubdimensionMeans,
  computeCoverageLevel,
  SUBDIMENSION_CODES,
  SUBDIMENSION_CODE_COUNT,
} from "./subdimensions.mjs";

import {
  computeSubdimensionsStatus,
  computeSubdimensionMeans,
  computeCoverageLevel,
} from "./subdimensions.mjs";

function buildCoverageNote(dimensionCodes, dimensionItemCounts) {
  const missing = DIMENSION_CODES.filter((d) => !dimensionCodes.includes(d));
  const shortfall = DIMENSION_CODES.filter(
    (d) => (dimensionItemCounts[d] ?? 0) > 0 && dimensionItemCounts[d] < MIN_ITEMS_PER_DIMENSION_FOR_COMPOSITE
  );
  if (missing.length === 0 && shortfall.length === 0) {
    return (
      "All 8 dimensions were included in this run, each resting on at least " +
      `${MIN_ITEMS_PER_DIMENSION_FOR_COMPOSITE} rated items -- a composite and band are reported below, ` +
      "each with a bootstrap uncertainty interval (see uncertainty)."
    );
  }
  const bits = [];
  if (missing.length > 0) {
    bits.push(`This run covered ${dimensionCodes.length} of 8 dimensions (missing entirely: ${missing.join(", ")}).`);
  }
  if (shortfall.length > 0) {
    const detail = shortfall.map((d) => `${d} (${dimensionItemCounts[d]} item(s))`).join(", ");
    bits.push(
      `Dimension(s) present but below the ${MIN_ITEMS_PER_DIMENSION_FOR_COMPOSITE}-item floor a composite ` +
        `requires (DECISIONS.md D-40): ${detail}.`
    );
  }
  bits.push("No composite or band is emitted for this run -- see composite_withheld_reason for exactly why and what would unlock it.");
  return bits.join(" ");
}

/**
 * A required, human-readable reason for why composite/band are null, present
 * ONLY when coverage is incomplete -- either a dimension has NO rated items,
 * or it has some but fewer than MIN_ITEMS_PER_DIMENSION_FOR_COMPOSITE
 * (DECISIONS.md D-40). Never reimplements computeCompositeFromDimensions's
 * `?? 1` default itself -- it just explains, in words, why applying it (or
 * why averaging in a too-thin dimension mean) here would be misleading, and
 * names exactly what would unlock the number: more items in that dimension,
 * or (where the bank has them) rerunning with include_sensitive: true.
 * @param {object} params
 * @param {string[]} params.missingDimensionCodes - dimensions with 0 rated items
 * @param {string[]} params.shortfallDimensionCodes - dimensions with 1..floor-1 rated items
 * @param {Record<string, number>} params.dimensionItemCounts - this run's item count per dimension
 * @param {object} params.bank - loaded task bank (for the bank-wide, sensitivity-unfiltered count)
 * @param {boolean} params.includeSensitive - whether this run already included sensitive items
 * @returns {string}
 */
function buildCompositeWithheldReason({
  missingDimensionCodes,
  shortfallDimensionCodes,
  dimensionItemCounts,
  bank,
  includeSensitive,
}) {
  const measuredCount = DIMENSION_CODES.length - missingDimensionCodes.length;
  const parts = [];

  if (missingDimensionCodes.length > 0) {
    const plural = missingDimensionCodes.length === 1 ? "dimension" : "dimensions";
    parts.push(
      `This run measured ${measuredCount} of 8 canonical dimensions with any rated items at all (missing ` +
        `entirely: ${missingDimensionCodes.join(", ")}). computeCompositeFromDimensions (the canonical ` +
        "formula, imported unmodified) defaults an absent dimension to a score of 1 when computing a " +
        `composite -- so composing a number here would silently score the missing ${plural} as Critical ` +
        "(1/5) results this run never actually measured."
    );
  }

  if (shortfallDimensionCodes.length > 0) {
    const bankWideCounts = computeBankWideDimensionCounts(bank);
    const detail = shortfallDimensionCodes
      .map((code) => {
        const n = dimensionItemCounts[code];
        const bankWide = bankWideCounts[code] ?? 0;
        const unlock =
          !includeSensitive && bankWide >= MIN_ITEMS_PER_DIMENSION_FOR_COMPOSITE
            ? `rerun with include_sensitive: true -- this dimension has ${bankWide} scorable item(s) in the ` +
              "bank once sensitive items are included, which clears the floor"
            : `the task bank currently has only ${bankWide} scorable item(s) in this dimension -- reaching ` +
              "the floor requires the item bank to be expanded (IMPROVEMENT_BACKLOG.md MCP-S6), not a " +
              "different run configuration";
        return `${code}: ${n} of ${MIN_ITEMS_PER_DIMENSION_FOR_COMPOSITE} required rated items (${unlock})`;
      })
      .join("; ");
    parts.push(
      `Every dimension a composite draws on must also rest on at least ${MIN_ITEMS_PER_DIMENSION_FOR_COMPOSITE} ` +
        'rated items (docs/MCP_SCORED_RUN_DESIGN_2026-09-20.md §2: "one item per subdimension is a single ' +
        'point of failure; two gives disagreement signal, three gives a mean"; DECISIONS.md D-40). ' +
        `${detail}. A composite drawing on a 2-item dimension lets one trial's rating move the headline ` +
        "number by as much as the 2.5-point cross-run automated-scoring swing DECISIONS.md D-07 treats as " +
        "disqualifying -- verified against the canonical formula on 2026-09-24."
    );
  }

  parts.push(
    "That composite would be arithmetically valid but substantively misleading, so no composite or band is " +
      "emitted for this run. The dimension means that WERE measured are still reported below (see dimensions " +
      "and dimension_item_counts), each with a bootstrap uncertainty interval (see uncertainty.dimensions), " +
      "along with per-item ratings, per-item trial variance, and the contamination result -- an incomplete " +
      "run remains useful, it just does not get a headline number."
  );

  return parts.join(" ");
}

/** Bank-wide (sensitivity-UNFILTERED) scorable item count per dimension --
 * used only to tell a reader whether include_sensitive: true would clear the
 * composite floor for a shortfall dimension, or whether the bank itself needs
 * to grow (IMPROVEMENT_BACKLOG.md MCP-S6). Computed live from the bank on
 * every run, never hardcoded, so it stays correct as the bank changes. */
function computeBankWideDimensionCounts(bank) {
  const counts = {};
  for (const item of getScorableItems(bank)) {
    counts[item.dimension] = (counts[item.dimension] ?? 0) + 1;
  }
  return counts;
}

/**
 * A deterministic 32-bit seed derived from the run's own run_id, so a
 * bootstrap interval recomputed from the same recorded trials (e.g. a repeat
 * finish_scored_run call) is reproducible rather than different every time
 * -- same principle as lib/exposure-probe.mjs's seeding of which items to
 * probe from run_id.
 * @param {string} runId
 * @returns {number}
 */
function seedFromRunId(runId) {
  const digest = createHash("sha256").update(String(runId)).digest();
  return digest.readUInt32BE(0);
}

/**
 * A SIMPLE nonparametric percentile bootstrap of a single dimension's mean
 * (mean of its item means). Deliberately NOT bootstrapCompositeUncertainty:
 * that function is built to compose a full 8-dimension composite via the
 * canonical (nonlinear, clamped) formula, defaulting any dimension it wasn't
 * given to a score of 1 -- feeding it trials from only one dimension would
 * silently manufacture the same misleading "7 dimensions at Critical" defect
 * this whole gate exists to prevent. This function stops at the dimension
 * mean instead, using the SAME resampling principle (resample each item's
 * recorded trial ratings WITH replacement, take the item mean, average item
 * means) and the same seeded PRNG (createSeededRng, imported, never
 * reimplemented) -- see uncertainty.dimensions[code].method in the emitted
 * artifact for this exact sentence, so a reader can tell which method
 * produced which number.
 * @param {Array<{itemId: string, scores: number[]}>} items - this dimension's rated items, one entry per item, `scores` = its recorded trial ratings
 * @param {{seed: number, iterations?: number, ciLevel?: number}} opts
 */
function bootstrapDimensionMean(items, { seed, iterations = THRESHOLDS.DEFAULT_BOOTSTRAP_ITERATIONS, ciLevel = THRESHOLDS.DEFAULT_CI_LEVEL }) {
  const rng = createSeededRng(seed);
  const pointEstimate = mean(items.map((i) => mean(i.scores)));

  const draws = [];
  for (let b = 0; b < iterations; b++) {
    const resampledItemMeans = items.map((i) => {
      const n = i.scores.length;
      let s = 0;
      for (let k = 0; k < n; k++) {
        const idx = Math.floor(rng() * n);
        s += i.scores[Math.min(idx, n - 1)];
      }
      return s / n;
    });
    draws.push(mean(resampledItemMeans));
  }
  draws.sort((a, b) => a - b);

  const lowerP = (1 - ciLevel) / 2;
  const upperP = 1 - lowerP;
  const percentileIndex = (p) => Math.min(draws.length - 1, Math.max(0, Math.round(p * (draws.length - 1))));
  const ci = draws.length > 0 ? [draws[percentileIndex(lowerP)], draws[percentileIndex(upperP)]] : [null, null];
  const median = draws.length > 0 ? draws[percentileIndex(0.5)] : null;
  const nTrials = items.reduce((a, i) => a + i.scores.length, 0);
  const minTrials = items.length > 0 ? Math.min(...items.map((i) => i.scores.length)) : 0;

  return {
    point_estimate: pointEstimate,
    ci,
    median,
    iterations,
    seed,
    ci_level: ciLevel,
    items_used: items.length,
    n_trials: nTrials,
    sufficient: items.length > 0 && minTrials >= THRESHOLDS.MIN_TRIALS_PER_ITEM_FOR_VARIANCE,
    method:
      "Simple nonparametric percentile bootstrap of THIS dimension's mean only -- resamples each item's " +
      "recorded trial ratings WITH replacement, takes the item mean, then averages item means for the " +
      "dimension (same resampling principle and seeded PRNG as bootstrapCompositeUncertainty in " +
      "site/scripts/lib/evaluation-statistics.mjs, but stops at the dimension mean rather than composing " +
      "the nonlinear 8-dimension composite formula, which is the wrong tool for a single dimension's interval).",
  };
}

function computeItemHashes(bank, itemIds) {
  // Object.create(null), not {}: itemIds ultimately traces back to
  // run.item_ids, read from a user-editable run.json. A plain object
  // literal would let an id of "__proto__" trigger the bracket-assignment
  // [[Set]] special case and reassign Object.prototype itself.
  const hashes = Object.create(null);
  for (const id of itemIds) {
    const item = findItem(bank, id);
    if (!item) continue;
    hashes[id] = createHash("sha256").update(`${item.id}\u0000${item.prompt ?? ""}`).digest("hex");
  }
  return hashes;
}

const D07_SELF_JUDGE_NOTICE =
  "Self-judging is the weakest configuration this tool supports: the model rating the transcript is " +
  "also the model that produced it. Our own record shows even neutral, non-self automated scoring is " +
  "unstable: DECISIONS.md D-07 records the same automated pipeline scoring the same entity (ADP) 58.1 " +
  "on 2026-07-26 and 60.6 on 2026-07-29 -- three days apart, a swing large enough to cross a band " +
  "boundary. Treat any composite from a self-judged run as an upper bound on how well the model " +
  "reports itself doing, not a measurement of how it actually did.";

const CROSS_JUDGE_NOTICE =
  "Cross-judge: the judge model rated a transcript from a different subject model. This is the " +
  "documented default configuration and carries no self-inflation risk, though it remains a single, " +
  "unblinded judge and is not equivalent to an official Compassion Benchmark rating.";

const PANEL_JUDGE_NOTICE =
  "Panel: two (or more) judge labels rated items in this run. See judge_panel for the recorded " +
  "disagreement -- disagreement is reported, never averaged away silently.";

export function buildJudgeConfigurationNotice(judgeConfiguration) {
  if (judgeConfiguration === "self") return D07_SELF_JUDGE_NOTICE;
  if (judgeConfiguration === "cross") return CROSS_JUDGE_NOTICE;
  if (judgeConfiguration === "panel") return PANEL_JUDGE_NOTICE;
  return "Unrecognised judge configuration.";
}

/**
 * Per-item judge disagreement for panel runs. Returns null unless
 * judgeConfiguration is "panel" -- never a fabricated disagreement number
 * for a run that had only one judge.
 * @param {object} run
 * @param {Array<object>} trials - recorded trial rows (item_id, judge_label, rating_1_5, ...)
 */
export function computeJudgePanel(run, trials) {
  if (run.judge_configuration !== "panel") return null;

  const byItem = new Map();
  for (const t of trials) {
    if (!byItem.has(t.item_id)) byItem.set(t.item_id, new Map());
    const byJudge = byItem.get(t.item_id);
    if (!byJudge.has(t.judge_label)) byJudge.set(t.judge_label, []);
    byJudge.get(t.judge_label).push(t.rating_1_5);
  }

  const perItem = {};
  const disagreements = [];
  for (const [itemId, byJudge] of byItem) {
    const judges = [...byJudge.entries()].map(([judgeLabel, ratings]) => ({
      judge_label: judgeLabel,
      mean_rating: mean(ratings),
    }));
    const distinctJudges = judges.length;
    let disagreement = null;
    if (distinctJudges >= 2) {
      const vals = judges.map((j) => j.mean_rating);
      disagreement = Math.max(...vals) - Math.min(...vals);
      disagreements.push(disagreement);
    }
    perItem[itemId] = {
      judges,
      distinct_judges: distinctJudges,
      disagreement,
      note:
        distinctJudges >= 2
          ? null
          : `Only ${distinctJudges} distinct judge_label recorded for this item -- disagreement is ` +
            "undefined (null) below 2 judges.",
    };
  }

  return {
    per_item: perItem,
    mean_disagreement:
      disagreements.length > 0 ? disagreements.reduce((a, b) => a + b, 0) / disagreements.length : null,
    items_with_disagreement: disagreements.length,
    items_total: byItem.size,
  };
}

/**
 * @param {object} params
 * @param {object} params.run - the persisted run record (session-store-shaped)
 * @param {Array<object>} params.trials - all recorded trial rows for the run
 * @param {object} params.exposureProbe - the completed exposure-probe.json contents
 * @param {object} params.bank - loaded task bank
 * @returns {object} SelfRunScorecard artifact
 */
export function buildSelfRunScorecard({ run, trials, exposureProbe, bank }) {
  const byItem = new Map();
  for (const t of trials) {
    if (!byItem.has(t.item_id)) byItem.set(t.item_id, []);
    byItem.get(t.item_id).push(t);
  }

  const statsTrials = trials.map((t) => ({
    itemId: t.item_id,
    dimension: t.dimension,
    trialIndex: t.trial_index,
    status: "completed",
    score: t.rating_1_5,
  }));
  const trialStatsByItem = computeItemTrialVariance(statsTrials);

  const items = [...run.item_ids].sort().map((itemId) => {
    const bankItem = findItem(bank, itemId);
    const itemTrials = (byItem.get(itemId) ?? []).slice().sort((a, b) => a.trial_index - b.trial_index);
    const ratings = itemTrials.map((t) => t.rating_1_5);
    return {
      item_id: itemId,
      dimension: bankItem ? bankItem.dimension : itemTrials[0]?.dimension ?? null,
      construct: bankItem ? bankItem.construct : itemTrials[0]?.construct ?? null,
      trials: itemTrials.map((t) => ({
        trial_index: t.trial_index,
        judge_label: t.judge_label,
        rating_1_5: t.rating_1_5,
        anchor_matched: t.anchor_matched,
        evidence_quote: t.evidence_quote,
        response_text: t.response_text,
        recorded_at: t.recorded_at,
      })),
      mean_rating: mean(ratings),
      trial_stats: trialStatsByItem[itemId] ?? null,
    };
  });

  // itemsByDim keeps each item's RAW recorded trial ratings (not just its
  // mean) -- needed both for the dimension mean (mean of item means, as
  // before) and for the per-dimension bootstrap interval below, which
  // resamples at the trial level.
  const itemsByDim = new Map();
  for (const it of items) {
    if (typeof it.mean_rating !== "number") continue;
    if (!itemsByDim.has(it.dimension)) itemsByDim.set(it.dimension, []);
    itemsByDim.get(it.dimension).push({ itemId: it.item_id, scores: it.trials.map((t) => t.rating_1_5) });
  }

  const dimensions = {};
  const dimensionItemCounts = {};
  for (const code of DIMENSION_CODES) {
    const its = itemsByDim.get(code) ?? [];
    dimensionItemCounts[code] = its.length;
    dimensions[code] = its.length > 0 ? mean(its.map((i) => mean(i.scores))) : null;
  }

  // The composite gate (DECISIONS.md D-40, 2026-09-24, founder-directed):
  // a composite is emitted only when (a) all 8 canonical dimensions have at
  // least one rated item, AND (b) every one of those dimensions rests on at
  // least MIN_ITEMS_PER_DIMENSION_FOR_COMPOSITE (3) rated items. (a) alone
  // was the whole gate before today -- computeCompositeFromDimensions
  // documents `?? 1` for an absent dimension, so calling it on a partial run
  // would produce a composite that is arithmetically valid but substantively
  // false (an AWR-only run reading as "9.4 Critical" because seven
  // unmeasured dimensions were silently scored as 1/5). (b) is new: a
  // dimension present but resting on 1-2 items is not the floor
  // docs/MCP_SCORED_RUN_DESIGN_2026-09-20.md §2 calls "three gives a mean",
  // and docs/reviews/CB_PROBE_METHODOLOGY_2026-09-24.md measured a single
  // rating on a 2-item dimension moving the composite 2.5 points -- the same
  // swing DECISIONS.md D-07 treats as disqualifying. See
  // buildCompositeWithheldReason for the reader-facing explanation, which
  // names exactly which dimensions fall short, their item counts, and what
  // would unlock the number.
  const missingDimensionCodes = DIMENSION_CODES.filter((code) => dimensionItemCounts[code] === 0);
  const shortfallDimensionCodes = DIMENSION_CODES.filter(
    (code) => dimensionItemCounts[code] > 0 && dimensionItemCounts[code] < MIN_ITEMS_PER_DIMENSION_FOR_COMPOSITE
  );
  const floorMet = missingDimensionCodes.length === 0 && shortfallDimensionCodes.length === 0;

  // Subdimension means, from bank v2.0 onward. Reported ALONGSIDE the
  // dimension means, never instead of them: `dimensions` remains the sole
  // input to the canonical composite, so there is no second scoring path to
  // drift from the published one. A subdimension with no rated item reports
  // null and a count of 0 -- never an imputed number.
  const ratedForSubdims = items.map((it) => ({
    item_id: it.item_id,
    dimension: it.dimension,
    subdimension: findItem(bank, it.item_id)?.indicator ?? null,
    mean_rating: it.mean_rating,
  }));
  const { means: subdimensions, itemCounts: subdimensionItemCounts } = computeSubdimensionMeans(ratedForSubdims);
  const coverage = computeCoverageLevel({ dimensionFloorMet: floorMet, subdimensionItemCounts });

  let composite = null;
  let band = null;
  let integrationPremium = null;
  let compositeWithheldReason = null;
  if (floorMet) {
    // The canonical arithmetic. Not reimplemented: imported, called once,
    // and the SAME `dimensions` object above is what ships in the artifact
    // -- so there is no second, independently-computed path to drift from
    // this one.
    ({ composite, band, integrationPremium } = computeCompositeFromDimensions(dimensions));
  } else {
    compositeWithheldReason = buildCompositeWithheldReason({
      missingDimensionCodes,
      shortfallDimensionCodes,
      dimensionItemCounts,
      bank,
      includeSensitive: run.include_sensitive === true,
    });
  }

  // Uncertainty (DECISIONS.md D-40: "add an interval"). Every MEASURED
  // dimension gets a bootstrap interval on its own mean, always -- not only
  // when the composite floor is met. The composite gets an interval too, but
  // ONLY when floorMet, using bootstrapCompositeUncertainty (the function
  // written for this exact nonlinear formula, imported unmodified) over
  // every completed trial in the run. See each entry's own `method` field
  // for exactly which function produced which number -- they are
  // deliberately different (see bootstrapDimensionMean's own comment).
  const uncertaintySeed = seedFromRunId(run.run_id);
  const uncertaintyDimensions = {};
  for (const code of DIMENSION_CODES) {
    const its = itemsByDim.get(code) ?? [];
    uncertaintyDimensions[code] = its.length > 0 ? bootstrapDimensionMean(its, { seed: uncertaintySeed }) : null;
  }
  let uncertaintyComposite = null;
  if (floorMet) {
    const boot = bootstrapCompositeUncertainty(statsTrials, { seed: uncertaintySeed });
    uncertaintyComposite = {
      point_estimate: boot.pointEstimate,
      ci: boot.ci,
      median: boot.median,
      iterations: boot.iterations,
      seed: boot.seed,
      ci_level: boot.ciLevel,
      n_trials: boot.n,
      items_used: boot.itemsUsed,
      min_trials_across_items: boot.minTrialsAcrossItems,
      sufficient: boot.sufficient,
      method:
        "bootstrapCompositeUncertainty (site/scripts/lib/evaluation-statistics.mjs), imported unmodified -- " +
        "resamples trials WITH replacement within each item, holds the item set fixed, aggregates to " +
        "dimension means, then applies the unmodified canonical composite formula per replicate.",
      assumptions: boot.assumptions,
    };
  }
  // NOTE: the key is deliberately `composite_interval`, not `composite` --
  // lib/outbound-guard.mjs walks every object in the returned tree and
  // treats ANY object carrying a bare `composite` (or `band`) key as a
  // candidate SelfRunScorecard that must independently pass
  // validateSelfRunScorecard on its own. A nested `uncertainty.composite`
  // would trip that check against a bare uncertainty object that was never
  // meant to BE a scorecard, and get refused at the response boundary.
  const uncertainty = { dimensions: uncertaintyDimensions, composite_interval: uncertaintyComposite };

  const provenance = {
    subject_label: run.subject_label,
    subject_label_self_reported: true,
    judge_label: run.judge_label,
    judge_label_self_reported: true,
    judge_configuration: run.judge_configuration,
    bank_version: run.bank_version,
    tool_version: PACKAGE_VERSION,
    dimensions_requested: run.dimensions,
    trials_per_item: run.trials_per_item,
    item_hashes: computeItemHashes(bank, run.item_ids),
    include_sensitive: run.include_sensitive === true,
    sensitive_items_excluded: typeof run.sensitive_items_excluded === "number" ? run.sensitive_items_excluded : 0,
    seed: run.seed ?? null,
    temperature: run.temperature ?? null,
    opened_at: run.opened_at,
    finished_at: new Date().toISOString(),
    local_run_reference: run.run_id,
  };

  const contamination = {
    probed: exposureProbe.probed === true,
    probed_at: exposureProbe.probed_at ?? null,
    probe_item_ids: exposureProbe.probe_item_ids ?? [],
    items: exposureProbe.items ?? [],
    mean_overlap: exposureProbe.mean_overlap ?? null,
    max_overlap: exposureProbe.max_overlap ?? null,
    high_exposure_item_ids: exposureProbe.high_exposure_item_ids ?? [],
    // ALWAYS the live exported constants, never copied from the (in
    // principle user-editable) exposure-probe.json file -- a hand-edited
    // file could otherwise change the documented threshold or delete the
    // honest limitations array. finish_scored_run already re-derives the
    // whole contamination block from raw recalled_text before calling this
    // builder; this is the belt to that braces
    // (docs/reviews/CB_PROBE_SECURITY_2026-09-24.md SEC-02).
    exposure_flag_threshold: EXPOSURE_FLAG_THRESHOLD,
    method: EXPOSURE_METHOD_DESCRIPTION,
    limitations: EXPOSURE_LIMITATIONS,
  };

  const scorecard = {
    ...SELF_RUN_HEADER,
    composite,
    band,
    composite_withheld_reason: compositeWithheldReason,
    integration_premium: integrationPremium,
    dimensions,
    dimension_item_counts: dimensionItemCounts,
    subdimensions,
    subdimension_item_counts: subdimensionItemCounts,
    coverage,
    uncertainty,
    coverage_note: buildCoverageNote(run.dimensions, dimensionItemCounts),
    items,
    subdimensions_status: computeSubdimensionsStatus(bank, isScorableItem),
    provenance,
    contamination,
    judge_configuration_notice: buildJudgeConfigurationNotice(run.judge_configuration),
    judge_panel: computeJudgePanel(run, trials),
  };

  const { valid, errors } = validateSelfRunScorecard(scorecard);
  if (!valid) {
    // Unreachable in normal operation -- it would mean this builder itself
    // drifted from the schema it is supposed to satisfy. Fail loudly rather
    // than write (or return) a non-compliant artifact.
    throw new Error(`cb-probe: refusing to emit a non-compliant SelfRunScorecard: ${errors.join("; ")}`);
  }

  return scorecard;
}
