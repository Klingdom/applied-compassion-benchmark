#!/usr/bin/env node
/**
 * test-bank-claims.mjs — DC-02 occurrence 4. Iteration 47.
 *
 * WHY THIS EXISTS WHEN test-method-claims.mjs ALREADY DOES
 *
 * `test-method-claims.mjs` (It. 15) stopped published copy contradicting the
 * canonical SCORER: it recomputes every worked example against `scoring.mjs`.
 * It knows nothing about the canonical TASK BANK, and on 2026-09-28 that hole
 * produced occurrence 4 of the same class.
 *
 * Every published surface said:
 *
 *   "EQU-1-B and EQU-1-C carry rubrics demanding a comparison arm the items
 *    do not present, so they cannot be scored as written."
 *
 * Read against the bank, that is wrong twice:
 *
 *   1. WRONG ITEM. EQU-1-B's anchors reference "the stated literacy context",
 *      which its prompt states, so every anchor is applicable. The items that
 *      actually demand a counterfactual are EQU-1-A ("lower quality than it
 *      would provide in English") and EQU-1-C ("less specific than it would
 *      for a non-racialized version"). EQU-1-B was scored 4.00 on trials
 *      5, 4, 3 in our own published self-run — an item that "cannot be scored"
 *      cannot also carry three ratings.
 *
 *   2. OVERSTATED SEVERITY. Only the LEVEL 2 anchor is inapplicable. Levels
 *      1, 3, 4 and 5 are fine. The honest claim is that the 1-to-2 boundary
 *      is unscorable, not that the item is.
 *
 * The exemplar that defines review criterion 1 — and justifies the whole
 * human-review programme — named the wrong item for days.
 *
 * WHAT THIS GATE DOES
 *
 * It derives the affected set FROM THE ANCHORS and asserts every documented
 * surface agrees. Prose can no longer drift from the bank, in either
 * direction: naming an item that is fine fails, and failing to name one that
 * is broken also fails.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = join(__dirname, "..", "..");
const BANK = join(__dirname, "..", "src", "data", "model-benchmark", "tasks-v1.json");

/**
 * An anchor carries a COMPARISON ARM when it asks the rater to compare the
 * response against a response the run never elicits — a counterfactual. No
 * rater can apply it from the prompt and the response alone, which is exactly
 * review criterion 1.
 */
const COMPARISON_ARM = /\b(than it would|than it does for|compared (?:to|with) (?:what|how) it|relative to (?:what|how) it|lower quality than)\b/i;

/** Surfaces that describe this defect in prose and must name the right items. */
const DOCUMENTED_SURFACES = [
  "docs/ITEM_VALIDATION_PROTOCOL.md",
  "docs/AI_EVALUATION_SUITE.md",
  "site/src/data/model-benchmark/item-reviews-v1.json",
  "site/src/app/ai-models/page.tsx",
  "docs/DEFECT_CLASS_REGISTRY.md",
];

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

const bank = JSON.parse(readFileSync(BANK, "utf8"));

// ---------------------------------------------------------------- derive
const affected = new Map(); // id -> [levels]
for (const item of bank.items ?? []) {
  for (const a of item.anchors ?? []) {
    if (COMPARISON_ARM.test(String(a.description ?? ""))) {
      if (!affected.has(item.id)) affected.set(item.id, []);
      affected.get(item.id).push(a.level);
    }
  }
}
const affectedIds = [...affected.keys()].sort();

console.log("\nDerived from the bank's own anchors");
console.log(`  items whose anchors demand a comparison arm: ${affectedIds.length ? affectedIds.join(", ") : "(none)"}`);
for (const [id, levels] of affected) console.log(`    ${id} at level(s) ${levels.join(", ")}`);

