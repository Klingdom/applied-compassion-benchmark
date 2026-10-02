#!/usr/bin/env node
/**
 * analyze-pilot.mjs — generate the canonical analysis of a finished pilot run.
 *
 *   node research/model-runs/bin/analyze-pilot.mjs --run-id pilot-2026-10-01
 *
 * Writes research/model-runs/<run>/analysis.json. Every figure any page, report
 * or briefing states about the run must be read from this file (S11: status
 * figures are generated, not typed). Reads only run artifacts; deterministic
 * (fixed bootstrap seed recorded in the output).
 *
 * Contents: composites recomputed from raw ratings with the unmodified
 * computeCompositeFromDimensions (and checked against each scorecard);
 * item-resampling 95% intervals (stratified by dimension, paired across
 * subjects); paired differences; within-item length analysis; judge leniency;
 * inter-judge agreement; contamination; operations counts from the assembly audit.
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const runIdx = process.argv.indexOf("--run-id");
if (runIdx < 0) { console.error("usage: analyze-pilot.mjs --run-id <id>"); process.exit(2); }
const RUN = process.argv[runIdx + 1];
const R = join(ROOT, "research", "model-runs", RUN);
const { computeCompositeFromDimensions, getBand } = await import(pathToFileURL(join(ROOT, "site", "scripts", "lib", "scoring.mjs")).href);
const comp = (d) => { const c = computeCompositeFromDimensions(d); return typeof c === "number" ? c : c.composite ?? c.score; };
const r1 = (x) => Math.round(x * 10) / 10;
const r2 = (x) => Math.round(x * 100) / 100;
const r3 = (x) => Math.round(x * 1000) / 1000;
const mean = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;

const SUBJ = ["claude-fable", "claude-haiku", "claude-opus", "claude-sonnet"]; // alphabetical: no implied order
const DIMS = ["AWR", "EMP", "ACT", "EQU", "BND", "ACC", "SYS", "INT"];
const bank = JSON.parse(readFileSync(join(ROOT, "site", "src", "data", "model-benchmark", "tasks-v1.json"), "utf8"));
const dimOf = Object.fromEntries(bank.items.map((i) => [i.id, i.dimension]));
const ing = JSON.parse(readFileSync(join(R, "keys", "ingested", "answers.json"), "utf8"));
const words = new Map();
for (const r of ing.responses ?? ing.answers ?? ing) words.set(`${r.subject}|${r.trial}|${r.item_id}`, r.response.trim().split(/\s+/).length);

const rows = [];
const card = {};
const audit = {};
for (const s of SUBJ) {
  audit[s] = JSON.parse(readFileSync(join(R, "scorecards", `${s}.assembly-audit.json`), "utf8"));
  card[s] = JSON.parse(readFileSync(join(R, "scorecards", `${s}.scorecard.json`), "utf8"));
  for (const m of audit[s].row_mapping)
    rows.push({ s, item: m.item_id, dim: dimOf[m.item_id], trial: m.subject_trial, judge: m.judge, rating: m.rating_1_5, len: words.get(`${s}|${m.subject_trial}|${m.item_id}`) });
}
if (rows.some((r) => r.len === undefined)) throw new Error("a rating row has no matching response text");
const items = [...new Set(rows.map((r) => r.item))].sort();
const im = {};
for (const s of SUBJ) for (const i of items) im[`${s}|${i}`] = mean(rows.filter((r) => r.s === s && r.item === i).map((r) => r.rating));
const dimScores = (s, valueFn) => Object.fromEntries(DIMS.map((d) => {
  const its = items.filter((i) => dimOf[i] === d);
  return [d, mean(its.map((i) => (valueFn ? mean(rows.filter((r) => r.s === s && r.item === i).map(valueFn)) : im[`${s}|${i}`])))];
}));

// bootstrap: items resampled within dimension, same draw for every subject
const SEED = 20261001, B = 1000;
let seed = SEED;
const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
const byDim = Object.fromEntries(DIMS.map((d) => [d, items.filter((i) => dimOf[i] === d)]));
const boots = Object.fromEntries(SUBJ.map((s) => [s, []]));
const dimBoots = Object.fromEntries(SUBJ.map((s) => [s, Object.fromEntries(DIMS.map((d) => [d, []]))]));
for (let b = 0; b < B; b++) {
  const pick = Object.fromEntries(DIMS.map((d) => [d, byDim[d].map(() => byDim[d][Math.floor(rnd() * byDim[d].length)])]));
  for (const s of SUBJ) {
    const dm = Object.fromEntries(DIMS.map((d) => [d, mean(pick[d].map((i) => im[`${s}|${i}`]))]));
    for (const k of DIMS) dimBoots[s][k].push(dm[k]);
    boots[s].push(comp(dm));
  }
}
const ci = (xs) => { const t = [...xs].sort((a, b) => a - b); return [r1(t[Math.floor(0.025 * B)]), r1(t[Math.floor(0.975 * B)])]; };

const subjects = {};
for (const s of SUBJ) {
  const d = dimScores(s);
  const c = comp(d);
  const maxDiff = Math.max(...DIMS.map((k) => Math.abs(d[k] - card[s].dimensions[k])));
  if (r1(c) !== card[s].composite || maxDiff > 1e-9) throw new Error(`${s}: recompute ${r1(c)} disagrees with scorecard ${card[s].composite}`);
  const lens = rows.filter((r) => r.s === s).map((r) => r.len).sort((a, b) => a - b);
  const id = card[s].contamination.identification;
  subjects[s] = {
    composite: r1(c), band: getBand(c), interval95: ci(boots[s]),
    dimensions: Object.fromEntries(DIMS.map((k) => [k, r2(d[k])])),
    dimension_intervals95: Object.fromEntries(DIMS.map((k) => { const t = [...dimBoots[s][k]].sort((x, y) => x - y); return [k, [r2(t[Math.floor(0.025 * B)]), r2(t[Math.floor(0.975 * B)])]]; })),
    dimension_item_counts: Object.fromEntries(DIMS.map((k) => [k, byDim[k].length])),
    median_reply_words: lens[lens.length >> 1],
    contamination: {
      indicated: card[s].contamination.contamination_indicated,
      recall_items_flagged: card[s].contamination.items.filter((i) => i.exposure_flag).length,
      recall_items_probed: card[s].contamination.items.length,
      identification_correct: id.correct, identification_asked: id.questions_asked,
      identification_p_if_unexposed: r3(id.probability_if_unexposed), identification_flagged: id.flagged,
    },
    judge_agreement: {
      exact: r3(audit[s].paired_judge_agreement.exact_agreement),
      mean_absolute_difference: r2(audit[s].paired_judge_agreement.mean_absolute_difference),
      responses_differing_by_2_or_more: audit[s].paired_judge_agreement.responses_differing_by_2_or_more,
    },
    official: card[s].official, comparability: card[s].comparability,
  };
}
const pairs = [];
for (let a = 0; a < SUBJ.length; a++) for (let b = a + 1; b < SUBJ.length; b++) {
  const [x, y] = [SUBJ[a], SUBJ[b]];
  const diffs = boots[x].map((v, k) => v - boots[y][k]);
  const [lo, hi] = ci(diffs);
  pairs.push({ a: x, b: y, difference: r1(subjects[x].composite - subjects[y].composite), interval95: [lo, hi], separated: lo > 0 || hi < 0 });
}
// per-dimension paired separation (same resampled items)
const dimension_pairwise = [];
for (let a = 0; a < SUBJ.length; a++) for (let b = a + 1; b < SUBJ.length; b++) for (const k of DIMS) {
  const [x, y] = [SUBJ[a], SUBJ[b]];
  const t = dimBoots[x][k].map((v, i) => v - dimBoots[y][k][i]).sort((p, q) => p - q);
  const lo = t[Math.floor(0.025 * B)], hi = t[Math.floor(0.975 * B)];
  const m = SUBJ.length * (SUBJ.length - 1) / 2 * DIMS.length, aB = 0.05 / m;
  const loB = t[Math.max(0, Math.floor((aB / 2) * B))], hiB = t[Math.min(B - 1, Math.ceil((1 - aB / 2) * B) - 1)];
  dimension_pairwise.push({ a: x, b: y, dimension: k, difference: r2(subjects[x].dimensions[k] - subjects[y].dimensions[k]), interval95: [r2(lo), r2(hi)], separated: lo > 0 || hi < 0, bonferroni_separated: loB > 0 || hiB < 0, bonferroni_note: `alpha ${aB.toExponential(1)} over ${m} comparisons; with ${B} replicates the corrected interval is the bootstrap extremes, so this flag is conservative` });
}
// length
const itemMeanAll = Object.fromEntries(items.map((i) => [i, mean(rows.filter((r) => r.item === i).map((r) => r.rating))]));
const itemMeanLog = Object.fromEntries(items.map((i) => [i, mean(rows.filter((r) => r.item === i).map((r) => Math.log(r.len)))]));
const X = rows.map((r) => Math.log(r.len) - itemMeanLog[r.item]), Y = rows.map((r) => r.rating - itemMeanAll[r.item]);
const sxx = X.reduce((a, x) => a + x * x, 0), sxy = X.reduce((a, x, k) => a + x * Y[k], 0), syy = Y.reduce((a, y) => a + y * y, 0);
const pooledSlope = sxy / sxx;
const within = {};
for (const s of SUBJ) {
  const rs = rows.filter((r) => r.s === s);
  const ml = Object.fromEntries(items.map((i) => [i, mean(rs.filter((r) => r.item === i).map((r) => Math.log(r.len)))]));
  const x = rs.map((r) => Math.log(r.len) - ml[r.item]), y = rs.map((r) => r.rating - im[`${s}|${r.item}`]);
  within[s] = r3(x.reduce((a, v, k) => a + v * y[k], 0) / x.reduce((a, v) => a + v * v, 0));
}
const adjusted = Object.fromEntries(SUBJ.map((s) => [s, r1(comp(dimScores(s, (r) => r.rating - pooledSlope * (Math.log(r.len) - itemMeanLog[r.item]))))]));
// judges
const judges = {};
for (const j of [...new Set(rows.map((r) => r.judge))].sort()) {
  const rj = rows.filter((r) => r.judge === j);
  judges[j] = {
    ratings_used: rj.length,
    leniency_vs_item_mean: r3(mean(rj.map((r) => r.rating - itemMeanAll[r.item]))),
    by_subject: Object.fromEntries(SUBJ.filter((s) => rj.some((r) => r.s === s)).map((s) => [s, r2(mean(rj.filter((r) => r.s === s).map((r) => r.rating - itemMeanAll[r.item])))])),
  };
}
// judge quote grounding on the ORIGINAL judge answers (before exclusion/re-routing)
import { NORM } from "../lib/normalise.mjs";
const quote_grounding = { definition: "verbatim = the evidence_quote occurs character-for-character in the reply it rates. normalisation_only = not verbatim, but found after NFKC, quote/dash/ellipsis unification, markdown-symbol removal, whitespace collapse and lower-casing. not_found = absent even after that normalisation. Computed over judge-answers/ (the 128 original batches), before any exclusion or re-routing.", judges: {} };
{ const { readdirSync } = await import("node:fs");
  for (const f of readdirSync(join(R, "judge-answers")).sort()) {
    const j = f.split("__")[0];
    const batch = JSON.parse(readFileSync(join(R, "judge-batches", f.replace(".answers.json", ".json")), "utf8"));
    const txt = new Map(batch.entries.map((e) => [e.response_id, e.response]));
    const g = (quote_grounding.judges[j] ??= { ratings: 0, verbatim: 0, not_verbatim: 0, normalisation_only: 0, not_found: 0 });
    for (const r of JSON.parse(readFileSync(join(R, "judge-answers", f), "utf8")).ratings) {
      g.ratings++; const t = txt.get(r.response_id), q = String(r.evidence_quote ?? "");
      if (q && t.includes(q)) g.verbatim++; else { g.not_verbatim++; if (q && NORM(t).includes(NORM(q))) g.normalisation_only++; else g.not_found++; }
    }
  }
  for (const g of Object.values(quote_grounding.judges)) { g.not_verbatim_rate = r3(g.not_verbatim / g.ratings); g.not_found_rate = r3(g.not_found / g.ratings); }
}
// operations counts from the committed ledgers (research/model-runs/<run>/operations/)
const opsDir = join(R, "operations");
const NL = String.fromCharCode(10), TAB = String.fromCharCode(9); // no escape sequences: DC-21
const lines = (f) => readFileSync(join(opsDir, f), "utf8").trim().split(NL).filter(Boolean);
const ledger = lines("judge-batches.ledger.tsv").map((l) => l.split(TAB));
const operations = {
  source: "research/model-runs/" + RUN + "/operations/",
  subject_parts_planned: lines("subject-parts.manifest.tsv").length,
  subject_files_voided: lines("subject-parts.voided.txt").length,
  judge_batches: lines("judge-batches.map.tsv").length,
  judge_files_voided: lines("judge-batches.voided.txt").length,
  judge_voids_by_reason: ledger.filter((r) => r[2] !== "ok").reduce((a, r) => ((a[r[2]] = (a[r[2]] ?? 0) + 1), a), {}),
  // Per judge model, from the ledger joined to the batch map (VOID = tool-call rule exceeded; VOID-INCOMPLETE =
  // dropped entries). These are FIRST-ATTEMPT failures; every one was voided and re-run, so final files are complete.
  judge_voids_by_judge: (() => {
    const judgeOf = Object.fromEntries(lines("judge-batches.map.tsv").map((l) => l.split(TAB)).map((c) => [c[0], c[1]]));
    const out = {};
    for (const [id, , reason] of ledger.filter((r) => r[2] !== "ok")) {
      const j = judgeOf[id] ?? "unknown";
      out[j] ??= {};
      out[j][reason] = (out[j][reason] ?? 0) + 1;
    }
    return out;
  })(),
  reroute_batches: lines("reroute-batches.map.tsv").length,
  supplement_batches: lines("supplement-batches.map.tsv").length,
};
const ex = audit[SUBJ[0]].judge_routing;

// Sensitivity: would the findings change if the excluded judge's ratings had been kept?
// Recomputes from the ORIGINAL routing (judge-key.json + judge-answers/, i.e. before exclusion, re-routing and
// requotes) with the same canonical scorer and the same bootstrap seed. Descriptive only — never a score.
const sensitivity = (() => {
  const key = JSON.parse(readFileSync(join(R, "keys", "judge-key.json"), "utf8"));
  const meta = new Map(key.responses.map((r) => [r.response_id, r]));
  const orig = [];
  for (const f of readdirSyncSafe(join(R, "judge-answers"))) {
    const judge = f.split("__")[0];
    for (const r of JSON.parse(readFileSync(join(R, "judge-answers", f), "utf8")).ratings) {
      const m = meta.get(r.response_id);
      if (!m) throw new Error(`sensitivity: response ${r.response_id} not in key`);
      orig.push({ s: m.subject, item: m.item_id, judge, rating: r.rating_1_5 });
    }
  }
  const om = {};
  for (const s of SUBJ) for (const i of items) {
    const xs = orig.filter((r) => r.s === s && r.item === i).map((r) => r.rating);
    if (!xs.length) throw new Error(`sensitivity: no ratings for ${s} ${i}`);
    om[`${s}|${i}`] = mean(xs);
  }
  let sd = SEED;
  const rr = () => ((sd = (sd * 1103515245 + 12345) % 2147483648) / 2147483648);
  const bs = Object.fromEntries(SUBJ.map((s) => [s, []]));
  for (let b = 0; b < B; b++) {
    const pick = Object.fromEntries(DIMS.map((d) => [d, byDim[d].map(() => byDim[d][Math.floor(rr() * byDim[d].length)])]));
    for (const s of SUBJ) bs[s].push(comp(Object.fromEntries(DIMS.map((d) => [d, mean(pick[d].map((i) => om[`${s}|${i}`]))]))));
  }
  const point = Object.fromEntries(SUBJ.map((s) => [s, comp(Object.fromEntries(DIMS.map((d) => [d, mean(byDim[d].map((i) => om[`${s}|${i}`]))])))]));
  const prs = [];
  for (let a = 0; a < SUBJ.length; a++) for (let b = a + 1; b < SUBJ.length; b++) {
    const [x, y] = [SUBJ[a], SUBJ[b]];
    const [lo, hi] = ci(bs[x].map((v, k) => v - bs[y][k]));
    prs.push({ a: x, b: y, difference: r1(point[x] - point[y]), interval95: [lo, hi], separated: lo > 0 || hi < 0 });
  }
  const same = prs.every((p, k) => p.separated === pairs[k].separated);
  return {
    question: "Do the separation findings depend on excluding claude-haiku as a judge?",
    method: "Original routing before exclusion/re-routing/requotes; excluded judge's ratings retained; same scorer and bootstrap seed. Descriptive only.",
    note: "The judge exclusion cannot affect claude-haiku as a SUBJECT (it never judged itself, so its judges are the same in both routings). Its small shift here comes only from the few ratings of its replies that were re-asked after the quote check, which this original routing still contains.",
    ratings_used: orig.length,
    subjects: Object.fromEntries(SUBJ.map((s) => [s, { pilot_composite: r1(point[s]), interval95: ci(bs[s]) }])),
    pairwise: prs,
    separation_pattern_unchanged: same,
  };
})();
function readdirSyncSafe(d) { return readdirSync(d).filter((f) => f.endsWith(".answers.json")).sort(); }
const out = {
  run_id: RUN,
  generated_by: "research/model-runs/bin/analyze-pilot.mjs",
  status: "UNOFFICIAL PILOT — official:false, comparability:none on every scorecard",
  design: {
    subjects: SUBJ, access_tier: "agent (Claude Code subagent; snapshot id unverifiable)",
    items_served: items.length, trials_per_subject: 3, responses: rows.length / 2, ratings: rows.length,
    judges_per_response: 2, self_judging: false, judge_family: "same family as subjects (all Claude)",
    excluded_judges: ex?.judge_exclusion?.excluded_judges ?? (() => { throw new Error("no exclusion record in audit"); })(),
    bank_version: audit[SUBJ[0]].bank_version,
  },
  method: { composite: "computeCompositeFromDimensions (unmodified), dimension = mean of item means", interval: `item resampling stratified by dimension, paired across subjects, ${B} replicates, seed ${SEED}`, length: "within-item centred log(words) regression" },
  subjects, pairwise: pairs, dimension_pairwise,
  dimension_pairwise_note: `${dimension_pairwise.length} dimension-level comparisons at 95% each: about ${Math.round(dimension_pairwise.length * 0.05)} would be flagged 'separated' by chance alone even if no model differed. Uncorrected; a dimension-level 'separated' flag is not evidence of a real difference unless it also survives a Bonferroni-corrected interval (bonferroni_separated).`,
  length: { pooled_within_item_slope: r3(pooledSlope), pooled_within_item_r: r3(sxy / Math.sqrt(sxx * syy)), within_subject_slopes: within, composite_if_pooled_slope_removed: adjusted, note: "Removing the pooled within-item slope assumes every rating difference that goes with reply length is caused by length. That is an extreme assumption, so the result is a bound, not an estimate; even under it the separated model's gap does not fully close." },
  judges,
  quote_grounding,
  operations,
  sensitivity,
  // measured_original_answer_stats is dropped: it used a broader normalisation and counted final (re-run) files,
  // so it disagreed with quote_grounding (the canonical figure). See pilot record addendum 2026-10-01.
  exclusion_record: (() => {
    const { measured_original_answer_stats, routing_key_file, ...rest } = ex?.judge_exclusion?.exclusion_record ?? {};
    const stale = "Measured counts are in measured_original_answer_stats.";
    if (typeof rest.reason === "string" && rest.reason.includes(stale)) rest.reason = rest.reason.replace(stale, "Canonical counts: quote_grounding in this file.");
    return rest;
  })(),
  routing: Object.fromEntries(SUBJ.map((s) => [s, { responses_by_judge_pair: audit[s].judge_routing.responses_by_judge_pair, ratings_by_provenance: audit[s].judge_routing.ratings_by_provenance }])),
};
writeFileSync(join(R, "analysis.json"), JSON.stringify(out, null, 2) + "\n");
console.log(`wrote ${join(R, "analysis.json")}`);
for (const s of SUBJ) console.log(`  ${s.padEnd(14)} ${subjects[s].composite}  [${subjects[s].interval95.join(", ")}]`);
for (const p of pairs) console.log(`  ${p.a} − ${p.b}: ${p.difference} [${p.interval95.join(", ")}] ${p.separated ? "SEPARATED" : "not separated"}`);
