/**
 * release-watch-state.mjs — pure per-source dedupe state for
 * release-watch-l1.mjs (task requirement 4).
 *
 * Two independent things must never be re-offered to a human reviewer:
 *   1. An item this detector has already reported in a previous scan
 *      (dedupe against per-source state, this module's main job).
 *   2. An item that has since been promoted into a confirmed release in
 *      `releases-v1.json` (`filterAlreadyPromoted` / `extractPromotedLinks`
 *      — read-only against the published store; this module never writes
 *      to it).
 *
 * Everything here is a pure function over plain data. The one piece of I/O
 * (reading/writing the state file) belongs to the CLI in
 * release-watch-l1.mjs, at
 * `research/model-index/release-watch/state/source-state.json` — a
 * subdirectory of the scan-record tree, deliberately, so
 * `validate-model-releases.mjs`'s `readdirSync(SCAN_RECORD_DIR).filter(f =>
 * f.endsWith(".json"))` (which treats every top-level `.json` file in that
 * directory as a scan record) never sees this file. Nesting it one level
 * down is a correctness requirement, not a preference.
 */

/**
 * @returns {{schemaVersion: string, sources: Record<string, object>}}
 */
export function emptySourceState() {
  return { schemaVersion: "1.0", sources: {} };
}

/**
 * Dedupe key for one item. Prefers the link (the strongest available
 * identity for a web item); falls back to a source+title+date composite
 * when a link is unavailable — which in practice only happens for items
 * this module's own fail-closed extraction has already dropped, since a
 * `candidates[]` entry always carries a link (see release-watch-parse.mjs
 * `extractCandidates`). The fallback exists so `dropped_candidates[]`
 * entries (which may lack a link, e.g. the "no-link" drop reason) can still
 * be deduped across runs.
 *
 * @param {{link?: string|null, source_id?: string, title?: string|null, published_at?: string|null}} item
 * @returns {string}
 */
export function candidateKey(item) {
  const link = typeof item?.link === "string" && item.link.trim() ? item.link.trim() : null;
  if (link) return `link:${link}`;
  return `td:${item?.source_id ?? ""}::${item?.title ?? ""}::${item?.published_at ?? ""}`;
}

const MAX_SEEN_KEYS_PER_SOURCE = 200;

/**
 * Splits `candidates` into ones not previously seen for `sourceId` and ones
 * already recorded in `state` — the latter move to `dropped[]` with a named
 * reason instead of being silently discarded, matching the nightly entity
 * scanner's "itemize what was dropped and why" convention
 * (`research/scans/*.json` → `dropped_candidates`).
 *
 * @param {Array<object>} candidates
 * @param {{sources?: Record<string, {seenKeys?: string[]}>}} state
 * @param {string} sourceId
 * @returns {{fresh: Array<object>, dropped: Array<{source_id: string, reason: string, title: string|null, link: string|null}>}}
 */
export function dedupeAgainstState(candidates, state, sourceId) {
  const seen = new Set(Array.isArray(state?.sources?.[sourceId]?.seenKeys) ? state.sources[sourceId].seenKeys : []);
  const fresh = [];
  const dropped = [];
  for (const c of Array.isArray(candidates) ? candidates : []) {
    const key = candidateKey(c);
    if (seen.has(key)) {
      dropped.push({
        source_id: sourceId,
        reason: `already-seen: this item was recorded in a previous scan (dedupe key "${key}") — repeat runs do not re-report it`,
        title: c?.title ?? null,
        link: c?.link ?? null,
      });
    } else {
      fresh.push(c);
    }
  }
  return { fresh, dropped };
}

/**
 * Collects every evidence `source_url` already recorded on a CONFIRMED
 * release in `releases-v1.json`. Read-only: this module never writes to
 * that file (it is not owned by this task — see the release-watch backend
 * task's file-ownership boundary).
 *
 * @param {{releases?: Array<{evidence?: Array<{source_url?: string}>}>}} releaseStore
 * @returns {Set<string>}
 */
export function extractPromotedLinks(releaseStore) {
  const links = new Set();
  for (const release of Array.isArray(releaseStore?.releases) ? releaseStore.releases : []) {
    for (const ev of Array.isArray(release?.evidence) ? release.evidence : []) {
      if (typeof ev?.source_url === "string" && ev.source_url.trim()) links.add(ev.source_url.trim());
    }
  }
  return links;
}

/**
 * Splits `candidates` into ones whose link is not already evidence on a
 * confirmed release, and ones that are — "a candidate already promoted is
 * not re-offered" (task requirement 4).
 *
 * @param {Array<object>} candidates
 * @param {Set<string>} promotedLinks
 * @returns {{fresh: Array<object>, dropped: Array<{source_id: string, reason: string, title: string|null, link: string|null}>}}
 */
