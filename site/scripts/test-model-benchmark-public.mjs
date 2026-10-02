#!/usr/bin/env node
/**
 * test-model-benchmark-public.mjs -- the AI-readable surface of the model program is generated from the wave, manifest
 * and facts files, and agrees with them. Nothing here is a hand-typed count or list.
 *
 *   a) /data/model-benchmark/index.json   consistent with the manifest, the waves and the cb-probe facts
 *   b) llms.txt, llms-full.txt            current (build-llms.mjs --check), list every ratified report, caveats first
 *   c) markdown alternates                the compiled report and nothing else (no second figure path)
 *   d) .well-known descriptor             counts equal the facts; the index URL and reports are present
 *   e) /ai-models/reports index page      words and links only; newest first; no figure, no ranking language, no paid link
 *   f) AnalysisSection                    describes each published pilot from its own wave (no "up to 1 ... up to 1")
 *   g) the report page                    markdown alternate link, "Data and citation" block (source checks)
 *
 * Planted probes prove each consistency check can fail. Run from site/ (the model facts read process.cwd()).
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { createRequire, register } from "node:module";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { harness, SITE, WAVES_DIR } from "./lib/html-gate-harness.mjs";
import { loadWaves, withheldValues, textBlocks } from "./lib/model-report-html-gates.mjs";
import { reportsIndexRenders, REPORTS_INDEX_MIN } from "./lib/pilot-render-gate.mjs";
import { compileReport, lexiconProblems } from "./lib/model-report.mjs";
import { readDimensionNames } from "./lib/dimension-names.mjs";
import {
  buildModelBenchmarkIndex, dataDirs, loadFacts, loadRenderedReports, markdownUrlFor, patchWellKnown,
  pilotCaveats, reportMarkdown, reportUrlFor, separationWords, sortReports, waveUrlFor, INDEX_JSON_URL, LLMS_FULL_URL, REPORTS_INDEX_URL, notSeparatedMembers,
} from "./lib/model-benchmark-public.mjs";

process.chdir(SITE);
const h = harness("test-model-benchmark-public");
const NL = String.fromCharCode(10);
const { manifest } = loadWaves(WAVES_DIR);
const dirs = dataDirs(SITE);
const facts = loadFacts(SITE);
const alpha = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

// What renders in this build's rule: the decision rule AND a narrative on disk. The ratified subset is what the tracked files carry.
const rendered = loadRenderedReports(SITE, { modes: ["active", "preview"] });
const ratified = loadRenderedReports(SITE, { modes: ["active"] });
const indexRenders = reportsIndexRenders(manifest, process.env, { reportsDir: dirs.reports });
const clone = (x) => JSON.parse(JSON.stringify(x));
const tokensOf = (wave) => withheldValues(wave).memberComposites;

await h.check("at least one report renders (otherwise there is nothing to describe)", () => h.assert(rendered.length > 0, "no rendered report"));

// ----------------------------------------------------------------------------------------------------- a) index.json
h.section("a) /data/model-benchmark/index.json");
/** Consistency of an index object with the manifest, waves and facts. */
function indexProblems(idx, { reports, indexPage }) {
  const p = [];
  const sorted = sortReports(reports);
  if (idx.program?.official_scores !== false || idx.program?.comparability !== "none") p.push("program: official_scores must be false and comparability none");
  if (!/no model has an official score/i.test(idx.program?.status ?? "")) p.push("program.status does not say no model has an official score");
  const m = idx.methodology;
  if (m?.bank_version !== facts.bankVersion || m?.items_total !== facts.itemsTotal || m?.items_served_by_default !== facts.itemsServedDefault || m?.crisis_items_excluded_by_default !== facts.crisisItemsExcludedByDefault || m?.dimensions !== facts.dimensionCount || m?.trials_in_default_run !== facts.trialsInDefaultRun) p.push("methodology: bank version or item counts differ from cb-probe-facts");
  if (m?.url !== "https://compassionbenchmark.com/ai-models/methodology") p.push("methodology.url");
  const c = idx.cb_probe;
  if (c?.version !== facts.version || c?.tool_count !== facts.toolCount || JSON.stringify(c?.tools) !== JSON.stringify(facts.tools.map((t) => t.name)) || !String(c?.install_doc_url).includes("/ai-evaluation-suite")) p.push("cb_probe: version, tool list or install doc differ from cb-probe-facts");
  if (JSON.stringify((idx.pilot_reports ?? []).map((r) => r.run_id)) !== JSON.stringify(sorted.map((r) => r.wave.run_id))) p.push(`pilot_reports: [${(idx.pilot_reports ?? []).map((r) => r.run_id)}] is not the rendered reports newest first [${sorted.map((r) => r.wave.run_id)}]`);
  for (const r of idx.pilot_reports ?? []) {
    const src = sorted.find((x) => x.wave.run_id === r.run_id);
    if (!src) continue;
    const w = src.wave;
    const exp = { status: "unofficial pilot", official: false, comparability: w.comparability, date: w.report_date, report_url: reportUrlFor(w.run_id), markdown_url: markdownUrlFor(w.run_id), wave_url: waveUrlFor(w.run_id), title: src.title, access_tier: w.design.access_tier };
    for (const [k, v] of Object.entries(exp)) if (r[k] !== v) p.push(`${r.run_id}.${k}: "${r[k]}" differs from the source ("${v}")`);
    if (JSON.stringify(r.subjects.map((s) => s.label)) !== JSON.stringify([...w.design.subjects].sort(alpha))) p.push(`${r.run_id}.subjects are not the wave's subjects in alphabetical order`);
    if (r.subjects.some((s) => !s.provenance || Object.keys(s.provenance).length === 0)) p.push(`${r.run_id}: a subject has no provenance`);
    const g = r.separation;
    if (JSON.stringify(g.separated_subjects) !== JSON.stringify([...w.derived.separated_subjects].sort(alpha))) p.push(`${r.run_id}.separation.separated_subjects differ from derived`);
    if (JSON.stringify(g.not_separated_groups.map((x) => [...x].sort(alpha)).sort((a, b) => alpha(a[0], b[0]))) !== JSON.stringify(w.derived.not_separated_groups.map((x) => [...x].sort(alpha)).sort((a, b) => alpha(a[0], b[0])))) p.push(`${r.run_id}.separation.not_separated_groups differ from derived`);
    if (g.summary !== separationWords(w)) p.push(`${r.run_id}.separation.summary is not the words the wave yields`);
    if (JSON.stringify(g.point_estimates_withheld_for) !== JSON.stringify(notSeparatedMembers(w))) p.push(`${r.run_id}: point_estimates_withheld_for differs from the wave's own members`);
    if (!Array.isArray(r.caveats) || r.caveats.length < 5 || JSON.stringify(r.caveats) !== JSON.stringify(pilotCaveats(w))) p.push(`${r.run_id}.caveats differ from what the wave yields`);
    if (!r.caveats?.[0]?.startsWith("Unofficial pilot")) p.push(`${r.run_id}.caveats must start with the status caveat`);
    for (const t of [g.summary, ...(r.caveats ?? [])]) for (const q of lexiconProblems(t, w)) p.push(`${r.run_id}: lexicon ${q.rule}: ${q.message.slice(0, 80)}`);
    const sha = w.preregistration?.sha256 ?? w.design.preregistration_sha256;
    if ((sha ?? null) !== (r.preregistration_sha256 ?? null)) p.push(`${r.run_id}.preregistration_sha256 differs from the wave`);
    const text = JSON.stringify(r);
    for (const tok of tokensOf(w)) if (new RegExp(`(?<![0-9])${tok.replace(".", "\\.")}(?![0-9])`).test(text)) p.push(`${r.run_id}: a not-separated model's point ${tok} appears in the index`);
    if ("subjects" in r && r.subjects.some((s) => "pilot_composite" in s)) p.push(`${r.run_id}: a subject carries a figure`);
  }
  if ((idx.links?.reports_index ?? null) !== (indexPage ? REPORTS_INDEX_URL : null)) p.push("links.reports_index must be set exactly when the reports index page renders");
  if (idx.links?.llms_full_txt !== LLMS_FULL_URL) p.push("links.llms_full_txt");
  return p;
}
const index = buildModelBenchmarkIndex({ reports: rendered, facts, reportsIndexRenders: indexRenders });
h.clean("the index built from the manifest, waves and facts is consistent with them", indexProblems(index, { reports: rendered, indexPage: indexRenders }));
await h.check("the builder is deterministic", () => h.assert(JSON.stringify(buildModelBenchmarkIndex({ reports: rendered, facts, reportsIndexRenders: indexRenders })) === JSON.stringify(index), "two builds differ"));
await h.check("the index lists every rendered report once, newest first, with its three URLs", () => {
  h.assert(index.pilot_reports.length === rendered.length, "count");
  const dates = index.pilot_reports.map((r) => r.date);
  h.assert(JSON.stringify(dates) === JSON.stringify([...dates].sort().reverse()), "not newest first");
});
const pubIndex = join(SITE, "public", "data", "model-benchmark", "index.json");
if (existsSync(pubIndex)) {
  await h.check("the generated public/data/model-benchmark/index.json is current (prebuild output equals the builder)", () => h.assert(JSON.stringify(JSON.parse(readFileSync(pubIndex, "utf8"))) === JSON.stringify(index), "stale: run node scripts/export-model-wave-public.mjs"));
} else h.log("  SKIP generated index.json not present (run the prebuild)");
const base = (mut) => { const o = clone(index); mut(o); return indexProblems(o, { reports: rendered, indexPage: indexRenders }); };
h.trips("a drifted bank version", base((o) => { o.methodology.bank_version = "v0.0"; }), "methodology");
h.trips("a drifted item count", base((o) => { o.methodology.items_total += 1; }), "methodology");
h.trips("a drifted tool count", base((o) => { o.cb_probe.tool_count += 1; }), "cb_probe");
h.trips("a dropped report", base((o) => { o.pilot_reports.pop(); }), "pilot_reports");
h.trips("a status of official", base((o) => { o.pilot_reports[0].official = true; }), "official");
h.trips("a subject list that does not match the wave", base((o) => { o.pilot_reports[0].subjects.pop(); }), "subjects");
h.trips("a not-separated model's point in the index", base((o) => { o.pilot_reports[0].separation.summary += ` ${tokensOf(rendered[0].wave)[0]}`; }), "point");
h.trips("a caveat dropped", base((o) => { o.pilot_reports[0].caveats.pop(); }), "caveats");
h.trips("a reports index link that does not match the page", base((o) => { o.links.reports_index = o.links.reports_index ? null : REPORTS_INDEX_URL; }), "reports_index");

