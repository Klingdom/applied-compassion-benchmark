// research/model-runs/lib/intervals.mjs
//
// Item-clustered bootstrap intervals for the model-evaluation programme (D-63 Stream B, Iteration 119).
// INTERNAL analysis module: nothing here is a score, a published figure, or an ordering of subjects.
//
// WHY. The pre-registered experiments (research/model-runs/experiments/2026-10-22, finding E5) found that the
// scorer's trial-level intervals treat judge ratings as independent and are about 4 times too narrow (median width
// ratio 0.23). The unit that actually varies between runs is the ITEM: every reply to an item, and every judge of
// that reply, shares the item's difficulty. The modes below resample at progressively higher levels:
//
//   "naive"       items fixed; every rating row is resampled independently inside its (subject, item) cell.
//                 This is the scorer's own approach (README limit 1). Kept ONLY as the comparison baseline.
//   "reply"       items fixed; whole replies (all of a reply's judge ratings together) are resampled inside a cell.
//   "item"        (a) a single subject's composite, ITEM-CLUSTERED: items are resampled within dimension and every
//                 reply and judge of a drawn item is kept. This is lib/paired-bootstrap.mjs, called unchanged
//                 (the published method), so it is identical to analyze-pilot's interval95.
//   "item_reply"  (b) item-THEN-reply, for paired differences: items are resampled within dimension (the same draw
//                 for every subject, so differences are paired), then, inside each drawn item, whole replies are
//                 resampled with their judges kept together.
//
// METHOD. Percentile bootstrap: B replicates (default 1000), the 95% interval is the sorted replicates at index
// floor(0.025 * B) and floor(0.975 * B). The composite of each replicate is computed by the caller's `comp`
// function (the canonical computeCompositeFromDimensions); this file resamples and averages, nothing more.
//
// SEEDS. Fixed per mode and recorded by the caller. "item" uses the generator and seed of analyze-pilot (the LCG in
// paired-bootstrap.mjs, seed = the run's master_seed). The other modes use mulberry32 with the seed passed in
// (experiments used 20261105: DEFAULT_SEED). Draw order is fixed: per replicate, the item picks for every
// dimension, then for each subject in the order given (callers pass alphabetical order), dimension by dimension,
// slot by slot, and reply by reply. This order is what makes the experiment figures reproduce exactly
// (tests/intervals.test.mjs).
//
// Dedicated loaders at the bottom read a pilot run exactly as bin/analyze-pilot.mjs does.
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { pairedBootstrap } from "./paired-bootstrap.mjs";

export const DEFAULT_B = 1000;
export const DEFAULT_SEED = 20261105;
export const DIMENSIONS = Object.freeze(["AWR", "EMP", "ACT", "EQU", "BND", "ACC", "SYS", "INT"]);
export const MODES = Object.freeze(["naive", "reply", "item", "item_reply"]);

const mean = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;
const sum = (xs) => xs.reduce((a, b) => a + b, 0);

export function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 95% percentile interval, exactly the experiment's ci95: sorted[floor(0.025 n)], sorted[floor(0.975 n)]. */
export function percentileInterval95(xs) {
  const t = [...xs].sort((a, b) => a - b);
  return [t[Math.floor(0.025 * t.length)], t[Math.floor(0.975 * t.length)]];
}
export const intervalWidth = (xs) => { const [lo, hi] = percentileInterval95(xs); return hi - lo; };

/** Paired replicate-by-replicate difference of two subjects' bootstrap composites. */
export function differenceBoots(boots, a, b) {
  if (!boots[a] || !boots[b]) throw new Error(`difference ${a} vs ${b}: not subjects of this bootstrap`);
  return boots[a].map((v, k) => v - boots[b][k]);
}

/**
 * Replicate composites for every subject.
 * @param {object} p
 * @param {"naive"|"reply"|"item"|"item_reply"} p.mode
 * @param {string[]} p.subjects                       draw order (pass alphabetical)
 * @param {string[]} p.items
 * @param {Record<string,string>} p.dimOf             item -> dimension
 * @param {string[]} p.dims
 * @param {Map<string, number[][]>} p.replies         `${subject}|${item}` -> replies, each an array of judge ratings
 * @param {Map<string, number[]>} [p.rowRatings]      naive mode only: `${subject}|${item}` -> rating rows in file order
 *                                                    (the order matters to which row a draw lands on; default: replies flattened)
 * @param {number} p.seed
 * @param {number} [p.B]
 * @param {(dimensionMeans: Record<string,number>) => number} p.comp   canonical composite
 * @returns {Record<string, number[]>} subject -> B replicate composites
 */
