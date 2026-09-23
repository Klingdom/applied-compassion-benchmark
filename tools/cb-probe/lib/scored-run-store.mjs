// lib/scored-run-store.mjs
//
// Persistence for scored runs, under the SAME artifact root and the SAME
// safety guarantees as lib/session-store.mjs (J3: refuses to write inside
// this repo or any git working tree). Deliberately reuses session-store's
// generic id/dir/file helpers rather than re-implementing file I/O -- a run
// and a judge session both write to "<artifactRoot>/<uuid>/...", just with
// different filenames inside that directory (run.json + trials/ +
// exposure-probe.json + scorecard.json, vs session.json + estimates/ +
// judge-estimate.json), so there is exactly one place that knows how to
// safely resolve and write an id-scoped directory.

import { existsSync, mkdirSync, writeFileSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { newSessionId, writeSessionFile, readSessionFile, sessionDir, ensureSessionDir } from "./session-store.mjs";

export const newRunId = newSessionId;
export const writeRunFile = writeSessionFile;
export const readRunFile = readSessionFile;
export const runDir = sessionDir;

export function appendRunTrial(root, runId, itemId, trialIndex, trial) {
  const dir = ensureSessionDir(root, runId);
  const trialsDir = path.join(dir, "trials");
  mkdirSync(trialsDir, { recursive: true });
  const safeItemId = itemId.replace(/[^a-zA-Z0-9-]/g, "_");
  const filePath = path.join(trialsDir, `${safeItemId}__t${trialIndex}.json`);
  writeFileSync(filePath, JSON.stringify(trial, null, 2) + "\n", "utf8");
  return filePath;
}

export function listRunTrials(root, runId) {
  const dir = sessionDir(root, runId);
  const trialsDir = path.join(dir, "trials");
  if (!existsSync(trialsDir)) return [];
  return readdirSync(trialsDir)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map((f) => JSON.parse(readFileSync(path.join(trialsDir, f), "utf8")));
}
