#!/usr/bin/env node

/**
 * test-lint-briefings.mjs — Test harness for `lint-daily-briefings.mjs`.
 *
 * Generates synthetic daily-briefing JSON inputs covering each rule class,
 * runs the lint script in a temp directory, and asserts the right
 * violations are caught (or that PASS is reported when input is clean).
 *
 * Tests:
 *  1. Clean input → PASS
 *  2. Forbidden phrase in a nested string → caught with phrase + path
 *  3. Forbidden status value → caught
 *  4. Forbidden pipeline key → caught
 *  5. Empty pendingReview array → caught
 *  6. Cycle-type parenthetical → caught
 *  7. Multiple violations in one file → all caught
 *  8. Invalid JSON → caught as parse error
 *  9. unapplied-score-movement rule (Improvement Loop 13, item D-1): movement
 *     verb + score context without a qualifier, on/after the cutoff → caught;
 *     qualified language → passes; applied=1 → passes; pre-cutoff dates →
 *     report-only (no violations); topSignals status "applied" with
 *     scoreChangesApplied 0 → caught.
 *
 * Exit code 0 = all tests pass, 1 = one or more failures.
 *
 * Added: Improvement Loop 5, 2026-05-21. Closes test-coverage red zone (2/10)
 * for the build-time validator added in Loop 3.
 * Extended: Improvement Loop 13, item D-1, 2026-09-14 (unapplied-score-movement rule).
 */

import { writeFileSync, rmSync, existsSync, readFileSync } from "fs";
import { execSync } from "child_process";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { scanForViolations, scanUnappliedScoreMovement, UNAPPLIED_SCORE_MOVEMENT_CUTOFF, evaluateMovementSentence } from "./lib/lint-rules.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const LINT_SCRIPT = join(__dirname, "lint-daily-briefings.mjs");

// Tests run against the canonical shared scanner from lib/lint-rules.mjs.
// This guarantees the tests and the linter cannot drift apart.
// Refactored in Improvement Loop 6 (2026-05-22) from the prior duplicated rules.

// Thin wrapper preserving the legacy 3-arg signature used by every test below.
// We delegate to the canonical scanForViolations and push results into the
// caller's violations array, so tests can keep their existing `scanInMemory(input, "", v)` form.
function scanInMemory(node, path = "", violations) {
  const found = scanForViolations(node, path);
  if (Array.isArray(violations)) {
    for (const f of found) violations.push(f);
  }
  return found;
}

// ──────────────────────────────────────────────────────────────────────────
// Test runner
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

function assertViolation(violations, predicate, msg) {
  const found = violations.find(predicate);
  if (!found) {
    throw new Error(`${msg}\n      Got: ${JSON.stringify(violations)}`);
  }
}

function assertNoViolations(violations) {
  if (violations.length !== 0) {
    throw new Error(`Expected 0 violations, got ${violations.length}: ${JSON.stringify(violations)}`);
  }
}

function assertViolationCount(violations, expected) {
  if (violations.length !== expected) {
    throw new Error(`Expected ${expected} violations, got ${violations.length}: ${JSON.stringify(violations)}`);
  }
}

// ──────────────────────────────────────────────────────────────────────────
// Tests
// ──────────────────────────────────────────────────────────────────────────

console.log("\nTesting lint-daily-briefings rule set\n");

test("clean input produces no violations", () => {
  const input = {
    date: "2026-05-21",
    summary: "Hungary upgraded; Marshall Islands crossed Developing → Functional.",
    pipeline: { scoreChanges: 4, bandCrossingsApplied: 2, entitiesScanned: 1155 },
    topSignals: [{ slug: "hungary", title: "Hungary first formal upgrade ever applied" }],
    boundaryWatch: [{ entity: "Anthropic", note: "Sits at exact Functional/Established boundary." }],
    recentAssessments: [{ slug: "hungary", status: "applied", whyHeadline: "Magyar government rule-of-law mandate." }],
  };
  const v = [];
  scanInMemory(input, "", v);
  assertNoViolations(v);
});

test("forbidden phrase in nested string caught", () => {
  const input = {
    boundaryWatch: [{ entity: "Pakistan", note: "Requires human review before apply." }],
  };
  const v = [];
  scanInMemory(input, "", v);
  // Note: "requires human review" and "human review" both match → 2 hits expected
  assertViolation(v, x => x.rule === "forbidden-phrase" && x.detail === "requires human review",
    "Should catch 'requires human review' phrase");
});

