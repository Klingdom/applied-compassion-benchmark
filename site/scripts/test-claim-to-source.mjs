#!/usr/bin/env node

/**
 * test-claim-to-source.mjs — Test harness for the claim-to-source gate
 * (DC-04 / RISK-020), Improvement Loop 16, item CS-1.
 *
 * In-memory fixtures only — no disk index files are read. Fixture published
 * indexes are built with `buildIndexLookup()`, the same pure function
 * lint-daily-briefings.mjs calls (via `loadPublishedIndexLookup`) against
 * the real site/src/data/indexes/*.json files, so these tests and the
 * linter cannot drift apart.
 *
 * Per rule V8 (mandatory positive controls proving each check can fail):
 *  1. Superlative: the real 2026-09-15 Oracle error ("bottom of the
 *     benchmark's scale") → flagged; the corrected wording → passes.
 *  2. Number: a wrong number beside an entity → flagged; the right number →
 *     passes.
 *  3. Prior-briefing reference: "last night's briefing" naming an entity
 *     absent from that date's published briefing → flagged; present →
 *     passes.
 *  4. Formula: a false integration-bonus rule → flagged; the true one →
 *     passes.
 *  5. A pre-cutoff briefing carrying all four defects at once → report-only
 *     (exit 0), never a violation — AUTONOMY §1c, never retro-fail.
 *
 * Also includes: a REPLAY CONTROL section reconstructing the brief's
 * described 09-15 pre-correction errors as fixtures and confirming each is
 * flagged (item 2 of the improvement-loop verification plan), and a set of
 * precision/false-positive-boundary tests (ambiguous multi-entity
 * sentences, hedged superlatives, dimension-scale numbers, distance-to-
 * boundary phrasing) proving the false-positive guards actually hold.
 *
 * Run: node site/scripts/test-claim-to-source.mjs
 * Wired into `npm run test` as `test:claim-to-source`.
 */

import {
  scanClaimToSource,
  buildIndexLookup,
  loadPublishedIndexLookup,
  checkSuperlativeClaims,
  checkNumberClaims,
  checkPriorBriefingReferences,
  checkFormulaClaims,
  getFormulaConstants,
  CLAIM_TO_SOURCE_CUTOFF,
} from "./lib/lint-rules.mjs";

// ──────────────────────────────────────────────────────────────────────────
// Test runner (mirrors test-lint-briefings.mjs / test-method-claims.mjs)
// ──────────────────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (e) {
    console.error(`  ✗ ${name}`);
    console.error(`      ${e.message}`);
    failed++;
  }
}

function assertHasRule(violations, rule, msg) {
  if (!violations.some((v) => v.rule === rule)) {
    throw new Error(`${msg}\n      Expected a "${rule}" violation. Got: ${JSON.stringify(violations, null, 2)}`);
  }
}

function assertNoRule(violations, rule, msg) {
  const found = violations.filter((v) => v.rule === rule);
  if (found.length > 0) {
    throw new Error(`${msg}\n      Expected no "${rule}" violations. Got: ${JSON.stringify(found, null, 2)}`);
  }
}

