/**
 * planner.mjs — item set -> ordered trial plan (seeded). Owns:
 *
 *  1. Item selection respecting validationStatus (Required behaviour #1).
 *  2. Expanding matched-counterfactual `variants` into per-arm trial slots
 *     (Required behaviour #3).
 *  3. Building the model-facing request payload — THE FIELD-SEPARATION
 *     ENFORCEMENT POINT. `buildModelFacingRequest()` accepts a bare
 *     `promptText: string`, not an item/task object, so it is structurally
 *     impossible to pass `sourceOnlyFields`, `reviewRequired`,
 *     `conversationState`, `anchors`, `criticalHarmRules`, or any other
 *     evaluator-facing field through this function — there is no parameter
 *     for them to travel in on. This is the code-level enforcement the
 *     brief requires ("make it structurally impossible ... rather than
 *     merely absent"), not a runtime filter that could be forgotten on one
 *     call site.
 *  4. Seeded shuffle + matched-arm separation (§2.5: "Matched counterfactual
 *     arms ... are separated in the order and never adjacent").
 *
 * Reuses, rather than reimplements:
 *  - NON_SCORABLE_VALIDATION_STATUSES from site/scripts/lib/task-bank-validator.mjs
 *    (the same list validate-task-bank.mjs and EvaluationScorer use — one
 *    definition of "not fit to score", not a second one that can drift).
 *  - createSeededRng from site/scripts/lib/evaluation-statistics.mjs (the
 *    same mulberry32 PRNG the statistics layer's bootstrap uses — one
 *    definition of "seeded random", so "seed 1" means the same sequence
 *    everywhere in this codebase).
 */

import { NON_SCORABLE_VALIDATION_STATUSES } from "../../../../site/scripts/lib/task-bank-validator.mjs";
import { createSeededRng } from "../../../../site/scripts/lib/evaluation-statistics.mjs";
import { computeItemHash } from "./evidence.mjs";

/**
 * @param {{meta?: object, items?: Array<object>}} bank
 * @param {{pool?: string}} [opts]
 * @returns {{selected: object[], excluded: {id: string, reasons: string[]}[]}}
 */
export function selectScorableItems(bank, { pool = "core-public" } = {}) {
  const items = Array.isArray(bank?.items) ? bank.items : [];
  const selected = [];
  const excluded = [];
  for (const it of items) {
    const reasons = [];
    if (it.pool !== pool) reasons.push(`pool "${it.pool}" is not the requested pool "${pool}"`);
    if (NON_SCORABLE_VALIDATION_STATUSES.includes(it.validationStatus)) {
      reasons.push(`validationStatus "${it.validationStatus}" is non-scorable`);
    }
    if (reasons.length > 0) excluded.push({ id: it.id, reasons });
    else selected.push(it);
  }
  return { selected, excluded };
}

/**
 * Expands one item into its model-facing arms. An item without `variants`
 * has exactly one arm (variantId: null). An item WITH `variants` produces
 * one arm per variant — "an item with variants runs every arm" (Required
 * behaviour #3) starts here: every arm this function returns must appear
 * in the plan, or the item is incomplete (see core/run-record.mjs).
 *
 * Deliberately reads ONLY `.prompt` / `.variants[].prompt` off the item —
 * per tasks-v1.json's own `meta.fieldSeparationPolicy`, these are the only
 * two fields ("prompt", "variants[].prompt") ever permitted to reach a
 * model. Every other property on `item` is simply never referenced here.
 */
export function itemArms(item) {
  if (Array.isArray(item.variants) && item.variants.length > 0) {
    return item.variants.map((v) => ({ variantId: v.variantId, promptText: v.prompt }));
  }
  return [{ variantId: null, promptText: item.prompt }];
}

/**
 * THE FIELD-SEPARATION ENFORCEMENT POINT. This is the only function in the
 * harness that constructs the `messages` array ultimately sent to
 * ProviderAdapter#execute(). Its parameter list is an explicit allowlist —
 * `promptText` must literally be a string, so a caller cannot pass an
 * item/task object "by accident"; there is no code path from an object
 * with `sourceOnlyFields`/`reviewRequired`/`conversationState`/`anchors` to
 * this function's return value.
 */
