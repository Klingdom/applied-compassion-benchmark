/**
 * PilotFigures.tsx -- the five pilot report figures (template E, dataviz brief).
 *
 *   G1 IntervalFigure     per-model 95% ranges, point tick, "Not separated" brackets
 *   G2 PairFigure         paired-difference ranges, separated vs not, zero line
 *   G3 DimensionFigure    per-dimension ranges on the 1 to 5 rating scale, item counts
 *   G4 LengthFigure       reply length: between-model scatter + within-model slopes
 *   G5 JudgeFigure        judge leniency grid (own-model cells hatched) + agreement
 *
 * All data comes from the wave file (props.wave) and nothing else. Subjects are
 * alphabetical (groups: larger first, then first label). Every annotation is a
 * sentence generated behind a predicate over the wave: a false predicate throws,
 * which fails the build, so copy cannot go stale against the data.
 *
 * Server components: no state, no animation, no client JS.
 */

import type { ReactNode } from "react";
import type { PilotWave, PairwiseEntry, ComparisonEntry } from "@/lib/model-wave-facts";
import { DIMENSIONS } from "@/data/dimensions";
import { alpha, assertLexicon, numberWord, waveShape, accessTierLabel } from "@/lib/model-report-facts";
import {
  W, LH, FS, Footer, footerHeight, FigureFrame, DataTable, Glyph, HAxis, HWhisker, VWhisker, ModelName,
  SvgLines, SvgText, shapeFor, shapeWord, sortedSubjects, wrapText, fmt1, range1, range2,
  hasArms, armNames, subjectsOfArm, panelSubjects, isSecondaryArm, armPanelName, armTrials,
} from "./figure-kit";

function must(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`pilot figure predicate failed: ${msg}`);
}

const pairKey = (a: string, b: string) => (a < b ? `${a}|${b}` : `${b}|${a}`);
const separatedMap = (wave: PilotWave) => new Map(wave.pairwise.map((p) => [pairKey(p.a, p.b), p.separated]));

/**
 * Template amendment 2 (2026-10-01): members of a not-separated group show RANGES ONLY, in charts,
 * tables and prose. A point (tick, marker, table cell) exists only for a separated subject.
 */
const showsPoint = (wave: PilotWave, id: string): boolean => wave.derived.separated_subjects.includes(id);

const STATUS_LINE = (wave: PilotWave) =>
  `Unofficial pilot ${wave.run_id}, ${wave.report_date}; ${accessTierLabel(wave)}; not a score, comparability ${wave.comparability}.`;

/** One sentence per separated model that has an unresolved reply-length confound (D-29a item 4). */
function confoundSentence(wave: PilotWave): string {
  const ids = wave.derived.separated_subjects.filter((id) => id in wave.length.composite_if_pooled_slope_removed);
  return ids.map((id) => `${id} was separated from the others; reply length is an unresolved confound.`).join(" ");
}

function checkText(label: string, text: string, wave: PilotWave) {
  assertLexicon(`figure ${label}`, text, wave);
}

// ===========================================================================
// G1
// ===========================================================================

interface Block {
  ids: string[];
  notSeparated: boolean;
  /** Secondary arm (amendment 16): ranges only, no point, no ordering and no group claim. */
  rangeOnly?: boolean;
}

/** One panel of the interval figure: one arm of an arms wave, or the whole wave. */
interface Panel {
  arm: string | null;
  blocks: Block[];
}

export function groupBlocks(wave: PilotWave): { blocks: Block[]; transitive: boolean } {
  const ids = sortedSubjects(wave);
  const sep = separatedMap(wave);
  const isSep = (a: string, b: string) => sep.get(pairKey(a, b)) === true;
  const groups = wave.derived.not_separated_groups.map((g) => [...g].sort(alpha));
  const inGroup = new Set(groups.flat());
  const blocks: Block[] = [
    ...groups.map((g) => ({ ids: g, notSeparated: true })),
    ...ids.filter((i) => !inGroup.has(i)).map((i) => ({ ids: [i], notSeparated: false })),
  ].sort((a, b) => b.ids.length - a.ids.length || alpha(a.ids[0], b.ids[0]));
  const within = blocks.every((b) => b.ids.every((x, i) => b.ids.every((y, j) => i >= j || !isSep(x, y))));
  const across = blocks.every((b, bi) => blocks.every((c, ci) => bi >= ci || b.ids.every((x) => c.ids.every((y) => isSep(x, y)))));
  return { blocks, transitive: within && across };
}

/**
 * Panels of an arms wave (template amendment 16): the primary arm as its corrected groups, then each other arm as one range-only block.
 * The groups are derived.not_separated_groups (corrected, primary arm), never the 95% flags of the exploratory pairs across arms.
 */
function armPanels(wave: PilotWave): Panel[] {
  const primary = wave.derived.primary_arm ?? "A";
  return armNames(wave).map((arm) => {
    const ids = subjectsOfArm(wave, arm);
    if (arm !== primary) return { arm, blocks: [{ ids, notSeparated: false, rangeOnly: true }] };
    const groups = wave.derived.not_separated_groups.map((g) => [...g].sort(alpha));
    const inGroup = new Set(groups.flat());
    const blocks: Block[] = [
      ...groups.map((g) => ({ ids: g, notSeparated: true })),
      ...ids.filter((i) => !inGroup.has(i)).map((i) => ({ ids: [i], notSeparated: false })),
    ].sort((a, b) => b.ids.length - a.ids.length || alpha(a.ids[0], b.ids[0]));
    return { arm, blocks };
  });
}

/** "three trials per item", "one trial per item" from the wave's own design.arms. */
function trialsPhrase(wave: PilotWave, arm: string): string {
  const t = armTrials(wave, arm);
  return t === null ? "trials per item differ" : `${numberWord(t)} trial${t === 1 ? "" : "s"} per item`;
}

