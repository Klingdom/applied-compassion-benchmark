/**
 * Build-time lookup: given (indexSlug, entitySlug), return the most recent
 * score change record across all daily briefings.
 *
 * Used by entity detail pages to surface "latest research update" callouts.
 * This is computed once per process at module load (Next.js static export),
 * not per-page, so the I/O cost is amortized.
 */
import manifest from "./manifest.json";
import { getDailyData } from "./daily/index";
import type { EntityScoreChange } from "@/components/entity/EntityDetail";

interface ScoreChangeRecord {
  entity: string;
  slug: string;
  index: string; // e.g. "fortune-500", "ai-labs"
  publishedScore: number;
  assessedScore: number;
  delta: number;
  publishedBand: string;
  assessedBand: string;
  bandChange: boolean;
  confidence?: number;
  recommendation: string;
  headline: string;
  date: string;
  status?: string;
}

interface DailyUpdate {
  date: string;
  scoreChanges?: ScoreChangeRecord[];
}

let cache: Map<string, EntityScoreChange> | null = null;

async function buildIndex(): Promise<Map<string, EntityScoreChange>> {
  const map = new Map<string, EntityScoreChange>();

  // Iterate dates newest-first (manifest.dates is already in reverse-chrono order).
  // The first record seen for a given entity wins — guaranteed to be the most recent.
  for (const date of manifest.dates) {
    const data = (await getDailyData(date)) as DailyUpdate | null;
    if (!data || !Array.isArray(data.scoreChanges)) continue;
    for (const ch of data.scoreChanges) {
      const key = `${ch.index}:${ch.slug}`;
      if (map.has(key)) continue;
      map.set(key, {
        date: ch.date || date,
        delta: ch.delta,
        publishedScore: ch.publishedScore,
        assessedScore: ch.assessedScore,
        headline: ch.headline,
        recommendation: ch.recommendation,
        bandChange: ch.bandChange,
        confidence: ch.confidence,
        status: ch.status,
      });
    }
  }

  return map;
}

export async function getLatestChange(
  indexSlug: string,
  entitySlug: string,
): Promise<EntityScoreChange | null> {
  if (!cache) cache = await buildIndex();
  return cache.get(`${indexSlug}:${entitySlug}`) || null;
}
