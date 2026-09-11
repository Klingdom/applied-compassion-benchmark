#!/usr/bin/env node

/**
 * test-model-releases.mjs — Fixture-based tests for
 * scripts/lib/model-releases-validator.mjs.
 *
 * Style mirrors test-model-registry.mjs / test-product-separation.mjs: build
 * small synthetic fixtures, run them through the SAME validation functions
 * validate-model-releases.mjs uses in production, and assert on the returned
 * failures/warnings arrays.
 *
 * A fixed `now` is passed to every call so results are deterministic
 * regardless of the wall-clock date the suite is run on.
 *
 * Covers, at minimum, the pinned cases from the implementation brief:
 *  - empty store + valid meta → PASS
 *  - release missing evidence → FAIL
 *  - release with an undated evidence source → FAIL
 *  - detected_in_scan referencing a non-existent scan → FAIL
 *  - configuration_change carrying a registry_id → FAIL
 *  - stale coverageThrough (meta.scanState "stale") → WARNS, zero failures
 *    (the condition that makes the CLI exit 0)
 *  - release_id not matching its derivation → FAIL
 * Plus supporting coverage of product_scope derivation, id_resolution,
 * registry FK, disposition completeness, confirmation_status, evidence
 * format, and the append-only transition validator.
 *
 * Exit code 0 = all tests pass, 1 = one or more failures.
 */

import {
  validateReleaseStore,
  validateReleaseTransition,
  validateScanRecords,
  computeReleaseId,
  deriveProductScope,
  deriveScanState,
} from "./lib/model-releases-validator.mjs";

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

const NOW = new Date("2026-09-10T12:00:00Z");

// ── Fixture builders ──────────────────────────────────────────────────────

function validRelease(overrides = {}) {
  const base = {
    developer: "Test Labs",
    family: "Testalon",
    snapshot_label: "Testalon 2",
    snapshot_precision: "exact",
    announced_date: "2026-09-01",
    classification: "new_model",
    product_scope: "model-index",
    materiality_basis: "first public release of this snapshot",
    tracked_since: "2026-09-02",
    detected_in_scan: "scan-2026-09-01-001",
    detection_method: "search",
    evidence: [
      {
        source_url: "https://testlabs.example/announcements/testalon-2",
        publisher: "Test Labs",
        published_at: "2026-09-01T00:00:00Z",
        retrieved_at: "2026-09-01T02:00:00Z",
        archive_or_hash: "sha256:" + "a".repeat(64),
      },
    ],
    confirmation_status: "confirmed",
    lifecycle: "detected",
    registry_id: null,
    id_resolution: null,
    predecessor_release_id: null,
    superseded_by: null,
    evaluation_disposition: "not-triaged",
    disposition_reason: null,
    disposition_ref: null,
    disposition_set_at: null,
    ...overrides,
  };
  base.release_id = overrides.release_id ?? computeReleaseId(base);
  return base;
}

function validMeta(overrides = {}) {
  return {
    schemaVersion: "1.0",
    storeVersion: "v1",
    releaseCount: 0,
    createdDate: "2026-09-10",
    status: "empty",
    lastScanId: null,
    lastScanCompletedAt: null,
    coverageThrough: null,
    scanState: "never-scanned",
    staleAfterDays: 14,
    coverageClaim: "none",
    ...overrides,
  };
}

function storeOf(metaOverrides, ...releases) {
  return { meta: validMeta({ releaseCount: releases.length, ...metaOverrides }), releases };
}

const VALID_SCAN_RECORD = {
  scan_id: "scan-2026-09-01-001",
  status: "completed",
  started_at: "2026-09-01T09:00:00Z",
  ended_at: "2026-09-01T09:41:00Z",
  promoted_release_ids: ["test-labs--testalon--testalon-2"],
};

// ── Test 1: empty store + valid meta passes cleanly ───────────────────────

console.log("Test 1: empty store + fully populated meta → PASS");
{
  const store = storeOf({});
  const result = validateReleaseStore(store, { now: NOW });
  assert("empty store: zero failures", result.failures.length === 0);
  assert("empty store: releaseCount is 0", result.releaseCount === 0);
}