export function IntervalFigure({ wave, number }: { wave: PilotWave; number: number }) {
  const arms = hasArms(wave);
  let panels: Panel[];
  let transitive = true;
  if (arms) {
    panels = armPanels(wave);
  } else {
    const g = groupBlocks(wave);
    transitive = g.transitive;
    // A non-transitive set of separation flags cannot be drawn as brackets (dataviz G1): one plain list.
    panels = [{ arm: null, blocks: transitive ? g.blocks : [{ ids: sortedSubjects(wave), notSeparated: false }] }];
  }
  const X0 = 26;
  const X1 = W - 24;
  const xs = (v: number) => X0 + (v / 100) * (X1 - X0);
  const els: ReactNode[] = [];
  let y = 8;
  const panelHead = (p: Panel) => `${armPanelName(wave, p.arm ?? "")}: ${trialsPhrase(wave, p.arm ?? "")}${p.blocks.some((b) => b.rangeOnly) ? ", ranges only" : ""}`;
  panels.forEach((p, pi) => {
    if (arms && p.arm) {
      const head = panelHead(p);
      checkText("G1 arm header", head, wave);
      const lines = wrapText(head);
      els.push(<SvgLines key={`p${pi}`} x={12} y={y + LH - 4} lines={lines} bold />);
      y += lines.length * LH + 6;
    }
    p.blocks.forEach((b, bi) => {
      if (transitive) {
        const head = b.rangeOnly
          ? "Ranges only: no point and no ordering"
          : b.ids.length > 1
            ? `Not separated${arms ? " after correction" : ""}: the pilot cannot order these ${numberWord(b.ids.length)}`
            : `Separated from each of the others${arms ? " after correction" : ""}`;
        checkText("G1 group header", head, wave);
        const lines = wrapText(head);
        els.push(<SvgLines key={`h${pi}-${bi}`} x={X0} y={y + LH - 4} lines={lines} bold />);
        y += lines.length * LH + 4;
      }
      const yTop = y;
      b.ids.forEach((id) => {
        const iv = wave.subjects[id].pilot_composite_interval95;
        const pt = wave.subjects[id].pilot_composite;
        els.push(
          <g key={id}>
            <Glyph kind={shapeFor(wave, id)} cx={X0 + 6} cy={y + 8} r={5} hollow={isSecondaryArm(wave, id)} />
            <SvgText x={X0 + 18} y={y + 14}>{id}</SvgText>
            <HWhisker x1={xs(iv[0])} x2={xs(iv[1])} y={y + 30} tick={showsPoint(wave, id) ? xs(pt) : undefined} />
          </g>,
        );
        y += 40;
        const bound = wave.length.composite_if_pooled_slope_removed;
        if (id in bound) {
          const cav = "Reply length is an unresolved confound for this model’s range.";
          checkText("G1 caveat", cav, wave);
          const lines = wrapText(cav);
          els.push(<SvgLines key={`c${id}`} x={X0} y={y + 10} lines={lines} sub />);
          y += lines.length * LH;
        }
      });
      if (transitive && b.ids.length > 1 && !b.rangeOnly) {
        els.push(<path key={`br${pi}-${bi}`} className="pf-stroke pf-thick" d={`M 16 ${yTop + 2} L 10 ${yTop + 2} L 10 ${y - 6} L 16 ${y - 6}`} />);
      }
      y += 8;
    });
  });
  const axisY = y + 4;
  const axisLabel = "Pilot range scale, 0 to 100. Unofficial; not a score.";
  const noteLines = wrapText(`Whisker: 95% range from item resampling. A small tick marks a point only for a separated model. Order carries no meaning.${arms ? " Hollow shapes: the secondary arm." : ""}`);
  const axisEnd = axisY + 5 + 2 * LH + 6;
  const noteY = axisEnd + LH - 4;
  const footY = noteY + noteLines.length * LH + 6;
  const height = footY + footerHeight() + 4;

  const blockWord = (b: Block) => (b.rangeOnly ? "Ranges only" : transitive ? (b.ids.length > 1 ? "Not separated group" : "Separated from each of the others") : "");
  const desc =
    "Horizontal ranges on a 0 to 100 scale, alphabetical within groups. " +
    panels
      .map((p) => `${arms && p.arm ? `${panelHead(p)}. ` : ""}${p.blocks.map((b) => `${transitive ? `${blockWord(b)}: ` : ""}${b.ids.map((id) => `${id} ${range1(wave.subjects[id].pilot_composite_interval95)}`).join("; ")}`).join(". ")}`)
      .join(". ") +
    `. ${STATUS_LINE(wave)} Order carries no meaning.`;
  const confound = confoundSentence(wave);
  const title = "Unofficial pilot ranges by model, in groups. Not a ranking.";
  checkText("G1 title", title, wave);
  checkText("G1 desc", desc, wave);
  const captionText = `${STATUS_LINE(wave)} Each whisker is a 95% range from item resampling. Models in a not-separated group show ranges only; a separated model also shows a small tick for its point estimate, which is in the table. ${arms ? "The groups are the primary arm's, after correction for multiple comparisons; the secondary arm has one trial per item and shows ranges only. " : ""}Larger group first, alphabetical within each group. Order carries no meaning. ${confound}`;
  checkText("G1 caption", captionText, wave);

  const svg = (
    <>
      <HAxis x0={X0} x1={X1} y={axisY} min={0} max={100} step={25} grid={axisY - 8} label={axisLabel} />
      {els}
      <SvgLines x={12} y={noteY} lines={noteLines} sub />
      <Footer wave={wave} y={footY} />
    </>
  );
  const groupCell = (p: Panel, b: Block) => {
    const kind = b.rangeOnly ? "Ranges only" : transitive ? (b.ids.length > 1 ? "Not separated" : "Separated") : "Listed alphabetically";
    return arms && p.arm ? `${armPanelName(wave, p.arm)}: ${kind.toLowerCase()}` : kind;
  };
  return (
    <FigureFrame
      id="fig-ranges"
      number={number}
      title="Where each model landed, as a range. Not a ranking."
      caption={captionText}
      svgTitle={title}
      svgDesc={desc}
      height={height}
      svg={svg}
      tableSummary="Data table: ranges by model"
      table={
        <DataTable
          caption="Pilot range by model, in groups. Alphabetical within group. Unofficial; not a score."
          head={
            <tr>
              <th scope="col">Group</th>
              <th scope="col">Model</th>
              <th scope="col">Range (95%)</th>
              <th scope="col">Point estimate</th>
            </tr>
          }
          rows={panels.flatMap((p) =>
            p.blocks.flatMap((b) =>
              b.ids.map((id) => (
                <tr key={id}>
                  <td>{groupCell(p, b)}</td>
                  <td><ModelName id={id} wave={wave} /></td>
                  <td>{range1(wave.subjects[id].pilot_composite_interval95)}</td>
                  <td>{showsPoint(wave, id) ? fmt1(wave.subjects[id].pilot_composite) : "not shown"}</td>
                </tr>
              )),
            ),
          )}
        />
      }
    />
  );
}

// ===========================================================================
// G2
// ===========================================================================

interface PairRow {
  a: string;
  b: string;
  diff: number;
  lo: number;
  hi: number;
  separated: boolean;
}

function pairRows(wave: PilotWave): PairRow[] {
  return wave.pairwise.map((p: PairwiseEntry) => {
    const flip = p.separated && p.difference < 0;
    const row: PairRow = flip
      ? { a: p.b, b: p.a, diff: -p.difference, lo: -p.interval95[1], hi: -p.interval95[0], separated: true }
      : { a: p.a, b: p.b, diff: p.difference, lo: p.interval95[0], hi: p.interval95[1], separated: p.separated };
    if (row.separated) must(row.lo > 0 || row.hi < 0, `pair ${p.a}/${p.b} is flagged separated but its range includes zero`);
    else must(row.lo <= 0 && row.hi >= 0, `pair ${p.a}/${p.b} is flagged not separated but its range excludes zero`);
    return row;
  });
}

/**
 * G2 for an ARMS wave (template amendment 16): the pre-declared comparisons, not the 28 exploratory pairs. Ranges only: no point difference is
 * drawn or printed, because every separated pair of the primary arm involves a subject that shows a range only, and every other comparison
 * involves the secondary arm. The primary arm's pairs show both the 95% range without correction (solid) and the range after correction for
 * multiple comparisons (dashed); the secondary arm's pairs show the uncorrected range only; each build's secondary arm minus primary arm is one row.
 */
