#!/usr/bin/env node

/**
 * recompute-composites.mjs — Recompute composite scores for all 7 index JSON files.
 *
 * Fixes Generation-1 floor-clamping artifact: some entities have composite=0
 * stored manually for "critical" cases instead of being computed from dimension
 * scores. Also corrects any other entities where the stored composite diverges
 * materially (|delta| >= 0.5) from the formula-derived value.
 *
 * Usage:
 *   node scripts/recompute-composites.mjs           # dry-run: log proposed changes
 *   node scripts/recompute-composites.mjs --apply   # apply changes to JSON files
 *
 * Constraints:
 *   - Only updates entities where |delta| >= 0.5 (avoids noise from rounding)
 *   - Re-ranks each index after updating composites (sort descending, 1..N)
 *   - Updates meta.entityCount and band counts when present
 *   - Writes 2-space indent + trailing newline (matches existing file format)
 *   - Deterministic: running twice produces identical output
 */

import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const INDEXES_DIR = join(__dirname, "..", "src", "data", "indexes");
const APPLY = process.argv.includes("--apply");

// ---------------------------------------------------------------------------
// Protected entities — assessor-set composites that must not be overwritten
// even when |delta| >= 0.5.  Keyed by exact entity name as it appears in JSON.
// ---------------------------------------------------------------------------

const PROTECTED_NAMES = new Set([
  // Morning batch (evidence-assessed 2026-04-19 AM)
  "Venezuela",
  "Alphabet/Google",
  "Anthropic",
  "Character AI",
  "GEO Group",
  "Core Civic",
  // Evening batch (evidence-assessed 2026-04-19 PM)
  "Walt Disney",
  "Pfizer",
  "Saudi Arabia",
  "State Street",
  "Abbott Laboratories",
  "Microsoft",
  "Nucor",
  "Ecolab",
  // Batch 6 (evidence-assessed 2026-04-21)
  "Meta AI",
  "OpenAI",
  // Batch 7 — founder-approved 2026-04-22
  "Anthropic",
  "Palantir AI",
  "IBM",
  "Amazon",
  "Deere &amp; Company",
  "Macy&#x27;s",
  "Interpublic Group",
  "Norway",
  "New Zealand",
  "Democratic Republic of C",
  // Batch 8 — founder-approved 2026-04-23
  "TIAA",
  "Masimo Corporation",
  "Fannie Mae",
  "Germany",
  "Netherlands",
  "DeepMind/Google",
  "Singapore",
  "Palantir AI",
  "OpenAI",
]);

// ---------------------------------------------------------------------------
// Scoring functions — must stay in sync with src/lib/scoring.ts
// computeCompositeFromDimensions variant: operates on already-averaged dim scores
// ---------------------------------------------------------------------------

const DIM_CODES = ["AWR", "EMP", "ACT", "EQU", "BND", "ACC", "SYS", "INT"];

function computeCompositeFromDimensions(dimScores) {
  const dimVals = DIM_CODES.map((c) => dimScores[c] ?? 1);
  const dimCount = DIM_CODES.length;

  const baseAvg = dimVals.reduce((a, b) => a + b, 0) / dimCount;
  const baseComposite = ((baseAvg - 1) / 4) * 100;

  const mean = baseAvg;
  const variance = dimVals.reduce((a, b) => a + (b - mean) ** 2, 0) / dimCount;
  const stdDev = Math.sqrt(variance);

  let consistencyMult;
  if (stdDev <= 1.5) consistencyMult = 1.0;
  else if (stdDev <= 3.0) consistencyMult = 0.75;
  else if (stdDev <= 5.0) consistencyMult = 0.4;
  else consistencyMult = 0.1;

  const weakDims = dimVals.filter((v) => v < 4.0).length;
  const weaknessFactor = Math.max(0, 1 - weakDims * 0.2);

  const hasHarm = dimVals.some((v) => v === 0);
  const integrationPremium = hasHarm ? 0 : 10 * consistencyMult * weaknessFactor;

  const raw = Math.min(100, Math.max(0, baseComposite + integrationPremium));
  const composite = Math.round(raw * 10) / 10;
  return { composite, integrationPremium };
}

function getBand(score) {
  if (score <= 20) return "Critical";
  if (score <= 40) return "Developing";
  if (score <= 60) return "Functional";
  if (score <= 80) return "Established";
  return "Exemplary";
}

// ---------------------------------------------------------------------------
// Band count helpers
// ---------------------------------------------------------------------------

function recountBands(rankings) {
  const counts = { Critical: 0, Developing: 0, Functional: 0, Established: 0, Exemplary: 0 };
  for (const e of rankings) {
    const b = getBand(e.composite);
    counts[b]++;
  }
  return counts;
}

// ---------------------------------------------------------------------------
// Main processing
// ---------------------------------------------------------------------------

const files = readdirSync(INDEXES_DIR).filter((f) => f.endsWith(".json")).sort();

console.log(`\nrecompute-composites.mjs — mode: ${APPLY ? "APPLY" : "DRY-RUN"}`);
console.log(`Processing ${files.length} index files in ${INDEXES_DIR}\n`);
console.log("=".repeat(70));

// Aggregates for final report
const report = {
  totalEntities: 0,
  totalMaterial: 0,       // |delta| >= 0.5
  totalBandChanges: 0,
  topUpward: [],          // { file, name, oldComposite, newComposite, delta }
  droppedMaterial: [],    // entities where composite dropped >= 0.5
};

