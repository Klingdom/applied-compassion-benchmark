/**
 * model-wave.mjs -- pure projection and validation of an assessment wave.
 *
 * Binding spec: docs/AI_MODEL_ASSESSMENT_TEMPLATE.md sections A, I and J.
 *
 *   analysis.json (A)  --projectWave-->  site/src/data/model-benchmark/waves/<run_id>.json
 *
 * Everything here is a pure function of its arguments: no file reads, no
 * clock. The exporter (research/model-runs/bin/export-wave.mjs) does the I/O;
 * the tests (site/scripts/test-model-waves.mjs) import this module so the
 * rules are written once.
 *
 * Why an allow-list: the wave file is the only thing the report may cite
 * (every figure is a token resolved against it). Whatever is not copied here
 * cannot reach a page. The wave never carries a band, a rank or a bare
 * `composite`; the only score-like keys are `pilot_composite` and
 * `pilot_composite_interval95` (template A).
 *
 * Status is read from `official` and `comparability`, never from A's prose
 * `status` string, which is deliberately not exported.
 */

import { createHash } from "node:crypto";

/** Keys that must never appear anywhere in a wave file (template A). */
export const FORBIDDEN_KEY_RE = /band|rank|score|best|worst|leader|winner/i;

/**
 * The only keys containing "composite" a wave may carry. `pilot_composite*`
 * are the per-model range and its point tick. The length bound is exported for
 * the separated model only (template A: "Never ... length-removed values for
 * non-separated models").
 */
export const COMPOSITE_KEY_ALLOW = new Set([
  "pilot_composite",
  "pilot_composite_interval95",
  "composite_if_pooled_slope_removed",
]);

/** Full paths of non-numeric descriptor keys that happen to contain "composite" (method.composite is A's one-line description of the scorer). */
export const COMPOSITE_PATH_ALLOW = new Set(["method.composite"]);

export const WAVE_SCHEMA_NOTE = "wave file: allow-listed projection of analysis.json; see docs/AI_MODEL_ASSESSMENT_TEMPLATE.md";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const alpha = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

/** sha256 of the canonical (parse then stringify) form: independent of CRLF and indentation. */
export function canonicalSha256(analysisObject) {
  return createHash("sha256").update(JSON.stringify(analysisObject)).digest("hex");
}

function isNum(x) {
  return typeof x === "number" && Number.isFinite(x);
}
function isRange(x) {
  return Array.isArray(x) && x.length === 2 && isNum(x[0]) && isNum(x[1]) && x[0] <= x[1];
}
const crosses = (iv) => iv[0] <= 0 && iv[1] >= 0;

// ---------------------------------------------------------------------------
// G9: analysis schema. Returns a list of problems (empty = valid). Each problem
// starts with a stable rule id so a negative control can assert WHICH rule
// tripped, not merely that something did.
// ---------------------------------------------------------------------------

