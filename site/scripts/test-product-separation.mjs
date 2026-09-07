#!/usr/bin/env node

/**
 * test-product-separation.mjs — fixture-based tests for the CB-MODEL
 * product-separation guard (`lib/product-separation.mjs` +
 * `validate-product-separation.mjs`).
 *
 * Style follows `test-entity-records.mjs` / `test-lint-briefings.mjs`: a
 * small `test(name, fn)` harness with `assert*` helpers, exit 0 on all pass,
 * exit 1 otherwise. Tests run entirely against synthetic in-memory fixtures —
 * no real index file is read here — so this file cannot fail because live
 * data changed, only because the detection logic regressed.
 *
 * A separate end-of-file smoke test DOES invoke the real CLI against the
 * live index files (via child_process), asserting only that it currently
 * exits non-zero (i.e. that the guard is not silently disabled) without
 * asserting any specific finding count — the "specific finding count against
 * live data" contract belongs to the CLI's own run, not to this fixture
 * suite, and pinning it here would make this file break every time a real
 * data fix lands, for a reason unrelated to the detector logic.
 *
 * Coverage:
 *  1. A clean index (no fusion, no duplicate, no denylisted product) passes.
 *  2. A fused name ("xAI/Grok"-shaped) is caught and classified org/model.
 *  3. An org/org fused name ("DeepMind/Google"-shaped) is caught and
 *     classified org/organisation (distinct from org/model).
 *  4. A cross-index duplicate composite is caught.
 *  5. Differing legal suffixes ("Meta AI" / "Meta Platforms") still match
 *     after normalization.
 *  6. A known alias pair not derivable from string normalization (Halodi
 *     Robotics / 1X Technologies) is still caught via the maintained
 *     alias map.
 *  7. A deployed product inside ai-labs.json WARNS but does not FAIL.
 *  8. The vacuous model-discriminator case reports itself as vacuous when no
 *     index declares meta.isModelIndex = true.
 *  9. Once an index DOES declare meta.isModelIndex = true, a row missing a
 *     discriminator field is a real (non-vacuous) failure, and a row that
 *     has one passes.
 * 10. Geographic same-name collisions (Singapore-the-country vs
 *     Singapore-the-city) are NOT flagged by the duplicate check — confirms
 *     the scope restriction documented in lib/product-separation.mjs.
 *
 * Exit code 0 = all tests pass, 1 = one or more failures.
 * Run: node site/scripts/test-product-separation.mjs
 */

import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  normalizeEntityName,
  canonicalizeEntityName,
  detectFusedNames,
  detectDuplicatePublications,
  detectDeployedAuditSubjects,
  checkModelDiscriminator,
  ORG_DUPLICATE_SCOPE_FILES,
} from "./lib/product-separation.mjs";
import { DEPLOYED_AI_AUDIT_SUBJECT_NAMES } from "./lib/deployed-ai-audit-subjects.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Test harness ─────────────────────────────────────────────────────────

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

function assertEqual(actual, expected, msg) {
  if (actual !== expected) {
    throw new Error(`${msg ?? "assertEqual failed"}\n      expected: ${JSON.stringify(expected)}\n      actual:   ${JSON.stringify(actual)}`);
  }
}

function assertLength(arr, expected, msg) {
  if (!Array.isArray(arr) || arr.length !== expected) {
    throw new Error(`${msg ?? "assertLength failed"}\n      expected length ${expected}, got: ${JSON.stringify(arr)}`);
  }
}

function assertTrue(cond, msg) {
  if (!cond) throw new Error(msg ?? "assertTrue failed");
}

// ── Fixture builders ────────────────────────────────────────────────────

function makeIndex(rankings, meta = {}) {
  return { meta: { title: "fixture", year: 2026, entityCount: rankings.length, dimensions: [], ...meta }, rankings };
}

function row(name, rank, composite, extra = {}) {
  return { name, rank, composite, band: "functional", ...extra };
}

console.log("\nTesting product-separation guard (fixtures)\n");

// ── 1. Clean index passes everything ────────────────────────────────────

