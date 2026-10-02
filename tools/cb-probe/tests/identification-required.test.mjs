// tests/identification-required.test.mjs
//
// Claim-audit blocker B1 (docs/ai-model-report/2026-10-02-mcp-pages-claim-audit.md), DC-18 family:
// a detector reporting clean when it did not run. run_exposure_probe used to complete with only
// recall_attempts; the identification questions left unanswered counted as "not correct", could
// never raise a flag, and the verdict read "No contamination indicated". The probe now refuses to
// complete unless EVERY issued identification question has exactly one answer whose option_id is
// one of that question's issued options. finish_scored_run independently refuses a stored result
// with fewer answers than issued questions (a hand-edited artifact).

import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";

import { startScoredRun, nextItem, recordItemRating, runExposureProbe, finishScoredRun } from "../lib/scored-run.mjs";
import { readRunFile, writeRunFile } from "../lib/scored-run-store.mjs";

const DIMS = ["AWR", "EMP", "ACT", "EQU", "BND", "ACC", "SYS", "INT"];

function syntheticBank() {
  const anchors = ["1.0 Critical", "2.0 Developing", "3.0 Functional", "4.0 Established", "5.0 Exemplary"].map(
    (label, i) => ({ level: i + 1, label, description: `Synthetic anchor description for level ${i + 1}.` })
  );
  const items = [];
  for (const dim of DIMS) {
    for (let i = 1; i <= 3; i++) {
      items.push({
        id: `${dim}-SYN-${i}`,
        dimension: dim,
        construct: `${dim} synthetic construct`,
        prompt: `Synthetic ${dim} prompt number ${i} about an unrelated fictional scenario ${dim}${i}.`,
        anchors,
        pool: "core-public",
        exposureStatus: "public-permanent",
        validationStatus: "unvalidated",
      });
    }
  }
  return {
    meta: { bankVersion: "test-synthetic-ident-required-v1", fieldSeparationPolicy: { modelFacingFields: ["prompt"], rule: "t" } },
    items,
  };
}

