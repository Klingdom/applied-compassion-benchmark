/**
 * IntegrationPremiumDiagram — S3.5 (M3)
 *
 * Server component: a "part-to-whole" stacked bar explaining the composite
 * score formula:
 *
 *   base (0–80) + integration premium (0–10) = composite (0–100)
 *
 * Shows three worked examples side-by-side:
 *   - Balanced/high (strong uniform profile → full premium)
 *   - Functional/typical (mid scores, some weak dims → reduced premium)
 *   - Spiky (one dimension strong, others weak → minimal premium)
 *
 * Annotates the consistency tiers from INTEGRATION_PREMIUM.detail.
 * Own-framework, own-data, CC-BY. No third-party imagery.
 *
 * Accessibility: role="img" + aria-label spelling out base, premium, composite.
 */

import { CC_BY_CAPTION } from "./chartTokens";

// ─── Worked examples ──────────────────────────────────────────────────────────

const EXAMPLES = [
  {
    label: "Balanced high",
    desc: "All 8 dims at 4+ → σ≤1.5",
    base: 75,
    premium: 10,
    composite: 85,
    premiumColor: "#7dd3fc",
    note: "Full premium",
  },
  {
    label: "Typical",
    desc: "Mixed profile, some dims < 4 → σ≈2",
    base: 50,
    premium: 3,
    composite: 53,
    premiumColor: "#86efac",
    note: "Reduced premium",
  },
  {
    label: "Spiky",
    desc: "One dim strong, others weak → σ>3",
    base: 30,
    premium: 0.5,
    composite: 30.5,
    premiumColor: "#fb923c",
    note: "Minimal premium",
  },
] as const;

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
            Base (0–80 from 8 dimension averages)
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
          <span>σ ≤ 1.5 → 100%</span>
          <span>σ 1.5–3.0 → 75%</span>
          <span>σ 3.0–5.0 → 40%</span>
          <span>σ &gt; 5.0 → 10%</span>
        </div>
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
