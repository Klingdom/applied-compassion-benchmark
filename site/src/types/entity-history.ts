/**
 * Type definitions for per-entity score history pages.
 * These match the shape written by site/scripts/build-entity-history.mjs.
 */

/**
 * Reference to a methodology ruling that directly affects this entity.
 * Populated when the ruling's briefing date co-occurs with a topSignals entry
 * for this entity (deterministic slug resolution — see architect §7.4).
 */
export interface MethodologyRulingRef {
  rulingNumber: number;
  name: string;
  version: string;
  establishedDate: string;
  briefingPath: string;
  summary: string;
}

/**
 * A compacted run of Tier-D sub-threshold events older than COMPACTION_AGE_DAYS.
 * Replaces N individual events in events[] with a single summary entry.
 * See architect §3.3.
 */
export interface CompactedRun {
  type: "compacted-sub-threshold";
  tier: "D";
  fromDate: string;
  toDate: string;
  count: number;
  netDirection: "upward" | "downward";
  netMagnitude: number;
  briefingPaths: string[];
}

export interface HistoryEvent {
  date: string;
  type: "scored" | "boundary-watch" | "score-change";
  headline: string;
  delta: number | null;
  newComposite: number | null;
  newBand: string | null;
  status: string | null;
  /** Present only for boundary-watch events */
  cycle?: number | null;
  briefingPath: string;

  // ── PR 1 additions ──────────────────────────────────────────────────────────

  /** Retention tier classification. A = always visible; B = history only;
   *  C = archive only; D = compactable after COMPACTION_AGE_DAYS. */
  tier: "A" | "B" | "C" | "D";

  /** True when the event is a documented sub-threshold movement (delta < ±0.5
   *  floor but explicitly recorded). Drives Tier-B/D classification. */
  subThreshold: boolean;

  /** Direction signal for display even when delta is null (e.g. boundary-watch). */
  directionLabel: "upward" | "downward" | "hold" | null;

  /** Populated when the event corresponds to a methodology ruling that names
   *  this entity's slug via topSignals co-occurrence on the same date. */
  rulingRef: MethodologyRulingRef | null;

  /**
   * Primary external source URL for the event.
   *
   * Two pathways (see build-entity-history.mjs):
   * 1. Structured field: future briefings will carry citationUrl natively on
   *    recentAssessments[].citationUrl or topSignals[].citationUrl.
   * 2. Best-effort URL extraction from whyHeadline / description text for
   *    existing data (back-fill).
   *
   * Null when no external citation is available.
   */
  citationUrl: string | null;
}

export interface EntityHistory {
  slug: string;
  name: string;
  kind: string;
  indexSlug: string;
  currentComposite: number | null;
  currentBand: string | null;
  currentRank: number | null;
  events: HistoryEvent[];
  scoredEventCount: number;
  boundaryWatchCount: number;
  firstEventDate: string | null;
  lastEventDate: string | null;
  generatedAt: string;

  // ── PR 1 additions ──────────────────────────────────────────────────────────

  /** Most recent Tier-A scored event with non-zero delta. Null when entity
   *  has only Tier-B/C/D events. */
  latestScoreChange: HistoryEvent | null;

  /** Distinct methodology rulings linked to this entity, newest first.
   *  Deduplicated by rulingNumber. */
  methodologyRulings: MethodologyRulingRef[];

  /** Integer days between generatedAt date and latestScoreChange.date.
   *  Null when latestScoreChange is null. */
  daysSinceLastChange: number | null;

  /** All events across all tiers, pre-compaction. */
  totalEventCount: number;

  /** Event counts by tier post-compaction. D includes compacted run totals. */
  tierCounts: { A: number; B: number; C: number; D: number };

  /** Roll-up entries for Tier-D events older than COMPACTION_AGE_DAYS. */
  compactedRuns: CompactedRun[];
}

export interface HistoryManifest {
  slugs: string[];
  byKind: {
    company: string[];
    country: string[];
    "us-state": string[];
    "ai-lab": string[];
    "robotics-lab": string[];
    city: string[];
    "us-city": string[];
    university?: string[];
  };
  totalEntities: number;
  totalEvents: number;
  generatedAt: string;

  // ── PR 1 addition ───────────────────────────────────────────────────────────

  /** Aggregate tier counts across all entities. */
  tierCountsAcrossAll: {
    A: number;
    B: number;
    C: number;
    D: number;
    compactedRuns: number;
  };
}
