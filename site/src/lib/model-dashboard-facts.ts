/**
 * model-dashboard-facts.ts -- the server-side adapter of the AI Model Compassion Dashboard (/ai-models/dashboard).
 * Build time only (reads the wave files with fs).
 *
 * THE ONLY DATA PATH. Everything the dashboard shows, and everything it sends to the browser or to a download, is built
 * from `projectWavePublic(wave)` (the public projection: a not-separated or secondary-arm subject's points and every
 * point difference that involves one are DELETED, not hidden), from MODEL_INDEX_FACTS, from release-watch facts and
 * from MODEL_WAVE_FACTS. The raw wave object lives only inside `loadDashboardData` and is dropped when it returns, so
 * a component cannot reach a withheld value. `scripts/test-model-dashboard.mjs` greps the dashboard source for
 * `research/model-runs`, `analysis.json` and raw-wave reads.
 *
 * Render rule: the dashboard's own gate (dashboard-render-gate.mjs: D-29b ratified, or CB_PREVIEW_DASHBOARD=1) AND the pilot
 * wave rule (pilot-render-gate.mjs): the wave's decision is active (or the local preview flag is on) AND its report narrative exists. Official waves never render (FR-01 AC3).
 */

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { PilotWave, ManifestEntry, WaveSubject, PairwiseEntry, ComparisonEntry, DimensionPairwiseEntry } from "@/lib/model-wave-facts";
import { MODEL_WAVE_FACTS } from "@/lib/model-wave-facts";
import { loadRenderable, type RenderMode } from "@/lib/model-report-gate";
import { getWaveManifest } from "@/lib/model-wave-facts";
import { dashboardEntries as dashboardEntriesFor } from "../../scripts/lib/dashboard-render-gate.mjs";
import { MODEL_INDEX_FACTS } from "@/lib/model-index-facts";
import { RELEASE_WATCH_FACTS } from "@/lib/release-watch-facts";
import { DIMENSIONS } from "@/data/dimensions";
import {
  accessTierLabel, assertLexicon, dateLong, monthYear, numberWord, alpha, citableSentences, judgeFamilyName, SITE_URL,
} from "@/lib/model-report-facts";
import { shapeFor, assertShapesSuffice, type ShapeKind } from "@/components/model-benchmark/pilot/figure-kit";
import { projectWavePublic, projectionProblems } from "../../scripts/lib/model-benchmark-public.mjs";
import {
  buildOf, buildIds, panelSubjects, dashboardRows, hasArms, primaryArm, DASHBOARD_PATH, PANEL_CODES, accessTierPlain,
} from "../../scripts/lib/model-dashboard-core.mjs";
import { dashboardCopy } from "@/lib/model-dashboard-copy";

// ---------------------------------------------------------------------------
// The public wave type: PilotWave with the withheld fields optional
// ---------------------------------------------------------------------------

type PublicPair = Omit<PairwiseEntry, "difference"> & { difference?: number; point_withheld?: string[] };
type PublicDimPair = Omit<DimensionPairwiseEntry, "difference"> & { difference?: number; point_withheld?: string[] };
type PublicComparison = Omit<ComparisonEntry, "difference" | "b_minus_a"> & { difference?: number; b_minus_a?: { difference?: number; interval95: [number, number]; separated: boolean }; point_withheld?: string[] };
export type PublicSubject = Omit<WaveSubject, "pilot_composite" | "dimensions"> & {
  /** Present ONLY for a subject separated after correction. Absent = withheld. */
  pilot_composite?: number;
  dimensions?: Record<string, number>;
  point_withheld?: { withheld: string[]; reason: string };
};
export type PublicWave = Omit<PilotWave, "subjects" | "pairwise" | "dimension_pairwise" | "comparisons" | "sensitivity"> & {
  subjects: Record<string, PublicSubject>;
  pairwise: PublicPair[];
  dimension_pairwise: PublicDimPair[];
  comparisons?: PublicComparison[];
  pairwise_note?: string;
  comparisons_note?: string;
  public_projection: { schema: string; withheld_for: string[]; separated_subjects_keep_points: string[]; rule: string };
  sensitivity?: { ratings_whose_value_differs_from_the_original?: number; separation_pattern_unchanged?: boolean };
};