export function analysisProblems(a) {
  const p = [];
  const bad = (rule, msg) => p.push(`${rule}: ${msg}`);
  if (!a || typeof a !== "object") return ["A-shape: analysis is not an object"];
  if (typeof a.run_id !== "string" || a.run_id.length === 0) bad("A-run-id", "run_id missing");
  for (const k of ["design", "method", "subjects", "pairwise", "dimension_pairwise", "dimension_pairwise_note", "length", "judges", "quote_grounding", "operations", "exclusion_record", "routing", "sensitivity"]) {
    if (a[k] === undefined) bad("A-required", `top-level ${k} missing`);
  }
  if (p.length) return p;

  const ids = Object.keys(a.subjects).sort(alpha);
  if (ids.length < 2) bad("A-subjects", "need at least two subjects");
  if (JSON.stringify([...a.design.subjects].sort(alpha)) !== JSON.stringify(ids)) bad("A-subjects", "design.subjects does not match subjects keys");

  // Status is carried by official/comparability on every subject. Pilot only.
  for (const id of ids) {
    const s = a.subjects[id];
    if (s.official !== false) bad("A-official", `${id}.official must be false (official waves are disabled), got ${JSON.stringify(s.official)}`);
    if (s.comparability !== "none") bad("A-comparability", `${id}.comparability must be "none", got ${JSON.stringify(s.comparability)}`);
  }
  if (p.length) return p;

  const dims = Object.keys(a.subjects[ids[0]].dimensions ?? {});
  if (dims.length === 0) bad("A-dimensions", "no dimensions");
  for (const id of ids) {
    const s = a.subjects[id];
    if (!isNum(s.composite)) bad("A-composite", `${id}.composite not numeric`);
    if (!isRange(s.interval95)) bad("A-interval", `${id}.interval95 malformed`);
    else if (isNum(s.composite) && !(s.interval95[0] <= s.composite && s.composite <= s.interval95[1])) {
      bad("A-interval-contains", `${id}: composite ${s.composite} lies outside interval95 ${JSON.stringify(s.interval95)}`);
    }
    if (JSON.stringify(Object.keys(s.dimensions ?? {})) !== JSON.stringify(dims)) bad("A-dimensions", `${id}: dimension keys differ from the first subject`);
    for (const d of dims) {
      const iv = s.dimension_intervals95?.[d];
      if (!isRange(iv)) bad("A-dim-interval", `${id}.${d} interval malformed`);
      else if (!(iv[0] <= s.dimensions[d] && s.dimensions[d] <= iv[1])) bad("A-dim-interval-contains", `${id}.${d}: mean outside its interval`);
      if (!Number.isInteger(s.dimension_item_counts?.[d])) bad("A-item-counts", `${id}.${d} item count missing`);
    }
    if (!Number.isInteger(s.median_reply_words)) bad("A-words", `${id}.median_reply_words missing`);
    if (typeof s.contamination !== "object" || typeof s.judge_agreement !== "object") bad("A-required", `${id}: contamination or judge_agreement missing`);
  }
  if (p.length) return p;

  const base = JSON.stringify(a.subjects[ids[0]].dimension_item_counts);
  for (const id of ids) if (JSON.stringify(a.subjects[id].dimension_item_counts) !== base) bad("A-item-counts", `${id}: item counts differ across subjects`);
  const d = a.design;
  const itemSum = Object.values(a.subjects[ids[0]].dimension_item_counts).reduce((x, y) => x + y, 0);
  if (itemSum !== d.items_served) bad("A-counts", `dimension item counts sum to ${itemSum}, design.items_served is ${d.items_served}`);
  if (d.responses !== ids.length * d.items_served * d.trials_per_subject) bad("A-counts", "design.responses != subjects x items_served x trials_per_subject");
  if (d.ratings !== d.responses * d.judges_per_response) bad("A-counts", "design.ratings != responses x judges_per_response");

  // pairwise: every unordered pair once, flag consistent with its own interval.
  const want = (ids.length * (ids.length - 1)) / 2;
  const seen = new Set();
  for (const e of a.pairwise) {
    const key = [e.a, e.b].sort(alpha).join("|");
    if (!ids.includes(e.a) || !ids.includes(e.b) || e.a === e.b) bad("A-pairwise", `unknown or self pair ${e.a}/${e.b}`);
    else if (e.a > e.b) bad("A-pairwise", `${key}: a must sort before b (alphabetical, so order carries no meaning)`);
    if (seen.has(key)) bad("A-pairwise", `duplicate pair ${key}`);
    seen.add(key);
    if (typeof e.separated !== "boolean") bad("A-pairwise", `${key}: separated not boolean`);
    if (!isRange(e.interval95)) bad("A-pairwise", `${key}: interval malformed`);
    else if (e.separated !== !crosses(e.interval95)) bad("A-pairwise-consistent", `${key}: separated=${e.separated} contradicts interval ${JSON.stringify(e.interval95)}`);
  }
  if (seen.size !== want) bad("A-pairwise", `expected ${want} pairs, found ${seen.size}`);

  const wantDim = want * dims.length;
  const seenD = new Set();
  for (const e of a.dimension_pairwise) {
    const key = [e.a, e.b].sort(alpha).join("|") + "|" + e.dimension;
    if (seenD.has(key)) bad("A-dim-pairwise", `duplicate ${key}`);
    seenD.add(key);
    if (!dims.includes(e.dimension)) bad("A-dim-pairwise", `unknown dimension in ${key}`);
    if (!isRange(e.interval95)) bad("A-dim-pairwise", `${key}: interval malformed`);
    else if (e.separated !== !crosses(e.interval95)) bad("A-dim-pairwise-consistent", `${key}: separated flag contradicts its interval`);
    if (typeof e.bonferroni_separated !== "boolean") bad("A-dim-pairwise", `${key}: bonferroni_separated not boolean`);
    if (e.bonferroni_separated && !e.separated) bad("A-dim-pairwise-consistent", `${key}: Bonferroni-separated but not separated at 95%`);
  }
  if (seenD.size !== wantDim) bad("A-dim-pairwise", `expected ${wantDim} dimension comparisons, found ${seenD.size}`);
  if (typeof a.dimension_pairwise_note !== "string" || !a.dimension_pairwise_note) bad("A-required", "dimension_pairwise_note empty");
  p.push(...sensitivityProblems(a.sensitivity, ids, a.pairwise, "A"));
  return p;
}

