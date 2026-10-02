/**
 * model-report-fixtures.mjs -- synthetic analyses, waves and report text for
 * the gates' negative controls and the wave-2 dry run (QA G13).
 *
 * Two rules keep the gates from encoding the pilot:
 *   1. Nothing here is the pilot's data. The synthetic waves use different
 *      subject ids, dimensions, counts and a different separation structure.
 *   2. The report generator reads every figure and every name from the wave it
 *      is given; it contains no pilot value. The test asserts that no number
 *      from the committed pilot wave appears in any gate or fixture source.
 *
 * The generated text is test scaffolding. It is not narrative and must never
 * be published.
 */

import { createHash } from "node:crypto";
import { projectWave, parsePreregSubjects, parsePreregRuntime, judgePairing } from "./model-wave.mjs";
import { compileReport, countWords, makeNaming } from "./model-report.mjs";
import { NO_DEVELOPER_SENTENCE, NUMBER_WORDS, WORD_MIN, WORD_MAX, sensitivityVariesJudges } from "./model-report-template.mjs";

const r1 = (x) => Math.round(x * 10) / 10;
const r2 = (x) => Math.round(x * 100) / 100;

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * A synthetic analysis.json. `clusters` lists ids that cannot be told apart
 * (same cluster) with a composite for each; ids in different clusters are far
 * apart. Differences within a cluster are kept small so their interval crosses
 * zero.
 */