console.log("\nTest 1b: empty store passes even when scanRecords/registry are explicitly supplied as empty");
{
  const store = storeOf({});
  const result = validateReleaseStore(store, { now: NOW, scanRecords: [], registry: { entries: [] } });
  assert("empty store with explicit empty FK inputs: zero failures", result.failures.length === 0);
}

console.log("\nTest 1c: a store missing a scan-state meta field fails (C1 — must say 'we have not looked' as data)");
{
  const meta = validMeta({});
  delete meta.scanState;
  const result = validateReleaseStore({ meta, releases: [] }, { now: NOW });
  assert("missing meta.scanState: has failures", result.failures.length > 0);
  assertIncludesMatch("missing meta.scanState: failure names it", result.failures, "meta.scanState is required");
}

// ── Test 2: a valid, well-formed release passes ───────────────────────────

console.log("\nTest 2: a single valid release (exact snapshot, registry_id null) passes with zero failures");
{
  const store = storeOf({ scanState: "never-scanned" }, validRelease());
  const result = validateReleaseStore(store, { now: NOW });
  assert("valid release: zero failures", result.failures.length === 0);
  assert("valid release: releaseCount is 1", result.releaseCount === 1);
}

// ── Test 3: release missing evidence fails ────────────────────────────────

console.log("\nTest 3: a release with NO evidence at all fails (no provenance is invalid)");
{
  const release = validRelease({ evidence: [] });
  const store = storeOf({}, release);
  const result = validateReleaseStore(store, { now: NOW });
  assert("no evidence: has failures", result.failures.length > 0);
  assertIncludesMatch("no evidence: failure names it", result.failures, "evidence[] must be a non-empty array");
}

// ── Test 3b: release with an undated evidence source fails ───────────────

console.log("\nTest 3b: a release whose evidence source has no published_at (undated) fails");
{
  const release = validRelease();
  release.evidence = [{ ...release.evidence[0], published_at: "" }];
  const store = storeOf({}, release);
  const result = validateReleaseStore(store, { now: NOW });
  assert("undated evidence: has failures", result.failures.length > 0);
  assertIncludesMatch("undated evidence: failure names the field", result.failures, 'missing required field "published_at"');
}

console.log("\nTest 3c: a release whose evidence archive_or_hash matches neither sha256 nor a recognised archive URL fails");
{
  const release = validRelease();
  release.evidence = [{ ...release.evidence[0], archive_or_hash: "trust-me" }];
  const store = storeOf({}, release);
  const result = validateReleaseStore(store, { now: NOW });
  assert("bad archive_or_hash: has failures", result.failures.length > 0);
  assertIncludesMatch("bad archive_or_hash: failure names it", result.failures, "archive_or_hash");
}

console.log("\nTest 3d: a release whose evidence retrieved_at is in the future fails");
{
  const release = validRelease();
  release.evidence = [{ ...release.evidence[0], retrieved_at: "2099-01-01T00:00:00Z" }];
  const store = storeOf({}, release);
  const result = validateReleaseStore(store, { now: NOW });
  assert("future retrieved_at: has failures", result.failures.length > 0);
  assertIncludesMatch("future retrieved_at: failure names it", result.failures, "is in the future");
}

// ── Test 4: detected_in_scan referencing a non-existent scan fails ───────

console.log("\nTest 4: detected_in_scan referencing a non-existent scan fails (when scan records ARE supplied)");
{
  const release = validRelease({ detected_in_scan: "scan-does-not-exist" });
  const store = storeOf({}, release);
  const result = validateReleaseStore(store, { now: NOW, scanRecords: [VALID_SCAN_RECORD] });
  assert("unresolved detected_in_scan: has failures", result.failures.length > 0);
  assertIncludesMatch("unresolved detected_in_scan: failure names it", result.failures, "does not resolve to any scan record");
}

console.log("\nTest 4b: detected_in_scan resolving to a real scan record that does NOT list this release fails (bidirectional FK)");
{
  const release = validRelease();
  const scanWithoutPromotion = { ...VALID_SCAN_RECORD, promoted_release_ids: [] };
  const store = storeOf({}, release);
  const result = validateReleaseStore(store, { now: NOW, scanRecords: [scanWithoutPromotion] });
  assert("non-bidirectional FK: has failures", result.failures.length > 0);
  assertIncludesMatch("non-bidirectional FK: failure names it", result.failures, "does not list this release_id in its promoted_release_ids");
}

