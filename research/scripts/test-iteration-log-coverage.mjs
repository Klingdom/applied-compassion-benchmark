#!/usr/bin/env node
/**
 * test-iteration-log-coverage.mjs — gate for DC-16.
 *
 * DEFECT CLASS (DC-16): work ships carrying an iteration number that has no entry in
 * ITERATION_LOG.md, so the loop's own record silently falls behind the code and docs that
 * reference it.
 *
 * Dated occurrences:
 *   1. 2026-09-23 — commit 9ce57aa3's message says "Record Iterations 26-29"; its diff adds
 *      only 26 and 27. Nothing anywhere held 28 or 29.
 *   2. 2026-09-24 — tools/cb-probe/README.md said "Added in Iteration 32" and
 *      tools/cb-probe/CHANGELOG.md said "Iteration 33", both shipped and committed, while
 *      ITERATION_LOG.md stopped at 27. Six iterations (27b, 28-33) were unlogged.
 *
 * WHAT THIS ASSERTS
 *   A. Every `Iteration N` / `It. N` reference in a tracked text file resolves to a
 *      `## Iteration N` heading in ITERATION_LOG.md.
 *   B. The logged sequence has no hole below its own maximum: if 33 is logged, 1..33 are all
 *      logged. A hole is the footprint of this exact class, because an unlogged iteration is
 *      normally discovered as a gap rather than as a dangling reference.
 *   C. The scan is not vacuous (rule V8: a search that returns nothing proves nothing until
 *      the same search has found a known-present instance). The reference regex must find its
 *      seeded positive controls, and the heading parse must find a plausible number of entries.
 *      If either floor is unmet this exits non-zero with "VACUOUS", never green.
 *
 * WRITING ABOUT A NUMBER YOU DO NOT MEAN TO CITE
 *   The pattern is case-sensitive, so a hypothetical is written in lower case ("a planted
 *   reference to iteration 99") and is ignored. Capitalised means cited, and a citation must
 *   resolve. This gate caught its own author doing it twice: the It. 34 entry quoted two numbers
 *   it was merely describing, and then this very comment did the same once the file became
 *   tracked (the scan reads `git ls-files`, so an untracked script is invisible to it). Both
 *   times the prose was reworded rather than the check loosened.
 *
 * WHAT THIS DELIBERATELY DOES NOT ASSERT
 *   Commit messages. Occurrence 1 lived in a commit message, which is not a tracked file and
 *   cannot be linted after the fact. Check (B) is the substitute: a false "Record Iterations
 *   26-29" leaves a hole at 28-29 in the log, which (B) fails on.
 *
 * Run: node research/scripts/test-iteration-log-coverage.mjs
 */

