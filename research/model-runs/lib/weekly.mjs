// research/model-runs/lib/weekly.mjs
//
// The weekly-wave machinery (backlog WEEKLY-WAVE, Iteration 103; design: docs/META_REVIEW_2026-10-13_ITER97-101.md
// sections 5 and 6). A wave is generated from a FROZEN protocol (weekly/PROTOCOL.json) plus a subject queue
// (weekly/QUEUE.json), planned and committed before collection, collected by an OS scheduler outside any Claude
// session, and judged and analysed in session.
//
// Everything here is pure or takes its I/O as an argument (git runner, free memory, process spawner, clock), so the
// tests never touch the repo's git state, Ollama or a model. Nothing here publishes, commits, pushes, deploys or
// writes a score. The only git commands the orchestrator may run are read-only (log, status).

import { spawn, spawnSync } from "node:child_process";
import { appendFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, unlinkSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

import { DEFAULT_BANK_PATH, MODEL_RUNS_ROOT, REPO_ROOT, loadBankFile, readJson, refuse, sha256 } from "./common.mjs";
import { buildPlan, countExisting, loadRunConfig, writeJsonAtomic } from "./local-subjects.mjs";
import { parseJudgingConfig } from "./judging-config.mjs";
import { normaliseDigest } from "./ollama.mjs";

export const GIB = 1024 ** 3;
export const DEFAULT_HEADROOM_BYTES = 1.5 * GIB;
export const LOCK_STALE_MS = 12 * 60 * 60 * 1000;
export const UNPINNED = "<unpinned>";
export const DEVIATIONS_HEADING = "## Deviations (append-only, dated)";
export const DEVIATIONS_PLACEHOLDER = "_None yet._";
export const WEEKLY_DIR = path.join(MODEL_RUNS_ROOT, "weekly");
export const PROTOCOL_FILE = path.join(WEEKLY_DIR, "PROTOCOL.json");
export const QUEUE_FILE = path.join(WEEKLY_DIR, "QUEUE.json");
export const WAVE_DIR_PATTERN = /^wave-\d{4}-\d{2}-\d{2}$/;
export const COLLECT_LOCK = path.join("operations", "collect.lock");
export const COLLECT_STATUS = path.join("operations", "collect-status.json");

/** Run-level fields that every wave must carry exactly as the protocol states them. */
export const FIXED_FIELDS = Object.freeze([
  "ollama_host",
  "trials",
  "max_retries",
  "system_message",
  "judges",
  "judges_per_response",
  "max_batch_entries",
  "judge_validity",
  "bank_sha256",
  "bootstrap_replicates",
  "correction",
]);

const NL = String.fromCharCode(10);
const SAFE_NAME = /^[A-Za-z0-9._-]+$/;
const HEX64 = /^[0-9a-f]{64}$/;
const QUEUE_STATUSES = ["queued", "measured", "skipped"];
const SUBJECT_KEYS = ["label", "tag", "digest", "family", "identity_terms", "arm"];

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------
function canonical(v) {
  if (Array.isArray(v)) return v.map(canonical);
  if (v && typeof v === "object") return Object.fromEntries(Object.keys(v).sort().map((k) => [k, canonical(v[k])]));
  return v;
}
/** JSON with sorted keys: equality and hashing that do not depend on key order or whitespace. */
export const canonicalJson = (v) => JSON.stringify(canonical(v));
const same = (a, b) => canonicalJson(a) === canonicalJson(b);
const short = (v) => {
  const s = canonicalJson(v) ?? "undefined";
  return s.length > 90 ? `${s.slice(0, 87)}...` : s;
};
const tick = String.fromCharCode(96);
const code = (s) => `${tick}${s}${tick}`;
const isPosInt = (n) => Number.isInteger(n) && n >= 1;

/** sha256 of the protocol content (sorted keys, no whitespace). Waves record it; a protocol change changes it. */
export const protocolSha256 = (protocol) => sha256(canonicalJson(protocol));

// ---------------------------------------------------------------------------
// Protocol and queue
// ---------------------------------------------------------------------------
export function validateProtocol(p, label = "PROTOCOL.json") {
  const bad = (m) => refuse(`${label}: ${m}`);
  if (!p || typeof p !== "object" || Array.isArray(p)) bad("not an object");
  if (typeof p.protocol_version !== "string" || p.protocol_version.length === 0) bad("protocol_version missing");
  if (!["proposed", "ratified", "retired"].includes(p.status)) bad(`status must be proposed, ratified or retired (got ${JSON.stringify(p.status)})`);
  if (typeof p.rationale !== "string" || p.rationale.length === 0) bad("rationale missing");
  if (typeof p.ollama_host !== "string" || !/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(p.ollama_host)) bad("ollama_host must be a localhost URL (collection never leaves the machine)");
  if (!isPosInt(p.trials)) bad("trials must be a positive integer");
  if (!Number.isInteger(p.max_retries) || p.max_retries < 0) bad("max_retries must be a non-negative integer");
  if (typeof p.system_message !== "string") bad("system_message must be a string");
  if (typeof p.arm !== "string" || !SAFE_NAME.test(p.arm)) bad("arm must be a safe name");
  if (typeof p.bank_sha256 !== "string" || !HEX64.test(p.bank_sha256)) bad("bank_sha256 must be 64 lowercase hex chars");
  if (!Array.isArray(p.judges) || p.judges.length < 2) bad("judges must list at least two judges");
  for (const j of p.judges) if (!j || typeof j.label !== "string" || typeof j.family !== "string") bad("every judge needs a label and a family");
  if (!isPosInt(p.judges_per_response)) bad("judges_per_response must be a positive integer");
  if (!isPosInt(p.max_batch_entries)) bad("max_batch_entries must be a positive integer");
  const v = p.judge_validity;
  if (!v || typeof v.max_unfound_quote_rate_percent !== "number" || !isPosInt(v.short_quote_min_chars)) bad("judge_validity needs max_unfound_quote_rate_percent (number) and short_quote_min_chars (integer)");
  if (!isPosInt(p.bootstrap_replicates)) bad("bootstrap_replicates must be a positive integer");
  if (p.correction !== "bonferroni") bad('correction must be "bonferroni"');
  const r = p.reference;
  if (!r || typeof r.label !== "string" || !SAFE_NAME.test(r.label)) bad("reference.label missing or unsafe");
  if (typeof r.tag !== "string" || r.tag.length === 0) bad("reference.tag missing");
  if (typeof r.digest !== "string" || !HEX64.test(r.digest)) bad("reference.digest must be 64 lowercase hex chars");
  if (typeof r.family !== "string" || r.family.length === 0) bad("reference.family missing");
  if (!Array.isArray(r.identity_terms) || r.identity_terms.length === 0) bad("reference.identity_terms missing");
  if (r.arm !== p.arm) bad("reference.arm must equal the protocol arm (every subject in a wave uses one arm)");
  if (!isPosInt(r.trials)) bad("reference.trials must be a positive integer");
  const a = p.anchor;
  if (!a || typeof a.source_run !== "string" || !SAFE_NAME.test(a.source_run)) bad("anchor.source_run missing");
  if (typeof a.source_key !== "string" || a.source_key.length === 0) bad("anchor.source_key missing");
  if (!isPosInt(a.per_source_subject)) bad("anchor.per_source_subject must be a positive integer");
  if (typeof a.max_mean_abs_difference !== "number" || !(a.max_mean_abs_difference > 0)) bad("anchor.max_mean_abs_difference must be a positive number");
  if (typeof a.rationale !== "string" || a.rationale.length === 0) bad("anchor.rationale missing");
  if (!isPosInt(p.max_new_subjects_per_wave)) bad("max_new_subjects_per_wave must be a positive integer");
  if (typeof p.vram_budget_gb !== "number" || !(p.vram_budget_gb > 0)) bad("vram_budget_gb must be a positive number");
  if (typeof p.max_model_size_gb !== "number" || !(p.max_model_size_gb > 0) || p.max_model_size_gb > p.vram_budget_gb) bad("max_model_size_gb must be positive and not above vram_budget_gb");
  if (!p.comparisons || p.comparisons.kind !== "build") bad('comparisons.kind must be "build"');
  return p;
}

export function loadProtocol(file = PROTOCOL_FILE) {
  return validateProtocol(readJson(file), file);
}

export function validateQueue(q, label = "QUEUE.json") {
  const bad = (m) => refuse(`${label}: ${m}`);
  if (!q || typeof q !== "object" || Array.isArray(q)) bad("not an object");
  if (typeof q.selection_rule !== "string" || q.selection_rule.length === 0) bad("selection_rule missing");
  if (!Array.isArray(q.entries) || q.entries.length === 0) bad("entries must be a non-empty array");
  const tags = new Set();
  for (const [i, e] of q.entries.entries()) {
    const w = `entries[${i}]`;
    if (!e || typeof e.tag !== "string" || e.tag.length === 0) bad(`${w}: tag missing`);
    if (tags.has(e.tag)) bad(`${w}: duplicate tag ${e.tag}`);
    tags.add(e.tag);
    if (typeof e.developer !== "string" || e.developer.length === 0) bad(`${w} (${e.tag}): developer missing`);
    if (typeof e.family !== "string" || e.family.length === 0) bad(`${w} (${e.tag}): family missing`);
    if (!Array.isArray(e.identity_terms) || e.identity_terms.length === 0 || e.identity_terms.some((t) => typeof t !== "string" || t.length === 0)) bad(`${w} (${e.tag}): identity_terms must be a non-empty list of strings`);
    if (typeof e.approx_size_gb !== "number" || !(e.approx_size_gb > 0)) bad(`${w} (${e.tag}): approx_size_gb must be a positive number`);
    if (!QUEUE_STATUSES.includes(e.status)) bad(`${w} (${e.tag}): status must be one of ${QUEUE_STATUSES.join(", ")}`);
    if (typeof e.note !== "string") bad(`${w} (${e.tag}): note must be a string`);
  }
  return q;
}

export function loadQueue(file = QUEUE_FILE) {
  return validateQueue(readJson(file), file);
}

/** Developers that already have an entry with status "measured". */
export function measuredDevelopersOf(queue) {
  return [...new Set(queue.entries.filter((e) => e.status === "measured").map((e) => e.developer))].sort();
}

/**
 * Deterministic pick. Eligible: status "queued", approx size within the protocol limit, and not the reference build.
 * Order: developers with no measured build first, then queue order. At most max_new_subjects_per_wave.
 */
export function selectSubjects(queue, protocol, measuredDevelopers = measuredDevelopersOf(queue)) {
  const measured = new Set(measuredDevelopers);
  const eligible = queue.entries
    .map((entry, index) => ({ entry, index }))
    .filter(({ entry }) => entry.status === "queued" && entry.approx_size_gb <= protocol.max_model_size_gb && entry.tag !== protocol.reference.tag);
  eligible.sort((a, b) => Number(measured.has(a.entry.developer)) - Number(measured.has(b.entry.developer)) || a.index - b.index);
  return eligible.slice(0, protocol.max_new_subjects_per_wave).map(({ entry, index }) => ({
    ...entry,
    queue_position: index + 1,
    developer_has_measured_build: measured.has(entry.developer),
  }));
}

/** Subject label for a queue tag: the tag, lower-cased, ":latest" dropped, ":" to "-", plus the arm. */
export function labelForTag(tag, arm) {
  const base = String(tag)
    .toLowerCase()
    .replace(/:latest$/, "")
    .replace(/:/g, "-")
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${base}-${arm}`;
}

/** The generated comparison set: each new subject against the reference, then each pair of new subjects. */
export function expectedComparisons(referenceLabel, newLabels) {
  const out = newLabels.map((b) => ({ a: referenceLabel, b, kind: "build" }));
  for (let i = 0; i < newLabels.length; i += 1) {
    for (let j = i + 1; j < newLabels.length; j += 1) out.push({ a: newLabels[i], b: newLabels[j], kind: "build" });
  }
  return out;
}

export function validateDate(date) {
  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) refuse(`--date must be YYYY-MM-DD (got ${JSON.stringify(date)})`);
  const d = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== date) refuse(`--date ${date} is not a real calendar date`);
  return date;
}

/** Plan gate: only a ratified protocol is usable; --allow-proposed is a dry-run-only convenience. */
export function assertPlanAllowed(protocol, { dryRun = false, allowProposed = false } = {}) {
  if (allowProposed && !dryRun) refuse("--allow-proposed is only allowed together with --dry-run");
  if (protocol.status === "ratified") return;
  if (protocol.status === "proposed" && dryRun && allowProposed) return;
  refuse(
    `PROTOCOL.json status is "${protocol.status}", not "ratified". The founder must ratify it (set status to "ratified" and commit) before a real plan.` +
      (protocol.status === "proposed" ? " For a preview use: plan --date <date> --dry-run --allow-proposed" : "")
  );
}

// ---------------------------------------------------------------------------
// Pins from the local Ollama /api/tags listing
// ---------------------------------------------------------------------------
export function findOllamaModel(models, tag) {
  const names = tag.includes(":") ? [tag] : [tag, `${tag}:latest`];
  return models.find((m) => m && (names.includes(m.name) || names.includes(m.model))) ?? null;
}

/**
 * Digest and size for each pick and the reference, from a /api/tags `models` array. Returns the pins and the
 * problems (missing tags, digest mismatch on the reference, over-size builds); the caller decides what to do.
 */
export function resolvePins({ models, protocol, picks }) {
  const pins = {};
  const missing = [];
  const problems = [];
  const read = (tag) => {
    const m = findOllamaModel(models, tag);
    if (!m) { missing.push(tag); return null; }
    return { digest: normaliseDigest(m.digest), size_bytes: Number(m.size) };
  };
  for (const pick of picks) {
    const r = read(pick.tag);
    if (!r) continue;
    if (!HEX64.test(r.digest)) problems.push(`${pick.tag}: Ollama reports no usable digest`);
    if (!Number.isFinite(r.size_bytes) || r.size_bytes <= 0) problems.push(`${pick.tag}: Ollama reports no size`);
    else if (r.size_bytes / 1e9 > protocol.max_model_size_gb) {
      problems.push(`${pick.tag}: real size ${(r.size_bytes / 1e9).toFixed(2)} GB is above max_model_size_gb ${protocol.max_model_size_gb}`);
    }
    pins[pick.tag] = r;
  }
  const ref = read(protocol.reference.tag);
  if (ref) {
    if (ref.digest !== protocol.reference.digest) {
      problems.push(`${protocol.reference.tag}: local digest ${ref.digest} differs from the protocol's pinned reference digest ${protocol.reference.digest}`);
    }
    pins[protocol.reference.tag] = ref;
  }
  return { pins, missing, problems };
}

