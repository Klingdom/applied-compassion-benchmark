#!/usr/bin/env node
/**
 * test-model-wave-export.mjs -- template I: G16 (`export-wave --check`).
 *
 * Regenerates every committed wave from its analysis artifact in memory and
 * byte-compares. Without research/ (the Docker build context is site/ only) the
 * check prints SKIP and passes; with CB_REQUIRE_RESEARCH=1 a skip FAILS.
 *
 * Negative controls (run only where research/ exists), each planted in a
 * scratch COPY of waves/ (CB_WAVES_DIR) so committed files are never touched:
 *   - a number changed in the wave            -> check fails
 *   - the manifest entry changed              -> check fails
 *   - the manifest emptied                    -> check fails (zero waves)
 *   - a wave file missing                     -> check fails
 *   - a wave claiming an active decision      -> check fails
 *   - the Docker context simulated, research required -> check fails
 *   - the Docker context simulated, research optional -> SKIP, exit 0
 * The unmodified copy must pass first, so a failure is attributable to the plant.
 */
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const SITE = join(HERE, "..");
const ROOT = join(SITE, "..");
const BIN = join(ROOT, "research", "model-runs", "bin", "export-wave.mjs");
const WAVES = join(SITE, "src", "data", "model-benchmark", "waves");
const REQUIRE = process.env.CB_REQUIRE_RESEARCH === "1";

let passed = 0;
const failures = [];
const check = async (label, fn) => {
  try { await fn(); passed += 1; console.log(`  ok   ${label}`); } catch (e) { failures.push(`${label}: ${e.message}`); console.log(`  FAIL ${label}: ${e.message}`); }
};
const assert = (c, m) => { if (!c) throw new Error(m); };
const run = (env = {}) => spawnSync(process.execPath, ["--no-warnings", BIN, "--check"], { encoding: "utf8", env: { ...process.env, ...env } });

const haveResearch = existsSync(BIN) && existsSync(join(ROOT, "research", "model-runs")) && existsSync(join(ROOT, "DECISIONS.md"));
if (!haveResearch) {
  if (REQUIRE) {
    console.log("FAIL export-wave --check: research/ is not present and CB_REQUIRE_RESEARCH=1 makes a skip a failure");
    process.exit(1);
  }
  console.log("SKIP export-wave --check: research/ not present (Docker build context). Set CB_REQUIRE_RESEARCH=1 to make this fail.");
  process.exit(0);
}

console.log("export-wave --check on the committed waves\n");
await check("committed waves regenerate byte-identically", () => {
  const r = run();
  assert(r.status === 0, `exit ${r.status}: ${r.stderr || r.stdout}`);
  console.log(`         ${r.stdout.trim()}`);
});

const manifest = JSON.parse(readFileSync(join(WAVES, "manifest.json"), "utf8"));
await check("every committed wave regenerates on its own (--check --run-id), so one wave cannot hide behind another", () => {
  assert(manifest.length > 0, "no waves");
  for (const e of manifest) {
    const r = spawnSync(process.execPath, ["--no-warnings", BIN, "--check", "--run-id", e.run_id], { encoding: "utf8", env: process.env });
    assert(r.status === 0, `${e.run_id}: exit ${r.status}: ${r.stderr || r.stdout}`);
  }
  console.log(`         ${manifest.map((e) => e.run_id).join(", ")}`);
});
const waveName = `${manifest[0].run_id}.json`;
const scratch = mkdtempSync(join(tmpdir(), "cb-wave-export-"));
const fresh = () => {
  rmSync(scratch, { recursive: true, force: true });
  cpSync(WAVES, scratch, { recursive: true });
  return scratch;
};
const runIn = (dir, env = {}) => run({ CB_WAVES_DIR: dir, ...env });
const plant = (file, mutate) => {
  const dir = fresh();
  const f = join(dir, file);
  const before = readFileSync(f, "utf8");
  const after = mutate(before);
  if (after === before) throw new Error("the planted mutation changed nothing");
  writeFileSync(f, after);
  return dir;
};
const first = (r) => r.stderr.trim().split("\n").slice(0, 2).join(" | ").slice(0, 200);

