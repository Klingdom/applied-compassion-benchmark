/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * MovementDeltaStrip — Item 5
 *
 * Horizontal diverging-bar chart: shows all assessed entities for the cycle
 * sorted by |delta| descending, with bars extending left (negative) or right
 * (positive) from a shared center zero line. Bar color = band color of the
 * assessed score. Cap at 12 rows.
 *
 * No client JS, no deps. HTML/CSS bars (responsive, text >= 12px).
 * D-61: unapplied rows are dashed outline + "not applied"; applied rows are solid.
 * Static-export safe.
 *
 * Data sourcing mirrors ScoreMovementDashboard.tsx exactly.
 */

import type React from "react";
import { getBandColor } from "@/components/charts/chartTokens";
import { isScoreChangeApplied } from "./utils";

// ─── Data merging (mirrors ScoreMovementDashboard) ───────────────────────────

interface AssessedRow {
  entity: string;
  delta: number;
  assessed: number; // 0–100 composite score
  bandColor: string;
  /** BRF-MOVE: true only when the change was applied to the published index. */
  applied: boolean;
}

function buildRows(updates: any): AssessedRow[] {
  const recentAssessments: any[] = Array.isArray(updates.recentAssessments)
    ? updates.recentAssessments
    : [];
  const appliedChanges: any[] = Array.isArray(updates.appliedChanges)
    ? updates.appliedChanges
    : [];
  const pendingReview: any[] = Array.isArray(updates.pendingReview)
    ? updates.pendingReview
    : [];
  const scoreChanges: any[] = Array.isArray(updates.scoreChanges)
    ? updates.scoreChanges
    : [];

  const changeBySlug: Record<string, any> = {};
  for (const c of [...appliedChanges, ...pendingReview, ...scoreChanges]) {
    if (c.slug) changeBySlug[c.slug] = c;
  }

  const seen = new Set<string>();
  const rows: AssessedRow[] = [];

  for (const a of recentAssessments) {
    if (!a.slug || seen.has(a.slug)) continue;
    seen.add(a.slug);
    const slugKey: string = a.slug;
    const change = changeBySlug[a.slug];
    const entity: string = a.entity ?? change?.entity ?? a.slug;
    const delta: number = typeof a.delta === "number" ? a.delta : (typeof change?.delta === "number" ? change.delta : 0);
    const assessed: number = typeof a.assessed === "number"
      ? a.assessed
      : typeof a.assessedScore === "number"
        ? a.assessedScore
        : typeof change?.assessedScore === "number"
          ? change.assessedScore
          : 0;
    rows.push({ entity, delta, assessed, bandColor: getBandColor(assessed), applied: isScoreChangeApplied(updates, slugKey) });
  }

  // Add any score changes not already in recentAssessments
  for (const c of [...appliedChanges, ...pendingReview, ...scoreChanges]) {
    if (!c.slug || seen.has(c.slug)) continue;
    seen.add(c.slug);
    const slugKey: string = c.slug;
    const entity: string = c.entity ?? c.slug;
    const delta: number = typeof c.delta === "number" ? c.delta : 0;
    const assessed: number = typeof c.assessedScore === "number"
      ? c.assessedScore
      : typeof c.assessed === "number"
        ? c.assessed
        : 0;
    rows.push({ entity, delta, assessed, bandColor: getBandColor(assessed), applied: isScoreChangeApplied(updates, slugKey) });
  }

  // Sort by |delta| descending
  rows.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));

  // Cap at 12
  return rows.slice(0, 12);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function truncateLabel(name: string, maxLen = 20): string {
  return name.length > maxLen ? name.slice(0, maxLen - 1) + "…" : name;
}

function formatDelta(delta: number): string {
  if (delta === 0) return "0";
  const sign = delta > 0 ? "+" : "";
  return `${sign}${delta % 1 === 0 ? delta : delta.toFixed(1)}`;
}

// ─── Plain-language takeaway line ─────────────────────────────────────────────

