// research/model-runs/tests/export-guard.test.mjs -- RUNBOOK-EXPORT (D-63 Stream C): export-wave.mjs must not write an
// unapproved wave into site/src/data/**. Every write here goes to a temp dir; the real site/src/data is only READ
// (to compare bytes) and the one real-default case uses a run id that does not exist, so even a broken guard writes nothing.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(here, "..", "..", "..");
const BIN = path.join(ROOT, "research", "model-runs", "bin", "export-wave.mjs");
const REAL_WAVES = path.join(ROOT, "site", "src", "data", "model-benchmark", "waves");
const RUN = "pilot-2026-10-01"; // a real published wave, used as the fixture source (read only)

const scratch = mkdtempSync(path.join(os.tmpdir(), "export-guard-"));
process.on("exit", () => rmSync(scratch, { recursive: true, force: true }));

/** A scratch copy of the run's export inputs; withApproval adds a valid APPROVAL.json. */
function makeRuns(name, withApproval) {
  const runs = path.join(scratch, name, "runs");
  mkdirSync(path.join(runs, RUN, "operations"), { recursive: true });
  const src = path.join(ROOT, "research", "model-runs", RUN);
  cpSync(path.join(src, "analysis.json"), path.join(runs, RUN, "analysis.json"));
  cpSync(path.join(src, "operations", "subject-parts.manifest.tsv"), path.join(runs, RUN, "operations", "subject-parts.manifest.tsv"));
  for (const f of ["PREREGISTRATION.md", "run-config.json"]) if (existsSync(path.join(src, f))) cpSync(path.join(src, f), path.join(runs, RUN, f));
  if (withApproval) writeFileSync(path.join(runs, RUN, "APPROVAL.json"), JSON.stringify({ run_id: RUN, approved_by: "founder", approved_on: "2026-10-26", approval_ref: "test fixture" }));
  return runs;
}
/** A scratch stand-in for site/src/data; its waves dir is where --to-site or the default target would write. */
function makeSiteData(name) {
  const data = path.join(scratch, name, "site-data");
  return { data, waves: path.join(data, "model-benchmark", "waves") };
}
const run = (bin, args, env) => spawnSync(process.execPath, [bin, ...args], { encoding: "utf8", env: { ...process.env, CB_WAVES_DIR: "", CB_SITE_DATA_DIR: "", CB_RUNS_DIR: "", ...env } });

test("default export of an unapproved wave is refused and nothing is written", () => {
  const { data, waves } = makeSiteData("t1");
  const r = run(BIN, ["--run-id", RUN], { CB_WAVES_DIR: waves, CB_SITE_DATA_DIR: data, CB_RUNS_DIR: makeRuns("t1", false) });
  assert.notEqual(r.status, 0, r.stdout);
  assert.match(r.stderr, /CB_WAVES_DIR/);
  assert.equal(existsSync(path.join(waves, `${RUN}.json`)), false);
  assert.equal(existsSync(path.join(waves, "manifest.json")), false);
});

test("--to-site on an unapproved wave is refused and nothing is written", () => {
  const { data, waves } = makeSiteData("t2");
  const r = run(BIN, ["--run-id", RUN, "--to-site"], { CB_WAVES_DIR: waves, CB_SITE_DATA_DIR: data, CB_RUNS_DIR: makeRuns("t2", false) });
  assert.notEqual(r.status, 0);
  assert.match(r.stderr, /not approved/);
  assert.match(r.stderr, /CB_WAVES_DIR/);
  assert.equal(existsSync(path.join(waves, `${RUN}.json`)), false);
});

test("an invalid APPROVAL.json does not approve", () => {
  const { data, waves } = makeSiteData("t3");
  const runs = makeRuns("t3", false);
  writeFileSync(path.join(runs, RUN, "APPROVAL.json"), JSON.stringify({ run_id: RUN, approved_by: "agent", approved_on: "2026-10-26", approval_ref: "x" }));
  const r = run(BIN, ["--run-id", RUN, "--to-site"], { CB_WAVES_DIR: waves, CB_SITE_DATA_DIR: data, CB_RUNS_DIR: runs });
  assert.notEqual(r.status, 0);
  assert.equal(existsSync(path.join(waves, `${RUN}.json`)), false);
});

