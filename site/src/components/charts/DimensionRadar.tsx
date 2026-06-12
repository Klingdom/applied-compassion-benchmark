/**
 * DimensionRadar — Wave 3, Item #16
 *
 * Server component: renders an 8-axis spider/radar SVG polygon showing an
 * entity's profile shape across all compassion dimensions. Designed to
 * deliver the "what shape is this entity?" at a single glance.
 *
 * Props:
 *   scores        — Record<DimCode, number> (0–5 per dimension, the entity)
 *   overlay       — optional Record<DimCode, number> (0–5, cohort/field average)
 *   entityName    — displayed in aria-label and legend
 *   overlayLabel  — legend label for the overlay polygon, e.g. "Field average"
 *   caption       — optional caption override
 *
 * Design rules:
 *   - 8 axes in canonical DIMENSIONS order: AWR, EMP, ACT, EQU, BND, ACC, SYS, INT
 *   - Radial scale 0→5; concentric gridlines at 1/2/3/4/5
 *   - Entity polygon fill/stroke colored by composite band (Critical→Exemplary)
 *   - Overlay polygon: dashed, unfilled, muted — for peer comparison
 *   - Graceful: renders null when fewer than 8 dimension scores are present
 *   - Clamped: out-of-range values are clamped to 0–5
 *   - Honesty footnote: radar area can exaggerate differences
 *   - Accessibility: role="img" + aria-label + <title> enumerating all scores
 *   - Mobile: cap SVG width + responsive viewBox
 *
 * No charting dependency — hand-rolled inline SVG following the pattern of
 * BandDistributionBar and DimensionProfileBar.
 * Caption: "Source: Compassion Benchmark · CC-BY"
 */

import { DIMENSIONS } from "@/data/dimensions";

// ─── Types ────────────────────────────────────────────────────────────────────

/** The 8 canonical dimension codes, in order. */
type DimCode = "AWR" | "EMP" | "ACT" | "EQU" | "BND" | "ACC" | "SYS" | "INT";

export interface DimensionRadarProps {
  /** Entity dimension scores, 0–5 per dimension. */
  scores: Record<string, number>;
  /** Optional overlay polygon scores, 0–5 per dimension (e.g. field average). */
  overlay?: Record<string, number> | null;
  /** Entity name — used in aria-label and legend. */
  entityName?: string;
  /** Label for the overlay polygon (e.g. "Fortune 500 average"). */
  overlayLabel?: string;
  /** Caption override. Defaults to "Source: Compassion Benchmark · CC-BY". */
  caption?: string;
  /**
   * The entity's composite band string (e.g. "Functional", "Established").
   * When supplied, the polygon is colored by the TRUE composite band rather
   * than the dimension-average approximation. Case-insensitive.
   */
  band?: string;
}

// ─── Canonical dimension order ────────────────────────────────────────────────

/** The 8 dimension codes extracted from DIMENSIONS in canonical order. */
const DIM_CODES = DIMENSIONS.map((d) => d.code) as DimCode[];

// ─── Band color helpers ───────────────────────────────────────────────────────

/** Map a 0–5 composite dimension score set to a band string. */
function bandFromDimScores(scores: Record<string, number>): string {
  const values = DIM_CODES.map((c) => scores[c] ?? 0);
  if (values.length === 0) return "Critical";
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  // Convert 0–5 average to a 0–100-equivalent threshold for band assignment
  const scaled = avg * 20;
  if (scaled <= 20) return "Critical";
  if (scaled <= 40) return "Developing";
  if (scaled <= 60) return "Functional";
  if (scaled <= 80) return "Established";
  return "Exemplary";
}

/** Band → fill/stroke color. */
const BAND_COLORS: Record<string, string> = {
  Critical:    "#f87171",
  Developing:  "#fb923c",
  Functional:  "#fcd34d",
  Established: "#86efac",
  Exemplary:   "#7dd3fc",
};

// ─── Polar geometry helpers ───────────────────────────────────────────────────

