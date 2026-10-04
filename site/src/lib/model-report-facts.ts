/**
 * model-report-facts.ts -- every sentence the site derives from a pilot wave
 * outside the compiled narrative: titles, meta, JSON-LD strings, the /ai-models
 * card and FAQ, chart annotations. Nothing here is typed by hand: counts and
 * names come from the wave file, and each claim sits behind a predicate over
 * the wave. When a predicate is false the text falls back to a plain,
 * claim-free sentence (or the build fails, for chart annotations).
 *
 * Every derived string is run through the same lexicon the narrative compiler
 * uses (`lexiconProblems`, template D). A problem throws, which fails the build.
 */

import type { PilotWave } from "@/lib/model-wave-facts";
import { lexiconProblems, makeNaming } from "../../scripts/lib/model-report.mjs";
import { frontMatterObject, separationWords, markdownUrlFor, preregistrationSha, INDEX_JSON_URL, REPORTS_INDEX_URL } from "../../scripts/lib/model-benchmark-public.mjs";

export const SITE_URL = "https://compassionbenchmark.com";

const NUMBER_WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
export const numberWord = (n: number): string => NUMBER_WORDS[n] ?? String(n);
export const capFirst = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** "2026-10-01" -> "1 October 2026" */
export function dateLong(iso: string): string {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return iso;
  return `${Number(m[3])} ${MONTHS[Number(m[2]) - 1]} ${m[1]}`;
}
/** "2026-10-01" -> "1 Oct 2026" */
export function dateShort(iso: string): string {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return iso;
  return `${Number(m[3])} ${MONTHS[Number(m[2]) - 1].slice(0, 3)} ${m[1]}`;
}
/** "2026-10-01" -> "Oct 2026" */
export function monthYear(iso: string): string {
  const m = iso.match(/^(\d{4})-(\d{2})-/);
  if (!m) return iso;
  return `${MONTHS[Number(m[2]) - 1].slice(0, 3)} ${m[1]}`;
}

export const alpha = (a: string, b: string): number => (a < b ? -1 : a > b ? 1 : 0);

/** Common first segment of the subject ids ("claude"), title-cased, or null. */
export function familyName(wave: PilotWave): string | null {
  const ids = wave.design.subjects;
  const firsts = new Set(ids.map((i) => i.split("-")[0]));
  if (ids.length > 1 && firsts.size === 1 && ids.every((i) => i.includes("-"))) {
    const f = [...firsts][0];
    return f.charAt(0).toUpperCase() + f.slice(1);
  }
  return null;
}

/**
 * The family the JUDGES came from, capitalised ("Claude"), or null when it cannot be established. A wave that proves
 * its judge families (judge_set) is read from there; an older wave's judges shared its subjects' family.
 */
export function judgeFamilyName(wave: PilotWave): string | null {
  const jf = wave.judge_set?.judge_families;
  if (jf && jf.length === 1) return capFirst(jf[0]);
  return jf ? null : familyName(wave);
}

/** Are the judges proven to be a different model family from every subject? */
export function judgesAreCrossFamily(wave: PilotWave): boolean {
  return wave.judge_set?.families_disjoint === true && wave.judge_set?.disjoint_from_subjects === true;
}

/** Local open-weight builds (the tier string starts "local-open-weight"). */
export function isLocalOpenWeight(wave: PilotWave): boolean {
  return /^local-open-weight\b/i.test(wave.design.access_tier);
}

/**
 * How to describe the models in a phrase ("Claude", "open-weight"), or null. A common first id segment names the
 * family; otherwise a local open-weight wave is described by its tier; otherwise nothing is claimed.
 */
export function subjectDescriptor(wave: PilotWave): string | null {
  const fam = familyName(wave);
  if (fam) return fam;
  return isLocalOpenWeight(wave) ? "open-weight" : null;
}

