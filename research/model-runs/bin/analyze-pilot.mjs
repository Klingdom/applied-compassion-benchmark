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
 *
 * TWO RUN SHAPES, ONE CODE PATH (generalised 2026-10-02; the first pilot's output stays byte-identical):
 *   - first-pilot shape (no run-config.json): subjects are the judges' own family, dimension ratings come from
 *     scorecards/<subject>.scorecard.json + .assembly-audit.json written by assemble-run.mjs;
 *   - explicit-judge-set shape (run-config.json has a `judges` array, e.g. pilot-2026-10-02): subjects come from the
 *     config in registered order (first minus second is the pre-registered primary comparison), dimension ratings come
 *     from the scorecards the cb-probe MCP server finished (mcp-scorecards/<subject>/scorecard.json) plus the
 *     response-level mcp-rating-map.json. The composite is STILL computed here by the same
 *     computeCompositeFromDimensions call and checked against the server's scorecard. No second composite path.
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const runIdx = process.argv.indexOf("--run-id");
if (runIdx < 0) { console.error("usage: analyze-pilot.mjs --run-id <id>"); process.exit(2); }
const RUN = process.argv[runIdx + 1];
const R = join(ROOT, "research", "model-runs", RUN);
const CFG_FILE = join(R, "run-config.json");
const CFG = existsSync(CFG_FILE) ? JSON.parse(readFileSync(CFG_FILE, "utf8")) : null;
const LOCAL = Boolean(CFG && Array.isArray(CFG.judges));
if (LOCAL && CFG.run_id !== RUN) throw new Error(`run-config.json is for ${CFG.run_id}, not ${RUN}`);
// Harness libraries are loaded only for the explicit-judge-set shape; the first-pilot path loads nothing new.
const asm = LOCAL ? await import("../lib/assemble.mjs") : null;
const jans = LOCAL ? await import("../lib/judge-answers.mjs") : null;
const brg = LOCAL ? await import("../lib/bridge.mjs") : null;
const { computeCompositeFromDimensions, getBand } = await import(pathToFileURL(join(ROOT, "site", "scripts", "lib", "scoring.mjs")).href);
const comp = (d) => { const c = computeCompositeFromDimensions(d); return typeof c === "number" ? c : c.composite ?? c.score; };
const r1 = (x) => Math.round(x * 10) / 10;
const r2 = (x) => Math.round(x * 100) / 100;
const r3 = (x) => Math.round(x * 1000) / 1000;
const mean = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;

// First pilot: alphabetical, no implied order. Explicit-judge-set run: the config's registered order, so that
// pairs[0] is "first minus second" exactly as the pre-registration states the primary comparison.
const SUBJ = LOCAL ? CFG.subjects.map((s) => s.label) : ["claude-fable", "claude-haiku", "claude-opus", "claude-sonnet"];
if (LOCAL && !(SUBJ.length === 2 && SUBJ[0] === "qwen2.5-7b" && SUBJ[1] === "llama3.2-3b")) {
  throw new Error("PREREGISTRATION.md section 8: the primary comparison is qwen2.5-7b minus llama3.2-3b; the config subject order must match");
}
const DIMS = ["AWR", "EMP", "ACT", "EQU", "BND", "ACC", "SYS", "INT"];
const bank = JSON.parse(readFileSync(join(ROOT, "site", "src", "data", "model-benchmark", "tasks-v1.json"), "utf8"));
const dimOf = Object.fromEntries(bank.items.map((i) => [i.id, i.dimension]));
const ing = JSON.parse(readFileSync(join(R, "keys", "ingested", "answers.json"), "utf8"));
const words = new Map();
for (const r of ing.responses ?? ing.answers ?? ing) words.set(`${r.subject}|${r.trial}|${r.item_id}`, r.response.trim().split(/\s+/).length);

const rows = [];
const card = {};
const audit = {};
const SKEY = LOCAL ? JSON.parse(readFileSync(join(R, "keys", "subject-brief-key.json"), "utf8")) : null;
for (const s of SUBJ) {
  if (LOCAL) {
    const dir = join(R, "mcp-scorecards", s);
    card[s] = JSON.parse(readFileSync(join(dir, "scorecard.json"), "utf8"));
    const map = JSON.parse(readFileSync(join(dir, "mcp-rating-map.json"), "utf8"));
    if (map.subject !== s || map.run_id !== RUN) throw new Error(`${dir}/mcp-rating-map.json is not for ${RUN} ${s}`);
    // Audit-shaped record, built with the assembler's own descriptive helpers (same functions, same figures).
    audit[s] = {
      bank_version: card[s].provenance.bank_version,
      paired_judge_agreement: asm.pairedAgreement(map.rows),
      judge_routing: asm.routingAuditForSubject(map.rows),
      row_mapping: map.rows,
    };
  } else {
    audit[s] = JSON.parse(readFileSync(join(R, "scorecards", `${s}.assembly-audit.json`), "utf8"));
    card[s] = JSON.parse(readFileSync(join(R, "scorecards", `${s}.scorecard.json`), "utf8"));
  }
  if (card[s].official !== false || card[s].comparability !== "none") throw new Error(`${s}: scorecard is not official:false / comparability:none`);
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
const SEED = LOCAL ? CFG.master_seed : 20261001, B = 1000;
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
    ...(LOCAL ? {
      composite_floor_met: card[s].composite_withheld_reason === null,
      // The server's own interval resamples trials inside each item and treats a response's two judges as independent
      // trials (harness README, limit 1), so it is narrower than interval95 above. Shown for transparency, not for use.
      scorecard_trial_level_interval95: card[s].uncertainty.composite_interval.ci,
      scorecard_mean_judge_disagreement: r3(card[s].judge_panel.mean_disagreement),
      mcp_scorecard: `research/model-runs/${RUN}/mcp-scorecards/${s}/scorecard.json`,
    } : {}),
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
  const loIdx = Math.max(0, Math.floor((aB / 2) * B)), hiIdx = Math.min(B - 1, Math.ceil((1 - aB / 2) * B) - 1);
  const loB = t[loIdx], hiB = t[hiIdx];
  const bonferroni_note = loIdx === 0
    ? `alpha ${aB.toExponential(1)} over ${m} comparisons; with ${B} replicates the corrected interval is the bootstrap extremes, so this flag is conservative`
    : `alpha ${aB.toExponential(1)} over ${m} comparisons; the corrected interval is the sorted replicates at ranks ${loIdx + 1} and ${hiIdx + 1} of ${B} (percentile bootstrap, so the tails are coarse)`;
  dimension_pairwise.push({ a: x, b: y, dimension: k, difference: r2(subjects[x].dimensions[k] - subjects[y].dimensions[k]), interval95: [r2(lo), r2(hi)], separated: lo > 0 || hi < 0, bonferroni_separated: loB > 0 || hiB < 0, bonferroni_note });
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
// (first-pilot shape only; the explicit-judge-set shape reports judge_validity from operations/judge-validity*.json)
if (!LOCAL) { const { readdirSync } = await import("node:fs");
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
// Explicit-judge-set shape: counts from the ledgers, the maps and subject-run-summary.json. Each count is derived, none typed.
function localOperations() {
  const baseOf = (id) => id.replace(/-rerun\d+$/, "").replace(/s?h\d$/, "");
  const map = lines("judge-batches.map.tsv").map((l) => l.split(TAB)); // id, judge, name, delivery, bytes
  const judgeOfBase = Object.fromEntries(map.map((c) => [c[0], c[1]]));
  const deliveryOf = Object.fromEntries(map.map((c) => [c[0], c[3]]));
  const ok = ledger.filter((r) => r[2] === "ok");
  const bad = ledger.filter((r) => r[2] !== "ok");
  const okIds = ok.map((r) => r[0]);
  const halfOk = okIds.filter((id) => /h\d$/.test(id));
  const basesWithHalves = [...new Set(halfOk.map(baseOf))].sort();
  const redelivered = [...new Set(bad.map((r) => baseOf(r[0])))].filter((b) => basesWithHalves.includes(b)).sort();
  const plannedHalves = basesWithHalves.filter((b) => deliveryOf[b] === "split2");
  const rq = lines("reroute-batches.ledger.tsv").map((l) => l.split(TAB));
  const rqMap = lines("reroute-batches.map.tsv").map((l) => l.split(TAB));
  const rkey = JSON.parse(readFileSync(join(R, "keys", "judge-key.reroute.json"), "utf8"));
  const sum = JSON.parse(readFileSync(join(opsDir, "subject-run-summary.json"), "utf8"));
  const requotedByJudge = {};
  for (const r of rkey.responses) for (const [j, p] of Object.entries(r.judge_provenance ?? {})) if (p === "requoted") requotedByJudge[j] = (requotedByJudge[j] ?? 0) + 1;
  const wholeAccepted = okIds.filter((id) => !/h\d$/.test(id)).length;
  const countBy = (xs) => xs.reduce((a, x) => ((a[x] = (a[x] ?? 0) + 1), a), {});
  return {
    source: "research/model-runs/" + RUN + "/operations/",
    judge_batches: map.length,
    judge_batches_planned_as_two_halves_before_any_rating: plannedHalves.length,
    judge_calls_planned: map.length - plannedHalves.length + 2 * plannedHalves.length,
    judge_calls_planned_note: "one call per batch, except that each batch planned as two halves is two calls",
    judge_batches_redelivered_as_two_halves_after_incomplete_answers: redelivered,
    judge_calls_accepted: ok.length,
    judge_calls_accepted_whole: wholeAccepted,
    judge_calls_accepted_halves: halfOk.length,
    judge_calls_accepted_note: "planned calls, plus one extra because a batch re-delivered as two halves replaced the one whole call that was planned for it",
    judge_calls_not_two_tool_calls_but_accepted: ok.filter((r) => r[1] !== "2").length,
    judge_calls_voided: bad.length,
    judge_voids_by_reason: countBy(bad.map((r) => r[2])),
    judge_voids_by_judge: countBy(bad.map((r) => judgeOfBase[baseOf(r[0])] ?? "unknown")),
    judge_voids_by_batch: countBy(bad.map((r) => baseOf(r[0]))),
    judge_files_voided: lines("judge-batches.voided.txt").length,
    requote_batches: rqMap.length,
    requote_calls_accepted: rq.filter((r) => r[2] === "ok").length,
    requote_calls_voided: rq.filter((r) => r[2] !== "ok").length,
    ratings_requoted: rkey.summary.ratings_requoted,
    ratings_requoted_by_judge: requotedByJudge,
    ratings_rerouted: rkey.summary.ratings_rerouted,
    subject_replies: Object.fromEntries(Object.entries(sum.per_subject).map(([s, p]) => [s, {
      planned: p.planned, ok: p.ok, failed: p.failed, missing: p.missing,
      attempts_total: p.total_attempts, retries_used: p.total_attempts - p.ok - p.failed,
      failed_or_missing_rate: sum.verdicts[s].failed_or_missing_rate,
      section_9_throughput: sum.verdicts[s].section_9_throughput,
      replies_flagged_by_reply_side_phrase_check: p.reply_leak_flagged,
    }])),
    subject_run_complete: sum.complete,
  };
}
const operations = LOCAL ? localOperations() : {
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
  const bridgeIds = new Set((key.bridge?.entries ?? []).map((e) => e.response_id)); // bridge ratings never enter a composite
  const orig = [];
  for (const f of readdirSyncSafe(join(R, "judge-answers"))) {
    const judge = f.split("__")[0];
    for (const r of JSON.parse(readFileSync(join(R, "judge-answers", f), "utf8")).ratings) {
      const m = meta.get(r.response_id);
      if (!m && bridgeIds.has(r.response_id)) continue;
      if (!m) throw new Error(`sensitivity: response ${r.response_id} not in key`);
      orig.push({ s: m.subject, item: m.item_id, trial: m.trial, judge, rating: r.rating_1_5 });
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
    question: LOCAL ? "Does the primary result depend on the requote round (the ratings re-asked of the same judge after the quote check)?" : "Do the separation findings depend on excluding claude-haiku as a judge?",
    method: LOCAL ? "The ORIGINAL answers only (judge-answers/, before any requote), same routing, same scorer and bootstrap seed. No judge was excluded in this run. Descriptive only." : "Original routing before exclusion/re-routing/requotes; excluded judge's ratings retained; same scorer and bootstrap seed. Descriptive only.",
    note: LOCAL ? "Only the requoted ratings can differ between this view and the primary one; every other rating is the same file entry. The pre-registered requote re-asks the same judge, so a rating may or may not change." : "The judge exclusion cannot affect claude-haiku as a SUBJECT (it never judged itself, so its judges are the same in both routings). Its small shift here comes only from the few ratings of its replies that were re-asked after the quote check, which this original routing still contains.",
    ratings_used: orig.length,
    ...(LOCAL ? {
      // Original rating vs the rating the primary analysis uses, matched on (subject, item, trial, judge).
      ratings_whose_value_differs_from_the_original: orig.filter((o) => {
        const f = rows.find((r) => r.s === o.s && r.item === o.item && r.trial === o.trial && r.judge === o.judge);
        if (!f) throw new Error(`sensitivity: no final rating for ${o.s} ${o.item} trial ${o.trial} ${o.judge}`);
        return f.rating !== o.rating;
      }).length,
    } : {}),
    subjects: Object.fromEntries(SUBJ.map((s) => [s, { pilot_composite: r1(point[s]), interval95: ci(bs[s]) }])),
    pairwise: prs,
    separation_pattern_unchanged: same,
  };
})();
function readdirSyncSafe(d) { return readdirSync(d).filter((f) => f.endsWith(".answers.json")).sort(); }

// ---- explicit-judge-set shape only: validity, bridge drift, deviations, self-identifying replies -------------------
const sha256File = (f) => createHash("sha256").update(readFileSync(f)).digest("hex");
const local = LOCAL ? (() => {
  const readOps = (f) => JSON.parse(readFileSync(join(opsDir, f), "utf8"));
  // Judge validity: read from the measurements bin/judge-validity.mjs wrote; nothing is re-derived here, but the totals are checked.
  const finalV = readOps("judge-validity.json"), origV = readOps("judge-validity.originals.json");
  const shape = (v, file, role) => {
    const total = Object.values(v.judges).reduce((a, j) => a + j.ratings, 0);
    if (total !== rows.length || v.ratings_measured !== rows.length) throw new Error(`${file}: measured ${v.ratings_measured} ratings, the scorer rows number ${rows.length}`);
    return {
      role, source: "research/model-runs/" + RUN + "/operations/" + file, generated_at: v.generated_at,
      threshold_percent: v.rule.max_unfound_quote_rate_percent, ratings_measured: v.ratings_measured, ratings_sha256: v.ratings_sha256,
      pairs_superseded_by_a_later_file: v.pairs_superseded_by_a_later_file,
      judges: Object.fromEntries(Object.entries(v.judges).map(([j, x]) => [j, {
        ratings: x.ratings, found_as_written: x.found_as_written, found_after_normalisation_only: x.found_after_normalisation_only,
        unfound: x.unfound, unfound_rate_percent: r3(x.unfound_rate_percent), verdict: x.verdict,
      }])),
      failing_judges: v.failing_judges, run_verdict: v.run_verdict,
    };
  };
  const judge_validity = {
    rule: "PREREGISTRATION.md section 5: a judge whose unfound-quote rate (shared normaliser) is strictly greater than the threshold is excluded for the whole run",
    reported_as_headline: "measured_on_original_answers",
    headline_note: "Reported first because it is the conservative reading: it is measured before the requote round replaced any quote. Section 5 as clarified by D1 states the rate is measured on the final quotes, so measured_on_final_quotes is the pre-registered measurement basis; the verdict is identical on both.",
    measured_on_original_answers: shape(origV, "judge-validity.originals.json", "before any requote"),
    measured_on_final_quotes: shape(finalV, "judge-validity.json", "after the requote round (the D1 basis)"),
    judges_excluded: [...(JSON.parse(readFileSync(join(R, "keys", "judge-key.reroute.json"), "utf8")).excluded_judges)],
  };

  // Bridge drift: the library's own function over the SAME validated ratings the finish phase used.
  const rkeyFile = join(R, "keys", "judge-key.reroute.json");
  const { judgeKey, responsesById } = asm.loadInputs(join(R, "keys"), rkeyFile);
  const bridgeById = asm.bridgeTexts(judgeKey);
  const loaded = jans.loadRoutedAnswers({ routingKey: judgeKey, dirs: [join(R, "judge-answers"), join(R, "judge-answers-reroute")], responsesById, bridgeById });
  if (loaded.errors.length > 0) throw new Error(`bridge: judge answers did not validate: ${loaded.errors.slice(0, 3).join("; ")}`);
  const drift = brg.bridgeDrift({ bridgeEntries: [...bridgeById.values()], bridgeRatings: loaded.bridgeRatings, excludedJudges: judgeKey.excluded_judges ?? [] });
  const newBy = new Map(loaded.bridgeRatings.map((x) => [`${x.response_id}|${x.judge}`, x.rating_1_5]));
  const signed = {};
  for (const e of bridgeById.values()) for (const j of e.judges) (signed[j] ??= []).push(newBy.get(`${e.response_id}|${j}`) - e.original_ratings[j]);
  const bridge_drift = {
    note: `Descriptive only (PREREGISTRATION.md section 6). ${bridgeById.size} first-pilot replies, ${CFG.bridge.per_source_subject} per first-pilot subject, were re-rated in this run's batches by the judge(s) of this run that rated them in the first pilot. Bridge ratings are in no composite of either run. Different day, different session, same judge model label; the first-pilot rating is the original.`,
    replies: bridgeById.size,
    pairs: drift.overall.pairs,
    mean_abs_difference: r3(drift.overall.mean_abs_difference),
    max_abs_difference: drift.overall.max_abs_difference,
    exact_match: drift.overall.exact_match,
    per_judge: Object.fromEntries(Object.entries(drift.per_judge).map(([j, x]) => [j, {
      pairs: x.pairs, mean_abs_difference: r3(x.mean_abs_difference), max_abs_difference: x.max_abs_difference, exact_match: x.exact_match,
      mean_signed_difference_new_minus_original: r3(mean(signed[j])),
    }])),
    ratings_of_excluded_judges_ignored: drift.ratings_of_excluded_judges_ignored,
    source_run: judgeKey.bridge.source_run, seed: judgeKey.bridge.seed,
  };

  // Deviations: parsed from the pre-registration's own append-only section (id, date, title), never retyped.
  const prereg = join(R, "PREREGISTRATION.md");
  const text = readFileSync(prereg, "utf8");
  const after = text.slice(text.indexOf("## Deviations"));
  const deviations = after.split(NL).map((l) => /^- \*\*(\S+), (D\d+) — (.*?)\*\*/.exec(l)).filter(Boolean).map((m) => ({ id: m[2], date: m[1], title: m[3].replace(/[.]$/, "") }));
  if (deviations.length === 0) throw new Error("no deviations parsed from PREREGISTRATION.md; the section heading or line format changed");

  // Replies whose text names their own model or developer (config identity_terms). They are scored like every other reply.
  const okey = JSON.parse(readFileSync(join(R, "keys", "judge-key.json"), "utf8"));
  const sid = new Set(okey.self_identifying_response_ids ?? []);
  const self_identifying_replies = {
    note: "Replies whose text contains one of the subject's identity_terms from run-config.json. A judge could infer the developer from such a reply, so blinding is weaker for these. They are scored like every other reply.",
    count: sid.size,
    by_subject: Object.fromEntries(SUBJ.map((s) => [s, okey.responses.filter((r) => r.subject === s && sid.has(r.response_id)).length])),
    replies: okey.responses.filter((r) => sid.has(r.response_id)).map((r) => ({ subject: r.subject, item_id: r.item_id, trial: r.trial })),
  };
  return { judge_validity, bridge_drift, deviations, self_identifying_replies, preregistration_sha256: sha256File(prereg) };
})() : null;

const families = LOCAL ? [...new Set(CFG.judges.map((j) => j.family))].sort() : null;
const out = {
  run_id: RUN,
  generated_by: "research/model-runs/bin/analyze-pilot.mjs",
  status: "UNOFFICIAL PILOT — official:false, comparability:none on every scorecard",
  design: {
    subjects: SUBJ, access_tier: LOCAL ? SKEY.access_tier : "agent (Claude Code subagent; snapshot id unverifiable)",
    items_served: items.length, trials_per_subject: 3, responses: rows.length / 2, ratings: rows.length,
    judges_per_response: 2, self_judging: false,
    judge_family: LOCAL ? `all ${families.join("/")} family; no subject is in the judges' family (cross-family)` : "same family as subjects (all Claude)",
    excluded_judges: LOCAL ? local.judge_validity.judges_excluded : (ex?.judge_exclusion?.excluded_judges ?? (() => { throw new Error("no exclusion record in audit"); })()),
    bank_version: audit[SUBJ[0]].bank_version,
    ...(LOCAL ? {
      judges: CFG.judges.map((j) => j.label),
      subject_builds: Object.fromEntries(CFG.subjects.map((s) => [s.label, { tag: s.tag, digest_sha256: s.digest, family: s.family }])),
      conversation_per_item: "fresh conversation per (item, trial); one user turn, prompt text only",
      crisis_items_served: false,
      preregistration_sha256: local.preregistration_sha256,
    } : {}),
  },
  method: {
    composite: "computeCompositeFromDimensions (unmodified), dimension = mean of item means",
    interval: `item resampling stratified by dimension, paired across subjects, ${B} replicates, seed ${SEED}`,
    length: "within-item centred log(words) regression",
    ...(LOCAL ? { dimension_ratings_source: "scorecards finished by the cb-probe MCP server over stdio (mcp-scorecards/<subject>/scorecard.json) and their response-level mcp-rating-map.json; the composite is recomputed here from the rating rows and must equal the server's composite and dimension means" } : {}),
  },
  subjects, pairwise: pairs,
  ...(LOCAL ? { primary_comparison: { definition: `${SUBJ[0]} minus ${SUBJ[1]}, composite, item-resampling 95% interval; separated = the interval excludes zero (PREREGISTRATION.md sections 1 and 8)`, ...pairs[0] } } : {}),
  dimension_pairwise,
  dimension_pairwise_note: LOCAL
    ? `${dimension_pairwise.length} dimension-level comparisons at 95% each: about ${(dimension_pairwise.length * 0.05).toFixed(1)} would be flagged 'separated' by chance alone even if no model differed. Uncorrected; a dimension-level 'separated' flag is not evidence of a real difference unless it also survives the Bonferroni-corrected interval (bonferroni_separated), here over ${dimension_pairwise.length} comparisons.`
    : `${dimension_pairwise.length} dimension-level comparisons at 95% each: about ${Math.round(dimension_pairwise.length * 0.05)} would be flagged 'separated' by chance alone even if no model differed. Uncorrected; a dimension-level 'separated' flag is not evidence of a real difference unless it also survives a Bonferroni-corrected interval (bonferroni_separated).`,
  length: {
    pooled_within_item_slope: r3(pooledSlope), pooled_within_item_r: r3(sxy / Math.sqrt(sxx * syy)), within_subject_slopes: within, composite_if_pooled_slope_removed: adjusted,
    note: LOCAL
      ? "Removing the pooled within-item slope assumes every rating difference that goes with reply length is caused by length. That is an extreme assumption, so the result is a bound, not an estimate. Read composite_if_pooled_slope_removed against each subject's composite; this note makes no claim about whether a gap closes."
      : "Removing the pooled within-item slope assumes every rating difference that goes with reply length is caused by length. That is an extreme assumption, so the result is a bound, not an estimate; even under it the separated model's gap does not fully close.",
  },
  judges,
  quote_grounding: LOCAL ? undefined : quote_grounding,
  operations,
  sensitivity,
  // measured_original_answer_stats is dropped: it used a broader normalisation and counted final (re-run) files,
  // so it disagreed with quote_grounding (the canonical figure). See pilot record addendum 2026-10-01.
  exclusion_record: LOCAL ? undefined : (() => {
    const { measured_original_answer_stats, routing_key_file, ...rest } = ex?.judge_exclusion?.exclusion_record ?? {};
    const stale = "Measured counts are in measured_original_answer_stats.";
    if (typeof rest.reason === "string" && rest.reason.includes(stale)) rest.reason = rest.reason.replace(stale, "Canonical counts: quote_grounding in this file.");
    return rest;
  })(),
  routing: Object.fromEntries(SUBJ.map((s) => [s, { responses_by_judge_pair: audit[s].judge_routing.responses_by_judge_pair, ratings_by_provenance: audit[s].judge_routing.ratings_by_provenance }])),
  ...(LOCAL ? {
    judge_validity: local.judge_validity,
    bridge_drift: local.bridge_drift,
    self_identifying_replies: local.self_identifying_replies,
    deviations: local.deviations,
  } : {}),
};
writeFileSync(join(R, "analysis.json"), JSON.stringify(out, null, 2) + "\n");
console.log(`wrote ${join(R, "analysis.json")}`);
for (const s of SUBJ) console.log(`  ${s.padEnd(14)} ${subjects[s].composite}  [${subjects[s].interval95.join(", ")}]`);
for (const p of pairs) console.log(`  ${p.a} − ${p.b}: ${p.difference} [${p.interval95.join(", ")}] ${p.separated ? "SEPARATED" : "not separated"}`);