/** Number of subjects in the anchor's source routing key (the bridge draws per_source_subject from each). */
export function anchorSourceSubjectCount(protocol, modelRunsRoot = MODEL_RUNS_ROOT) {
  const key = readJson(path.join(modelRunsRoot, protocol.anchor.source_run, protocol.anchor.source_key));
  if (!Array.isArray(key.subjects) || key.subjects.length === 0) refuse(`${protocol.anchor.source_key} lists no subjects`);
  return key.subjects.length;
}

// ---------------------------------------------------------------------------
// Wave config
// ---------------------------------------------------------------------------
/**
 * @param {object} p
 * @param {object} p.protocol
 * @param {object[]} p.picks     from selectSubjects
 * @param {string} p.date        YYYY-MM-DD
 * @param {{models: Record<string,{digest:string,size_bytes:number|null}>, anchorSourceSubjects: number, writtenAt?: string}} p.pins
 */
export function buildWaveConfig({ protocol, picks, date, pins }) {
  validateDate(date);
  if (!Array.isArray(picks) || picks.length === 0) refuse("a wave needs at least one new subject");
  if (picks.length > protocol.max_new_subjects_per_wave) refuse(`${picks.length} picks exceed max_new_subjects_per_wave ${protocol.max_new_subjects_per_wave}`);
  if (!pins || !pins.models) refuse("pins.models is required");
  if (!isPosInt(pins.anchorSourceSubjects)) refuse("pins.anchorSourceSubjects (the number of subjects in the anchor's source run) is required");
  const masterSeed = Number(date.replaceAll("-", ""));
  const arm = protocol.arm;
  const ref = protocol.reference;

  const newSubjects = picks.map((pick) => {
    const pin = pins.models[pick.tag];
    if (!pin || typeof pin.digest !== "string") refuse(`no pin for ${pick.tag}`);
    return {
      label: labelForTag(pick.tag, arm),
      tag: pick.tag,
      digest: pin.digest,
      family: pick.family,
      identity_terms: [...pick.identity_terms],
      arm,
    };
  });
  const labels = [ref.label, ...newSubjects.map((s) => s.label)];
  if (new Set(labels).size !== labels.length) refuse(`subject labels collide: ${labels.join(", ")}`);

  const referenceSubject = {
    label: ref.label,
    tag: ref.tag,
    digest: ref.digest,
    family: ref.family,
    identity_terms: [...ref.identity_terms],
    arm: ref.arm,
    trials: ref.trials,
  };
  const refPin = pins.models[ref.tag];
  const config = {
    run_id: `wave-${date}`,
    comment: `Generated by research/model-runs/bin/weekly-wave.mjs from weekly/PROTOCOL.json (${protocol.protocol_version}) and weekly/QUEUE.json. Do not edit: weekly-wave check and collect refuse any difference from the protocol.`,
    ollama_host: protocol.ollama_host,
    trials: protocol.trials,
    max_retries: protocol.max_retries,
    master_seed: masterSeed,
    system_message: protocol.system_message,
    subjects: [referenceSubject, ...newSubjects],
    comparisons: expectedComparisons(ref.label, newSubjects.map((s) => s.label)),
    judging_comment: "Judging-stage parameters are the protocol's. Subjects and judges are disjoint sets and no judge shares a family with a subject.",
    judges: protocol.judges.map((j) => ({ ...j })),
    judges_per_response: protocol.judges_per_response,
    max_batch_entries: protocol.max_batch_entries,
    judge_validity: { ...protocol.judge_validity },
    bootstrap_replicates: protocol.bootstrap_replicates,
    correction: protocol.correction,
    bank_sha256: protocol.bank_sha256,
    bridge: {
      source_run: protocol.anchor.source_run,
      source_key: protocol.anchor.source_key,
      seed: masterSeed,
      per_source_subject: protocol.anchor.per_source_subject,
      total: protocol.anchor.per_source_subject * pins.anchorSourceSubjects,
    },
    weekly: {
      protocol_version: protocol.protocol_version,
      protocol_sha256: protocolSha256(protocol),
      reference_label: ref.label,
      picks: picks.map((pick, i) => ({
        tag: pick.tag,
        label: newSubjects[i].label,
        developer: pick.developer,
        family: pick.family,
        approx_size_gb: pick.approx_size_gb,
        queue_position: pick.queue_position,
        developer_has_measured_build: pick.developer_has_measured_build === true,
      })),
      pins: [
        { label: ref.label, tag: ref.tag, digest: ref.digest, size_bytes: refPin?.size_bytes ?? null },
        ...newSubjects.map((s) => ({ label: s.label, tag: s.tag, digest: s.digest, size_bytes: pins.models[s.tag].size_bytes ?? null })),
      ],
    },
  };
  const text = renderPreregistration(config, protocol);
  config.preregistration = {
    file: "PREREGISTRATION.md",
    as_written_sha256: asWrittenSha256(text),
    as_written_at: pins.writtenAt ?? new Date().toISOString().replace(/\.\d+Z$/, "Z"),
    deviations_placeholder: DEVIATIONS_PLACEHOLDER,
    committed_before_data: true,
    note: "Hash of the plan as written. weekly-wave collect refuses to start unless PREREGISTRATION.md and run-config.json are committed and unmodified, so the commit time attests that the plan came before the data.",
  };
  return config;
}

