// tests/identification-probe.test.mjs
//
// Iteration 38 / backlog MS-3. The forced-choice identification probe exists
// because token overlap passed a subject that had authored 60 of the 93 bank
// items earlier the same session. These tests pin the properties that make the
// replacement trustworthy -- above all the one that protects an innocent
// subject: answering at chance must NOT be reported as contamination.

import test from "node:test";
import assert from "node:assert/strict";

import { loadBank } from "../lib/bank.mjs";
import {
  buildIdentificationChallenge,
  scoreIdentification,
  binomialTailAtLeast,
  describeItem,
  IDENTIFICATION_OPTIONS,
  IDENTIFICATION_COUNT,
  IDENTIFICATION_ALPHA,
} from "../lib/identification-probe.mjs";

const bank = loadBank();
const awrIds = bank.items.filter((i) => i.dimension === "AWR").map((i) => i.id);
const allIds = bank.items.map((i) => i.id);

function answersFrom(key, mapper) {
  return Object.entries(key).map(([itemId, correct]) => ({ item_id: itemId, option_id: mapper(correct) }));
}

// ---------------------------------------------------------------------------
// The protection that matters most: a clean subject must not be accused.
// ---------------------------------------------------------------------------
test("a subject answering at chance is NOT flagged (the false-accusation guard)", () => {
  const { key } = buildIdentificationChallenge(bank, allIds, "clean-subject-run");
  const n = Object.keys(key).length;

  // Simulate many independent clean subjects guessing uniformly at random, and
  // measure the real false-positive rate rather than asserting one lucky draw.
  const letters = Array.from({ length: IDENTIFICATION_OPTIONS }, (_, i) => String.fromCharCode(65 + i));
  let flaggedCount = 0;
  const TRIALS = 4000;
  let seed = 12345;
  const rand = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
  for (let t = 0; t < TRIALS; t += 1) {
    const guesses = answersFrom(key, () => letters[Math.floor(rand() * letters.length)]);
    if (scoreIdentification(key, guesses).flagged) flaggedCount += 1;
  }
  const falsePositiveRate = flaggedCount / TRIALS;
  assert.ok(
    falsePositiveRate <= IDENTIFICATION_ALPHA + 0.02,
    `clean subjects were flagged ${(falsePositiveRate * 100).toFixed(1)}% of the time, which is above the ` +
      `${IDENTIFICATION_ALPHA * 100}% the test claims. n=${n}`
  );
});

test("a subject answering every question wrong is not flagged", () => {
  const { key } = buildIdentificationChallenge(bank, allIds, "wrong-answers-run");
  const wrong = answersFrom(key, (correct) => (correct === "A" ? "B" : "A"));
  const scored = scoreIdentification(key, wrong);
  assert.equal(scored.flagged, false);
  assert.equal(scored.correct, 0);
});

test("a subject that answers nothing is not flagged, and unanswered is reported", () => {
  const { key } = buildIdentificationChallenge(bank, allIds, "no-answers-run");
  const scored = scoreIdentification(key, []);
  assert.equal(scored.flagged, false);
  assert.equal(scored.correct, 0);
  assert.equal(scored.unanswered, Object.keys(key).length);
});

// ---------------------------------------------------------------------------
// The detection it exists for.
// ---------------------------------------------------------------------------
test("a subject that knows the bank IS flagged, where token overlap would not be", () => {
  const { key } = buildIdentificationChallenge(bank, allIds, "contaminated-run");
  const perfect = answersFrom(key, (correct) => correct);
  const scored = scoreIdentification(key, perfect);

  assert.equal(scored.flagged, true);
  assert.equal(scored.correct, scored.questions_asked);
  assert.ok(scored.probability_if_unexposed < 0.001, `p was ${scored.probability_if_unexposed}`);
  assert.match(scored.verdict, /CONTAMINATION INDICATED/);
});

