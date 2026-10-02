#!/usr/bin/env node
/**
 * test-model-waves.mjs -- template I: G15 (test:model-waves) and G9 (analysis-schema).
 *
 * G15  every committed wave file is valid (schema, status flags, forbidden keys,
 *      alphabetical subjects, flags agree with intervals, derived block equals
 *      its recomputation, bound only for separated models) and the manifest
 *      matches the files.
 * G9   analysis.json (A) is schema-checked before it may be exported.
 *
 * Every rule has a planted-probe negative control that must fail AND must trip
 * the specific rule named. Expected values are never typed here: they come from
 * the wave, or from a synthetic analysis whose numbers are unlike the pilot's.
 * A gate that examines zero waves fails.
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  analysisProblems, projectWave, waveProblems, serialiseWave, manifestEntry, sortManifest,
  parseDecisionStatus, notSeparatedGroups, forbiddenKeys,
} from "./lib/model-wave.mjs";
import { syntheticAnalysis, syntheticWave, syntheticCtx } from "./lib/model-report-fixtures.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const SITE = join(HERE, "..");
const WAVES = join(SITE, "src", "data", "model-benchmark", "waves");
const ROOT = join(SITE, "..");

let passed = 0;
const failures = [];
const clone = (x) => JSON.parse(JSON.stringify(x));
function check(label, fn) {
  try { fn(); passed += 1; console.log(`  ok   ${label}`); } catch (e) { failures.push(`${label}: ${e.message}`); console.log(`  FAIL ${label}: ${e.message}`); }
}
const assert = (c, m) => { if (!c) throw new Error(m); };
/** A negative control: the problems list must contain `rule`; reports which rule tripped. */
function trips(label, problems, rule) {
  check(`NC ${label} -> ${rule}`, () => {
    assert(problems.length > 0, "gate passed on the planted defect");
    assert(problems.some((p) => p.startsWith(rule)), `tripped ${problems.map((p) => p.split(":")[0]).join(", ")} instead of ${rule}`);
    console.log(`         tripped: ${problems.find((p) => p.startsWith(rule)).slice(0, 150)}`);
  });
}
const throwsWith = (fn, re) => { try { fn(); } catch (e) { return re.test(e.message) ? e.message : null; } return null; };

console.log("G15 committed waves\n");
const manifestPath = join(WAVES, "manifest.json");
const manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, "utf8")) : [];
check("manifest lists at least one wave (a gate over zero waves proves nothing)", () => assert(manifest.length > 0, "waves/manifest.json is empty or missing"));
const waves = manifest.map((e) => ({ e, w: JSON.parse(readFileSync(join(WAVES, `${e.run_id}.json`), "utf8")) }));
for (const { e, w } of waves) {
  check(`${e.run_id}: wave is valid`, () => { const p = waveProblems(w); assert(p.length === 0, p.join("; ")); });
  check(`${e.run_id}: manifest entry equals the wave's own fields`, () => assert(JSON.stringify(e) === JSON.stringify(manifestEntry(w)), "manifest entry differs from the wave"));
  check(`${e.run_id}: status is read from flags (pilot => official:false, comparability:none)`, () => assert(e.status === "pilot" && w.official === false && w.comparability === "none", "flags and status disagree"));
  check(`${e.run_id}: file is canonical (serialises to itself)`, () => assert(readFileSync(join(WAVES, `${e.run_id}.json`), "utf8") === serialiseWave(w), "not canonical JSON + trailing newline"));
}
check("every wave file on disk is in the manifest", () => {
  const files = readdirSync(WAVES).filter((f) => f.endsWith(".json") && f !== "manifest.json").map((f) => f.replace(/\.json$/, ""));
  for (const f of files) assert(manifest.some((m) => m.run_id === f), `${f}.json is not in manifest.json`);
});
check("manifest is newest first", () => assert(JSON.stringify(manifest) === JSON.stringify(sortManifest(manifest)), "manifest order differs from sortManifest"));

