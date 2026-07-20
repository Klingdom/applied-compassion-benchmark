#!/usr/bin/env node

/**
 * apply-us-states.mjs — Rebuild site/src/data/indexes/us-states.json from
 * evidence-based change proposals.
 *
 * WHY A NEW SCRIPT (do not use apply-changes.mjs):
 *   apply-changes.mjs claims in its header to read research/change-proposals/
 *   but does not — it carries a hardcoded 6-entry CHANGES array. It also
 *   assumes proposal dimensions are 0-100 and converts via toRaw(). Our
 *   proposals store raw 1-5 dimensions directly, so running it here would
 *   double-convert and corrupt every score.
 *   See research/LEGACY_INDEX_DEFECTS_2026-07-19.md "Blocker 2".
 *
 * WHAT THIS DOES
 *   1. Reads every research/change-proposals/*.json with index "us-states"
 *      and status "pending".
 *   2. LOWERCASES band. site/src/components/ui/Band.tsx looks up bandStyles[level]
 *      against lowercase-only keys; title-case bands render with no colour
 *      classes. Lowercase is the convention in all 8 index files.
 *      See "Blocker 1" in the same doc.
 *   3. Verifies every composite reproduces from its own dimensions via
 *      computeCompositeFromDimensions. This is the check that caught the
 *      legacy Vermont 87.5-vs-95.0 defect; the rebuilt index must not
 *      reintroduce it.
 *   4. Sorts by composite desc and assigns true national ranks 1..N.
 *      Ties broken alphabetically by name for determinism.
 *   5. Recomputes meta.entityCount / meanScore / medianScore and the bands[]
 *      count+pct block.
 *
 * MODES
 *   (default)  Dry-run. Prints the full rebuilt index and every check.
 *              Writes nothing.
 *   --apply    Writes site/src/data/indexes/us-states.json.
 *
 * Determinism: same proposals in => byte-identical index out.
 */

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { computeCompositeFromDimensions } from "./lib/scoring.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = resolve(__dirname, "..");
const REPO_ROOT = resolve(SITE_ROOT, "..");
const PROPOSALS_DIR = join(REPO_ROOT, "research", "change-proposals");
const INDEX_PATH = join(SITE_ROOT, "src", "data", "indexes", "us-states.json");

const APPLY = process.argv.includes("--apply");

// ── Region map ────────────────────────────────────────────────────────────────
// Six regions, matching the labels already present in us-states.json:
// West | New England | Mid-Atlantic | Midwest | Southwest | Southeast
// Assignments for the 21 already-published rows are preserved verbatim from the
// existing index (asserted below). The other 30 follow the same scheme.
const REGIONS = {
  // West
  Alaska: "West", Arizona: "Southwest", California: "West", Colorado: "West",
  Hawaii: "West", Idaho: "West", Montana: "West", Nevada: "West",
  "New Mexico": "Southwest", Oregon: "West", Utah: "West", Washington: "West",
  Wyoming: "West",
  // Midwest
  Illinois: "Midwest", Indiana: "Midwest", Iowa: "Midwest", Kansas: "Midwest",
  Michigan: "Midwest", Minnesota: "Midwest", Missouri: "Midwest",
  Nebraska: "Midwest", "North Dakota": "Midwest", Ohio: "Midwest",
  "South Dakota": "Midwest", Wisconsin: "Midwest",
  // New England
  Connecticut: "New England", Maine: "New England",
  Massachusetts: "New England", "New Hampshire": "New England",
  "Rhode Island": "New England", Vermont: "New England",
  // Mid-Atlantic
  Delaware: "Mid-Atlantic", Maryland: "Mid-Atlantic", "New Jersey": "Mid-Atlantic",
  "New York": "Mid-Atlantic", Pennsylvania: "Mid-Atlantic",
  Virginia: "Mid-Atlantic", "District of Columbia": "Mid-Atlantic",
  "West Virginia": "Mid-Atlantic",
  // Southwest
  Oklahoma: "Southwest", Texas: "Southwest",
  // Southeast
  Alabama: "Southeast", Arkansas: "Southeast", Florida: "Southeast",
  Georgia: "Southeast", Kentucky: "Southeast", Louisiana: "Southeast",
  Mississippi: "Southeast", "North Carolina": "Southeast",
  "South Carolina": "Southeast", Tennessee: "Southeast",
};

