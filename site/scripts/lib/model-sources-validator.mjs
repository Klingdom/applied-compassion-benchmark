/**
 * model-sources-validator.mjs — pure validation logic for the CB-MODEL
 * declared source registry (`docs/ARCHITECTURE_RELEASE_WATCH_AND_BYO.md`
 * §2.7, the L1 "degraded path, designed explicitly" schema block).
 *
 * Mirrors the pattern used by scripts/lib/model-releases-validator.mjs and
 * scripts/lib/model-registry-validator.mjs: one pure module with no I/O and
 * no process.exit, shared unchanged by the CLI (validate-model-sources.mjs)
 * and the fixture tests (test-model-sources.mjs).
 *
 * ── The rule this file exists to enforce ─────────────────────────────────
 * §2.7: "L1 is the architecturally important level, and it should be built
 * before any scanner." A declared source registry converts detection from
 * open-ended search into enumerable retrieval — but only if the registry
 * itself is trustworthy: no duplicate ids, no non-verifiable URLs, and a
 * `quorumRequired` that can never overstate what the registry can actually
 * deliver (it must never exceed the number of tier-primary sources that
 * exist to meet it).
 *
 * §2.7 (store note, ratified verbatim): "EMPTY — no source has been
 * registered. A source is added by a human from a verified URL, never
 * inferred." This module validates the registry; it never populates it.
 *
 * ── Checks implemented here (S-numbered, this file's own series) ─────────
 * S1  — shape: `meta` object, `sources` array (an empty registry passes)
 * S2  — meta.sourceCount === sources.length
 * S3  — meta.quorumRequired is null, or a non-negative integer that does
 *       not exceed the count of tier === "primary" sources
 * S4  — every source has all required non-empty string fields
 * S5  — source_type is one of the nine declared enum values
 * S6  — tier is one of "primary" | "secondary"
 * S7  — retrieval is exactly "http-get" (the only method §2.7 declares)
 * S8  — url is an absolute https:// URL
 * S9  — source_id equals its derivation `src-<slugify(provider)>-<source_type>`
 * S10 — source_id is unique across the file
 * S11 — added_at / last_retrieved_at are valid ISO datetimes, not in the
 *       future when present; last_retrieved_at may be null (never fetched)
 */

import { slugify } from "./model-registry-validator.mjs";

export { slugify };

// ── Schema enums (docs/ARCHITECTURE_RELEASE_WATCH_AND_BYO.md §2.7) ─────────

export const SOURCE_TYPES = [
  "announcement",
  "model_card",
  "system_card",
  "api_changelog",
  "model_registry",
  "repository",
  "product_release_notes",
  "status_feed",
  "incident_report",
];

export const TIERS = ["primary", "secondary"];

// The only retrieval method §2.7 declares. A future addition (e.g. an RSS
// pull) should extend this list deliberately, not be inferred from a value
// that happens to parse.
export const RETRIEVAL_METHODS = ["http-get"];

const REQUIRED_STRING_FIELDS = ["source_id", "provider", "source_type", "url", "tier", "added_at", "added_by", "retrieval"];

// ── source_id derivation (§2.7: "src-<provider>-<type>") ──────────────────

/**
 * @param {{provider?: string, source_type?: string}} source
 * @returns {string}
 */
export function computeSourceId(source) {
  return `src-${slugify(source?.provider)}-${source?.source_type ?? ""}`;
}

// ── date/format helpers ─────────────────────────────────────────────────────

function isIsoDateTime(value) {
  return typeof value === "string" && value.trim() !== "" && !Number.isNaN(Date.parse(value));
}

function isFuture(value, now) {
  return isIsoDateTime(value) && new Date(value).getTime() > now.getTime();
}

