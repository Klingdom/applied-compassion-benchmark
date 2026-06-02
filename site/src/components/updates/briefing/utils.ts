/* eslint-disable @typescript-eslint/no-explicit-any */

import type { BandLevel } from "@/components/ui/Band";

/** Format a YYYY-MM-DD string to "Apr 16" */
export function formatDateLabel(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function normalizeBand(band: string): BandLevel | null {
  const normalized = band?.toLowerCase() as BandLevel;
  const valid: BandLevel[] = [
    "critical",
    "developing",
    "functional",
    "established",
    "exemplary",
  ];
  return valid.includes(normalized) ? normalized : null;
}

export function bandColor(band: string): string {
  const map: Record<string, string> = {
    critical: "#f87171",
    developing: "#fb923c",
    functional: "#fcd34d",
    established: "#86efac",
    exemplary: "#7dd3fc",
  };
  return map[band?.toLowerCase()] ?? "#94a3b8";
}

export function deltaColor(delta: number): string {
  if (delta <= -10) return "#f87171";
  if (delta < 0) return "#fb923c";
  if (delta >= 10) return "#86efac";
  if (delta > 0) return "#34d399";
  return "#94a3b8";
}

export function formatIndex(index: string): string {
  return index
    ?.replace(/-/g, " ")
    .replace(/\b\w/g, (c: string) => c.toUpperCase());
}

export function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/** Issue number relative to April 15, 2026 = Issue 1. */
export function issueNumber(dateStr: string): number {
  const [year, month, day] = dateStr.split("-").map(Number);
  const baseline = Date.UTC(2026, 3, 15);
  const current = Date.UTC(year, month - 1, day);
  return Math.max(0, Math.round((current - baseline) / 86_400_000)) + 1;
}

/** Long-form date label, e.g. "Wednesday, May 18, 2026" */
export function heroDateLabel(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** Severity color map */
export const SEVERITY_COLORS: Record<string, string> = {
  critical: "#f87171",
  high: "#fb923c",
  medium: "#fcd34d",
  low: "#94a3b8",
};

/** Select the lead signal from topSignals. */
export function pickLeadSignal(topSignals: any[]): any | null {
  if (!Array.isArray(topSignals) || topSignals.length === 0) return null;
  // Priority: band crossing > actionRequired > critical > high > first
  const bandCross = topSignals.find(
    (s: any) =>
      typeof s.title === "string" &&
      /band crossing|crosses.*boundary/i.test(s.title),
  );
  if (bandCross) return bandCross;
  const actionReq = topSignals.find((s: any) => s.actionRequired === true);
  if (actionReq) return actionReq;
  const critical = topSignals.find((s: any) => s.severity === "critical");
  if (critical) return critical;
  return topSignals[0];
}

// ─── Wave B: Stat of the Day ───────────────────────────────────────────────

export interface StatOfTheDay {
  /** The headline figure as a display string, e.g. "−6.2 pts" or "33.7M" */
  number: string;
  /** Short label for the figure, e.g. "largest score change this cycle" */
  label: string;
  /** Display name of the entity the stat refers to */
  entity: string;
  /** Entity slug for building the href */
  slug: string;
  /** Index slug for building the href */
  index: string;
}

/**
 * Derive the "Stat of the Day" deterministically from briefing data.
 *
 * Priority:
 * 1. Explicit `updates.statOfTheDay` field (future-proof override)
 * 2. Largest-magnitude applied score change in topSignals
 * 3. Largest-magnitude entry in scoreChanges
 * 4. First recentAssessment with a non-zero delta
 * 5. Confirmation count (flat-briefing fallback)
 *
 * Returns null only when there is truly nothing to surface.
 */
export function deriveStatOfTheDay(updates: any): StatOfTheDay | null {
  // 1. Explicit override
  if (
    updates.statOfTheDay &&
    typeof updates.statOfTheDay.number === "string" &&
    updates.statOfTheDay.entity
  ) {
    return updates.statOfTheDay as StatOfTheDay;
  }

  // 2. Largest-magnitude scored movement in topSignals
  const topSignals: any[] = Array.isArray(updates.topSignals)
    ? updates.topSignals
    : [];
  if (topSignals.length > 0) {
    // Parse delta from title patterns like "(Delta -6.2)" or "→ 6.3 (Delta -6.2)"
    let bestSignal: any = null;
    let bestAbs = 0;
    for (const s of topSignals) {
      const m =
        typeof s.title === "string"
          ? s.title.match(/Delta\s+([-+]?\d+\.?\d*)/i)
          : null;
      const abs = m ? Math.abs(parseFloat(m[1])) : 0;
      if (abs > bestAbs) {
        bestAbs = abs;
        bestSignal = s;
      }
    }
    if (bestSignal && bestAbs > 0) {
      const m = bestSignal.title.match(/Delta\s+([-+]?\d+\.?\d*)/i);
      const raw = m ? parseFloat(m[1]) : 0;
      const sign = raw > 0 ? "+" : "";
      return {
        number: `${sign}${raw} pts`,
        label: "score change this cycle",
        entity: bestSignal.entity ?? extractEntityFromTitle(bestSignal.title),
        slug: bestSignal.slug ?? "",
        index: bestSignal.index ?? "",
      };
    }
    // No delta in title — use first topSignal
    const first = topSignals[0];
    if (first.slug && first.index) {
      return {
        number: first.severity?.toUpperCase() ?? "ACTIVE",
        label: "priority signal",
        entity: first.entity ?? extractEntityFromTitle(first.title),
        slug: first.slug,
        index: first.index,
      };
    }
  }

  // 3. Largest-magnitude scoreChange
  const scoreChanges: any[] = Array.isArray(updates.scoreChanges)
    ? updates.scoreChanges
    : [];
  if (scoreChanges.length > 0) {
    const top = [...scoreChanges]
      .filter((c) => typeof c.delta === "number" && c.delta !== 0)
      .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))[0];
    if (top) {
      const sign = top.delta > 0 ? "+" : "";
      return {
        number: `${sign}${top.delta} pts`,
        label: "score change this cycle",
        entity: top.entity ?? top.slug,
        slug: top.slug ?? "",
        index: top.index ?? "",
      };
    }
  }

  // 4. First recentAssessment with non-zero delta
  const recentAssessments: any[] = Array.isArray(updates.recentAssessments)
    ? updates.recentAssessments
    : [];
  const nonZero = recentAssessments.find(
    (a) => typeof a.delta === "number" && a.delta !== 0,
  );
  if (nonZero) {
    const sign = nonZero.delta > 0 ? "+" : "";
    return {
      number: `${sign}${nonZero.delta} pts`,
      label: "score change this cycle",
      entity: nonZero.entity ?? nonZero.slug,
      slug: nonZero.slug ?? "",
      index: nonZero.index ?? "",
    };
  }

  // 5. Flat-briefing fallback: confirmation count
  const confirmations: any[] = Array.isArray(updates.confirmations)
    ? updates.confirmations
    : [];
  if (confirmations.length > 0) {
    return {
      number: `${confirmations.length}`,
      label: "positions confirmed this cycle",
      entity: "all indexed entities",
      slug: "",
      index: "",
    };
  }

  return null;
}

