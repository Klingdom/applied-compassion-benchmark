/**
 * parts.tsx -- shared pieces of the dashboard's server-rendered panels.
 *
 * Mechanism (docs/ai-dashboard/DATAVIZ_SPEC section 0.1): every figure is a "strip figure" rendered ONCE on the server for
 * the whole wave. A small client island (DashboardShell) only toggles the `hidden` attribute on elements that carry
 *   data-subjects="<build> [<build>]"   shown only when every listed build is selected
 *   data-dim="<CODE>"                   shown only when that dimension is selected
 * and rewrites the counters marked data-nofn-k. Nothing is re-laid-out or recomputed on the client, so groups, separation
 * flags and corrected ranges are always the full wave's, and the client never composes a sentence.
 *
 * Accessibility: the chart is a <div role="img"> labelled by a visually hidden title and description (the description
 * lists every visible range; spans for hidden rows are hidden too). The data table is the accessible equivalent and is
 * always in the DOM, inside a <details>.
 */

import type { ReactNode } from "react";
import { Glyph, HWhisker, HAxis, W, type ShapeKind } from "@/components/model-benchmark/pilot/figure-kit";
import type { DashboardData } from "@/lib/model-dashboard-facts";
import { asReportWave } from "@/lib/model-dashboard-facts";
import { dashboardCopy } from "@/lib/model-dashboard-copy";
import { assertLexicon, judgeFamilyName } from "@/lib/model-report-facts";

export const X0 = 12;
export const X1 = W - 12;
export const figureLabel = (d: DashboardData): string => dashboardCopy.figureLabel(d.runId, d.reportDate, d.accessTier);

/** Run a derived sentence through the template D lexicon; a failure throws and fails the build. */
export function lex(d: DashboardData, label: string, text: string): string {
  assertLexicon(`dashboard ${label}`, text, asReportWave(d.wave));
  return text;
}

/** "a, b and c" */
export function listWords(xs: string[]): string {
  if (xs.length <= 1) return xs.join("");
  return `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`;
}

/** A hidden-but-accessible-name text node. */
export const SrOnly = ({ children, ...rest }: { children: ReactNode; id?: string }) => <span className="sr-only" {...rest}>{children}</span>;

// ---------------------------------------------------------------------------
// Panel frame
// ---------------------------------------------------------------------------