test("the flag tracks the evidence: it fires above chance and not at it", () => {
  const { key } = buildIdentificationChallenge(bank, allIds, "gradient-run");
  const entries = Object.entries(key);
  const n = entries.length;

  const withKCorrect = (k) =>
    scoreIdentification(
      key,
      entries.map(([itemId, correct], idx) => ({
        item_id: itemId,
        option_id: idx < k ? correct : correct === "A" ? "B" : "A",
      }))
    );

  // At chance (n/4 correct) it must stay quiet; at full marks it must fire.
  const atChance = withKCorrect(Math.round(n / IDENTIFICATION_OPTIONS));
  assert.equal(atChance.flagged, false, `scoring at chance should not flag (got p=${atChance.probability_if_unexposed})`);
  assert.equal(withKCorrect(n).flagged, true);

  // Monotonic: more correct answers can never reduce the suspicion.
  let previous = 1;
  for (let k = 0; k <= n; k += 1) {
    const p = withKCorrect(k).probability_if_unexposed;
    assert.ok(p <= previous + 1e-12, `p rose from ${previous} to ${p} at k=${k}`);
    previous = p;
  }
});

// ---------------------------------------------------------------------------
// The confound control. Without this the probe accuses everyone.
// ---------------------------------------------------------------------------
test("distractors share the target's dimension, so the item ID cannot be reasoned from", () => {
  const { challenge, key } = buildIdentificationChallenge(bank, allIds, "distractor-run");
  const describe = new Map(bank.items.map((i) => [describeItem(i), i]));

  for (const q of challenge.questions) {
    const target = bank.items.find((i) => i.id === q.item_id);
    assert.ok(target, `unknown target ${q.item_id}`);
    assert.equal(q.options.length, IDENTIFICATION_OPTIONS);

    const sameDimension = q.options.filter((o) => describe.get(o.description)?.dimension === target.dimension);
    assert.equal(
      sameDimension.length,
      IDENTIFICATION_OPTIONS,
      `question for ${q.item_id} mixed dimensions: ${q.options.map((o) => describe.get(o.description)?.dimension).join(",")}` +
        " -- a clean model could then infer the answer from the ID's dimension prefix"
    );
  }
  assert.equal(Object.keys(key).length, challenge.questions.length);
});

test("exactly one option per question is correct", () => {
  const { challenge, key } = buildIdentificationChallenge(bank, allIds, "one-correct-run");
  for (const q of challenge.questions) {
    const target = bank.items.find((i) => i.id === q.item_id);
    const matching = q.options.filter((o) => o.description === describeItem(target));
    assert.equal(matching.length, 1, `${q.item_id} had ${matching.length} options matching the target`);
    assert.equal(key[q.item_id], matching[0].option_id);
  }
});

// ---------------------------------------------------------------------------
// The answer key must never travel with the question.
// ---------------------------------------------------------------------------
test("the challenge carries no answer key, no anchors, and no item ids in its options", () => {
  const { challenge } = buildIdentificationChallenge(bank, allIds, "no-leak-run");
  const serialised = JSON.stringify(challenge);

  // Not a word-ban -- "correct" appears innocently in the instructions. What
  // must not exist is any FIELD that marks which option is the answer.
  assert.ok(!/"(is_?correct|correct_option|answer|answer_key|answerKey)"/i.test(serialised),
    "the challenge must carry no field marking the correct option");
  for (const q of challenge.questions) {
    for (const o of q.options) {
      assert.deepEqual(Object.keys(o).sort(), ["description", "option_id"]);
    }
  }
  // Anchor text would teach a clean subject the rubric it is about to be judged on.
  const anchorWords = ["1.0 Critical", "5.0 Exemplary", "Established"];
  for (const w of anchorWords) assert.ok(!serialised.includes(w), `challenge leaked anchor text: ${w}`);
});

