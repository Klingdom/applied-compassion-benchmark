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
 * HAVE been maintained correctly and must not be touched (except where an
 * explicit, verified business rule says otherwise — see FORCE_LAST_ASSESSED
 * below).
 *
 * AUTHORITATIVE-SOURCE RULE
 * -------------------------
 * - site/src/data/indexes/*.json is authoritative for `composite`, `band`,
 *   `rank`.
 * - research/rotation-state.json is authoritative for ALL `last_*`
 *   timestamp fields, `name`, and `index` — on entities that already exist
 *   in rotation-state.
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
 *    and left completely untouched.
 *
 * KEY MIGRATIONS (2026-07-19 us-states correction)
 * -------------------------------------------------
 * Rotation key `washington-dc` (name "Washington DC", index us-states)
 * predates the us-states correction and does not match the published
 * entity "District of Columbia". This is the SAME jurisdiction under two
 * names/keys, not two entities — the fix migrates the existing rotation
 * entry to the canonical key/name so it matches normally going forward,
 * preserving its `last_*` timestamps exactly (they are authoritative).
 * Scoped strictly to index "us-states" — `us-cities` and `global-cities`
 * both legitimately contain a separate, correctly-keyed "Washington DC"
 * entity and must not be touched by this migration.
 *
 * BACKFILL (published entities with no rotation counterpart)
 * ------------------------------------------------------------
 * Some published rows have no rotation entry at all (as opposed to
 * "unmatched", which is a rotation entry with no published counterpart).
 * When run with `--backfill`, the script creates new rotation entries for
 * such rows, keyed on the same canonical export slug the primary matcher
 * uses, so they match normally on future runs. New entries are created
 * with `last_scanned: null`, `last_assessed: null`,
 * `last_change_proposal: null`, `last_evidence_touch: null` (they have
 * never been touched by the pipeline) unless an existing entry is being
 * migrated (see KEY_MIGRATIONS above), in which case its real `last_*`
 * values are preserved. `--backfill` is off by default so the script
 * remains non-additive for indexes that have no orphaned published rows
 * today (verified: only us-states currently has any).
 *
 * FORCE_LAST_ASSESSED (2026-07-19 us-states full reassessment)
 * ----------------------------------------------------------------
 * All 51 published us-states entities were individually assessed on
 * 2026-07-19, each with a dated assessment file on disk at
 * research/assessments/<slug>-2026-07-19.md. This is a one-time, factually
 * verified business rule, not a generic recurring feature: for indexes
 * listed in FORCE_LAST_ASSESSED, the script checks — per entity, via the
 * canonical slug of its matched published row — whether that dated
 * assessment file actually exists on disk, and only then sets
 * `last_assessed` to the configured date. It never assumes; an entity
 * whose file is missing is left untouched and reported. This map is empty
 * for every index except us-states, so default behavior for every other
 * index is completely unaffected.
 *
 * HARD EXCLUSION
 * --------------
 * Indexes listed here are matched (for reporting purposes) but their
 * score fields are NEVER synced, e.g. because the published index is
 * known-corrupt. us-states was excluded here from 2026-07-19 (commit
 * 6fea878f) through the us-states correction (commit 613473b4): only 21
 * of 51 states were published and ranks were renumbered contiguously
 * 1-21, so syncing would have propagated corrupt ranks into scan
 * prioritization. That precondition is gone — us-states.json now
 * publishes all 51 states with true ranks — so us-states has been
 * removed from this set. It is kept here (currently empty) as the
 * mechanism for any future index that needs the same protection.
 *
 * USAGE
 * -----
 *   node research/scripts/reconcile-rotation-state.mjs --dry-run
 *   node research/scripts/reconcile-rotation-state.mjs --dry-run --backfill
 *   node research/scripts/reconcile-rotation-state.mjs
 *   node research/scripts/reconcile-rotation-state.mjs --backfill
 *
 * Re-runnable and idempotent: running twice in a row with no intervening
 * published-index or assessment-file changes produces zero further
 * changes (drift, migrations, or backfills).
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
const ASSESSMENTS_DIR = join(REPO_ROOT, "research", "assessments");

const NEW_LAST_UPDATED = "2026-07-20";
const COMPOSITE_DRIFT_TOLERANCE = 0.05;

// Index files that participate in reconciliation.
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

// See "HARD EXCLUSION" above. Empty since the 2026-07-19 us-states
// correction (commit 613473b4) removed the only entry that was ever here.
const HARD_EXCLUDED_INDEXES = new Set([]);

// See "KEY MIGRATIONS" above. Scoped by both `from` key AND `index` so a
// same-named key in a different index is never touched.
const KEY_MIGRATIONS = [
  {
    index: "us-states",
    from: "washington-dc",
    to: "district-of-columbia",
    name: "District of Columbia",
  },
];

// See "FORCE_LAST_ASSESSED" above. Deliberately scoped to us-states only.
const FORCE_LAST_ASSESSED = {
  "us-states": "2026-07-19",
};

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
 * `${base}-${rank}`. Returns both directions: slug -> row and row -> slug
 * (the latter via a Map keyed by row object identity, since rows have no
 * stable id of their own).
 */
