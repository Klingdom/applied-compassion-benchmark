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
const dirtyCount = git(["status", "--porcelain"]).split(String.fromCharCode(10)).filter(Boolean).length;
if (ref === "HEAD" && dirtyCount > 0) {
  console.warn(`prepush-clean: note: ${dirtyCount} uncommitted path(s) are NOT tested; this checks the commit ${sha} only.`);
}
const nodeModules = join(SITE, "node_modules");
if (!existsSync(nodeModules)) {
  console.error("prepush-clean: FAIL site/node_modules is missing; run npm install first.");
  process.exit(1);
}

const base = mkdtempSync(join(tmpdir(), "cb-prepush-"));
const wt = join(base, "wt");
let status = 1;
let linkPath = null;
try {
  git(["worktree", "add", "--detach", "-q", wt, sha]);
  linkPath = join(wt, "site", "node_modules");
  symlinkSync(nodeModules, linkPath, process.platform === "win32" ? "junction" : "dir");
  console.log(`prepush-clean: running the full chain on ${sha} in a clean worktree (${wt})`);
  const r = spawnSync(process.platform === "win32" ? "npm.cmd" : "npm", ["test"], {
    cwd: join(wt, "site"),
    stdio: "inherit",
    shell: process.platform === "win32",
    env: { ...process.env, CB_PRE_PUSH_CLEAN: "1" },
  });
  status = r.status === null ? 1 : r.status;
} finally {
  // Remove the link FIRST, then the worktree, then the temp dir.
  try {
    if (linkPath && existsSync(linkPath) && lstatSync(linkPath).isSymbolicLink()) unlinkSync(linkPath);
    else if (linkPath && existsSync(linkPath)) rmSync(linkPath, { recursive: false, force: true });
  } catch (e) {
    console.error(`prepush-clean: could not remove the node_modules link at ${linkPath}: ${e.message}. Remove it by hand (rmdir), NOT recursively.`);
    process.exit(1);
  }
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
