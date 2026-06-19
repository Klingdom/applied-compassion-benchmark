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

export const SCORED_ENTITY_COUNT: number = [
  (countriesData as { rankings: unknown[] }).rankings.length,
  (fortune500Data as { rankings: unknown[] }).rankings.length,
  (globalCitiesData as { rankings: unknown[] }).rankings.length,
  (aiLabsData as { rankings: unknown[] }).rankings.length,
  (roboticsLabsData as { rankings: unknown[] }).rankings.length,
  (usStatesData as { rankings: unknown[] }).rankings.length,
  (usCitiesData as { rankings: unknown[] }).rankings.length,
  (universitiesData as { rankings: unknown[] }).rankings.length,
].reduce((a, b) => a + b, 0);

/** "1,156" — use this string wherever the scored catalog count appears in UI copy. */
export const SCORED_ENTITY_COUNT_FORMATTED: string =
  SCORED_ENTITY_COUNT.toLocaleString("en-US");