for (const file of files) {
  const filePath = join(INDEXES_DIR, file);
  let data;

  try {
    data = JSON.parse(readFileSync(filePath, "utf8"));
  } catch (e) {
    console.error(`ERROR: Could not parse ${file}: ${e.message}`);
    continue;
  }

  const rankings = data.rankings;
  if (!Array.isArray(rankings) || rankings.length === 0) {
    console.warn(`SKIP: ${file} — no rankings array`);
    continue;
  }

  console.log(`\n${file} (${rankings.length} entities)`);
  console.log("-".repeat(50));

  let materialCount = 0;
  let bandChangeCount = 0;
  const fileUpward = [];
  const fileDropped = [];
  let anyChanged = false;

  for (const entity of rankings) {
    if (!entity.scores || typeof entity.scores !== "object") continue;

    const { composite: computed, integrationPremium } = computeCompositeFromDimensions(entity.scores);
    const stored = entity.composite;
    const delta = computed - stored;
    const absDelta = Math.abs(delta);

    // Log protected entities that have a material discrepancy but skip update
    if (PROTECTED_NAMES.has(entity.name) && absDelta >= 0.5) {
      const sign = delta > 0 ? "+" : "";
      console.log(
        `  [PROTECTED] ${entity.name.padEnd(35)} ${String(stored).padStart(6)} → ${String(computed).padStart(6)}  (${sign}${delta.toFixed(1)}) — skipped`
      );
      continue;
    }

    if (absDelta >= 0.5) {
      materialCount++;
      anyChanged = true;

      const oldBand = entity.band;
      const newBand = getBand(computed).toLowerCase();
      const bandChanged = oldBand.toLowerCase() !== newBand;
      if (bandChanged) bandChangeCount++;

      const sign = delta > 0 ? "+" : "";
      const bandNote = bandChanged ? ` | band: ${oldBand} → ${newBand}` : "";
      console.log(
        `  ${entity.name.padEnd(35)} ${String(stored).padStart(6)} → ${String(computed).padStart(6)}  (${sign}${delta.toFixed(1)})${bandNote}`
      );

      if (delta >= 0.5) {
        fileUpward.push({ file, name: entity.name, oldComposite: stored, newComposite: computed, delta });
      } else if (delta <= -0.5) {
        fileDropped.push({ file, name: entity.name, oldComposite: stored, newComposite: computed, delta });
      }

      if (APPLY) {
        entity.composite = computed;
        entity.band = newBand;
      }
    }
  }

  if (materialCount === 0) {
    console.log("  (no material discrepancies — all within 0.5)");
  }

  report.totalEntities += rankings.length;
  report.totalMaterial += materialCount;
  report.totalBandChanges += bandChangeCount;
  report.topUpward.push(...fileUpward);
  report.droppedMaterial.push(...fileDropped);

  if (APPLY && anyChanged) {
    // Re-rank: sort descending by composite, re-assign rank 1..N
    rankings.sort((a, b) => {
      // Primary: composite descending
      if (b.composite !== a.composite) return b.composite - a.composite;
      // Secondary: name ascending (stable, deterministic tiebreak)
      return a.name.localeCompare(b.name);
    });

    for (let i = 0; i < rankings.length; i++) {
      rankings[i].rank = i + 1;
    }

    // Update meta.entityCount
    if (data.meta) {
      data.meta.entityCount = rankings.length;
    }

    // Update band counts in data.bands if present.
    // Exception: us-states.json uses band counts that reflect the full 51-state
    // set, not just the 21 entries in rankings. Do not recalculate from rankings.
    if (Array.isArray(data.bands) && file !== "us-states.json") {
      const newCounts = recountBands(rankings);
      const total = rankings.length;
      for (const bandEntry of data.bands) {
        const count = newCounts[bandEntry.name] ?? 0;
        bandEntry.count = count;
        bandEntry.pct = `${Math.round((count / total) * 100)}%`;
      }
    }

    // Write with 2-space indent + trailing newline
    writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf8");
    console.log(`  → WRITTEN: ${file}`);
  } else if (APPLY && !anyChanged) {
    console.log("  (no changes to write)");
  }
}

// ---------------------------------------------------------------------------
// Summary report
// ---------------------------------------------------------------------------

console.log("\n" + "=".repeat(70));
console.log("SUMMARY");
console.log("=".repeat(70));
console.log(`  Total entities processed:     ${report.totalEntities}`);
console.log(`  Material changes (|delta|>=0.5): ${report.totalMaterial}`);
console.log(`  Band changes:                 ${report.totalBandChanges}`);

console.log("\nTop 10 largest UPWARD adjustments (floor-clamped entities):");
const topUpward = report.topUpward
  .sort((a, b) => b.delta - a.delta)
  .slice(0, 10);

if (topUpward.length === 0) {
  console.log("  (none)");
} else {
  for (const e of topUpward) {
    console.log(
      `  [${e.file}] ${e.name.padEnd(35)} ${String(e.oldComposite).padStart(6)} → ${String(e.newComposite).padStart(6)}  (+${e.delta.toFixed(1)})`
    );
  }
}

if (report.droppedMaterial.length > 0) {
  console.log("\nEntities where composite DROPPED materially (|delta|>=0.5, delta<0):");
  for (const e of report.droppedMaterial.sort((a, b) => a.delta - b.delta)) {
    console.log(
      `  [${e.file}] ${e.name.padEnd(35)} ${String(e.oldComposite).padStart(6)} → ${String(e.newComposite).padStart(6)}  (${e.delta.toFixed(1)})`
    );
  }
} else {
  console.log("\nEntities where composite DROPPED materially: (none)");
}

if (APPLY) {
  console.log("\nChanges applied. Run validate-indexes.mjs to verify.\n");
} else {
  console.log("\nDRY-RUN complete. Re-run with --apply to write changes.\n");
}