console.log("\nTest 4c: detected_in_scan resolving correctly and bidirectionally passes");
{
  const release = validRelease();
  // A completed scan on 2026-09-01 within staleAfterDays of NOW (2026-09-10)
  // derives scanState "current" — declared to match, since K2 also runs
  // whenever scanRecords is supplied.
  const store = storeOf({ scanState: "current", lastScanCompletedAt: "2026-09-01T09:41:00Z" }, release);
  const result = validateReleaseStore(store, { now: NOW, scanRecords: [VALID_SCAN_RECORD] });
  assert("correct bidirectional FK: zero failures", result.failures.length === 0);
}

console.log("\nTest 4d: detected_in_scan check is SKIPPED (not silently passed) when no scan records are supplied at all");
{
  const release = validRelease({ detected_in_scan: "scan-does-not-exist" });
  const store = storeOf({}, release);
  const result = validateReleaseStore(store, { now: NOW }); // no scanRecords opt at all
  assert("no scanRecords supplied: zero failures (check skipped, not passed)", result.failures.length === 0);
  assertIncludesMatch("no scanRecords supplied: a SKIPPED warning is emitted, not silence", result.warnings, "SKIPPED");
}

// ── Test 5: configuration_change carrying a registry_id fails ────────────

console.log("\nTest 5: a configuration_change release carrying a non-null registry_id fails (D-23 three-product boundary)");
{
  const release = validRelease({
    classification: "configuration_change",
    product_scope: "deployed-ai-audit",
    registry_id: "some-lab--some-model--exact",
  });
  const store = storeOf({}, release);
  const result = validateReleaseStore(store, { now: NOW });
  assert("configuration_change + registry_id: has failures", result.failures.length > 0);
  assertIncludesMatch("configuration_change + registry_id: failure names the boundary", result.failures, "may never carry a non-null registry_id");
}

console.log("\nTest 5b: a configuration_change release with registry_id null passes the boundary check");
{
  const release = validRelease({ classification: "configuration_change", product_scope: "deployed-ai-audit" });
  const store = storeOf({}, release);
  const result = validateReleaseStore(store, { now: NOW });
  assert("configuration_change without registry_id: zero failures", result.failures.length === 0);
}

console.log("\nTest 5c: deriveProductScope is a pure function matching the architecture's table");
{
  assert("new_model -> model-index", deriveProductScope("new_model") === "model-index");
  assert("named_update -> model-index", deriveProductScope("named_update") === "model-index");
  assert("silent_snapshot -> model-index", deriveProductScope("silent_snapshot") === "model-index");
  assert("configuration_change -> deployed-ai-audit", deriveProductScope("configuration_change") === "deployed-ai-audit");
  assert("policy_layer_change -> deployed-ai-audit", deriveProductScope("policy_layer_change") === "deployed-ai-audit");
  assert("new_deployment -> deployed-ai-audit", deriveProductScope("new_deployment") === "deployed-ai-audit");
  assert("incident -> incident", deriveProductScope("incident") === "incident");
  assert("non_material -> none", deriveProductScope("non_material") === "none");
}

console.log("\nTest 5d: product_scope authored inconsistently with its classification fails, even without a registry_id");
{
  const release = validRelease({ classification: "new_model", product_scope: "deployed-ai-audit" });
  const store = storeOf({}, release);
  const result = validateReleaseStore(store, { now: NOW });
  assert("mismatched product_scope: has failures", result.failures.length > 0);
  assertIncludesMatch("mismatched product_scope: failure explains derivation", result.failures, "does not match its derivation");
}

// ── Test 6: stale coverageThrough (scanState "stale") WARNS, never fails ──

console.log('\nTest 6: meta.scanState "stale" produces a warning, never a failure — the condition that makes the CLI exit 0');
{
  const store = storeOf({
    scanState: "stale",
    lastScanCompletedAt: "2026-08-01T00:00:00Z",
    coverageThrough: "2026-08-01",
    staleAfterDays: 14,
  });
  const result = validateReleaseStore(store, { now: NOW, scanRecords: [] });
  assert("stale store: zero failures (would exit 0)", result.failures.length === 0);
  assertIncludesMatch("stale store: a warning names the scanState", result.warnings, 'meta.scanState is "stale"');
}

