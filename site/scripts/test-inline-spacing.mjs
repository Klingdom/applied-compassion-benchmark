#!/usr/bin/env node
/**
 * test-inline-spacing.mjs -- gate on the BUILT HTML (site/out/**\/*.html) for a missing space after
 * inline emphasis: `</strong>Word`, `</em>Word`, `</b>Word`. React/JSX drops the whitespace after a
 * closing inline tag when the text starts on a new source line, which renders as "Judge.Each reply".
 *
 * Fix in the JSX with an explicit {" "} after the closing tag.
 *
 * Scope: <script>, <style> and <title> bodies are removed before scanning, and only literal closing
 * tags in markup are matched, so URLs and attribute values are never examined.
 *
 * V8 (a check that cannot fail is not a check): a planted `<strong>x</strong>Word` string must be
 * detected by the scanner, and a floor on the number of HTML files scanned must be met.
 *
 * Usage: node scripts/test-inline-spacing.mjs [--require-out]
 * Without out/ the test prints SKIPPED (exit 0) unless --require-out is given (exit 1).
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname, resolve, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const OUT = join(resolve(here, ".."), "out");
const FILE_FLOOR = 100;
const requireOut = process.argv.includes("--require-out");

export function findViolations(html) {
  const text = html
    .replace(/<script\b[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[\s\S]*?<\/style>/gi, "")
    .replace(/<title\b[\s\S]*?<\/title>/gi, "")
    // attribute values (href, content, data-*) are never prose
    .replace(/(\s[\w:.-]+)=(?:"[^"]*"|'[^']*')/g, "$1");
  const found = [];
  const re = /<\/(strong|em|b)>(?=[A-Za-z])/g;
  let m;
  while ((m = re.exec(text))) {
    const start = Math.max(0, m.index - 40);
    found.push(text.slice(start, m.index + m[0].length + 30).replace(/\s+/g, " "));
  }
  return found;
}

function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, acc);
    else if (name.endsWith(".html")) acc.push(p);
  }
  return acc;
}

// Positive control first: the scanner must catch a planted defect and pass a clean string.
const planted = findViolations("<p><strong>Judge.</strong>Each reply is rated.</p>");
if (planted.length !== 1) {
  console.error("FAIL positive control: planted `</strong>Each` was not detected");
  process.exit(1);
}
const clean = findViolations(
  '<title>a</title><script>x="</strong>Bad"</script><p><strong>Ok.</strong> Fine <a href="/x/</strong>y">l</a><em>a</em>, b<b>c</b></p>',
);
if (clean.length !== 0) {
  console.error("FAIL negative control: clean/excluded markup was flagged: " + JSON.stringify(clean));
  process.exit(1);
}
console.log("  ok   positive and negative controls");

if (!existsSync(OUT)) {
  if (requireOut) {
    console.error("FAIL site/out is missing and --require-out was given");
    process.exit(1);
  }
  console.log("SKIPPED inline-spacing: site/out not found (run `npm run build` first)");
  process.exit(0);
}

const files = walk(OUT);
if (files.length < FILE_FLOOR) {
  console.error(`FAIL only ${files.length} HTML files under out/ (floor ${FILE_FLOOR}); is the tree truncated?`);
  process.exit(1);
}

// Dated waiver (D-61, 2026-10-22, owner: founder; backlog SPECIAL-MD-RENDER). The special briefings are compiled
// from markdown by scripts/build-special-briefings.mjs, whose inline-emphasis rule turns "_" inside URLs and code into
// <em>. Fixing it regenerates published briefing files under site/src/data/special-briefings/ (one of them is the held
// America-at-250 file), so it is a founder decision. The waiver is a ratchet: it fails if the waived count grows above
// the count measured on 2026-10-22, and it expires on WAIVER_EXPIRES.
const WAIVED_PREFIX = join("updates", "special") + sep;
const WAIVER_EXPIRES = "2026-11-30";
const WAIVED_BASELINE = 24; // measured 2026-10-22 on the full out tree (node scripts/test-inline-spacing.mjs)
const today = new Date().toISOString().slice(0, 10);

let failures = 0;
let waived = 0;
for (const f of files) {
  const rel = relative(OUT, f);
  for (const ctx of findViolations(readFileSync(f, "utf8"))) {
    if (rel.startsWith(WAIVED_PREFIX) && today <= WAIVER_EXPIRES) { waived += 1; continue; }
    failures += 1;
    console.error(`FAIL ${rel}: missing space after inline emphasis: ...${ctx}...`);
  }
}
if (waived > WAIVED_BASELINE) {
  console.error(`FAIL waived special-briefing occurrences grew: ${waived} > baseline ${WAIVED_BASELINE} (SPECIAL-MD-RENDER)`);
  failures += 1;
} else if (waived) {
  console.log(`  waived ${waived} occurrence(s) under updates/special/ until ${WAIVER_EXPIRES} (SPECIAL-MD-RENDER; baseline ${WAIVED_BASELINE})`);
}
if (failures) {
  console.error(`\n${failures} missing-space occurrence(s). Add {" "} after the closing tag in the JSX.`);
  process.exit(1);
}
console.log(`  ok   ${files.length} HTML files scanned, no missing space after </strong>, </em>, </b>`);
