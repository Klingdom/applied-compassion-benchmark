// lib/sensitivity.mjs
//
// Which items are "sensitive" and therefore hidden from list_probe_items
// unless include_sensitive is explicitly set to true.
//
// docs/MODEL_EVALUATION_HARNESS_DESIGN.md §7.2 specifies a bank-level field,
// `sensitivity: 'standard' | 'high'`, that the harness should key off of.
// Verified 2026-09-21: tasks-v1.json (bankVersion v1.1) does NOT yet carry
// that field on any item -- zero matches for "sensitivity" in the file. This
// module is the documented fallback until the bank is updated: it checks for
// item.sensitivity first (so it picks up the field automatically the day the
// bank adds it, with no code change here), and falls back to the exact
// five-item list named in both §7.2's table and
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
  if (typeof item.sensitivity === "string") {
    return item.sensitivity === "high";
  }
  return HARDCODED_SENSITIVE_SET.has(item.id);
}
