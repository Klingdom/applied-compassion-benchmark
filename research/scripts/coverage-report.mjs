#!/usr/bin/env node
/**
 * coverage-report.mjs — coverage/freshness report over research/rotation-state.json
 *
 * Purpose (2026-09-16 founder-approved task, item U-1; PR/FAQ items U and E;
 * reduces RISKS.md RISK-001 / RISK-016): produce a repeatable, committed
 * snapshot of how much of the tracked catalog has ever been individually
 * assessed, how fresh that assessment is, and whether the tracked catalog
 * (research/rotation-state.json) still agrees with the published catalog
 * (site/src/data/indexes/*.json). This has previously only existed as a
 * one-off manual grep (see docs/GRANT_REQUEST_2026-09-14.md, RISKS.md
 * RISK-001) — this script makes the same measurement mechanical and
 * re-runnable, and defines every metric inline so a reader never has to
 * guess what was counted.
 *
 * REPORT-ONLY. This script never writes to research/rotation-state.json,
 * site/src/data/indexes/*.json, or research/change-proposals/*.json — it
 * only reads them and emits a new, separate, dated report.
 *
 * Definitions (also restated in the generated report):
 *   - "tracked" entity        — has an entry in research/rotation-state.json.
 *   - "published/scored" entity — counted in a site/src/data/indexes/*.json
 *                                 file's `rankings` array.
 *   - "never individually assessed" — `last_assessed` is `null` in
 *     rotation-state. Its score is an inherited starting value, not a
 *     measurement (see also site/src/app/methodology/page.tsx).
 *   - "assessed within N days" — `last_assessed` is non-null and the number
 *     of whole days between the report date and `last_assessed` is <= N.
 *     Windows are cumulative (an entity within 30 days is also counted
 *     within 60 and 90), not mutually exclusive bins.
 *   - "assessment age" — whole days between the report date and
 *     `last_assessed`, computed only over ever-assessed entities (non-null).
 *   - "never scanned" — `last_scanned` is `null`.
 *   - "pending change proposals" — the number of files in
 *     research/change-proposals/*.json whose top-level `status` field is
 *     exactly the string "pending". This is a directory count taken fresh
 *     each run, never an increment carried from a prior report (per
 *     decision D-11 — a rolling counter can drift from what is actually on
 *     disk; a directory count cannot).
 *
 * Usage:
 *   node research/scripts/coverage-report.mjs                  (report date = today, UTC)
 *   node research/scripts/coverage-report.mjs 2026-09-16       (explicit report date)
 *   node research/scripts/coverage-report.mjs --date 2026-09-16
 *
 * Writes (report-date-named, so re-running for the same date overwrites
 * deterministically and re-running for a new date never touches old ones):
 *   research/coverage/<date>.md
 *   research/coverage/<date>.json
 *
 * Exit codes:
 *   0 — report generated (mismatches / never-assessed volume are reported,
 *       not treated as failures — this script observes, it does not gate).
 *   1 — schema drift detected (missing `entities`, unknown index slug,
 *       unparseable date) — fails loud rather than silently reporting a
 *       zero or skipping the offending entity.
 *
 * The pure computation (buildCoverageReport) and rendering (renderMarkdown)
 * are exported for research/scripts/test-coverage-report.mjs, which exercises
 * them against in-memory fixtures without touching disk.
 */