console.log("\nG15 negative controls (planted defects in copies of a wave)\n");
const synth = syntheticWave();
const pilot = waves[0]?.w ?? synth; // controls run on the committed wave when present, else the synthetic one
for (const [name, base] of [["committed wave", pilot], ["synthetic wave-2", synth]]) {
  console.log(`  -- ${name} (${base.run_id})`);
  check(`${name}: unmodified copy is valid`, () => assert(waveProblems(clone(base)).length === 0, waveProblems(clone(base)).join("; ")));
  const ids = Object.keys(base.subjects);
  const sep = base.derived.separated_subjects[0];
  const grp = base.derived.not_separated_groups[0];
  const mut = (f) => { const w = clone(base); f(w); return waveProblems(w); };
  trips(`${name}: band key on a subject`, mut((w) => { w.subjects[ids[0]].band = "Established"; }), "W-forbidden-key");
  trips(`${name}: rank key deep in operations`, mut((w) => { w.operations.rank_order = [1]; }), "W-forbidden-key");
  trips(`${name}: "score" key`, mut((w) => { w.length.model_score = 1; }), "W-forbidden-key");
  trips(`${name}: raw composite key on a subject`, mut((w) => { w.subjects[ids[0]].composite = 1; }), "W-forbidden-key");
  trips(`${name}: official:true`, mut((w) => { w.official = true; }), "W-official");
  trips(`${name}: comparability not none`, mut((w) => { w.comparability = "within-wave"; }), "W-comparability");
  trips(`${name}: subjects not alphabetical`, mut((w) => { const s = w.subjects; w.subjects = Object.fromEntries(Object.entries(s).reverse()); }), "W-order");
  trips(`${name}: derived group tampered`, mut((w) => { w.derived.not_separated_group_range = [0, 100]; }), "W-derived");
  trips(`${name}: a separation flag contradicts its interval`, mut((w) => { const e = w.pairwise.find((x) => !x.separated); e.separated = true; }), "W-pairwise");
  trips(`${name}: length bound exported for a not-separated model`, mut((w) => { w.length.composite_if_pooled_slope_removed[grp[0]] = 1; }), "W-bound");
  trips(`${name}: measured_original_answer_stats re-added`, mut((w) => { w.exclusion_record.measured_original_answer_stats = {}; }), "W-exclusion");
  trips(`${name}: point outside its own range`, mut((w) => { w.subjects[sep].pilot_composite = w.subjects[sep].pilot_composite_interval95[1] + 5; }), "W-subject");
  trips(`${name}: bad sha`, mut((w) => { w.source_sha256 = "abc"; }), "W-sha");
  trips(`${name}: decision status outside the vocabulary`, mut((w) => { w.publication.decision_status = "approved"; }), "W-publication");
  // Amendments 2026-10-01: sensitivity block, serving counts, conversation size.
  trips(`${name}: sensitivity level-shift range tampered`, mut((w) => { w.derived.sensitivity_level_shift_group_range = [-99, 99]; }), "W-derived");
  trips(`${name}: a sensitivity point moved without updating derived`, mut((w) => { const s = w.sensitivity.subjects[grp[0]]; s.pilot_composite = s.pilot_composite_interval95[1]; }), "W-derived");
  trips(`${name}: separation_pattern_unchanged contradicts the pairwise flags`, mut((w) => { w.sensitivity.separation_pattern_unchanged = !w.sensitivity.separation_pattern_unchanged; }), "W-sensitivity-pattern");
  trips(`${name}: a sensitivity pair flag contradicts its interval`, mut((w) => { const e = w.sensitivity.pairwise.find((x) => !x.separated); e.separated = true; }), "W-sensitivity-pairwise-consistent");
  trips(`${name}: sensitivity block missing`, mut((w) => { delete w.sensitivity; }), "W-sensitivity");
  trips(`${name}: sensitivity point outside its interval`, mut((w) => { const s = w.sensitivity.subjects[sep]; s.pilot_composite = s.pilot_composite_interval95[1] + 5; }), "W-sensitivity-contains");
  trips(`${name}: bank serving counts do not add up`, mut((w) => { w.bank.items_not_served += 1; }), "W-bank");
  trips(`${name}: not-served split does not add up`, mut((w) => { w.bank.items_not_served_sensitive += 1; }), "W-bank");
  trips(`${name}: bank.items_served differs from design.items_served`, mut((w) => { w.bank.items_served += 1; w.bank.items_not_served -= 1; w.bank.items_not_served_unreviewed -= 1; }), "W-bank");
  trips(`${name}: items_per_conversation_max missing`, mut((w) => { delete w.design.items_per_conversation_max; }), "W-design");
  check(`${name}: derived level-shift fields are one-decimal min/max over every not-separated-group member`, () => {
    const d = base.derived;
    const members = base.derived.not_separated_groups.flat();
    const shifts = members.map((i) => d.sensitivity_level_shift[i]);
    assert(JSON.stringify(d.sensitivity_level_shift_group_range) === JSON.stringify([Math.min(...shifts), Math.max(...shifts)]), "range is not min/max of the group's shifts");
    for (const i of Object.keys(base.subjects)) {
      const want = Math.round((base.sensitivity.subjects[i].pilot_composite - base.subjects[i].pilot_composite) * 10) / 10;
      assert(d.sensitivity_level_shift[i] === want, `${i}: shift ${d.sensitivity_level_shift[i]} != ${want}`);
      assert(Math.abs(d.sensitivity_level_shift[i] * 10 - Math.round(d.sensitivity_level_shift[i] * 10)) < 1e-9, `${i}: more than one decimal`);
    }
  });
}

