// lib/intervals.mjs and bin/analyze-intervals.mjs (D-63 Stream B).
//   1. determinism: same seed, byte-identical output;
//   2. reproduction of the 2026-10-22 experiment figures (E5) from the committed pilot-3 data;
//   3. a synthetic fixture with known item clustering: clustered width is greater than naive width;
//   4. a planted probe: no item effect and no extra judge information gives clustered about equal to naive;
//   5. the alphabetical-order and no-ranking-words checks fail on a planted violation.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  bootstrapComposites, intervalWidth, pairedDifferenceSummary, checkIntervalsDocument, loadRun, loadComposite, mulberry32, percentileInterval95,
} from "../lib/intervals.mjs";
import { buildIntervalsDocument } from "../bin/analyze-intervals.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..", "..", "..");
const exp = path.join(root, "research", "model-runs", "experiments", "2026-10-22", "results.json");
const p3 = path.join(root, "research", "model-runs", "pilot-2026-10-03", "run-config.json");
const haveReal = existsSync(exp) && existsSync(p3);

// ---- synthetic fixtures: one dimension "D", two subjects ----
const mean = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;
const compD = (d) => d.D;
function fixture({ itemSD, noiseSD, judgesPerReply, itemsN = 40, repliesPerCell = 3, seed = 7 }) {
  const rnd = mulberry32(seed);
  const gauss = () => Math.sqrt(-2 * Math.log(1 - rnd())) * Math.cos(2 * Math.PI * rnd());
  const items = Array.from({ length: itemsN }, (_, k) => `D-${String(k).padStart(2, "0")}`);
  const dimOf = Object.fromEntries(items.map((i) => [i, "D"]));
  const replies = new Map();
  for (const s of ["a", "b"]) for (const i of items) replies.set(`${s}|${i}`, []);
  for (const i of items) {
    const itemEffect = itemSD * gauss(); // shared by both subjects, replies and judges
    for (const s of ["a", "b"]) for (let r = 0; r < repliesPerCell; r++) {
      const replyNoise = noiseSD * gauss();
      replies.get(`${s}|${i}`).push(Array.from({ length: judgesPerReply }, () => 3 + itemEffect + replyNoise + 0.05 * gauss()));
    }
  }
  return { subjects: ["a", "b"], items, dimOf, dims: ["D"], replies, comp: compD };
}
const widthOf = (fx, mode, seed = 11) => intervalWidth(bootstrapComposites({ ...fx, mode, seed, B: 600 }).a);

test("determinism: the same seed gives byte-identical output, a different seed does not", () => {
  const fx = fixture({ itemSD: 0.8, noiseSD: 0.3, judgesPerReply: 2 });
  for (const mode of ["naive", "reply", "item", "item_reply"]) {
    const a = JSON.stringify(bootstrapComposites({ ...fx, mode, seed: 5, B: 200 }));
    const b = JSON.stringify(bootstrapComposites({ ...fx, mode, seed: 5, B: 200 }));
    const c = JSON.stringify(bootstrapComposites({ ...fx, mode, seed: 6, B: 200 }));
    assert.equal(a, b, mode);
    assert.notEqual(a, c, mode);
  }
});

test("analyze-intervals output is byte-identical across runs and is internal, not-a-score, alphabetical", { skip: !haveReal }, async () => {
  const one = JSON.stringify(await buildIntervalsDocument({ runId: "pilot-2026-10-03" }));
  const two = JSON.stringify(await buildIntervalsDocument({ runId: "pilot-2026-10-03" }));
  assert.equal(one, two);
  const doc = JSON.parse(one);
  assert.equal(doc.status, "internal");
  assert.equal(doc.not_a_score, true);
  assert.match(doc.label, /not-a-score/);
  assert.deepEqual(Object.keys(doc.subjects), [...Object.keys(doc.subjects)].sort());
  assert.deepEqual(checkIntervalsDocument(doc), []);
  assert.doesNotMatch(one, /"composite"|"interval95"|"difference"/, "no composite point or endpoint may be written");
});

