/**
 * Types the Model Watch and Insights pages read. They are owned by the data layer
 * (src/lib/model-watch-facts.ts and src/lib/insights.ts); this file only re-exports them under the names the
 * components use. Schemas: docs/DATA_MODEL_AI_MODEL_WATCH.md.
 */

export type {
  WatchSource,
  TestedStatus,
  TrackerRow,
  EditionRelease,
  Edition as CompiledEdition,
  EditionSummary as EditionManifestEntry,
} from "@/lib/model-watch-facts";

export type {
  InsightAudience,
  InsightSummary as InsightManifestEntry,
  InsightPost,
} from "@/lib/insights";
