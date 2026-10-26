// research/model-runs/lib/claim-audit.mjs
//
// G-claim-audit (A18, TEST_PLAN_EVAL; D-63 Stream A, backlog EVAL-CLAIMAUDIT).
//
// A pilot or wave report must never print a figure that its wave file does not support. This module audits one
// report SOURCE (site/src/data/model-benchmark/reports/<run_id>.md, a {{path|format}} token report) against its wave
// file (site/src/data/model-benchmark/waves/<run_id>.json) and, when given, the run's analysis.json and the compiled
// report JSON. It returns a list of mismatches. An empty list is a pass.
//
// NO SECOND FORMULA. Nothing here formats, rounds or derives a number itself. Every recomputation goes through the
// code the build uses:
//   * compileReport()        resolves every token against the wave (resolvePath + applyFormat), and enforces the
//                            copy rules: bare digits, literal cap and sources, point/range display (D-29a).
//   * verifyCompiled()       re-resolves every ledger entry of a compiled report against the wave and compares the
//                            rendered text, offsets and every remaining digit of the compiled text.
//   * leakProblems()         the G19 leak gate, run over the compiled HTML (a point of a model that is not separated).
//   * canonicalSha256()      ties the wave to the run's analysis.json (a stale wave is a mismatch).
//
// What it adds on top, because the build does not check it: range bounds in order (ledger entries AND any "a to b"
// printed in the text, including inside a {{lit:}}), a committed compiled report that differs from a fresh compile
// of its own source, and each {{lit:TEXT|source:FILE}} whose cited repo file does not contain the literal.
//
// WHAT IS AUDITED: the token-shaped wave report. WHAT IS NOT (reported by classifyReportShape, never silently
// passed): hand-written assessments with literal numbers (research/model-assessments/<run_id>.md) and experiment
// REPORT.md files. They carry no token to recompute from; the gate returns "not-built" for them.
//
// Read-only. Pure except for loadReportInputs / the optional file check for literals.

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { REPO_ROOT } from "./common.mjs";
import { compileReport, verifyCompiled, reportText } from "../../../site/scripts/lib/model-report.mjs";
import { canonicalSha256 } from "../../../site/scripts/lib/model-wave.mjs";
import { readDimensionNames } from "../../../site/scripts/lib/dimension-names.mjs";
import { leakProblems } from "../../../site/scripts/lib/model-report-html-gates.mjs";

export const MODEL_BENCHMARK_DIR = ["site", "src", "data", "model-benchmark"];
export const CHECKS = Object.freeze([
  "no-source", "literal", "wrong-figure", "swapped-bounds", "point-display", "stale-wave", "compiled-drift", "wave-invalid", "report-rule", "audit-crash",
]);

const NO_SOURCE_RULES = new Set(["R-token-unresolved", "R-token-format", "R-bare-digit", "R-token-syntax", "R-title-token", "R-title-digit", "R-front-figure", "R-binding"]);
const LITERAL_RULES = new Set(["R-lit-source", "R-lit-cap", "R-measured-original"]);
const POINT_RULES = new Set(["R-group-point", "R-point-in-prose", "R-reconstruct", "R-withheld-difference", "R-difference-unseparated", "R-implied-order", "R-claims-vs-pairwise", "R-uncorrected-claim"]);

const mismatch = (check, detail, extra = {}) => ({ check, line: extra.line ?? 0, token: extra.token ?? null, detail });

/** Maps a compileReport error to an audit check id. */
export function checkOfRule(rule) {
  if (rule === "R-wave-invalid") return "wave-invalid";
  if (NO_SOURCE_RULES.has(rule)) return "no-source";
  if (LITERAL_RULES.has(rule)) return "literal";
  if (POINT_RULES.has(rule)) return "point-display";
  return "report-rule";
}

// A range as the site writes it: "lo to hi", plain or typographic minus, integers or decimals.
const RANGE_IN_TEXT = /(?<![\d.])([−-]?\d[\d,]*(?:\.\d+)?) to ([−-]?\d[\d,]*(?:\.\d+)?)(?![\d])/g;
const toNumber = (s) => Number(s.replace(/,/g, "").replace("−", "-"));

/** Every "a to b" in `text` whose first number is greater than its second. */
export function swappedRanges(text) {
  const out = [];
  for (const m of text.matchAll(RANGE_IN_TEXT)) {
    const lo = toNumber(m[1]);
    const hi = toNumber(m[2]);
    if (Number.isFinite(lo) && Number.isFinite(hi) && lo > hi) out.push({ text: m[0], at: m.index });
  }
  return out;
}

