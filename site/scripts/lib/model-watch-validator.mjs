/**
 * model-watch-validator.mjs -- pure validator for the AI Model Watch stores.
 *
 * Spec: docs/DATA_MODEL_AI_MODEL_WATCH.md section 6 (rule ids MW-S/K/L/T/F/X/E/W). Same
 * style as model-releases-validator.mjs: pure functions, no I/O, failures block the build,
 * warnings do not. Callers pass context (`ctx`) read from disk by model-watch-context.mjs.
 *
 * ctx = {
 *   now: Date,                                  // fixed in tests
 *   queueTags: Set<string>|null,                // tags in queue-snapshot.entries[]
 *   waveTags: Set<string>|null,                 // tags in any wave design.subject_builds[*].tag
 *   withheldTokens: string[],                   // MW-T1: every pilot-withheld numeric token
 *   releaseWatchIds: Set<string>|null,          // releases-v1.json release_id values
 * }
 */

import { FORBIDDEN_KEY_RE } from "./model-wave.mjs";
import { BANNED, BAND_NAMES, ENDORSE_RE, NEGATOR_RE } from "./model-report-template.mjs";
import { hasToken } from "./model-report-html-gates.mjs";
import {
  SCHEMA_VERSION, CATALOG_STATUS, ACCESS, MODALITIES, SOURCE_TYPES, PRIMARY_SOURCE_TYPES, LOG_KINDS, CATALOG_ID_RE, KEBAB_RE,
  CATALOG_ROW_KEYS, LOG_ROW_KEYS, SOURCE_KEYS, LOG_FROZEN_FIELDS, RELEASE_WATCH_KEYS, EDITION_KEYS, FIRST_EDITION, FRESHNESS_DAYS,
  CATALOG_MEANING, LOG_MEANING, INDEPENDENCE_LINE, DISCLOSURE_LABEL, SHA256_RE,
  isIsoDate, isIsoMonth, earliestDay, todayIso, isHttps, deriveLogId, canonicalJson, daysBetween, cmpEn,
} from "./model-watch-core.mjs";
import {
  deriveReleases, deriveDisclosures, editionContentHash, editionCounts, manifestRow, stripAllowedDigits, RELEASE_COPY_KEYS,
  allModelNames, stripModelNames, modelNamesIn,
} from "./model-watch-edition.mjs";

const EXTRA_KEY_WORDS = new Set(["composite", "percent", "elo", "mmlu", "arena", "accuracy"]);
const BENCHMARK_CLAIM_RE = /\d+(\.\d+)?\s?%|\b(MMLU|GPQA|SWE-bench|HumanEval|Arena|Elo)\b/i;

const isObj = (x) => x !== null && typeof x === "object" && !Array.isArray(x);
const isStr = (x) => typeof x === "string" && x.trim().length > 0;
const keyWords = (k) => (k.match(/[A-Z]?[a-z0-9]+|[A-Z]+(?![a-z])/g) ?? []).map((w) => w.toLowerCase());

/** MW-K1: no key anywhere (any depth) names a rating-shaped concept. Keys are tested as whole camelCase words for the extra list. */
export { modelNamesIn };

export function forbiddenKeyProblems(x, path = "$") {
  const out = [];
  const walk = (v, p) => {
    if (Array.isArray(v)) { v.forEach((e, i) => walk(e, `${p}[${i}]`)); return; }
    if (!isObj(v)) return;
    for (const [k, val] of Object.entries(v)) {
      if (FORBIDDEN_KEY_RE.test(k) || keyWords(k).some((w) => EXTRA_KEY_WORDS.has(w))) out.push(`MW-K1: forbidden key "${k}" at ${p}`);
      walk(val, `${p}.${k}`);
    }
  };
  walk(x, path);
  return out;
}

/** MW-L1 / MW-L2 / MW-T1 over one free-text field. */
export function textProblems(text, where, ctx = {}) {
  const out = [];
  if (typeof text !== "string" || !text) return out;
  const negated = NEGATOR_RE.test(text);
  for (const b of BANNED) if (b.re.test(text) && !(b.negatable && negated)) out.push(`MW-L1: ${where}: banned word "${b.label}"`);
  for (const band of BAND_NAMES) if (new RegExp(`\\b${band}\\b`).test(text)) out.push(`MW-L1: ${where}: band name "${band}" (bands never label a model; reword the provider's term)`);
  if (ENDORSE_RE.test(text)) out.push(`MW-L1: ${where}: endorsement language ("${text.match(ENDORSE_RE)[0]}")`);
  if (BENCHMARK_CLAIM_RE.test(text)) out.push(`MW-L2: ${where}: benchmark-result claim ("${text.match(BENCHMARK_CLAIM_RE)[0]}")`);
  for (const tok of ctx.withheldTokens ?? []) if (hasToken(text, tok)) out.push(`MW-T1: ${where}: contains pilot-withheld number ${tok} (reword the data; never weaken G19)`);
  return out;
}

