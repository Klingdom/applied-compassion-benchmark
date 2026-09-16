/**
 * IntegrationPremiumDiagram — S3.5 (M3)
 *
 * Server component: a "part-to-whole" stacked bar explaining the composite
 * score formula:
 *
 *   base composite (0–100) + integration premium (0–10) = composite (0–100)
 *
 * Shows three worked examples side-by-side, all recomputed from concrete
 * 8-dimension profiles against computeCompositeFromDimensions
 * (see integrationPremiumExamples.ts):
 *   - Balanced high (all 8 dims at 4.0 → full premium)
 *   - Typical (5 dims at 4.5, 3 dims at 0.5 → reduced premium)
 *   - Half-and-half (4 dims at 4.0, 4 dims at 0.4 → minimal premium)
 *
 * The premium rewards dimensions clearing the 4.0 threshold, not evenness on
 * its own — a spiky profile can out-earn a balanced one if it keeps more
 * dimensions ≥4.0. These three examples do not claim otherwise; see
 * ConsistencyStepChart and /methodology for the general claim and its limits.
 *
 * Annotates the consistency tiers from consistencyStepsData.ts.
 * Own-framework, own-data, CC-BY. No third-party imagery.
 *
 * Accessibility: role="img" + aria-label spelling out base, premium, composite.
 */

import { CC_BY_CAPTION } from "./chartTokens";
import { EXAMPLES } from "./integrationPremiumExamples";
import { STEPS, MAX_ACHIEVABLE_STD_DEV } from "./consistencyStepsData";

// ─── SVG layout ───────────────────────────────────────────────────────────────

const VB_W = 560;
const COL_W = (VB_W - 20) / EXAMPLES.length;
const BAR_W = COL_W - 24;
const MAX_H = 120; // height for composite=100
const BASE_COLOR = "#64748b";
const LABEL_Y = MAX_H + 30;
const SVG_H = MAX_H + 100;

export default function IntegrationPremiumDiagram({ caption }: { caption?: string }) {
  const ariaLabel = [
    "Integration premium formula diagram.",
    "Three examples showing base score plus integration premium equals composite:",
    EXAMPLES.map(
      (e) => `${e.label}: base ${e.base} + premium ${e.premium} = composite ${e.composite} (${e.note})`
    ).join("; "),
    ".",
  ].join(" ");

  return (
    <figure className="w-full" aria-label={ariaLabel}>
      <svg
        role="img"
        aria-label={ariaLabel}
        viewBox={`0 0 ${VB_W} ${SVG_H}`}
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: "block", width: "100%", height: "auto" }}
      >
        <title>Integration premium formula — base + premium = composite</title>

        {EXAMPLES.map((ex, i) => {
          const colX = 10 + i * COL_W;
          const barX = colX + (COL_W - BAR_W) / 2;

          // Heights proportional to composite
          const baseH = (ex.base / 100) * MAX_H;
          const premiumH = (ex.premium / 100) * MAX_H;
          const totalH = baseH + premiumH;
          const baseY = MAX_H - baseH;
          const premiumY = baseY - premiumH;

          return (
            <g key={ex.label}>
              {/* Base bar */}
              <rect
                x={barX}
                y={baseY}
                width={BAR_W}
                height={baseH}
                fill={BASE_COLOR}
                opacity={0.7}
                rx={4}
              />

              {/* Premium bar on top */}
              {ex.premium > 0 && (
                <rect
                  x={barX}
                  y={premiumY}
                  width={BAR_W}
                  height={premiumH + 2}
                  fill={ex.premiumColor}
                  opacity={0.85}
                  rx={4}
                />
              )}

              {/* Composite value at top */}
              <text
                x={barX + BAR_W / 2}
                y={premiumY - 6}
                textAnchor="middle"
                fill="rgba(184,198,222,0.9)"
                fontSize="13"
                fontWeight="800"
                fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
              >
                {ex.composite}
              </text>

              {/* "base" label inside base bar */}
              {baseH > 20 && (
                <text
                  x={barX + BAR_W / 2}
                  y={baseY + baseH / 2 + 4}
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.55)"
                  fontSize="9"
                  fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                >
                  base {ex.base}
                </text>
              )}

              {/* "+premium" label inside premium bar */}
              {premiumH > 8 && (
                <text
                  x={barX + BAR_W / 2}
                  y={premiumY + premiumH / 2 + 4}
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.75)"
                  fontSize="8.5"
                  fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                >
                  +{ex.premium}
                </text>
              )}

              {/* Example label */}
              <text
                x={barX + BAR_W / 2}
                y={LABEL_Y}
                textAnchor="middle"
                fill="rgba(184,198,222,0.85)"
                fontSize="9.5"
                fontWeight="700"
                fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
              >
                {ex.label}
              </text>

              {/* Description */}
              <text
                x={barX + BAR_W / 2}
                y={LABEL_Y + 13}
                textAnchor="middle"
                fill="rgba(148,163,184,0.55)"
                fontSize="8"
                fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
              >
                {ex.desc}
              </text>

              {/* Note */}
              <text
                x={barX + BAR_W / 2}
                y={LABEL_Y + 26}
                textAnchor="middle"
                fill={ex.premiumColor}
                fontSize="8.5"
                fontWeight="600"
                fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
              >
                {ex.note}
              </text>
            </g>
          );
        })}

        {/* Legend */}
        <g>
          <rect x={10} y={SVG_H - 16} width={12} height={8} fill={BASE_COLOR} opacity={0.7} rx={2} />
          <text x={26} y={SVG_H - 9} fill="rgba(148,163,184,0.55)" fontSize="8.5" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif">
            Base composite (0–100 from 8 dimension averages)
          </text>
          <rect x={230} y={SVG_H - 16} width={12} height={8} fill="#86efac" opacity={0.85} rx={2} />
          <text x={246} y={SVG_H - 9} fill="rgba(148,163,184,0.55)" fontSize="8.5" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif">
            Integration premium (0–10)
          </text>
        </g>
      </svg>

      {/* Consistency tier table */}
      <div className="mt-3 text-[0.78rem] text-muted space-y-0.5 border-t border-line pt-2">
        <p className="font-semibold text-text text-[0.8rem] mb-1">Consistency factor (σ = std dev across 8 dimension scores):</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-0.5">
          {STEPS.map((step) => (
            <span key={step.label} className={step.reachable ? undefined : "opacity-50 line-through decoration-1"}>
              {step.label} → {step.factor}%
              {!step.reachable && <span className="not-italic"> †</span>}
            </span>
          ))}
        </div>
        <p className="mt-1 text-[0.75rem]">
          † Not reachable: with 8 dimensions bounded 0–5, σ cannot exceed {MAX_ACHIEVABLE_STD_DEV}, so this step never fires.
        </p>
        <p className="mt-1 text-[0.75rem]">
          Weakness penalty: −20% per dimension below 4.0 · Harm override: any dimension at 0 sets premium to 0.
        </p>
      </div>

      <figcaption className="text-[0.72rem] text-[rgba(148,163,184,0.55)] mt-1.5 text-right">
        {caption ?? CC_BY_CAPTION}
      </figcaption>
    </figure>
  );
}