export function bootstrapComposites({ mode, subjects, items, dimOf, dims, replies, rowRatings, seed, B = DEFAULT_B, comp }) {
  if (!MODES.includes(mode)) throw new Error(`unknown mode ${JSON.stringify(mode)}`);
  const cell = (s, i) => {
    const r = replies.get(`${s}|${i}`);
    if (!r || r.length === 0) throw new Error(`no replies for ${s} ${i}`);
    return r;
  };
  if (mode === "item") {
    const im = {};
    for (const s of subjects) for (const i of items) im[`${s}|${i}`] = mean(cell(s, i).flat());
    return pairedBootstrap({ subjects, items, dimOf, im, dims, seed, B, comp }).boots;
  }
  const rng = mulberry32(seed);
  const byDim = Object.fromEntries(dims.map((d) => [d, items.filter((i) => dimOf[i] === d)]));
  const flat = new Map(); // naive: independent rating rows per cell
  if (mode === "naive") for (const s of subjects) for (const i of items) flat.set(`${s}|${i}`, rowRatings?.get(`${s}|${i}`) ?? cell(s, i).flat());
  const boots = Object.fromEntries(subjects.map((s) => [s, []]));
  for (let b = 0; b < B; b++) {
    const pick = mode === "item_reply"
      ? Object.fromEntries(dims.map((d) => [d, byDim[d].map(() => byDim[d][Math.floor(rng() * byDim[d].length)])]))
      : byDim;
    for (const s of subjects) {
      const itemMean = (i) => {
        if (mode === "naive") {
          const v = flat.get(`${s}|${i}`); let t = 0;
          for (let k = 0; k < v.length; k++) t += v[Math.floor(rng() * v.length)];
          return t / v.length;
        }
        const reps = cell(s, i); let t = 0, n = 0;
        for (let k = 0; k < reps.length; k++) { const rp = reps[Math.floor(rng() * reps.length)]; t += sum(rp); n += rp.length; }
        return t / n;
      };
      boots[s].push(comp(Object.fromEntries(dims.map((d) => [d, mean(pick[d].map(itemMean))]))));
    }
  }
  return boots;
}

/**
 * Paired comparison of two subjects from replicate composites: width, and whether the 95% interval excludes 0 using
 * the published convention (endpoints rounded to 0.1 before the test, as analyze-pilot's `separated`).
 */
export function pairedDifferenceSummary(boots, a, b) {
  const d = differenceBoots(boots, a, b);
  const [lo, hi] = percentileInterval95(d);
  const r1 = (x) => Math.round(x * 10) / 10;
  return { width: hi - lo, separated: r1(lo) > 0 || r1(hi) < 0 };
}

// ---------------------------------------------------------------- output hygiene (D-29) ----

export const RANKING_WORD = /\b(rank\w*|best|worst|winner\w*|leaderboard|top[- ]?\d*|league)\b/i;

/** Returns the list of problems with an intervals document: subject order, ranking words, labels. */
export function checkIntervalsDocument(doc) {
  const problems = [];
  if (doc.status !== "internal") problems.push('status must be "internal"');
  if (doc.not_a_score !== true && doc.label !== "not-a-score" && !String(doc.label ?? "").includes("not-a-score")) problems.push('label must say "not-a-score"');
  const names = Object.keys(doc.subjects ?? {});
  const sorted = [...names].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
  if (names.join("|") !== sorted.join("|")) problems.push("subjects are not in alphabetical order");
  const lists = [doc.design?.subjects_alphabetical].filter(Boolean);
  for (const l of lists) if (l.join("|") !== [...l].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0)).join("|")) problems.push("design.subjects_alphabetical is not alphabetical");
  const pairs = doc.paired_differences ?? [];
  const keyed = pairs.map((p) => `${p.a}|${p.b}`);
  if (keyed.join("\n") !== [...keyed].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0)).join("\n")) problems.push("paired_differences are not in alphabetical order");
  for (const p of pairs) if (!(p.a < p.b)) problems.push(`pair ${p.a} | ${p.b} is not listed with the alphabetically earlier label first`);
  const text = JSON.stringify(doc);
  const m = RANKING_WORD.exec(text);
  if (m) problems.push(`ranking word ${JSON.stringify(m[0])} in output`);
  return problems;
}