function buildTakeaway(rows: AssessedRow[]): string {
  if (rows.length === 0) return "No entities assessed this cycle.";
  const movers = rows.filter((r) => r.delta !== 0);
  const upgrades = movers.filter((r) => r.delta > 0).length;
  const downgrades = movers.filter((r) => r.delta < 0).length;
  const holds = rows.length - movers.length;
  // BRF-MOVE: figures that were not applied are proposals, not movements.
  const allProposed = movers.length > 0 && movers.every((r) => !r.applied);

  const parts: string[] = [];
  parts.push(`${rows.length} assessed`);
  if (movers.length > 0) {
    const moveParts: string[] = [];
    if (upgrades > 0) moveParts.push(`${upgrades} ${allProposed ? "measured up, not applied" : "up"}`);
    if (downgrades > 0) moveParts.push(`${downgrades} ${allProposed ? "measured down, not applied" : "down"}`);
    parts.push(moveParts.join(", "));
  }
  if (holds > 0) parts.push(`${holds} hold${holds !== 1 ? "s" : ""}`);

  const largest = rows[0]; // already sorted by |delta| desc
  if (largest && largest.delta !== 0) {
    parts.push(
      largest.applied
        ? `largest: ${largest.entity} ${formatDelta(largest.delta)}`
        : `largest measured difference (not applied): ${largest.entity} ${formatDelta(largest.delta)}`,
    );
  }

  return parts.join(" · ");
}

// ─── Accessible label ────────────────────────────────────────────────────────

function buildAriaLabel(rows: AssessedRow[]): string {
  if (rows.length === 0) return "No entities assessed this cycle.";
  const appliedRows = rows.filter((r) => r.applied);
  const proposedRows = rows.filter((r) => !r.applied && r.delta !== 0);
  const holds = rows.filter((r) => r.delta === 0).length;
  const holdsPart = `${holds} hold${holds !== 1 ? "s" : ""}`;
  const parts: string[] = [];

  if (appliedRows.length > 0) {
    const upgrades = appliedRows.filter((r) => r.delta > 0).length;
    const largest = appliedRows.find((r) => r.delta !== 0);
    parts.push(
      `Applied: ${upgrades} upgrade${upgrades !== 1 ? "s" : ""}${
        largest ? `; largest move ${largest.entity} ${formatDelta(largest.delta)}` : ""
      }`,
    );
  }
  if (proposedRows.length > 0) {
    const largest = proposedRows[0];
    parts.push(
      `${proposedRows.length} measured difference${proposedRows.length !== 1 ? "s" : ""} from the published score, not applied; ` +
        `largest measured difference (not applied) ${largest.entity} ${formatDelta(largest.delta)}`,
    );
  }
  parts.push(holdsPart);
  return `Today's cycle: ${parts.join("; ")}.`;
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  updates: any;
}