import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const REPO = path.resolve(new URL('../..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const LOG = path.join(REPO, 'ITERATION_LOG.md');

/** Extensions worth scanning. Binary and generated data files are pointless here. */
const SCAN_EXT = new Set(['.md', '.mjs', '.js', '.ts', '.tsx', '.yml', '.yaml', '.sh', '.conf', '.txt']);

/**
 * Paths excluded from the reference scan, each with a reason.
 * Kept deliberately short: an allowlist is how a gate stops gating.
 */
const EXCLUDE = [
  // The meta-review filenames encode ranges (ITER21-27) and their prose discusses iterations
  // that the log does hold; they are scanned. Nothing is excluded today. Add entries here only
  // with a dated reason.
];

/**
 * Positive controls for check (C). These strings must exist verbatim in the repo, and the
 * reference regex must extract the stated numbers from them. If a future edit removes them the
 * gate fails loudly instead of quietly matching nothing.
 */
const POSITIVE_CONTROLS = [
  // Long form, in the two files whose unlogged references were occurrence 2.
  { file: 'tools/cb-probe/CHANGELOG.md', expectNumber: 33 },
  { file: 'tools/cb-probe/README.md', expectNumber: 32 },
  // Abbreviated form, so tightening the regex can never silently drop `It. N` support.
  { file: 'docs/DEFECT_CLASS_REGISTRY.md', expectNumber: 26 },
];

const MIN_LOGGED_HEADINGS = 20; // the log held 27 when this gate was written
const MIN_REFERENCES = 20; // references found across the repo when this gate was written
const MIN_FILES_WITH_REFERENCES = 3;

/**
 * `Iteration 33`, `Iterations 26-29`, `It. 30`, `It. 21–27`. Case-sensitive on purpose.
 *
 * The abbreviated form REQUIRES its period. An earlier version allowed `It` + optional `s` +
 * optional `.`, which matched the ordinary word "Its" and produced ten false dangling
 * references on first run ("Its 40 subdimension scores", "Its 60.9 comes from…",
 * "Its 2017 Refugee Law"). A gate that cries wolf is a gate that gets ignored, so the
 * looser pattern is not an option.
 */
const REF_RE = /\b(?:Iterations?|It\.)\s+(\d+)(?:\s*(?:-|–|—|\sto\s)\s*(\d+))?/g;

let failures = 0;
const fail = (msg) => {
  failures += 1;
  console.log(`  FAIL: ${msg}`);
};
const pass = (msg) => console.log(`  ok: ${msg}`);

// ---------------------------------------------------------------- source of truth
if (!existsSync(LOG)) {
  console.log(`FAIL: ${LOG} does not exist. This gate cannot degrade to a pass.`);
  process.exit(2);
}
const logText = readFileSync(LOG, 'utf8');
const headings = [...logText.matchAll(/^## Iteration (\d+)([a-z]?)\b/gm)].map((m) => ({
  n: Number(m[1]),
  suffix: m[2] || '',
  label: m[1] + (m[2] || ''),
}));
const loggedNumbers = new Set(headings.map((h) => h.n));

console.log('Check C — the scan is not vacuous (V8)');
if (headings.length < MIN_LOGGED_HEADINGS) {
  fail(
    `VACUOUS: parsed only ${headings.length} iteration headings from ITERATION_LOG.md, ` +
      `floor is ${MIN_LOGGED_HEADINGS}. The heading pattern is probably broken, not the log.`,
  );
} else {
  pass(`parsed ${headings.length} iteration headings (floor ${MIN_LOGGED_HEADINGS})`);
}

// ---------------------------------------------------------------- reference scan
let tracked = [];
try {
  tracked = execFileSync('git', ['ls-files'], { cwd: REPO, encoding: 'utf8' })
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
} catch (err) {
  console.log(`FAIL: could not list tracked files (${err.message}). Refusing to report a pass.`);
  process.exit(2);
}
if (tracked.length < 100) {
  console.log(`FAIL: VACUOUS: git ls-files returned ${tracked.length} paths. Refusing to report a pass.`);
  process.exit(2);
}

const references = []; // { file, line, raw, numbers[] }
for (const rel of tracked) {
  if (!SCAN_EXT.has(path.extname(rel).toLowerCase())) continue;
  if (EXCLUDE.some((p) => rel === p || rel.startsWith(`${p}/`))) continue;
  const abs = path.join(REPO, rel);
  if (!existsSync(abs)) continue; // tracked but deleted in the working tree
  const lines = readFileSync(abs, 'utf8').split(/\r?\n/);
  lines.forEach((line, i) => {
    for (const m of line.matchAll(REF_RE)) {
      const a = Number(m[1]);
      const b = m[2] === undefined ? null : Number(m[2]);
      const nums = b !== null && b >= a && b - a <= 50 ? Array.from({ length: b - a + 1 }, (_, k) => a + k) : [a];
      references.push({ file: rel, line: i + 1, raw: m[0], numbers: nums });
    }
  });
}

const filesWithRefs = new Set(references.map((r) => r.file));
if (references.length < MIN_REFERENCES || filesWithRefs.size < MIN_FILES_WITH_REFERENCES) {
  fail(
    `VACUOUS: found ${references.length} references across ${filesWithRefs.size} files ` +
      `(floors ${MIN_REFERENCES} / ${MIN_FILES_WITH_REFERENCES}). The reference pattern is probably broken.`,
  );
} else {
  pass(`found ${references.length} references across ${filesWithRefs.size} tracked files`);
}

for (const ctl of POSITIVE_CONTROLS) {
  const hit = references.find((r) => r.file === ctl.file && r.numbers.includes(ctl.expectNumber));
  if (hit) pass(`positive control: ${ctl.file} references Iteration ${ctl.expectNumber} (${hit.raw.trim()})`);
  else
    fail(
      `positive control MISSING: expected ${ctl.file} to reference Iteration ${ctl.expectNumber}. ` +
        `Either the file changed or the regex no longer matches — a green run here would be meaningless.`,
    );
}

// ---------------------------------------------------------------- check A
console.log('\nCheck A — every iteration reference resolves to a log entry');
const dangling = new Map(); // n -> [{file,line,raw}]
for (const ref of references) {
  for (const n of ref.numbers) {
    if (!loggedNumbers.has(n)) {
      if (!dangling.has(n)) dangling.set(n, []);
      dangling.get(n).push(ref);
    }
  }
}
if (dangling.size === 0) {
  pass(`all ${references.length} references resolve (highest referenced: ${Math.max(...references.flatMap((r) => r.numbers))})`);
} else {
  for (const [n, refs] of [...dangling.entries()].sort((a, b) => a[0] - b[0])) {
    const where = refs.slice(0, 4).map((r) => `${r.file}:${r.line}`).join(', ');
    fail(
      `Iteration ${n} is referenced by ${refs.length} place(s) (${where}${refs.length > 4 ? ', …' : ''}) ` +
        `but ITERATION_LOG.md has no "## Iteration ${n}" heading. Write the entry — do not renumber a shipped reference.`,
    );
  }
}

// ---------------------------------------------------------------- check B
console.log('\nCheck B — the logged sequence has no hole below its maximum');
const maxLogged = Math.max(...loggedNumbers);
const holes = [];
for (let n = 1; n <= maxLogged; n += 1) if (!loggedNumbers.has(n)) holes.push(n);
if (holes.length === 0) {
  pass(`1..${maxLogged} all present (${loggedNumbers.size} distinct numbers, ${headings.length} headings incl. suffixed)`);
} else {
  fail(
    `ITERATION_LOG.md logs up to ${maxLogged} but is missing ${holes.join(', ')}. ` +
      `An unlogged iteration is DC-16. If a number was deliberately skipped, log a one-line entry saying so.`,
  );
}

// ---------------------------------------------------------------- result
const suffixed = headings.filter((h) => h.suffix);
if (suffixed.length) {
  console.log(
    `\nnote: ${suffixed.length} suffixed heading(s) present (${suffixed.map((h) => h.label).join(', ')}) — ` +
      `used when a number is already fixed by a shipped reference and renumbering would break it.`,
  );
}
console.log(`\n${failures === 0 ? 'PASS' : 'FAIL'} — ${failures} failure(s)`);
process.exit(failures === 0 ? 0 : 1);
