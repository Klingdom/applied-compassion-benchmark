#!/usr/bin/env node
/**
 * test-model-wave-isolation.mjs -- template I: G17 (test:model-wave-isolation).
 *
 * D-29a item 6: `evaluatedModelCount`, `scoreRecordCount`, `hasResults`, the
 * registry and score history are unchanged by a pilot. This proves it three ways:
 *
 *   1. STATIC     model-index-facts.ts neither imports nor mentions waves/.
 *   2. DYNAMIC    MODEL_INDEX_FACTS is identical with waves/ present and with
 *                 waves/ hidden (the directory is renamed for the second load
 *                 and restored in a finally block).
 *   3. DATA       no registry or score-history record refers to a wave run id.
 *
 * Plus model-wave-facts.ts: counts come from the manifest, a missing waves/
 * means "no waves" (not an error), and the official branch fails closed.
 *
 * The facts are loaded through the real TypeScript module (ts-alias-loader), so
 * this checks what the pages read, not a copy of it.
 */
import { existsSync, mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { importSiteModule } from "./lib/ts-alias-loader.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const SITE = join(HERE, "..");
const DATA = join(SITE, "src", "data", "model-benchmark");
const WAVES = join(DATA, "waves");
const HIDDEN = `${WAVES}.hidden-by-isolation-test`;

let passed = 0;
const failures = [];
const check = async (label, fn) => {
  try { await fn(); passed += 1; console.log(`  ok   ${label}`); } catch (e) { failures.push(`${label}: ${e.message}`); console.log(`  FAIL ${label}: ${e.message}`); }
};
const assert = (c, m) => { if (!c) throw new Error(m); };

// ---- pure rules (each has a planted-probe control below) -------------------
export const GUARDED = ["evaluatedModelCount", "scoreRecordCount", "hasResults", "modelsWithScoreHistory", "itemCount", "reviewedItemCount", "itemsWithTwoReviews"];
const importsWaves = (src) => /waves\/|model-wave|model_wave/.test(src);
const diffFacts = (a, b) => Object.keys({ ...a, ...b }).filter((k) => JSON.stringify(a[k]) !== JSON.stringify(b[k]));
const recordsRefer = (store, ids) => ids.filter((id) => JSON.stringify(store).includes(id));
const sumsPilotIntoEvaluated = (src) => /evaluatedModelCount|MODEL_INDEX_FACTS|model-index-facts/.test(src);

// Recover from a crashed earlier run before doing anything.
if (existsSync(HIDDEN) && !existsSync(WAVES)) renameSync(HIDDEN, WAVES);

const manifest = existsSync(join(WAVES, "manifest.json")) ? JSON.parse(readFileSync(join(WAVES, "manifest.json"), "utf8")) : [];
const runIds = manifest.map((e) => e.run_id);
console.log(`waves examined: ${runIds.length} (${runIds.join(", ")})\n`);
await check("at least one wave exists (a gate over zero waves proves nothing)", () => assert(runIds.length > 0, "no waves in manifest"));

console.log("\n1 static");
const factsSrc = readFileSync(join(SITE, "src", "lib", "model-index-facts.ts"), "utf8");
await check("model-index-facts.ts does not import or mention waves", () => assert(!importsWaves(factsSrc), "model-index-facts.ts refers to waves/ or model-wave"));
await check("NC planted import is caught", () => assert(importsWaves(`${factsSrc}\nimport w from "@/data/model-benchmark/waves/manifest.json";`), "probe not caught"));
const waveFactsSrc = readFileSync(join(SITE, "src", "lib", "model-wave-facts.ts"), "utf8");
await check("model-wave-facts.ts never reads or sums the evaluated-model facts", () => assert(!sumsPilotIntoEvaluated(waveFactsSrc.replace(/\/\*[\s\S]*?\*\//g, "")), "model-wave-facts.ts references evaluatedModelCount or model-index-facts in code"));
await check("NC planted sum is caught", () => assert(sumsPilotIntoEvaluated("const n = MODEL_INDEX_FACTS.evaluatedModelCount + pilotWaveCount;"), "probe not caught"));

console.log("\n2 dynamic: facts with and without waves/");
const withWaves = (await importSiteModule("src/lib/model-index-facts.ts", "with")).MODEL_INDEX_FACTS;
let without;
let hid = false;
try {
  if (existsSync(WAVES)) { renameSync(WAVES, HIDDEN); hid = true; }
  without = (await importSiteModule("src/lib/model-index-facts.ts", "without")).MODEL_INDEX_FACTS;
} finally {
  if (hid) renameSync(HIDDEN, WAVES);
}
await check("waves/ is back in place after the hidden load", () => assert(existsSync(WAVES) && !existsSync(HIDDEN), "waves/ was not restored"));
await check("MODEL_INDEX_FACTS is byte-identical with and without waves/", () => {
  const d = diffFacts(withWaves, without);
  assert(d.length === 0, `facts differ: ${d.join(", ")}`);
});
await check("the guarded facts were actually read (not undefined)", () => {
  for (const k of GUARDED) assert(withWaves[k] !== undefined && without[k] !== undefined, `${k} undefined`);
  console.log(`         evaluatedModelCount=${withWaves.evaluatedModelCount}/${without.evaluatedModelCount} scoreRecordCount=${withWaves.scoreRecordCount}/${without.scoreRecordCount} hasResults=${withWaves.hasResults}/${without.hasResults}`);
});
await check("NC a fact that moves with a wave is caught", () => {
  const tampered = { ...without, evaluatedModelCount: without.evaluatedModelCount + 1 };
  assert(diffFacts(withWaves, tampered).includes("evaluatedModelCount"), "probe not caught");
  const flipped = { ...without, hasResults: !without.hasResults };
  assert(diffFacts(withWaves, flipped).includes("hasResults"), "probe not caught");
});
await check("a pilot leaves the official facts at their empty state", () => {
  assert(withWaves.scoreRecordCount === 0 && withWaves.evaluatedModelCount === 0 && withWaves.hasResults === false, "official facts are non-zero: confirm D-29a item 6 still describes the data");
});

console.log("\n3 data: no wave id in the registry or score history");
const registry = JSON.parse(readFileSync(join(DATA, "registry-v1.json"), "utf8"));
const scoreHistory = JSON.parse(readFileSync(join(DATA, "score-history-v1.json"), "utf8"));
await check("registry names no wave run id", () => assert(recordsRefer(registry, runIds).length === 0, `registry refers to ${recordsRefer(registry, runIds)}`));
await check("score history names no wave run id (no artifact_ref equals a wave)", () => assert(recordsRefer(scoreHistory, runIds).length === 0, `score history refers to ${recordsRefer(scoreHistory, runIds)}`));
await check("NC a planted score-history record naming a wave is caught", () => {
  const planted = { ...scoreHistory, records: [...(scoreHistory.records ?? []), { registry_id: "x", artifact_ref: runIds[0] }] };
  assert(recordsRefer(planted, runIds).length === 1, "probe not caught");
});

console.log("\nmodel-wave-facts.ts");
const wf = await importSiteModule("src/lib/model-wave-facts.ts", "real");
await check("counts come from the manifest and are separate from evaluatedModelCount", () => {
  assert(wf.pilotWaveCount === manifest.filter((e) => e.status === "pilot").length, "pilotWaveCount != manifest pilots");
  assert(wf.officialWaveCount === 0, "officialWaveCount must be 0 while official rendering is disabled");
  assert(wf.MODEL_WAVE_FACTS.latestRunId === (manifest[0]?.run_id ?? null), "latestRunId != newest manifest entry");
  assert(!("evaluatedModelCount" in wf.MODEL_WAVE_FACTS), "MODEL_WAVE_FACTS must not carry evaluatedModelCount");
});
await check("a wave is publishable only when its decision is active (F1)", () => {
  for (const e of manifest) assert(wf.isPublishable(e) === (e.decision_status === "active"), `${e.run_id}: publishable disagrees with decision_status ${e.decision_status}`);
  assert(wf.isPublishable({ ...manifest[0], decision_status: "proposed" }) === false, "proposed decision treated as publishable");
});
await check("loadWave returns a pilot with status derived from flags", () => {
  const w = wf.loadWave(runIds[0]);
  assert(w.status === "pilot" && w.official === false && w.comparability === "none", "not a pilot");
});

const here = process.cwd();
const tmp = mkdtempSync(join(tmpdir(), "cb-wave-iso-"));
try {
  process.chdir(tmp);
  const none = await importSiteModule("src/lib/model-wave-facts.ts", "empty");
  await check("without waves/ the facts say no waves rather than throwing", () => {
    assert(none.pilotWaveCount === 0 && none.officialWaveCount === 0 && none.latestWaveEntry === null && none.latestWave() === null, "missing waves/ not treated as empty");
  });
  const wdir = join(tmp, "src", "data", "model-benchmark", "waves");
  mkdirSync(wdir, { recursive: true });
  writeFileSync(join(wdir, "manifest.json"), JSON.stringify([{ run_id: "off-1", status: "official", official: true, comparability: "within-wave", report_date: "2030-01-01", decision_ref: "D-99", decision_status: "active" }]));
  writeFileSync(join(wdir, "off-1.json"), JSON.stringify({ run_id: "off-1", official: true, comparability: "within-wave" }));
  const off = await importSiteModule("src/lib/model-wave-facts.ts", "official");
  await check("NC official wave: loadWave throws (fails closed)", () => {
    let msg = null;
    try { off.loadWave("off-1"); } catch (e) { msg = e.message; }
    assert(msg && /official wave rendering/.test(msg), "official wave loaded without throwing");
    console.log(`         threw: ${msg}`);
  });
  await check("NC official wave: assertRenderable throws", () => {
    let msg = null;
    try { off.assertRenderable({ status: "official" }); } catch (e) { msg = e.message; }
    assert(msg && /official wave rendering/.test(msg), "assertRenderable accepted an official wave");
  });
  await check("official waves are counted separately and never as publishable", () => assert(off.officialWaveCount === 1 && off.pilotWaveCount === 0 && off.publishableWaves.length === 0, "official counting wrong"));
} finally {
  process.chdir(here);
  rmSync(tmp, { recursive: true, force: true });
}

console.log(`\n${passed} passed, ${failures.length} failed`);
if (failures.length) { console.log("\n" + failures.join("\n")); process.exit(1); }
