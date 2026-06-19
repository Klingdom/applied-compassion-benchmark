/**
 * ConsistencyStepChart — #16
 *
 * Descending step chart: σ (std dev across 8 dimension scores) → consistency factor %.
 * Annotated with the "balanced 70/70 beats spiky 90/40" example.
 *
 * Server component. Own-framework SVG. Accessibility: role="img" + aria-label + <title>.
 */

import { CC_BY_CAPTION } from "./chartTokens";

const ariaLabel =
  "Consistency factor step chart. Standard deviation at or below 1.5 gives 100% factor. Between 1.5 and 3.0 gives 75%. Between 3.0 and 5.0 gives 40%. Above 5.0 gives 10%. A balanced profile with std dev below 1.5 earns the full premium; a spiky profile loses most of it.";

// Steps: [label, factor%, color]
const STEPS: [string, number, string][] = [
  ["σ ≤ 1.5", 100, "#7dd3fc"],
  ["σ 1.5–3.0", 75, "#86efac"],
  ["σ 3.0–5.0", 40, "#fcd34d"],
  ["σ > 5.0", 10, "#fb923c"],
];

const VW = 480;
const VH = 130;
const LEFT_PAD = 52; // y-axis label space
const RIGHT_PAD = 12;
const TOP_PAD = 14;
const BOTTOM_PAD = 34;

const chartW = VW - LEFT_PAD - RIGHT_PAD;
const chartH = VH - TOP_PAD - BOTTOM_PAD;
const stepW = chartW / STEPS.length;

export default function ConsistencyStepChart({ caption }: { caption?: string }) {
  return (
    <figure className="w-full" aria-label={ariaLabel}>
      <svg
        role="img"
        aria-label={ariaLabel}
        viewBox={`0 0 ${VW} ${VH}`}
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: "block", width: "100%", height: "auto" }}
      >
        <title>Std-dev to consistency-factor step chart</title>

        {/* Y-axis guide lines at 25% intervals */}
        {[0, 25, 50, 75, 100].map((pct) => {
          const y = TOP_PAD + chartH - (pct / 100) * chartH;
          return (
            <g key={pct}>
              <line
                x1={LEFT_PAD}
                y1={y}
                x2={LEFT_PAD + chartW}
                y2={y}
                stroke="rgba(148,163,184,0.12)"
                strokeWidth="0.8"
              />
              <text
                x={LEFT_PAD - 5}
                y={y + 3.5}
                textAnchor="end"
                fill="rgba(148,163,184,0.45)"
                fontSize="7"
                fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
              >
                {pct}%
              </text>
            </g>
          );
        })}

        {/* Step bars */}
        {STEPS.map(([label, factor, color], i) => {
          const barH = (factor / 100) * chartH;
          const barX = LEFT_PAD + i * stepW + 4;
          const barY = TOP_PAD + chartH - barH;
          const barW = stepW - 8;
          const midX = LEFT_PAD + i * stepW + stepW / 2;

          return (
            <g key={label}>
              {/* Bar */}
              <rect
                x={barX}
                y={barY}
                width={barW}
                height={barH}
                rx={4}
                fill={color}
                fillOpacity="0.25"
                stroke={color}
                strokeOpacity="0.5"
                strokeWidth="1"
              />
              {/* Factor label inside / above bar */}
              <text
                x={midX}
                y={barY + (factor > 30 ? 14 : -5)}
                textAnchor="middle"
                fill={color}
                fontSize="9"
                fontWeight="700"
                fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
              >
                {factor}%
              </text>
              {/* X-axis label */}
              <text
                x={midX}
                y={TOP_PAD + chartH + 12}
                textAnchor="middle"
                fill="rgba(148,163,184,0.65)"
                fontSize="7.5"
                fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
              >
                {label}
              </text>
            </g>
          );
        })}

        {/* Step-down connector lines */}
        {STEPS.slice(0, -1).map(([, factor], i) => {
          const thisTopY = TOP_PAD + chartH - (factor / 100) * chartH;
          const nextFactor = STEPS[i + 1][1];
          const nextTopY = TOP_PAD + chartH - (nextFactor / 100) * chartH;
          const thisRight = LEFT_PAD + (i + 1) * stepW - 4;
          const nextLeft = LEFT_PAD + (i + 1) * stepW + 4;
          return (
            <g key={`step-${i}`}>
              {/* Horizontal step-down at the right edge of this bar */}
              <line
                x1={thisRight}
                y1={thisTopY}
                x2={nextLeft}
                y2={thisTopY}
                stroke="rgba(148,163,184,0.25)"
                strokeWidth="0.8"
                strokeDasharray="2,2"
              />
              <line
                x1={nextLeft}
                y1={thisTopY}
                x2={nextLeft}
                y2={nextTopY}
                stroke="rgba(148,163,184,0.25)"
                strokeWidth="0.8"
                strokeDasharray="2,2"
              />
            </g>
          );
        })}

        {/* Annotation: "balanced 70/70 beats spiky 90/40" */}
        <text
          x={LEFT_PAD + chartW / 2}
          y={VH - 6}
          textAnchor="middle"
          fill="rgba(148,163,184,0.55)"
          fontSize="7"
          fontStyle="italic"
          fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        >
          balanced 70/70 profile beats spiky 90/40 profile
        </text>
      </svg>

      <figcaption className="text-[0.72rem] text-[rgba(148,163,184,0.55)] mt-1 text-right">
        {caption ?? CC_BY_CAPTION}
      </figcaption>
    </figure>
  );
}
