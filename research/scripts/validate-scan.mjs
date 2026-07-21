#!/usr/bin/env node
/**
 * validate-scan.mjs — integrity gate for nightly scanner output.
 *
 * Created 2026-07-20 after two consecutive scanner failures on the same night:
 *   1. Under-coverage reported as success (72 of ~250 searches; 108 of 122
 *      Tier-2 batches carried a batch label with no search behind them).
 *   2. A merge script silently overwrote real evidence with placeholders;
 *      the partial restore lost Zimbabwe's term-extension finding and
 *      contradicted itself on Lithuania.
 *
 * Neither failure was caught by anything downstream. Both were self-reported
 * as successful runs. This gate exists so that never depends on a spot-check
 * again.
 *
 * Usage:
 *   node research/scripts/validate-scan.mjs 2026-07-20
 *   node research/scripts/validate-scan.mjs 2026-07-20 --baseline research/scans/superseded/2026-07-20.v2-preclean.json
 *
 * Exit code 0 = PASS (safe to spend the Opus assessor budget).
 * Exit code 1 = FAIL (do not proceed).
 */

import { readFileSync, existsSync } from "node:fs";
import path from "node:path";

const REPO = path.resolve(import.meta.dirname, "..", "..");
const LOOKBACK_DAYS = 14;

// Coverage floors, from .claude/agents/overnight-scanner.md.
const MIN_T1_SEARCHES = 150;
const MIN_T3_SEARCHES = 15;
const MAX_BATCH_SIZE = 12;
const REGRESSION_DROP_THRESHOLD = 10;

const args = process.argv.slice(2);
const date = args.find((a) => /^\d{4}-\d{2}-\d{2}$/.test(a));
const baselineIdx = args.indexOf("--baseline");
const baselinePath = baselineIdx !== -1 ? args[baselineIdx + 1] : null;

if (!date) {
  console.error("usage: validate-scan.mjs <YYYY-MM-DD> [--baseline <path>]");
  process.exit(1);
}

const scanPath = path.join(REPO, "research", "scans", `${date}.json`);
if (!existsSync(scanPath)) {
  console.error(`FAIL: scan file does not exist: ${scanPath}`);
  process.exit(1);
}

const scan = JSON.parse(readFileSync(scanPath, "utf8"));
const rotation = JSON.parse(
  readFileSync(path.join(REPO, "research", "rotation-state.json"), "utf8"),
);

const failures = [];
const warnings = [];
const fail = (m) => failures.push(m);
const warn = (m) => warnings.push(m);

const reviews = scan.entity_reviews ?? [];

// ── 1. Coverage: every rotation entity reviewed exactly once ────────────────
const rotationKeys = Object.keys(rotation.entities ?? {});
const seen = new Map();
for (const r of reviews) {
  const k = r.slug ?? r.key;
  seen.set(k, (seen.get(k) ?? 0) + 1);
}
const missing = rotationKeys.filter((k) => !seen.has(k));
const dupes = [...seen.entries()].filter(([, n]) => n > 1);

if (reviews.length !== rotationKeys.length) {
  fail(
    `entity_reviews count ${reviews.length} != rotation entity count ${rotationKeys.length}`,
  );
}
if (missing.length) {
  fail(`${missing.length} rotation entities have no review (e.g. ${missing.slice(0, 5).join(", ")})`);
}
if (dupes.length) {
  fail(`${dupes.length} entities reviewed more than once (e.g. ${dupes.slice(0, 5).map(([k, n]) => `${k}x${n}`).join(", ")})`);
}

// ── 2. Tier assignment: every entity in exactly one tier ───────────────────
const untiered = reviews.filter((r) => !r.tier);
if (untiered.length) {
  fail(`${untiered.length} entities have no tier assignment`);
}

// ── 3. THE SOURCE RULE: evidence_found -> at least one source URL ──────────
// This is the defect that motivated the gate: 91 of 179 evidenced entities
// carried zero sources. Unciteable evidence is not evidence.
const evidenced = reviews.filter((r) => r.evidence_found);
const unsourced = evidenced.filter((r) => !Array.isArray(r.sources) || r.sources.length === 0);
if (unsourced.length) {
  fail(
    `${unsourced.length} of ${evidenced.length} evidenced entities have ZERO sources ` +
      `(e.g. ${unsourced.slice(0, 6).map((r) => r.name).join(", ")})`,
  );
}

