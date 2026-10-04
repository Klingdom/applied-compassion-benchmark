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
const neg = (x) => (x === 0 ? 0 : -x); // never -0

const cloneJson = (x) => JSON.parse(JSON.stringify(x));

// ---------------------------------------------------------------------------
// Arms runs (template amendment 16)
// ---------------------------------------------------------------------------

/**
 * An ARMS run has `design.arms`: every subject is a (build, arm) variant, for example one build run with and without a system
 * instruction. Its comparisons are pre-declared (`comparisons`) and its display rule is the coordinator's amendment 16.
 */
export const isArmsDesign = (d) => !!d && typeof d.arms === "object" && d.arms !== null && !Array.isArray(d.arms);

/** The build a variant belongs to: its id without the "-<arm>" suffix ("x-3b-A" with arm "A" gives "x-3b"). */
export const buildIdOf = (id, arm) => (typeof arm === "string" && arm && id.endsWith(`-${arm}`) ? id.slice(0, -(arm.length + 1)) : id);

/** The arm that carries the primary, corrected comparison and the only points that may ever be shown. */
export const PRIMARY_ARM = "A";

/**
 * Amendment 16 in one sentence, carried in `derived.display_rule` of every arms wave so that the rule travels with the data
 * and every gate reads one source.
 */
export const DISPLAY_RULE_TEXT =
  "The pre-registration reports an uncorrected 95% interval and a Bonferroni-corrected interval for each primary comparison and promotes neither. " +
  "Showing a point is a more consequential public act than reporting a range, so the point display takes the stricter evidence: " +
  "in the primary arm only a subject separated from every other subject after correction may show a point; subjects not separated after correction, " +
  "and every variant of the secondary one-trial arm, show ranges only; no point difference that involves a withheld subject is shown. " +
  "A pair separated only without correction may be stated in words with its uncorrected range, never as a point or an ordering.";

/**
 * Orient a list of pairwise entries so that `a` sorts before `b`. An analysis may list a pair as "qwen minus
 * llama" (the pre-registered direction); the wave lists every pair alphabetically so that the order of a
 * pair never carries a result (template A: alphabetical, order carries no meaning). Swapping a and b negates the
 * difference and mirrors the interval; the separated flags are unchanged. A pure function of its input.
 */
export function orientPairs(list) {
  return list.map((e) => {
    if (!e || typeof e.a !== "string" || typeof e.b !== "string" || e.a <= e.b) return e;
    const o = { ...e, a: e.b, b: e.a };
    if (isNum(e.difference)) o.difference = neg(e.difference);
    if (isRange(e.interval95)) o.interval95 = [neg(e.interval95[1]), neg(e.interval95[0])];
    return o;
  });
}

/**
 * The analysis with every pair oriented alphabetically (a no-op on an analysis that already is). Applied by
 * projectWave before validation, so the A-pairwise rule still guards an analysis that is mis-ordered AFTER this step.
 */
export function normaliseAnalysis(a) {
  if (!a || typeof a !== "object") return a;
  const out = cloneJson(a);
  if (Array.isArray(out.pairwise)) out.pairwise = orientPairs(out.pairwise);
  if (Array.isArray(out.dimension_pairwise)) out.dimension_pairwise = orientPairs(out.dimension_pairwise);
  if (out.sensitivity && Array.isArray(out.sensitivity.pairwise)) out.sensitivity.pairwise = orientPairs(out.sensitivity.pairwise);
  return out;
}