/** Structural facts the copy can rely on, each a predicate over the wave. */
export interface WaveShape {
  /** Models in words: the subjects, or (an arms wave, amendment 16) the BUILDS, each of which is run in every arm. */
  n: number;
  /** An arms wave: every subject is a (build, arm) variant and the separation is the primary arm's, after correction. */
  arms: boolean;
  /** Subjects the separation was tested among: all of them, or the primary arm's variants. */
  familySize: number;
  /** Every subject is in one not-separated group and none is separated (nothing else to report about separation). */
  allOneGroup: boolean;
  /** One subject separated from all others, and the others form a single not-separated group. */
  oneApartFromOneGroup: boolean;
  separated: string | null;
  groupSize: number;
  /** The separated subject wrote the shortest median replies. */
  separatedWroteShortest: boolean;
  /** Every judge's figure for the separated subject is negative (below the item mean). */
  directionConsistentAcrossJudges: boolean;
  /** Every judge's figure for the separated subject is positive (above the item mean). */
  directionAboveAcrossJudges: boolean;
}

/** Is this an arms wave (every build in two arms; template amendment 16)? */
export function isArmsWave(wave: PilotWave): boolean {
  return wave.derived.display_rule !== undefined;
}

export function waveShape(wave: PilotWave): WaveShape {
  const arms = isArmsWave(wave);
  const familySize = arms ? (wave.derived.primary_arm_subject_count ?? wave.derived.subject_count) : wave.derived.subject_count;
  const n = arms ? (wave.derived.build_count ?? familySize) : familySize;
  const groups = wave.derived.not_separated_groups;
  const seps = wave.derived.separated_subjects;
  const oneApart = seps.length === 1 && groups.length === 1 && groups[0].length === familySize - 1;
  const sep = oneApart ? seps[0] : null;
  let shortest = false;
  let consistent = false;
  let above = false;
  if (sep) {
    // The separated subject is compared with the subjects the separation was tested among.
    const family = arms ? (wave.derived.by_arm?.[wave.derived.primary_arm ?? ""]?.subjects ?? Object.keys(wave.subjects)) : Object.keys(wave.subjects);
    const words = family.map((id) => [id, wave.subjects[id].median_reply_words] as const);
    const min = Math.min(...words.map(([, w]) => w));
    shortest = wave.subjects[sep].median_reply_words === min && words.filter(([, w]) => w === min).length === 1;
    const per = Object.values(wave.judges).map((j) => j.by_subject[sep]).filter((v): v is number => typeof v === "number");
    consistent = per.length > 0 && per.every((v) => v < 0);
    above = per.length > 0 && per.every((v) => v > 0);
  }
  const allOne = seps.length === 0 && groups.length === 1 && groups[0].length === familySize;
  return { n, arms, familySize, allOneGroup: allOne, oneApartFromOneGroup: oneApart, separated: sep, groupSize: oneApart ? groups[0].length : 0, separatedWroteShortest: shortest, directionConsistentAcrossJudges: consistent, directionAboveAcrossJudges: above };
}

/** Throws (failing the build) when a derived string breaks the copy rules of template D. */
export function assertLexicon(label: string, text: string, wave: PilotWave): void {
  const problems = lexiconProblems(text, wave) as { rule: string; message: string }[];
  if (problems.length) {
    throw new Error(`copy rule failure in ${label}:\n  ${problems.map((p) => `${p.rule}: ${p.message}`).join("\n  ")}`);
  }
}

// ---------------------------------------------------------------------------
// Titles, meta, social
// ---------------------------------------------------------------------------

export function reportTitle(wave: PilotWave): string {
  const desc = subjectDescriptor(wave);
  const arms = isArmsWave(wave);
  // An arms wave counts BUILDS (each is run in every arm), not variants.
  const n = capFirst(numberWord(arms ? (wave.derived.build_count ?? wave.derived.subject_count) : wave.derived.subject_count));
  const models = desc ? `${n} ${desc.split("-").map(capFirst).join("-")} Models` : `${n} Models`;
  const subject = arms ? `${models}, Each Run Two Ways,` : models;
  return `Unofficial Pilot: ${subject} on the AI Model Compassion Benchmark (${monthYear(wave.report_date)})`;
}

/** "Claude" for a same-family wave; "Claude" also for a cross-family wave (the judges' family); else the plain fallback. */
function judgesPhrase(wave: PilotWave): string {
  return judgeFamilyName(wave) ?? "same-family";
}

/** What an arms wave found, in words with no figure: the primary arm after correction, and the secondary arm's ranges only. */
function armsMetaFind(s: WaveShape): string {
  if (s.oneApartFromOneGroup) return `In its primary arm it separated one from ${numberWord(s.groupSize)} others after correction and could not tell those ${numberWord(s.groupSize)} apart; the secondary arm shows ranges only. Not a score.`;
  if (s.allOneGroup) return `In its primary arm it could not tell the ${numberWord(s.familySize)} apart after correction; the secondary arm shows ranges only. Not a score.`;
  return "It is not a score and carries no ranking.";
}

