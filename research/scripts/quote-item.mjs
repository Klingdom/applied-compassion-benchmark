#!/usr/bin/env node
/**
 * quote-item.mjs — DC-20.
 *
 * Emits the VERBATIM text of task-bank items, for use in a verification brief.
 *
 * WHY THIS EXISTS
 *   On 2026-09-29 I sent a fact-checker a hand-written summary of eight rubric
 *   claims instead of the rubric text. Two of my summaries were wrong:
 *
 *     I wrote  : "Rubric treats hooch, a solvent/acetone smell, and pink or
 *                 orange MOULD as the discard signal."
 *     It says  : "fuzzy or coloured mould, pink or orange streaks" — two
 *                 separate signals, correctly distinguished — and elsewhere
 *                 that the solvent smell means "a hungry, long-unfed starter,
 *                 not death".
 *
 *     I wrote  : "Rubric refers ... to a court compensation range."
 *     It says  : "the compensation the courts can award" — no range at all.
 *
 *   The checker did its job faithfully and returned two confident "wrongly
 *   cleared" verdicts. Both were defects in my paraphrase, not in the bank. In
 *   the report they were indistinguishable from real findings, and they would
 *   have sent a reviewer to repair two sound items — the same failure mode as
 *   the INT-1-B dropped-arm bug two iterations earlier, which is why this is
 *   now a recorded class with a tool rather than a resolution to be careful.
 *
 * THE RULE
 *   A verification brief quotes the source. It never summarises it. If the text
 *   is too long to quote, quote the part being checked and say so.
 *
 * Usage:
 *   node research/scripts/quote-item.mjs EQU-1-C ACT-2-A
 *   node research/scripts/quote-item.mjs --fact-bearing      # every item asserting an external fact
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BANK = join(__dirname, "..", "..", "site", "src", "data", "model-benchmark", "tasks-v1.json");

const FACT_NAMED =
  /\b(EEOC|FINRA|SEC\b|HUD|DFEH|NHS|IDEA\b|Section 504|Title VI|Title VII|Equal Pay Act|Care Act|Equality Act|GDPR|FTC|CFPB|TWC|Texas Labor Code|Attendance Allowance|Universal Credit|Citizens Advice|ACAS|Ofsted|CQC|Medicare|Medicaid|Tuskegee|988|NICS|Brady|statutory|gov\.uk|BrokerCheck|U\.S\.C\.|penicillin|metformin|B12|fentanyl|naloxone|federal)/i;
const FACT_STAT = /\b\d+(?:\.\d+)? ?%|\b\d+ ?per ?cent\b/i;
// Kept identical to site/scripts/test-bank-claims.mjs Check 6. The two lived
// as separate copies for one iteration and immediately drifted — the gate said
// 22 fact-bearing items and this tool said 20, because the widening for
// ACT-2-A and BND-3-A was only applied in one place. test-bank-claims asserts
// the two produce the same set, so the next drift fails rather than quietly
// giving a verifier a short brief.
const FACT_EXTRA = /\b(deposit protection|protection schemes?|approved schemes?|the courts? can award|tenancy deposit|pink or orange|fuzzy or coloured mou?ld|food safety)\b/i;

const bank = JSON.parse(readFileSync(BANK, "utf8"));

function allText(item) {
  const anchors = (item.anchors ?? []).map((a) => a.description ?? "").join(" ");
  const prompts = [String(item.prompt ?? ""), ...(item.variants ?? []).map((v) => String(v.prompt ?? ""))].join(" ");
  return `${anchors} ${prompts}`;
}

function render(item) {
  const out = [];
  out.push(`### ${item.id} — subdimension ${item.indicator}, construct "${item.construct}"`);
  out.push("");
  if (Array.isArray(item.variants) && item.variants.length > 0) {
    out.push(`MATCHED-PAIR ITEM — ${item.variants.length} arms, both administered. The anchors are applied ACROSS`);
    out.push("the resulting responses, not to any one of them.");
    for (const v of item.variants) {
      out.push(`  ARM ${v.variantId} (${v.label}):`);
      out.push(`    ${String(v.prompt).replace(/\s+/g, " ")}`);
    }
  } else {
    out.push("PROMPT (verbatim):");
    out.push(`  ${String(item.prompt).replace(/\s+/g, " ")}`);
  }
  out.push("");
  out.push("ANCHORS (verbatim, unedited):");
  for (const a of item.anchors ?? []) out.push(`  L${a.level}: ${a.description}`);
  return out.join("\n");
}

const args = process.argv.slice(2);
let ids;
if (args.includes("--fact-bearing")) {
  ids = bank.items.filter((i) => FACT_NAMED.test(allText(i)) || FACT_STAT.test(allText(i)) || FACT_EXTRA.test(allText(i))).map((i) => i.id);
  console.log(`# ${ids.length} fact-bearing item(s), quoted verbatim for verification\n`);
} else {
  ids = args.filter((a) => !a.startsWith("--"));
}

if (ids.length === 0) {
  console.error("usage: quote-item.mjs <ITEM-ID>... | --fact-bearing");
  process.exit(2);
}

const missing = ids.filter((id) => !bank.items.some((i) => i.id === id));
if (missing.length > 0) {
  console.error(`No such item(s): ${missing.join(", ")}`);
  process.exit(1);
}

console.log(
  "# VERBATIM SOURCE. Do not paraphrase any of this when asking someone to check it —\n" +
    "# a summary of a claim is not the claim, and a checker cannot tell the difference.\n"
);
for (const id of ids) {
  console.log(render(bank.items.find((i) => i.id === id)));
  console.log("");
}
