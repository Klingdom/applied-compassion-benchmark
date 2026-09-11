/**
 * model-registry-validator.mjs — pure validation logic for the CB-MODEL
 * immutable model registry (`.benchmark-ops/MODEL_REGISTRY.md` schema;
 * `site/src/data/model-benchmark/registry-v1.json` the store).
 *
 * Mirrors the pattern used by scripts/lib/task-bank-validator.mjs and
 * scripts/lib/product-separation.mjs: one pure module with no I/O and no
 * process.exit, shared unchanged by the CLI (validate-model-registry.mjs)
 * and the fixture tests (test-model-registry.mjs). No drift between "what
 * ships" and "what is tested".
 *
 * ── The rule this file exists to enforce ─────────────────────────────────
 * `02-RELEASE-INTELLIGENCE-SUPER-PROMPT.md`: "A provider reusing a model
 * name does not permit overwriting the prior record. Create a dated
 * snapshot when behavior materially changes."
 *
 * A benchmark whose model identities are mutable cannot make a reproducible
 * claim. This module makes overwriting mechanically impossible to pass
 * validation, not merely discouraged in prose.
 *
 * ── Two levels of check ───────────────────────────────────────────────────
 * 1. validateRegistryState(registry, opts) — validates ONE registry snapshot
 *    in isolation: schema shape, per-entry required fields and evidence,
 *    registry_id derivation and uniqueness, developer→AI Labs Index join
 *    cardinality. This is what the CLI runs against the committed file on
 *    every build, and it already catches the "reused name, duplicated
 *    instead of edited" shape of the overwrite defect (two entries whose
 *    identity fields collide produce the same registry_id, which fails
 *    uniqueness).
 * 2. validateRegistryTransition(priorRegistry, nextRegistry) — validates a
 *    PROPOSED CHANGE: compares two full registry states by registry_id and
 *    fails if any existing entry's frozen fields differ between them (the
 *    "edited in place" shape of the overwrite defect — no new entry is
 *    created, an old one is silently rewritten) or if an existing entry
 *    disappears (append-only also forbids deletion). The CLI runs this
 *    opportunistically against the last git-committed copy when available;
 *    the fixture tests exercise it directly and unconditionally.
 */

import { canonicalizeEntityName } from "./product-separation.mjs";

// ── Schema enums (site/.benchmark-ops/MODEL_REGISTRY.md) ────────────────────

export const PRODUCT_SURFACES = ["consumer", "api_default", "base", "fine_tune", "agent", "deployed_system"];
export const SYSTEM_PROMPT_STATUSES = ["known", "unknown", "none", "provider_supplied"];
export const MODERATION_LAYERS = ["present", "absent", "unknown"];
export const CLAIM_CLASSES = ["fact", "provider_claim", "evaluator_observation", "inference", "unresolved"];

// `status` and `superseded_by` are CB-MODEL operational additions, not in
// the original MODEL_REGISTRY.md field table. They exist to give the
// invariant "only explicitly mutable fields (e.g. a status transition, a
// superseded-by pointer) may change" (the task brief that commissioned this
// validator) a concrete, checkable shape. Documented here rather than left
// implicit so a future reader does not mistake this for silent schema drift
// from the source-of-truth markdown.
export const REGISTRY_STATUSES = ["candidate", "active", "superseded", "retracted"];

// ── Frozen vs. mutable fields (the append-only contract) ────────────────────
//
// FROZEN: identity and evidence. Once an entry exists with a given
// registry_id, none of these may ever change value across a registry
// transition. A change here is a blocking failure — full stop, no
// "materiality" exception — because the whole point of the registry is that
// a `registry_id`'s meaning cannot drift. If behavior genuinely changed, the
// correct action is a NEW entry (new registry_id) with lineage.predecessor
// pointing back, not a mutation of this one.
export const FROZEN_FIELDS = [
  "registry_id",
  "developer",
  "family",
  "exact_snapshot",
  "aliases",
  "endpoint",
  "product_surface",
  "access_tier",
  "region",
  "system_prompt_status",
  "moderation_layer",
  "tools",
  "sampling",
  "first_seen",
  "lineage",
  "evidence",
  "claim_class",
];

