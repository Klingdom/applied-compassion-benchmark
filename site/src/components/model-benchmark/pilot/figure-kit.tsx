/**
 * figure-kit.tsx -- shared pieces for the pilot report's hand-rolled SVG figures.
 *
 * Rules (docs/AI_MODEL_ASSESSMENT_TEMPLATE.md E, a11y and dataviz briefs):
 *   - static inline SVG, no dependency, no animation;
 *   - the caveat is drawn INSIDE the SVG (footer lines) so a screenshot keeps it;
 *   - models are told apart by shape plus a text label, never by colour, and no
 *     element carries a band colour;
 *   - strokes use ink or muted-subtle (never --color-line); text is 14 user
 *     units in a 480-unit-wide viewBox, so it renders at 14px or larger at any
 *     width where the SVG is shown (the table replaces the SVG at 480px and below);
 *   - each figure: <figure>, svg role="img" with <title>/<desc> listing ranges,
 *     a visible caption, and a visible data table inside <details>.
 *
 * Colours come from CSS classes (.pf-*) in globals.css so the print theme can
 * swap to black on white without touching the markup.
 */

import type { ReactNode } from "react";
import type { PilotWave } from "@/lib/model-wave-facts";
import { alpha, judgeFamilyName, accessTierLabel } from "@/lib/model-report-facts";

export const W = 480;
export const FS = 14;
export const LH = 18;
const WRAP_CHARS = 54;

export const sortedSubjects = (wave: PilotWave): string[] => [...wave.design.subjects].sort(alpha);

const SHAPES = ["circle", "square", "triangle", "diamond", "plus", "hexagon"] as const;
export type ShapeKind = (typeof SHAPES)[number];
export const shapeFor = (wave: PilotWave, id: string): ShapeKind => SHAPES[sortedSubjects(wave).indexOf(id) % SHAPES.length];

export const shapeWord = (k: ShapeKind): string => ({ circle: "circle", square: "square", triangle: "triangle", diamond: "diamond", plus: "plus sign", hexagon: "hexagon" })[k];

/** Greedy word wrap on an approximate character budget. */
export function wrapText(text: string, max = WRAP_CHARS): string[] {
  const out: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/)) {
    if (!word) continue;
    if (line && (line + " " + word).length > max) {
      out.push(line);
      line = word;
    } else line = line ? `${line} ${word}` : word;
  }
  if (line) out.push(line);
  return out;
}

export const fmt1 = (n: number): string => n.toFixed(1);
export const range1 = (r: readonly [number, number]): string => `${fmt1(r[0])} to ${fmt1(r[1])}`;
export const range2 = (r: readonly [number, number]): string => `${r[0].toFixed(2)} to ${r[1].toFixed(2)}`;

/** The model label cell: the id plus the access-tier qualifier in the same element (template D). */
export function ModelName({ id, wave }: { id: string; wave: PilotWave }) {
  return (
    <>
      {id} <span className="pf-qual">({accessTierLabel(wave)})</span>
    </>
  );
}

// ---------------------------------------------------------------------------
// SVG atoms
// ---------------------------------------------------------------------------

export function Glyph({ kind, cx, cy, r = 5, hollow = false }: { kind: ShapeKind; cx: number; cy: number; r?: number; hollow?: boolean }) {
  const cls = hollow ? "pf-hollow" : "pf-fill";
  switch (kind) {
    case "circle":
      return <circle className={cls} cx={cx} cy={cy} r={r} />;
    case "square":
      return <rect className={cls} x={cx - r} y={cy - r} width={2 * r} height={2 * r} />;
    case "triangle":
      return <polygon className={cls} points={`${cx},${cy - r * 1.2} ${cx + r * 1.15},${cy + r * 0.95} ${cx - r * 1.15},${cy + r * 0.95}`} />;
    case "diamond":
      return <polygon className={cls} points={`${cx},${cy - r * 1.25} ${cx + r * 1.25},${cy} ${cx},${cy + r * 1.25} ${cx - r * 1.25},${cy}`} />;
    case "plus":
      return <path className="pf-stroke pf-thick" d={`M ${cx - r} ${cy} L ${cx + r} ${cy} M ${cx} ${cy - r} L ${cx} ${cy + r}`} />;
    case "hexagon":
      return (
        <polygon
          className={cls}
          points={[0, 1, 2, 3, 4, 5].map((i) => `${(cx + r * 1.2 * Math.cos((Math.PI / 3) * i)).toFixed(2)},${(cy + r * 1.2 * Math.sin((Math.PI / 3) * i)).toFixed(2)}`).join(" ")}
        />
      );
  }
}

