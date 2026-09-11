import { DIMENSIONS } from "@/data/dimensions";

// ─── Shared composite core ────────────────────────────────────────────────────
//
// All composite-formula logic lives here.  Both public entry points
// (calcScores and computeCompositeFromDimensions) are thin adapters that
// prepare an array of 8 dimension values and then call this function.
//
// Having one copy prevents silent drift between the two paths.  The
// scoring-test suite (test-scoring.mjs, 69 cases) exercises both entry
// points and acts as the determinism gate for this extraction.

interface CoreResult {
  baseComposite: number;
  integrationPremium: number;
  stdDev: number;
  consistencyMult: number;
  weaknessFactor: number;
  weakDims: number;
  hasHarm: boolean;
  final: number;
}

/**
 * compositeCore — the single shared implementation of the composite formula.
 *
 * @param dimVals  Array of 8 dimension scores in 0–5 range.
 *                 Values are used in the order supplied; no key lookup is done.
 * @returns        Breakdown of every intermediate quantity plus the clamped
 *                 composite (rounded to 1 decimal, 0–100).
 */
function compositeCore(dimVals: number[]): CoreResult {
  const dimCount = dimVals.length;

  const baseAvg = dimVals.reduce((a, b) => a + b, 0) / dimCount;
  const baseComposite = ((baseAvg - 1) / 4) * 100;

  // Consistency multiplier — penalises high variance across dimensions.
  const mean = baseAvg;
  const variance = dimVals.reduce((a, b) => a + (b - mean) ** 2, 0) / dimCount;
  const stdDev = Math.sqrt(variance);

  let consistencyMult: number;
  if (stdDev <= 1.5) consistencyMult = 1.0;
  else if (stdDev <= 3.0) consistencyMult = 0.75;
  else if (stdDev <= 5.0) consistencyMult = 0.4;
  else consistencyMult = 0.1;

  // Weakness factor — penalises a high count of below-exemplary dimensions.
  const weakDims = dimVals.filter((v) => v < 4.0).length;
  const weaknessFactor = Math.max(0, 1 - weakDims * 0.2);

  // Harm flag — any dimension at exactly 0 disables the integration premium.
  const hasHarm = dimVals.some((v) => v === 0);
  const integrationPremium = hasHarm ? 0 : 10 * consistencyMult * weaknessFactor;

  const final = Math.min(100, Math.max(0, baseComposite + integrationPremium));

  return {
    baseComposite,
    integrationPremium,
    stdDev,
    consistencyMult,
    weaknessFactor,
    weakDims,
    hasHarm,
    final: Math.round(final * 10) / 10,
  };
}

// ─── Canonical code lists (shared by lenient + strict entry points) ──────────

/** The 8 dimension codes, in canonical order. Same list used by calcScores'
 * subdim→dim averaging and by computeCompositeFromDimensions. */
export const DIM_CODES = ["AWR", "EMP", "ACT", "EQU", "BND", "ACC", "SYS", "INT"];

/** All 40 subdimension codes, in canonical order (5 per dimension × 8 dimensions). */
export const SUBDIM_CODES = DIMENSIONS.flatMap((d) => d.subdims.map((s) => s.code));

// ─── Strict-completeness primitives ───────────────────────────────────────────
//
// Background: both calcScores and computeCompositeFromDimensions are
// deliberately lenient — a missing subdimension/dimension silently defaults
// to 1 (Critical) via `?? 1`. That default is disclosed and relied upon by
// two live callers (the self-assessment "finish anyway" flow, and the
// bootstrap-uncertainty estimator), so the lenient functions themselves must
// not change.
//
// These primitives add an explicit strict path for any *new* caller —
// especially anything that would publish a composite score for a named
// third party — where a silent 1-default would misrepresent an unmeasured
// dimension as "found to be in active harm."
//
// Rule of thumb: use the *_STRICT / assertComplete path before persisting or
// publishing a score attributed to a specific entity. Use the lenient path
// only where the 1-default is disclosed to the person seeing the result
// (self-assessment) or explicitly flagged to the consumer as insufficient
// coverage (bootstrap uncertainty). Never use the lenient path to produce a
// published third-party score.

/** Which canonical code list a completeness check is validating against. */
export type ScoreKind = "dimension" | "subdimension";

/** Structured result of a non-throwing completeness check. */
export interface CompletenessCheck {
  complete: boolean;
  /** Missing codes, in canonical order. Empty when complete. */
  missing: string[];
  kind: ScoreKind;
}

/**
 * Typed error thrown by assertComplete / computeCompositeFromDimensionsStrict.
 * Names every missing code so the caller can report exactly what is
 * unmeasured, rather than guessing from a downstream NaN or an incorrect 1.
 */
export class IncompleteScoreError extends Error {
  readonly kind: ScoreKind;
  readonly missing: string[];

  constructor(kind: ScoreKind, missing: string[]) {
    super(
      `Missing ${missing.length} ${kind} score${missing.length === 1 ? "" : "s"}: ${missing.join(", ")}`,
    );
    this.name = "IncompleteScoreError";
    this.kind = kind;
    this.missing = missing;
  }
}

function codesFor(kind: ScoreKind): string[] {
  return kind === "dimension" ? DIM_CODES : SUBDIM_CODES;
}

function findMissing(scores: Record<string, number>, kind: ScoreKind): string[] {
  return codesFor(kind).filter((code) => {
    const v = scores[code];
    return v === undefined || v === null || Number.isNaN(v);
  });
}

