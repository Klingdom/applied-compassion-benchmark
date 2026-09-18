#!/usr/bin/env node
/**
 * test-slug-conventions.mjs — Gate for RS-4a (Iteration 23).
 *
 * Three independent checks, all must pass:
 *
 *   1. SOURCE SCAN — no file under site/scripts/, site/src/lib/, or
 *      research/scripts/ may define its own slug-generation function; every
 *      such function must live in, and be imported from,
 *      site/scripts/lib/slug.mjs. This is what stops a 13th copy of
 *      slugify() from appearing. Two explicit, path-named exceptions (not an
 *      allowlist anyone can extend): the shared module itself, and
 *      site/src/lib/slugify.ts — the pre-existing TypeScript original that
 *      slugifyFolded mirrors (a different module graph — Next.js browser
 *      bundle vs. Node scripts — and out of RS-4a's fixed 12-file scope).
 *      The detector is self-tested against in-memory fixtures (a positive
 *      control: a fixture WITH a reimplementation must be caught before this
 *      gate trusts a "0 found" result on the real repo).
 *
 *   2. GOLDEN TABLE — slugifyFolded/slugifyUnfolded are asserted against
 *      hardcoded expected output for the 16 published non-ASCII entity
 *      names (read live from site/src/data/indexes/*.json, so the set
 *      itself is checked for drift too) plus ASCII sanity cases. Catches a
 *      silent behaviour change to either convention.
 *
 *   3. DIVERGENCE RATCHET — the live set of entities whose page slug
 *      (slugifyFolded) disagrees with their data slug (slugifyUnfolded)
 *      must be a SUBSET of site/scripts/known-slug-divergences.json (dated,
 *      shrink-only, same pattern as known-collisions.json). A NEW name in
 *      the live divergent set that is not already in the ratchet file fails
 *      the gate, naming it. A ratchet entry that has stopped diverging is
 *      reported (not a failure) so the founder can shrink the list.
 *
 * Every check asserts a nonzero/nonvacuous result set where one is expected
 * (V8): a "found nothing" claim is only trusted after this file's own
 * self-test proves the detector or golden table actually work.
 *
 * Run: node site/scripts/test-slug-conventions.mjs
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname, relative, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { slugifyFolded, slugifyUnfolded, rowSlug } from "./lib/slug.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = join(__dirname, "..");
const REPO_ROOT = join(SITE_ROOT, "..");
const INDEXES_DIR = join(SITE_ROOT, "src", "data", "indexes");
const KNOWN_DIVERGENCES_PATH = join(__dirname, "known-slug-divergences.json");

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
  } else {
    failed++;
    console.log(`  FAIL: ${message}`);
  }
}

// ─── Check 1: source scan ───────────────────────────────────────────────────
//
// A "slug function" header is any top-level function/const declaration whose
// name starts with "slugify" or is exactly "foldAccents" (case-sensitive —
// matches this project's own naming, and avoids false positives on unrelated
// identifiers that merely contain the substring "slug", e.g.
// `slugFilesWithDate` in validate-rotation-state.mjs, or `slugCounts`,
// `bySlug` local variables used everywhere for collision bookkeeping).
//
// A header is only a VIOLATION if the function body itself reimplements the
// character-transform (contains the `[^a-z0-9]` kebab-case fingerprint or an
// accent-folding `.normalize(...)` call) rather than delegating to an
// identifier imported from lib/slug.mjs. This lets a file keep a
// thin compatibility wrapper (e.g. model-registry-validator.mjs's exported
// `slugify(value)`, which trims/null-coalesces before calling
// slugifyUnfolded — required because model-releases-validator.mjs and
// model-sources-validator.mjs import `{ slugify }` from that file by name)
// without that wrapper itself being flagged as a 13th implementation.

const SLUG_HEADER_RE =
  /^\s*(?:export\s+)?(?:function\s+(slugify\w*|foldAccents)\s*\(|const\s+(slugify\w*|foldAccents)\s*=\s*(?:\(|function\b))/;
const REIMPLEMENTATION_FINGERPRINT_RE = /\[\^a-z0-9\]|\.normalize\(\s*["'`](?:NFKD|NFD|NFC|NFKC)["'`]\s*\)/;

/**
 * Scans `source` for slug-function headers whose body reimplements the
 * transform. Returns [{ name, line }], 1-indexed lines.
 */