/**
 * Convert a (radius, axis-index, total-axes, centerX, centerY, maxRadius)
 * to an {x, y} point.
 * Axis 0 starts at the top (12 o'clock) and proceeds clockwise.
 */
function polarPoint(
  r: number,
  axisIndex: number,
  totalAxes: number,
  cx: number,
  cy: number,
): { x: number; y: number } {
  // Angle: start at -π/2 (top), go clockwise
  const angle = (2 * Math.PI * axisIndex) / totalAxes - Math.PI / 2;
  return {
    x: cx + r * Math.cos(angle),
    y: cy + r * Math.sin(angle),
  };
}

/** Format an array of {x, y} points into an SVG points string. */
function pointsStr(pts: Array<{ x: number; y: number }>): string {
  return pts.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");
}

// ─── SVG layout constants ─────────────────────────────────────────────────────

/** ViewBox dimensions — square to keep the radar centered. */
const VB_SIZE = 340;
/** Center of the radar. */
const CX = 150;
const CY = 155;
/** Maximum radius (score = 5.0 maps here). */
const MAX_R = 110;
/** Radial scale maximum (i.e. 5.0). */
const SCALE_MAX = 5;
/** Number of gridline rings (at 1,2,3,4,5). */
const GRIDLINE_COUNT = SCALE_MAX; // 5
/** Label offset beyond the axis endpoint. */
const LABEL_OFFSET = 14;

// ─── Component ────────────────────────────────────────────────────────────────

