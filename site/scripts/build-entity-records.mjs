#!/usr/bin/env node
/**
 * build-entity-records.mjs — Entity Evidence Record Generator
 *
 * Builds canonical per-entity evidence records for all 1,256 entities across
 * the 8 index files.  Each record stores 40 subdimension scores (assessed where
 * real scores exist, reconstructed otherwise) plus the frozen published
 * composite/band/rank.
 *
 * Subdimension scores/evidence are sourced, per dimension, in this priority
 * order:
 *   1. research/assessments/<slug>-<date>.subdims.json  (structured sidecar —
 *      authoritative when present; matched by the sidecar's own "index" field,
 *      not just slug, so identically-slugged entities in different indexes
 *      never cross-contaminate)
 *   2. research/assessments/<slug>*.md  (markdown "Dimension Details" table)
 *   3. reconstruction — all 5 subdims set equal to the published dimension value.
 * Whichever source is used for a given dimension must still satisfy G2
 * (round(mean(subdims_k),2) == index.scores[k]); a source that fails G2 for a
 * dimension falls through to the next source in priority order.
 *
 * Data model:   docs/DATA_MODEL_SUBDIMENSIONS.md §1.1
 * Architecture: docs/ARCHITECTURE_SUBDIMENSIONS.md §7
 *
 * ── Modes ───────────────────────────────────────────────────────────────────
 *
 *   (default / no flag)  Dry-run: computes records, validates G1/G2/G3,
 *                        writes report to research/entity-records-dryrun.json
 *                        and stdout.  Writes NO entity record files.
 *
 *   --apply              Write entity record files to
 *                        site/src/data/entity-records/<slug>.json for every
 *                        entity that passes G1–G3.  Entities that fail are
 *                        listed and skipped.
 *
 *   --only <slug>        Scope to a single entity slug.
 *   --index <indexSlug>  Scope to one index (e.g. "countries").
 *
 * ── Acceptance (dry-run must show) ─────────────────────────────────────────
 *   0 G1 failures   (composite/rank verbatim copy)
 *   0 G2 failures   (round(mean(subdims_k),2) == index.scores[k])
 *   G3 warning set  == ASSESSOR_OVERRIDE_NAMES set (no NEW divergences beyond
 *                      what validate-indexes.mjs check 10 already tolerates)
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from "node:fs";
import { resolve, join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import { computeCompositeFromDimensions } from "./lib/scoring.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = resolve(__dirname, "..");
const REPO_ROOT = resolve(SITE_ROOT, "..");
const ASSESSMENT_DIR = join(REPO_ROOT, "research", "assessments");
const ENTITY_RECORDS_DIR = join(SITE_ROOT, "src", "data", "entity-records");
const REPORT_PATH = join(REPO_ROOT, "research", "entity-records-dryrun.json");

// ── CLI flags ─────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const APPLY_MODE = args.includes("--apply");
const DRY_RUN = !APPLY_MODE;

const ONLY_SLUG = (() => {
  const idx = args.indexOf("--only");
  return idx !== -1 ? args[idx + 1] : null;
})();

const ONLY_INDEX = (() => {
  const idx = args.indexOf("--index");
  return idx !== -1 ? args[idx + 1] : null;
})();

// ── Git SHA ───────────────────────────────────────────────────────────────────

let GIT_SHA = "unknown";
try {
  GIT_SHA = execSync("git rev-parse --short HEAD", { encoding: "utf8", cwd: REPO_ROOT }).trim();
} catch {
  // Not fatal: generator field uses "unknown".
}

// ── Constants ─────────────────────────────────────────────────────────────────

const SCHEMA_VERSION = "records/v2";
const METHODOLOGY_VERSION = "v1.2";
const DIMENSION_CODES = ["AWR", "EMP", "ACT", "EQU", "BND", "ACC", "SYS", "INT"];

// G3 tolerance: matches validate-indexes.mjs check 10 "warn" threshold.
// A non-override entity with |derivedComposite - published| > G3_TOLERANCE
// gets composite_override set and is reported as a pre-existing divergence.
const G3_TOLERANCE = 1.0;

/**
 * ASSESSOR_OVERRIDE_NAMES — exact copy from validate-indexes.mjs.
 * This is the canonical allowlist.  The migration reads it; it does not modify it.
 * Must stay in sync with validate-indexes.mjs.
 */
const ASSESSOR_OVERRIDE_NAMES = new Set([
  // Original cluster (negative-pressure overrides)
  "Venezuela",
  "Alphabet/Google",
  "Anthropic",
  "Character AI",
  "GEO Group",
  "Core Civic",
  "Walt Disney",
  "Pfizer",
  "Saudi Arabia",
  "State Street",
  "Abbott Laboratories",
  "Microsoft",
  "Nucor",
  "Ecolab",
  // Top-band ceiling overrides (countries) — formula → 84-98, assessor → 70-87
  "Iceland",
  "Finland",
  "Denmark",
  "Luxembourg",
  "Sweden",
  "Norway",
  "Germany",
  "New Zealand",
  // Top-band ceiling overrides (us-states)
  "Vermont",
  "Minnesota",
  // Mid-band assessor judgments
  "Hugging Face",
  "Becton Dickinson",
  // 2026-05-07 cycle — assessor judgment diverges from formula reconstruction
  "Slovakia",
  "TIAA",
  // 2026-05-24 cycle
  "Turkey",
]);

/**
 * 8 dimensions × 5 subdimensions = 40 subdims.
 * Mirrors DIMENSIONS in site/src/data/dimensions.ts.
 * Kept as a plain JS object so scripts can import without TypeScript transpilation.
 */
