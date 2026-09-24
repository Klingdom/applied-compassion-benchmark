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

  function sendRawLine(text) {
    child.stdin.write(text + "\n");
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

  return { send, sendRawLine, waitForResponseCount, responses, stderrLines, stop };
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
    "run_status",
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

// ---------------------------------------------------------------------------
// item 12a: malformed JSON-RPC input, over the real transport.
// ---------------------------------------------------------------------------
test("a syntactically invalid JSON line produces a -32700 Parse error", async (t) => {
  const root = mkdtempSync(path.join(os.tmpdir(), "cb-probe-e2e-parse-error-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const server = startServer(root);
  t.after(() => server.stop());

  server.sendRawLine("{not valid json at all");
  const responses = await server.waitForResponseCount(1);
  assert.equal(responses[0].error.code, -32700);
});

test("a request naming an unknown top-level JSON-RPC method returns -32601", async (t) => {
  const root = mkdtempSync(path.join(os.tmpdir(), "cb-probe-e2e-unknown-method-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const server = startServer(root);
  t.after(() => server.stop());

  server.send({ jsonrpc: "2.0", id: 1, method: "resources/list" });
  const responses = await server.waitForResponseCount(1);
  assert.equal(responses[0].error.code, -32601);
});

test("a top-level JSON array (a batch request) returns -32600, not a silent drop", async (t) => {
  const root = mkdtempSync(path.join(os.tmpdir(), "cb-probe-e2e-batch-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const server = startServer(root);
  t.after(() => server.stop());

  server.sendRawLine(JSON.stringify([{ jsonrpc: "2.0", id: 1, method: "tools/list" }]));
  const responses = await server.waitForResponseCount(1);
  assert.equal(responses[0].error.code, -32600);
});

test("a malformed request (wrong jsonrpc version, no method) with an id present returns -32600", async (t) => {
  const root = mkdtempSync(path.join(os.tmpdir(), "cb-probe-e2e-invalid-request-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const server = startServer(root);
  t.after(() => server.stop());

  server.send({ jsonrpc: "1.0", id: 1, method: "tools/list" });
  const responses = await server.waitForResponseCount(1);
  assert.equal(responses[0].error.code, -32600);
});

test("a request with id: 0 gets a real reply, not treated as a notification", async (t) => {
  const root = mkdtempSync(path.join(os.tmpdir(), "cb-probe-e2e-id-zero-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const server = startServer(root);
  t.after(() => server.stop());

  server.send({ jsonrpc: "2.0", id: 0, method: "tools/list" });
  const responses = await server.waitForResponseCount(1);
  assert.equal(responses[0].id, 0);
  assert.ok(responses[0].result);
});

test("a request with id: null gets a real reply (id is present, just null -- not the same as a notification)", async (t) => {
  const root = mkdtempSync(path.join(os.tmpdir(), "cb-probe-e2e-id-null-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const server = startServer(root);
  t.after(() => server.stop());

  server.send({ jsonrpc: "2.0", id: null, method: "tools/list" });
  const responses = await server.waitForResponseCount(1);
  assert.equal(responses[0].id, null);
  assert.ok(responses[0].result);
});

test("a notification (no id key) for an unknown method gets no reply at all", async (t) => {
  const root = mkdtempSync(path.join(os.tmpdir(), "cb-probe-e2e-notification-unknown-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const server = startServer(root);
  t.after(() => server.stop());

  server.send({ jsonrpc: "2.0", method: "nonexistent/notification" });
  // Follow it with a real request so we have something to wait for; if the
  // notification above had produced a reply, it would show up first.
  server.send({ jsonrpc: "2.0", id: 1, method: "tools/list" });
  const responses = await server.waitForResponseCount(1);
  assert.equal(responses.length, 1, "the unknown-method notification must not have produced a reply");
  assert.equal(responses[0].id, 1);
});

test("a notification-shaped tools/call still executes the tool -- only the reply is suppressed", async (t) => {
  const root = mkdtempSync(path.join(os.tmpdir(), "cb-probe-e2e-notification-toolcall-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const server = startServer(root);
  t.after(() => server.stop());

  // Open a session with a real request first, so we have a session_id.
  server.send({
    jsonrpc: "2.0",
    id: 1,
    method: "tools/call",
    params: { name: "open_judge_session", arguments: { subject_label: "s", judge_model_label: "j" } },
  });
  const first = await server.waitForResponseCount(1);
  const sessionId = JSON.parse(first[0].result.content[0].text).session_id;

  // Record an estimate as a NOTIFICATION (no id) -- previously this
  // returned null before the handler ever ran, so the side effect (writing
  // estimates/AWR-1-A.json) silently never happened.
  server.send({
    jsonrpc: "2.0",
    method: "tools/call",
    params: {
      name: "record_item_estimate",
      arguments: {
        session_id: sessionId,
        item_id: "AWR-1-A",
        response_text: "That sounds exhausting.",
        rating_1_5: 3,
        rationale: "Adequate.",
      },
    },
  });

  // Follow with a real summarise call; if the notification's side effect
  // happened, item_count must be 1.
  server.send({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: { name: "summarise_judge_session", arguments: { session_id: sessionId } },
  });
  const all = await server.waitForResponseCount(2);
  const summariseResponse = all.find((r) => r.id === 2);
  const artifact = JSON.parse(summariseResponse.result.content[0].text);
  assert.equal(artifact.item_count, 1, "the notification-shaped record_item_estimate must have actually run");
});

test("tools/call with invalid arguments against the tool's own inputSchema returns -32602 naming the offending field", async (t) => {
  const root = mkdtempSync(path.join(os.tmpdir(), "cb-probe-e2e-schema-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const server = startServer(root);
  t.after(() => server.stop());

  server.send({
    jsonrpc: "2.0",
    id: 1,
    method: "tools/call",
    params: { name: "get_anchors", arguments: { item_id: 12345 } }, // wrong type: must be a string
  });
  const responses = await server.waitForResponseCount(1);
  assert.equal(responses[0].error.code, -32602);
  assert.match(responses[0].error.message, /item_id/);
});
