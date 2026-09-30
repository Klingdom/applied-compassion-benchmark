#!/usr/bin/env node
/**
 * test-preflight-snapshot.mjs — GI-1.
 *
 * A recovery mechanism that has never been shown to recover anything is a
 * reassurance, not a control. These tests exercise the whole loop — snapshot,
 * destroy, restore, prove byte-identical — plus the two ways the tool could give
 * false comfort: claiming a snapshot when nothing was captured, and passing
 * verification on a snapshot whose copies have drifted.
 */

import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { verifySnapshot, pruneSnapshots } from "./preflight-snapshot.mjs";

const SCRIPT = fileURLToPath(new URL("./preflight-snapshot.mjs", import.meta.url));

let passed = 0;
let failed = 0;
const assert = (label, cond, detail = "") => {
  if (cond) {
    passed += 1;
    console.log(`  PASS  ${label}`);
  } else {
    failed += 1;
    console.log(`  FAIL  ${label}${detail ? ` — ${detail}` : ""}`);
  }
};
const sha = (b) => createHash("sha256").update(b).digest("hex");

// A throwaway git repo, so nothing here can touch the real working tree.
const repo = join(tmpdir(), `preflight-test-${Date.now()}`);
mkdirSync(repo, { recursive: true });
const git = (...a) => execFileSync("git", a, { cwd: repo, encoding: "utf8", stdio: "pipe" });
git("init", "-q");
git("config", "user.email", "t@example.com");
git("config", "user.name", "t");
writeFileSync(join(repo, "committed.txt"), "committed content\n");
git("add", ".");
git("commit", "-qm", "base");

// --repo, not cwd: the tool deliberately anchors to the repo it lives in so it
// cannot be aimed at the wrong tree, which means cwd alone cannot isolate it.
const run = (...args) =>
  execFileSync(process.execPath, [SCRIPT, "--repo", repo, ...args], { cwd: repo, encoding: "utf8", env: { ...process.env } });

console.log("\nTest 1: an empty working tree yields NO snapshot");
{
  const out = run();
  assert("it refuses to take an empty snapshot", /Nothing uncommitted/.test(out), out.trim());
  assert(
    "and says why, rather than creating a directory that proves nothing",
    /false reassurance/.test(out),
    "an empty snapshot is worse than none: it looks like cover"
  );
}

console.log("\nTest 2: the whole loop — snapshot, destroy, restore, byte-identical");
{
  const precious = join(repo, "precious.txt");
  writeFileSync(precious, "work that is not committed yet\nsecond line\n");
  const before = sha(readFileSync(precious));

  const out = run();
  assert("the uncommitted file is captured", /precious\.txt/.test(out), out.trim());

  // The destruction DC-14 is about.
  rmSync(precious);
  assert("the file is genuinely gone", !existsSync(precious));

  const root = join(repo, ".preflight");
  const snap = join(root, readdirSync(root).sort().pop());
  const copy = join(snap, "files", "precious.txt");
  assert("the snapshot holds a plain readable copy", existsSync(copy));

  writeFileSync(precious, readFileSync(copy));
  assert("recovered byte-identical", sha(readFileSync(precious)) === before);

  const v = verifySnapshot(snap);
  assert("verify passes on an untouched snapshot", v.ok, v.errors.join(" | "));
  assert("verify actually checked something (V8)", v.checked > 0, "a verify that checks nothing always passes");
}

console.log("\nTest 3: verification FAILS if a snapshot copy drifts");
{
  const root = join(repo, ".preflight");
  const snap = join(root, readdirSync(root).sort().pop());
  const copy = join(snap, "files", "precious.txt");
  const original = readFileSync(copy);

  writeFileSync(copy, "tampered\n");
  const bad = verifySnapshot(snap);
  assert("a drifted copy is detected", !bad.ok && bad.errors.some((e) => /has changed/.test(e)), bad.errors.join(" | "));

  writeFileSync(copy, original);
  assert("positive control: it passes again once restored", verifySnapshot(snap).ok);
}