/** The helpers of model-report-facts / figure-kit take a PilotWave but read only fields the projection keeps (names, tiers, shapes, judge family). */
export const asReportWave = (w: PublicWave): PilotWave => w as unknown as PilotWave;

// ---------------------------------------------------------------------------
// Waves
// ---------------------------------------------------------------------------

export interface WaveLink { runId: string; reportDate: string; href: string; isLatest: boolean; superseded: boolean }

/**
 * Manifest entries the dashboard renders, newest first. Empty while the dashboard's own gate is closed (D-29b not ratified and no
 * CB_PREVIEW_DASHBOARD=1; scripts/lib/dashboard-render-gate.mjs) and when no dashboard-eligible wave renders: then the route does not exist.
 */
export function dashboardEntries(): { entry: ManifestEntry; mode: RenderMode }[] {
  return dashboardEntriesFor(getWaveManifest(), process.env, { reportsDir: join(process.cwd(), "src", "data", "model-benchmark", "reports") }) as { entry: ManifestEntry; mode: RenderMode }[];
}
export const dashboardRenders = (): boolean => dashboardEntries().length > 0;

/** The wave permalink path (always the per-wave route). */
export const wavePath = (runId: string): string => `${DASHBOARD_PATH}/${runId}`;
export const waveUrl = (runId: string): string => `${SITE_URL}${wavePath(runId)}`;
export const DASHBOARD_URL = `${SITE_URL}${DASHBOARD_PATH}`;

export function waveLinks(): WaveLink[] {
  const entries = dashboardEntries();
  const sorted = [...entries].sort((a, b) => (a.entry.report_date < b.entry.report_date ? 1 : a.entry.report_date > b.entry.report_date ? -1 : alpha(b.entry.run_id, a.entry.run_id)));
  return sorted.map((x, i) => ({
    runId: x.entry.run_id,
    reportDate: x.entry.report_date,
    href: i === 0 ? DASHBOARD_PATH : wavePath(x.entry.run_id),
    isLatest: i === 0,
    superseded: x.entry.decision_status === "superseded",
  }));
}
export const latestRunId = (): string | null => waveLinks()[0]?.runId ?? null;

const WAVES_DIR = join(process.cwd(), "src", "data", "model-benchmark", "waves");

/** sha256 of the committed wave file, recomputed at build. A manifest entry that carries its own sha256 must match it (FR-02 AC3). */
export function waveFileSha256(runId: string, entry?: ManifestEntry): string {
  const sha = createHash("sha256").update(readFileSync(join(WAVES_DIR, `${runId}.json`))).digest("hex");
  const committed = (entry as unknown as { sha256?: string; wave_sha256?: string } | undefined);
  const claimed = committed?.sha256 ?? committed?.wave_sha256;
  if (claimed && claimed !== sha) throw new Error(`wave ${runId}: file sha256 ${sha} does not match the committed ${claimed} (FR-02 AC3)`);
  return sha;
}

// ---------------------------------------------------------------------------
// Program facts, tiers, requirements
// ---------------------------------------------------------------------------

export interface ProgramFacts {
  officialModelCount: number;
  pilotWaveCount: number;
  publishableWaveCount: number;
  buildCountInWave: number;
  itemsTotal: number;
  itemsValidatedByWave: number;
  itemsValidatedByReview: number;
  trackedCount: number;
  scanState: string;
  lastWaveDate: string;
}

export interface GateRow { id: string; state: "met" | "not-met" | "not-checked"; evidence: string }

export interface DashboardBuild { id: string; shape: ShapeKind; subjects: string[]; tier: string }

