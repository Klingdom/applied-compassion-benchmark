/**
 * model-watch-facts.ts -- the single source of truth for every number and row the AI Model Watch
 * pages (tracker, watch, edition, hub "This week" block) state. The ONLY reader of the
 * model-watch store (docs/ARCHITECTURE_AI_MODEL_WATCH.md section 2).
 *
 * Rules this module preserves:
 *   - `catalogModelCount` counts models LISTED in the catalog. A listing is not an evaluation. It is never added to
 *     MODEL_INDEX_FACTS.evaluatedModelCount or RELEASE_WATCH_FACTS.confirmedReleaseCount (MW-X3, "counts are never summed").
 *   - `benchmarkLocalTag` is a join key only. It is not exposed on the rows this module returns.
 *   - "Tested by us" is derived (scripts/lib/model-watch-tested.mjs): pilot only for an ACTIVE D-29a wave, queued, or not yet.
 *     It is a label and a link, never a figure.
 *   - Rows are in the catalog's stored order (provider, then name). The page never re-sorts; there is no sort by result.
 *
 * Server-side (build time) only.
 */

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import catalog from "@/data/model-watch/catalog-v1.json";
import releaseLog from "@/data/model-watch/release-log-v1.json";
import queueSnapshot from "@/data/model-watch/queue-snapshot.json";
import editionsManifest from "@/data/model-watch/editions-manifest.json";
import { getWaveManifest, loadWave } from "@/lib/model-wave-facts";
import { renderableEntries } from "../../scripts/lib/pilot-render-gate.mjs";
import { testedStatus } from "../../scripts/lib/model-watch-tested.mjs";

export type SourceType =
  | "provider-announcement" | "model-card" | "system-card" | "documentation" | "technical-report" | "licence" | "news" | "other"
  | "primary" | "secondary";

export interface WatchSource {
  url: string;
  title: string;
  sourceType: SourceType;
  accessed: string;
}

export type TestedStatus =
  | { status: "pilot"; runId: string; href: string }
  | { status: "queued" }
  | { status: "not-yet" };

export interface CatalogRow {
  id: string;
  name: string;
  provider: string;
  providerSlug: string;
  family: string | null;
  /** YYYY-MM-DD, or YYYY-MM when the sources give no day. */
  releaseDate: string | null;
  status: "current" | "preview" | "deprecated" | "retired" | "superseded";
  access: ("open-weights" | "api" | "consumer-app" | "restricted")[];
  licence: string;
  modalities: string[];
  contextWindowTokens: number | null;
  parameterCount: string | null;
  notes: string;
  sources: WatchSource[];
  firstListedOn: string;
  lastVerifiedOn: string;
}

export interface TrackerRow extends CatalogRow {
  tested: TestedStatus;
}

export interface LogRow {
  id: string;
  date: string;
  provider: string;
  providerSlug: string;
  modelName: string | null;
  catalogId: string | null;
  kind: string;
  summary: string;
  safetyOrWelfareRelevant: boolean;
  safetyNote: string | null;
  sources: WatchSource[];
  loggedOn: string;
  corrections: { date: string; text: string }[];
}

export interface EditionRelease {
  releaseId: string;
  date: string;
  provider: string;
  providerSlug: string;
  modelName: string | null;
  catalogId: string | null;
  kind: string;
  summary: string;
  safetyOrWelfareRelevant: boolean;
  safetyNote: string | null;
  sources: WatchSource[];
}

export interface Edition {
  date: string;
  title: string;
  window: { from: string; to: string };
  asOf: string;
  lead: string;
  coverage: { scanned: string[]; notScanned: string[] };
  coverageStatement: string;
  releases: EditionRelease[];
  disclosures: { releaseId: string; provider: string; modelName: string | null; safetyNote: string; sources: WatchSource[]; label: string }[];
  measured: { reports: { runId: string; reportDate: string; href: string }[]; note: string };
  queue: { asOf: string | null; queued: number; measured: number; skipped: number; queuedDevelopers: string[] };
  corrections: { date: string; text: string }[];
  sources: (WatchSource & { n: number })[];
  independence: string;
  contentHash: string;
}

export interface EditionSummary {
  date: string;
  title: string;
  lead: string;
  windowFrom: string;
  windowTo: string;
  releaseCount: number;
  disclosureCount: number;
}

const catalogRows = (catalog as unknown as { rows: (CatalogRow & { benchmarkLocalTag: string | null })[] }).rows;
const logRows = (releaseLog as unknown as { rows: LogRow[] }).rows;
const editionSummaries = (editionsManifest as unknown as { editions: EditionSummary[] }).editions;

const waveManifest = getWaveManifest();
const waves = waveManifest.map((e) => loadWave(e.run_id));
// The single render rule (D-29a): only mode "active" can yield a "pilot" label.
const renderable = renderableEntries(waveManifest);

const rows: TrackerRow[] = catalogRows.map((r) => {
  const { benchmarkLocalTag, ...publicFields } = r; // join key, never rendered
  return { ...publicFields, tested: testedStatus({ benchmarkLocalTag }, { queue: queueSnapshot, renderable, waves }) as TestedStatus };
});

const distinct = (xs: string[]) => [...new Set(xs)].sort((a, b) => a.localeCompare(b, "en", { sensitivity: "base" }));

export const MODEL_WATCH_FACTS = {
  /** Models LISTED in the catalog. Not "evaluated", not "tracked". */
  catalogModelCount: rows.length,
  /** As-of date of the newest import. */
  catalogAsOf: (catalog as unknown as { meta: { asOf: string } }).meta.asOf,
  /** Rows in the cited desk-research log. Never combined with the release-watch store's count. */
  releaseLogCount: logRows.length,
  editionCount: editionSummaries.length,
  /** Newest edition summary, or null while no edition has been compiled. */
  latestEdition: (editionSummaries[0] ?? null) as EditionSummary | null,
  editions: editionSummaries,
  rows,
  /** Distinct values for the tracker filters, derived from the rows (never typed). */
  filterValues: {
    provider: distinct(rows.map((r) => r.provider)),
    access: distinct(rows.flatMap((r) => r.access)),
    licence: distinct(rows.map((r) => r.licence)),
    status: distinct(rows.map((r) => r.status)),
    tested: distinct(rows.map((r) => r.tested.status)),
  },
} as const;

/** The compiled edition for a date, or null. Reads site/src/data/model-watch/editions/<date>.json. */
export function loadEdition(date: string): Edition | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const p = join(process.cwd(), "src", "data", "model-watch", "editions", `${date}.json`);
  return existsSync(p) ? (JSON.parse(readFileSync(p, "utf8")) as Edition) : null;
}

/** Dates of every compiled edition, newest first (for generateStaticParams). */
export function editionDates(): string[] {
  const dir = join(process.cwd(), "src", "data", "model-watch", "editions");
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((f) => f.endsWith(".json")).map((f) => f.replace(/\.json$/, "")).sort().reverse();
}