function assertEqual(actual, expected, msg) {
  if (actual !== expected) {
    throw new Error(`${msg}\n      Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

// ──────────────────────────────────────────────────────────────────────────
// Fixture published indexes (in-memory — never touches disk)
// ──────────────────────────────────────────────────────────────────────────

const FIXTURE_INDEXES = {
  "fortune-500": {
    rankings: [
      { rank: 1, name: "Acme Corp", composite: 90.0, band: "exemplary" },
      { rank: 2, name: "Oracle", composite: 14.7, band: "critical" },
      { rank: 3, name: "GEO Group", composite: 6.6, band: "critical" },
    ],
  },
  "global-cities": {
    rankings: [
      { rank: 1, name: "Wellington", composite: 83.0, band: "exemplary" },
      { rank: 2, name: "Bridgetown", composite: 60.9, band: "established" },
    ],
  },
  "ai-labs": {
    rankings: [
      { rank: 1, name: "Anthropic", composite: 59.1, band: "functional" },
    ],
  },
  "countries": {
    rankings: [
      { rank: 1, name: "Taiwan", composite: 83.0, band: "exemplary" },
      { rank: 2, name: "Mali", composite: 3.1, band: "critical" },
      { rank: 3, name: "Burkina Faso", composite: 6.3, band: "critical" },
    ],
  },
};

const indexLookup = buildIndexLookup(FIXTURE_INDEXES);

const POST_CUTOFF_DATE = "2026-09-20"; // >= CLAIM_TO_SOURCE_CUTOFF (2026-09-17)
const PRE_CUTOFF_DATE = "2026-09-15"; // < CLAIM_TO_SOURCE_CUTOFF

console.log("\nTesting claim-to-source gate (DC-04 / RISK-020)\n");

// ──────────────────────────────────────────────────────────────────────────
// 1. Superlative / rank claims
// ──────────────────────────────────────────────────────────────────────────

test("superlative: the real Oracle 'bottom of the benchmark' claim is flagged (Oracle ranks 2 of 3, not last)", () => {
  const data = {
    date: POST_CUTOFF_DATE,
    summary: "Oracle's score is confirmed at the bottom of the benchmark's scale after a third round of layoffs.",
    topSignals: [],
    recentAssessments: [
      { entity: "Oracle", slug: "oracle", index: "fortune-500", date: POST_CUTOFF_DATE, published: 14.7, assessed: 14.7, delta: 0, status: "documented", whyHeadline: "Oracle stays flat." },
    ],
  };
  const { violations } = scanClaimToSource(data, { indexLookup });
  assertHasRule(violations, "claim-to-source-superlative", "Oracle 'bottom of the benchmark' claim must be flagged");
});

test("superlative: the corrected 'lowest band' wording passes (band, not rank, and it's true)", () => {
  const data = {
    date: POST_CUTOFF_DATE,
    summary: "Oracle's score is confirmed in the benchmark's lowest band, Critical, after a third round of layoffs.",
    topSignals: [],
    recentAssessments: [
      { entity: "Oracle", slug: "oracle", index: "fortune-500", date: POST_CUTOFF_DATE, published: 14.7, assessed: 14.7, delta: 0, status: "documented", whyHeadline: "Oracle stays flat." },
    ],
  };
  const { violations } = scanClaimToSource(data, { indexLookup });
  assertNoRule(violations, "claim-to-source-superlative", "Corrected 'lowest band' wording must not be flagged");
});

// ──────────────────────────────────────────────────────────────────────────
// 2. Numeric score claims
// ──────────────────────────────────────────────────────────────────────────

test("number: a wrong number beside an entity is flagged", () => {
  const data = {
    date: POST_CUTOFF_DATE,
    topSignals: [],
    recentAssessments: [
      {
        entity: "Testland", slug: "testland", index: "countries", date: POST_CUTOFF_DATE,
        published: 50.0, assessed: 45.2, delta: -4.8, status: "documented",
        whyHeadline: "Testland's score falls from 50.0 to 40.0 out of 100 after new evidence.",
      },
    ],
  };
  const { violations } = scanClaimToSource(data, { indexLookup });
  assertHasRule(violations, "claim-to-source-number", "Wrong number (40.0, actual assessed is 45.2) must be flagged");
});

test("number: the right number passes", () => {
  const data = {
    date: POST_CUTOFF_DATE,
    topSignals: [],
    recentAssessments: [
      {
        entity: "Testland", slug: "testland", index: "countries", date: POST_CUTOFF_DATE,
        published: 50.0, assessed: 45.2, delta: -4.8, status: "documented",
        whyHeadline: "Testland's score falls from 50.0 to 45.2 out of 100 after new evidence.",
      },
    ],
  };
  const { violations } = scanClaimToSource(data, { indexLookup });
  assertNoRule(violations, "claim-to-source-number", "Correct number (45.2) must not be flagged");
});

// ──────────────────────────────────────────────────────────────────────────
// 3. Cross-references to prior briefings
// ──────────────────────────────────────────────────────────────────────────

test("prior-briefing: 'last night's briefing' naming an entity absent from that date's briefing is flagged", () => {
  const data = {
    date: POST_CUTOFF_DATE,
    topSignals: [
      {
        title: "Last Night's Briefing Wrongly Dropped a Real Finding About Lesotho",
        whyItMatters: "", description: "",
        index: "countries", slug: "lesotho", severity: "medium", actionRequired: false, actionType: "documented",
      },
    ],
    recentAssessments: [],
  };
  const priorBriefingRaw = { date: "2026-09-19", topSignals: [{ title: "Some other finding", slug: "otherplace", index: "countries" }] };
  const { violations } = scanClaimToSource(data, { indexLookup, priorDate: "2026-09-19", priorBriefingRaw });
  assertHasRule(violations, "claim-to-source-prior-briefing", "Reference to an entity absent from the prior briefing must be flagged");
});

test("prior-briefing: reference passes when the entity genuinely appears in that date's briefing", () => {
  const data = {
    date: POST_CUTOFF_DATE,
    topSignals: [
      {
        title: "Last Night's Briefing Wrongly Dropped a Real Finding About Lesotho",
        whyItMatters: "", description: "",
        index: "countries", slug: "lesotho", severity: "medium", actionRequired: false, actionType: "documented",
      },
    ],
    recentAssessments: [],
  };
  const priorBriefingRaw = { date: "2026-09-19", topSignals: [{ title: "Lesotho update", slug: "lesotho", index: "countries" }] };
  const { violations } = scanClaimToSource(data, { indexLookup, priorDate: "2026-09-19", priorBriefingRaw });
  assertNoRule(violations, "claim-to-source-prior-briefing", "Reference to an entity actually present in the prior briefing must pass");
});

// ──────────────────────────────────────────────────────────────────────────
// 4. Formula statements
// ──────────────────────────────────────────────────────────────────────────

test("formula: a false integration-bonus cap is flagged", () => {
  const data = {
    date: POST_CUTOFF_DATE,
    methodologyNotes: [
      {
        name: "Bonus Rule",
        description: "Entities earn a bonus of up to 12 points for scoring above a specific line (4 out of 5) across the eight categories. The bonus shrinks by a fifth for each category below that line, so it is gone once five categories are below it.",
        version: "v1.3", status: "active",
      },
    ],
  };
  const { violations } = scanClaimToSource(data, { indexLookup });
  assertHasRule(violations, "claim-to-source-formula", "A 12-point cap claim (actual max is 10) must be flagged");
});

test("formula: the true integration-bonus rule passes", () => {
  const data = {
    date: POST_CUTOFF_DATE,
    methodologyNotes: [
      {
        name: "Bonus Rule",
        description: "Entities earn a bonus of up to 10 points for scoring above a specific line (4 out of 5) across the eight categories. The bonus shrinks by a fifth for each category below that line, so it is gone once five categories are below it.",
        version: "v1.3", status: "active",
      },
    ],
  };
  const { violations } = scanClaimToSource(data, { indexLookup });
  assertNoRule(violations, "claim-to-source-formula", "The true formula description must not be flagged");
});

test("formula: a false threshold ('3 out of 5') is flagged", () => {
  const data = {
    date: POST_CUTOFF_DATE,
    methodologyNotes: [{ name: "Bonus Rule", description: "The bonus applies when a category scores above the line (3 out of 5).", version: "v1.3", status: "active" }],
  };
  const { violations } = scanClaimToSource(data, { indexLookup });
  assertHasRule(violations, "claim-to-source-formula", "A false '3 out of 5' threshold claim must be flagged");
});

test("formula: a false 'gone once N categories' claim is flagged", () => {
  const data = {
    date: POST_CUTOFF_DATE,
    methodologyNotes: [{ name: "Bonus Rule", description: "The bonus is gone once three categories are below the line.", version: "v1.3", status: "active" }],
  };
  const { violations } = scanClaimToSource(data, { indexLookup });
  assertHasRule(violations, "claim-to-source-formula", "A false 'gone once three categories' claim (actual is five) must be flagged");
});

test("formula: a false shrink fraction ('a quarter') is flagged", () => {
  const data = {
    date: POST_CUTOFF_DATE,
    methodologyNotes: [{ name: "Bonus Rule", description: "The bonus shrinks by a quarter for each category below the line.", version: "v1.3", status: "active" }],
  };
  const { violations } = scanClaimToSource(data, { indexLookup });
  assertHasRule(violations, "claim-to-source-formula", "A false 'shrinks by a quarter' claim (actual is a fifth) must be flagged");
});

// ──────────────────────────────────────────────────────────────────────────
// 5. Forward-dated only: pre-cutoff briefing with all four defects → report-only, exit 0
// ──────────────────────────────────────────────────────────────────────────

test("forward-dating: a pre-cutoff briefing with all four defects lands entirely in report-only, never violations", () => {
  const data = {
    date: PRE_CUTOFF_DATE, // before CLAIM_TO_SOURCE_CUTOFF
    summary: "Oracle's score is confirmed at the bottom of the benchmark's scale.",
    topSignals: [
      {
        title: "Last Night's Briefing Wrongly Dropped a Real Finding About Ghostland",
        whyItMatters: "", description: "",
        index: "countries", slug: "ghostland", severity: "medium", actionRequired: false, actionType: "documented",
      },
    ],
    recentAssessments: [
      {
        entity: "Oracle", slug: "oracle", index: "fortune-500", date: PRE_CUTOFF_DATE,
        published: 14.7, assessed: 14.7, delta: 0, status: "documented",
        whyHeadline: "Oracle's score falls from 50.0 to 40.0 out of 100.",
      },
    ],
    methodologyNotes: [
      { name: "Bonus Rule", description: "Entities earn a bonus of up to 12 points for scoring above the line.", version: "v1.3", status: "active" },
    ],
  };
  const priorBriefingRaw = { date: "2026-09-14", topSignals: [] };
  const { violations, reportOnly } = scanClaimToSource(data, { indexLookup, priorDate: "2026-09-14", priorBriefingRaw });

  assertEqual(violations.length, 0, "Pre-cutoff briefing must never produce violations (AUTONOMY §1c — no retro-failing published briefings)");
  const rulesSeen = new Set(reportOnly.map((v) => v.rule));
  for (const rule of ["claim-to-source-superlative", "claim-to-source-number", "claim-to-source-prior-briefing", "claim-to-source-formula"]) {
    if (!rulesSeen.has(rule)) {
      throw new Error(`Expected ${rule} to appear in report-only for the pre-cutoff combined-defect fixture. Got rules: ${[...rulesSeen].join(", ")}`);
    }
  }
});

// ──────────────────────────────────────────────────────────────────────────
// REPLAY CONTROL — reconstructed from the improvement-loop brief's
// description of the real, pre-correction 2026-09-15 errors. These run at a
// post-cutoff date specifically to prove the checks WOULD have failed the
// build had this text shipped after the cutoff; the real 2026-09-15 file
// (pre-cutoff, already coordinator-corrected) is exercised via the CLI in
// verification step 1, not here.
// ──────────────────────────────────────────────────────────────────────────

console.log("\nReplay control — reconstructed pre-correction 2026-09-15 errors\n");

test("replay control: Oracle superlative error, reconstructed verbatim from the brief", () => {
  const data = {
    date: POST_CUTOFF_DATE,
    summary: "Oracle's score is confirmed at the bottom of the benchmark's scale after a third round of layoffs delivered the same way — a same-day email — landed in the same quarter as a $4.76 billion profit.",
    topSignals: [],
    recentAssessments: [
      { entity: "Oracle", slug: "oracle", index: "fortune-500", date: POST_CUTOFF_DATE, published: 14.7, assessed: 14.4, delta: -0.3, status: "documented", whyHeadline: "A third same-day layoff round landed in a record profit quarter." },
    ],
  };
  const { violations } = scanClaimToSource(data, { indexLookup });
  assertHasRule(violations, "claim-to-source-superlative", "Replay of the real Oracle error must be flagged");
});

test("replay control: Lesotho cross-reference error, reconstructed verbatim from the brief", () => {
  const data = {
    date: POST_CUTOFF_DATE,
    topSignals: [
      {
        title: "Last Night's Briefing Wrongly Dropped a Real Finding About Lesotho",
        whyItMatters: "The previous cycle mistakenly threw out a true finding about a US trade law that affects Lesotho's garment workers.",
        description: "",
        index: "countries", slug: "lesotho", severity: "medium", actionRequired: false, actionType: "documented",
      },
    ],
    recentAssessments: [],
  };
  // The real published 2026-09-14 briefing never mentioned Lesotho at all —
  // the drop happened in the internal research scan, not the briefing.
  const priorBriefingRaw = {
    date: "2026-09-14",
    headline: "Hong Kong falls 5.9 points after a court jailed three Tiananmen vigil leaders for up to seven years.",
    topSignals: [{ title: "Hong Kong escalation", slug: "hong-kong", index: "global-cities" }],
  };
  const { violations } = scanClaimToSource(data, { indexLookup, priorDate: "2026-09-14", priorBriefingRaw });
  assertHasRule(violations, "claim-to-source-prior-briefing", "Replay of the real Lesotho cross-reference error must be flagged");
});

test("replay control: integration-bonus formula error, reconstructed from the brief's description", () => {
  // The brief describes "a description of the integration bonus that
  // contradicted scoring.mjs" without quoting exact wording; reconstructed
  // here as a concrete, checkable claim of the same defect class (wrong
  // point cap) per the task's instruction to reconstruct fixtures from the
  // brief.
  const data = {
    date: POST_CUTOFF_DATE,
    methodologyNotes: [
      {
        name: "A Scoring Bonus Can Disappear in One Step",
        description: "Entities earn a bonus of up to 8 points for scoring at or above a set line (4 out of 5) across the eight categories.",
        version: "v1.3", status: "active",
      },
    ],
  };
  const { violations } = scanClaimToSource(data, { indexLookup });
  assertHasRule(violations, "claim-to-source-formula", "Replay of a wrong integration-bonus point cap must be flagged");
});

// ──────────────────────────────────────────────────────────────────────────
// Precision / false-positive boundary tests
// ──────────────────────────────────────────────────────────────────────────

console.log("\nPrecision boundaries — proving the false-positive guards hold\n");

test("superlative: ties at the index floor are NOT flagged (multiple entities can genuinely hold 'the lowest score')", () => {
  const tiedLookup = buildIndexLookup({
    countries: {
      rankings: [
        { rank: 1, name: "Highland", composite: 90.0, band: "exemplary" },
        { rank: 2, name: "Sudan", composite: 0, band: "critical" },
        { rank: 3, name: "Syria", composite: 0, band: "critical" },
      ],
    },
  });
  const data = {
    date: POST_CUTOFF_DATE,
    summary: "Sudan holds a published score of 0 out of 100, the lowest score the benchmark gives.",
    recentAssessments: [{ entity: "Sudan", slug: "sudan", index: "countries", date: POST_CUTOFF_DATE, published: 0, assessed: 0, delta: 0, status: "documented", whyHeadline: "Sudan confirmed." }],
  };
  const { violations } = scanClaimToSource(data, { indexLookup: tiedLookup });
  assertNoRule(violations, "claim-to-source-superlative", "An entity genuinely tied for the index floor must not be flagged, even though it isn't the single last-ranked row");
});

test("superlative: hedged phrasing ('near the bottom') is not flagged", () => {
  const data = {
    date: POST_CUTOFF_DATE,
    summary: "Oracle's score sits near the bottom of the index after new layoffs.",
    recentAssessments: [{ entity: "Oracle", slug: "oracle", index: "fortune-500", date: POST_CUTOFF_DATE, published: 14.7, assessed: 14.7, delta: 0, status: "documented", whyHeadline: "Oracle stays flat." }],
  };
  const { violations } = scanClaimToSource(data, { indexLookup });
  assertNoRule(violations, "claim-to-source-superlative", "Hedged 'near the bottom' must not be flagged as an absolute claim");
});

test("superlative: ambiguous sentences naming two different entities are skipped, not guessed at", () => {
  const data = {
    date: POST_CUTOFF_DATE,
    topSignals: [
      {
        title: "Netflix and Bridgetown Share a Placeholder Score",
        whyItMatters: "Netflix and Bridgetown share an identical starting score; one of them is at the bottom of the index.",
        description: "",
        index: "fortune-500", slug: "netflix", severity: "medium", actionRequired: false, actionType: "documented",
      },
    ],
    recentAssessments: [],
  };
  const { violations } = scanClaimToSource(data, { indexLookup });
  assertNoRule(violations, "claim-to-source-superlative", "A sentence naming two different entities must be skipped as ambiguous, never attributed to either");
});

test("number: dimension-level movement (0-5 scale) is not checked against the composite scale", () => {
  const data = {
    date: POST_CUTOFF_DATE,
    topSignals: [
      {
        title: "Anthropic dimension shift", whyItMatters: "INT rises from 3.0 to 3.2 on demonstrated consistency.", description: "",
        index: "ai-labs", slug: "anthropic", severity: "low", actionRequired: false, actionType: "documented",
      },
    ],
    recentAssessments: [{ entity: "Anthropic", slug: "anthropic", index: "ai-labs", date: POST_CUTOFF_DATE, published: 59.1, assessed: 59.1, delta: 0, status: "documented", whyHeadline: "Anthropic confirmed." }],
  };
  const { violations } = scanClaimToSource(data, { indexLookup });
  assertNoRule(violations, "claim-to-source-number", "A dimension-scale (0-5) movement must not be checked against the 0-100 composite scale");
});

test("number: distance-to-boundary phrasing ('N points above/below') is not treated as a score value", () => {
  const data = {
    date: POST_CUTOFF_DATE,
    recentAssessments: [{ entity: "Oracle", slug: "oracle", index: "fortune-500", date: POST_CUTOFF_DATE, published: 14.7, assessed: 14.7, delta: 0, status: "documented", whyHeadline: "Oracle sits 0.6 points above the Critical boundary." }],
  };
  const { violations } = scanClaimToSource(data, { indexLookup });
  assertNoRule(violations, "claim-to-source-number", "'N points above/below a boundary' is a distance, not a score value, and must not be flagged");
});

test("prior-briefing: an unresolvable subject (no single named entity) is left unchecked, not guessed at", () => {
  const data = {
    date: POST_CUTOFF_DATE,
    summary: "The previous briefing covered several developments.",
    topSignals: [],
    recentAssessments: [],
  };
  const { violations } = scanClaimToSource(data, { indexLookup, priorDate: "2026-09-19", priorBriefingRaw: { date: "2026-09-19" } });
  assertEqual(violations.length, 0, "A cross-reference with no resolvable subject must not be flagged");
});

test("prior-briefing: no prior briefing on disk at all is advisory (not flagged)", () => {
  const data = {
    date: POST_CUTOFF_DATE,
    topSignals: [
      { title: "Last night's briefing covered Lesotho.", whyItMatters: "", description: "", index: "countries", slug: "lesotho", severity: "low", actionRequired: false, actionType: "documented" },
    ],
    recentAssessments: [],
  };
  const { violations } = scanClaimToSource(data, { indexLookup, priorDate: null, priorBriefingRaw: null });
  assertNoRule(violations, "claim-to-source-prior-briefing", "With no prior briefing available to check against, this must be advisory, not a violation");
});

// ──────────────────────────────────────────────────────────────────────────
// Formula constants sanity — self-check against scoring.mjs by recomputation
// ──────────────────────────────────────────────────────────────────────────

test("getFormulaConstants recomputes the expected values from scoring.mjs", () => {
  const c = getFormulaConstants();
  assertEqual(c.maxBonus, 10, "Max integration bonus should recompute to 10");
  assertEqual(c.dimensionThreshold, 4.0, "Dimension weak-threshold should be 4.0");
  assertEqual(c.dimensionThresholdOutOf, 5, "Dimension threshold denominator should be 5");
  assertEqual(c.weakDimsToZero, 5, "Bonus should reach zero at 5 weak dimensions");
  if (Math.abs(c.shrinkPerWeakDim - 0.2) > 1e-6) {
    throw new Error(`Expected shrinkPerWeakDim ≈ 0.2, got ${c.shrinkPerWeakDim}`);
  }
});

// ──────────────────────────────────────────────────────────────────────────
// Individual-check unit coverage (calling each exported checker directly,
// not just through scanClaimToSource, so a future refactor of the combined
// entry point can't silently stop calling one of them without a test
// noticing).
// ──────────────────────────────────────────────────────────────────────────

test("checkSuperlativeClaims is called directly and returns the expected violation", () => {
  const data = {
    date: POST_CUTOFF_DATE,
    summary: "Oracle's score is confirmed at the bottom of the benchmark's scale.",
    recentAssessments: [{ entity: "Oracle", slug: "oracle", index: "fortune-500", date: POST_CUTOFF_DATE, published: 14.7, assessed: 14.7, delta: 0, status: "documented" }],
  };
  assertHasRule(checkSuperlativeClaims(data, indexLookup), "claim-to-source-superlative", "Direct call to checkSuperlativeClaims must flag");
});

test("checkNumberClaims is called directly and returns the expected violation", () => {
  const data = {
    date: POST_CUTOFF_DATE,
    recentAssessments: [{ entity: "Testland", slug: "testland", index: "countries", date: POST_CUTOFF_DATE, published: 50.0, assessed: 45.2, delta: -4.8, status: "documented", whyHeadline: "Testland's score falls from 50.0 to 40.0 out of 100." }],
  };
  assertHasRule(checkNumberClaims(data, indexLookup), "claim-to-source-number", "Direct call to checkNumberClaims must flag");
});

test("checkPriorBriefingReferences is called directly and returns the expected violation", () => {
  const data = {
    date: POST_CUTOFF_DATE,
    topSignals: [{ title: "Last night's briefing covered Lesotho.", whyItMatters: "", description: "", index: "countries", slug: "lesotho", severity: "low", actionRequired: false, actionType: "documented" }],
  };
  assertHasRule(
    checkPriorBriefingReferences(data, { priorDate: "2026-09-19", priorBriefingRaw: { date: "2026-09-19", topSignals: [] } }, indexLookup),
    "claim-to-source-prior-briefing",
    "Direct call to checkPriorBriefingReferences must flag"
  );
});

test("checkFormulaClaims is called directly and returns the expected violation", () => {
  const data = { methodologyNotes: [{ name: "Bonus Rule", description: "The bonus is up to 12 points.", version: "v1.3", status: "active" }] };
  assertHasRule(checkFormulaClaims(data), "claim-to-source-formula", "Direct call to checkFormulaClaims must flag");
});

// ──────────────────────────────────────────────────────────────────────────
// Number-to-subject binding — the three real misattribution shapes
// (Improvement Loop 16 CS-1 follow-up, 2026-09-16). Coordinator verification
// found 28 report-only false positives, ALL traceable to checkNumberClaims
// binding a genuinely-extracted number to the WRONG entity — never to a real
// claim-to-source defect. Each shape is reconstructed here from the real
// sentence and must now PASS (no flag).
// ──────────────────────────────────────────────────────────────────────────

console.log("\nNumber binding — the three real misattribution shapes (Loop 16 follow-up)\n");

test("number binding: a band-boundary value quoted next to 'boundary' is not the entity's score (real 2026-06-28 Anthropic shape)", () => {
  const data = {
    date: POST_CUTOFF_DATE,
    topSignals: [
      {
        title: "Anthropic holds below the Established line", whyItMatters: "", index: "ai-labs", slug: "anthropic",
        description: "Anthropic sits 0.9 points below the Functional-to-Established boundary (60.0 of 100).",
        severity: "medium", actionRequired: false, actionType: "documented",
      },
    ],
    recentAssessments: [{ entity: "Anthropic", slug: "anthropic", index: "ai-labs", date: POST_CUTOFF_DATE, published: 59.1, assessed: 59.1, delta: 0, status: "documented", whyHeadline: "Anthropic stays flat." }],
  };
  const { violations } = scanClaimToSource(data, { indexLookup });
  assertNoRule(violations, "claim-to-source-number", "60.0 is the BAND BOUNDARY's value, not Anthropic's (59.1) — must not be flagged");
});

test("number binding: a number belonging to a DIFFERENT entity in the same sentence is not attributed to the wrong one (real 2026-07-07 Mali/Burkina Faso shape)", () => {
  const data = {
    date: POST_CUTOFF_DATE,
    summary: "A years-old disagreement over how Mali (3.1 of 100) and Burkina Faso (6.3 of 100) are scored for comparable military-government conduct has now gone two full weeks without resolution.",
    topSignals: [],
    recentAssessments: [
      { entity: "Mali", slug: "mali", index: "countries", date: POST_CUTOFF_DATE, published: 3.1, assessed: 3.1, delta: 0, status: "documented", whyHeadline: "Mali holds." },
    ],
  };
  const { violations } = scanClaimToSource(data, { indexLookup });
  assertNoRule(
    violations,
    "claim-to-source-number",
    "6.3 belongs to Burkina Faso (nearer name), not Mali (allowed: 3.1) — must not be misattributed and flagged against Mali"
  );
});

test("number binding: a formula-arithmetic component ('a base score of N plus an integration premium of M') is not the published composite (real 2026-07-02 Taiwan shape)", () => {
  const data = {
    date: POST_CUTOFF_DATE,
    topSignals: [
      {
        title: "Taiwan's first formal score", whyItMatters: "", index: "countries", slug: "taiwan",
        description: "Taiwan receives its first formal benchmark score of 83.0 out of 100. The composite reconstructs cleanly: a base score of 75.0 plus an integration premium of 8.0.",
        severity: "low", actionRequired: false, actionType: "documented",
      },
    ],
    recentAssessments: [{ entity: "Taiwan", slug: "taiwan", index: "countries", date: POST_CUTOFF_DATE, published: 83.0, assessed: 83.0, delta: 0, status: "documented", whyHeadline: "Taiwan confirmed." }],
  };
  const { violations } = scanClaimToSource(data, { indexLookup });
  assertNoRule(violations, "claim-to-source-number", "75.0 is a pre-bonus formula component, not Taiwan's composite (83.0) — must not be flagged");
});

test("number binding: a trajectory/delta-magnitude claim over multiple cycles is not checked against a single day's pair (real 2026-05-21 India shape)", () => {
  const data = {
    date: POST_CUTOFF_DATE,
    topSignals: [
      {
        title: "India's fastest decline", whyItMatters: "India's trajectory — 34.4 in early May, now 22.7 — represents a 11.7-point decline over three cycles, making it the fastest-declining Developing-band country.",
        description: "", index: "countries", slug: "india", severity: "high", actionRequired: false, actionType: "documented",
      },
    ],
    recentAssessments: [{ entity: "India", slug: "india", index: "countries", date: POST_CUTOFF_DATE, published: 22.7, assessed: 22.7, delta: 0, status: "documented", whyHeadline: "India confirmed." }],
  };
  const { violations } = scanClaimToSource(data, { indexLookup });
  assertNoRule(violations, "claim-to-source-number", "an 11.7-point trajectory decline over three cycles is a delta magnitude, not a score value — must not be flagged");
});

test("number binding: a genuine wrong number is STILL flagged (Wellington's real published score is 83, not 84.0)", () => {
  const data = {
    date: POST_CUTOFF_DATE,
    topSignals: [
      {
        title: "Wellington confirmed", whyItMatters: "Wellington's published score is 84.0 out of 100.", description: "",
        index: "global-cities", slug: "wellington", severity: "low", actionRequired: false, actionType: "documented",
      },
    ],
    recentAssessments: [{ entity: "Wellington", slug: "wellington", index: "global-cities", date: POST_CUTOFF_DATE, published: 83, assessed: 83, delta: 0, status: "documented", whyHeadline: "Wellington confirmed." }],
  };
  const { violations } = scanClaimToSource(data, { indexLookup });
  assertHasRule(violations, "claim-to-source-number", "84.0 does not match Wellington's real published score (83) — must still be flagged");
});

// ──────────────────────────────────────────────────────────────────────────
// Defect 2 — silent degradation. loadPublishedIndexLookup must fail loud
// (throw) rather than let the gate silently pass every claim when it can't
// build a usable lookup; a POPULATED lookup must still catch the real
// defect it exists to catch.
// ──────────────────────────────────────────────────────────────────────────

console.log("\nDefect 2 — loadPublishedIndexLookup fails loud instead of silently degrading\n");

test("loadPublishedIndexLookup throws when the directory has none of the expected index files", () => {
  let threw = false;
  let message = "";
  try {
    loadPublishedIndexLookup("Z:/this/path/does/not/exist");
  } catch (e) {
    threw = true;
    message = e.message;
  }
  if (!threw) throw new Error("Expected loadPublishedIndexLookup to throw for a directory with zero readable index files, but it returned normally.");
  if (!message.includes("Z:/this/path/does/not/exist")) {
    throw new Error(`Expected the thrown error to name the directory it tried. Got: ${message}`);
  }
});

test("loadPublishedIndexLookup throws when called with no argument at all (the exact real mistake that hid the Oracle defect)", () => {
  let threw = false;
  try {
    loadPublishedIndexLookup();
  } catch (e) {
    threw = true;
  }
  if (!threw) throw new Error("Expected loadPublishedIndexLookup() with no argument to throw, not silently return an empty lookup.");
});

test("a zero-entry lookup would otherwise let the real Oracle defect silently pass (demonstrating why defect 2 matters)", () => {
  const emptyLookup = buildIndexLookup({}); // what the old catch-and-degrade path produced
  const data = {
    date: POST_CUTOFF_DATE,
    summary: "Oracle's score is confirmed at the bottom of the benchmark's scale after a third round of layoffs.",
    topSignals: [],
    recentAssessments: [
      { entity: "Oracle", slug: "oracle", index: "fortune-500", date: POST_CUTOFF_DATE, published: 14.7, assessed: 14.7, delta: 0, status: "documented", whyHeadline: "Oracle stays flat." },
    ],
  };
  const { violations } = scanClaimToSource(data, { indexLookup: emptyLookup });
  assertEqual(violations.length, 0, "An empty lookup must silently find nothing to verify against — this is exactly why loadPublishedIndexLookup now throws instead of ever producing one for the real linter run");
});

test("the same real Oracle defect, with a POPULATED lookup, is still caught", () => {
  const data = {
    date: POST_CUTOFF_DATE,
    summary: "Oracle's score is confirmed at the bottom of the benchmark's scale after a third round of layoffs.",
    topSignals: [],
    recentAssessments: [
      { entity: "Oracle", slug: "oracle", index: "fortune-500", date: POST_CUTOFF_DATE, published: 14.7, assessed: 14.7, delta: 0, status: "documented", whyHeadline: "Oracle stays flat." },
    ],
  };
  const { violations } = scanClaimToSource(data, { indexLookup });
  assertHasRule(violations, "claim-to-source-superlative", "With a real, populated lookup, the Oracle defect must still be flagged");
});

// ──────────────────────────────────────────────────────────────────────────
// Summary
// ──────────────────────────────────────────────────────────────────────────

console.log(`\ntest-claim-to-source: ${passed} passed, ${failed} failed\n`);
if (failed > 0) {
  console.log(`CLAIM_TO_SOURCE_CUTOFF in effect: ${CLAIM_TO_SOURCE_CUTOFF}`);
}
process.exit(failed > 0 ? 1 : 0);
