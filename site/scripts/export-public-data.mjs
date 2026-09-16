#!/usr/bin/env node
/**
 * export-public-data.mjs — Public Score Data Export
 *
 * Generates site/public/data/scores/<slug>.json for every entity across all
 * indexes. These files are consumed by the Cloudflare Worker badge endpoint
 * at https://api.compassionbenchmark.com/badge/<slug>.svg.
 *
 * Also generates site/public/data/index.json — a catalog of all available slugs
 * with their index membership, for discovery.
 *
 * Runs as the `prebuild` step in site/package.json so every `npm run build`
 * produces fresh data files before Next.js static export.
 *
 * Idempotent — safe to run multiple times.
 *
 * Output shape for each slug file:
 *   {
 *     "slug": "apple-inc",
 *     "name": "Apple Inc.",
 *     "composite": 58.8,
 *     "band": "Functional",
 *     "indexSlug": "fortune-500",
 *     "rank": 47,
 *     "updatedAt": "2026-05-17T03:00:00.000Z"
 *   }
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
// site/scripts/ → site/
const SITE_ROOT = resolve(__dirname, "..");

// ─── Index configuration ─────────────────────────────────────────────────────

/**
 * Each entry maps a JSON index file to its canonical index slug and kind.
 * This must stay in sync with entities.ts KIND_CONFIG.
 */
const INDEX_FILES = [
  { file: "fortune-500.json",   indexSlug: "fortune-500",   kind: "company" },
  { file: "countries.json",     indexSlug: "countries",     kind: "country" },
  { file: "us-states.json",     indexSlug: "us-states",     kind: "us-state" },
  { file: "ai-labs.json",       indexSlug: "ai-labs",       kind: "ai-lab" },
  { file: "robotics-labs.json", indexSlug: "robotics-labs", kind: "robotics-lab" },
  { file: "global-cities.json", indexSlug: "global-cities", kind: "city" },
  { file: "us-cities.json",     indexSlug: "us-cities",     kind: "us-city" },
  { file: "universities.json",  indexSlug: "universities",  kind: "university" },
];

const INDEXES_DIR = join(SITE_ROOT, "src", "data", "indexes");
const OUTPUT_SCORES_DIR = join(SITE_ROOT, "public", "data", "scores");
const OUTPUT_INDEXES_DIR = join(SITE_ROOT, "public", "data", "indexes");
const OUTPUT_CATALOG_PATH = join(SITE_ROOT, "public", "data", "index.json");
const KNOWN_COLLISIONS_PATH = join(__dirname, "known-collisions.json");

// ─── Cross-index slug collision ratchet ───────────────────────────────────────
//
// Badge/catalog output keys files by slug alone; a slug that appears in more
// than one index means /data/scores/<slug>.json silently serves whichever
// index was written last (see RISK-017/018). known-collisions.json is a
// committed, dated allowlist of the collisions we already know about. This
// function is pure so it can be exercised with in-memory fixtures in
// test-collision-ratchet.mjs without touching real index data.

/**
 * @param {Record<string, string[]>} recordsByIndex - indexSlug -> array of
 *   final (post intra-index-disambiguation) slugs written for that index.
 * @param {Array<{slug: string, indexes: [string, string], note?: string}>} knownCollisions
 * @returns {{
 *   unexpected: Array<{slug: string, indexes: [string, string]}>,
 *   resolved: Array<{slug: string, indexes: [string, string], note?: string}>,
 *   known: Array<{slug: string, indexes: [string, string], note?: string}>,
 * }}
 */
export function detectCollisions(recordsByIndex, knownCollisions) {
  const slugToIndexes = new Map();
  for (const [indexSlug, slugs] of Object.entries(recordsByIndex)) {
    for (const slug of slugs) {
      if (!slugToIndexes.has(slug)) slugToIndexes.set(slug, new Set());
      slugToIndexes.get(slug).add(indexSlug);
    }
  }

  // All actual pairwise collisions found in the current data, keyed by
  // slug + sorted index pair so they can be compared against the allowlist
  // regardless of index-declaration order.
  const actual = new Map();
  for (const [slug, indexSet] of slugToIndexes) {
    if (indexSet.size < 2) continue;
    const indexes = [...indexSet].sort();
    for (let i = 0; i < indexes.length; i++) {
      for (let j = i + 1; j < indexes.length; j++) {
        const key = `${slug}::${indexes[i]}::${indexes[j]}`;
        actual.set(key, { slug, indexes: [indexes[i], indexes[j]] });
      }
    }
  }

  const knownByKey = new Map();
  for (const entry of knownCollisions) {
    const sortedIndexes = [...entry.indexes].sort();
    const key = `${entry.slug}::${sortedIndexes[0]}::${sortedIndexes[1]}`;
    knownByKey.set(key, entry);
  }

  const unexpected = [];
  const known = [];
  for (const [key, collision] of actual) {
    if (knownByKey.has(key)) {
      known.push(knownByKey.get(key));
    } else {
      unexpected.push(collision);
    }
  }

  const resolved = [];
  for (const [key, entry] of knownByKey) {
    if (!actual.has(key)) resolved.push(entry);
  }

  return { unexpected, resolved, known };
}

