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

// ─── Public entry point 1: subdimension scores → final composite ─────────────

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
  const DIM_CODES = ["AWR", "EMP", "ACT", "EQU", "BND", "ACC", "SYS", "INT"];
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
