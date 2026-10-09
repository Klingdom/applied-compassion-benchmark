#!/usr/bin/env node
/**
 * prepush-clean.mjs — run the full test chain in a CLEAN worktree of a commit, the way CI does.
 * Meta-review 10 R1 / backlog PREPUSH-CLEAN; gate for DC-08 (a tracked or generated output that depends on the
 * machine that built it).
 *
 * Why: on 2026-10-02 the working-tree chain passed twice for commits that then failed CI, because this machine had
 * state CI does not: a CRLF working copy, and gitignored compiled reports left by an earlier build. A clean worktree
 * of the commit has neither.
 *
 *   npm run prepush:clean                 # tests HEAD
 *   node scripts/prepush-clean.mjs --ref <commit>
 *   node scripts/prepush-clean.mjs --ref <commit> --expect-fail    # negative control: exit 0 only if the chain FAILS
 *
 * node_modules is linked into the worktree (a junction on Windows, a symlink elsewhere) rather than reinstalled,
 * and the link is removed BEFORE the worktree is deleted: a recursive delete through a junction would delete the
 * real node_modules.
 */
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, symlinkSync, unlinkSync, rmSync, lstatSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const SITE = resolve(here, "..");
const REPO = resolve(SITE, "..");
const args = process.argv.slice(2);
const refIdx = args.indexOf("--ref");
const ref = refIdx >= 0 ? args[refIdx + 1] : "HEAD";
const expectFail = args.includes("--expect-fail");
const git = (a, opts = {}) => execFileSync("git", a, { cwd: REPO, encoding: "utf8", ...opts }).trim();

const sha = git(["rev-parse", "--short", ref]);

// --records-only (Iteration 99): a faster path for commits that change ONLY governance records. It runs the gates
// that read those records instead of the whole chain, still in a clean worktree. It refuses unless every path
// changed since --base (default origin/main) is a record, so a script, data file or page can never slip through it.
const recordsOnly = args.includes("--records-only");
const baseIdx = args.indexOf("--base");
const baseRef = baseIdx >= 0 ? args[baseIdx + 1] : "origin/main";
const RECORD_PATHS = [
  /^ITERATION_LOG\.md$/, /^SYSTEM_HEALTH\.md$/, /^CHANGELOG\.md$/, /^IMPROVEMENT_BACKLOG\.md$/, /^RISKS\.md$/,
  /^docs\/[^/]+\.md$/, /^docs\/ai-model-report\/.+\.md$/, /^research\/model-assessments\/[^/]+\.md$/,
];
const RECORD_GATES = [
  "test:no-control-bytes", "test:content-loss", "test:health-freshness", "test:iteration-log-coverage",
  "test:iteration-log-silence", "test:meta-review-cadence", "test:commit-message-tokens", "test:backlog-ids",
  "test:known-misdated-claims",
];
export function nonRecordPaths(paths) {
  return paths.filter((p) => !RECORD_PATHS.some((re) => re.test(p)));
}
let changed = [];
if (recordsOnly) {
  changed = git(["diff", "--name-only", `${baseRef}...${sha}`]).split(String.fromCharCode(10)).filter(Boolean);
  const offending = nonRecordPaths(changed);
  if (changed.length === 0) {
    console.error(`prepush-clean: --records-only refused: no change between ${baseRef} and ${sha}; nothing to check.`);
    process.exit(expectFail ? 0 : 1);
  }
  if (offending.length > 0) {
    console.error(`prepush-clean: --records-only refused: ${offending.length} changed path(s) are not records, so the full chain is required:`);
    for (const p of offending.slice(0, 10)) console.error("  " + p);
    process.exit(expectFail ? 0 : 1);
  }
  console.log(`prepush-clean: --records-only accepted: ${changed.length} record path(s) changed since ${baseRef}.`);
}
const dirtyCount = git(["status", "--porcelain"]).split(String.fromCharCode(10)).filter(Boolean).length;
if (ref === "HEAD" && dirtyCount > 0) {
  console.warn(`prepush-clean: note: ${dirtyCount} uncommitted path(s) are NOT tested; this checks the commit ${sha} only.`);
}
const nodeModules = join(SITE, "node_modules");
if (!existsSync(nodeModules)) {
  console.error("prepush-clean: FAIL site/node_modules is missing; run npm install first.");
  process.exit(1);
}