function isAbsoluteHttpsUrl(value) {
  if (typeof value !== "string" || value.trim() === "") return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function describeSource(source, index) {
  return typeof source?.source_id === "string" && source.source_id ? `source_id="${source.source_id}"` : `sources[${index}]`;
}

// ── Single-source structural validation (S4–S9, S11) ────────────────────────

function validateSourceShape(source, index, fail, now) {
  const label = describeSource(source, index);

  if (!source || typeof source !== "object") {
    fail(`Entry at index ${index} is not an object`);
    return;
  }

  // ── S4: required non-empty string fields
  for (const field of REQUIRED_STRING_FIELDS) {
    if (typeof source[field] !== "string" || source[field].trim() === "") {
      fail(`Source ${label}: missing/empty required string field "${field}"`);
    }
  }

  // ── S5: source_type enum
  if (!SOURCE_TYPES.includes(source.source_type)) {
    fail(`Source ${label}: source_type "${source.source_type}" is not one of ${SOURCE_TYPES.join(", ")}`);
  }

  // ── S6: tier enum
  if (!TIERS.includes(source.tier)) {
    fail(`Source ${label}: tier "${source.tier}" is not one of ${TIERS.join(", ")}`);
  }

  // ── S7: retrieval enum (single legal value today)
  if (!RETRIEVAL_METHODS.includes(source.retrieval)) {
    fail(`Source ${label}: retrieval "${source.retrieval}" is not one of ${RETRIEVAL_METHODS.join(", ")}`);
  }

  // ── S8: url must be absolute https
  if (!isAbsoluteHttpsUrl(source.url)) {
    fail(`Source ${label}: url "${source.url}" is not an absolute https:// URL — a source must be independently verifiable by a reader`);
  }

  // ── S9: source_id derivation
  if (typeof source.source_id === "string" && source.source_id) {
    const expected = computeSourceId(source);
    if (source.source_id !== expected) {
      fail(`Source ${label}: source_id "${source.source_id}" does not match the deterministic derivation "${expected}" of (provider, source_type) — source_id must never be hand-assigned`);
    }
  } else {
    fail(`Source at index ${index}: source_id is required`);
  }

  // ── S11: added_at / last_retrieved_at date sanity
  if (typeof source.added_at === "string" && source.added_at.trim() !== "") {
    if (!isIsoDateTime(source.added_at)) {
      fail(`Source ${label}: added_at "${source.added_at}" is not a valid ISO datetime`);
    } else if (isFuture(source.added_at, now)) {
      fail(`Source ${label}: added_at "${source.added_at}" is in the future`);
    }
  }
  if (source.last_retrieved_at !== null && source.last_retrieved_at !== undefined) {
    if (!isIsoDateTime(source.last_retrieved_at)) {
      fail(`Source ${label}: last_retrieved_at "${source.last_retrieved_at}" is not a valid ISO datetime (use null if the source has never been fetched)`);
    } else if (isFuture(source.last_retrieved_at, now)) {
      fail(`Source ${label}: last_retrieved_at "${source.last_retrieved_at}" is in the future`);
    }
  }
}

// ── Top-level: validate one source registry snapshot ────────────────────────

/**
 * @param {{meta?: object, sources?: Array<object>}} store
 * @param {{now?: Date}} [opts]
 * @returns {{failures: string[], warnings: string[], checksRun: number, sourceCount: number}}
 */
export function validateSourceRegistry(store, opts = {}) {
  const failures = [];
  const warnings = [];
  let checksRun = 0;
  const fail = (m) => failures.push(m);
  const check = () => checksRun++;
  const now = opts.now instanceof Date ? opts.now : new Date();

  // ── S1: shape
  check();
  if (!store || typeof store !== "object") {
    fail("Source registry is not an object");
    return { failures, warnings, checksRun, sourceCount: 0 };
  }

  check();
  const meta = store.meta && typeof store.meta === "object" ? store.meta : null;
  if (!meta) {
    fail("Missing top-level 'meta' object");
  }

  const sources = Array.isArray(store.sources) ? store.sources : null;
  check();
  if (sources === null) {
    fail("Missing top-level 'sources' array (use [] for an empty registry, which is explicitly valid)");
    return { failures, warnings, checksRun, sourceCount: 0 };
  }

  // ── S2: meta.sourceCount === sources.length
  if (meta) {
    check();
    if (meta.sourceCount !== sources.length) {
      fail(`meta.sourceCount (${meta.sourceCount}) does not match sources.length (${sources.length})`);
    }
  }

  // An empty registry is explicitly valid — must pass cleanly with zero
  // sources reported, mirroring the empty-registry/empty-release-store
  // precedent set by the other two validators in this data layer.
  if (sources.length > 0) {
    for (let i = 0; i < sources.length; i++) {
      check();
      validateSourceShape(sources[i], i, fail, now);
    }

    // ── S10: source_id uniqueness across the file
    const byId = new Map();
    for (const source of sources) {
      if (typeof source?.source_id !== "string" || !source.source_id) continue;
      const list = byId.get(source.source_id) ?? [];
      list.push(source);
      byId.set(source.source_id, list);
    }
    for (const [id, list] of byId) {
      check();
      if (list.length > 1) {
        fail(`source_id collision: "${id}" is used by ${list.length} sources — a duplicate row or a genuine (provider, source_type) collision that must be disambiguated`);
      }
    }
  }

  // ── S3: quorumRequired sanity, checked against the ACTUAL tier-primary count
  if (meta) {
    check();
    const primaryCount = sources.filter((s) => s?.tier === "primary").length;
    if (meta.quorumRequired !== null && meta.quorumRequired !== undefined) {
      if (typeof meta.quorumRequired !== "number" || !Number.isInteger(meta.quorumRequired) || meta.quorumRequired < 0) {
        fail(`meta.quorumRequired "${meta.quorumRequired}" must be null or a non-negative integer`);
      } else if (meta.quorumRequired > primaryCount) {
        fail(`meta.quorumRequired (${meta.quorumRequired}) exceeds the number of tier-primary sources actually registered (${primaryCount}) — a scan can never meet a quorum the registry cannot supply`);
      }
    }
  }

  return { failures, warnings, checksRun, sourceCount: sources.length };
}
