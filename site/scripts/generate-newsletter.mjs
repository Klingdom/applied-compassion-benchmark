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
 * Output:
 *   - research/newsletters/YYYY-MM-DD.md       (markdown for distribution)
 *   - site/src/data/updates/weekly/YYYY-MM-DD.json  (structured JSON for web)
 *
 * Note: The end date defaults to the local machine date at time of execution.
 * If running from a different timezone than your data, pass an explicit date.
 *
 * Data sources:
 *   - research/digests/{date}.md — Daily digest markdown
 *   - research/scans/{date}-assessor-summary.json — Daily assessment results
 *   - research/change-proposals/*.json — Score change proposals
 *   - research/assessments/*.md — Full assessment reports (frontmatter)
 *   - site/src/data/updates/latest.json — Latest pipeline output
 */

import { readFileSync, existsSync, readdirSync, mkdirSync } from "fs";
import { join, basename } from "path";
import {
  readJson,
  readFrontmatter,
  extractSection,
  extractBullets,
  bandFor,
  dedup,
  CHANGE_THRESHOLD,
  writeJsonAtomic,
  writeTextAtomic,
  appendJsonl,
} from "./lib/pipeline-reader.mjs";

const ROOT = join(import.meta.dirname, "..", "..");
const RESEARCH = join(ROOT, "research");
const NEWSLETTERS_DIR = join(RESEARCH, "newsletters");
const WEEKLY_JSON_DIR = join(ROOT, "site", "src", "data", "updates", "weekly");
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

function shortDateRange(start, end) {
  const s = new Date(start + "T12:00:00Z");
  const e = new Date(end + "T12:00:00Z");
  const sMonth = s.toLocaleDateString("en-US", { month: "short" });
  const eMonth = e.toLocaleDateString("en-US", { month: "short" });
  const sDay = s.getUTCDate();
  const eDay = e.getUTCDate();
  if (sMonth === eMonth) return `${sMonth} ${sDay}–${eDay}`;
  return `${sMonth} ${sDay} – ${eMonth} ${eDay}`;
}

// ── Load overrides (editorial control) ──────────────────────────

function loadOverrides(weekEnd) {
  const path = join(NEWSLETTERS_DIR, `${weekEnd}-overrides.json`);
  const data = readJson(path);
  return {
    excludeSlugs: data?.excludeSlugs || [],
    editorNote: data?.editorNote || null,
  };
}

// ── Collect weekly data ─────────────────────────────────────────

const weekDates = dateRange(endDate, 7);
const weekStart = weekDates[0];
const weekEnd = weekDates[weekDates.length - 1];
const overrides = loadOverrides(weekEnd);

console.log(`Generating newsletter for week of ${weekStart} to ${weekEnd}...`);
if (overrides.excludeSlugs.length > 0) {
  console.log(`  Excluding slugs: ${overrides.excludeSlugs.join(", ")}`);
}

// Collect daily summaries (pipeline run metadata)
const dailySummaries = [];
for (const d of weekDates) {
  const summary = readJson(join(RESEARCH, "scans", `${d}-assessor-summary.json`));
  if (summary) dailySummaries.push({ date: d, ...summary });
}

// Collect all assessments from the week
const assessmentDir = join(RESEARCH, "assessments");
const weekAssessments = [];
if (existsSync(assessmentDir)) {
  for (const file of readdirSync(assessmentDir).filter((f) => f.endsWith(".md"))) {
    const fm = readFrontmatter(join(assessmentDir, file));
    if (fm && fm.date >= weekStart && fm.date <= weekEnd) {
      const slug = basename(file, ".md");
      if (!overrides.excludeSlugs.includes(slug)) {
        weekAssessments.push({ ...fm, slug });
      }
    }
  }
}