/**
 * The judge-sensitivity block (template amendment 3), shared by analysis (prefix "A")
 * and wave (prefix "W") validation. `pairwise` is the main analysis's pairwise list.
 */
export function sensitivityProblems(s, ids, pairwise, prefix) {
  const p = [];
  const bad = (rule, msg) => p.push(`${prefix}-${rule}: ${msg}`);
  if (!s || typeof s !== "object") return [`${prefix}-sensitivity: sensitivity block missing or not an object`];
  for (const k of ["question", "method", "note"]) if (typeof s[k] !== "string" || !s[k]) bad("sensitivity", `${k} missing`);
  if (!Number.isInteger(s.ratings_used) || s.ratings_used <= 0) bad("sensitivity", "ratings_used must be a positive integer");
  if (typeof s.separation_pattern_unchanged !== "boolean") bad("sensitivity", "separation_pattern_unchanged must be boolean");
  if (JSON.stringify(Object.keys(s.subjects ?? {}).sort(alpha)) !== JSON.stringify([...ids].sort(alpha))) {
    bad("sensitivity", "sensitivity.subjects keys differ from the subjects");
    return p;
  }
  for (const id of ids) {
    const e = s.subjects[id];
    const iv = e.pilot_composite_interval95 ?? e.interval95;
    if (!isNum(e.pilot_composite) && !isNum(e.composite)) bad("sensitivity", `${id}: point not numeric`);
    else if (!isRange(iv)) bad("sensitivity", `${id}: interval malformed`);
    else {
      const pt = e.pilot_composite ?? e.composite;
      if (!(iv[0] <= pt && pt <= iv[1])) bad("sensitivity-contains", `${id}: point ${pt} lies outside its interval`);
    }
  }
  const seen = new Set();
  for (const e of s.pairwise ?? []) {
    const key = [e.a, e.b].sort(alpha).join("|");
    if (!ids.includes(e.a) || !ids.includes(e.b) || e.a === e.b || seen.has(key)) bad("sensitivity-pairwise", `unknown, self or duplicate pair ${key}`);
    seen.add(key);
    if (!isRange(e.interval95) || typeof e.separated !== "boolean") bad("sensitivity-pairwise", `${key}: interval or flag malformed`);
    else if (e.separated !== !crosses(e.interval95)) bad("sensitivity-pairwise-consistent", `${key}: separated=${e.separated} contradicts interval ${JSON.stringify(e.interval95)}`);
  }
  if (seen.size !== (ids.length * (ids.length - 1)) / 2) bad("sensitivity-pairwise", `expected ${(ids.length * (ids.length - 1)) / 2} pairs, found ${seen.size}`);
  if (!p.length) {
    const main = new Map(pairwise.map((e) => [[e.a, e.b].sort(alpha).join("|"), e.separated]));
    const same = s.pairwise.every((e) => main.get([e.a, e.b].sort(alpha).join("|")) === e.separated);
    if (same !== s.separation_pattern_unchanged) bad("sensitivity-pattern", `separation_pattern_unchanged is ${s.separation_pattern_unchanged} but the pairwise flags say ${same}`);
  }
  return p;
}

