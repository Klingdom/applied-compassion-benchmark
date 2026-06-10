/**
 * ScoreSparkline — Wave C, Item #3
 *
 * Server component: renders an inline SVG sparkline from a slug's
 * site/public/data/history/<slug>.json events[].newComposite over time.
 *
 * - No client JS, no charting dependency.
 * - Band-boundary gridlines at 20 / 40 / 60 / 80.
 * - Band-crossing events marked as a larger dot.
 * - Accessible: role="img" + <title> + aria-label.
 * - Gracefully degrades when <2 scored events or no history file.
 *
 * Build-time read pattern from data/history/index.ts (getEntityHistory).
 */

import { getEntityHistory } from "@/data/history";
import type { HistoryEvent } from "@/types/entity-history";

// ─── Constants ───────────────────────────────────────────────────────────────

const W = 200;      // viewBox width
const H = 52;       // viewBox height
const PAD = { top: 6, right: 6, bottom: 6, left: 6 } as const;

/** Score range (0–100) mapped to Y-axis. */
const SCORE_MIN = 0;
const SCORE_MAX = 100;

/** Band boundaries for gridlines */
const BAND_BOUNDARIES = [20, 40, 60, 80] as const;

/** Colors from globals.css @theme tokens */
const COLOR_NEUTRAL = "#94a3b8";
const COLOR_UP = "#34d399";
const COLOR_DOWN = "#fb923c";
const COLOR_GRID = "rgba(255,255,255,0.07)";
const COLOR_POINT = "rgba(255,255,255,0.55)";
const COLOR_CROSSING = "#fcd34d"; // band-yellow for crossings

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toY(score: number): number {
  const plotH = H - PAD.top - PAD.bottom;
  // Invert: higher score → lower y value
  return PAD.top + plotH * (1 - (score - SCORE_MIN) / (SCORE_MAX - SCORE_MIN));
}

function toX(index: number, total: number): number {
  if (total <= 1) return (W - PAD.left - PAD.right) / 2 + PAD.left;
  const plotW = W - PAD.left - PAD.right;
  return PAD.left + (index / (total - 1)) * plotW;
}

/** Determine trajectory color from first to last scored point. */
function trajectoryColor(points: number[]): string {
  if (points.length < 2) return COLOR_NEUTRAL;
  const diff = points[points.length - 1] - points[0];
  if (diff > 0.5) return COLOR_UP;
  if (diff < -0.5) return COLOR_DOWN;
  return COLOR_NEUTRAL;
}

/** Summarize the trajectory for the accessible label. */
function trajectoryLabel(points: { date: string; score: number }[]): string {
  if (points.length === 0) return "no data";
  if (points.length === 1) return `single reading: ${points[0].score} on ${points[0].date}`;
  const first = points[0];
  const last = points[points.length - 1];
  const diff = last.score - first.score;
  const direction = diff > 0.5 ? "up" : diff < -0.5 ? "down" : "stable";
  return `${direction} from ${first.score} (${first.date}) to ${last.score} (${last.date})`;
}

// ─── Component ───────────────────────────────────────────────────────────────

interface Props {
  /** Entity slug — used to load history JSON at build time. */
  slug: string;
  /** Optional label for the accessible <title>. Defaults to slug. */
  entityName?: string;
  /** If true, renders at half size (for inline use in score cards). */
  compact?: boolean;
}

export default function ScoreSparkline({ slug, entityName, compact = false }: Props) {
  if (!slug) return null;

  const history = getEntityHistory(slug);
  if (!history) return null;

  // Filter to events with a non-null newComposite, dedupe by date+score,
  // sort chronologically. Use type "scored" events only to avoid plotting
  // boundary-watch duplicates.
  const rawEvents: HistoryEvent[] = history.events ?? [];
  const scored = rawEvents
    .filter((e) => e.newComposite !== null && e.type === "scored")
    .sort((a, b) => a.date.localeCompare(b.date));

  // Graceful: <2 scored events → render nothing (or single dot via single-point path)
  if (scored.length === 0) return null;

  const points = scored.map((e) => ({
    date: e.date,
    score: e.newComposite as number,
    band: e.newBand ?? null,
  }));

  // Detect band crossings: consecutive events where newBand changes
  const crossingIndices = new Set<number>();
  for (let i = 1; i < points.length; i++) {
    if (points[i].band && points[i - 1].band && points[i].band !== points[i - 1].band) {
      crossingIndices.add(i);
    }
  }

  const scoreValues = points.map((p) => p.score);
  const lineColor = trajectoryColor(scoreValues);
  const label = trajectoryLabel(points.map((p) => ({ date: p.date, score: p.score })));
  const displayName = entityName ?? slug;

  // Build polyline points string
  const polylinePoints = points.length >= 2
    ? points.map((p, i) => `${toX(i, points.length)},${toY(p.score)}`).join(" ")
    : null;

  // Single-point case: just render a dot
  const isSinglePoint = points.length === 1;

  // Scale for compact mode
  const scaleW = compact ? 120 : W;
  const scaleH = compact ? 32 : H;

  return (
    <svg
      role="img"
      aria-label={`Score trajectory for ${displayName}: ${label}`}
      viewBox={`0 0 ${W} ${H}`}
      width={scaleW}
      height={scaleH}
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block", overflow: "visible" }}
    >
      <title>{`${displayName} score trajectory: ${label}`}</title>

      {/* Band boundary gridlines at 20/40/60/80 */}
      {BAND_BOUNDARIES.map((boundary) => {
        const y = toY(boundary);
        return (
          <line
            key={boundary}
            x1={PAD.left}
            y1={y}
            x2={W - PAD.right}
            y2={y}
            stroke={COLOR_GRID}
            strokeWidth="1"
            strokeDasharray="2 3"
          />
        );
      })}

      {/* Score polyline (only when 2+ points) */}
      {polylinePoints && (
        <polyline
          points={polylinePoints}
          fill="none"
          stroke={lineColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.9"
        />
      )}

      {/* Data points */}
      {points.map((p, i) => {
        const cx = toX(i, points.length);
        const cy = toY(p.score);
        const isCrossing = crossingIndices.has(i);
        const isLast = i === points.length - 1;
        const r = isCrossing ? 3.5 : isLast ? 3 : 2;
        const fill = isCrossing ? COLOR_CROSSING : isLast ? lineColor : COLOR_POINT;
        return (
          <circle
            key={`${p.date}-${i}`}
            cx={cx}
            cy={cy}
            r={r}
            fill={fill}
            opacity={isCrossing || isLast ? 1 : 0.7}
          />
        );
      })}

      {/* Single-point fallback dot */}
      {isSinglePoint && (
        <circle
          cx={toX(0, 1)}
          cy={toY(points[0].score)}
          r={4}
          fill={lineColor}
          opacity={0.9}
        />
      )}
    </svg>
  );
}
