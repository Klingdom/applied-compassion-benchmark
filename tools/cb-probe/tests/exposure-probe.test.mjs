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
  assertSubstantiveRecall,
  EXPOSURE_FLAG_THRESHOLD,
  MIN_RECALL_TOKENS,
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

test("scoreRecallAttempts persists recalled_text verbatim on every item, so the probe is auditable", () => {
  const bank = loadBank();
  const result = scoreRecallAttempts(bank, ["AWR-1-A"], [
    { item_id: "AWR-1-A", recalled_text: "my best guess at the wording" },
  ]);
  assert.equal(result.items[0].recalled_text, "my best guess at the wording");
});

// ---------------------------------------------------------------------------
// item 2, planted probe: a blank or trivial recall must FAIL the
// contamination probe (via assertSubstantiveRecall), not silently pass it
// with a clean tokenOverlap of 0 indistinguishable from an honest
// non-recall. Verified before this fix: empty string, whitespace,
// punctuation, a single stopword, and non-Latin text all score exactly
// tokenOverlap 0 -- the same as "I have no memory of this item."
// ---------------------------------------------------------------------------
test("assertSubstantiveRecall: planted probe -- blank, whitespace, punctuation-only, and single-stopword recalls are all refused", () => {
  const trivialAttempts = ["", "   ", "...!!??--", "the", "a", undefined, null, 42];
  for (const attempt of trivialAttempts) {
    assert.throws(
      () => assertSubstantiveRecall(attempt, "AWR-1-A"),
      /not a substantive attempt/,
      `expected assertSubstantiveRecall to refuse ${JSON.stringify(attempt)}`
    );
  }
});

test("assertSubstantiveRecall: an honest 'I don't remember' sentence is accepted -- the fix must not require accuracy, only a substantive attempt", () => {
  assert.doesNotThrow(() => assertSubstantiveRecall("I have no memory of this item's exact wording.", "AWR-1-A"));
  assert.doesNotThrow(() => assertSubstantiveRecall("I genuinely do not recall this one at all.", "AWR-1-A"));
});

test("MIN_RECALL_TOKENS boundary: exactly at the floor is accepted, one below is refused", () => {
  const threeTokenText = "one two three"; // exactly MIN_RECALL_TOKENS
  assert.equal(normalizeTokens(threeTokenText).length, MIN_RECALL_TOKENS);
  assert.doesNotThrow(() => assertSubstantiveRecall(threeTokenText, "AWR-1-A"));
  const twoTokenText = "one two";
  assert.equal(normalizeTokens(twoTokenText).length, MIN_RECALL_TOKENS - 1);
  assert.throws(() => assertSubstantiveRecall(twoTokenText, "AWR-1-A"));
});

// ---------------------------------------------------------------------------
// item 2: item selection is now seeded from the run id, not always the
// alphabetically-first ids.
// ---------------------------------------------------------------------------
test("pickProbeItemIds with a seed is deterministic per-seed but varies across seeds (not always alphabetically-first)", () => {
  const ids = ["ACC-1-A", "ACT-1-A", "AWR-1-A", "AWR-1-B", "AWR-1-C", "BND-1-A", "EMP-1-A", "EQU-1-A", "SYS-1-A"];
  const alphabeticallyFirstThree = [...ids].sort().slice(0, 3);

  const forRunA = pickProbeItemIds(ids, 3, "run-aaaa-1111");
  const forRunAAgain = pickProbeItemIds(ids, 3, "run-aaaa-1111");
  assert.deepEqual(forRunA, forRunAAgain, "the same run_id must reproduce the same challenge (idempotent re-issue)");

  // Try a handful of seeds; at least one must differ from the
  // alphabetically-first three, proving selection is not hardcoded to
  // "always the first three ids" (docs/reviews/CB_PROBE_SECURITY_2026-09-24.md SEC-05).
  const seeds = ["run-bbbb-2222", "run-cccc-3333", "run-dddd-4444", "run-eeee-5555", "run-ffff-6666"];
  const anyDifferent = seeds.some((seed) => {
    const picked = pickProbeItemIds(ids, 3, seed);
    return JSON.stringify(picked) !== JSON.stringify(alphabeticallyFirstThree);
  });
  assert.ok(anyDifferent, "at least one seed must select a different set than the alphabetically-first three ids");
});

// ---------------------------------------------------------------------------
// item 12e: exposure threshold tested exactly at 0.6 and either side.
// EXPOSURE_FLAG_THRESHOLD uses >=, so exactly 0.6 must flag.
// ---------------------------------------------------------------------------
test("EXPOSURE_FLAG_THRESHOLD boundary: overlap of exactly 0.6 flags, overlap just below 0.6 does not", () => {
  // Real prompt: 5 distinct tokens. Recall: 3 of the same 5 tokens, no
  // extras -- intersection = 3, union = 5 (recall's tokens are a subset of
  // real's), overlap = 3/5 = 0.6 exactly.
  const realPromptAtExactly06 = "alpha bravo charlie delta echo";
  const recallAtExactly06 = "alpha bravo charlie";
  const overlapAtExactly06 = tokenOverlap(realPromptAtExactly06, recallAtExactly06);
  assert.equal(overlapAtExactly06, 0.6);
  assert.equal(overlapAtExactly06 >= EXPOSURE_FLAG_THRESHOLD, true);

  // scoreRecallAttempts looks the item up via findItem(bank, itemId); build
  // a tiny fake bank so this test is self-contained and does not depend on
  // any particular real bank item's exact token count.
  const fakeBank = { items: [{ id: "EXACT-06", prompt: realPromptAtExactly06 }] };
  const flaggedAt06 = scoreRecallAttempts(fakeBank, ["EXACT-06"], [
    { item_id: "EXACT-06", recalled_text: recallAtExactly06 },
  ]);
  assert.equal(flaggedAt06.items[0].overlap, 0.6);
  assert.equal(flaggedAt06.items[0].exposure_flag, true, "exactly 0.6 must flag (the threshold check is >=)");

  // Just below 0.6: 8 of 14 union tokens shared = 0.5714...
  const realPromptJustBelow = "one two three four five six seven eight nine ten eleven twelve thirteen fourteen";
  const recallJustBelow = "one two three four five six seven eight"; // subset of the first 8 real tokens
  const fakeBankBelow = { items: [{ id: "BELOW-06", prompt: realPromptJustBelow }] };
  const flaggedBelow = scoreRecallAttempts(fakeBankBelow, ["BELOW-06"], [
    { item_id: "BELOW-06", recalled_text: recallJustBelow },
  ]);
  assert.ok(flaggedBelow.items[0].overlap < EXPOSURE_FLAG_THRESHOLD, `expected overlap below 0.6, got ${flaggedBelow.items[0].overlap}`);
  assert.equal(flaggedBelow.items[0].exposure_flag, false);

  // And clearly above: all 5 real tokens plus one extra.
  const fakeBankAbove = { items: [{ id: "ABOVE-06", prompt: realPromptAtExactly06 }] };
  const flaggedAbove = scoreRecallAttempts(fakeBankAbove, ["ABOVE-06"], [
    { item_id: "ABOVE-06", recalled_text: "alpha bravo charlie delta echo foxtrot" },
  ]);
  assert.ok(flaggedAbove.items[0].overlap > EXPOSURE_FLAG_THRESHOLD);
  assert.equal(flaggedAbove.items[0].exposure_flag, true);
});