// ── Entity name normalisation ─────────────────────────────────────────────────
// "Washington DC" is a THREE-WAY cross-index slug collision: it exists in
// global-cities, us-cities AND us-states, and all three slugify to
// `washington-dc`. The single entity record is owned by us-cities, so the
// us-states row currently has no valid record and validate-indexes.mjs silently
// skips checks 13-16 for it.
//
// Fix: the us-states entity is the federal DISTRICT, which is a different thing
// from the CITY in us-cities even though they are geographically coextensive.
// Naming it "District of Columbia" is both more accurate for a states index
// (and matches the page copy, "50 states and the District of Columbia") and
// yields the distinct slug `district-of-columbia`.
//
// Verified: no other us-states jurisdiction name collides with a us-cities slug.
const NAME_NORMALISATION = {
  "Washington DC": "District of Columbia",
};

// ── Explicit slug overrides ───────────────────────────────────────────────────
// Where the jurisdiction's NAME is correct but its derived slug would collide
// with an entity in another index, carry an explicit slug instead of renaming.
//
// Georgia: the US state collides with Georgia the country (countries.json,
// composite 34.4, rank 106), which already owns entity-records/georgia.json.
// "Georgia" is the correct display name for the state, so renaming would be
// wrong — unlike Washington DC, where the name itself was wrong for a states
// index. An explicit slug is the right tool here.
//
// Suffix convention `-us-states` matches the collision handling already used in
// research/rotation-state.json. `row.slug ?? slugify(row.name)` is supported by
// build-entity-records.mjs, and universities.json already carries explicit slugs
// on all 100 rows, so this is an established pattern rather than a new one.
//
// NOTE: this collision does not exist in the CURRENT published index because
// Georgia is not among the 21 published rows. Applying the rebuilt 51-row index
// is what would create it. The pre-flight collision guard below caught it.
const SLUG_OVERRIDES = {
  Georgia: "georgia-us-states",
};

// ── Band definitions ──────────────────────────────────────────────────────────
// CORRECTED 2026-07-19. computeCompositeFromDimensions uses EXCLUSIVE upper
// thresholds - a band changes at >20, >40, >60, >80. Every index file in this
// repo labels the ranges "21-40" / "41-60" / "61-80", which disagrees with the
// function for any score landing in the gap between them.
//
// Three jurisdictions in this rebuild fall in that gap:
//   New Jersey 60.6 - function: Established, old label implied Functional
//   Idaho      40.6 - function: Functional,  old label implied Developing
//   Kansas     40.6 - function: Functional,  old label implied Developing
//
// The published legend would have contradicted the published band column.
// Ranges below are stated to match the function exactly.
//
// NOTE: the other 7 index files carry the same incorrect labels. Out of scope
// here; logged in research/LEGACY_INDEX_DEFECTS_2026-07-19.md as follow-up.
const BAND_DEFS = [
  { name: "Exemplary", range: "80.1-100", min: 80 },
  { name: "Established", range: "60.1-80", min: 60 },
  { name: "Functional", range: "40.1-60", min: 40 },
  { name: "Developing", range: "20.1-40", min: 20 },
  { name: "Critical", range: "0-20", min: 0 },
];

const VALID_BANDS = new Set(BAND_DEFS.map((b) => b.name.toLowerCase()));

const fail = (msg) => {
  console.error(`\nFATAL: ${msg}\n`);
  process.exit(1);
};

// ── Load proposals ────────────────────────────────────────────────────────────

const allProposals = readdirSync(PROPOSALS_DIR)
  .filter((f) => f.endsWith(".json"))
  .map((f) => {
    try {
      return { file: f, ...JSON.parse(readFileSync(join(PROPOSALS_DIR, f), "utf8")) };
    } catch (e) {
      fail(`could not parse ${f}: ${e.message}`);
    }
  })
  .filter((p) => p.index === "us-states" && p.status === "pending");

// Supersession: a slug can have several pending proposals across dates (the
// nightly pipeline wrote some in April under an older schema). Take the newest
// per slug and report what it superseded, rather than filtering by a hardcoded
// date — a date filter would silently hide stale rows and let a future run pick
// the wrong one.
const bySlug = new Map();
for (const p of allProposals) {
  const key = p.slug || p.entity;
  const date = p.assessment_date || p.date || "";
  const prev = bySlug.get(key);
  if (!prev || date > (prev.assessment_date || prev.date || "")) bySlug.set(key, p);
}
const proposals = [...bySlug.values()];

const superseded = allProposals.filter((p) => !proposals.includes(p));
if (superseded.length) {
  console.log("\nSUPERSEDED (older pending proposal for the same slug, not applied):");
  superseded.forEach((p) =>
    console.log(`  ${p.file}  (superseded by ${bySlug.get(p.slug || p.entity).file})`)
  );
}

