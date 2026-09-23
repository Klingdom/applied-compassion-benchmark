// tests/e2e-scored-run.test.mjs
//
// End-to-end exercise of the scored-run tools over the REAL stdio JSON-RPC
// transport: spawns the real bin/server.mjs as a child process and drives
// start_scored_run -> run_exposure_probe (both phases) -> next_item /
// record_item_rating in a loop -> finish_scored_run, asserting on the
// SelfRunScorecard that comes back over stdout. Mirrors
// tests/e2e-jsonrpc.test.mjs's spawn helper (kept local rather than shared,
// to avoid coupling two independently-readable test files).

import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SERVER_PATH = path.resolve(__dirname, "..", "bin", "server.mjs");

function startServer(artifactRoot) {
  const child = spawn(process.execPath, [SERVER_PATH], {
    env: { ...process.env, CB_ARTIFACT_ROOT: artifactRoot },
    stdio: ["pipe", "pipe", "pipe"],
  });

  const responses = [];
  let buffer = "";
  child.stdout.on("data", (chunk) => {
    buffer += chunk.toString("utf8");
    let idx;
    // eslint-disable-next-line no-cond-assign
    while ((idx = buffer.indexOf("\n")) !== -1) {
      const line = buffer.slice(0, idx).trim();
      buffer = buffer.slice(idx + 1);
      if (line.length > 0) responses.push(JSON.parse(line));
    }
  });

  const stderrLines = [];
  child.stderr.on("data", (chunk) => stderrLines.push(chunk.toString("utf8")));

  let nextId = 1;
  function sendRaw(method, params) {
    const id = nextId++;
    child.stdin.write(JSON.stringify({ jsonrpc: "2.0", id, method, params }) + "\n");
    return id;
  }
  function call(name, args) {
    return sendRaw("tools/call", { name, arguments: args });
  }

  async function waitForResponseCount(n, timeoutMs = 10000) {
    const start = Date.now();
    while (responses.length < n) {
      if (Date.now() - start > timeoutMs) {
        throw new Error(`timed out waiting for ${n} responses, got ${responses.length}. stderr:\n${stderrLines.join("")}`);
      }
      await new Promise((resolve) => setTimeout(resolve, 20));
    }
    return responses;
  }

  async function callAndWait(name, args) {
    const id = call(name, args);
    const start = Date.now();
    while (!responses.find((r) => r.id === id)) {
      if (Date.now() - start > 10000) {
        throw new Error(`timed out waiting for response to ${name}. stderr:\n${stderrLines.join("")}`);
      }
      // eslint-disable-next-line no-await-in-loop
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
    const response = responses.find((r) => r.id === id);
    const text = response.result.content[0].text;
    if (response.result.isError) {
      throw new Error(`tool ${name} returned an error: ${text}`);
    }
    return JSON.parse(text);
  }

  function stop() {
    child.stdin.end();
    child.kill();
  }

  return { call, sendRaw, callAndWait, waitForResponseCount, responses, stderrLines, stop };
}

test("a partial-coverage (1-dimension) scored run over real stdio withholds composite and band, with a reason naming the missing dimensions", async (t) => {
  const root = mkdtempSync(path.join(os.tmpdir(), "cb-probe-e2e-scored-run-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));

  const server = startServer(root);
  t.after(() => server.stop());

  server.sendRaw("initialize", { protocolVersion: "2024-11-05" });
  await server.waitForResponseCount(1);

  const started = await server.callAndWait("start_scored_run", {
    subject_label: "e2e-subject-model",
    judge_label: "e2e-judge-model",
    dimensions: ["AWR"],
    trials: 3,
  });
  assert.ok(started.run_id);
  assert.equal(started.judge_configuration, "cross");
  assert.equal(started.total_planned_trials, 15); // 5 AWR items x 3 trials

  const challenge = await server.callAndWait("run_exposure_probe", { run_id: started.run_id });
  assert.equal(challenge.phase, "challenge");
  assert.ok(Array.isArray(challenge.probe_item_ids) && challenge.probe_item_ids.length > 0);

  const recallAttempts = challenge.probe_item_ids.map((itemId) => ({
    item_id: itemId,
    recalled_text: "I do not have a verbatim memory of this item's exact wording.",
  }));
  const probed = await server.callAndWait("run_exposure_probe", {
    run_id: started.run_id,
    recall_attempts: recallAttempts,
  });
  assert.equal(probed.probed, true);
  assert.equal(typeof probed.mean_overlap, "number");

  // Refuses before all trials are recorded.
  await assert.rejects(() => server.callAndWait("finish_scored_run", { run_id: started.run_id }));

  let guard = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const item = await server.callAndWait("next_item", { run_id: started.run_id });
    if (item.status === "complete") break;
    await server.callAndWait("record_item_rating", {
      run_id: started.run_id,
      item_id: item.item_id,
      response_text: "Names the emotional weight described before offering practical options.",
      rating_1_5: 4,
      anchor_matched: "Established",
      evidence_quote: "Names the emotional weight described",
    });
    guard += 1;
    if (guard > 100) throw new Error("test loop guard tripped");
  }
  assert.equal(guard, 15);

  const scorecard = await server.callAndWait("finish_scored_run", { run_id: started.run_id });

  assert.equal(scorecard.artifact_kind, "self-run-scorecard");
  assert.equal(scorecard.official, false);
  assert.equal(scorecard.is_index_entry, false);
  assert.equal(scorecard.comparability, "none");

  // The defect this test guards against: a 1-dimension run must NOT emit a
  // composite/band (previously observed as composite: 9.4, band: "Critical"
  // -- an AWR-4 run with the other 7 dimensions silently defaulted to 1 by
  // computeCompositeFromDimensions's documented `?? 1` behaviour).
  assert.equal(scorecard.composite, null);
  assert.equal(scorecard.band, null);
  assert.equal(typeof scorecard.composite_withheld_reason, "string");
  assert.ok(scorecard.composite_withheld_reason.length > 0);
  assert.ok(scorecard.composite_withheld_reason.includes("1 of 8"));
  for (const missing of ["EMP", "ACT", "EQU", "BND", "ACC", "SYS", "INT"]) {
    assert.ok(scorecard.composite_withheld_reason.includes(missing));
  }
  assert.equal(scorecard.dimensions.AWR, 4);

  assert.equal(scorecard.subdimensions_status.available, false);
  assert.ok(!("subdimensions" in scorecard));
  assert.equal(scorecard.contamination.probed, true);
  assert.equal(scorecard.provenance.judge_configuration, "cross");
  assert.equal(scorecard.provenance.subject_label_self_reported, true);
  assert.equal(scorecard.items.length, 5);
  assert.ok(scorecard.items.every((it) => it.trials.length === 3));
});

test("a full 8-dimension scored run over real stdio produces a numeric composite and band", async (t) => {
  const root = mkdtempSync(path.join(os.tmpdir(), "cb-probe-e2e-scored-run-full-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));

  const server = startServer(root);
  t.after(() => server.stop());

  server.sendRaw("initialize", { protocolVersion: "2024-11-05" });
  await server.waitForResponseCount(1);

  const started = await server.callAndWait("start_scored_run", {
    subject_label: "e2e-subject-model",
    judge_label: "e2e-judge-model",
    trials: 3, // dimensions omitted -> all 8
  });
  assert.ok(started.run_id);
  assert.equal(started.dimensions.length, 8);

  const challenge = await server.callAndWait("run_exposure_probe", { run_id: started.run_id });
  const recallAttempts = challenge.probe_item_ids.map((itemId) => ({
    item_id: itemId,
    recalled_text: "I do not have a verbatim memory of this item's exact wording.",
  }));
  await server.callAndWait("run_exposure_probe", { run_id: started.run_id, recall_attempts: recallAttempts });

  let guard = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const item = await server.callAndWait("next_item", { run_id: started.run_id });
    if (item.status === "complete") break;
    await server.callAndWait("record_item_rating", {
      run_id: started.run_id,
      item_id: item.item_id,
      response_text: "Names the emotional weight described before offering practical options.",
      rating_1_5: 4,
      anchor_matched: "Established",
      evidence_quote: "Names the emotional weight described",
    });
    guard += 1;
    if (guard > 300) throw new Error("test loop guard tripped");
  }

  const scorecard = await server.callAndWait("finish_scored_run", { run_id: started.run_id });
  assert.equal(typeof scorecard.composite, "number");
  assert.ok(scorecard.composite >= 0 && scorecard.composite <= 100);
  assert.ok(typeof scorecard.band === "string" && scorecard.band.length > 0);
  assert.equal(scorecard.composite_withheld_reason, null);
});

test("finish_scored_run over stdio is refused before run_exposure_probe has run at all", async (t) => {
  const root = mkdtempSync(path.join(os.tmpdir(), "cb-probe-e2e-scored-run-noprobe-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));

  const server = startServer(root);
  t.after(() => server.stop());

  server.sendRaw("initialize", { protocolVersion: "2024-11-05" });
  await server.waitForResponseCount(1);

  const started = await server.callAndWait("start_scored_run", {
    subject_label: "s",
    judge_label: "j",
    dimensions: ["SYS"],
    trials: 3,
  });

  let guard = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const item = await server.callAndWait("next_item", { run_id: started.run_id });
    if (item.status === "complete") break;
    await server.callAndWait("record_item_rating", {
      run_id: started.run_id,
      item_id: item.item_id,
      response_text: "A response.",
      rating_1_5: 3,
      anchor_matched: "Functional",
      evidence_quote: "A response",
    });
    guard += 1;
    if (guard > 50) throw new Error("test loop guard tripped");
  }

  await assert.rejects(() => server.callAndWait("finish_scored_run", { run_id: started.run_id }));
});