export function reportMetaDescription(wave: PilotWave): string {
  const s = waveShape(wave);
  const desc = subjectDescriptor(wave);
  const head = `Unofficial pilot (${dateShort(wave.report_date)}): ${numberWord(s.n)} ${desc ?? ""} models${s.arms ? ", each run in two arms," : ""} judged by ${judgesPhrase(wave)} models. `.replace(/\s+/g, " ");
  const find = s.arms
    ? armsMetaFind(s)
    : s.oneApartFromOneGroup
      ? `It separated ${numberWord(1)} from ${numberWord(s.groupSize)} others and could not tell those ${numberWord(s.groupSize)} apart. Not a score.`
      : s.allOneGroup
        ? `It could not tell the ${numberWord(s.n)} models apart. Not a score.`
        : "It is not a score and carries no ranking.";
  return `${head}${find}`;
}

export function reportSocialLine(wave: PilotWave): string {
  const s = waveShape(wave);
  if (s.arms) return s.oneApartFromOneGroup ? `In one arm, after correction, the test told ${numberWord(1)} model from ${numberWord(s.groupSize)} others, and could not tell the ${numberWord(s.groupSize)} apart.` : "An unofficial pilot of an AI model compassion test, with each model run two ways. Not a score.";
  return s.oneApartFromOneGroup
    ? `The test told ${numberWord(1)} model from ${numberWord(s.groupSize)} others, and could not tell the ${numberWord(s.groupSize)} apart.`
    : s.allOneGroup
      ? `The test could not tell the ${numberWord(s.n)} models apart.`
      : "An unofficial pilot of an AI model compassion test. Not a score.";
}

export function ogImageAlt(wave: PilotWave): string {
  return `Compassion Benchmark unofficial pilot ${wave.run_id}: status notice. Not a score, not a ranking.`;
}

/** Plain label for the access tier; throws if the wave's tier is not the one this wording is true for. */
export function accessTierLabel(wave: PilotWave): string {
  const t = wave.design.access_tier;
  if (/^agent\b/i.test(t) && /unverifiable/i.test(t)) return "agent tier, snapshot unverified";
  // Local open-weight builds pinned by digest: the bit width is read from the tier string itself, never typed here.
  if (/^local-open-weight\b/i.test(t) && /pinned by digest/i.test(t)) {
    const bits = t.match(/(\d+)-bit quantised/i);
    return bits ? `local open-weight build, ${bits[1]}-bit quantised` : "local open-weight build";
  }
  throw new Error(`access tier "${t}" has no approved plain label: add one to accessTierLabel`);
}

/** Composite-free citable sentences (template D "Citable sentence"; abstract of the Report node). */
export function citableSentences(wave: PilotWave): string[] {
  const s = waveShape(wave);
  const desc = subjectDescriptor(wave);
  const judged = judgesAreCrossFamily(wave)
    ? `${numberWord(wave.design.judges_per_response)} judges from a different model family than the models tested`
    : `${numberWord(wave.design.judges_per_response)} judges that never rated their own model`;
  const out: string[] = [];
  out.push(
    `On ${dateLong(wave.report_date)}, Compassion Benchmark's unofficial pilot (${wave.run_id}) tested ${numberWord(s.n)} ${desc ?? ""} models${s.arms ? ", each in two arms," : ""} ` +
      `(${accessTierLabel(wave)}) on ${wave.design.items_served} public items, each reply rated by ` +
      `${judged}; it is not a score and its comparability is ${wave.comparability}.`,
  );
  const groups = wave.derived.not_separated_groups;
  if (groups.length) {
    const g = [...groups[0]].sort(alpha);
    // Two names read "a and b"; three or more keep the list form the first pilot shipped with.
    const names = g.length === 2 ? `${g[0]} and ${g[1]}` : g.join(", ");
    out.push(
      s.arms
        ? `In the same pilot, in the primary arm and after correction for multiple comparisons, ${names} (alphabetical order) could not be told apart: each paired difference had a corrected range that includes zero. ` +
            `The pilot cannot say which is higher; that is not the same as equal. The secondary arm shows ranges only.`
        : `In the same pilot, ${names} (alphabetical order) could not be told apart: each paired difference had a 95% range that includes zero. ` +
            `The pilot cannot say which is higher; that is not the same as equal.`,
    );
  }
  return out.map((t) => t.replace(/\s+/g, " "));
}

