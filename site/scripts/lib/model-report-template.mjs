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
export const MUST_SAY = {
  // Amendment 2026-10-01 #1: no token, number or model name may sit here (R-crisis-adjacency), so these are plain statements.
  "duty-of-care": [
    { label: "state that crisis-content items were not served", test: all(/crisis/i, /\bnot served\b|\bwere not (?:served|asked|used|run|given|included)\b|\bwere withheld\b|\bwere left out\b|\bwere excluded\b/i) },
    { label: "state that the report says nothing about how any model responds to a crisis", test: all(/crisis/i, /\bsays nothing\b|\bsay nothing\b|\bnothing about\b|\bdoes not (?:say|tell|show|measure|test|speak)\b|\bno (?:finding|claim|evidence)\b/i, /respon/i) },
  ],
  status: [
    { label: "says it is unofficial", test: all(/unofficial/i) },
    { label: "says it is not a score", test: all(/not (?:a |an )?(?:compassion benchmark )?scores?\b|no (?:official )?scores?\b/i) },
    { label: "says the judges are the same family as the subjects (circularity)", test: all(/same[- ]family|one family|same developer|one developer|circular|each other's/i) },
    { label: "says no developer was contacted or is paying", test: all(/no developer/i, /contacted|paid|paying|sponsor/i) },
    { label: "says the larger group is not separated", test: all(/not separated|cannot (?:tell|separate|order|say)|could not (?:tell|separate)|(?:could|can) ?not be told apart|does not separate/i) },
  ],
  design: [
    { label: "says the rubric was unseen by the judged models", test: all(/rubric/i) },
    { label: "says no model judged itself", test: all(/self-judg|no model (?:judged|graded|rated)|never (?:judged|graded|rated) (?:its|their) own|judged its own|own replies/i) },
    // Resolved text: "{{design.judges_per_response|n0}} judges" reads "2 judges".
    { label: "says two judges rated each reply", test: all(/\b(?:two|2) judges\b/i) },
    { label: "says the item pool is public", test: all(/public/i) },
    { label: "says the bank was authored with same-family help", test: all(/(?:author|draft|written|wrote)/i, /same[- ]family|claude/i) },
    { label: "says the interval covers item resampling only (the luck of which items were asked)", test: all(/resampl|re-?draw|which items/i, /\bonly\b|one source/i) },
    { label: "says snapshots are unpinned", test: all(/snapshot/i, /unpinned|not pinned|unverif|cannot be (?:pinned|verified)/i) },
  ],
  separation: [
    { label: 'says "cannot tell, not equal"', test: all(/cannot tell|could not tell|cannot say which|can not tell/i, /not (?:the same as|equal)|is not equal|not the same/i) },
  ],
  "separated-model": [
    { label: "says the cause is unresolved", test: all(/unresolved/i) },
    { label: "says the bound is not an estimate", test: all(/not an estimate/i) },
    { label: "says the direction is consistent across judges", test: all(/consistent across (?:the )?(?:\w+ )?judges|every judge|each judge|all (?:three |\w+ )?judges/i) },
  ],
  dimensions: [
    { label: "says how many items sit behind each dimension", test: all(/items/i) },
    { label: "says the Bonferroni flag is conservative", test: all(/bonferroni/i, /conservative/i) },
  ],
  "instrument-health": [
    { label: "says leniency is measured against the all-subject item mean", test: all(/leniency/i, /item mean/i) },
    { label: "says positives are partly artefact", test: all(/artefact|artifact/i) },
    { label: "says one fixed judge pair rated each subject", test: all(/fixed (?:judge )?pair|one (?:fixed )?judge pair/i) },
    { label: "says contamination covers sampled items only", test: all(/sampled|probed/i, /only/i) },
  ],
  deviations: [
    { label: "tags a deviation post-hoc", test: all(/post-hoc/i) },
    { label: "tags a deviation pre-registered", test: all(/pre-registered/i) },
  ],
  "not-scores": [
    { label: "says the judges are the same family", test: all(/same[- ]family|same family/i) },
    { label: "says there are no human raters", test: all(/human raters?|no human/i) },
    { label: "says the item pool is public", test: all(/public/i) },
    { label: "says the access tier is agent", test: all(/agent/i) },
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
  deviations: ["quote_grounding."],
  "not-scores": ["bank.items_validated", "bank.items_total"],
};

/**
 * Amendment 2026-10-01 #3: the judge-sensitivity statement lives in "Instrument health" OR "Why these are
 * not scores". Each path must be cited in at least one of the named sections.
 */
export const SENSITIVITY_SECTIONS = ["instrument-health", "not-scores"];
export const MUST_CITE_ANY = ["sensitivity.separation_pattern_unchanged", "derived.sensitivity_level_shift_group_range"];

/** Same two sections, text level: absolute figures depend on which judges are used; only the separation pattern is robust. */
export const MUST_SAY_ANY = [
  { label: "say that absolute figures depend on which judges are used", test: (t) => /depend\w*[^.]*\bjudges?\b|\bjudges?\b[^.]*\b(?:change|move|shift)s?\b/i.test(t) },
  { label: "say that only the separation pattern is robust", test: (t) => /\bonly the (?:separation )?pattern\b[^.]*\brobust|\brobust\b[^.]*\bonly the (?:separation )?pattern\b|\bonly the (?:separation )?pattern\b[^.]*\b(?:holds|survives|stays|is stable)/i.test(t) },
];

/** Section 1 may state only run-level numbers: no per-model figure (template B1). */
export const STATUS_NUMERIC_ALLOW = ["design.", "bank.", "derived.subject_count", "derived.ratings_total", "derived.responses_total"];

/** Section 7 forbidden causal words (template B7). */
export const CAUSAL_RE = /\bbecause\b|\bdriven by\b|\bexplains?\b|\bexplained\b/i;