// ----------------------------------------------------------------------------------------------------- b) llms
h.section("b) llms.txt and llms-full.txt");
const llmsText = readFileSync(join(SITE, "public", "llms.txt"), "utf8");
const fullPath = join(SITE, "public", "llms-full.txt");
const check = spawnSync(process.execPath, [join(SITE, "scripts", "build-llms.mjs"), "--check"], { encoding: "utf8", cwd: SITE });
await h.check("llms.txt, llms-full.txt and the .well-known descriptor are what the build would write (build-llms.mjs --check)", () => h.assert(check.status === 0, (check.stderr || check.stdout || "no output").trim().slice(0, 200)));
/** The AI-models section of llms.txt lists the index, the full text and, for every ratified report, the report, its markdown and its data. */
function llmsListingProblems(text, reports, indexPage) {
  const p = [];
  const section = text.slice(text.indexOf("## AI models"), text.indexOf("## For AI agents"));
  if (!section.includes(INDEX_JSON_URL)) p.push("llms.txt does not list index.json");
  if (!section.includes(LLMS_FULL_URL)) p.push("llms.txt does not list llms-full.txt");
  if (section.includes(REPORTS_INDEX_URL + NL) !== indexPage) p.push(`llms.txt ${indexPage ? "lacks" : "lists"} the reports index page`);
  for (const r of reports) for (const u of [reportUrlFor(r.wave.run_id), markdownUrlFor(r.wave.run_id), waveUrlFor(r.wave.run_id)]) if (!section.includes(u)) p.push(`llms.txt does not list ${u}`);
  const listed = [...section.matchAll(/ai-models\/reports\/(pilot-[0-9-]+)/g)].map((m) => m[1]);
  for (const id of new Set(listed)) if (!reports.some((r) => r.wave.run_id === id)) p.push(`llms.txt lists a report that is not ratified and rendered: ${id}`);
  return p;
}
const ratifiedIndexPage = ratified.length >= REPORTS_INDEX_MIN;
h.clean("llms.txt lists the index, the full text, and every ratified report with its markdown and data", llmsListingProblems(llmsText, ratified, ratifiedIndexPage));
h.trips("a missing markdown line", llmsListingProblems(llmsText.split(markdownUrlFor(ratified[0].wave.run_id)).join("x"), ratified, ratifiedIndexPage), ".md");
h.trips("a missing index.json line", llmsListingProblems(llmsText.split(INDEX_JSON_URL).join("x"), ratified, ratifiedIndexPage), "index.json");
h.trips("a report that is not rendered", llmsListingProblems(llmsText.replace(reportUrlFor(ratified[0].wave.run_id), reportUrlFor("pilot-2099-01-01")), ratified, ratifiedIndexPage), "not ratified");
/** llms-full.txt: caveats first, ranges only for members, no member point. */
function fullProblems(text, reports) {
  const p = [];
  if (text.indexOf("## Read this first") < 0 || text.indexOf("## Read this first") > text.indexOf("## Method")) p.push("the 'Read this first' caveats must come before the method");
  if (text.indexOf("## Method") > text.indexOf("## Pilot reports")) p.push("the method must come before the pilot reports");
  for (const r of reports) {
    const w = r.wave;
    const start = text.indexOf(`(${w.run_id},`);
    if (start < 0) { p.push(`llms-full.txt lacks ${w.run_id}`); continue; }
    const block = text.slice(start, text.indexOf("Sources:", start));
    if (block.indexOf("Read these caveats first") < 0 || block.indexOf("Read these caveats first") > block.indexOf("What it found about separation")) p.push(`${w.run_id}: caveats must precede the findings`);
    for (const id of w.design.subjects) {
      const [lo, hi] = w.subjects[id].pilot_composite_interval95;
      if (!block.includes(`${id}: 95% range ${lo.toFixed(1)} to ${hi.toFixed(1)}`)) p.push(`${w.run_id}: ${id} lacks its 95% range`);
    }
    for (const tok of tokensOf(w)) if (new RegExp(`(?<![0-9])${tok.replace(".", "\\.")}(?![0-9])`).test(text)) p.push(`${w.run_id}: a not-separated model's point ${tok} is in llms-full.txt`);
    for (const id of w.derived.separated_subjects) if (new RegExp(`(?<![0-9])${w.subjects[id].pilot_composite.toFixed(1).replace(".", "\\.")}(?![0-9])`).test(block)) p.push(`${w.run_id}: llms-full.txt gives a point where only ranges are listed`);
  }
  return p;
}
if (existsSync(fullPath)) {
  const fullText = readFileSync(fullPath, "utf8");
  h.clean("llms-full.txt: caveats first, a range for every subject, no member point", fullProblems(fullText, ratified));
  h.trips("llms-full.txt with a member's point added", fullProblems(`${fullText}${NL}${tokensOf(ratified[0].wave)[0]}`, ratified), "point");
  h.trips("llms-full.txt with the caveats moved after the findings", fullProblems(fullText.replace("Read these caveats first", "Notes"), ratified), "caveats must precede");
  h.trips("llms-full.txt with a range removed", fullProblems(fullText.replace(/95% range [0-9.]+ to [0-9.]+/, "95% range"), ratified), "range");
} else await h.check("llms-full.txt exists", () => h.assert(false, "public/llms-full.txt is absent (run build-llms.mjs)"));