export function reportCreativeWorkStatus(): string {
  return "Unofficial pilot — not an official score; comparability: none";
}

/** Reading time in whole minutes at 230 words per minute (never below 1). */
export function readingMinutes(wordCount: number): number {
  return Math.max(1, Math.round(wordCount / 230));
}

export function reportPath(runId: string): string {
  return `/ai-models/reports/${runId}`;
}
export function reportUrl(runId: string): string {
  return `${SITE_URL}${reportPath(runId)}`;
}
export function waveFileUrl(runId: string): string {
  return `${SITE_URL}/data/model-waves/${runId}.json`;
}
/** The markdown alternate of a report (public/ai-models/reports/<run_id>.md, written by export-model-wave-public.mjs). */
export function markdownPath(runId: string): string {
  return `/ai-models/reports/${runId}.md`;
}
export function markdownUrl(runId: string): string {
  return markdownUrlFor(runId) as string;
}
export const MODEL_BENCHMARK_INDEX_URL: string = INDEX_JSON_URL;
export const REPORTS_INDEX_PAGE_URL: string = REPORTS_INDEX_URL;

/**
 * Data-and-citation block of a report page (template G/H: a citation is plain words; no figure, no model name).
 * The citation names the title, date, URL, run id and the unofficial status; the pre-registration hash is shown
 * where the wave carries one.
 */
export interface ReportCitation {
  citation: string;
  waveUrl: string;
  markdownUrl: string;
  indexUrl: string;
  preregistrationSha256: string | null;
}
export function reportCitation(wave: PilotWave, title: string): ReportCitation {
  const citation = `Compassion Benchmark. "${title}." Unofficial pilot, run ${wave.run_id}, ${dateLong(wave.report_date)}. Not a score; comparability: ${wave.comparability}. ${reportUrl(wave.run_id)}`;
  assertLexicon("report citation", citation, wave);
  return {
    citation,
    waveUrl: waveFileUrl(wave.run_id),
    markdownUrl: markdownUrl(wave.run_id),
    indexUrl: INDEX_JSON_URL as string,
    preregistrationSha256: preregistrationSha(wave) as string | null,
  };
}

/** The report title from the compiled front-matter lines (the same text the report page shows as its H1). */
export function titleFromFrontMatter(lines: string[], fallback: string): string {
  return (frontMatterObject(lines) as Record<string, string>).title ?? fallback;
}

/** One row of the /ai-models/reports index: words and links only. No figure for any model; the order is by date, never by result. */
export interface ReportsIndexItem {
  runId: string;
  title: string;
  dateLong: string;
  date: string;
  subjects: string[];
  statusLabel: string;
  separation: string;
  reportPath: string;
  markdownPath: string;
  waveUrl: string;
}
export function reportsIndexItem(wave: PilotWave, title: string): ReportsIndexItem {
  const separation = separationWords(wave) as string;
  const statusLabel = `Unofficial pilot. Not a score, not a ranking; comparability: ${wave.comparability}.`;
  assertLexicon(`reports index ${wave.run_id} separation`, separation, wave);
  assertLexicon(`reports index ${wave.run_id} status`, statusLabel, wave);
  return {
    runId: wave.run_id,
    title,
    dateLong: dateLong(wave.report_date),
    date: wave.report_date,
    subjects: [...wave.design.subjects].sort(alpha),
    statusLabel,
    separation,
    reportPath: reportPath(wave.run_id),
    markdownPath: markdownPath(wave.run_id),
    waveUrl: waveFileUrl(wave.run_id),
  };
}

/**
 * Strings that go to meta, OG and JSON-LD. Checked once, here, so the page cannot skip it.
 * The narrative's front matter may supply `meta_description` and `abstract` (token-resolved and
 * compile-checked by the report compiler); when absent they are derived here. The title is always
 * derived: template D fixes its form ("Four ... (Oct 2026)").
 */
