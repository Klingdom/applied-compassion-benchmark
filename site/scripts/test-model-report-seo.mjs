#!/usr/bin/env node
/**
 * test-model-report-seo.mjs -- template I: G20 (test:model-report-seo), template G.
 *
 * Over the built report page(s) in site/out/ai-models/reports/:
 *   - one <title>, status words first, built from the wave (no model name, no figure), lexicon-clean
 *   - meta description, og:*, twitter:* carry no per-model figure and no band name, and pass the lexicon
 *     (the same lexiconProblems() the report compiler uses)
 *   - one absolute self-canonical, indexable (no noindex), og:url matches
 *   - JSON-LD: exactly one Report node (headline = title, creativeWorkStatus unofficial, reportNumber,
 *     isBasedOn the wave file, no sameAs), a BreadcrumbList, FAQPage only if visible; every string passes
 *     the lexicon; none of the forbidden types or keys (G6 covers the types)
 *   - no leaderboard term within 60 characters of a model name in headings, captions, alt text or JSON-LD
 *   - one <h1>; no link to an AI Labs entity page
 *   - sitemap: an entry per rendered report (changefreq never, lastmod the report date) and none otherwise
 * and over /ai-models itself: the "no model has an official score" rule (template F2) and, when no pilot
 * renders, the absence of every trace of one.
 *
 * Planted probes first, then the real tree. Fail on zero.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { harness, haveOut, OUT_DIR, WAVES_DIR } from "./lib/html-gate-harness.mjs";
import { seoProblems, sitemapProblems, loadWaves, textBlocks, extractJsonLd, jsonLdStrings, reportFiles, decode } from "./lib/model-report-html-gates.mjs";
import { renderableEntries } from "./lib/pilot-render-gate.mjs";
import { lexiconProblems } from "./lib/model-report.mjs";
import { goodReportHtml, plainIndexHtml, injectBody, siteFacts } from "./lib/model-report-html-fixtures.mjs";

const h = harness("test-model-report-seo");
const { manifest, waves } = loadWaves(WAVES_DIR);
await h.check("a committed wave exists to test against", () => h.assert(waves.length > 0, "no committed wave"));
const wave = waves[0];
const facts = await siteFacts();
const expected = { title: facts.reportTitle(wave) };
const good = await goodReportHtml(wave);
const seo = (html) => seoProblems({ html, wave, expected });
const sepId = wave.derived.separated_subjects[0];
const member = wave.design.subjects.find((s) => !wave.derived.separated_subjects.includes(s));
const compTok = wave.subjects[member].pilot_composite.toFixed(1);
const endTok = wave.subjects[sepId].pilot_composite_interval95[0].toFixed(1);
const ld = (obj) => `<script type="application/ld+json">${JSON.stringify(obj)}</script>`;
const setMeta = (html, attr, name, content) => html.replace(new RegExp(`(<meta ${attr}="${name.replace(/[:.]/g, "\\$&")}" content=")[^"]*(")`), `$1${content}$2`);

h.section("G20 on a report page (planted probes)");
h.clean("a good report page passes G20", seo(good));
// title
h.trips("a title that does not start with the status words", seo(good.replace(/<title>Unofficial Pilot:/, "<title>Results:")), "G20-title");
h.trips("two <title> elements", seo(good.replace("</head>", "<title>x</title></head>")), "G20-title");
h.trips("a title naming a model", seo(good.replace(/<title>([^<]*)<\/title>/, (_m, t) => `<title>${t} ${member}</title>`)), "G20-title");
h.trips("a title with an extra number", seo(good.replace(/<title>([^<]*)<\/title>/, (_m, t) => `<title>${t} ${compTok}</title>`)), "G20-title");
h.trips("a title with a banned word", seo(good.replace(/<title>Unofficial Pilot:/, "<title>Unofficial Pilot: Best")), "G20-lexicon (title)");
h.trips("a title that differs from the title built from the wave", seo(good.replace(/<title>Unofficial Pilot: (\w+)/, "<title>Unofficial Pilot: Many")), "differs from the title built from the wave");
// meta
h.trips("no meta description", seo(good.replace(/<meta name="description"[^>]*>/, "")), "G20-meta");
h.trips("a meta description with a composite", seo(setMeta(good, "name", "description", `It scored ${compTok} overall.`)), "G20-figure");
h.trips("a meta description with an interval end", seo(setMeta(good, "name", "description", `Range from ${endTok}.`)), "G20-figure");
h.trips("a meta description with a banned word", seo(setMeta(good, "name", "description", "The test beats every other test.")), "G20-lexicon (meta description)");
h.trips("a meta description naming a model", seo(setMeta(good, "name", "description", `${member} was tested.`)), "G20-meta");
h.trips("a meta description with a band name", seo(setMeta(good, "name", "description", "A model reached the Established band.")), "G20-band");
// canonical, robots, og
h.trips("no canonical", seo(good.replace(/<link rel="canonical"[^>]*>/, "")), "G20-canonical");
h.trips("a relative canonical", seo(good.replace(/(<link rel="canonical" href=")[^"]*"/, `$1/ai-models/reports/${wave.run_id}"`)), "G20-canonical");
h.trips("a canonical to another page", seo(good.replace(/(<link rel="canonical" href=")[^"]*"/, "$1https://compassionbenchmark.com/ai-models\"")), "G20-canonical");
h.trips("noindex", seo(good.replace('content="index, follow"', 'content="noindex, nofollow"')), "G20-robots");
h.trips("no og:title", seo(good.replace(/<meta property="og:title"[^>]*>/, "")), "G20-og");
h.trips("an og:description with a composite", seo(setMeta(good, "property", "og:description", `Scored ${compTok}.`)), "G20-figure");
h.trips("an og:url that is not the report", seo(setMeta(good, "property", "og:url", "https://compassionbenchmark.com/ai-models")), "G20-og");
h.trips("an og:image:alt with a banned word", seo(good.replace("</head>", '<meta property="og:image:alt" content="Top models compared"/></head>')), "G20-lexicon (og:image:alt)");
h.trips("a twitter description with a leaderboard word", seo(setMeta(good, "name", "twitter:description", "The leaderboard of AI compassion.")), "G20-lexicon (twitter:description)");
// JSON-LD
const stripLd = (html, type) => html.replace(new RegExp(`<script type="application/ld\\+json">\\{[^<]*"@type":"${type}"[^<]*</script>`), "");
h.trips("no Report node", seo(stripLd(good, "Report")), "G20-jsonld: expected exactly one Report");
h.trips("two Report nodes", seo(good.replace("</head>", ld({ "@type": "Report", headline: "x" }) + "</head>")), "G20-jsonld: expected exactly one Report");
h.trips("no BreadcrumbList", seo(stripLd(good, "BreadcrumbList")), "no BreadcrumbList");
const reportNode = JSON.parse(good.match(/<script type="application\/ld\+json">(\{[^<]*"@type":"Report"[^<]*)<\/script>/)[1]);
const withReport = (mut) => good.replace(/<script type="application\/ld\+json">\{[^<]*"@type":"Report"[^<]*<\/script>/, ld({ ...reportNode, ...mut }));
h.trips("a Report headline that differs from the title", seo(withReport({ headline: "Something else" })), "differs from <title>");
h.trips("a creativeWorkStatus that does not say unofficial", seo(withReport({ creativeWorkStatus: "Published" })), "creativeWorkStatus");
h.trips("a wrong reportNumber", seo(withReport({ reportNumber: "x" })), "reportNumber");
h.trips("an isBasedOn that is not the wave file", seo(withReport({ isBasedOn: "https://compassionbenchmark.com/data/model-runs/x/analysis.json" })), "isBasedOn");
h.trips("a Report with sameAs", seo(withReport({ sameAs: ["https://example.com/claude-opus"] })), "sameAs");
h.trips("an abstract with a banned word", seo(withReport({ abstract: "The best model was clear." })), "G20-lexicon (JSON-LD abstract)");
h.trips("an abstract with a composite", seo(withReport({ abstract: `The pilot reached ${compTok}.` })), "G20-figure");
h.trips("a description in JSON-LD with a band name", seo(withReport({ description: "An Established result." })), "G20-band");
h.trips("a FAQPage question that is not visible", seo(good.replace("</head>", ld({ "@type": "FAQPage", mainEntity: [{ "@type": "Question", name: "Is this question visible anywhere on the page at all?", acceptedAnswer: { "@type": "Answer", text: "No." } }] }) + "</head>")), "not visible");
h.clean("a FAQPage whose question IS visible passes", seo(injectBody(good, "<h2>Is this question visible anywhere on the page at all?</h2>").replace("</head>", ld({ "@type": "FAQPage", mainEntity: [{ "@type": "Question", name: "Is this question visible anywhere on the page at all?", acceptedAnswer: { "@type": "Answer", text: "Yes." } }] }) + "</head>")));
// leaderboard near a model
h.trips("a heading with a leaderboard word near a model name", seo(injectBody(good, `<h2>${member} tops the leaderboard</h2>`)), "G20-near-model");
h.trips("a figcaption with \"ranked\" near a model name", seo(injectBody(good, `<figure><figcaption>${sepId} ranked last</figcaption></figure>`)), "G20-near-model");
h.trips("an alt text with a leaderboard word near a model name", seo(injectBody(good, `<img alt="${member} wins" src="x"/>`)), "G20-near-model");
h.clean("\"not a ranking\" near a model name is fine", seo(injectBody(good, `<h2>${member}: not a ranking</h2>`)));
// structure and links
h.trips("two <h1>", seo(injectBody(good, "<h1>again</h1>")), "G20-structure");
h.trips("no <h1>", seo(good.replace(/<h1>[\s\S]*?<\/h1>/, "")), "G20-structure");
h.trips("a link to an AI Labs entity page", seo(injectBody(good, '<a href="/ai-lab/anthropic">Anthropic</a>')), "G20-links");
// sitemap
const sm = (extra = "") => `<urlset><url><loc>https://compassionbenchmark.com/ai-models/reports/${wave.run_id}</loc><lastmod>${wave.report_date}</lastmod><changefreq>never</changefreq>${extra}</url></urlset>`;
const activeManifest = manifest.map((e) => ({ ...e, decision_status: "active" }));
h.clean("a sitemap entry for the rendered report passes", sitemapProblems(sm(), activeManifest, {}));
h.trips("a sitemap without the rendered report", sitemapProblems("<urlset></urlset>", activeManifest, {}), "G20-sitemap");
h.trips("a sitemap entry with changefreq weekly", sitemapProblems(sm().replace("never", "weekly"), activeManifest, {}), "changefreq");
h.trips("a sitemap entry with the wrong lastmod", sitemapProblems(sm().replace(`<lastmod>${wave.report_date}`, "<lastmod>2020-01-01"), activeManifest, {}), "lastmod");

// ---------------------------------------------------------------- /ai-models wording (template F2)
h.section("/ai-models wording rule (planted probes)");
/** Blocks that say a model "was scored/evaluated" without "official". Institution-index uses are allowed. */
function officialRuleProblems(html) {
  const p = [];
  for (const b of textBlocks(html)) {
    for (const s of b.split(/(?<=[.!?])\s+/)) {
      if (/\b(?:scored|evaluated)\b/i.test(s) && !/official/i.test(s) && !/\bscored entit|\bscored (?:on|by|against|from|across|for)\b|scored for compassion|not scored|\bunscored\b|\bevaluated on\b|\bwas scored\b.*\bindex\b|Draft|are scored\b|scorable|being scored/i.test(s) && /\bmodels?\b|\bno model\b/i.test(s)) p.push(`G20-official: "${s.slice(0, 110)}" says a model was scored/evaluated without "official"`);
    }
  }
  return p;
}
h.clean("a compliant /ai-models page passes the rule", officialRuleProblems(plainIndexHtml()));
h.trips("\"No model has been scored yet.\"", officialRuleProblems(plainIndexHtml("<p>No model has been scored yet.</p>")), "G20-official");
h.trips("\"has evaluated 0 models to date\"", officialRuleProblems(plainIndexHtml("<p>The index has evaluated 0 models to date.</p>")), "G20-official");
h.clean("\"officially evaluated\" passes", officialRuleProblems(plainIndexHtml("<p>The index has officially evaluated 0 models.</p>")));

