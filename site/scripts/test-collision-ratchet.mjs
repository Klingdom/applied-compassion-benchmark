#!/usr/bin/env node
/**
 * test-collision-ratchet.mjs — Coverage for detectCollisions() in
 * export-public-data.mjs (Iteration 14, item A-1; reduces RISK-017/018).
 *
 * Cases, all using in-memory fixtures (no real index data touched):
 *   1. Brand-new collision not on the allowlist → reported as unexpected,
 *      naming both indexes.
 *   2. A known collision still present → reported as known, not unexpected,
 *      not resolved.
 *   3. A known collision that has disappeared from the data → reported as
 *      resolved ("remove it from the list").
 *   4. No collisions at all, but the allowlist is non-empty → every listed
 *      entry is reported resolved.
 *   5. A real run against the current repo's index data → exactly the 16
 *      known collisions, 0 unexpected, 0 resolved.
 *
 * Run: node site/scripts/test-collision-ratchet.mjs
 */

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { detectCollisions } from "./export-public-data.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = join(__dirname, "..");
const INDEXES_DIR = join(SITE_ROOT, "src", "data", "indexes");
const KNOWN_COLLISIONS_PATH = join(__dirname, "known-collisions.json");

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

function ok(message) {
  passed++;
}

// ─── Fixtures ──────────────────────────────────────────────────────────────

function baseRecords() {
  return {
    "index-a": ["alpha", "shared-one"],
    "index-b": ["beta", "shared-one", "shared-two"],
    "index-c": ["gamma", "shared-two"],
  };
}

function baseKnown() {
  return [
    { slug: "shared-one", indexes: ["index-a", "index-b"], note: "known #1" },
    { slug: "shared-two", indexes: ["index-b", "index-c"], note: "known #2" },
  ];
}

// ─── Case 1: brand-new collision not on the allowlist ──────────────────────

console.log("\nCase 1: brand-new collision → unexpected, both indexes named");
{
  const records = baseRecords();
  records["index-a"].push("brand-new-collision");
  records["index-c"].push("brand-new-collision");
  const known = baseKnown(); // does not mention brand-new-collision

  const { unexpected, resolved, known: stillKnown } = detectCollisions(records, known);

  assert(
    unexpected.length === 1,
    `expected exactly 1 unexpected collision, got ${unexpected.length}`
  );
  const u = unexpected[0];
  assert(u && u.slug === "brand-new-collision", "unexpected collision should name the new slug");
  assert(
    u &&
      [...u.indexes].sort().join(",") === ["index-a", "index-c"].sort().join(","),
    "unexpected collision should name both colliding indexes (index-a, index-c)"
  );
  assert(resolved.length === 0, "no known collisions should be resolved in this case");
  assert(stillKnown.length === 2, "both pre-existing known collisions should still be reported known");
}

// ─── Case 2: known collision still present ─────────────────────────────────

console.log("Case 2: known collision still present → known, not unexpected/resolved");
{
  const records = baseRecords();
  const known = baseKnown();

  const { unexpected, resolved, known: stillKnown } = detectCollisions(records, known);

  assert(unexpected.length === 0, "no unexpected collisions expected");
  assert(resolved.length === 0, "no resolved collisions expected — both still present");
  assert(stillKnown.length === 2, `expected 2 known collisions still present, got ${stillKnown.length}`);
  assert(
    stillKnown.some((k) => k.slug === "shared-one") && stillKnown.some((k) => k.slug === "shared-two"),
    "both known collisions should be named"
  );
}

// ─── Case 3: known collision disappeared from data → resolved ──────────────

console.log("Case 3: known collision disappeared → resolved (\"remove it from the list\")");
{
  const records = baseRecords();
  // Remove the "shared-two" collision: only index-b keeps it, index-c no longer does.
  records["index-c"] = records["index-c"].filter((s) => s !== "shared-two");
  const known = baseKnown();

  const { unexpected, resolved, known: stillKnown } = detectCollisions(records, known);

  assert(unexpected.length === 0, "no unexpected collisions expected");
  assert(resolved.length === 1, `expected exactly 1 resolved collision, got ${resolved.length}`);
  assert(resolved[0] && resolved[0].slug === "shared-two", "resolved entry should be shared-two");
  assert(stillKnown.length === 1 && stillKnown[0].slug === "shared-one", "shared-one should remain known");
}

