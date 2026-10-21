/**
 * model-cycle-facts.ts -- every value the /ai-models/cycle page states, resolved at build time from committed
 * site data (never from research/, which Docker builds do not have). Nothing here is typed by hand.
 *
 *   first edition window / releases / disclosures  site/src/data/model-watch/editions-manifest.json (oldest edition)
 *   queued / measured builds                       site/src/data/model-watch/queue-snapshot.json (status queued / measured)
 *   catalog model count                            MODEL_WATCH_FACTS.catalogModelCount
 *   AI lab count                                   getIndexEntityCount("ai-labs")
 *   evaluated models, items, dimensions, validated MODEL_INDEX_FACTS
 *   items served / not served / sensitive          newest pilot wave file, bank.items_served / items_not_served / items_not_served_sensitive
 *   pilot report dates                             published pilot waves (active decision + report narrative), oldest first
 *   conditions                                     model-ranking-conditions.ts (the same constants /ai-models/leaderboards uses)
 *
 * Server-side (build time) only.
 */

import queueSnapshot from "@/data/model-watch/queue-snapshot.json";
import editionsManifest from "@/data/model-watch/editions-manifest.json";
import { MODEL_WATCH_FACTS } from "@/lib/model-watch-facts";
import { MODEL_INDEX_FACTS } from "@/lib/model-index-facts";
import { getWaveManifest, loadWave, publishableWaves } from "@/lib/model-wave-facts";
import { getIndexEntityCount } from "@/data/entityCount";
import {
  CONDITIONS_MET,
  CONDITIONS_TOTAL,
  JUDGE_FAMILIES_REQUIRED,
  MIN_VALIDATED_ITEMS_PER_DIMENSION,
  CONSECUTIVE_WAVES_REQUIRED,
  OPEN_CLAIM_AUDITS_ALLOWED,
} from "@/data/model-ranking-conditions";
import { windowDays } from "../../scripts/lib/model-watch-core.mjs";

const WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"];
/** Small counts are written as words in running copy ("Three exist"); anything larger stays in digits. */
export const countWord = (n: number, capitalise = false): string => {
  const w = n >= 0 && n < WORDS.length ? WORDS[n] : String(n);
  return capitalise ? w.charAt(0).toUpperCase() + w.slice(1) : w;
};

type EditionEntry = { date: string; windowFrom: string; windowTo: string; releaseCount: number; disclosureCount: number };
const editions = (editionsManifest as unknown as { editions: EditionEntry[] }).editions;
// "The first edition" is the oldest one; the manifest is newest first.
const firstEdition = [...editions].sort((a, b) => (a.date < b.date ? -1 : 1))[0];
if (!firstEdition) throw new Error("model-cycle-facts: no AI Model Watch edition exists, so the first-edition sentence cannot be derived");

const queueEntries = (queueSnapshot as unknown as { entries: { status: string }[] }).entries;
const countStatus = (s: string) => queueEntries.filter((e) => e.status === s).length;

// Newest pilot wave file (the manifest is newest first). A missing bank block fails the build rather than printing a guess.
const latestEntry = getWaveManifest()[0];
if (!latestEntry) throw new Error("model-cycle-facts: no pilot wave data under src/data/model-benchmark/waves/");
const latestBank = loadWave(latestEntry.run_id).bank;

const publishedPilotDates = publishableWaves.map((w) => w.report_date).sort();
if (publishedPilotDates.length === 0) throw new Error("model-cycle-facts: no published pilot report, so the pilot sentence cannot be derived");

export const MODEL_CYCLE_FACTS = {
  firstEditionWindowDays: windowDays(firstEdition.windowFrom, firstEdition.windowTo) as number,
  firstEditionReleaseCount: firstEdition.releaseCount,
  firstEditionDisclosureCount: firstEdition.disclosureCount,
  queuedBuildCount: countStatus("queued"),
  measuredBuildCount: countStatus("measured"),
  catalogModelCount: MODEL_WATCH_FACTS.catalogModelCount,
  aiLabCount: getIndexEntityCount("ai-labs"),
  evaluatedModelCount: MODEL_INDEX_FACTS.evaluatedModelCount,
  itemCount: MODEL_INDEX_FACTS.itemCount,
  dimensionCount: MODEL_INDEX_FACTS.dimensionCount,
  itemsValidated: MODEL_INDEX_FACTS.itemsWithTwoReviews,
  pilotItemsServed: latestBank.items_served,
  pilotItemsNotServed: latestBank.items_not_served,
  pilotItemsNotServedSensitive: latestBank.items_not_served_sensitive,
  pilotReportDates: publishedPilotDates,
  conditionsTotal: CONDITIONS_TOTAL,
  conditionsMet: CONDITIONS_MET,
  judgeFamiliesRequired: JUDGE_FAMILIES_REQUIRED,
  minValidatedItemsPerDimension: MIN_VALIDATED_ITEMS_PER_DIMENSION,
  consecutiveWavesRequired: CONSECUTIVE_WAVES_REQUIRED,
  openClaimAuditsAllowed: OPEN_CLAIM_AUDITS_ALLOWED,
};