export interface DashboardData {
  runId: string;
  reportDate: string;
  mode: RenderMode;
  isLatest: boolean;
  wave: PublicWave;
  waveSha256: string;
  waves: WaveLink[];
  builds: DashboardBuild[];
  dims: { code: string; name: string }[];
  /** Tidy rows of the public projection: the props of the client island and, written to disk, the static downloads. */
  rows: ReturnType<typeof dashboardRows>;
  program: ProgramFacts;
  gates: GateRow[];
  title: string;
  description: string;
  canonical: string;
  reportHref: string;
  citation: { sentences: string[]; plain: string; bibtex: string; permalink: string };
  accessTier: string;
  judgeFamily: string;
  counts: { trackedWord: string };
}

/** The dimension codes the wave has ranges for, in the site's DIMENSIONS order (never retyped). */
function waveDims(w: PublicWave): { code: string; name: string }[] {
  const have = new Set(Object.keys(Object.values(w.subjects)[0]?.dimension_intervals95 ?? {}));
  return DIMENSIONS.filter((d) => have.has(d.code)).map((d) => ({ code: d.code, name: d.name }));
}

function gatesFor(w: PublicWave): GateRow[] {
  const c = dashboardCopy.gates.rows;
  const rows: GateRow[] = [];
  const validated = MODEL_INDEX_FACTS.itemsWithTwoReviews;
  const total = MODEL_INDEX_FACTS.itemCount;
  rows.push({ id: "validation", state: validated === 0 ? "not-met" : "not-checked", evidence: `${validated} of ${total} task items validated by two human reviewers` });
  rows.push({ id: "pool", state: MODEL_INDEX_FACTS.allItemsPublic ? "not-met" : "not-checked", evidence: MODEL_INDEX_FACTS.allItemsPublic ? "Every task item is public with its answer key" : "Not derivable from this site's data" });
  const families = w.judge_set?.judge_families ?? [];
  rows.push({ id: "judges", state: families.length === 1 ? "not-met" : "not-checked", evidence: families.length === 1 ? "All judges in this wave are from one model family" : "Not derivable from this site's data" });
  rows.push({ id: "raters", state: "not-checked", evidence: "" });
  rows.push({ id: "access", state: /^(?:local-open-weight|agent)\b/i.test(w.design.access_tier) ? "not-met" : "not-checked", evidence: `Access tier of this wave: ${accessTierLabel(asReportWave(w))}` });
  rows.push({ id: "amendment", state: "not-met", evidence: "Official rendering is disabled in this site's code" });
  rows.push({ id: "methods", state: "not-checked", evidence: "" });
  rows.push({ id: "independence", state: "not-checked", evidence: "" });
  rows.push({ id: "disclosure", state: "not-checked", evidence: "" });
  rows.push({ id: "crisis", state: w.design.crisis_items_served === false ? "not-met" : "not-checked", evidence: w.design.crisis_items_served === false ? "Crisis items were not served in this wave" : "Not derivable from this site's data" });
  for (const r of rows) if (!(r.id in c)) throw new Error(`gate row ${r.id} has no copy`);
  return rows;
}

function bibtex(w: PublicWave, canonical: string): string {
  const year = w.report_date.slice(0, 4);
  return [
    `@misc{compassion_benchmark_dashboard_${w.run_id.replace(/[^a-z0-9]/gi, "_")},`,
    `  title = {AI Model Compassion Dashboard, unofficial pilot ${w.run_id}},`,
    `  author = {{Compassion Benchmark}},`,
    `  year = {${year}},`,
    `  note = {Unofficial pilot, not a score, comparability none. ${dateLong(w.report_date)}.},`,
    `  url = {${canonical}}`,
    `}`,
  ].join("\n");
}

/** Everything buildDashboardData needs that is not in the wave: tests pass synthetic values, the build passes the real ones. */
export interface BuildInput {
  internal: PilotWave;
  mode: RenderMode;
  links: WaveLink[];
  waveSha256: string;
}

/**
 * Project one wave and derive everything the dashboard shows. Pure (no file system), so the tests can run it on synthetic waves.
 * Throws (failing the build) when the projection fails its own structural check, when a derived string breaks the copy rules, or
 * when the wave has more builds than shapes. Only `pub` leaves this function: `internal` is dropped when it returns.
 */
