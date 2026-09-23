// tests/scored-run.test.mjs
//
// Unit-level coverage of the scored-run tool handlers (lib/scored-run.mjs)
// and the SelfRunScorecard they build. Exercises the handlers directly
// (like tests/rating-validation.test.mjs does for the JudgeEstimate path),
// not over the stdio transport -- see tests/e2e-scored-run.test.mjs for the
// real-process JSON-RPC run.

import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";

import { loadBank } from "../lib/bank.mjs";
import {
  startScoredRun,
  nextItem,
  recordItemRating,
  runExposureProbe,
  finishScoredRun,
  MIN_TRIALS,
} from "../lib/scored-run.mjs";
import { ToolError } from "../lib/tools.mjs";
import { validateSelfRunScorecard } from "../lib/validate-scorecard.mjs";
import { validateJudgeEstimate } from "../lib/validate-estimate.mjs";
import { buildJudgeEstimate } from "../lib/judge-estimate.mjs";
import { computeCompositeFromDimensions, getBand } from "../../../site/scripts/lib/scoring.mjs";

function freshCtx(t) {
  const bank = loadBank();
  const root = mkdtempSync(path.join(os.tmpdir(), "cb-probe-scored-run-test-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  return { bank, artifactRoot: root, sessions: new Map(), runs: new Map() };
}

function completeExposureProbe(runId, ctx, { verbatim = false } = {}) {
  const challenge = runExposureProbe({ run_id: runId }, ctx);
  const recallAttempts = challenge.probe_item_ids.map((itemId) => ({
    item_id: itemId,
    recalled_text: verbatim ? realPromptFor(ctx, itemId) : "I have no memory of this item.",
  }));
  return runExposureProbe({ run_id: runId, recall_attempts: recallAttempts }, ctx);
}

function realPromptFor(ctx, itemId) {
  return ctx.bank.items.find((i) => i.id === itemId)?.prompt ?? "";
}

/** Drive a full run (all planned trials) to completion with a fixed rating. */
function completeAllTrials(runId, ctx, { rating = 4, anchorLabel = "Established" } = {}) {
  let item;
  let count = 0;
  while ((item = nextItem({ run_id: runId }, ctx)).status !== "complete") {
    recordItemRating(
      {
        run_id: runId,
        item_id: item.item_id,
        response_text: "A specific, caring response that names the emotional weight described.",
        rating_1_5: rating,
        anchor_matched: anchorLabel,
        evidence_quote: "names the emotional weight described",
      },
      ctx
    );
    count += 1;
    if (count > 500) throw new Error("test loop guard tripped");
  }
  return count;
}

// ---------------------------------------------------------------------------
// trials < 3 refused
// ---------------------------------------------------------------------------
test("start_scored_run refuses trials below the variance floor (3)", (t) => {
  const ctx = freshCtx(t);
  assert.throws(
    () => startScoredRun({ subject_label: "s", judge_label: "j", dimensions: ["AWR"], trials: 2 }, ctx),
    ToolError
  );
  assert.throws(
    () => startScoredRun({ subject_label: "s", judge_label: "j", dimensions: ["AWR"], trials: 1 }, ctx),
    ToolError
  );
});

test("start_scored_run accepts the floor value itself and MIN_TRIALS matches the evaluation-statistics threshold", (t) => {
  const ctx = freshCtx(t);
  assert.equal(MIN_TRIALS, 3);
  const started = startScoredRun(
    { subject_label: "s", judge_label: "j", dimensions: ["AWR"], trials: MIN_TRIALS },
    ctx
  );
  assert.equal(started.trials_per_item, 3);
});

test("start_scored_run defaults judgeConfiguration to cross when omitted", (t) => {
  const ctx = freshCtx(t);
  const started = startScoredRun({ subject_label: "s", judge_label: "j", dimensions: ["AWR"], trials: 3 }, ctx);
  assert.equal(started.judge_configuration, "cross");
});

test("start_scored_run rejects an unknown judgeConfiguration", (t) => {
  const ctx = freshCtx(t);
  assert.throws(
    () =>
      startScoredRun(
        { subject_label: "s", judge_label: "j", judgeConfiguration: "solo", dimensions: ["AWR"], trials: 3 },
        ctx
      ),
    ToolError
  );
});

// ---------------------------------------------------------------------------
// a rating with no anchor or no quote is refused
// ---------------------------------------------------------------------------
test("record_item_rating rejects a rating missing anchor_matched", (t) => {
  const ctx = freshCtx(t);
  const started = startScoredRun({ subject_label: "s", judge_label: "j", dimensions: ["AWR"], trials: 3 }, ctx);
  const item = nextItem({ run_id: started.run_id }, ctx);
  assert.throws(
    () =>
      recordItemRating(
        {
          run_id: started.run_id,
          item_id: item.item_id,
          response_text: "Names the emotional weight before offering options.",
          rating_1_5: 4,
          anchor_matched: "",
          evidence_quote: "Names the emotional weight",
        },
        ctx
      ),
    ToolError
  );
});

test("record_item_rating rejects a rating missing evidence_quote", (t) => {
  const ctx = freshCtx(t);
  const started = startScoredRun({ subject_label: "s", judge_label: "j", dimensions: ["AWR"], trials: 3 }, ctx);
  const item = nextItem({ run_id: started.run_id }, ctx);
  assert.throws(
    () =>
      recordItemRating(
        {
          run_id: started.run_id,
          item_id: item.item_id,
          response_text: "Names the emotional weight before offering options.",
          rating_1_5: 4,
          anchor_matched: "Established",
          evidence_quote: "",
        },
        ctx
      ),
    ToolError
  );
});

test("record_item_rating rejects an evidence_quote that is not actually in response_text", (t) => {
  const ctx = freshCtx(t);
  const started = startScoredRun({ subject_label: "s", judge_label: "j", dimensions: ["AWR"], trials: 3 }, ctx);
  const item = nextItem({ run_id: started.run_id }, ctx);
  assert.throws(
    () =>
      recordItemRating(
        {
          run_id: started.run_id,
          item_id: item.item_id,
          response_text: "Names the emotional weight before offering options.",
          rating_1_5: 4,
          anchor_matched: "Established",
          evidence_quote: "a sentence that never appears in the response at all",
        },
        ctx
      ),
    ToolError
  );
});

// ---------------------------------------------------------------------------
// finish_scored_run refused before the probe / before all trials
// ---------------------------------------------------------------------------
test("finish_scored_run refuses before run_exposure_probe has completed", (t) => {
  const ctx = freshCtx(t);
  const started = startScoredRun({ subject_label: "s", judge_label: "j", dimensions: ["AWR"], trials: 3 }, ctx);
  completeAllTrials(started.run_id, ctx);
  assert.throws(() => finishScoredRun({ run_id: started.run_id }, ctx), ToolError);
});

test("finish_scored_run refuses when the exposure probe was only issued, not scored", (t) => {
  const ctx = freshCtx(t);
  const started = startScoredRun({ subject_label: "s", judge_label: "j", dimensions: ["AWR"], trials: 3 }, ctx);
  completeAllTrials(started.run_id, ctx);
  runExposureProbe({ run_id: started.run_id }, ctx); // phase 1 only -- no recall_attempts
  assert.throws(() => finishScoredRun({ run_id: started.run_id }, ctx), ToolError);
});

test("finish_scored_run refuses before every planned trial has been recorded", (t) => {
  const ctx = freshCtx(t);
  const started = startScoredRun({ subject_label: "s", judge_label: "j", dimensions: ["AWR"], trials: 3 }, ctx);
  completeExposureProbe(started.run_id, ctx);
  // Record only one trial instead of all 15 (5 items x 3 trials).
  const item = nextItem({ run_id: started.run_id }, ctx);
  recordItemRating(
    {
      run_id: started.run_id,
      item_id: item.item_id,
      response_text: "A caring, specific response.",
      rating_1_5: 4,
      anchor_matched: "Established",
      evidence_quote: "caring, specific",
    },
    ctx
  );
  assert.throws(() => finishScoredRun({ run_id: started.run_id }, ctx), ToolError);
});

test("finish_scored_run succeeds once the probe has completed and every trial is recorded", (t) => {
  const ctx = freshCtx(t);
  const started = startScoredRun({ subject_label: "s", judge_label: "j", dimensions: ["AWR"], trials: 3 }, ctx);
  completeExposureProbe(started.run_id, ctx);
  completeAllTrials(started.run_id, ctx);
  const scorecard = finishScoredRun({ run_id: started.run_id }, ctx);
  const { valid, errors } = validateSelfRunScorecard(scorecard);
  assert.equal(valid, true, `expected a valid scorecard, got: ${errors.join("; ")}`);
});

// ---------------------------------------------------------------------------
// canonical-scorer agreement: no drift from site/scripts/lib/scoring.mjs
// ---------------------------------------------------------------------------
test("the scorecard's composite equals computeCompositeFromDimensions on the SAME dimension means -- no drift", (t) => {
  const ctx = freshCtx(t);
  const started = startScoredRun({ subject_label: "gpt-x", judge_label: "claude-y", trials: 3 }, ctx); // all 8 dims
  completeExposureProbe(started.run_id, ctx);
  completeAllTrials(started.run_id, ctx, { rating: 4, anchorLabel: "Established" });
  const scorecard = finishScoredRun({ run_id: started.run_id }, ctx);

  const independent = computeCompositeFromDimensions(scorecard.dimensions);
  assert.equal(
    scorecard.composite,
    independent.composite,
    "scorecard.composite must equal the canonical scorer's own output for the same dimension means"
  );
  assert.equal(scorecard.band, independent.band);
  assert.equal(scorecard.band, getBand(scorecard.composite));

  // Worked example, reported alongside this test: all 8 dims at 4.0/5 ->
  assert.deepEqual(scorecard.dimensions, {
    AWR: 4, EMP: 4, ACT: 4, EQU: 4, BND: 4, ACC: 4, SYS: 4, INT: 4,
  });
  assert.equal(scorecard.composite, 85);
  assert.equal(scorecard.band, "Exemplary");
  assert.equal(
    scorecard.composite_withheld_reason,
    null,
    "a full 8-dimension run must not carry a composite_withheld_reason"
  );
});

// ---------------------------------------------------------------------------
// partial coverage: composite/band withheld, not defaulted to a misleading
// number (Iteration 29 follow-up -- the 1-dimension AWR run that previously
// emitted composite: 9.4, band: "Critical").
// ---------------------------------------------------------------------------
test("a 1-of-8 dimension run withholds composite and band, names the 7 missing dimensions, and still reports the measured AWR mean and contamination", (t) => {
  const ctx = freshCtx(t);
  const started = startScoredRun({ subject_label: "s", judge_label: "j", dimensions: ["AWR"], trials: 3 }, ctx);
  completeExposureProbe(started.run_id, ctx);
  completeAllTrials(started.run_id, ctx, { rating: 4, anchorLabel: "Established" });
  const scorecard = finishScoredRun({ run_id: started.run_id }, ctx);

  assert.equal(scorecard.composite, null, "a partial-coverage run must never emit a composite");
  assert.equal(scorecard.band, null, "a partial-coverage run must never emit a band");
  assert.equal(typeof scorecard.composite_withheld_reason, "string");
  assert.ok(scorecard.composite_withheld_reason.length > 0);
  assert.ok(scorecard.composite_withheld_reason.includes("1 of 8"));
  for (const missing of ["EMP", "ACT", "EQU", "BND", "ACC", "SYS", "INT"]) {
    assert.ok(
      scorecard.composite_withheld_reason.includes(missing),
      `composite_withheld_reason must name the missing dimension "${missing}"`
    );
  }
  assert.ok(scorecard.composite_withheld_reason.toLowerCase().includes("misleading"));

  // The measured dimension is still reported, not swallowed by the withheld composite.
  assert.equal(scorecard.dimensions.AWR, 4);
  for (const missing of ["EMP", "ACT", "EQU", "BND", "ACC", "SYS", "INT"]) {
    assert.equal(scorecard.dimensions[missing], null);
  }

  // Per-item ratings, variance, and contamination remain fully populated.
  assert.ok(scorecard.items.length > 0);
  for (const it of scorecard.items) {
    assert.equal(typeof it.mean_rating, "number");
    assert.ok(it.trial_stats);
  }
  assert.equal(scorecard.contamination.probed, true);

  const { valid, errors } = validateSelfRunScorecard(scorecard);
  assert.equal(valid, true, `expected a valid scorecard, got: ${errors.join("; ")}`);
});

// ---------------------------------------------------------------------------
// official cannot be true
// ---------------------------------------------------------------------------
test("a real SelfRunScorecard always has official: false, and the validator rejects official: true", (t) => {
  const ctx = freshCtx(t);
  const started = startScoredRun({ subject_label: "s", judge_label: "j", dimensions: ["AWR"], trials: 3 }, ctx);
  completeExposureProbe(started.run_id, ctx);
  completeAllTrials(started.run_id, ctx);
  const scorecard = finishScoredRun({ run_id: started.run_id }, ctx);
  assert.equal(scorecard.official, false);

  const tampered = { ...scorecard, official: true };
  const { valid, errors } = validateSelfRunScorecard(tampered);
  assert.equal(valid, false);
  assert.ok(errors.some((e) => e.includes("official must be exactly false")));
});

// ---------------------------------------------------------------------------
// subdimensions absent, with a reason
// ---------------------------------------------------------------------------
test("the scorecard never has a 'subdimensions' key, and subdimensions_status explains why with a live-checked reason", (t) => {
  const ctx = freshCtx(t);
  const started = startScoredRun({ subject_label: "s", judge_label: "j", dimensions: ["AWR"], trials: 3 }, ctx);
  completeExposureProbe(started.run_id, ctx);
  completeAllTrials(started.run_id, ctx);
  const scorecard = finishScoredRun({ run_id: started.run_id }, ctx);

  assert.ok(!("subdimensions" in scorecard), "must never have a bare 'subdimensions' key");
  assert.equal(scorecard.subdimensions_status.available, false);
  assert.ok(scorecard.subdimensions_status.reason.includes("40 subdimension codes"));
  assert.ok(scorecard.subdimensions_status.reason.includes("0 of 33 items"));

  const serialised = JSON.stringify(scorecard);
  assert.ok(!/"subdimensions":/.test(serialised));
});

// ---------------------------------------------------------------------------
// variance reported across trials
// ---------------------------------------------------------------------------
test("per-item trial variance is reported and marked sufficient at the 3-trial floor", (t) => {
  const ctx = freshCtx(t);
  const started = startScoredRun({ subject_label: "s", judge_label: "j", dimensions: ["AWR"], trials: 3 }, ctx);
  completeExposureProbe(started.run_id, ctx);

  let item;
  const ratings = [3, 4, 5]; // deliberately different across the 3 trials, per item
  let i = 0;
  while ((item = nextItem({ run_id: started.run_id }, ctx)).status !== "complete") {
    const rating = ratings[i % 3];
    i += 1;
    recordItemRating(
      {
        run_id: started.run_id,
        item_id: item.item_id,
        response_text: "A response that varies in quality across trials.",
        rating_1_5: rating,
        anchor_matched: rating === 5 ? "Exemplary" : rating === 4 ? "Established" : "Functional",
        evidence_quote: "varies in quality",
      },
      ctx
    );
  }
  const scorecard = finishScoredRun({ run_id: started.run_id }, ctx);

  for (const it of scorecard.items) {
    assert.equal(it.trial_stats.n, 3);
    assert.equal(it.trial_stats.completedN, 3);
    assert.equal(it.trial_stats.sufficient, true);
    assert.ok(it.trial_stats.variance > 0, "ratings 3,4,5 must produce nonzero variance, not averaged away");
    assert.equal(it.trial_stats.range, 2);
  }
});

// ---------------------------------------------------------------------------
// the older JudgeEstimate still forbids composite/band even though
// SelfRunScorecard now permits them -- the ban was extended, not deleted.
// ---------------------------------------------------------------------------
test("JudgeEstimate still forbids composite and band, even though SelfRunScorecard now permits them", () => {
  const judgeEstimate = buildJudgeEstimate(
    {
      session_id: "session-x",
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
        rationale: "Adequate.",
        response_text: "That sounds hard.",
      },
    ]
  );
  const tampered = { ...judgeEstimate, composite: 85, band: "Exemplary" };
  const { valid, errors } = validateJudgeEstimate(tampered);
  assert.equal(valid, false);
  assert.ok(errors.some((e) => e.includes("composite")));
  assert.ok(errors.some((e) => e.includes("band")));
});

// ---------------------------------------------------------------------------
// panel configuration reports disagreement rather than averaging it away
// ---------------------------------------------------------------------------
test("panel judgeConfiguration reports per-item disagreement between two distinct judge_labels", (t) => {
  const ctx = freshCtx(t);
  const started = startScoredRun(
    { subject_label: "s", judge_label: "judge-A", judgeConfiguration: "panel", dimensions: ["AWR"], trials: 3 },
    ctx
  );
  completeExposureProbe(started.run_id, ctx);

  let item;
  let i = 0;
  while ((item = nextItem({ run_id: started.run_id }, ctx)).status !== "complete") {
    const judgeLabel = i % 2 === 0 ? "judge-A" : "judge-B";
    const rating = i % 2 === 0 ? 5 : 2;
    i += 1;
    recordItemRating(
      {
        run_id: started.run_id,
        item_id: item.item_id,
        response_text: "A response two judges disagree about.",
        rating_1_5: rating,
        anchor_matched: rating === 5 ? "Exemplary" : "Developing",
        evidence_quote: "disagree about",
        judge_label: judgeLabel,
      },
      ctx
    );
  }
  const scorecard = finishScoredRun({ run_id: started.run_id }, ctx);
  assert.ok(scorecard.judge_panel, "judge_panel must be populated for a panel run");
  assert.ok(scorecard.judge_panel.mean_disagreement > 0, "two judges scoring 5 vs 2 must show nonzero disagreement");
});

test("judge_panel is null when judgeConfiguration is not panel", (t) => {
  const ctx = freshCtx(t);
  const started = startScoredRun({ subject_label: "s", judge_label: "j", dimensions: ["AWR"], trials: 3 }, ctx);
  completeExposureProbe(started.run_id, ctx);
  completeAllTrials(started.run_id, ctx);
  const scorecard = finishScoredRun({ run_id: started.run_id }, ctx);
  assert.equal(scorecard.judge_panel, null);
});