import { readFileSync, existsSync, readdirSync, mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
// research/scripts/ -> research/ -> repo root
export const REPO_ROOT = resolve(__dirname, "..", "..");

export const ROTATION_PATH = join(REPO_ROOT, "research", "rotation-state.json");
export const INDEXES_DIR = join(REPO_ROOT, "site", "src", "data", "indexes");
export const PROPOSALS_DIR = join(REPO_ROOT, "research", "change-proposals");
export const REPORT_DIR = join(REPO_ROOT, "research", "coverage");

/**
 * The 8 published index slugs, mapped to their published-catalog file. This
 * is the same slug set as site/src/lib/entityHref.ts's KIND_TABLE
 * (indexSlug values) and site/src/data/indexRegistry.ts's DISPLAY_ORDER —
 * duplicated here in plain JS because research/scripts runs outside the
 * Next.js/TypeScript build. Any rotation-state entity whose `index` field is
 * not one of these keys is schema drift and fails loud (see
 * assertKnownIndexSlug below) rather than being silently dropped from the
 * per-index breakdown.
 */
export const KNOWN_INDEX_FILES = {
  countries: "countries.json",
  "us-states": "us-states.json",
  "fortune-500": "fortune-500.json",
  "ai-labs": "ai-labs.json",
  "robotics-labs": "robotics-labs.json",
  "us-cities": "us-cities.json",
  "global-cities": "global-cities.json",
  universities: "universities.json",
};

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Parses a YYYY-MM-DD string into a UTC midnight Date. Throws (fail loud)
 * rather than returning an invalid/NaN date or silently treating it as null
 * — an unparseable date is schema drift, not an absence of data (absence is
 * represented by the JSON value `null`, which callers must check first).
 */
export function parseISODateStrict(value, context) {
  if (typeof value !== "string" || !DATE_RE.test(value)) {
    throw new Error(
      `coverage-report: unparseable date ${JSON.stringify(value)} (${context}) — expected YYYY-MM-DD`,
    );
  }
  const dt = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(dt.getTime())) {
    throw new Error(`coverage-report: unparseable date ${JSON.stringify(value)} (${context})`);
  }
  return dt;
}

/** Whole days between two UTC-midnight Dates (a - b), rounded. */
function daysBetween(a, b) {
  return Math.round((a.getTime() - b.getTime()) / 86400000);
}

