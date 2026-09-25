#!/usr/bin/env node
/**
 * check-publication-drift.mjs — does the live site actually serve what this repo has published?
 *
 * WHY THIS EXISTS
 *   Twice now, committed daily briefings have been invisible to readers for days and nothing
 *   noticed:
 *     · 2026-09-21 (It. 27b) — /updates/2026-09-18, 09-20 and 09-21 all 301 → /404.
 *     · 2026-09-24 (It. 35)  — /updates/2026-09-21, 09-22 and 09-24 all 301 → /404, found by
 *       hand while taking a production baseline for an unrelated loop.
 *   Both were found by a human looking. The institution publishes daily; publishing into a
 *   directory nobody serves is not publishing.
 *
 * WHY IT IS NOT THE EXISTING FRESHNESS ASSERTION
 *   `.github/workflows/deploy.yml`'s verify job already compares `manifest.latest` against
 *   `feed.json`'s newest item. That is a good check and this does not replace it. Two
 *   differences:
 *     1. It runs only when a deploy runs (`workflow_dispatch`). The failure mode here is
 *        *no deploy at all*, which it cannot see by construction.
 *     2. It compares two published artifacts to each other. A feed can list a briefing whose
 *        route 404s — that is DC-05's link-integrity variant, and it is exactly what It. 20
 *        found on the ranking pages. This asks the routes.
 *
 * THE CONTROL THAT MAKES A ZERO MEANINGFUL (rule V8)
 *   A network check that reports "nothing is live" when the host is simply unreachable is worse
 *   than no check. Before concluding anything, this fetches a control URL that must be live.
 *   If the control fails, the run exits 2 INDETERMINATE — never 0, never "drift".
 *
 * USAGE
 *   node research/scripts/check-publication-drift.mjs                 # report, exit 0
 *   node research/scripts/check-publication-drift.mjs --fail-on-drift # exit 1 if drift
 *   node research/scripts/check-publication-drift.mjs --base http://localhost:3000
 *
 * Exit codes: 0 = no drift (or reporting mode) · 1 = drift, with --fail-on-drift
 *             2 = INDETERMINATE (control failed, or the repo side could not be read)
 */

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const REPO = path.resolve(new URL('../..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const DAILY_DIR = path.join(REPO, 'site/src/data/updates/daily');
const MANIFEST = path.join(REPO, 'site/src/data/updates/manifest.json');

const args = process.argv.slice(2);
const FAIL_ON_DRIFT = args.includes('--fail-on-drift');
const baseArg = args.indexOf('--base');
const BASE = (baseArg >= 0 ? args[baseArg + 1] : 'https://compassionbenchmark.com').replace(/\/$/, '');

/** How far back to check. Older briefings are not re-verified on every run. */
const WINDOW_DAYS = 21;
const TIMEOUT_MS = 20000;

const say = (s) => console.log(s);

async function head(url) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), TIMEOUT_MS);
  try {
    // `redirect: manual` so a 301 to /404 is visible as a 301, not laundered into a 200.
    const res = await fetch(url, { method: 'GET', redirect: 'manual', signal: ctl.signal });
    return { status: res.status, location: res.headers.get('location') || '' };
  } catch (err) {
    return { status: 0, error: err.name === 'AbortError' ? `timeout after ${TIMEOUT_MS}ms` : err.message };
  } finally {
    clearTimeout(t);
  }
}

/** A route counts as live only on a 2xx. A 301 to /404 is the exact defect being hunted. */
const isLive = (r) => r.status >= 200 && r.status < 300;
const describe = (r) =>
  r.status === 0 ? `unreachable (${r.error})` : r.location ? `${r.status} → ${r.location}` : String(r.status);

// ---------------------------------------------------------------- repo side
if (!existsSync(DAILY_DIR) || !existsSync(MANIFEST)) {
  say(`INDETERMINATE: cannot read the repo side (${DAILY_DIR} or ${MANIFEST} missing).`);
  process.exit(2);
}

const committedDates = readdirSync(DAILY_DIR)
  .filter((f) => /^\d{4}-\d{2}-\d{2}\.json$/.test(f))
  .map((f) => f.slice(0, 10))
  .sort()
  .reverse();

if (committedDates.length === 0) {
  say('INDETERMINATE: no committed briefing files found. A zero here means the scan is broken, not that the repo is empty.');
  process.exit(2);
}

