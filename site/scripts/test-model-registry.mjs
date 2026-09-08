#!/usr/bin/env node

/**
 * test-model-registry.mjs — Fixture-based tests for
 * scripts/lib/model-registry-validator.mjs.
 *
 * Style mirrors test-task-bank.mjs / test-product-separation.mjs: build
 * small synthetic fixtures, run them through the SAME validation functions
 * validate-model-registry.mjs uses in production, and assert on the
 * returned failures/warnings arrays.
 *
 * Covers (at minimum, per the CB-MODEL Phase 1 Item 4 brief):
 *  - Empty registry passes.
 *  - A valid entry passes.
 *  - An attempted identity overwrite (edited in place) fails.
 *  - A reused model name with new behaviour evidence requires a new
 *    snapshot and fails if edited in place instead.
 *  - A missing content hash fails.
 *  - A developer matching two AI Labs Index rows fails.
 *  - A registry_id collision fails.
 *  - A legitimate status transition passes.
 * Plus supporting edge cases (hand-assigned registry_id mismatch, append-
 * only deletion, test_dates shrinkage).
 *
 * Exit code 0 = all tests pass, 1 = one or more failures.
 */

import { validateRegistryState, validateRegistryTransition, computeRegistryId } from "./lib/model-registry-validator.mjs";

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

// ── Fixture builders ──────────────────────────────────────────────────────

function validEntry(overrides = {}) {
  const base = {
    developer: "Test Labs",
    family: "Testalon",
    exact_snapshot: "2026-01-01-checkpoint",
    aliases: [],
    endpoint: "https://api.testlabs.example/v1/testalon",
    product_surface: "api_default",
    access_tier: "tier-1",
    region: "us",
    system_prompt_status: "known",
    moderation_layer: "present",
    tools: [],
    sampling: { temperature: 0, top_p: 1, seed: null, max_tokens: 4096, context_limit: 128000 },
    first_seen: "2026-01-01",
    test_dates: ["2026-01-02"],
    lineage: { predecessor: null, materiality_basis: "first registration of this snapshot" },
    evidence: [
      {
        source_url: "https://testlabs.example/announcements/testalon",
        title: "Introducing Testalon",
        publisher: "Test Labs",
        published_at: "2026-01-01T00:00:00Z",
        retrieved_at: "2026-01-02T00:00:00Z",
        archive_or_hash: "sha256:deadbeefcafef00d",
        claim_supported: "existence and endpoint",
      },
    ],
    claim_class: "fact",
    status: "candidate",
    superseded_by: null,
    ...overrides,
  };
  base.registry_id = overrides.registry_id ?? computeRegistryId(base);
  return base;
}

function registryOf(...entries) {
  return { meta: { schemaVersion: "1.0" }, entries };
}

const LABS_SINGLE_MATCH = [{ name: "Test Labs" }, { name: "Some Other Org" }];
// "Test Labs Holdings" normalizes (via product-separation's LEGAL_SUFFIX_RE,
// which strips a trailing "Holdings") to the same canonical string as
// "Test Labs" — a deliberate two-row collision for the join-cardinality test.
const LABS_DOUBLE_MATCH = [{ name: "Test Labs" }, { name: "Test Labs Holdings" }];

// ── Test 1: empty registry passes cleanly ─────────────────────────────────

console.log("Test 1: empty registry passes cleanly, reporting zero entries");
{
  const result = validateRegistryState(registryOf(), { labsRankings: LABS_SINGLE_MATCH });
  assert("empty registry: zero failures", result.failures.length === 0);
  assert("empty registry: entryCount is 0", result.entryCount === 0);
}

console.log("\nTest 1b: registry with entries: [] (explicit empty array) also passes");
{
  const result = validateRegistryState({ meta: { schemaVersion: "1.0" }, entries: [] }, { labsRankings: LABS_SINGLE_MATCH });
  assert("explicit empty entries: zero failures", result.failures.length === 0);
  assert("explicit empty entries: entryCount is 0", result.entryCount === 0);
}

// ── Test 2: a valid entry passes ──────────────────────────────────────────

console.log("\nTest 2: a single valid, well-formed entry passes with zero failures");
{
  const result = validateRegistryState(registryOf(validEntry()), { labsRankings: LABS_SINGLE_MATCH });
  assert("valid entry: zero failures", result.failures.length === 0);
  assert("valid entry: entryCount is 1", result.entryCount === 1);
}

// ── Test 3: attempted identity overwrite (edited in place) fails ─────────