export function syntheticAnalysis({
  runId = "wave-2027-03-09",
  clusters = [
    [["atlas-small", 66.2], ["borealis-large", 64.1]],
    [["cirrus-base", 31.4]],
    [["delta-core", 52.8], ["delta-lite", 54.9]],
  ],
  dims = ["KIN", "LIS", "NOT", "PLA", "REF", "TRU"],
  itemsPerDim = 10,
  trials = 2,
  judgesPer = 2,
  bankVersion = "v9.9",
  seed = 7,
  excluded = "delta-lite",
  /** A run of the later kind: local pinned subjects, a disjoint judge set, judge_validity, a pre-registration. */
  local = false,
  /** List every pair as "b minus a" (a sorts AFTER b), the way a pre-registered direction can: the projection must re-orient it. */
  reversePairs = false,
} = {}) {
  const rnd = rng(seed);
  const ids = clusters.flat().map(([id]) => id).sort();
  const clusterOf = Object.fromEntries(clusters.flatMap((c, i) => c.map(([id]) => [id, i])));
  const comp = Object.fromEntries(clusters.flat());
  const subjects = {};
  for (const id of ids) {
    const dimensions = {};
    const di = {};
    const dc = {};
    for (const d of dims) {
      const m = r2(Math.min(4.9, Math.max(1.1, comp[id] / 100 * 4 + 0.6 + (rnd() - 0.5) * 0.4)));
      dimensions[d] = m;
      di[d] = [r2(m - 0.45), r2(m + 0.45)];
      dc[d] = itemsPerDim;
    }
    subjects[id] = {
      composite: comp[id],
      band: "SYNTHETIC-BAND", // present in A, must never reach the wave
      interval95: [r1(comp[id] - 2.5), r1(comp[id] + 2.5)],
      dimensions,
      dimension_intervals95: di,
      dimension_item_counts: dc,
      median_reply_words: 100 + Math.floor(rnd() * 300),
      contamination: { indicated: false, recall_items_flagged: 0, recall_items_probed: 2, identification_correct: 1, identification_asked: 4, identification_p_if_unexposed: 0.5, identification_flagged: false },
      judge_agreement: { exact: r2(0.6 + rnd() * 0.3), mean_absolute_difference: r2(rnd() * 0.4), responses_differing_by_2_or_more: Math.floor(rnd() * 5) },
      official: false,
      comparability: "none",
    };
  }
  const pairwise = [];
  const dimension_pairwise = [];
  for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) {
    const a = ids[i];
    const b = ids[j];
    const d = r1(comp[a] - comp[b]);
    const same = clusterOf[a] === clusterOf[b];
    const half = same ? 4 : 1.5;
    const iv = [r1(d - half), r1(d + half)];
    pairwise.push({ a, b, difference: d, interval95: iv, separated: iv[0] > 0 || iv[1] < 0 });
    for (const dim of dims) {
      const dd = r2(subjects[a].dimensions[dim] - subjects[b].dimensions[dim]);
      const ivd = [r2(dd - 0.5), r2(dd + 0.5)];
      const sep = ivd[0] > 0 || ivd[1] < 0;
      dimension_pairwise.push({ a, b, dimension: dim, difference: dd, interval95: ivd, separated: sep, bonferroni_separated: sep && Math.abs(dd) > 0.9, bonferroni_note: "synthetic note" });
    }
  }
  // Judge-sensitivity block (template amendment 3). Levels move by under 0.7 so that a within-cluster difference
  // (at most about 2.1) stays inside its +-4 interval and the separation pattern is unchanged by construction.
  const sensPoint = Object.fromEntries(ids.map((id) => [id, r1(comp[id] + (rnd() - 0.5) * 1.4)]));
  const sensPairs = [];
  for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) {
    const a = ids[i];
    const b = ids[j];
    const d = r1(sensPoint[a] - sensPoint[b]);
    const half = clusterOf[a] === clusterOf[b] ? 4 : 1.5;
    const iv = [r1(d - half), r1(d + half)];
    sensPairs.push({ a, b, difference: d, interval95: iv, separated: iv[0] > 0 || iv[1] < 0 });
  }
  const sensitivity = {
    question: "Synthetic question: do the findings depend on the excluded judge?",
    method: "Synthetic method: original routing, same scorer.",
    note: "Synthetic note: descriptive only.",
    ratings_used: 123,
    subjects: Object.fromEntries(ids.map((id) => [id, { pilot_composite: sensPoint[id], interval95: [r1(sensPoint[id] - 2.5), r1(sensPoint[id] + 2.5)] }])),
    pairwise: sensPairs,
    separation_pattern_unchanged: sensPairs.every((e, k) => e.separated === pairwise[k].separated),
  };
  const items = dims.length * itemsPerDim;
  const responses = ids.length * items * trials;
  const hex64 = (s) => createHash("sha256").update(`synthetic|${seed}|${s}`).digest("hex");
  if (reversePairs) {
    // "b minus a": the analysis's direction is not the wave's. Negating the difference and mirroring the interval is what re-orienting does.
    const flip = (e) => ({ ...e, a: e.b, b: e.a, difference: r2(-e.difference) + 0, interval95: [r2(-e.interval95[1]) + 0, r2(-e.interval95[0]) + 0] });
    for (const list of [pairwise, dimension_pairwise, sensPairs]) list.forEach((e, k) => { list[k] = flip(e); });
  }
  const judgeIds = ["judge-a", "judge-b", "judge-c"];
  const base = {
    sensitivity,
    run_id: runId,
    generated_by: "synthetic",
    status: "SYNTHETIC PROSE STATUS (never read)",
    design: {
      subjects: ids, access_tier: "synthetic tier (not a real access path)", items_served: items, trials_per_subject: trials,
      responses, ratings: responses * judgesPer, judges_per_response: judgesPer, self_judging: false,
      judge_family: "synthetic family", excluded_judges: excluded ? [excluded] : [], bank_version: bankVersion,
    },
    method: { composite: "synthetic scorer", interval: "synthetic resampling", length: "synthetic regression" },
    subjects,
    pairwise,
    dimension_pairwise,
    dimension_pairwise_note: "Synthetic note: many comparisons were made, so some flags arise by chance. Uncorrected flags are not evidence unless they survive correction.",
    length: {
      pooled_within_item_slope: 0.55, pooled_within_item_r: 0.47,
      within_subject_slopes: Object.fromEntries(ids.map((id) => [id, r2((rnd() - 0.5) * 0.8)])),
      composite_if_pooled_slope_removed: Object.fromEntries(ids.map((id) => [id, r1(comp[id] - 4)])),
      note: "Synthetic bound: an extreme case, not an estimate.",
    },
    judges: Object.fromEntries(ids.map((j) => [j, {
      ratings_used: Math.floor(responses * judgesPer / ids.length), leniency_vs_item_mean: r2((rnd() - 0.5) * 0.2),
      by_subject: Object.fromEntries(ids.filter((s) => s !== j).map((s) => [s, r2((rnd() - 0.5) * 1.5)])),
    }])),
    quote_grounding: {
      definition: "synthetic",
      judges: Object.fromEntries(ids.map((j) => [j, { ratings: 100, verbatim: 90, not_verbatim: 10, normalisation_only: 4, not_found: 6, not_verbatim_rate: 0.1, not_found_rate: 0.06 }])),
    },
    operations: { source: "synthetic", subject_parts_planned: 10, judge_batches: 20 },
    exclusion_record: { role: "judge only; the model remains a subject", reason: "synthetic reason", disclosure: "synthetic post-hoc disclosure", measured_original_answer_stats: { never: "exported" } },
    routing: Object.fromEntries(ids.map((s) => [s, { responses_by_judge_pair: { "x + y": 10 }, ratings_by_provenance: { original: 10 } }])),
  };
  if (!local) return base;

  // A run of the later kind. The judges are a separate set from a separate family; the subjects are pinned local builds;
  // quote evidence is judge_validity (no quote_grounding, and no exclusion_record because nobody was excluded).
  const pairs = ["judge-a + judge-b", "judge-a + judge-c", "judge-b + judge-c"];
  const judgeBasis = (role) => ({
    role, source: "synthetic/path.json", generated_at: "2000-01-01T00:00:00.000Z", threshold_percent: 5, ratings_measured: responses * judgesPer, ratings_sha256: hex64(`ratings|${role}`), pairs_superseded_by_a_later_file: 0,
    judges: Object.fromEntries(judgeIds.map((j) => [j, { ratings: 100, found_as_written: 99, found_after_normalisation_only: 1, unfound: 0, unfound_rate_percent: 0, verdict: "PASS" }])),
    failing_judges: [], run_verdict: "ALL-JUDGES-VALID",
  });
  Object.assign(base.design, {
    access_tier: "local-open-weight (synthetic runtime, 4-bit quantised builds pinned by digest)",
    judge_family: "all synthetic-judge family; no subject is in the judges' family (cross-family)",
    judges: judgeIds, excluded_judges: [],
    subject_builds: Object.fromEntries(ids.map((id, i) => [id, { tag: `${id}:latest`, digest_sha256: hex64(`digest|${id}`), family: `family${String.fromCharCode(97 + i)}` }])),
    conversation_per_item: "fresh conversation per (item, trial); one user turn, prompt text only",
    crisis_items_served: false,
    preregistration_sha256: hex64("prereg"),
  });
  for (const id of ids) base.subjects[id].mcp_scorecard = `synthetic/${id}/scorecard.json`;
  base.judges = Object.fromEntries(judgeIds.map((j) => [j, {
    ratings_used: Math.floor(responses * judgesPer / judgeIds.length), leniency_vs_item_mean: r2((rnd() - 0.5) * 0.2),
    by_subject: Object.fromEntries(ids.map((s) => [s, r2((rnd() - 0.5) * 1.5)])),
  }]));
  delete base.quote_grounding;
  delete base.exclusion_record;
  base.routing = Object.fromEntries(ids.map((s) => [s, { responses_by_judge_pair: Object.fromEntries(pairs.map((p) => [p, 10])), ratings_by_provenance: { original: 30, requoted: 1 } }]));
  base.operations = { source: "synthetic", judge_batches: 6, subject_replies: Object.fromEntries(ids.map((s) => [s, { planned: 30, ok: 30, failed: 0, missing: 0 }])) };
  base.sensitivity.ratings_whose_value_differs_from_the_original = 0;
  base.judge_validity = {
    rule: "synthetic rule", reported_as_headline: "measured_on_original_answers", headline_note: "synthetic note",
    measured_on_original_answers: judgeBasis("before any requote"), measured_on_final_quotes: judgeBasis("after the requote round"), judges_excluded: [],
  };
  base.bridge_drift = { note: "synthetic note", replies: 4, pairs: 8, mean_abs_difference: 0.375, max_abs_difference: 1, exact_match: 6, per_judge: Object.fromEntries(judgeIds.map((j) => [j, { pairs: 2, mean_abs_difference: 0.375, max_abs_difference: 1, exact_match: 1 }])), source_run: "wave-2020-01-01", seed };
  base.self_identifying_replies = { note: "synthetic note", count: 1, by_subject: Object.fromEntries(ids.map((id, i) => [id, i === 0 ? 1 : 0])), replies: [{ subject: ids[0], item_id: "X-1-A", trial: 1 }] };
  base.deviations = [{ id: "D1", date: "2000-01-01", title: "synthetic deviation one" }, { id: "D2", date: "2000-01-02", title: "synthetic deviation two" }];
  return base;
}

