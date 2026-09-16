#!/usr/bin/env node
/**
 * test-release-watch-l1.mjs — unit tests for release-watch-l1.mjs's pure
 * scan-record-building logic.
 *
 * NO NETWORK ACCESS ANYWHERE IN THIS FILE. Every case that would otherwise
 * fetch injects a fake `fetchImpl` (or omits it, for the dry-run/zero-source
 * paths that must never call it at all). This file also never touches
 * research/model-index/release-watch/ on disk — it calls runL1Scan()
 * directly against in-memory fixtures, the same function the CLI's main()
 * calls before it writes anything.
 *
 * Per rule V8, includes a positive control proving the "zero sources"
 * default path produces a `not-run` record rather than a false `completed`.
 *
 * Run: node research/scripts/test-release-watch-l1.mjs
 */

import { runL1Scan, computeScanId, hashBytes, retrieveSource } from "./release-watch-l1.mjs";

let passed = 0;
let failed = 0;

function assert(cond, message) {
  if (cond) {
    passed++;
  } else {
    failed++;
    console.error(`  FAIL: ${message}`);
  }
}

function throwingFetch() {
  throw new Error("test error: fetchImpl was called but no network access is permitted in this test file");
}

const NOW = new Date("2026-09-16T12:00:00Z");

// ── Test 1: zero sources → "not-run", never a false "completed" (V8 positive control) ──

console.log("Test 1: zero declared sources (today's actual registry state) → status not-run");
{
  const registry = { meta: { quorumRequired: null }, sources: [] };
  const record = await runL1Scan(registry, { now: NOW, live: false });
  assert(record.status === "not-run", `expected status "not-run", got "${record.status}"`);
  assert(typeof record.blocked_by === "string" && record.blocked_by.length > 0, "blocked_by must be a non-empty string naming the reason");
  assert(record.blocked_by.includes("no-sources-registered"), "blocked_by should name the zero-sources condition");
  assert(record.candidates.length === 0, "candidates must be empty — this script never fabricates rows");
  assert(record.promoted_release_ids.length === 0, "promoted_release_ids must be empty — this script never writes a release row");
  assert(record.sources_planned.length === 0, "sources_planned must be empty when the registry is empty");
  assert(record.budget.exhausted === false, "budget.exhausted must be false — L1 makes zero search calls");
}

console.log("\nTest 1b: zero sources + live=true (no fetchImpl needed/called) is still not-run");
{
  const registry = { meta: { quorumRequired: null }, sources: [] };
  const record = await runL1Scan(registry, { now: NOW, live: true, fetchImpl: throwingFetch });
  assert(record.status === "not-run", `expected status "not-run" even with --live when there is nothing to fetch, got "${record.status}"`);
}

// ── Test 2: dry run with sources declared still performs NO network I/O ──

console.log("\nTest 2: sources declared, live=false (default dry-run) → not-run, fetchImpl never invoked");
{
  const registry = {
    meta: { quorumRequired: 1 },
    sources: [{ source_id: "src-test-labs-announcement", provider: "Test Labs", source_type: "announcement", url: "https://testlabs.example/news", tier: "primary" }],
  };
  const record = await runL1Scan(registry, { now: NOW, live: false, fetchImpl: throwingFetch });
  assert(record.status === "not-run", `expected status "not-run" for a dry run, got "${record.status}"`);
  assert(record.blocked_by.includes("dry-run"), "blocked_by should name the dry-run as the reason coverage was not attempted");
  assert(record.sources_planned.length === 1, "sources_planned should still enumerate what WOULD have been fetched");
  assert(record.sources_reached.length === 0, "sources_reached must be empty — nothing was actually fetched");
  // The assertion that matters most: throwingFetch above would have thrown
  // and failed this test immediately if it had been called.
}

// ── Test 3: live=true with a successful fake fetch → completed, hashed evidence ──

console.log("\nTest 3: sources declared, live=true, fake fetch succeeds → completed with a real-shaped hash");
{
  const registry = {
    meta: { quorumRequired: 1 },
    sources: [{ source_id: "src-test-labs-announcement", provider: "Test Labs", source_type: "announcement", url: "https://testlabs.example/news", tier: "primary" }],
  };
  const fakeBytes = new TextEncoder().encode("<html>fake response body, no network involved</html>");
  const fakeFetch = async (url) => {
    assert(url === "https://testlabs.example/news", `fakeFetch called with unexpected url "${url}"`);
    return { ok: true, status: 200, arrayBuffer: async () => fakeBytes.buffer };
  };
  const record = await runL1Scan(registry, { now: NOW, live: true, fetchImpl: fakeFetch });
  assert(record.status === "completed", `expected status "completed", got "${record.status}"`);
  assert(record.sources_reached.length === 1 && record.sources_reached[0] === "src-test-labs-announcement", "sources_reached should list the one reached source");
  assert(record.sources_failed.length === 0, "sources_failed should be empty on full success");
  assert(record.quorum.required === 1 && record.quorum.reached === 1 && record.quorum.met === true, "quorum should reflect 1 required, 1 reached, met=true");
  assert(record.candidates.length === 0, "candidates must still be empty — retrieval is not interpretation");
  assert(record.promoted_release_ids.length === 0, "promoted_release_ids must still be empty — no release row is ever written here");
}

