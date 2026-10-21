#!/usr/bin/env node
/**
 * build-model-watch-data.mjs -- prebuild step for the AI Model Watch derived data.
 *
 *   research/model-runs/weekly/QUEUE.json  ->  site/src/data/model-watch/queue-snapshot.json
 *   site/src/data/model-watch/editions/*.json -> site/src/data/model-watch/editions-manifest.json
 *
 * The queue snapshot is skipped (committed copy used) when research/ is absent: Docker copies only site/. The editions
 * manifest needs only site/ and is always rebuilt. Output is deterministic (no wall-clock stamps, DC-08) and a file is
 * rewritten only when its content changes. Exits 0 without research/.
 *
 * Flags (tests): --site-dir <dir>  --research-queue <path>
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { pathsFor, readEditions } from "./lib/model-watch-context.mjs";
import { buildEditionsManifest } from "./lib/model-watch-edition.mjs";
import { serialise } from "./lib/model-watch-core.mjs";
import { buildQueueSnapshot } from "./lib/model-watch-queue.mjs";

const arg = (n) => { const i = process.argv.indexOf(n); return i >= 0 ? process.argv[i + 1] : undefined; };
const siteDirArg = arg("--site-dir");
const paths = siteDirArg ? pathsFor({ siteDir: resolve(siteDirArg) }) : pathsFor();
const queuePath = arg("--research-queue") ? resolve(arg("--research-queue")) : paths.researchQueue;

function writeIfChanged(path, text) {
  if (existsSync(path) && readFileSync(path, "utf8") === text) return false;
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, text, "utf8");
  return true;
}

main();

function main() {
  if (existsSync(queuePath)) {
    const snap = buildQueueSnapshot(readFileSync(queuePath, "utf8"));
    const changed = writeIfChanged(paths.queueSnapshot, serialise(snap));
    console.log(`[build-model-watch-data] queue-snapshot.json ${changed ? "written" : "unchanged"} (${snap.entries.length} entries)`);
  } else {
    console.log(`[build-model-watch-data] ${queuePath} not present (expected in Docker build) - using committed queue-snapshot.json. Skipping regeneration.`);
  }
  const editions = readEditions(paths.editionsDir);
  const manifest = buildEditionsManifest(Object.values(editions));
  const changed = writeIfChanged(paths.editionsManifest, serialise(manifest));
  console.log(`[build-model-watch-data] editions-manifest.json ${changed ? "written" : "unchanged"} (${manifest.editions.length} edition(s))`);
}
