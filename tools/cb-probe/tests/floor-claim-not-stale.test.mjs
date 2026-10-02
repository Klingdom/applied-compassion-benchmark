// tests/floor-claim-not-stale.test.mjs
//
// The user-facing texts that cb-probe serves (explain_what_this_is_not, the SelfRunScorecard
// header, the start_scored_run tool description) once said that the D-40 composite floor
// (all 8 dimensions, >= 3 rated items each) "is not reachable at all" on the published bank,
// because SYS and INT carried only 2 items. Bank v2.0 made that false, and the text kept saying
// it. This test computes reachability from the default-served bank itself and fails if any served
// text claims the floor is unreachable while it is reachable. No bank count is typed here.

import test from "node:test";
import assert from "node:assert/strict";

import { loadBank, isScorableItem } from "../lib/bank.mjs";
import { isSensitiveItem } from "../lib/sensitivity.mjs";
import { DIMENSION_CODES } from "../lib/canonical.mjs";
import { MIN_ITEMS_PER_DIMENSION_FOR_COMPOSITE } from "../lib/validate-scorecard.mjs";
import { FULL_STATEMENT } from "../lib/separation-statement.mjs";
import { SELF_RUN_HEADER } from "../lib/scorecard-header.mjs";
import { TOOL_DEFINITIONS_BY_NAME } from "../lib/tool-definitions.mjs";

// Phrasings that assert the floor cannot be met. Deliberately broad on the claim, narrow on the
// subject (the floor / composite), so it does not trip on unrelated uses of "unreachable".
const UNREACHABLE_CLAIMS = [
  /floor is not reachable/i,
  /floor is unreachable/i,
  /not reachable at all/i,
  /cannot be reached/i,
  /never clear(s)? the 3-item floor/i,
  /only 2 non-sensitive scorable items/i,
  /permanent result of a run/i,
];

export function claimsFloorUnreachable(text) {
  return UNREACHABLE_CLAIMS.some((re) => re.test(text));
}

// B2 (claim audit 2026-10-02): "It CAN carry a composite, but NOT normally" contradicted the page's own
// "the floor is reachable". While the floor is reachable on the default served bank, a complete default
// run can meet both conditions, so "not normally" / "not the normal case" is false. Text is whitespace-
// normalised first because the served statement wraps lines in the middle of these phrases.
const NOT_NORMAL_CLAIMS = [/\bnot\s+normally\b/i, /\bnot\s+the\s+normal\s+case\b/i, /\bnot\s+normal\b/i];

export function claimsCompositeIsNotNormal(text) {
  const flat = String(text).replace(/\s+/g, " ");
  return NOT_NORMAL_CLAIMS.some((re) => re.test(flat));
}

function floorReachableOnDefaultServedBank() {
  const bank = loadBank({ forceReload: true });
  const served = bank.items.filter((item) => isScorableItem(item) && !isSensitiveItem(item));
  return DIMENSION_CODES.every(
    (code) => served.filter((item) => item.dimension === code).length >= MIN_ITEMS_PER_DIMENSION_FOR_COMPOSITE
  );
}

const SERVED_TEXTS = {
  "explain_what_this_is_not FULL_STATEMENT": FULL_STATEMENT,
  "SelfRunScorecard SELF_RUN_HEADER.what_this_is": SELF_RUN_HEADER.what_this_is,
  "start_scored_run tool description": TOOL_DEFINITIONS_BY_NAME.get("start_scored_run").description,
};

test("no served text claims the D-40 floor is unreachable while the default-served bank reaches it", () => {
  if (!floorReachableOnDefaultServedBank()) {
    // The floor genuinely cannot be met on this bank, so such a claim would be true; the texts
    // must then say so, which is a different test to write when that day comes.
    return;
  }
  for (const [name, text] of Object.entries(SERVED_TEXTS)) {
    assert.equal(claimsFloorUnreachable(text), false, name + " claims the composite floor is unreachable, but the default-served bank reaches it");
  }
});

test("no served text calls a composite 'not normal' while the default-served bank reaches the floor", () => {
  if (!floorReachableOnDefaultServedBank()) return;
  for (const [name, text] of Object.entries(SERVED_TEXTS)) {
    assert.equal(claimsCompositeIsNotNormal(text), false, name + " says a composite is 'not normal', but a default run can meet the floor");
  }
});

test("positive control: the 'NOT normally' strings that used to be served are detected, including across a line break", () => {
  const oldStatementB =
    "It CAN carry a composite (0-100) and a band, but\n      NOT normally: only when the run covers all 8 canonical dimensions";
  const oldStatementNot =
    "imported directly and never reimplemented) -- but NOT\n  normally, and only when TWO conditions both hold";
  const oldToolDescription = "directly) -- but NOT normally, and only when TWO conditions both hold: the run covers all 8 ";
  assert.equal(claimsCompositeIsNotNormal(oldStatementB), true);
  assert.equal(claimsCompositeIsNotNormal(oldStatementNot), true);
  assert.equal(claimsCompositeIsNotNormal(oldToolDescription), true);
  assert.equal(claimsCompositeIsNotNormal("which is not the normal case"), true);
  assert.equal(claimsCompositeIsNotNormal("but only when TWO conditions both hold"), false);
});

test("the texts state the rule and point at composite_withheld_reason for whether a run met it", () => {
  assert.match(FULL_STATEMENT, /all 8 canonical dimensions/);
  assert.match(FULL_STATEMENT, /at least 3 rated items/);
  for (const [name, text] of Object.entries(SERVED_TEXTS)) {
    assert.match(text, /composite_withheld_reason/, name + " must point at composite_withheld_reason");
  }
});

// Positive control: the detector must fire on the exact strings that used to be served. Without
// this the test above would pass just as happily if the regexes were wrong.
test("positive control: the stale claims that used to be served are detected", () => {
  const oldSeparation =
    "ON THE TASK BANK PUBLISHED TODAY, the floor is not reachable at all: SYS and INT carry only 2 non-sensitive scorable items each, so composite: null is the honest, permanent result of a run over today's bank";
  const oldHeader = "on the task bank published today, that floor is not reachable at all (see composite_withheld_reason on any real run)";
  const oldToolDescription =
    "ON THE TASK BANK PUBLISHED TODAY that floor is not reachable at all (SYS and INT carry only 2 non-sensitive scorable items each)";
  assert.equal(claimsFloorUnreachable(oldSeparation), true);
  assert.equal(claimsFloorUnreachable(oldHeader), true);
  assert.equal(claimsFloorUnreachable(oldToolDescription), true);
  assert.equal(claimsFloorUnreachable(FULL_STATEMENT + " " + oldHeader), true);
});
