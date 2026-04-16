#!/usr/bin/env node

/**
 * generate-newsletter.mjs — Generates a weekly newsletter from pipeline data.
 *
 * Aggregates daily digests, assessments, and change proposals from the past
 * 7 days into a structured newsletter markdown file ready for distribution.
 *
 * Usage:
 *   node site/scripts/generate-newsletter.mjs               # Current week
 *   node site/scripts/generate-newsletter.mjs 2026-04-21     # Week ending on date
 *
 * Output: research/newsletters/YYYY-MM-DD.md
 *
 * Data sources:
 *   - research/digests/{date}.md — Daily digest markdown
 *   - research/scans/{date}-assessor-summary.json — Daily assessment results
 *   - research/change-proposals/*.json — Score change proposals
 *   - research/assessments/*.md — Full assessment reports (frontmatter)
 *   - research/APPLIED_CHANGES.md — Log of applied score changes
 *   - site/src/data/updates/latest.json — Latest pipeline output
 */

import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync } from "fs";
import { join, basename } from "path";

const ROOT = join(import.meta.dirname, "..", "..");
const RESEARCH = join(ROOT, "research");
const NEWSLETTERS_DIR = join(RESEARCH, "newsletters");
const UPDATES_FILE = join(ROOT, "site", "src", "data", "updates", "latest.json");

// ── Date helpers ────────────────────────────────────────────────

const endDate = process.argv[2] || new Date().toISOString().split("T")[0];

function dateRange(end, days) {
  const dates = [];
  const d = new Date(end + "T12:00:00Z");
  for (let i = 0; i < days; i++) {
    dates.push(new Date(d - i * 86400000).toISOString().split("T")[0]);
  }
  return dates.reverse();
}

function formatDate(d) {
  return new Date(d + "T12:00:00Z").toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// ── Data readers ────────────────────────────────────────────────

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
  for (const line of match[1].split("\n")) {
    if (line.match(/^\s{2}/)) continue; // Skip indented sub-keys
    const kv = line.match(/^([\w_]+)\s*:\s*"?([^"]*)"?\s*$/);
    if (kv) {
      const val = kv[2].trim();
      fm[kv[1]] = val === "" ? null : isNaN(Number(val)) ? val : Number(val);
    }
  }
  return fm;
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
    .map((l) => l.replace(/^- \*\*/, "").replace(/\*\* /, " ").replace(/\*\*/g, "").replace(/^- /, "").trim())
    .filter(Boolean);
}

function bandFor(score) {
  if (score <= 20) return "Critical";
  if (score <= 40) return "Developing";
  if (score <= 60) return "Functional";
  if (score <= 80) return "Established";
  return "Exemplary";
}

// ── Collect weekly data ─────────────────────────────────────────

const weekDates = dateRange(endDate, 7);
const weekStart = weekDates[0];
const weekEnd = weekDates[weekDates.length - 1];

console.log(`Generating newsletter for week of ${weekStart} to ${weekEnd}...`);

// Collect daily summaries
const dailySummaries = [];
for (const d of weekDates) {
  const summary = readJson(join(RESEARCH, "scans", `${d}-assessor-summary.json`));
  if (summary) {
    dailySummaries.push({ date: d, ...summary });
  }
}

// Collect all assessments from the week
const assessmentDir = join(RESEARCH, "assessments");
const weekAssessments = [];
if (existsSync(assessmentDir)) {
  for (const file of readdirSync(assessmentDir).filter((f) => f.endsWith(".md"))) {
    const fm = readFrontmatter(join(assessmentDir, file));
    if (fm && fm.date >= weekStart && fm.date <= weekEnd) {
      weekAssessments.push({ ...fm, slug: basename(file, ".md") });
    }
  }
}

// Collect change proposals
const proposalDir = join(RESEARCH, "change-proposals");
const weekProposals = [];
if (existsSync(proposalDir)) {
  for (const file of readdirSync(proposalDir).filter((f) => f.endsWith(".json"))) {
    const p = readJson(join(proposalDir, file));
    if (p && p.assessment_date >= weekStart && p.assessment_date <= weekEnd) {
      weekProposals.push(p);
    }
  }
}

// Collect digests
const weekDigests = [];
for (const d of weekDates) {
  const digestPath = join(RESEARCH, "digests", `${d}.md`);
  if (existsSync(digestPath)) {
    const md = readFileSync(digestPath, "utf-8");
    weekDigests.push({
      date: d,
      highlights: extractBullets(extractSection(md, "Key Highlights")),
      sectorTrends: extractSection(md, "Sector Trends"),
      emergingRisks: extractBullets(extractSection(md, "Emerging Risks")),
      insights: extractBullets(extractSection(md, "Impacts and Insights")),
    });
  }
}

// Load latest.json for current state
const latest = readJson(UPDATES_FILE);

// ── Compute weekly stats ────────────────────────────────────────

const totalAssessed = weekAssessments.length;
const totalProposals = weekProposals.length;
const totalConfirmations = totalAssessed - totalProposals;
const bandChanges = weekProposals.filter((p) => p.band_change).length;
const avgDelta = weekProposals.length > 0
  ? (weekProposals.reduce((s, p) => s + Math.abs(p.score_delta), 0) / weekProposals.length).toFixed(1)
  : "N/A";

// Sort proposals by absolute delta
const sortedProposals = [...weekProposals].sort(
  (a, b) => Math.abs(b.score_delta) - Math.abs(a.score_delta),
);

// Deduplicate sector trends and risks across the week
const allHighlights = weekDigests.flatMap((d) => d.highlights);
const allRisks = weekDigests.flatMap((d) => d.emergingRisks);
const allInsights = weekDigests.flatMap((d) => d.insights);

