#!/usr/bin/env node
/**
 * build-applied-ledger.mjs -- BRF-APPLIED-LEDGER (defect class DC-03, inverse direction).
 *
 * Parses research/APPLIED_CHANGES.md into site/src/data/updates/applied-ledger.json so the briefing renderer and
 * scripts/test-briefing-move-claims.mjs can tell that a legacy briefing row (2026-05 to 2026-07, which carries no
 * "applied" marker) was in fact applied. One entry per table row whose Proposal cell links
 * change-proposals/[history/]<slug>-<YYYY-MM-DD>.json:
 *   { slug, proposalDate, appliedDate, index? }
 * appliedDate is the enclosing "## YYYY-MM-DD" section heading (the row's own Applied Date cell if the row precedes any
 * section). Output is sorted and has no timestamps, so it is deterministic.
 *
 * Rows that cannot be keyed (no proposal link, or an undated proposal file name) are NOT guessed at: they are counted
 * and listed on stdout.
 *
 * Skips (exit 0) when research/APPLIED_CHANGES.md is absent (Docker copies only site/); the committed file is then used.
 * Flags: --check  exit 1 if the committed file differs from what would be written (writes nothing).
 *        --md <path> / --out <path>  (tests)
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SITE = join(dirname(fileURLToPath(import.meta.url)), "..");
const arg = (n) => { const i = process.argv.indexOf(n); return i >= 0 ? process.argv[i + 1] : undefined; };
const MD = arg("--md") ? resolve(arg("--md")) : join(SITE, "..", "research", "APPLIED_CHANGES.md");
const OUT = arg("--out") ? resolve(arg("--out")) : join(SITE, "src", "data", "updates", "applied-ledger.json");
const CHECK = process.argv.includes("--check");

const INDEXES = new Set(["countries", "us-states", "fortune-500", "ai-labs", "robotics-labs", "us-cities", "global-cities", "universities"]);
const LINK_RE = /change-proposals\/(?:history\/)?([a-z0-9][a-z0-9-]*?)(?:-(\d{4}-\d{2}-\d{2}))?\.json/g;

/** Pure parser, exported for tests. Returns { entries, noLink, undated }. */
export function parseAppliedChanges(md) {
  const entries = [];
  const noLink = [];
  const undated = [];
  let section = null;
  const lines = md.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const h = line.match(/^##\s+(\d{4}-\d{2}-\d{2})\b/);
    if (h) { section = h[1]; continue; }
    if (/^##\s/.test(line)) { section = null; continue; }
    if (!line.startsWith("|")) continue;
    const cells = line.split("|").slice(1, -1).map((c) => c.trim());
    const index = INDEXES.has(cells[1]) ? cells[1] : null;
    if (!index) continue; // header, separator, or a table that is not a score-change table
    const rowDate = cells.find((c) => /^\d{4}-\d{2}-\d{2}$/.test(c)) ?? null;
    const appliedDate = section ?? rowDate;
    const label = `line ${i + 1}: ${cells[0]} (${index}, ${appliedDate ?? "no date"})`;
    const links = [...line.matchAll(LINK_RE)];
    if (links.length === 0) { noLink.push(label); continue; }
    for (const m of links) {
      if (!m[2]) { undated.push(`${label} -> ${m[0]}`); continue; }
      if (!appliedDate) { noLink.push(label + " (no applied date)"); continue; }
      entries.push({ slug: m[1], proposalDate: m[2], appliedDate, index });
    }
  }
  const key = (e) => [e.proposalDate, e.slug, e.appliedDate, e.index].join("\u0000");
  const seen = new Set();
  const unique = entries.filter((e) => (seen.has(key(e)) ? false : seen.add(key(e))));
  unique.sort((a, b) => (key(a) < key(b) ? -1 : key(a) > key(b) ? 1 : 0));
  return { entries: unique, noLink, undated };
}

export function serialiseLedger(entries) {
  return JSON.stringify({ entries }, null, 2) + "\n";
}

const isMain = !!process.argv[1]?.endsWith("build-applied-ledger.mjs");
if (isMain) {
  if (!existsSync(MD)) {
    console.log(`[build-applied-ledger] ${MD} not present (expected in Docker build) - using committed applied-ledger.json. Skipping regeneration.`);
    process.exit(0);
  }
  const { entries, noLink, undated } = parseAppliedChanges(readFileSync(MD, "utf8"));
  const next = serialiseLedger(entries);
  console.log(`[build-applied-ledger] ${entries.length} keyed entries; ${noLink.length} score-change rows with no proposal link; ${undated.length} rows linking an undated proposal file`);
  if (noLink.length) console.log("  no proposal link (not guessed): " + noLink.slice(0, 5).join(" | ") + (noLink.length > 5 ? " ..." : ""));
  if (entries.length === 0) { console.error("FAIL applied ledger would be empty; refusing to write"); process.exit(1); }
  const current = existsSync(OUT) ? readFileSync(OUT, "utf8") : null;
  if (CHECK) {
    if (current !== next) {
      console.error("FAIL site/src/data/updates/applied-ledger.json is stale: run `node scripts/build-applied-ledger.mjs` and commit the result");
      process.exit(1);
    }
    console.log("PASS applied-ledger.json is up to date");
  } else if (current !== next) {
    writeFileSync(OUT, next);
    console.log(`[build-applied-ledger] wrote ${OUT}`);
  }
}
