/**
 * model-watch-html-fixtures.mjs -- synthetic, CLEAN pages for the AI Model Watch routes. They define the markup contract the
 * built-tree gates (model-watch-gates.mjs) hold the real pages to; test-model-watch-html.mjs plants a defect in each one.
 * Fictional providers and models only.
 */

import { INDEPENDENCE_LINE } from "./model-watch-core.mjs";
import { DISCLOSURE_SUMMARY_LABEL } from "./model-watch-gates.mjs";

export const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const ld = (obj) => `<script type="application/ld+json">${JSON.stringify(obj)}</script>`;
const SITEWIDE = [
  ld({ "@context": "https://schema.org", "@type": "ResearchOrganization", name: "Compassion Benchmark", logo: { "@type": "ImageObject", url: "https://compassionbenchmark.com/logo.png" } }),
  ld({ "@context": "https://schema.org", "@type": "WebSite", name: "Compassion Benchmark", url: "https://compassionbenchmark.com" }),
].join("");
export const breadcrumb = (...names) => ld({ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: names.map((n, i) => ({ "@type": "ListItem", position: i + 1, name: n })) });

export const INDEPENDENCE_P = `<p>${esc(INDEPENDENCE_LINE)}</p>`;

export function page(mainInner, { ldBlocks = [breadcrumb("Home", "Page")], head = "", footer = "" } = {}) {
  return `<!DOCTYPE html><html lang="en"><head><title>Fixture</title>${head}</head><body>${SITEWIDE}<main id="main" class="flex-1">${ldBlocks.join("")}${mainInner}</main>${footer}</body></html>`;
}

/** @param {{rows:object[], meta:{rowCount:number}}} catalog @param {(row:object)=>{status:string, runId?:string}} tested */
export function trackerHtml(catalog, tested = () => ({ status: "not-yet" }), { ldBlocks } = {}) {
  const n = catalog.rows.length;
  const rows = catalog.rows.map((r) => {
    const t = tested(r);
    const cell = t.status === "pilot"
      ? `<a href="/ai-models/reports/${t.runId}">Unofficial pilot report (not a score)</a>`
      : t.status === "queued" ? "Queued" : "Not yet";
    return `<tr data-row="" data-provider="${esc(r.provider)}" data-access="${esc(r.access.join("|"))}" data-licence="${esc(r.licence)}" data-status="${esc(r.status)}" data-tested="${t.status}">` +
      `<td>${esc(r.provider)}</td><td>${esc(r.name)}</td><td>${esc(r.releaseDate ?? "")}</td><td>${esc(r.status)}</td><td>${esc(r.access.join(", "))}</td><td>${esc(r.licence)}</td>` +
      `<td>${r.sources.map((s) => `<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.title)}</a>`).join(" ")}</td><td>${cell}</td></tr>`;
  }).join("");
  return page(
    `<h1>AI model tracker</h1>${INDEPENDENCE_P}<p>Models listed in the catalog: ${n}. A listing is not an evaluation, and no row carries a score.</p>` +
    `<div><button type="button">Reset filters</button><p aria-live="polite">Showing ${n} of ${n} models</p><p hidden>No models match these filters.</p></div>` +
    `<table><thead><tr><th>Provider</th><th>Model</th><th>Released</th><th>Status</th><th>Access</th><th>Licence</th><th>Sources</th><th>Tested by us</th></tr></thead><tbody>${rows}</tbody></table>`,
    { ldBlocks: ldBlocks ?? [breadcrumb("Home", "AI Models", "Tracker")] },
  );
}

export function watchListHtml(editions) {
  const items = [...editions].sort((a, b) => (a.date < b.date ? 1 : -1)).map((e) => `<li><a href="/ai-models/watch/${e.date}">${esc(e.title)}</a><p>${esc(e.lead)}</p></li>`).join("");
  return page(`<h1>Weekly Watch</h1>${INDEPENDENCE_P}${editions.length ? `<ul>${items}</ul>` : "<p>No edition has been published yet. The first edition is in preparation.</p>"}`, { ldBlocks: [breadcrumb("Home", "AI Models", "Watch")] });
}

