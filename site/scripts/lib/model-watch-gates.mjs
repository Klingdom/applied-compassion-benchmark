/**
 * model-watch-gates.mjs -- built-tree HTML gates for the AI Model Watch routes and Insights
 * (docs/ARCHITECTURE_AI_MODEL_WATCH.md section 6, "Built-tree checks"; build item 10).
 *
 * Routes covered: /ai-models/tracker, /ai-models/watch, /ai-models/watch/<date>, /ai-models/leaderboards, /ai-models/cycle, /insights, /insights/<slug>,
 * plus sitemap.xml and insights/feed.xml. The existing pilot/dashboard gate files are NOT edited; this module IMPORTS them:
 *   G6   ratingSchemaProblems        forbidden JSON-LD types and keys
 *   G19  leakProblems / pilotMentionProblems   on /insights/** (the existing G19 test already walks out/ai-models/**, which holds the new model routes)
 *   G20  LEADERBOARD_TERMS + the negation regex   within 60 characters of a model name
 *   G24  machineTextProblems         on the Insights feed
 *
 * Every function is pure over strings/objects (the tree walker at the bottom reads files). Each returns an array of problem strings that
 * start with a rule id ("MWH-..."); an empty array means clean. Page markup contracts are the ones fixed in the docs: data-provider /
 * data-access / data-licence / data-status / data-tested on tracker rows, an aria-live "Showing X of N" region, the sentence
 * "No model ranking is published.", the pilot cell "Unofficial pilot report (not a score)", the six edition parts in PRD order, and
 * BlogPosting with a nested Organization and ImageObject on a post.
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  extractJsonLd, textBlocks, decode, ratingSchemaProblems, leakProblems, pilotMentionProblems, SITE_URL, LEADERBOARD_TERMS, listFiles,
} from "./model-report-html-gates.mjs";
import { BANNED, BAND_NAMES, NEGATOR_RE } from "./model-report-template.mjs";
import { machineTextProblems } from "./model-machine-leak.mjs";
import { makeModelMatcher } from "./insights-lint.mjs";

export const MODEL_WINDOW_CHARS = 60;
/** Types the site emits on every page (layout.tsx). Anything else must be allowed by the route. */
export const SITEWIDE_LD = ["ResearchOrganization", "Organization", "WebSite", "SearchAction", "EntryPoint", "ImageObject", "ContactPoint", "PostalAddress", "ListItem"];
/** JSON-LD types allowed per route beyond the sitewide ones (ARCHITECTURE section 4). */
export const ROUTE_LD_ALLOW = {
  tracker: ["BreadcrumbList", "FAQPage", "Question", "Answer"],
  watch: ["BreadcrumbList"],
  edition: ["BreadcrumbList"],
  leaderboards: ["BreadcrumbList", "FAQPage", "Question", "Answer"],
  cycle: ["BreadcrumbList"],
  insightsIndex: ["BreadcrumbList"],
  insightPost: ["BlogPosting", "BreadcrumbList"],
};
export const TESTED_VALUES = ["pilot", "queued", "not-yet"];
export const PILOT_CELL_TEXT = "Unofficial pilot report (not a score)";
/** Shown on every item of the edition disclosures section: the text is our summary, not a quotation (QA H2). */
export const DISCLOSURE_SUMMARY_LABEL = "Summary by Compassion Benchmark of the provider's own disclosure";
export const NO_RANKING_SENTENCE = "No model ranking is published.";
/** PRD section 3 edition parts, in order; matched against the page's headings. */
export const EDITION_PARTS = [
  ["window and coverage", /window|coverage|scan/i],
  ["new releases", /new releases|releases/i],
  ["safety and welfare disclosures", /safety|welfare|disclosure/i],
  ["what we measured", /measured/i],
  ["queue status", /queue/i],
  ["corrections and sources", /correction/i],
];

const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const norm = (s) => decode(s).replace(/\s+/g, " ").trim();

/** The <main> element's markup, or the whole document when there is none. */
export function mainHtml(html) {
  const m = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);
  return m ? m[1] : html;
}
export const mainHeadings = (html) => [...mainHtml(html).matchAll(/<h([23])\b[^>]*>([\s\S]*?)<\/h\1>/gi)].map((m) => ({ i: m.index, t: norm(m[2].replace(/<[^>]+>/g, " ")) }));
export const mainBlocks = (html) => textBlocks(mainHtml(html));
export const mainText = (html) => mainBlocks(html).join(" \n ");
/** Markup of the first <main> section whose h2 matches `re`, up to the next h2 (or the end of <main>). */
export function sectionHtml(html, re = /safety|welfare|disclosure/i) {
  const m = mainHtml(html);
  const hs = [...m.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/gi)];
  const k = hs.findIndex((h) => re.test(h[1].replace(/<[^>]+>/g, " ")));
  if (k < 0) return "";
  return m.slice(hs[k].index, hs[k + 1] ? hs[k + 1].index : m.length);
}

/** Text a reader sees: scripts (incl. the RSC flight payload), styles, comments and every tag (hence every attribute value) removed, entities decoded. */
export function visibleText(html) {
  return decode(
    html.replace(/<!--[\s\S]*?-->/g, " ").replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ").replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " "),
  );
}
/** Whole-token match: not glued to a word character or hyphen on either side. */
const tagRe = (tag) => new RegExp(`(?<![\\w-])${escRe(tag)}(?![\\w-])`);

