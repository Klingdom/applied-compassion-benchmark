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
import {
  scanForViolations,
  scanUnappliedScoreMovement,
  UNAPPLIED_SCORE_MOVEMENT_CUTOFF,
  scanClaimToSource,
  loadPublishedIndexLookup,
  CLAIM_TO_SOURCE_CUTOFF,
} from "./lib/lint-rules.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DAILY_DIR = join(__dirname, "..", "src", "data", "updates", "daily");
const LATEST_FILE = join(__dirname, "..", "src", "data", "updates", "latest.json");
const INDEXES_DIR = join(__dirname, "..", "src", "data", "indexes");

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

function parseFile(filePath) {
  try {
    return { file: filePath, data: JSON.parse(readFileSync(filePath, "utf8")), error: null };
  } catch (e) {
    return { file: filePath, data: null, error: e };
  }
}

// Builds prior-published-briefing lookups for the claim-to-source
// prior-briefing-reference check, from the files actually present in
// DAILY_DIR (not manifest.json — manifest.json retains far more dates than
// DAILY_DIR keeps files for, per validate-daily-briefings.mjs's 30-day
// rolling window, so a manifest-only date is not something a "last night's
// briefing" claim could actually be checked against).
function buildPriorBriefingLookup(parsedFiles) {
  const dataByDate = new Map();
  for (const { data, error } of parsedFiles) {
    if (error || !data || typeof data.date !== "string") continue;
    dataByDate.set(data.date, data);
  }
  const sortedDates = [...dataByDate.keys()].sort();

  return {
    dataFor: (date) => dataByDate.get(date) ?? null,
    priorDateFor: (date) => {
      let prior = null;
      for (const d of sortedDates) {
        if (d < date) prior = d;
        else break;
      }
      return prior;
    },
  };
}

function lintFile(parsed, priorLookup, indexLookup) {
  const { file, data, error } = parsed;
  if (error) {
    return {
      file,
      violations: [{
        path: "<root>",
        rule: "invalid-json",
        detail: error.message,
        snippet: "",
      }],
      reportOnly: [],
    };
  }

  const movement = scanUnappliedScoreMovement(data);

  const date = typeof data.date === "string" ? data.date : null;
  const priorDate = date ? priorLookup.priorDateFor(date) : null;
  const priorBriefingRaw = priorDate ? priorLookup.dataFor(priorDate) : null;
  const claimToSource = scanClaimToSource(data, { indexLookup, priorDate, priorBriefingRaw });

  return {
    file,
    violations: [...scanForViolations(data), ...movement.violations, ...claimToSource.violations],
    reportOnly: [...movement.reportOnly, ...claimToSource.reportOnly],
  };
}

function printReportOnly(allResults) {
  const withMatches = allResults.filter((r) => r.reportOnly && r.reportOnly.length > 0);
  if (withMatches.length === 0) return;

  console.log(
    `\n[lint-daily-briefings] REPORT-ONLY — unapplied-score-movement matches (cutoff ` +
    `${UNAPPLIED_SCORE_MOVEMENT_CUTOFF}) and claim-to-source matches (cutoff ${CLAIM_TO_SOURCE_CUTOFF}) in ` +
    `briefings dated before their respective cutoffs (informational only, does NOT affect exit code; ` +
    `AUTONOMY.md §1c forbids retro-editing published briefings):\n`
  );
  for (const result of withMatches) {
    console.log(`  ${basename(result.file)}`);
    for (const v of result.reportOnly) {
      console.log(`    - ${v.path} :: ${v.rule}`);
      console.log(`        "${(v.sentence || v.snippet || "").replace(/\n/g, " ")}"`);
    }
  }
  console.log("");
}

function main() {
  const files = getDailyFiles();
  if (files.length === 0) {
    console.log("[lint-daily-briefings] No daily briefing files found — nothing to check.");
    return;
  }

  // loadPublishedIndexLookup throws when it can't build a usable lookup
  // (zero index files loaded, or zero entities in the ones it did load) —
  // deliberately NOT caught-and-downgraded here. A prior version of this
  // code caught the error and fell back to `{ byKey: new Map() }`, which
  // silently disabled the claim-to-source superlative/number checks (every
  // entity became "unverifiable — skip") while the linter still printed
  // PASS. Improvement Loop 16 CS-1 follow-up, 2026-09-16 (defect 2): a moved
  // or misconfigured INDEXES_DIR must fail this script loudly, not pass a
  // green build with the gate quietly doing nothing. A partial load (some
  // index files missing, most present) still returns normally — it only
  // warns — since most entities remain checkable.
  let indexLookup;
  try {
    indexLookup = loadPublishedIndexLookup(INDEXES_DIR);
  } catch (e) {
    console.error(`[lint-daily-briefings] FATAL: ${e.message}`);
    process.exit(2);
  }

  const parsedFiles = files.map(parseFile);
  const priorLookup = buildPriorBriefingLookup(parsedFiles);

  const allResults = parsedFiles.map((p) => lintFile(p, priorLookup, indexLookup));
  const failingResults = allResults.filter((r) => r.violations.length > 0);

  printReportOnly(allResults);

  if (failingResults.length === 0) {
    console.log(
      `[lint-daily-briefings] PASS — ${files.length} daily JSON files clean ` +
      `(0 forbidden phrases, 0 forbidden status values, 0 forbidden pipeline keys, ` +
      `0 unapplied-score-movement violations on or after ${UNAPPLIED_SCORE_MOVEMENT_CUTOFF}, ` +
      `0 claim-to-source violations on or after ${CLAIM_TO_SOURCE_CUTOFF}).`
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
