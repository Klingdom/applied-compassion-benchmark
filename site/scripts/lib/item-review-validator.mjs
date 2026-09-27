/**
 * item-review-validator.mjs — MB-2a.
 *
 * Validates site/src/data/model-benchmark/item-reviews-v1.json, the append-only
 * record of every human review of every task-bank item.
 *
 * WHY IT EXISTS BEFORE THE FIRST REVIEW
 *   Same reasoning as the score history: a log created after the thing it logs
 *   has already lost the first ones. 0 of 93 items have been reviewed, which is
 *   exactly the right moment to make losing a review structurally impossible.
 *
 * THE LOAD-BEARING DESIGN DECISION
 *   An item's validation status is DERIVED from its reviews, never stored
 *   beside them. `deriveItemStatus` is the only way to ask whether an item is
 *   validated, so a status and the evidence for it cannot disagree — the same
 *   reason the score history has no "current score" field.
 *
 * TWO REVIEWERS, AND DISAGREEMENT IS DATA
 *   One review never validates an item. Where two reviewers differ, both
 *   records stand and the item is `disputed`. An item that two careful people
 *   read differently is a fact about the item, and averaging it away would
 *   destroy the only signal that the anchors are ambiguous.
 */

export const CRITERIA = Object.freeze([
  "applicable",
  "discriminating",
  "monotonic",
  "on_construct",
  "safe_and_accurate",
]);

const VERDICTS = new Set(["validated", "needs-revision"]);
const REQUIRED_STRINGS = ["review_id", "item_id", "reviewer_id", "reviewed_at", "verdict"];

/** Stable serialisation for detecting mutation of an existing record. */
export function reviewFingerprint(r) {
  return JSON.stringify(r, Object.keys(r).sort());
}

/**
 * @param {object} file parsed item-reviews file
 * @param {object} [bank] parsed task bank, for foreign-key checking
 */
export function validateItemReviews(file, bank = null) {
  const errors = [];
  const warnings = [];
  let checks = 0;
  const check = () => (checks += 1);

  if (!file || typeof file !== "object") return { valid: false, errors: ["file is not an object"], warnings, checks };
  if (!Array.isArray(file.reviews)) return { valid: false, errors: ["reviews must be an array"], warnings, checks };

  const reviews = file.reviews;
  check();
  if (file.meta && file.meta.recordCount !== reviews.length) {
    errors.push(`meta.recordCount is ${file.meta?.recordCount} but reviews holds ${reviews.length}`);
  }

  const bankIds = bank && Array.isArray(bank.items) ? new Set(bank.items.map((i) => i.id)) : null;
  const seen = new Set();

  reviews.forEach((r, idx) => {
    const at = `reviews[${idx}]${r?.review_id ? ` (${r.review_id})` : ""}`;
    if (!r || typeof r !== "object") {
      errors.push(`${at}: not an object`);
      return;
    }

    check();
    for (const f of REQUIRED_STRINGS) {
      if (typeof r[f] !== "string" || !r[f]) errors.push(`${at}: ${f} must be a non-empty string`);
    }
    if (seen.has(r.review_id)) errors.push(`${at}: duplicate review_id`);
    seen.add(r.review_id);

    check();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(r.reviewed_at))) errors.push(`${at}: reviewed_at must be an ISO date`);
    if (!VERDICTS.has(r.verdict)) errors.push(`${at}: verdict must be one of ${[...VERDICTS].join(", ")}`);

    check();
    if (bankIds && !bankIds.has(r.item_id)) errors.push(`${at}: item_id "${r.item_id}" is not in the task bank`);

    // --- all five criteria, explicitly, every time ---
    check();
    const c = r.criteria;
    if (!c || typeof c !== "object" || Array.isArray(c)) {
      errors.push(`${at}: criteria must be an object carrying all ${CRITERIA.length} criteria`);
    } else {
      for (const k of CRITERIA) {
        if (typeof c[k] !== "boolean") {
          errors.push(`${at}: criteria.${k} must be a boolean — a reviewer must answer every criterion, not skip one`);
        }
      }
      for (const k of Object.keys(c)) {
        if (!CRITERIA.includes(k)) errors.push(`${at}: unknown criterion "${k}"`);
      }

      // --- the verdict must follow from the criteria, not float free ---
      const anyFailed = CRITERIA.some((k) => c[k] === false);
      check();
      if (anyFailed && r.verdict === "validated") {
        const failing = CRITERIA.filter((k) => c[k] === false);
        errors.push(`${at}: verdict "validated" contradicts failing criteria (${failing.join(", ")})`);
      }
      if (!anyFailed && r.verdict === "needs-revision" && !r.concern) {
        errors.push(`${at}: verdict "needs-revision" with all criteria passing requires a concern explaining why`);
      }
    }

    check();
    if (r.verdict === "needs-revision" && (typeof r.concern !== "string" || !r.concern.trim())) {
      errors.push(`${at}: needs-revision requires a concern in the reviewer's own words`);
    }
    if (typeof r.blind !== "boolean") errors.push(`${at}: blind must be a boolean`);

    check();
    if (typeof r.minutes_spent === "number" && r.minutes_spent < 2) {
      warnings.push(`${at}: recorded ${r.minutes_spent} minutes. The protocol estimates 10-15 for a real review.`);
    }
  });

  // --- supersedes must be by the same reviewer, for the same item ---
  for (const r of reviews) {
    if (!r?.supersedes) continue;
    check();
    const t = reviews.find((x) => x?.review_id === r.supersedes);
    if (!t) errors.push(`${r.review_id}: supersedes "${r.supersedes}" names no review here — a superseded review is retained, never deleted`);
    else {
      if (t.reviewer_id !== r.reviewer_id) errors.push(`${r.review_id}: supersedes another reviewer's record`);
      if (t.item_id !== r.item_id) errors.push(`${r.review_id}: supersedes a review of a different item`);
    }
  }

  return { valid: errors.length === 0, errors, warnings, checks, reviewCount: reviews.length };
}

