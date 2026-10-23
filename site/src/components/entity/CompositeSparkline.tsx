"use client";

import type { HistoryEvent } from "@/types/entity-history";
import { CHART_BANDS } from "@/components/charts/chartTokens";

interface Props {
  events: HistoryEvent[];
  currentComposite: number;
  entityName: string;
  height?: number;
  width?: number;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** "2026-04-01" -> "1 Apr 2026" (no Intl, so server and client render identically). */
function shortDate(iso: string): string {
  const m = ISO_DATE.exec(iso);
  if (!m) return "";
  return `${Number(m[3])} ${MONTHS[Number(m[2]) - 1] ?? ""} ${m[1]}`;
}

function toDay(iso: string): number | null {
  const m = ISO_DATE.exec(iso);
  if (!m) return null;
  return Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])) / 86_400_000;
}

/**
 * CompositeSparkline — pure SVG sparkline of composite score over time.
 *
 * D-61 (Loop 1, dataviz item 2), presentational only:
 * - Y axis: fixed 0-100 (same scale as the band strip), with faint gridlines at
 *   the band edges taken from CHART_BANDS. A flat history sits at its true height.
 * - X axis: by event date (gaps in time are gaps on the page). Falls back to
 *   even spacing by order if any date cannot be parsed or all dates are equal.
 *   The appended "current composite" point has no date of its own, so it is
 *   placed at the right edge after a fixed gap and labelled "now"; no date is
 *   invented for it.
 * - First and latest values are labelled in HTML (>=12px) with their dates.
 * - Line coloured by net direction. No external library.
 */
export default function CompositeSparkline({
  events,
  currentComposite,
  entityName,
  height = 64,
  width = 400,
}: Props) {
  // Collect (date, composite) data points from events that have newComposite
  const rawPoints = events
    .filter((e) => e.newComposite !== null && e.newComposite !== undefined)
    .map((e) => ({ date: e.date, value: e.newComposite as number }));

  // Sort chronologically (events come newest-first)
  rawPoints.sort((a, b) => a.date.localeCompare(b.date));

  // Need at least 1 point; if none, render empty
  if (rawPoints.length === 0) {
    return null;
  }

  // Append current composite as the final point if it differs from last event
  const lastPoint = rawPoints[rawPoints.length - 1];
  const hasNowPoint = Math.abs(lastPoint.value - currentComposite) > 0.05;
  if (hasNowPoint) {
    rawPoints.push({ date: "now", value: currentComposite });
  }

  const values = rawPoints.map((p) => p.value);

  // Fixed 0-100 domain
  const Y_MIN = 0;
  const Y_MAX = 100;

  // SVG coordinate helpers
  const PAD_LEFT = 6;
  const PAD_RIGHT = 6;
  const PAD_TOP = 6;
  const PAD_BOTTOM = 6;
  const NOW_GAP = 18; // fixed gap before the undated "now" point
  const plotW = width - PAD_LEFT - PAD_RIGHT;
  const plotH = height - PAD_TOP - PAD_BOTTOM;

  // X positions: by date when every dated point parses and the span is non-zero
  const datedCount = hasNowPoint ? rawPoints.length - 1 : rawPoints.length;
  const days = rawPoints.slice(0, datedCount).map((p) => toDay(p.date));
  const allDated = days.every((d): d is number => d !== null);
  const dayMin = allDated ? Math.min(...(days as number[])) : 0;
  const dayMax = allDated ? Math.max(...(days as number[])) : 0;
  const byDate = allDated && dayMax > dayMin;
  const datedW = hasNowPoint ? plotW - NOW_GAP : plotW;

  const toX = (i: number): number => {
    if (rawPoints.length === 1) return PAD_LEFT + plotW / 2;
    if (hasNowPoint && i === rawPoints.length - 1) return PAD_LEFT + plotW;
    if (byDate) {
      return PAD_LEFT + (((days[i] as number) - dayMin) / (dayMax - dayMin)) * datedW;
    }
    return PAD_LEFT + (i / (rawPoints.length - 1)) * plotW;
  };
  const toY = (v: number) =>
    PAD_TOP + plotH - ((Math.min(Y_MAX, Math.max(Y_MIN, v)) - Y_MIN) / (Y_MAX - Y_MIN)) * plotH;

  const points = rawPoints.map((p, i) => ({ x: toX(i), y: toY(p.value), value: p.value, date: p.date }));

  // Net direction for line color
  const netDelta = values[values.length - 1] - values[0];
  const lineColor =
    netDelta > 0.5
      ? "var(--color-band-green)"
      : netDelta < -0.5
        ? "var(--color-band-red)"
        : "var(--color-muted)";

  const polylinePoints = points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");

  // Band-edge gridlines (20/40/60/80) from the shared band tokens
  const gridValues = CHART_BANDS.slice(1).map((b) => b.min);

  const first = rawPoints[0];
  const last = rawPoints[rawPoints.length - 1];
  const firstDate = shortDate(first.date);
  const lastDate = last.date === "now" ? "now" : shortDate(last.date);

  const ariaLabel = `Composite score over time for ${entityName}: ${rawPoints.length} data points from ${first.value.toFixed(1)}${firstDate ? ` (${firstDate})` : ""} to ${currentComposite.toFixed(1)}${lastDate ? ` (${lastDate})` : ""}`;

  return (
    <div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height={height}
        role="img"
        aria-label={ariaLabel}
        className="block overflow-visible"
      >
        {/* Fixed-scale gridlines at the band edges */}
        {gridValues.map((v) => (
          <line
            key={v}
            x1={PAD_LEFT}
            x2={width - PAD_RIGHT}
            y1={toY(v)}
            y2={toY(v)}
            stroke="rgba(255,255,255,0.09)"
            strokeWidth="1"
          />
        ))}
        {/* 0 and 100 bounds, fainter */}
        {[Y_MIN, Y_MAX].map((v) => (
          <line
            key={`b${v}`}
            x1={PAD_LEFT}
            x2={width - PAD_RIGHT}
            y1={toY(v)}
            y2={toY(v)}
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="1"
          />
        ))}

        {/* Line */}
        <polyline
          points={polylinePoints}
          fill="none"
          stroke={lineColor}
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Dots for each point */}
        {points.map((p, i) => {
          const isEnd = i === points.length - 1 || i === 0;
          const isLast = i === points.length - 1;
          return (
            <circle
              key={i}
              cx={p.x.toFixed(1)}
              cy={p.y.toFixed(1)}
              r={isEnd ? 4.5 : 3}
              fill={isLast ? lineColor : "var(--color-bg)"}
              stroke={lineColor}
              strokeWidth="1.5"
            />
          );
        })}
      </svg>

      {/* Start and latest labels in HTML so text stays >= 12px */}
      <div className="mt-1 flex items-start justify-between gap-3 text-[0.75rem] tabular-nums text-muted">
        <span>
          <span className="font-semibold text-text">{first.value.toFixed(1)}</span>
          {firstDate && <> · {firstDate}</>}
        </span>
        {rawPoints.length > 1 && (
          <span className="text-right">
            <span className="font-semibold text-text">{last.value.toFixed(1)}</span>
            {lastDate && <> · {lastDate}</>}
          </span>
        )}
      </div>
      <p className="mt-0.5 text-[0.75rem] text-muted">
        Scale 0–100; lines mark band edges ({gridValues.join(" / ")}).
        {byDate ? " Spaced by date." : ""}
      </p>
    </div>
  );
}
