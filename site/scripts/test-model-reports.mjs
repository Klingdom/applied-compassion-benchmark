#!/usr/bin/env node
/**
 * test-model-reports.mjs -- the report release gates (docs/AI_MODEL_ASSESSMENT_TEMPLATE.md I).
 *
 *   G1  report-figures          G2  report-binding        G3  no-unseparated-ranking
 *   G4  no-implied-order        G5  status-banner         G6  no-rating-schema
 *   G7  crisis-adjacency        G8  claims-vs-pairwise    G10 regeneration
 *   G11 word-budget             G13 wave2-dryrun          G18 build-model-reports checks
 *
 * How each gate is proved: a compliant scaffold is generated FROM A WAVE (never
 * typed here), must compile clean, and then a planted defect is injected and the
 * compiler must fail with the SPECIFIC rule named. Every control runs against
 * three waves: a synthetic wave-2 (five models, two not-separated groups, six
 * dimensions), a synthetic wave-3 (four models, one group, nine dimensions) and
 * the committed pilot. No gate encodes a pilot value: the last section scans
 * the gate sources for every number in the committed wave.
 *
 * The real narrative (reports/<run_id>.md) is compiled with the same rules (G18).
 *
 * STUBS (need the frontend's built pages; listed, not implemented):
 *   G5 / G6 over out/ai-models/**   (the functions exist and are proved below)
 *   G7 DOM proximity of crisis text to model names and figures
 *   G19 test:model-html-leak        G20 test:model-report-seo        G21 Docker smoke
 */
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { compileReport, verifyCompiled, reportText, renderHtml, makeNaming, lexiconProblems, countWords } from "./lib/model-report.mjs";
import { syntheticAnalysis, syntheticWave, syntheticCtx, syntheticReportMd, syntheticReportInBand } from "./lib/model-report-fixtures.mjs";
import { projectWave, serialiseWave } from "./lib/model-wave.mjs";
import { readDimensionNames } from "./lib/dimension-names.mjs";
import { ratingSchemaProblems, bannerProblems, FORBIDDEN_LD_TYPES } from "./lib/model-report-html-gates.mjs";
import { WORD_MIN, WORD_MAX, NO_DEVELOPER_SENTENCE, SECTIONS } from "./lib/model-report-template.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const SITE = join(HERE, "..");
const DATA = join(SITE, "src", "data", "model-benchmark");

let passed = 0;
const failures = [];
const clone = (x) => JSON.parse(JSON.stringify(x));
function check(label, fn) {
  try { fn(); passed += 1; console.log(`  ok   ${label}`); } catch (e) { failures.push(`${label}: ${e.message}`); console.log(`  FAIL ${label}: ${e.message}`); }
}
const assert = (c, m) => { if (!c) throw new Error(m); };
const section = (t) => console.log(`\n${t}`);

// ---- waves under test -------------------------------------------------------
const committed = existsSync(join(DATA, "waves", "manifest.json"))
  ? JSON.parse(readFileSync(join(DATA, "waves", "manifest.json"), "utf8")).map((e) => JSON.parse(readFileSync(join(DATA, "waves", `${e.run_id}.json`), "utf8")))
  : [];
const W2 = syntheticWave();
const W3 = syntheticWave({
  runId: "wave-2028-11-30",
  clusters: [[["east", 50.0], ["north", 51.5], ["south", 49.2]], [["west", 20.1]]],
  dims: ["AAA", "BBB", "CCC", "DDD", "EEE", "FFF", "GGG", "HHH", "III"],
  itemsPerDim: 7, trials: 3, judgesPer: 3, seed: 11, excluded: "east", bankVersion: "v3.1",
});
const WAVES = [["synthetic wave-2", W2], ["synthetic wave-3", W3], ...committed.map((w) => [`committed ${w.run_id}`, w])];
assert(committed.length > 0, "no committed wave to test against");

