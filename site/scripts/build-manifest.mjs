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
 *     "buildDate":           ISO timestamp,
 *     "buildTimestamp":      epoch ms,
 *     "git":                 { sha, branch, dirty },
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

function git(args, fallback = null) {
  try {
    return execSync(`git ${args}`, { cwd: SITE_ROOT, encoding: "utf8" }).trim();
  } catch {
    return fallback;
  }
}

function gitInfo() {
  const sha = git("rev-parse --short HEAD", "unknown");
  const branch = git("rev-parse --abbrev-ref HEAD", "unknown");
  const dirty = git("status --porcelain", "") !== "";
  return { sha, branch, dirty };
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
console.log(`  git ${manifest.git.sha} (${manifest.git.branch})${manifest.git.dirty ? " [dirty]" : ""}`);
console.log(`  methodology ${manifest.methodologyVersion} · ${manifest.recentAppliedProposals.length} recent proposals`);
