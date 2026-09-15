/**
 * test-no-stale-counts.mjs
 *
 * Guard against the recurrence of hard-coded catalogue counts (scored-entity
 * totals, index-family counts, per-index entity counts) in public page copy.
 * These numbers change whenever the catalog grows (new entities, a new
 * index) — copy must derive them from src/data/entityCount.ts and
 * src/data/indexRegistry.ts, never hand-type a literal.
 *
 * Background: iteration 12 (2026-09-14) found several pages still claiming
 * "1,156 entities" / "seven indexes" / "21 U.S. states" / "50 robotics labs"
 * long after the catalog grew past those numbers. This script scans the same
 * literal patterns so a future PR can't silently reintroduce them.
 *
 * Scope: src/app/**\/*.tsx and src/components/**\/*.tsx (the same trees the
 * task that created this guard covered). Not src/data/** — dated JSON
 * content (special briefings, daily briefings, evidence reviews) legitimately
 * describes historical snapshots and is out of scope for this guard.
 */

import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = join(__dirname, "..");
const SCAN_ROOTS = [join(SITE_ROOT, "src", "app"), join(SITE_ROOT, "src", "components")];

// ─── Allowlist ────────────────────────────────────────────────────────────────
// file:substring pairs that are permitted to contain a literal match. Keep
// this list as short as possible — every entry is a place the guard can't
// see stale counts.
//
// media/page.tsx's flagship-report card describes a DATED publication ("The
// State of Institutional Compassion — 2026"), quoting the report's own
// as-published numbers. Retro-editing a dated publication's own cited
// figures is against AUTONOMY.md; this is not a live-catalogue claim.
const ALLOWLIST = [
  { file: "src/app/media/page.tsx", substring: "1,156 institutions" },
  { file: "src/app/media/page.tsx", substring: "scored across seven index families" },
];

// ─── Patterns ─────────────────────────────────────────────────────────────────
// At minimum: stale total-entity counts in the low thousands, stale index
// counts (today 8; "7" was stale as of iteration 12, but "8" itself must
// stay derived so a future 9th index doesn't silently go stale the same
// way), and the two per-index counts that have drifted before.
// Total-entity counts are only flagged when the number is directly attached
// to a catalogue noun (entities/entries/institutions/files) — otherwise
// ordinary 4-digit numbers elsewhere in the codebase (prices, pixel
// dimensions, placeholder text) would false-positive.
const CATALOG_NOUN = "(entities|entries|institutions|files)";
const PATTERNS = [
  {
    name: "stale total-entity count (1,1xx/1,2xx/1,3xx)",
    re: new RegExp(`~?\\b1,[123]\\d\\d\\b\\s+${CATALOG_NOUN}\\b`, "gi"),
  },
  {
    name: "unformatted stale total-entity count (11xx/12xx/13xx)",
    re: new RegExp(`~?\\b1[123]\\d\\d\\b\\s+${CATALOG_NOUN}\\b`, "gi"),
  },
  { name: "hard-coded index-family count", re: /\b(7|seven|8|eight)[- ]ind(ex|ices|exes)\b/gi },
  { name: "stale U.S. states count", re: /\b21 (U\.S\. )?states\b/gi },
  { name: "stale robotics-labs count", re: /\b50 (humanoid |global )?robotics\b/gi },
];

function isAllowed(fileRel, matchedText, line) {
  return ALLOWLIST.some(
    (entry) => entry.file === fileRel && line.includes(entry.substring),
  );
}

function collectFiles(dir) {
  const results = [];
  if (!existsSync(dir)) return results;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectFiles(full));
    } else if (entry.isFile() && full.endsWith(".tsx")) {
      results.push(full);
    }
  }
  return results;
}

let failures = [];
let filesScanned = 0;

for (const root of SCAN_ROOTS) {
  for (const file of collectFiles(root)) {
    filesScanned++;
    const fileRel = relative(SITE_ROOT, file).split("\\").join("/");
    const content = readFileSync(file, "utf8");
    const lines = content.split("\n");

    for (const { name, re } of PATTERNS) {
      lines.forEach((line, i) => {
        re.lastIndex = 0;
        let m;
        while ((m = re.exec(line)) !== null) {
          if (isAllowed(fileRel, m[0], line)) continue;
          failures.push(`${fileRel}:${i + 1}  [${name}]  "${line.trim()}"`);
        }
      });
    }
  }
}

console.log(`\nno-stale-counts: scanned ${filesScanned} files under src/app and src/components\n`);

if (failures.length > 0) {
  console.log(`  FAIL ${failures.length} stale/hard-coded catalogue count(s) found:\n`);
  for (const f of failures) console.log(`    ${f}`);
  console.log(
    `\n  Fix: import SCORED_ENTITY_COUNT_FORMATTED / getIndexEntityCount from ` +
      `@/data/entityCount, or INDEX_COUNT from @/data/indexRegistry, instead of ` +
      `hand-typing the number. If this is a genuinely dated publication quoting ` +
      `its own as-published figures, add it to ALLOWLIST in this script with a ` +
      `comment explaining why.\n`,
  );
  process.exit(1);
}

console.log("  ok   no stale/hard-coded catalogue counts found\n");
process.exit(0);
