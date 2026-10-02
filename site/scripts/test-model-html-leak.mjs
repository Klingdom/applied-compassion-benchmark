#!/usr/bin/env node
/**
 * test-model-html-leak.mjs -- template I: G19 (test:model-html-leak).
 *
 * Withheld values must never reach a built page (docs/AI_MODEL_ASSESSMENT_TEMPLATE.md A, amendment 2):
 *   - a not-separated model's point estimate appears NOWHERE (prose, tables, charts, attributes, JSON-LD);
 *   - a separated model's point estimate appears only in a table cell under a "Point estimate" header;
 *   - the length-removed bound appears only beside "not an estimate" / "extreme bound";
 *   - the point difference of a not-separated pair appears nowhere;
 *   - a not-separated model's dimension means are not in the dimension table;
 *   - no band name sits beside a model name;
 *   - outside the report, no per-model figure at all.
 * The values come from the wave file, never from a list typed here.
 *
 * Planted probes first (each trips the specific rule), then the real tree in site/out. Fail on zero.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { harness, haveOut, OUT_DIR, WAVES_DIR, TREE_ONLY } from "./lib/html-gate-harness.mjs";
import { leakProblems, withheldValues, loadWaves, aiModelsFiles, hasToken } from "./lib/model-report-html-gates.mjs";
import { makeNaming } from "./lib/model-report.mjs";
import { renderableEntries } from "./lib/pilot-render-gate.mjs";
import { goodReportHtml, plainIndexHtml, injectBody } from "./lib/model-report-html-fixtures.mjs";

const h = harness("test-model-html-leak");
const { manifest, waves } = loadWaves(WAVES_DIR);
await h.check("a committed wave exists to test against", () => h.assert(waves.length > 0, "no committed wave"));
// The full probe set below needs a wave with a separated model; a wave with none (every subject in one not-separated group) has its own section.
const wave = waves.find((x) => x.derived.separated_subjects.length > 0) ?? waves[0];
const w = withheldValues(wave);
if (!TREE_ONLY) {
await h.check("the wave has a not-separated group and a separated model (otherwise the probes prove nothing)", () => h.assert(w.members.length > 0 && w.sep.size > 0 && w.bounds.length > 0, "wave shape"));
const member = w.members[0];
const memberTok = wave.subjects[member].pilot_composite.toFixed(1);
const sepId = wave.derived.separated_subjects[0];
const sepTok = wave.subjects[sepId].pilot_composite.toFixed(1);
const boundTok = w.bounds[0];
const upair = w.unseparatedPairs[0];
const band = "Established";
const good = await goodReportHtml(wave);
const rep = (html) => leakProblems({ html, wave, kind: "report" });
const idx = (html) => leakProblems({ html, wave, kind: "index" });

h.section("G19 on a report page (planted probes)");
h.clean("a good report page: ranges only for the group, the separated point in its labelled cell", rep(good));
h.trips("a not-separated model's composite in prose", rep(injectBody(good, `<p>${member} reached ${memberTok} in the pilot.</p>`)), "G19-member-composite");
h.trips("a not-separated model's composite in the Point estimate cell", rep(good.replace("not shown", memberTok)), "G19-member-composite");
h.trips("a not-separated model's composite inside the SVG text", rep(injectBody(good, `<svg role="img"><text x="1" y="1">${memberTok}</text></svg>`)), "G19-member-composite");
h.trips("a not-separated model's composite in an aria-label", rep(injectBody(good, `<svg role="img" aria-label="${member} ${memberTok}"></svg>`)), "G19-member-composite");
h.trips("a not-separated model's composite in JSON-LD", rep(good.replace("</head>", `<script type="application/ld+json">${JSON.stringify({ "@type": "Report", abstract: `It was ${memberTok}.` })}</script></head>`)), "G19-member-composite");
h.trips("a not-separated model's composite in a heading", rep(injectBody(good, `<h3>${memberTok}</h3>`)), "G19-member-composite");
h.trips("a separated model's point in prose", rep(injectBody(good, `<p>${sepId} came in at ${sepTok}.</p>`)), "G19-point-outside-cell");
h.trips("a separated model's point in a Range cell", rep(good.replace(/(<td>)(\d+\.\d to \d+\.\d)(<\/td>)/, `$1${sepTok}$3`).replace(/<td>Separated<\/td><td>[^<]*<span>\(agent tier, snapshot unverified\)<\/span><\/td><td>[^<]*<\/td>/, `<td>Separated</td><td>${sepId}</td><td>${sepTok}</td>`)), "G19-point-outside-cell");
h.trips("a separated model's point in the SVG", rep(injectBody(good, `<svg role="img"><text>${sepTok}</text></svg>`)), "G19-point-outside-cell");
h.trips("the length bound with no qualifier", rep(injectBody(good, `<p>${sepId} would reach ${boundTok}.</p>`)), "G19-bound-unlabelled");
h.clean("the length bound beside \"not an estimate\" passes", rep(injectBody(good, `<p>The extreme bound is ${boundTok}, not an estimate.</p>`)));
h.trips("the length bound in a cell without an \"extreme bound\" header", rep(injectBody(good, `<table><thead><tr><th>Model</th><th>Other</th></tr></thead><tbody><tr><td>${sepId}</td><td>${boundTok}</td></tr></tbody></table>`)), "G19-bound-unlabelled");
h.clean("the length bound under an \"Extreme bound\" header passes", rep(injectBody(good, `<table><thead><tr><th>Model</th><th>Extreme bound (not an estimate)</th></tr></thead><tbody><tr><td>${sepId}</td><td>${boundTok}</td></tr></tbody></table>`)));
h.trips("a not-separated pair's point difference in a table row", rep(injectBody(good, `<table><thead><tr><th>Pair</th><th>Point estimate</th></tr></thead><tbody><tr><td>${upair.a} minus ${upair.b}</td><td>${upair.tok}</td></tr></tbody></table>`)), "G19-unseparated-difference");
h.trips("a not-separated pair's point difference in prose beside both names", rep(injectBody(good, `<p>${upair.a} minus ${upair.b} was ${upair.tok}.</p>`)), "G19-unseparated-difference");
h.trips("a band name beside a model name", rep(injectBody(good, `<p>${member} is ${band}.</p>`)), "G19-band-beside-model");
h.trips("a band name in a table cell with a model name", rep(injectBody(good, `<table><tbody><tr><td>${member}</td><td>${band}</td></tr></tbody></table>`)), "G19-band-beside-model");
h.clean("a band name with no model name nearby passes (the methodology may name bands)", rep(injectBody(good, `<p>The ${band} band starts at a fixed threshold.</p>`)));
const dimMean = Object.values(wave.subjects[member].dimensions)[0].toFixed(2);
const dimTable = (header, cell) => `<figure id="fig-dimensions"><table><thead><tr><th>Dimension</th><th>${member} (agent tier) ${header}</th></tr></thead><tbody><tr><td>AWR</td><td>${cell}</td></tr></tbody></table></figure>`;
h.trips("a not-separated model's dimension mean in the dimension table", rep(injectBody(good, dimTable("Range", dimMean))), "G19-member-dimension-mean");
h.trips("a not-separated model's dimension mean even under a Point estimate header", rep(injectBody(good, dimTable("Point estimate (mean)", dimMean))), "G19-member-dimension-mean");
h.clean("a not-separated model's dimension RANGE passes", rep(injectBody(good, dimTable("Range", "3.18 to 4.11"))));

h.section("G19 outside the report (planted probes)");
h.clean("a plain /ai-models page passes", idx(plainIndexHtml()));
h.trips("a composite on /ai-models", idx(plainIndexHtml(`<p>${sepTok}</p>`)), "G19-index-figure");
h.trips("a member composite on /ai-models", idx(plainIndexHtml(`<p>${memberTok}</p>`)), "G19-member-composite");
h.trips("an interval end on /ai-models", idx(plainIndexHtml(`<p>${wave.subjects[member].pilot_composite_interval95[0].toFixed(1)}</p>`)), "G19-index-figure");
h.trips("the bound on /ai-models", idx(plainIndexHtml(`<p>${boundTok}, not an estimate</p>`)), "G19-index-figure");
h.trips("a figure in the FAQ JSON-LD of /ai-models", idx(plainIndexHtml(`<script type="application/ld+json">${JSON.stringify({ "@type": "FAQPage", mainEntity: [{ "@type": "Question", name: "q", acceptedAnswer: { "@type": "Answer", text: `It is ${sepTok}.` } }] })}</script>`)), "G19-index-figure");
h.trips("a band name beside a model name on /ai-models", idx(plainIndexHtml(`<p>${member} is ${band}.</p>`)), "G19-band-beside-model");

// ---------------------------------------------------------------------------------------------------------
// A wave with NO separated model: every subject is a member of one not-separated group, so NO subject has a
// point estimate anywhere (report, /ai-models, payload). Run on the committed wave of that shape, and on a
// synthetic one whose subject ids carry dots.
// ---------------------------------------------------------------------------------------------------------
const { syntheticWave } = await import("./lib/model-report-fixtures.mjs");
const noSepWaves = [
  ...waves.filter((x) => x.derived.separated_subjects.length === 0).map((x) => [`committed ${x.run_id}`, x]),
  ["synthetic (dotted ids)", syntheticWave({ runId: "wave-2029-05-05", clusters: [[["orion1.5-9b", 40.1], ["vega2.0-3b", 42.0]]], dims: ["KIN", "LIS", "NOT", "PLA", "REF", "TRU"], excluded: null, local: true, reversePairs: true, seed: 5 })],
];
await h.check("at least one committed wave has no separated model (the planted probes below are then about the real second pilot)", () => h.assert(noSepWaves.some(([n]) => n.startsWith("committed")), "no committed wave without a separated model"));
for (const [label, wv] of noSepWaves) {
  const ww = withheldValues(wv);
  h.section(`G19 for a wave with no separated model: ${label}`);
  await h.check("every subject is a group member and there is nothing separated to show a point for", () => h.assert(ww.members.length === wv.derived.subject_count && ww.sep.size === 0 && ww.separatedComposites.length === 0, "wave shape"));
  const goodN = await goodReportHtml(wv);
  const repN = (html) => leakProblems({ html, wave: wv, kind: "report" });
  const idxN = (html) => leakProblems({ html, wave: wv, kind: "index" });
  h.clean("a good report page: ranges only for every subject, no point anywhere", repN(goodN));
  h.clean("a good /ai-models page passes", idxN(plainIndexHtml()));
  const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  for (const id of wv.design.subjects) {
    const tok = wv.subjects[id].pilot_composite.toFixed(1);
    const sensTok = wv.sensitivity.subjects[id].pilot_composite.toFixed(1);
    const dimMean = Object.values(wv.subjects[id].dimensions)[0].toFixed(2);
    const own = (html, text) => html.replace(new RegExp(`(${escRe(id)} <span>[^<]*</span></td><td>[^<]*</td><td>)not shown`), `$1${text}`);
    h.trips(`${id}: its point in the Point estimate cell of its own row`, repN(own(goodN, tok)), "G19-member-composite");
    h.trips(`${id}: its point in prose`, repN(injectBody(goodN, `<p>${id} reached ${tok} in the pilot.</p>`)), "G19-member-composite");
    h.trips(`${id}: its point in a heading`, repN(injectBody(goodN, `<h3>${tok}</h3>`)), "G19-member-composite");
    h.trips(`${id}: its point inside the SVG text`, repN(injectBody(goodN, `<svg role="img"><text x="1" y="1">${tok}</text></svg>`)), "G19-member-composite");
    h.trips(`${id}: its point in an aria-label`, repN(injectBody(goodN, `<svg role="img" aria-label="${id} ${tok}"></svg>`)), "G19-member-composite");
    h.trips(`${id}: its point in JSON-LD`, repN(goodN.replace("</head>", `<script type="application/ld+json">${JSON.stringify({ "@type": "Report", abstract: `It was ${tok}.` })}</script></head>`)), "G19-member-composite");
    h.trips(`${id}: its judge-sensitivity point in prose`, repN(injectBody(goodN, `<p>${id} moved to ${sensTok}.</p>`)), "G19-member-composite");
    h.trips(`${id}: its point on /ai-models`, idxN(plainIndexHtml(`<p>${tok}</p>`)), "G19-member-composite");
    h.trips(`${id}: its point in the FAQ JSON-LD of /ai-models`, idxN(plainIndexHtml(`<script type="application/ld+json">${JSON.stringify({ "@type": "FAQPage", mainEntity: [{ "@type": "Question", name: "q", acceptedAnswer: { "@type": "Answer", text: `It is ${tok}.` } }] })}</script>`)), "G19-member-composite");
    h.trips(`${id}: an end of its range on /ai-models`, idxN(plainIndexHtml(`<p>${wv.subjects[id].pilot_composite_interval95[0].toFixed(1)}</p>`)), "G19-index-figure");
    h.trips(`${id}: its dimension mean in the dimension table (even under a Point estimate header)`, repN(injectBody(goodN, `<figure id="fig-dimensions"><table><thead><tr><th>Dimension</th><th>${id} (tier) Point estimate (mean)</th></tr></thead><tbody><tr><td>KIN</td><td>${dimMean}</td></tr></tbody></table></figure>`)), "G19-member-dimension-mean");
    h.clean(`${id}: its own 95% range in prose passes`, repN(injectBody(goodN, `<p>${id} has a range of ${wv.subjects[id].pilot_composite_interval95[0].toFixed(1)} to ${wv.subjects[id].pilot_composite_interval95[1].toFixed(1)}.</p>`)));
  }
  // A percent that shares its digits with a withheld point (a different statistic on the same page) is a rate on a page that is
  // not the report; the same digits beside a model's name, or on the report itself, are still a leak.
  {
    const id0 = wv.design.subjects[0];
    const tok0 = wv.subjects[id0].pilot_composite.toFixed(1);
    h.clean("a rate written as a percent that coincides with a point, on /ai-models, naming no model, passes", idxN(plainIndexHtml(`<p>Three runs identified some scenarios: ${tok0}% against a chance baseline.</p>`)));
    h.trips("the same percent beside a model's name on /ai-models", idxN(plainIndexHtml(`<p>${id0} scored ${tok0}% here.</p>`)), "G19-member-composite");
    h.trips("the same percent on the report page itself (no exemption)", repN(injectBody(goodN, `<p>The pilot gave ${tok0}% overall.</p>`)), "G19-member-composite");
    h.check("hasToken: a point is found bare, found in a prose percent beside a model, and a longer number is not a hit", () => {
      const nm = makeNaming(wv);
      h.assert(hasToken(`value ${tok0} here`, tok0, { naming: nm, allowPercent: true }), "bare point missed");
      h.assert(hasToken(`${id0}: ${tok0}%`, tok0, { naming: nm, allowPercent: true }), "percent beside a model missed");
      h.assert(!hasToken(`${tok0}5 and 1${tok0}`, tok0, { naming: nm, allowPercent: true }), "a longer number was taken for the point");
    });
  }
  // The group's own extremes are its members' points: the derived "range of the group" must not be printed either.
  const gr = wv.derived.not_separated_group_range;
  h.trips("the range of the group's points printed in prose (for a group of two it is both points)", repN(injectBody(goodN, `<p>The group ran from ${gr[0].toFixed(1)} to ${gr[1].toFixed(1)}.</p>`)), "G19-member-composite");
}

}

h.section("the built tree in site/out");
if (haveOut(h)) {
  const rendering = new Map(renderableEntries(manifest, process.env).map((x) => [x.entry.run_id, x.mode]));
  const files = aiModelsFiles(OUT_DIR);
  let examined = 0;
  for (const wv of waves) {
    const wk = withheldValues(wv);
    for (const f of files) {
      const text = readFileSync(join(OUT_DIR, f), "utf8");
      if (f.endsWith(".txt") || f.endsWith(".md")) { // RSC payloads and the markdown alternates (the machine-leak test applies the full machine rules to the .md files too)
        // RSC payloads: the strict, context-free rule (a member's composite, any wave) applies.
        await h.check(`${f} (payload, ${wv.run_id})`, () => {
          // A rate written as a percent that shares its digits with a withheld value (a self-run statistic, say) is not a score; a model named beside it still is.
          const bad = wk.memberComposites.filter((tok) => hasToken(text, tok, { naming: makeNaming(wv), allowPercent: !f.startsWith("ai-models/reports/") }));
          h.assert(bad.length === 0, `member composite(s) ${bad.join(", ")} in the payload`);
        });
        examined += 1;
        continue;
      }
      const isThisReport = f === `ai-models/reports/${wv.run_id}.html`;
      await h.check(`${f} (${wv.run_id})`, () => {
        const p = leakProblems({ html: text, wave: wv, kind: isThisReport ? "report" : "index" });
        h.assert(p.length === 0, p.slice(0, 6).join(" | "));
      });
      examined += 1;
    }
  }
  await h.check("fail-on-zero: pages were examined", () => h.assert(examined > 0, "examined nothing"));
  h.log(`  info ${examined} page(s)/payload(s) examined; rendering: ${[...rendering.keys()].join(", ") || "none (default build)"}`);
}
h.finish();
