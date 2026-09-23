// lib/scored-run.mjs
//
// The five scored-run tool handlers (docs/MCP_SCORED_RUN_DESIGN_2026-09-20.md
// §6): start_scored_run, next_item, record_item_rating, run_exposure_probe,
// finish_scored_run. Same shape as lib/tools.mjs: each is a plain function
// of (args, ctx) -> plain JS object; bin/server.mjs wraps these as MCP tool
// results. ctx additionally carries `runs: Map<run_id, runMeta>`.
//
// Business rules enforced here, explicitly (not scattered):
//   - trials < 3 refused (the variance floor -- evaluation-statistics.mjs
//     THRESHOLDS.MIN_TRIALS_PER_ITEM_FOR_VARIANCE, imported, never re-typed).
//   - a rating with no anchor_matched or no evidence_quote is refused.
//   - evidence_quote must actually be an excerpt of response_text.
//   - anchor_matched must correspond to the item's own published anchor for
//     the given rating level, when the item carries anchors.
//   - finish_scored_run refuses until run_exposure_probe has completed AND
//     every planned trial has been recorded.

import { loadBank, findItem, getScorableItems } from "./bank.mjs";
import { projectItem } from "./projection.mjs";
import { isValidRating } from "./validate-estimate.mjs";
import { DIMENSION_CODES } from "../../../site/scripts/lib/scoring.mjs";
import { THRESHOLDS } from "../../../site/scripts/lib/evaluation-statistics.mjs";
import { JUDGE_CONFIGURATIONS } from "./validate-scorecard.mjs";
import { pickProbeItemIds, scoreRecallAttempts } from "./exposure-probe.mjs";
import { buildSelfRunScorecard } from "./self-run-scorecard.mjs";
import {
  newRunId,
  writeRunFile,
  readRunFile,
  appendRunTrial,
  listRunTrials,
} from "./scored-run-store.mjs";

import { ToolError } from "./tools.mjs";

export const MIN_TRIALS = THRESHOLDS.MIN_TRIALS_PER_ITEM_FOR_VARIANCE;
export const DEFAULT_JUDGE_CONFIGURATION = "cross"; // the documented default (design doc §4, C2)
export const DEFAULT_PROBE_ITEM_COUNT = 3;

function requireRun(ctx, runId) {
  const meta = ctx.runs.get(runId) || readRunFile(ctx.artifactRoot, runId, "run.json");
  if (!meta) {
    throw new ToolError(`No open scored run with run_id "${runId}". Call start_scored_run first.`);
  }
  return meta;
}

function planKey(itemId, trialIndex) {
  return `${itemId}::${trialIndex}`;
}

function isNormalizedSubstring(haystack, needle) {
  const norm = (s) => s.toLowerCase().replace(/\s+/g, " ").trim();
  const h = norm(haystack);
  const n = norm(needle);
  return n.length > 0 && h.includes(n);
}

function matchesPublishedAnchor(item, rating, anchorMatched) {
  if (!Array.isArray(item.anchors) || item.anchors.length === 0) {
    return { ok: true };
  }
  const anchor = item.anchors.find((a) => a.level === rating);
  if (!anchor || typeof anchor.label !== "string") {
    return { ok: true };
  }
  const m = anchor.label.match(/[\d.]+\s*(.+)/);
  const bandWord = (m ? m[1] : anchor.label).trim().toLowerCase();
  const normalizedMatched = anchorMatched.toLowerCase();
  const ok = normalizedMatched.includes(bandWord) || normalizedMatched.includes(anchor.label.toLowerCase());
  if (ok) return { ok: true };
  return {
    ok: false,
    message:
      `anchor_matched ("${anchorMatched}") does not correspond to item "${item.id}"'s published anchor ` +
      `for rating ${rating} ("${anchor.label}"). Call get_anchors({ item_id: "${item.id}" }) and name ` +
      "the matching anchor.",
  };
}

