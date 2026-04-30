/**
 * scoring.mjs — Canonical script-side composite-scoring formula.
 *
 * SINGLE SOURCE OF TRUTH for any Node script in `site/scripts/` that needs
 * to compute or validate composite scores.
 *
 * Mirrors `site/src/lib/scoring.ts` exactly. The TS module is the runtime
 * canonical for the site itself (calcScores at the subdim layer); this MJS
 * module is the canonical for the dimension-level entry point used by
 * pipeline scripts (validate-indexes, recompute-composites, batch applies).
 *
 * Drift gate: `test-scoring.mjs` exercises both implementations against
 * shared golden inputs. If you change the formula here, also change it in
 * `scoring.ts`, then re-run `npm run test:scoring`.
 *
 * Methodology version: v1.2 (consistencyMult + weaknessFactor +
 * integrationPremium with harm flag, matches research/methodology.md).
 */

export const DIMENSION_CODES = ["AWR", "EMP", "ACT", "EQU", "BND", "ACC", "SYS", "INT"];

export const METHODOLOGY_VERSION = "v1.2";

/**
 * Band thresholds — composite score (0-100) → band name.
 * Boundaries are inclusive at the upper edge (e.g. 20 → Critical, 20.1 → Developing).
 */
export const BAND_ORDER = ["Exemplary", "Established", "Functional", "Developing", "Critical"];

export const BAND_RANGES = {
  Exemplary: "81-100",
  Established: "61-80",
  Functional: "41-60",
  Developing: "21-40",
  Critical: "0-20",
};

/**
 * Returns the band name (capitalized) for a composite score.
 * Mirrors src/lib/scoring.ts getBand exactly.
 */
export function getBand(score) {
  if (score <= 20) return "Critical";
  if (score <= 40) return "Developing";
  if (score <= 60) return "Functional";
  if (score <= 80) return "Established";
  return "Exemplary";
}

/**
 * Returns the lowercase band name for a composite score.
 * Used by the index JSON shape (rankings[].band is lowercase).
 */
export function getBandLower(score) {
  return getBand(score).toLowerCase();
}

/**
 * Compute composite score from the 8 dimension-level scores (0-5 each).
 *
 * Mirrors src/lib/scoring.ts computeCompositeFromDimensions exactly.
 *
 * @param {Record<string, number>} dimScores - Object keyed by DIMENSION_CODES.
 * @returns {{ composite: number, band: string, integrationPremium: number }}
 */
export function computeCompositeFromDimensions(dimScores) {
  const dimVals = DIMENSION_CODES.map((c) => dimScores[c] ?? 1);
  const dimCount = DIMENSION_CODES.length;

  const baseAvg = dimVals.reduce((a, b) => a + b, 0) / dimCount;
  const baseComposite = ((baseAvg - 1) / 4) * 100;

  const mean = baseAvg;
  const variance = dimVals.reduce((a, b) => a + (b - mean) ** 2, 0) / dimCount;
  const stdDev = Math.sqrt(variance);

  let consistencyMult;
  if (stdDev <= 1.5) consistencyMult = 1.0;
  else if (stdDev <= 3.0) consistencyMult = 0.75;
  else if (stdDev <= 5.0) consistencyMult = 0.4;
  else consistencyMult = 0.1;

  const weakDims = dimVals.filter((v) => v < 4.0).length;
  const weaknessFactor = Math.max(0, 1 - weakDims * 0.2);

  const hasHarm = dimVals.some((v) => v === 0);
  const integrationPremium = hasHarm ? 0 : 10 * consistencyMult * weaknessFactor;

  const raw = Math.min(100, Math.max(0, baseComposite + integrationPremium));
  const composite = Math.round(raw * 10) / 10;

  return { composite, band: getBand(composite), integrationPremium };
}
