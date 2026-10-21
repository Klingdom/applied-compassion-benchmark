/**
 * model-watch-core.mjs -- constants and pure helpers shared by the AI Model Watch
 * validator, importer, edition compiler and data builder.
 *
 * Spec: docs/DATA_MODEL_AI_MODEL_WATCH.md. No I/O here.
 *
 * DOCUMENTED EXTENSIONS to the data-model enums (found in the real 2026-10-16 research
 * files; each is a verifiable lifecycle/format fact, never a quality judgement):
 *   status        + "superseded"
 *   modalities    + "pdf", "document"
 *   SourceType    + "primary", "secondary" (the research files classify sources only this coarsely;
 *                   "primary" counts as primary, "secondary" does not)
 *   kind          + "policy" (provider policy / outside-evaluator-access notices)
 *   modelName     may be null when kind === "policy" (an organisation-level notice names no model)
 *   releaseDate   may be "YYYY-MM" (month-level date when the sources give no day; the day is never guessed)
 */

import { createHash } from "node:crypto";
import { slugify } from "./model-registry-validator.mjs";

export { slugify };

export const SCHEMA_VERSION = "1.0";
export const VALIDATOR_PATH = "site/scripts/lib/model-watch-validator.mjs";
export const CATALOG_MEANING = "Models listed from cited public sources. A listing is not an evaluation; no row carries a score.";
export const LOG_MEANING = "Cited desk-research log of announcements. Not the release-watch store (releases-v1.json); counts are never combined.";
export const INDEPENDENCE_LINE =
  "Compassion Benchmark is independent. No provider pays for inclusion, coverage, testing priority, wording or a score, and corrections are dated and public.";
export const DISCLOSURE_LABEL = "Provider's own disclosure, restated";
export const NO_SCAN_STATEMENT = "No scan ran for this window";
export const MEASURED_EMPTY_NOTE = "Nothing published in this window.";
export const MEASURED_DEFAULT_NOTE = "Unofficial pilot reports published in this window. They are linked, not summarised, and carry no figure here.";
export const NO_MODEL_SEGMENT = "no-model";

export const CATALOG_STATUS = ["current", "preview", "deprecated", "retired", "superseded"];
export const ACCESS = ["open-weights", "api", "consumer-app", "restricted"];
export const MODALITIES = ["text", "image", "audio", "video", "code", "pdf", "document"];
export const SOURCE_TYPES = [
  "provider-announcement", "model-card", "system-card", "documentation", "technical-report", "licence", "news", "other", "primary", "secondary",
];
export const PRIMARY_SOURCE_TYPES = new Set(["provider-announcement", "model-card", "system-card", "documentation", "technical-report", "primary"]);
export const LOG_KINDS = [
  "new-model", "new-version", "update", "open-weights-release", "api-availability", "deprecation", "safety-documentation", "policy",
];

export const CATALOG_ROW_KEYS = [
  "id", "name", "provider", "providerSlug", "family", "releaseDate", "status", "access", "licence", "modalities",
  "contextWindowTokens", "parameterCount", "notes", "sources", "benchmarkLocalTag", "firstListedOn", "lastVerifiedOn",
];
export const LOG_ROW_KEYS = [
  "id", "date", "provider", "providerSlug", "modelName", "catalogId", "kind", "summary", "safetyOrWelfareRelevant",
  "safetyNote", "sources", "loggedOn", "releaseWatchId", "corrections",
];
export const SOURCE_KEYS = ["url", "title", "sourceType", "accessed"];
export const LOG_FROZEN_FIELDS = ["id", "date", "provider", "providerSlug", "modelName", "kind", "loggedOn"];
export const RELEASE_WATCH_KEYS = ["release_id", "registry_id", "lifecycle", "evidence", "detected_in_scan", "evaluation_disposition"];

