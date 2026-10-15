#!/usr/bin/env node
/**
 * test-briefing-move-claims.mjs -- BRF-MOVE (defect class DC-03, rendered-text route).
 *
 * The DC-03 lint (lint-daily-briefings.mjs) checks briefing JSON. This test checks the RENDERED HTML: a daily
 * briefing must not say "largest move <entity>" (or "largest: <entity>") or put an entity on a score "trajectory"
 * when that entity's change was only PROPOSED and never applied to the published index.
 *
 * Applied vs unapplied uses the same source of truth as the DC-03 lint (scripts/lib/lint-rules.mjs,
 * scanUnappliedScoreMovement): pipeline.scoreChangesApplied of 0 means nothing was applied (absent = legacy briefing, row status decides); otherwise an
 * entity is applied only if it is in appliedChanges or carries status "applied". Everything else is a proposal.
 *
 * Modes:
 *   (default)                     fixtures: planted probes must FAIL, must-pass fixtures (seeded from real briefings)
 *                                 must PASS. Needs no build. Used by `npm run test:briefing-move-claims`.
 *   --tree-only --require-out     scan site/out/updates/**.html against src/data/updates/daily/*.json. Used by build.
 */
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const SITE = join(dirname(fileURLToPath(import.meta.url)), "..");
const DAILY_DIR = join(SITE, "src", "data", "updates", "daily");
const LATEST_FILE = join(SITE, "src", "data", "updates", "latest.json");
const UPDATES_OUT = join(SITE, "out", "updates");

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Names of entities in a briefing whose score change was NOT applied to the published index. */
export function unappliedEntityNames(data) {
  const n = data?.pipeline?.scoreChangesApplied;
  // Explicit 0 = nothing applied. Legacy 2026-05/06 briefings omit the counter and mark applied rows by status.
  const anyApplied = n !== 0 && (n === undefined || n === null || (typeof n === "number" && n > 0));
  const list = (k) => (Array.isArray(data?.[k]) ? data[k] : []);
  const applied = new Set();
  if (anyApplied) {
    for (const c of list("appliedChanges")) if (c?.slug) applied.add(c.slug);
    for (const c of [...list("recentAssessments"), ...list("topSignals")]) {
      if (c?.slug && c.status === "applied") applied.add(c.slug);
    }
  }
  const names = new Set();
  for (const c of [...list("recentAssessments"), ...list("pendingReview"), ...list("scoreChanges"), ...list("topSignals")]) {
    if (typeof c?.entity === "string" && c.entity && !applied.has(c.slug)) names.add(c.entity);
  }
  return [...names];
}

