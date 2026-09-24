// lib/rpc-handler.mjs
//
// Plain JSON-RPC 2.0 method handling for MCP over stdio, hand-rolled per
// this build's constraints (no @modelcontextprotocol/sdk, zero runtime
// dependencies). Implements exactly the four methods this server needs:
// initialize, notifications/initialized, tools/list, tools/call.
//
// This module is transport-agnostic: handleMessage(message, ctx) takes a
// parsed JSON-RPC message and returns either a response object (to be
// written back) or null (for notifications, which get no response). The
// stdio framing itself lives in bin/server.mjs.

import { TOOL_DEFINITIONS, TOOL_DEFINITIONS_BY_NAME } from "./tool-definitions.mjs";
import { ToolError } from "./tools.mjs";
import { validateToolArgs } from "./validate-args.mjs";
import { assertHonestToolResult } from "./outbound-guard.mjs";

const SERVER_INFO = { name: "cb-probe", version: "0.1.0" };
const DEFAULT_PROTOCOL_VERSION = "2024-11-05";

function ok(id, result) {
  return { jsonrpc: "2.0", id, result };
}

function err(id, code, message) {
  return { jsonrpc: "2.0", id, error: { code, message } };
}

function isNotification(message) {
  return message && typeof message === "object" && !("id" in message);
}

/**
 * @param {object} message - a parsed JSON-RPC 2.0 request or notification
 * @param {object} ctx - { bank, artifactRoot, sessions }
 * @returns {object|null} a JSON-RPC response object, or null if no reply is due
 */
export function handleMessage(message, ctx) {
  if (Array.isArray(message)) {
    // JSON-RPC 2.0 batch requests (a top-level array) are not supported.
    // Previously this fell through the object-shape guard below (arrays are
    // typeof "object") and into "id" in message, which is false for an
    // array's own properties -- so a batch was silently dropped with no
    // reply at all. Reply with a spec-correct Invalid Request instead of
    // hanging a batching host.
    return err(null, -32600, "Invalid Request: batch (array) requests are not supported by cb-probe.");
  }

  if (!message || typeof message !== "object" || message.jsonrpc !== "2.0" || typeof message.method !== "string") {
    // Malformed request. Only reply if it at least carries an id.
    if (message && typeof message === "object" && "id" in message) {
      return err(message.id, -32600, "Invalid Request");
    }
    return null;
  }

  const { method, params = {}, id } = message;
  const notification = isNotification(message);

  switch (method) {
    case "initialize": {
      const clientProtocolVersion =
        params && typeof params.protocolVersion === "string"
          ? params.protocolVersion
          : DEFAULT_PROTOCOL_VERSION;
      if (notification) return null;
      return ok(id, {
        protocolVersion: clientProtocolVersion,
        capabilities: { tools: {} },
        serverInfo: SERVER_INFO,
      });
    }

    case "notifications/initialized": {
      // No response is sent for notifications.
      return null;
    }

    case "tools/list": {
      if (notification) return null;
      return ok(id, {
        tools: TOOL_DEFINITIONS.map((def) => ({
          name: def.name,
          description: def.description,
          inputSchema: def.inputSchema,
        })),
      });
    }

    case "tools/call": {
      const toolName = params && params.name;
      const toolArgs = (params && params.arguments) || {};
      const def = TOOL_DEFINITIONS_BY_NAME.get(toolName);
      if (!def) {
        if (notification) return null;
        return err(id, -32602, `Unknown tool: "${toolName}"`);
      }

      // Enforce this tool's own declared inputSchema BEFORE dispatch.
      // Previously inputSchema was returned in tools/list and never
      // enforced anywhere -- every required/enum/type/additionalProperties
      // constraint was advisory to a well-behaved client only.
      const schemaErrors = validateToolArgs(def.inputSchema, toolArgs);
      if (schemaErrors.length > 0) {
        if (notification) return null;
        return err(
          id,
          -32602,
          `Invalid arguments for tool "${toolName}": ${schemaErrors[0]}` +
            (schemaErrors.length > 1 ? ` (and ${schemaErrors.length - 1} more)` : "")
        );
      }

      // A notification-shaped tools/call (no `id`) still executes the tool
      // -- only the REPLY is suppressed, per JSON-RPC 2.0. Previously this
      // returned null before the handler ever ran, so a notification-shaped
      // record_item_rating or finish_scored_run silently never happened.
      try {
        const result = def.handler(toolArgs, ctx);
        // Outbound guard: every tool result, from every one of the twelve
        // tools (and any future one), passes this same check before it can
        // be serialised and sent to the host.
        assertHonestToolResult(toolName, result);
        if (notification) return null;
        return ok(id, {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
          isError: false,
        });
      } catch (error) {
        if (notification) return null;
        const message = error instanceof ToolError || error instanceof Error ? error.message : String(error);
        return ok(id, {
          content: [{ type: "text", text: `Error: ${message}` }],
          isError: true,
        });
      }
    }

    default: {
      if (notification) return null;
      return err(id, -32601, `Method not found: "${method}"`);
    }
  }
}
