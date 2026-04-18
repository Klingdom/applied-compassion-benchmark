#!/usr/bin/env node

/**
 * Transforms overnight pipeline outputs into website-consumable JSON.
 * Reads from research/ and writes to site/src/data/updates/latest.json.
 *
 * Usage: node site/scripts/prepare-updates.mjs [YYYY-MM-DD]
 *        Defaults to today's date if not specified.
 */

import { readFileSync, existsSync, readdirSync, unlinkSync } from "fs";
import { join, basename } from "path";
import {
  readJson,
  readFrontmatter,
  bandFor,
  extractSection,
  extractBullets,
  writeJsonAtomic,
} from "./lib/pipeline-reader.mjs";

const ROOT = join(import.meta.dirname, "..", "..");
const RESEARCH = join(ROOT, "research");
const UPDATES_DIR = join(ROOT, "site", "src", "data", "updates");
const OUT_FILE = join(UPDATES_DIR, "latest.json");
const DAILY_DIR = join(UPDATES_DIR, "daily");
const MANIFEST_FILE = join(UPDATES_DIR, "manifest.json");
const MAX_DAILY_ENTRIES = 30;

const date = process.argv[2] || new Date().toISOString().split("T")[0];

// ── Load pipeline outputs ────────────────────────────────────────

console.log(`Preparing updates for ${date}...`);

// 1. Assessor summary
const summary = readJson(join(RESEARCH, "scans", `${date}-assessor-summary.json`));

// 2. Scan results
const scan = readJson(join(RESEARCH, "scans", `${date}.json`));

// 3. Change proposals — read both live and archived
// Live (pending) proposals live in research/change-proposals/
// Applied proposals live in research/change-proposals/history/
// We read both so that evidence stays attached to score-changes
// regardless of whether proposals have been applied yet.
//
// Two schema versions exist in the wild:
//   v1 (pre-2026-04-18): published_scores / proposed_scores / score_delta / key_evidence (strings)
//   v2 (2026-04-18+):    published_score  / proposed_score  / delta        / evidence (objects with note+url)
// normalizeProposal() converts both to the v1 shape used by downstream code.
function normalizeProposal(p) {
  if (!p) return p;
  const out = { ...p };
  if (p.published_score && !p.published_scores) out.published_scores = p.published_score;
  if (p.proposed_score && !p.proposed_scores) out.proposed_scores = p.proposed_score;
  if (typeof p.delta === "number" && typeof p.score_delta !== "number") out.score_delta = p.delta;
  if (Array.isArray(p.evidence) && !Array.isArray(p.key_evidence)) {
    out.key_evidence = p.evidence.map((e) => {
      if (typeof e === "string") return e;
      if (e && typeof e === "object") {
        const note = e.note || e.summary || "";
        return note;
      }
      return "";
    }).filter(Boolean);
  }
  return out;
}

const proposalDir = join(RESEARCH, "change-proposals");
const historyDir = join(proposalDir, "history");
const proposals = [];
if (existsSync(proposalDir)) {
  for (const file of readdirSync(proposalDir).filter((f) => f.endsWith(".json"))) {
    const p = normalizeProposal(readJson(join(proposalDir, file)));
    if (p) proposals.push({ ...p, _file: file });
  }
}
if (existsSync(historyDir)) {
  for (const file of readdirSync(historyDir).filter((f) => f.endsWith(".json"))) {
    // Prefer live over history if both exist for the same slug
    const p = normalizeProposal(readJson(join(historyDir, file)));
    if (p && !proposals.find((x) => x.slug === p.slug)) {
      proposals.push({ ...p, _file: file });
    }
  }
}

// 4. Assessment frontmatter (all assessments)
const assessmentDir = join(RESEARCH, "assessments");
const assessments = [];
if (existsSync(assessmentDir)) {
  for (const file of readdirSync(assessmentDir).filter((f) => f.endsWith(".md"))) {
    const fm = readFrontmatter(join(assessmentDir, file));
    if (fm) assessments.push({ ...fm, slug: basename(file, ".md") });
  }
}

// 5. Digest content (parse key sections)
const digestPath = join(RESEARCH, "digests", `${date}.md`);
let sectorTrends = [];
let emergingRisks = [];
let insights = [];
let highlights = [];

