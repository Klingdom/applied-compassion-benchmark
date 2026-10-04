/**
 * model-report-template.mjs -- the fixed structure and copy rules of a wave
 * report, transcribed from docs/AI_MODEL_ASSESSMENT_TEMPLATE.md (binding).
 *
 *   B  fixed H2 sections, their order and budgets
 *   D  copy rules (banned lexicon, allowed phrasings, required sentences)
 *
 * No figure of any wave appears here. Everything that depends on a wave is
 * read from the wave file by model-report.mjs. Must-say phrases are
 * deliberately liberal regular expressions: they check that a required idea is
 * present, not that one particular wording was used.
 */

import { judgePairing } from "./model-wave.mjs";

export const WORD_MIN = 2700;
export const WORD_MAX = 3300;
export const LIT_MAX = 5;

/** Fixed H2s, in order (template B). `title` is compared after normalisation (letters and digits only). */
// Amendment 2026-10-01 #1: the care section is FIRST, before any model name (the status banner is page chrome, not a section).
export const SECTIONS = [
  { id: "duty-of-care", title: "Duty of care and content note", budget: 70 },
  { id: "status", title: "Status and verdict", budget: 150 },
  { id: "may-say", title: "May say / may not say", budget: 250 },
  { id: "why-pilot", title: "Why an unofficial pilot", budget: 150 },
  { id: "design", title: "Design", budget: 300 },
  { id: "separation", title: "Separation", budget: 350 },
  { id: "separated-model", title: "Separated model and reply length", budget: 350 },
  { id: "dimensions", title: "Dimension ranges", budget: 250 },
  { id: "instrument-health", title: "Instrument health", budget: 300 },
  { id: "deviations", title: "Deviations and what went wrong", budget: 250 },
  { id: "not-scores", title: "Why these are not scores", budget: 250 },
  { id: "publication-bar", title: "Publication bar and confound ledger", budget: 200 },
  { id: "next-wave", title: "Next wave must change", budget: 100 },
  { id: "cite", title: "Cite, record, corrections", budget: 150 },
];

export const normTitle = (s) => s.toLowerCase().replace(/^\s*\d+\s*[.)]\s*/, "").replace(/[^a-z0-9]/g, "");

/**
 * Template D, "Banned". Matched against resolved prose. `negatable` words may
 * appear in a sentence that negates them ("not a ranking", "not a leaderboard"),
 * which template E and F themselves use.
 */
export const BANNED = [
  { re: /\bbest\b/i, label: "best" },
  { re: /\bworst\b/i, label: "worst" },
  { re: /\btop\b/i, label: "top" },
  { re: /\bleads\b/i, label: "leads" },
  { re: /\bbeats?\b/i, label: "beats" },
  { re: /\boutperform(?:s|ed|ing)?\b/i, label: "outperforms" },
  { re: /\bwins?\b|\bwon\b/i, label: "wins" },
  { re: /#1\b/, label: "#1" },
  { re: /\btied\b/i, label: "tied" },
  { re: /\bahead\b/i, label: "ahead" },
  { re: /\bbehind\b/i, label: "behind" },
  { re: /\b(?:most|least) compassionate\b/i, label: "most/least compassionate" },
  { re: /\bleaderboards?\b/i, label: "leaderboard", negatable: true },
  { re: /\brank(?:s|ed|ing|ings)?\b/i, label: "rank", negatable: true },
  { re: /\bclean\b/i, label: "clean (contamination)" },
  { re: /\bcleared\b/i, label: "cleared (contamination)" },
];

/** Band labels are composite labels; they never attach to a model (template A). Case-sensitive. */
export const BAND_NAMES = ["Exemplary", "Established", "Functional", "Developing", "Critical"];

/** "Weaker/worse" only inside an approved qualifier: a sentence that carries the confound. */
export const WEAKER_RE = /\b(?:weaker|worse)\b/i;
export const QUALIFIER_RE = /reply length|confound|unresolved/i;

/** Comparative words that order two things. Adjacent to a model name they need a separated pair. */
export const DIRECTIONAL_RE = /\b(?:higher|lower|above|below|weaker|worse|stronger|better|greater)\b/i;

export const NEGATOR_RE = /\b(?:not|no|never|nor|cannot|without|neither)\b|n't\b/i;

/** Endorsement language next to a model name (template D pre-empted headlines, QA G7). */
export const ENDORSE_RE = /\b(?:safe|safer|safest|recommend\w*|trust\w*|reliable|should (?:use|choose|pick))\b/i;

/** Call-to-action vocabulary that must not appear in the duty-of-care section (template H). */
export const CTA_RE = /\b(?:subscribe|sign up|newsletter|buy|purchase|pricing|price|download|gumroad|contact sales|donate|support us|share)\b/i;

/** Required sentence, section 14. */
export const NO_DEVELOPER_SENTENCE =
  "No developer was contacted before publication. No developer paid, sponsored or reviewed this report.";

/** Words that count as a spelled-out number in "the other three". */
export const NUMBER_WORDS = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10 };