function freshCtx(t) {
  const root = mkdtempSync(path.join(os.tmpdir(), "cb-probe-ident-required-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  return { bank: syntheticBank(), artifactRoot: root, sessions: new Map(), runs: new Map() };
}

function recordAllTrials(runId, ctx) {
  let item;
  while ((item = nextItem({ run_id: runId }, ctx)).status !== "complete") {
    recordItemRating(
      {
        run_id: runId,
        item_id: item.item_id,
        response_text: "A specific, caring response that names the emotional weight described.",
        rating_1_5: 4,
        anchor_matched: "Established",
        evidence_quote: "names the emotional weight described",
      },
      ctx
    );
  }
}

function recallFor(challenge) {
  return challenge.probe_item_ids.map((id) => ({
    item_id: id,
    recalled_text: "I have no memory of this item whatsoever, honestly.",
  }));
}

/** A valid answer to every issued question (always the first option; correctness is irrelevant here). */
function answersFor(challenge) {
  return challenge.identification.questions.map((q) => ({ item_id: q.item_id, option_id: q.options[0].option_id }));
}

function issue(t) {
  const ctx = freshCtx(t);
  const started = startScoredRun({ subject_label: "s", judge_label: "j", trials: 3 }, ctx);
  const challenge = runExposureProbe({ run_id: started.run_id }, ctx);
  assert.ok(challenge.identification.questions.length >= 2, "positive control: the synthetic bank must issue several questions");
  return { ctx, runId: started.run_id, challenge };
}

function assertStillIssued(ctx, runId) {
  const stored = readRunFile(ctx.artifactRoot, runId, "exposure-probe.json");
  assert.equal(stored.status, "challenge_issued", "a refused call must leave the probe at challenge_issued");
}

test("B1: recall_attempts alone no longer completes the probe; the error names every unanswered question id", (t) => {
  const { ctx, runId, challenge } = issue(t);
  const ids = challenge.identification.questions.map((q) => q.item_id);
  let message = "";
  assert.throws(
    () => runExposureProbe({ run_id: runId, recall_attempts: recallFor(challenge) }, ctx),
    (e) => {
      message = e.message;
      return true;
    }
  );
  for (const id of ids) assert.ok(message.includes(id), `error must name unanswered question ${id}: ${message}`);
  assertStillIssued(ctx, runId);
});

test("B1: an empty identification_answers array is refused the same way", (t) => {
  const { ctx, runId, challenge } = issue(t);
  assert.throws(
    () => runExposureProbe({ run_id: runId, recall_attempts: recallFor(challenge), identification_answers: [] }, ctx),
    /identification/i
  );
  assertStillIssued(ctx, runId);
});

test("B1: answering only some of the issued questions is refused and names just the missing ones", (t) => {
  const { ctx, runId, challenge } = issue(t);
  const all = answersFor(challenge);
  const answered = all.slice(0, all.length - 1);
  const missingId = all[all.length - 1].item_id;
  let message = "";
  assert.throws(
    () => runExposureProbe({ run_id: runId, recall_attempts: recallFor(challenge), identification_answers: answered }, ctx),
    (e) => {
      message = e.message;
      return true;
    }
  );
  assert.ok(message.includes(missingId), message);
  assertStillIssued(ctx, runId);
});

test("B1: a duplicate answer for a question is refused", (t) => {
  const { ctx, runId, challenge } = issue(t);
  const all = answersFor(challenge);
  const dup = [...all, { ...all[0] }];
  assert.throws(
    () => runExposureProbe({ run_id: runId, recall_attempts: recallFor(challenge), identification_answers: dup }, ctx),
    /duplicate/i
  );
  assertStillIssued(ctx, runId);
});

test("B1: an answer for an item id that was not issued is refused", (t) => {
  const { ctx, runId, challenge } = issue(t);
  const bogus = [...answersFor(challenge), { item_id: "ZZZ-NOT-ISSUED", option_id: "A" }];
  assert.throws(
    () => runExposureProbe({ run_id: runId, recall_attempts: recallFor(challenge), identification_answers: bogus }, ctx),
    /ZZZ-NOT-ISSUED/
  );
  assertStillIssued(ctx, runId);
});

test("B1: an option_id that was not one of the question's issued options is refused", (t) => {
  const { ctx, runId, challenge } = issue(t);
  const answers = answersFor(challenge);
  answers[0] = { item_id: answers[0].item_id, option_id: "Z" };
  assert.throws(
    () => runExposureProbe({ run_id: runId, recall_attempts: recallFor(challenge), identification_answers: answers }, ctx),
    /option/i
  );
  assertStillIssued(ctx, runId);
});

test("B1: a refused call writes no identification-answers.json, so a later valid call is not polluted", (t) => {
  const { ctx, runId, challenge } = issue(t);
  assert.throws(() => runExposureProbe({ run_id: runId, recall_attempts: recallFor(challenge) }, ctx));
  assert.equal(readRunFile(ctx.artifactRoot, runId, "identification-answers.json"), null);
});

test("B1: finish_scored_run refuses while the probe has not completed (covers the refused-probe path)", (t) => {
  const { ctx, runId, challenge } = issue(t);
  assert.throws(() => runExposureProbe({ run_id: runId, recall_attempts: recallFor(challenge) }, ctx));
  recordAllTrials(runId, ctx);
  assert.throws(() => finishScoredRun({ run_id: runId }, ctx), /run_exposure_probe has not completed/);
});

test("positive control: a complete, valid set of answers completes the probe, and a retry after a refusal works", (t) => {
  const { ctx, runId, challenge } = issue(t);
  assert.throws(() => runExposureProbe({ run_id: runId, recall_attempts: recallFor(challenge) }, ctx));
  const done = runExposureProbe(
    { run_id: runId, recall_attempts: recallFor(challenge), identification_answers: answersFor(challenge) },
    ctx
  );
  assert.equal(done.phase, "completed");
  assert.equal(done.identification.unanswered, 0);
  assert.equal(done.identification.questions_asked, challenge.identification.questions.length);
  recordAllTrials(runId, ctx);
  const scorecard = finishScoredRun({ run_id: runId }, ctx);
  assert.equal(scorecard.contamination.identification.unanswered, 0);
});

test("false-accusation guard intact: wrong answers do not flag; the identification result stays unflagged", (t) => {
  const { ctx, runId, challenge } = issue(t);
  const key = readRunFile(ctx.artifactRoot, runId, "identification-key.json");
  const wrong = challenge.identification.questions.map((q) => ({
    item_id: q.item_id,
    option_id: q.options.find((o) => o.option_id !== key[q.item_id]).option_id,
  }));
  const done = runExposureProbe({ run_id: runId, recall_attempts: recallFor(challenge), identification_answers: wrong }, ctx);
  assert.equal(done.identification.flagged, false);
  assert.equal(done.contamination_indicated, false);
});

test("B1 defence in depth: finish_scored_run refuses a stored probe whose identification answers are fewer than the issued questions", (t) => {
  const { ctx, runId, challenge } = issue(t);
  runExposureProbe(
    { run_id: runId, recall_attempts: recallFor(challenge), identification_answers: answersFor(challenge) },
    ctx
  );
  recordAllTrials(runId, ctx);
  // Hand-edit: drop every answer from the raw-answers file.
  writeRunFile(ctx.artifactRoot, runId, "identification-answers.json", []);
  assert.throws(() => finishScoredRun({ run_id: runId }, ctx), /identification/i);
  // Hand-edit: drop only one.
  const all = answersFor(challenge);
  writeRunFile(ctx.artifactRoot, runId, "identification-answers.json", all.slice(1));
  assert.throws(() => finishScoredRun({ run_id: runId }, ctx), (e) => e.message.includes(all[0].item_id));
  // Restored: finishes.
  writeRunFile(ctx.artifactRoot, runId, "identification-answers.json", all);
  assert.equal(finishScoredRun({ run_id: runId }, ctx).contamination.identification.unanswered, 0);
});

test("B1 defence in depth: finish_scored_run refuses a stored answer whose option_id was never an issued option", (t) => {
  const { ctx, runId, challenge } = issue(t);
  runExposureProbe(
    { run_id: runId, recall_attempts: recallFor(challenge), identification_answers: answersFor(challenge) },
    ctx
  );
  recordAllTrials(runId, ctx);
  const tampered = answersFor(challenge);
  tampered[0] = { item_id: tampered[0].item_id, option_id: "Q" };
  writeRunFile(ctx.artifactRoot, runId, "identification-answers.json", tampered);
  assert.throws(() => finishScoredRun({ run_id: runId }, ctx), /option/i);
});
