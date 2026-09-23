#!/usr/bin/env node
// bin/server.mjs
//
// cb-probe: a local stdio MCP server. Plain JSON-RPC 2.0 over stdio,
// newline-delimited (one JSON message per line on stdin, one JSON message
// per line written to stdout). No @modelcontextprotocol/sdk, no runtime
// dependencies at all. Replies go to stdout ONLY; all logging goes to
// stderr, so stdout stays a clean JSON-RPC stream for the MCP host.
//
// No network I/O of any kind. No provider SDK. No API key. Writes only
// under CB_ARTIFACT_ROOT (default ~/compassion-probe-sessions), never under
// this repository.

import readline from "node:readline";
import { loadBank } from "../lib/bank.mjs";
import { resolveArtifactRoot, assertSafeWriteRoot } from "../lib/session-store.mjs";
import { handleMessage } from "../lib/rpc-handler.mjs";

function logStderr(...args) {
  process.stderr.write(`[cb-probe] ${args.join(" ")}\n`);
}

function main() {
  let bank;
  try {
    bank = loadBank();
  } catch (error) {
    logStderr("FATAL:", error.message);
    process.exit(1);
  }

  let artifactRoot;
  try {
    artifactRoot = assertSafeWriteRoot(resolveArtifactRoot(process.env));
  } catch (error) {
    logStderr("FATAL:", error.message);
    process.exit(1);
  }

  logStderr(`ready. task bank version ${bank.meta.bankVersion}, ${bank.items.length} items.`);
  logStderr(`artifact root: ${artifactRoot}`);
  logStderr("not an official Compassion Benchmark result. no network I/O. no API key.");

  const ctx = {
    bank,
    artifactRoot,
    sessions: new Map(),
    runs: new Map(),
  };

  const rl = readline.createInterface({ input: process.stdin, terminal: false });

  rl.on("line", (line) => {
    const trimmed = line.trim();
    if (trimmed.length === 0) return;

    let message;
    try {
      message = JSON.parse(trimmed);
    } catch {
      process.stdout.write(
        JSON.stringify({
          jsonrpc: "2.0",
          id: null,
          error: { code: -32700, message: "Parse error" },
        }) + "\n"
      );
      return;
    }

    let response;
    try {
      response = handleMessage(message, ctx);
    } catch (error) {
      logStderr("unexpected error handling message:", error.message);
      if (message && typeof message === "object" && "id" in message) {
        response = {
          jsonrpc: "2.0",
          id: message.id,
          error: { code: -32603, message: `Internal error: ${error.message}` },
        };
      } else {
        response = null;
      }
    }

    if (response !== null) {
      process.stdout.write(JSON.stringify(response) + "\n");
    }
  });

  rl.on("close", () => {
    logStderr("stdin closed, exiting.");
    process.exit(0);
  });
}

main();
