/**
 * model-dashboard-copy.ts -- every fixed sentence of the AI Model Compassion Dashboard, in one module so the lexicon
 * gate and the bare-digit gate scan it as a unit (docs/ai-dashboard/UX_FLOWS_AI_MODEL_DASHBOARD.md section 7).
 *
 * Rules (template D, METH rule 5, PRD FR-22):
 *   - NO digit appears in this file's copy. A number is a token resolved from the public projection, or a word
 *     computed by numberWord(). `scripts/test-model-dashboard.mjs` fails on a digit in any string below.
 *   - none of: best, worst, top, leads, beats, wins, tied, ahead, behind, band names, "clean", "cleared",
 *     "provisional", a ranking word that is not negated, or a most/least-compassionate phrase.
 *   - plain language (grade 9 target, OD-6): short sentences, one idea each.
 * Functions take tokens; they never read a wave themselves.
 */

import { DUTY_OF_CARE } from "@/components/model-benchmark/dutyOfCare";

export const dashboardCopy = {
  title: "AI Model Compassion Dashboard",
  eyebrow: "Unofficial pilot dashboard",
  /** Meta description: no model name, no figure. */
  metaDescription:
    "An unofficial pilot dashboard of AI model compassion tests: ranges, the models the test could not tell apart, what has not been measured yet, and how every figure was produced. Not a score, not a ranking.",
  social: "Ranges, not scores. What an unofficial pilot of AI model compassion can and cannot tell apart.",

  banner: {
    main: "Unofficial pilot. Not a Compassion Benchmark score. Not a ranking. No cross-model comparison.",
    noOfficial: "No AI model has an official Compassion Benchmark score.",
  },

  hero: {
    lede: (builds: string, items: string) => `Unofficial pilot tests of ${builds} open-weight AI model builds against ${items} published task items.`,
    isHead: "What this is",
    is: [
      "Ranges, not scores. Each bar shows what the data are consistent with.",
      "A plan written before the data were collected. Its hash is shown under Provenance.",
      "Every figure traces to one public data file for one wave.",
    ],
    isntHead: "What it is not",
    isnt: [
      "Not an official score.",
      "Not a ranking and not a recommendation.",
      "Not a test of the company that made a model.",
      "Not a test of the model as released. These are local four-bit builds.",
    ],
    scoreCalloutTitle: "Not a score",
    scoreCallout: "Ranges show what the data are consistent with. They are not scores, and builds from different waves cannot be compared.",
    linkHow: "How to read this",
    linkData: "Download the data",
    linkMethod: "Methodology",
    labsNote: "This page tests AI models. It does not score a company's governance; that is a different thing.",
  },

  status: {
    heading: "Program status",
    none: "No model has an official score.",
    labels: {
      official: "Official model scores",
      waves: "Unofficial pilot waves published",
      builds: "Builds in this wave",
      bank: "Task items in the bank",
      validated: "Task items validated by two human reviewers",
      tracked: "Releases tracked",
      lastWave: "Latest wave",
    },
    noneOf: (total: string) => `None of ${total}`,
    protocol: "Weekly protocol: proposed, not yet in force.",
    notCount: "These counts are not scores and carry no model name. Official and pilot counts are never added together.",
  },

  figureLabel: (runId: string, date: string, tier: string) => `Unofficial pilot · ${runId} · ${date} · ${tier} · not a score · comparability none`,

  state: {
    withheld: "Withheld",
    withheldTip: "A point is shown only for a build separated from all others after correction. This build was not, or was tested in a secondary arm. Its range is shown.",
    notMeasured: "Not measured yet",
    notMeasuredTip: "This dashboard has no measurement of this. It is not zero and not good.",
    notRecorded: "Not recorded for this wave",
    notShown: "Not shown",
  },

  controls: {
    heading: "View controls",
    wave: "Wave",
    models: "Models (alphabetical)",
    dims: "Dimensions",
    panels: "Show or hide panels",
    view: "Chart or table",
    chart: "Chart",
    table: "Table",
    exploratory: "Show exploratory pairwise comparisons (exploratory, not a finding)",
    exploratoryHelp: "Not planned in advance. Read with care.",
    reset: "Reset view",
    share: "Copy link to this view",
    download: "Download this view",
    downloadCsv: "Current view, CSV",
    downloadJson: "Current view, JSON",
    cite: "Copy citation",
    selectAll: "Select all",
    clear: "Clear (show all)",
    noJs: "Filters, sharing and the chart and table switch need JavaScript. This page shows the full wave without them.",
    mobileTable: "At narrow widths the tables replace the charts.",
    customised: "Customised view. This is not the default view, so any screenshot of it shows only part of the wave.",
    noteAll: "The composite always uses all dimensions with the weights fixed before the data were collected.",
  },

  live: {
    summary: (k: string, n: string, j: string, t: string, runId: string) => `Showing ${k} of ${n} builds, ${j} of ${t} dimensions, wave ${runId}.`,
    reset: "View reset. Showing all builds and all dimensions.",
    copied: "Link copied.",
    copyFailed: "Could not copy. The address bar holds the link.",
    citeCopied: "Citation copied.",
    downloadStarted: "Download started.",
    panelShown: "Panel shown.",
    panelHidden: "Panel hidden.",
  },

  hash: {
    invalid: (list: string) => `Some parts of this link were not valid and were reset: ${list}.`,
    unreadable: "This link could not be read. Showing the default view.",
    sortRefused: "Sorting and custom weighting are not offered.",
    close: "Dismiss",
  },

  panels: {
    comp: { title: "Composite ranges", question: "What range of composite values is consistent with the data for each build?" },
    dims: { title: "Dimension ranges", question: "On each dimension, what range is consistent with the data, and how many items support it?" },
    diff: { title: "Pre-registered comparisons", question: "For two builds, does the range of the difference include zero?" },
    len: { title: "Reply length", question: "How long are the replies, and could length account for any range?" },
    judg: { title: "Judge reliability", question: "Did the judges agree, and were their quotes valid?" },
    cont: { title: "Contamination probes", question: "Is there a sign the models had seen the task items?" },
    inst: { title: "Instrument health", question: "How much of the test was used, and how much of it have humans checked?" },
    prov: { title: "Provenance", question: "Exactly which builds, settings and files produced these figures?" },
    nm: { title: "Not measured yet", question: "What does this dashboard not tell me?" },
    rel: { title: "Release tracker", question: "A new model came out. Where is it in the process?" },
    gates: { title: "Requirements for an official score", question: "What must be true before any model can have an official score?" },
    hide: "Hide panel",
    show: "Show panel",
    hiddenNote: "This panel is hidden by your view settings.",
  },

  groups: {
    heading: "Which builds could the test tell apart?",
    notSeparated: "Not separated",
    notSeparatedBody: (names: string) =>
      `For each pair among ${names}, the range of the difference includes zero. The pilot cannot say which is higher; that is not the same as equal.`,
    notSeparatedList: (names: string) => `Not separated: ${names}.`,
    separatedHead: "Separated",
    separated: (name: string, others: string) => `${name} was separated from ${others}.`,
    separatedConfound: "The cause is unresolved. Reply length is a confound the pilot cannot rule out.",
    subset: (shown: string, total: string) => `Showing ${shown} of ${total} in this group. The group still reflects the whole wave; members hidden by your selection could not be told apart from these.`,
    noGroup: "No group of builds that the test could not tell apart.",
    noneSeparated: "No build was separated from the others.",
    listOnly: "The separation flags of this wave cannot be drawn as groups, so the builds are listed alphabetically and no grouping is claimed.",
    secondary: "Secondary arm: ranges only, no point and no ordering",
    unlisted: "No separation claim is made for these builds",
    order: "Order is alphabetical. Order carries no meaning.",
    notRecorded: "Grouping not recorded for this wave.",
    singleBuild: "Only one build in the primary arm. No comparison is possible.",
    uncorrected: "Separated only without correction for multiple comparisons: these pairs are not a separation claim. They appear under exploratory comparisons.",
  },

  composite: {
    alwaysAll: "The composite always uses all dimensions. Selecting dimensions does not change it.",
    pointCaption: "A point tick is drawn only for a build separated from all others after correction.",
    noPoint: "No build was separated, so every build is shown as a range only.",
    weightsHead: "Why there are no custom weights",
    weightsWhy:
      "The composite uses weights fixed before the data were collected. Changing them after seeing results would let anyone reach the conclusion they want, and the ranges are valid only for the fixed formula. The resampling needed to give a re-weighted composite a valid range is not published. Look at one dimension instead.",
    colRange: "Range (95%)",
    colPoint: "Point estimate",
    colGroup: "Group",
    colItems: "Items",
    colModel: "Model",
    pointNote: "A point estimate is given only for a build separated after correction, with its confound in the caption.",
  },

  dims: {
    noteAll: "Ranges only. No dimension mean is shown. Read down a column to compare builds on one dimension.",
    few: (n: string) => `Few items (${n}). This range rests on few task items and is wide for that reason.`,
    survived: (survived: string, total: string) => `${survived} of ${total} dimension comparisons survived correction; only those count as differences.`,
    survivedNone: (total: string) => `None of ${total} dimension comparisons survived correction.`,
    survivorMark: "Marked: this build is in a dimension comparison that survived correction.",
    pairsHead: "Dimension comparisons that survived correction",
    noPairs: "No dimension comparison survived correction.",
    notRecorded: "Dimension ranges are not recorded for this wave.",
    items: "items",
  },

  diff: {
    intro: (count: string, basis: string) => `${count} comparisons were declared before the data were collected. ${basis}`,
    introNotPre: (count: string, basis: string) => `${count} paired comparisons are listed for this wave. No plan committed before the data is recorded for them, so they are not pre-registered comparisons. ${basis}`,
    includesZero: "The range includes zero.",
    excludesZero: "The range excludes zero (after correction).",
    empty: "Choose two or more builds to see differences.",
    none: "No pre-registered comparison in this wave.",
    noShared: "The selected builds share no pre-registered comparison.",
    note: "A range that includes zero is not a separation. That does not mean the builds are equal. No point difference is shown.",
    colPair: "First minus second",
    colRaw: "Range (95%)",
    colCorrected: "Range after correction",
    colReading: "Reading",
    correctionNone: "No correction for multiple comparisons is recorded for this list.",
  },

  exploratory: {
    heading: "Exploratory pairwise comparisons",
    head: "Exploratory. Not planned in advance. No claim of separation is made from these.",
    chance: "Exploratory: about one range in twenty excludes zero by chance alone.",
    excludes: "range excludes 0 (uncorrected)",
    includes: "range includes 0",
    off: "Exploratory comparisons are off. Turn them on in the view controls.",
    none: "No pairs beyond the pre-registered ones in this wave.",
    badge: "Exploratory, not a finding",
    colPair: "Pair",
    colReading: "Reading",
    colKind: "Kind",
    kindBMinusA: "Secondary arm minus primary arm (same build)",
    kindPair: "Not pre-registered pair",
    selectTwo: "Select two or more builds.",
    armNote: "Secondary-arm marks are hollow: one trial per item, ranges only.",
  },

  length: {
    caption: "Reply length is an unresolved confound. The panel describes length; it does not show that length causes any range.",
    pooled: "Pooled within-item slope (all builds together)",
    r: "Pooled within-item correlation",
    colWords: "Median reply words",
    colSlope: "Within-build slope",
    colBound: "Extreme bound (not an estimate)",
    boundNote: "An extreme bound is shown only for a separated build. It is a bound, not an adjusted score.",
    noBound: "No extreme bound is shown: no build was separated.",
    slopeNull: "Not computed (one trial per item)",
    noLengthScore: "Length-controlled score",
    noLengthScoreWhy: "No valid estimate exists. The bound above is not one.",
    checkHead: "Length-instruction check",
  },

  judges: {
    caption: "All judges are from one model family. Agreement shows consistency, not correctness. No human raters took part and there is no chance-corrected statistic yet.",
    colExact: "Exact agreement",
    colMad: "Mean absolute difference",
    colTwo: "Replies differing by two or more",
    validityHead: "Unfound-quote rate by judge",
    colJudge: "Judge",
    colRate: "Unfound quotes",
    colThreshold: "Threshold",
    colVerdict: "Verdict",
    lenienceHead: "Judge leniency against the item mean",
    lenienceNote: "Leniency is partly artefact: the item mean includes the judge's own ratings.",
    bridgeHead: "Judge drift on re-rated replies",
    colSigned: "Mean signed difference, new minus original (rating points)",
    colEquivalent: "Composite-scale equivalent if every rating moved by this amount",
    colMadJ: "Mean absolute difference (rating points)",
    colExactMatch: "Exact matches",
    bridgeNotRecorded: "Judge drift is not recorded for this wave (no earlier wave to re-rate).",
    validityNotRecorded: "Quote validity is not recorded for this wave.",
    modelsNote: "Whole wave for the judge tables; the model filter applies to the agreement rows only.",
  },

  contamination: {
    caption: "Covers sampled items only. Not flagged is not evidence of absence. Every task item is public.",
    colRecall: "Recall probe",
    colId: "Identification probe",
    colFlag: "Indicator",
    colVia: "Probe route",
    colSelf: "Replies naming their own model",
    flagged: "Flagged",
    notFlagged: "Not flagged",
    recall: (flagged: string, probed: string) => `${flagged} of ${probed} sampled items flagged`,
    ident: (ok: string, asked: string, p: string) => `${ok} of ${asked} correct; chance probability if unexposed ${p}`,
    probeBlind: "The recall probe could not have flagged anything in this wave: every recall answer claimed no memory.",
    notRecorded: "Contamination probes are not recorded for this wave.",
  },

  instrument: {
    bankHead: "Item bank",
    served: "Served in this wave",
    notServedSensitive: "Not served: sensitive",
    notServedUnreviewed: "Not served: unreviewed",
    validated: "Validated by humans",
    noneValidated: (total: string) => `None of ${total} validated by humans`,
    of: (n: string, total: string) => `${n} of ${total}`,
    checklistHead: "Checks",
    preregBefore: "Plan committed before any data",
    preregAfter: "Plan not committed or time-stamped before the data existed",
    deviations: "Deviations from the plan",
    noDeviations: "No deviation recorded",
    requote: "Ratings changed by the requote round",
    pattern: "Separation pattern under that check",
    patternSame: "Unchanged",
    patternChanged: "Changed",
    crisis: "Crisis items",
    crisisNot: "Not served in this wave",
    bankVersion: "Bank version",
    bankSha: "Bank sha256",
    bankShaNone: "Not exported",
    judgeFamily: "Judge family",
    batches: "Judge batches",
    voids: "Judge calls voided",
    rows: "Served per dimension",
    wholeWave: "Whole wave; not affected by the model filter.",
    planned: "planned in advance",
    postHoc: "after the fact",
  },

  provenance: {
    wave: "Wave",
    runId: "Run id",
    date: "Report date",
    tier: "Access tier",
    protocol: "Protocol version",
    protocolNone: "Not recorded for this wave",
    judgesHead: "Judges",
    judgeSet: "Judge set",
    judgeFamilies: "Judge families",
    disjoint: "Families disjoint from the models tested",
    yes: "Yes",
    no: "No",
    preregHead: "Pre-registration",
    preregAsWritten: "Plan as written, sha256",
    preregWithDeviations: "Plan with dated deviations, sha256",
    preregCommitted: "Committed before the data",
    files: "Files",
    waveSha: "Wave file sha256 (computed at build)",
    sourceSha: "Source analysis sha256",
    waveFile: "Public data file for this wave (JSON)",
    report: "Narrative report for this wave",
    methodology: "Methodology",
    builds: "Builds",
    colBuild: "Build",
    colDeveloper: "Developer",
    colFamily: "Family",
    colTag: "Tag",
    colDigest: "Digest sha256",
    colQuant: "Quantisation",
    colArm: "Arm",
    colTrials: "Trials per item",
    colMessage: "System message",
    colMessageSha: "System message sha256",
    copy: "Copy",
    copied: "Copied",
    describes: "This describes these builds, not the model as released.",
    conflict: (judgeProvider: string, subject: string) => `${judgeProvider} supplied the judges and is also the developer of ${subject}; see the report's disclosure.`,
    taskText: "Task item text is in the public bank.",
  },

  notMeasured: {
    heading: "What this dashboard does not tell you",
    lead: "Each row below is a state, not a zero. A row becomes a value only when the wave's data file carries the field.",
    available: "Recorded in this wave's data file. This dashboard does not display it yet.",
    availableValidated: (n: string, total: string) => `${n} of ${total} validated by two human reviewers`,
    rows: {
      crisis: { name: "Crisis and safety-sensitive handling", why: "Crisis items have never been served." },
      refusal: { name: "Refusal and over-refusal", why: "There is no refusal classifier and no benign-control item set." },
      consistency: { name: "Trial-to-trial consistency", why: "The exporter does not publish a stability block yet." },
      "multi-turn": { name: "Multi-turn behaviour", why: "Every item is a single fresh turn." },
      validated: { name: "Human-validated task items", why: "No bank item has been validated by two human reviewers." },
      "human-raters": { name: "Human-rater agreement", why: "No human raters took part." },
      "length-controlled": { name: "Length-controlled score", why: "No valid estimate exists." },
      languages: { name: "Languages other than English", why: "The bank is in one language." },
      frontier: { name: "Frontier and API models", why: "Only local open-weight builds have been tested." },
      official: { name: "An official score", why: "Every requirement below must be met first." },
    } as Record<string, { name: string; why: string }>,
    exemplars: "Exemplar replies are not shown, by policy.",
  },

  releases: {
    heading: "Release tiers",
    tiers: [
      { id: "tracked", name: "Tracked", meaning: "Release tracked, not evaluated. No figure." },
      { id: "pilot", name: "Unofficial pilot", meaning: "Evaluated in an unofficial pilot wave. Not a score, comparability none." },
      { id: "official", name: "Official", meaning: "An official Compassion Benchmark score." },
    ],
    colTier: "Tier",
    colCount: "Count",
    colMeaning: "Meaning",
    t0Empty: "None yet. A release appears only with a cited primary source.",
    t0Never: "Release scanning has not started. No release is tracked yet.",
    t0Note: "A scan that did not run is not a scan that found nothing.",
    t1Count: (waves: string, builds: string) => `${waves} pilot waves published; ${builds} builds in the latest wave`,
    t2Empty: "No model has an official score.",
    latency: "Not measured yet. Time from release to pilot card is shown only after two waves have been measured.",
    notRequest: "Testing cannot be requested or bought. Releases are chosen by a published rule.",
  },

  gates: {
    heading: "Requirements for an official score",
    intro: (met: string, derived: string, total: string) => `${met} of the ${derived} requirements that can be checked from this site's data are met. ${total} requirements in all.`,
    introNone: (derived: string, total: string) => `None of the ${derived} requirements that can be checked from this site's data is met. ${total} requirements in all.`,
    notDerived: "Not checked here: this site holds no data for the others, so no state is claimed for them.",
    colRequirement: "Requirement",
    colState: "State",
    colEvidence: "Evidence from this site's data",
    met: "Met",
    notMet: "Not met",
    notChecked: "Not checked here",
    rows: {
      validation: { name: "Human validation of task items", note: "A defined share of served items reviewed by domain and lived-experience reviewers." },
      pool: { name: "An unpublished item pool, outside the repository, with rotation", note: "Today every item is public with its answer key." },
      judges: { name: "Judges from more than one model family, or human raters as primary", note: "" },
      raters: { name: "Two blinded human raters with adjudication, and a welfare protocol", note: "" },
      access: { name: "Full-precision or API access to the model as released", note: "" },
      amendment: { name: "A founder decision that allows official scores", note: "Official rendering is disabled until that decision." },
      methods: { name: "Methods prerequisites settled: one composite formula, one taxonomy, a model-appropriate vocabulary", note: "" },
      independence: { name: "Separation guard green and independence disclosures present", note: "" },
      disclosure: { name: "A coordinated-disclosure policy for harmful outputs", note: "" },
      crisis: { name: "Crisis items served under a safety protocol", note: "The benchmark's core construct is distress." },
    } as Record<string, { name: string; note: string }>,
  },

  howto: {
    heading: "How to read this",
    items: [
      "Each bar is a range, not a score.",
      "If two ranges overlap enough that their difference includes zero, the test cannot tell the builds apart. That is not the same as equal.",
      "Builds are listed alphabetically. Position means nothing.",
      "Only one wave is shown at a time. Waves cannot be compared with each other.",
      "These are local four-bit builds, tested on a public set of task items.",
    ],
    glossHead: "Glossary",
  },

  glossary: [
    { term: "Unofficial pilot", def: "A test run to try out the instrument. It is not a score and nothing in it is official." },
    { term: "Range (95%)", def: "The span of values that the data are consistent with, found by resampling the task items. It covers item sampling only." },
    { term: "Separated", def: "The corrected range of the difference between two builds excludes zero. The pilot can tell them apart." },
    { term: "Not separated", def: "The range of the difference includes zero. The pilot cannot say which is higher. That is not the same as equal." },
    { term: "Bonferroni correction", def: "A stricter threshold used when many pairs are compared at once, so that chance does not produce false separations." },
    { term: "Point estimate", def: "A single fitted value. It is shown only for a build separated from all others after correction." },
    { term: "Withheld", def: "Not shown on purpose. A point for a build in a not-separated group would let its order read as a ranking." },
    { term: "Exploratory", def: "Not planned before the data were collected. About one range in twenty excludes zero by chance alone." },
    { term: "Arm", def: "A way of running a build. The primary arm is the pre-registered one; the secondary arm has one trial per item and shows ranges only." },
    { term: "Bank", def: "The published set of task items every build is asked." },
    { term: "Validated item", def: "A task item reviewed by two independent human reviewers with no unresolved dispute." },
    { term: "Judge", def: "A model that rates each reply on a one to five scale against published anchors." },
    { term: "Judge agreement", def: "How often two judges gave the same rating. It shows consistency, not correctness." },
    { term: "Reply length", def: "Longer replies tend to be rated differently. The pilot cannot say whether that is about compassion or about length." },
    { term: "Contamination probe", def: "A check on whether a model recalls task items. Not flagged is not evidence of absence." },
    { term: "Comparability none", def: "Nothing here may be compared with any model outside this wave." },
    { term: "Tracked", def: "A release has been noticed from a cited source. It has not been evaluated." },
    { term: "Official", def: "A Compassion Benchmark score that meets every requirement. No model has one." },
  ],

  cite: {
    heading: "Cite this view",
    plain: "Plain text",
    bibtex: "BibTeX",
    copy: "Copy",
    note: "The link to your current view is added when you copy.",
    lengthBound: "",
  },

  data: {
    heading: "Data and downloads",
    intro: "Static files for the whole wave. They contain the public projection only: a point estimate appears only for a build separated after correction, and no point difference is exported.",
    csv: "Whole wave, CSV",
    json: "Whole wave, JSON",
    wave: "Public wave file (JSON)",
    licence: "Licence",
  },

  faq: {
    heading: "Questions",
    items: [
      { q: "What is this dashboard?", a: "A configurable view of one unofficial pilot wave of AI model compassion tests: ranges, the models the test could not tell apart, what has not been measured, and how each figure was produced." },
      { q: "Does it say which model is higher or lower?", a: "No. It shows ranges and the groups the test could not tell apart, and it states that order carries no meaning. It is not a ranking, and no model has an official score." },
      { q: "Can it tell me which AI model to use?", a: "No. It does not recommend a model, least of all for crisis support. See the note on crisis use on this page." },
      { q: "How do I cite it?", a: "Use the Cite this view panel. It gives the date, the run id and the status, and adds the link to your view." },
    ],
  },

  footer: {
    heading: "Corrections, replies and independence",
    corrections: "Corrections are dated and added; published figures are never changed silently.",
    report: "Report an error or send a reply",
    reply: "Anyone, including developers, may reply after publication. Replies are posted verbatim and dated. Nobody sees results before publication, and nobody can pay for inclusion, a score change or silence.",
    noDeveloper: "No developer was contacted before publication. No developer paid, sponsored or reviewed this report.",
    independence: "Entities never pay for inclusion, score changes, or suppression of findings.",
    licence: "Data licence",
    reportLink: "Read the narrative report for this wave",
    methodology: "Read the methodology",
    analytics: "This page counts visits and which controls are used, without cookies and without model names or the contents of your view.",
  },

  waveNav: {
    heading: "Waves",
    only: "Only wave",
    current: "Showing",
    others: "Other waves (each stands alone; builds are never shown across waves)",
    refuse: "Builds from different waves are not shown together. Each wave stands alone.",
  },

  duty: { heading: "On crisis use", text: DUTY_OF_CARE },

  noscript: {
    controls: "Filters, sharing and the chart and table switch need JavaScript. This page shows the full wave without them.",
  },
} as const;

/** Every fixed string of the module, flattened (the digit and lexicon scans read this). Functions are called with word-only sample arguments. */
export function allCopyStrings(): string[] {
  const out: string[] = [];
  const sample = "word";
  const walk = (x: unknown) => {
    if (typeof x === "string") out.push(x);
    else if (typeof x === "function") {
      try { out.push((x as (...a: string[]) => string)(sample, sample, sample, sample, sample)); } catch { /* not a string function */ }
    } else if (Array.isArray(x)) x.forEach(walk);
    else if (x && typeof x === "object") Object.values(x).forEach(walk);
  };
  walk(dashboardCopy);
  return out;
}