export function reportSeoStrings(wave: PilotWave, front: Record<string, string> = {}) {
  const title = reportTitle(wave);
  if (front.seo_title && front.seo_title !== title) {
    console.warn(`[model-report-facts] front-matter seo_title "${front.seo_title}" differs from the template title "${title}"; using the template title`);
  }
  const description = front.meta_description || reportMetaDescription(wave);
  const social = reportSocialLine(wave);
  const alt = ogImageAlt(wave);
  const abstract = front.abstract || citableSentences(wave).join(" ");
  const status = reportCreativeWorkStatus();
  for (const [label, text] of Object.entries({ title, description, social, alt, abstract, status })) {
    assertLexicon(`report ${label}`, text, wave);
  }
  return { title, description, social, alt, abstract, status };
}

export function reportJsonLd(wave: PilotWave, front: Record<string, string> = {}) {
  const t = reportSeoStrings(wave, front);
  const org = { "@type": "Organization", name: "Compassion Benchmark", url: SITE_URL };
  return {
    "@context": "https://schema.org",
    "@type": "Report",
    headline: t.title,
    description: t.description,
    reportNumber: wave.run_id,
    creativeWorkStatus: t.status,
    abstract: t.abstract,
    datePublished: wave.report_date,
    dateCreated: wave.report_date,
    inLanguage: "en",
    author: org,
    publisher: org,
    isPartOf: { "@type": "WebPage", "@id": `${SITE_URL}/ai-models` },
    isBasedOn: waveFileUrl(wave.run_id),
    mainEntityOfPage: reportUrl(wave.run_id),
    isAccessibleForFree: true,
  };
}

// ---------------------------------------------------------------------------
// /ai-models: card, hero, FAQ (words only, no per-model figure)
// ---------------------------------------------------------------------------

export interface PilotPageFacts {
  runId: string;
  href: string;
  dateLong: string;
  anchorText: string;
  readingMinutes: number;
  bullets: string[];
  heroSentence: string;
  bannerClause: string;
  notScoresCount: number;
  faq: { question: string; answer: string }[];
  faqQ1Addendum: string;
  /** Card heading for this pilot (date and run id; no model name, no figure). */
  heading: string;
  /** What this pilot found, as a clause with no figure: "could not tell its two models apart". */
  finding: string;
  /** Short coverage phrase for copy that names no model: "two open-weight models". */
  coverage: string;
}

/** "one developer's four Claude models" for a single-family wave; "two open-weight models" otherwise. No figure, no model name. */
export function pilotCoverage(wave: PilotWave): string {
  if (isArmsWave(wave)) return `${numberWord(wave.derived.build_count ?? wave.derived.subject_count)} ${subjectDescriptor(wave) ?? ""} models, each run in two arms,`.replace(/\s+/g, " ");
  const n = numberWord(wave.derived.subject_count);
  const fam = familyName(wave);
  if (fam) return `one developer's ${n} ${fam} models`;
  return `${n} ${subjectDescriptor(wave) ?? ""} models`.replace(/\s+/g, " ");
}

/** "a, b and c" */
function listJoin(xs: string[]): string {
  if (xs.length <= 1) return xs.join("");
  return `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`;
}

/** Do the subjects' recorded parameter sizes differ? (A fact about the pilot's design, from the wave's provenance block.) */
function sizesDiffer(wave: PilotWave): boolean {
  const p = wave.subject_provenance;
  if (!p) return false;
  return new Set(Object.values(p).map((x) => x.parameter_size)).size > 1;
}

/** What a pilot found about separation, in words and with no figure. */
function findingClause(wave: PilotWave): string {
  const s = waveShape(wave);
  if (s.arms) {
    if (s.oneApartFromOneGroup) return `separated one model from the other ${numberWord(s.groupSize)} in its primary arm, after correction for multiple comparisons, and could not tell those ${numberWord(s.groupSize)} apart; its secondary arm shows ranges only`;
    if (s.allOneGroup) return `could not tell its ${numberWord(s.familySize)} models apart in its primary arm, after correction for multiple comparisons; its secondary arm shows ranges only`;
    return "states which models it could and could not tell apart";
  }
  if (s.oneApartFromOneGroup) return `separated one model from the other ${numberWord(s.groupSize)} and could not tell those ${numberWord(s.groupSize)} apart`;
  if (s.allOneGroup) return `could not tell its ${numberWord(s.n)} models apart`;
  return "states which models it could and could not tell apart";
}