function sourceProblems(sources, where, now, { requirePrimary, warnings }) {
  const out = [];
  if (!Array.isArray(sources) || sources.length < 1) return [`MW-S2: ${where}: sources must have at least one entry`];
  const today = todayIso(now);
  const seen = new Set();
  sources.forEach((s, i) => {
    const w = `${where}.sources[${i}]`;
    if (!isObj(s)) { out.push(`MW-S1: ${w}: must be an object`); return; }
    const keys = Object.keys(s);
    if (keys.join(",") !== SOURCE_KEYS.join(",")) out.push(`MW-S1: ${w}: keys must be exactly ${SOURCE_KEYS.join(", ")} in that order`);
    if (!isHttps(s.url)) out.push(`MW-S2: ${w}: url must be an https:// URL that parses`);
    if (!isStr(s.title)) out.push(`MW-S1: ${w}: title must be a non-empty string`);
    if (!SOURCE_TYPES.includes(s.sourceType)) out.push(`MW-S1: ${w}: sourceType "${s.sourceType}" is not one of ${SOURCE_TYPES.join(", ")}`);
    if (!isIsoDate(s.accessed)) out.push(`MW-S2: ${w}: accessed must be an ISO date`);
    else if (s.accessed > today) out.push(`MW-S2: ${w}: accessed ${s.accessed} is in the future`);
    if (seen.has(s.url)) warnings.push(`MW-S2: ${w}: duplicate url ${s.url}`);
    seen.add(s.url);
  });
  if (!sources.some((s) => PRIMARY_SOURCE_TYPES.has(s?.sourceType))) {
    if (requirePrimary) out.push(`MW-S2: ${where}: needs at least one primary source`);
    else warnings.push(`MW-S2: ${where}: no primary source`);
  }
  return out;
}

function metaProblems(meta, rows, meaning, what) {
  const out = [];
  if (!isObj(meta)) return [`MW-S1: ${what}.meta must be an object`];
  if (meta.schemaVersion !== SCHEMA_VERSION) out.push(`MW-S1: ${what}.meta.schemaVersion must be "${SCHEMA_VERSION}"`);
  if (!isIsoDate(meta.asOf)) out.push(`MW-S1: ${what}.meta.asOf must be an ISO date`);
  if (!Number.isInteger(meta.rowCount) || meta.rowCount !== rows.length) out.push(`MW-S1: ${what}.meta.rowCount (${meta.rowCount}) must equal rows.length (${rows.length})`);
  if (!Array.isArray(meta.sourceFiles)) out.push(`MW-S1: ${what}.meta.sourceFiles must be an array`);
  else meta.sourceFiles.forEach((f, i) => {
    if (!isObj(f) || !isStr(f.path) || !SHA256_RE.test(f.sha256 ?? "")) out.push(`MW-S1: ${what}.meta.sourceFiles[${i}] needs {path, sha256 (64 hex)}`);
  });
  if (meta.meaning !== meaning) out.push(`MW-S1: ${what}.meta.meaning must be the fixed meaning string`);
  if (!isStr(meta.validator)) out.push(`MW-S1: ${what}.meta.validator must be a string`);
  return out;
}

