// lib/scored-run.mjs
//
// The scored-run tool handlers (docs/MCP_SCORED_RUN_DESIGN_2026-09-20.md
// §6): start_scored_run, next_item, record_item_rating (single OR batch
// form), run_exposure_probe, finish_scored_run, and run_status (Iteration
// 32 -- a read-only re-orientation tool, added to cut round trips on a long
// run without weakening any existing guarantee). Same shape as
// lib/tools.mjs: each is a plain function of (args, ctx) -> plain JS
// object; bin/server.mjs wraps these as MCP tool results. ctx additionally
// carries `runs: Map<run_id, runMeta>`.
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

import { loadBank, findItem, getScorableItems, isScorableItem } from "./bank.mjs";
import { projectItem } from "./projection.mjs";
import { isValidRating } from "./validate-estimate.mjs";
import { DIMENSION_CODES } from "../../../site/scripts/lib/scoring.mjs";
import { THRESHOLDS } from "../../../site/scripts/lib/evaluation-statistics.mjs";
import { JUDGE_CONFIGURATIONS } from "./validate-scorecard.mjs";
import {
  pickProbeItemIds,
  scoreRecallAttempts,
  assertSubstantiveRecall,
  normalizeTokens,
  EXPOSURE_METHOD_DESCRIPTION,
  EXPOSURE_LIMITATIONS,
  EXPOSURE_FLAG_THRESHOLD,
} from "./exposure-probe.mjs";
import {
  buildIdentificationChallenge,
  scoreIdentification,
} from "./identification-probe.mjs";
import { isSensitiveItem } from "./sensitivity.mjs";
import { SELF_RUN_HEADER } from "./scorecard-header.mjs";
import { buildSelfRunScorecard } from "./self-run-scorecard.mjs";
import {
  newRunId,
  writeRunFile,
  readRunFile,
  appendRunTrial,
  listRunTrials,
} from "./scored-run-store.mjs";

import { ToolError } from "./tools.mjs";

/** Minimum normalised token count an evidence_quote must have to count as
 * substantive, not a single word or stopword (docs/reviews/
 * CB_PROBE_SILENT_FAILURES_2026-09-24.md finding #7). */
const MIN_EVIDENCE_QUOTE_TOKENS = 3;

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

function normalizeLabel(s) {
  return String(s).toLowerCase().replace(/\s+/g, " ").trim();
}

/**
 * anchor_matched must EQUAL (normalised) the item's published anchor label
 * or its band word for the given rating -- not merely CONTAIN it. A
 * substring check let self-contradictory text through (e.g. "this is
 * definitely NOT Established, it reads as Critical to me" satisfied a
 * substring match for a rating of 4, because it contains "established"),
 * removing the one guard meant to keep rating_1_5 auditable rather than a
 * vibe (docs/reviews/CB_PROBE_SILENT_FAILURES_2026-09-24.md finding #3).
 */