export function editionHtml(e) {
  const rel = e.releases.map((r) => `<li><strong>${esc(r.modelName ?? r.provider)}</strong> (${esc(r.provider)}, ${esc(r.date)}): ${esc(r.summary)} ${r.sources.map((s) => `<a href="${esc(s.url)}">${esc(s.title)}</a>`).join(" ")}</li>`).join("");
  const disc = e.disclosures.map((d) => `<li><p>${esc(DISCLOSURE_SUMMARY_LABEL)}</p><p>${esc(d.safetyNote)}</p>${d.sources.map((s) => `<a href="${esc(s.url)}">${esc(s.title)}</a>`).join(" ")}</li>`).join("");
  const meas = e.measured.reports.map((r) => `<li><a href="${r.href}">${esc(r.runId)}</a></li>`).join("");
  const src = e.sources.map((s) => `<li id="src-${s.n}"><a href="${esc(s.url)}">${esc(s.title)}</a></li>`).join("");
  const corr = e.corrections.length ? `<ul>${e.corrections.map((c) => `<li>${esc(c.date)}: ${esc(c.text)}</li>`).join("")}</ul>` : "<p>No corrections have been made.</p>";
  return page(
    `<h1>${esc(e.title)}</h1>${INDEPENDENCE_P}<p>${esc(e.lead)}</p>` +
    `<h2>Window and coverage</h2><p>${esc(e.window.from)} to ${esc(e.window.to)}</p><p>${esc(e.coverageStatement)}</p>` +
    `<h2>New releases</h2><ul>${rel}</ul>` +
    `<h2>Safety and welfare disclosures</h2><ul>${disc}</ul>` +
    `<h2>What we measured</h2><p>${esc(e.measured.note)}</p><ul>${meas}</ul>` +
    `<h2>Queue status</h2><p>${e.queue.queued} queued, ${e.queue.measured} measured, ${e.queue.skipped} skipped.</p>` +
    `<h2>Corrections and sources</h2><h3>Corrections</h3>${corr}<h3>Sources</h3><ol>${src}</ol>` +
    `<p>This edition does not recommend any model, including for use in a crisis.</p>`,
    { ldBlocks: [breadcrumb("Home", "AI Models", "Watch", e.date)] },
  );
}

export function leaderboardsHtml({ itemCount }) {
  return page(
    `<h1>Why no model ranking</h1>${INDEPENDENCE_P}<p>No model ranking is published.</p>` +
    `<p>The live compassion leaderboard is the organisational index at <a href="/ai-labs">AI Labs</a>. That index does not describe model behaviour.</p>` +
    `<p>The public item bank holds ${itemCount} items, so cross-model comparison on it is not valid.</p>` +
    `<p>Agent-tier pilots show "not yet" in the tracker because their subjects carry no build tag.</p>`,
    { ldBlocks: [breadcrumb("Home", "AI Models", "Leaderboards")] },
  );
}

/** /ai-models/cycle: summary, running-today and planned-conditional blocks, a loop table with a Status column, and the no-ranking sentence. */
export function cycleHtml({ ldBlocks } = {}) {
  const rows = [["Releases to test queue", "Done by hand today. Automation planned"], ["Tests to the tracker", "Running today"], ["Results to the test items", "Planned"]]
    .map(([a, s]) => `<tr><th scope="row">${a}</th><td>An output.</td><td>An input.</td><td>${s}</td></tr>`).join("");
  return page(
    `<h1>How we analyse AI models every week</h1>${INDEPENDENCE_P}<p>No official model ranking, band or score is published.</p>` +
    `<h2>What we do every week</h2><p>Running today: a sourced weekly list of releases.</p>` +
    `<p>Planned, conditional: a weekly test run of open-weight models. This has not started. Pilot results are unofficial ranges.</p>` +
    `<h2>How each week makes the next one better</h2>` +
    `<table><caption>Loop</caption><thead><tr><th scope="col">Link</th><th scope="col">This week output</th><th scope="col">Next week input</th><th scope="col">Status</th></tr></thead><tbody>${rows}</tbody></table>` +
    `<h2>What we publish, and what we do not</h2><p>Judges today are from one family (Alpha 1 is not rated here). We do not publish a ranking of any model.</p>`,
    { ldBlocks: ldBlocks ?? [breadcrumb("Home", "AI Models", "Cycle")] },
  );
}

