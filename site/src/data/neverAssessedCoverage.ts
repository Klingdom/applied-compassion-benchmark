/**
 * neverAssessedCoverage.ts — GENERATED, do not hand-edit.
 *
 * Source: research/rotation-state.json, as read by
 * research/scripts/generate-methodology-coverage-data.mjs (which reuses the
 * exact same buildCoverageReport() computation as
 * research/scripts/coverage-report.mjs, so this figure and the committed
 * research/coverage/<date>.{md,json} report can never silently disagree).
 *
 * Regenerate with:
 *   node research/scripts/generate-methodology-coverage-data.mjs [YYYY-MM-DD]
 *
 * Report date this snapshot reflects: 2026-09-16
 *
 * Definition: "never individually assessed" means `last_assessed` is
 * `null` for that entity in research/rotation-state.json — its published
 * score is an inherited starting value, not a measurement. See
 * site/src/app/methodology/page.tsx for the full public explanation.
 */

export const NEVER_ASSESSED_COVERAGE = {
  /** The date research/rotation-state.json was read as of, YYYY-MM-DD. */
  reportDate: "2026-09-16",
  /** Total entities tracked in research/rotation-state.json as of reportDate. */
  totalTrackedEntities: 1329,
  /** Entities with last_assessed === null as of reportDate. */
  neverAssessedCount: 811,
  /** neverAssessedCount / totalTrackedEntities, formatted (e.g. "61.0%"). */
  neverAssessedShareFormatted: "61.0%",
} as const;
