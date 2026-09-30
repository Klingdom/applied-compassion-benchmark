#!/usr/bin/env node
/**
 * run-helpers.mjs — TRI-10 run mechanics, committed as part of the run record.
 *
 * Three jobs, none of which may be done by hand (DC-20: a hand-retyped brief or
 * result is a defect the report cannot distinguish from a real finding):
 *
 *   merge-answers   4 writer files -> 1 answers file, refusing on duplicates or
 *                   a short count.
 *   split-brief     1 blind brief -> 4 scorer briefs, split on item boundaries
 *                   so the single key still decodes all of them.
 *   merge-scores    4 scorer files -> 1 scores file, same refusals.
 *
 * The briefs are split AFTER the shuffle, not before: building four briefs
 * separately would advance the RNG four times from the same seed and produce a
 * key that decodes none of them.
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const DIR = new URL(".", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const cmd = process.argv[2];

function parseArray(path) {
  const raw = readFileSync(path, "utf8");
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  const body = (fenced ? fenced[1] : raw).trim();
  const a = body.indexOf("["), b = body.lastIndexOf("]");
  if (a === -1 || b === -1) throw new Error(`${path}: no JSON array found`);
  return JSON.parse(body.slice(a, b + 1));
}

function mergeDir(sub, expect, out) {
  const files = readdirSync(join(DIR, sub)).filter((f) => f.endsWith(".json")).sort();
  const all = [];
  const seen = new Set();
  for (const f of files) {
    const rows = parseArray(join(DIR, sub, f));
    for (const r of rows) {
      if (seen.has(r.item_id)) throw new Error(`REFUSED: ${r.item_id} appears in more than one ${sub} file`);
      seen.add(r.item_id);
      all.push(r);
    }
    console.log(`  ${f}: ${rows.length}`);
  }
  if (all.length !== expect) throw new Error(`REFUSED: merged ${all.length} rows from ${sub}, expected ${expect}`);
  writeFileSync(join(DIR, out), `${JSON.stringify(all, null, 2)}\n`);
  console.log(`${out}: ${all.length} rows from ${files.length} file(s)`);
}

if (cmd === "merge-answers") mergeDir("answers", 40, "answers.json");
else if (cmd === "merge-scores") mergeDir("scores", 40, "scores.json");
else if (cmd === "split-brief") {
  const text = readFileSync(join(DIR, "blind", "score-brief.txt"), "utf8");
  const firstItem = text.indexOf("### ");
  const header = text.slice(0, firstItem);
  const sections = text.slice(firstItem).split(/(?=^### )/m).filter((s) => s.trim());
  if (sections.length !== 40) throw new Error(`REFUSED: split found ${sections.length} item sections, expected 40`);
  const n = 4, per = sections.length / n;
  for (let i = 0; i < n; i += 1) {
    const mine = sections.slice(i * per, (i + 1) * per);
    const ids = mine.map((s) => s.match(/^### (\S+)/m)[1]);
    writeFileSync(join(DIR, "blind", `scorer-${i + 1}.txt`), header + mine.join("\n"));
    console.log(`  scorer-${i + 1}.txt: ${ids.join(" ")}`);
  }
  // Every item must appear in exactly one scorer file.
  const back = new Set();
  for (let i = 1; i <= n; i += 1) {
    for (const m of readFileSync(join(DIR, "blind", `scorer-${i}.txt`), "utf8").matchAll(/^### (\S+)/gm)) {
      if (back.has(m[1])) throw new Error(`REFUSED: ${m[1]} is in two scorer files`);
      back.add(m[1]);
    }
  }
  if (back.size !== 40) throw new Error(`REFUSED: ${back.size} items across the scorer files, expected 40`);
  console.log(`split verified: 40 items, each in exactly one scorer file`);
} else {
  console.error("usage: run-helpers.mjs merge-answers | split-brief | merge-scores");
  process.exit(2);
}
