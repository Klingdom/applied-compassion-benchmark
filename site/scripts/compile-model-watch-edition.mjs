#!/usr/bin/env node
/**
 * compile-model-watch-edition.mjs -- compile a weekly AI Model Watch edition ONCE into immutable site JSON.
 * Manual (`npm run model-watch:edition`); never part of prebuild (docs/ARCHITECTURE_AI_MODEL_WATCH.md A3).
 *
 *   node scripts/compile-model-watch-edition.mjs --date 2026-10-16
 *       reads  research/model-watch/editions/<date>.json   (authored source, format below)
 *       writes site/src/data/model-watch/editions/<date>.json and rebuilds editions-manifest.json
 *       REFUSES to overwrite an existing compiled edition.
 *
 *   node scripts/compile-model-watch-edition.mjs --date 2026-10-16 --append-correction "<text>"
 *       appends {date: today, text} to corrections[] and changes nothing else (contentHash excludes corrections).
 *
 * Source format (research/model-watch/editions/<date>.json):
 *   { "date": "2026-10-16",
 *     "window": { "from": "2026-09-01", "to": "2026-10-16" },
 *     "lead": "<= 90 words; digits only via {{RELEASE_COUNT}} {{DISCLOSURE_COUNT}} {{WINDOW_DAYS}} or window dates",
 *     "coverage": { "scanned": ["..."], "notScanned": ["..."] },      // both required; [] must be explicit
 *     "measuredNote": null,                                           // or a short string
 *     "corrections": [] }
 *
 * Flags (tests): --site-dir <dir>  --source <path>  --today <YYYY-MM-DD>
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { pathsFor, readJsonIf, readEditions, buildValidatorContext } from "./lib/model-watch-context.mjs";
import { compileEdition, buildEditionsManifest } from "./lib/model-watch-edition.mjs";
import { validateEdition, textProblems, validateEditionTransition } from "./lib/model-watch-validator.mjs";
import { serialise, isIsoDate, todayIso } from "./lib/model-watch-core.mjs";
import { renderableEntries } from "./lib/pilot-render-gate.mjs";

const arg = (n) => { const i = process.argv.indexOf(n); return i >= 0 ? process.argv[i + 1] : undefined; };
const die = (lines) => { for (const l of [].concat(lines)) console.error(`FAIL ${l}`); process.exit(1); };

const siteDirArg = arg("--site-dir");
const paths = siteDirArg ? pathsFor({ siteDir: resolve(siteDirArg) }) : pathsFor();
const date = arg("--date");
if (!isIsoDate(date)) die("usage: --date <YYYY-MM-DD> [--append-correction \"<text>\"]");
const outPath = join(paths.editionsDir, `${date}.json`);
const today = arg("--today") ?? todayIso();

const catalog = readJsonIf(paths.catalog);
const log = readJsonIf(paths.log);
if (!catalog || !log) die("catalog-v1.json and release-log-v1.json must exist (run model-watch:import first)");
const ctx = buildValidatorContext(paths, { now: new Date(`${today}T12:00:00Z`) });

function writeManifest() {
  const manifest = buildEditionsManifest(Object.values(readEditions(paths.editionsDir)));
  writeFileSync(paths.editionsManifest, serialise(manifest), "utf8");
}

const correction = arg("--append-correction");
if (correction !== undefined) {
  if (!existsSync(outPath)) die(`no compiled edition at ${outPath}`);
  if (!correction.trim()) die("--append-correction needs non-empty text");
  const prior = JSON.parse(readFileSync(outPath, "utf8"));
  const lex = textProblems(correction, "correction", ctx);
  if (lex.length) die(lex);
  const next = { ...prior, corrections: [...prior.corrections, { date: today, text: correction.trim() }] };
  const problems = [...validateEdition({ edition: next, filename: `${date}.json`, log, catalog }, ctx).failures, ...validateEditionTransition(prior, next, `${date}.json`)];
  if (problems.length) die(problems);
  writeFileSync(outPath, serialise(next), "utf8");
  console.log(`[compile-model-watch-edition] appended correction dated ${today} to ${date}.json (nothing else changed)`);
  process.exit(0);
}

if (existsSync(outPath)) die(`${outPath} already exists: editions are immutable once compiled. Use --append-correction for a correction.`);
const sourcePath = arg("--source") ? resolve(arg("--source")) : join(paths.researchEditionsDir, `${date}.json`);
if (!existsSync(sourcePath)) die(`edition source not found: ${sourcePath}`);
const source = JSON.parse(readFileSync(sourcePath, "utf8"));
if (source.date !== date) die(`source date ${source.date} does not equal --date ${date}`);

const waveManifest = ctx.waveContext.manifest;
const { edition, errors } = compileEdition({
  source, log, catalog, queueSnapshot: readJsonIf(paths.queueSnapshot),
  renderable: renderableEntries(waveManifest, process.env, { reportsDir: paths.reportsDir }),
});
if (errors.length) die(errors.map((e) => `MW-E3: ${e}`));
const v = validateEdition({ edition, filename: `${date}.json`, log, catalog }, ctx);
if (v.failures.length) die(v.failures);

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, serialise(edition), "utf8");
writeManifest();
console.log(
  `[compile-model-watch-edition] wrote ${date}.json: ${edition.releases.length} release(s), ${edition.disclosures.length} disclosure(s), ` +
  `${edition.measured.reports.length} measured report(s), ${edition.sources.length} source(s); editions-manifest.json rebuilt`,
);
