#!/usr/bin/env node
/**
 * smoke-model-dashboard.mjs -- the dashboard in a REAL browser (headless Chromium via Playwright), against the built site/out tree.
 * PRD T2 (HTML gates on the default view and fixed hash-state views), T5 (no-JS view), T11 (keyboard path, focus ring, target size,
 * reflow; axe-core is not a dependency, so the structural a11y rules live in test-model-dashboard.mjs) and the island's behaviour.
 *
 * Not part of `npm run test` or the build chain (it needs `npm run build` first and an installed Chromium):
 *     npm run build && node scripts/smoke-model-dashboard.mjs
 * Exit code 1 on any failure; prints SKIP and exits 0 when out/ has no dashboard or Chromium is not installed.
 */
import { createServer } from "node:http";
import { existsSync, readFileSync, statSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { harness, OUT_DIR, WAVES_DIR } from "./lib/html-gate-harness.mjs";
import { leakProblems, loadWaves } from "./lib/model-report-html-gates.mjs";
import { dashboardLexiconProblems } from "./lib/model-dashboard-html-gates.mjs";
import { machineTextProblems } from "./lib/model-machine-leak.mjs";
import { projectWavePublic } from "./lib/model-benchmark-public.mjs";
import * as core from "./lib/model-dashboard-core.mjs";

const h = harness("smoke-model-dashboard");
if (!existsSync(join(OUT_DIR, "ai-models", "dashboard.html"))) {
  console.log("SKIP: out/ai-models/dashboard.html not found (build first, with at least one rendering wave).");
  process.exit(0);
}
let chromium;
try { ({ chromium } = await import("@playwright/test")); } catch { console.log("SKIP: @playwright/test is not installed."); process.exit(0); }

const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".csv": "text/csv", ".txt": "text/plain", ".svg": "image/svg+xml", ".png": "image/png", ".woff2": "font/woff2" };
const server = createServer((req, res) => {
  const url = decodeURIComponent((req.url ?? "/").split("?")[0]);
  const rel = normalize(url).replace(/^[/\\]+/, "");
  const cands = [join(OUT_DIR, rel), join(OUT_DIR, `${rel}.html`), join(OUT_DIR, rel, "index.html")];
  const f = cands.find((c) => existsSync(c) && statSync(c).isFile());
  if (!f) { res.writeHead(404); res.end("not found"); return; }
  res.writeHead(200, { "content-type": TYPES[extname(f)] ?? "application/octet-stream" });
  res.end(readFileSync(f));
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const base = `http://127.0.0.1:${server.address().port}`;

let browser;
try { browser = await chromium.launch(); } catch (e) { console.log(`SKIP: Chromium could not launch (${String(e.message).split("\n")[0]})`); server.close(); process.exit(0); }

const { waves } = loadWaves(WAVES_DIR);
const latest = [...waves].filter((w) => existsSync(join(OUT_DIR, "ai-models", "dashboard", `${w.run_id}.html`))).sort((a, b) => (a.report_date < b.report_date ? 1 : -1))[0];
const pub = projectWavePublic(latest);
const builds = core.buildIds(pub);
const dims = Object.keys(Object.values(pub.subjects)[0].dimension_intervals95);
const ctx = { builds, dims, panels: core.PANEL_CODES };

async function open(context, hash = "") {
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  page.on("console", (m) => { if (m.type() === "error" && !/^Failed to load resource/.test(m.text())) errors.push(`console.error: ${m.text()} ${m.location().url ?? ""}`); });
  await page.goto(`${base}/ai-models/dashboard${hash}`, { waitUntil: "load" });
  return { page, errors };
}
const shown = (page, sel) => page.evaluate((s) => Array.from(document.querySelectorAll(s)).filter((e) => !e.closest("[hidden]") && !e.hasAttribute("hidden")).length, sel);

h.section(`default view, JavaScript on (${latest.run_id})`);
const ctxJs = await browser.newContext({ viewport: { width: 1280, height: 900 }, permissions: ["clipboard-read", "clipboard-write"] });
{
  const { page, errors } = await open(ctxJs);
  await page.waitForSelector(".dash-controls:not([hidden])");
  await h.check("the control bar appears after hydration and the live line states the default view", async () => {
    const live = await page.textContent("#dash-live");
    h.assert(new RegExp(`Showing ${builds.length} of ${builds.length} builds, ${dims.length} of ${dims.length} dimensions`).test(live ?? ""), `live: ${live}`);
    h.assert((await page.getAttribute(".dash", "data-customised")) === "0", "customised at default");
  });
  await h.check("no console error and no hydration error", () => h.assert(errors.length === 0, errors.join(" | ")));
  await h.check("T2: the hydrated default view passes the leak gate and the lexicon", async () => {
    const html = await page.content();
    const p = [...leakProblems({ html, wave: latest, kind: "dashboard" }), ...dashboardLexiconProblems(html, latest)];
    h.assert(p.length === 0, p.slice(0, 4).join(" | "));
  });
  await h.check("every panel is visible by default; the exploratory block is closed", async () => {
    h.assert((await shown(page, "section[data-panel]")) === core.PANEL_CODES.length, "panels");
    h.assert(!(await page.evaluate(() => document.querySelector("details[data-exploratory]").open)), "exploratory open");
  });

  h.section("interaction");
  await h.check("deselecting a build hides its rows in every panel, keeps the group header, shows the subset note, and writes the hash", async () => {
    await page.click(".dash-controls details.dash-menu >> nth=0 >> summary");
    const box = page.locator(".dash-controls details.dash-menu").nth(0).locator("label.dash-check").filter({ hasText: builds[0] }).locator("input");
    await box.uncheck();
    await page.waitForTimeout(400);
    const hash = await page.evaluate(() => location.hash);
    h.assert(hash.startsWith("#m=") && !hash.split("=")[1].split("&")[0].includes(builds[0]), `hash ${hash}`);
    const hiddenRows = await page.evaluate((b) => Array.from(document.querySelectorAll(`.dash-row[data-subjects="${b}"]`)).every((e) => e.hasAttribute("hidden")), builds[0]);
    h.assert(hiddenRows, "rows of the deselected build are still shown");
    h.assert((await page.getAttribute(".dash", "data-customised")) === "1", "customised banner");
    h.assert(/Customised view/.test(await page.textContent(".dash-custom")), "banner text");
    const live = await page.textContent("#dash-live");
    h.assert(new RegExp(`Showing ${builds.length - 1} of ${builds.length} builds`).test(live ?? ""), `live: ${live}`);
    const headsKept = await page.evaluate(() => Array.from(document.querySelectorAll(".dash-grouphead")).every((e) => !e.hasAttribute("hidden")));
    h.assert(headsKept, "a group header was hidden");
    const nofn = await page.evaluate(() => document.querySelector('[data-nofn-k="models"]').textContent);
    h.assert(nofn === String(builds.length - 1), `n of N line: ${nofn}`);
  });
  await h.check("Reset view restores the default, clears the hash, and focus stays on the Reset button", async () => {
    await page.getByRole("button", { name: "Reset view" }).click();
    h.assert((await page.evaluate(() => location.hash)) === "", "hash after reset");
    h.assert((await page.getAttribute(".dash", "data-customised")) === "0", "customised after reset");
    const active = await page.evaluate(() => document.activeElement?.textContent?.trim());
    h.assert(active === "Reset view", `focus on "${active}"`);
  });
  await h.check("Copy link puts the view's URL on the clipboard", async () => {
    await page.getByRole("button", { name: "Copy link to this view" }).click();
    await page.waitForTimeout(200);
    const clip = await page.evaluate(() => navigator.clipboard.readText());
    h.assert(clip.includes("/ai-models/dashboard"), clip);
  });
  await h.check("hiding a panel shows its stub with a Show button; Provenance cannot be hidden while figures show", async () => {
    await page.locator('[data-dash-hide="len"]').click();
    h.assert((await page.locator('[data-panel="len"]').getAttribute("hidden")) !== null, "panel not hidden");
    h.assert((await page.locator('[data-panel-stub="len"]').getAttribute("hidden")) === null, "stub not shown");
    await page.locator('[data-dash-show="len"]').click();
    await page.locator('[data-dash-hide="prov"]').click();
    h.assert((await page.locator('[data-panel="prov"]').getAttribute("hidden")) === null, "provenance was hidden");
  });
  await h.check("Chart / Table: Table hides the charts and opens every table; the hash records it", async () => {
    await page.getByRole("button", { name: "Table", exact: true }).click();
    h.assert(/v=table/.test(await page.evaluate(() => location.hash)), "hash");
    h.assert(await page.evaluate(() => getComputedStyle(document.querySelector(".dash-chart")).display === "none"), "chart still displayed");
    h.assert(await page.evaluate(() => Array.from(document.querySelectorAll("details.dash-table")).every((d) => d.open)), "a table is closed");
    await page.getByRole("button", { name: "Reset view" }).click();
  });
  await h.check("exploratory toggle opens the exploratory block and writes x=1", async () => {
    await page.getByLabel(/Show exploratory pairwise comparisons/).check();
    h.assert(await page.evaluate(() => document.querySelector("details[data-exploratory]").open), "closed");
    h.assert(/x=1/.test(await page.evaluate(() => location.hash)), "hash");
    await page.getByRole("button", { name: "Reset view" }).click();
  });
  await h.check("the current-view CSV download holds only the selected builds and passes the withheld checks", async () => {
    await page.goto(`${base}/ai-models/dashboard#m=${builds.slice(0, 2).join(",")}&d=${dims[0]}`);
    await page.waitForSelector(".dash-controls:not([hidden])");
    const [dl] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Current view, CSV" }).click()]);
    const csv = readFileSync(await dl.path(), "utf8");
    h.assert(/^# Unofficial pilot/.test(csv) && /view: #m=/.test(csv), "label or view line missing");
    const rowsOut = csv.split("\n").slice(5).filter(Boolean);
    h.assert(rowsOut.every((l) => builds.slice(0, 2).some((b) => l.includes(`,${b},`))), "a row of a deselected build");
    const p = machineTextProblems({ text: csv, wave: latest, label: "view CSV", owner: latest });
    h.assert(p.length === 0, p.join(" | "));
    h.assert(!rowsOut.some((l) => l.includes(",dimension,") && !l.includes(`,${dims[0]},`)), "a dimension that was deselected");
  });
  await page.close();
}

h.section("T2: fixed hash-state views, hydrated, held to the leak gate and the lexicon");
{
  const views = [
    `#m=${builds[0]}`,
    `#m=${builds.slice(0, 2).join(",")}&d=${dims.slice(0, 2).join(",")}`,
    `#p=comp,prov&v=table`,
    `#x=1&v=table`,
    `#m=${builds.slice(1).join(",")}&d=${dims[dims.length - 1]}&p=comp,dims,diff,prov&x=1`,
  ];
  for (const v of views) {
    const { page, errors } = await open(ctxJs, v);
    await page.waitForSelector(".dash-controls:not([hidden])");
    await h.check(`view ${v}: no error, state restored from the hash, leak gate and lexicon pass`, async () => {
      h.assert(errors.length === 0, errors.join(" | "));
      const parsed = core.parseHash(v, ctx);
      h.assert(parsed.kind === "state" && parsed.notices.length === 0, "fixture hash is not valid");
      const expectHidden = parsed.state.models.length;
      const visibleRows = await page.evaluate(() => Array.from(document.querySelectorAll(".dash-row[data-group]")).filter((e) => !e.hasAttribute("hidden")).map((e) => e.getAttribute("data-subjects")));
      for (const b of new Set(visibleRows)) h.assert(parsed.state.models.includes(b) || visibleRows.length === 0, `build ${b} is shown but not selected (${expectHidden} selected)`);
      const html = await page.content();
      const p = [...leakProblems({ html, wave: latest, kind: "dashboard" }), ...dashboardLexiconProblems(html, latest)];
      h.assert(p.length === 0, p.slice(0, 4).join(" | "));
    });
    await page.close();
  }
  const bad = [["#m=nope", /models/], ["#sort=score&m=" + builds[0], /Sorting and custom weighting are not offered/], ["#m=%E0%A4%A", /could not be read/], ["#v=sideways", /view/]];
  for (const [hash, re] of bad) {
    const { page } = await open(ctxJs, hash);
    await page.waitForSelector(".dash-controls:not([hidden])");
    await h.check(`malformed link ${hash}: a visible notice and the default (or corrected) view`, async () => {
      const t = await page.textContent(".dash-notices");
      h.assert(re.test(t ?? ""), `notice: ${t}`);
    });
    await page.close();
  }
  const { page: jump } = await open(ctxJs, "#panel-comp");
  await jump.waitForSelector(".dash-controls:not([hidden])");
  await h.check("a bare #panel-comp is a jump link: no notice, default state", async () => {
    h.assert((await jump.locator(".dash-notices").count()) === 0 && (await jump.getAttribute(".dash", "data-customised")) === "0", "state changed by a jump link");
  });
  await jump.close();
}

h.section("keyboard, focus ring, target size, reflow");
{
  const { page } = await open(ctxJs);
  await page.waitForSelector(".dash-controls:not([hidden])");
  await h.check("keyboard: Tab reaches the control bar; the focus ring is at least 2px; Space toggles a checkbox; Escape closes a menu and returns focus", async () => {
    await page.locator(".dash-menu > summary").first().focus();
    const ring = await page.evaluate(() => { const cs = getComputedStyle(document.activeElement); return { w: parseFloat(cs.outlineWidth), s: cs.outlineStyle }; });
    h.assert(ring.w >= 2 && ring.s !== "none", `outline ${ring.w} ${ring.s}`);
    await page.keyboard.press("Enter");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Space");
    await page.waitForTimeout(400);
    h.assert(/m=/.test(await page.evaluate(() => location.hash)), "Space did not toggle");
    await page.keyboard.press("Escape");
    h.assert(await page.evaluate(() => document.activeElement?.tagName === "SUMMARY"), "focus not returned to the summary");
    await page.getByRole("button", { name: "Reset view" }).click();
  });
  await h.check("target size: every button, checkbox label and summary in the control bar is at least 24 by 24 CSS px (44 on touch widths)", async () => {
    await page.locator(".dash-menu > summary").evaluateAll((els) => els.forEach((e) => e.parentElement.setAttribute("open", "")));
    const small = await page.evaluate(() => Array.from(document.querySelectorAll(".dash-controls button, .dash-controls summary, .dash-controls label.dash-check, .dash-controls a.dash-btn")).map((e) => { const r = e.getBoundingClientRect(); return { t: (e.textContent ?? "").trim().slice(0, 20), w: r.width, h: r.height }; }).filter((b) => b.w < 24 || b.h < 24));
    h.assert(small.length === 0, JSON.stringify(small));
  });
  await page.close();
  const m = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true });
  const { page: mp } = await open(m);
  await mp.waitForSelector(".dash-controls:not([hidden])");
  await h.check("390px: the tables replace the charts, the duty-of-care note is within two screens, targets are 44px or more, nothing scrolls sideways", async () => {
    h.assert(await mp.evaluate(() => getComputedStyle(document.querySelector(".dash-chart")).display === "none"), "chart shown at 390px");
    const y = await mp.evaluate(() => document.querySelector("[data-duty-of-care]").getBoundingClientRect().top + window.scrollY);
    h.assert(y <= 2 * 844, `duty note at ${Math.round(y)}px (two screens = ${2 * 844})`);
    const tall = await mp.evaluate(() => Array.from(document.querySelectorAll(".dash-controls .dash-btn, .dash-controls label.dash-check")).filter((e) => e.offsetParent).map((e) => e.getBoundingClientRect().height).filter((v) => v < 43.5).length);
    h.assert(tall === 0, `${tall} control(s) shorter than 44px`);
    const sw = await mp.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    h.assert(sw <= 1, `page scrolls sideways by ${sw}px`);
  });
  await mp.close();
  const n = await browser.newContext({ viewport: { width: 320, height: 800 } });
  const { page: np } = await open(n);
  await h.check("320px reflow: the page does not scroll sideways (wide tables scroll inside their labelled regions)", async () => {
    const sw = await np.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    h.assert(sw <= 1, `scrolls sideways by ${sw}px`);
  });
  await np.close();
}

h.section("T5: JavaScript off");
{
  const ctxNo = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1280, height: 900 } });
  const page = await ctxNo.newPage();
  await page.goto(`${base}/ai-models/dashboard`);
  await h.check("the full wave is readable: every panel, every row, every table; the controls are absent and the one explanatory line shows", async () => {
    h.assert((await shown(page, "section[data-panel]")) === core.PANEL_CODES.length, "a panel is not shown");
    h.assert((await page.locator(".dash-controls:visible").count()) === 0, "inert controls are visible");
    h.assert(/need JavaScript/.test(await page.innerText("body")), "no explanation line");
    const rows = await page.evaluate(() => document.querySelectorAll(".dash-row[data-group]").length);
    h.assert(rows >= builds.length, `${rows} rows`);
    h.assert(await page.evaluate(() => Array.from(document.querySelectorAll("details.dash-table")).every((d) => d.open)), "a table is closed");
    h.assert((await page.locator('a[download][href$=".csv"]').count()) >= 1, "no static download link");
  });
  await h.check("T5: the no-JavaScript HTML passes the leak gate and the lexicon", async () => {
    const html = await page.content();
    const p = [...leakProblems({ html, wave: latest, kind: "dashboard" }), ...dashboardLexiconProblems(html, latest)];
    h.assert(p.length === 0, p.slice(0, 4).join(" | "));
  });
  await ctxNo.close();
}

h.section("print");
{
  const { page } = await open(ctxJs);
  await page.emulateMedia({ media: "print" });
  await h.check("print: the controls are gone, the figure label stays in every figure, and the page is light", async () => {
    h.assert(await page.evaluate(() => getComputedStyle(document.querySelector(".dash-controls")).display === "none"), "controls printed");
    h.assert((await page.locator("figure.dash-fig").count()) > 0, "no figure");
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    h.assert(/255, 255, 255|rgba\(0, 0, 0, 0\)/.test(bg), `body background ${bg}`);
  });
  await page.close();
}

await browser.close();
server.close();
h.finish();