// ---------------------------------------------------------------------------
// Separation structure
// ---------------------------------------------------------------------------

/**
 * Not-separated groups: connected components (size >= 2) of the "not separated"
 * relation. Each must be a CLIQUE, otherwise "the three cannot be told apart"
 * would be a claim the data does not support (A~B and B~C but A, C separated).
 * Order: size descending, then first label; members alphabetical.
 */
export function notSeparatedGroups(ids, pairwise) {
  const notSep = new Set();
  for (const e of pairwise) if (!e.separated) notSep.add([e.a, e.b].sort(alpha).join("|"));
  const adj = new Map(ids.map((i) => [i, new Set()]));
  for (const k of notSep) {
    const [x, y] = k.split("|");
    adj.get(x).add(y);
    adj.get(y).add(x);
  }
  const seen = new Set();
  const groups = [];
  for (const id of [...ids].sort(alpha)) {
    if (seen.has(id)) continue;
    const comp = [];
    const stack = [id];
    while (stack.length) {
      const n = stack.pop();
      if (seen.has(n)) continue;
      seen.add(n);
      comp.push(n);
      for (const m of adj.get(n)) stack.push(m);
    }
    if (comp.length < 2) continue;
    comp.sort(alpha);
    for (let i = 0; i < comp.length; i++)
      for (let j = i + 1; j < comp.length; j++)
        if (!notSep.has(`${comp[i]}|${comp[j]}`)) {
          throw new Error(`not-separated group {${comp.join(", ")}} is not a clique: ${comp[i]} and ${comp[j]} are separated. "Cannot tell apart" would not hold for the whole group; the exporter refuses.`);
        }
    groups.push(comp);
  }
  groups.sort((g, h) => h.length - g.length || alpha(g[0], h[0]));
  return groups;
}

const minMax = (xs) => [Math.min(...xs), Math.max(...xs)];

/**
 * Derived facts, computed here so prose never needs arithmetic. Works from wave
 * fields only (so validateWave can recompute and compare). `primary group` is
 * the largest not-separated group.
 */
