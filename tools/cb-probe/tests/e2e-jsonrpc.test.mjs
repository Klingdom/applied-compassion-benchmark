// tests/e2e-jsonrpc.test.mjs
//
// End-to-end exercise of the protocol path itself: spawn the real
// bin/server.mjs as a child process, feed it initialize -> tools/list ->
// tools/call over stdin as newline-delimited JSON-RPC, and assert on what
// comes back over stdout. Uses child_process because this is a TEST
// spawning the server, not the server's own source (the no-network-scan
// test only scans bin/ and lib/).

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
      if (line.length > 0) {
        responses.push(JSON.parse(line));
      }
    }
  });

  const stderrLines = [];
  child.stderr.on("data", (chunk) => {
    stderrLines.push(chunk.toString("utf8"));
  });

  function send(message) {
    child.stdin.write(JSON.stringify(message) + "\n");
  }

  async function waitForResponseCount(n, timeoutMs = 5000) {
    const start = Date.now();
    while (responses.length < n) {
      if (Date.now() - start > timeoutMs) {
        throw new Error(
          `timed out waiting for ${n} responses, got ${responses.length}. stderr:\n${stderrLines.join("")}`
        );
      }
      await new Promise((resolve) => setTimeout(resolve, 20));
    }
    return responses;
  }

  function stop() {
    child.stdin.end();
    child.kill();
  }

  return { send, waitForResponseCount, responses, stderrLines, stop };
}

test("initialize -> tools/list -> tools/call round-trips over stdio JSON-RPC", async (t) => {
  const root = mkdtempSync(path.join(os.tmpdir(), "cb-probe-e2e-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));

  const server = startServer(root);
  t.after(() => server.stop());

  server.send({ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2024-11-05" } });
  server.send({ jsonrpc: "2.0", method: "notifications/initialized" });
  server.send({ jsonrpc: "2.0", id: 2, method: "tools/list" });
  server.send({
    jsonrpc: "2.0",
    id: 3,
    method: "tools/call",
    params: { name: "explain_what_this_is_not", arguments: {} },
  });
  server.send({
    jsonrpc: "2.0",
    id: 4,
    method: "tools/call",
    params: { name: "list_probe_items", arguments: { dimension: "AWR" } },
  });

  // notifications/initialized gets no response, so 4 sends -> 4 responses.
  const responses = await server.waitForResponseCount(4);

  const initResponse = responses.find((r) => r.id === 1);
  assert.ok(initResponse, "expected an initialize response");
  assert.equal(initResponse.result.serverInfo.name, "cb-probe");
  assert.ok(initResponse.result.capabilities.tools);

  const listResponse = responses.find((r) => r.id === 2);
  assert.ok(listResponse, "expected a tools/list response");
  const toolNames = listResponse.result.tools.map((t) => t.name).sort();
  assert.deepEqual(toolNames, [
    "explain_what_this_is_not",
    "finish_scored_run",
    "get_anchors",
    "list_probe_items",
    "next_item",
    "open_judge_session",
    "record_item_estimate",
    "record_item_rating",
    "run_exposure_probe",
    "start_scored_run",
    "summarise_judge_session",
  ]);

  const explainResponse = responses.find((r) => r.id === 3);
  assert.ok(explainResponse, "expected an explain_what_this_is_not response");
  const explainText = explainResponse.result.content[0].text;
  assert.ok(explainText.includes("WHAT THIS TOOL IS NOT"));
  assert.ok(explainText.includes("composite"));

  const listItemsResponse = responses.find((r) => r.id === 4);
  assert.ok(listItemsResponse, "expected a list_probe_items response");
  const payload = JSON.parse(listItemsResponse.result.content[0].text);
  assert.equal(payload.dimension, "AWR");
  assert.ok(payload.items.length > 0);
  assert.ok(payload.items.every((item) => item.dimension === "AWR"));
  assert.ok(payload.items.every((item) => !("sourceOnlyFields" in item)));
});

test("a full session round-trip: open -> record -> summarise, no composite in the result", async (t) => {
  const root = mkdtempSync(path.join(os.tmpdir(), "cb-probe-e2e-session-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));

  const server = startServer(root);
  t.after(() => server.stop());

  server.send({ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2024-11-05" } });
  server.send({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "open_judge_session",
      arguments: { subject_label: "test-subject-model", judge_model_label: "test-judge-model" },
    },
  });

  const first = await server.waitForResponseCount(2);
  const openResult = JSON.parse(first.find((r) => r.id === 2).result.content[0].text);
  assert.ok(openResult.session_id);

  server.send({
    jsonrpc: "2.0",
    id: 3,
    method: "tools/call",
    params: {
      name: "record_item_estimate",
      arguments: {
        session_id: openResult.session_id,
        item_id: "AWR-1-A",
        response_text: "That sounds exhausting. Let's find you a real break.",
        rating_1_5: 4,
        rationale: "Names the emotional weight before offering options.",
      },
    },
  });
  server.send({
    jsonrpc: "2.0",
    id: 4,
    method: "tools/call",
    params: { name: "summarise_judge_session", arguments: { session_id: openResult.session_id } },
  });

  const all = await server.waitForResponseCount(4);
  const summariseResponse = all.find((r) => r.id === 4);
  const artifact = JSON.parse(summariseResponse.result.content[0].text);

  assert.equal(artifact.official, false);
  assert.equal(artifact.item_count, 1);
  assert.deepEqual(artifact.dimension_counts, { AWR: { n: 1 } });
  const serialised = JSON.stringify(artifact);
  assert.ok(!/"composite"/.test(serialised));
  assert.ok(!/"band"/.test(serialised));
});

test("tools/call with an unknown tool name returns a JSON-RPC error", async (t) => {
  const root = mkdtempSync(path.join(os.tmpdir(), "cb-probe-e2e-unknown-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));

  const server = startServer(root);
  t.after(() => server.stop());

  server.send({
    jsonrpc: "2.0",
    id: 1,
    method: "tools/call",
    params: { name: "does_not_exist", arguments: {} },
  });

  const responses = await server.waitForResponseCount(1);
  assert.ok(responses[0].error, "expected a JSON-RPC error for an unknown tool");
});
