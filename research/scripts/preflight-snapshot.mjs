#!/usr/bin/env node
/**
 * preflight-snapshot.mjs — GI-1.
 *
 * Copy every uncommitted tracked change into a timestamped directory before an
 * agent starts work, so that work destroyed later is recoverable by
 * construction rather than by someone having been thoughtful earlier.
 *
 * WHY THIS IS THE REAL FIX FOR DC-14
 *   Three occurrences, all the same shape: an agent runs a destructive git
 *   command over another agent's uncommitted work.
 *     - INC-009 (2026-09-18): a cycle's rotation state, 1,329 entities' worth.
 *     - INC-010 (2026-09-24): the held America-at-250 rewrite plus two files.
 *       Survivable ONLY because an earlier iteration happened to have committed
 *       the held rewrite as a patch — foresight, not a system.
 *     - 2026-09-29: a near-miss of my own, reverting a planted probe. Nothing
 *       lost, because that file happened to have no other uncommitted change.
 *
 *   Everything built so far reduces the CHANCE of the command:
 *     `test-no-destructive-git.mjs` lints committed scripts — cannot see a
 *     command typed into a shell. `probe.mjs` makes the safe path shorter —
 *     only helps someone who uses it. A written prohibition existed and its
 *     author broke it two days later.
 *
 *   This changes the CONSEQUENCE instead, which is the only thing that does not
 *   depend on an agent remembering anything at the moment it matters.
 *
 * IT MUTATES NOTHING
 *   Reads `git status --porcelain` and copies files. It runs no git command that
 *   writes: no stash, no checkout, no reset. The snapshot is a plain directory of
 *   plain files, readable without git, which is the point — a recovery mechanism
 *   that needs the tool that caused the damage is not a recovery mechanism.
 *
 * Usage:
 *   node research/scripts/preflight-snapshot.mjs                  # take one
 *   node research/scripts/preflight-snapshot.mjs --list           # what exists
 *   node research/scripts/preflight-snapshot.mjs --verify <dir>   # prove a snapshot matches
 *   node research/scripts/preflight-snapshot.mjs --repo <dir>     # operate on another repo (testing)
 */

import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, relative } from "node:path";
import { createHash } from "node:crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));
// Defaults to the repo this script lives in, so it cannot be pointed at the
// wrong tree by accident. `--repo <dir>` exists so the tool is testable in an
// isolated throwaway repo: a recovery mechanism that can only be exercised
// against the live working tree will not get exercised.
function resolveRepo(argv) {
  const i = argv.indexOf("--repo");
  if (i > -1 && argv[i + 1]) return argv[i + 1];
  return join(__dirname, "..", "..");
}
const REPO = resolveRepo(process.argv.slice(2));
const ROOT = join(REPO, ".preflight");

const sha = (buf) => createHash("sha256").update(buf).digest("hex");

/** Tracked files with uncommitted modifications, plus untracked files. */
export function uncommittedFiles(repo = REPO) {
  const out = execFileSync("git", ["status", "--porcelain", "-z"], {
    cwd: repo,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  const entries = out.split("\0").filter(Boolean);
  const files = [];
  for (const e of entries) {
    // Porcelain v1: XY<space>path
    const status = e.slice(0, 2);
    const path = e.slice(3);
    if (!path) continue;
    // A deletion has nothing to copy; record it in the manifest instead.
    const deleted = status.includes("D");
    files.push({ status: status.trim(), path, deleted });
  }
  return files;
}

function takeSnapshot() {
  const files = uncommittedFiles();
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const dir = join(ROOT, stamp);

  if (files.length === 0) {
    console.log("Nothing uncommitted. No snapshot taken — an empty snapshot would be a false reassurance.");
    return { dir: null, count: 0 };
  }

  mkdirSync(dir, { recursive: true });
  const manifest = [];
  let copied = 0;

  for (const f of files) {
    if (f.deleted) {
      manifest.push({ ...f, sha256: null, note: "deleted in working tree; nothing to copy" });
      continue;
    }
    const src = join(REPO, f.path);
    if (!existsSync(src) || statSync(src).isDirectory()) {
      manifest.push({ ...f, sha256: null, note: "not a readable file at snapshot time" });
      continue;
    }
    const buf = readFileSync(src);
    const dest = join(dir, "files", f.path);
    mkdirSync(dirname(dest), { recursive: true });
    writeFileSync(dest, buf);
    manifest.push({ ...f, sha256: sha(buf), bytes: buf.length });
    copied += 1;
  }

  let head = "unknown";
  try {
    head = execFileSync("git", ["rev-parse", "HEAD"], { cwd: REPO, encoding: "utf8" }).trim();
  } catch {
    /* detached or no commits */
  }

  writeFileSync(
    join(dir, "manifest.json"),
    `${JSON.stringify({ takenAt: new Date().toISOString(), head, fileCount: manifest.length, copied, files: manifest }, null, 2)}\n`
  );

  console.log(`Snapshot ${relative(REPO, dir)}`);
  console.log(`  HEAD ${head.slice(0, 8)} · ${copied} file(s) copied of ${manifest.length} recorded`);
  for (const f of manifest.slice(0, 12)) {
    console.log(`  [${f.status || "?"}] ${f.path}${f.sha256 ? "" : ` — ${f.note}`}`);
  }
  if (manifest.length > 12) console.log(`  … and ${manifest.length - 12} more`);
  return { dir, count: copied };
}

/** Prove a snapshot still matches what it claims, byte for byte. */
export function verifySnapshot(dir) {
  const manifestPath = join(dir, "manifest.json");
  if (!existsSync(manifestPath)) return { ok: false, errors: [`no manifest.json in ${dir}`] };
  const m = JSON.parse(readFileSync(manifestPath, "utf8"));
  const errors = [];
  let checked = 0;
  for (const f of m.files) {
    if (!f.sha256) continue;
    const copy = join(dir, "files", f.path);
    if (!existsSync(copy)) {
      errors.push(`${f.path}: recorded with a hash but the copy is missing`);
      continue;
    }
    checked += 1;
    const actual = sha(readFileSync(copy));
    if (actual !== f.sha256) errors.push(`${f.path}: snapshot copy has changed since it was taken`);
  }
  return { ok: errors.length === 0, errors, checked };
}

function listSnapshots() {
  if (!existsSync(ROOT)) {
    console.log("No snapshots yet.");
    return;
  }
  const dirs = readdirSync(ROOT).filter((d) => statSync(join(ROOT, d)).isDirectory()).sort();
  console.log(`${dirs.length} snapshot(s) in .preflight/`);
  for (const d of dirs) {
    const mp = join(ROOT, d, "manifest.json");
    if (!existsSync(mp)) {
      console.log(`  ${d} — no manifest`);
      continue;
    }
    const m = JSON.parse(readFileSync(mp, "utf8"));
    console.log(`  ${d} — HEAD ${String(m.head).slice(0, 8)}, ${m.copied} file(s)`);
  }
}

const args = process.argv.slice(2);
if (args.includes("--list")) {
  listSnapshots();
} else if (args.includes("--verify")) {
  const dir = args[args.indexOf("--verify") + 1];
  if (!dir) {
    console.error("usage: --verify <snapshot dir>");
    process.exit(2);
  }
  const abs = existsSync(dir) ? dir : join(ROOT, dir);
  const r = verifySnapshot(abs);
  console.log(r.ok ? `PASS — ${r.checked} file(s) match their recorded hashes.` : `FAIL — ${r.errors.length} problem(s)`);
  for (const e of r.errors) console.log(`  ${e}`);
  process.exit(r.ok ? 0 : 1);
} else {
  takeSnapshot();
}
