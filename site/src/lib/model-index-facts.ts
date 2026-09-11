/**
 * model-index-facts.ts — the single source of truth for every number the
 * AI Model Compassion Benchmark pages state about themselves.
 *
 * Why this module exists: hardcoded counts in prose have already caused a real
 * defect on this site. The Humanoid Robotics Labs Index grew from 50 to 92
 * entities and left six stale "50" claims behind, including a Dataset JSON-LD
 * `description` that contradicted the `entityCount` field in the same element —
 * machine-readable self-contradiction served to crawlers and answer engines.
 *
 * These pages make claims about an instrument that is actively changing (items
 * get reviewed, the registry will fill). So nothing here may be written by hand.
 * If a page wants to say a number, it imports it from this file.
 *
 * See DECISIONS.md D-29.
 */

import tasks from "@/data/model-benchmark/tasks-v1.json";
import registry from "@/data/model-benchmark/registry-v1.json";
import { DIMENSIONS } from "@/data/dimensions";

type TaskItem = {
  id: string;
  dimension: string;
  validationStatus?: string;
  exposureStatus?: string;
  pool?: string;
};

const items = ((tasks as { items?: TaskItem[] }).items ?? []) as TaskItem[];
const registryEntries = ((registry as { entries?: unknown[] }).entries ?? []) as unknown[];

/**
 * An item counts as SCORABLE only once a human has reviewed it. Items still at
 * `draft-authored-unreviewed` were authored by an AI agent and never reviewed,
 * so they must not back a published number.
 */
const REVIEWED_STATUSES = new Set(["validated", "reviewed"]);
const isScorable = (i: TaskItem) => REVIEWED_STATUSES.has(String(i.validationStatus ?? ""));
const isDraft = (i: TaskItem) => String(i.validationStatus ?? "") === "draft-authored-unreviewed";

function countBy<T>(xs: T[], key: (x: T) => string): Record<string, number> {
  return xs.reduce<Record<string, number>>((acc, x) => {
    const k = key(x);
    acc[k] = (acc[k] ?? 0) + 1;
    return acc;
  }, {});
}

const DIM_CODES = DIMENSIONS.map((d) => d.code);

/** Per-dimension item counts across the whole bank. */
export const itemsByDimension: Record<string, number> = Object.fromEntries(
  DIM_CODES.map((c) => [c, items.filter((i) => i.dimension === c).length]),
);

/**
 * Per-dimension counts excluding unreviewed drafts. This is the SCORABLE
 * denominator — an item can be scorable without being validated. Do not conflate
 * this with `reviewedItemCount`, which counts human-validated items and is
 * currently 0. Both facts are true and they mean different things.
 */
export const scorableItemsByDimension: Record<string, number> = Object.fromEntries(
  DIM_CODES.map((c) => [c, items.filter((i) => i.dimension === c && !isDraft(i)).length]),
);

export const MODEL_INDEX_FACTS = {
  /** Total items in the published bank. */
  itemCount: items.length,

  /** Items a human has reviewed and validated. Currently zero — state it plainly. */
  reviewedItemCount: items.filter(isScorable).length,

  /** Items authored but never human-reviewed. */
  draftItemCount: items.filter(isDraft).length,

  /** Breakdown by validationStatus, for honest disclosure rather than a single headline. */
  byValidationStatus: countBy(items, (i) => String(i.validationStatus ?? "unknown")),

  /** Number of model snapshots ever evaluated. The load-bearing fact on these pages. */
  evaluatedModelCount: registryEntries.length,

  /**
   * Gate for every results-dependent surface: rankings, comparisons, Dataset and
   * ItemList JSON-LD. While false, none of them may render. See D-29.
   */
  hasResults: registryEntries.length > 0,

  /** Items that are scorable (not unreviewed drafts), regardless of validation. */
  scorableItemCount: items.filter((i) => !isDraft(i)).length,

  /** The thinnest dimension coverage in the bank, excluding drafts. */
  thinnestDimensions: DIM_CODES.map((c) => ({ code: c, count: scorableItemsByDimension[c] }))
    .sort((a, b) => a.count - b.count)
    .slice(0, 2),

  /**
   * Every item is published with its full five-anchor rubric, so the public pool
   * is permanently unusable for blinded evaluation. The harness design states no
   * cross-model comparison on this pool is valid. Surfaced, never hidden.
   */
  allItemsPublic: items.length > 0 && items.every((i) => i.exposureStatus === "public-permanent"),

  dimensionCount: DIM_CODES.length,
} as const;

export type ModelIndexFacts = typeof MODEL_INDEX_FACTS;