export function SvgText({ x, y, children, anchor = "start", sub = false, bold = false }: { x: number; y: number; children: ReactNode; anchor?: "start" | "middle" | "end"; sub?: boolean; bold?: boolean }) {
  return (
    <text x={x} y={y} fontSize={FS} textAnchor={anchor} className={sub ? "pf-text-sub" : "pf-text"} fontWeight={bold ? 700 : 400}>
      {children}
    </text>
  );
}

/** Multi-line text; returns the number of lines so callers can advance. */
export function SvgLines({ x, y, lines, sub = false, bold = false, anchor = "start" }: { x: number; y: number; lines: string[]; sub?: boolean; bold?: boolean; anchor?: "start" | "middle" | "end" }) {
  return (
    <text x={x} y={y} fontSize={FS} textAnchor={anchor} className={sub ? "pf-text-sub" : "pf-text"} fontWeight={bold ? 700 : 400}>
      {lines.map((l, i) => (
        <tspan key={i} x={x} dy={i === 0 ? 0 : LH}>
          {l}
        </tspan>
      ))}
    </text>
  );
}

/** Horizontal interval with end caps (whisker) and an optional small unlabelled point tick. */
export function HWhisker({ x1, x2, y, tick, capH = 10 }: { x1: number; x2: number; y: number; tick?: number; capH?: number }) {
  return (
    <g>
      <line className="pf-stroke pf-bar" x1={x1} x2={x2} y1={y} y2={y} />
      <line className="pf-stroke pf-thick" x1={x1} x2={x1} y1={y - capH / 2} y2={y + capH / 2} />
      <line className="pf-stroke pf-thick" x1={x2} x2={x2} y1={y - capH / 2} y2={y + capH / 2} />
      {tick !== undefined && <line className="pf-stroke pf-tick" x1={tick} x2={tick} y1={y - 9} y2={y + 9} />}
    </g>
  );
}

export function VWhisker({ x, y1, y2, tick, capW = 10, tickW = 14 }: { x: number; y1: number; y2: number; tick?: number; capW?: number; tickW?: number }) {
  return (
    <g>
      <line className="pf-stroke pf-bar" x1={x} x2={x} y1={y1} y2={y2} />
      <line className="pf-stroke pf-thick" x1={x - capW / 2} x2={x + capW / 2} y1={y1} y2={y1} />
      <line className="pf-stroke pf-thick" x1={x - capW / 2} x2={x + capW / 2} y1={y2} y2={y2} />
      {tick !== undefined && <line className="pf-stroke pf-tick" x1={x - tickW / 2} x2={x + tickW / 2} y1={tick} y2={tick} />}
    </g>
  );
}

/**
 * The in-SVG footer (template E): "UNOFFICIAL PILOT · not a ranking · Claude-family
 * judges · compassionbenchmark.com/ai-models", plus run, tier and comparability.
 * Returns its height. One <text> so the sentence reads straight through.
 */
