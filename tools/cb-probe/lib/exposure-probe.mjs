// lib/exposure-probe.mjs
//
// Pure logic for `run_exposure_probe` (docs/MCP_SCORED_RUN_DESIGN_2026-09-20.md
// §5). Our entire item bank is published with full five-anchor rubrics
// (exposureStatus: public-permanent on every item) and has been on the open
// web for months. Any model trained since publication may have memorised
// both the items and the answer key -- scoring without testing for that
// manufactures flattering numbers. This module implements the check
// entirely offline: it never calls a model itself. It only (a) picks which
// item ids to challenge the host model to recall from memory, and (b)
// compares a supplied recollection against the bank's own (never-sent-until-
// now) prompt text using a local, documented, deliberately crude heuristic.
//
// No network I/O. No provider SDK.

import { findItem } from "./bank.mjs";

/** Above this Jaccard token-overlap ratio, an item is flagged as likely exposed. */
export const EXPOSURE_FLAG_THRESHOLD = 0.6;

export const EXPOSURE_METHOD_DESCRIPTION =
  "Normalised token overlap (Jaccard similarity): both the item's real prompt text and the " +
  "host model's recollection are lowercased, Unicode-normalised, stripped of punctuation, split " +
  "on whitespace into a token set, and compared as |intersection| / |union|. Score ranges 0 " +
  "(no shared tokens) to 1 (identical token sets).";

export const EXPOSURE_LIMITATIONS = Object.freeze([
  "This is a screening signal, not proof of memorisation. It cannot distinguish genuine verbatim " +
    "recall from coincidental lexical overlap on generic phrasing (e.g. two unrelated caregiving " +
    "prompts might share many common words).",
  "It is fooled by paraphrase in the safe direction: a model that has genuinely memorised an item " +
    "but recalls its gist rather than its exact wording will score LOW overlap despite real exposure " +
    "-- so a low score is not proof of NO exposure either.",
  "Token overlap ignores word order and repetition (each token counts once via set membership), so " +
    "a shuffled or reordered recollection scores identically to a correctly-ordered one.",
  "Short items have fewer tokens, so a single shared distinctive word moves the ratio further than " +
    "it would on a long item -- the same raw overlap ratio means less on a 15-word prompt than a " +
    "150-word one.",
  "This check samples a handful of items per run, not the whole bank. A model may have memorised " +
    "items outside the sampled set undetected.",
]);

/** Lowercase, Unicode-normalise, strip punctuation, split into a non-empty token array. */
export function normalizeTokens(text) {
  if (typeof text !== "string") return [];
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter(Boolean);
}

/** Jaccard token-set overlap of two strings, in [0, 1]. Empty-vs-anything is 0, not undefined. */
export function tokenOverlap(a, b) {
  const setA = new Set(normalizeTokens(a));
  const setB = new Set(normalizeTokens(b));
  if (setA.size === 0 || setB.size === 0) return 0;
  let intersection = 0;
  for (const tok of setA) {
    if (setB.has(tok)) intersection += 1;
  }
  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : intersection / union;
}

/**
 * Deterministically choose which item ids to challenge the host model to
 * recall. Sorted, not random, so a run is reproducible from its item set.
 * @param {string[]} candidateItemIds - typically the run's own planned item_ids
 * @param {number} count
 */
export function pickProbeItemIds(candidateItemIds, count = 3) {
  const ids = [...new Set(candidateItemIds)].sort();
  return ids.slice(0, Math.min(count, ids.length));
}

/**
 * Score a set of recall attempts against the bank's real item text.
 * @param {object} bank - loaded task bank ({ meta, items })
 * @param {string[]} issuedIds - the probe_item_ids that were actually challenged
 * @param {Array<{item_id: string, recalled_text?: string}>} recallAttempts
 * @returns {object} the contamination result (embedded verbatim in the scorecard's `contamination` field)
 */
export function scoreRecallAttempts(bank, issuedIds, recallAttempts) {
  const byId = new Map(
    (recallAttempts ?? []).map((a) => [a && a.item_id, (a && a.recalled_text) ?? ""])
  );

  const items = issuedIds.map((itemId) => {
    const item = findItem(bank, itemId);
    const recalledText = byId.get(itemId) ?? "";
    const overlap = item ? tokenOverlap(item.prompt ?? "", recalledText) : null;
    return {
      item_id: itemId,
      overlap,
      exposure_flag: typeof overlap === "number" && overlap >= EXPOSURE_FLAG_THRESHOLD,
    };
  });

  const overlaps = items.map((i) => i.overlap).filter((o) => typeof o === "number");
  const meanOverlap = overlaps.length > 0 ? overlaps.reduce((a, b) => a + b, 0) / overlaps.length : null;
  const maxOverlap = overlaps.length > 0 ? Math.max(...overlaps) : null;

  return {
    probe_item_ids: issuedIds,
    items,
    mean_overlap: meanOverlap,
    max_overlap: maxOverlap,
    high_exposure_item_ids: items.filter((i) => i.exposure_flag).map((i) => i.item_id),
    exposure_flag_threshold: EXPOSURE_FLAG_THRESHOLD,
    method: EXPOSURE_METHOD_DESCRIPTION,
    limitations: EXPOSURE_LIMITATIONS,
  };
}
