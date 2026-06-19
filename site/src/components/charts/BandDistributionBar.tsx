/**
 * BandDistributionBar — Wave H1, Item #2
 *
 * Server component: renders a horizontal stacked-bar SVG segmented by the
 * five compassion bands (Critical / Developing / Functional / Established /
 * Exemplary), with count + % labels and a legend.
 *
 * Props:
 *   index  — "all" (aggregate across all 7 indexes) | individual index slug |
 *             undefined (defaults to "all").
 *   counts — explicit { Critical, Developing, Functional, Established, Exemplary }
 *             override; skips any file loading.
 *
 * Data: computed at build time from site/src/data/indexes/*.json rankings[].band.
 * No client JS, no charting dependency — hand-rolled inline SVG following the
 * ScoreSparkline pattern.
 *
 * Accessibility: role="img" + <title> + aria-label summarizing the distribution.
 * Caption: "Source: Compassion Benchmark · CC-BY"
 */

import countriesData from "@/data/indexes/countries.json";
import fortune500Data from "@/data/indexes/fortune-500.json";
import globalCitiesData from "@/data/indexes/global-cities.json";
import aiLabsData from "@/data/indexes/ai-labs.json";
import roboticsLabsData from "@/data/indexes/robotics-labs.json";
import usStatesData from "@/data/indexes/us-states.json";
import usCitiesData from "@/data/indexes/us-cities.json";
import universitiesData from "@/data/indexes/universities.json";
import { CHART_BANDS, CC_BY_CAPTION } from "./chartTokens";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BandCounts {
  Critical: number;
  Developing: number;
  Functional: number;
  Established: number;
  Exemplary: number;
}

// ─── Band config — sourced from chartTokens (single source of truth) ─────────

const BANDS = CHART_BANDS;

// ─── Index slug map ───────────────────────────────────────────────────────────

const INDEX_DATA: Record<string, { rankings: Array<{ band?: string }> }> = {
  "countries":       countriesData as { rankings: Array<{ band?: string }> },
  "fortune-500":     fortune500Data as { rankings: Array<{ band?: string }> },
  "global-cities":   globalCitiesData as { rankings: Array<{ band?: string }> },
  "ai-labs":         aiLabsData as { rankings: Array<{ band?: string }> },
  "robotics-labs":   roboticsLabsData as { rankings: Array<{ band?: string }> },
  "us-states":       usStatesData as { rankings: Array<{ band?: string }> },
  "us-cities":       usCitiesData as { rankings: Array<{ band?: string }> },
  "universities":    universitiesData as { rankings: Array<{ band?: string }> },
};

// ─── Data helpers ─────────────────────────────────────────────────────────────

function countsFromRankings(rankings: Array<{ band?: string }>): BandCounts {
  const c: BandCounts = { Critical: 0, Developing: 0, Functional: 0, Established: 0, Exemplary: 0 };
  for (const r of rankings) {
    const band = r.band ? (r.band.charAt(0).toUpperCase() + r.band.slice(1)) as keyof BandCounts : null;
    if (band && band in c) c[band]++;
  }
  return c;
}

function computeCounts(index?: string, counts?: BandCounts): BandCounts {
  if (counts) return counts;

  if (!index || index === "all") {
    // Aggregate across all indexes
    const all: BandCounts = { Critical: 0, Developing: 0, Functional: 0, Established: 0, Exemplary: 0 };
    for (const data of Object.values(INDEX_DATA)) {
      const c = countsFromRankings(data.rankings);
      for (const k of Object.keys(c) as (keyof BandCounts)[]) {
        all[k] += c[k];
      }
    }
    return all;
  }

  const data = INDEX_DATA[index];
  if (!data) return { Critical: 0, Developing: 0, Functional: 0, Established: 0, Exemplary: 0 };
  return countsFromRankings(data.rankings);
}

// ─── SVG dimensions ───────────────────────────────────────────────────────────

const BAR_W = 600;
const BAR_H = 36;
const BAR_H_COMPACT = 16;
const LEGEND_ITEM_H = 22;

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  /** Index slug or "all". Defaults to "all". */
  index?: string;
  /** Explicit counts override — skips file loading. */
  counts?: BandCounts;
  /** Optional caption override shown under the bar. */
  caption?: string;
  /** Width in px for the rendered SVG. Defaults to full width via CSS. */
  width?: number;
  /**
   * Wave E1 — highlight a specific band with a "you are here" caret marker.
   * Rendered as a small triangle below the segment. Case-insensitive.
   */
  highlightBand?: string;
  /**
   * Wave E1 — compact mode for index cards: thinner bar, no legend row,
   * no caption. Keeps existing callers unchanged (default: false).
   */
  compact?: boolean;
}

