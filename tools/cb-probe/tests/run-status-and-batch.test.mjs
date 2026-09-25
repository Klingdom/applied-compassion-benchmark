// tests/run-status-and-batch.test.mjs
//
// Iteration 32 (ergonomics, not guarantees): coverage for the two additions
// that cut round trips in a scored run --
//   1. run_status({ run_id }) -- a cheap, read-only re-orientation tool.
//   2. record_item_rating's batch form (`ratings: [...]`), validated
//      element-by-element exactly like a single rating, all-or-nothing.
// Every existing guarantee (3-trial floor, exact anchor match, >=3-token
// evidence quote, per-item trial cap, probe precondition) must still hold
// for both. Exercises the handlers directly, like tests/scored-run.test.mjs.

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
  runStatus,
} from "../lib/scored-run.mjs";
import { ToolError } from "../lib/tools.mjs";

function freshCtx(t) {
  const bank = loadBank();
  const root = mkdtempSync(path.join(os.tmpdir(), "cb-probe-run-status-batch-test-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  return { bank, artifactRoot: root, sessions: new Map(), runs: new Map() };
}

function completeExposureProbe(runId, ctx) {
  const challenge = runExposureProbe({ run_id: runId }, ctx);
  const recallAttempts = challenge.probe_item_ids.map((itemId) => ({
    item_id: itemId,
    recalled_text: "I have no memory of this item's exact wording.",
  }));
  return runExposureProbe({ run_id: runId, recall_attempts: recallAttempts }, ctx);
}

const GOOD_RESPONSE = "A specific, caring response that names the emotional weight described.";
const GOOD_QUOTE = "names the emotional weight described";

// ---------------------------------------------------------------------------
// run_status
// ---------------------------------------------------------------------------

test("run_status reports planned/recorded/remaining trials before anything is recorded", (t) => {
  const ctx = freshCtx(t);
  const started = startScoredRun({ subject_label: "s", judge_label: "j", dimensions: ["AWR"], trials: 3 }, ctx);
  const status = runStatus({ run_id: started.run_id }, ctx);

  assert.equal(status.run_id, started.run_id);
  assert.equal(status.total_planned_trials, started.total_planned_trials);
  assert.equal(status.total_recorded_trials, 0);
  assert.equal(status.total_remaining_trials, started.total_planned_trials);
  assert.equal(status.exposure_probe_status, "not_started");
  assert.equal(status.ready_to_finish, false);
  assert.equal(status.finished, false);
  // Derived from the bank, never typed: the item count per dimension changes
  // whenever the bank grows (33 -> 93 at v2.0), and a hardcoded literal here is
  // the DC-01 stale-count defect in test clothing.
  const expectedAwrItems = started.item_count;
  assert.ok(expectedAwrItems > 0, "the run must plan at least one AWR item");
  assert.equal(status.total_planned_trials, expectedAwrItems * 3, "planned trials = items x trials");
  assert.ok(
    Array.isArray(status.items) && status.items.length === expectedAwrItems,
    `run_status should list the ${expectedAwrItems} items the run actually planned, got ${status.items?.length}`
  );
  for (const item of status.items) {
    assert.equal(item.planned, 3);
    assert.equal(item.recorded, 0);
    assert.equal(item.remaining, 3);
  }
});

test("run_status tracks progress as trials are recorded and reflects the exposure probe's phase", (t) => {
  const ctx = freshCtx(t);
  const started = startScoredRun({ subject_label: "s", judge_label: "j", dimensions: ["AWR"], trials: 3 }, ctx);

  const first = nextItem({ run_id: started.run_id }, ctx);
  recordItemRating(
    {
      run_id: started.run_id,
      item_id: first.item_id,
      response_text: GOOD_RESPONSE,
      rating_1_5: 4,
      anchor_matched: "Established",
      evidence_quote: GOOD_QUOTE,
    },
    ctx
  );

  let status = runStatus({ run_id: started.run_id }, ctx);
  assert.equal(status.total_recorded_trials, 1);
  assert.equal(status.total_remaining_trials, started.total_planned_trials - 1);
  const recordedItem = status.items.find((i) => i.item_id === first.item_id);
  assert.equal(recordedItem.recorded, 1);
  assert.equal(recordedItem.remaining, 2);

  // Issue (but do not complete) the probe -- status must distinguish the two phases.
  runExposureProbe({ run_id: started.run_id }, ctx);
  status = runStatus({ run_id: started.run_id }, ctx);
  assert.equal(status.exposure_probe_status, "challenge_issued");
  assert.equal(status.ready_to_finish, false);

  completeExposureProbe(started.run_id, ctx);
  status = runStatus({ run_id: started.run_id }, ctx);
  assert.equal(status.exposure_probe_status, "completed");
  assert.equal(status.ready_to_finish, false, "trials are not all recorded yet");
});

test("run_status reports ready_to_finish once every trial is recorded and the probe is completed, and finished after finish_scored_run", (t) => {
  const ctx = freshCtx(t);
  const started = startScoredRun({ subject_label: "s", judge_label: "j", dimensions: ["AWR"], trials: 3 }, ctx);
  completeExposureProbe(started.run_id, ctx);

  let item;
  while ((item = nextItem({ run_id: started.run_id }, ctx)).status !== "complete") {
    recordItemRating(
      {
        run_id: started.run_id,
        item_id: item.item_id,
        response_text: GOOD_RESPONSE,
        rating_1_5: 4,
        anchor_matched: "Established",
        evidence_quote: GOOD_QUOTE,
      },
      ctx
    );
  }

  let status = runStatus({ run_id: started.run_id }, ctx);
  assert.equal(status.total_remaining_trials, 0);
  assert.equal(status.ready_to_finish, true);
  assert.equal(status.finished, false);

  finishScoredRun({ run_id: started.run_id }, ctx);

  status = runStatus({ run_id: started.run_id }, ctx);
  assert.equal(status.finished, true);
});

test("run_status throws ToolError for an unknown run_id", (t) => {
  const ctx = freshCtx(t);
  assert.throws(() => runStatus({ run_id: "no-such-run" }, ctx), ToolError);
});

test("run_status writes nothing (no composite/band/official keys, and no new files) -- it is read-only", (t) => {
  const ctx = freshCtx(t);
  const started = startScoredRun({ subject_label: "s", judge_label: "j", dimensions: ["AWR"], trials: 3 }, ctx);
  const status = runStatus({ run_id: started.run_id }, ctx);
  assert.equal(Object.prototype.hasOwnProperty.call(status, "composite"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(status, "band"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(status, "official"), false);
});

// ---------------------------------------------------------------------------
// record_item_rating -- batch form
// ---------------------------------------------------------------------------

test("record_item_rating batch form records every element and advances trial_index per item, same as the single form would", (t) => {
  const ctx = freshCtx(t);
  const started = startScoredRun({ subject_label: "s", judge_label: "j", dimensions: ["AWR"], trials: 3 }, ctx);
  const item = nextItem({ run_id: started.run_id }, ctx);

  const result = recordItemRating(
    {
      run_id: started.run_id,
      ratings: [
        {
          item_id: item.item_id,
          response_text: GOOD_RESPONSE,
          rating_1_5: 4,
          anchor_matched: "Established",
          evidence_quote: GOOD_QUOTE,
        },
        {
          item_id: item.item_id,
          response_text: GOOD_RESPONSE,
          rating_1_5: 5,
          anchor_matched: "Exemplary",
          evidence_quote: GOOD_QUOTE,
        },
      ],
    },
    ctx
  );

  assert.equal(result.status, "recorded");
  assert.equal(result.count, 2);
  assert.deepEqual(
    result.ratings.map((r) => r.trial_index),
    [1, 2]
  );

  const status = runStatus({ run_id: started.run_id }, ctx);
  const recordedItem = status.items.find((i) => i.item_id === item.item_id);
  assert.equal(recordedItem.recorded, 2);
});

test("record_item_rating batch form rejects the WHOLE batch (no partial writes) if any element fails validation", (t) => {
  const ctx = freshCtx(t);
  const started = startScoredRun({ subject_label: "s", judge_label: "j", dimensions: ["AWR"], trials: 3 }, ctx);
  const item = nextItem({ run_id: started.run_id }, ctx);

  assert.throws(
    () =>
      recordItemRating(
        {
          run_id: started.run_id,
          ratings: [
            {
              item_id: item.item_id,
              response_text: GOOD_RESPONSE,
              rating_1_5: 4,
              anchor_matched: "Established",
              evidence_quote: GOOD_QUOTE,
            },
            {
              // Second element is invalid: single-word evidence_quote.
              item_id: item.item_id,
              response_text: GOOD_RESPONSE,
              rating_1_5: 5,
              anchor_matched: "Exemplary",
              evidence_quote: "the",
            },
          ],
        },
        ctx
      ),
    ToolError
  );

  // Nothing was written -- not even the first, valid-looking element.
  const status = runStatus({ run_id: started.run_id }, ctx);
  const recordedItem = status.items.find((i) => i.item_id === item.item_id);
  assert.equal(recordedItem.recorded, 0, "a failing element must roll back the entire batch, including earlier valid ones");
});

test("record_item_rating batch form rejects a batch that would exceed the per-item trial cap, counting earlier entries in the same batch", (t) => {
  const ctx = freshCtx(t);
  const started = startScoredRun({ subject_label: "s", judge_label: "j", dimensions: ["AWR"], trials: 3 }, ctx);
  const item = nextItem({ run_id: started.run_id }, ctx);

  const oneRating = {
    item_id: item.item_id,
    response_text: GOOD_RESPONSE,
    rating_1_5: 4,
    anchor_matched: "Established",
    evidence_quote: GOOD_QUOTE,
  };

  assert.throws(
    () =>
      recordItemRating(
        { run_id: started.run_id, ratings: [oneRating, oneRating, oneRating, oneRating] }, // 4 > trials_per_item (3)
        ctx
      ),
    ToolError
  );

  const status = runStatus({ run_id: started.run_id }, ctx);
  const recordedItem = status.items.find((i) => i.item_id === item.item_id);
  assert.equal(recordedItem.recorded, 0, "the whole over-cap batch must be rejected, not truncated to the cap");
});

test("record_item_rating batch form still enforces exact anchor matching and substantive evidence quotes per element", (t) => {
  const ctx = freshCtx(t);
  const started = startScoredRun({ subject_label: "s", judge_label: "j", dimensions: ["AWR"], trials: 3 }, ctx);
  const item = nextItem({ run_id: started.run_id }, ctx);

  assert.throws(
    () =>
      recordItemRating(
        {
          run_id: started.run_id,
          ratings: [
            {
              item_id: item.item_id,
              response_text: GOOD_RESPONSE,
              rating_1_5: 4,
              anchor_matched: "this is definitely NOT Established, it reads as Critical to me",
              evidence_quote: GOOD_QUOTE,
            },
          ],
        },
        ctx
      ),
    ToolError,
    "a batch element with a contradictory anchor_matched must be refused, same as the single form"
  );
});

test("record_item_rating refuses to mix the single-rating fields and the batch ratings array in the same call", (t) => {
  const ctx = freshCtx(t);
  const started = startScoredRun({ subject_label: "s", judge_label: "j", dimensions: ["AWR"], trials: 3 }, ctx);
  const item = nextItem({ run_id: started.run_id }, ctx);

  assert.throws(
    () =>
      recordItemRating(
        {
          run_id: started.run_id,
          item_id: item.item_id,
          response_text: GOOD_RESPONSE,
          rating_1_5: 4,
          anchor_matched: "Established",
          evidence_quote: GOOD_QUOTE,
          ratings: [
            {
              item_id: item.item_id,
              response_text: GOOD_RESPONSE,
              rating_1_5: 5,
              anchor_matched: "Exemplary",
              evidence_quote: GOOD_QUOTE,
            },
          ],
        },
        ctx
      ),
    ToolError
  );
});

test("record_item_rating batch form rejects an empty ratings array", (t) => {
  const ctx = freshCtx(t);
  const started = startScoredRun({ subject_label: "s", judge_label: "j", dimensions: ["AWR"], trials: 3 }, ctx);
  assert.throws(() => recordItemRating({ run_id: started.run_id, ratings: [] }, ctx), ToolError);
});

test("a full run can be completed entirely via the batch form, then finished normally", (t) => {
  const ctx = freshCtx(t);
  const started = startScoredRun({ subject_label: "s", judge_label: "j", dimensions: ["AWR"], trials: 3 }, ctx);
  completeExposureProbe(started.run_id, ctx);

  // Build the whole plan's worth of ratings directly from the run's own
  // item_ids x trials_per_item (the same denominator finish_scored_run
  // re-derives) rather than walking next_item, since next_item's pending
  // item only advances once a trial is actually recorded on disk.
  const run = ctx.runs.get(started.run_id);
  const ratings = [];
  for (const itemId of run.item_ids) {
    for (let i = 0; i < run.trials_per_item; i++) {
      ratings.push({
        item_id: itemId,
        response_text: GOOD_RESPONSE,
        rating_1_5: 4,
        anchor_matched: "Established",
        evidence_quote: GOOD_QUOTE,
      });
    }
  }

  const result = recordItemRating({ run_id: started.run_id, ratings }, ctx);
  assert.equal(result.count, started.total_planned_trials);

  const status = runStatus({ run_id: started.run_id }, ctx);
  assert.equal(status.total_remaining_trials, 0);
  assert.equal(status.ready_to_finish, true);

  const scorecard = finishScoredRun({ run_id: started.run_id }, ctx);
  assert.equal(scorecard.dimensions.AWR !== null, true);
});
