#!/usr/bin/env node

/**
 * test-evidence-tier-labels.mjs — EV-1 regression gate.
 *
 * EV-1 found the evidence-tier UI map in
 * src/components/updates/briefing/evidence/index.tsx inverted against the
 * documented scale in overnight-assessor.md ("5 = government/court/treaty-body
 * … 1 = trade press/advocacy") and overnight-digest.md ("Tier 5 — strongest
 * evidence"). This test asserts the UI map matches that documented scale
 * exactly, in BOTH directions — tier → label and label → tier — so the two
 * can never silently drift apart again.
 *
 * Why source-text parsing instead of importing the module:
 * evidence/index.tsx contains JSX (SourceChip, EvidenceQuote, …). Node's
 * native TypeScript type-stripping (used elsewhere in this repo, e.g.
 * test-entity-href.mjs) does NOT transform JSX syntax, so `import(...)` on a
 * .tsx file throws before any type-checking even starts — confirmed via
 * `node -e "import('.../evidence/index.tsx')"` → "Unknown file extension
 * .tsx". This test therefore reads the file as text and extracts the three
 * exported Record<number, string> maps mechanically, then diffs them against
 * the documented scale. This is intentionally dumb and hard to fool: it does
 * not re-implement or trust any logic from the file under test.
 *
 * Also asserts:
 *  - TIER_COLORS exists and is keyed 1–5 (a color map inverted the same way
 *    as the labels would keep the same lie in a different channel — the
 *    original EV-1 defect report specifically calls this out)
 *  - TIER_RELIABILITY_CUTOFF_DATE is the exact string "2026-09-17"
 *  - isTierReliable()'s implementation compares against that same constant
 *  - No OTHER file in src/ defines a second Record<number, ...> "TIER_LABELS"
 *    style map that could silently diverge from this one (EntityDetail.tsx's
 *    unrelated Tier-A/B/C/D provenance map is Record<string, ...> and is
 *    intentionally excluded by that shape difference — verified explicitly
 *    below rather than assumed).
 *
 * Exit code 0 = all tests pass, 1 = one or more failures.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_SITE_ROOT = join(__dirname, "..");
const EVIDENCE_FILE = join(
  REPO_SITE_ROOT,
  "src/components/updates/briefing/evidence/index.tsx",
);

let passed = 0;
let failed = 0;

function assert(label, actual, expected) {
  const actualStr = JSON.stringify(actual);
  const expectedStr = JSON.stringify(expected);
  if (actualStr === expectedStr) {
    console.log(`  PASS  ${label}`);
    passed++;
  } else {
    console.error(`  FAIL  ${label}`);
    console.error(`        expected: ${expectedStr}`);
    console.error(`        actual:   ${actualStr}`);
    failed++;
  }
}

function assertTrue(label, condition, detail) {
  if (condition) {
    console.log(`  PASS  ${label}`);
    passed++;
  } else {
    console.error(`  FAIL  ${label}`);
    if (detail) console.error(`        ${detail}`);
    failed++;
  }
}

// ---------------------------------------------------------------------------
// Source-text extraction helpers (mechanical — no trust in the file's own logic)
// ---------------------------------------------------------------------------

/**
 * Extract the body of `export const NAME: Record<number, string> = { ... };`
 * and parse it into a plain object of { [numericKey]: stringValue }.
 * Throws loudly if the export cannot be found — a missing export is itself
 * a failure worth crashing the test suite over (not silently passing).
 */
function extractNumericStringMap(source, constName) {
  const re = new RegExp(
    `export const ${constName}: Record<number, string> = \\{([\\s\\S]*?)\\};`,
  );
  const match = source.match(re);
  if (!match) {
    throw new Error(
      `Could not find "export const ${constName}: Record<number, string> = { ... };" in ${EVIDENCE_FILE}`,
    );
  }
  const body = match[1];
  const entryRe = /(\d+):\s*"((?:[^"\\]|\\.)*)"\s*,?/g;
  const out = {};
  let m;
  while ((m = entryRe.exec(body)) !== null) {
    out[Number(m[1])] = m[2];
  }
  return out;
}

function invert(obj) {
  const out = {};
  for (const [k, v] of Object.entries(obj)) out[v] = Number(k);
  return out;
}

// ---------------------------------------------------------------------------
// Documented scale — the ground truth this test protects.
// Source: .claude/agents/overnight-assessor.md ("5 = government/court/
// treaty-body; 4 = international org / UN mission; 3 = watchdog NGO;
// 2 = top-tier journalism; 1 = trade press/advocacy") and
// .claude/agents/overnight-digest.md ("Tier 5 — strongest evidence").
// ---------------------------------------------------------------------------

