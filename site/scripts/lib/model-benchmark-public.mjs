/**
 * model-benchmark-public.mjs -- everything the AI-model program PUBLISHES IN MACHINE-READABLE FORM,
 * built from the committed wave files and facts, never typed.
 *
 *   projectWavePublic(wave)         the public copy of a wave file (DC-24: the machine twin of the report's
 *                                   withholding rule). Withholds every point estimate of a member of a
 *                                   not-separated group, and every point difference that involves one.
 *   projectionProblems(pub, wave)   structural check of a public wave file against its source
 *   separationWords(wave)           the separation result in plain words (no figure)
 *   pilotCaveats(wave)              the caveats every pilot carries, derived from the wave
 *   reportMarkdown(compiled, ...)   the compiled report as a markdown alternate (tokens already resolved)
 *   buildModelBenchmarkIndex(...)   /data/model-benchmark/index.json
 *   buildLlmsFull(...)              /llms-full.txt
 *   buildLlmsModelLines(...)        the AI-models lines of /llms.txt
 *   patchWellKnown(...)             counts and report list of /.well-known/compassion-benchmark.json
 *
 * Rule source: DECISIONS.md D-29a; docs/AI_MODEL_ASSESSMENT_TEMPLATE.md amendments 2 (no point estimates for a
 * not-separated group), 8 (no point differences that reconstruct hidden points) and 9 (a group point is any
 * display of a member's point). Plain .mjs: the site (TypeScript), the prebuild scripts and the tests import it.
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { lexiconProblems } from "./model-report.mjs";
import { sensitivityVariesJudges } from "./model-report-template.mjs";
import { renderableEntries, reportsIndexRenders as gateReportsIndexRenders } from "./pilot-render-gate.mjs";

export const SITE_URL = "https://compassionbenchmark.com";
export const PROJECTION_SCHEMA = "compassion-benchmark/model-wave-public/1";
export const INDEX_SCHEMA = "compassion-benchmark/model-benchmark-index/1";

const NL = String.fromCharCode(10);
const alpha = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

// ---------------------------------------------------------------------------
// URLs
// ---------------------------------------------------------------------------
export const reportUrlFor = (runId) => `${SITE_URL}/ai-models/reports/${runId}`;
export const markdownUrlFor = (runId) => `${SITE_URL}/ai-models/reports/${runId}.md`;
export const waveUrlFor = (runId) => `${SITE_URL}/data/model-waves/${runId}.json`;
export const INDEX_JSON_URL = `${SITE_URL}/data/model-benchmark/index.json`;
export const REPORTS_INDEX_URL = `${SITE_URL}/ai-models/reports`;
export const LLMS_FULL_URL = `${SITE_URL}/llms-full.txt`;
export const WELL_KNOWN_URL = `${SITE_URL}/.well-known/compassion-benchmark.json`;
export const METHODOLOGY_URL = `${SITE_URL}/ai-models/methodology`;
export const INSTALL_DOC_URL = `${SITE_URL}/ai-evaluation-suite#mcp-server`;

// ---------------------------------------------------------------------------
// Words
// ---------------------------------------------------------------------------
const NUMBER_WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
export const numberWord = (n) => NUMBER_WORDS[n] ?? String(n);

/** "a", "a and b", "a, b and c" */
export function listWords(xs) {
  if (xs.length <= 1) return xs.join("");
  return `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`;
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
export function dateLong(iso) {
  const m = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? `${Number(m[3])} ${MONTHS[Number(m[2]) - 1]} ${m[1]}` : String(iso);
}

// ---------------------------------------------------------------------------
// The projection (DC-24)
// ---------------------------------------------------------------------------

/**
 * Subjects whose points are withheld: every member of a not-separated group (and any subject that is not separated). In an arms wave
 * (template amendment 16) `derived.separated_subjects` holds only the primary arm's corrected-separated subjects, so every variant of the
 * secondary arm falls into "not separated" here and is withheld too, with no second rule to keep in step.
 */
export function notSeparatedMembers(wave) {
  const sep = new Set(wave.derived.separated_subjects);
  const fromGroups = wave.derived.not_separated_groups.flat();
  const rest = wave.design.subjects.filter((id) => !sep.has(id));
  return [...new Set([...fromGroups, ...rest])].sort(alpha);
}

export const POINT_WITHHELD_REASON =
  "This model is in a not-separated group: the pilot could not tell it apart from the other members, so point estimates would let their order read as a ranking. " +
  "Point estimates, dimension means and point differences that involve it are withheld here and in the report; 95% ranges, separation flags and counts are published. " +
  "See DECISIONS.md D-29a and docs/AI_MODEL_ASSESSMENT_TEMPLATE.md, amendments 2, 8 and 9.";

export const RANGE_ONLY_ARM_REASON =
  "This variant belongs to the secondary arm (one trial per item), which shows ranges only; the pilot states no separation among its variants and no point is shown for any of them. " +
  "Point estimates, dimension means and point differences that involve it are withheld here and in the report; 95% ranges, separation flags and counts are published. " +
  "See DECISIONS.md D-29a and docs/AI_MODEL_ASSESSMENT_TEMPLATE.md, amendments 2, 8, 9 and 16.";

/** The reason a subject's points are withheld: a not-separated group (every wave) or the secondary arm (arms waves, amendment 16). */
export const withheldReasonFor = (wave, id) => ((wave.derived.range_only_subjects ?? []).includes(id) ? RANGE_ONLY_ARM_REASON : POINT_WITHHELD_REASON);

const PAIR_LISTS = [["pairwise"], ["dimension_pairwise"], ["sensitivity", "pairwise"]];

/**
 * The public copy of a wave file. The internal wave (src/data/model-benchmark/waves/<run_id>.json) keeps every value so
 * the report build can resolve tokens; this projection is what leaves the building. Derived only from the wave's own
 * `derived` fields. Separated subjects keep their points. Intervals, separation flags and counts are kept everywhere.
 */
export function projectWavePublic(wave) {
  const out = structuredClone(wave);
  const members = notSeparatedMembers(wave);
  const isMember = new Set(members);

  for (const id of members) {
    const s = out.subjects?.[id];
    if (s) {
      delete s.pilot_composite;
      delete s.dimensions;
      s.point_withheld = { withheld: ["pilot_composite", "dimensions"], reason: withheldReasonFor(wave, id) };
    }
    const ss = out.sensitivity?.subjects?.[id];
    if (ss) {
      delete ss.pilot_composite;
      ss.point_withheld = { withheld: ["pilot_composite"], reason: withheldReasonFor(wave, id) };
    }
    // Any length-adjusted point of a member (the first pilot lists separated subjects only; this is the fail-closed guard).
    if (out.length?.composite_if_pooled_slope_removed) delete out.length.composite_if_pooled_slope_removed[id];
  }

  for (const path of PAIR_LISTS) {
    const holder = path.length === 1 ? out : out[path[0]];
    const list = holder?.[path[path.length - 1]];
    if (!Array.isArray(list)) continue;
    for (const q of list) {
      if (isMember.has(q.a) || isMember.has(q.b)) {
        delete q.difference;
        q.point_withheld = ["difference"];
      }
    }
  }

  // The pre-declared comparisons of an arms wave: a point difference that involves a withheld subject is withheld, and so is a B - A difference
  // (every B - A comparison involves a secondary-arm variant). Ranges, flags and corrected ranges stay.
  for (const q of out.comparisons ?? []) {
    if (isMember.has(q.a) || isMember.has(q.b)) {
      const withheld = ["difference"];
      delete q.difference;
      if (q.b_minus_a && "difference" in q.b_minus_a) { delete q.b_minus_a.difference; withheld.push("b_minus_a.difference"); }
      q.point_withheld = withheld;
    }
  }

  const withheldDerived = [];
  for (const k of ["not_separated_group_range", "not_separated_group_ranges"]) {
    if (k in out.derived) { delete out.derived[k]; withheldDerived.push(k); }
  }
  if (withheldDerived.length) out.derived.point_withheld = withheldDerived;

  const { run_id, ...rest } = out;
  return {
    run_id,
    public_projection: {
      schema: PROJECTION_SCHEMA,
      note: "Public projection of the internal wave file. It differs from the internal file only by the withholding listed here.",
      withheld_for: members,
      rule: POINT_WITHHELD_REASON,
      decision_ref: "DECISIONS.md D-29a",
      template_ref: `docs/AI_MODEL_ASSESSMENT_TEMPLATE.md amendments ${wave.derived.display_rule ? "2, 8, 9 and 16" : "2, 8 and 9"}`,
      separated_subjects_keep_points: [...wave.derived.separated_subjects].sort(alpha),
    },
    ...rest,
  };
}

/** Structural check of a public wave object against its source. Rule ids are G24-*. */
export function projectionProblems(pub, wave) {
  const p = [];
  const members = notSeparatedMembers(wave);
  const isMember = new Set(members);
  if (JSON.stringify(pub?.public_projection?.withheld_for) !== JSON.stringify(members)) p.push("G24-projection-note: public_projection.withheld_for is not the wave's not-separated members");
  for (const id of members) {
    const s = pub.subjects?.[id];
    if (!s) { p.push(`G24-subject-missing: ${id}`); continue; }
    if ("pilot_composite" in s) p.push(`G24-member-point: subjects.${id}.pilot_composite is published`);
    if ("dimensions" in s) p.push(`G24-member-point: subjects.${id}.dimensions (dimension means) are published`);
    if (!s.point_withheld) p.push(`G24-withheld-note: subjects.${id} has no point_withheld note`);
    if (!Array.isArray(s.pilot_composite_interval95)) p.push(`G24-interval-missing: subjects.${id}.pilot_composite_interval95 was dropped (ranges are published)`);
    if (pub.sensitivity?.subjects?.[id] && "pilot_composite" in pub.sensitivity.subjects[id]) p.push(`G24-member-point: sensitivity.subjects.${id}.pilot_composite is published`);
    if (pub.length?.composite_if_pooled_slope_removed && id in pub.length.composite_if_pooled_slope_removed) p.push(`G24-member-point: length.composite_if_pooled_slope_removed.${id} is published`);
  }
  for (const id of wave.derived.separated_subjects) {
    if (pub.subjects?.[id]?.pilot_composite !== wave.subjects[id].pilot_composite) p.push(`G24-separated-point-missing: subjects.${id}.pilot_composite must be kept (a separated subject keeps its point)`);
  }
  for (const path of PAIR_LISTS) {
    const get = (w) => (path.length === 1 ? w[path[0]] : w[path[0]]?.[path[1]]);
    const src = get(wave);
    const out = get(pub);
    if (!Array.isArray(src)) continue;
    if (!Array.isArray(out) || out.length !== src.length) { p.push(`G24-pairs: ${path.join(".")} changed length`); continue; }
    src.forEach((q, i) => {
      const o = out[i];
      const involvesMember = isMember.has(q.a) || isMember.has(q.b);
      if (involvesMember && "difference" in o) p.push(`G24-member-difference: ${path.join(".")}[${i}] (${q.a} / ${q.b}) publishes a point difference`);
      if (!involvesMember && o.difference !== q.difference) p.push(`G24-difference-missing: ${path.join(".")}[${i}] (${q.a} / ${q.b}) between two separated subjects must keep its difference`);
      if (JSON.stringify(o.interval95) !== JSON.stringify(q.interval95) || o.separated !== q.separated) p.push(`G24-pair-range: ${path.join(".")}[${i}] interval or separated flag changed`);
    });
  }
  for (const k of ["not_separated_group_range", "not_separated_group_ranges"]) if (pub.derived && k in pub.derived) p.push(`G24-group-range: derived.${k} is published (its extremes are the members' own points)`);
  // The comparisons of an arms wave (amendment 16).
  if (Array.isArray(wave.comparisons)) {
    const out = pub.comparisons;
    if (!Array.isArray(out) || out.length !== wave.comparisons.length) p.push("G24-pairs: comparisons changed length");
    else wave.comparisons.forEach((q, i) => {
      const o = out[i];
      const involvesMember = isMember.has(q.a) || isMember.has(q.b);
      if (involvesMember && "difference" in o) p.push(`G24-member-difference: comparisons[${i}] (${q.a} / ${q.b}) publishes a point difference`);
      if (involvesMember && o.b_minus_a && "difference" in o.b_minus_a) p.push(`G24-member-difference: comparisons[${i}].b_minus_a (${q.a} / ${q.b}) publishes a point difference`);
      if (!involvesMember && o.difference !== q.difference) p.push(`G24-difference-missing: comparisons[${i}] (${q.a} / ${q.b}) between two separated subjects must keep its difference`);
      if (JSON.stringify(o.interval95) !== JSON.stringify(q.interval95) || o.separated !== q.separated || JSON.stringify(o.bonferroni) !== JSON.stringify(q.bonferroni) || JSON.stringify(o.b_minus_a?.interval95) !== JSON.stringify(q.b_minus_a?.interval95)) p.push(`G24-pair-range: comparisons[${i}] interval or separated flag changed`);
    });
  }
  return p;
}

// ---------------------------------------------------------------------------
// Front matter, shapes, caveats
// ---------------------------------------------------------------------------

/** `key: value` lines between the first pair of --- fences (value optionally in double quotes). */
export function readFrontMatter(mdText) {
  const out = {};
  // CRLF-tolerant (Iteration 95): a report written on Windows has CRLF in the working tree; "." never matches a CR,
  // so the key regex silently failed and the title fell back to the run id locally while CI (LF checkout) parsed it,
  // making a tracked generated file differ by platform. Strip one trailing CR per line before parsing.
  const lines = mdText.split(NL).map((l) => (l.endsWith(String.fromCharCode(13)) ? l.slice(0, -1) : l));
  if (lines[0]?.trim() !== "---") return out;
  for (let i = 1; i < lines.length && lines[i].trim() !== "---"; i++) {
    const m = lines[i].match(/^([a-z_]+):\s*(.*)$/);
    if (m) out[m[1]] = m[2].replace(/^"(.*)"$/, "$1");
  }
  return out;
}

export function frontMatterObject(lines) {
  return readFrontMatter(["---", ...lines, "---"].join(NL));
}

/** The sentences a pilot is described by when a person or tool needs one line about what it found about separation. */
export function separationWords(wave) {
  if (wave.derived.display_rule) return separationWordsArms(wave);
  const n = wave.derived.subject_count;
  const sep = [...wave.derived.separated_subjects].sort(alpha);
  const groups = wave.derived.not_separated_groups.map((g) => [...g].sort(alpha)).sort((a, b) => alpha(a[0], b[0]));
  const parts = [];
  if (sep.length === 0 && groups.length === 1 && groups[0].length === n) {
    parts.push(`The test could not tell the ${numberWord(n)} models apart: ${listWords(groups[0])} (alphabetical order).`);
  } else {
    if (sep.length === 1 && groups.length === 1 && groups[0].length === n - 1) {
      parts.push(`The test separated ${sep[0]} from the other ${numberWord(groups[0].length)} models.`);
    } else if (sep.length) {
      parts.push(`The test separated ${listWords(sep)} from the other models.`);
    }
    groups.forEach((g, i) => parts.push(`It could not tell ${listWords(g)} apart${groups.length > 1 ? ` (group ${i + 1})` : ""}.`));
  }
  if (groups.length) parts.push("Not separated is not the same as equal; the pilot cannot say which is higher.");
  return parts.join(" ");
}

/**
 * An arms wave's separation result in words (template amendment 16): the primary arm after correction for multiple comparisons, the pairs
 * separated only without correction (stated as that, never as a separation), and the secondary arm (ranges only). No figure.
 */
function separationWordsArms(wave) {
  const d = wave.derived;
  const A = d.by_arm[d.primary_arm];
  const n = A.subjects.length;
  const sep = [...A.separated_subjects].sort(alpha);
  const groups = A.not_separated_groups.map((g) => [...g].sort(alpha));
  const parts = [];
  const head = `In the primary arm (no length instruction), after correction for multiple comparisons`;
  if (sep.length === 1 && groups.length === 1 && groups[0].length === n - 1) parts.push(`${head}, the test separated ${sep[0]} from the other ${numberWord(n - 1)} variants and could not tell ${listWords(groups[0])} apart (alphabetical order).`);
  else {
    if (sep.length) parts.push(`${head}, the test separated ${listWords(sep)} from the other variants.`);
    groups.forEach((g) => parts.push(`${sep.length ? "It" : head + ", the test"} could not tell ${listWords(g)} apart.`));
  }
  const only = d.separated_uncorrected_only_pairs.map(([a, b]) => `${a} and ${b}`);
  if (only.length) parts.push(`${listWords(only)} ${only.length === 1 ? "were" : "were each"} separated only without correction for multiple comparisons; that is not stated as a separation.`);
  const B = d.range_only_subjects;
  if (B.length) parts.push(`The secondary arm (length instruction, one trial per item) shows ranges only: ${listWords([...B].sort(alpha))}.`);
  parts.push("Not separated is not the same as equal; the pilot cannot say which is higher.");
  return parts.join(" ");
}

/** Trials per subject, in words a reader can use: one number, or the number for each arm of an arms wave. */
export function trialsPhrase(wave) {
  const t = wave.design.trials_per_subject;
  if (typeof t === "number") return String(t);
  const arms = wave.design.arms ?? {};
  const byArm = {};
  for (const [id, n] of Object.entries(t)) (byArm[arms[id]?.arm ?? id] ??= new Set()).add(n);
  return Object.keys(byArm).sort(alpha).map((a) => `${[...byArm[a]].join("/")} in arm ${a}`).join(", ");
}

/** Does the wave prove its judges are a different model family than every subject? */
const crossFamily = (wave) => wave.judge_set?.families_disjoint === true && wave.judge_set?.disjoint_from_subjects === true;

/** Caveats every pilot carries, each derived from the wave by a predicate. Run through the template D lexicon by the caller. */
export function pilotCaveats(wave) {
  const c = [];
  const groups = wave.derived.not_separated_groups;
  const sep = wave.derived.separated_subjects;
  c.push("Unofficial pilot. It is not a Compassion Benchmark score, its comparability is none, and it supports no comparison with models outside it. No AI model has an official score.");
  if (groups.length) c.push("Models the test could not separate are shown as ranges only. Their point estimates are withheld because their order would read as a ranking. Not separated is not the same as equal.");
  c.push(crossFamily(wave)
    ? "The judges were models from a different family than the models tested, not people. The item bank was authored with help from the judges' family."
    : "The judges were models, not people, and came from the same family as the models tested, so they may share preferences the pilot cannot measure.");
  c.push(`Access tier: ${wave.design.access_tier}.`);
  c.push(`${wave.bank.items_validated} of ${wave.bank.items_total} bank items have passed human review; ${wave.bank.items_not_served} were not served in this pilot.`);
  if (wave.crisis_items_served === false || wave.design.crisis_items_served === false || wave.bank.items_not_served_sensitive > 0) {
    c.push("Crisis-adjacent items were not served, so the pilot says nothing about how any model responds to a person in crisis.");
  }
  if (sep.length && wave.length) {
    const words = Object.values(wave.subjects).map((s) => s.median_reply_words);
    const shortest = Math.min(...words);
    const shortSep = sep.some((id) => wave.subjects[id].median_reply_words === shortest);
    c.push(shortSep
      ? "A model the test separated also wrote much shorter replies; reply length is an unresolved confound, and the pilot cannot say whether the gap is about compassion or about length."
      : "Reply length is an unresolved confound for any separated model.");
  } else {
    c.push("Reply length is a confound for any rated response and is unresolved.");
  }
  if (wave.design.excluded_judges?.length) c.push("One judge was excluded after the fact (a disclosed post-hoc protocol change); the report describes it.");
  if (wave.sensitivity) {
    // Amendment 15: a sensitivity check that varied no judge cannot say anything about the choice of judges.
    if (!sensitivityVariesJudges(wave)) {
      c.push(`Absolute levels depend on which judges are used; the pilot did not test whether the separation pattern holds under a different choice of judges. ${wave.sensitivity.separation_pattern_unchanged ? "Its sensitivity check, which varied no judge, left the separation pattern unchanged." : "Its sensitivity check, which varied no judge, changed the separation pattern."}`);
    } else {
      c.push(wave.sensitivity.separation_pattern_unchanged
        ? "Absolute levels depend on which judges are used; the separation pattern was checked against the judge choice and did not change."
        : "Absolute levels depend on which judges are used, and the separation pattern changed when the judge choice changed.");
    }
  }
  if (wave.derived.display_rule) {
    c.push("Each build was run twice, with and without a length instruction. Only the arm without it carries the corrected comparison; the other arm has one trial per item and shows ranges only.");
    c.push("The system message is explicit and identical within an arm, but its place in the prompt differs by each build's own template. The secondary arm has no server scorecard because the cb-probe server needs more trials per item; its composites are computed from the same ratings.");
  }
  if (wave.preregistration && wave.preregistration.committed_before_data === false) {
    c.push("The pre-registration file was not committed or independently time-stamped before the data existed.");
  }
  if (Array.isArray(wave.deviations) && wave.deviations.length) c.push(`${wave.deviations.length} deviation(s) from the plan are recorded in the report.`);
  c.push("The item bank is published with its answer key, so a model may have seen the items. Contamination probes ran on sampled items only.");
  return c;
}

export function preregistrationSha(wave) {
  return wave.preregistration?.sha256 ?? wave.design?.preregistration_sha256 ?? null;
}

/** Throws when a generated string breaks the template D lexicon. */
export function assertLexiconClean(label, text, wave) {
  const problems = lexiconProblems(text, wave);
  if (problems.length) throw new Error(`copy rule failure in ${label}: ${problems.map((x) => `${x.rule}: ${x.message}`).join(" | ")}`);
}

// ---------------------------------------------------------------------------
// Markdown alternate
// ---------------------------------------------------------------------------

/** Absolute links, so a reader who has only the .md can follow them. */
function absolutise(md) {
  return md.split("](/").join(`](${SITE_URL}/`);
}

/** The compiled report as markdown. Tokens are already resolved by the compiler; this adds nothing the page does not say. */
export function reportMarkdown(compiled, wave, title) {
  const fm = frontMatterObject(compiled.front_matter);
  const q = (s) => JSON.stringify(String(s));
  const head = [
    "---",
    `title: ${q(title ?? fm.title ?? compiled.run_id)}`,
    `run_id: ${compiled.run_id}`,
    `date: ${compiled.report_date}`,
    "status: unofficial pilot",
    "official: false",
    `comparability: ${compiled.comparability ?? wave.comparability}`,
    `canonical: ${reportUrlFor(compiled.run_id)}`,
    `data: ${waveUrlFor(compiled.run_id)}`,
    `index: ${INDEX_JSON_URL}`,
    "note: Markdown alternate of the report page. Same text; every figure was resolved against the wave file at build time. Not a score, not a ranking.",
    "---",
    "",
    `# ${title ?? fm.title ?? compiled.run_id}`,
    "",
  ];
  if (fm.dek) head.push(`> ${fm.dek}`, "");
  if (compiled.preface?.markdown) head.push(absolutise(compiled.preface.markdown.trim()), "");
  const body = compiled.sections.map((s) => `## ${s.title}${NL}${NL}${absolutise(s.markdown.trim())}`);
  return [...head, body.join(NL + NL), ""].join(NL);
}

// ---------------------------------------------------------------------------
// index.json
// ---------------------------------------------------------------------------

/** One rendered report: { entry, wave, title }. Newest first by date, then run id. */
export function sortReports(reports) {
  return [...reports].sort((a, b) => alpha(b.wave.report_date, a.wave.report_date) || alpha(b.wave.run_id, a.wave.run_id));
}

function subjectsOf(wave) {
  return [...wave.design.subjects].sort(alpha).map((id) => ({
    label: id,
    ...(wave.design.arms?.[id] ? { arm: wave.design.arms[id].arm, trials: wave.design.arms[id].trials } : {}),
    provenance: wave.subject_provenance?.[id] ?? { access_tier: wave.design.access_tier },
  }));
}

export function pilotIndexEntry({ wave, title }) {
  const id = wave.run_id;
  const sha = preregistrationSha(wave);
  const sep = [...wave.derived.separated_subjects].sort(alpha);
  const groups = wave.derived.not_separated_groups.map((g) => [...g].sort(alpha)).sort((a, b) => alpha(a[0], b[0]));
  const words = separationWords(wave);
  const caveats = pilotCaveats(wave);
  assertLexiconClean(`index.json ${id} separation`, words, wave);
  caveats.forEach((t, i) => assertLexiconClean(`index.json ${id} caveat ${i + 1}`, t, wave));
  return {
    run_id: id,
    title,
    date: wave.report_date,
    status: "unofficial pilot",
    official: false,
    comparability: wave.comparability,
    decision_ref: wave.publication.decision_ref,
    access_tier: wave.design.access_tier,
    report_url: reportUrlFor(id),
    markdown_url: markdownUrlFor(id),
    wave_url: waveUrlFor(id),
    subjects: subjectsOf(wave),
    separation: {
      summary: words,
      not_separated_groups: groups,
      separated_subjects: sep,
      point_estimates_withheld_for: notSeparatedMembers(wave),
      note: wave.derived.display_rule
        ? "Ranges for every subject are in wave_url. Point estimates are withheld for every variant except one the corrected comparison separated (D-29a, template amendments 2 and 16)."
        : "Ranges for every subject are in wave_url. Point estimates for not-separated models are withheld (D-29a, template amendment 2).",
      ...(wave.derived.display_rule ? { display_rule: wave.derived.display_rule.text, range_only_subjects: [...wave.derived.range_only_subjects].sort(alpha) } : {}),
    },
    caveats,
    ...(sha ? { preregistration_sha256: sha } : {}),
  };
}

/**
 * The machine entry point. `facts` is cb-probe-facts.generated.json. `reports` are the RENDERED pilot reports.
 * `reportsIndexRenders` says whether /ai-models/reports (the reports index page) exists in this build.
 */
export function buildModelBenchmarkIndex({ reports, facts, reportsIndexRenders }) {
  const sorted = sortReports(reports);
  return {
    schema: INDEX_SCHEMA,
    program: {
      name: "AI Model Compassion Benchmark",
      status: "No model has an official score. Everything published so far is an unofficial pilot: not a score, not a ranking, comparability none.",
      official_scores: false,
      comparability: "none",
      independence: "No model developer pays for inclusion, a result, or the withholding of a finding.",
      page_url: `${SITE_URL}/ai-models`,
    },
    methodology: {
      url: METHODOLOGY_URL,
      bank_version: facts.bankVersion,
      items_total: facts.itemsTotal,
      items_served_by_default: facts.itemsServedDefault,
      crisis_items_excluded_by_default: facts.crisisItemsExcludedByDefault,
      dimensions: facts.dimensionCount,
      subdimensions: facts.subdimensions?.total ?? null,
      trials_in_default_run: facts.trialsInDefaultRun,
      minimum_trials_per_item: facts.minTrials,
      note: "Every item is published with its full answer key, so a model trained since publication may have memorised it. A result on this bank is not comparable across models.",
    },
    cb_probe: {
      name: "cb-probe",
      summary: "A local MCP server (stdio) that lets a model run the published items on itself. No network call and no API key. A self-run is unofficial, an upper bound, and never comparable.",
      version: facts.version,
      license: facts.license,
      repository: facts.repository.replace(/^git\+/, "").replace(/\.git$/, ""),
      tool_count: facts.toolCount,
      tools: facts.tools.map((t) => t.name),
      install_doc_url: INSTALL_DOC_URL,
    },
    pilot_reports: sorted.map(pilotIndexEntry),
    links: {
      reports_index: reportsIndexRenders ? REPORTS_INDEX_URL : null,
      llms_txt: `${SITE_URL}/llms.txt`,
      llms_full_txt: LLMS_FULL_URL,
      well_known: WELL_KNOWN_URL,
      sitemap: `${SITE_URL}/sitemap.xml`,
    },
  };
}

// ---------------------------------------------------------------------------
// llms.txt lines, llms-full.txt
// ---------------------------------------------------------------------------

/** Lines for /llms.txt: the index, the full text, the reports index (when it exists), and each report with its markdown. */
export function buildLlmsModelLines({ reports, reportsIndexRenders }) {
  const sorted = sortReports(reports);
  const lines = [];
  if (sorted.length) {
    lines.push(`- Machine-readable entry point for the AI model program (status, method, every pilot, caveats): ${INDEX_JSON_URL}`);
    lines.push(`- Plain-text method and pilot findings for AI readers: ${LLMS_FULL_URL}`);
    if (reportsIndexRenders) lines.push(`- All unofficial pilot reports: ${REPORTS_INDEX_URL}`);
    for (const r of sorted) {
      lines.push(`- Unofficial pilot report (not a score, not a ranking, comparability none; ${r.wave.report_date}): ${reportUrlFor(r.wave.run_id)}`);
      lines.push(`  - markdown: ${markdownUrlFor(r.wave.run_id)}`);
      lines.push(r.wave.derived.display_rule
        ? `  - data (ranges; point estimates withheld except for a variant the corrected comparison separated): ${waveUrlFor(r.wave.run_id)}`
        : `  - data (ranges; point estimates withheld for models the test could not separate): ${waveUrlFor(r.wave.run_id)}`);
    }
  }
  return lines;
}

const fmt1 = (v) => v.toFixed(1);

/** The 95% range of a subject in words, never a point. */
function rangeLine(wave, id, sepSet) {
  const [lo, hi] = wave.subjects[id].pilot_composite_interval95;
  const base = `${id}: 95% range ${fmt1(lo)} to ${fmt1(hi)} (unofficial pilot figure, not a score)`;
  if ((wave.derived.range_only_subjects ?? []).includes(id)) return `${base}; point estimate withheld: this variant is in the secondary arm (one trial per item), which shows ranges only.`;
  if (!sepSet.has(id)) return `${base}; point estimate withheld because the test could not separate it from the others in its group.`;
  const conf = [];
  // Compared with the subjects the separation was tested against: all of them, or the primary arm of an arms wave.
  const compared = wave.derived.by_arm?.[wave.derived.primary_arm]?.subjects ?? Object.keys(wave.subjects);
  const words = compared.map((k) => wave.subjects[k].median_reply_words);
  if (wave.subjects[id].median_reply_words === Math.min(...words)) conf.push("this model also wrote the shortest replies, so reply length is an unresolved confound and the pilot cannot say whether the gap is about compassion or length");
  else conf.push("reply length is an unresolved confound");
  if (!crossFamily(wave)) conf.push("the judges came from the same model family as the subjects");
  return `${base}; the test separated it from the others, but ${conf.join("; ")}.`;
}

/** One pre-registered comparison of an arms wave, in words: ranges and flags, never a point difference. */
function comparisonLine(wave, q) {
  const r = (iv) => `${fmt1(iv[0])} to ${fmt1(iv[1])}`;
  if (q.kind === "arm") {
    const lc = wave.length_check?.per_build?.find((x) => x.arm_a === q.a);
    return `${q.a} and ${q.b} (the build with and without the length instruction): 95% range of the arm B minus arm A difference ${r(q.b_minus_a.interval95)}; ${q.b_minus_a.separated ? "the range excludes zero" : "the range includes zero"}; ${lc ? `the length instruction was ${lc.length_instruction} (${lc.length_instruction === "ineffective" ? "this comparison is uninformative about length" : "read with the length change in mind"})` : "see the report"}.`;
  }
  if (q.bonferroni) {
    const verdict = q.bonferroni.separated ? "separated after correction" : q.separated ? "separated only without correction for multiple comparisons (not stated as a separation)" : "not separated";
    return `${q.a} and ${q.b} (primary arm): 95% range ${r(q.interval95)}; after correction for multiple comparisons ${r(q.bonferroni.interval)}; ${verdict}.`;
  }
  return `${q.a} and ${q.b} (secondary arm, one trial per item, no correction, ranges only): 95% range ${r(q.interval95)}; ${q.separated ? "the range excludes zero" : "the range includes zero"}.`;
}

export function pilotFindingsText({ wave, title }) {
  const sepSet = new Set(wave.derived.separated_subjects);
  const t = [];
  t.push(`### ${title} (${wave.run_id}, ${dateLong(wave.report_date)})`);
  t.push("");
  t.push("Read these caveats first:");
  for (const c of pilotCaveats(wave)) t.push(`- ${c}`);
  t.push("");
  t.push("Design:");
  t.push(`- Models tested (alphabetical): ${listWords([...wave.design.subjects].sort(alpha))}.`);
  t.push(`- ${wave.design.items_served} items served, ${typeof wave.design.trials_per_subject === "number" ? `${wave.design.trials_per_subject} trials per model` : `trials per model: ${trialsPhrase(wave)}`}, ${wave.design.responses} responses, ${wave.design.ratings} ratings, ${wave.design.judges_per_response} judges per response; bank ${wave.design.bank_version}.`);
  t.push(`- Method, as recorded in the wave file: composite: ${wave.method.composite}; interval: ${wave.method.interval}.`);
  t.push("");
  t.push("What it found about separation:");
  t.push(`- ${separationWords(wave)}`);
  t.push("");
  t.push("95% ranges (alphabetical order, which is not a ranking):");
  for (const id of [...wave.design.subjects].sort(alpha)) t.push(`- ${rangeLine(wave, id, sepSet)}`);
  if (wave.derived.display_rule) {
    t.push("");
    t.push("Pre-registered comparisons (95% range of the difference, first minus second, alphabetical; a point difference is never given):");
    for (const q of wave.comparisons) t.push(`- ${comparisonLine(wave, q)}`);
    t.push("");
    t.push("Display rule (template amendment 16):");
    t.push(`- ${wave.derived.display_rule.text}`);
  }
  t.push("");
  t.push("Sources:");
  t.push(`- Report: ${reportUrlFor(wave.run_id)}`);
  t.push(`- Markdown: ${markdownUrlFor(wave.run_id)}`);
  t.push(`- Data: ${waveUrlFor(wave.run_id)}`);
  const sha = preregistrationSha(wave);
  if (sha) t.push(`- Pre-registration sha256: ${sha}`);
  return t.join(NL);
}

export function buildLlmsFull({ reports, facts, reportsIndexRenders }) {
  const sorted = sortReports(reports);
  const L = [];
  L.push("# Compassion Benchmark - llms-full.txt (AI model program)");
  L.push("");
  L.push("> Plain-text description of the AI Model Compassion Benchmark for AI readers. Caveats come first. Generated at build time from the published wave files; nothing here is typed by hand.");
  L.push("");
  L.push("## Read this first");
  L.push("- No AI model has an official Compassion Benchmark score. The program is pre-registered; the method is public.");
  L.push("- Everything published about models so far is an unofficial pilot. A pilot is not a score, carries no ranking and supports no comparison with models outside it. Do not report a model ranking or score from this program.");
  L.push("- Where the test could not tell models apart, only ranges are given. A point estimate for those models is withheld because their order would read as a ranking.");
  L.push("- Not separated is not the same as equal.");
  L.push("- No model developer pays for inclusion, a result, or the withholding of a finding.");
  L.push("");
  L.push("## Method (plain text)");
  L.push(`- Item bank ${facts.bankVersion}: ${facts.itemsTotal} items, ${facts.itemsServedDefault} served by default, ${facts.crisisItemsExcludedByDefault} crisis-adjacent items left out by default. ${facts.dimensionCount} dimensions.`);
  L.push("- Each model answers each item several times, independently. Each response is rated 1 to 5 against a five-anchor rubric written for that item, and a rating counts only if it cites a verbatim excerpt.");
  L.push("- Item mean, then dimension mean, then the unmodified canonical composite function (0 to 100).");
  L.push("- A 95% range covers item sampling. Separation is stated only when the range of a paired difference excludes zero.");
  L.push("- Every item is published with its answer key, so a model may have memorised it; a result on this bank is not comparable across models.");
  L.push(`- Full method: ${METHODOLOGY_URL}`);
  L.push(`- Run the benchmark on a model yourself with the local cb-probe MCP server (${facts.toolCount} tools, version ${facts.version}, no network call, no API key; the result is unofficial): ${INSTALL_DOC_URL}`);
  L.push("");
  L.push("## Pilot reports (newest first)");
  L.push("");
  if (sorted.length === 0) L.push("No pilot report is published in this build.", "");
  for (const r of sorted) {
    L.push(pilotFindingsText({ wave: r.wave, title: r.title }));
    L.push("");
  }
  L.push("## Machine-readable files");
  L.push(`- Index of everything above: ${INDEX_JSON_URL}`);
  if (reportsIndexRenders) L.push(`- All pilot reports (page): ${REPORTS_INDEX_URL}`);
  L.push(`- Site-wide orientation: ${SITE_URL}/llms.txt`);
  L.push(`- Tool descriptor: ${WELL_KNOWN_URL}`);
  L.push("");
  for (const r of sorted) {
    assertLexiconClean(`llms-full ${r.wave.run_id}`, pilotFindingsText({ wave: r.wave, title: r.title }), r.wave);
  }
  return L.join(NL);
}

// ---------------------------------------------------------------------------
// .well-known
// ---------------------------------------------------------------------------

/**
 * Parse -> mutate -> return. Counts come from cb-probe-facts; the reports list from the rendered pilots.
 * `descriptor` is the parsed .well-known/compassion-benchmark.json.
 */
export function patchWellKnown(descriptor, { facts, reports, reportsIndexRenders }) {
  const d = structuredClone(descriptor);
  d.mcp.serverVersion = facts.version;
  d.instrument.bankVersion = facts.bankVersion;
  d.instrument.itemsTotal = facts.itemsTotal;
  d.instrument.itemsServedInDefaultRun = facts.itemsServedDefault;
  d.instrument.trialsInDefaultRun = facts.trialsInDefaultRun;
  d.instrument.dimensions = facts.dimensionCount;
  if (facts.subdimensions?.available) d.instrument.subdimensions = facts.subdimensions.total;
  d.instrument.minimumTrialsPerItem = facts.minTrials;
  d.instrument.crisisItemsExcludedByDefault = facts.crisisItemsExcludedByDefault;
  d.modelBenchmark = {
    index: INDEX_JSON_URL,
    llmsFull: LLMS_FULL_URL,
    reportsIndex: reportsIndexRenders ? REPORTS_INDEX_URL : null,
    officialScores: false,
    pilotReports: sortReports(reports).map((r) => ({
      runId: r.wave.run_id,
      date: r.wave.report_date,
      status: "unofficial pilot",
      comparability: r.wave.comparability,
      report: reportUrlFor(r.wave.run_id),
      markdown: markdownUrlFor(r.wave.run_id),
      data: waveUrlFor(r.wave.run_id),
    })),
  };
  return d;
}

// ---------------------------------------------------------------------------
// Loading (build time and tests)
// ---------------------------------------------------------------------------

export const dataDirs = (siteRoot) => ({
  waves: join(siteRoot, "src", "data", "model-benchmark", "waves"),
  reports: join(siteRoot, "src", "data", "model-benchmark", "reports"),
  facts: join(siteRoot, "src", "data", "model-benchmark", "cb-probe-facts.generated.json"),
});

export function loadFacts(siteRoot) {
  return JSON.parse(readFileSync(dataDirs(siteRoot).facts, "utf8"));
}

export function loadManifest(siteRoot) {
  const p = join(dataDirs(siteRoot).waves, "manifest.json");
  return existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : [];
}

/**
 * The reports that render in this build: { entry, mode, wave, title }. `modes` limits them (llms.txt and the other tracked
 * files take "active" only, so an unratified preview never reaches a committed file). The title is read from the report
 * source's front matter; a token in it is an error (a title carries no figure).
 */
export function loadRenderedReports(siteRoot, { env = process.env, modes = ["active", "preview"] } = {}) {
  const d = dataDirs(siteRoot);
  const manifest = loadManifest(siteRoot);
  return renderableEntries(manifest, env, { reportsDir: d.reports })
    .filter((x) => modes.includes(x.mode))
    .map(({ entry, mode }) => {
      const wave = JSON.parse(readFileSync(join(d.waves, `${entry.run_id}.json`), "utf8"));
      const fm = readFrontMatter(readFileSync(join(d.reports, `${entry.run_id}.md`), "utf8"));
      const title = fm.title ?? entry.run_id;
      if (title.includes("{{")) throw new Error(`report ${entry.run_id}: the title carries a token; a title is plain words`);
      return { entry, mode, wave, title };
    });
}

/** The reports-index decision for a set of loaded reports built with the same env and modes as the build's own gate. */
export function reportsIndexRendersFor(siteRoot, env = process.env) {
  return gateReportsIndexRenders(loadManifest(siteRoot), env, { reportsDir: dataDirs(siteRoot).reports });
}
