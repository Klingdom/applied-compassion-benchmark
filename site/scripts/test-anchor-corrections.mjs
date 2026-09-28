#!/usr/bin/env node
/**
 * test-anchor-corrections.mjs — AC-001 / EQU-1-C.
 *
 * Pins the guarantee that makes a published correction worth having: a
 * known-wrong anchor cannot reach a reader, or an AI judge, uncorrected.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateAnchorCorrections, correctionsByItem } from "./lib/anchor-correction-validator.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FILE = join(__dirname, "..", "src", "data", "model-benchmark", "anchor-corrections-v1.json");
const BANK = join(__dirname, "..", "src", "data", "model-benchmark", "tasks-v1.json");
const PAGE = join(__dirname, "..", "src", "app", "ai-evaluation-suite", "page.tsx");

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
const page = readFileSync(PAGE, "utf8");

console.log("\nTest 1: the real corrections file validates against the real bank");
{
  const r = validateAnchorCorrections(real, bank);
  assert("validates", r.valid, r.errors.join(" | "));
  assert("holds at least one correction — this file exists because one was found", real.corrections.length >= 1);
  assert("meta.recordCount agrees", real.meta.recordCount === real.corrections.length);
  if (r.warnings.length) r.warnings.forEach((w) => console.log(`        note: ${w}`));
}

console.log("\nTest 2: THE LOAD-BEARING CHECK — a correction's quote must still be in its anchor");
{
  // A correction that no longer matches its target renders a warning about text
  // that is not there, which looks like the claim was checked when it was not.
  const drifted = structuredClone(real);
  drifted.corrections[0].quoted = "a figure that is not in any anchor";
  const r = validateAnchorCorrections(drifted, bank);
  assert("a drifted quote is rejected", !r.valid && r.errors.some((e) => /NOT present/.test(e)));

  // POSITIVE CONTROL (V8): the same call shape passes on the real data, so the
  // rejection above is the guard firing rather than the call being broken.
  assert("positive control: the real quote IS present", validateAnchorCorrections(real, bank).valid);

  const wrongLevel = structuredClone(real);
  wrongLevel.corrections[0].anchor_level = wrongLevel.corrections[0].anchor_level === 5 ? 4 : 5;
  assert("pointing at the wrong anchor level is rejected", !validateAnchorCorrections(wrongLevel, bank).valid);

  const wrongItem = structuredClone(real);
  wrongItem.corrections[0].item_id = "NOT-A-REAL-ITEM";
  assert("pointing at a non-existent item is rejected", !validateAnchorCorrections(wrongItem, bank).valid);
}

console.log("\nTest 3: a correction is a factual claim and must cite a primary source");
{
  const noSrc = structuredClone(real);
  noSrc.corrections[0].sources = [];
  assert("no sources is rejected", !validateAnchorCorrections(noSrc, bank).valid);

  const noQuote = structuredClone(real);
  noQuote.corrections[0].sources = [{ url: "https://www.eeoc.gov/time-limits-filing-charge" }];
  assert("a source with no quoted sentence is rejected", !validateAnchorCorrections(noQuote, bank).valid);

  const badUrl = structuredClone(real);
  badUrl.corrections[0].sources = [{ url: "eeoc.gov", quote: "something" }];
  assert("a non-absolute URL is rejected", !validateAnchorCorrections(badUrl, bank).valid);

  assert(
    "every real source is a primary domain (eeoc.gov / twc.texas.gov / gov.uk / legislation.gov.uk)",
    real.corrections.every((c) =>
      c.sources.every((s) => /(^https:\/\/www\.eeoc\.gov|twc\.texas\.gov|gov\.uk|legislation\.gov\.uk)/.test(s.url))
    )
  );
}

console.log("\nTest 4: harm direction is recorded, because wrong and harmful are different");
{
  for (const c of real.corrections) {
    assert(`${c.correction_id} states who is harmed and how`, typeof c.harmDirection === "string" && c.harmDirection.length > 40);
  }
  const noHarm = structuredClone(real);
  noHarm.corrections[0].harmDirection = "";
  assert("an empty harmDirection is rejected", !validateAnchorCorrections(noHarm, bank).valid);
}

console.log("\nTest 5: a 'repaired' correction must mean the wrong text is GONE");
{
  const lying = structuredClone(real);
  lying.corrections[0].repairStatus = "repaired";
  const r = validateAnchorCorrections(lying, bank);
  assert(
    "claiming repaired while the wrong text is still in the anchor is rejected",
    !r.valid && r.errors.some((e) => /still in the anchor/.test(e))
  );
}

console.log("\nTest 6: the rendering surface cannot silently drop a correction");
{
  // The suite page fuses corrections into the rubric strings it renders, which
  // is also what builds the AI-judge prompt. If that wiring is removed, a
  // known-wrong anchor goes back to being published bare.
  assert("the suite page imports the corrections data", /anchor-corrections-v1\.json/.test(page));
  assert("the suite page fuses them into the rendered rubric", /ANCHOR_CORRECTIONS\.get\(item\.id\)/.test(page));
  assert("the rendered text warns the reader", /PUBLISHED CORRECTION/.test(page));
  assert(
    "and tells a rater not to reward the uncorrected figure",
    /Do not award credit for the uncorrected figure/.test(page)
  );

  const live = correctionsByItem(real);
  assert("every awaiting-decision correction is live for rendering", live.size >= 1);
  for (const [itemId] of live) {
    assert(`${itemId} exists in the bank`, bank.items.some((i) => i.id === itemId));
  }
}

console.log("\nTest 7: repaired and withdrawn corrections stop rendering automatically");
{
  const done = structuredClone(real);
  done.corrections[0].repairStatus = "withdrawn";
  assert("a withdrawn correction is not rendered", correctionsByItem(done).size === 0);

  const sup = structuredClone(real);
  sup.corrections[0].supersededBy = "AC-999";
  assert("a superseded correction is not rendered", correctionsByItem(sup).size === 0);
}

console.log(`\n${"─".repeat(60)}`);
console.log(`TOTAL: ${passed} passed, ${failed} failed`);
console.log("─".repeat(60));
if (failed > 0) process.exit(1);
console.log("\nAll anchor-correction tests passed.");