test("the correct option is not always in the same position across questions", () => {
  // A positional tell would let a clean subject ace the test without exposure,
  // which would make every subject look contaminated.
  const positions = new Set();
  for (const seed of ["pos-1", "pos-2", "pos-3", "pos-4"]) {
    const { key } = buildIdentificationChallenge(bank, allIds, seed);
    for (const optionId of Object.values(key)) positions.add(optionId);
  }
  assert.ok(positions.size > 1, `the answer always landed in position(s) ${[...positions].join(",")}`);
});

// ---------------------------------------------------------------------------
// Determinism and degradation.
// ---------------------------------------------------------------------------
test("the same run id reproduces the same challenge, and different ids do not", () => {
  const a = buildIdentificationChallenge(bank, allIds, "seed-one");
  const b = buildIdentificationChallenge(bank, allIds, "seed-one");
  const c = buildIdentificationChallenge(bank, allIds, "seed-two");

  assert.deepEqual(a.challenge, b.challenge, "same seed must reproduce the challenge exactly");
  assert.deepEqual(a.key, b.key);
  assert.notDeepEqual(a.challenge.questions.map((q) => q.item_id), c.challenge.questions.map((q) => q.item_id));
});

test("too few items to build a forced choice degrades loudly, not silently", () => {
  const { challenge, key } = buildIdentificationChallenge(bank, allIds.slice(0, 2), "tiny-run");
  assert.equal(challenge.available, false);
  assert.equal(key, null);
  assert.match(challenge.reason, /at least/);
  assert.equal(scoreIdentification(key, []).available, false);
});

test("a single-dimension run still builds a usable challenge", () => {
  const { challenge, key } = buildIdentificationChallenge(bank, awrIds, "awr-only-run");
  assert.equal(challenge.available, true);
  assert.ok(challenge.questions.length >= 1);
  assert.ok(challenge.questions.length <= Math.min(IDENTIFICATION_COUNT, awrIds.length));
  assert.equal(Object.keys(key).length, challenge.questions.length);
});

// ---------------------------------------------------------------------------
// The statistics the verdict rests on.
// ---------------------------------------------------------------------------
test("binomialTailAtLeast matches known values", () => {
  assert.ok(Math.abs(binomialTailAtLeast(6, 6, 0.25) - 0.000244140625) < 1e-9);
  assert.equal(binomialTailAtLeast(0, 6, 0.25), 1);
  assert.equal(binomialTailAtLeast(7, 6, 0.25), 0);
  // 4 or more of 6 at p=0.25 is ~3.76%, which is why 4/6 flags at alpha 0.05.
  const p4 = binomialTailAtLeast(4, 6, 0.25);
  assert.ok(p4 > 0.03 && p4 < 0.04, `expected ~0.0376, got ${p4}`);
});

test("the reported probability and the flag cannot disagree", () => {
  const { key } = buildIdentificationChallenge(bank, allIds, "consistency-run");
  const entries = Object.entries(key);
  for (let k = 0; k <= entries.length; k += 1) {
    const scored = scoreIdentification(
      key,
      entries.map(([itemId, correct], idx) => ({
        item_id: itemId,
        option_id: idx < k ? correct : correct === "A" ? "B" : "A",
      }))
    );
    assert.equal(
      scored.flagged,
      scored.probability_if_unexposed < IDENTIFICATION_ALPHA,
      `flag and p disagree at k=${k}`
    );
    assert.ok(scored.verdict.includes(String(scored.correct)));
  }
});

test("limitations ship with the result and name what it cannot do", () => {
  const { key } = buildIdentificationChallenge(bank, allIds, "limitations-run");
  const scored = scoreIdentification(key, answersFrom(key, (c) => c));
  assert.ok(Array.isArray(scored.limitations) && scored.limitations.length >= 3);
  const text = scored.limitations.join(" ");
  assert.match(text, /RECOGNITION/, "must state it measures recognition, not anchor knowledge");
  assert.match(text, /COOPERATING/, "must state a subject can deliberately under-perform");
});