function buildCanonicalSlugMaps(rankings) {
  const slugCounts = new Map();
  for (const row of rankings) {
    const base = row.slug ?? slugify(row.name);
    slugCounts.set(base, (slugCounts.get(base) ?? 0) + 1);
  }
  const slugUsage = new Map();
  const slugToRow = new Map();
  const rowToSlug = new Map();
  for (const row of rankings) {
    const base = row.slug ?? slugify(row.name);
    let slug = base;
    if ((slugCounts.get(base) ?? 0) > 1) {
      const used = slugUsage.get(base) ?? 0;
      slugUsage.set(base, used + 1);
      slug = used === 0 ? base : `${base}-${row.rank}`;
    }
    slugToRow.set(slug, row);
    rowToSlug.set(row, slug);
  }
  return { slugToRow, rowToSlug };
}

function assessmentFileExists(slug, date) {
  return existsSync(join(ASSESSMENTS_DIR, `${slug}-${date}.md`));
}

// ─── Main ────────────────────────────────────────────────────────────────────

function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const backfill = args.includes("--backfill");

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
    canonicalMapByIndex[indexKey] = buildCanonicalSlugMaps(rankings);
  }

  // ─── Key migrations (applied in-memory before matching) ──────────────────
  const migrationsApplied = [];
  const migrationsSkipped = [];
  for (const migration of KEY_MIGRATIONS) {
    const { index: idx, from, to, name } = migration;
    const source = rotation.entities[from];
    if (!source || source.index !== idx) {
      // Nothing to migrate (already migrated on a prior run, or never existed).
      continue;
    }
    if (rotation.entities[to] && to !== from) {
      migrationsSkipped.push({ from, to, reason: `target key "${to}" already exists` });
      continue;
    }
    rotation.entities[to] = { ...source, name };
    if (to !== from) delete rotation.entities[from];
    migrationsApplied.push({ from, to, index: idx, name });
  }
  if (migrationsSkipped.length) {
    console.log("[reconcile-rotation-state] WARNING — key migrations skipped due to collision:");
    for (const m of migrationsSkipped) {
      console.log(`  ${m.from} -> ${m.to}: ${m.reason}`);
    }
  }

  // Group rotation entities by index for two-pass matching.
  const rotationEntries = Object.entries(rotation.entities ?? {});
  const entriesByIndex = new Map();
  for (const [key, entity] of rotationEntries) {
    const idx = entity.index;
    if (!entriesByIndex.has(idx)) entriesByIndex.set(idx, []);
    entriesByIndex.get(idx).push([key, entity]);
  }

  /** rotationKey -> { row, matchType: 'primary'|'fallback'|'backfill' } */
  const matches = new Map();
  const unmatched = []; // [key, entity]
  const unknownIndex = []; // [key, entity] — index not in INDEX_FILES at all
  const claimedByIndex = {}; // indexKey -> Set(row)

  for (const [key, entity] of rotationEntries) {
    const idx = entity.index;
    if (!(idx in INDEX_FILES)) {
      unknownIndex.push([key, entity]);
    }
  }

  for (const [indexKey, list] of entriesByIndex.entries()) {
    if (!(indexKey in INDEX_FILES)) continue; // handled in unknownIndex above
    const { slugToRow } = canonicalMapByIndex[indexKey];
    const claimed = new Set();
    const stillUnmatched = [];

    // Pass 1: primary key match.
    for (const [key, entity] of list) {
      if (slugToRow.has(key)) {
        const row = slugToRow.get(key);
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

    claimedByIndex[indexKey] = claimed;
  }

  // ─── Backfill: published rows with no rotation counterpart at all ───────
  const backfilled = []; // [key, entity, row, indexKey]
  if (backfill) {
    for (const [indexKey, rankings] of Object.entries(publishedByIndex)) {
      const claimed = claimedByIndex[indexKey] ?? new Set();
      const { rowToSlug } = canonicalMapByIndex[indexKey];
      const orphanRows = rankings.filter((row) => !claimed.has(row));
      for (const row of orphanRows) {
        const key = rowToSlug.get(row);
        if (rotation.entities[key]) {
          // Defensive: canonical slug already taken by an unrelated entity
          // (e.g. cross-index collision). Do not overwrite; report instead.
          unmatched.push([`(backfill-collision:${key})`, { name: row.name, index: indexKey }]);
          continue;
        }
        const newEntity = {
          name: row.name,
          index: indexKey,
          rank: row.rank,
          composite: row.composite,
          band: row.band,
          last_scanned: null,
          last_assessed: null,
          last_change_proposal: null,
          last_evidence_touch: null,
        };
        rotation.entities[key] = newEntity;
        matches.set(key, { row, matchType: "backfill" });
        claimed.add(row);
        backfilled.push([key, newEntity, row, indexKey]);
      }
    }
  }

  // ─── Force last_assessed for verified, dated full-reassessment indexes ──
  const forcedLastAssessed = []; // [key, oldValue, newValue, indexKey]
  const forcedLastAssessedMissingFile = []; // [key, name, slug, indexKey]
  for (const [indexKey, date] of Object.entries(FORCE_LAST_ASSESSED)) {
    const { rowToSlug } = canonicalMapByIndex[indexKey];
    for (const [key, { row }] of matches.entries()) {
      const entity = rotation.entities[key];
      if (!entity || entity.index !== indexKey) continue;
      const slug = rowToSlug.get(row);
      if (!assessmentFileExists(slug, date)) {
        forcedLastAssessedMissingFile.push([key, entity.name, slug, indexKey]);
        continue;
      }
      if (entity.last_assessed !== date) {
        forcedLastAssessed.push([key, entity.last_assessed, date, indexKey]);
        entity.last_assessed = date;
      }
    }
  }

  // ─── Compute drift (before) for matched, non-excluded, non-backfilled ───
  const perIndexBefore = {}; // indexKey -> { compositeDrift, rankDrift, bandDrift, clean, matched }
  const fallbackResolved = []; // [key, entity, row] — the "slug bug fixes"
  const deferredHardExcluded = []; // [key, entity, row]
  const toSync = []; // [key, entity, row]

  for (const [key, { row, matchType }] of matches.entries()) {
    if (matchType === "backfill") continue; // created fresh with correct values; nothing to sync
    const entity = rotation.entities[key];
    const idx = entity.index;

    if (matchType === "fallback") {
      fallbackResolved.push([key, entity, row]);
    }

    if (HARD_EXCLUDED_INDEXES.has(idx)) {
      deferredHardExcluded.push([key, entity, row]);
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

  console.log(`[reconcile-rotation-state] Mode: ${dryRun ? "DRY RUN" : "WRITE"}${backfill ? " + BACKFILL" : ""}`);
  console.log(`[reconcile-rotation-state] Total rotation entities: ${Object.keys(rotation.entities).length}`);
  if (migrationsApplied.length) {
    console.log(`[reconcile-rotation-state] Key migrations applied: ${migrationsApplied.length}`);
    for (const m of migrationsApplied) {
      console.log(`  ${m.from} -> ${m.to}  (index=${m.index}, name="${m.name}")`);
    }
  }
  console.log(`[reconcile-rotation-state] Matched to a published index (excl. hard-excluded indexes): ${totalMatchedSyncable}`);
  console.log(`[reconcile-rotation-state]   via primary key match: ${totalMatchedSyncable - fallbackResolved.filter(([, e]) => !HARD_EXCLUDED_INDEXES.has(e.index)).length}`);
  console.log(`[reconcile-rotation-state]   via fallback name match (slug-bug recoveries, excl. hard-excluded): ${fallbackResolved.filter(([, e]) => !HARD_EXCLUDED_INDEXES.has(e.index)).length}`);
  console.log(`[reconcile-rotation-state] Deferred (hard-excluded indexes, matched but excluded): ${deferredHardExcluded.length}`);
  if (backfill) {
    console.log(`[reconcile-rotation-state] Backfilled (published rows with no prior rotation entry): ${backfilled.length}`);
    const byIndex = new Map();
    for (const [, , , indexKey] of backfilled) byIndex.set(indexKey, (byIndex.get(indexKey) ?? 0) + 1);
    for (const [idx, count] of byIndex.entries()) {
      console.log(`  ${idx}: ${count}`);
    }
  }
  console.log(`[reconcile-rotation-state] Unmatched (no published counterpart found): ${unmatched.length}`);
  if (unknownIndex.length) {
    console.log(`[reconcile-rotation-state] WARNING — entities with unrecognized index value: ${unknownIndex.length}`);
  }
  console.log("");
  console.log("[reconcile-rotation-state] Drift BEFORE reconciliation (matched, syncable population, excl. backfilled):");
  console.log(`  composite drift (>${COMPOSITE_DRIFT_TOLERANCE}): ${totalCompositeDrift}`);
  console.log(`  rank drift: ${totalRankDrift}`);
  console.log(`  band drift: ${totalBandDrift}`);
  console.log(`  fully clean: ${totalClean}`);
  console.log("");
  console.log("[reconcile-rotation-state] Per-index drift (any of composite/rank/band):");
  for (const [idx, stats] of Object.entries(perIndexBefore)) {
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

  if (Object.keys(FORCE_LAST_ASSESSED).length) {
    console.log("");
    console.log("[reconcile-rotation-state] Forced last_assessed (verified against assessment files on disk):");
    for (const [indexKey, date] of Object.entries(FORCE_LAST_ASSESSED)) {
      const changed = forcedLastAssessed.filter(([, , , idx]) => idx === indexKey);
      const missing = forcedLastAssessedMissingFile.filter(([, , , idx]) => idx === indexKey);
      console.log(`  ${indexKey} -> ${date}: ${changed.length} entities updated, ${missing.length} missing assessment file (left untouched)`);
      for (const [key, name, slug] of missing) {
        console.log(`    MISSING FILE for "${name}" (key=${key}, expected slug=${slug})`);
      }
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
    // composite, band, rank. (last_assessed may already have been force-set
    // above for FORCE_LAST_ASSESSED indexes — that mutation is preserved
    // here since `entity` is the same object reference as
    // rotation.entities[key].)
    rotation.entities[key] = {
      ...entity,
      rank: row.rank,
      composite: row.composite,
      band: row.band,
    };
  }

  rotation.entity_count = Object.keys(rotation.entities).length;
  rotation.last_updated = NEW_LAST_UPDATED;

  writeFileSync(ROTATION_PATH, JSON.stringify(rotation, null, 2) + "\n", "utf-8");
  console.log(`[reconcile-rotation-state] Wrote ${toSync.length} synced entities to ${ROTATION_PATH}`);
  if (backfill) console.log(`[reconcile-rotation-state] Wrote ${backfilled.length} backfilled entities`);
  console.log(`[reconcile-rotation-state] entity_count set to ${rotation.entity_count}`);
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
