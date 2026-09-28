/**
 * anchor-correction-validator.mjs — AC-001 / EQU-1-C.
 *
 * Validates site/src/data/model-benchmark/anchor-corrections-v1.json.
 *
 * WHY THIS FILE EXISTS RATHER THAN A ONE-LINE ANCHOR EDIT
 *   On 2026-09-28 blind agent triage found that EQU-1-C's level-5 anchor
 *   instructs raters to award the maximum score to a response stating the EEOC
 *   charge deadline is "180 days" for a Texas claimant. It is 300 — Texas is a
 *   deferral jurisdiction. The anchor is published, with its full rubric, on
 *   /ai-evaluation-suite.
 *
 *   Editing the anchor changes the instrument, which needs a founder decision.
 *   Leaving a verified, rights-forfeiting legal error in front of readers while
 *   that decision is pending is not an option either. So the instrument stays
 *   untouched and the correction is published beside it.
 *
 * THE LOAD-BEARING CHECK
 *   `quoted` must appear VERBATIM in the anchor it claims to correct. Without
 *   that, a correction silently rots the moment the anchor is reworded, and a
 *   page would render a correction for text that is no longer there — which is
 *   worse than no correction, because it looks like someone checked.
 */

const REQUIRED_STRINGS = [
  "correction_id",
  "item_id",
  "quoted",
  "error",
  "correct",
  "harmDirection",
  "verifiedBy",
  "verifiedDate",
  "repairStatus",
];

const REPAIR_STATUSES = new Set(["awaiting-founder-decision", "repaired", "withdrawn"]);

/** Normalise whitespace only — never case, never punctuation. */
const norm = (s) => String(s ?? "").replace(/\s+/g, " ").trim();

export function validateAnchorCorrections(file, bank = null) {
  const errors = [];
  const warnings = [];
  let checks = 0;
  const check = () => (checks += 1);

  if (!file || typeof file !== "object") return { valid: false, errors: ["file is not an object"], warnings, checks };
  if (!Array.isArray(file.corrections)) return { valid: false, errors: ["corrections must be an array"], warnings, checks };

  const rows = file.corrections;
  check();
  if (file.meta && file.meta.recordCount !== rows.length) {
    errors.push(`meta.recordCount is ${file.meta?.recordCount} but corrections holds ${rows.length}`);
  }

  const seen = new Set();
  rows.forEach((c, idx) => {
    const at = `corrections[${idx}]${c?.correction_id ? ` (${c.correction_id})` : ""}`;
    if (!c || typeof c !== "object") {
      errors.push(`${at}: not an object`);
      return;
    }

    check();
    for (const f of REQUIRED_STRINGS) {
      if (typeof c[f] !== "string" || !c[f].trim()) errors.push(`${at}: ${f} must be a non-empty string`);
    }
    if (seen.has(c.correction_id)) errors.push(`${at}: duplicate correction_id`);
    seen.add(c.correction_id);

    check();
    if (!Number.isInteger(c.anchor_level) || c.anchor_level < 1 || c.anchor_level > 5) {
      errors.push(`${at}: anchor_level must be an integer 1-5`);
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(c.verifiedDate))) errors.push(`${at}: verifiedDate must be an ISO date`);
    if (!REPAIR_STATUSES.has(c.repairStatus)) {
      errors.push(`${at}: repairStatus must be one of ${[...REPAIR_STATUSES].join(", ")}`);
    }

    // --- a correction is a factual claim, so it must cite a primary source ---
    check();
    if (!Array.isArray(c.sources) || c.sources.length === 0) {
      errors.push(`${at}: at least one primary source is required — a correction is a factual claim and is held to the standard we hold entities to`);
    } else {
      c.sources.forEach((s, si) => {
        if (!s || typeof s.url !== "string" || !/^https?:\/\//.test(s.url)) {
          errors.push(`${at}: sources[${si}].url must be an absolute URL`);
        }
        if (typeof s.quote !== "string" || !s.quote.trim()) {
          errors.push(`${at}: sources[${si}].quote must quote the operative sentence, not just name the page`);
        }
      });
    }

    // --- THE LOAD-BEARING CHECK: the quote must still be in the anchor ---
    if (bank && Array.isArray(bank.items)) {
      check();
      const item = bank.items.find((i) => i.id === c.item_id);
      if (!item) {
        errors.push(`${at}: item_id "${c.item_id}" is not in the task bank`);
      } else {
        const anchor = (item.anchors ?? []).find((a) => a.level === c.anchor_level);
        if (!anchor) {
          errors.push(`${at}: ${c.item_id} has no anchor at level ${c.anchor_level}`);
        } else if (!norm(anchor.description).includes(norm(c.quoted))) {
          errors.push(
            `${at}: quoted text is NOT present in ${c.item_id} anchor L${c.anchor_level}. ` +
              "Either the anchor was reworded (in which case re-verify and update or withdraw this correction) " +
              "or the quote was mistyped. A correction that does not match its target is worse than none."
          );
        }
      }
    }

    check();
    if (c.repairStatus === "awaiting-founder-decision" && !c.proposedRepair) {
      warnings.push(
        `${at}: awaiting a decision with no proposedRepair. Offer wording so the decision is a yes/no rather than a drafting task.`
      );
    }
    if (c.repairStatus === "repaired" && bank) {
      // If it is repaired, the wrong text should be GONE from the anchor.
      const item = bank.items?.find((i) => i.id === c.item_id);
      const anchor = item?.anchors?.find((a) => a.level === c.anchor_level);
      if (anchor && norm(anchor.description).includes(norm(c.quoted))) {
        errors.push(`${at}: repairStatus is "repaired" but the wrong text is still in the anchor`);
      }
    }
  });

  return { valid: errors.length === 0, errors, warnings, checks, correctionCount: rows.length };
}

/** Corrections that must be rendered next to an item, keyed by item id. */
export function correctionsByItem(file) {
  const map = new Map();
  for (const c of file?.corrections ?? []) {
    if (c?.supersededBy) continue;
    if (c?.repairStatus === "withdrawn" || c?.repairStatus === "repaired") continue;
    if (!map.has(c.item_id)) map.set(c.item_id, []);
    map.get(c.item_id).push(c);
  }
  return map;
}