function ComparisonFigure({ wave, number }: { wave: PilotWave; number: number }) {
  const cs: ComparisonEntry[] = wave.comparisons ?? [];
  must(cs.length > 0, "an arms wave carries no comparisons");
  const d = wave.derived;
  const primary = d.primary_arm ?? "A";
  const isPrimaryBuild = (c: ComparisonEntry) => c.kind === "build" && c.arm_a === primary;
  const byName = (x: ComparisonEntry, z: ComparisonEntry) => alpha(`${x.a}|${x.b}`, `${z.a}|${z.b}`);
  const sepAfter = cs.filter((c) => isPrimaryBuild(c) && c.bonferroni?.separated === true).sort(byName);
  const sepOnlyUncorrected = cs.filter((c) => isPrimaryBuild(c) && c.separated && c.bonferroni?.separated !== true).sort(byName);
  const notSep = cs.filter((c) => isPrimaryBuild(c) && !c.separated).sort(byName);
  const secondary = cs.filter((c) => c.kind === "build" && c.arm_a !== primary).sort(byName);
  const perBuild = cs.filter((c) => c.kind === "arm").sort(byName);
  must(sepAfter.length + sepOnlyUncorrected.length + notSep.length === cs.filter(isPrimaryBuild).length, "the primary-arm comparisons do not partition");
  must(JSON.stringify(sepAfter.map((c) => [c.a, c.b])) === JSON.stringify(d.separated_pairs), "the pairs separated after correction differ from derived.separated_pairs");
  must(JSON.stringify(sepOnlyUncorrected.map((c) => [c.a, c.b])) === JSON.stringify(d.separated_uncorrected_only_pairs ?? []), "the pairs separated only without correction differ from derived");
  const groupsDef: { label: string; rows: ComparisonEntry[]; word: string }[] = [
    { label: "Primary arm: separated after correction for multiple comparisons", rows: sepAfter, word: "Separated after correction" },
    { label: "Primary arm: separated only without correction (not stated as a separation)", rows: sepOnlyUncorrected, word: "Separated only without correction" },
    { label: "Primary arm: not separated, even without correction", rows: notSep, word: "Not separated" },
    { label: "Secondary arm, one trial per item: ranges only, no correction", rows: secondary, word: "Secondary arm, ranges only" },
    { label: "Each build, secondary arm minus primary arm: ranges only", rows: perBuild, word: "Secondary arm minus primary arm" },
  ].filter((g) => g.rows.length > 0);

  const rangeOf = (c: ComparisonEntry): [number, number] => (c.kind === "arm" && c.b_minus_a ? c.b_minus_a.interval95 : c.interval95);
  const all = cs.flatMap((c) => [rangeOf(c), ...(c.bonferroni ? [c.bonferroni.interval] : [])]);
  const minLo = Math.min(0, ...all.map((r) => r[0]));
  const maxHi = Math.max(0, ...all.map((r) => r[1]));
  const span = maxHi - minLo;
  const step = span <= 60 ? 5 : span <= 120 ? 10 : 20;
  const min = Math.floor(minLo / step) * step;
  const max = Math.ceil(maxHi / step) * step;
  const X0 = 24;
  const X1 = W - 24;
  const xs = (v: number) => X0 + ((v - min) / (max - min)) * (X1 - X0);
  const labelOf = (c: ComparisonEntry) => (c.kind === "arm" ? `${c.a} and ${c.b}, ${c.arm_b} minus ${c.arm_a}` : `${c.a} minus ${c.b}`);

  const els: ReactNode[] = [];
  let y = 8;
  groupsDef.forEach((g, gi) => {
    checkText("G2 group header", g.label, wave);
    const lines = wrapText(g.label);
    els.push(<SvgLines key={`h${gi}`} x={12} y={y + LH - 4} lines={lines} bold />);
    y += lines.length * LH + 4;
    g.rows.forEach((c) => {
      const r = rangeOf(c);
      const corrected = c.bonferroni?.interval;
      els.push(
        <g key={`${c.a}${c.b}`}>
          <SvgText x={X0} y={y + 14}>{labelOf(c)}</SvgText>
          <HWhisker x1={xs(r[0])} x2={xs(r[1])} y={y + 28} />
          {corrected && (
            <g>
              <line className="pf-dash" x1={xs(corrected[0])} x2={xs(corrected[1])} y1={y + 40} y2={y + 40} />
              <line className="pf-stroke pf-thick" x1={xs(corrected[0])} x2={xs(corrected[0])} y1={y + 35} y2={y + 45} />
              <line className="pf-stroke pf-thick" x1={xs(corrected[1])} x2={xs(corrected[1])} y1={y + 35} y2={y + 45} />
            </g>
          )}
        </g>,
      );
      y += corrected ? 52 : 38;
    });
    y += 6;
  });

  const axisY = y + 4;
  const k = (d.primary_arm_subject_count ?? 1) - 1;
  must(d.separated_subjects.length === 1 && sepAfter.length === k && sepAfter.every((c) => c.a === d.separated_subjects[0] || c.b === d.separated_subjects[0]), "the pairs separated after correction are not exactly the pairs of the one separated variant");
  const annotation = `${d.separated_subjects[0]} was separated from each of the other ${numberWord(k)} after correction. No other primary-arm pair was. No point difference is shown.`;
  checkText("G2 annotation", annotation, wave);
  const confound = confoundSentence(wave);
  const legend = "Solid: 95% range without correction. Dashed: range after correction for multiple comparisons. Zero line: no difference.";
  const noteLines = wrapText(`${annotation} ${legend} ${confound}`.trim());
  const axisLabel = "Difference in the pilot range scale. 0 = no difference.";
  const noteY = axisY + 5 + 2 * LH + 6 + LH - 4;
  const footY = noteY + noteLines.length * LH + 6;
  const height = footY + footerHeight() + 4;

  const desc =
    "Ranges of the pre-declared comparisons on one shared axis with a line at zero. " +
    groupsDef
      .map((g) => `${g.word}: ${g.rows.map((c) => `${labelOf(c)} ${range1(rangeOf(c))}${c.bonferroni ? `, after correction ${range1(c.bonferroni.interval)}` : ""}`).join("; ")}`)
      .join(". ") +
    `. ${STATUS_LINE(wave)}`;
  const title = "Unofficial pilot pre-declared comparisons: which pairs separated and which did not.";
  checkText("G2 title", title, wave);
  checkText("G2 desc", desc, wave);
  const caption = `${STATUS_LINE(wave)} Each whisker is the range of the difference between two variants on the same items, from the same item re-draws for every variant. The primary arm's pairs also show the range after correction for multiple comparisons; a pair is stated as separated only if its corrected range excludes zero. No point is shown for any comparison, and a not-separated range does not mean the models are equal. ${confound}`.trim();
  checkText("G2 caption", caption, wave);

  const svg = (
    <>
      <HAxis x0={X0} x1={X1} y={axisY} min={min} max={max} step={step} grid={axisY - 8} label={axisLabel} />
      <line className="pf-zero" x1={xs(0)} x2={xs(0)} y1={8} y2={axisY} />
      {els}
      <SvgLines x={12} y={noteY} lines={noteLines} bold />
      <Footer wave={wave} y={footY} />
    </>
  );
  return (
    <FigureFrame
      id="fig-pairs"
      number={number}
      title="Which differences are real: the pre-declared comparisons."
      caption={caption}
      svgTitle={title}
      svgDesc={desc}
      height={height}
      svg={svg}
      tableSummary="Data table: pre-declared comparisons"
      table={
        <DataTable
          caption="Pre-declared comparisons, first minus second (a build's secondary arm minus primary arm for the last group). Ranges only. Unofficial; not a score."
          head={
            <tr>
              <th scope="col">Group</th>
              <th scope="col">Pair</th>
              <th scope="col">Range of the difference (95%)</th>
              <th scope="col">Range after correction</th>
              <th scope="col">Point estimate</th>
            </tr>
          }
          rows={groupsDef.flatMap((g) =>
            g.rows.map((c) => (
              <tr key={`${c.a}${c.b}`}>
                <td>{g.word}</td>
                <td>{labelOf(c)}</td>
                <td>{range1(rangeOf(c))}</td>
                <td>{c.bonferroni ? range1(c.bonferroni.interval) : "not computed"}</td>
                <td>not shown</td>
              </tr>
            )),
          )}
        />
      }
    />
  );
}