console.log('\nTest 6b: meta.scanState "degraded" (newest scan aborted) also WARNS, never fails');
{
  const abortedScan = { scan_id: "scan-2026-09-05-001", status: "aborted", started_at: "2026-09-05T09:00:00Z", ended_at: "2026-09-05T09:05:00Z", abort_reason: "WebSearch budget exhausted" };
  const store = storeOf({ scanState: "degraded", lastScanCompletedAt: "2026-08-01T00:00:00Z" });
  const result = validateReleaseStore(store, { now: NOW, scanRecords: [abortedScan] });
  assert("degraded store: zero failures", result.failures.length === 0);
  assertIncludesMatch("degraded store: a warning names the scanState", result.warnings, 'meta.scanState is "degraded"');
}

console.log('\nTest 6c: meta.scanState "never-scanned" (the store\'s actual shipped state) WARNS, never fails');
{
  const store = storeOf({ scanState: "never-scanned" });
  const result = validateReleaseStore(store, { now: NOW, scanRecords: [] });
  assert("never-scanned store: zero failures", result.failures.length === 0);
  assertIncludesMatch("never-scanned store: a warning names the scanState", result.warnings, 'meta.scanState is "never-scanned"');
}

console.log("\nTest 6d: a hand-authored scanState that does not match its derivation from the scan records fails");
{
  const store = storeOf({ scanState: "current" }); // no completed scans anywhere -> derivation is never-scanned
  const result = validateReleaseStore(store, { now: NOW, scanRecords: [] });
  assert("mismatched scanState: has failures", result.failures.length > 0);
  assertIncludesMatch("mismatched scanState: failure explains derivation", result.failures, "does not match its derivation");
}

console.log("\nTest 6e: deriveScanState matches the architecture's derivation table directly");
{
  assert('no completed scans, no lastScanCompletedAt -> "never-scanned"', deriveScanState(validMeta({ scanState: "never-scanned" }), [], NOW) === "never-scanned");
  const recent = validMeta({ lastScanCompletedAt: "2026-09-09T00:00:00Z", staleAfterDays: 14 });
  assert('recent completed scan within staleAfterDays -> "current"', deriveScanState(recent, [{ scan_id: "s1", status: "completed", ended_at: "2026-09-09T00:00:00Z" }], NOW) === "current");
  const old = validMeta({ lastScanCompletedAt: "2026-08-01T00:00:00Z", staleAfterDays: 14 });
  assert('old completed scan beyond staleAfterDays -> "stale"', deriveScanState(old, [{ scan_id: "s1", status: "completed", ended_at: "2026-08-01T00:00:00Z" }], NOW) === "stale");
}

// ── Test 7: release_id not matching its derivation fails ─────────────────

console.log("\nTest 7: a hand-assigned release_id that does not match its own derivation fails");
{
  const release = validRelease({ release_id: "hand-picked-id-not-derived" });
  const store = storeOf({}, release);
  const result = validateReleaseStore(store, { now: NOW });
  assert("hand-assigned release_id: has failures", result.failures.length > 0);
  assertIncludesMatch("hand-assigned release_id: failure explains derivation", result.failures, "does not match the deterministic derivation");
}

console.log("\nTest 7b: two releases colliding on release_id fail (same developer/family/snapshot_key)");
{
  const releaseA = validRelease({ detected_in_scan: "scan-a" });
  const releaseB = validRelease({ detected_in_scan: "scan-b" }); // identical identity fields -> identical release_id
  const store = storeOf({}, releaseA, releaseB);
  const result = validateReleaseStore(store, { now: NOW });
  assert("release_id collision: has failures", result.failures.length > 0);
  assertIncludesMatch("release_id collision: failure names it", result.failures, "release_id collision");
}