export function filterAlreadyPromoted(candidates, promotedLinks) {
  const fresh = [];
  const dropped = [];
  const links = promotedLinks instanceof Set ? promotedLinks : new Set(Array.isArray(promotedLinks) ? promotedLinks : []);
  for (const c of Array.isArray(candidates) ? candidates : []) {
    if (c?.link && links.has(c.link)) {
      dropped.push({
        source_id: c.source_id ?? null,
        reason: `already-promoted: link "${c.link}" already appears as evidence on a confirmed release in releases-v1.json — not re-offered`,
        title: c?.title ?? null,
        link: c.link,
      });
    } else {
      fresh.push(c);
    }
  }
  return { fresh, dropped };
}

/**
 * Advances one source's remembered state given every item this run either
 * emitted as a candidate or recorded as dropped for that source (both
 * count for dedupe purposes — an already-dropped item should stay dropped
 * on the next run too, not flip to "new" because it was never added to
 * `seenKeys`). Pure: returns a NEW state object, never mutates its input.
 *
 * @param {{schemaVersion?: string, sources?: Record<string, object>}} state
 * @param {string} sourceId
 * @param {Array<object>} itemsThisRun items with at least a `link` or
 *   (`source_id`,`title`,`published_at`) — candidates and/or dropped
 *   entries for this source, from THIS run only
 * @param {{retrievedAt?: string|null, etag?: string|null, lastModified?: string|null}} [fetchMeta]
 * @returns {{schemaVersion: string, sources: Record<string, object>}}
 */
export function nextSourceState(state, sourceId, itemsThisRun, fetchMeta = {}) {
  const base = state && typeof state === "object" ? state : emptySourceState();
  const prior = base.sources?.[sourceId] && typeof base.sources[sourceId] === "object" ? base.sources[sourceId] : { seenKeys: [] };
  const priorKeys = Array.isArray(prior.seenKeys) ? prior.seenKeys : [];
  const newKeys = (Array.isArray(itemsThisRun) ? itemsThisRun : []).map(candidateKey);
  const mergedKeys = [...priorKeys, ...newKeys.filter((k) => !priorKeys.includes(k))].slice(-MAX_SEEN_KEYS_PER_SOURCE);

  const newestPublishedAt = (Array.isArray(itemsThisRun) ? itemsThisRun : []).reduce((max, it) => {
    const d = typeof it?.published_at === "string" ? it.published_at : null;
    return d && (!max || d > max) ? d : max;
  }, prior.lastItemPublishedAt ?? null);

  const nextEntry = {
    seenKeys: mergedKeys,
    lastCheckedAt: fetchMeta.retrievedAt ?? prior.lastCheckedAt ?? null,
    etag: fetchMeta.etag ?? prior.etag ?? null,
    lastModified: fetchMeta.lastModified ?? prior.lastModified ?? null,
    lastItemPublishedAt: newestPublishedAt,
  };

  return {
    schemaVersion: base.schemaVersion ?? "1.0",
    sources: { ...(base.sources ?? {}), [sourceId]: nextEntry },
  };
}

/**
 * Convenience wrapper: advances state for every source touched by one
 * completed scan record (`candidates[]`, `dropped_candidates[]`, and any
 * `sources_reached` with neither — a reached source that produced nothing
 * still gets a `lastCheckedAt` bump). Pure; the CLI is the only caller that
 * persists the result to disk.
 *
 * @param {object} state prior state (or emptySourceState())
 * @param {{candidates?: Array<object>, dropped_candidates?: Array<object>, sources_reached?: string[]}} scanRecord
 * @param {Date} now
 * @returns {object} the next state
 */
export function updateStateFromScanRecord(state, scanRecord, now) {
  let nextState = state && typeof state === "object" ? state : emptySourceState();
  const bySource = new Map();
  const addItem = (item) => {
    const sourceId = item?.source_id;
    if (typeof sourceId !== "string" || !sourceId) return;
    const list = bySource.get(sourceId) ?? [];
    list.push(item);
    bySource.set(sourceId, list);
  };
  for (const c of Array.isArray(scanRecord?.candidates) ? scanRecord.candidates : []) addItem(c);
  for (const d of Array.isArray(scanRecord?.dropped_candidates) ? scanRecord.dropped_candidates : []) addItem(d);
  for (const sourceId of Array.isArray(scanRecord?.sources_reached) ? scanRecord.sources_reached : []) {
    if (!bySource.has(sourceId)) bySource.set(sourceId, []);
  }

  const retrievedAt = now instanceof Date ? now.toISOString() : null;
  for (const [sourceId, items] of bySource) {
    nextState = nextSourceState(nextState, sourceId, items, { retrievedAt });
  }
  return nextState;
}
