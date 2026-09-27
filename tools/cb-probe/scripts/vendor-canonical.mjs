#!/usr/bin/env node
/**
 * vendor-canonical.mjs — make cb-probe publishable without letting the
 * canonical scorer drift.
 *
 * THE PROBLEM
 *   lib/canonical.mjs imports the real scoring modules with paths that escape
 *   the package directory (`../../../site/scripts/lib/…`). That is correct
 *   inside the repository — our own runs use the same function that scores
 *   every published country and company, with no copy anywhere in the path —
 *   and it is fatal for `npm pack`, whose tarball resolves those imports to
 *   nothing.
 *
 * THE TENSION
 *   Shipping a copy is exactly what this design has refused for weeks, because
 *   a copy drifts and a drifted copy silently falsifies cb-probe's central
 *   claim. But a package nobody can install helps nobody either.
 *
 * THE RESOLUTION
 *   Copy at pack time, and make drift a failing test rather than a silent lie:
 *
 *   - This script writes byte-identical copies into lib/vendor/, each with a
 *     generated header naming its source and stating it must not be edited.
 *   - It writes lib/canonical.published.mjs, the same re-export surface reading
 *     from lib/vendor/ instead of across the package boundary.
 *   - tests/canonical-vendor.test.mjs asserts every vendored file still matches
 *     its source byte for byte, and that both canonical surfaces export exactly
 *     the same names. That test is in the chain, so a change to the real scorer
 *     that is not re-vendored fails CI.
 *   - The `prepack` script runs this and swaps canonical.mjs for the published
 *     variant, so the tarball is self-contained and the repository keeps using
 *     the real modules.
 *
 * Run: node tools/cb-probe/scripts/vendor-canonical.mjs [--check]
 *   --check exits non-zero if anything is out of date instead of writing.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import path from "node:path";

const HERE = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
const PKG = path.resolve(HERE, "..");
const SITE_LIB = path.resolve(PKG, "../../site/scripts/lib");
const VENDOR = path.join(PKG, "lib", "vendor");

/** The canonical modules cb-probe depends on, in dependency order. */
export const VENDORED_MODULES = ["scoring.mjs", "evaluation-statistics.mjs", "task-bank-validator.mjs"];

/**
 * The task bank is vendored too, and it is not optional: without it a published
 * package installs a server that cannot start, because the bank IS the
 * instrument. It is data rather than code, so it is copied verbatim with no
 * header — a JSON file cannot carry a comment.
 */
export const VENDORED_DATA = [
  { from: "../../site/src/data/model-benchmark/tasks-v1.json", to: "tasks-v1.json" },
];
export function dataSourcePathFor(entry) {
  return path.resolve(PKG, entry.from);
}
export function dataVendorPathFor(entry) {
  return path.join(VENDOR, entry.to);
}

const HEADER = (name) =>
  `// GENERATED FILE — DO NOT EDIT.\n` +
  `//\n` +
  `// Byte-identical copy of site/scripts/lib/${name}, vendored so the published\n` +
  `// cb-probe package is self-contained. Inside the repository this copy is NOT\n` +
  `// used: lib/canonical.mjs imports the real module directly, so our own runs\n` +
  `// have no copy in the path at all.\n` +
  `//\n` +
  `// Regenerate: node tools/cb-probe/scripts/vendor-canonical.mjs\n` +
  `// Verified by: tests/canonical-vendor.test.mjs (fails if this drifts)\n` +
  `// ---------------------------------------------------------------------------\n`;

/** Split a vendored file into its generated header and the copied body. */
export function splitVendored(text) {
  const marker = "// ---------------------------------------------------------------------------\n";
  const idx = text.indexOf(marker);
  if (idx === -1) return { header: "", body: text };
  return { header: text.slice(0, idx + marker.length), body: text.slice(idx + marker.length) };
}

export function sourcePathFor(name) {
  return path.join(SITE_LIB, name);
}
export function vendorPathFor(name) {
  return path.join(VENDOR, name);
}

