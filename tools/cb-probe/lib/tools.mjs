// lib/tools.mjs
//
// The six cb-probe tools (MCP_SERVER_PLAN_2026-09-20.md / the ratified
// tool table for this build). Each tool is a plain function of
// (args, ctx) -> plain JS object; bin/server.mjs wraps these as MCP
// tools/call results. Kept separate from the JSON-RPC transport so the
// tools themselves are directly unit-testable without spawning a process.
//
// ctx shape: { bank, artifactRoot, sessions: Map<session_id, sessionMeta> }

import { loadBank, findItem } from "./bank.mjs";
import { projectItem } from "./projection.mjs";
import { isSensitiveItem } from "./sensitivity.mjs";
import { isValidRating } from "./validate-estimate.mjs";
import { buildJudgeEstimate } from "./judge-estimate.mjs";
import { FULL_STATEMENT } from "./separation-statement.mjs";
import {
  newSessionId,
  writeSessionFile,
  readSessionFile,
  appendSessionEstimate,
  listSessionEstimates,
} from "./session-store.mjs";

class ToolError extends Error {}

function requireSession(ctx, sessionId) {
  const meta = ctx.sessions.get(sessionId) || readSessionFile(ctx.artifactRoot, sessionId, "session.json");
  if (!meta) {
    throw new ToolError(`No open session with session_id "${sessionId}". Call open_judge_session first.`);
  }
  return meta;
}

// ---------------------------------------------------------------------------
// list_probe_items({ dimension?, include_sensitive? })
// ---------------------------------------------------------------------------
export function listProbeItems(args = {}, ctx) {
  const { dimension = null, include_sensitive: includeSensitive = false } = args;
  const bank = ctx.bank ?? loadBank();

  if (typeof includeSensitive !== "boolean") {
    throw new ToolError("include_sensitive must be a boolean if provided");
  }

  let items = bank.items;
  if (dimension) {
    items = items.filter((item) => item.dimension === dimension);
  }

  const sensitiveExcludedCount = items.filter((item) => isSensitiveItem(item)).length;
  if (!includeSensitive) {
    items = items.filter((item) => !isSensitiveItem(item));
  }

  return {
    bank_version: bank.meta.bankVersion,
    dimension: dimension ?? null,
    include_sensitive: includeSensitive,
    sensitive_items_excluded: includeSensitive ? 0 : sensitiveExcludedCount,
    sensitive_items_note:
      "Sensitive items (active suicidal ideation, domestic violence, miscarriage, and related " +
      "crisis-adjacent prompts) are hidden by default. Pass include_sensitive: true to see them.",
    count: items.length,
    items: items.map((item) => projectItem(item, bank.meta.fieldSeparationPolicy)),
  };
}

// ---------------------------------------------------------------------------
// get_anchors({ item_id })
// ---------------------------------------------------------------------------
export function getAnchors(args = {}, ctx) {
  const { item_id: itemId } = args;
  if (typeof itemId !== "string" || itemId.length === 0) {
    throw new ToolError("item_id is required");
  }
  const bank = ctx.bank ?? loadBank();
  const item = findItem(bank, itemId);
  if (!item) {
    throw new ToolError(`No item with id "${itemId}"`);
  }
  return {
    item_id: item.id,
    dimension: item.dimension,
    construct: item.construct,
    // Cloned, never the live reference into lib/bank.mjs's process-lifetime
    // cachedBank object -- a future caller holding this result before
    // serialising it could otherwise mutate the shared bank state and
    // silently change what every subsequent rating in every open run is
    // validated against (see docs/reviews/CB_PROBE_CODE_2026-09-24.md #3).
    anchors: structuredClone(item.anchors),
  };
}

