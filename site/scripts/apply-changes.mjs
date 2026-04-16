#!/usr/bin/env node

/**
 * apply-changes.mjs — Apply approved score change proposals to index JSON files.
 *
 * Reads proposals from research/change-proposals/, applies approved changes,
 * recalculates ranks, band counts, and meta statistics.
 */

import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const INDEXES_DIR = join(__dirname, "..", "src", "data", "indexes");
const PROPOSALS_DIR = join(__dirname, "..", "..", "research", "change-proposals");

// ── Changes to apply ──────────────────────────────────────────────
// Dimension scores are on 0-100 scale in proposals.
// Index JSON uses raw 1-5 scale: raw = (score/100)*4 + 1
function toRaw(score100) {
  return Math.round(((score100 / 100) * 4 + 1) * 100) / 100;
}

const CHANGES = [
  {
    slug: "mistral-ai",
    index: "ai-labs",
    name: "Mistral AI",
    composite: 46.9,
    band: "functional",
    dims100: { AWR: 43.8, EMP: 37.5, ACT: 43.8, EQU: 37.5, BND: 50.0, ACC: 43.8, SYS: 56.3, INT: 62.5 },
  },
  {
    slug: "anthropic",
    index: "ai-labs",
    name: "Anthropic",
    composite: 68.8,
    band: "established",
    dims100: { AWR: 68.8, EMP: 62.5, ACT: 68.8, EQU: 56.3, BND: 75.0, ACC: 75.0, SYS: 75.0, INT: 68.8 },
  },
  {
    slug: "rwanda",
    index: "countries",
    name: "Rwanda",
    composite: 30.0,
    band: "developing",
    dims100: { AWR: 31.3, EMP: 25.0, ACT: 43.8, EQU: 25.0, BND: 31.3, ACC: 12.5, SYS: 37.5, INT: 12.5 },
  },
  {
    slug: "alphabet",
    index: "fortune-500",
    name: "Alphabet/Google",
    composite: 42.2,
    band: "functional",
    dims100: { AWR: 43.8, EMP: 37.5, ACT: 43.8, EQU: 37.5, BND: 43.8, ACC: 37.5, SYS: 50.0, INT: 43.8 },
  },
  {
    slug: "unitedhealth-group",
    index: "fortune-500",
    name: "UnitedHealth Group",
    composite: 10.9,
    band: "critical",
    dims100: { AWR: 18.8, EMP: 6.3, ACT: 12.5, EQU: 6.3, BND: 12.5, ACC: 6.3, SYS: 12.5, INT: 12.5 },
  },
  {
    slug: "walmart",
    index: "fortune-500",
    name: "Walmart",
    composite: 28.9,
    band: "developing",
    dims100: { AWR: 31.3, EMP: 25.0, ACT: 31.3, EQU: 25.0, BND: 31.3, ACC: 25.0, SYS: 31.3, INT: 31.3 },
  },
];

const BAND_ORDER = ["Exemplary", "Established", "Functional", "Developing", "Critical"];
const BAND_RANGES = { Exemplary: "81-100", Established: "61-80", Functional: "41-60", Developing: "21-40", Critical: "0-20" };

function getBand(composite) {
  if (composite > 80) return "exemplary";
  if (composite > 60) return "established";
  if (composite > 40) return "functional";
  if (composite > 20) return "developing";
  return "critical";
}

// ── Apply changes per index ──────────────────────────────────────
const indexFiles = new Set(CHANGES.map((c) => c.index));

for (const indexName of indexFiles) {
  const filePath = join(INDEXES_DIR, `${indexName}.json`);
  const data = JSON.parse(readFileSync(filePath, "utf8"));
  const changes = CHANGES.filter((c) => c.index === indexName);

  console.log(`\n── ${indexName}.json ──`);

  for (const change of changes) {
    const entity = data.rankings.find((r) => r.name === change.name);
    if (!entity) {
      console.error(`  ❌ Entity not found: ${change.name}`);
      continue;
    }

    const oldComposite = entity.composite;
    const oldBand = entity.band;

    // Update scores (convert 0-100 to 1-5 raw)
    for (const [dim, val100] of Object.entries(change.dims100)) {
      entity.scores[dim] = toRaw(val100);
    }
    entity.composite = change.composite;
    entity.band = change.band;

    console.log(`  ${change.name}: ${oldComposite} (${oldBand}) → ${change.composite} (${change.band})`);
  }

  // Recalculate ranks (sort by composite descending, then by name for ties)
  data.rankings.sort((a, b) => b.composite - a.composite || a.name.localeCompare(b.name));
  data.rankings.forEach((r, i) => {
    r.rank = i + 1;
  });

  // Recalculate band counts
  const bandCounts = { Exemplary: 0, Established: 0, Functional: 0, Developing: 0, Critical: 0 };
  for (const r of data.rankings) {
    const bandName = r.band.charAt(0).toUpperCase() + r.band.slice(1);
    if (bandCounts[bandName] !== undefined) bandCounts[bandName]++;
  }

  data.bands = BAND_ORDER.map((name) => ({
    name,
    range: BAND_RANGES[name],
    count: bandCounts[name],
    pct: Math.round((bandCounts[name] / data.rankings.length) * 100) + "%",
  }));

  // Recalculate meta stats
  const composites = data.rankings.map((r) => r.composite);
  data.meta.meanScore = Math.round((composites.reduce((a, b) => a + b, 0) / composites.length) * 10) / 10;
  const sorted = [...composites].sort((a, b) => a - b);
  data.meta.medianScore = sorted.length % 2 === 0
    ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
    : sorted[Math.floor(sorted.length / 2)];

  // Log new ranks for changed entities
  for (const change of changes) {
    const entity = data.rankings.find((r) => r.name === change.name);
    console.log(`  → ${change.name} new rank: #${entity.rank}`);
  }

  writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n");
  console.log(`  ✅ ${indexName}.json written (${data.rankings.length} entities)`);
}

// ── Mark proposals as applied ────────────────────────────────────
const TODAY = "2026-04-16";
for (const change of CHANGES) {
  const proposalPath = join(PROPOSALS_DIR, `${change.slug}.json`);
  try {
    const proposal = JSON.parse(readFileSync(proposalPath, "utf8"));
    proposal.status = "applied";
    proposal.reviewed_by = "phil@mediafier.ai";
    proposal.reviewed_date = TODAY;
    proposal.decision = "approved";
    proposal.applied_date = TODAY;
    writeFileSync(proposalPath, JSON.stringify(proposal, null, 2) + "\n");
    console.log(`  ✅ ${change.slug}.json marked as applied`);
  } catch (e) {
    console.error(`  ❌ Could not update proposal ${change.slug}: ${e.message}`);
  }
}

console.log("\n✅ All changes applied successfully\n");