console.log("\nTest 3: attempted identity overwrite — endpoint edited in place on an existing registry_id — fails");
{
  const prior = registryOf(validEntry());
  const next = registryOf(validEntry({ endpoint: "https://api.testlabs.example/v2/testalon" }));
  const result = validateRegistryTransition(prior, next);
  assert("identity overwrite: has failures", result.failures.length > 0);
  assertIncludesMatch("identity overwrite: failure names 'Attempted overwrite'", result.failures, "Attempted overwrite of registry_id");
  assertIncludesMatch("identity overwrite: failure names the frozen field that changed", result.failures, "endpoint");
}

// ── Test 4: reused model name, new behaviour evidence, edited in place fails ──

console.log("\nTest 4: reused model name with new behaviour evidence — same registry_id, evidence changed in place — fails");
{
  const prior = registryOf(validEntry());
  const next = registryOf(
    validEntry({
      evidence: [
        {
          source_url: "https://testlabs.example/incidents/testalon-drift",
          title: "Testalon behavior change observed",
          publisher: "Test Labs",
          published_at: "2026-02-01T00:00:00Z",
          retrieved_at: "2026-02-02T00:00:00Z",
          archive_or_hash: "sha256:0000000000newhash",
          claim_supported: "materially different refusal behavior under the same exact_snapshot label",
        },
      ],
    })
  );
  const result = validateRegistryTransition(prior, next);
  assert("reused name, evidence edited in place: has failures", result.failures.length > 0);
  assertIncludesMatch("reused name, evidence edited in place: failure names both entries", result.failures, prior.entries[0].registry_id);
  assertIncludesMatch("reused name, evidence edited in place: failure recommends a new dated snapshot", result.failures, "create a NEW entry with a distinguishing exact_snapshot");
  assertIncludesMatch("reused name, evidence edited in place: failure names the frozen field", result.failures, "evidence");
}

console.log("\nTest 4b: the CORRECT fix — a new dated snapshot entry instead of an edit — passes as a transition");
{
  const prior = registryOf(validEntry());
  const priorId = prior.entries[0].registry_id;
  const newSnapshot = validEntry({
    exact_snapshot: "2026-02-01-checkpoint",
    lineage: { predecessor: priorId, materiality_basis: "credible regression evidence of a refusal-behavior change" },
    evidence: [
      {
        source_url: "https://testlabs.example/incidents/testalon-drift",
        title: "Testalon behavior change observed",
        publisher: "Test Labs",
        published_at: "2026-02-01T00:00:00Z",
        retrieved_at: "2026-02-02T00:00:00Z",
        archive_or_hash: "sha256:0000000000newhash",
        claim_supported: "materially different refusal behavior",
      },
    ],
  });
  const next = registryOf(prior.entries[0], newSnapshot);
  const transitionResult = validateRegistryTransition(prior, next);
  assert("new dated snapshot transition: zero failures", transitionResult.failures.length === 0);
  const stateResult = validateRegistryState(next, { labsRankings: LABS_SINGLE_MATCH });
  assert("new dated snapshot state: zero failures", stateResult.failures.length === 0);
  assert("new dated snapshot state: entryCount is 2", stateResult.entryCount === 2);
}

// ── Test 5: missing content hash fails ────────────────────────────────────

console.log("\nTest 5: an entry whose evidence is missing archive_or_hash (content hash) fails");
{
  const entry = validEntry();
  entry.evidence = [{ ...entry.evidence[0], archive_or_hash: "" }];
  const result = validateRegistryState(registryOf(entry), { labsRankings: LABS_SINGLE_MATCH });
  assert("missing content hash: has failures", result.failures.length > 0);
  assertIncludesMatch("missing content hash: failure names the field", result.failures, "archive_or_hash (content hash)");
}

console.log("\nTest 5b: an entry with NO evidence at all fails (no provenance is invalid)");
{
  const entry = validEntry({ evidence: [] });
  const result = validateRegistryState(registryOf(entry), { labsRankings: LABS_SINGLE_MATCH });
  assert("no evidence: has failures", result.failures.length > 0);
  assertIncludesMatch("no evidence: failure names it", result.failures, "evidence[] must be a non-empty array");
}

// ── Test 6: developer matching two AI Labs Index rows fails ──────────────

console.log("\nTest 6: developer resolving to two AI Labs Index rows fails");
{
  const entry = validEntry();
  const result = validateRegistryState(registryOf(entry), { labsRankings: LABS_DOUBLE_MATCH });
  assert("developer -> two labs rows: has failures", result.failures.length > 0);
  assertIncludesMatch("developer -> two labs rows: failure names cardinality", result.failures, "resolves to 2 AI Labs Index rows");
}

