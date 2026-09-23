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

test("deny-list: a nested 'subdimensions' key anywhere in the tree fails validation", () => {
  const fixture = validFixture({ dimensions: { ...validFixture().dimensions, subdimensions: {} } });
  const banned = findScorecardBannedKeys(fixture);
  assert.ok(banned.includes("subdimensions"));
  const { valid, errors } = validateSelfRunScorecard(fixture);
  assert.equal(valid, false);
  assert.ok(errors.some((e) => e.includes("subdimensions")));
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

test("subdimensions_status.available can never be true", () => {
  const fixture = validFixture({ subdimensions_status: { available: true, reason: "x" } });
  const { valid, errors } = validateSelfRunScorecard(fixture);
  assert.equal(valid, false);
  assert.ok(errors.some((e) => e.includes("subdimensions_status.available")));
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

test("a rating without an anchor_matched or evidence_quote inside items[].trials[] fails validation", () => {
  const fixture = validFixture();
  fixture.items[0].trials[0].anchor_matched = "";
  assert.equal(validateSelfRunScorecard(fixture).valid, false);

  const fixture2 = validFixture();
  fixture2.items[0].trials[0].evidence_quote = "";
  assert.equal(validateSelfRunScorecard(fixture2).valid, false);
});
