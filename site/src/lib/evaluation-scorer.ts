/**
 * evaluation-scorer.ts — Pure aggregation logic for the AI Evaluation Suite's
 * client-side scoring tool.
 *
 * This module does NOT implement its own composite-scoring math. It imports
 * `computeCompositeFromDimensions` from `@/lib/scoring` — the same canonical
 * function used by the published Model Index, the self-assessment tool, and
 * every validator in `site/scripts/`. This module's only job is to turn
 * per-prompt 1-5 scores into the 8-dimension vector that function expects,
 * and to decide what a partial run yields.
 *
 * Unscored-item policy (explicit, not silent):
 *   - A dimension with zero scored, non-draft items has no average (`null`),
 *     not a fabricated 1 or 0. `evaluateComposite` will NOT compute a
 *     composite until every one of the 8 dimensions has at least one scored
 *     item — see `status: "incomplete"`.
 *   - Once all 8 dimensions have >=1 scored item, the composite IS computed
 *     from whatever has been scored so far. If fewer than all scorable items
 *     have been scored, `status` is `"partial"` and callers must display the
 *     scored/total count alongside the score — never present it as final.
 *   - Draft items (`draft: true`, unfilled template placeholders) are
 *     excluded from the scorable denominator entirely. They cannot be scored
 *     through this module's aggregation and never silently count as zero or
 *     as complete.
 */

import { computeCompositeFromDimensions } from "@/lib/scoring";

export const DIMENSION_CODES = [
  "AWR",
  "EMP",
  "ACT",
  "EQU",
  "BND",
  "ACC",
  "SYS",
  "INT",
] as const;

export type DimensionCode = (typeof DIMENSION_CODES)[number];

/** Minimal shape this module needs from a prompt/task-bank item. */
export interface EvalPromptMeta {
  id: string;
  dim: string;
  draft: boolean;
}

/** Per-item score state held by the scoring UI. */
export interface ItemScoreState {
  score: number | null;
  notes: string;
}

export type ScoreMap = Record<string, ItemScoreState>;

export interface DimensionAggregate {
  code: string;
  /** Average of scored, non-draft items in this dimension (0 if none scored). */
  avg: number | null;
  scoredCount: number;
  scorableCount: number;
  draftCount: number;
}

export type CompositeStatus = "incomplete" | "partial" | "complete";

export interface EvaluationResult {
  status: CompositeStatus;
  composite: number | null;
  band: string | null;
  integrationPremium: number | null;
  dimAggregates: DimensionAggregate[];
  /** The exact 8-key record passed to computeCompositeFromDimensions, or null if incomplete. */
  dimScoresForComposite: Record<string, number> | null;
  /** Dimension codes with zero scored, non-draft items — composite is blocked until empty. */
  missingDimensions: string[];
  scoredScorableCount: number;
  scorableTotal: number;
  draftTotal: number;
}

function isScored(score: number | null | undefined): score is number {
  return typeof score === "number" && score >= 1 && score <= 5;
}

export function aggregateDimension(
  code: string,
  items: EvalPromptMeta[],
  scores: ScoreMap,
): DimensionAggregate {
  const dimItems = items.filter((p) => p.dim === code);
  const scorable = dimItems.filter((p) => !p.draft);
  const draftCount = dimItems.length - scorable.length;
  const scoredScorable = scorable.filter((p) => isScored(scores[p.id]?.score));

  const avg =
    scoredScorable.length > 0
      ? scoredScorable.reduce((sum, p) => sum + (scores[p.id].score as number), 0) /
        scoredScorable.length
      : null;

  return {
    code,
    avg,
    scoredCount: scoredScorable.length,
    scorableCount: scorable.length,
    draftCount,
  };
}

/**
 * Aggregates per-item scores into the 8-dimension vector and, if every
 * dimension has at least one scored item, runs the canonical composite
 * formula. Never fabricates a score for an unscored dimension.
 */
export function evaluateComposite(
  items: EvalPromptMeta[],
  scores: ScoreMap,
): EvaluationResult {
  const dimAggregates = DIMENSION_CODES.map((code) => aggregateDimension(code, items, scores));
  const missingDimensions = dimAggregates.filter((d) => d.avg === null).map((d) => d.code);
  const scorableTotal = items.filter((p) => !p.draft).length;
  const draftTotal = items.filter((p) => p.draft).length;
  const scoredScorableCount = dimAggregates.reduce((sum, d) => sum + d.scoredCount, 0);

  if (missingDimensions.length > 0) {
    return {
      status: "incomplete",
      composite: null,
      band: null,
      integrationPremium: null,
      dimAggregates,
      dimScoresForComposite: null,
      missingDimensions,
      scoredScorableCount,
      scorableTotal,
      draftTotal,
    };
  }

  const dimScoresForComposite: Record<string, number> = {};
  dimAggregates.forEach((d) => {
    dimScoresForComposite[d.code] = d.avg as number;
  });

  const { composite, band, integrationPremium } = computeCompositeFromDimensions(
    dimScoresForComposite,
  );

  const status: CompositeStatus =
    scoredScorableCount === scorableTotal ? "complete" : "partial";

  return {
    status,
    composite,
    band,
    integrationPremium,
    dimAggregates,
    dimScoresForComposite,
    missingDimensions: [],
    scoredScorableCount,
    scorableTotal,
    draftTotal,
  };
}
