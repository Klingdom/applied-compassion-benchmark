/**
 * getForwardWatchIndex — build-time helper that aggregates forwardTriggers[]
 * from every daily briefing JSON in the manifest.
 *
 * Deduplication: entity+trigger combo keyed to avoid listing the same trigger
 * from multiple briefings. The entry with the most recent source briefing date
 * is kept (so stale older entries are replaced).
 *
 * Sorting: upcoming (by trigger date asc), then TBD, then elapsed.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import manifest from "./manifest.json";

export interface ForwardWatchEntry {
  date: string;           // trigger date (YYYY-MM-DD or "TBD")
  entity: string;         // display name
  slug: string | null;
  trigger: string;
  priority: string;
  sourceBriefingDate: string;  // which briefing this came from (latest)
  briefingPath: string;
  daysUntil: number | null;    // computed at build time from latest manifest date
}

function parseDate(s: string): Date | null {
  if (!s || s.toUpperCase() === "TBD") return null;
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
}

function daysFromLatest(triggerDateStr: string, latestDateStr: string): number | null {
  const trigger = parseDate(triggerDateStr);
  const latest = parseDate(latestDateStr);
  if (!trigger || !latest) return null;
  return Math.round((trigger.getTime() - latest.getTime()) / 86_400_000);
}

/**
 * Stable dedup key: lower-cased entity slug (or name) + first 60 chars of trigger.
 */
function dedupKey(trigger: any): string {
  const entityKey = (trigger.slug ?? trigger.entity ?? "").toLowerCase().trim();
  const triggerKey = (trigger.trigger ?? "").slice(0, 60).toLowerCase().trim();
  return `${entityKey}::${triggerKey}`;
}

export function getForwardWatchIndex(): ForwardWatchEntry[] {
  const latestDate = manifest.latest ?? manifest.dates[0] ?? "";
  const dedupMap = new Map<string, ForwardWatchEntry>();

  for (const date of manifest.dates) {
    let raw: any;
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      raw = require(`./daily/${date}.json`);
    } catch {
      continue;
    }

    const triggers: any[] = Array.isArray(raw.forwardTriggers) ? raw.forwardTriggers : [];
    for (const t of triggers) {
      if (!t || typeof t.trigger !== "string") continue;
      const key = dedupKey(t);
      const existing = dedupMap.get(key);

      // Keep the entry from the MOST RECENT briefing date
      if (!existing || date > existing.sourceBriefingDate) {
        dedupMap.set(key, {
          date: t.date ?? "TBD",
          entity: t.entity ?? t.slug ?? "Unknown",
          slug: t.slug ?? null,
          trigger: t.trigger,
          priority: t.priority ?? "medium",
          sourceBriefingDate: date,
          briefingPath: `/updates/${date}`,
          daysUntil: daysFromLatest(t.date ?? "", latestDate),
        });
      }
    }
  }

  const entries = Array.from(dedupMap.values());

  // Sort: upcoming first (ascending days), TBD after upcoming, elapsed last
  return entries.sort((a, b) => {
    const da = a.daysUntil;
    const db = b.daysUntil;
    // null = TBD; sort after upcoming, before elapsed
    if (da === null && db === null) return a.entity.localeCompare(b.entity);
    if (da === null) return db !== null && db < 0 ? -1 : 1;
    if (db === null) return da !== null && da < 0 ? 1 : -1;
    // Both have dates — sort ascending (upcoming first, then elapsed descending)
    if (da >= 0 && db >= 0) return da - db;
    if (da < 0 && db < 0) return db - da; // most recently elapsed first
    if (da >= 0) return -1; // a is upcoming, b is elapsed
    return 1;
  });
}
