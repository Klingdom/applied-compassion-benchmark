// research/model-runs/lib/judging-config.mjs
//
// The judging-stage part of a run config (PREREGISTRATION.md sections 4, 5, 6). A run config WITHOUT a `judges`
// array is a first-pilot-style run (judges drawn from the subjects) and this module is not used for it.
// Every number here is read from run-config.json; none is typed in code.

import { refuse, readJson, JUDGES_PER_RESPONSE } from "./common.mjs";
import { buildKeyOf, resolveSubject } from "./local-subjects.mjs";

const LABEL = /^[A-Za-z0-9._-]+$/;

/** True when the config asks for an explicit judge set (the pilot-2026-10-02 design). */
export const hasExplicitJudges = (config) => Array.isArray(config?.judges);

/**
 * @returns {{
 *   runId: string, judges: string[], subjects: string[], familyOf: Record<string,string>,
 *   judgesPerResponse: number, maxBatchEntries: number,
 *   validity: {maxUnfoundPercent: number, shortQuoteMinChars: number},
 *   bridge: {sourceRun: string, sourceKey: string, seed: number, perSourceSubject: number, total: number},
 *   identityTerms: Record<string,string[]>, masterSeed: number
 * }}
 */
export function parseJudgingConfig(config, label = "run-config.json") {
  const bad = (m) => refuse(`${label}: ${m}`);
  if (!hasExplicitJudges(config)) bad("no `judges` array: not an explicit-judge-set run");
  if (!Array.isArray(config.subjects) || config.subjects.length === 0) bad("subjects must be a non-empty array");

  const familyOf = {};
  const judges = [];
  for (const j of config.judges) {
    if (!j || typeof j.label !== "string" || !LABEL.test(j.label)) bad("every judge needs a safe label");
    if (typeof j.family !== "string" || j.family.length === 0) bad(`judge ${j.label}: family missing`);
    if (j.label in familyOf) bad(`duplicate label ${j.label}`);
    familyOf[j.label] = j.family;
    judges.push(j.label);
  }
  const subjects = [];
  const identityTerms = {};
  // Arms: variants of one build (same tag + digest) are ordinary subjects to the judging stage (the family rule uses the
  // build's family, so every variant must carry the same one). What judges must never see about a variant is recorded here.
  const familyOfBuild = new Map();
  const armLabels = [];
  const hiddenSystemMessages = new Set();
  for (const s of config.subjects) {
    if (typeof s.tag === "string" && typeof s.digest === "string" && typeof s.family === "string") {
      const k = buildKeyOf(s);
      if (familyOfBuild.has(k) && familyOfBuild.get(k) !== s.family) bad(`build ${k}: variants carry different families`);
      familyOfBuild.set(k, s.family);
    }
    if (typeof s.arm === "string") armLabels.push(s.arm);
    const r = resolveSubject(config, s);
    if (r.hasSystem && r.systemMessage.length > 0) hiddenSystemMessages.add(r.systemMessage);
  }
  for (const s of config.subjects) {
    if (typeof s.family !== "string" || s.family.length === 0) bad(`subject ${s.label}: family missing (the family rule needs it)`);
    if (s.label in familyOf) bad(`label ${s.label} is both a subject and a judge, or duplicated: subjects and judges must be disjoint`);
    familyOf[s.label] = s.family;
    subjects.push(s.label);
    identityTerms[s.label] = Array.isArray(s.identity_terms) ? s.identity_terms.map(String) : [];
  }
  if (judges.length < JUDGES_PER_RESPONSE) bad(`need at least ${JUDGES_PER_RESPONSE} judges`);
  if (config.judges_per_response !== JUDGES_PER_RESPONSE) {
    bad(`judges_per_response must be ${JUDGES_PER_RESPONSE} (the scorer representation in assemble.mjs is built on it)`);
  }
  for (const s of subjects) {
    const eligible = judges.filter((j) => familyOf[j] !== familyOf[s]);
    if (eligible.length < JUDGES_PER_RESPONSE) bad(`subject ${s}: only ${eligible.length} judge(s) outside its family; need ${JUDGES_PER_RESPONSE}`);
  }

  if (!Number.isInteger(config.max_batch_entries) || config.max_batch_entries < 1) bad("max_batch_entries must be a positive integer");

  const v = config.judge_validity;
  if (!v || typeof v.max_unfound_quote_rate_percent !== "number" || !(v.max_unfound_quote_rate_percent >= 0) || !(v.max_unfound_quote_rate_percent < 100)) {
    bad("judge_validity.max_unfound_quote_rate_percent must be a number in [0, 100)");
  }
  if (!Number.isInteger(v.short_quote_min_chars) || v.short_quote_min_chars < 1) bad("judge_validity.short_quote_min_chars must be a positive integer");

  const b = config.bridge;
  if (!b || typeof b.source_run !== "string" || typeof b.source_key !== "string") bad("bridge.source_run and bridge.source_key are required");
  if (!Number.isInteger(b.seed)) bad("bridge.seed must be an integer");
  if (!Number.isInteger(b.per_source_subject) || b.per_source_subject < 1) bad("bridge.per_source_subject must be a positive integer");
  if (!Number.isInteger(b.total) || b.total < 1) bad("bridge.total must be a positive integer");

  return {
    runId: config.run_id,
    masterSeed: config.master_seed,
    judges,
    subjects,
    familyOf,
    judgesPerResponse: config.judges_per_response,
    maxBatchEntries: config.max_batch_entries,
    validity: { maxUnfoundPercent: v.max_unfound_quote_rate_percent, shortQuoteMinChars: v.short_quote_min_chars },
    bridge: { sourceRun: b.source_run, sourceKey: b.source_key, seed: b.seed, perSourceSubject: b.per_source_subject, total: b.total },
    identityTerms,
    armLabels: [...new Set(armLabels)],
    hiddenSystemMessages: [...hiddenSystemMessages],
  };
}

export function loadJudgingConfig(file) {
  return parseJudgingConfig(readJson(file), file);
}