function findLocalSlugImplementations(source) {
  const lines = source.split("\n");
  const violations = [];
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(SLUG_HEADER_RE);
    if (!m) continue;
    const name = m[1] || m[2];
    // Look at the header line plus up to the next 15 lines as the body
    // window — every real implementation and wrapper in this codebase is
    // well under that, and this is a lint-style heuristic, not a parser.
    const window = lines.slice(i, i + 16).join("\n");
    if (REIMPLEMENTATION_FINGERPRINT_RE.test(window)) {
      violations.push({ name, line: i + 1 });
    }
  }
  return violations;
}

// Positive control (V8): the detector must catch a planted reimplementation
// AND must NOT flag a delegating wrapper, before we trust it on real files.
{
  const plantedBad = [
    "export function slugifyPlanted(name) {",
    "  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-');",
    "}",
  ].join("\n");
  const plantedGoodWrapper = [
    "export function slugify(value) {",
    "  return slugifyUnfolded(String(value ?? '').trim());",
    "}",
  ].join("\n");
  const plantedFoldAccents = ["function foldAccents(str) {", "  return str.normalize('NFKD').replace(/x/g, '');", "}"].join("\n");
  const plantedUnrelated = [
    "function slugFilesWithDate(slug, ctx) {",
    "  return ctx.files.filter((f) => f.includes(slug));",
    "}",
  ].join("\n");

  const badHits = findLocalSlugImplementations(plantedBad);
  const wrapperHits = findLocalSlugImplementations(plantedGoodWrapper);
  const foldHits = findLocalSlugImplementations(plantedFoldAccents);
  const unrelatedHits = findLocalSlugImplementations(plantedUnrelated);

  assert(badHits.length === 1 && badHits[0].name === "slugifyPlanted", "detector self-test: catches a planted reimplementation");
  assert(wrapperHits.length === 0, "detector self-test: does NOT flag a delegating wrapper named slugify()");
  assert(foldHits.length === 1 && foldHits[0].name === "foldAccents", "detector self-test: catches a planted foldAccents reimplementation (.normalize fingerprint)");
  assert(unrelatedHits.length === 0, "detector self-test: does NOT flag slugFilesWithDate() (name doesn't start with slugify)");
}

// The two explicit, named, out-of-scope exceptions. Not an allowlist that
// exempts arbitrary files — these are the sole two files whose slug
// function is, respectively, the shared module itself and the canonical
// pre-existing original it mirrors (see module comment above and
// site/scripts/lib/slug.mjs's own header comment).
const SCAN_DIRS = [join(SITE_ROOT, "scripts"), join(SITE_ROOT, "src", "lib"), join(REPO_ROOT, "research", "scripts")];
const EXCLUDED_ABS_PATHS = new Set([join(SITE_ROOT, "scripts", "lib", "slug.mjs"), join(SITE_ROOT, "src", "lib", "slugify.ts")]);

function walk(dir, out) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (entry === "node_modules" || entry === ".next") continue;
      walk(full, out);
    } else if (extname(full) === ".mjs" || extname(full) === ".ts") {
      out.push(full);
    }
  }
}

