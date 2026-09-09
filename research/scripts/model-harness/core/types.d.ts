/**
 * types.d.ts — reference types for the Phase A model evaluation harness.
 *
 * These are DOCUMENTATION, not a compiled contract: this directory has no
 * TypeScript build step (zero packages — see repo root note below), and no
 * .mjs file in this harness imports from this file. It mirrors
 * docs/MODEL_EVALUATION_HARNESS_DESIGN.md §2.3 almost verbatim so a reader
 * can compare the design's interface to the actual JS shapes constructed in
 * core/planner.mjs, core/executor.mjs and adapters/replay.mjs without
 * hunting for the equivalent object-literal shape by hand.
 *
 * Phase A note: the harness ships exactly one adapter (adapters/replay.mjs).
 * A live adapter is Phase C+ and is NOT built here — see the bottom of this
 * file for what a live adapter would need to add.
 */

export type ProductSurface =
  | "consumer" | "api_default" | "base" | "fine_tune" | "agent" | "deployed_system";

export interface ModelTarget {
  registryId: string;          // FK to site/src/data/model-benchmark/registry-v1.json. REQUIRED.
  provider: string;            // adapter id, e.g. "replay"
  endpoint: string;            // exact URL/identifier tested
  model: string;                // exact snapshot string
  productSurface: ProductSurface;
  accessTier: string | null;
  region: string | null;
}

export interface SamplingConfig {
  temperature: number | null;
  topP: number | null;
  maxOutputTokens: number | null;
  seed: number | null;
  seedControl: "supported" | "unavailable" | "ignored" | "unknown";
  stop: string[] | null;
  systemPrompt: string | null; // null = none sent
}

/**
 * The ONLY payload shape ever passed to ProviderAdapter#execute(). Built
 * exclusively by core/planner.mjs#buildModelFacingRequest(), whose function
 * signature accepts a bare `promptText: string` — not an item/task object —
 * which is what makes it structurally impossible for sourceOnlyFields,
 * reviewRequired, conversationState, anchors, criticalHarmRules, or any
 * other evaluator-facing field to reach this shape. See planner.mjs for the
 * enforcement; this type documents the resulting shape only.
 */
export interface TrialRequest {
  trialId: string;             // `${runId}:${itemId}:${variantId ?? '-'}:${trialIndex}:${attempt}`
  runId: string;
  itemId: string;
  itemHash: string;            // sha256 of canonical {id,itemVersion,prompt,anchors}
  itemVersion: string;
  variantId: string | null;
  messages: { role: "system" | "user" | "assistant"; content: string }[];
  sampling: SamplingConfig;
  timeoutMs: number;
  trialIndex: number;
  attempt: number;
}

export type ErrorClass =
  | "rate_limit" | "timeout" | "server_error" | "network"
  | "auth" | "quota" | "invalid_request"
  | "content_filter_request" | "content_filter_response"
  | "unknown";

export interface TrialResponse {
  ok: boolean;
  rawResponseBody: string;          // verbatim, unparsed, never edited
  text: string | null;
  finishReason: string | null;
  usage: {
    inputTokens: number | null;
    outputTokens: number | null;
    source: "provider" | "unavailable";
  };
  providerRequestId: string | null;
  httpStatus: number | null;
  latencyMs: number;
  moderation: { flagged: boolean | null; raw: unknown | null };
  toolCalls: unknown[] | null;
  error: { class: ErrorClass; message: string; retryable: boolean } | null;
  /**
   * INTERPRETATION ADDED IN PHASE A, NOT IN THE ORIGINAL DESIGN DOC: the
   * design's TrialResponse has no field that distinguishes "the model
   * completed normally but its content was a refusal" from an ordinary
   * completion — a refusal is model *behaviour*, not a transport/HTTP
   * error, so it cannot live in `error`. Rather than have the harness sniff
   * response text for refusal language (an unreviewed, invented heuristic),
   * this field lets the ADAPTER report it directly, exactly the way it
   * reports `finishReason` or `moderation` — a real provider adapter would
   * derive this from a documented signal (e.g. a specific `finishReason`
   * value); the replay adapter derives it from the fixture author's
   * explicit label. See the acceptance-test report for why this was
   * flagged as an ambiguous point rather than silently invented.
   */
  refused: boolean;
}

export interface AdapterCapabilities {
  seedControl: "supported" | "unavailable" | "unknown";
  systemPromptSupported: boolean;
  logprobsAvailable: boolean;
  usageReported: boolean;
  moderationSurfaceReported: boolean;
  notes: string;
}

export interface ProviderAdapter {
  readonly providerId: string;
  readonly adapterVersion: string;
  describeCapabilities(): AdapterCapabilities;
  execute(req: TrialRequest, target: ModelTarget, signal?: AbortSignal): Promise<TrialResponse>;
  countTokens?(text: string): number | null;
}

/**
 * ── What a LIVE adapter would need to add, beyond adapters/replay.mjs ────
 *
 * 1. The actual `fetch` call — the ONLY file allowed to contain one
 *    (enforced by acceptance test 9: `grep -r "fetch(" core/ bin/` must be
 *    empty). Everything else in this harness (planner, executor, evidence,
 *    manifest) must change by ZERO lines to accommodate it — that is the
 *    provider-agnosticism acceptance test named in the design doc's Phase D.
 * 2. Real credential handling: an environment variable read once at
 *    process start, never written to disk, never logged (core/redact.mjs
 *    already forbids logging raw request/response bodies; a live adapter
 *    must also never construct an error string that echoes the key).
 * 3. Real error classification: mapping the provider's actual HTTP status
 *    codes / error payloads onto the ErrorClass enum. The replay adapter
 *    skips this because fixtures declare their own status directly.
 * 4. A real `refused` signal: derived from whatever the provider actually
 *    exposes (a finishReason value, a moderation flag, or — least
 *    reliable — response text pattern-matching, which should be a last
 *    resort and disclosed as such in the manifest capabilities.notes).
 * 5. Real `usage` (token counts) and `providerRequestId` extraction from
 *    the provider's response envelope.
 * 6. Respecting `AbortSignal` for the configured `timeoutMs`.
 * 7. `adapterVersion` bumped whenever any of the above changes (Invariant
 *    A6) and Retry-After header parsing for the `rate_limit` backoff path.
 *
 * Nothing else in this harness is provider-specific: planner.mjs,
 * executor.mjs, evidence.mjs, manifest.mjs and redact.mjs operate entirely
 * on the ModelTarget / TrialRequest / TrialResponse shapes above.
 */