/** The subject table and runtime line of a synthetic PREREGISTRATION.md (the same layout the exporter parses). */
export function syntheticPreregText(analysis) {
  const rows = Object.entries(analysis.design.subject_builds).map(([id, b], i) => `| \`${id}\` | \`${b.tag}\` | \`${b.digest_sha256}\` | ${i + 3}.${i}B, Q4_K_M | Developer ${String.fromCharCode(65 + i)} (Lab), Licence-${i} |`);
  return ["# Pre-registration (synthetic)", "", "## 2. Subjects (pinned)", "", "| Label | Ollama tag | Digest (sha256) | Size, quantisation | Developer, licence |", "|---|---|---|---|---|", ...rows, "", "**Runtime and conditions:**", "- Runtime: Synthrun 9.8.7 on a synthetic workstation.", ""].join("\n");
}

/** Projection context for a synthetic analysis: serving counts consistent with its design (never typed from the pilot). */
export function syntheticCtx(analysis, { status = "active", itemsPerConversation = 12 } = {}) {
  const total = analysis.design.items_served + 17;
  const ctx = {
    bank: {
      items_total: total, items_validated: 4, items_served: analysis.design.items_served,
      items_not_served: 17, items_not_served_sensitive: 5, items_not_served_unreviewed: 12,
      version: analysis.design.bank_version,
    },
    decision: { ref: "D-29a", status },
    reportDate: analysis.run_id.match(/(\d{4}-\d{2}-\d{2})$/)[1],
    items_per_conversation_max: itemsPerConversation,
  };
  if (analysis.design.subject_builds) {
    const text = syntheticPreregText(analysis);
    ctx.items_per_conversation_max = 1;
    ctx.provenance = {
      subjects: parsePreregSubjects(text),
      runtime: parsePreregRuntime(text),
      families: {
        judges: Object.fromEntries(analysis.design.judges.map((j) => [j, "judgefamily"])),
        subjects: Object.fromEntries(Object.entries(analysis.design.subject_builds).map(([id, b]) => [id, b.family])),
      },
      preregistration_committed_before_data: false,
    };
  }
  return ctx;
}

