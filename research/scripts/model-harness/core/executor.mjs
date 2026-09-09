/**
 * executor.mjs — runs a trial plan through a ProviderAdapter, applying the
 * retry table in core/retry-policy.mjs and classifying every attempt.
 *
 * Deliberately sequential in Phase A (no live provider yet, so there is
 * nothing to gain from concurrency and much to lose in reviewability); a
 * `concurrency` field is still recorded in the manifest as `1` so a later
 * phase that adds real concurrency changes a recorded number, not an
 * undocumented behaviour.
 *
 * Every attempt — success, refusal, filter, or failure — is reported via
 * `onAttempt(attemptRecord)` as it happens, so a caller (bin/run.mjs) can
 * persist it immediately through core/evidence.mjs rather than holding
 * everything in memory until the end (Invariant: raw responses are never
 * silently edited, and a crash mid-run should not destroy already-captured
 * evidence).
 *
 * Invariant A3 enforced here: a `content_filter_response`/`content_filter_request`
 * classification is recorded as `status: "filtered"` and its retry policy
 * has maxAttempts: 1 — it is never retried, by construction (the while
 * loop below only continues when `policy.retryable` is true).
 *
 * Invariant A4 (adapter never selects among responses) is enforced by
 * construction too: this loop always takes exactly what `adapter.execute`
 * returned for the CURRENT attempt — there is no code path that looks at
 * more than one attempt's response before deciding what to keep.
 */

import { buildModelFacingRequest } from "./planner.mjs";
import { RETRY_POLICY, computeBackoffMs, classifyTrialStatus } from "./retry-policy.mjs";

async function defaultSleep(ms) {
  if (ms <= 0) return;
  await new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * @param {object} args
 * @param {Array} args.plan trial slots from core/planner.mjs#buildTrialPlan
 * @param {import('./types.d.ts').ProviderAdapter} args.adapter
 * @param {import('./types.d.ts').ModelTarget} args.target
 * @param {(attemptRecord: object) => void} [args.onAttempt]
 * @param {(ms: number) => Promise<void>} [args.sleep] injectable for tests — avoids real delays
 * @param {() => number} args.rng seeded RNG (0..1), reused for backoff jitter — NOT the same
 *   stream as the planner's ordering RNG, to keep "how trials are ordered" and "how long a
 *   retry waits" independent, reproducible concerns.
 * @returns {Promise<{results: object[], aborted: boolean, abortReason: string|null}>}
 */
export async function executeTrialPlan({ plan, adapter, target, onAttempt = () => {}, sleep = defaultSleep, rng }) {
  const results = [];
  let aborted = false;
  let abortReason = null;

  for (const slot of plan) {
    if (aborted) {
      results.push({ slot, status: "not_executed", attempts: [], abortReason });
      continue;
    }

    const attempts = [];
    let attemptNumber = 0; // 1-based count of attempts made
    let finalStatus = null;
    let finalResponse = null;
    let finalRequest = null;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      attemptNumber += 1;
      const zeroBasedAttempt = attemptNumber - 1;
      const request = buildModelFacingRequest({ ...slot, attempt: zeroBasedAttempt });
      const response = await adapter.execute(request, target, undefined);
      const status = classifyTrialStatus(response);
      const attemptRecord = { slot, request, response, status, attemptNumber: zeroBasedAttempt };
      attempts.push(attemptRecord);
      onAttempt(attemptRecord);

      if (status === "completed" || status === "refused" || status === "filtered") {
        finalStatus = status;
        finalResponse = response;
        finalRequest = request;
        break;
      }

      // status === "failed": consult retry policy by error class.
      const errorClass = response.error?.class ?? "unknown";
      const policy = RETRY_POLICY[errorClass] ?? RETRY_POLICY.unknown;

      if (!policy.retryable || attemptNumber >= policy.maxAttempts) {
        finalStatus = "failed";
        finalResponse = response;
        finalRequest = request;
        if (policy.abortRun) {
          aborted = true;
          abortReason = `Operator-error class "${errorClass}" on trial "${request.trialId}" — aborting the remainder of the run per retry_policy (auth/quota/invalid_request are never sampling noise).`;
        }
        break;
      }

      const delayMs = computeBackoffMs(errorClass, attemptNumber, rng, response.error?.retryAfterMs);
      await sleep(delayMs);
    }

    results.push({ slot, request: finalRequest, response: finalResponse, status: finalStatus, attempts });
  }

  return { results, aborted, abortReason };
}
