#!/usr/bin/env node
/**
 * test-model-report-html.mjs -- template I: G5 (status-banner), G6 (no-rating-schema), the render
 * gate over the built tree, and the H CTA rules. `npm run test:model-report-html`.
 *
 *   G5   the unofficial banner is a labelled, non-sticky region, first in <main>, before the H1
 *   G6   no Review/Rating/AggregateRating/ClaimReview/Dataset/ItemList/Product/SoftwareApplication/
 *        ScholarlyArticle JSON-LD and no rating keys anywhere under /ai-models/**
 *   TREE default build: NO /ai-models/reports/** file, no public wave file, no sitemap entry, and no
 *        pilot wording anywhere in /ai-models/**. Preview build (CB_PREVIEW_PILOT_REPORTS=1) or a ratified
 *        wave: exactly the rendered reports, with the PREVIEW strip when the decision is only proposed.
 *   H    no paid link, Score-Watch, urgency, prefilled share or second primary button in the report article
 *
 * Each rule is proved on synthetic pages with planted probes, then run over site/out. Fail on zero.
 */
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { harness, haveOut, OUT_DIR, WAVES_DIR, TREE_ONLY } from "./lib/html-gate-harness.mjs";
import {
  bannerProblems, ratingSchemaProblems, previewStripProblems, treeProblems, ctaProblems, loadWaves, aiModelsFiles, reportFiles,
} from "./lib/model-report-html-gates.mjs";
import { goodReportHtml, plainIndexHtml, injectBody } from "./lib/model-report-html-fixtures.mjs";

