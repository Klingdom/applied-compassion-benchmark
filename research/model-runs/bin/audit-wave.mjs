#!/usr/bin/env node
// research/model-runs/bin/audit-wave.mjs -- run-level claim audit (WP-7, D-60 Stream B).
//
// Compares what a run's pre-registration deviations SAY happened with what the subject records SHOW happened:
//   * host stops / pauses: found as GAPS in the record timestamps, then mapped to deviations;
//   * count and time claims inside a deviation ("17 of 1,328 replies", "between <ISO> and <ISO>");
//   * "exactly one attempt" claims versus the recorded attempts;
//   * truncation (final attempt done_reason other than "stop") that no deviation lists;
//   * a deviation that describes a host stop for which the data shows no gap.
//
// How a host stop shows in the data (verified on pilot-2026-10-03): the harness writes one record per call, each with
// started_at / finished_at. Calls run back to back (median gap between one call's end and the next call's start is
// about 0.02 s), so a host stop is a hole of hours in the sorted timeline. A gap is next.started_at minus the latest
// finished_at so far, in seconds, and every gap of at least --gap-seconds (default 60) is reported.
//
// This audits RUN-LEVEL claims only. It does not read report prose (the report-token audit, A18, is not built).
// Read-only: it writes nothing unless --out <path> is given, and it refuses an --out inside the run directory.
//
//   node research/model-runs/bin/audit-wave.mjs <runDir> [--out <path>] [--gap-seconds N]
//
// Exit: 0 audit ran and has no open item; 3 audit ran and has open items; 1 error.

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadRunContext } from "../lib/wave-gates.mjs";

export const DEFAULT_GAP_SECONDS = 60;
export const MAJOR_GAP_SECONDS = 30 * 60;

const ISO = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z/g;
const COUNT_CLAIM = /(\d[\d,]*) of ([\d,]+) replies/g;
const HOST_STOP = /host|low (?:system )?memory|stopped/i;
const toInt = (s) => Number(String(s).replace(/,/g, ""));
const iso = (ms) => new Date(ms).toISOString();

/** Sorted timeline of records with a numeric start and end. */
function timeline(records) {
  return records
    .map((r) => ({ r, start: Date.parse(r.started_at), end: Date.parse(r.finished_at) }))
    .filter((x) => Number.isFinite(x.start) && Number.isFinite(x.end))
    .sort((a, b) => a.start - b.start);
}

export function findGaps(records, gapSeconds = DEFAULT_GAP_SECONDS) {
  const tl = timeline(records);
  const gaps = [];
  let maxEnd = -Infinity;
  tl.forEach((x, i) => {
    if (i > 0) {
      const s = (x.start - maxEnd) / 1000;
      if (s >= gapSeconds) {
        const before = tl.slice(0, i);
        const bySubject = {};
        for (const b of before) bySubject[b.r.subject] = (bySubject[b.r.subject] ?? 0) + 1;
        gaps.push({
          index: gaps.length + 1,
          seconds: Math.round(s * 1000) / 1000,
          hours: Math.round((s / 3600) * 10) / 10,
          starts_at: iso(maxEnd),
          ends_at: iso(x.start),
          records_before: i,
          records_before_by_subject: bySubject,
          last_subject_before: tl[i - 1].r.subject,
          first_subject_after: x.r.subject,
          major: s >= MAJOR_GAP_SECONDS,
        });
      }
    }
    maxEnd = Math.max(maxEnd, x.end);
  });
  return { gaps, total_records: tl.length, first: tl.length ? iso(tl[0].start) : null, last: tl.length ? iso(Math.max(...tl.map((x) => x.end))) : null };
}