/** Validate catalog-v1.json. Returns { failures, warnings }. */
export function validateCatalog(cat, ctx = {}) {
  const failures = [];
  const warnings = [];
  const now = ctx.now ?? new Date();
  const today = todayIso(now);
  if (!isObj(cat) || !Array.isArray(cat.rows)) return { failures: ["MW-S1: catalog must be {meta, rows[]}"], warnings };
  failures.push(...metaProblems(cat.meta, cat.rows, CATALOG_MEANING, "catalog"));
  failures.push(...forbiddenKeyProblems(cat, "catalog"));
  const ids = new Set();
  cat.rows.forEach((r, i) => {
    const w = `catalog.rows[${i}]${isStr(r?.id) ? `(${r.id})` : ""}`;
    if (!isObj(r)) { failures.push(`MW-S1: ${w}: must be an object`); return; }
    if (Object.keys(r).join(",") !== CATALOG_ROW_KEYS.join(",")) failures.push(`MW-S1: ${w}: keys must be exactly ${CATALOG_ROW_KEYS.join(", ")} in schema order`);
    if (!isStr(r.id) || !CATALOG_ID_RE.test(r.id)) failures.push(`MW-S3: ${w}: id must match ${CATALOG_ID_RE}`);
    else if (ids.has(r.id)) failures.push(`MW-S3: ${w}: duplicate id`);
    ids.add(r.id);
    for (const k of ["name", "provider", "licence"]) if (!isStr(r[k])) failures.push(`MW-S1: ${w}: ${k} must be a non-empty string`);
    if (!isStr(r.providerSlug) || !KEBAB_RE.test(r.providerSlug)) failures.push(`MW-S1: ${w}: providerSlug must be kebab-case`);
    if (!(r.family === null || isStr(r.family))) failures.push(`MW-S1: ${w}: family must be null or a non-empty string`);
    if (!(r.releaseDate === null || isIsoDate(r.releaseDate) || isIsoMonth(r.releaseDate))) failures.push(`MW-S4: ${w}: releaseDate must be null, YYYY-MM-DD or YYYY-MM`);
    else if (r.releaseDate && earliestDay(r.releaseDate) > today) failures.push(`MW-S4: ${w}: releaseDate ${r.releaseDate} is in the future`);
    if (!CATALOG_STATUS.includes(r.status)) failures.push(`MW-S1: ${w}: status "${r.status}" is not one of ${CATALOG_STATUS.join(", ")}`);
    if (!Array.isArray(r.access) || r.access.length === 0 || !r.access.every((a) => ACCESS.includes(a)) || new Set(r.access).size !== r.access.length) {
      failures.push(`MW-S1: ${w}: access must be a non-empty array of distinct values from ${ACCESS.join(", ")}`);
    }
    if (!Array.isArray(r.modalities) || !r.modalities.every((m) => MODALITIES.includes(m))) failures.push(`MW-S1: ${w}: modalities must be an array of ${MODALITIES.join(", ")}`);
    if (!(r.contextWindowTokens === null || (Number.isInteger(r.contextWindowTokens) && r.contextWindowTokens > 0))) failures.push(`MW-S1: ${w}: contextWindowTokens must be null or a positive integer`);
    if (!(r.parameterCount === null || isStr(r.parameterCount))) failures.push(`MW-S1: ${w}: parameterCount must be null or a non-empty string`);
    if (typeof r.notes !== "string") failures.push(`MW-S1: ${w}: notes must be a string`);
    failures.push(...sourceProblems(r.sources, w, now, { requirePrimary: false, warnings }));
    if (!(r.benchmarkLocalTag === null || isStr(r.benchmarkLocalTag))) failures.push(`MW-S1: ${w}: benchmarkLocalTag must be null or a string`);
    for (const k of ["firstListedOn", "lastVerifiedOn"]) {
      if (!isIsoDate(r[k])) failures.push(`MW-S4: ${w}: ${k} must be an ISO date`);
      else if (r[k] > today) failures.push(`MW-S4: ${w}: ${k} ${r[k]} is in the future`);
    }
    if (isIsoDate(r.firstListedOn) && isIsoDate(r.lastVerifiedOn) && r.lastVerifiedOn < r.firstListedOn) failures.push(`MW-S4: ${w}: lastVerifiedOn precedes firstListedOn`);
    // MW-L1/L2/T1 over text fields.
    for (const k of ["notes", "parameterCount", "name", "family", "licence"]) failures.push(...textProblems(r[k], `${w}.${k}`, ctx));
    // MW-F1 tag
    if (r.benchmarkLocalTag) {
      if (!ctx.queueTags && !ctx.waveTags) warnings.push(`MW-F1: ${w}: benchmarkLocalTag not checked (no queue snapshot or wave tags supplied)`);
      else if (!(ctx.queueTags?.has(r.benchmarkLocalTag) || ctx.waveTags?.has(r.benchmarkLocalTag))) {
        failures.push(`MW-F1: ${w}: benchmarkLocalTag "${r.benchmarkLocalTag}" is in neither the queue snapshot nor any wave subject_builds`);
      }
    }
  });
  // sort order
  for (let i = 1; i < cat.rows.length; i += 1) {
    const a = cat.rows[i - 1];
    const b = cat.rows[i];
    if (cmpEn(a.provider, b.provider) > 0 || (cmpEn(a.provider, b.provider) === 0 && cmpEn(a.name, b.name) > 0)) {
      failures.push(`MW-S1: catalog.rows are not sorted by provider then name (at ${b.id})`);
      break;
    }
  }
  return { failures, warnings };
}