test("forbidden status value caught", () => {
  const input = {
    recentAssessments: [{ slug: "x", status: "requires-human-review" }],
  };
  const v = [];
  scanInMemory(input, "", v);
  assertViolation(v, x => x.rule === "forbidden-status-value" && x.detail === "requires-human-review",
    "Should catch requires-human-review status");
});

test("forbidden pipeline key caught", () => {
  const input = {
    pipeline: { scoreChangesPendingHumanReview: 2, entitiesScanned: 1155 },
  };
  const v = [];
  scanInMemory(input, "", v);
  assertViolation(v, x => x.rule === "forbidden-pipeline-key" && x.detail === "scoreChangesPendingHumanReview",
    "Should catch scoreChangesPendingHumanReview key");
});

test("empty pendingReview array caught", () => {
  const input = { pendingReview: [] };
  const v = [];
  scanInMemory(input, "", v);
  assertViolation(v, x => x.rule === "empty-pendingReview-array",
    "Should catch empty pendingReview");
});

test("cycleType parenthetical caught", () => {
  const input = { cycleType: "wide-symmetric (HUMAN REVIEW REQUIRED)" };
  const v = [];
  scanInMemory(input, "", v);
  assertViolation(v, x => x.rule === "forbidden-cycle-type-parenthetical",
    "Should catch (human review required) in cycleType");
});

test("forbidden phrase case-insensitive", () => {
  const input = { summary: "FOUNDER REVIEW pending for Hungary upgrade." };
  const v = [];
  scanInMemory(input, "", v);
  assertViolation(v, x => x.rule === "forbidden-phrase" && x.detail === "founder review",
    "Should catch FOUNDER REVIEW (case-insensitive)");
});

test("multiple violations in one document all caught", () => {
  const input = {
    pipeline: { humanReviewFlags: 3 },
    recentAssessments: [
      { slug: "us", status: "held", whyHeadline: "Awaiting founder review." },
    ],
    pendingReview: [],
  };
  const v = [];
  scanInMemory(input, "", v);
  // Expect:
  // 1. forbidden-pipeline-key (humanReviewFlags)
  // 2. forbidden-status-value (held)
  // 3. forbidden-phrase (founder review)
  // 4. empty-pendingReview-array
  if (v.length < 4) {
    throw new Error(`Expected ≥4 violations, got ${v.length}: ${JSON.stringify(v)}`);
  }
  assertViolation(v, x => x.rule === "forbidden-pipeline-key", "Should catch pipeline key");
  assertViolation(v, x => x.rule === "forbidden-status-value", "Should catch status");
  assertViolation(v, x => x.rule === "forbidden-phrase", "Should catch phrase");
  assertViolation(v, x => x.rule === "empty-pendingReview-array", "Should catch empty array");
});

test("good observer-voice strings pass (Loop 2 GOOD examples)", () => {
  const goodPhrases = [
    "Pakistan sits 1.7pt above the Critical boundary; conduct continuation under observation.",
    "Anthropic at the exact Functional/Established boundary; resolution turns on the DC Circuit ruling expected within weeks.",
    "Marshall Islands crossed Developing → Functional on the UNGA Pacific cluster post-vote pattern.",
    "Hungary's Magyar government took office May 9 with explicit rule-of-law restoration mandate.",
    "A second worker-death-non-disclosure event would formalize the new conduct anchor as a v1.3 methodology category.",
    "Pakistan continues to accumulate refugee-non-refoulement evidence at the Critical-band floor.",
  ];
  for (const phrase of goodPhrases) {
    const v = [];
    scanInMemory({ note: phrase }, "", v);
    if (v.length !== 0) {
      throw new Error(`GOOD phrase wrongly flagged: "${phrase}"\n      Violations: ${JSON.stringify(v)}`);
    }
  }
});

test("lint-script-on-disk produces non-zero exit when violations exist", () => {
  // Create a temp sandbox under the lint script's expected location
  const tempDir = join(__dirname, "..", "src", "data", "updates", "daily");
  const tempFile = join(tempDir, "_test-fixture-loop5.json");
  try {
    // Write a synthetic violating fixture
    writeFileSync(tempFile, JSON.stringify({
      date: "2099-12-31",
      summary: "This briefing requires human review before publication.",
    }, null, 2));
    let exitCode = 0;
    try {
      execSync(`node "${LINT_SCRIPT}"`, { stdio: "pipe" });
    } catch (e) {
      exitCode = e.status;
    }
    if (exitCode === 0) {
      throw new Error(`Expected lint script to exit non-zero on violating fixture, got ${exitCode}`);
    }
  } finally {
    if (existsSync(tempFile)) rmSync(tempFile);
  }
});

