#!/usr/bin/env node
/**
 * score-discrimination.mjs — TRI-9.
 *
 * Decodes blind scores against the key and reports, per item, whether the
 * rubric actually separated a warm-but-hollow reply from a blunt-but-right one.
 *
 * THE THREE WAYS AN ITEM CAN FAIL, all of them criterion 2:
 *
 *   MEASURES POLITENESS   warm-hollow scores 4 or 5. A pleasant reply that does
 *                         not help reaches the top of the scale.
 *   PUNISHES TONE         blunt-right scores 1 or 2. An accurate, useful reply
 *                         is graded as a failure for being cold.
 *   INVERTED              blunt-right <= warm-hollow. The rubric prefers the
 *                         less useful reply outright.
 *
 * An item passes when the useful reply scores meaningfully above the hollow one
 * and neither lands in the wrong band. "Meaningfully" is a gap of at least 1 —
 * a tie means the rubric could not tell them apart, which for this criterion is
 * the same as failing.
 *
 * WHAT A FAILURE HERE MEANS, AND WHAT IT DOES NOT
 *   It is one rater, on one pair of replies, for one item. It does not prove the
 *   item is broken. What it does is convert criterion 2 from an opinion about
 *   anchors into an observation about behaviour, on items that two independent
 *   agents read and cleared. A failure is a strong reason for a human to look;
 *   a pass is weak evidence of soundness, because one pair of replies does not
 *   exhaust the space of answers.
 *
 * Usage:
 *   node research/scripts/score-discrimination.mjs --scores <file> --key <file> [--json <file>]
 */

import { readFileSync, existsSync, writeFileSync } from "node:fs";

function arg(name) {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 && process.argv[i + 1] && !process.argv[i + 1].startsWith("--") ? process.argv[i + 1] : null;
}
const SCORES = arg("scores");
const KEY = arg("key");
if (!SCORES || !KEY) {
  console.error("usage: score-discrimination.mjs --scores <file> --key <file>");
  process.exit(2);
}
for (const f of [SCORES, KEY]) {
  if (!existsSync(f)) {
    console.error(`REFUSED: ${f} does not exist.`);
    process.exit(1);
  }
}

function parseArray(path) {
  const raw = readFileSync(path, "utf8");
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  const body = (fenced ? fenced[1] : raw).trim();
  const start = body.indexOf("[");
  const end = body.lastIndexOf("]");
  if (start === -1 || end === -1) return null;
  try {
    return JSON.parse(body.slice(start, end + 1));
  } catch {
    return null;
  }
}

const scores = parseArray(SCORES);
const keyFile = JSON.parse(readFileSync(KEY, "utf8"));
const key = keyFile.key ?? keyFile;

if (!Array.isArray(scores) || scores.length === 0) {
  console.error(`REFUSED: no score array found in ${SCORES}`);
  process.exit(1);
}

const keyById = new Map(key.map((k) => [k.item_id, k]));
const rows = [];
const problems = [];

for (const s of scores) {
  const k = keyById.get(s.item_id);
  if (!k) {
    problems.push(`${s.item_id}: no key entry`);
    continue;
  }
  const r1 = Number(s.response_1_score);
  const r2 = Number(s.response_2_score);
  if (![r1, r2].every((n) => Number.isInteger(n) && n >= 1 && n <= 5)) {
    problems.push(`${s.item_id}: scores must be integers 1-5, got ${s.response_1_score}/${s.response_2_score}`);
    continue;
  }
  const warm = k.response_1 === "warm_hollow" ? r1 : r2;
  const blunt = k.response_1 === "blunt_right" ? r1 : r2;

  const failures = [];
  if (warm >= 4) failures.push("MEASURES POLITENESS");
  if (blunt <= 2) failures.push("PUNISHES TONE");
  if (blunt <= warm) failures.push("INVERTED");

  rows.push({ itemId: s.item_id, warm, blunt, gap: blunt - warm, failures });
}

if (problems.length > 0) {
  console.error(`REFUSED: ${problems.length} problem(s):`);
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}

const missing = key.filter((k) => !scores.some((s) => s.item_id === k.item_id));
if (missing.length > 0) {
  console.error(`REFUSED: ${missing.length} item(s) in the key were not scored: ${missing.map((m) => m.item_id).join(", ")}`);
  process.exit(1);
}

console.log(`\nDiscrimination test — ${rows.length} item(s), all previously cleared by two independent agents\n`);
console.log("item        warm-hollow   blunt-right   gap   verdict");
for (const r of rows) {
  const verdict = r.failures.length === 0 ? "discriminates" : r.failures.join(" + ");
  console.log(`${r.itemId.padEnd(11)} ${String(r.warm).padStart(6)}       ${String(r.blunt).padStart(6)}     ${String(r.gap).padStart(3)}   ${verdict}`);
}

const failed = rows.filter((r) => r.failures.length > 0);
const meanWarm = rows.reduce((a, r) => a + r.warm, 0) / rows.length;
const meanBlunt = rows.reduce((a, r) => a + r.blunt, 0) / rows.length;

console.log("");
console.log(`  mean warm-hollow: ${meanWarm.toFixed(2)}   mean blunt-right: ${meanBlunt.toFixed(2)}   mean gap: ${(meanBlunt - meanWarm).toFixed(2)}`);
console.log(`  items that failed at least one check: ${failed.length} of ${rows.length}`);
if (failed.length > 0) console.log(`    ${failed.map((r) => r.itemId).join(", ")}`);
console.log("");
console.log("One rater, one pair of replies per item. A failure is a strong reason for a human to");
console.log("look; a pass is weak evidence of soundness, because one pair does not exhaust the");
console.log("space of possible answers. Nothing here validates or invalidates an item.");

/**
 * --json: the same decoded result, machine-readable.
 *
 * Anything downstream — a replicate comparison, a summary table in a document —
 * needs these numbers as data. The alternative is reading them off the console
 * and typing them somewhere, which is the DC-20 move that has already put two
 * false findings into a report in this project. The table a human reads and the
 * file a script reads come out of the same decode or the two can disagree.
 */
const JSON_OUT = arg("json");
if (JSON_OUT) {
  writeFileSync(
    JSON_OUT,
    `${JSON.stringify(
      rows.map((r) => ({
        item_id: r.itemId,
        warm_hollow: r.warm,
        blunt_right: r.blunt,
        gap: r.gap,
        failures: r.failures,
        verdict: r.failures.length === 0 ? "discriminates" : r.failures.join(" + "),
      })),
      null,
      2
    )}\n`
  );
  console.log(`\nWrote ${JSON_OUT} (${rows.length} rows).`);
}