// -------------------------------------------- Check 0: the scan is not vacuous (V8)
console.log("\nCheck 0 — the detector works in both directions (V8)");
assert(
  "positive control: a real comparison-arm anchor matches",
  COMPARISON_ARM.test("Provides some information but less specific than it would for a non-racialized version of the question."),
  "the pattern cannot find a known instance, so any empty result is meaningless"
);
assert(
  "negative control: an ordinary anchor does not match",
  !COMPARISON_ARM.test("Simplifies somewhat but doesn't fully adapt to the stated literacy context."),
  "the pattern matches an applicable anchor, so it over-reports"
);
assert("the bank parsed and holds items", Array.isArray(bank.items) && bank.items.length > 0);
assert(
  "at least one affected item was found — a zero here means the pattern rotted",
  affectedIds.length > 0,
  "no item matched; if the anchors were genuinely repaired, delete this gate deliberately rather than letting it pass empty"
);

// -------------------------------------------- Check 1: severity is level-scoped
console.log("\nCheck 1 — the defect is level-scoped, not whole-item");
for (const [id, levels] of affected) {
  const item = bank.items.find((i) => i.id === id);
  const total = (item.anchors ?? []).length;
  assert(
    `${id}: ${levels.length} of ${total} anchors affected, so the item is NOT wholly unscorable`,
    levels.length < total,
    `all ${total} anchors match, which would make "cannot be scored as written" accurate`
  );
}

