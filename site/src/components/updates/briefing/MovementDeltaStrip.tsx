/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * MovementDeltaStrip — Item 5
 *
 * Horizontal diverging-bar chart: shows all assessed entities for the cycle
 * sorted by |delta| descending, with bars extending left (negative) or right
 * (positive) from a shared center zero line. Bar color = band color of the
 * assessed score. Cap at 12 rows.
 *
 * No client JS, no deps. Hand-rolled SVG following BandPositionStrip pattern.
 * Static-export safe.
 *
 * Data sourcing mirrors ScoreMovementDashboard.tsx exactly.
 */

import { getBandColor } from "@/components/charts/chartTokens";

// ─── SVG layout constants ────────────────────────────────────────────────────

const SVG_W = 600;
const ROW_H = 22;
const LABEL_W = 140;  // left gutter for entity name
const DELTA_W = 42;   // right gutter for "+N.N" label
const BAR_AREA_W = SVG_W - LABEL_W - DELTA_W; // center bar area
const BAR_CENTER_X = LABEL_W + BAR_AREA_W / 2; // x of the zero line
const MAX_BAR_HALF = BAR_AREA_W / 2 - 4;       // max bar half-width (px), leaving 4px margin
const MIN_BAR_W = 3;  // minimum visible bar width for non-zero deltas

const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

// ─── Data merging (mirrors ScoreMovementDashboard) ───────────────────────────

interface AssessedRow {
  entity: string;
  delta: number;
  assessed: number; // 0–100 composite score
  bandColor: string;
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
    rows.push({ entity, delta, assessed, bandColor: getBandColor(assessed) });
  }

  // Add any score changes not already in recentAssessments
  for (const c of [...appliedChanges, ...pendingReview, ...scoreChanges]) {
    if (!c.slug || seen.has(c.slug)) continue;
    seen.add(c.slug);
    const entity: string = c.entity ?? c.slug;
    const delta: number = typeof c.delta === "number" ? c.delta : 0;
    const assessed: number = typeof c.assessedScore === "number"
      ? c.assessedScore
      : typeof c.assessed === "number"
        ? c.assessed
        : 0;
    rows.push({ entity, delta, assessed, bandColor: getBandColor(assessed) });
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

  const parts: string[] = [];
  parts.push(`${rows.length} assessed`);
  if (movers.length > 0) {
    const moveParts: string[] = [];
    if (upgrades > 0) moveParts.push(`${upgrades} up`);
    if (downgrades > 0) moveParts.push(`${downgrades} down`);
    parts.push(moveParts.join(", "));
  }
  if (holds > 0) parts.push(`${holds} hold${holds !== 1 ? "s" : ""}`);

  const largest = rows[0]; // already sorted by |delta| desc
  if (largest && largest.delta !== 0) {
    parts.push(`largest: ${largest.entity} ${formatDelta(largest.delta)}`);
  }

  return parts.join(" · ");
}

// ─── Accessible label ────────────────────────────────────────────────────────