/**
 * isComplete — non-throwing completeness check.
 *
 * Use this when you want to render an explicit "Not measured" / "Insufficient
 * coverage" UI state instead of using exceptions for control flow. Checks
 * `scores` against the 8 dimension codes by default, or the 40 subdimension
 * codes when `kind: "subdimension"` is passed.
 *
 * Never defaults a missing value — it only reports what's missing.
 */
export function isComplete(
  scores: Record<string, number>,
  kind: ScoreKind = "dimension",
): CompletenessCheck {
  const missing = findMissing(scores, kind);
  return { complete: missing.length === 0, missing, kind };
}

/**
 * assertComplete — throws IncompleteScoreError naming every missing code if
 * `scores` does not cover every dimension (default) or subdimension code.
 *
 * Use this to guard any strict entry point (e.g.
 * computeCompositeFromDimensionsStrict) before the lenient `?? 1` default
 * would otherwise silently kick in.
 */
export function assertComplete(
  scores: Record<string, number>,
  kind: ScoreKind = "dimension",
): void {
  const missing = findMissing(scores, kind);
  if (missing.length > 0) {
    throw new IncompleteScoreError(kind, missing);
  }
}

// ─── Public entry point 1: subdimension scores → final composite ─────────────

/**
 * calcScores — LENIENT. Missing subdimension codes default to 1 (Critical)
 * via `?? 1`. This is deliberate and disclosed: SelfAssessment.tsx warns
 * "Missing scores will default to 1 (Absent). Continue?" before calling this.
 * Do not use this to produce a published score for a named third party
 * without first checking completeness (see isComplete / assertComplete).
 */
export function calcScores(scores: Record<string, number>) {
  // Step 1: average subdim scores up to dimension scores.
  const dimScores: Record<string, number> = {};
  DIMENSIONS.forEach((d) => {
    const vals = d.subdims.map((s) => scores[s.code] ?? 1);
    dimScores[d.code] = vals.reduce((a, b) => a + b, 0) / vals.length;
  });

  // Step 2: run the shared composite core.
  const dimVals = Object.values(dimScores);
  const core = compositeCore(dimVals);

  return {
    dimScores,
    final: core.final,
    integrationPremium: core.integrationPremium,
  };
}

// ─── Extended return shape for computeCompositeFromDimensions ────────────────

/**
 * Extended return shape for computeCompositeFromDimensions.
 * The extra fields (baseComposite, stdDev, consistencyMult, weaknessFactor,
 * weakDims, hasHarm, integrationPremium) are additive — callers that only
 * destructure { composite, band } are unaffected.
 */
export interface CompositeBreakdown {
  composite: number;
  band: string;
  baseComposite: number;
  integrationPremium: number;
  stdDev: number;
  consistencyMult: number;
  weaknessFactor: number;
  weakDims: number;
  hasHarm: boolean;
}

// ─── Public entry point 2: dimension scores → composite + band ───────────────

/**
 * Compute composite score and band directly from the 8 already-averaged
 * dimension scores (AWR, EMP, ACT, EQU, BND, ACC, SYS, INT → 0-5 each).
 *
 * Mirrors the math in calcScores exactly, but skips the subdim→dim averaging
 * step since the input is dimension-level scores, not subdimension scores.
 *
 * Harm check: a dimension score of exactly 0 is treated as a harm flag and
 * disables the integration premium (same semantics as a subdim=0 in calcScores).
 *
 * Return is additive — existing callers destructuring only { composite, band }
 * are unaffected by the added breakdown fields.
 */
export function computeCompositeFromDimensions(
  dimScores: Record<string, number>,
): CompositeBreakdown {
  const dimVals = DIM_CODES.map((c) => dimScores[c] ?? 1);

  const core = compositeCore(dimVals);

  return {
    composite: core.final,
    band: getBand(core.final),
    baseComposite: Math.round(core.baseComposite * 10) / 10,
    integrationPremium: Math.round(core.integrationPremium * 10) / 10,
    stdDev: Math.round(core.stdDev * 100) / 100,
    consistencyMult: core.consistencyMult,
    weaknessFactor: Math.round(core.weaknessFactor * 100) / 100,
    weakDims: core.weakDims,
    hasHarm: core.hasHarm,
  };
}

// ─── Strict entry point: dimension scores → composite + band ────────────────

/**
 * computeCompositeFromDimensionsStrict — STRICT variant of
 * computeCompositeFromDimensions. Asserts that all 8 dimension codes are
 * present (throwing IncompleteScoreError naming any that are missing), then
 * delegates to the lenient function. For already-complete input the result
 * is byte-identical to computeCompositeFromDimensions.
 *
 * Use this — not the lenient function — for any path that persists or
 * publishes a composite score attributed to a specific, named entity. The
 * lenient function's `?? 1` default would otherwise silently misrepresent an
 * unmeasured dimension as "found to be in active harm" (band: Critical).
 */
export function computeCompositeFromDimensionsStrict(
  dimScores: Record<string, number>,
): CompositeBreakdown {
  assertComplete(dimScores, "dimension");
  return computeCompositeFromDimensions(dimScores);
}

export function getBand(score: number) {
  if (score <= 20) return "Critical";
  if (score <= 40) return "Developing";
  if (score <= 60) return "Functional";
  if (score <= 80) return "Established";
  return "Exemplary";
}

export function getBandColor(band: string) {
  const map: Record<string, string> = {
    Critical: "#f87171",
    Developing: "#fb923c",
    Functional: "#fcd34d",
    Established: "#86efac",
    Exemplary: "#7dd3fc",
  };
  return map[band] ?? "#7dd3fc";
}
