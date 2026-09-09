/**
 * redact.mjs — secure-pool guards and the console/error redaction rules
 * from docs/MODEL_EVALUATION_HARNESS_DESIGN.md §6.2 and Invariant A5
 * ("The adapter never logs the request body. Error messages are
 * constructed from status + class, never from echoed input.").
 *
 * Two independent responsibilities, both load-bearing:
 *
 *  1. assertEvidenceRootSafe() — the HARD GUARD (§6.2): "If any item in the
 *     plan has exposureStatus != public-permanent and --evidence-root
 *     resolves inside the repository working tree, the harness refuses to
 *     start. Not a warning — an exit." bin/run.mjs calls this FIRST, before
 *     the bank, registry, or fixtures are even read, so it is genuinely
 *     true that no request is constructed before this check can fire.
 *
 *  2. summarizeForLog() — the ONLY shape this harness's own console/log
 *     output is ever built from. It is an explicit allowlist, not a
 *     blocklist: a field not named here cannot appear in a log line no
 *     matter what is later added to a trial record, which is what keeps a
 *     future field (e.g. a new sourceOnlyFields sub-key) from silently
 *     becoming loggable.
 */

import { resolve, sep } from "node:path";

export class SecureEvidenceRootError extends Error {
  constructor(message) {
    super(message);
    this.name = "SecureEvidenceRootError";
  }
}

/**
 * @param {{pool: string, evidenceRootAbs: string, repoRootAbs: string}} args
 * @throws {SecureEvidenceRootError} if pool !== "public" and the evidence
 *   root resolves inside the repo working tree.
 */
export function assertEvidenceRootSafe({ pool, evidenceRootAbs, repoRootAbs }) {
  const normalizedRoot = resolve(repoRootAbs);
  const normalizedEvidence = resolve(evidenceRootAbs);
  const insideRepo = normalizedEvidence === normalizedRoot || normalizedEvidence.startsWith(normalizedRoot + sep);
  if (pool !== "public" && insideRepo) {
    throw new SecureEvidenceRootError(
      `Refusing to start: pool="${pool}" but --evidence-root ("${evidenceRootAbs}") resolves inside the repository ` +
        `working tree ("${repoRootAbs}"). Secure-pool prompts and responses must never be written inside the repo ` +
        `(docs/MODEL_EVALUATION_HARNESS_DESIGN.md §6.2). Exiting before any request was constructed — not a warning.`
    );
  }
}

// Explicit allowlist. Anything not named here is structurally unloggable
// through this module, regardless of what a trial/request object carries.
const ALLOWED_LOG_KEYS = Object.freeze([
  "runId",
  "trialId",
  "itemId",
  "itemHash",
  "variantId",
  "trialIndex",
  "attempt",
  "status",
  "errorClass",
  "httpStatus",
  "latencyMs",
  "pool",
]);

/**
 * Reduces any object down to the console-safe allowlisted keys. Never
 * includes `messages`, `text`, `rawResponseBody`, `prompt`, or any
 * evaluator-facing field (sourceOnlyFields, reviewRequired,
 * conversationState, anchors, criticalHarmRules, etc.) — those keys are
 * simply not in ALLOWED_LOG_KEYS, so they are dropped even if present on
 * the input object.
 */
export function summarizeForLog(obj) {
  const out = {};
  if (!obj || typeof obj !== "object") return out;
  for (const key of ALLOWED_LOG_KEYS) {
    if (key in obj) out[key] = obj[key];
  }
  return out;
}

/**
 * Builds a log-safe error message from a TrialResponse-style error object:
 * class + a fixed, non-echoing message only. Never includes `err.message`
 * verbatim if it might contain echoed request content — callers pass a
 * short, harness-authored reason string instead of a provider message when
 * in doubt.
 */
export function redactedErrorSummary(error) {
  if (!error) return null;
  return { class: error.class ?? "unknown", retryable: error.retryable === true };
}
