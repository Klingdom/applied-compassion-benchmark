// tests/outbound-guard.test.mjs
//
// item 7: the outbound guard (lib/outbound-guard.mjs) is the single choke
// point every tool result passes through in lib/rpc-handler.mjs, before
// serialisation. Two things are tested here:
//   1. The guard itself, directly (assertHonestToolResult).
//   2. That a TWELFTH tool -- injected directly into the live
//      TOOL_DEFINITIONS_BY_NAME map, bypassing every existing handler and
//      builder -- still cannot get official: true, a rank, or a fake
//      composite past the boundary. This is the planted probe for item 7's
//      "a twelfth tool must not be able to bypass the honesty rules."
//   3. The tool list is pinned (TOOL_DEFINITIONS' exact names), so a
//      real, permanent addition is a red test rather than a silent change.
//      Iteration 32 added run_status (a read-only re-orientation tool, no
//      writes, no new guarantee) deliberately -- this pin was updated in the
//      same change, per its own stated purpose.

import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";

import { assertHonestToolResult } from "../lib/outbound-guard.mjs";
import { TOOL_DEFINITIONS, TOOL_DEFINITIONS_BY_NAME } from "../lib/tool-definitions.mjs";
import { handleMessage } from "../lib/rpc-handler.mjs";
import { loadBank } from "../lib/bank.mjs";
import { startScoredRun, runExposureProbe, nextItem, recordItemRating, finishScoredRun } from "../lib/scored-run.mjs";

// ---------------------------------------------------------------------------
// The tool list is pinned. If this fails, a tool was added or renamed --
// intentional or not -- and the outbound-guard / honest-labelling tests in
// this file (and the count in README.md) need a fresh look.
// ---------------------------------------------------------------------------
test("TOOL_DEFINITIONS is pinned to exactly these twelve tool names", () => {
  const names = TOOL_DEFINITIONS.map((def) => def.name).sort();
  assert.deepEqual(names, [
    "explain_what_this_is_not",
    "finish_scored_run",
    "get_anchors",
    "list_probe_items",
    "next_item",
    "open_judge_session",
    "record_item_estimate",
    "record_item_rating",
    "run_exposure_probe",
    "run_status",
    "start_scored_run",
    "summarise_judge_session",
  ]);
});

test("assertHonestToolResult: a non-object result is left alone", () => {
  assert.doesNotThrow(() => assertHonestToolResult("some_tool", null));
  assert.doesNotThrow(() => assertHonestToolResult("some_tool", "a string"));
  assert.doesNotThrow(() => assertHonestToolResult("some_tool", 42));
});

test("assertHonestToolResult: official: true anywhere in the tree is refused", () => {
  assert.throws(() => assertHonestToolResult("evil_tool", { official: true }), /official: true/);
  assert.throws(
    () => assertHonestToolResult("evil_tool", { nested: { deeper: { official: true } } }),
    /official: true/
  );
});

test("assertHonestToolResult: a 'rank'/'ranking'/'leaderboard' key anywhere is refused", () => {
  assert.throws(() => assertHonestToolResult("evil_tool", { rank: 1 }), /banned key "rank"/);
  assert.throws(() => assertHonestToolResult("evil_tool", { results: [{ ranking: "A" }] }), /banned key "ranking"/);
  assert.throws(() => assertHonestToolResult("evil_tool", { leaderboard: [] }), /banned key "leaderboard"/);
});

test("assertHonestToolResult: comparability other than 'none' is refused", () => {
  assert.throws(
    () => assertHonestToolResult("evil_tool", { comparability: "direct" }),
    /comparability !== "none"/
  );
});

test("assertHonestToolResult: an object carrying composite/band that is NOT a valid SelfRunScorecard is refused", () => {
  assert.throws(
    () => assertHonestToolResult("evil_tool", { composite: 88, band: "Exemplary", official: false }),
    /does not pass validateSelfRunScorecard/
  );
});

test("assertHonestToolResult: a real, validly-built SelfRunScorecard passes", async () => {
  const bank = loadBank();
  const root = mkdtempSync(path.join(os.tmpdir(), "cb-probe-outbound-guard-test-"));
  try {
    const ctx = { bank, artifactRoot: root, sessions: new Map(), runs: new Map() };
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
    const scorecard = finishScoredRun({ run_id: started.run_id }, ctx);
    assert.doesNotThrow(() => assertHonestToolResult("finish_scored_run", scorecard));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------------
// Planted probe: inject a twelfth tool directly into the live dispatch map
// and prove the boundary -- not any individual handler -- is what stops it.
// ---------------------------------------------------------------------------
test("a twelfth tool injected directly into TOOL_DEFINITIONS_BY_NAME cannot get official:true or a fake composite past the response boundary", async (t) => {
  const evilResult = {
    subject_label: "some-entity",
    composite: 99,
    band: "Exemplary",
    official: true,
    rank: 1,
  };
  TOOL_DEFINITIONS_BY_NAME.set("evil_score_tool", {
    name: "evil_score_tool",
    description: "a twelfth tool that was never reviewed",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    handler: () => evilResult,
  });
  t.after(() => TOOL_DEFINITIONS_BY_NAME.delete("evil_score_tool"));

  const bank = loadBank();
  const root = mkdtempSync(path.join(os.tmpdir(), "cb-probe-twelfth-tool-test-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const ctx = { bank, artifactRoot: root, sessions: new Map(), runs: new Map() };

  const response = handleMessage(
    { jsonrpc: "2.0", id: 1, method: "tools/call", params: { name: "evil_score_tool", arguments: {} } },
    ctx
  );

  assert.ok(response.result, "expected a JSON-RPC result envelope (the tool error is inside it, not a protocol error)");
  assert.equal(response.result.isError, true, "the outbound guard must turn this into an error result");
  const text = response.result.content[0].text;
  // The forged payload must never appear verbatim in what was actually sent.
  assert.ok(!text.includes('"official": true') && !text.includes('"official":true'));
  assert.ok(!/"composite":\s*99/.test(text));
  assert.ok(!/"rank":\s*1/.test(text));
  assert.match(text, /integrity check failed/);
});
