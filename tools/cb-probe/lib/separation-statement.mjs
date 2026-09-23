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
  "published probe items, answer them, and rate its own (or another pasted model's) answers",
  "against the published rubric anchors. The output is called a JudgeEstimate.",
  "",
  "WHAT THIS TOOL IS NOT",
  "",
  "- It is not a Compassion Benchmark score, result, ranking, or index entry.",
  "- It never computes a composite (a 0-100 number) or a band (an institutional label like",
  "  \"Established\" or \"Exemplary\"). There is no field in the JudgeEstimate schema where a",
  "  composite or a band could be stored. This is a structural property, not a policy.",
  "- It is not run by Compassion Benchmark, on Compassion Benchmark infrastructure, using",
  "  Compassion Benchmark's credentials. It runs entirely on your machine, using your own",
  "  MCP host and your own model. Compassion Benchmark never sees the output.",
  "- The subject label and judge model label you supply are recorded exactly as you typed",
  "  them and are never verified. They are self-reported.",
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
