/**
 * DimensionProfileBar — Wave H2, Item #9
 *
 * Server component: renders 8 horizontal band-colored bars, one per dimension
 * (AWR, EMP, ACT, EQU, BND, ACC, SYS, INT), given a scores object keyed by
 * dimension code (0–100 per dimension).
 *
 * Optional delta overlay: if `before` scores are supplied, each bar shows a
 * ghost segment indicating the prior score alongside the current score, so
 * a viewer can see movement at a glance.
 *
 * Designed to sit inside a <details> element:
 *   - Closed: 0 effective height (the <details> collapses it).
 *   - Open: SVG scales to full width via width:100%/height:auto.
 *
 * No client JS, no charting dependency — hand-rolled inline SVG following
 * BandDistributionBar / ScoreSparkline pattern.
 *
 * Accessibility: role="img" + <title> + aria-label.
 * Caption: "Source: Compassion Benchmark · CC-BY"
 *
 * Integration deferred to Wave H3 — this wave builds the primitive only.
 */

import { DIMENSIONS } from "@/data/dimensions";
import { getBandColor as bandColor, CC_BY_CAPTION } from "./chartTokens";

// ─── Types ────────────────────────────────────────────────────────────────────

/** 0–100 score for each of the 8 dimensions. All fields optional for safety. */
export type DimensionScores = Partial<Record<
  "AWR" | "EMP" | "ACT" | "EQU" | "BND" | "ACC" | "SYS" | "INT",
  number
>>;

export interface DimensionProfileBarProps {
  /** Current scores for each dimension (0–100). */
  scores: DimensionScores;
  /** Optional prior-period scores for delta overlay (0–100). */
  before?: DimensionScores;
  /** Optional caption override. */
  caption?: string;
  /** Entity name for accessible label. */
  entityName?: string;
}

// ─── SVG layout constants ─────────────────────────────────────────────────────

/** Total viewBox width */
const VB_W = 600;
/** Height of a single bar row (bar + gap) */
const ROW_H = 26;
/** Vertical gap between rows */
const ROW_GAP = 8;
/** Width reserved on the left for dimension labels */
const LABEL_W = 46;
/** Width reserved on the right for score text */
const SCORE_W = 36;
/** Horizontal padding at edges */
const PAD_X = 6;
/** Usable bar area width */
const BAR_AREA_W = VB_W - LABEL_W - SCORE_W - PAD_X * 2;
/** Bar height */
const BAR_H = 16;
/** Bar y-offset within each row (centres the bar vertically) */
const BAR_Y_OFFSET = (ROW_H - BAR_H) / 2;
/** Ghost bar (delta) opacity */
const GHOST_OPACITY = 0.22;
/** Number of dimensions */
const DIM_COUNT = DIMENSIONS.length; // 8
/** Total SVG height */
const SVG_H = DIM_COUNT * ROW_H + (DIM_COUNT - 1) * ROW_GAP;

// ─── Component ────────────────────────────────────────────────────────────────

