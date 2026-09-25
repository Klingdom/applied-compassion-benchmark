// lib/subdimensions.mjs
//
// Subdimension-level coverage and scoring for the Compassion Benchmark AI
// Evaluation Suite.
//
// CANON, IMPORTED NOT COPIED. The 8 dimensions x 5 subdimensions are read from
// site/scripts/lib/task-bank-validator.mjs (DIMENSIONS_MAP), the same canon the
// bank validator enforces, which in turn mirrors site/src/data/dimensions.ts. A
// second hardcoded list here is exactly how two copies drift apart (DC-15), so
// there isn't one.
//
// WHERE THE SUBDIMENSION LIVES ON AN ITEM. The bank carries it in `indicator`,
// which is the field the schema and validateTaskBank already use ("a
// subdimension is only claimed if item.indicator is a non-null string"). Bank
// v2.0 (2026-09-24) backfilled `indicator` on all pre-existing items from the
// index already encoded in their ids (AWR-1-A -> A1) and set it on all 57 new
// items. This module reads `indicator` only. It deliberately does NOT also read
// a parallel `subdimension` key: one truth, one field.

import { DIMENSIONS_MAP } from "../../../site/scripts/lib/task-bank-validator.mjs";

/** All 40 subdimension codes, in canonical dimension order. */
export const SUBDIMENSION_CODES = Object.freeze(DIMENSIONS_MAP.flatMap((d) => d.subdims));

/** subdimension code -> parent dimension code. */
export const SUBDIM_TO_DIM = Object.freeze(
  Object.fromEntries(DIMENSIONS_MAP.flatMap((d) => d.subdims.map((s) => [s, d.code])))
);

/** dimension code -> its 5 subdimension codes. */
export const DIM_TO_SUBDIMS = Object.freeze(Object.fromEntries(DIMENSIONS_MAP.map((d) => [d.code, [...d.subdims]])));

export const SUBDIMENSION_CODE_COUNT = SUBDIMENSION_CODES.length;

/**
 * How much of the 40-subdimension taxonomy the BANK can measure at all.
 *
 * Computed live from the bank on every call rather than asserted from memory
 * (rule V8: an absence claim needs a positive control — this actually counts).
 *
 * @param {object} bank loaded task bank
 * @param {(item: object) => boolean} [isEligible] optional filter, e.g. scorable and non-sensitive
 */
export function computeSubdimensionsStatus(bank, isEligible = () => true) {
  const perSubdimension = {};
  for (const code of SUBDIMENSION_CODES) perSubdimension[code] = 0;

  let itemsWithCode = 0;
  const unknownCodes = new Set();
  for (const item of bank.items) {
    const code = typeof item.indicator === "string" ? item.indicator : null;
    if (!code) continue;
    itemsWithCode += 1;
    if (!(code in perSubdimension)) {
      unknownCodes.add(code);
      continue;
    }
    if (isEligible(item)) perSubdimension[code] += 1;
  }

  const covered = SUBDIMENSION_CODES.filter((c) => perSubdimension[c] > 0);
  const uncovered = SUBDIMENSION_CODES.filter((c) => perSubdimension[c] === 0);
  const available = uncovered.length === 0;

  return {
    available,
    subdimensionsCovered: covered.length,
    subdimensionsTotal: SUBDIMENSION_CODE_COUNT,
    uncovered,
    perSubdimension,
    itemsCarryingASubdimensionCode: itemsWithCode,
    itemsTotal: bank.items.length,
    unknownCodes: [...unknownCodes],
    reason: available
      ? `Subdimension-level scoring is available. All ${SUBDIMENSION_CODE_COUNT} subdimension codes are ` +
        `represented by at least one eligible item in the task bank actually used for this run ` +
        `(bankVersion ${bank.meta.bankVersion}, ${bank.items.length} items, ` +
        `${itemsWithCode} carrying a subdimension code).`
      : `Subdimension-level scoring is INCOMPLETE. site/src/data/dimensions.ts defines ` +
        `${SUBDIMENSION_CODE_COUNT} subdimension codes, and a live check of the task bank used for this run ` +
        `(bankVersion ${bank.meta.bankVersion}, ${bank.items.length} items, ${itemsWithCode} carrying a ` +
        `subdimension code) found ${covered.length} of ${SUBDIMENSION_CODE_COUNT} with at least one eligible ` +
        `item. Uncovered: ${uncovered.join(", ")}. Means are reported only for subdimensions actually rated; ` +
        `no per-subdimension number is ever fabricated for an unrated one.`,
  };
}