// ---- markdown mutation helpers (the fixture uses numbered H2s) ----------------
const H2 = (md, n) => md.split("\n").findIndex((l) => new RegExp(`^## ${n}\\. `).test(l));
function afterHeading(md, n, text) {
  const L = md.split("\n");
  const i = H2(md, n);
  assert(i >= 0, `fixture has no section ${n}`);
  L.splice(i + 1, 0, "", text);
  return L.join("\n");
}
function replaceOnce(md, from, to) {
  assert(md.includes(from), `fixture lacks the anchor: ${from.slice(0, 60)}`);
  return md.replace(from, () => to);
}
function removeLines(md, re) {
  const L = md.split("\n");
  const kept = L.filter((l) => !re.test(l));
  assert(kept.length < L.length, `no line matched ${re}`);
  return kept.join("\n");
}
function sectionRange(md, n) {
  const L = md.split("\n");
  const a = H2(md, n);
  let b = L.findIndex((l, i) => i > a && /^## /.test(l));
  if (b < 0) b = L.length;
  return [a, b];
}
function removeSection(md, n) {
  const L = md.split("\n");
  const [a, b] = sectionRange(md, n);
  L.splice(a, b - a);
  return L.join("\n");
}
function swapSections(md, n, m) {
  const L = md.split("\n");
  const [a1, b1] = sectionRange(md, n);
  const [a2, b2] = sectionRange(md, m);
  const x = L.slice(a1, b1);
  const y = L.slice(a2, b2);
  assert(b1 === a2, "sections must be adjacent");
  L.splice(a1, b2 - a1, ...y, ...x);
  return L.join("\n");
}

// The real dimension names are loaded for EVERY compile (QA 2026-10-01: R-lowest-claim rejected a linked dimension name when the map was empty).
const dimensionNames = readDimensionNames();
const compile = (md, wave, extra = {}) => compileReport({ md, wave, dimensionNames, ...extra });
const rules = (r) => [...new Set(r.errors.map((e) => e.rule))];
function ctxOf(w) {
  const naming = makeNaming(w);
  const g0 = w.derived.not_separated_groups[0];
  const sep = w.derived.separated_subjects[0];
  return {
    w, naming, g0, a: g0[0], b: g0[1], c: g0[2], sep,
    sepTok: `{{subjects.${sep}|name}}`,
    A: naming.full[g0[0]], B: naming.full[g0[1]], S: naming.full[sep],
    nsPair: w.pairwise.findIndex((e) => !e.separated),
    sPair: w.pairwise.findIndex((e) => e.separated),
    nsDim: w.dimension_pairwise.findIndex((e) => !e.bonferroni_separated),
    sDim: w.dimension_pairwise.findIndex((e) => e.bonferroni_separated),
  };
}

/** One control: `md` mutated must fail with `rule`; reports the message that tripped. */
function nc(label, md, wave, rule, extra) {
  check(`NC ${label} -> ${rule}`, () => {
    const r = compile(md, wave, extra);
    assert(r.errors.length > 0, "compiled clean: the planted defect was not caught");
    const hit = r.errors.find((e) => e.rule === rule);
    assert(hit, `tripped [${rules(r).join(", ")}] but not ${rule}`);
    console.log(`         ${hit.rule}: ${hit.message.slice(0, 150)}`);
  });
}
function pc(label, md, wave) {
  check(`PC ${label} compiles clean`, () => {
    const r = compile(md, wave);
    assert(r.errors.length === 0, r.errors.map((e) => `${e.rule}: ${e.message}`).join(" | ").slice(0, 400));
  });
}

// ===========================================================================
section("baseline: a scaffold generated from each wave compiles clean and verifies");
const BASE = new Map();
for (const [name, w] of WAVES) {
  const md = syntheticReportInBand(w);
  BASE.set(w, md);
  check(`${name}: scaffold compiles clean, in band, and its ledger re-resolves`, () => {
    const r = compile(md, w);
    assert(r.errors.length === 0, r.errors.map((e) => `${e.rule}: ${e.message}`).join(" | ").slice(0, 500));
    assert(r.report.word_count >= WORD_MIN && r.report.word_count <= WORD_MAX, `word count ${r.report.word_count}`);
    const figs = r.report.figure_ledger.filter((e) => e.kind === "fig").length;
    assert(figs > 20, `only ${figs} figures examined`);
    const v = verifyCompiled(r.report, w);
    assert(v.length === 0, v.join("; "));
    console.log(`         ${r.report.word_count} words, ${figs} figures, ${r.report.sections.length} sections`);
  });
}

// ===========================================================================
for (const [name, w] of WAVES) {
  const c = ctxOf(w);
  const base = BASE.get(w);
  const sepGroup = w.derived.not_separated_groups.length;
  console.log(`\n=== controls against ${name} (${w.run_id}) ===`);

  section("G1 report-figures");
  nc("unresolved token", afterHeading(base, 6, "The range was {{subjects.nonexistent.pilot_composite_interval95|range}}."), w, "R-token-unresolved");
  nc("path absent from this wave (a pilot-only path)", afterHeading(base, 6, "Median {{subjects.claude-fable.median_reply_words|n0}}."), W2 === w ? W3 : W2, "R-token-unresolved");
  nc("bare figure in prose", afterHeading(base, 6, "The mean was 71.3."), w, "R-bare-digit");
  nc("bare figure with a comma (a catalogue count)", afterHeading(base, 6, "The index covers 1,325 entities."), w, "R-bare-digit");
  nc("figure in a heading that is not a section number", replaceOnce(base, "### Glossary", "### Glossary of 7 terms"), w, "R-bare-digit");
  nc("number with no format", afterHeading(base, 6, `Words ${"{{"}subjects.${c.a}.median_reply_words${"}}"}.`), w, "R-token-format");
  nc("range read as one decimal number", afterHeading(base, 6, `Range ${"{{"}subjects.${c.a}.pilot_composite_interval95|n1${"}}"}.`), w, "R-token-format");
  nc("unknown format", afterHeading(base, 6, `Words ${"{{"}subjects.${c.a}.median_reply_words|fixed9${"}}"}.`), w, "R-token-unresolved");
  nc("unclosed token", afterHeading(base, 6, `Words {{subjects.${c.a}.median_reply_words|n0.`), w, "R-token-syntax");
  const lit = (n, src) => Array.from({ length: n }, (_, i) => `{{lit:${i + 1} in 4|source:${src}}}`).join(" ");
  pc("five literals with sources", afterHeading(base, 6, `Context: ${lit(5, "synthetic")}.`), w);
  nc("six literals (cap is five)", afterHeading(base, 6, `Context: ${lit(6, "synthetic")}.`), w, "R-lit-cap");
  nc("literal without a source", afterHeading(base, 6, "Context: {{lit:1 in 4}}."), w, "R-lit-source");
  pc("allowed digits: date, run id, item id, decision id", afterHeading(base, 6, `Dated 2026-10-01, run ${w.run_id}, item EQU-1-B, decision D-29a.`), w);
  nc("measured_original_answer_stats cited", afterHeading(base, 10, "{{exclusion_record.measured_original_answer_stats|n0}}"), w, "R-measured-original");
  // tampering with COMPILED output
  const good = compile(base, w).report;
  const tamper = (label, fn, rule) => check(`NC compiled output ${label} -> ${rule}`, () => {
    const r = clone(good);
    const wv = fn(r, clone(w)) ?? w;
    const v = verifyCompiled(r, wv);
    assert(v.length > 0, "verifyCompiled passed on tampered output");
    const hit = v.find((p) => p.startsWith(rule));
    assert(hit, `tripped ${v.map((p) => p.split(":")[0])} not ${rule}`);
    console.log(`         ${hit.slice(0, 150)}`);
  });
  tamper("ledger value edited", (r) => { const e = r.figure_ledger.find((x) => x.kind === "fig" && /\d/.test(x.rendered)); e.rendered = e.rendered + "9"; }, "V-");
  tamper("a figure typed into the markdown", (r) => { r.sections[5].markdown += "\n\nThe mean was 71.3."; r.sections[5].html = renderHtml(r.sections[5].markdown); }, "V-unexplained-digit");
  tamper("html edited by hand", (r) => { r.sections[0].html = r.sections[0].html.replace("<p>", "<p>Edited. "); }, "V-html");
  tamper("one figure's text replaced by another figure's value", (r) => {
    const numeric = r.figure_ledger.filter((x) => x.kind === "fig" && x.offset >= 0 && /^\d[\d.,]*$/.test(x.rendered));
    const x = numeric[0];
    const y = numeric.find((n) => n.rendered !== x.rendered);
    const sec = r.sections.find((s) => s.markdown.includes(x.rendered));
    sec.markdown = sec.markdown.replace(x.rendered, y.rendered);
    sec.html = renderHtml(sec.markdown);
  }, "V-");
  tamper("wave changed after compile (a cited figure moved)", (r, wv) => {
    const e = r.figure_ledger.find((x) => x.kind === "fig" && typeof x.value === "number");
    const keys = e.canonical.split(".");
    let o = wv;
    for (const k of keys.slice(0, -1)) o = o[k];
    o[keys[keys.length - 1]] += 1;
    return wv;
  }, "V-rendered");
  tamper("compiled against another wave", (r, wv) => { wv.source_sha256 = "0".repeat(64); return wv; }, "V-wave-sha");
  tamper("a timestamp in the output", (r) => { r.generated_at = "2026-10-01T12:00:00.000Z"; }, "V-timestamp");

  section("G2 report-binding");
  nc("a figure beside the wrong model's name", afterHeading(base, 6, `${c.A} has a range of {{subjects.${c.b}.pilot_composite_interval95|range}}.`), w, "R-binding");
  pc("the same sentence with the right model", afterHeading(base, 6, `${c.A} has a range of {{subjects.${c.a}.pilot_composite_interval95|range}}.`), w);
  nc("a figure in a sentence naming only other models", afterHeading(base, 6, `${c.A} and ${c.B} were run. Judges agreed on {{subjects.${c.sep}.judge_agreement.exact|pct}} of ${c.A}'s replies.`), w, "R-binding");
  nc("table row with another model's range", replaceOnce(base, `| {{subjects.${c.a}|name}} | {{subjects.${c.a}.pilot_composite_interval95|range}}`, `| {{subjects.${c.a}|name}} | {{subjects.${c.b}.pilot_composite_interval95|range}}`), w, "R-binding");
  nc("point estimate in prose", afterHeading(base, 6, `The point was {{subjects.${c.a}.pilot_composite|n1}}.`), w, "R-point-in-prose");
  nc("point estimate in a table not labelled point estimate", replaceOnce(base, "| Model | Range | point estimate |", "| Model | Range | value |"), w, "R-point-in-prose");
  nc("point difference for a not-separated pair", afterHeading(base, 6, `The gap was {{pairwise.${c.nsPair}.difference|n1}}.`), w, "R-difference-unseparated");
  // Amendment 2026-10-01 #8 (R-reconstruct): the scaffold shows the separated subject's point, so a point
  // difference against a not-separated group member is forbidden; a separated-vs-separated pair is not.
  const gm = new Set(w.derived.not_separated_groups.flat());
  const pairIdx = (list, pred) => list.findIndex((e) => e.separated && pred(e));
  const sGroupPair = pairIdx(w.pairwise, (e) => gm.has(e.a) || gm.has(e.b));
  const sFreePair = pairIdx(w.pairwise, (e) => !gm.has(e.a) && !gm.has(e.b));
  assert(sGroupPair >= 0, "no separated pair involving a group member to probe");
  nc("point difference between a separated subject and a group member while the separated point is shown", afterHeading(base, 6, `The gap was {{pairwise.${sGroupPair}.difference|n1}}.`), w, "R-reconstruct");
  const sensGroupPair = pairIdx(w.sensitivity.pairwise, (e) => gm.has(e.a) || gm.has(e.b));
  if (sensGroupPair >= 0) nc("sensitivity point difference against a group member while the separated point is shown", afterHeading(base, 9, `The gap was {{sensitivity.pairwise.${sensGroupPair}.difference|n1}}.`), w, "R-reconstruct");
  if (sFreePair >= 0) pc("point difference between two separated subjects is allowed (no hidden point is reachable)", afterHeading(base, 6, `The gap was {{pairwise.${sFreePair}.difference|n1}}.`), w);
  const sepPointTok = `{{subjects.${c.sep}.pilot_composite|n1}}`;
  check("the scaffold shows the separated point exactly where this gate keys on it", () => assert(base.includes(sepPointTok), "separated point missing from the scaffold"));
  pc("with no separated point shown, a separated-vs-group difference is allowed", afterHeading(base.split(sepPointTok).join("not shown"), 6, `The gap was {{pairwise.${sGroupPair}.difference|n1}}.`), w);
  nc("the same difference reaches R-reconstruct when the point is shown only in front matter", afterHeading(`---\ntitle: Unofficial pilot\nabstract: A separated model at ${sepPointTok}.\n---\n${base.split(sepPointTok).join("not shown")}`, 6, `The gap was {{pairwise.${sGroupPair}.difference|n1}}.`), w, "R-reconstruct");
  if (c.nsDim >= 0) nc("dimension difference without the Bonferroni flag", afterHeading(base, 8, `The gap was {{dimension_pairwise.${c.nsDim}.difference|n2}}.`), w, "R-difference-unseparated");
  if (c.sDim >= 0) pc("dimension difference that survives the Bonferroni flag", afterHeading(base, 8, `The gap was {{dimension_pairwise.${c.sDim}.difference|n2}}.`), w);
  pc("pair selector syntax resolves to the same element", afterHeading(base, 6, `Range {{pairwise[a=${w.pairwise[0].a},b=${w.pairwise[0].b}].interval95|range}}.`), w);

  section("G3 no-unseparated-ranking");
  const probes = [
    [`${c.A} leads the field.`, "R-banned-lexicon"],
    [`${c.A} beats ${c.B}.`, "R-banned-lexicon"],
    ["One model was #1.", "R-banned-lexicon"],
    ["A top-scoring model emerged.", "R-banned-lexicon"],
    [`${c.B} ranked third.`, "R-banned-lexicon"],
    ["This is the most compassionate model.", "R-banned-lexicon"],
    ["Contamination was clean.", "R-banned-lexicon"],
    ["The probes cleared every model.", "R-banned-lexicon"],
    [`${c.A} was rated Established.`, "R-banned-lexicon"],
    ["The leaderboard shows an order.", "R-banned-lexicon"],
    ["The weaker model needs work.", "R-banned-lexicon"],
    [`${c.A} is higher than ${c.B}.`, "R-ordering-adjacent"],
    [`${c.B} is below ${c.A}.`, "R-ordering-adjacent"],
  ];
  for (const [text, rule] of probes) nc(`"${text}"`, afterHeading(base, 6, text), w, rule);
  nc("ranking word in a heading", afterHeading(base, 6, "### The leaderboard"), w, "R-banned-lexicon");
  nc("ranking word in the front matter title", `---\ntitle: ${c.A} beats ${c.B}\n---\n${base}`, w, "R-banned-lexicon");
  nc("per-model figure in the front matter", `---\ntitle: Pilot {{subjects.${c.a}.median_reply_words|n0}}\n---\n${base}`, w, "R-front-figure");
  pc("front matter without a ranking word", `---\ntitle: Unofficial pilot\nabstract: Unofficial pilot ${"{{run_id}}"}\n---\n${base}`, w);

  // Front-matter tokens: resolved by the same resolver, ledgered with location front_matter.<field>, and held to
  // the body rules. title / seo_title carry no token and no digit but a YYYY-MM-DD date (template G).
  const fm = (lines) => `---\n${lines.join("\n")}\n---\n${base}`;
  const abs = (t) => fm(["title: Unofficial pilot", `abstract: ${t}`]);
  check("front-matter tokens enter the ledger with location front_matter.abstract and verify clean", () => {
    const r = compile(fm(["title: Unofficial pilot", "dek: A dek, 2026-10-01.", "abstract: A pilot of {{derived.subject_count|n0}} models, run {{run_id}}.", "meta_description: Pilot of {{derived.subject_count|n0}} models."]), w);
    assert(r.errors.length === 0, r.errors.map((e) => `${e.rule}: ${e.message}`).join(" | ").slice(0, 300));
    const locs = r.report.figure_ledger.filter((e) => e.location).map((e) => e.location).sort();
    assert(JSON.stringify(locs) === JSON.stringify(["front_matter.abstract", "front_matter.abstract", "front_matter.meta_description"]), `locations: ${locs.join(",")}`);
    const v = verifyCompiled(r.report, w);
    assert(v.length === 0, v.join("; "));
    const text = reportText(r.report);
    for (const e of r.report.figure_ledger.filter((x) => x.location)) assert(text.slice(e.offset, e.offset + e.rendered.length) === e.rendered, `offset of ${e.token} is wrong`);
  });
  check("NC a digit planted in a compiled front-matter field -> V-unexplained-digit", () => {
    const r = compile(abs("A pilot of {{derived.subject_count|n0}} models."), w).report;
    r.front_matter = r.front_matter.map((l) => (l.startsWith("abstract:") ? `${l} Typed 4.` : l));
    const v = verifyCompiled(r, w);
    const hit = v.find((p) => p.startsWith("V-unexplained-digit"));
    assert(hit, `tripped ${v.map((p) => p.split(":")[0])}`);
    console.log(`         ${hit.slice(0, 150)}`);
  });
  nc("front matter: a bare digit in the abstract", abs("A pilot of 4 models."), w, "R-bare-digit");
  nc("front matter: an unresolved token in the abstract", abs("A pilot of {{derived.nonexistent|n0}} models."), w, "R-token-unresolved");
  nc("front matter: a banned word in the abstract", abs(`${c.A} leads the field.`), w, "R-banned-lexicon");
  nc("front matter: a figure beside the wrong model in the abstract", abs(`${c.A} has a range of {{subjects.${c.b}.pilot_composite_interval95|range}}.`), w, "R-binding");
  nc("front matter: a group member's point in the abstract", abs(`The point for ${c.A} was {{subjects.${c.a}.pilot_composite|n1}}.`), w, "R-group-point");
  pc("front matter: a run-level figure in the abstract and a date in the dek", fm(["title: Unofficial pilot", "dek: Pilot of 2026-10-01.", "abstract: A pilot of {{derived.subject_count|n0}} models."]), w);
  for (const field of ["title", "seo_title"]) {
    nc(`${field} carrying a figure token`, fm([`${field}: Pilot of {{derived.subject_count|n0}} models`]), w, "R-title-token");
    nc(`${field} carrying a literal token`, fm([`${field}: Pilot {{lit:seven|source:probe}}`]), w, "R-title-token");
    nc(`${field} carrying a digit`, fm([`${field}: Pilot of 4 models`]), w, "R-title-digit");
    nc(`${field} carrying a partial date (only YYYY-MM-DD is exempt)`, fm([`${field}: Pilot 2026-10`]), w, "R-title-digit");
    pc(`${field} in words with a date`, fm([`${field}: Pilot of four models (2026-10-01)`]), w);
  }
  pc("positive control: non-separation wording", afterHeading(base, 6, `The pilot does not separate ${c.A} from ${c.B}.`), w);
  pc("positive control: separated model rated lower, with the confound", afterHeading(base, 6, `${c.S} was rated lower than ${c.A}, and the cause is unresolved: reply length is a confound.`), w);
  pc("positive control: a negated ranking word", afterHeading(base, 6, "This is not a ranking and not a leaderboard."), w);
  check("lexiconProblems (exported for titles, meta, alt and JSON-LD) catches the same probes", () => {
    for (const [text] of probes) assert(lexiconProblems(text, w).length > 0, `lexiconProblems missed: ${text}`);
    assert(lexiconProblems("The pilot cannot tell the group apart.", w).length === 0, "false positive on a clean sentence");
  });

  section("G4 no-implied-order");
  const rowRe = (id) => new RegExp(`^\\| \\{\\{subjects\\.${id}\\|name\\}\\}.*$`, "m");
  const tableRows = (md) => w2rows(md);
  function w2rows(md) { return md.split("\n").filter((l) => /^\| \{\{subjects\.[^|]+\|name\}\}/.test(l)); }
  const orderedBy = (key, dir) => {
    const ids = Object.keys(w.subjects).sort((x, y) => dir * (w.subjects[x][key] - w.subjects[y][key]));
    return ids;
  };
  const withRows = (md, ids) => {
    const rows = tableRows(md);
    const byId = new Map(rows.map((r) => [r.match(/subjects\.([^|]+)\|name/)[1], r]));
    const L = md.split("\n");
    const first = L.indexOf(rows[0]);
    L.splice(first, rows.length, ...ids.map((id) => byId.get(id)));
    return L.join("\n");
  };
  const alphaIds = Object.keys(w.subjects).sort();
  nc("table in reverse alphabetical order", withRows(base, [...alphaIds].reverse()), w, "R-implied-order");
  nc("table sorted by the result, ascending", withRows(base, orderedBy("pilot_composite", 1)), w, "R-implied-order");
  const desc = orderedBy("pilot_composite", -1);
  const clusterIds = [...w.derived.not_separated_groups, ...w.derived.separated_subjects.map((s) => [s])].sort((g, h) => h.length - g.length || (g[0] < h[0] ? -1 : 1)).flat();
  if (JSON.stringify(desc) === JSON.stringify(alphaIds) || JSON.stringify(desc) === JSON.stringify(clusterIds)) {
    pc("a table whose result order happens to equal an allowed order (alphabetical or group order) is accepted", withRows(base, desc), w);
  } else {
    nc("table sorted by the result, descending", withRows(base, desc), w, "R-implied-order");
  }
  pc("table in alphabetical order", withRows(base, alphaIds), w);
  pc("table in group order (size descending, alphabetical within)", withRows(base, clusterIds), w);
  nc("names listed in reverse alphabetical order in a sentence", afterHeading(base, 6, `Models considered: ${alphaIds.map((i) => c.naming.full[i]).reverse().join(", ")}.`), w, "R-implied-order");
  pc("names listed in alphabetical order in a sentence", afterHeading(base, 6, `Models considered: ${alphaIds.map((i) => c.naming.full[i]).join(", ")}.`), w);
  // Only meaningful for the synthetic waves, whose analysis we can reorder here.
  if (w === W2 || w === W3) check("shuffled analysis input compiles to the same report (shuffle control)", () => {
    const opts = w === W2 ? {} : { runId: "wave-2028-11-30", clusters: [[["east", 50.0], ["north", 51.5], ["south", 49.2]], [["west", 20.1]]], dims: ["AAA", "BBB", "CCC", "DDD", "EEE", "FFF", "GGG", "HHH", "III"], itemsPerDim: 7, trials: 3, judgesPer: 3, seed: 11, excluded: "east", bankVersion: "v3.1" };
    const a = syntheticAnalysis(opts);
    const s = clone(a);
    s.subjects = Object.fromEntries(Object.entries(s.subjects).reverse());
    s.pairwise.reverse();
    s.dimension_pairwise.reverse();
    const ctx = syntheticCtx(a);
    const w1 = projectWave(clone(a), ctx);
    const w2 = projectWave(s, ctx);
    const r1 = compile(base, w1).report;
    const r2 = compile(base, w2).report;
    delete r1.wave_source_sha256; delete r2.wave_source_sha256;
    assert(JSON.stringify(r1) === JSON.stringify(r2), "rendered report depends on input order");
  });

  section("G5 status-banner (text level; HTML level below)");
  nc("status section whose first block does not say unofficial", replaceOnce(base, "This is an unofficial pilot", "This is a pilot"), w, "R-status-first");
  nc("status section that never says it is not a score", replaceOnce(base, "It is not a score.", "It is a result."), w, "R-must-say");

  section("G7 crisis-adjacency (text level)");
  nc("model name inside the duty-of-care section", afterHeading(base, 1, `${c.A} handled a crisis well.`), w, "R-crisis-adjacency");
  nc("a figure token inside the duty-of-care section", afterHeading(base, 1, "{{derived.subject_count|n0}} models."), w, "R-crisis-adjacency");
  nc("a link inside the duty-of-care section", afterHeading(base, 1, "See [more](/ai-models)."), w, "R-crisis-adjacency");
  nc("a call to action inside the duty-of-care section", afterHeading(base, 1, "Subscribe for the next wave."), w, "R-crisis-adjacency");
  nc("duty-of-care section far over its budget", afterHeading(base, 1, Array.from({ length: 140 }, () => "word").join(" ")), w, "R-crisis-length");
  nc("endorsement beside a model name", afterHeading(base, 6, `${c.A} is safe to use.`), w, "R-model-endorsement");
  nc("recommendation beside a model name", afterHeading(base, 6, `We recommend ${c.B}.`), w, "R-model-endorsement");

  section("G8 claims-vs-pairwise");
  nc("a not-separated pair said to be separated", afterHeading(base, 6, `${c.A} was separated from ${c.B}.`), w, "R-claims-vs-pairwise");
  nc("a separated pair said to be indistinguishable", afterHeading(base, 6, `The pilot cannot tell ${c.S} and ${c.A} apart.`), w, "R-claims-vs-pairwise");
  nc("all separation claims deleted (a missing separation)", removeLines(base, /separated from/), w, "R-claims-missing");
  nc("the group sentences replaced by a one-member group", base.split("{{derived.not_separated_groups.0|list}}").join(`{{subjects.${c.a}|name}}`), w, "R-group-sentence-missing");
  const otherWord = Object.entries({ one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9 }).find(([, n]) => n === w.derived.subject_count - 1)[0];
  nc("wrong count in 'the other N'", replaceOnce(base, `the other ${otherWord},`, `the other ${otherWord === "nine" ? "eight" : "nine"},`), w, "R-claims-count");
  nc("the group sentence placed after the first per-model figure", afterHeading(base, 2, `${c.A} had {{subjects.${c.a}.median_reply_words|n0}} words.`), w, "R-group-sentence-late");
  check("NC a wave whose flag contradicts its interval does not compile (flip one flag)", () => {
    const bad = clone(w);
    bad.pairwise.find((e) => !e.separated).separated = true;
    const r = compile(base, bad);
    assert(r.report === null && r.errors.some((e) => e.rule === "R-wave-invalid"), `expected R-wave-invalid, got ${rules(r)}`);
    console.log(`         ${r.errors[0].rule}: ${r.errors[0].message.slice(0, 140)}`);
  });
  nc("a false 'lowest' claim", afterHeading(base, 8, `The lowest mean for {{subjects.${c.a}|name}} is ${Object.entries(w.subjects[c.a].dimensions).sort((x, y) => y[1] - x[1])[0][0]}.`), w, "R-lowest-claim");
  nc("an unverifiable 'lowest' claim (no model named)", afterHeading(base, 8, `The lowest mean is ${Object.keys(w.subjects[c.a].dimensions)[0]}.`), w, "R-lowest-claim");
  pc("a true 'lowest' claim", base, w);

  section("G10 regeneration (determinism)");
  check("compiling twice gives identical bytes", () => {
    assert(JSON.stringify(compile(base, w).report) === JSON.stringify(compile(base, w).report), "two compiles differ");
  });
  check("no timestamp in the compiled output", () => assert(!/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(JSON.stringify(compile(base, w).report)), "timestamp found"));
  check("NC a compiler that injects the clock fails the determinism check", () => {
    let n = 0;
    const jittery = () => ({ ...compile(base, w).report, nonce: Math.random() + n++ });
    assert(JSON.stringify(jittery()) !== JSON.stringify(jittery()), "the nondeterministic probe was not nondeterministic");
    const stamped = { ...compile(base, w).report, built: "2026-10-01T12:00:00.000Z" };
    assert(verifyCompiled(stamped, w).some((p) => p.startsWith("V-timestamp")), "V-timestamp missed a stamped report");
  });

  section("G11 word-budget");
  const base0 = compile(base, w).report.word_count;
  const pad = (md, n) => afterHeading(md, 4, Array.from({ length: n }, () => "record").join(" "));
  const stripped = syntheticReportMd(w, { filler: 0 });
  const wordsOf = (md) => compile(md, w).report.word_count;
  const lo = wordsOf(stripped);
  const needLo = WORD_MIN - lo;
  const needHi = WORD_MAX - lo;
  assert(needLo > 0, "scaffold at zero filler already over the minimum; the boundary controls would be vacuous");
  nc(`${lo}-word report (below the band)`, stripped, w, "R-word-count");
  pc(`exactly ${WORD_MIN} words`, pad(stripped, needLo), w);
  nc(`${WORD_MIN - 1} words`, pad(stripped, needLo - 1), w, "R-word-count");
  pc(`exactly ${WORD_MAX} words`, pad(stripped, needHi), w);
  nc(`${WORD_MAX + 1} words`, pad(stripped, needHi + 1), w, "R-word-count");
  check("tables and the glossary are excluded from the count", () => {
    const withTable = afterHeading(base, 4, Array.from({ length: 200 }, (_, i) => `| cell | w${i}x |`).join("\n"));
    assert(wordsOf(withTable) === base0, "table rows were counted");
    assert(base0 === wordsOf(`${base}\n- extra glossary entry in the glossary region`), "glossary region counted");
  });
  void countWords;

  section("G18 build-model-reports checks (structure and per-section rules)");
  nc("a section missing", removeSection(base, 4), w, "R-sections-missing");
  nc("two sections out of order", swapSections(base, 4, 5), w, "R-sections-order");
  nc("an extra H2", `${base}\n## Extra thoughts\n\nNothing.\n`, w, "R-sections-extra");
  nc("a renamed H2", replaceOnce(base, "## 5. Design", "## 5. Design and method"), w, "R-sections-missing");
  nc("two H1 headings", `# One\n\n${base}\n\n# Two\n`, w, "R-sections-h1");
  nc("status section carries a per-model figure", afterHeading(base, 2, `${c.A} had {{subjects.${c.a}.median_reply_words|n0}} words.`), w, "R-section-figures");
  nc("may-say section carries a figure", afterHeading(base, 3, "{{design.items_served|n0}} items."), w, "R-section-figures");
  nc("design section omits the resampling-only statement", replaceOnce(base, "The interval covers item resampling only. ", ""), w, "R-must-say");
  nc("design section omits the item counts", replaceOnce(base, "{{bank.items_total|n0}}", "many"), w, "R-must-cite");
  nc("causal wording in the reply-length section", afterHeading(base, 7, "The gap exists because the replies were short."), w, "R-causal-language");
  nc("length bound without 'not an estimate'", replaceOnce(base, " That bound is an extreme case and not an estimate.", ""), w, "R-bound-caveat");
  nc("separated model's figure without the unresolved-length caveat", replaceOnce(base, " For the separated model the cause is unresolved: reply length is a confound.", ""), w, "R-separated-caveat");
  nc("confound order: the bound before the word counts", afterHeading(base, 7, `Removing the pooled slope would give {{length.composite_if_pooled_slope_removed.${c.sep}|n1}} for ${c.S}, and that is not an estimate.`), w, "R-confound-order");
  nc("a date in the next-wave section", afterHeading(base, 13, "Expected 2027-04-01."), w, "R-next-wave-date");
  nc("the no-developer sentence removed from the cite section", replaceOnce(base, NO_DEVELOPER_SENTENCE, "Nobody was involved."), w, "R-must-say");
  nc("the dimension note not cited verbatim", replaceOnce(base, "{{dimension_pairwise_note}}", "Many comparisons were made."), w, "R-must-cite");
  nc("deviation section with no post-hoc tag", replaceOnce(base, "was post-hoc: {{exclusion_record.disclosure}}", "was late: a change"), w, "R-must-say");
  nc("instrument health says 'cleared'", afterHeading(base, 9, "The probes cleared the models."), w, "R-banned-lexicon");
  void sepGroup;

  section("Amendments 2026-10-01: care section first, no group points, sensitivity statement, serving facts");
  check("the care section is the first H2 and the status section follows it (status-first reads the status SECTION)", () => {
    const r = compile(base, w);
    assert(r.errors.length === 0, r.errors.map((e) => e.rule).join(","));
    assert(r.report.sections[0].id === "duty-of-care" && r.report.sections[1].id === "status", `order: ${r.report.sections.slice(0, 3).map((s) => s.id)}`);
    assert(SECTIONS[0].id === "duty-of-care" && SECTIONS[1].id === "status", "template SECTIONS order");
  });
  nc("care section placed after the status section", swapSections(base, 1, 2), w, "R-sections-order");
  nc("care section missing", removeSection(base, 1), w, "R-sections-missing");
  nc("care section without the 'crisis items not served' statement", replaceOnce(base, "were not served in this pilot, so this report", "were left aside in this pilot, so this report"), w, "R-must-say");
  nc("care section without the 'says nothing about crisis responses' statement", replaceOnce(base, "says nothing about how any model responds to a person in crisis", "is a description of the instrument"), w, "R-must-say");
  nc("status section whose first block does not say unofficial still fails with the care section first", replaceOnce(base, "This is an unofficial pilot", "This is a pilot"), w, "R-status-first");

  // R-group-point: planted probes for EVERY member of every not-separated group, in prose, in a table and in a heading.
  check("the scaffold shows a point for the separated subject and none for a group member (the control is not vacuous)", () => {
    assert(base.includes(`{{subjects.${c.sep}.pilot_composite|n1}}`), "no separated point in the scaffold");
    for (const id of w.derived.not_separated_groups.flat()) assert(!base.includes(`subjects.${id}.pilot_composite|`), `scaffold shows a point for group member ${id}`);
  });
  for (const id of w.derived.not_separated_groups.flat()) {
    const nm = c.naming.full[id];
    nc(`group point in prose: ${id}`, afterHeading(base, 6, `The point for ${nm} was {{subjects.${id}.pilot_composite|n1}}.`), w, "R-group-point");
    nc(`group point in a table labelled point estimate: ${id}`, replaceOnce(base, `| {{subjects.${id}.pilot_composite_interval95|range}} | not shown |`, `| {{subjects.${id}.pilot_composite_interval95|range}} | {{subjects.${id}.pilot_composite|n1}} |`), w, "R-group-point");
  }
  nc("group point in a heading", afterHeading(base, 6, `### Point {{subjects.${c.a}.pilot_composite|n1}}`), w, "R-group-point");
  nc("group point read through the sensitivity block", afterHeading(base, 9, `${c.A} moved to {{sensitivity.subjects.${c.a}.pilot_composite|n1}}.`), w, "R-group-point");
  nc("a separated subject's sensitivity point without its confound", afterHeading(base, 9, `${c.S} moved to {{sensitivity.subjects.${c.sep}.pilot_composite|n1}}.`), w, "R-separated-caveat");
  nc("group point in the front matter", `---\ntitle: Pilot {{subjects.${c.a}.pilot_composite|n1}}\n---\n${base}`, w, "R-group-point");
  pc("a separated subject's point in its table row (with the caveat in the section) is still allowed", base, w);
  pc("a group member's range in prose is still allowed", afterHeading(base, 6, `${c.A} has a range of {{subjects.${c.a}.pilot_composite_interval95|range}}.`), w);
  const nsSens = w.sensitivity.pairwise.findIndex((e) => !e.separated);
  nc("sensitivity point difference for a not-separated pair", afterHeading(base, 9, `The gap was {{sensitivity.pairwise.${nsSens}.difference|n1}}.`), w, "R-difference-unseparated");

  // Sensitivity statement (must-cite in Instrument health OR Why these are not scores).
  const sensLine = base.split("\n").find((l) => l.startsWith("The separation pattern was unchanged"));
  check("scaffold has the sensitivity paragraph", () => assert(sensLine, "no sensitivity paragraph in the scaffold"));
  nc("sensitivity pattern flag not cited", replaceOnce(base, "{{sensitivity.separation_pattern_unchanged|yesno}}", "yes"), w, "R-must-cite");
  nc("level-shift range not cited", replaceOnce(base, "{{derived.sensitivity_level_shift_group_range|range}}", "a little"), w, "R-must-cite");
  nc("sensitivity paragraph removed altogether", removeLines(base, /^The separation pattern was unchanged/), w, "R-must-cite");
  nc("'absolute figures depend on the judges' dropped", replaceOnce(base, "Absolute figures depend on which judges are used, so the levels", "The levels"), w, "R-must-say");
  nc("'only the separation pattern is robust' dropped", replaceOnce(base, "; only the separation pattern is robust", ""), w, "R-must-say");
  if (sensLine) pc("the sensitivity paragraph in 'Why these are not scores' instead of 'Instrument health'", afterHeading(removeLines(base, /^The separation pattern was unchanged/), 11, sensLine), w);
  nc("yesno on a number", afterHeading(base, 9, "{{design.items_served|yesno}}"), w, "R-token-format");

  // Serving facts (amendment 4).
  nc("design omits the not-served count", replaceOnce(base, "{{bank.items_not_served|n0}}", "many"), w, "R-must-cite");
  nc("design omits the items-per-conversation figure", replaceOnce(base, "{{design.items_per_conversation_max|n0}}", "several"), w, "R-must-cite");

  // R-lowest-claim with a dimension named as a markdown link: both name-map paths.
  check("a 'lowest' claim naming its dimension as a markdown link: passes with names loaded, and an empty map is named as the cause", () => {
    const dim = Object.entries(w.subjects[c.a].dimensions).sort((x, y) => x[1] - y[1])[0][0];
    const label = `Facet ${dim.toLowerCase()}`;
    const md = afterHeading(base, 8, `The lowest mean for ${c.A} is [${label}](/dimensions/x).`);
    const ok = compile(md, w, { dimensionNames: { [dim]: label } });
    assert(!ok.errors.some((e) => e.rule === "R-lowest-claim"), `false rejection: ${ok.errors.map((e) => e.message.slice(0, 120))}`);
    const bad = compile(md, w, { dimensionNames: {} });
    const hit = bad.errors.find((e) => e.rule === "R-lowest-claim");
    assert(hit && /no dimension display names were loaded/.test(hit.message), "an empty name map must be named as the cause");
    assert(Object.keys(dimensionNames).length >= 8, "the default test path did not load the real names");
  });
}

// ===========================================================================
section("G5 status-banner and G6 no-rating-schema (HTML functions, proved on probes)");
const ld = (obj) => `<script type="application/ld+json">${JSON.stringify(obj)}</script>`;
const goodPage = `<html><head>${ld({ "@context": "https://schema.org", "@graph": [{ "@type": "Report", name: "x" }, { "@type": "BreadcrumbList" }, { "@type": "FAQPage" }] })}</head><body><main><div role="region" aria-label="status">Unofficial pilot. Not a score. Not a ranking. No cross-model comparison.</div><h1>Title</h1></main></body></html>`;
check("PC a compliant page passes G5 and G6", () => {
  assert(bannerProblems(goodPage).length === 0, bannerProblems(goodPage).join("; "));
  assert(ratingSchemaProblems(goodPage, { requireReport: true }).length === 0, ratingSchemaProblems(goodPage, { requireReport: true }).join("; "));
});
for (const type of FORBIDDEN_LD_TYPES) {
  check(`NC JSON-LD type ${type} -> G6-type`, () => {
    const p = ratingSchemaProblems(`<script type="application/ld+json">${JSON.stringify({ "@type": ["Report", type] })}</script>`);
    assert(p.some((x) => x.startsWith("G6-type")), `missed ${type}`);
    console.log(`         ${p[0]}`);
  });
}
check("NC a type buried in @graph -> G6-type", () => assert(ratingSchemaProblems(ld({ "@graph": [{ "@type": "Report" }, { "@type": "Dataset" }] })).some((x) => x.startsWith("G6-type")), "missed"));
check("NC aggregateRating key -> G6-key", () => assert(ratingSchemaProblems(ld({ "@type": "Report", aggregateRating: { ratingValue: 4 } })).some((x) => x.startsWith("G6-key")), "missed"));
check("NC additionalProperty carrying a composite -> G6-key", () => assert(ratingSchemaProblems(ld({ "@type": "Report", additionalProperty: [{ value: 1 }] })).some((x) => x.startsWith("G6-key")), "missed"));
check("NC no Report node on a report route -> G6-missing", () => assert(ratingSchemaProblems(ld({ "@type": "BreadcrumbList" }), { requireReport: true }).some((x) => x.startsWith("G6-missing")), "missed"));
check("NC unparseable JSON-LD -> G6-parse", () => assert(ratingSchemaProblems("<script type=\"application/ld+json\">{oops</script>").some((x) => x.startsWith("G6-parse")), "missed"));
check("NC page with no banner -> G5-banner", () => assert(bannerProblems("<main><h1>x</h1></main>").some((x) => x.startsWith("G5-banner")), "missed"));
check("NC banner after the H1 -> G5-order", () => assert(bannerProblems("<main><h1>x</h1><div role=\"region\">Unofficial</div></main>").some((x) => x.startsWith("G5-order")), "missed"));
check("NC banner that does not say unofficial -> G5-text", () => assert(bannerProblems("<main><div role=\"region\">Notice</div><h1>x</h1></main>").some((x) => x.startsWith("G5-text")), "missed"));
check("NC sticky banner -> G5-sticky", () => assert(bannerProblems("<main><div role=\"region\" style=\"position: sticky\">Unofficial</div><h1>x</h1></main>").some((x) => x.startsWith("G5-sticky")), "missed"));

const outDir = join(SITE, "out", "ai-models", "reports");
if (existsSync(outDir)) {
  const pages = readdirSync(outDir, { recursive: true }).filter((f) => String(f).endsWith(".html"));
  check(`built report pages (${pages.length}) pass G5 and G6`, () => {
    assert(pages.length > 0, "out/ai-models/reports exists but holds no HTML (a gate over zero pages proves nothing)");
    for (const p of pages) {
      const html = readFileSync(join(outDir, String(p)), "utf8");
      const prob = [...bannerProblems(html), ...ratingSchemaProblems(html, { requireReport: true })];
      assert(prob.length === 0, `${p}: ${prob.join("; ")}`);
    }
  });
} else {
  console.log("  STUB G5/G6 over out/ai-models/reports: no built output (frontend's route must exist; run next build)");
}

// ===========================================================================
section("G13 wave2-dryrun and the no-pilot-values rule");
const real = committed[0];
check("a wave-2 scaffold passes every rule with no change to the compiler", () => {
  for (const w of [W2, W3]) assert(compile(BASE.get(w), w).errors.length === 0, `${w.run_id} did not compile`);
});
check("NC wave-2 report compiled against the pilot wave fails (the pilot's figures are unreachable from it)", () => {
  const r = compile(BASE.get(W2), real);
  assert(r.errors.length > 0 && r.errors.some((e) => e.rule === "R-token-unresolved"), `compiled against the wrong wave: ${rules(r)}`);
});
check("NC pilot scaffold compiled against wave-2 fails", () => {
  const r = compile(BASE.get(real), W2);
  assert(r.errors.some((e) => e.rule === "R-token-unresolved"), `${rules(r)}`);
});
check("the pilot's figures appear in no gate, library or fixture source", () => {
  const nums = new Set();
  const walk = (x) => { if (typeof x === "number") { const s = String(x); if (s.length >= 4 || /^\d{3,}$/.test(s)) nums.add(s); } else if (x && typeof x === "object") Object.values(x).forEach(walk); };
  walk({ ...real, source_sha256: undefined });
  const files = [
    "scripts/test-model-reports.mjs", "scripts/test-model-waves.mjs", "scripts/test-model-wave-isolation.mjs", "scripts/test-model-wave-export.mjs",
    "scripts/build-model-reports.mjs", "scripts/lib/model-wave.mjs", "scripts/lib/model-report.mjs", "scripts/lib/model-report-template.mjs",
    "scripts/lib/model-report-fixtures.mjs", "scripts/lib/model-report-html-gates.mjs", "scripts/lib/ts-alias-loader.mjs", "src/lib/model-wave-facts.ts",
  ];
  const hits = [];
  for (const f of files) {
    const text = readFileSync(join(SITE, f), "utf8");
    for (const n of nums) if (new RegExp(`(?<![\\d.])${n.replace(".", "\\.")}(?![\\d])`).test(text)) hits.push(`${f}: ${n}`);
  }
  assert(nums.size > 50, `only ${nums.size} pilot numbers collected`);
  assert(hits.length === 0, `pilot values found in gate code: ${hits.join(", ")}`);
  console.log(`         ${nums.size} distinct pilot numbers, ${files.length} source files, 0 hits`);
});
check("NC the scanner finds a planted pilot value", () => {
  const n = String(real.subjects[Object.keys(real.subjects)[0]].pilot_composite);
  assert(new RegExp(`(?<![\\d.])${n.replace(".", "\\.")}(?![\\d])`).test(`const x = ${n};`), "scanner missed a planted value");
});

// ===========================================================================
section("G18 build-model-reports CLI (real script, scratch directories)");
const script = join(HERE, "build-model-reports.mjs");
const scratch = mkdtempSync(join(tmpdir(), "cb-reports-"));
try {
  const mk = (name) => {
    const d = join(scratch, name);
    mkdirSync(join(d, "reports"), { recursive: true });
    mkdirSync(join(d, "waves"), { recursive: true });
    return d;
  };
  const cli = (d) => spawnSync(process.execPath, ["--no-warnings", script, "--reports-dir", join(d, "reports"), "--waves-dir", join(d, "waves"), "--out-dir", join(d, "out")], { encoding: "utf8" });
  const good = mk("good");
  writeFileSync(join(good, "waves", `${W2.run_id}.json`), serialiseWave(W2));
  writeFileSync(join(good, "reports", `${W2.run_id}.md`), BASE.get(W2));
  const g = cli(good);
  check("a compliant report builds, exit 0, and writes the compiled JSON with its ledger", () => {
    assert(g.status === 0, `exit ${g.status}: ${g.stderr}`);
    const out = JSON.parse(readFileSync(join(good, "out", `${W2.run_id}.json`), "utf8"));
    assert(out.figure_ledger.length > 20 && out.status === "pilot" && out.official === false, "compiled JSON malformed");
    assert(verifyCompiled(out, W2).length === 0, "compiled file does not verify against its wave");
    console.log(`         ${g.stdout.trim()}`);
  });
  const bad = mk("bad");
  writeFileSync(join(bad, "waves", `${W2.run_id}.json`), serialiseWave(W2));
  writeFileSync(join(bad, "reports", `${W2.run_id}.md`), afterHeading(BASE.get(W2), 6, "The mean was 71.3."));
  const b = cli(bad);
  check("NC a report with a bare figure fails the build (exit 1, rule and line printed, no JSON written)", () => {
    assert(b.status === 1, `exit ${b.status}`);
    assert(/R-bare-digit \(line \d+\)/.test(b.stderr), `stderr: ${b.stderr}`);
    assert(!existsSync(join(bad, "out", `${W2.run_id}.json`)), "compiled JSON written for a failing report");
    console.log(`         ${b.stderr.trim().split("\n").slice(0, 2).join(" | ").slice(0, 200)}`);
  });
  const orphan = mk("orphan");
  writeFileSync(join(orphan, "reports", "wave-2030-01-01.md"), "# x\n");
  const o = cli(orphan);
  check("NC a report with no wave file fails the build", () => {
    assert(o.status === 1 && /no wave file/.test(o.stderr), `exit ${o.status}: ${o.stderr}`);
    console.log(`         ${o.stderr.trim().slice(0, 160)}`);
  });
  const mismatch = mk("mismatch");
  writeFileSync(join(mismatch, "waves", "wave-2030-01-01.json"), serialiseWave(W2));
  writeFileSync(join(mismatch, "reports", "wave-2030-01-01.md"), BASE.get(W2));
  const m = cli(mismatch);
  check("NC a wave whose run_id differs from the report file name fails the build", () => {
    assert(m.status === 1 && /differs from the file name/.test(m.stderr), `exit ${m.status}: ${m.stderr}`);
  });
  const invalid = mk("invalid");
  const badWave = clone(W2);
  badWave.pairwise.find((e) => !e.separated).separated = true;
  writeFileSync(join(invalid, "waves", `${W2.run_id}.json`), JSON.stringify(badWave, null, 2) + "\n");
  writeFileSync(join(invalid, "reports", `${W2.run_id}.md`), BASE.get(W2));
  const iv = cli(invalid);
  check("NC an invalid wave fails the build before any prose is read", () => {
    assert(iv.status === 1 && /R-wave-invalid/.test(iv.stderr), `exit ${iv.status}: ${iv.stderr}`);
  });
  const empty = mk("empty");
  const e = cli(empty);
  check("no report source: exit 0 with a message (a wave may exist before its narrative)", () => assert(e.status === 0 && /nothing to compile/.test(e.stdout), `exit ${e.status}: ${e.stdout}`));
} finally {
  rmSync(scratch, { recursive: true, force: true });
}

// ===========================================================================
section("G18 the real narratives (reports/<run_id>.md compiled with the same rules)");
const realReports = existsSync(join(DATA, "reports")) ? readdirSync(join(DATA, "reports")).filter((f) => f.endsWith(".md") && !f.startsWith("_")) : [];
if (realReports.length === 0) console.log("  note: no narrative yet; the gates above ran on synthetic scaffolds only");
check("dimension display names were read from dimensions.ts (EMP is among them)", () => assert(Object.keys(dimensionNames).length >= 8 && dimensionNames.EMP, JSON.stringify(dimensionNames)));
for (const f of realReports) {
  const runId = f.replace(/\.md$/, "");
  const wave = committed.find((w) => w.run_id === runId);
  check(`${f}: has a committed wave`, () => assert(wave, "no wave file for this report"));
  if (!wave) continue;
  check(`${f}: compiles clean under every rule`, () => {
    const r = compile(readFileSync(join(DATA, "reports", f), "utf8"), wave, { dimensionNames });
    assert(r.errors.length === 0, `${r.errors.length} problem(s): ` + r.errors.map((e) => `${e.rule}${e.line ? `@${e.line}` : ""}: ${e.message.slice(0, 160)}`).join(" | "));
    const v = verifyCompiled(r.report, wave);
    assert(v.length === 0, v.join("; "));
    console.log(`         ${r.report.word_count} words, ${r.report.figure_ledger.filter((x) => x.kind === "fig").length} figures, ${r.report.lit_count} literal(s)`);
  });
}

// The same planted defects, injected into the REAL narrative (not a scaffold). Unresolved
// "MISSING:" placeholders the writer left are neutralised first so they do not mask the probe.
for (const f of realReports) {
  const runId = f.replace(/\.md$/, "");
  const wave = committed.find((w) => w.run_id === runId);
  if (!wave) continue;
  const c = ctxOf(wave);
  const md0 = readFileSync(join(DATA, "reports", f), "utf8").replace(/\{\{MISSING:[^}]*\}\}/g, "none");
  const probeable = compile(md0, wave, { dimensionNames }).errors.length === 0;
  check(`${f}: with placeholders neutralised the narrative is clean (so its probes are attributable)`, () => assert(probeable, compile(md0, wave, { dimensionNames }).errors.map((e) => `${e.rule}: ${e.message.slice(0, 100)}`).join(" | ")));
  if (!probeable) continue;
  const insert = (text) => { const L = md0.split("\n"); const i = L.findIndex((l) => /^## Separation\s*$/.test(l)); assert(i >= 0, "no ## Separation heading"); L.splice(i + 1, 0, "", text); return L.join("\n"); };
  const real = (label, md, rule) => nc(`real narrative: ${label}`, md, wave, rule, { dimensionNames });
  real(`"${c.A} leads the field."`, insert(`${c.A} leads the field.`), "R-banned-lexicon");
  real("a bare figure", insert("The mean was 71.3."), "R-bare-digit");
  real("a figure beside the wrong model", insert(`${c.A} has a range of {{subjects.${c.b}.pilot_composite_interval95|range}}.`), "R-binding");
  real("a not-separated pair said to be separated", insert(`${c.A} was separated from ${c.B}.`), "R-claims-vs-pairwise");
  real("an endorsement beside a model", insert(`${c.S} is safe to use.`), "R-model-endorsement");
  const nd = md0.lastIndexOf(NO_DEVELOPER_SENTENCE);
  assert(nd >= 0, "the narrative lacks the verbatim no-developer sentence");
  real("the no-developer sentence removed from the cite section (last occurrence)", md0.slice(0, nd) + "Nobody was involved." + md0.slice(nd + NO_DEVELOPER_SENTENCE.length), "R-must-say");
  real("a point estimate in prose", insert(`The point was {{subjects.${c.a}.pilot_composite|n1}}.`), "R-point-in-prose");
  real("a point difference for a not-separated pair", insert(`The gap was {{pairwise.${c.nsPair}.difference|n1}}.`), "R-difference-unseparated");
  real("a bare digit planted in the front-matter abstract", md0.replace(/^abstract: "/m, 'abstract: "4 '), "R-bare-digit");
  real("a figure token in the title", md0.replace(/^title: .*$/m, 'title: "Pilot {{derived.subject_count|n0}}"'), "R-title-token");
  real("a figure token in the seo_title", md0.replace(/^seo_title: .*$/m, 'seo_title: "Pilot {{derived.subject_count|n0}}"'), "R-title-token");
  real("a digit in the seo_title", md0.replace(/^seo_title: "/m, 'seo_title: "4 '), "R-title-digit");
  {
    const gmr = new Set(wave.derived.not_separated_groups.flat());
    const k = wave.pairwise.findIndex((e) => e.separated && (gmr.has(e.a) || gmr.has(e.b)));
    const sepPoint = md0.includes(`{{subjects.${c.sep}.pilot_composite|n1}}`) || /\{\{(?:sensitivity\.)?subjects\.[^.}]+\.pilot_composite\|/.test(md0);
    if (k >= 0 && sepPoint) real("a point difference between the separated subject and a group member while a separated point is shown", insert(`The gap was {{pairwise.${k}.difference|n1}}.`), "R-reconstruct");
    else console.log("  note: the narrative shows no separated point (or no such pair); the R-reconstruct probe on the real narrative is skipped");
  }
  const L = md0.split("\n");
  const rowIdx = L.map((l, i) => [l, i]).filter(([l]) => /^\| (?:Not separated|Separated) \| claude-\w+ \| \{\{subjects\./.test(l)).map(([, i]) => i);
  if (rowIdx.length >= 3) {
    const rows = rowIdx.map((i) => L[i]);
    const sorted = [...L];
    rowIdx.forEach((i, k) => { sorted[i] = rows[rows.length - 1 - k]; });
    real("the model table reversed (an order not alphabetical or by group)", sorted.join("\n"), "R-implied-order");
  }
}

check("the page gate (src/lib/model-report-gate.ts) throws on every verifyCompiled problem, V-unexplained-digit included", () => {
  const src = readFileSync(join(SITE, "src", "lib", "model-report-gate.ts"), "utf8");
  assert(!/V-unexplained-digit/.test(src.replace(/\/\/.*$/gm, "")), "the page gate special-cases V-unexplained-digit again");
  assert(/const problems = verifyCompiled\(report, wave\)/.test(src) && /if \(problems\.length\) throw/.test(src), "the page gate no longer throws on the full verifyCompiled result");
});

section("gates completed by the frontend (own scripts; planted probes and real-tree scans there)");
for (const g of [
  "G5 status-banner over the built tree, G6 no-rating-schema, the render gate and the H CTA rules: npm run test:model-report-html",
  "G19 withheld values absent from out/ai-models/**: npm run test:model-html-leak",
  "G20 canonical, sitemap from manifest, meta, OG and JSON-LD rules: npm run test:model-report-seo",
]) console.log(`  DONE ${g}`);
section("still open");
for (const s of [
  "G7 DOM proximity: crisis text vs model names and figures in the built page (text-level G7 is proved above)",
  "G21 Docker smoke: npm run build with research/ absent",
]) console.log(`  STUB ${s}`);
void SECTIONS;

console.log(`\n${passed} passed, ${failures.length} failed`);
if (failures.length) {
  console.log("\n" + failures.join("\n"));
  process.exit(1);
}