const RANGE_FORMATS = new Set(["range", "range0", "range2"]);

function auditRanges(report, mismatches) {
  for (const e of report.figure_ledger) {
    if (e.kind === "fig" && RANGE_FORMATS.has(e.format)) {
      const v = e.value;
      if (!Array.isArray(v) || v.length !== 2 || !(v[0] <= v[1])) {
        mismatches.push(mismatch("swapped-bounds", `${e.token}: the wave's range is [${Array.isArray(v) ? v.join(", ") : v}], lower bound above upper bound`, { line: e.line, token: e.token }));
      }
    }
    if (e.kind === "lit") {
      for (const s of swappedRanges(e.rendered ?? "")) mismatches.push(mismatch("swapped-bounds", `literal "${s.text}" has its bounds swapped (lower bound above upper bound)`, { line: e.line, token: `{{lit:${e.rendered}}}` }));
    }
  }
  // Anything the reader sees, including text the ledger has no entry for.
  for (const s of swappedRanges(reportText(report))) {
    if (!mismatches.some((m) => m.check === "swapped-bounds" && m.detail.includes(`"${s.text}"`) )) {
      mismatches.push(mismatch("swapped-bounds", `the report text prints "${s.text}" with the lower bound above the upper bound`, {}));
    }
  }
}

/** Each {{lit:TEXT|source:FILE}} whose source is a repo file must exist and hold the literal's numbers on one line. */
function auditLiterals(report, repoRoot, mismatches, unaudited) {
  for (const e of report.figure_ledger) {
    if (e.kind !== "lit") continue;
    const nums = (e.rendered ?? "").match(/\d[\d,.]*/g) ?? [];
    if (nums.length === 0) continue;
    const src = String(e.source ?? "");
    const looksLikeFile = /^[\w./\\-]+\.[A-Za-z0-9]+$/.test(src) && /[\\/]/.test(src);
    if (!looksLikeFile) { unaudited.push({ literal: e.rendered, source: src, why: "source is not a repo file path: cannot be recomputed" }); continue; }
    const file = path.join(repoRoot, src);
    if (!existsSync(file)) { mismatches.push(mismatch("literal", `literal "${e.rendered}": its source ${src} does not exist`, { line: e.line })); continue; }
    const lines = readFileSync(file, "utf8").split(/\r?\n/);
    const wanted = nums.map((n) => n.replace(/[.,]+$/, ""));
    const hit = lines.some((l) => wanted.every((n) => new RegExp(`(?<![\\d.])${n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![\\d])`).test(l)));
    if (!hit) mismatches.push(mismatch("literal", `literal "${e.rendered}": no line of ${src} holds ${wanted.join(" and ")}`, { line: e.line }));
    else unaudited.push({ literal: e.rendered, source: src, why: "found in its cited file (a file is not a wave field; counted as sourced, not recomputed)" });
  }
}

/**
 * Audits one token report.
 * @param {object} p
 * @param {string} p.md           the report source (markdown with {{tokens}})
 * @param {object} p.wave         the parsed wave file
 * @param {object} [p.analysis]   the run's parsed analysis.json; when given, the wave must be its projection (source_sha256)
 * @param {object} [p.compiled]   a parsed compiled report JSON; when given it must equal a fresh compile of md + wave
 * @param {object} [p.dimensionNames]
 * @param {string} [p.repoRoot]
 * @returns {{ ok: boolean, mismatches: object[], summary: object }}
 */