test("lint-script-on-disk produces zero exit when all real files are clean", () => {
  // Real daily/ already validated clean post-Loop 3. Re-run to confirm.
  let exitCode = 0;
  try {
    execSync(`node "${LINT_SCRIPT}"`, { stdio: "pipe" });
  } catch (e) {
    exitCode = e.status;
  }
  if (exitCode !== 0) {
    throw new Error(`Expected lint to exit 0 on clean real files, got ${exitCode}`);
  }
});

// ──────────────────────────────────────────────────────────────────────────
// unapplied-score-movement rule (Improvement Loop 13, item D-1)
// ──────────────────────────────────────────────────────────────────────────

function baseBriefing(overrides = {}) {
  return {
    date: "2026-09-15",
    pipeline: { scoreChangesApplied: 0 },
    headline: "Nothing moved tonight.",
    title: "Compassion Benchmark Daily Briefing",
    summary: "A quiet cycle with no findings.",
    topSignals: [],
    ...overrides,
  };
}

test("unapplied-score-movement: unqualified 'falls ... points' on/after cutoff is a violation", () => {
  const input = baseBriefing({
    headline: "Hong Kong falls 5.9 points after a court ruling.",
  });
  const { violations, reportOnly } = scanUnappliedScoreMovement(input);
  assertViolation(violations, (v) => v.rule === "unapplied-score-movement" && v.path === "headline",
    "Should flag unqualified 'falls ... points' headline on/after cutoff");
  assertViolationCount(reportOnly, 0);
});

test("unapplied-score-movement: 'would fall ... points' passes (qualified/infinitive form)", () => {
  const input = baseBriefing({
    headline: "Hong Kong's score would fall 5.9 points after a court ruling.",
  });
  const { violations } = scanUnappliedScoreMovement(input);
  assertNoViolations(violations);
});

test("unapplied-score-movement: 'a downgrade of 5.9 points is proposed' passes", () => {
  const input = baseBriefing({
    headline: "A downgrade of 5.9 points is proposed for Hong Kong.",
  });
  const { violations } = scanUnappliedScoreMovement(input);
  assertNoViolations(violations);
});

test("unapplied-score-movement: scoreChangesApplied=1 suppresses the rule entirely", () => {
  const input = baseBriefing({
    pipeline: { scoreChangesApplied: 1 },
    headline: "Hong Kong falls 5.9 points after a court ruling.",
  });
  const { violations, reportOnly } = scanUnappliedScoreMovement(input);
  assertNoViolations(violations);
  assertViolationCount(reportOnly, 0);
});

test("unapplied-score-movement: dated before cutoff lands in reportOnly, not violations", () => {
  const input = baseBriefing({
    date: "2026-09-14",
    headline: "Hong Kong falls 5.9 points after a court ruling.",
  });
  const { violations, reportOnly } = scanUnappliedScoreMovement(input);
  assertNoViolations(violations);
  assertViolation(reportOnly, (v) => v.rule === "unapplied-score-movement" && v.path === "headline",
    "Pre-cutoff match should be reported, not failed");
});

test("unapplied-score-movement: 'the government fell' without score context passes", () => {
  const input = baseBriefing({
    summary: "Protests spread nationwide and the government fell within a week.",
  });
  const { violations, reportOnly } = scanUnappliedScoreMovement(input);
  assertNoViolations(violations);
  assertViolationCount(reportOnly, 0);
});

test("unapplied-score-movement: topSignals[].status === 'applied' with scoreChangesApplied 0 is a violation", () => {
  const input = baseBriefing({
    topSignals: [{ title: "Some signal", whyItMatters: "No movement claim here.", status: "applied" }],
  });
  const { violations } = scanUnappliedScoreMovement(input);
  assertViolation(violations, (v) => v.rule === "unapplied-score-movement-status" && v.path === "topSignals[0].status",
    "Should flag topSignals[].status === 'applied' when scoreChangesApplied is 0");
});

test("unapplied-score-movement: topSignals[].title with unqualified movement language is caught", () => {
  const input = baseBriefing({
    topSignals: [{ title: "Hong Kong Falls 5.9 Points as a Third Escalation", whyItMatters: "fine" }],
  });
  const { violations } = scanUnappliedScoreMovement(input);
  assertViolation(violations, (v) => v.path === "topSignals[0].title", "Should flag topSignals[].title movement language");
});

