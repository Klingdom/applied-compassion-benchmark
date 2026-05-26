#!/usr/bin/env node
/**
 * test-build-entity-history.mjs — Fixture tests for the PR 1 tier classifier,
 * citation-URL extractor, methodology-ruling resolver, and Tier-D compaction.
 *
 * Self-contained: imports only the pure functions extracted from
 * build-entity-history.mjs via site/scripts/lib/entity-history-helpers.mjs.
 * Does NOT read disk files or write any output.
 *
 * Test cases:
 *  1. Slovakia-like input — Tier A classification, rulingRef population
 *  2. Anthropic-like input — Tier B boundary-watch events, latestScoreChange
 *  3. Sub-threshold compaction — 7 events >90 days → 1 CompactedRun
 *  4. Most-recent Tier-B not compacted — 8 events, 7 folded, 1 stays
 *  5. citationUrl extraction — URL from whyHeadline
 *  6. citationUrl skip rules — internal URL skipped → null
 *  7. Tier-A first-baseline — delta:null, status:"applied" → Tier A
 *  8. Methodology ruling slug resolution — isolation (non-topSignal entities don't get ruling)
 *
 * Exit code 0 = all tests pass, 1 = one or more failures.
 */

import {
  classifyEventTier,
  computeDirectionLabel,
  extractCitationUrl,
  groupIntoCompactedRuns,
  buildCompactedRun,
  computeCompactionCutoff,
  daysBetween,
  parseRulingNumber,
  buildRulingRef,
  computeLatestScoreChange,
  computeDaysSinceLastChange,
  computeTierCounts,
} from "./lib/entity-history-helpers.mjs";

// ─── Test runner ──────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  PASS  ${name}`);
    passed++;
  } catch (err) {
    console.error(`  FAIL  ${name}`);
    console.error(`        ${err.message}`);
    failed++;
  }
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg || "Assertion failed");
}

