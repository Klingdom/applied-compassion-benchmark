#!/usr/bin/env node
/**
 * export-model-wave-public.mjs -- publish the wave file(s) that RENDER, nothing else.
 *
 *   site/src/data/model-benchmark/waves/<run_id>.json
 *     -> site/public/data/model-waves/<run_id>.json   (only when the wave renders)
 *
 * The report's JSON-LD `isBasedOn` points at this URL, so it must exist whenever the
 * report renders, and it must NOT exist when the report does not: the wave file
 * carries the pilot figures, and an unratified pilot's figures must not reach
 * out/ through public/. The rule is pilot-render-gate.mjs (the same one the pages use).
 *
 * The directory is rebuilt from scratch on every run, so a stale file from an earlier
 * preview build cannot survive into a default build. public/data/ is gitignored.
 */
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { renderableEntries } from "./lib/pilot-render-gate.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const SITE = join(HERE, "..");
const WAVES = join(SITE, "src", "data", "model-benchmark", "waves");
const OUT = join(SITE, "public", "data", "model-waves");

rmSync(OUT, { recursive: true, force: true });
const manifestPath = join(WAVES, "manifest.json");
const manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, "utf8")) : [];
const rendering = renderableEntries(manifest);
if (rendering.length === 0) {
  console.log("[export-model-wave-public] no wave renders in this build; public/data/model-waves/ not written.");
  process.exit(0);
}
mkdirSync(OUT, { recursive: true });
for (const { entry, mode } of rendering) {
  const src = join(WAVES, `${entry.run_id}.json`);
  if (!existsSync(src)) {
    console.error(`[export-model-wave-public] FAIL: manifest lists ${entry.run_id} but ${src} is missing`);
    process.exit(1);
  }
  writeFileSync(join(OUT, `${entry.run_id}.json`), readFileSync(src));
  console.log(`[export-model-wave-public] ok ${entry.run_id} (${mode}) -> public/data/model-waves/${entry.run_id}.json`);
}
