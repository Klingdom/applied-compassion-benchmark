/**
 * Build-time lookup: given (indexSlug, entitySlug), return the most recent
 * evidence-review record produced by the overnight scanner.
 *
 * Scanner output is written to site/src/data/evidence-reviews/latest.json
 * (schema: { date, lookback_window_days, reviews: Record<"index/slug", Review> }).
 *
 * Used by entity detail pages to surface "Evidence reviewed YYYY-MM-DD" —
 * either confirming no material change in the last 14 days, or summarising
 * evidence that did surface.
 */
import latest from "./latest.json";

export interface EvidenceReview {
  reviewed_at: string;
  evidence_found: boolean;
  summary?: string;
  sources?: string[];
  tier?: "T1" | "T2" | "T3";
}

interface LatestFeed {
  date: string | null;
  lookback_window_days: number;
  reviews: Record<string, EvidenceReview>;
}

const feed = latest as LatestFeed;

export function getLatestEvidenceReview(
  indexSlug: string,
  entitySlug: string,
): EvidenceReview | null {
  const key = `${indexSlug}/${entitySlug}`;
  return feed.reviews[key] ?? null;
}

export function getFeedDate(): string | null {
  return feed.date;
}

export function getLookbackWindowDays(): number {
  return feed.lookback_window_days ?? 14;
}
