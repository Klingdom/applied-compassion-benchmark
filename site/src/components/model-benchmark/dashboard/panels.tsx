/**
 * panels.tsx -- the server-rendered panels of the AI Model Compassion Dashboard.
 *
 * Every panel reads ONLY `DashboardData.wave`, the public projection (a withheld point is absent from the object, so an
 * absent point means "Withheld", never a fallback to anything else). Every derived sentence goes through the template D
 * lexicon (`lex`), and every figure carries the label "Unofficial pilot · run · date · tier · not a score · comparability none"
 * (PanelFrame, each table caption, each in-SVG footer).
 *
 * Specs: docs/ai-dashboard/{PRD,UX_FLOWS,DATAVIZ}_AI_MODEL_DASHBOARD.md. No ranking, no band, no sort by result, no weights control.
 */

import type { ReactNode } from "react";
import type { DashboardData, PublicWave } from "@/lib/model-dashboard-facts";
import { dashboardCopy as C } from "@/lib/model-dashboard-copy";
import { numberWord } from "@/lib/model-report-facts";
import {
  dashboardBlocks, separatedFrom, buildOf, isSecondaryArm, hasArms, primaryArm, panelSubjects, range1, range2, fmt1, fmt2, notMeasuredStates,
} from "../../../../scripts/lib/model-dashboard-core.mjs";
import {
  PanelFrame, StripFigure, RangeRow, AxisHead, StripFooter, ModelLabel, NameGlyph, Guides, scale, Tbl, StateText, HashText,
  figureLabel, lex, listWords, HWhisker, Glyph, X0, X1,
} from "./parts";
import { W, LH, FS, VWhisker, SvgText, type ShapeKind } from "@/components/model-benchmark/pilot/figure-kit";

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

const shapeOf = (d: DashboardData, id: string): ShapeKind => d.builds.find((b) => b.id === buildOf(d.wave, id))?.shape ?? "circle";
const buildKey = (d: DashboardData, id: string): string => buildOf(d.wave, id) as string;
const sub = (d: DashboardData, id: string) => d.wave.subjects[id];
const WITH_K = "\u0000";
/** Put a live number (the island rewrites <span data-k>) where the template has the NUL placeholder. */
function withK(template: string, initial: string): ReactNode {
  const [a, b] = template.split(WITH_K);
  return <>{a}<span data-k>{initial}</span>{b}</>;
}
const hasPoint = (d: DashboardData, id: string): boolean => typeof sub(d, id)?.pilot_composite === "number" && !isSecondaryArm(d.wave, id);
const waveHas = (w: PublicWave, k: string): boolean => (w as unknown as Record<string, unknown>)[k] !== undefined;

// ---------------------------------------------------------------------------
// P1 + P2: groups and composite ranges
// ---------------------------------------------------------------------------

export function CompositePanel({ d }: { d: DashboardData }) {
  const w = d.wave;
  const { blocks, transitive } = dashboardBlocks(w) as { blocks: { kind: string; ids: string[]; gid: string }[]; transitive: boolean };
  const notSep = blocks.filter((b) => b.kind === "not-separated");
  const separated = blocks.filter((b) => b.kind === "separated");
  const unlisted = blocks.filter((b) => b.kind === "unlisted");
  const total = d.builds.length;
  const anyPoint = panelSubjects(w).some((id: string) => hasPoint(d, id));
  const ordered: string[] = blocks.flatMap((b) => b.ids);
  const min = 0;
  const max = 100;
  const xs = scale(min, max);
  const blockWord = (k: string) => (k === "not-separated" ? C.groups.notSeparated : k === "separated" ? C.groups.separatedHead : k === "range-only" ? C.groups.secondary : k === "unlisted" ? C.groups.unlisted : "Listed alphabetically");

  const headText = (k: string, n: number) =>
    k === "not-separated" ? `${C.groups.notSeparated}: the pilot cannot order these ${numberWord(n)}` : k === "separated" ? C.groups.separatedHead : blockWord(k);

  return (
    <PanelFrame code="comp" d={d} title={C.panels.comp.title} question={C.panels.comp.question}>
      <div className="dash-groups">
        <h3>{C.groups.heading}</h3>
        {!transitive && <p>{lex(d, "list-only", C.groups.listOnly)}</p>}
        {transitive && notSep.length === 0 && <p>{C.groups.noGroup}</p>}
        {transitive &&
          notSep.map((b) => (
            <div key={b.gid} className="dash-gstmt">
              <h4>{C.groups.notSeparated}</h4>
              <p>{lex(d, "not-separated", C.groups.notSeparatedBody(listWords(b.ids)))}</p>
              <p className="dash-subset" data-subset-for={b.gid} data-total={b.ids.length} hidden>
                {withK(lex(d, "subset", C.groups.subset(WITH_K, String(b.ids.length))), String(b.ids.length))}
              </p>
            </div>
          ))}
        {transitive &&
          (separated.length > 0 ? (
            <div className="dash-gstmt">
              <h4>{C.groups.separatedHead}</h4>
              {separated.map((b) => (
                <p key={b.gid}>
                  {lex(d, "separated", C.groups.separated(b.ids[0], listWords(separatedFrom(w, b.ids[0])) || "the others"))} {lex(d, "separated-confound", C.groups.separatedConfound)}
                </p>
              ))}
            </div>
          ) : (
            <p>{C.groups.noneSeparated}</p>
          ))}
        {transitive && unlisted.length > 0 && <p>{C.groups.unlisted}: {listWords(unlisted[0].ids)}.</p>}
        <p className="pf-qual">{C.groups.order}</p>
      </div>

      <StripFigure
        id="dash-composite"
        title={`${C.panels.comp.title}, 95% ranges on a scale from zero to one hundred`}
        caption={
          <>
            {" "}{C.groups.order}{" "}
            {anyPoint ? `${C.composite.pointCaption} ${C.groups.separatedConfound}` : C.composite.noPoint}{" "}
            {C.composite.alwaysAll}
          </>
        }
        svgTitle={`${C.panels.comp.title}: 95% ranges on a 0 to 100 scale, grouped, order carries no meaning`}
        desc={
          <>
            Horizontal ranges on a 0 to 100 scale, grouped; order carries no meaning.{" "}
            {blocks.flatMap((b) =>
              b.ids.map((id) => (
                <span key={id} data-subjects={buildKey(d, id)}>
                  {blockWord(b.kind)}: {id} {range1(sub(d, id).pilot_composite_interval95)}.{" "}
                </span>
              )),
            )}
            {figureLabel(d)}
          </>
        }
        chart={
          <>
            <AxisHead min={min} max={max} step={20} label="Composite score range (0 to 100)" />
            {blocks.map((b) => (
              <div key={b.gid} className="dash-block" data-block={b.gid}>
                <p className="dash-grouphead" data-group-head={b.gid}><strong>{headText(b.kind, b.ids.length)}</strong></p>
                {b.ids.map((id) => {
                  const iv = sub(d, id).pilot_composite_interval95;
                  const pt = sub(d, id).pilot_composite;
                  return (
                    <RangeRow
                      key={id}
                      subjects={buildKey(d, id)}
                      gid={b.gid}
                      label={<ModelLabel id={id} shape={shapeOf(d, id)} tier={d.accessTier} hollow={isSecondaryArm(w, id)} />}
                      rangeText={range1(iv)}
                      svg={
                        <>
                          <Guides min={min} max={max} step={20} height={30} />
                          <HWhisker x1={xs(iv[0])} x2={xs(iv[1])} y={15} tick={hasPoint(d, id) && typeof pt === "number" ? xs(pt) : undefined} />
                        </>
                      }
                    />
                  );
                })}
              </div>
            ))}
            <StripFooter d={d} total={total} nofn="models" />
          </>
        }
        tableSummary="Data table: composite ranges"
        table={
          <Tbl
            caption={figureLabel(d)}
            head={
              <tr>
                <th scope="col">{C.composite.colModel}</th>
                <th scope="col">{C.composite.colRange}</th>
                <th scope="col">{C.composite.colPoint}</th>
                <th scope="col">{C.composite.colGroup}</th>
              </tr>
            }
          >
            {ordered.map((id) => {
              const b = blocks.find((x) => x.ids.includes(id))!;
              return (
                <tr key={id} data-subjects={buildKey(d, id)}>
                  <th scope="row">{id} <span className="pf-qual">({d.accessTier})</span></th>
                  <td>{range1(sub(d, id).pilot_composite_interval95)}</td>
                  <td>{hasPoint(d, id) ? fmt1(sub(d, id).pilot_composite as number) : <StateText kind="withheld" />}</td>
                  <td>{blockWord(b.kind)}</td>
                </tr>
              );
            })}
          </Tbl>
        }
      />
      <p className="dash-note">{C.composite.pointNote}</p>
      <div className="dash-why" data-no-weights>
        <h3>{C.composite.weightsHead}</h3>
        <p>{lex(d, "weights", C.composite.weightsWhy)}</p>
      </div>
    </PanelFrame>
  );
}