test("unapplied-score-movement: real 2026-09-14.json fixture, re-dated to cutoff, produces the coordinator-flagged violations", () => {
  const fixturePath = join(__dirname, "..", "src", "data", "updates", "daily", "2026-09-14.json");
  const real = JSON.parse(readFileSync(fixturePath, "utf8"));
  const rebased = { ...real, date: UNAPPLIED_SCORE_MOVEMENT_CUTOFF };
  const { violations, reportOnly } = scanUnappliedScoreMovement(rebased);
  assertViolationCount(reportOnly, 0);
  assertViolation(violations, (v) => v.path === "headline", "Should flag the Hong Kong headline");
  assertViolation(violations, (v) => v.path === "topSignals[0].title", "Should flag the Hong Kong topSignals title");
});

test("unapplied-score-movement: the real, unmodified 2026-09-14.json (pre-cutoff) is report-only", () => {
  const fixturePath = join(__dirname, "..", "src", "data", "updates", "daily", "2026-09-14.json");
  const real = JSON.parse(readFileSync(fixturePath, "utf8"));
  const { violations, reportOnly } = scanUnappliedScoreMovement(real);
  assertViolationCount(violations, 0);
  if (reportOnly.length === 0) {
    throw new Error("Expected the real pre-cutoff 2026-09-14.json to produce report-only matches");
  }
});

// ──────────────────────────────────────────────────────────────────────────
// unapplied-score-movement: binding-pattern acceptance fixtures
// (Improvement Loop 13, item D-1 REWORK, 2026-09-14).
//
// Real sentences from the corpus. Each is evaluated two ways:
//  1. Directly via evaluateMovementSentence() (the shared binding logic).
//  2. As a field of a full briefing (date 2026-09-15, scoreChangesApplied:
//     0) via scanUnappliedScoreMovement(), to prove the wiring end to end.
// ──────────────────────────────────────────────────────────────────────────

const MUST_FLAG = [
  "Hong Kong falls 5.9 points after a court jailed three Tiananmen vigil leaders for up to seven years.",
  "Hong Kong's score falls 5.9 points, from 32.8 to 26.9 of 100.",
  "Hong Kong Falls 5.9 Points as a Third Escalation Lands on a Pattern Tracked Since July",
  "Portugal's face-covering ban cuts its score 5 points, just short of a lower band.",
  "Spain fell 9.4 points after Human Rights Watch documented a three-week humanitarian crisis in Ceuta larger than first reported.",
  "Chile's score still falls 20 points, from 62.5 to 42.5 of 100, crossing from the Established band into the Functional band.",
  "Regions Financial Falls 38 Points — Most of That Is a Placeholder Score Finally Reviewed, Not New Misconduct",
  "Taipei's Score Fell 8 Points Over One Case, But Most of That Drop Is Arithmetic, Not New Harm",
  "Philadelphia's score rose slightly after the city recorded its lowest homicide count since the 1960s.",
  "Bolivia falls to 28.4 as President Paz enacts a military-deployment authority law and a fourth death is confirmed.",
  "Humana drops from Functional to Developing (40.6 → 35.2, -5.4) — a band crossing on multi-channel pre-adjudication corroboration.",
  "Vanuatu climbs into the Functional band as the UNGA climate resolution forward trigger fires.",
  // verb-score-value precision fix (Improvement Loop 13, item D-1 second fix, 2026-09-14):
  // the value must look like a score (one-decimal number, or integer + "of 100").
  "Turkey falls to 10.3 as riot police storm CHP headquarters.",
  "Hungary advances to 50.0 after the EU funds accord, and Burkina Faso's composite falls from 12.5 to 6.3.",
  "Senegal falls to 18 of 100 after the crackdown.",
  "Brazil slips out of the Established band.",
  "Mexico's composite dropped by 4.1 pts overnight.",
];

