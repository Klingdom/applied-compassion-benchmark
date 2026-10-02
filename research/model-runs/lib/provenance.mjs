// research/model-runs/lib/provenance.mjs
//
// The scorecard schema is a closed allow-list (validate-scorecard.mjs): no top-level key, provenance key
// or trial key may be added, and the harness must not change scoring semantics. The only free-text
// provenance fields the schema admits are provenance.subject_label and provenance.judge_label, so the
// pilot's provenance note is carried in those two strings. The same facts are also written, structured,
// to the per-subject assembly audit file next to each scorecard.

import { ACCESS_TIER, JUDGES_PER_RESPONSE } from "./common.mjs";

export function subjectProvenanceLabel(subject, runId) {
  return (
    `${subject} (access tier: ${ACCESS_TIER} -- Claude Code subagent; model snapshot id unverifiable; ` +
    `blinded cross-model pilot ${runId})`
  );
}

/** Run-level judge label. Row-level judge_label values stay the plain model labels. */
export function panelProvenanceLabel() {
  return (
    `panel: ${JUDGES_PER_RESPONSE} judges per response drawn from the other pilot models, never the subject; ` +
    "judges are same-family (all Claude) as the subject and LLM-only, no human raters; " +
    "item pool is publicly exposed (public-permanent bank, so subjects may have prior exposure); " +
    `access tier ${ACCESS_TIER}`
  );
}

export const PROVENANCE_REQUIRED_FRAGMENTS = Object.freeze([
  `access tier: ${ACCESS_TIER}`,
  "same-family",
  "publicly exposed",
  "no human raters",
]);

export function provenanceNote({ subject, runId, judges }) {
  return {
    access_tier: ACCESS_TIER,
    subject,
    snapshot_id: "unverifiable",
    judge_family_relation: `same-family (all Claude); judges are drawn from the other pilot models (${judges.join(", ")}), never the subject`,
    judges_per_response: JUDGES_PER_RESPONSE,
    judge_models: judges,
    public_pool_exposure: "all items and full rubrics are published (exposureStatus public-permanent)",
    human_raters: "none",
    blinded: "subject saw prompts only; judges saw prompt, rubric and an anonymised response only",
    official: false,
    run_id: runId,
    scorer_representation_caveat:
      "cb-probe has no per-response panel. Each (response, judge) rating is recorded as one scorer trial, so " +
      "provenance.trials_per_item = trials x judges and uncertainty.* treats the two judges' ratings of one " +
      "response as independent trials. Intervals are therefore narrower than a response-clustered interval, " +
      "and trial_stats mixes sampling variance with judge disagreement. judge_panel.per_item compares judges " +
      "that each rated a different two-thirds of a subject's responses. See the sibling audit file for the " +
      "response-level mapping and paired agreement.",
  };
}