const DIMENSIONS_MAP = [
  {
    code: "AWR",
    name: "Awareness",
    subdims: [
      { code: "A1", name: "Suffering Detection" },
      { code: "A2", name: "Contextual Sensitivity" },
      { code: "A3", name: "Blind Spot Mitigation" },
      { code: "A4", name: "Signal Amplification" },
      { code: "A5", name: "Anticipatory Awareness" },
    ],
  },
  {
    code: "EMP",
    name: "Empathy",
    subdims: [
      { code: "E1", name: "Affective Resonance" },
      { code: "E2", name: "Perspective-Taking" },
      { code: "E3", name: "Non-Judgment" },
      { code: "E4", name: "Validation" },
      { code: "E5", name: "Cultural Empathy" },
    ],
  },
  {
    code: "ACT",
    name: "Action",
    subdims: [
      { code: "AC1", name: "Responsiveness" },
      { code: "AC2", name: "Proportionality" },
      { code: "AC3", name: "Efficacy" },
      { code: "AC4", name: "Resource Mobilization" },
      { code: "AC5", name: "Follow-Through" },
    ],
  },
  {
    code: "EQU",
    name: "Equity",
    subdims: [
      { code: "EQ1", name: "Universality" },
      { code: "EQ2", name: "Priority for Vulnerable" },
      { code: "EQ3", name: "Bias Awareness" },
      { code: "EQ4", name: "Access Design" },
      { code: "EQ5", name: "Historical Harm Acknowledgment" },
    ],
  },
  {
    code: "BND",
    name: "Boundaries",
    subdims: [
      { code: "B1", name: "Self-Sustainability" },
      { code: "B2", name: "Autonomy Preservation" },
      { code: "B3", name: "Scope Clarity" },
      { code: "B4", name: "Refusal Ethics" },
      { code: "B5", name: "Consent Orientation" },
    ],
  },
  {
    code: "ACC",
    name: "Accountability",
    subdims: [
      { code: "AB1", name: "Harm Acknowledgment" },
      { code: "AB2", name: "Correction Willingness" },
      { code: "AB3", name: "Transparency" },
      { code: "AB4", name: "Systemic Learning" },
      { code: "AB5", name: "Reparative Action" },
    ],
  },
  {
    code: "SYS",
    name: "Systemic Thinking",
    subdims: [
      { code: "S1", name: "Root Cause Orientation" },
      { code: "S2", name: "Long-Term Impact" },
      { code: "S3", name: "Interconnection Awareness" },
      { code: "S4", name: "Structural Critique" },
      { code: "S5", name: "Coalitional Compassion" },
    ],
  },
  {
    code: "INT",
    name: "Integrity",
    subdims: [
      { code: "I1", name: "Consistency Under Pressure" },
      { code: "I2", name: "Non-Performance" },
      { code: "I3", name: "Internal Consistency" },
      { code: "I4", name: "Values Alignment" },
      { code: "I5", name: "Resilience of Care" },
    ],
  },
];

// Fast lookups derived from DIMENSIONS_MAP
const CODE_TO_DIM = {}; // subdim code → parent dim code
const SUBDIM_NAMES = {}; // subdim code → subdim name
const DIM_SUBDIM_CODES = {}; // dim code → [subdim codes in order]

for (const dim of DIMENSIONS_MAP) {
  DIM_SUBDIM_CODES[dim.code] = dim.subdims.map((sd) => sd.code);
  for (const sd of dim.subdims) {
    CODE_TO_DIM[sd.code] = dim.code;
    SUBDIM_NAMES[sd.code] = sd.name;
  }
}

// All valid subdim code patterns for fast regex matching in table rows
const SUBDIM_CODE_RE =
  /^(A[1-5]|E[1-5]|AC[1-5]|EQ[1-5]|B[1-5]|AB[1-5]|S[1-5]|I[1-5])\b/;

/**
 * Index files to process (must match export-public-data.mjs INDEX_FILES).
 */
const INDEX_FILES = [
  { file: "fortune-500.json", indexSlug: "fortune-500", kind: "company" },
  { file: "countries.json", indexSlug: "countries", kind: "country" },
  { file: "us-states.json", indexSlug: "us-states", kind: "us-state" },
  { file: "ai-labs.json", indexSlug: "ai-labs", kind: "ai-lab" },
  { file: "robotics-labs.json", indexSlug: "robotics-labs", kind: "robotics-lab" },
  { file: "global-cities.json", indexSlug: "global-cities", kind: "city" },
  { file: "us-cities.json", indexSlug: "us-cities", kind: "us-city" },
  { file: "universities.json", indexSlug: "universities", kind: "university" },
];

// ── Slug utilities ────────────────────────────────────────────────────────────

/**
 * Convert a name to a URL-safe kebab-case slug.
 * Exact mirror of the slugify function in export-public-data.mjs.
 * HTML entities in names (e.g. "&amp;" "&#x27;") are handled correctly because
 * all non-alphanumeric characters collapse to a single hyphen.
 */
function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Normalise band to Title Case.
 * Mirrors normalizeBand in export-public-data.mjs.
 */
function normalizeBand(raw) {
  const b = String(raw).toLowerCase();
  if (b.startsWith("exempl")) return "Exemplary";
  if (b.startsWith("establ")) return "Established";
  if (b.startsWith("funct")) return "Functional";
  if (b.startsWith("devel")) return "Developing";
  if (b.startsWith("crit")) return "Critical";
  return raw;
}

/**
 * Round to 2 decimal places using standard JS Math.round (no epsilon).
 * This is the canonical subdim→dimension mean rounding per ARCHITECTURE §8.1.
 */
function round2(v) {
  return Math.round(v * 100) / 100;
}

// ── Assessment file indexing ──────────────────────────────────────────────────

/**
 * Extract the entity slug and date from an assessment filename.
 *
 * Pattern A — dated: "<slug>-YYYY-MM-DD.md"
 *   extractSlugAndDate("iran-2026-06-30.md")
 *   → { slug: "iran", date: "2026-06-30" }
 *
 * Pattern B — undated: "<slug>.md"
 *   extractSlugAndDate("venezuela.md")
 *   → { slug: "venezuela", date: null }   (date fetched from frontmatter later)
 */
function extractSlugAndDate(filename) {
  const m = filename.match(/^(.+)-(\d{4}-\d{2}-\d{2})\.md$/);
  if (m) return { slug: m[1], date: m[2] };
  return { slug: filename.replace(/\.md$/, ""), date: null };
}

/**
 * Parse a minimal subset of YAML-style frontmatter (the --- block).
 * Returns { date, confidence } from the frontmatter, with safe defaults.
 * NOT a full YAML parser — handles the simple key: value and key: "value" forms.
 */
function parseFrontmatter(content) {
  const m = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return { date: null, confidence: "medium" };
  const fm = m[1];

  const dateM = fm.match(/^date:\s*"?(\d{4}-\d{2}-\d{2})"?\s*$/m);
  const date = dateM ? dateM[1] : null;

  const confM = fm.match(/^confidence:\s*"?(\w+)"?\s*$/m);
  const rawConf = confM ? confM[1].toLowerCase() : "medium";
  const confidence = ["high", "medium", "low"].includes(rawConf) ? rawConf : "medium";

  return { date, confidence };
}

