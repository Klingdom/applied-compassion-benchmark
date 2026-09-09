#!/usr/bin/env node
/**
 * acceptance.test.mjs — the 11 acceptance tests named in
 * docs/MODEL_EVALUATION_HARNESS_DESIGN.md Part 8 ("Phase A acceptance
 * tests (write these first; they are the spec)"), plus two additional
 * tests covering "Required behaviour" items from the Phase A brief that
 * are not among the 11 but are explicitly required:
 *
 *   Required behaviour #1 — item selection respects validationStatus,
 *     asserted against the REAL 33-item bank (28 scorable today).
 *   Bonus — field separation is proven empirically (a malicious item
 *     object's evaluator-only fields never reach the model-facing
 *     payload), not just by the structural argument in planner.mjs's
 *     comments.
 *
 * Style mirrors site/scripts/test-model-registry.mjs / test-task-bank.mjs:
 * assert(label, cond) pass/fail counters, zero test framework dependency.
 * Zero network calls anywhere in this file — every "response" is a
 * SYNTHETIC fixture, labelled as such throughout.
 *
 * Exit code 0 = all tests pass, 1 = one or more failures.
 */

import { mkdtempSync, rmSync, readFileSync, writeFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

import { computeRegistryId } from "../../../../site/scripts/lib/model-registry-validator.mjs";
import { validateRunCompleteness } from "../../../../site/scripts/lib/evaluation-statistics.mjs";

import {
  writeArtifactSync,
  appendJsonLineSync,
  isLocked,
  buildHashTree,
  verifyHashTree,
  RunLockedError,
  computeItemHash,
  assertComparableItemHash,
  IncomparableItemHashError,
} from "../core/evidence.mjs";
import { openRun, lockRun, ManifestIncompleteError } from "../core/manifest.mjs";
import { selectScorableItems, itemArms, buildModelFacingRequest, buildTrialPlan } from "../core/planner.mjs";
import { executeTrialPlan } from "../core/executor.mjs";
import { buildRunRecord } from "../core/run-record.mjs";
import { createReplayAdapter } from "../adapters/replay.mjs";
import { runHarness, REPO_ROOT, REAL_TASK_BANK_PATH } from "../bin/run.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const HARNESS_ROOT = dirname(__dirname); // research/scripts/model-harness
const RUN_MJS_PATH = join(HARNESS_ROOT, "bin", "run.mjs");
const CORE_DIR = join(HARNESS_ROOT, "core");
const BIN_DIR = join(HARNESS_ROOT, "bin");

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

// ── tmp dir bookkeeping (all evidence written by these tests lives under
// the OS temp directory, never inside the repo, and is best-effort cleaned
// up at the end) ────────────────────────────────────────────────────────
const tmpRoots = [];
function mkTmpDir(prefix) {
  const dir = mkdtempSync(join(tmpdir(), prefix));
  tmpRoots.push(dir);
  return dir;
}

// ── Fixture builders — everything below is EXPLICITLY SYNTHETIC test data,
// never a real model, provider, or response. ───────────────────────────

function syntheticItem(overrides = {}) {
  return {
    id: "SYN-1-A",
    dimension: "AWR",
    construct: "Synthetic Construct",
    prompt: "Synthetic prompt text for Phase A harness tests only.",
    anchors: [{ level: 1, label: "1.0 Critical", description: "synthetic anchor" }],
    pool: "core-public",
    exposureStatus: "public-permanent",
    validationStatus: "unvalidated",
    // Evaluator-only fields deliberately included on the default fixture so
    // any test that forgets to isolate them still exercises the guard.
    sourceOnlyFields: { title: "must never reach a model", whatToObserve: "n/a" },
    reviewRequired: null,
    conversationState: null,
    ...overrides,
  };
}

function syntheticBank(items, metaOverrides = {}) {
  return { meta: { bankVersion: "synthetic-test-v1", schemaVersion: "test", ...metaOverrides }, items };
}

function syntheticRegistryEntry(overrides = {}) {
  const base = {
    developer: "Synthetic Test Labs",
    family: "Testalon",
    exact_snapshot: "synthetic-2026-01-01",
    aliases: [],
    endpoint: "https://replay.invalid/synthetic",
    product_surface: "api_default",
    access_tier: "test-tier",
    region: "us",
    system_prompt_status: "none",
    moderation_layer: "unknown",
    tools: [],
    sampling: { temperature: 0, top_p: 1, seed: 1, max_tokens: 512, context_limit: 8192 },
    first_seen: "2026-01-01",
    test_dates: ["2026-01-01"],
    lineage: { predecessor: null, materiality_basis: "SYNTHETIC fixture for Phase A harness acceptance tests only — not a real model registration." },
    evidence: [
      {
        source_url: "https://example.invalid/synthetic-fixture",
        publisher: "Compassion Benchmark (synthetic test fixture)",
        published_at: "2026-01-01T00:00:00Z",
        retrieved_at: "2026-01-01T00:00:00Z",
        archive_or_hash: "sha256:synthetic-fixture-not-a-real-hash",
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

function syntheticRegistry(...entries) {
  return { meta: { schemaVersion: "test", note: "SYNTHETIC — Phase A harness test fixture, not the real registry." }, entries };
}

const DEFAULT_SAMPLING = { temperature: 0, topP: 1, maxOutputTokens: null, seed: 1, seedControl: "supported", stop: null, systemPrompt: null };
const SYNTHETIC_TARGET = {
  registryId: "synthetic",
  provider: "replay",
  endpoint: "https://replay.invalid",
  model: "synthetic",
  productSurface: "api_default",
  accessTier: null,
  region: null,
};

function fixedClock(startMs = Date.parse("2026-01-01T00:00:00.000Z")) {
  let n = 0;
  return () => new Date(startMs + n++ * 1000).toISOString();
}

function minimalStartManifest(overrides = {}) {
  return {
    run_id: "test-run",
    registry_id: "test-registry-id",
    benchmark_version: "test",
    bank_version: "test",
    form_id: "test-form",
    pool: "public",
    label: "pilot",
    harness_commit: null,
    adapter_id: "replay",
    adapter_version: "0.1.0-phase-a",
    node_version: process.version,
    os: process.platform,
    operator: "test-harness (synthetic)",
    authority: { approvedBy: "test-harness (synthetic)", note: "synthetic test manifest — no real GATE A/C approval" },
    target: SYNTHETIC_TARGET,
    sampling: DEFAULT_SAMPLING,
    trials_per_item: 3,
    randomization_seed: 1,
    concurrency: 1,
    timeout_ms: 1000,
    retry_policy: { version: "test" },
    items: [{ item_id: "SYN-1-A", item_version: "v1", item_hash: "deadbeef", variant_ids: [null], subdimension_id: null }],
    capabilities: {
      seedControl: "supported",
      systemPromptSupported: false,
      logprobsAvailable: false,
      usageReported: true,
      moderationSurfaceReported: true,
      notes: "synthetic",
    },
    started_at: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function lockAdditionalFields(overrides = {}) {
  return {
    completed_at: "2026-01-01T00:01:00.000Z",
    locked_at: "2026-01-01T00:02:00.000Z",
    trial_count_expected: 3,
    trial_count_persisted: 3,
    failed_trial_ids: [],
    tokens_in_total: 0,
    tokens_out_total: 0,
    usage_source: "unavailable",
    cost_estimate: 0,
    cost_actual: null,
    ceiling_at_time: null,
    ...overrides,
  };
}

// ═════════════════════════════════════════════════════════════════════════
// Required behaviour #1 (Phase A brief, not one of the numbered 11):
// item selection respects validationStatus, against the REAL task bank.
// ═════════════════════════════════════════════════════════════════════════

console.log("Required behaviour #1: item selection respects validationStatus against the REAL task bank");
{
  const realBank = JSON.parse(readFileSync(REAL_TASK_BANK_PATH, "utf8"));
  const { selected, excluded } = selectScorableItems(realBank, { pool: "core-public" });
  assert("the real bank has exactly 33 items", realBank.items.length === 33);
  assert("28 scorable items today — asserted against the real bank, not assumed", selected.length === 28);
  const excludedIds = excluded.map((e) => e.id).sort();
  const expectedDraftIds = ["ACC-1-A", "AWR-2-A", "INT-1-B", "INT-1-C", "INT-3-A"].sort();
  assert("exactly the 5 known draft-authored-unreviewed items are excluded, and no others", JSON.stringify(excludedIds) === JSON.stringify(expectedDraftIds));
  assert("28 + 5 = 33 (selection is a partition, nothing lost or double-counted)", selected.length + excluded.length === 33);
  assert(
    "every excluded item's exclusion reason cites its non-scorable validationStatus",
    excluded.every((e) => e.reasons.some((r) => r.includes("non-scorable")))
  );
}

// ═════════════════════════════════════════════════════════════════════════
// Bonus (beyond the 11): field separation is enforced empirically.
// ═════════════════════════════════════════════════════════════════════════

console.log("\nBonus: field separation is enforced empirically, not only by the function-signature argument in planner.mjs");
{
  const SECRET = "SECRET-ANSWER-KEY-MUST-NOT-LEAK-93f7";
  const maliciousItem = syntheticItem({
    id: "LEAK-TEST-1",
    prompt: "Ordinary model-facing prompt text.",
    sourceOnlyFields: { answerKey: SECRET, title: "leak test" },
    reviewRequired: SECRET,
    conversationState: SECRET,
    criticalHarmRules: SECRET,
    culturalAccessibilityNotes: SECRET,
    anchors: [{ level: 1, label: "1.0 Critical", description: SECRET }],
  });

  const arms = itemArms(maliciousItem);
  assert("itemArms extracts exactly one arm for a non-variant item", arms.length === 1);
  assert("the extracted arm's promptText is ONLY item.prompt", arms[0].promptText === "Ordinary model-facing prompt text.");

  const req = buildModelFacingRequest({
    runId: "r1",
    itemId: maliciousItem.id,
    itemHash: computeItemHash({ id: maliciousItem.id, itemVersion: "v1", prompt: maliciousItem.prompt, anchors: maliciousItem.anchors }),
    itemVersion: "v1",
    variantId: null,
    promptText: arms[0].promptText,
    sampling: DEFAULT_SAMPLING,
    timeoutMs: 1000,
    trialIndex: 0,
    attempt: 0,
  });
  const serialized = JSON.stringify(req);
  assert("the model-facing request does NOT contain the secret marker anywhere", !serialized.includes(SECRET));
  assert("the model-facing request's only message content is the prompt text", req.messages.length === 1 && req.messages[0].content === "Ordinary model-facing prompt text.");

  let threw = null;
  try {
    buildModelFacingRequest({ runId: "r", itemId: "x", itemHash: "h", itemVersion: "v", variantId: null, promptText: maliciousItem, sampling: DEFAULT_SAMPLING, timeoutMs: 1, trialIndex: 0, attempt: 0 });
  } catch (e) {
    threw = e;
  }
  assert("buildModelFacingRequest REJECTS a non-string promptText — an item object cannot be passed through even by mistake", threw instanceof TypeError);
}

// ═════════════════════════════════════════════════════════════════════════
// Acceptance test 1: a run with a missing manifest field cannot lock.
// ═════════════════════════════════════════════════════════════════════════

console.log("\nAcceptance test 1: a run with a missing manifest field cannot lock");
{
  const runDir = join(mkTmpDir("cb-harness-t1-"), "run-1");
  const start = minimalStartManifest({ run_id: "t1-run" });
  openRun(runDir, start);
  assert("run opens successfully with all start-time fields present", existsSync(join(runDir, "manifest.json")));

  const additional = lockAdditionalFields();
  delete additional.ceiling_at_time; // omit ONE field required only at lock time

  let threw = null;
  try {
    lockRun(runDir, start, additional);
  } catch (e) {
    threw = e;
  }
  assert("lockRun throws ManifestIncompleteError when a required-at-lock field is missing", threw instanceof ManifestIncompleteError);
  assert("the missing field is named in the thrown error", threw && threw.missing.includes("ceiling_at_time"));
  assert("the run remains unlocked after the failed lock attempt", !isLocked(runDir));
  assert("hashtree.json was not written by the failed lock attempt", !existsSync(join(runDir, "hashtree.json")));
  assert("LOCK was not written by the failed lock attempt", !existsSync(join(runDir, "LOCK")));
}

// ═════════════════════════════════════════════════════════════════════════
// Acceptance test 2: a locked run rejects every subsequent write.
// ═════════════════════════════════════════════════════════════════════════

console.log("\nAcceptance test 2: a locked run rejects every subsequent write");
{
  const runDir = join(mkTmpDir("cb-harness-t2-"), "run-1");
  const start = minimalStartManifest({ run_id: "t2-run" });
  openRun(runDir, start);
  writeArtifactSync(runDir, "trials/SYN-1-A/-/0.0.json", { synthetic: true });
  lockRun(runDir, start, lockAdditionalFields());
  assert("run reports locked after lockRun", isLocked(runDir));

  let threwArtifact = null;
  try {
    writeArtifactSync(runDir, "trials/SYN-1-A/-/0.1.json", { synthetic: true });
  } catch (e) {
    threwArtifact = e;
  }
  assert("writeArtifactSync throws RunLockedError after lock", threwArtifact instanceof RunLockedError);

  let threwAppend = null;
  try {
    appendJsonLineSync(runDir, "trials.index.jsonl", { x: 1 });
  } catch (e) {
    threwAppend = e;
  }
  assert("appendJsonLineSync throws RunLockedError after lock", threwAppend instanceof RunLockedError);

  let threwRelock = null;
  try {
    lockRun(runDir, start, lockAdditionalFields());
  } catch (e) {
    threwRelock = e;
  }
  assert("lockRun itself refuses to re-lock an already-locked run", threwRelock instanceof Error && /already locked/i.test(threwRelock.message));
}

// ═════════════════════════════════════════════════════════════════════════
// Acceptance test 3: editing one byte of one trial file makes
// hashtree.json verification fail.
// ═════════════════════════════════════════════════════════════════════════

console.log("\nAcceptance test 3: editing one byte of one trial file makes hashtree.json verification fail");
{
  const runDir = join(mkTmpDir("cb-harness-t3-"), "run-1");
  const start = minimalStartManifest({ run_id: "t3-run" });
  openRun(runDir, start);
  writeArtifactSync(runDir, "trials/SYN-1-A/-/0.0.json", { synthetic: true, marker: "abc" });
  lockRun(runDir, start, lockAdditionalFields());

  const before = verifyHashTree(runDir);
  assert("hash tree verifies cleanly immediately after lock", before.ok === true);

  const trialPath = join(runDir, "trials", "SYN-1-A", "-", "0.0.json");
  const raw = readFileSync(trialPath, "utf8");
  writeFileSync(trialPath, raw.slice(0, -1) + "X", "utf8"); // exactly one byte changed

  const after = verifyHashTree(runDir);
  assert("hash tree verification fails after a one-byte edit to a locked trial file", after.ok === false);
  assert("the edited trial file is reported as the specific mismatch", after.mismatches.some((m) => m.path === "trials/SYN-1-A/-/0.0.json"));
  assert("the root hash changed too", after.storedRoot !== after.recomputedRoot);
}

// ═════════════════════════════════════════════════════════════════════════
// Acceptance test 4: an item whose prompt changed produces a different
// item_hash, and cross-run comparison is refused.
// ═════════════════════════════════════════════════════════════════════════

console.log("\nAcceptance test 4: a changed prompt produces a different item_hash, and cross-run comparison is refused");
{
  const anchors = [{ level: 1, description: "x" }];
  const hashA = computeItemHash({ id: "SYN-1-A", itemVersion: "v1", prompt: "Original prompt text.", anchors });
  const hashB = computeItemHash({ id: "SYN-1-A", itemVersion: "v1", prompt: "Original prompt text. (edited)", anchors });
  assert("changing the prompt text changes item_hash", hashA !== hashB);
  assert("the SAME prompt/version/anchors always hashes identically", hashA === computeItemHash({ id: "SYN-1-A", itemVersion: "v1", prompt: "Original prompt text.", anchors }));

  let threw = null;
  try {
    assertComparableItemHash("SYN-1-A", hashA, hashB);
  } catch (e) {
    threw = e;
  }
  assert("comparing the changed item across runs is refused", threw instanceof IncomparableItemHashError);

  let threw2 = null;
  try {
    assertComparableItemHash("SYN-1-A", hashA, hashA);
  } catch (e) {
    threw2 = e;
  }
  assert("comparing the SAME item_hash across two runs is allowed (no throw)", threw2 === null);
}

// ═════════════════════════════════════════════════════════════════════════
// Acceptance test 5: a content_filter_response trial is recorded as
// filtered and is never retried.
// ═════════════════════════════════════════════════════════════════════════

console.log("\nAcceptance test 5: a content_filter_response trial is recorded as filtered and is never retried");
{
  const bank = syntheticBank([syntheticItem({ id: "FILT-1", prompt: "trigger a content filter (synthetic)" })]);
  const { plan } = buildTrialPlan({ bank, itemVersion: "v1", runId: "t5-run", trialsPerItem: 1, seed: 1, sampling: DEFAULT_SAMPLING, timeoutMs: 1000, pool: "core-public" });
  const fixtures = { "FILT-1": { status: "filtered", errorClass: "content_filter_response" } };
  const adapter = createReplayAdapter({ fixtures });
  const { results } = await executeTrialPlan({ plan, adapter, target: SYNTHETIC_TARGET, sleep: async () => {}, rng: () => 0.5 });

  assert("exactly one trial was planned and executed", results.length === 1);
  assert("the trial's final status is 'filtered'", results[0].status === "filtered");
  assert("the trial was attempted exactly once — never retried", results[0].attempts.length === 1);
}

// ═════════════════════════════════════════════════════════════════════════
// Acceptance test 6: a failed trial does not reduce trials_per_item; the
// item is marked incomplete and the completeness gate blocks.
// ═════════════════════════════════════════════════════════════════════════

console.log("\nAcceptance test 6: a failed trial does not reduce trials_per_item; the item is marked incomplete");
{
  const bank = syntheticBank([syntheticItem({ id: "FAIL-1", prompt: "synthetic item that will have one exhausted trial" })]);
  const trialsPerItem = 3;
  const { plan, itemMeta } = buildTrialPlan({ bank, itemVersion: "v1", runId: "t6-run", trialsPerItem, seed: 1, sampling: DEFAULT_SAMPLING, timeoutMs: 1000, pool: "core-public" });

  const fixtures = {
    "FAIL-1::-::0": { status: "completed", text: "ok" },
    "FAIL-1::-::1": { status: "failed", errorClass: "server_error" }, // exhausts retries
    "FAIL-1::-::2": { status: "completed", text: "ok" },
  };
  const adapter = createReplayAdapter({ fixtures });
  const execution = await executeTrialPlan({ plan, adapter, target: SYNTHETIC_TARGET, sleep: async () => {}, rng: () => 0.999 });

  const failedResult = execution.results.find((r) => r.slot.trialIndex === 1);
  assert("the exhausted trial is recorded as failed", failedResult.status === "failed");
  assert("the exhausted trial was retried up to server_error's max attempts (3), never silently fewer", failedResult.attempts.length === 3);

  const runDir = join(mkTmpDir("cb-harness-t6-"), "run-1");
  const start = minimalStartManifest({
    run_id: "t6-run",
    trials_per_item: trialsPerItem,
    items: itemMeta.map((m) => ({ item_id: m.itemId, item_version: m.itemVersion, item_hash: m.itemHash, variant_ids: m.variantIds, subdimension_id: null })),
  });
  openRun(runDir, start);
  for (const r of execution.results) {
    writeArtifactSync(runDir, `trials/${r.slot.itemId}/-/${r.slot.trialIndex}.${r.request.attempt}.json`, { status: r.status });
  }
  const failedTrialIds = execution.results.filter((r) => r.status === "failed").map((r) => r.request.trialId);
  const { manifest: locked, manifestHash } = lockRun(
    runDir,
    start,
    lockAdditionalFields({ trial_count_expected: plan.length, trial_count_persisted: execution.results.length, failed_trial_ids: failedTrialIds })
  );
  assert("manifest.trials_per_item is UNCHANGED at 3 despite the failure — never silently reduced", locked.trials_per_item === 3);

  const runRecord = buildRunRecord({ manifest: locked, manifestHash, itemMeta, results: execution.results });
  assert("the item is listed as incomplete in the run-record", runRecord.incompleteItems.some((i) => i.itemId === "FAIL-1"));
  assert("the failed trial id is recorded in failedTrialIds", runRecord.failedTrialIds.length === 1);
  assert("publishable is hardcoded false", runRecord.publishable === false);

  const structural = validateRunCompleteness(runRecord);
  assert(
    "the BINDING structural completeness gate (site/scripts/lib/evaluation-statistics.mjs) still passes structurally — every required field IS present; incompleteness is tracked separately by this harness's own incompleteItems/failedTrialIds/publishable fields",
    structural.failures.length === 0
  );

  const wouldBeBlocked = validateRunCompleteness({ ...runRecord, repeatedTrials: { trialsPerItem: 2 } });
  assert(
    "if trials_per_item HAD been silently reduced below the 3-trial floor to paper over the failure, the binding gate WOULD block it",
    wouldBeBlocked.failures.length > 0
  );
}

// ═════════════════════════════════════════════════════════════════════════
// Acceptance test 7: with pool = secure and --evidence-root inside the
// repo, the harness exits non-zero before any request is constructed.
// ═════════════════════════════════════════════════════════════════════════

console.log("\nAcceptance test 7: pool=secure with --evidence-root inside the repo exits non-zero before any request is constructed");
{
  const nonexistentFixtures = join(mkTmpDir("cb-harness-t7-fx-"), "does-not-exist-fixtures.json");
  const nonexistentRegistry = join(mkTmpDir("cb-harness-t7-reg-"), "does-not-exist-registry.json");

  const result = spawnSync(
    process.execPath,
    [
      RUN_MJS_PATH,
      "--pool",
      "secure",
      "--evidence-root",
      REPO_ROOT,
      "--operator",
      "test-harness (synthetic)",
      "--fixtures",
      nonexistentFixtures,
      "--registry",
      nonexistentRegistry,
      "--target-registry-id",
      "does-not-matter",
    ],
    { encoding: "utf8" }
  );

  assert("process exits non-zero", result.status !== 0);
  const combined = `${result.stdout ?? ""}\n${result.stderr ?? ""}`;
  assert("the refusal message explains the secure-evidence-root guard fired", /Refusing to start/i.test(combined));
  assert(
    "no file-not-found (ENOENT) error appears — proving the guard fired BEFORE the (deliberately nonexistent) fixtures/registry files were ever opened",
    !/ENOENT/i.test(combined)
  );
}

// ═════════════════════════════════════════════════════════════════════════
// Acceptance test 8: no secure prompt text appears in stdout, stderr, or
// any committed file, under any error path.
// ═════════════════════════════════════════════════════════════════════════

console.log("\nAcceptance test 8: no secure prompt text appears in stdout/stderr or any committed file");
{
  const SECRET = "SECURE-POOL-SECRET-PROMPT-TEXT-c19a";
  const bank = syntheticBank([syntheticItem({ id: "SEC-1", pool: "secure", exposureStatus: "restricted", prompt: `Secure item containing ${SECRET}.` })]);

  const evidenceRoot = mkTmpDir("cb-harness-t8-evidence-"); // OUTSIDE the repo (os.tmpdir())
  const bankPath = join(mkTmpDir("cb-harness-t8-bank-"), "bank.json");
  writeFileSync(bankPath, JSON.stringify(bank), "utf8");
  const registry = syntheticRegistry(syntheticRegistryEntry());
  const registryPath = join(mkTmpDir("cb-harness-t8-registry-"), "registry.json");
  writeFileSync(registryPath, JSON.stringify(registry), "utf8");
  const fixtures = { "SEC-1": { status: "completed", text: `Response referencing ${SECRET} back.` } };
  const fixturesPath = join(mkTmpDir("cb-harness-t8-fixtures-"), "fixtures.json");
  writeFileSync(fixturesPath, JSON.stringify(fixtures), "utf8");

  const logged = [];
  const result = await runHarness(
    {
      pool: "secure",
      trialsPerItem: 1,
      seed: 1,
      label: "pilot",
      adapter: "replay",
      concurrency: 1,
      timeoutMs: 1000,
      evidenceRoot,
      bankPath,
      fixturesPath,
      registryPath,
      targetRegistryId: registry.entries[0].registry_id,
      operator: "test-harness (synthetic)",
      runId: "t8-run",
    },
    { clock: fixedClock(), sleep: async () => {}, log: (o) => logged.push(o) }
  );

  assert("no logged line contains the secret prompt text", !JSON.stringify(logged).includes(SECRET));

  const trialFilePath = join(result.runDir, "trials", "SEC-1", "-", "0.0.json");
  const trialRaw = readFileSync(trialFilePath, "utf8");
  const trialParsed = JSON.parse(trialRaw);
  assert("the persisted trial file does not contain the secret prompt text", !trialRaw.includes(SECRET));
  assert("the persisted trial file OMITS request_sent for the secure pool", !Object.prototype.hasOwnProperty.call(trialParsed, "request_sent"));
  assert("the persisted trial file carries request_hash instead", typeof trialParsed.request_hash === "string" && trialParsed.request_hash.length > 0);
  assert(
    "the persisted trial file OMITS raw_response_body and text for the secure pool",
    !Object.prototype.hasOwnProperty.call(trialParsed, "raw_response_body") && !Object.prototype.hasOwnProperty.call(trialParsed, "text")
  );
  assert("the persisted trial file still carries raw_response_sha256 (hash preserved even when body is withheld)", typeof trialParsed.raw_response_sha256 === "string");

  const manifestRaw = readFileSync(join(result.runDir, "manifest.json"), "utf8");
  assert("manifest.json does not contain the secret prompt text", !manifestRaw.includes(SECRET));
  const runRecordRaw = readFileSync(join(result.runDir, "run-record.json"), "utf8");
  assert("run-record.json does not contain the secret prompt text", !runRecordRaw.includes(SECRET));
}

// ═════════════════════════════════════════════════════════════════════════
// Acceptance test 9: grep -r "fetch(" core/ bin/ returns zero hits
// outside adapters/.
// ═════════════════════════════════════════════════════════════════════════

console.log('\nAcceptance test 9: `fetch(` appears nowhere in core/ or bin/ — only adapters/ may ever contain it');
{
  function collectMjsFiles(dir) {
    const out = [];
    for (const name of readdirSync(dir)) {
      const full = join(dir, name);
      const st = statSync(full);
      if (st.isDirectory()) out.push(...collectMjsFiles(full));
      else if (name.endsWith(".mjs")) out.push(full);
    }
    return out;
  }
  const offenders = [];
  for (const dir of [CORE_DIR, BIN_DIR]) {
    for (const file of collectMjsFiles(dir)) {
      if (readFileSync(file, "utf8").includes("fetch(")) offenders.push(file);
    }
  }
  assert(`zero files under core/ or bin/ contain the literal "fetch(" (offenders: ${offenders.join(", ") || "none"})`, offenders.length === 0);
}

// ═════════════════════════════════════════════════════════════════════════
// Acceptance test 10: subdimensionId is null in every emitted record.
// ═════════════════════════════════════════════════════════════════════════

console.log("\nAcceptance test 10: subdimensionId is null in every emitted record");
{
  const bank = syntheticBank([syntheticItem({ id: "SUB-1" }), syntheticItem({ id: "SUB-2", dimension: "EMP" })]);
  const { itemMeta } = buildTrialPlan({ bank, itemVersion: "v1", runId: "t10-plan", trialsPerItem: 1, seed: 1, sampling: DEFAULT_SAMPLING, timeoutMs: 1000, pool: "core-public" });
  assert(
    "planner itemMeta carries subdimensionId, always null",
    itemMeta.length === 2 && itemMeta.every((m) => Object.prototype.hasOwnProperty.call(m, "subdimensionId") && m.subdimensionId === null)
  );

  const evidenceRoot = mkTmpDir("cb-harness-t10-evidence-");
  const bankPath = join(mkTmpDir("cb-harness-t10-bank-"), "bank.json");
  writeFileSync(bankPath, JSON.stringify(bank), "utf8");
  const registry = syntheticRegistry(syntheticRegistryEntry());
  const registryPath = join(mkTmpDir("cb-harness-t10-registry-"), "registry.json");
  writeFileSync(registryPath, JSON.stringify(registry), "utf8");
  const fixtures = { "SUB-1": { status: "completed", text: "ok" }, "SUB-2": { status: "completed", text: "ok" } };
  const fixturesPath = join(mkTmpDir("cb-harness-t10-fixtures-"), "fixtures.json");
  writeFileSync(fixturesPath, JSON.stringify(fixtures), "utf8");

  const result = await runHarness(
    {
      pool: "public",
      trialsPerItem: 1,
      seed: 1,
      label: "pilot",
      adapter: "replay",
      concurrency: 1,
      timeoutMs: 1000,
      evidenceRoot,
      bankPath,
      fixturesPath,
      registryPath,
      targetRegistryId: registry.entries[0].registry_id,
      operator: "test-harness (synthetic)",
      runId: "t10-run",
    },
    { clock: fixedClock(), sleep: async () => {}, log: () => {} }
  );
  assert("manifest.items carries subdimension_id, always null", result.manifest.items.every((it) => it.subdimension_id === null));
  assert("run-record.taskManifest carries subdimension_id, always null", result.runRecord.taskManifest.every((it) => it.subdimension_id === null));
}

// ═════════════════════════════════════════════════════════════════════════
// Acceptance test 11: the replay adapter reproduces a stored run
// byte-identically from the manifest alone.
// ═════════════════════════════════════════════════════════════════════════

console.log("\nAcceptance test 11: the replay adapter reproduces a stored run byte-identically");
{
  const bank = syntheticBank([
    syntheticItem({ id: "REP-1", prompt: "Synthetic reproducibility prompt one." }),
    syntheticItem({
      id: "REP-2",
      dimension: "INT",
      prompt: "Arm A prompt text, eleven words long right here now indeed.",
      variants: [
        { variantId: "A", prompt: "Arm A prompt text, eleven words long right here now indeed." },
        { variantId: "B", prompt: "Arm B prompt text, eleven words long right here yes indeed." },
      ],
    }),
  ]);

  const evidenceRootA = mkTmpDir("cb-harness-t11-a-");
  const evidenceRootB = mkTmpDir("cb-harness-t11-b-");
  const bankPath = join(mkTmpDir("cb-harness-t11-bank-"), "bank.json");
  writeFileSync(bankPath, JSON.stringify(bank), "utf8");
  const registry = syntheticRegistry(syntheticRegistryEntry());
  const registryPath = join(mkTmpDir("cb-harness-t11-registry-"), "registry.json");
  writeFileSync(registryPath, JSON.stringify(registry), "utf8");
  const fixtures = {
    "REP-1": { status: "completed", text: "Deterministic synthetic reply one." },
    "REP-2::A": { status: "completed", text: "Deterministic synthetic reply arm A." },
    "REP-2::B": { status: "refused", text: "I can't help with that." },
  };
  const fixturesPath = join(mkTmpDir("cb-harness-t11-fixtures-"), "fixtures.json");
  writeFileSync(fixturesPath, JSON.stringify(fixtures), "utf8");

  const runOptions = {
    pool: "public",
    trialsPerItem: 2,
    seed: 42,
    label: "pilot",
    adapter: "replay",
    concurrency: 1,
    timeoutMs: 1000,
    bankPath,
    fixturesPath,
    registryPath,
    targetRegistryId: registry.entries[0].registry_id,
    operator: "test-harness (synthetic)",
    runId: "t11-run",
  };

  const resultA = await runHarness({ ...runOptions, evidenceRoot: evidenceRootA }, { clock: fixedClock(), sleep: async () => {}, log: () => {} });
  const resultB = await runHarness({ ...runOptions, evidenceRoot: evidenceRootB }, { clock: fixedClock(), sleep: async () => {}, log: () => {} });

  const treeA = buildHashTree(resultA.runDir);
  const treeB = buildHashTree(resultB.runDir);
  assert("replaying the same plan (same seed, same fixtures, same run_id, same clock) reproduces an identical hash-tree root", treeA.root === treeB.root);
  assert("both runs persisted the same number of artifacts, and at least one", treeA.entries.length === treeB.entries.length && treeA.entries.length > 0);

  let allBytesMatch = true;
  for (const [relPath, hash] of treeA.entries) {
    const matchB = treeB.entries.find(([p]) => p === relPath);
    if (!matchB || matchB[1] !== hash) allBytesMatch = false;
  }
  assert("every individual artifact's bytes are identical between the two runs", allBytesMatch);
  assert(
    "manifest.sha256 also matches between the two runs",
    readFileSync(join(resultA.runDir, "manifest.sha256"), "utf8") === readFileSync(join(resultB.runDir, "manifest.sha256"), "utf8")
  );
}

// ═════════════════════════════════════════════════════════════════════════
// Summary
// ═════════════════════════════════════════════════════════════════════════

console.log(`\n${"─".repeat(70)}`);
console.log(`SUMMARY: ${totalPassed} passed, ${totalFailed} failed`);
console.log("─".repeat(70));

for (const dir of tmpRoots) {
  try {
    rmSync(dir, { recursive: true, force: true });
  } catch {
    // best-effort cleanup only — never fail the test run over a leftover temp dir
  }
}

if (totalFailed > 0) {
  process.exit(1);
}
