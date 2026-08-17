#!/usr/bin/env node
/**
 * Normalise change proposals to the schema apply-entity-record.mjs requires.
 *
 * WHY: the 2026-08-16 20.3-cluster study emitted proposals using `current` /
 * `proposed` with a nested `proposed_subdimensions` map. apply-entity-record.mjs
 * requires `proposed_scores` (required-field check, line ~259) and expects
 * `proposed_subdimensions` as a flat array of subdimension objects. All such
 * proposals fail the required-field check and cannot be applied.
 *
 * WHAT THIS DOES:
 *   - Adds `published_scores` and `proposed_scores` derived from `current` / `proposed`.
 *   - Rebuilds `proposed_subdimensions` as a flat array, sourced from the
 *     assessment's subdim sidecar so per-subdimension evidence is preserved.
 *   - Retains the original `current` / `proposed` keys (non-destructive).
 *
 * WHAT THIS DOES NOT DO:
 *   - Never invents a score, quote, URL, date or source.
 *   - Never alters a subdimension score.
 *   - Refuses to write if sidecar dimension means disagree with the proposal's
 *     own proposed dimension scores.
 *
 * Usage:
 *   node research/scripts/normalise-proposal-schema.mjs --check   # dry run
 *   node research/scripts/normalise-proposal-schema.mjs --write
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const PROPOSAL_DIR = path.join(ROOT, "research", "change-proposals");
const ASSESSMENT_DIR = path.join(ROOT, "research", "assessments");
const INDEX_DIR = path.join(ROOT, "site", "src", "data", "indexes");

const WRITE = process.argv.includes("--write");

// Explicit allowlist. This script must never sweep proposals it was not
// pointed at — other studies may be writing concurrently.
const TARGETS = [
  "zimbabwe",
  "republic-of-congo",
  "algeria",
  "cameroon",
  "guinea",
  "honduras",
  "uzbekistan",
  "papua-new-guinea",
];

const readJson = (p) => JSON.parse(fs.readFileSync(p, "utf8"));

function publishedRank(indexName, entityName) {
  const file = path.join(INDEX_DIR, `${indexName}.json`);
  if (!fs.existsSync(file)) return null;
  const raw = readJson(file);
  const list = Array.isArray(raw)
    ? raw
    : Object.values(raw.entities || raw.rankings || raw);
  const hit = list.find((e) => e && e.name === entityName);
  return hit ? (hit.rank ?? null) : null;
}

let failures = 0;
let changed = 0;

for (const slug of TARGETS) {
  const proposalPath = path.join(PROPOSAL_DIR, `${slug}.json`);
  if (!fs.existsSync(proposalPath)) {
    console.error(`SKIP  ${slug} — no proposal file`);
    failures++;
    continue;
  }

  const proposal = readJson(proposalPath);

  if (proposal.proposed_scores && Array.isArray(proposal.proposed_subdimensions)) {
    console.log(`OK    ${slug} — already conforming, untouched`);
    continue;
  }

  if (!proposal.proposed?.scores || !proposal.current?.scores) {
    console.error(`FAIL  ${slug} — no current/proposed scores to derive from`);
    failures++;
    continue;
  }

  // Sidecar carries per-subdimension evidence; it is the only honest source
  // for the flat array. Without it we would have to invent evidence.
  const sidecarPath = path.join(
    ASSESSMENT_DIR,
    `${slug}-${proposal.proposal_date || "2026-08-16"}.subdims.json`,
  );
  if (!fs.existsSync(sidecarPath)) {
    console.error(`FAIL  ${slug} — sidecar missing: ${path.basename(sidecarPath)}`);
    failures++;
    continue;
  }
  const sidecar = readJson(sidecarPath);

  const byDim = {};
  for (const sd of sidecar.subdimensions || []) {
    (byDim[sd.dimension] = byDim[sd.dimension] || []).push(sd);
  }

  // Integrity gate: every proposed dimension score must equal the mean of its
  // five sidecar subdimension scores. Refuse rather than paper over a mismatch.
  const mismatches = [];
  for (const [dim, target] of Object.entries(proposal.proposed.scores)) {
    const subs = byDim[dim];
    if (!subs || subs.length !== 5) {
      mismatches.push(`${dim}: ${subs ? subs.length : 0} subdims`);
      continue;
    }
    const mean =
      Math.round((subs.reduce((a, b) => a + b.score, 0) / subs.length) * 100) / 100;
    if (Math.abs(mean - target) > 0.005) {
      mismatches.push(`${dim}: sidecar mean ${mean} != proposed ${target}`);
    }
  }
  if (mismatches.length) {
    console.error(`FAIL  ${slug} — ${mismatches.join("; ")}`);
    failures++;
    continue;
  }

  // Only dimensions whose raw score changed need subdimension entries.
  const changedDims = Object.entries(proposal.proposed.scores)
    .filter(([dim, v]) => proposal.current.scores[dim] !== v)
    .map(([dim]) => dim);

  const flatSubdims = [];
  for (const dim of changedDims) {
    for (const sd of byDim[dim]) {
      flatSubdims.push({
        code: sd.code,
        dimension: sd.dimension,
        name: sd.name,
        score: sd.score,
        confidence: sd.confidence,
        assessed_date: sd.assessed_date,
        evidence: sd.evidence || [],
      });
    }
  }

  const out = { ...proposal };
  out.published_scores = {
    composite: proposal.current.composite,
    band: proposal.current.band,
    rank: publishedRank(proposal.index, proposal.entity),
    dimensions: { ...proposal.current.scores },
  };
  out.proposed_scores = {
    composite: proposal.proposed.composite,
    band: proposal.proposed.band,
    dimensions: { ...proposal.proposed.scores },
  };
  out.proposed_subdimensions = flatSubdims;
  out.schema_normalised = {
    date: new Date().toISOString().slice(0, 10),
    reason:
      "Rewritten from current/proposed + nested subdim map into the shape " +
      "apply-entity-record.mjs requires. Subdimension scores and evidence " +
      "copied verbatim from the assessment sidecar; nothing re-scored.",
    source_sidecar: path.relative(ROOT, sidecarPath).replace(/\\/g, "/"),
  };

  console.log(
    `${WRITE ? "WROTE" : "READY"} ${slug} — ${changedDims.length} changed dims, ` +
      `${flatSubdims.length} subdims, rank ${out.published_scores.rank}`,
  );

  if (WRITE) fs.writeFileSync(proposalPath, JSON.stringify(out, null, 2) + "\n");
  changed++;
}

console.log(
  `\n${WRITE ? "Wrote" : "Would write"} ${changed} proposal(s); ${failures} failure(s).`,
);
process.exit(failures ? 1 : 0);
