#!/usr/bin/env node
/**
 * reconcile-rotation-state.mjs — Rotation State Score Reconciliation
 *
 * PROBLEM
 * -------
 * research/rotation-state.json caches `composite`, `band`, and `rank` per
 * entity alongside pipeline timestamps (`last_scanned`, `last_assessed`,
 * `last_change_proposal`, `last_evidence_touch`). The cached score fields
 * were seeded from a legacy index and never updated as assessments changed
 * published values in site/src/data/indexes/*.json. The timestamp fields
 * HAVE been maintained correctly and must not be touched.
 *
 * AUTHORITATIVE-SOURCE RULE
 * -------------------------
 * - site/src/data/indexes/*.json is authoritative for `composite`, `band`,
 *   `rank`.
 * - research/rotation-state.json is authoritative for ALL `last_*`
 *   timestamp fields, `name`, and `index`.
 *
 * MATCHING STRATEGY
 * ------------------
 * 1. Primary match: the rotation entity's object key is compared against
 *    the "canonical" export slug for each published row in the same index
 *    (row.slug if present, else slugify(row.name), with the same
 *    first-occurrence-wins / `${slug}-${rank}` collision handling used by
 *    site/scripts/export-public-data.mjs). This reproduces the matching
 *    the original seed likely intended and resolves the overwhelming
 *    majority of entities.
 * 2. Fallback match: for rotation entities in a given index that the
 *    primary pass could not resolve, look for a published row in the SAME
 *    index whose `name` is an exact string match AND which has not
 *    already been claimed by another rotation entity in this pass. This
 *    recovers legitimate slug-mapping bugs — e.g. rotation keys that were
 *    disambiguated with an `-{index}` suffix instead of export's
 *    `-{rank}` suffix (`washington-dc-global-cities`), and names mangled
 *    by naive slugify diacritic stripping (`c-te-divoire` for
 *    "Côte d'Ivoire", `xian` for "Xi'an", `ndjamena` for "N'Djamena").
 *    If more than one unclaimed candidate remains (ambiguous), the entity
 *    is left unmatched and reported rather than guessed.
 * 3. Anything still unresolved is reported as a genuine unmatched entity
 *    and left completely untouched (per task rule #5).
 *
 * HARD EXCLUSION
 * --------------
 * The us-states published index is known-corrupt: only 21 of 51 states
 * are present and ranks are renumbered contiguously 1-21, so the
 * displayed rank is not the true national rank. All us-states rotation
 * entries are matched (for reporting purposes) but their score fields are
 * NEVER synced. They are reported as "deferred".
 *
 * USAGE
 * -----
 *   node research/scripts/reconcile-rotation-state.mjs --dry-run
 *   node research/scripts/reconcile-rotation-state.mjs
 *
 * Re-runnable: running twice with no intervening published-index changes
 * produces zero further drift.
 */

