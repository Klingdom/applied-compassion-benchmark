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
  normaliseAnalysis, orientPairs, parsePreregSubjects, parsePreregRuntime, judgePairing,
} from "./lib/model-wave.mjs";
import { syntheticAnalysis, syntheticWave, syntheticCtx, syntheticPreregText } from "./lib/model-report-fixtures.mjs";

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
// A wave of the later kind with NO separated model: two subjects whose ids carry dots, local pinned builds, judges of another family.
const ALL_GROUPED_OPTS = { runId: "wave-2029-05-05", clusters: [[["orion1.5-9b", 40.1], ["vega2.0-3b", 42.0]]], dims: ["KIN", "LIS", "NOT", "PLA", "REF", "TRU"], excluded: null, local: true, reversePairs: true, seed: 5 };
const synthAllGrouped = syntheticWave(ALL_GROUPED_OPTS);
const pilot = waves.find(({ w }) => w.derived.separated_subjects.length > 0)?.w ?? synth; // the committed wave with a separated model, else the synthetic one
const controlTargets = [...waves.map(({ w }) => [`committed ${w.run_id}`, w]), ["synthetic wave-2", synth], ["synthetic all-grouped wave", synthAllGrouped]];
for (const [name, base] of controlTargets) {
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
  if (base.exclusion_record) trips(`${name}: measured_original_answer_stats re-added`, mut((w) => { w.exclusion_record.measured_original_answer_stats = {}; }), "W-exclusion");
  if (sep) trips(`${name}: point outside its own range`, mut((w) => { w.subjects[sep].pilot_composite = w.subjects[sep].pilot_composite_interval95[1] + 5; }), "W-subject");
  else trips(`${name}: a group member's point outside its own range`, mut((w) => { w.subjects[ids[0]].pilot_composite = w.subjects[ids[0]].pilot_composite_interval95[1] + 5; }), "W-subject");
  trips(`${name}: bad sha`, mut((w) => { w.source_sha256 = "abc"; }), "W-sha");
  trips(`${name}: decision status outside the vocabulary`, mut((w) => { w.publication.decision_status = "approved"; }), "W-publication");
  // Amendments 2026-10-01: sensitivity block, serving counts, conversation size.
  trips(`${name}: sensitivity level-shift range tampered`, mut((w) => { w.derived.sensitivity_level_shift_group_range = [-99, 99]; }), "W-derived");
  trips(`${name}: a sensitivity point moved without updating derived`, mut((w) => { const s = w.sensitivity.subjects[grp[0]]; s.pilot_composite = s.pilot_composite_interval95[1]; }), "W-derived");
  trips(`${name}: separation_pattern_unchanged contradicts the pairwise flags`, mut((w) => { w.sensitivity.separation_pattern_unchanged = !w.sensitivity.separation_pattern_unchanged; }), "W-sensitivity-pattern");
  trips(`${name}: a sensitivity pair flag contradicts its interval`, mut((w) => { const e = w.sensitivity.pairwise.find((x) => !x.separated); e.separated = true; }), "W-sensitivity-pairwise-consistent");
  trips(`${name}: sensitivity block missing`, mut((w) => { delete w.sensitivity; }), "W-sensitivity");
  trips(`${name}: sensitivity point outside its interval`, mut((w) => { const s = w.sensitivity.subjects[sep ?? ids[0]]; s.pilot_composite = s.pilot_composite_interval95[1] + 5; }), "W-sensitivity-contains");
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
for (const { w } of waves) {
  const aPath = join(ROOT, "research", "model-runs", w.run_id, "analysis.json");
  if (existsSync(aPath)) {
    // A pre-registered direction ("a minus b" with a after b) is re-oriented before validation; every other rule applies as written.
    check(`real ${w.run_id} analysis.json passes the schema (after pair orientation)`, () => { const p = analysisProblems(normaliseAnalysis(JSON.parse(readFileSync(aPath, "utf8")))); assert(p.length === 0, p.join("; ")); });
  } else if (process.env.CB_REQUIRE_RESEARCH === "1") {
    check(`real ${w.run_id} analysis.json is reachable (CB_REQUIRE_RESEARCH=1)`, () => { throw new Error(`${aPath} not found`); });
  } else {
    console.log(`  skip real ${w.run_id} analysis.json (research/ not present: Docker context)`);
  }
}

console.log("\nwaves with no separated model, later-kind runs, and orientation (the second pilot's shape)\n");
check("a wave with no separated model: one group of two, no separated subject, no length bound, group range present", () => {
  const d = synthAllGrouped.derived;
  assert(d.separated_subjects.length === 0 && d.not_separated_groups.length === 1 && d.not_separated_groups[0].length === 2, `shape ${JSON.stringify(d.not_separated_groups)} / ${JSON.stringify(d.separated_subjects)}`);
  assert(Object.keys(synthAllGrouped.length.composite_if_pooled_slope_removed).length === 0, "a length bound was exported for a not-separated model");
  assert(d.dimension_bonferroni_separated_for && Object.keys(d.dimension_bonferroni_separated_for).length === 0, "outside-group counts exist without an outside subject");
});
check("the committed second pilot is exactly that shape (no separated subject, both subjects in one group)", () => {
  const w2 = waves.find(({ w }) => w.derived.separated_subjects.length === 0)?.w;
  assert(w2, "no committed wave without a separated subject");
  assert(w2.derived.not_separated_groups.length === 1 && w2.derived.not_separated_groups[0].length === w2.derived.subject_count, "not one all-subject group");
  assert(Object.keys(w2.length.composite_if_pooled_slope_removed).length === 0, "length bound present");
});
check("orientPairs: a pair listed 'b minus a' is re-oriented alphabetically, the difference negated and the interval mirrored; flags unchanged", () => {
  const out = orientPairs([{ a: "zeta", b: "alpha", difference: 3.125, interval95: [-1.875, 8.625], separated: false }]);
  assert(out[0].a === "alpha" && out[0].b === "zeta" && out[0].difference === -3.125 && JSON.stringify(out[0].interval95) === JSON.stringify([-8.625, 1.875]) && out[0].separated === false, JSON.stringify(out));
  const same = [{ a: "alpha", b: "zeta", difference: 1, interval95: [0.5, 2], separated: true }];
  assert(JSON.stringify(orientPairs(same)) === JSON.stringify(same), "an already-oriented pair changed");
  const zero = orientPairs([{ a: "b", b: "a", difference: 0, interval95: [0, 3], separated: false }]);
  assert(!Object.is(zero[0].difference, -0) && !Object.is(zero[0].interval95[1], -0), "a negative zero was produced");
});
check("a reversed-direction analysis projects to the SAME wave as the oriented one (apart from source_sha256)", () => {
  const strip = (w) => { const c = clone(w); delete c.source_sha256; return serialiseWave(c); };
  const fwd = syntheticWave({ ...ALL_GROUPED_OPTS, reversePairs: false });
  assert(strip(fwd) === strip(synthAllGrouped), "orientation changed the projection");
});
check("normaliseAnalysis leaves an oriented analysis untouched", () => {
  const a = syntheticAnalysis();
  assert(JSON.stringify(normaliseAnalysis(a)) === JSON.stringify(a), "an oriented analysis was changed");
});
check("a later-kind analysis needs no quote_grounding or exclusion_record, but needs one of quote_grounding / judge_validity", () => {
  const a = syntheticAnalysis(ALL_GROUPED_OPTS);
  assert(a.quote_grounding === undefined && a.exclusion_record === undefined, "fixture sanity");
  assert(analysisProblems(normaliseAnalysis(a)).length === 0, analysisProblems(normaliseAnalysis(a)).join("; "));
  const b = clone(a); delete b.judge_validity;
  assert(analysisProblems(normaliseAnalysis(b)).some((p) => p.startsWith("A-required")), "no quote evidence at all was accepted");
  const c = clone(syntheticAnalysis()); delete c.exclusion_record;
  assert(analysisProblems(c).some((p) => p.startsWith("A-required")), "an excluded judge without an exclusion_record was accepted");
});
check("every per-subject map in the later-kind wave is alphabetical (the analysis's own order cannot leak)", () => {
  const w = synthAllGrouped;
  const sorted = (o) => JSON.stringify(Object.keys(o)) === JSON.stringify(Object.keys(o).sort());
  for (const [label, o] of [["design.subject_builds", w.design.subject_builds], ["subject_provenance", w.subject_provenance], ["routing", w.routing], ["operations.subject_replies", w.operations.subject_replies], ["length.within_subject_slopes", w.length.within_subject_slopes], ["self_identifying_replies.by_subject", w.self_identifying_replies.by_subject], ["sensitivity.subjects", w.sensitivity.subjects]]) assert(sorted(o), `${label} is not alphabetical`);
  for (const j of Object.values(w.judges)) assert(sorted(j.by_subject), "judges.*.by_subject is not alphabetical");
  assert(JSON.stringify(w.design.subjects) === JSON.stringify([...w.design.subjects].sort()), "design.subjects is not alphabetical");
});
check("the later-kind wave carries its provenance, judge set, judge validity, bridge, deviations and pre-registration; the first-pilot kind carries none", () => {
  for (const k of ["subject_provenance", "judge_set", "judge_validity", "bridge_drift", "deviations", "preregistration", "self_identifying_replies"]) assert(synthAllGrouped[k] !== undefined, `${k} missing`);
  assert(synthAllGrouped.judge_set.disjoint_from_subjects === true && synthAllGrouped.judge_set.families_disjoint === true, "judge set not disjoint");
  assert(Object.values(synthAllGrouped.subjects).every((s) => typeof s.contamination.via === "string"), "contamination.via missing for a subject with an MCP scorecard");
  for (const k of ["subject_provenance", "judge_set", "judge_validity", "bridge_drift", "deviations", "preregistration", "self_identifying_replies"]) assert(!(k in synth), `${k} leaked into a first-pilot-kind wave`);
  assert(Object.values(synth.subjects).every((s) => !("via" in s.contamination)), "contamination.via on a subject with no MCP scorecard");
});
check("no timestamp, file path of a run record, or per-reply list reached the wave from the later-kind analysis", () => {
  const text = JSON.stringify(synthAllGrouped);
  assert(!/\d{4}-\d{2}-\d{2}T\d{2}:/.test(text) && !text.includes("synthetic/path.json") && !text.includes("scorecard.json") && !text.includes("X-1-A"), "a withheld detail reached the wave");
});
check("projection refuses a later-kind analysis without provenance, with a mismatched digest, or without judge families", () => {
  const a = syntheticAnalysis(ALL_GROUPED_OPTS);
  const ctx = syntheticCtx(a);
  assert(throwsWith(() => projectWave(clone(a), { ...ctx, provenance: undefined }), /provenance/), "missing provenance accepted");
  const badDigest = clone(ctx.provenance); const firstId = Object.keys(badDigest.subjects)[0]; badDigest.subjects[firstId].digest_sha256 = "0".repeat(64);
  assert(throwsWith(() => projectWave(clone(a), { ...ctx, provenance: badDigest }), /digest differs/), "a digest that differs from the analysis was accepted");
  const noFam = clone(ctx.provenance); delete noFam.families;
  assert(throwsWith(() => projectWave(clone(a), { ...ctx, provenance: noFam }), /judge families are required/), "judge-set claims were made without family evidence");
});
check("judge_set is computed from evidence: overlapping families are reported as not disjoint", () => {
  const a = syntheticAnalysis(ALL_GROUPED_OPTS);
  const ctx = syntheticCtx(a);
  const fam = clone(ctx.provenance); for (const j of Object.keys(fam.families.judges)) fam.families.judges[j] = Object.values(fam.families.subjects)[0];
  const w = projectWave(clone(a), { ...ctx, provenance: fam });
  assert(w.judge_set.families_disjoint === false && w.judge_set.disjoint_from_subjects === true, JSON.stringify(w.judge_set));
});
check("preregistration table and runtime line parse from text, and refuse a malformed row", () => {
  const a = syntheticAnalysis(ALL_GROUPED_OPTS);
  const text = syntheticPreregText(a);
  const t = parsePreregSubjects(text);
  assert(Object.keys(t).length === 2 && Object.values(t).every((r) => r.digest_sha256.length === 64 && r.developer && r.licence && r.parameter_size && r.quantisation === "Q4_K_M"), JSON.stringify(t));
  const rt = parsePreregRuntime(text);
  assert(rt && rt.name === "Synthrun" && rt.version === "9.8.7", JSON.stringify(rt));
  assert(parsePreregRuntime("no runtime here") === null, "a missing runtime line was invented");
  assert(throwsWith(() => parsePreregSubjects("| `x` | `t` | `short` | 1B, Q4 | Dev, Lic |"), /not "label/), "a row with a bad digest was accepted");
});
check("judgePairing reads routing: fixed for one pair per subject, rotating for several", () => {
  assert(judgePairing(synthAllGrouped) === "rotating", "later-kind fixture is rotating");
  assert(judgePairing(synth) === "fixed", "first-pilot-kind fixture is one fixed pair");
  assert(judgePairing({ routing: {} }) === "unknown", "no routing is unknown");
});
{
  const base = synthAllGrouped;
  const mutL = (f) => { const w = clone(base); f(w); return waveProblems(w); };
  trips("later-kind wave: a digest changed in subject_provenance", mutL((w) => { const id = Object.keys(w.subject_provenance)[0]; w.subject_provenance[id].digest_sha256 = "f".repeat(64); }), "W-provenance");
  trips("later-kind wave: a subject missing from subject_provenance", mutL((w) => { delete w.subject_provenance[Object.keys(w.subject_provenance)[0]]; }), "W-provenance");
  trips("later-kind wave: judge_set claims disjointness the families contradict", mutL((w) => { w.judge_set.subject_families = [...w.judge_set.judge_families]; }), "W-judge-set");
  trips("later-kind wave: judge_set.judges differs from design.judges", mutL((w) => { w.judge_set.judges = w.judge_set.judges.slice(1); }), "W-judge-set");
  trips("later-kind wave: a failing judge's verdict flipped to PASS", mutL((w) => { const b = w.judge_validity.measured_on_final_quotes; const j = Object.keys(b.judges)[0]; b.judges[j].unfound_rate_percent = b.threshold_percent + 1; }), "W-judge-validity");
  trips("later-kind wave: pre-registration hash differs from design.preregistration_sha256", mutL((w) => { w.preregistration.sha256 = "a".repeat(64); }), "W-preregistration");
  trips("later-kind wave: an official flag", mutL((w) => { w.official = true; }), "W-official");
}

console.log(`\n${passed} passed, ${failures.length} failed`);
if (failures.length) { console.log("\n" + failures.join("\n")); process.exit(1); }
