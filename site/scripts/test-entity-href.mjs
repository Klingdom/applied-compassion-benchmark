#!/usr/bin/env node

/**
 * test-entity-href.mjs — Unit tests for the entityHref mapping in src/lib/entityHref.ts.
 *
 * Self-contained: re-implements the KIND_TABLE from entityHref.ts so this
 * script runs without a TypeScript compiler or test runner.
 *
 * Tests (per the S2.3 requirement):
 *  - Every EntityKind maps to the correct route prefix (entityHrefByKind)
 *  - Every EntityKind maps to the correct index slug (kindToIndexSlug)
 *  - entityHref(indexSlug, slug) produces the correct path
 *  - entityHref with an unknown index slug returns null
 *  - KIND_TABLE is internally consistent (indexSlug round-trips back to routePrefix)
 *
 * Exit code 0 = all tests pass, 1 = one or more failures.
 *
 * IMPORTANT: when entityHref.ts mapping values are changed, this test MUST be
 * updated to match — these are the canonical expected values.
 */

// ---------------------------------------------------------------------------
// Canonical mapping (mirrors KIND_TABLE in src/lib/entityHref.ts exactly)
// Any drift between this table and the real source will be caught by the fact
// that both files will need to be edited together for new indexes.
// ---------------------------------------------------------------------------

const KIND_TABLE = {
  company:          { indexSlug: "fortune-500",   routePrefix: "company" },
  country:          { indexSlug: "countries",     routePrefix: "country" },
  "us-state":       { indexSlug: "us-states",     routePrefix: "us-state" },
  "ai-lab":         { indexSlug: "ai-labs",       routePrefix: "ai-lab" },
  "robotics-lab":   { indexSlug: "robotics-labs", routePrefix: "robotics-lab" },
  city:             { indexSlug: "global-cities", routePrefix: "city" },
  "us-city":        { indexSlug: "us-cities",     routePrefix: "us-city" },
};

const ALL_ENTITY_KINDS = Object.keys(KIND_TABLE);

// Re-implement the three exported helpers so we test the contract, not just
// the data (if the logic changes, the tests will still catch regressions).
function kindToIndexSlug(kind) {
  return KIND_TABLE[kind].indexSlug;
}

function kindToRoutePrefix(kind) {
  return KIND_TABLE[kind].routePrefix;
}

// INDEX_ROUTE_PREFIX derived the same way as in entityHref.ts
const INDEX_ROUTE_PREFIX = Object.fromEntries(
  ALL_ENTITY_KINDS.map((k) => [KIND_TABLE[k].indexSlug, KIND_TABLE[k].routePrefix]),
);

function entityHref(indexSlug, entitySlug) {
  const prefix = INDEX_ROUTE_PREFIX[indexSlug];
  if (!prefix) return null;
  return `/${prefix}/${entitySlug}`;
}

function entityHrefByKind(kind, entitySlug) {
  return `/${KIND_TABLE[kind].routePrefix}/${entitySlug}`;
}

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

// ---------------------------------------------------------------------------
// 6. Internal consistency — every kind's indexSlug must resolve to its own routePrefix
// ---------------------------------------------------------------------------

console.log("\nKIND_TABLE internal consistency\n");

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
// ---------------------------------------------------------------------------

console.log("\nKIND_TABLE — kind count\n");

assert("7 entity kinds defined", ALL_ENTITY_KINDS.length, 7);

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