/** Validate release-log-v1.json. ctx.catalogIds: Set of catalog ids (required for MW-F1). */
export function validateReleaseLog(log, ctx = {}) {
  const failures = [];
  const warnings = [];
  const now = ctx.now ?? new Date();
  const today = todayIso(now);
  if (!isObj(log) || !Array.isArray(log.rows)) return { failures: ["MW-S1: release log must be {meta, rows[]}"], warnings };
  failures.push(...metaProblems(log.meta, log.rows, LOG_MEANING, "releaseLog"));
  failures.push(...forbiddenKeyProblems(log, "releaseLog"));
  const ids = new Set();
  log.rows.forEach((r, i) => {
    const w = `releaseLog.rows[${i}]${isStr(r?.id) ? `(${r.id})` : ""}`;
    if (!isObj(r)) { failures.push(`MW-S1: ${w}: must be an object`); return; }
    for (const k of RELEASE_WATCH_KEYS) if (k in r) failures.push(`MW-X1: ${w}: carries release-watch key "${k}" (the log is not the release-watch store)`);
    if (Object.keys(r).filter((k) => !RELEASE_WATCH_KEYS.includes(k)).join(",") !== LOG_ROW_KEYS.join(",")) failures.push(`MW-S1: ${w}: keys must be exactly ${LOG_ROW_KEYS.join(", ")} in schema order`);
    if (!isIsoDate(r.date)) failures.push(`MW-S4: ${w}: date must be an ISO date`);
    else if (r.date > today) failures.push(`MW-S4: ${w}: date ${r.date} is in the future`);
    if (!isIsoDate(r.loggedOn)) failures.push(`MW-S4: ${w}: loggedOn must be an ISO date`);
    else if (r.loggedOn > today) failures.push(`MW-S4: ${w}: loggedOn ${r.loggedOn} is in the future`);
    if (!isStr(r.provider)) failures.push(`MW-S1: ${w}: provider must be a non-empty string`);
    if (!isStr(r.providerSlug) || !KEBAB_RE.test(r.providerSlug)) failures.push(`MW-S1: ${w}: providerSlug must be kebab-case`);
    if (!LOG_KINDS.includes(r.kind)) failures.push(`MW-S1: ${w}: kind "${r.kind}" is not one of ${LOG_KINDS.join(", ")}`);
    if (r.modelName === null) { if (r.kind !== "policy") failures.push(`MW-S1: ${w}: modelName may be null only for kind "policy"`); }
    else if (!isStr(r.modelName)) failures.push(`MW-S1: ${w}: modelName must be a non-empty string`);
    if (!(r.catalogId === null || isStr(r.catalogId))) failures.push(`MW-S1: ${w}: catalogId must be null or a string`);
    else if (r.catalogId && ctx.catalogIds && !ctx.catalogIds.has(r.catalogId)) failures.push(`MW-F1: ${w}: catalogId "${r.catalogId}" does not resolve to a catalog row`);
    if (!isStr(r.summary)) failures.push(`MW-S1: ${w}: summary must be a non-empty string`);
    if (typeof r.safetyOrWelfareRelevant !== "boolean") failures.push(`MW-S1: ${w}: safetyOrWelfareRelevant must be boolean`);
    else if (r.safetyOrWelfareRelevant && !isStr(r.safetyNote)) failures.push(`MW-S1: ${w}: safetyNote is required (non-empty) when safetyOrWelfareRelevant`);
    else if (!r.safetyOrWelfareRelevant && r.safetyNote !== null) failures.push(`MW-S1: ${w}: safetyNote must be null when not safetyOrWelfareRelevant`);
    failures.push(...sourceProblems(r.sources, w, now, { requirePrimary: true, warnings }));
    if (!(r.releaseWatchId === null || isStr(r.releaseWatchId))) failures.push(`MW-S1: ${w}: releaseWatchId must be null or a string`);
    else if (r.releaseWatchId) {
      if (!ctx.releaseWatchIds) warnings.push(`MW-X2: ${w}: releaseWatchId not checked (releases-v1.json ids not supplied)`);
      else if (!ctx.releaseWatchIds.has(r.releaseWatchId)) failures.push(`MW-X2: ${w}: releaseWatchId "${r.releaseWatchId}" does not exist in releases-v1.json`);
    }
    if (!Array.isArray(r.corrections)) failures.push(`MW-S1: ${w}: corrections must be an array`);
    else correctionsProblems(r.corrections, `${w}.corrections`, today).forEach((m) => failures.push(m));
    // id
    const want = isStr(r.providerSlug) && LOG_KINDS.includes(r.kind) && isIsoDate(r.date) ? deriveLogId(r) : null;
    if (want && r.id !== want) failures.push(`MW-S3: ${w}: id must equal its derivation "${want}"`);
    if (ids.has(r.id)) failures.push(`MW-S3: ${w}: duplicate id`);
    ids.add(r.id);
    for (const k of ["summary", "safetyNote", "modelName"]) failures.push(...textProblems(r[k], `${w}.${k}`, ctx));
    for (const c of r.corrections ?? []) failures.push(...textProblems(c?.text, `${w}.corrections.text`, ctx));
  });
  for (let i = 1; i < log.rows.length; i += 1) {
    const a = log.rows[i - 1];
    const b = log.rows[i];
    if (a.date < b.date || (a.date === b.date && a.id > b.id)) { failures.push(`MW-S1: releaseLog.rows are not sorted by date descending then id (at ${b.id})`); break; }
  }
  return { failures, warnings };
}