export function syntheticWave(opts = {}) {
  const analysis = syntheticAnalysis(opts);
  return projectWave(analysis, syntheticCtx(analysis));
}

// ---------------------------------------------------------------------------
// Report text
// ---------------------------------------------------------------------------

const FILLER = [
  "The harness records every step so that a reader can check the work independently.",
  "Each reply was stored exactly as the model produced it, with no editing.",
  "Judges received the reply and the rubric, and returned a rating with a short quotation.",
  "A reader who disagrees with a choice can rerun the analysis from the stored files.",
  "The report states what the pilot measured and what it did not measure.",
  "Limits are listed beside results so that neither is read alone.",
  "The files named below are public so that anyone can check the figures.",
  "Where the pilot is silent the report says so rather than guessing.",
  "The process was run once, and a second run would be needed before any claim of stability.",
  "Wording was chosen to describe the evidence and to stop short of the claim it cannot carry.",
  "The authors treat every figure here as provisional until the instrument is validated.",
  "A figure with no stated source does not belong in a report of this kind.",
];
const invNumber = Object.fromEntries(Object.entries(NUMBER_WORDS).map(([w, n]) => [n, w]));
const T = (path, fmt) => `{{${path}${fmt ? `|${fmt}` : ""}}}`;

/**
 * Compliant scaffolding text for ANY wave that has at least one not-separated
 * group and at least one separated subject. Reads every name, group and figure
 * from the wave. `filler` is the number of neutral sentences added per section
 * (S3 excluded: it has a word cap).
 */