// ----------------------------------------------------------------------------------------------------- c) markdown
h.section("c) markdown alternates");
const dimensionNames = readDimensionNames();
function compiledFor(runId) {
  const wave = JSON.parse(readFileSync(join(dirs.waves, `${runId}.json`), "utf8"));
  const { errors, report } = compileReport({ md: readFileSync(join(dirs.reports, `${runId}.md`), "utf8"), wave, dimensionNames });
  if (errors.length) throw new Error(`${runId} does not compile: ${errors[0].message}`);
  return { wave, report };
}
/** The alternate is the compiled report and nothing else: its body is exactly the compiled sections. */
function markdownProblems(md, report, wave) {
  const p = [];
  const body = md.slice(md.indexOf(NL + "## ") + 1);
  const expected = report.sections.map((s) => `## ${s.title}${NL}${NL}${s.markdown.trim().split("](/").join("](https://compassionbenchmark.com/")}`).join(NL + NL) + NL;
  if (body !== expected) p.push("the markdown body is not exactly the compiled sections");
  if (md.includes("{{")) p.push("an unresolved token");
  if (!md.includes(`run_id: ${report.run_id}`) || !md.includes("status: unofficial pilot")) p.push("header lacks run_id or status");
  for (const tok of tokensOf(wave)) if (new RegExp(`(?<![0-9])${tok.replace(".", "\\.")}(?![0-9])`).test(md)) p.push(`a not-separated model's point ${tok} is in the markdown`);
  return p;
}
for (const r of rendered) {
  const { wave, report } = compiledFor(r.wave.run_id);
  const md = reportMarkdown(report, wave, r.title);
  h.clean(`${r.wave.run_id}: the markdown alternate is the compiled report (tokens resolved, no second figure path)`, markdownProblems(md, report, wave));
  await h.check(`${r.wave.run_id}: a published markdown file, when present, equals the build of the compiled report`, () => {
    const f = join(SITE, "public", "ai-models", "reports", `${r.wave.run_id}.md`);
    if (!existsSync(f)) return;
    h.assert(readFileSync(f, "utf8") === md, "stale: run node scripts/export-model-wave-public.mjs");
  });
  h.trips(`${r.wave.run_id}: an added sentence`, markdownProblems(md + NL + "An extra claim." + NL, report, wave), "exactly the compiled");
  h.trips(`${r.wave.run_id}: an unresolved token`, markdownProblems(md.replace("## ", "{{x}} ## "), report, wave), "token");
  h.trips(`${r.wave.run_id}: a member's point`, markdownProblems(md + NL + `${tokensOf(wave)[0]}`, report, wave), "point");
  await h.check(`${r.wave.run_id}: the compiled figure ledger covers every figure token in the source (the alternate adds none)`, () => h.assert(report.figure_ledger.length > 0 && !JSON.stringify(report.sections).includes("{{"), "ledger empty or token left"));
}