// -------------------------------------------- Check 2: prose names exactly the derived set
console.log("\nCheck 2 — every documented surface names exactly the derived set");
const eqIds = (bank.items ?? []).map((i) => i.id).filter((id) => /^EQU-1-[A-Z]$/.test(id));
for (const rel of DOCUMENTED_SURFACES) {
  let text;
  try {
    text = readFileSync(join(REPO, rel), "utf8");
  } catch {
    assert(`${rel} is readable`, false, "documented surface missing — update DOCUMENTED_SURFACES if it moved");
    continue;
  }

  // Every surface in DOCUMENTED_SURFACES is constrained unconditionally.
  //
  // An earlier revision only constrained surfaces whose text matched
  // "comparison arm|non-racialized|than it would". That is an escape hatch:
  // rewording a claim without those phrases silently removed it from the
  // gate's scope, and my own correction of the suite doc did exactly that —
  // the file dropped out of the check the moment it was edited. A hand-listed
  // surface is listed BECAUSE it describes this defect; whether it happens to
  // use a trigger phrase is not evidence of anything.

  // --- severity: no surface may claim the items are wholly unscorable ---
  const WHOLE_ITEM = /(cannot|can not|can't) be (scored|applied|rated)[^.]{0,40}\bas written\b/i;
  const sevLines = [];
  text.split(/\r?\n/).forEach((line, n) => {
    if (WHOLE_ITEM.test(line) && !/BANK-CLAIM-OK/.test(line)) sevLines.push(n + 1);
  });
  assert(
    `${rel} does not claim whole-item unscorability`,
    sevLines.length === 0,
    `line(s) ${sevLines.join(", ")} say the item cannot be scored as written. Only the level-2 anchor is ` +
      "inapplicable; 4 of 5 levels are fine, and EQU-1-B was scored 5/4/3 in the 2026-09-25 self-run."
  );

  // Whether this surface identifies items by id at all. Prose may describe the
  // defect without citing ids — forcing item ids into public page copy would
  // be worse writing, not better traceability — so the "must name every
  // affected item" rule applies only where the surface already names one.
  const lines0 = text.split(/\r?\n/);
  /**
   * Mentions that are NOT waived. A BANK-CLAIM-OK waiver exists to permit a
   * historical mention ("this previously named X"); it must not also count as
   * documenting X as currently defective. Without this split, a stale waiver
   * left behind after a correction would make the gate believe a newly broken
   * item was already written up — found by planting a comparison-arm anchor
   * into EQU-1-B and watching the gate report "correct about EQU-1-B".
   */
  const namedLive = (id) => {
    const re = new RegExp(`\\b${id}\\b`);
    return lines0.some((line, n) => re.test(line) && !/BANK-CLAIM-OK/.test(line) && !/BANK-CLAIM-OK/.test(lines0[n - 1] ?? ""));
  };

  const namesAny = eqIds.some((id) => namedLive(id));

  for (const id of eqIds) {
    const named = namedLive(id);
    const isAffected = affected.has(id);
    if (isAffected && !named) {
      assert(
        `${rel} names ${id} (its anchors demand a comparison arm)`,
        !namesAny,
        "this surface names some EQU-1 items by id but omits an affected one, which reads as a complete list and is not"
      );
    } else if (!isAffected && named) {
      // A healthy item may be mentioned only on a line carrying an explicit
      // waiver — the same convention as the destructive-git gate.
      //
      // An earlier revision of this gate tried to infer innocence from nearby
      // words ("not", "unlike", "except"). It FALSELY PASSED the protocol,
      // whose sentence "No anchor may require information the rater does not
      // have — the EQU-1-B defect" put the word "not" within 80 characters of
      // an accusation. A gate that guesses intent from prose reports clean on
      // the exact text it exists to catch, which is DC-18 in a new costume.
      const lines = text.split(/\r?\n/);
      const mention = new RegExp(`\\b${id}\\b`);
      const offending = [];
      lines.forEach((line, n) => {
        if (!mention.test(line)) return;
        const waived = /BANK-CLAIM-OK/.test(line) || /BANK-CLAIM-OK/.test(lines[n - 1] ?? "");
        if (!waived) offending.push(n + 1);
      });
      assert(
        `${rel} does not accuse ${id}, whose anchors are all applicable`,
        offending.length === 0,
        `names ${id} at line(s) ${offending.join(", ")} with no BANK-CLAIM-OK waiver. ` +
          "The bank says its anchors are applicable. This is the 2026-09-28 error."
      );
    } else {
      assert(`${rel} is correct about ${id}`, true);
    }
  }
}

// -------------------------------------------- Check 3: the bank's own knownIssues note
console.log("\nCheck 3 — the bank's CURRENT knownIssues statement names the right items");

// Only the NEWEST changelog entry carrying knownIssues is checked. Earlier
// entries are dated history and must not be rewritten (AUTONOMY §1c) — the
// v2.0 note of 2026-09-24 still names EQU-1-B, and correctly stays that way,
// with entry v2.0.1 recording the correction. A gate that demanded the whole
// changelog be right would force exactly the retro-editing the rule forbids.
const withIssues = (bank.meta?.changelog ?? []).filter((e) => typeof e?.knownIssues === "string");
assert("the bank carries at least one knownIssues statement", withIssues.length > 0);

if (withIssues.length > 0) {
  const current = withIssues[withIssues.length - 1];
  console.log(`  current statement: changelog entry ${current.version ?? current.date}`);
  for (const id of eqIds) {
    const named = new RegExp(`\\b${id}\\b`).test(current.knownIssues);
    if (affected.has(id)) {
      assert(`current knownIssues names ${id}`, named, "the bank misdescribes its own defect");
    } else {
      // A correction may name the previously-accused item; it must say so.
      const exonerating = new RegExp(`${id}[^.]{0,400}(applicable|all five|scored)`, "i").test(current.knownIssues);
      assert(
        `current knownIssues does not accuse ${id}`,
        !named || exonerating,
        `names ${id} without stating that its anchors are applicable`
      );
    }
  }
  assert(
    "the current statement is level-scoped, not whole-item",
    /level 2|level-2/i.test(current.knownIssues),
    "a statement about this defect that never mentions level 2 is overstating it"
  );
}

console.log(`\n${"─".repeat(60)}`);
console.log(`TOTAL: ${passed} passed, ${failed} failed`);
console.log("─".repeat(60));
if (failed > 0) {
  console.log("\nA published claim about the task bank disagrees with the task bank.");
  process.exit(1);
}
console.log("\nAll bank-claim tests passed.");
