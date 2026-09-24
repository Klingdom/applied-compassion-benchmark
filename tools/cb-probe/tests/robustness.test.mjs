// tests/robustness.test.mjs
//
// item 10 (robustness bundle) and item 6 (scorecard.json persistence),
// covered separately from the other test files because none of these fit
// the existing files' specific focus.

import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, existsSync, readFileSync } from "node:fs";
import path from "node:path";
import os from "node:os";

import { loadBank } from "../lib/bank.mjs";
import { getAnchors, openJudgeSession, recordItemEstimate, summariseJudgeSession } from "../lib/tools.mjs";
import { buildJudgeEstimate } from "../lib/judge-estimate.mjs";
import {
  startScoredRun,
  nextItem,
  recordItemRating,
  runExposureProbe,
  finishScoredRun,
} from "../lib/scored-run.mjs";

function freshCtx(t) {
  const bank = loadBank();
  const root = mkdtempSync(path.join(os.tmpdir(), "cb-probe-robustness-test-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  return { bank, artifactRoot: root, sessions: new Map(), runs: new Map() };
}

// ---------------------------------------------------------------------------
// item 10: get_anchors must never return a live reference into the
// process-lifetime cached bank -- mutating the returned anchors array must
// not affect what a later record_item_rating call is validated against.
// ---------------------------------------------------------------------------
test("get_anchors returns a clone, not a live reference into the cached bank (planted probe: mutate the result, then use the item again)", (t) => {
  const ctx = freshCtx(t);
  const result = getAnchors({ item_id: "AWR-1-A" }, ctx);
  const originalLabel = result.anchors[4].label; // the 5.0 Exemplary label
  result.anchors[4].label = "TAMPERED";

  const secondCall = getAnchors({ item_id: "AWR-1-A" }, ctx);
  assert.equal(secondCall.anchors[4].label, originalLabel, "mutating a previous result must not affect the bank's real anchors");
  assert.notEqual(secondCall.anchors[4].label, "TAMPERED");
});

// ---------------------------------------------------------------------------
// item 10: prototype pollution guard. buildJudgeEstimate's dimensionCounts
// accumulator is read back from user-editable estimate files where
// `dimension` is a string value the code later uses as a bracket key.
// ---------------------------------------------------------------------------
test("buildJudgeEstimate does not pollute Object.prototype via a dimension value of '__proto__' (planted probe)", () => {
  const before = ({}).polluted;
  assert.equal(before, undefined);

  const artifact = buildJudgeEstimate(
    {
      session_id: "session-proto-test",
      subject_label: "s",
      judge_model_label: "j",
      opened_at: new Date().toISOString(),
      bank_version: "v1.1",
    },
    [
      {
        item_id: "AWR-1-A",
        dimension: "__proto__", // the attack: a disk-editable estimate file with this dimension value
        construct: "x",
        rating_1_5: 3,
        rationale: "x",
        response_text: "x",
      },
    ]
  );

  assert.equal(({}).polluted, undefined, "Object.prototype must not be polluted");
  assert.equal(Object.prototype.n, undefined, "Object.prototype must not gain an 'n' property");
  // The artifact itself should still record the count -- Object.create(null)
  // means "__proto__" is just an ordinary own key on this object, not a
  // prototype-changing assignment, so it is fine (and expected) that it
  // holds the real count.
  assert.equal(artifact.dimension_counts["__proto__"].n, 1);
});

// ---------------------------------------------------------------------------
// item 6: finish_scored_run writes scorecard.json to disk, atomically and
// idempotently (a repeat call keeps the original finished_at).
// ---------------------------------------------------------------------------
test("finish_scored_run writes scorecard.json to the run's artifact directory, and a repeat call is idempotent (same finished_at)", (t) => {
  const ctx = freshCtx(t);
  const started = startScoredRun({ subject_label: "s", judge_label: "j", dimensions: ["AWR"], trials: 3 }, ctx);

  const challenge = runExposureProbe({ run_id: started.run_id }, ctx);
  const recallAttempts = challenge.probe_item_ids.map((id) => ({
    item_id: id,
    recalled_text: "I do not have a verbatim memory of this item's exact wording.",
  }));
  runExposureProbe({ run_id: started.run_id, recall_attempts: recallAttempts }, ctx);

  let item;
  while ((item = nextItem({ run_id: started.run_id }, ctx)).status !== "complete") {
    recordItemRating(
      {
        run_id: started.run_id,
        item_id: item.item_id,
        response_text: "Names the emotional weight described before offering practical options.",
        rating_1_5: 4,
        anchor_matched: "Established",
        evidence_quote: "Names the emotional weight described",
      },
      ctx
    );
  }

  const scorecardPath = path.join(ctx.artifactRoot, started.run_id, "scorecard.json");
  assert.ok(!existsSync(scorecardPath), "scorecard.json must not exist before finish_scored_run is called");

  const first = finishScoredRun({ run_id: started.run_id }, ctx);
  assert.ok(existsSync(scorecardPath), "scorecard.json must exist on disk after finish_scored_run");
  const onDisk = JSON.parse(readFileSync(scorecardPath, "utf8"));
  assert.equal(onDisk.artifact_kind, "self-run-scorecard");
  assert.equal(onDisk.provenance.finished_at, first.provenance.finished_at);

  const second = finishScoredRun({ run_id: started.run_id }, ctx);
  assert.equal(
    second.provenance.finished_at,
    first.provenance.finished_at,
    "a repeat call to finish_scored_run must reuse the original finished_at, not stamp a new one"
  );
});
