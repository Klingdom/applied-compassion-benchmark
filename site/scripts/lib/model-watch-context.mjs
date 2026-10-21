/**
 * model-watch-context.mjs -- the I/O half of the AI Model Watch tooling: where files live and how
 * the validator's context (waves, queue tags, withheld numbers, committed copies) is read.
 *
 * Everything that must work in Docker (no research/, Node 20, no git) reads only from site/.
 */

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { withheldValues } from "./model-report-html-gates.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
export const SITE_DIR = join(HERE, "..", "..");
export const REPO_ROOT = join(SITE_DIR, "..");

export function pathsFor({ siteDir = SITE_DIR, repoRoot = join(siteDir, "..") } = {}) {
  const mw = join(siteDir, "src", "data", "model-watch");
  const bench = join(siteDir, "src", "data", "model-benchmark");
  return {
    siteDir, repoRoot,
    mw,
    catalog: join(mw, "catalog-v1.json"),
    log: join(mw, "release-log-v1.json"),
    queueSnapshot: join(mw, "queue-snapshot.json"),
    editionsDir: join(mw, "editions"),
    editionsManifest: join(mw, "editions-manifest.json"),
    registry: join(bench, "registry-v1.json"),
    releases: join(bench, "releases-v1.json"),
    wavesDir: join(bench, "waves"),
    reportsDir: join(bench, "reports"),
    researchQueue: join(repoRoot, "research", "model-runs", "weekly", "QUEUE.json"),
    researchEditionsDir: join(repoRoot, "research", "model-watch", "editions"),
    insightsDir: join(siteDir, "src", "data", "insights"),
    researchInsightsDir: join(repoRoot, "research", "insights"),
  };
}

export const readJson = (p) => JSON.parse(readFileSync(p, "utf8"));
export const readJsonIf = (p) => (existsSync(p) ? readJson(p) : null);

/** Compiled editions keyed by filename, e.g. {"2026-10-16.json": {...}}. */
export function readEditions(editionsDir) {
  const out = {};
  if (!existsSync(editionsDir)) return out;
  for (const f of readdirSync(editionsDir).filter((x) => x.endsWith(".json")).sort()) out[f] = readJson(join(editionsDir, f));
  return out;
}

export function readStores(paths) {
  return {
    catalog: readJsonIf(paths.catalog),
    log: readJsonIf(paths.log),
    editions: readEditions(paths.editionsDir),
    manifest: readJsonIf(paths.editionsManifest),
    queueSnapshot: readJsonIf(paths.queueSnapshot),
  };
}

/** Waves and the numbers they withhold (MW-T1), plus every subject-build tag (MW-F1). */
export function readWaveContext(paths) {
  const mp = join(paths.wavesDir, "manifest.json");
  const manifest = existsSync(mp) ? readJson(mp) : [];
  const waves = manifest.map((e) => readJson(join(paths.wavesDir, `${e.run_id}.json`)));
  const waveTags = new Set();
  const tokens = new Set();
  for (const w of waves) {
    for (const b of Object.values(w.design?.subject_builds ?? {})) if (b?.tag) waveTags.add(b.tag);
    const v = withheldValues(w);
    for (const t of [...v.allComposites, ...v.allIntervalEnds, ...v.bounds]) tokens.add(t);
  }
  return { manifest, waves, waveTags, withheldTokens: [...tokens].sort() };
}

export function readReleaseWatchIds(paths) {
  const s = readJsonIf(paths.releases);
  if (!s) return null;
  return new Set((s.releases ?? []).map((r) => r.release_id));
}

/** Validator context from disk. */
export function buildValidatorContext(paths, { now = new Date() } = {}) {
  const wc = readWaveContext(paths);
  const snap = readJsonIf(paths.queueSnapshot);
  const rq = readJsonIf(paths.researchQueue);
  const queueTags = new Set((snap?.entries ?? rq?.entries ?? []).map((e) => e.tag));
  return { now, queueTags, waveTags: wc.waveTags, withheldTokens: wc.withheldTokens, releaseWatchIds: readReleaseWatchIds(paths), waveContext: wc };
}

/** Committed (HEAD) copy of a repo-relative file, parsed; null when git or the file is unavailable. */
export function gitHeadJson(repoRoot, absPath) {
  try {
    const rel = relative(repoRoot, absPath).replace(/\\/g, "/");
    const out = execFileSync("git", ["show", `HEAD:${rel}`], { cwd: repoRoot, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], maxBuffer: 64 * 1024 * 1024 });
    return JSON.parse(out);
  } catch {
    return null;
  }
}

export function gitAvailable(repoRoot) {
  try {
    execFileSync("git", ["rev-parse", "--is-inside-work-tree"], { cwd: repoRoot, stdio: ["ignore", "pipe", "ignore"] });
    return true;
  } catch {
    return false;
  }
}

/** HEAD copies of the three stores and every committed edition, or {skipped: reason}. */
export function readPrior(paths) {
  if (!gitAvailable(paths.repoRoot)) return { skipped: "git is not available (e.g. a Docker build); append-only checks SKIPPED" };
  let editionFiles = [];
  try {
    const rel = relative(paths.repoRoot, paths.editionsDir).replace(/\\/g, "/");
    editionFiles = execFileSync("git", ["ls-tree", "--name-only", "HEAD", `${rel}/`], { cwd: paths.repoRoot, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] })
      .split("\n").map((s) => s.trim()).filter((s) => s.endsWith(".json")).map((s) => s.slice(s.lastIndexOf("/") + 1));
  } catch { editionFiles = []; }
  const editions = {};
  for (const f of editionFiles) {
    const e = gitHeadJson(paths.repoRoot, join(paths.editionsDir, f));
    if (e) editions[f] = e;
  }
  return { catalog: gitHeadJson(paths.repoRoot, paths.catalog), log: gitHeadJson(paths.repoRoot, paths.log), editions };
}
