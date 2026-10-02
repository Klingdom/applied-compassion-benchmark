#!/usr/bin/env node
/**
 * test-model-pilot-figures.mjs -- the pilot figures, the status banner and the /ai-models card, RENDERED for real.
 *
 * The other model tests prove the gates on synthetic HTML. This one renders the actual React components
 * (src/components/model-benchmark/pilot/*) with react-dom/server for every committed wave and for a synthetic wave of the
 * second pilot's shape (no separated model, dotted subject ids, local pinned builds, judges of another family), then:
 *
 *   - every figure renders without a failed predicate or a copy-rule failure (those throw at build time);
 *   - the rendered figures, banner and tables pass the leak gate: no group member has a point estimate in any figure, table
 *     cell, caption or attribute; a planted point in the real markup is caught (so the scan is not vacuous);
 *   - the banner passes G5; the in-figure footer names the JUDGES' family; the access tier reads right;
 *   - the card lists every published pilot, newest first, with its own link, and carries no model name or figure.
 *
 * `npm run build` is the production render; this is its fast, no-bundler counterpart. Types are checked by `tsc --noEmit`.
 */
import { register } from "node:module";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { harness, WAVES_DIR } from "./lib/html-gate-harness.mjs";
import { leakProblems, bannerProblems, loadWaves, withheldValues } from "./lib/model-report-html-gates.mjs";
import { makeNaming } from "./lib/model-report.mjs";
import { syntheticWave } from "./lib/model-report-fixtures.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const SITE = join(HERE, "..");
const h = harness("test-model-pilot-figures");

register(pathToFileURL(join(HERE, "lib", "tsx-render-loader.mjs")).href);
const req = createRequire(join(SITE, "package.json"));
const React = req("react");
const { renderToStaticMarkup } = req("react-dom/server");
const figs = await import("@/components/model-benchmark/pilot/PilotFigures.tsx");
const banner = (await import("@/components/model-benchmark/pilot/StatusBanner.tsx")).default;
const Card = (await import("@/components/model-benchmark/pilot/PilotSummaryCard.tsx")).default;
const facts = await import("@/lib/model-report-facts.ts");

const render = (C, props) => renderToStaticMarkup(React.createElement(C, props));
const asPilot = (w) => ({ ...w, status: "pilot", official: false, comparability: "none" });

const { manifest, waves } = loadWaves(WAVES_DIR);
await h.check("committed waves exist to render", () => h.assert(waves.length > 0, "none"));
const synthetic = asPilot(syntheticWave({ runId: "wave-2029-05-05", clusters: [[["orion1.5-9b", 40.1], ["vega2.0-3b", 42.0]]], dims: ["AWR", "EMP", "ACT", "EQU", "BND", "ACC", "SYS", "INT"], excluded: null, local: true, reversePairs: true, seed: 5 }));
const targets = [...waves.map((w) => [`committed ${w.run_id}`, asPilot(w)]), ["synthetic no-separated wave (dotted ids)", synthetic]];

const FIGURES = [["IntervalFigure", figs.IntervalFigure], ["PairFigure", figs.PairFigure], ["DimensionFigure", figs.DimensionFigure], ["LengthFigure", figs.LengthFigure], ["JudgeFigure", figs.JudgeFigure]];

