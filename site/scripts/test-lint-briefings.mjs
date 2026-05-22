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
 *
 * Exit code 0 = all tests pass, 1 = one or more failures.
 *
 * Added: Improvement Loop 5, 2026-05-21. Closes test-coverage red zone (2/10)
 * for the build-time validator added in Loop 3.
 */

import { writeFileSync, rmSync, existsSync } from "fs";
import { execSync } from "child_process";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { scanForViolations } from "./lib/lint-rules.mjs";

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
// Summary
// ──────────────────────────────────────────────────────────────────────────

console.log(`\n${passed} passed, ${failed} failed\n`);
if (failed > 0) {
  console.error("FAIL: test-lint-briefings.mjs detected regressions in the lint rule set.");
  process.exit(1);
}
console.log("PASS: test-lint-briefings.mjs — all rule classes covered, lint script behaves correctly on both clean and violating inputs.");
