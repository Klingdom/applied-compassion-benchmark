#!/usr/bin/env node
/**
 * build-updates-manifest.mjs — Rebuild the /updates date manifest + latest.json
 * deterministically from the source-of-truth daily briefing files.
 *
 * The overnight-digest agent authors site/src/data/updates/daily/<date>.json
 * (rich schema, per docs/DAILY_BRIEFING_SCHEMA.md). This script derives:
 *   - site/src/data/updates/manifest.json  { dates (newest-first, ≤30), latest, updatedAt }
 *   - site/src/data/updates/latest.json    (exact copy of the newest daily file)
 * and prunes daily files older than the 30-entry rolling window.
 *
 * This replaces the manifest/latest responsibility of the DEPRECATED
 * prepare-updates.mjs. Wired into `npm run prebuild` (before build-feeds, which
 * reads the manifest). Run: node site/scripts/build-updates-manifest.mjs
 */
import { readFileSync, writeFileSync, readdirSync, existsSync, unlinkSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const UPDATES_DIR = join(__dirname, "..", "src", "data", "updates");
const DAILY_DIR = join(UPDATES_DIR, "daily");
const MANIFEST_FILE = join(UPDATES_DIR, "manifest.json");
const LATEST_FILE = join(UPDATES_DIR, "latest.json");
const MAX_DAILY_ENTRIES = 30;

const DATE_RE = /^(\d{4}-\d{2}-\d{2})\.json$/;

// All briefing dates present on disk, newest-first.
const allDates = readdirSync(DAILY_DIR)
  .map((f) => (DATE_RE.exec(f) || [])[1])
  .filter(Boolean)
  .sort((a, b) => b.localeCompare(a));

if (allDates.length === 0) {
  console.error("[build-updates-manifest] No daily briefing files found — aborting.");
  process.exit(1);
}

const kept = allDates.slice(0, MAX_DAILY_ENTRIES);
const pruned = allDates.slice(MAX_DAILY_ENTRIES);

// Prune daily files outside the rolling window.
for (const d of pruned) {
  const p = join(DAILY_DIR, `${d}.json`);
  if (existsSync(p)) {
    unlinkSync(p);
    console.log(`[build-updates-manifest] Pruned ${d}.json (outside ${MAX_DAILY_ENTRIES}-day window)`);
  }
}

const manifest = {
  dates: kept,
  latest: kept[0],
  updatedAt: new Date().toISOString(),
};
writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 2) + "\n", "utf8");

// latest.json mirrors the newest daily briefing exactly.
const newest = readFileSync(join(DAILY_DIR, `${kept[0]}.json`), "utf8");
writeFileSync(LATEST_FILE, newest, "utf8");

console.log(`[build-updates-manifest] ${kept.length} dates · latest ${kept[0]} · pruned ${pruned.length}`);
