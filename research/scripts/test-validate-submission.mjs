#!/usr/bin/env node
/**
 * test-validate-submission.mjs
 *
 * Adversarial tests for the submission validator. A validator that only accepts
 * honest input proves nothing, so every test here is an attack: the fabricated
 * composite, the softened prompt, the invented anchor, the quote that is not in
 * the answer it justifies.
 *
 * The positive control is a REAL artifact — the 249-trial self-run of
 * 2026-09-25 — so a pass here means the checks work on real data rather than on
 * a fixture shaped to satisfy them.
 */

import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { validateSubmission, itemHash } from "./validate-submission.mjs";

const REPO = path.resolve(new URL("../..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
const bank = JSON.parse(readFileSync(path.join(REPO, "site/src/data/model-benchmark/tasks-v1.json"), "utf8"));
const REAL = "C:/Users/philk/AppData/Local/Temp/claude/selfrun/scorecard.json";

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
const clone = (o) => JSON.parse(JSON.stringify(o));
const hasError = (r, needle) => r.errors.some((e) => e.toLowerCase().includes(needle.toLowerCase()));

// ── a minimal but complete honest artifact, built from the real bank ──────
function buildHonest({ rating = 4, items: itemCount = null } = {}) {
  const CRISIS = new Set(["ACT-1-A", "ACT-5-A", "ACT-5-B", "EMP-1-B", "EMP-1-C"]);
  const pool = bank.items.filter((i) => i.validationStatus !== "draft-authored-unreviewed" && !CRISIS.has(i.id));
  const chosen = itemCount ? pool.slice(0, itemCount) : pool;
  const label = { 1: "1.0 Critical", 2: "2.0 Developing", 3: "3.0 Functional", 4: "4.0 Established", 5: "5.0 Exemplary" }[rating];
  const response = "A specific and careful reply that names the emotional weight described and offers real options.";
  const quote = "names the emotional weight described";
  const hashes = Object.create(null);
  for (const i of chosen) hashes[i.id] = itemHash(i);

  return {
    official: false,
    comparability: "none",
    composite: null,
    band: null,
    coverage: null,
    items: chosen.map((i) => ({
      item_id: i.id,
      dimension: i.dimension,
      trials: [1, 2, 3].map((n) => ({
        trial_index: n,
        rating_1_5: rating,
        anchor_matched: label,
        evidence_quote: quote,
        response_text: response,
      })),
    })),
    contamination: { probed: true, high_exposure_item_ids: [], identification: { available: true, correct: 1, questions_asked: 6, flagged: false } },
    provenance: {
      bank_version: bank.meta.bankVersion,
      tool_version: "0.3.0",
      judge_configuration: "cross",
      judge_label: "another-model",
      trials_per_item: 3,
      item_hashes: hashes,
      finished_at: "2026-09-27T00:00:00.000Z",
      local_run_reference: "run-test",
    },
  };
}

console.log("\nTest 1: positive control — the real 249-trial artifact");
{
  if (!existsSync(REAL)) {
    console.log("  SKIP  real artifact not present in this environment");
  } else {
    const r = validateSubmission(JSON.parse(readFileSync(REAL, "utf8")), bank);
    assert("the real self-run artifact is accepted for review", r.valid, r.errors.join(" | "));
    assert("it re-scored all 249 trials", r.trialsChecked === 249, `got ${r.trialsChecked}`);
    assert("our scorer independently reproduces its composite", r.recomputed.composite === 100);
    assert("the missing identification probe is warned about, not ignored", r.warnings.some((w) => w.includes("identification")));
  }
}

console.log("\nTest 2: an honest synthetic artifact passes, and the checks are not vacuous");
{
  const r = validateSubmission(buildHonest(), bank);
  assert("honest artifact accepted", r.valid, r.errors.join(" | "));
  assert("coverage recomputed as complete", r.recomputed.coverage === "complete", r.recomputed.coverage);
  assert("a composite is derivable from it", typeof r.recomputed.composite === "number");
}

console.log("\nTest 3: THE ATTACK — a fabricated composite");
{
  const a = buildHonest({ rating: 2 });
  const honest = validateSubmission(clone(a), bank).recomputed.composite;
  a.composite = 100;
  a.band = "Exemplary";
  const r = validateSubmission(a, bank);
  assert("claiming 100 on 2-rated trials is rejected", !r.valid && hasError(r, "COMPOSITE MISMATCH"));
  assert("...and our own recomputation is far below it", honest < 50, `ours=${honest}`);
  assert("the rejection names both numbers", r.errors.some((e) => e.includes("100") && e.includes("our scorer computes")));
}

console.log("\nTest 4: THE ATTACK — a softened prompt");
{
  const a = buildHonest();
  const victim = a.items[0].item_id;
  a.provenance.item_hashes[victim] = "0".repeat(64);
  const r = validateSubmission(a, bank);
  assert("a mismatched item hash is rejected", !r.valid && hasError(r, "item hash does not match"));
  assert("the rejection names the item", r.errors.some((e) => e.includes(victim)));
}

console.log("\nTest 5: THE ATTACK — invented and mismatched anchors");
{
  const a = buildHonest();
  a.items[0].trials[0].anchor_matched = "6.0 Transcendent";
  assert("an anchor label that does not exist is rejected", !validateSubmission(a, bank).valid);

  const b = buildHonest({ rating: 5 });
  b.items[0].trials[0].anchor_matched = "1.0 Critical";
  const rb = validateSubmission(b, bank);
  assert("rating 5 while citing the level-1 anchor is rejected", !rb.valid && hasError(rb, "must agree"));
}

console.log("\nTest 6: THE ATTACK — a quote that is not in the answer");
{
  const a = buildHonest();
  a.items[0].trials[0].evidence_quote = "a phrase that never appeared anywhere";
  const r = validateSubmission(a, bank);
  assert("a quote absent from response_text is rejected", !r.valid && hasError(r, "not a substring"));

  const b = buildHonest();
  b.items[0].trials[0].evidence_quote = "yes";
  assert("a one-word quote is rejected", !validateSubmission(b, bank).valid);
}

console.log("\nTest 7: thin evidence and unknown items");
{
  const a = buildHonest();
  a.items[0].trials = a.items[0].trials.slice(0, 1);
  assert("fewer than 3 trials is rejected", !validateSubmission(a, bank).valid);

  const b = buildHonest();
  b.items.push({ item_id: "NOT-A-REAL-ITEM", dimension: "AWR", trials: b.items[0].trials });
  const rb = validateSubmission(b, bank);
  assert("an item not in the published bank is rejected", !rb.valid && hasError(rb, "not in the published bank"));
}

console.log("\nTest 8: the honesty fields cannot be flipped in transit");
{
  const a = buildHonest();
  a.official = true;
  assert("official:true is rejected", !validateSubmission(a, bank).valid);

  const b = buildHonest();
  b.comparability = "cross-model";
  const rb = validateSubmission(b, bank);
  assert("claiming cross-model comparability is rejected", !rb.valid && hasError(rb, "comparability"));

  const c = buildHonest();
  c.contamination.probed = false;
  assert("an unprobed run is rejected", !validateSubmission(c, bank).valid);
}

console.log("\nTest 9: coverage cannot be overclaimed");
{
  const a = buildHonest({ items: 12 });
  a.coverage = { level: "complete" };
  const r = validateSubmission(a, bank);
  assert("claiming complete coverage on 12 items is rejected", !r.valid && hasError(r, "coverage claims"));
  assert("...and the recomputed level is honest", r.recomputed.coverage === "insufficient", r.recomputed.coverage);

  const b = buildHonest({ items: 12 });
  b.composite = 80;
  b.band = "Established";
  const rb = validateSubmission(b, bank);
  assert("a composite on a below-floor run is rejected", !rb.valid && hasError(rb, "unsupported by its own evidence"));
}

console.log("\nTest 10: a contaminated submission is retained and marked, not discarded");
{
  const a = buildHonest();
  a.contamination.identification = { available: true, correct: 6, questions_asked: 6, flagged: true };
  const r = validateSubmission(a, bank);
  assert("a contaminated but otherwise honest submission is still accepted", r.valid, r.errors.join(" | "));
  assert("it is marked contaminated", r.contaminated === true);
  assert("the proposed record carries the flag", r.proposedRecord.contamination_indicated === true);
  assert("the proposed record is never official", r.proposedRecord.official === false);
  assert("the proposed record is never comparable", r.proposedRecord.comparability === "none");
}

console.log(`\n${"─".repeat(60)}`);
console.log(`TOTAL: ${passed} passed, ${failed} failed`);
console.log("─".repeat(60));
if (failed > 0) process.exit(1);
console.log("\nAll submission-validator tests passed.");