export default function MovementDeltaStrip({ updates }: Props) {
  const rows = buildRows(updates);

  // Degrade gracefully: no assessed entities at all
  if (rows.length === 0) return null;

  // ── Zero-day fallback (confirmation-dominant cycle) ─────────────────────────
  // When every delta is 0, render a plain-language summary instead of dead ticks.
  const hasAnyMover = rows.some((r) => r.delta !== 0);
  if (!hasAnyMover) {
    const pipeline = updates.pipeline ?? {};
    const confirmations: number =
      typeof pipeline.confirmations === "number" ? pipeline.confirmations : rows.length;
    const corrections: number =
      typeof pipeline.scannerCorrections === "number" ? pipeline.scannerCorrections : 0;

    return (
      <p className="text-[0.82rem] text-muted leading-relaxed tabular-nums">
        <span className="text-text font-semibold">{confirmations}</span>{" "}
        position{confirmations !== 1 ? "s" : ""} confirmed, <span className="text-text font-semibold">0</span> moved
        {corrections > 0 && (
          <>
            {" "}—{" "}
            <span className="text-[#7dd3fc] font-semibold">{corrections}</span>{" "}
            false signal{corrections !== 1 ? "s" : ""} caught before{" "}
            {corrections !== 1 ? "they" : "it"} could change a score.
          </>
        )}
      </p>
    );
  }

  const maxAbsDelta = Math.max(...rows.map((r) => Math.abs(r.delta)), 1);

  const ariaLabel = buildAriaLabel(rows);
  const takeaway = buildTakeaway(rows);
  const anyUnapplied = rows.some((r) => !r.applied && r.delta !== 0);
  const anyApplied = rows.some((r) => r.applied && r.delta !== 0);

  // Name | bar track | delta. Text is HTML (>= 0.75rem) so it never scales down with the
  // container; only the bars are proportional.
  const GRID = "grid grid-cols-[minmax(5.5rem,9rem)_minmax(0,1fr)_minmax(4.5rem,6rem)] items-center gap-x-2";

  return (
    <div>
      {/* Takeaway line */}
      <p className="text-[0.8125rem] text-muted mb-2 tabular-nums">
        {takeaway}
      </p>

      {/* One-line key (D-61): solid vs outline vs colour. */}
      <p className="text-[0.75rem] text-muted mb-2">
        {anyApplied && anyUnapplied
          ? "Solid = applied to the published score · Outline = measured, not applied · Colour = band of the measurement"
          : anyUnapplied
            ? "Outline = measured, not applied to the published score · Colour = band of the measurement"
            : "Solid = applied to the published score · Colour = band of the measurement"}
      </p>

      <div role="img" aria-label={ariaLabel} title={ariaLabel} className="w-full">
        <div aria-hidden="true">
          {/* Axis labels */}
          <div className={`${GRID} text-[0.75rem] text-muted tabular-nums mb-1`}>
            <span />
            <div className="flex justify-between whitespace-nowrap">
              <span>−{maxAbsDelta}</span>
              <span className="hidden sm:inline">0</span>
              <span>+{maxAbsDelta}</span>
            </div>
            <span />
          </div>

          {rows.map((row, i) => {
            const absDelta = Math.abs(row.delta);
            const halfPct = absDelta === 0 ? 0 : (absDelta / maxAbsDelta) * 48; // % of track, per side
            const showUnapplied = !row.applied && absDelta > 0;
            const barStyle: React.CSSProperties = {
              position: "absolute",
              top: 0,
              bottom: 0,
              minWidth: 3,
              width: `${halfPct}%`,
              ...(row.delta >= 0 ? { left: "50%" } : { right: "50%" }),
              borderRadius: 2,
              ...(showUnapplied
                ? {
                    border: `1.5px dashed ${row.bandColor}`,
                    background: `repeating-linear-gradient(45deg, ${row.bandColor}40 0 3px, transparent 3px 6px)`,
                    boxSizing: "border-box",
                  }
                : { background: row.bandColor, opacity: 0.75 }),
            };
            return (
              <div key={`${row.entity}-${i}`} className={`${GRID} py-[3px]`}>
                <span className="text-[0.8125rem] text-text/90 text-right truncate" title={row.entity}>
                  {row.entity}
                </span>
                <div className="relative h-3 rounded-[2px] bg-[rgba(255,255,255,0.03)]">
                  <div className="absolute top-0 bottom-0 left-1/2 w-px bg-[rgba(255,255,255,0.12)]" />
                  {absDelta > 0 ? (
                    <div style={barStyle} />
                  ) : (
                    <div className="absolute top-0 bottom-0 left-1/2 -ml-px w-0.5 bg-[rgba(148,163,184,0.4)]" />
                  )}
                </div>
                <span
                  className="text-[0.8125rem] tabular-nums leading-tight"
                  style={{
                    color: absDelta === 0 ? "#8fa3be" : row.bandColor,
                    fontWeight: absDelta > 0 ? 700 : 400,
                  }}
                >
                  {formatDelta(row.delta)}
                  {showUnapplied && (
                    <span className="block text-[0.75rem] font-normal text-muted">not applied</span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
