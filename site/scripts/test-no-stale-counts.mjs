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
const SCAN_ROOTS = [
  { dir: join(SITE_ROOT, "src", "app"), ext: ".tsx" },
  { dir: join(SITE_ROOT, "src", "components"), ext: ".tsx" },
  // Insights post sources (docs/ARCHITECTURE_AI_MODEL_WATCH.md section 6): a post states repo-derived counts with {{TOKENS}}, never digits.
  // Present only in a full checkout (Docker has no research/). FACT_CHECK files quote counts on purpose and are not posts.
  { dir: join(SITE_ROOT, "..", "research", "insights"), ext: ".md", skip: /^FACT_CHECK/i },
];

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
//
// The number and its noun may be separated by whitespace (including newlines),
// JSX/HTML tags (`</span>`), JSX whitespace expressions (`{" "}`), `&nbsp;`,
// and up to a few intervening words ("scored", "rated", ...). Without this, a
// count written as `<span>1,325</span> scored entities` slipped past a
// matcher that required the noun to follow the number directly (found
// 2026-10-01 in ai-models/page.tsx). Matching runs over the whole file, not
// line by line, so markup that wraps across lines is also caught.
const GAP = `(?:\\s|<[^>]{0,120}>|\\{[^}]{0,40}\\}|&nbsp;|[A-Za-z-]+\\s+){1,6}?`;
const PATTERNS = [
  {
    name: "stale total-entity count (1,1xx/1,2xx/1,3xx)",
    re: new RegExp(`~?\\b1,[123]\\d\\d\\b${GAP}${CATALOG_NOUN}\\b`, "gi"),
  },
  {
    name: "unformatted stale total-entity count (11xx/12xx/13xx)",
    re: new RegExp(`~?\\b1[123]\\d\\d\\b${GAP}${CATALOG_NOUN}\\b`, "gi"),
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

function collectFiles(dir, ext = ".tsx", skip = null) {
  const results = [];
  if (!existsSync(dir)) return results;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectFiles(full, ext, skip));
    } else if (entry.isFile() && full.endsWith(ext) && !(skip && skip.test(entry.name))) {
      results.push(full);
    }
  }
  return results;
}

/** Every pattern hit in one file's content: [{ lineIdx, name, line }]. Shared by the real scan and the planted probes. */
function scanContent(content, fileRel) {
  const hits = [];
  const lines = content.split("\n");
  for (const { name, re } of PATTERNS) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(content)) !== null) {
      // Report the line the match starts on.
      const lineIdx = content.slice(0, m.index).split("\n").length - 1;
      const line = lines[lineIdx];
      if (isAllowed(fileRel, m[0], line)) continue;
      hits.push({ lineIdx, name, line });
    }
  }
  return hits;
}

// Planted-probe negative controls (a planted defect fails; its removal passes). Run before the real scan: a guard whose probes
// do not behave proves nothing about the files it then reads.
{
  const probes = [
    ["a post stating the scored-entity count as digits", "We score 1,325 entities across the indexes.\n", 1],
    ["a post stating the index-family count in words", "The site has eight indexes.\n", 1],
    ["a post stating a stale per-index count", "Only 21 states are scored.\n", 1],
    ["a post using tokens instead of digits (the defect removed)", "We score {{SCORED_ENTITY_COUNT}} entities across {{INDEX_COUNT}} indexes.\n", 0],
  ];
  for (const [label, text, want] of probes) {
    const got = scanContent(text, "research/insights/probe.md").length > 0 ? 1 : 0;
    if (got !== want) {
      console.error("no-stale-counts: PROBE FAILED (" + label + "): wanted " + (want ? "a hit" : "no hit"));
      process.exit(1);
    }
  }
  console.log("  ok   " + probes.length + " planted probes behave (3 defects trip, 1 clean text passes)");
}

let failures = [];
let filesScanned = 0;

for (const root of SCAN_ROOTS) {
  for (const file of collectFiles(root.dir, root.ext, root.skip)) {
    filesScanned++;
    const fileRel = relative(SITE_ROOT, file).split("\\").join("/");
    const content = readFileSync(file, "utf8");
    for (const { lineIdx, name, line } of scanContent(content, fileRel)) {
      failures.push(`${fileRel}:${lineIdx + 1}  [${name}]  "${line.trim()}"`);
    }
  }
}

console.log(`\nno-stale-counts: scanned ${filesScanned} files under src/app, src/components and research/insights\n`);

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