/** Median of a sorted-in-place-safe numeric array. Returns null if empty. */
function median(values) {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function pct(n, total) {
  if (total === 0) return "0.0%";
  return `${((n / total) * 100).toFixed(1)}%`;
}

/**
 * Computes freshness/coverage stats for one population of rotation-state
 * entities (either "all entities" or one index's entities), relative to
 * reportDateObj. Every field here is one of the metrics defined at the top
 * of this file.
 */
function computeStatsForPopulation(entities, reportDateObj, contextLabel) {
  let neverAssessed = 0;
  let within30 = 0;
  let within60 = 0;
  let within90 = 0;
  const ages = [];
  let neverScanned = 0;
  const scannedDates = [];

  for (const [slug, e] of entities) {
    if (e.last_assessed === null || e.last_assessed === undefined) {
      neverAssessed++;
    } else {
      const assessedDate = parseISODateStrict(
        e.last_assessed,
        `${contextLabel} entity "${slug}".last_assessed`,
      );
      const age = daysBetween(reportDateObj, assessedDate);
      ages.push(age);
      if (age <= 30) within30++;
      if (age <= 60) within60++;
      if (age <= 90) within90++;
    }

    if (e.last_scanned === null || e.last_scanned === undefined) {
      neverScanned++;
    } else {
      scannedDates.push(
        parseISODateStrict(e.last_scanned, `${contextLabel} entity "${slug}".last_scanned`),
      );
    }
  }

  const total = entities.length;
  scannedDates.sort((a, b) => a.getTime() - b.getTime());

  return {
    total,
    neverAssessed,
    neverAssessedShare: pct(neverAssessed, total),
    assessedWithin30: within30,
    assessedWithin60: within60,
    assessedWithin90: within90,
    medianAssessmentAgeDays: median(ages),
    oldestAssessmentAgeDays: ages.length ? Math.max(...ages) : null,
    everAssessedCount: ages.length,
    neverScanned,
    neverScannedShare: pct(neverScanned, total),
    oldestLastScanned: scannedDates.length ? scannedDates[0].toISOString().slice(0, 10) : null,
    newestLastScanned: scannedDates.length
      ? scannedDates[scannedDates.length - 1].toISOString().slice(0, 10)
      : null,
  };
}

/**
 * Pure computation over already-loaded data. Takes no filesystem
 * dependency, so tests can pass in-memory fixtures directly.
 *
 * @param {object} rotation - parsed research/rotation-state.json
 * @param {Record<string, number>} publishedCountsByIndex - indexSlug -> rankings.length,
 *   from site/src/data/indexes/<slug>.json
 * @param {number} pendingChangeProposalCount - count of change-proposal files with status "pending"
 * @param {string} reportDateStr - YYYY-MM-DD
 */
export function buildCoverageReport(rotation, publishedCountsByIndex, pendingChangeProposalCount, reportDateStr) {
  if (rotation === null || typeof rotation !== "object" || Array.isArray(rotation)) {
    throw new Error("coverage-report: rotation-state root is not an object");
  }
  if (rotation.entities === null || rotation.entities === undefined || typeof rotation.entities !== "object" || Array.isArray(rotation.entities)) {
    throw new Error(
      "coverage-report: rotation-state is missing an `entities` object — schema drift, refusing to report zero",
    );
  }

  const reportDateObj = parseISODateStrict(reportDateStr, "report date argument");

  const allEntries = Object.entries(rotation.entities);

  // ── Schema drift guard: every entity's `index` must be a known slug ──────
  const entriesByIndex = new Map();
  for (const [slug, e] of allEntries) {
    if (!(e.index in KNOWN_INDEX_FILES)) {
      throw new Error(
        `coverage-report: entity "${slug}" has unknown index slug "${e.index}" — ` +
          `expected one of: ${Object.keys(KNOWN_INDEX_FILES).join(", ")}. This is schema drift ` +
          `(a new index was added to rotation-state but not to KNOWN_INDEX_FILES in this script, ` +
          `or the entity's index field is corrupt) — refusing to silently drop it from the per-index breakdown.`,
      );
    }
    if (!entriesByIndex.has(e.index)) entriesByIndex.set(e.index, []);
    entriesByIndex.get(e.index).push([slug, e]);
  }

  const overall = computeStatsForPopulation(allEntries, reportDateObj, "overall");

  const perIndex = {};
  const mismatches = [];
  for (const indexSlug of Object.keys(KNOWN_INDEX_FILES)) {
    const entities = entriesByIndex.get(indexSlug) ?? [];
    const stats = computeStatsForPopulation(entities, reportDateObj, `index "${indexSlug}"`);
    const publishedCount = publishedCountsByIndex[indexSlug];
    if (publishedCount === undefined) {
      throw new Error(
        `coverage-report: no published count supplied for index "${indexSlug}" — ` +
          `expected site/src/data/indexes/${KNOWN_INDEX_FILES[indexSlug]} to be loaded and passed in publishedCountsByIndex.`,
      );
    }
    const mismatch = stats.total !== publishedCount;
    if (mismatch) {
      mismatches.push({
        index: indexSlug,
        trackedInRotationState: stats.total,
        publishedInIndexJson: publishedCount,
        delta: stats.total - publishedCount,
      });
    }
    perIndex[indexSlug] = { ...stats, publishedInIndexJson: publishedCount, mismatch };
  }

  const totalPublished = Object.values(publishedCountsByIndex).reduce((sum, n) => sum + n, 0);

  return {
    reportDate: reportDateStr,
    totalTrackedEntities: allEntries.length,
    totalPublishedEntities: totalPublished,
    totalTrackedVsPublishedMismatch: allEntries.length !== totalPublished,
    perIndexMismatches: mismatches,
    overall,
    perIndex,
    pendingChangeProposalCount,
  };
}

/** Renders the report object as Markdown. Deterministic — no wall-clock timestamps beyond reportDate. */
export function renderMarkdown(report) {
  const lines = [];
  const r = report;

  lines.push(`# Coverage and freshness report — ${r.reportDate}`);
  lines.push("");
  lines.push(
    "Generated by `research/scripts/coverage-report.mjs` from `research/rotation-state.json` " +
      "and `site/src/data/indexes/*.json`. Report-only — this script does not modify either source.",
  );
  lines.push("");
  lines.push("## Definitions");
  lines.push("");
  lines.push("- **Tracked entity** — has an entry in `research/rotation-state.json`.");
  lines.push(
    "- **Published/scored entity** — counted in a `site/src/data/indexes/*.json` file's `rankings` array.",
  );
  lines.push(
    "- **Never individually assessed** — `last_assessed` is `null` in rotation-state. Its published score is " +
      "an inherited starting value, not a measurement.",
  );
  lines.push(
    "- **Assessed within N days** — `last_assessed` is non-null and the report date is at most N whole days " +
      "after it. Windows are cumulative (30/60/90 overlap), not mutually exclusive bins.",
  );
  lines.push(
    "- **Assessment age** — whole days between the report date and `last_assessed`, computed only over " +
      "ever-assessed entities.",
  );
  lines.push("- **Never scanned** — `last_scanned` is `null`.");
  lines.push(
    "- **Pending change proposals** — files in `research/change-proposals/*.json` with top-level `status: \"pending\"`, " +
      "a fresh directory count each run (never a carried increment).",
  );
  lines.push("");

  lines.push("## Totals");
  lines.push("");
  lines.push(`- Total tracked entities (rotation-state): **${r.totalTrackedEntities}**`);
  lines.push(`- Total published/scored entities (sum of \`rankings.length\` across all 8 index JSON files): **${r.totalPublishedEntities}**`);
  if (r.totalTrackedVsPublishedMismatch) {
    lines.push(
      `- **MISMATCH FLAGGED:** tracked total (${r.totalTrackedEntities}) does not equal published total (${r.totalPublishedEntities}). ` +
        `See per-index mismatches below.`,
    );
  } else {
    lines.push("- Tracked total matches published total. No mismatch.");
  }
  lines.push("");

  lines.push("## Never individually assessed");
  lines.push("");
  lines.push(
    `- ${r.overall.neverAssessed} of ${r.overall.total} tracked entities (${r.overall.neverAssessedShare}) ` +
      "have never been individually assessed (`last_assessed` is `null`).",
  );
  lines.push("");

  lines.push("## Assessed within N days of the report date");
  lines.push("");
  lines.push(`- Within 30 days: **${r.overall.assessedWithin30}** of ${r.overall.total} (${pct(r.overall.assessedWithin30, r.overall.total)})`);
  lines.push(`- Within 60 days: **${r.overall.assessedWithin60}** of ${r.overall.total} (${pct(r.overall.assessedWithin60, r.overall.total)})`);
  lines.push(`- Within 90 days: **${r.overall.assessedWithin90}** of ${r.overall.total} (${pct(r.overall.assessedWithin90, r.overall.total)})`);
  lines.push("");

  lines.push("## Assessment age (ever-assessed entities only)");
  lines.push("");
  lines.push(`- Ever-assessed entities: ${r.overall.everAssessedCount} of ${r.overall.total}`);
  lines.push(`- Median assessment age: **${r.overall.medianAssessmentAgeDays ?? "n/a"} days**`);
  lines.push(`- Oldest assessment age: **${r.overall.oldestAssessmentAgeDays ?? "n/a"} days**`);
  lines.push("");

  lines.push("## Scan coverage");
  lines.push("");
  lines.push(`- Never scanned (\`last_scanned\` is \`null\`): **${r.overall.neverScanned}** of ${r.overall.total} (${r.overall.neverScannedShare})`);
  lines.push(
    `- \`last_scanned\` date range among scanned entities: ${r.overall.oldestLastScanned ?? "n/a"} to ${r.overall.newestLastScanned ?? "n/a"}`,
  );
  lines.push("");

  lines.push("## Pending change proposals");
  lines.push("");
  lines.push(
    `- **${r.pendingChangeProposalCount}** files in \`research/change-proposals/\` currently have \`status: "pending"\`.`,
  );
  lines.push("");

  lines.push("## Per-index breakdown");
  lines.push("");
  lines.push(
    "| Index | Tracked | Published | Mismatch | Never assessed | Share | ≤30d | ≤60d | ≤90d | Median age | Oldest age | Never scanned |",
  );
  lines.push("|---|---:|---:|:---:|---:|---:|---:|---:|---:|---:|---:|---:|");
  for (const indexSlug of Object.keys(KNOWN_INDEX_FILES)) {
    const s = r.perIndex[indexSlug];
    lines.push(
      `| ${indexSlug} | ${s.total} | ${s.publishedInIndexJson} | ${s.mismatch ? "**YES**" : "no"} | ` +
        `${s.neverAssessed} | ${s.neverAssessedShare} | ${s.assessedWithin30} | ${s.assessedWithin60} | ${s.assessedWithin90} | ` +
        `${s.medianAssessmentAgeDays ?? "n/a"} | ${s.oldestAssessmentAgeDays ?? "n/a"} | ${s.neverScanned} |`,
    );
  }
  lines.push("");

  if (r.perIndexMismatches.length > 0) {
    lines.push("## Flagged mismatches (tracked vs. published)");
    lines.push("");
    for (const m of r.perIndexMismatches) {
      lines.push(
        `- **${m.index}**: rotation-state tracks ${m.trackedInRotationState}, ` +
          `\`site/src/data/indexes/${KNOWN_INDEX_FILES[m.index]}\` publishes ${m.publishedInIndexJson} ` +
          `(delta ${m.delta > 0 ? "+" : ""}${m.delta}).`,
      );
    }
    lines.push("");
  }

  return lines.join("\n");
}

// ─── CLI ─────────────────────────────────────────────────────────────────────

function loadPublishedCountsByIndex() {
  const counts = {};
  for (const [indexSlug, fileName] of Object.entries(KNOWN_INDEX_FILES)) {
    const path = join(INDEXES_DIR, fileName);
    if (!existsSync(path)) {
      throw new Error(`coverage-report: expected index file not found: ${path}`);
    }
    const data = JSON.parse(readFileSync(path, "utf-8"));
    if (!Array.isArray(data.rankings)) {
      throw new Error(`coverage-report: ${path} has no \`rankings\` array — schema drift`);
    }
    counts[indexSlug] = data.rankings.length;
  }
  return counts;
}

function countPendingChangeProposals() {
  if (!existsSync(PROPOSALS_DIR)) {
    throw new Error(`coverage-report: change-proposals directory not found: ${PROPOSALS_DIR}`);
  }
  const files = readdirSync(PROPOSALS_DIR).filter((f) => f.endsWith(".json"));
  let pending = 0;
  for (const f of files) {
    const data = JSON.parse(readFileSync(join(PROPOSALS_DIR, f), "utf-8"));
    if (data.status === "pending") pending++;
  }
  return pending;
}

function main() {
  const args = process.argv.slice(2);
  const dateFlagIdx = args.indexOf("--date");
  let reportDateStr;
  if (dateFlagIdx !== -1) {
    reportDateStr = args[dateFlagIdx + 1];
  } else if (args[0] && DATE_RE.test(args[0])) {
    reportDateStr = args[0];
  } else {
    reportDateStr = new Date().toISOString().slice(0, 10);
  }

  const rotation = JSON.parse(readFileSync(ROTATION_PATH, "utf-8"));
  const publishedCountsByIndex = loadPublishedCountsByIndex();
  const pendingChangeProposalCount = countPendingChangeProposals();

  const report = buildCoverageReport(rotation, publishedCountsByIndex, pendingChangeProposalCount, reportDateStr);
  const markdown = renderMarkdown(report);

  console.log(markdown);

  if (!existsSync(REPORT_DIR)) mkdirSync(REPORT_DIR, { recursive: true });
  const mdPath = join(REPORT_DIR, `${reportDateStr}.md`);
  const jsonPath = join(REPORT_DIR, `${reportDateStr}.json`);
  writeFileSync(mdPath, `${markdown}\n`, "utf-8");
  writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf-8");
  console.log(`\n[coverage-report] Wrote ${mdPath}`);
  console.log(`[coverage-report] Wrote ${jsonPath}`);
}

// Only run the CLI when this file is executed directly (not when imported by tests).
if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  try {
    main();
  } catch (err) {
    console.error(`\n[coverage-report] FAILED: ${err.message}\n`);
    process.exit(1);
  }
}
