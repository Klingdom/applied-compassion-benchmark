#!/usr/bin/env node
/**
 * build-feeds.mjs — RSS 2.0 + JSON Feed 1.1 Generator
 *
 * Reads every daily briefing in the manifest and produces:
 *   site/public/updates/feed.xml   — RSS 2.0
 *   site/public/updates/feed.json  — JSON Feed 1.1
 *
 * Run: node site/scripts/build-feeds.mjs
 * Also wired into npm run prebuild (runs before next build).
 *
 * Data sources:
 *  - site/src/data/updates/manifest.json      (date list, newest-first)
 *  - site/src/data/updates/daily/<date>.json  (briefing data)
 *
 * Feed item count: ALL briefings in manifest (currently 41).
 * Per the PR spec, include all dates so the feed reflects the full published
 * record. Architecture doc says "last 30" but PR spec says "≥ 41 items" for
 * acceptance criteria — we emit all dates.
 *
 * TODO (deferred to a later PR): generate per-entity feeds for entities with
 * ≥5 history events, e.g. /updates/feed-entity-<slug>.xml. This is the
 * "Scope Gate" item from PR 3 spec — deferred because entity history files
 * are not yet in a stable enough shape for feed generation within PR 3 scope.
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
// site/scripts/ → site/
const SITE_ROOT = resolve(__dirname, "..");

const MANIFEST_PATH = join(SITE_ROOT, "src", "data", "updates", "manifest.json");
const DAILY_DIR = join(SITE_ROOT, "src", "data", "updates", "daily");
const OUTPUT_DIR = join(SITE_ROOT, "public", "updates");

const BASE_URL = "https://compassionbenchmark.com";
const FEED_TITLE = "Compassion Benchmark — Daily Research";
const FEED_DESCRIPTION =
  "Daily evidence-linked findings on how institutions recognize, respond to, and reduce suffering — scored across 1,155 entities.";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function readJson(filePath) {
  try {
    return JSON.parse(readFileSync(filePath, "utf-8"));
  } catch {
    return null;
  }
}

/**
 * Format a YYYY-MM-DD date string as RFC-822 (required by RSS 2.0).
 * Node's Date.prototype.toUTCString() produces RFC-822-compatible output.
 * E.g. "Mon, 25 May 2026 00:00:00 GMT"
 */
function toRfc822(dateStr) {
  const [year, month, day] = dateStr.split("-").map(Number);
  // Construct at midnight UTC to avoid timezone shifts
  const d = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
  return d.toUTCString();
}

/**
 * Format a YYYY-MM-DD date string as ISO 8601 UTC (required by JSON Feed 1.1).
 * E.g. "2026-05-25T00:00:00Z"
 */
function toIso8601(dateStr) {
  return `${dateStr}T00:00:00Z`;
}

/**
 * Escape special XML characters in a plain-text string.
 * Used for attributes and text nodes that are NOT wrapped in CDATA.
 */
