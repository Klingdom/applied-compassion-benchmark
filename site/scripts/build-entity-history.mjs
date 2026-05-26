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
 *
 * PR 1 extensions (Entity Evidence & Retention):
 *  - Tier classification (A/B/C/D) per architect §3.2
 *  - Methodology ruling → entity slug resolution (architect §7.4)
 *  - citationUrl extraction (structured field + best-effort URL regex back-fill)
 *  - Derived fields: latestScoreChange, daysSinceLastChange, totalEventCount,
 *    tierCounts, methodologyRulings
 *  - Tier-D compaction (architect §3.3, PRD §8.1)
 *  - Extended _manifest.json with tierCountsAcrossAll
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  COMPACTION_AGE_DAYS,
  extractCitationUrl,
  computeDirectionLabel,
  classifyEventTier,
  buildRulingRef,
  computeCompactionCutoff,
  daysBetween,
  groupIntoCompactedRuns,
  computeLatestScoreChange,
  computeDaysSinceLastChange,
  computeTierCounts,
} from "./lib/entity-history-helpers.mjs";

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

  // Per-entity ruling refs accumulated during briefing scan
  // Map<"indexSlug:slug", Map<rulingNumber, MethodologyRulingRef>>
  const entityRulings = new Map();

  // Per-event ruling refs: Map<"indexSlug:slug:date", MethodologyRulingRef>
  const eventRulingRefs = new Map();

  // ── Iterate briefings, collect all events and ruling associations ──────────

  // Iterate dates newest-first (manifest.dates is reverse-chrono)
  for (const date of manifest.dates) {
    const dailyPath = join(DAILY_DIR, `${date}.json`);
    const daily = readJson(dailyPath);
    if (!daily) {
      console.warn(`[build-entity-history] WARN: Could not read ${date}.json`);
      continue;
    }

    // ── Methodology ruling resolution (architect §7.4) ─────────────────────
    //
    // For each ruling in methodologyNotes[], attach it ONLY to entity slugs
    // that appear in this day's topSignals[]. This prevents false positives
    // from short slugs ("3m", "us", "bp") that might substring-match in the
    // free-text description field.

    const methodologyNotes = Array.isArray(daily.methodologyNotes)
      ? daily.methodologyNotes
      : [];

    const topSignals = Array.isArray(daily.topSignals) ? daily.topSignals : [];

    // Build set of indexSlug:slug keys for entities in topSignals on this date
    const topSignalSlugKeys = new Set();
    for (const ts of topSignals) {
      if (ts.slug && ts.index) {
        topSignalSlugKeys.add(`${ts.index}:${ts.slug}`);
      }
    }

    // For each ruling, attach it to all entities whose slug appears in topSignals
    for (const note of methodologyNotes) {
      const ref = buildRulingRef(note, date);
      if (!ref) continue;

      for (const slugKey of topSignalSlugKeys) {
        // Accumulate per-entity ruling set (deduplicate by rulingNumber)
        if (!entityRulings.has(slugKey)) entityRulings.set(slugKey, new Map());
        const rulingMap = entityRulings.get(slugKey);
        if (!rulingMap.has(ref.rulingNumber)) {
          rulingMap.set(ref.rulingNumber, ref);
        }

        // Associate with the event on this specific date (populates rulingRef on the event)
        const eventKey = `${slugKey}:${date}`;
        eventRulingRefs.set(eventKey, ref);
      }
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

      // citationUrl extraction:
      // Pathway 1: structured field from recentAssessments or matching topSignals entry
      // Pathway 2: best-effort URL extraction from whyHeadline + topSignals description
      const topSignalEntry = topSignals.find((ts) => ts.slug === slug && ts.index === index);
      const structuredUrl = ra.citationUrl || (topSignalEntry && topSignalEntry.citationUrl) || null;
      const descriptionText = topSignalEntry ? (topSignalEntry.description || "") : "";
      const citationUrl = extractCitationUrl(structuredUrl, [
        ra.whyHeadline || "",
        descriptionText,
      ]);

      entityEvents.get(key).push({
        date,
        type: "scored",
        headline: truncate(headline, 160),
        delta,
        newComposite,
        newBand,
        status: ra.status || null,
        briefingPath: `/updates/${date}`,
        // PR 1 fields — filled in classification pass below
        tier: null,
        subThreshold: false,
        directionLabel: null,
        rulingRef: null,
        citationUrl,
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
        // PR 1 fields — filled in classification pass below
        tier: null,
        subThreshold: false,
        directionLabel: null,
        rulingRef: null,
        citationUrl: null,
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

      const citationUrl = extractCitationUrl(sc.citationUrl || null, [
        sc.headline || "",
        sc.rationale || "",
      ]);

      entityEvents.get(key).push({
        date,
        type: "scored",
        headline: truncate(headline, 160),
        delta,
        newComposite,
        newBand,
        status: sc.status || sc.recommendation || null,
        briefingPath: `/updates/${date}`,
        // PR 1 fields — filled in classification pass below
        tier: null,
        subThreshold: false,
        directionLabel: null,
        rulingRef: null,
        citationUrl,
      });
    }
  }

  // ── Output ───────────────────────────────────────────────────────────────
  mkdirSync(OUTPUT_HISTORY_DIR, { recursive: true });

  const generatedAt = new Date().toISOString();
  const compactionCutoff = computeCompactionCutoff(generatedAt);
  const generatedAtDate = generatedAt.slice(0, 10);

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

  // Aggregate tier counts across all entities for manifest
  const globalTierCounts = { A: 0, B: 0, C: 0, D: 0, compactedRuns: 0 };

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

    // ── Tier classification pass ─────────────────────────────────────────
    for (const ev of dedupedEvents) {
      const { tier, subThreshold } = classifyEventTier(ev);
      ev.tier = tier;
      ev.subThreshold = subThreshold;
      ev.directionLabel = computeDirectionLabel(ev);

      // Attach ruling ref if one was associated with this entity on this date
      const eventKey = `${key}:${ev.date}`;
      ev.rulingRef = eventRulingRefs.get(eventKey) || null;
    }

    // ── Capture totalEventCount pre-compaction ───────────────────────────
    const totalEventCountPreCompaction = dedupedEvents.length;

    // ── Tier-D compaction (architect §3.3) ───────────────────────────────
    //
    // Eligible: Tier-B events with subThreshold=true whose date < compactionCutoff.
    // The most recent Tier-B event is NEVER compacted (architect §3.4).
    // rulingRef !== null events are NEVER compacted.

    // Find the most recent Tier-B event index (protect from compaction)
    // Events are newest-first; first Tier-B encountered = most recent
    let mostRecentTierBIndex = -1;
    for (let i = 0; i < dedupedEvents.length; i++) {
      if (dedupedEvents[i].tier === "B") {
        mostRecentTierBIndex = i;
        break;
      }
    }

    const compactionEligible = dedupedEvents.filter((ev, idx) => {
      return (
        ev.tier === "B" &&
        ev.subThreshold === true &&
        ev.date < compactionCutoff &&
        ev.rulingRef === null &&
        idx !== mostRecentTierBIndex
      );
    });

    const compactedRuns = [];
    let eventsAfterCompaction = dedupedEvents;

    if (compactionEligible.length > 0) {
      const foldedEventKeys = new Set();
      const runs = groupIntoCompactedRuns(compactionEligible);

      for (const run of runs) {
        compactedRuns.push(run);
        for (const ev of run._sourceEvents) {
          foldedEventKeys.add(`${ev.date}:${ev.type}:${ev.briefingPath}`);
        }
      }

      eventsAfterCompaction = dedupedEvents.filter((ev) => {
        const evKey = `${ev.date}:${ev.type}:${ev.briefingPath}`;
        return !foldedEventKeys.has(evKey);
      });
    }

    // ── Derived fields ───────────────────────────────────────────────────

    const latestScoreChange = computeLatestScoreChange(eventsAfterCompaction);
    const daysSinceLastChange = computeDaysSinceLastChange(latestScoreChange, generatedAtDate);
    const tierCounts = computeTierCounts(eventsAfterCompaction, compactedRuns);

    // methodologyRulings: deduplicated by rulingNumber, newest first
    const rulingMap = entityRulings.get(key) || new Map();
    const methodologyRulings = Array.from(rulingMap.values()).sort(
      (a, b) => b.rulingNumber - a.rulingNumber
    );

    // scoredEventCount + boundaryWatchCount (legacy fields, preserved)
    const scoredEvents = eventsAfterCompaction.filter(
      (e) => e.type === "scored" || e.type === "score-change"
    );
    const boundaryWatchEvents = eventsAfterCompaction.filter(
      (e) => e.type === "boundary-watch"
    );

    const dates = eventsAfterCompaction.map((e) => e.date).sort();
    const firstEventDate = dates[0] || null;
    const lastEventDate = dates[dates.length - 1] || null;

    // Strip internal _sourceEvents from compactedRuns before serializing
    const cleanCompactedRuns = compactedRuns.map(({ _sourceEvents: _, ...rest }) => rest);

    const historyFile = {
      slug,
      name,
      kind,
      indexSlug,
      currentComposite,
      currentBand,
      currentRank,
      events: eventsAfterCompaction,
      scoredEventCount: scoredEvents.length,
      boundaryWatchCount: boundaryWatchEvents.length,
      firstEventDate,
      lastEventDate,
      generatedAt,
      // PR 1 derived fields
      latestScoreChange,
      methodologyRulings,
      daysSinceLastChange,
      totalEventCount: totalEventCountPreCompaction,
      tierCounts,
      compactedRuns: cleanCompactedRuns,
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
    totalEvents += eventsAfterCompaction.length;

    // Aggregate global tier counts
    globalTierCounts.A += tierCounts.A;
    globalTierCounts.B += tierCounts.B;
    globalTierCounts.C += tierCounts.C;
    globalTierCounts.D += tierCounts.D;
    globalTierCounts.compactedRuns += cleanCompactedRuns.length;
  }

  // Write history manifest
  const historyManifest = {
    slugs: manifestSlugs,
    byKind: manifestByKind,
    totalEntities,
    totalEvents,
    generatedAt,
    tierCountsAcrossAll: globalTierCounts,
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
  console.log(
    `  Tier counts (global): A=${globalTierCounts.A} B=${globalTierCounts.B} C=${globalTierCounts.C} D=${globalTierCounts.D} compactedRuns=${globalTierCounts.compactedRuns}`
  );

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