console.log("\nTest 7c: release_id === registry_id by construction is required when snapshot_precision is exact");
{
  const release = validRelease({ snapshot_precision: "exact", registry_id: "some-other-id" });
  const store = storeOf({}, release);
  const result = validateReleaseStore(store, { now: NOW });
  assert("exact precision, mismatched registry_id: has failures", result.failures.length > 0);
  assertIncludesMatch("exact precision, mismatched registry_id: failure explains the identity rule", result.failures, "registry_id must equal release_id");
}

console.log("\nTest 7d: release_id === registry_id (exact precision) passes");
{
  const release = validRelease({ snapshot_precision: "exact" });
  release.registry_id = release.release_id;
  const store = storeOf({}, release);
  const result = validateReleaseStore(store, { now: NOW });
  assert("exact precision, matching registry_id: zero failures", result.failures.length === 0);
}

// ── Supporting: id_resolution required when precision is imprecise and registry_id differs ──

console.log("\nTest 8: date_qualified snapshot with a differing registry_id requires a complete id_resolution");
{
  const release = validRelease({
    snapshot_label: "Claude 4.7",
    snapshot_precision: "date_qualified",
    registry_id: "anthropic--claude--2026-09-05-checkpoint",
    id_resolution: null,
  });
  const store = storeOf({}, release);
  const result = validateReleaseStore(store, { now: NOW });
  assert("missing id_resolution: has failures", result.failures.length > 0);
  assertIncludesMatch("missing id_resolution: failure names it", result.failures, "requires a complete id_resolution");
}

console.log("\nTest 8b: the same case WITH a complete id_resolution passes that check");
{
  const release = validRelease({
    snapshot_label: "Claude 4.7",
    snapshot_precision: "date_qualified",
    registry_id: "anthropic--claude--2026-09-05-checkpoint",
    id_resolution: { resolved_at: "2026-09-10", resolved_snapshot_label: "claude-4-7-20260905", note: "matched via provider changelog" },
  });
  const store = storeOf({}, release);
  const result = validateReleaseStore(store, { now: NOW });
  assert("complete id_resolution: zero failures", result.failures.length === 0);
}

// ── Supporting: registry_id FK ────────────────────────────────────────────

console.log("\nTest 9: a registry_id that does not exist in registry-v1.json fails when a registry is supplied");
{
  const release = validRelease({ snapshot_precision: "exact" });
  release.registry_id = release.release_id;
  const store = storeOf({}, release);
  const result = validateReleaseStore(store, { now: NOW, registry: { entries: [] } });
  assert("registry_id not in registry: has failures", result.failures.length > 0);
  assertIncludesMatch("registry_id not in registry: failure names it", result.failures, "does not exist in registry-v1.json");
}

console.log("\nTest 9b: a registry_id that DOES exist in registry-v1.json passes the FK check");
{
  const release = validRelease({ snapshot_precision: "exact" });
  release.registry_id = release.release_id;
  const store = storeOf({}, release);
  const result = validateReleaseStore(store, { now: NOW, registry: { entries: [{ registry_id: release.release_id }] } });
  assert("registry_id in registry: zero failures", result.failures.length === 0);
}

console.log("\nTest 9c: an orphan registry entry (no corresponding release row) WARNS, never fails (INV-2)");
{
  const store = storeOf({}); // no releases
  const result = validateReleaseStore(store, { now: NOW, registry: { entries: [{ registry_id: "some-lab--some-model--exact" }] } });
  assert("orphan registry entry: zero failures", result.failures.length === 0);
  assertIncludesMatch("orphan registry entry: warning names it", result.warnings, "orphan registration");
}

// ── Supporting: disposition completeness ──────────────────────────────────

console.log("\nTest 10: evaluation_disposition other than not-triaged requires disposition_reason AND disposition_ref");
{
  const release = validRelease({ evaluation_disposition: "blocked", disposition_reason: null, disposition_ref: null });
  const store = storeOf({}, release);
  const result = validateReleaseStore(store, { now: NOW });
  assert("blocked without reason/ref: has failures", result.failures.length >= 2);
  assertIncludesMatch("blocked without reason: failure names it", result.failures, "requires a non-empty disposition_reason");
  assertIncludesMatch("blocked without ref: failure names it", result.failures, "requires a non-empty disposition_ref");
}

