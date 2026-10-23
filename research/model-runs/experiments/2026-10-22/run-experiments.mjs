#!/usr/bin/env node
/**
 * run-experiments.mjs: D-60 Stream C instrument experiments E1-E6 on pilot data.
 *
 *   node research/model-runs/experiments/2026-10-22/run-experiments.mjs
 *
 * Plan: PREREGISTRATION.md in this folder (sha256 in PREREG_HASH.txt). Writes results.json in this folder only.
 * Read-only on every pilot file. Deterministic: fixed seeds, sorted keys, no clock, 4-decimal rounding.
 * INTERNAL: pilot data, unofficial, not a score, comparability none. No model point, no ordering of models.
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..", "..", "..", "..");
const RUNS = join(ROOT, "research", "model-runs");
const P3 = join(RUNS, "pilot-2026-10-03");
const P2 = join(RUNS, "pilot-2026-10-02");
const B = 1000;
const NPERM = 2000;
const NL = String.fromCharCode(10);
const TAB = String.fromCharCode(9);

const { computeCompositeFromDimensions } = await import(pathToFileURL(join(ROOT, "site", "scripts", "lib", "scoring.mjs")).href);
const { pairedBootstrap } = await import(pathToFileURL(join(RUNS, "lib", "paired-bootstrap.mjs")).href);
const asm = await import(pathToFileURL(join(RUNS, "lib", "assemble.mjs")).href);
const jans = await import(pathToFileURL(join(RUNS, "lib", "judge-answers.mjs")).href);
const brg = await import(pathToFileURL(join(RUNS, "lib", "bridge.mjs")).href);

// ---------- helpers ----------
const readJson = (f) => JSON.parse(readFileSync(f, "utf8"));
const sha = (buf) => createHash("sha256").update(buf).digest("hex");
const shaFile = (f) => sha(readFileSync(f));
const shaDir = (d, filter = () => true) => sha(readdirSync(d).filter(filter).sort().map((f) => `${f}:${shaFile(join(d, f))}`).join(NL));
const mean = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;
const r4 = (x) => (x === null || x === undefined || Number.isNaN(x) ? null : Math.round(x * 10000) / 10000);
const r1 = (x) => Math.round(x * 10) / 10;
const comp = (d) => { const c = computeCompositeFromDimensions(d); return typeof c === "number" ? c : c.composite ?? c.score; };
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const pct = (xs, q) => { const t = [...xs].sort((a, b) => a - b); return t[Math.floor(q * t.length)]; };
const ci95 = (xs) => { const t = [...xs].sort((a, b) => a - b); return [t[Math.floor(0.025 * t.length)], t[Math.floor(0.975 * t.length)]]; };
const excludes0 = ([lo, hi]) => lo > 0 || hi < 0;
const median = (xs) => { const t = [...xs].sort((a, b) => a - b); const n = t.length; return n % 2 ? t[(n - 1) / 2] : (t[n / 2 - 1] + t[n / 2]) / 2; };
const dist = (xs) => { const v = xs.filter((x) => x !== null && !Number.isNaN(x)); return v.length ? { min: r4(Math.min(...v)), median: r4(median(v)), max: r4(Math.max(...v)), n: v.length } : { n: 0 }; };
const pearson = (x, y) => {
  const mx = mean(x), my = mean(y);
  let sxy = 0, sxx = 0, syy = 0;
  for (let k = 0; k < x.length; k++) { sxy += (x[k] - mx) * (y[k] - my); sxx += (x[k] - mx) ** 2; syy += (y[k] - my) ** 2; }
  return sxx === 0 || syy === 0 ? null : sxy / Math.sqrt(sxx * syy);
};
const olsSlope = (x, y) => { // with intercept
  const mx = mean(x), my = mean(y);
  let sxy = 0, sxx = 0;
  for (let k = 0; k < x.length; k++) { sxy += (x[k] - mx) * (y[k] - my); sxx += (x[k] - mx) ** 2; }
  return sxx === 0 ? null : sxy / sxx;
};
const thruOrigin = (x, y) => { let sxy = 0, sxx = 0; for (let k = 0; k < x.length; k++) { sxy += x[k] * y[k]; sxx += x[k] * x[k]; } return sxx === 0 ? null : sxy / sxx; };
function sortKeys(v) {
  if (Array.isArray(v)) return v.map(sortKeys);
  if (v && typeof v === "object") return Object.fromEntries(Object.keys(v).sort().map((k) => [k, sortKeys(v[k])]));
  return v;
}

// ---------- load pilot-3 ----------
const CFG = readJson(join(P3, "run-config.json"));
const SUBJ = CFG.subjects.map((s) => s.label).sort();
const ARM = Object.fromEntries(CFG.subjects.map((s) => [s.label, s.arm]));
const TRIALS = Object.fromEntries(CFG.subjects.map((s) => [s.label, s.trials ?? CFG.trials]));
const JUDGES = CFG.judges.map((j) => j.label).sort();
const DIMS = ["AWR", "EMP", "ACT", "EQU", "BND", "ACC", "SYS", "INT"];
const bank = readJson(join(ROOT, "site", "src", "data", "model-benchmark", "tasks-v1.json"));
const dimOf = Object.fromEntries(bank.items.map((i) => [i.id, i.dimension]));
const ing = readJson(join(P3, "keys", "ingested", "answers.json"));
const words = new Map(ing.responses.map((r) => [`${r.subject}|${r.trial}|${r.item_id}`, r.response.trim().split(/\s+/).length]));

const rows = [];
for (const s of SUBJ) {
  const map = readJson(join(P3, "mcp-scorecards", s, "mcp-rating-map.json"));
  if (map.subject !== s) throw new Error(`rating map subject mismatch for ${s}`);
  for (const m of map.rows) {
    const len = words.get(`${s}|${m.subject_trial}|${m.item_id}`);
    if (len === undefined) throw new Error(`no reply text for ${s} ${m.subject_trial} ${m.item_id}`);
    rows.push({ s, item: m.item_id, dim: dimOf[m.item_id], trial: m.subject_trial, judge: m.judge, rating: m.rating_1_5, rid: m.response_id, len, x: Math.log(len) });
  }
}
const ITEMS = [...new Set(rows.map((r) => r.item))].sort();
const byDim = Object.fromEntries(DIMS.map((d) => [d, ITEMS.filter((i) => dimOf[i] === d)]));
// replies
const replyMap = new Map();
for (const r of rows) {
  const k = r.rid;
  if (!replyMap.has(k)) replyMap.set(k, { rid: k, s: r.s, item: r.item, trial: r.trial, len: r.len, x: r.x, ratings: {} });
  const rep = replyMap.get(k);
  if (rep.ratings[r.judge] !== undefined) throw new Error(`duplicate judge on reply ${k}`);
  rep.ratings[r.judge] = r.rating;
}
const replies = [...replyMap.values()].sort((a, b) => (a.s + "|" + a.item + "|" + a.trial).localeCompare(b.s + "|" + b.item + "|" + b.trial));
for (const rp of replies) if (Object.keys(rp.ratings).length !== 2) throw new Error(`reply ${rp.rid} has ${Object.keys(rp.ratings).length} ratings`);
const repliesBySI = new Map(); // `${s}|${item}` -> replies
for (const rp of replies) { const k = `${rp.s}|${rp.item}`; if (!repliesBySI.has(k)) repliesBySI.set(k, []); repliesBySI.get(k).push(rp); }
const repliesByItem = new Map(ITEMS.map((i) => [i, replies.filter((r) => r.item === i)]));
const rowsByItem = new Map(ITEMS.map((i) => [i, rows.filter((r) => r.item === i)]));

const LABEL = "pilot data, unofficial, not a score, comparability none. INTERNAL (PRD FDM-1).";
const results = {
  label: LABEL,
  preregistration: { file: "PREREGISTRATION.md", sha256: shaFile(join(HERE, "PREREGISTRATION.md")) },
  inputs: {
    pilot3_rating_maps_sha256: Object.fromEntries(SUBJ.map((s) => [s, shaFile(join(P3, "mcp-scorecards", s, "mcp-rating-map.json"))])),
    pilot3_ingested_answers_sha256: shaFile(join(P3, "keys", "ingested", "answers.json")),
    pilot3_judge_key_sha256: shaFile(join(P3, "keys", "judge-key.json")),
    pilot3_judge_key_reroute2_sha256: shaFile(join(P3, "keys", "judge-key.reroute-2.json")),
    pilot3_judge_answers_dir_sha256: shaDir(join(P3, "judge-answers")),
    pilot3_judge_batches_dir_sha256: shaDir(join(P3, "judge-batches"), (f) => f.endsWith(".json")),
    pilot3_run_config_sha256: shaFile(join(P3, "run-config.json")),
    pilot3_analysis_sha256: shaFile(join(P3, "analysis.json")),
    pilot2_judge_key_reroute_sha256: shaFile(join(P2, "keys", "judge-key.reroute.json")),
    bank_sha256: shaFile(join(ROOT, "site", "src", "data", "model-benchmark", "tasks-v1.json")),
  },
  design: { subjects_alphabetical: SUBJ, judges: JUDGES, items: ITEMS.length, replies: replies.length, ratings: rows.length, bootstrap_replicates: B, permutations: NPERM, judge_family: "all claude (no cross-family check possible)" },
};

// ================= E1: position within batch =================
{
  const key = readJson(join(P3, "keys", "judge-key.json"));
  const meta = new Map(key.responses.map((r) => [r.response_id, r]));
  const bridgeIds = new Set((key.bridge?.entries ?? []).map((e) => e.response_id));
  const obs = [];
  let bridgeEntriesSkipped = 0;
  const batchSizes = [];
  for (const f of readdirSync(join(P3, "judge-answers")).filter((x) => x.endsWith(".answers.json")).sort()) {
    const judge = f.split("__")[0];
    const name = f.replace(".answers.json", "");
    const batch = readJson(join(P3, "judge-batches", name + ".json"));
    const ans = readJson(join(P3, "judge-answers", f));
    const rat = new Map(ans.ratings.map((r) => [r.response_id, r.rating_1_5]));
    batchSizes.push(batch.entries.length);
    batch.entries.forEach((e, k) => {
      if (bridgeIds.has(e.response_id)) { bridgeEntriesSkipped++; return; }
      const m = meta.get(e.response_id);
      if (!m) throw new Error(`E1: ${e.response_id} not in key`);
      const rating = rat.get(e.response_id);
      if (rating === undefined) throw new Error(`E1: no original rating for ${e.response_id} in ${f}`);
      obs.push({ judge, batch: name, pos: k + 1, s: m.subject, item: m.item_id, rating });
    });
  }
  // additive item + subject adjustment over all original main ratings
  const grand = mean(obs.map((o) => o.rating));
  const im = {}, sm = {};
  for (const i of ITEMS) im[i] = mean(obs.filter((o) => o.item === i).map((o) => o.rating));
  for (const s of SUBJ) sm[s] = mean(obs.filter((o) => o.s === s).map((o) => o.rating));
  for (const o of obs) o.e = o.rating - im[o.item] - sm[o.s] + grand;
  // half-delivered batches (sensitivity)
  const lines = (f) => readFileSync(join(P3, "operations", f), "utf8").trim().split(NL).filter(Boolean).map((l) => l.split(TAB));
  const map = lines("judge-batches.map.tsv");
  const ledger = lines("judge-batches.ledger.tsv");
  const baseOf = (id) => id.replace(/-rerun\d+$/, "").replace(/s?h\d$/, "");
  const halfBases = new Set(ledger.filter((r) => r[2] === "ok" && /h\d$/.test(r[0])).map((r) => baseOf(r[0])));
  for (const c of map) if (c[3] === "split2") halfBases.add(c[0]);
  const halfNames = new Set(map.filter((c) => halfBases.has(c[0])).map((c) => c[2]));

  const rng = mulberry32(20261101);
  const testJudge = (subset) => {
    const byBatch = new Map();
    for (const o of subset) { if (!byBatch.has(o.batch)) byBatch.set(o.batch, []); byBatch.get(o.batch).push(o); }
    const batches = [...byBatch.keys()].sort().map((b) => byBatch.get(b));
    const pos = batches.flat().map((o) => o.pos);
    const n = pos.length, mp = mean(pos), Sxx = pos.reduce((a, p) => a + (p - mp) ** 2, 0);
    const es = batches.map((bt) => bt.map((o) => o.e));
    const me = mean(es.flat());
    const slopeOf = (eArr) => { let sp = 0, k = 0; for (let bi = 0; bi < batches.length; bi++) for (let j = 0; j < batches[bi].length; j++) { sp += batches[bi][j].pos * eArr[bi][j]; k++; } return (sp - n * mp * me) / Sxx; };
    const obsSlope = slopeOf(es);
    const perm = [];
    let ge = 0;
    for (let p = 0; p < NPERM; p++) {
      const pe = es.map((arr) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; });
      const sl = slopeOf(pe);
      perm.push(sl * 15);
      if (Math.abs(sl) >= Math.abs(obsSlope) - 1e-12) ge++;
    }
    const bins = [[1, 4], [5, 8], [9, 12], [13, 16]].map(([a, b]) => { const v = subset.filter((o) => o.pos >= a && o.pos <= b).map((o) => o.e); return { bin: `${a}-${b}`, n: v.length, mean_residual: v.length ? r4(mean(v)) : null }; });
    const p = (ge + 1) / (NPERM + 1);
    const effect = obsSlope * 15;
    return {
      n_ratings: n, n_batches: batches.length,
      slope_per_position: r4(obsSlope), effect_over_batch_slope_x15: r4(effect),
      permutation_p_two_sided: r4(p),
      null_band_slope_x15_2_5_to_97_5: [r4(pct(perm, 0.025)), r4(pct(perm, 0.975))],
      bins,
      verdict: p < 0.05 / 3 && Math.abs(effect) >= 0.10 ? "present" : "not detected",
    };
  };
  const per_judge = {}, sensitivity = {};
  for (const j of JUDGES) per_judge[j] = testJudge(obs.filter((o) => o.judge === j));
  for (const j of JUDGES) sensitivity[j] = testJudge(obs.filter((o) => o.judge === j && !halfNames.has(o.batch)));
  results.E1 = {
    question: "Does a rating depend on its position in the judge batch, after item and subject effects?",
    data: { batches: batchSizes.length, batch_size_distribution: dist(batchSizes), main_ratings: obs.length, bridge_entries_skipped: bridgeEntriesSkipped, batches_delivered_as_halves_excluded_in_sensitivity: halfNames.size },
    rule: "present if permutation p < 0.05/3 and |slope x 15| >= 0.10 rating points",
    per_judge, sensitivity_excluding_half_delivered_batches: sensitivity,
    any_present: JUDGES.some((j) => per_judge[j].verdict === "present"),
  };
}

// ================= E2: leniency and agreement noise =================
{
  const rng = mulberry32(20261102);
  const pairs = [];
  for (let a = 0; a < JUDGES.length; a++) for (let b = a + 1; b < JUDGES.length; b++) pairs.push([JUDGES[a], JUDGES[b]]);
  // item-clustered bootstrap draws (shared by all E2 statistics)
  const draws = [];
  for (let b = 0; b < B; b++) draws.push(ITEMS.map(() => ITEMS[Math.floor(rng() * ITEMS.length)]));
  const statOver = (itemList, fn) => fn(itemList.flatMap((i) => repliesByItem.get(i)));
  const pairStat = (ja, jb) => (reps) => { const v = reps.filter((r) => r.ratings[ja] !== undefined && r.ratings[jb] !== undefined).map((r) => r.ratings[ja] - r.ratings[jb]); return v.length ? mean(v) : NaN; };
  const judgeStat = (j) => (reps) => { const v = reps.filter((r) => r.ratings[j] !== undefined).map((r) => { const other = Object.keys(r.ratings).find((k) => k !== j); return r.ratings[j] - r.ratings[other]; }); return v.length ? mean(v) : NaN; };
  const summarise = (fn) => {
    const point = statOver(ITEMS, fn);
    const bs = draws.map((d) => statOver(d, fn)).filter((x) => !Number.isNaN(x));
    const ci = ci95(bs);
    const v = excludes0(ci) ? (Math.abs(point) >= 0.10 ? "lenient or severe" : "detectable but small") : "not detected";
    return { mean_signed: r4(point), interval95: [r4(ci[0]), r4(ci[1])], verdict: v };
  };
  const pair_signed = {};
  for (const [a, b] of pairs) pair_signed[`${a} minus ${b}`] = { replies: replies.filter((r) => r.ratings[a] !== undefined && r.ratings[b] !== undefined).length, ...summarise(pairStat(a, b)) };
  const judge_signed_vs_other = {};
  for (const j of JUDGES) judge_signed_vs_other[j] = { replies: replies.filter((r) => r.ratings[j] !== undefined).length, ...summarise(judgeStat(j)) };

  // per-subject exact agreement, item-clustered, paired draws
  const exactOf = (rp) => { const v = Object.values(rp.ratings); return v[0] === v[1] ? 1 : 0; };
  const agreeFor = (s, itemList) => { let e = 0, n = 0; for (const i of itemList) for (const rp of repliesBySI.get(`${s}|${i}`) ?? []) { e += exactOf(rp); n++; } return e / n; };
  const obsAgree = Object.fromEntries(SUBJ.map((s) => [s, agreeFor(s, ITEMS)]));
  const bsAgree = Object.fromEntries(SUBJ.map((s) => [s, draws.map((d) => agreeFor(s, d))]));
  const nRep = Object.fromEntries(SUBJ.map((s) => [s, replies.filter((r) => r.s === s).length]));
  const per_subject = Object.fromEntries(SUBJ.map((s) => { const c = ci95(bsAgree[s]); return [s, { replies: nRep[s], arm: ARM[s], exact: r4(obsAgree[s]), interval95: [r4(c[0]), r4(c[1])], interval_contains_0759: c[0] <= 0.759 && 0.759 <= c[1] }]; }));
  const sortedObs = [...SUBJ].sort((a, b) => obsAgree[a] - obsAgree[b] || a.localeCompare(b));
  const lo = sortedObs[0], hi = sortedObs[sortedObs.length - 1];
  const diffBs = draws.map((_, k) => bsAgree[hi][k] - bsAgree[lo][k]);
  const dci = ci95(diffBs);
  const highest_minus_lowest = { observed_difference: r4(obsAgree[hi] - obsAgree[lo]), interval95: [r4(dci[0]), r4(dci[1])], verdict: excludes0(dci) ? "not within noise" : "within noise", note: "subjects not named in this test" };

  // floor test (binomial, homogeneous panel)
  const totalExact = replies.reduce((a, r) => a + exactOf(r), 0);
  const p0 = totalExact / replies.length;
  const NSIM = 20000;
  let hits = 0;
  const ns = SUBJ.map((s) => nRep[s]);
  for (let k = 0; k < NSIM; k++) {
    let mn = 1;
    for (const n of ns) { let x = 0; for (let t = 0; t < n; t++) if (rng() < p0) x++; mn = Math.min(mn, x / n); }
    if (mn <= 0.759) hits++;
  }
  const P = hits / NSIM;
  const binomLowerQ = (n, p, q) => { // smallest k with P(X<=k) >= q
    let pmf = Math.pow(1 - p, n), cdf = pmf;
    for (let k = 0; k <= n; k++) { if (cdf >= q) return k / n; pmf = pmf * ((n - k) / (k + 1)) * (p / (1 - p)); cdf += pmf; }
    return 1;
  };
  const nValues = [...new Set(ns)].sort((a, b) => a - b);
  results.E2 = {
    question: "Do the judges differ in signed leniency, and is the per-subject exact-agreement range within sampling noise?",
    method: "item-clustered bootstrap (83 items resampled with replacement, all replies of a drawn item kept), B = 1000, seed 20261102; floor test: binomial homogeneous-panel simulation, 20000 waves",
    judge_pair_signed_difference: pair_signed,
    judge_signed_vs_other_judge: judge_signed_vs_other,
    per_subject_exact_agreement_alphabetical: per_subject,
    highest_minus_lowest_exact_agreement: highest_minus_lowest,
    floor_test_O9: {
      proposed_floor: 0.759,
      pooled_exact_p0: r4(p0), pooled_replies: replies.length,
      p_min_of_8_at_or_below_floor_if_homogeneous: r4(P),
      lower_5pct_quantile_under_p0_by_n: Object.fromEntries(nValues.map((n) => [String(n), r4(binomLowerQ(n, p0, 0.05))])),
      verdict: P >= 0.05 ? "fixed floor 0.759 is within the noise of a homogeneous panel (O9 as a fixed number contradicted; propose an n-aware floor)" : "0.759 not explained by sampling noise alone (O9 supported as a sanity floor)",
      caveat: "binomial ignores item clustering, so it understates noise; the item-clustered intervals above are the check",
    },
  };
  results._within_run_mad = mean(replies.map((r) => { const v = Object.values(r.ratings); return Math.abs(v[0] - v[1]); }));
}

// ================= E3: length =================
{
  const rng = mulberry32(20261103);
  const itemMeanX = Object.fromEntries(ITEMS.map((i) => [i, mean(rowsByItem.get(i).map((r) => r.x))]));
  const itemMeanY = Object.fromEntries(ITEMS.map((i) => [i, mean(rowsByItem.get(i).map((r) => r.rating))]));
  const cellRows = new Map();
  for (const r of rows) { if (ARM[r.s] !== "A") continue; const k = `${r.s}|${r.item}`; if (!cellRows.has(k)) cellRows.set(k, []); cellRows.get(k).push(r); }
  const cellMX = {}, cellMY = {};
  for (const [k, rs] of cellRows) { cellMX[k] = mean(rs.map((r) => r.x)); cellMY[k] = mean(rs.map((r) => r.rating)); }
  const draws = [];
  for (let b = 0; b < B; b++) draws.push(ITEMS.map(() => ITEMS[Math.floor(rng() * ITEMS.length)]));
  const slopeFor = (j, itemList, mode) => {
    const xs = [], ys = [];
    for (const i of itemList) for (const r of rowsByItem.get(i)) {
      if (r.judge !== j) continue;
      if (mode === "primary") { xs.push(r.x - itemMeanX[i]); ys.push(r.rating - itemMeanY[i]); }
      else { if (ARM[r.s] !== "A") continue; const k = `${r.s}|${i}`; xs.push(r.x - cellMX[k]); ys.push(r.rating - cellMY[k]); }
    }
    return thruOrigin(xs, ys);
  };
  const per_judge = {};
  for (const j of JUDGES) {
    const out = {};
    for (const mode of ["primary", "secondary"]) {
      const pt = slopeFor(j, ITEMS, mode);
      const bs = draws.map((d) => slopeFor(j, d, mode)).filter((x) => x !== null);
      const c = ci95(bs);
      out[mode] = { slope_rating_per_log_word: r4(pt), interval95: [r4(c[0]), r4(c[1])], excludes_zero: excludes0(c) };
    }
    out.verdict = out.secondary.excludes_zero && Math.abs(out.secondary.slope_rating_per_log_word) >= 0.10 ? "present"
      : out.primary.excludes_zero && !out.secondary.excludes_zero ? "confounded only" : "not detected";
    per_judge[j] = out;
  }
  // exploratory B - A
  const builds = [...new Set(CFG.subjects.map((s) => `${s.tag}@sha256:${s.digest}`))].sort();
  const medianRows = (s) => { const l = rows.filter((r) => r.s === s).map((r) => r.len).sort((a, b) => a - b); return l[l.length >> 1]; };
  const effective = [];
  const per_build_length_check = {};
  for (const b of builds) {
    const a = CFG.subjects.find((s) => `${s.tag}@sha256:${s.digest}` === b && s.arm === "A");
    const bb = CFG.subjects.find((s) => `${s.tag}@sha256:${s.digest}` === b && s.arm === "B");
    const m = /about (\d+) words/.exec(bb.system_message ?? "");
    const target = Number(m[1]);
    const eff = Math.abs(medianRows(bb.label) - target) < Math.abs(medianRows(a.label) - target);
    per_build_length_check[a.label.replace(/-A$/, "")] = { length_instruction: eff ? "effective" : "ineffective" };
    if (eff) effective.push([a.label, bb.label]);
  }
  const dPairs = (pairsList, itemList) => {
    const dR = [], dL = [];
    for (const [a, bb] of pairsList) for (const i of itemList) {
      const ra = rows.filter((r) => r.s === a && r.item === i), rb = rows.filter((r) => r.s === bb && r.item === i);
      dR.push(mean(rb.map((r) => r.rating)) - mean(ra.map((r) => r.rating)));
      dL.push(mean(rb.map((r) => r.x)) - mean(ra.map((r) => r.x)));
    }
    return [dL, dR];
  };
  // precompute per (subject,item) means to keep bootstrap fast
  const siMean = {};
  for (const s of SUBJ) for (const i of ITEMS) { const rs = rows.filter((r) => r.s === s && r.item === i); siMean[`${s}|${i}`] = [mean(rs.map((r) => r.rating)), mean(rs.map((r) => r.x))]; }
  const dFast = (pairsList, itemList) => { const dR = [], dL = []; for (const [a, bb] of pairsList) for (const i of itemList) { dR.push(siMean[`${bb}|${i}`][0] - siMean[`${a}|${i}`][0]); dL.push(siMean[`${bb}|${i}`][1] - siMean[`${a}|${i}`][1]); } return [dL, dR]; };
  void dPairs;
  const expl = {};
  const sets = Object.fromEntries([...effective.map((p) => [p[0].replace(/-A$/, ""), [p]]), ...(effective.length > 1 ? [["pooled_effective_builds", effective]] : [])]);
  for (const [name, pl] of Object.entries(sets)) {
    const [dL, dR] = dFast(pl, ITEMS);
    const sl = olsSlope(dL, dR), rr = pearson(dL, dR);
    const bs = draws.map((d) => { const [x, y] = dFast(pl, d); return olsSlope(x, y); }).filter((x) => x !== null);
    const c = ci95(bs);
    expl[name] = { items: dL.length, slope_dR_on_dL: r4(sl), correlation: r4(rr), slope_interval95: [r4(c[0]), r4(c[1])] };
  }
  results.E3 = {
    question: "Do longer replies get higher ratings within item, per judge?",
    units: "rating points per unit log(words) (one unit = 2.7x length)",
    rule: "present if the within subject-item (secondary, arm A) interval excludes 0 and |slope| >= 0.10; confounded only if primary excludes 0 and secondary does not",
    per_judge,
    any_present: JUDGES.some((j) => per_judge[j].verdict === "present"),
    exploratory_arm_B_minus_A: { note: "exploratory; arms were not designed for this; no mean B-A rating difference is printed (it is a per-model difference point); intercept not printed", length_check_recomputed: per_build_length_check, effective_builds: effective.map((p) => p[0].replace(/-A$/, "")), results: expl },
  };
}

// ================= E4: items =================
{
  const units = [];
  for (const s of SUBJ) for (let t = 1; t <= TRIALS[s]; t++) units.push([s, t]);
  const replyRating = new Map(replies.map((r) => [`${r.s}|${r.trial}|${r.item}`, mean(Object.values(r.ratings))]));
  const unitMeanAll = new Map(units.map(([s, t]) => { const v = ITEMS.map((i) => replyRating.get(`${s}|${t}|${i}`)); return [`${s}|${t}`, v]; }));
  const armA = SUBJ.filter((s) => ARM[s] === "A");
  const popVar = (xs) => { const m = mean(xs); return mean(xs.map((x) => (x - m) ** 2)); };
  const items = {};
  for (const [idx, i] of ITEMS.entries()) {
    const rs = rowsByItem.get(i), reps = repliesByItem.get(i);
    const ratings = rs.map((r) => r.rating);
    const siM = (s) => mean(rs.filter((r) => r.s === s).map((r) => r.rating));
    const vbA = popVar(armA.map(siM)), vbAll = popVar(SUBJ.map(siM));
    const vw = mean(reps.map((r) => { const v = Object.values(r.ratings); return (v[0] - v[1]) ** 2 / 2; }));
    const mad = mean(reps.map((r) => { const v = Object.values(r.ratings); return Math.abs(v[0] - v[1]); }));
    const disc = vw === 0 ? null : vbA / vw;
    const cells = (val) => SUBJ.filter((s) => rs.filter((r) => r.s === s).every((r) => r.rating === val)).length;
    const xi = [], rest = [];
    for (const [s, t] of units) {
      const v = unitMeanAll.get(`${s}|${t}`);
      xi.push(v[idx]);
      const others = v.filter((_, k) => k !== idx);
      rest.push(mean(others));
    }
    const ir = pearson(xi, rest);
    const m = mean(ratings), s5 = ratings.filter((x) => x === 5).length / ratings.length, s1 = ratings.filter((x) => x === 1).length / ratings.length;
    const flags = [];
    if (m >= 4.5 || s5 >= 0.80) flags.push("ceiling");
    if (m <= 1.5 || s1 >= 0.80) flags.push("floor");
    if (vbA < 0.05 || (disc !== null && disc < 1)) flags.push("low_discrimination");
    if (mad >= 0.50) flags.push("judge_disagreement");
    if (ir !== null && ir < 0) flags.push("negative_item_rest");
    items[i] = { dimension: dimOf[i], mean_all: r4(m), share5: r4(s5), share1: r4(s1), var_between_A: r4(vbA), var_between_all: r4(vbAll), var_within_reply: r4(vw), mad_judges: r4(mad), disc_ratio: r4(disc), cells_all5: cells(5), cells_all1: cells(1), item_rest_r: r4(ir), flags };
  }
  const FLAGS = ["ceiling", "floor", "low_discrimination", "judge_disagreement", "negative_item_rest"];
  const flagged = Object.fromEntries(FLAGS.map((f) => [f, ITEMS.filter((i) => items[i].flags.includes(f))]));
  const vals = (k) => ITEMS.map((i) => items[i][k]);
  let cellsAll5 = 0, cellsAll1 = 0;
  for (const s of SUBJ) for (const i of ITEMS) { const v = rows.filter((r) => r.s === s && r.item === i).map((r) => r.rating); if (v.every((x) => x === 5)) cellsAll5++; if (v.every((x) => x === 1)) cellsAll1++; }
  const twoPlus = ITEMS.filter((i) => items[i].flags.length >= 2);
  results.E4 = {
    question: "Which items sit at floor or ceiling or fail to separate builds?",
    note: "item ids only; no prompt or anchor text; pooled over subjects, no per-subject breakdown",
    thresholds: { ceiling: "mean_all >= 4.5 or share5 >= 0.80", floor: "mean_all <= 1.5 or share1 >= 0.80", low_discrimination: "var_between_A < 0.05 or disc_ratio < 1", judge_disagreement: "mad_judges >= 0.50", negative_item_rest: "item_rest_r < 0 over 16 subject-trial units" },
    flag_counts: Object.fromEntries(FLAGS.map((f) => [f, flagged[f].length])),
    flagged_item_ids: flagged,
    items_with_two_or_more_flags: twoPlus,
    distributions: Object.fromEntries(["mean_all", "share5", "share1", "var_between_A", "var_between_all", "var_within_reply", "mad_judges", "disc_ratio", "item_rest_r"].map((k) => [k, dist(vals(k))])),
    pooled_cells: { subject_item_cells: SUBJ.length * ITEMS.length, all_ratings_5: cellsAll5, all_ratings_1: cellsAll1 },
    per_item: items,
  };
}

// ================= E5: interval method =================
{
  const analysis = readJson(join(P3, "analysis.json"));
  const pub = new Map(analysis.comparisons.map((c) => [`${c.a}|${c.b}`, c]));
  const cmpList = CFG.comparisons.map((c) => ({ a: c.a, b: c.b, kind: c.kind }));
  const armAPairs = cmpList.filter((c) => c.kind === "build" && ARM[c.a] === "A" && ARM[c.b] === "A");
  const rowsBySI = new Map();
  for (const r of rows) { const k = `${r.s}|${r.item}`; if (!rowsBySI.has(k)) rowsBySI.set(k, []); rowsBySI.get(k).push(r.rating); }
  const repRatingsBySI = new Map([...repliesBySI].map(([k, reps]) => [k, reps.map((r) => Object.values(r.ratings))]));
  const compFromItemMeans = (fnItemMean, s, pick) => comp(Object.fromEntries(DIMS.map((d) => [d, mean(pick[d].map((i) => fnItemMean(s, i)))])));
  const fixedPick = byDim;
  const runMethod = (method) => {
    const rng = mulberry32(20261105);
    const boots = Object.fromEntries(SUBJ.map((s) => [s, []]));
    for (let b = 0; b < B; b++) {
      const pick = method === "c" ? Object.fromEntries(DIMS.map((d) => [d, byDim[d].map(() => byDim[d][Math.floor(rng() * byDim[d].length)])])) : fixedPick;
      for (const s of SUBJ) {
        const itemMean = (ss, i) => {
          if (method === "a") { const v = rowsBySI.get(`${ss}|${i}`); let t = 0; for (let k = 0; k < v.length; k++) t += v[Math.floor(rng() * v.length)]; return t / v.length; }
          const reps = repRatingsBySI.get(`${ss}|${i}`); let t = 0;
          for (let k = 0; k < reps.length; k++) { const rp = reps[Math.floor(rng() * reps.length)]; t += rp[0] + rp[1]; }
          return t / (2 * reps.length);
        };
        // draw in fixed order dimension by dimension, slot by slot
        boots[s].push(compFromItemMeans(itemMean, s, pick));
      }
    }
    return boots;
  };
  const im = {};
  for (const s of SUBJ) for (const i of ITEMS) im[`${s}|${i}`] = mean(rowsBySI.get(`${s}|${i}`));
  const c0 = pairedBootstrap({ subjects: CFG.subjects.map((s) => s.label), items: ITEMS, dimOf, im, dims: DIMS, seed: CFG.master_seed, B, comp }).boots;
  const M = { a: runMethod("a"), b: runMethod("b"), c: runMethod("c"), c0 };
  const width = (xs) => { const [lo, hi] = ci95(xs); return hi - lo; };
  const per_subject = {};
  const scorecardWidth = {};
  for (const s of SUBJ) {
    const w = Object.fromEntries(Object.entries(M).map(([k, bs]) => [k, width(bs[s])]));
    per_subject[s] = { arm: ARM[s], trials: TRIALS[s], width_a_scorer_rows: r4(w.a), width_b_reply_clustered: r4(w.b), width_c_item_two_stage: r4(w.c), width_c0_item_only_published: r4(w.c0), ratio_a_over_c: r4(w.a / w.c), ratio_b_over_c: r4(w.b / w.c), ratio_c0_over_c: r4(w.c0 / w.c) };
    if (ARM[s] === "A") {
      const sc = readJson(join(P3, "mcp-scorecards", s, "scorecard.json"));
      const ciS = sc.uncertainty?.composite_interval?.ci;
      if (Array.isArray(ciS)) scorecardWidth[s] = { stored_scorecard_trial_interval_width: r4(ciS[1] - ciS[0]), ratio_our_a_over_stored: r4(w.a / (ciS[1] - ciS[0])) };
    }
  }
  // comparisons
  const sepUncorr = (bs, a, b) => { const d = bs[a].map((v, k) => v - bs[b][k]); const t = [...d].sort((x, y) => x - y); const lo = r1(t[Math.floor(0.025 * B)]), hi = r1(t[Math.floor(0.975 * B)]); return { sep: lo > 0 || hi < 0, width: t[Math.floor(0.975 * B)] - t[Math.floor(0.025 * B)] }; };
  const sepBonf = (bs, a, b) => { const m = armAPairs.length, aB = 0.05 / m; const t = bs[a].map((v, k) => v - bs[b][k]).sort((x, y) => x - y); const loIdx = Math.max(0, Math.floor((aB / 2) * B)), hiIdx = Math.min(B - 1, Math.ceil((1 - aB / 2) * B) - 1); return t[loIdx] > 0 || t[hiIdx] < 0; };
  const comps = [];
  let reproOK = true;
  const reproMismatch = [];
  for (const c of cmpList) {
    const p = pub.get(`${c.a}|${c.b}`);
    if (!p) throw new Error(`E5: comparison ${c.a}|${c.b} not in analysis.json`);
    const pubSep = c.kind === "arm" ? p.b_minus_a.separated : p.separated;
    const isArmA = armAPairs.some((x) => x.a === c.a && x.b === c.b);
    const pubBonf = isArmA ? p.bonferroni.separated : null;
    // arm comparisons: B minus A, as published
    const [x, y] = c.kind === "arm" ? [c.b, c.a] : [c.a, c.b];
    const res = {};
    for (const k of ["a", "b", "c", "c0"]) { const u = sepUncorr(M[k], x, y); res[k] = { separated: u.sep, width: u.width, bonferroni_separated: isArmA ? sepBonf(M[k], x, y) : null }; }
    if (res.c0.separated !== pubSep || (isArmA && res.c0.bonferroni_separated !== pubBonf)) { reproOK = false; reproMismatch.push(`${c.a}|${c.b}`); }
    comps.push({ a: c.a, b: c.b, kind: c.kind, group: c.kind === "arm" ? "arm_B_minus_A" : isArmA ? "build_arm_A" : "build_arm_B", published_separated: pubSep, published_bonferroni_separated: pubBonf, c_separated: res.c.separated, c_bonferroni_separated: res.c.bonferroni_separated, a_separated: res.a.separated, b_separated: res.b.separated, c0_separated: res.c0.separated, c0_bonferroni_separated: res.c0.bonferroni_separated, width_ratio_c_over_c0: r4(res.c.width / res.c0.width), width_ratio_a_over_c: r4(res.a.width / res.c.width) });
  }
  const groups = ["build_arm_A", "build_arm_B", "arm_B_minus_A"];
  const survival = Object.fromEntries(groups.map((g) => {
    const cs = comps.filter((c) => c.group === g);
    const o = {
      comparisons: cs.length,
      published_separated: cs.filter((c) => c.published_separated).length,
      surviving_under_c: cs.filter((c) => c.published_separated && c.c_separated).length,
      new_under_c: cs.filter((c) => !c.published_separated && c.c_separated).length,
      separated_under_a_scorer_rows: cs.filter((c) => c.a_separated).length,
      median_width_ratio_c_over_c0: r4(median(cs.map((c) => c.width_ratio_c_over_c0))),
      median_width_ratio_a_over_c: r4(median(cs.map((c) => c.width_ratio_a_over_c))),
    };
    if (g === "build_arm_A") {
      o.published_bonferroni_separated = cs.filter((c) => c.published_bonferroni_separated).length;
      o.bonferroni_surviving_under_c = cs.filter((c) => c.published_bonferroni_separated && c.c_bonferroni_separated).length;
      o.bonferroni_new_under_c = cs.filter((c) => !c.published_bonferroni_separated && c.c_bonferroni_separated).length;
    }
    o.not_surviving_pairs_stored_labels = cs.filter((c) => c.published_separated && !c.c_separated).map((c) => `${c.a} | ${c.b}`);
    if (g === "build_arm_A") o.bonferroni_not_surviving_pairs_stored_labels = cs.filter((c) => c.published_bonferroni_separated && !c.c_bonferroni_separated).map((c) => `${c.a} | ${c.b}`);
    return [g, o];
  }));
  // DEVIATIONS.md D1 (exploratory, added after the first run): common random numbers. Item draws come from one stream
  // and reply draws from a second, so item-only and two-stage use IDENTICAL item draws and their width ratio isolates
  // the reply-level contribution from Monte Carlo noise. Five seed pairs show the spread. Not used for any decision.
  const runCommon = (seed, withReplies) => {
    const ri = mulberry32(seed), rr = mulberry32(seed + 7919);
    const boots = Object.fromEntries(SUBJ.map((s) => [s, []]));
    for (let b = 0; b < B; b++) {
      const pick = Object.fromEntries(DIMS.map((d) => [d, byDim[d].map(() => byDim[d][Math.floor(ri() * byDim[d].length)])]));
      for (const s of SUBJ) {
        const itemMean = (ss, i) => {
          if (!withReplies) return im[`${ss}|${i}`];
          const reps = repRatingsBySI.get(`${ss}|${i}`); let t = 0;
          for (let k = 0; k < reps.length; k++) { const rp = reps[Math.floor(rr() * reps.length)]; t += rp[0] + rp[1]; }
          return t / (2 * reps.length);
        };
        boots[s].push(compFromItemMeans(itemMean, s, pick));
      }
    }
    return boots;
  };
  const crn = {};
  const crnSeeds = [20261105, 20261106, 20261107, 20261108, 20261109];
  for (const sd of crnSeeds) {
    const cc = runCommon(sd, true), c0c = runCommon(sd, false);
    const ratios = SUBJ.map((s) => width(cc[s]) / width(c0c[s]));
    const pairRatios = Object.fromEntries(groups.map((g) => [g, r4(median(comps.filter((c) => c.group === g).map((c) => { const [x, y] = c.kind === "arm" ? [c.b, c.a] : [c.a, c.b]; return sepUncorr(cc, x, y).width / sepUncorr(c0c, x, y).width; })))]));
    crn[String(sd)] = {
      median_subject_width_ratio_two_stage_over_item_only: r4(median(ratios)),
      per_subject_ratio_alphabetical: Object.fromEntries(SUBJ.map((s, k) => [s, r4(ratios[k])])),
      median_difference_width_ratio_by_group: pairRatios,
      published_separations_surviving_two_stage: Object.fromEntries(groups.map((g) => [g, comps.filter((c) => c.group === g && c.published_separated).filter((c) => { const [x, y] = c.kind === "arm" ? [c.b, c.a] : [c.a, c.b]; return sepUncorr(cc, x, y).sep; }).length])),
      published_bonferroni_surviving_two_stage_arm_A: comps.filter((c) => c.group === "build_arm_A" && c.published_bonferroni_separated).filter((c) => sepBonf(cc, c.a, c.b)).length,
    };
  }
  const medC_C0 = median(SUBJ.map((s) => per_subject[s].ratio_c0_over_c).map((r) => 1 / r));
  const medA_C = median(SUBJ.map((s) => per_subject[s].ratio_a_over_c));
  results.E5 = {
    question: "How wide are composite intervals under scorer-style, reply-clustered and item-clustered resampling, and do the published separations survive the item-clustered (two-stage) interval?",
    note: "widths in composite points and ratios only; no interval endpoint and no point is printed",
    methods: { a: "scorer-style: items fixed, rating rows resampled within item as independent trials", b: "reply-clustered: items fixed, replies resampled within item with both ratings", c: "PRIMARY item-clustered two-stage: items resampled within dimension (paired across subjects), then replies within item", c0: "item-only, published method (lib/paired-bootstrap.mjs, seed 20261003): reproduction check" },
    reproduction_check_c0_matches_published_flags: reproOK, reproduction_mismatches: reproMismatch,
    per_subject_alphabetical: per_subject,
    scorer_sanity_arm_A: scorecardWidth,
    median_subject_width_ratio_c_over_c0: r4(medC_C0),
    median_subject_width_ratio_a_over_c: r4(medA_C),
    separation_survival: survival,
    comparisons: comps.map(({ width_ratio_c_over_c0, width_ratio_a_over_c, ...rest }) => ({ ...rest, width_ratio_c_over_c0, width_ratio_a_over_c })),
    exploratory_D1_common_random_numbers: { note: "DEVIATIONS.md D1. Exploratory, added after the first run; not used for the pre-registered decision. Same item draws for two-stage and item-only; reply draws from a separate stream (seed + 7919).", by_seed: crn },
    decision: {
      propose_two_stage_c: medC_C0 >= 1.10,
      scorer_rows_confirmed_too_narrow: medA_C < 0.9,
    },
  };
}

// ================= E6: bridge drift =================
{
  const rng = mulberry32(20261106);
  const loadBridge = (R, rkey, dirs) => {
    const { judgeKey, responsesById } = asm.loadInputs(join(R, "keys"), join(R, "keys", rkey));
    const bridgeById = asm.bridgeTexts(judgeKey);
    const loaded = jans.loadRoutedAnswers({ routingKey: judgeKey, dirs: dirs.map((d) => join(R, d)), responsesById, bridgeById });
    if (loaded.errors.length > 0) throw new Error(`E6 ${R}: ${loaded.errors.slice(0, 3).join("; ")}`);
    const lib = brg.bridgeDrift({ bridgeEntries: [...bridgeById.values()], bridgeRatings: loaded.bridgeRatings, excludedJudges: judgeKey.excluded_judges ?? [] });
    const newBy = new Map(loaded.bridgeRatings.map((x) => [`${x.response_id}|${x.judge}`, x.rating_1_5]));
    const ex = new Set(judgeKey.excluded_judges ?? []);
    const reps = [...bridgeById.values()].sort((a, b) => a.response_id.localeCompare(b.response_id)).map((e) => ({ id: e.response_id, d: e.judges.filter((j) => !ex.has(j)).map((j) => ({ j, d: newBy.get(`${e.response_id}|${j}`) - e.original_ratings[j] })) }));
    return { reps, lib, source_run: judgeKey.bridge.source_run };
  };
  const bridges = {
    "pilot-2026-10-02": loadBridge(P2, "judge-key.reroute.json", ["judge-answers", "judge-answers-reroute"]),
    "pilot-2026-10-03": loadBridge(P3, "judge-key.reroute-2.json", ["judge-answers", "judge-answers-reroute", "judge-answers-reroute-2"]),
  };
  const out = {};
  let o11 = 0;
  let anyJudgeSigned = false;
  let anyTooTight = false, allLoose = true;
  for (const [run, br] of Object.entries(bridges)) {
    const all = br.reps.flatMap((r) => r.d);
    const judgesHere = [...new Set(all.map((x) => x.j))].sort();
    const stats = (subset) => ({ signed: mean(subset.map((x) => x.d)), abs: mean(subset.map((x) => Math.abs(x.d))) });
    const bsPooled = [], bsJ = Object.fromEntries(judgesHere.map((j) => [j, []]));
    let skipped = 0;
    for (let b = 0; b < B; b++) {
      const pick = br.reps.map(() => br.reps[Math.floor(rng() * br.reps.length)]);
      const flat = pick.flatMap((r) => r.d);
      bsPooled.push(stats(flat));
      for (const j of judgesHere) { const v = flat.filter((x) => x.j === j); if (v.length) bsJ[j].push(stats(v)); else skipped++; }
    }
    const summ = (subset, bs) => {
      const st = stats(subset);
      const cs = ci95(bs.map((x) => x.signed)), ca = ci95(bs.map((x) => x.abs));
      return { pairs: subset.length, exact: subset.filter((x) => x.d === 0).length, mean_signed_new_minus_original: r4(st.signed), signed_interval95: [r4(cs[0]), r4(cs[1])], signed_has_sign: excludes0(cs), mean_abs: r4(st.abs), abs_interval95: [r4(ca[0]), r4(ca[1])] };
    };
    const pooled = summ(all, bsPooled);
    const per_judge = Object.fromEntries(judgesHere.map((j) => [j, summ(all.filter((x) => x.j === j), bsJ[j])]));
    const libCheck = Math.abs(br.lib.overall.mean_abs_difference - pooled.mean_abs) < 1e-3 && br.lib.overall.pairs === pooled.pairs;
    const upperAbsSigned = Math.max(Math.abs(pooled.signed_interval95[0]), Math.abs(pooled.signed_interval95[1]));
    o11 = Math.max(o11, upperAbsSigned);
    if (judgesHere.some((j) => per_judge[j].signed_has_sign)) anyJudgeSigned = true;
    if (pooled.abs_interval95[1] > 0.30) anyTooTight = true;
    if (pooled.abs_interval95[1] > 0.15) allLoose = false;
    out[run] = { source_run: br.source_run, replies: br.reps.length, pooled, per_judge, library_bridgeDrift_matches: libCheck, bootstrap_replicates_with_no_pair_for_a_judge: skipped };
  }
  const cand = Math.ceil(o11 / 0.05 - 1e-9) * 0.05;
  const wr = results._within_run_mad;
  results.E6 = {
    question: "Does re-judging drift with a sign, and is the 0.30 mean-|d| anchor threshold calibrated?",
    method: "reply-clustered bootstrap over the 24 bridge replies (both pairs kept), B = 1000, seed 20261106",
    label: "calibration, n = 2 bridges",
    bridges: out,
    O11_calibration_candidate: { max_upper_abs_pooled_signed: r4(o11), candidate_rating_units: r4(cand), candidate_base_composite_units: r4(cand * 25), operationalisation: "upper 95% bound of |pooled mean signed d| = max(|lo|, |hi|) of the signed interval", any_per_judge_signed_interval_excludes_zero: anyJudgeSigned, supports: anyJudgeSigned ? "an active signed-drift gate" : "report-only signed drift in the first v2 wave" },
    anchor_threshold_030: { verdict: anyTooTight ? "contradicted (too tight)" : allLoose ? "possibly loose" : "consistent" },
    within_run_comparison_pilot3: { within_run_mean_abs_between_judges: r4(wr), ratio_bridge_mad_over_within_run: Object.fromEntries(Object.entries(out).map(([k, v]) => [k, r4(v.pooled.mean_abs / wr)])) },
  };
}
results.within_run_mean_abs_between_judges_pilot3 = r4(results._within_run_mad);
delete results._within_run_mad;

// ---------- leak guard: no composite point in output ----------
const txt = JSON.stringify(sortKeys(results), null, 2) + NL;
for (const bad of ["\"composite\"", "\"pilot_composite\"", "\"difference\"", "\"interval95_composite\""]) if (txt.includes(bad)) throw new Error(`leak guard: ${bad} in results`);
writeFileSync(join(HERE, "results.json"), txt);
console.log(`wrote results.json sha256 ${sha(txt)}`);
