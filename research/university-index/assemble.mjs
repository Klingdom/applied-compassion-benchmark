#!/usr/bin/env node
/**
 * Assemble the 5 university score batches into the canonical index JSON:
 *   site/src/data/indexes/universities.json
 *
 * Computes composite/band/rank from the canonical scoring lib so the file
 * passes validate-indexes on the first build. Raw scores + rationale stay
 * in the research batches; the published file is lean (mirrors ai-labs.json
 * + university metadata: slug/country/region/type/confidence).
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  computeCompositeFromDimensions,
  getBand,
  DIMENSION_CODES,
} from "../../site/scripts/lib/scoring.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "..", "site", "src", "data", "indexes", "universities.json");

// ── 1. Load + merge the 5 batches ────────────────────────────────────────────
const entities = [];
for (let n = 1; n <= 5; n++) {
  const batch = JSON.parse(readFileSync(join(__dirname, `scores-batch-${n}.json`), "utf8"));
  for (const e of batch) entities.push(e);
}
if (entities.length !== 100) throw new Error(`Expected 100 entities, got ${entities.length}`);

// ── 2. Integrity: unique slugs, all 8 dims present + in range ─────────────────
const slugs = new Set();
for (const e of entities) {
  if (!e.slug) throw new Error(`Missing slug for ${e.name}`);
  if (slugs.has(e.slug)) throw new Error(`Duplicate slug: ${e.slug}`);
  slugs.add(e.slug);
  for (const code of DIMENSION_CODES) {
    const v = e.scores?.[code];
    if (typeof v !== "number" || v < 0 || v > 5) {
      throw new Error(`${e.name} ${code} out of range: ${v}`);
    }
  }
}

// ── 3. Compute composite + band ───────────────────────────────────────────────
for (const e of entities) {
  const { composite } = computeCompositeFromDimensions(e.scores);
  e.composite = Math.round(composite * 10) / 10;
  e.band = getBand(e.composite).toLowerCase();
}

// ── 4. Rank: composite desc, alphabetical tiebreak ────────────────────────────
entities.sort((a, b) => b.composite - a.composite || a.name.localeCompare(b.name));
entities.forEach((e, i) => { e.rank = i + 1; });

// ── 5. Build lean published entries (mirror ai-labs + university metadata) ────
const rankings = entities.map((e) => ({
  rank: e.rank,
  name: e.name,
  slug: e.slug,
  country: e.country,
  region: e.region,
  type: e.type,
  confidence: e.confidence,
  scores: Object.fromEntries(DIMENSION_CODES.map((c) => [c, e.scores[c]])),
  composite: e.composite,
  band: e.band,
}));

// ── 6. Meta + bands (canonical dual shape, mirrors countries.json exactly) ────
// meta.bands  → [{ band, count, percentage }]  (read by entity pages / renderEntityPage)
// top-level bands → [{ name, range, count, pct, percentage }] (read by validator / index UI)
const BAND_DEFS = [
  { band: "exemplary", name: "Exemplary", range: "81-100" },
  { band: "established", name: "Established", range: "61-80" },
  { band: "functional", name: "Functional", range: "41-60" },
  { band: "developing", name: "Developing", range: "21-40" },
  { band: "critical", name: "Critical", range: "0-20" },
];
const total = rankings.length;
const metaBands = BAND_DEFS.map(({ band }) => {
  const count = rankings.filter((r) => r.band === band).length;
  return { band, count, percentage: Math.round((count / total) * 1000) / 10 };
});
const topBands = BAND_DEFS.map(({ band, name, range }) => {
  const count = rankings.filter((r) => r.band === band).length;
  const percentage = Math.round((count / total) * 1000) / 10;
  return { name, range, count, pct: `${Math.round(percentage)}%`, percentage };
});

const composites = rankings.map((r) => r.composite).sort((a, b) => a - b);
const mean = composites.reduce((s, v) => s + v, 0) / composites.length;
const median = composites.length % 2
  ? composites[(composites.length - 1) / 2]
  : (composites[composites.length / 2 - 1] + composites[composites.length / 2]) / 2;

const out = {
  meta: {
    title: "Top 100 Universities Index 2026",
    year: 2026,
    entityCount: 100,
    meanScore: Math.round(mean * 10) / 10,
    medianScore: Math.round(median * 10) / 10,
    dimensions: DIMENSION_CODES,
    bands: metaBands,
  },
  bands: topBands,
  rankings,
};
const bands = metaBands; // for the console summary below

writeFileSync(OUT, JSON.stringify(out, null, 2) + "\n", "utf8");

console.log(`Wrote ${OUT}`);
console.log(`Entities: ${rankings.length} | mean ${out.meta.meanScore} | median ${out.meta.medianScore}`);
console.log(`Bands:`, bands);
console.log(`Top 5:`, rankings.slice(0, 5).map((r) => `${r.rank}. ${r.name} ${r.composite} (${r.band})`).join(" · "));
console.log(`Bottom 5:`, rankings.slice(-5).map((r) => `${r.rank}. ${r.name} ${r.composite} (${r.band})`).join(" · "));
