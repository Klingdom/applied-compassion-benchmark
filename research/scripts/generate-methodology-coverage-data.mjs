#!/usr/bin/env node
/**
 * generate-methodology-coverage-data.mjs — publishes the never-assessed
 * share as a committed TypeScript data module for site/src/app/methodology.
 *
 * Part of the 2026-09-16 founder-approved task, item U-2 (site publication
 * half of U-1's coverage generator; PR/FAQ items U and E; reduces RISKS.md
 * RISK-001 / RISK-016). U-1's research/scripts/coverage-report.mjs computes
 * the coverage/freshness metrics; this script re-uses the exact same
 * computation (buildCoverageReport) so the public-facing figure on
 * /methodology and the committed research/coverage/<date>.{md,json} report
 * can never silently disagree, then writes ONLY the never-assessed
 * count/share (the one figure U-2 is scoped to publish) into a small
 * generated TypeScript module the methodology page imports.
 *
 * This keeps the page's own guard (`npm run test:no-stale-counts`, which
 * forbids hand-typed catalogue counts in src/app/**\/*.tsx and
 * src/components/**\/*.tsx) satisfied honestly — the number is generated
 * from research/rotation-state.json, not typed into the page.
 *
 * Usage:
 *   node research/scripts/generate-methodology-coverage-data.mjs                 (date = today, UTC)
 *   node research/scripts/generate-methodology-coverage-data.mjs 2026-09-16      (explicit report date)
 *
 * Writes:
 *   site/src/data/neverAssessedCoverage.ts
 *
 * Exit codes: 0 on success; 1 on the same schema-drift failures
 * buildCoverageReport() raises (see coverage-report.mjs).
 */

import { readFileSync, readdirSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildCoverageReport,
  KNOWN_INDEX_FILES,
  ROTATION_PATH,
  INDEXES_DIR,
  PROPOSALS_DIR,
  REPO_ROOT,
} from "./coverage-report.mjs";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const OUTPUT_PATH = join(REPO_ROOT, "site", "src", "data", "neverAssessedCoverage.ts");

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function loadPublishedCountsByIndex() {
  const counts = {};
  for (const [indexSlug, fileName] of Object.entries(KNOWN_INDEX_FILES)) {
    const path = join(INDEXES_DIR, fileName);
    if (!existsSync(path)) {
      throw new Error(`generate-methodology-coverage-data: expected index file not found: ${path}`);
    }
    const data = JSON.parse(readFileSync(path, "utf-8"));
    if (!Array.isArray(data.rankings)) {
      throw new Error(`generate-methodology-coverage-data: ${path} has no \`rankings\` array — schema drift`);
    }
    counts[indexSlug] = data.rankings.length;
  }
  return counts;
}

function countPendingChangeProposals() {
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
  const reportDateStr = args[0] && DATE_RE.test(args[0]) ? args[0] : new Date().toISOString().slice(0, 10);

  const rotation = JSON.parse(readFileSync(ROTATION_PATH, "utf-8"));
  const publishedCountsByIndex = loadPublishedCountsByIndex();
  const pendingChangeProposalCount = countPendingChangeProposals();

  const report = buildCoverageReport(rotation, publishedCountsByIndex, pendingChangeProposalCount, reportDateStr);

  const { totalTrackedEntities, overall } = report;
  const shareFormatted = overall.neverAssessedShare; // e.g. "61.0%"

  const contents = `/**
 * neverAssessedCoverage.ts — GENERATED, do not hand-edit.
 *
 * Source: research/rotation-state.json, as read by
 * research/scripts/generate-methodology-coverage-data.mjs (which reuses the
 * exact same buildCoverageReport() computation as
 * research/scripts/coverage-report.mjs, so this figure and the committed
 * research/coverage/<date>.{md,json} report can never silently disagree).
 *
 * Regenerate with:
 *   node research/scripts/generate-methodology-coverage-data.mjs [YYYY-MM-DD]
 *
 * Report date this snapshot reflects: ${reportDateStr}
 *
 * Definition: "never individually assessed" means \`last_assessed\` is
 * \`null\` for that entity in research/rotation-state.json — its published
 * score is an inherited starting value, not a measurement. See
 * site/src/app/methodology/page.tsx for the full public explanation.
 */

export const NEVER_ASSESSED_COVERAGE = {
  /** The date research/rotation-state.json was read as of, YYYY-MM-DD. */
  reportDate: "${reportDateStr}",
  /** Total entities tracked in research/rotation-state.json as of reportDate. */
  totalTrackedEntities: ${totalTrackedEntities},
  /** Entities with last_assessed === null as of reportDate. */
  neverAssessedCount: ${overall.neverAssessed},
  /** neverAssessedCount / totalTrackedEntities, formatted (e.g. "61.0%"). */
  neverAssessedShareFormatted: "${shareFormatted}",
} as const;
`;

  if (!existsSync(dirname(OUTPUT_PATH))) mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
  writeFileSync(OUTPUT_PATH, contents, "utf-8");
  console.log(`[generate-methodology-coverage-data] Wrote ${OUTPUT_PATH}`);
  console.log(
    `[generate-methodology-coverage-data] ${overall.neverAssessed} of ${totalTrackedEntities} (${shareFormatted}) never individually assessed as of ${reportDateStr}`,
  );
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  try {
    main();
  } catch (err) {
    console.error(`\n[generate-methodology-coverage-data] FAILED: ${err.message}\n`);
    process.exit(1);
  }
}
