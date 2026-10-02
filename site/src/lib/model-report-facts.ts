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

/** Structural facts the copy can rely on, each a predicate over the wave. */
export interface WaveShape {
  n: number;
  /** One subject separated from all others, and the others form a single not-separated group. */
  oneApartFromOneGroup: boolean;
  separated: string | null;
  groupSize: number;
  /** The separated subject wrote the shortest median replies. */
  separatedWroteShortest: boolean;
  /** Every judge's figure for the separated subject is negative (below the item mean). */
  directionConsistentAcrossJudges: boolean;
}

export function waveShape(wave: PilotWave): WaveShape {
  const n = wave.derived.subject_count;
  const groups = wave.derived.not_separated_groups;
  const seps = wave.derived.separated_subjects;
  const oneApart = seps.length === 1 && groups.length === 1 && groups[0].length === n - 1;
  const sep = oneApart ? seps[0] : null;
  let shortest = false;
  let consistent = false;
  if (sep) {
    const words = Object.entries(wave.subjects).map(([id, s]) => [id, s.median_reply_words] as const);
    const min = Math.min(...words.map(([, w]) => w));
    shortest = wave.subjects[sep].median_reply_words === min && words.filter(([, w]) => w === min).length === 1;
    const per = Object.values(wave.judges).map((j) => j.by_subject[sep]).filter((v): v is number => typeof v === "number");
    consistent = per.length > 0 && per.every((v) => v < 0);
  }
  return { n, oneApartFromOneGroup: oneApart, separated: sep, groupSize: oneApart ? groups[0].length : 0, separatedWroteShortest: shortest, directionConsistentAcrossJudges: consistent };
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
  const fam = familyName(wave);
  const subject = fam ? `${capFirst(numberWord(wave.derived.subject_count))} ${fam} Models` : `${capFirst(numberWord(wave.derived.subject_count))} Models`;
  return `Unofficial Pilot: ${subject} on the AI Model Compassion Benchmark (${monthYear(wave.report_date)})`;
}

export function reportMetaDescription(wave: PilotWave): string {
  const s = waveShape(wave);
  const fam = familyName(wave);
  const head = `Unofficial pilot (${dateShort(wave.report_date)}): ${numberWord(s.n)} ${fam ?? ""} models judged by ${fam ?? "same-family"} models. `.replace(/\s+/g, " ");
  const find = s.oneApartFromOneGroup
    ? `It separated ${numberWord(1)} from ${numberWord(s.groupSize)} others and could not tell those ${numberWord(s.groupSize)} apart. Not a score.`
    : "It is not a score and carries no ranking.";
  return `${head}${find}`;
}

export function reportSocialLine(wave: PilotWave): string {
  const s = waveShape(wave);
  return s.oneApartFromOneGroup
    ? `The test told ${numberWord(1)} model from ${numberWord(s.groupSize)} others, and could not tell the ${numberWord(s.groupSize)} apart.`
    : "An unofficial pilot of an AI model compassion test. Not a score.";
}

export function ogImageAlt(wave: PilotWave): string {
  return `Compassion Benchmark unofficial pilot ${wave.run_id}: status notice. Not a score, not a ranking.`;
}

/** Plain label for the access tier; throws if the wave's tier is not the one this wording is true for. */
export function accessTierLabel(wave: PilotWave): string {
  const t = wave.design.access_tier;
  if (/^agent\b/i.test(t) && /unverifiable/i.test(t)) return "agent tier, snapshot unverified";
  throw new Error(`access tier "${t}" has no approved plain label: add one to accessTierLabel`);
}

/** Composite-free citable sentences (template D "Citable sentence"; abstract of the Report node). */
export function citableSentences(wave: PilotWave): string[] {
  const s = waveShape(wave);
  const fam = familyName(wave);
  const out: string[] = [];
  out.push(
    `On ${dateLong(wave.report_date)}, Compassion Benchmark's unofficial pilot (${wave.run_id}) tested ${numberWord(s.n)} ${fam ?? ""} models ` +
      `(${accessTierLabel(wave)}) on ${wave.design.items_served} public items, each reply rated by ` +
      `${numberWord(wave.design.judges_per_response)} judges that never rated their own model; it is not a score and its comparability is ${wave.comparability}.`,
  );
  const groups = wave.derived.not_separated_groups;
  if (groups.length) {
    const g = [...groups[0]].sort(alpha);
    out.push(
      `In the same pilot, ${g.join(", ")} (alphabetical order) could not be told apart: each paired difference had a 95% range that includes zero. ` +
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
}

export function pilotPageFacts(wave: PilotWave, report: { word_count: number; sections: { id: string; html: string }[] }): PilotPageFacts {
  const s = waveShape(wave);
  const fam = familyName(wave) ?? "";
  const nW = numberWord(s.n);
  const anchorText = `unofficial pilot of ${nW} ${fam} models (${dateLong(wave.report_date)})`.replace(/\s+/g, " ");
  const apart = s.oneApartFromOneGroup;
  const grp = numberWord(s.groupSize);

  const b1 = apart
    ? `The test separated one model from the other ${grp} and could not tell those ${grp} apart. Not separated is not the same as equal: the pilot cannot say.`
    : "The report states which models the test could and could not tell apart. Not separated is not the same as equal.";
  const b2 = apart && s.separatedWroteShortest
    ? "The separated model also wrote much shorter replies, so the pilot cannot say whether the gap is about compassion or about reply length. The cause is unresolved."
    : "The report sets out how reply length relates to the separation. Any cause is unresolved.";
  const b3 = `The judges were ${fam ? `${fam} ` : ""}models, not people, and ${wave.bank.items_validated} of ${wave.bank.items_total} test items have passed human review. None of this is a score.`.replace(/\s+/g, " ");

  const hero = apart
    ? `One unofficial pilot of ${nW} ${fam} models tested the test, not the models: it separated one model from ${grp} others and could not tell those ${grp} apart. It is not a score.`
    : `One unofficial pilot of ${nW} ${fam} models tested the test, not the models. It is not a score.`;
  const banner = `One unofficial pilot (not a score) is reported under Pilot results.`;

  const li = (report.sections.find((x) => x.id === "not-scores")?.html.match(/<li>/g) ?? []).length;

  const faq = [
    {
      question: "What did the pilot find?",
      answer:
        `In an unofficial pilot dated ${dateLong(wave.report_date)}, Compassion Benchmark tested ${nW} ${fam} models with ${fam} models as judges. ` +
        (apart
          ? `The test separated one model from the other ${grp} and could not tell those ${grp} apart. `
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
          ? `The pilot separated one model from ${grp} others, but that model also wrote much shorter replies, and the design cannot tell a real difference in compassion from a penalty on short replies; the cause is unresolved. `
          : "The pilot cannot say whether any difference reflects the model or the length of its replies; the cause is unresolved. ") +
        "The pilot did not measure model size, and it supports no comparison with models outside it.",
    },
  ];
  const addendum = apart
    ? ` Its only model results come from an ${anchorText}, which separated one model from the other ${grp} and could not tell those ${grp} apart. That pilot is not a score.`
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
  };
  const all: Record<string, string> = { hero, banner, addendum, anchorText };
  facts.bullets.forEach((b, i) => (all[`bullet ${i + 1}`] = b));
  faq.forEach((f, i) => {
    all[`faq ${i + 1} question`] = f.question;
    all[`faq ${i + 1} answer`] = f.answer;
  });
  for (const [label, text] of Object.entries(all)) assertLexicon(`/ai-models pilot ${label}`, text, wave);
  return facts;
}

export { makeNaming };
