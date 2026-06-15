/**
 * AnchorLadder — S3.5 (M2)
 *
 * Server component: a visual 0–5 anchor ladder showing the six behavioral
 * anchor levels for the benchmark scoring rubric.
 *
 * Renders as a vertical stack of colored band segments, each labeled with
 * the anchor name and one-line meaning.
 *
 * Own-data, own-framework. CC-BY. No third-party imagery.
 *
 * Accessibility: role="img" + aria-label enumerating all 6 anchors.
 */

import { CC_BY_CAPTION } from "./chartTokens";

const ANCHORS = [
  { score: 5, label: "Exemplary",      color: "#7dd3fc", meaning: "Outstanding independently verified performance sustained under pressure." },
  { score: 4, label: "Established",    color: "#86efac", meaning: "Consistent operational capacity; community confirms positive experience." },
  { score: 3, label: "Developing",     color: "#fcd34d", meaning: "Good-faith capacity in some cases, but inconsistent or incomplete." },
  { score: 2, label: "Minimal",        color: "#fb923c", meaning: "Nominal capacity exists but fails under pressure; no consistent outcomes." },
  { score: 1, label: "Absent",         color: "#f87171", meaning: "No meaningful capacity exists." },
  { score: 0, label: "Active Harm",    color: "#dc2626", meaning: "Specific documented harm; lead assessor co-sign required." },
];

const VB_W = 560;
const ROW_H = 44;
const SWATCH_W = 38;
const SCORE_W = 24;
const PAD_X = 6;
const TEXT_X = PAD_X + SCORE_W + SWATCH_W + 10;
const SVG_H = ANCHORS.length * ROW_H + 8;

export default function AnchorLadder({ caption }: { caption?: string }) {
  const ariaLabel = [
    "0–5 behavioral anchor ladder:",
    ANCHORS.map((a) => `${a.score} — ${a.label}: ${a.meaning}`).join("; "),
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
        <title>0–5 Behavioral Anchor Ladder</title>

        {ANCHORS.map((a, i) => {
          const rowY = 4 + i * ROW_H;
          const midY = rowY + ROW_H / 2;

          return (
            <g key={a.score}>
              {/* Score numeral */}
              <text
                x={PAD_X + SCORE_W - 4}
                y={midY + 5}
                textAnchor="end"
                fill={a.color}
                fontSize="15"
                fontWeight="800"
                fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
              >
                {a.score}
              </text>

              {/* Color swatch bar */}
              <rect
                x={PAD_X + SCORE_W}
                y={rowY + 6}
                width={SWATCH_W}
                height={ROW_H - 12}
                fill={a.color}
                opacity={0.85}
                rx={4}
              />

              {/* Anchor label */}
              <text
                x={TEXT_X}
                y={midY - 2}
                fill={a.color}
                fontSize="11"
                fontWeight="700"
                fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
              >
                {a.label}
              </text>

              {/* Anchor meaning */}
              <text
                x={TEXT_X}
                y={midY + 12}
                fill="rgba(184,198,222,0.65)"
                fontSize="9.5"
                fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
              >
                {a.meaning.length > 72 ? a.meaning.slice(0, 70) + "…" : a.meaning}
              </text>

              {/* Separator line */}
              {i < ANCHORS.length - 1 && (
                <line
                  x1={PAD_X}
                  y1={rowY + ROW_H}
                  x2={VB_W - PAD_X}
                  y2={rowY + ROW_H}
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth={1}
                />
              )}
            </g>
          );
        })}
      </svg>

      <figcaption className="text-[0.72rem] text-[rgba(148,163,184,0.55)] mt-1.5 text-right">
        {caption ?? CC_BY_CAPTION}
      </figcaption>
    </figure>
  );
}
