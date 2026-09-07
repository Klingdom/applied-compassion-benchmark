/**
 * product-separation.mjs — pure detection logic for the CB-MODEL three-product
 * separation rule (Model Index / AI Labs Index / Deployed AI Audit never merge
 * into one score — `docs/CB_MODEL_INTEGRATION_2026-09-06.md` README quote:
 * "Never merge model behavior and lab governance into one score.").
 *
 * Kept separate from `validate-product-separation.mjs` (the CLI) so the four
 * checks are independently testable against synthetic fixtures without touching
 * the filesystem — mirrors the split already used by `scoring.mjs` vs its
 * callers, and by `test-entity-records.mjs`'s in-memory index-lookup approach.
 *
 * This module never reads or writes files. It never mutates its inputs.
 *
 * ── Scope note (important) ──────────────────────────────────────────────────
 * Checks 1 and 2 below are scoped to *organisational* indexes (`ai-labs.json`,
 * `fortune-500.json`, `robotics-labs.json`, plus any future model index that
 * declares itself one). They are deliberately NOT run against geographic
 * indexes (`countries.json`, `us-states.json`, `us-cities.json`,
 * `global-cities.json`, `universities.json`).
 *
 * Reason, checked empirically before scoping this way: those indexes contain
 * many legitimate same-name entities by design — "Singapore" is both a country
 * and a global city; "Georgia" is both a country and a US state; "Boston",
 * "Portland", "Seattle" etc. appear in both `us-cities.json` and
 * `global-cities.json` because the two indexes measure different geographic
 * scopes for what can be the same place name. Running the duplicate-name
 * detector unscoped produces ~18 false positives from exactly this pattern
 * (verified against live data during development of this validator). The
 * three-product separation rule this validator exists to enforce is about
 * *company/organisation* identity, not place names, so the scope match is
 * principled, not merely convenient.
 */

// ── Name normalization (checks 1 & 2) ───────────────────────────────────────

// Trailing business-unit qualifier: "Microsoft AI" -> "Microsoft",
// "Amazon AWS AI" -> "Amazon", "Meta AI" -> "Meta", "Figure AI" -> "Figure".
const AI_BUSINESS_UNIT_SUFFIX_RE = /\s+(?:AWS\s+)?AI$/i;

// Generic corporate-entity suffixes. Kept intentionally short: every word here
// was checked against the full ~1,327-row corpus (all eight index files) to
// confirm it does not introduce a new collision beyond the six known groups
// this validator is meant to surface. Do not add a word to this list without
// re-running that check (see test-product-separation.mjs "no unscoped
// collisions" fixture for the harness, and re-run against live data by hand).
const LEGAL_SUFFIX_RE = /\s*,?\s*(Platforms|Holdings|Group)\.?$/i;

// Trailing parenthetical annotation, e.g. "Boston Dynamics (SPOT demo)".
const PARENTHETICAL_SUFFIX_RE = /\s*\([^)]*\)\s*$/;

/**
 * Normalize an entity name for duplicate-publication comparison.
 * Strips a trailing parenthetical annotation, then iteratively strips a
 * trailing AI-business-unit qualifier and/or a small set of generic corporate
 * suffixes, then folds to lowercase alphanumeric-plus-space.
 *
 * This does NOT attempt full legal-entity normalization (no handling of
 * "Inc.", "Corp.", "Ltd." etc.) because the live corpus does not currently
 * need it to reach the six known duplicate groups, and adding broader
 * suffix-stripping increases false-collision risk across ~450 Fortune 500
 * names without a corresponding verified need. If a future entity pair needs
 * broader stripping, extend LEGAL_SUFFIX_RE deliberately and re-verify.
 */