for (const [label, wave] of targets) {
  h.section(`rendering ${label}`);
  const naming = makeNaming(wave);
  const members = wave.derived.not_separated_groups.flat();
  const parts = {};
  for (const [name, C] of FIGURES) {
    await h.check(`${name} renders (no failed predicate, no copy-rule failure)`, () => {
      parts[name] = render(C, { wave, number: 1 });
      h.assert(parts[name].includes("<svg") || parts[name].includes("<table"), "no svg or table in the output");
    });
  }
  parts.banner = render(banner, { wave });
  const page = `<main>${parts.banner}<article>${FIGURES.map(([n]) => parts[n] ?? "").join("")}</article></main>`;
  h.clean("the rendered figures and banner pass the leak gate (ranges only for every group member)", leakProblems({ html: page, wave, kind: "report" }));
  h.clean("the rendered banner passes G5 (labelled region, first in main, says unofficial, not a ranking, no cross-model comparison)", bannerProblems(page));

  // A planted point in the REAL markup is caught: the scan examines what the components produce.
  const w = withheldValues(wave);
  for (const id of members) {
    const tok = wave.subjects[id].pilot_composite.toFixed(1);
    h.trips(`${id}: a point planted in the rendered interval figure`, leakProblems({ html: page.replace("</article>", `<p>${id} reached ${tok}.</p></article>`), wave, kind: "report" }), "G19-member-composite");
    await h.check(`${id}: its row in the interval figure's table shows a range and no point ("not shown")`, () => {
      const row = new RegExp(`<tr><td>[^<]*</td><td>${id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")} <span[^>]*>[^<]*</span></td><td>[^<]*</td><td>([^<]*)</td></tr>`).exec(parts.IntervalFigure ?? "");
      h.assert(row && row[1] === "not shown", `row: ${row ? row[1] : "not found"}`);
    });
  }
  await h.check("the in-figure footer names the judges' family and the access tier (never 'Same-family' for a wave that proves its judge family)", () => {
    const jf = facts.judgeFamilyName(wave);
    const svgText = (parts.IntervalFigure ?? "").replace(/<[^>]+>/g, " ");
    if (wave.judge_set) h.assert(jf && svgText.includes(`${jf}-family judges`), `footer lacks "${jf}-family judges"`);
    h.assert(svgText.includes(facts.accessTierLabel(wave)), "footer lacks the access tier label");
    h.assert(!/Same-family judges/.test(svgText) || !wave.judge_set, "footer says Same-family for a wave with a proven judge family");
  });
  await h.check("the judge figure does not claim hatched own-model cells or a fixed pair where the wave shows neither", () => {
    const text = (parts.JudgeFigure ?? "").replace(/<[^>]+>/g, " ");
    const judgeIsSubject = Object.keys(wave.judges).some((j) => wave.design.subjects.includes(j));
    if (!judgeIsSubject) h.assert(!/Hatched cells: the judge never rated its own model/.test(text) && /No judge is also a model tested/.test(text), "hatching claimed for a wave where no judge is a subject");
    const rotating = facts.pilotPageFacts && Object.values(wave.routing).every((r) => Object.keys(r.responses_by_judge_pair ?? {}).length > 1);
    if (rotating) h.assert(!/One fixed judge pair rated each/.test(text), "a fixed pair claimed for a wave with rotating pairs");
  });
  if (wave.derived.separated_subjects.length === 0) {
    await h.check("no separated model: the pair figure has no 'Separated' group and prints no point difference", () => {
      const text = (parts.PairFigure ?? "").replace(/<[^>]+>/g, " ");
      h.assert(!/Separated: no range includes zero/.test(text), "a Separated group is drawn");
      const q = wave.pairwise[0];
      h.assert(!(parts.PairFigure ?? "").includes(`>${Math.abs(q.difference).toFixed(1)}<`), "a point difference of the not-separated pair is printed");
      h.assert(w.sep.size === 0, "withheldValues sees a separated subject");
    });
  }
  void naming;
}

h.section("the /ai-models card lists every published pilot, newest first, with no figure");
{
  const rendered = manifest.map((e) => ({ wave: asPilot(waves.find((x) => x.run_id === e.run_id)), report: { word_count: 3000, sections: [{ id: "not-scores", html: "<ul><li>a</li><li>b</li><li>c</li></ul>" }] } }));
  const pf = facts.pilotsPageFacts(rendered);
  const html = render(Card, { facts: pf, previewRunIds: [] });
  await h.check("one panel and one link per pilot, in manifest order (newest first)", () => {
    const at = manifest.map((e) => html.indexOf(`href="/ai-models/reports/${e.run_id}"`));
    h.assert(at.every((i) => i >= 0), `a pilot link is missing: ${at}`);
    h.assert(at.every((i, k) => k === 0 || at[k - 1] < i), `links are not in manifest order: ${at}`);
    for (const e of manifest) h.assert((html.match(new RegExp(`Pilot of [^<]*\\(${e.run_id}\\)`, "g")) ?? []).length === 1, `${e.run_id} is not listed exactly once`);
  });
  await h.check("the card carries no model name, no figure of any wave, and no ranking word", () => {
    const bad = [];
    for (const wv of waves) {
      for (const m of makeNaming(wv).mentions(html.replace(/<[^>]+>/g, " "))) bad.push(`${m.id} named`);
      bad.push(...leakProblems({ html, wave: wv, kind: "index" }).map((x) => x.slice(0, 80)));
    }
    h.assert(bad.length === 0, bad.slice(0, 3).join(" | "));
    h.assert(!/\b(?:best|worst|top|leads?|beats?|wins?|ahead|behind|leaderboard)\b/i.test(html.replace(/<[^>]+>/g, " ")), "ranking language in the card");
  });
  await h.check("a preview run shows its PREVIEW strip on that pilot only", () => {
    const one = render(Card, { facts: pf, previewRunIds: [manifest[0].run_id] });
    h.assert((one.match(/PREVIEW/g) ?? []).length === 1, "the strip is not on exactly one pilot");
  });
}

h.finish();