test("the real default target (no CB_WAVES_DIR) is refused; the real waves directory is untouched", () => {
  const before = readdirSync(REAL_WAVES).sort().join();
  const r = run(BIN, ["--run-id", "pilot-2099-01-01"], {});
  assert.notEqual(r.status, 0);
  assert.match(r.stderr, /CB_WAVES_DIR/);
  assert.match(r.stderr, /refusing/);
  assert.equal(readdirSync(REAL_WAVES).sort().join(), before);
  assert.equal(existsSync(path.join(REAL_WAVES, "pilot-2099-01-01.json")), false);
});

test("CB_WAVES_DIR outside site/src/data exports an unapproved wave", () => {
  const out = path.join(scratch, "t5", "draft");
  const r = run(BIN, ["--run-id", RUN], { CB_WAVES_DIR: out, CB_RUNS_DIR: makeRuns("t5", false) });
  assert.equal(r.status, 0, r.stderr);
  assert.equal(existsSync(path.join(out, `${RUN}.json`)), true);
  assert.equal(existsSync(path.join(out, "manifest.json")), true);
});

test("approved (APPROVAL.json) plus --to-site is allowed, written to the temp copy of site data only", () => {
  const { data, waves } = makeSiteData("t6");
  const r = run(BIN, ["--run-id", RUN, "--to-site"], { CB_WAVES_DIR: waves, CB_SITE_DATA_DIR: data, CB_RUNS_DIR: makeRuns("t6", true) });
  assert.equal(r.status, 0, r.stderr);
  assert.equal(existsSync(path.join(waves, `${RUN}.json`)), true);
});

test("approved but no --to-site is still refused (site data is never the implicit target)", () => {
  const { data, waves } = makeSiteData("t7");
  const r = run(BIN, ["--run-id", RUN], { CB_WAVES_DIR: waves, CB_SITE_DATA_DIR: data, CB_RUNS_DIR: makeRuns("t7", true) });
  assert.notEqual(r.status, 0);
  assert.equal(existsSync(path.join(waves, `${RUN}.json`)), false);
});

test("a published wave (listed in the target manifest) is approved for --to-site and re-exports byte-identically to the committed file", () => {
  const { data, waves } = makeSiteData("t8");
  mkdirSync(waves, { recursive: true });
  cpSync(path.join(REAL_WAVES, "manifest.json"), path.join(waves, "manifest.json"));
  // No APPROVAL.json and the real run directories: approval comes from the manifest alone.
  const r = run(BIN, ["--run-id", RUN, "--to-site"], { CB_WAVES_DIR: waves, CB_SITE_DATA_DIR: data });
  assert.equal(r.status, 0, r.stderr);
  assert.ok(readFileSync(path.join(waves, `${RUN}.json`)).equals(readFileSync(path.join(REAL_WAVES, `${RUN}.json`))), "wave bytes differ from the committed file");
  assert.ok(readFileSync(path.join(waves, "manifest.json")).equals(readFileSync(path.join(REAL_WAVES, "manifest.json"))), "manifest bytes differ from the committed file");
});

test("byte identity via CB_WAVES_DIR for a published wave (real inputs)", () => {
  const out = path.join(scratch, "t9", "draft");
  const r = run(BIN, ["--run-id", RUN], { CB_WAVES_DIR: out });
  assert.equal(r.status, 0, r.stderr);
  assert.ok(readFileSync(path.join(out, `${RUN}.json`)).equals(readFileSync(path.join(REAL_WAVES, `${RUN}.json`))));
});

test("PROBE: with the guard call removed, the first test scenario writes the wave (so the first test would fail)", () => {
  const src = readFileSync(BIN, "utf8");
  const call = "  enforceWriteGuard(RUN);\n";
  const rootLine = 'const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");';
  assert.ok(src.includes(call) && src.includes(rootLine), "export-wave.mjs changed shape; update the probe");
  const mutantDir = path.join(scratch, "probe");
  mkdirSync(mutantDir, { recursive: true });
  const mutant = path.join(mutantDir, "export-wave-noguard.mjs");
  writeFileSync(mutant, src.replace(call, "").replace(rootLine, `const ROOT = ${JSON.stringify(ROOT)};`));
  const { data, waves } = makeSiteData("probe");
  const r = run(mutant, ["--run-id", RUN], { CB_WAVES_DIR: waves, CB_SITE_DATA_DIR: data, CB_RUNS_DIR: makeRuns("probe", false) });
  assert.equal(r.status, 0, r.stderr);
  assert.equal(existsSync(path.join(waves, `${RUN}.json`)), true, "mutant should have written: the guard is what stops test 1 scenario");
});
