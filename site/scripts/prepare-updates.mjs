#!/usr/bin/env node

/**
 * Transforms overnight pipeline outputs into website-consumable JSON.
 * Reads from research/ and writes to site/src/data/updates/latest.json.
 *
 * Usage: node site/scripts/prepare-updates.mjs [YYYY-MM-DD]
 *        Defaults to today's date if not specified.
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from "fs";
import { join, basename } from "path";

const ROOT = join(import.meta.dirname, "..", "..");
const RESEARCH = join(ROOT, "research");
const OUT_FILE = join(ROOT, "site", "src", "data", "updates", "latest.json");

const date = process.argv[2] || new Date().toISOString().split("T")[0];

// ── Helpers ──────────────────────────────────────────────────────

function readJson(path) {
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf-8"));
}

function readFrontmatter(path) {
  if (!existsSync(path)) return null;
  const content = readFileSync(path, "utf-8");
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;

  const fm = {};
  const lines = match[1].split("\n");
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    // Indented line (part of a sub-object) — skip, handled by parent
    if (line.match(/^\s{2}/)) { i++; continue; }
    // Top-level key: value
    const kv = line.match(/^([\w_]+)\s*:\s*"?([^"]*)"?\s*$/);
    if (!kv) { i++; continue; }
    const key = kv[1];
    const rawVal = kv[2].trim();

    // Check if next lines are indented (sub-object)
    if (i + 1 < lines.length && lines[i + 1].match(/^\s{2}\w/)) {
      const sub = {};
      i++;
      while (i < lines.length && lines[i].match(/^\s{2}/)) {
        const sm = lines[i].match(/^\s{2}([\w_]+)\s*:\s*(.+)/);
        if (sm) {
          const sv = sm[2].trim().replace(/^"|"$/g, "");
          sub[sm[1]] = isNaN(Number(sv)) || sv === "" ? sv : Number(sv);
        }
        i++;
      }
      fm[key] = sub;
    } else {
      fm[key] = rawVal === "" ? null : (isNaN(Number(rawVal)) ? rawVal : Number(rawVal));
      i++;
    }
  }
  return fm;
}

function bandFor(score) {
  if (score <= 20) return "Critical";
  if (score <= 40) return "Developing";
  if (score <= 60) return "Functional";
  if (score <= 80) return "Established";
  return "Exemplary";
}

function extractSection(md, heading) {
  const regex = new RegExp(`## ${heading}\\n+([\\s\\S]*?)(?=\\n## |$)`);
  const match = md.match(regex);
  return match ? match[1].trim() : "";
}

function extractBullets(text) {
  return text
    .split("\n")
    .filter((l) => l.startsWith("- "))
    .map((l) => l.replace(/^- \*\*/, "").replace(/\*\*$/, "").replace(/^- /, "").trim());
}

// ── Load pipeline outputs ────────────────────────────────────────

console.log(`Preparing updates for ${date}...`);

// 1. Assessor summary
const summary = readJson(join(RESEARCH, "scans", `${date}-assessor-summary.json`));

// 2. Scan results
const scan = readJson(join(RESEARCH, "scans", `${date}.json`));

// 3. Change proposals (all pending)
const proposalDir = join(RESEARCH, "change-proposals");
const proposals = [];
if (existsSync(proposalDir)) {
  for (const file of readdirSync(proposalDir).filter((f) => f.endsWith(".json"))) {
    const p = readJson(join(proposalDir, file));
    if (p) proposals.push({ ...p, _file: file });
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

const latest = {
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

writeFileSync(OUT_FILE, JSON.stringify(latest, null, 2));
console.log(`Wrote ${OUT_FILE}`);
console.log(`  Score changes: ${scoreChanges.length}`);
console.log(`  Confirmations: ${confirmations.length}`);
console.log(`  Sector trends: ${sectorTrends.length}`);
console.log(`  Recent assessments: ${latest.recentAssessments.length}`);
