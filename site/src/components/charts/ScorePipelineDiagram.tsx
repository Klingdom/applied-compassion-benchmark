/**
 * ScorePipelineDiagram — #6
 *
 * Static SVG: subdim 0–5 → dimension /10 → base 0–100 → +premium /10 → composite /100 → band
 *
 * Server component. Own-framework diagram, no third-party imagery.
 * Accessibility: role="img" + aria-label + <title>.
 */

import { CC_BY_CAPTION } from "./chartTokens";

const ariaLabel =
  "Score-building pipeline: 40 subdimensions scored 0–5 are grouped into 8 dimensions, each converted to a 0–10 score. The 8 dimension scores are averaged into a base composite of 0–100 via ((average − 1) ÷ 4) × 100. An integration premium of 0–10 is added based on consistency across dimensions. The composite (0–100) is mapped to one of five bands: Critical, Developing, Functional, Established, or Exemplary.";

// Layout constants
const VW = 660;
const VH = 100;

// Box positions
const BOX_H = 36;
const BOX_Y = (VH - BOX_H) / 2; // vertically centered

const BOXES = [
  { x: 0,   w: 90,  label: "40 subdims", sub: "scored 0–5",   color: "#94a3b8" },
  { x: 130, w: 90,  label: "8 dimensions", sub: "sum → /10",  color: "#7dd3fc" },
  { x: 260, w: 70,  label: "base",         sub: "0–100",       color: "#86efac" },
  { x: 370, w: 90,  label: "+premium",     sub: "0–10",        color: "#fcd34d" },
  { x: 500, w: 80,  label: "composite",   sub: "0–100",        color: "#c084fc" },
  { x: 620, w: 80,  label: "band",        sub: "5 levels",     color: "#f472b6" },
] as const;

// Arrow x: end of previous box to start of next
function arrowX(box: typeof BOXES[number]): number {
  return box.x + box.w;
}

export default function ScorePipelineDiagram({ caption }: { caption?: string }) {
  // Total width including last box
  const totalW = BOXES[BOXES.length - 1].x + BOXES[BOXES.length - 1].w;

  return (
    <figure className="w-full overflow-x-auto" aria-label={ariaLabel}>
      <svg
        role="img"
        aria-label={ariaLabel}
        viewBox={`0 0 ${totalW} ${VH}`}
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: "block", width: "100%", height: "auto", minWidth: "440px" }}
      >
        <title>Score-building pipeline: subdim 0–5 → dimension /10 → base 0–100 → +premium /10 → composite /100 → band</title>

        {BOXES.map((box, i) => {
          const midX = box.x + box.w / 2;
          return (
            <g key={box.label}>
              {/* Box */}
              <rect
                x={box.x}
                y={BOX_Y}
                width={box.w}
                height={BOX_H}
                rx={8}
                fill={`${box.color}18`}
                stroke={box.color}
                strokeWidth="1.2"
                strokeOpacity="0.6"
              />
              {/* Label */}
              <text
                x={midX}
                y={BOX_Y + 12}
                textAnchor="middle"
                fill={box.color}
                fontSize="8.5"
                fontWeight="700"
                fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
              >
                {box.label}
              </text>
              {/* Sub-label */}
              <text
                x={midX}
                y={BOX_Y + 24}
                textAnchor="middle"
                fill="rgba(148,163,184,0.7)"
                fontSize="7.5"
                fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
              >
                {box.sub}
              </text>

              {/* Arrow to next box */}
              {i < BOXES.length - 1 && (
                <g>
                  {/* Arrow line */}
                  <line
                    x1={arrowX(box)}
                    y1={VH / 2}
                    x2={BOXES[i + 1].x - 2}
                    y2={VH / 2}
                    stroke="rgba(148,163,184,0.4)"
                    strokeWidth="1"
                  />
                  {/* Arrowhead */}
                  <polygon
                    points={`${BOXES[i + 1].x - 2},${VH / 2 - 3} ${BOXES[i + 1].x + 3},${VH / 2} ${BOXES[i + 1].x - 2},${VH / 2 + 3}`}
                    fill="rgba(148,163,184,0.4)"
                  />
                </g>
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
