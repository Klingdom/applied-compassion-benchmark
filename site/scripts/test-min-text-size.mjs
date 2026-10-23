#!/usr/bin/env node
// Guard (D-61 visual loops): no Tailwind arbitrary font size below 12px in site/src/**/*.tsx.
// Catches text-[0.7rem], text-[.72rem], text-[0.6875rem], text-[11px], text-[10.5px].
// 0.75rem (12px) and above pass. No allowlist: fix the component instead.
//
//   node scripts/test-min-text-size.mjs            # gate (exit 1 on violations)
//   node scripts/test-min-text-size.mjs --count    # print per-directory counts, exit 0

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const SRC = join(dirname(fileURLToPath(import.meta.url)), "..", "src");
const MIN_PX = 12;
const MIN_FILES = 100; // floor: a broken walk must not pass vacuously

// text-[<number>rem|px]; lookbehind-free, matches inside any className string.
const RE = /text-\[(\d*\.?\d+)(rem|px)\]/g;

export function findViolations(source) {
  const out = [];
  source.split(/\r?\n/).forEach((line, i) => {
    RE.lastIndex = 0;
    let m;
    while ((m = RE.exec(line))) {
      const px = m[2] === "rem" ? parseFloat(m[1]) * 16 : parseFloat(m[1]);
      if (px < MIN_PX - 1e-9) out.push({ line: i + 1, token: m[0] });
    }
  });
  return out;
}

function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, acc);
    else if (p.endsWith(".tsx")) acc.push(p);
  }
  return acc;
}

// Controls
let controlFail = false;
const check = (label, ok) => {
  if (!ok) {
    console.error(`FAIL control: ${label}`);
    controlFail = true;
  }
};
check("positive: text-[0.7rem] caught", findViolations('<p className="text-[0.7rem]">').length === 1);
check("positive: text-[.72rem] caught", findViolations('<p className="a text-[.72rem] b">').length === 1);
check("positive: text-[11px] caught", findViolations('<p className="text-[11px]">').length === 1);
check("positive: two on one line", findViolations('"text-[0.6rem] text-[0.7rem]"').length === 2);
check("negative: text-[0.75rem] passes", findViolations('<p className="text-[0.75rem]">').length === 0);
check("negative: text-[0.8125rem] passes", findViolations('<p className="text-[0.8125rem]">').length === 0);
check("negative: text-[12px] passes", findViolations('<p className="text-[12px]">').length === 0);
check("negative: text-[1.1rem] passes", findViolations('<p className="text-[1.1rem]">').length === 0);
if (controlFail) process.exit(1);

const files = walk(SRC);
if (files.length < MIN_FILES) {
  console.error(`FAIL: only ${files.length} .tsx files scanned under src (floor ${MIN_FILES})`);
  process.exit(1);
}

const hits = [];
for (const f of files) {
  const rel = relative(join(SRC, ".."), f).replace(/\\/g, "/");
  for (const v of findViolations(readFileSync(f, "utf8"))) hits.push({ file: rel, ...v });
}

if (process.argv.includes("--count")) {
  const by = {};
  for (const h of hits) {
    const parts = h.file.split("/"); // src/<area>/<sub>/...
    const key = parts.slice(0, parts[1] === "app" || parts[1] === "components" ? 3 : 2).join("/");
    by[key] = (by[key] || 0) + 1;
  }
  console.log(`scanned ${files.length} files, ${hits.length} violations`);
  for (const [k, n] of Object.entries(by).sort((a, b) => b[1] - a[1])) console.log(`${String(n).padStart(5)}  ${k}`);
  process.exit(0);
}

if (hits.length) {
  console.error(`FAIL: ${hits.length} arbitrary font size(s) below ${MIN_PX}px:`);
  for (const h of hits) console.error(`  ${h.file}:${h.line}  ${h.token}`);
  process.exit(1);
}
console.log(`ok: ${files.length} .tsx files scanned, no text below ${MIN_PX}px`);
