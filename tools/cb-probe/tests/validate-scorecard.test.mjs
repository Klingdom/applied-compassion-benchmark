// tests/validate-scorecard.test.mjs
//
// The SelfRunScorecard separation guarantee: composite/band are permitted
// here (unlike JudgeEstimate), everything else in the two-way vocabulary
// ban still applies, and official/comparability/subdimensions remain
// structural, not labels.

import test from "node:test";
import assert from "node:assert/strict";

import {
  validateSelfRunScorecard,
  findScorecardBannedKeys,
  SCORECARD_BANNED_KEYS,
} from "../lib/validate-scorecard.mjs";
import { BANNED_KEYS } from "../lib/validate-estimate.mjs";
import { HEADER_STATEMENT_TEXT } from "../lib/scorecard-header.mjs";

const DIM_CODES = ["AWR", "EMP", "ACT", "EQU", "BND", "ACC", "SYS", "INT"];

function fullDimensionInterval(overrides = {}) {
  return {
    point_estimate: 3,
    ci: [2.5, 3.5],
    median: 3,
    iterations: 2000,
    seed: 1,
    ci_level: 0.95,
    items_used: 3,
    n_trials: 9,
    sufficient: true,
    method: "test method",
    ...overrides,
  };
}

function fullCompositeInterval(overrides = {}) {
  return {
    point_estimate: 60,
    ci: [55, 65],
    median: 60,
    iterations: 2000,
    seed: 1,
    ci_level: 0.95,
    n_trials: 72,
    items_used: 24,
    min_trials_across_items: 3,
    sufficient: true,
    method: "test method",
    assumptions: ["x"],
    ...overrides,
  };
}

function validFixture(overrides = {}) {
  const base = {
    artifact_kind: "self-run-scorecard",
    official: false,
    is_index_entry: false,
    publishable_as_a_compassion_benchmark_score: false,
    comparability: "none",
    header_statement: HEADER_STATEMENT_TEXT,
    what_this_is: "x",
    what_an_official_score_requires: ["x"],
    exposure_warning: "x",
    duty_of_care: "x",
    composite: 60,
    band: "Functional",
    composite_withheld_reason: null,
    integration_premium: 5,
    dimensions: { AWR: 3, EMP: 3, ACT: 3, EQU: 3, BND: 3, ACC: 3, SYS: 3, INT: 3 },
    dimension_item_counts: { AWR: 3, EMP: 3, ACT: 3, EQU: 3, BND: 3, ACC: 3, SYS: 3, INT: 3 },
    uncertainty: {
      dimensions: Object.fromEntries(DIM_CODES.map((c) => [c, fullDimensionInterval()])),
      composite_interval: fullCompositeInterval(),
    },
    coverage_note: "All 8 dimensions were included in this run.",
    items: [
      {
        item_id: "AWR-1-A",
        dimension: "AWR",
        construct: "Distress Recognition",
        mean_rating: 3,
        trial_stats: null,
        trials: [
          {
            trial_index: 1,
            judge_label: "claude-y",
            rating_1_5: 3,
            anchor_matched: "Functional",
            evidence_quote: "a quote",
            response_text: "a response containing a quote",
            recorded_at: new Date().toISOString(),
          },
        ],
      },
    ],
    subdimensions_status: { available: false, reason: "not available" },
    provenance: {
      subject_label: "gpt-x",
      subject_label_self_reported: true,
      judge_label: "claude-y",
      judge_label_self_reported: true,
      judge_configuration: "cross",
      bank_version: "v1.1",
      tool_version: "0.1.0",
      dimensions_requested: ["AWR"],
      trials_per_item: 3,
      item_hashes: { "AWR-1-A": "abc123" },
      seed: null,
      temperature: null,
      opened_at: new Date().toISOString(),
      finished_at: new Date().toISOString(),
      local_run_reference: "run-1",
    },
    contamination: { probed: true, method: "x", limitations: [] },
    judge_configuration_notice: "cross-judge notice",
    judge_panel: null,
  };
  return { ...base, ...overrides };
}

test("a well-formed SelfRunScorecard fixture validates", () => {
  const { valid, errors } = validateSelfRunScorecard(validFixture());
  assert.equal(valid, true, `expected valid, got: ${errors.join("; ")}`);
});