export function insightsIndexHtml(posts) {
  const items = posts.map((p) => `<li><a href="/insights/${p.slug}">${esc(p.title)}</a><p>${esc(p.dek)}</p></li>`).join("");
  return page(`<h1>Insights</h1>${INDEPENDENCE_P}<ul>${items}</ul>`, { ldBlocks: [breadcrumb("Home", "Insights")] });
}

/** `post` is the compiled post JSON; html has its tokens substituted by the caller. */
export function insightPostHtml(post, { gumroad = "https://compassionbenchmark.gumroad.com/l/eagls", bodyHtml = post.html } = {}) {
  const lab = post.audience === "ai-labs" || post.audience === "both";
  const blog = {
    "@context": "https://schema.org", "@type": "BlogPosting", headline: post.title, datePublished: post.date, dateModified: post.date,
    author: { "@type": "Organization", name: "Compassion Benchmark research" },
    publisher: { "@type": "Organization", name: "Compassion Benchmark", logo: { "@type": "ImageObject", url: "https://compassionbenchmark.com/logo.png" } },
    image: { "@type": "ImageObject", url: "https://compassionbenchmark.com/og/insights.png" },
  };
  const ledger = post.claimLedger.map((c) => `<li>${esc(c.sentence)} ${c.citations.map((n) => `<a href="#src-${n}">[${n}]</a>`).join("")}</li>`).join("");
  const src = post.sources.map((s) => `<li id="src-${s.n}">${esc(s.title)}, ${esc(s.publisher)}, ${esc(s.date)}. <a href="${esc(s.url)}">${esc(s.url)}</a></li>`).join("");
  const corr = post.corrections.length ? `<ul>${post.corrections.map((c) => `<li>${esc(c.date)}: ${esc(c.text)}</li>`).join("")}</ul>` : "<p>No corrections have been made.</p>";
  const cta = lab
    ? `<p><a href="/ai-labs">See the AI Labs Index</a> or <a href="${esc(gumroad)}">buy the AI Labs Index report</a>.</p>${INDEPENDENCE_P}`
    : `<p><a href="/ai-evaluation-suite">Run the self-check</a>.</p>${INDEPENDENCE_P}`;
  return page(
    `<article data-pagefind-body><h1>${esc(post.title)}</h1><p>${esc(post.date)} by Compassion Benchmark research</p>${bodyHtml}` +
    `<h2>Claim ledger</h2><ul>${ledger}</ul><h2>Sources</h2><ol>${src}</ol><h2>Corrections</h2>${corr}${cta}</article>`,
    { ldBlocks: [ld(blog), breadcrumb("Home", "Insights", post.title)] },
  );
}

export function sitemapXml({ editions, posts, extra = [] }) {
  const base = "https://compassionbenchmark.com";
  const paths = ["/ai-models/tracker", "/ai-models/watch", "/ai-models/leaderboards", "/ai-models/cycle", "/insights", ...editions.map((e) => `/ai-models/watch/${e.date}`), ...posts.map((p) => `/insights/${p.slug}`), ...extra];
  return `<?xml version="1.0"?><urlset>${paths.map((p) => `<url><loc>${base}${p}</loc></url>`).join("")}</urlset>`;
}