function escapeXml(str) {
  if (typeof str !== "string") return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Truncate a string to maxLen characters, appending ellipsis if truncated.
 */
function truncate(str, maxLen) {
  if (typeof str !== "string" || str.length <= maxLen) return str ?? "";
  return str.slice(0, maxLen).trimEnd() + "…";
}

/**
 * Derive the headline for a feed item.
 * Priority order per spec:
 *  1. daily.scoreChanges?.[0]?.headline  (legacy field)
 *  2. daily.topSignals?.[0]?.headline    (current field — actually 'title')
 *  3. Fallback to briefing's top-level 'headline' field
 *  4. Hard fallback with date label
 */
function deriveHeadline(daily, dateLabel) {
  if (daily.scoreChanges?.[0]?.headline) {
    return daily.scoreChanges[0].headline;
  }
  // topSignals uses 'title' not 'headline'
  if (daily.topSignals?.[0]?.title) {
    return daily.topSignals[0].title;
  }
  if (daily.headline) {
    return daily.headline;
  }
  return `Compassion Benchmark Daily Briefing — ${dateLabel}`;
}

/**
 * Derive the description/content_text for a feed item.
 * Priority order per spec:
 *  1. daily.summary (truncated to ~300 chars for RSS; full for JSON Feed)
 *  2. daily.topSignals?.[0]?.description
 *  3. Pipeline-stats fallback
 */
function deriveSummary(daily, date) {
  if (daily.summary) {
    return daily.summary;
  }
  if (daily.topSignals?.[0]?.description) {
    return daily.topSignals[0].description;
  }
  const p = daily.pipeline ?? {};
  return (
    `Daily intelligence for ${date}. ` +
    `${p.scoreChanges ?? 0} formal score change(s), ` +
    `${p.subThresholdMovementsDocumented ?? 0} sub-threshold signal(s) ` +
    `across ${p.entitiesScanned ?? 0} entities.`
  );
}

/**
 * Derive category tags from topSignals indexSlug values — deduped.
 */
function deriveCategories(daily) {
  const signals = Array.isArray(daily.topSignals) ? daily.topSignals : [];
  const seen = new Set();
  const categories = [];
  for (const s of signals) {
    const idx = s.index ?? s.indexSlug;
    if (idx && !seen.has(idx)) {
      seen.add(idx);
      categories.push(idx);
    }
  }
  return categories;
}

/**
 * Human-readable date label: "May 25" from "2026-05-25"
 */
function formatDateLabel(dateStr) {
  const [year, month, day] = dateStr.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ─── Per-item data extraction ─────────────────────────────────────────────────

function buildItem(date, daily) {
  const dateLabel = formatDateLabel(date);
  const url = `${BASE_URL}/updates/${date}`;

  const headline = deriveHeadline(daily, dateLabel);
  const summary = deriveSummary(daily, dateLabel);
  const categories = deriveCategories(daily);

  const pipeline = daily.pipeline ?? {};
  const topSignals = Array.isArray(daily.topSignals) ? daily.topSignals : [];
  const topEntities = topSignals.slice(0, 3).map((s) => s.slug).filter(Boolean);

  const methodologyNovel = (pipeline.methodologyRulingsEstablished ?? 0) > 0;

  return {
    date,
    url,
    headline,
    summary,
    categories,
    topEntities,
    pipeline,
    methodologyNovel,
    pubDateRfc822: toRfc822(date),
    pubDateIso: toIso8601(date),
  };
}

// ─── RSS 2.0 generation ───────────────────────────────────────────────────────

function buildRssItem(item) {
  const categoriesXml = item.categories
    .map((cat) => `    <category>${escapeXml(cat)}</category>`)
    .join("\n");

  // description uses CDATA to safely embed the full summary
  const descriptionContent = truncate(item.summary, 300);

  return `  <item>
    <title>${escapeXml(item.headline)}</title>
    <link>${escapeXml(item.url)}</link>
    <guid isPermaLink="true">${escapeXml(item.url)}</guid>
    <pubDate>${item.pubDateRfc822}</pubDate>
    <description><![CDATA[${descriptionContent}]]></description>
${categoriesXml}
    <dc:creator>Compassion Benchmark</dc:creator>
  </item>`;
}

function buildRssFeed(items) {
  // lastBuildDate = pubDate of the most recent item (items[0] is newest)
  const lastBuildDate = items.length > 0 ? items[0].pubDateRfc822 : new Date().toUTCString();

  const itemsXml = items.map(buildRssItem).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escapeXml(FEED_TITLE)}</title>
    <link>${BASE_URL}/updates</link>
    <description>${escapeXml(FEED_DESCRIPTION)}</description>
    <language>en-us</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${BASE_URL}/updates/feed.xml" rel="self" type="application/rss+xml"/>
    <generator>Compassion Benchmark static build</generator>
${itemsXml}
  </channel>
</rss>`;
}

// ─── JSON Feed 1.1 generation ─────────────────────────────────────────────────

function buildJsonFeedItem(item) {
  return {
    id: item.url,
    url: item.url,
    title: item.headline,
    // Full summary for JSON Feed (up to 500 chars)
    content_text: truncate(item.summary, 500),
    date_published: item.pubDateIso,
    tags: item.categories,
    _compassionbenchmark: {
      scoreChangeCount: item.pipeline.scoreChanges ?? 0,
      subThresholdCount: item.pipeline.subThresholdMovementsDocumented ?? 0,
      topEntities: item.topEntities,
      methodologyNovel: item.methodologyNovel,
    },
  };
}

function buildJsonFeed(items) {
  const feed = {
    version: "https://jsonfeed.org/version/1.1",
    title: FEED_TITLE,
    home_page_url: `${BASE_URL}/updates`,
    feed_url: `${BASE_URL}/updates/feed.json`,
    description: FEED_DESCRIPTION,
    language: "en-us",
    items: items.map(buildJsonFeedItem),
  };
  return JSON.stringify(feed, null, 2);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
  const startedAt = new Date().toISOString();
  console.log(`[build-feeds] Starting — ${startedAt}`);

  // 1. Read manifest (dates are newest-first)
  const manifest = readJson(MANIFEST_PATH);
  if (!manifest || !Array.isArray(manifest.dates)) {
    console.error("[build-feeds] ERROR: Could not read manifest.json");
    process.exit(1);
  }

  // 2. Load all daily briefings — newest first (manifest order)
  const items = [];
  let skipped = 0;

  for (const date of manifest.dates) {
    const dailyPath = join(DAILY_DIR, `${date}.json`);
    const daily = readJson(dailyPath);
    if (!daily) {
      console.warn(`[build-feeds] WARNING: Missing daily/${date}.json — skipping`);
      skipped++;
      continue;
    }
    items.push(buildItem(date, daily));
  }

  console.log(
    `[build-feeds] Loaded ${items.length} briefings (${skipped} skipped)`
  );

  if (items.length === 0) {
    console.error("[build-feeds] ERROR: No briefing data found — aborting");
    process.exit(1);
  }

  // 3. Ensure output directory exists
  mkdirSync(OUTPUT_DIR, { recursive: true });

  // 4. Write RSS 2.0
  const rssFeed = buildRssFeed(items);
  const rssPath = join(OUTPUT_DIR, "feed.xml");
  writeFileSync(rssPath, rssFeed, "utf-8");
  console.log(`[build-feeds] Wrote ${rssPath} (${items.length} items)`);

  // 5. Write JSON Feed 1.1
  const jsonFeed = buildJsonFeed(items);
  const jsonPath = join(OUTPUT_DIR, "feed.json");
  writeFileSync(jsonPath, jsonFeed, "utf-8");
  console.log(`[build-feeds] Wrote ${jsonPath} (${items.length} items)`);

  // 6. Summary
  console.log(
    `[build-feeds] Done — RSS: ${rssPath} | JSON: ${jsonPath} | Items: ${items.length}`
  );
}

main();
