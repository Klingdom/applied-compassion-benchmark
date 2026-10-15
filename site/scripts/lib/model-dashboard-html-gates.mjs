/**
 * model-dashboard-html-gates.mjs -- HTML-level gates for the AI Model Compassion Dashboard
 * (site/out/ai-models/dashboard.html and site/out/ai-models/dashboard/<run_id>.html).
 *
 * Pure functions of an HTML string, a wave object or a directory path, so each is proved with a planted probe
 * (test-model-dashboard.mjs) and then pointed at the real built tree. They EXTEND the report gates
 * (model-report-html-gates.mjs); they do not replace them:
 *
 *   leakProblems(kind:"dashboard")  L1 to L6 and L6b of G19, the SAME withholding rules as a report (the dashboard shows the per-model
 *                                   ranges a report shows), instead of L7 (which would forbid every per-model figure)
 *   dashboardSeoProblems            G20 for the dashboard: title / meta / canonical / JSON-LD / leaderboard terms near a model name
 *   dashboardStructureProblems      the dashboard's own integrity rules (label on every figure, "Not separated" first, alphabetical,
 *                                   no sort or weight control, one wave, role=img with title and description, duty of care, default view)
 *   dashboardLexiconProblems        template D lexicon over every text block and attribute
 *   dashboardTreeProblems           the render gate on the built tree (route, downloads, sitemap, link from /ai-models)
 *
 * Rule ids: DASH-*, G20-* (shared with the report gate), G19-* (shared), TREE-*.
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { lexiconProblems, makeNaming } from "./model-report.mjs";
import {
  aiModelsFiles, attributeTexts, bannerProblems, decode, extractJsonLd, figureTokenProblems, jsonLdStrings, LEADERBOARD_TERMS, listFiles,
  ratingSchemaProblems, SITE_URL, textBlocks, ctaProblems,
} from "./model-report-html-gates.mjs";
import { dashboardEntries } from "./dashboard-render-gate.mjs";
import { buildIds } from "./model-dashboard-core.mjs";

const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const alpha = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
const cellText = (inner) => decode(inner.replace(/<!--[\s\S]*?-->/g, "").replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();

export const DASHBOARD_PATH = "/ai-models/dashboard";
/** JSON-LD types the dashboard may carry (PRD section 10). Everything else, and every rating type, is a failure. */
export const ALLOWED_LD_TYPES = ["WebPage", "CollectionPage", "BreadcrumbList", "ListItem", "Organization", "ResearchOrganization", "WebSite", "ImageObject", "FAQPage", "Question", "Answer"];

export const dashboardFiles = (outDir) => aiModelsFiles(outDir).filter((f) => f === "ai-models/dashboard.html" || f === "ai-models/dashboard.txt" || f.startsWith("ai-models/dashboard/"));
export const dashboardHtmlFiles = (outDir) => dashboardFiles(outDir).filter((f) => f.endsWith(".html"));

const metaContent = (html, attr, name) => {
  const m = html.match(new RegExp(`<meta\\b[^>]*\\b${attr}="${escRe(name)}"[^>]*>`, "i"));
  const c = m?.[0].match(/\bcontent="([^"]*)"/i);
  return c ? decode(c[1]) : null;
};

/** The wave's own run-id-free copy of what the page must state about itself. */
export const figureLabelOf = (runId, reportDate, tier) => `Unofficial pilot · ${runId} · ${reportDate} · ${tier} · not a score · comparability none`;

// ---------------------------------------------------------------------------
// Lexicon over every text block and attribute (T3)
// ---------------------------------------------------------------------------

/**
 * Template D lexicon over everything a reader or tool can read on the page. A block that quotes the wave verbatim (the wave's own
 * notes, marked data-verbatim, and the system messages in <pre>) is the data's words, not the page's copy, and is not re-judged here:
 * the wave-validation step already judged them.
 */
