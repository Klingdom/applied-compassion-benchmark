/**
 * ConsistencyStepChart — #16
 *
 * Descending step chart: σ (std dev across 8 dimension scores) → consistency factor %.
 *
 * With 8 dimensions each bounded 0–5, σ cannot exceed 2.5 (MAX_ACHIEVABLE_STD_DEV
 * in consistencyStepsData.ts), so the formula's bottom two steps (σ 3.0–5.0 and
 * σ > 5.0) can never fire against a real profile. Both steps are still shown
 * (data unchanged from the published formula) but visually and textually marked
 * unreachable, rather than deleted, so a reader who remembers the old chart can
 * see what changed. See test-method-claims.mjs for the mechanical check.
 *
 * Server component. Own-framework SVG. Accessibility: role="img" + aria-label + <title>.
 */

import { CC_BY_CAPTION } from "./chartTokens";
import { STEPS, MAX_ACHIEVABLE_STD_DEV } from "./consistencyStepsData";

const ariaLabel =
  "Consistency factor step chart. Standard deviation at or below 1.5 gives 100% factor. Between 1.5 and 3.0 gives 75%. The formula also defines 40% for 3.0 to 5.0, and 10% above 5.0, but with 8 dimensions each bounded 0 to 5, standard deviation cannot exceed 2.5, so those two lower steps never occur in practice — only the 100% and 75% steps are reachable. The premium rewards dimensions scoring at or above 4.0; it does not reward evenness on its own, so a spiky profile can still out-score a balanced one.";

const VW = 480;
const VH = 142;
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

        {/* Diagonal-hatch pattern used to mark unreachable steps */}
        <defs>
          <pattern id="unreachable-hatch" width="5" height="5" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="5" stroke="rgba(148,163,184,0.5)" strokeWidth="1.5" />
          </pattern>
        </defs>

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
        {STEPS.map((step, i) => {
          const { label, factor, color, reachable } = step;
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
                fill={reachable ? color : "url(#unreachable-hatch)"}
                fillOpacity={reachable ? 0.25 : 0.5}
                stroke={color}
                strokeOpacity={reachable ? 0.5 : 0.3}
                strokeWidth="1"
                strokeDasharray={reachable ? undefined : "3,2"}
              />
              {/* Factor label inside / above bar */}
              <text
                x={midX}
                y={barY + (factor > 30 ? 14 : -5)}
                textAnchor="middle"
                fill={reachable ? color : "rgba(148,163,184,0.65)"}
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
              {!reachable && (
                <text
                  x={midX}
                  y={TOP_PAD + chartH + 21}
                  textAnchor="middle"
                  fill="rgba(148,163,184,0.5)"
                  fontSize="6.5"
                  fontStyle="italic"
                  fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                >
                  never occurs
                </text>
              )}
            </g>
          );
        })}

        {/* Step-down connector lines */}
        {STEPS.slice(0, -1).map((step, i) => {
          const thisTopY = TOP_PAD + chartH - (step.factor / 100) * chartH;
          const nextFactor = STEPS[i + 1].factor;
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

        {/* Annotation: unreachability + what the premium actually rewards */}
        <text
          x={LEFT_PAD + chartW / 2}
          y={VH - 20}
          textAnchor="middle"
          fill="rgba(148,163,184,0.55)"
          fontSize="7"
          fontStyle="italic"
          fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        >
          {`8 dims bounded 0–5 → σ can't exceed ${MAX_ACHIEVABLE_STD_DEV}; only the first two steps ever occur`}
        </text>
        <text
          x={LEFT_PAD + chartW / 2}
          y={VH - 8}
          textAnchor="middle"
          fill="rgba(148,163,184,0.55)"
          fontSize="7"
          fontStyle="italic"
          fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        >
          rewards dims ≥4.0, not evenness alone — a spiky profile can still win
        </text>
      </svg>

      <figcaption className="text-[0.72rem] text-[rgba(148,163,184,0.55)] mt-1 text-right">
        {caption ?? CC_BY_CAPTION}
      </figcaption>
    </figure>
  );
}