function matchesPublishedAnchor(item, rating, anchorMatched) {
  if (!Array.isArray(item.anchors) || item.anchors.length === 0) {
    return { ok: true };
  }
  const anchor = item.anchors.find((a) => a.level === rating);
  if (!anchor || typeof anchor.label !== "string") {
    return { ok: true };
  }
  const m = anchor.label.match(/[\d.]+\s*(.+)/);
  const bandWord = normalizeLabel(m ? m[1] : anchor.label);
  const fullLabel = normalizeLabel(anchor.label);
  const normalizedMatched = normalizeLabel(anchorMatched);
  const ok = normalizedMatched === bandWord || normalizedMatched === fullLabel;
  if (ok) return { ok: true };
  return {
    ok: false,
    message:
      `anchor_matched ("${anchorMatched}") does not EXACTLY match item "${item.id}"'s published anchor ` +
      `label for rating ${rating} ("${anchor.label}") -- it must equal "${bandWord}" or "${anchor.label}" ` +
      `(case/whitespace-normalised), not merely contain it. Call get_anchors({ item_id: "${item.id}" }) ` +
      "and name the matching anchor exactly.",
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
    include_sensitive: includeSensitiveArg = false,
  } = args;

  if (typeof includeSensitiveArg !== "boolean") {
    throw new ToolError("include_sensitive must be a boolean if provided");
  }
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

  let items = getScorableItems(bank).filter((item) => dimensionCodes.includes(item.dimension));
  // Crisis-content gate: excluded by default, same as list_probe_items --
  // previously start_scored_run applied NO sensitivity filter at all, so
  // the only run that yields a composite (the default all-8-dimension run)
  // walked the model through active-suicidal-ideation, domestic-violence
  // and psychosis-adjacent prompts with no opt-in and no notice (see
  // docs/reviews/CB_PROBE_SECURITY_2026-09-24.md SEC-03 and
  // docs/reviews/CB_PROBE_ARCHITECTURE_2026-09-24.md §2.4). All 8
  // dimensions remain scorable with sensitive items excluded.
  const sensitiveItemsExcludedCount = items.filter((item) => isSensitiveItem(item)).length;
  if (!includeSensitiveArg) {
    items = items.filter((item) => !isSensitiveItem(item));
  }
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
    include_sensitive: includeSensitiveArg,
    sensitive_items_excluded: includeSensitiveArg ? 0 : sensitiveItemsExcludedCount,
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
    include_sensitive: includeSensitiveArg,
    sensitive_items_excluded: includeSensitiveArg ? 0 : sensitiveItemsExcludedCount,
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
  const sensitive = isSensitiveItem(item);

  return {
    run_id: runId,
    item_id: item.id,
    trial_index: pending.trial_index,
    trials_per_item: run.trials_per_item,
    dimension: projected.dimension,
    construct: projected.construct,
    prompt: projected.prompt,
    remaining_after_this: run.plan.length - recorded.length - 1,
    // Surfaced at the point of delivery, not only in the final scorecard
    // header -- only reachable at all when include_sensitive was true at
    // start_scored_run, since sensitive items are excluded from the plan
    // by default (see startScoredRun).
    ...(sensitive ? { sensitive: true, duty_of_care: SELF_RUN_HEADER.duty_of_care } : {}),
  };
}

