#!/usr/bin/env node
/**
 * test-model-dashboard.mjs -- the AI Model Compassion Dashboard (/ai-models/dashboard, /ai-models/dashboard/<run_id>).
 * PRD tests T1 to T12 (docs/ai-dashboard/PRD_AI_MODEL_DASHBOARD.md section 11), minus the ones that need a browser
 * (T2 five hash-state views, T11 axe and keyboard path, T12 Lighthouse): scripts/smoke-model-dashboard.mjs runs those.
 *
 *   copy        no digit in the copy module, the template D lexicon over every string, reading level
 *   core        blocks ("Not separated" first), hash state (12+ malformed fixtures), rows, "Not measured yet" both ways, official wave ignored
 *   render      the real components, rendered for every committed wave and for synthetic waves, then held to
 *               G19 (dashboard kind = the report's rules L1 to L6), G20 (title, meta, JSON-LD), the dashboard's own structure rules,
 *               the lexicon, chart = table, one wave per page, the default (no-JS) view, size budgets
 *   probes      planted violations in the REAL markup: a withheld point, a band word, a rank word, Dataset JSON-LD, a sort control,
 *               a weight slider, a second wave, a missing label, a wrong block order. Each must FAIL; the clean page passes.
 *   props       the client island's props and the static downloads carry no withheld value (a planted one is caught)
 *   source      the dashboard source never reads analysis.json, research/model-runs or a raw wave
 *   gate        the dashboard's OWN gate (D-29b ratified status or CB_PREVIEW_DASHBOARD=1; independent of the pilot-report gate), in fixture mode:
 *               closed by default (0 entries, 0 sitemap entries, no link), open on preview or a ratified status, with negative controls
 *   tree        the built tree in site/out: route gate, downloads, sitemap, link from /ai-models, every page, JS budget
 *
 * `--tree-only` (build chain, Node 20 in Docker has no TypeScript stripping): only the built tree. `--require-out`: absence of out/ fails.
 */
import { register } from "node:module";
import { createRequire } from "node:module";
import { gzipSync } from "node:zlib";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { harness, haveOut, OUT_DIR, WAVES_DIR, TREE_ONLY, SITE } from "./lib/html-gate-harness.mjs";
import { leakProblems, loadWaves, withheldValues, reportedWaves, listFiles } from "./lib/model-report-html-gates.mjs";
import {
  dashboardSeoProblems, dashboardStructureProblems, dashboardLexiconProblems, chartTableProblems, dashboardTreeProblems, dashboardSitemapProblems,
  dashboardHtmlFiles, dashboardFiles, figureLabelOf, DASHBOARD_PATH, SITE_URL,
} from "./lib/model-dashboard-html-gates.mjs";
import { machineTextProblems, ownerWaveOf } from "./lib/model-machine-leak.mjs";
import { lexiconProblems, makeNaming } from "./lib/model-report.mjs";
import { projectWavePublic } from "./lib/model-benchmark-public.mjs";
import { renderableEntries } from "./lib/pilot-render-gate.mjs";
import { dashboardEntries, dashboardGateMode, loadDashboardDecision, DASHBOARD_PREVIEW_ENV } from "./lib/dashboard-render-gate.mjs";
import * as core from "./lib/model-dashboard-core.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const h = harness("test-model-dashboard");
const { manifest, waves } = loadWaves(WAVES_DIR);
const REPORTS_DIR = join(SITE, "src", "data", "model-benchmark", "reports");
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const monthYear = (iso) => `${MONTHS[Number(iso.slice(5, 7)) - 1]} ${iso.slice(0, 4)}`;
const GZIP_HTML_MAX = 150 * 1024; // PRD section 9: default view HTML at most 150 KB gzip
const PROPS_MAX = 120 * 1024; // props for the island at most 120 KB uncompressed
const JS_GZIP_MAX = 60 * 1024; // explorer JS at most 60 KB gzip

// ---------------------------------------------------------------------------
// Downloads: held to the same withholding rule as a page. The rows are the projection's, so a withheld value cannot be in them;
// these checks prove it for a file as written (and a planted point is caught).
// ---------------------------------------------------------------------------
function downloadProblems({ csv, json, wave }) {
  const p = [];
  const sep = new Set(wave.derived.separated_subjects);
  const w = withheldValues(wave);
  p.push(...machineTextProblems({ text: csv, wave, label: "download CSV", owner: wave }));
  const data = JSON.parse(json);
  if (!/not a score/.test(data.meta?.label ?? "") || !data.meta?.run_id || !data.meta?.licence) p.push("DASH-download-meta: JSON meta lacks the label, run id or licence");
  if (!/^# Unofficial pilot/.test(csv) || !/comparability none/.test(csv.split("\n")[0] + csv.split("\n")[1])) p.push("DASH-download-meta: CSV header lines lack the label");
  const members = new Set(w.members);
  for (const r of data.rows) {
    if (r.point_estimate !== null && !(sep.has(r.subject) && r.point_state === "value" && r.metric === "composite")) p.push(`G24-download-point: a point (${r.point_estimate}) for ${r.subject} (${r.metric}, state ${r.point_state})`);
    if (r.metric === "composite" && members.has(r.subject) && r.point_state !== "withheld") p.push(`G24-download-point: withheld subject ${r.subject} has state ${r.point_state}`);
    if (/difference|arm_b/.test(r.metric) && r.point_estimate !== null) p.push("G24-download-difference: a point difference is exported");
    for (const [k, v] of Object.entries(r)) {
      if (["range_95", "corrected_range_95", "point_estimate", "items"].includes(k) || typeof v !== "number") continue;
      if (w.memberComposites.includes(v.toFixed(1))) p.push(`G24-download-leaf: ${v} at ${k} equals a withheld point`);
    }
  }
  return p;
}

// ---------------------------------------------------------------------------
// A tiny reading-level estimate (Flesch-Kincaid grade) for the always-visible copy (PRD FR-22 AC3)
// ---------------------------------------------------------------------------
function syllables(word) {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!w) return 0;
  if (w.length <= 3) return 1;
  const m = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "").replace(/^y/, "").match(/[aeiouy]{1,2}/g);
  return Math.max(1, m ? m.length : 1);
}
function fkGrade(text) {
  const sentences = text.split(/[.!?]+\s/).filter((s) => s.trim()).length || 1;
  const words = text.split(/\s+/).filter(Boolean);
  const syl = words.reduce((a, x) => a + syllables(x), 0);
  return 0.39 * (words.length / sentences) + 11.8 * (syl / words.length) - 15.59;
}

const clone = (x) => JSON.parse(JSON.stringify(x));
const asPilot = (w) => ({ ...w, status: "pilot", official: false, comparability: "none" });