const manifestLatest = JSON.parse(readFileSync(MANIFEST, 'utf8')).latest || null;
const cutoff = new Date(Date.now() - WINDOW_DAYS * 86400000).toISOString().slice(0, 10);
const inWindow = committedDates.filter((d) => d >= cutoff);

say(`Publication drift check — ${BASE}`);
say(`  committed briefings: ${committedDates.length} total, ${inWindow.length} within ${WINDOW_DAYS} days`);
say(`  manifest.latest:     ${manifestLatest ?? '(absent)'}`);
if (manifestLatest && manifestLatest !== committedDates[0]) {
  say(`  NOTE: manifest.latest (${manifestLatest}) is not the newest committed file (${committedDates[0]}).`);
}

// Newest commit that touched the briefing data — the "expected since" date.
let dataCommit = null;
try {
  const out = execFileSync('git', ['log', '-1', '--format=%h %cI', '--', 'site/src/data/updates/daily'], {
    cwd: REPO,
    encoding: 'utf8',
  }).trim();
  if (out) dataCommit = out;
} catch {
  /* git is optional here; absence is reported, not fatal */
}
say(`  newest commit touching briefing data: ${dataCommit || '(git unavailable)'}`);

// ---------------------------------------------------------------- the control
say('\nControl (rule V8 — a zero means nothing until the same check has found something)');
const control = await head(`${BASE}/updates`);
if (!isLive(control)) {
  say(`  INDETERMINATE: control ${BASE}/updates returned ${describe(control)}.`);
  say('  The host is unreachable or broken, so "briefing not live" would be unfounded. Exiting 2.');
  process.exit(2);
}
say(`  ok: ${BASE}/updates → ${control.status}`);

// ---------------------------------------------------------------- build manifest
say('\nBuild manifest');
let buildDate = null;
let buildSha = null;
try {
  const res = await fetch(`${BASE}/build-manifest.json`, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (res.ok) {
    const bm = await res.json();
    buildDate = bm.buildDate || null;
    buildSha = bm.git?.sha ?? null;
    say(`  built ${buildDate} · sha ${buildSha ?? 'null'} (source: ${bm.git?.source ?? 'unknown'})`);
    if (buildSha === null) {
      say('  WARNING (BM-2): the live build cannot name its own commit, so no freshness claim about it is');
      say('           verifiable. Cause is a bare `docker compose build` — deploy via Actions or ./deploy.sh.');
    }
  } else {
    say(`  build-manifest.json → ${res.status} (not fatal; drift is still measured from routes)`);
  }
} catch (err) {
  say(`  build-manifest.json unreadable: ${err.message} (not fatal)`);
}

// ---------------------------------------------------------------- the routes
say(`\nRoutes (${inWindow.length} briefings in the last ${WINDOW_DAYS} days)`);
const results = [];
for (const date of inWindow) {
  const r = await head(`${BASE}/updates/${date}`);
  results.push({ date, ...r });
  say(`  ${isLive(r) ? 'live   ' : 'MISSING'} /updates/${date} → ${describe(r)}`);
}

const missing = results.filter((r) => !isLive(r));
const unreachable = results.filter((r) => r.status === 0);

// An unreachable route after a live control is a different problem from a 404: report it, but
// do not let it masquerade as publication drift.
if (unreachable.length) {
  say(`\nINDETERMINATE: ${unreachable.length} route(s) were unreachable although the control passed.`);
  say('Transient network failure, not evidence about what is published. Exiting 2.');
  process.exit(2);
}

// ---------------------------------------------------------------- verdict
say('\nVerdict');
if (missing.length === 0) {
  say(`  NO DRIFT — all ${results.length} committed briefings in the window are served.`);
  process.exit(0);
}

const oldest = missing[missing.length - 1].date;
const lagDays = Math.round((Date.now() - Date.parse(`${oldest}T00:00:00Z`)) / 86400000);
say(`  DRIFT — ${missing.length} committed briefing(s) are not served: ${missing.map((m) => m.date).join(', ')}`);
say(`  Oldest invisible briefing is ${oldest} (${lagDays} day(s) ago).`);
say('  Readers cannot see this content. Remedy: deploy (Actions → Deploy to VPS → Run workflow, or ./deploy.sh).');
say('  If a deploy has already run, the container is serving a cached layer: docker compose build --no-cache web.');

if (FAIL_ON_DRIFT) {
  say('\n  --fail-on-drift set, so this is a failure.');
  process.exit(1);
}
say('\n  Reporting mode (no --fail-on-drift), so this exits 0. Drift is stated, not enforced.');
process.exit(0);
