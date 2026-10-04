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
import { syntheticWave, syntheticArmsWave } from "./lib/model-report-fixtures.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const SITE = join(HERE, "..");
const h = harness("test-model-pilot-figures");

register(pathToFileURL(join(HERE, "lib", "tsx-render-loader.mjs")).href);
const req = createRequire(join(SITE, "package.json"));
const React = req("react");
const { renderToStaticMarkup } = req("react-dom/server");
const figs = await import("@/components/model-benchmark/pilot/PilotFigures.tsx");
const kit = await import("@/components/model-benchmark/pilot/figure-kit.tsx");
const banner = (await import("@/components/model-benchmark/pilot/StatusBanner.tsx")).default;
const Card = (await import("@/components/model-benchmark/pilot/PilotSummaryCard.tsx")).default;
const facts = await import("@/lib/model-report-facts.ts");

const render = (C, props) => renderToStaticMarkup(React.createElement(C, props));
const asPilot = (w) => ({ ...w, status: "pilot", official: false, comparability: "none" });

const { manifest, waves } = loadWaves(WAVES_DIR);
await h.check("committed waves exist to render", () => h.assert(waves.length > 0, "none"));
const synthetic = asPilot(syntheticWave({ runId: "wave-2029-05-05", clusters: [[["orion1.5-9b", 40.1], ["vega2.0-3b", 42.0]]], dims: ["AWR", "EMP", "ACT", "EQU", "BND", "ACC", "SYS", "INT"], excluded: null, local: true, reversePairs: true, seed: 5 }));
const syntheticArms = asPilot(syntheticArmsWave({ dims: ["AWR", "EMP", "ACT", "EQU", "BND", "ACC", "SYS", "INT"] }));
const targets = [...waves.map((w) => [`committed ${w.run_id}`, asPilot(w)]), ["synthetic no-separated wave (dotted ids)", synthetic], ["synthetic arms wave", syntheticArms]];

const FIGURES = [["IntervalFigure", figs.IntervalFigure], ["PairFigure", figs.PairFigure], ["DimensionFigure", figs.DimensionFigure], ["LengthFigure", figs.LengthFigure], ["JudgeFigure", figs.JudgeFigure]];

