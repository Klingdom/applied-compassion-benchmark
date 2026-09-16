#!/usr/bin/env node
/**
 * test-coverage-report.mjs — unit tests for coverage-report.mjs
 *
 * Exercises buildCoverageReport() / renderMarkdown() against in-memory
 * fixtures only. Does not touch research/rotation-state.json,
 * site/src/data/indexes/*.json, or research/change-proposals/ — this file
 * has no filesystem dependency on real project data, so it stays stable as
 * the real catalog grows.
 *
 * Run: node research/scripts/test-coverage-report.mjs
 */

import { buildCoverageReport, renderMarkdown, KNOWN_INDEX_FILES } from "./coverage-report.mjs";

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
  } else {
    failed++;
    console.error(`  FAIL: ${message}`);
  }
}

function assertThrows(fn, messageSubstring, testName) {
  try {
    fn();
    failed++;
    console.error(`  FAIL: ${testName} — expected throw, none occurred`);
  } catch (err) {
    if (messageSubstring && !err.message.includes(messageSubstring)) {
      failed++;
      console.error(
        `  FAIL: ${testName} — threw, but message did not include ${JSON.stringify(messageSubstring)}. Got: ${err.message}`,
      );
    } else {
      passed++;
    }
  }
}

/** Builds a full 8-index-populated set of empty arrays, then overrides some. */
function emptyPublishedCounts(overrides = {}) {
  const base = {};
  for (const slug of Object.keys(KNOWN_INDEX_FILES)) base[slug] = 0;
  return { ...base, ...overrides };
}

function makeEntity({ index = "countries", lastAssessed = null, lastScanned = null } = {}) {
  return {
    name: "Test Entity",
    index,
    rank: 1,
    composite: 50,
    band: "developing",
    last_scanned: lastScanned,
    last_assessed: lastAssessed,
    last_change_proposal: null,
    last_evidence_touch: lastScanned,
  };
}

console.log("\ntest-coverage-report: running fixtures\n");

// ── Test 1: null last_assessed is counted as never-assessed, not thrown ────
{
  const rotation = {
    entities: {
      a: makeEntity({ index: "countries", lastAssessed: null, lastScanned: "2026-09-01" }),
      b: makeEntity({ index: "countries", lastAssessed: "2026-08-01", lastScanned: "2026-09-01" }),
    },
  };
  const published = emptyPublishedCounts({ countries: 2 });
  const report = buildCoverageReport(rotation, published, 0, "2026-09-16");

  assert(report.overall.neverAssessed === 1, "1 test: exactly one never-assessed entity counted");
  assert(report.overall.total === 2, "1 test: total reflects both entities");
  assert(report.overall.neverAssessedShare === "50.0%", `1 test: never-assessed share is 50.0%, got ${report.overall.neverAssessedShare}`);
  assert(report.perIndex.countries.neverAssessed === 1, "1 test: per-index never-assessed count matches overall for single-index fixture");
}

// ── Test 2: boundary at exactly 30 days is included in the ≤30-day window ──
{
  // Report date 2026-09-16; last_assessed exactly 30 days earlier = 2026-08-17.
  const rotation = {
    entities: {
      exact30: makeEntity({ index: "countries", lastAssessed: "2026-08-17", lastScanned: "2026-09-01" }),
      at31: makeEntity({ index: "countries", lastAssessed: "2026-08-16", lastScanned: "2026-09-01" }),
    },
  };
  const published = emptyPublishedCounts({ countries: 2 });
  const report = buildCoverageReport(rotation, published, 0, "2026-09-16");

  assert(report.overall.assessedWithin30 === 1, `2 test: exactly-30-day entity is included in the 30-day window, got ${report.overall.assessedWithin30}`);
  assert(report.overall.assessedWithin60 === 2, "2 test: both entities fall within the 60-day window");
}

// ── Test 3: unparseable date must throw, not silently report zero ──────────
{
  const rotation = {
    entities: {
      bad: makeEntity({ index: "countries", lastAssessed: "not-a-date", lastScanned: "2026-09-01" }),
    },
  };
  const published = emptyPublishedCounts({ countries: 1 });
  assertThrows(
    () => buildCoverageReport(rotation, published, 0, "2026-09-16"),
    "unparseable date",
    "3 test: unparseable last_assessed throws",
  );

  // Also: an unparseable report-date argument itself must throw.
  const rotationOk = {
    entities: { ok: makeEntity({ index: "countries", lastAssessed: null, lastScanned: null }) },
  };
  assertThrows(
    () => buildCoverageReport(rotationOk, emptyPublishedCounts({ countries: 1 }), 0, "16-09-2026"),
    "unparseable date",
    "3 test: unparseable report date argument throws",
  );
}

// ── Test 4: per-index total disagreeing with the index JSON must be flagged ─
{
  const rotation = {
    entities: {
      a: makeEntity({ index: "ai-labs", lastAssessed: null, lastScanned: null }),
      b: makeEntity({ index: "ai-labs", lastAssessed: null, lastScanned: null }),
    },
  };
  // rotation-state tracks 2 ai-labs entities, but the published index only has 1 row.
  const published = emptyPublishedCounts({ "ai-labs": 1 });
  const report = buildCoverageReport(rotation, published, 0, "2026-09-16");

  assert(report.perIndex["ai-labs"].mismatch === true, "4 test: ai-labs mismatch is flagged true");
  assert(report.perIndexMismatches.length === 1, "4 test: exactly one mismatch recorded");
  assert(report.perIndexMismatches[0].index === "ai-labs", "4 test: mismatch entry names the ai-labs index");
  assert(report.perIndexMismatches[0].delta === 1, `4 test: mismatch delta is +1 (2 tracked - 1 published), got ${report.perIndexMismatches[0].delta}`);
  assert(report.totalTrackedVsPublishedMismatch === true, "4 test: overall tracked-vs-published mismatch flag is set");

  const markdown = renderMarkdown(report);
  assert(markdown.includes("MISMATCH FLAGGED"), "4 test: rendered markdown surfaces the mismatch");
  assert(markdown.includes("ai-labs"), "4 test: rendered markdown names ai-labs in the mismatch section");
}

// ── Additional guard: missing `entities` key fails loud, not zero ──────────
{
  assertThrows(
    () => buildCoverageReport({}, emptyPublishedCounts(), 0, "2026-09-16"),
    "missing an `entities` object",
    "5 test: missing entities object throws rather than reporting zero",
  );
}

// ── Additional guard: unknown index slug fails loud ─────────────────────────
{
  const rotation = {
    entities: {
      weird: makeEntity({ index: "not-a-real-index", lastAssessed: null, lastScanned: null }),
    },
  };
  assertThrows(
    () => buildCoverageReport(rotation, emptyPublishedCounts(), 0, "2026-09-16"),
    "unknown index slug",
    "6 test: unknown index slug throws",
  );
}

// ── Additional guard: pending change proposal count passes through untouched ─
{
  const rotation = { entities: { a: makeEntity({ index: "countries", lastAssessed: null }) } };
  const report = buildCoverageReport(rotation, emptyPublishedCounts({ countries: 1 }), 20, "2026-09-16");
  assert(report.pendingChangeProposalCount === 20, "7 test: pendingChangeProposalCount passes through as given");
  const markdown = renderMarkdown(report);
  assert(markdown.includes("**20**"), "7 test: rendered markdown surfaces the pending count");
}

console.log(`\ntest-coverage-report: ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
process.exit(0);