export function buildDashboardData({ internal, mode, links, waveSha256 }: BuildInput): DashboardData {
  const runId = internal.run_id;
  const pub = projectWavePublic(internal) as PublicWave;
  const problems = projectionProblems(pub, internal) as string[];
  if (problems.length) throw new Error(`dashboard: the public projection of ${runId} is wrong:\n  ${problems.join("\n  ")}`);
  // From here on only `pub` is used.
  const rw = asReportWave(pub);
  const bs = buildIds(pub) as string[];
  assertShapesSuffice(bs.length, `dashboard ${runId}`);
  const builds: DashboardBuild[] = bs.map((id) => {
    const subjects = (panelSubjects(pub) as string[]).filter((s) => buildOf(pub, s) === id);
    return { id, shape: shapeFor(rw, subjects[0]), subjects, tier: accessTierLabel(rw) };
  });
  const me = links.find((l) => l.runId === runId);
  const isLatest = me?.isLatest ?? false;
  const permalink = waveUrl(runId);
  const canonical = isLatest ? DASHBOARD_URL : permalink;
  const sentences = citableSentences(rw);
  const plain = [
    `Compassion Benchmark. ${dashboardCopy.title}, unofficial pilot ${pub.run_id}, ${dateLong(pub.report_date)}. Not a score; comparability: ${pub.comparability}.`,
    ...sentences,
    permalink,
  ].join(" ");
  assertLexicon("dashboard citation", plain.replace(permalink, ""), rw);
  const title = `Unofficial Pilot: ${dashboardCopy.title} (${monthYear(pub.report_date)})`;
  assertLexicon("dashboard title", title, rw);
  assertLexicon("dashboard description", dashboardCopy.metaDescription, rw);
  const accessTier = accessTierLabel(rw);
  if (accessTierPlain(pub.design.access_tier) !== accessTier) throw new Error(`dashboard ${runId}: the download tier label differs from accessTierLabel`);
  const dims = waveDims(pub);
  const program: ProgramFacts = {
    officialModelCount: MODEL_INDEX_FACTS.evaluatedModelCount,
    pilotWaveCount: MODEL_WAVE_FACTS.pilotWaveCount,
    publishableWaveCount: links.length,
    buildCountInWave: bs.length,
    itemsTotal: pub.bank.items_total,
    itemsValidatedByWave: pub.bank.items_validated,
    itemsValidatedByReview: MODEL_INDEX_FACTS.itemsWithTwoReviews,
    trackedCount: RELEASE_WATCH_FACTS.confirmedReleaseCount,
    scanState: RELEASE_WATCH_FACTS.scanState,
    lastWaveDate: links[0]?.reportDate ?? pub.report_date,
  };
  return {
    runId, reportDate: pub.report_date, mode, isLatest, wave: pub,
    waveSha256,
    waves: links, builds, dims,
    rows: dashboardRows(pub),
    program, gates: gatesFor(pub), title, description: dashboardCopy.metaDescription, canonical,
    reportHref: `/ai-models/reports/${runId}`,
    citation: { sentences, plain, bibtex: bibtex(pub, permalink), permalink },
    accessTier,
    judgeFamily: judgeFamilyName(rw) ?? "same",
    counts: { trackedWord: numberWord(RELEASE_WATCH_FACTS.confirmedReleaseCount) },
  };
}


/**
 * Load one renderable wave from the committed files and build its dashboard data. Throws when the wave is not renderable in this
 * build, when its compiled report does not match it, or when the committed file's sha256 differs from the one its manifest entry carries.
 */
export function loadDashboardData(runId: string): DashboardData {
  const hit = dashboardEntries().find((x) => x.entry.run_id === runId);
  if (!hit) throw new Error(`dashboard: wave ${runId} is not renderable in this build`);
  const { wave: internal, mode } = loadRenderable(runId); // verifies the compiled report against the wave
  return buildDashboardData({ internal, mode, links: waveLinks(), waveSha256: waveFileSha256(runId, hit.entry) });
}

export { hasArms, primaryArm, PANEL_CODES };
