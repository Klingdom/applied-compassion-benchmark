#!/usr/bin/env node
/**
 * import-model-watch.mjs -- manual promotion of the research catalog and release log into the site stores.
 * Run by `npm run model-watch:import -- ...`; NEVER part of prebuild (docs/ARCHITECTURE_AI_MODEL_WATCH.md A2: the founder
 * approves each commit, and Docker has no research/).
 *
 * Usage:
 *   node scripts/import-model-watch.mjs --catalog <path> --releases <path> --as-of <YYYY-MM-DD> [--check] [--dry-run]
 *
 *   (default)  normalise, validate, merge, write catalog-v1.json and release-log-v1.json
 *   --dry-run  do everything except write; exits 0 only if the files would import cleanly
 *   --site-dir <dir>  operate on another site/ tree (tests and scratch proofs)
 *   --check    write nothing; exit 1 if the output would differ from the committed stores
 *              (run after an import: a second run must exit 0, i.e. the import is idempotent)
 *
 * Contract (docs/DATA_MODEL_AI_MODEL_WATCH.md section 4): known synonyms are mapped, every other unknown value fails the
 * import; rows are merged by id and never deleted; the log's frozen fields must match; registry-v1.json and releases-v1.json
 * are asserted byte-unchanged (MW-X3).
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { relative, resolve } from "node:path";
import { pathsFor, readJsonIf, buildValidatorContext } from "./lib/model-watch-context.mjs";
import { normaliseCatalog, normaliseReleases, mergeCatalog, mergeLog, guardProblems } from "./lib/model-watch-import.mjs";
import { validateCatalog, validateReleaseLog, validateCatalogTransition, validateLogTransition } from "./lib/model-watch-validator.mjs";
import { serialise, sha256Text, isIsoDate } from "./lib/model-watch-core.mjs";

function arg(name) {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : undefined;
}
const flag = (n) => process.argv.includes(n);

const siteDirArg = arg("--site-dir");
const paths = siteDirArg ? pathsFor({ siteDir: resolve(siteDirArg) }) : pathsFor();
const catalogArg = arg("--catalog");
const releasesArg = arg("--releases");
const asOf = arg("--as-of");
const check = flag("--check");
const dryRun = flag("--dry-run");

const die = (lines) => { for (const l of [].concat(lines)) console.error(`FAIL ${l}`); process.exit(1); };
if (!catalogArg || !releasesArg || !asOf) die("usage: --catalog <path> --releases <path> --as-of <YYYY-MM-DD> [--check] [--dry-run]");
if (!isIsoDate(asOf)) die(`--as-of must be an ISO date, got "${asOf}"`);
for (const p of [catalogArg, releasesArg]) if (!existsSync(p)) die(`file not found: ${p}`);

const catalogAbs = resolve(catalogArg);
const releasesAbs = resolve(releasesArg);
const rel = (p) => relative(paths.repoRoot, p).replace(/\\/g, "/");
const catalogText = readFileSync(catalogAbs, "utf8");
const releasesText = readFileSync(releasesAbs, "utf8");
const catalogResearch = JSON.parse(catalogText);
const releasesResearch = JSON.parse(releasesText);
if (catalogResearch.asOf !== asOf) die(`catalog file asOf (${catalogResearch.asOf}) does not equal --as-of (${asOf})`);
if (releasesResearch.asOf !== asOf) die(`releases file asOf (${releasesResearch.asOf}) does not equal --as-of (${asOf})`);

const guarded = [paths.registry, paths.releases];
const hashGuarded = () => guarded.map((p) => (existsSync(p) ? sha256Text(readFileSync(p, "utf8")) : "absent"));
const guardedBefore = hashGuarded();

const errors = [];
const warnings = [];
const cat = normaliseCatalog(catalogResearch);
const rel2 = normaliseReleases(releasesResearch, cat.rows);
errors.push(...cat.errors.map((e) => `catalog: ${e}`), ...rel2.errors.map((e) => `releases: ${e}`));
warnings.push(...cat.notes, ...rel2.notes);

const existingCatalog = readJsonIf(paths.catalog);
const existingLog = readJsonIf(paths.log);
const catSrc = { path: rel(catalogAbs), sha256: sha256Text(catalogText) };
const logSrc = { path: rel(releasesAbs), sha256: sha256Text(releasesText) };

const mc = mergeCatalog(existingCatalog, cat.rows, { asOf, sourceFile: catSrc });
const ml = mergeLog(existingLog, rel2.rows, { asOf, sourceFile: logSrc });
errors.push(...mc.errors.map((e) => `catalog merge: ${e}`), ...ml.errors.map((e) => `log merge: ${e}`));
warnings.push(...mc.warnings, ...ml.warnings);

// Validate the merged stores with the production validator (same rules as `npm run validate:model-watch`).
const ctx = buildValidatorContext(paths);
const vc = validateCatalog(mc.store, ctx);
const vl = validateReleaseLog(ml.store, { ...ctx, catalogIds: new Set(mc.store.rows.map((r) => r.id)) });
errors.push(...vc.failures, ...vl.failures, ...validateCatalogTransition(existingCatalog, mc.store), ...validateLogTransition(existingLog, ml.store));
warnings.push(...vc.warnings, ...vl.warnings);

// Idempotence probe: importing the same input again must change nothing.
const mc2 = mergeCatalog(mc.store, cat.rows, { asOf, sourceFile: catSrc });
const ml2 = mergeLog(ml.store, rel2.rows, { asOf, sourceFile: logSrc });
if (serialise(mc2.store) !== serialise(mc.store) || serialise(ml2.store) !== serialise(ml.store)) errors.push("import is not idempotent: a second pass over the same input changed the stores");

for (const w of warnings) console.warn(`WARN ${w}`);
if (errors.length) {
  console.error(`\n[import-model-watch] ${errors.length} problem(s); nothing written.`);
  die(errors);
}

const outCatalog = serialise(mc.store);
const outLog = serialise(ml.store);
const summary = `${mc.store.rows.length} catalog row(s) (${cat.rows.length} in input), ${ml.store.rows.length} release-log row(s) (${rel2.rows.length} in input), ` +
  `${ml.store.rows.filter((r) => r.sources.length === 0).length} unsourced row(s)`;

if (check) {
  const diffs = [];
  if (!existsSync(paths.catalog) || readFileSync(paths.catalog, "utf8") !== outCatalog) diffs.push(rel(paths.catalog));
  if (!existsSync(paths.log) || readFileSync(paths.log, "utf8") !== outLog) diffs.push(rel(paths.log));
  if (diffs.length) die(`--check: the import would change ${diffs.join(", ")}`);
  console.log(`[import-model-watch] --check: stores already match the input. ${summary}`);
  process.exit(0);
}
if (dryRun) {
  console.log(`[import-model-watch] --dry-run OK, nothing written. ${summary}; ${warnings.length} warning(s); second pass is a no-op (idempotent).`);
  process.exit(0);
}

writeFileSync(paths.catalog, outCatalog, "utf8");
writeFileSync(paths.log, outLog, "utf8");
const guardFailures = guardProblems(guardedBefore, hashGuarded());
if (guardFailures.length) die(guardFailures);
console.log(`[import-model-watch] wrote catalog-v1.json and release-log-v1.json. ${summary}. MW-X3 ok (registry-v1.json, releases-v1.json byte-unchanged).`);