// ---------------------------------------------------------------- real tree
h.section("the built tree in site/out");
if (haveOut(h)) {
  const rendering = new Map(renderableEntries(manifest, process.env).map((x) => [x.entry.run_id, x.mode]));
  const reports = reportFiles(OUT_DIR).filter((f) => f.endsWith(".html"));
  h.log(`  info rendering: ${[...rendering.keys()].join(", ") || "none (default build)"}; ${reports.length} report page(s) built`);
  const idxHtml = readFileSync(join(OUT_DIR, "ai-models.html"), "utf8");
  await h.check("/ai-models <title> says there are no official model scores yet", () => {
    const t = decode(idxHtml.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "");
    h.assert(/No Official Model Scores Yet/.test(t), `title: "${t}"`);
  });
  await h.check("/ai-models meta description says \"No model has an official score\"", () => {
    const d = decode(idxHtml.match(/<meta name="description" content="([^"]*)"/i)?.[1] ?? "");
    h.assert(/No model has an official score/.test(d), `description: "${d}"`);
  });
  await h.check("/ai-models FAQ answer 1 says \"No model has an official score\" and refuses a ranking", () => {
    const q = jsonLdStrings(extractJsonLd(idxHtml)).find((x) => /most compassionate/i.test(x.text) && x.key === "name");
    h.assert(q, "FAQ question not found in JSON-LD");
    const a = q.node.acceptedAnswer?.text ?? "";
    h.assert(/No model has an official score/.test(a) && /publishes no ranking/.test(a), `answer: "${a.slice(0, 160)}"`);
  });
  await h.check("/ai-models: no model is called scored or evaluated without \"official\"", () => {
    const p = officialRuleProblems(idxHtml);
    h.assert(p.length === 0, p.join(" | "));
  });
  await h.check("/ai-models JSON-LD strings (other than the FAQ question refusing a ranking) pass the lexicon", () => {
    const bad = [];
    for (const x of jsonLdStrings(extractJsonLd(idxHtml))) {
      if (!["name", "text", "description", "headline", "abstract"].includes(x.key)) continue;
      if (/most compassionate/i.test(x.text) && x.key === "name") continue; // the FAQ question that refuses the ranking (template D)
      for (const q of lexiconProblems(x.text, wave)) if (q.rule !== "R-ordering-adjacent" || rendering.size) bad.push(`${q.rule}: ${x.text.slice(0, 60)}`);
    }
    h.assert(bad.length === 0, bad.slice(0, 4).join(" | "));
  });
  const sitemap = join(OUT_DIR, "sitemap.xml");
  await h.check("sitemap.xml exists and matches the render gate", () => {
    h.assert(existsSync(sitemap), "no sitemap.xml");
    const xml = readFileSync(sitemap, "utf8");
    const p = sitemapProblems(xml, manifest, process.env);
    for (const e of manifest) if (!rendering.has(e.run_id) && xml.includes(`/ai-models/reports/${e.run_id}`)) p.push(`G20-sitemap: lists a report that does not render (${e.run_id})`);
    h.assert(p.length === 0, p.join(" | "));
  });
  for (const f of reports) {
    const runId = f.split("/")[2].replace(/\.html$/, "");
    const wv = waves.find((x) => x.run_id === runId);
    await h.check(`G20 ${f}`, () => {
      h.assert(wv, `no wave for ${runId}`);
      const p = seoProblems({ html: readFileSync(join(OUT_DIR, f), "utf8"), wave: wv, expected: { title: facts.reportTitle(wv) } });
      h.assert(p.length === 0, p.join(" | "));
    });
  }
  // Fail on zero: the scan examined /ai-models and the sitemap even when no report renders.
  await h.check("fail-on-zero: the real-tree scan examined /ai-models and the sitemap", () => h.assert(idxHtml.length > 0 && existsSync(sitemap), "nothing examined"));
}
h.finish();