// ----------------------------------------------------------------------------------------------------- d) well-known
h.section("d) .well-known/compassion-benchmark.json");
const wkPath = join(SITE, "public", ".well-known", "compassion-benchmark.json");
const wk = JSON.parse(readFileSync(wkPath, "utf8"));
function wellKnownProblems(d, reports, indexPage) {
  const p = [];
  const i = d.instrument ?? {};
  const want = { bankVersion: facts.bankVersion, itemsTotal: facts.itemsTotal, itemsServedInDefaultRun: facts.itemsServedDefault, trialsInDefaultRun: facts.trialsInDefaultRun, dimensions: facts.dimensionCount, minimumTrialsPerItem: facts.minTrials, crisisItemsExcludedByDefault: facts.crisisItemsExcludedByDefault };
  if (facts.subdimensions?.available) want.subdimensions = facts.subdimensions.total;
  for (const [k, v] of Object.entries(want)) if (i[k] !== v) p.push(`instrument.${k} is ${i[k]} but the facts say ${v}`);
  if (d.mcp?.serverVersion !== facts.version) p.push(`mcp.serverVersion is ${d.mcp?.serverVersion} but the facts say ${facts.version}`);
  const mb = d.modelBenchmark ?? {};
  if (mb.index !== INDEX_JSON_URL) p.push("modelBenchmark.index is not the index.json URL");
  if (mb.llmsFull !== LLMS_FULL_URL) p.push("modelBenchmark.llmsFull");
  if ((mb.reportsIndex ?? null) !== (indexPage ? REPORTS_INDEX_URL : null)) p.push("modelBenchmark.reportsIndex does not match the reports index page");
  if (mb.officialScores !== false) p.push("modelBenchmark.officialScores must be false");
  const listed = (mb.pilotReports ?? []).map((r) => r.runId).join();
  if (listed !== sortReports(reports).map((r) => r.wave.run_id).join()) p.push(`modelBenchmark.pilotReports [${listed}] differs from the ratified reports`);
  for (const r of mb.pilotReports ?? []) if (r.report !== reportUrlFor(r.runId) || r.markdown !== markdownUrlFor(r.runId) || r.data !== waveUrlFor(r.runId) || r.status !== "unofficial pilot") p.push(`modelBenchmark.pilotReports.${r.runId} URLs or status`);
  if (JSON.stringify(d.honesty?.officialScore) !== "false" || d.honesty?.comparability !== "none") p.push("honesty.officialScore/comparability");
  return p;
}
h.clean("the descriptor's counts equal the facts, and it lists the index and every ratified report", wellKnownProblems(wk, ratified, ratifiedIndexPage));
await h.check("the descriptor equals the build's patch of itself (idempotent)", () => h.assert(JSON.stringify(patchWellKnown(wk, { facts, reports: ratified, reportsIndexRenders: ratifiedIndexPage })) === JSON.stringify(wk), "patchWellKnown changes the committed file"));
const wkMut = (m) => { const o = clone(wk); m(o); return wellKnownProblems(o, ratified, ratifiedIndexPage); };
h.trips("a hand-typed item count that drifted", wkMut((o) => { o.instrument.itemsTotal += 1; }), "itemsTotal");
h.trips("a drifted default-run count", wkMut((o) => { o.instrument.itemsServedInDefaultRun -= 1; }), "itemsServedInDefaultRun");
h.trips("a drifted server version", wkMut((o) => { o.mcp.serverVersion = "9.9.9"; }), "serverVersion");
h.trips("a missing index URL", wkMut((o) => { delete o.modelBenchmark.index; }), "index");
h.trips("a missing report", wkMut((o) => { o.modelBenchmark.pilotReports.pop(); }), "pilotReports");
h.trips("a report claiming to be official", wkMut((o) => { o.modelBenchmark.pilotReports[0].status = "official"; }), "status");

