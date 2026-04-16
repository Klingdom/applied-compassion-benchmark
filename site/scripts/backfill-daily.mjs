#!/usr/bin/env node

/**
 * One-time bootstrap: copies latest.json into the daily archive for today
 * (or a specified date) and initialises manifest.json if it does not exist.
 *
 * Usage: node site/scripts/backfill-daily.mjs [YYYY-MM-DD]
 *        Defaults to today's date if not specified.
 *
 * Safe to re-run: existing manifest entries are preserved and the date is
 * only added once. The daily file is overwritten if already present.
 */

import { existsSync } from "fs";
import { join } from "path";
import { readJson, writeJsonAtomic } from "./lib/pipeline-reader.mjs";

const ROOT = join(import.meta.dirname, "..", "..");
const UPDATES_DIR = join(ROOT, "site", "src", "data", "updates");
const LATEST_FILE = join(UPDATES_DIR, "latest.json");
const DAILY_DIR = join(UPDATES_DIR, "daily");
const MANIFEST_FILE = join(UPDATES_DIR, "manifest.json");
const MAX_DAILY_ENTRIES = 30;

const date = process.argv[2] || new Date().toISOString().split("T")[0];

// ── Read latest.json ─────────────────────────────────────────────

const latest = readJson(LATEST_FILE);
if (!latest) {
  console.error(`latest.json not found at ${LATEST_FILE} — nothing to backfill.`);
  process.exit(1);
}

// ── Write daily archive ──────────────────────────────────────────

const dailyFile = join(DAILY_DIR, `${date}.json`);
writeJsonAtomic(dailyFile, latest);
console.log(`Wrote daily archive ${dailyFile}`);

// ── Update manifest ──────────────────────────────────────────────

const existingManifest = readJson(MANIFEST_FILE) || { dates: [] };
const dates = Array.isArray(existingManifest.dates) ? existingManifest.dates : [];

if (!dates.includes(date)) {
  dates.push(date);
}

// Sort newest-first, cap at MAX_DAILY_ENTRIES
dates.sort((a, b) => b.localeCompare(a));
dates.splice(MAX_DAILY_ENTRIES);

const manifest = {
  dates,
  latest: dates[0],
  updatedAt: new Date().toISOString(),
};

writeJsonAtomic(MANIFEST_FILE, manifest);
console.log(`Wrote manifest (${dates.length} dates, latest: ${manifest.latest})`);
