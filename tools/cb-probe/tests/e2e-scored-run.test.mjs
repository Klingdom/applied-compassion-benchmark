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
  // Derived, not typed: AWR's scorable item count grew 5 -> 11 at bank v2.0,
  // and a literal here is the DC-01 stale-count defect in test clothing.
  assert.equal(started.total_planned_trials, started.item_count * 3);
  assert.ok(started.item_count >= 3, "AWR must carry enough items to exercise a resume"); // 5 AWR items x 3 trials

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
  // Derived: AWR's scorable item count grew 5 -> 11 at bank v2.0.
  assert.equal(guard, started.total_planned_trials);

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

  // Bank v2.0: subdimension scoring IS available, but a 1-dimension run can
  // only rate that dimension's subdimensions. Everything else must be null
  // with a zero count -- never imputed.
  assert.equal(scorecard.subdimensions_status.available, true);
  assert.ok(scorecard.subdimensions, "v2.0 scorecards report per-subdimension means");
  assert.equal(scorecard.coverage.level, "insufficient");
  const ratedSubs = Object.entries(scorecard.subdimensions).filter(([, v]) => v !== null);
  assert.ok(ratedSubs.length > 0 && ratedSubs.every(([c]) => c.startsWith("A")),
    `an AWR-only run must rate only AWR subdimensions, rated: ${ratedSubs.map(([c]) => c).join(", ")}`);
  for (const [code, v] of Object.entries(scorecard.subdimensions)) {
    if (v === null) assert.equal(scorecard.subdimension_item_counts[code], 0);
    else assert.ok(scorecard.subdimension_item_counts[code] > 0);
  }
  assert.equal(scorecard.contamination.probed, true);
  assert.equal(scorecard.provenance.judge_configuration, "cross");
  assert.equal(scorecard.provenance.subject_label_self_reported, true);
  // Derived, never typed: the AWR item count changed 5 -> 11 at bank v2.0.
  assert.ok(scorecard.items.length > 0);
  assert.equal(scorecard.items.length, started.item_count);
  assert.ok(scorecard.items.every((it) => it.trials.length === 3));
});

test("a full 8-dimension scored run over real stdio is a COMPLETE evaluation on bank v2.0: composite, band, intervals, and all 40 subdimensions rated", async (t) => {
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

  // DECISIONS.md D-40 (2026-09-24): a composite requires not only all 8
  // dimensions present, but every dimension resting on >= 3 rated items. On
  // today's real, published bank SYS and INT carry only 2 non-sensitive
  // scorable items each, so even a run covering all 8 dimensions withholds
  // the composite -- this is the correct, current behaviour, not a bug (see
  // tests/scored-run.test.mjs's synthetic-bank tests for what a "floor met"
  // scorecard looks like once the bank grows past this floor).
  // Bank v2.0 (2026-09-24) made this reachable. Before it, SYS and INT carried
  // 2 scorable items each and this test asserted the composite was WITHHELD.
  // The bank now clears the D-40 floor in every dimension and covers all 40
  // subdimensions, so a default all-8 run is a COMPLETE evaluation.
  assert.equal(scorecard.composite_withheld_reason, null, "the D-40 floor is met, so nothing should be withheld");
  assert.equal(typeof scorecard.composite, "number");
  assert.ok(scorecard.composite >= 0 && scorecard.composite <= 100);
  assert.equal(typeof scorecard.band, "string");

  // Coverage is "complete" only if every subdimension really was rated.
  assert.equal(scorecard.coverage.level, "complete");
  assert.equal(scorecard.coverage.unratedSubdimensions.length, 0);
  assert.equal(scorecard.coverage.subdimensionsRated, scorecard.coverage.subdimensionsTotal);
  for (const [code, v] of Object.entries(scorecard.subdimensions)) {
    assert.ok(typeof v === "number", `subdimension ${code} unrated in a complete run`);
    assert.ok(scorecard.subdimension_item_counts[code] > 0);
  }

  for (const code of ["AWR", "EMP", "ACT", "EQU", "BND", "ACC", "SYS", "INT"]) {
    assert.equal(scorecard.dimensions[code], 4);
    const interval = scorecard.uncertainty.dimensions[code];
    assert.ok(interval, `expected an uncertainty interval for measured dimension ${code}`);
    assert.ok(interval.ci[0] <= interval.ci[1]);
  }
  assert.ok(scorecard.uncertainty.composite_interval, "a composite must carry its interval");

  // Still unofficial, no matter how complete.
  assert.equal(scorecard.official, false);
  assert.equal(scorecard.comparability, "none");
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
      response_text: "A plain, minimal response.",
      rating_1_5: 3,
      anchor_matched: "Functional",
      evidence_quote: "A plain, minimal response",
    });
    guard += 1;
    if (guard > 50) throw new Error("test loop guard tripped");
  }

  await assert.rejects(() => server.callAndWait("finish_scored_run", { run_id: started.run_id }));
});

