#!/usr/bin/env node
/**
 * test-item-reviews.mjs — MB-2a.
 *
 * Pins the guarantees of the human-review log before a single review exists:
 * append-only, two reviewers, disagreement preserved rather than averaged away,
 * and a verdict that cannot contradict the criteria it rests on.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  validateItemReviews,
  validateReviewsAgainstPrevious,
  deriveItemStatus,
  computeAgreement,
  CRITERIA,
} from "./lib/item-review-validator.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FILE = join(__dirname, "..", "src", "data", "model-benchmark", "item-reviews-v1.json");
const BANK = join(__dirname, "..", "src", "data", "model-benchmark", "tasks-v1.json");

let passed = 0;
let failed = 0;
const assert = (label, cond, detail = "") => {
  if (cond) {
    passed += 1;
    console.log(`  PASS  ${label}`);
  } else {
    failed += 1;
    console.log(`  FAIL  ${label}${detail ? ` — ${detail}` : ""}`);
  }
};

const real = JSON.parse(readFileSync(FILE, "utf8"));
const bank = JSON.parse(readFileSync(BANK, "utf8"));
const realItem = bank.items[0].id;

const allPass = Object.fromEntries(CRITERIA.map((c) => [c, true]));
function review(o = {}) {
  return {
    review_id: "r1",
    item_id: realItem,
    reviewer_id: "alice",
    reviewed_at: "2026-10-01",
    criteria: { ...allPass },
    verdict: "validated",
    concern: null,
    minutes_spent: 12,
    blind: true,
    supersedes: null,
    ...o,
  };
}
const wrap = (reviews) => ({ meta: { recordCount: reviews.length }, reviews });

console.log("\nTest 1: the real file is valid, empty, and honest about it");
{
  const r = validateItemReviews(real, bank);
  assert("real review log validates", r.valid, r.errors.join(" | "));
  assert("it is empty — no item has been reviewed", real.reviews.length === 0);
  assert("meta.recordCount agrees", real.meta.recordCount === 0);
  assert("it forbids agent-authored reviews in its own invariants", JSON.stringify(real.meta.invariants).includes("agent may never author"));
  assert("it states that validation is not a licence to publish a score", JSON.stringify(real.meta.invariants).toLowerCase().includes("not a licence"));
}

console.log("\nTest 2: APPEND-ONLY");
{
  const before = wrap([review()]);
  assert("deleting a review fails", !validateReviewsAgainstPrevious(before, wrap([])).valid);
  assert("editing a review fails", !validateReviewsAgainstPrevious(before, wrap([review({ verdict: "needs-revision", concern: "x" })])).valid);
  assert("appending is allowed", validateReviewsAgainstPrevious(before, wrap([review(), review({ review_id: "r2", reviewer_id: "bob" })])).valid);
  const corrected = wrap([review(), review({ review_id: "r2", reviewed_at: "2026-10-05", supersedes: "r1" })]);
  assert("a reviewer revising their own verdict keeps the original", validateReviewsAgainstPrevious(before, corrected).valid);
  assert("...and that file is itself valid", validateItemReviews(corrected).valid);
}

console.log("\nTest 3: one reviewer never validates an item");
{
  const one = [review()];
  assert("a single review leaves the item at single-review", deriveItemStatus(one, realItem) === "single-review", deriveItemStatus(one, realItem));

  const two = [review(), review({ review_id: "r2", reviewer_id: "bob" })];
  assert("two agreeing reviewers validate it", deriveItemStatus(two, realItem) === "validated");

  assert("an unreviewed item is unvalidated", deriveItemStatus(two, bank.items[1].id) === "unvalidated");
}

console.log("\nTest 4: DISAGREEMENT IS PRESERVED, not averaged away");
{
  const split = [
    review(),
    review({ review_id: "r2", reviewer_id: "bob", verdict: "needs-revision", concern: "anchors 3 and 4 collapse", criteria: { ...allPass, monotonic: false } }),
  ];
  assert("two disagreeing reviewers mark the item disputed", deriveItemStatus(split, realItem) === "disputed");
  assert("both records remain in the file", split.length === 2);
  assert("the disputed file is valid — disagreement is data, not an error", validateItemReviews(wrap(split)).valid);

  const agr = computeAgreement(split);
  assert("agreement rate reflects the dispute", agr.doubleReviewed === 1 && agr.disputed === 1 && agr.agreementRate === 0);
}

console.log("\nTest 5: a verdict cannot contradict its own criteria");
{
  const lying = review({ criteria: { ...allPass, applicable: false }, verdict: "validated" });
  const r = validateItemReviews(wrap([lying]));
  assert("validated with a failing criterion is rejected", !r.valid && r.errors.some((e) => e.includes("contradicts failing criteria")));
  assert("the rejection names the failing criterion", r.errors.some((e) => e.includes("applicable")));

  const noConcern = review({ verdict: "needs-revision", concern: null });
  assert("needs-revision with no concern is rejected", !validateItemReviews(wrap([noConcern])).valid);
}

console.log("\nTest 6: every criterion must be answered, none skipped");
{
  for (const skip of CRITERIA) {
    const c = { ...allPass };
    delete c[skip];
    const r = validateItemReviews(wrap([review({ criteria: c })]));
    assert(`omitting "${skip}" is rejected`, !r.valid && r.errors.some((e) => e.includes(skip)));
  }
  const extra = validateItemReviews(wrap([review({ criteria: { ...allPass, vibes: true } })]));
  assert("an invented criterion is rejected", !extra.valid);
}

console.log("\nTest 7: reviews must attach to real items, and suspiciously fast ones are flagged");
{
  const orphan = validateItemReviews(wrap([review({ item_id: "NOT-REAL" })]), bank);
  assert("a review of an item not in the bank is rejected", !orphan.valid);

  const fast = validateItemReviews(wrap([review({ minutes_spent: 1 })]));
  assert("a one-minute review passes but is warned about", fast.valid && fast.warnings.length > 0);
}

console.log("\nTest 8: supersedes is constrained to the same reviewer and item");
{
  const crossReviewer = wrap([review(), review({ review_id: "r2", reviewer_id: "bob", supersedes: "r1" })]);
  assert("superseding another reviewer's record is rejected", !validateItemReviews(crossReviewer).valid);

  const crossItem = wrap([review(), review({ review_id: "r2", item_id: bank.items[1].id, supersedes: "r1" })]);
  assert("superseding a review of a different item is rejected", !validateItemReviews(crossItem).valid);

  const dangling = wrap([review({ review_id: "r9", supersedes: "nope" })]);
  assert("superseding a missing review is rejected", !validateItemReviews(dangling).valid);
}

console.log("\nTest 9: agreement is computed across items, not asserted");
{
  const i1 = bank.items[0].id;
  const i2 = bank.items[1].id;
  const rs = [
    review({ review_id: "a1", item_id: i1, reviewer_id: "alice" }),
    review({ review_id: "b1", item_id: i1, reviewer_id: "bob" }),
    review({ review_id: "a2", item_id: i2, reviewer_id: "alice" }),
    review({ review_id: "b2", item_id: i2, reviewer_id: "bob", verdict: "needs-revision", concern: "off-construct", criteria: { ...allPass, on_construct: false } }),
  ];
  const agr = computeAgreement(rs);
  assert("2 items double-reviewed", agr.doubleReviewed === 2, JSON.stringify(agr));
  assert("1 agreed, 1 disputed", agr.agreed === 1 && agr.disputed === 1);
  assert("agreement rate is 0.5", agr.agreementRate === 0.5);
  assert("single-reviewed items are excluded from the rate", computeAgreement([rs[0]]).doubleReviewed === 0);
}

console.log(`\n${"─".repeat(60)}`);
console.log(`TOTAL: ${passed} passed, ${failed} failed`);
console.log("─".repeat(60));
if (failed > 0) process.exit(1);
console.log("\nAll item-review tests passed.");
