/**
 * PipelineFlowDiagram — #19
 *
 * 4-stage pipeline flow + prominent human-approval gate valve + ~30% feedback branch.
 * Replaces the 4 equal cards in the "Continuous research pipeline" section.
 *
 * Server component. Own-framework SVG. Accessibility: role="img" + aria-label + <title>.
 */

import { CC_BY_CAPTION } from "./chartTokens";

const ariaLabel =
  "Continuous pipeline flow diagram. Four stages: Stage 1 Scanner (nightly, all entities), Stage 2 Assessor (entities with material new evidence), Stage 3 Digest (synthesizes findings), Stage 4 Human Approval Gate. At the approval gate, approximately 30 percent of proposals are sent back for additional evidence or adjusted before approval. Only approved changes reach the published index.";

// Layout
const VW = 620;
const VH = 160;
const STAGE_W = 100;
const STAGE_H = 52;
const ARROW_GAP = 18;
const GATE_W = 90;
const GATE_H = 60;

// X positions for stages 1–3
const S1_X = 0;
const S2_X = S1_X + STAGE_W + ARROW_GAP;
const S3_X = S2_X + STAGE_W + ARROW_GAP;
const GATE_X = S3_X + STAGE_W + ARROW_GAP;
const OUT_X = GATE_X + GATE_W + ARROW_GAP;
const OUT_W = VW - OUT_X;

const ROW_Y = (VH - GATE_H) / 2 - 4;

// Colors
const STAGE_COLOR = "#94a3b8";
const GATE_COLOR = "#7dd3fc";
const REJECT_COLOR = "#fb923c";
const APPROVE_COLOR = "#86efac";