function attr(tag, name) {
  const m = tag.match(new RegExp(`\\b${escRe(name)}="([^"]*)"`, "i"));
  return m ? decode(m[1]) : null;
}

function ldTypes(html) {
  const types = [];
  const walk = (x) => {
    if (Array.isArray(x)) x.forEach(walk);
    else if (x && typeof x === "object") { for (const t of [].concat(x["@type"] ?? [])) types.push(t); Object.values(x).forEach(walk); }
  };
  extractJsonLd(html).forEach(walk);
  return types;
}

// ---------------------------------------------------------------------------------------------------------------------
// Common rules (every new page)
// ---------------------------------------------------------------------------------------------------------------------

/** JSON-LD: G6 rating rules, a per-route type allowlist, and the breadcrumb. `route` is a ROUTE_LD_ALLOW key. */
export function ldProblems(html, route) {
  const p = ratingSchemaProblems(html).map((x) => `MWH-${x}`);
  const allowed = new Set([...SITEWIDE_LD, ...(ROUTE_LD_ALLOW[route] ?? [])]);
  const types = ldTypes(html);
  for (const t of new Set(types)) if (!allowed.has(t)) p.push(`MWH-ld-type: JSON-LD type "${t}" is not allowed on the ${route} route (allowed: ${[...allowed].join(", ")})`);
  if (!types.includes("BreadcrumbList")) p.push("MWH-breadcrumb: no BreadcrumbList JSON-LD");
  if (route === "insightPost") {
    if (types.filter((t) => t === "BlogPosting").length !== 1) p.push("MWH-blogposting: an Insights post needs exactly one BlogPosting node");
    if (!types.includes("Organization") && !types.includes("ResearchOrganization")) p.push("MWH-blogposting: BlogPosting needs a nested Organization (author or publisher)");
    if (!types.includes("ImageObject")) p.push("MWH-blogposting: BlogPosting needs a nested ImageObject");
  }
  return p;
}

/** Rules every new page shares. `allowGumroad`: lab-facing Insights may link GUMROAD.aiLabsIndex (checked separately). */
export function commonProblems(html, { allowGumroad = false } = {}) {
  const p = [];
  const blocks = mainBlocks(html);
  if (!blocks.some((b) => /independen/i.test(b) && /\b(pay|pays|paid|payment|fee|fees)\b/i.test(b))) p.push("MWH-independence: no one-line independence statement (independent; no payment for inclusion, score or wording)");
  // Page-content rules look at <main> only: the site-wide Navbar/Footer (pre-existing chrome) may link /score-watch, Gumroad, etc.
  const main = mainHtml(html);
  if (/href="\/ai-lab\//i.test(main)) p.push('MWH-lab-link: a link to /ai-lab/ (lab entity pages are never linked from model pages)');
  if (/href="[^"]*\/score-watch/i.test(main)) p.push("MWH-score-watch: a link to /score-watch (paused product)");
  if (!allowGumroad && /href="[^"]*gumroad\.com/i.test(main)) p.push("MWH-gumroad: a Gumroad link on a page that may not carry one");
  if (/models?\s+tracked/i.test(mainText(html))) p.push('MWH-wording: the phrase "models tracked" (a listing is not an evaluation; say "listed in the catalog")');
  if (/\{\{[A-Za-z0-9_]+\}\}/.test(html)) p.push("MWH-token: an unsubstituted {{TOKEN}} in the page");
  if (/\{\{|\}\}/.test(mainText(html))) p.push("MWH-token: a raw {{ or }} in the visible text of the page (a mangled or unsubstituted token)");
  return p;
}

/**
 * Lexicon. mode "strict" (tracker, watch, edition): BANNED words and band names across the whole <main>. mode "near" (leaderboards, Insights):
 * only within 60 characters of a model name (catalog or wave), unless the block negates (the G20 negation regex).
 * @param {{mentions:(t:string)=>{start:number,end:number}[]}} matcher
 */
export function lexiconPageProblems(html, mode, matcher) {
  const p = [];
  for (const block of mainBlocks(html)) {
    const negated = NEGATOR_RE.test(block);
    const check = (text, where) => {
      for (const b of BANNED) if (b.re.test(text) && !(b.negatable && negated)) p.push(`MWH-lexicon: banned word "${b.label}" ${where}: "${text.slice(0, 110)}"`);
      for (const band of BAND_NAMES) if (new RegExp(`\\b${band}\\b`).test(text)) p.push(`MWH-lexicon: band name "${band}" ${where}: "${text.slice(0, 110)}"`);
    };
    if (mode === "strict") { check(block, "in <main>"); continue; }
    for (const m of matcher.mentions(block)) {
      const win = block.slice(Math.max(0, m.start - MODEL_WINDOW_CHARS), Math.min(block.length, m.end + MODEL_WINDOW_CHARS));
      check(win, `within ${MODEL_WINDOW_CHARS} characters of "${block.slice(m.start, m.end)}"`);
      if (LEADERBOARD_TERMS.test(win) && !negated) p.push(`MWH-lexicon: ranking word within ${MODEL_WINDOW_CHARS} characters of "${block.slice(m.start, m.end)}": "${block.slice(0, 110)}"`);
    }
  }
  return [...new Set(p)];
}