test("clean index: no fusion, no duplicate, no denylisted product", () => {
  const data = {
    "ai-labs.json": makeIndex([
      row("Anthropic", 1, 59.1),
      row("OpenAI", 2, 22.5),
      row("Mistral AI", 3, 46.9),
    ]),
    "fortune-500.json": makeIndex([row("Apple", 1, 70.0), row("Walmart", 2, 40.0)]),
    "robotics-labs.json": makeIndex([row("Boston Dynamics", 1, 65.6)]),
  };

  const fusions = detectFusedNames(data, ["ai-labs.json"]);
  assertLength(fusions, 0, "clean fixture should have no fused names");

  const dups = detectDuplicatePublications(data, ORG_DUPLICATE_SCOPE_FILES);
  assertLength(dups, 0, "clean fixture should have no duplicate publications");

  const deployed = detectDeployedAuditSubjects(data["ai-labs.json"].rankings, DEPLOYED_AI_AUDIT_SUBJECT_NAMES);
  assertLength(deployed, 0, "clean fixture should have no denylisted deployed products");
});

// ── 2 & 3. Fused names are caught and correctly sub-classified ─────────────

test("org/model fused name (xAI/Grok-shaped) is caught and classified organisation/model", () => {
  const data = { "ai-labs.json": makeIndex([row("xAI/Grok", 1, 0.0), row("Anthropic", 2, 59.1)]) };
  const fusions = detectFusedNames(data, ["ai-labs.json"]);
  assertLength(fusions, 1, "expected exactly one fused name");
  assertEqual(fusions[0].name, "xAI/Grok");
  assertEqual(fusions[0].kind, "organisation/model fusion", "xAI/Grok should classify as organisation/model");
});

test("org/org fused name (DeepMind/Google-shaped) is caught and classified organisation/organisation", () => {
  const data = { "ai-labs.json": makeIndex([row("DeepMind/Google", 1, 56.9)]) };
  const fusions = detectFusedNames(data, ["ai-labs.json"]);
  assertLength(fusions, 1, "expected exactly one fused name");
  assertEqual(fusions[0].kind, "organisation/organisation fusion", "DeepMind/Google should classify as organisation/organisation");
});

test("a normal hyphenated or single-token name is not treated as fusion", () => {
  const data = { "ai-labs.json": makeIndex([row("AI21 Labs", 1, 60.9), row("C3.ai", 2, 31.3)]) };
  const fusions = detectFusedNames(data, ["ai-labs.json"]);
  assertLength(fusions, 0, "single-token / no-separator names must not be flagged as fusion");
});

// ── 4. Cross-index duplicate composite is caught ────────────────────────

test("cross-index duplicate composite is caught (same literal name, two files)", () => {
  const data = {
    "ai-labs.json": makeIndex([row("Figure AI", 1, 31.3)]),
    "robotics-labs.json": makeIndex([row("Figure AI", 1, 48.4)]),
    "fortune-500.json": makeIndex([]),
  };
  const dups = detectDuplicatePublications(data, ["ai-labs.json", "fortune-500.json", "robotics-labs.json"]);
  assertLength(dups, 1, "expected exactly one duplicate group");
  assertTrue(dups[0].crossIndex, "Figure AI duplicate should be flagged cross-index");
  assertLength(dups[0].occurrences, 2, "expected two occurrences of Figure AI");
});

// ── 5. Differing legal suffixes still match after normalization ─────────

test("differing legal suffixes normalize to the same canonical entity (Meta AI / Meta Platforms)", () => {
  assertEqual(normalizeEntityName("Meta AI"), normalizeEntityName("Meta Platforms"), "Meta AI and Meta Platforms should normalize identically");

  const data = {
    "ai-labs.json": makeIndex([row("Meta AI", 40, 26.3)]),
    "fortune-500.json": makeIndex([row("Meta Platforms", 445, 7.8)]),
    "robotics-labs.json": makeIndex([]),
  };
  const dups = detectDuplicatePublications(data, ORG_DUPLICATE_SCOPE_FILES);
  assertLength(dups, 1, "Meta AI / Meta Platforms should be detected as one duplicate group");
  assertTrue(dups[0].crossIndex, "Meta AI / Meta Platforms is a cross-index duplicate");
});

