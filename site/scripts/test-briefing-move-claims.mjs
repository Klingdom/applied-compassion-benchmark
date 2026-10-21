#!/usr/bin/env node
/**
 * test-briefing-move-claims.mjs -- BRF-MOVE (defect class DC-03, rendered-text route).
 *
 * The DC-03 lint (lint-daily-briefings.mjs) checks briefing JSON. This test checks the RENDERED HTML: a daily
 * briefing must not say "largest move <entity>" (or "largest: <entity>") or put an entity on a score "trajectory"
 * when that entity's change was only PROPOSED and never applied to the published index.
 *
 * Applied vs unapplied uses ONE rule, src/components/updates/briefing/appliedRule.mjs (also imported by utils.ts, so the renderer
 * and this test cannot drift). pipeline.scoreChangesApplied of 0 means nothing was applied (same as the DC-03 lint,
 * scripts/lib/lint-rules.mjs scanUnappliedScoreMovement); otherwise a row is applied if it is in appliedChanges, carries status
 * "applied", or the applied ledger (src/data/updates/applied-ledger.json, generated from research/APPLIED_CHANGES.md) has its slug
 * with a proposalDate equal to the briefing date (legacy 2026-05..07 briefings do not mark their rows). Everything else is a proposal.
 *
 * Modes:
 *   (default)                     fixtures: planted probes must FAIL, must-pass fixtures (seeded from real briefings)
 *                                 must PASS. Needs no build. Used by `npm run test:briefing-move-claims`.
 *   --tree-only --require-out     scan site/out/updates/**.html against src/data/updates/daily/*.json. Used by build.
 */
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { appliedSlugSet } from "../src/components/updates/briefing/appliedRule.mjs";

const SITE = join(dirname(fileURLToPath(import.meta.url)), "..");
const DAILY_DIR = join(SITE, "src", "data", "updates", "daily");
const LATEST_FILE = join(SITE, "src", "data", "updates", "latest.json");
const UPDATES_OUT = join(SITE, "out", "updates");
const LEDGER_FILE = join(SITE, "src", "data", "updates", "applied-ledger.json");
const UTILS_FILE = join(SITE, "src", "components", "updates", "briefing", "utils.ts");
/** The committed applied ledger ({entries: [{slug, proposalDate, appliedDate, index}]}). */
export const LEDGER = existsSync(LEDGER_FILE) ? JSON.parse(readFileSync(LEDGER_FILE, "utf8")) : { entries: [] };

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const ROW_KEYS = ["appliedChanges", "recentAssessments", "pendingReview", "scoreChanges", "topSignals"];
const rowsOf = (data) => ROW_KEYS.flatMap((k) => (Array.isArray(data?.[k]) ? data[k] : []));

/** Slugs in a briefing whose score change WAS applied to the published index (shared rule + ledger). */
export function appliedSlugs(data, ledger = LEDGER) {
  return appliedSlugSet(data, ledger);
}

/** True when no row in the briefing was applied: every "movement" is a measured difference, not a score move. */
export function nothingApplied(data, ledger = LEDGER) {
  const applied = appliedSlugs(data, ledger);
  return !rowsOf(data).some((c) => c?.slug && applied.has(c.slug));
}

/** Names of entities in a briefing whose row IS applied under the rule. */
export function appliedEntityNames(data, ledger = LEDGER) {
  const applied = appliedSlugs(data, ledger);
  const names = new Set();
  for (const c of rowsOf(data)) if (typeof c?.entity === "string" && c.entity && applied.has(c.slug)) names.add(c.entity);
  return [...names];
}

