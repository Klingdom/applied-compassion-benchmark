/**
 * getArchiveIndex — build-time helper that aggregates metadata from every
 * daily briefing in the manifest.  Called once from the server page component
 * at static-generation time.  Nothing here runs in the browser.
 */

import manifest from "./manifest.json";

export interface ArchiveEntry {
  date: string;
  /** Short display label: "Apr 15" */
  dateLabel: string;
  headline: string;
  summary: string;
  entitiesScanned: number;
  entitiesAssessed: number;
  scoreChanges: number;
  subThresholdMovements: number;
  hasMethodologyRuling: boolean;
  topEntities: Array<{ slug: string; title: string; index: string }>;
  /** All index slugs that appear in topSignals — used by sector filter */
  indexSlugs: string[];
}

function formatDateLabel(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function extractEntry(date: string, raw: any): ArchiveEntry {
  const pipeline = raw.pipeline ?? {};

  // Headline: use the briefing headline, fall back to first scoreChange headline
  const headline: string =
    raw.headline ??
    raw.scoreChanges?.[0]?.headline ??
    `Compassion Benchmark Daily Briefing — ${date}`;

  const summary: string = raw.summary ?? "";

  // Top entities from topSignals (up to 3)
  const topSignals: any[] = Array.isArray(raw.topSignals) ? raw.topSignals : [];
  const topEntities = topSignals.slice(0, 3).map((s: any) => ({
    slug: s.slug ?? "",
    title: s.title ?? s.slug ?? "",
    index: s.index ?? "",
  }));

  // All index slugs present in topSignals for sector filtering
  const indexSlugs: string[] = [
    ...new Set(topSignals.map((s: any) => s.index).filter(Boolean)),
  ];

  return {
    date,
    dateLabel: formatDateLabel(date),
    headline,
    summary,
    entitiesScanned: pipeline.entitiesScanned ?? 0,
    entitiesAssessed: pipeline.entitiesAssessed ?? 0,
    scoreChanges: pipeline.scoreChanges ?? 0,
    subThresholdMovements: pipeline.subThresholdMovementsDocumented ?? 0,
    hasMethodologyRuling: (pipeline.methodologyRulingsEstablished ?? 0) > 0,
    topEntities,
    indexSlugs,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/**
 * Returns archive entries for every date in the manifest, newest first.
 * Uses synchronous dynamic require so this works in a Next.js server
 * component without async/await at the module level.
 */
export function getArchiveIndex(): ArchiveEntry[] {
  return manifest.dates.map((date) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const raw = require(`./daily/${date}.json`);
      return extractEntry(date, raw);
    } catch {
      // Graceful fallback for any date whose JSON is missing
      return extractEntry(date, {});
    }
  });
}

/** Returns earliest and latest date labels for the page subtitle */
export function getArchiveDateRange(entries: ArchiveEntry[]): {
  earliest: string;
  latest: string;
} {
  if (entries.length === 0) return { earliest: "", latest: "" };
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  return {
    earliest: sorted[0].dateLabel,
    latest: sorted[sorted.length - 1].dateLabel,
  };
}
