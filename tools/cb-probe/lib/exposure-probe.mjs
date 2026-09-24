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

import { createHash } from "node:crypto";
import { findItem } from "./bank.mjs";

/** Above this Jaccard token-overlap ratio, an item is flagged as likely exposed. */
export const EXPOSURE_FLAG_THRESHOLD = 0.6;

/**
 * Minimum normalised token count a recall_attempts[].recalled_text must
 * have to count as a genuine attempt. Below this floor, empty strings,
 * whitespace, punctuation-only text, and single-stopword replies (verified:
 * all score tokenOverlap 0, indistinguishable from an honest "I don't
 * remember" answer) were silently accepted and scored as a clean result --
 * see docs/reviews/CB_PROBE_SILENT_FAILURES_2026-09-24.md finding #1. A
 * genuine honest non-recall ("I have no memory of this item's exact
 * wording.") comfortably clears this floor; only a trivial or absent answer
 * does not.
 */
export const MIN_RECALL_TOKENS = 3;

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
  `A blank, whitespace-only, or single-word recalled_text is refused (see MIN_RECALL_TOKENS = ` +
    `${MIN_RECALL_TOKENS}), which blocks the trivially-gameable case of a non-answer scoring as a ` +
    "clean result. It does not, and cannot, verify the recall was made in good faith -- a subject " +
    "that wants a clean result can still submit substantive but deliberately unrelated filler text; " +
    "a low overlap score is evidence the recollection didn't match, not proof no exposure occurred.",
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
 * A small, seeded, deterministic PRNG (mulberry32) so item selection can be
 * reproducible from a seed without being the same every time. No runtime
 * dependency -- a few lines is simpler and more auditable than a package.
 */
function mulberry32(seed) {
  let state = seed >>> 0 || 1;
  return function next() {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle(items, seedString) {
  const digest = createHash("sha256").update(seedString).digest();
  const rand = mulberry32(digest.readUInt32BE(0));
  const arr = items.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Choose which item ids to challenge the host model to recall.
 *
 * Without a seed: sorted (deterministic, but always the same
 * alphabetically-first `count` ids for a given item set -- this was the
 * previous, gameable behaviour: a known, identical probed set across every
 * third-party run of the same dimension subset, see
 * docs/reviews/CB_PROBE_SECURITY_2026-09-24.md SEC-05).
 *
 * With a seed (in practice, the run_id): deterministically shuffled from
 * that seed before picking, so the probed set varies per run while staying
 * reproducible from the run's own id -- rerunning against the same run_id
 * reissues the same challenge (idempotent, matches the phase-1 re-issue
 * behaviour in scored-run.mjs), but two different runs over the same item
 * set very likely probe different ids.
 *
 * @param {string[]} candidateItemIds - typically the run's own planned item_ids
 * @param {number} count
 * @param {string} [seed] - typically the run_id
 */
export function pickProbeItemIds(candidateItemIds, count = 3, seed = "") {
  const ids = [...new Set(candidateItemIds)].sort();
  if (!seed) {
    return ids.slice(0, Math.min(count, ids.length));
  }
  const shuffled = seededShuffle(ids, seed);
  return shuffled.slice(0, Math.min(count, shuffled.length)).sort();
}

/**
 * Reject a blank, whitespace-only, punctuation-only, or single-stopword
 * recalled_text -- these all score tokenOverlap 0, identical to an honest
 * non-recall, and were previously accepted as a completed, clean probe with
 * no way for a reader to tell the difference. Does NOT check the recall for
 * accuracy (an honest "I don't remember" is fine and expected) -- only that
 * a genuine attempt was made.
 * @param {unknown} recalledText
 * @param {string} itemId - for the error message only
 * @throws {Error} if recalledText is not a substantive attempt
 */
export function assertSubstantiveRecall(recalledText, itemId) {
  const tokenCount = normalizeTokens(typeof recalledText === "string" ? recalledText : "").length;
  if (tokenCount < MIN_RECALL_TOKENS) {
    throw new Error(
      `recall_attempts entry for "${itemId}" is not a substantive attempt (${tokenCount} normalised ` +
        `token(s) after stripping punctuation; needs at least ${MIN_RECALL_TOKENS}). A blank, ` +
        'whitespace-only, or single-word reply is refused -- an honest "I do not recall this item\'s ' +
        'exact wording" is accepted and expected if you truly have no memory of it.'
    );
  }
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
      // Persisted verbatim so the probe is auditable: a reader can tell a
      // genuine recall attempt from a non-answer, rather than trusting an
      // aggregate overlap number with no underlying text to check it
      // against (docs/reviews/CB_PROBE_SECURITY_2026-09-24.md SEC-05).
      recalled_text: recalledText,
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
