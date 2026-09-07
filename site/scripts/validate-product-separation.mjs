#!/usr/bin/env node

/**
 * validate-product-separation.mjs — the CB-MODEL product-separation guard.
 *
 * Mechanically enforces the single hardest rule in the CB-MODEL package
 * (`docs/CB_MODEL_INTEGRATION_2026-09-06.md`, `.benchmark-ops/CURRENT_STATE.md`):
 * three products — Model Index (exact model snapshots), AI Labs Index
 * (organisations), Deployed AI Audit (product configurations) — never merge
 * into one score. Before this file, that rule was prose in a package with no
 * check that it held.
 *
 * Four checks:
 *  1. Lab/model (or org/org) fusion in a published entity name       → FAIL
 *  2. Cross-index / intra-index duplicate composite publication      → FAIL
 *  3. Deployed AI Audit subject published inside the Labs index      → WARN
 *  4. Model score published without an explicit product discriminator → FAIL
 *     (vacuous today — no model index exists yet; see check 4 output)
 *
 * Detection logic lives in `lib/product-separation.mjs` (pure, no I/O) so it
 * can be exercised against synthetic fixtures in `test-product-separation.mjs`
 * without touching real index files. This script is the thin CLI wrapper:
 * read the real index files, run the checks, print the report, set exit code.
 *
 * This validator REPORTS. It never repairs, renames, deletes, or reorders any
 * published entity, and it never writes to `site/src/data/indexes/**`.
 *
 * Output convention: summary, WARNINGS (non-blocking), FAILURES (blocking),
 * RESULT: PASS/FAIL. Exit code 0 on PASS (warnings allowed), 1 on FAIL.
 *
 * Run: node site/scripts/validate-product-separation.mjs
 */

import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import {
  detectFusedNames,
  detectDuplicatePublications,
  detectDeployedAuditSubjects,
  checkModelDiscriminator,
  ORG_DUPLICATE_SCOPE_FILES,
} from "./lib/product-separation.mjs";
import { DEPLOYED_AI_AUDIT_SUBJECT_NAMES } from "./lib/deployed-ai-audit-subjects.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const INDEXES_DIR = join(__dirname, "..", "src", "data", "indexes");

// ── Load every index file into memory (read-only) ──────────────────────────

let files;
try {
  files = readdirSync(INDEXES_DIR).filter((f) => f.endsWith(".json"));
} catch (err) {
  console.error(`FATAL: cannot read ${INDEXES_DIR}: ${err.message}`);
  process.exit(1);
}

const indexDataByFile = {};
const parseErrors = [];

for (const file of files) {
  try {
    indexDataByFile[file] = JSON.parse(readFileSync(join(INDEXES_DIR, file), "utf8"));
  } catch (err) {
    parseErrors.push(`${file}: ${err.message}`);
  }
}

console.log(`\nvalidate-product-separation: loaded ${Object.keys(indexDataByFile).length} index file(s) from ${INDEXES_DIR}\n`);

const failures = []; // { check, message }
const warnings = []; // { check, message }

function fail(check, message) {
  failures.push({ check, message });
}
function warn(check, message) {
  warnings.push({ check, message });
}

for (const e of parseErrors) {
  fail("parse", e);
}

// ─────────────────────────────────────────────────────────────────────────
// Check 1 — lab/model or org/org fusion in a published entity name
// ─────────────────────────────────────────────────────────────────────────

console.log("Check 1 — name fusion (organisation × model or organisation × organisation)");

const fusions = detectFusedNames(indexDataByFile);
if (fusions.length === 0) {
  console.log("  none found");
} else {
  for (const f of fusions) {
    fail(
      "1-fusion",
      `${f.file}: "${f.name}" (rank ${f.rank}, composite ${f.composite}) — ${f.kind}: ` +
        `published entity name fuses "${f.left}" and "${f.right}" into one composite. ` +
        `Violates "never merge model behavior and lab governance into one score."`
    );
  }
}
console.log(`  ${fusions.length} fused name(s) detected\n`);

// ─────────────────────────────────────────────────────────────────────────
// Check 2 — cross-index / intra-index duplicate composite publication
// ─────────────────────────────────────────────────────────────────────────

console.log(`Check 2 — duplicate composite publication (scope: ${ORG_DUPLICATE_SCOPE_FILES.join(", ")})`);

const duplicates = detectDuplicatePublications(indexDataByFile);
if (duplicates.length === 0) {
  console.log("  none found");
} else {
  for (const d of duplicates) {
    const scopeLabel = d.crossIndex ? "cross-index" : "same-index";
    const parts = d.occurrences
      .map((o) => `${o.file} "${o.name}" (rank ${o.rank}, composite ${o.composite})`)
      .join("  |  ");
    fail(
      "2-duplicate",
      `${scopeLabel} duplicate for canonical entity "${d.canonical}": ${parts}. ` +
        `Violates D-13: "no entity may hold more than one published composite ` +
        `anywhere in the Compassion Benchmark" (root DECISIONS.md, status: proposed).`
    );
  }
}
console.log(`  ${duplicates.length} duplicate group(s) detected\n`);