// Unlink a node_modules junction/symlink WITHOUT following it. Returns false (and says so) if it cannot.
function unlinkModulesLink(p) {
  try {
    if (existsSync(p) && lstatSync(p).isSymbolicLink()) unlinkSync(p);
    else if (existsSync(p)) { console.error(`prepush-clean: ${p} is not a link; refusing to delete it.`); return false; }
    return true;
  } catch (e) {
    console.error(`prepush-clean: could not unlink ${p}: ${e.message}. Remove it by hand (rmdir), NOT recursively.`);
    return false;
  }
}

// Startup sweep (Iteration 99): a run killed mid-chain (for example by an outer `timeout`) never reaches its
// finally block, and spawnSync blocks signal handlers, so it leaves a worktree holding a junction to the REAL
// node_modules. Removing that recursively could follow the junction. So every run first clears orphans the safe
// way: unlink the junction, check the real node_modules, then remove the worktree.
for (const line of git(["worktree", "list", "--porcelain"]).split(String.fromCharCode(10))) {
  if (!line.startsWith("worktree ")) continue;
  const p = line.slice("worktree ".length).trim();
  if (!/cb-prepush-[^/\\]+[/\\]wt$/.test(p)) continue;
  console.warn(`prepush-clean: clearing an orphaned worktree from an interrupted run: ${p}`);
  if (!unlinkModulesLink(join(p, "site", "node_modules"))) process.exit(1);
  if (!existsSync(join(nodeModules, "next"))) { console.error("prepush-clean: ALERT the real node_modules looks damaged; stopping."); process.exit(1); }
  try { git(["worktree", "remove", "--force", p]); } catch { /* prune below */ }
  rmSync(dirname(p), { recursive: true, force: true });
}
git(["worktree", "prune"]);

const base = mkdtempSync(join(tmpdir(), "cb-prepush-"));
const wt = join(base, "wt");
let status = 1;
let linkPath = null;
try {
  git(["worktree", "add", "--detach", "-q", wt, sha]);
  linkPath = join(wt, "site", "node_modules");
  symlinkSync(nodeModules, linkPath, process.platform === "win32" ? "junction" : "dir");
  const npm = process.platform === "win32" ? "npm.cmd" : "npm";
  const opts = { cwd: join(wt, "site"), stdio: "inherit", shell: process.platform === "win32", env: { ...process.env, CB_PRE_PUSH_CLEAN: "1" } };
  if (recordsOnly) {
    console.log(`prepush-clean: running ${RECORD_GATES.length} record gates on ${sha} in a clean worktree (${wt})`);
    status = 0;
    for (const g of RECORD_GATES) {
      const r = spawnSync(npm, ["run", "-s", g], opts);
      if (r.status !== 0) { console.error(`prepush-clean: record gate ${g} FAILED (exit ${r.status})`); status = 1; }
    }
  } else {
    console.log(`prepush-clean: running the full chain on ${sha} in a clean worktree (${wt})`);
    const r = spawnSync(npm, ["test"], opts);
    status = r.status === null ? 1 : r.status;
  }
} finally {
  // Remove the link FIRST, then the worktree, then the temp dir.
  if (linkPath && !unlinkModulesLink(linkPath)) process.exit(1);
  if (!existsSync(join(nodeModules, ".package-lock.json")) && !existsSync(join(nodeModules, "next"))) {
    console.error("prepush-clean: ALERT the real node_modules looks damaged after teardown; stopping before deleting anything else.");
    process.exit(1);
  }
  try { git(["worktree", "remove", "--force", wt]); } catch { /* fall through to rmSync */ }
  rmSync(base, { recursive: true, force: true });
}

if (expectFail) {
  if (status === 0) {
    console.error(`prepush-clean: NEGATIVE CONTROL FAILED: the chain passed on ${sha}, which was expected to fail.`);
    process.exit(1);
  }
  console.log(`prepush-clean: negative control ok: the chain fails on ${sha} in a clean worktree (exit ${status}).`);
  process.exit(0);
}
console.log(status === 0 ? `prepush-clean: PASS on ${sha}` : `prepush-clean: FAIL on ${sha} (exit ${status})`);
process.exit(status);