/**
 * Per-section must-say predicates (template B, "Must say"). Each is
 * { label, test(sectionText) }. `text` is the resolved section body.
 * Rules needing tokens use `has` over the section's token paths.
 */
const all = (...res) => (t) => res.every((r) => r.test(t));

/**
 * Wave-conditional predicates. A must-say may carry `when(wave)`: it is required only for waves where it is true. This is
 * how one template serves a wave whose judges share the subjects' family (the first pilot) and one whose judges do not.
 * `judgesShareFamily` is true unless the wave PROVES the families disjoint (wave.judge_set), so a wave without that
 * evidence is held to the stricter circularity statement.
 */
export const judgesShareFamily = (w) => !(w.judge_set && w.judge_set.families_disjoint === true);
export const judgesCrossFamily = (w) => !judgesShareFamily(w);
export const agentTier = (w) => /^agent\b/i.test(w.design?.access_tier ?? "");
export const localOpenWeightTier = (w) => /^local-open-weight\b/i.test(w.design?.access_tier ?? "");
export const hasSeparatedSubject = (w) => (w.derived?.separated_subjects ?? []).length > 0;
// Arms waves (template amendment 16): every subject is a (build, arm) variant; the display rule is derived.display_rule.
export const armsWave = (w) => w.derived?.display_rule !== undefined;
export const hasIneffectiveLength = (w) => armsWave(w) && (w.length_check?.per_build ?? []).some((r) => r.length_instruction === "ineffective");
export const hasEffectiveLength = (w) => armsWave(w) && (w.length_check?.per_build ?? []).some((r) => r.length_instruction === "effective");
export const armsWithBridge = (w) => armsWave(w) && w.bridge_drift !== undefined;
export const armsWithDeviation = (w) => armsWave(w) && (w.deviations ?? []).length > 0;
export const armsWithValidity = (w) => armsWave(w) && w.judge_validity?.reported_as_headline === "measured_on_original_answers";
const CROSS_FAMILY_RE = /cross-?family|different (?:model )?famil|not (?:in |from )?the same famil|outside (?:the |their )?(?:models'? |subjects'? )?famil|no (?:judge|subject) (?:is|was) (?:in|from) the (?:same|other)/i;

