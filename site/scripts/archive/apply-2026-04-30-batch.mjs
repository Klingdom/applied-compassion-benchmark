#!/usr/bin/env node

/**
 * apply-2026-04-30-batch.mjs — Apply approved 2026-04-30 batch (4 entities).
 *
 * Approved proposals:
 *   1. DeepMind/Google (ai-labs)   — DOWNGRADE -6.6 (65 → 58.4) Established → Functional
 *   2. Turkey (countries)          — DOWNGRADE -10.3 (32.8 → 22.5) Developing band hold
 *   3. Myanmar (countries)         — FORMAL FLOOR DESIGNATION (already 0; dims → all 1.0; floorDesignation attached)
 *   4. Oracle Corporation (F500)   — INDEX REGISTRATION + baseline 28.4 / Developing
 *
 * Re-ranks each affected index; updates band counts and meta stats; marks
 * proposals as applied. Atomic, deterministic.
 *
 * Usage:
 *   node scripts/apply-2026-04-30-batch.mjs           # dry-run
 *   node scripts/apply-2026-04-30-batch.mjs --apply   # write changes
 */

import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const INDEXES_DIR = join(__dirname, "..", "src", "data", "indexes");
const PROPOSALS_DIR = join(__dirname, "..", "..", "research", "change-proposals");
const APPLY = process.argv.includes("--apply");
const APPROVAL_DATE = "2026-04-30";
const APPROVER = "phil@mediafier.ai";

// ── Helpers ─────────────────────────────────────────────────────────────────

const DIM_CODES = ["AWR", "EMP", "ACT", "EQU", "BND", "ACC", "SYS", "INT"];
const BAND_ORDER = ["Exemplary", "Established", "Functional", "Developing", "Critical"];
const BAND_RANGES = {
  Exemplary: "81-100",
  Established: "61-80",
  Functional: "41-60",
  Developing: "21-40",
  Critical: "0-20",
};

function getBand(score) {
  if (score > 80) return "exemplary";
  if (score > 60) return "established";
  if (score > 40) return "functional";
  if (score > 20) return "developing";
  return "critical";
}

function recountBands(rankings) {
  const c = { Exemplary: 0, Established: 0, Functional: 0, Developing: 0, Critical: 0 };
  for (const r of rankings) {
    const name = r.band.charAt(0).toUpperCase() + r.band.slice(1);
    if (c[name] !== undefined) c[name]++;
  }
  return c;
}

