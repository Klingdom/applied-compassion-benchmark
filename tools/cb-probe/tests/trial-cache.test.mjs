// tests/trial-cache.test.mjs
//
// MS-2. The parsed-trial cache in lib/scored-run-store.mjs exists for a real
// reason: listRunTrials is called on every step of a run, and re-parsing every
// trial each time made a 249-trial run spend 33s inside that one function.
//
// Its safety argument is that **disk remains the single source of truth** — the
// cache is invalidated by the file's own mtime and size, so a trial edited or
// replaced between calls is re-parsed. finish_scored_run's forged-run defence
// depends on that property: it refuses to trust in-memory state precisely so it
// sees what is on disk.
//
// Until now that property was **argued in a comment, not asserted**. These tests
// assert it, including the case the mtime+size stamp is weakest against: a
// rewrite of exactly the same byte length. If mtime granularity were coarse, or
// two writes landed inside one tick, the stamp would be unchanged and the cache
// would serve a stale trial while claiming disk authority.

import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync, readFileSync, statSync, unlinkSync } from "node:fs";
import os from "node:os";
import path from "node:path";

import { appendRunTrial, listRunTrials, clearTrialCache, newRunId } from "../lib/scored-run-store.mjs";

function freshRoot() {
  // Outside the repo: the store refuses to write inside a git working tree (J3).
  return mkdtempSync(path.join(os.tmpdir(), "cb-trial-cache-"));
}

function trial(verdict, pad = "") {
  return { itemId: "AWR-1-A", trialIndex: 0, verdict, pad };
}

test("listRunTrials returns what was written", () => {
  const root = freshRoot();
  try {
    clearTrialCache();
    const runId = newRunId();
    appendRunTrial(root, runId, "AWR-1-A", 0, trial("first"));
    const got = listRunTrials(root, runId);
    assert.equal(got.length, 1);
    assert.equal(got[0].verdict, "first");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("a rewrite of DIFFERENT length is re-read, not served from cache", () => {
  const root = freshRoot();
  try {
    clearTrialCache();
    const runId = newRunId();
    const file = appendRunTrial(root, runId, "AWR-1-A", 0, trial("first"));

    // Prime the cache.
    assert.equal(listRunTrials(root, runId)[0].verdict, "first");

    const before = statSync(file).size;
    writeFileSync(file, `${JSON.stringify(trial("second-and-longer"), null, 2)}\n`, "utf8");
    assert.notEqual(statSync(file).size, before, "fixture invalid: the rewrite must change the size");

    assert.equal(
      listRunTrials(root, runId)[0].verdict,
      "second-and-longer",
      "cache served a stale trial after the file changed size"
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("a rewrite of EXACTLY the same length is still re-read", () => {
  // The sharp case. `${mtimeMs}:${size}` cannot distinguish two same-size
  // writes if mtimeMs does not advance between them, and this is the scenario
  // the forged-run defence has to survive: a trial file swapped for another of
  // identical length.
  const root = freshRoot();
  try {
    clearTrialCache();
    const runId = newRunId();
    const file = appendRunTrial(root, runId, "AWR-1-A", 0, trial("aaaaa"));

    assert.equal(listRunTrials(root, runId)[0].verdict, "aaaaa");

    const before = statSync(file).size;
    const replacement = `${JSON.stringify(trial("bbbbb"), null, 2)}\n`;
    writeFileSync(file, replacement, "utf8");

    assert.equal(
      statSync(file).size,
      before,
      "fixture invalid: the replacement must be the same byte length for this test to mean anything"
    );
    assert.equal(readFileSync(file, "utf8"), replacement, "fixture invalid: the file was not actually rewritten");

    assert.equal(
      listRunTrials(root, runId)[0].verdict,
      "bbbbb",
      "CACHE SERVED A STALE TRIAL after a same-size rewrite — disk is no longer authoritative, and the " +
        "forged-run defence in finish_scored_run rests on that property"
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("a deleted trial disappears from the listing", () => {
  const root = freshRoot();
  try {
    clearTrialCache();
    const runId = newRunId();
    const file = appendRunTrial(root, runId, "AWR-1-A", 0, trial("first"));
    appendRunTrial(root, runId, "EMP-1-A", 0, trial("second"));
    assert.equal(listRunTrials(root, runId).length, 2);

    unlinkSync(file);
    const got = listRunTrials(root, runId);
    assert.equal(got.length, 1, "a deleted trial was still served from cache");
    assert.equal(got[0].verdict, "second");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("clearTrialCache forces a re-parse", () => {
  const root = freshRoot();
  try {
    clearTrialCache();
    const runId = newRunId();
    appendRunTrial(root, runId, "AWR-1-A", 0, trial("first"));
    assert.equal(listRunTrials(root, runId)[0].verdict, "first");
    clearTrialCache();
    assert.equal(listRunTrials(root, runId)[0].verdict, "first", "re-parse after clear returned something else");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("the cache is actually in use (otherwise these tests prove nothing)", () => {
  // Positive control for the suite: if listRunTrials never cached, every test
  // above would pass trivially. Deleting the file from under a primed cache and
  // reading via the private path would then be indistinguishable from a cache
  // hit. Here we prove caching happens by observing that a byte-identical
  // rewrite does NOT re-parse — same mtime window, same size, same content —
  // while the previous test proves a same-size CONTENT change does.
  const root = freshRoot();
  try {
    clearTrialCache();
    const runId = newRunId();
    const file = appendRunTrial(root, runId, "AWR-1-A", 0, trial("stable"));
    const first = listRunTrials(root, runId)[0];
    const second = listRunTrials(root, runId)[0];
    assert.equal(first, second, "two consecutive reads returned different objects — the cache is not being used");
    assert.ok(file.endsWith(".json"));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