const DOCUMENTED_TIER_LABELS = {
  5: "Tier 5 · Gov/Court",
  4: "Tier 4 · UN/IO",
  3: "Tier 3 · NGO",
  2: "Tier 2 · Journalism",
  1: "Tier 1 · Trade/Advocacy",
};

const DOCUMENTED_TIER_SHORT_LABELS = {
  5: "Primary source",
  4: "Cross-referenced",
  3: "NGO",
  2: "Journalism",
  1: "Advocacy",
};

const DOCUMENTED_TIER_ORDER = [5, 4, 3, 2, 1]; // strongest → weakest

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

const source = readFileSync(EVIDENCE_FILE, "utf8");

console.log("\nTIER_LABELS — tier → label direction\n");
const tierLabels = extractNumericStringMap(source, "TIER_LABELS");
assert("TIER_LABELS matches the documented scale exactly", tierLabels, DOCUMENTED_TIER_LABELS);

console.log("\nTIER_LABELS — label → tier direction (reverse lookup)\n");
const tierLabelsInverse = invert(tierLabels);
const documentedInverse = invert(DOCUMENTED_TIER_LABELS);
assert(
  "Every TIER_LABELS value maps back to its own documented tier number",
  tierLabelsInverse,
  documentedInverse,
);

console.log("\nTIER_SHORT_LABELS — tier → label direction\n");
const tierShortLabels = extractNumericStringMap(source, "TIER_SHORT_LABELS");
assert(
  "TIER_SHORT_LABELS matches the documented scale exactly",
  tierShortLabels,
  DOCUMENTED_TIER_SHORT_LABELS,
);

console.log("\nTIER_SHORT_LABELS — label → tier direction (reverse lookup)\n");
const tierShortLabelsInverse = invert(tierShortLabels);
const documentedShortInverse = invert(DOCUMENTED_TIER_SHORT_LABELS);
assert(
  "Every TIER_SHORT_LABELS value maps back to its own documented tier number",
  tierShortLabelsInverse,
  documentedShortInverse,
);

// ---------------------------------------------------------------------------
// TIER_COLORS — a colour map keyed the wrong way round would keep the same
// lie in a different channel (explicit callout in the EV-1 defect report).
// We don't assert specific hex values (that's a design choice, not a
// correctness claim) but DO assert: exactly tiers 1–5 are present, all
// distinct, and — critically — tier 5 (Gov/Court, strongest) and tier 1
// (Trade/Advocacy, weakest) are not accidentally still keyed to each
// other's old positions from the pre-fix inverted map.
// ---------------------------------------------------------------------------

console.log("\nTIER_COLORS — keys and distinctness\n");
const tierColorsRe = /export const TIER_COLORS: Record<number, string> = \{([\s\S]*?)\};/;
const tierColorsMatch = source.match(tierColorsRe);
assertTrue(
  'TIER_COLORS: "export const TIER_COLORS: Record<number, string> = { ... };" found',
  Boolean(tierColorsMatch),
);
const tierColorsBody = tierColorsMatch ? tierColorsMatch[1] : "";
const tierColors = {};
{
  const entryRe = /(\d+):\s*"((?:[^"\\]|\\.)*)"\s*,?/g;
  let m;
  while ((m = entryRe.exec(tierColorsBody)) !== null) {
    tierColors[Number(m[1])] = m[2];
  }
}
assert(
  "TIER_COLORS defines exactly keys 1,2,3,4,5",
  Object.keys(tierColors).map(Number).sort((a, b) => a - b),
  [1, 2, 3, 4, 5],
);
assertTrue(
  "TIER_COLORS values are all distinct (5 unique hex colors for 5 tiers)",
  new Set(Object.values(tierColors)).size === 5,
  `values: ${JSON.stringify(tierColors)}`,
);

// The pre-fix (inverted) map used these exact hex values at these exact
// (wrong) keys. Assert the fixed file does NOT reproduce that inverted
// key→value pairing — i.e. the color channel was actually corrected, not
// just left inverted alongside the corrected labels.
const PRE_FIX_INVERTED_COLORS = {
  1: "#fcd34d",
  2: "#86efac",
  3: "#7dd3fc",
  4: "#a78bfa",
  5: "#94a3b8",
};
assertTrue(
  "TIER_COLORS is not still keyed to the pre-fix inverted mapping",
  JSON.stringify(tierColors) !== JSON.stringify(PRE_FIX_INVERTED_COLORS),
  `tierColors: ${JSON.stringify(tierColors)}`,
);
// And assert it now matches the corrected (re-keyed, same hex values) map.
const CORRECTED_COLORS = {
  5: "#fcd34d",
  4: "#86efac",
  3: "#7dd3fc",
  2: "#a78bfa",
  1: "#94a3b8",
};
assert("TIER_COLORS matches the corrected re-keyed mapping", tierColors, CORRECTED_COLORS);