export default function DimensionRadar({
  scores,
  overlay = null,
  entityName,
  overlayLabel,
  caption,
  band: bandProp,
}: DimensionRadarProps) {
  // ── Validate: require all 8 dimensions present ──────────────────────────
  const presentCodes = DIM_CODES.filter(
    (c) => typeof scores[c] === "number" && !isNaN(scores[c]),
  );
  if (presentCodes.length < 8) {
    // Graceful: render nothing when data is incomplete
    return null;
  }

  // ── Clamp scores to 0–5 ─────────────────────────────────────────────────
  const clampedScores: Record<string, number> = {};
  for (const c of DIM_CODES) {
    clampedScores[c] = Math.min(SCALE_MAX, Math.max(0, scores[c]));
  }

  // ── Clamp overlay if provided ───────────────────────────────────────────
  const hasOverlay =
    overlay !== null &&
    overlay !== undefined &&
    DIM_CODES.every((c) => typeof overlay[c] === "number" && !isNaN(overlay[c]));
  const clampedOverlay: Record<string, number> = {};
  if (hasOverlay && overlay) {
    for (const c of DIM_CODES) {
      clampedOverlay[c] = Math.min(SCALE_MAX, Math.max(0, overlay[c]));
    }
  }

  // ── Determine band + color ──────────────────────────────────────────────
  // Prefer the caller-supplied composite band (entity.band) for accuracy.
  // Fall back to dimension-average approximation when not supplied.
  const resolvedBand = bandProp
    ? bandProp.charAt(0).toUpperCase() + bandProp.slice(1).toLowerCase()
    : bandFromDimScores(clampedScores);
  const band = Object.prototype.hasOwnProperty.call(BAND_COLORS, resolvedBand)
    ? resolvedBand
    : bandFromDimScores(clampedScores);
  const bandColor = BAND_COLORS[band] ?? "#7dd3fc";

  // ── Build axis endpoint coordinates ────────────────────────────────────
  const axisEndpoints = DIM_CODES.map((_, i) =>
    polarPoint(MAX_R, i, DIM_CODES.length, CX, CY),
  );

  // ── Build entity polygon points ─────────────────────────────────────────
  const entityPoints = DIM_CODES.map((c, i) => {
    const r = (clampedScores[c] / SCALE_MAX) * MAX_R;
    return polarPoint(r, i, DIM_CODES.length, CX, CY);
  });

  // ── Build overlay polygon points ────────────────────────────────────────
  const overlayPoints = hasOverlay
    ? DIM_CODES.map((c, i) => {
        const r = (clampedOverlay[c] / SCALE_MAX) * MAX_R;
        return polarPoint(r, i, DIM_CODES.length, CX, CY);
      })
    : null;

  // ── Accessible label with all 8 scores ─────────────────────────────────
  const scoreList = DIM_CODES.map((c) => {
    const dim = DIMENSIONS.find((d) => d.code === c)!;
    return `${dim.name} ${clampedScores[c].toFixed(1)}`;
  }).join(", ");
  const overlayScoreList =
    hasOverlay && overlay
      ? DIM_CODES.map((c) => {
          const dim = DIMENSIONS.find((d) => d.code === c)!;
          return `${dim.name} ${clampedOverlay[c].toFixed(1)}`;
        }).join(", ")
      : null;
  const ariaLabel = [
    entityName ? `${entityName} — ` : "",
    `Dimension profile radar (${band} band): `,
    scoreList,
    overlayScoreList
      ? `. ${overlayLabel ?? "Field average"}: ${overlayScoreList}`
      : "",
    ".",
  ]
    .filter(Boolean)
    .join("");

  const titleText = entityName
    ? `${entityName} — compassion dimension profile radar`
    : "Compassion dimension profile radar";

  // ── Legend Y position ───────────────────────────────────────────────────
  // Legend sits below the radar circle at a fixed Y
  const LEGEND_Y = CY + MAX_R + 24;

  return (
    <figure className="w-full" aria-label={ariaLabel}>
      <svg
        role="img"
        viewBox={`0 0 ${VB_SIZE} ${VB_SIZE}`}
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: "block", width: "100%", height: "auto", maxWidth: "420px" }}
        aria-label={ariaLabel}
      >
        <title>{titleText}</title>

        {/* ── Concentric gridlines at scores 1–5 ──────────────────── */}
        {Array.from({ length: GRIDLINE_COUNT }, (_, i) => {
          const ringScore = i + 1; // 1,2,3,4,5
          const r = (ringScore / SCALE_MAX) * MAX_R;
          const ringPoints = DIM_CODES.map((_, ai) =>
            polarPoint(r, ai, DIM_CODES.length, CX, CY),
          );
          const isBandBoundary = ringScore % 1 === 0; // all are, but keep for clarity
          const isTopRing = ringScore === SCALE_MAX;
          return (
            <g key={ringScore}>
              <polygon
                points={pointsStr(ringPoints)}
                fill="none"
                stroke={
                  isTopRing
                    ? "rgba(255,255,255,0.12)"
                    : "rgba(255,255,255,0.06)"
                }
                strokeWidth={isTopRing ? 0.75 : 0.5}
              />
              {/* Gridline score label — shown on the rightmost spoke, small, muted */}
              {(() => {
                // Place score labels on the 0° axis (AWR — top) just inside the ring
                const labelPt = polarPoint(r, 0, DIM_CODES.length, CX, CY);
                return (
                  <text
                    x={labelPt.x + 3}
                    y={labelPt.y - 2}
                    fontSize="6.5"
                    fill="rgba(148,163,184,0.38)"
                    fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                    textAnchor="start"
                  >
                    {ringScore}
                  </text>
                );
              })()}
            </g>
          );
        })}

        {/* ── Axis spokes ─────────────────────────────────────────── */}
        {axisEndpoints.map((ep, i) => (
          <line
            key={DIM_CODES[i]}
            x1={CX}
            y1={CY}
            x2={ep.x}
            y2={ep.y}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={0.75}
          />
        ))}

        {/* ── Overlay polygon (field/cohort average) ──────────────── */}
        {overlayPoints && (
          <polygon
            points={pointsStr(overlayPoints)}
            fill="none"
            stroke="rgba(184,198,222,0.35)"
            strokeWidth={1.25}
            strokeDasharray="3 3"
          />
        )}

        {/* ── Entity polygon ───────────────────────────────────────── */}
        <polygon
          points={pointsStr(entityPoints)}
          fill={bandColor}
          fillOpacity={0.14}
          stroke={bandColor}
          strokeWidth={2}
          strokeOpacity={0.85}
          strokeLinejoin="round"
        />

        {/* ── Vertex dots on entity polygon ────────────────────────── */}
        {entityPoints.map((pt, i) => (
          <circle
            key={DIM_CODES[i]}
            cx={pt.x}
            cy={pt.y}
            r={2.5}
            fill={bandColor}
            fillOpacity={0.9}
          />
        ))}

        {/* ── Axis labels (dimension CODE at each vertex) ──────────── */}
        {axisEndpoints.map((ep, i) => {
          const dim = DIMENSIONS[i];
          // Determine text anchor based on horizontal position relative to center
          const dx = ep.x - CX;
          const dy = ep.y - CY;
          // Normalize to get label position beyond the endpoint
          const mag = Math.sqrt(dx * dx + dy * dy) || 1;
          const lx = ep.x + (dx / mag) * LABEL_OFFSET;
          const ly = ep.y + (dy / mag) * LABEL_OFFSET;

          // Text anchor: left of center → "end", right → "start", center → "middle"
          let anchor: "start" | "middle" | "end" = "middle";
          if (dx < -4) anchor = "end";
          else if (dx > 4) anchor = "start";

          // Vertical adjustment for labels at top/bottom
          // Move down slightly for top label, up for bottom label
          let dyAdj = 0;
          if (dy < -4) dyAdj = -2; // top — shift up a bit
          else if (dy > 4) dyAdj = 4; // bottom — shift down a bit
          else dyAdj = 4; // mid-row — align to middle

          return (
            <g key={dim.code}>
              {/* Invisible hitbox for tooltip accessibility */}
              <title>{`${dim.name}: ${clampedScores[dim.code].toFixed(1)}/5.0`}</title>
              {/* Dimension code label */}
              <text
                x={lx}
                y={ly + dyAdj}
                textAnchor={anchor}
                fontSize="9.5"
                fontWeight="700"
                fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                fill={dim.color}
              >
                {dim.code}
              </text>
              {/* Score value below the code label */}
              <text
                x={lx}
                y={ly + dyAdj + 10}
                textAnchor={anchor}
                fontSize="8"
                fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                fill="rgba(184,198,222,0.7)"
              >
                {clampedScores[dim.code].toFixed(1)}
              </text>
            </g>
          );
        })}

        {/* ── Legend ───────────────────────────────────────────────── */}
        {/* Entity legend item */}
        <g>
          {/* Solid line swatch */}
          <line
            x1={CX - 60}
            y1={LEGEND_Y}
            x2={CX - 44}
            y2={LEGEND_Y}
            stroke={bandColor}
            strokeWidth={2}
            strokeOpacity={0.85}
          />
          <circle cx={CX - 52} cy={LEGEND_Y} r={2} fill={bandColor} fillOpacity={0.9} />
          <text
            x={CX - 40}
            y={LEGEND_Y + 3.5}
            fontSize="8"
            fill="rgba(184,198,222,0.75)"
            fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
          >
            {entityName ?? "This entity"}
          </text>
        </g>
        {/* Overlay legend item (only when overlay provided) */}
        {hasOverlay && (
          <g>
            <line
              x1={CX + 6}
              y1={LEGEND_Y}
              x2={CX + 22}
              y2={LEGEND_Y}
              stroke="rgba(184,198,222,0.45)"
              strokeWidth={1.25}
              strokeDasharray="3 3"
            />
            <text
              x={CX + 26}
              y={LEGEND_Y + 3.5}
              fontSize="8"
              fill="rgba(184,198,222,0.55)"
              fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
            >
              {overlayLabel ?? "Field average"}
            </text>
          </g>
        )}
      </svg>

      {/* ── Honesty caveat + source caption ────────────────────────────── */}
      <figcaption className="text-[0.7rem] text-[rgba(148,163,184,0.5)] mt-1.5 space-y-0.5">
        <p>
          Note: radar area can visually exaggerate differences — read the per-axis values, not the area.
        </p>
        <p className="text-right">
          {caption ?? "Source: Compassion Benchmark · CC-BY"}
        </p>
      </figcaption>
    </figure>
  );
}