function correctionsProblems(list, where, today) {
  const out = [];
  let prev = "";
  list.forEach((c, i) => {
    if (!isObj(c) || !isIsoDate(c.date) || !isStr(c.text) || Object.keys(c).join(",") !== "date,text") { out.push(`MW-E3: ${where}[${i}] must be {date (ISO), text}`); return; }
    if (c.date > today) out.push(`MW-E3: ${where}[${i}] date ${c.date} is in the future`);
    if (c.date < prev) out.push(`MW-E3: ${where}[${i}] dates must be ascending`);
    prev = c.date;
  });
  return out;
}

/** MW-F2 (log): prior is the committed (HEAD) log; next is the working log. */
export function validateLogTransition(prior, next) {
  const failures = [];
  if (!prior || !Array.isArray(prior.rows)) return failures;
  const nextById = new Map((next?.rows ?? []).map((r) => [r.id, r]));
  for (const p of prior.rows) {
    const n = nextById.get(p.id);
    if (!n) { failures.push(`MW-F2: log row ${p.id} was removed (rows are never deleted)`); continue; }
    for (const k of LOG_FROZEN_FIELDS) if (canonicalJson(p[k]) !== canonicalJson(n[k])) failures.push(`MW-F2: log row ${p.id}: frozen field "${k}" changed`);
    const nurl = new Set(n.sources.map((s) => s.url));
    for (const s of p.sources) if (!nurl.has(s.url)) failures.push(`MW-F2: log row ${p.id}: source ${s.url} was removed (sources only grow)`);
    if (n.corrections.length < p.corrections.length || canonicalJson(n.corrections.slice(0, p.corrections.length)) !== canonicalJson(p.corrections)) {
      failures.push(`MW-F2: log row ${p.id}: corrections must be append-only`);
    }
    const textChanged = n.summary !== p.summary || n.safetyNote !== p.safetyNote;
    if (textChanged && n.corrections.length === p.corrections.length) failures.push(`MW-F2: log row ${p.id}: summary/safetyNote changed without a new corrections[] entry`);
  }
  return failures;
}

/** MW-F2 (catalog): ids never disappear; firstListedOn never changes. */
export function validateCatalogTransition(prior, next) {
  const failures = [];
  if (!prior || !Array.isArray(prior.rows)) return failures;
  const nextById = new Map((next?.rows ?? []).map((r) => [r.id, r]));
  for (const p of prior.rows) {
    const n = nextById.get(p.id);
    if (!n) failures.push(`MW-F2: catalog id ${p.id} disappeared (ids are frozen once published)`);
    else if (n.firstListedOn !== p.firstListedOn) failures.push(`MW-F2: catalog row ${p.id}: firstListedOn changed`);
  }
  return failures;
}