const h = harness("test-model-report-html");
const { manifest, waves } = loadWaves(WAVES_DIR);
await h.check("a committed wave exists to test against", () => h.assert(waves.length > 0, "no committed wave"));
const wave = waves[0];
if (!TREE_ONLY) {
const PREVIEW_ENV = { CB_PREVIEW_PILOT_REPORTS: "1" };
const asActive = manifest.map((e) => ({ ...e, decision_status: "active" }));
// Synthetic probes below fix their own mode; they must not inherit the live decision status (which flips on ratification).
const asProposed = manifest.map((e) => ({ ...e, decision_status: "proposed" }));

// ---------------------------------------------------------------- G5
h.section("G5 status-banner (planted probes)");
const good = await goodReportHtml(wave);
h.clean("a good report page passes G5", bannerProblems(good));
const bannerRe = /<aside role="region"[\s\S]*?<\/aside>/;
const banner = good.match(bannerRe)[0];
h.trips("banner after the H1", bannerProblems(good.replace(banner, "").replace("</h1>", `</h1>${banner}`)), "G5-order");
h.trips("a div before the banner in <main>", bannerProblems(good.replace('<main id="main" class="flex-1">', '<main id="main" class="flex-1"><div>Skip</div>')), "G5-first");
h.trips("banner without the word unofficial", bannerProblems(good.replace(/UNOFFICIAL PILOT\./, "NOTICE.")), "G5-text");
h.trips("banner without \"not a ranking\"", bannerProblems(good.replace("Not a ranking. ", "")), "G5-text");
h.trips("banner without \"no cross-model comparison\"", bannerProblems(good.replace("No cross-model comparison.", "")), "G5-text");
h.trips("sticky banner", bannerProblems(good.replace('class="pilot-banner"', 'class="pilot-banner sticky top-0"')), "G5-sticky");
h.trips("banner not a region", bannerProblems(good.replace('role="region" ', "")), "G5-banner");
h.trips("banner without an accessible name", bannerProblems(good.replace(/ aria-label="Status of these results"/, "")), "G5-label");
h.trips("no <main>", bannerProblems(good.replace(/<main[^>]*>/, "<div>").replace("</main>", "</div>")), "G5-main");
h.clean("the preview strip passes when present", previewStripProblems((await goodReportHtml(wave, { preview: true }))));
h.trips("a proposed wave without the preview strip", previewStripProblems(good), "G5-preview");

// ---------------------------------------------------------------- G6
h.section("G6 no-rating-schema (planted probes)");
const ld = (obj) => `<script type="application/ld+json">${JSON.stringify(obj)}</script>`;
h.clean("the report page's JSON-LD passes G6 (Report + BreadcrumbList)", ratingSchemaProblems(good, { requireReport: true }));
for (const t of ["Review", "AggregateRating", "Rating", "ClaimReview", "Dataset", "ItemList", "Product", "SoftwareApplication", "ScholarlyArticle"]) {
  h.trips(`forbidden type ${t}`, ratingSchemaProblems(good + ld({ "@context": "https://schema.org", "@type": t })), "G6-type");
}
h.trips("a nested forbidden type", ratingSchemaProblems(good + ld({ "@type": "Report", about: { "@type": "SoftwareApplication" } })), "G6-type");
h.trips("ratingValue", ratingSchemaProblems(good + ld({ "@type": "Report", ratingValue: 4 })), "G6-key");
h.trips("additionalProperty (a composite)", ratingSchemaProblems(good + ld({ "@type": "Report", additionalProperty: { value: 40 } })), "G6-key");
h.trips("reviewRating", ratingSchemaProblems(good + ld({ "@type": "Report", reviewRating: {} })), "G6-key");
h.trips("unparseable JSON-LD", ratingSchemaProblems(good + '<script type="application/ld+json">{oops</script>'), "G6-parse");
h.trips("a report route with no Report node", ratingSchemaProblems(plainIndexHtml(), { requireReport: true }), "G6-missing");
h.trips("two Report nodes", ratingSchemaProblems(good + ld({ "@type": "Report" }), { requireReport: true }), "G6-multiple");
h.clean("an index page without a Report passes when none is required", ratingSchemaProblems(plainIndexHtml()));

// ---------------------------------------------------------------- tree gate
h.section("render gate over a built tree (planted trees)");
function tree(files) {
  const dir = mkdtempSync(join(tmpdir(), "cb-tree-"));
  for (const [rel, body] of Object.entries(files)) {
    const f = join(dir, rel);
    mkdirSync(join(f, ".."), { recursive: true });
    writeFileSync(f, body);
  }
  return dir;
}
const id = wave.run_id;
const sitemapWith = (yes) => `<urlset>${yes ? `<url><loc>https://compassionbenchmark.com/ai-models/reports/${id}</loc><lastmod>${wave.report_date}</lastmod><changefreq>never</changefreq></url>` : ""}</urlset>`;
const cleanTree = { "ai-models.html": plainIndexHtml(), "ai-models/methodology.html": plainIndexHtml(), "sitemap.xml": sitemapWith(false) };
const run = (files, man, env) => {
  const dir = tree(files);
  try { return treeProblems({ outDir: dir, manifest: man, waves, env }); } finally { rmSync(dir, { recursive: true, force: true }); }
};
h.clean("default build (proposed, no flag), clean tree: passes", run(cleanTree, asProposed, {}));
h.trips("default build with a report page emitted", run({ ...cleanTree, [`ai-models/reports/${id}.html`]: good }, asProposed, {}), "TREE-leak");
h.trips("default build with a report payload emitted", run({ ...cleanTree, [`ai-models/reports/${id}.txt`]: "x" }, asProposed, {}), "TREE-leak");
h.trips("default build with the reports directory present", run({ ...cleanTree, "ai-models/reports/__next.reports.txt": "x" }, asProposed, {}), "TREE-leak");
h.trips("default build publishing the wave file", run({ ...cleanTree, [`data/model-waves/${id}.json`]: "{}" }, asProposed, {}), "TREE-leak");
h.trips("default build listing the report in the sitemap", run({ ...cleanTree, "sitemap.xml": sitemapWith(true) }, asProposed, {}), "TREE-leak");
h.trips("default build whose /ai-models says \"unofficial pilot\"", run({ ...cleanTree, "ai-models.html": plainIndexHtml("<p>See the unofficial pilot.</p>") }, asProposed, {}), "PILOT-mention");
h.trips("default build whose /ai-models names a pilot subject", run({ ...cleanTree, "ai-models.html": plainIndexHtml(`<p>${wave.design.subjects[0]} was tested.</p>`) }, asProposed, {}), "PILOT-mention");
h.trips("default build whose /ai-models links the report", run({ ...cleanTree, "ai-models.html": plainIndexHtml(`<a href="/ai-models/reports/${id}">r</a>`) }, asProposed, {}), "PILOT-mention");
h.trips("default build whose payload mentions the run id", run({ ...cleanTree, "ai-models.txt": `..."${id}"...` }, asProposed, {}), "PILOT-mention");
h.trips("a superseded wave never previews (flag set, decision superseded, report emitted)", run({ ...cleanTree, [`ai-models/reports/${id}.html`]: good }, manifest.map((e) => ({ ...e, decision_status: "superseded" })), PREVIEW_ENV), "TREE-leak");

const previewFiles = { ...cleanTree, [`ai-models/reports/${id}.html`]: await goodReportHtml(wave, { preview: true }), [`data/model-waves/${id}.json`]: "{}", "sitemap.xml": sitemapWith(true) };
h.clean("preview build (flag set): the report, the strip, the public wave file and the sitemap entry pass", run(previewFiles, asProposed, PREVIEW_ENV));
h.trips("preview build with the report missing", run(Object.fromEntries(Object.entries(previewFiles).filter(([k]) => !k.startsWith("ai-models/reports/"))), asProposed, PREVIEW_ENV), "TREE-missing");
h.trips("preview build without the PREVIEW strip", run({ ...previewFiles, [`ai-models/reports/${id}.html`]: good }, asProposed, PREVIEW_ENV), "G5-preview");
h.trips("preview build without the public wave file", run(Object.fromEntries(Object.entries(previewFiles).filter(([k]) => !k.startsWith("data/"))), asProposed, PREVIEW_ENV), "TREE-missing");
h.trips("preview build without the sitemap entry", run({ ...previewFiles, "sitemap.xml": sitemapWith(false) }, asProposed, PREVIEW_ENV), "TREE-missing");
h.trips("preview build whose report has a sticky banner", run({ ...previewFiles, [`ai-models/reports/${id}.html`]: (await goodReportHtml(wave, { preview: true })).replace('class="pilot-banner"', 'class="pilot-banner sticky"') }, asProposed, PREVIEW_ENV), "G5-sticky");
const activeFiles = { ...previewFiles, [`ai-models/reports/${id}.html`]: good };
h.clean("ratified wave (active): renders without the flag and without the strip", run(activeFiles, asActive, {}));
h.trips("ratified wave still carrying the PREVIEW strip", run({ ...activeFiles, [`ai-models/reports/${id}.html`]: await goodReportHtml(wave, { preview: true }) }, asActive, {}), "still carries the PREVIEW strip");
h.trips("ratified wave whose report was not emitted", run({ ...cleanTree, "sitemap.xml": sitemapWith(true), [`data/model-waves/${id}.json`]: "{}" }, asActive, {}), "TREE-missing");

// ---------------------------------------------------------------- H
h.section("H CTA rules in the report article (planted probes)");
h.clean("a good report article passes the CTA rules (the global footer is outside <main>)", ctaProblems(good));
h.trips("a Gumroad link", ctaProblems(injectBody(good, '<p><a href="https://gumroad.com/l/x">Buy</a></p>')), "H-paid-link");
h.trips("a pricing link", ctaProblems(injectBody(good, '<p><a href="/pricing">Pricing</a></p>')), "H-paid-link");
h.trips("a contact-sales link", ctaProblems(injectBody(good, '<p><a href="/contact-sales">Talk to sales</a></p>')), "H-paid-link");
h.trips("a Score-Watch mention", ctaProblems(injectBody(good, "<p>Try Score-Watch alerts.</p>")), "H-score-watch");
h.trips("urgency copy", ctaProblems(injectBody(good, "<p>See which AI fails.</p>")), "H-urgency");
h.trips("a share intent link", ctaProblems(injectBody(good, '<p><a href="https://twitter.com/intent/tweet?text=x">Share</a></p>')), "H-paid-link");
h.trips("a prefilled mailto body", ctaProblems(injectBody(good, '<a href="mailto:a@b.c?subject=x&body=hello">m</a>')), "H-prefill");
h.trips("two primary buttons", ctaProblems(injectBody(good, '<a class="from-accent to-accent-2">a</a><a class="from-accent to-accent-2">b</a>')), "H-primary");

// ---------------------------------------------------------------- real tree
}

