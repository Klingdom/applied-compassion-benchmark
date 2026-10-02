// research/model-runs/lib/mcp-client.mjs
//
// A minimal MCP host: newline-delimited JSON-RPC 2.0 over a child process's stdio. No dependencies, no SDK.
// It exists so pilot-2026-10-02 section 7 can drive cb-probe the way a real host does (spawn the server,
// initialize, tools/list, tools/call) instead of importing its libraries.
//
// Failure model, all explicit:
//   McpRpcError      the server answered with a JSON-RPC error object (schema violation, unknown tool, ...)
//   McpToolError     the server answered a tools/call with isError: true (a business-rule refusal); .text is verbatim
//   McpTimeoutError  no reply within the request's timeout. The child is KILLED: after a timeout the host cannot know
//                    whether the call ran, so no further call may race a possibly half-applied one. The caller
//                    re-opens a server and re-reads state (run_status) before deciding what to do.
//   McpClosedError   the server exited (or never started) while a request was pending or before one was sent
// Every error carries the tail of the server's stderr, which is where cb-probe logs its own fatal reasons.

import { spawn } from "node:child_process";
import readline from "node:readline";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
export const DEFAULT_SERVER_PATH = path.resolve(here, "..", "..", "..", "tools", "cb-probe", "bin", "server.mjs");
export const PROTOCOL_VERSION = "2024-11-05";

export class McpError extends Error {
  constructor(message, extra = {}) {
    super(message);
    this.name = new.target.name;
    Object.assign(this, extra);
  }
}
export class McpRpcError extends McpError {}
export class McpToolError extends McpError {}
export class McpTimeoutError extends McpError {}
export class McpClosedError extends McpError {}

const tail = (s, n = 1500) => (s.length > n ? `...${s.slice(-n)}` : s);

/**
 * Spawn a stdio MCP server and return a client. Nothing is sent until the caller calls initialize().
 *
 * @param {object} [o]
 * @param {string} [o.command]          default: this node binary
 * @param {string[]} [o.args]           default: [tools/cb-probe/bin/server.mjs]
 * @param {Record<string,string>} [o.env] merged over process.env
 * @param {number} [o.defaultTimeoutMs] per request, default 30000
 * @param {number} [o.stderrLimit]      characters of stderr kept (the most recent), default 65536
 * @param {(e:{dir:"out"|"in"|"bad-line", t:string, message:any})=>void} [o.onMessage] every frame, verbatim
 */