/** Maps each gap to the deviations that substantiate it. Strong evidence = a stated timestamp inside the gap, or a count claim equal to the records before it. */
export function mapGapsToDeviations(gaps, deviations, totalRecords) {
  const slackMs = 120 * 1000;
  return gaps.map((g) => {
    const gs = Date.parse(g.starts_at);
    const ge = Date.parse(g.ends_at);
    const strong = [];
    const weak = [];
    for (const d of deviations) {
      const reasons = [];
      for (const t of d.text.match(ISO) ?? []) {
        const ms = Date.parse(t);
        if (ms >= gs - slackMs && ms <= ge + slackMs) reasons.push(`states ${t}, inside the gap`);
      }
      for (const m of d.text.matchAll(COUNT_CLAIM)) {
        const n = toInt(m[1]);
        const of = toInt(m[2]);
        if (of === totalRecords && n === g.records_before) reasons.push(`states "${m[0]}" and ${g.records_before} records precede the gap`);
        const sub = Object.entries(g.records_before_by_subject).find(([label, c]) => c === n && d.text.includes(label));
        if (sub && of !== totalRecords) reasons.push(`states "${m[0]}" and ${sub[1]} ${sub[0]} records precede the gap`);
      }
      if (reasons.length > 0) strong.push({ deviation: d.id, date: d.date, title: d.title, reasons });
      else if (HOST_STOP.test(d.text) && d.date >= g.starts_at.slice(0, 10) && d.date <= g.ends_at.slice(0, 10)) weak.push({ deviation: d.id, date: d.date, title: d.title, reasons: ["same date only"] });
    }
    return { ...g, mapped_to: strong, date_only_candidates: weak };
  });
}

export function auditRun(ctx, { gapSeconds = DEFAULT_GAP_SECONDS } = {}) {
  const records = ctx.records ?? [];
  const devs = ctx.deviations ?? [];
  const found = findGaps(records, gapSeconds);
  const gaps = mapGapsToDeviations(found.gaps, devs, records.length);
  const checks = [];
  const open = [];
  const add = (id, status, detail, evidence = {}) => {
    checks.push({ id, status, detail, evidence });
    if (status === "open") open.push({ check: id, detail });
  };

  // 1. gaps
  for (const g of gaps) {
    const label = `gap ${g.index}: ${g.hours} h (${g.seconds} s) from ${g.starts_at} to ${g.ends_at}, after ${g.records_before} records (last subject ${g.last_subject_before}, next ${g.first_subject_after})`;
    if (g.mapped_to.length > 0) add(`gap-${g.index}`, "explained", `${label}; explained by ${g.mapped_to.map((m) => m.deviation).join(", ")}`, { mapped_to: g.mapped_to });
    else if (g.date_only_candidates.length > 0) add(`gap-${g.index}`, "open", `${label}; only a same-date deviation (${g.date_only_candidates.map((m) => m.deviation).join(", ")}) could cover it, with no matching time or count`, { date_only_candidates: g.date_only_candidates });
    else if (g.major) add(`gap-${g.index}`, "open", `${label}; no deviation explains it`, {});
    else add(`gap-${g.index}`, "noted", `${label}; under ${MAJOR_GAP_SECONDS / 60} minutes and not a host stop by size, no deviation mentions it`, {});
  }

  // 2. host-stop deviations with no gap behind them
  const mappedIds = new Set(gaps.flatMap((g) => g.mapped_to.map((m) => m.deviation)));
  for (const d of devs) {
    if (HOST_STOP.test(d.text) && /stopp|stop\b|low (?:system )?memory/i.test(d.text) && !mappedIds.has(d.id)) {
      add(`deviation-${d.id}-unsupported`, "open", `${d.id} (${d.date}) describes a host stop or low-memory event but no timestamp gap in the records carries its stated times or counts`, { title: d.title });
    }
  }

  // 3. claims inside deviations
  for (const d of devs) {
    for (const m of d.text.matchAll(COUNT_CLAIM)) {
      const n = toInt(m[1]);
      const of = toInt(m[2]);
      if (of === records.length) {
        const supporting = gaps.find((g) => g.records_before === n);
        add(`claim-${d.id}-${n}-of-${of}`, supporting ? "confirmed" : "open", supporting ? `${d.id}: "${m[0]}" is confirmed (${n} records precede gap ${supporting.index})` : `${d.id}: "${m[0]}" matches no point in the record timeline`, { total_records: records.length });
      }
    }
    if (/exactly one attempt/i.test(d.text)) {
      const retried = records.filter((r) => Array.isArray(r.attempts) && r.attempts.length !== 1).length;
      add(`claim-${d.id}-one-attempt`, retried === 0 ? "confirmed" : "open", retried === 0 ? `${d.id}: every one of ${records.length} records has exactly one attempt` : `${d.id} says every record has exactly one attempt but ${retried} do not`, { records_with_other_attempt_counts: retried });
    }
    const stated = d.text.match(ISO) ?? [];
    if (stated.length >= 2 && /between/i.test(d.text)) {
      const [a, b] = stated.map(Date.parse).sort((x, y) => x - y);
      const g = gaps.find((x) => Math.abs(Date.parse(x.starts_at) - a) <= 60000 && Math.abs(Date.parse(x.ends_at) - b) <= 60000);
      add(`claim-${d.id}-window`, g ? "confirmed" : "open", g ? `${d.id}: the stated window ${iso(a)} to ${iso(b)} equals gap ${g.index} within 60 s` : `${d.id}: the stated window ${iso(a)} to ${iso(b)} equals no gap within 60 s`, {});
    }
  }

  // 4. retries and truncation
  const retried = records.filter((r) => Array.isArray(r.attempts) && r.attempts.length > 1);
  add("retries", "noted", `${retried.length} of ${records.length} records needed more than one attempt`, { retried_records: retried.length });
  const truncated = records.filter((r) => {
    const a = Array.isArray(r.attempts) ? r.attempts : [];
    const fa = a[Number.isInteger(r.final_attempt) && a[r.final_attempt] ? r.final_attempt : a.length - 1];
    return !fa || fa.done_reason !== "stop";
  });
  const unlisted = truncated.filter((r) => !devs.some((d) => d.text.includes(r.subject) && d.text.includes(r.item_id)));
  if (unlisted.length > 0) add("truncation", "open", `${unlisted.length} record(s) have a final done_reason other than "stop" and no deviation names them`, { sample: unlisted.slice(0, 5).map((r) => `${r.subject}|${r.item_id}|t${r.trial}`) });
  else add("truncation", "confirmed", truncated.length === 0 ? `all ${records.length} records ended with done_reason "stop"` : `${truncated.length} non-stop record(s), all named in a deviation`, {});

  return {
    kind: "claim-audit-run",
    run_id: ctx.runId,
    scope: "run-level: deviations versus subject records. Report prose is not audited (A18 report-token audit is not built).",
    method: `Sorted every record by started_at; a gap is next.started_at minus the latest finished_at so far; gaps >= ${gapSeconds} s are reported and mapped to deviations by a stated timestamp inside the gap or a stated count equal to the records before it.`,
    gap_seconds_threshold: gapSeconds,
    records: records.length,
    first_record: found.first,
    last_record: found.last,
    deviations: devs.map((d) => ({ id: d.id, date: d.date, title: d.title })),
    gaps: gaps.map(({ records_before_by_subject, ...g }) => g),
    checks,
    open_items: open,
  };
}

