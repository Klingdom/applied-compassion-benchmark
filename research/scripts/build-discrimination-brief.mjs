#!/usr/bin/env node
/**
 * build-discrimination-brief.mjs — TRI-9.
 *
 * Turns a set of paired candidate answers into a BLIND scoring brief, and keeps
 * the key separately.
 *
 * WHY
 *   Every pass over the task bank so far has INSPECTED rubrics: agents read the
 *   anchors and judged whether they would discriminate. Nobody has taken the
 *   test. Criterion 2 — "would a warm-but-wrong answer and a blunt-but-right
 *   answer score differently?" — is answerable by demonstration rather than
 *   opinion: write both answers, score them blind, and look.
 *
 *   The prediction is falsifiable, which is the point. If the warm-but-hollow
 *   answer scores 4 or 5, the item measures politeness. If the blunt-but-right
 *   answer scores 1 or 2, it punishes tone rather than substance. Either is a
 *   defect that reading the anchors did not reveal — these eight items were
 *   cleared by two independent agents.
 *
 * THE SEPARATION THAT MAKES IT EVIDENCE
 *   The writer of the answers never sees the anchors, so it cannot aim at them.
 *   The scorer never learns which answer is which, and the order is shuffled
 *   per item so there is no positional pattern to learn. The key lives in a
 *   separate file the scorer is not given.
 *
 * Usage:
 *   node research/scripts/build-discrimination-brief.mjs --answers <file> --out <dir> [--seed <n>]
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BANK = join(__dirname, "..", "..", "site", "src", "data", "model-benchmark", "tasks-v1.json");

function arg(name, fallback = null) {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 && process.argv[i + 1] && !process.argv[i + 1].startsWith("--") ? process.argv[i + 1] : fallback;
}
const ANSWERS = arg("answers");
const OUT = arg("out");
const SEED = Number(arg("seed", "1"));
if (!ANSWERS || !OUT) {
  console.error("usage: build-discrimination-brief.mjs --answers <file> --out <dir> [--seed <n>]");
  process.exit(2);
}
if (!existsSync(ANSWERS)) {
  console.error(`REFUSED: ${ANSWERS} does not exist.`);
  process.exit(1);
}

/** Deterministic so a brief can be rebuilt identically. */
function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Constructs where the test does NOT apply, and why.
 *
 * The experiment assumes warmth and substance are separable, so that a reply
 * can be warm and hollow. For an item where the thing the user asks for IS
 * acknowledgement, that assumption fails: there is no "blunt but right" answer
 * to "my dog died this morning and I do not know what to do with myself". A
 * cold checklist of remains decisions is not a correct answer delivered
 * tersely, it is a wrong answer.
 *
 * Found by running it: EMP-1-A (Grief Response) was the only one of eight items
 * to invert, and reading the rater's justification showed the rubric had scored
 * correctly — warm-but-imperfect above blunt-and-practical — while the test had
 * mislabelled its own conditions. Seven instrumental items discriminated with a
 * mean gap of 2.63; the single relational item did not, because the question it
 * was asked does not make sense for that item.
 *
 * So this warns rather than refuses: the operator may still want the data, but
 * an inversion on one of these is evidence about the test, not the item.
 */
const RELATIONAL_CONSTRUCT = /grief|bereave|numbness|disclosure|presence|distress recognition|perspective taking|dignity/i;

const bank = JSON.parse(readFileSync(BANK, "utf8"));
const raw = readFileSync(ANSWERS, "utf8");
const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
const body = (fenced ? fenced[1] : raw).trim();
let pairs;
try {
  pairs = JSON.parse(body.slice(body.indexOf("["), body.lastIndexOf("]") + 1));
} catch (e) {
  console.error(`REFUSED: could not parse ${ANSWERS} — ${e.message}`);
  process.exit(1);
}
if (!Array.isArray(pairs) || pairs.length === 0) {
  console.error("REFUSED: expected a non-empty array of pairs.");
  process.exit(1);
}

const rng = mulberry32(SEED);
const briefParts = [];
const key = [];
const problems = [];
const warnings = [];

for (const p of pairs) {
  const item = bank.items.find((i) => i.id === p.item_id);
  if (!item) {
    problems.push(`${p.item_id}: not in the task bank`);
    continue;
  }
  const warm = String(p.warm_hollow ?? "").trim();
  const blunt = String(p.blunt_right ?? "").trim();
  if (!warm || !blunt) {
    problems.push(`${p.item_id}: both replies are required`);
    continue;
  }
  if (warm === blunt) {
    problems.push(`${p.item_id}: the two replies are identical, so the comparison proves nothing`);
    continue;
  }

  // Shuffle so "Response 1" is not always the same kind.
  const warmFirst = rng() < 0.5;
  const first = warmFirst ? warm : blunt;
  const second = warmFirst ? blunt : warm;

  briefParts.push(
    [
      `### ${item.id}`,
      "",
      `USER PROMPT: ${String(item.prompt).replace(/\s+/g, " ")}`,
      "",
      "SCORING ANCHORS (verbatim):",
      ...(item.anchors ?? []).map((a) => `  L${a.level}: ${a.description}`),
      "",
      "RESPONSE 1:",
      `  ${first}`,
      "",
      "RESPONSE 2:",
      `  ${second}`,
    ].join("\n")
  );
  if (RELATIONAL_CONSTRUCT.test(String(item.construct ?? ""))) {
    warnings.push(`${item.id} ("${item.construct}"): the requested thing may BE acknowledgement, so "warm but hollow" is not a coherent condition here. An inversion on this item is evidence about the test, not the item.`);
  }
  key.push({ item_id: item.id, response_1: warmFirst ? "warm_hollow" : "blunt_right", response_2: warmFirst ? "blunt_right" : "warm_hollow" });
}

if (problems.length > 0) {
  console.error(`REFUSED: ${problems.length} problem(s):`);
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}

mkdirSync(OUT, { recursive: true });
const briefPath = join(OUT, "score-brief.txt");
const keyPath = join(OUT, "score-key.json");

writeFileSync(
  briefPath,
  [
    "# BLIND SCORING BRIEF.",
    "# Each item gives a user prompt, its five scoring anchors, and two candidate replies.",
    "# Which reply is which is deliberately not stated, and the order varies between items.",
    "",
    briefParts.join("\n\n"),
    "",
  ].join("\n")
);
writeFileSync(keyPath, `${JSON.stringify({ seed: SEED, key }, null, 2)}\n`);

// The brief must not leak the labels.
const briefText = readFileSync(briefPath, "utf8");
for (const label of ["warm_hollow", "blunt_right", "warm but hollow", "blunt but right"]) {
  if (briefText.includes(label)) {
    console.error(`REFUSED: the brief leaks the label "${label}" — a blind scoring brief that names the conditions is not blind.`);
    process.exit(1);
  }
}

console.log(`Brief:  ${briefPath}  (${key.length} item(s))`);
console.log(`Key:    ${keyPath}  — do NOT give this to the scorer`);
const firstWarm = key.filter((k) => k.response_1 === "warm_hollow").length;
console.log(`Order:  warm-hollow is Response 1 in ${firstWarm} of ${key.length}, Response 2 in ${key.length - firstWarm}`);
console.log("Leak check: the brief names neither condition.");
if (warnings.length > 0) {
  console.log("");
  console.log(`SCOPE WARNINGS — ${warnings.length}:`);
  for (const w of warnings) console.log(`  ${w}`);
}
