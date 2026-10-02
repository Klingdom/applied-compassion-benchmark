/**
 * model-wave-facts.ts -- what the site may say about assessment WAVES.
 *
 * Deliberately separate from model-index-facts.ts, which is unchanged and does
 * not import this module. `evaluatedModelCount`, `scoreRecordCount` and
 * `hasResults` come from the registry and score history only; a pilot wave
 * touches neither store, so they stay what they were by construction (proved
 * by `npm run test:model-wave-isolation`). A pilot count is a different fact
 * and is never summed with an evaluated count (template F2, D-29a item 6).
 *
 * Source of truth: site/src/data/model-benchmark/waves/manifest.json and the
 * <run_id>.json files beside it, written by
 * research/model-runs/bin/export-wave.mjs. Read with fs at build time (like
 * model-index-facts does for submissions) so a missing waves/ directory means
 * "no waves", not a build error.
 *
 * Status is derived from `official` and `comparability`. The official branch
 * throws: official wave rendering stays disabled until the publication bar is
 * amended (template A, D-29a item 8). Every consumer must use
 * `switch (wave.status)` with the exhaustive `never` check below.
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export type WaveStatus = "pilot" | "official";
export type DecisionStatus = "active" | "proposed" | "superseded" | "unresolved";
export type Range = [number, number];

export interface ManifestEntry {
  run_id: string;
  status: WaveStatus;
  official: boolean;
  comparability: string;
  report_date: string;
  decision_ref: string;
  decision_status: DecisionStatus;
}

export interface WaveSubject {
  pilot_composite: number;
  pilot_composite_interval95: Range;
  dimensions: Record<string, number>;
  dimension_intervals95: Record<string, Range>;
  dimension_item_counts: Record<string, number>;
  median_reply_words: number;
  contamination: {
    indicated: boolean;
    recall_items_flagged: number;
    recall_items_probed: number;
    identification_correct: number;
    identification_asked: number;
    identification_p_if_unexposed: number;
    identification_flagged: boolean;
    /** Set when the probe ran through the cb-probe MCP server (later waves). */
    via?: string;
  };
  judge_agreement: {
    exact: number;
    mean_absolute_difference: number;
    responses_differing_by_2_or_more: number;
  };
}

export interface PairwiseEntry {
  a: string;
  b: string;
  difference: number;
  interval95: Range;
  separated: boolean;
}

export interface DimensionPairwiseEntry extends PairwiseEntry {
  dimension: string;
  bonferroni_separated: boolean;
  bonferroni_note: string;
}

export interface WaveDerived {
  not_separated_groups: string[][];
  not_separated_group_range: Range | null;
  not_separated_group_ranges: Range[];
  separated_subjects: string[];
  separated_pairs: [string, string][];
  dimension_bonferroni_separated_among_group: number;
  dimension_comparisons_among_group: number;
  dimension_bonferroni_separated_for: Record<string, number>;
  dimension_bonferroni_separated_of: Record<string, number>;
  median_words_group_range: Range | null;
  /** [min, max] over every not-separated-group member of (sensitivity point minus published point), one decimal. */
  sensitivity_level_shift_group_range: Range | null;
  /** Per subject, one decimal. Descriptive only; never a score. */
  sensitivity_level_shift: Record<string, number>;
  subject_count: number;
  ratings_total: number;
  responses_total: number;
}

export interface SubjectProvenance {
  developer: string;
  licence: string;
  parameter_size: string;
  quantisation: string;
  runtime: string;
  runtime_version: string;
  model_family: string;
  build_tag: string;
  digest_sha256: string;
}

export interface JudgeSet {
  judges: string[];
  judge_families: string[];
  subject_families: string[];
  disjoint_from_subjects: boolean;
  families_disjoint: boolean;
  family_note: string;
}

