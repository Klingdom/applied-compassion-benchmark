/**
 * retry-policy.mjs — the published, deterministic, versioned retry table
 * from docs/MODEL_EVALUATION_HARNESS_DESIGN.md §2.6. Recorded verbatim in
 * the manifest as `retry_policy` (see core/manifest.mjs) with
 * RETRY_POLICY_VERSION so that changing the policy is a versioned change,
 * not a silent code tweak.
 *
 * | Error class                                  | Retryable | Max attempts |
 * |-----------------------------------------------|-----------|---------------|
 * | rate_limit                                     | yes       | 4             |
 * | timeout, server_error, network                 | yes       | 3             |
 * | auth, quota, invalid_request                   | no        | 1 (abort run) |
 * | content_filter_request, content_filter_response| no        | 1 (this IS the measurement) |
 * | HTTP 200 with any content                      | no        | 1 (never retry a success) |
 */

export const RETRY_POLICY_VERSION = "phase-a-v1";

export const RETRY_POLICY = Object.freeze({
  rate_limit: Object.freeze({ retryable: true, maxAttempts: 4, abortRun: false, honorsRetryAfter: true }),
  timeout: Object.freeze({ retryable: true, maxAttempts: 3, abortRun: false, honorsRetryAfter: false }),
  server_error: Object.freeze({ retryable: true, maxAttempts: 3, abortRun: false, honorsRetryAfter: false }),
  network: Object.freeze({ retryable: true, maxAttempts: 3, abortRun: false, honorsRetryAfter: false }),
  auth: Object.freeze({ retryable: false, maxAttempts: 1, abortRun: true, honorsRetryAfter: false }),
  quota: Object.freeze({ retryable: false, maxAttempts: 1, abortRun: true, honorsRetryAfter: false }),
  invalid_request: Object.freeze({ retryable: false, maxAttempts: 1, abortRun: true, honorsRetryAfter: false }),
  content_filter_request: Object.freeze({ retryable: false, maxAttempts: 1, abortRun: false, honorsRetryAfter: false }),
  content_filter_response: Object.freeze({ retryable: false, maxAttempts: 1, abortRun: false, honorsRetryAfter: false }),
  unknown: Object.freeze({ retryable: false, maxAttempts: 1, abortRun: false, honorsRetryAfter: false }),
});

const BACKOFF_BASE_MS = 1000;
const BACKOFF_CAP_MS = 30000;

/**
 * Exponential backoff, full jitter, capped at 30s. `attemptNumber` is
 * 1-based (the attempt that just failed). Honours a provider Retry-After
 * value in milliseconds for rate_limit when present.
 */
export function computeBackoffMs(errorClass, attemptNumber, rng, retryAfterMs) {
  const policy = RETRY_POLICY[errorClass] ?? RETRY_POLICY.unknown;
  if (policy.honorsRetryAfter && typeof retryAfterMs === "number" && Number.isFinite(retryAfterMs) && retryAfterMs >= 0) {
    return retryAfterMs;
  }
  const uncapped = BACKOFF_BASE_MS * 2 ** Math.max(0, attemptNumber - 1);
  const capped = Math.min(uncapped, BACKOFF_CAP_MS);
  return Math.floor(rng() * capped); // full jitter: uniform in [0, capped)
}

/**
 * Classifies a persisted TrialResponse into the trial-record `status` enum
 * evaluation-statistics.mjs expects: "completed" | "refused" | "filtered" |
 * "failed" | "malformed". See core/types.d.ts's TrialResponse doc comment
 * for why `refused` is a first-class adapter-reported field rather than a
 * harness-side text-sniffing heuristic — flagged as an interpretation in
 * the Phase A report, not something the design doc spells out.
 */
export function classifyTrialStatus(response) {
  if (response.error) {
    if (response.error.class === "content_filter_request" || response.error.class === "content_filter_response") {
      return "filtered";
    }
    return "failed";
  }
  if (!response.ok) return "failed";
  if (response.refused === true) return "refused";
  if (typeof response.text !== "string" || response.text.trim() === "") return "malformed";
  return "completed";
}