// ---------------------------------------------------------------- run loaders (same inputs as analyze-pilot) ----

/**
 * Reads a pilot run's rating rows exactly as bin/analyze-pilot.mjs does and groups them into replies.
 * First-pilot shape (no run-config.json): scorecards/<subject>.assembly-audit.json row_mapping.
 * Explicit-judge-set shape: mcp-scorecards/<subject>/mcp-rating-map.json rows.
 * @returns {{runId, root, subjects: string[], items: string[], dimOf, dims, replies: Map, config: object|null, masterSeed: number, ratings: number, replyCount: number}}
 */
export function loadRun({ root, runId }) {
  const R = join(root, "research", "model-runs", runId);
  const cfgFile = join(R, "run-config.json");
  const config = existsSync(cfgFile) ? JSON.parse(readFileSync(cfgFile, "utf8")) : null;
  const local = Boolean(config && Array.isArray(config.judges));
  if (local && config.run_id !== runId) throw new Error(`run-config.json is for ${config.run_id}, not ${runId}`);
  const subjectsAsConfigured = local ? config.subjects.map((s) => s.label) : ["claude-fable", "claude-haiku", "claude-opus", "claude-sonnet"];
  const bank = JSON.parse(readFileSync(join(root, "site", "src", "data", "model-benchmark", "tasks-v1.json"), "utf8"));
  const dimOf = Object.fromEntries(bank.items.map((i) => [i.id, i.dimension]));
  const rows = [];
  for (const s of subjectsAsConfigured) {
    let mapped;
    if (local) {
      const map = JSON.parse(readFileSync(join(R, "mcp-scorecards", s, "mcp-rating-map.json"), "utf8"));
      if (map.subject !== s || map.run_id !== runId) throw new Error(`mcp-rating-map.json is not for ${runId} ${s}`);
      mapped = map.rows;
    } else {
      mapped = JSON.parse(readFileSync(join(R, "scorecards", `${s}.assembly-audit.json`), "utf8")).row_mapping;
    }
    for (const m of mapped) rows.push({ s, item: m.item_id, trial: m.subject_trial, judge: m.judge, rating: m.rating_1_5 });
  }
  const subjects = [...subjectsAsConfigured].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
  const items = [...new Set(rows.map((r) => r.item))].sort();
  for (const i of items) if (!dimOf[i]) throw new Error(`item ${i} is not in the task bank`);
  const rowRatings = new Map();
  for (const r of rows) { const k = `${r.s}|${r.item}`; if (!rowRatings.has(k)) rowRatings.set(k, []); rowRatings.get(k).push(r.rating); }
  const byReply = new Map();
  for (const r of rows) {
    const k = `${r.s}|${r.item}|${r.trial}`;
    if (!byReply.has(k)) byReply.set(k, { s: r.s, item: r.item, key: k, ratings: new Map() });
    const rp = byReply.get(k);
    if (rp.ratings.has(r.judge)) throw new Error(`duplicate judge ${r.judge} on reply ${k}`);
    rp.ratings.set(r.judge, r.rating);
  }
  // same order as the experiment script: sorted by "subject|item|trial" with localeCompare
  const ordered = [...byReply.values()].sort((a, b) => a.key.localeCompare(b.key));
  const replies = new Map();
  for (const rp of ordered) {
    const k = `${rp.s}|${rp.item}`;
    if (!replies.has(k)) replies.set(k, []);
    replies.get(k).push([...rp.ratings.values()]);
  }
  return {
    runId, root, subjects, items, dimOf, dims: [...DIMENSIONS], replies, rowRatings, config,
    masterSeed: local ? config.master_seed : 20261001,
    ratings: rows.length, replyCount: ordered.length,
  };
}

/** The canonical composite, loaded from the site scorer (no second composite path). */
export async function loadComposite(root) {
  // Imported from the one canonical module and called directly; nothing is re-implemented here. This file is on the
  // hygiene allow-list in tests/e2e-and-hygiene.test.mjs (added 2026-10-26, Iteration 119), so that test also checks
  // the import path.
  const { computeCompositeFromDimensions } = await import(pathToFileURL(join(root, "site", "scripts", "lib", "scoring.mjs")).href);
  return (d) => { const c = computeCompositeFromDimensions(d); return typeof c === "number" ? c : c.composite ?? c.score; };
}
