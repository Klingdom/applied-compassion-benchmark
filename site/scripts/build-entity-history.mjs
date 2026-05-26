#!/usr/bin/env node
/**
 * build-entity-history.mjs — Per-Entity Score History Aggregator
 *
 * Reads every daily briefing and produces:
 *   site/public/data/history/<slug>.json   — one file per entity with events
 *   site/public/data/history/_manifest.json — catalog of all slugs with ≥1 event
 *
 * Run: node site/scripts/build-entity-history.mjs
 * Also wired into npm run prebuild (runs before next build).
 *
 * Data sources:
 *  - site/src/data/updates/manifest.json      (date list)
 *  - site/src/data/updates/daily/<date>.json  (briefing data)
 *  - site/public/data/index.json              (entity catalog with current scores)
 *
 * Event types produced:
 *  - "scored"         : from recentAssessments (formal apply/hold/no-change)
 *  - "boundary-watch" : from boundaryWatch (monitored, no score change)
 *  - "score-change"   : from legacy scoreChanges field (pre-May 2026 format)
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const SITE_ROOT = resolve(__dirname, "..");

const MANIFEST_PATH = join(SITE_ROOT, "src", "data", "updates", "manifest.json");
const DAILY_DIR = join(SITE_ROOT, "src", "data", "updates", "daily");
const ENTITY_CATALOG_PATH = join(SITE_ROOT, "public", "data", "index.json");
const OUTPUT_HISTORY_DIR = join(SITE_ROOT, "public", "data", "history");

// ─── Helpers ─────────────────────────────────────────────────────────────────

function normalizeBand(raw) {
  if (!raw) return "Unknown";
  const b = String(raw).toLowerCase();
  if (b.startsWith("exempl")) return "Exemplary";
  if (b.startsWith("establ")) return "Established";
  if (b.startsWith("funct")) return "Functional";
  if (b.startsWith("devel")) return "Developing";
  if (b.startsWith("crit")) return "Critical";
  return raw;
}

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, "utf-8"));
  } catch {
    return null;
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
  const startedAt = new Date().toISOString();
  console.log(`[build-entity-history] Starting — ${startedAt}`);

  // Load manifest and entity catalog
  const manifest = readJson(MANIFEST_PATH);
  if (!manifest || !Array.isArray(manifest.dates)) {
    console.error("[build-entity-history] ERROR: Could not read manifest.json");
    process.exit(1);
  }

  const catalog = readJson(ENTITY_CATALOG_PATH);
  if (!catalog || !Array.isArray(catalog.entities)) {
    console.error("[build-entity-history] ERROR: Could not read index.json");
    process.exit(1);
  }

  // Build entity info map from catalog: slug → { name, kind, indexSlug, composite, band, rank }
  const entityInfo = new Map();
  for (const e of catalog.entities) {
    // Use indexSlug:slug as key to handle cross-index entries with same slug
    entityInfo.set(`${e.indexSlug}:${e.slug}`, e);
    // Also index by slug alone (last-write-wins for cross-index collisions)
    entityInfo.set(e.slug, e);
  }

  // Accumulate events per entity: Map<"indexSlug:slug", HistoryEvent[]>
  const entityEvents = new Map(); // key: "indexSlug:slug"
  const entityMeta = new Map();   // key: "indexSlug:slug" → {name, slug, indexSlug, kind}

  // Iterate dates newest-first (manifest.dates is reverse-chrono)
  for (const date of manifest.dates) {
    const dailyPath = join(DAILY_DIR, `${date}.json`);
    const daily = readJson(dailyPath);
    if (!daily) {
      console.warn(`[build-entity-history] WARN: Could not read ${date}.json`);
      continue;
    }

    // ── 1. recentAssessments (new format, post Apr 2026) ──────────────────
    const recentAssessments = Array.isArray(daily.recentAssessments)
      ? daily.recentAssessments
      : [];

    for (const ra of recentAssessments) {
      const slug = ra.slug;
      const index = ra.index;
      if (!slug || !index) continue;

      const key = `${index}:${slug}`;
      if (!entityEvents.has(key)) entityEvents.set(key, []);
      if (!entityMeta.has(key)) {
        entityMeta.set(key, { name: ra.entity || slug, slug, indexSlug: index });
      }

      // Extract headline: prefer whyHeadline (new format), fall back to entity name
      const headline = ra.whyHeadline || ra.entity || slug;

      // Extract composite values
      const newComposite = ra.assessed !== undefined ? ra.assessed : null;
      const delta = ra.delta !== undefined ? ra.delta : null;
      const newBand = newComposite !== null
        ? normalizeBandFromComposite(newComposite)
        : null;

      entityEvents.get(key).push({
        date,
        type: "scored",
        headline: truncate(headline, 160),
        delta,
        newComposite,
        newBand,
        status: ra.status || null,
        briefingPath: `/updates/${date}`,
      });
    }

    // ── 2. boundaryWatch (new format, appears from May 2026) ──────────────
    const boundaryWatch = Array.isArray(daily.boundaryWatch)
      ? daily.boundaryWatch
      : [];

    for (const bw of boundaryWatch) {
      const slug = bw.slug;
      const index = bw.index;
      if (!slug || !index) continue;

      const key = `${index}:${slug}`;
      if (!entityEvents.has(key)) entityEvents.set(key, []);
      if (!entityMeta.has(key)) {
        entityMeta.set(key, { name: bw.entity || slug, slug, indexSlug: index });
      }

      const headline = bw.trigger || bw.note || `${bw.entity} monitored at boundary`;
      const score = bw.score !== undefined ? bw.score : null;
      const newBand = score !== null ? normalizeBandFromComposite(score) : null;

      entityEvents.get(key).push({
        date,
        type: "boundary-watch",
        headline: truncate(headline, 160),
        delta: null,
        newComposite: score,
        newBand,
        status: bw.status || "boundary-watch",
        cycle: bw.cycle || null,
        briefingPath: `/updates/${date}`,
      });
    }

    // ── 3. Legacy scoreChanges (older format, April–early May 2026) ───────
    const scoreChanges = Array.isArray(daily.scoreChanges)
      ? daily.scoreChanges
      : [];

    for (const sc of scoreChanges) {
      const slug = sc.slug;
      const index = sc.index;
      if (!slug || !index) continue;

      const key = `${index}:${slug}`;
      if (!entityEvents.has(key)) entityEvents.set(key, []);
      if (!entityMeta.has(key)) {
        const name = sc.entity || sc.name || slug;
        entityMeta.set(key, { name, slug, indexSlug: index });
      }

      const headline = sc.headline || sc.rationale || sc.entity || slug;
      const delta = sc.delta !== undefined ? sc.delta : null;
      const newComposite = sc.assessedScore !== undefined ? sc.assessedScore
        : sc.proposedScore !== undefined ? sc.proposedScore
        : null;
      const newBand = newComposite !== null
        ? normalizeBandFromComposite(newComposite)
        : (sc.assessedBand ? normalizeBand(sc.assessedBand)
          : sc.proposedBand ? normalizeBand(sc.proposedBand)
          : null);

      entityEvents.get(key).push({
        date,
        type: "scored",
        headline: truncate(headline, 160),
        delta,
        newComposite,
        newBand,
        status: sc.status || sc.recommendation || null,
        briefingPath: `/updates/${date}`,
      });
    }
  }

  // ── Output ───────────────────────────────────────────────────────────────
  mkdirSync(OUTPUT_HISTORY_DIR, { recursive: true });

  const generatedAt = new Date().toISOString();
  const manifestByKind = {
    company: [],
    country: [],
    "us-state": [],
    "ai-lab": [],
    "robotics-lab": [],
    city: [],
    "us-city": [],
  };
  const manifestSlugs = [];

  let totalEntities = 0;
  let totalEvents = 0;
  const kindsSeen = new Set();

  for (const [key, events] of entityEvents.entries()) {
    if (events.length === 0) continue;

    const meta = entityMeta.get(key) || {};
    const slug = meta.slug || key.split(":")[1];
    const indexSlug = meta.indexSlug || key.split(":")[0];

    // Look up current entity info from catalog
    const catalogEntry = entityInfo.get(`${indexSlug}:${slug}`) || entityInfo.get(slug) || null;
    const name = catalogEntry?.name || meta.name || slug;
    const kind = catalogEntry?.kind || indexSlugToKind(indexSlug);
    const currentComposite = catalogEntry?.composite ?? null;
    const currentBand = catalogEntry?.band ?? null;
    const currentRank = catalogEntry?.rank ?? null;

    // Sort events newest-first (they were inserted newest-first from manifest iteration)
    // The manifest iterates newest-first, so events are already in reverse-chrono order
    // BUT for the same date an entity might have both scored + boundary-watch — keep relative order

    // Deduplicate: for the same (date, type) pair keep first occurrence
    const seen = new Set();
    const dedupedEvents = [];
    for (const ev of events) {
      const dedupeKey = `${ev.date}:${ev.type}`;
      if (!seen.has(dedupeKey)) {
        seen.add(dedupeKey);
        dedupedEvents.push(ev);
      }
    }

    const scoredEvents = dedupedEvents.filter(e => e.type === "scored" || e.type === "score-change");
    const boundaryWatchEvents = dedupedEvents.filter(e => e.type === "boundary-watch");

    const dates = dedupedEvents.map(e => e.date).sort();
    const firstEventDate = dates[0] || null;
    const lastEventDate = dates[dates.length - 1] || null;

    const historyFile = {
      slug,
      name,
      kind,
      indexSlug,
      currentComposite,
      currentBand,
      currentRank,
      events: dedupedEvents,
      scoredEventCount: scoredEvents.length,
      boundaryWatchCount: boundaryWatchEvents.length,
      firstEventDate,
      lastEventDate,
      generatedAt,
    };

    const outPath = join(OUTPUT_HISTORY_DIR, `${slug}.json`);
    writeFileSync(outPath, JSON.stringify(historyFile, null, 2));

    // Update manifest data
    manifestSlugs.push(slug);
    if (kind && manifestByKind[kind]) {
      manifestByKind[kind].push(slug);
      kindsSeen.add(kind);
    }

    totalEntities++;
    totalEvents += dedupedEvents.length;
  }

  // Write history manifest
  const historyManifest = {
    slugs: manifestSlugs,
    byKind: manifestByKind,
    totalEntities,
    totalEvents,
    generatedAt,
  };

  const manifestOutPath = join(OUTPUT_HISTORY_DIR, "_manifest.json");
  writeFileSync(manifestOutPath, JSON.stringify(historyManifest, null, 2));

  // Stats
  console.log(`[build-entity-history] Done.`);
  console.log(`  Entities processed: ${totalEntities}`);
  console.log(`  Total events written: ${totalEvents}`);
  console.log(`  Kinds covered: ${[...kindsSeen].join(", ")}`);
  console.log(`  History files: ${OUTPUT_HISTORY_DIR}/`);
  console.log(`  Manifest: ${manifestOutPath}`);

  // Per-kind breakdown
  for (const [kind, slugs] of Object.entries(manifestByKind)) {
    if (slugs.length > 0) {
      console.log(`    ${kind}: ${slugs.length} entities`);
    }
  }
}

// ─── Band derivation from composite score ────────────────────────────────────
// Mirrors the band thresholds used across the site
function normalizeBandFromComposite(composite) {
  if (composite === null || composite === undefined) return null;
  if (composite >= 80) return "Exemplary";
  if (composite >= 60) return "Established";
  if (composite >= 40) return "Functional";
  if (composite >= 20) return "Developing";
  return "Critical";
}

function indexSlugToKind(indexSlug) {
  const map = {
    "fortune-500": "company",
    "countries": "country",
    "us-states": "us-state",
    "ai-labs": "ai-lab",
    "robotics-labs": "robotics-lab",
    "global-cities": "city",
    "us-cities": "us-city",
  };
  return map[indexSlug] || null;
}

function truncate(str, maxLen) {
  if (!str) return "";
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 1) + "…";
}

main();