test("composite and band ARE permitted top-level keys in SelfRunScorecard", () => {
  assert.ok(!SCORECARD_BANNED_KEYS.includes("composite"));
  assert.ok(!SCORECARD_BANNED_KEYS.includes("band"));
  // ...but every other originally-banned key remains banned.
  const stillBanned = BANNED_KEYS.filter((k) => k !== "composite" && k !== "band");
  for (const k of stillBanned) {
    assert.ok(SCORECARD_BANNED_KEYS.includes(k), `expected "${k}" to remain banned for SelfRunScorecard`);
  }
});

test("deny-list: rank, benchmark(bare), run_id, cohort etc. still fail validation inside SelfRunScorecard", () => {
  const fixture = validFixture({ provenance: { ...validFixture().provenance, run_id: "abc" } });
  const { valid, errors } = validateSelfRunScorecard(fixture);
  assert.equal(valid, false);
  assert.ok(errors.some((e) => e.includes("run_id")));
});

// Bank v2.0 made subdimension scoring real, so the old blanket ban on a key
// named `subdimensions` was replaced by a stronger check. These three tests
// pin what actually matters: a per-subdimension number must be BACKED.
test("a subdimension mean with zero rated items fails validation (the fabricated-number guard)", () => {
  const fixture = validFixture({
    subdimensions: { A1: 4.2 },
    subdimension_item_counts: { A1: 0 },
  });
  const { valid, errors } = validateSelfRunScorecard(fixture);
  assert.equal(valid, false);
  assert.ok(
    errors.some((e) => e.includes("A1") && e.includes("0 items")),
    `expected an unbacked-mean error naming A1, got: ${errors.join(" | ")}`
  );
});

test("a rated subdimension that reports null instead of its mean fails validation", () => {
  const fixture = validFixture({
    subdimensions: { A1: null },
    subdimension_item_counts: { A1: 3 },
  });
  const { valid, errors } = validateSelfRunScorecard(fixture);
  assert.equal(valid, false);
  assert.ok(errors.some((e) => e.includes("A1") && e.includes("must report its mean")));
});

test("subdimensions without accompanying item counts fails validation", () => {
  const fixture = validFixture({ subdimensions: { A1: 4.2 } });
  const { valid, errors } = validateSelfRunScorecard(fixture);
  assert.equal(valid, false);
  assert.ok(errors.some((e) => e.includes("subdimension_item_counts")));
});

test("an out-of-range subdimension mean fails validation", () => {
  const fixture = validFixture({
    subdimensions: { A1: 7 },
    subdimension_item_counts: { A1: 2 },
  });
  const { valid } = validateSelfRunScorecard(fixture);
  assert.equal(valid, false);
});

test('coverage.level "complete" is checked against the counts, not trusted', () => {
  const fixture = validFixture({
    subdimensions: { A1: 4.0, A2: null },
    subdimension_item_counts: { A1: 2, A2: 0 },
    coverage: { level: "complete", note: "claims complete", unratedSubdimensions: [] },
  });
  const { valid, errors } = validateSelfRunScorecard(fixture);
  assert.equal(valid, false);
  assert.ok(
    errors.some((e) => e.includes('coverage.level "complete" is false')),
    `expected the complete-claim to be contradicted, got: ${errors.join(" | ")}`
  );
});

test("allow-list: an unexpected top-level key fails validation", () => {
  const fixture = validFixture({ rank_against_published_entities: 3 });
  const { valid, errors } = validateSelfRunScorecard(fixture);
  assert.equal(valid, false);
  assert.ok(errors.some((e) => e.includes("rank_against_published_entities") || e.includes("unexpected top-level key")));
});

test("official can never be true", () => {
  const fixture = validFixture({ official: true });
  const { valid, errors } = validateSelfRunScorecard(fixture);
  assert.equal(valid, false);
  assert.ok(errors.some((e) => e.includes("official must be exactly false")));
});

test("comparability can never be anything but 'none'", () => {
  const fixture = validFixture({ comparability: "same-index-rank" });
  const { valid, errors } = validateSelfRunScorecard(fixture);
  assert.equal(valid, false);
  assert.ok(errors.some((e) => e.includes("comparability")));
});