// MUTABLE: lifecycle bookkeeping only. Nothing here describes what the
// snapshot *is* or what evidence supports it — only where it currently
// stands in the registry's own workflow.
export const MUTABLE_FIELDS = ["status", "superseded_by"];

// APPEND-ONLY GROWABLE: not frozen (it legitimately grows after an entry is
// created — the same snapshot gets re-tested on later dates) but not freely
// mutable either. A transition may only ADD dates, never remove or alter an
// existing one.
export const APPEND_ONLY_GROWABLE_FIELDS = ["test_dates"];

const REQUIRED_STRING_FIELDS = ["registry_id", "developer", "family", "exact_snapshot", "endpoint", "access_tier", "region", "first_seen"];

// Exported so other stores that need the SAME evidence bar import this
// constant rather than re-declaring it. `docs/ARCHITECTURE_RELEASE_WATCH_AND_BYO.md`
// C2: "A release carrying only a dated source_url cannot be promoted into a
// registry entry without gathering fresh evidence... replace source_url with
// evidence[] using the identical five-field schema, validated by importing
// REQUIRED_EVIDENCE_STRING_FIELDS from the registry validator rather than
// re-declaring it. One definition, two stores." Consumed by
// scripts/lib/model-releases-validator.mjs.
export const REQUIRED_EVIDENCE_STRING_FIELDS = ["source_url", "publisher", "published_at", "retrieved_at", "archive_or_hash"];

// ── registry_id derivation ───────────────────────────────────────────────
//
// Deterministic function of identity, never a counter that can drift or be
// reassigned. Two entries can only ever collide here if they genuinely
// share developer + family + exact_snapshot — which is exactly the case
// that must be rejected (a reused snapshot identifier cannot silently
// become a second, different, row).

// Exported so `release_id` (scripts/lib/model-releases-validator.mjs) uses
// the SAME normalisation as `registry_id` rather than a second slug function
// that could drift. `ARCHITECTURE_RELEASE_WATCH_AND_BYO.md` §2.2: "slugify is
// imported, not re-implemented — same function, same normalisation."
export function slugify(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * @param {{developer?: string, family?: string, exact_snapshot?: string}} entry
 * @returns {string}
 */
export function computeRegistryId(entry) {
  return `${slugify(entry?.developer)}--${slugify(entry?.family)}--${slugify(entry?.exact_snapshot)}`;
}

// ── Deep equality for frozen-field comparison ────────────────────────────

function deepEqual(a, b) {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (a === null || b === null) return a === b;
  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
    return a.every((v, i) => deepEqual(v, b[i]));
  }
  if (typeof a === "object") {
    const aKeys = Object.keys(a).sort();
    const bKeys = Object.keys(b).sort();
    if (aKeys.length !== bKeys.length || !aKeys.every((k, i) => k === bKeys[i])) return false;
    return aKeys.every((k) => deepEqual(a[k], b[k]));
  }
  return false;
}

function describeEntry(entry) {
  return `registry_id="${entry?.registry_id}" (developer="${entry?.developer}", family="${entry?.family}", exact_snapshot="${entry?.exact_snapshot}")`;
}

// ── Single-entry structural + evidence validation ────────────────────────