/** Extract a likely entity name from a topSignal title string. */
function extractEntityFromTitle(title: string): string {
  if (!title) return "Entity";
  // Pattern: "Entity Name 12.5 → 6.3" or "Entity Name (Delta …)"
  const m = title.match(/^([^(→\d][^(→\d]*?)\s+(?:\d|\(|→)/);
  if (m) return m[1].trim();
  // Fallback: first 3 words
  return title.split(/\s+/).slice(0, 3).join(" ");
}

// ─── Wave B: Today in Brief ───────────────────────────────────────────────

export interface TodayInBriefItem {
  text: string;
  /** Entity slug + index slug — used to link the bullet to the entity detail page. */
  slug?: string;
  index?: string;
}

/**
 * Derive up to 3 scannable summary bullets for "Today in Brief".
 *
 * Priority:
 * 1. topSignals[0..2].title  (rich briefing, >= 2026-05-26)
 * 2. highlights[0..2]         (most briefings have this)
 * 3. scoreChanges[0..2].headline (flat-briefing fallback)
 * 4. headline field           (last resort single bullet)
 */
export function deriveTodayInBrief(updates: any): TodayInBriefItem[] {
  const items: TodayInBriefItem[] = [];

  // 1. topSignals
  const topSignals: any[] = Array.isArray(updates.topSignals)
    ? updates.topSignals
    : [];
  if (topSignals.length > 0) {
    for (const s of topSignals.slice(0, 3)) {
      const text =
        typeof s.title === "string" && s.title.trim() ? s.title.trim() : null;
      if (text) items.push({ text, slug: s.slug ?? undefined, index: s.index ?? undefined });
    }
    if (items.length > 0) return items;
  }

  // 2. highlights
  const highlights: any[] = Array.isArray(updates.highlights)
    ? updates.highlights
    : [];
  if (highlights.length > 0) {
    for (const h of highlights.slice(0, 3)) {
      const text =
        typeof h === "string" && h.trim()
          ? h.trim()
          : typeof h?.text === "string"
            ? h.text.trim()
            : null;
      if (text) items.push({ text });
    }
    if (items.length > 0) return items;
  }

  // 3. scoreChanges with non-empty headlines
  const scoreChanges: any[] = Array.isArray(updates.scoreChanges)
    ? updates.scoreChanges
    : [];
  const withHeadlines = scoreChanges.filter(
    (c) => typeof c.headline === "string" && c.headline.trim().length > 0,
  );
  for (const c of withHeadlines.slice(0, 3)) {
    items.push({
      text: c.headline.trim(),
      slug: c.slug ?? undefined,
      index: c.index ?? undefined,
    });
  }
  if (items.length > 0) return items;

  // 4. Single headline fallback
  const headline =
    typeof updates.headline === "string" ? updates.headline.trim() : "";
  if (headline) {
    items.push({ text: headline.split(/(?<=[.!?])\s/)[0] });
  }

  return items;
}
