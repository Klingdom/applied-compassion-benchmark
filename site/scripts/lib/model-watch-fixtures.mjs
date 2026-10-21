/**
 * model-watch-fixtures.mjs -- synthetic, valid AI Model Watch data for tests. Fictional providers and models only
 * ("Acme", "Zeta"); nothing here is research output. Used by test-model-watch.mjs and test-model-watch-html.mjs.
 */

import {
  CATALOG_MEANING, LOG_MEANING, VALIDATOR_PATH, SCHEMA_VERSION, CATALOG_ROW_KEYS, LOG_ROW_KEYS, ordered,
  deriveLogId, sortCatalogRows, sortLogRows,
} from "./model-watch-core.mjs";
import { compileEdition, buildEditionsManifest } from "./model-watch-edition.mjs";

export const NOW = new Date("2026-10-16T12:00:00Z");
export const SHA = "a".repeat(64);

export const src = (over = {}) => ({
  url: "https://example.com/acme/alpha-1", title: "Acme docs: Alpha 1", sourceType: "documentation", accessed: "2026-10-16", ...over,
});

export function catRow(over = {}) {
  return ordered({
    id: "acme-alpha-1", name: "Alpha 1", provider: "Acme", providerSlug: "acme", family: "Alpha", releaseDate: "2026-09-10",
    status: "current", access: ["api"], licence: "Proprietary", modalities: ["text", "image"], contextWindowTokens: 128000,
    parameterCount: null, notes: "Listed in the provider documentation.", sources: [src()], benchmarkLocalTag: null,
    firstListedOn: "2026-10-16", lastVerifiedOn: "2026-10-16", ...over,
  }, CATALOG_ROW_KEYS);
}

export function logRow(over = {}) {
  const base = {
    date: "2026-09-10", provider: "Acme", providerSlug: "acme", modelName: "Alpha 1", catalogId: "acme-alpha-1", kind: "new-model",
    summary: "Alpha 1 was released in the API.", safetyOrWelfareRelevant: false, safetyNote: null, sources: [src()],
    loggedOn: "2026-10-16", releaseWatchId: null, corrections: [], ...over,
  };
  return ordered({ id: over.id ?? deriveLogId(base), ...base }, LOG_ROW_KEYS);
}

export const mkCatalog = (rows = [catRow()], asOf = "2026-10-16") => ({
  meta: { schemaVersion: SCHEMA_VERSION, asOf, rowCount: rows.length, sourceFiles: [{ path: "research/ai-model-tracker/catalog-2026-10-16.json", sha256: SHA }], meaning: CATALOG_MEANING, validator: VALIDATOR_PATH },
  rows: sortCatalogRows(rows),
});

export const mkLog = (rows = [logRow()], asOf = "2026-10-16") => ({
  meta: { schemaVersion: SCHEMA_VERSION, asOf, rowCount: rows.length, sourceFiles: [{ path: "research/ai-model-tracker/releases-2026-10-16.json", sha256: SHA }], meaning: LOG_MEANING, validator: VALIDATOR_PATH },
  rows: sortLogRows(rows),
});

/** A richer pair: two providers, one safety-relevant release, one policy row with no model. */
export function richStores() {
  const catalog = mkCatalog([
    catRow(),
    catRow({ id: "acme-alpha-2", name: "Alpha 2", releaseDate: "2026-10-01", access: ["api", "consumer-app"] }),
    catRow({ id: "zeta-open-7b", name: "Zeta Open 7B", provider: "Zeta Labs", providerSlug: "zeta-labs", family: "Zeta", licence: "Apache-2.0", access: ["open-weights"], parameterCount: "7B", benchmarkLocalTag: "zeta:7b", sources: [src({ url: "https://example.com/zeta/open-7b", sourceType: "model-card", title: "Zeta Open 7B model card" })] }),
  ]);
  const log = mkLog([
    logRow(),
    logRow({ date: "2026-10-01", modelName: "Alpha 2", catalogId: "acme-alpha-2", kind: "new-version", summary: "Alpha 2 was released.", safetyOrWelfareRelevant: true, safetyNote: "The system card describes self-harm evaluations.", sources: [src({ url: "https://example.com/acme/alpha-2-system-card", sourceType: "system-card", title: "Alpha 2 system card" })] }),
    logRow({ date: "2026-09-20", provider: "Zeta Labs", providerSlug: "zeta-labs", modelName: "Zeta Open 7B", catalogId: "zeta-open-7b", kind: "open-weights-release", summary: "Weights published under Apache-2.0.", sources: [src({ url: "https://example.com/zeta/open-7b", sourceType: "model-card", title: "Zeta Open 7B model card" })] }),
    logRow({ date: "2026-09-25", modelName: null, catalogId: null, kind: "policy", summary: "Usage policy update published.", sources: [src({ url: "https://example.com/acme/usage-policy", sourceType: "documentation", title: "Acme usage policy" })] }),
  ]);
  return { catalog, log };
}

export const QUEUE = {
  updated_at: "2026-10-13",
  sourceSha256: SHA,
  entries: [
    { tag: "zeta:7b", developer: "Zeta Labs", status: "queued" },
    { tag: "old:3b", developer: "Old Co", status: "measured" },
    { tag: "skip:1b", developer: "Skip Co", status: "skipped" },
    { tag: "other:2b", developer: "Acme", status: "queued" },
  ],
};

export const sourceFor = (over = {}) => ({
  date: "2026-10-16",
  window: { from: "2026-09-01", to: "2026-10-16" },
  lead: "{{RELEASE_COUNT}} releases were logged across {{WINDOW_DAYS}} days, including Alpha 2 and Zeta Open 7B; {{DISCLOSURE_COUNT}} carried a provider safety disclosure.",
  coverage: { scanned: ["Provider newsrooms"], notScanned: ["Social media"] },
  measuredNote: null,
  corrections: [],
  ...over,
});

export function compiled(over = {}, stores = richStores(), renderable = []) {
  const { edition, errors } = compileEdition({ source: sourceFor(over), log: stores.log, catalog: stores.catalog, queueSnapshot: QUEUE, renderable });
  if (errors.length) throw new Error(`fixture edition failed to compile: ${errors.join(" | ")}`);
  return edition;
}

export const stateWith = (edition, stores = richStores(), extra = {}) => ({
  catalog: stores.catalog, log: stores.log,
  editions: edition ? { [`${edition.date}.json`]: edition } : {},
  manifest: buildEditionsManifest(edition ? [edition] : []),
  ...extra,
});

export const clone = (x) => JSON.parse(JSON.stringify(x));
