import test from "node:test";
import assert from "node:assert/strict";

import { routeResponses, buildJudgeBatches } from "../lib/judge-batches.mjs";
import { validateSubjectAnswers } from "../lib/ingest.mjs";
import { validateJudgeAnswers, isVerbatimSubstring } from "../lib/judge-answers.mjs";
import { mulberry32, SUBJECTS, JUDGES_PER_RESPONSE } from "../lib/common.mjs";
import { makeSyntheticBank, SUBJECT_LABELS } from "./helpers.mjs";

function fakeResponses(bank, subjects, trials = 3) {
  const served = bank.items.filter((i) => i.validationStatus !== "draft-authored-unreviewed" && i.id !== "ACT-1-A");
  const out = [];
  let n = 0;
  for (const subject of subjects) {
    for (let trial = 1; trial <= trials; trial += 1) {
      for (const item of served) {
        n += 1;
        out.push({ subject, trial, brief_id: `b-${subject}-${trial}`, code: `q-${n}`, item_id: item.id, response: `reply ${n} words words words` });
      }
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Routing: property tests
// ---------------------------------------------------------------------------
test("PROPERTY: routing never sends a response to its own subject, always to exactly two distinct judges, across many seeds and sizes", () => {
  let checked = 0;
  for (let seed = 1; seed <= 60; seed += 1) {
    for (const per of [1, 2, 3, 7, 24, 83]) {
      const responses = [];
      for (const s of SUBJECT_LABELS) for (let i = 0; i < per; i += 1) responses.push({ subject: s });
      const routes = routeResponses(responses, SUBJECT_LABELS, mulberry32(seed));
      routes.forEach((judges, i) => {
        assert.equal(judges.length, JUDGES_PER_RESPONSE);
        assert.equal(new Set(judges).size, JUDGES_PER_RESPONSE, "judges must be distinct");
        assert.ok(!judges.includes(responses[i].subject), `response from ${responses[i].subject} routed to itself`);
        for (const j of judges) assert.ok(SUBJECT_LABELS.includes(j));
        checked += 1;
      });
    }
  }
  assert.ok(checked > 10000);
});

test("PROPERTY: load is balanced overall and per subject", () => {
  for (let seed = 1; seed <= 40; seed += 1) {
    const responses = [];
    for (const s of SUBJECT_LABELS) for (let i = 0; i < 249; i += 1) responses.push({ subject: s });
    const routes = routeResponses(responses, SUBJECT_LABELS, mulberry32(seed));
    const load = Object.fromEntries(SUBJECT_LABELS.map((s) => [s, 0]));
    const perSubject = {};
    routes.forEach((judges, i) => {
      for (const j of judges) {
        load[j] += 1;
        perSubject[`${responses[i].subject}>${j}`] = (perSubject[`${responses[i].subject}>${j}`] ?? 0) + 1;
      }
    });
    const vals = Object.values(load);
    assert.ok(Math.max(...vals) - Math.min(...vals) <= 1, `overall judge load ${JSON.stringify(load)}`);
    // each judge rates exactly two thirds of each other subject's responses
    for (const v of Object.values(perSubject)) assert.equal(v, 166);
  }
});

test("routing with three subjects sends every response to both other models, and needs at least three", () => {
  const three = ["a", "b", "c"];
  const routes = routeResponses([{ subject: "a" }, { subject: "b" }, { subject: "c" }], three, mulberry32(1));
  assert.deepEqual(routes, [["b", "c"], ["a", "c"], ["a", "b"]]);
  assert.throws(() => routeResponses([{ subject: "a" }], ["a", "b"], mulberry32(1)), /at least 3 subjects/);
});

test("PROPERTY (end to end through buildJudgeBatches): every routed pair in the key and in the batch files respects the rule", () => {
  const bank = makeSyntheticBank();
  const responses = fakeResponses(bank, SUBJECT_LABELS);
  const { batches, key } = buildJudgeBatches({ bank, responses, subjects: SUBJECT_LABELS, seed: 9, batchSize: 40, runId: "t" });

  const subjectOf = new Map(key.responses.map((r) => [r.response_id, r.subject]));
  const seenPairs = new Map();
  for (const kb of key.batches) {
    for (const id of kb.response_ids) {
      assert.notEqual(kb.judge, subjectOf.get(id), "a batch for judge X contains a response by X");
      seenPairs.set(id, [...(seenPairs.get(id) ?? []), kb.judge]);
    }
  }
  assert.equal(seenPairs.size, responses.length);
  for (const [, judges] of seenPairs) {
    assert.equal(judges.length, 2);
    assert.equal(new Set(judges).size, 2);
  }
  for (const kb of key.batches) assert.ok(kb.response_ids.length <= 40);
  // the batch files themselves agree with the key
  for (const { judge, batch } of batches) {
    for (const e of batch.entries) assert.notEqual(subjectOf.get(e.response_id), judge);
  }
  // near-even batch sizes: no runt batch
  for (const judge of SUBJECT_LABELS) {
    const sizes = key.batches.filter((b) => b.judge === judge).map((b) => b.response_ids.length);
    assert.ok(Math.max(...sizes) - Math.min(...sizes) <= 1, JSON.stringify(sizes));
  }
});

test("judge batches carry the verbatim prompt, the full ladder and the response, and nothing that identifies the subject", () => {
  const bank = makeSyntheticBank();
  const responses = fakeResponses(bank, SUBJECT_LABELS);
  const { batches, key } = buildJudgeBatches({ bank, responses, subjects: SUBJECT_LABELS, seed: 3, batchSize: 40, runId: "run-xyz" });
  const items = new Map(bank.items.map((i) => [i.id, i]));
  const byResp = new Map(key.responses.map((r) => [r.response_id, r]));
  const idSet = new Set();
  for (const { batch, markdown, base } of batches) {
    assert.deepEqual(Object.keys(batch).sort(), ["answer_schema", "batch_id", "entries", "instructions"]);
    for (const e of batch.entries) {
      const k = byResp.get(e.response_id);
      const item = items.get(k.item_id);
      assert.equal(e.item_prompt, item.prompt);
      assert.deepEqual(e.anchors, item.anchors.map(({ level, label, description }) => ({ level, label, description })));
      assert.equal(e.anchors.length, 5);
      const original = responses.find((r) => r.subject === k.subject && r.trial === k.trial && r.item_id === k.item_id);
      assert.equal(e.response, original.response);
      for (const forbidden of ["subject", "trial", "code", "brief_id", "item_id", "judges"]) assert.ok(!(forbidden in e));
      idSet.add(e.response_id);
    }
    // no subject label, trial marker, brief id, run id or code anywhere in the text a judge receives
    const text = JSON.stringify(batch) + markdown;
    assert.doesNotMatch(text, /haiku|sonnet|opus|fable/i, base);
    assert.doesNotMatch(text, /trial/i, base);
    assert.ok(!text.includes("run-xyz"));
    for (const r of key.responses.slice(0, 50)) {
      assert.ok(!text.includes(r.brief_id) && !text.includes(r.code));
    }
    // response ids are opaque: not sequential, not derived from the subject
    for (const e of batch.entries) assert.match(e.response_id, /^r-[a-z0-9]{10}$/);
  }
  assert.equal(idSet.size, responses.length);
});

test("within a batch the order is shuffled: entries are not grouped by subject or by item", () => {
  const bank = makeSyntheticBank();
  const responses = fakeResponses(bank, SUBJECT_LABELS);
  const { batches, key } = buildJudgeBatches({ bank, responses, subjects: SUBJECT_LABELS, seed: 4, batchSize: 40, runId: "t" });
  const byResp = new Map(key.responses.map((r) => [r.response_id, r]));
  let runsOfSameSubject = 0;
  let total = 0;
  for (const { batch } of batches) {
    const subs = batch.entries.map((e) => byResp.get(e.response_id).subject);
    for (let i = 1; i < subs.length; i += 1) {
      total += 1;
      if (subs[i] === subs[i - 1]) runsOfSameSubject += 1;
    }
  }
  // two possible subjects per judge: unshuffled data would give ~100% adjacency, shuffled about 50%.
  assert.ok(runsOfSameSubject / total < 0.7, `adjacency ${runsOfSameSubject / total}`);
});

// ---------------------------------------------------------------------------
// Subject answer validation
// ---------------------------------------------------------------------------
const briefKey = { brief_id: "b-1", subject: "claude-opus", trial: 2, codes: { "q-a": "AWR-1-A", "q-b": "EMP-2-A", "q-c": "ACT-3-A" } };
const good = () => ({ brief_id: "b-1", answers: [{ code: "q-a", response: "x" }, { code: "q-b", response: "y" }, { code: "q-c", response: "z" }] });

test("a complete, exact subject answer file is accepted and resolved to item ids", () => {
  const r = validateSubjectAnswers(good(), briefKey, "f");
  assert.deepEqual(r.errors, []);
  assert.deepEqual(r.responses.map((x) => x.item_id), ["AWR-1-A", "EMP-2-A", "ACT-3-A"]);
});

test("a MISSING answer code is rejected", () => {
  const p = good();
  p.answers.pop();
  const r = validateSubjectAnswers(p, briefKey, "f");
  assert.ok(r.errors.some((e) => /not answered: q-c/.test(e)), r.errors.join("|"));
});

test("a DUPLICATE answer code is rejected", () => {
  const p = good();
  p.answers.push({ code: "q-a", response: "again" });
  const r = validateSubjectAnswers(p, briefKey, "f");
  assert.ok(r.errors.some((e) => /"q-a" is answered more than once/.test(e)), r.errors.join("|"));
});

test("an EXTRA code, an empty response, a wrong brief_id, a control byte and an unknown key are each rejected", () => {
  let p = good();
  p.answers.push({ code: "q-zzz", response: "extra" });
  assert.ok(validateSubjectAnswers(p, briefKey, "f").errors.some((e) => /extra code/.test(e)));

  p = good();
  p.answers[1].response = "   ";
  assert.ok(validateSubjectAnswers(p, briefKey, "f").errors.some((e) => /non-empty/.test(e)));

  p = good();
  p.brief_id = "b-other";
  assert.ok(validateSubjectAnswers(p, briefKey, "f").errors.some((e) => /does not match/.test(e)));

  p = good();
  p.answers[0].response = `bad${String.fromCharCode(27)}byte`;
  assert.ok(validateSubjectAnswers(p, briefKey, "f").errors.some((e) => /control byte/.test(e)));

  p = good();
  p.answers[0].rating = 5;
  assert.ok(validateSubjectAnswers(p, briefKey, "f").errors.some((e) => /unexpected key "rating"/.test(e)));
});

// ---------------------------------------------------------------------------
// Judge answer validation: evidence_quote
// ---------------------------------------------------------------------------
const responsesById = new Map([
  ["r-1", { response: "I am so sorry you are going through this.\nHere are three small steps you can take today." }],
  ["r-2", { response: "Take the job." }],
]);
const batchKey = { batch_id: "jb-1", judge: "claude-sonnet", response_ids: ["r-1", "r-2"] };
const rated = (over = {}) => ({
  batch_id: "jb-1",
  ratings: [
    { response_id: "r-1", rating_1_5: 4, anchor_matched: "4.0 Established", evidence_quote: "so sorry you are going through this", ...over },
    { response_id: "r-2", rating_1_5: 2, anchor_matched: "2.0 Developing", evidence_quote: "Take the job." },
  ],
});

test("an evidence_quote that is a verbatim substring is accepted (including across a line wrap)", () => {
  assert.deepEqual(validateJudgeAnswers(rated(), batchKey, responsesById, "f").errors, []);
  const wrapped = rated({ evidence_quote: "this. Here are three small steps" });
  assert.deepEqual(validateJudgeAnswers(wrapped, batchKey, responsesById, "f").errors, []);
});

test("an evidence_quote that is NOT a substring is rejected: paraphrase, wrong case, and a quote from a different response", () => {
  for (const bad of ["deeply sorry about what you face", "SO SORRY YOU ARE GOING THROUGH THIS", "Take the job"]) {
    const r = validateJudgeAnswers(rated({ evidence_quote: bad }), batchKey, responsesById, "f");
    assert.ok(r.errors.some((e) => /not a verbatim substring/.test(e)), `${bad}: ${r.errors.join("|")}`);
  }
  assert.equal(isVerbatimSubstring("abc def", "abc  def"), true);
  assert.equal(isVerbatimSubstring("abc def", ""), false);
});

test("a missing rating, a duplicate rating, a response outside the batch and a bad rating value are rejected", () => {
  let p = rated();
  p.ratings.pop();
  assert.ok(validateJudgeAnswers(p, batchKey, responsesById, "f").errors.some((e) => /not rated: r-2/.test(e)));

  p = rated();
  p.ratings.push({ ...p.ratings[0] });
  assert.ok(validateJudgeAnswers(p, batchKey, responsesById, "f").errors.some((e) => /rated more than once/.test(e)));

  p = rated();
  p.ratings[0].response_id = "r-elsewhere";
  assert.ok(validateJudgeAnswers(p, batchKey, responsesById, "f").errors.some((e) => /not in this batch/.test(e)));

  for (const bad of [0, 6, 3.5, "4", null]) {
    const r = validateJudgeAnswers(rated({ rating_1_5: bad }), batchKey, responsesById, "f");
    assert.ok(r.errors.some((e) => /rating_1_5 must be an integer 1-5/.test(e)), String(bad));
  }
});