export function PanelFrame({ code, d, title, question, hideable = true, children }: { code: string; d: DashboardData; title: string; question: string; hideable?: boolean; children: ReactNode }) {
  const h = `panel-${code}-h`;
  return (
    <>
      <section id={`panel-${code}`} data-panel={code} data-report-section={code} aria-labelledby={h} className="dash-panel">
        <div className="dash-panel-head">
          <h2 id={h}>{title}</h2>
          {hideable && (
            <button type="button" className="dash-btn dash-btn-quiet" data-dash-hide={code} aria-label={`${dashboardCopy.panels.hide}: ${title}`}>
              {dashboardCopy.panels.hide}
            </button>
          )}
        </div>
        <p className="dash-question">{question}</p>
        <p className="dash-label">{figureLabel(d)}</p>
        {children}
      </section>
      {hideable && (
        <p data-panel-stub={code} className="dash-stub" hidden>
          <span>{title}: {dashboardCopy.panels.hiddenNote}</span>{" "}
          <button type="button" className="dash-btn" data-dash-show={code}>{dashboardCopy.panels.show}</button>
        </p>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Strip figure
// ---------------------------------------------------------------------------

/** A tiny glyph beside a name (HTML-level, aria-hidden: the name beside it carries the identity). */
export function NameGlyph({ shape, hollow = false }: { shape: ShapeKind; hollow?: boolean }) {
  return (
    <svg className="dash-glyph" width={16} height={16} viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <Glyph kind={shape} cx={8} cy={8} r={4.5} hollow={hollow} />
    </svg>
  );
}

/** The model label: glyph, id and the access-tier qualifier in the same element (template D). */
export function ModelLabel({ id, shape, tier, hollow = false }: { id: string; shape: ShapeKind; tier: string; hollow?: boolean }) {
  return (
    <span className="dash-name">
      <NameGlyph shape={shape} hollow={hollow} />
      {id} <span className="pf-qual">({tier})</span>
    </span>
  );
}

/** Axis header: `min..max` on the same x scale as the row bars. */
export function AxisHead({ min, max, step, label, decimals = 0 }: { min: number; max: number; step: number; label: string; decimals?: number }) {
  return (
    <svg className="dash-axis" viewBox={`0 0 ${W} 58`} aria-hidden="true" focusable="false">
      <HAxis x0={X0} x1={X1} y={6} min={min} max={max} step={step} label={label} decimals={decimals} />
    </svg>
  );
}

/**
 * The in-figure footer, rendered as HTML text INSIDE the role="img" container (so it travels with the figure and keeps the caveat),
 * at the same size as the body labels. It used to be an SVG that scaled with the container width (14-unit text became ~22px and the
 * shared Footer's last line clipped). The caveat appears once: the pilot line, the COMPLETE figure label, then the "n of N shown" lines
 * the island updates.
 */
export function StripFooter({ d, total, nofn, extra, dimTotal = 0 }: { d: DashboardData; total: number; nofn: "models" | "dims" | "both" | "none"; extra?: string; dimTotal?: number }) {
  const w = asReportWave(d.wave);
  const fam = judgeFamilyName(w) ?? "Same"; // the JUDGES' family, as in the shared Footer
  return (
    <div className="dash-foot">
      <p className="dash-foot-strong">{`UNOFFICIAL PILOT · not a ranking · ${fam}-family judges · compassionbenchmark.com/ai-models`}</p>
      <p>{figureLabel(d)}</p>
      {(nofn === "models" || nofn === "both") && (
        <>
          <p><span data-nofn-k="models">{total}</span>{` of ${total} models shown`}</p>
          <p>{`Grouping and separation reflect all ${total} models.`}</p>
        </>
      )}
      {(nofn === "dims" || nofn === "both") && <p><span data-nofn-k="dims">{dimTotal}</span>{` of ${dimTotal} dimensions shown`}</p>}
      {extra && <p>{extra}</p>}
    </div>
  );
}

export interface StripFigureProps {
  id: string;
  title: string;
  /** Visible caption (confound, order note, scale). */
  caption: ReactNode;
  svgTitle: string;
  /** The description: ranges of every visible row; use <span data-subjects> so the island can drop hidden rows. */
  desc: ReactNode;
  /** Axis header, rows and footer. */
  chart: ReactNode;
  tableSummary: string;
  table: ReactNode;
}

export function StripFigure({ id, title, caption, svgTitle, desc, chart, tableSummary, table }: StripFigureProps) {
  return (
    <figure className="dash-fig" id={id} data-figure={id}>
      <figcaption>
        <strong className="pf-cap-title">{title}</strong>
        <span className="pf-cap-body">{caption}</span>
      </figcaption>
      <div className="dash-chart">
        <div role="img" aria-labelledby={`${id}-t ${id}-d`} className="dash-strip">
          <span id={`${id}-t`} className="sr-only">{svgTitle}</span>
          <span id={`${id}-d`} className="sr-only">{desc}</span>
          {chart}
        </div>
      </div>
      <details className="pf-data dash-table" open>
        <summary>{tableSummary}</summary>
        <div className="pf-table-wrap" role="region" aria-label={`${tableSummary}, scrollable`} tabIndex={0}>
          {table}
        </div>
      </details>
    </figure>
  );
}

/** A horizontal range bar row. `x` maps a value to the plot. */
export function RangeRow({ subjects, group, gid, label, rangeText, svg, height = 30 }: { subjects: string; group?: string; gid?: string; label: ReactNode; rangeText: string; svg: ReactNode; height?: number }) {
  return (
    <div className="dash-row" data-subjects={subjects} data-group={gid ?? group}>
      <div className="dash-rowhead">
        {label}{" "}
        <span className="dash-range">{rangeText}</span>
      </div>
      <svg className="dash-bar" viewBox={`0 0 ${W} ${height}`} aria-hidden="true" focusable="false">
        {svg}
      </svg>
    </div>
  );
}

export const scale = (min: number, max: number) => (v: number) => X0 + ((v - min) / (max - min)) * (X1 - X0);

/** Vertical guide lines for a row at the axis ticks. */
export function Guides({ min, max, step, height }: { min: number; max: number; step: number; height: number }) {
  const xs = scale(min, max);
  const ticks: number[] = [];
  for (let v = min; v <= max + 1e-9; v += step) ticks.push(Math.round(v * 1e6) / 1e6);
  return (
    <>
      {ticks.map((t) => (
        <line key={t} className="pf-grid" x1={xs(t)} x2={xs(t)} y1={0} y2={height} />
      ))}
    </>
  );
}

export { HWhisker, Glyph };

// ---------------------------------------------------------------------------
// Tables, states
// ---------------------------------------------------------------------------

export function Tbl({ caption, head, children }: { caption: string; head: ReactNode; children: ReactNode }) {
  return (
    <table className="pf-table">
      <caption>{caption}</caption>
      <thead>{head}</thead>
      <tbody>{children}</tbody>
    </table>
  );
}

/** A cell that is not a value: text, never zero, dash or blank. */
export function StateText({ kind }: { kind: "withheld" | "notMeasured" | "notRecorded" | "notShown" }) {
  const c = dashboardCopy.state;
  const text = kind === "withheld" ? c.withheld : kind === "notMeasured" ? c.notMeasured : kind === "notRecorded" ? c.notRecorded : c.notShown;
  const tip = kind === "withheld" ? c.withheldTip : kind === "notMeasured" ? c.notMeasuredTip : undefined;
  return <span className="dash-state" title={tip}>{text}</span>;
}

/** Selectable hash text with a copy button (the shell handles the click). */
export function HashText({ id, value }: { id: string; value: string }) {
  return (
    <span className="dash-hash">
      <code id={id}>{value}</code>{" "}
      <button type="button" className="dash-btn dash-btn-quiet" data-dash-copy={id} aria-label={`${dashboardCopy.provenance.copy}: ${value.slice(0, 12)}`}>
        {dashboardCopy.provenance.copy}
      </button>
    </span>
  );
}