export function computeDerived(w) {
  const ids = Object.keys(w.subjects).sort(alpha);
  const groups = notSeparatedGroups(ids, w.pairwise);
  const grouped = new Set(groups.flat());
  const primary = groups[0] ?? [];
  const inPrimary = new Set(primary);
  const sepPairs = w.pairwise.filter((e) => e.separated).map((e) => [e.a, e.b].sort(alpha));
  sepPairs.sort((x, y) => alpha(x.join("|"), y.join("|")));
  const among = w.dimension_pairwise.filter((e) => inPrimary.has(e.a) && inPrimary.has(e.b));
  const outside = ids.filter((i) => !inPrimary.has(i));
  const forObj = {};
  const ofObj = {};
  for (const id of outside) {
    const mine = w.dimension_pairwise.filter((e) => e.a === id || e.b === id);
    forObj[id] = mine.filter((e) => e.bonferroni_separated).length;
    ofObj[id] = mine.length;
  }
  // Level shift under the judge sensitivity (template amendment 3): sensitivity point minus published point,
  // one decimal. The range is over EVERY member of every not-separated group, never per member, so it shows
  // how far levels move without giving the group an order.
  const r1 = (x) => Math.round(x * 10) / 10 + 0; // + 0 turns -0 into 0
  const shift = Object.fromEntries(ids.map((i) => [i, r1(w.sensitivity.subjects[i].pilot_composite - w.subjects[i].pilot_composite)]));
  const grouped2 = groups.flat();
  return {
    not_separated_groups: groups,
    not_separated_group_range: primary.length ? minMax(primary.map((i) => w.subjects[i].pilot_composite)) : null,
    not_separated_group_ranges: groups.map((g) => minMax(g.map((i) => w.subjects[i].pilot_composite))),
    separated_subjects: ids.filter((i) => !grouped.has(i)),
    separated_pairs: sepPairs,
    dimension_bonferroni_separated_among_group: among.filter((e) => e.bonferroni_separated).length,
    dimension_comparisons_among_group: among.length,
    dimension_bonferroni_separated_for: forObj,
    dimension_bonferroni_separated_of: ofObj,
    median_words_group_range: primary.length ? minMax(primary.map((i) => w.subjects[i].median_reply_words)) : null,
    sensitivity_level_shift_group_range: grouped2.length ? minMax(grouped2.map((i) => shift[i])) : null,
    sensitivity_level_shift: shift,
    subject_count: ids.length,
    ratings_total: w.design.ratings,
    responses_total: w.design.responses,
  };
}

// ---------------------------------------------------------------------------
// Key scan
// ---------------------------------------------------------------------------

