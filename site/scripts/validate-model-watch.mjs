#!/usr/bin/env node
/**
 * validate-model-watch.mjs -- CLI for the AI Model Watch stores
 * (site/src/data/model-watch/{catalog-v1,release-log-v1,editions-manifest,queue-snapshot}.json and editions/*.json).
 *
 * Rules MW-S/K/L/T/F/X/E/W: docs/DATA_MODEL_AI_MODEL_WATCH.md section 6; logic in lib/model-watch-validator.mjs.
 * Runs in Docker (reads only site/; the append-only checks need git and are SKIPPED, with a named warning, when it is absent).
 * Failures exit 1. Warnings (including MW-W1 freshness, D-30) never fail the build.
 *
 * Flags: --no-git  skip the append-only (HEAD) comparison deliberately.
 */

import { pathsFor, readStores, buildValidatorContext, readPrior } from "./lib/model-watch-context.mjs";
import { validateModelWatchState } from "./lib/model-watch-validator.mjs";

const paths = pathsFor();
const stores = readStores(paths);
const failures = [];
for (const [name, v] of Object.entries({ "catalog-v1.json": stores.catalog, "release-log-v1.json": stores.log, "editions-manifest.json": stores.manifest })) {
  if (!v) failures.push(`MW-S1: ${name} is missing or unreadable under site/src/data/model-watch/`);
}
if (failures.length) {
  for (const f of failures) console.error(`FAIL ${f}`);
  process.exit(1);
}

const ctx = buildValidatorContext(paths);
const warnings = [];
let prior;
if (process.argv.includes("--no-git")) {
  warnings.push("MW-F2: SKIPPED (--no-git): append-only comparison with HEAD not run");
} else {
  const p = readPrior(paths);
  if (p.skipped) warnings.push(`MW-F2: SKIPPED: ${p.skipped}`);
  else prior = p;
}

const result = validateModelWatchState({ ...stores, prior }, ctx);
warnings.push(...result.warnings);
for (const w of warnings) console.warn(`WARN ${w}`);
for (const f of result.failures) console.error(`FAIL ${f}`);

console.log(
  `[validate-model-watch] ${stores.catalog.rows.length} catalog row(s), ${stores.log.rows.length} release-log row(s), ` +
  `${Object.keys(stores.editions).length} edition(s); ${ctx.withheldTokens.length} pilot-withheld token(s) checked (MW-T1); ` +
  `${result.failures.length} failure(s), ${warnings.length} warning(s)`,
);
process.exit(result.failures.length ? 1 : 0);