if (existsSync(digestPath)) {
  const digestMd = readFileSync(digestPath, "utf-8");

  // Extract sector trends
  const trendsText = extractSection(digestMd, "Sector Trends");
  const sectorMatches = trendsText.matchAll(/### (.+)\n([\s\S]*?)(?=\n### |$)/g);
  for (const m of sectorMatches) {
    sectorTrends.push({
      sector: m[1].trim(),
      points: extractBullets(m[2]),
    });
  }

  // Extract emerging risks
  const risksText = extractSection(digestMd, "Emerging Risks");
  emergingRisks = extractBullets(risksText);

  // Extract insights
  const insightsText = extractSection(digestMd, "Impacts and Insights");
  insights = extractBullets(insightsText);

  // Extract highlights
  const highlightsText = extractSection(digestMd, "Key Highlights");
  highlights = extractBullets(highlightsText);
}

// ── Build output ─────────────────────────────────────────────────

const scoreChanges = [];
const confirmations = [];

if (summary?.results) {
  for (const r of summary.results) {
    const entry = {
      entity: r.name,
      slug: r.slug,
      index: r.index,
      publishedScore: r.published_composite,
      assessedScore: r.assessed_composite,
      delta: r.delta,
      publishedBand: bandFor(r.published_composite),
      assessedBand: bandFor(r.assessed_composite),
      bandChange: bandFor(r.published_composite) !== bandFor(r.assessed_composite),
      confidence: r.confidence,
      recommendation: r.recommendation,
      headline: r.key_finding,
      date: summary.date,
    };

    if (r.change_proposal) {
      // Find the proposal for additional evidence
      const proposal = proposals.find((p) => p.slug === r.slug);
      if (proposal) {
        entry.evidence = proposal.key_evidence || [];
        entry.status = proposal.status || "pending";
      }
      scoreChanges.push(entry);
    } else {
      confirmations.push(entry);
    }
  }
}

// Add any proposals not in today's summary (from prior runs still pending)
for (const p of proposals) {
  if (p.status === "pending" && !scoreChanges.find((s) => s.slug === p.slug)) {
    scoreChanges.push({
      entity: p.entity,
      slug: p.slug,
      index: p.index,
      publishedScore: p.published_scores?.composite,
      assessedScore: p.proposed_scores?.composite,
      delta: p.score_delta,
      publishedBand: p.published_scores?.band,
      assessedBand: p.proposed_scores?.band,
      bandChange: p.band_change,
      confidence: p.confidence,
      recommendation: p.recommendation,
      headline: p.key_evidence?.[0] || "",
      evidence: p.key_evidence || [],
      status: p.status,
      date: p.assessment_date,
    });
  }
}

const latestOutput = {
  date,
  generatedAt: new Date().toISOString(),
  pipeline: {
    entitiesScanned: scan?.stats?.entities_with_news != null ? 1155 : 0,
    entitiesAssessed: summary?.entities_assessed || 0,
    proposalsGenerated: summary?.change_proposals_generated || 0,
    confirmations: summary?.confirmations || 0,
  },
  scoreChanges,
  confirmations,
  sectorTrends,
  emergingRisks,
  insights,
  highlights,
  recentAssessments: assessments
    .sort((a, b) => (b.date || "").localeCompare(a.date || ""))
    .slice(0, 10)
    .map((a) => ({
      entity: a.entity,
      slug: a.slug,
      type: a.type,
      sector: a.sector,
      date: a.date,
      compositeScore: a.composite_score,
      band: bandFor(a.composite_score),
      dimensions: typeof a.band === "object" ? a.band : null,
      publishedIndex: a.published_index || null,
      publishedComposite: a.published_composite || null,
    })),
  sectorAlerts: scan?.sector_alerts || [],
};

// ── Write outputs ────────────────────────────────────────────────

// 1. latest.json (unchanged behavior)
writeJsonAtomic(OUT_FILE, latestOutput);
console.log(`Wrote ${OUT_FILE}`);

// 2. Daily archive: site/src/data/updates/daily/{date}.json
const dailyFile = join(DAILY_DIR, `${date}.json`);
writeJsonAtomic(dailyFile, latestOutput);
console.log(`Wrote daily archive ${dailyFile}`);

// 3. Update manifest
const existingManifest = readJson(MANIFEST_FILE) || { dates: [] };
const dates = Array.isArray(existingManifest.dates) ? existingManifest.dates : [];

// Add today if not already present
if (!dates.includes(date)) {
  dates.push(date);
}

// Sort newest-first
dates.sort((a, b) => b.localeCompare(a));

// Prune to MAX_DAILY_ENTRIES — delete orphaned daily files
const pruned = dates.splice(MAX_DAILY_ENTRIES);
for (const oldDate of pruned) {
  const oldFile = join(DAILY_DIR, `${oldDate}.json`);
  if (existsSync(oldFile)) {
    unlinkSync(oldFile);
    console.log(`Pruned old daily file ${oldFile}`);
  }
}

const manifest = {
  dates,
  latest: dates[0],
  updatedAt: new Date().toISOString(),
};
writeJsonAtomic(MANIFEST_FILE, manifest);
console.log(`Wrote manifest (${dates.length} dates)`);

console.log(`  Score changes: ${scoreChanges.length}`);
console.log(`  Confirmations: ${confirmations.length}`);
console.log(`  Sector trends: ${sectorTrends.length}`);
console.log(`  Recent assessments: ${latestOutput.recentAssessments.length}`);
