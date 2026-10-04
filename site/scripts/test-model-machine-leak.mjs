#!/usr/bin/env node
/**
 * test-model-machine-leak.mjs -- G24 (test:model-machine-leak): defect class DC-24.
 *
 * A publication rule enforced on the rendered page must also be enforced on its machine-readable twin. The report
 * withholds the point estimates of models the pilot could not separate (template amendment 2), their dimension means
 * (amendment 9) and the point differences that would rebuild them (amendment 8). This test holds every machine-readable
 * output to the same rule, with values derived from the wave file (never typed here):
 *
 *   public/data/model-waves/<run_id>.json     must equal the PROJECTION of the internal wave
 *   data/model-benchmark/index.json, llms.txt, llms-full.txt, ai-models/reports/*.md, .well-known/*.json, JSON-LD
 *
 * Planted probes first (a withheld point re-inserted anywhere must fail; the original defect, a verbatim copy of the
 * internal wave file, must fail; a separated subject's point must be PRESENT as a positive control), then the real tree
 * in site/out. Fail on zero. `--tree-only` (the build chain) skips the probes and scans the tree.
 */
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { harness, haveOut, OUT_DIR, SITE, WAVES_DIR, TREE_ONLY } from "./lib/html-gate-harness.mjs";
import { loadWaves, withheldValues } from "./lib/model-report-html-gates.mjs";
import { renderableEntries } from "./lib/pilot-render-gate.mjs";
import {
  buildLlmsFull, buildModelBenchmarkIndex, loadFacts, patchWellKnown, projectWavePublic, reportMarkdown, notSeparatedMembers,
} from "./lib/model-benchmark-public.mjs";
import {
  publicWaveProblems, separatedPointsPresentProblems, machineTextProblems, jsonLdText, scanMachineTree, machineTreeProblems, withheldNumbers,
} from "./lib/model-machine-leak.mjs";
import { syntheticWave, syntheticArmsWave } from "./lib/model-report-fixtures.mjs";
import { readFileSync } from "node:fs";

const h = harness("test-model-machine-leak");
const NL = String.fromCharCode(10);
const { manifest, waves } = loadWaves(WAVES_DIR);
await h.check("committed waves exist to test against", () => h.assert(waves.length > 0, "no committed wave"));