export function normalizeEntityName(name) {
  let n = String(name ?? "").trim();
  n = n.replace(PARENTHETICAL_SUFFIX_RE, "").trim();
  for (let i = 0; i < 3; i++) {
    const before = n;
    n = n.replace(AI_BUSINESS_UNIT_SUFFIX_RE, "").trim();
    n = n.replace(LEGAL_SUFFIX_RE, "").trim();
    if (n === before) break;
  }
  return n.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

/**
 * Known real-world corporate identity aliases that CANNOT be derived from
 * string normalization — no suffix-stripping or fuzzy match turns "Halodi
 * Robotics" into "1X Technologies". This is a maintained fact (1X Technologies
 * is Halodi Robotics's post-rebrand name), not an inference, and is recorded
 * here for the same reason `deployed-ai-audit-subjects.mjs` is a maintained
 * list: an honest, editable fact beats a heuristic that would either miss this
 * pair or falsely match unrelated ones.
 *
 * Keys and values are pre-normalized (output of normalizeEntityName) so this
 * map composes directly with the normalization step above.
 */
export const KNOWN_NAME_ALIASES = {
  "halodi robotics": "1x technologies",
};

/** Normalize, then resolve through the known-alias map. */
export function canonicalizeEntityName(name) {
  const normalized = normalizeEntityName(name);
  return KNOWN_NAME_ALIASES[normalized] ?? normalized;
}

// ── Check 2: cross-index / intra-index duplicate composite publication ─────
//
// D-13 (root DECISIONS.md, status "proposed", cited as governing since
// 2026-08-21/23 per docs/CB_MODEL_INTEGRATION_2026-09-06.md §2.1): "no entity
// may hold more than one published composite anywhere in the Compassion
// Benchmark." This check implements the mechanical half of that rule: it
// finds violations. It does not implement R-SUB-1..4 (which one survives) —
// that is an editorial/founder decision, D-13 is unratified, and this
// validator must not decide it.

/** The three organisational indexes this check is scoped to. See file header. */
export const ORG_DUPLICATE_SCOPE_FILES = [
  "ai-labs.json",
  "fortune-500.json",
  "robotics-labs.json",
];

/**
 * @param {Record<string, {rankings: Array<{name:string, rank:number, composite:number, band?:string}>}>} indexDataByFile
 * @param {string[]} scopeFiles
 * @returns {Array<{canonical:string, crossIndex:boolean, occurrences:Array<{file:string,name:string,rank:number,composite:number,band?:string}>}>}
 */
export function detectDuplicatePublications(indexDataByFile, scopeFiles = ORG_DUPLICATE_SCOPE_FILES) {
  const groups = new Map(); // canonical name -> occurrences[]

  for (const file of scopeFiles) {
    const data = indexDataByFile[file];
    if (!data || !Array.isArray(data.rankings)) continue;
    for (const row of data.rankings) {
      if (!row || typeof row.name !== "string") continue;
      const canonical = canonicalizeEntityName(row.name);
      if (!groups.has(canonical)) groups.set(canonical, []);
      groups.get(canonical).push({
        file,
        name: row.name,
        rank: row.rank,
        composite: row.composite,
        band: row.band,
      });
    }
  }

  const duplicates = [];
  for (const [canonical, occurrences] of groups) {
    if (occurrences.length > 1) {
      const files = new Set(occurrences.map((o) => o.file));
      duplicates.push({ canonical, crossIndex: files.size > 1, occurrences });
    }
  }
  // Stable ordering for deterministic output/tests.
  duplicates.sort((a, b) => a.canonical.localeCompare(b.canonical));
  return duplicates;
}

// ── Check 1: lab/model (or org/org) fusion in a published entity name ──────
//
// README.md (CB-MODEL package) quoted in docs/CB_MODEL_INTEGRATION_2026-09-06.md:
// "Never merge model behavior and lab governance into one score." A row whose
// `name` field itself joins two capitalised identities with a separator is a
// single published composite standing in for two distinct subjects — that is
// the literal violation, independent of which two kinds of subject they are.

/** Files this check scans. Static today; grows automatically once a model
 *  index exists (any index whose meta declares MODEL_INDEX_META_FLAG). */
export const FUSION_SCAN_STATIC_FILES = ["ai-labs.json"];

const FUSION_NAME_RE = /^([A-Za-z][A-Za-z0-9.]{1,})\/([A-Za-z][A-Za-z0-9.]{1,})$/;

function looksCapitalized(token) {
  // "Capitalised" is read loosely here on purpose: stylized brand casing like
  // "xAI" (lowercase leading letter, uppercase internal letters) is a real,
  // currently-published case (xAI/Grok) that a strict /^[A-Z]/ test would miss.
  // The signal we actually need is "this token is a proper-noun-shaped entity
  // token, not a stray lowercase word" — presence of an uppercase letter
  // anywhere in the token satisfies that without excluding "xAI".
  return /[A-Z]/.test(token);
}

/**
 * Small maintained list used ONLY to sub-classify an already-detected fusion
 * as "organisation/model" vs "organisation/organisation" for the report
 * message. It does not affect whether a fusion is flagged — the pattern match
 * above already decided that. An unrecognised token on both sides still
 * reports as a fusion, just labelled organisation/organisation by default
 * (the more conservative reading, since we have no positive evidence it is a
 * model name). Incomplete by construction; extend as new model names publish.
 */
const KNOWN_MODEL_NAME_TOKENS = new Set([
  "grok", "gpt", "gpt3", "gpt4", "gpt5", "chatgpt", "claude", "gemini", "bard",
  "copilot", "llama", "watson", "bixby", "ernie", "palm", "titan", "mistral",
  "phi", "dalle", "sora", "midjourney",
]);

function tokenKey(s) {
  return String(s).toLowerCase().replace(/[^a-z0-9]/g, "");
}

function classifyFusion(left, right) {
  const isModel = KNOWN_MODEL_NAME_TOKENS.has(tokenKey(left)) || KNOWN_MODEL_NAME_TOKENS.has(tokenKey(right));
  return isModel ? "organisation/model fusion" : "organisation/organisation fusion";
}

/**
 * @param {Record<string, any>} indexDataByFile
 * @param {string[]} scanFiles
 * @returns {Array<{file:string,name:string,rank:number,composite:number,left:string,right:string,kind:string}>}
 */
export function detectFusedNames(indexDataByFile, scanFiles) {
  const files = scanFiles ?? [
    ...FUSION_SCAN_STATIC_FILES,
    ...Object.entries(indexDataByFile)
      .filter(([, d]) => d?.meta?.[MODEL_INDEX_META_FLAG] === true)
      .map(([f]) => f),
  ];

  const results = [];
  const seen = new Set();
  for (const file of files) {
    if (seen.has(file)) continue;
    seen.add(file);
    const data = indexDataByFile[file];
    if (!data || !Array.isArray(data.rankings)) continue;
    for (const row of data.rankings) {
      if (!row || typeof row.name !== "string") continue;
      const m = FUSION_NAME_RE.exec(row.name.trim());
      if (!m) continue;
      const [, left, right] = m;
      if (!looksCapitalized(left) || !looksCapitalized(right)) continue;
      results.push({
        file,
        name: row.name,
        rank: row.rank,
        composite: row.composite,
        left,
        right,
        kind: classifyFusion(left, right),
      });
    }
  }
  return results;
}

// ── Check 3: Deployed AI Audit subjects published inside the Labs index ────
// Severity: WARN. See lib/deployed-ai-audit-subjects.mjs for why this is a
// maintained list rather than an inferred check.

/**
 * @param {Array<{name:string, rank:number, composite:number}>} rankings
 * @param {Set<string>} denylistNamesLower
 */
export function detectDeployedAuditSubjects(rankings, denylistNamesLower) {
  const matches = [];
  for (const row of rankings ?? []) {
    if (!row || typeof row.name !== "string") continue;
    if (denylistNamesLower.has(row.name.trim().toLowerCase())) {
      matches.push({ name: row.name, rank: row.rank, composite: row.composite });
    }
  }
  return matches;
}

// ── Check 4: model score published without a product discriminator ─────────
//
// Forward-looking. No index in this repo currently declares itself a model
// index (docs/CB_MODEL_INTEGRATION_2026-09-06.md: "Model Index... Does not
// exist. No file in site/src/data/indexes/ holds a model identity"). The
// convention this check enforces, for whenever that changes: a model index
// sets `meta.isModelIndex = true`, and every row in it must carry an explicit
// product discriminator field so a model snapshot can never be silently
// conflated with an organisation or a deployed product.

export const MODEL_INDEX_META_FLAG = "isModelIndex";

export const DISCRIMINATOR_FIELDS = [
  "modelId", "model_id", "snapshotId", "snapshot_id",
  "productId", "product_id", "product",
];

/**
 * @param {Record<string, any>} indexDataByFile
 * @returns {{vacuous: boolean, checkedFiles: string[], failures: Array<{file:string,name:string,rank:number}>}}
 */
export function checkModelDiscriminator(indexDataByFile) {
  const modelIndexFiles = Object.entries(indexDataByFile)
    .filter(([, d]) => d?.meta?.[MODEL_INDEX_META_FLAG] === true)
    .map(([f]) => f);

  if (modelIndexFiles.length === 0) {
    return { vacuous: true, checkedFiles: [], failures: [] };
  }

  const failures = [];
  for (const file of modelIndexFiles) {
    const data = indexDataByFile[file];
    for (const row of data.rankings ?? []) {
      const hasDiscriminator = DISCRIMINATOR_FIELDS.some(
        (f) => row[f] !== undefined && row[f] !== null && row[f] !== ""
      );
      if (!hasDiscriminator) {
        failures.push({ file, name: row.name, rank: row.rank });
      }
    }
  }
  return { vacuous: false, checkedFiles: modelIndexFiles, failures };
}
