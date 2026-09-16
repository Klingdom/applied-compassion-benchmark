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
 *
 * Entity-identity resolution (2026-09-16 regression fix, RISK-018-class):
 *  - Daily briefings are dated artifacts and are never retro-edited, so they
 *    legitimately keep referring to entities by whatever slug/name convention
 *    was current on the day they were published. When an entity is later
 *    renamed/rekeyed in the catalogue (e.g. `johnson-amp-johnson` pinned to
 *    `johnson-and-johnson`), briefing references must be resolved to the
 *    CURRENT catalogue slug before history is written, or history silently
 *    detaches from the entity it belongs to (production 404s).
 *  - See resolveEntityReference() below and its module comment for the exact
 *    resolution order. The alias-derivation functions are a deliberate copy
 *    of research/scripts/validate-rotation-state.mjs's deriveAliasSlugs() —
 *    not an import, per this task's site/research boundary — kept in sync by
 *    comment pointer; update both if the slugging convention changes.
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync, unlinkSync } from "node:fs";
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

// ─── Entity-identity resolution ─────────────────────────────────────────────
//
// Copied (not imported) from research/scripts/validate-rotation-state.mjs's
// deriveAliasSlugs() and its supporting slugify* functions. That file is the
// canonical description of the three historical slugging conventions this
// project has used; read its module comment before changing anything here.

/** Strip combining diacritical marks after NFKD decomposition (Côte -> Cote). */
export function foldAccents(str) {
  return str.normalize("NFKD").replace(/[̀-ͯ]/g, "");
}

/**
 * The CURRENT slug convention (mirrors site/src/lib/slugify.ts): accents
 * folded, `&` spelled as "and", `'`/`.`/`,` dropped outright.
 */