console.log("\nTest 6b: developer resolving to zero AI Labs Index rows is fine (0 or 1 is valid, only >1 fails)");
{
  const entry = validEntry({ developer: "Nobody Has Heard Of This Lab" });
  const result = validateRegistryState(registryOf(entry), { labsRankings: LABS_SINGLE_MATCH });
  assert("developer -> zero labs rows: zero failures", result.failures.length === 0);
}

// ── Test 7: registry_id collision fails ───────────────────────────────────

console.log("\nTest 7: registry_id collision — two entries sharing (developer, family, exact_snapshot) — fails");
{
  const entryA = validEntry({ region: "us" });
  const entryB = validEntry({ region: "eu" }); // identical identity, different non-identity field
  const result = validateRegistryState(registryOf(entryA, entryB), { labsRankings: LABS_SINGLE_MATCH });
  assert("registry_id collision: has failures", result.failures.length > 0);
  assertIncludesMatch("registry_id collision: failure names both entries", result.failures, "registry_id collision");
  assertIncludesMatch("registry_id collision: failure names the shared id", result.failures, entryA.registry_id);
}

console.log("\nTest 7b: a hand-assigned registry_id that does not match its own derivation fails");
{
  const entry = validEntry({ registry_id: "hand-picked-id-not-derived" });
  const result = validateRegistryState(registryOf(entry), { labsRankings: LABS_SINGLE_MATCH });
  assert("hand-assigned registry_id: has failures", result.failures.length > 0);
  assertIncludesMatch("hand-assigned registry_id: failure explains derivation", result.failures, "does not match the deterministic derivation");
}

// ── Test 8: a legitimate status transition passes ─────────────────────────

console.log("\nTest 8: a legitimate status transition (candidate -> active, superseded_by set) passes");
{
  const prior = registryOf(validEntry({ status: "candidate", superseded_by: null }));
  const next = registryOf(validEntry({ status: "active", superseded_by: null }));
  const result = validateRegistryTransition(prior, next);
  assert("status transition: zero failures", result.failures.length === 0);
}

console.log("\nTest 8b: test_dates may grow across a transition");
{
  const prior = registryOf(validEntry({ test_dates: ["2026-01-02"] }));
  const next = registryOf(validEntry({ test_dates: ["2026-01-02", "2026-03-01"] }));
  const result = validateRegistryTransition(prior, next);
  assert("test_dates growth: zero failures", result.failures.length === 0);
}

console.log("\nTest 8c: test_dates may NOT shrink or lose an existing date across a transition");
{
  const prior = registryOf(validEntry({ test_dates: ["2026-01-02", "2026-03-01"] }));
  const next = registryOf(validEntry({ test_dates: ["2026-03-01"] })); // lost 2026-01-02
  const result = validateRegistryTransition(prior, next);
  assert("test_dates shrinkage: has failures", result.failures.length > 0);
  assertIncludesMatch("test_dates shrinkage: failure names it", result.failures, "test_dates may only grow");
}

// ── Test 9: append-only — an existing entry may never be removed ─────────

console.log("\nTest 9: removing an existing entry across a transition fails (append-only)");
{
  const prior = registryOf(validEntry({ developer: "Test Labs", family: "Testalon" }), validEntry({ developer: "Other Labs", family: "Othermodel" }));
  const next = registryOf(prior.entries[0]); // second entry silently dropped
  const result = validateRegistryTransition(prior, next);
  assert("entry removal: has failures", result.failures.length > 0);
  assertIncludesMatch("entry removal: failure names it", result.failures, "Append-only violation");
}

// ── Test 10: enum and required-field validation ───────────────────────────

console.log("\nTest 10: invalid product_surface fails");
{
  const entry = validEntry({ product_surface: "nonsense" });
  const result = validateRegistryState(registryOf(entry), { labsRankings: LABS_SINGLE_MATCH });
  assert("invalid product_surface: has failures", result.failures.length > 0);
  assertIncludesMatch("invalid product_surface: failure names it", result.failures, "product_surface");
}

console.log("\nTest 10b: status='active' with claim_class='inference' fails (invariant 5)");
{
  const entry = validEntry({ status: "active", claim_class: "inference" });
  const result = validateRegistryState(registryOf(entry), { labsRankings: LABS_SINGLE_MATCH });
  assert("active + inference: has failures", result.failures.length > 0);
  assertIncludesMatch("active + inference: failure names invariant 5", result.failures, "may never be the identity of record");
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
