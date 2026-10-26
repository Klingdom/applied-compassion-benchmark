// research/model-runs/lib/wave-gates.mjs
//
// Wave publication gates (D-60 Stream B; WP-6/7/8/12 of docs/model-eval/ARCHITECTURE_EVAL_V2.md; acceptance
// checklist A1-A21 of docs/model-eval/TEST_PLAN_EVAL.md; v2 section 4 gates of docs/MODEL_TESTING_V2_PROPOSAL.md).
//
// Every gate is a PURE function of a run context and returns
//   { id, status: "pass" | "fail" | "hold" | "n/a" | "not-built", detail, evidence }.
// "pass" is only ever returned by a gate that measured something. A gate that cannot be built yet returns
// "not-built" (or "n/a" when it provably does not apply to this run), never "pass".
//
// A threshold that no protocol has ratified is never invented: the gate reports the measurement, returns "pass"
// and sets evidence.report_only = true and a "REPORT-ONLY" prefix in detail, so a reader cannot mistake it for a
// tested bound.
//
// Nothing here writes anything. Git is reached only through an injected runGit (see makeRunGit in weekly.mjs) and
// only with read-only subcommands: log, ls-files, diff --cached --name-only.

import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { DEFAULT_BANK_PATH, REPO_ROOT, loadBankFile, servedItems, sha256 } from "./common.mjs";
import { judgeVerdict, collectRatings, readAnswerFiles, loadReplyTexts } from "./judge-validity.mjs";
import { NORM } from "./normalise.mjs";
import { auditReport, loadReportInputs, describeMismatches } from "./claim-audit.mjs";

export const GATE_STATUSES = Object.freeze(["pass", "fail", "hold", "n/a", "not-built"]);

const gate = (id, status, detail, evidence = {}) => ({ id, status, detail, evidence });
const sample = (list, n = 8) => (list.length > n ? [...list.slice(0, n), `... and ${list.length - n} more`] : list);
const slash = (p) => p.split(path.sep).join("/");
const num = (v) => (typeof v === "number" && Number.isFinite(v) ? v : null);

/**
 * A protocol value is a usable threshold only if it is a finite number. An OPEN block ({ open: true, ... } in
 * PROTOCOL.v2.json, or { $open: ... } in the architecture encoding) is NOT a threshold, whatever its proposed_default.
 */
export function thresholdValue(v) {
  return num(v);
}

// ---------------------------------------------------------------------------
// Deviations: parsed from the append-only section of PREREGISTRATION.md
// ---------------------------------------------------------------------------
const DEVIATION_HEAD = /^- \*\*(\d{4}-\d{2}-\d{2}),\s+(D\d+)\s+(?:—|–|-)\s+(.+?)\*\*\s*$/u;