import { readFileSync, writeFileSync, copyFileSync, existsSync } from "node:fs";
import { resolve, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
// research/scripts/ -> research/ -> repo root
const REPO_ROOT = resolve(__dirname, "..", "..");

const ROTATION_PATH = join(REPO_ROOT, "research", "rotation-state.json");
const BACKUP_PATH = join(REPO_ROOT, "research", "rotation-state.backup-2026-07-19.json");
const INDEXES_DIR = join(REPO_ROOT, "site", "src", "data", "indexes");

const NEW_LAST_UPDATED = "2026-07-19";
const COMPOSITE_DRIFT_TOLERANCE = 0.05;

// Index files that participate in reconciliation. us-states is included
// here for matching/reporting purposes ONLY — it is excluded from writes
// via HARD_EXCLUDED_INDEXES below.
const INDEX_FILES = {
  "fortune-500": "fortune-500.json",
  countries: "countries.json",
  "us-states": "us-states.json",
  "ai-labs": "ai-labs.json",
  "robotics-labs": "robotics-labs.json",
  "global-cities": "global-cities.json",
  "us-cities": "us-cities.json",
  universities: "universities.json",
};

const HARD_EXCLUDED_INDEXES = new Set(["us-states"]);

// ─── Slug generation (mirrors site/scripts/export-public-data.mjs) ──────────

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Build the canonical export-slug map for a published index's rankings,
 * reproducing export-public-data.mjs's collision handling exactly:
 * first occurrence of a base slug keeps it, subsequent occurrences get
 * `${base}-${rank}`.
 */
function buildCanonicalSlugMap(rankings) {
  const slugCounts = new Map();
  for (const row of rankings) {
    const base = row.slug ?? slugify(row.name);
    slugCounts.set(base, (slugCounts.get(base) ?? 0) + 1);
  }
  const slugUsage = new Map();
  const map = new Map();
  for (const row of rankings) {
    const base = row.slug ?? slugify(row.name);
    let slug = base;
    if ((slugCounts.get(base) ?? 0) > 1) {
      const used = slugUsage.get(base) ?? 0;
      slugUsage.set(base, used + 1);
      slug = used === 0 ? base : `${base}-${row.rank}`;
    }
    map.set(slug, row);
  }
  return map;
}

// ─── Main ────────────────────────────────────────────────────────────────────

function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");

  const rotationRaw = readFileSync(ROTATION_PATH, "utf-8");
  const rotation = JSON.parse(rotationRaw);

  /** @type {Record<string, {rankings: any[]}>} */
  const publishedByIndex = {};
  for (const [indexKey, file] of Object.entries(INDEX_FILES)) {
    const path = join(INDEXES_DIR, file);
    const data = JSON.parse(readFileSync(path, "utf-8"));
    publishedByIndex[indexKey] = data.rankings ?? [];
  }

  const canonicalMapByIndex = {};
  for (const [indexKey, rankings] of Object.entries(publishedByIndex)) {
    canonicalMapByIndex[indexKey] = buildCanonicalSlugMap(rankings);
  }

  // Group rotation entities by index for two-pass matching.
  const rotationEntries = Object.entries(rotation.entities ?? {});
  const entriesByIndex = new Map();
  for (const [key, entity] of rotationEntries) {
    const idx = entity.index;
    if (!entriesByIndex.has(idx)) entriesByIndex.set(idx, []);
    entriesByIndex.get(idx).push([key, entity]);
  }

  /** rotationKey -> { row, matchType: 'primary'|'fallback' } */
  const matches = new Map();
  const unmatched = []; // [key, entity]
  const unknownIndex = []; // [key, entity] — index not in INDEX_FILES at all

  for (const [key, entity] of rotationEntries) {
    const idx = entity.index;
    if (!(idx in INDEX_FILES)) {
      unknownIndex.push([key, entity]);
      continue;
    }
  }

  for (const [indexKey, list] of entriesByIndex.entries()) {
    if (!(indexKey in INDEX_FILES)) continue; // handled in unknownIndex above
    const canonicalMap = canonicalMapByIndex[indexKey];
    const claimed = new Set();
    const stillUnmatched = [];

    // Pass 1: primary key match.
    for (const [key, entity] of list) {
      if (canonicalMap.has(key)) {
        const row = canonicalMap.get(key);
        matches.set(key, { row, matchType: "primary" });
        claimed.add(row);
      } else {
        stillUnmatched.push([key, entity]);
      }
    }

    // Pass 2: fallback exact-name match among unclaimed rows in this index.
    const rankings = publishedByIndex[indexKey];
    for (const [key, entity] of stillUnmatched) {
      const candidates = rankings.filter(
        (row) => row.name === entity.name && !claimed.has(row)
      );
      if (candidates.length === 1) {
        const row = candidates[0];
        matches.set(key, { row, matchType: "fallback" });
        claimed.add(row);
      } else {
        unmatched.push([key, entity]);
      }
    }
  }

  // ─── Compute drift (before) for matched, non-excluded entities ──────────
  const perIndexBefore = {}; // indexKey -> { compositeDrift, rankDrift, bandDrift, clean, matched }
  const fallbackResolved = []; // [key, entity, row] — the "slug bug fixes"
  const deferredUsStates = []; // [key, entity, row]
  const toSync = []; // [key, entity, row]

  for (const [key, { row, matchType }] of matches.entries()) {
    const entity = rotation.entities[key];
    const idx = entity.index;

    if (matchType === "fallback") {
      fallbackResolved.push([key, entity, row]);
    }

    if (HARD_EXCLUDED_INDEXES.has(idx)) {
      deferredUsStates.push([key, entity, row]);
      continue;
    }

    if (!perIndexBefore[idx]) {
      perIndexBefore[idx] = { compositeDrift: 0, rankDrift: 0, bandDrift: 0, clean: 0, matched: 0 };
    }
    const stats = perIndexBefore[idx];
    stats.matched++;

    const compositeDrift = Math.abs((entity.composite ?? NaN) - row.composite) > COMPOSITE_DRIFT_TOLERANCE;
    const rankDrift = entity.rank !== row.rank;
    const bandDrift = entity.band !== row.band;

    if (compositeDrift) stats.compositeDrift++;
    if (rankDrift) stats.rankDrift++;
    if (bandDrift) stats.bandDrift++;
    if (!compositeDrift && !rankDrift && !bandDrift) stats.clean++;

    toSync.push([key, entity, row]);
  }

  // ─── Totals ───────────────────────────────────────────────────────────────
  const totalCompositeDrift = Object.values(perIndexBefore).reduce((a, s) => a + s.compositeDrift, 0);
  const totalRankDrift = Object.values(perIndexBefore).reduce((a, s) => a + s.rankDrift, 0);
  const totalBandDrift = Object.values(perIndexBefore).reduce((a, s) => a + s.bandDrift, 0);
  const totalClean = Object.values(perIndexBefore).reduce((a, s) => a + s.clean, 0);
  const totalMatchedSyncable = toSync.length;

  console.log(`[reconcile-rotation-state] Mode: ${dryRun ? "DRY RUN" : "WRITE"}`);
  console.log(`[reconcile-rotation-state] Total rotation entities: ${rotationEntries.length}`);
  console.log(`[reconcile-rotation-state] Matched to a published index (excl. us-states): ${totalMatchedSyncable}`);
  console.log(`[reconcile-rotation-state]   via primary key match: ${totalMatchedSyncable - fallbackResolved.filter(([, e]) => !HARD_EXCLUDED_INDEXES.has(e.index)).length}`);
  console.log(`[reconcile-rotation-state]   via fallback name match (slug-bug recoveries, excl. us-states): ${fallbackResolved.filter(([, e]) => !HARD_EXCLUDED_INDEXES.has(e.index)).length}`);
  console.log(`[reconcile-rotation-state] Deferred (us-states, matched but excluded): ${deferredUsStates.length}`);
  console.log(`[reconcile-rotation-state] Unmatched (no published counterpart found): ${unmatched.length}`);
  if (unknownIndex.length) {
    console.log(`[reconcile-rotation-state] WARNING — entities with unrecognized index value: ${unknownIndex.length}`);
  }
  console.log("");
  console.log("[reconcile-rotation-state] Drift BEFORE reconciliation (matched, syncable population):");
  console.log(`  composite drift (>${COMPOSITE_DRIFT_TOLERANCE}): ${totalCompositeDrift}`);
  console.log(`  rank drift: ${totalRankDrift}`);
  console.log(`  band drift: ${totalBandDrift}`);
  console.log(`  fully clean: ${totalClean}`);
  console.log("");
  console.log("[reconcile-rotation-state] Per-index drift (any of composite/rank/band):");
  for (const [idx, stats] of Object.entries(perIndexBefore)) {
    const anyDrift = stats.compositeDrift + stats.rankDrift + stats.bandDrift; // not unique-entity count, informational
    console.log(
      `  ${idx.padEnd(14)} matched=${stats.matched}  composite=${stats.compositeDrift}  rank=${stats.rankDrift}  band=${stats.bandDrift}  clean=${stats.clean}`
    );
  }

  if (fallbackResolved.length) {
    console.log("");
    console.log("[reconcile-rotation-state] Fallback (slug-bug) matches resolved:");
    for (const [key, entity] of fallbackResolved) {
      console.log(`  ${key}  ->  "${entity.name}" (${entity.index})`);
    }
  }

  if (unmatched.length) {
    console.log("");
    console.log("[reconcile-rotation-state] Still unmatched (left untouched):");
    for (const [key, entity] of unmatched) {
      console.log(`  ${key}  ->  "${entity.name}" (${entity.index})`);
    }
  }

  if (dryRun) {
    console.log("");
    console.log("[reconcile-rotation-state] DRY RUN — no files written.");
    return;
  }

  // ─── Write phase ───────────────────────────────────────────────────────────
  if (!existsSync(BACKUP_PATH)) {
    copyFileSync(ROTATION_PATH, BACKUP_PATH);
    console.log(`[reconcile-rotation-state] Backup written: ${BACKUP_PATH}`);
  } else {
    console.log(`[reconcile-rotation-state] Backup already exists, not overwritten: ${BACKUP_PATH}`);
  }

  for (const [key, entity, row] of toSync) {
    // PRESERVE name, index, and all last_* fields exactly. Overwrite only
    // composite, band, rank.
    rotation.entities[key] = {
      ...entity,
      rank: row.rank,
      composite: row.composite,
      band: row.band,
    };
  }

  rotation.last_updated = NEW_LAST_UPDATED;

  writeFileSync(ROTATION_PATH, JSON.stringify(rotation, null, 2) + "\n", "utf-8");
  console.log(`[reconcile-rotation-state] Wrote ${toSync.length} synced entities to ${ROTATION_PATH}`);
  console.log(`[reconcile-rotation-state] last_updated set to ${NEW_LAST_UPDATED}`);

  // ─── Post-write verification ────────────────────────────────────────────
  const verifyRotation = JSON.parse(readFileSync(ROTATION_PATH, "utf-8"));
  let remainingDrift = 0;
  for (const [key, , row] of toSync) {
    const e = verifyRotation.entities[key];
    const cd = Math.abs((e.composite ?? NaN) - row.composite) > COMPOSITE_DRIFT_TOLERANCE;
    const rd = e.rank !== row.rank;
    const bd = e.band !== row.band;
    if (cd || rd || bd) remainingDrift++;
  }
  console.log("");
  console.log(
    remainingDrift === 0
      ? "[reconcile-rotation-state] VERIFY OK — 0 remaining drift among synced entities."
      : `[reconcile-rotation-state] VERIFY FAILED — ${remainingDrift} entities still show drift after write.`
  );
}

main();