console.log("\nnegative controls (planted in a scratch copy of waves/)\n");
try {
  await check("the unmodified scratch copy passes (so the controls are attributable)", () => {
    const r = runIn(fresh());
    assert(r.status === 0, r.stderr);
  });
  await check("NC a figure changed in the wave is caught", () => {
    const r = runIn(plant(waveName, (t) => t.replace(/"pilot_composite": [\d.]+/, '"pilot_composite": 1.0')));
    assert(r.status !== 0, "the check passed on a doctored wave");
    assert(/differs from regeneration/.test(r.stderr), `unexpected failure: ${r.stderr}`);
    console.log(`         ${first(r)}`);
  });
  // A later-kind wave carries build provenance parsed from its pre-registration; a hand edit of any of it must fail the check.
  const withProvenance = manifest.map((e) => e.run_id).filter((id) => JSON.parse(readFileSync(join(WAVES, `${id}.json`), "utf8")).subject_provenance !== undefined);
  await check("at least one committed wave carries subject_provenance (the provenance control is not vacuous)", () => assert(withProvenance.length > 0, "no committed wave has subject_provenance"));
  for (const id of withProvenance) {
    await check(`NC ${id}: a developer or licence edited in subject_provenance is caught`, () => {
      const r = runIn(plant(`${id}.json`, (t) => t.replace(/"licence": "[^"]*"/, '"licence": "Edited licence"')));
      assert(r.status !== 0 && /differs from regeneration/.test(r.stderr), `not caught: ${r.stderr}`);
      console.log(`         ${first(r)}`);
    });
    await check(`NC ${id}: a changed judge_set claim is caught`, () => {
      const r = runIn(plant(`${id}.json`, (t) => t.replace(/"families_disjoint": (true|false)/, (m, v) => `"families_disjoint": ${v === "true" ? "false" : "true"}`)));
      assert(r.status !== 0 && /differs from regeneration/.test(r.stderr), `not caught: ${r.stderr}`);
    });
    await check(`NC ${id}: a pair re-oriented by hand (the wave's own alphabetical orientation) is caught`, () => {
      const r = runIn(plant(`${id}.json`, (t) => t.replace(/"separated": (true|false)\r?\n/, (m, v) => `"separated": ${v === "true" ? "false" : "true"}\n`)));
      assert(r.status !== 0, "a flipped separation flag passed");
    });
  }
  await check("NC a changed manifest entry is caught", () => {
    const r = runIn(plant("manifest.json", (t) => t.replace('"report_date": "', '"report_date": "9')));
    assert(r.status !== 0 && /manifest/.test(r.stderr), `not caught: ${r.stderr}`);
    console.log(`         ${first(r)}`);
  });
  await check("NC an emptied manifest is caught (zero waves proves nothing)", () => {
    const r = runIn(plant("manifest.json", () => "[]\n"));
    assert(r.status !== 0 && /no waves in manifest/.test(r.stderr), `not caught: ${r.stderr}`);
    console.log(`         ${first(r)}`);
  });
  await check("NC a missing wave file is caught", () => {
    const dir = fresh();
    rmSync(join(dir, waveName));
    const r = runIn(dir);
    assert(r.status !== 0 && /missing/.test(r.stderr), `not caught: ${r.stderr}`);
    console.log(`         ${first(r)}`);
  });
  await check("NC a wave claiming an active decision while DECISIONS.md says otherwise is caught", () => {
    const flipped = manifest[0].decision_status === "active" ? "proposed" : "active";
    const r = runIn(plant(waveName, (t) => t.replace(/"decision_status": "\w+"/, `"decision_status": "${flipped}"`)));
    assert(r.status !== 0, "a wave with the wrong decision status passed");
    console.log(`         ${first(r)}`);
  });
  await check("Docker context simulated, research optional: SKIP and exit 0", () => {
    const r = run({ CB_FAKE_NO_RESEARCH: "1", CB_REQUIRE_RESEARCH: "0" });
    assert(r.status === 0 && /SKIP/.test(r.stdout), `expected SKIP/0, got ${r.status}: ${r.stdout}${r.stderr}`);
    console.log(`         ${r.stdout.trim().slice(0, 160)}`);
  });
  await check("NC Docker context simulated, CB_REQUIRE_RESEARCH=1: the skip FAILS", () => {
    const r = run({ CB_FAKE_NO_RESEARCH: "1", CB_REQUIRE_RESEARCH: "1" });
    assert(r.status !== 0, "a skip passed while research was required");
    console.log(`         exit ${r.status}: ${r.stderr.trim().slice(0, 160)}`);
  });
} finally {
  rmSync(scratch, { recursive: true, force: true });
}

console.log(`\n${passed} passed, ${failures.length} failed`);
if (failures.length) {
  console.log("\n" + failures.join("\n"));
  process.exit(1);
}
