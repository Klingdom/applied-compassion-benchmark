/**
 * model-watch-import.mjs -- pure normalise + merge for `npm run model-watch:import`.
 *
 * Spec: docs/DATA_MODEL_AI_MODEL_WATCH.md section 4. The research files are loosely typed; this module maps
 * KNOWN synonyms through the tables below and reports every other unknown value as an error. It never guesses
 * an enum value. Three research conventions are resolved by explicit, reported rules (not guesses):
 *   access "both"     -> ["api","open-weights"] when the licence is not "Proprietary", else ["api","consumer-app"]
 *                        (the research note defines "both" as an API plus open weights or a consumer app, verified)
 *   licence null      -> "unverified" (a reported warning; the field is required and the sources did not state one)
 *   providerSlug (releases) -> the catalog's providerSlug for the same provider name, else slugify(provider)
 */

import {
  CATALOG_ROW_KEYS, LOG_ROW_KEYS, LOG_FROZEN_FIELDS, SCHEMA_VERSION, CATALOG_MEANING, LOG_MEANING, VALIDATOR_PATH,
  ordered, orderSource, sortCatalogRows, sortLogRows, deriveLogId, slugify, unionSources, canonicalJson,
} from "./model-watch-core.mjs";

export const STATUS_SYNONYMS = { ga: "current", "generally available": "current", "general availability": "current", live: "current" };
export const ACCESS_SYNONYMS = {
  "open weights": "open-weights", "open-weight": "open-weights", "open weight": "open-weights", openweights: "open-weights", open_weights: "open-weights",
  "consumer app": "consumer-app", consumer_app: "consumer-app", "consumer-application": "consumer-app",
};
export const MODALITY_SYNONYMS = { texts: "text", images: "image", videos: "video", documents: "document", pdfs: "pdf" };
export const SOURCE_TYPE_SYNONYMS = { "model card": "model-card", "system card": "system-card", "technical report": "technical-report", licence: "licence", license: "licence", "provider announcement": "provider-announcement", docs: "documentation" };
export const KIND_SYNONYMS = {
  "new model": "new-model", "new version": "new-version", "open weights release": "open-weights-release", "open-weights": "open-weights-release",
  "api availability": "api-availability", "safety documentation": "safety-documentation",
};

const CATALOG_INPUT_KEYS = CATALOG_ROW_KEYS.filter((k) => !["firstListedOn", "lastVerifiedOn"].includes(k));
const LOG_INPUT_KEYS = ["date", "provider", "providerSlug", "modelName", "catalogId", "kind", "summary", "safetyOrWelfareRelevant", "safetyNote", "sources"];

const trim = (v) => (typeof v === "string" ? v.trim() : v);
const lower = (v) => (typeof v === "string" ? v.trim().toLowerCase() : v);
const mapSyn = (v, table) => (typeof v === "string" ? (table[lower(v)] ?? lower(v)) : v);

function normaliseSources(list, where, errors) {
  if (!Array.isArray(list)) { errors.push(`${where}: sources must be an array`); return []; }
  const seen = new Set();
  const out = [];
  list.forEach((s, i) => {
    if (s === null || typeof s !== "object") { errors.push(`${where}.sources[${i}]: must be an object`); return; }
    const extra = Object.keys(s).filter((k) => !["url", "title", "sourceType", "accessed"].includes(k));
    if (extra.length) errors.push(`${where}.sources[${i}]: unknown key(s) ${extra.join(", ")}`);
    const n = orderSource({ url: trim(s.url), title: trim(s.title), sourceType: mapSyn(s.sourceType, SOURCE_TYPE_SYNONYMS), accessed: trim(s.accessed) });
    if (seen.has(n.url)) return;
    seen.add(n.url);
    out.push(n);
  });
  return out;
}