export default function BandDistributionBar({ index = "all", counts, caption, highlightBand, compact = false }: Props) {
  let resolved: BandCounts;
  try {
    resolved = computeCounts(index, counts);
  } catch {
    return null; // graceful degradation
  }

  const total = Object.values(resolved).reduce((a, b) => a + b, 0);
  if (total === 0) return null;

  // Build segments with x offsets
  type Segment = {
    key: keyof BandCounts;
    range: string;
    color: string;
    textColor: string;
    count: number;
    pct: number;
    w: number;
    x: number;
  };

  const segments: Segment[] = [];
  let xCursor = 0;
  for (const band of BANDS) {
    const count = resolved[band.key];
    const pct = count / total;
    const w = pct * BAR_W;
    segments.push({ ...band, count, pct, w, x: xCursor });
    xCursor += w;
  }

  // "You are here" caret — find the matching segment (computed before aria label)
  const normalizedHighlight = highlightBand
    ? highlightBand.charAt(0).toUpperCase() + highlightBand.slice(1).toLowerCase()
    : null;
  const highlightSeg = normalizedHighlight
    ? segments.find(s => s.key === normalizedHighlight)
    : null;

  // Accessible label
  const labelParts = segments.map(
    (s) => `${s.key} (${s.range}): ${s.count} (${Math.round(s.pct * 100)}%)`
  );
  const highlightNote = normalizedHighlight
    ? ` This entity is in the ${normalizedHighlight} band.`
    : "";
  const ariaLabel = `Band distribution across ${total.toLocaleString()} entities: ${labelParts.join(", ")}.${highlightNote}`;

  // Compact mode: thinner bar, no legend, no caption
  const barH = compact ? BAR_H_COMPACT : BAR_H;

  // Legend rows: 2 per row on narrow, all 5 in a row
  const legendY = barH + 10;
  const legendItemW = BAR_W / 5;

  // SVG total height — add row for caret if highlighting
  const caretRowH = (!compact && highlightSeg) ? 14 : 0;
  const svgH = compact
    ? barH
    : barH + LEGEND_ITEM_H + 20 + caretRowH; // bar + caret + legend row + padding

  return (
    <figure className="w-full" aria-label={ariaLabel}>
      <svg
        role="img"
        viewBox={`0 0 ${BAR_W} ${svgH}`}
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: "block", width: "100%", height: "auto" }}
        aria-label={ariaLabel}
      >
        <title>Band distribution across {total.toLocaleString()} entities</title>

        {/* Stacked horizontal bar */}
        {segments.map((s) => (
          <g key={s.key}>
            {s.w > 0 && (
              <rect
                x={s.x}
                y={0}
                width={s.w}
                height={barH}
                fill={s.color}
                rx={s.x === 0 ? 4 : 0}
                ry={s.x === 0 ? 4 : 0}
              />
            )}
            {/* Right side rounding for last non-zero segment */}
          </g>
        ))}

        {/* Right-side rounded cap on last segment */}
        {segments.filter(s => s.w > 0).slice(-1).map(s => (
          <rect
            key={`${s.key}-cap`}
            x={s.x + s.w - 4}
            y={0}
            width={4}
            height={barH}
            fill={s.color}
            rx={4}
            ry={4}
          />
        ))}

        {/* Count + % labels inside segments (only if segment wide enough, and not compact) */}
        {!compact && segments.map((s) => {
          if (s.w < 40) return null;
          const cx = s.x + s.w / 2;
          const showPct = s.w >= 60;
          return (
            <g key={`label-${s.key}`}>
              <text
                x={cx}
                y={showPct ? barH / 2 - 4 : barH / 2 + 5}
                textAnchor="middle"
                fill={s.textColor}
                fontSize="11"
                fontWeight="700"
                fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
              >
                {s.count.toLocaleString()}
              </text>
              {showPct && (
                <text
                  x={cx}
                  y={barH / 2 + 9}
                  textAnchor="middle"
                  fill={s.textColor}
                  fontSize="9"
                  fontWeight="500"
                  opacity="0.75"
                  fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                >
                  {Math.round(s.pct * 100)}%
                </text>
              )}
            </g>
          );
        })}

        {/* "You are here" caret below the highlighted segment (not compact) */}
        {!compact && highlightSeg && (() => {
          const cx = highlightSeg.x + highlightSeg.w / 2;
          const cy = barH + 2;
          // Triangle pointing upward into the segment
          const caretSize = 5;
          const triPoints = `${cx},${cy} ${cx - caretSize},${cy + caretSize * 1.5} ${cx + caretSize},${cy + caretSize * 1.5}`;
          return (
            <g aria-label={`You are here: ${highlightSeg.key} band`}>
              <polygon
                points={triPoints}
                fill={highlightSeg.color}
                opacity="0.9"
              />
              <text
                x={cx}
                y={cy + caretSize * 1.5 + 9}
                textAnchor="middle"
                fill={highlightSeg.color}
                fontSize="8.5"
                fontWeight="600"
                fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
              >
                you are here
              </text>
            </g>
          );
        })()}

        {/* Legend row (not compact) */}
        {!compact && segments.map((s, i) => {
          const lx = i * legendItemW;
          const rowY = legendY + caretRowH;
          return (
            <g key={`legend-${s.key}`}>
              {/* Color swatch */}
              <rect
                x={lx}
                y={rowY}
                width={10}
                height={10}
                fill={s.color}
                rx={2}
              />
              {/* Label text */}
              <text
                x={lx + 14}
                y={rowY + 9}
                fill="#b8c6de"
                fontSize="9.5"
                fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
              >
                {s.key} {s.range}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Caption — hidden in compact mode */}
      {!compact && (
        <figcaption className="text-[0.72rem] text-[rgba(148,163,184,0.55)] mt-1.5 text-right">
          {caption ?? CC_BY_CAPTION}
        </figcaption>
      )}
    </figure>
  );
}
