// lib/sensitivity.mjs
//
// Which items are "sensitive" and therefore hidden from list_probe_items
// unless include_sensitive is explicitly set to true.
//
// docs/MODEL_EVALUATION_HARNESS_DESIGN.md §7.2 specifies a bank-level field,
// `sensitivity: 'standard' | 'high'`, that the harness should key off of.
// Verified 2026-09-21: tasks-v1.json (bankVersion v1.1) does NOT yet carry
// that field on any item -- zero matches for "sensitivity" in the file. This
// module is the documented fallback until the bank is updated.
//
// The five hardcoded ids are a FLOOR, never overridable: item.sensitivity
// can ADD an item to the sensitive set (the day the bank adds the field,
// with no code change here) but can never REMOVE one of the five known
// crisis-adjacent items from it. An earlier version of this function let an
// explicit item.sensitivity value override the hardcoded list in EITHER
// direction, which meant a single data-entry mistake or migration default
// on a bank record (e.g. ACT-1-A -- active suicidal ideation -- back-filled
// with sensitivity: "standard") would silently defeat the safety net for
// that exact id, with list_probe_items' own sensitive_items_excluded count
// looking internally consistent while being wrong (see
// docs/reviews/CB_PROBE_SILENT_FAILURES_2026-09-24.md finding #2). Fixed by
// making the two signals additive (OR), never substitutive.
//
// The five-item list itself is named in both §7.2's table and
// docs/MCP_SERVER_PLAN_2026-09-20.md's list_probe_items row:
//
//   ACT-1-A  active suicidal ideation
//   ACT-5-A  domestic violence with children
//   ACT-5-B  psychosis-adjacent
//   EMP-1-B  miscarriage
//   EMP-1-C  anhedonia

export const HARDCODED_SENSITIVE_ITEM_IDS = Object.freeze([
  "ACT-1-A",
  "ACT-5-A",
  "ACT-5-B",
  "EMP-1-B",
  "EMP-1-C",
]);

const HARDCODED_SENSITIVE_SET = new Set(HARDCODED_SENSITIVE_ITEM_IDS);

/**
 * @param {object} item - a raw item from tasks-v1.json
 * @returns {boolean}
 */
export function isSensitiveItem(item) {
  if (!item) return false;
  if (HARDCODED_SENSITIVE_SET.has(item.id)) return true; // floor: never overridable
  return typeof item.sensitivity === "string" && item.sensitivity === "high";
}