/** A lab score or band beside a model row: no lab composite, band, /100 figure or lab link in model pages. */
export function labScoreProblems(text) {
  const p = [];
  if (/\b\d{1,3}(?:\.\d)?\s*\/\s*100\b/.test(text)) p.push("MWH-lab-score: a score out of 100 appears on a model page");
  if (/\b(?:lab|index|composite)\s+score\b/i.test(text)) p.push('MWH-lab-score: "lab/index/composite score" appears on a model page');
  return p;
}

// ---------------------------------------------------------------------------------------------------------------------
// /ai-models/tracker
// ---------------------------------------------------------------------------------------------------------------------

/**
 * @param {string} html
 * @param {{catalog:{meta:{rowCount:number},rows:object[]}, expectedTested:(row:object)=>string}} ctx
 */
export function trackerProblems(html, { catalog, expectedTested }) {
  const p = [...ldProblems(html, "tracker"), ...commonProblems(html), ...labScoreProblems(mainText(html))];
  const rows = catalog.rows;
  const tb = html.match(/<tbody\b[^>]*>([\s\S]*?)<\/tbody>/i);
  if (!tb) { p.push("MWH-tracker-rows: no <tbody> in the tracker (the full table must be server-rendered)"); return p; }
  const trs = [...tb[1].matchAll(/<tr\b([^>]*)>([\s\S]*?)<\/tr>/gi)];
  if (trs.length !== catalog.meta.rowCount || trs.length !== rows.length) p.push(`MWH-tracker-rows: the <tbody> has ${trs.length} row(s) but the catalog has ${catalog.meta.rowCount} (rowCount) / ${rows.length} (rows)`);
  if (/\bid="/i.test(tb[1])) p.push("MWH-tracker-id: an id attribute inside the tracker <tbody> (no row ids, no anchors, no per-model links)");
  if (/href="#/i.test(tb[1])) p.push("MWH-tracker-anchor: a # link inside the tracker rows");
  trs.forEach((tr, i) => {
    const row = rows[i];
    const tag = tr[1];
    const body = tr[2];
    const w = `row ${i + 1}${row ? ` (${row.id})` : ""}`;
    for (const a of ["data-provider", "data-access", "data-licence", "data-status", "data-tested"]) if (attr(tag, a) === null) p.push(`MWH-tracker-attrs: ${w} lacks ${a}`);
    const tested = attr(tag, "data-tested");
    if (tested !== null && !TESTED_VALUES.includes(tested)) p.push(`MWH-tracker-tested: ${w} data-tested="${tested}" is not one of ${TESTED_VALUES.join(", ")}`);
    if (row) {
      if (attr(tag, "data-provider") !== null && attr(tag, "data-provider") !== row.provider) p.push(`MWH-tracker-order: ${w} data-provider "${attr(tag, "data-provider")}" != catalog "${row.provider}" (rows must keep the catalog order; no re-sorting)`);
      if (!norm(body.replace(/<[^>]+>/g, " ")).includes(row.name)) p.push(`MWH-tracker-order: ${w} does not show the name "${row.name}" at this position`);
      const want = expectedTested(row);
      if (tested !== null && want !== tested) p.push(`MWH-tracker-tested: ${w} data-tested="${tested}" but the derivation gives "${want}" (pilot only for an ACTIVE D-29a wave)`);
      for (const s of row.sources.slice(0, 1)) if (!body.includes(`href="${s.url.replace(/&/g, "&amp;")}"`) && !body.includes(`href="${s.url}"`)) p.push(`MWH-tracker-source: ${w} does not link its first source ${s.url}`);
    }
    if (!/href="https:\/\//i.test(body)) p.push(`MWH-tracker-source: ${w} has no clickable https source`);
    const isPilot = tested === "pilot";
    const hasPilotText = body.includes("Unofficial pilot report (not a score)") || norm(body.replace(/<[^>]+>/g, " ")).includes(PILOT_CELL_TEXT);
    const hasReportLink = /href="\/ai-models\/reports\/[^"]+"/i.test(body);
    if (isPilot && !(hasPilotText && hasReportLink)) p.push(`MWH-tracker-pilot: ${w} is "pilot" but the cell lacks "${PILOT_CELL_TEXT}" with a link to the report`);
    if (!isPilot && (hasPilotText || hasReportLink)) p.push(`MWH-tracker-pilot: ${w} is "${tested}" but links a pilot report (a pilot label only for an active wave)`);
    if (/\b\d{1,3}(?:\.\d+)?\s*(?:\/\s*100|%)/.test(norm(body.replace(/<[^>]+>/g, " "))) ) p.push(`MWH-tracker-figure: ${w} shows a score-shaped figure (no model figure outside a pilot report)`);
  });
  const visible = visibleText(html);
  for (const r of rows) if (r.benchmarkLocalTag && tagRe(r.benchmarkLocalTag).test(visible)) p.push(`MWH-tracker-tag: benchmarkLocalTag "${r.benchmarkLocalTag}" is rendered (a join key, never shown)`);
  if (/aria-sort|data-sort|sortable|name="sort"/i.test(html) || /\bsort(?:ed)? by\b/i.test(mainText(html))) p.push("MWH-tracker-sort: a sort control (the default order is alphabetical; no sort by result)");
  const live = html.match(/<[^>]*aria-live="[^"]*"[^>]*>([\s\S]*?)<\/\w+>/i);
  if (!live) p.push("MWH-tracker-live: no aria-live region");
  else if (!new RegExp(`Showing\\s+\\d+\\s+of\\s+${catalog.meta.rowCount}\\b`).test(norm(live[1].replace(/<[^>]+>/g, " ")))) p.push(`MWH-tracker-live: the aria-live region does not read "Showing X of ${catalog.meta.rowCount}"`);
  if (!/<(?:button|a|input)\b[^>]*>(?:(?!<\/(?:button|a)>)[\s\S])*reset/i.test(html) && !/<input\b[^>]*type="reset"/i.test(html)) p.push("MWH-tracker-reset: no reset control");
  if (!/\bno\b[^<]{0,50}\b(?:match|results?|models?)\b/i.test(norm(html.replace(/<[^>]+>/g, " ")))) p.push("MWH-tracker-empty: no empty-result message in the markup");
  if (!/listed in the catalog/i.test(mainText(html))) p.push('MWH-tracker-wording: the page never says "listed in the catalog"');
  return [...new Set([...p, ...lexiconPageProblems(html, "strict", null)])];
}

// ---------------------------------------------------------------------------------------------------------------------
// /ai-models/watch and /ai-models/watch/<date>
// ---------------------------------------------------------------------------------------------------------------------

export function watchListProblems(html, { editions }) {
  const p = [...ldProblems(html, "watch"), ...commonProblems(html), ...lexiconPageProblems(html, "strict", null)];
  const links = [...html.matchAll(/href="\/ai-models\/watch\/(\d{4}-\d{2}-\d{2})"/g)].map((m) => m[1]);
  const uniq = [...new Set(links)];
  const want = [...editions].map((e) => e.date).sort().reverse();
  if (JSON.stringify(uniq) !== JSON.stringify(want)) p.push(`MWH-watch-list: edition links [${uniq.join(", ")}] differ from the compiled editions newest-first [${want.join(", ")}]`);
  if (want.length === 0 && !/\bedition/i.test(mainText(html))) p.push("MWH-watch-list: zero-state copy missing while no edition exists");
  return p;
}

const sourceHref = (u) => [`href="${u}"`, `href="${u.replace(/&/g, "&amp;")}"`];
const hasHref = (html, u) => sourceHref(u).some((h) => html.includes(h));

export function editionProblems(html, edition, { catalog } = {}) {
  const p = [...ldProblems(html, "edition"), ...commonProblems(html), ...lexiconPageProblems(html, "strict", null)];
  const text = norm(mainText(html));
  // Six parts in order.
  const heads = mainHeadings(html);
  let last = -1;
  for (const [name, re] of EDITION_PARTS) {
    const h = heads.find((x) => re.test(x.t) && x.i > last);
    if (!h) { p.push(`MWH-edition-parts: no heading for part "${name}" after the previous part (the six parts appear in PRD order)`); break; }
    last = h.i;
  }
  if (!heads.some((h) => /\bcorrections?\b/i.test(h.t))) p.push("MWH-edition-corrections: the Corrections section is missing (always present, even when empty)");
  if (!text.includes(norm(edition.lead))) p.push("MWH-edition-lead: the edition lead is not on the page");
  if (!text.includes(norm(edition.coverageStatement))) p.push("MWH-edition-coverage: the coverage statement is not on the page");
  for (const r of edition.releases) {
    if (r.modelName && !text.includes(norm(r.modelName))) p.push(`MWH-edition-release: ${r.releaseId}: model name "${r.modelName}" is not on the page`);
    if (!r.sources.some((s) => hasHref(html, s.url))) p.push(`MWH-edition-source: ${r.releaseId}: none of its sources is linked`);
  }
  for (const d of edition.disclosures) {
    if (!text.includes(norm(d.safetyNote).slice(0, 60))) p.push(`MWH-edition-disclosure: ${d.releaseId}: the safetyNote summary is not on the page`);
  }
  // The disclosures are OUR summaries of provider disclosures, never quotations: each item carries the summary label, and
  // the section has no <blockquote>/<q> (QA H2).
  const dsec = sectionHtml(html);
  if (edition.disclosures.length) {
    const labels = norm(dsec).split(norm(DISCLOSURE_SUMMARY_LABEL)).length - 1;
    if (labels < edition.disclosures.length) p.push(`MWH-edition-disclosure: ${labels} summary label(s) for ${edition.disclosures.length} disclosure(s) (each says "${DISCLOSURE_SUMMARY_LABEL}")`);
  }
  if (/<blockquote\b|<q\b/i.test(dsec)) p.push("MWH-edition-disclosure: a blockquote in the disclosures section (summaries are not quotations)");
  if (/\bwe quote\b/i.test(text)) p.push("MWH-edition-disclosure: the page says we quote (the disclosures are summaries)");
  for (const s of edition.sources) if (!hasHref(html, s.url)) p.push(`MWH-edition-source: source ${s.n} (${s.url}) is not linked in the Sources list`);
  for (const r of edition.measured.reports) if (!html.includes(`href="${r.href}"`)) p.push(`MWH-edition-measured: the report link ${r.href} is not on the page`);
  if (!text.includes(norm(edition.measured.note))) p.push("MWH-edition-measured: the measured note is not on the page");
  if (!/crisis|duty[- ]of[- ]care/i.test(text)) p.push("MWH-edition-duty: no duty-of-care line (the edition recommends no model for crisis use)");
  if (/\bArticle\b/.test(ldTypes(html).join(" "))) p.push("MWH-edition-ld: an Article node on an edition (no Article schema)");
  if (catalog) p.push(...labScoreProblems(text));
  return [...new Set(p)];
}

// ---------------------------------------------------------------------------------------------------------------------
// /ai-models/leaderboards
// ---------------------------------------------------------------------------------------------------------------------

export function leaderboardsProblems(html, { matcher, itemCount }) {
  const p = [...ldProblems(html, "leaderboards"), ...commonProblems(html), ...lexiconPageProblems(html, "near", matcher), ...labScoreProblems(mainText(html))];
  const text = norm(mainText(html));
  if (!text.includes(NO_RANKING_SENTENCE)) p.push(`MWH-leaderboards-statement: the page never says "${NO_RANKING_SENTENCE}"`);
  if (!/href="\/ai-labs"/i.test(html)) p.push("MWH-leaderboards-link: no link to /ai-labs (the live organisational index)");
  if (!/\b(?:does|do) not (?:describe|measure|assess|say)\b[^.]{0,80}\bmodel/i.test(text) && !/\bnot\b[^.]{0,60}\bmodel behaviou?r/i.test(text)) p.push("MWH-leaderboards-labs: the page does not state that the AI Labs index does not describe model behaviour");
  const named = matcher.mentions(text);
  if (named.length) p.push(`MWH-leaderboards-names: the page names a model ("${text.slice(named[0].start, named[0].end)}"); the leaderboards page names none`);
  if (itemCount !== undefined && !new RegExp(`(?<![0-9,.])${itemCount}(?![0-9])`).test(text)) p.push(`MWH-leaderboards-bank: the bank size (${itemCount}, from the facts module) is not on the page`);
  if (!/agent/i.test(text) || !/not yet/i.test(text)) p.push('MWH-leaderboards-agent: the page does not explain why agent-tier pilots show "not yet"');
  return [...new Set(p)];
}

// ---------------------------------------------------------------------------------------------------------------------
// /ai-models/cycle ("How we analyse AI models every week")
// ---------------------------------------------------------------------------------------------------------------------

export const CYCLE_NO_RANKING_SENTENCE = "No official model ranking, band or score is published.";

/** Heading levels in document order (h1-h6) inside <main>. */
const headingLevels = (html) => [...mainHtml(html).matchAll(/<h([1-6])\b/gi)].map((m) => Number(m[1]));

/**
 * The weekly-cycle explainer. JSON-LD is BreadcrumbList only (no Dataset / ItemList / Rating / Review: G6 + the route allowlist).
 * Ranking words within 60 characters of a model name fail (near mode, with the G20 negation allowance). The labels "pilot", "planned"
 * and "conditional" must survive in the rendered text. The loop table keeps a Status column, and every body row fills it.
 * @param {{matcher:{mentions:(t:string)=>{start:number,end:number}[]}}} ctx
 */
export function cycleProblems(html, { matcher }) {
  const p = [...ldProblems(html, "cycle"), ...commonProblems(html), ...lexiconPageProblems(html, "near", matcher), ...labScoreProblems(mainText(html))];
  const text = norm(mainText(html));
  if (!text.includes(CYCLE_NO_RANKING_SENTENCE)) p.push(`MWH-cycle-statement: the page never says "${CYCLE_NO_RANKING_SENTENCE}"`);
  for (const [word, re] of [["pilot", /\bpilot/i], ["planned", /\bplanned\b/i], ["conditional", /\bconditional\b/i]]) {
    if (!re.test(text)) p.push(`MWH-cycle-label: the label "${word}" does not survive in the rendered text`);
  }
  if (!/\bplanned,\s*conditional\b/i.test(text)) p.push('MWH-cycle-label: the phrase "Planned, conditional" is missing (the weekly test run is labelled as planned and conditional)');
  // The loop table keeps its Status column, filled in every row; headers carry scope.
  const tables = [...mainHtml(html).matchAll(/<table\b[^>]*>([\s\S]*?)<\/table>/gi)];
  const loop = tables.find((t) => /<th\b[^>]*>\s*Status\s*<\/th>/i.test(t[1]));
  if (!loop) p.push("MWH-cycle-table: no table with a Status column header (the loop table keeps its Status column)");
  else {
    const head = loop[1].match(/<thead\b[^>]*>([\s\S]*?)<\/thead>/i);
    const heads = head ? [...head[1].matchAll(/<th\b([^>]*)>([\s\S]*?)<\/th>/gi)] : [];
    if (!head) p.push("MWH-cycle-table: the loop table has no <thead>");
    for (const h of heads) if (!/\bscope="col"/i.test(h[1])) p.push(`MWH-cycle-table: header "${norm(h[2].replace(/<[^>]+>/g, " "))}" lacks scope="col"`);
    const si = heads.findIndex((h) => /^status$/i.test(norm(h[2].replace(/<[^>]+>/g, " "))));
    const body = loop[1].match(/<tbody\b[^>]*>([\s\S]*?)<\/tbody>/i);
    const rows = body ? [...body[1].matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)] : [];
    if (rows.length === 0) p.push("MWH-cycle-table: the loop table has no body rows");
    rows.forEach((r, i) => {
      const cells = [...r[1].matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi)].map((c) => norm(c[1].replace(/<[^>]+>/g, " ")));
      if (si >= 0 && (cells.length !== heads.length || !cells[si])) p.push(`MWH-cycle-table: loop row ${i + 1} has no Status cell (${cells.length} cell(s) for ${heads.length} header(s))`);
    });
  }
  // Heading order: one h1, then no level skipped on the way down.
  const lv = headingLevels(html);
  if (lv.filter((x) => x === 1).length !== 1) p.push(`MWH-cycle-headings: expected exactly one <h1>, found ${lv.filter((x) => x === 1).length}`);
  lv.forEach((x, i) => { if (i > 0 && x > lv[i - 1] + 1) p.push(`MWH-cycle-headings: heading level jumps from h${lv[i - 1]} to h${x}`); });
  return [...new Set(p)];
}