// ---------------------------------------------------------------------------
// item 12c: crash/restart resume against the same artifact root. Disk is
// the source of truth and the in-memory Maps are only a cache
// (requireRun/requireSession fall back to readRunFile/readSessionFile) --
// this is the first test that actually kills the server process and starts
// a NEW one pointed at the same CB_ARTIFACT_ROOT to prove that design
// works end to end, rather than only looking correct by code inspection.
// ---------------------------------------------------------------------------
test("a scored run survives the server process being killed and a new one started against the same artifact root", async (t) => {
  const root = mkdtempSync(path.join(os.tmpdir(), "cb-probe-e2e-resume-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));

  const server1 = startServer(root);
  server1.sendRaw("initialize", { protocolVersion: "2024-11-05" });
  await server1.waitForResponseCount(1);

  const started = await server1.callAndWait("start_scored_run", {
    subject_label: "resume-subject",
    judge_label: "resume-judge",
    dimensions: ["AWR"],
    trials: 3,
  });
  // Derived, not typed (DC-01): AWR's item count changed at bank v2.0.
  assert.equal(started.total_planned_trials, started.item_count * 3);
  assert.ok(started.item_count >= 3, "AWR must carry enough items to exercise a resume");

  const challenge = await server1.callAndWait("run_exposure_probe", { run_id: started.run_id });
  const recallAttempts = challenge.probe_item_ids.map((itemId) => ({
    item_id: itemId,
    recalled_text: "I do not have a verbatim memory of this item's exact wording.",
  }));
  await server1.callAndWait("run_exposure_probe", { run_id: started.run_id, recall_attempts: recallAttempts });

  // Record only SOME of the planned trials against the first process.
  for (let i = 0; i < 7; i++) {
    const item = await server1.callAndWait("next_item", { run_id: started.run_id });
    assert.notEqual(item.status, "complete");
    await server1.callAndWait("record_item_rating", {
      run_id: started.run_id,
      item_id: item.item_id,
      response_text: "Names the emotional weight described before offering practical options.",
      rating_1_5: 4,
      anchor_matched: "Established",
      evidence_quote: "Names the emotional weight described",
    });
  }

  // Kill the first process -- no clean shutdown, simulating a host crash or
  // restart mid-run.
  server1.stop();

  // Start a brand-new process pointed at the SAME artifact root.
  const server2 = startServer(root);
  t.after(() => server2.stop());
  server2.sendRaw("initialize", { protocolVersion: "2024-11-05" });
  await server2.waitForResponseCount(1);

  // The new process has an empty in-memory ctx.runs Map -- next_item must
  // fall back to reading run.json and the trials/ directory from disk.
  let guard = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const item = await server2.callAndWait("next_item", { run_id: started.run_id });
    if (item.status === "complete") break;
    await server2.callAndWait("record_item_rating", {
      run_id: started.run_id,
      item_id: item.item_id,
      response_text: "Names the emotional weight described before offering practical options.",
      rating_1_5: 4,
      anchor_matched: "Established",
      evidence_quote: "Names the emotional weight described",
    });
    guard += 1;
    if (guard > 50) throw new Error("test loop guard tripped");
  }
  // Exactly the remaining 8 trials (15 planned - 7 already recorded).
  // The remainder after the 7 trials recorded against the first process.
  assert.equal(guard, started.total_planned_trials - 7);

  const scorecard = await server2.callAndWait("finish_scored_run", { run_id: started.run_id });
  assert.equal(scorecard.items.length, started.item_count);
  assert.ok(scorecard.items.every((it) => it.trials.length === 3), `all ${started.total_planned_trials} trials (7 from process 1, the rest from process 2) must be present and complete`);
  assert.equal(scorecard.contamination.probed, true);
});
