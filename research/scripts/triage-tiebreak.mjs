#!/usr/bin/env node
/**
 * triage-tiebreak.mjs — TRI-1.
 *
 * The full pass left 35 items where one agent flagged and the other cleared.
 * A disagreement is evidence about the anchor, so it is worth keeping — but 35
 * open questions is not a queue, it is a pile. A third independent read turns
 * each one into a 2-1 majority, which is not a verdict but is an order.
 *
 * WHAT THIS IS NOT
 *   Not a review. Not a resolution. Three agents agreeing is still three
 *   agents. `deriveItemStatus` continues to read only the human review log, and
 *   an item flagged 3-0 here is exactly as `unvalidated` as one cleared 0-3.
 *
 * WHY A MAJORITY IS USEFUL ANYWAY
 *   It separates "two careful readers disagreed and a third broke the tie" from
 *   "two of three independently saw the same thing". The first is a question for
 *   a human; the second is a finding a human can check quickly. Ordering by
 *   that distinction is the whole point of a sampling frame.
 *
 * Usage:
 *   node research/scripts/triage-tiebreak.mjs --base <pass> --third <pass>
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const STORE = join(__dirname, "..", "..", "site", "src", "data", "model-benchmark", "item-triage-v1.json");

function arg(name, fallback = null) {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 && process.argv[i + 1] && !process.argv[i + 1].startsWith("--") ? process.argv[i + 1] : fallback;
}
const BASE = arg("base", "full-2026-09-29");
const THIRD = arg("third");
if (!THIRD) {
  console.error("usage: triage-tiebreak.mjs --base <pass> --third <pass>");
  process.exit(2);
}

const store = JSON.parse(readFileSync(STORE, "utf8"));
const all = store.triage ?? [];

/** flagged / cleared per (pass, item), keyed by agent so a re-run cannot double-count. */
function verdicts(passId) {
  const byItem = new Map();
  for (const r of all) {
    if (r.pass_id !== passId) continue;
    if (!byItem.has(r.item_id)) byItem.set(r.item_id, new Map());
    byItem.get(r.item_id).set(r.agent_id, (r.suspected ?? []).length > 0);
  }
  return byItem;
}

const base = verdicts(BASE);
const third = verdicts(THIRD);

if (base.size === 0) {
  console.error(`No records for base pass "${BASE}" — refusing to report on an empty comparison.`);
  process.exit(1);
}
if (third.size === 0) {
  console.error(`No records for third pass "${THIRD}" — refusing to report on an empty comparison.`);
  process.exit(1);
}

const rows = [];
for (const [itemId, agents] of base) {
  const flags = [...agents.values()];
  const contested = flags.some(Boolean) && flags.some((f) => !f);
  if (!contested) continue;

  const t = third.get(itemId);
  if (!t) {
    rows.push({ itemId, third: null, majority: "no third read" });
    continue;
  }
  const thirdFlagged = [...t.values()].some(Boolean);
  // Base contributes exactly one flag and one clear, by definition of contested.
  const forFlag = 1 + (thirdFlagged ? 1 : 0);
  const forClear = 1 + (thirdFlagged ? 0 : 1);
  rows.push({
    itemId,
    third: thirdFlagged ? "flagged" : "cleared",
    majority: forFlag > forClear ? "2-1 flag" : "2-1 clear",
    criteria: thirdFlagged ? [...new Set(all.filter((r) => r.pass_id === THIRD && r.item_id === itemId).flatMap((r) => r.suspected ?? []))].sort() : [],
  });
}

const flagMajority = rows.filter((r) => r.majority === "2-1 flag");
const clearMajority = rows.filter((r) => r.majority === "2-1 clear");
const unread = rows.filter((r) => r.majority === "no third read");

console.log(`\nTie-break over ${rows.length} contested item(s)`);
console.log(`  base pass:  ${BASE}`);
console.log(`  third read: ${THIRD}`);
console.log("");
console.log(`  2-1 FLAG  (two of three saw a problem) — ${flagMajority.length}`);
for (const r of flagMajority) {
  const severe = r.criteria.some((c) => c === 1 || c === 5);
  console.log(`    ${r.itemId.padEnd(10)} criteria ${r.criteria.join(",") || "-"}${severe ? "   [severe]" : ""}`);
}
console.log("");
console.log(`  2-1 CLEAR (two of three found nothing) — ${clearMajority.length}`);
console.log(`    ${clearMajority.map((r) => r.itemId).join(", ") || "-"}`);
if (unread.length > 0) {
  console.log("");
  console.log(`  NO THIRD READ — ${unread.length}: ${unread.map((r) => r.itemId).join(", ")}`);
}

console.log("");
console.log("Reviewer order: the 2-1 FLAG items with a severe criterion first, then the rest of");
console.log("the flag majority, then the 2-1 CLEAR items last. None of this validates anything —");
console.log("three agents agreeing is still three agents, and every item remains unvalidated.");