/** Names of entities in a briefing whose score change was NOT applied to the published index. */
export function unappliedEntityNames(data, ledger = LEDGER) {
  const applied = appliedSlugs(data, ledger);
  const list = (k) => (Array.isArray(data?.[k]) ? data[k] : []);
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

/**
 * BRF-MOVE-2: on a briefing where nothing was applied, the component-generated movement labels must not appear.
 * Whole text units only, so editorial prose inside published briefing JSON is not matched.
 */
const MOVEMENT_LABELS = [
  ["downgrade/upgrade heading", /^\d+ (?:downgrades?|upgrades?)(?:, \d+ (?:downgrades?|upgrades?))?$/],
  ["band crossing heading", /^\d+ band crossings?(?: · .*)?$/],
  ["score changes heading", /^\d+ score changes?$/],
  ["today's score movement", /^Today's score movement$/],
  ["Score movements h2/TOC", /^Score movements$/],
  ["score changes subtitle", /^Entities with score changes this cycle/],
  ["scores moved sub-label", /^— \d+ scores? moved$/],
];
const decodeEntities = (s) => s.replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&");

/**
 * The regions where the component-generated movement labels live (Iteration 109 rework): the movement section
 * (aria-label starting "Today's score movement" / "Today's measured differences"), the dashboard
 * <section id="score-movements">, and the TOC link to #score-movements. The header pipeline strip ("4 score changes")
 * shows pipeline.scoreChanges and is accurate, so it must stay outside the scan.
 */
export function movementRegions(html) {
  const regions = [];
  const isMovementOpen = (tag) => {
    const label = tag.match(/\baria-label="([^"]*)"/);
    if (label && /^(?:Today's score movement|Today's measured differences)/.test(decodeEntities(label[1]))) return true;
    return /\bid="score-movements"/.test(tag);
  };
  for (const m of html.matchAll(/<section\b[^>]*>/gi)) {
    if (!isMovementOpen(m[0])) continue;
    // Walk to the matching </section>, counting nested sections.
    let depth = 0;
    const re = /<(\/?)section\b[^>]*>/gi;
    re.lastIndex = m.index;
    let end = html.length;
    for (let t; (t = re.exec(html)); ) {
      depth += t[1] ? -1 : 1;
      if (depth === 0) { end = t.index + t[0].length; break; }
    }
    regions.push(html.slice(m.index, end));
  }
  for (const m of html.matchAll(/<a\b[^>]*href="#score-movements"[^>]*>[\s\S]*?<\/a>/gi)) regions.push(m[0]);
  return regions;
}

export function findMovementLabelViolations(html) {
  const out = [];
  for (const region of movementRegions(html)) {
    for (const unit of textUnits(region)) {
      // A mixed heading may join parts with "; ". For the nothing-applied scan each part must also be clean.
      for (const part of unit.split("; ")) {
        for (const [claim, re] of MOVEMENT_LABELS) {
          if (re.test(part)) out.push({ claim, text: unit.slice(0, 160) });
        }
      }
    }
  }
  return out;
}

/**
 * Inverse of the move-claim gate: a page must not call an entity "not applied" when its row IS applied under the rule
 * (appliedRule.mjs). Matches the component wordings: "largest measured difference (not applied) <Entity>",
 * "measured difference (not applied): <Entity>", "Proposed measurement (not yet applied) - <Entity>",
 * "<Entity> proposed measurement (not yet applied)".
 */
export function findFalseNotAppliedViolations(html, appliedNames) {
  const out = [];
  for (const unit of textUnits(html)) {
    for (const name of appliedNames) {
      const e = esc(name);
      const patterns = [
        ["measured difference (not applied)", new RegExp(String.raw`measured difference \(not applied\)\s*:?\s*(?:${e})(?![\w])`, "i")],
        ["proposed measurement (not yet applied)", new RegExp(String.raw`proposed measurement \(not yet applied\)\s*[—–-]\s*(?:${e})(?![\w])|(?<![\w-])(?:${e})\s+proposed measurement \(not yet applied\)`, "i")],
      ];
      for (const [claim, re] of patterns) {
        if (re.test(unit)) out.push({ claim, entity: name, text: unit.slice(0, 160) });
      }
    }
  }
  return out;
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

  // BRF-MOVE-2: component-generated movement labels on a nothing-applied briefing.
  const d01 = readJson(p01);
  check("real seed: 2026-10-01 had nothing applied", nothingApplied(d01));
  check("applied-day fixture is not nothing-applied; zero-day fixture is", !nothingApplied(appliedDay) && nothingApplied(zeroDay));
  const labelProbe = (label, html) => {
    const v = findMovementLabelViolations(html);
    check(`PROBE must fail (nothing applied): ${label}`, v.length > 0, `not flagged: ${html.slice(0, 80)}`);
  };
  // Iteration 109 rework: the rule is scoped to the movement regions, so each probe sits inside one.
  const inMovement = (inner) => `<section aria-label="Today&#x27;s score movement"><div>${inner}</div></section>`;
  labelProbe("12 downgrades heading", inMovement("12 downgrades"));
  labelProbe("1 downgrade, 2 upgrades heading", inMovement("1 downgrade, 2 upgrades"));
  labelProbe("1 upgrade heading", inMovement("1 upgrade"));
  labelProbe("N band crossings heading", inMovement("3 band crossings"));
  labelProbe("1 band crossing with entity", inMovement("1 band crossing · Valencia"));
  labelProbe("N score changes heading inside the movement section", inMovement("4 score changes"));
  labelProbe("aria-label Today's score movement", `<section aria-label="Today&#x27;s score movement"></section>`);
  labelProbe("h2 Score movements (dashboard section)", `<section id="score-movements" aria-label="Score movement dashboard"><h2>Score movements</h2></section>`);
  labelProbe("TOC label Score movements", `<a href="#score-movements">Score movements</a>`);
  labelProbe("dashboard subtitle", `<section id="score-movements"><p>Entities with score changes this cycle, followed by confirmed positions.</p></section>`);
  labelProbe("dashboard sub-label scores moved (production 2026-10-01)", `<section id="score-movements"><span>— 12 scores moved</span></section>`);
  labelProbe("mixed heading with an applied part", inMovement("2 downgrades; 1 measured difference, not applied"));
  labelProbe("measured-differences section also scanned", `<section aria-label="Today&#x27;s measured differences (not applied)"><div>12 downgrades</div></section>`);

  const labelPass = (label, html) => {
    const v = findMovementLabelViolations(html);
    check(`must pass: ${label}`, v.length === 0, JSON.stringify(v));
  };
  labelPass(
    "new nothing-applied wording",
    `<section aria-label="Today&#x27;s measured differences (not applied)"><div>12 measured differences, not applied</div><div>3 proposed band crossings</div><div>1 proposed band crossing · Valencia</div></section><section aria-label="Measured differences dashboard"><h2>Measured differences</h2><p>Entities whose new measurement differs from the published score (not applied), followed by confirmed positions.</p></section><a href="#score-movements">Measured differences</a>`,
  );
  // Iteration 109 rework: the header pipeline strip shows pipeline.scoreChanges (accurate); it is outside the movement regions.
  labelPass("header pipeline strip '4 score changes' outside the movement regions is not flagged", `<header><div class="strip"><span>0 score changes</span><span>1 score change</span><span>4 score changes</span></div></header><section aria-label="Today&#x27;s measured differences (not applied)"><div>12 measured differences, not applied</div></section><section aria-label="Pipeline"><span>4 score changes</span></section>`);
  labelProbe("'12 downgrades' inside the movement section is still flagged beside a clean header strip", `<header><span>4 score changes</span></header>${inMovement("12 downgrades")}`);
  labelPass("fixed dashboard sub-label", "<div>Measured differences<span>— 12 not applied to the published score</span></div>");
  labelPass("editorial prose containing the words is not a whole text unit", "<p>The model flagged 12 downgrades across the sector and 3 band crossings.</p><p>Score movements were muted.</p>");
  // The applied-day wording stays legal; the gate only applies to nothing-applied briefings.
  check(
    "applied-day fixture keeps '2 downgrades' (label gate not applied)",
    !nothingApplied(appliedDay) && findMovementLabelViolations(inMovement("2 downgrades")).length > 0,
  );

  // BRF-APPLIED-LEDGER: legacy briefings do not mark rows; research/APPLIED_CHANGES.md (via the ledger) does.
  const p0521 = join(DAILY_DIR, "2026-05-21.json");
  check("real seed: 2026-05-21 briefing exists", existsSync(p0521));
  if (existsSync(p0521)) {
    const d0521 = readJson(p0521);
    const ap = appliedSlugs(d0521);
    for (const slug of ["hungary", "mongolia", "india", "croatia", "marshall-islands"]) {
      check(`ledger: ${slug} is applied on 2026-05-21`, ap.has(slug));
    }
    check("2026-05-21 is not nothing-applied; Croatia is not in the unapplied list", !nothingApplied(d0521) && !unappliedEntityNames(d0521).includes("Croatia"));
    check("without the ledger the old rule called Croatia unapplied (the defect)", unappliedEntityNames(d0521, { entries: [] }).includes("Croatia"));
    const ap0521 = appliedEntityNames(d0521);
    const falseProbe = (label, html, claim) => {
      const v = findFalseNotAppliedViolations(html, ap0521);
      check(`PROBE must fail: ${label}`, v.some((x) => x.claim === claim), `not flagged: ${html.slice(0, 80)}`);
    };
    falseProbe("2026-05-21 Croatia 'largest measured difference (not applied)' (production defect)", "<p>4 assessed · 4 measured down, not applied · largest measured difference (not applied): Croatia -7.8</p>", "measured difference (not applied)");
    falseProbe("aria form without colon", `<svg aria-label="1 measured difference from the published score, not applied; largest measured difference (not applied) Croatia -7.8; 2 holds."></svg>`, "measured difference (not applied)");
    falseProbe("sparkline 'proposed measurement (not yet applied)' on an applied entity", "<svg><title>India proposed measurement (not yet applied): 22.7 on 2026-05-21</title></svg>", "proposed measurement (not yet applied)");
    falseProbe("lead card heading on an applied entity", "<div>Proposed measurement (not yet applied) — Hungary</div>", "proposed measurement (not yet applied)");
    const passFalse = (label, html) => {
      const v = findFalseNotAppliedViolations(html, ap0521);
      check(`must pass: ${label}`, v.length === 0, JSON.stringify(v));
    };
    passFalse("fixed wording on 2026-05-21 ('largest move Croatia -7.8')", "<p>4 assessed · 4 down · largest: Croatia -7.8</p><svg aria-label=\"Applied: 2 upgrades; largest move Croatia -7.8\"></svg><div>Score trajectory — Croatia</div>");
    passFalse("an entity not in the applied set may still be 'not applied'", "<p>largest measured difference (not applied): Valencia -19</p>");
    check("the 2026-05-21 move-claim gate does not flag 'largest move Croatia -7.8'", findMoveClaimViolations("<p>largest move Croatia -7.8</p>", unappliedEntityNames(d0521)).length === 0);
  }
  // Positive control: 2026-10-01 (scoreChangesApplied 0) stays unapplied even though the ledger exists.
  check("positive control: 2026-10-01 Valencia is still unapplied with the ledger loaded", un01.includes("Valencia") && nothingApplied(d01));
  check(
    "positive control: Valencia 'largest measured difference (not applied)' is NOT a false-not-applied claim on 2026-10-01",
    findFalseNotAppliedViolations("<p>largest measured difference (not applied): Valencia -19</p>", appliedEntityNames(d01)).length === 0,
  );
  const ledgerOnly = { date: "2026-05-21", pipeline: { scoreChangesApplied: 5 }, recentAssessments: [{ slug: "croatia", entity: "Croatia" }, { slug: "nowhere", entity: "Nowhere" }] };
  check("ledger rule: slug with proposalDate equal to the briefing date is applied, another slug is not", appliedSlugs(ledgerOnly).has("croatia") && !appliedSlugs(ledgerOnly).has("nowhere"));
  check("ledger rule: a different briefing date does not match", !appliedSlugs({ ...ledgerOnly, date: "2026-05-22" }).has("croatia"));
  check("ledger rule: scoreChangesApplied 0 beats the ledger", !appliedSlugs({ ...ledgerOnly, pipeline: { scoreChangesApplied: 0 } }).has("croatia"));
  check("ledger rule: malformed counter trusts nothing", appliedSlugs({ ...ledgerOnly, pipeline: { scoreChangesApplied: -1 } }).size === 0);

  // Completeness: every briefing with a numeric scoreChangesApplied > 0 yields at least that many applied slugs among its rows.
  const rowSlugs = (d) => new Set(rowsOf(d).map((c) => c?.slug).filter(Boolean));
  let counted = 0;
  const shortfalls = [];
  for (const f of readdirSync(DAILY_DIR).filter((f) => /^\d{4}-\d{2}-\d{2}\.json$/.test(f)).sort()) {
    const d = readJson(join(DAILY_DIR, f));
    const n = d?.pipeline?.scoreChangesApplied;
    if (typeof n !== "number" || n <= 0) continue;
    counted++;
    const rows = rowSlugs(d);
    const have = [...appliedSlugs(d)].filter((sl) => rows.has(sl)).length;
    if (have < n) shortfalls.push(`${d.date}: counter ${n}, applied slugs among rows ${have}`);
  }
  check(`completeness: ${counted} briefings with scoreChangesApplied > 0 each resolve at least that many applied rows`, shortfalls.length === 0, shortfalls.join("; "));

  // Drift guard: the renderer must use the same shared rule and ledger.
  const utils = existsSync(UTILS_FILE) ? readFileSync(UTILS_FILE, "utf8") : "";
  check(
    "no drift: utils.ts isScoreChangeApplied delegates to appliedRule.mjs with applied-ledger.json",
    /from "\.\/appliedRule\.mjs"/.test(utils) && /applied-ledger\.json/.test(utils) && /isAppliedByRule\(updates, slug, appliedLedger\)/.test(utils),
  );
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
  let scannedNothingApplied = 0;
  for (const f of files) {
    const base = basename(f, ".html");
    const dailyPath = join(DAILY_DIR, `${base}.json`);
    let data = null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(base) && existsSync(dailyPath)) data = readJson(dailyPath);
    else if (base === "index" || base === "latest") data = latest;
    if (!data) continue;
    const names = unappliedEntityNames(data);
    const appliedNames = appliedEntityNames(data);
    scanned++;
    const html = readFileSync(f, "utf8");
    const v = findMoveClaimViolations(html, names);
    if (/largest move|trajectory/i.test(html)) withClaims++;
    // BRF-MOVE-2: nothing applied => no score-movement labels anywhere in the rendered page.
    if (nothingApplied(data)) {
      const lv = findMovementLabelViolations(html);
      scannedNothingApplied++;
      if (lv.length > 0) check(`${f.slice(f.indexOf("out"))}: no score-movement label on a nothing-applied briefing`, false, JSON.stringify(lv.slice(0, 3)));
    }
    if (v.length > 0) check(`${f.slice(f.indexOf("out"))}: no move/trajectory claim about an unapplied entity`, false, JSON.stringify(v.slice(0, 3)));
    // BRF-APPLIED-LEDGER: an applied entity must not be labelled "not applied".
    const fv = findFalseNotAppliedViolations(html, appliedNames);
    if (fv.length > 0) check(`${f.slice(f.indexOf("out"))}: no 'not applied' label on an applied entity`, false, JSON.stringify(fv.slice(0, 3)));
  }
  check(`scanned ${scanned} briefing pages (${withClaims} contain move/trajectory wording); none name an unapplied entity; ${scannedNothingApplied} nothing-applied pages carry no score-movement label`, scanned > 0 && failures === 0);
}

const isMain = !!process.argv[1]?.endsWith("test-briefing-move-claims.mjs");
if (isMain) {
  if (process.argv.includes("--tree-only")) runTree();
  else runFixtures();
  console.log(failures === 0 ? "\nPASS test-briefing-move-claims" : `\nFAIL test-briefing-move-claims (${failures} failing)`);
  process.exit(failures === 0 ? 0 : 1);
}