{
  const scanned = [];
  for (const dir of SCAN_DIRS) walk(dir, scanned);

  // Vacuous-scan guard (V8): if this ever finds close to zero files, the
  // path list above is broken — don't let that silently read as "0
  // violations, all clear".
  assert(scanned.length > 50, `source scan covers a plausible number of files (found ${scanned.length}, expected > 50)`);

  const allViolations = [];
  for (const file of scanned) {
    if (EXCLUDED_ABS_PATHS.has(file)) continue;
    const source = readFileSync(file, "utf8");
    for (const v of findLocalSlugImplementations(source)) {
      allViolations.push({ file: relative(REPO_ROOT, file).replace(/\\/g, "/"), ...v });
    }
  }

  if (allViolations.length > 0) {
    for (const v of allViolations) {
      console.log(`  FAIL: local slug implementation outside lib/slug.mjs — ${v.file}:${v.line} (${v.name})`);
    }
  }
  assert(allViolations.length === 0, `no file outside site/scripts/lib/slug.mjs reimplements a slug function (found ${allViolations.length})`);
}

// ─── Check 2: golden table ──────────────────────────────────────────────────
//
// Read the live non-ASCII entity names from the real index data (so this
// also catches drift in WHICH names are non-ASCII), then assert both
// conventions against hardcoded expected strings (so a silent change to
// either slugifyFolded or slugifyUnfolded is caught, not just internal
// self-consistency).

const INDEX_FILES = [
  "fortune-500.json",
  "countries.json",
  "us-states.json",
  "ai-labs.json",
  "robotics-labs.json",
  "global-cities.json",
  "us-cities.json",
  "universities.json",
];

function loadNonAsciiRows() {
  const rows = [];
  for (const file of INDEX_FILES) {
    const indexSlug = file.replace(/\.json$/, "");
    const data = JSON.parse(readFileSync(join(INDEXES_DIR, file), "utf8"));
    for (const row of data.rankings ?? []) {
      if (typeof row.name === "string" && /[^\x00-\x7F]/.test(row.name)) {
        rows.push({ ...row, indexSlug });
      }
    }
  }
  return rows;
}

// Hardcoded expected output — this is the "golden table" (16 names, dated
// 2026-09-17). If the real catalogue's non-ASCII set ever differs from this
// list, that is itself news (a name was added/removed/renamed) and the gate
// fails loudly below rather than silently re-deriving new expectations.
const GOLDEN_TABLE = [
  { name: "Côte d'Ivoire", folded: "cote-divoire", unfolded: "c-te-d-ivoire" },
  { name: "Bogotá", folded: "bogota", unfolded: "bogot" },
  { name: "Medellín", folded: "medellin", unfolded: "medell-n" },
  { name: "San José", folded: "san-jose", unfolded: "san-jos" },
  { name: "Córdoba", folded: "cordoba", unfolded: "c-rdoba" },
  { name: "Florianópolis", folded: "florianopolis", unfolded: "florian-polis" },
  { name: "São Paulo", folded: "sao-paulo", unfolded: "s-o-paulo" },
  { name: "Belém", folded: "belem", unfolded: "bel-m" },
  { name: "Goiânia", folded: "goiania", unfolded: "goi-nia" },
  { name: "João Pessoa", folded: "joao-pessoa", unfolded: "jo-o-pessoa" },
  { name: "Asunción", folded: "asuncion", unfolded: "asunci-n" },
  { name: "Macapá", folded: "macapa", unfolded: "macap" },
  { name: "Maceió", folded: "maceio", unfolded: "macei" },
  { name: "São Luís", folded: "sao-luis", unfolded: "s-o-lu-s" },
  // These two carry an explicit pinned `slug` (published under the SAME
  // slug regardless of convention — see the rowSlug assertions below).
  // Université Paris Cité's RAW derivation still diverges between
  // conventions (folded drops the accent, unfolded turns each accented
  // character into its own hyphen run) — the pin is doing real work here.
  // Wisconsin–Madison's en dash isn't affected by accent-folding at all, so
  // its raw derivation happens to agree under both conventions anyway; the
  // pin is not strictly load-bearing for that one.
  { name: "Université Paris Cité", folded: "universite-paris-cite", unfolded: "universit-paris-cit" },
  { name: "University of Wisconsin–Madison", folded: "university-of-wisconsin-madison", unfolded: "university-of-wisconsin-madison" },
  // ASCII sanity cases — must not fold/unfold differently since there is
  // nothing to fold, and must exercise the `&` handling difference.
  { name: "AT&T", folded: "atandt", unfolded: "at-t" },
  { name: "3M", folded: "3m", unfolded: "3m" },
];