function validateEntryShape(entry, index, fail, warn) {
  const label = typeof entry?.registry_id === "string" && entry.registry_id ? entry.registry_id : `entries[${index}]`;

  if (!entry || typeof entry !== "object") {
    fail(`Entry at index ${index} is not an object`);
    return;
  }

  for (const field of REQUIRED_STRING_FIELDS) {
    if (typeof entry[field] !== "string" || entry[field].trim() === "") {
      fail(`Entry "${label}": missing/empty required string field "${field}"`);
    }
  }

  // registry_id must be exactly the deterministic derivation of identity —
  // never hand-assigned, never a counter. This is the immutability
  // guarantee's load-bearing check: if this passes, registry_id CANNOT be
  // reused for a different (developer, family, exact_snapshot) triple, and
  // CANNOT be reassigned to mean something else later, because it is not a
  // free-standing value — it IS the identity.
  if (typeof entry.registry_id === "string" && entry.registry_id) {
    const expected = computeRegistryId(entry);
    if (entry.registry_id !== expected) {
      fail(
        `Entry "${label}": registry_id "${entry.registry_id}" does not match the deterministic derivation ` +
          `"${expected}" of (developer, family, exact_snapshot). registry_id must never be hand-assigned or ` +
          `counter-based — it is derived so it can never drift or be reused.`
      );
    }
  }

  if (entry.aliases !== undefined && entry.aliases !== null && !Array.isArray(entry.aliases)) {
    fail(`Entry "${label}": aliases must be an array if present`);
  }

  if (!PRODUCT_SURFACES.includes(entry.product_surface)) {
    fail(`Entry "${label}": product_surface "${entry.product_surface}" is not one of ${PRODUCT_SURFACES.join(", ")}`);
  }
  if (!SYSTEM_PROMPT_STATUSES.includes(entry.system_prompt_status)) {
    fail(`Entry "${label}": system_prompt_status "${entry.system_prompt_status}" is not one of ${SYSTEM_PROMPT_STATUSES.join(", ")}`);
  }
  if (!MODERATION_LAYERS.includes(entry.moderation_layer)) {
    fail(`Entry "${label}": moderation_layer "${entry.moderation_layer}" is not one of ${MODERATION_LAYERS.join(", ")}`);
  }
  if (!CLAIM_CLASSES.includes(entry.claim_class)) {
    fail(`Entry "${label}": claim_class "${entry.claim_class}" is not one of ${CLAIM_CLASSES.join(", ")}`);
  }
  if (entry.status !== undefined && entry.status !== null && !REGISTRY_STATUSES.includes(entry.status)) {
    fail(`Entry "${label}": status "${entry.status}" is not one of ${REGISTRY_STATUSES.join(", ")}`);
  }

  if (!Array.isArray(entry.tools)) {
    fail(`Entry "${label}": tools must be an array (empty array if none enabled)`);
  }

  if (!entry.sampling || typeof entry.sampling !== "object" || Array.isArray(entry.sampling)) {
    fail(`Entry "${label}": sampling must be an object`);
  } else {
    for (const key of ["temperature", "top_p", "seed", "max_tokens", "context_limit"]) {
      if (!(key in entry.sampling)) {
        warn(`Entry "${label}": sampling is missing recommended key "${key}" (present as null/unknown is fine; absent is not)`);
      }
    }
  }

  if (!Array.isArray(entry.test_dates) || entry.test_dates.length === 0) {
    fail(`Entry "${label}": test_dates must be a non-empty array of ISO dates`);
  }

  if (!entry.lineage || typeof entry.lineage !== "object" || Array.isArray(entry.lineage)) {
    fail(`Entry "${label}": lineage must be an object with "predecessor" and "materiality_basis"`);
  } else {
    if (!("predecessor" in entry.lineage)) {
      fail(`Entry "${label}": lineage.predecessor is required (registry_id of the nearest comparable predecessor, or explicit null)`);
    }
    if (typeof entry.lineage.materiality_basis !== "string" || entry.lineage.materiality_basis.trim() === "") {
      fail(`Entry "${label}": lineage.materiality_basis is required — why this entry exists as its own snapshot`);
    }
  }

  // ── Evidence: an entry without provenance is invalid, full stop. ──────
  if (!Array.isArray(entry.evidence) || entry.evidence.length === 0) {
    fail(`Entry "${label}": evidence[] must be a non-empty array — an entry without provenance is invalid`);
  } else {
    entry.evidence.forEach((ev, evIndex) => {
      for (const field of REQUIRED_EVIDENCE_STRING_FIELDS) {
        if (typeof ev?.[field] !== "string" || ev[field].trim() === "") {
          const fieldName = field === "archive_or_hash" ? "archive_or_hash (content hash)" : field;
          fail(`Entry "${label}": evidence[${evIndex}] is missing required field "${fieldName}"`);
        }
      }
    });
  }

  // Invariant 5 (MODEL_REGISTRY.md): "A row with claim_class: 'inference'
  // may never be the identity of record for a published score." Read here
  // as: an entry may not simultaneously be status "active" (the record CB-
  // MODEL would cite as current) and claim_class "inference" (unconfirmed).
  if (entry.status === "active" && entry.claim_class === "inference") {
    fail(`Entry "${label}": status="active" with claim_class="inference" — an inference may never be the identity of record for a published score (MODEL_REGISTRY.md invariant 5)`);
  }
}

