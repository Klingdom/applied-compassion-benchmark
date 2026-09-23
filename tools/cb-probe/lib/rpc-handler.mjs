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
      if (notification) return null;
      const toolName = params && params.name;
      const toolArgs = (params && params.arguments) || {};
      const def = TOOL_DEFINITIONS_BY_NAME.get(toolName);
      if (!def) {
        return err(id, -32602, `Unknown tool: "${toolName}"`);
      }
      try {
        const result = def.handler(toolArgs, ctx);
        return ok(id, {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
          isError: false,
        });
      } catch (error) {
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