{
  const rows = loadNonAsciiRows();
  assert(rows.length === 16, `catalogue has exactly 16 published non-ASCII entity names today (found ${rows.length})`);

  const liveNames = new Set(rows.map((r) => r.name));
  const goldenNonAsciiNames = GOLDEN_TABLE.filter((g) => /[^\x00-\x7F]/.test(g.name)).map((g) => g.name);
  assert(goldenNonAsciiNames.length === 16, `golden table carries all 16 non-ASCII names (found ${goldenNonAsciiNames.length})`);
  for (const name of goldenNonAsciiNames) {
    assert(liveNames.has(name), `golden-table name "${name}" is still published (catalogue drift check)`);
  }
  for (const liveName of liveNames) {
    assert(goldenNonAsciiNames.includes(liveName), `live non-ASCII name "${liveName}" is covered by the golden table (new name not yet added to GOLDEN_TABLE)`);
  }

  for (const g of GOLDEN_TABLE) {
    const gotFolded = slugifyFolded(g.name);
    const gotUnfolded = slugifyUnfolded(g.name);
    assert(gotFolded === g.folded, `slugifyFolded("${g.name}") === "${g.folded}" (got "${gotFolded}")`);
    assert(gotUnfolded === g.unfolded, `slugifyUnfolded("${g.name}") === "${g.unfolded}" (got "${gotUnfolded}")`);
  }

  // rowSlug: an explicit pinned slug wins under BOTH conventions.
  const pinnedRow = { name: "Université Paris Cité", slug: "universite-paris-cite" };
  assert(rowSlug(pinnedRow, slugifyFolded) === "universite-paris-cite", "rowSlug() honours an explicit pinned slug under slugifyFolded");
  assert(rowSlug(pinnedRow, slugifyUnfolded) === "universite-paris-cite", "rowSlug() honours an explicit pinned slug under slugifyUnfolded");
}

// ─── Check 3: divergence ratchet ────────────────────────────────────────────

{
  const known = JSON.parse(readFileSync(KNOWN_DIVERGENCES_PATH, "utf8"));
  assert(Array.isArray(known.divergences) && known.divergences.length > 0, "known-slug-divergences.json parses to a non-empty list (vacuous-file guard)");

  const rows = loadNonAsciiRows();
  const liveDivergent = rows
    .filter((row) => rowSlug(row, slugifyFolded) !== rowSlug(row, slugifyUnfolded))
    .map((row) => row.name);

  const knownNames = new Set(known.divergences.map((d) => d.name));
  const liveNamesSet = new Set(liveDivergent);

  const unexpectedNew = liveDivergent.filter((n) => !knownNames.has(n));
  const resolved = [...knownNames].filter((n) => !liveNamesSet.has(n));

  if (unexpectedNew.length > 0) {
    for (const n of unexpectedNew) {
      console.log(`  FAIL: NEW page-slug/data-slug divergence not in known-slug-divergences.json: "${n}"`);
    }
  }
  assert(unexpectedNew.length === 0, `no new slug divergence beyond the ${known.divergences.length}-entry ratchet (found ${unexpectedNew.length} new)`);
  assert(liveDivergent.length <= known.divergences.length, `live divergence count (${liveDivergent.length}) has not grown past the ratchet (${known.divergences.length})`);

  if (resolved.length > 0) {
    console.log(`  INFO: ${resolved.length} ratcheted divergence(s) no longer reproduce — safe to remove from known-slug-divergences.json: ${resolved.join(", ")}`);
  }
}

// ─── Summary ─────────────────────────────────────────────────────────────────

console.log(`\ntest-slug-conventions: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
