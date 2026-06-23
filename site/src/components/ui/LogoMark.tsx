/**
 * LogoMark — "The Ascending Band Arc"
 *
 * Pure inline-SVG server component (no "use client", no hooks).
 * Five score-band segments rendered as a rising gauge, sweeping from
 * lower-left (Critical / red) to upper-right (Exemplary / cyan).
 *
 * Geometry (48×48 viewBox, scaled by `size`):
 *   Center: cx=24, cy=28
 *   Radius: 18
 *   Total sweep: 150° (CW in math / CCW in screen coords)
 *   Start angle: 210° (lower-left), end angle: 60° (upper-right)
 *   Each segment: ~27.2° active, ~3.5° gap between segments
 *
 * Angle convention: standard math (0°=right, CCW).
 * SVG point: (cx + r·cos(θ), cy − r·sin(θ)).
 * Arc direction: sweep-flag=0 (CCW in SVG screen = CW in math).
 *
 * Variants:
 *   "color"    — each segment uses its exact band hex (encoding-safe on any bg)
 *   "mono"     — all segments = currentColor (inherits text; forced-colors/print safe)
 *   "reversed" — currentColor (same; caller controls color via CSS)
 */

type LogoMarkProps = {
  size?: number;
  variant?: "color" | "mono" | "reversed";
  /** Number of arc segments. Default 5 (one per band). */
  segments?: number;
  /**
   * Stroke colors for each segment, low→high.
   * Defaults to the five band colors (Critical→Exemplary).
   * Ignored when variant is "mono" or "reversed".
   */
  colors?: string[];
};

// Band colors low→high (Critical→Exemplary), from dimensions.ts BANDS.
const BAND_COLORS = [
  "#f87171", // Critical
  "#fb923c", // Developing
  "#fcd34d", // Functional
  "#86efac", // Established
  "#7dd3fc", // Exemplary
];

// Convert polar (math angle in degrees) to SVG (x,y) coordinates.
// cx, cy = arc center in SVG; r = radius; angleDeg = math angle (0°=right, CCW).
function polarToSvg(angleDeg: number, r: number, cx: number, cy: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy - r * Math.sin(rad),
  };
}

// Build a single SVG arc path string (CCW in screen = sweep-flag 0).
// Assumes arc spans <180° so large-arc-flag = 0.
function arcPath(
  startAngle: number,
  endAngle: number,
  r: number,
  cx: number,
  cy: number
): string {
  const start = polarToSvg(startAngle, r, cx, cy);
  const end = polarToSvg(endAngle, r, cx, cy);
  return `M${start.x.toFixed(3)},${start.y.toFixed(3)} A${r},${r} 0 0 0 ${end.x.toFixed(3)},${end.y.toFixed(3)}`;
}

export default function LogoMark({
  size = 36,
  variant = "color",
  segments = 5,
  colors = BAND_COLORS,
}: LogoMarkProps) {
  const viewBoxSize = 48;
  const cx = 24;
  const cy = 28;
  const r = 18;

  // 150° total sweep from startAngle descending (CW in math) to endAngle.
  const totalSweep = 150;
  const startAngle = 210; // lower-left
  // Gap between segments in degrees (~3.5°). 4 gaps for 5 segments.
  const gapDeg = segments > 1 ? 3.5 : 0;
  const totalGaps = gapDeg * (segments - 1);
  const segSweep = (totalSweep - totalGaps) / segments;

  // Generate (startAngle, endAngle) for each segment.
  // We go CW in math = decreasing angle.
  const segmentAngles: Array<{ start: number; end: number }> = [];
  for (let i = 0; i < segments; i++) {
    const segStart = startAngle - i * (segSweep + gapDeg);
    const segEnd = segStart - segSweep;
    segmentAngles.push({ start: segStart, end: segEnd });
  }

  const isColor = variant === "color";
  const strokeForSegment = (i: number): string => {
    if (!isColor) return "currentColor";
    return colors[i] ?? BAND_COLORS[i] ?? "#7dd3fc";
  };

  // Stroke weight: thick enough to read at small sizes, comfortable at default.
  const strokeWidth = 5;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Compassion Benchmark"
      focusable="false"
    >
      {segmentAngles.map(({ start, end }, i) => (
        <path
          key={i}
          d={arcPath(start, end, r, cx, cy)}
          stroke={strokeForSegment(i)}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
        />
      ))}
    </svg>
  );
}
