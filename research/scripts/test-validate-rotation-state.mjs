#!/usr/bin/env node
/**
 * test-validate-rotation-state.mjs — unit tests for validate-rotation-state.mjs
 *
 * Exercises evaluateEntities() / findBroaderEvidence() / deriveAliasSlugs()
 * against in-memory fixtures only. Does not touch research/rotation-state.json,
 * research/assessments/, research/change-proposals/, or research/digests/ — no
 * disk reads, no disk writes.
 *
 * Run: node research/scripts/test-validate-rotation-state.mjs
 */

import { evaluateEntities, deriveAliasSlugs } from "./validate-rotation-state.mjs";

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

/** Builds an empty ctx; override any of the five Set/Map fields as needed. */
function makeCtx(overrides = {}) {
  return {
    assessmentFiles: new Set(),
    assessmentDateDirs: new Set(),
    legacySubdirFiles: new Set(),
    proposalFiles: new Set(),
    proposalHistoryFiles: new Set(),
    digestContent: new Map(),
    ...overrides,
  };
}

function entity({ name, index = "countries", lastAssessed = null, lastScanned = null, lastChangeProposal = null } = {}) {
  return {
    name,
    index,
    rank: 1,
    composite: 50,
    band: "developing",
    last_scanned: lastScanned,
    last_assessed: lastAssessed,
    last_change_proposal: lastChangeProposal,
    last_evidence_touch: lastScanned,
  };
}

const TODAY = "2026-09-16";

console.log("\ntest-validate-rotation-state: running fixtures\n");

// ── Test 1: exact match passes (no warning, no failure, counted as exactMatches) ─
{
  const entrySet = [["testland", entity({ name: "Testland", lastAssessed: "2026-06-01" })]];
  const ctx = makeCtx({ assessmentFiles: new Set(["testland-2026-06-01.md"]) });
  const result = evaluateEntities(entrySet, ctx, { todayISO: TODAY });

  assert(result.exactMatches === 1, "1: exact match counted");
  assert(result.failures.length === 0, "1: exact match produces no failure");
  assert(result.warnings.length === 0, "1: exact match produces no warning");
}

// ── Test 2: alias-slug match warns and names the alias ──────────────────────
{
  // "AT&T" naive-slugifies straight to "at-t", but HTML-entity-encoded gives
  // "at-amp-t" — the historical filename convention for this entity.
  const entrySet = [["at-and-t", entity({ name: "AT&T", index: "fortune-500", lastAssessed: "2026-05-30" })]];
  const ctx = makeCtx({ assessmentFiles: new Set(["at-amp-t-2026-05-30.md"]) });
  const result = evaluateEntities(entrySet, ctx, { todayISO: TODAY });

  assert(result.failures.length === 0, "2: alias-slug match does not fail");
  assert(result.evidenceClassCounts["alias-report"] === 1, "2: counted as alias-report evidence");
  assert(
    result.warnings.some((w) => w.includes('alias slug "at-amp-t"') && w.includes("HTML-entity-encoded")),
    "2: warning names the alias slug and derivation source",
  );

  // Also sanity-check the alias derivation directly.
  const aliases = deriveAliasSlugs("at-and-t", "AT&T", "fortune-500").map((a) => a.alias);
  assert(aliases.includes("at-amp-t"), "2: deriveAliasSlugs produces the HTML-entity-encoded alias at-amp-t");
}

// ── Test 3: same-date change proposal warns ──────────────────────────────────
{
  const entrySet = [["belgium", entity({ name: "Belgium", lastAssessed: "2026-04-29" })]];
  const ctx = makeCtx({ proposalFiles: new Set(["belgium-2026-04-29.json"]) });
  const result = evaluateEntities(entrySet, ctx, { todayISO: TODAY });

  assert(result.failures.length === 0, "3: same-date proposal does not fail");
  assert(result.evidenceClassCounts["same-date-proposal"] === 1, "3: counted as same-date-proposal evidence");
  assert(
    result.warnings.some((w) => w.includes("belgium-2026-04-29.json") && !w.includes("day before") && !w.includes("day after")),
    "3: warning cites the exact-date proposal file with no day-offset note",
  );
}