console.log("\nTest 10b: a complete disposition (reason + ref) passes");
{
  const release = validRelease({ evaluation_disposition: "blocked", disposition_reason: "No model API credential and no approved spend ceiling.", disposition_ref: "BLK-002" });
  const store = storeOf({}, release);
  const result = validateReleaseStore(store, { now: NOW });
  assert("complete disposition: zero failures", result.failures.length === 0);
}

// ── Supporting: confirmation_status ────────────────────────────────────────

console.log("\nTest 11: confirmation_status other than 'confirmed' fails — rumours never appear in this store");
{
  const release = validRelease({ confirmation_status: "rumour" });
  const store = storeOf({}, release);
  const result = validateReleaseStore(store, { now: NOW });
  assert("confirmation_status rumour: has failures", result.failures.length > 0);
  assertIncludesMatch("confirmation_status rumour: failure explains the rule", result.failures, 'only "confirmed" may appear');
}

// ── Supporting: date sanity (K13) ─────────────────────────────────────────

console.log("\nTest 12: tracked_since before announced_date fails (CB cannot track before the world announces)");
{
  const release = validRelease({ announced_date: "2026-09-05", tracked_since: "2026-09-01" });
  const store = storeOf({}, release);
  const result = validateReleaseStore(store, { now: NOW });
  assert("tracked_since before announced_date: has failures", result.failures.length > 0);
  assertIncludesMatch("tracked_since before announced_date: failure names it", result.failures, "is before announced_date");
}

console.log("\nTest 12b: announced_date in the future fails");
{
  const release = validRelease({ announced_date: "2099-01-01", tracked_since: "2099-01-02" });
  const store = storeOf({}, release);
  const result = validateReleaseStore(store, { now: NOW });
  assert("future announced_date: has failures", result.failures.length > 0);
  assertIncludesMatch("future announced_date: failure names it", result.failures, "is in the future");
}

// ── Supporting: validateScanRecords (K16) ─────────────────────────────────

console.log("\nTest 13: validateScanRecords — an exhausted budget without status 'aborted' fails");
{
  const result = validateScanRecords([{ scan_id: "s1", status: "completed", budget: { exhausted: true } }]);
  assert("exhausted budget, status completed: has failures", result.failures.length > 0);
  assertIncludesMatch("exhausted budget: failure names the rule", result.failures, 'must produce status "aborted"');
}

console.log("\nTest 13b: validateScanRecords — status 'aborted' without abort_reason fails");
{
  const result = validateScanRecords([{ scan_id: "s1", status: "aborted" }]);
  assert("aborted without reason: has failures", result.failures.length > 0);
  assertIncludesMatch("aborted without reason: failure names it", result.failures, "requires a non-empty abort_reason");
}

console.log("\nTest 13c: validateScanRecords — status 'not-run' without blocked_by fails");
{
  const result = validateScanRecords([{ scan_id: "s1", status: "not-run" }]);
  assert("not-run without blocked_by: has failures", result.failures.length > 0);
  assertIncludesMatch("not-run without blocked_by: failure names it", result.failures, "requires a non-empty blocked_by");
}

console.log("\nTest 13d: validateScanRecords — a well-formed completed scan passes");
{
  const result = validateScanRecords([VALID_SCAN_RECORD]);
  assert("well-formed completed scan: zero failures", result.failures.length === 0);
}

// ── Supporting: enum validation ───────────────────────────────────────────

console.log("\nTest 14: an invalid classification fails");
{
  const release = validRelease({ classification: "nonsense" });
  const store = storeOf({}, release);
  const result = validateReleaseStore(store, { now: NOW });
  assert("invalid classification: has failures", result.failures.length > 0);
  assertIncludesMatch("invalid classification: failure names it", result.failures, "classification");
}

console.log("\nTest 14b: an invalid snapshot_precision fails");
{
  const release = validRelease({ snapshot_precision: "sort-of-exact" });
  const store = storeOf({}, release);
  const result = validateReleaseStore(store, { now: NOW });
  assert("invalid snapshot_precision: has failures", result.failures.length > 0);
  assertIncludesMatch("invalid snapshot_precision: failure names it", result.failures, "snapshot_precision");
}

// ── Transition validator (INV-3) ──────────────────────────────────────────

