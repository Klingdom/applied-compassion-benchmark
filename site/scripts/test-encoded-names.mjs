#!/usr/bin/env node
/**
 * test-encoded-names.mjs — Coverage for findEncodedEntityNames() in
 * validate-indexes.mjs (RS-2a gate, RISK-023).
 *
 * findEncodedEntityNames() flags any published entity `name` that still
 * carries an HTML-entity escape (e.g. "&amp;", "&#x27;"), which is how the
 * 20 Fortune 500 rows fixed under RISK-023 first got published wrong.
 *
 * Cases, all using in-memory fixtures (no real index data touched):
 *   1. Negative control — a clean fixture with a planted encoded name →
 *      the check fails (reports exactly the planted violation).
 *   2. Same fixture with the encoded name decoded → the check passes (no
 *      violations).
 *   3. Multiple encoding styles in one fixture (&amp;, &#x27;, &#39;) are all
 *      caught, with correct name/rank pairs.
 *   4. Bare `&` (not a terminated entity escape) is NOT flagged — this gate
 *      is for encoded sequences only, not literal ampersands in names.
 *   5. Non-string / missing `name` fields don't throw.
 *   6. A real run against the current repo's fortune-500.json → 0
 *      violations (the 20 RISK-023 rows have been decoded).
 *
 * Run: node site/scripts/test-encoded-names.mjs
 */

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { findEncodedEntityNames } from "./validate-indexes.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = join(__dirname, "..");
const INDEXES_DIR = join(SITE_ROOT, "src", "data", "indexes");

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
  } else {
    failed++;
    console.log(`  FAIL: ${message}`);
  }
}

// ─── Case 1: negative control — planted encoded name → check FAILS ─────────

console.log("\nCase 1 (negative control): planted encoded name → check fails");
{
  const fixture = [
    { rank: 1, name: "Clean Company" },
    { rank: 2, name: "Procter &amp; Gamble" }, // planted probe — in-memory only
    { rank: 3, name: "Another Clean Co" },
  ];

  const violations = findEncodedEntityNames(fixture);

  assert(violations.length === 1, `expected exactly 1 violation, got ${violations.length}`);
  assert(
    violations[0] && violations[0].name === "Procter &amp; Gamble" && violations[0].rank === 2,
    "violation should name the planted entity and its rank"
  );
}

// ─── Case 2: same fixture, probe removed/decoded → check PASSES ───────────

console.log("Case 2: probe decoded → check passes (0 violations)");
{
  const fixture = [
    { rank: 1, name: "Clean Company" },
    { rank: 2, name: "Procter & Gamble" }, // decoded
    { rank: 3, name: "Another Clean Co" },
  ];

  const violations = findEncodedEntityNames(fixture);

  assert(violations.length === 0, `expected 0 violations after decoding, got ${violations.length}`);
}

// ─── Case 3: multiple encoding styles are all caught ───────────────────────

console.log("Case 3: &amp; / &#x27; / &#39; are all caught");
{
  const fixture = [
    { rank: 1, name: "AT&amp;T" },
    { rank: 2, name: "Macy&#x27;s" },
    { rank: 3, name: "Bally&#39;s Corporation" },
  ];

  const violations = findEncodedEntityNames(fixture);

  assert(violations.length === 3, `expected 3 violations, got ${violations.length}`);
  assert(
    violations.map((v) => v.rank).sort().join(",") === "1,2,3",
    "all three ranks should be reported"
  );
}

// ─── Case 4: bare, unterminated `&` is not flagged ─────────────────────────

console.log("Case 4: bare '&' without an entity escape is not flagged");
{
  const fixture = [
    { rank: 1, name: "Johnson & Johnson" }, // correctly decoded — plain ampersand
    { rank: 2, name: "R&D Holdings" },
  ];

  const violations = findEncodedEntityNames(fixture);

  assert(violations.length === 0, `expected 0 violations for plain ampersands, got ${violations.length}`);
}

// ─── Case 5: missing/non-string name fields don't throw ────────────────────

console.log("Case 5: missing/non-string name fields don't throw");
{
  const fixture = [{ rank: 1 }, { rank: 2, name: null }, { rank: 3, name: 42 }];

  let threw = false;
  let violations = [];
  try {
    violations = findEncodedEntityNames(fixture);
  } catch {
    threw = true;
  }

  assert(!threw, "findEncodedEntityNames should not throw on missing/non-string names");
  assert(violations.length === 0, `expected 0 violations, got ${violations.length}`);
}

// ─── Case 6: real repo data → 0 violations post-migration ──────────────────

console.log("Case 6: real fortune-500.json → 0 encoded names (RISK-023 fixed)");
{
  const data = JSON.parse(readFileSync(join(INDEXES_DIR, "fortune-500.json"), "utf-8"));
  const violations = findEncodedEntityNames(data.rankings ?? []);

  assert(
    violations.length === 0,
    `expected 0 encoded names in fortune-500.json, got ${violations.length}: ${JSON.stringify(violations)}`
  );
}

// ─── Summary ────────────────────────────────────────────────────────────────

console.log(`\ntest-encoded-names: ${passed} passed, ${failed} failed\n`);
process.exit(failed > 0 ? 1 : 0);