// ─── Case 4: no collisions at all, non-empty allowlist → all resolved ──────

console.log("Case 4: no collisions at all → every listed entry resolved");
{
  const records = {
    "index-a": ["alpha"],
    "index-b": ["beta"],
    "index-c": ["gamma"],
  };
  const known = baseKnown();

  const { unexpected, resolved, known: stillKnown } = detectCollisions(records, known);

  assert(unexpected.length === 0, "no unexpected collisions expected");
  assert(resolved.length === 2, `expected all ${known.length} known entries to be resolved, got ${resolved.length}`);
  assert(stillKnown.length === 0, "no collisions should be reported known when none occur");
}

// ─── Case 5: real run against current repo data ────────────────────────────

console.log("Case 5: real repo data → exactly 16 known, 0 unexpected, 0 resolved");
{
  function slugify(name) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  const INDEX_FILES = [
    { file: "fortune-500.json", indexSlug: "fortune-500" },
    { file: "countries.json", indexSlug: "countries" },
    { file: "us-states.json", indexSlug: "us-states" },
    { file: "ai-labs.json", indexSlug: "ai-labs" },
    { file: "robotics-labs.json", indexSlug: "robotics-labs" },
    { file: "global-cities.json", indexSlug: "global-cities" },
    { file: "us-cities.json", indexSlug: "us-cities" },
    { file: "universities.json", indexSlug: "universities" },
  ];

  const recordsByIndex = {};
  for (const { file, indexSlug } of INDEX_FILES) {
    const indexData = JSON.parse(readFileSync(join(INDEXES_DIR, file), "utf-8"));
    const rankings = indexData.rankings ?? [];

    const slugCounts = new Map();
    for (const row of rankings) {
      const base = row.slug ?? slugify(row.name);
      slugCounts.set(base, (slugCounts.get(base) ?? 0) + 1);
    }
    const slugUsage = new Map();
    const slugs = [];
    for (const row of rankings) {
      const baseSlug = row.slug ?? slugify(row.name);
      let slug = baseSlug;
      if ((slugCounts.get(baseSlug) ?? 0) > 1) {
        const used = slugUsage.get(baseSlug) ?? 0;
        slugUsage.set(baseSlug, used + 1);
        slug = used === 0 ? baseSlug : `${baseSlug}-${row.rank}`;
      }
      slugs.push(slug);
    }
    recordsByIndex[indexSlug] = slugs;
  }

  const knownCollisionsFile = JSON.parse(readFileSync(KNOWN_COLLISIONS_PATH, "utf-8"));
  const { unexpected, resolved, known } = detectCollisions(
    recordsByIndex,
    knownCollisionsFile.collisions
  );

  // 15, not 16: tranche 1 of the A-2 repair pinned an explicit slug on the one
  // row whose bare slug served the wrong entity AND had no open ownership
  // question — global-cities Singapore, now singapore-global-cities, following
  // the phoenix-global-cities / georgia-us-states precedent.
  // Deliberately NOT fixed by renaming: 1x-technologies and figure-ai. RISK-017
  // defers both to D-13 (proposed, unratified), whose hard constraint is that no
  // entity may hold more than one published composite; pinning a slug per
  // composite would entrench the duplicate publication rather than remove it.
  // The ratchet may only shrink; lower this number as further collisions are fixed.
  assert(known.length === 15, `expected exactly 15 known collisions in current repo data, got ${known.length}`);
  assert(unexpected.length === 0, `expected 0 unexpected collisions, got ${unexpected.length}: ${JSON.stringify(unexpected)}`);
  assert(resolved.length === 0, `expected 0 resolved collisions, got ${resolved.length}: ${JSON.stringify(resolved)}`);
}

// ─── Summary ────────────────────────────────────────────────────────────────

console.log(`\ntest-collision-ratchet: ${passed} passed, ${failed} failed\n`);
process.exit(failed > 0 ? 1 : 0);