// Collect change proposals (exclude overridden slugs)
const proposalDir = join(RESEARCH, "change-proposals");
const weekProposals = [];
if (existsSync(proposalDir)) {
  for (const file of readdirSync(proposalDir).filter((f) => f.endsWith(".json"))) {
    const p = readJson(join(proposalDir, file));
    // Include proposals assessed this week. Exclude only if applied BEFORE this week
    // (i.e., stale proposals from prior weeks that have since been resolved).
    // Proposals assessed and applied within the same week are newsworthy.
    const isStaleApplied = p?.status === "applied" && p?.applied_date < weekStart;
    const isRejected = p?.status === "rejected";
    if (p && p.assessment_date >= weekStart && p.assessment_date <= weekEnd
        && !isStaleApplied && !isRejected) {
      if (!overrides.excludeSlugs.includes(p.slug)) {
        weekProposals.push(p);
      }
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

// Confirmations: assessed entities that did NOT get a change proposal
const weekConfirmations = weekAssessments.filter(
  (a) => !weekProposals.find((p) => p.slug === a.slug),
);

const totalAssessed = weekAssessments.length;
const totalProposals = weekProposals.length;
const totalConfirmations = weekConfirmations.length;
const upgrades = weekProposals.filter((p) => p.score_delta > 0).length;
const downgrades = weekProposals.filter((p) => p.score_delta < 0).length;
const bandChanges = weekProposals.filter((p) => p.band_change).length;
const avgDelta = weekProposals.length > 0
  ? (weekProposals.reduce((s, p) => s + Math.abs(p.score_delta), 0) / weekProposals.length).toFixed(1)
  : "N/A";

// Entity count from data, not hardcoded
const entityCount = latest?.pipeline?.entitiesScanned || 1155;

// Sort proposals by absolute delta
const sortedProposals = [...weekProposals].sort(
  (a, b) => Math.abs(b.score_delta) - Math.abs(a.score_delta),
);

// Aggregate and deduplicate content across the week
const allHighlights = weekDigests.flatMap((d) => d.highlights);
const allRisks = weekDigests.flatMap((d) => d.emergingRisks);
const allInsights = weekDigests.flatMap((d) => d.insights);

const uniqueFindings = dedup([...allHighlights, ...allInsights]);
const uniqueRisks = dedup(allRisks);

// Count distinct indexes assessed
const indexSet = new Set(weekAssessments.map((a) => a.published_index || a.index));
const indexCount = indexSet.size;

// ── Empty week guard ────────────────────────────────────────────

if (totalAssessed === 0 && weekDigests.length === 0) {
  console.warn(`\n⚠ No pipeline activity found for ${weekStart} to ${weekEnd}.`);
  console.warn(`  Check that the date range is correct and pipeline data exists.\n`);
}

// ── Generate weekly JSON ────────────────────────────────────────

const weeklyData = {
  weekStart,
  weekEnd,
  generatedAt: new Date().toISOString(),
  dailyRuns: dailySummaries.map((s) => s.date),
  excludedSlugs: overrides.excludeSlugs,
  stats: {
    entitiesAssessed: totalAssessed,
    proposalsGenerated: totalProposals,
    confirmations: totalConfirmations,
    upgrades,
    downgrades,
    bandChanges,
    avgDelta: avgDelta === "N/A" ? null : Number(avgDelta),
    pipelineRuns: dailySummaries.length,
    entityCount,
    indexesAssessed: indexCount,
  },
  scoreChanges: sortedProposals.map((p) => ({
    entity: p.entity,
    slug: p.slug,
    index: p.index,
    publishedScore: p.published_scores?.composite,
    proposedScore: p.proposed_scores?.composite,
    delta: p.score_delta,
    publishedBand: p.published_scores?.band,
    proposedBand: p.proposed_scores?.band,
    bandChange: p.band_change || false,
    confidence: p.confidence,
    recommendation: p.recommendation,
    evidence: (p.key_evidence || []).slice(0, 2),
  })),
  confirmations: weekConfirmations.map((a) => ({
    entity: a.entity,
    slug: a.slug,
    index: a.published_index || a.index || null,
    publishedScore: a.published_composite ?? null,
    assessedScore: a.composite_score,
    delta: a.published_composite != null
      ? Number((a.composite_score - a.published_composite).toFixed(1))
      : null,
  })),
  findings: uniqueFindings.slice(0, 5),
  signals: uniqueRisks.slice(0, 3),
};

const jsonOutPath = join(WEEKLY_JSON_DIR, `${weekEnd}.json`);
writeJsonAtomic(jsonOutPath, weeklyData);

// ── Generate newsletter markdown ────────────────────────────────

const lines = [];
function emit(line = "") { lines.push(line); }

emit(`# Compassion Benchmark — Weekly Briefing`);
emit();
emit(`**${shortDateRange(weekStart, weekEnd)}, ${new Date(weekEnd + "T12:00:00Z").getUTCFullYear()}**`);
emit();
emit(`---`);
emit();

// ── Editor's note (if present in overrides)
if (overrides.editorNote) {
  emit(`*${overrides.editorNote}*`);
  emit();
}

// ── Orienting paragraph (the hook)
const changeDirection = downgrades > 0 && upgrades === 0
  ? `all downgrades`
  : upgrades > 0 && downgrades === 0
    ? `all upgrades`
    : `${upgrades} upgrade${upgrades !== 1 ? "s" : ""}, ${downgrades} downgrade${downgrades !== 1 ? "s" : ""}`;

if (totalAssessed > 0) {
  let hook = `This week the Compassion Benchmark assessed ${totalAssessed} entit${totalAssessed === 1 ? "y" : "ies"} across ${indexCount} index${indexCount === 1 ? "" : "es"}.`;

  if (totalProposals > 0) {
    hook += ` ${totalProposals} score-change proposal${totalProposals !== 1 ? "s were" : " was"} issued — ${changeDirection}`;
    if (bandChanges > 0) {
      hook += `, including ${bandChanges} band change${bandChanges !== 1 ? "s" : ""}`;
    }
    hook += ".";
  } else {
    hook += " All published scores were confirmed within tolerance.";
  }

  if (totalConfirmations > 0) {
    hook += ` ${totalConfirmations} published score${totalConfirmations !== 1 ? "s were" : " was"} confirmed.`;
  }

  emit(hook);
} else {
  emit(`No pipeline assessments were completed during this period.`);
}
emit();

// ── Score changes (headline content — comes first)
if (sortedProposals.length > 0) {
  emit(`## Score Changes`);
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
      for (const e of p.key_evidence.slice(0, 2)) {
        emit(`- ${e}`);
      }
      emit();
    }
  }

  // Purchase CTA after score changes
  emit(`*Full assessment reports with dimension-level scoring, evidence citations, and methodology notes are available at [compassionbenchmark.com/purchase-research](https://compassionbenchmark.com/purchase-research).*`);
  emit();
}

// ── Confirmations
if (weekConfirmations.length > 0) {
  emit(`## Scores Confirmed`);
  emit();
  emit(`These entities were assessed and their published scores confirmed within the ${CHANGE_THRESHOLD}-point change threshold. Deltas below this threshold indicate the published score remains an accurate reflection of current evidence.`);
  emit();

  for (const a of weekConfirmations) {
    const published = a.published_composite;
    const assessed = a.composite_score;
    if (published != null) {
      const delta = assessed - published;
      emit(`- **${a.entity}** (${a.published_index || a.index || "—"}): published ${published}, assessed ${assessed} (${delta >= 0 ? "+" : ""}${delta.toFixed(1)})`);
    } else {
      emit(`- **${a.entity}** (${a.published_index || a.index || "—"}): assessed ${assessed}`);
    }
  }
  emit();
}

// ── Findings (merged Key Findings + Research Insights)
if (uniqueFindings.length > 0) {
  emit(`## Findings`);
  emit();
  for (const f of uniqueFindings.slice(0, 5)) {
    emit(`- ${f}`);
  }
  emit();
}

// ── Signals (forward-looking risks)
if (uniqueRisks.length > 0) {
  emit(`## Signals`);
  emit();
  emit(`Forward-looking risk signals that may affect future benchmark scores.`);
  emit();
  for (const r of uniqueRisks.slice(0, 3)) {
    emit(`- ${r}`);
  }
  emit();
}

// ── Assessment progress (stats table at bottom)
emit(`## Assessment Progress`);
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
emit(`${totalAssessed} entit${totalAssessed === 1 ? "y" : "ies"} assessed this week out of ${entityCount.toLocaleString()} total in the benchmark.`);
emit();

// ── Footer
emit(`---`);
emit();
emit(`Scores reflect the 8-dimension, 40-subdimension [Compassion Framework](https://compassionbenchmark.com/methodology). Entities never pay for inclusion, score changes, or suppression of findings.`);
emit();
emit(`- [View daily findings](https://compassionbenchmark.com/updates)`);
emit(`- [Explore all indexes](https://compassionbenchmark.com/indexes)`);
emit(`- [Purchase research](https://compassionbenchmark.com/purchase-research)`);
emit(`- [Methodology](https://compassionbenchmark.com/methodology)`);
emit();
emit(`This briefing is auto-generated from overnight pipeline research. All findings are evidence-linked and independently produced.`);
emit();
emit(`*You received this because you subscribed at compassionbenchmark.com. [Unsubscribe](#)*`);

// ── Write markdown output ───────────────────────────────────────

const mdOutPath = join(NEWSLETTERS_DIR, `${weekEnd}.md`);
writeTextAtomic(mdOutPath, lines.join("\n"));

// ── Generate subject line suggestion ────────────────────────────

const entityNames = sortedProposals.slice(0, 3).map((p) => p.entity).join(", ");
const changeLabel = downgrades > 0 && upgrades === 0
  ? `${totalProposals} downgrade${totalProposals !== 1 ? "s" : ""}`
  : upgrades > 0 && downgrades === 0
    ? `${totalProposals} upgrade${totalProposals !== 1 ? "s" : ""}`
    : `${upgrades} up, ${downgrades} down`;
const subjectLine = totalProposals > 0
  ? `Compassion Benchmark | ${shortDateRange(weekStart, weekEnd)}: ${changeLabel}${bandChanges > 0 ? `, ${bandChanges} band change${bandChanges !== 1 ? "s" : ""}` : ""} — ${entityNames}`
  : `Compassion Benchmark | ${shortDateRange(weekStart, weekEnd)}: ${totalAssessed} assessed, all scores confirmed`;

console.log(`\nNewsletter generated:`);
console.log(`  Markdown: ${mdOutPath}`);
console.log(`  JSON:     ${jsonOutPath}`);
console.log(`  Assessments: ${totalAssessed}`);
console.log(`  Score changes: ${totalProposals} (${upgrades} up, ${downgrades} down)`);
console.log(`  Confirmations: ${totalConfirmations}`);
console.log(`  Band changes: ${bandChanges}`);
console.log(`  Findings: ${uniqueFindings.length}`);
console.log(`  Signals: ${uniqueRisks.length}`);
console.log(`\n  Suggested subject line:\n  ${subjectLine}`);