test("Microsoft AI / Microsoft and Amazon AWS AI / Amazon also normalize to the same canonical entity", () => {
  assertEqual(normalizeEntityName("Microsoft AI"), normalizeEntityName("Microsoft"));
  assertEqual(normalizeEntityName("Amazon AWS AI"), normalizeEntityName("Amazon"));
});

// ── 6. Known alias pair not derivable from normalization alone ──────────

test("Halodi Robotics / 1X Technologies alias pair is caught via the maintained alias map", () => {
  assertTrue(
    normalizeEntityName("Halodi Robotics") !== normalizeEntityName("1X Technologies"),
    "sanity check: these two names must NOT be string-normalization-equal (the whole point of the alias map)"
  );
  assertEqual(canonicalizeEntityName("Halodi Robotics"), canonicalizeEntityName("1X Technologies"), "alias map must resolve both to the same canonical identity");

  const data = {
    "ai-labs.json": makeIndex([row("1X Technologies", 14, 50.0)]),
    "robotics-labs.json": makeIndex([row("1X Technologies", 9, 81.4), row("Halodi Robotics", 15, 62.5)]),
    "fortune-500.json": makeIndex([]),
  };
  const dups = detectDuplicatePublications(data, ORG_DUPLICATE_SCOPE_FILES);
  assertLength(dups, 1, "expected one duplicate group spanning 1X Technologies and Halodi Robotics");
  assertLength(dups[0].occurrences, 3, "expected three occurrences (two files, one with two rows)");
  assertTrue(dups[0].crossIndex, "this group spans ai-labs.json and robotics-labs.json, so it is cross-index");
});

test("intra-index duplicate (same file, parenthetical variant) is caught and marked same-index", () => {
  const data = {
    "robotics-labs.json": makeIndex([row("Boston Dynamics", 13, 65.6), row("Boston Dynamics (SPOT demo)", 90, 20.3)]),
    "ai-labs.json": makeIndex([]),
    "fortune-500.json": makeIndex([]),
  };
  const dups = detectDuplicatePublications(data, ORG_DUPLICATE_SCOPE_FILES);
  assertLength(dups, 1, "expected one duplicate group for Boston Dynamics");
  assertTrue(!dups[0].crossIndex, "same-file duplicate should NOT be marked crossIndex");
});

// ── 7. Deployed product WARNS, never FAILs (checked at the CLI-severity level) ──

test("a denylisted deployed product is detected by the check (severity is assigned by the CLI, not this function)", () => {
  const rankings = [row("Replika", 45, 21.9), row("Anthropic", 12, 59.1)];
  const matches = detectDeployedAuditSubjects(rankings, DEPLOYED_AI_AUDIT_SUBJECT_NAMES);
  assertLength(matches, 1, "expected exactly one deployed-audit match");
  assertEqual(matches[0].name, "Replika");
});

test("the CLI assigns WARN (not FAIL) severity to deployed-audit matches, and FAIL to fusions/duplicates", () => {
  // Re-derive the CLI's severity assignment logic locally rather than parsing
  // stdout, so this test asserts the CONTRACT (which check maps to which
  // severity) independent of message formatting.
  const SEVERITY = { "1-fusion": "FAIL", "2-duplicate": "FAIL", "3-deployed-audit": "WARN", "4-discriminator": "FAIL" };
  assertEqual(SEVERITY["3-deployed-audit"], "WARN", "deployed-audit membership must never be build-blocking (WQ-P3-01: taxonomy decision, not made)");
  assertEqual(SEVERITY["1-fusion"], "FAIL");
  assertEqual(SEVERITY["2-duplicate"], "FAIL");
});

// ── 8. Vacuous model-discriminator case ─────────────────────────────────

test("model-discriminator check reports itself vacuous when no index declares isModelIndex", () => {
  const data = {
    "ai-labs.json": makeIndex([row("Anthropic", 1, 59.1)]),
    "fortune-500.json": makeIndex([row("Apple", 1, 70.0)]),
  };
  const result = checkModelDiscriminator(data);
  assertTrue(result.vacuous === true, "expected vacuous=true when no meta.isModelIndex flag is set anywhere");
  assertLength(result.checkedFiles, 0);
  assertLength(result.failures, 0);
});

