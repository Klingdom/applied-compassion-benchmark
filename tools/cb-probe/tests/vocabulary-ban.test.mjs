// tests/vocabulary-ban.test.mjs
//
// The separation guarantee, tested first (MCP_SERVER_PLAN_2026-09-20.md build
// order): a two-way vocabulary ban on the JudgeEstimate artifact.
//
//   Direction 1 (deny-list): a fixture using literal official vocabulary as
//   keys (composite, band, rank) must FAIL.
//   Direction 2 (allow-list): a fixture that renames judge-side keys into
//   plausible official-side vocabulary (results, rater) not covered by the
//   deny-list must also FAIL, because only a declared key set is accepted.
//
// A compliant fixture, built by the real buildJudgeEstimate() function, must
// PASS. Each of these assertions is meaningless unless the "must FAIL" cases
// actually fail against the validator as first written -- that is the
// red-before-green requirement this file exists to satisfy.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { validateJudgeEstimate, findBannedKeys } from "../lib/validate-estimate.mjs";
import { buildJudgeEstimate } from "../lib/judge-estimate.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadFixture(name) {
  return JSON.parse(readFileSync(path.join(__dirname, "fixtures", name), "utf8"));
}

test("deny-list: a fixture carrying composite/band/rank keys fails validation", () => {
  const fixture = loadFixture("non-compliant-estimate.json");
  const { valid, errors } = validateJudgeEstimate(fixture);
  assert.equal(valid, false, "non-compliant fixture must NOT validate");
  assert.ok(errors.some((e) => e.includes("composite")), "must name composite as banned");
  assert.ok(errors.some((e) => e.includes("band")), "must name band as banned");
  assert.ok(errors.some((e) => e.includes("rank")), "must name rank as banned");
});

test("deny-list: findBannedKeys reports exactly the banned keys present", () => {
  const fixture = loadFixture("non-compliant-estimate.json");
  const banned = findBannedKeys(fixture);
  assert.ok(banned.includes("composite"));
  assert.ok(banned.includes("band"));
  assert.ok(banned.includes("rank"));
  // rating_1_5 is a compound key, not the bare "rating" -- must not be reported.
  assert.ok(!banned.includes("rating_1_5"));
});

test("allow-list: a fixture renaming judge vocabulary into official-shaped keys fails validation", () => {
  const fixture = loadFixture("renamed-official-vocabulary-estimate.json");
  const { valid, errors } = validateJudgeEstimate(fixture);
  assert.equal(valid, false, "fixture with unlisted top-level keys must NOT validate");
  assert.ok(errors.some((e) => e.includes('"rater"')), "must reject the unlisted rater key");
  assert.ok(errors.some((e) => e.includes('"results"')), "must reject the unlisted results key");
});

test("a fixture using bare rate/rating as a top-level key fails validation", () => {
  const bad = {
    artifact_kind: "judge-estimate",
    official: false,
    is_index_entry: false,
    publishable_as_a_compassion_benchmark_score: false,
    comparability: "none",
    what_this_is: "x",
    what_an_official_score_requires: ["x"],
    exposure_warning: "x",
    duty_of_care: "x",
    subject_label_self_reported: true,
    judge_model_label_self_reported: true,
    session_id: "s1",
    rating: 5,
  };
  const { valid, errors } = validateJudgeEstimate(bad);
  assert.equal(valid, false);
  assert.ok(errors.some((e) => e.includes("rating")));
});

test("compound fields that merely CONTAIN a banned substring are not false-flagged", () => {
  // publishable_as_a_compassion_benchmark_score contains "benchmark", and
  // rating_1_5 contains "rating" -- neither is an exact match for a banned
  // key, and both are required, self-negating fields in the real schema.
  const compliant = buildJudgeEstimate(
    {
      session_id: "session-ok",
      subject_label: "gpt-x",
      judge_model_label: "claude-y",
      opened_at: new Date().toISOString(),
      bank_version: "v1.1",
    },
    [
      {
        item_id: "AWR-1-A",
        dimension: "AWR",
        construct: "Distress Recognition",
        rating_1_5: 4,
        rationale: "Acknowledges the caregiver's exhaustion before offering options.",
        response_text: "That sounds exhausting. Let's figure out a way to get you a break.",
      },
    ]
  );
  const { valid, errors } = validateJudgeEstimate(compliant);
  assert.equal(valid, true, `expected compliant artifact to validate, got: ${errors.join("; ")}`);
});

test("a real, freshly-built JudgeEstimate contains no composite and no band field", () => {
  const artifact = buildJudgeEstimate(
    {
      session_id: "session-real",
      subject_label: "gpt-x",
      judge_model_label: "claude-y",
      opened_at: new Date().toISOString(),
      bank_version: "v1.1",
    },
    [
      {
        item_id: "AWR-1-A",
        dimension: "AWR",
        construct: "Distress Recognition",
        rating_1_5: 5,
        rationale: "Full recognition of the caregiver's distress before problem-solving.",
        response_text: "That's an enormous amount to carry alone.",
      },
      {
        item_id: "EMP-1-A",
        dimension: "EMP",
        construct: "Empathic reflection",
        rating_1_5: 3,
        rationale: "Adequate.",
        response_text: "I understand that's hard.",
      },
    ]
  );
  const serialised = JSON.stringify(artifact);
  assert.ok(!/"composite"/.test(serialised), "serialised artifact must not contain a composite key");
  assert.ok(!/"band"/.test(serialised), "serialised artifact must not contain a band key");
  assert.deepEqual(artifact.dimension_counts, { AWR: { n: 1 }, EMP: { n: 1 } });
  assert.equal(artifact.official, false);
});

test("official can never be true", () => {
  const bad = {
    artifact_kind: "judge-estimate",
    official: true,
    is_index_entry: false,
    publishable_as_a_compassion_benchmark_score: false,
    comparability: "none",
    what_this_is: "x",
    what_an_official_score_requires: ["x"],
    exposure_warning: "x",
    duty_of_care: "x",
    subject_label_self_reported: true,
    judge_model_label_self_reported: true,
    session_id: "s1",
  };
  const { valid, errors } = validateJudgeEstimate(bad);
  assert.equal(valid, false);
  assert.ok(errors.some((e) => e.includes("official must be exactly false")));
});