// ---------------------------------------------------------------------------------------------------------------------
// /insights and /insights/<slug>
// ---------------------------------------------------------------------------------------------------------------------

export function insightsIndexProblems(html, { posts }) {
  const p = [...ldProblems(html, "insightsIndex"), ...commonProblems(html)];
  const links = [...new Set([...html.matchAll(/href="\/insights\/([a-z0-9-]+)"/g)].map((m) => m[1]))];
  const want = posts.map((x) => x.slug);
  for (const s of want) if (!links.includes(s)) p.push(`MWH-insights-index: /insights does not link the post ${s}`);
  for (const s of links) if (!want.includes(s)) p.push(`MWH-insights-index: /insights links ${s}, which is not a published post`);
  const order = links.filter((s) => want.includes(s));
  if (JSON.stringify(order) !== JSON.stringify(want)) p.push("MWH-insights-index: posts are not listed newest first");
  return p;
}

/**
 * @param {string} html
 * @param {{post:object, matcher:object, gumroadAiLabsIndex:string|null}} ctx  `post` is the compiled post JSON.
 */
export function insightPostProblems(html, { post, matcher, gumroadAiLabsIndex }) {
  const labFacing = post.audience === "ai-labs" || post.audience === "both";
  const p = [...ldProblems(html, "insightPost"), ...commonProblems(html, { allowGumroad: labFacing }), ...lexiconPageProblems(html, "near", matcher), ...labScoreProblems(mainText(html))];
  const text = norm(mainText(html));
  const blog = extractJsonLd(html).flatMap((b) => [].concat(b["@graph"] ?? b)).find((n) => n && [].concat(n["@type"] ?? []).includes("BlogPosting"));
  if (blog) {
    if (blog.headline !== post.title) p.push("MWH-blogposting: headline != the post title");
    if (blog.datePublished !== post.date) p.push("MWH-blogposting: datePublished != the post date");
    const author = blog.author?.name ?? blog.author?.[0]?.name;
    if (author !== "Compassion Benchmark research") p.push('MWH-blogposting: author must be "Compassion Benchmark research"');
    const lastMod = post.corrections.length ? post.corrections.map((c) => c.date).sort().at(-1) : post.date;
    if (blog.dateModified !== undefined && blog.dateModified.slice(0, 10) < lastMod) p.push("MWH-blogposting: dateModified is earlier than the latest correction");
  }
  if (!/data-pagefind-body/i.test(html)) p.push("MWH-insight-pagefind: no data-pagefind-body wrapper");
  for (const s of post.sources) {
    if (!new RegExp(`\\bid="src-${s.n}"`).test(html)) p.push(`MWH-insight-sources: no id="src-${s.n}" anchor in the Sources list`);
    if (!hasHref(html, s.url)) p.push(`MWH-insight-sources: source ${s.n} (${s.url}) is not linked`);
  }
  for (const n of new Set([...post.bodyMarkdown.matchAll(/\[(\d+)\]/g)].map((m) => m[1]))) if (!html.includes(`href="#src-${n}"`)) p.push(`MWH-insight-citation: citation [${n}] does not link to #src-${n}`);
  if (!mainHeadings(html).some((x) => /^corrections?\b/i.test(x.t))) p.push("MWH-insight-corrections: the Corrections section is missing (a heading is always present, even when empty)");
  if (!/claim ledger|claims? (?:and|&) sources|claims in this/i.test(text)) p.push("MWH-insight-ledger: the derived claim ledger is not shown");
  if (labFacing) {
    if (!/href="\/ai-labs"/i.test(html)) p.push("MWH-insight-cta: a lab-facing post lacks the /ai-labs CTA");
    if (gumroadAiLabsIndex && !hasHref(html, gumroadAiLabsIndex)) p.push("MWH-insight-cta: a lab-facing post lacks GUMROAD.aiLabsIndex");
    if (!/independen/i.test(text)) p.push("MWH-insight-independence: a lab-facing post lacks the independence statement");
  } else {
    if (!/href="\/ai-evaluation-suite"/i.test(html)) p.push("MWH-insight-cta: an agent-builder post lacks the /ai-evaluation-suite CTA");
    if (/gumroad\.com/i.test(html)) p.push("MWH-insight-cta: an agent-builder post links Gumroad");
  }
  // Titles with quote marks are emitted entity-encoded (&quot; &#x27; ...): compare decoded <h1> text with the decoded title.
  const h1s = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map((m) => norm(m[1].replace(/<[^>]+>/g, " ")).toLowerCase());
  const titleHead = norm(post.title).slice(0, 30).toLowerCase();
  if (!h1s.some((t) => t.includes(titleHead))) p.push("MWH-insight-title: the post title is not in an <h1>");
  return [...new Set(p)];
}

