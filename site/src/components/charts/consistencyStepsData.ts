/**
 * consistencyStepsData.ts — shared consistency-step data.
 *
 * Single source consumed by ConsistencyStepChart.tsx, IntegrationPremiumDiagram.tsx,
 * and scripts/test-method-claims.mjs so the published chart data and the
 * mechanical drift gate can never disagree.
 *
 * Formula context (scoring.mjs / scoring.ts computeCompositeFromDimensions):
 * consistencyMult is bucketed by σ, the standard deviation across the 8
 * dimension scores (each bounded 0–5):
 *   σ ≤ 1.5        → 1.0
 *   1.5 < σ ≤ 3.0   → 0.75
 *   3.0 < σ ≤ 5.0   → 0.4
 *   σ > 5.0         → 0.1
 *
 * With 8 values each bounded to [0, 5], the maximum possible σ is 2.5 —
 * achieved only by an even split of four dimensions at 0 and four at 5
 * (mean 2.5, each deviation 2.5, variance 6.25, σ = 2.5). That means the
 * bottom two buckets (3.0–5.0 → 0.4, and above 5.0 → 0.1) are part of the
 * formula's code but can never be triggered by a real 8-dimension, 0–5
 * profile. We keep all four documented steps below (so a reader who
 * remembers the old chart can see exactly what changed) but mark the
 * unreachable ones explicitly rather than silently dropping them.
 */

/** Maximum σ achievable across 8 dimension scores each bounded [0, 5]. */
export const MAX_ACHIEVABLE_STD_DEV = 2.5;

export interface ConsistencyStep {
  /** Display label for the σ band. */
  label: string;
  /** Exclusive lower bound of this σ band (0 for the first step). */
  lowerBound: number;
  /** Consistency multiplier for this band, expressed as a percentage. */
  factor: number;
  color: string;
  /** False when lowerBound exceeds MAX_ACHIEVABLE_STD_DEV — i.e. this step's
   *  condition can never be satisfied by a real 8-dimension, 0–5 profile. */
  reachable: boolean;
}

export const STEPS: ConsistencyStep[] = [
  { label: "σ ≤ 1.5", lowerBound: 0, factor: 100, color: "#7dd3fc", reachable: true },
  { label: "σ 1.5–3.0", lowerBound: 1.5, factor: 75, color: "#86efac", reachable: true },
  { label: "σ 3.0–5.0", lowerBound: 3.0, factor: 40, color: "#fcd34d", reachable: false },
  { label: "σ > 5.0", lowerBound: 5.0, factor: 10, color: "#fb923c", reachable: false },
];
