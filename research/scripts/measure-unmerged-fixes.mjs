#!/usr/bin/env node
/**
 * measure-unmerged-fixes.mjs — D1-1 / D-47.
 *
 * Answers one question: how many known fixes exist on the working branch and
 * are absent from `main`, and therefore invisible to every reader?
 *
 * WHY THIS EXISTS
 *   Iteration 68 set out to implement OBS-1 — "the build cannot name its own
 *   commit" — and found it was already implemented, on 2026-09-16, nine days
 *   BEFORE the production build that reports `git.sha: null`. The fix was never
 *   merged. `main` has no GIT_SHA in docker-compose.yml and none in deploy.sh.
 *
 *   That reframes the backlog: an item can read as open while its fix sits
 *   finished on a branch, and the loop cannot tell the difference by reading
 *   its own notes. So this measures it instead.
 *
 * DISCIPLINE
 *   Each probe names a marker and the file it lives in, and is evaluated on
 *   BOTH sides. A marker found on neither side is reported INDETERMINATE and
 *   excluded from the count, never counted as a finding — the first run did
 *   exactly that, because I had chosen a marker ("singapore-global-cities")
 *   that had been REMOVED from its file when Singapore was pinned.
 *
 * Usage:
 *   node research/scripts/measure-unmerged-fixes.mjs
 */

/**
 * Which known defects are already fixed on the working branch but absent from
 * main — and therefore invisible to every reader?
 *
 * Each probe states a marker, the file it should appear in, and which side
 * should have it. A probe is only meaningful if it can distinguish the two
 * sides, so every row is checked on BOTH and a row that matches on neither (or
 * both) is reported as INDETERMINATE rather than as a finding.
 */
import { execFileSync } from "node:child_process";

import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

function fileAt(ref, path) {
  try {
    return execFileSync("git", ["show", `${ref}:${path}`], { cwd: REPO, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  } catch {
    return null;
  }
}

const PROBES = [
  ["OBS-1 / D1-1(d): build can name its own commit", "docker-compose.yml", "GIT_SHA"],
  ["OBS-1 / D1-1(d): deploy.sh exports the commit", "deploy.sh", "GIT_SHA"],
  ["D1-1(a): deploy is workflow_dispatch-only", ".github/workflows/deploy.yml", "workflow_dispatch"],
  ["MS-5 disproof published", "site/src/app/ai-models/page.tsx", "rewarded flatness"],
  ["AI Evaluation Suite exists", "site/src/app/ai-evaluation-suite/page.tsx", "anchors"],
  ["Anchor corrections published", "site/src/data/model-benchmark/anchor-corrections-v1.json", "AC-001"],
  ["Item triage record exists", "site/src/data/model-benchmark/item-triage-v1.json", "full-2026-09-29"],
  ["RISK-023: encoded-name gate", "site/package.json", "test:encoded-names"],
  ["Feed freshness gate (PUB-1)", "site/package.json", "test:feed-freshness"],
  // Marker chosen badly the first time: "singapore-global-cities" was REMOVED
  // from this list when Singapore was pinned, so it appears on neither side and
  // the probe reported itself void rather than inventing a finding.
  ["Slug collision ratchet", "site/scripts/known-collisions.json", "may only shrink"],
  ["Rotation-state validator", "site/package.json", "test:rotation-state"],
  ["Entity-record invariance gate", "site/package.json", "test:entity-records"],
  ["MIT licence (D-42)", "LICENSE", "MIT"],
  ["Model score history", "site/package.json", "test:model-score-history"],
  ["Submission validator", "site/package.json", "test:submission-validator"],
];

console.log("Known fixes: present on the working branch, absent from main?\n");
console.log("| fix | on HEAD | on main | status |");
console.log("|---|---|---|---|");

let unmerged = 0;
let indeterminate = 0;
for (const [label, path, marker] of PROBES) {
  const head = fileAt("HEAD", path);
  const main = fileAt("main", path);
  const onHead = head !== null && head.includes(marker);
  const onMain = main !== null && main.includes(marker);
  let status;
  if (onHead && !onMain) {
    status = "**UNMERGED — invisible to readers**";
    unmerged += 1;
  } else if (onHead && onMain) {
    status = "already live";
  } else if (!onHead && !onMain) {
    status = "INDETERMINATE — marker found on neither side, probe is void";
    indeterminate += 1;
  } else {
    status = "on main but not HEAD (!)";
  }
  console.log(`| ${label} | ${onHead ? "yes" : "no"} | ${onMain ? "yes" : "no"} | ${status} |`);
}

console.log("");
console.log(`unmerged fixes: ${unmerged} of ${PROBES.length}`);
console.log(`void probes (excluded from the count): ${indeterminate}`);

// Scale of the divergence, for context.
const stat = execFileSync("git", ["diff", "--shortstat", "main..HEAD"], { cwd: REPO, encoding: "utf8" }).trim();
console.log(`\nmain..HEAD: ${stat}`);
const readerFiles = execFileSync(
  "git",
  ["diff", "--name-only", "main..HEAD", "--", "site/src/app", "site/src/components", "site/src/data/indexes", "site/public"],
  { cwd: REPO, encoding: "utf8" }
)
  .split("\n")
  .filter(Boolean);
console.log(`reader-visible files changed between main and HEAD: ${readerFiles.length}`);