// ---------------------------------------------------------------------------
// start_scored_run({ subject_label, judge_label, judgeConfiguration?, dimensions?, trials?, seed?, temperature? })
// ---------------------------------------------------------------------------
export function startScoredRun(args = {}, ctx) {
  const {
    subject_label: subjectLabel,
    judge_label: judgeLabel,
    judgeConfiguration = DEFAULT_JUDGE_CONFIGURATION,
    dimensions,
    trials = MIN_TRIALS,
    seed,
    temperature,
  } = args;

  if (typeof subjectLabel !== "string" || subjectLabel.length === 0) {
    throw new ToolError("subject_label is required and must be a non-empty string");
  }
  if (typeof judgeLabel !== "string" || judgeLabel.length === 0) {
    throw new ToolError("judge_label is required and must be a non-empty string");
  }
  if (!JUDGE_CONFIGURATIONS.includes(judgeConfiguration)) {
    throw new ToolError(
      `judgeConfiguration must be one of ${JUDGE_CONFIGURATIONS.join(", ")}. Got ${JSON.stringify(judgeConfiguration)}.`
    );
  }
  if (typeof trials !== "number" || !Number.isInteger(trials) || trials < MIN_TRIALS) {
    throw new ToolError(
      `trials must be an integer >= ${MIN_TRIALS} (evaluation-statistics.mjs ` +
        `THRESHOLDS.MIN_TRIALS_PER_ITEM_FOR_VARIANCE -- below this floor a per-item variance is not ` +
        `meaningful). Got ${JSON.stringify(trials)}.`
    );
  }
  if (seed !== undefined && (typeof seed !== "number" || !Number.isFinite(seed))) {
    throw new ToolError("seed, if supplied, must be a finite number");
  }
  if (temperature !== undefined && (typeof temperature !== "number" || !Number.isFinite(temperature))) {
    throw new ToolError("temperature, if supplied, must be a finite number");
  }

  const bank = ctx.bank ?? loadBank();

  let dimensionCodes;
  if (dimensions === undefined) {
    dimensionCodes = [...DIMENSION_CODES];
  } else {
    if (!Array.isArray(dimensions) || dimensions.length === 0) {
      throw new ToolError("dimensions, if supplied, must be a non-empty array of dimension codes");
    }
    for (const d of dimensions) {
      if (!DIMENSION_CODES.includes(d)) {
        throw new ToolError(`Unknown dimension code "${d}". Valid codes: ${DIMENSION_CODES.join(", ")}.`);
      }
    }
    dimensionCodes = [...new Set(dimensions)];
  }

  const items = getScorableItems(bank).filter((item) => dimensionCodes.includes(item.dimension));
  if (items.length === 0) {
    throw new ToolError("No scorable items found for the requested dimensions.");
  }

  const plan = [];
  for (const item of items.slice().sort((a, b) => a.id.localeCompare(b.id))) {
    for (let t = 1; t <= trials; t++) {
      plan.push({ item_id: item.id, trial_index: t });
    }
  }

  const runId = newRunId();
  const openedAt = new Date().toISOString();
  const run = {
    run_id: runId,
    subject_label: subjectLabel,
    judge_label: judgeLabel,
    judge_configuration: judgeConfiguration,
    dimensions: dimensionCodes,
    trials_per_item: trials,
    seed: seed ?? null,
    temperature: temperature ?? null,
    bank_version: bank.meta.bankVersion,
    item_ids: items.map((i) => i.id),
    plan,
    opened_at: openedAt,
  };

  const filePath = writeRunFile(ctx.artifactRoot, runId, "run.json", run);
  ctx.runs.set(runId, run);

  return {
    run_id: runId,
    judge_configuration: judgeConfiguration,
    item_count: items.length,
    trials_per_item: trials,
    total_planned_trials: plan.length,
    dimensions: dimensionCodes,
    artifact_path: filePath,
    next_step:
      "Call run_exposure_probe({ run_id }) first (recommended, and mandatory before finish_scored_run) " +
      "to check for bank contamination, then next_item({ run_id }) to get the first prompt.",
    data_handling_notice:
      "This run's data is written only to this local file, under the artifact root you configured " +
      "(CB_ARTIFACT_ROOT), never transmitted anywhere by cb-probe. Whatever you paste as response_text " +
      "will also be seen by your own model provider, the same as any other message you send it.",
  };
}

// ---------------------------------------------------------------------------
// next_item({ run_id })
// ---------------------------------------------------------------------------
export function nextItem(args = {}, ctx) {
  const { run_id: runId } = args;
  if (typeof runId !== "string" || runId.length === 0) {
    throw new ToolError("run_id is required");
  }
  const run = requireRun(ctx, runId);
  const bank = ctx.bank ?? loadBank();

  const recorded = listRunTrials(ctx.artifactRoot, runId);
  const recordedKeys = new Set(recorded.map((t) => planKey(t.item_id, t.trial_index)));
  const pending = run.plan.find((p) => !recordedKeys.has(planKey(p.item_id, p.trial_index)));

  if (!pending) {
    return {
      run_id: runId,
      status: "complete",
      message:
        "All planned trials have been recorded. Call run_exposure_probe (if you have not already) and " +
        "then finish_scored_run.",
    };
  }

  const item = findItem(bank, pending.item_id);
  if (!item) {
    throw new ToolError(`Internal error: planned item "${pending.item_id}" not found in the current task bank.`);
  }
  const projected = projectItem(item, bank.meta.fieldSeparationPolicy);

  return {
    run_id: runId,
    item_id: item.id,
    trial_index: pending.trial_index,
    trials_per_item: run.trials_per_item,
    dimension: projected.dimension,
    construct: projected.construct,
    prompt: projected.prompt,
    remaining_after_this: run.plan.length - recorded.length - 1,
  };
}