/**
 * Build a map: slug → [{ filename, date, absPath }]
 * "date" is the date suffix from the filename (YYYY-MM-DD), or extracted from
 * frontmatter for undated files, or "0000-00-00" as a fallback sentinel.
 *
 * We read frontmatter lazily here only for undated files to avoid reading all 732
 * files upfront; most entities need only the filename-date for sorting.
 * Date is used only for sorting to find the "newest" file.
 */
function indexAssessmentFiles() {
  const bySlug = new Map(); // slug → [{filename, date, absPath}]

  let allFiles;
  try {
    allFiles = readdirSync(ASSESSMENT_DIR).filter((f) => f.endsWith(".md"));
  } catch {
    console.warn(`[build-entity-records] WARN: Assessment directory not found: ${ASSESSMENT_DIR}`);
    return bySlug;
  }

  for (const filename of allFiles) {
    const { slug, date: dateFromFilename } = extractSlugAndDate(filename);
    const absPath = join(ASSESSMENT_DIR, filename);

    let date = dateFromFilename;
    if (!date) {
      // Read frontmatter to get date for undated files.
      try {
        const content = readFileSync(absPath, "utf8");
        const fm = parseFrontmatter(content);
        date = fm.date || "0000-00-00";
      } catch {
        date = "0000-00-00";
      }
    }

    if (!bySlug.has(slug)) bySlug.set(slug, []);
    bySlug.get(slug).push({ filename, date, absPath });
  }

  return bySlug;
}

/**
 * For a given entity slug, return the newest assessment entry
 * (by date descending), or null if none found.
 *
 * "Newest" = highest date string (YYYY-MM-DD lexicographic sort works correctly).
 */
function findNewestAssessment(slug, bySlug) {
  const candidates = bySlug.get(slug);
  if (!candidates || candidates.length === 0) return null;
  const sorted = [...candidates].sort((a, b) => b.date.localeCompare(a.date));
  return sorted[0];
}

// ── Structured subdimension sidecars (*.subdims.json) ────────────────────────

/**
 * Build a map: slug → [{ filename, date, indexSlug, absPath }] for every
 * "<slug>-YYYY-MM-DD.subdims.json" sidecar in the assessment directory.
 *
 * indexSlug is read from the sidecar's own "index" field (e.g. "countries",
 * "us-states") — NOT inferred from the filename. This matters because a
 * single slug can legitimately correspond to two different entities in two
 * different indexes (e.g. "georgia" the country vs. "georgia" the US state,
 * which both have -2026-07-02 / -2026-07-19 sidecars in this repo). Sorting
 * candidates purely "by filename date" without also filtering by declared
 * index would silently attach one entity's evidence/scores to the other.
 * We read each sidecar's "index" field up front (cheap: <100 files) so that
 * findNewestSubdimsForIndex() can filter correctly before picking "newest".
 */
function indexSubdimsFiles() {
  const bySlug = new Map(); // slug → [{filename, date, indexSlug, absPath}]

  let allFiles;
  try {
    allFiles = readdirSync(ASSESSMENT_DIR).filter((f) => f.endsWith(".subdims.json"));
  } catch {
    console.warn(`[build-entity-records] WARN: Assessment directory not found: ${ASSESSMENT_DIR}`);
    return bySlug;
  }

  for (const filename of allFiles) {
    const m = filename.match(/^(.+)-(\d{4}-\d{2}-\d{2})\.subdims\.json$/);
    if (!m) {
      console.warn(`[build-entity-records] WARN: Unparseable subdims sidecar filename: ${filename}`);
      continue;
    }
    const [, slug, date] = m;
    const absPath = join(ASSESSMENT_DIR, filename);

    let indexSlug = null;
    try {
      const raw = JSON.parse(readFileSync(absPath, "utf8"));
      indexSlug = typeof raw.index === "string" ? raw.index : null;
    } catch (err) {
      console.warn(`[build-entity-records] WARN: Could not parse sidecar ${filename}: ${err.message}`);
      continue;
    }

    if (!indexSlug) {
      console.warn(`[build-entity-records] WARN: Sidecar ${filename} has no "index" field; skipping.`);
      continue;
    }

    if (!bySlug.has(slug)) bySlug.set(slug, []);
    bySlug.get(slug).push({ filename, date, indexSlug, absPath });
  }

  return bySlug;
}

/**
 * For a given entity slug + the indexSlug currently being processed, return
 * the newest matching sidecar entry (by date descending), or null if none
 * found for that (slug, index) pair.
 */
function findNewestSubdimsForIndex(slug, indexSlug, bySlug) {
  const candidates = bySlug.get(slug);
  if (!candidates || candidates.length === 0) return null;
  const matching = candidates.filter((c) => c.indexSlug === indexSlug);
  if (matching.length === 0) return null;
  const sorted = [...matching].sort((a, b) => b.date.localeCompare(a.date));
  return sorted[0];
}

/**
 * Parse a *.subdims.json sidecar's contents into the same shape parseSubdimTables()
 * produces from markdown tables: a map dimCode → [5 entries in canonical subdim order],
 * so the rest of buildRecord() can treat sidecar-sourced and markdown-sourced subdims
 * identically for the G2 tentative-accept/fallback logic.
 *
 * Unlike the markdown parser, each entry here carries its OWN confidence and
 * assessed_date (sidecars are per-subdim assessed; markdown tables are assessed
 * once per file) plus a pre-shaped evidence[] array (sidecar evidence items are
 * already { tier, url, date, quote } — the canonical record evidence shape — so
 * they are carried through verbatim, never rewritten or backfilled).
 *
 * Same robustness contract as parseSubdimTables(): a dimension is only included
 * if all 5 of its expected subdim codes are present with a valid numeric score;
 * incomplete dimensions are silently dropped and fall through to reconstruction.
 */
