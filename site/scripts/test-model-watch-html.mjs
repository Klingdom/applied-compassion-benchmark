#!/usr/bin/env node
/**
 * test-model-watch-html.mjs -- built-tree gates for the AI Model Watch routes and Insights
 * (docs/ARCHITECTURE_AI_MODEL_WATCH.md section 6; build item 10). Library: scripts/lib/model-watch-gates.mjs.
 *
 *   probes   a CLEAN synthetic page per route passes; each planted defect trips the SPECIFIC rule id (a planted defect fails, its removal passes)
 *   tree     the same rules over a synthetic out/ tree on disk (missing route, stray page, sitemap, dangling href), then over the real site/out
 *   reuse    G6 (forbidden JSON-LD), G19 (a withheld pilot figure on an Insights page), the pilot-mention rule for a wave that does not render,
 *            G20 (ranking words near a model name) and G24 (the feed) are the EXISTING gates, imported and exercised here without edits
 *
 * `--tree-only` (build chain, after `next build`): only the real tree. `--require-out`: a missing out/ or a missing route is a failure.
 * Without `--require-out`, a stale out/ that has none of the new routes prints SKIP (the chain runs before a build).
 */

import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { harness, OUT_DIR, WAVES_DIR, REQUIRE_OUT, TREE_ONLY, SITE } from "./lib/html-gate-harness.mjs";
import { loadWaves, withheldValues } from "./lib/model-report-html-gates.mjs";
import { renderableEntries } from "./lib/pilot-render-gate.mjs";
import {
  trackerProblems, watchListProblems, editionProblems, leaderboardsProblems, cycleProblems, insightsIndexProblems, insightPostProblems, pilotLeakPageProblems,
  sitemapProblems, hrefResolveProblems, feedProblems, modelWatchTreeProblems, shareMetaProblems, homeShareMeta, SHARE_META_ROUTES, lexiconPageProblems, ldProblems, makeModelMatcher, SITEWIDE_LD, DISCLOSURE_SUMMARY_LABEL,
} from "./lib/model-watch-gates.mjs";
import { testedStatus } from "./lib/model-watch-tested.mjs";
import { parsePostSource, buildPost } from "./lib/insights-lint.mjs";
import { richStores, compiled, QUEUE } from "./lib/model-watch-fixtures.mjs";
import { trackerHtml, watchListHtml, editionHtml, leaderboardsHtml, cycleHtml, insightsIndexHtml, insightPostHtml, sitemapXml, page, breadcrumb, esc } from "./lib/model-watch-html-fixtures.mjs";
import { pathsFor, readJsonIf, readEditions, readWaveContext } from "./lib/model-watch-context.mjs";

const h = harness("test-model-watch-html");
// The shared harness's check/clean/trips are async; collect their promises so finish() sees every result.
const pending = [];
for (const k of ["check", "clean", "trips"]) {
  const f = h[k];
  h[k] = (...a) => { const p = f(...a); pending.push(p); return p; };
}
const { manifest, waves } = loadWaves(WAVES_DIR);
const paths = pathsFor();

/** The real-tree context from committed data (also used for the real-tree half). */
function realContext() {
  const catalog = readJsonIf(paths.catalog);
  const editions = Object.values(readEditions(paths.editionsDir)).sort((a, b) => (a.date < b.date ? 1 : -1));
  const manifestPosts = readJsonIf(join(paths.insightsDir, "manifest.json"))?.posts ?? [];
  const posts = manifestPosts.map((m) => JSON.parse(readFileSync(join(paths.insightsDir, `${m.slug}.json`), "utf8")));
  const wc = readWaveContext(paths);
  const queue = readJsonIf(paths.queueSnapshot);
  const rendering = renderableEntries(wc.manifest, process.env, { reportsDir: paths.reportsDir });
  const gum = readFileSync(join(SITE, "src", "data", "gumroad.ts"), "utf8").match(/aiLabsIndex:\s*"([^"]+)"/)?.[1] ?? null;
  const tasks = readJsonIf(join(SITE, "src", "data", "model-benchmark", "tasks-v1.json"));
  return {
    catalog, editions, posts, waves: wc.waves, renderingIds: new Set(rendering.map((x) => x.entry.run_id)),
    matcher: makeModelMatcher({ catalogRows: catalog.rows, waves: wc.waves }),
    itemCount: tasks?.items?.length, gumroadAiLabsIndex: gum,
    expectedTested: (row) => testedStatus({ benchmarkLocalTag: row.benchmarkLocalTag }, { queue, renderable: rendering, waves: wc.waves }).status,
  };
}