// ---------------------------------------------------------------------------
// open_judge_session({ subject_label, judge_model_label })
// ---------------------------------------------------------------------------
export function openJudgeSession(args = {}, ctx) {
  const { subject_label: subjectLabel, judge_model_label: judgeModelLabel } = args;
  if (typeof subjectLabel !== "string" || subjectLabel.length === 0) {
    throw new ToolError("subject_label is required and must be a non-empty string");
  }
  if (typeof judgeModelLabel !== "string" || judgeModelLabel.length === 0) {
    throw new ToolError("judge_model_label is required and must be a non-empty string");
  }

  const bank = ctx.bank ?? loadBank();
  const sessionId = newSessionId();
  const openedAt = new Date().toISOString();

  const session = {
    session_id: sessionId,
    subject_label: subjectLabel,
    subject_label_self_reported: true,
    judge_model_label: judgeModelLabel,
    judge_model_label_self_reported: true,
    bank_version: bank.meta.bankVersion,
    opened_at: openedAt,
  };

  const filePath = writeSessionFile(ctx.artifactRoot, sessionId, "session.json", session);
  ctx.sessions.set(sessionId, session);

  return {
    session_id: sessionId,
    subject_label_self_reported: true,
    judge_model_label_self_reported: true,
    artifact_path: filePath,
    data_handling_notice:
      "This session's data is written only to this local file, under the artifact root you " +
      "configured (CB_ARTIFACT_ROOT), never transmitted anywhere by cb-probe. Whatever you paste " +
      "as response_text will also be seen by your own model provider, the same as any other " +
      "message you send it. Delete this session by deleting its directory whenever you like.",
  };
}

// ---------------------------------------------------------------------------
// record_item_estimate({ session_id, item_id, response_text, rating_1_5, rationale })
// ---------------------------------------------------------------------------
export function recordItemEstimate(args = {}, ctx) {
  const {
    session_id: sessionId,
    item_id: itemId,
    response_text: responseText,
    rating_1_5: rating,
    rationale,
  } = args;

  if (typeof sessionId !== "string" || sessionId.length === 0) {
    throw new ToolError("session_id is required");
  }
  const session = requireSession(ctx, sessionId);

  if (typeof itemId !== "string" || itemId.length === 0) {
    throw new ToolError("item_id is required");
  }
  const bank = ctx.bank ?? loadBank();
  const item = findItem(bank, itemId);
  if (!item) {
    throw new ToolError(`No item with id "${itemId}"`);
  }

  if (!isValidRating(rating)) {
    throw new ToolError(
      `rating_1_5 must be an integer from 1 to 5. Got ${JSON.stringify(rating)}.`
    );
  }

  if (typeof responseText !== "string" || responseText.length === 0) {
    throw new ToolError("response_text is required and must be a non-empty string");
  }
  if (typeof rationale !== "string" || rationale.length === 0) {
    throw new ToolError("rationale is required and must be a non-empty string");
  }

  const estimate = {
    item_id: item.id,
    dimension: item.dimension,
    construct: item.construct,
    rating_1_5: rating,
    rationale,
    response_text: responseText,
    recorded_at: new Date().toISOString(),
  };

  appendSessionEstimate(ctx.artifactRoot, sessionId, item.id, estimate);

  return {
    status: "recorded",
    session_id: sessionId,
    item_id: item.id,
  };
}

// ---------------------------------------------------------------------------
// summarise_judge_session({ session_id })
// ---------------------------------------------------------------------------
export function summariseJudgeSession(args = {}, ctx) {
  const { session_id: sessionId } = args;
  if (typeof sessionId !== "string" || sessionId.length === 0) {
    throw new ToolError("session_id is required");
  }
  const session = requireSession(ctx, sessionId);
  const estimates = listSessionEstimates(ctx.artifactRoot, sessionId);

  const artifact = buildJudgeEstimate(session, estimates);
  writeSessionFile(ctx.artifactRoot, sessionId, "judge-estimate.json", artifact);

  return artifact;
}

// ---------------------------------------------------------------------------
// explain_what_this_is_not()
// ---------------------------------------------------------------------------
export function explainWhatThisIsNot() {
  return { statement: FULL_STATEMENT };
}

export { ToolError };
