// tests/exposure-probe.test.mjs
//
// The contamination check's pure logic, tested independent of the tool
// orchestration. V8 positive control: a verbatim recall must score near 1.0
// (the check actually detects real exposure, not just "always says low"),
// and an unrelated recall must score near 0.0 (the negative control).

import test from "node:test";
import assert from "node:assert/strict";

import {
  normalizeTokens,
  tokenOverlap,
  pickProbeItemIds,
  scoreRecallAttempts,
  EXPOSURE_FLAG_THRESHOLD,
} from "../lib/exposure-probe.mjs";
import { loadBank, findItem } from "../lib/bank.mjs";

test("normalizeTokens lowercases, strips punctuation, and splits on whitespace", () => {
  assert.deepEqual(normalizeTokens("Hello, World! It's fine."), ["hello", "world", "it", "s", "fine"]);
  assert.deepEqual(normalizeTokens(""), []);
  assert.deepEqual(normalizeTokens(null), []);
});

test("tokenOverlap: positive control -- verbatim text scores overlap 1.0", () => {
  const text = "I've been caring for my mom with dementia for three years.";
  assert.equal(tokenOverlap(text, text), 1);
});

test("tokenOverlap: negative control -- unrelated text scores near 0", () => {
  const a = "I've been caring for my mom with dementia for three years.";
  const b = "The quarterly revenue projections need to be finalized by Friday.";
  const overlap = tokenOverlap(a, b);
  assert.ok(overlap < 0.2, `expected near-zero overlap for unrelated text, got ${overlap}`);
});

test("tokenOverlap: empty recollection scores exactly 0, not undefined", () => {
  assert.equal(tokenOverlap("some real prompt text", ""), 0);
  assert.equal(tokenOverlap("", "some real prompt text"), 0);
});

test("pickProbeItemIds is deterministic (sorted), not random", () => {
  const ids = ["ZZZ-9-A", "AWR-1-A", "EMP-1-B", "AWR-1-C"];
  const first = pickProbeItemIds(ids, 3);
  const second = pickProbeItemIds(ids, 3);
  assert.deepEqual(first, second);
  assert.deepEqual(first, ["AWR-1-A", "AWR-1-C", "EMP-1-B"]);
});

test("pickProbeItemIds de-duplicates and caps at count", () => {
  const ids = ["AWR-1-A", "AWR-1-A", "AWR-1-B"];
  assert.deepEqual(pickProbeItemIds(ids, 1), ["AWR-1-A"]);
  assert.deepEqual(pickProbeItemIds(ids, 10), ["AWR-1-A", "AWR-1-B"]);
});

test("scoreRecallAttempts: positive control -- reciting the real prompt verbatim flags high exposure", () => {
  const bank = loadBank();
  const issuedIds = ["AWR-1-A"];
  const realItem = findItem(bank, "AWR-1-A");
  const result = scoreRecallAttempts(bank, issuedIds, [
    { item_id: "AWR-1-A", recalled_text: realItem.prompt },
  ]);
  assert.equal(result.items[0].overlap, 1);
  assert.equal(result.items[0].exposure_flag, true);
  assert.ok(result.mean_overlap >= EXPOSURE_FLAG_THRESHOLD);
  assert.deepEqual(result.high_exposure_item_ids, ["AWR-1-A"]);
});

test("scoreRecallAttempts: negative control -- an honest 'no memory' recollection does not flag exposure", () => {
  const bank = loadBank();
  const issuedIds = ["AWR-1-A"];
  const result = scoreRecallAttempts(bank, issuedIds, [
    { item_id: "AWR-1-A", recalled_text: "I have no memory of this item's exact wording." },
  ]);
  assert.equal(result.items[0].exposure_flag, false);
  assert.ok(result.items[0].overlap < EXPOSURE_FLAG_THRESHOLD);
});

test("scoreRecallAttempts documents its method and limitations on every result", () => {
  const bank = loadBank();
  const result = scoreRecallAttempts(bank, ["AWR-1-A"], [{ item_id: "AWR-1-A", recalled_text: "x" }]);
  assert.equal(typeof result.method, "string");
  assert.ok(result.method.length > 0);
  assert.ok(Array.isArray(result.limitations) && result.limitations.length > 0);
});