if (!TREE_ONLY) {
  // -------------------------------------------------------------------------------------------------------------------
  // Fixtures
  // -------------------------------------------------------------------------------------------------------------------
  const stores = richStores();
  const edition = compiled();
  const catalog = stores.catalog;
  const matcher = makeModelMatcher({ catalogRows: catalog.rows, waves });
  const tested = (r) => (r.benchmarkLocalTag === "zeta:7b" ? { status: "queued" } : { status: "not-yet" });
  const expectedTested = (r) => tested(r).status;
  const itemCount = 33;
  const GUM = "https://compassionbenchmark.gumroad.com/l/eagls";

  const mkPost = (audience, slug) => {
    const md = `---\ntitle: A fixture post about reading releases\ndek: A short dek that states no figure.\ndate: 2026-10-16\naudience: ${audience}\ntags: [fixtures]\nreadingMinutes: 1\n---\n\nA cited claim appears here [1]. A repo claim: {{DIMENSION_COUNT}} dimensions.\n\n## Sources\n1. Fixture Source — Example Publisher, 2025-01-02. https://example.com/a\n`;
    return buildPost(slug, parsePostSource(md, slug), { generatedAt: "2026-10-16T00:00:00.000Z" });
  };
  const labPost = mkPost("both", "lab-fixture");
  const agentPost = mkPost("agent-builders", "agent-fixture");
  const subst = (post) => JSON.parse(JSON.stringify(post).split("{{DIMENSION_COUNT}}").join("eight"));
  const labPage = insightPostHtml(subst(labPost), { gumroad: GUM });
  const agentPage = insightPostHtml(subst(agentPost));

  const tracker = trackerHtml(catalog, tested);
  const watchList = watchListHtml([edition]);
  const editionPage = editionHtml(edition);
  const leaderboards = leaderboardsHtml({ itemCount });
  const cycle = cycleHtml();
  const insightsIndex = insightsIndexHtml([labPost, agentPost]);

  const TR = (html, o = {}) => trackerProblems(html, { catalog, expectedTested, ...o });
  const ED = (html) => editionProblems(html, edition, { catalog });
  const LB = (html) => leaderboardsProblems(html, { matcher, itemCount });
  const CY = (html) => cycleProblems(html, { matcher });
  const IP = (html, post = labPost) => insightPostProblems(html, { post, matcher, gumroadAiLabsIndex: GUM });

  // -------------------------------------------------------------------------------------------------------------------
  h.section("positive controls: clean pages pass (so a gate that rejects everything cannot pass)");
  h.clean("tracker", TR(tracker));
  h.clean("watch listing", watchListProblems(watchList, { editions: [edition] }));
  h.clean("edition", ED(editionPage));
  h.clean("leaderboards", LB(leaderboards));
  h.clean("cycle", CY(cycle));
  h.clean("insights index", insightsIndexProblems(insightsIndex, { posts: [labPost, agentPost] }));
  h.clean("lab-facing post", IP(labPage));
  h.clean("agent-builder post", IP(agentPage, agentPost));
  h.clean("sitemap", sitemapProblems(sitemapXml({ editions: [edition], posts: [labPost, agentPost] }), { editions: [edition], posts: [labPost, agentPost] }));
  h.clean("watch listing with zero editions (zero-state copy)", watchListProblems(watchListHtml([]), { editions: [] }));
  h.check("the model matcher is non-empty (the near-name rules examine something)", () => h.assert(matcher.formCount > 5 && matcher.mentions("Alpha 1 shipped").length === 1, `formCount ${matcher.formCount}`));
  h.check("a pilot row renders its label and report link and is clean", () => {
    const t = (r) => (r.id === "zeta-open-7b" ? { status: "pilot", runId: "pilot-x" } : { status: "not-yet" });
    const p = trackerProblems(trackerHtml(catalog, t), { catalog, expectedTested: (r) => t(r).status });
    h.assert(p.length === 0, p.join(" | "));
  });

  // -------------------------------------------------------------------------------------------------------------------
  h.section("tracker probes");
  const rowsOf = (html) => [...html.matchAll(/<tr data-row=[\s\S]*?<\/tr>/g)].map((m) => m[0]);
  const firstRow = rowsOf(tracker)[0];
  h.trips("a row dropped (tbody count != catalog.meta.rowCount)", TR(tracker.replace(firstRow, "")), "MWH-tracker-rows");
  h.trips("an extra row", TR(tracker.replace("</tbody>", `${firstRow}</tbody>`)), "MWH-tracker-rows");
  h.trips("an id on a row", TR(tracker.replace("<tr data-row=", '<tr id="alpha-1" data-row=')), "MWH-tracker-id");
  h.trips("a # anchor in a row", TR(tracker.replace("<td>Not yet</td>", '<td><a href="#top">Not yet</a></td>')), "MWH-tracker-anchor");
  h.trips("a row lacking data-licence", TR(tracker.replace(/ data-licence="[^"]*"/, "")), "MWH-tracker-attrs");
  h.trips("data-tested outside the three values", TR(tracker.replace('data-tested="not-yet"', 'data-tested="tested"')), "MWH-tracker-tested");
  h.trips('"pilot" where the derivation says "not-yet" (pilot for a non-active wave)', TR(tracker.replace('data-tested="not-yet"', 'data-tested="pilot"')), "MWH-tracker-tested");
  h.trips("a pilot row without the pilot label", TR(trackerHtml(catalog, (r) => (r.id === "zeta-open-7b" ? { status: "pilot", runId: "p" } : { status: "not-yet" })).replace("Unofficial pilot report (not a score)", "Pilot"), { expectedTested: (r) => (r.id === "zeta-open-7b" ? "pilot" : "not-yet") }), "MWH-tracker-pilot");
  h.trips("a non-pilot row that links a report", TR(tracker.replace("<td>Not yet</td>", '<td><a href="/ai-models/reports/pilot-x">Report</a></td>')), "MWH-tracker-pilot");
  h.trips("benchmarkLocalTag rendered as a visible text node", TR(tracker.replace("<h1>", "<h1>zeta:7b ")), "MWH-tracker-tag");
  h.trips("benchmarkLocalTag as a standalone visible word inside a cell", TR(tracker.replace("<td>Not yet</td>", "<td>Not yet (zeta:7b)</td>")), "MWH-tracker-tag");
  h.clean("benchmarkLocalTag only inside an href, an attribute value, a script payload and a longer token passes (no false positive)", TR(
    tracker.replace("<h1>", '<a href="https://example.com/c4ai-zeta:7b-12-2024">src</a><span data-k="zeta:7b" title="zeta:7b"></span><script>self.__next_f.push([1,"zeta:7b"])</script><p>pre-zeta:7b-x and xzeta:7b</p><h1>'),
  ).filter((x) => x.startsWith("MWH-tracker-tag")));
  h.trips("a sort control", TR(tracker.replace("<th>Provider</th>", '<th aria-sort="ascending">Provider</th>')), "MWH-tracker-sort");
  h.trips('"Sort by" text', TR(tracker.replace("<h1>", "<p>Sort by release date</p><h1>")), "MWH-tracker-sort");
  h.trips("no aria-live region", TR(tracker.replace(' aria-live="polite"', "")), "MWH-tracker-live");
  h.trips('a "Showing X of N" with the wrong N', TR(tracker.replace(/Showing \d+ of \d+ models/, "Showing 3 of 99 models")), "MWH-tracker-live");
  h.trips("no reset control", TR(tracker.replace("<button type=\"button\">Reset filters</button>", "")), "MWH-tracker-reset");
  h.trips("no empty-result message", TR(tracker.replace("<p hidden>No models match these filters.</p>", "")), "MWH-tracker-empty");
  h.trips("rows re-sorted (order differs from the catalog)", TR(tracker.replace(rowsOf(tracker).join(""), rowsOf(tracker).reverse().join(""))), "MWH-tracker-order");
  h.trips('the phrase "models tracked"', TR(tracker.replace("Models listed in the catalog", "Models tracked")), "MWH-wording");
  h.trips("a link to /ai-lab/", TR(tracker.replace("<h1>", '<a href="/ai-lab/acme">Acme lab</a><h1>')), "MWH-lab-link");
  h.trips("a lab composite beside a model name", TR(tracker.replace("<td>Not yet</td>", "<td>Not yet; Acme lab score 72/100</td>")), "MWH-lab-score");
  h.trips("a score-shaped figure in a row", TR(tracker.replace("<td>Not yet</td>", "<td>Not yet 61.5%</td>")), "MWH-tracker-figure");
  h.trips("a Gumroad link on the tracker", TR(tracker.replace("<h1>", '<a href="https://compassionbenchmark.gumroad.com/l/eagls">Buy</a><h1>')), "MWH-gumroad");
  h.trips("a /score-watch link", TR(tracker.replace("<h1>", '<a href="/score-watch">Score Watch</a><h1>')), "MWH-score-watch");
  const CHROME = '<footer><a href="/score-watch">Score Watch</a><a href="/ai-lab/acme">Acme</a><a href="https://compassionbenchmark.gumroad.com/l/eagls">Buy</a></footer>';
  h.clean("site chrome outside <main> (footer links /score-watch, /ai-lab/, Gumroad) does not trip the page-content rules", TR(tracker.replace("</main>", `</main>${CHROME}`)).filter((x) => /^MWH-(score-watch|lab-link|gumroad)/.test(x)));
  h.trips("a /ai-lab/ link inside <main> still fails when the footer also has one", TR(tracker.replace("</main>", `</main>${CHROME}`).replace("<h1>", '<a href="/ai-lab/acme">Acme lab</a><h1>')), "MWH-lab-link");
  h.trips("a /score-watch link inside <main> still fails when the footer also has one", TR(tracker.replace("</main>", `</main>${CHROME}`).replace("<h1>", '<a href="/score-watch">x</a><h1>')), "MWH-score-watch");
  h.trips("no independence statement", TR(tracker.replace(/<p>Compassion Benchmark is independent[^<]*<\/p>/, "")), "MWH-independence");
  h.trips("no BreadcrumbList", TR(trackerHtml(catalog, tested, { ldBlocks: [] })), "MWH-breadcrumb");
  h.trips("a banned word in <main> ('best')", TR(tracker.replace("<h1>AI model tracker</h1>", "<h1>The best AI model tracker</h1>")), "MWH-lexicon");
  h.trips("a band name in <main>", TR(tracker.replace("<h1>AI model tracker</h1>", "<h1>AI model tracker, Exemplary edition</h1>")), "MWH-lexicon");
  h.trips("an unsubstituted {{TOKEN}}", TR(tracker.replace("<h1>", "<p>{{CATALOG_MODEL_COUNT}}</p><h1>")), "MWH-token");
  h.trips("Dataset JSON-LD (G6)", TR(tracker.replace("<h1>", '<script type="application/ld+json">{"@type":"Dataset","name":"x"}</script><h1>')), "G6-type");
  h.trips("ItemList JSON-LD (G6)", TR(tracker.replace("<h1>", '<script type="application/ld+json">{"@type":"ItemList"}</script><h1>')), "G6-type");
  h.trips("a ratingValue key in JSON-LD (G6)", TR(tracker.replace("<h1>", '<script type="application/ld+json">{"@type":"FAQPage","ratingValue":4}</script><h1>')), "G6-key");
  h.trips("Article JSON-LD where only Breadcrumb/FAQ are allowed", TR(tracker.replace("<h1>", '<script type="application/ld+json">{"@type":"Article","headline":"x"}</script><h1>')), "MWH-ld-type");
  h.check("FAQPage is allowed on the tracker", () => h.assert(TR(tracker.replace("<h1>", '<script type="application/ld+json">{"@type":"FAQPage","mainEntity":[]}</script><h1>')).length === 0));
  h.check("the sitewide JSON-LD types stay allowed", () => h.assert(SITEWIDE_LD.includes("ResearchOrganization") && SITEWIDE_LD.includes("WebSite")));

  h.section("watch listing and edition probes");
  h.trips("an edition not linked from the listing", watchListProblems(watchList.replace(/<a href="\/ai-models\/watch\/[^"]+">/, "<a href=\"/x\">"), { editions: [edition] }), "MWH-watch-list");
  h.trips("a phantom edition link", watchListProblems(watchList.replace("</ul>", '<li><a href="/ai-models/watch/2026-01-01">x</a></li></ul>'), { editions: [edition] }), "MWH-watch-list");
  h.trips("a listing with no zero-state copy", watchListProblems(watchListHtml([]).replace(/<p>No edition[^<]*<\/p>/, ""), { editions: [] }), "MWH-watch-list");
  h.trips("an edition missing the Queue heading", ED(editionPage.replace("<h2>Queue status</h2>", "")), "MWH-edition-parts");
  h.trips("an edition with the parts out of order", ED(editionPage.replace("<h2>New releases</h2>", "<h2>Queue status</h2>").replace(/<h2>Queue status<\/h2><p>\d+ queued/, "<h2>New releases</h2><p>0 queued")), "MWH-edition-parts");
  h.trips("an edition without a Corrections section", ED(editionPage.replace("<h3>Corrections</h3>", "<h3>Notes</h3>").replace("<h2>Corrections and sources</h2>", "<h2>Sources</h2>")), "MWH-edition-");
  h.trips("a release whose source is not linked", ED(editionPage.split(edition.releases[0].sources[0].url).join("https://example.com/other")), "MWH-edition-source");
  h.trips("a disclosure summary missing from the page", ED(editionPage.replace(edition.disclosures[0].safetyNote, "Changed text.")), "MWH-edition-disclosure");
  h.trips("a disclosure without the summary label", ED(editionPage.replace(DISCLOSURE_SUMMARY_LABEL, "Our view")), "MWH-edition-disclosure");
  h.trips("a blockquote in the disclosures section (summaries are not quotations)", ED(editionPage.replace(esc(edition.disclosures[0].safetyNote), `<blockquote>${esc(edition.disclosures[0].safetyNote)}</blockquote>`)), "MWH-edition-disclosure");
  h.trips("the lead-in says we quote", ED(editionPage.replace("<h2>Safety and welfare disclosures</h2>", "<h2>Safety and welfare disclosures</h2><p>We quote; we do not assess.</p>")), "MWH-edition-disclosure");
  h.check("the summary label passes (clean edition has no disclosure finding)", () => h.assert(!ED(editionPage).some((x) => x.startsWith("MWH-edition-disclosure"))));
  h.trips("a mangled token in visible text (H1)", ED(editionPage.replace("<h1>", "<p>We count {{DIMENSION<em>COUNT}} items</p><h1>")), "MWH-token");
  h.trips("a raw {{ in visible text with an unknown shape (H1)", TR(tracker.replace("<h1>", "<p>Total {{ broken</p><h1>")), "MWH-token");
  h.trips("a lead missing from the page", ED(editionPage.replace(esc(edition.lead), "Different words.")), "MWH-edition-lead");
  h.trips("an Article node on an edition", ED(editionPage.replace("<h1>", '<script type="application/ld+json">{"@type":"Article"}</script><h1>')), "MWH-ld-type");
  h.trips("no duty-of-care line", ED(editionPage.replace(/<p>This edition does not recommend[^<]*<\/p>/, "")), "MWH-edition-duty");
  h.trips("a judgement word in an edition", ED(editionPage.replace("<h2>New releases</h2>", "<h2>New releases that lead the field</h2>").replace("lead the field", "beats the rest")), "MWH-lexicon");

  h.section("leaderboards probes");
  h.trips("the 'no ranking' sentence missing", LB(leaderboards.replace("No model ranking is published.", "Rankings are discussed below.")), "MWH-leaderboards-statement");
  h.trips("no /ai-labs link", LB(leaderboards.replace('<a href="/ai-labs">AI Labs</a>', "AI Labs")), "MWH-leaderboards-link");
  h.trips("the page names a model", LB(leaderboards.replace("<h1>", "<p>Alpha 1 is discussed here.</p><h1>")), "MWH-leaderboards-names");
  h.trips("a family name counts as naming a model", LB(leaderboards.replace("<h1>", "<p>The Zeta family is not ranked.</p><h1>")), "MWH-leaderboards-names");
  h.trips('"models tracked"', LB(leaderboards.replace("<h1>", "<p>Models tracked: many.</p><h1>")), "MWH-wording");
  h.trips("the bank size missing", LB(leaderboards.replace(`holds ${itemCount} items`, "holds many items")), "MWH-leaderboards-bank");
  h.trips("the AI-Labs-does-not-describe-models statement missing", LB(leaderboards.replace("That index does not describe model behaviour.", "")), "MWH-leaderboards-labs");
  h.trips("no agent-tier explanation", LB(leaderboards.replace(/<p>Agent-tier[^<]*<\/p>/, "")), "MWH-leaderboards-agent");
  h.trips("a lab score on the leaderboards page", LB(leaderboards.replace("<h1>", "<p>Acme scores 64/100 on the lab index.</p><h1>")), "MWH-lab-score");

  h.section("cycle probes");
  const LD = (obj) => `<script type="application/ld+json">${JSON.stringify(obj)}</script>`;
  h.trips("Dataset JSON-LD on the cycle page (G6)", CY(cycle.replace("<h1>", LD({ "@type": "Dataset", name: "x" }) + "<h1>")), "G6-type");
  h.trips("ItemList JSON-LD on the cycle page (G6)", CY(cycle.replace("<h1>", LD({ "@type": "ItemList" }) + "<h1>")), "G6-type");
  h.trips("Rating JSON-LD on the cycle page (G6)", CY(cycle.replace("<h1>", LD({ "@type": "Rating", ratingValue: 4 }) + "<h1>")), "G6-");
  h.trips("Review JSON-LD on the cycle page (G6)", CY(cycle.replace("<h1>", LD({ "@type": "Review" }) + "<h1>")), "G6-type");
  h.trips("FAQPage JSON-LD where the cycle route allows only a breadcrumb", CY(cycle.replace("<h1>", LD({ "@type": "FAQPage", mainEntity: [] }) + "<h1>")), "MWH-ld-type");
  h.trips("no BreadcrumbList on the cycle page", CY(cycleHtml({ ldBlocks: [] })), "MWH-breadcrumb");
  h.trips("a ranking word beside a model name on the cycle page (G20 window)", CY(cycle.replace("<h1>", "<p>Alpha 1 is the best assistant this week.</p><h1>")), "MWH-lexicon");
  h.trips("a leaderboard term beside a model name on the cycle page", CY(cycle.replace("<h1>", "<p>Alpha 1 tops the leaderboard.</p><h1>")), "MWH-lexicon");
  h.check("a negated ranking phrase beside a model name is allowed on the cycle page", () => h.assert(CY(cycle.replace("<h1>", "<p>This is not a ranking and Alpha 1 is only listed.</p><h1>")).length === 0));
  h.trips("the no-ranking sentence missing from the cycle page", CY(cycle.replace("No official model ranking, band or score is published.", "Rankings are discussed below.")), "MWH-cycle-statement");
  h.trips("the word pilot removed from the cycle page", CY(cycle.replace(" Pilot results are unofficial ranges.", "")), "MWH-cycle-label");
  h.trips("the word planned removed (status cells and prose)", CY(cycle.replace("Planned, conditional:", "Later, conditional:").replace(/\bPlanned\b/g, "Later").replace("Automation planned", "Automation later")), "MWH-cycle-label");
  h.trips("the word conditional removed from the cycle page", CY(cycle.replace("Planned, conditional:", "Planned:")), "MWH-cycle-label");
  h.trips("conditional present but the phrase Planned, conditional missing", CY(cycle.replace("Planned, conditional:", "Planned and, if funded, conditional:")), "MWH-cycle-label");
  h.trips("the loop table losing its Status column", CY(cycle.replace('<th scope="col">Status</th>', '<th scope="col">State</th>')), "MWH-cycle-table");
  h.trips("the loop table losing a Status cell in a row", CY(cycle.replace("<td>Running today</td>", "")), "MWH-cycle-table");
  h.trips("a loop table header without scope", CY(cycle.replace('<th scope="col">Link</th>', "<th>Link</th>")), "MWH-cycle-table");
  h.trips("no table at all on the cycle page", CY(cycle.replace(/<table>[\s\S]*<\/table>/, "")), "MWH-cycle-table");
  h.trips("an unsubstituted {{TOKEN}} on the cycle page", CY(cycle.replace("<h1>", "<p>{{QUEUED_BUILD_COUNT}} builds</p><h1>")), "MWH-token");
  h.trips("a skipped heading level on the cycle page (h2 to h4)", CY(cycle.replace("<h2>How each week", "<h4>Sub</h4><h2>How each week")), "MWH-cycle-headings");
  h.trips("two h1 elements on the cycle page", CY(cycle.replace("<h2>What we publish", "<h1>Second</h1><h2>What we publish")), "MWH-cycle-headings");
  h.trips("a lab score on the cycle page", CY(cycle.replace("<h1>", "<p>Acme scores 64/100 on the lab index.</p><h1>")), "MWH-lab-score");
  h.trips("a Gumroad link on the cycle page", CY(cycle.replace("<h1>", '<a href="https://compassionbenchmark.gumroad.com/l/eagls">Buy</a><h1>')), "MWH-gumroad");
  h.trips("no independence statement on the cycle page", CY(cycle.replace(/<p>Compassion Benchmark is independent[^<]*<\/p>/, "")), "MWH-independence");

  h.section("insights probes");
  h.trips("an index missing a post", insightsIndexProblems(insightsIndex, { posts: [labPost, agentPost, mkPost("both", "third-fixture")] }), "MWH-insights-index");
  h.trips("an index linking an unpublished post", insightsIndexProblems(insightsIndex.replace("</ul>", '<li><a href="/insights/ghost">x</a></li></ul>'), { posts: [labPost, agentPost] }), "MWH-insights-index");
  h.trips("a post with no BlogPosting node", IP(labPage.replace(/<script type="application\/ld\+json">\{"@context":"https:\/\/schema.org","@type":"BlogPosting"[\s\S]*?<\/script>/, "")), "MWH-blogposting");
  h.trips("BlogPosting with the wrong author", IP(labPage.replace("Compassion Benchmark research\"}", "Someone Else\"}")), "MWH-blogposting");
  h.trips("BlogPosting with the wrong headline", IP(labPage.replace('"headline":"A fixture post about reading releases"', '"headline":"Other"')), "MWH-blogposting");
  h.trips("no data-pagefind-body wrapper", IP(labPage.replace(" data-pagefind-body", "")), "MWH-insight-pagefind");
  {
    const qPost = { ...subst(labPost), title: `The "quoted" title for fixtures ’ and it's` };
    const qPage = insightPostHtml(qPost, { gumroad: GUM });
    const encode = (s) => s.replace(/"/g, "&quot;").replace(/'/g, "&#x27;").replace(/’/g, "&rsquo;").replace(/&(?!(?:quot|amp|lt|gt|rsquo|#x27|#39);)/g, "&amp;");
    h.check("the quoted-title fixture really emits an entity-encoded h1", () => h.assert(/<h1>[^<]*&quot;/.test(qPage), "no &quot; in the h1"));
    h.clean("an h1 with an entity-encoded title (&quot; &rsquo;) passes the title rule", IP(qPage, qPost).filter((x) => x.startsWith("MWH-insight-title")));
    const hexPage = qPage.replace(/<h1>[\s\S]*?<\/h1>/, `<h1>${encode(qPost.title)}</h1>`);
    h.clean("numeric entities (&#x27; &#39;) in the h1 pass the title rule", IP(hexPage.replace("&#x27;", "&#39;"), qPost).filter((x) => x.startsWith("MWH-insight-title")));
    h.trips("a genuinely different h1 title fails", IP(qPage.replace(/<h1>[\s\S]*?<\/h1>/, "<h1>A completely different heading &quot;here&quot;</h1>"), qPost), "MWH-insight-title");
  }
  h.trips("a Sources list item without id=src-1", IP(labPage.replace('<li id="src-1">', "<li>")), "MWH-insight-sources");
  h.trips("a source URL not linked", IP(labPage.replace('<a href="https://example.com/a">', '<a href="https://example.com/z">')), "MWH-insight-sources");
  h.trips("a citation that does not link to its source", IP(labPage.replace(/href="#src-1"/g, 'href="#"')), "MWH-insight-citation");
  h.trips("no Corrections section", IP(labPage.replace("<h2>Corrections</h2>", "<h2>Notes</h2>").replace(/No corrections have been made\./, "None.")), "MWH-insight-corrections");
  h.trips("no claim ledger", IP(labPage.replace("<h2>Claim ledger</h2>", "<h2>More</h2>")), "MWH-insight-ledger");
  h.trips("a lab-facing post without the /ai-labs CTA", IP(labPage.replace('<a href="/ai-labs">See the AI Labs Index</a>', "See the index")), "MWH-insight-cta");
  h.trips("a lab-facing post without the Gumroad AI Labs Index link", IP(labPage.replace(`<a href="${GUM}">buy the AI Labs Index report</a>`, "buy it")), "MWH-insight-cta");
  h.trips("a lab-facing post without the independence statement", IP(labPage.replace(/<p>Compassion Benchmark is independent[^<]*<\/p>/g, "")), "MWH-independence");
  h.trips("an agent-builder post linking Gumroad", IP(agentPage.replace("<h2>Corrections</h2>", `<a href="${GUM}">Buy</a><h2>Corrections</h2>`), agentPost), "MWH-gumroad");
  h.trips("an agent-builder post without the /ai-evaluation-suite CTA", IP(agentPage.replace('<a href="/ai-evaluation-suite">Run the self-check</a>', "Run it"), agentPost), "MWH-insight-cta");
  h.trips("an unsubstituted {{TOKEN}} in a post", IP(insightPostHtml(labPost, { gumroad: GUM })), "MWH-token");
  h.trips("a Review JSON-LD node on a post (G6)", IP(labPage.replace("<h1>", '<script type="application/ld+json">{"@type":"Review"}</script><h1>')), "G6-type");
  h.trips("an ItemList on a post", IP(labPage.replace("<h1>", '<script type="application/ld+json">{"@type":"ItemList"}</script><h1>')), "G6-type");
  h.trips("a ranking word near a model name in a post (G20 window)", IP(labPage.replace("A cited claim appears here", "Alpha 1 is the best assistant. A cited claim appears here")), "MWH-lexicon");
  h.check("a negated ranking phrase near a model name is allowed", () => h.assert(IP(labPage.replace("A cited claim appears here", "This is not a ranking and Alpha 1 is only listed. A cited claim appears here")).length === 0));
  h.check("a ranking word far (>60 chars) from the model name is allowed", () => h.assert(lexiconPageProblems(page("<p>Alpha 1 is listed in a long table of providers and their models, and separately the best practice for reading it is to check sources.</p>"), "near", matcher).length === 0));
  h.trips("a banned word in <main> with no model (strict mode)", lexiconPageProblems(page("<p>The best pages win.</p>"), "strict", null), "MWH-lexicon");
  h.trips("the route allowlist: BlogPosting on a non-post route", ldProblems(page("<p>x</p>", { ldBlocks: [breadcrumb("a", "b"), '<script type="application/ld+json">{"@type":"BlogPosting"}</script>'] }), "tracker"), "MWH-ld-type");

  h.section("reuse of G19 / pilot-mention / G24 on Insights pages and the feed");
  const w = waves.find((x) => x.derived?.separated_subjects) ?? waves[0];
  const wv = withheldValues(w);
  const member = wv.memberComposites[0] ?? wv.allComposites[0];
  const naming = makeModelMatcher({ waves: [w] });
  const sentenceWithModel = `${w.design.subjects[0]} reached ${member} in the pilot.`;
  h.clean("an Insights page with no per-model figure passes G19 (index kind)", pilotLeakPageProblems(labPage, waves, { renderingIds: new Set(waves.map((x) => x.run_id)) }));
  h.trips("a withheld pilot composite on an Insights page (G19)", pilotLeakPageProblems(labPage.replace("<h1>", `<p>${esc(sentenceWithModel)}</p><h1>`), waves, { renderingIds: new Set(waves.map((x) => x.run_id)) }), "G19-index-figure");
  h.trips("a run id on an Insights page while that wave does not render (pilot-mention)", pilotLeakPageProblems(labPage.replace("<h1>", `<p>See ${w.run_id}.</p><h1>`), waves, { renderingIds: new Set() }), "PILOT-mention");
  h.clean("a run id on an Insights page while that wave DOES render is the wave's own reference", pilotLeakPageProblems(labPage.replace("<h1>", `<p>See ${w.run_id}.</p><h1>`), [w], { renderingIds: new Set([w.run_id]) }).filter((x) => x.startsWith("PILOT-mention")));
  h.check("the pilot-leak probe examined at least one real wave", () => h.assert(waves.length > 0 && naming.formCount > 0, `waves ${waves.length}`));
  const memberTok = wv.memberComposites[0];
  h.check("the feed (G24) is held to the machine-text rule: a clean feed passes", () => h.assert(feedProblems("<feed><entry><title>Reading releases</title></entry></feed>", waves).length === 0));
  if (memberTok) h.trips("a withheld member point in the feed (G24)", feedProblems(`<feed><entry><title>x</title><summary>score ${memberTok}</summary></entry></feed>`, [w]), "G24-member-point-token");

  h.section("share metadata probes (live audit M3)");
  const HOME_T = "Compassion Benchmark | Global Benchmarking for Institutional Compassion";
  const HOME_D = "Independent benchmark research measuring how institutions recognize, respond to, and reduce suffering.";
  const metaHead = ({ route, title = "Own page title | Compassion Benchmark", desc = "Own page description.", url = "https://compassionbenchmark.com" + route, canonical = "https://compassionbenchmark.com" + route }) =>
    '<meta property="og:title" content="' + title + '"/><meta property="og:description" content="' + desc + '"/>' +
    (url ? '<meta property="og:url" content="' + url + '"/>' : "") + (canonical ? '<link rel="canonical" href="' + canonical + '"/>' : "") +
    '<meta name="twitter:title" content="' + title + '"/>';
  const withHead = (html, head) => html.replace("</head>", head + "</head>");
  const homeHtml = withHead("<html><head></head></html>", metaHead({ route: "", title: HOME_T, desc: HOME_D, canonical: "https://compassionbenchmark.com/" , url: "https://compassionbenchmark.com/" }));
  const HOME = homeShareMeta(homeHtml);
  h.check("the homepage's og:title and og:description are read", () => h.assert(HOME.title === HOME_T && HOME.description === HOME_D, JSON.stringify(HOME)));
  h.check("every share-metadata route is a distinct path", () => h.assert(new Set(SHARE_META_ROUTES.map((x) => x[1])).size === SHARE_META_ROUTES.length && SHARE_META_ROUTES.length === 8));
  const okShare = withHead("<html><head></head></html>", metaHead({ route: "/ai-models" }));
  h.clean("a page with its own og:title, og:description, og:url and canonical passes", shareMetaProblems(okShare, "/ai-models", HOME));
  h.trips("the homepage og:title copied onto a page", shareMetaProblems(withHead("<html><head></head></html>", metaHead({ route: "/ai-models", title: HOME_T })), "/ai-models", HOME), "MWH-share-title");
  h.trips("the homepage og:description copied onto a page", shareMetaProblems(withHead("<html><head></head></html>", metaHead({ route: "/ai-models", desc: HOME_D })), "/ai-models", HOME), "MWH-share-desc");
  h.trips("a page with no og:url", shareMetaProblems(withHead("<html><head></head></html>", metaHead({ route: "/ai-models", url: "" })), "/ai-models", HOME), "MWH-share-url");
  h.trips("a page with no rel=canonical", shareMetaProblems(withHead("<html><head></head></html>", metaHead({ route: "/ai-models", canonical: "" })), "/ai-models", HOME), "MWH-share-canonical");
  h.trips("an og:url that differs from the canonical", shareMetaProblems(withHead("<html><head></head></html>", metaHead({ route: "/ai-models", url: "https://compassionbenchmark.com/ai-labs" })), "/ai-models", HOME), "MWH-share-url");
  h.trips("a canonical that is not the page's route", shareMetaProblems(withHead("<html><head></head></html>", metaHead({ route: "/ai-models", canonical: "https://compassionbenchmark.com/ai-labs", url: "https://compassionbenchmark.com/ai-labs" })), "/ai-models", HOME), "MWH-share-canonical");
  h.trips("a page with no og tags at all", shareMetaProblems("<html><head></head></html>", "/ai-models", HOME), "MWH-share-title");

  h.section("sitemap and hrefs");
  const xml = sitemapXml({ editions: [edition], posts: [labPost, agentPost] });
  h.trips("an edition missing from the sitemap", sitemapProblems(xml.replace(`/ai-models/watch/${edition.date}`, "/x"), { editions: [edition], posts: [labPost, agentPost] }), "MWH-sitemap");
  h.trips("a post missing from the sitemap", sitemapProblems(xml.replace("/insights/lab-fixture", "/x"), { editions: [edition], posts: [labPost, agentPost] }), "MWH-sitemap");
  h.trips("the cycle page missing from the sitemap", sitemapProblems(xml.replace("/ai-models/cycle", "/x"), { editions: [edition], posts: [labPost, agentPost] }), "MWH-sitemap");
  h.trips("the tracker missing from the sitemap", sitemapProblems(xml.replace("/ai-models/tracker", "/x"), { editions: [edition], posts: [labPost, agentPost] }), "MWH-sitemap");
  h.trips("a sitemap entry for a post that does not exist", sitemapProblems(sitemapXml({ editions: [edition], posts: [labPost, agentPost], extra: ["/insights/ghost"] }), { editions: [edition], posts: [labPost, agentPost] }), "MWH-sitemap");
  const exists = (rel) => ["ai-labs.html", "insights.html"].includes(rel);
  h.clean("hrefs that resolve pass", hrefResolveProblems('<a href="/ai-labs">x</a><a href="/insights#top">y</a><a href="https://x.example/">z</a>', exists));
  h.trips("a dangling internal href", hrefResolveProblems('<a href="/nowhere">x</a>', exists), "MWH-href");

  h.section("synthetic out/ tree on disk");
  {
    const tmp = mkdtempSync(join(tmpdir(), "cb-mwh-"));
    try {
      const put = (rel, text) => { mkdirSync(dirname(join(tmp, rel)), { recursive: true }); writeFileSync(join(tmp, rel), text); };
      const build = ({ extra = {} } = {}) => {
        put("ai-models/tracker.html", withHead(tracker, metaHead({ route: "/ai-models/tracker" })));
        put("ai-models/watch.html", withHead(watchList, metaHead({ route: "/ai-models/watch" })));
        put(`ai-models/watch/${edition.date}.html`, editionPage);
        put("ai-models/leaderboards.html", withHead(leaderboards, metaHead({ route: "/ai-models/leaderboards" })));
        put("ai-models/cycle.html", withHead(cycle, metaHead({ route: "/ai-models/cycle" })));
        put("index.html", homeHtml);
        for (const [rel, route] of [["ai-models.html", "/ai-models"], ["ai-models/methodology.html", "/ai-models/methodology"]]) put(rel, withHead("<html><head></head></html>", metaHead({ route })));
        put("insights.html", insightsIndex);
        put("insights/lab-fixture.html", labPage);
        put("insights/agent-fixture.html", agentPage);
        put("sitemap.xml", sitemapXml({ editions: [edition], posts: [labPost, agentPost] }));
        for (const [k, v] of Object.entries(extra)) put(k, v);
        for (const [f, route] of [["ai-labs.html", "/ai-labs"], ["ai-evaluation-suite.html", "/ai-evaluation-suite"]]) put(f, withHead("<html><head></head></html>", metaHead({ route })));
      };
      build();
      const ctx = { catalog, editions: [edition], posts: [labPost, agentPost], waves, renderingIds: new Set(waves.map((x) => x.run_id)), matcher, itemCount, gumroadAiLabsIndex: GUM, expectedTested };
      const clean = modelWatchTreeProblems({ outDir: tmp, ctx });
      h.clean("a complete synthetic tree has no problems", clean.problems);
      h.check("the tree walk examined the 8 pages, the 4 share-metadata-only pages and the sitemap (no feed in this tree)", () => h.assert(clean.examined === 8 + 4 + 1, `examined ${clean.examined}`));
      rmSync(join(tmp, "ai-models", "cycle.html"));
      h.trips("the cycle route missing from the built tree", modelWatchTreeProblems({ outDir: tmp, ctx }).problems, "MWH-tree-missing");
      put("ai-models/cycle.html", withHead(cycle, metaHead({ route: "/ai-models/cycle" })));
      rmSync(join(tmp, "ai-models", "leaderboards.html"));
      h.trips("a missing route in the built tree", modelWatchTreeProblems({ outDir: tmp, ctx }).problems, "MWH-tree-missing");
      h.check("a missing route is tolerated only without requireRoutes", () => h.assert(!modelWatchTreeProblems({ outDir: tmp, ctx, requireRoutes: false }).problems.some((p) => p.includes("MWH-tree-missing"))));
      build();
      put("ai-models/watch/2030-01-01.html", editionPage);
      h.trips("a stray edition page with no compiled edition", modelWatchTreeProblems({ outDir: tmp, ctx }).problems, "MWH-tree-leak");
      rmSync(join(tmp, "ai-models", "watch", "2030-01-01.html"));
      put("insights/ghost.html", labPage);
      h.trips("a stray post page with no published post", modelWatchTreeProblems({ outDir: tmp, ctx }).problems, "MWH-tree-leak");
      rmSync(join(tmp, "insights", "ghost.html"));
      put("ai-models/tracker.html", withHead(tracker.replace("<h1>", '<a href="/gone">x</a><h1>'), metaHead({ route: "/ai-models/tracker" })));
      h.trips("a dangling href inside a built page", modelWatchTreeProblems({ outDir: tmp, ctx }).problems, "MWH-href");
      build();
      put("ai-models.html", withHead("<html><head></head></html>", metaHead({ route: "/ai-models", title: HOME_T })));
      h.trips("the homepage og:title on the hub in the built tree", modelWatchTreeProblems({ outDir: tmp, ctx }).problems, "MWH-share-title");
      put("ai-models/tracker.html", withHead(tracker, metaHead({ route: "/ai-models/tracker", canonical: "" })));
      h.trips("a tracker with no canonical in the built tree", modelWatchTreeProblems({ outDir: tmp, ctx }).problems, "MWH-share-canonical");
      build();
      rmSync(join(tmp, "ai-labs.html"));
      h.trips("a share-metadata route missing from the built tree", modelWatchTreeProblems({ outDir: tmp, ctx }).problems, "MWH-tree-missing");
      build();
      put("insights/feed.xml", `<feed><summary>${member}</summary></feed>`);
      if (memberTok) h.trips("a withheld point in the built feed", modelWatchTreeProblems({ outDir: tmp, ctx: { ...ctx, waves: [w] } }).problems, "G24-member-point-token");
      const none = mkdtempSync(join(tmpdir(), "cb-mwh-empty-"));
      try {
        h.check("an empty tree examines nothing (the runner fails on zero)", () => h.assert(modelWatchTreeProblems({ outDir: none, ctx, requireRoutes: false }).examined === 0));
      } finally { rmSync(none, { recursive: true, force: true }); }
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  }
}

// ---------------------------------------------------------------------------------------------------------------------
h.section("the real built tree (site/out)");
{
  const have = existsSync(join(OUT_DIR, "ai-models", "tracker.html")) || existsSync(join(OUT_DIR, "ai-models", "leaderboards.html"));
  if (!have && !REQUIRE_OUT) {
    h.log("  SKIP real-tree scan: site/out has none of the new routes (build first, or pass --require-out in the build chain)");
  } else if (!existsSync(join(OUT_DIR, "ai-models.html")) && REQUIRE_OUT) {
    h.check("site/out exists (--require-out)", () => { throw new Error("site/out is absent; run the build first"); });
  } else {
    const ctx = realContext();
    const { problems, examined } = modelWatchTreeProblems({ outDir: OUT_DIR, ctx, requireRoutes: true });
    h.check(`the real tree was examined (${examined} file(s))`, () => h.assert(examined > 0, "examined nothing"));
    h.check(`the real tree has no model-watch problems (${problems.length})`, () => h.assert(problems.length === 0, `\n    ${problems.slice(0, 25).join("\n    ")}${problems.length > 25 ? `\n    ... ${problems.length - 25} more` : ""}`));
  }
}

await Promise.all(pending);
h.finish();
