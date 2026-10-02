#!/usr/bin/env node
/**
 * export-model-wave-public.mjs -- publish the machine-readable twins of the reports that RENDER, nothing else.
 *
 *   waves/<run_id>.json (internal, every value)
 *     -> public/data/model-waves/<run_id>.json            a PROJECTION: point estimates of not-separated
 *                                                          models and point differences involving them withheld (DC-24)
 *   reports/<run_id>.json (compiled) + reports/<run_id>.md
 *     -> public/ai-models/reports/<run_id>.md              markdown alternate, tokens resolved
 *   manifest + waves + cb-probe facts
 *     -> public/data/model-benchmark/index.json            the machine entry point
 *
 * The report's JSON-LD `isBasedOn` points at the wave URL, so it must exist whenever the report renders, and it must
 * NOT exist when the report does not: an unratified pilot's figures must not reach out/ through public/. The rule is
 * pilot-render-gate.mjs (the same one the pages use). The wave file is NEVER copied verbatim: the report withholds the
 * points of models it could not separate, and its machine twin must say no more than the page does
 * (docs/AI_MODEL_ASSESSMENT_TEMPLATE.md amendments 2, 8, 9; DECISIONS.md D-29a; defect class DC-24).
 *
 * Every directory written here is rebuilt from scratch on every run, so a stale file from an earlier preview build
 * cannot survive into a default build. public/data/ and public/ai-models/ are gitignored.
 */
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildModelBenchmarkIndex, loadFacts, loadRenderedReports, projectWavePublic, projectionProblems, reportMarkdown, reportsIndexRendersFor, dataDirs,
} from "./lib/model-benchmark-public.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const SITE = join(HERE, "..");
const OUT_WAVES = join(SITE, "public", "data", "model-waves");
const OUT_INDEX = join(SITE, "public", "data", "model-benchmark");
const OUT_MD = join(SITE, "public", "ai-models");
const NL = String.fromCharCode(10);

rmSync(OUT_WAVES, { recursive: true, force: true });
rmSync(OUT_INDEX, { recursive: true, force: true });
rmSync(OUT_MD, { recursive: true, force: true });

const rendering = loadRenderedReports(SITE);
if (rendering.length === 0) {
  console.log("[export-model-wave-public] no wave renders in this build; nothing written under public/data/model-waves, public/data/model-benchmark or public/ai-models.");
  process.exit(0);
}

const { waves, reports } = dataDirs(SITE);
mkdirSync(OUT_WAVES, { recursive: true });
mkdirSync(join(OUT_MD, "reports"), { recursive: true });
mkdirSync(OUT_INDEX, { recursive: true });

for (const { entry, mode, wave, title } of rendering) {
  const src = join(waves, `${entry.run_id}.json`);
  if (!existsSync(src)) {
    console.error(`[export-model-wave-public] FAIL: manifest lists ${entry.run_id} but ${src} is missing`);
    process.exit(1);
  }
  const pub = projectWavePublic(wave);
  const problems = projectionProblems(pub, wave);
  if (problems.length) {
    console.error(`[export-model-wave-public] FAIL: the public projection of ${entry.run_id} is wrong:${NL}  ${problems.join(NL + "  ")}`);
    process.exit(1);
  }
  writeFileSync(join(OUT_WAVES, `${entry.run_id}.json`), JSON.stringify(pub, null, 2) + NL);
  console.log(`[export-model-wave-public] ok ${entry.run_id} (${mode}) -> public/data/model-waves/${entry.run_id}.json (projection; ${pub.public_projection.withheld_for.length} model(s) with points withheld)`);

  const compiledPath = join(reports, `${entry.run_id}.json`);
  if (!existsSync(compiledPath)) {
    console.error(`[export-model-wave-public] FAIL: compiled report ${compiledPath} is missing; run build-model-reports.mjs first (prebuild does)`);
    process.exit(1);
  }
  const compiled = JSON.parse(readFileSync(compiledPath, "utf8"));
  const md = reportMarkdown(compiled, wave, title);
  if (md.includes("{{")) {
    console.error(`[export-model-wave-public] FAIL: the markdown alternate of ${entry.run_id} still carries an unresolved token`);
    process.exit(1);
  }
  writeFileSync(join(OUT_MD, "reports", `${entry.run_id}.md`), md);
  console.log(`[export-model-wave-public] ok ${entry.run_id} -> public/ai-models/reports/${entry.run_id}.md`);
}

const index = buildModelBenchmarkIndex({
  reports: rendering,
  facts: loadFacts(SITE),
  reportsIndexRenders: reportsIndexRendersFor(SITE),
});
writeFileSync(join(OUT_INDEX, "index.json"), JSON.stringify(index, null, 2) + NL);
console.log(`[export-model-wave-public] ok public/data/model-benchmark/index.json (${index.pilot_reports.length} pilot report(s))`);