function buildSidecarSubdims(raw) {
  const list = Array.isArray(raw.subdimensions) ? raw.subdimensions : [];
  const collected = {}; // dimCode → { subdimCode: entry }

  for (const item of list) {
    const code = item && item.code;
    if (!code || !CODE_TO_DIM[code]) continue; // unknown/malformed code
    const dimCode = CODE_TO_DIM[code];

    const score = typeof item.score === "number" ? item.score : null;
    if (score === null) continue; // unusable row → dimension incomplete → dropped below

    const rawConf = typeof item.confidence === "string" ? item.confidence.toLowerCase() : "";
    const confidence = ["high", "medium", "low"].includes(rawConf) ? rawConf : "medium";

    const evidence = Array.isArray(item.evidence)
      ? item.evidence.map((e) => ({
          tier: typeof e?.tier === "number" ? e.tier : null,
          url: typeof e?.url === "string" ? e.url : "",
          date: typeof e?.date === "string" ? e.date : "",
          quote: typeof e?.quote === "string" ? e.quote : "",
        }))
      : [];

    if (!collected[dimCode]) collected[dimCode] = {};
    collected[dimCode][code] = {
      code,
      score,
      confidence,
      assessed_date: typeof item.assessed_date === "string" ? item.assessed_date : null,
      evidence,
    };
  }

  const result = {};
  for (const [dimCode, subdimMap] of Object.entries(collected)) {
    const expectedCodes = DIM_SUBDIM_CODES[dimCode];
    if (!expectedCodes) continue;
    const allPresent = expectedCodes.every((c) => subdimMap[c] !== undefined);
    if (!allPresent) continue;
    result[dimCode] = expectedCodes.map((c) => subdimMap[c]);
  }

  return result;
}

// ── Subdim table parser ───────────────────────────────────────────────────────

/**
 * Parse the "Dimension Details" section of an assessment file and extract
 * per-subdimension scores.
 *
 * Expected table row format (cols separated by |):
 *   | A1 Suffering Detection | 2/5 | Evidence text | Source text |
 *
 * Returns a map: dimCode → [{ code, score, evidence, source }]
 * Only dimensions where ALL 5 expected subdims are found in the table are included
 * (incomplete sets are silently dropped and the dimension falls through to reconstruction).
 *
 * Robust to:
 *   - Missing Dimension Details section → returns {}
 *   - Abbreviated/prose-only details (no X/5 cells) → returns {}
 *   - Partial dimension tables (< 5 subdims) → that dimension is dropped
 *   - Score values outside [1,5] → that row is skipped (dimension incomplete → dropped)
 *   - Near-floor screening assessments (no Dimension Details section) → returns {}
 */