// ---------------------------------------------------------------------------
// Shared rating-shape validation, used by BOTH the single-rating form and
// the batch form below, so the two paths cannot silently diverge (one
// business rule, one place to read it) -- docs/reviews/
// CB_PROBE_METHODOLOGY_2026-09-24.md and this package's own house style
// both treat "two code paths checking the same thing slightly differently"
// as the failure mode to design out.
// ---------------------------------------------------------------------------
function validateRatingShape({ item, rating, responseText, anchorMatched, evidenceQuote }) {
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
  if (normalizeTokens(evidenceQuote).length < MIN_EVIDENCE_QUOTE_TOKENS) {
    throw new ToolError(
      `evidence_quote must be a substantive excerpt (at least ${MIN_EVIDENCE_QUOTE_TOKENS} words after ` +
        `normalisation), not a single word or stopword -- a one-word quote proves the string appears ` +
        "somewhere in the response, not that it supports the rating."
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
}

/**
 * Look up and validate one rating's item_id against the run's own planned
 * item set and the real bank -- shared by both the single-rating and batch
 * paths.
 */
function resolveRatingItem(run, bank, itemId, label) {
  if (typeof itemId !== "string" || itemId.length === 0) {
    throw new ToolError(`${label}item_id is required`);
  }
  if (!run.item_ids.includes(itemId)) {
    throw new ToolError(`${label}Item "${itemId}" is not part of run "${run.run_id}"'s planned item set.`);
  }
  const item = findItem(bank, itemId);
  if (!item) {
    throw new ToolError(`${label}No item with id "${itemId}"`);
  }
  return item;
}

// ---------------------------------------------------------------------------
// record_item_rating({ run_id, item_id, response_text, rating_1_5, anchor_matched, evidence_quote, judge_label? })
//   -- OR, batch form --
// record_item_rating({ run_id, ratings: [{ item_id, response_text, rating_1_5, anchor_matched, evidence_quote, judge_label? }, ...] })
// ---------------------------------------------------------------------------
export function recordItemRating(args = {}, ctx) {
  const { run_id: runId, ratings } = args;

  if (typeof runId !== "string" || runId.length === 0) {
    throw new ToolError("run_id is required");
  }
  const run = requireRun(ctx, runId);
  const bank = ctx.bank ?? loadBank();

  const singleFieldsPresent = [
    "item_id",
    "response_text",
    "rating_1_5",
    "anchor_matched",
    "evidence_quote",
  ].some((k) => args[k] !== undefined);

  if (ratings !== undefined && singleFieldsPresent) {
    throw new ToolError(
      "record_item_rating refuses: supply EITHER the single-rating fields (item_id, response_text, " +
        "rating_1_5, anchor_matched, evidence_quote) OR ratings (a batch array), not both in the same call."
    );
  }

  if (ratings !== undefined) {
    return recordItemRatingsBatch(run, bank, ctx, ratings);
  }

  const {
    item_id: itemId,
    response_text: responseText,
    rating_1_5: rating,
    anchor_matched: anchorMatched,
    evidence_quote: evidenceQuote,
    judge_label: judgeLabelOverride,
  } = args;

  const item = resolveRatingItem(run, bank, itemId, "");
  validateRatingShape({ item, rating, responseText, anchorMatched, evidenceQuote });

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

/**
 * Batch form of record_item_rating: every element is validated EXACTLY as a
 * single rating is (same item-membership, anchor-match, evidence-quote, and
 * per-item trial-cap checks), and if ANY element fails, the WHOLE batch is
 * rejected -- nothing is written to disk for any element, including ones
 * that validated fine before the failing one. This is why validation and
 * writing are two separate passes below: the first pass can throw freely
 * because it has not touched disk yet.
 */
function recordItemRatingsBatch(run, bank, ctx, ratings) {
  if (!Array.isArray(ratings) || ratings.length === 0) {
    throw new ToolError("ratings must be a non-empty array when supplied");
  }

  const diskCounts = new Map();
  for (const t of listRunTrials(ctx.artifactRoot, run.run_id)) {
    diskCounts.set(t.item_id, (diskCounts.get(t.item_id) ?? 0) + 1);
  }
  const batchCounts = new Map();
  const prepared = [];

  ratings.forEach((entry, index) => {
    const label = `ratings[${index}]: `;
    if (!entry || typeof entry !== "object") {
      throw new ToolError(`${label}must be an object`);
    }
    const {
      item_id: itemId,
      response_text: responseText,
      rating_1_5: rating,
      anchor_matched: anchorMatched,
      evidence_quote: evidenceQuote,
      judge_label: judgeLabelOverride,
    } = entry;

    const item = resolveRatingItem(run, bank, itemId, label);
    try {
      validateRatingShape({ item, rating, responseText, anchorMatched, evidenceQuote });
    } catch (error) {
      throw new ToolError(`${label}${error.message}`);
    }

    const existingCount = (diskCounts.get(itemId) ?? 0) + (batchCounts.get(itemId) ?? 0);
    if (existingCount >= run.trials_per_item) {
      throw new ToolError(
        `${label}item "${itemId}" already has ${existingCount} recorded rating(s) (counting earlier ` +
          `entries in this same batch), the run's trials_per_item (${run.trials_per_item}). No more ` +
          "trials are planned for this item."
      );
    }
    const trialIndex = existingCount + 1;
    batchCounts.set(itemId, existingCount + 1);

    const judgeLabel =
      typeof judgeLabelOverride === "string" && judgeLabelOverride.length > 0 ? judgeLabelOverride : run.judge_label;

    prepared.push({
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
    });
  });

  // Second pass: every element above validated without throwing, so it is
  // now safe to write all of them. Nothing above this line touched disk.
  const results = prepared.map((trial) => {
    appendRunTrial(ctx.artifactRoot, run.run_id, trial.item_id, trial.trial_index, trial);
    return { item_id: trial.item_id, trial_index: trial.trial_index, judge_label: trial.judge_label };
  });

  return { status: "recorded", run_id: run.run_id, count: results.length, ratings: results };
}

// ---------------------------------------------------------------------------
// run_status({ run_id })
//
// A cheap, read-only re-orientation tool: how many trials are planned,
// recorded, and remaining (overall and per item), whether the mandatory
// exposure probe has completed, and whether the run is ready for
// finish_scored_run -- so a host model driving a 69+ trial loop does not
// have to reconstruct this by paging through next_item or re-deriving it
// from raw trial files. Writes nothing; changes no guarantee.
// ---------------------------------------------------------------------------
export function runStatus(args = {}, ctx) {
  const { run_id: runId } = args;
  if (typeof runId !== "string" || runId.length === 0) {
    throw new ToolError("run_id is required");
  }
  const run = requireRun(ctx, runId);

  const recorded = listRunTrials(ctx.artifactRoot, runId);
  const recordedKeys = new Set(recorded.map((t) => planKey(t.item_id, t.trial_index)));
  const remainingPlan = run.plan.filter((p) => !recordedKeys.has(planKey(p.item_id, p.trial_index)));

  const plannedByItem = new Map();
  for (const p of run.plan) {
    plannedByItem.set(p.item_id, (plannedByItem.get(p.item_id) ?? 0) + 1);
  }
  const recordedByItem = new Map();
  for (const t of recorded) {
    recordedByItem.set(t.item_id, (recordedByItem.get(t.item_id) ?? 0) + 1);
  }
  const items = [...run.item_ids].sort().map((itemId) => {
    const planned = plannedByItem.get(itemId) ?? 0;
    const done = recordedByItem.get(itemId) ?? 0;
    return { item_id: itemId, planned, recorded: done, remaining: planned - done };
  });

  const exposureProbe = readRunFile(ctx.artifactRoot, runId, "exposure-probe.json");
  const exposureProbeStatus = !exposureProbe
    ? "not_started"
    : exposureProbe.status === "completed"
      ? "completed"
      : "challenge_issued";

  const scorecard = readRunFile(ctx.artifactRoot, runId, "scorecard.json");
  const readyToFinish = exposureProbeStatus === "completed" && remainingPlan.length === 0;

  let nextStep;
  if (remainingPlan.length > 0) {
    nextStep = "Call next_item({ run_id }) to get the next pending prompt.";
  } else if (exposureProbeStatus !== "completed") {
    nextStep =
      "All trials are recorded. Call run_exposure_probe({ run_id }) (with no recall_attempts first, then " +
      "with recall_attempts) to complete the mandatory contamination check before finishing.";
  } else if (scorecard) {
    nextStep =
      "This run is already finished. finish_scored_run({ run_id }) will return the same scorecard again " +
      "(idempotent).";
  } else {
    nextStep = "All trials are recorded and the probe is complete -- call finish_scored_run({ run_id }).";
  }

  return {
    run_id: runId,
    subject_label: run.subject_label,
    judge_label: run.judge_label,
    judge_configuration: run.judge_configuration,
    dimensions: run.dimensions,
    trials_per_item: run.trials_per_item,
    total_planned_trials: run.plan.length,
    total_recorded_trials: recorded.length,
    total_remaining_trials: remainingPlan.length,
    items,
    next_pending_trial:
      remainingPlan.length > 0 ? { item_id: remainingPlan[0].item_id, trial_index: remainingPlan[0].trial_index } : null,
    exposure_probe_status: exposureProbeStatus,
    ready_to_finish: readyToFinish,
    finished: !!scorecard,
    next_step: nextStep,
  };
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
    // Seeded from run_id, not always the alphabetically-first ids -- the
    // previous behaviour (`pickProbeItemIds(run.item_ids, count)` with no
    // seed) probed the exact same ids for every run over the same item set,
    // a known, gameable, publicly-predictable sample
    // (docs/reviews/CB_PROBE_SECURITY_2026-09-24.md SEC-05).
    const probeItemIds =
      existingProbe && existingProbe.status === "challenge_issued"
        ? existingProbe.probe_item_ids
        : pickProbeItemIds(run.item_ids, DEFAULT_PROBE_ITEM_COUNT, runId);

    // MS-3: token overlap detects verbatim memorisation of the PROMPT and
    // misses knowledge of the item and its rubric, which is the contamination
    // that actually inflates a score. The forced-choice identification probe
    // tests the arbitrary ID-to-scenario mapping instead, which cannot be
    // inferred. Both run; both are reported.
    const identification =
      existingProbe && existingProbe.identification_challenge
        ? { challenge: existingProbe.identification_challenge, key: readRunFile(ctx.artifactRoot, runId, "identification-key.json") }
        : buildIdentificationChallenge(bank, run.item_ids, runId);

    // The answer key is persisted SEPARATELY and never returned. Putting it in
    // the challenge response would hand the subject the answers to the test it
    // is about to sit.
    if (identification.key) {
      writeRunFile(ctx.artifactRoot, runId, "identification-key.json", identification.key);
    }

    const challenge = {
      status: "challenge_issued",
      probe_item_ids: probeItemIds,
      identification_challenge: identification.challenge,
      selection_method:
        "Deterministically shuffled from this run's own run_id (sha256-seeded), then the first " +
        `${DEFAULT_PROBE_ITEM_COUNT} ids taken -- not the alphabetically-first ids, and not the same ` +
        "set across different runs over the same item pool.",
      issued_at: existingProbe?.issued_at ?? new Date().toISOString(),
    };
    writeRunFile(ctx.artifactRoot, runId, "exposure-probe.json", challenge);

    return {
      run_id: runId,
      phase: "challenge",
      probe_item_ids: probeItemIds,
      selection_method: challenge.selection_method,
      identification: identification.challenge,
      instruction:
        "For each item id listed above, recall from memory (no tool lookup -- do not call " +
        "list_probe_items or get_anchors for these ids first) your best reconstruction of that item's " +
        "exact prompt wording. If you have no memory of it, say so plainly rather than guessing prose " +
        "that merely sounds plausible -- a substantive, honest 'I don't recall this' sentence is fine. " +
        "A blank, whitespace-only, or single-word recalled_text is refused, not silently scored as " +
        "clean. Then call run_exposure_probe again with recall_attempts: an array of " +
        "{ item_id, recalled_text } for every id listed above.",
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
  // A blank, whitespace-only, punctuation-only, or single-stopword
  // recalled_text must FAIL this probe, not silently pass it as a clean
  // result -- verified: all of the above score tokenOverlap 0, identical to
  // an honest "I don't remember" answer, with nothing in the persisted
  // result previously distinguishing the two
  // (docs/reviews/CB_PROBE_SILENT_FAILURES_2026-09-24.md finding #1).
  for (const id of issuedIds) {
    const attempt = recallAttempts.find((a) => a && a.item_id === id);
    try {
      assertSubstantiveRecall(attempt && attempt.recalled_text, id);
    } catch (error) {
      throw new ToolError(error.message);
    }
  }

  const result = scoreRecallAttempts(bank, issuedIds, recallAttempts);

  const identificationKey = readRunFile(ctx.artifactRoot, runId, "identification-key.json");
  const identificationResult = scoreIdentification(identificationKey, args.identification_answers);

  const persisted = {
    status: "completed",
    probed: true,
    probed_at: new Date().toISOString(),
    ...result,
    identification: identificationResult,
    // A run is contaminated if EITHER probe says so. They detect different
    // things -- verbatim prompt recall, and knowing which scenario is which --
    // and a subject can fail one while passing the other. This is the field
    // the scorecard and any reader should look at.
    contamination_indicated:
      Boolean(result.high_exposure_item_ids && result.high_exposure_item_ids.length > 0) ||
      Boolean(identificationResult && identificationResult.flagged),
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

  // --------------------------------------------------------------------
  // Re-validate the run record itself. run.json is a plain, user-editable
  // file, and the 3-trial floor was previously enforced ONLY at
  // start_scored_run, never re-checked here -- a hand-written run.json
  // plus hand-written trial files produced a schema-valid composite with
  // trials_per_item: 1 (docs/reviews/CB_PROBE_SECURITY_2026-09-24.md
  // SEC-02). Nothing on disk is trusted without a fresh check here, the
  // same discipline lib/validate-estimate.mjs's JudgeEstimate path already
  // applies to disk-read content.
  // --------------------------------------------------------------------
  if (typeof run.trials_per_item !== "number" || !Number.isInteger(run.trials_per_item) || run.trials_per_item < MIN_TRIALS) {
    throw new ToolError(
      `finish_scored_run refuses: this run's trials_per_item (${JSON.stringify(run.trials_per_item)}) is ` +
        `below the variance floor of ${MIN_TRIALS}, or is not a valid integer. The run's record on disk ` +
        "may have been edited after start_scored_run."
    );
  }
  if (!Array.isArray(run.item_ids) || run.item_ids.length === 0) {
    throw new ToolError("finish_scored_run refuses: this run's item_ids is missing or empty.");
  }
  if (new Set(run.item_ids).size !== run.item_ids.length) {
    throw new ToolError("finish_scored_run refuses: this run's item_ids contains duplicate entries.");
  }
  for (const itemId of run.item_ids) {
    const bankItem = findItem(bank, itemId);
    if (!bankItem) {
      throw new ToolError(
        `finish_scored_run refuses: item "${itemId}" in this run's item_ids does not exist in the ` +
          "current task bank -- an invented id cannot be scored."
      );
    }
    if (!isScorableItem(bankItem)) {
      throw new ToolError(
        `finish_scored_run refuses: item "${itemId}" in this run's item_ids is not a scorable item ` +
          "in the current task bank."
      );
    }
  }

  // Re-derive the expected trial plan from item_ids x trials_per_item.
  // NEVER trust the stored run.plan array as the completeness denominator
  // -- a hand-edited run.json could otherwise shrink it so a partial run
  // looks finished.
  const expectedPlan = [];
  for (const itemId of [...run.item_ids].sort()) {
    for (let t = 1; t <= run.trials_per_item; t++) {
      expectedPlan.push({ item_id: itemId, trial_index: t });
    }
  }

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
  const missingPlan = expectedPlan.filter((p) => !recordedKeys.has(planKey(p.item_id, p.trial_index)));
  if (missingPlan.length > 0) {
    throw new ToolError(
      `finish_scored_run refuses: ${missingPlan.length} of ${expectedPlan.length} planned trial(s) have ` +
        `not been recorded yet (e.g. ${missingPlan
          .slice(0, 3)
          .map((p) => `${p.item_id} trial ${p.trial_index}`)
          .join(", ")}). Call next_item({ run_id }) and record_item_rating for each remaining trial, ` +
        "then call finish_scored_run again."
    );
  }
  if (trials.length !== expectedPlan.length) {
    throw new ToolError(
      `finish_scored_run refuses: ${trials.length} trial file(s) exist on disk, but this run's own ` +
        `item_ids x trials_per_item requires exactly ${expectedPlan.length}. The run's trial files may ` +
        "have been added to or edited outside record_item_rating."
    );
  }

  // Re-validate every trial's shape against the real bank -- do not trust
  // that a trial file on disk still satisfies what record_item_rating
  // checked when it was first written (SEC-02: the anchor and evidence_quote
  // invariants were previously never re-checked at finish).
  for (const t of trials) {
    if (!isValidRating(t.rating_1_5)) {
      throw new ToolError(
        `finish_scored_run refuses: trial ${t.item_id}/${t.trial_index} has an invalid rating_1_5 on disk.`
      );
    }
    if (typeof t.response_text !== "string" || t.response_text.trim().length === 0) {
      throw new ToolError(
        `finish_scored_run refuses: trial ${t.item_id}/${t.trial_index} has an empty response_text on disk.`
      );
    }
    if (typeof t.evidence_quote !== "string" || !isNormalizedSubstring(t.response_text, t.evidence_quote)) {
      throw new ToolError(
        `finish_scored_run refuses: trial ${t.item_id}/${t.trial_index}'s evidence_quote is not a ` +
          "substring of its response_text on disk."
      );
    }
    if (normalizeTokens(t.evidence_quote).length < MIN_EVIDENCE_QUOTE_TOKENS) {
      throw new ToolError(
        `finish_scored_run refuses: trial ${t.item_id}/${t.trial_index}'s evidence_quote on disk is too ` +
          "short to be substantive."
      );
    }
    const bankItem = findItem(bank, t.item_id);
    const anchorCheck = matchesPublishedAnchor(bankItem, t.rating_1_5, typeof t.anchor_matched === "string" ? t.anchor_matched : "");
    if (!anchorCheck.ok) {
      throw new ToolError(
        `finish_scored_run refuses: trial ${t.item_id}/${t.trial_index}'s anchor_matched on disk does not ` +
          `correspond to the published anchor. ${anchorCheck.message}`
      );
    }
  }

  // Re-derive the contamination result from the persisted RAW recall
  // attempts (recalled_text), rather than trusting any precomputed summary
  // field on disk -- a hand-edited exposure-probe.json could otherwise
  // claim a clean mean_overlap while the recalled_text told a different
  // story, or simply delete the `limitations` array. method,
  // exposure_flag_threshold, and limitations are ALWAYS the real exported
  // constants, never copied from the file (SEC-02).
  if (!Array.isArray(exposureProbe.probe_item_ids) || exposureProbe.probe_item_ids.length === 0) {
    throw new ToolError(
      "finish_scored_run refuses: the persisted exposure probe has no probe_item_ids. Call " +
        "run_exposure_probe({ run_id }) again."
    );
  }
  if (!Array.isArray(exposureProbe.items)) {
    throw new ToolError(
      "finish_scored_run refuses: the persisted exposure probe has no items[]. Call " +
        "run_exposure_probe({ run_id }) again."
    );
  }
  const recallAttemptsFromDisk = exposureProbe.items.map((i) => ({
    item_id: i && i.item_id,
    recalled_text: i && i.recalled_text,
  }));
  for (const probedId of exposureProbe.probe_item_ids) {
    const attempt = recallAttemptsFromDisk.find((a) => a.item_id === probedId);
    try {
      assertSubstantiveRecall(attempt && attempt.recalled_text, probedId);
    } catch (error) {
      throw new ToolError(
        `finish_scored_run refuses: the persisted exposure probe is invalid on disk -- ${error.message}`
      );
    }
  }
  const rederivedContamination = scoreRecallAttempts(bank, exposureProbe.probe_item_ids, recallAttemptsFromDisk);
  const verifiedExposureProbe = {
    status: "completed",
    probed: true,
    probed_at: exposureProbe.probed_at ?? null,
    ...rederivedContamination,
    // Overwrite with the real, current constants regardless of what
    // scoreRecallAttempts (itself re-derived above, but defence in depth)
    // or the disk file said -- these three fields must never be able to
    // drift from lib/exposure-probe.mjs's own exports.
    method: EXPOSURE_METHOD_DESCRIPTION,
    exposure_flag_threshold: EXPOSURE_FLAG_THRESHOLD,
    limitations: EXPOSURE_LIMITATIONS,
  };

  const scorecard = buildSelfRunScorecard({ run, trials, exposureProbe: verifiedExposureProbe, bank });

  // Persist scorecard.json, atomically (writeRunFile writes to a temp file
  // then renames) and idempotently: a repeat call to finish_scored_run for
  // the same run reuses the ORIGINAL finished_at rather than stamping a new
  // one every time, so the artifact on disk is stable across repeat calls.
  const existingScorecard = readRunFile(ctx.artifactRoot, runId, "scorecard.json");
  const finalScorecard =
    existingScorecard && existingScorecard.provenance && existingScorecard.provenance.finished_at
      ? { ...scorecard, provenance: { ...scorecard.provenance, finished_at: existingScorecard.provenance.finished_at } }
      : scorecard;
  writeRunFile(ctx.artifactRoot, runId, "scorecard.json", finalScorecard);

  return finalScorecard;
}