console.log("\nG9 analysis schema\n");
const A = syntheticAnalysis();
check("synthetic analysis is valid", () => assert(analysisProblems(A).length === 0, analysisProblems(A).join("; ")));
const aMut = (f) => { const a = clone(A); f(a); return analysisProblems(a); };
const anyId = Object.keys(A.subjects)[0];
trips("subject official:true", aMut((a) => { a.subjects[anyId].official = true; }), "A-official");
trips("subject comparability not none", aMut((a) => { a.subjects[anyId].comparability = "full"; }), "A-comparability");
trips("point outside its interval", aMut((a) => { a.subjects[anyId].interval95 = [a.subjects[anyId].composite + 1, a.subjects[anyId].composite + 2]; }), "A-interval-contains");
trips("pairwise flag flipped", aMut((a) => { a.pairwise[0].separated = !a.pairwise[0].separated; }), "A-pairwise-consistent");
trips("pair missing", aMut((a) => { a.pairwise.pop(); }), "A-pairwise");
trips("duplicate pair", aMut((a) => { a.pairwise[1] = clone(a.pairwise[0]); }), "A-pairwise");
trips("pair with a after b", aMut((a) => { const e = a.pairwise[0]; [e.a, e.b] = [e.b, e.a]; }), "A-pairwise");
trips("dimension flag contradicts interval", aMut((a) => { a.dimension_pairwise[0].separated = !a.dimension_pairwise[0].separated; }), "A-dim-pairwise-consistent");
trips("Bonferroni without 95%", aMut((a) => { const e = a.dimension_pairwise.find((x) => !x.separated); e.bonferroni_separated = true; }), "A-dim-pairwise-consistent");
trips("response count inconsistent", aMut((a) => { a.design.responses += 1; }), "A-counts");
trips("rating count inconsistent", aMut((a) => { a.design.ratings += 1; }), "A-counts");
trips("item counts do not sum to items_served", aMut((a) => { a.design.items_served += 1; }), "A-counts");
trips("design.subjects differs from subjects", aMut((a) => { a.design.subjects = a.design.subjects.slice(1); }), "A-subjects");
trips("required block missing", aMut((a) => { delete a.routing; }), "A-required");
trips("sensitivity block missing", aMut((a) => { delete a.sensitivity; }), "A-required");
trips("sensitivity pattern flag contradicts its pairs", aMut((a) => { a.sensitivity.separation_pattern_unchanged = !a.sensitivity.separation_pattern_unchanged; }), "A-sensitivity-pattern");
trips("sensitivity pair flag contradicts its interval", aMut((a) => { const e = a.sensitivity.pairwise.find((x) => !x.separated); e.separated = true; }), "A-sensitivity-pairwise-consistent");
check("NC projection refuses serving counts that do not add up, and a missing conversation size", () => {
  const c = syntheticCtx(A);
  assert(throwsWith(() => projectWave(clone(A), { ...c, bank: { ...c.bank, items_not_served: c.bank.items_not_served + 1 } }), /items_served \+ items_not_served/), "inconsistent serving counts accepted");
  assert(throwsWith(() => projectWave(clone(A), { ...c, items_per_conversation_max: undefined }), /items_per_conversation_max/), "missing conversation size accepted");
  assert(throwsWith(() => projectWave(clone(A), { ...c, bank: { ...c.bank, items_served: c.bank.items_served + 1, items_not_served: c.bank.items_not_served - 1, items_not_served_unreviewed: c.bank.items_not_served_unreviewed - 1 } }), /serving rule gives/), "a serving count that differs from the analysis was accepted");
});
trips("dimension mean outside its interval", aMut((a) => { const d = Object.keys(a.subjects[anyId].dimensions)[0]; a.subjects[anyId].dimension_intervals95[d] = [9, 10]; }), "A-dim-interval-contains");
check("NC bank version mismatch: projection refuses", () => {
  const m = throwsWith(() => projectWave(clone(A), { ...syntheticCtx(A), bank: { ...syntheticCtx(A).bank, version: "v0.0" } }), /bank version mismatch/);
  assert(m, "projection accepted a bank version that differs from the analysis");
  console.log(`         threw: ${m.slice(0, 120)}`);
});
check("NC non-clique not-separated relation: projection refuses", () => {
  // x~y and y~z not separated, x/z separated: "cannot tell all three apart" would be false.
  const a = clone(A);
  const ids = Object.keys(a.subjects).sort();
  const [x, y, z] = ids.slice(0, 3);
  const setFlag = (p, sepFlag) => { p.interval95 = sepFlag ? [5, 9] : [-1, 1]; p.separated = sepFlag; };
  for (const p of a.pairwise) { setFlag(p, true); }
  for (const p of a.pairwise) { const k = `${p.a}|${p.b}`; if (k === `${x}|${y}` || k === `${y}|${z}`) setFlag(p, false); }
  a.sensitivity.pairwise = clone(a.pairwise); // keep the sensitivity block consistent with the edited pairs
  a.sensitivity.separation_pattern_unchanged = true;
  assert(analysisProblems(a).length === 0, `fixture itself invalid: ${analysisProblems(a).join("; ")}`);
  const m = throwsWith(() => notSeparatedGroups(ids, a.pairwise), /not a clique/);
  assert(m, "a non-clique relation was accepted as a group");
  console.log(`         threw: ${m.slice(0, 140)}`);
});

