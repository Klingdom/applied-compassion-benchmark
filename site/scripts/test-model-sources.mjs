#!/usr/bin/env node

/**
 * test-model-sources.mjs — Fixture-based tests for
 * scripts/lib/model-sources-validator.mjs.
 *
 * Style mirrors test-model-releases.mjs / test-model-registry.mjs: build
 * small synthetic fixtures, run them through the SAME validation function
 * validate-model-sources.mjs uses in production, and assert on the
 * returned failures/warnings arrays.
 *
 * Per rule V8, every check has both a passing fixture and a positive
 * control that proves the check can actually fail: a bad enum, a duplicate
 * source_id, a non-https URL, sourceCount disagreeing with sources.length,
 * and quorumRequired exceeding the primary count.
 *
 * A fixed `now` is passed to every call so results are deterministic
 * regardless of the wall-clock date the suite is run on.
 *
 * Exit code 0 = all tests pass, 1 = one or more failures.
 */

import { validateSourceRegistry, computeSourceId, SOURCE_TYPES, TIERS, RETRIEVAL_METHODS } from "./lib/model-sources-validator.mjs";

let totalPassed = 0;
let totalFailed = 0;

function assert(label, cond) {
  if (cond) {
    console.log(`  PASS  ${label}`);
    totalPassed++;
  } else {
    console.error(`  FAIL  ${label}`);
    totalFailed++;
  }
}

function assertIncludesMatch(label, arr, substring) {
  assert(label, Array.isArray(arr) && arr.some((s) => s.includes(substring)));
}

const NOW = new Date("2026-09-16T12:00:00Z");

// ── Fixture builders ──────────────────────────────────────────────────────

function validSource(overrides = {}) {
  const base = {
    provider: "Test Labs",
    source_type: "announcement",
    url: "https://testlabs.example/news",
    tier: "primary",
    added_at: "2026-09-16T00:00:00Z",
    added_by: "phil@mediafier.ai",
    last_retrieved_at: null,
    retrieval: "http-get",
    content_selector: null,
    notes: "Primary announcements feed.",
    ...overrides,
  };
  base.source_id = overrides.source_id ?? computeSourceId(base);
  return base;
}

function validMeta(overrides = {}) {
  return {
    schemaVersion: "1.0",
    sourceCount: 0,
    quorumRequired: null,
    note: "EMPTY — no source has been registered. A source is added by a human from a verified URL, never inferred.",
    ...overrides,
  };
}

function registryOf(metaOverrides, ...sources) {
  return { meta: validMeta({ sourceCount: sources.length, ...metaOverrides }), sources };
}

// ── Test 1: empty registry passes cleanly (the shipped state) ────────────

console.log("Test 1: empty registry + valid meta → PASS");
{
  const store = registryOf({});
  const result = validateSourceRegistry(store, { now: NOW });
  assert("empty registry: zero failures", result.failures.length === 0);
  assert("empty registry: sourceCount is 0", result.sourceCount === 0);
}

console.log("\nTest 1b: the ACTUAL shipped release-sources-v1.json shape passes");
{
  const shipped = { meta: { schemaVersion: "1.0", sourceCount: 0, quorumRequired: null, note: "EMPTY — no source has been registered. A source is added by a human from a verified URL, never inferred." }, sources: [] };
  const result = validateSourceRegistry(shipped, { now: NOW });
  assert("shipped empty registry: zero failures", result.failures.length === 0);
}

// ── Test 2: a single valid source passes ──────────────────────────────────

console.log("\nTest 2: a single well-formed primary source passes with zero failures");
{
  const store = registryOf({}, validSource());
  const result = validateSourceRegistry(store, { now: NOW });
  assert("valid source: zero failures", result.failures.length === 0);
  assert("valid source: sourceCount is 1", result.sourceCount === 1);
}

// ── Test 3: bad enum (source_type) fails — POSITIVE CONTROL ──────────────

console.log("\nTest 3: an invalid source_type fails (proves the enum check can fail)");
{
  // validSource() derives source_id from source_type internally, so
  // "press-release" here fails ONLY the enum check, not the id-derivation
  // check — this isolates the assertion to the enum.
  const source = validSource({ source_type: "press-release" });
  const store = registryOf({}, source);
  const result = validateSourceRegistry(store, { now: NOW });
  assert("invalid source_type: has failures", result.failures.length > 0);
  assertIncludesMatch("invalid source_type: failure names it", result.failures, "source_type");
}

