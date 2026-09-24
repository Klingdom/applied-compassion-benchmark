// lib/scorecard-header.mjs
//
// Fixed header fields for the SelfRunScorecard artifact
// (docs/MCP_SCORED_RUN_DESIGN_2026-09-20.md §3, resolving AMB-B). Unlike
// JudgeEstimate's HEADER (separation-statement.mjs), this artifact DOES
// carry a composite and a band -- the founder asked for a number, twice, and
// the design this implements resolves the open question in the "emit it,
// make it impossible to mistake for ours" direction.
//
// The guarantee here is not "no number". It is "a number that can never be
// mistaken for an official one": `official` is structurally false (see
// lib/self-run-scorecard.mjs -- no code path accepts it as an input),
// `comparability` is structurally "none", `is_index_entry` and
// `publishable_as_a_compassion_benchmark_score` are structurally false, and
// `header_statement` is a fixed, immutable line every scorecard must carry
// unchanged (checked verbatim by lib/validate-scorecard.mjs).

import { HEADER as JUDGE_HEADER } from "./separation-statement.mjs";

export const HEADER_STATEMENT_TEXT = "This is a self-run estimate, not a Compassion Benchmark score.";

export const SELF_RUN_HEADER = Object.freeze({
  artifact_kind: "self-run-scorecard",
  official: false,
  is_index_entry: false,
  publishable_as_a_compassion_benchmark_score: false,
  comparability: "none",
  header_statement: HEADER_STATEMENT_TEXT,
  what_this_is:
    "A self-run estimate produced by one AI model (running inside your own MCP host, using your " +
    "own credential) answering Compassion Benchmark's published probe items and rating the " +
    "responses against the published rubric anchors. Dimension means (one per canonical dimension " +
    "that had at least one rated item) are always reported, each with a bootstrap uncertainty " +
    "interval. A composite and band are computed using the SAME arithmetic Compassion Benchmark " +
    "uses for its own published scores (site/scripts/lib/scoring.mjs, " +
    "computeCompositeFromDimensions -- imported directly, never reimplemented) ONLY when all 8 " +
    "dimensions were measured AND every one of them rests on at least 3 rated items " +
    "(DECISIONS.md D-40) -- otherwise composite and band are null and composite_withheld_reason " +
    "explains exactly why. This is NOT the normal case: on the task bank published today, that " +
    "floor is not reachable at all (see composite_withheld_reason on any real run). Same maths " +
    "when a composite IS present, unofficial status always: a different formula would be more " +
    "confusing, not more honest, because it would teach a wrong mental model of what the benchmark " +
    "measures. This is still not an official Compassion Benchmark score, result, ranking, or index " +
    "entry -- see official, is_index_entry, publishable_as_a_compassion_benchmark_score, and " +
    "comparability, all structurally fixed and asserted by the validator this artifact is built " +
    "against.",
  what_an_official_score_requires: JUDGE_HEADER.what_an_official_score_requires,
  exposure_warning:
    JUDGE_HEADER.exposure_warning +
    " A scorecard cannot be emitted without a completed exposure probe (see the contamination field " +
    "below) precisely because of this risk -- finish_scored_run refuses until run_exposure_probe has run.",
  duty_of_care: JUDGE_HEADER.duty_of_care,
});