test("header_statement must exactly match the fixed statement", () => {
  const fixture = validFixture({ header_statement: "This is basically an official score." });
  const { valid, errors } = validateSelfRunScorecard(fixture);
  assert.equal(valid, false);
  assert.ok(errors.some((e) => e.includes("header_statement")));
});

test("band must match getBand(composite) -- they cannot silently disagree", () => {
  const fixture = validFixture({ composite: 85, band: "Critical" });
  const { valid, errors } = validateSelfRunScorecard(fixture);
  assert.equal(valid, false);
  assert.ok(errors.some((e) => e.includes("does not match getBand")));
});

test("composite out of [0, 100] fails validation", () => {
  assert.equal(validateSelfRunScorecard(validFixture({ composite: 150, band: "Exemplary" })).valid, false);
  assert.equal(validateSelfRunScorecard(validFixture({ composite: -1, band: "Critical" })).valid, false);
});

test("contamination.probed must be true -- a scorecard without a completed probe never validates", () => {
  const fixture = validFixture({ contamination: { probed: false, method: "x", limitations: [] } });
  const { valid, errors } = validateSelfRunScorecard(fixture);
  assert.equal(valid, false);
  assert.ok(errors.some((e) => e.includes("contamination.probed")));
});

test("subdimensions_status.available must be a boolean and always carry a reason", () => {
  // true is now legitimate (bank v2.0 covers all 40 codes) -- but a non-boolean
  // or a missing reason is not.
  const ok = validFixture({ subdimensions_status: { available: true, reason: "all 40 covered" } });
  assert.equal(validateSelfRunScorecard(ok).valid, true);

  const notBoolean = validFixture({ subdimensions_status: { available: "yes", reason: "x" } });
  assert.equal(validateSelfRunScorecard(notBoolean).valid, false);

  const noReason = validFixture({ subdimensions_status: { available: true, reason: "" } });
  const { valid, errors } = validateSelfRunScorecard(noReason);
  assert.equal(valid, false);
  assert.ok(errors.some((e) => e.includes("subdimensions_status.reason")));
});

test("judge_panel must be an object when judge_configuration is panel, and null otherwise", () => {
  const panelFixture = validFixture({
    provenance: { ...validFixture().provenance, judge_configuration: "panel" },
    judge_panel: null,
  });
  assert.equal(validateSelfRunScorecard(panelFixture).valid, false);

  const nonPanelFixture = validFixture({ judge_panel: { per_item: {} } });
  assert.equal(validateSelfRunScorecard(nonPanelFixture).valid, false);
});

// ---------------------------------------------------------------------------
// composite_withheld_reason: a null composite requires a non-empty reason,
// and a non-null composite requires all 8 dimensions measured. Both
// directions of the partial-coverage guarantee (Iteration 29 follow-up).
// ---------------------------------------------------------------------------
test("a null composite requires a non-empty composite_withheld_reason; a non-null composite requires all 8 dimensions measured", () => {
  // Direction 1: composite: null with no reason fails.
  const nullNoReason = validFixture({ composite: null, band: null, composite_withheld_reason: null });
  const r1 = validateSelfRunScorecard(nullNoReason);
  assert.equal(r1.valid, false);
  assert.ok(r1.errors.some((e) => e.includes("composite_withheld_reason must be a non-empty string")));

  // composite: null with a non-empty reason and band: null is otherwise valid.
  const nullWithReason = validFixture({
    composite: null,
    band: null,
    composite_withheld_reason: "This run measured 1 of 8 canonical dimensions (missing: EMP, ACT, EQU, BND, ACC, SYS, INT).",
    uncertainty: {
      dimensions: Object.fromEntries(DIM_CODES.map((c) => [c, fullDimensionInterval()])),
      composite_interval: null,
    },
  });
  const r2 = validateSelfRunScorecard(nullWithReason);
  assert.equal(r2.valid, true, `expected valid, got: ${r2.errors.join("; ")}`);

  // Direction 2: composite: non-null but a dimension is missing (null) fails.
  const nonNullMissingDim = validFixture({
    dimensions: { AWR: 3, EMP: 3, ACT: 3, EQU: 3, BND: 3, ACC: 3, SYS: 3, INT: null },
  });
  const r3 = validateSelfRunScorecard(nonNullMissingDim);
  assert.equal(r3.valid, false);
  assert.ok(r3.errors.some((e) => e.includes("non-null composite requires all 8 canonical dimensions to be measured")));

  // composite: non-null with composite_withheld_reason set (should be null) also fails.
  const nonNullWithReason = validFixture({ composite_withheld_reason: "should not be here" });
  const r4 = validateSelfRunScorecard(nonNullWithReason);
  assert.equal(r4.valid, false);
  assert.ok(r4.errors.some((e) => e.includes("composite_withheld_reason must be null when composite is non-null")));
});