export function PairFigure({ wave, number }: { wave: PilotWave; number: number }) {
  if (hasArms(wave)) return <ComparisonFigure wave={wave} number={number} />;
  const rows = pairRows(wave);
  const notSep = rows.filter((r) => !r.separated).sort((x, y) => alpha(x.a + x.b, y.a + y.b));
  const sep = rows.filter((r) => r.separated).sort((x, y) => alpha(x.a + x.b, y.a + y.b));

  if (rows.length > 15) return <PairMatrix wave={wave} number={number} rows={rows} />;

  const minLo = Math.min(0, ...rows.map((r) => r.lo));
  const maxHi = Math.max(0, ...rows.map((r) => r.hi));
  const span = maxHi - minLo;
  const step = span <= 60 ? 5 : span <= 120 ? 10 : 20;
  const min = Math.floor(minLo / step) * step;
  const max = Math.ceil(maxHi / step) * step;
  const X0 = 24;
  const X1 = W - 24;
  const xs = (v: number) => X0 + ((v - min) / (max - min)) * (X1 - X0);

  const els: ReactNode[] = [];
  let y = 8;
  const group = (label: string, list: PairRow[], gi: number) => {
    if (!list.length) return;
    checkText("G2 group header", label, wave);
    const lines = wrapText(label);
    els.push(<SvgLines key={`h${gi}`} x={12} y={y + LH - 4} lines={lines} bold />);
    y += lines.length * LH + 4;
    list.forEach((r) => {
      els.push(
        <g key={`${r.a}${r.b}`}>
          <SvgText x={X0} y={y + 14}>{`${r.a} minus ${r.b}`}</SvgText>
          <HWhisker x1={xs(r.lo)} x2={xs(r.hi)} y={y + 30} />
          {r.separated && <circle className="pf-fill" cx={xs(r.diff)} cy={y + 30} r={5} />}
        </g>,
      );
      y += 40;
    });
    y += 6;
  };
  group("Not separated: every range includes zero", notSep, 0);
  group("Separated: no range includes zero; the point is shown", sep, 1);

  const axisY = y + 4;
  const s = waveShape(wave);
  let annotation: string;
  if (s.oneApartFromOneGroup && s.separated) {
    const k = wave.derived.subject_count - 1;
    must(sep.length === k && sep.every((r) => r.a === s.separated || r.b === s.separated), "the separated pairs are not exactly the pairs of the one separated model");
    annotation = `${s.separated} was separated from each of the other ${numberWord(k)}. No other pair was.`;
  } else {
    annotation = "Separated pairs are listed in the Separated group; no other pair was separated.";
  }
  checkText("G2 annotation", annotation, wave);
  const confound = confoundSentence(wave);
  const noteLines = wrapText(`${annotation} ${confound}`.trim());
  const axisLabel = "Difference in the pilot range scale. 0 = no difference.";
  const noteY = axisY + 5 + 2 * LH + 6 + LH - 4;
  const footY = noteY + noteLines.length * LH + 6;
  const height = footY + footerHeight() + 4;

  const desc =
    "Ranges of the difference between each pair of models, on one shared axis with a line at zero. " +
    rows.map((r) => `${r.a} minus ${r.b}: ${range1([r.lo, r.hi])}, ${r.separated ? "separated" : "not separated, range includes zero"}`).join("; ") +
    `. ${STATUS_LINE(wave)}`;
  const title = "Unofficial pilot paired differences: which pairs separated and which did not.";
  checkText("G2 title", title, wave);
  checkText("G2 desc", desc, wave);
  const caption = `${STATUS_LINE(wave)} Each whisker is the 95% range of the difference between two models on the same items, from the same item re-draws for every model. A point appears only for separated pairs, and a not-separated range does not mean the models are equal. ${confound}`.trim();
  checkText("G2 caption", caption, wave);

  const svg = (
    <>
      <HAxis x0={X0} x1={X1} y={axisY} min={min} max={max} step={step} grid={axisY - 8} label={axisLabel} />
      <line className="pf-zero" x1={xs(0)} x2={xs(0)} y1={8} y2={axisY} />
      {els}
      <SvgLines x={12} y={noteY} lines={noteLines} bold />
      <Footer wave={wave} y={footY} />
    </>
  );
  const tableRows = [...notSep.map((r) => ({ r, g: "Not separated" })), ...sep.map((r) => ({ r, g: "Separated" }))];
  return (
    <FigureFrame
      id="fig-pairs"
      number={number}
      title="Which differences are real: paired differences."
      caption={caption}
      svgTitle={title}
      svgDesc={desc}
      height={height}
      svg={svg}
      tableSummary="Data table: paired differences"
      table={
        <DataTable
          caption="Paired differences, first minus second. Separated pairs are shown with the larger side first. Unofficial; not a score."
          head={
            <tr>
              <th scope="col">Group</th>
              <th scope="col">Pair</th>
              <th scope="col">Range of the difference (95%)</th>
              <th scope="col">Point estimate</th>
            </tr>
          }
          rows={tableRows.map(({ r, g }) => (
            <tr key={`${r.a}${r.b}`}>
              <td>{g}</td>
              <td>{r.a} minus {r.b}</td>
              <td>{range1([r.lo, r.hi])}</td>
              <td>{r.separated ? fmt1(r.diff) : "not shown"}</td>
            </tr>
          ))}
        />
      }
    />
  );
}

/** More than 15 pairs: an alphabetical N by N separation matrix (dataviz G2). */
function PairMatrix({ wave, number, rows }: { wave: PilotWave; number: number; rows: PairRow[] }) {
  const ids = sortedSubjects(wave);
  const lookup = new Map(rows.map((r) => [pairKey(r.a, r.b), r.separated]));
  return (
    <figure className="pilot-fig" id="fig-pairs">
      <figcaption>
        <strong className="pf-cap-title">Figure {number}. Which differences are real: separation matrix.</strong>
        <span className="pf-cap-body">{STATUS_LINE(wave)} Each cell says whether the pilot separated that pair. Not separated does not mean equal. Alphabetical order carries no meaning.</span>
      </figcaption>
      <div className="pf-table-wrap" role="region" aria-label="Separation matrix, scrollable" tabIndex={0}>
        <DataTable
          caption="Separation matrix. Unofficial pilot; not a score."
          head={
            <tr>
              <th scope="col">Model</th>
              {ids.map((i) => <th key={i} scope="col">{i}</th>)}
            </tr>
          }
          rows={ids.map((a) => (
            <tr key={a}>
              <th scope="row">{a}</th>
              {ids.map((b) => <td key={b}>{a === b ? "—" : lookup.get(pairKey(a, b)) ? "separated" : "not separated"}</td>)}
            </tr>
          ))}
        />
      </div>
    </figure>
  );
}

// ===========================================================================
// G3
// ===========================================================================