// ----------------------------------------------------------------------------------------------------- e,f) rendered components
h.section("e, f) the reports index page and the methodology analysis table, rendered");
register(pathToFileURL(join(SITE, "scripts", "lib", "tsx-render-loader.mjs")).href);
const req = createRequire(join(SITE, "package.json"));
const React = req("react");
const { renderToStaticMarkup } = req("react-dom/server");
const render = (C, props = {}) => renderToStaticMarkup(React.createElement(C, props));
const facts_ts = await import("@/lib/model-report-facts.ts");
const waveFacts = await import("@/lib/model-wave-facts.ts");

if (indexRenders) {
  const Page = (await import("@/app/ai-models/reports/page.pilotindex.tsx")).default;
  const html = render(Page);
  /** The reports index: newest first, every report once with its three links, words only. */
  function reportsPageProblems(htmlText, reports) {
    const p = [];
    const order = sortReports(reports).map((r) => r.wave.run_id);
    const at = order.map((id) => htmlText.indexOf(`id="report-${id}"`));
    if (at.some((x) => x < 0)) p.push("a report is missing from the index page");
    else if (at.some((x, i) => i > 0 && x < at[i - 1])) p.push("the reports are not listed newest first");
    for (const r of reports) {
      const id = r.wave.run_id;
      for (const href of [`/ai-models/reports/${id}`, `/ai-models/reports/${id}.md`, `/data/model-waves/${id}.json`]) if (!htmlText.includes(`href="${href}"`)) p.push(`${id}: no link to ${href}`);
      const w = r.wave;
      for (const tok of [...withheldValues(w).allComposites, ...withheldValues(w).allIntervalEnds]) if (new RegExp(`(?<![0-9])${tok.replace(".", "\\.")}(?![0-9])`).test(textBlocks(htmlText).join(NL))) p.push(`${id}: a model figure ${tok} on the index page`);
      if (!htmlText.includes(separationWords(w).slice(0, 40))) p.push(`${id}: the separation result in words is missing`);
    }
    if (/gumroad|\/pricing|\/purchase-research|\/enterprise|\/advisory|\/score-watch/i.test(htmlText.replace(/<nav[\s\S]*?<\/nav>/g, ""))) p.push("a paid link on the index page");
    if (/\b(?:top|best|worst|leads?|beats?|wins?|leaderboard|#1)\b/i.test(textBlocks(htmlText).join(" ").replace(/not a ranking|no ranking|carries no ranking/gi, ""))) p.push("ranking language on the index page");
    if (!/Unofficial pilot/.test(htmlText) || !/not a score/i.test(htmlText)) p.push("the page does not say unofficial pilot / not a score");
    return p;
  }
  h.clean("the reports index lists every rendered report newest first with report, markdown and data links; no figure, no ranking language, no paid link", reportsPageProblems(html, rendered));
  h.trips("a model figure planted on the index page", reportsPageProblems(html.replace("</main>", `<p>${tokensOf(rendered[0].wave)[0]}</p></main>`).replace("<section", `<p>${tokensOf(rendered[0].wave)[0]}</p><section`), rendered), "model figure");
  h.trips("ranking language planted", reportsPageProblems(html + "<p>The best model leads.</p>", rendered), "ranking language");
  h.trips("a paid link planted", reportsPageProblems(html + '<a href="https://example.gumroad.com/l/x">Buy</a>', rendered), "paid link");
  h.trips("a report removed from the page", reportsPageProblems(html.replace(`id="report-${rendered[0].wave.run_id}"`, 'id="x"'), rendered), "missing");
  await h.check("the page source is gated by the render rule (pilotindex extension, D-29a item 1: no reports index until two reports)", () => {
    const next = readFileSync(join(SITE, "next.config.ts"), "utf8");
    h.assert(/reportsIndexRenders\(manifest\)/.test(next) && /pilotindex\.tsx/.test(next), "next.config.ts does not gate the index route");
    h.assert(REPORTS_INDEX_MIN === 2, "the index threshold is not two");
    const sm = readFileSync(join(SITE, "src", "app", "sitemap.ts"), "utf8");
    h.assert(/reportsIndexRenders\(\)/.test(sm) && /ai-models\/reports`/.test(sm), "sitemap.ts does not add the index from the gate");
  });
} else h.log("  SKIP the reports index is not rendered by this build's gate");

// Analysis table: every published pilot described from its own wave.
const Analysis = (await import("@/components/model-benchmark/AnalysisSection.tsx")).default;
const analysisHtml = render(Analysis);
const analysisText = textBlocks(analysisHtml).join(NL);
const published = waveFacts.publishableWaves.map((e) => waveFacts.loadWave(e.run_id));
/** The conversation wording follows each pilot's own design. */
function analysisProblems(text, pilots) {
  const p = [];
  if (/up to 1\b/.test(text)) p.push('"up to 1" (a degenerate parts-of-one phrase)');
  if (/\b1 items shared a conversation/.test(text)) p.push('"1 items shared a conversation"');
  for (const w of pilots) {
    const max = w.design.items_per_conversation_max;
    if (max <= 1 && !/own fresh conversation/.test(text)) p.push(`${w.run_id}: one item per conversation is not described`);
    if (max > 1 && !text.includes(`parts of up to ${max}`)) p.push(`${w.run_id}: parts of up to ${max} is not described`);
    if (!text.includes(`Bank ${w.design.bank_version}: ${w.bank.items_total} items`)) p.push(`${w.run_id}: the bank row is missing`);
  }
  if (pilots.length > 1 && !/Pilot of /.test(text)) p.push("several pilots but no per-pilot label");
  return p;
}
h.clean("the analysis table describes each published pilot from its own wave (no 'up to 1')", analysisProblems(analysisText, published));
h.trips("a parts-of-one phrase planted", analysisProblems(analysisText + " parts of up to 1 and up to 1 items shared a conversation", published), "up to 1");
await h.check("the analysis table names no model and states no pilot figure", () => {
  const bad = [];
  for (const w of published) {
    for (const id of w.design.subjects) if (new RegExp(`(?<![A-Za-z0-9])${id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![A-Za-z0-9])`, "i").test(analysisText)) bad.push(id);
    for (const tok of [...withheldValues(w).allComposites, ...withheldValues(w).allIntervalEnds]) if (new RegExp(`(?<![0-9])${tok.replace(".", "\\.")}(?![0-9])`).test(analysisText)) bad.push(tok);
  }
  h.assert(bad.length === 0, `found ${bad.join(", ")}`);
});
await h.check("the sections no longer read the newest wave only", () => {
  const a = readFileSync(join(SITE, "src", "components", "model-benchmark", "AnalysisSection.tsx"), "utf8");
  const m = readFileSync(join(SITE, "src", "components", "model-benchmark", "McpServerSection.tsx"), "utf8");
  h.assert(!/latestWave\(/.test(a) && !/publishableWaves\[0\]/.test(a) && !/publishableWaves\[0\]/.test(m.replace(/pilots\[0\]/g, "")), "a section still reads the newest wave only");
});

// ----------------------------------------------------------------------------------------------------- g) report page + facts
h.section("g) report page: markdown alternate link and the Data and citation block");
const pageSrc = readFileSync(join(SITE, "src", "app", "ai-models", "reports", "[runId]", "page.pilot.tsx"), "utf8");
await h.check("the page declares the markdown alternate and renders the Data and citation block with links, citation and the pre-registration hash", () => {
  h.assert(/"text\/markdown":\s*markdownUrl\(runId\)/.test(pageSrc), "no text/markdown alternate in generateMetadata");
  h.assert(/Data and citation/.test(pageSrc) && /reportCitation\(wave/.test(pageSrc) && /preregistrationSha256/.test(pageSrc), "no Data and citation block");
  h.assert(/\/data\/model-waves\/\$\{wave\.run_id\}\.json/.test(pageSrc) && /markdownPath\(wave\.run_id\)/.test(pageSrc), "no download links");
});
for (const r of rendered) {
  const title = facts_ts.titleFromFrontMatter(compiledFor(r.wave.run_id).report.front_matter, r.wave.run_id);
  const c = facts_ts.reportCitation(asPilot(r.wave), title);
  await h.check(`${r.wave.run_id}: the citation has title, date, URL, run id and says unofficial pilot; links point at this run`, () => {
    for (const s of [title, facts_ts.dateLong(r.wave.report_date), reportUrlFor(r.wave.run_id), r.wave.run_id, "Unofficial pilot"]) h.assert(c.citation.includes(s), `citation lacks "${s}"`);
    h.assert(c.waveUrl === waveUrlFor(r.wave.run_id) && c.markdownUrl === markdownUrlFor(r.wave.run_id), "links");
    const sha = r.wave.preregistration?.sha256 ?? r.wave.design.preregistration_sha256 ?? null;
    h.assert(c.preregistrationSha256 === sha, "pre-registration hash differs from the wave");
    for (const tok of withheldValues(r.wave).allComposites) h.assert(!new RegExp(`(?<![0-9])${tok.replace(".", "\\.")}(?![0-9])`).test(c.citation), `a figure ${tok} in the citation`);
  });
}
h.finish();

function asPilot(w) { return { ...w, status: "pilot", official: false, comparability: "none" }; }