/** Writes the config to a scratch file and runs the existing loadRunConfig, parseJudgingConfig and (with a bank) buildPlan. */
export function validateWaveConfig(config, { bank } = {}) {
  const dir = mkdtempSync(path.join(os.tmpdir(), "weekly-config-"));
  try {
    const file = path.join(dir, "run-config.json");
    writeFileSync(file, `${JSON.stringify(config, null, 2)}${NL}`, "utf8");
    const loaded = loadRunConfig(file);
    parseJudgingConfig(loaded, file);
    const plan = bank ? buildPlan({ bank, config: loaded }) : null;
    return { config: loaded, plan };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

// ---------------------------------------------------------------------------
// Pre-registration
// ---------------------------------------------------------------------------
/**
 * The hash of the plan as written, computed the way tests/preregistration-integrity.test.mjs does: everything above
 * the Deviations heading, the heading, a blank line, the recorded placeholder and a newline.
 */
export function asWrittenSha256(text, placeholder = DEVIATIONS_PLACEHOLDER) {
  const i = text.indexOf(DEVIATIONS_HEADING);
  if (i < 0) refuse(`no "${DEVIATIONS_HEADING}" heading`);
  return sha256(text.slice(0, i) + DEVIATIONS_HEADING + NL + NL + placeholder + NL);
}

/** The same integrity checks as tests/preregistration-integrity.test.mjs, for a wave's own files. */
export function checkPreregistration(text, cfg) {
  const problems = [];
  if (text.includes(String.fromCharCode(13))) problems.push("contains CR characters; the hash is defined over LF text");
  const i = text.indexOf(DEVIATIONS_HEADING);
  if (i < 0) return [`no "${DEVIATIONS_HEADING}" heading`];
  const sha = asWrittenSha256(text, cfg.deviations_placeholder);
  if (sha !== cfg.as_written_sha256) problems.push(`plan text above the Deviations heading changed: ${sha} != ${cfg.as_written_sha256}`);
  const tail = text.slice(i + DEVIATIONS_HEADING.length);
  const ids = [...tail.matchAll(/^- \*\*(\d{4}-\d{2}-\d{2}), D(\d+)\b/gm)].map((m) => Number(m[2]));
  const placeholderStill = tail.includes(cfg.deviations_placeholder);
  if (ids.length === 0 && !placeholderStill) problems.push("Deviations section has neither entries nor the placeholder");
  if (ids.length > 0 && placeholderStill) problems.push("placeholder left in place alongside deviations");
  ids.forEach((n, k) => { if (n !== k + 1) problems.push(`deviation numbering broken at position ${k + 1}: D${n}`); });
  return problems;
}

const fmtGb = (bytes) => (typeof bytes === "number" && bytes > 0 ? `${(bytes / 1e9).toFixed(2)} GB` : "not pinned");

/** Deterministic Markdown in pilot-2026-10-03's section structure. Does not read config.preregistration. */
export function renderPreregistration(config, protocol) {
  const ref = protocol.reference;
  const subjects = config.subjects;
  const newSubjects = subjects.filter((s) => s.label !== ref.label);
  const pinBy = new Map((config.weekly?.pins ?? []).map((p) => [p.label, p]));
  const cmps = config.comparisons ?? [];
  const k = cmps.length;
  const level = k > 0 ? (100 * (1 - 0.05 / k)).toFixed(2) : "95.00";
  const L = [];
  const add = (...lines) => L.push(...lines);

  add(
    `# Pre-registration: ${config.run_id} (weekly protocol ${config.weekly.protocol_version}: ${newSubjects.length} new open-weight build${newSubjects.length === 1 ? "" : "s"} plus the reference)`,
    "",
    `Generated by ${code("research/model-runs/bin/weekly-wave.mjs")} from ${code("research/model-runs/weekly/PROTOCOL.json")} (protocol ${config.weekly.protocol_version}, content sha256 ${code(config.weekly.protocol_sha256)}) and ${code("research/model-runs/weekly/QUEUE.json")}, **before any subject reply exists for this run**. ` +
      `Nothing in this plan was chosen by hand: every fixed value is the protocol's, and the new subjects are the queue's deterministic picks. ` +
      `${code("weekly-wave collect")} refuses to start unless this file and ${code("run-config.json")} are committed and unmodified, so the git commit time attests the order. ` +
      `Departures after data exists are appended below as dated deviations, never edited into the plan (${code("research/model-runs/tests/preregistration-integrity.test.mjs")}).`,
    "",
    `Status: **unofficial pilot** under D-29a (ranges and separation only, never rankings). The founder ratified the protocol (${code("status: ratified")} in ${code("PROTOCOL.json")}); committing this plan is the founder's approval of this wave.`,
    "",
    "## 1. Questions",
    "",
    `1. **Primary (arm ${protocol.arm}).** On the published bank, served by default, how does the composite of each new build compare with the reference build ${code(ref.label)}, and how do the new builds compare with each other? ` +
      `For each of the ${k} comparison${k === 1 ? "" : "s"} listed in section 8, "separated" means the 95% item-resampling interval of the paired composite difference excludes zero. ` +
      `Results are reported both uncorrected and under Bonferroni over ${k} comparison${k === 1 ? "" : "s"} (${level}% intervals). Neither is promoted after the fact.`,
    `2. **Instrument stability (descriptive).**`,
    `   - The reference build is the same digest-pinned build every week. Its composite and interval are reported beside the earlier weeks' reference composites. A move points at the judging or the host, not at the model.`,
    `   - The anchor drift (section 6) is reported with the verdict "comparable" or "not comparable" against the protocol threshold of ${protocol.anchor.max_mean_abs_difference.toFixed(2)}.`,
    `3. **Instrument checks (descriptive):** judge agreement, quote grounding per judge, and the contamination result per build through the MCP server.`,
    "",
    `**Not asked:** a ranking, a comparison with any model outside this wave except through the reference series, or a comparison with the Claude subjects of the first pilot.`,
    "",
    "## 2. Subjects (pinned)",
    "",
    "| Build label | Ollama tag | Digest (sha256) | Role | Trials per item | Family | Size on disk (Ollama) |",
    "|---|---|---|---|---|---|---|"
  );
  for (const s of subjects) {
    const isRef = s.label === ref.label;
    const trials = s.trials ?? config.trials;
    add(`| ${code(s.label)} | ${code(s.tag)} | ${code(s.digest)} | ${isRef ? "reference (re-run every week)" : "new subject"} | ${trials} | ${s.family} | ${fmtGb(pinBy.get(s.label)?.size_bytes)} |`);
  }
  add(
    "",
    `**Runtime:** Ollama on the founder's workstation (${protocol.vram_budget_gb} GB of GPU memory; a build above ${protocol.max_model_size_gb} GB is not eligible). Builds are Ollama library builds pinned by digest, and results describe these builds only. The digest is read from the local Ollama when the plan is made, and the runner refuses to call a model whose live digest differs.`,
    "",
    `**System message (every subject, arm ${protocol.arm}, verbatim):** ${code(protocol.system_message)}`,
    "",
    `- Every subject in a wave uses arm ${protocol.arm}. The new subjects run ${config.trials} trials per item; the reference runs ${ref.trials}.`,
    `- How each build receives the message depends on its own template. That difference is the build's format and is disclosed, not controlled.`,
    "",
    "**New subjects, with why they were picked** (queue rule: size within the limit, developers with no measured build first, then queue order):",
    ""
  );
  for (const pick of config.weekly.picks) {
    add(`- ${code(pick.label)}: ${pick.developer}, queue position ${pick.queue_position}, ${pick.developer_has_measured_build ? "developer already has a measured build" : "developer has no measured build"}, approx ${pick.approx_size_gb} GB.`);
  }
  add(
    "",
    "**Sampling:**",
    "- Modelfile defaults, plus a fixed seed per (subject, item, trial) taken from the harness's " + code("deriveSeed") + ".",
    "- Retries use seed + attempt.",
    "- The realised options are recorded with every reply.",
    "",
    "## 3. Answering protocol",
    "",
    "As in pilot-2026-10-03:",
    "- the default served set (the 5 crisis-adjacent items are **not served**);",
    `- the bank is pinned by sha256 ${code(config.bank_sha256)}; the plan was refused if the bank on disk differs;`,
    "- each item is its own fresh conversation: the system message, then one user turn holding the prompt text only;",
    "- the leak check runs on every outgoing user message and on every saved reply;",
    `- up to ${config.max_retries} retries, after which a trial is failed, recorded and never imputed;`,
    "- replies are stored verbatim;",
    "- calls are grouped by build, to avoid model swaps on the GPU;",
    `- collection is done by ${code("weekly-wave collect")} under an OS scheduler, Ollama only, outside any Claude session.`,
    "",
    "## 4. Judging",
    "",
    "As in pilot-2026-10-03:",
    `- **Judges:** ${config.judges.map((j) => code(j.label)).join(", ")}. Each reply is rated by ${config.judges_per_response} of them, with pairs balanced across subjects and items. No judge shares a family with a subject.`,
    "- **Blinding:** responses are anonymised. Judges never see the system message, the arm or the build.",
    `- **Batches:** at most ${config.max_batch_entries} entries. A batch over 70,000 bytes is delivered as two halves using the harness tool. A batch returned incomplete twice is re-delivered as halves.`,
    "- **Call gate:** each call must use exactly 2 tool calls. Anything else is voided, kept and re-run.",
    "- **Ratings:** each rating requires the matched anchor and a verbatim quote of at least 3 words.",
    "",
    "## 5. Judge validity rule (unchanged)",
    "",
    `- A judge whose unfound-quote rate exceeds **${config.judge_validity.max_unfound_quote_rate_percent.toFixed(1)}%** is excluded and rerouted.`,
    `- Quotes shorter than ${config.judge_validity.short_quote_min_chars} characters go to the supplement round.`,
    "- The rate is measured on the original answers and again after the short-quote requote round. **The original-answer figure is the primary one.**",
    "- If two judges are excluded, only instrument findings are reported.",
    "",
    "## 6. Bridge sample (the cross-wave anchor)",
    "",
    `- **${config.bridge.total} replies from ${config.bridge.source_run}**, ${config.bridge.per_source_subject} per source subject, drawn with seed ${config.bridge.seed} from ${code(config.bridge.source_key)}. Each is routed to the judges of this run that rated it originally.`,
    "- Reported: the mean and maximum absolute rating difference, overall and per judge.",
    `- **Anchor verdict.** If the overall mean absolute difference is above **${protocol.anchor.max_mean_abs_difference.toFixed(2)}** the wave is marked "not comparable" with earlier waves; at or below it, "comparable". The threshold is the protocol's (about twice the 0.146 observed in pilot-2026-10-03).`,
    "- Bridge ratings never enter a composite.",
    "",
    "## 7. Contamination through the MCP server",
    "",
    "- **Once per build.** The probe is about what the build has seen, not the system message.",
    "- It goes through the real cb-probe stdio protocol, and both checks are required, as cb-probe enforces.",
    "- cb-probe refuses a scored run with fewer than 3 trials per item. A new subject has " + config.trials + " trials x " + config.judges_per_response + " judges = " + config.trials * config.judges_per_response + " and reaches the floor; the reference has " + ref.trials + " trial x " + config.judges_per_response + " judges = " + ref.trials * config.judges_per_response + " and does not.",
    "  - So the reference gets no server " + code("SelfRunScorecard") + ". Its composite is computed in the analysis from the same rating rows with the same canonical function, and no probe is claimed for it in this wave.",
    "- An unparseable identification answer is re-asked twice. After that the probe is incomplete, and it is reported as such.",
    "",
    "## 8. Analysis",
    "",
    "- **Composite:** only via " + code("computeCompositeFromDimensions") + ".",
    `- **Intervals:** item-resampling bootstrap, B = ${config.bootstrap_replicates}, seed ${config.master_seed}.`,
    `- **Correction:** ${config.correction} over the ${k} comparison${k === 1 ? "" : "s"} below.`,
    "- **Comparisons**, all declared now (composite difference a minus b, paired):"
  );
  for (const c of cmps) add(`  - ${code(c.a)} vs ${code(c.b)} (${c.kind})`);
  add(
    "- **Dimensions:** dimension-level differences are exploratory and are not part of this plan's tests.",
    "- **Length:** reported per subject, with the same length-versus-rating view as before.",
    "",
    "**Required disclosures with any public statement:**",
    "- These are 4-bit library builds.",
    "- All judges are Claude models rating models from other developers.",
    "- The judge model family drafted parts of the bank.",
    "- The system message is identical, but its template placement differs by build.",
    "- Crisis items were not served.",
    "- The reference has one trial per item.",
    "- No comparison is made with the Claude subjects of the first pilot.",
    "",
    "## 9. Stopping and failure rules",
    "",
    "- **Failed trials:** a subject with more than 10% failed trials is an instrument failure, and no composite is published for it.",
    "- **Leak check:** a hit on an outgoing message stops the run.",
    `- **Memory:** ${code("weekly-wave collect")} checks free memory against the largest pinned model before it starts, and defers (exit 5) rather than risk a host stop.`,
    "- **Reference pin:** if the local reference digest differs from the protocol's, no plan is made.",
    `- **Anchor:** an anchor mean absolute difference above ${protocol.anchor.max_mean_abs_difference.toFixed(2)} marks the wave "not comparable"; it is reported, not corrected.`,
    "",
    DEVIATIONS_HEADING,
    "",
    DEVIATIONS_PLACEHOLDER,
    ""
  );
  return L.join(NL);
}

// ---------------------------------------------------------------------------
// Conformance
// ---------------------------------------------------------------------------
/**
 * Problems (strings) where a wave's run-config departs from the frozen protocol. An empty list is a pass.
 * `opts.queue`, when given, also requires every new subject's tag to be a queue entry.
 */
export function checkConformance(runConfig, protocol, { queue } = {}) {
  const c = runConfig ?? {};
  const out = [];
  for (const f of FIXED_FIELDS) {
    if (!same(c[f], protocol[f])) out.push(`${f} differs from the protocol: run-config ${short(c[f])} vs protocol ${short(protocol[f])}`);
  }

  const w = c.weekly;
  if (!w || typeof w !== "object") out.push("no weekly block: this run-config was not generated by weekly-wave plan");
  else {
    if (w.protocol_version !== protocol.protocol_version) out.push(`weekly.protocol_version ${short(w.protocol_version)} differs from the protocol's ${short(protocol.protocol_version)}`);
    if (w.protocol_sha256 !== protocolSha256(protocol)) out.push("weekly.protocol_sha256 differs from the current protocol content: the protocol changed after this wave was planned");
  }
  if (typeof c.run_id !== "string" || !WAVE_DIR_PATTERN.test(c.run_id)) out.push(`run_id ${short(c.run_id)} is not wave-YYYY-MM-DD`);
  else if (c.master_seed !== Number(c.run_id.slice(5).replaceAll("-", ""))) out.push(`master_seed ${short(c.master_seed)} is not the date of ${c.run_id}`);

  const subs = Array.isArray(c.subjects) ? c.subjects : [];
  const ref = protocol.reference;
  const expectedRef = { label: ref.label, tag: ref.tag, digest: ref.digest, family: ref.family, identity_terms: ref.identity_terms, arm: ref.arm, trials: ref.trials };
  const refs = subs.filter((s) => s && s.label === ref.label);
  if (refs.length !== 1) out.push(`the reference subject ${ref.label} must appear exactly once (found ${refs.length})`);
  else if (!same(refs[0], expectedRef)) out.push(`the reference has changed: ${short(refs[0])} vs protocol ${short(expectedRef)}`);

  const news = subs.filter((s) => s && s.label !== ref.label);
  if (news.length < 1) out.push("a wave needs at least one new subject");
  if (news.length > protocol.max_new_subjects_per_wave) out.push(`${news.length} new subjects exceed max_new_subjects_per_wave ${protocol.max_new_subjects_per_wave}`);
  const pickTags = new Set(Array.isArray(w?.picks) ? w.picks.map((p) => p.tag) : []);
  const queueTags = queue ? new Set(queue.entries.map((e) => e.tag)) : null;
  for (const s of news) {
    if (!pickTags.has(s.tag)) out.push(`subject ${s.label} (tag ${s.tag}) is neither the reference nor a recorded queue pick`);
    if (queueTags && !queueTags.has(s.tag)) out.push(`subject ${s.label} (tag ${s.tag}) is not in QUEUE.json`);
    if (s.tag === ref.tag) out.push(`subject ${s.label} is the reference build under another label`);
    if (s.arm !== protocol.arm) out.push(`subject ${s.label} has arm ${short(s.arm)}; every subject must use arm ${protocol.arm}`);
    if (Object.prototype.hasOwnProperty.call(s, "trials")) out.push(`subject ${s.label} overrides trials (${short(s.trials)}); new subjects use the protocol's ${protocol.trials}`);
    if (Object.prototype.hasOwnProperty.call(s, "system_message")) out.push(`subject ${s.label} overrides the system message`);
    const extra = Object.keys(s).filter((k) => !SUBJECT_KEYS.includes(k));
    if (extra.length > 0) out.push(`subject ${s.label} carries fields outside the protocol shape: ${extra.join(", ")}`);
    if (s.label !== labelForTag(s.tag, protocol.arm)) out.push(`subject ${s.label} does not have the derived label ${labelForTag(s.tag, protocol.arm)}`);
  }
  const subjectTags = new Set(news.map((s) => s.tag));
  for (const t of pickTags) if (!subjectTags.has(t)) out.push(`weekly.picks lists ${t} but no subject carries it`);

  const exp = expectedComparisons(ref.label, news.map((s) => s.label)).map(canonicalJson).sort();
  const got = (Array.isArray(c.comparisons) ? c.comparisons : []).map(canonicalJson).sort();
  if (!same(exp, got)) {
    const extraC = got.filter((x) => !exp.includes(x));
    const missingC = exp.filter((x) => !got.includes(x));
    out.push(`comparisons are not exactly the generated set: ${extraC.length} unexpected${extraC.length ? ` (${extraC.join(" ")})` : ""}, ${missingC.length} missing${missingC.length ? ` (${missingC.join(" ")})` : ""}`);
  }

  const b = c.bridge ?? {};
  const a = protocol.anchor;
  if (b.source_run !== a.source_run) out.push(`bridge.source_run ${short(b.source_run)} differs from the anchor's ${short(a.source_run)}`);
  if (b.source_key !== a.source_key) out.push(`bridge.source_key ${short(b.source_key)} differs from the anchor's ${short(a.source_key)}`);
  if (b.per_source_subject !== a.per_source_subject) out.push(`bridge.per_source_subject ${short(b.per_source_subject)} differs from the anchor's ${a.per_source_subject}`);
  if (b.seed !== c.master_seed) out.push(`bridge.seed ${short(b.seed)} is not the master_seed ${short(c.master_seed)}`);
  if (!isPosInt(b.total) || b.total % a.per_source_subject !== 0) out.push(`bridge.total ${short(b.total)} is not a positive multiple of per_source_subject ${a.per_source_subject}`);
  return out;
}

// ---------------------------------------------------------------------------
// Anchor verdict and memory preflight
// ---------------------------------------------------------------------------
/** `bridgeDrift` is analysis.json `bridge_drift` (mean_abs_difference) or the library's {overall: {mean_abs_difference}}. */
export function anchorVerdict(bridgeDrift, protocol) {
  const threshold = protocol.anchor.max_mean_abs_difference;
  const raw = bridgeDrift?.mean_abs_difference ?? bridgeDrift?.overall?.mean_abs_difference;
  const mean = typeof raw === "number" && Number.isFinite(raw) ? raw : null;
  return { comparable: mean !== null && mean <= threshold, mean_abs_difference: mean, threshold };
}

export function memoryPreflight({ freeBytes, modelSizeBytes, headroomBytes = DEFAULT_HEADROOM_BYTES }) {
  const needed = modelSizeBytes + headroomBytes;
  const ok = Number.isFinite(freeBytes) && freeBytes >= needed;
  const gib = (n) => (n / GIB).toFixed(2);
  return {
    ok,
    freeBytes,
    modelSizeBytes,
    headroomBytes,
    neededBytes: needed,
    message: ok
      ? `free memory ${gib(freeBytes)} GiB covers the largest model ${gib(modelSizeBytes)} GiB plus ${gib(headroomBytes)} GiB headroom`
      : `free memory ${Number.isFinite(freeBytes) ? gib(freeBytes) : "unknown"} GiB is below the ${gib(needed)} GiB needed (largest model ${gib(modelSizeBytes)} GiB plus ${gib(headroomBytes)} GiB headroom)`,
  };
}

// ---------------------------------------------------------------------------
// Lock
// ---------------------------------------------------------------------------
export class LockedError extends Error {
  constructor(message, holder) {
    super(message);
    this.holder = holder;
  }
}

/**
 * Exclusive lock file. A lock older than staleMs (default 12 h) is stale and is taken over, with a warning.
 * Throws LockedError when a fresh lock is held.
 */
export function acquireLock(lockFile, { now = () => new Date(), pid = process.pid, host = os.hostname(), staleMs = LOCK_STALE_MS, warn = () => {} } = {}) {
  mkdirSync(path.dirname(lockFile), { recursive: true });
  const body = () => `${JSON.stringify({ pid, acquired_at: now().toISOString(), host })}${NL}`;
  const create = () => writeFileSync(lockFile, body(), { flag: "wx" });
  try {
    create();
    return { file: lockFile, pid };
  } catch (e) {
    if (!e || e.code !== "EEXIST") throw e;
  }
  let holder = null;
  try { holder = JSON.parse(readFileSync(lockFile, "utf8")); } catch { holder = null; }
  const at = holder && Date.parse(holder.acquired_at);
  const ageMs = Number.isFinite(at) ? now().getTime() - at : now().getTime() - statSync(lockFile).mtimeMs;
  if (ageMs <= staleMs) {
    throw new LockedError(
      `collect is locked by pid ${holder?.pid ?? "?"} on ${holder?.host ?? "?"} since ${holder?.acquired_at ?? "an unreadable time"} (${lockFile})`,
      holder
    );
  }
  warn(`WARNING: taking over a stale lock (${(ageMs / 3600000).toFixed(1)} h old, pid ${holder?.pid ?? "?"} on ${holder?.host ?? "?"}) at ${lockFile}`);
  try { unlinkSync(lockFile); } catch { /* another process may have removed it */ }
  try {
    create();
  } catch (e) {
    if (e && e.code === "EEXIST") throw new LockedError(`lost a race for the stale lock at ${lockFile}`, null);
    throw e;
  }
  return { file: lockFile, pid, tookOverStale: true };
}

/** Removes the lock only if this pid holds it. Returns true when removed. */
export function releaseLock(lockFile, { pid = process.pid } = {}) {
  if (!existsSync(lockFile)) return false;
  let holder = null;
  try { holder = JSON.parse(readFileSync(lockFile, "utf8")); } catch { holder = null; }
  if (holder && holder.pid !== pid) return false;
  unlinkSync(lockFile);
  return true;
}

// ---------------------------------------------------------------------------
// Git (read-only) and phase
// ---------------------------------------------------------------------------
/** A runner for read-only git commands: (args) => { status, stdout }. */
export function makeRunGit(cwd = REPO_ROOT) {
  return (args) => {
    const r = spawnSync("git", args, { cwd, encoding: "utf8", timeout: 60000, windowsHide: true });
    return { status: r.status, stdout: r.stdout ?? "", stderr: r.stderr ?? "" };
  };
}

/**
 * The plan came before the data: each file has a commit (git log -1 --format=%H -- <file> is non-empty) and no
 * working-tree change (git status --porcelain -- <file> is empty). Only read-only git commands are run.
 */
export function planCommitState({ runGit, files }) {
  const problems = [];
  for (const f of files) {
    const log = runGit(["log", "-1", "--format=%H", "--", f]);
    if (log.status !== 0) { problems.push(`${f}: git log failed`); continue; }
    if (log.stdout.trim() === "") { problems.push(`${f}: not committed`); continue; }
    const st = runGit(["status", "--porcelain", "--", f]);
    if (st.status !== 0) { problems.push(`${f}: git status failed`); continue; }
    if (st.stdout.trim() !== "") problems.push(`${f}: modified or untracked since the commit`);
  }
  return { committed: problems.length === 0, problems };
}

export const PHASES = Object.freeze(["planned-uncommitted", "planned", "collecting", "collect-failed", "collect-deferred", "collected", "judging", "analysed"]);

export function readCollectStatus(waveDir) {
  const file = path.join(waveDir, COLLECT_STATUS);
  if (!existsSync(file)) return null;
  try { return JSON.parse(readFileSync(file, "utf8")); } catch { return { state: "failed", message: "collect-status.json is unreadable" }; }
}

/** `gitInfo.committed` says whether the plan files are committed and unmodified (see planCommitState). */
export function wavePhase(waveDir, gitInfo = {}) {
  if (!existsSync(path.join(waveDir, "run-config.json"))) refuse(`${waveDir} has no run-config.json: not a wave directory`);
  if (existsSync(path.join(waveDir, "analysis.json"))) return "analysed";
  const batches = path.join(waveDir, "judge-batches");
  if (existsSync(path.join(waveDir, "keys", "judge-key.json")) || (existsSync(batches) && readdirSync(batches).length > 0)) return "judging";
  const status = readCollectStatus(waveDir);
  if (status) {
    if (status.state === "collected") return "collected";
    if (status.state === "deferred-low-memory") return "collect-deferred";
    if (status.state === "failed") return "collect-failed";
    if (status.state === "running" || status.state === "partial") {
      // A "running" status with no lock means the process died without finishing: that is a failure, not progress.
      if (status.state === "running" && !existsSync(path.join(waveDir, COLLECT_LOCK))) return "collect-failed";
      return "collecting";
    }
  }
  return gitInfo.committed === true ? "planned" : "planned-uncommitted";
}

const NEXT_ACTIONS = Object.freeze({
  "planned-uncommitted": "Founder: review and approve committing the plan (the exact git add pathspec was printed by plan). Collection refuses until it is committed.",
  planned: "Wait for the scheduled collect (daily 02:00), or run: node research/model-runs/bin/weekly-wave.mjs collect --latest",
  collecting: "Collection is in progress or partial. The scheduled collect resumes it; do not start another.",
  "collect-failed": "Read operations/collect-status.json and operations/collect.log, fix the cause, then run collect --latest again (use run-local-subjects.mjs --retry-failed by hand only with founder approval).",
  "collect-deferred": "Free memory was too low. Close other programs; the next scheduled collect retries. Or run collect --latest when memory is free.",
  collected: "Judge in session: follow .claude/commands/weekly-model-wave.md step 3 (build-judge-batches first).",
  judging: "Continue the judging and analysis steps of .claude/commands/weekly-model-wave.md (step 3).",
  analysed: "Write the founder approval packet (step 4 of .claude/commands/weekly-model-wave.md). Nothing is published without approval.",
});
export const nextAction = (phase) => NEXT_ACTIONS[phase] ?? "unknown phase";

export function listWaveDirs(root = MODEL_RUNS_ROOT) {
  if (!existsSync(root)) return [];
  return readdirSync(root, { withFileTypes: true })
    .filter((d) => d.isDirectory() && WAVE_DIR_PATTERN.test(d.name))
    .map((d) => d.name)
    .sort();
}

// ---------------------------------------------------------------------------
// Collect
// ---------------------------------------------------------------------------
export const EXIT = Object.freeze({ OK: 0, REFUSED: 1, FAILED: 3, LOCKED: 4, DEFERRED: 5 });

/** Largest pinned model, in bytes: pinned sizes, else the picks' approximate sizes, else the protocol limit. */
export function largestModelBytes(config, protocol) {
  const pinned = (config.weekly?.pins ?? []).map((p) => p.size_bytes).filter((n) => typeof n === "number" && n > 0);
  if (pinned.length > 0) return Math.max(...pinned);
  const approx = (config.weekly?.picks ?? []).map((p) => p.approx_size_gb * 1e9).filter((n) => Number.isFinite(n));
  return approx.length > 0 ? Math.max(...approx) : protocol.max_model_size_gb * 1e9;
}

/** Spawns node on a harness script, appending output to a log; resolves with the exit code and the stderr tail. */
export function spawnNode(args, { cwd = REPO_ROOT, logFile, tailLines = 40 } = {}) {
  return new Promise((resolve) => {
    const tail = [];
    let partial = "";
    let child;
    try {
      child = spawn(process.execPath, args, { cwd, stdio: ["ignore", "pipe", "pipe"], windowsHide: true });
    } catch (e) {
      resolve({ code: null, signal: null, stderrTail: [String(e && e.message ? e.message : e)] });
      return;
    }
    const log = (chunk) => { if (logFile) { try { appendFileSync(logFile, chunk); } catch { /* logging must not stop collection */ } } };
    child.stdout.on("data", (b) => log(b));
    child.stderr.on("data", (b) => {
      log(b);
      partial += b.toString("utf8");
      const lines = partial.split(/\r?\n/);
      partial = lines.pop();
      for (const l of lines) { tail.push(l); if (tail.length > tailLines) tail.shift(); }
    });
    child.on("error", (e) => { tail.push(String(e && e.message ? e.message : e)); });
    child.on("close", (codeValue, signal) => {
      if (partial) { tail.push(partial); if (tail.length > tailLines) tail.shift(); }
      resolve({ code: codeValue, signal, stderrTail: tail.slice(-tailLines) });
    });
  });
}

/** Counts of the wave's records: { planned, ok, failed, pending }. Loads the bank; no model, no network. */
export function waveProgress(waveDir, config, bankPath = DEFAULT_BANK_PATH) {
  const bank = loadBankFile(bankPath);
  const plan = buildPlan({ bank, config });
  const existing = countExisting({ plan, runRoot: waveDir });
  let ok = 0;
  let failed = 0;
  for (const e of Object.values(existing)) { ok += e.ok; failed += e.failed; }
  return { planned: plan.total_calls, ok, failed, pending: plan.total_calls - ok - failed };
}

/**
 * The collect orchestration. Only Ollama on localhost is reached (by the spawned runner); no git write command, no
 * network beyond that, no Claude. Returns { code, state, message, status }.
 *
 * deps (all optional, injected by tests): runGit, freemem, spawnRunner(args, {cwd, logFile}), progress(waveDir, config),
 * now, pid, host, log, warn.
 */
export async function collectWave({ waveDir, repoRelDir, protocol, queue, limit, retryFailed = false, deps = {} }) {
  const d = {
    runGit: makeRunGit(),
    freemem: () => os.freemem(),
    spawnRunner: spawnNode,
    progress: waveProgress,
    now: () => new Date(),
    pid: process.pid,
    host: os.hostname(),
    log: (m) => console.log(m),
    warn: (m) => console.error(m),
    ...deps,
  };
  const runnerScript = path.join(MODEL_RUNS_ROOT, "bin", "run-local-subjects.mjs");
  const config = loadRunConfig(path.join(waveDir, "run-config.json"));

  // (b) the plan was committed, and has not been touched since
  const rel = repoRelDir.replaceAll("\\", "/");
  const planState = planCommitState({ runGit: d.runGit, files: [`${rel}/PREREGISTRATION.md`, `${rel}/run-config.json`] });
  if (!planState.committed) {
    refuse(`the plan is not committed and unmodified, so collection would not prove the plan came before the data:\n  ${planState.problems.join("\n  ")}\nThe founder must approve committing PREREGISTRATION.md, run-config.json and weekly.json first.`);
  }
  // (c) conformance, and a ratified protocol
  if (protocol.status !== "ratified") refuse(`PROTOCOL.json status is "${protocol.status}", not "ratified"`);
  const problems = checkConformance(config, protocol, { queue });
  if (problems.length > 0) refuse(`run-config.json does not conform to the protocol:\n  ${problems.join("\n  ")}`);
  const prereg = checkPreregistration(readFileSync(path.join(waveDir, "PREREGISTRATION.md"), "utf8"), config.preregistration ?? {});
  if (prereg.length > 0) refuse(`PREREGISTRATION.md fails its integrity check:\n  ${prereg.join("\n  ")}`);

  // (d) lock
  const lockFile = path.join(waveDir, COLLECT_LOCK);
  let lock;
  try {
    lock = acquireLock(lockFile, { now: d.now, pid: d.pid, host: d.host, warn: d.warn });
  } catch (e) {
    if (e instanceof LockedError) return { code: EXIT.LOCKED, state: "locked", message: e.message, status: null };
    throw e;
  }
  const startedAt = d.now().toISOString();
  const base = { run_id: config.run_id, protocol_version: protocol.protocol_version, started_at: startedAt, host: d.host, pid: d.pid };
  const write = (extra) => {
    const status = { ...base, finished_at: null, exit_code: null, stderr_tail: [], counts: null, ...extra };
    writeJsonAtomic(path.join(waveDir, COLLECT_STATUS), status);
    return status;
  };
  const finish = (code_, state, message, extra = {}) => ({
    code: code_,
    state,
    message,
    status: write({ state, message, finished_at: d.now().toISOString(), ...extra }),
  });

  try {
    // (e) memory
    const size = largestModelBytes(config, protocol);
    const pre = memoryPreflight({ freeBytes: d.freemem(), modelSizeBytes: size });
    if (!pre.ok) return finish(EXIT.DEFERRED, "deferred-low-memory", pre.message);
    d.log(`memory preflight: ${pre.message}`);

    write({ state: "running", message: "collecting" });
    mkdirSync(path.join(waveDir, "operations"), { recursive: true });
    const logFile = path.join(waveDir, "operations", "collect.log");

    // (f) the runner
    const args = [runnerScript, "--run-id", config.run_id, "--run-root", waveDir];
    if (limit !== undefined) args.push("--limit", String(limit));
    if (retryFailed) args.push("--retry-failed");
    const run = await d.spawnRunner(args, { cwd: REPO_ROOT, logFile });
    if (run.code !== 0) {
      return finish(EXIT.FAILED, "failed", `runner exited with ${run.code === null ? `signal ${run.signal}` : `code ${run.code}`}`, { exit_code: run.code, stderr_tail: run.stderrTail ?? [] });
    }
    // (g) finalise when the run is complete
    const prog = d.progress(waveDir, config);
    if (prog.pending > 0) {
      return finish(EXIT.OK, "partial", `${prog.pending} of ${prog.planned} calls remain; the next collect resumes`, { exit_code: 0, stderr_tail: run.stderrTail ?? [], counts: prog });
    }
    const fin = await d.spawnRunner([...args.filter((a, i) => !(a === "--limit" || args[i - 1] === "--limit") && a !== "--retry-failed"), "--finalize"], { cwd: REPO_ROOT, logFile });
    if (fin.code !== 0) {
      return finish(EXIT.FAILED, "failed", `finalize exited with code ${fin.code}`, { exit_code: fin.code, stderr_tail: fin.stderrTail ?? [], counts: prog });
    }
    const summaryFile = path.join(waveDir, "operations", "subject-run-summary.json");
    const summary = existsSync(summaryFile) ? JSON.parse(readFileSync(summaryFile, "utf8")) : null;
    const counts = summary
      ? Object.values(summary.per_subject ?? {}).reduce(
          (n, s) => ({ planned: n.planned + s.planned, ok: n.ok + s.ok, failed: n.failed + s.failed, missing: n.missing + s.missing }),
          { planned: 0, ok: 0, failed: 0, missing: 0 }
        )
      : prog;
    if (summary && summary.complete !== true) {
      return finish(EXIT.FAILED, "failed", `collection finished but ${summary.incomplete_briefs?.length ?? "some"} brief(s) have failed or missing trials; judging cannot start. Inspect operations/subject-run-summary.json`, { exit_code: 0, stderr_tail: fin.stderrTail ?? [], counts });
    }
    return finish(EXIT.OK, "collected", `all ${counts.planned ?? prog.planned} calls recorded and finalised`, { exit_code: 0, stderr_tail: fin.stderrTail ?? [], counts });
  } catch (e) {
    return finish(EXIT.FAILED, "failed", `unexpected error: ${e && e.message ? e.message : e}`, { stderr_tail: [String(e && e.stack ? e.stack : e).split(NL).slice(0, 10).join(NL)] });
  } finally {
    // (i)
    releaseLock(lockFile, { pid: lock.pid });
  }
}
