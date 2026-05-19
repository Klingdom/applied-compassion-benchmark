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