// ── Test 4: live=true with a failing fake fetch → completed but degraded coverage ──

console.log("\nTest 4: sources declared, live=true, fake fetch fails (e.g. http-503) → completed, source recorded as failed, quorum not met");
{
  const registry = {
    meta: { quorumRequired: 1 },
    sources: [{ source_id: "src-second-labs-api-changelog", provider: "Second Labs", source_type: "api_changelog", url: "https://secondlabs.example/changelog", tier: "primary" }],
  };
  const fakeFetch = async () => ({ ok: false, status: 503 });
  const record = await runL1Scan(registry, { now: NOW, live: true, fetchImpl: fakeFetch });
  assert(record.status === "completed", `a per-source failure should not abort the whole scan; expected "completed", got "${record.status}"`);
  assert(record.sources_reached.length === 0, "sources_reached should be empty when the only source failed");
  assert(record.sources_failed.length === 1 && record.sources_failed[0].source_id === "src-second-labs-api-changelog", "sources_failed should name the failed source");
  assert(record.sources_failed[0].reason === "http-503", `expected reason "http-503", got "${record.sources_failed[0].reason}"`);
  assert(record.quorum.met === false, "quorum.met must be false — coverage cannot advance on a failed source");
}

// ── Test 5: live=true but caller forgot to supply fetchImpl → aborted, not a crash, not a false completed ──

console.log("\nTest 5: live=true with sources declared but no fetchImpl supplied → aborted (internal-error guard)");
{
  const registry = { meta: { quorumRequired: 1 }, sources: [{ source_id: "src-x-y", provider: "X", source_type: "announcement", url: "https://x.example/news", tier: "primary" }] };
  const record = await runL1Scan(registry, { now: NOW, live: true }); // fetchImpl deliberately omitted
  assert(record.status === "aborted", `expected status "aborted", got "${record.status}"`);
  assert(typeof record.abort_reason === "string" && record.abort_reason.length > 0, "abort_reason must be a non-empty string");
}

// ── Test 6: computeScanId sequencing ────────────────────────────────────────

console.log("\nTest 6: computeScanId produces scan-YYYY-MM-DD-NNN and sequences within a day");
{
  const id1 = computeScanId(NOW, []);
  assert(id1 === "scan-2026-09-16-001", `expected "scan-2026-09-16-001", got "${id1}"`);

  const id2 = computeScanId(NOW, ["scan-2026-09-16-001"]);
  assert(id2 === "scan-2026-09-16-002", `expected "scan-2026-09-16-002", got "${id2}"`);

  const id3 = computeScanId(NOW, ["scan-2026-09-16-001", "scan-2026-09-16-005", "scan-2026-09-15-009"]);
  assert(id3 === "scan-2026-09-16-006", `expected sequencing to continue from the highest same-day suffix (006), got "${id3}"`);
}

// ── Test 7: hashBytes produces the archive_or_hash format the releases validator enforces ──

console.log("\nTest 7: hashBytes output matches ^sha256:[0-9a-f]{64}$ (the releases validator's archive_or_hash format)");
{
  const digest = hashBytes(Buffer.from("hello world"));
  assert(/^sha256:[0-9a-f]{64}$/.test(digest), `hashBytes output "${digest}" does not match the required sha256 format`);
  // Deterministic: same bytes -> same hash, every time, no network involved.
  const digest2 = hashBytes(Buffer.from("hello world"));
  assert(digest === digest2, "hashBytes must be deterministic for identical input bytes");
}

// ── Test 8: retrieveSource wraps a fetch failure without throwing ─────────

console.log("\nTest 8: retrieveSource reports a thrown fetch error as reached:false, never throws");
{
  const source = { source_id: "src-x-y", url: "https://x.example/news" };
  const explodingFetch = async () => {
    throw new Error("simulated DNS failure");
  };
  const result = await retrieveSource(source, explodingFetch, NOW);
  assert(result.reached === false, "a thrown fetch error must be reported as reached:false, not propagate");
  assert(typeof result.reason === "string" && result.reason.includes("simulated DNS failure"), "reason should carry the underlying error message");
}

// ── Summary ─────────────────────────────────────────────────────────────

console.log(`\n${"─".repeat(70)}`);
console.log(`TOTAL: ${passed} passed, ${failed} failed`);

if (failed > 0) {
  console.error(`\nFAILED — ${failed} test(s) did not pass\n`);
  process.exit(1);
} else {
  console.log(`\nAll ${passed} tests passed\n`);
  process.exit(0);
}
