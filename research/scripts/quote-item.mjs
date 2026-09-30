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

/**
 * --prompts-only: the brief for someone who must ANSWER an item, not judge it.
 *
 * The discrimination test (TRI-9/TRI-10) turns on one condition: the writer of
 * the candidate answers must not be able to see what it is being marked
 * against. An answer-writer that can read the anchors is aiming at them, and
 * the resulting score measures the aim, not the rubric.
 *
 * In Iteration 60 I satisfied that by building the brief by hand and then
 * grepping it for anchor fragments. That worked, and it is not a control: the
 * next brief is only as clean as the person remembering to grep it. So the
 * emitter refuses to emit anchors, and then CHECKS ITS OWN OUTPUT for them
 * before printing — if a future edit to render() starts including anchor text,
 * this exits non-zero rather than quietly handing a writer the answer key.
 *
 * `construct` and `indicator` are withheld for the same reason and are not a
 * lesser leak: "Avoiding Hollow Language" tells a writer the entire game.
 */
function renderPromptOnly(item) {
  const out = [`### ${item.id}`, ""];
  if (Array.isArray(item.variants) && item.variants.length > 0) {
    out.push(`This item has ${item.variants.length} arms. Both are administered; answer each separately.`);
    for (const v of item.variants) {
      out.push(`  ARM ${v.variantId}:`);
      out.push(`    ${String(v.prompt).replace(/\s+/g, " ")}`);
    }
  } else {
    out.push(String(item.prompt).replace(/\s+/g, " "));
  }
  return out.join("\n");
}

/** Six-word shingles: long enough not to fire on ordinary shared vocabulary. */
function shingles(text, n = 6) {
  const w = String(text).toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean);
  const out = [];
  for (let i = 0; i + n <= w.length; i += 1) out.push(w.slice(i, i + n).join(" "));
  return out;
}

function assertNoRubricLeak(text, items) {
  const hay = text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ");
  const leaks = [];
  for (const item of items) {
    for (const a of item.anchors ?? []) {
      for (const s of shingles(a.description)) {
        if (hay.includes(s)) {
          leaks.push(`${item.id} L${a.level}: "...${s}..."`);
          break;
        }
      }
    }
    const construct = String(item.construct ?? "").trim();
    if (construct.length > 3 && hay.includes(construct.toLowerCase())) {
      leaks.push(`${item.id}: construct name "${construct}" is in the brief`);
    }
  }
  if (leaks.length > 0) {
    console.error(`REFUSED: the prompts-only brief leaks rubric text — ${leaks.length} leak(s):`);
    for (const l of leaks) console.error(`  ${l}`);
    console.error("");
    console.error("A writer that can see the anchors is aiming at them, and the score then measures the aim.");
    process.exit(1);
  }
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

const chosen = ids.map((id) => bank.items.find((i) => i.id === id));

if (args.includes("--prompts-only")) {
  const body = [
    "# USER PROMPTS, VERBATIM. Nothing else about these items is included, deliberately:",
    "# no scoring anchors, no construct names, no indicator. Answer them as the user asked.",
    "",
    ...chosen.map((it) => `${renderPromptOnly(it)}\n`),
  ].join("\n");
  assertNoRubricLeak(body, chosen);
  console.log(body);
  process.exit(0);
}

console.log(
  "# VERBATIM SOURCE. Do not paraphrase any of this when asking someone to check it —\n" +
    "# a summary of a claim is not the claim, and a checker cannot tell the difference.\n"
);
for (const it of chosen) {
  console.log(render(it));
  console.log("");
}
