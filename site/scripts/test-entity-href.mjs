#!/usr/bin/env node

/**
 * test-entity-href.mjs — Unit tests for the entityHref mapping in src/lib/entityHref.ts.
 *
 * IMPORTS the real KIND_TABLE and helpers directly from src/lib/entityHref.ts
 * (Node 22+ strips TypeScript types natively, so a relative .ts import works
 * without a bundler or ts-node). This used to re-implement its own 7-entry
 * copy of KIND_TABLE, which drifted out of sync when the Universities Index
 * shipped (2026-06-19) — the test passed green while site search was
 * silently broken for ~100 universities. Importing the real source instead
 * means this test can never drift from entityHref.ts again.
 *
 * Tests (per the S2.3 requirement):
 *  - Every EntityKind maps to the correct route prefix (entityHrefByKind)
 *  - Every EntityKind maps to the correct index slug (kindToIndexSlug)
 *  - entityHref(indexSlug, slug) produces the correct path
 *  - entityHref with an unknown index slug returns null
 *  - KIND_TABLE is internally consistent (indexSlug round-trips back to routePrefix)
 *  - The registry has exactly 8 kinds (fails loudly if a future index is
 *    added to entityHref.ts but this test isn't updated to exercise it)
 *
 * Exit code 0 = all tests pass, 1 = one or more failures.
 */

import {
  KIND_TABLE,
  ALL_ENTITY_KINDS,
  kindToIndexSlug,
  kindToRoutePrefix,
  entityHref,
  entityHrefByKind,
} from "../src/lib/entityHref.ts";

// ---------------------------------------------------------------------------
// Test harness
// ---------------------------------------------------------------------------

let passed = 0;
let failed = 0;

function assert(label, actual, expected) {
  if (actual === expected) {
    console.log(`  PASS  ${label}`);
    passed++;
  } else {
    console.error(`  FAIL  ${label}`);
    console.error(`        expected: ${JSON.stringify(expected)}`);
    console.error(`        actual:   ${JSON.stringify(actual)}`);
    failed++;
  }
}

// ---------------------------------------------------------------------------
// 1. Every EntityKind → correct route prefix
// ---------------------------------------------------------------------------

console.log("\nkindToRoutePrefix — every EntityKind\n");

assert('kindToRoutePrefix("company")',        kindToRoutePrefix("company"),        "company");
assert('kindToRoutePrefix("country")',        kindToRoutePrefix("country"),        "country");
assert('kindToRoutePrefix("us-state")',       kindToRoutePrefix("us-state"),       "us-state");
assert('kindToRoutePrefix("ai-lab")',         kindToRoutePrefix("ai-lab"),         "ai-lab");
assert('kindToRoutePrefix("robotics-lab")',   kindToRoutePrefix("robotics-lab"),   "robotics-lab");
assert('kindToRoutePrefix("city")',           kindToRoutePrefix("city"),           "city");
assert('kindToRoutePrefix("us-city")',        kindToRoutePrefix("us-city"),        "us-city");
assert('kindToRoutePrefix("university")',     kindToRoutePrefix("university"),     "university");

// ---------------------------------------------------------------------------
// 2. Every EntityKind → correct index slug
// ---------------------------------------------------------------------------

console.log("\nkindToIndexSlug — every EntityKind\n");

assert('kindToIndexSlug("company")',        kindToIndexSlug("company"),        "fortune-500");
assert('kindToIndexSlug("country")',        kindToIndexSlug("country"),        "countries");
assert('kindToIndexSlug("us-state")',       kindToIndexSlug("us-state"),       "us-states");
assert('kindToIndexSlug("ai-lab")',         kindToIndexSlug("ai-lab"),         "ai-labs");
assert('kindToIndexSlug("robotics-lab")',   kindToIndexSlug("robotics-lab"),   "robotics-labs");
assert('kindToIndexSlug("city")',           kindToIndexSlug("city"),           "global-cities");
assert('kindToIndexSlug("us-city")',        kindToIndexSlug("us-city"),        "us-cities");
assert('kindToIndexSlug("university")',     kindToIndexSlug("university"),     "universities");