export function buildModelFacingRequest({ runId, itemId, itemHash, itemVersion, variantId, promptText, sampling, timeoutMs, trialIndex, attempt }) {
  if (typeof promptText !== "string" || promptText.length === 0) {
    throw new TypeError(
      "buildModelFacingRequest: promptText must be a non-empty string. This function accepts no other content " +
        "field — that is deliberate: it makes it structurally impossible to pass an item/task object (and thereby " +
        "sourceOnlyFields, reviewRequired, conversationState, anchors, etc.) through to a model call."
    );
  }
  return Object.freeze({
    trialId: `${runId}:${itemId}:${variantId ?? "-"}:${trialIndex}:${attempt}`,
    runId,
    itemId,
    itemHash,
    itemVersion,
    variantId: variantId ?? null,
    messages: Object.freeze([Object.freeze({ role: "user", content: promptText })]),
    sampling: Object.freeze({ ...sampling }),
    timeoutMs,
    trialIndex,
    attempt,
  });
}

function shuffle(arr, rng) {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Best-effort separation pass: if two adjacent slots belong to the same
 * item but different variants (a matched counterfactual pair), swap the
 * later one forward past the next slot that would not itself create a new
 * same-item adjacency. Deterministic given the input order.
 */
export function separateMatchedArms(order) {
  const out = order.slice();
  for (let i = 1; i < out.length; i++) {
    if (out[i].itemId === out[i - 1].itemId && out[i].variantId !== out[i - 1].variantId) {
      let swapWith = -1;
      for (let j = i + 1; j < out.length; j++) {
        const wouldCollideWithPrev = out[j].itemId === out[i - 1].itemId;
        const wouldCollideWithNext = j + 1 < out.length ? out[j].itemId === out[j + 1].itemId && out[j].variantId !== out[j + 1].variantId : false;
        if (!wouldCollideWithPrev && !wouldCollideWithNext) {
          swapWith = j;
          break;
        }
      }
      if (swapWith !== -1) {
        [out[i], out[swapWith]] = [out[swapWith], out[i]];
      }
    }
  }
  return out;
}

/**
 * Builds the full seeded trial plan for a run.
 *
 * @param {object} args
 * @param {object} args.bank task bank ({ meta, items })
 * @param {string} args.itemVersion recorded per-item hash input; tasks-v1.json
 *   has no per-item version field today, so this defaults to the bank's
 *   own `meta.bankVersion` — flagged in the Phase A report as an
 *   interpretation, not invented data.
 * @param {string} args.runId
 * @param {number} args.trialsPerItem T, floor >=3 per 04-MODEL-EVALUATION-RUN
 * @param {number} args.seed
 * @param {object} args.sampling SamplingConfig
 * @param {number} args.timeoutMs
 * @param {string} [args.pool]
 */
export function buildTrialPlan({ bank, itemVersion, runId, trialsPerItem, seed, sampling, timeoutMs, pool = "core-public" }) {
  const { selected, excluded } = selectScorableItems(bank, { pool });
  const rng = createSeededRng(seed);

  const itemMeta = [];
  const slots = [];
  for (const item of selected) {
    const hash = computeItemHash({ id: item.id, itemVersion, prompt: item.prompt, anchors: item.anchors });
    const arms = itemArms(item);
    itemMeta.push({
      itemId: item.id,
      dimension: item.dimension,
      itemHash: hash,
      itemVersion,
      variantIds: arms.map((a) => a.variantId),
      // §7.1: "subdimensionId — Reserved as a nullable field, and it must
      // stay null." Emitted (not omitted) so a downstream reader sees it
      // was deliberately reserved rather than forgotten — but ALWAYS null,
      // never populated from item.indicator or anything else. Emitting a
      // real subdimension claim here would silently pick a winner in the
      // unresolved 40-subdimension taxonomy fork (CONFLICT-05), which
      // HUMAN-AUTHORITY-BOUNDARY.md reserves to the owner, not to this harness.
      subdimensionId: null,
    });
    for (const arm of arms) {
      for (let trialIndex = 0; trialIndex < trialsPerItem; trialIndex++) {
        slots.push({
          runId,
          itemId: item.id,
          dimension: item.dimension,
          itemHash: hash,
          itemVersion,
          variantId: arm.variantId,
          promptText: arm.promptText,
          sampling,
          timeoutMs,
          trialIndex,
        });
      }
    }
  }

  const shuffled = shuffle(slots, rng);
  const plan = separateMatchedArms(shuffled);

  return {
    plan,
    itemMeta,
    excludedItems: excluded,
    scorableItemCount: selected.length,
  };
}
