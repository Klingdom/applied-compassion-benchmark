#!/usr/bin/env node
/**
 * build-model-reports.mjs -- compile wave reports for the site (prebuild).
 *
 *   site/src/data/model-benchmark/reports/<run_id>.md
 *   + site/src/data/model-benchmark/waves/<run_id>.json
 *   -> site/src/data/model-benchmark/reports/<run_id>.json   (gitignored)
 *
 * Runs in prebuild, including inside Docker: both inputs live under site/, so
 * the build needs nothing from research/. The compiled JSON is gitignored on
 * purpose: committing it would add a third copy of every figure that could
 * drift from the wave file.
 *
 * Every figure in the markdown is a `{{path|format}}` token resolved against
 * the wave file only; the compiled JSON carries the figure ledger (every
 * figure, the wave path it came from, the value, the rendered text). The build
 * FAILS, printing each rule and line, on any violation of
 * docs/AI_MODEL_ASSESSMENT_TEMPLATE.md B and D. Rules: scripts/lib/model-report.mjs.
 *
 * No report source present is not an error: it prints that and exits 0 (a
 * wave without a narrative yet). A report source without its wave is an error.
 *
 * Options (used by the tests): --reports-dir <dir> --waves-dir <dir> --out-dir <dir>
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { compileReport } from "./lib/model-report.mjs";
import { readDimensionNames } from "./lib/dimension-names.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const opt = (n, d) => (argv.includes(n) ? resolve(argv[argv.indexOf(n) + 1]) : d);
const DATA = join(HERE, "..", "src", "data", "model-benchmark");
const REPORTS = opt("--reports-dir", join(DATA, "reports"));
const WAVES = opt("--waves-dir", join(DATA, "waves"));
const OUT = opt("--out-dir", REPORTS);

if (!existsSync(REPORTS)) {
  console.log(`[build-model-reports] no report sources at ${REPORTS}; nothing to compile.`);
  process.exit(0);
}
const sources = readdirSync(REPORTS).filter((f) => f.endsWith(".md") && !f.startsWith("_")).sort();
if (sources.length === 0) {
  console.log("[build-model-reports] no report sources (*.md); nothing to compile.");
  process.exit(0);
}

// Display names of the dimensions, so a "lowest" claim can name a dimension in words and still be checked.
const dimensionNames = readDimensionNames();
if (Object.keys(dimensionNames).length === 0) {
  // An empty map would reject every "lowest" claim that names its dimension in words (a false rejection), so stop loudly.
  console.error("[build-model-reports] FAIL: no dimension display names could be read from src/data/dimensions.ts");
  process.exit(1);
}

let failed = 0;
for (const file of sources) {
  const runId = basename(file, ".md");
  const wavePath = join(WAVES, `${runId}.json`);
  if (!existsSync(wavePath)) {
    console.error(`[build-model-reports] FAIL ${file}: no wave file ${wavePath}. A report cannot exist without its wave (run export-wave.mjs).`);
    failed += 1;
    continue;
  }
  const wave = JSON.parse(readFileSync(wavePath, "utf8"));
  if (wave.run_id !== runId) {
    console.error(`[build-model-reports] FAIL ${file}: wave run_id "${wave.run_id}" differs from the file name`);
    failed += 1;
    continue;
  }
  const { errors, report } = compileReport({ md: readFileSync(join(REPORTS, file), "utf8"), wave, dimensionNames });
  if (errors.length) {
    console.error(`[build-model-reports] FAIL ${file}: ${errors.length} problem(s)`);
    for (const e of errors) console.error(`  ${e.rule}${e.line ? ` (line ${e.line})` : ""}: ${e.message}`);
    failed += 1;
    continue;
  }
  mkdirSync(OUT, { recursive: true });
  writeFileSync(join(OUT, `${runId}.json`), JSON.stringify(report, null, 2) + "\n");
  const figures = report.figure_ledger.filter((e) => e.kind === "fig").length;
  console.log(`[build-model-reports] ok ${runId}: ${report.word_count} words, ${figures} figures in the ledger, ${report.lit_count} literal(s)`);
}
if (failed) process.exit(1);