// ---------------------------------------------------------------------------
// DECISIONS.md D-40: a non-null composite also requires every dimension to
// rest on >= 3 rated items, not merely a non-null mean.
// ---------------------------------------------------------------------------
test("a non-null composite with a dimension resting on only 2 items fails validation (the item-count floor)", () => {
  const fixture = validFixture({ dimension_item_counts: { AWR: 3, EMP: 3, ACT: 3, EQU: 3, BND: 3, ACC: 3, SYS: 2, INT: 3 } });
  const { valid, errors } = validateSelfRunScorecard(fixture);
  assert.equal(valid, false);
  assert.ok(errors.some((e) => e.includes("dimension_item_counts[SYS]") && e.includes("below the 3-item floor")));
});

test("dimension_item_counts must agree with dimensions: a positive count with a null mean fails, and vice versa", () => {
  const zeroCountMeasuredDim = validFixture({
    dimension_item_counts: { AWR: 3, EMP: 3, ACT: 3, EQU: 3, BND: 3, ACC: 3, SYS: 3, INT: 0 },
  });
  assert.equal(validateSelfRunScorecard(zeroCountMeasuredDim).valid, false);

  const positiveCountNullDim = validFixture({
    dimensions: { AWR: 3, EMP: 3, ACT: 3, EQU: 3, BND: 3, ACC: 3, SYS: 3, INT: null },
    dimension_item_counts: { AWR: 3, EMP: 3, ACT: 3, EQU: 3, BND: 3, ACC: 3, SYS: 3, INT: 3 },
    composite: null,
    band: null,
    composite_withheld_reason: "withheld for this fixture",
    uncertainty: {
      dimensions: Object.fromEntries(DIM_CODES.map((c) => [c, fullDimensionInterval()])),
      composite_interval: null,
    },
  });
  const { valid, errors } = validateSelfRunScorecard(positiveCountNullDim);
  assert.equal(valid, false);
  assert.ok(errors.some((e) => e.includes('dimension_item_counts["INT"] is 3 but dimensions["INT"] is null')));
});

test("uncertainty.composite_interval must be null exactly when composite is null", () => {
  const nonNullCompositeNullInterval = validFixture({
    uncertainty: {
      dimensions: Object.fromEntries(DIM_CODES.map((c) => [c, fullDimensionInterval()])),
      composite_interval: null,
    },
  });
  assert.equal(validateSelfRunScorecard(nonNullCompositeNullInterval).valid, false);
});

test("uncertainty.dimensions must have an interval for every measured dimension and null for every unmeasured one", () => {
  const missingIntervalForMeasuredDim = validFixture();
  missingIntervalForMeasuredDim.uncertainty.dimensions.AWR = null;
  const { valid, errors } = validateSelfRunScorecard(missingIntervalForMeasuredDim);
  assert.equal(valid, false);
  assert.ok(errors.some((e) => e.includes('uncertainty.dimensions["AWR"] must be an object')));
});

test("a rating without an anchor_matched or evidence_quote inside items[].trials[] fails validation", () => {
  const fixture = validFixture();
  fixture.items[0].trials[0].anchor_matched = "";
  assert.equal(validateSelfRunScorecard(fixture).valid, false);

  const fixture2 = validFixture();
  fixture2.items[0].trials[0].evidence_quote = "";
  assert.equal(validateSelfRunScorecard(fixture2).valid, false);
});