console.log("\nTest 3b: an invalid tier fails");
{
  const source = validSource({ tier: "tertiary" });
  const store = registryOf({}, source);
  const result = validateSourceRegistry(store, { now: NOW });
  assert("invalid tier: has failures", result.failures.length > 0);
  assertIncludesMatch("invalid tier: failure names it", result.failures, "tier");
}

console.log("\nTest 3c: an invalid retrieval method fails");
{
  const source = validSource({ retrieval: "rss-pull" });
  const store = registryOf({}, source);
  const result = validateSourceRegistry(store, { now: NOW });
  assert("invalid retrieval: has failures", result.failures.length > 0);
  assertIncludesMatch("invalid retrieval: failure names it", result.failures, "retrieval");
}

console.log("\nTest 3d: SOURCE_TYPES, TIERS, RETRIEVAL_METHODS are non-empty exported enums");
{
  assert("SOURCE_TYPES has 9 values", SOURCE_TYPES.length === 9);
  assert("TIERS has 2 values", TIERS.length === 2);
  assert("RETRIEVAL_METHODS has 1 value today", RETRIEVAL_METHODS.length === 1 && RETRIEVAL_METHODS[0] === "http-get");
}

// ── Test 4: duplicate source_id fails — POSITIVE CONTROL ──────────────────

console.log("\nTest 4: two sources colliding on source_id fail (same provider + source_type)");
{
  const sourceA = validSource({ url: "https://testlabs.example/news" });
  const sourceB = validSource({ url: "https://testlabs.example/news/archive" }); // identical (provider, source_type) -> identical source_id
  const store = registryOf({}, sourceA, sourceB);
  const result = validateSourceRegistry(store, { now: NOW });
  assert("source_id collision: has failures", result.failures.length > 0);
  assertIncludesMatch("source_id collision: failure names it", result.failures, "source_id collision");
}

console.log("\nTest 4b: two sources with distinct (provider, source_type) do not collide");
{
  const sourceA = validSource({ provider: "Test Labs", source_type: "announcement" });
  const sourceB = validSource({ provider: "Second Labs", source_type: "announcement" });
  const store = registryOf({}, sourceA, sourceB);
  const result = validateSourceRegistry(store, { now: NOW });
  assert("distinct sources: zero failures", result.failures.length === 0);
}

// ── Test 5: non-https URL fails — POSITIVE CONTROL ─────────────────────────

console.log("\nTest 5: a plain http:// URL fails (must be https)");
{
  const source = validSource({ url: "http://testlabs.example/news" });
  const store = registryOf({}, source);
  const result = validateSourceRegistry(store, { now: NOW });
  assert("http url: has failures", result.failures.length > 0);
  assertIncludesMatch("http url: failure names it", result.failures, "is not an absolute https");
}

console.log("\nTest 5b: a malformed URL fails");
{
  const source = validSource({ url: "not-a-url-at-all" });
  const store = registryOf({}, source);
  const result = validateSourceRegistry(store, { now: NOW });
  assert("malformed url: has failures", result.failures.length > 0);
  assertIncludesMatch("malformed url: failure names it", result.failures, "is not an absolute https");
}

console.log("\nTest 5c: a well-formed https URL passes the URL check");
{
  const source = validSource({ url: "https://secondlabs.example/blog" });
  const store = registryOf({}, source);
  const result = validateSourceRegistry(store, { now: NOW });
  assert("https url: zero failures", result.failures.length === 0);
}

// ── Test 6: sourceCount disagreeing with sources.length fails — POSITIVE CONTROL ──

console.log("\nTest 6: meta.sourceCount disagreeing with sources.length fails");
{
  const store = { meta: validMeta({ sourceCount: 5 }), sources: [validSource()] };
  const result = validateSourceRegistry(store, { now: NOW });
  assert("mismatched sourceCount: has failures", result.failures.length > 0);
  assertIncludesMatch("mismatched sourceCount: failure names it", result.failures, "does not match sources.length");
}

console.log("\nTest 6b: meta.sourceCount matching sources.length passes that check");
{
  const source = validSource();
  const store = { meta: validMeta({ sourceCount: 1 }), sources: [source] };
  const result = validateSourceRegistry(store, { now: NOW });
  assert("matching sourceCount: zero failures", result.failures.length === 0);
}

// ── Test 7: quorumRequired exceeding the primary count fails — POSITIVE CONTROL ──