if (proposals.length === 0) fail("no pending us-states proposals found");

// ── Per-proposal validation ───────────────────────────────────────────────────

const problems = [];
const rows = [];

const renamed = [];

for (const p of proposals) {
  const rawName = p.entity;
  const name = NAME_NORMALISATION[rawName] || rawName;
  if (name !== rawName) renamed.push(`${rawName} -> ${name}`);
  const ps = p.proposed_scores;

  if (!ps) { problems.push(`${name}: no proposed_scores`); continue; }
  if (!ps.dimensions) { problems.push(`${name}: no dimensions`); continue; }

  const dims = ps.dimensions;
  const dimKeys = ["AWR", "EMP", "ACT", "EQU", "BND", "ACC", "SYS", "INT"];
  const missing = dimKeys.filter((k) => typeof dims[k] !== "number");
  if (missing.length) { problems.push(`${name}: missing dims ${missing.join(",")}`); continue; }

  // Composite must reproduce from its own dimensions.
  const recomputed = computeCompositeFromDimensions(dims);
  if (Math.abs(recomputed.composite - ps.composite) > 0.05) {
    problems.push(
      `${name}: composite ${ps.composite} does not reproduce from its own dimensions ` +
      `(function returns ${recomputed.composite}) — this is the legacy Vermont defect`
    );
    continue;
  }

  // Band must agree with the function, case-insensitively.
  if (String(recomputed.band).toLowerCase() !== String(ps.band).toLowerCase()) {
    problems.push(
      `${name}: band "${ps.band}" disagrees with function band "${recomputed.band}"`
    );
    continue;
  }

  const band = String(ps.band).toLowerCase();
  if (!VALID_BANDS.has(band)) { problems.push(`${name}: unknown band "${ps.band}"`); continue; }

  const region = REGIONS[name];
  if (!region) { problems.push(`${name}: no region mapping`); continue; }

  // Proposals must not assert a rank — ranks are assigned here, nationally.
  // Absent (undefined) and explicit null both mean "no rank" and are fine;
  // only an actual number is a violation.
  if (typeof p.rank === "number" || typeof ps.rank === "number") {
    problems.push(`${name}: proposal asserts rank ${p.rank ?? ps.rank}; ranks are assigned at apply time`);
    continue;
  }

  rows.push({
    name,
    slug: SLUG_OVERRIDES[name] || undefined,
    region,
    composite: ps.composite,
    band,
    scores: Object.fromEntries(dimKeys.map((k) => [k, dims[k]])),
  });
}

if (problems.length) {
  console.error("\nPROPOSAL VALIDATION FAILURES:");
  problems.forEach((p) => console.error("  - " + p));
  fail(`${problems.length} proposal(s) failed validation; nothing written`);
}

// ── Duplicate check ───────────────────────────────────────────────────────────

const seen = new Map();
for (const r of rows) {
  if (seen.has(r.name)) fail(`duplicate proposals for ${r.name}`);
  seen.set(r.name, true);
}

// ── Sort + rank ───────────────────────────────────────────────────────────────
// Composite desc; ties broken alphabetically so output is deterministic.

rows.sort((a, b) => (b.composite - a.composite) || a.name.localeCompare(b.name));
rows.forEach((r, i) => { r.rank = i + 1; });

// Reorder keys to match the existing row shape exactly.
const rankings = rows.map((r) => ({
  rank: r.rank,
  name: r.name,
  ...(r.slug ? { slug: r.slug } : {}),
  region: r.region,
  composite: r.composite,
  band: r.band,
  scores: r.scores,
}));

// ── Meta + bands ──────────────────────────────────────────────────────────────

const composites = rankings.map((r) => r.composite).sort((a, b) => a - b);
const mean = composites.reduce((a, b) => a + b, 0) / composites.length;
const median = composites.length % 2
  ? composites[(composites.length - 1) / 2]
  : (composites[composites.length / 2 - 1] + composites[composites.length / 2]) / 2;

const round1 = (n) => Math.round(n * 10) / 10;

const existing = JSON.parse(readFileSync(INDEX_PATH, "utf8"));

const bands = BAND_DEFS.map((b) => {
  const count = rankings.filter((r) => r.band === b.name.toLowerCase()).length;
  return {
    name: b.name,
    range: b.range,
    count,
    pct: `${Math.round((count / rankings.length) * 100)}%`,
  };
});