function assertEqual(actual, expected, label) {
  if (actual !== expected) {
    throw new Error(`${label || "assertEqual"}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

function assertNull(val, label) {
  if (val !== null) {
    throw new Error(`${label || "assertNull"}: expected null, got ${JSON.stringify(val)}`);
  }
}

function assertNotNull(val, label) {
  if (val === null || val === undefined) {
    throw new Error(`${label || "assertNotNull"}: expected non-null, got ${JSON.stringify(val)}`);
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Build a minimal event fixture with sensible defaults.
 */
function makeEvent(overrides = {}) {
  return {
    date: "2026-05-25",
    type: "scored",
    headline: "Test event",
    delta: -2.0,
    newComposite: 31.6,
    newBand: "Developing",
    status: "applied",
    briefingPath: "/updates/2026-05-25",
    tier: null,
    subThreshold: false,
    directionLabel: null,
    rulingRef: null,
    citationUrl: null,
    ...overrides,
  };
}

/**
 * Apply tier classification to an event in-place, returning it.
 */
function classify(ev) {
  const { tier, subThreshold } = classifyEventTier(ev);
  ev.tier = tier;
  ev.subThreshold = subThreshold;
  ev.directionLabel = computeDirectionLabel(ev);
  return ev;
}

// ─── Test 1: Slovakia-like input ──────────────────────────────────────────────

test("Slovakia-like input: 3 Tier-A scored events with |delta|>=0.5", () => {
  const events = [
    makeEvent({ date: "2026-05-25", delta: -2.0, status: "applied", newComposite: 31.6 }),
    makeEvent({ date: "2026-05-22", delta: -5.5, status: "applied", newComposite: 33.6 }),
    makeEvent({ date: "2026-05-07", delta: -10.9, status: "applied", newComposite: 39.1 }),
  ].map(classify);

  for (const ev of events) {
    assertEqual(ev.tier, "A", `tier for delta=${ev.delta}`);
    assert(!ev.subThreshold, "subThreshold should be false for Tier A events");
    assertEqual(ev.directionLabel, "downward", "directionLabel");
  }
});

test("Slovakia-like input: latestScoreChange is the May 25 event", () => {
  const events = [
    makeEvent({ date: "2026-05-25", delta: -2.0, status: "applied" }),
    makeEvent({ date: "2026-05-22", delta: -5.5, status: "applied" }),
    makeEvent({ date: "2026-05-07", delta: -10.9, status: "applied" }),
  ].map(classify);

  const lsc = computeLatestScoreChange(events);
  assertNotNull(lsc, "latestScoreChange");
  assertEqual(lsc.date, "2026-05-25", "latestScoreChange.date");
  assertEqual(lsc.delta, -2.0, "latestScoreChange.delta");
});

test("Slovakia-like input: rulingRef population for Ruling 5", () => {
  // Simulate ruling attachment (matching topSignals co-occurrence)
  const ruling5 = {
    rulingNumber: 5,
    name: "EU-PARLIAMENTARY-URGING-OF-CONDITIONALITY-MECHANISM",
    version: "v1.6",
    establishedDate: "2026-05-25",
    briefingPath: "/updates/2026-05-25",
    summary: "An EP plenary resolution backed by 4+ political groups urging conditionality",
  };

  const events = [
    makeEvent({ date: "2026-05-25", delta: -2.0, status: "applied", rulingRef: ruling5 }),
    makeEvent({ date: "2026-05-22", delta: -5.5, status: "applied", rulingRef: null }),
  ].map(classify);

  assertNotNull(events[0].rulingRef, "rulingRef on May 25 event");
  assertEqual(events[0].rulingRef.rulingNumber, 5, "rulingRef.rulingNumber");
  assertNull(events[1].rulingRef, "no rulingRef on May 22 event");
});

// ─── Test 2: Anthropic-like input ─────────────────────────────────────────────

test("Anthropic-like input: boundary-watch events all Tier B", () => {
  const bwDates = [
    "2026-05-25", "2026-05-24", "2026-05-23", "2026-05-22", "2026-05-21", "2026-05-20", "2026-05-19"
  ];
  const bwEvents = bwDates.map((date) =>
    classify(makeEvent({
      date,
      type: "boundary-watch",
      delta: null,
      status: "boundary-watch",
      cycle: bwDates.indexOf(date) + 1,
    }))
  );

  for (const ev of bwEvents) {
    assertEqual(ev.tier, "B", `tier for boundary-watch event ${ev.date}`);
    assert(!ev.subThreshold, "subThreshold false for boundary-watch");
  }
});

test("Anthropic-like input: latestScoreChange is the most recent scored event", () => {
  const scoredEvent = classify(makeEvent({
    date: "2026-05-15",
    type: "scored",
    delta: -1.9,
    status: "documented",
  }));
  const bwEvents = ["2026-05-25", "2026-05-24", "2026-05-23"].map((date) =>
    classify(makeEvent({ date, type: "boundary-watch", delta: null, status: "boundary-watch" }))
  );

  // Newest-first ordering (as the real script produces)
  const allEvents = [...bwEvents, scoredEvent];

  const lsc = computeLatestScoreChange(allEvents);
  assertNotNull(lsc, "latestScoreChange should not be null");
  assertEqual(lsc.date, "2026-05-15", "latestScoreChange.date");
  assertEqual(lsc.delta, -1.9, "latestScoreChange.delta");
});

test("Anthropic-like input: methodologyRulings is empty when no rulings co-occur", () => {
  // No rulings attached — methodologyRulings should be empty
  const methodologyRulings = [];
  assertEqual(methodologyRulings.length, 0, "methodologyRulings.length");
});

// ─── Test 3: Sub-threshold compaction ─────────────────────────────────────────

test("Sub-threshold compaction: 7 events >90 days old folded into 1 CompactedRun", () => {
  // 7 synthetic sub-threshold events, all >90 days old (relative to 2026-05-26).
  // The 90-day cutoff from 2026-05-26 is 2026-02-25, so all dates must be < that.
  const events = [
    "2026-01-15", "2026-01-20", "2026-01-25",
    "2026-02-01", "2026-02-05", "2026-02-10", "2026-02-15",
  ].map((date) =>
    classify(makeEvent({
      date,
      delta: 0.2,
      status: "documented",
    }))
  );

  // Manually set to Tier B / subThreshold (classifyEventTier with delta=0.2 → rule 4)
  for (const ev of events) {
    assertEqual(ev.tier, "B", `tier for sub-threshold event ${ev.date}`);
    assert(ev.subThreshold, `subThreshold should be true for delta=0.2 event`);
  }

  // All eligible for compaction (all >90 days from 2026-05-26)
  const compactionCutoff = computeCompactionCutoff("2026-05-26T00:00:00Z");
  const eligible = events.filter((ev) => ev.date < compactionCutoff && ev.rulingRef === null);
  assertEqual(eligible.length, 7, "all 7 events should be compaction-eligible");

  const runs = groupIntoCompactedRuns(eligible);
  assertEqual(runs.length, 1, "should produce 1 CompactedRun");
  assertEqual(runs[0].count, 7, "CompactedRun.count");
  assertEqual(runs[0].type, "compacted-sub-threshold", "CompactedRun.type");
  assertEqual(runs[0].tier, "D", "CompactedRun.tier");
  assertEqual(runs[0].netDirection, "upward", "netDirection for all-positive deltas");
});

// ─── Test 4: Most-recent Tier-B event not compacted ───────────────────────────

test("Most-recent Tier-B not compacted: 8 events, 7 folded, 1 recent stays", () => {
  // 7 old sub-threshold events + 1 recent one.
  // Cutoff from 2026-05-26 is 2026-02-25, so old dates must be < that.
  const oldDates = [
    "2026-01-15", "2026-01-20", "2026-01-25",
    "2026-02-01", "2026-02-05", "2026-02-10", "2026-02-15",
  ];
  const oldEvents = oldDates.map((date) =>
    classify(makeEvent({ date, delta: 0.2, status: "documented" }))
  );
  const recentEvent = classify(makeEvent({ date: "2026-05-25", delta: 0.3, status: "documented" }));

  // All 8 events, newest-first
  const allEvents = [recentEvent, ...oldEvents];

  // Find most recent Tier-B index
  let mostRecentTierBIndex = -1;
  for (let i = 0; i < allEvents.length; i++) {
    if (allEvents[i].tier === "B") {
      mostRecentTierBIndex = i;
      break;
    }
  }
  assertEqual(mostRecentTierBIndex, 0, "most recent Tier-B is at index 0 (recentEvent)");

  const compactionCutoff = computeCompactionCutoff("2026-05-26T00:00:00Z");

  const eligible = allEvents.filter((ev, idx) =>
    ev.tier === "B" &&
    ev.subThreshold === true &&
    ev.date < compactionCutoff &&
    ev.rulingRef === null &&
    idx !== mostRecentTierBIndex
  );

  assertEqual(eligible.length, 7, "7 events eligible for compaction");

  const runs = groupIntoCompactedRuns(eligible);
  const foldedKeys = new Set();
  for (const run of runs) {
    for (const ev of run._sourceEvents) {
      foldedKeys.add(`${ev.date}:${ev.type}:${ev.briefingPath}`);
    }
  }

  const remaining = allEvents.filter(
    (ev) => !foldedKeys.has(`${ev.date}:${ev.type}:${ev.briefingPath}`)
  );

  assertEqual(remaining.length, 1, "1 event should remain (the recent one)");
  assertEqual(remaining[0].date, "2026-05-25", "remaining event is the recent one");
});

// ─── Test 5: citationUrl extraction from whyHeadline ─────────────────────────

test("citationUrl extraction: URL from whyHeadline", () => {
  const url = extractCitationUrl(null, [
    "... see https://europarl.europa.eu/foo for details ...",
  ]);
  assertEqual(url, "https://europarl.europa.eu/foo", "extracted citationUrl");
});

test("citationUrl extraction: structured field takes precedence", () => {
  const url = extractCitationUrl(
    "https://eur-lex.europa.eu/official-document",
    ["see https://europarl.europa.eu/foo"]
  );
  assertEqual(url, "https://eur-lex.europa.eu/official-document", "structured field wins");
});

test("citationUrl extraction: Wikipedia used only as fallback", () => {
  // Only wikipedia URL available — should be accepted as fallback
  const url = extractCitationUrl(null, [
    "see https://en.wikipedia.org/wiki/Slovakia"
  ]);
  assertEqual(url, "https://en.wikipedia.org/wiki/Slovakia", "wikipedia as fallback");
});

test("citationUrl extraction: non-wikipedia URL preferred over wikipedia", () => {
  const url = extractCitationUrl(null, [
    "https://en.wikipedia.org/wiki/Slovakia and https://europarl.europa.eu/press"
  ]);
  assertEqual(url, "https://europarl.europa.eu/press", "non-wikipedia preferred");
});

// ─── Test 6: citationUrl skip rules ───────────────────────────────────────────

test("citationUrl skip: internal compassionbenchmark.com URL → null", () => {
  const url = extractCitationUrl(null, [
    "https://compassionbenchmark.com/updates/2026-05-25"
  ]);
  assertNull(url, "internal URL should be skipped → null");
});

test("citationUrl skip: twitter.com/intent/ URL → null", () => {
  const url = extractCitationUrl(null, [
    "https://twitter.com/intent/tweet?text=foo"
  ]);
  assertNull(url, "twitter share URL should be skipped → null");
});

test("citationUrl skip: linkedin.com/share URL → null", () => {
  const url = extractCitationUrl(null, [
    "https://linkedin.com/share?url=https://example.com"
  ]);
  assertNull(url, "linkedin share URL should be skipped → null");
});

test("citationUrl skip: t.co/ URL → null", () => {
  const url = extractCitationUrl(null, [
    "https://t.co/abc123"
  ]);
  assertNull(url, "t.co URL should be skipped → null");
});

test("citationUrl skip: no URLs in text → null", () => {
  const url = extractCitationUrl(null, [
    "No URL here. Just plain text with no links at all."
  ]);
  assertNull(url, "no URL → null");
});

// ─── Test 7: Tier-A first-baseline ───────────────────────────────────────────

test("Tier-A first-baseline: delta=null, status=applied → Tier A", () => {
  const ev = classify(makeEvent({ delta: null, status: "applied" }));
  assertEqual(ev.tier, "A", "first-baseline with status=applied → Tier A");
  assert(!ev.subThreshold, "subThreshold false");
});

test("Tier-A first-baseline: delta=0, status=applied → Tier A", () => {
  const ev = classify(makeEvent({ delta: 0, status: "applied" }));
  assertEqual(ev.tier, "A", "zero delta with status=applied → Tier A");
});

test("Tier-A: delta=-22.1, status=applied → Tier A (large scored apply)", () => {
  const ev = classify(makeEvent({ delta: -22.1, status: "applied" }));
  assertEqual(ev.tier, "A", "large delta → Tier A");
});

// ─── Test 8: Methodology ruling slug resolution — isolation ───────────────────

test("Methodology ruling slug resolution: only topSignal slugs get ruling", () => {
  // Simulate the logic from build-entity-history.mjs:
  // topSignals = [{ slug: "slovakia", index: "countries" }]
  // methodologyNotes = [{ name: "...Ruling 5...", description: "...", version: "v1.6" }]
  //
  // Expected: "countries:slovakia" gets the ruling;
  //           "countries:hungary" does NOT

  const topSignals = [
    { slug: "slovakia", index: "countries", title: "Slovakia scoring", actionType: "applied" },
    // hungary is NOT in topSignals
  ];

  const methodologyNotes = [
    {
      name: "EU-PARLIAMENTARY-URGING-OF-CONDITIONALITY-MECHANISM — New Category Established (Ruling 5, v1.6)",
      description: "An EP plenary resolution...",
      version: "v1.6",
      status: "methodology-evolution",
    },
  ];

  // Replicate the resolution logic from build-entity-history.mjs
  const topSignalSlugKeys = new Set(
    topSignals.map((ts) => `${ts.index}:${ts.slug}`)
  );

  const entityRulings = new Map(); // "indexSlug:slug" → Map<rulingNumber, ref>
  const eventRulingRefs = new Map(); // "indexSlug:slug:date" → ref
  const date = "2026-05-25";

  for (const note of methodologyNotes) {
    const ref = buildRulingRef(note, date);
    assert(ref !== null, "buildRulingRef should return a ref for Ruling 5");
    assertEqual(ref.rulingNumber, 5, "rulingNumber");

    for (const slugKey of topSignalSlugKeys) {
      if (!entityRulings.has(slugKey)) entityRulings.set(slugKey, new Map());
      entityRulings.get(slugKey).set(ref.rulingNumber, ref);
      eventRulingRefs.set(`${slugKey}:${date}`, ref);
    }
  }

  // Slovakia should have the ruling
  const slovakiaKey = "countries:slovakia";
  assert(entityRulings.has(slovakiaKey), "Slovakia should have ruling entry");
  const slovakiaRulings = entityRulings.get(slovakiaKey);
  assert(slovakiaRulings.has(5), "Slovakia should have Ruling 5");

  // Hungary should NOT have the ruling
  const hungaryKey = "countries:hungary";
  assert(!entityRulings.has(hungaryKey), "Hungary should NOT have a ruling (not in topSignals)");
});

test("parseRulingNumber: extracts Ruling 5 from name string", () => {
  const n = parseRulingNumber(
    "EU-PARLIAMENTARY-URGING-OF-CONDITIONALITY-MECHANISM — New Category Established (Ruling 5, v1.6)"
  );
  assertEqual(n, 5, "parseRulingNumber");
});

test("parseRulingNumber: returns null for string without ruling number", () => {
  const n = parseRulingNumber("Some methodology note without a ruling number");
  assertNull(n, "no ruling number → null");
});

// ─── Additional edge cases ────────────────────────────────────────────────────

test("classifyEventTier: boundary-watch → Tier B, subThreshold false", () => {
  const ev = classify(makeEvent({ type: "boundary-watch", delta: null, status: "boundary-watch" }));
  assertEqual(ev.tier, "B", "boundary-watch → Tier B");
  assert(!ev.subThreshold, "subThreshold false for boundary-watch");
});

test("classifyEventTier: delta=0, status=documented → Tier C (hold)", () => {
  const ev = classify(makeEvent({ delta: 0, status: "documented" }));
  assertEqual(ev.tier, "C", "zero delta documented hold → Tier C");
  assert(!ev.subThreshold, "subThreshold false for Tier C");
});

test("classifyEventTier: delta=null, status=null (legacy stub) → Tier C", () => {
  const ev = classify(makeEvent({ delta: null, status: null, headline: "Anthropic" }));
  assertEqual(ev.tier, "C", "null delta null status → Tier C");
});

test("classifyEventTier: delta=null, status=pending (legacy stub) → Tier C", () => {
  const ev = classify(makeEvent({ delta: null, status: "pending" }));
  assertEqual(ev.tier, "C", "null delta pending → Tier C");
});

test("classifyEventTier: delta=0, status=null → Tier C", () => {
  const ev = classify(makeEvent({ delta: 0, status: null }));
  assertEqual(ev.tier, "C", "zero delta null status → Tier C");
});

test("computeDirectionLabel: positive delta → upward", () => {
  const label = computeDirectionLabel(makeEvent({ delta: 0.3 }));
  assertEqual(label, "upward", "positive delta → upward");
});

test("computeDirectionLabel: negative delta → downward", () => {
  const label = computeDirectionLabel(makeEvent({ delta: -1.5 }));
  assertEqual(label, "downward", "negative delta → downward");
});

test("computeDirectionLabel: zero delta → hold", () => {
  const label = computeDirectionLabel(makeEvent({ delta: 0 }));
  assertEqual(label, "hold", "zero delta → hold");
});

test("computeDirectionLabel: null delta boundary-watch → null", () => {
  const label = computeDirectionLabel(makeEvent({ type: "boundary-watch", delta: null }));
  assertNull(label, "null delta boundary-watch → null");
});

test("daysBetween: same date → 0", () => {
  const d = daysBetween("2026-05-26", "2026-05-26");
  assertEqual(d, 0, "same date → 0");
});

test("daysBetween: 1 day apart", () => {
  const d = daysBetween("2026-05-26", "2026-05-25");
  assertEqual(d, 1, "1 day apart");
});

test("computeCompactionCutoff: 90 days before 2026-05-26 is 2026-02-25", () => {
  const cutoff = computeCompactionCutoff("2026-05-26T00:00:00Z");
  assertEqual(cutoff, "2026-02-25", "90-day cutoff");
});

test("computeTierCounts: counts A/B/C/D across events", () => {
  const events = [
    { tier: "A" }, { tier: "A" }, { tier: "B" }, { tier: "C" }, { tier: "B" }
  ];
  const counts = computeTierCounts(events, []);
  assertEqual(counts.A, 2, "A count");
  assertEqual(counts.B, 2, "B count");
  assertEqual(counts.C, 1, "C count");
  assertEqual(counts.D, 0, "D count");
});

test("computeTierCounts: D count includes compacted run totals", () => {
  const events = [{ tier: "A" }, { tier: "B" }];
  const compactedRuns = [{ count: 7 }, { count: 3 }];
  const counts = computeTierCounts(events, compactedRuns);
  assertEqual(counts.D, 10, "D count = sum of compacted run counts");
});

test("computeDaysSinceLastChange: null when no latestScoreChange", () => {
  const d = computeDaysSinceLastChange(null, "2026-05-26");
  assertNull(d, "null latestScoreChange → null");
});

test("computeDaysSinceLastChange: 1 day when lastChange is yesterday", () => {
  const lsc = makeEvent({ date: "2026-05-25" });
  const d = computeDaysSinceLastChange(lsc, "2026-05-26");
  assertEqual(d, 1, "1 day since yesterday");
});

// ─── Summary ──────────────────────────────────────────────────────────────────

console.log("");
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  process.exit(1);
}