function buildAriaLabel(rows: AssessedRow[]): string {
  if (rows.length === 0) return "No entities assessed this cycle.";
  const upgrades = rows.filter((r) => r.delta > 0).length;
  const holds = rows.filter((r) => r.delta === 0).length;
  const largest = rows[0];
  const largestPart = largest && largest.delta !== 0
    ? `; largest move ${largest.entity} ${formatDelta(largest.delta)}`
    : "";
  return `Today's movement: ${upgrades} upgrade${upgrades !== 1 ? "s" : ""}, ${holds} hold${holds !== 1 ? "s" : ""}${largestPart}.`;
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
  const svgHeight = rows.length * ROW_H + 28; // 16px top axis, 12px bottom pad
  const AXIS_Y = 14; // y for the axis band labels

  const ariaLabel = buildAriaLabel(rows);
  const takeaway = buildTakeaway(rows);

  return (
    <div>
      {/* Takeaway line */}
      <p className="text-[0.75rem] text-muted mb-2 tabular-nums">
        {takeaway}
      </p>

      {/* SVG strip */}
      <div className="overflow-x-auto" style={{ WebkitOverflowScrolling: "touch" }}>
        <svg
          role="img"
          aria-label={ariaLabel}
          viewBox={`0 0 ${SVG_W} ${svgHeight}`}
          width={SVG_W}
          height={svgHeight}
          xmlns="http://www.w3.org/2000/svg"
          style={{ display: "block", minWidth: SVG_W, maxWidth: "100%" }}
        >
          <title>{ariaLabel}</title>

          {/* Axis tick labels at top */}
          <text
            x={BAR_CENTER_X - MAX_BAR_HALF}
            y={AXIS_Y}
            textAnchor="middle"
            fill="rgba(148,163,184,0.5)"
            fontSize="7"
            fontFamily={FONT}
          >
            −{maxAbsDelta}
          </text>
          <text
            x={BAR_CENTER_X}
            y={AXIS_Y}
            textAnchor="middle"
            fill="rgba(148,163,184,0.5)"
            fontSize="7"
            fontFamily={FONT}
          >
            0
          </text>
          <text
            x={BAR_CENTER_X + MAX_BAR_HALF}
            y={AXIS_Y}
            textAnchor="middle"
            fill="rgba(148,163,184,0.5)"
            fontSize="7"
            fontFamily={FONT}
          >
            +{maxAbsDelta}
          </text>

          {/* Center zero line — full height */}
          <line
            x1={BAR_CENTER_X}
            y1={AXIS_Y + 2}
            x2={BAR_CENTER_X}
            y2={svgHeight - 2}
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="1"
          />

          {/* Rows */}
          {rows.map((row, i) => {
            const rowY = AXIS_Y + 4 + i * ROW_H; // top of the row
            const barCY = rowY + ROW_H / 2;       // vertical center of bar
            const barH = 8;

            // Compute bar width
            const absDelta = Math.abs(row.delta);
            const scaledW = absDelta === 0
              ? 0
              : Math.max(MIN_BAR_W, (absDelta / maxAbsDelta) * MAX_BAR_HALF);

            // Bar rect: positive extends right, negative extends left
            const barX = row.delta >= 0
              ? BAR_CENTER_X
              : BAR_CENTER_X - scaledW;
            const barW = scaledW;

            // Delta label x position
            const deltaLabelX = SVG_W - DELTA_W + 4;

            return (
              <g key={`${row.entity}-${i}`}>
                {/* Entity name */}
                <text
                  x={LABEL_W - 6}
                  y={barCY + 4}
                  textAnchor="end"
                  fill="rgba(226,232,240,0.85)"
                  fontSize="8.5"
                  fontFamily={FONT}
                >
                  {truncateLabel(row.entity)}
                </text>

                {/* Background track row (very faint) */}
                <rect
                  x={LABEL_W}
                  y={barCY - barH / 2}
                  width={BAR_AREA_W}
                  height={barH}
                  fill="rgba(255,255,255,0.03)"
                  rx="2"
                />

                {/* Delta bar */}
                {absDelta > 0 && (
                  <rect
                    x={barX}
                    y={barCY - barH / 2}
                    width={barW}
                    height={barH}
                    fill={row.bandColor}
                    opacity="0.75"
                    rx="2"
                  />
                )}

                {/* Zero tick (delta === 0) */}
                {absDelta === 0 && (
                  <rect
                    x={BAR_CENTER_X - 1}
                    y={barCY - barH / 2}
                    width={2}
                    height={barH}
                    fill="rgba(148,163,184,0.4)"
                  />
                )}

                {/* Delta value label */}
                <text
                  x={deltaLabelX}
                  y={barCY + 4}
                  textAnchor="start"
                  fill={absDelta === 0 ? "rgba(148,163,184,0.5)" : row.bandColor}
                  fontSize="8"
                  fontWeight={absDelta > 0 ? "700" : "400"}
                  fontFamily={FONT}
                >
                  {formatDelta(row.delta)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
