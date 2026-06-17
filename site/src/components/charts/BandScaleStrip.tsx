/**
 * BandScaleStrip — Methodology do-first wave, Item 4
 *
 * Server component: a static horizontal 0–100 band scale strip.
 * Five equal 20-point segments rendered as an SVG ruler, each showing
 * band name + range + one-line description from canonical BANDS data.
 *
 * Accessibility: role="img" + aria-label + <title>.
 * CC-BY caption via CC_BY_CAPTION.
 *
 * Pattern follows AnchorLadder.tsx — constants-driven, no runtime JS.
 */

import { BANDS } from "@/data/dimensions";
import { CC_BY_CAPTION } from "./chartTokens";

const VB_W = 600;
const BAR_H = 32;
const TICK_H = 10;
const LABEL_Y_OFFSET = 48; // y for band name text
const DESC_Y_OFFSET = 64;  // y for desc text
const AXIS_Y = BAR_H + 8;  // y for tick marks
const AXIS_LABEL_Y = AXIS_Y + TICK_H + 10; // y for "0", "20", etc.
const SVG_H = DESC_Y_OFFSET + 28; // total svg height
const SEG_W = VB_W / 5; // each segment is 20 pts = 1/5 of width

export default function BandScaleStrip({ caption }: { caption?: string }) {
  const ariaLabel = [
    "0 to 100 composite score band scale:",
    BANDS.map((b) => `${b.name} (${b.range}): ${b.desc}`).join("; "),
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
        <title>0–100 Composite Score Band Scale</title>

        {/* Segment bars */}
        {BANDS.map((band, i) => {
          const x = i * SEG_W;
          const isFirst = i === 0;
          const isLast = i === BANDS.length - 1;
          return (
            <g key={band.name}>
              <rect
                x={x}
                y={0}
                width={SEG_W}
                height={BAR_H}
                fill={band.color}
                opacity={0.9}
                rx={isFirst ? 5 : isLast ? 5 : 0}
                ry={isFirst ? 5 : isLast ? 5 : 0}
              />
              {/* Right-side sharp edge override for first segment */}
              {isFirst && (
                <rect
                  x={x + SEG_W - 5}
                  y={0}
                  width={5}
                  height={BAR_H}
                  fill={band.color}
                  opacity={0.9}
                />
              )}
              {/* Left-side sharp edge override for last segment */}
              {isLast && (
                <rect
                  x={x}
                  y={0}
                  width={5}
                  height={BAR_H}
                  fill={band.color}
                  opacity={0.9}
                />
              )}
            </g>
          );
        })}

        {/* Segment dividers (subtle vertical lines between bands) */}
        {BANDS.slice(0, -1).map((_, i) => {
          const x = (i + 1) * SEG_W;
          return (
            <line
              key={`div-${i}`}
              x1={x}
              y1={0}
              x2={x}
              y2={BAR_H}
              stroke="rgba(0,0,0,0.25)"
              strokeWidth={1}
            />
          );
        })}

        {/* Axis tick marks and labels (0, 20, 40, 60, 80, 100) */}
        {[0, 20, 40, 60, 80, 100].map((val, i) => {
          const x = (val / 100) * VB_W;
          const anchor = val === 0 ? "start" : val === 100 ? "end" : "middle";
          return (
            <g key={`tick-${val}`}>
              <line
                x1={x}
                y1={AXIS_Y}
                x2={x}
                y2={AXIS_Y + TICK_H}
                stroke="rgba(184,198,222,0.4)"
                strokeWidth={1}
              />
              <text
                x={x}
                y={AXIS_LABEL_Y}
                textAnchor={anchor}
                fill="rgba(184,198,222,0.55)"
                fontSize="9"
                fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
              >
                {val}
              </text>
            </g>
          );
        })}

        {/* Band name + range centered in each segment */}
        {BANDS.map((band, i) => {
          const cx = i * SEG_W + SEG_W / 2;
          return (
            <g key={`label-${band.name}`}>
              <text
                x={cx}
                y={LABEL_Y_OFFSET}
                textAnchor="middle"
                fill={band.color}
                fontSize="10"
                fontWeight="700"
                fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
              >
                {band.name} · {band.range}
              </text>
              {/* Band description — truncate if needed */}
              <text
                x={cx}
                y={DESC_Y_OFFSET}
                textAnchor="middle"
                fill="rgba(184,198,222,0.6)"
                fontSize="8"
                fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
              >
                {band.desc.length > 52 ? band.desc.slice(0, 50) + "…" : band.desc}
              </text>
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