const PUBLISHED_CANONICAL = `// lib/canonical.published.mjs
//
// GENERATED FILE — DO NOT EDIT. Regenerate with scripts/vendor-canonical.mjs.
//
// The published variant of lib/canonical.mjs. Identical export surface, reading
// the vendored copies under lib/vendor/ instead of reaching across the package
// boundary into the repository. \`prepack\` swaps this in so the tarball is
// self-contained; inside the repository lib/canonical.mjs is used instead and
// the real modules are imported directly.

export {
  computeCompositeFromDimensions,
  getBand,
  DIMENSION_CODES,
  BAND_ORDER,
  BAND_RANGES,
  METHODOLOGY_VERSION,
} from "./vendor/scoring.mjs";

export {
  computeItemTrialVariance,
  mean,
  bootstrapCompositeUncertainty,
  createSeededRng,
  THRESHOLDS,
} from "./vendor/evaluation-statistics.mjs";

export { DIMENSIONS_MAP } from "./vendor/task-bank-validator.mjs";
`;

// ─────────────────────────────────────────────────────────────────────────
// CLI ONLY BELOW THIS LINE.
//
// Everything above is importable with no side effects. This guard exists
// because the first version did not have it: tests/canonical-vendor.test.mjs
// imports VENDORED_MODULES and splitVendored from this file, and without the
// guard that import RE-VENDORED the files — silently repairing planted drift
// before the test could compare it. A planted-drift probe passed 5/5 against a
// gate that was quietly fixing the very thing it existed to detect.
// ─────────────────────────────────────────────────────────────────────────
const invokedDirectly =
  process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));

if (!invokedDirectly) {
  // Imported for its helpers. Do nothing.
} else {
  runCli();
}

function runCli() {
const checkOnly = process.argv.includes("--check");
const problems = [];
let wrote = 0;

mkdirSync(VENDOR, { recursive: true });

for (const name of VENDORED_MODULES) {
  const src = sourcePathFor(name);
  if (!existsSync(src)) {
    problems.push(`source missing: ${src}`);
    continue;
  }
  let body = readFileSync(src, "utf8");

  // The vendored copies live inside the package, so any import BETWEEN these
  // modules must resolve locally rather than reaching back out.
  body = body.replace(/from "\.\/(scoring|evaluation-statistics|task-bank-validator)\.mjs"/g, 'from "./$1.mjs"');

  const want = HEADER(name) + body;
  const dest = vendorPathFor(name);
  const have = existsSync(dest) ? readFileSync(dest, "utf8") : null;

  if (have === want) continue;
  if (checkOnly) {
    problems.push(
      have === null
        ? `lib/vendor/${name} is missing`
        : `lib/vendor/${name} has DRIFTED from site/scripts/lib/${name}`
    );
    continue;
  }
  writeFileSync(dest, want);
  wrote += 1;
}

for (const entry of VENDORED_DATA) {
  const src = dataSourcePathFor(entry);
  if (!existsSync(src)) {
    problems.push(`data source missing: ${src}`);
    continue;
  }
  const want = readFileSync(src, "utf8");
  const dest = dataVendorPathFor(entry);
  const have = existsSync(dest) ? readFileSync(dest, "utf8") : null;
  if (have === want) continue;
  if (checkOnly) {
    problems.push(have === null ? `lib/vendor/${entry.to} is missing` : `lib/vendor/${entry.to} has DRIFTED from ${entry.from}`);
    continue;
  }
  writeFileSync(dest, want);
  wrote += 1;
}

const publishedPath = path.join(PKG, "lib", "canonical.published.mjs");
const havePublished = existsSync(publishedPath) ? readFileSync(publishedPath, "utf8") : null;
if (havePublished !== PUBLISHED_CANONICAL) {
  if (checkOnly) problems.push("lib/canonical.published.mjs is missing or out of date");
  else {
    writeFileSync(publishedPath, PUBLISHED_CANONICAL);
    wrote += 1;
  }
}

if (checkOnly) {
  if (problems.length) {
    console.log("VENDOR CHECK FAILED:");
    for (const p of problems) console.log(`  - ${p}`);
    console.log("\nRun: node tools/cb-probe/scripts/vendor-canonical.mjs");
    process.exit(1);
  }
  console.log(`vendor check OK — ${VENDORED_MODULES.length} modules match their sources`);
} else {
  if (problems.length) {
    for (const p of problems) console.log(`ERROR: ${p}`);
    process.exit(1);
  }
  console.log(`vendored ${VENDORED_MODULES.length} modules (${wrote} file(s) written)`);
}
}