export const MUST_SAY = {
  // Amendment 2026-10-01 #1: no token, number or model name may sit here (R-crisis-adjacency), so these are plain statements.
  "duty-of-care": [
    { label: "state that crisis-content items were not served", test: all(/crisis/i, /\bnot served\b|\bwere not (?:served|asked|used|run|given|included)\b|\bwere withheld\b|\bwere left out\b|\bwere excluded\b/i) },
    { label: "state that the report says nothing about how any model responds to a crisis", test: all(/crisis/i, /\bsays nothing\b|\bsay nothing\b|\bnothing about\b|\bdoes not (?:say|tell|show|measure|test|speak)\b|\bno (?:finding|claim|evidence)\b/i, /respon/i) },
  ],
  status: [
    { label: "says it is unofficial", test: all(/unofficial/i) },
    { label: "says it is not a score", test: all(/not (?:a |an )?(?:compassion benchmark )?scores?\b|no (?:official )?scores?\b/i) },
    { label: "says the judges are the same family as the subjects (circularity)", test: all(/same[- ]family|one family|same developer|one developer|circular|each other's/i), when: judgesShareFamily },
    { label: "says the judges come from a different model family than the models tested", test: all(CROSS_FAMILY_RE), when: judgesCrossFamily },
    { label: "says no developer was contacted or is paying", test: all(/no developer/i, /contacted|paid|paying|sponsor/i) },
    { label: "says the larger group is not separated", test: all(/not separated|cannot (?:tell|separate|order|say)|could not (?:tell|separate)|(?:could|can) ?not be told apart|does not separate/i) },
    { label: "says every build ran in two arms, with and without a length instruction", test: all(/\barms?\b/i, /length instruction|reply in about|reply length instruction/i), when: armsWave },
  ],
  design: [
    { label: "says the rubric was unseen by the judged models", test: all(/rubric/i) },
    { label: "says no model judged itself", test: all(/self-judg|no model (?:judged|graded|rated)|never (?:judged|graded|rated) (?:its|their) own|judged its own|own replies/i) },
    // Resolved text: "{{design.judges_per_response|n0}} judges" reads "2 judges".
    { label: "says two judges rated each reply", test: all(/\b(?:two|2) judges\b/i) },
    { label: "says the item pool is public", test: all(/public/i) },
    { label: "says the bank was authored with same-family help", test: all(/(?:author|draft|written|wrote)/i, /same[- ]family|claude/i) },
    { label: "says the interval covers item resampling only (the luck of which items were asked)", test: all(/resampl|re-?draw|which items/i, /\bonly\b|one source/i) },
    { label: "says snapshots are unpinned", test: all(/snapshot/i, /unpinned|not pinned|unverif|cannot be (?:pinned|verified)/i), when: (w) => !localOpenWeightTier(w) },
    // A local build is pinned by digest, so "snapshots are unpinned" would be false; what must be said instead is that results describe these quantised builds.
    { label: "says the builds are pinned by digest and that results describe these quantised builds, not the full-precision models", test: all(/digest|pinned/i, /quantis/i, /full[- ]precision|these builds|this build|those builds/i), when: localOpenWeightTier },
    // Arms waves (amendment 16): the explicit system message and where each template puts it, and what arm B lacks.
    { label: "says the system message is explicit and the same within an arm, and that where it sits differs by build template (a build's own format, disclosed, not controlled)", test: all(/system message/i, /template/i, /\bplace|\bplaces\b|\bfold|\bsits?\b|\bposition/i, /differ|vary|varies/i), when: armsWave },
    { label: "says arm B has one trial per item and no server scorecard (the cb-probe server needs more trials; its composites are computed from the same ratings)", test: all(/arm B/i, /one trial|a single trial|fewer trials/i, /(?:no|without|has none|not given|did not get)[^.]*scorecard/i), when: armsWave },
  ],
  separation: [
    { label: 'says "cannot tell, not equal"', test: all(/cannot tell|could not tell|cannot say which|can not tell/i, /not (?:the same as|equal)|is not equal|not the same/i) },
    // Amendment 16: both corrections are reported, neither promoted; the point display follows the stricter one.
    { label: "says the pre-registration reports an uncorrected and a Bonferroni-corrected result and promotes neither, and that the point display follows the corrected one (ranges only for the rest)", test: all(/bonferroni/i, /uncorrected|without (?:any )?correction/i, /multiple comparisons?/i, /ranges? only/i), when: armsWave },
    { label: "says arm B shows ranges only (one trial per item, secondary)", test: all(/arm B/i, /ranges? only/i, /secondary|one trial/i), when: armsWave },
    { label: "says whether the separation result repeats the second pilot's result for the same two builds (replication, descriptive only)", test: all(/replicat|repeat/i, /descriptive|no claim|not (?:a )?caus/i), when: (w) => armsWave(w) && w.replication !== undefined },
  ],
  "separated-model": [
    { label: "says the cause is unresolved", test: all(/unresolved/i) },
    { label: "says the bound is not an estimate", test: all(/not an estimate/i), when: hasSeparatedSubject },
    { label: "says the direction is consistent across judges", test: all(/consistent across (?:the )?(?:\w+ )?judges|every judge|each judge|all (?:three |\w+ )?judges/i), when: hasSeparatedSubject },
    // A wave in which every subject is in a not-separated group has no separated model: the section says so and still states the length confound.
    { label: "says no model was separated, so there is no separated model to report", test: all(/no model was separated|none of the (?:\w+ )?models (?:was|were) separated|did not separate (?:any|either|the) |could not separate (?:any|either|the)|no (?:separated )?model (?:was )?(?:separated|to report)/i), when: (w) => !hasSeparatedSubject(w) },
    // Pre-registration section 9, arms waves: whether each build's length instruction moved reply length toward its target decides what its B - A comparison can say.
    { label: "says which builds' length instruction was ineffective and that their B minus A comparison is uninformative about length (section 9)", test: all(/ineffective/i, /uninformative about length/i), when: hasIneffectiveLength },
    { label: "says which builds' length instruction was effective (arm B closer to the target) and that their B minus A difference is read with the length change in mind (section 9)", test: all(/\beffective\b|closer to (?:the )?target/i, /length change|read with|in mind/i), when: hasEffectiveLength },
  ],
  dimensions: [
    { label: "says how many items sit behind each dimension", test: all(/items/i) },
    { label: "says the Bonferroni flag is conservative", test: all(/bonferroni/i, /conservative/i) },
  ],
  "instrument-health": [
    { label: "says leniency is measured against the all-subject item mean", test: all(/leniency/i, /item mean/i) },
    { label: "says positives are partly artefact", test: all(/artefact|artifact/i) },
    { label: "says one fixed judge pair rated each subject", test: all(/fixed (?:judge )?pair|one (?:fixed )?judge pair/i), when: (w) => judgePairing(w) !== "rotating" },
    { label: "says the judges were paired in rotation (each subject's replies were spread over every judge pair)", test: all(/rotat|every (?:judge )?pair|each (?:judge )?pair|all (?:three |\w+ )?(?:judge )?pairs/i), when: (w) => judgePairing(w) === "rotating" },
    { label: "says contamination covers sampled items only", test: all(/sampled|probed/i, /only/i) },
    { label: "says contamination was probed once per build, through the cb-probe MCP server, and that arm B variants use their build's probe", test: all(/per build|each build|once for each build/i, /MCP|cb-probe/i), when: armsWave },
    { label: "says the bridge sample of first-pilot replies is descriptive (drift of the judges' ratings) and never enters a composite", test: all(/bridge/i, /drift/i, /descriptive|never enter/i), when: armsWithBridge },
  ],
  deviations: [
    { label: "tags a deviation post-hoc", test: all(/post-hoc/i) },
    { label: "tags a deviation pre-registered", test: all(/pre-registered/i) },
    { label: "says the recorded deviation (call order: one build ran last) changed call order only, and tags it as a departure after data existed", test: all(/call order|order of (?:the )?calls|ran last|run last/i, /only/i), when: armsWithDeviation },
    { label: "says the judge-validity figure measured on the original answers is the primary one (the conservative reading, before any requote)", test: all(/original/i, /primary|headline|conservative/i, /requote|before/i), when: armsWithValidity },
  ],
  "not-scores": [
    { label: "says the judges are the same family", test: all(/same[- ]family|same family/i), when: judgesShareFamily },
    { label: "says the judges come from a different model family than the models tested, and that the bank was still drafted with help from the judges' family", test: all(CROSS_FAMILY_RE, /(?:author|draft|written|wrote)/i), when: judgesCrossFamily },
    { label: "says there are no human raters", test: all(/human raters?|no human/i) },
    { label: "says the item pool is public", test: all(/public/i) },
    { label: "says the access tier is agent", test: all(/agent/i), when: agentTier },
    { label: "says the models were local open-weight builds, quantised, so results describe those builds", test: all(/local/i, /quantis/i), when: localOpenWeightTier },
  ],
  cite: [
    { label: "has the no-developer sentence verbatim", test: (t) => t.replace(/\s+/g, " ").includes(NO_DEVELOPER_SENTENCE) },
    { label: "says corrections are append-only (dated, added below, earlier text never changed)", test: all(/append-only|appended|added below|never (?:silently )?(?:changed|edited)/i, /correction/i) },
    { label: "restates the duty of care", test: all(/crisis/i, /not guidance|not advice|not a guide|not (?:a )?recommendation/i) },
    { label: "names the artifact path", test: all(/research\/model-runs\//i) },
  ],
};

/** Token-path prefixes a section must contain (template B "Fields"). `{wave}` forms are plain prefixes. */
export const MUST_CITE = {
  // Amendment 4: parts of about N per fresh conversation, and how many bank items were not served.
  design: ["bank.items_total", "bank.items_validated", "=bank.items_not_served", "=design.items_per_conversation_max"],
  separation: ["subjects."],
  "separated-model": ["subjects.", "length."],
  dimensions: ["dimension_pairwise_note", "dimension_item_counts"],
  "instrument-health": ["judge_agreement", "contamination"],
  // "a|b" = either prefix satisfies it: the first pilot reports quote_grounding, later runs report judge_validity.
  deviations: ["quote_grounding.|judge_validity."],
  "not-scores": ["bank.items_validated", "bank.items_total"],
};

/**
 * Wave-conditional citations (amendment 16, arms waves): the report must cite the figures its arms-specific statements rest on.
 * Same path syntax as MUST_CITE ("=" exact path; "a|b" either prefix).
 */
export const MUST_CITE_WHEN = {
  design: [{ path: "design.arms", when: armsWave }],
  separation: [
    { path: "comparisons", when: armsWave },
    { path: "replication.", when: (w) => armsWave(w) && w.replication !== undefined },
  ],
  "separated-model": [{ path: "length_check.", when: armsWave }],
  deviations: [{ path: "deviations.", when: armsWithDeviation }],
};

/**
 * Amendment 2026-10-01 #3: the judge-sensitivity statement lives in "Instrument health" OR "Why these are
 * not scores". Each path must be cited in at least one of the named sections.
 */
export const SENSITIVITY_SECTIONS = ["instrument-health", "not-scores"];
export const MUST_CITE_ANY = ["sensitivity.separation_pattern_unchanged", "derived.sensitivity_level_shift_group_range"];

/** Same two sections, text level: absolute figures depend on which judges are used; only the separation pattern is robust. */
const SAYS_JUDGES_MATTER = (t) => /depend\w*[^.]*\bjudges?\b|\bjudges?\b[^.]*\b(?:change|move|shift)s?\b/i.test(t);
const SAYS_PATTERN_ROBUST = (t) => /\bonly the (?:separation )?pattern\b[^.]*\brobust|\brobust\b[^.]*\bonly the (?:separation )?pattern\b|\bonly the (?:separation )?pattern\b[^.]*\b(?:holds|survives|stays|is stable)/i.test(t);
/** "this pilot did not test whether the separation pattern holds ..." (or "was not tested", "untested"). */
const SAYS_PATTERN_UNTESTED = (t) => /\b(?:not|never) (?:been )?test\w*\b[^.]*\bseparation pattern\b|\bseparation pattern\b[^.]*\b(?:not|never) (?:been )?test\w*|\bseparation pattern\b[^.]*\buntested\b/i.test(t);
export const MUST_SAY_ANY = [
  { label: "say that absolute figures depend on which judges are used", test: SAYS_JUDGES_MATTER },
  { label: "say that only the separation pattern is robust", test: SAYS_PATTERN_ROBUST },
];

/**
 * Amendment 2026-10-02 #15: the robustness half of amendment 3 holds only when the sensitivity analysis actually varied
 * the judge set. It did when a judge was excluded (the sensitivity view keeps the excluded judge's ratings), i.e.
 * `design.excluded_judges` is non-empty; a wave may also state it explicitly with a boolean `sensitivity.varies_judge_set`,
 * which wins. When it did not, the report must say the pilot did not test whether the separation pattern survives a
 * different choice of judges, and must NOT claim the pattern is robust to that choice.
 */
export function sensitivityVariesJudges(wave) {
  if (typeof wave?.sensitivity?.varies_judge_set === "boolean") return wave.sensitivity.varies_judge_set;
  return Array.isArray(wave?.design?.excluded_judges) && wave.design.excluded_judges.length > 0;
}
export const MUST_SAY_ANY_UNTESTED = [
  { label: "say that absolute figures depend on which judges are used", test: SAYS_JUDGES_MATTER },
  { label: "say that this pilot did not test whether the separation pattern holds under a different choice of judges (its sensitivity check varied no judge)", test: SAYS_PATTERN_UNTESTED },
];
/** Rejected when the sensitivity varied no judge: nothing measured that robustness. */
export const MUST_NOT_SAY_UNTESTED = [
  { label: "claim that only the separation pattern is robust to the choice of judges (this wave's sensitivity check varied no judge, so nothing measured that)", test: SAYS_PATTERN_ROBUST },
];

/** Section 1 may state only run-level numbers: no per-model figure (template B1). */
export const STATUS_NUMERIC_ALLOW = ["design.", "bank.", "derived.subject_count", "derived.ratings_total", "derived.responses_total", "derived.build_count", "derived.arm_count", "derived.primary_arm_subject_count"];

/** Section 7 forbidden causal words (template B7). */
export const CAUSAL_RE = /\bbecause\b|\bdriven by\b|\bexplains?\b|\bexplained\b/i;