/** Validate one compiled edition. input = {edition, filename, log, catalog}. */
export function validateEdition({ edition, filename, log, catalog }, ctx = {}) {
  const failures = [];
  const now = ctx.now ?? new Date();
  const today = todayIso(now);
  const e = edition;
  const w = `edition(${filename ?? "?"})`;
  if (!isObj(e)) return { failures: [`MW-E1: ${w}: must be an object`], warnings: [] };
  if (Object.keys(e).join(",") !== EDITION_KEYS.join(",")) failures.push(`MW-E1: ${w}: must have all six parts and exactly the keys ${EDITION_KEYS.join(", ")} in order`);
  failures.push(...forbiddenKeyProblems(e, w));
  if (!isIsoDate(e.date)) failures.push(`MW-E1: ${w}: date must be ISO`);
  else {
    if (filename && filename !== `${e.date}.json`) failures.push(`MW-E1: ${w}: edition date ${e.date} must equal the filename`);
    if (e.date > today) failures.push(`MW-S4: ${w}: date ${e.date} is in the future`);
  }
  if (e.asOf !== e.date) failures.push(`MW-E1: ${w}: asOf must equal date`);
  if (!isObj(e.window) || !isIsoDate(e.window.from) || !isIsoDate(e.window.to) || e.window.from > e.window.to) failures.push(`MW-E1: ${w}: window must be {from, to} ISO with from <= to`);
  if (e.title !== `AI Model Watch — ${e.date}`) failures.push(`MW-E1: ${w}: title must be "AI Model Watch — <date>"`);
  if (e.independence !== INDEPENDENCE_LINE) failures.push(`MW-E1: ${w}: independence must be the fixed line`);
  const parts = ["coverage", "coverageStatement", "releases", "disclosures", "measured", "queue", "corrections", "sources"];
  for (const k of parts) if (e[k] === undefined) failures.push(`MW-E1: ${w}: missing part "${k}"`);
  if (failures.some((m) => m.startsWith("MW-E1") && /missing part|keys/.test(m))) return { failures, warnings: [] };
  if (!SHA256_RE.test(e.contentHash ?? "") || e.contentHash !== editionContentHash(e)) failures.push(`MW-E1: ${w}: contentHash does not recompute (edition was edited after compile)`);
  // MW-E2 releases
  if (log && isObj(e.window)) {
    const want = deriveReleases(log, e.window, e.asOf);
    const got = e.releases;
    const wantIds = want.map((r) => r.releaseId);
    const gotIds = got.map((r) => r.releaseId);
    if (canonicalJson(wantIds) !== canonicalJson(gotIds)) {
      failures.push(`MW-E2: ${w}: releases[] ids differ from the derivation (window ${e.window.from}..${e.window.to}, loggedOn <= ${e.asOf}); want [${wantIds.length}], got [${gotIds.length}]`);
    } else {
      const logById = new Map(log.rows.map((r) => [r.id, r]));
      want.forEach((wr, i) => {
        const gr = got[i];
        const lr = logById.get(wr.releaseId);
        const keys = RELEASE_COPY_KEYS;
        if (Object.keys(gr).join(",") !== keys.join(",")) failures.push(`MW-E2: ${w}: release ${wr.releaseId} has wrong keys`);
        for (const k of ["releaseId", "date", "provider", "providerSlug", "modelName", "catalogId", "kind", "safetyOrWelfareRelevant"]) {
          if (canonicalJson(gr[k]) !== canonicalJson(wr[k])) failures.push(`MW-E2: ${w}: release ${wr.releaseId}: "${k}" differs from the log`);
        }
        const corrected = (lr?.corrections ?? []).length > 0;
        for (const k of ["summary", "safetyNote"]) {
          if (!corrected && canonicalJson(gr[k]) !== canonicalJson(wr[k])) failures.push(`MW-E2: ${w}: release ${wr.releaseId}: "${k}" was hand-edited (differs from the log row, which has no correction)`);
        }
        const logUrls = new Set((lr?.sources ?? []).map((s) => s.url));
        for (const s of gr.sources ?? []) if (!logUrls.has(s.url)) failures.push(`MW-E2: ${w}: release ${wr.releaseId}: source ${s.url} is not on the log row`);
        if (!(gr.sources ?? []).length) failures.push(`MW-E2: ${w}: release ${wr.releaseId} has no source`);
      });
    }
    const wantDisc = deriveDisclosures(got);
    if (canonicalJson(wantDisc) !== canonicalJson(e.disclosures)) failures.push(`MW-E2: ${w}: disclosures[] differs from its derivation (safetyOrWelfareRelevant releases only, no authored text)`);
  }
  // sources: union of release sources, numbered
  const union = [];
  const seen = new Set();
  for (const r of e.releases) for (const s of r.sources) if (!seen.has(s.url)) { seen.add(s.url); union.push(s.url); }
  if (canonicalJson(e.sources.map((s) => s.url)) !== canonicalJson(union) || !e.sources.every((s, i) => s.n === i + 1)) failures.push(`MW-E1: ${w}: sources[] must be the numbered, deduplicated union of release sources`);
  // part 4/5 shapes
  if (!isObj(e.measured) || !Array.isArray(e.measured.reports) || !isStr(e.measured.note)) failures.push(`MW-E1: ${w}: measured must be {reports[], note}`);
  else {
    e.measured.reports.forEach((r) => {
      if (!isObj(r) || Object.keys(r).join(",") !== "runId,reportDate,href" || r.href !== `/ai-models/reports/${r.runId}`) failures.push(`MW-E1: ${w}: measured.reports entries must be {runId, reportDate, href=/ai-models/reports/<runId>}`);
    });
    if (e.measured.reports.length === 0 && !e.measured.note.startsWith("Nothing published in this window.")) failures.push(`MW-E1: ${w}: empty measured.reports must read "Nothing published in this window."`);
  }
  const q = e.queue;
  if (!isObj(q) || !["queued", "measured", "skipped"].every((k) => Number.isInteger(q[k]) && q[k] >= 0) || !Array.isArray(q.queuedDevelopers)) failures.push(`MW-E1: ${w}: queue must be {asOf, queued, measured, skipped, queuedDevelopers[]}`);
  // coverage
  if (!isObj(e.coverage) || !Array.isArray(e.coverage.scanned) || !Array.isArray(e.coverage.notScanned)) failures.push(`MW-E1: ${w}: coverage needs both scanned[] and notScanned[]`);
  else if (e.coverage.scanned.length === 0 && !e.coverageStatement.startsWith("No scan ran for this window")) failures.push(`MW-E1: ${w}: empty scanned[] must read "No scan ran for this window", never "nothing found"`);
  // MW-E3 lead
  if (isStr(e.lead) && isObj(e.window)) {
    const c = editionCounts(e);
    const stripped = stripAllowedDigits(stripModelNames(e.lead, allModelNames(catalog, log)), e.window, [c.releaseCount, c.disclosureCount, c.windowDays]);
    if (/\d/.test(stripped)) failures.push(`MW-E3: ${w}: lead has a digit that is neither a resolved token nor a window date: "${stripped.trim().slice(0, 80)}"`);
    if (/\{\{/.test(e.lead)) failures.push(`MW-E3: ${w}: lead has an unresolved token`);
    // MW-E4
    const names = modelNamesIn(e.lead, catalog);
    const relNames = e.releases.map((r) => String(r.modelName ?? "").toLowerCase());
    for (const n of names) {
      const ok = relNames.some((rn) => rn.includes(n.toLowerCase())) || e.releases.some((r) => catalog?.rows?.some((cr) => cr.id === r.catalogId && cr.name === n));
      if (!ok) failures.push(`MW-E4: ${w}: lead names "${n}", which is not in this edition's releases[]`);
    }
    failures.push(...textProblems(e.lead, `${w}.lead`, ctx));
  } else failures.push(`MW-E1: ${w}: lead must be a non-empty string`);
  for (const r of e.releases ?? []) for (const k of ["summary", "safetyNote"]) failures.push(...textProblems(r[k], `${w}.releases.${k}`, ctx));
  failures.push(...correctionsProblems(e.corrections, `${w}.corrections`, today));
  for (const c of e.corrections ?? []) failures.push(...textProblems(c?.text, `${w}.corrections.text`, ctx));
  failures.push(...textProblems(e.coverageStatement, `${w}.coverageStatement`, ctx));
  if (e.date === FIRST_EDITION.date && (e.window?.from !== FIRST_EDITION.from || e.window?.to !== FIRST_EDITION.to)) {
    failures.push(`MW-E5: ${w}: the first edition ${FIRST_EDITION.date} must have window ${FIRST_EDITION.from}..${FIRST_EDITION.to}`);
  }
  void DISCLOSURE_LABEL;
  return { failures, warnings: [] };
}

/** Editions are append-only after compile: only corrections may grow; everything else, including contentHash, is identical. */
export function validateEditionTransition(prior, next, filename = "?") {
  const failures = [];
  if (!prior) return failures;
  const strip = (e) => { const { corrections, ...rest } = e; void corrections; return canonicalJson(rest); };
  if (strip(prior) !== strip(next)) failures.push(`MW-E3: edition ${filename} changed outside corrections[] (editions are immutable after compile)`);
  const pc = prior.corrections ?? [];
  const nc = next.corrections ?? [];
  if (nc.length < pc.length || canonicalJson(nc.slice(0, pc.length)) !== canonicalJson(pc)) failures.push(`MW-E3: edition ${filename}: corrections must be append-only`);
  return failures;
}

/** MW-E5: the manifest lists exactly the compiled files, newest first, with derived counts. */
export function validateEditionsManifest(manifest, editionsByFile) {
  const failures = [];
  if (!isObj(manifest) || !Array.isArray(manifest.editions)) return ["MW-E5: editions-manifest must be {editions[]}"];
  const files = Object.keys(editionsByFile).map((f) => f.replace(/\.json$/, "")).sort();
  const listed = manifest.editions.map((m) => m.date).sort();
  if (canonicalJson(files) !== canonicalJson(listed)) failures.push(`MW-E5: manifest lists [${listed.join(", ")}] but compiled editions are [${files.join(", ")}]`);
  for (let i = 1; i < manifest.editions.length; i += 1) if (manifest.editions[i - 1].date < manifest.editions[i].date) { failures.push("MW-E5: manifest is not newest-first"); break; }
  for (const m of manifest.editions) {
    const e = editionsByFile[`${m.date}.json`];
    if (e && canonicalJson(m) !== canonicalJson(manifestRow(e))) failures.push(`MW-E5: manifest row ${m.date} differs from its edition`);
  }
  return failures;
}

/** MW-W1: warn (never fail, D-30) when the newest catalog asOf / edition date is more than 10 days old. */
export function freshnessWarnings(catalog, editionDates, now = new Date()) {
  const newest = [catalog?.meta?.asOf, ...editionDates].filter(isIsoDate).sort().pop();
  if (!newest) return ["MW-W1: no catalog asOf or edition date; the Model Watch has no published data yet"];
  const age = daysBetween(newest, todayIso(now));
  return age > FRESHNESS_DAYS ? [`MW-W1: newest Model Watch data is ${newest}, ${age} days before ${todayIso(now)} (more than ${FRESHNESS_DAYS})`] : [];
}

/**
 * Whole-state validation used by validate-model-watch.mjs and the tests.
 * state = { catalog, log, editions: {"<d>.json": edition}, manifest, prior?: {catalog, log, editions} }
 */
export function validateModelWatchState(state, ctx = {}) {
  const failures = [];
  const warnings = [];
  const cat = validateCatalog(state.catalog, ctx);
  failures.push(...cat.failures); warnings.push(...cat.warnings);
  const catalogIds = new Set((state.catalog?.rows ?? []).map((r) => r.id));
  const lg = validateReleaseLog(state.log, { ...ctx, catalogIds });
  failures.push(...lg.failures); warnings.push(...lg.warnings);
  for (const [filename, edition] of Object.entries(state.editions ?? {})) {
    const r = validateEdition({ edition, filename, log: state.log, catalog: state.catalog }, ctx);
    failures.push(...r.failures); warnings.push(...r.warnings);
    const prior = state.prior?.editions?.[filename];
    if (prior) failures.push(...validateEditionTransition(prior, edition, filename));
  }
  failures.push(...validateEditionsManifest(state.manifest, state.editions ?? {}));
  if (state.prior) {
    failures.push(...validateLogTransition(state.prior.log, state.log));
    failures.push(...validateCatalogTransition(state.prior.catalog, state.catalog));
    for (const f of Object.keys(state.prior.editions ?? {})) if (!(f in (state.editions ?? {}))) failures.push(`MW-E5: committed edition ${f} was removed`);
  }
  warnings.push(...freshnessWarnings(state.catalog, Object.values(state.editions ?? {}).map((e) => e.date), ctx.now ?? new Date()));
  return { failures, warnings };
}