/** G19 + pilot-mention reuse on a page outside /ai-models/** (the existing G19 test does not walk /insights). */
export function pilotLeakPageProblems(html, waves, { renderingIds = new Set() } = {}) {
  const p = [];
  for (const wave of waves) {
    p.push(...leakProblems({ html, wave, kind: "index" }).map((x) => `${x}`));
    if (!renderingIds.has(wave.run_id)) p.push(...pilotMentionProblems(html, wave, { generic: renderingIds.size === 0 }));
  }
  return p;
}

// ---------------------------------------------------------------------------------------------------------------------
// Sitemap, hrefs, feed
// ---------------------------------------------------------------------------------------------------------------------

export function sitemapProblems(xml, { editions, posts }) {
  const p = [];
  const need = ["/ai-models/tracker", "/ai-models/watch", "/ai-models/leaderboards", "/ai-models/cycle", "/insights"];
  for (const e of editions) need.push(`/ai-models/watch/${e.date}`);
  for (const x of posts) need.push(`/insights/${x.slug}`);
  for (const path of need) if (!new RegExp(`<loc>${escRe(SITE_URL + path)}/?</loc>`).test(xml)) p.push(`MWH-sitemap: ${path} is missing from sitemap.xml`);
  const have = [...xml.matchAll(/<loc>[^<]*\/(?:insights|ai-models\/watch)\/([^<\/]+?)\/?<\/loc>/g)].map((m) => m[1]);
  const known = new Set([...editions.map((e) => e.date), ...posts.map((x) => x.slug)]);
  for (const s of have) if (!known.has(s)) p.push(`MWH-sitemap: sitemap.xml lists /${s}, which is neither a compiled edition nor a published post`);
  return p;
}