function rerankAndStat(data, indexName) {
  data.rankings.sort((a, b) => {
    if (b.composite !== a.composite) return b.composite - a.composite;
    return a.name.localeCompare(b.name);
  });
  data.rankings.forEach((r, i) => { r.rank = i + 1; });

  if (Array.isArray(data.bands) && indexName !== "us-states") {
    const counts = recountBands(data.rankings);
    const total = data.rankings.length;
    const existing = new Map(data.bands.map((b) => [b.name, b]));
    data.bands = BAND_ORDER.map((name) => {
      const prev = existing.get(name) || {};
      return {
        name,
        range: prev.range || BAND_RANGES[name],
        count: counts[name] ?? 0,
        pct: `${Math.round(((counts[name] ?? 0) / total) * 100)}%`,
      };
    });
  }

  if (data.meta) {
    const composites = data.rankings.map((r) => r.composite);
    if (typeof data.meta.meanScore === "number") {
      data.meta.meanScore =
        Math.round((composites.reduce((a, b) => a + b, 0) / composites.length) * 10) / 10;
    }
    if (typeof data.meta.medianScore === "number") {
      const sorted = [...composites].sort((a, b) => a - b);
      data.meta.medianScore =
        sorted.length % 2 === 0
          ? Math.round(((sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2) * 10) / 10
          : sorted[Math.floor(sorted.length / 2)];
    }
    data.meta.entityCount = data.rankings.length;
  }
}

function loadIndex(indexName) {
  return JSON.parse(readFileSync(join(INDEXES_DIR, `${indexName}.json`), "utf8"));
}

function writeIndex(indexName, data) {
  writeFileSync(join(INDEXES_DIR, `${indexName}.json`), JSON.stringify(data, null, 2) + "\n", "utf8");
}

// ── Apply DeepMind/Google (ai-labs) ─────────────────────────────────────────

console.log(`\napply-2026-04-30-batch.mjs — mode: ${APPLY ? "APPLY" : "DRY-RUN"}\n`);
console.log("=".repeat(70));

const aiLabs = loadIndex("ai-labs");
{
  const e = aiLabs.rankings.find((r) => r.name === "DeepMind/Google");
  if (!e) throw new Error("DeepMind/Google not found in ai-labs.json");
  const old = { composite: e.composite, band: e.band, rank: e.rank };

  e.scores = { AWR: 3.6, EMP: 3.2, ACT: 3.4, EQU: 3.2, BND: 3.2, ACC: 3.0, SYS: 3.6, INT: 3.0 };
  e.composite = 58.4;
  e.band = "functional";

  console.log(`\n── ai-labs.json ──`);
  console.log(`  DeepMind/Google: ${old.composite} (${old.band}) → 58.4 (functional)`);
  rerankAndStat(aiLabs, "ai-labs");
  console.log(`  → DeepMind/Google new rank: #${aiLabs.rankings.find((r) => r.name === "DeepMind/Google").rank}`);
}

// ── Apply Turkey + Myanmar floor designation (countries) ────────────────────

const countries = loadIndex("countries");
{
  // Turkey
  const t = countries.rankings.find((r) => r.name === "Turkey");
  if (!t) throw new Error("Turkey not found in countries.json");
  const oldT = { composite: t.composite, band: t.band, rank: t.rank };
  t.scores = { AWR: 2.2, EMP: 2.0, ACT: 2.2, EQU: 1.8, BND: 2.0, ACC: 1.6, SYS: 2.0, INT: 1.4 };
  t.composite = 22.5;
  t.band = "developing";

  // Myanmar — formal floor designation (founder-approved 2026-04-30)
  const m = countries.rankings.find((r) => r.name === "Myanmar");
  if (!m) throw new Error("Myanmar not found in countries.json");
  const oldM = { composite: m.composite, band: m.band, rank: m.rank };
  for (const c of DIM_CODES) m.scores[c] = 1;
  m.composite = 0;
  m.band = "critical";
  m.floorDesignation = {
    designated: true,
    designatedDate: "2026-04-30",
    evidenceWindow: "2026-04-15 to 2026-04-29",
    rationale:
      "Floor designation reflects systemic harm pattern documented across multiple assessment cycles, formalized following the April 10, 2026 inauguration of Min Aung Hlaing (the 2021 coup architect) as president and the April 26, 2026 expansion of martial law across 60 townships. Junta controls fewer than 40% of national territory; 9,400+ cumulative airstrikes since the coup; 3,800+ civilian deaths from airstrikes alone; 4 million internally displaced; 1.5 million refugees; one-third of the population in humanitarian need. Composite resolves at zero because no dimension shows functional compassion behavior at the sub-anchor level outside junta-controlled territory, and because the inauguration formalizes the rejection of any transitional framing.",
    primaryDrivers: ["AWR", "EMP", "EQU", "BND", "ACC", "INT"],
    evidenceSummary: [
      "April 10, 2026: Min Aung Hlaing (coup architect, 2021) sworn in as president; bombardments continued during the inauguration ceremony.",
      "April 26, 2026: Junta imposed martial law across 60 townships following the inauguration.",
      "9,400+ cumulative airstrikes since the February 2021 coup; 3,800+ civilian deaths from airstrikes alone.",
      "4 million internally displaced; 1.5 million cross-border refugees; one-third of the population requires humanitarian assistance.",
      "Junta controls fewer than 40% of townships (independent monitoring); ASEAN Five-Point Consensus has produced no documented behavioral change.",
      "HRW World Report 2026: military's actions amount to war crimes and crimes against humanity. UN Special Rapporteur and SG statements confirm sustained pattern.",
    ],
    methodologyVersion: "v1.2",
  };

  console.log(`\n── countries.json ──`);
  console.log(`  Turkey:  ${oldT.composite} (${oldT.band}) → 22.5 (developing)`);
  console.log(`  Myanmar: ${oldM.composite} (${oldM.band}) → 0 (critical) [FLOOR-DESIGNATED]`);
  rerankAndStat(countries, "countries");
  console.log(`  → Turkey new rank: #${countries.rankings.find((r) => r.name === "Turkey").rank}`);
  console.log(`  → Myanmar new rank: #${countries.rankings.find((r) => r.name === "Myanmar").rank}`);
}

// ── Register Oracle in fortune-500 ──────────────────────────────────────────

const fortune500 = loadIndex("fortune-500");
{
  if (fortune500.rankings.find((r) => r.name === "Oracle")) {
    throw new Error("Oracle already exists in fortune-500.json");
  }

  const oracleEntry = {
    rank: 0, // assigned by rerankAndStat
    f500Rank: 80, // Fortune 500 2024-2025 published rank (revenue-based)
    name: "Oracle",
    sector: "Technology",
    composite: 28.4,
    band: "developing",
    scores: { AWR: 2.2, EMP: 1.8, ACT: 2.2, EQU: 2.0, BND: 1.8, ACC: 2.2, SYS: 2.4, INT: 2.4 },
  };
  fortune500.rankings.push(oracleEntry);

  console.log(`\n── fortune-500.json ──`);
  console.log(`  Oracle: REGISTERED (composite 28.4, developing, f500Rank 80)`);
  rerankAndStat(fortune500, "fortune-500");
  console.log(`  → Oracle new rank: #${fortune500.rankings.find((r) => r.name === "Oracle").rank}`);
  console.log(`  → fortune-500 entityCount: ${fortune500.meta.entityCount} (was 447)`);
}

// ── Write all indexes ───────────────────────────────────────────────────────

if (APPLY) {
  writeIndex("ai-labs", aiLabs);
  writeIndex("countries", countries);
  writeIndex("fortune-500", fortune500);
  console.log(`\n  ✅ Index files written.`);

  // Mark proposals as applied
  const proposals = ["deepmind-google-2026-04-30", "turkey-2026-04-30", "myanmar-2026-04-30", "oracle-2026-04-30"];
  for (const slug of proposals) {
    const path = join(PROPOSALS_DIR, `${slug}.json`);
    try {
      const p = JSON.parse(readFileSync(path, "utf8"));
      p.status = "applied";
      p.reviewed_by = APPROVER;
      p.reviewed_date = APPROVAL_DATE;
      p.decision = "approved";
      p.applied_date = APPROVAL_DATE;
      writeFileSync(path, JSON.stringify(p, null, 2) + "\n");
      console.log(`  ✅ ${slug}.json marked as applied`);
    } catch (e) {
      console.error(`  ❌ Could not update ${slug}: ${e.message}`);
    }
  }
} else {
  console.log("\n  (DRY-RUN — no writes)");
}

console.log("\n" + "=".repeat(70));
if (APPLY) {
  console.log("\n✅ Batch applied. Run prepare-updates.mjs and rebuild.\n");
} else {
  console.log("\nDRY-RUN complete. Re-run with --apply to write changes.\n");
}
