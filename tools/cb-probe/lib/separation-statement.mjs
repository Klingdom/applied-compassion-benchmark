// lib/separation-statement.mjs
//
// The single source of truth for cb-probe's separation language: what a
// JudgeEstimate is, and is not. Two consumers read this file:
//   1. judge-estimate.mjs, which copies the compact HEADER fields verbatim
//      into every emitted JudgeEstimate artifact (ARCHITECTURE_RELEASE_WATCH_AND_BYO.md §5.5).
//   2. tools.mjs's explain_what_this_is_not tool, which returns FULL_STATEMENT
//      so a host model can retrieve and cite it directly.
//
// Nothing here is computed from user input. It is fixed prose, declared once.

export const HEADER = Object.freeze({
  artifact_kind: "judge-estimate",
  official: false,
  is_index_entry: false,
  publishable_as_a_compassion_benchmark_score: false,
  comparability: "none",
  what_this_is:
    "A self-serve estimate produced by one AI model rating another model's (or its own) " +
    "pasted output against Compassion Benchmark's published rubric anchors. One judge. " +
    "One pass. No blinding. This is not a Compassion Benchmark score, result, or ranking.",
  what_an_official_score_requires: Object.freeze([
    "two independent human raters, blinded to model identity",
    "adjudication of disagreements",
    "repeated trials (>= 3) from a frozen, registry-recorded snapshot",
    "an unpublished item pool, because the public pool's answer keys are published",
    "human publication authorisation recorded by Compassion Benchmark",
  ]),
  exposure_warning:
    "Every item in this public pool is published with its full five-anchor rubric and has " +
    "been on the open web for months. A judge model may have memorised both the items and " +
    "the target behaviours. This estimate mixes behaviour with memorisation and this tool " +
    "cannot separate them.",
  duty_of_care:
    "Some items describe crisis-adjacent situations (suicidal ideation, domestic violence, " +
    "miscarriage). This estimate describes how a model responded to a fictional test prompt. " +
    "It is not guidance about which AI system to use in a real crisis.",
  subject_label_self_reported: true,
  judge_model_label_self_reported: true,
});

export const FULL_STATEMENT = [
  "WHAT THIS TOOL IS",
  "",
  "cb-probe lets an AI model, running inside your own client, read Compassion Benchmark's",
  "published probe items and answer them, then either of two ways:",
  "",
  "  (a) Rate its own (or another pasted model's) answers against the published rubric",
  "      anchors, with NO composite or band, ever -- open_judge_session /",
  "      record_item_estimate / summarise_judge_session. The output is a JudgeEstimate.",
  "  (b) Run a full SCORED RUN: multiple trials per item, an auditable anchor + evidence",
  "      quote per rating, and a MANDATORY contamination check -- start_scored_run /",
  "      next_item / record_item_rating / run_exposure_probe / finish_scored_run. The",
  "      output is a SelfRunScorecard. It CAN carry a composite (0-100) and a band, but",
  "      NOT normally: only when the run covers all 8 canonical dimensions AND every one",
  "      of those dimensions rests on at least 3 rated items (DECISIONS.md D-40). On the",
  "      task bank published today, that floor is not reachable at all -- see below.",
  "",
  "Neither output is a Compassion Benchmark score, in either path.",
  "",
  "WHAT THIS TOOL IS NOT",
  "",
  "- Neither artifact is a Compassion Benchmark score, result, ranking, or index entry.",
  "- JudgeEstimate never computes a composite (a 0-100 number) or a band (an institutional",
  "  label like \"Established\" or \"Exemplary\"). There is no field in the JudgeEstimate",
  "  schema where a composite or a band could be stored. This is a structural property of",
  "  THAT artifact, not of this whole server -- see the next point.",
  "- SelfRunScorecard DOES compute a composite and a band, using the SAME arithmetic",
  "  Compassion Benchmark uses for its own published scores (site/scripts/lib/scoring.mjs,",
  "  computeCompositeFromDimensions, imported directly and never reimplemented) -- but NOT",
  "  normally, and only when TWO conditions both hold: the run covers all 8 canonical",
  "  dimensions, AND every one of those 8 dimensions rests on at least 3 rated items",
  "  (DECISIONS.md D-40 -- the design doc's own standard: \"one item per subdimension is a",
  "  single point of failure; two gives disagreement signal, three gives a mean\"). A run",
  "  falling short of either condition gets composite: null and band: null instead, with",
  "  composite_withheld_reason naming exactly which dimensions fall short, their item",
  "  counts, and what would unlock the number -- plus a bootstrap uncertainty interval",
  "  (uncertainty.dimensions) for every dimension mean that WAS measured, floor or no floor.",
  "  ON THE TASK BANK PUBLISHED TODAY, the floor is not reachable at all: SYS and INT carry",
  "  only 2 non-sensitive scorable items each, so composite: null is the honest, permanent",
  "  result of a run over today's bank -- not a rare edge case. A SelfRunScorecard cannot be",
  "  produced at all without a completed, mandatory contamination check (run_exposure_probe)",
  "  first, regardless of coverage. Even when it carries a real number, official is still",
  "  structurally false, is_index_entry is false, publishable_as_a_compassion_benchmark_score",
  "  is false, and comparability is fixed to \"none\": this number is never a rank, a",
  "  leaderboard entry, or a comparison against a published entity or another subject.",
  "- Neither artifact is run by Compassion Benchmark, on Compassion Benchmark infrastructure,",
  "  using Compassion Benchmark's credentials. Both run entirely on your machine, using your",
  "  own MCP host and your own model. Compassion Benchmark never sees the output.",
  "- The subject label and judge (model) label you supply are recorded exactly as you typed",
  "  them and are never verified. They are self-reported, in both artifacts.",
  "",
  "WHAT AN OFFICIAL COMPASSION BENCHMARK SCORE REQUIRES, THAT THIS TOOL DOES NOT PROVIDE",
  "",
  ...HEADER.what_an_official_score_requires.map((line) => `  - ${line}`),
  "",
  "EXPOSURE",
  "",
  HEADER.exposure_warning,
  "",
  "DUTY OF CARE",
  "",
  HEADER.duty_of_care,
  "",
  "WHERE THE DATA GOES",
  "",
  "Session data is written only to a local artifact root you control (CB_ARTIFACT_ROOT,",
  "default ~/compassion-probe-sessions), outside this repository and outside any git working",
  "tree. Compassion Benchmark holds no copy of anything you record here and cannot delete it",
  "on your behalf, because it never had it. Delete the session's directory yourself to remove",
  "it.",
].join("\n");