/** Every internal href resolves to a file. `exists(rel)` answers for a path relative to out/. */
export function hrefResolveProblems(html, exists, label = "") {
  const p = [];
  const seen = new Set();
  for (const m of html.matchAll(/\bhref="(\/[^"#?]*)(?:[#?][^"]*)?"/g)) {
    const path = decode(m[1]);
    if (seen.has(path) || path.startsWith("//")) continue;
    seen.add(path);
    const rel = path.replace(/^\//, "").replace(/\/$/, "");
    const candidates = rel === "" ? ["index.html"] : [rel, `${rel}.html`, `${rel}/index.html`];
    if (!candidates.some((c) => exists(c))) p.push(`MWH-href: ${label}${path} does not resolve to a file in out/`);
  }
  return p;
}

/** G24 on the feed: no pilot figure in machine text. */
export function feedProblems(text, waves) {
  return waves.flatMap((wave) => machineTextProblems({ text, wave, label: "insights/feed.xml" }));
}

// ---------------------------------------------------------------------------------------------------------------------
// Share metadata (live audit 2026-10-21, finding M3)
// ---------------------------------------------------------------------------------------------------------------------

/** Pages whose own title and description must reach og:/twitter: tags; [built file, route]. The root layout's openGraph is the homepage's. */
export const SHARE_META_ROUTES = [
  ["ai-models.html", "/ai-models"],
  ["ai-models/tracker.html", "/ai-models/tracker"],
  ["ai-models/methodology.html", "/ai-models/methodology"],
  ["ai-models/leaderboards.html", "/ai-models/leaderboards"],
  ["ai-models/watch.html", "/ai-models/watch"],
  ["ai-models/cycle.html", "/ai-models/cycle"],
  ["ai-evaluation-suite.html", "/ai-evaluation-suite"],
  ["ai-labs.html", "/ai-labs"],
];

function metaContent(html, key) {
  for (const m of html.matchAll(/<meta\b[^>]*>/gi)) if ((attr(m[0], "property") ?? attr(m[0], "name")) === key) return attr(m[0], "content");
  return null;
}
function canonicalHref(html) {
  for (const m of html.matchAll(/<link\b[^>]*>/gi)) if (attr(m[0], "rel") === "canonical") return attr(m[0], "href");
  return null;
}

/** The homepage's og:title and og:description, the values a page must NOT inherit. */
export function homeShareMeta(homeHtml) {
  return { title: metaContent(homeHtml, "og:title"), description: metaContent(homeHtml, "og:description") };
}

/**
 * A page needs its own og:title and og:description (not the homepage's), a rel=canonical, an og:url equal to that canonical,
 * and its own twitter:title. Fails when the layout's openGraph is inherited.
 * @param {string} html @param {string} route e.g. "/ai-models" @param {{title:string|null, description:string|null}} home
 */
export function shareMetaProblems(html, route, home) {
  const p = [];
  const ogTitle = metaContent(html, "og:title");
  const ogDesc = metaContent(html, "og:description");
  const ogUrl = metaContent(html, "og:url");
  const canon = canonicalHref(html);
  if (!ogTitle) p.push("MWH-share-title: no og:title");
  else if (home?.title && ogTitle === home.title) p.push(`MWH-share-title: og:title is the homepage's ("${ogTitle.slice(0, 60)}"); set the page's own openGraph`);
  if (!ogDesc) p.push("MWH-share-desc: no og:description");
  else if (home?.description && ogDesc === home.description) p.push("MWH-share-desc: og:description is the homepage's; set the page's own openGraph");
  if (!canon) p.push("MWH-share-canonical: no rel=canonical");
  else if (!canon.endsWith(route)) p.push(`MWH-share-canonical: canonical "${canon}" does not end with the route ${route}`);
  if (!ogUrl) p.push("MWH-share-url: no og:url");
  else if (canon && ogUrl !== canon) p.push(`MWH-share-url: og:url "${ogUrl}" != canonical "${canon}"`);
  const twTitle = metaContent(html, "twitter:title");
  if (twTitle && home?.title && twTitle === home.title) p.push("MWH-share-title: twitter:title is the homepage's");
  return p;
}

// ---------------------------------------------------------------------------------------------------------------------
// The built tree
// ---------------------------------------------------------------------------------------------------------------------

/**
 * Walk out/ and apply every rule. Returns { problems, examined } (the test fails if `examined` is 0).
 * ctx = { catalog, editions: [edition], posts: [compiled post], waves, renderingIds:Set, matcher, itemCount, gumroadAiLabsIndex, expectedTested }
 */
export function modelWatchTreeProblems({ outDir, ctx, requireRoutes = true }) {
  const problems = [];
  let examined = 0;
  const read = (rel) => readFileSync(join(outDir, rel), "utf8");
  const exists = (rel) => existsSync(join(outDir, rel));
  const page = (rel, fn) => {
    if (!exists(rel)) { if (requireRoutes) problems.push(`MWH-tree-missing: out/${rel} does not exist`); return; }
    examined += 1;
    const html = read(rel);
    problems.push(...fn(html).map((x) => `${rel}: ${x}`));
    problems.push(...hrefResolveProblems(html, exists, `${rel}: `));
  };
  page("ai-models/tracker.html", (h) => trackerProblems(h, { catalog: ctx.catalog, expectedTested: ctx.expectedTested }));
  page("ai-models/watch.html", (h) => watchListProblems(h, { editions: ctx.editions }));
  for (const e of ctx.editions) page(`ai-models/watch/${e.date}.html`, (h) => editionProblems(h, e, { catalog: ctx.catalog }));
  page("ai-models/leaderboards.html", (h) => leaderboardsProblems(h, { matcher: ctx.matcher, itemCount: ctx.itemCount }));
  page("ai-models/cycle.html", (h) => cycleProblems(h, { matcher: ctx.matcher }));
  // Share metadata: each route's own og:/canonical, never the homepage's (live audit M3). The four routes with no other gate here are counted as examined.
  if (exists("index.html")) {
    const home = homeShareMeta(read("index.html"));
    for (const [rel, route] of SHARE_META_ROUTES) {
      if (!exists(rel)) { if (requireRoutes && !["ai-models/tracker.html", "ai-models/watch.html", "ai-models/leaderboards.html", "ai-models/cycle.html"].includes(rel)) problems.push(`MWH-tree-missing: out/${rel} does not exist`); continue; }
      if (!["ai-models/tracker.html", "ai-models/watch.html", "ai-models/leaderboards.html", "ai-models/cycle.html"].includes(rel)) examined += 1;
      problems.push(...shareMetaProblems(read(rel), route, home).map((x) => `${rel}: ${x}`));
    }
  } else if (requireRoutes) problems.push("MWH-tree-missing: out/index.html does not exist (needed for the share-metadata comparison)");
  page("insights.html", (h) => [...insightsIndexProblems(h, { posts: ctx.posts }), ...pilotLeakPageProblems(h, ctx.waves, { renderingIds: ctx.renderingIds })]);
  for (const post of ctx.posts) {
    page(`insights/${post.slug}.html`, (h) => [
      ...insightPostProblems(h, { post, matcher: ctx.matcher, gumroadAiLabsIndex: ctx.gumroadAiLabsIndex }),
      ...pilotLeakPageProblems(h, ctx.waves, { renderingIds: ctx.renderingIds }),
    ]);
  }
  if (exists("sitemap.xml")) { examined += 1; problems.push(...sitemapProblems(read("sitemap.xml"), ctx).map((x) => `sitemap.xml: ${x}`)); }
  else if (requireRoutes) problems.push("MWH-tree-missing: out/sitemap.xml does not exist");
  if (exists("insights/feed.xml")) { examined += 1; problems.push(...feedProblems(read("insights/feed.xml"), ctx.waves)); }
  // No stray pages: any edition or post page on disk must be in the data.
  const knownEd = new Set(ctx.editions.map((e) => `ai-models/watch/${e.date}.html`));
  const knownPost = new Set(ctx.posts.map((x) => `insights/${x.slug}.html`));
  for (const f of listFiles(join(outDir, "ai-models", "watch"), join(outDir, "ai-models", "watch"))) if (f.endsWith(".html") && !knownEd.has(`ai-models/watch/${f}`)) problems.push(`MWH-tree-leak: out/ai-models/watch/${f} has no compiled edition`);
  for (const f of listFiles(join(outDir, "insights"), join(outDir, "insights"))) if (f.endsWith(".html") && !knownPost.has(`insights/${f}`)) problems.push(`MWH-tree-leak: out/insights/${f} has no published post`);
  return { problems, examined };
}

export { makeModelMatcher };