export function footerHeight(): number {
  return 8 + 3 * LH + 8;
}
export function Footer({ wave, y }: { wave: PilotWave; y: number }) {
  const fam = judgeFamilyName(wave) ?? "Same"; // the JUDGES' family: "Claude-family judges" whether or not the subjects are Claude models
  const l3 = `${wave.run_id} · ${accessTierLabel(wave)} · comparability ${wave.comparability}`;
  return (
    <g>
      <line className="pf-axis" x1={8} x2={W - 8} y1={y + 4} y2={y + 4} />
      <text x={12} y={y + 8 + LH - 2} fontSize={FS} className="pf-text" fontWeight={700}>
        <tspan>{"UNOFFICIAL PILOT · not a ranking · "}</tspan>
        <tspan x={12} dy={LH}>{`${fam}-family judges · compassionbenchmark.com/ai-models`}</tspan>
      </text>
      <text x={12} y={y + 8 + 3 * LH - 2} fontSize={FS} className="pf-text-sub">
        {l3}
      </text>
    </g>
  );
}

/** A horizontal numeric axis along the bottom of a plot. */
export function HAxis({ x0, x1, y, min, max, step, label, grid = 0, decimals = 0 }: { x0: number; x1: number; y: number; min: number; max: number; step: number; label?: string; grid?: number; decimals?: number }) {
  const ticks: number[] = [];
  for (let v = min; v <= max + 1e-9; v += step) ticks.push(Math.round(v * 1e6) / 1e6);
  const xs = (v: number) => x0 + ((v - min) / (max - min)) * (x1 - x0);
  return (
    <g>
      {grid > 0 &&
        ticks.map((t) => (
          <line key={`g${t}`} className="pf-grid" x1={xs(t)} x2={xs(t)} y1={y - grid} y2={y} />
        ))}
      <line className="pf-axis" x1={x0} x2={x1} y1={y} y2={y} />
      {ticks.map((t) => (
        <g key={t}>
          <line className="pf-axis" x1={xs(t)} x2={xs(t)} y1={y} y2={y + 5} />
          <SvgText x={xs(t)} y={y + 5 + LH - 2} anchor="middle" sub>
            {t.toFixed(decimals).replace("-", "−")}
          </SvgText>
        </g>
      ))}
      {label && <SvgText x={(x0 + x1) / 2} y={y + 5 + 2 * LH} anchor="middle" sub>{label}</SvgText>}
    </g>
  );
}

// ---------------------------------------------------------------------------
// Frame, table
// ---------------------------------------------------------------------------

export interface FigureFrameProps {
  id: string;
  number: number;
  title: string;
  caption: ReactNode;
  svgTitle: string;
  svgDesc: string;
  height: number;
  svg: ReactNode;
  tableSummary: string;
  table: ReactNode;
}

export function FigureFrame({ id, number, title, caption, svgTitle, svgDesc, height, svg, tableSummary, table }: FigureFrameProps) {
  return (
    <figure className="pilot-fig" id={id} data-figure={id}>
      <figcaption>
        <strong className="pf-cap-title">
          Figure {number}. {title}
        </strong>
        <span className="pf-cap-body">{caption}</span>
      </figcaption>
      <svg role="img" aria-labelledby={`${id}-t ${id}-d`} viewBox={`0 0 ${W} ${height}`} xmlns="http://www.w3.org/2000/svg" className="pf-svg" preserveAspectRatio="xMidYMin meet">
        <title id={`${id}-t`}>{svgTitle}</title>
        <desc id={`${id}-d`}>{svgDesc}</desc>
        <rect className="pf-bg" x={0} y={0} width={W} height={height} />
        {svg}
      </svg>
      <details className="pf-data">
        <summary>{tableSummary}</summary>
        <div className="pf-table-wrap" role="region" aria-label={`${tableSummary}, scrollable`} tabIndex={0}>
          {table}
        </div>
      </details>
    </figure>
  );
}

export function DataTable({ caption, head, rows }: { caption: string; head: ReactNode; rows: ReactNode }) {
  return (
    <table className="pf-table">
      <caption>{caption}</caption>
      <thead>{head}</thead>
      <tbody>{rows}</tbody>
    </table>
  );
}