export function syntheticReportMd(wave, { filler = 0, numbered = true } = {}) {
  const d = wave.derived;
  const naming = makeNaming(wave);
  const ids = naming.ids;
  const sep = d.separated_subjects[0];
  const groups = d.not_separated_groups;
  const clusters = [...groups.map((g, i) => ({ list: T(`derived.not_separated_groups.${i}`, "list"), ids: g })), ...d.separated_subjects.map((s, i) => ({ list: T(`derived.separated_subjects.${i}`, "name"), ids: [s] }))]
    .sort((x, y) => (x.ids[0] < y.ids[0] ? -1 : 1));
  const otherWord = invNumber[d.subject_count - 1];
  const sepIdx = d.separated_subjects.indexOf(sep);
  const sepName = T(`derived.separated_subjects.${sepIdx}`, "name");
  const firstId = ids[0];
  const dims = Object.keys(wave.subjects[firstId].dimensions);
  const lowestOf = (id) => dims.reduce((m, k) => (wave.subjects[id].dimensions[k] < wave.subjects[id].dimensions[m] ? k : m), dims[0]);
  const ex = wave.design.excluded_judges[0];
  // Wave shape: some waves have no separated model, judges of another family than the subjects, local builds, rotating judge pairs.
  const hasSep = d.separated_subjects.length > 0;
  const cross = wave.judge_set?.families_disjoint === true;
  const local = /^local-open-weight/.test(wave.design.access_tier);
  const rotating = judgePairing(wave) === "rotating";
  const jv = wave.judge_validity;
  const firstJudge = (wave.design.judges ?? [])[0];
  let fi = 0;
  const fill = (n) => Array.from({ length: n }, () => FILLER[fi++ % FILLER.length]).join(" ");
  const H = (n, t) => `## ${numbered ? `${n}. ` : ""}${t}`;
  const groupSentences = groups.map((_, i) => `For each pair among ${T(`derived.not_separated_groups.${i}`, "list")} (alphabetical order), the range of the difference includes zero. The pilot cannot say which is higher; that is not the same as equal.`);
  const pairSentences = [];
  for (let i = 0; i < clusters.length; i++) for (let j = i + 1; j < clusters.length; j++) {
    pairSentences.push(`${clusters[i].list} ${clusters[i].ids.length > 1 ? "were each" : "was"} separated from ${clusters[j].list}.`);
  }
  // Amendment 2026-10-01 #2: a not-separated group member shows a range only; a point is for separated subjects.
  const inGroup = new Set(groups.flat());
  const rows = ids.map((id) => `| ${T(`subjects.${id}`, "name")} | ${T(`subjects.${id}.pilot_composite_interval95`, "range")} | ${inGroup.has(id) ? "not shown" : T(`subjects.${id}.pilot_composite`, "n1")} |`);
  const perModel = ids.map((id) => `${T(`subjects.${id}`, "name")} has a range of ${T(`subjects.${id}.pilot_composite_interval95`, "range")} in this pilot.`);
  const dimRows = ids.map((id) => `${T(`subjects.${id}`, "name")} has ${T(`subjects.${id}.dimension_item_counts.${dims[0]}`, "n0")} items in the ${dims[0]} dimension.`);
  const health = ids.map((id) => `For ${T(`subjects.${id}`, "name")}, judges agreed exactly on ${T(`subjects.${id}.judge_agreement.exact`, "pct")} of responses, and contamination probes flagged ${T(`subjects.${id}.contamination.recall_items_flagged`, "n0")} of ${T(`subjects.${id}.contamination.recall_items_probed`, "n0")} recall items.`);
  const md = [
    `# Synthetic scaffold for ${T("run_id")}`,
    "",
    H(1, "Duty of care and content note"),
    "",
    "This report describes an instrument. It is not guidance on which model to use in a crisis. The bank items that contain crisis content were not served in this pilot, so this report says nothing about how any model responds to a person in crisis. The topics of the unserved items are named without quoting them: suicide, self-harm and psychosis. Anyone in crisis should contact local emergency services or a crisis line.",
    "",
    H(2, "Status and verdict"),
    "",
    `This is an unofficial pilot (${T("run_id")}, dated ${T("report_date")}). It is not a score. ${cross ? "The judges come from a different model family than the models tested, so no model was judged by its own family." : "The judges are the same family as the models they rated, so the circularity is stated first."} No developer was contacted and no developer is paying. The access tier was ${T("design.access_tier")}. ${T("derived.subject_count", "n0")} models took part.`,
    "",
    ...groups.map((_, i) => `The instrument cannot tell ${T(`derived.not_separated_groups.${i}`, "list")} apart, so a larger group is not separated.`),
    "",
    fill(filler),
    "",
    H(3, "May say / may not say"),
    "",
    ...groups.map((_, i) => `- The pilot cannot order ${T(`derived.not_separated_groups.${i}`, "list")}.`),
    ...pairSentences.map((s) => `- May say: ${s}`),
    "",
    fill(filler),
    "",
    H(4, "Why an unofficial pilot"),
    "",
    "The pilot tests the instrument, not the models. A first run shows where the instrument works and where it does not.",
    "",
    fill(filler),
    "",
    H(5, "Design"),
    "",
    `The bank holds ${T("bank.items_total", "n0")} items and ${T("bank.items_validated", "n0")} are validated. The pilot served ${T("design.items_served", "n0")} items, ${T("design.trials_per_subject", "n0")} trials per model. Each trial's items were answered in parts of at most ${T("design.items_per_conversation_max", "n0")} per fresh conversation, not one conversation per item. ${T("bank.items_not_served", "n0")} bank items were not served: ${T("bank.items_not_served_sensitive", "n0")} because they contain crisis content and ${T("bank.items_not_served_unreviewed", "n0")} because they were not yet reviewed. The rubric was unseen by the judged models. No model judged its own replies. Two judges rated every reply. The item pool is public. The bank was authored with help from a model of the same family${cross ? " as the judges" : ""}. The interval covers item resampling only. ${local ? "The builds are pinned by digest, and the results describe these quantised builds, not the full-precision models." : "Model snapshots are unpinned and cannot be verified."}`,
    "",
    fill(filler),
    "",
    H(6, "Separation"),
    "",
    ...groupSentences,
    "",
    "| Model | Range | point estimate |",
    "|---|---|---|",
    ...rows,
    "",
    ...perModel.map((p) => (ids.find((id) => p.includes(`{{subjects.${id}|name}}`)) === sep ? `${p} For the separated model the cause is unresolved: reply length is a confound.` : p)),
    "",
    fill(filler),
    "",
    H(7, "Separated model and reply length"),
    "",
    ...(hasSep
      ? [
          `${sepName} was separated from the other ${otherWord}, and every judge rated its replies below the item mean. The cause is unresolved: reply length is a confound. The direction was consistent across judges.`,
          "",
          `The median reply for ${sepName} was ${T(`subjects.${sep}.median_reply_words`, "n0")} words, against ${T("derived.median_words_group_range", "range0")} words for the group. The within-model slope for ${sepName} was ${T(`length.within_subject_slopes.${sep}`, "n2")}. Removing the pooled slope would give ${T(`length.composite_if_pooled_slope_removed.${sep}`, "n1")} for ${sepName}. That bound is an extreme case and not an estimate.`,
        ]
      : [
          `No model was separated, so there is no separated model to report. Reply length is still a confound, and its cause is unresolved.`,
          "",
          ...ids.map((id) => `The median reply for ${T(`subjects.${id}`, "name")} was ${T(`subjects.${id}.median_reply_words`, "n0")} words.`),
          "",
          ...ids.map((id) => `The within-model slope for ${T(`subjects.${id}`, "name")} was ${T(`length.within_subject_slopes.${id}`, "n2")}.`),
          "",
          `The pooled within-item slope was ${T("length.pooled_within_item_slope", "n2")}, with a correlation of ${T("length.pooled_within_item_r", "n2")}.`,
        ]),
    "",
    fill(filler),
    "",
    H(8, "Dimension ranges"),
    "",
    ...dimRows,
    "",
    `Each dimension rests on a small number of items. ${T("dimension_pairwise_note")} The Bonferroni flag is conservative: ${T("derived.dimension_bonferroni_separated_among_group", "n0")} of ${T("derived.dimension_comparisons_among_group", "n0")} dimension comparisons inside the group survived it.`,
    "",
    `The lowest mean for ${T(`subjects.${firstId}`, "name")} is ${lowestOf(firstId)}.`,
    "",
    fill(filler),
    "",
    H(9, "Instrument health"),
    "",
    ...health,
    "",
    `Leniency is measured against the item mean across all subjects, including ${hasSep ? "the separated model" : "every model judged"}, so positive values are partly artefact. ${rotating ? "The judges were paired in rotation: every judge pair rated a share of each subject's replies." : "One fixed judge pair rated each subject."} Contamination probes covered sampled items only.${local ? ` The contamination probe ran through ${T(`subjects.${ids[0]}.contamination.via`)}.` : ""}`,
    "",
    sensitivityVariesJudges(wave)
      ? `The separation pattern was unchanged when the excluded judge's ratings were kept: ${T("sensitivity.separation_pattern_unchanged", "yesno")}. Absolute figures depend on which judges are used, so the levels of the models in the not-separated groups moved by ${T("derived.sensitivity_level_shift_group_range", "range")} points; only the separation pattern is robust.`
      : `The separation pattern was unchanged when only the original answers were used: ${T("sensitivity.separation_pattern_unchanged", "yesno")}, and the levels shifted by ${T("derived.sensitivity_level_shift_group_range", "range")} points. That check varied no judge. Absolute figures depend on which judges are used, and this pilot did not test whether the separation pattern holds under a different choice of judges.`,
    "",
    fill(filler),
    "",
    H(10, "Deviations and what went wrong"),
    "",
    jv
      ? `The disclosed deviation was post-hoc: ${T("deviations.0.title")}. For the first judge, ${T(`judge_validity.measured_on_final_quotes.judges.${firstJudge}.unfound`, "n0")} of ${T(`judge_validity.measured_on_final_quotes.judges.${firstJudge}.ratings`, "n0")} quotations were not found. The validity rule was pre-registered.`
      : `The disclosed deviation was post-hoc: ${T("exclusion_record.disclosure")}. ${ex ? `${T("design.excluded_judges.0", "name")} had ${T(`quote_grounding.judges.${ex}.not_found`, "n0")} of ${T(`quote_grounding.judges.${ex}.ratings`, "n0")} quotations not found.` : ""} The sampling design was pre-registered.`,
    "",
    fill(filler),
    "",
    H(11, "Why these are not scores"),
    "",
    `${T("bank.items_validated", "n0")} of ${T("bank.items_total", "n0")} items are validated. ${cross ? "The judges come from a different model family than the models tested, and the bank was still drafted with help from the judges' family." : "The judges are the same family as the models."} There were no human raters. The item pool is public. ${local ? "Models were run locally as quantised open-weight builds, so results describe those builds." : "Models were reached through an agent tier."}`,
    "",
    fill(filler),
    "",
    H(12, "Publication bar and confound ledger"),
    "",
    "The publication bar is not met. The confound ledger lists open, in progress and closed items.",
    "",
    fill(filler),
    "",
    H(13, "Next wave must change"),
    "",
    "The next wave should add a judge from another family and validated items.",
    "",
    fill(filler),
    "",
    H(14, "Cite, record, corrections"),
    "",
    `Cite ${T("run_id")}. Artifacts are under research/model-runs/${T("run_id")}/. ${NO_DEVELOPER_SENTENCE} Corrections are dated and append-only. This report is not guidance for a crisis.`,
    "",
    "### Glossary",
    "",
    "- Range: the interval from item resampling.",
    "",
  ].join("\n");
  return md;
}

/** A compliant scaffold whose compiled word count lands inside the template's band. */
export function syntheticReportInBand(wave) {
  const probe = (f) => compileReport({ md: syntheticReportMd(wave, { filler: f }), wave }).report.word_count;
  const base = probe(0);
  const perSentence = probe(1) - base;
  const target = Math.round((WORD_MIN + WORD_MAX) / 2);
  const f = Math.max(0, Math.round((target - base) / Math.max(1, perSentence)));
  return syntheticReportMd(wave, { filler: f });
}

export { countWords };