// ===========================================================================
if (!TREE_ONLY) {
  const HERE_URL = pathToFileURL(join(HERE, "lib", "tsx-render-loader.mjs")).href;
  register(HERE_URL);
  const req = createRequire(join(SITE, "package.json"));
  const React = req("react");
  const { renderToStaticMarkup } = req("react-dom/server");
  const { syntheticWave, syntheticArmsWave } = await import("./lib/model-report-fixtures.mjs");
  const facts = await import("@/lib/model-dashboard-facts.ts");
  const pageMod = await import("@/components/model-benchmark/dashboard/DashboardPage.tsx");
  const panels = await import("@/components/model-benchmark/dashboard/panels.tsx");
  const copyMod = await import("@/lib/model-dashboard-copy.ts");
  const kit = await import("@/components/model-benchmark/pilot/figure-kit.tsx");
  const report = await import("@/lib/model-report-facts.ts");
  const render = (C, props) => renderToStaticMarkup(React.createElement(C, props));

  await h.check("committed waves exist to test against", () => h.assert(waves.length > 0, "none"));
  const dims8 = ["AWR", "EMP", "ACT", "EQU", "BND", "ACC", "SYS", "INT"];
  const synthetic = asPilot(syntheticWave({ runId: "wave-2029-05-05", clusters: [[["orion1.5-9b", 40.1], ["vega2.0-3b", 42.0]], [["lyra-7b", 70.2]], [["nova-2b", 21.6]]], dims: dims8, excluded: null, local: true, reversePairs: true, seed: 5 }));
  const syntheticArms = asPilot(syntheticArmsWave({ dims: dims8 }));
  const committed = waves.map(asPilot);
  const targets = [...committed.map((w) => [`committed ${w.run_id}`, w]), ["synthetic wave (four builds, dotted ids)", synthetic], ["synthetic arms wave", syntheticArms]];

  const linksFor = (wave, all) => {
    const list = (all.length ? all : [wave]).map((w) => ({ runId: w.run_id, reportDate: w.report_date }));
    list.sort((a, b) => (a.reportDate < b.reportDate ? 1 : a.reportDate > b.reportDate ? -1 : 0));
    return list.map((l, i) => ({ ...l, href: i === 0 ? DASHBOARD_PATH : `${DASHBOARD_PATH}/${l.runId}`, isLatest: i === 0, superseded: false }));
  };
  const dataFor = (wave, all = []) => facts.buildDashboardData({ internal: wave, mode: "active", links: linksFor(wave, all), waveSha256: "0".repeat(64) });

  // ------------------------------------------------------------------- copy
  h.section("copy: no digit, lexicon, reading level");
  const strings = copyMod.allCopyStrings();
  await h.check("the copy module has strings to scan", () => h.assert(strings.length > 80, `only ${strings.length}`));
  await h.check("no digit in any fixed string (a number is a token from the data, METH rule 5); only the mandated \"excludes 0 / includes 0\" wording has one", () => {
    const bad = strings.filter((s) => /\d/.test(s.replace(/\b(?:excludes|includes) 0\b/g, "").replace(/\(95%\)/g, "").replace(/\bsha256\b/gi, "")));
    h.assert(bad.length === 0, `digits in: ${bad.slice(0, 3).map((s) => `"${s.slice(0, 60)}"`).join(" | ")}`);
  });
  for (const [label, wave] of targets) {
    await h.check(`the template D lexicon over every fixed string (${label})`, () => {
      const bad = strings.flatMap((s) => lexiconProblems(s, wave).map((q) => `${q.rule}: ${q.message}`));
      h.assert(bad.length === 0, bad.slice(0, 3).join(" | "));
    });
  }
  await h.check("no \"provisional\", \"clean\" or \"cleared\" anywhere in the copy", () => h.assert(!strings.some((s) => /\bprovisional\b|\bclean\b|\bcleared\b/i.test(s)), "found one"));
  await h.check("the always-visible panel copy reads at grade nine or below (PRD FR-22 AC3)", () => {
    const C = copyMod.dashboardCopy;
    const text = [...C.howto.items, ...C.hero.is, ...C.hero.isnt, C.hero.scoreCallout, C.groups.order, C.state.notMeasuredTip, ...C.glossary.map((g) => g.def)].join(" ");
    const g = fkGrade(text);
    h.assert(g <= 9, `Flesch-Kincaid grade ${g.toFixed(1)}`);
  });

  // ------------------------------------------------------------------- core
  h.section("core logic");
  for (const [label, wave] of targets) {
    const pub = projectWavePublic(wave);
    const { blocks, transitive } = core.dashboardBlocks(pub);
    await h.check(`blocks (${label}): "Not separated" blocks come first, then separated, then the range-only block; alphabetical inside a block`, () => {
      h.assert(transitive, "the wave's flags are not transitive");
      const order = { "not-separated": 0, separated: 1, unlisted: 2, "range-only": 3 };
      const kinds = blocks.map((b) => order[b.kind]);
      h.assert(kinds.every((k, i) => i === 0 || kinds[i - 1] <= k), `kinds out of order: ${blocks.map((b) => b.kind).join(", ")}`);
      for (const b of blocks) h.assert(JSON.stringify(b.ids) === JSON.stringify([...b.ids].sort()), `block ${b.gid} not alphabetical`);
      const seen = blocks.flatMap((b) => b.ids);
      const expect = pub.derived.display_rule ? pub.design.subjects : pub.design.subjects;
      h.assert(new Set(seen).size === seen.length && seen.length === expect.length, `blocks hold ${seen.length} of ${expect.length} subjects`);
    });
    await h.check(`rows (${label}): a point only for a subject separated after correction; no dimension mean; no point difference; ranges in one string`, () => {
      const rows = core.dashboardRows(pub);
      const sep = new Set(pub.derived.separated_subjects);
      for (const r of rows) {
        if (r.point !== null) h.assert(sep.has(r.subject) && r.metric === "composite" && r.pointState === "value", `point for ${r.subject} ${r.metric}`);
        if (r.metric !== "composite") h.assert(r.point === null, `${r.metric} carries a point`);
        h.assert(/^-?\d+\.\d+ to -?\d+\.\d+$/.test(r.range), `range not one string: ${r.range}`);
      }
      h.assert(rows.filter((r) => r.metric === "composite").length === pub.design.subjects.length, "composite rows");
    });
  }
  // The two things the existing groupBlocks gets wrong for the dashboard, proved on a plain wave: size-first ordering and the secondary arm.
  await h.check("dashboardBlocks puts a small not-separated group BEFORE a larger separated block (the report's groupBlocks orders by size)", () => {
    const fake = { design: { subjects: ["a", "b", "c", "d", "e"] }, derived: { not_separated_groups: [["a", "b"]], separated_subjects: ["c", "d", "e"], separated_pairs: [["a", "c"], ["a", "d"], ["a", "e"], ["b", "c"], ["b", "d"], ["b", "e"], ["c", "d"], ["c", "e"], ["d", "e"]] } };
    const b = core.dashboardBlocks(fake).blocks;
    h.assert(b[0].kind === "not-separated" && b[0].ids.join() === "a,b", `first block: ${JSON.stringify(b[0])}`);
  });
  await h.check("a non-transitive wave (a group whose members are separated from each other) falls back to one alphabetical list and claims no grouping", () => {
    const fake = { design: { subjects: ["a", "b", "c"] }, derived: { not_separated_groups: [["a", "b", "c"]], separated_subjects: [], separated_pairs: [["a", "c"]] } };
    const r = core.dashboardBlocks(fake);
    h.assert(!r.transitive && r.blocks.length === 1 && r.blocks[0].kind === "list", JSON.stringify(r));
  });
  await h.check("shapes: nine distinct shapes and a build-time check that fails when a wave has more builds than shapes", () => {
    h.assert(kit.SHAPE_COUNT >= 9, `${kit.SHAPE_COUNT}`);
    let threw = false;
    try { kit.assertShapesSuffice(kit.SHAPE_COUNT + 1, "probe"); } catch { threw = true; }
    h.assert(threw, "no throw for builds > shapes");
    kit.assertShapesSuffice(kit.SHAPE_COUNT, "ok");
  });
  await h.check("existing report output is unchanged by the shape change: the first six shapes keep their order", () => {
    const w = committed.find((x) => x.derived.display_rule === undefined);
    const first = [...w.design.subjects].sort().slice(0, 6).map((id) => kit.shapeFor(w, id));
    h.assert(first.join() === ["circle", "square", "triangle", "diamond", "plus", "hexagon"].slice(0, first.length).join(), first.join());
  });

  // ---- hash state: the schema of UX_FLOWS section 5, 12+ malformed fixtures
  const ctx = { builds: ["gemma2-9b", "llama3.2-3b", "mistral-7b", "qwen2.5-7b"], dims: dims8, panels: core.PANEL_CODES };
  const state = (hash) => core.parseHash(hash, ctx);
  const codes = (r) => (r.notices ?? []).map((n) => n.code).join(",");
  await h.check("hash: empty is the default view; defaults are omitted on write", () => {
    const r = state("");
    h.assert(r.kind === "state" && core.isDefaultState(r.state, ctx) && core.serializeHash(r.state, ctx) === "", "default");
  });
  await h.check("hash: a bare #panel-comp is a jump link and leaves the state alone", () => h.assert(state("#panel-comp").kind === "jump" && state("#data").kind === "jump", "not a jump"));
  const fixtures = [
    ["unknown model dropped with a notice, none valid means all", "#m=nope", (r) => codes(r) === "models" && r.state.models.length === 4],
    ["one valid, one unknown model", "#m=gemma2-9b,nope", (r) => r.state.models.join() === "gemma2-9b" && codes(r) === "models"],
    ["unknown dimension", "#d=XXX", (r) => r.state.dims.length === 8 && codes(r) === "dims"],
    ["unknown panel", "#p=bogus", (r) => r.state.panels.length === core.PANEL_CODES.length && codes(r) === "panels"],
    ["bad view", "#v=sideways", (r) => r.state.view === null && codes(r) === "view"],
    ["exploratory is 1 only", "#x=2", (r) => r.state.x === false],
    ["sort and weights are refused with a notice", "#sort=score&weights=1&by=x&m=gemma2-9b", (r) => r.state.models.join() === "gemma2-9b" && codes(r) === "sort"],
    ["malformed percent-encoding ignores the whole hash", "#m=%E0%A4%A", (r) => codes(r) === "unreadable" && core.isDefaultState(r.state, ctx)],
    ["oversize hash is ignored", `#m=${"a".repeat(600)}`, (r) => codes(r) === "unreadable"],
    ["case is folded (models lower, dimensions upper, panels lower); dimensions keep the site's order", "#M=GEMMA2-9B&D=act,emp&P=COMP", (r) => r.state.models.join() === "gemma2-9b" && r.state.dims.join() === "EMP,ACT" && r.state.panels.includes("comp") && r.state.panels.includes("prov")],
    ["duplicates removed", "#d=ACT,ACT,EMP&m=qwen2.5-7b,qwen2.5-7b", (r) => r.state.dims.join() === "EMP,ACT" && r.state.models.join() === "qwen2.5-7b"],
    ["provenance cannot be hidden while a figure panel shows", "#p=comp", (r) => r.state.panels.join() === "comp,prov"],
    ["the old wave key is just an unknown key", "#w=pilot-x&m=gemma2-9b", (r) => r.state.models.join() === "gemma2-9b" && codes(r) === ""],
    ["zero builds selected is an empty state, not an error", "#m=none", (r) => r.state.models.length === 0 && codes(r) === ""],
  ];
  for (const [name, hash, ok] of fixtures) await h.check(`hash fixture: ${name}`, () => { const r = state(hash); h.assert(r.kind === "state" && ok(r), JSON.stringify(r).slice(0, 220)); });
  await h.check("hash: write then read is the identity, lists are alphabetical, and defaults vanish", () => {
    const s = { models: ["qwen2.5-7b", "gemma2-9b"], dims: ["ACT", "EMP"], panels: ["diff", "comp", "prov"], view: "table", x: true };
    const hash = core.serializeHash(s, ctx);
    h.assert(hash === "#m=gemma2-9b,qwen2.5-7b&d=EMP,ACT&p=comp,diff,prov&v=table&x=1", hash);
    const back = state(hash);
    h.assert(back.kind === "state" && core.serializeHash(back.state, ctx) === hash && back.notices.length === 0, "round trip");
  });
  await h.check("hash: the hash holds no id of a model or a panel as an element anchor (jump ids are panel-<code> only)", () => h.assert(core.PANEL_CODES.every((c) => !ctx.builds.includes(c)), "overlap"));

  // ---- "Not measured yet": a state until the data has the field (T7)
  h.section("Not measured yet: field absent, field present (T7)");
  const base = committed.find((w) => w.run_id === "pilot-2026-10-03") ?? committed[0];
  const nmWith = (mutate) => {
    const w = clone(base);
    mutate(w);
    return dataFor(w);
  };
  const nmRows = (html) => Object.fromEntries([...html.matchAll(/<li\b[^>]*data-nm="([^"]+)"[^>]*data-nm-state="([^"]+)"[^>]*>([\s\S]*?)<\/li>/g)].map((m) => [m[1], { state: m[2], text: m[3].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ") }]));
  const nmBase = nmRows(render(panels.NotMeasuredPanel, { d: dataFor(base) }));
  await h.check("field absent: crisis, refusal, consistency, multi-turn, human raters, length-controlled score are \"Not measured yet\" with a reason and no digit", () => {
    for (const id of ["crisis", "refusal", "consistency", "multi-turn", "human-raters", "length-controlled", "frontier", "official"]) {
      const r = nmBase[id];
      h.assert(r && r.state === "not-measured" && /Not measured yet/.test(r.text) && !/\d/.test(r.text), `${id}: ${JSON.stringify(r)}`);
    }
  });
  await h.check("field present: a row becomes a value only when the projection carries the field (no manual override)", () => {
    const cases = [
      ["consistency", (w) => { Object.values(w.subjects)[0].stability = { within_item_sd: 0.4 }; }],
      ["refusal", (w) => { w.failures = { refusal_rate: 0.1 }; }],
      ["crisis", (w) => { w.design.crisis_items_served = true; }],
      ["validated", (w) => { w.bank.items_validated = 3; }],
      ["multi-turn", (w) => { w.design.items_per_conversation_max = 4; }],
    ];
    for (const [id, mutate] of cases) {
      const r = nmRows(render(panels.NotMeasuredPanel, { d: nmWith(mutate) }))[id];
      h.assert(r && r.state === "available" && !/Not measured yet/.test(r.text), `${id}: ${JSON.stringify(r)}`);
    }
    h.assert(nmBase.validated.state === "not-measured", "validated flipped without data");
  });

  // ---- official wave ignored; zero waves means no route (T10)
  h.section("render gate: official ignored, zero waves, the route files (T10)");
  await h.check("a manifest entry with official:true is ignored by every layer (FR-01 AC3)", () => {
    const e = { run_id: "x", status: "pilot", official: true, comparability: "none", report_date: "2026-01-01", decision_ref: "D", decision_status: "active" };
    h.assert(!core.isDashboardWave(e), "isDashboardWave accepted official:true");
    h.assert(!core.isDashboardWave({ ...e, status: "official", official: true }), "accepted an official wave");
    h.assert(core.isDashboardWave({ ...e, official: false }), "rejected a pilot");
    h.assert(renderableEntries([{ ...e, status: "official" }], {}, { requireReport: false }).length === 0, "the render gate accepted an official wave");
  });
  await h.check("zero renderable waves: nothing renders, so the route has no pages (the pilot.tsx extension is not added)", () => {
    h.assert(renderableEntries([], {}, { requireReport: false }).length === 0, "entries from nothing");
    const proposed = [{ run_id: "x", status: "pilot", official: false, comparability: "none", report_date: "2026-01-01", decision_ref: "D", decision_status: "proposed" }];
    h.assert(renderableEntries(proposed, {}, { requireReport: false }).length === 0, "a proposed wave renders without the preview flag");
  });
  await h.check("the route files exist only as page.dashboard.tsx (gated by the dashboard's own pageExtension); no plain page.tsx, none on the pilot-report extension", () => {
    const root = join(SITE, "src", "app", "ai-models", "dashboard");
    const files = listFiles(root, root);
    h.assert(files.includes("page.dashboard.tsx") && files.includes("[runId]/page.dashboard.tsx"), files.join());
    h.assert(!files.some((f) => /(^|\/)page\.tsx$/.test(f) || /(^|\/)(layout|route)\.tsx?$/.test(f)), `ungated route file: ${files.join()}`);
    h.assert(!files.some((f) => /page\.pilot(index)?\.tsx$/.test(f)), `a dashboard route rides on the pilot-report extension: ${files.join()}`);
    const cfg = readFileSync(join(SITE, "next.config.ts"), "utf8");
    h.assert(/dashboardRoute \? \["dashboard\.tsx"\]/.test(cfg), "next.config.ts no longer gates the dashboard.tsx extension");
    h.assert(/dashboardRoutes\(manifest/.test(cfg) && !/pilotRoutes \? \[[^\]]*dashboard/.test(cfg), "next.config.ts does not derive the dashboard extension from the dashboard gate");
  });

  // ------------------------------------------------------------------ the dashboard's own gate (D-29b), fixture mode
  h.section("dashboard gate: its own decision (D-29b) or CB_PREVIEW_DASHBOARD=1, independent of the pilot-report gate");
  {
    const OPEN = { decision_ref: "D-29b", status: "active" };
    const CLOSED = { decision_ref: "D-29b", status: "proposed" };
    const mkWave = (id, over = {}) => ({ run_id: id, status: "pilot", official: false, comparability: "none", report_date: "2026-10-03", decision_ref: "D-29a", decision_status: "active", ...over });
    const gm = [mkWave("pilot-x")];
    const gReports = mkdtempSync(join(tmpdir(), "dash-gate-reports-"));
    writeFileSync(join(gReports, "pilot-x.md"), "x");
    const ents = (decision, env = {}, m = gm) => dashboardEntries(m, env, { reportsDir: gReports, decision });
    // The closed-gate assertion: the problems it reports when the dashboard would render. Negative controls plant an open gate under it.
    const closedGateProblems = (decision, env = {}, m = gm) => {
      const e = ents(decision, env, m);
      return e.length ? [`GATE-open: ${e.length} dashboard wave(s) render with decision "${decision?.status}" and env ${JSON.stringify(env)} (no route, sitemap entry, download or link may exist)`] : [];
    };
    await h.check("fixture sanity: the pilot-report gate renders the fixture wave (ratified D-29a) while the dashboard gate stays closed", () => {
      h.assert(renderableEntries(gm, {}, { reportsDir: gReports }).length === 1, "the pilot gate does not render the fixture wave");
      h.assert(ents(CLOSED).length === 0, "the dashboard rendered on a ratified pilot report alone");
    });
    h.clean("default env, D-29b proposed, ratified pilot report: gate closed (0 routes, 0 sitemap entries, no link)", closedGateProblems(CLOSED));
    h.clean("the pilot-report preview flag does not open the dashboard", closedGateProblems(CLOSED, { CB_PREVIEW_PILOT_REPORTS: "1" }));
    h.clean("only the exact value 1 of CB_PREVIEW_DASHBOARD opens it (0, true, yes, empty stay closed)", ["0", "true", "yes", ""].flatMap((v) => closedGateProblems(CLOSED, { [DASHBOARD_PREVIEW_ENV]: v })));
    h.clean("a decision with status ratified, superseded, unresolved, ACTIVE or empty, a wrong decision ref, or no decision stays closed", [
      ...["ratified", "superseded", "unresolved", "ACTIVE", ""].flatMap((st) => closedGateProblems({ decision_ref: "D-29b", status: st })),
      ...closedGateProblems({ decision_ref: "D-29a", status: "active" }), ...closedGateProblems(null), ...closedGateProblems({}),
    ]);
    await h.check("a missing or unreadable decision file fails closed", () => {
      h.assert(dashboardGateMode(loadDashboardDecision(join(tmpdir(), "no-such-dashboard-decision.json")), {}) === null, "missing file did not fail closed");
      const bad = join(gReports, "bad.json");
      writeFileSync(bad, "{not json");
      h.assert(dashboardGateMode(loadDashboardDecision(bad), {}) === null, "unreadable file did not fail closed");
    });
    await h.check("preview env opens the gate (mode preview); a ratified status opens it (mode active); both then need a renderable dashboard wave", () => {
      h.assert(ents(CLOSED, { [DASHBOARD_PREVIEW_ENV]: "1" }).length === 1, "preview did not open");
      h.assert(dashboardGateMode(CLOSED, { [DASHBOARD_PREVIEW_ENV]: "1" }) === "preview", "mode");
      h.assert(ents(OPEN).length === 1, "ratified did not open");
      h.assert(dashboardGateMode(OPEN, {}) === "active", "mode");
      h.assert(ents(OPEN, {}, []).length === 0, "open gate with no waves renders (the extension would be added with no page)");
      h.assert(ents(OPEN, {}, [mkWave("pilot-x", { official: true })]).length === 0, "open gate rendered an official wave");
      h.assert(ents(OPEN, {}, [mkWave("pilot-x", { status: "official", official: true })]).length === 0, "open gate rendered an official-status wave");
      h.assert(ents(OPEN, {}, [mkWave("pilot-y")]).length === 0, "open gate rendered a wave without a report narrative");
      h.assert(ents(OPEN, {}, [mkWave("pilot-x", { decision_status: "proposed" })]).length === 0, "an open dashboard gate rendered a proposed wave without the pilot preview flag");
      h.assert(ents(OPEN, { CB_PREVIEW_PILOT_REPORTS: "1" }, [mkWave("pilot-x", { decision_status: "proposed" })]).length === 1, "open gate plus pilot preview did not render a proposed wave");
    });
    h.trips("negative control: a planted ratified status makes the closed-gate assertion fail", closedGateProblems(OPEN), "GATE-open");
    h.trips("negative control: a planted CB_PREVIEW_DASHBOARD=1 makes the closed-gate assertion fail", closedGateProblems(CLOSED, { [DASHBOARD_PREVIEW_ENV]: "1" }), "GATE-open");

    // The committed decision, and the real adapter, sitemap and card in this environment
    const committedDecision = loadDashboardDecision();
    const decisionsMd = readFileSync(join(SITE, "..", "DECISIONS.md"), "utf8");
    const unratifiedProblems = (decision, md) => (decision.status === "active" && !/D-29b/.test(md) ? ["GATE-unratified: dashboard-decision.json is active but DECISIONS.md has no D-29b"] : []);
    await h.check("the committed dashboard decision is D-29b, and \"active\" appears only when DECISIONS.md carries a D-29b entry", () => {
      h.assert(committedDecision.decision_ref === "D-29b" && typeof committedDecision.status === "string", JSON.stringify(committedDecision));
      const p = unratifiedProblems(committedDecision, decisionsMd);
      h.assert(p.length === 0, p.join(" | "));
    });
    h.trips("negative control: an active dashboard decision with no D-29b in DECISIONS.md is caught", unratifiedProblems(OPEN, "D-29a only"), "GATE-unratified");
    const sitemapMod = await import("@/app/sitemap.ts");
    const dashUrls = () => sitemapMod.default().filter((u) => u.url.includes("/ai-models/dashboard")).length;
    const cardMod = await import("@/components/model-benchmark/pilot/PilotSummaryCard.tsx");
    const cardHtml = (props) => render(cardMod.default, { facts: { cardDescription: "x", items: [] }, previewRunIds: [], ...props });
    const savedEnv = process.env[DASHBOARD_PREVIEW_ENV];
    try {
      delete process.env[DASHBOARD_PREVIEW_ENV];
      const open = committedDecision.status === "active";
      await h.check(`the real adapter in the default env follows the committed decision (${committedDecision.status}): dashboardEntries, waveLinks, dashboardRenders, sitemap`, () => {
        h.assert((facts.dashboardEntries().length > 0) === open, `dashboardEntries ${facts.dashboardEntries().length}`);
        h.assert((facts.waveLinks().length > 0) === open, "waveLinks");
        h.assert(facts.dashboardRenders() === open, "dashboardRenders");
        h.assert((dashUrls() > 0) === open, `${dashUrls()} dashboard sitemap entr(ies)`);
        if (!open) h.assert(facts.latestRunId() === null && dashUrls() === 0, "closed gate but a latest wave or sitemap entry");
      });
      await h.check("CB_PREVIEW_DASHBOARD=1 opens the real adapter and the sitemap (an entry page plus one page per older wave)", () => {
        process.env[DASHBOARD_PREVIEW_ENV] = "1";
        const n = facts.dashboardEntries().length;
        h.assert(n > 0, "no dashboard wave under preview");
        h.assert(facts.waveLinks().length === n && facts.dashboardRenders(), "waveLinks / dashboardRenders");
        h.assert(dashUrls() === n, `${dashUrls()} sitemap entr(ies) for ${n} wave(s) (the newest wave's page is canonical to the entry page)`);
      });
    } finally {
      if (savedEnv === undefined) delete process.env[DASHBOARD_PREVIEW_ENV]; else process.env[DASHBOARD_PREVIEW_ENV] = savedEnv;
    }
    await h.check("PilotSummaryCard links the dashboard only when told the gate is open (default: no link)", () => {
      h.assert(!/\/ai-models\/dashboard/.test(cardHtml({})), "the default card links the dashboard");
      h.assert(!/\/ai-models\/dashboard/.test(cardHtml({ showDashboard: false })), "showDashboard false still links");
      h.assert(/href="\/ai-models\/dashboard"/.test(cardHtml({ showDashboard: true })), "showDashboard true has no link");
      const pg = readFileSync(join(SITE, "src", "app", "ai-models", "page.tsx"), "utf8");
      h.assert(/showDashboard=\{dashboardRenders\(\)\}/.test(pg), "/ai-models does not pass the dashboard gate to the card");
    });
    await h.check("the prebuild download step uses the dashboard gate (an empty projection when closed)", () => {
      const src = readFileSync(join(SITE, "scripts", "build-model-dashboard-data.mjs"), "utf8");
      h.assert(/dashboard-render-gate\.mjs/.test(src) && /dashboardEntries\(/.test(src), "build-model-dashboard-data.mjs does not call the dashboard gate");
    });
    await h.check("ownerWaveOf: /ai-models/dashboard belongs to the newest dashboard-ELIGIBLE wave (QA M3)", () => {
      const byDate = [...committed].sort((a, b) => (a.report_date < b.report_date ? 1 : -1));
      h.assert(byDate.length >= 2, "needs two committed waves");
      const [n, o] = byDate;
      const owner = (ws, env = {}) => ownerWaveOf("ai-models/dashboard.html", ws, env)?.run_id;
      h.assert(owner(committed) === n.run_id, `baseline ${owner(committed)}`);
      h.assert(owner(committed.map((w) => (w === n ? { ...w, official: true } : w))) === o.run_id, "an official newer wave owns the page");
      h.assert(owner(committed.map((w) => (w === n ? { ...w, publication: { ...w.publication, decision_status: "superseded" } } : w))) === o.run_id, "a superseded newer wave owns the page");
      const proposed = committed.map((w) => (w === n ? { ...w, publication: { ...w.publication, decision_status: "proposed" } } : w));
      h.assert(owner(proposed) === o.run_id, "a newer proposed wave (not rendering without the flag) owns the page");
      h.assert(owner(proposed, { CB_PREVIEW_PILOT_REPORTS: "1" }) === n.run_id, "under the preview flag the proposed wave renders and owns the page");
    });
    rmSync(gReports, { recursive: true, force: true });
  }

  // ------------------------------------------------------------------ render
  const pages = [];
  for (const [label, wave] of targets) {
    h.section(`rendering ${label}`);
    let d;
    let html;
    await h.check("the adapter builds the data (projection checked, copy rules, shapes) and the page renders", () => {
      d = dataFor(wave, committed.includes(wave) ? committed : []);
      html = render(pageMod.default, { d, mode: "active" });
      h.assert(html.includes("<svg") && html.includes("<table"), "no svg or table");
    });
    if (!html) continue;
    const meta = pageMod.dashboardMetadata(d);
    const head = `<head><title>${meta.title.absolute}</title><meta name="description" content="${meta.description}"/><link rel="canonical" href="${meta.alternates.canonical}"/><meta name="robots" content="index, follow"/><meta property="og:title" content="${meta.openGraph.title}"/><meta property="og:description" content="${meta.openGraph.description}"/><meta property="og:url" content="${meta.openGraph.url}"/><meta name="twitter:title" content="${meta.twitter.title}"/><meta name="twitter:description" content="${meta.twitter.description}"/></head>`;
    const page = `<!DOCTYPE html><html lang="en">${head}<body><main id="main">${html}</main></body></html>`;
    pages.push({ label, wave, d, html, page });
    const label0 = figureLabelOf(wave.run_id, wave.report_date, d.accessTier);
    const expected = { title: `Unofficial Pilot: ${copyMod.dashboardCopy.title} (${monthYear(wave.report_date)})`, canonical: d.canonical, buildIds: d.builds.map((b) => b.id) };

    h.clean("G19 (dashboard kind): no group member's point, a separated subject's point only in a Point estimate cell, no bound, no withheld difference, no member dimension mean", leakProblems({ html: page, wave, kind: "dashboard" }));
    h.clean("G20: title, meta, canonical, og, JSON-LD (WebPage, BreadcrumbList, FAQPage only), no leaderboard term near a model name, one h1, no ai-lab link, no per-model anchor", dashboardSeoProblems({ html: page, wave, expected }));
    h.clean("structure: label on every figure and table, \"Not separated\" first, alphabetical, no sort or weight control, one wave, role=img with title and description, duty of care, default view, static downloads", dashboardStructureProblems({ html: page, wave, label: label0, allWaves: committed, officialCount: 0 }));
    h.clean("lexicon: template D over every text block and attribute (no rank, band, best, clean, provisional ...)", dashboardLexiconProblems(page, wave));
    h.clean("chart = table: the composite chart description and the composite table list the same ranges (T4)", chartTableProblems(page, wave));
    await h.check("T9: the page shows subjects of one wave only", () => {
      const p = dashboardStructureProblems({ html: page, wave, label: label0, allWaves: committed, officialCount: 0 }).filter((x) => x.startsWith("DASH-two-waves"));
      h.assert(p.length === 0, p.join(" | "));
    });
    await h.check("T1/FR-02: the island's props (JSON) hold no withheld value", () => {
      const props = pageMod.shellProps(d);
      const text = JSON.stringify(props);
      const p = machineTextProblems({ text, wave, label: "island props", owner: wave });
      h.assert(p.length === 0, p.join(" | "));
      h.assert(!("wave" in props) && !text.includes("pilot_composite") && !text.includes("point_withheld"), "raw wave keys in props");
      h.assert(Buffer.byteLength(text) <= PROPS_MAX, `props ${Buffer.byteLength(text)} bytes`);
    });
    await h.check("T12: the default-view HTML is within the gzip budget", () => {
      const n = gzipSync(page).length;
      h.assert(n <= GZIP_HTML_MAX, `${n} bytes gzip`);
      h.log(`    info ${label}: ${n} bytes gzip, ${Buffer.byteLength(page)} bytes raw`);
    });
    await h.check("FR-24: the whole-wave download built from the projection passes the withheld checks", () => {
      const pub = projectWavePublic(wave);
      const rows = core.dashboardRows(pub);
      const m = core.exportMeta({ runId: wave.run_id, reportDate: wave.report_date, accessTier: d.accessTier, waveSha256: "0".repeat(64), citation: core.shortCitation(wave.run_id, wave.report_date), view: "whole wave" });
      const p = downloadProblems({ csv: core.rowsToCsv(rows, m), json: JSON.stringify(core.exportJson(rows, m)), wave });
      h.assert(p.length === 0, p.join(" | "));
    });
  }

  // T6: group integrity under every subset of a four-model wave (the island only toggles `hidden`; the markup is the full wave's)
  h.section("T6: group integrity under every subset of a four-build wave");
  {
    const fx = pages.find((x) => x.label.startsWith("synthetic wave"));
    const names = fx.d.builds.map((b) => b.id);
    await h.check("the fixture has four builds, one not-separated group and one separated build", () => h.assert(names.length === 4 && fx.wave.derived.not_separated_groups.length >= 1, names.join()));
    const full = core.dashboardBlocks(projectWavePublic(fx.wave)).blocks;
    const kindOfGid = Object.fromEntries(full.map((b) => [b.gid, b.kind]));
    const rows = [...fx.html.matchAll(/<div class="dash-row" data-subjects="([^"]+)" data-group="([^"]+)"/g)].map((m) => ({ build: m[1], gid: m[2] }));
    const heads = [...fx.html.matchAll(/<div class="dash-block" data-block="([^"]+)"[^>]*><p class="dash-grouphead" data-group-head="[^"]+"><strong>([^<]*)<\/strong>/g)].map((m) => ({ gid: m[1], text: m[2] }));
    let checked = 0;
    for (let mask = 0; mask < 16; mask++) {
      const sel = new Set(names.filter((_, i) => mask & (1 << i)));
      await h.check(`subset ${[...sel].join("+") || "(none)"}: every block header is the full wave's; a lone visible member keeps its group; the subset note shows exactly when members are hidden`, () => {
        for (const hd of heads) {
          const kind = kindOfGid[hd.gid];
          h.assert(kind === "not-separated" ? /^Not separated/.test(hd.text) : kind === "separated" ? /^Separated/.test(hd.text) : true, `header "${hd.text}" for a ${kind} block`);
        }
        for (const gid of Object.keys(kindOfGid)) {
          const members = rows.filter((r) => r.gid === gid);
          const shown = members.filter((r) => sel.has(r.build)).length;
          const noteVisible = shown < members.length;
          if (kindOfGid[gid] === "not-separated" && members.length > 1) {
            // a lone visible member
            if (shown === 1) h.assert(kindOfGid[gid] === "not-separated" && heads.find((x) => x.gid === gid)?.text.startsWith("Not separated"), "a lone member lost its group header");
            const note = new RegExp(`data-subset-for="${gid}"[^>]*data-total="${members.length}"[^>]*hidden`).test(fx.html);
            h.assert(note, `no subset note element for group ${gid}`);
            h.assert(noteVisible === (shown < members.length), "note rule");
          }
        }
        checked += 1;
      });
    }
    await h.check("all sixteen subsets were examined", () => h.assert(checked === 16, `${checked}`));
    await h.check("the separated build's point stays in its table cell and nowhere else; a lone member of a group has no tick and the word Withheld", () => {
      const pub = projectWavePublic(fx.wave);
      const sepId = pub.derived.separated_subjects[0];
      const tickCount = (fx.html.match(/pf-tick/g) ?? []).length;
      h.assert(tickCount === pub.derived.separated_subjects.length, `${tickCount} tick(s) for ${pub.derived.separated_subjects.length} separated subject(s)`);
      for (const m of pub.derived.not_separated_groups.flat()) {
        const row = fx.html.match(new RegExp(`<tr data-subjects="${m.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"><th scope="row">${m.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[\\s\\S]*?</tr>`))?.[0] ?? "";
        h.assert(/Withheld/.test(row), `${m}: no Withheld in its row`);
      }
      h.assert(sepId !== undefined, "no separated subject in the fixture");
    });
  }

  // ------------------------------------------------------------- probes
  h.section("planted probes in the REAL markup (each must FAIL; the clean page passes)");
  {
    const armsT = pages.find((x) => x.label === "committed pilot-2026-10-03") ?? pages.find((x) => x.label.startsWith("synthetic arms"));
    const { wave, d, page } = armsT;
    const label0 = figureLabelOf(wave.run_id, wave.report_date, d.accessTier);
    const expected = { title: `Unofficial Pilot: ${copyMod.dashboardCopy.title} (${monthYear(wave.report_date)})`, canonical: d.canonical, buildIds: d.builds.map((b) => b.id) };
    const w = withheldValues(wave);
    const member = w.members.find((m) => !wave.derived.range_only_subjects?.includes(m)) ?? w.members[0];
    const memberTok = wave.subjects[member].pilot_composite.toFixed(1);
    const sepId = wave.derived.separated_subjects[0];
    const inject = (html, body) => html.replace("</main>", `${body}</main>`);
    const leak = (html) => leakProblems({ html, wave, kind: "dashboard" });
    const struct = (html) => dashboardStructureProblems({ html, wave, label: label0, allWaves: committed, officialCount: 0 });
    const seo = (html) => dashboardSeoProblems({ html, wave, expected });
    h.clean("the clean page passes every dashboard gate", [...leak(page), ...struct(page), ...seo(page), ...dashboardLexiconProblems(page, wave)]);
    h.trips(`a withheld point (${member}: ${memberTok}) planted in prose`, leak(inject(page, `<p>${member} reached ${memberTok}.</p>`)), "G19-member-composite");
    h.trips("a withheld point planted in an aria-label", leak(inject(page, `<p aria-label="${member} ${memberTok}">x</p>`)), "G19-member-composite");
    h.trips("a withheld point planted in a table cell", leak(inject(page, `<table><thead><tr><th>Model</th><th>Point estimate</th></tr></thead><tbody><tr><td>${member}</td><td>${memberTok}</td></tr></tbody></table>`)), "G19-member-composite");
    h.trips("a separated subject's point outside a Point estimate cell", leak(inject(page, `<p>${sepId} came in at ${wave.subjects[sepId].pilot_composite.toFixed(1)}.</p>`)), "G19-point-outside-cell");
    h.clean("a range phrase that happens to end in a withheld point's digits passes (it is a published figure)", leak(inject(page, `<p>${sepId} has a range of ${wave.subjects[sepId].pilot_composite_interval95.map((v) => v.toFixed(1)).join(" to ")}.</p>`)));
    h.trips("a member's dimension mean as a bare number in a table cell", leak(inject(page, `<table><thead><tr><th>Dimension</th><th>Range</th></tr></thead><tbody><tr><td>AWR</td><td>${wave.subjects[member].dimensions ? Object.values(wave.subjects[member].dimensions)[0].toFixed(2) : w.memberDimMeans[0]}</td></tr></tbody></table>`)), "G19-member-dimension-mean");
    h.trips("the length-removed bound without its label", leak(inject(page, `<p>It was ${Object.values(wave.length.composite_if_pooled_slope_removed)[0]?.toFixed(1) ?? "0.0"}.</p>`)), Object.keys(wave.length.composite_if_pooled_slope_removed).length ? "G19-" : "G19-");
    h.trips("a band word beside a model name", leak(inject(page, `<p>${sepId} is Established.</p>`)), "G19-band-beside-model");
    h.trips("a rank word in a heading beside a model name (G20)", seo(inject(page, `<h3>${member} is the top model</h3>`)), "G20-near-model");
    h.trips("a rank word fails the lexicon", dashboardLexiconProblems(inject(page, `<p>${member} ranks first.</p>`), wave), "R-banned-lexicon");
    h.trips("the word best fails the lexicon", dashboardLexiconProblems(inject(page, `<p>This is the best build.</p>`), wave), "R-banned-lexicon");
    h.trips("the word provisional fails", dashboardLexiconProblems(inject(page, `<p>A provisional score.</p>`), wave), "provisional");
    h.trips("\"clean\" in the contamination wording fails", dashboardLexiconProblems(inject(page, `<p>The probe came back clean.</p>`), wave), "R-banned-lexicon");
    h.trips("Dataset JSON-LD", seo(inject(page, `<script type="application/ld+json">{"@context":"https://schema.org","@type":"Dataset","name":"x"}</script>`)), "G6-type");
    h.trips("ItemList JSON-LD", seo(inject(page, `<script type="application/ld+json">{"@type":"ItemList"}</script>`)), "G6-type");
    h.trips("an aggregateRating key in JSON-LD", seo(inject(page, `<script type="application/ld+json">{"@type":"WebPage","aggregateRating":{"ratingValue":3}}</script>`)), "G6-");
    h.trips("a JSON-LD type outside the allow-list", seo(inject(page, `<script type="application/ld+json">{"@type":"Product","name":"x"}</script>`)), "G20-jsonld");
    h.trips("a model name in the title", seo(page.replace(/<title>[^<]*<\/title>/, `<title>Unofficial Pilot: ${sepId} (Oct 2026)</title>`)), "G20-title");
    h.trips("a link to an AI Labs entity page", seo(inject(page, `<a href="/ai-lab/openai">lab</a>`)), "G20-links");
    h.trips("a per-model anchor (id equal to a build id)", seo(inject(page, `<div id="${d.builds[0].id}"></div>`)), "DASH-anchor");
    const inArticle = (html, body) => html.replace("</article>", `${body}</article>`);
    h.trips("a sort control (select)", struct(inArticle(page, `<select aria-label="Sort"><option>Sort by score</option></select>`)), "DASH-sort-control");
    h.trips("a sort button", struct(inArticle(page, `<button type="button">Sort by score</button>`)), "DASH-sort-control");
    h.trips("a weight slider", struct(inArticle(page, `<input type="range" aria-label="Weight of empathy"/>`)), "DASH-weight-control");
    h.trips("a subject of another wave on the page", struct(inject(page, `<p>claude-haiku</p>`)), "DASH-two-waves");
    h.trips("another wave's run id outside the wave list", struct(inject(page, `<p>pilot-2026-10-01</p>`)), "DASH-two-waves");
    h.trips("a figure without the label", struct(page.split("comparability none").join("comparability x")), "DASH-figure-label");
    h.trips("a panel without the label", struct(page.split(label0).join("x")), "DASH-panel-label");
    h.trips("the \"Not separated\" head moved after the rows", struct(page.replace(/(<p class="dash-grouphead" data-group-head="g1"><strong>)Not separated/, "$1Group one")), "DASH-order");
    h.trips("a block that is not alphabetical", struct(page.replace(/(class="dash-row" data-subjects=")[^"]+(" data-group="g1")/, "$1zzz$2")), "DASH-order");
    h.trips("an svg that is neither hidden nor labelled", struct(page.replace("</article>", `<svg viewBox="0 0 1 1"></svg></article>`)), "DASH-a11y");
    h.trips("a role=img with an empty description", struct(page.replace(/(<span id="dash-composite-d" class="sr-only">)[\s\S]*?(<\/span><\/span>)/, "$1$2")), "DASH-a11y");
    h.trips("the duty-of-care note with a link inside", struct(page.replace(/(<section[^>]*data-duty-of-care[^>]*>[\s\S]*?)<\/section>/, '$1<a href="/pricing">x</a></section>')), "DASH-duty");
    h.trips("a hidden figure element in the server HTML (the default view must show everything)", struct(page.replace('<div class="dash-row" data-subjects', '<div hidden class="dash-row" data-subjects')), "DASH-default-view");
    h.trips("a \"Not measured yet\" row with a digit", struct(page.replace(/(data-nm-state="not-measured"[^>]*>)/, "$1<strong>3 </strong>")), "DASH-not-measured");
    h.trips("a paid link inside the page", struct(inject(page, `<a href="https://x.gumroad.com/l/y">buy</a>`)), "H-paid-link");
    h.trips("the status block not opening with the no-official-score sentence", struct(page.replace("<p>No model has an official score.</p>", "<p>Scores are in.</p>")), "DASH-status");
    // Gates that had no planted probe (QA 2026-10-15): each mutation of the real markup must trip exactly its rule, and the mutation must change the page.
    const mutate = (name, html, fn, rule, mut) => {
      const m = mut(html);
      h.assert(m !== html, `probe "${name}" did not change the page (the pattern no longer matches the markup)`);
      return fn(m);
    };
    const probe = (name, fn, rule, mut) => h.trips(name, (() => { try { return mutate(name, page, fn, rule, mut); } catch (e) { return [`PROBE-broken: ${e.message}`]; } })(), rule);
    const lexOnly = (html) => dashboardLexiconProblems(html, wave);
    probe("DASH-controls: the control bar visible without JavaScript", struct, "DASH-controls", (x) => x.replace(/(<section[^>]*class="dash-controls"[^>]*?)\shidden(="")?/, "$1"));
    probe("DASH-noscript: the no-JavaScript note removed", struct, "DASH-noscript", (x) => x.replace(/<noscript[\s\S]*?<\/noscript>/, ""));
    probe("DASH-figure-table: a figure without its table switch", struct, "DASH-figure-table", (x) => x.replace(/(<figure\b[\s\S]*?)<details\b/, "$1<div"));
    probe("DASH-table: a table without a caption", struct, "DASH-table", (x) => x.replace(/<caption\b[\s\S]*?<\/caption>/, ""));
    probe("DASH-table-label: a caption without the label", struct, "DASH-table-label", (x) => x.replace(/(<caption\b[^>]*>)[^<]*/, "$1Something else"));
    probe("DASH-third-party: a third-party script", struct, "DASH-third-party", (x) => inject(x, '<script src="https://evil.example/x.js"></script>'));
    probe("DASH-wave: the wave's run id absent", struct, "DASH-wave", (x) => x.split(wave.run_id).join("pilot-x"));
    probe("DASH-figure-footer: a figure without the label footer", struct, "DASH-figure-footer", (x) => inject(x, `<figure><figcaption>no label here</figcaption><details>d</details></figure>`));
    probe("G20-canonical: a wrong canonical", seo, "G20-canonical", (x) => x.replace(/(rel="canonical" href=")[^"]*/, "$1https://x.example/"));
    probe("G20-meta: the meta description removed", seo, "G20-meta", (x) => x.replace(/<meta[^>]*name="description"[^>]*>/i, ""));
    probe("G20-og: og:title removed", seo, "G20-og", (x) => x.replace(/<meta[^>]*property="og:title"[^>]*>/i, ""));
    probe("G20-robots: noindex", seo, "G20-robots", (x) => x.replace('content="index, follow"', 'content="noindex, nofollow"'));
    probe("G20-structure: a second h1", seo, "G20-structure", (x) => inject(x, "<h1>x</h1>"));
    probe("G20-lexicon: a rank word in the meta description", seo, "G20-lexicon", (x) => x.replace(/(<meta[^>]*name="description"[^>]*content=")[^"]*/i, "$1The best score ranks first"));
    probe("DASH-lexicon: a rank word in the body", lexOnly, "DASH-lexicon", (x) => inject(x, "<p>This is the best leaderboard.</p>"));
    h.trips("a chart whose description disagrees with its table", chartTableProblems(page.replace(/(<span data-subjects="[^"]+">(?:Not separated|Separated): [^ ]+ )-?\d+\.\d to /, "$19.9 to "), wave), "DASH-chart-table");

    // props and downloads
    const props = pageMod.shellProps(d);
    h.trips("a withheld point planted in the island's props", machineTextProblems({ text: JSON.stringify({ ...props, extra: { composite: Number(memberTok) } }), wave, label: "props", owner: wave }), "G24-member-point-token");
    h.trips("a raw wave key planted in the island's props is a failure of the props check (not a no-op)", [JSON.stringify({ ...props, wave }).includes("pilot_composite") ? "raw" : ""].filter(Boolean), "raw");
    const pub = projectWavePublic(wave);
    const rows = core.dashboardRows(pub);
    const m = core.exportMeta({ runId: wave.run_id, reportDate: wave.report_date, accessTier: d.accessTier, waveSha256: "0".repeat(64), view: "whole wave" });
    const planted = rows.map((r) => (r.metric === "composite" && r.subject === member ? { ...r, point: memberTok, pointState: "value" } : r));
    h.trips("a withheld point planted in the CSV/JSON download", downloadProblems({ csv: core.rowsToCsv(planted, m), json: JSON.stringify(core.exportJson(planted, m)), wave }), "G24-download-point");
    const withDiff = rows.map((r) => (r.metric === "difference_pre_registered" ? { ...r, point: "3.2", pointState: "value" } : r));
    h.trips("a point difference planted in the download", downloadProblems({ csv: core.rowsToCsv(withDiff, m), json: JSON.stringify(core.exportJson(withDiff, m)), wave }), "G24-download");
    h.clean("the filtered \"current view\" export passes the same checks", (() => {
      const view = core.filterRows(rows, { models: [d.builds[0].id, d.builds[1].id], dims: ["AWR", "EMP"], x: false });
      return downloadProblems({ csv: core.rowsToCsv(view, m), json: JSON.stringify(core.exportJson(view, m)), wave });
    })());

    // the tree gate
    const man = [{ run_id: "pilot-x", status: "pilot", official: false, comparability: "none", report_date: "2026-10-03", decision_ref: "D", decision_status: "active" }];
    const mk = (files) => {
      const dir = mkdtempSync(join(tmpdir(), "dash-tree-"));
      for (const [f, c] of Object.entries(files)) { mkdirSync(dirname(join(dir, f)), { recursive: true }); writeFileSync(join(dir, f), c); }
      return dir;
    };
    const reportsDir = mkdtempSync(join(tmpdir(), "dash-reports-"));
    writeFileSync(join(reportsDir, "pilot-x.md"), "x");
    const sm = `<urlset><url><loc>${SITE_URL}${DASHBOARD_PATH}</loc><lastmod>2026-10-03</lastmod><changefreq>weekly</changefreq></url></urlset>`;
    const good = { "ai-models.html": `<a href="/ai-models/dashboard">d</a>`, "ai-models/dashboard.html": "x", "ai-models/dashboard/pilot-x.html": "x", "data/model-dashboard/pilot-x.csv": "x", "data/model-dashboard/pilot-x.json": "{}", "sitemap.xml": sm };
    const D_OPEN = { decision_ref: "D-29b", status: "active" };
    const D_CLOSED = { decision_ref: "D-29b", status: "proposed" };
    const tree = (files, manifest = man, decision = D_OPEN, env = {}) => { const dir = mk(files); try { return dashboardTreeProblems({ outDir: dir, manifest, env, reportsDir, decision }); } finally { rmSync(dir, { recursive: true, force: true }); } };
    h.clean("tree: one rendering wave with its page, downloads, sitemap entry and /ai-models link passes", tree(good));
    h.trips("tree: no wave renders but the dashboard page exists", tree({ "ai-models.html": "x", "ai-models/dashboard.html": "x" }, []), "TREE-leak");
    h.trips("tree: no wave renders but a download exists", tree({ "ai-models.html": "x", "data/model-dashboard/pilot-x.csv": "x" }, []), "TREE-leak");
    h.trips("tree: no wave renders but the sitemap lists the dashboard", tree({ "ai-models.html": "x", "sitemap.xml": sm }, []), "TREE-leak");
    h.trips("tree: no wave renders but /ai-models links the dashboard", tree({ "ai-models.html": `<a href="/ai-models/dashboard">d</a>` }, []), "TREE-leak");
    h.clean("tree: no wave renders and nothing was emitted passes", tree({ "ai-models.html": "x" }, []));
    h.trips("tree: an official wave never renders, whatever its decision status", tree({ ...good }, man.map((e) => ({ ...e, status: "official", official: true }))), "TREE-leak");
    h.trips("tree: the page of a rendering wave is missing", tree({ ...good, "ai-models/dashboard/pilot-x.html": undefined } && Object.fromEntries(Object.entries(good).filter(([k]) => k !== "ai-models/dashboard/pilot-x.html"))), "TREE-missing");
    h.trips("tree: a download of a non-rendering wave is emitted", tree({ ...good, "data/model-dashboard/pilot-y.csv": "x" }), "TREE-leak");
    h.trips("tree: no link from /ai-models", tree({ ...good, "ai-models.html": "x" }), "TREE-missing");
    h.trips("tree: the dashboard missing from the sitemap", tree({ ...good, "sitemap.xml": "<urlset></urlset>" }), "G20-sitemap");
    h.trips("tree: the dashboard sitemap entry says never", tree({ ...good, "sitemap.xml": sm.replace("weekly", "never") }), "G20-sitemap");
    h.trips("tree: the dashboard sitemap lastmod is not the report date", tree({ ...good, "sitemap.xml": sm.replace("2026-10-03", "2026-10-04") }), "G20-sitemap");
    h.trips("sitemap: a second wave without its permanent-page entry", dashboardSitemapProblems(sm, [{ run_id: "pilot-y", report_date: "2026-10-03" }, { run_id: "pilot-x", report_date: "2026-10-02" }]), "G20-sitemap");
    // the dashboard gate on the tree (QA M1): ratified pilot reports (waves render) but D-29b not ratified => nothing may be emitted
    h.clean("tree: gate closed (D-29b proposed), waves render, nothing emitted passes", tree({ "ai-models.html": "x" }, man, D_CLOSED));
    h.trips("tree: gate closed but out/ai-models/dashboard.html exists (the planted leak)", tree({ "ai-models.html": "x", "ai-models/dashboard.html": "x" }, man, D_CLOSED), "TREE-leak");
    h.trips("tree: gate closed but a per-wave dashboard page was emitted", tree({ "ai-models.html": "x", "ai-models/dashboard/pilot-x.html": "x" }, man, D_CLOSED), "TREE-leak");
    h.trips("tree: gate closed but a download was emitted", tree({ "ai-models.html": "x", "data/model-dashboard/pilot-x.json": "{}" }, man, D_CLOSED), "TREE-leak");
    h.trips("tree: gate closed but the sitemap lists the dashboard", tree({ "ai-models.html": "x", "sitemap.xml": sm }, man, D_CLOSED), "TREE-leak");
    h.trips("tree: gate closed but /ai-models links the dashboard", tree({ "ai-models.html": `<a href="/ai-models/dashboard">d</a>` }, man, D_CLOSED), "TREE-leak");
    h.trips("tree: the full dashboard tree of an open gate is a leak under a closed gate (same files, decision flipped)", tree(good, man, D_CLOSED), "TREE-leak");
    h.clean("tree: the same full tree passes once the gate is open (preview env)", tree(good, man, D_CLOSED, { CB_PREVIEW_DASHBOARD: "1" }));
    h.trips("tree: open gate but the dashboard page is missing (fail-on-zero)", tree({ "ai-models.html": `<a href="/ai-models/dashboard">d</a>` }), "TREE-missing");
    rmSync(reportsDir, { recursive: true, force: true });
  }

  // ------------------------------------------------------------- source
  h.section("source: the dashboard reads only the public projection (FR-02 AC2)");
  {
    const files = [
      ...listFiles(join(SITE, "src", "components", "model-benchmark", "dashboard")).map((f) => join(SITE, "src", "components", "model-benchmark", "dashboard", f)),
      join(SITE, "src", "lib", "model-dashboard-facts.ts"), join(SITE, "src", "lib", "model-dashboard-copy.ts"),
      join(SITE, "scripts", "lib", "model-dashboard-core.mjs"), join(SITE, "scripts", "build-model-dashboard-data.mjs"),
      join(SITE, "src", "app", "ai-models", "dashboard", "page.dashboard.tsx"), join(SITE, "src", "app", "ai-models", "dashboard", "[runId]", "page.dashboard.tsx"),
    ];
    // Comments may name what is forbidden; only code is scanned.
    const code = (f) => readFileSync(f, "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'`])\/\/[^\n]*/g, "$1");
    await h.check("no file reads analysis.json, research/model-runs or a run directory", () => {
      const bad = files.filter((f) => /analysis\.json|research[\\/]model-runs|model-runs[\\/]/.test(code(f)));
      h.assert(bad.length === 0, bad.join(", "));
    });
    await h.check("the components and the copy never load a wave (loadWave, loadRenderable, assertRenderable) nor import wave values", () => {
      const comps = files.filter((f) => /components[\\/]model-benchmark[\\/]dashboard/.test(f) || /model-dashboard-copy/.test(f));
      const bad = comps.filter((f) => /\bloadWave\b|\bloadRenderable\b|\bassertRenderable\b|readFileSync|from "@\/lib\/model-report-gate"/.test(code(f)));
      h.assert(bad.length === 0, bad.join(", "));
      const valueImports = comps.filter((f) => /import\s+(?!type)[^;]*from "@\/lib\/model-wave-facts"/.test(code(f)));
      h.assert(valueImports.length === 0, `value imports of model-wave-facts: ${valueImports.join(", ")}`);
    });
    await h.check("the adapter projects before it uses a wave (projectWavePublic is applied and checked with projectionProblems)", () => {
      const src = code(join(SITE, "src", "lib", "model-dashboard-facts.ts"));
      h.assert(/projectWavePublic\(internal\)/.test(src) && /projectionProblems\(pub, internal\)/.test(src), "projection step missing");
      const fn = src.slice(src.indexOf("projectionProblems(pub, internal)"), src.indexOf("export function loadDashboardData"));
      h.assert(!/\binternal\b/.test(fn.slice(fn.indexOf("\n"))), "the raw wave is used after projection");
    });
    await h.check("the client island imports no module that reads the file system", () => {
      const f = code(join(SITE, "src", "components", "model-benchmark", "dashboard", "DashboardShell.tsx"));
      h.assert(!/node:fs|model-report-facts|figure-kit|model-dashboard-facts|model-wave-facts/.test(f), "forbidden import");
    });
    await h.check("the static download script writes only from the projection, and the page links the same files", () => {
      const f = code(join(SITE, "scripts", "build-model-dashboard-data.mjs"));
      h.assert(/projectWavePublic\(wave\)/.test(f) && /projectionProblems\(pub, wave\)/.test(f), "projection step missing");
    });
    await h.check("the prebuild chain builds the downloads and the post-build chain runs this test", () => {
      const pkg = JSON.parse(readFileSync(join(SITE, "package.json"), "utf8"));
      h.assert(pkg.scripts.prebuild.includes("build-model-dashboard-data.mjs"), "prebuild");
      h.assert(pkg.scripts.build.includes("test-model-dashboard.mjs --tree-only --require-out"), "build");
      h.assert(pkg.scripts.test.includes("test:model-dashboard"), "test");
    });
  }

  // ------------------------------------------------------ static files vs projection
  h.section("static downloads in public/data/model-dashboard equal the projection's rows (FR-24 AC2)");
  for (const wv of committed) {
    const dir = join(SITE, "public", "data", "model-dashboard");
    const renders = renderableEntries(manifest, process.env, { reportsDir: REPORTS_DIR }).some((x) => x.entry.run_id === wv.run_id);
    if (!renders || !existsSync(join(dir, `${wv.run_id}.csv`))) { h.log(`  SKIP ${wv.run_id}: no generated file (run the prebuild step build-model-dashboard-data.mjs)`); continue; }
    await h.check(`${wv.run_id}: the generated CSV and JSON equal the rows of a fresh projection and carry no withheld value`, () => {
      const pub = projectWavePublic(wv);
      const rows = core.dashboardRows(pub);
      const csv = readFileSync(join(dir, `${wv.run_id}.csv`), "utf8");
      const json = readFileSync(join(dir, `${wv.run_id}.json`), "utf8");
      const meta = JSON.parse(json).meta;
      h.assert(csv === core.rowsToCsv(rows, meta), "CSV differs from the fresh rows");
      h.assert(JSON.stringify(JSON.parse(json).rows) === JSON.stringify(core.exportJson(rows, meta).rows), "JSON rows differ");
      const p = downloadProblems({ csv, json, wave: wv });
      h.assert(p.length === 0, p.join(" | "));
    });
  }
  void report;
}

// ===========================================================================
// The built tree
// ===========================================================================
h.section("the built tree in site/out");
if (haveOut(h)) {
  const env = process.env;
  // The dashboard's own gate (D-29b ratified or CB_PREVIEW_DASHBOARD=1) on top of the wave rule: closed means the built tree must hold no dashboard output.
  const rendering = dashboardEntries(manifest, env, { reportsDir: REPORTS_DIR });
  const reported = reportedWaves(waves, REPORTS_DIR);
  await h.check("render gate: the built tree matches the manifest and the environment (route, downloads, sitemap, link from /ai-models)", () => {
    const p = dashboardTreeProblems({ outDir: OUT_DIR, manifest, env, reportsDir: REPORTS_DIR });
    h.assert(p.length === 0, p.join(" | ").slice(0, 900));
  });
  const files = dashboardHtmlFiles(OUT_DIR);
  h.log(`  info ${files.length} dashboard page(s): ${files.join(", ") || "none"}; ${rendering.length} wave(s) render`);
  await h.check("fail-on-zero: a rendering build emitted dashboard pages, a non-rendering build emitted none", () => {
    if (rendering.length > 0) h.assert(files.length === rendering.length + 1, `${files.length} page(s) for ${rendering.length} wave(s)`);
    else h.assert(files.length === 0, `${files.length} page(s) with nothing rendering`);
  });
  const latest = [...rendering].sort((a, b) => (a.entry.report_date < b.entry.report_date ? 1 : -1))[0]?.entry.run_id ?? null;
  for (const f of files) {
    const html = readFileSync(join(OUT_DIR, f), "utf8");
    const owner = ownerWaveOf(f, waves);
    await h.check(`${f}: its wave is identified`, () => h.assert(owner !== null, "no owner wave"));
    if (!owner) continue;
    const wave = owner;
    const projected = projectWavePublic(wave);
    const tier = html.match(/<dt>Access tier<\/dt><dd>([^<]*)<\/dd>/)?.[1] ?? "";
    const label = figureLabelOf(wave.run_id, wave.report_date, tier);
    const isLatest = wave.run_id === latest;
    const canonical = isLatest ? `${SITE_URL}${DASHBOARD_PATH}` : `${SITE_URL}${DASHBOARD_PATH}/${wave.run_id}`;
    const expected = { title: `Unofficial Pilot: AI Model Compassion Dashboard (${monthYear(wave.report_date)})`, canonical, buildIds: [...new Set(wave.design.subjects.map((s) => core.buildOf(projected, s)))] };
    h.clean(`${f}: G19 dashboard kind (${wave.run_id})`, leakProblems({ html, wave, kind: "dashboard" }));
    h.clean(`${f}: G20 title, meta, canonical, JSON-LD`, dashboardSeoProblems({ html, wave, expected }));
    h.clean(`${f}: structure and integrity rules`, dashboardStructureProblems({ html, wave, label, allWaves: reported, officialCount: 0 }));
    h.clean(`${f}: template D lexicon over all text`, dashboardLexiconProblems(html, wave));
    h.clean(`${f}: chart = table`, chartTableProblems(html, wave));
    await h.check(`${f}: HTML within the gzip budget`, () => { const n = gzipSync(readFileSync(join(OUT_DIR, f))).length; h.assert(n <= GZIP_HTML_MAX, `${n} bytes gzip`); h.log(`    info ${f}: ${n} bytes gzip`); });
  }
  for (const { entry } of rendering) {
    await h.check(`${entry.run_id}: the static CSV and JSON downloads are in out/ and pass the withheld checks`, () => {
      const csv = readFileSync(join(OUT_DIR, "data", "model-dashboard", `${entry.run_id}.csv`), "utf8");
      const json = readFileSync(join(OUT_DIR, "data", "model-dashboard", `${entry.run_id}.json`), "utf8");
      const wave = waves.find((w) => w.run_id === entry.run_id);
      const pub = projectWavePublic(wave);
      const rows = core.dashboardRows(pub);
      const meta = JSON.parse(json).meta;
      h.assert(csv === core.rowsToCsv(rows, meta), "CSV differs from a fresh projection");
      h.assert(/^[0-9a-f]{64}$/.test(meta.wave_sha256 ?? ""), "meta.wave_sha256 missing");
      const p = downloadProblems({ csv, json, wave });
      h.assert(p.length === 0, p.join(" | "));
    });
  }
  if (rendering.length > 0) {
    await h.check("JS budget: the dashboard's client chunk is within 60 KB gzip and no third-party request is added", () => {
      const dir = join(OUT_DIR, "_next", "static", "chunks");
      const chunks = existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith(".js")) : [];
      const mine = chunks.filter((f) => readFileSync(join(dir, f), "utf8").includes("dash_view"));
      h.assert(mine.length > 0, "no chunk carries the dashboard island");
      const total = mine.reduce((a, f) => a + gzipSync(readFileSync(join(dir, f))).length, 0);
      h.assert(total <= JS_GZIP_MAX, `${total} bytes gzip`);
      h.log(`    info island chunk(s) ${mine.join(", ")}: ${total} bytes gzip`);
    });
    await h.check("/ai-models links the dashboard once and names no model beside it", () => {
      const idx = readFileSync(join(OUT_DIR, "ai-models.html"), "utf8");
      h.assert((idx.match(/href="\/ai-models\/dashboard"/g) ?? []).length === 1, "link count");
    });
  }
  void statSync;
}
h.finish();