// ---------------------------------------------------------------------------
// record_item_rating({ run_id, item_id, response_text, rating_1_5, anchor_matched, evidence_quote, judge_label? })
// ---------------------------------------------------------------------------
export function recordItemRating(args = {}, ctx) {
  const {
    run_id: runId,
    item_id: itemId,
    response_text: responseText,
    rating_1_5: rating,
    anchor_matched: anchorMatched,
    evidence_quote: evidenceQuote,
    judge_label: judgeLabelOverride,
  } = args;

  if (typeof runId !== "string" || runId.length === 0) {
    throw new ToolError("run_id is required");
  }
  const run = requireRun(ctx, runId);

  if (typeof itemId !== "string" || itemId.length === 0) {
    throw new ToolError("item_id is required");
  }
  if (!run.item_ids.includes(itemId)) {
    throw new ToolError(`Item "${itemId}" is not part of run "${runId}"'s planned item set.`);
  }

  const bank = ctx.bank ?? loadBank();
  const item = findItem(bank, itemId);
  if (!item) {
    throw new ToolError(`No item with id "${itemId}"`);
  }

  if (!isValidRating(rating)) {
    throw new ToolError(`rating_1_5 must be an integer from 1 to 5. Got ${JSON.stringify(rating)}.`);
  }
  if (typeof responseText !== "string" || responseText.trim().length === 0) {
    throw new ToolError("response_text is required and must be a non-empty string");
  }
  if (typeof anchorMatched !== "string" || anchorMatched.trim().length === 0) {
    throw new ToolError(
      "anchor_matched is required: name the published rubric anchor this rating matches (call " +
        "get_anchors first). A rating with no anchor is not auditable."
    );
  }
  if (typeof evidenceQuote !== "string" || evidenceQuote.trim().length === 0) {
    throw new ToolError(
      "evidence_quote is required: a verbatim excerpt of response_text supporting this rating. A " +
        "rating with no quote is not auditable."
    );
  }
  if (!isNormalizedSubstring(responseText, evidenceQuote)) {
    throw new ToolError(
      "evidence_quote must appear (verbatim, allowing for surrounding whitespace) inside " +
        "response_text -- it must be an excerpt of the actual response, not a paraphrase or summary."
    );
  }
  const anchorCheck = matchesPublishedAnchor(item, rating, anchorMatched);
  if (!anchorCheck.ok) {
    throw new ToolError(anchorCheck.message);
  }

  const existing = listRunTrials(ctx.artifactRoot, runId).filter((t) => t.item_id === itemId);
  if (existing.length >= run.trials_per_item) {
    throw new ToolError(
      `Item "${itemId}" already has ${existing.length} recorded rating(s), the run's trials_per_item ` +
        `(${run.trials_per_item}). No more trials are planned for this item.`
    );
  }
  const trialIndex = existing.length + 1;

  const judgeLabel =
    typeof judgeLabelOverride === "string" && judgeLabelOverride.length > 0 ? judgeLabelOverride : run.judge_label;

  const trial = {
    item_id: item.id,
    dimension: item.dimension,
    construct: item.construct,
    trial_index: trialIndex,
    judge_label: judgeLabel,
    rating_1_5: rating,
    anchor_matched: anchorMatched,
    evidence_quote: evidenceQuote,
    response_text: responseText,
    recorded_at: new Date().toISOString(),
  };

  appendRunTrial(ctx.artifactRoot, runId, item.id, trialIndex, trial);

  return { status: "recorded", run_id: runId, item_id: item.id, trial_index: trialIndex, judge_label: judgeLabel };
}