console.log("\nTest 4: verification FAILS if a recorded file is missing entirely");
{
  const root = join(repo, ".preflight");
  const snap = join(root, readdirSync(root).sort().pop());
  const copy = join(snap, "files", "precious.txt");
  const original = readFileSync(copy);

  rmSync(copy);
  const bad = verifySnapshot(snap);
  assert("a missing copy is detected", !bad.ok && bad.errors.some((e) => /copy is missing/.test(e)), bad.errors.join(" | "));

  writeFileSync(copy, original);
  assert("positive control: passes again once replaced", verifySnapshot(snap).ok);
}

console.log("\nTest 5: retention keeps the most recent and deletes the rest (GI-5)");
{
  const root = join(repo, ".retention");
  mkdirSync(root, { recursive: true });
  // Directory names are ISO timestamps, so lexical order is chronological.
  for (let i = 1; i <= 14; i += 1) {
    const d = join(root, `2026-09-${String(i).padStart(2, "0")}T00-00-00-000Z`);
    mkdirSync(d, { recursive: true });
    writeFileSync(join(d, "manifest.json"), JSON.stringify({ files: [], copied: 0, head: "x" }));
  }

  const r = pruneSnapshots(root, 10);
  assert("14 snapshots pruned to 10", r.kept.length === 10 && r.removed.length === 4, JSON.stringify(r));
  assert("the OLDEST were removed", r.removed[0].endsWith("09-01T00-00-00-000Z"), r.removed.join(","));
  assert("the NEWEST was kept", r.kept[r.kept.length - 1].endsWith("09-14T00-00-00-000Z"), r.kept.join(","));
  assert("removed directories are gone from disk", r.removed.every((d) => !existsSync(join(root, d))));
  assert("kept directories still exist", r.kept.every((d) => existsSync(join(root, d))));

  // Pruning an already-short list must be a no-op, not a deletion.
  const again = pruneSnapshots(root, 10);
  assert("pruning again removes nothing", again.removed.length === 0 && again.kept.length === 10);

  // A missing root must not throw — a recovery tool that crashes on a clean
  // machine is worse than one that does nothing.
  const none = pruneSnapshots(join(repo, "does-not-exist"), 10);
  assert("pruning a missing directory is safe", none.removed.length === 0);
}

console.log("\nTest 6: the tool runs no git command that writes");
{
  const src = readFileSync(SCRIPT, "utf8");
  // Structural only. My first version also scanned for the words "stash" and
  // "reset", and failed — on the tool's own doc comment, which says "no stash,
  // no checkout, no reset" in order to explain that it uses none of them. That
  // is the THIRD time in two days I have written a prose scan that flags the
  // prose explaining the rule (the probe helper's git check, and the
  // destructive-git gate on probe.mjs, were the first two). The lesson is
  // general: assert on what the code DOES, never on what the file says, because
  // a file that documents a prohibition necessarily contains the prohibited
  // string.
  //
  // Recovery must not depend on the tool that caused the damage, so the real
  // requirement is that every git invocation here is read-only.
  const gitCalls = [...src.matchAll(/execFileSync\(\s*"git"\s*,\s*\[\s*"([a-z-]+)"/g)].map((m) => m[1]);
  assert("at least one git call was found, so this check is not vacuous (V8)", gitCalls.length > 0);
  assert(
    `only read-only git verbs are used (${[...new Set(gitCalls)].join(", ") || "none"})`,
    gitCalls.every((v) => ["status", "rev-parse"].includes(v)),
    gitCalls.join(", ")
  );
}

rmSync(repo, { recursive: true, force: true });

console.log(`\n${"-".repeat(60)}`);
console.log(`TOTAL: ${passed} passed, ${failed} failed`);
console.log("-".repeat(60));
if (failed > 0) process.exit(1);
console.log("\nAll pre-flight snapshot tests passed.");