export function dashboardLexiconProblems(html, wave) {
  const p = [];
  const naming = makeNaming(wave);
  const main = html.match(/<main\b[\s\S]*<\/main>/i)?.[0] ?? html; // the site's own navigation and footer are not this page's copy
  const src = main.replace(/<(p|pre|code)\b[^>]*data-verbatim[^>]*>[\s\S]*?<\/\1>/gi, "").replace(/<pre\b[^>]*>[\s\S]*?<\/pre>/gi, "");
  for (const t of [...textBlocks(src), ...attributeTexts(src)]) {
    for (const q of lexiconProblems(t, wave, naming)) p.push(`DASH-lexicon: ${q.rule}: ${q.message}`);
    if (/\bprovisional\b/i.test(t)) p.push(`DASH-lexicon: the word "provisional" in: "${t.slice(0, 80)}"`);
  }
  return p;
}

// ---------------------------------------------------------------------------
// G20 for the dashboard
// ---------------------------------------------------------------------------

/**
 * @param {{html: string, wave: object, expected: {title: string, canonical: string, preview?: boolean, buildIds?: string[]}}} a
 */
export function dashboardSeoProblems({ html, wave, expected }) {
  const p = [];
  const naming = makeNaming(wave);
  const lex = (label, text) => { for (const q of lexiconProblems(text, wave)) p.push(`G20-lexicon (${label}): ${q.rule}: ${q.message}`); };
  const head = html.split(/<\/head>/i)[0];
  const titles = [...head.matchAll(/<title\b[^>]*>([\s\S]*?)<\/title>/gi)].map((m) => decode(m[1]));
  if (titles.length !== 1) p.push(`G20-title: expected exactly one <title>, found ${titles.length}`);
  const title = titles[0] ?? "";
  if (!/^Unofficial Pilot:/.test(title)) p.push(`G20-title: the title must start with "Unofficial Pilot:" (got "${title.slice(0, 60)}")`);
  if (expected.title && title !== expected.title) p.push(`G20-title: "${title}" differs from the title built from the wave ("${expected.title}")`);
  if (naming.mentions(title).length) p.push("G20-title: the title names a model");
  if (/\d/.test(title.replace(/\((?:[A-Z][a-z]{2}) \d{4}\)/, ""))) p.push("G20-title: the title carries a number beyond the month and year");
  lex("title", title);

  const desc = metaContent(html, "name", "description");
  if (!desc) p.push("G20-meta: no meta description");
  else {
    lex("meta description", desc);
    p.push(...figureTokenProblems("meta description", desc, wave));
    if (naming.mentions(desc).length) p.push("G20-meta: the meta description names a model");
  }
  const canon = [...html.matchAll(/<link\b[^>]*\brel="canonical"[^>]*>/gi)].map((m) => m[0].match(/\bhref="([^"]*)"/i)?.[1]);
  if (canon.length !== 1) p.push(`G20-canonical: expected exactly one canonical link, found ${canon.length}`);
  else if (canon[0] !== expected.canonical) p.push(`G20-canonical: "${canon[0]}" is not the expected absolute URL ${expected.canonical}`);
  const robots = metaContent(html, "name", "robots");
  if (!expected.preview && robots && /noindex/i.test(robots)) p.push(`G20-robots: the dashboard is noindex ("${robots}")`);
  for (const k of ["og:title", "og:description"]) {
    const v = metaContent(html, "property", k);
    if (!v) p.push(`G20-og: ${k} missing`);
    else { lex(k, v); p.push(...figureTokenProblems(k, v, wave)); }
  }
  const ogUrl = metaContent(html, "property", "og:url");
  if (ogUrl && ogUrl !== expected.canonical) p.push(`G20-og: og:url "${ogUrl}" is not ${expected.canonical}`);
  for (const k of ["twitter:title", "twitter:description"]) {
    const v = metaContent(html, "name", k);
    if (v) { lex(k, v); p.push(...figureTokenProblems(k, v, wave)); }
  }

  // JSON-LD: only WebPage / CollectionPage, BreadcrumbList, Organization-ish, FAQPage with visible questions. Never a rating type.
  p.push(...ratingSchemaProblems(html));
  const blocks = extractJsonLd(html);
  const nodes = [];
  const walk = (x) => { if (Array.isArray(x)) x.forEach(walk); else if (x && typeof x === "object") { nodes.push(x); Object.values(x).forEach(walk); } };
  blocks.forEach(walk);
  for (const n of nodes) for (const t of [].concat(n["@type"] ?? [])) if (!ALLOWED_LD_TYPES.includes(t)) p.push(`G20-jsonld: JSON-LD type "${t}" is not allowed on the dashboard`);
  if (!nodes.some((o) => [].concat(o["@type"] ?? []).some((t) => t === "WebPage" || t === "CollectionPage"))) p.push("G20-jsonld: no WebPage or CollectionPage node");
  if (!nodes.some((o) => [].concat(o["@type"] ?? []).includes("BreadcrumbList"))) p.push("G20-jsonld: no BreadcrumbList");
  for (const n of nodes) if ("sameAs" in n && ![].concat(n["@type"] ?? []).some((t) => /Organization/.test(t))) p.push("G20-jsonld: a non-Organization node carries sameAs");
  const body = textBlocks(html).join("\n");
  for (const n of nodes.filter((o) => [].concat(o["@type"] ?? []).includes("Question"))) {
    if (!body.includes(String(n.name ?? "").slice(0, 40))) p.push(`G20-jsonld: FAQPage question "${String(n.name).slice(0, 50)}" is not visible on the page`);
  }
  for (const { key, text, node } of jsonLdStrings(blocks)) {
    if ([].concat(node["@type"] ?? []).some((t) => /Organization|WebSite|ImageObject/.test(t))) continue;
    if (/^(?:@|url|item|mainEntityOfPage|isBasedOn|isPartOf|inLanguage|datePublished|dateModified|dateCreated)$/.test(key)) continue;
    lex(`JSON-LD ${key}`, text);
    p.push(...figureTokenProblems(`JSON-LD ${key}`, text, wave));
    if (naming.mentions(text).length) p.push(`G20-jsonld: JSON-LD ${key} names a model`);
  }

  // Leaderboard terms within 60 characters of a model name in headings, captions, alt text and JSON-LD.
  const near = (label, text) => {
    for (const m of naming.mentions(text)) {
      const win = text.slice(Math.max(0, m.start - 60), m.end + 60);
      const hit = win.match(LEADERBOARD_TERMS);
      if (hit && !/\b(?:not|no|never|cannot)\b[^.]{0,40}\b(?:rank|ranking|leaderboard)/i.test(win)) p.push(`G20-near-model: "${hit[0]}" within 60 characters of a model name in ${label}: "${win.slice(0, 90)}"`);
    }
  };
  for (const m of html.matchAll(/<(h[1-3]|figcaption|caption)\b[^>]*>([\s\S]*?)<\/\1>/gi)) near(m[1], cellText(m[2]));
  for (const t of attributeTexts(html)) near("an attribute (alt/aria-label/title)", t);
  for (const { text } of jsonLdStrings(blocks)) near("JSON-LD", text);

  const h1s = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)];
  if (h1s.length !== 1) p.push(`G20-structure: expected one <h1>, found ${h1s.length}`);
  else if (naming.mentions(cellText(h1s[0][1])).length) p.push("G20-structure: the h1 names a model");
  const main = html.match(/<main\b[\s\S]*<\/main>/i)?.[0] ?? html;
  if (/href="\/ai-lab\//i.test(main)) p.push("G20-links: the dashboard links to an AI Labs entity page (D-23: lab and model scores are never fused)");
  // No per-model anchors or ids (D-29a item 1): no element id equals a build or subject id.
  const ids = new Set([...(html.matchAll(/\sid="([^"]+)"/g))].map((m) => m[1]));
  for (const s of [...(expected.buildIds ?? []), ...wave.design.subjects]) if (ids.has(s)) p.push(`DASH-anchor: an element has id="${s}" (a per-model anchor)`);
  return p;
}

// ---------------------------------------------------------------------------
// Structure and integrity of one dashboard page
// ---------------------------------------------------------------------------

const sectionOf = (html, code) => {
  const m = html.match(new RegExp(`<section\\b[^>]*data-panel="${code}"[^>]*>([\\s\\S]*?)</section>`));
  return m ? m[1] : null;
};

/**
 * @param {{html: string, wave: object, label: string, allWaves?: object[], officialCount?: number}} a
 *   `label` = the FigureLabel the page must carry (figureLabelOf); `allWaves` = every wave of the manifest (to prove one wave per page).
 */
export function dashboardStructureProblems({ html, wave, label, allWaves = [], officialCount = 0 }) {
  const p = [];
  p.push(...bannerProblems(html));
  p.push(...ctaProblems(html));
  const text = decode(html.replace(/<script\b[\s\S]*?<\/script>/gi, "").replace(/<style\b[\s\S]*?<\/style>/gi, "").replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ");

  // The label on every figure, every panel and every table.
  const figures = [...html.matchAll(/<figure\b[^>]*>([\s\S]*?)<\/figure>/gi)];
  if (figures.length === 0) p.push("DASH-figure: the page has no <figure>");
  figures.forEach((f, i) => {
    const t = decode(f[1].replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ");
    if (!t.includes(label)) p.push(`DASH-figure-label: figure ${i + 1} does not carry "${label}" (run id, date, access tier, not a score, comparability none)`);
    if (!/<details\b/i.test(f[1])) p.push(`DASH-figure-table: figure ${i + 1} has no <details> data table`);
    if (!/UNOFFICIAL PILOT/.test(f[1]) && !/role="img"[^>]*aria-label=/.test(f[1])) p.push(`DASH-figure-footer: figure ${i + 1} has no in-figure "UNOFFICIAL PILOT" footer`);
  });
  const panels = [...html.matchAll(/<section\b[^>]*data-panel="([a-z]+)"[^>]*>([\s\S]*?)<\/section>/gi)];
  for (const [, code, inner] of panels) if (!decode(inner.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").includes(label)) p.push(`DASH-panel-label: panel ${code} does not carry the figure label`);
  for (const t of html.matchAll(/<table\b[^>]*>([\s\S]*?)<\/table>/gi)) {
    const cap = cellText(t[1].match(/<caption\b[^>]*>([\s\S]*?)<\/caption>/i)?.[1] ?? "");
    if (!cap) p.push("DASH-table: a table has no caption");
    else if (!cap.startsWith(label)) p.push(`DASH-table-label: a table caption does not start with the figure label: "${cap.slice(0, 80)}"`);
    if (!/<th\b[^>]*scope=/i.test(t[1])) p.push("DASH-table: a table has no <th scope>");
  }

  // role="img": labelled by existing, non-empty title and description.
  for (const m of html.matchAll(/<(\w+)\b[^>]*role="img"[^>]*>/gi)) {
    const lab = m[0].match(/aria-labelledby="([^"]+)"/i)?.[1];
    const al = m[0].match(/aria-label="([^"]+)"/i)?.[1];
    if (!lab && !al) { p.push(`DASH-a11y: role="img" without an accessible name: ${m[0].slice(0, 80)}`); continue; }
    for (const id of (lab ?? "").split(/\s+/).filter(Boolean)) {
      const el = html.match(new RegExp(`<(\\w+)\\b[^>]*\\bid="${escRe(id)}"[^>]*>([\\s\\S]*?)</\\1>`));
      if (!el || !cellText(el[2])) p.push(`DASH-a11y: role="img" refers to id "${id}" that is missing or empty`);
    }
  }
  // The page's own article (the site's navigation and footer carry icons this page does not author).
  const article = html.match(/<article\b[^>]*class="pilot-report dashboard"[\s\S]*<\/article>/i)?.[0] ?? html;
  for (const m of article.matchAll(/<svg\b[^>]*>/gi)) if (!/aria-hidden="true"/.test(m[0]) && !/role="img"/.test(m[0])) p.push(`DASH-a11y: an <svg> is neither aria-hidden nor role="img": ${m[0].slice(0, 60)}`);
  for (const m of article.matchAll(/<button\b[^>]*>/gi)) if (!/\btype="/.test(m[0])) p.push(`DASH-a11y: a <button> without a type: ${m[0].slice(0, 60)}`);
  if ((html.match(/<h1\b/gi) ?? []).length !== 1) p.push("DASH-a11y: expected one <h1>");

  // "Not separated" before any per-model figure, and alphabetical order inside every block.
  const comp = sectionOf(html, "comp");
  if (comp) {
    const groups = wave.derived.not_separated_groups ?? [];
    const firstFig = comp.search(/<figure\b/i);
    const firstGroup = comp.search(/Not separated/);
    if (groups.length && (firstGroup < 0 || (firstFig >= 0 && firstGroup > firstFig))) p.push("DASH-order: the \"Not separated\" statement does not come before the first per-model figure");
    if (groups.length) {
      const headIdx = comp.search(/class="dash-grouphead"[^>]*>\s*<strong>Not separated/);
      const firstRow = comp.search(/class="dash-row"/);
      if (headIdx < 0 || (firstRow >= 0 && headIdx > firstRow)) p.push("DASH-order: the first block of the composite figure is not the \"Not separated\" block");
    }
    for (const b of comp.matchAll(/<div class="dash-block"[^>]*>([\s\S]*?)(?=<div class="dash-block"|<(?:svg|div) class="dash-foot")/g)) {
      const ids = [...b[1].matchAll(/class="dash-row"[^>]*data-subjects="([^"]+)"/g)].map((m) => m[1]);
      const sorted = [...ids].sort(alpha);
      if (JSON.stringify(ids) !== JSON.stringify(sorted)) p.push(`DASH-order: a block is not alphabetical: ${ids.join(", ")}`);
    }
  }

  // No sort, rank-by or weight control anywhere (T8).
  for (const m of article.matchAll(/<(input|select|option|label|button|summary)\b[^>]*>([\s\S]*?)(?=<\/\1>|$)/gi)) {
    const bit = `${m[0].slice(0, m[0].indexOf(">") + 1)} ${cellText(m[2])}`;
    if (m[1].toLowerCase() === "select") p.push("DASH-sort-control: a <select> control (a sort or weight picker) is in the DOM");
    if (/type="range"/i.test(bit)) p.push("DASH-weight-control: a range slider (a weight control) is in the DOM");
    if (/\b(sort|sorted|sort by|order by|rank by|weights?|re-?weight)\b/i.test(bit)) p.push(`DASH-sort-control: a control mentions sorting or weighting: ${bit.slice(0, 80)}`);
  }

  // One wave: no other run id outside the wave list, and no subject unique to another wave anywhere.
  // (The framework's inline payload scripts carry the whole tree, wave list included; only what a reader can see is judged.)
  const noNav = html.replace(/<script\b[\s\S]*?<\/script>/gi, "").replace(/<nav\b[^>]*aria-label="Waves"[^>]*>[\s\S]*?<\/nav>/i, "");
  const noNavText = decode(noNav.replace(/<script\b[\s\S]*?<\/script>/gi, "").replace(/<[^>]+>/g, " "));
  for (const w of allWaves) {
    if (w.run_id === wave.run_id) continue;
    if (noNav.includes(w.run_id)) p.push(`DASH-two-waves: the run id ${w.run_id} appears outside the wave list`);
    // A build id of this wave may equal a subject id of another wave, and this wave's judges may be subjects of another (pilot 1's subjects judge pilots 2 and 3):
    // those are this wave's own names. Only a name that is NOT one of this wave's subjects, builds or judges counts as another wave's subject.
    const mine = new Set([...wave.design.subjects, ...buildIds(wave), ...Object.keys(wave.judges ?? {}), ...(wave.design.judges ?? [])]);
    for (const s of w.design.subjects) {
      if (mine.has(s)) continue;
      if (new RegExp(`(?<![A-Za-z0-9.-])${escRe(s)}(?![A-Za-z0-9.-])`).test(noNavText)) p.push(`DASH-two-waves: subject "${s}" of wave ${w.run_id} appears on the page of ${wave.run_id}`);
    }
  }
  if (!text.includes(wave.run_id)) p.push("DASH-wave: the page does not state its run id");

  // Duty of care: present, no CTA / model name / link inside.
  const duty = html.match(/<section\b[^>]*data-duty-of-care[^>]*>([\s\S]*?)<\/section>/i)?.[1];
  if (!duty) p.push("DASH-duty: no duty-of-care section on the page");
  else {
    const dt = cellText(duty);
    if (!/emergency service or crisis line/i.test(dt)) p.push("DASH-duty: the duty-of-care note lost its crisis-line sentence");
    if (/<a\b|<button\b/i.test(duty)) p.push("DASH-duty: a link or button sits inside the duty-of-care note");
    if (makeNaming(wave).mentions(dt).length) p.push("DASH-duty: a model name sits inside the duty-of-care note");
    if (/\d/.test(dt)) p.push("DASH-duty: a number sits inside the duty-of-care note");
  }
  // Status: with no official score the first sentence of the status block says so.
  const status = html.match(/<section\b[^>]*aria-labelledby="status-h"[^>]*>([\s\S]*?)<\/section>/i)?.[1] ?? "";
  if (!status) p.push("DASH-status: no program status section");
  else if (officialCount === 0 && !/<p>No model has an official score\.<\/p>/.test(status)) p.push("DASH-status: the first sentence of the status block is not \"No model has an official score.\"");

  // Not measured: a state, never a number.
  for (const m of html.matchAll(/<li\b[^>]*data-nm-state="not-measured"[^>]*>([\s\S]*?)<\/li>/gi)) {
    const t = cellText(m[1]);
    if (/\d/.test(t)) p.push(`DASH-not-measured: a "Not measured yet" row carries a digit: "${t.slice(0, 80)}"`);
    if (!/Not measured yet/.test(t)) p.push(`DASH-not-measured: a not-measured row lacks the words "Not measured yet": "${t.slice(0, 80)}"`);
  }

  // The default view (no JavaScript): nothing is hidden by the server except the controls, the panel stubs and the empty-state placeholders.
  for (const m of html.matchAll(/<[^>]*\bdata-(?:subjects|panel|dim|block)=[^>]*>/gi)) if (/\shidden(?:=|\s|>|\/)/.test(m[0])) p.push(`DASH-default-view: the server hides a figure element: ${m[0].slice(0, 80)}`);
  if (!/Filters, sharing and the chart and table switch need JavaScript/.test(html)) p.push("DASH-noscript: the no-JavaScript line is missing");
  const controls = html.match(/<section\b[^>]*class="dash-controls"[^>]*>/i)?.[0];
  if (!controls) p.push("DASH-controls: no control bar in the server HTML");
  else if (!/\shidden(?:=|\s|>)/.test(controls)) p.push("DASH-controls: the control bar is not hidden until JavaScript runs (it would be inert)");

  // Static downloads for the whole wave are plain links.
  for (const ext of ["csv", "json"]) if (!new RegExp(`href="/data/model-dashboard/${escRe(wave.run_id)}\\.${ext}"[^>]*download`).test(html)) p.push(`DASH-download: no static <a download> link to the whole-wave ${ext}`);
  if (/<script[^>]*src="https?:\/\//i.test(html.replace(/<script[^>]*src="https:\/\/(?:cloud\.umami\.is|[^"]*\/u\/script\.js)[^"]*"[^>]*>/gi, ""))) p.push("DASH-third-party: a third-party script is loaded");
  return p;
}

// ---------------------------------------------------------------------------
// Chart equals table (T4)
// ---------------------------------------------------------------------------

/** Ranges in a panel's chart description ("<id> lo to hi") against ranges in its table. Both must list the same (id, range) set. */
export function chartTableProblems(html, wave) {
  const p = [];
  const range = String.raw`-?\d+\.\d+ to -?\d+\.\d+`;
  const comp = sectionOf(html, "comp");
  if (comp) {
    const desc = comp.match(/id="dash-composite-d"[^>]*>([\s\S]*?)<svg class="dash-axis"/)?.[1] ?? "";
    const fromDesc = new Set([...cellText(desc).matchAll(new RegExp(String.raw`(?:^|\s)([A-Za-z][A-Za-z0-9._-]*) (${range})`, "g"))].map((m) => `${m[1]}|${m[2]}`));
    const fromTable = new Set();
    for (const row of comp.matchAll(/<tr\b[^>]*data-subjects="[^"]+"[^>]*>([\s\S]*?)<\/tr>/g)) {
      const cells = [...row[1].matchAll(/<t[hd]\b[^>]*>([\s\S]*?)<\/t[hd]>/g)].map((c) => cellText(c[1]));
      const id = cells[0]?.split(" (")[0];
      if (id && cells[1]) fromTable.add(`${id}|${cells[1]}`);
    }
    for (const k of fromTable) if (!fromDesc.has(k)) p.push(`DASH-chart-table: the composite table row ${k} is not in the chart description`);
    for (const k of fromDesc) if (!fromTable.has(k)) p.push(`DASH-chart-table: the composite chart description lists ${k}, which is not in the table`);
    if (fromTable.size === 0) p.push("DASH-chart-table: the composite table has no rows");
    if (fromTable.size !== wave.design.subjects.length) p.push(`DASH-chart-table: the composite table lists ${fromTable.size} subjects, the wave has ${wave.design.subjects.length}`);
  }
  return p;
}

// ---------------------------------------------------------------------------
// The built tree
// ---------------------------------------------------------------------------

/**
 * The render gate on the built tree.
 *   - Gate closed or no wave renders: no dashboard HTML or payload, no download directory, no sitemap entry, no link from /ai-models.
 *   - Waves render: out/ai-models/dashboard.html and one page per rendering wave; downloads for exactly those waves; sitemap entries
 *     (the entry page weekly with the newest report date; each non-newest wave never with its own date); /ai-models links the dashboard.
 */
export function dashboardTreeProblems({ outDir, manifest, env, reportsDir, decision }) {
  const p = [];
  // The dashboard's OWN gate (dashboard-render-gate.mjs): closed (D-29b not ratified, no CB_PREVIEW_DASHBOARD=1) means nothing renders,
  // however many pilot reports are ratified. `decision` defaults to the committed dashboard-decision.json.
  const rendering = dashboardEntries(manifest, env, { reportsDir, ...(decision ? { decision } : {}) });
  const ids = new Set(rendering.map((x) => x.entry.run_id));
  const sorted = [...rendering].sort((a, b) => (a.entry.report_date < b.entry.report_date ? 1 : a.entry.report_date > b.entry.report_date ? -1 : alpha(b.entry.run_id, a.entry.run_id)));
  const files = dashboardFiles(outDir);
  const dl = existsSync(join(outDir, "data", "model-dashboard")) ? listFiles(join(outDir, "data", "model-dashboard"), join(outDir, "data", "model-dashboard")) : [];
  const sm = existsSync(join(outDir, "sitemap.xml")) ? readFileSync(join(outDir, "sitemap.xml"), "utf8") : null;
  const index = existsSync(join(outDir, "ai-models.html")) ? readFileSync(join(outDir, "ai-models.html"), "utf8") : "";
  if (rendering.length === 0) {
    for (const f of files) p.push(`TREE-leak: ${f} exists but no wave renders in this build (the dashboard route must not exist)`);
    for (const f of dl) p.push(`TREE-leak: out/data/model-dashboard/${f} exists but no wave renders`);
    if (sm && sm.includes(`${SITE_URL}${DASHBOARD_PATH}`)) p.push("TREE-leak: sitemap.xml lists the dashboard but no wave renders");
    if (/href="\/ai-models\/dashboard/.test(index)) p.push("TREE-leak: /ai-models links the dashboard but no wave renders");
    return p;
  }
  if (!existsSync(join(outDir, "ai-models", "dashboard.html"))) p.push("TREE-missing: out/ai-models/dashboard.html is absent although a wave renders");
  for (const [id] of [...ids].map((i) => [i])) {
    if (!existsSync(join(outDir, "ai-models", "dashboard", `${id}.html`))) p.push(`TREE-missing: out/ai-models/dashboard/${id}.html is absent`);
    for (const ext of ["csv", "json"]) if (!dl.includes(`${id}.${ext}`)) p.push(`TREE-missing: out/data/model-dashboard/${id}.${ext} is absent`);
  }
  for (const f of files) {
    const m = f.match(/^ai-models\/dashboard\/([^/]+?)\.(?:html|txt)$/);
    if (m && !m[1].startsWith("__next") && !ids.has(m[1])) p.push(`TREE-leak: ${f} exists but wave ${m[1]} does not render`);
  }
  for (const f of dl) {
    const id = f.replace(/\.(csv|json)$/, "");
    if (!ids.has(id)) p.push(`TREE-leak: out/data/model-dashboard/${f} exists but wave ${id} does not render`);
  }
  for (const e of manifest) if (!ids.has(e.run_id) && sm && sm.includes(`${SITE_URL}${DASHBOARD_PATH}/${e.run_id}`)) p.push(`TREE-leak: sitemap.xml lists the dashboard of ${e.run_id}, which does not render`);
  if (sm) p.push(...dashboardSitemapProblems(sm, sorted.map((x) => x.entry)));
  if (!/href="\/ai-models\/dashboard"/.test(index)) p.push("TREE-missing: /ai-models does not link /ai-models/dashboard");
  return p;
}

/** Sitemap: the entry page (weekly, newest report date) and one permanent page per other wave (never, its own date). The newest wave's permanent page is canonical to the entry page and is not listed. */
export function dashboardSitemapProblems(xml, sortedEntries) {
  const p = [];
  const block = (url) => xml.match(new RegExp(`<url>(?:(?!</url>)[\\s\\S])*?<loc>${escRe(url)}</loc>(?:(?!</url>)[\\s\\S])*?</url>`))?.[0] ?? null;
  const entry = block(`${SITE_URL}${DASHBOARD_PATH}`);
  if (!entry) p.push("G20-sitemap: no sitemap entry for /ai-models/dashboard");
  else {
    if (!/<changefreq>weekly<\/changefreq>/.test(entry)) p.push("G20-sitemap: /ai-models/dashboard changefreq is not weekly");
    if (!entry.includes(`<lastmod>${sortedEntries[0].report_date}`)) p.push(`G20-sitemap: /ai-models/dashboard lastmod is not the newest report date ${sortedEntries[0].report_date}`);
  }
  sortedEntries.slice(1).forEach((e) => {
    const b = block(`${SITE_URL}${DASHBOARD_PATH}/${e.run_id}`);
    if (!b) p.push(`G20-sitemap: no sitemap entry for /ai-models/dashboard/${e.run_id}`);
    else {
      if (!/<changefreq>never<\/changefreq>/.test(b)) p.push(`G20-sitemap: ${e.run_id} dashboard changefreq is not "never"`);
      if (!b.includes(`<lastmod>${e.report_date}`)) p.push(`G20-sitemap: ${e.run_id} dashboard lastmod is not ${e.report_date}`);
    }
  });
  if (block(`${SITE_URL}${DASHBOARD_PATH}/${sortedEntries[0].run_id}`)) p.push("G20-sitemap: the newest wave's permanent page is canonical to the entry page and must not be listed separately");
  return p;
}

export { SITE_URL };