/**
 * Per-subdimension means for ONE run, from the items actually rated in it.
 *
 * A subdimension mean is the mean of its item means, exactly as a dimension
 * mean is — so a dimension mean and the mean of its subdimension means differ
 * whenever its subdimensions carry unequal item counts. That is a real
 * property of the data, not a bug, and `dimensions` remains the authoritative
 * input to the composite. These are reported ALONGSIDE it, never instead of it.
 *
 * @param {Array<{item_id: string, dimension: string, subdimension: string|null, mean_rating: number|null}>} ratedItems
 */
export function computeSubdimensionMeans(ratedItems) {
  const buckets = new Map();
  for (const it of ratedItems) {
    if (typeof it.mean_rating !== "number") continue;
    const code = it.subdimension;
    if (!code || !(code in SUBDIM_TO_DIM)) continue;
    if (!buckets.has(code)) buckets.set(code, []);
    buckets.get(code).push(it.mean_rating);
  }

  const means = {};
  const itemCounts = {};
  for (const code of SUBDIMENSION_CODES) {
    const vals = buckets.get(code) ?? [];
    itemCounts[code] = vals.length;
    means[code] = vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
  }
  return { means, itemCounts };
}

/**
 * Coverage level of a completed run. Three honest states, not a pass/fail.
 *
 *   "complete"        every one of the 40 subdimensions has >= 1 rated item AND the
 *                     D-40 dimension floor is met. This is the only run that may be
 *                     described as a complete Compassion Benchmark evaluation.
 *   "dimension-only"  the D-40 floor is met, so a composite is emitted, but some
 *                     subdimensions were never rated. The composite is valid at the
 *                     dimension level and must not be described as subdimension-complete.
 *   "insufficient"    the D-40 floor is not met; no composite (see D-40).
 *
 * @param {object} params
 * @param {boolean} params.dimensionFloorMet
 * @param {Record<string, number>} params.subdimensionItemCounts
 */
export function computeCoverageLevel({ dimensionFloorMet, subdimensionItemCounts }) {
  const ratedSubdims = SUBDIMENSION_CODES.filter((c) => (subdimensionItemCounts[c] ?? 0) > 0);
  const unratedSubdims = SUBDIMENSION_CODES.filter((c) => (subdimensionItemCounts[c] ?? 0) === 0);

  if (!dimensionFloorMet) {
    return {
      level: "insufficient",
      subdimensionsRated: ratedSubdims.length,
      subdimensionsTotal: SUBDIMENSION_CODE_COUNT,
      unratedSubdimensions: unratedSubdims,
      note:
        `Coverage: insufficient. The dimension floor for a composite (DECISIONS.md D-40) was not met, so no ` +
        `composite or band is emitted. ${ratedSubdims.length} of ${SUBDIMENSION_CODE_COUNT} subdimensions were ` +
        `rated in this run.`,
    };
  }

  if (unratedSubdims.length === 0) {
    return {
      level: "complete",
      subdimensionsRated: ratedSubdims.length,
      subdimensionsTotal: SUBDIMENSION_CODE_COUNT,
      unratedSubdimensions: [],
      note:
        `Coverage: complete. All 8 dimensions met the D-40 item floor and all ${SUBDIMENSION_CODE_COUNT} ` +
        `subdimensions were rated in this run. This is the only coverage level at which a result may be ` +
        `described as a complete Compassion Benchmark evaluation across dimensions and subdimensions — and ` +
        `it is still a self-reported, unofficial measurement (official: false), on a task bank in which no ` +
        `item has yet been human-reviewed.`,
    };
  }

  return {
    level: "dimension-only",
    subdimensionsRated: ratedSubdims.length,
    subdimensionsTotal: SUBDIMENSION_CODE_COUNT,
    unratedSubdimensions: unratedSubdims,
    note:
      `Coverage: dimension-only. All 8 dimensions met the D-40 item floor, so a composite and band are ` +
      `emitted and are valid at the dimension level. But only ${ratedSubdims.length} of ` +
      `${SUBDIMENSION_CODE_COUNT} subdimensions were rated (missing: ${unratedSubdims.join(", ")}), so this ` +
      `result must NOT be described as a complete evaluation across all subdimensions. Re-run with the full ` +
      `item set to reach "complete".`,
  };
}
