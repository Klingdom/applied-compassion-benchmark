// tests/rating-validation.test.mjs
//
// Rating validation: 0, 6, "3", null all rejected; 1-5 accepted. Tested both
// at the pure-validator level (isValidRating) and through the
// record_item_estimate tool handler end to end.

import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";

import { isValidRating } from "../lib/validate-estimate.mjs";
import { recordItemEstimate, openJudgeSession, ToolError } from "../lib/tools.mjs";
import { loadBank } from "../lib/bank.mjs";

test("isValidRating rejects 0, 6, string '3', null, undefined, floats", () => {
  assert.equal(isValidRating(0), false);
  assert.equal(isValidRating(6), false);
  assert.equal(isValidRating("3"), false);
  assert.equal(isValidRating(null), false);
  assert.equal(isValidRating(undefined), false);
  assert.equal(isValidRating(3.5), false);
  assert.equal(isValidRating(NaN), false);
});

test("isValidRating accepts every integer 1 through 5", () => {
  for (let i = 1; i <= 5; i++) {
    assert.equal(isValidRating(i), true, `${i} should be valid`);
  }
});

test("record_item_estimate rejects out-of-range or malformed ratings end to end", (t) => {
  const bank = loadBank();
  const root = mkdtempSync(path.join(os.tmpdir(), "cb-probe-rating-test-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const ctx = { bank, artifactRoot: root, sessions: new Map() };

  const session = openJudgeSession(
    { subject_label: "test-subject", judge_model_label: "test-judge" },
    ctx
  );

  const baseArgs = {
    session_id: session.session_id,
    item_id: "AWR-1-A",
    response_text: "A caring, specific response.",
    rationale: "Meets the anchor.",
  };

  for (const badRating of [0, 6, "3", null, undefined, 3.5]) {
    assert.throws(
      () => recordItemEstimate({ ...baseArgs, rating_1_5: badRating }, ctx),
      ToolError,
      `rating ${JSON.stringify(badRating)} should be rejected`
    );
  }

  for (const goodRating of [1, 2, 3, 4, 5]) {
    const result = recordItemEstimate({ ...baseArgs, rating_1_5: goodRating }, ctx);
    assert.equal(result.status, "recorded");
  }
});

test("record_item_estimate rejects an unknown item_id", (t) => {
  const bank = loadBank();
  const root = mkdtempSync(path.join(os.tmpdir(), "cb-probe-rating-test-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const ctx = { bank, artifactRoot: root, sessions: new Map() };

  const session = openJudgeSession(
    { subject_label: "test-subject", judge_model_label: "test-judge" },
    ctx
  );

  assert.throws(() =>
    recordItemEstimate(
      {
        session_id: session.session_id,
        item_id: "NOT-A-REAL-ITEM",
        response_text: "x",
        rating_1_5: 3,
        rationale: "x",
      },
      ctx
    )
  );
});

test("record_item_estimate rejects an unknown session_id", () => {
  const bank = loadBank();
  const ctx = { bank, artifactRoot: os.tmpdir(), sessions: new Map() };
  assert.throws(() =>
    recordItemEstimate(
      {
        session_id: "session-that-was-never-opened",
        item_id: "AWR-1-A",
        response_text: "x",
        rating_1_5: 3,
        rationale: "x",
      },
      ctx
    )
  );
});