export function startMcpServer({
  command = process.execPath,
  args = [DEFAULT_SERVER_PATH],
  env = {},
  cwd,
  defaultTimeoutMs = 30000,
  stderrLimit = 65536,
  onMessage = () => {},
} = {}) {
  let stderrBuf = "";
  let exited = null; // { code, signal } once the child is gone
  let spawnError = null;
  let nextId = 1;
  const pending = new Map();

  const child = spawn(command, args, {
    cwd,
    env: { ...process.env, ...env },
    stdio: ["pipe", "pipe", "pipe"],
    windowsHide: true,
  });

  const stderrTail = () => tail(stderrBuf.trim());
  const closedError = (why) =>
    new McpClosedError(`MCP server ${why}${stderrBuf.trim() ? `; stderr: ${stderrTail()}` : ""}`, { stderr: stderrBuf, exited });

  function failAll(err) {
    for (const [id, p] of pending) {
      clearTimeout(p.timer);
      pending.delete(id);
      p.reject(err);
    }
  }

  child.stderr.setEncoding("utf8");
  child.stderr.on("data", (chunk) => {
    stderrBuf += chunk;
    if (stderrBuf.length > stderrLimit) stderrBuf = stderrBuf.slice(-stderrLimit);
  });
  child.on("error", (e) => {
    spawnError = e;
    exited = exited ?? { code: null, signal: null };
    failAll(closedError(`could not be started (${e.message})`));
  });
  // "close" (not "exit") so every stderr/stdout chunk has been delivered before pending calls are failed.
  child.on("close", (code, signal) => {
    exited = { code, signal };
    failAll(closedError(`exited (code ${code}, signal ${signal})`));
  });
  // A write to a dead child must surface as a rejected request, not an uncaught EPIPE.
  child.stdin.on("error", () => {});

  const rl = readline.createInterface({ input: child.stdout, terminal: false });
  rl.on("line", (line) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    let msg;
    try {
      msg = JSON.parse(trimmed);
    } catch {
      onMessage({ dir: "bad-line", t: new Date().toISOString(), message: trimmed });
      return;
    }
    onMessage({ dir: "in", t: new Date().toISOString(), message: msg });
    if (msg && Object.prototype.hasOwnProperty.call(msg, "id") && pending.has(msg.id)) {
      const p = pending.get(msg.id);
      pending.delete(msg.id);
      clearTimeout(p.timer);
      if (msg.error) {
        p.reject(new McpRpcError(`${p.method}: JSON-RPC error ${msg.error.code}: ${msg.error.message}`, { code: msg.error.code, rpcMessage: msg.error.message }));
      } else {
        p.resolve(msg);
      }
    }
  });

  function send(message) {
    onMessage({ dir: "out", t: new Date().toISOString(), message });
    return new Promise((resolve, reject) => {
      child.stdin.write(`${JSON.stringify(message)}\n`, (err) => (err ? reject(closedError(`stdin write failed (${err.message})`)) : resolve()));
    });
  }

  function request(method, params, { timeoutMs = defaultTimeoutMs } = {}) {
    if (spawnError || exited) return Promise.reject(closedError(spawnError ? "could not be started" : "has already exited"));
    const id = nextId++;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        pending.delete(id);
        const err = new McpTimeoutError(
          `${method}: no reply within ${timeoutMs} ms; the server was killed because the outcome of the call is unknown` +
            `${stderrBuf.trim() ? `; stderr: ${stderrTail()}` : ""}`,
          { stderr: stderrBuf, method, timeoutMs }
        );
        child.kill();
        reject(err);
      }, timeoutMs);
      pending.set(id, { resolve, reject, timer, method });
      send({ jsonrpc: "2.0", id, method, ...(params === undefined ? {} : { params }) }).catch((e) => {
        if (pending.delete(id)) {
          clearTimeout(timer);
          reject(e);
        }
      });
    });
  }

  async function notify(method, params) {
    if (spawnError || exited) throw closedError("has already exited");
    await send({ jsonrpc: "2.0", method, ...(params === undefined ? {} : { params }) });
  }

  async function initialize(opts) {
    const res = await request(
      "initialize",
      { protocolVersion: PROTOCOL_VERSION, capabilities: {}, clientInfo: { name: "compassion-benchmark-run-mcp-probe", version: "1" } },
      opts
    );
    await notify("notifications/initialized");
    return res.result;
  }

  async function listTools(opts) {
    const res = await request("tools/list", {}, opts);
    return res.result.tools;
  }

  /**
   * tools/call. Resolves with the parsed JSON the tool returned. A tool-level refusal (isError: true) rejects with
   * McpToolError whose .text is the server's message verbatim, minus its "Error: " prefix.
   */
  async function callTool(name, args = {}, opts) {
    const res = await request("tools/call", { name, arguments: args }, opts);
    const result = res.result;
    const text = result && Array.isArray(result.content) && result.content[0] ? result.content[0].text : undefined;
    if (typeof text !== "string") throw new McpRpcError(`${name}: reply has no text content`, { reply: res });
    if (result.isError) throw new McpToolError(`${name}: ${text.replace(/^Error: /, "")}`, { tool: name, text: text.replace(/^Error: /, "") });
    try {
      return JSON.parse(text);
    } catch {
      throw new McpRpcError(`${name}: tool text is not JSON: ${text.slice(0, 200)}`, { reply: res });
    }
  }

  /** End stdin (the server exits on EOF), wait briefly, then kill. Always resolves. */
  async function close({ graceMs = 3000 } = {}) {
    if (!exited && !spawnError) {
      const done = new Promise((resolve) => child.once("close", resolve));
      try {
        child.stdin.end();
      } catch {
        // already closed
      }
      const timer = setTimeout(() => child.kill(), graceMs);
      await done;
      clearTimeout(timer);
    }
    rl.close();
    return { exited, stderr: stderrBuf };
  }

  return {
    request,
    notify,
    initialize,
    listTools,
    callTool,
    close,
    stderr: () => stderrBuf,
    isExited: () => exited !== null,
    pid: child.pid,
  };
}