export const EDITION_KEYS = [
  "date", "title", "window", "asOf", "lead", "coverage", "coverageStatement", "releases", "disclosures", "measured", "queue",
  "corrections", "sources", "independence", "contentHash",
];
export const EDITION_TOKENS = ["RELEASE_COUNT", "DISCLOSURE_COUNT", "WINDOW_DAYS"];
export const LEAD_MAX_WORDS = 90;
export const FIRST_EDITION = { date: "2026-10-16", from: "2026-09-01", to: "2026-10-16" };
export const FRESHNESS_DAYS = 10;

export const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
export const ISO_MONTH_RE = /^\d{4}-\d{2}$/;
export const CATALOG_ID_RE = /^[a-z0-9]+(?:[.-][a-z0-9]+)*$/;
export const KEBAB_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const SHA256_RE = /^[0-9a-f]{64}$/;

export const isIsoDate = (s) => {
  if (typeof s !== "string" || !ISO_DATE_RE.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
};
export const isIsoMonth = (s) => typeof s === "string" && ISO_MONTH_RE.test(s) && Number(s.slice(5)) >= 1 && Number(s.slice(5)) <= 12;
/** First day a (possibly month-level) date can denote; used for the "not in the future" test. */
export const earliestDay = (s) => (isIsoMonth(s) ? `${s}-01` : s);

export const todayIso = (now = new Date()) => now.toISOString().slice(0, 10);

export const isHttps = (u) => {
  if (typeof u !== "string" || !/^https:\/\//.test(u)) return false;
  try { return new URL(u).protocol === "https:"; } catch { return false; }
};

export const sha256Hex = (s) => createHash("sha256").update(s).digest("hex");
/** Line endings normalised so a hash taken on Windows equals one taken on Linux. */
export const sha256Text = (s) => sha256Hex(String(s).replace(/\r\n?/g, "\n"));

export const cmpEn = (a, b) => String(a).localeCompare(String(b), "en", { sensitivity: "base" });

export function sortCatalogRows(rows) {
  return [...rows].sort((a, b) => cmpEn(a.provider, b.provider) || cmpEn(a.name, b.name) || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
}
export function sortLogRows(rows) {
  return [...rows].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
}

/** log id: <date>--<provider slug>--<model slug>--<kind> (never authored). */
export function deriveLogId(row) {
  const model = row.modelName == null || row.modelName === "" ? NO_MODEL_SEGMENT : slugify(row.modelName);
  return `${row.date}--${slugify(row.providerSlug)}--${model}--${row.kind}`;
}

/** JSON with sorted keys at every depth: the canonical form hashed for contentHash. */
export function canonicalJson(x) {
  if (Array.isArray(x)) return `[${x.map(canonicalJson).join(",")}]`;
  if (x && typeof x === "object") {
    return `{${Object.keys(x).sort().map((k) => `${JSON.stringify(k)}:${canonicalJson(x[k])}`).join(",")}}`;
  }
  return JSON.stringify(x);
}

/** Serialise to the on-disk form: 2-space indent, trailing newline. */
export const serialise = (x) => `${JSON.stringify(x, null, 2)}\n`;

/** Rebuild an object with keys in schema order (unknown keys are dropped by the caller beforehand). */
export const ordered = (obj, keys) => Object.fromEntries(keys.filter((k) => k in obj).map((k) => [k, obj[k]]));

export const orderSource = (s) => ordered(s, SOURCE_KEYS);

/** Inclusive day count between two ISO dates. */
export function windowDays(from, to) {
  const a = Date.parse(`${from}T00:00:00Z`);
  const b = Date.parse(`${to}T00:00:00Z`);
  return Math.round((b - a) / 86400000) + 1;
}
export function daysBetween(a, b) {
  return Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86400000);
}

/** Union sources by URL, keeping the first occurrence (stable). */
export function unionSources(...lists) {
  const seen = new Set();
  const out = [];
  for (const list of lists) for (const s of list ?? []) {
    if (!seen.has(s.url)) { seen.add(s.url); out.push(s); }
  }
  return out;
}

export const wordCount = (s) => (String(s).trim().match(/\S+/g) ?? []).length;
