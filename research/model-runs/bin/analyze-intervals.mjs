#!/usr/bin/env node
/**
 * analyze-intervals.mjs: INTERNAL item-clustered interval analysis of a finished pilot or wave data set.
 *
 *   node research/model-runs/bin/analyze-intervals.mjs --run-id pilot-2026-10-03
 *
 * Reads the same inputs as bin/analyze-pilot.mjs (it does not import or change that script) and writes
 * research/model-runs/analysis/<run-id>/intervals.json. Deterministic: fixed seeds, sorted keys, no clock.
 *
 * INTERNAL, not-a-score (D-29, FDM-1): subjects are listed alphabetically; the file orders nothing, and carries
 * widths and ratios only. No composite point and no interval endpoint is written. See lib/intervals.mjs for the method.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  loadRun, loadComposite, bootstrapComposites, intervalWidth, pairedDifferenceSummary,
  checkIntervalsDocument, DEFAULT_B, DEFAULT_SEED, MODES,
} from "../lib/intervals.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const r4 = (x) => Math.round(x * 10000) / 10000;
const median = (xs) => { const t = [...xs].sort((a, b) => a - b); const n = t.length; return n % 2 ? t[(n - 1) / 2] : (t[n / 2 - 1] + t[n / 2]) / 2; };
const sortKeys = (v) => Array.isArray(v) ? v.map(sortKeys) : v && typeof v === "object" ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, sortKeys(v[k])])) : v;

/** Builds the document for one run. Exported for tests; the CLI below only parses arguments and writes the file. */
export async function buildIntervalsDocument({ root = ROOT, runId, B = DEFAULT_B, seed = DEFAULT_SEED } = {}) {
  const run = await loadRun({ root, runId });
  const comp = await loadComposite(root);
  const common = { subjects: run.subjects, items: run.items, dimOf: run.dimOf, dims: run.dims, replies: run.replies, rowRatings: run.rowRatings, B, comp };
  const seeds = { naive: seed, reply: seed, item: run.masterSeed, item_reply: seed };
  const boots = Object.fromEntries(MODES.map((m) => [m, bootstrapComposites({ ...common, mode: m, seed: seeds[m] })]));

  const subjects = {};
  for (const s of run.subjects) {
    const w = Object.fromEntries(MODES.map((m) => [m, intervalWidth(boots[m][s])]));
    subjects[s] = {
      replies: run.items.reduce((n, i) => n + run.replies.get(`${s}|${i}`).length, 0),
      width_naive_scorer_style: r4(w.naive),
      width_reply_clustered: r4(w.reply),
      width_item_clustered: r4(w.item),
      width_item_then_reply: r4(w.item_reply),
      ratio_naive_over_item_clustered: r4(w.naive / w.item),
      ratio_naive_over_item_then_reply: r4(w.naive / w.item_reply),
      ratio_item_then_reply_over_item_clustered: r4(w.item_reply / w.item),
    };
  }
  const paired = [];
  for (let x = 0; x < run.subjects.length; x++) for (let y = x + 1; y < run.subjects.length; y++) {
    const [a, b] = [run.subjects[x], run.subjects[y]]; // subjects are alphabetical, so a < b
    const sm = Object.fromEntries(MODES.map((m) => [m, pairedDifferenceSummary(boots[m], a, b)]));
    paired.push({
      a, b,
      width_naive_scorer_style: r4(sm.naive.width),
      width_item_clustered: r4(sm.item.width),
      width_item_then_reply: r4(sm.item_reply.width),
      ratio_naive_over_item_then_reply: r4(sm.naive.width / sm.item_reply.width),
      ratio_item_then_reply_over_item_clustered: r4(sm.item_reply.width / sm.item.width),
      excludes_zero_naive_scorer_style: sm.naive.separated,
      excludes_zero_item_clustered: sm.item.separated,
      excludes_zero_item_then_reply: sm.item_reply.separated,
    });
  }
  const col = (k) => Object.values(subjects).map((x) => x[k]);
  const pcol = (k) => paired.map((x) => x[k]);
  const doc = {
    kind: "intervals-analysis",
    status: "internal",
    not_a_score: true,
    label: "internal, not-a-score. Pilot data, unofficial, comparability none (PRD FDM-1). Widths and ratios only; no composite point and no interval endpoint is written.",
    run_id: runId,
    method: {
      resampling: {
        naive_scorer_style: "items fixed; rating rows resampled independently inside each subject-item cell (the scorer's approach; comparison baseline only)",
        reply_clustered: "items fixed; whole replies, with all their judge ratings, resampled inside each cell",
        item_clustered: "single subject: items resampled within dimension (same draw for every subject), all replies and judges of a drawn item kept; lib/paired-bootstrap.mjs unchanged",
        item_then_reply: "paired differences: items resampled within dimension (paired across subjects), then whole replies resampled inside each drawn item",
      },
      interval: "percentile, 95%: sorted replicates at floor(0.025 B) and floor(0.975 B)",
      width_unit: "composite points",
      excludes_zero: "published convention: interval endpoints rounded to 0.1 before testing against 0",
      replicates: B,
      seeds: { naive_scorer_style: seeds.naive, reply_clustered: seeds.reply, item_clustered: seeds.item, item_then_reply: seeds.item_reply },
      generators: { item_clustered: "LCG of lib/paired-bootstrap.mjs", others: "mulberry32" },
      composite_function: "computeCompositeFromDimensions (site/scripts/lib/scoring.mjs), unmodified",
    },
    design: { subjects_alphabetical: run.subjects, items: run.items.length, replies: run.replyCount, ratings: run.ratings },
    subjects,
    paired_differences: paired,
    summary: {
      median_ratio_naive_over_item_then_reply_single_subject: r4(median(col("ratio_naive_over_item_then_reply"))),
      median_ratio_naive_over_item_then_reply_paired: r4(median(pcol("ratio_naive_over_item_then_reply"))),
      median_ratio_item_then_reply_over_item_clustered_single_subject: r4(median(col("ratio_item_then_reply_over_item_clustered"))),
      median_ratio_item_then_reply_over_item_clustered_paired: r4(median(pcol("ratio_item_then_reply_over_item_clustered"))),
      reading: "A ratio of naive over clustered below 1 means the scorer-style interval is narrower than the clustered one by that factor.",
    },
  };
  const problems = checkIntervalsDocument(doc);
  if (problems.length) throw new Error(`intervals document failed its own checks: ${problems.join("; ")}`);
  return sortKeys(doc);
}

async function main() {
  const idx = process.argv.indexOf("--run-id");
  if (idx < 0 || !process.argv[idx + 1]) { console.error("usage: analyze-intervals.mjs --run-id <id>"); return 2; }
  const runId = process.argv[idx + 1];
  const doc = await buildIntervalsDocument({ runId });
  const dir = join(ROOT, "research", "model-runs", "analysis", runId);
  mkdirSync(dir, { recursive: true });
  const text = JSON.stringify(doc, null, 2) + String.fromCharCode(10);
  writeFileSync(join(dir, "intervals.json"), text);
  console.log(`wrote analysis/${runId}/intervals.json sha256 ${createHash("sha256").update(text).digest("hex")}`);
  return 0;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exit(await main());