/** Append-only guarantee, checked against the committed file. */
export function validateReviewsAgainstPrevious(previous, next) {
  const errors = [];
  const before = Array.isArray(previous?.reviews) ? previous.reviews : [];
  const after = new Map((Array.isArray(next?.reviews) ? next.reviews : []).map((r) => [r?.review_id, r]));
  for (const b of before) {
    const a = after.get(b.review_id);
    if (!a) errors.push(`review "${b.review_id}" was REMOVED. Reviews are append-only; file a new review instead.`);
    else if (reviewFingerprint(b) !== reviewFingerprint(a)) {
      errors.push(`review "${b.review_id}" was EDITED. File a new review whose supersedes names this one.`);
    }
  }
  return { valid: errors.length === 0, errors };
}

/**
 * An item's status, DERIVED from its reviews. Never stored.
 *
 * @returns {"unvalidated"|"validated"|"needs-revision"|"disputed"|"single-review"}
 */
export function deriveItemStatus(reviews, itemId) {
  const all = reviews.filter((r) => r?.item_id === itemId);
  const superseded = new Set(all.map((r) => r.supersedes).filter(Boolean));
  const live = all.filter((r) => !superseded.has(r.review_id));

  // One live review per reviewer: the newest.
  const byReviewer = new Map();
  for (const r of live) {
    const held = byReviewer.get(r.reviewer_id);
    if (!held || String(r.reviewed_at) > String(held.reviewed_at)) byReviewer.set(r.reviewer_id, r);
  }
  const verdicts = [...byReviewer.values()];

  if (verdicts.length === 0) return "unvalidated";
  if (verdicts.length === 1) return "single-review";
  const unique = new Set(verdicts.map((v) => v.verdict));
  if (unique.size > 1) return "disputed";
  return verdicts[0].verdict;
}

/**
 * Inter-rater agreement across the bank — the headline number for whether the
 * ANCHORS are clear, not whether the reviewers are good.
 */
export function computeAgreement(reviews) {
  const byItem = new Map();
  for (const r of reviews) {
    if (!r?.item_id) continue;
    if (!byItem.has(r.item_id)) byItem.set(r.item_id, []);
    byItem.get(r.item_id).push(r);
  }
  let doubleReviewed = 0;
  let agreed = 0;
  for (const itemId of byItem.keys()) {
    const status = deriveItemStatus(reviews, itemId);
    if (status === "unvalidated" || status === "single-review") continue;
    doubleReviewed += 1;
    if (status !== "disputed") agreed += 1;
  }
  return {
    doubleReviewed,
    agreed,
    disputed: doubleReviewed - agreed,
    agreementRate: doubleReviewed > 0 ? agreed / doubleReviewed : null,
  };
}
