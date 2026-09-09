#!/usr/bin/env node
/**
 * bin/run.mjs — CLI entry point for the Phase A model evaluation harness.
 *
 * Parses flags, refuses unsafe combinations BEFORE touching the bank,
 * registry, or fixtures, then wires planner -> executor -> evidence ->
 * manifest -> run-record into one replay-adapter run.
 *
 * Phase A ships exactly one adapter (adapters/replay.mjs). This CLI refuses
 * any other `--adapter` value — there is no live adapter to select yet.
 *
 * `runHarness()` is exported separately from the argv-parsing `main()` so
 * tests can invoke the full pipeline in-process (fast, no subprocess) while
 * still being able to spawn this file as a real subprocess for the one test
 * that needs to observe actual CLI exit-code / stdout behaviour (acceptance
 * test 7).
 */

import { readFileSync, existsSync, writeFileSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { assertEvidenceRootSafe, summarizeForLog, SecureEvidenceRootError } from "../core/redact.mjs";
import { openRun, lockRun } from "../core/manifest.mjs";
import { buildTrialPlan } from "../core/planner.mjs";
import { executeTrialPlan } from "../core/executor.mjs";
import { buildRunRecord } from "../core/run-record.mjs";
import { writeArtifactSync, appendJsonLineSync, sha256Hex, canonicalJSONStringify } from "../core/evidence.mjs";
import { createReplayAdapter, PROVIDER_ID as REPLAY_PROVIDER_ID } from "../adapters/replay.mjs";
import { RETRY_POLICY, RETRY_POLICY_VERSION } from "../core/retry-policy.mjs";
import { createSeededRng } from "../../../../site/scripts/lib/evaluation-statistics.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = resolve(__dirname, "..", "..", "..", "..");
export const REAL_TASK_BANK_PATH = join(REPO_ROOT, "site", "src", "data", "model-benchmark", "tasks-v1.json");
export const REAL_REGISTRY_PATH = join(REPO_ROOT, "site", "src", "data", "model-benchmark", "registry-v1.json");

function resolveHarnessCommit(repoRoot) {
  try {
    const headPath = join(repoRoot, ".git", "HEAD");
    const head = readFileSync(headPath, "utf8").trim();
    if (!head.startsWith("ref:")) return head; // detached HEAD — already a SHA
    const ref = head.slice(5).trim();
    const refPath = join(repoRoot, ".git", ref);
    if (existsSync(refPath)) return readFileSync(refPath, "utf8").trim();
    const packedPath = join(repoRoot, ".git", "packed-refs");
    if (existsSync(packedPath)) {
      const line = readFileSync(packedPath, "utf8")
        .split("\n")
        .find((l) => l.endsWith(" " + ref));
      if (line) return line.split(" ")[0];
    }
    return null;
  } catch {
    return null;
  }
}

export function parseArgs(argv) {
  const out = {
    pool: "public",
    trialsPerItem: 5,
    seed: 1,
    label: "pilot",
    adapter: "replay",
    concurrency: 1,
    timeoutMs: 30000,
    includeSensitive: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => {
      i += 1;
      if (i >= argv.length) throw new Error(`Missing value for argument "${a}"`);
      return argv[i];
    };
    switch (a) {
      case "--pool":
        out.pool = next();
        break;
      case "--trials-per-item":
        out.trialsPerItem = Number(next());
        break;
      case "--seed":
        out.seed = Number(next());
        break;
      case "--evidence-root":
        out.evidenceRoot = next();
        break;
      case "--bank":
        out.bankPath = next();
        break;
      case "--fixtures":
        out.fixturesPath = next();
        break;
      case "--registry":
        out.registryPath = next();
        break;
      case "--target-registry-id":
        out.targetRegistryId = next();
        break;
      case "--adapter":
        out.adapter = next();
        break;
      case "--label":
        out.label = next();
        break;
      case "--operator":
        out.operator = next();
        break;
      case "--run-id":
        out.runId = next();
        break;
      case "--include-sensitive":
        out.includeSensitive = true;
        break;
      default:
        throw new Error(`Unknown argument: "${a}"`);
    }
  }
  return out;
}

function requireOption(options, key, flagName) {
  if (options[key] === undefined || options[key] === null || options[key] === "") {
    throw new Error(`Missing required argument ${flagName}`);
  }
}

function persistAttempt({ runDir, pool, clock, attemptRecord }) {
  const { request, response, status } = attemptRecord;
  const requestedAt = clock();
  const respondedAt = clock();
  const rawResponseSha256 = sha256Hex(response.rawResponseBody);

  const trialRecord = {
    trial_id: request.trialId,
    run_id: request.runId,
    item_id: request.itemId,
    item_hash: request.itemHash,
    item_version: request.itemVersion,
    variant_id: request.variantId,
    trial_index: request.trialIndex,
    attempt: request.attempt,
    // §6.2: secure-pool trial records omit request_sent and store
    // request_hash instead — never both. Public pool stores the verbatim
    // request. `undefined` values are dropped by JSON.stringify, so the
    // omitted key is genuinely ABSENT from the file, not present-as-null.
    request_sent: pool === "public" ? request.messages : undefined,
    request_hash: pool === "public" ? undefined : sha256Hex(canonicalJSONStringify(request.messages)),
    sampling: request.sampling,
    requested_at: requestedAt,
    responded_at: respondedAt,
    latency_ms: response.latencyMs,
    http_status: response.httpStatus,
    provider_request_id: response.providerRequestId,
    // §6.2: secure-pool RESPONSES are also restricted — the verbatim body
    // is withheld from the committed tree; only its hash is kept there.
    raw_response_body: pool === "public" ? response.rawResponseBody : undefined,
    raw_response_sha256: rawResponseSha256,
    text: pool === "public" ? response.text : undefined,
    finish_reason: response.finishReason,
    usage: response.usage,
    moderation: response.moderation,
    tool_calls: response.toolCalls,
    error: response.error,
    refused: response.refused,
    status,
  };

  const relPath = `trials/${request.itemId}/${request.variantId ?? "-"}/${request.trialIndex}.${request.attempt}.json`;
  const hash = writeArtifactSync(runDir, relPath, trialRecord);
  appendJsonLineSync(runDir, "trials.index.jsonl", { trial_id: request.trialId, path: relPath, sha256: hash, status });
  if (response.error) appendJsonLineSync(runDir, "errors.jsonl", { trial_id: request.trialId, error: response.error });
  appendJsonLineSync(runDir, "usage.jsonl", { trial_id: request.trialId, usage: response.usage, latency_ms: response.latencyMs });

  // Record the hash back onto the response object so run-record.mjs can
  // reference it without re-reading the file.
  response.rawResponseSha256 = rawResponseSha256;
  return { relPath, hash };
}

/**
 * Runs the full Phase A pipeline once. Every side effect (clock, sleep,
 * rng, logger) is injectable so tests are hermetic and fast.
 *
 * @param {object} options from parseArgs() (or an equivalent object built
 *   directly by a test)
 * @param {object} [deps]
 * @param {() => string} [deps.clock] ISO-8601 timestamp source
 * @param {(ms:number)=>Promise<void>} [deps.sleep]
 * @param {() => number} [deps.backoffRng] 0..1 RNG for backoff jitter
 * @param {(obj:object)=>void} [deps.log] receives ONLY summarizeForLog()-shaped objects
 */
export async function runHarness(options, deps = {}) {
  const clock = deps.clock ?? (() => new Date().toISOString());
  const sleep = deps.sleep ?? ((ms) => new Promise((r) => setTimeout(r, ms)));
  const backoffRng = deps.backoffRng ?? createSeededRng((options.seed ?? 1) + 1); // deliberately a DIFFERENT stream than the ordering RNG
  const log = deps.log ?? ((obj) => console.log(JSON.stringify(summarizeForLog(obj))));

  requireOption(options, "evidenceRoot", "--evidence-root");
  requireOption(options, "operator", "--operator");
  requireOption(options, "fixturesPath", "--fixtures");
  requireOption(options, "registryPath", "--registry");
  requireOption(options, "targetRegistryId", "--target-registry-id");

  if (options.pool !== "public" && options.pool !== "secure") {
    throw new Error(`--pool must be "public" or "secure", got "${options.pool}"`);
  }

  // ── GUARD FIRST — before reading the bank, registry, or fixtures. ───────
  // This is what makes "exits before any request is constructed" literally
  // true: nothing has been read off disk yet except argv itself.
  const evidenceRootAbs = resolve(options.evidenceRoot);
  assertEvidenceRootSafe({ pool: options.pool, evidenceRootAbs, repoRootAbs: REPO_ROOT });

  if (options.adapter !== "replay") {
    throw new Error(`Phase A ships only the "replay" adapter (docs/MODEL_EVALUATION_HARNESS_DESIGN.md Phase A/C). "${options.adapter}" is not implemented.`);
  }

  const bankPath = options.bankPath ?? REAL_TASK_BANK_PATH;
  const bank = JSON.parse(readFileSync(bankPath, "utf8"));
  const registry = JSON.parse(readFileSync(options.registryPath, "utf8"));
  const fixtures = JSON.parse(readFileSync(options.fixturesPath, "utf8"));

  // ── Belt-and-suspenders guard #2, matching the design's literal wording
  // ("if any item in the PLAN has exposureStatus != public-permanent"):
  // re-check against the actual item data, not just the --pool flag. ─────
  const itemPool = options.pool === "public" ? "core-public" : "secure";
  const anyNonPublicPermanent = (bank.items ?? []).some((it) => it.pool === itemPool && it.exposureStatus !== "public-permanent");
  if (anyNonPublicPermanent) {
    assertEvidenceRootSafe({ pool: "secure", evidenceRootAbs, repoRootAbs: REPO_ROOT });
  }

  const entry = (registry.entries ?? []).find((e) => e.registry_id === options.targetRegistryId);
  if (!entry) {
    throw new Error(`No registry entry with registry_id "${options.targetRegistryId}" found in ${options.registryPath}. A run must reference a registered model (site/scripts/lib/model-registry-validator.mjs).`);
  }

  const target = {
    registryId: entry.registry_id,
    provider: REPLAY_PROVIDER_ID,
    endpoint: entry.endpoint,
    model: entry.exact_snapshot,
    productSurface: entry.product_surface,
    accessTier: entry.access_tier ?? null,
    region: entry.region ?? null,
  };

  const sampling = {
    temperature: entry.sampling?.temperature ?? null,
    topP: entry.sampling?.top_p ?? null,
    maxOutputTokens: entry.sampling?.max_tokens ?? null,
    seed: entry.sampling?.seed ?? null,
    seedControl: entry.sampling?.seed != null ? "supported" : "unavailable",
    stop: null,
    // Phase A never sends a system prompt at all (no live adapter exists to send one to).
    systemPrompt: null,
  };

  const runId = options.runId ?? `phase-a-${target.registryId}-${options.seed}`;
  const runDir = join(evidenceRootAbs, runId);
  const adapter = createReplayAdapter({ fixtures });
  const capabilities = adapter.describeCapabilities();

  const startedAt = clock();
  const startManifest = {
    run_id: runId,
    registry_id: target.registryId,
    benchmark_version: bank.meta?.schemaVersion ?? null,
    bank_version: bank.meta?.bankVersion ?? null,
    form_id: "core-public-v1",
    pool: options.pool,
    label: options.label,
    harness_commit: resolveHarnessCommit(REPO_ROOT),
    adapter_id: adapter.providerId,
    adapter_version: adapter.adapterVersion,
    node_version: process.version,
    os: process.platform,
    operator: options.operator,
    authority: {
      approvedBy: options.operator,
      note:
        "Phase A skeleton/demonstration run. No GATE A or GATE C founder approval exists for this run — see " +
        "docs/MODEL_EVALUATION_HARNESS_DESIGN.md Part 8. This run never calls a network, never touches a real " +
        "model, and is never published or promoted.",
    },
    target,
    sampling,
    trials_per_item: options.trialsPerItem,
    randomization_seed: options.seed,
    concurrency: options.concurrency,
    timeout_ms: options.timeoutMs,
    retry_policy: { version: RETRY_POLICY_VERSION, table: RETRY_POLICY },
    items: null, // filled in below once the plan is built
    capabilities,
    started_at: startedAt,
  };

  const planResult = buildTrialPlan({
    bank,
    itemVersion: bank.meta?.bankVersion ?? "unknown",
    runId,
    trialsPerItem: options.trialsPerItem,
    seed: options.seed,
    sampling,
    timeoutMs: options.timeoutMs,
    pool: itemPool,
  });

  startManifest.items = planResult.itemMeta.map((m) => ({
    item_id: m.itemId,
    item_version: m.itemVersion,
    item_hash: m.itemHash,
    variant_ids: m.variantIds,
    // Always null — see core/planner.mjs's subdimensionId comment (§7.1).
    subdimension_id: m.subdimensionId,
  }));

  openRun(runDir, startManifest);

  const execution = await executeTrialPlan({
    plan: planResult.plan,
    adapter,
    target,
    sleep,
    rng: backoffRng,
    onAttempt: (attemptRecord) => {
      persistAttempt({ runDir, pool: options.pool, clock, attemptRecord });
      log({ ...summarizeForLog(attemptRecord.request), status: attemptRecord.status, pool: options.pool });
    },
  });

  const completedAt = clock();
  const failedTrialIds = execution.results.filter((r) => r.status === "failed").map((r) => r.request.trialId);
  const tokensIn = execution.results.reduce((a, r) => a + (r.response?.usage?.inputTokens ?? 0), 0);
  const tokensOut = execution.results.reduce((a, r) => a + (r.response?.usage?.outputTokens ?? 0), 0);

  const { manifest: lockedManifest, manifestHash } = lockRun(runDir, startManifest, {
    completed_at: completedAt,
    locked_at: clock(),
    trial_count_expected: planResult.plan.length,
    trial_count_persisted: execution.results.filter((r) => r.status !== "not_executed").length,
    failed_trial_ids: failedTrialIds,
    tokens_in_total: tokensIn,
    tokens_out_total: tokensOut,
    usage_source: "unavailable", // replay adapter never reports real provider usage
    cost_estimate: 0,
    cost_actual: null, // null until billed — never faked, per design §2.4
    ceiling_at_time: null,
  });

  // run-record.json: the analysis-layer-facing output boundary. Written
  // AFTER lock, deliberately NOT through the lock-guarded evidence.mjs
  // writer — see core/run-record.mjs's header comment for why this is
  // documented as an interpretation, not an oversight.
  const runRecord = buildRunRecord({
    manifest: lockedManifest,
    manifestHash,
    itemMeta: planResult.itemMeta,
    results: execution.results,
  });
  writeFileRunRecord(runDir, runRecord);

  return { runDir, manifest: lockedManifest, manifestHash, planResult, execution, runRecord };
}

function writeFileRunRecord(runDir, runRecord) {
  // Intentionally bypasses evidence.mjs's lock-guarded writer (see the
  // comment at its call site above): run-record.json is analysis-layer
  // output, conceptually a separate program from the execution evidence
  // the LOCK protects, even though Phase A produces both in one CLI
  // invocation for demonstration purposes. Still canonical JSON for
  // consistency with everything else this harness writes.
  writeFileSync(join(runDir, "run-record.json"), canonicalJSONStringify(runRecord), "utf8");
}

export async function main(argv) {
  let options;
  try {
    options = parseArgs(argv);
  } catch (e) {
    console.error(`Argument error: ${e.message}`);
    process.exitCode = 1;
    return;
  }

  try {
    const result = await runHarness(options);
    console.log(`\nRun "${result.manifest.run_id}" locked. hashtree_root=${result.manifest.hashtree_root}`);
    console.log(`Evidence: ${result.runDir}`);
    process.exitCode = 0;
  } catch (e) {
    if (e instanceof SecureEvidenceRootError) {
      console.error(e.message);
      process.exitCode = 2;
      return;
    }
    console.error(`Run failed: ${e.message}`);
    process.exitCode = 1;
  }
}

const isMainModule = (() => {
  try {
    return import.meta.url === pathToFileURL(process.argv[1] ?? "").href;
  } catch {
    return false;
  }
})();

if (isMainModule) {
  main(process.argv.slice(2));
}