export function auditReport({ md, wave, analysis = null, compiled = null, dimensionNames = null, repoRoot = REPO_ROOT }) {
  const mismatches = [];
  const unaudited = [];
  const summary = { figures: 0, literals: 0, compiled_checked: false, analysis_checked: false, literal_notes: unaudited };
  let fresh = null;
  try {
    const names = dimensionNames ?? readDimensionNames();
    const res = compileReport({ md, wave, dimensionNames: names });
    for (const e of res.errors) mismatches.push(mismatch(checkOfRule(e.rule), `${e.rule}: ${e.message}`, { line: e.line }));
    fresh = res.report;
  } catch (err) {
    mismatches.push(mismatch("audit-crash", `compileReport threw: ${err.message}`));
  }

  if (analysis) {
    summary.analysis_checked = true;
    const sha = canonicalSha256(analysis);
    if (sha !== wave.source_sha256) mismatches.push(mismatch("stale-wave", `the wave's source_sha256 (${String(wave.source_sha256).slice(0, 12)}) is not the hash of the run's analysis.json (${sha.slice(0, 12)}): the wave file is not a projection of this analysis`));
  }

  if (fresh) {
    summary.figures = fresh.figure_ledger.filter((e) => e.kind === "fig").length;
    summary.literals = fresh.figure_ledger.filter((e) => e.kind === "lit").length;
    try {
      auditRanges(fresh, mismatches);
      auditLiterals(fresh, repoRoot, mismatches, unaudited);
      // D-29a through the G19 leak gate, over the compiled HTML (catches a point typed inside a literal).
      const html = [fresh.preface.html, ...fresh.sections.map((s) => s.html), ...fresh.front_matter.map((l) => `<p>${l}</p>`)].join("\n");
      for (const p of leakProblems({ html, wave, kind: "report" })) mismatches.push(mismatch("point-display", p));
    } catch (err) {
      mismatches.push(mismatch("audit-crash", `post-compile checks threw: ${err.message}`));
    }
  }

  if (compiled) {
    summary.compiled_checked = true;
    try {
      for (const p of verifyCompiled(compiled, wave)) mismatches.push(mismatch(p.startsWith("V-rendered") || p.startsWith("V-unexplained-digit") || p.startsWith("V-offset") ? "wrong-figure" : "compiled-drift", p));
      auditRanges(compiled, mismatches);
      if (fresh && JSON.stringify(fresh) !== JSON.stringify(compiled)) {
        const a = fresh.figure_ledger;
        const b = compiled.figure_ledger ?? [];
        const k = Math.max(a.length, b.length);
        let first = -1;
        for (let i = 0; i < k; i += 1) if (JSON.stringify(a[i]) !== JSON.stringify(b[i])) { first = i; break; }
        mismatches.push(mismatch("compiled-drift", first >= 0
          ? `the compiled report differs from a fresh compile of its source; first ledger difference at entry ${first}: compiled "${b[first]?.rendered}" vs source "${a[first]?.rendered}"`
          : "the compiled report differs from a fresh compile of its source outside the figure ledger"));
      }
    } catch (err) {
      mismatches.push(mismatch("audit-crash", `compiled-report checks threw: ${err.message}`));
    }
  }
  return { ok: mismatches.length === 0, mismatches, summary };
}

// ---------------------------------------------------------------------------
// Locating a run's report
// ---------------------------------------------------------------------------
const readJsonIf = (file) => {
  if (!existsSync(file)) return null;
  try { return JSON.parse(readFileSync(file, "utf8")); } catch { return undefined; }
};

/**
 * Finds the report inputs for a run id. `shape` is one of
 *   "token-report"        a report source and its wave exist: auditable
 *   "wave-missing"        a report source exists without its wave: a failure (a report cannot exist without its wave)
 *   "literal-assessment"  only research/model-assessments/<run_id>.md exists: hand-written numbers, NOT auditable
 *   "none"                no report of any shape
 */
export function loadReportInputs(runId, { repoRoot = REPO_ROOT } = {}) {
  const dir = path.join(repoRoot, ...MODEL_BENCHMARK_DIR);
  const mdFile = path.join(dir, "reports", `${runId}.md`);
  const waveFile = path.join(dir, "waves", `${runId}.json`);
  const compiledFile = path.join(dir, "reports", `${runId}.json`);
  const assessment = path.join(repoRoot, "research", "model-assessments", `${runId}.md`);
  if (existsSync(mdFile)) {
    if (!existsSync(waveFile)) return { shape: "wave-missing", mdFile, waveFile };
    const wave = readJsonIf(waveFile);
    const compiled = readJsonIf(compiledFile);
    return { shape: "token-report", mdFile, waveFile, md: readFileSync(mdFile, "utf8"), wave: wave ?? null, waveUnreadable: wave === undefined, compiled: compiled ?? null, compiledUnreadable: compiled === undefined };
  }
  if (existsSync(assessment)) return { shape: "literal-assessment", assessment };
  return { shape: "none" };
}

/** Compact text for a gate detail: the first few mismatches. */
export function describeMismatches(mismatches, n = 4) {
  const shown = mismatches.slice(0, n).map((m) => `[${m.check}${m.line ? ` l.${m.line}` : ""}] ${m.detail.slice(0, 160)}`);
  return `${shown.join(" | ")}${mismatches.length > n ? ` | ... and ${mismatches.length - n} more` : ""}`;
}