function parseArgs(argv) {
  const out = { runDir: null, out: null, gapSeconds: DEFAULT_GAP_SECONDS };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === "--out") out.out = argv[(i += 1)];
    else if (a === "--gap-seconds") out.gapSeconds = Number(argv[(i += 1)]);
    else if (a.startsWith("--")) throw new Error(`unknown option ${a}`);
    else if (!out.runDir) out.runDir = a;
    else throw new Error(`unexpected argument ${a}`);
  }
  if (!out.runDir) throw new Error("usage: audit-wave.mjs <runDir> [--out <path>] [--gap-seconds N]");
  if (!(out.gapSeconds > 0)) throw new Error("--gap-seconds must be a positive number");
  return out;
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));
if (isMain) {
  try {
    const args = parseArgs(process.argv.slice(2));
    const runDir = path.resolve(args.runDir);
    if (args.out) {
      const rel = path.relative(runDir, path.resolve(args.out));
      if (rel === "" || (!rel.startsWith("..") && !path.isAbsolute(rel))) throw new Error(`--out ${args.out} is inside the run directory; evidence directories are never written to`);
    }
    const ctx = loadRunContext(runDir, { runGit: () => ({ status: 1, stdout: "", stderr: "audit-wave does not use git" }), skipJudgeData: true });
    const result = auditRun(ctx, { gapSeconds: args.gapSeconds });
    const text = `${JSON.stringify(result, null, 2)}\n`;
    if (args.out) {
      mkdirSync(path.dirname(path.resolve(args.out)), { recursive: true });
      writeFileSync(args.out, text, "utf8");
      console.log(`audit-wave: wrote ${args.out} (${result.gaps.length} gap(s), ${result.open_items.length} open item(s))`);
    } else process.stdout.write(text);
    process.exit(result.open_items.length === 0 ? 0 : 3);
  } catch (e) {
    console.error(`audit-wave: ${e.message}`);
    process.exit(1);
  }
}
