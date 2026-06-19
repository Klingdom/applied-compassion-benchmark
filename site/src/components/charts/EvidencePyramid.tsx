/**
 * EvidencePyramid — #12
 *
 * Tapered 5-tier pyramid with weight bars and trust-gradient color.
 * Replaces the 6 equal-card grid for the evidence hierarchy section.
 *
 * Server component. Own-framework SVG. Accessibility: role="img" + aria-label + <title>.
 */

import { CC_BY_CAPTION } from "./chartTokens";

const ariaLabel =
  "Evidence hierarchy pyramid. Tier 1 at top (narrowest, highest trust): Independent external audit. Tier 2: Verifiable outcome data. Tier 3: Community testimony. Tier 4: Policy and process documents. Tier 5 at base (widest, lowest trust): Entity self-report. Evidence beats aspiration — where claims diverge from lived experience, the methodology scores the world as encountered.";

// Tiers from top (highest trust) to bottom (lowest trust)
const TIERS = [
  {
    tier: "Tier 1",
    title: "Independent external audit",
    desc: "Regulatory findings, third-party assessments, academic studies",
    weight: "Highest weight",
    color: "#7dd3fc",
  },
  {
    tier: "Tier 2",
    title: "Verifiable outcome data",
    desc: "Disaggregated service data, longitudinal surveys, resolution rates",
    weight: "High weight",
    color: "#86efac",
  },
  {
    tier: "Tier 3",
    title: "Community testimony",
    desc: "Affected populations, independent focus groups, structured interviews",
    weight: "High weight",
    color: "#fcd34d",
  },
  {
    tier: "Tier 4",
    title: "Policy and process documents",
    desc: "Governing documents, training records, budget allocations",
    weight: "Moderate weight",
    color: "#fb923c",
  },
  {
    tier: "Tier 5",
    title: "Entity self-report",
    desc: "Mission statements and annual reports — requires corroboration",
    weight: "Lowest weight",
    color: "#f87171",
  },
] as const;

const VW = 560;
const TIER_H = 44;
// Pyramid: top tier narrowest, bottom widest
const TOP_W = 120;
const BOTTOM_W = VW - 20; // nearly full width
const VH = TIERS.length * TIER_H + 32; // extra bottom for "evidence beats aspiration" note

export default function EvidencePyramid({ caption }: { caption?: string }) {
  const widthStep = (BOTTOM_W - TOP_W) / (TIERS.length - 1);

  return (
    <figure className="w-full" aria-label={ariaLabel}>
      <svg
        role="img"
        aria-label={ariaLabel}
        viewBox={`0 0 ${VW} ${VH}`}
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: "block", width: "100%", height: "auto" }}
      >
        <title>Evidence hierarchy pyramid — 5 tiers from highest to lowest trust</title>

        {TIERS.map((tier, i) => {
          const tierW = TOP_W + i * widthStep;
          const tierX = (VW - tierW) / 2;
          const tierY = i * TIER_H;
          const midX = VW / 2;
          const textY = tierY + TIER_H / 2;

          return (
            <g key={tier.tier}>
              {/* Tier trapezoid (as rect for simplicity) */}
              <rect
                x={tierX}
                y={tierY + 1}
                width={tierW}
                height={TIER_H - 2}
                rx={i === 0 ? 6 : i === TIERS.length - 1 ? 6 : 0}
                fill={tier.color}
                fillOpacity={0.12 + i * 0.02}
                stroke={tier.color}
                strokeOpacity={0.4}
                strokeWidth="1"
              />

              {/* Tier kicker */}
              <text
                x={midX - tierW / 2 + 8}
                y={textY - 4}
                fill={tier.color}
                fontSize="7.5"
                fontWeight="700"
                fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
              >
                {tier.tier} · {tier.weight}
              </text>

              {/* Tier title */}
              <text
                x={midX - tierW / 2 + 8}
                y={textY + 8}
                fill="rgba(184,198,222,0.9)"
                fontSize="8.5"
                fontWeight="600"
                fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
              >
                {tier.title}
              </text>

              {/* Weight bar — right side */}
              {(() => {
                const weightPcts = [100, 80, 80, 50, 20];
                const pct = weightPcts[i];
                const barMaxW = 60;
                const barW = (pct / 100) * barMaxW;
                const barX = tierX + tierW - barMaxW - 8;
                const barY2 = textY - 4;
                return (
                  <rect
                    x={barX + barMaxW - barW}
                    y={barY2}
                    width={barW}
                    height={6}
                    rx={3}
                    fill={tier.color}
                    fillOpacity="0.5"
                  />
                );
              })()}
            </g>
          );
        })}

        {/* "Evidence beats aspiration" footnote */}
        <text
          x={VW / 2}
          y={TIERS.length * TIER_H + 20}
          textAnchor="middle"
          fill="rgba(148,163,184,0.55)"
          fontSize="7.5"
          fontStyle="italic"
          fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        >
          Evidence beats aspiration — the methodology scores the world as encountered, not the story as presented.
        </text>
      </svg>

      <figcaption className="text-[0.72rem] text-[rgba(148,163,184,0.55)] mt-1.5 text-right">
        {caption ?? CC_BY_CAPTION}
      </figcaption>
    </figure>
  );
}