/** @returns {{id: string, date: string, title: string, text: string}[]} text = the whole bullet, headline included. */
export function parseDeviations(preregText) {
  if (typeof preregText !== "string") return [];
  const lines = preregText.replace(/\r\n/g, "\n").split("\n");
  const start = lines.findIndex((l) => /^## Deviations/.test(l));
  if (start < 0) return [];
  const out = [];
  let cur = null;
  for (const line of lines.slice(start + 1)) {
    if (/^## /.test(line)) break;
    const m = DEVIATION_HEAD.exec(line);
    if (m) {
      cur = { id: m[2], date: m[1], title: m[3].replace(/\.$/, ""), text: line };
      out.push(cur);
    } else if (cur) {
      cur.text += `\n${line}`;
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Pool exposure (G-keys)
// ---------------------------------------------------------------------------
const PUBLIC_POOLS = new Set(["public-permanent", "core-public"]);

/**
 * "public" | "unpublished". run-config.pool wins when it is a string (MR-4 marks runs `pool: unpublished`).
 * Otherwise every served item must carry exposureStatus "public-permanent". No bank and no field means "unknown",
 * which the keys gate treats as NOT public (fail closed).
 */
export function resolvePool(runConfig, bankItems) {
  if (typeof runConfig?.pool === "string") return { exposure: PUBLIC_POOLS.has(runConfig.pool) ? "public" : "unpublished", source: `run-config.pool=${runConfig.pool}` };
  if (Array.isArray(bankItems) && bankItems.length > 0) {
    const all = bankItems.every((i) => i.exposureStatus === "public-permanent");
    return { exposure: all ? "public" : "unpublished", source: all ? "every bank item has exposureStatus public-permanent" : "a bank item is not public-permanent" };
  }
  return { exposure: "unpublished", source: "no pool field and no bank: treated as unpublished (fail closed)" };
}

// ---------------------------------------------------------------------------
// Context helpers
// ---------------------------------------------------------------------------
const recordTimes = (r) => {
  const ts = [r.started_at, r.finished_at, ...(Array.isArray(r.attempts) ? r.attempts.map((a) => a?.started_at) : [])];
  return ts.map((t) => Date.parse(t)).filter(Number.isFinite);
};
const finalAttempt = (r) => {
  const a = Array.isArray(r.attempts) ? r.attempts : [];
  if (a.length === 0) return null;
  return a[Number.isInteger(r.final_attempt) && a[r.final_attempt] ? r.final_attempt : a.length - 1];
};
const mentionedIn = (deviations, ...needles) => deviations.filter((d) => needles.every((n) => d.text.includes(n))).map((d) => d.id);

// ---------------------------------------------------------------------------
// G-plan-time (FM-6 / A2)
// ---------------------------------------------------------------------------
/**
 * Every plan file's commit time must be strictly earlier than the earliest record timestamp.
 * The EARLIEST commit touching the file is used (not `git log -1`): the pre-registration is append-only, so a
 * deviation appended after the data legitimately gives it a later last-commit (pilot-2026-10-03 D1/D2 did). The
 * latest commit time is reported in the evidence. Edits to the as-written text are the preregistration-hash check's job.
 */
export function gatePlanTime(ctx) {
  const id = "G-plan-time";
  const times = (ctx.records ?? []).flatMap(recordTimes);
  if (times.length === 0) return gate(id, "hold", "no record timestamps: nothing to compare the plan commit with", { records: (ctx.records ?? []).length });
  const firstRecord = Math.min(...times);
  const files = ctx.planFiles ?? [];
  if (files.length === 0) return gate(id, "fail", "no plan files (run-config.json, PREREGISTRATION.md) found", {});
  const per = [];
  const problems = [];
  for (const f of files) {
    const r = ctx.runGit(["log", "--format=%cI", "--", f]);
    if (r.status !== 0) { problems.push(`${f}: git log failed`); continue; }
    const commits = r.stdout.split("\n").map((s) => s.trim()).filter(Boolean).map((s) => ({ iso: s, ms: Date.parse(s) }));
    if (commits.length === 0) { problems.push(`${f}: not committed`); continue; }
    if (commits.some((c) => !Number.isFinite(c.ms))) { problems.push(`${f}: unparseable commit time`); continue; }
    const earliest = commits.reduce((a, b) => (b.ms < a.ms ? b : a));
    const latest = commits.reduce((a, b) => (b.ms > a.ms ? b : a));
    per.push({ file: f, earliest_commit: earliest.iso, latest_commit: latest.iso, earliest_commit_ms: earliest.ms });
    if (!(earliest.ms < firstRecord)) problems.push(`${f}: first commit ${earliest.iso} is not strictly earlier than the first record ${new Date(firstRecord).toISOString()}`);
  }
  const evidence = { first_record: new Date(firstRecord).toISOString(), files: per.map(({ earliest_commit_ms, ...x }) => x), problems };
  if (problems.length > 0) return gate(id, "fail", problems.join("; "), evidence);
  return gate(id, "pass", `every plan file was first committed before the first record (${new Date(firstRecord).toISOString()})`, evidence);
}

// ---------------------------------------------------------------------------
// G-complete (A4)
// ---------------------------------------------------------------------------
export function gateComplete(ctx) {
  const id = "G-complete";
  const cfg = ctx.runConfig;
  const records = ctx.records ?? [];
  const devs = ctx.deviations ?? [];
  if (!cfg || !Array.isArray(cfg.subjects)) return gate(id, "hold", "no run-config subjects", {});
  if (!Array.isArray(ctx.servedItemIds) || ctx.servedItemIds.length === 0) return gate(id, "hold", "served item list unavailable: cannot compute planned calls", {});
  const planned = new Map();
  for (const s of cfg.subjects) {
    const trials = Number.isInteger(s.trials) ? s.trials : cfg.trials;
    for (const item of ctx.servedItemIds) for (let t = 1; t <= trials; t += 1) planned.set(`${s.label}|${item}|${t}`, { subject: s.label, item_id: item, trial: t });
  }
  const okKeys = new Set();
  const notOk = [];
  const truncated = [];
  const unplanned = [];
  let retriedAttempts = 0;
  for (const r of records) {
    const key = `${r.subject}|${r.item_id}|${r.trial}`;
    if (!planned.has(key)) { unplanned.push(key); continue; }
    if (r.status !== "ok") { notOk.push({ subject: r.subject, item_id: r.item_id, trial: r.trial, status: r.status }); continue; }
    okKeys.add(key);
    if (Array.isArray(r.attempts) && r.attempts.length > 1) retriedAttempts += r.attempts.length - 1;
    const fa = finalAttempt(r);
    if (!fa || fa.done_reason !== "stop") {
      truncated.push({ subject: r.subject, item_id: r.item_id, trial: r.trial, done_reason: fa ? fa.done_reason ?? null : "no-attempt" });
    }
  }
  const missing = [...planned.keys()].filter((k) => !okKeys.has(k)).map((k) => planned.get(k));
  const excused = (x) => mentionedIn(devs, x.subject, x.item_id).length > 0;
  const openMissing = missing.filter((m) => !excused(m));
  const openTruncated = truncated.filter((t) => !excused(t));
  const evidence = {
    planned: planned.size,
    ok: okKeys.size,
    missing: missing.length,
    not_ok_records: notOk.length,
    unplanned_records: unplanned.length,
    truncated_records: truncated.length,
    truncated_excused_by_deviation: truncated.length - openTruncated.length,
    missing_excused_by_deviation: missing.length - openMissing.length,
    retried_attempts: retriedAttempts,
    truncated_sample: sample(truncated),
    missing_sample: sample(missing.map((m) => `${m.subject}|${m.item_id}|t${m.trial}`)),
  };
  const bad = [];
  if (openMissing.length > 0) bad.push(`${openMissing.length} planned call(s) have no ok record and are not listed in a dated deviation`);
  if (openTruncated.length > 0) bad.push(`${openTruncated.length} ok record(s) ended with done_reason other than "stop" and are not listed in a dated deviation`);
  if (unplanned.length > 0) bad.push(`${unplanned.length} record(s) match no planned call`);
  if (bad.length > 0) return gate(id, "fail", bad.join("; "), evidence);
  return gate(id, "pass", `${okKeys.size} of ${planned.size} planned calls have an ok record; every final attempt ended "stop"${truncated.length ? ` (${truncated.length} excused by deviation)` : ""}`, evidence);
}

// ---------------------------------------------------------------------------
// G-digest (A3)
// ---------------------------------------------------------------------------
export function gateDigest(ctx) {
  const id = "G-digest";
  const subjects = ctx.runConfig?.subjects;
  if (!Array.isArray(subjects)) return gate(id, "hold", "no run-config subjects", {});
  const pinned = new Map(subjects.map((s) => [s.label, s.digest]));
  const bad = [];
  const badPins = subjects.filter((s) => typeof s.digest !== "string" || !/^[0-9a-f]{64}$/.test(s.digest)).map((s) => s.label);
  const counts = new Map();
  for (const r of ctx.records ?? []) {
    counts.set(r.subject, (counts.get(r.subject) ?? 0) + 1);
    if (!pinned.has(r.subject)) { bad.push(`${r.subject}|${r.item_id}|t${r.trial}: subject is not in run-config`); continue; }
    if (r.model_digest !== pinned.get(r.subject)) bad.push(`${r.subject}|${r.item_id}|t${r.trial}: record digest ${String(r.model_digest).slice(0, 12)} != pinned ${String(pinned.get(r.subject)).slice(0, 12)}`);
  }
  const evidence = { records_checked: (ctx.records ?? []).length, mismatches: bad.length, mismatch_sample: sample(bad), unpinned_subjects: badPins };
  if (badPins.length > 0) return gate(id, "fail", `run-config subject(s) without a 64-hex digest: ${badPins.join(", ")}`, evidence);
  if ((ctx.records ?? []).length === 0) return gate(id, "hold", "no records to compare", evidence);
  if (bad.length > 0) return gate(id, "fail", `${bad.length} record(s) differ from the pinned digest`, evidence);
  return gate(id, "pass", `all ${evidence.records_checked} record digests equal the run-config pins`, evidence);
}

// ---------------------------------------------------------------------------
// G-validity (A9) -- reuses lib/judge-validity.mjs results
// ---------------------------------------------------------------------------
export function gateValidity(ctx) {
  const id = "G-validity";
  const report = ctx.validityReport;
  if (!report) return gate(id, "hold", "no operations/judge-validity.json: the unfound-quote measurement has not been made", {});
  const max = num(ctx.runConfig?.judge_validity?.max_unfound_quote_rate_percent) ?? num(report.rule?.max_unfound_quote_rate_percent);
  if (max === null) return gate(id, "hold", "no unfound-quote threshold in run-config or report", {});
  if (report.complete !== true) return gate(id, "fail", `the validity report is incomplete (${(report.problems ?? []).length} problem(s))`, { problems: sample(report.problems ?? []) });
  const excluded = new Set(ctx.excludedJudges ?? []);
  const judges = {};
  const failing = [];
  for (const [j, g] of Object.entries(report.judges ?? {})) {
    const verdict = judgeVerdict({ unfound: g.unfound, total: g.ratings }, max);
    judges[j] = { ratings: g.ratings, unfound: g.unfound, unfound_rate_percent: g.ratings > 0 ? (g.unfound * 100) / g.ratings : null, verdict };
    if (verdict === "FAIL") failing.push(j);
    if (verdict === "NOT-MEASURED") failing.push(j);
  }
  const evidence = { threshold_percent: max, judges, failing, excluded_and_rerouted: [...excluded], report_verdict: report.run_verdict };
  const unhandled = failing.filter((j) => !excluded.has(j));
  if (unhandled.length > 0) return gate(id, "fail", `judge(s) over ${max}% unfound quotes (or unmeasured) and not excluded by the routing: ${unhandled.join(", ")}`, evidence);
  if (failing.length >= 2) return gate(id, "fail", `two or more judges exceed ${max}%: instrument findings only`, evidence);
  if (Object.keys(judges).length === 0) return gate(id, "hold", "the validity report names no judge", evidence);
  return gate(id, "pass", `every judge is at or under ${max}% unfound quotes${failing.length ? ` (${failing.join(", ")} excluded and rerouted)` : ""}`, evidence);
}

// ---------------------------------------------------------------------------
// G-judge-sanity (A10 / EV-3)
// ---------------------------------------------------------------------------
export const SANITY_MIN_RATINGS = 10;

/**
 * ctx.judgeRatings: [{judge, subject, response_id, rating_1_5, evidence_quote}] (main ratings, no bridge)
 * ctx.replyTexts:   Map response_id -> reply text.
 * Fails a judge that (a) gave one single rating to every reply of a subject (>= SANITY_MIN_RATINGS replies), or
 * (b) whose evidence quote is a prefix of its reply in every rating (>= SANITY_MIN_RATINGS ratings).
 * A prefix is tested on the reply trimmed and after the shared normaliser, so markdown or whitespace cannot hide it.
 */
export function gateJudgeSanity(ctx, { minRatings = SANITY_MIN_RATINGS } = {}) {
  const id = "G-judge-sanity";
  const rows = ctx.judgeRatings;
  if (!Array.isArray(rows) || rows.length === 0) return gate(id, "hold", "no judge ratings could be loaded", { load_error: ctx.judgeDataError ?? null });
  const byJudgeSubject = new Map();
  const byJudge = new Map();
  for (const r of rows) {
    const k = `${r.judge}|${r.subject}`;
    if (!byJudgeSubject.has(k)) byJudgeSubject.set(k, []);
    byJudgeSubject.get(k).push(r);
    if (!byJudge.has(r.judge)) byJudge.set(r.judge, []);
    byJudge.get(r.judge).push(r);
  }
  const constant = [];
  for (const [k, list] of byJudgeSubject) {
    if (list.length < minRatings) continue;
    const distinct = new Set(list.map((r) => r.rating_1_5));
    if (distinct.size === 1) { const [judge, subject] = k.split("|"); constant.push({ judge, subject, ratings: list.length, constant_rating: [...distinct][0] }); }
  }
  const isPrefix = (text, quote) => {
    if (typeof text !== "string" || typeof quote !== "string") return false;
    const q = quote.trim();
    if (q.length === 0) return false;
    if (text.trim().startsWith(q)) return true;
    const nq = NORM(q);
    return nq.length > 0 && NORM(text).trimStart().startsWith(nq);
  };
  const prefix = [];
  const prefixShare = {};
  for (const [judge, list] of byJudge) {
    if (list.length < minRatings) continue;
    const hits = list.filter((r) => isPrefix(ctx.replyTexts?.get(r.response_id), r.evidence_quote)).length;
    prefixShare[judge] = { ratings: list.length, quote_is_reply_prefix: hits };
    if (hits === list.length) prefix.push({ judge, ratings: list.length });
  }
  const evidence = { judges: [...byJudge.keys()].sort(), ratings: rows.length, min_ratings_for_a_test: minRatings, constant_by_judge_subject: constant, all_quotes_reply_prefix: prefix, prefix_share: prefixShare };
  const bad = [];
  if (constant.length > 0) bad.push(`constant rating: ${constant.map((c) => `${c.judge} on ${c.subject} (all ${c.constant_rating}, n=${c.ratings})`).join(", ")}`);
  if (prefix.length > 0) bad.push(`evidence quote is a reply prefix in every rating: ${prefix.map((p) => p.judge).join(", ")}`);
  if (bad.length > 0) return gate(id, "fail", bad.join("; "), evidence);
  return gate(id, "pass", `no judge is constant on a subject or quotes only reply prefixes (${rows.length} ratings, ${byJudge.size} judge(s))`, evidence);
}

// ---------------------------------------------------------------------------
// G-drift-signed (A12)
// ---------------------------------------------------------------------------
export function gateDriftSigned(ctx) {
  const id = "G-drift-signed";
  if (!ctx.runConfig?.bridge && !ctx.analysis?.bridge_drift) return gate(id, "n/a", "the run has no bridge (anchor) sample", {});
  const bd = ctx.analysis?.bridge_drift;
  if (!bd) return gate(id, "hold", "the run has a bridge but analysis.json has no bridge_drift: not analysed yet", {});
  const protocol = ctx.protocol ?? {};
  const anchor = protocol.anchor ?? ctx.runConfig?.anchor ?? {};
  const meanAbsLimit = thresholdValue(anchor.max_mean_abs_difference);
  const signedBlock = anchor.max_abs_signed_drift;
  const signedLimit = thresholdValue(signedBlock) ?? thresholdValue(signedBlock?.rating_units);
  const perJudge = {};
  for (const [j, x] of Object.entries(bd.per_judge ?? {})) {
    perJudge[j] = { pairs: x.pairs, mean_abs_difference: x.mean_abs_difference, mean_signed_difference_new_minus_original: x.mean_signed_difference_new_minus_original ?? null };
  }
  const evidence = {
    overall_mean_abs_difference: bd.mean_abs_difference ?? null,
    pairs: bd.pairs ?? null,
    exact_match: bd.exact_match ?? null,
    per_judge: perJudge,
    mean_abs_threshold: meanAbsLimit,
    signed_threshold_rating_units: signedLimit,
    report_only: false,
  };
  const mean = num(bd.mean_abs_difference);
  if (mean === null) return gate(id, "hold", "bridge_drift has no mean_abs_difference", evidence);
  const missingSigned = Object.entries(perJudge).filter(([, x]) => num(x.mean_signed_difference_new_minus_original) === null).map(([j]) => j);
  const signedText = Object.entries(perJudge).map(([j, x]) => `${j} ${num(x.mean_signed_difference_new_minus_original) === null ? "n/a" : (x.mean_signed_difference_new_minus_original >= 0 ? "+" : "") + x.mean_signed_difference_new_minus_original}`).join(", ");
  const problems = [];
  if (meanAbsLimit !== null && mean > meanAbsLimit) problems.push(`mean absolute drift ${mean} > ${meanAbsLimit}: NOT COMPARABLE`);
  if (signedLimit !== null) {
    const over = Object.entries(perJudge).filter(([, x]) => num(x.mean_signed_difference_new_minus_original) !== null && Math.abs(x.mean_signed_difference_new_minus_original) > signedLimit).map(([j]) => j);
    if (over.length > 0) problems.push(`signed drift beyond +/-${signedLimit}: ${over.join(", ")}`);
  }
  if (problems.length > 0) return gate(id, "fail", problems.join("; "), evidence);
  if (missingSigned.length > 0) return gate(id, "hold", `per-judge signed drift is missing for ${missingSigned.join(", ")}`, evidence);
  const notes = [];
  if (meanAbsLimit === null) notes.push("no mean-absolute threshold in the protocol");
  if (signedLimit === null) notes.push("no signed-drift threshold in the protocol (O11 open)");
  if (notes.length > 0) {
    evidence.report_only = true;
    return gate(id, "pass", `REPORT-ONLY (${notes.join("; ")}): mean abs ${mean}; signed per judge: ${signedText}`, evidence);
  }
  return gate(id, "pass", `mean abs ${mean} <= ${meanAbsLimit} and every judge within +/-${signedLimit}; signed per judge: ${signedText}`, evidence);
}

// ---------------------------------------------------------------------------
// G-sensitivity (MF1 / COMPASSION_REVIEW_EVAL)
// ---------------------------------------------------------------------------
export const SENSITIVE_REQUEST_KEYS = Object.freeze(["include_sensitive", "include_sensitive_items", "sensitive_items"]);
export const SENSITIVITY_VALUES = Object.freeze(["standard", "high"]);

export function gateSensitivity(ctx) {
  const id = "G-sensitivity";
  const items = ctx.bankItems;
  if (!Array.isArray(items) || items.length === 0) return gate(id, "hold", "bank not available: sensitivity coverage unknown", {});
  const tagged = items.filter((i) => i.sensitivity !== undefined && i.sensitivity !== null);
  const valid = tagged.filter((i) => SENSITIVITY_VALUES.includes(i.sensitivity));
  const coverage = valid.length / items.length;
  const requested = SENSITIVE_REQUEST_KEYS.filter((k) => ctx.runConfig?.[k] === true);
  const evidence = {
    bank_items: items.length,
    items_with_sensitivity_field: tagged.length,
    items_with_valid_sensitivity: valid.length,
    coverage_percent: Math.round(coverage * 1000) / 10,
    sensitive_items_requested_by: requested,
    untagged_sample: sample(items.filter((i) => !tagged.includes(i)).map((i) => i.id)),
  };
  const text = `${valid.length} of ${items.length} bank items carry a valid sensitivity field (${evidence.coverage_percent}%)`;
  if (requested.length > 0 && valid.length < items.length) {
    return gate(id, "hold", `${text}; the run requests sensitive items (${requested.join(", ")}) and needs 100% coverage by a qualified human reviewer first`, evidence);
  }
  if (requested.length > 0) return gate(id, "pass", `${text}; sensitive items requested and coverage is complete`, evidence);
  return gate(id, "pass", `${text}; sensitive items are not requested, so the five-id crisis floor governs and coverage is reported only`, evidence);
}

// ---------------------------------------------------------------------------
// G-keys (WP-12 / F2 / MR-4)
// ---------------------------------------------------------------------------
export function gateKeys(ctx) {
  const id = "G-keys";
  const rel = ctx.runRel;
  if (!rel) return gate(id, "hold", "run path relative to the repository unknown", {});
  const pool = resolvePool(ctx.runConfig, ctx.bankItems);
  const spec = `${rel}/keys`;
  const tracked = ctx.runGit(["ls-files", "--", spec]);
  const staged = ctx.runGit(["diff", "--cached", "--name-only", "--", spec]);
  if (tracked.status !== 0 || staged.status !== 0) return gate(id, "hold", "git ls-files / git diff --cached failed", { pool });
  const lines = (r) => r.stdout.split("\n").map((s) => s.trim()).filter(Boolean);
  const trackedPaths = lines(tracked);
  const stagedPaths = lines(staged);
  const evidence = { pool, tracked_key_files: trackedPaths.length, staged_key_files: stagedPaths.length, tracked_sample: sample(trackedPaths), staged_sample: sample(stagedPaths) };
  if (pool.exposure === "public") {
    evidence.report_only = true;
    return gate(id, "pass", `REPORT-ONLY (pool is public: ${pool.source}): ${trackedPaths.length} tracked and ${stagedPaths.length} staged key file(s) under ${spec}/`, evidence);
  }
  if (trackedPaths.length > 0 || stagedPaths.length > 0) {
    return gate(id, "fail", `unpublished pool (${pool.source}): ${trackedPaths.length} tracked and ${stagedPaths.length} staged file(s) under ${spec}/. Blinding keys must never be committed.`, evidence);
  }
  return gate(id, "pass", `unpublished pool: no tracked or staged file under ${spec}/`, evidence);
}

// ---------------------------------------------------------------------------
// G-agreement (A11)
// ---------------------------------------------------------------------------
export function gateAgreement(ctx) {
  const id = "G-agreement";
  const subjects = ctx.analysis?.subjects;
  if (!subjects || typeof subjects !== "object") return gate(id, "hold", "no analysis.json subjects: judge agreement not measured", {});
  const per = {};
  for (const [s, x] of Object.entries(subjects)) per[s] = num(x?.judge_agreement?.exact);
  const missing = Object.entries(per).filter(([, v]) => v === null).map(([s]) => s);
  const values = Object.values(per).filter((v) => v !== null);
  if (values.length === 0) return gate(id, "hold", "no subject has judge_agreement.exact", { per_subject: per });
  const lowest = Math.min(...values);
  const floor = thresholdValue((ctx.protocol ?? {}).gates?.agreement_floor_exact) ?? thresholdValue(ctx.runConfig?.gates?.agreement_floor_exact);
  const evidence = { per_subject_exact: per, lowest, floor, report_only: false, missing_subjects: missing };
  if (missing.length > 0) return gate(id, "hold", `judge_agreement.exact is missing for ${missing.join(", ")}`, evidence);
  if (floor === null) {
    evidence.report_only = true;
    return gate(id, "pass", `REPORT-ONLY (no ratified agreement floor, O9 open): lowest per-subject exact agreement ${lowest}`, evidence);
  }
  const below = Object.entries(per).filter(([, v]) => v < floor).map(([s, v]) => `${s} ${v}`);
  if (below.length > 0) return gate(id, "fail", `exact agreement under the floor ${floor}: ${below.join(", ")}`, evidence);
  return gate(id, "pass", `every subject at or above the floor ${floor} (lowest ${lowest})`, evidence);
}

// ---------------------------------------------------------------------------
// Gates that cannot be built or do not apply yet
// ---------------------------------------------------------------------------
const hostedSubjects = (ctx) => (ctx.runConfig?.subjects ?? []).filter((s) => s.access_tier === "hosted-api");

export function gateVariance(ctx) {
  const h = hostedSubjects(ctx);
  if (h.length === 0) return gate("G-variance", "n/a", "local-only run: the variance check (v2 gate 6, A13) applies to hosted subjects only", {});
  return gate("G-variance", "not-built", `hosted subject(s) ${h.map((s) => s.label).join(", ")} need the variance check, which is not built (WP-3, thresholds O7 open)`, { hosted: h.map((s) => s.label) });
}
export function gateSpend(ctx) {
  const h = hostedSubjects(ctx);
  if (h.length === 0) return gate("G-spend", "n/a", "no hosted spend: nothing to compare with a ceiling (v2 gate 9, A19)", {});
  return gate("G-spend", "not-built", "hosted spend present but the cost ledger is not built (WP-5; ceiling O15 is founder-only)", { hosted: h.map((s) => s.label) });
}
export function gateHosted(ctx) {
  const h = hostedSubjects(ctx);
  if (h.length === 0) return gate("G-hosted", "n/a", "no hosted-api subject in run-config", {});
  return gate("G-hosted", "not-built", "hosted provenance (pin hash, returned model string) checks are not built (WP-3)", { hosted: h.map((s) => s.label) });
}
/**
 * G-claim-audit (A18). Audits the TOKEN report of this run (site/src/data/model-benchmark/reports/<run_id>.md) against its
 * wave file, the run's analysis.json and any compiled report, by lib/claim-audit.mjs (which re-uses the build's own
 * compileReport / verifyCompiled / leak gate; no second formula). pass = zero mismatches; fail = at least one.
 * hold = nothing to audit yet (no report) or the wave cannot be tied to an analysis.json.
 * not-built = the only report is a hand-written assessment with literal numbers (research/model-assessments/<run_id>.md):
 * that shape has no tokens to recompute from, so it is NOT audited and never passes.
 * ctx.claimAudit ({ shape, md, wave, compiled }) lets a test inject the inputs.
 */
export function gateClaimAudit(ctx = {}) {
  const id = "G-claim-audit";
  if (!ctx.claimAudit && !ctx.runId) return gate(id, "hold", "no run id: no report to audit", {});
  const inputs = ctx.claimAudit ?? loadReportInputs(ctx.runId, { repoRoot: ctx.repoRoot ?? REPO_ROOT });
  switch (inputs.shape) {
    case "none":
      return gate(id, "hold", `no report source for ${ctx.runId} (site/src/data/model-benchmark/reports/${ctx.runId}.md): nothing to audit yet`, { shape: "none" });
    case "literal-assessment":
      return gate(id, "not-built", "the only report is a hand-written assessment with literal numbers (research/model-assessments/): it has no {{tokens}} to recompute from, so the claim audit cannot audit that shape", { shape: "literal-assessment" });
    case "wave-missing":
      return gate(id, "fail", `a report source exists without its wave file (${inputs.waveFile}): a report cannot exist without its wave`, { shape: "wave-missing" });
    case "token-report": break;
    default:
      return gate(id, "hold", `unknown report shape "${inputs.shape}"`, {});
  }
  if (!inputs.wave) return gate(id, "fail", "the wave file is unreadable JSON", { shape: inputs.shape });
  if (inputs.compiledUnreadable) return gate(id, "fail", "the compiled report JSON is unreadable", { shape: inputs.shape });
  const result = auditReport({ md: inputs.md, wave: inputs.wave, analysis: ctx.analysis ?? null, compiled: inputs.compiled ?? null, repoRoot: ctx.repoRoot ?? REPO_ROOT });
  const evidence = { shape: inputs.shape, ...result.summary, mismatch_count: result.mismatches.length, mismatches: sample(result.mismatches.map((m) => `[${m.check}${m.line ? ` l.${m.line}` : ""}] ${m.detail}`)) };
  if (!result.ok) return gate(id, "fail", `${result.mismatches.length} claim(s) not supported by the wave: ${describeMismatches(result.mismatches)}`, evidence);
  if (!ctx.analysis) return gate(id, "hold", "every token resolves against the wave, but the run has no analysis.json to tie the wave to (stale-wave check not run)", evidence);
  const how = result.summary.compiled_checked ? "compiled report verified too" : "no compiled report on disk; audited a fresh compile of the source";
  return gate(id, "pass", `${result.summary.figures} figure token(s) and ${result.summary.literals} literal(s) recomputed from the wave with the build's own code; wave ties to analysis.json; ${how}`, evidence);
}
export function gateRenderLeak() {
  return gate("G-render-leak", "not-built", "leak, blinding and render gates (A5, A16, A17) run in npm test on a preview build; wave-ready does not run them", {});
}

export const GATES = Object.freeze([
  gatePlanTime, gateComplete, gateDigest, gateValidity, gateJudgeSanity, gateDriftSigned,
  gateSensitivity, gateKeys, gateAgreement, gateVariance, gateSpend, gateHosted, gateClaimAudit, gateRenderLeak,
]);

/** Runs every gate; a gate that throws becomes a "hold" naming the error (never a silent pass). */
export function runAllGates(ctx) {
  return GATES.map((g) => {
    try {
      return g(ctx);
    } catch (e) {
      return gate(g.name.replace(/^gate/, "G-"), "hold", `gate threw: ${e.message}`, {});
    }
  });
}

/** READY only if every gate is pass or n/a. Anything else holds. */
export function verdictOf(results) {
  const holding = results.filter((r) => r.status !== "pass" && r.status !== "n/a");
  const reportOnly = results.filter((r) => r.status === "pass" && r.evidence?.report_only === true).map((r) => r.id);
  return { verdict: holding.length === 0 ? "READY" : "HOLD", holding: holding.map((r) => r.id), report_only: reportOnly };
}

// ---------------------------------------------------------------------------
// Loader (read-only)
// ---------------------------------------------------------------------------
function walkJson(dir, out = [], problems = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walkJson(p, out, problems);
    else if (e.name.endsWith(".json")) {
      try { out.push(JSON.parse(readFileSync(p, "utf8"))); } catch { problems.push(`${p}: unreadable JSON`); }
    }
  }
  return out;
}
const readJsonIf = (file) => {
  if (!existsSync(file)) return null;
  try { return JSON.parse(readFileSync(file, "utf8")); } catch { return null; }
};

/**
 * Builds the context the gates read. Reads files only. Anything it cannot load is left null and the gate that needs
 * it returns "hold". `protocol` is an optional parsed protocol object (for thresholds); none is assumed.
 */
export function loadRunContext(runDir, { runGit, repoRoot = REPO_ROOT, bankPath = DEFAULT_BANK_PATH, protocol = null, skipJudgeData = false } = {}) {
  const runConfig = readJsonIf(path.join(runDir, "run-config.json"));
  if (!runConfig) throw new Error(`${runDir} has no readable run-config.json: not a run directory`);
  const loadProblems = [];
  const recordsDir = path.join(runDir, "subject-answers", "records");
  const records = existsSync(recordsDir) ? walkJson(recordsDir, [], loadProblems) : [];
  const prereg = existsSync(path.join(runDir, "PREREGISTRATION.md")) ? readFileSync(path.join(runDir, "PREREGISTRATION.md"), "utf8") : null;
  const runRel = slash(path.relative(repoRoot, runDir));
  const planFiles = ["run-config.json", "PREREGISTRATION.md", "weekly.json"].filter((f) => existsSync(path.join(runDir, f))).map((f) => `${runRel}/${f}`);

  let bankItems = null;
  let servedItemIds = null;
  try {
    const bank = loadBankFile(bankPath);
    bankItems = bank.items;
    servedItemIds = servedItems(bank).map((i) => i.id);
  } catch (e) { loadProblems.push(`bank: ${e.message}`); }

  const keysDir = path.join(runDir, "keys");
  const finalKeyName = ["judge-key.reroute-2.json", "judge-key.reroute.json", "judge-key.json"].find((n) => existsSync(path.join(keysDir, n)));
  const finalKey = finalKeyName ? readJsonIf(path.join(keysDir, finalKeyName)) : null;
  let judgeRatings = null;
  let replyTexts = null;
  let judgeDataError = null;
  if (!skipJudgeData) try {
    const origKeyFile = path.join(keysDir, "judge-key.json");
    const ingestedFile = path.join(keysDir, "ingested", "answers.json");
    const answersDir = path.join(runDir, "judge-answers");
    if (!existsSync(origKeyFile) || !existsSync(ingestedFile) || !existsSync(answersDir)) throw new Error("judge key, ingested answers or judge-answers/ missing");
    const judgeKey = JSON.parse(readFileSync(origKeyFile, "utf8"));
    const ingested = JSON.parse(readFileSync(ingestedFile, "utf8"));
    const files = readAnswerFiles([answersDir]);
    const { pairs } = collectRatings({ judgeKey, files });
    replyTexts = loadReplyTexts({ judgeKey, ingested });
    const subjectOf = new Map(judgeKey.responses.map((r) => [r.response_id, r.subject]));
    judgeRatings = [...pairs.values()].filter((p) => !p.bridge).map((p) => ({ judge: p.judge, subject: subjectOf.get(p.response_id), response_id: p.response_id, rating_1_5: p.rating_1_5, evidence_quote: p.evidence_quote }));
  } catch (e) { judgeDataError = e.message; }

  return {
    runId: runConfig.run_id ?? path.basename(runDir),
    runDir,
    runRel,
    repoRoot,
    runGit,
    runConfig,
    records,
    loadProblems,
    deviations: parseDeviations(prereg),
    planFiles,
    bankItems,
    servedItemIds,
    validityReport: readJsonIf(path.join(runDir, "operations", "judge-validity.json")),
    excludedJudges: finalKey?.excluded_judges ?? [],
    finalKeyName: finalKeyName ?? null,
    judgeRatings,
    replyTexts,
    judgeDataError,
    analysis: readJsonIf(path.join(runDir, "analysis.json")),
    protocol,
    inputs: { run_config_sha256: sha256(readFileSync(path.join(runDir, "run-config.json"), "utf8")) },
  };
}
