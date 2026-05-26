/**
 * Type definitions for per-entity score history pages.
 * These match the shape written by site/scripts/build-entity-history.mjs.
 */

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
  };
  totalEntities: number;
  totalEvents: number;
  generatedAt: string;
}