console.log("\nprojection properties\n");
check("projection drops band, original-answer stats and prose status; keeps pilot_* only", () => {
  const w = projectWave(clone(A), syntheticCtx(A, { status: "proposed" }));
  const text = JSON.stringify(w);
  assert(!/SYNTHETIC-BAND|measured_original_answer_stats|SYNTHETIC PROSE STATUS/.test(text), "a withheld field reached the wave");
  assert(forbiddenKeys(w).length === 0, "forbidden keys present");
  assert(Object.values(w.subjects).every((s) => "pilot_composite" in s && !("composite" in s)), "subject keys wrong");
});
check("projection is independent of the order A lists subjects and pairs in (shuffle control)", () => {
  const a = clone(A);
  a.subjects = Object.fromEntries(Object.entries(a.subjects).reverse());
  a.pairwise.reverse();
  a.dimension_pairwise.reverse();
  const ctx = syntheticCtx(A, { status: "proposed" });
  // source_sha256 legitimately differs (the source bytes differ); everything else must not.
  const strip = (w) => { delete w.source_sha256; return serialiseWave(w); };
  const base = strip(projectWave(clone(A), ctx));
  const shuffled = strip(projectWave(a, ctx));
  assert(base === shuffled, "wave output depends on input order");
});
check("NC the shuffle control is not vacuous: a wave with reordered subjects fails G15", () => {
  const w = clone(synth);
  w.subjects = Object.fromEntries(Object.entries(w.subjects).reverse());
  assert(waveProblems(w).some((p) => p.startsWith("W-order")), "reordered subjects not caught");
});
check("length bound is exported only for separated models", () => {
  for (const w of [synth, pilot]) {
    const keys = Object.keys(w.length.composite_if_pooled_slope_removed).sort();
    assert(JSON.stringify(keys) === JSON.stringify([...w.derived.separated_subjects].sort()), `bound keys ${keys} != separated subjects ${w.derived.separated_subjects}`);
  }
});
check("decision status parses from the DECISIONS.md index row (and refuses an absent row)", () => {
  const text = "| D-1 | x | y | active |\n| D-29a | 2026-10-01 | t | **proposed — built on a directive** |\n";
  assert(parseDecisionStatus(text, "D-29a") === "proposed", "proposed not parsed");
  assert(parseDecisionStatus(text, "D-1") === "active", "active not parsed");
  assert(throwsWith(() => parseDecisionStatus(text, "D-99"), /no index row/), "absent row accepted");
});
if (existsSync(join(ROOT, "DECISIONS.md"))) {
  check("committed wave's publication.decision_status equals DECISIONS.md", () => {
    for (const { w } of waves) assert(parseDecisionStatus(readFileSync(join(ROOT, "DECISIONS.md"), "utf8"), w.publication.decision_ref) === w.publication.decision_status, "the wave file is stale against DECISIONS.md (re-export with --force)");
  });
}
const aPath = join(ROOT, "research", "model-runs", waves[0]?.w.run_id ?? "none", "analysis.json");
if (existsSync(aPath)) {
  check("real analysis.json passes the schema", () => { const p = analysisProblems(JSON.parse(readFileSync(aPath, "utf8"))); assert(p.length === 0, p.join("; ")); });
} else if (process.env.CB_REQUIRE_RESEARCH === "1") {
  check("real analysis.json is reachable (CB_REQUIRE_RESEARCH=1)", () => { throw new Error(`${aPath} not found`); });
} else {
  console.log("  skip real analysis.json (research/ not present: Docker context)");
}

console.log(`\n${passed} passed, ${failures.length} failed`);
if (failures.length) { console.log("\n" + failures.join("\n")); process.exit(1); }