export function DimensionFigure({ wave, number }: { wave: PilotWave; number: number }) {
  // An arms wave lists the primary arm's variants first, then the secondary arm's, alphabetical within an arm.
  const ids = panelSubjects(wave);
  const dims = DIMENSIONS.map((d) => d.code).filter((c) => c in wave.subjects[ids[0]].dimensions);
  must(dims.length === Object.keys(wave.subjects[ids[0]].dimensions).length, "a wave dimension code is missing from DIMENSIONS");
  const nameOf = (c: string) => DIMENSIONS.find((d) => d.code === c)?.name ?? c;
  const X0 = 150;
  const X1 = W - 24;
  // Ratings run 1 to 5 (no rating can be below 1), so the axis spans exactly that.
  const xs = (v: number) => X0 + ((v - 1) / 4) * (X1 - X0);
  const els: ReactNode[] = [];
  let y = 6;
  const descParts: string[] = [];
  dims.forEach((c) => {
    const counts = ids.map((i) => wave.subjects[i].dimension_item_counts[c]);
    const lo = Math.min(...counts);
    const hi = Math.max(...counts);
    const countText = lo === hi ? `${lo} items` : `${lo} to ${hi} items`;
    els.push(<SvgText key={`h${c}`} x={12} y={y + LH - 4} bold>{`${c} ${nameOf(c)} · ${countText}`}</SvgText>);
    y += LH + 2;
    ids.forEach((id, k) => {
      const iv = wave.subjects[id].dimension_intervals95[c];
      const mean = wave.subjects[id].dimensions[c];
      if (hasArms(wave) && k > 0 && isSecondaryArm(wave, id) !== isSecondaryArm(wave, ids[k - 1])) y += 6; // a small gap between the arms' panels
      els.push(
        <g key={`${c}${id}`}>
          <Glyph kind={shapeFor(wave, id)} cx={20} cy={y + 9} r={4} hollow={isSecondaryArm(wave, id)} />
          <SvgText x={32} y={y + 14}>{id}</SvgText>
          <HWhisker x1={xs(iv[0])} x2={xs(iv[1])} y={y + 9} capH={8} />
          {showsPoint(wave, id) && <Glyph kind={shapeFor(wave, id)} cx={xs(mean)} cy={y + 9} r={4} />}
        </g>,
      );
      y += 18;
    });
    descParts.push(`${c} ${nameOf(c)} (${countText}): ${ids.map((id) => `${id} ${range2(wave.subjects[id].dimension_intervals95[c])}`).join("; ")}`);
    y += 8;
  });
  const axisY = y + 2;

  // Predicate-generated annotations.
  const notes: string[] = [];
  const lowestEvery = dims.filter((c) => ids.every((i) => wave.subjects[i].dimensions[c] === Math.min(...Object.values(wave.subjects[i].dimensions))));
  if (lowestEvery.length === 1) {
    notes.push(`${nameOf(lowestEvery[0])} had the lowest mean of the ${numberWord(dims.length)} dimensions for every model. Read this first as a finding about the test.`);
  }
  const groups = wave.derived.not_separated_groups;
  if (groups.length === 1) {
    const g = new Set(groups[0]);
    const among = wave.dimension_pairwise.filter((p) => g.has(p.a) && g.has(p.b));
    const survived = among.filter((p) => p.bonferroni_separated).length;
    must(survived === wave.derived.dimension_bonferroni_separated_among_group && among.length === wave.derived.dimension_comparisons_among_group, "derived dimension comparison counts disagree with dimension_pairwise");
    notes.push(`Among the ${numberWord(g.size)} models the pilot could not tell apart, ${survived} of ${among.length} dimension comparisons survived the multiple-comparison correction.`);
  }
  if (hasArms(wave)) notes.push("Dimension comparisons cover the primary arm only. The secondary arm shows ranges only, with a hollow shape. A mean appears for a separated variant only.");
  notes.push("Ranges are 95% item-resampling ranges only. The correction is conservative; only corrected flags count as differences. Order carries no meaning.");
  notes.forEach((n, i) => checkText(`G3 note ${i + 1}`, n, wave));
  const noteLines = notes.flatMap((n) => wrapText(n));
  const noteY = axisY + 5 + 2 * LH + 6 + LH - 4;
  const footY = noteY + noteLines.length * LH + 6;
  const height = footY + footerHeight() + 4;

  const desc = `Ranges for each of ${dims.length} dimensions on the 1 to 5 rating scale, one row per model; a separated model also has a shape marker at its mean. ${descParts.join(". ")}. ${STATUS_LINE(wave)} Order carries no meaning.`;
  const title = "Unofficial pilot ranges by dimension and model, on the 1 to 5 rating scale.";
  checkText("G3 title", title, wave);
  checkText("G3 desc", desc, wave);
  const caption = `${STATUS_LINE(wave)} Each whisker is a 95% item-resampling range for one dimension. Models in a not-separated group show ranges only; a separated model also shows a shape at its mean. The axis is the full 1 to 5 rating scale. Few items support each dimension (the count is on each heading), so the ranges are wide. ${confoundSentence(wave)}`.trim();
  checkText("G3 caption", caption, wave);

  const svg = (
    <>
      <HAxis x0={X0} x1={X1} y={axisY} min={1} max={5} step={1} grid={axisY - 6} label="Rating scale, 1 to 5." />
      {els}
      <SvgLines x={12} y={noteY} lines={noteLines} sub />
      <Footer wave={wave} y={footY} />
    </>
  );
  return (
    <FigureFrame
      id="fig-dimensions"
      number={number}
      title="Dimension ranges, on the full 1 to 5 rating scale."
      caption={caption}
      svgTitle={title}
      svgDesc={desc}
      height={height}
      svg={svg}
      tableSummary="Data table: dimension ranges"
      table={
        <DataTable
          caption="Dimension ranges (95%), 1 to 5 rating scale, by model in alphabetical order. A mean appears for a separated model only. Unofficial; not a score."
          head={
            <>
              <tr>
                <th scope="col" rowSpan={2}>Dimension</th>
                <th scope="col" rowSpan={2}>Items</th>
                {ids.map((id) => (
                  <th key={id} scope="colgroup" colSpan={showsPoint(wave, id) ? 2 : 1}><ModelName id={id} wave={wave} /></th>
                ))}
              </tr>
              <tr>
                {ids.map((id) => (
                  <ColPair key={id} point={showsPoint(wave, id)} />
                ))}
              </tr>
            </>
          }
          rows={dims.map((c) => {
            const counts = ids.map((i) => wave.subjects[i].dimension_item_counts[c]);
            return (
              <tr key={c}>
                <th scope="row">{c} {nameOf(c)}</th>
                <td>{Math.min(...counts) === Math.max(...counts) ? counts[0] : `${Math.min(...counts)} to ${Math.max(...counts)}`}</td>
                {ids.flatMap((id) => [
                  <td key={`${id}r`}>{range2(wave.subjects[id].dimension_intervals95[c])}</td>,
                  ...(showsPoint(wave, id) ? [<td key={`${id}m`}>{wave.subjects[id].dimensions[c].toFixed(2)}</td>] : []),
                ])}
              </tr>
            );
          })}
        />
      }
    />
  );
}

function ColPair({ point }: { point: boolean }) {
  return (
    <>
      <th scope="col">Range</th>
      {point && <th scope="col">Point estimate (mean)</th>}
    </>
  );
}

// ===========================================================================
// G4
// ===========================================================================