export default function PipelineFlowDiagram({ caption }: { caption?: string }) {
  const stageY = ROW_Y + (GATE_H - STAGE_H) / 2;
  const stageMidY = stageY + STAGE_H / 2;

  const stages = [
    { x: S1_X, label: "Stage 1", sub: "Scanner", note: "nightly · all entities" },
    { x: S2_X, label: "Stage 2", sub: "Assessor", note: "material new evidence" },
    { x: S3_X, label: "Stage 3", sub: "Digest", note: "synthesizes findings" },
  ];

  const gateY = ROW_Y;
  const gateMidY = gateY + GATE_H / 2;
  const gateMidX = GATE_X + GATE_W / 2;

  // Feedback arc: rejected proposals go back to Stage 2
  const feedbackY = stageY + STAGE_H + 22;
  const rejectStartX = GATE_X + GATE_W / 2;
  const rejectEndX = S2_X + STAGE_W / 2;

  return (
    <figure className="w-full overflow-x-auto" aria-label={ariaLabel}>
      <svg
        role="img"
        aria-label={ariaLabel}
        viewBox={`0 0 ${VW} ${VH}`}
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: "block", width: "100%", height: "auto", minWidth: "400px" }}
      >
        <title>Continuous research pipeline — 4 stages + human approval gate</title>

        {/* Stage boxes */}
        {stages.map(({ x, label, sub, note }) => (
          <g key={label}>
            <rect
              x={x}
              y={stageY}
              width={STAGE_W}
              height={STAGE_H}
              rx={8}
              fill={`${STAGE_COLOR}12`}
              stroke={STAGE_COLOR}
              strokeWidth="1"
              strokeOpacity="0.4"
            />
            <text
              x={x + STAGE_W / 2}
              y={stageY + 12}
              textAnchor="middle"
              fill="rgba(148,163,184,0.55)"
              fontSize="7"
              fontWeight="700"
              textDecoration="none"
              fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
            >
              {label}
            </text>
            <text
              x={x + STAGE_W / 2}
              y={stageY + 24}
              textAnchor="middle"
              fill={STAGE_COLOR}
              fontSize="9.5"
              fontWeight="700"
              fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
            >
              {sub}
            </text>
            <text
              x={x + STAGE_W / 2}
              y={stageY + 38}
              textAnchor="middle"
              fill="rgba(148,163,184,0.5)"
              fontSize="7"
              fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
            >
              {note}
            </text>

            {/* Forward arrow to next element */}
            <line
              x1={x + STAGE_W}
              y1={stageMidY}
              x2={x + STAGE_W + ARROW_GAP - 3}
              y2={stageMidY}
              stroke="rgba(148,163,184,0.35)"
              strokeWidth="1"
            />
            <polygon
              points={`${x + STAGE_W + ARROW_GAP - 3},${stageMidY - 3} ${x + STAGE_W + ARROW_GAP + 2},${stageMidY} ${x + STAGE_W + ARROW_GAP - 3},${stageMidY + 3}`}
              fill="rgba(148,163,184,0.35)"
            />
          </g>
        ))}

        {/* Gate (hexagon-like diamond shape using polygon) */}
        {(() => {
          const gx = GATE_X;
          const gy = gateY;
          const gw = GATE_W;
          const gh = GATE_H;
          const cx = gx + gw / 2;
          const cy = gy + gh / 2;
          const hw = gw / 2 - 2;
          const hh = gh / 2 - 2;
          // Hexagon points: top, right, bottom, left, with flat top/bottom
          const pts = [
            `${cx},${gy + 2}`,
            `${cx + hw},${cy}`,
            `${cx},${gy + gh - 2}`,
            `${cx - hw},${cy}`,
          ].join(" ");
          return (
            <g>
              <polygon
                points={pts}
                fill={`${GATE_COLOR}18`}
                stroke={GATE_COLOR}
                strokeWidth="1.5"
                strokeOpacity="0.7"
              />
              <text
                x={gateMidX}
                y={gateMidY - 8}
                textAnchor="middle"
                fill={GATE_COLOR}
                fontSize="7"
                fontWeight="700"
                fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
              >
                Stage 4
              </text>
              <text
                x={gateMidX}
                y={gateMidY + 2}
                textAnchor="middle"
                fill={GATE_COLOR}
                fontSize="8.5"
                fontWeight="700"
                fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
              >
                Human
              </text>
              <text
                x={gateMidX}
                y={gateMidY + 13}
                textAnchor="middle"
                fill={GATE_COLOR}
                fontSize="8.5"
                fontWeight="700"
                fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
              >
                Approval
              </text>
            </g>
          );
        })()}

        {/* Approve arrow → Published */}
        <line
          x1={GATE_X + GATE_W + 2}
          y1={gateMidY}
          x2={OUT_X - 3}
          y2={gateMidY}
          stroke={APPROVE_COLOR}
          strokeOpacity="0.6"
          strokeWidth="1.2"
        />
        <polygon
          points={`${OUT_X - 3},${gateMidY - 3} ${OUT_X + 2},${gateMidY} ${OUT_X - 3},${gateMidY + 3}`}
          fill={APPROVE_COLOR}
          fillOpacity="0.6"
        />

        {/* Published box */}
        <rect
          x={OUT_X}
          y={stageY}
          width={OUT_W - 5}
          height={STAGE_H}
          rx={8}
          fill={`${APPROVE_COLOR}12`}
          stroke={APPROVE_COLOR}
          strokeWidth="1"
          strokeOpacity="0.4"
        />
        <text
          x={OUT_X + (OUT_W - 5) / 2}
          y={stageY + 18}
          textAnchor="middle"
          fill={APPROVE_COLOR}
          fontSize="9"
          fontWeight="700"
          fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        >
          Published
        </text>
        <text
          x={OUT_X + (OUT_W - 5) / 2}
          y={stageY + 30}
          textAnchor="middle"
          fill="rgba(148,163,184,0.55)"
          fontSize="7"
          fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        >
          live index
        </text>

        {/* Reject feedback arc (~30% sent back) */}
        {/* Down from gate */}
        <line
          x1={gateMidX}
          y1={gateY + GATE_H - 2}
          x2={gateMidX}
          y2={feedbackY}
          stroke={REJECT_COLOR}
          strokeOpacity="0.55"
          strokeWidth="1"
          strokeDasharray="3,2"
        />
        {/* Horizontal feedback line back */}
        <line
          x1={gateMidX}
          y1={feedbackY}
          x2={rejectEndX}
          y2={feedbackY}
          stroke={REJECT_COLOR}
          strokeOpacity="0.55"
          strokeWidth="1"
          strokeDasharray="3,2"
        />
        {/* Up to Stage 2 */}
        <line
          x1={rejectEndX}
          y1={feedbackY}
          x2={rejectEndX}
          y2={stageY + STAGE_H + 2}
          stroke={REJECT_COLOR}
          strokeOpacity="0.55"
          strokeWidth="1"
          strokeDasharray="3,2"
        />
        <polygon
          points={`${rejectEndX - 3},${stageY + STAGE_H + 2} ${rejectEndX},${stageY + STAGE_H - 3} ${rejectEndX + 3},${stageY + STAGE_H + 2}`}
          fill={REJECT_COLOR}
          fillOpacity="0.55"
        />

        {/* ~30% label on feedback arc */}
        <text
          x={(gateMidX + rejectEndX) / 2}
          y={feedbackY - 4}
          textAnchor="middle"
          fill={REJECT_COLOR}
          fontSize="7.5"
          fontWeight="600"
          fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        >
          ~30% sent back
        </text>
      </svg>

      <figcaption className="text-[0.72rem] text-[rgba(148,163,184,0.55)] mt-1.5 text-right">
        {caption ?? CC_BY_CAPTION}
      </figcaption>
    </figure>
  );
}