/** @returns {{rows:object[], errors:string[], notes:string[]}} rows lack firstListedOn / lastVerifiedOn (set by the merge). */
export function normaliseCatalog(research) {
  const errors = [];
  const notes = [];
  if (!research || !Array.isArray(research.models)) return { rows: [], errors: ["catalog research file must have models[]"], notes };
  const rows = research.models.map((raw, i) => {
    const w = `models[${i}]${raw?.id ? `(${raw.id})` : ""}`;
    if (raw === null || typeof raw !== "object") { errors.push(`${w}: must be an object`); return null; }
    const extra = Object.keys(raw).filter((k) => !CATALOG_INPUT_KEYS.includes(k));
    if (extra.length) errors.push(`${w}: unknown key(s) ${extra.join(", ")} (refusing to drop data silently)`);
    const licenceRaw = trim(raw.licence);
    const licence = licenceRaw === null || licenceRaw === undefined || licenceRaw === "" ? "unverified" : licenceRaw;
    if (licence === "unverified") notes.push(`${w}: licence not stated in the research file; stored as "unverified"`);
    let access = raw.access;
    if (typeof access === "string") access = [access];
    if (!Array.isArray(access)) { errors.push(`${w}: access must be a string or array`); access = []; }
    access = access.flatMap((a) => {
      const v = mapSyn(a, ACCESS_SYNONYMS);
      if (v !== "both") return [v];
      const derived = lower(licence) === "proprietary" ? ["api", "consumer-app"] : ["api", "open-weights"];
      notes.push(`${w}: access "both" resolved to [${derived.join(", ")}] by the licence rule`);
      return derived;
    });
    access = [...new Set(access)];
    let ctx = raw.contextWindowTokens;
    if (typeof ctx === "string" && /^\d+$/.test(ctx.trim())) ctx = Number(ctx.trim());
    let params = raw.parameterCount;
    if (typeof params === "number") params = String(params);
    params = trim(params);
    if (params === "") params = null;
    const row = {
      id: trim(raw.id), name: trim(raw.name), provider: trim(raw.provider), providerSlug: trim(raw.providerSlug),
      family: trim(raw.family) === "" ? null : (trim(raw.family) ?? null),
      releaseDate: trim(raw.releaseDate) ?? null,
      status: mapSyn(raw.status, STATUS_SYNONYMS),
      access, licence,
      modalities: Array.isArray(raw.modalities) ? [...new Set(raw.modalities.map((m) => mapSyn(m, MODALITY_SYNONYMS)))] : raw.modalities,
      contextWindowTokens: ctx ?? null,
      parameterCount: params ?? null,
      notes: typeof raw.notes === "string" ? raw.notes.trim() : (raw.notes ?? ""),
      sources: normaliseSources(raw.sources, w, errors),
      benchmarkLocalTag: trim(raw.benchmarkLocalTag) === "" ? null : (trim(raw.benchmarkLocalTag) ?? null),
    };
    return row;
  }).filter(Boolean);
  return { rows, errors, notes };
}

/** @param {object[]} catalogRows normalised catalog rows, used to resolve providerSlug. */
export function normaliseReleases(research, catalogRows) {
  const errors = [];
  const notes = [];
  if (!research || !Array.isArray(research.releases)) return { rows: [], errors: ["releases research file must have releases[]"], notes };
  const slugByProvider = new Map();
  for (const r of catalogRows) if (r.provider && r.providerSlug) slugByProvider.set(r.provider, r.providerSlug);
  const rows = research.releases.map((raw, i) => {
    const w = `releases[${i}]`;
    if (raw === null || typeof raw !== "object") { errors.push(`${w}: must be an object`); return null; }
    const extra = Object.keys(raw).filter((k) => !LOG_INPUT_KEYS.includes(k));
    if (extra.length) errors.push(`${w}: unknown key(s) ${extra.join(", ")} (refusing to drop data silently)`);
    const provider = trim(raw.provider);
    let providerSlug = trim(raw.providerSlug);
    if (!providerSlug) {
      providerSlug = slugByProvider.get(provider) ?? slugify(provider);
      if (!slugByProvider.has(provider)) notes.push(`${w}: provider "${provider}" is not in the catalog; providerSlug derived as "${providerSlug}"`);
    }
    const row = {
      date: trim(raw.date), provider, providerSlug,
      modelName: trim(raw.modelName) === "" ? null : (trim(raw.modelName) ?? null),
      catalogId: trim(raw.catalogId) === "" ? null : (trim(raw.catalogId) ?? null),
      kind: mapSyn(raw.kind, KIND_SYNONYMS),
      summary: trim(raw.summary),
      safetyOrWelfareRelevant: raw.safetyOrWelfareRelevant,
      safetyNote: trim(raw.safetyNote) === "" ? null : (trim(raw.safetyNote) ?? null),
      sources: normaliseSources(raw.sources, w, errors),
    };
    row.id = deriveLogId(row);
    return row;
  }).filter(Boolean);
  return { rows, errors, notes };
}

