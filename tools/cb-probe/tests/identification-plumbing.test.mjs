// tests/identification-plumbing.test.mjs
//
// The identification probe's result must reach the scorecard. Until the 2026-10-01 fix,
// finish_scored_run rebuilt the exposure probe from the recall attempts only
// and dropped `identification`, so every scorecard carried
// `contamination.identification: null` and `contamination_indicated` ignored
// the identification test -- a subject flagged 6/6 got a "no contamination"
// scorecard. See CHANGELOG "2026-10-01".

import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, unlinkSync } from "node:fs";
import os from "node:os";
import path from "node:path";

import { startScoredRun, nextItem, recordItemRating, runExposureProbe, finishScoredRun } from "../lib/scored-run.mjs";
import { readRunFile, writeRunFile, runDir } from "../lib/scored-run-store.mjs";
import { validateSelfRunScorecard } from "../lib/validate-scorecard.mjs";

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
    meta: { bankVersion: "test-synthetic-ident-v1", fieldSeparationPolicy: { modelFacingFields: ["prompt"], rule: "t" } },
    items,
  };
}

function freshCtx(t) {
  const root = mkdtempSync(path.join(os.tmpdir(), "cb-probe-ident-plumbing-"));
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

/**
 * Drive a full run. `answerMode`: "correct" | "wrong" | "none-key" (delete the
 * key file before scoring, so no identification challenge can be scored).
 */
function runToScorecard(t, answerMode) {
  const ctx = freshCtx(t);
  const started = startScoredRun({ subject_label: "s", judge_label: "j", trials: 3 }, ctx);
  const runId = started.run_id;
  const challenge = runExposureProbe({ run_id: runId }, ctx);
  const key = readRunFile(ctx.artifactRoot, runId, "identification-key.json");
  const answers = (challenge.identification.questions ?? []).map((q) => {
    const correct = key[q.item_id];
    const wrong = q.options.find((o) => o.option_id !== correct).option_id;
    return { item_id: q.item_id, option_id: answerMode === "correct" ? correct : wrong };
  });
  if (answerMode === "none-key") unlinkSync(path.join(runDir(ctx.artifactRoot, runId), "identification-key.json"));
  runExposureProbe(
    {
      run_id: runId,
      recall_attempts: challenge.probe_item_ids.map((id) => ({
        item_id: id,
        recalled_text: "I have no memory of this item whatsoever, honestly.",
      })),
      identification_answers: answers,
    },
    ctx
  );
  recordAllTrials(runId, ctx);
  return { ctx, runId, answers, scorecard: finishScoredRun({ run_id: runId }, ctx) };
}

test("NEGATIVE CONTROL: all-correct identification (flagged) with low recall overlap -> scorecard indicates contamination", (t) => {
  const { scorecard } = runToScorecard(t, "correct");
  assert.equal(scorecard.contamination.high_exposure_item_ids.length, 0, "recall overlap must be low in this scenario");
  assert.notEqual(scorecard.contamination.identification, null, "identification must reach the scorecard");
  assert.equal(scorecard.contamination.identification.available, true);
  assert.equal(scorecard.contamination.identification.flagged, true);
  assert.equal(scorecard.contamination.identification.correct, scorecard.contamination.identification.questions_asked);
  assert.equal(scorecard.contamination.contamination_indicated, true);
  assert.deepEqual(validateSelfRunScorecard(scorecard).errors, []);
});

test("unflagged identification is present in the scorecard with available:true, flagged:false", (t) => {
  const { scorecard } = runToScorecard(t, "wrong");
  const ident = scorecard.contamination.identification;
  assert.equal(ident.available, true);
  assert.equal(ident.flagged, false);
  assert.equal(ident.correct, 0);
  assert.equal(scorecard.contamination.contamination_indicated, false);
  assert.deepEqual(validateSelfRunScorecard(scorecard).errors, []);
});

test("no identification key -> scorecard carries identification {available:false}, never null", (t) => {
  const { scorecard } = runToScorecard(t, "none-key");
  const ident = scorecard.contamination.identification;
  assert.notEqual(ident, null);
  assert.equal(ident.available, false);
  assert.equal(scorecard.contamination.contamination_indicated, false);
  assert.deepEqual(validateSelfRunScorecard(scorecard).errors, []);
});

test("TAMPER: editing exposure-probe.json to flagged:false does not change a flagged scorecard", (t) => {
  const { ctx, runId, scorecard } = runToScorecard(t, "correct");
  assert.equal(scorecard.contamination.identification.flagged, true);
  const probe = readRunFile(ctx.artifactRoot, runId, "exposure-probe.json");
  probe.identification.flagged = false;
  probe.identification.correct = 0;
  probe.identification.probability_if_unexposed = 1;
  probe.identification.results.forEach((r) => {
    r.correct = false;
  });
  probe.contamination_indicated = false;
  writeRunFile(ctx.artifactRoot, runId, "exposure-probe.json", probe);
  const again = finishScoredRun({ run_id: runId }, ctx);
  assert.equal(again.contamination.identification.flagged, true);
  assert.equal(again.contamination.identification.correct, scorecard.contamination.identification.correct);
  assert.equal(again.contamination.contamination_indicated, true);
});

test("TAMPER: deleting the identification block from exposure-probe.json still yields the re-derived flagged result", (t) => {
  const { ctx, runId } = runToScorecard(t, "correct");
  const probe = readRunFile(ctx.artifactRoot, runId, "exposure-probe.json");
  delete probe.identification;
  writeRunFile(ctx.artifactRoot, runId, "exposure-probe.json", probe);
  // The raw submitted answers are persisted separately (identification-answers.json).
  const again = finishScoredRun({ run_id: runId }, ctx);
  assert.equal(again.contamination.identification.available, true);
  assert.equal(again.contamination.identification.flagged, true);
  assert.equal(again.contamination.contamination_indicated, true);
});

test("legacy run (no identification-answers.json) falls back to results[].answered_option and still re-derives flagged", (t) => {
  const { ctx, runId } = runToScorecard(t, "correct");
  unlinkSync(path.join(runDir(ctx.artifactRoot, runId), "identification-answers.json"));
  const probe = readRunFile(ctx.artifactRoot, runId, "exposure-probe.json");
  probe.identification.flagged = false; // disk claim must be ignored
  writeRunFile(ctx.artifactRoot, runId, "exposure-probe.json", probe);
  const again = finishScoredRun({ run_id: runId }, ctx);
  assert.equal(again.contamination.identification.flagged, true);
  assert.equal(again.contamination.contamination_indicated, true);
});

// ---------------------------------------------------------------------------
// Validator gate
// ---------------------------------------------------------------------------
test("validator: refuses null / missing contamination.identification; refuses contamination_indicated:false with flagged:true; accepts both valid forms", (t) => {
  const { scorecard } = runToScorecard(t, "wrong");
  const clone = () => JSON.parse(JSON.stringify(scorecard));

  const nulled = clone();
  nulled.contamination.identification = null;
  assert.equal(validateSelfRunScorecard(nulled).valid, false);
  assert.ok(validateSelfRunScorecard(nulled).errors.some((e) => /contamination\.identification/.test(e)));

  const missing = clone();
  delete missing.contamination.identification;
  assert.equal(validateSelfRunScorecard(missing).valid, false);

  const lying = clone();
  lying.contamination.identification.flagged = true;
  lying.contamination.contamination_indicated = false;
  const lyingResult = validateSelfRunScorecard(lying);
  assert.equal(lyingResult.valid, false);
  assert.ok(lyingResult.errors.some((e) => /contamination_indicated/.test(e)));

  const flaggedOk = clone();
  flaggedOk.contamination.identification.flagged = true;
  flaggedOk.contamination.contamination_indicated = true;
  assert.deepEqual(validateSelfRunScorecard(flaggedOk).errors, []);

  const unavailable = clone();
  unavailable.contamination.identification = { available: false, reason: "No identification challenge was issued for this run." };
  assert.deepEqual(validateSelfRunScorecard(unavailable).errors, []);

  assert.deepEqual(validateSelfRunScorecard(scorecard).errors, []);
});