const out = {
  meta: {
    ...existing.meta,
    entityCount: rankings.length,
    meanScore: round1(mean),
    medianScore: round1(median),
  },
  bands,
  rankings,
};

// ── Post-build self-check ─────────────────────────────────────────────────────

const checks = [];
const ranks = rankings.map((r) => r.rank);
checks.push(["ranks are 1..N with no gaps or dupes",
  ranks.length === new Set(ranks).size &&
  Math.min(...ranks) === 1 && Math.max(...ranks) === rankings.length]);
checks.push(["every band lowercase and known",
  rankings.every((r) => VALID_BANDS.has(r.band))]);
checks.push(["every composite reproduces from its dimensions",
  rankings.every((r) =>
    Math.abs(computeCompositeFromDimensions(r.scores).composite - r.composite) <= 0.05)]);
checks.push(["band counts sum to entity count",
  bands.reduce((a, b) => a + b.count, 0) === rankings.length]);
checks.push(["sorted strictly by composite desc",
  rankings.every((r, i) => i === 0 || rankings[i - 1].composite >= r.composite)]);
// Regions of previously-published rows must be unchanged.
const regionDrift = existing.rankings
  .filter((old) => rankings.some((r) => r.name === old.name))
  .filter((old) => rankings.find((r) => r.name === old.name).region !== old.region)
  .map((old) => old.name);
// Cross-index slug collision guard. `washington-dc` was a three-way collision
// (global-cities / us-cities / us-states); verify the rebuilt set is clean.
const slugify = (n) => n.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const otherSlugs = new Set();
for (const f of readdirSync(join(SITE_ROOT, "src", "data", "indexes"))) {
  if (!f.endsWith(".json") || f === "us-states.json") continue;
  const d = JSON.parse(readFileSync(join(SITE_ROOT, "src", "data", "indexes", f), "utf8"));
  (d.rankings || []).forEach((r) => otherSlugs.add(r.slug || slugify(r.name)));
}
const collisions = rankings.map((r) => r.slug || slugify(r.name)).filter((s) => otherSlugs.has(s));
// Every published band must equal what computeCompositeFromDimensions returns.
// This is the check that would have caught the exclusive-threshold mismatch.
const bandDisagreements = rankings.filter(
  (r) => computeCompositeFromDimensions(r.scores).band.toLowerCase() !== r.band
).map((r) => `${r.name} ${r.composite}`);
checks.push([`published band matches function band for every row${bandDisagreements.length ? " (" + bandDisagreements.join(", ") + ")" : ""}`,
  bandDisagreements.length === 0]);

checks.push([`no cross-index slug collisions${collisions.length ? " (" + collisions.join(",") + ")" : ""}`,
  collisions.length === 0]);

checks.push([`regions preserved for previously-published rows${regionDrift.length ? " ("+regionDrift.join(",")+")" : ""}`,
  regionDrift.length === 0]);

console.log(`\n${APPLY ? "APPLY" : "DRY RUN"} — us-states index rebuild`);
console.log(`proposals read: ${proposals.length}`);
if (renamed.length) {
  console.log("\nENTITY RENAMES (cross-index slug collision avoidance):");
  renamed.forEach((r) => console.log("  " + r));
}
console.log(`rows written:   ${rankings.length}  (was ${existing.rankings.length})\n`);

console.log("RANKINGS");
rankings.forEach((r) => {
  console.log(
    String(r.rank).padStart(3) + ". " +
    r.name.padEnd(17) +
    String(r.composite.toFixed(1)).padStart(5) + "  " +
    r.band.padEnd(12) + r.region
  );
});

console.log("\nBAND DISTRIBUTION");
bands.forEach((b) => console.log(`  ${b.name.padEnd(12)} ${String(b.count).padStart(3)}  ${b.pct.padStart(4)}  (${b.range})`));

console.log("\nMETA");
console.log(`  entityCount ${out.meta.entityCount}   meanScore ${out.meta.meanScore}   medianScore ${out.meta.medianScore}`);
console.log(`  (was        ${existing.meta.entityCount}             ${existing.meta.meanScore}              ${existing.meta.medianScore})`);

console.log("\nSELF-CHECKS");
let allOk = true;
checks.forEach(([label, ok]) => {
  if (!ok) allOk = false;
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}`);
});

if (!allOk) fail("self-checks failed; nothing written");

if (APPLY) {
  writeFileSync(INDEX_PATH, JSON.stringify(out, null, 2) + "\n", "utf8");
  console.log(`\nWROTE ${INDEX_PATH}`);
} else {
  console.log("\nDry run only. Re-run with --apply to write.");
}