console.log("\nTest 7: quorumRequired exceeding the number of tier-primary sources fails");
{
  const source = validSource({ tier: "primary" });
  const store = registryOf({ quorumRequired: 3 }, source); // only 1 primary source exists
  const result = validateSourceRegistry(store, { now: NOW });
  assert("quorumRequired too high: has failures", result.failures.length > 0);
  assertIncludesMatch("quorumRequired too high: failure names it", result.failures, "exceeds the number of tier-primary sources");
}

console.log("\nTest 7b: quorumRequired equal to the primary count passes");
{
  const sourceA = validSource({ provider: "Test Labs", tier: "primary" });
  const sourceB = validSource({ provider: "Second Labs", tier: "primary" });
  const store = registryOf({ quorumRequired: 2 }, sourceA, sourceB);
  const result = validateSourceRegistry(store, { now: NOW });
  assert("quorumRequired matching primary count: zero failures", result.failures.length === 0);
}

console.log("\nTest 7c: quorumRequired null (the shipped, empty-registry state) always passes this check");
{
  const store = registryOf({ quorumRequired: null });
  const result = validateSourceRegistry(store, { now: NOW });
  assert("quorumRequired null: zero failures", result.failures.length === 0);
}

console.log("\nTest 7d: a negative or non-integer quorumRequired fails");
{
  const store1 = registryOf({ quorumRequired: -1 });
  const result1 = validateSourceRegistry(store1, { now: NOW });
  assert("negative quorumRequired: has failures", result1.failures.length > 0);

  const store2 = registryOf({ quorumRequired: 1.5 });
  const result2 = validateSourceRegistry(store2, { now: NOW });
  assert("non-integer quorumRequired: has failures", result2.failures.length > 0);
}

// ── Test 8: source_id derivation ───────────────────────────────────────────

console.log("\nTest 8: a hand-assigned source_id not matching its derivation fails");
{
  const source = validSource({ source_id: "src-hand-picked" });
  const store = registryOf({}, source);
  const result = validateSourceRegistry(store, { now: NOW });
  assert("hand-assigned source_id: has failures", result.failures.length > 0);
  assertIncludesMatch("hand-assigned source_id: failure explains derivation", result.failures, "does not match the deterministic derivation");
}

console.log("\nTest 8b: computeSourceId matches the documented format src-<provider>-<type>");
{
  const id = computeSourceId({ provider: "Test Labs", source_type: "announcement" });
  assert('computeSourceId("Test Labs", "announcement") === "src-test-labs-announcement"', id === "src-test-labs-announcement");
}

// ── Test 9: required fields ────────────────────────────────────────────────

console.log("\nTest 9: a source missing a required field fails");
{
  const source = validSource();
  delete source.added_by;
  const store = registryOf({}, source);
  const result = validateSourceRegistry(store, { now: NOW });
  assert("missing added_by: has failures", result.failures.length > 0);
  assertIncludesMatch("missing added_by: failure names it", result.failures, 'missing/empty required string field "added_by"');
}

// ── Test 10: date sanity ───────────────────────────────────────────────────

console.log("\nTest 10: a future added_at fails");
{
  const source = validSource({ added_at: "2099-01-01T00:00:00Z" });
  const store = registryOf({}, source);
  const result = validateSourceRegistry(store, { now: NOW });
  assert("future added_at: has failures", result.failures.length > 0);
  assertIncludesMatch("future added_at: failure names it", result.failures, "is in the future");
}

console.log("\nTest 10b: last_retrieved_at null (never fetched) is valid, not a failure");
{
  const source = validSource({ last_retrieved_at: null });
  const store = registryOf({}, source);
  const result = validateSourceRegistry(store, { now: NOW });
  assert("null last_retrieved_at: zero failures", result.failures.length === 0);
}

console.log("\nTest 10c: a future last_retrieved_at fails");
{
  const source = validSource({ last_retrieved_at: "2099-01-01T00:00:00Z" });
  const store = registryOf({}, source);
  const result = validateSourceRegistry(store, { now: NOW });
  assert("future last_retrieved_at: has failures", result.failures.length > 0);
  assertIncludesMatch("future last_retrieved_at: failure names it", result.failures, "is in the future");
}

// ── Summary ─────────────────────────────────────────────────────────────

console.log(`\n${"─".repeat(70)}`);
console.log(`TOTAL: ${totalPassed} passed, ${totalFailed} failed`);

if (totalFailed > 0) {
  console.error(`\nFAILED — ${totalFailed} test(s) did not pass\n`);
  process.exit(1);
} else {
  console.log(`\nAll ${totalPassed} tests passed\n`);
  process.exit(0);
}