interface WaveBase {
  run_id: string;
  report_date: string;
  source_sha256: string;
  publication: { decision_ref: string; decision_status: DecisionStatus };
  bank: {
    items_total: number;
    items_validated: number;
    items_served: number;
    items_not_served: number;
    items_not_served_sensitive: number;
    items_not_served_unreviewed: number;
  };
  /** Would the separation findings change had the excluded judge's ratings been kept? Descriptive only. */
  sensitivity: {
    question: string;
    method: string;
    note: string;
    ratings_used: number;
    subjects: Record<string, { pilot_composite: number; pilot_composite_interval95: Range }>;
    pairwise: PairwiseEntry[];
    separation_pattern_unchanged: boolean;
  };
  design: {
    subjects: string[];
    access_tier: string;
    items_served: number;
    /** Largest standard part (one fresh conversation) of a trial, from the operations manifest. */
    items_per_conversation_max: number;
    trials_per_subject: number;
    responses: number;
    ratings: number;
    judges_per_response: number;
    self_judging: boolean;
    judge_family: string;
    excluded_judges: string[];
    bank_version: string;
    /** Later runs: the judge set, the pinned builds, the conversation protocol and the pre-registration hash. */
    judges?: string[];
    subject_builds?: Record<string, { tag: string; digest_sha256: string; family: string }>;
    conversation_per_item?: string;
    crisis_items_served?: boolean;
    preregistration_sha256?: string;
  };
  method: { composite: string; interval: string; length: string };
  subjects: Record<string, WaveSubject>;
  pairwise: PairwiseEntry[];
  dimension_pairwise: DimensionPairwiseEntry[];
  dimension_pairwise_note: string;
  length: {
    pooled_within_item_slope: number;
    pooled_within_item_r: number;
    within_subject_slopes: Record<string, number>;
    /** Separated subjects only; empty when every subject is in a not-separated group. */
    composite_if_pooled_slope_removed: Record<string, number>;
    note: string;
  };
  judges: Record<string, { ratings_used: number; leniency_vs_item_mean: number; by_subject: Record<string, number> }>;
  /** The first pilot's quote-grounding record; later runs report judge_validity instead. */
  quote_grounding?: Record<string, unknown>;
  operations: Record<string, unknown>;
  routing: Record<string, unknown>;
  /** Present only when a judge was excluded. */
  exclusion_record?: { role: string; reason: string; disclosure: string };
  /** Build and licence facts per subject (waves with local, pinned subjects). */
  subject_provenance?: Record<string, SubjectProvenance>;
  /** Are the judges a different set, and a different model family, than the subjects? */
  judge_set?: JudgeSet;
  judge_validity?: Record<string, unknown>;
  bridge_drift?: Record<string, unknown>;
  self_identifying_replies?: { note: string; count: number; by_subject: Record<string, number> };
  deviations?: { id: string; date: string; title: string }[];
  preregistration?: { sha256: string; path: string; committed_before_data: boolean; note: string };
  derived: WaveDerived;
}

export type PilotWave = WaveBase & { status: "pilot"; official: false; comparability: "none" };
/** Contract only. Nothing renders it; loading one throws. */
export type OfficialWave = WaveBase & { status: "official"; official: true; comparability: string };
export type Wave = PilotWave | OfficialWave;

const WAVES_DIR = join(process.cwd(), "src", "data", "model-benchmark", "waves");

export const OFFICIAL_DISABLED_MESSAGE =
  "official wave rendering requires the amended publication bar (D-29a item 8); it is disabled";

function readJson<T>(file: string): T | null {
  const p = join(WAVES_DIR, file);
  return existsSync(p) ? (JSON.parse(readFileSync(p, "utf8")) as T) : null;
}

/** Newest first. Empty when waves/ is absent (for example a build without the directory). */
export function getWaveManifest(): ManifestEntry[] {
  return readJson<ManifestEntry[]>("manifest.json") ?? [];
}

/** Load one wave. Throws for an official wave: the official branch fails closed. */
export function loadWave(runId: string): Wave {
  const raw = readJson<Omit<WaveBase, "status"> & { official: boolean; comparability: string }>(`${runId}.json`);
  if (raw === null) throw new Error(`wave ${runId} is not in waves/`);
  if (raw.official !== false) throw new Error(OFFICIAL_DISABLED_MESSAGE);
  if (raw.comparability !== "none") throw new Error(`wave ${runId}: a pilot must carry comparability "none"`);
  return { ...(raw as WaveBase), status: "pilot", official: false, comparability: "none" };
}

/** Exhaustive over `status`; the official case throws until it is enabled. */
export function assertRenderable(wave: Wave): PilotWave {
  switch (wave.status) {
    case "pilot":
      return wave;
    case "official":
      throw new Error(OFFICIAL_DISABLED_MESSAGE);
    default: {
      const unreachable: never = wave;
      throw new Error(`unhandled wave status: ${JSON.stringify(unreachable)}`);
    }
  }
}

const manifest = getWaveManifest();

/** Pilot waves published. NOT a count of models evaluated, and never summed with one. */
export const pilotWaveCount = manifest.filter((e) => e.status === "pilot").length;
export const officialWaveCount = manifest.filter((e) => e.status === "official").length;

/** Newest manifest entry, or null. */
export const latestWaveEntry: ManifestEntry | null = manifest[0] ?? null;

/**
 * Template F1: pilot content renders only while the wave's decision is active.
 * `proposed` (the state until the founder ratifies D-29a) renders nothing.
 */
export function isPublishable(entry: ManifestEntry): boolean {
  return entry.status === "pilot" && entry.decision_status === "active";
}

/**
 * A wave is exported (waves/) before its narrative is written (reports/<run_id>.md). Until the narrative exists the wave
 * has no page, so it is not "published" for any link or sentence that points at its report.
 */
const REPORTS_DIR = join(process.cwd(), "src", "data", "model-benchmark", "reports");
export function hasReportSource(runId: string): boolean {
  return existsSync(join(REPORTS_DIR, `${runId}.md`));
}

/** Newest first. Decision active AND a report narrative exists. */
export const publishableWaves: ManifestEntry[] = manifest.filter((e) => isPublishable(e) && hasReportSource(e.run_id));

/** The newest published wave, loaded; null when there is none. */
export function latestWave(): PilotWave | null {
  const e = publishableWaves[0];
  return e ? assertRenderable(loadWave(e.run_id)) : null;
}

export const MODEL_WAVE_FACTS = {
  pilotWaveCount,
  officialWaveCount,
  publishablePilotWaveCount: publishableWaves.length,
  latestRunId: latestWaveEntry?.run_id ?? null,
} as const;
