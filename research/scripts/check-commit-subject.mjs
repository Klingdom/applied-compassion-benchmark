#!/usr/bin/env node
/**
 * check-commit-subject.mjs — DC-16.
 *
 * Checks a PROPOSED commit subject against ITERATION_LOG.md before the commit
 * exists, so the silence gate does not have to fail in CI afterwards.
 *
 * WHY THIS EXISTS
 *   `test-iteration-log-silence.mjs` (It. 46) fails when a commit subject names
 *   a work item the log does not mention. It has now caught its author FOUR
 *   times out of four: CAL-2, GI-4/GI-5, TRI-8, and TRI-10/TRI-11. The failure
 *   mode is identical every time — I write the backlog row and forget the log
 *   sentence.
 *
 *   The gate cannot fire earlier by design: a commit cannot reference its own
 *   SHA, so it reads commits that already exist and therefore fires one commit
 *   late. That is documented and correct. But "correct and one commit late"
 *   means four CI failures and four repair commits, and after the fourth it is
 *   clear that intending to remember is not a control.
 *
 *   So this takes the subject as an argument and answers the same question
 *   before anything is committed. Same extractor, same exclusions, same log.
 *
 * Usage:
 *   node research/scripts/check-commit-subject.mjs "Subject line (TRI-10 / TRI-11)"
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { extractWorkItemIds } from "./test-iteration-log-silence.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = join(__dirname, "..", "..");
const LOG = join(REPO, "ITERATION_LOG.md");
const BANK = join(REPO, "site", "src", "data", "model-benchmark", "tasks-v1.json");

const subject = process.argv.slice(2).join(" ").trim();
if (!subject) {
  console.error('usage: check-commit-subject.mjs "<proposed commit subject>"');
  process.exit(2);
}

/** Task-bank item ids are content, not work items — same rule as the gate. */
function bankItemIds() {
  try {
    const bank = JSON.parse(readFileSync(BANK, "utf8"));
    const ids = new Set();
    for (const it of bank.items ?? []) {
      if (typeof it?.id !== "string") continue;
      ids.add(it.id);
      ids.add(it.id.replace(/-[A-Z]$/, ""));
    }
    return ids;
  } catch {
    return new Set();
  }
}

const logText = readFileSync(LOG, "utf8");
const ids = extractWorkItemIds(subject, bankItemIds());

if (ids.length === 0) {
  console.log(`No work-item id in the subject — nothing for the silence gate to check.\n  "${subject}"`);
  process.exit(0);
}

const missing = ids.filter((id) => !new RegExp(`\\b${id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(logText));

console.log(`Subject: "${subject}"`);
console.log(`  work items named: ${ids.join(", ")}`);

if (missing.length === 0) {
  console.log("  all of them appear in ITERATION_LOG.md — the silence gate will pass.");
  process.exit(0);
}

console.log("");
console.log(`WOULD FAIL — ${missing.length} id(s) not in ITERATION_LOG.md: ${missing.join(", ")}`);
console.log("");
console.log("Name them in the iteration entry before committing. Do not remove them from the subject:");
console.log("the id is how the work is findable, and dropping it to appease the gate is the one repair");
console.log("that makes the record worse.");
process.exit(1);