// ── developer -> AI Labs Index join cardinality ──────────────────────────

/**
 * @param {string} developer
 * @param {Array<{name: string}>} labsRankings
 * @returns {Array<{name: string}>} matching rows (0, 1, or >1)
 */
export function resolveDeveloperToLabsRows(developer, labsRankings) {
  const canonical = canonicalizeEntityName(developer);
  return (labsRankings ?? []).filter((row) => row && typeof row.name === "string" && canonicalizeEntityName(row.name) === canonical);
}

// ── Top-level: validate one registry state in isolation ──────────────────

/**
 * @param {{meta?: object, entries?: Array<object>}} registry
 * @param {{labsRankings?: Array<{name: string}>}} [opts]
 * @returns {{failures: string[], warnings: string[], checksRun: number, entryCount: number}}
 */
export function validateRegistryState(registry, opts = {}) {
  const failures = [];
  const warnings = [];
  let checksRun = 0;
  const fail = (msg) => failures.push(msg);
  const warn = (msg) => warnings.push(msg);
  const check = () => checksRun++;

  check();
  if (!registry || typeof registry !== "object") {
    fail("Registry is not an object");
    return { failures, warnings, checksRun, entryCount: 0 };
  }

  check();
  if (!registry.meta || typeof registry.meta !== "object") {
    fail("Missing top-level 'meta' object");
  }

  const entries = Array.isArray(registry.entries) ? registry.entries : null;
  check();
  if (entries === null) {
    fail("Missing top-level 'entries' array (use [] for an empty registry, which is valid)");
    return { failures, warnings, checksRun, entryCount: 0 };
  }

  // An empty registry is explicitly valid — this must pass cleanly with
  // zero entries reported, not error, per MODEL_REGISTRY.md's own current
  // state ("0 models. 0 snapshots.").
  if (entries.length === 0) {
    return { failures, warnings, checksRun, entryCount: 0 };
  }

  for (let i = 0; i < entries.length; i++) {
    check();
    validateEntryShape(entries[i], i, fail, warn);
  }

  // registry_id uniqueness — catches both (a) a hand-typed collision and
  // (b) the "reused name duplicated instead of edited" shape of the
  // overwrite defect: two rows sharing (developer, family, exact_snapshot)
  // compute the same registry_id and land here even if every other field
  // (including evidence) differs between them.
  const byId = new Map();
  for (const entry of entries) {
    if (typeof entry?.registry_id !== "string" || !entry.registry_id) continue;
    const list = byId.get(entry.registry_id) ?? [];
    list.push(entry);
    byId.set(entry.registry_id, list);
  }
  for (const [id, list] of byId) {
    check();
    if (list.length > 1) {
      fail(
        `registry_id collision: "${id}" is used by ${list.length} entries — ${list.map((e) => describeEntry(e)).join("  |  ")}. ` +
          `A provider reusing a model name does not permit overwriting or duplicating the prior record; a genuinely new ` +
          `snapshot must carry a distinguishing exact_snapshot value so its registry_id differs, with lineage.predecessor ` +
          `pointing back to "${id}".`
      );
    }
  }

  // developer -> AI Labs Index join cardinality.
  if (opts.labsRankings) {
    for (const entry of entries) {
      check();
      if (typeof entry?.developer !== "string" || !entry.developer) continue;
      const matches = resolveDeveloperToLabsRows(entry.developer, opts.labsRankings);
      if (matches.length > 1) {
        fail(
          `Entry "${entry.registry_id}": developer "${entry.developer}" resolves to ${matches.length} AI Labs Index rows ` +
            `(${matches.map((m) => `"${m.name}"`).join(", ")}) — must resolve to at most one. This join key is what keeps ` +
            `the Model Index and the AI Labs Index from being merged into one product.`
        );
      }
    }
  } else {
    warn("developer -> AI Labs Index join cardinality not checked: no labsRankings supplied to validateRegistryState()");
  }

  return { failures, warnings, checksRun, entryCount: entries.length };
}

