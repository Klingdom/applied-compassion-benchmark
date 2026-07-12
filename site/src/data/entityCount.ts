/**
 * entityCount.ts — canonical scored-entity count
 *
 * Two distinct numbers exist and must not be conflated:
 *
 *   SCORED (1,256) = sum of rankings.length across the 8 published index JSON
 *     files. This is the citable "how many entities the benchmark scores, ranks,
 *     indexes, and monitors" number. Equals build-manifest.totalEntities.
 *
 *   SCANNED (~1,260) = pipeline.entitiesScanned in the daily briefing JSON. The
 *     nightly scanner has slightly broader coverage than the published catalog.
 *     Use the scanned value only where copy literally says "scanned" (pipeline semantics).
 *
 * Import SCORED_ENTITY_COUNT or SCORED_ENTITY_COUNT_FORMATTED wherever copy
 * refers to the scored/indexed/monitored/covered catalog.
 */

import countriesData from "@/data/indexes/countries.json";
import fortune500Data from "@/data/indexes/fortune-500.json";
import globalCitiesData from "@/data/indexes/global-cities.json";
import aiLabsData from "@/data/indexes/ai-labs.json";
import roboticsLabsData from "@/data/indexes/robotics-labs.json";
import usStatesData from "@/data/indexes/us-states.json";
import usCitiesData from "@/data/indexes/us-cities.json";
import universitiesData from "@/data/indexes/universities.json";
import { INDEX_REGISTRY } from "@/data/indexRegistry";

/**
 * Raw ranking-array lookup keyed by indexSlug — matches INDEX_REGISTRY's
 * indexSlug field 1:1. Iterating INDEX_REGISTRY (rather than a hand-typed
 * sum expression) means a future 9th index that's missing from this map
 * throws immediately instead of silently undercounting.
 */
const RANKINGS_BY_SLUG: Record<string, { rankings: unknown[] }> = {
  countries: countriesData as { rankings: unknown[] },
  "fortune-500": fortune500Data as { rankings: unknown[] },
  "global-cities": globalCitiesData as { rankings: unknown[] },
  "ai-labs": aiLabsData as { rankings: unknown[] },
  "robotics-labs": roboticsLabsData as { rankings: unknown[] },
  "us-states": usStatesData as { rankings: unknown[] },
  "us-cities": usCitiesData as { rankings: unknown[] },
  universities: universitiesData as { rankings: unknown[] },
};

export const SCORED_ENTITY_COUNT: number = INDEX_REGISTRY.reduce((sum, entry) => {
  const data = RANKINGS_BY_SLUG[entry.indexSlug];
  if (!data) {
    throw new Error(`entityCount: no ranking data registered for index "${entry.indexSlug}"`);
  }
  return sum + data.rankings.length;
}, 0);

/** "1,156" — use this string wherever the scored catalog count appears in UI copy. */
export const SCORED_ENTITY_COUNT_FORMATTED: string =
  SCORED_ENTITY_COUNT.toLocaleString("en-US");