export function LengthFigure({ wave, number }: { wave: PilotWave; number: number }) {
  // An arms wave: the primary arm's variants first, then the secondary arm's, alphabetical within an arm.
  const ids = panelSubjects(wave);
  const s = waveShape(wave);
  const words = ids.map((i) => wave.subjects[i].median_reply_words);
  const bounds = wave.length.composite_if_pooled_slope_removed;
  const slopes: Record<string, number | null> = wave.length.within_subject_slopes;
  const pooled = wave.length.pooled_within_item_slope;
  // A variant with one trial per item has no within-item slope (null in the wave): it is not drawn in panel B and the table says why.
  const slopeIds = ids.filter((id) => typeof slopes[id] === "number");
  const slopeOf = (id: string): number => slopes[id] as number;

  // ---- Panel A geometry
  const AX0 = 52;
  const AX1 = W - 24;
  const dmin = Math.min(...words) / 1.5;
  const dmax = Math.max(...words) * 1.25;
  const lx = (w: number) => AX0 + ((Math.log(w) - Math.log(dmin)) / (Math.log(dmax) - Math.log(dmin))) * (AX1 - AX0);
  const xticks: number[] = [];
  for (let v = 25; v <= dmax; v *= 2) if (v >= dmin) xticks.push(v);
  const LEVELS = ids.length > 6 ? 4 : 3;
  const zoneTop = 8 + LH + 6; // below the panel title
  const plotTop = zoneTop + LEVELS * LH + 10;
  const plotH = 170;
  const plotBot = plotTop + plotH;
  const vy = (c: number) => plotBot - (c / 100) * plotH;

  const order = [...ids].sort((p, q) => wave.subjects[p].median_reply_words - wave.subjects[q].median_reply_words);
  const level = new Map<string, number>();
  let prevX = -1e9;
  let prevLevel = -1;
  order.forEach((id) => {
    const x = lx(wave.subjects[id].median_reply_words);
    const lv = x - prevX < 110 ? (prevLevel + 1) % LEVELS : 0;
    level.set(id, lv);
    prevX = x;
    prevLevel = lv;
  });

  const aEls: ReactNode[] = [];
  aEls.push(<SvgText key="atitle" x={12} y={8 + LH - 4} bold>A. Between models: median reply length and range</SvgText>);
  [0, 25, 50, 75, 100].forEach((t) => {
    aEls.push(<line key={`yg${t}`} className="pf-grid" x1={AX0} x2={AX1} y1={vy(t)} y2={vy(t)} />);
    aEls.push(<SvgText key={`yt${t}`} x={AX0 - 6} y={vy(t) + 5} anchor="end" sub>{t}</SvgText>);
  });
  aEls.push(<line key="yaxis" className="pf-axis" x1={AX0} x2={AX0} y1={plotTop} y2={plotBot} />);
  xticks.forEach((t) => {
    aEls.push(<line key={`xt${t}`} className="pf-axis" x1={lx(t)} x2={lx(t)} y1={plotBot} y2={plotBot + 5} />);
    aEls.push(<SvgText key={`xl${t}`} x={lx(t)} y={plotBot + 5 + LH - 2} anchor="middle" sub>{t}</SvgText>);
  });
  aEls.push(<line key="xaxis" className="pf-axis" x1={AX0} x2={AX1} y1={plotBot} y2={plotBot} />);
  ids.forEach((id) => {
    const sub = wave.subjects[id];
    const x = lx(sub.median_reply_words);
    const [lo, hi] = sub.pilot_composite_interval95;
    const lv = level.get(id) ?? 0;
    const baseY = zoneTop + lv * LH + LH - 4;
    aEls.push(
      <g key={`pt${id}`}>
        <line className="pf-leader" x1={x} x2={x} y1={baseY + 3} y2={vy(hi)} />
        <Glyph kind={shapeFor(wave, id)} cx={x} cy={baseY - 5} r={5} hollow={isSecondaryArm(wave, id)} />
        <SvgText x={x - 10} y={baseY} anchor="end">{id}</SvgText>
        <VWhisker x={x} y1={vy(hi)} y2={vy(lo)} tick={showsPoint(wave, id) ? vy(sub.pilot_composite) : undefined} />
        {id in bounds && (
          <g>
            <line className="pf-dash" x1={x} x2={x} y1={vy(sub.pilot_composite)} y2={vy(bounds[id])} />
            <circle className="pf-ghost" cx={x} cy={vy(bounds[id])} r={6} />
          </g>
        )}
      </g>,
    );
  });
  const hasGhost = Object.keys(bounds).length > 0;
  let y = plotBot + 5 + 2 * LH;
  aEls.push(<SvgText key="xlabel" x={(AX0 + AX1) / 2} y={y} anchor="middle" sub>Median reply length, words (log scale). Range scale 0 to 100.</SvgText>);
  y += 6;
  const aNote = [
    hasGhost ? "Hollow marker: extreme bound if all between-model difference were length. Not an estimate." : "",
    "No line is fitted through the models.",
  ].filter(Boolean).join(" ");
  checkText("G4 panel A note", aNote, wave);
  const aNoteLines = wrapText(aNote);
  aEls.push(<SvgLines key="anote" x={12} y={y + LH - 4} lines={aNoteLines} sub />);
  y += aNoteLines.length * LH + 14;

  // ---- Panel B
  const bTitleY = y + LH - 4;
  y += LH + 6;
  const mmax = Math.max(0.25, Math.ceil(Math.max(...slopeIds.map((i) => Math.abs(slopeOf(i))), Math.abs(pooled)) * 4) / 4);
  const BX0 = 24;
  const BX1 = W - 24;
  const bx = (v: number) => BX0 + ((v + mmax) / (2 * mmax)) * (BX1 - BX0);
  const bTop = y + LH; // room for the pooled-line label
  const bEls: ReactNode[] = [];
  let by = bTop;
  slopeIds.forEach((id) => {
    bEls.push(
      <g key={`b${id}`}>
        <Glyph kind={shapeFor(wave, id)} cx={BX0 + 6} cy={by + 8} r={5} hollow={isSecondaryArm(wave, id)} />
        <SvgText x={BX0 + 18} y={by + 14}>{id}</SvgText>
        <Glyph kind={shapeFor(wave, id)} cx={bx(slopeOf(id))} cy={by + 28} r={6} hollow={isSecondaryArm(wave, id)} />
      </g>,
    );
    by += 40;
  });
  const bAxisY = by + 2;
  const pooledX = bx(pooled);
  const pooledLabelRight = pooledX < (BX0 + BX1) / 2;
  const posN = slopeIds.filter((i) => slopeOf(i) > 0).length;
  const negN = slopeIds.filter((i) => slopeOf(i) < 0).length;
  const allSmaller = slopeIds.every((i) => Math.abs(slopeOf(i)) < Math.abs(pooled));
  const noSlope = ids.filter((i) => !slopeIds.includes(i));

  const bSvg = (
    <>
      <SvgText x={12} y={bTitleY} bold>B. Within each model: slope of rating on reply length</SvgText>
      <HAxis x0={BX0} x1={BX1} y={bAxisY} min={-mmax} max={mmax} step={mmax > 1 ? 0.5 : 0.25} decimals={2} grid={bAxisY - bTop + 4} label="Rating points per e-fold of words (within an item)." />
      <line className="pf-zero" x1={bx(0)} x2={bx(0)} y1={bTop - 4} y2={bAxisY} />
      <line className="pf-dash" x1={pooledX} x2={pooledX} y1={bTop - 4} y2={bAxisY} />
      <SvgText x={pooledX + (pooledLabelRight ? 6 : -6)} y={bTop - 6} anchor={pooledLabelRight ? "start" : "end"} sub>pooled across models</SvgText>
      {bEls}
    </>
  );
  y = bAxisY + 5 + 2 * LH + 6;

  // ---- Panel B note + title predicate sentences
  const slopeClause = allSmaller
    ? `Within each model${noSlope.length ? " that has one" : ""} the slopes are small and ${posN > 0 && negN > 0 ? "mixed in sign" : posN > 0 ? "all positive" : "all negative"}, each smaller than the pooled slope.${noSlope.length ? " The secondary arm has one trial per item and no slope." : ""}`
    : "Within-model slopes are shown beside the pooled slope.";
  const lengthClause = s.oneApartFromOneGroup && s.separatedWroteShortest ? `${s.separated} was separated and also wrote the shortest replies. ` : "";
  const nonCausal = "This design cannot tell a real difference from a penalty on brief replies: reply length is an unresolved confound.";
  // An arms wave: what each build's length instruction did (pre-registered section 9), as a predicate over length_check; the readings stay in the table.
  const lc = wave.length_check?.per_build ?? [];
  const effective = lc.filter((r) => r.length_instruction === "effective").length;
  const ineffective = lc.filter((r) => r.length_instruction === "ineffective").length;
  must(effective + ineffective === lc.length, "a length verdict is neither effective nor ineffective");
  const instructionClause = lc.length ? `The length instruction moved the median reply closer to its target for ${numberWord(effective)} of ${numberWord(lc.length)} builds; for ${numberWord(ineffective)} it did not, so that build's second-arm comparison is uninformative about length.` : "";
  const bNote = `${lengthClause}${slopeClause} ${nonCausal}${instructionClause ? ` ${instructionClause}` : ""}`;
  checkText("G4 panel B note", bNote, wave);
  const bNoteLines = wrapText(bNote);
  const noteY = y + LH - 4;
  const footY = noteY + bNoteLines.length * LH + 6;
  const height = footY + footerHeight() + 4;

  const desc =
    `Panel A: each model's median reply length in words (log scale) against its 95% range on a 0 to 100 scale. ${ids.map((id) => `${id}: ${wave.subjects[id].median_reply_words} words, range ${range1(wave.subjects[id].pilot_composite_interval95)}`).join("; ")}. ` +
    `${hasGhost ? "A hollow marker shows the extreme bound for the separated model only. " : ""}No line is fitted. Panel B: each model's within-model slope against the pooled slope. ${STATUS_LINE(wave)}`;
  const title = "Unofficial pilot: reply length and range, between models and within each model.";
  checkText("G4 title", title, wave);
  checkText("G4 desc", desc, wave);
  const consistent = s.separated && s.directionConsistentAcrossJudges
    ? `Direction consistent across judges: every judge rated ${s.separated}’s replies below the item mean. `
    : s.separated && s.directionAboveAcrossJudges
      ? `Direction consistent across judges: every judge rated ${s.separated}’s replies above the item mean. `
      : "";
  const caption = `${STATUS_LINE(wave)} ${lengthClause}${slopeClause} ${consistent}${instructionClause ? `${instructionClause} ` : ""}Cause unresolved. The hollow marker, if shown, is an extreme bound, not an estimate. Panel A never appears without Panel B.`.replace(/\s+/g, " ");
  checkText("G4 caption", caption, wave);

  const svg = (
    <>
      {aEls}
      {bSvg}
      <SvgLines x={12} y={noteY} lines={bNoteLines} bold />
      <Footer wave={wave} y={footY} />
    </>
  );
  void FS;
  return (
    <FigureFrame
      id="fig-length"
      number={number}
      title={`Reply length and range${lengthClause ? ": the separated model also wrote the shortest replies" : ""}. Not a cause.`}
      caption={caption}
      svgTitle={title}
      svgDesc={desc}
      height={height}
      svg={svg}
      tableSummary="Data table: reply length, ranges, bound and slopes"
      table={
        <>
        <DataTable
          caption={`Reply length against range, by model, ${hasArms(wave) ? "primary arm first, then the secondary arm, alphabetical within each" : "in alphabetical order"}. The bound exists for the separated model only and is not an estimate. Unofficial; not a score.`}
          head={
            <tr>
              <th scope="col">Model</th>
              <th scope="col">Median reply words</th>
              <th scope="col">Range (95%)</th>
              <th scope="col">Point estimate</th>
              <th scope="col">Extreme bound if length removed (not an estimate)</th>
              <th scope="col">Within-model slope</th>
            </tr>
          }
          rows={[
            ...ids.map((id) => (
              <tr key={id}>
                <td><ModelName id={id} wave={wave} /></td>
                <td>{wave.subjects[id].median_reply_words}</td>
                <td>{range1(wave.subjects[id].pilot_composite_interval95)}</td>
                <td>{showsPoint(wave, id) ? fmt1(wave.subjects[id].pilot_composite) : "not shown"}</td>
                <td>{id in bounds ? fmt1(bounds[id]) : "not shown"}</td>
                <td>{typeof slopes[id] === "number" ? slopeOf(id).toFixed(3) : "not computed (one trial per item)"}</td>
              </tr>
            )),
            <tr key="pooled">
              <th scope="row" colSpan={5}>Pooled within-item slope, and correlation r (all models together)</th>
              <td>{pooled.toFixed(2)}; r = {wave.length.pooled_within_item_r.toFixed(2)}</td>
            </tr>,
          ]}
        />
        {lc.length > 0 && (
          <DataTable
            caption="Did the length instruction move each build's median reply toward its target? The pre-registered rule: the secondary arm must be closer to the target than the primary arm, or the build's second-arm comparison is uninformative about length. Unofficial; not a score."
            head={
              <tr>
                <th scope="col">Primary-arm variant</th>
                <th scope="col">Secondary-arm variant</th>
                <th scope="col">Target words</th>
                <th scope="col">Median words, primary arm</th>
                <th scope="col">Median words, secondary arm</th>
                <th scope="col">Length instruction</th>
                <th scope="col">Reading</th>
              </tr>
            }
            rows={lc.map((r) => (
              <tr key={r.arm_a}>
                <td>{r.arm_a}</td>
                <td>{r.arm_b}</td>
                <td>{r.target_words}</td>
                <td>{r.median_words_a}</td>
                <td>{r.median_words_b}</td>
                <td>{r.length_instruction}</td>
                <td>{r.b_minus_a_reading}</td>
              </tr>
            ))}
          />
        )}
        </>
      }
    />
  );
}

