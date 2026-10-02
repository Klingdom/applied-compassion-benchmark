#!/usr/bin/env node
/**
 * merge-parts.mjs — reassemble part answers into one subject answer file.
 *
 * Inverse of split-brief.mjs. Reads every <brief_id>-p<k>.answers.json for one
 * brief, checks each declares the same brief_id, concatenates answers in part
 * order, and writes the single answer file ingest-answers.mjs expects. It does
 * NOT validate coverage itself — ingest-answers.mjs is the gate and refuses a
 * missing, duplicate or extra code. Parsing goes through JSON.parse; nothing is
 * retyped. A part that is not valid JSON is a refusal by default.
 *
 * --escape-raw-controls (opt-in, logged): the one repair allowed. Subjects
 * sometimes write a paragraph break as a raw U+000A inside a JSON string instead
 * of the two characters backslash-n. Escaping a raw control character
 * (U+0000-U+001F) that sits INSIDE a string literal is lossless: after parsing,
 * the reply text is identical to what the model wrote. Re-sampling the subject
 * instead would select answers for formatting validity. Nothing outside string
 * literals is touched; if the escaped text still fails to parse, it is a refusal.
 * Every part repaired this way is listed in <dir of out>/../repairs/<name>.repairs.json
 * (kept OUT of the answers directory, which ingest reads in full).
 *
 * Usage:
 *   node research/model-runs/bin/merge-parts.mjs --brief <brief.json> --parts-dir <dir> --out <answers.json> [--escape-raw-controls]
 */
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from "node:fs";
import { join, dirname, basename } from "node:path";

import { escapeRawControlsInStrings } from "../lib/escape-controls.mjs";

function arg(name) {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : undefined;
}
const briefPath = arg("--brief");
const dir = arg("--parts-dir");
const out = arg("--out");
if (!briefPath || !dir || !out) {
  console.error("usage: merge-parts.mjs --brief <brief.json> --parts-dir <dir> --out <answers.json>");
  process.exit(2);
}
const brief = JSON.parse(readFileSync(briefPath, "utf8"));
const { brief_id: briefId } = brief;
const re = new RegExp(`^${briefId}-p(\\d+)\\.answers\\.json$`);
const files = readdirSync(dir)
  .map((f) => [f, re.exec(f)])
  .filter(([, m]) => m)
  .sort((a, b) => Number(a[1][1]) - Number(b[1][1]));
if (files.length === 0) {
  console.error(`refusing: no part answers for ${briefId} in ${dir}`);
  process.exit(1);
}
const allowEscape = process.argv.includes("--escape-raw-controls");
const repairs = [];
const answers = [];
for (const [f] of files) {
  let doc;
  const raw = readFileSync(join(dir, f), "utf8");
  try {
    doc = JSON.parse(raw);
  } catch (e) {
    if (!allowEscape) {
      console.error(`refusing: ${f} is not valid JSON (${e.message})`);
      process.exit(1);
    }
    const [fixed, n] = escapeRawControlsInStrings(raw);
    try {
      doc = JSON.parse(fixed);
    } catch (e2) {
      console.error(`refusing: ${f} is not valid JSON even after escaping ${n} raw control char(s) (${e2.message})`);
      process.exit(1);
    }
    if (n === 0) {
      console.error(`refusing: ${f} failed to parse but has no raw control chars in strings (${e.message})`);
      process.exit(1);
    }
    repairs.push({ part: f, raw_control_chars_escaped: n, original_error: e.message });
  }
  if (doc.brief_id !== briefId) {
    console.error(`refusing: ${f} declares brief_id ${JSON.stringify(doc.brief_id)}, expected ${briefId}`);
    process.exit(1);
  }
  if (!Array.isArray(doc.answers)) {
    console.error(`refusing: ${f} has no answers array`);
    process.exit(1);
  }
  answers.push(...doc.answers);
}
// --repair-miscoded-code (opt-in, logged): a subject copied one opaque code
// wrongly (e.g. a transposed or dropped character). Re-labelling is allowed ONLY
// when all hold: exactly one brief code is unanswered and exactly one answer code
// is not in the brief; their edit distance is <= 2; and the stray answer sits at
// exactly the index the missing code occupies in the brief's item order (parts are
// in-order slices, so merged order == brief order). Anything else is a refusal.
if (process.argv.includes("--repair-miscoded-code")) {
  const briefCodes = (brief.items ?? []).map((i) => i.code);
  const inBrief = new Set(briefCodes);
  const got = new Set(answers.map((a) => a.code));
  const missing = briefCodes.filter((c) => !got.has(c));
  const extra = answers.map((a, i) => [i, a.code]).filter(([, c]) => !inBrief.has(c));
  if (missing.length === 1 && extra.length === 1) {
    const [idx, bad] = extra[0];
    const want = missing[0];
    const d = levenshtein(bad, want);
    const pos = briefCodes.indexOf(want);
    if (d <= 2 && idx === pos) {
      answers[idx] = { ...answers[idx], code: want };
      repairs.push({ part: "(merged)", miscoded_code: bad, restored_code: want, edit_distance: d, index: idx });
    } else {
      console.error(`refusing miscoded-code repair: ${bad} -> ${want} edit distance ${d}, answer index ${idx}, brief index ${pos}`);
      process.exit(1);
    }
  } else if (missing.length || extra.length) {
    console.error(`refusing miscoded-code repair: ${missing.length} missing, ${extra.length} extra (needs exactly 1 and 1)`);
    process.exit(1);
  }
}

function levenshtein(a, b) {
  const m = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) m[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      m[i][j] = Math.min(m[i - 1][j] + 1, m[i][j - 1] + 1, m[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return m[a.length][b.length];
}

writeFileSync(out, JSON.stringify({ brief_id: briefId, answers }, null, 2) + "\n", "utf8");
if (repairs.length) {
  const repDir = join(dirname(out), "..", "repairs");
  mkdirSync(repDir, { recursive: true });
  writeFileSync(join(repDir, `${basename(out)}.repairs.json`), JSON.stringify({ brief_id: briefId, rules: ["escape raw U+0000-U+001F inside JSON string literals only (lossless)", "restore one miscoded answer code: exactly 1 missing + 1 extra, edit distance <= 2, same index as brief order"], repairs }, null, 2) + "\n", "utf8");
}
console.log(`${briefId}: ${files.length} part(s), ${answers.length} answers -> ${out}${repairs.length ? ` (repairs: ${repairs.map((r) => r.raw_control_chars_escaped !== undefined ? `${r.part} escaped ${r.raw_control_chars_escaped} raw control char(s)` : `code ${r.miscoded_code} -> ${r.restored_code} at index ${r.index}`).join("; ")})` : ""}`);