h.section("the built tree in site/out");
if (haveOut(h)) {
  const env = process.env;
  const files = aiModelsFiles(OUT_DIR);
  const htmlFiles = files.filter((f) => f.endsWith(".html"));
  await h.check("fail-on-zero: at least /ai-models and /ai-models/methodology were examined", () => h.assert(htmlFiles.filter((f) => f === "ai-models.html" || f === "ai-models/methodology.html").length >= 2, `examined ${htmlFiles.join(", ") || "nothing"}`));
  await h.check("render gate: the built tree matches the manifest and the environment (default: no report HTML)", () => {
    const p = treeProblems({ outDir: OUT_DIR, manifest, waves, env });
    h.assert(p.length === 0, p.join(" | ").slice(0, 900));
  });
  const reports = reportFiles(OUT_DIR).filter((f) => f.endsWith(".html"));
  h.log(`  info ${htmlFiles.length} /ai-models html page(s), ${reports.length} report page(s) in out/`);
  for (const f of htmlFiles) {
    const html = readFileSync(join(OUT_DIR, f), "utf8");
    const isReport = f.startsWith("ai-models/reports/");
    await h.check(`G6 ${f}`, () => { const p = ratingSchemaProblems(html, { requireReport: isReport }); h.assert(p.length === 0, p.join(" | ")); });
    if (isReport) {
      await h.check(`G5 ${f}`, () => { const p = bannerProblems(html); h.assert(p.length === 0, p.join(" | ")); });
      await h.check(`H ${f}`, () => { const p = ctaProblems(html); h.assert(p.length === 0, p.join(" | ")); });
    }
  }
}
h.finish();