export function slugifyCurrent(name) {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, "and")
    .replace(/'/g, "")
    .replace(/\./g, "")
    .replace(/,/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
}

/**
 * The OLDER "naive" slug convention: no accent folding, no `&`/`'`
 * special-casing — any run of non-alphanumeric characters collapses to a
 * single hyphen.
 */
export function slugifyNaive(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Naive slugify with accents folded first (produces the "unfolded" apostrophe form). */
export function slugifyNaiveFolded(name) {
  return slugifyNaive(foldAccents(name));
}

/**
 * The short-lived HTML-entity-encoded convention: `&` spelled out as "amp",
 * `'` spelled out as "x27" (e.g. deere-amp-company, at-amp-t).
 */
export function slugifyHtmlEncoded(name) {
  const encoded = foldAccents(name).replace(/&/g, " amp ").replace(/'/g, " x27 ");
  return slugifyNaive(encoded);
}

/**
 * Some catalogue slugs are disambiguated by appending "-<index>" to avoid a
 * cross-index collision (e.g. georgia-us-states vs. georgia the country).
 * Strip that suffix to recover the bare alias a briefing might reference.
 */
export function indexSuffixStripped(slug, index) {
  if (!index) return null;
  const suffix = `-${index}`;
  if (slug.endsWith(suffix) && slug.length > suffix.length) {
    return slug.slice(0, -suffix.length);
  }
  return null;
}

/** All distinct, non-empty alias candidates for (currentSlug, currentName, indexSlug). */
export function deriveAliasSlugs(slug, name, index) {
  const candidates = [
    slugifyCurrent(name),
    slugifyNaive(name),
    slugifyNaiveFolded(name),
    slugifyHtmlEncoded(name),
    indexSuffixStripped(slug, index),
  ];
  const seen = new Set([slug]);
  const out = [];
  for (const alias of candidates) {
    if (alias && !seen.has(alias)) {
      seen.add(alias);
      out.push(alias);
    }
  }
  return out;
}

/** Decode the HTML entities briefings may carry in free-text name fields, and normalize for comparison. */
export function normalizeNameForMatch(str) {
  if (!str) return "";
  return str
    .replace(/&amp;/g, "&")
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

/**
 * Build the lookup structures resolveEntityReference() needs from the current
 * entity catalogue (site/public/data/index.json's `entities` array).
 *
 *   byIndexSlug : `${indexSlug}:${slug}` -> entity      (exact current slug)
 *   byAlias     : `${indexSlug}:${alias}` -> entity     (derived historical slug)
 *   byIndexName : `${indexSlug}:${normalizedName}` -> entity[]  (decoded-name match)
 *
 * byAlias is first-write-wins on collision: if two entities in the same index
 * happen to derive the same historical alias, the first one encountered
 * claims it and the alias is not offered to the other. This is conservative
 * (a genuine ambiguous alias should not silently resolve to the wrong
 * entity) rather than exhaustive.
 */
export function buildResolutionContext(catalog) {
  const byIndexSlug = new Map();
  const byAlias = new Map();
  const byIndexName = new Map();

  for (const e of catalog.entities) {
    byIndexSlug.set(`${e.indexSlug}:${e.slug}`, e);

    for (const alias of deriveAliasSlugs(e.slug, e.name, e.indexSlug)) {
      const aliasKey = `${e.indexSlug}:${alias}`;
      if (!byAlias.has(aliasKey)) byAlias.set(aliasKey, e);
    }

    const nameKey = `${e.indexSlug}:${normalizeNameForMatch(e.name)}`;
    if (!byIndexName.has(nameKey)) byIndexName.set(nameKey, []);
    byIndexName.get(nameKey).push(e);
  }

  return { byIndexSlug, byAlias, byIndexName };
}

/**
 * Resolve a briefing-derived entity reference (its `slug`/`index`, plus
 * whatever free-text name field the briefing carries, e.g. `entity`) to the
 * CURRENT catalogue slug.
 *
 * Resolution order:
 *   1. Exact current slug — the reference already matches a live catalog entry.
 *   2. Decoded name match — HTML-entity-decoded, case/whitespace-normalized
 *      name match within the same index (only used if it is unambiguous).
 *   3. Derived alias forms of the historical slug (see deriveAliasSlugs above).
 *
 * Returns { slug, indexSlug, entity, method } on success ("exact" | "name" |
 * "alias"), or null if none of the three resolve.
 */
export function resolveEntityReference(rawSlug, rawIndex, rawName, ctx) {
  if (!rawSlug || !rawIndex) return null;

  const key = `${rawIndex}:${rawSlug}`;

  const exact = ctx.byIndexSlug.get(key);
  if (exact) return { slug: exact.slug, indexSlug: exact.indexSlug, entity: exact, method: "exact" };

  if (rawName) {
    const nameKey = `${rawIndex}:${normalizeNameForMatch(rawName)}`;
    const nameMatches = ctx.byIndexName.get(nameKey);
    if (nameMatches && nameMatches.length === 1) {
      const e = nameMatches[0];
      return { slug: e.slug, indexSlug: e.indexSlug, entity: e, method: "name" };
    }
  }

  const alias = ctx.byAlias.get(key);
  if (alias) return { slug: alias.slug, indexSlug: alias.indexSlug, entity: alias, method: "alias" };

  return null;
}

// ─── Briefing scan (pure, injectable I/O — used directly by disk-free tests) ──

/**
 * Scan every briefing date and accumulate entity events + ruling
 * associations, resolving every briefing entity reference to its CURRENT
 * catalogue slug via resolveEntityReference() (see module comment).
 *
 * `loadDaily(date)` is injectable so tests can supply in-memory fixtures
 * instead of reading site/src/data/updates/daily/<date>.json from disk.
 *
 * Returns:
 *   {
 *     entityEvents,            // Map<"indexSlug:slug", HistoryEvent[]> keyed by CURRENT slug
 *     entityMeta,              // Map<"indexSlug:slug", {name, slug, indexSlug}>
 *     entityRulings,           // Map<"indexSlug:slug", Map<rulingNumber, ref>>
 *     eventRulingRefs,         // Map<"indexSlug:slug:date", ref>
 *     canonicalRawKeySources,  // Map<"indexSlug:slug", Set<rawKey>> — for merge reporting
 *     resolutionStats,         // { exact, name, alias } counts
 *     resolvedRawKeys,         // Set<rawKey> resolved via name/alias (non-exact)
 *     unresolvedRefs,          // Map<rawKey, { rawSlug, index, name, firstDate, count }>
 *   }
 */
export function accumulateBriefingEvents(dates, loadDaily, resolutionCtx) {
  const resolutionStats = { exact: 0, name: 0, alias: 0 };
  const resolvedRawKeys = new Set();
  const unresolvedRefs = new Map();

  function resolveKey(rawSlug, rawIndex, rawName, date) {
    if (!rawSlug || !rawIndex) return null;
    const resolved = resolveEntityReference(rawSlug, rawIndex, rawName, resolutionCtx);
    if (!resolved) {
      const rawKey = `${rawIndex}:${rawSlug}`;
      if (!unresolvedRefs.has(rawKey)) {
        unresolvedRefs.set(rawKey, { rawSlug, index: rawIndex, name: rawName || rawSlug, firstDate: date, count: 0 });
      }
      unresolvedRefs.get(rawKey).count++;
      return null;
    }
    if (resolved.method !== "exact") {
      resolvedRawKeys.add(`${rawIndex}:${rawSlug}`);
    }
    resolutionStats[resolved.method]++;
    return `${resolved.indexSlug}:${resolved.slug}`;
  }

  const entityEvents = new Map();
  const entityMeta = new Map();
  const entityRulings = new Map();
  const eventRulingRefs = new Map();
  const canonicalRawKeySources = new Map();

  // Iterate dates newest-first (manifest.dates is reverse-chrono)
  for (const date of dates) {
    const daily = loadDaily(date);
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

    // Build set of CANONICAL indexSlug:slug keys for entities in topSignals on
    // this date, so ruling attachment below lands on the same key the entity's
    // events are accumulated under (see resolveKey / entityEvents). This is a
    // quiet resolve (resolveEntityReference directly, not resolveKey) — it
    // does not affect resolutionStats/unresolvedRefs, which are scored off the
    // actual event sources (recentAssessments/boundaryWatch/scoreChanges)
    // below. An unresolvable topSignal slug falls back to its raw key, which
    // simply never matches any accumulated entity and is harmless.
    const topSignalSlugKeys = new Set();
    for (const ts of topSignals) {
      if (ts.slug && ts.index) {
        const resolved = resolveEntityReference(ts.slug, ts.index, null, resolutionCtx);
        topSignalSlugKeys.add(resolved ? `${resolved.indexSlug}:${resolved.slug}` : `${ts.index}:${ts.slug}`);
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
      const rawSlug = ra.slug;
      const rawIndex = ra.index;
      if (!rawSlug || !rawIndex) continue;

      const key = resolveKey(rawSlug, rawIndex, ra.entity, date);
      if (!key) continue; // unresolvable — recorded in unresolvedRefs, no dead file written
      const [index, slug] = [key.split(":")[0], key.slice(key.indexOf(":") + 1)];

      if (!entityEvents.has(key)) entityEvents.set(key, []);
      if (!entityMeta.has(key)) {
        entityMeta.set(key, { name: ra.entity || slug, slug, indexSlug: index });
      }
      if (!canonicalRawKeySources.has(key)) canonicalRawKeySources.set(key, new Set());
      canonicalRawKeySources.get(key).add(`${rawIndex}:${rawSlug}`);

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
      // NOTE: matched against the RAW slug/index — topSignals in this same
      // daily file share whatever slug convention was current the day this
      // briefing was published, so this is an intra-day match, not a
      // cross-day identity resolution.
      const topSignalEntry = topSignals.find((ts) => ts.slug === rawSlug && ts.index === rawIndex);
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
      const rawSlug = bw.slug;
      const rawIndex = bw.index;
      if (!rawSlug || !rawIndex) continue;

      const key = resolveKey(rawSlug, rawIndex, bw.entity, date);
      if (!key) continue; // unresolvable — recorded in unresolvedRefs, no dead file written
      const slug = key.slice(key.indexOf(":") + 1);
      const index = key.split(":")[0];

      if (!entityEvents.has(key)) entityEvents.set(key, []);
      if (!entityMeta.has(key)) {
        entityMeta.set(key, { name: bw.entity || slug, slug, indexSlug: index });
      }
      if (!canonicalRawKeySources.has(key)) canonicalRawKeySources.set(key, new Set());
      canonicalRawKeySources.get(key).add(`${rawIndex}:${rawSlug}`);

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
      const rawSlug = sc.slug;
      const rawIndex = sc.index;
      if (!rawSlug || !rawIndex) continue;

      const key = resolveKey(rawSlug, rawIndex, sc.entity || sc.name, date);
      if (!key) continue; // unresolvable — recorded in unresolvedRefs, no dead file written
      const slug = key.slice(key.indexOf(":") + 1);
      const index = key.split(":")[0];

      if (!entityEvents.has(key)) entityEvents.set(key, []);
      if (!entityMeta.has(key)) {
        const name = sc.entity || sc.name || slug;
        entityMeta.set(key, { name, slug, indexSlug: index });
      }
      if (!canonicalRawKeySources.has(key)) canonicalRawKeySources.set(key, new Set());
      canonicalRawKeySources.get(key).add(`${rawIndex}:${rawSlug}`);

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

  return {
    entityEvents,
    entityMeta,
    entityRulings,
    eventRulingRefs,
    canonicalRawKeySources,
    resolutionStats,
    resolvedRawKeys,
    unresolvedRefs,
  };
}

/**
 * Build the serializable history-file object for one entity's deduped,
 * classified, compacted event list. Returns null if there are no events
 * (callers must not write a file in that case).
 *
 * Pure function — no disk I/O — so tests can call it directly on synthetic
 * events without going through accumulateBriefingEvents()/main().
 */
export function buildHistoryFileForEntity(key, events, ctx) {
  const { entityMeta, entityInfo, entityRulings, eventRulingRefs, generatedAt, generatedAtDate, compactionCutoff } = ctx;

  if (!events || events.length === 0) return null;

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

  return {
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

  // Briefings are dated artifacts and keep referring to entities by whatever
  // slug/name was current on the day they were published. Resolve every
  // reference to the CURRENT catalogue slug before accumulating events, so
  // history follows the entity rather than the string in a dated briefing.
  const resolutionCtx = buildResolutionContext(catalog);

  const {
    entityEvents,
    entityMeta,
    entityRulings,
    eventRulingRefs,
    canonicalRawKeySources,
    resolutionStats,
    resolvedRawKeys,
    unresolvedRefs,
  } = accumulateBriefingEvents(
    manifest.dates,
    (date) => readJson(join(DAILY_DIR, `${date}.json`)),
    resolutionCtx
  );

  // ── Output ───────────────────────────────────────────────────────────────
  mkdirSync(OUTPUT_HISTORY_DIR, { recursive: true });

  // ── Prune stale history files ────────────────────────────────────────────
  // A history file whose slug matches no current catalogue entity is a dead
  // file — most commonly the leftover output of a prior run, written under a
  // slug that has since been renamed/rekeyed (e.g. johnson-amp-johnson.json
  // after the catalogue pinned johnson-and-johnson). site/public/data is
  // gitignored and regenerated on every build, so it is safe to delete these
  // outright rather than merely flagging them — a fresh run is the source of
  // truth, and leaving them in place is exactly the RISK-018-class regression
  // this fix addresses. Deletion is scoped to "<slug>.json" files whose bare
  // slug matches NO entity anywhere in the current catalogue (regardless of
  // index); a current entity that simply has zero events this run is left
  // untouched (out of scope for this fix — see handoff notes).
  const catalogSlugs = new Set(catalog.entities.map((e) => e.slug));
  const prunedStaleFiles = [];
  let preExistingFiles = [];
  try {
    preExistingFiles = readdirSync(OUTPUT_HISTORY_DIR).filter((f) => f.endsWith(".json") && f !== "_manifest.json");
  } catch {
    preExistingFiles = [];
  }
  for (const f of preExistingFiles) {
    const slug = f.slice(0, -".json".length);
    if (!catalogSlugs.has(slug)) {
      try {
        unlinkSync(join(OUTPUT_HISTORY_DIR, f));
        prunedStaleFiles.push(slug);
      } catch (err) {
        console.warn(`[build-entity-history] WARN: could not delete stale history file ${f}: ${err.message}`);
      }
    }
  }

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
    const historyFile = buildHistoryFileForEntity(key, events, {
      entityMeta,
      entityInfo,
      entityRulings,
      eventRulingRefs,
      generatedAt,
      generatedAtDate,
      compactionCutoff,
    });
    if (!historyFile) continue; // no events — no file written (see buildHistoryFileForEntity)

    const { slug, kind, tierCounts, compactedRuns, events: eventsAfterCompaction } = historyFile;

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
    globalTierCounts.compactedRuns += compactedRuns.length;
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

  // ── Entity-identity resolution summary ───────────────────────────────────
  const mergedKeys = [...canonicalRawKeySources.entries()].filter(([, raws]) => raws.size > 1);
  const unresolvedList = [...unresolvedRefs.values()];

  console.log(``);
  console.log(`[build-entity-history] Entity-identity resolution:`);
  console.log(
    `  Reference resolutions: exact=${resolutionStats.exact} name-match=${resolutionStats.name} alias-match=${resolutionStats.alias} (distinct non-exact raw refs: ${resolvedRawKeys.size})`
  );
  console.log(`  Merged history (old-slug + new-slug events unified into one file): ${mergedKeys.length}`);
  for (const [key, raws] of mergedKeys.slice(0, 5)) {
    console.log(`    ${key}  <-  ${[...raws].join(", ")}`);
  }
  console.log(`  Unresolvable references (no current catalogue entity found): ${unresolvedList.length}`);
  if (unresolvedList.length > 0) {
    console.log(`    First ${Math.min(5, unresolvedList.length)}:`);
    for (const u of unresolvedList.slice(0, 5)) {
      console.log(`      ${u.index}:${u.rawSlug}  ("${u.name}")  seen ${u.count}x, first ${u.firstDate}`);
    }
  }
  console.log(`  Stale history files pruned (slug matches no current entity): ${prunedStaleFiles.length}`);
  if (prunedStaleFiles.length > 0) {
    console.log(`    ${prunedStaleFiles.slice(0, 10).join(", ")}${prunedStaleFiles.length > 10 ? ", …" : ""}`);
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

// ── CLI guard ────────────────────────────────────────────────────────────
// Only run main() when this file is executed directly (`node
// build-entity-history.mjs`), not when its exported functions are imported
// by test-build-entity-history.mjs for in-memory, disk-free fixture tests.
const isMainModule = (() => {
  try {
    return process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
  } catch {
    return false;
  }
})();

if (isMainModule) {
  main();
}