// Unique risks (deduplicate by first 50 chars)
const seenRisks = new Set();
const uniqueRisks = allRisks.filter((r) => {
  const key = r.slice(0, 50);
  if (seenRisks.has(key)) return false;
  seenRisks.add(key);
  return true;
});

// ── Generate newsletter markdown ────────────────────────────────

const lines = [];

function emit(line = "") { lines.push(line); }

emit(`# Compassion Benchmark — Weekly Briefing`);
emit();
emit(`**Week of ${formatDate(weekStart)} — ${formatDate(weekEnd)}**`);
emit();
emit(`---`);
emit();

// ── Pipeline summary
emit(`## This Week at a Glance`);
emit();
emit(`| Metric | Value |`);
emit(`|--------|-------|`);
emit(`| Entities assessed | ${totalAssessed} |`);
emit(`| Score changes proposed | ${totalProposals} |`);
emit(`| Scores confirmed | ${totalConfirmations} |`);
emit(`| Band changes | ${bandChanges} |`);
emit(`| Average delta (proposals) | ${avgDelta} |`);
emit(`| Pipeline runs | ${dailySummaries.length} |`);
emit();

// ── Score changes (the headline content)
if (sortedProposals.length > 0) {
  emit(`## Score Changes`);
  emit();
  emit(`The following entities received formal score change proposals this week, listed by magnitude of change.`);
  emit();

  for (const p of sortedProposals) {
    const arrow = p.score_delta < 0 ? "↓" : "↑";
    const bandNote = p.band_change
      ? ` — band change: ${p.published_scores?.band} → ${p.proposed_scores?.band}`
      : "";

    emit(`### ${p.entity} (${p.index}) ${arrow} ${Math.abs(p.score_delta).toFixed(1)} points`);
    emit();
    emit(`**${p.published_scores?.composite} → ${p.proposed_scores?.composite}**${bandNote}`);
    emit(`Confidence: ${p.confidence} | Recommendation: ${p.recommendation}`);
    emit();

    if (p.key_evidence && p.key_evidence.length > 0) {
      emit(`Key evidence:`);
      for (const e of p.key_evidence.slice(0, 3)) {
        emit(`- ${e}`);
      }
      emit();
    }
  }
}

// ── Confirmations
const weekConfirmations = weekAssessments.filter(
  (a) => !weekProposals.find((p) => p.slug === a.slug),
);
if (weekConfirmations.length > 0) {
  emit(`## Scores Confirmed`);
  emit();
  emit(`These entities were assessed and their published scores found to be within tolerance.`);
  emit();
  emit(`| Entity | Index | Published | Assessed | Delta |`);
  emit(`|--------|-------|-----------|----------|-------|`);
  for (const a of weekConfirmations) {
    const delta = a.composite_score - (a.published_composite || a.composite_score);
    emit(`| ${a.entity} | ${a.published_index || "—"} | ${a.published_composite || "—"} | ${a.composite_score} | ${delta >= 0 ? "+" : ""}${delta.toFixed(1)} |`);
  }
  emit();
}

// ── Highlights
if (allHighlights.length > 0) {
  emit(`## Key Findings`);
  emit();
  for (const h of allHighlights.slice(0, 7)) {
    emit(`- ${h}`);
  }
  emit();
}

// ── Emerging risks
if (uniqueRisks.length > 0) {
  emit(`## Emerging Risks`);
  emit();
  emit(`Forward-looking risk signals that may affect future benchmark scores.`);
  emit();
  for (const r of uniqueRisks.slice(0, 5)) {
    emit(`- ${r}`);
  }
  emit();
}

// ── Structural insights
if (allInsights.length > 0) {
  emit(`## Research Insights`);
  emit();
  for (const i of allInsights.slice(0, 5)) {
    emit(`- ${i}`);
  }
  emit();
}

// ── Assessment queue
emit(`## Assessment Progress`);
emit();
const assessed = weekAssessments.length;
emit(`${assessed} entities assessed this week out of 1,155 total in the benchmark.`);
if (latest?.recentAssessments) {
  emit(`${latest.recentAssessments.length} assessments completed to date.`);
}
emit();

// ── Footer
emit(`---`);
emit();
emit(`**Compassion Benchmark** measures how institutions recognize, respond to, and reduce suffering.`);
emit();
emit(`- [View daily findings](https://compassionbenchmark.com/updates)`);
emit(`- [Explore all indexes](https://compassionbenchmark.com/indexes)`);
emit(`- [Purchase research](https://compassionbenchmark.com/purchase-research)`);
emit(`- [Methodology](https://compassionbenchmark.com/methodology)`);
emit();
emit(`This briefing is auto-generated from overnight pipeline research. All findings are evidence-linked and independently produced.`);
emit();
emit(`*You received this because you subscribed at compassionbenchmark.com. [Unsubscribe](#)*`);

// ── Write output ────────────────────────────────────────────────

if (!existsSync(NEWSLETTERS_DIR)) {
  mkdirSync(NEWSLETTERS_DIR, { recursive: true });
}

const outPath = join(NEWSLETTERS_DIR, `${weekEnd}.md`);
writeFileSync(outPath, lines.join("\n"));

console.log(`\nNewsletter generated: ${outPath}`);
console.log(`  Assessments: ${totalAssessed}`);
console.log(`  Score changes: ${totalProposals}`);
console.log(`  Confirmations: ${totalConfirmations}`);
console.log(`  Band changes: ${bandChanges}`);
console.log(`  Highlights: ${allHighlights.length}`);
console.log(`  Risks: ${uniqueRisks.length}`);