console.log("\nTest 15: attempted overwrite of a frozen field on an existing release_id fails");
{
  const release = validRelease();
  const prior = storeOf({}, release);
  const editedInPlace = validRelease({ ...release, snapshot_label: "Testalon 2 (renamed)", release_id: release.release_id });
  const next = storeOf({}, editedInPlace);
  const result = validateReleaseTransition(prior, next);
  assert("frozen field edit: has failures", result.failures.length > 0);
  assertIncludesMatch("frozen field edit: failure names 'Attempted overwrite'", result.failures, "Attempted overwrite of release_id");
}

console.log("\nTest 15b: removing an existing release across a transition fails (append-only)");
{
  const releaseA = validRelease({ developer: "Test Labs", family: "Testalon" });
  const releaseB = validRelease({ developer: "Other Labs", family: "Othermodel", detected_in_scan: "scan-2026-09-02-001" });
  const prior = storeOf({}, releaseA, releaseB);
  const next = storeOf({}, releaseA); // releaseB silently dropped
  const result = validateReleaseTransition(prior, next);
  assert("release removal: has failures", result.failures.length > 0);
  assertIncludesMatch("release removal: failure names it", result.failures, "Append-only violation");
}

console.log("\nTest 15c: removing or altering a previously recorded evidence element fails (evidence is append-only per element)");
{
  const release = validRelease();
  const prior = storeOf({}, release);
  const withoutOriginalEvidence = validRelease({ ...release, release_id: release.release_id, evidence: [{ ...release.evidence[0], retrieved_at: "2026-09-03T00:00:00Z" }] });
  const next = storeOf({}, withoutOriginalEvidence);
  const result = validateReleaseTransition(prior, next);
  assert("evidence altered: has failures", result.failures.length > 0);
  assertIncludesMatch("evidence altered: failure names it", result.failures, "evidence[] lost or altered");
}

console.log("\nTest 15d: adding a NEW evidence element (growth) passes");
{
  const release = validRelease();
  const prior = storeOf({}, release);
  const grown = validRelease({ ...release, release_id: release.release_id, evidence: [...release.evidence, { source_url: "https://second-source.example/confirm", publisher: "Second Source", published_at: "2026-09-03T00:00:00Z", retrieved_at: "2026-09-03T02:00:00Z", archive_or_hash: "sha256:" + "b".repeat(64) }] });
  const next = storeOf({}, grown);
  const result = validateReleaseTransition(prior, next);
  assert("evidence growth: zero failures", result.failures.length === 0);
}

console.log("\nTest 15e: confirmation_status reverting from 'confirmed' fails");
{
  const release = validRelease({ confirmation_status: "confirmed" });
  const prior = storeOf({}, release);
  const reverted = validRelease({ ...release, release_id: release.release_id, confirmation_status: "unconfirmed" });
  const next = storeOf({}, reverted);
  const result = validateReleaseTransition(prior, next);
  assert("confirmation_status reversion: has failures", result.failures.length > 0);
  assertIncludesMatch("confirmation_status reversion: failure names it", result.failures, "confirmed may never revert");
}

console.log("\nTest 15f: a legitimate lifecycle/disposition mutation (mutable fields only) passes");
{
  const release = validRelease({ lifecycle: "detected", evaluation_disposition: "not-triaged" });
  const prior = storeOf({}, release);
  const mutated = validRelease({ ...release, release_id: release.release_id, lifecycle: "confirmed", evaluation_disposition: "blocked", disposition_reason: "No credential.", disposition_ref: "BLK-002" });
  const next = storeOf({}, mutated);
  const result = validateReleaseTransition(prior, next);
  assert("lifecycle/disposition mutation: zero failures", result.failures.length === 0);
}

console.log("\nTest 15g: adding a brand-new release alongside an unchanged existing one passes");
{
  const release = validRelease();
  const prior = storeOf({}, release);
  const newRelease = validRelease({ developer: "Second Labs", family: "Secondalon", detected_in_scan: "scan-2026-09-03-001" });
  const next = storeOf({}, release, newRelease);
  const result = validateReleaseTransition(prior, next);
  assert("new release added: zero failures", result.failures.length === 0);
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
