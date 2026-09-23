// tests/write-root-guard.test.mjs
//
// The write-root guard (J3): a session write outside CB_ARTIFACT_ROOT fails,
// and a CB_ARTIFACT_ROOT that resolves inside a git working tree (or inside
// this repo specifically) is refused outright.

import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";

import {
  assertSafeWriteRoot,
  resolveArtifactRoot,
  sessionDir,
  DEFAULT_ARTIFACT_ROOT,
} from "../lib/session-store.mjs";
import { REPO_ROOT } from "../lib/paths.mjs";

test("resolveArtifactRoot falls back to the documented default", () => {
  assert.equal(resolveArtifactRoot({}), path.resolve(DEFAULT_ARTIFACT_ROOT));
});

test("resolveArtifactRoot honours CB_ARTIFACT_ROOT", (t) => {
  const root = mkdtempSync(path.join(os.tmpdir(), "cb-probe-root-test-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  assert.equal(resolveArtifactRoot({ CB_ARTIFACT_ROOT: root }), path.resolve(root));
});

test("assertSafeWriteRoot accepts a plain temp directory outside the repo", (t) => {
  const root = mkdtempSync(path.join(os.tmpdir(), "cb-probe-root-test-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  assert.doesNotThrow(() => assertSafeWriteRoot(root));
});

test("assertSafeWriteRoot refuses a root inside the Compassion Benchmark repo", () => {
  const insideRepo = path.join(REPO_ROOT, "tools", "cb-probe", "would-be-artifact-root");
  assert.throws(() => assertSafeWriteRoot(insideRepo, REPO_ROOT), /repository working tree/);
});

test("assertSafeWriteRoot refuses a root inside an unrelated git working tree", (t) => {
  const fakeRepo = mkdtempSync(path.join(os.tmpdir(), "cb-probe-fake-repo-"));
  mkdirSync(path.join(fakeRepo, ".git"));
  const nested = path.join(fakeRepo, "some", "nested", "artifact-root");
  mkdirSync(nested, { recursive: true });
  t.after(() => rmSync(fakeRepo, { recursive: true, force: true }));

  // Pass a repoRoot that is NOT an ancestor of `nested`, so only the generic
  // git-ancestor walk (not the repo-specific check) can catch this.
  const unrelatedRepoRoot = mkdtempSync(path.join(os.tmpdir(), "cb-probe-unrelated-repo-"));
  try {
    assert.throws(() => assertSafeWriteRoot(nested, unrelatedRepoRoot), /git working tree/);
  } finally {
    rmSync(unrelatedRepoRoot, { recursive: true, force: true });
  }
});

test("sessionDir refuses a session_id that attempts to escape the artifact root", (t) => {
  const root = mkdtempSync(path.join(os.tmpdir(), "cb-probe-root-test-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));

  assert.throws(() => sessionDir(root, "../../etc"), /invalid session_id/);
  assert.throws(() => sessionDir(root, "../escape"), /invalid session_id/);
  assert.throws(() => sessionDir(root, "/absolute/path"), /invalid session_id/);
  assert.throws(() => sessionDir(root, ""), /invalid session_id/);
});

test("sessionDir accepts a well-formed session id and stays inside the root", (t) => {
  const root = mkdtempSync(path.join(os.tmpdir(), "cb-probe-root-test-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));

  const dir = sessionDir(root, "abc123-def456");
  assert.ok(dir.startsWith(path.resolve(root)));
});