/** Every key anywhere in `x` that is forbidden by template A. Returns "path: key" strings. */
export function forbiddenKeys(x, path = "") {
  const out = [];
  if (Array.isArray(x)) {
    x.forEach((v, i) => out.push(...forbiddenKeys(v, `${path}[${i}]`)));
  } else if (x && typeof x === "object") {
    for (const [k, v] of Object.entries(x)) {
      const here = path ? `${path}.${k}` : k;
      if (FORBIDDEN_KEY_RE.test(k)) out.push(`${here}: key matches ${FORBIDDEN_KEY_RE}`);
      else if (/composite/i.test(k) && !COMPOSITE_KEY_ALLOW.has(k) && !COMPOSITE_PATH_ALLOW.has(here)) out.push(`${here}: composite key not on the allow-list`);
      out.push(...forbiddenKeys(v, here));
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Projection
// ---------------------------------------------------------------------------

const clone = (x) => JSON.parse(JSON.stringify(x));

/**
 * @param {object} analysis  parsed analysis.json
 * @param {object} ctx
 *   bank     { items_total, items_validated, version }  from MODEL_INDEX_FACTS (imported, not re-derived)
 *   decision { ref, status }                             from DECISIONS.md at export
 *   reportDate "YYYY-MM-DD"
 */
export function projectWave(analysis, ctx) {
  const problems = analysisProblems(analysis);
  if (problems.length) throw new Error(`analysis.json is not exportable:\n  ${problems.join("\n  ")}`);
  if (!DATE_RE.test(ctx.reportDate ?? "")) throw new Error("projectWave: reportDate must be YYYY-MM-DD");
  const b = ctx.bank;
  for (const k of ["items_total", "items_validated", "items_served", "items_not_served", "items_not_served_sensitive", "items_not_served_unreviewed"]) {
    if (!Number.isInteger(b[k]) || b[k] < 0) throw new Error(`projectWave: ctx.bank.${k} must be a non-negative integer`);
  }
  if (!Number.isInteger(ctx.items_per_conversation_max) || ctx.items_per_conversation_max < 1) throw new Error("projectWave: ctx.items_per_conversation_max must be a positive integer");
  if (b.items_served + b.items_not_served !== b.items_total) throw new Error("projectWave: items_served + items_not_served != items_total");
  if (b.items_not_served_sensitive + b.items_not_served_unreviewed !== b.items_not_served) throw new Error("projectWave: sensitive + unreviewed != items_not_served");
  if (b.items_served !== analysis.design.items_served) throw new Error(`projectWave: the bank's serving rule gives ${b.items_served} items but the analysis served ${analysis.design.items_served}`);
  if (ctx.bank.version !== analysis.design.bank_version) {
    throw new Error(`bank version mismatch: analysis used ${analysis.design.bank_version}, tasks-v1.json is ${ctx.bank.version}`);
  }
  const ids = Object.keys(analysis.subjects).sort(alpha);

  const w = {
    run_id: analysis.run_id,
    official: false,
    comparability: "none",
    report_date: ctx.reportDate,
    source_sha256: canonicalSha256(analysis),
    publication: { decision_ref: ctx.decision.ref, decision_status: ctx.decision.status },
    bank: {
      items_total: ctx.bank.items_total,
      items_validated: ctx.bank.items_validated,
      items_served: ctx.bank.items_served,
      items_not_served: ctx.bank.items_not_served,
      items_not_served_sensitive: ctx.bank.items_not_served_sensitive,
      items_not_served_unreviewed: ctx.bank.items_not_served_unreviewed,
    },
    design: { ...clone(analysis.design), items_per_conversation_max: ctx.items_per_conversation_max },
    method: clone(analysis.method),
    subjects: {},
  };
  for (const id of ids) {
    const s = analysis.subjects[id];
    w.subjects[id] = {
      pilot_composite: s.composite,
      pilot_composite_interval95: [...s.interval95],
      dimensions: clone(s.dimensions),
      dimension_intervals95: clone(s.dimension_intervals95),
      dimension_item_counts: clone(s.dimension_item_counts),
      median_reply_words: s.median_reply_words,
      contamination: clone(s.contamination),
      judge_agreement: clone(s.judge_agreement),
    };
  }
  // Sorted, so the file does not depend on the order A happened to list things in.
  const dimOrder = Object.keys(analysis.subjects[ids[0]].dimensions);
  w.pairwise = clone(analysis.pairwise).sort((x, y) => alpha(x.a + "|" + x.b, y.a + "|" + y.b));
  w.dimension_pairwise = clone(analysis.dimension_pairwise).sort((x, y) => alpha(x.a + "|" + x.b, y.a + "|" + y.b) || dimOrder.indexOf(x.dimension) - dimOrder.indexOf(y.dimension));
  w.dimension_pairwise_note = analysis.dimension_pairwise_note;

  const groups = notSeparatedGroups(ids, analysis.pairwise);
  const grouped = new Set(groups.flat());
  const separated = ids.filter((i) => !grouped.has(i));
  w.length = clone(analysis.length);
  // A bound for a non-separated model would impose an order on the group.
  const bound = {};
  for (const id of separated) if (analysis.length.composite_if_pooled_slope_removed?.[id] !== undefined) bound[id] = analysis.length.composite_if_pooled_slope_removed[id];
  w.length.composite_if_pooled_slope_removed = bound;

  w.judges = clone(analysis.judges);
  w.quote_grounding = clone(analysis.quote_grounding);
  w.operations = clone(analysis.operations);
  w.routing = clone(analysis.routing);
  w.exclusion_record = clone(analysis.exclusion_record);
  delete w.exclusion_record.measured_original_answer_stats; // template B10: never quoted
  const sn = analysis.sensitivity;
  w.sensitivity = {
    question: sn.question,
    method: sn.method,
    note: sn.note,
    ratings_used: sn.ratings_used,
    subjects: Object.fromEntries(ids.map((id) => [id, { pilot_composite: sn.subjects[id].pilot_composite, pilot_composite_interval95: [...sn.subjects[id].interval95] }])),
    pairwise: clone(sn.pairwise).sort((x, y) => alpha(x.a + "|" + x.b, y.a + "|" + y.b)),
    separation_pattern_unchanged: sn.separation_pattern_unchanged,
  };
  w.derived = computeDerived(w);

  const forbidden = forbiddenKeys(w);
  if (forbidden.length) throw new Error(`forbidden keys in wave:\n  ${forbidden.join("\n  ")}`);
  return w;
}

export function serialiseWave(w) {
  return JSON.stringify(w, null, 2) + "\n";
}

// ---------------------------------------------------------------------------
// G15: wave validation (reads only the wave)
// ---------------------------------------------------------------------------

export function waveProblems(w) {
  const p = [];
  const bad = (rule, msg) => p.push(`${rule}: ${msg}`);
  if (!w || typeof w !== "object") return ["W-shape: not an object"];
  if (typeof w.run_id !== "string" || !w.run_id) bad("W-run-id", "run_id missing");
  if (w.official !== false) bad("W-official", `official must be false (official wave rendering is disabled), got ${JSON.stringify(w.official)}`);
  if (w.comparability !== "none") bad("W-comparability", `comparability must be "none" for a pilot, got ${JSON.stringify(w.comparability)}`);
  if (!DATE_RE.test(w.report_date ?? "")) bad("W-date", "report_date not YYYY-MM-DD");
  if (!/^[0-9a-f]{64}$/.test(w.source_sha256 ?? "")) bad("W-sha", "source_sha256 is not a sha256");
  if (!Number.isInteger(w.bank?.items_total) || !Number.isInteger(w.bank?.items_validated)) bad("W-bank", "bank.items_total / items_validated must be integers");
  else if (w.bank.items_validated > w.bank.items_total) bad("W-bank", "items_validated exceeds items_total");
  if (!["active", "proposed", "superseded", "unresolved"].includes(w.publication?.decision_status)) bad("W-publication", "publication.decision_status missing or outside the DECISIONS.md vocabulary");
  if (p.length) return p;

  for (const f of forbiddenKeys(w)) bad("W-forbidden-key", f);
  const ids = Object.keys(w.subjects ?? {});
  if (JSON.stringify(ids) !== JSON.stringify([...ids].sort(alpha))) bad("W-order", "subjects are not in alphabetical key order (order must carry no meaning)");
  if (JSON.stringify([...(w.design?.subjects ?? [])]) !== JSON.stringify(ids)) bad("W-order", "design.subjects does not equal the subject keys in order");
  for (const id of ids) {
    const s = w.subjects[id];
    if (!isNum(s.pilot_composite) || !isRange(s.pilot_composite_interval95)) bad("W-subject", `${id}: pilot_composite or its interval malformed`);
    else if (!(s.pilot_composite_interval95[0] <= s.pilot_composite && s.pilot_composite <= s.pilot_composite_interval95[1])) bad("W-subject", `${id}: point outside its range`);
    for (const banned of ["composite", "interval95", "band", "official", "comparability"]) if (banned in s) bad("W-subject", `${id}.${banned} must not be exported (use pilot_* keys)`);
  }
  if (p.length) return p;

  // Bank serving counts and the conversation size (template amendment 4).
  const bk = w.bank;
  for (const k of ["items_served", "items_not_served", "items_not_served_sensitive", "items_not_served_unreviewed"]) if (!Number.isInteger(bk[k]) || bk[k] < 0) bad("W-bank", `bank.${k} must be a non-negative integer`);
  if (!p.length) {
    if (bk.items_served + bk.items_not_served !== bk.items_total) bad("W-bank", "items_served + items_not_served != items_total");
    if (bk.items_not_served_sensitive + bk.items_not_served_unreviewed !== bk.items_not_served) bad("W-bank", "sensitive + unreviewed != items_not_served");
    if (bk.items_served !== w.design?.items_served) bad("W-bank", "bank.items_served != design.items_served");
  }
  if (!Number.isInteger(w.design?.items_per_conversation_max) || w.design.items_per_conversation_max < 1) bad("W-design", "design.items_per_conversation_max must be a positive integer");
  if (p.length) return p;

  // Separation flags agree with their own intervals; the group structure is a clique.
  for (const e of w.pairwise) if (e.separated !== !crosses(e.interval95)) bad("W-pairwise", `${e.a}/${e.b}: flag contradicts interval`);
  for (const e of w.dimension_pairwise) {
    if (e.separated !== !crosses(e.interval95)) bad("W-dim-pairwise", `${e.a}/${e.b}/${e.dimension}: flag contradicts interval`);
    if (e.bonferroni_separated && !e.separated) bad("W-dim-pairwise", `${e.a}/${e.b}/${e.dimension}: Bonferroni flag without 95% flag`);
  }
  // The sensitivity block is validated after the main flags so a flipped main flag reports as itself (and as a pattern change).
  const sp = sensitivityProblems(w.sensitivity, ids, w.pairwise, "W");
  p.push(...sp);
  if (sp.some((m) => !m.startsWith("W-sensitivity-pattern"))) return p;
  let derived;
  try {
    derived = computeDerived(w);
  } catch (e) {
    bad("W-clique", e.message);
    return p;
  }
  if (JSON.stringify(derived) !== JSON.stringify(w.derived)) bad("W-derived", "derived does not equal its recomputation from the wave's own fields");
  const bound = Object.keys(w.length?.composite_if_pooled_slope_removed ?? {});
  for (const id of bound) if (!derived.separated_subjects.includes(id)) bad("W-bound", `length bound exported for ${id}, which is in a not-separated group (it would impose an order)`);
  for (const id of derived.separated_subjects) if (!bound.includes(id) && w.length?.composite_if_pooled_slope_removed !== undefined && bound.length) bad("W-bound", `separated subject ${id} has no bound while another does`);
  if (w.exclusion_record && "measured_original_answer_stats" in w.exclusion_record) bad("W-exclusion", "measured_original_answer_stats must not be exported (template B10)");
  return p;
}

// ---------------------------------------------------------------------------
// Decisions and manifest
// ---------------------------------------------------------------------------

/**
 * Status of a decision from DECISIONS.md's index table. The row looks like
 *   | D-29a | 2026-10-01 | Unofficial pilot reports ... | **proposed -- built on ...** |
 * Returns the first word of the status cell, lowercased. Throws on an absent
 * row, so an exporter run cannot silently invent an approval.
 */
export function parseDecisionStatus(decisionsText, ref) {
  const row = decisionsText.split("\n").find((l) => new RegExp(`^\\|\\s*${ref}\\s*\\|`).test(l));
  if (!row) throw new Error(`DECISIONS.md has no index row for ${ref}`);
  const cells = row.split("|").map((c) => c.trim()).filter(Boolean);
  const status = cells[cells.length - 1].replace(/[*`_]/g, "").trim().split(/[\s,;:—-]+/)[0].toLowerCase();
  if (!["active", "proposed", "superseded", "unresolved"].includes(status)) throw new Error(`${ref} status "${status}" is outside the DECISIONS.md vocabulary`);
  return status;
}

export function manifestEntry(w) {
  return {
    run_id: w.run_id,
    status: w.official ? "official" : "pilot",
    official: w.official,
    comparability: w.comparability,
    report_date: w.report_date,
    decision_ref: w.publication.decision_ref,
    decision_status: w.publication.decision_status,
  };
}

/** Newest first, then run_id. */
export function sortManifest(entries) {
  return [...entries].sort((a, b) => alpha(b.report_date, a.report_date) || alpha(a.run_id, b.run_id));
}

export function serialiseManifest(entries) {
  return JSON.stringify(sortManifest(entries), null, 2) + "\n";
}
