/**
 * model-report-html-fixtures.mjs -- synthetic built pages for the HTML gates' planted-probe controls.
 *
 * The "good" page is a minimal, valid imitation of the real report route built from a WAVE: its
 * title, description and JSON-LD come from the site's own functions (src/lib/model-report-facts.ts,
 * loaded through the ts-alias loader), so the controls prove the gates against the same strings the
 * page ships. Each negative control mutates the good page in one way and asserts the gate trips.
 */
import { importSiteModule } from "./ts-alias-loader.mjs";

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

let facts = null;
export async function siteFacts() {
  facts ??= await importSiteModule("src/lib/model-report-facts.ts");
  return facts;
}

/**
 * @param {object} wave
 * @param {{ preview?: boolean }} opts
 */
export async function goodReportHtml(wave, { preview = false } = {}) {
  const f = await siteFacts();
  const t = f.reportSeoStrings(wave);
  const url = f.reportUrl(wave.run_id);
  const sep = new Set(wave.derived.separated_subjects);
  const ids = [...wave.design.subjects].sort();
  const rangeOf = (id) => `${wave.subjects[id].pilot_composite_interval95[0].toFixed(1)} to ${wave.subjects[id].pilot_composite_interval95[1].toFixed(1)}`;
  const rows = ids
    .map((id) => `<tr><td>${sep.has(id) ? "Separated" : "Not separated"}</td><td>${id} <span>(${f.accessTierLabel(wave)})</span></td><td>${rangeOf(id)}</td><td>${sep.has(id) ? wave.subjects[id].pilot_composite.toFixed(1) : "not shown"}</td></tr>`)
    .join("");
  const ld = [
    f.reportJsonLd(wave),
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: "https://compassionbenchmark.com/" }] },
  ];
  return `<!DOCTYPE html><html lang="en"><head><meta charSet="utf-8"/>
<title>${esc(t.title)}</title>
<meta name="description" content="${esc(t.description)}"/>
<link rel="canonical" href="${url}"/>
<meta name="robots" content="index, follow"/>
<meta property="og:title" content="${esc(t.title)}"/><meta property="og:description" content="${esc(t.description)}"/><meta property="og:url" content="${url}"/>
<meta name="twitter:title" content="${esc(t.title)}"/><meta name="twitter:description" content="${esc(t.social)}"/>
${ld.map((b) => `<script type="application/ld+json">${JSON.stringify(b)}</script>`).join("\n")}
</head><body><a class="skip-link" href="#main">Skip to main content</a><nav aria-label="Main"><a href="/">Home</a></nav>
<main id="main" class="flex-1"><aside role="region" aria-label="Status of these results" class="pilot-banner"><p><strong>UNOFFICIAL PILOT.</strong> Not a Compassion Benchmark score. Not a ranking. No cross-model comparison.</p><p>Comparability: none. Run ${wave.run_id}.</p></aside>
${preview ? '<div role="note" class="pilot-preview"><strong>PREVIEW &mdash; not approved for publication.</strong> Do not deploy this build.</div>' : ""}
<article class="pilot-report"><h1>We tested the test: a first look at measuring compassion in AI models</h1>
<section><h2>Separation</h2><p>The pilot cannot say which is higher; that is not the same as equal.</p>
<figure id="fig-ranges"><figcaption><strong>Figure 1. Where each model landed, as a range. Not a ranking.</strong></figcaption>
<table><caption>Pilot range by model, in groups.</caption><thead><tr><th scope="col">Group</th><th scope="col">Model</th><th scope="col">Range (95%)</th><th scope="col">Point estimate</th></tr></thead><tbody>${rows}</tbody></table></figure>
</section></article></main><footer><a href="/pricing">Pricing</a></footer></body></html>`;
}

/** A plain index page (/ai-models) with no pilot content. */
export function plainIndexHtml(extraBody = "") {
  return `<!DOCTYPE html><html lang="en"><head><title>AI Model Compassion Benchmark</title></head><body><main id="main"><h1>How compassionate are AI models?</h1><p>The method is published. No model has an official score.</p>${extraBody}</main></body></html>`;
}

/** Insert text just before </article> or </main>. */
export function injectBody(html, fragment) {
  return html.includes("</article>") ? html.replace("</article>", `${fragment}</article>`) : html.replace("</main>", `${fragment}</main>`);
}
