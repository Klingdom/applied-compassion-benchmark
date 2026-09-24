// tests/separation-statement.test.mjs
//
// item 8: explain_what_this_is_not() used to state something false -- that
// cb-probe "never computes a composite". That was true of JudgeEstimate and
// false of the server as a whole once the scored run shipped. This test
// pins the corrected statement: it must describe BOTH artifact kinds
// truthfully, in particular that SelfRunScorecard DOES compute a composite
// and band under specific conditions.

import test from "node:test";
import assert from "node:assert/strict";

import { FULL_STATEMENT } from "../lib/separation-statement.mjs";
import { explainWhatThisIsNot } from "../lib/tools.mjs";

test("FULL_STATEMENT mentions the scored run and SelfRunScorecard, not only JudgeEstimate", () => {
  assert.match(FULL_STATEMENT, /scored run/i);
  assert.match(FULL_STATEMENT, /SelfRunScorecard/);
  assert.match(FULL_STATEMENT, /start_scored_run/);
  assert.match(FULL_STATEMENT, /finish_scored_run/);
});

test("FULL_STATEMENT truthfully says SelfRunScorecard DOES compute a composite under the 8-dimension condition, not that no composite is ever computed", () => {
  assert.match(FULL_STATEMENT, /SelfRunScorecard DOES compute a composite/);
  assert.match(FULL_STATEMENT, /all 8 canonical dimensions/);
  // The exact false claim this item replaces: "It never computes a
  // composite ... This is a structural property, not a policy" -- worded
  // as if it applied to the whole tool, with no artifact-kind qualifier.
  assert.doesNotMatch(
    FULL_STATEMENT,
    /- It never computes a composite/,
    "the old unqualified claim (no artifact-kind name attached) must not appear"
  );
});

test("FULL_STATEMENT still correctly describes JudgeEstimate as composite-free", () => {
  assert.match(FULL_STATEMENT, /JudgeEstimate never computes a composite/);
});

test("FULL_STATEMENT mentions the mandatory contamination check for the scored path", () => {
  assert.match(FULL_STATEMENT, /run_exposure_probe/);
  assert.match(FULL_STATEMENT, /mandatory/i);
});

test("explain_what_this_is_not() returns the same FULL_STATEMENT the tool is described as returning", () => {
  const result = explainWhatThisIsNot();
  assert.equal(result.statement, FULL_STATEMENT);
});