// ─── Slug generation (mirrors entities.ts / lib/slugify) ─────────────────────

/**
 * Convert a name to a URL-safe kebab-case slug.
 * Must match the slug convention in site/src/lib/slugify.ts and the
 * overnight pipeline so badge URLs align with entity detail page URLs.
 */
function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Normalize band to Title Case.
 * Index files may use lowercase band values; the Worker and badge render use
 * normalized values.
 */
function normalizeBand(raw) {
  const b = raw.toLowerCase();
  if (b.startsWith("exempl")) return "Exemplary";
  if (b.startsWith("establ")) return "Established";
  if (b.startsWith("funct")) return "Functional";
  if (b.startsWith("devel")) return "Developing";
  if (b.startsWith("crit")) return "Critical";
  return raw;
}

// ─── Main ────────────────────────────────────────────────────────────────────

function main() {
  const updatedAt = new Date().toISOString();
  console.log(`[export-public-data] Starting — ${updatedAt}`);

  mkdirSync(OUTPUT_SCORES_DIR, { recursive: true });
  mkdirSync(OUTPUT_INDEXES_DIR, { recursive: true });

  const catalog = []; // { slug, name, indexSlug, kind, rank }
  let totalEntities = 0;

  for (const { file, indexSlug, kind } of INDEX_FILES) {
    const indexPath = join(INDEXES_DIR, file);
    let indexData;

    try {
      indexData = JSON.parse(readFileSync(indexPath, "utf-8"));
    } catch (err) {
      console.error(`[export-public-data] ERROR: Could not read ${file}: ${err.message}`);
      process.exit(1);
    }

    const rankings = indexData.rankings ?? [];

    // Build slug usage map for this index (to handle intra-index collisions).
    // When a row has an explicit `slug` field, use it directly (bypassing
    // slugify) so computed slugs stay aligned with the source JSON.
    const slugCounts = new Map();
    for (const row of rankings) {
      const base = row.slug ?? slugify(row.name);
      slugCounts.set(base, (slugCounts.get(base) ?? 0) + 1);
    }

    const slugUsage = new Map();
    let indexEntities = 0;

    for (const row of rankings) {
      const baseSlug = row.slug ?? slugify(row.name);

      // Disambiguate: same logic as entities.ts buildEntities()
      // (explicit-slug indexes rarely have collisions, but guard anyway)
      let slug = baseSlug;
      if ((slugCounts.get(baseSlug) ?? 0) > 1) {
        const used = slugUsage.get(baseSlug) ?? 0;
        slugUsage.set(baseSlug, used + 1);
        slug = used === 0 ? baseSlug : `${baseSlug}-${row.rank}`;
      }

      const scoreRecord = {
        slug,
        name: row.name,
        composite: row.composite,
        band: normalizeBand(row.band),
        indexSlug,
        kind,
        rank: row.rank,
        updatedAt,
      };

      const outPath = join(OUTPUT_SCORES_DIR, `${slug}.json`);
      writeFileSync(outPath, JSON.stringify(scoreRecord, null, 2));

      catalog.push({
        slug,
        name: row.name,
        indexSlug,
        kind,
        rank: row.rank,
        composite: row.composite,
        band: normalizeBand(row.band),
      });

      indexEntities++;
    }

    // ── Per-index aggregate JSON (for DataDownload in Dataset schema) ─────
    // Written to site/public/data/indexes/<slug>.json.
    // Consumed by DatasetJsonLd.tsx as an application/json DataDownload,
    // served at /data/indexes/<slug>.json in production.
    // Shape: { meta, generatedAt, rankings: [{slug, name, composite, band, rank, scores}] }
    // Slug logic mirrors the main loop above (which already built slugCounts + slugUsage).
    // We re-use the same counts map; slugUsage was already advanced per row above,
    // so we re-derive slugs from scratch here to avoid a second pass with state drift.
    const slugCounts3 = new Map();
    for (const row of indexData.rankings ?? []) {
      const b = row.slug ?? slugify(row.name);
      slugCounts3.set(b, (slugCounts3.get(b) ?? 0) + 1);
    }
    const slugUsage3 = new Map();
    const indexRankings = [];
    for (const row of indexData.rankings ?? []) {
      const baseSlug = row.slug ?? slugify(row.name);
      let aggSlug = baseSlug;
      if ((slugCounts3.get(baseSlug) ?? 0) > 1) {
        const used = slugUsage3.get(baseSlug) ?? 0;
        slugUsage3.set(baseSlug, used + 1);
        aggSlug = used === 0 ? baseSlug : `${baseSlug}-${row.rank}`;
      }
      indexRankings.push({
        slug: aggSlug,
        rank: row.rank,
        name: row.name,
        composite: row.composite,
        band: normalizeBand(row.band),
        scores: row.scores ?? {},
      });
    }
    const indexAggregate = {
      generatedAt: updatedAt,
      meta: indexData.meta ?? {},
      rankings: indexRankings,
    };
    const indexOutPath = join(OUTPUT_INDEXES_DIR, `${indexSlug}.json`);
    writeFileSync(indexOutPath, JSON.stringify(indexAggregate, null, 2));

    console.log(`[export-public-data]   ${indexSlug}: ${indexEntities} entities → data/indexes/${indexSlug}.json`);
    totalEntities += indexEntities;
  }

  // Write catalog
  const catalogData = {
    generatedAt: updatedAt,
    totalEntities,
    indexes: INDEX_FILES.map((i) => i.indexSlug),
    entities: catalog,
  };
  writeFileSync(OUTPUT_CATALOG_PATH, JSON.stringify(catalogData, null, 2));

  // ── Cross-index slug collision ratchet ──────────────────────────────────
  const recordsByIndex = {};
  for (const entry of catalog) {
    (recordsByIndex[entry.indexSlug] ??= []).push(entry.slug);
  }

  const knownCollisionsFile = JSON.parse(readFileSync(KNOWN_COLLISIONS_PATH, "utf-8"));
  const { unexpected, resolved, known } = detectCollisions(
    recordsByIndex,
    knownCollisionsFile.collisions
  );

  console.log(
    `[export-public-data] Cross-index slug collision ratchet: ${known.length} known, ` +
    `${unexpected.length} unexpected, ${resolved.length} resolved.`
  );

  let ratchetFailed = false;

  if (unexpected.length > 0) {
    ratchetFailed = true;
    console.error(
      `[export-public-data] ERROR: ${unexpected.length} unexpected cross-index slug ` +
      `collision(s) — not in scripts/known-collisions.json:`
    );
    for (const c of unexpected) {
      console.error(
        `  - "${c.slug}" appears in both ${c.indexes[0]} and ${c.indexes[1]}. ` +
        `Badge/catalog output for this slug would silently serve the last-written index. ` +
        `Fix the underlying slug collision, or if intentional and reviewed, add it to ` +
        `scripts/known-collisions.json.`
      );
    }
  }

  if (resolved.length > 0) {
    ratchetFailed = true;
    console.error(
      `[export-public-data] ERROR: ${resolved.length} known collision(s) in ` +
      `scripts/known-collisions.json no longer occur:`
    );
    for (const c of resolved) {
      console.error(
        `  - "${c.slug}" (${c.indexes[0]} vs ${c.indexes[1]}) — resolved — remove it from the list`
      );
    }
  }

  if (ratchetFailed) {
    process.exit(1);
  }

  if (known.length > 0) {
    console.warn(
      `[export-public-data] WARN: ${known.length} known cross-index slug collision(s) remain ` +
      `(see scripts/known-collisions.json). Badge for each will serve the LAST written index's data.`
    );
    for (const c of known) {
      console.warn(`  - "${c.slug}" — ${c.indexes[0]} vs ${c.indexes[1]}${c.note ? `: ${c.note}` : ""}`);
    }
  }

  console.log(
    `[export-public-data] Done — ${totalEntities} entity files written to ` +
    `site/public/data/scores/ + catalog at site/public/data/index.json ` +
    `+ ${INDEX_FILES.length} index aggregates at site/public/data/indexes/`
  );
}

// Only run when executed directly (not when imported for testing).
if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  main();
}
