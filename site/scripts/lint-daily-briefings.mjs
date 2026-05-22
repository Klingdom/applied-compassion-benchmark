#!/usr/bin/env node

/**
 * lint-daily-briefings.mjs — Build-time enforcer of PUBLIC DAILY JSON RULES.
 *
 * Scans every `site/src/data/updates/daily/*.json` AND `site/src/data/updates/latest.json`
 * for reviewer-facing language, forbidden status/actionType/cycleType values, and
 * forbidden top-level pipeline keys.
 *
 * The canonical rule set lives in `.claude/agents/overnight-digest.md`
 * under "PUBLIC DAILY JSON RULES (NON-NEGOTIABLE)".
 *
 * The machine-readable rule set lives in `site/scripts/lib/lint-rules.mjs` —
 * shared with `test-lint-briefings.mjs` so rules cannot drift between
 * enforcement and tests.
 *
 * Exit code 0 = all daily JSONs are publishable; 1 = at least one violation.
 *
 * Added: Improvement Loop 3, 2026-05-21.
 * Refactored: Improvement Loop 6, 2026-05-22 — rule constants extracted to lib/lint-rules.mjs.
 *
 * Usage:
 *   node site/scripts/lint-daily-briefings.mjs
 *   npm run lint:briefings    (from site/)
 *
 * Runs automatically as part of `npm run build` via the build script chain.
 */

import { readFileSync, readdirSync, statSync } from "fs";
import { join, dirname, basename } from "path";
import { fileURLToPath } from "url";
import { scanForViolations } from "./lib/lint-rules.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DAILY_DIR = join(__dirname, "..", "src", "data", "updates", "daily");
const LATEST_FILE = join(__dirname, "..", "src", "data", "updates", "latest.json");

// ──────────────────────────────────────────────────────────────────────────
// FILE DISCOVERY + REPORT
// ──────────────────────────────────────────────────────────────────────────

function getDailyFiles() {
  let entries;
  try {
    entries = readdirSync(DAILY_DIR);
  } catch (e) {
    console.error(`[lint-daily-briefings] FATAL: cannot read ${DAILY_DIR}`);
    process.exit(2);
  }
  const files = entries
    .filter((f) => f.endsWith(".json"))
    .map((f) => join(DAILY_DIR, f));

  // Include latest.json if present
  try {
    if (statSync(LATEST_FILE).isFile()) {
      files.push(LATEST_FILE);
    }
  } catch {
    // latest.json may not exist; that's fine
  }
  return files;
}

function lintFile(filePath) {
  let data;
  try {
    data = JSON.parse(readFileSync(filePath, "utf8"));
  } catch (e) {
    return {
      file: filePath,
      violations: [{
        path: "<root>",
        rule: "invalid-json",
        detail: e.message,
        snippet: "",
      }],
    };
  }
  return { file: filePath, violations: scanForViolations(data) };
}

function main() {
  const files = getDailyFiles();
  if (files.length === 0) {
    console.log("[lint-daily-briefings] No daily briefing files found — nothing to check.");
    return;
  }

  const allResults = files.map(lintFile);
  const failingResults = allResults.filter((r) => r.violations.length > 0);

  if (failingResults.length === 0) {
    console.log(
      `[lint-daily-briefings] PASS — ${files.length} daily JSON files clean ` +
      `(0 forbidden phrases, 0 forbidden status values, 0 forbidden pipeline keys).`
    );
    return;
  }

  console.error(`\n[lint-daily-briefings] FAIL — ${failingResults.length} of ${files.length} files contain violations:\n`);
  for (const result of failingResults) {
    console.error(`  ${basename(result.file)}`);
    for (const v of result.violations) {
      console.error(`    ✗ ${v.rule} :: ${v.path}`);
      console.error(`        detail:  ${v.detail}`);
      console.error(`        snippet: ${v.snippet.replace(/\n/g, " ")}`);
    }
    console.error("");
  }
  console.error(
    `[lint-daily-briefings] Fix the violations above. The canonical rule set is in ` +
    `.claude/agents/overnight-digest.md under "PUBLIC DAILY JSON RULES (NON-NEGOTIABLE)". ` +
    `The machine-readable rules are in site/scripts/lib/lint-rules.mjs.`
  );
  console.error(
    `[lint-daily-briefings] These daily JSONs are public surface — they must read as ` +
    `polished, finalized intelligence briefings (Bloomberg / Axios / Freedom House voice). ` +
    `Internal coordination language (review queue, founder decision, etc.) belongs only in ` +
    `research/ artifacts, never in site/src/data/updates/.\n`
  );
  process.exit(1);
}

main();