const badUrls = evidenced.filter((r) =>
  (r.sources ?? []).some((s) => typeof s !== "string" || !/^https?:\/\//.test(s)),
);
if (badUrls.length) {
  fail(`${badUrls.length} entities have malformed source entries (must be http(s) URLs)`);
}

// ── 4. THE RECENCY RULE: evidence dated inside the 14-day window ───────────
// "through 2025-2026" style summaries are how stale material got laundered
// into a fresh scan. Require a machine-checkable date per evidenced entity.
const windowEnd = new Date(`${date}T23:59:59Z`);
const windowStart = new Date(windowEnd);
windowStart.setUTCDate(windowStart.getUTCDate() - LOOKBACK_DAYS);

const noDate = evidenced.filter((r) => !r.evidence_date);
if (noDate.length) {
  fail(
    `${noDate.length} of ${evidenced.length} evidenced entities lack evidence_date ` +
      `(required: ISO date of the underlying event, inside the ${LOOKBACK_DAYS}-day window)`,
  );
}

const outOfWindow = evidenced.filter((r) => {
  if (!r.evidence_date) return false;
  const d = new Date(r.evidence_date);
  if (Number.isNaN(d.getTime())) return true;
  return d < windowStart || d > windowEnd;
});
if (outOfWindow.length) {
  fail(
    `${outOfWindow.length} evidenced entities have evidence_date outside ` +
      `${windowStart.toISOString().slice(0, 10)}..${date} ` +
      `(e.g. ${outOfWindow.slice(0, 5).map((r) => `${r.name}:${r.evidence_date}`).join(", ")})`,
  );
}

// ── 5. Search coverage actually performed ──────────────────────────────────
const tb = scan.tier_breakdown ?? {};
const t1Searches = tb.tier_1_individual_searches ?? tb.tier_1_individual ?? 0;
const t2Searches = tb.tier_2_batched_searches ?? 0;
const t3Searches = tb.tier_3_sector_sweeps ?? 0;

if (t1Searches < MIN_T1_SEARCHES) {
  fail(`Tier-1 individual searches ${t1Searches} < required ${MIN_T1_SEARCHES}`);
}
if (t3Searches < MIN_T3_SEARCHES) {
  fail(`Tier-3 sector sweeps ${t3Searches} < required ${MIN_T3_SEARCHES}`);
}

// Every declared batch must have a search behind it. This is the exact
// failure mode of run 1: 122 batches labelled, 14 searched.
const batches = new Map();
for (const r of reviews) {
  if (!r.batch_name) continue;
  if (!batches.has(r.batch_name)) batches.set(r.batch_name, []);
  batches.get(r.batch_name).push(r);
}
const unsearchedBatches = [...batches.entries()].filter(([, rs]) =>
  rs.some((r) => r.batch_searched === false) || rs.every((r) => r.batch_searched === undefined),
);
if (unsearchedBatches.length) {
  fail(
    `${unsearchedBatches.length} of ${batches.size} batches have no search behind them ` +
      `(e.g. ${unsearchedBatches.slice(0, 5).map(([b]) => b).join(", ")})`,
  );
}
if (t2Searches < batches.size) {
  fail(`Tier-2 searches ${t2Searches} < declared batch count ${batches.size} — one search per batch required`);
}

const oversized = [...batches.entries()].filter(([, rs]) => rs.length > MAX_BATCH_SIZE);
if (oversized.length) {
  warn(
    `${oversized.length} batches exceed ${MAX_BATCH_SIZE} entities ` +
      `(largest: ${oversized.sort((a, b) => b[1].length - a[1].length).slice(0, 3).map(([b, rs]) => `${b}=${rs.length}`).join(", ")})`,
  );
}

// ── 6. Downstream fields present ───────────────────────────────────────────
if ((scan.top_entities ?? []).length !== 15) {
  fail(`top_entities has ${(scan.top_entities ?? []).length} entries, expected 15`);
}
if ((scan.rotation_backfill ?? []).length !== 5) {
  warn(`rotation_backfill has ${(scan.rotation_backfill ?? []).length} entries, expected 5`);
}
for (const t of scan.top_entities ?? []) {
  const r = reviews.find((x) => (x.slug ?? x.key) === (t.slug ?? t.key));
  if (!r) {
    fail(`top_entities entry "${t.name}" has no corresponding entity_review`);
  } else if (!r.evidence_found) {
    fail(`top_entities entry "${t.name}" is flagged for assessment but has no evidence`);
  }
}

// ── 7. Regression guard vs a baseline scan ─────────────────────────────────
// Catches silent evidence destruction across re-runs: an entity that had a
// finding yesterday and lost it today must be explained, not vanished.
if (baselinePath) {
  const bp = path.isAbsolute(baselinePath) ? baselinePath : path.join(REPO, baselinePath);
  if (!existsSync(bp)) {
    warn(`baseline not found, regression check skipped: ${bp}`);
  } else {
    const base = JSON.parse(readFileSync(bp, "utf8"));
    const baseByKey = new Map(
      (base.entity_reviews ?? []).map((r) => [r.slug ?? r.key, r]),
    );
    const lostEvidence = [];
    const bigDrops = [];
    for (const r of reviews) {
      const b = baseByKey.get(r.slug ?? r.key);
      if (!b) continue;
      if (b.evidence_found && !r.evidence_found) lostEvidence.push(r.name);
      const drop = (b.priority_score ?? 0) - (r.priority_score ?? 0);
      if (drop > REGRESSION_DROP_THRESHOLD) bigDrops.push(`${r.name} ${b.priority_score}->${r.priority_score}`);
    }
    if (lostEvidence.length) {
      warn(
        `${lostEvidence.length} entities had evidence in baseline but none now ` +
          `(e.g. ${lostEvidence.slice(0, 6).join(", ")}) — confirm each was genuinely re-searched`,
      );
    }
    if (bigDrops.length) {
      warn(
        `${bigDrops.length} entities dropped >${REGRESSION_DROP_THRESHOLD} priority points vs baseline ` +
          `(e.g. ${bigDrops.slice(0, 6).join(", ")})`,
      );
    }
  }
}

// ── Report ─────────────────────────────────────────────────────────────────
const idxStats = {};
for (const r of reviews) {
  const i = r.index ?? "?";
  idxStats[i] ??= { total: 0, evidence: 0, sourced: 0 };
  idxStats[i].total++;
  if (r.evidence_found) {
    idxStats[i].evidence++;
    if ((r.sources ?? []).length) idxStats[i].sourced++;
  }
}

console.log(`\nScan integrity gate — ${date}`);
console.log(`  entities reviewed : ${reviews.length}`);
console.log(`  with evidence     : ${evidenced.length}`);
console.log(`  fully sourced     : ${evidenced.length - unsourced.length}`);
console.log(`  searches          : T1=${t1Searches} T2=${t2Searches} T3=${t3Searches} (total ${t1Searches + t2Searches + t3Searches})`);
console.log(`  batches           : ${batches.size} declared, ${batches.size - unsearchedBatches.length} searched`);
console.log("\n  per index (total / evidence / sourced):");
for (const [i, s] of Object.entries(idxStats).sort()) {
  console.log(`    ${i.padEnd(16)} ${String(s.total).padStart(5)} / ${String(s.evidence).padStart(4)} / ${String(s.sourced).padStart(4)}`);
}

if (warnings.length) {
  console.log("\n  WARNINGS (non-blocking):");
  warnings.forEach((w) => console.log(`    ! ${w}`));
}

if (failures.length) {
  console.log("\n  FAILURES (blocking):");
  failures.forEach((f) => console.log(`    x ${f}`));
  console.log(`\nRESULT: FAIL — ${failures.length} blocking issue(s). Do NOT run the assessor.\n`);
  process.exit(1);
}

console.log("\nRESULT: PASS — scan is safe to hand to the assessor.\n");
process.exit(0);