// ===========================================================================
// G5
// ===========================================================================

export function JudgeFigure({ wave, number }: { wave: PilotWave; number: number }) {
  // An arms wave: the primary arm's variants first, then the secondary arm's, alphabetical within an arm; the leniency grid has one block per arm.
  const subs = panelSubjects(wave);
  const blocks: string[][] = hasArms(wave) ? armNames(wave).map((a) => subjectsOfArm(wave, a)) : [subs];
  const judges = Object.keys(wave.judges).sort(alpha);
  const maxAbs = Math.max(0.25, Math.ceil(Math.max(...judges.flatMap((j) => [...Object.values(wave.judges[j].by_subject).map(Math.abs), Math.abs(wave.judges[j].leniency_vs_item_mean)])) * 4) / 4);
  const LBL = 112;
  const OVER = 84;
  const widest = Math.max(...blocks.map((b) => b.length));
  const cw = Math.min(62, Math.floor((W - 8 - LBL - OVER) / widest));
  const cells0 = LBL;
  const overX = cells0 + cw * blocks[0].length + 8;
  const rowH = 36;
  const signed = (v: number) => `${v >= 0 ? "+" : "−"}${Math.abs(v).toFixed(2)}`;

  const els: ReactNode[] = [];
  let y = 8;
  els.push(<SvgText key="atitle" x={12} y={y + LH - 4} bold>A. Judge leniency by model judged</SvgText>);
  y += LH + 8;
  const gridTop = y;
  blocks.forEach((block, bi) => {
    if (blocks.length > 1) {
      const head = `${armPanelName(wave, armNames(wave)[bi])}`;
      els.push(<SvgText key={`bh${bi}`} x={12} y={y + LH - 4} bold>{head}</SvgText>);
      y += LH + 4;
    }
    // Column headers: two lines, split after the first hyphen.
    block.forEach((id, i) => {
      const [h1, h2] = id.includes("-") ? [id.slice(0, id.indexOf("-") + 1), id.slice(id.indexOf("-") + 1)] : [id, ""];
      els.push(
        <SvgLines key={`ch${id}`} x={cells0 + i * cw + cw / 2} y={y + LH - 4} lines={[h1, h2].filter(Boolean)} anchor="middle" sub />,
      );
    });
    if (bi === 0) els.push(<SvgLines key="och" x={overX + OVER / 2 - 4} y={y + LH - 4} lines={["overall"]} anchor="middle" sub />);
    y += 2 * LH + 2;
    judges.forEach((j) => {
      els.push(<SvgText key={`jl${bi}${j}`} x={12} y={y + rowH / 2 + 5}>{j}</SvgText>);
      block.forEach((id, i) => {
        const x = cells0 + i * cw;
        const v = wave.judges[j].by_subject[id];
        els.push(<rect key={`c${j}${id}`} className="pf-cell" x={x} y={y} width={cw} height={rowH} />);
        if (id === j || v === undefined) {
          els.push(<rect key={`o${j}${id}`} className="pf-hatch" x={x} y={y} width={cw} height={rowH} />);
        } else {
          const half = cw / 2 - 5;
          const len = (Math.abs(v) / maxAbs) * half;
          els.push(
            <g key={`v${j}${id}`}>
              <SvgText x={x + cw / 2} y={y + 16} anchor="middle">{signed(v)}</SvgText>
              <line className="pf-axis" x1={x + cw / 2} x2={x + cw / 2} y1={y + 21} y2={y + 31} />
              <rect className="pf-fill" x={v >= 0 ? x + cw / 2 : x + cw / 2 - len} y={y + 23} width={Math.max(len, 1)} height={6} />
            </g>,
          );
        }
      });
      if (bi === 0) {
        const ov = wave.judges[j].leniency_vs_item_mean;
        const half = OVER / 2 - 8;
        const cx = overX + OVER / 2 - 4;
        const len = (Math.abs(ov) / maxAbs) * half;
        els.push(
          <g key={`ov${j}`}>
            <rect className="pf-cell" x={overX} y={y} width={OVER - 8} height={rowH} />
            <SvgText x={cx} y={y + 16} anchor="middle">{signed(ov)}</SvgText>
            <line className="pf-axis" x1={cx} x2={cx} y1={y + 21} y2={y + 31} />
            <rect className="pf-fill" x={ov >= 0 ? cx : cx - len} y={y + 23} width={Math.max(len, 1)} height={6} />
          </g>,
        );
      }
      y += rowH;
    });
    y += 6;
  });
  void gridTop;
  y += 8;
  const excluded = wave.design.excluded_judges.filter((id) => subs.includes(id));
  // Predicates over the wave: which of these statements is true depends on whether a judge is also a subject,
  // whether the wave has a separated model, and how the judge pairs were assigned (from routing).
  const judgeIsSubject = judges.some((j) => subs.includes(j));
  const hasSeparated = wave.derived.separated_subjects.length > 0;
  const pairCounts = Object.values(wave.routing as Record<string, { responses_by_judge_pair?: Record<string, number> }>).map((r) => Object.values(r.responses_by_judge_pair ?? {}).filter((n) => n > 0).length);
  const rotating = pairCounts.length > 0 && pairCounts.every((n) => n > 1);
  const notesA = [
    judgeIsSubject
      ? "Hatched cells: the judge never rated its own model. Bars run left for a rating below the item mean and right for above."
      : "No judge is also a model tested in this wave, so no cell is hatched. Bars run left for a rating below the item mean and right for above.",
    `Leniency is measured against the all-subject item mean, which includes ${hasSeparated ? "the separated model" : "the models judged"}, so positive values are partly an artefact. Read down a column.`,
    excluded.length ? `${excluded.join(", ")}: excluded as a judge${/post-hoc/i.test(wave.exclusion_record?.disclosure ?? "") ? " (post-hoc, see Deviations)" : ""}; still a subject.` : "",
    rotating
      ? "Each model's replies were rated by every pair of judges in turn, so no single judge pair decides a model's figures."
      : "One fixed judge pair rated each non-excluded model, so judge taste and model cannot be fully separated.",
  ].filter(Boolean);
  notesA.forEach((n, i) => checkText(`G5 panel A note ${i + 1}`, n, wave));
  const aLines = notesA.flatMap((n) => wrapText(n));
  els.push(<SvgLines key="anotes" x={12} y={y + LH - 4} lines={aLines} sub />);
  y += aLines.length * LH + 16;

  // Panel B: agreement
  els.push(<SvgText key="btitle" x={12} y={y + LH - 4} bold>B. Agreement between the two judges</SvgText>);
  y += LH + 10;
  const BX0 = 24;
  const BX1 = W - 24;
  const bx = (p: number) => BX0 + (p / 100) * (BX1 - BX0);
  const bTop = y;
  subs.forEach((id) => {
    const a = wave.subjects[id].judge_agreement;
    els.push(
      <g key={`bj${id}`}>
        <Glyph kind={shapeFor(wave, id)} cx={BX0 + 6} cy={y + 8} r={5} hollow={isSecondaryArm(wave, id)} />
        <SvgText x={BX0 + 18} y={y + 14}>{id}</SvgText>
        <SvgText x={BX1} y={y + 14} anchor="end" sub>{`MAD ${a.mean_absolute_difference.toFixed(2)} · ${a.responses_differing_by_2_or_more} differed by 2 or more`}</SvgText>
        <line className="pf-grid" x1={BX0} x2={BX1} y1={y + 28} y2={y + 28} />
        <Glyph kind={shapeFor(wave, id)} cx={bx(a.exact * 100)} cy={y + 28} r={6} hollow={isSecondaryArm(wave, id)} />
      </g>,
    );
    y += 40;
  });
  const axisY = y + 2;
  const chanceKnown = Object.values(wave.subjects).some((sj) => Object.keys(sj.judge_agreement).some((k) => /chance|baseline/i.test(k)));
  const bNote = `Exact agreement is the share of replies where both judges gave the same rating. MAD is the mean absolute difference in rating points. ${chanceKnown ? "" : "No chance-agreement baseline was measured in this wave."}`.trim();
  checkText("G5 panel B note", bNote, wave);
  const bLines = wrapText(bNote);
  const noteY = axisY + 5 + 2 * LH + 6 + LH - 4;
  const footY = noteY + bLines.length * LH + 6;
  const height = footY + footerHeight() + 4;

  const desc =
    `Panel A: judge leniency against the all-subject item mean, one row per judge and one column per model judged${judgeIsSubject ? ", own-model cells hatched" : ""}. ${judges.map((j) => `${j}: ${subs.filter((id) => id !== j && id in wave.judges[j].by_subject).map((id) => `${id} ${signed(wave.judges[j].by_subject[id])}`).join(", ")}; overall ${signed(wave.judges[j].leniency_vs_item_mean)}`).join(". ")}. ` +
    `Panel B: exact agreement between the two judges, by model judged. ${subs.map((id) => `${id} ${(wave.subjects[id].judge_agreement.exact * 100).toFixed(1)}%`).join("; ")}. ${STATUS_LINE(wave)}`;
  const title = "Unofficial pilot instrument health: judge leniency and agreement.";
  checkText("G5 title", title, wave);
  checkText("G5 desc", desc, wave);
  const caption = `${STATUS_LINE(wave)} Panel A is a check on the judges, not on the models. ${judgeIsSubject ? "Each judge rated the other models only. " : "No judge is also a model tested here. "}Positive leniency is partly an artefact of the comparison; see the note in the figure.`;
  checkText("G5 caption", caption, wave);

  const svg = (
    <>
      <defs>
        <pattern id="pf-hatch-pattern" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line className="pf-axis" x1="0" y1="0" x2="0" y2="6" />
        </pattern>
      </defs>
      {els}
      <HAxis x0={BX0} x1={BX1} y={axisY} min={0} max={100} step={25} grid={axisY - bTop} label="Exact agreement between the two judges, %" />
      <SvgLines x={12} y={noteY} lines={bLines} sub />
      <Footer wave={wave} y={footY} />
    </>
  );
  const routing = wave.routing as Record<string, { responses_by_judge_pair?: Record<string, number> }>;
  return (
    <FigureFrame
      id="fig-judges"
      number={number}
      title="Judges: leniency and agreement."
      caption={caption}
      svgTitle={title}
      svgDesc={desc}
      height={height}
      svg={svg}
      tableSummary="Data tables: judge leniency and agreement"
      table={
        <>
          <DataTable
            caption={`Judge leniency against the all-subject item mean, by model judged. ${judgeIsSubject ? "A blank cell is the judge's own model, never rated. " : ""}Unofficial; not a score.`}
            head={
              <tr>
                <th scope="col">Judge</th>
                {subs.map((id) => <th key={id} scope="col">{id}</th>)}
                <th scope="col">Overall</th>
              </tr>
            }
            rows={judges.map((j) => (
              <tr key={j}>
                <th scope="row">{j}</th>
                {subs.map((id) => <td key={id}>{id in wave.judges[j].by_subject ? signed(wave.judges[j].by_subject[id]) : "own model, not rated"}</td>)}
                <td>{signed(wave.judges[j].leniency_vs_item_mean)}</td>
              </tr>
            ))}
          />
          <DataTable
            caption="Agreement between the two judges, by model judged. Unofficial; not a score."
            head={
              <tr>
                <th scope="col">Model judged</th>
                <th scope="col">Judge pair(s)</th>
                <th scope="col">Exact agreement</th>
                <th scope="col">Mean absolute difference</th>
                <th scope="col">Replies differing by 2 or more</th>
              </tr>
            }
            rows={subs.map((id) => (
              <tr key={id}>
                <td><ModelName id={id} wave={wave} /></td>
                <td>{Object.keys(routing[id]?.responses_by_judge_pair ?? {}).sort(alpha).join("; ") || "Not measured in this wave"}</td>
                <td>{(wave.subjects[id].judge_agreement.exact * 100).toFixed(1)}%</td>
                <td>{wave.subjects[id].judge_agreement.mean_absolute_difference.toFixed(2)}</td>
                <td>{wave.subjects[id].judge_agreement.responses_differing_by_2_or_more}</td>
              </tr>
            ))}
          />
        </>
      }
    />
  );
}

export { shapeWord };