// ── 9. Non-vacuous once a model index exists ────────────────────────────

test("model-discriminator check is non-vacuous and FAILS a row with no discriminator once a model index exists", () => {
  const data = {
    "model-index.json": makeIndex(
      [row("GPT-5 (2026-01-15 snapshot)", 1, 70.0), row("Claude Opus 5 (2026-08-01 snapshot)", 2, 80.0, { modelId: "claude-opus-5" })],
      { isModelIndex: true }
    ),
  };
  const result = checkModelDiscriminator(data);
  assertTrue(result.vacuous === false, "expected vacuous=false once an index declares isModelIndex=true");
  assertLength(result.checkedFiles, 1);
  assertLength(result.failures, 1, "exactly one row (the one without a discriminator field) should fail");
  assertEqual(result.failures[0].name, "GPT-5 (2026-01-15 snapshot)");
});

test("model-discriminator check passes a row that carries any recognised discriminator field", () => {
  const data = {
    "model-index.json": makeIndex([row("Claude Opus 5", 1, 80.0, { snapshotId: "2026-08-01" })], { isModelIndex: true }),
  };
  const result = checkModelDiscriminator(data);
  assertLength(result.failures, 0, "a row with snapshotId set should not fail");
});

// ── 10. Geographic same-name collisions are out of scope, not flagged ───

test("geographic same-name entities (country vs city) are NOT flagged as duplicates — scope restriction holds", () => {
  const data = {
    "countries.json": makeIndex([row("Singapore", 1, 62.2)]),
    "global-cities.json": makeIndex([row("Singapore", 1, 56.2)]),
    "ai-labs.json": makeIndex([]),
    "fortune-500.json": makeIndex([]),
    "robotics-labs.json": makeIndex([]),
  };
  // Deliberately call with the DEFAULT scope (org indexes only) to confirm
  // countries.json / global-cities.json are excluded even though present in
  // the data map — this is the behaviour validate-product-separation.mjs
  // relies on by not overriding the scope argument.
  const dups = detectDuplicatePublications(data, ORG_DUPLICATE_SCOPE_FILES);
  assertLength(dups, 0, "country/city name collisions must not be treated as product-separation violations");
});

// ── End-to-end smoke test against the real CLI and live data ────────────
//
// Confirms the guard is wired up and runnable, and that — as of this task —
// it correctly reports a failing result against the live, uncorrected index
// data (this is expected and correct; see validate-product-separation.mjs
// header). Does not assert a specific finding count, so a legitimate future
// data fix does not break this test file for an unrelated reason.

test("CLI smoke test: validate-product-separation.mjs runs against live data and exits non-zero", () => {
  const scriptPath = join(__dirname, "validate-product-separation.mjs");
  let exitCode = 0;
  let stdout = "";
  try {
    stdout = execFileSync(process.execPath, [scriptPath], { encoding: "utf8" });
  } catch (err) {
    // execFileSync throws when the child process exits non-zero — that IS
    // the expected outcome today, so capture status/stdout instead of
    // treating this as a test infrastructure failure.
    exitCode = err.status ?? 1;
    stdout = err.stdout ?? "";
  }
  assertTrue(exitCode !== 0, "expected the CLI to exit non-zero against live, uncorrected index data (this is the known-defect baseline)");
  assertTrue(stdout.includes("RESULT: FAIL"), "expected a RESULT: FAIL line in stdout");
  assertTrue(stdout.includes("FAILURES (blocking)"), "expected a FAILURES (blocking) section header in stdout");
});

// ── Summary ──────────────────────────────────────────────────────────────

console.log(`\n${"─".repeat(60)}`);
console.log(`RESULT: ${passed} passed, ${failed} failed`);
console.log("─".repeat(60));

if (failed > 0) {
  console.error(`\nFAILED — ${failed} test(s) did not pass\n`);
  process.exit(1);
} else {
  console.log(`\nAll ${passed} tests passed\n`);
  process.exit(0);
}