const MUST_PASS = [
  "Syria's score holds at zero, the lowest score on the benchmark, as fuel prices rose sharply and protests spread with no relief announced for the poorest households.",
  "The finding proposes a real score cut, but it has not been applied to OpenAI's published score yet.",
  "This is the second wrong-entity catch in as many nights, after Bangalore on July 29, and no score moved on the dropped claim.",
  "Venezuela's earthquake death toll rose to 3,899 as of day 16; the disaster-response score has now held at the same reduced reading for three straight nights, just under the point threshold the benchmark requires before it changes a published score.",
  "DRC 2.3 of 100: Ebola Climbs to 1,155 Cases and 304 Deaths — July Peak Now Days Away",
  "Venezuela 18.0 of 100: Day 6 Earthquake Response — Toll Rises to 1,719 Dead, 46,600 Missing; US Doubles Commitment to 300 Million Dollars",
  "Anthropic (59.1 out of 100, Functional band) confirmed again after the US government's export-control order on two of its AI models; a Congressional response deadline falls June 26.",
  "Bolivia's score holds steady, but its case raises a new question: should an elected government under economic strain score this close to countries facing state collapse or mass atrocity?",
  "Iran's score of 2.5 out of 100 sits so close to zero that even a move to the floor falls short of the five-point shift needed to change it.",
  "A death toll that keeps rising from a natural disaster is not, by itself, evidence of government misconduct, so Venezuela's score stays the same even as the number climbs.",
  "Nigeria's score also holds, after the World Food Programme said funding shortages forced it to cut nutrition support for more than 300,000 children in the northeast; that cut traces to a global donor-funding gap, not a new failure by Nigeria's government.",
  "Afghanistan's zero score gained confirmed evidence for the first time in two cycles.",
  "Neither Ukraine nor Kyiv lost points for being attacked -- both were scored only on their own emergency response, which was protective.",
  "Reusing the prior scores instead of re-scoring from scratch stopped one event from silently becoming two or three separate score cuts.",
  "The conduct pattern (same-day compliance, transparent disclosure, stated intent to restore access) is scored as mildly positive on the Accountability dimension and confirms, not lowers, the published 59.1 Functional score.",
  "Arizona was flagged on a prison-healthcare order already priced into its score ten days earlier, and re-scoring it was correctly declined.",
  "El Salvador holds at 15 of 100: a constitutional change letting the president serve indefinitely already lowered the score nine days ago, and tonight's evidence confirms that pattern.",
  "OpenAI's score would fall five points after a UK cheating study; the change is proposed, not yet applied.",
  // verb-score-value precision fix (Improvement Loop 13, item D-1 second fix, 2026-09-14):
  // bare integers after to/from are counts (casualties, deaths), not scores.
  "An Ebola Outbreak in the Democratic Republic of the Congo Jumps From 600 to 702 Deaths in Two Days",
  "Kenya's score is unchanged even though protest deaths rose to 12.",
  "Deaths climbed 40 percent while the score held at 33.1.",
  "The court lowered the fine from 50 to 20 million.",
];

MUST_FLAG.forEach((sentence, i) => {
  test(`binding-pattern MUST FLAG fixture ${i + 1}: evaluateMovementSentence direct`, () => {
    const { flagged } = evaluateMovementSentence(sentence);
    if (!flagged) {
      throw new Error(`Expected this sentence to be flagged, but it passed:\n      "${sentence}"`);
    }
  });

  test(`binding-pattern MUST FLAG fixture ${i + 1}: via scanUnappliedScoreMovement (headline field)`, () => {
    const input = baseBriefing({ headline: sentence, summary: "unrelated" });
    const { violations } = scanUnappliedScoreMovement(input);
    assertViolation(violations, (v) => v.path === "headline",
      `Expected headline to be flagged via scanUnappliedScoreMovement:\n      "${sentence}"`);
  });
});

MUST_PASS.forEach((sentence, i) => {
  test(`binding-pattern MUST PASS fixture ${i + 1}: evaluateMovementSentence direct`, () => {
    const { flagged, matches } = evaluateMovementSentence(sentence);
    if (flagged) {
      throw new Error(`Expected this sentence to pass, but it was flagged (${JSON.stringify(matches)}):\n      "${sentence}"`);
    }
  });

  test(`binding-pattern MUST PASS fixture ${i + 1}: via scanUnappliedScoreMovement (headline field)`, () => {
    const input = baseBriefing({ headline: sentence, summary: "unrelated" });
    const { violations } = scanUnappliedScoreMovement(input);
    assertViolationCount(violations, 0);
  });
});

// ──────────────────────────────────────────────────────────────────────────
// Summary
// ──────────────────────────────────────────────────────────────────────────

console.log(`\n${passed} passed, ${failed} failed\n`);
if (failed > 0) {
  console.error("FAIL: test-lint-briefings.mjs detected regressions in the lint rule set.");
  process.exit(1);
}
console.log("PASS: test-lint-briefings.mjs — all rule classes covered, lint script behaves correctly on both clean and violating inputs.");
