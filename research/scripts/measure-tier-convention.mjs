#!/usr/bin/env node
/**
 * CS-3: which tier convention does the corpus actually use?
 *
 * The ambiguity: does `sourceTier` describe the OUTLET that published an item,
 * or the AUTHORITY whose finding the outlet is reporting? Both are in use —
 * documented on 2026-09-17 (Euronews reporting the UN High Commissioner, tiered
 * 4 = authority) and 2026-09-21 (thenationalnews.com reporting a UN mission,
 * tiered 2 = outlet, with the assessment saying "tier 2 reporting of a tier-4
 * UN mandate finding").
 *
 * V10: every count below is reported as a fraction of what exists, so an
 * absence or a small number is readable as coverage rather than as a result.
 */
import { readFileSync, readdirSync } from "node:fs";

import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..", "..") + "/";
const DAILY = REPO + "site/src/data/updates/daily/";

// Primary-source domains: an institution publishing its own finding. Under
// EITHER convention these are high-tier, so they are excluded from the
// convention test — they cannot discriminate.
// Widened after the first run: unwomen.org and crisisresponse.iom.int appeared
// in the "outlet" bucket, and a UN agency publishing its own report is a primary
// source under either convention. Any *.int, any UN-family org, and any
// government domain is now excluded as non-discriminating.
const PRIMARY_DOMAIN = /\.gov\b|\.gov\.|\.int\b|\.mil\b|ohchr|unhcr|unicef|unwomen|unocha|undp|unesco|\bun\.org|wfp\.org|iom\.|who\.int|icc-cpi|europa\.eu|oecd\.org|worldbank\.org|imf\.org|amnesty\.org|hrw\.org|freedomhouse\.org|adb\.org|reliefweb|ilo\.org|\boig\./i;

// An authority named inside the claim or quote — the thing being reported.
const AUTHORITY = /\b(UN|United Nations|OHCHR|High Commissioner|Supreme Court|European Court|court|tribunal|ICC|prosecutor|ministry|minister|regulator|commission|inspector general|ombudsman|parliament|senate|congress|DOJ|Department of Justice|SEC|FTC|EEOC|WHO|UNICEF|World Bank|IMF|fact-finding|rapporteur)\b/i;

function evidenceOf(doc) {
  const out = [];
  (function walk(o) {
    if (Array.isArray(o)) return o.forEach(walk);
    if (o && typeof o === "object") {
      if ("sourceTier" in o && "url" in o) return out.push(o);
      Object.values(o).forEach(walk);
    }
  })(doc);
  return out;
}

const dates = readdirSync(DAILY)
  .filter((f) => /^\d{4}-\d{2}-\d{2}\.json$/.test(f))
  .map((f) => f.replace(/\.json$/, ""))
  .sort();

let total = 0;
let withTier = 0;
let primary = 0;
let discriminating = 0;
const byConvention = { outlet: [], authority: [], ambiguous: [] };

for (const d of dates) {
  for (const e of evidenceOf(JSON.parse(readFileSync(`${DAILY}${d}.json`, "utf8")))) {
    total += 1;
    const tier = Number(e.sourceTier);
    if (!Number.isInteger(tier)) continue;
    withTier += 1;

    const url = String(e.url ?? "");
    if (PRIMARY_DOMAIN.test(url)) {
      primary += 1;
      continue; // cannot discriminate: high tier under either rule
    }

    const text = `${e.claim ?? ""} ${e.quote ?? ""} ${e.source ?? ""}`;
    if (!AUTHORITY.test(text)) continue; // no authority reported: nothing to disagree about

    discriminating += 1;
    const row = { date: d, tier, source: String(e.source ?? "").slice(0, 30), url: url.slice(0, 58) };
    if (tier >= 4) byConvention.authority.push(row);
    else if (tier <= 2) byConvention.outlet.push(row);
    else byConvention.ambiguous.push(row);
  }
}

console.log("CS-3 — which tier convention is in use?\n");
console.log("COVERAGE (V10):");
console.log(`  briefings read                      ${dates.length}`);
console.log(`  evidence items                      ${total}`);
console.log(`  with an integer sourceTier          ${withTier}  (${((withTier / total) * 100).toFixed(1)}% of items)`);
console.log(`  excluded: primary-source domain     ${primary}  (high-tier under either rule, cannot discriminate)`);
console.log(`  DISCRIMINATING sample               ${discriminating}  (${((discriminating / withTier) * 100).toFixed(1)}% of tiered items)`);
console.log("    = a non-primary outlet whose claim names an institutional authority\n");

const o = byConvention.outlet.length;
const a = byConvention.authority.length;
const amb = byConvention.ambiguous.length;
console.log("RESULT within the discriminating sample:");
console.log(`  tiered 1-2 → OUTLET convention      ${o}  (${((o / discriminating) * 100).toFixed(1)}%)`);
console.log(`  tiered 4-5 → AUTHORITY convention   ${a}  (${((a / discriminating) * 100).toFixed(1)}%)`);
console.log(`  tiered 3   → indeterminate          ${amb}  (${((amb / discriminating) * 100).toFixed(1)}%)`);

console.log("\nsample of each, for a human to sanity-check the classification:");
for (const [label, rows] of [["OUTLET", byConvention.outlet], ["AUTHORITY", byConvention.authority]]) {
  console.log(`  ${label}:`);
  for (const r of rows.slice(0, 4)) console.log(`    T${r.tier}  ${r.date}  ${r.source.padEnd(30)} ${r.url}`);
}

console.log("\nLIMIT, stated: the classification is heuristic. 'An authority is named in the claim' is a regex,");
console.log("and a human would disagree with some of it. It is strong enough to answer whether BOTH conventions");
console.log("are in live use, which is the question CS-3 asks. It is not strong enough to say which is correct.");
