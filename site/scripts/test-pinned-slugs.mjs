#!/usr/bin/env node

/**
 * test-pinned-slugs.mjs — guard for DC-05's link-integrity variant.
 *
 * THE DEFECT CLASS. An index row may declare an explicit `slug` which takes
 * precedence over slugify(name) — used where the legal name slugs badly
 * ("Intuitive Surgical, Inc." -> intuitive-surgical) or where two indexes share
 * a name (phoenix-global-cities, singapore-global-cities, georgia-us-states).
 * `rowSlug()` in src/data/entities.ts honours it, and that is what BUILDS the
 * pages. Any component that re-derives a slug from the NAME therefore links to
 * a URL that does not exist, and the link survives only because nginx happens
 * to carry a 301 for it.
 *
 * RECURRENCE (this is why the guard exists, per selection rule S4):
 *   2026-09-01  26 entities had a record at the declared slug and a page at
 *               slugify(name) — see the comment in src/data/entities.ts:246-250.
 *               Left behind ~15 "Slug-override corrections" rewrites in nginx.
 *   2026-09-14  Phoenix pinned to phoenix-global-cities; /city/phoenix 301'd.
 *   2026-09-16  Singapore pinned to singapore-global-cities; same shape.
 *   2026-09-17  Measured: 34 links wrong in RankingTable/EntitySearch/
 *               NavbarSearch, 77 in IndexPageCharts (which also carried its own
 *               naive slugify, dropping accent folding and "&" -> "and").
 *
 * WHAT THIS CHECKS
 *   1. Fixture non-vacuity — the indexes really do contain rows whose pinned
 *      slug differs from slugify(name). Without this a source scan could pass
 *      forever while verifying nothing (the repo already has one self-declared
 *      "VACUOUS PASS" check; this must not become a second).
 *   2. rowSlug() semantics — explicit slug wins, blank/whitespace falls back.
 *   3. Source scan — no component may re-derive an entity slug from a name, and
 *      no component may define a private slugify().
 *
 * Exit code 0 = pass, 1 = fail.
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

import { slugify } from "../src/lib/slugify.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = join(__dirname, "..");
const INDEXES_DIR = join(SITE_ROOT, "src", "data", "indexes");
const SCAN_ROOTS = [join(SITE_ROOT, "src", "app"), join(SITE_ROOT, "src", "components")];

const INDEX_FILES = [
  "fortune-500.json", "countries.json", "us-states.json", "ai-labs.json",
  "robotics-labs.json", "global-cities.json", "us-cities.json", "universities.json",
];

let passed = 0;
let failed = 0;

function ok(label) { console.log(`  PASS  ${label}`); passed++; }
function bad(label, detail) {
  console.error(`  FAIL  ${label}`);
  if (detail) console.error(`        ${detail}`);
  failed++;
}
function assert(label, cond, detail) { cond ? ok(label) : bad(label, detail); }

// ─── The canonical rule, mirrored from src/data/entities.ts rowSlug() ─────────

export function rowSlug(row) {
  return typeof row.slug === "string" && row.slug.trim().length > 0
    ? row.slug.trim()
    : slugify(row.name);
}

// ─── 1. Fixture non-vacuity ──────────────────────────────────────────────────

console.log("\n1. Pinned-slug fixtures exist (guard is not vacuous)\n");

const divergent = [];
for (const file of INDEX_FILES) {
  const data = JSON.parse(readFileSync(join(INDEXES_DIR, file), "utf8"));
  for (const row of data.rankings ?? []) {
    const pinned = rowSlug(row);
    if (pinned !== slugify(row.name)) {
      divergent.push({ index: file.replace(/\.json$/, ""), name: row.name, pinned, derived: slugify(row.name) });
    }
  }
}

assert(
  `at least one row's pinned slug differs from slugify(name) (found ${divergent.length})`,
  divergent.length > 0,
  "No divergent pinned slugs found — this guard would verify nothing. If every pinned slug now equals slugify(name), delete this test rather than let it pass vacuously.",
);

// Named anchors: if these stop diverging the fixtures changed materially.
for (const expect of ["phoenix-global-cities", "intuitive-surgical"]) {
  assert(
    `anchor fixture present: ${expect}`,
    divergent.some((d) => d.pinned === expect),
    `expected a row pinned to "${expect}" whose name slugs differently`,
  );
}

console.log(`\n  (${divergent.length} divergent rows; a component deriving from name breaks every one)`);

// ─── 2. rowSlug() semantics ──────────────────────────────────────────────────

console.log("\n2. rowSlug() honours the explicit slug\n");

assert("explicit slug wins", rowSlug({ name: "Phoenix", slug: "phoenix-global-cities" }) === "phoenix-global-cities");
assert("absent slug falls back to slugify(name)", rowSlug({ name: "Oslo" }) === "oslo");
assert("empty slug falls back", rowSlug({ name: "Oslo", slug: "" }) === "oslo");
assert("whitespace-only slug falls back", rowSlug({ name: "Oslo", slug: "   " }) === "oslo");
assert("non-string slug falls back", rowSlug({ name: "Oslo", slug: 42 }) === "oslo");
assert("surrounding whitespace is trimmed", rowSlug({ name: "X", slug: "  pinned  " }) === "pinned");

// ─── 3. Source scan ──────────────────────────────────────────────────────────

console.log("\n3. No component re-derives an entity slug from a name\n");

// Identifiers that denote an ENTITY ROW. `d`/`dim` are excluded on purpose:
// src/app/dimensions/** slugs DIMENSION names, is self-consistent (the lookup
// and generateStaticParams use the same function) and is not an entity route.
const ROW_IDENTS = "(entry|entity|row|item|result|r|e)";

// These are absolute: there is no legitimate reason for a component to derive
// an entity slug itself. The one correct rule lives in rowSlug() in
// src/lib/slugify.ts and every renderer imports it. Deliberately NO allowlist
// and NO "is there a .slug nearby" heuristic — suppressing a match by
// proximity would excuse a genuinely bare call that happened to sit near
// unrelated code, and a false negative in a guard is worse than the defect it
// was written to catch.
const PATTERNS = [
  {
    name: "entity slug re-derived from a name",
    re: new RegExp(`slugify\\(\\s*${ROW_IDENTS}\\.name\\s*\\)`, "g"),
    why: "import { rowSlug } from '@/lib/slugify' and pass the row",
  },
  {
    name: "slugify() passed straight into entityHref()",
    re: /entityHref\([^)]*slugify\(/g,
    why: "pass the published slug (rowSlug(row)), not one derived from the name",
  },
  {
    name: "component defines its own slugify()",
    re: /function\s+slugify\s*\(/g,
    why: "import { slugify } from '@/lib/slugify' — private copies drift (a naive copy dropped accent folding and '&' -> 'and')",
  },
  {
    name: "component defines its own rowSlug()",
    re: /function\s+rowSlug\s*\(/g,
    why: "import { rowSlug } from '@/lib/slugify' — four inline copies of this ternary are what this guard exists to prevent",
  },
];

// file:substring pairs permitted to match. Keep empty if at all possible.
const ALLOWLIST = [];

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.tsx?$/.test(full)) out.push(full);
  }
  return out;
}

export function scanSources(roots = SCAN_ROOTS) {
  const findings = [];
  for (const root of roots) {
    for (const full of walk(root)) {
      const rel = relative(SITE_ROOT, full).replace(/\\/g, "/");
      const lines = readFileSync(full, "utf8").split(/\r?\n/);
      lines.forEach((line, i) => {
        for (const p of PATTERNS) {
          p.re.lastIndex = 0;
          if (!p.re.test(line)) continue;
          if (ALLOWLIST.some((a) => a.file === rel && line.includes(a.substring))) continue;
          findings.push({ file: rel, line: i + 1, pattern: p.name, why: p.why, text: line.trim() });
        }
      });
    }
  }
  return findings;
}

const findings = scanSources();

if (findings.length === 0) {
  ok("no component re-derives an entity slug from a name");
} else {
  bad(`${findings.length} component(s) re-derive an entity slug from a name`);
  for (const f of findings) {
    console.error(`        ${f.file}:${f.line}  [${f.pattern}]`);
    console.error(`          ${f.text}`);
    console.error(`          -> ${f.why}`);
  }
}

// ─── Summary ─────────────────────────────────────────────────────────────────

console.log(`\ntest-pinned-slugs: ${passed} passed, ${failed} failed\n`);
process.exit(failed > 0 ? 1 : 0);
