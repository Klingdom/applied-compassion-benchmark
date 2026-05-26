"use client";

import type { HistoryEvent } from "@/types/entity-history";

interface Props {
  events: HistoryEvent[];
  currentComposite: number;
  entityName: string;
  height?: number;
  width?: number;
}

/**
 * CompositeSparkline — pure SVG sparkline of composite score over time.
 *
 * - X axis: chronological event dates (not evenly spaced — gaps matter)
 * - Y axis: composite 0–100, auto-scaled to data range with 10% padding
 * - Line colored by net direction: red (declining), green (rising), muted (mixed/flat)
 * - Current value labeled at rightmost point
 * - No external library; <100 lines
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
  if (Math.abs(lastPoint.value - currentComposite) > 0.05) {
    rawPoints.push({ date: "now", value: currentComposite });
  }

  const values = rawPoints.map((p) => p.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);

  // Add 10% padding to y axis; handle single-value case
  const range = maxVal - minVal || 10;
  const pad = range * 0.12;
  const yMin = Math.max(0, minVal - pad);
  const yMax = Math.min(100, maxVal + pad);
  const yRange = yMax - yMin || 1;

  // SVG coordinate helpers
  const PAD_LEFT = 4;
  const PAD_RIGHT = 48; // space for label
  const PAD_TOP = 6;
  const PAD_BOTTOM = 6;
  const plotW = width - PAD_LEFT - PAD_RIGHT;
  const plotH = height - PAD_TOP - PAD_BOTTOM;

  const toX = (i: number) =>
    PAD_LEFT + (rawPoints.length > 1 ? (i / (rawPoints.length - 1)) * plotW : plotW / 2);
  const toY = (v: number) =>
    PAD_TOP + plotH - ((v - yMin) / yRange) * plotH;

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

  // Final point for label
  const lastPt = points[points.length - 1];

  const ariaLabel = `Composite score over time for ${entityName}: ${rawPoints.length} data points from ${rawPoints[0].value.toFixed(1)} to ${currentComposite.toFixed(1)}`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      height={height}
      role="img"
      aria-label={ariaLabel}
      className="block overflow-visible"
    >
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
        const isLast = i === points.length - 1;
        return (
          <circle
            key={i}
            cx={p.x.toFixed(1)}
            cy={p.y.toFixed(1)}
            r={isLast ? 5 : 3}
            fill={isLast ? lineColor : "var(--color-bg)"}
            stroke={lineColor}
            strokeWidth="1.5"
          />
        );
      })}

      {/* Current value label */}
      <text
        x={(lastPt.x + 8).toFixed(1)}
        y={(lastPt.y + 4).toFixed(1)}
        fontSize="11"
        fill="var(--color-text)"
        fontFamily="inherit"
        fontWeight="600"
      >
        {currentComposite.toFixed(1)}
      </text>
    </svg>
  );
}
