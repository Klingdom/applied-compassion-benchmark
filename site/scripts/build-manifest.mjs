#!/usr/bin/env node

/**
 * build-manifest.mjs — Emit `public/build-manifest.json` describing the
 * deterministic state of the data layer at build time.
 *
 * Purpose:
 *  - Machine-readable record of what changed in this build (SHA-256 hashes
 *    per index file → trivial cache-bust signal for downstream consumers)
 *  - Verifiable contract between research pipeline output and shipped site
 *    (entity counts, methodology version, applied proposals)
 *  - Observability primitive for the /updates feed and any future build
 *    health checks
 *
 * Output schema (stable):
 *   {
 *     "buildDate":           ISO timestamp — when this build ran,
 *     "buildTimestamp":      epoch ms — when this build ran,
 *     "git":                 { sha, branch, dirty, source } — see gitInfo()
 *                             below; sha/branch/dirty are null (with a
 *                             "gitUnavailableReason" alongside them) if
 *                             neither an injected env var nor a local `.git`
 *                             was usable,
 *     "methodologyVersion":  "v1.2" (from scripts/lib/scoring.mjs),
 *     "indexes": [
 *       {
 *         "name":               "countries",
 *         "rankingsCount":      193,
 *         "entityCount":        193,
 *         "hash":               "sha256:...",
 *         "meanScore":          47.2,
 *         "medianScore":        45.0,
 *         "bands":              { Exemplary, Established, Functional, Developing, Critical },
 *         "floorDesignations":  3
 *       },
 *       ...
 *     ],
 *     "totalEntities":       1185,
 *     "totalFloorDesignations": 6,
 *     "recentAppliedProposals": [
 *       { slug, entity, index, decision, appliedDate }
 *     ]
 *   }
 *
 * Run as part of `npm run build` (before `next build`) so the file is
 * picked up by the static export and served at /build-manifest.json.
 *
 * DC-08 / BM-1 (2026-09-16): this file used to be committed to git AND
 * rewritten with a fresh `new Date()` on every build, so every build
 * produced a one-line diff on a tracked file with nothing legitimate to
 * review. It is now a build artifact, like `public/data/` — see
 * `site/.gitignore`. buildDate/buildTimestamp are genuinely "when did this
 * build run" facts; they belong in the artifact a build produces, not in
 * git history (the source data they summarize — src/data/indexes/*.json —
 * is already tracked and can be re-summarized for any past commit by
 * checking it out and running `npm run manifest`). The trade-off: `git log`
 * on this path no longer shows a history of past production build times;
 * that history now lives only in whatever built the artifact (CI logs /
 * the deployed file itself), not in this repo.
 *
 * Separately (BM-1): git.sha/git.branch/git.dirty must not silently become
 * a plausible-looking "unknown". The Docker builder stage (see ../../Dockerfile)
 * copies `site/` only — no `.git` — so shelling out to git inside it always
 * failed and always returned the string "unknown", which looked like real
 * data. gitInfo() now prefers GIT_SHA/GIT_BRANCH/GIT_DIRTY injected via
 * --build-arg (deploy.sh computes these on the host, where `.git` exists,
 * and passes them through docker-compose.yml's build.args), falls back to
 * shelling out to git (works for local `npm run build` / `npm run manifest`
 * outside Docker), and if both fail, emits sha/branch/dirty as `null` with
 * an explicit `gitUnavailableReason` string rather than inventing a sha.
 */

import { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { createHash } from "crypto";
import { execSync } from "child_process";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { METHODOLOGY_VERSION } from "./lib/scoring.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = join(__dirname, "..");
const INDEXES_DIR = join(SITE_ROOT, "src", "data", "indexes");
const PUBLIC_DIR = join(SITE_ROOT, "public");
const PROPOSALS_DIR = join(SITE_ROOT, "..", "research", "change-proposals");
const OUTPUT_PATH = join(PUBLIC_DIR, "build-manifest.json");
const RECENT_PROPOSAL_LIMIT = 20;

function sha256(content) {
  return "sha256:" + createHash("sha256").update(content).digest("hex");
}

// Returns the trimmed stdout, or null if the git command failed (not found,
// not a repo, no matching ref, etc). null — never a fallback string like
// "unknown" — so callers can tell "we don't know" apart from "we asked git
// and it told us so".
function git(args) {
  try {
    // stdio: pipe stderr too, so a missing-.git failure doesn't spam build
    // logs with git's own "fatal: not a git repository" — gitInfo() below
    // already turns a failure here into an explicit, explained result.
    return execSync(`git ${args}`, { cwd: SITE_ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
  } catch {
    return null;
  }
}

/**
 * Resolve the commit identity for this build. See the BM-1 note in the
 * file header for why this can no longer return a bare "unknown".
 *
 * Preference order:
 *   1. GIT_SHA / GIT_BRANCH / GIT_DIRTY env vars, injected at build time
 *      (e.g. Docker --build-arg from deploy.sh, which runs on the host
 *      where `.git` exists). This is the only reliable path inside the
 *      Docker builder stage, which never receives `.git`.
 *   2. Shelling out to `git` directly — works when `.git` is actually
 *      present (local `npm run build` / `npm run manifest`, or a CI runner
 *      that checks out full history).
 *   3. An explicit "we don't know, and here's why" record. No invented sha.
 */
function gitInfo() {
  const envSha = (process.env.GIT_SHA || "").trim();
  if (envSha) {
    const envBranch = (process.env.GIT_BRANCH || "").trim();
    const envDirty = (process.env.GIT_DIRTY || "").trim().toLowerCase();
    return {
      sha: envSha,
      branch: envBranch || null,
      dirty: envDirty === "true" ? true : envDirty === "false" ? false : null,
      source: "env",
    };
  }

  const sha = git("rev-parse --short HEAD");
  if (sha) {
    const branch = git("rev-parse --abbrev-ref HEAD");
    const status = git("status --porcelain");
    return {
      sha,
      branch,
      dirty: status === null ? null : status !== "",
      source: "git",
    };
  }

  return {
    sha: null,
    branch: null,
    dirty: null,
    source: "unavailable",
    gitUnavailableReason:
      "No GIT_SHA build-arg was injected and `git rev-parse` failed in this " +
      "environment (expected inside the Docker builder stage, which does not " +
      "receive .git — see Dockerfile). Pass --build-arg GIT_SHA=$(git rev-parse " +
      "--short HEAD) [and GIT_BRANCH, GIT_DIRTY] at build time, or run this " +
      "outside Docker where .git is present.",
  };
}

function summarizeIndex(filename) {
  const path = join(INDEXES_DIR, filename);
  const raw = readFileSync(path, "utf8");
  const data = JSON.parse(raw);
  const rankings = Array.isArray(data.rankings) ? data.rankings : [];

  const composites = rankings
    .map((r) => r.composite)
    .filter((c) => typeof c === "number");

  const meanScore = composites.length
    ? Math.round((composites.reduce((a, b) => a + b, 0) / composites.length) * 10) / 10
    : null;

  const sorted = [...composites].sort((a, b) => a - b);
  const medianScore = sorted.length
    ? sorted.length % 2 === 0
      ? Math.round(((sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2) * 10) / 10
      : sorted[Math.floor(sorted.length / 2)]
    : null;

  const bandCounts = { Exemplary: 0, Established: 0, Functional: 0, Developing: 0, Critical: 0 };
  for (const r of rankings) {
    const name = typeof r.band === "string"
      ? r.band.charAt(0).toUpperCase() + r.band.slice(1).toLowerCase()
      : null;
    if (name && bandCounts[name] !== undefined) bandCounts[name]++;
  }

  const floorDesignations = rankings.filter(
    (r) => r.floorDesignation && r.floorDesignation.designated === true,
  ).length;

  return {
    name: filename.replace(/\.json$/, ""),
    rankingsCount: rankings.length,
    entityCount: data.meta?.entityCount ?? rankings.length,
    hash: sha256(raw),
    meanScore,
    medianScore,
    bands: bandCounts,
    floorDesignations,
  };
}

function recentAppliedProposals(limit) {
  if (!existsSync(PROPOSALS_DIR)) return [];

  const files = readdirSync(PROPOSALS_DIR).filter((f) => f.endsWith(".json"));
  const applied = [];

  for (const f of files) {
    try {
      const data = JSON.parse(readFileSync(join(PROPOSALS_DIR, f), "utf8"));
      if (data.status !== "applied") continue;
      applied.push({
        slug: f.replace(/\.json$/, ""),
        entity: data.entity ?? null,
        index: data.index ?? null,
        decision: data.decision ?? null,
        appliedDate: data.applied_date ?? data.applied ?? data.date ?? null,
      });
    } catch {
      // Malformed proposal — skip silently; validate-indexes will surface upstream errors.
    }
  }

  // Most recent first by applied date (ISO-sortable).
  applied.sort((a, b) => {
    const da = a.appliedDate ?? "";
    const db = b.appliedDate ?? "";
    return db.localeCompare(da);
  });

  return applied.slice(0, limit);
}

// ---------------------------------------------------------------------------

const indexFiles = readdirSync(INDEXES_DIR).filter((f) => f.endsWith(".json"));
const indexes = indexFiles.map(summarizeIndex);

const totalEntities = indexes.reduce((s, i) => s + i.rankingsCount, 0);
const totalFloorDesignations = indexes.reduce((s, i) => s + i.floorDesignations, 0);

const now = new Date();
const manifest = {
  buildDate: now.toISOString(),
  buildTimestamp: now.getTime(),
  git: gitInfo(),
  methodologyVersion: METHODOLOGY_VERSION,
  indexes,
  totalEntities,
  totalFloorDesignations,
  recentAppliedProposals: recentAppliedProposals(RECENT_PROPOSAL_LIMIT),
};

if (!existsSync(PUBLIC_DIR)) {
  mkdirSync(PUBLIC_DIR, { recursive: true });
}

writeFileSync(OUTPUT_PATH, JSON.stringify(manifest, null, 2) + "\n", "utf8");

console.log(`build-manifest.mjs — wrote ${OUTPUT_PATH}`);
console.log(`  ${indexes.length} indexes · ${totalEntities} total entities · ${totalFloorDesignations} floor-designated`);
if (manifest.git.sha) {
  console.log(`  git ${manifest.git.sha} (${manifest.git.branch ?? "unknown branch"})${manifest.git.dirty ? " [dirty]" : ""} [source: ${manifest.git.source}]`);
} else {
  console.warn(`  git sha UNAVAILABLE — ${manifest.git.gitUnavailableReason}`);
}
console.log(`  methodology ${manifest.methodologyVersion} · ${manifest.recentAppliedProposals.length} recent proposals`);