// ─────────────────────────────────────────────────────────────────────────
// Check 3 — Deployed AI Audit subject published inside the Labs index
// ─────────────────────────────────────────────────────────────────────────

console.log("Check 3 — Deployed AI Audit subject inside ai-labs.json (maintained list; see lib/deployed-ai-audit-subjects.mjs)");

const labsData = indexDataByFile["ai-labs.json"];
const deployedMatches = labsData
  ? detectDeployedAuditSubjects(labsData.rankings, DEPLOYED_AI_AUDIT_SUBJECT_NAMES)
  : [];

if (!labsData) {
  console.log("  ai-labs.json not found — check skipped");
} else if (deployedMatches.length === 0) {
  console.log("  none found");
} else {
  for (const m of deployedMatches) {
    warn(
      "3-deployed-audit",
      `ai-labs.json: "${m.name}" (rank ${m.rank}, composite ${m.composite}) is on the maintained ` +
        `Deployed AI Audit subject list — ranked in ai-labs.json against organisational governance ` +
        `scores, but is a configured product, not a developer organisation. Taxonomy decision, not ` +
        `yet made by the founder (WQ-P3-01) — this is a WARNING, not a build blocker.`
    );
  }
}
console.log(`  ${deployedMatches.length} deployed-product row(s) found inside ai-labs.json\n`);

// ─────────────────────────────────────────────────────────────────────────
// Check 4 — model score published without a product discriminator
// ─────────────────────────────────────────────────────────────────────────

console.log("Check 4 — product discriminator required on any declared model index");

const discriminatorResult = checkModelDiscriminator(indexDataByFile);
if (discriminatorResult.vacuous) {
  console.log(
    "  VACUOUS PASS — no index file currently declares meta.isModelIndex = true. " +
      "No model index exists in this repo yet " +
      "(docs/CB_MODEL_INTEGRATION_2026-09-06.md: \"Model Index... Does not exist\"). " +
      "This check has verified nothing; it will begin doing real work the day a model " +
      "index is added with meta.isModelIndex = true, and will FAIL any row in it missing " +
      "a discriminator field (one of: " + "modelId/model_id/snapshotId/snapshot_id/productId/product_id/product" + ")."
  );
} else {
  console.log(`  checked ${discriminatorResult.checkedFiles.length} declared model index file(s): ${discriminatorResult.checkedFiles.join(", ")}`);
  if (discriminatorResult.failures.length === 0) {
    console.log("  every row carries a product discriminator");
  } else {
    for (const f of discriminatorResult.failures) {
      fail(
        "4-discriminator",
        `${f.file}: "${f.name}" (rank ${f.rank}) is in a declared model index but carries no ` +
          `product discriminator field.`
      );
    }
  }
}
console.log();

// ─────────────────────────────────────────────────────────────────────────
// Summary
// ─────────────────────────────────────────────────────────────────────────

const sep = "─".repeat(70);
console.log(sep);
console.log("SUMMARY");
console.log(sep);
console.log(`  Check 1 (name fusion):                 ${fusions.length} finding(s), FAIL severity`);
console.log(`  Check 2 (duplicate publication):       ${duplicates.length} finding(s), FAIL severity`);
console.log(`  Check 3 (deployed product in labs):    ${deployedMatches.length} finding(s), WARN severity`);
console.log(
  `  Check 4 (model discriminator):         ${discriminatorResult.vacuous ? "vacuous (no model index exists)" : `${discriminatorResult.failures.length} finding(s), FAIL severity`}`
);

if (warnings.length > 0) {
  console.log(`\n${sep}`);
  console.log(`WARNINGS (non-blocking) — ${warnings.length}`);
  console.log(sep);
  for (const w of warnings) {
    console.log(`  [${w.check}] ${w.message}`);
  }
}

if (failures.length > 0) {
  console.log(`\n${sep}`);
  console.log(`FAILURES (blocking) — ${failures.length}`);
  console.log(sep);
  for (const f of failures) {
    console.log(`  [${f.check}] ${f.message}`);
  }
}

console.log(`\n${sep}`);
if (failures.length > 0) {
  console.log(`RESULT: FAIL (${failures.length} blocking failure(s), ${warnings.length} warning(s))`);
  console.log(sep + "\n");
  process.exit(1);
} else {
  console.log(`RESULT: PASS (${warnings.length} warning(s))`);
  console.log(sep + "\n");
  process.exit(0);
}