// ---------------------------------------------------------------------------
// Tier-reliability cutoff (EV-1 requirement #2) — pre-cutoff briefings must
// not show a tier badge, because their sourceTier values were authored under
// an inconsistent mix of both conventions and cannot be trusted under either.
// ---------------------------------------------------------------------------

console.log("\nTier reliability cutoff\n");

const cutoffMatch = source.match(
  /export const TIER_RELIABILITY_CUTOFF_DATE = "([^"]+)";/,
);
assertTrue(
  "TIER_RELIABILITY_CUTOFF_DATE constant found",
  Boolean(cutoffMatch),
);
assert(
  "TIER_RELIABILITY_CUTOFF_DATE is exactly \"2026-09-17\"",
  cutoffMatch ? cutoffMatch[1] : null,
  "2026-09-17",
);

assertTrue(
  "isTierReliable() compares briefingDate against TIER_RELIABILITY_CUTOFF_DATE",
  /briefingDate\s*>=\s*TIER_RELIABILITY_CUTOFF_DATE/.test(source),
);

assertTrue(
  "TIER_UNRELIABLE_NOTICE explanatory copy is exported",
  /export const TIER_UNRELIABLE_NOTICE =/.test(source),
);

// SourceChip must gate its tier badge on tier reliability, not render it
// unconditionally whenever `tier` is present.
assertTrue(
  "SourceChip gates tierColor/tierLabel on isTierReliable(briefingDate), not on tier alone",
  /const tierReliable = isTierReliable\(briefingDate\);[\s\S]{0,120}tier && tierReliable \? TIER_COLORS\[tier\] : null/.test(
    source,
  ),
);

// ---------------------------------------------------------------------------
// No second, divergent numeric tier map anywhere else in src/ (drift guard).
// EntityDetail.tsx's Tier-A/B/C/D provenance chip is a DIFFERENT, unrelated
// concept (string-keyed) — this check is shape-specific (Record<number, ...>)
// so it does not false-positive on that file. Verified as a positive control
// below: the broader "TIER_LABELS" search (no shape filter) DOES find
// EntityDetail.tsx, proving this check would catch a real duplicate if one
// existed with the Record<number, ...> shape.
// ---------------------------------------------------------------------------

console.log("\nNo divergent second numeric tier map elsewhere in src/\n");

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (entry === "node_modules" || entry === ".next") continue;
      walk(full, out);
    } else if (/\.(tsx?|jsx?)$/.test(entry)) {
      out.push(full);
    }
  }
  return out;
}

const SRC_ROOT = join(REPO_SITE_ROOT, "src");
const allSourceFiles = walk(SRC_ROOT);

// Positive control (V8): confirm the unshaped search finds EntityDetail.tsx's
// unrelated TIER_LABELS before we rely on the shaped search finding nothing.
const looseHits = allSourceFiles.filter((f) => {
  if (f === EVIDENCE_FILE) return false;
  const text = readFileSync(f, "utf8");
  return /\bTIER_LABELS\b/.test(text);
});
assertTrue(
  "Positive control: unshaped search DOES find EntityDetail.tsx's unrelated TIER_LABELS (proves the search works)",
  looseHits.some((f) => f.endsWith("EntityDetail.tsx")),
  `looseHits: ${JSON.stringify(looseHits.map((f) => f.replace(REPO_SITE_ROOT, "")))}`,
);

const shapedHits = allSourceFiles.filter((f) => {
  if (f === EVIDENCE_FILE) return false;
  const text = readFileSync(f, "utf8");
  return /(?:TIER_LABELS|TIER_SHORT_LABELS|TIER_COLORS)\s*:\s*Record<number,/.test(text);
});
assertTrue(
  "No file other than evidence/index.tsx defines a Record<number, ...>-shaped TIER_LABELS/TIER_SHORT_LABELS/TIER_COLORS",
  shapedHits.length === 0,
  `shapedHits: ${JSON.stringify(shapedHits.map((f) => f.replace(REPO_SITE_ROOT, "")))}`,
);

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

console.log(`\n${"─".repeat(50)}`);
console.log(`evidence-tier-labels tests: ${passed} passed, ${failed} failed`);

if (failed > 0) {
  console.error("\nOne or more evidence-tier-labels tests FAILED.");
  process.exit(1);
}
console.log("\nAll evidence-tier-labels tests passed.");
