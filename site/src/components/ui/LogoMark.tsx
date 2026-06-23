/**
 * LogoMark — "The Calibrated Arc"
 *
 * Pure inline-SVG server component (no "use client", no hooks).
 * A graduated arc (measurement/scale) that is simultaneously an open,
 * upward, palm-up form (regard/attentiveness), with a pivot dot at center.
 *
 * Geometry (36×36 viewBox, scaled by `size`):
 *   Arc:  M4,22 A14,14 0 0 1 32,22  — upward-open semicircle, stroke-width 2.5
 *   Ticks: 7 radial ticks inward from the arc at 0/30/60/90/120/150/180°
 *          90° (top-center) is longer (6px vs 3px) as the scale midpoint.
 *   Pivot: circle cx=18 cy=22 r=2.5, filled.
 *
 * Variants:
 *   "color"    — linear gradient brand-tint → brand (blue-300 → blue-500)
 *   "mono"     — currentColor (inherits text color; forced-colors safe)
 *   "reversed" — currentColor (same; caller sets a light text color)
 */

type LogoMarkProps = {
  size?: number;
  variant?: "color" | "mono" | "reversed";
  /**
   * When true (default), returns the <svg> mark only.
   * The consumer is responsible for the wordmark text.
   */
  markOnly?: boolean;
};

// Compute the (x1,y1) → (x2,y2) endpoints for a radial tick at `angleDeg`
// degrees. The arc center is (18, 22), radius 14. Ticks point inward.
// `outerR` = start on the arc, `innerR` = end toward center.
function tickCoords(
  angleDeg: number,
  outerR: number,
  innerR: number,
  cx: number,
  cy: number
) {
  // 0° = right end of arc (3 o'clock). We offset by 180° because the arc
  // goes from (4,22) on the left to (32,22) on the right, and 0° in our
  // domain means left-end (180° in trig convention on the unit circle).
  // Arc spans 180° from left (180°) to right (0°) across the top.
  // angleDeg 0 = left end, 90 = top, 180 = right end.
  const radTrig = ((180 - angleDeg) * Math.PI) / 180;
  const x1 = cx + outerR * Math.cos(radTrig);
  const y1 = cy - outerR * Math.sin(radTrig);
  const x2 = cx + innerR * Math.cos(radTrig);
  const y2 = cy - innerR * Math.sin(radTrig);
  return { x1, y1, x2, y2 };
}

export default function LogoMark({
  size = 36,
  variant = "color",
  markOnly = true,
}: LogoMarkProps) {
  const viewBox = "0 0 36 36";
  const cx = 18;
  const cy = 22;
  const arcR = 14;

  // Tick angles: 0° = left end of arc, 90° = top-center, 180° = right end
  const tickAngles = [0, 30, 60, 90, 120, 150, 180];
  // Standard ticks are 3px, the midpoint (90°) is 6px
  const shortInner = arcR - 3;
  const longInner = arcR - 6;

  // Unique gradient id — avoids SVG collision when multiple instances render
  // (e.g. navbar + footer on the same page).
  const gradId = `cb-logo-grad-${size}`;

  const isColor = variant === "color";
  // For "color" variant: reference gradient. For mono/reversed: currentColor.
  const strokeColor = isColor ? `url(#${gradId})` : "currentColor";
  const fillColor = isColor ? `url(#${gradId})` : "currentColor";

  return (
    <svg
      width={size}
      height={size}
      viewBox={viewBox}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Compassion Benchmark"
      focusable="false"
    >
      {isColor && (
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
            {/* brand-tint (#93c5fd) at left, brand (#3b82f6) at right */}
            <stop offset="0%" stopColor="#93c5fd" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
      )}

      {/* The arc: upward-open semicircle, M4,22 A14,14 0 0 1 32,22 */}
      <path
        d="M4,22 A14,14 0 0 1 32,22"
        stroke={strokeColor}
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* 7 radial tick marks inward from the arc */}
      {tickAngles.map((angleDeg) => {
        const isMidpoint = angleDeg === 90;
        const innerR = isMidpoint ? longInner : shortInner;
        const { x1, y1, x2, y2 } = tickCoords(angleDeg, arcR, innerR, cx, cy);
        return (
          <line
            key={angleDeg}
            x1={x1.toFixed(3)}
            y1={y1.toFixed(3)}
            x2={x2.toFixed(3)}
            y2={y2.toFixed(3)}
            stroke={strokeColor}
            strokeWidth={isMidpoint ? "2" : "1.5"}
            strokeLinecap="round"
          />
        );
      })}

      {/* Pivot dot at center of the arc */}
      <circle cx={cx} cy={cy} r="2.5" fill={fillColor} />
    </svg>
  );
}