// ---------------------------------------------------------------------------
// P3: dimension ranges (models x dimensions, ranges only)
// ---------------------------------------------------------------------------

const FEW_ITEMS = 5; // fewer task items than this on a dimension earns a visible "Few items" tag (text, not colour)

export function DimensionPanel({ d }: { d: DashboardData }) {
  const w = d.wave;
  const subjects: string[] = panelSubjects(w);
  const dims = d.dims;
  const total = d.builds.length;
  if (dims.length === 0) {
    return (
      <PanelFrame code="dims" d={d} title={C.panels.dims.title} question={C.panels.dims.question}>
        <p><StateText kind="notRecorded" /> {C.dims.notRecorded}</p>
      </PanelFrame>
    );
  }
  const counts = (code: string) => subjects.map((id) => sub(d, id).dimension_item_counts?.[code]).filter((n): n is number => typeof n === "number");
  const itemsLabel = (code: string) => {
    const c = counts(code);
    if (!c.length) return "";
    const lo = Math.min(...c);
    const hi = Math.max(...c);
    return lo === hi ? `${lo} ${C.dims.items}` : `${lo} to ${hi} ${C.dims.items}`;
  };
  const dimPairs = w.dimension_pairwise ?? [];
  const survivors = dimPairs.filter((q) => q.bonferroni_separated);
  const inSurvivor = (id: string, code: string) => survivors.some((q) => q.dimension === code && (q.a === id || q.b === id));
  const mx = (v: number) => 3 + ((v - 1) / 4) * 54;
  const surviveSentence = survivors.length === 0 ? C.dims.survivedNone(String(dimPairs.length)) : C.dims.survived(String(survivors.length), String(dimPairs.length));

  return (
    <PanelFrame code="dims" d={d} title={C.panels.dims.title} question={C.panels.dims.question}>
      <StripFigure
        id="dash-dims"
        title={`${C.panels.dims.title}, models by dimension, 95% ranges on the one to five rating scale`}
        caption={<>{" "}{C.dims.noteAll} {surviveSentence} {C.dims.survivorMark} {C.groups.order}</>}
        svgTitle={`${C.panels.dims.title}: 95% ranges on the 1 to 5 rating scale, one row per model`}
        desc={
          <>
            Ranges for the selected dimensions on the 1 to 5 rating scale, one row per model; order carries no meaning.{" "}
            {subjects.flatMap((id) =>
              dims.map((dm) => {
                const iv = sub(d, id).dimension_intervals95?.[dm.code];
                return iv ? (
                  <span key={`${id}-${dm.code}`} data-subjects={buildKey(d, id)} data-dim={dm.code}>
                    {dm.code} {dm.name}, {id}: {range2(iv)}.{" "}
                  </span>
                ) : null;
              }),
            )}
            {surviveSentence} {figureLabel(d)}
          </>
        }
        chart={
          <>
            <div className="dash-matrix">
              <div className="dash-mrow dash-mhead">
                <div className="dash-mlabel" />
                {dims.map((dm) => {
                  const c = counts(dm.code);
                  const few = c.length > 0 && Math.min(...c) < FEW_ITEMS;
                  return (
                    <div key={dm.code} className="dash-mcell" data-dim={dm.code}>
                      <strong>{dm.code}</strong> <span className="pf-qual">{dm.name}</span>
                      <br />
                      <span className="pf-qual">{itemsLabel(dm.code)}</span>
                      {few && <span className="dash-tag"> {C.dims.few(String(Math.min(...c)))}</span>}
                    </div>
                  );
                })}
              </div>
              {subjects.map((id) => (
                <div key={id} className="dash-mrow" data-subjects={buildKey(d, id)}>
                  <div className="dash-mlabel"><ModelLabel id={id} shape={shapeOf(d, id)} tier={d.accessTier} hollow={isSecondaryArm(w, id)} /></div>
                  {dims.map((dm) => {
                    const iv = sub(d, id).dimension_intervals95?.[dm.code];
                    return (
                      <div key={dm.code} className="dash-mcell" data-dim={dm.code}>
                        {iv ? (
                          <>
                            <svg viewBox="0 0 60 26" className="dash-mini" aria-hidden="true" focusable="false">
                              {[1, 2, 3, 4, 5].map((t) => <line key={t} className="pf-grid" x1={mx(t)} x2={mx(t)} y1={0} y2={26} />)}
                              <HWhisker x1={mx(iv[0])} x2={mx(iv[1])} y={14} capH={8} />
                              {inSurvivor(id, dm.code) && <Glyph kind="diamond" cx={54} cy={5} r={2.6} />}
                            </svg>
                            <span className="dash-range">{range2(iv)}</span>
                          </>
                        ) : (
                          <StateText kind="notRecorded" />
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
            <StripFooter d={d} total={total} nofn="both" dimTotal={dims.length} />
          </>
        }
        tableSummary="Data table: dimension ranges"
        table={
          <>
            <Tbl
              caption={figureLabel(d)}
              head={
                <tr>
                  <th scope="col">{C.composite.colModel}</th>
                  {dims.map((dm) => (
                    <th key={dm.code} scope="col" data-dim={dm.code}>{dm.code} {dm.name} ({itemsLabel(dm.code)})</th>
                  ))}
                </tr>
              }
            >
              {subjects.map((id) => (
                <tr key={id} data-subjects={buildKey(d, id)}>
                  <th scope="row">{id} <span className="pf-qual">({d.accessTier})</span></th>
                  {dims.map((dm) => {
                    const iv = sub(d, id).dimension_intervals95?.[dm.code];
                    return (
                      <td key={dm.code} data-dim={dm.code}>
                        {iv ? range2(iv) : <StateText kind="notRecorded" />}
                        {iv && inSurvivor(id, dm.code) ? " ◆ in a corrected difference" : ""}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </Tbl>
            <h3 className="dash-h3">{C.dims.pairsHead}</h3>
            {survivors.length === 0 ? (
              <p>{C.dims.noPairs}</p>
            ) : (
              <Tbl
                caption={`${figureLabel(d)}. ${C.dims.pairsHead}`}
                head={<tr><th scope="col">Dimension</th><th scope="col">{C.diff.colPair}</th><th scope="col">{C.diff.colRaw}</th></tr>}
              >
                {survivors.map((q) => (
                  <tr key={`${q.a}-${q.b}-${q.dimension}`} data-subjects={`${buildKey(d, q.a)} ${buildKey(d, q.b)}`} data-dim={q.dimension}>
                    <th scope="row">{q.dimension}</th>
                    <td>{q.a} minus {q.b}</td>
                    <td>{range2(q.interval95)}</td>
                  </tr>
                ))}
              </Tbl>
            )}
            {w.dimension_pairwise_note && <p className="dash-note" data-verbatim>{w.dimension_pairwise_note}</p>}
          </>
        }
      />
    </PanelFrame>
  );
}

// ---------------------------------------------------------------------------
// P4: pre-registered comparisons (+ the exploratory block, behind the toggle)
// ---------------------------------------------------------------------------

interface PairRow {
  key: string;
  a: string;
  b: string;
  raw: [number, number];
  corrected?: [number, number];
  excludes: boolean;
  correctedBasis: boolean;
}

function preRegistered(w: PublicWave): { rows: PairRow[]; basis: string } {
  const arms = hasArms(w);
  const prim = primaryArm(w);
  if (arms) {
    const rows = (w.comparisons ?? [])
      .filter((c) => c.kind === "build" && c.arm_a === prim && c.arm_b === prim)
      .map((c) => ({ key: `${c.a}|${c.b}`, a: c.a, b: c.b, raw: c.interval95, corrected: c.bonferroni?.interval, excludes: c.bonferroni ? c.bonferroni.separated : c.separated, correctedBasis: !!c.bonferroni }));
    const first = (w.comparisons ?? []).find((c) => c.bonferroni)?.bonferroni;
    const basis = first ? `Correction: Bonferroni over ${first.comparisons} comparisons, ${first.confidence_percent}% each.` : C.diff.correctionNone;
    return { rows, basis };
  }
  return { rows: (w.pairwise ?? []).map((q) => ({ key: `${q.a}|${q.b}`, a: q.a, b: q.b, raw: q.interval95, excludes: q.separated, correctedBasis: false })), basis: C.diff.correctionNone };
}

export function DifferencePanel({ d }: { d: DashboardData }) {
  const w = d.wave;
  const { rows, basis } = preRegistered(w);
  const total = d.builds.length;
  // One fixed axis for the whole wave (never rescaled by a filter): the extent of every difference range, with zero inside.
  const all: number[] = [0];
  for (const q of w.pairwise ?? []) all.push(...q.interval95);
  for (const c of w.comparisons ?? []) { all.push(...c.interval95); if (c.bonferroni) all.push(...c.bonferroni.interval); if (c.b_minus_a) all.push(...c.b_minus_a.interval95); }
  const span = Math.max(...all) - Math.min(...all);
  const step = span <= 30 ? 5 : span <= 60 ? 10 : 20;
  const min = Math.floor(Math.min(...all) / step) * step;
  const max = Math.ceil(Math.max(...all) / step) * step;
  const xs = scale(min, max);
  const reading = (r: PairRow) => (r.excludes ? (r.correctedBasis ? C.diff.excludesZero : "The range excludes zero.") : C.diff.includesZero);

  return (
    <PanelFrame code="diff" d={d} title={C.panels.diff.title} question={C.panels.diff.question}>
      {rows.length === 0 ? (
        <p>{C.diff.none}</p>
      ) : (
        <>
          <p>{w.preregistration?.committed_before_data === true ? C.diff.intro(numberWord(rows.length), basis) : C.diff.introNotPre(numberWord(rows.length), basis)}</p>
          <p data-diff-empty hidden>{C.diff.empty}</p>
          <p data-diff-noshare hidden>{C.diff.noShared}</p>
          <StripFigure
            id="dash-pairs"
            title={`${C.panels.diff.title}, first minus second, 95% ranges against zero`}
            caption={<>{" "}{C.diff.note} Solid: 95% range. Dashed: range after correction. The line at zero marks no difference.</>}
            svgTitle={`${C.panels.diff.title}: ranges of the declared differences with a line at zero`}
            desc={
              <>
                Ranges of the pre-declared differences, first minus second, with a line at zero.{" "}
                {rows.map((r) => (
                  <span key={r.key} data-subjects={`${buildKey(d, r.a)} ${buildKey(d, r.b)}`}>
                    {r.a} minus {r.b}: {range1(r.raw)}{r.corrected ? `, after correction ${range1(r.corrected)}` : ""}. {reading(r)}{" "}
                  </span>
                ))}
                A range that includes zero is not separated; that does not mean equal. {figureLabel(d)}
              </>
            }
            chart={
              <>
                <AxisHead min={min} max={max} step={step} label="Difference in composite points, first minus second" />
                {rows.map((r) => (
                  <RangeRow
                    key={r.key}
                    subjects={`${buildKey(d, r.a)} ${buildKey(d, r.b)}`}
                    label={
                      <span className="dash-name">
                        <NameGlyph shape={shapeOf(d, r.a)} />{r.a} minus <NameGlyph shape={shapeOf(d, r.b)} />{r.b}
                      </span>
                    }
                    rangeText={`${range1(r.raw)}${r.corrected ? `; after correction ${range1(r.corrected)}` : ""}. ${reading(r)}`}
                    height={36}
                    svg={
                      <>
                        <Guides min={min} max={max} step={step} height={36} />
                        <line className="pf-zero" x1={xs(0)} x2={xs(0)} y1={0} y2={36} />
                        <HWhisker x1={xs(r.raw[0])} x2={xs(r.raw[1])} y={12} />
                        {r.corrected && (
                          <g>
                            <line className="pf-dash" x1={xs(r.corrected[0])} x2={xs(r.corrected[1])} y1={26} y2={26} />
                            <line className="pf-stroke" x1={xs(r.corrected[0])} x2={xs(r.corrected[0])} y1={22} y2={30} />
                            <line className="pf-stroke" x1={xs(r.corrected[1])} x2={xs(r.corrected[1])} y1={22} y2={30} />
                          </g>
                        )}
                      </>
                    }
                  />
                ))}
                <StripFooter d={d} total={total} nofn="models" />
              </>
            }
            tableSummary="Data table: pre-registered comparisons"
            table={
              <Tbl
                caption={figureLabel(d)}
                head={
                  <tr>
                    <th scope="col">{C.diff.colPair}</th>
                    <th scope="col">{C.diff.colRaw}</th>
                    <th scope="col">{C.diff.colCorrected}</th>
                    <th scope="col">{C.diff.colReading}</th>
                  </tr>
                }
              >
                {rows.map((r) => (
                  <tr key={r.key} data-subjects={`${buildKey(d, r.a)} ${buildKey(d, r.b)}`}>
                    <th scope="row">{r.a} minus {r.b}</th>
                    <td>{range1(r.raw)}</td>
                    <td>{r.corrected ? range1(r.corrected) : <StateText kind="notRecorded" />}</td>
                    <td>{reading(r)}</td>
                  </tr>
                ))}
              </Tbl>
            }
          />
        </>
      )}
      <ExploratoryBlock d={d} />
    </PanelFrame>
  );
}

/** Every pair of the all-pairs list that is not pre-registered (arms waves), and each build's secondary-arm-minus-primary-arm range. Off until the toggle is on. */
function ExploratoryBlock({ d }: { d: DashboardData }) {
  const w = d.wave;
  const arms = hasArms(w);
  const pre = new Set(preRegistered(w).rows.map((r) => [r.a, r.b].sort().join("|")));
  type Ex = { key: string; a: string; b: string; range: [number, number]; excludes: boolean; kind: string };
  const rows: Ex[] = [];
  if (arms) {
    for (const q of w.pairwise ?? []) if (!pre.has([q.a, q.b].sort().join("|"))) rows.push({ key: `p-${q.a}|${q.b}`, a: q.a, b: q.b, range: q.interval95, excludes: q.separated, kind: C.exploratory.kindPair });
    for (const c of (w.comparisons ?? []).filter((x) => x.kind === "arm")) if (c.b_minus_a) rows.push({ key: `a-${c.a}|${c.b}`, a: c.b, b: c.a, range: c.b_minus_a.interval95, excludes: c.b_minus_a.separated, kind: C.exploratory.kindBMinusA });
  }
  rows.sort((x, y) => (x.a < y.a ? -1 : x.a > y.a ? 1 : x.b < y.b ? -1 : x.b > y.b ? 1 : 0));
  return (
    <details className="dash-expl" data-exploratory id="dash-exploratory">
      <summary>{C.controls.exploratory}</summary>
      <div data-dash-expl-body>
        <p className="dash-note" data-verbatim>{C.exploratory.head}</p>
        <p className="dash-note">{C.exploratory.chance} {arms ? C.exploratory.armNote : ""}</p>
        {w.pairwise_note && <p className="dash-note" data-verbatim>{w.pairwise_note}</p>}
        {rows.length === 0 ? (
          <p>{C.exploratory.none}</p>
        ) : (
          <div className="pf-table-wrap" role="region" aria-label="Exploratory pairs, scrollable" tabIndex={0}>
            <Tbl
              caption={`${figureLabel(d)}. ${C.exploratory.heading}`}
              head={<tr><th scope="col">{C.exploratory.colPair}</th><th scope="col">{C.diff.colRaw}</th><th scope="col">{C.exploratory.colReading}</th><th scope="col">{C.exploratory.colKind}</th></tr>}
            >
              {rows.map((r) => (
                <tr key={r.key} data-subjects={`${buildKey(d, r.a)} ${buildKey(d, r.b)}`} data-exploratory-row>
                  <th scope="row">{r.a} minus {r.b}</th>
                  <td>{range1(r.range)}</td>
                  <td>{r.excludes ? C.exploratory.excludes : C.exploratory.includes}. {C.exploratory.badge}.</td>
                  <td>{r.kind}</td>
                </tr>
              ))}
            </Tbl>
          </div>
        )}
      </div>
    </details>
  );
}

// ---------------------------------------------------------------------------
// P5: reply length
// ---------------------------------------------------------------------------

export function LengthPanel({ d }: { d: DashboardData }) {
  const w = d.wave;
  const subjects: string[] = panelSubjects(w);
  const total = d.builds.length;
  const len = w.length;
  const words = subjects.map((id) => sub(d, id).median_reply_words);
  const lo = Math.min(...words) * 0.8;
  const hi = Math.max(...words) * 1.2;
  const L = Math.log10;
  const PX0 = 48;
  const PX1 = W - 16;
  const PY0 = 14;
  const PY1 = 214;
  const px = (v: number) => PX0 + ((L(v) - L(lo)) / (L(hi) - L(lo))) * (PX1 - PX0);
  const py = (v: number) => PY1 - (v / 100) * (PY1 - PY0);
  const niceTicks = [50, 100, 150, 200, 300, 400, 500, 750, 1000, 1500, 2000, 3000].filter((t) => t >= lo && t <= hi);
  const bound = len?.composite_if_pooled_slope_removed ?? {};
  const anyBound = subjects.some((id) => id in bound);
  const checks = w.length_check?.per_build ?? [];
  const height = PY1 + 52;

  return (
    <PanelFrame code="len" d={d} title={C.panels.len.title} question={C.panels.len.question}>
      <StripFigure
        id="dash-length"
        title={`${C.panels.len.title}: median reply words against composite range`}
        caption={<>{" "}{C.length.caption} {C.groups.order}</>}
        svgTitle={`${C.panels.len.title}: median reply words (log scale) against the 95% composite range of each build`}
        desc={
          <>
            Median reply words on a log scale against the 95% composite range on a 0 to 100 scale, one mark per model. No fitted line.{" "}
            {subjects.map((id) => (
              <span key={id} data-subjects={buildKey(d, id)}>{id}: {sub(d, id).median_reply_words} words, range {range1(sub(d, id).pilot_composite_interval95)}.{" "}</span>
            ))}
            {figureLabel(d)}
          </>
        }
        chart={
          <>
            <svg className="dash-scatter" viewBox={`0 0 ${W} ${height}`} aria-hidden="true" focusable="false">
              <rect className="pf-bg" x={0} y={0} width={W} height={height} />
              {[0, 25, 50, 75, 100].map((t) => (
                <g key={t}>
                  <line className="pf-grid" x1={PX0} x2={PX1} y1={py(t)} y2={py(t)} />
                  <SvgText x={PX0 - 6} y={py(t) + 5} anchor="end" sub>{t}</SvgText>
                </g>
              ))}
              <line className="pf-axis" x1={PX0} x2={PX0} y1={PY0} y2={PY1} />
              <line className="pf-axis" x1={PX0} x2={PX1} y1={PY1} y2={PY1} />
              {niceTicks.map((t) => (
                <g key={t}>
                  <line className="pf-axis" x1={px(t)} x2={px(t)} y1={PY1} y2={PY1 + 5} />
                  <SvgText x={px(t)} y={PY1 + 5 + LH - 2} anchor="middle" sub>{t}</SvgText>
                </g>
              ))}
              {subjects.map((id) => {
                const iv = sub(d, id).pilot_composite_interval95;
                const x = px(sub(d, id).median_reply_words);
                return (
                  <g key={id} data-subjects={buildKey(d, id)}>
                    <VWhisker x={x} y1={py(iv[1])} y2={py(iv[0])} />
                    <Glyph kind={shapeOf(d, id)} cx={x} cy={py((iv[0] + iv[1]) / 2)} r={5} hollow={isSecondaryArm(w, id)} />
                  </g>
                );
              })}
              <SvgText x={(PX0 + PX1) / 2} y={PY1 + 5 + 2 * LH + 2} anchor="middle" sub>Median reply words (log scale)</SvgText>
              <SvgText x={PX0} y={PY0 - 2} sub>Composite range, 0 to 100</SvgText>
            </svg>
            <ul className="dash-legend">
              {subjects.map((id) => (
                <li key={id} data-subjects={buildKey(d, id)}><ModelLabel id={id} shape={shapeOf(d, id)} tier={d.accessTier} hollow={isSecondaryArm(w, id)} /></li>
              ))}
            </ul>
            <p className="pf-qual">The mark sits at the middle of each range. It is not a point estimate.</p>
            <StripFooter d={d} total={total} nofn="models" />
          </>
        }
        tableSummary="Data table: reply length"
        table={
          <>
            <Tbl
              caption={figureLabel(d)}
              head={
                <tr>
                  <th scope="col">{C.composite.colModel}</th>
                  <th scope="col">{C.length.colWords}</th>
                  <th scope="col">{C.composite.colRange}</th>
                  <th scope="col">{C.length.colSlope}</th>
                  <th scope="col">{C.length.colBound}</th>
                </tr>
              }
            >
              {subjects.map((id) => {
                const slope = len?.within_subject_slopes?.[id];
                return (
                  <tr key={id} data-subjects={buildKey(d, id)}>
                    <th scope="row">{id} <span className="pf-qual">({d.accessTier})</span></th>
                    <td>{sub(d, id).median_reply_words}</td>
                    <td>{range1(sub(d, id).pilot_composite_interval95)}</td>
                    <td>{typeof slope === "number" ? slope.toFixed(3) : C.length.slopeNull}</td>
                    <td>{id in bound ? fmt1(bound[id]) : <StateText kind="notShown" />}</td>
                  </tr>
                );
              })}
            </Tbl>
            <dl className="dash-dl">
              <div><dt>{C.length.pooled}</dt><dd>{len?.pooled_within_item_slope?.toFixed(3)}</dd></div>
              <div><dt>{C.length.r}</dt><dd>{len?.pooled_within_item_r?.toFixed(3)}</dd></div>
              <div><dt>{C.length.noLengthScore}</dt><dd><StateText kind="notMeasured" /> {C.length.noLengthScoreWhy}</dd></div>
            </dl>
            <p className="dash-note">{anyBound ? C.length.boundNote : C.length.noBound}</p>
            {checks.length > 0 && (
              <>
                <h3 className="dash-h3">{C.length.checkHead}</h3>
                <Tbl
                  caption={`${figureLabel(d)}. ${C.length.checkHead}`}
                  head={<tr><th scope="col">Build</th><th scope="col">Target words</th><th scope="col">Median words, primary arm</th><th scope="col">Median words, secondary arm</th><th scope="col">Length instruction</th></tr>}
                >
                  {checks.map((c) => (
                    <tr key={c.arm_a} data-subjects={buildKey(d, c.arm_a)}>
                      <th scope="row">{buildKey(d, c.arm_a)}</th>
                      <td>{c.target_words}</td>
                      <td>{c.median_words_a}</td>
                      <td>{c.median_words_b}</td>
                      <td>{c.length_instruction}</td>
                    </tr>
                  ))}
                </Tbl>
              </>
            )}
          </>
        }
      />
    </PanelFrame>
  );
}

// ---------------------------------------------------------------------------
// P6: judge reliability
// ---------------------------------------------------------------------------

type Rec = Record<string, unknown>;
const asRec = (x: unknown): Rec => (x && typeof x === "object" ? (x as Rec) : {});
/** Composite points per rating point (METH section 3: a rating moving by one step moves the composite by a quarter of its range). */
const COMPOSITE_PER_RATING_POINT = 25;

export function JudgePanel({ d }: { d: DashboardData }) {
  const w = d.wave;
  const subjects: string[] = panelSubjects(w);
  const total = d.builds.length;
  const xs = scale(0, 100);
  const judges = Object.keys(w.judges ?? {}).sort();
  const jv = asRec((w as unknown as Rec).judge_validity);
  const original = asRec(jv.measured_on_original_answers);
  const validity = asRec(original.judges);
  const quote = asRec(asRec((w as unknown as Rec).quote_grounding).judges);
  const bridge = asRec((w as unknown as Rec).bridge_drift);
  const bridgeJudges = asRec(bridge.per_judge);
  const pct = (v: number) => `${Math.round(v * 100)}%`;
  return (
    <PanelFrame code="judg" d={d} title={C.panels.judg.title} question={C.panels.judg.question}>
      <p className="dash-note">{C.judges.caption}</p>
      <StripFigure
        id="dash-judges"
        title={`${C.panels.judg.title}: exact agreement between the two judges of each reply`}
        caption={<>{" "}{C.judges.modelsNote} {C.groups.order}</>}
        svgTitle={`${C.panels.judg.title}: exact agreement between the two judges, 0 to 100 percent, by model`}
        desc={
          <>
            Exact agreement between the two judges, 0 to 100 percent, by model; order carries no meaning.{" "}
            {subjects.map((id) => (
              <span key={id} data-subjects={buildKey(d, id)}>{id}: {pct(sub(d, id).judge_agreement.exact)} exact, mean absolute difference {fmt2(sub(d, id).judge_agreement.mean_absolute_difference)}, {sub(d, id).judge_agreement.responses_differing_by_2_or_more} replies differed by two or more.{" "}</span>
            ))}
            No chance-agreement baseline was measured. {figureLabel(d)}
          </>
        }
        chart={
          <>
            <AxisHead min={0} max={100} step={20} label="Exact agreement (percent of replies)" />
            {subjects.map((id) => {
              const j = sub(d, id).judge_agreement;
              return (
                <RangeRow
                  key={id}
                  subjects={buildKey(d, id)}
                  label={<ModelLabel id={id} shape={shapeOf(d, id)} tier={d.accessTier} hollow={isSecondaryArm(w, id)} />}
                  rangeText={`${pct(j.exact)} exact; mean absolute difference ${fmt2(j.mean_absolute_difference)}; ${j.responses_differing_by_2_or_more} replies differ by two or more`}
                  svg={
                    <>
                      <Guides min={0} max={100} step={20} height={30} />
                      <Glyph kind={shapeOf(d, id)} cx={xs(j.exact * 100)} cy={15} r={5} hollow={isSecondaryArm(w, id)} />
                    </>
                  }
                />
              );
            })}
            <StripFooter d={d} total={total} nofn="models" extra="No chance-agreement baseline. Consistency, not validity." />
          </>
        }
        tableSummary="Data table: judge agreement"
        table={
          <Tbl
            caption={figureLabel(d)}
            head={<tr><th scope="col">{C.composite.colModel}</th><th scope="col">{C.judges.colExact}</th><th scope="col">{C.judges.colMad}</th><th scope="col">{C.judges.colTwo}</th></tr>}
          >
            {subjects.map((id) => {
              const j = sub(d, id).judge_agreement;
              return (
                <tr key={id} data-subjects={buildKey(d, id)}>
                  <th scope="row">{id} <span className="pf-qual">({d.accessTier})</span></th>
                  <td>{j.exact.toFixed(3)}</td>
                  <td>{fmt2(j.mean_absolute_difference)}</td>
                  <td>{j.responses_differing_by_2_or_more}</td>
                </tr>
              );
            })}
          </Tbl>
        }
      />

      <h3 className="dash-h3">{C.judges.validityHead}</h3>
      {Object.keys(validity).length > 0 ? (
        <div className="pf-table-wrap" role="region" aria-label="Quote validity, scrollable" tabIndex={0}>
          <Tbl
            caption={`${figureLabel(d)}. ${C.judges.validityHead}`}
            head={<tr><th scope="col">{C.judges.colJudge}</th><th scope="col">{C.judges.colRate}</th><th scope="col">{C.judges.colThreshold}</th><th scope="col">{C.judges.colVerdict}</th></tr>}
          >
            {Object.keys(validity).sort().map((j) => {
              const v = asRec(validity[j]);
              return (
                <tr key={j}>
                  <th scope="row">{j}</th>
                  <td>{String(v.unfound ?? "")} of {String(v.ratings ?? "")} ({String(v.unfound_rate_percent ?? "")}%)</td>
                  <td>{String(original.threshold_percent ?? "")}%</td>
                  <td>{String(v.verdict ?? "")}</td>
                </tr>
              );
            })}
          </Tbl>
        </div>
      ) : Object.keys(quote).length > 0 ? (
        <div className="pf-table-wrap" role="region" aria-label="Quote grounding, scrollable" tabIndex={0}>
          <Tbl
            caption={`${figureLabel(d)}. ${C.judges.validityHead}`}
            head={<tr><th scope="col">{C.judges.colJudge}</th><th scope="col">{C.judges.colRate}</th></tr>}
          >
            {Object.keys(quote).sort().map((j) => {
              const v = asRec(quote[j]);
              return <tr key={j}><th scope="row">{j}</th><td>{String(v.not_found ?? "")} of {String(v.ratings ?? "")}</td></tr>;
            })}
          </Tbl>
        </div>
      ) : (
        <p><StateText kind="notRecorded" /> {C.judges.validityNotRecorded}</p>
      )}

      <h3 className="dash-h3">{C.judges.lenienceHead}</h3>
      <p className="dash-note">{C.judges.lenienceNote}</p>
      <div className="pf-table-wrap" role="region" aria-label="Judge leniency, scrollable" tabIndex={0}>
        <Tbl
          caption={`${figureLabel(d)}. ${C.judges.lenienceHead}`}
          head={<tr><th scope="col">{C.composite.colModel}</th>{judges.map((j) => <th key={j} scope="col">{j}</th>)}</tr>}
        >
          {subjects.map((id) => (
            <tr key={id} data-subjects={buildKey(d, id)}>
              <th scope="row">{id}</th>
              {judges.map((j) => {
                const v = w.judges[j].by_subject[id];
                return <td key={j}>{typeof v === "number" ? fmt2(v) : "Not rated (own model)"}</td>;
              })}
            </tr>
          ))}
        </Tbl>
      </div>

      <h3 className="dash-h3">{C.judges.bridgeHead}</h3>
      {Object.keys(bridgeJudges).length > 0 ? (
        <div className="pf-table-wrap" role="region" aria-label="Judge drift, scrollable" tabIndex={0}>
          <Tbl
            caption={`${figureLabel(d)}. ${C.judges.bridgeHead}`}
            head={<tr><th scope="col">{C.judges.colJudge}</th><th scope="col">{C.judges.colMadJ}</th><th scope="col">{C.judges.colExactMatch}</th><th scope="col">{C.judges.colSigned}</th><th scope="col">{C.judges.colEquivalent}</th></tr>}
          >
            {Object.keys(bridgeJudges).sort().map((j) => {
              const v = asRec(bridgeJudges[j]);
              const signed = Number(v.mean_signed_difference_new_minus_original);
              return (
                <tr key={j}>
                  <th scope="row">{j}</th>
                  <td>{Number(v.mean_abs_difference).toFixed(3)}</td>
                  <td>{String(v.exact_match)} of {String(v.pairs)}</td>
                  <td>{signed.toFixed(3)}</td>
                  <td>{(signed * COMPOSITE_PER_RATING_POINT).toFixed(1)} composite points</td>
                </tr>
              );
            })}
          </Tbl>
        </div>
      ) : (
        <p><StateText kind="notRecorded" /> {C.judges.bridgeNotRecorded}</p>
      )}
    </PanelFrame>
  );
}

// ---------------------------------------------------------------------------
// P7: contamination probes (a table, not a chart)
// ---------------------------------------------------------------------------

export function ContaminationPanel({ d }: { d: DashboardData }) {
  const w = d.wave;
  const subjects: string[] = panelSubjects(w);
  const self = w.self_identifying_replies?.by_subject ?? {};
  const has = subjects.every((id) => sub(d, id).contamination);
  return (
    <PanelFrame code="cont" d={d} title={C.panels.cont.title} question={C.panels.cont.question}>
      <p className="dash-note">{C.contamination.caption}</p>
      {!has ? (
        <p><StateText kind="notRecorded" /> {C.contamination.notRecorded}</p>
      ) : (
        <div className="pf-table-wrap" role="region" aria-label="Contamination probes, scrollable" tabIndex={0}>
          <Tbl
            caption={figureLabel(d)}
            head={
              <tr>
                <th scope="col">{C.composite.colModel}</th>
                <th scope="col">{C.contamination.colRecall}</th>
                <th scope="col">{C.contamination.colId}</th>
                <th scope="col">{C.contamination.colFlag}</th>
                <th scope="col">{C.contamination.colVia}</th>
                <th scope="col">{C.contamination.colSelf}</th>
              </tr>
            }
          >
            {subjects.map((id) => {
              const c = sub(d, id).contamination;
              return (
                <tr key={id} data-subjects={buildKey(d, id)}>
                  <th scope="row">{id} <span className="pf-qual">({d.accessTier})</span></th>
                  <td>{C.contamination.recall(String(c.recall_items_flagged), String(c.recall_items_probed))}</td>
                  <td>{C.contamination.ident(String(c.identification_correct), String(c.identification_asked), c.identification_p_if_unexposed.toFixed(3))}</td>
                  <td>{c.indicated || c.identification_flagged ? C.contamination.flagged : C.contamination.notFlagged}</td>
                  <td>{c.via ?? <StateText kind="notRecorded" />}</td>
                  <td>{id in self ? String(self[id]) : <StateText kind="notRecorded" />}</td>
                </tr>
              );
            })}
          </Tbl>
        </div>
      )}
    </PanelFrame>
  );
}

// ---------------------------------------------------------------------------
// P8: instrument health and bank coverage (whole wave)
// ---------------------------------------------------------------------------

export function InstrumentPanel({ d }: { d: DashboardData }) {
  const w = d.wave;
  const b = w.bank;
  const T = b.items_total;
  const bw = X1 - X0;
  const sw = (n: number) => (T > 0 ? (n / T) * bw : 0);
  if (b.items_served + b.items_not_served !== T || b.items_not_served_sensitive + b.items_not_served_unreviewed !== b.items_not_served) {
    throw new Error(`dashboard ${d.runId}: bank counts do not partition (served + not served != total, or sensitive + unreviewed != not served)`);
  }
  const ops = w as unknown as Rec;
  const operations = asRec(ops.operations);
  const sens = w.sensitivity;
  const dimCounts = Object.entries(Object.values(w.subjects)[0]?.dimension_item_counts ?? {});
  const prereg = w.preregistration;
  const devs = w.deviations ?? [];
  const alt = `Item bank: ${b.items_served} of ${T} served, ${b.items_not_served_sensitive} not served as sensitive, ${b.items_not_served_unreviewed} not served as unreviewed. ${b.items_validated} of ${T} validated by humans.`;
  return (
    <PanelFrame code="inst" d={d} title={C.panels.inst.title} question={C.panels.inst.question}>
      <p className="dash-note">{C.instrument.wholeWave}</p>
      <figure className="dash-fig" id="dash-bank" data-figure="dash-bank">
        <figcaption><strong className="pf-cap-title">{C.instrument.bankHead}</strong><span className="pf-cap-body"> True proportions from zero. {figureLabel(d)}</span></figcaption>
        <div className="dash-chart">
          <div role="img" aria-label={alt} className="dash-strip">
            <svg className="dash-bank" viewBox={`0 0 ${W} 96`} aria-hidden="true" focusable="false">
              <defs>
                <pattern id="pf-hatch-pattern" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                  <line x1="0" y1="0" x2="0" y2="6" className="pf-axis" />
                </pattern>
              </defs>
              <rect className="pf-bg" x={0} y={0} width={W} height={96} />
              <rect className="pf-fill" x={X0} y={10} width={sw(b.items_served)} height={22} />
              <rect className="pf-hatch" x={X0 + sw(b.items_served)} y={10} width={sw(b.items_not_served_sensitive)} height={22} />
              <rect className="pf-cell" x={X0 + sw(b.items_served) + sw(b.items_not_served_sensitive)} y={10} width={sw(b.items_not_served_unreviewed)} height={22} />
              <rect className="pf-cell" x={X0} y={56} width={bw} height={22} />
              <rect className="pf-fill" x={X0} y={56} width={sw(b.items_validated)} height={22} />
            </svg>
            <ul className="dash-legend">
              <li>{C.instrument.served}: {C.instrument.of(String(b.items_served), String(T))}</li>
              <li>{C.instrument.notServedSensitive}: {C.instrument.of(String(b.items_not_served_sensitive), String(T))} (hatched)</li>
              <li>{C.instrument.notServedUnreviewed}: {C.instrument.of(String(b.items_not_served_unreviewed), String(T))} (outline)</li>
              <li>{b.items_validated === 0 ? C.instrument.noneValidated(String(T)) : `${C.instrument.validated}: ${C.instrument.of(String(b.items_validated), String(T))}`}</li>
            </ul>
            <StripFooter d={d} total={d.builds.length} nofn="none" />
          </div>
        </div>
        <details className="pf-data dash-table" open>
          <summary>Data table: bank coverage</summary>
          <div className="pf-table-wrap" role="region" aria-label="Bank coverage, scrollable" tabIndex={0}>
            <Tbl caption={figureLabel(d)} head={<tr><th scope="col">Measure</th><th scope="col">Count</th></tr>}>
              <tr><th scope="row">Items in the bank</th><td>{T}</td></tr>
              <tr><th scope="row">{C.instrument.served}</th><td>{C.instrument.of(String(b.items_served), String(T))}</td></tr>
              <tr><th scope="row">{C.instrument.notServedSensitive}</th><td>{C.instrument.of(String(b.items_not_served_sensitive), String(T))}</td></tr>
              <tr><th scope="row">{C.instrument.notServedUnreviewed}</th><td>{C.instrument.of(String(b.items_not_served_unreviewed), String(T))}</td></tr>
              <tr><th scope="row">{C.instrument.validated}</th><td>{b.items_validated === 0 ? C.instrument.noneValidated(String(T)) : C.instrument.of(String(b.items_validated), String(T))}</td></tr>
            </Tbl>
            <Tbl caption={`${figureLabel(d)}. ${C.instrument.rows}`} head={<tr><th scope="col">Dimension</th><th scope="col">Items served</th></tr>}>
              {dimCounts.map(([code, n]) => (
                <tr key={code}><th scope="row">{code}</th><td>{n}</td></tr>
              ))}
            </Tbl>
          </div>
        </details>
      </figure>

      <h3 className="dash-h3">{C.instrument.checklistHead}</h3>
      <div className="pf-table-wrap" role="region" aria-label="Instrument checks, scrollable" tabIndex={0}>
        <Tbl caption={`${figureLabel(d)}. ${C.instrument.checklistHead}`} head={<tr><th scope="col">Check</th><th scope="col">Result</th></tr>}>
          <tr><th scope="row">{C.instrument.bankVersion}</th><td>{w.design.bank_version}</td></tr>
          <tr><th scope="row">{C.instrument.bankSha}</th><td><StateText kind="notRecorded" /> ({C.instrument.bankShaNone})</td></tr>
          <tr><th scope="row">Pre-registration</th><td>{prereg ? (prereg.committed_before_data ? C.instrument.preregBefore : C.instrument.preregAfter) : <StateText kind="notRecorded" />}</td></tr>
          <tr>
            <th scope="row">{C.instrument.deviations}</th>
            <td>
              {devs.length === 0 ? C.instrument.noDeviations : (
                <ul className="dash-ul">
                  {devs.map((x) => <li key={x.id}>{x.id}, {x.date}: {x.title}</li>)}
                </ul>
              )}
            </td>
          </tr>
          <tr><th scope="row">{C.instrument.requote}</th><td>{typeof sens?.ratings_whose_value_differs_from_the_original === "number" ? sens.ratings_whose_value_differs_from_the_original : <StateText kind="notRecorded" />}</td></tr>
          <tr><th scope="row">{C.instrument.pattern}</th><td>{typeof sens?.separation_pattern_unchanged === "boolean" ? (sens.separation_pattern_unchanged ? C.instrument.patternSame : C.instrument.patternChanged) : <StateText kind="notRecorded" />}</td></tr>
          <tr><th scope="row">{C.instrument.crisis}</th><td>{w.design.crisis_items_served === false ? C.instrument.crisisNot : w.design.crisis_items_served === true ? "Served" : <StateText kind="notRecorded" />}</td></tr>
          <tr><th scope="row">{C.instrument.judgeFamily}</th><td>{w.judge_set ? w.judge_set.judge_families.join(", ") : w.design.judge_family}</td></tr>
          <tr><th scope="row">{C.instrument.batches}</th><td>{typeof operations.judge_batches === "number" ? operations.judge_batches : <StateText kind="notRecorded" />}</td></tr>
          <tr><th scope="row">{C.instrument.voids}</th><td>{typeof operations.judge_calls_voided === "number" ? operations.judge_calls_voided : typeof operations.judge_files_voided === "number" ? operations.judge_files_voided : <StateText kind="notRecorded" />}</td></tr>
        </Tbl>
      </div>
    </PanelFrame>
  );
}

// ---------------------------------------------------------------------------
// P9: provenance
// ---------------------------------------------------------------------------

export function ProvenancePanel({ d }: { d: DashboardData }) {
  const w = d.wave;
  const subjects: string[] = panelSubjects(w);
  const prov = w.subject_provenance;
  const builds = w.design.subject_builds;
  const arms = w.design.arms;
  const prereg = w.preregistration;
  const protocol = (w as unknown as Rec).protocol_version;
  const preSha = prereg?.sha256 ?? w.design.preregistration_sha256;
  return (
    <PanelFrame code="prov" d={d} title={C.panels.prov.title} question={C.panels.prov.question}>
      <dl className="dash-dl">
        <div><dt>{C.provenance.runId}</dt><dd>{w.run_id}</dd></div>
        <div><dt>{C.provenance.date}</dt><dd>{w.report_date}</dd></div>
        <div><dt>{C.provenance.tier}</dt><dd>{d.accessTier}</dd></div>
        <div><dt>{C.provenance.protocol}</dt><dd>{typeof protocol === "string" ? protocol : <StateText kind="notRecorded" />}</dd></div>
        <div><dt>{C.provenance.judgeSet}</dt><dd>{(w.design.judges ?? Object.keys(w.judges)).join(", ")}</dd></div>
        {w.judge_set && <div><dt>{C.provenance.judgeFamilies}</dt><dd>{w.judge_set.judge_families.join(", ")}</dd></div>}
        {w.judge_set && <div><dt>{C.provenance.disjoint}</dt><dd>{w.judge_set.families_disjoint ? C.provenance.yes : C.provenance.no}</dd></div>}
        <div><dt>{C.provenance.waveSha}</dt><dd><HashText id="sha-wave" value={d.waveSha256} /></dd></div>
        <div><dt>{C.provenance.sourceSha}</dt><dd><HashText id="sha-source" value={w.source_sha256} /></dd></div>
        {preSha && <div><dt>{C.provenance.preregWithDeviations}</dt><dd><HashText id="sha-prereg" value={preSha} /></dd></div>}
        {asRec(prereg).as_written_sha256 !== undefined && <div><dt>{C.provenance.preregAsWritten}</dt><dd><HashText id="sha-prereg-written" value={String((prereg as unknown as Rec).as_written_sha256)} /></dd></div>}
        {prereg && <div><dt>{C.provenance.preregCommitted}</dt><dd>{prereg.committed_before_data ? C.provenance.yes : C.provenance.no}</dd></div>}
        <div><dt>{C.instrument.bankVersion}</dt><dd>{w.design.bank_version}</dd></div>
      </dl>
      <p>
        <a href={`/data/model-waves/${w.run_id}.json`}>{C.provenance.waveFile}</a>
        {" · "}
        <a href={d.reportHref}>{C.provenance.report}</a>
        {" · "}
        <a href="/ai-models/methodology">{C.provenance.methodology}</a>
      </p>
      <p className="dash-note">{C.provenance.describes} {C.provenance.taskText}</p>
      <h3 className="dash-h3">{C.provenance.builds}</h3>
      <div className="pf-table-wrap" role="region" aria-label="Builds, scrollable" tabIndex={0}>
        <Tbl
          caption={figureLabel(d)}
          head={
            <tr>
              <th scope="col">{C.provenance.colBuild}</th>
              <th scope="col">{C.provenance.colDeveloper}</th>
              <th scope="col">{C.provenance.colTag}</th>
              <th scope="col">{C.provenance.colDigest}</th>
              <th scope="col">{C.provenance.colQuant}</th>
              <th scope="col">{C.provenance.colArm}</th>
              <th scope="col">{C.provenance.colTrials}</th>
              <th scope="col">{C.provenance.colMessage}</th>
            </tr>
          }
        >
          {subjects.map((id) => {
            const p = prov?.[id];
            const bd = builds?.[id];
            const a = arms?.[id];
            const tps = w.design.trials_per_subject;
            const trials = a?.trials ?? (typeof tps === "number" ? tps : tps?.[id]);
            return (
              <tr key={id} data-subjects={buildKey(d, id)}>
                <th scope="row">{id}</th>
                <td>{p?.developer ?? <StateText kind="notRecorded" />}</td>
                <td>{bd?.tag ?? p?.build_tag ?? <StateText kind="notRecorded" />}</td>
                <td>{bd?.digest_sha256 || p?.digest_sha256 ? <HashText id={`dg-${id}`} value={(bd?.digest_sha256 ?? p?.digest_sha256) as string} /> : <StateText kind="notRecorded" />}</td>
                <td>{p?.quantisation ?? <StateText kind="notRecorded" />}</td>
                <td>{a?.arm ?? <StateText kind="notRecorded" />}</td>
                <td>{trials ?? <StateText kind="notRecorded" />}</td>
                <td>
                  {a?.system_message ? (
                    <>
                      <pre className="dash-pre">{a.system_message}</pre>
                      <span className="pf-qual">sha256 </span><HashText id={`sm-${id}`} value={a.system_message_sha256} />
                    </>
                  ) : (
                    <StateText kind="notRecorded" />
                  )}
                </td>
              </tr>
            );
          })}
        </Tbl>
      </div>
    </PanelFrame>
  );
}

// ---------------------------------------------------------------------------
// P10: not measured yet
// ---------------------------------------------------------------------------

export function NotMeasuredPanel({ d }: { d: DashboardData }) {
  const w = d.wave;
  const states = notMeasuredStates(w) as { id: string; available: boolean }[];
  return (
    <PanelFrame code="nm" d={d} title={C.panels.nm.title} question={C.panels.nm.question}>
      <p>{C.notMeasured.lead}</p>
      <ul className="dash-nmlist">
        {states.map((s) => {
          const row = C.notMeasured.rows[s.id];
          if (!row) throw new Error(`no copy for not-measured row ${s.id}`);
          return (
            <li key={s.id} className={s.available ? "dash-nm dash-nm-value" : "dash-nm"} data-nm={s.id} data-nm-state={s.available ? "available" : "not-measured"}>
              <strong>{row.name}</strong>{": "}
              {s.available ? (
                <span>{s.id === "validated" ? C.notMeasured.availableValidated(String(w.bank.items_validated), String(w.bank.items_total)) : C.notMeasured.available}</span>
              ) : (
                <>
                  <StateText kind="notMeasured" />{". "}{row.why}
                </>
              )}
            </li>
          );
        })}
      </ul>
      <p className="dash-note">{C.notMeasured.exemplars}</p>
    </PanelFrame>
  );
}

// ---------------------------------------------------------------------------
// P11/P12: release tracker, requirements for an official score
// ---------------------------------------------------------------------------

export function ReleasePanel({ d }: { d: DashboardData }) {
  const p = d.program;
  const t0 = p.trackedCount > 0 ? `${p.trackedCount}` : p.scanState === "never-scanned" ? C.releases.t0Never : C.releases.t0Empty;
  const t2 = p.officialModelCount > 0 ? `${p.officialModelCount}` : C.releases.t2Empty;
  return (
    <PanelFrame code="rel" d={d} title={C.panels.rel.title} question={C.panels.rel.question}>
      <p className="dash-note">{C.releases.t0Note} {C.status.notCount}</p>
      <div className="pf-table-wrap" role="region" aria-label="Release tiers, scrollable" tabIndex={0}>
        <Tbl caption={`${figureLabel(d)}. ${C.releases.heading}`} head={<tr><th scope="col">{C.releases.colTier}</th><th scope="col">{C.releases.colCount}</th><th scope="col">{C.releases.colMeaning}</th></tr>}>
          <tr><th scope="row">{C.releases.tiers[0].name}</th><td>{t0}</td><td>{C.releases.tiers[0].meaning}</td></tr>
          <tr><th scope="row">{C.releases.tiers[1].name}</th><td>{C.releases.t1Count(String(p.publishableWaveCount), String(p.buildCountInWave))}</td><td>{C.releases.tiers[1].meaning}</td></tr>
          <tr><th scope="row">{C.releases.tiers[2].name}</th><td>{t2}</td><td>{C.releases.tiers[2].meaning}</td></tr>
        </Tbl>
      </div>
      <p><StateText kind="notMeasured" />{". "}{C.releases.latency}</p>
      <p>{C.releases.notRequest}</p>
    </PanelFrame>
  );
}

export function GatesPanel({ d }: { d: DashboardData }) {
  const g = d.gates;
  const met = g.filter((x) => x.state === "met").length;
  const derived = g.filter((x) => x.state !== "not-checked").length;
  const stateWord = (s: string) => (s === "met" ? C.gates.met : s === "not-met" ? C.gates.notMet : C.gates.notChecked);
  const icon = (s: string) => (s === "met" ? "✓" : s === "not-met" ? "✗" : "?");
  return (
    <PanelFrame code="gates" d={d} title={C.panels.gates.title} question={C.panels.gates.question}>
      <p>{met === 0 ? C.gates.introNone(String(derived), String(g.length)) : C.gates.intro(String(met), String(derived), String(g.length))}</p>
      <p className="dash-note">{C.gates.notDerived}</p>
      <div className="pf-table-wrap" role="region" aria-label="Requirements, scrollable" tabIndex={0}>
        <Tbl caption={`${figureLabel(d)}. ${C.gates.heading}`} head={<tr><th scope="col">{C.gates.colRequirement}</th><th scope="col">{C.gates.colState}</th><th scope="col">{C.gates.colEvidence}</th></tr>}>
          {g.map((row) => {
            const copy = C.gates.rows[row.id];
            return (
              <tr key={row.id}>
                <th scope="row">{copy.name}{copy.note ? <span className="pf-qual"> {copy.note}</span> : null}</th>
                <td><span aria-hidden="true">{icon(row.state)} </span>{stateWord(row.state)}</td>
                <td>{row.evidence || <StateText kind="notShown" />}</td>
              </tr>
            );
          })}
        </Tbl>
      </div>
    </PanelFrame>
  );
}

export { waveHas, FS };