export default function DimensionProfileBar({
  scores,
  before,
  caption,
  entityName,
}: DimensionProfileBarProps) {
  // Resolve scores; any missing dimension defaults to 0
  const resolved = DIMENSIONS.map((dim) => {
    const code = dim.code as keyof DimensionScores;
    const current = typeof scores[code] === "number" ? (scores[code] as number) : 0;
    const prior = before && typeof before[code] === "number" ? (before[code] as number) : null;
    return { dim, current, prior };
  });

  // Accessible label summarising all dimensions
  const ariaLabel = [
    entityName ? `${entityName} —` : "",
    "Dimension profile:",
    resolved
      .map(({ dim, current }) => `${dim.code} ${dim.name}: ${current}`)
      .join(", "),
  ]
    .filter(Boolean)
    .join(" ");

  const titleText = entityName
    ? `${entityName} — compassion dimension profile`
    : "Compassion dimension profile";

  return (
    <figure className="w-full" aria-label={ariaLabel}>
      <svg
        role="img"
        viewBox={`0 0 ${VB_W} ${SVG_H}`}
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: "block", width: "100%", height: "auto" }}
        aria-label={ariaLabel}
      >
        <title>{titleText}</title>

        {resolved.map(({ dim, current, prior }, i) => {
          const rowY = i * (ROW_H + ROW_GAP);
          const barY = rowY + BAR_Y_OFFSET;
          const barX = PAD_X + LABEL_W;
          const currentW = (current / 100) * BAR_AREA_W;
          const color = bandColor(current);

          // Determine if this is a delta row
          const hasDelta = prior !== null;
          const priorW = hasDelta ? ((prior as number) / 100) * BAR_AREA_W : 0;

          return (
            <g key={dim.code}>
              {/* SVG <title> for per-dimension screen-reader / tooltip accessibility */}
              <title>{`${dim.code} ${dim.name}: ${current}/100 — ${dim.desc}`}</title>
              {/* Dimension code label */}
              <text
                x={PAD_X + LABEL_W - 6}
                y={rowY + ROW_H / 2 + 4}
                textAnchor="end"
                fill={dim.color}
                fontSize="10.5"
                fontWeight="700"
                fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
              >
                {dim.code}
              </text>

              {/* Bar track background */}
              <rect
                x={barX}
                y={barY}
                width={BAR_AREA_W}
                height={BAR_H}
                fill="rgba(255,255,255,0.04)"
                rx={4}
                ry={4}
              />

              {/* Ghost / delta bar (prior period) */}
              {hasDelta && priorW > 0 && (
                <rect
                  x={barX}
                  y={barY}
                  width={priorW}
                  height={BAR_H}
                  fill={bandColor(prior as number)}
                  opacity={GHOST_OPACITY}
                  rx={4}
                  ry={4}
                />
              )}

              {/* Current score bar */}
              {currentW > 0 && (
                <rect
                  x={barX}
                  y={barY}
                  width={currentW}
                  height={BAR_H}
                  fill={color}
                  opacity="0.85"
                  rx={4}
                  ry={4}
                />
              )}

              {/* Score label on the right */}
              <text
                x={barX + BAR_AREA_W + 6}
                y={rowY + ROW_H / 2 + 4}
                textAnchor="start"
                fill={color}
                fontSize="10"
                fontWeight="700"
                fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
              >
                {current}
              </text>

              {/* Delta indicator (+/−) when before scores present */}
              {hasDelta && prior !== null && (
                <text
                  x={barX + BAR_AREA_W + 6}
                  y={rowY + ROW_H / 2 + 14}
                  textAnchor="start"
                  fill={
                    current > prior
                      ? "#34d399"
                      : current < prior
                      ? "#fb923c"
                      : "rgba(184,198,222,0.45)"
                  }
                  fontSize="8"
                  fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                >
                  {current > prior
                    ? `+${(current - prior).toFixed(1)}`
                    : current < prior
                    ? `−${(prior - current).toFixed(1)}`
                    : "—"}
                </text>
              )}
            </g>
          );
        })}

        {/* Band boundary gridlines at 20/40/60/80 across the full chart */}
        {[20, 40, 60, 80].map((tick) => {
          const x = PAD_X + LABEL_W + (tick / 100) * BAR_AREA_W;
          return (
            <line
              key={tick}
              x1={x}
              y1={0}
              x2={x}
              y2={SVG_H}
              stroke="rgba(255,255,255,0.07)"
              strokeWidth="1"
              strokeDasharray="2 4"
            />
          );
        })}
      </svg>

      {/* Caption */}
      <figcaption className="text-[0.72rem] text-[rgba(148,163,184,0.55)] mt-1.5 text-right">
        {caption ?? CC_BY_CAPTION}
      </figcaption>
    </figure>
  );
}