// ---------------------------------------------------------------------------
// 3. entityHref(indexSlug, slug) — known index slugs
// ---------------------------------------------------------------------------

console.log("\nentityHref — known index slugs\n");

assert('entityHref("fortune-500", "apple-inc")',    entityHref("fortune-500", "apple-inc"),    "/company/apple-inc");
assert('entityHref("countries", "france")',         entityHref("countries", "france"),         "/country/france");
assert('entityHref("us-states", "california")',     entityHref("us-states", "california"),     "/us-state/california");
assert('entityHref("ai-labs", "openai")',           entityHref("ai-labs", "openai"),           "/ai-lab/openai");
assert('entityHref("robotics-labs", "boston-dy")',  entityHref("robotics-labs", "boston-dy"),  "/robotics-lab/boston-dy");
assert('entityHref("global-cities", "new-york")',   entityHref("global-cities", "new-york"),   "/city/new-york");
assert('entityHref("us-cities", "chicago")',        entityHref("us-cities", "chicago"),        "/us-city/chicago");
assert('entityHref("universities", "harvard-university")', entityHref("universities", "harvard-university"), "/university/harvard-university");

// ---------------------------------------------------------------------------
// 4. entityHref — unknown index slug returns null
// ---------------------------------------------------------------------------

console.log("\nentityHref — unknown index slug\n");

assert('entityHref("unknown-index", "foo") → null',  entityHref("unknown-index", "foo"),  null);
assert('entityHref("", "bar") → null',               entityHref("", "bar"),               null);

// ---------------------------------------------------------------------------
// 5. entityHrefByKind — spot check
// ---------------------------------------------------------------------------

console.log("\nentityHrefByKind — spot check\n");

assert('entityHrefByKind("company", "microsoft")',   entityHrefByKind("company", "microsoft"),   "/company/microsoft");
assert('entityHrefByKind("ai-lab", "anthropic")',    entityHrefByKind("ai-lab", "anthropic"),    "/ai-lab/anthropic");
assert('entityHrefByKind("us-city", "dallas")',      entityHrefByKind("us-city", "dallas"),      "/us-city/dallas");
assert('entityHrefByKind("university", "mit")',      entityHrefByKind("university", "mit"),      "/university/mit");

// ---------------------------------------------------------------------------
// 6. Internal consistency — every kind's indexSlug must resolve to its own routePrefix
// ---------------------------------------------------------------------------

console.log("\nKIND_TABLE internal consistency\n");

const INDEX_ROUTE_PREFIX = Object.fromEntries(
  ALL_ENTITY_KINDS.map((k) => [KIND_TABLE[k].indexSlug, KIND_TABLE[k].routePrefix]),
);

for (const kind of ALL_ENTITY_KINDS) {
  const { indexSlug, routePrefix } = KIND_TABLE[kind];
  const resolved = INDEX_ROUTE_PREFIX[indexSlug];
  assert(
    `${kind}: indexSlug "${indexSlug}" round-trips to routePrefix "${routePrefix}"`,
    resolved,
    routePrefix,
  );
}

// ---------------------------------------------------------------------------
// 7. Total kind count — guard against accidental addition or removal
//    (the exact drift class that broke entity search for Universities)
// ---------------------------------------------------------------------------

console.log("\nKIND_TABLE — kind count\n");

assert("8 entity kinds defined (ALL_ENTITY_KINDS.length === 8)", ALL_ENTITY_KINDS.length, 8);
assert('"university" is present in ALL_ENTITY_KINDS', ALL_ENTITY_KINDS.includes("university"), true);

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

console.log(`\n${"─".repeat(50)}`);
console.log(`entityHref tests: ${passed} passed, ${failed} failed`);

if (failed > 0) {
  console.error("\nOne or more entityHref tests FAILED.");
  process.exit(1);
}
console.log("\nAll entityHref tests passed.");