function parseSubdimTables(content) {
  // Find the Dimension Details section (any heading level, any capitalisation).
  const detailsSectionM = content.match(/^#{1,4}\s+Dimension Details\b/im);
  if (!detailsSectionM) return {};

  const sectionStart = content.indexOf(detailsSectionM[0]);
  const afterSection = content.slice(sectionStart + detailsSectionM[0].length);

  // Scope: from Dimension Details heading to the next same-or-higher-level ## heading.
  // We match "##[^#]" (two hashes, not three) to stop at "## Key Findings" etc.
  // but not at "### AWR" subsections.
  const nextSectionM = afterSection.match(/\n##[^#]/);
  const sectionContent = nextSectionM
    ? afterSection.slice(0, nextSectionM.index)
    : afterSection;

  // Collect all parsed table cells keyed by subdim code.
  // { dimCode: { subdimCode: { code, score, evidence, source } } }
  const collected = {};

  for (const line of sectionContent.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("|")) continue;

    // Split cells; pipe-split gives: ['', col1, col2, col3, col4, '']
    const cells = trimmed.split("|").map((c) => c.trim());
    if (cells.length < 5) continue; // need at least 4 columns

    // Column 1: code + name
    const firstCell = cells[1] || "";
    const codeM = firstCell.match(SUBDIM_CODE_RE);
    if (!codeM) continue;
    const code = codeM[1];

    // Column 2: score in "N/5" format
    const scoreCell = cells[2] || "";
    const scoreM = scoreCell.match(/^(\d+)\/5$/);
    if (!scoreM) continue;
    const score = parseInt(scoreM[1], 10);
    if (score < 1 || score > 5) continue;

    const dimCode = CODE_TO_DIM[code];
    if (!dimCode) continue; // unknown code (header separator or malformed row)

    if (!collected[dimCode]) collected[dimCode] = {};
    // Later rows overwrite earlier rows for the same code (handles duplicates gracefully).
    collected[dimCode][code] = {
      code,
      score,
      evidence: cells[3] || "",
      source: cells[4] || "",
    };
  }

  // Filter: keep only dimensions with all 5 expected subdims present.
  const result = {};
  for (const [dimCode, subdimMap] of Object.entries(collected)) {
    const expectedCodes = DIM_SUBDIM_CODES[dimCode];
    if (!expectedCodes) continue;
    const allPresent = expectedCodes.every((c) => subdimMap[c] !== undefined);
    if (!allPresent) continue;
    // Return in canonical code order (matches DIMENSIONS_MAP).
    result[dimCode] = expectedCodes.map((c) => subdimMap[c]);
  }

  return result;
}

// ── Record builder ────────────────────────────────────────────────────────────

/**
 * Build an entity evidence record.
 *
 * @param {object} opts
 * @param {object}      opts.entity        - Row from index JSON rankings[].
 * @param {string}      opts.indexSlug     - e.g. "countries"
 * @param {string}      opts.kind          - e.g. "country"
 * @param {string}      opts.slug          - Resolved entity slug (disambiguation applied)
 * @param {object|null} opts.parsedSubdims - Result of parseSubdimTables(), or null
 * @param {object|null} opts.sidecarSubdims - Result of buildSidecarSubdims(), or null.
 *   Takes priority over parsedSubdims on a per-dimension basis: a dimension present
 *   here (and passing G2) is sourced from the sidecar even if parsedSubdims also has
 *   a (possibly stale) markdown-table entry for the same dimension.
 * @param {string|null} opts.assessmentPath - Relative path to assessment file, or null
 * @param {string|null} opts.assessedDate  - YYYY-MM-DD from filename or frontmatter
 * @param {string}      opts.assessedConfidence - Confidence from frontmatter
 * @param {string}      opts.generatedAt   - ISO timestamp for this run
 *
 * @returns {{ record: object, meta: object }}
 *   record — the EntityRecord JSON (not yet written to disk in dry-run mode)
 *   meta   — internal validation data for the dry-run report
 */
function buildRecord({
  entity,
  indexSlug,
  kind,
  slug,
  parsedSubdims,
  sidecarSubdims,
  assessmentPath,
  assessedDate,
  assessedConfidence,
  generatedAt,
}) {
  const { name, scores, composite, band, rank } = entity;
  const parsed = parsedSubdims || {};
  const sidecar = sidecarSubdims || {};

  const subdimensions = [];
  const dimResults = {}; // dimCode → 'assessed' | 'reconstructed'
  const dimensionMismatches = []; // dims where parsed/sidecar subdims failed G2

  // ── Subdimension assignment (assessed or reconstructed per dimension) ────────

  for (const dim of DIMENSIONS_MAP) {
    const dimCode = dim.code;
    const indexDimScore = scores[dimCode];
    const sidecarForDim = sidecar[dimCode]; // undefined | array of 5 sidecar rows
    const parsedForDim = parsed[dimCode]; // undefined | array of 5 parsed rows

    let useAssessed = false;
    let assessedSource = null; // 'sidecar' | 'markdown'

    // Sidecar takes priority over markdown for this dimension: it is the
    // authoritative structured source per the task spec (§ "Required behaviour").
    if (sidecarForDim && sidecarForDim.length === 5) {
      const sum = sidecarForDim.reduce((s, sd) => s + sd.score, 0);
      const mean = sum / 5;
      const roundedMean = round2(mean);

      if (Math.abs(roundedMean - indexDimScore) < 1e-9) {
        useAssessed = true;
        assessedSource = "sidecar";
      } else {
        dimensionMismatches.push({
          dim: dimCode,
          source: "sidecar",
          parsedScores: sidecarForDim.map((sd) => sd.score),
          parsedMean: roundedMean,
          indexScore: indexDimScore,
        });
      }
    }

    // Fall back to markdown-table parsing for this dimension only if the sidecar
    // didn't supply (or didn't pass G2 for) this specific dimension.
    if (!useAssessed && parsedForDim && parsedForDim.length === 5) {
      const sum = parsedForDim.reduce((s, sd) => s + sd.score, 0);
      const mean = sum / 5;
      const roundedMean = round2(mean);

      if (Math.abs(roundedMean - indexDimScore) < 1e-9) {
        useAssessed = true;
        assessedSource = "markdown";
      } else {
        // G2 mismatch: stale assessment or re-scored since.  Fall through to reconstruction.
        dimensionMismatches.push({
          dim: dimCode,
          source: "markdown",
          parsedScores: parsedForDim.map((sd) => sd.score),
          parsedMean: roundedMean,
          indexScore: indexDimScore,
        });
      }
    }

    if (useAssessed && assessedSource === "sidecar") {
      // Use real subdim scores + per-subdim confidence/date/evidence straight from
      // the sidecar. Evidence items are already in canonical {tier,url,date,quote}
      // shape — carried through verbatim, never invented or backfilled from markdown.
      for (const sd of sidecarForDim) {
        subdimensions.push({
          code: sd.code,
          dimension: dimCode,
          name: SUBDIM_NAMES[sd.code],
          score: sd.score,
          confidence: sd.confidence,
          assessed_date: sd.assessed_date,
          subdims_source: "assessed",
          evidence: sd.evidence,
        });
      }
      dimResults[dimCode] = "assessed";
    } else if (useAssessed && assessedSource === "markdown") {
      // Use real subdim scores from the markdown assessment.
      for (const sd of parsedForDim) {
        const evidenceText = sd.evidence
          ? sd.evidence + (sd.source ? " (Source: " + sd.source + ")" : "")
          : "";
        subdimensions.push({
          code: sd.code,
          dimension: dimCode,
          name: SUBDIM_NAMES[sd.code],
          score: sd.score,
          confidence: assessedConfidence,
          assessed_date: assessedDate,
          subdims_source: "assessed",
          evidence: evidenceText
            ? [{ tier: 3, url: "", date: assessedDate || "", quote: evidenceText }]
            : [],
        });
      }
      dimResults[dimCode] = "assessed";
    } else {
      // Reconstruct: all five subdims set equal to the published dimension value.
      // For indexDimScore = 0 (harm floor), subdim score is 0 per DATA_MODEL §1.2.
      // mean(five equal values) == that value exactly — G2 trivially satisfied.
      for (const sd of dim.subdims) {
        subdimensions.push({
          code: sd.code,
          dimension: dimCode,
          name: sd.name,
          score: indexDimScore, // preserves 0 for harm floor, ≥1.0 otherwise
          confidence: "low",
          assessed_date: null,
          subdims_source: "reconstructed",
          evidence: [],
        });
      }
      dimResults[dimCode] = "reconstructed";
    }
  }

  // ── Derived dimensions (G2 check) ────────────────────────────────────────────

  const dimensions = {};
  const g2Failures = [];

  for (const dim of DIMENSIONS_MAP) {
    const dimCode = dim.code;
    const dimSubdims = subdimensions.filter((sd) => sd.dimension === dimCode);

    if (dimSubdims.length !== 5) {
      // Should never happen — caught by construction above.
      g2Failures.push({
        dim: dimCode,
        reason: `expected 5 subdims, got ${dimSubdims.length}`,
      });
      dimensions[dimCode] = scores[dimCode]; // fallback to index value
      continue;
    }

    const indexScore = scores[dimCode];
    let derivedDim;

    if (dimResults[dimCode] === "reconstructed") {
      // For reconstructed dims all 5 subdims equal indexScore, so the mean IS
      // indexScore exactly (IEEE 754 exact: 5 * v / 5 = v for all representable v).
      // Store verbatim to avoid JavaScript's half-up rounding issue with 3dp values
      // (e.g. Math.round(1.125 * 100) / 100 = 1.13, not 1.125).
      // ARCHITECTURE §7.5: "set all five subdims equal to index.scores[k] (…)
      // mean is exact" — no round() is applied.
      derivedDim = indexScore;
    } else {
      // For assessed dims (integer subdim scores 1–5): round2 is safe and correct.
      const sum = dimSubdims.reduce((s, sd) => s + sd.score, 0);
      derivedDim = round2(sum / 5);
    }

    dimensions[dimCode] = derivedDim;

    if (Math.abs(derivedDim - indexScore) > 1e-9) {
      g2Failures.push({
        dim: dimCode,
        derived: derivedDim,
        index: indexScore,
        subdimSource: dimResults[dimCode],
      });
    }
  }

  // ── G1 check (trivial by construction) ───────────────────────────────────────
  // composite and rank are copied verbatim from the index; no arithmetic is performed.
  // G1 is always satisfied here; a failure would indicate a bug in this script.

  // ── G3 check (derived composite vs published) ─────────────────────────────────
  //
  // We feed the DERIVED dimensions (which equal the index dims because G2 holds)
  // into the CANONICAL computeCompositeFromDimensions from scoring.mjs.
  // This is identical to what validate-indexes.mjs check 10 computes.
  //
  // For reconstructed entities: derivedDims == indexDims → same result as check 10.
  // For assessed entities: G2 acceptance ensures derivedDims == indexDims → same.
  //
  // Therefore no NEW G3 divergences can appear beyond what check 10 already sees.

  const derivedResult = computeCompositeFromDimensions(dimensions);
  const derivedComposite = derivedResult.composite;
  const g3Diff = Math.abs(derivedComposite - composite);
  const isOverride = ASSESSOR_OVERRIDE_NAMES.has(name);

  // composite_override: set for override entities (always) OR when formula diverges
  // beyond tolerance (pre-existing divergence already visible in validate-indexes).
  const needsCompositeOverride = isOverride || g3Diff > G3_TOLERANCE;
  const compositeOverride = needsCompositeOverride ? composite : null;

  // G3 classification:
  //   'expected'     — entity in ASSESSOR_OVERRIDE_NAMES (expected by design)
  //   'pre-existing' — not in set, but divergence already visible in check 10
  //   'none'         — no divergence or within tolerance
  const g3Class = isOverride
    ? "expected"
    : g3Diff > G3_TOLERANCE
    ? "pre-existing"
    : "none";

  // ── Assemble record ───────────────────────────────────────────────────────────

  const anyAssessed = Object.values(dimResults).some((v) => v === "assessed");

  const record = {
    schema_version: SCHEMA_VERSION,
    methodology_version: METHODOLOGY_VERSION,
    slug,
    name,
    index_slug: indexSlug,
    kind,
    composite,
    band: normalizeBand(band),
    rank,
    composite_override: compositeOverride,
    dimensions,
    subdimensions,
    source_assessment: assessmentPath || null,
    subdims_source: anyAssessed ? "assessed" : "reconstructed",
    generated_at: generatedAt,
    generator: `build-entity-records.mjs@${GIT_SHA}`,
  };

  const meta = {
    slug,
    name,
    indexSlug,
    g1Pass: true, // G1 is always satisfied by construction
    g2Failures, // empty on success; non-empty means a script bug
    g3: {
      derivedComposite,
      publishedComposite: composite,
      diff: g3Diff,
      isOverride,
      hasCompositeOverride: needsCompositeOverride,
      classification: g3Class, // 'expected' | 'pre-existing' | 'none'
    },
    dimensionMismatches, // dims with parsed subdims that failed G2 mean-match
    dimResults, // dimCode → 'assessed' | 'reconstructed'
    anyAssessed,
    assessmentPath: assessmentPath || null,
    assessedDate: assessedDate || null,
  };

  return { record, meta };
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const generatedAt = new Date().toISOString();
  const mode = DRY_RUN ? "DRY-RUN" : "APPLY";

  console.log(
    `\n[build-entity-records] ${mode} — ${generatedAt}` +
    (ONLY_SLUG ? `  (--only ${ONLY_SLUG})` : "") +
    (ONLY_INDEX ? `  (--index ${ONLY_INDEX})` : "")
  );

  // ── Pre-index all assessment files ──────────────────────────────────────────
  console.log("[build-entity-records] Indexing assessment files...");
  const assessmentsBySlug = indexAssessmentFiles();
  console.log(
    `[build-entity-records]   ${[...assessmentsBySlug.values()].reduce((s, a) => s + a.length, 0)} ` +
    `files indexed across ${assessmentsBySlug.size} slugs`
  );

  console.log("[build-entity-records] Indexing structured subdims sidecars...");
  const subdimsBySlug = indexSubdimsFiles();
  console.log(
    `[build-entity-records]   ${[...subdimsBySlug.values()].reduce((s, a) => s + a.length, 0)} ` +
    `sidecars indexed across ${subdimsBySlug.size} slugs`
  );

  // ── Tracking structures ─────────────────────────────────────────────────────
  const allMeta = []; // one entry per entity
  let totalProcessed = 0;
  let totalSkipped = 0; // scoped out by --only / --index

  // Per-dimension counters: { dimCode: { assessed: N, reconstructed: N } }
  const dimCounts = {};
  for (const dim of DIMENSIONS_MAP) {
    dimCounts[dim.code] = { assessed: 0, reconstructed: 0 };
  }

  // ── Process each index ──────────────────────────────────────────────────────
  for (const { file, indexSlug, kind } of INDEX_FILES) {
    if (ONLY_INDEX && indexSlug !== ONLY_INDEX) continue;

    const indexPath = join(SITE_ROOT, "src", "data", "indexes", file);
    let indexData;
    try {
      indexData = JSON.parse(readFileSync(indexPath, "utf8"));
    } catch (err) {
      console.error(`[build-entity-records] ERROR: Cannot read ${file}: ${err.message}`);
      process.exit(1);
    }

    const rankings = indexData.rankings ?? [];

    // Build intra-index slug disambiguation maps (mirrors export-public-data.mjs exactly).
    const slugCounts = new Map();
    for (const row of rankings) {
      const base = row.slug ?? slugify(row.name);
      slugCounts.set(base, (slugCounts.get(base) ?? 0) + 1);
    }

    const slugUsage = new Map();
    let indexProcessed = 0;

    for (const entity of rankings) {
      // Resolve slug with disambiguation.
      const baseSlug = entity.slug ?? slugify(entity.name);
      let slug = baseSlug;
      if ((slugCounts.get(baseSlug) ?? 0) > 1) {
        const used = slugUsage.get(baseSlug) ?? 0;
        slugUsage.set(baseSlug, used + 1);
        slug = used === 0 ? baseSlug : `${baseSlug}-${entity.rank}`;
      }

      // Apply --only scope
      if (ONLY_SLUG && slug !== ONLY_SLUG) {
        totalSkipped++;
        continue;
      }

      // ── Locate newest assessment (markdown fallback source) ──────────────────
      const assessment = findNewestAssessment(slug, assessmentsBySlug);
      let parsedSubdims = {};
      let assessedDate = null;
      let assessedConfidence = "medium";
      let assessmentPath = null;

      if (assessment) {
        assessmentPath = relative(REPO_ROOT, assessment.absPath).replace(/\\/g, "/");
        assessedDate = assessment.date;

        try {
          const content = readFileSync(assessment.absPath, "utf8");
          const fm = parseFrontmatter(content);
          // Use frontmatter date if the filename date is unavailable.
          if (!assessedDate || assessedDate === "0000-00-00") {
            assessedDate = fm.date || null;
          }
          assessedConfidence = fm.confidence || "medium";
          parsedSubdims = parseSubdimTables(content);
        } catch (err) {
          console.warn(
            `[build-entity-records] WARN: Could not read assessment ${assessment.filename}: ${err.message}`
          );
          parsedSubdims = {};
        }
      }

      // ── Locate newest structured subdims sidecar for THIS (slug, index) pair ──
      // Matching is scoped by the sidecar's declared "index" field, not just slug,
      // so that e.g. "georgia" the country and "georgia" the US state (both of
      // which have sidecars in this repo) never cross-contaminate each other.
      const sidecarEntry = findNewestSubdimsForIndex(slug, indexSlug, subdimsBySlug);
      let sidecarSubdims = null;
      let sidecarPath = null;

      if (sidecarEntry) {
        try {
          const raw = JSON.parse(readFileSync(sidecarEntry.absPath, "utf8"));
          sidecarSubdims = buildSidecarSubdims(raw);
          sidecarPath = relative(REPO_ROOT, sidecarEntry.absPath).replace(/\\/g, "/");
        } catch (err) {
          console.warn(
            `[build-entity-records] WARN: Could not read sidecar ${sidecarEntry.filename}: ${err.message}`
          );
          sidecarSubdims = null;
        }
      }

      // ── Build record ─────────────────────────────────────────────────────────
      // source_assessment prefers the sidecar path (authoritative structured
      // source) when one was found and parsed, falling back to the markdown path.
      const { record, meta } = buildRecord({
        entity,
        indexSlug,
        kind,
        slug,
        parsedSubdims,
        sidecarSubdims,
        assessmentPath: sidecarPath || assessmentPath,
        assessedDate,
        assessedConfidence,
        generatedAt,
      });
      meta.sidecarPath = sidecarPath;

      allMeta.push(meta);
      totalProcessed++;
      indexProcessed++;

      // Accumulate per-dimension counts.
      for (const [dimCode, src] of Object.entries(meta.dimResults)) {
        dimCounts[dimCode][src]++;
      }

      // ── Apply: write record file ─────────────────────────────────────────────
      if (!DRY_RUN) {
        const hasFailures = meta.g2Failures.length > 0;
        if (hasFailures) {
          console.error(
            `[build-entity-records] SKIP (G2 failure) ${slug}: ${JSON.stringify(meta.g2Failures)}`
          );
          continue;
        }
        mkdirSync(ENTITY_RECORDS_DIR, { recursive: true });
        const outPath = join(ENTITY_RECORDS_DIR, `${slug}.json`);
        writeFileSync(outPath, JSON.stringify(record, null, 2));
      }
    }

    console.log(`[build-entity-records]   ${indexSlug}: ${indexProcessed} entities`);
  }

  // ── Compute report statistics ───────────────────────────────────────────────

  const g1Failures = allMeta.filter((m) => !m.g1Pass);
  const g2Failures = allMeta.filter((m) => m.g2Failures.length > 0);
  const g3Expected = allMeta.filter((m) => m.g3.classification === "expected");
  const g3PreExisting = allMeta.filter((m) => m.g3.classification === "pre-existing");
  const g3New = allMeta.filter(
    (m) => !m.g3.isOverride && m.g3.diff > 2.0
  ); // Diffs > 2.0 for non-overrides are NEW errors (should be 0)

  const withAnyAssessed = allMeta.filter((m) => m.anyAssessed);
  const fullyReconstructed = allMeta.filter((m) => !m.anyAssessed);
  const withDimensionMismatch = allMeta.filter((m) => m.dimensionMismatches.length > 0);
  const withAssessmentFile = allMeta.filter((m) => m.assessmentPath !== null);
  const withSidecar = allMeta.filter((m) => m.sidecarPath !== null);

  // Per-override entity G3 status
  const overrideEntitiesInReport = g3Expected.map((m) => ({
    name: m.name,
    slug: m.slug,
    index: m.indexSlug,
    publishedComposite: m.g3.publishedComposite,
    derivedComposite: m.g3.derivedComposite,
    diff: Number(m.g3.diff.toFixed(4)),
  }));

  const preExistingEntities = g3PreExisting.map((m) => ({
    name: m.name,
    slug: m.slug,
    index: m.indexSlug,
    publishedComposite: m.g3.publishedComposite,
    derivedComposite: m.g3.derivedComposite,
    diff: Number(m.g3.diff.toFixed(4)),
  }));

  const newG3Entities = g3New.map((m) => ({
    name: m.name,
    slug: m.slug,
    index: m.indexSlug,
    publishedComposite: m.g3.publishedComposite,
    derivedComposite: m.g3.derivedComposite,
    diff: Number(m.g3.diff.toFixed(4)),
  }));

  // ── Acceptance verdict ──────────────────────────────────────────────────────

  // ASSESSOR_OVERRIDE_NAMES entities found in the data
  const overrideNamesFound = new Set(g3Expected.map((m) => m.name));
  const overrideNamesNotFound = [...ASSESSOR_OVERRIDE_NAMES].filter(
    (n) => !overrideNamesFound.has(n)
  );

  const g1Pass = g1Failures.length === 0;
  const g2Pass = g2Failures.length === 0;
  // G3 acceptance: 0 NEW divergences (diff > 2.0 for non-overrides).
  // Pre-existing (1.0 < diff <= 2.0) are already tolerated by validate-indexes check 10.
  const g3AcceptancePass = g3New.length === 0;

  const overallPass = g1Pass && g2Pass && g3AcceptancePass;

  // ── Dimension mismatch details ──────────────────────────────────────────────
  const dimensionMismatchDetails = withDimensionMismatch.flatMap((m) =>
    m.dimensionMismatches.map((mm) => ({
      slug: m.slug,
      name: m.name,
      index: m.indexSlug,
      dim: mm.dim,
      parsedScores: mm.parsedScores,
      parsedMean: mm.parsedMean,
      indexScore: mm.indexScore,
    }))
  );

  // ── Build report ─────────────────────────────────────────────────────────────

  const report = {
    generated_at: generatedAt,
    mode: DRY_RUN ? "dry-run" : "apply",
    git_sha: GIT_SHA,
    scope: {
      only_slug: ONLY_SLUG || null,
      only_index: ONLY_INDEX || null,
    },

    // ── Entity counts ──────────────────────────────────────────────────────────
    totals: {
      entities_processed: totalProcessed,
      entities_skipped_by_scope: totalSkipped,
      with_any_assessed_dim: withAnyAssessed.length,
      fully_reconstructed: fullyReconstructed.length,
      with_assessment_file: withAssessmentFile.length,
      with_subdims_sidecar: withSidecar.length,
      with_dimension_mismatch: withDimensionMismatch.length,
    },

    // ── Per-dimension assessed vs reconstructed counts ─────────────────────────
    per_dimension: Object.fromEntries(
      DIMENSIONS_MAP.map((dim) => [
        dim.code,
        {
          name: dim.name,
          assessed: dimCounts[dim.code].assessed,
          reconstructed: dimCounts[dim.code].reconstructed,
        },
      ])
    ),

    // ── G1 / G2 / G3 invariance results ─────────────────────────────────────
    invariance: {
      G1: {
        failures: g1Failures.length,
        description:
          "composite and rank copied verbatim from index (always 0 by construction)",
        pass: g1Pass,
      },
      G2: {
        failures: g2Failures.length,
        description: "round(mean(subdims_k), 2) == index.scores[k] for all k",
        pass: g2Pass,
        failure_list: g2Failures.map((m) => ({
          slug: m.slug,
          name: m.name,
          failures: m.g2Failures,
        })),
      },
      G3: {
        expected_count: g3Expected.length,
        pre_existing_count: g3PreExisting.length,
        new_errors_count: g3New.length,
        tolerance_used: G3_TOLERANCE,
        description:
          "compositeCore(derivedDims).final vs published composite. " +
          "Expected = in ASSESSOR_OVERRIDE_NAMES. " +
          "Pre-existing = not in set but already warns in validate-indexes check 10. " +
          "New errors (diff > 2.0, non-override) = blockers.",
        acceptance_pass: g3AcceptancePass,
        expected_entities: overrideEntitiesInReport,
        pre_existing_entities: preExistingEntities,
        new_error_entities: newG3Entities,
      },
    },

    // ── ASSESSOR_OVERRIDE_NAMES cross-check ───────────────────────────────────
    override_names_check: {
      in_assessor_override_names: ASSESSOR_OVERRIDE_NAMES.size,
      found_in_indexes: overrideNamesFound.size,
      not_found_in_indexes: overrideNamesNotFound,
    },

    // ── Dimension mismatch details (first 50) ──────────────────────────────────
    dimension_mismatch_sample: dimensionMismatchDetails.slice(0, 50),
    dimension_mismatch_total: dimensionMismatchDetails.length,

    // ── Acceptance verdict ─────────────────────────────────────────────────────
    acceptance: {
      G1_pass: g1Pass,
      G2_pass: g2Pass,
      G3_pass: g3AcceptancePass,
      overall_pass: overallPass,
      summary: overallPass
        ? "PASS — 0 G1 failures, 0 G2 failures, 0 new G3 divergences. " +
          `${g3Expected.length} expected override warnings (ASSESSOR_OVERRIDE_NAMES). ` +
          `${g3PreExisting.length} pre-existing divergences (already in validate-indexes check 10).`
        : "FAIL — see invariance section for blockers.",
    },
  };

  // ── Print summary to stdout ───────────────────────────────────────────────

  const sep = "─".repeat(70);
  console.log(`\n${sep}`);
  console.log(`BUILD-ENTITY-RECORDS ${mode} REPORT`);
  console.log(sep);
  console.log(`Entities processed:       ${totalProcessed}`);
  console.log(`  With assessment file:   ${withAssessmentFile.length}`);
  console.log(`  With any assessed dim:  ${withAnyAssessed.length}`);
  console.log(`  With subdims sidecar:   ${withSidecar.length}`);
  console.log(`  Fully reconstructed:    ${fullyReconstructed.length}`);
  console.log(`  With dim mismatch:      ${withDimensionMismatch.length}`);
  console.log();
  console.log(`Per-dimension assessed / reconstructed:`);
  for (const dim of DIMENSIONS_MAP) {
    const c = dimCounts[dim.code];
    console.log(`  ${dim.code.padEnd(3)} ${dim.name.padEnd(20)} ${String(c.assessed).padStart(4)} assessed  ${String(c.reconstructed).padStart(4)} reconstructed`);
  }
  console.log();
  console.log(`G1 failures:   ${g1Failures.length} (expected: 0)`);
  console.log(`G2 failures:   ${g2Failures.length} (expected: 0)`);
  console.log(`G3 expected:   ${g3Expected.length} (ASSESSOR_OVERRIDE_NAMES)`);
  console.log(`G3 pre-exist.: ${g3PreExisting.length} (not in override set, diff >${G3_TOLERANCE}, already in check-10)`);
  console.log(`G3 new errors: ${g3New.length} (expected: 0)`);
  if (g3PreExisting.length > 0) {
    console.log(`  Pre-existing G3 divergences (not blockers):`);
    for (const e of preExistingEntities) {
      console.log(
        `    ${e.name} (${e.index}): published=${e.publishedComposite} derived=${e.derivedComposite} diff=${e.diff}`
      );
    }
  }
  if (g3New.length > 0) {
    console.log(`  NEW G3 errors (BLOCKERS):`);
    for (const e of newG3Entities) {
      console.log(`    ${e.name} (${e.index}): diff=${e.diff}`);
    }
  }
  console.log();
  console.log(`OVERRIDE NAMES: ${ASSESSOR_OVERRIDE_NAMES.size} in set, ${overrideNamesFound.size} found in indexes`);
  if (overrideNamesNotFound.length > 0) {
    console.log(`  Not found: ${overrideNamesNotFound.join(", ")}`);
  }
  console.log();
  if (overallPass) {
    console.log(`ACCEPTANCE: PASS`);
    console.log(`  ${report.acceptance.summary}`);
  } else {
    console.log(`ACCEPTANCE: FAIL`);
    if (!g1Pass) console.log(`  G1 FAILED: ${g1Failures.length} entities`);
    if (!g2Pass) console.log(`  G2 FAILED: ${g2Failures.length} entities`);
    if (!g3AcceptancePass) console.log(`  G3 NEW ERRORS: ${g3New.length} entities (diff > 2.0, non-override)`);
  }
  console.log(sep);

  // ── Write report file ─────────────────────────────────────────────────────

  if (DRY_RUN) {
    try {
      writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
      console.log(`\n[build-entity-records] Report written to: ${REPORT_PATH}`);
    } catch (err) {
      console.error(`[build-entity-records] ERROR writing report: ${err.message}`);
    }
    console.log(`[build-entity-records] Dry-run complete. No entity record files written.`);
  } else {
    console.log(
      `[build-entity-records] Apply complete. ` +
      `Records written to: ${ENTITY_RECORDS_DIR}`
    );
  }

  // Exit with non-zero if acceptance fails.
  if (!overallPass) process.exit(1);
}

main().catch((err) => {
  console.error("[build-entity-records] Fatal error:", err);
  process.exit(1);
});
