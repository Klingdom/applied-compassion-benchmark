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
import scoreHistory from "@/data/model-benchmark/score-history-v1.json";
import itemReviews from "@/data/model-benchmark/item-reviews-v1.json";
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { DIMENSIONS } from "@/data/dimensions";

type TaskItem = {
  id: string;
  dimension: string;
  /** Subdimension code (e.g. "A3"). The bank's designed carrier — see bank v2.0. */
  indicator?: string | null;
  validationStatus?: string;
  exposureStatus?: string;
  pool?: string;
};

const items = ((tasks as { items?: TaskItem[] }).items ?? []) as TaskItem[];
const registryEntries = ((registry as { entries?: unknown[] }).entries ?? []) as unknown[];
const reviewRecords = ((itemReviews as { reviews?: { item_id?: string; reviewer_id?: string }[] }).reviews ?? []) as { item_id?: string; reviewer_id?: string }[];
const scoreRecords = ((scoreHistory as { records?: { registry_id?: string }[] }).records ?? []) as { registry_id?: string }[];

/**
 * Item-status vocabulary (one meaning per word, used identically on the pages):
 *   Draft     -- authored, never reviewed (`draft-authored-unreviewed`). Not scored.
 *   Scorable  -- not a draft. Used in runs, not yet validated.
 *   Validated -- two independent human reviews, no unresolved dispute.
 * This predicate answers "is the stored status a validated one?". It does NOT
 * mean scorable: scorable is `!isDraft`, counted by `scorableItemCount`.
 * Pages should show `itemsWithTwoReviews` (derived from the review log, whose
 * own note says status is derived from reviews and never stored separately)
 * rather than this stored-status count; the two stores can disagree.
 */
const VALIDATED_STATUSES = new Set(["validated", "reviewed"]);
const isValidatedStatus = (i: TaskItem) => VALIDATED_STATUSES.has(String(i.validationStatus ?? ""));
const isDraft = (i: TaskItem) => String(i.validationStatus ?? "") === "draft-authored-unreviewed";

function countBy<T>(xs: T[], key: (x: T) => string): Record<string, number> {
  return xs.reduce<Record<string, number>>((acc, x) => {
    const k = key(x);
    acc[k] = (acc[k] ?? 0) + 1;
    return acc;
  }, {});
}

/**
 * Accepted self-reported (Tier 2) submissions. The SUB-1 pipeline
 * (research/submissions/README.md) records an accepted submission as
 * `research/submissions/<model-label>-<YYYY-MM-DD>.json`, merged only after a
 * human reviews the pull request. There is no store under site/, so this reads
 * that directory at build time.
 *
 * It is `null`, not 0, when the directory cannot be reached from the build
 * (the Docker build context is `site/` only). A zero we could not verify must
 * not be printed as a zero -- the page omits the count instead. Deliberately
 * NOT `scoreRecordCount`: that is score-history-v1.json, the store of
 * authorised evaluations (Tier 1).
 */
function readSelfReportedSubmissionCount(): number | null {
  const dir = join(process.cwd(), "..", "research", "submissions");
  if (!existsSync(dir)) return null;
  return readdirSync(dir).filter((f) => f.endsWith(".json")).length;
}

const DIM_CODES = DIMENSIONS.map((d) => d.code);
/** All 40 subdimension codes, in canonical order, from the same source of truth. */
const SUBDIM_CODES = DIMENSIONS.flatMap((d) => d.subdims.map((s) => s.code));

/** Per-dimension item counts across the whole bank. */
export const itemsByDimension: Record<string, number> = Object.fromEntries(
  DIM_CODES.map((c) => [c, items.filter((i) => i.dimension === c).length]),
);

/**
 * Per-dimension counts excluding unreviewed drafts. This is the SCORABLE
 * denominator — an item can be scorable without being validated. Do not conflate
 * this with the validated count (`itemsWithTwoReviews`). Both facts are true
 * and they mean different things.
 */
export const scorableItemsByDimension: Record<string, number> = Object.fromEntries(
  DIM_CODES.map((c) => [c, items.filter((i) => i.dimension === c && !isDraft(i)).length]),
);

export const MODEL_INDEX_FACTS = {
  /** Total items in the published bank. */
  itemCount: items.length,

  /**
   * Items whose STORED validationStatus is a validated one (tasks-v1.json).
   * Pages use `itemsWithTwoReviews` instead; see isValidatedStatus above.
   */
  reviewedItemCount: items.filter(isValidatedStatus).length,

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

  /**
   * Score history, derived from the append-only record file. Both are 0 until a
   * model is validly evaluated, and the page says so rather than hiding an
   * empty state. modelsWithScoreHistory counts distinct snapshots, not names:
   * a provider reusing a product name produces a separate timeline.
   */
  scoreRecordCount: scoreRecords.length,

  /**
   * Human review progress, derived from the append-only review log. An item
   * needs TWO independent reviewers, so itemsWithAnyReview is deliberately
   * reported alongside the count of fully reviewed items -- partial progress
   * must not read as completion.
   */
  reviewRecordCount: reviewRecords.length,
  itemsWithAnyReview: new Set(reviewRecords.map((r) => r.item_id)).size,
  itemsWithTwoReviews: [...new Set(reviewRecords.map((r) => r.item_id))].filter(
    (id) => new Set(reviewRecords.filter((r) => r.item_id === id).map((r) => r.reviewer_id)).size >= 2,
  ).length,
  /** Tier 2 count; null when the submissions directory is unreachable. See above. */
  selfReportedSubmissionCount: readSelfReportedSubmissionCount(),
  modelsWithScoreHistory: new Set(scoreRecords.map((r) => r.registry_id)).size,

  /**
   * Subdimension coverage, derived from each item's `indicator` field — never
   * typed. Until bank v2.0 (2026-09-24) this was 0 of 40 and the methodology
   * page said so; the bank now carries all 40, so the page must say that
   * instead. Deriving it here is what keeps the two from disagreeing again.
   */
  subdimensionCount: SUBDIM_CODES.length,
  subdimensionsCovered: SUBDIM_CODES.filter((c) => items.some((i) => i.indicator === c)).length,
  itemsWithSubdimension: items.filter((i) => typeof i.indicator === "string" && i.indicator.length > 0).length,

  /**
   * Subdimensions resting on a single item. A subdimension mean built on one
   * item is a single point of failure, so this is worth showing rather than
   * averaging away.
   */
  singleItemSubdimensions: SUBDIM_CODES.filter(
    (c) => items.filter((i) => i.indicator === c && !isDraft(i)).length === 1,
  ).length,
} as const;

export type ModelIndexFacts = typeof MODEL_INDEX_FACTS;