if (!TREE_ONLY) {
  const facts = loadFacts(SITE);
  const wellKnown = JSON.parse(readFileSync(join(SITE, "public", ".well-known", "compassion-benchmark.json"), "utf8"));
  const synthetic = syntheticWave({ runId: "wave-2029-05-05", clusters: [[["orion1.5-9b", 40.1], ["vega2.0-3b", 42.0]], [["pavo-9b", 71.3]]], dims: ["AWR", "EMP", "ACT", "EQU", "BND", "ACC", "SYS", "INT"], excluded: null, local: true, reversePairs: true, seed: 5 });
  const targets = [...waves.map((w) => [`committed ${w.run_id}`, w]), ["synthetic (a group and a separated model, dotted ids)", synthetic], ["synthetic arms wave", syntheticArmsWave()]];

  await h.check("at least one committed wave has a not-separated member and one has a separated subject (otherwise the positive control proves nothing)", () => {
    h.assert(waves.some((w) => notSeparatedMembers(w).length > 0), "no wave with a not-separated member");
    h.assert(waves.some((w) => w.derived.separated_subjects.length > 0), "no wave with a separated subject");
  });

  for (const [label, wave] of targets) {
    const members = notSeparatedMembers(wave);
    h.section(`G24 public wave file: ${label}`);
    await h.check("the wave has not-separated members (otherwise the probes prove nothing)", () => h.assert(members.length > 0, "no members"));
    const m = members[0];
    const w = withheldValues(wave);
    const memberTok = w.memberComposites[0];
    const memberNum = wave.subjects[m].pilot_composite;
    const pubObj = () => JSON.parse(JSON.stringify(projectWavePublic(wave)));
    const asText = (o) => JSON.stringify(o, null, 2);
    const pubText = asText(projectWavePublic(wave));
    const file = (text) => publicWaveProblems({ text, wave, label: "public wave file" });

    h.clean("the projection of the wave passes", file(pubText));
    await h.check("the projection carries a point_withheld note for every member and names them in public_projection.withheld_for", () => {
      const o = pubObj();
      for (const id of members) h.assert(o.subjects[id].point_withheld && !("pilot_composite" in o.subjects[id]) && !("dimensions" in o.subjects[id]), `${id} not withheld`);
      h.assert(JSON.stringify(o.public_projection.withheld_for) === JSON.stringify(members), "withheld_for differs from the wave's own derived members");
      h.assert(/D-29a/.test(o.public_projection.rule) && /amendments 2, 8 and 9/.test(o.public_projection.rule), "the note does not cite D-29a and the amendments");
    });
    await h.check("intervals, separation flags and counts survive the projection", () => {
      const o = pubObj();
      for (const id of members) h.assert(JSON.stringify(o.subjects[id].pilot_composite_interval95) === JSON.stringify(wave.subjects[id].pilot_composite_interval95) && JSON.stringify(o.subjects[id].dimension_intervals95) === JSON.stringify(wave.subjects[id].dimension_intervals95) && JSON.stringify(o.subjects[id].dimension_item_counts) === JSON.stringify(wave.subjects[id].dimension_item_counts), `${id}: an interval or count was dropped`);
      h.assert(o.pairwise.every((q, i) => q.separated === wave.pairwise[i].separated && JSON.stringify(q.interval95) === JSON.stringify(wave.pairwise[i].interval95)), "a pair lost its range or flag");
    });
    await h.check("the rule is derived from derived.not_separated_groups: a wave with no group withholds nothing", () => {
      const noGroup = structuredClone(wave);
      noGroup.derived.not_separated_groups = [];
      noGroup.derived.separated_subjects = [...noGroup.design.subjects];
      h.assert(notSeparatedMembers(noGroup).length === 0, "members found without a group");
    });

    h.trips("THE ORIGINAL DEFECT: the internal wave file copied verbatim", file(asText(wave)), "G24-");
    h.trips("a member's composite re-inserted in its subject", (() => { const o = pubObj(); o.subjects[m].pilot_composite = memberNum; return file(asText(o)); })(), "G24-member-point");
    h.trips("a member's composite re-inserted in its subject (value count rule)", (() => { const o = pubObj(); o.subjects[m].pilot_composite = memberNum; return file(asText(o)); })(), "G24-member-value");
    h.trips("a member's composite inside a note string", (() => { const o = pubObj(); o.public_projection.note += ` It was ${memberTok}.`; return file(asText(o)); })(), "G24-member-value");
    h.trips("a member's composite in an extra top-level field", (() => { const o = pubObj(); o.summary = { top: memberNum }; return file(asText(o)); })(), "G24-member-value");
    h.trips("a member's dimension means re-inserted", (() => { const o = pubObj(); o.subjects[m].dimensions = wave.subjects[m].dimensions; return file(asText(o)); })(), "G24-member-point");
    h.trips("a member's judge-sensitivity point re-inserted", (() => { const o = pubObj(); if (!o.sensitivity?.subjects?.[m]) throw new Error("wave has no sensitivity block"); o.sensitivity.subjects[m].pilot_composite = wave.sensitivity.subjects[m].pilot_composite; return file(asText(o)); })(), "G24-member-point");
    h.trips("a member's length-adjusted point re-inserted", (() => { const o = pubObj(); o.length.composite_if_pooled_slope_removed[m] = memberNum + 0.3; return file(asText(o)); })(), "G24-member-point");
    h.trips("a point difference for a pair that involves a member re-inserted", (() => {
      const o = pubObj();
      const i = wave.pairwise.findIndex((q) => members.includes(q.a) || members.includes(q.b));
      o.pairwise[i].difference = wave.pairwise[i].difference;
      return file(asText(o));
    })(), "G24-member-difference");
    h.trips("a dimension-level point difference for a member re-inserted", (() => {
      const o = pubObj();
      const i = wave.dimension_pairwise.findIndex((q) => members.includes(q.a) || members.includes(q.b));
      o.dimension_pairwise[i].difference = wave.dimension_pairwise[i].difference;
      return file(asText(o));
    })(), "G24-member-difference");
    h.trips("the group's range (its extremes are the members' own points) re-inserted", (() => { const o = pubObj(); o.derived.not_separated_group_range = wave.derived.not_separated_group_range; return file(asText(o)); })(), "G24-group-range");
    h.trips("the withholding note removed from a member", (() => { const o = pubObj(); delete o.subjects[m].point_withheld; return file(asText(o)); })(), "G24-withheld-note");
    h.trips("a member's interval dropped (ranges are published)", (() => { const o = pubObj(); delete o.subjects[m].pilot_composite_interval95; return file(asText(o)); })(), "G24-interval-missing");
    h.trips("a file that is not JSON", file("{ not json"), "G24-parse");

    if (wave.derived.separated_subjects.length > 0) {
      const sep = wave.derived.separated_subjects[0];
      await h.check("POSITIVE CONTROL: a separated subject's point IS in the public file", () => h.assert(separatedPointsPresentProblems({ text: pubText, wave }).length === 0 && pubObj().subjects[sep].pilot_composite === wave.subjects[sep].pilot_composite, "separated point absent"));
      h.trips("a projection that over-withholds (drops a separated subject's point) is caught", (() => { const o = pubObj(); delete o.subjects[sep].pilot_composite; return [...file(asText(o)), ...separatedPointsPresentProblems({ text: asText(o), wave })]; })(), "G24-separated-point-missing");
      await h.check("a point difference between two separated subjects (none in this wave) is not withheld; pairs with a member are", () => {
        const o = pubObj();
        for (let i = 0; i < wave.pairwise.length; i++) {
          const q = wave.pairwise[i];
          const involves = members.includes(q.a) || members.includes(q.b);
          h.assert(involves === !("difference" in o.pairwise[i]), `pair ${q.a}/${q.b}`);
        }
      });
    } else {
      await h.check("no separated subject in this wave: nothing to keep, and no point appears for anyone", () => h.assert(wave.design.subjects.every((id) => !("pilot_composite" in pubObj().subjects[id])), "a point survived"));
    }

    h.section(`G24 other machine-readable outputs: ${label}`);
    const reportsFor = [{ wave, title: wave.run_id }];
    const indexText = asText(buildModelBenchmarkIndex({ reports: reportsFor, facts, reportsIndexRenders: false }));
    const fullText = buildLlmsFull({ reports: reportsFor, facts, reportsIndexRenders: false });
    const wk = asText(patchWellKnown(wellKnown, { facts, reports: reportsFor, reportsIndexRenders: false }));
    const md = ["---", "title: x", "---", "", "## Separation", "", `The test could not tell ${members.join(" and ")} apart.`, ""].join(NL);
    const html = `<html><head><script type="application/ld+json">${JSON.stringify({ "@type": "Report", abstract: "No point here." })}</script></head><body></body></html>`;
    const text = (t, name) => machineTextProblems({ text: t, wave, label: name });
    h.clean("index.json passes", text(indexText, "index.json"));
    h.clean("llms-full.txt passes", text(fullText, "llms-full.txt"));
    h.clean("the .well-known descriptor passes", text(wk, ".well-known"));
    h.clean("a markdown alternate with no point passes", text(md, "markdown"));
    h.clean("JSON-LD with no point passes", text(jsonLdText(html), "JSON-LD"));
    const planted = `${m} reached ${memberTok} in the pilot.`;
    h.trips("a member's composite in index.json (summary string)", (() => { const o = JSON.parse(indexText); o.pilot_reports[0].separation.summary += ` ${planted}`; return text(asText(o), "index.json"); })(), "G24-member-point-token");
    h.trips("a member's composite as an index.json number (a JSON number prints without a trailing zero)", (() => { const o = JSON.parse(indexText); o.pilot_reports[0].composite = memberNum; return text(asText(o), "index.json"); })(), "G24-member-point-leaf");
    h.trips("a member's composite in llms-full.txt", text(`${fullText}${NL}- ${planted}`, "llms-full.txt"), "G24-member-point-token");
    h.trips("a member's composite in the .well-known descriptor", (() => { const o = JSON.parse(wk); o.modelBenchmark.note = planted; return text(asText(o), ".well-known"); })(), "G24-member-point-token");
    h.trips("a member's composite in a markdown alternate", text(`${md}${NL}${planted}${NL}`, "markdown"), "G24-member-point-token");
    h.trips("a member's composite in JSON-LD", text(jsonLdText(html.replace("No point here.", `It was ${memberTok}.`)), "JSON-LD"), "G24-member-point-token");
    h.trips("a member's composite as a JSON-LD number", text(jsonLdText(html.replace("</head>", `<script type="application/ld+json">${JSON.stringify({ "@type": "Report", ratingLike: memberNum, point: memberNum })}</script></head>`)), "JSON-LD"), "G24-member-point-leaf");
    h.trips("the group's range (the members' own points) in a text file", text(`${fullText}${NL}The group ran from ${wave.derived.not_separated_group_range[0].toFixed(1)} to ${wave.derived.not_separated_group_range[1].toFixed(1)}.`, "llms-full.txt"), "G24-member-point-token");
    await h.check("the scan is not vacuous: withheld numbers exist for this wave", () => h.assert(withheldNumbers(wave).size >= members.length, "no withheld numbers"));

    // ARMS waves (template amendment 16): every withheld variant (the group members and every secondary-arm variant), every machine output.
    if (wave.derived.display_rule !== undefined) {
      const d = wave.derived;
      h.section(`G24 arms wave (amendment 16): ${label}`);
      await h.check("the withheld set is the group plus the secondary arm; one separated variant keeps its point", () => {
        h.assert(JSON.stringify(members) === JSON.stringify(d.point_withheld_subjects), "withheld members differ from derived.point_withheld_subjects");
        h.assert(d.separated_subjects.length === 1 && d.range_only_subjects.every((id) => members.includes(id)), "separated or secondary-arm set");
      });
      await h.check("POSITIVE CONTROL (arms): the separated variant's point IS in the public file and the projection says it keeps it", () => {
        const o = pubObj();
        h.assert(o.subjects[d.separated_subjects[0]].pilot_composite === wave.subjects[d.separated_subjects[0]].pilot_composite, "point absent");
        h.assert(JSON.stringify(o.public_projection.separated_subjects_keep_points) === JSON.stringify(d.separated_subjects), "projection note");
        h.assert(/amendments 2, 8, 9 and 16/.test(o.public_projection.template_ref) && /secondary arm/.test(o.subjects[d.range_only_subjects[0]].point_withheld.reason), "the projection does not cite amendment 16 for the secondary arm");
      });
      for (const id of members) {
        const arm = d.range_only_subjects.includes(id) ? "secondary arm" : "group";
        const pt = wave.subjects[id].pilot_composite;
        const tok = pt.toFixed(1);
        const note = `${id} reached ${tok} in the pilot.`;
        h.trips(`${id} (${arm}): its point re-inserted in the public wave file`, (() => { const o = pubObj(); o.subjects[id].pilot_composite = pt; return file(asText(o)); })(), "G24-member-point");
        h.trips(`${id} (${arm}): its dimension means re-inserted`, (() => { const o = pubObj(); o.subjects[id].dimensions = wave.subjects[id].dimensions; return file(asText(o)); })(), "G24-member-point");
        h.trips(`${id} (${arm}): its judge-sensitivity point re-inserted`, (() => { const o = pubObj(); o.sensitivity.subjects[id].pilot_composite = wave.sensitivity.subjects[id].pilot_composite; return file(asText(o)); })(), "G24-member-point");
        h.trips(`${id} (${arm}): its point in a note string of the public file`, (() => { const o = pubObj(); o.public_projection.note += ` ${note}`; return file(asText(o)); })(), "G24-member-value");
        h.trips(`${id} (${arm}): its point in index.json`, (() => { const o = JSON.parse(indexText); o.pilot_reports[0].separation.summary += ` ${note}`; return text(asText(o), "index.json"); })(), "G24-member-point-token");
        h.trips(`${id} (${arm}): its point as a JSON number in index.json`, (() => { const o = JSON.parse(indexText); o.pilot_reports[0].composite = pt; return text(asText(o), "index.json"); })(), "G24-member-point-leaf");
        h.trips(`${id} (${arm}): its point in llms-full.txt`, text(`${fullText}${NL}- ${note}`, "llms-full.txt"), "G24-member-point-token");
        h.trips(`${id} (${arm}): its point in the .well-known descriptor`, (() => { const o = JSON.parse(wk); o.modelBenchmark.note = note; return text(asText(o), ".well-known"); })(), "G24-member-point-token");
        h.trips(`${id} (${arm}): its point in a markdown alternate`, text(`${md}${NL}${note}${NL}`, "markdown"), "G24-member-point-token");
        h.trips(`${id} (${arm}): its point in JSON-LD`, text(jsonLdText(html.replace("No point here.", `It was ${tok}.`)), "JSON-LD"), "G24-member-point-token");
      }
      // Point differences that involve a withheld variant, in the pre-declared comparisons too (the first pilot's lists had none).
      const iC = (pred) => wave.comparisons.findIndex(pred);
      const withheldPair = (q) => members.includes(q.a) || members.includes(q.b);
      for (const [what, i] of [["a primary-arm pair of the separated variant against a group member", iC((q) => q.kind === "build" && q.arm_a === d.primary_arm && withheldPair(q) && q.bonferroni?.separated)], ["a pair separated only without correction", iC((q) => q.bonferroni && q.separated && !q.bonferroni.separated)], ["a secondary-arm pair", iC((q) => q.kind === "build" && q.arm_a !== d.primary_arm)]]) {
        if (i < 0) continue;
        h.trips(`${what}: the comparison's point difference re-inserted`, (() => { const o = pubObj(); o.comparisons[i].difference = wave.comparisons[i].difference; return file(asText(o)); })(), "G24-member-difference");
      }
      const iA = iC((q) => q.kind === "arm");
      h.trips("a build's B minus A point difference re-inserted", (() => { const o = pubObj(); o.comparisons[iA].b_minus_a.difference = wave.comparisons[iA].b_minus_a.difference; return file(asText(o)); })(), "G24-member-difference");
      h.trips("a comparison's point difference re-inserted for EVERY comparison at once (the original-defect shape)", (() => { const o = pubObj(); o.comparisons = wave.comparisons; return file(asText(o)); })(), "G24-member-difference");
      h.trips("a comparison lost its corrected range in the projection", (() => { const o = pubObj(); const j = iC((q) => q.bonferroni); delete o.comparisons[j].bonferroni; return file(asText(o)); })(), "G24-pair-range");
      await h.check("every comparison keeps its ranges and flags in the projection, and loses exactly the point differences that involve a withheld variant", () => {
        const o = pubObj();
        wave.comparisons.forEach((q, i) => {
          h.assert(withheldPair(q) === !("difference" in o.comparisons[i]), `${q.a}/${q.b}: difference withheld ${!("difference" in o.comparisons[i])} but involves a withheld variant ${withheldPair(q)}`);
          h.assert(JSON.stringify(o.comparisons[i].interval95) === JSON.stringify(q.interval95) && o.comparisons[i].separated === q.separated, `${q.a}/${q.b}: range or flag changed`);
          if (q.b_minus_a) h.assert(!("difference" in o.comparisons[i].b_minus_a) && JSON.stringify(o.comparisons[i].b_minus_a.interval95) === JSON.stringify(q.b_minus_a.interval95), `${q.a}/${q.b}: b_minus_a`);
        });
      });
      await h.check("withheldNumbers covers the comparisons' point differences (the scan is not blind to them)", () => {
        const nums = withheldNumbers(wave);
        for (const q of wave.comparisons) if (withheldPair(q) && Math.abs(q.difference) > 0) h.assert(nums.has(q.difference) && nums.has(-q.difference), `${q.a}/${q.b}: ${q.difference} not among the withheld numbers`);
      });
      await h.check("the replication note carries ranges and flags only, never a point or a point difference", () => {
        const o = pubObj();
        const keys = [];
        const walk = (x, path) => { if (Array.isArray(x)) x.forEach((v, i) => walk(v, `${path}[${i}]`)); else if (x && typeof x === "object") for (const [k, v] of Object.entries(x)) { if (/^(?:difference|composite|point)|_difference/i.test(k)) keys.push(`${path}.${k}`); walk(v, `${path}.${k}`); } };
        if (o.replication) walk(o.replication, "replication");
        h.assert(keys.length === 0, `point-like keys in replication: ${keys.join(", ")}`);
      });
    }
  }

  // ---- the existence rules for the new outputs, on a synthetic tree ------------------------------------------------
  h.section("G24 tree rules (synthetic out/ trees)");
  const two = waves.slice(0, 2);
  if (two.length === 2) {
    const reportsDir = mkdtempSync(join(tmpdir(), "cb-machine-reports-"));
    const mk = (id) => writeFileSync(join(reportsDir, `${id}.md`), "---" + NL + "title: t" + NL + "---" + NL);
    const active = (ids) => manifest.filter((e) => ids.includes(e.run_id)).map((e) => ({ ...e, decision_status: "active" }));
    const tree = (ids, { index = true, markdown = true, alternate = true } = {}) => {
      const out = mkdtempSync(join(tmpdir(), "cb-machine-out-"));
      const put = (rel, text) => { const p = join(out, rel); mkdirSync(join(p, ".."), { recursive: true }); writeFileSync(p, text); };
      const reports = ids.map((id) => ({ wave: waves.find((x) => x.run_id === id), title: id }));
      put("data/model-benchmark/index.json", JSON.stringify(buildModelBenchmarkIndex({ reports, facts, reportsIndexRenders: ids.length >= 2 })));
      for (const id of ids) {
        put(`data/model-waves/${id}.json`, "{}");
        if (markdown) put(`ai-models/reports/${id}.md`, "# t");
        put(`ai-models/reports/${id}.html`, `<html><head>${alternate ? `<link rel="alternate" type="text/markdown" href="https://compassionbenchmark.com/ai-models/reports/${id}.md"/>` : ""}</head><body><section aria-labelledby="data-and-citation"><h2 id="data-and-citation">Data and citation</h2></section></body></html>`);
      }
      if (index) put("ai-models/reports.html", "<html></html>");
      put("sitemap.xml", `<urlset>${ids.length >= 2 ? "<url><loc>https://compassionbenchmark.com/ai-models/reports</loc></url>" : ""}</urlset>`);
      return out;
    };
    const ids = two.map((x) => x.run_id);
    for (const id of ids) mk(id);
    const run = (outDir, mf, env = {}) => machineTreeProblems({ outDir, manifest: mf, waves, env, reportsDir });
    h.clean("two rendered reports: every output present, index page and sitemap entry present", run(tree(ids), active(ids)));
    h.clean("one rendered report: no reports index, none in the sitemap", run(tree([ids[0]], { index: false }), active([ids[0]])));
    h.trips("a rendered report whose markdown alternate is missing", run(tree(ids, { markdown: false }), active(ids)), "TREE-missing");
    h.trips("a rendered report whose page lacks the markdown alternate link", run(tree(ids, { alternate: false }), active(ids)), "TREE-alternate");
    h.trips("two reports render but the reports index page is absent", run(tree(ids, { index: false }), active(ids)), "TREE-missing: ai-models/reports.html");
    h.trips("a markdown alternate for a wave that does not render", run(tree(ids), active([ids[0]])), "TREE-leak");
    h.trips("an index.json that lists a report the build does not render", run(tree(ids), active([ids[0]])), "TREE-index");
    h.trips("the sitemap lists the reports index with one report rendering", (() => { const out = tree([ids[0]], { index: false }); writeFileSync(join(out, "sitemap.xml"), "<urlset><url><loc>https://compassionbenchmark.com/ai-models/reports</loc></url></urlset>"); return run(out, active([ids[0]])); })(), "TREE-sitemap");
    rmSync(reportsDir, { recursive: true, force: true });
  } else {
    await h.check("two committed waves exist for the tree-rule probes", () => h.assert(false, "fewer than two waves"));
  }

  h.section("G24 reports markdown (the compiled report is the only figure path)");
  const w0 = waves[0];
  const compiledStub = { run_id: w0.run_id, report_date: w0.report_date, comparability: w0.comparability, front_matter: ["title: \"T\"", "dek: \"D\""], preface: { markdown: "", html: "" }, sections: [{ id: "a", title: "First", markdown: "Body one, see [methodology](/ai-models/methodology).", html: "" }, { id: "b", title: "Second", markdown: "Body two.", html: "" }] };
  const mdOut = reportMarkdown(compiledStub, w0, "T");
  await h.check("the markdown alternate has the title, the status, absolute links and each section in order", () => {
    h.assert(mdOut.includes("# T") && mdOut.includes("status: unofficial pilot") && mdOut.includes(`canonical: https://compassionbenchmark.com/ai-models/reports/${w0.run_id}`), "header");
    h.assert(mdOut.includes("](https://compassionbenchmark.com/ai-models/methodology)") && !mdOut.includes("](/"), "links not absolute");
    h.assert(mdOut.indexOf("## First") < mdOut.indexOf("## Second"), "section order");
    h.assert(!mdOut.includes("{{"), "unresolved token");
  });
}

// ---------------------------------------------------------------------------------------------------------------------
h.section("the built tree in site/out");
if (haveOut(h)) {
  const { problems, examined } = scanMachineTree({ outDir: OUT_DIR, waves });
  await h.check(`every machine-readable output withholds what the report withholds (${examined} file(s)/block(s) scanned against ${waves.length} wave(s))`, () => h.assert(problems.length === 0, problems.slice(0, 8).join(" | ")));
  const rendering = renderableEntries(manifest, process.env);
  await h.check("fail-on-zero: the machine-readable outputs were found and examined", () => h.assert(examined >= 2 + (rendering.length > 0 ? rendering.length * 2 + 2 : 0), `examined ${examined}; expected at least ${2 + (rendering.length > 0 ? rendering.length * 2 + 2 : 0)} for ${rendering.length} rendered report(s)`));
  const treeP = machineTreeProblems({ outDir: OUT_DIR, manifest, waves, env: process.env });
  await h.check("index.json, markdown alternates, the reports index page and the sitemap follow the render gate", () => h.assert(treeP.length === 0, treeP.slice(0, 8).join(" | ")));
  h.log(`  info rendering: ${rendering.map((x) => x.entry.run_id).join(", ") || "none (default build)"}`);
}
h.finish();