// ---------------------------------------------------------------------------
// run_exposure_probe({ run_id, recall_attempts? })
// ---------------------------------------------------------------------------
export function runExposureProbe(args = {}, ctx) {
  const { run_id: runId, recall_attempts: recallAttempts } = args;
  if (typeof runId !== "string" || runId.length === 0) {
    throw new ToolError("run_id is required");
  }
  const run = requireRun(ctx, runId);
  const bank = ctx.bank ?? loadBank();

  const existingProbe = readRunFile(ctx.artifactRoot, runId, "exposure-probe.json");

  if (recallAttempts === undefined) {
    // Phase 1: issue the challenge. Idempotent -- re-issues the same ids if
    // already issued and not yet completed, so a client that lost its
    // reply can safely call again.
    if (existingProbe && existingProbe.status === "completed") {
      return { run_id: runId, phase: "completed", ...existingProbe };
    }
    const probeItemIds =
      existingProbe && existingProbe.status === "challenge_issued"
        ? existingProbe.probe_item_ids
        : pickProbeItemIds(run.item_ids, DEFAULT_PROBE_ITEM_COUNT);

    const challenge = {
      status: "challenge_issued",
      probe_item_ids: probeItemIds,
      issued_at: existingProbe?.issued_at ?? new Date().toISOString(),
    };
    writeRunFile(ctx.artifactRoot, runId, "exposure-probe.json", challenge);

    return {
      run_id: runId,
      phase: "challenge",
      probe_item_ids: probeItemIds,
      instruction:
        "For each item id listed above, recall from memory (no tool lookup -- do not call " +
        "list_probe_items or get_anchors for these ids first) your best reconstruction of that item's " +
        "exact prompt wording. If you have no memory of it, say so plainly rather than guessing prose " +
        "that merely sounds plausible. Then call run_exposure_probe again with recall_attempts: an " +
        "array of { item_id, recalled_text } for every id listed above.",
    };
  }

  // Phase 2: score the recall attempts.
  if (!Array.isArray(recallAttempts) || recallAttempts.length === 0) {
    throw new ToolError("recall_attempts must be a non-empty array of { item_id, recalled_text }");
  }
  const issuedIds =
    existingProbe && Array.isArray(existingProbe.probe_item_ids) ? existingProbe.probe_item_ids : null;
  if (!issuedIds) {
    throw new ToolError(
      "Call run_exposure_probe({ run_id }) with no recall_attempts first to receive the probe_item_ids challenge."
    );
  }
  const attemptedIds = new Set(recallAttempts.map((a) => a && a.item_id));
  const missing = issuedIds.filter((id) => !attemptedIds.has(id));
  if (missing.length > 0) {
    throw new ToolError(`recall_attempts is missing an entry for: ${missing.join(", ")}`);
  }

  const result = scoreRecallAttempts(bank, issuedIds, recallAttempts);
  const persisted = {
    status: "completed",
    probed: true,
    probed_at: new Date().toISOString(),
    ...result,
  };
  writeRunFile(ctx.artifactRoot, runId, "exposure-probe.json", persisted);

  return { run_id: runId, phase: "completed", ...persisted };
}

// ---------------------------------------------------------------------------
// finish_scored_run({ run_id })
// ---------------------------------------------------------------------------
export function finishScoredRun(args = {}, ctx) {
  const { run_id: runId } = args;
  if (typeof runId !== "string" || runId.length === 0) {
    throw new ToolError("run_id is required");
  }
  const run = requireRun(ctx, runId);
  const bank = ctx.bank ?? loadBank();

  const exposureProbe = readRunFile(ctx.artifactRoot, runId, "exposure-probe.json");
  if (!exposureProbe || exposureProbe.status !== "completed") {
    throw new ToolError(
      "finish_scored_run refuses: run_exposure_probe has not completed for this run. Our entire item " +
        "bank is published with full rubrics, so contamination must be checked before any composite is " +
        "emitted (docs/MCP_SCORED_RUN_DESIGN_2026-09-20.md §5). Call run_exposure_probe({ run_id }) " +
        "with no arguments to get the challenge, then again with recall_attempts to score it, then call " +
        "finish_scored_run again."
    );
  }

  const trials = listRunTrials(ctx.artifactRoot, runId);
  const recordedKeys = new Set(trials.map((t) => planKey(t.item_id, t.trial_index)));
  const missingPlan = run.plan.filter((p) => !recordedKeys.has(planKey(p.item_id, p.trial_index)));
  if (missingPlan.length > 0) {
    throw new ToolError(
      `finish_scored_run refuses: ${missingPlan.length} of ${run.plan.length} planned trial(s) have not ` +
        `been recorded yet (e.g. ${missingPlan
          .slice(0, 3)
          .map((p) => `${p.item_id} trial ${p.trial_index}`)
          .join(", ")}). Call next_item({ run_id }) and record_item_rating for each remaining trial, ` +
        "then call finish_scored_run again."
    );
  }

  return buildSelfRunScorecard({ run, trials, exposureProbe, bank });
}