/** Merge normalised catalog rows into an existing catalog store. Never deletes. */
export function mergeCatalog(existing, incoming, { asOf, sourceFile }) {
  const warnings = [];
  const errors = [];
  const byId = new Map((existing?.rows ?? []).map((r) => [r.id, r]));
  const inIds = new Set(incoming.map((r) => r.id));
  if (existing?.meta?.asOf && asOf < existing.meta.asOf) errors.push(`import asOf ${asOf} is older than the store's asOf ${existing.meta.asOf}`);
  const merged = new Map(byId);
  for (const r of incoming) {
    const prior = byId.get(r.id);
    const base = ordered({ ...r, firstListedOn: prior?.firstListedOn ?? asOf, lastVerifiedOn: asOf }, CATALOG_ROW_KEYS);
    merged.set(r.id, base);
  }
  for (const [id] of byId) if (!inIds.has(id)) warnings.push(`catalog row ${id} not re-verified in this import (kept unchanged)`);
  const sourceFiles = [...(existing?.meta?.sourceFiles ?? []).filter((f) => f.path !== sourceFile.path), sourceFile].sort((a, b) => (a.path < b.path ? -1 : 1));
  const rows = sortCatalogRows([...merged.values()]);
  return {
    store: { meta: { schemaVersion: SCHEMA_VERSION, asOf, rowCount: rows.length, sourceFiles, meaning: CATALOG_MEANING, validator: VALIDATOR_PATH }, rows },
    warnings, errors,
  };
}

/** Merge normalised log rows into an existing log store. Frozen fields must match; sources union; text is kept (corrections are explicit). */
export function mergeLog(existing, incoming, { asOf, sourceFile }) {
  const warnings = [];
  const errors = [];
  const byId = new Map((existing?.rows ?? []).map((r) => [r.id, r]));
  if (existing?.meta?.asOf && asOf < existing.meta.asOf) errors.push(`import asOf ${asOf} is older than the store's asOf ${existing.meta.asOf}`);
  const merged = new Map(byId);
  for (const r of incoming) {
    const prior = byId.get(r.id);
    if (!prior) {
      merged.set(r.id, ordered({ ...r, loggedOn: asOf, releaseWatchId: null, corrections: [] }, LOG_ROW_KEYS));
      continue;
    }
    for (const k of LOG_FROZEN_FIELDS.filter((x) => x !== "loggedOn")) {
      if (canonicalJson(prior[k]) !== canonicalJson(r[k])) errors.push(`log row ${r.id}: frozen field "${k}" differs from the committed value (${JSON.stringify(prior[k])} vs ${JSON.stringify(r[k])})`);
    }
    for (const k of ["summary", "safetyNote", "catalogId", "safetyOrWelfareRelevant"]) {
      if (canonicalJson(prior[k]) !== canonicalJson(r[k])) warnings.push(`log row ${r.id}: input "${k}" differs from the committed value; kept the committed value (a text change needs a corrections[] entry)`);
    }
    merged.set(r.id, ordered({ ...prior, sources: unionSources(prior.sources, r.sources) }, LOG_ROW_KEYS));
  }
  const sourceFiles = [...(existing?.meta?.sourceFiles ?? []).filter((f) => f.path !== sourceFile.path), sourceFile].sort((a, b) => (a.path < b.path ? -1 : 1));
  const rows = sortLogRows([...merged.values()]);
  return {
    store: { meta: { schemaVersion: SCHEMA_VERSION, asOf, rowCount: rows.length, sourceFiles, meaning: LOG_MEANING, validator: VALIDATOR_PATH }, rows },
    warnings, errors,
  };
}

/** MW-X3: the registry and release-watch stores must be byte-unchanged by an import. Pure over two hash lists. */
export function guardProblems(before, after) {
  const names = ["registry-v1.json", "releases-v1.json"];
  return names.flatMap((n, i) => (before[i] === after[i] ? [] : [`MW-X3: ${n} changed during the import (the import never modifies the registry or the release-watch store)`]));
}