// ── Top-level: validate a proposed transition between two registry states ─

/**
 * @param {{entries?: Array<object>}} priorRegistry the last known-good / committed state
 * @param {{entries?: Array<object>}} nextRegistry the proposed new state
 * @returns {{failures: string[], warnings: string[], checksRun: number}}
 */
export function validateRegistryTransition(priorRegistry, nextRegistry) {
  const failures = [];
  const warnings = [];
  let checksRun = 0;
  const fail = (msg) => failures.push(msg);
  const warn = (msg) => warnings.push(msg);
  const check = () => checksRun++;

  const priorEntries = Array.isArray(priorRegistry?.entries) ? priorRegistry.entries : [];
  const nextEntries = Array.isArray(nextRegistry?.entries) ? nextRegistry.entries : [];

  const priorById = new Map(priorEntries.filter((e) => typeof e?.registry_id === "string").map((e) => [e.registry_id, e]));
  const nextById = new Map(nextEntries.filter((e) => typeof e?.registry_id === "string").map((e) => [e.registry_id, e]));

  // Append-only: an existing registry_id may not disappear.
  for (const [id, priorEntry] of priorById) {
    check();
    if (!nextById.has(id)) {
      fail(`Append-only violation: entry ${describeEntry(priorEntry)} exists in the prior registry state but is absent from the proposed state. Entries may never be removed.`);
    }
  }

  // For every entry present in both states: frozen fields must be
  // byte-for-byte identical. This is the "edited in place" detector — the
  // literal mechanism that makes overwriting a prior record impossible
  // rather than merely discouraged.
  for (const [id, nextEntry] of nextById) {
    const priorEntry = priorById.get(id);
    if (!priorEntry) continue; // new entry — fine, validated separately by validateRegistryState.

    check();
    const changedFrozenFields = FROZEN_FIELDS.filter((field) => !deepEqual(priorEntry[field], nextEntry[field]));
    if (changedFrozenFields.length > 0) {
      fail(
        `Attempted overwrite of registry_id "${id}": frozen field(s) [${changedFrozenFields.join(", ")}] differ between the ` +
          `prior entry ${describeEntry(priorEntry)} and the proposed entry ${describeEntry(nextEntry)}. A provider reusing a ` +
          `model name does not permit overwriting the prior record — if behavior materially changed, create a NEW entry with ` +
          `a distinguishing exact_snapshot value and lineage.predecessor="${id}" instead of editing this one in place.`
      );
    }

    // test_dates is append-only-growable: every prior date must still be
    // present (no silent removal), and it should only grow, never shrink.
    check();
    const priorDates = Array.isArray(priorEntry.test_dates) ? priorEntry.test_dates : [];
    const nextDates = Array.isArray(nextEntry.test_dates) ? nextEntry.test_dates : [];
    const missingDates = priorDates.filter((d) => !nextDates.includes(d));
    if (missingDates.length > 0) {
      fail(`Entry "${id}": test_dates lost previously recorded date(s) [${missingDates.join(", ")}] — test_dates may only grow.`);
    }

    // Mutable fields: no constraint beyond enum validity, already checked
    // by validateRegistryState. Documented here so the allowance is
    // explicit rather than merely "not checked".
    check();
    for (const field of MUTABLE_FIELDS) {
      void field; // intentionally unconstrained — see MUTABLE_FIELDS doc comment above.
    }
  }

  if (nextEntries.length === priorEntries.length && failures.length === 0) {
    warn("No new entries were added in this transition (entry count unchanged).");
  }

  return { failures, warnings, checksRun };
}