/** An object keyed by subject ids, with its keys in alphabetical order (insertion order must not follow a result). */
function orderBySubject(obj, ids) {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) return obj;
  const keys = Object.keys(obj);
  if (keys.length === 0 || !keys.every((k) => ids.includes(k))) return obj;
  return Object.fromEntries([...keys].sort(alpha).map((k) => [k, obj[k]]));
}

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
  for (const k of ["design", "method", "subjects", "pairwise", "dimension_pairwise", "dimension_pairwise_note", "length", "judges", "operations", "routing", "sensitivity"]) {
    if (a[k] === undefined) bad("A-required", `top-level ${k} missing`);
  }
  // Quote evidence is either the first pilot's quote_grounding or the later runs' judge_validity (pre-registered rule);
  // an exclusion_record exists only when a judge was excluded (a run with no exclusion has nothing to record).
  if (a.quote_grounding === undefined && a.judge_validity === undefined) bad("A-required", "top-level quote_grounding (or judge_validity) missing");
  if (isArmsDesign(a.design)) for (const k of ["comparisons", "length_check"]) if (a[k] === undefined) bad("A-required", `top-level ${k} missing (an arms run declares its comparisons and checks its length instruction)`);
  if (a.design && Array.isArray(a.design.excluded_judges) && a.design.excluded_judges.length > 0 && a.exclusion_record === undefined) {
    bad("A-required", "top-level exclusion_record missing although design.excluded_judges is not empty");
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
  const arms = isArmsDesign(d);
  const trialsOf = (id) => (arms ? d.trials_per_subject?.[id] : d.trials_per_subject);
  if (arms && ids.some((id) => !Number.isInteger(trialsOf(id)) || trialsOf(id) < 1)) bad("A-counts", "an arms run needs design.trials_per_subject as a map of positive integers, one per subject");
  else if (d.responses !== ids.reduce((n, id) => n + d.items_served * trialsOf(id), 0)) bad("A-counts", "design.responses != the sum over subjects of items_served x trials");
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

  // An arms run compares dimensions only inside the primary arm (the secondary arm has one trial and no dimension-level claim).
  const primaryIds = arms ? ids.filter((i) => d.arms?.[i]?.arm === PRIMARY_ARM) : ids;
  const wantDim = ((primaryIds.length * (primaryIds.length - 1)) / 2) * dims.length;
  const seenD = new Set();
  for (const e of a.dimension_pairwise) {
    const key = [e.a, e.b].sort(alpha).join("|") + "|" + e.dimension;
    if (arms && !(primaryIds.includes(e.a) && primaryIds.includes(e.b))) bad("A-dim-pairwise", `${key}: an arms run compares dimensions inside the primary arm only`);
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
  if (arms) p.push(...armsProblems(a, ids, "A"));
  return p;
}

/**
 * The arms structure and its pre-declared comparisons, shared by analysis (prefix "A") and wave (prefix "W") validation.
 * `x` is the analysis or the wave: both carry design.arms, comparisons, length_check, subjects (median reply words).
 * Rule ids are `${prefix}-arms*`, `${prefix}-comparison*` and `${prefix}-length-check*`.
 */
export function armsProblems(x, ids, prefix) {
  const p = [];
  const bad = (rule, msg) => p.push(`${prefix}-${rule}: ${msg}`);
  const arms = x.design?.arms;
  if (!isArmsDesign(x.design)) return [`${prefix}-arms: design.arms missing`];
  if (JSON.stringify(Object.keys(arms).sort(alpha)) !== JSON.stringify([...ids].sort(alpha))) {
    bad("arms", "design.arms keys differ from the subjects");
    return p;
  }
  const armNames = [...new Set(ids.map((i) => arms[i].arm))].sort(alpha);
  if (JSON.stringify(armNames) !== JSON.stringify(["A", "B"])) bad("arms", `expected exactly the arms A and B, found ${armNames.join(", ")}`);
  const sysOf = (arm) => [...new Set(ids.filter((i) => arms[i].arm === arm).map((i) => arms[i].system_message_sha256))];
  for (const arm of armNames) if (sysOf(arm).length !== 1 || !/^[0-9a-f]{64}$/.test(sysOf(arm)[0] ?? "")) bad("arms", `arm ${arm}: every variant must carry the same system_message_sha256 (the message is identical within an arm)`);
  if (armNames.length === 2 && sysOf("A")[0] === sysOf("B")[0]) bad("arms", "the two arms carry the same system message hash (they would not differ)");
  const builds = new Map();
  for (const id of ids) {
    const e = arms[id];
    const t = x.design.trials_per_subject?.[id];
    if (e.trials !== t) bad("arms", `${id}: design.arms trials ${e.trials} differ from design.trials_per_subject ${t}`);
    const b = buildIdOf(id, e.arm);
    if (b === id) bad("arms", `${id}: an arms id must end in -${e.arm}`);
    builds.set(b, [...(builds.get(b) ?? []), e.arm].sort(alpha));
  }
  for (const [b, list] of builds) if (JSON.stringify(list) !== JSON.stringify(["A", "B"])) bad("arms", `build ${b} must have exactly one A and one B variant, has ${list.join(",") || "none"}`);
  if (p.length) return p;

  // comparisons: pre-declared; every build pair in each arm, and every build's B against A.
  const cs = x.comparisons;
  if (!Array.isArray(cs)) return [...p, `${prefix}-comparison: comparisons is not a list`];
  const nBuilds = builds.size;
  const pairsPerArm = (nBuilds * (nBuilds - 1)) / 2;
  const kinds = { build: 0, arm: 0 };
  const seen = new Set();
  for (const e of cs) {
    const key = `${e.a}|${e.b}`;
    if (!ids.includes(e.a) || !ids.includes(e.b) || e.a === e.b) { bad("comparison", `unknown or self comparison ${key}`); continue; }
    if (e.a > e.b) bad("comparison", `${key}: a must sort before b (alphabetical, so order carries no meaning)`);
    if (seen.has(key)) bad("comparison", `duplicate comparison ${key}`);
    seen.add(key);
    const [aa, ab] = [arms[e.a].arm, arms[e.b].arm];
    if (e.arm_a !== aa || e.arm_b !== ab) bad("comparison", `${key}: arm_a/arm_b do not match design.arms`);
    if (e.kind === "build") {
      kinds.build += 1;
      if (aa !== ab) bad("comparison", `${key}: a build comparison must stay inside one arm`);
      if (buildIdOf(e.a, aa) === buildIdOf(e.b, ab)) bad("comparison", `${key}: a build comparison needs two different builds`);
    } else if (e.kind === "arm") {
      kinds.arm += 1;
      if (buildIdOf(e.a, aa) !== buildIdOf(e.b, ab) || aa === ab) bad("comparison", `${key}: an arm comparison is one build in its two arms`);
    } else bad("comparison", `${key}: kind must be "build" or "arm"`);
    if (!isNum(e.difference) || !isRange(e.interval95) || typeof e.separated !== "boolean") { bad("comparison", `${key}: difference, interval or flag malformed`); continue; }
    if (e.separated !== !crosses(e.interval95)) bad("comparison-consistent", `${key}: separated=${e.separated} contradicts interval ${JSON.stringify(e.interval95)}`);
    if (!isNum(e.median_reply_words_a) || !isNum(e.median_reply_words_b)) bad("comparison", `${key}: median reply words missing`);
    else if (e.median_reply_words_a !== x.subjects[e.a].median_reply_words || e.median_reply_words_b !== x.subjects[e.b].median_reply_words) bad("comparison", `${key}: median reply words differ from the subjects'`);
    // The corrected interval exists exactly for the primary arm's build comparisons.
    const primaryBuild = e.kind === "build" && aa === PRIMARY_ARM;
    if (primaryBuild) {
      const bf = e.bonferroni;
      if (!bf || !isRange(bf.interval) || typeof bf.separated !== "boolean" || !Number.isInteger(bf.comparisons) || !isNum(bf.confidence_percent)) bad("comparison", `${key}: a primary-arm build comparison needs bonferroni { comparisons, confidence_percent, interval, separated }`);
      else {
        if (bf.comparisons !== pairsPerArm) bad("comparison", `${key}: bonferroni.comparisons ${bf.comparisons} is not the ${pairsPerArm} primary-arm pairs`);
        if (bf.separated !== !crosses(bf.interval)) bad("comparison-consistent", `${key}: bonferroni.separated=${bf.separated} contradicts interval ${JSON.stringify(bf.interval)}`);
        if (bf.separated && !e.separated) bad("comparison-consistent", `${key}: Bonferroni-separated but not separated at 95%`);
        if (!(bf.interval[0] <= e.interval95[0] && e.interval95[1] <= bf.interval[1])) bad("comparison", `${key}: the corrected interval must contain the uncorrected one`);
      }
    } else if (e.bonferroni !== undefined) bad("comparison", `${key}: only primary-arm build comparisons carry a corrected interval`);
    if (e.kind === "arm") {
      const m = e.b_minus_a;
      if (!m || !isNum(m.difference) || !isRange(m.interval95) || typeof m.separated !== "boolean") bad("comparison", `${key}: an arm comparison needs b_minus_a { difference, interval95, separated }`);
      else {
        if (m.separated !== !crosses(m.interval95)) bad("comparison-consistent", `${key}: b_minus_a.separated contradicts its interval`);
        // The two intervals come from separate bootstrap percentiles, so the interval is not an exact mirror; the difference and the flag are.
        if (m.difference !== neg(e.difference) || !(m.interval95[0] <= m.difference && m.difference <= m.interval95[1])) bad("comparison-consistent", `${key}: b_minus_a is not the mirror of a minus b`);
      }
    } else if (e.b_minus_a !== undefined) bad("comparison", `${key}: only arm comparisons carry b_minus_a`);
  }
  const perArm = (arm) => cs.filter((e) => e.kind === "build" && e.arm_a === arm).length;
  if (perArm("A") !== pairsPerArm || perArm("B") !== pairsPerArm) bad("comparison", `expected ${pairsPerArm} build comparisons in each arm, found ${perArm("A")} and ${perArm("B")}`);
  if (kinds.arm !== nBuilds) bad("comparison", `expected one arm comparison per build (${nBuilds}), found ${kinds.arm}`);
  // Every arm-A build pair of `pairwise` must agree with its comparison (one result, two views).
  const pw = new Map((x.pairwise ?? []).map((e) => [`${e.a}|${e.b}`, e]));
  for (const e of cs) {
    const q = pw.get(`${e.a}|${e.b}`);
    if (q && (q.separated !== e.separated || JSON.stringify(q.interval95) !== JSON.stringify(e.interval95))) bad("comparison-consistent", `${e.a}|${e.b}: comparisons and pairwise disagree`);
  }

  // length check: the pre-registered rule is "the instructed arm is closer to the target than the plain arm".
  const lc = x.length_check;
  if (!lc || !Array.isArray(lc.per_build) || lc.per_build.length !== nBuilds) { bad("length-check", `length_check.per_build must list every build (${nBuilds})`); return p; }
  for (const r of lc.per_build) {
    const a = x.subjects[r.arm_a];
    const b = x.subjects[r.arm_b];
    if (!a || !b || arms[r.arm_a]?.arm !== "A" || arms[r.arm_b]?.arm !== "B" || buildIdOf(r.arm_a, "A") !== buildIdOf(r.arm_b, "B")) { bad("length-check", `${r.arm_a}/${r.arm_b}: not one build's A and B variants`); continue; }
    if (r.median_words_a !== a.median_reply_words || r.median_words_b !== b.median_reply_words) bad("length-check", `${r.arm_a}: median words differ from the subjects'`);
    if (!isNum(r.target_words)) { bad("length-check", `${r.arm_a}: target_words missing`); continue; }
    const dA = Math.abs(r.median_words_a - r.target_words);
    const dB = Math.abs(r.median_words_b - r.target_words);
    if (r.distance_from_target_a !== dA || r.distance_from_target_b !== dB) bad("length-check", `${r.arm_a}: distances from the target are not recomputed from the medians`);
    const verdict = dB < dA ? "effective" : "ineffective";
    if (r.length_instruction !== verdict) bad("length-check-verdict", `${r.arm_a}: length_instruction "${r.length_instruction}" contradicts the medians (${verdict})`);
  }
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
  if (isArmsDesign(w.design)) return computeDerivedArms(w, ids);
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

/**
 * Derived facts of an ARMS wave (template amendment 16). The grouping that governs point display is read from the primary arm's
 * pre-declared comparisons under the CORRECTED interval, not from the 95% flags of `pairwise` (which also lists exploratory
 * pairs across arms and builds):
 *   not_separated_groups / separated_subjects   primary-arm variants, after correction (the keys every existing gate reads)
 *   range_only_subjects                         every variant of the secondary arm: ranges only, no point, no group claim
 *   point_withheld_subjects                     group members and the secondary arm: no point anywhere, no difference involving them
 *   separated_pairs                             primary-arm pairs separated after correction (the only pairs "separated from" may be said of)
 *   separated_uncorrected_only_pairs            separated at 95% but not after correction: words with the uncorrected range only
 *   by_arm                                      the same facts per arm
 *   display_rule                                the rule itself, citing the amendment
 * Pure function of wave fields, so validateWave can recompute and compare.
 */
/** The primary arm's structure from a wave's (or analysis's) design.arms and comparisons, under the corrected interval. */
export function armsStructure(x, ids) {
  const arms = x.design.arms;
  const A = ids.filter((i) => arms[i].arm === PRIMARY_ARM);
  const B = ids.filter((i) => arms[i].arm !== PRIMARY_ARM);
  const aPairs = x.comparisons.filter((e) => e.kind === "build" && arms[e.a].arm === PRIMARY_ARM);
  const corrected = aPairs.map((e) => ({ a: e.a, b: e.b, separated: e.bonferroni.separated }));
  const groups = notSeparatedGroups(A, corrected);
  const grouped = new Set(groups.flat());
  return { A, B, aPairs, groups, separated: A.filter((i) => !grouped.has(i)) };
}

function computeDerivedArms(w, ids) {
  const arms = w.design.arms;
  const { A, B, aPairs, groups, separated } = armsStructure(w, ids);
  const primary = groups[0] ?? [];
  const inPrimary = new Set(primary);
  const pairKeys = (list) => list.map((e) => [e.a, e.b].sort(alpha)).sort((x, y) => alpha(x.join("|"), y.join("|")));
  const among = w.dimension_pairwise.filter((e) => inPrimary.has(e.a) && inPrimary.has(e.b));
  const forObj = {};
  const ofObj = {};
  for (const id of A.filter((i) => !inPrimary.has(i))) {
    const mine = w.dimension_pairwise.filter((e) => e.a === id || e.b === id);
    forObj[id] = mine.filter((e) => e.bonferroni_separated).length;
    ofObj[id] = mine.length;
  }
  const r1 = (x) => Math.round(x * 10) / 10 + 0;
  const shift = Object.fromEntries(ids.map((i) => [i, r1(w.sensitivity.subjects[i].pilot_composite - w.subjects[i].pilot_composite)]));
  const members = groups.flat();
  const byArm = {};
  for (const arm of [...new Set(ids.map((i) => arms[i].arm))].sort(alpha)) {
    const here = ids.filter((i) => arms[i].arm === arm);
    byArm[arm] = arm === PRIMARY_ARM
      ? { subjects: here, comparison_basis: "corrected", separated_subjects: separated, not_separated_groups: groups, points: "separated subjects only" }
      : { subjects: here, comparison_basis: "none", separated_subjects: [], not_separated_groups: [], points: "none" };
  }
  return {
    not_separated_groups: groups,
    not_separated_group_range: primary.length ? minMax(primary.map((i) => w.subjects[i].pilot_composite)) : null,
    not_separated_group_ranges: groups.map((g) => minMax(g.map((i) => w.subjects[i].pilot_composite))),
    separated_subjects: separated,
    separated_pairs: pairKeys(aPairs.filter((e) => e.bonferroni.separated)),
    dimension_bonferroni_separated_among_group: among.filter((e) => e.bonferroni_separated).length,
    dimension_comparisons_among_group: among.length,
    dimension_bonferroni_separated_for: forObj,
    dimension_bonferroni_separated_of: ofObj,
    median_words_group_range: primary.length ? minMax(primary.map((i) => w.subjects[i].median_reply_words)) : null,
    sensitivity_level_shift_group_range: members.length ? minMax(members.map((i) => shift[i])) : null,
    sensitivity_level_shift: shift,
    subject_count: ids.length,
    ratings_total: w.design.ratings,
    responses_total: w.design.responses,
    range_only_subjects: B,
    point_withheld_subjects: [...members, ...B].sort(alpha),
    separated_uncorrected_only_pairs: pairKeys(aPairs.filter((e) => e.separated && !e.bonferroni.separated)),
    primary_arm: PRIMARY_ARM,
    primary_arm_subject_count: A.length,
    build_count: new Set(ids.map((i) => buildIdOf(i, arms[i].arm))).size,
    arm_count: Object.keys(byArm).length,
    by_arm: byArm,
    display_rule: { amendment: 16, text: DISPLAY_RULE_TEXT },
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

/** Rendered by a token as "{{subjects.<id>.contamination.via}}". Set only for a subject with an MCP scorecard in the analysis. */
export const CONTAMINATION_VIA_MCP = "the cb-probe MCP server, driven over its real stdio protocol";

/** Plain statement of how a pre-registration is anchored. The hash proves which text was analysed against, not when it was written. */
export const PREREGISTRATION_NOTE =
  "The pre-registration is a file in this repository. It was written before any subject reply existed, but it was not committed, time-stamped or filed with any independent registry before the data existed, so nothing outside this project proves when it was written. The hash identifies the text the analysis was run against.";

/** The pre-registration of a run whose plan was committed and pushed before any subject reply existed (run-config.json preregistration.committed_before_data). */
export const PREREGISTRATION_COMMITTED_NOTE =
  "The pre-registration is a file in this repository. It was committed and pushed before any subject reply was generated, so its commit time attests the order. The hash identifies the text the analysis was run against; departures after data existed are appended to it as dated deviations and never edited into the plan.";

/** Says what the two pre-registration hashes are when a run records the as-written hash (run-config.json preregistration.as_written_sha256). */
export const PREREGISTRATION_AS_WRITTEN_NOTE =
  "as_written_sha256 is the hash of the plan as written, with its Deviations section holding only the placeholder. sha256 is the hash of the same file with its dated deviations appended below that heading; appending a deviation never changes the plan text above it, so the as-written hash stays reproducible from the current file.";

// ---------------------------------------------------------------------------
// Provenance: parsed from the run's PREREGISTRATION.md (section 2) and run-config.json by the exporter.
// ---------------------------------------------------------------------------

/**
 * The subject table of a pre-registration: one row per subject,
 *   | `label` | `tag` | `digest` | size, quantisation | developer, licence |
 * Returns { [label]: { ollama_tag, digest_sha256, parameter_size, quantisation, developer, licence } }.
 * Throws on a row it cannot read, so a changed table layout cannot silently drop a subject.
 */
export function parsePreregSubjects(text) {
  const out = {};
  const strip = (c) => c.replace(/^`|`$/g, "").trim();
  for (const line of text.split("\n")) {
    if (!/^\|\s*`[^`]+`\s*\|/.test(line)) continue;
    const cells = line.split("|").slice(1, -1).map((c) => c.trim());
    if (cells.length < 5) throw new Error(`pre-registration subject row has ${cells.length} cells, expected 5: ${line.slice(0, 80)}`);
    const [label, tag, digest, sizeQuant, devLic] = [strip(cells[0]), strip(cells[1]), strip(cells[2]), cells[3], cells[4]];
    const sq = sizeQuant.split(/,\s*/);
    const cut = devLic.indexOf(", ");
    if (!/^[0-9a-f]{64}$/.test(digest) || sq.length !== 2 || cut < 0) throw new Error(`pre-registration subject row for ${label} is not "label | tag | digest | size, quantisation | developer, licence"`);
    out[label] = { ollama_tag: tag, digest_sha256: digest, parameter_size: sq[0].trim(), quantisation: sq[1].trim(), developer: devLic.slice(0, cut).trim(), licence: devLic.slice(cut + 2).trim() };
  }
  return out;
}

/** "- Runtime: Ollama 1.2.3 on ..." or "**Runtime:** Ollama 1.2.3 on ..." -> { name: "Ollama", version: "1.2.3" }, or null. */
export function parsePreregRuntime(text) {
  const m = text.match(/^\s*(?:-\s*)?(?:\*\*)?Runtime:(?:\*\*)?\s*([A-Za-z][\w.-]*)\s+(\d+(?:\.\d+)*)/m);
  return m ? { name: m[1], version: m[2] } : null;
}

/** Subject build facts: the analysis's own pins merged with the pre-registration's table. They must agree on tag and digest. */
function projectProvenance(analysis, ids, prov) {
  if (!prov || !prov.subjects || !prov.runtime) throw new Error("projectWave: the analysis has design.subject_builds, so ctx.provenance { subjects, runtime } (parsed from PREREGISTRATION.md) is required");
  const builds = analysis.design.subject_builds;
  const out = {};
  for (const id of ids) {
    const b = builds[id];
    // An arms run's pre-registration table has one row per BUILD; a variant ("<build>-A") reads its build's row.
    const t = prov.subjects[id] ?? (isArmsDesign(analysis.design) ? prov.subjects[buildIdOf(id, analysis.design.arms[id]?.arm)] : undefined);
    if (!b) throw new Error(`projectWave: design.subject_builds has no entry for ${id}`);
    if (!t) throw new Error(`projectWave: the pre-registration subject table has no row for ${id}`);
    if (t.digest_sha256 !== b.digest_sha256) throw new Error(`projectWave: ${id}: the pre-registration digest differs from the analysis digest`);
    if (t.ollama_tag !== b.tag) throw new Error(`projectWave: ${id}: the pre-registration tag differs from the analysis tag`);
    out[id] = {
      developer: t.developer,
      licence: t.licence,
      parameter_size: t.parameter_size,
      quantisation: t.quantisation,
      runtime: prov.runtime.name,
      runtime_version: prov.runtime.version,
      model_family: b.family,
      build_tag: b.tag,
      digest_sha256: b.digest_sha256,
    };
  }
  return out;
}

/** Are the judges a different set from the subjects, and a different model family? Evidence from run-config.json (families). */
function projectJudgeSet(analysis, ids, prov) {
  const judges = [...(analysis.design.judges ?? [])].sort(alpha);
  if (judges.length === 0) throw new Error("projectWave: design.subject_builds is present but design.judges is empty");
  const fam = prov?.families;
  if (!fam || !fam.judges || !fam.subjects) throw new Error("projectWave: judge families are required (ctx.provenance.families { judges, subjects }, from run-config.json) to state that the judges are disjoint from the subjects");
  for (const j of judges) if (!fam.judges[j]) throw new Error(`projectWave: no family recorded for judge ${j}`);
  for (const s of ids) if (!fam.subjects[s]) throw new Error(`projectWave: no family recorded for subject ${s}`);
  return judgeSetFrom(judges, ids, fam.judges, fam.subjects, analysis.design.judge_family);
}

function judgeSetFrom(judges, ids, judgeFam, subjectFam, familyNote) {
  const jf = [...new Set(judges.map((j) => judgeFam[j]))].sort(alpha);
  const sf = [...new Set(ids.map((s) => subjectFam[s]))].sort(alpha);
  return {
    judges,
    judge_families: jf,
    subject_families: sf,
    disjoint_from_subjects: judges.every((j) => !ids.includes(j)),
    families_disjoint: jf.every((f) => !sf.includes(f)),
    family_note: familyNote,
  };
}

/** judge_validity: both measurement bases, without file paths or timestamps. */
function projectJudgeValidity(v) {
  const basis = (b) => ({
    role: b.role,
    threshold_percent: b.threshold_percent,
    ratings_measured: b.ratings_measured,
    ratings_sha256: b.ratings_sha256,
    pairs_superseded_by_a_later_file: b.pairs_superseded_by_a_later_file,
    judges: Object.fromEntries(Object.keys(b.judges).sort(alpha).map((j) => [j, clone(b.judges[j])])),
    failing_judges: [...b.failing_judges].sort(alpha),
    run_verdict: b.run_verdict,
  });
  return {
    rule: v.rule,
    reported_as_headline: v.reported_as_headline,
    headline_note: v.headline_note,
    measured_on_original_answers: basis(v.measured_on_original_answers),
    measured_on_final_quotes: basis(v.measured_on_final_quotes),
    judges_excluded: [...(v.judges_excluded ?? [])].sort(alpha),
  };
}

/**
 * How the judges were paired across a subject's replies: "fixed" when every subject's replies were rated by one judge
 * pair; "rotating" when each subject's replies were spread over several pairs. Read from routing, so a report cannot
 * claim a fixed pair that the data does not show.
 */
export function judgePairing(w) {
  const per = Object.values(w.routing ?? {}).map((r) => Object.values(r.responses_by_judge_pair ?? {}).filter((n) => n > 0).length);
  if (per.length === 0 || per.some((n) => n === 0)) return "unknown";
  if (per.every((n) => n === 1)) return "fixed";
  return "rotating";
}

/**
 * design.arms of the wave: which arm, how many trials, which system message (text and hash), whether the cb-probe server finished a
 * scorecard for the variant, and which variant hosted its build's contamination probe. Key `scorecard` of the analysis is renamed
 * `server_report` (a wave carries no key containing "score"); the long `build` string is dropped (design.subject_builds has it).
 */
function projectArms(analysis, ids, prov) {
  const out = {};
  for (const id of ids) {
    const e = analysis.design.arms[id];
    const text = prov?.system_messages?.[id];
    out[id] = {
      arm: e.arm,
      trials: e.trials,
      system_message_sha256: e.system_message_sha256,
      ...(typeof text === "string" ? { system_message: text } : {}),
      server_report: e.scorecard,
      probe_from: e.probe_from,
    };
    if (typeof text === "string" && createHash("sha256").update(text).digest("hex") !== e.system_message_sha256) {
      throw new Error(`projectWave: ${id}: the system message in run-config.json does not hash to design.arms.${id}.system_message_sha256`);
    }
  }
  return out;
}

/**
 * The pre-declared comparisons, each without the two composites (those are points) and without the long build strings.
 * `bonferroni.ranks` and `.of` are dropped (a key may not contain "rank"; they are bootstrap bookkeeping).
 */
function projectComparisons(list) {
  return clone(list)
    .map((e) => {
      const o = {
        a: e.a, b: e.b, kind: e.kind, arm_a: e.arm_a, arm_b: e.arm_b,
        difference: e.difference, interval95: e.interval95, separated: e.separated,
        median_reply_words_a: e.median_reply_words_a, median_reply_words_b: e.median_reply_words_b,
      };
      if (e.bonferroni) o.bonferroni = { comparisons: e.bonferroni.comparisons, confidence_percent: e.bonferroni.confidence_percent, interval: e.bonferroni.interval, separated: e.bonferroni.separated };
      if (e.b_minus_a) o.b_minus_a = { difference: e.b_minus_a.difference, interval95: e.b_minus_a.interval95, separated: e.b_minus_a.separated };
      return o;
    })
    .sort((x, y) => alpha(x.a + "|" + x.b, y.a + "|" + y.b));
}

/** The section-9 verdicts, one per build, keyed by the two variants (no digest string). Alphabetical by the plain variant. */
function projectLengthCheck(lc) {
  return {
    rule: lc.rule,
    per_build: clone(lc.per_build)
      .map((r) => ({
        arm_a: r.arm_a, arm_b: r.arm_b, target_words: r.target_words, median_words_a: r.median_words_a, median_words_b: r.median_words_b,
        distance_from_target_a: r.distance_from_target_a, distance_from_target_b: r.distance_from_target_b,
        length_instruction: r.length_instruction, b_minus_a_reading: r.b_minus_a_reading,
      }))
      .sort((x, y) => alpha(x.arm_a, y.arm_a)),
  };
}

/**
 * The replication note: whether the separation result of a pair repeats. The per-build composites, their difference and the pair's
 * point difference are POINTS of subjects that show ranges only, so they are not exported; ranges, flags and medians are.
 */
function projectReplication(r) {
  const builds = {};
  for (const b of Object.keys(r.builds ?? {}).sort(alpha)) {
    const e = r.builds[b];
    builds[b] = {
      this_run: { label: e.this_run.label, interval95: e.this_run.interval95, median_reply_words: e.this_run.median_reply_words },
      source_run: { interval95: e.source_run.interval95, median_reply_words: e.source_run.median_reply_words },
    };
  }
  return {
    note: r.note,
    source_run: r.source_run,
    pair: r.pair,
    source_run_result: { interval95: r.source_run_result.interval95, separated: r.source_run_result.separated },
    this_run_arm_a_result: {
      interval95: r.this_run_arm_a_result.interval95,
      separated: r.this_run_arm_a_result.separated,
      bonferroni_over_comparisons_separated: r.this_run_arm_a_result.bonferroni_over_6_separated,
    },
    separation_repeats: r.separation_repeats,
    builds,
  };
}

/**
 * @param {object} analysis  parsed analysis.json
 * @param {object} ctx
 *   bank     { items_total, items_validated, version }  from MODEL_INDEX_FACTS (imported, not re-derived)
 *   decision { ref, status }                             from DECISIONS.md at export
 *   reportDate "YYYY-MM-DD"
 *   items_per_conversation_max  positive integer
 *   provenance (only for an analysis with design.subject_builds)
 *     { subjects: parsePreregSubjects(...), runtime: parsePreregRuntime(...),
 *       families: { judges: {id: family}, subjects: {id: family} }, preregistration_committed_before_data?: boolean,
 *       preregistration_as_written_sha256?: string (run-config.json preregistration.as_written_sha256) }
 */
export function projectWave(rawAnalysis, ctx) {
  const analysis = normaliseAnalysis(rawAnalysis);
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
  const arms = isArmsDesign(analysis.design);

  const w = {
    run_id: analysis.run_id,
    official: false,
    comparability: "none",
    report_date: ctx.reportDate,
    source_sha256: canonicalSha256(rawAnalysis),
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
  // Alphabetical wherever a list or map is keyed by subject: the order an analysis happened to write them in
  // (for example the pre-registered "primary comparison" order) must not reach the wave.
  w.design.subjects = [...w.design.subjects].sort(alpha);
  if (w.design.subject_builds) w.design.subject_builds = orderBySubject(w.design.subject_builds, ids);
  if (isArmsDesign(analysis.design)) {
    w.design.trials_per_subject = orderBySubject(w.design.trials_per_subject, ids);
    w.design.arms = projectArms(analysis, ids, ctx.provenance);
  }
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
    // A scorecard produced by the cb-probe MCP server means the contamination probe ran through the real server (stdio).
    // An arms run probes each BUILD once (hosted by one variant); a variant that borrows its build's probe (from_build_probe_of) was probed the same way.
    const host = s.contamination?.from_build_probe_of;
    const viaMcp = (typeof s.mcp_scorecard === "string" && s.mcp_scorecard) || (typeof host === "string" && typeof analysis.subjects[host]?.mcp_scorecard === "string" && analysis.subjects[host].mcp_scorecard);
    if (viaMcp) w.subjects[id].contamination.via = CONTAMINATION_VIA_MCP;
  }
  // Sorted, so the file does not depend on the order A happened to list things in.
  const dimOrder = Object.keys(analysis.subjects[ids[0]].dimensions);
  w.pairwise = clone(analysis.pairwise).sort((x, y) => alpha(x.a + "|" + x.b, y.a + "|" + y.b));
  w.dimension_pairwise = clone(analysis.dimension_pairwise).sort((x, y) => alpha(x.a + "|" + x.b, y.a + "|" + y.b) || dimOrder.indexOf(x.dimension) - dimOrder.indexOf(y.dimension));
  w.dimension_pairwise_note = analysis.dimension_pairwise_note;
  if (arms) {
    // Exploratory pairs across arms and builds are kept (flags and ranges) with the analysis's own warning; the findings are `comparisons`.
    if (typeof analysis.pairwise_note === "string") w.pairwise_note = analysis.pairwise_note;
    w.comparisons = projectComparisons(analysis.comparisons);
    if (typeof analysis.comparisons_note === "string") w.comparisons_note = analysis.comparisons_note;
    w.length_check = projectLengthCheck(analysis.length_check);
    if (analysis.replication) w.replication = projectReplication(analysis.replication);
  }

  // An arms run's groups come from its corrected, pre-declared comparisons (amendment 16); every other run's from `pairwise`.
  const groups = arms ? armsStructure(analysis, ids).groups : notSeparatedGroups(ids, analysis.pairwise);
  const grouped = new Set(groups.flat());
  const separated = arms ? armsStructure(analysis, ids).separated : ids.filter((i) => !grouped.has(i));
  w.length = clone(analysis.length);
  // A bound for a non-separated model would impose an order on the group.
  const bound = {};
  for (const id of separated) if (analysis.length.composite_if_pooled_slope_removed?.[id] !== undefined) bound[id] = analysis.length.composite_if_pooled_slope_removed[id];
  w.length.composite_if_pooled_slope_removed = bound;

  w.length.within_subject_slopes = orderBySubject(w.length.within_subject_slopes, ids);
  w.judges = clone(analysis.judges);
  for (const j of Object.keys(w.judges)) if (w.judges[j].by_subject) w.judges[j].by_subject = orderBySubject(w.judges[j].by_subject, ids);
  if (analysis.quote_grounding !== undefined) w.quote_grounding = clone(analysis.quote_grounding);
  w.operations = clone(analysis.operations);
  if (w.operations.subject_replies) w.operations.subject_replies = orderBySubject(w.operations.subject_replies, ids);
  w.routing = orderBySubject(clone(analysis.routing), ids);
  if (analysis.exclusion_record !== undefined) {
    w.exclusion_record = clone(analysis.exclusion_record);
    delete w.exclusion_record.measured_original_answer_stats; // template B10: never quoted
  }
  const sn = analysis.sensitivity;
  w.sensitivity = {
    question: sn.question,
    method: sn.method,
    note: sn.note,
    ratings_used: sn.ratings_used,
    ...(Number.isInteger(sn.ratings_whose_value_differs_from_the_original) ? { ratings_whose_value_differs_from_the_original: sn.ratings_whose_value_differs_from_the_original } : {}),
    subjects: Object.fromEntries(ids.map((id) => [id, { pilot_composite: sn.subjects[id].pilot_composite, pilot_composite_interval95: [...sn.subjects[id].interval95] }])),
    pairwise: clone(sn.pairwise).sort((x, y) => alpha(x.a + "|" + x.b, y.a + "|" + y.b)),
    separation_pattern_unchanged: sn.separation_pattern_unchanged,
  };
  // Blocks that only runs with local subjects, a disjoint judge set and a pre-registration carry. Each is projected
  // only when the analysis has it, so a wave exported before they existed does not change.
  if (analysis.design.subject_builds) {
    w.subject_provenance = projectProvenance(analysis, ids, ctx.provenance);
    w.judge_set = projectJudgeSet(analysis, ids, ctx.provenance);
  }
  if (analysis.judge_validity) w.judge_validity = projectJudgeValidity(analysis.judge_validity);
  if (analysis.bridge_drift) w.bridge_drift = clone(analysis.bridge_drift);
  if (analysis.self_identifying_replies) {
    const r = analysis.self_identifying_replies;
    w.self_identifying_replies = { note: r.note, count: r.count, by_subject: orderBySubject(clone(r.by_subject ?? {}), ids) };
  }
  if (Array.isArray(analysis.deviations)) w.deviations = analysis.deviations.map((d) => ({ id: d.id, date: d.date, title: d.title }));
  if (analysis.design.preregistration_sha256) {
    w.preregistration = {
      sha256: analysis.design.preregistration_sha256,
      path: `research/model-runs/${analysis.run_id}/PREREGISTRATION.md`,
      committed_before_data: ctx.provenance?.preregistration_committed_before_data === true,
      note: ctx.provenance?.preregistration_committed_before_data === true ? PREREGISTRATION_COMMITTED_NOTE : PREREGISTRATION_NOTE,
    };
    // Projected only when the run recorded it, so a wave exported from a run without it does not change.
    const asWritten = ctx.provenance?.preregistration_as_written_sha256;
    if (asWritten !== undefined) {
      if (!/^[0-9a-f]{64}$/.test(asWritten)) throw new Error("projectWave: provenance.preregistration_as_written_sha256 is not a sha256");
      w.preregistration.as_written_sha256 = asWritten;
      w.preregistration.as_written_note = PREREGISTRATION_AS_WRITTEN_NOTE;
    }
  }
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
  // An arms wave: the structure and the pre-declared comparisons must hold before anything is derived from them.
  if (isArmsDesign(w.design)) {
    const ap = armsProblems(w, ids, "W");
    p.push(...ap);
    if (ap.length) return p;
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
  p.push(...optionalBlockProblems(w, ids));
  return p;
}

/** The blocks only some waves carry (local subjects, disjoint judges, judge validity, pre-registration). Each is checked only when present. */
function optionalBlockProblems(w, ids) {
  const p = [];
  const bad = (rule, msg) => p.push(`${rule}: ${msg}`);
  if (w.subject_provenance !== undefined) {
    if (JSON.stringify(Object.keys(w.subject_provenance)) !== JSON.stringify(ids)) bad("W-provenance", "subject_provenance keys are not the subject keys in alphabetical order");
    for (const [id, e] of Object.entries(w.subject_provenance)) {
      if (!/^[0-9a-f]{64}$/.test(e.digest_sha256 ?? "")) bad("W-provenance", `${id}: digest_sha256 is not a sha256`);
      for (const k of ["developer", "licence", "parameter_size", "quantisation", "runtime", "runtime_version", "model_family", "build_tag"]) if (typeof e[k] !== "string" || !e[k]) bad("W-provenance", `${id}: ${k} missing`);
      if (w.design?.subject_builds?.[id] && w.design.subject_builds[id].digest_sha256 !== e.digest_sha256) bad("W-provenance", `${id}: digest differs from design.subject_builds`);
    }
  }
  if (w.judge_set !== undefined) {
    const js = w.judge_set;
    const judges = [...(js.judges ?? [])];
    if (JSON.stringify(judges) !== JSON.stringify([...judges].sort(alpha))) bad("W-judge-set", "judges are not alphabetical");
    if (JSON.stringify(judges) !== JSON.stringify([...(w.design?.judges ?? [])].sort(alpha))) bad("W-judge-set", "judge_set.judges differs from design.judges");
    if (js.disjoint_from_subjects !== judges.every((j) => !ids.includes(j))) bad("W-judge-set", "disjoint_from_subjects contradicts the judge and subject ids");
    const overlap = (js.judge_families ?? []).some((f) => (js.subject_families ?? []).includes(f));
    if (js.families_disjoint !== !overlap) bad("W-judge-set", "families_disjoint contradicts judge_families and subject_families");
  }
  if (w.judge_validity !== undefined) {
    for (const key of ["measured_on_original_answers", "measured_on_final_quotes"]) {
      const b = w.judge_validity[key];
      if (!b || typeof b !== "object") { bad("W-judge-validity", `${key} missing`); continue; }
      const failing = Object.entries(b.judges ?? {}).filter(([, j]) => j.unfound_rate_percent > b.threshold_percent).map(([id]) => id).sort(alpha);
      if (JSON.stringify(failing) !== JSON.stringify([...(b.failing_judges ?? [])].sort(alpha))) bad("W-judge-validity", `${key}: failing_judges disagrees with the per-judge unfound rates and the threshold`);
      for (const [id, j] of Object.entries(b.judges ?? {})) if (j.verdict !== (j.unfound_rate_percent > b.threshold_percent ? "FAIL" : "PASS")) bad("W-judge-validity", `${key}.${id}: verdict contradicts its rate`);
    }
  }
  if (w.replication !== undefined) {
    const r = w.replication;
    for (const key of ["source_run_result", "this_run_arm_a_result"]) {
      const e = r[key];
      if (!e || !isRange(e.interval95) || typeof e.separated !== "boolean") bad("W-replication", `${key} needs a range and a flag`);
      else if (e.separated !== !crosses(e.interval95)) bad("W-replication", `${key}: flag contradicts its range`);
    }
    if (typeof r.separation_repeats === "boolean" && r.source_run_result && r.this_run_arm_a_result && r.separation_repeats !== (r.source_run_result.separated === r.this_run_arm_a_result.separated)) bad("W-replication", "separation_repeats contradicts the two results");
    // A replication note compares builds whose points are withheld: it carries ranges, flags and medians, never a point or a point difference.
    const pointKey = (x, path = "replication") => {
      const out = [];
      if (Array.isArray(x)) x.forEach((v, i) => out.push(...pointKey(v, `${path}[${i}]`)));
      else if (x && typeof x === "object") for (const [k, v] of Object.entries(x)) { if (/^(?:difference|composite|point)/i.test(k) || /_difference/.test(k)) out.push(`${path}.${k}`); out.push(...pointKey(v, `${path}.${k}`)); }
      return out;
    };
    for (const k of pointKey(r)) bad("W-replication", `${k}: a point or point difference was exported (replication carries ranges, flags and medians only)`);
  }
  if (w.preregistration !== undefined) {
    if (!/^[0-9a-f]{64}$/.test(w.preregistration.sha256 ?? "")) bad("W-preregistration", "sha256 is not a sha256");
    if (w.preregistration.sha256 !== w.design?.preregistration_sha256) bad("W-preregistration", "sha256 differs from design.preregistration_sha256");
    if (typeof w.preregistration.committed_before_data !== "boolean") bad("W-preregistration", "committed_before_data must be boolean");
    if (w.preregistration.as_written_sha256 !== undefined && !/^[0-9a-f]{64}$/.test(w.preregistration.as_written_sha256)) bad("W-preregistration", "as_written_sha256 is not a sha256");
  }
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