test("reproduces the experiment E5 widths and flags exactly (same data, same seeds)", { skip: !haveReal }, async () => {
  const E5 = JSON.parse(readFileSync(exp, "utf8")).E5;
  const run = loadRun({ root, runId: "pilot-2026-10-03" });
  const comp = await loadComposite(root);
  const common = { subjects: run.subjects, items: run.items, dimOf: run.dimOf, dims: run.dims, replies: run.replies, rowRatings: run.rowRatings, B: 1000, comp };
  const boots = {
    a: bootstrapComposites({ ...common, mode: "naive", seed: 20261105 }),
    b: bootstrapComposites({ ...common, mode: "reply", seed: 20261105 }),
    c: bootstrapComposites({ ...common, mode: "item_reply", seed: 20261105 }),
    c0: bootstrapComposites({ ...common, mode: "item", seed: run.config.master_seed }),
  };
  const r4 = (x) => Math.round(x * 10000) / 10000;
  assert.equal(run.config.master_seed, 20261003);
  for (const s of run.subjects) {
    const e = E5.per_subject_alphabetical[s];
    const w = Object.fromEntries(Object.entries(boots).map(([k, v]) => [k, intervalWidth(v[s])]));
    assert.equal(r4(w.a), e.width_a_scorer_rows, `${s} a`);
    assert.equal(r4(w.b), e.width_b_reply_clustered, `${s} b`);
    assert.equal(r4(w.c), e.width_c_item_two_stage, `${s} c`);
    assert.equal(r4(w.c0), e.width_c0_item_only_published, `${s} c0`);
    assert.equal(r4(w.a / w.c), e.ratio_a_over_c, `${s} ratio a/c`);
    assert.equal(r4(w.c0 / w.c), e.ratio_c0_over_c, `${s} ratio c0/c`);
  }
  assert.ok(E5.comparisons.length > 0);
  for (const c of E5.comparisons) {
    const [x, y] = c.kind === "arm" ? [c.b, c.a] : [c.a, c.b];
    const sm = Object.fromEntries(Object.entries(boots).map(([k, v]) => [k, pairedDifferenceSummary(v, x, y)]));
    assert.equal(sm.a.separated, c.a_separated, `${c.a}|${c.b} a`);
    assert.equal(sm.b.separated, c.b_separated, `${c.a}|${c.b} b`);
    assert.equal(sm.c.separated, c.c_separated, `${c.a}|${c.b} c`);
    assert.equal(sm.c0.separated, c.c0_separated, `${c.a}|${c.b} c0`);
    assert.equal(r4(sm.c.width / sm.c0.width), c.width_ratio_c_over_c0, `${c.a}|${c.b} c/c0`);
    assert.equal(r4(sm.a.width / sm.c.width), c.width_ratio_a_over_c, `${c.a}|${c.b} a/c`);
  }
});

test("known clustering: item-clustered and item-then-reply widths exceed the naive width", () => {
  const fx = fixture({ itemSD: 0.8, noiseSD: 0.3, judgesPerReply: 2 });
  const naive = widthOf(fx, "naive"), item = widthOf(fx, "item"), two = widthOf(fx, "item_reply");
  assert.ok(item > 2 * naive, `item ${item} vs naive ${naive}`);
  assert.ok(two > 2 * naive, `item_reply ${two} vs naive ${naive}`);
  const d = pairedDifferenceSummary(bootstrapComposites({ ...fx, mode: "item_reply", seed: 3, B: 600 }), "a", "b");
  assert.ok(d.width >= 0);
});

test("planted probe: no item effect and one rating per reply, clustered is about equal to naive", () => {
  // Every item has the same true value, the panel adds no information beyond one rating per reply, so there is
  // no item clustering to find. The item-clustered interval must land near the naive one (within 25%).
  const fx = fixture({ itemSD: 0, noiseSD: 0.5, judgesPerReply: 1, itemsN: 60, repliesPerCell: 4 });
  const naive = widthOf(fx, "naive"), item = widthOf(fx, "item");
  const ratio = item / naive;
  assert.ok(ratio > 0.8 && ratio < 1.25, `item/naive = ${ratio}`);
  // the contrast: the same probe with strong item clustering is far from 1
  const clustered = fixture({ itemSD: 0.8, noiseSD: 0.5, judgesPerReply: 1, itemsN: 60, repliesPerCell: 4 });
  assert.ok(widthOf(clustered, "item") / widthOf(clustered, "naive") > 2);
});

test("percentile interval uses the floor(0.025 n) and floor(0.975 n) order statistics", () => {
  const xs = Array.from({ length: 1000 }, (_, k) => 1000 - k);
  assert.deepEqual(percentileInterval95(xs), [26, 976]);
  assert.equal(mean([1, 2, 3]), 2);
});

const goodDoc = () => ({
  status: "internal", not_a_score: true, label: "internal, not-a-score",
  design: { subjects_alphabetical: ["a", "b", "c"] },
  subjects: { a: {}, b: {}, c: {} },
  paired_differences: [{ a: "a", b: "b" }, { a: "a", b: "c" }, { a: "b", b: "c" }],
});

test("output checks: a clean document passes", () => {
  assert.deepEqual(checkIntervalsDocument(goodDoc()), []);
});

test("output checks: fail on a non-alphabetical subject order", () => {
  const d = goodDoc();
  d.subjects = { b: {}, a: {}, c: {} };
  assert.ok(checkIntervalsDocument(d).some((p) => /alphabetical/.test(p)));
  const e = goodDoc();
  e.paired_differences = [{ a: "b", b: "c" }, { a: "a", b: "b" }];
  assert.ok(checkIntervalsDocument(e).some((p) => /alphabetical/.test(p)));
  const f = goodDoc();
  f.paired_differences = [{ a: "b", b: "a" }];
  assert.ok(checkIntervalsDocument(f).length > 0);
});

test("output checks: fail on a planted ranking word, and on a missing internal label", () => {
  for (const word of ["best", "Best", "rank", "ranking", "worst", "winner"]) {
    const d = goodDoc();
    d.note = `the ${word} subject`;
    assert.ok(checkIntervalsDocument(d).some((p) => /ranking word/.test(p)), word);
  }
  const noLabel = goodDoc();
  noLabel.status = "published";
  assert.ok(checkIntervalsDocument(noLabel).some((p) => /internal/.test(p)));
  const noScore = goodDoc();
  delete noScore.not_a_score;
  noScore.label = "internal";
  assert.ok(checkIntervalsDocument(noScore).some((p) => /not-a-score/.test(p)));
});
