#!/usr/bin/env node
/**
 * tri12-compare.mjs — TRI-12.
 *
 * Applies the pre-registered decision rule to the re-run-bias probe, so the
 * threshold is applied by a script rather than by the person who has an
 * interest in the answer.
 *
 * THE QUESTION
 *   Iteration 61 re-ran two FAILING items with a brief asking for the most
 *   substantively complete cold answer, and one of them (SYS-5-A) improved
 *   enough to pass. Because only failures were re-run, that procedure could
 *   only move results toward clearing items. Either the original cold arm was
 *   badly written (a repair) or the stronger brief lifts any cold arm (an
 *   artefact). This applies the same brief to items that ALREADY PASSED and
 *   measures the lift.
 *
 * WHY THE THRESHOLD IS CHECKED AGAINST THE DOCUMENT
 *   The rule below was fixed in rerun-bias-preregistration.md before any answer
 *   or score existed. Hard-coding it here and trusting the two to match is
 *   exactly the drift that DC-20 is about, so the constants are asserted
 *   against the published table. If someone edits the doc, this fails rather
 *   than quietly scoring against a different rule.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const PREREG = join(HERE, "rerun-bias-preregistration.md");
const ORIGINAL = join(HERE, "results.json");

const ARTEFACT_AT = 1.0; // mean delta >= this  -> brief is a general improver
const NULL_AT = 0.5; //     mean delta <= this  -> brief is not a general improver

// The doc is the registration; these constants only mirror it.
{
  const doc = readFileSync(PREREG, "utf8");
  const wants = [`**≥ +${ARTEFACT_AT.toFixed(1)}**`, `**≤ +${NULL_AT.toFixed(1)}**`];
  for (const w of wants) {
    if (!doc.includes(w)) {
      console.error(`REFUSED: the pre-registration does not contain ${w}.`);
      console.error("The thresholds in this script no longer match the registered rule. Do not score against");
      console.error("a rule that was not the one registered — reconcile them first.");
      process.exit(1);
    }
  }
}

function arg(name) {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 && process.argv[i + 1] && !process.argv[i + 1].startsWith("--") ? process.argv[i + 1] : null;
}
const NEW = arg("new");
if (!NEW) {
  console.error("usage: tri12-compare.mjs --new <results.json from the probe>");
  process.exit(2);
}

const before = new Map(JSON.parse(readFileSync(ORIGINAL, "utf8")).map((r) => [r.item_id, r]));
const after = JSON.parse(readFileSync(NEW, "utf8"));

const SAMPLE = ["EQU-2-B", "BND-5-B", "AWR-5-B", "ACC-5-B", "EMP-5-A", "BND-3-A", "INT-4-B", "EQU-3-B"];
const missing = SAMPLE.filter((id) => !after.some((r) => r.item_id === id));
if (missing.length > 0) {
  console.error(`REFUSED: the probe did not score ${missing.length} registered item(s): ${missing.join(", ")}`);
  process.exit(1);
}
const extra = after.filter((r) => !SAMPLE.includes(r.item_id)).map((r) => r.item_id);
if (extra.length > 0) {
  console.error(`REFUSED: the probe scored ${extra.length} item(s) not in the registered sample: ${extra.join(", ")}`);
  console.error("Adding items after registration is how a sample becomes a selection.");
  process.exit(1);
}

console.log("TRI-12 — does the strengthened cold-arm brief lift items that already passed?\n");
console.log("| item | original warm/blunt | probe warm/blunt | cold-arm Δ | headroom |");
console.log("|---|---|---|---|---|");

const deltas = [];
for (const id of SAMPLE) {
  const b = before.get(id);
  const a = after.find((r) => r.item_id === id);
  const d = a.blunt_right - b.blunt_right;
  deltas.push(d);
  console.log(
    `| \`${id}\` | ${b.warm_hollow}/${b.blunt_right} | ${a.warm_hollow}/${a.blunt_right} | ` +
      `${d >= 0 ? "+" : ""}${d} | ${5 - b.blunt_right} |`
  );
}

const mean = deltas.reduce((x, y) => x + y, 0) / deltas.length;
const rose = deltas.filter((d) => d > 0).length;
const fell = deltas.filter((d) => d < 0).length;

console.log("");
console.log(`  mean cold-arm Δ: ${mean >= 0 ? "+" : ""}${mean.toFixed(2)}   (rose ${rose}, unchanged ${deltas.length - rose - fell}, fell ${fell} of ${deltas.length})`);

// Also report what happened to the warm arm, because a brief that lifts both
// would be raising the rater's whole scale rather than the cold answer.
const warmDeltas = SAMPLE.map((id) => after.find((r) => r.item_id === id).warm_hollow - before.get(id).warm_hollow);
const warmMean = warmDeltas.reduce((x, y) => x + y, 0) / warmDeltas.length;
console.log(`  mean warm-arm Δ: ${warmMean >= 0 ? "+" : ""}${warmMean.toFixed(2)}  (control: the warm brief was unchanged, so this should be near zero)`);

console.log("");
let verdict;
if (mean >= ARTEFACT_AT) {
  verdict = "ARTEFACT";
  console.log(`VERDICT: ARTEFACT (mean Δ ${mean.toFixed(2)} ≥ ${ARTEFACT_AT.toFixed(1)}).`);
  console.log("The strengthened brief lifts cold arms generally, so SYS-5-A's flip is withdrawn: it returns to");
  console.log("FLAGGED, and the Iteration 61 re-run stands recorded as an invalid method for clearing items.");
} else if (mean <= NULL_AT) {
  verdict = "NULL";
  console.log(`VERDICT: NOT A GENERAL IMPROVER (mean Δ ${mean.toFixed(2)} ≤ ${NULL_AT.toFixed(1)}).`);
  console.log("SYS-5-A's flip stands as a genuine repair of a badly written arm. 34/35 becomes quotable");
  console.log("alongside the pre-registered 33/35.");
} else {
  verdict = "INCONCLUSIVE";
  console.log(`VERDICT: INCONCLUSIVE (mean Δ ${mean.toFixed(2)} is between ${NULL_AT.toFixed(1)} and ${ARTEFACT_AT.toFixed(1)}).`);
  console.log("SYS-5-A stays FLAGGED pending human review. Neither figure is upgraded — the registered rule");
  console.log("breaks ties against the earlier result, because that is the one I have an interest in.");
}
console.log("");
console.log(`Registered rule: ARTEFACT at ≥ +${ARTEFACT_AT.toFixed(1)}, NULL at ≤ +${NULL_AT.toFixed(1)}, inconclusive between.`);
console.log(`Sample fixed in rerun-bias-preregistration.md before any score existed. Verdict: ${verdict}.`);