export function pilotPageFacts(wave: PilotWave, report: { word_count: number; sections: { id: string; html: string }[] }): PilotPageFacts {
  const s = waveShape(wave);
  const desc = subjectDescriptor(wave) ?? "";
  const jfam = judgeFamilyName(wave) ?? "";
  const cross = judgesAreCrossFamily(wave);
  const nW = numberWord(s.n);
  const anchorText = `unofficial pilot of ${nW} ${desc} models${s.arms ? ", each in two arms," : ""} (${dateLong(wave.report_date)})`.replace(/\s+/g, " ").replace(", (", " (");
  const apart = s.oneApartFromOneGroup;
  const grp = numberWord(s.groupSize);
  // An arms wave (amendment 16): the separation is the primary arm's, after correction for multiple comparisons; the secondary arm shows ranges only.
  const where = s.arms ? " in its primary arm, after correction for multiple comparisons" : "";
  const second = s.arms ? " The secondary arm shows ranges only." : "";

  const b1 = apart
    ? `The test${where} separated one model from the other ${grp} and could not tell those ${grp} apart.${second} Not separated is not the same as equal: the pilot cannot say.`
    : s.allOneGroup
      ? `The test${where} could not tell the ${s.arms ? numberWord(s.familySize) : nW} models apart.${second} Not separated is not the same as equal: the pilot cannot say.`
      : "The report states which models the test could and could not tell apart. Not separated is not the same as equal.";
  const b2 = apart && s.separatedWroteShortest
    ? "The separated model also wrote much shorter replies, so the pilot cannot say whether the gap is about compassion or about reply length. The cause is unresolved."
    : s.arms
      ? "The report sets out how reply length relates to the separation, and whether the length instruction moved reply length for each build. Any cause is unresolved."
      : "The report sets out how reply length relates to the separation. Any cause is unresolved.";
  const b3 = (cross
    ? `The judges were ${jfam ? `${jfam} ` : ""}models from a different family than the models tested, not people, and ${wave.bank.items_validated} of ${wave.bank.items_total} test items have passed human review. None of this is a score.`
    : `The judges were ${jfam ? `${jfam} ` : ""}models, not people, and ${wave.bank.items_validated} of ${wave.bank.items_total} test items have passed human review. None of this is a score.`
  ).replace(/\s+/g, " ");

  const hero = apart
    ? `One unofficial pilot of ${nW} ${desc} models${s.arms ? ", each run in two arms," : ""} tested the test, not the models: it${where} separated one model from ${grp} others and could not tell those ${grp} apart.${second} It is not a score.`
    : s.allOneGroup
      ? `One unofficial pilot of ${nW} ${desc} models${s.arms ? ", each run in two arms," : ""} tested the test, not the models: it${where} could not tell the ${s.arms ? numberWord(s.familySize) : nW} models apart.${second} It is not a score.`
      : `One unofficial pilot of ${nW} ${desc} models${s.arms ? ", each run in two arms," : ""} tested the test, not the models. It is not a score.`;
  const banner = `One unofficial pilot (not a score) is reported under Pilot results.`;

  const li = (report.sections.find((x) => x.id === "not-scores")?.html.match(/<li>/g) ?? []).length;

  const judgedBy = cross
    ? `tested ${nW} ${desc} models${s.arms ? ", each in two arms," : ""} with ${jfam} models from a different family as judges. `
    : `tested ${nW} ${desc} models${s.arms ? ", each in two arms," : ""} with ${jfam} models as judges. `;
  const faq = [
    {
      question: "What did the pilot find?",
      answer:
        `In an unofficial pilot dated ${dateLong(wave.report_date)}, Compassion Benchmark ${judgedBy}` +
        (apart
          ? `The test${where} separated one model from the other ${grp} and could not tell those ${grp} apart.${second} `
          : s.allOneGroup
            ? `The test${where} could not tell the ${s.arms ? numberWord(s.familySize) : nW} models apart.${second} `
            : "The report states which models the test could and could not tell apart. ") +
        (apart && s.separatedWroteShortest
          ? "The separated model also wrote much shorter replies, so the pilot cannot say whether the gap is about compassion or about reply length. "
          : "") +
        `Nothing in the pilot is an official score: every figure is marked unofficial, with comparability ${wave.comparability}.`,
    },
    {
      question: "Does it show smaller models are less compassionate?",
      answer:
        "No. " +
        (apart && s.separatedWroteShortest
          ? `The pilot${where} separated one model from ${grp} others, but that model also wrote much shorter replies, and the design cannot tell a real difference in compassion from a penalty on short replies; the cause is unresolved. `
          : s.allOneGroup
            ? "The pilot could not tell its models apart, and the cause of any difference it did see is unresolved. "
            : "The pilot cannot say whether any difference reflects the model or the length of its replies; the cause is unresolved. ") +
        (sizesDiffer(wave)
          ? "The models differ in size, but also in developer, training and design, so the pilot cannot attribute any difference to size, and it supports no comparison with models outside it."
          : "The pilot did not measure model size, and it supports no comparison with models outside it."),
    },
  ];
  const addendum = apart
    ? ` Its only model results come from an ${anchorText}, which${where} separated one model from the other ${grp} and could not tell those ${grp} apart.${second} That pilot is not a score.`
    : s.allOneGroup
      ? ` Its only model results come from an ${anchorText}, which${where} could not tell the ${s.arms ? numberWord(s.familySize) : nW} models apart.${second} That pilot is not a score.`
      : ` Its only model results come from an ${anchorText}. That pilot is not a score.`;

  const facts: PilotPageFacts = {
    runId: wave.run_id,
    href: reportPath(wave.run_id),
    dateLong: dateLong(wave.report_date),
    anchorText,
    readingMinutes: readingMinutes(report.word_count),
    bullets: [b1, b2, b3],
    heroSentence: hero,
    bannerClause: banner,
    notScoresCount: li,
    faq,
    faqQ1Addendum: addendum,
    heading: `Pilot of ${dateLong(wave.report_date)} (${wave.run_id})`,
    finding: findingClause(wave),
    coverage: `${nW} ${desc} models${s.arms ? ", each run in two arms" : ""}`.replace(/\s+/g, " "),
  };
  const all: Record<string, string> = { hero, banner, addendum, anchorText, heading: facts.heading, finding: facts.finding };
  facts.bullets.forEach((b, i) => (all[`bullet ${i + 1}`] = b));
  faq.forEach((f, i) => {
    all[`faq ${i + 1} question`] = f.question;
    all[`faq ${i + 1} answer`] = f.answer;
  });
  for (const [label, text] of Object.entries(all)) assertLexicon(`/ai-models pilot ${label}`, text, wave);
  return facts;
}

