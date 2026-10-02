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
import { harness, haveOut, OUT_DIR, WAVES_DIR, SITE as SITE_DIR } from "./lib/html-gate-harness.mjs";
import { seoProblems, sitemapProblems, loadWaves, textBlocks, extractJsonLd, jsonLdStrings, reportFiles, decode, reportedWaves } from "./lib/model-report-html-gates.mjs";
import { renderableEntries } from "./lib/pilot-render-gate.mjs";
import { lexiconProblems } from "./lib/model-report.mjs";
import { goodReportHtml, plainIndexHtml, injectBody, siteFacts } from "./lib/model-report-html-fixtures.mjs";

const h = harness("test-model-report-seo");
const { manifest, waves } = loadWaves(WAVES_DIR);
await h.check("a committed wave exists to test against", () => h.assert(waves.length > 0, "no committed wave"));
// The full probe set needs a wave with a separated model (a title/meta/JSON-LD that names no model, a separated point to withhold from meta);
// the wave with none has its own probes below. Prefer a wave whose narrative exists (the one that can render).
const hasSep = (x) => x.derived.separated_subjects.length > 0;
const wave = reportedWaves(waves).find(hasSep) ?? waves.find(hasSep) ?? waves[0];
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
const activeManifest = manifest.filter((e) => e.run_id === wave.run_id).map((e) => ({ ...e, decision_status: "active" }));
h.clean("a sitemap entry for the rendered report passes", sitemapProblems(sm(), activeManifest, {}));
h.trips("a sitemap without the rendered report", sitemapProblems("<urlset></urlset>", activeManifest, {}), "G20-sitemap");
h.trips("a sitemap entry with changefreq weekly", sitemapProblems(sm().replace("never", "weekly"), activeManifest, {}), "changefreq");
h.trips("a sitemap entry with the wrong lastmod", sitemapProblems(sm().replace(`<lastmod>${wave.report_date}`, "<lastmod>2020-01-01"), activeManifest, {}), "lastmod");

