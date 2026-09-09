/**
 * adapters/replay.mjs — THE ONLY ADAPTER SHIPPED IN PHASE A.
 *
 * Reads recorded, explicitly synthetic fixture responses instead of calling
 * a network. This file contains no `fetch` call and never will — it exists
 * so the entire execution pipeline (item selection, trial repetition,
 * response capture, hashing, run-record emission) is testable and
 * reviewable before a single paid call is made anywhere in this codebase.
 *
 * SYNTHETIC DATA WARNING: every response this adapter returns comes from a
 * fixture object supplied by the caller (a test, or a demo fixture file
 * passed via `bin/run.mjs --fixtures`). This module never invents a
 * response for a trial with no matching fixture — it throws instead. This
 * is deliberate: "never invent a model, provider, response, score, or run"
 * applies to test infrastructure too, not only to production paths.
 *
 * Fixture lookup key, most-specific first:
 *   `${itemId}::${variantId ?? '-'}::${trialIndex}::${attempt}`
 *   `${itemId}::${variantId ?? '-'}::${trialIndex}`
 *   `${itemId}::${variantId ?? '-'}`
 *   `${itemId}`
 * A test can therefore give one item a single fixture that applies to every
 * trial, or override a specific (trialIndex, attempt) pair — e.g. to make
 * attempt 0 fail with a retryable error and attempt 1 succeed, exercising
 * the retry path deterministically.
 *
 * Fixture shape (all fields optional except `status`):
 *   { status: "completed"|"refused"|"filtered"|"failed"|"malformed",
 *     text, finishReason, usage, providerRequestId, httpStatus, latencyMs,
 *     moderation, toolCalls, errorClass, errorMessage, retryable, retryAfterMs }
 */

export const PROVIDER_ID = "replay";
export const ADAPTER_VERSION = "0.1.0-phase-a";

export function describeCapabilities() {
  return {
    seedControl: "supported",
    systemPromptSupported: false,
    logprobsAvailable: false,
    usageReported: true,
    moderationSurfaceReported: true,
    notes:
      "SYNTHETIC replay adapter (docs/MODEL_EVALUATION_HARNESS_DESIGN.md Phase A). Never calls a network. " +
      "Every response is a fixture supplied by the caller, not real model output — not a real model, not a real provider.",
  };
}

function fixtureKeys(req) {
  const v = req.variantId ?? "-";
  return [
    `${req.itemId}::${v}::${req.trialIndex}::${req.attempt}`,
    `${req.itemId}::${v}::${req.trialIndex}`,
    `${req.itemId}::${v}`,
    `${req.itemId}`,
  ];
}

function lookupFixture(fixtures, req) {
  for (const key of fixtureKeys(req)) {
    if (Object.prototype.hasOwnProperty.call(fixtures, key)) return fixtures[key];
  }
  return null;
}

function buildResponseFromFixture(fixture, req) {
  const status = fixture.status ?? "completed";
  const rawResponseBody =
    fixture.rawResponseBody ??
    JSON.stringify({ synthetic: true, adapter: PROVIDER_ID, fixtureStatus: status, trialId: req.trialId, text: fixture.text ?? null });

  const shared = {
    rawResponseBody,
    finishReason: fixture.finishReason ?? (status === "completed" || status === "refused" ? "stop" : null),
    usage: fixture.usage ?? { inputTokens: null, outputTokens: null, source: "unavailable" },
    providerRequestId: fixture.providerRequestId ?? `replay-${req.trialId}`,
    httpStatus: fixture.httpStatus ?? (status === "failed" || status === "filtered" ? 400 : 200),
    latencyMs: typeof fixture.latencyMs === "number" ? fixture.latencyMs : 1,
    moderation: fixture.moderation ?? { flagged: status === "filtered", raw: null },
    toolCalls: fixture.toolCalls ?? null,
  };

  if (status === "filtered" || status === "failed") {
    return {
      ok: false,
      ...shared,
      text: null,
      refused: false,
      error: {
        class: fixture.errorClass ?? (status === "filtered" ? "content_filter_response" : "server_error"),
        message: fixture.errorMessage ?? `synthetic fixture: status="${status}"`,
        retryable: fixture.retryable ?? status === "failed",
        retryAfterMs: fixture.retryAfterMs ?? null,
      },
    };
  }

  if (status === "malformed") {
    return { ok: true, ...shared, text: null, refused: false, error: null };
  }

  // status === "completed" | "refused"
  return {
    ok: true,
    ...shared,
    text: fixture.text ?? "",
    refused: status === "refused",
    error: null,
  };
}

/**
 * @param {{fixtures: Record<string, object>}} args
 * @returns {import('../core/types.d.ts').ProviderAdapter}
 */
export function createReplayAdapter({ fixtures }) {
  if (!fixtures || typeof fixtures !== "object") {
    throw new TypeError("createReplayAdapter requires a `fixtures` object of explicitly synthetic, labelled recorded responses.");
  }
  return {
    providerId: PROVIDER_ID,
    adapterVersion: ADAPTER_VERSION,
    describeCapabilities,
    async execute(req, _target, _signal) {
      const fixture = lookupFixture(fixtures, req);
      if (!fixture) {
        throw new Error(
          `replay adapter: no fixture found for trial "${req.trialId}" (itemId=${req.itemId}, variantId=${req.variantId ?? "-"}, ` +
            `trialIndex=${req.trialIndex}, attempt=${req.attempt}). The replay adapter never invents a response — register a fixture.`
        );
      }
      return buildResponseFromFixture(fixture, req);
    },
  };
}