for (const [label, wave] of targets) {
  h.section(`rendering ${label}`);
  const naming = makeNaming(wave);
  // Subjects that show a range only: a not-separated group's members and, in an arms wave (amendment 16), every secondary-arm variant.
  const members = wave.derived.point_withheld_subjects ?? wave.derived.not_separated_groups.flat();
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

  if (wave.derived.display_rule) {
    // ARMS wave (template amendment 16): one panel per arm, alphabetical within an arm, ranges only for the secondary arm, no point difference.
    const d = wave.derived;
    const text = (html) => html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
    const esc = (x) => x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const secondary = d.range_only_subjects;
    await h.check("panel order: the primary arm first, then the secondary arm, alphabetical within each (figure-kit.panelSubjects)", () => {
      const order = kit.panelSubjects(wave);
      const A = wave.design.subjects.filter((id) => !secondary.includes(id)).sort();
      h.assert(JSON.stringify(order) === JSON.stringify([...A, ...[...secondary].sort()]), `panel order ${order.join(", ")}`);
    });
    await h.check("the interval figure has a primary-arm panel then a secondary-arm panel, and the secondary arm says ranges only", () => {
      const t = text(parts.IntervalFigure);
      h.assert(t.indexOf("Primary arm") >= 0 && t.indexOf("Secondary arm") > t.indexOf("Primary arm"), "arm panels missing or out of order");
      h.assert(/Ranges only: no point and no ordering/.test(t), "the secondary arm is not said to be ranges only");
      for (const id of secondary) h.assert(new RegExp(`<td>Secondary arm: ranges only</td><td>${esc(id)} <span`).test(parts.IntervalFigure), `${id}: its table row is not in the secondary-arm group`);
      h.assert((parts.IntervalFigure.match(/pf-hollow/g) ?? []).length >= secondary.length, "secondary-arm variants are not drawn hollow");
    });
    await h.check("within each arm the variants are alphabetical in the interval figure's table", () => {
      const ids = [...parts.IntervalFigure.matchAll(/<td>[^<]*<\/td><td>([^<]+?) <span/g)].map((m) => m[1]);
      // The primary arm lists its groups (larger group first, alphabetical within); the secondary arm follows, alphabetical.
      const nA = ids.length - secondary.length;
      h.assert(JSON.stringify(ids.slice(nA)) === JSON.stringify([...secondary].sort()), `secondary-arm order ${ids.slice(nA).join(", ")}`);
      h.assert(JSON.stringify([...ids.slice(0, nA)].sort()) === JSON.stringify(wave.design.subjects.filter((id) => !secondary.includes(id)).sort()), "the primary arm's rows are not exactly its variants");
      const g = d.not_separated_groups[0];
      h.assert(JSON.stringify(ids.slice(0, g.length)) === JSON.stringify([...g].sort()), `the group is not first and alphabetical: ${ids.slice(0, g.length).join(", ")}`);
    });
    await h.check("the comparisons figure shows the pre-declared comparisons with both ranges, groups the pairs by what survived correction, and prints no point difference", () => {
      const html = parts.PairFigure;
      const t = text(html);
      h.assert(/Separated after correction/.test(t) && /Secondary arm, ranges only/.test(t) && /Secondary arm minus primary arm/.test(t), "a comparison group is missing");
      if (d.separated_uncorrected_only_pairs.length) h.assert(/Separated only without correction/.test(t), "the pairs separated only without correction are not their own group");
      h.assert((html.match(/pf-dash/g) ?? []).length >= d.separated_pairs.length, "the corrected range is not drawn");
      h.assert((html.match(/<td>not shown<\/td>/g) ?? []).length === wave.comparisons.length, "a comparison row prints a point estimate");
      for (const q of w.withheldDifferencePairs) h.assert(!new RegExp(`<td>[\\u2212-]?${esc(q.tok)}</td>`).test(html), `a point difference ${q.tok} of ${q.a} / ${q.b} is printed`);
    });
    await h.check("the dimension figure lists the primary arm's variants first, and prints a mean only for the separated variant", () => {
      const html = parts.DimensionFigure;
      const heads = [...html.matchAll(/<th scope="colgroup"[^>]*>([^<]+?) <span/g)].map((m) => m[1]);
      h.assert(JSON.stringify(heads) === JSON.stringify(kit.panelSubjects(wave)), `column order ${heads.join(", ")}`);
      h.assert((html.match(/Point estimate \(mean\)/g) ?? []).length === d.separated_subjects.length, "a mean column for a variant that shows ranges only");
    });
    await h.check("the length figure: slopes of one-trial variants are not computed, each build has a pre-registered length verdict, no bound for a withheld variant", () => {
      const html = parts.LengthFigure;
      h.assert((html.match(/not computed \(one trial per item\)/g) ?? []).length === secondary.length, "slope cells of the one-trial variants");
      for (const r of wave.length_check.per_build) h.assert(html.includes(`<td>${r.arm_a}</td><td>${r.arm_b}</td>`) && html.includes(`<td>${r.length_instruction}</td>`), `${r.arm_a}: verdict row`);
      const nEff = wave.length_check.per_build.filter((r) => r.length_instruction === "effective").length;
      h.assert(text(html).includes(`moved the median reply closer to its target for ${["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"][nEff]} of`), "the instruction clause is missing");
      for (const id of members) h.assert(!new RegExp(`${esc(id)} <span[^>]*>[^<]*</span></td><td>[^<]*</td><td>[^<]*</td><td>[^<]*</td><td>(?!not shown)`).test(html), `${id}: a bound or point in the length table`);
    });
    await h.check("the judge figure has one leniency block per arm", () => {
      const t = text(parts.JudgeFigure);
      h.assert(t.indexOf("Primary arm") >= 0 && t.indexOf("Secondary arm") > t.indexOf("Primary arm"), "arm blocks missing");
    });
    await h.check("no figure text uses an ordinal for an arm (the site's ordering-word rule): primary and secondary only", () => {
      for (const [n, html] of Object.entries(parts)) h.assert(!/(?:first|second|third) arm|(?:first|second)-arm/i.test(text(html)), `${n} says first/second arm`);
    });
  }
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