// ---------------------------------------------------------------- a wave with no separated model
{
  const { syntheticWave } = await import("./lib/model-report-fixtures.mjs");
  const noSep = [
    ...waves.filter((x) => !hasSep(x)).map((x) => [`committed ${x.run_id}`, x]),
    ["synthetic (dotted ids)", syntheticWave({ runId: "wave-2029-05-05", clusters: [[["orion1.5-9b", 40.1], ["vega2.0-3b", 42.0]]], dims: ["KIN", "LIS", "NOT", "PLA", "REF", "TRU"], excluded: null, local: true, reversePairs: true, seed: 5 })],
  ];
  await h.check("at least one committed wave has no separated model (these probes are then about the real second pilot)", () => h.assert(noSep.some(([n]) => n.startsWith("committed")), "none"));
  for (const [label, wv] of noSep) {
    h.section(`G20 for a wave with no separated model: ${label}`);
    const goodN = await goodReportHtml(wv);
    const seoN = (html) => seoProblems({ html, wave: wv, expected: { title: facts.reportTitle(wv) } });
    const ids = wv.design.subjects;
    h.clean("a good report page passes G20", seoN(goodN));
    await h.check("the title is built from the wave, names no model and no number beyond the month and year", () => {
      const t = facts.reportTitle(wv);
      h.assert(/^Unofficial Pilot: /.test(t) && ids.every((id) => !t.includes(id)), t);
    });
    await h.check("the meta description, social line and abstract say the pilot could not tell the subjects apart, and name none", () => {
      const s = facts.reportSeoStrings(wv);
      h.assert(/could not tell/.test(s.description) && /could not tell/.test(s.social), `${s.description} | ${s.social}`);
      for (const t of [s.description, s.social, s.title]) for (const id of ids) h.assert(!t.includes(id), `${id} in "${t.slice(0, 60)}"`);
    });
    for (const id of ids) {
      const tok = wv.subjects[id].pilot_composite.toFixed(1);
      const end = wv.subjects[id].pilot_composite_interval95[0].toFixed(1);
      h.trips(`${id}: a meta description with its point`, seoN(setMeta(goodN, "name", "description", `It reached ${tok} overall.`)), "G20-figure");
      h.trips(`${id}: an og:description with its point`, seoN(setMeta(goodN, "property", "og:description", `Reached ${tok}.`)), "G20-figure");
      h.trips(`${id}: a meta description with an end of its range`, seoN(setMeta(goodN, "name", "description", `Range from ${end}.`)), "G20-figure");
      h.trips(`${id}: a Report abstract with its point`, seoN(goodN.replace(/(<script type="application\/ld\+json">\{[^<]*"@type":"Report"[^<]*?"abstract":")[^"]*"/, `$1The pilot reached ${tok}."`)), "G20-figure");
      h.trips(`${id}: named in the title`, seoN(goodN.replace(/<title>([^<]*)<\/title>/, (_m, t) => `<title>${t} ${id}</title>`)), "G20-title");
      h.trips(`${id}: named in the meta description`, seoN(setMeta(goodN, "name", "description", `${id} was tested.`)), "G20-meta");
    }
    h.trips("an ordering word beside the two subjects in the meta description", seoN(setMeta(goodN, "name", "description", `${ids[0]} is higher than ${ids[1]}.`)), "G20-lexicon (meta description)");
  }
}

// ---------------------------------------------------------------- /ai-models pilot copy: every published pilot, newest first, no figure
h.section("/ai-models copy for the published pilots (card, hero, FAQ, banner)");
{
  const { leakProblems } = await import("./lib/model-report-html-gates.mjs");
  const { makeNaming } = await import("./lib/model-report.mjs");
  const { readFileSync: rd } = await import("node:fs");
  const stubReport = { word_count: 3000, sections: [{ id: "not-scores", html: "<ul><li>a</li><li>b</li><li>c</li></ul>" }] };
  const inManifestOrder = manifest.map((e) => waves.find((x) => x.run_id === e.run_id));
  const rendered = inManifestOrder.map((wv) => ({ wave: wv, report: stubReport }));
  await h.check("at least two waves are committed (the multi-pilot copy is then about the real pilots)", () => h.assert(rendered.length >= 2, `${rendered.length} wave(s)`));
  if (rendered.length >= 2) {
    const one = facts.pilotsPageFacts([rendered[rendered.length - 1]]);
    const many = facts.pilotsPageFacts(rendered);
    const strings = (p) => [p.heroSentence, p.bannerClause, p.metaClause, p.accurateClause, `Not accurate:${p.notAccurateClause}`, p.cardDescription, p.faqQ1Addendum, p.newsletterBody, ...p.faq.flatMap((q) => [q.question, q.answer]), ...p.items.flatMap((i) => [i.heading, i.finding, i.anchorText, i.coverage, ...i.bullets, i.heroSentence, i.bannerClause, i.faqQ1Addendum, ...i.faq.flatMap((q) => [q.question, q.answer])])];
    await h.check("one published pilot: every aggregate string is that pilot's own single-pilot string", () => {
      const it = one.items[0];
      h.assert(one.count === 1 && one.heroSentence === it.heroSentence && one.bannerClause === it.bannerClause && one.faqQ1Addendum === it.faqQ1Addendum && JSON.stringify(one.faq) === JSON.stringify(it.faq), "single-pilot wording changed");
    });
    await h.check("several published pilots: one card item per manifest entry that renders, newest first, each with its own link", () => {
      h.assert(many.count === rendered.length && many.items.length === rendered.length, `${many.items.length} items for ${rendered.length} pilots`);
      h.assert(JSON.stringify(many.items.map((i) => i.runId)) === JSON.stringify(manifest.map((e) => e.run_id)), `order ${many.items.map((i) => i.runId)} != manifest order`);
      h.assert(many.latest.runId === manifest[0].run_id, "latest is not the newest manifest entry");
      h.assert(new Set(many.items.map((i) => i.href)).size === many.items.length && many.items.every((i) => i.href === `/ai-models/reports/${i.runId}`), "links are not one per pilot");
      h.assert(many.items.every((i) => many.heroSentence.includes(i.dateLong)), "the hero does not name every pilot by date");
    });
    await h.check("several pilots: the hero, FAQ and banner count the pilots and say none of them is a score", () => {
      h.assert(many.heroSentence.startsWith(facts.capFirst(facts.numberWord(many.count))), many.heroSentence);
      h.assert(/(?:Neither|None) is a score/.test(many.heroSentence), many.heroSentence);
      h.assert(many.faq[0].question === "What did the pilots find?" && /official score/.test(many.faq[0].answer), JSON.stringify(many.faq[0]));
      h.assert(new RegExp(`${facts.capFirst(facts.numberWord(many.count))} unofficial pilots`).test(many.bannerClause), many.bannerClause);
    });
    await h.check("each pilot's finding is stated in words and matches its own wave (a predicate over the wave, not typed copy)", () => {
      for (const i of many.items) {
        const wv = waves.find((x) => x.run_id === i.runId);
        const allGrouped = wv.derived.separated_subjects.length === 0 && wv.derived.not_separated_groups.length === 1;
        h.assert(allGrouped ? /could not tell its .* models apart/.test(i.finding) : /separated/.test(i.finding), `${i.runId}: ${i.finding}`);
      }
    });
    await h.check("no string names a model of any wave, carries a per-model figure, or uses ranking language", () => {
      const bad = [];
      for (const s of strings(many)) {
        for (const wv of waves) {
          for (const m of makeNaming(wv).mentions(s)) bad.push(`${m.id} named in "${s.slice(0, 60)}"`);
          const leaks = leakProblems({ html: `<main><p>${s}</p></main>`, wave: wv, kind: "index" });
          if (leaks.length) bad.push(`${wv.run_id}: ${leaks[0].slice(0, 90)}`);
          for (const q of lexiconProblems(s, wv)) bad.push(`${q.rule}: ${s.slice(0, 60)}`);
        }
        if (/\b(?:first|second|third|best|better|worse|worst|rank\w*|top|ahead|behind|winner|leader\w*|score[ds]? (?:higher|lower))\b/i.test(s) && !/\b(?:not|no|never|neither|none)\b[^.]{0,60}\brank/i.test(s)) bad.push(`ordering word in "${s.slice(0, 80)}"`);
      }
      h.assert(bad.length === 0, bad.slice(0, 4).join(" | "));
    });
    const wv0 = waves.find((x) => x.derived.separated_subjects.length === 0) ?? waves[0];
    const tok0 = wv0.subjects[wv0.design.subjects[0]].pilot_composite.toFixed(1);
    h.trips("a planted point estimate in the card text fails the scan (so the check above is not vacuous)", leakProblems({ html: `<main><p>${many.cardDescription} It reached ${tok0}.</p></main>`, wave: wv0, kind: "index" }), "G19-member-composite");
    const src = (rel) => rd(join(SITE_DIR, rel), "utf8");
    await h.check("the page and the card are generated from the manifest, not from one pilot (source scan)", () => {
      const page = src("src/app/ai-models/page.tsx");
      const card = src("src/components/model-benchmark/pilot/PilotSummaryCard.tsx");
      h.assert(/loadRenderableReports\(\)/.test(page) && !/latestRenderableReport\(/.test(page), "page.tsx reads one pilot, not every rendered report");
      h.assert(/facts\.items\.map/.test(card), "the card does not map over every pilot");
      h.assert(/renderableEntries\(\)\.map/.test(src("src/app/sitemap.ts")), "the sitemap is not generated from the render gate");
      h.assert(/renderableEntries\(manifest\)/.test(src("scripts/build-llms.mjs")), "llms.txt is not generated from the render gate");
    });
  }
}

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
