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

import { existsSync, mkdirSync, writeFileSync, readFileSync, readdirSync, renameSync, statSync } from "node:fs";
import path from "node:path";
import {
  newSessionId,
  writeSessionFile,
  readSessionFile,
  sessionDir,
  ensureSessionDir,
  safeJsonParse,
} from "./session-store.mjs";

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
  const tmpPath = path.join(trialsDir, `.${safeItemId}__t${trialIndex}.${process.pid}.${Date.now()}.tmp`);
  writeFileSync(tmpPath, JSON.stringify(trial, null, 2) + "\n", "utf8");
  renameSync(tmpPath, filePath);
  return filePath;
}

// Parsed-trial cache, keyed by absolute file path.
//
// WHY: listRunTrials is called by nextItem, recordItemRating and run_status,
// i.e. on every step of a run. It re-read and re-parsed EVERY trial file each
// time, so a run of n trials performed O(n^2) file reads. Measured 2026-09-24
// on the real bank after it grew to 93 items: a complete 249-trial run spent
// 33s inside this function alone, rising quadratically (50 trials 1.4s, 100
// 5.4s, 150 12.1s, 200 21.3s). A complete run is the Evaluation Suite's
// headline use case, so that is a product defect, not a test annoyance.
//
// WHY IT IS STILL SAFE: disk remains the single source of truth. The cache is
// invalidated by the file's own mtime and size, so a trial file edited or
// replaced on disk between calls is re-parsed. finish_scored_run's refusal to
// trust in-memory state (the forged-run defence, tests/scored-run.test.mjs)
// therefore still holds: it sees exactly what is on disk, just without paying
// to re-parse bytes that have not changed.
const trialCache = new Map();

function readTrialCached(filePath) {
  let stat;
  try {
    stat = statSync(filePath);
  } catch {
    trialCache.delete(filePath);
    return null;
  }
  const stamp = `${stat.mtimeMs}:${stat.size}`;
  const hit = trialCache.get(filePath);
  if (hit && hit.stamp === stamp) return hit.value;
  const value = safeJsonParse(readFileSync(filePath, "utf8"));
  trialCache.set(filePath, { stamp, value });
  return value;
}

export function listRunTrials(root, runId) {
  const dir = sessionDir(root, runId);
  const trialsDir = path.join(dir, "trials");
  if (!existsSync(trialsDir)) return [];
  return readdirSync(trialsDir)
    .filter((f) => f.endsWith(".json") && !f.startsWith("."))
    .sort()
    .map((f) => readTrialCached(path.join(trialsDir, f)))
    .filter((t) => t !== null);
}

/** Test/maintenance hook: drop every cached parse. */
export function clearTrialCache() {
  trialCache.clear();
}