// ── Test 4: ±1-day proposal warns ────────────────────────────────────────────
{
  const entrySet = [["testland", entity({ name: "Testland", lastAssessed: "2026-06-15" })]];
  // Proposal filed one day AFTER the claimed date.
  const ctxAfter = makeCtx({ proposalFiles: new Set(["testland-2026-06-16.json"]) });
  const resultAfter = evaluateEntities(entrySet, ctxAfter, { todayISO: TODAY });
  assert(resultAfter.failures.length === 0, "4a: +1-day proposal does not fail");
  assert(resultAfter.evidenceClassCounts["same-date-proposal"] === 1, "4a: +1-day proposal counted as same-date-proposal evidence");
  assert(resultAfter.warnings.some((w) => w.includes("1 day after")), "4a: warning notes it was 1 day after");

  // Proposal filed one day BEFORE the claimed date.
  const ctxBefore = makeCtx({ proposalFiles: new Set(["testland-2026-06-14.json"]) });
  const resultBefore = evaluateEntities(entrySet, ctxBefore, { todayISO: TODAY });
  assert(resultBefore.failures.length === 0, "4b: -1-day proposal does not fail");
  assert(resultBefore.warnings.some((w) => w.includes("1 day before")), "4b: warning notes it was 1 day before");

  // Two days off must NOT match (out of the ±1 day window).
  const ctxTooFar = makeCtx({ proposalFiles: new Set(["testland-2026-06-13.json"]) });
  const resultTooFar = evaluateEntities(entrySet, ctxTooFar, { todayISO: TODAY });
  assert(resultTooFar.failures.length === 1, "4c: a 2-day-off proposal is outside the ±1 day window and still fails");
}

// ── Test 5: digest-only match warns ──────────────────────────────────────────
{
  const entrySet = [["c-te-divoire", entity({ name: "Côte d'Ivoire", lastAssessed: "2026-06-24" })]];
  const ctx = makeCtx({
    digestContent: new Map([["2026-06-24.md", "| Côte d'Ivoire | countries | 35.9 | 35.9 | 0.0 | rotation |\n"]]),
  });
  const result = evaluateEntities(entrySet, ctx, { todayISO: TODAY });

  assert(result.failures.length === 0, "5: digest-only mention does not fail");
  assert(result.evidenceClassCounts["digest-mention"] === 1, "5: counted as digest-mention evidence");
  assert(
    result.warnings.some((w) => w.includes("research/digests/2026-06-24.md") && w.includes("Côte d'Ivoire")),
    "5: warning cites the digest file and the entity name",
  );
}

// ── Test 6: none of the above still FAILS (negative control) ────────────────
{
  const entrySet = [["nowhere-entity", entity({ name: "Nowhere Entity", lastAssessed: "2026-06-01" })]];
  const ctx = makeCtx(); // Completely empty: no reports, no proposals, no digests anywhere.
  const result = evaluateEntities(entrySet, ctx, { todayISO: TODAY });

  assert(result.failures.length === 1, "6: no evidence of any kind still fails (negative control)");
  assert(result.warnings.length === 0, "6: a real gap produces no evidence warning");
  assert(
    result.failures[0].detail.includes("no evidence of any kind found"),
    "6: failure detail explicitly states no evidence of any kind was found",
  );
  assert(result.zeroEvidenceGaps === 1, "6: counted as a zero-evidence gap");
}

// ── Test 7: last_assessed: null is not counted at all ────────────────────────
{
  const entrySet = [["never-assessed", entity({ name: "Never Assessed", lastAssessed: null })]];
  const ctx = makeCtx();
  const result = evaluateEntities(entrySet, ctx, { todayISO: TODAY });

  assert(result.failures.length === 0, "7: null last_assessed produces no failure");
  assert(result.warnings.length === 0, "7: null last_assessed produces no warning");
  assert(result.exactMatches === 0, "7: null last_assessed not counted as exact match");
  assert(
    result.zeroEvidenceGaps === 0 && result.nearDateGaps === 0,
    "7: null last_assessed not counted in any gap bucket",
  );
  const totalEvidence =
    result.evidenceClassCounts["alias-report"] + result.evidenceClassCounts["same-date-proposal"] + result.evidenceClassCounts["digest-mention"];
  assert(totalEvidence === 0, "7: null last_assessed not counted in any evidence-class bucket");
}

console.log(`\n${passed} passed, ${failed} failed\n`);
process.exit(failed === 0 ? 0 : 1);
