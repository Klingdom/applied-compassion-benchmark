#!/usr/bin/env node
/**
 * reconcile-last-assessed.mjs — repair rotation-state `last_assessed` dates.
 *
 * PROBLEM
 * -------
 * `research/rotation-state.json` carries `last_assessed` per entity. Per
 * `.claude/agents/overnight-assessor.md` §3h this field is owned exclusively by
 * the assessor stage and must record WHEN THE ENTITY WAS ASSESSED.
 *
 * Two ways it drifts:
 *
 *   1. OVERSTATED freshness — the 2026-08-16 founder override batch had
 *      score-updater stamp `last_assessed` with the APPLY date rather than
 *      leaving the assessment date intact. Sixteen entities were affected.
 *      This is the damaging direction: an entity looks freshly assessed, so
 *      the scanner deprioritises it and it goes unexamined for longer.
 *
 *   2. UNDERSTATED freshness — de-seeding studies run by `benchmark-research`
 *      are deliberately barred from writing rotation-state (to avoid
 *      concurrent-write corruption), so entities they assessed still carry an
 *      older date.
 *
 * Both resolve to the same truth: the date of the entity's NEWEST assessment
 * report on disk.
 *
 * SCOPE — deliberately narrow
 * ---------------------------
 * Only touches entities whose CURRENT `last_assessed` has NO matching report
 * file (i.e. the exact cases `validate-rotation-state.mjs` fails on) AND for
 * which at least one real report exists. Entities whose claimed date matches a
 * real report are left alone even if a newer report exists — advancing those is
 * the assessor's job, not a repair script's.
 *
 * Entities with NO report of any kind are left untouched: those are the
 * pre-existing phantom class and need investigation, not a synthesised date.
 *
 * Never invents a date. Every value written is read from a filename on disk.
 *
 * Usage:
 *   node research/scripts/reconcile-last-assessed.mjs            # dry run
 *   node research/scripts/reconcile-last-assessed.mjs --write
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const ROTATION = path.join(ROOT, "research", "rotation-state.json");
const ASSESSMENTS = path.join(ROOT, "research", "assessments");
const WRITE = process.argv.includes("--write");

const rs = JSON.parse(fs.readFileSync(ROTATION, "utf8"));

// Newest report date per slug, from filenames only.
const newest = {};
for (const f of fs.readdirSync(ASSESSMENTS)) {
  const m = f.match(/^(.*)-(\d{4}-\d{2}-\d{2})\.md$/);
  if (!m) continue;
  const [, slug, date] = m;
  if (!newest[slug] || date > newest[slug]) newest[slug] = date;
}

const fixes = [];
for (const [slug, e] of Object.entries(rs.entities)) {
  const claimed = e.last_assessed;
  if (!claimed) continue;
  // Leave alone if the claimed date corresponds to a real report.
  if (fs.existsSync(path.join(ASSESSMENTS, `${slug}-${claimed}.md`))) continue;
  const actual = newest[slug];
  // No report at all => pre-existing phantom. Do not synthesise a date.
  if (!actual || actual === claimed) continue;
  fixes.push({
    slug,
    claimed,
    actual,
    direction: actual < claimed ? "overstated" : "understated",
  });
}

fixes.sort((a, b) => a.slug.localeCompare(b.slug));

for (const f of fixes) {
  console.log(
    `${WRITE ? "FIX " : "WOULD FIX "}${f.slug.padEnd(28)}${f.claimed} -> ${f.actual}  (${f.direction})`,
  );
  if (WRITE) rs.entities[f.slug].last_assessed = f.actual;
}

const over = fixes.filter((f) => f.direction === "overstated").length;
const under = fixes.length - over;
console.log(
  `\n${WRITE ? "Fixed" : "Would fix"} ${fixes.length} (${over} overstated, ${under} understated).`,
);

if (WRITE && fixes.length) {
  fs.writeFileSync(ROTATION, JSON.stringify(rs, null, 2) + "\n");
  console.log(`Wrote ${path.relative(ROOT, ROTATION)}`);
}