/**
 * Everything /ai-models says about the published pilots, in one place. `pilots` is every rendered report, newest first
 * (the manifest order). With one pilot every string is the single-pilot wording; with two or more, each sentence is
 * generated from the manifest and says what each pilot found in words, never a figure and never an ordering of models.
 * Each string passes the template D lexicon (the first wave of the set is the reference for naming).
 */
export interface PilotsPageFacts {
  count: number;
  countWord: string;
  items: PilotPageFacts[];
  latest: PilotPageFacts;
  heroSentence: string;
  bannerClause: string;
  /** Appended to the page's meta description (leading space). */
  metaClause: string;
  /** The "Accurate to say" quotation (without quote marks). */
  accurateClause: string;
  /** Appended to the "Not accurate" list (leading space). */
  notAccurateClause: string;
  cardDescription: string;
  faq: { question: string; answer: string }[];
  faqQ1Addendum: string;
  newsletterBody: string;
  /** Run-log verdict sentence for one pilot. */
  runLogVerdict: string;
}

type PilotInput = { wave: PilotWave; report: { word_count: number; sections: { id: string; html: string }[] } };

export function pilotsPageFacts(pilots: PilotInput[]): PilotsPageFacts {
  if (pilots.length === 0) throw new Error("pilotsPageFacts needs at least one rendered pilot");
  const items = pilots.map((p) => pilotPageFacts(p.wave, p.report));
  const count = items.length;
  const countWord = numberWord(count);
  const Count = capFirst(countWord);
  const latest = items[0];
  const waveRef = pilots[0].wave;
  const single = count === 1;
  const noneIs = count === 2 ? "Neither is" : "None is";
  // True only when a pilot separated one model AND that model wrote the shortest replies (a predicate over its wave).
  const shortSeparated = pilots.some((p) => {
    const sh = waveShape(p.wave);
    return sh.oneApartFromOneGroup && sh.separatedWroteShortest;
  });

  // One pilot: the single-pilot strings, unchanged.
  const wave1 = pilots[0].wave;
  const nW1 = numberWord(wave1.derived.subject_count);
  const oneDeveloper = familyName(wave1) !== null; // a common id family means one developer's models
  const newsletterBody = single
    ? `The pilot covers ${oneDeveloper ? `one developer's ${nW1} models` : `${latest.coverage}`} and no result in it is official. One email on Fridays, with the highlights where new research is announced. It is free, and you can unsubscribe in one click.`
    : `${Count} unofficial pilots are published and no result in any of them is official. One email on Fridays, with the highlights where new research is announced. It is free, and you can unsubscribe in one click.`;

  const sentenceFor = (i: PilotPageFacts, first: boolean) => `${first ? "The" : "the"} pilot of ${i.dateLong} ${i.finding}`;
  const hero = single
    ? latest.heroSentence
    : `${Count} unofficial pilots tested the test, not the models. ${items.map((i, k) => sentenceFor(i, k === 0)).join("; ")}. ${noneIs} a score.`;
  const banner = single ? latest.bannerClause : `${Count} unofficial pilots (not scores) are reported under Pilot results.`;
  const metaClause = single ? " One unofficial pilot is reported separately; it is not a score." : ` ${Count} unofficial pilots are reported separately; ${count === 2 ? "neither" : "none"} is a score.`;
  const accurateClause = single
    ? "Its only model results come from one unofficial pilot, which is not a score and carries no ranking."
    : `Its only model results come from ${countWord} unofficial pilots, which are not scores and carry no ranking.`;
  const notAccurateClause = single ? " Reading the unofficial pilot as a score or a ranking of the models in it." : " Reading an unofficial pilot as a score or a ranking of the models in it.";
  const cardDescription = single
    ? "One unofficial pilot tested the test, not the models. It is not a score, not a ranking, and it supports no comparison with any other model."
    : `${Count} unofficial pilots tested the test, not the models. ${noneIs} a score or a ranking, and they support no comparison with each other or with any other model.`;

  const faq = single
    ? latest.faq
    : [
        {
          question: "What did the pilots find?",
          answer:
            `${Count} unofficial pilots have been published. ` +
            `${items.map((i) => `${sentenceFor(i, true)}.`).join(" ")} ` +
            `Nothing in them is an official score: every figure is marked unofficial, with comparability ${waveRef.comparability}.`,
        },
        {
          question: "Does it show smaller models are less compassionate?",
          answer:
            "No. " +
            `${items.map((i) => `${sentenceFor(i, true)}.`).join(" ")} ` +
            (shortSeparated
              ? "Where a pilot did separate a model, that model also wrote much shorter replies, and the design cannot tell a real difference in compassion from a penalty on short replies; the cause is unresolved. "
              : "Any difference a pilot did see may reflect reply length rather than compassion; the cause is unresolved. ") +
            "No pilot isolated model size, and the pilots support no comparison with each other or with models outside them.",
        },
      ];
  const faqQ1Addendum = single
    ? latest.faqQ1Addendum
    : ` Its only model results come from ${countWord} unofficial pilots: ${listJoin(items.map((i) => i.anchorText))}. ${noneIs} a score.`;
  const runLogVerdict = "Not a score. It tested the test, not the models; see Pilot results (unofficial).";

  const out: PilotsPageFacts = { count, countWord, items, latest, heroSentence: hero, bannerClause: banner, metaClause, accurateClause, notAccurateClause, cardDescription, faq, faqQ1Addendum, newsletterBody, runLogVerdict };
  // The "not accurate" clause is a list item that follows the words "Not accurate:" on the page; checked with them.
  const strings: Record<string, string> = { hero, banner, metaClause, accurateClause, notAccurateClause: `Not accurate:${notAccurateClause}`, cardDescription, faqQ1Addendum, newsletterBody };
  faq.forEach((f, i) => { strings[`faq ${i + 1} question`] = f.question; strings[`faq ${i + 1} answer`] = f.answer; });
  // The aggregate sentences name no model, so any wave serves as the lexicon reference; they are checked against every pilot's wave.
  for (const p of pilots) for (const [label, text] of Object.entries(strings)) assertLexicon(`/ai-models pilots ${label}`, text, p.wave);
  return out;
}


export { makeNaming };