/** Visible text units: text nodes plus aria-label/title attribute values. */
function textUnits(html) {
  const units = [];
  for (const m of html.matchAll(/\b(?:aria-label|title)="([^"]*)"/g)) units.push(m[1]);
  units.push(...html.replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, " ").split(/<[^>]*>/));
  return units
    .map((u) => u.replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

/** Returns [{ claim, entity, text }] for every move/trajectory claim naming an unapplied entity. */
export function findMoveClaimViolations(html, unappliedNames) {
  const out = [];
  for (const unit of textUnits(html)) {
    for (const name of unappliedNames) {
      // The sparkline labels entities by display name or by slug ("valencia score trajectory"), so match both.
      const slugForm = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      const e = [name, slugForm].map(esc).join("|");
      const patterns = [
        ["largest move", new RegExp(String.raw`largest move\s+(?:${e})(?![\w])`, "i")],
        ["largest:", new RegExp(String.raw`largest:\s*(?:${e})(?![\w])`, "i")],
        // Only the component-generated labels, not editorial prose that happens to use the word "trajectory".
        ["trajectory", new RegExp(String.raw`(?<![\w-])(?:${e})\s+score trajectory|score trajectory\s*(?:for|[—–-])\s*(?:${e})(?![\w-])`, "i")],
      ];
      for (const [claim, re] of patterns) {
        if (re.test(unit)) out.push({ claim, entity: name, text: unit.slice(0, 160) });
      }
    }
  }
  return out;
}

function readJson(p) {
  return JSON.parse(readFileSync(p, "utf8"));
}

let failures = 0;
function check(label, ok, detail = "") {
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : detail ? "  -- " + detail : ""}`);
  if (!ok) failures++;
}

function runFixtures() {
  const p14 = join(DAILY_DIR, "2026-10-14.json");
  const p01 = join(DAILY_DIR, "2026-10-01.json");
  check("real seed: 2026-10-14 and 2026-10-01 briefings exist", existsSync(p14) && existsSync(p01));
  if (!existsSync(p14) || !existsSync(p01)) return;
  // Real data seeds: Porto (2026-10-14) and Valencia (2026-10-01) are proposals; nothing was applied on those days.
  const un14 = unappliedEntityNames(readJson(p14));
  const un01 = unappliedEntityNames(readJson(p01));
  check("real seed: Porto is unapplied on 2026-10-14", un14.includes("Porto"));
  check("real seed: Valencia is unapplied on 2026-10-01", un01.includes("Valencia"));

  // Negative controls (planted probes) -- each MUST be flagged.
  const probe = (label, html, un, claim) => {
    const v = findMoveClaimViolations(html, un);
    check(`PROBE must fail: ${label}`, v.some((x) => x.claim === claim), `not flagged: ${html.slice(0, 80)}`);
  };
  probe("original defect, Porto largest move", `<svg role="img" aria-label="Today's movement: 0 upgrades, 0 holds; largest move Porto -28.4."></svg>`, un14, "largest move");
  probe("original defect, Valencia largest move (production 2026-10-01)", "<p>Today&#x27;s movement: 0 upgrades, 0 holds; largest move Valencia -19.</p>", un01, "largest move");
  probe("takeaway form 'largest: Porto'", "<p>11 assessed · 1 down · 9 holds · largest: Porto -28.4</p>", un14, "largest:");
  probe("sparkline trajectory (title)", "<svg><title>Porto score trajectory: single reading: 32.5 on 2026-10-14</title></svg>", un14, "trajectory");
  probe("trajectory heading", "<div>Score trajectory — Porto</div>", un14, "trajectory");

  // Must-pass fixtures.
  const pass = (label, html, un) => {
    const v = findMoveClaimViolations(html, un);
    check(`must pass: ${label}`, v.length === 0, JSON.stringify(v));
  };
  pass(
    "fixed Porto wording (real seed)",
    `<p>11 assessed · 1 measured down, not applied · 9 holds · largest measured difference (not applied): Porto -28.4</p><svg aria-label="Today's cycle: 1 measured difference from the published score, not applied; largest measured difference (not applied) Porto -28.4; 9 holds."></svg><div>Proposed measurement (not yet applied) — Porto</div><svg><title>Porto proposed measurement (not yet applied): 32.5 on 2026-10-14</title></svg>`,
    un14,
  );
  pass("fixed Valencia wording (real seed)", "<p>largest measured difference (not applied): Valencia -19</p>", un01);
  const appliedDay = {
    pipeline: { scoreChangesApplied: 1 },
    appliedChanges: [{ slug: "x-land", entity: "Xland" }],
    recentAssessments: [
      { slug: "x-land", entity: "Xland", status: "applied" },
      { slug: "y-land", entity: "Yland", status: "band-crossing-proposed" },
    ],
  };
  const unA = unappliedEntityNames(appliedDay);
  check("applied entity is not in the unapplied list; proposal is", !unA.includes("Xland") && unA.includes("Yland"));
  pass("applied change may keep 'largest move' / 'trajectory' wording", "<p>largest move Xland +4</p><div>Score trajectory — Xland</div>", unA);
  probe("an unapplied entity on a day that also had an applied change", "<p>largest move Yland -9</p>", unA, "largest move");
  const zeroDay = { pipeline: { scoreChangesApplied: 0 }, appliedChanges: [{ slug: "z", entity: "Zland" }], recentAssessments: [{ slug: "z", entity: "Zland", status: "applied" }] };
  check("scoreChangesApplied 0 overrides any 'applied' status (matches DC-03 lint)", unappliedEntityNames(zeroDay).includes("Zland"));
  pass("name as a prefix of another word is not a hit", "<p>largest move Portobello +1</p>", un14);
}

function runTree() {
  if (!existsSync(UPDATES_OUT)) {
    console.log("FAIL  site/out/updates missing (--require-out): run next build first");
    process.exit(1);
  }
  const files = [];
  (function walk(d) {
    for (const f of readdirSync(d)) {
      const p = join(d, f);
      if (statSync(p).isDirectory()) walk(p);
      else if (p.endsWith(".html")) files.push(p);
    }
  })(UPDATES_OUT);
  const latest = existsSync(LATEST_FILE) ? readJson(LATEST_FILE) : null;
  let scanned = 0;
  let withClaims = 0;
  for (const f of files) {
    const base = basename(f, ".html");
    const dailyPath = join(DAILY_DIR, `${base}.json`);
    let data = null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(base) && existsSync(dailyPath)) data = readJson(dailyPath);
    else if (base === "index" || base === "latest") data = latest;
    if (!data) continue;
    const names = unappliedEntityNames(data);
    scanned++;
    const html = readFileSync(f, "utf8");
    const v = findMoveClaimViolations(html, names);
    if (/largest move|trajectory/i.test(html)) withClaims++;
    if (v.length > 0) check(`${f.slice(f.indexOf("out"))}: no move/trajectory claim about an unapplied entity`, false, JSON.stringify(v.slice(0, 3)));
  }
  check(`scanned ${scanned} briefing pages (${withClaims} contain move/trajectory wording); none name an unapplied entity`, scanned > 0 && failures === 0);
}

const isMain = !!process.argv[1]?.endsWith("test-briefing-move-claims.mjs");
if (isMain) {
  if (process.argv.includes("--tree-only")) runTree();
  else runFixtures();
  console.log(failures === 0 ? "\nPASS test-briefing-move-claims" : `\nFAIL test-briefing-move-claims (${failures} failing)`);
  process.exit(failures === 0 ? 0 : 1);
}
