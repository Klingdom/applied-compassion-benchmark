/**
 * model-releases-validator.mjs — pure validation logic for the release-watch
 * data layer (`docs/ARCHITECTURE_RELEASE_WATCH_AND_BYO.md`, ratified by
 * DECISIONS.md D-30; page-count constraints ratified by D-29).
 *
 * Mirrors the pattern used by scripts/lib/model-registry-validator.mjs and
 * scripts/lib/task-bank-validator.mjs: one pure module with no I/O and no
 * process.exit, shared unchanged by the CLI (validate-model-releases.mjs)
 * and the fixture tests (test-model-releases.mjs).
 *
 * ── The rule this file exists to enforce ─────────────────────────────────
 * `.benchmark-ops/RELEASE_WATCH.md` invariant 3: "A scan that did not run is
 * not a scan that found nothing." The store must be able to say "we have
 * not looked" as data (`meta.scanState`, `meta.coverageThrough`), not as
 * copy that can go stale — and a release must trace to a scan that actually
 * ran (`detected_in_scan`), so a plausible row can never be written from
 * memory alone.
 *
 * ── release_id / registry_id relationship (§2.2) ─────────────────────────
 * `release_id` uses the SAME derivation function as `registry_id` — imported
 * from model-registry-validator.mjs, not re-implemented — on
 * (developer, family, snapshot_key), where snapshot_key depends on
 * `snapshot_precision`. When `snapshot_precision === "exact"`,
 * `release_id === registry_id` by construction: the join is identity, not a
 * foreign-key lookup.
 *
 * ── Two levels of check, mirroring the registry validator ────────────────
 * 1. validateReleaseStore(store, opts) — validates ONE store snapshot in
 *    isolation: shape, per-release required fields/enums, id derivation and
 *    uniqueness, product_scope derivation (the three-product boundary,
 *    D-23), evidence completeness, disposition completeness, the FK to
 *    registry-v1.json, the FK to scan records, and scan-record internal
 *    consistency. This is what the CLI runs against the committed files on
 *    every build.
 * 2. validateReleaseTransition(prior, next) — validates a PROPOSED CHANGE:
 *    frozen identity fields never change on an existing release_id, no
 *    release disappears (append-only), `evidence` only grows (existing
 *    elements never removed/altered), and `confirmation_status` never
 *    reverts once "confirmed".
 *
 * ── Checks implemented here, numbered as in the architecture doc §3.3 ────
 * K1  — shape + meta.releaseCount === releases.length (empty store passes)
 * K2  — meta.scanState equals its derivation from scan records (SKIPPED
 *       when no scan records are supplied — never silently passed)
 * K3  — every release has all required fields; enums valid
 * K4  — release_id equals its derivation; unique; exact-precision identity
 * K5  — registry_id !== release_id requires a complete id_resolution
 * K6  — every non-null registry_id exists in registry-v1.json
 * K7  — product_scope equals its derivation from classification
 * K8  — product_scope !== "model-index" ⇒ registry_id === null (D-23)
 * K9  — evidence[] non-empty; five registry fields; archive_or_hash format;
 *       retrieved_at a valid ISO datetime not in the future
 * K10 — confirmation_status is "confirmed" and only "confirmed"
 * K11 — evaluation_disposition !== "not-triaged" ⇒ reason + ref present
 * K12 — detected_in_scan resolves to a scan record, bidirectionally
 *       (SKIPPED, named, when no scan records are supplied)
 * K13 — tracked_since >= announced_date; both valid ISO dates, not future
 * K16 — scan-record internal consistency (validateScanRecords)
 * K17 — registry entries with no corresponding release row — WARN (INV-2)
 * K18 — meta.scanState in {stale, degraded, never-scanned} — WARN, NEVER a
 *       failure (§3.4: staleness depends on a founder-owned, hard-capped
 *       search budget and must not block unrelated deploys)
 *
 * K14 (lifecycle preconditions against runs/results trees) and K15 (git-HEAD
 * transition diff at the CLI level) and K19 (RELEASE_WATCH.md scan-count
 * reconciliation) are NOT implemented here: their target artifacts
 * (`research/model-index/release-watch/`, `runs/`, `results/`) do not exist
 * yet (architecture §8, Track R items R7/R9, out of scope for this task).
 * A future pass wires them the same way once those trees exist — following
 * the "VACUOUS PASS"/SKIPPED precedent set by validate-product-separation.mjs
 * check 4, a check that has verified nothing must say so, never pass silently.
 */

import { slugify, REQUIRED_EVIDENCE_STRING_FIELDS } from "./model-registry-validator.mjs";

export { REQUIRED_EVIDENCE_STRING_FIELDS };

// ── Schema enums (docs/ARCHITECTURE_RELEASE_WATCH_AND_BYO.md §2.3–§2.4) ────

export const SNAPSHOT_PRECISIONS = ["exact", "date_qualified", "family_only"];

export const CLASSIFICATIONS = [
  "new_model",
  "named_update",
  "silent_snapshot",
  "configuration_change",
  "policy_layer_change",
  "new_deployment",
  "incident",
  "non_material",
];

export const LIFECYCLE_STATES = ["detected", "confirmed", "registered", "evaluated", "published", "superseded", "retracted", "out-of-scope"];

export const EVALUATION_DISPOSITIONS = ["not-triaged", "queued", "deferred", "declined", "blocked"];

export const DETECTION_METHODS = ["search", "source_fetch", "manual", "provider_notice"];

// Only "confirmed" may ever appear in releases-v1.json (K10). Rumours and
// other unconfirmed candidates live only in scan records — never here.
export const CONFIRMATION_STATUSES = ["confirmed"];

export const SCAN_STATES = ["never-scanned", "current", "stale", "degraded"];

export const COVERAGE_CLAIMS = ["none", "partial", "declared-sources"];

// classification -> product_scope, a pure derived function (§2.3 table).
// This is the D-23 three-product boundary enforced at the point of data
// entry: a classification whose derived scope is not "model-index" is
// structurally forbidden from carrying a registry_id (K8).
const CLASSIFICATION_TO_PRODUCT_SCOPE = {
  new_model: "model-index",
  named_update: "model-index",
  silent_snapshot: "model-index",
  configuration_change: "deployed-ai-audit",
  policy_layer_change: "deployed-ai-audit",
  new_deployment: "deployed-ai-audit",
  incident: "incident",
  non_material: "none",
};

/**
 * @param {string} classification
 * @returns {string|null}
 */
export function deriveProductScope(classification) {
  return CLASSIFICATION_TO_PRODUCT_SCOPE[classification] ?? null;
}

// ── release_id derivation (§2.2) ──────────────────────────────────────────

function computeSnapshotKey(release) {
  const precision = release?.snapshot_precision;
  if (precision === "exact") return release?.snapshot_label;
  if (precision === "date_qualified") return `${release?.snapshot_label}-${release?.announced_date}`;
  if (precision === "family_only") return `unspecified-${release?.announced_date}`;
  return undefined;
}

/**
 * Same derivation function as registry_id (imported slugify), on
 * (developer, family, snapshot_key). When snapshot_precision === "exact",
 * snapshot_key === snapshot_label, so release_id === registry_id by
 * construction whenever the two entries share identity.
 *
 * @param {{developer?: string, family?: string, snapshot_label?: string, snapshot_precision?: string, announced_date?: string}} release
 * @returns {string}
 */
export function computeReleaseId(release) {
  return `${slugify(release?.developer)}--${slugify(release?.family)}--${slugify(computeSnapshotKey(release))}`;
}

// ── date/format helpers ───────────────────────────────────────────────────

function isIsoDate(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));
}

function isIsoDateTime(value) {
  return typeof value === "string" && value.trim() !== "" && !Number.isNaN(Date.parse(value));
}

function isFuture(value, now) {
  return isIsoDateTime(value) && new Date(value).getTime() > now.getTime();
}

// archive_or_hash: "sha256:<64 hex>" or a recognised archive-URL pattern
// (§2.3, §2.6 K9). Kept deliberately narrow — a format an agent cannot
// produce from memory without an overt lie (a real hash, or a real archive
// service URL).
const SHA256_RE = /^sha256:[0-9a-f]{64}$/;
const ARCHIVE_URL_RE = /^https:\/\/(web\.archive\.org\/|archive\.(today|ph|is)\/)/i;

function isValidArchiveOrHash(value) {
  return typeof value === "string" && (SHA256_RE.test(value) || ARCHIVE_URL_RE.test(value));
}

function describeRelease(release) {
  return `release_id="${release?.release_id}" (developer="${release?.developer}", family="${release?.family}", snapshot_label="${release?.snapshot_label}")`;
}

// ── K9 — evidence[] ────────────────────────────────────────────────────────

function validateEvidence(evidence, label, fail, now) {
  if (!Array.isArray(evidence) || evidence.length === 0) {
    fail(`Release "${label}": evidence[] must be a non-empty array — a release that cannot meet the registry's evidence bar is not recorded here (C2)`);
    return;
  }
  evidence.forEach((ev, evIndex) => {
    for (const field of REQUIRED_EVIDENCE_STRING_FIELDS) {
      if (typeof ev?.[field] !== "string" || ev[field].trim() === "") {
        fail(`Release "${label}": evidence[${evIndex}] is missing required field "${field}" (same 5-field bar as the registry)`);
      }
    }
    if (typeof ev?.archive_or_hash === "string" && ev.archive_or_hash.trim() !== "" && !isValidArchiveOrHash(ev.archive_or_hash)) {
      fail(`Release "${label}": evidence[${evIndex}].archive_or_hash "${ev.archive_or_hash}" matches neither "sha256:<64 hex>" nor a recognised archive-URL pattern`);
    }
    if (typeof ev?.retrieved_at === "string" && ev.retrieved_at.trim() !== "") {
      if (!isIsoDateTime(ev.retrieved_at)) {
        fail(`Release "${label}": evidence[${evIndex}].retrieved_at "${ev.retrieved_at}" is not a valid ISO datetime`);
      } else if (isFuture(ev.retrieved_at, now)) {
        fail(`Release "${label}": evidence[${evIndex}].retrieved_at "${ev.retrieved_at}" is in the future`);
      }
    }
  });
}

// ── Single-release structural validation (K3, K4, K7, K8, K9, K10, K11, K13) ─

function validateReleaseShape(release, index, fail, warn, now) {
  const label = typeof release?.release_id === "string" && release.release_id ? release.release_id : `releases[${index}]`;

  if (!release || typeof release !== "object") {
    fail(`Entry at index ${index} is not an object`);
    return;
  }

  for (const field of ["developer", "family", "snapshot_label", "announced_date", "materiality_basis", "tracked_since", "detected_in_scan", "detection_method"]) {
    if (typeof release[field] !== "string" || release[field].trim() === "") {
      fail(`Release "${label}": missing/empty required string field "${field}"`);
    }
  }

  // ── K4: release_id derivation + exact-precision identity with registry_id
  if (typeof release.release_id === "string" && release.release_id) {
    const expected = computeReleaseId(release);
    if (release.release_id !== expected) {
      fail(
        `Release "${label}": release_id "${release.release_id}" does not match the deterministic derivation "${expected}" of ` +
          `(developer, family, snapshot_key) — release_id must never be hand-assigned (same rule as registry_id).`
      );
    }
  } else {
    fail(`Release at index ${index}: release_id is required`);
  }

  if (!SNAPSHOT_PRECISIONS.includes(release.snapshot_precision)) {
    fail(`Release "${label}": snapshot_precision "${release.snapshot_precision}" is not one of ${SNAPSHOT_PRECISIONS.join(", ")}`);
  }
  if (!CLASSIFICATIONS.includes(release.classification)) {
    fail(`Release "${label}": classification "${release.classification}" is not one of ${CLASSIFICATIONS.join(", ")}`);
  }
  if (!LIFECYCLE_STATES.includes(release.lifecycle)) {
    fail(`Release "${label}": lifecycle "${release.lifecycle}" is not one of ${LIFECYCLE_STATES.join(", ")}`);
  }
  if (!EVALUATION_DISPOSITIONS.includes(release.evaluation_disposition)) {
    fail(`Release "${label}": evaluation_disposition "${release.evaluation_disposition}" is not one of ${EVALUATION_DISPOSITIONS.join(", ")}`);
  }
  if (!DETECTION_METHODS.includes(release.detection_method)) {
    fail(`Release "${label}": detection_method "${release.detection_method}" is not one of ${DETECTION_METHODS.join(", ")}`);
  }

  // ── K10: confirmation_status — only "confirmed" may ever appear here
  if (!CONFIRMATION_STATUSES.includes(release.confirmation_status)) {
    fail(
      `Release "${label}": confirmation_status "${release.confirmation_status}" is invalid — only "confirmed" may appear in releases-v1.json. ` +
        `Rumours and other unconfirmed candidates live only in scan records, never in the published store.`
    );
  }

  // ── K7/K8: product_scope derivation and the three-product boundary (D-23)
  if (CLASSIFICATIONS.includes(release.classification)) {
    const expectedScope = deriveProductScope(release.classification);
    if (release.product_scope !== expectedScope) {
      fail(`Release "${label}": product_scope "${release.product_scope}" does not match its derivation "${expectedScope}" from classification "${release.classification}" (product_scope is derived, never authored)`);
    }
  }
  if (release.product_scope !== "model-index" && release.registry_id !== null && release.registry_id !== undefined) {
    fail(
      `Release "${label}": product_scope "${release.product_scope}" may never carry a non-null registry_id (D-23 three-product boundary) — ` +
        `a configuration_change/policy_layer_change/new_deployment/incident/non_material release is structurally unable to become a registered model.`
    );
  }

  // ── K4/K5: registry_id relationship to release_id
  if (typeof release.registry_id === "string" && release.registry_id) {
    if (release.snapshot_precision === "exact") {
      if (release.registry_id !== release.release_id) {
        fail(`Release "${label}": snapshot_precision is "exact" and registry_id is set, so registry_id must equal release_id ("${release.release_id}") — found "${release.registry_id}"`);
      }
    } else if (release.registry_id !== release.release_id) {
      const res = release.id_resolution;
      if (!res || typeof res !== "object" || typeof res.resolved_at !== "string" || !res.resolved_at.trim() || typeof res.resolved_snapshot_label !== "string" || !res.resolved_snapshot_label.trim() || typeof res.note !== "string" || !res.note.trim()) {
        fail(`Release "${label}": registry_id ("${release.registry_id}") differs from release_id ("${release.release_id}") under snapshot_precision "${release.snapshot_precision}" — this requires a complete id_resolution { resolved_at, resolved_snapshot_label, note }`);
      }
    }
  }

  // ── K11: disposition completeness
  if (release.evaluation_disposition !== "not-triaged") {
    if (typeof release.disposition_reason !== "string" || release.disposition_reason.trim() === "") {
      fail(`Release "${label}": evaluation_disposition "${release.evaluation_disposition}" requires a non-empty disposition_reason`);
    }
    if (typeof release.disposition_ref !== "string" || release.disposition_ref.trim() === "") {
      fail(`Release "${label}": evaluation_disposition "${release.evaluation_disposition}" requires a non-empty disposition_ref (a blocker ID, decision ID, or incident ID)`);
    }
  }

  // ── K13: date sanity
  if (typeof release.announced_date === "string" && !isIsoDate(release.announced_date)) {
    fail(`Release "${label}": announced_date "${release.announced_date}" is not a valid ISO-8601 date`);
  } else if (isIsoDate(release.announced_date) && isFuture(release.announced_date, now)) {
    fail(`Release "${label}": announced_date "${release.announced_date}" is in the future`);
  }
  if (typeof release.tracked_since === "string" && !isIsoDate(release.tracked_since)) {
    fail(`Release "${label}": tracked_since "${release.tracked_since}" is not a valid ISO-8601 date`);
  } else if (isIsoDate(release.tracked_since) && isFuture(release.tracked_since, now)) {
    fail(`Release "${label}": tracked_since "${release.tracked_since}" is in the future`);
  }
  if (isIsoDate(release.tracked_since) && isIsoDate(release.announced_date) && release.tracked_since < release.announced_date) {
    fail(`Release "${label}": tracked_since ("${release.tracked_since}") is before announced_date ("${release.announced_date}") — CB cannot have tracked a release before it was announced`);
  }

  // ── K9: evidence
  validateEvidence(release.evidence, label, fail, now);

  void warn; // reserved for future per-release warnings (e.g. K17-adjacent notes)
}

// ── K12 — detected_in_scan FK, bidirectional ──────────────────────────────

function validateDetectedInScan(releases, scanRecords, fail, warn) {
  if (scanRecords === undefined) {
    warn('detected_in_scan FK check (K12) SKIPPED: no scan records supplied — pass opts.scanRecords (an array, [] if the scan tree is empty) to run it.');
    return;
  }
  const byId = new Map((scanRecords ?? []).filter((r) => typeof r?.scan_id === "string").map((r) => [r.scan_id, r]));
  for (const release of releases) {
    if (!release || typeof release !== "object") continue;
    const label = typeof release.release_id === "string" && release.release_id ? release.release_id : "(unidentified release)";
    const scanId = release.detected_in_scan;
    if (typeof scanId !== "string" || !scanId.trim()) continue; // already reported by validateReleaseShape
    const scan = byId.get(scanId);
    if (!scan) {
      fail(`Release "${label}": detected_in_scan "${scanId}" does not resolve to any scan record — a release must trace to a scan that actually ran (C6)`);
      continue;
    }
    const promoted = Array.isArray(scan.promoted_release_ids) ? scan.promoted_release_ids : [];
    if (!promoted.includes(release.release_id)) {
      fail(`Release "${label}": scan record "${scanId}" does not list this release_id in its promoted_release_ids — the FK must resolve bidirectionally`);
    }
  }
}

// ── K16 — scan record internal consistency ────────────────────────────────

/**
 * @param {Array<object>} scanRecords
 * @returns {{failures: string[], warnings: string[], checksRun: number}}
 */
export function validateScanRecords(scanRecords) {
  const failures = [];
  const warnings = [];
  let checksRun = 0;
  const fail = (m) => failures.push(m);
  const check = () => checksRun++;

  for (const record of Array.isArray(scanRecords) ? scanRecords : []) {
    const label = typeof record?.scan_id === "string" && record.scan_id ? record.scan_id : "(unidentified scan)";

    check();
    if (record?.budget?.exhausted === true && record?.status !== "aborted") {
      fail(`Scan "${label}": budget.exhausted is true but status is "${record?.status}" — an exhausted budget must produce status "aborted"`);
    }
    check();
    if (record?.status === "aborted" && (typeof record?.abort_reason !== "string" || record.abort_reason.trim() === "")) {
      fail(`Scan "${label}": status "aborted" requires a non-empty abort_reason`);
    }
    check();
    if (record?.status === "not-run" && (typeof record?.blocked_by !== "string" || record.blocked_by.trim() === "")) {
      fail(`Scan "${label}": status "not-run" requires a non-empty blocked_by (e.g. a blocker ID)`);
    }
  }

  return { failures, warnings, checksRun };
}

// ── K2 — meta.scanState derivation ────────────────────────────────────────

/**
 * `scanState` derivation (docs/ARCHITECTURE_RELEASE_WATCH_AND_BYO.md §2.4):
 *   never-scanned   lastScanCompletedAt === null AND no scan record "completed"
 *   degraded        the newest scan record has status "aborted" | "not-run"
 *   stale           now - lastScanCompletedAt > staleAfterDays
 *   current         otherwise
 *
 * @param {object} meta
 * @param {Array<object>} scanRecords
 * @param {Date} now
 * @returns {string}
 */
export function deriveScanState(meta, scanRecords, now) {
  const records = Array.isArray(scanRecords) ? scanRecords : [];
  const completedRecords = records.filter((r) => r?.status === "completed");
  const hasCompleted = completedRecords.length > 0 || (typeof meta?.lastScanCompletedAt === "string" && meta.lastScanCompletedAt.trim() !== "");
  if (!hasCompleted) return "never-scanned";

  const timeOf = (r) => {
    const t = new Date(r?.ended_at ?? r?.started_at ?? 0).getTime();
    return Number.isNaN(t) ? 0 : t;
  };
  const newest = [...records].sort((a, b) => timeOf(b) - timeOf(a))[0];
  if (newest && (newest.status === "aborted" || newest.status === "not-run")) return "degraded";

  const lastCompletedAt = typeof meta?.lastScanCompletedAt === "string" && meta.lastScanCompletedAt.trim() !== "" ? meta.lastScanCompletedAt : completedRecords.sort((a, b) => timeOf(b) - timeOf(a))[0]?.ended_at ?? null;
  const staleAfterDays = typeof meta?.staleAfterDays === "number" ? meta.staleAfterDays : 14;
  if (lastCompletedAt) {
    const ageDays = (now.getTime() - new Date(lastCompletedAt).getTime()) / 86400000;
    if (ageDays > staleAfterDays) return "stale";
  }
  return "current";
}

// ── Top-level: validate one release store in isolation ───────────────────

/**
 * @param {{meta?: object, releases?: Array<object>}} store
 * @param {{registry?: {entries?: Array<object>}, scanRecords?: Array<object>, now?: Date}} [opts]
 * @returns {{failures: string[], warnings: string[], checksRun: number, releaseCount: number}}
 */
export function validateReleaseStore(store, opts = {}) {
  const failures = [];
  const warnings = [];
  let checksRun = 0;
  const fail = (m) => failures.push(m);
  const warn = (m) => warnings.push(m);
  const check = () => checksRun++;
  const now = opts.now instanceof Date ? opts.now : new Date();

  check();
  if (!store || typeof store !== "object") {
    fail("Release store is not an object");
    return { failures, warnings, checksRun, releaseCount: 0 };
  }

  check();
  const meta = store.meta && typeof store.meta === "object" ? store.meta : null;
  if (!meta) {
    fail("Missing top-level 'meta' object");
  }

  const releases = Array.isArray(store.releases) ? store.releases : null;
  check();
  if (releases === null) {
    fail("Missing top-level 'releases' array (use [] for an empty store, which is explicitly valid)");
    return { failures, warnings, checksRun, releaseCount: 0 };
  }

  // ── K1: meta.releaseCount === releases.length
  if (meta) {
    check();
    if (meta.releaseCount !== releases.length) {
      fail(`meta.releaseCount (${meta.releaseCount}) does not match releases.length (${releases.length})`);
    }

    // C1: the store must be able to say "we have not looked" as DATA, not
    // as copy that can go stale. These fields are required even —
    // especially — on an empty store.
    check();
    for (const field of ["lastScanId", "coverageThrough", "scanState", "coverageClaim", "staleAfterDays"]) {
      if (!(field in meta)) {
        fail(`meta.${field} is required — its absence makes an empty releases[] ambiguous between "no release happened" and "no scan ever ran" (C1)`);
      }
    }

    check();
    if ("scanState" in meta && !SCAN_STATES.includes(meta.scanState)) {
      fail(`meta.scanState "${meta.scanState}" is not one of ${SCAN_STATES.join(", ")}`);
    }
    check();
    if ("coverageClaim" in meta && !COVERAGE_CLAIMS.includes(meta.coverageClaim)) {
      fail(`meta.coverageClaim "${meta.coverageClaim}" is not one of ${COVERAGE_CLAIMS.join(", ")}`);
    }
    check();
    if ("staleAfterDays" in meta && (typeof meta.staleAfterDays !== "number" || !(meta.staleAfterDays > 0))) {
      fail(`meta.staleAfterDays must be a positive number`);
    }

    // ── K2: scanState derivation
    check();
    if (opts.scanRecords === undefined) {
      warn('meta.scanState derivation check (K2) SKIPPED: no scan records supplied — pass opts.scanRecords (an array, [] if the scan tree is empty) to run it.');
    } else if (SCAN_STATES.includes(meta.scanState)) {
      const derived = deriveScanState(meta, opts.scanRecords, now);
      if (meta.scanState !== derived) {
        fail(`meta.scanState "${meta.scanState}" does not match its derivation "${derived}" from the scan records and staleAfterDays — scanState must never be hand-authored`);
      }
    }

    // ── K18: staleness is a WARNING, never a failure (§3.4)
    check();
    if (["stale", "degraded", "never-scanned"].includes(meta.scanState)) {
      warn(`meta.scanState is "${meta.scanState}" — this is a visible operational fact, not a build failure (detection is blocked on a founder-owned WebSearch budget; §3.4 / INC-008 / BLK-001)`);
    }
  }

  // An empty store is explicitly valid — must pass cleanly with zero
  // releases reported, mirroring validateRegistryState's empty-registry path.
  if (releases.length === 0) {
    // K17 still runs against an empty release list — every registry entry
    // is trivially "orphan" — see below.
  } else {
    for (let i = 0; i < releases.length; i++) {
      check();
      validateReleaseShape(releases[i], i, fail, warn, now);
    }

    // ── K4 (continued): release_id uniqueness across the file
    const byId = new Map();
    for (const release of releases) {
      if (typeof release?.release_id !== "string" || !release.release_id) continue;
      const list = byId.get(release.release_id) ?? [];
      list.push(release);
      byId.set(release.release_id, list);
    }
    for (const [id, list] of byId) {
      check();
      if (list.length > 1) {
        fail(`release_id collision: "${id}" is used by ${list.length} releases — ${list.map((r) => describeRelease(r)).join("  |  ")}. Two releases sharing (developer, family, snapshot_key) is either a duplicate row or a genuine identity collision that must be disambiguated.`);
      }
    }
  }

  // ── K6: registry_id FK
  check();
  if (opts.registry === undefined) {
    warn("registry_id FK check (K6) SKIPPED: no registry supplied — pass opts.registry (registry-v1.json's parsed contents) to run it.");
  } else {
    const registryIds = new Set((Array.isArray(opts.registry?.entries) ? opts.registry.entries : []).filter((e) => typeof e?.registry_id === "string").map((e) => e.registry_id));
    for (const release of releases) {
      if (typeof release?.registry_id !== "string" || !release.registry_id) continue;
      check();
      if (!registryIds.has(release.registry_id)) {
        fail(`Release "${release.release_id}": registry_id "${release.registry_id}" does not exist in registry-v1.json`);
      }
    }

    // ── K17: orphan registration — a registry entry with no corresponding
    // release row. WARN, never fail (INV-2): the registry must not be
    // hostage to the scanner, which is blocked on a founder-owned config
    // change.
    const referencedRegistryIds = new Set(releases.filter((r) => typeof r?.registry_id === "string" && r.registry_id).map((r) => r.registry_id));
    for (const id of registryIds) {
      check();
      if (!referencedRegistryIds.has(id)) {
        warn(`registry-v1.json entry "${id}" has no corresponding release row in releases-v1.json (orphan registration — legal per INV-2, e.g. registered from direct evidence before any scanner existed)`);
      }
    }
  }

  // ── K12: detected_in_scan FK, bidirectional
  check();
  validateDetectedInScan(releases, opts.scanRecords, fail, warn);

  // ── K16: scan record internal consistency (only meaningful when supplied)
  if (opts.scanRecords !== undefined) {
    check();
    const scanResult = validateScanRecords(opts.scanRecords);
    failures.push(...scanResult.failures);
    warnings.push(...scanResult.warnings);
    checksRun += scanResult.checksRun;
  }

  return { failures, warnings, checksRun, releaseCount: releases.length };
}

// ── Top-level: validate a proposed transition between two release stores ──

// Frozen once a release exists (INV-3). A change here on an existing
// release_id is a blocking failure — the correct action is a NEW release
// row (superseded_by / predecessor_release_id), never an edit in place.
export const FROZEN_RELEASE_FIELDS = [
  "release_id",
  "developer",
  "family",
  "snapshot_label",
  "snapshot_precision",
  "announced_date",
  "classification",
  "product_scope",
  "materiality_basis",
  "tracked_since",
  "detected_in_scan",
  "detection_method",
];

// Mutable lifecycle bookkeeping (INV-3).
export const MUTABLE_RELEASE_FIELDS = [
  "lifecycle",
  "registry_id",
  "id_resolution",
  "predecessor_release_id",
  "superseded_by",
  "evaluation_disposition",
  "disposition_reason",
  "disposition_ref",
  "disposition_set_at",
  "confirmation_status",
];

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

const CONFIRMATION_RANK = { confirmed: 1 };

/**
 * @param {{releases?: Array<object>}} priorStore the last known-good / committed state
 * @param {{releases?: Array<object>}} nextStore the proposed new state
 * @returns {{failures: string[], warnings: string[], checksRun: number}}
 */
export function validateReleaseTransition(priorStore, nextStore) {
  const failures = [];
  const warnings = [];
  let checksRun = 0;
  const fail = (m) => failures.push(m);
  const warn = (m) => warnings.push(m);
  const check = () => checksRun++;

  const priorReleases = Array.isArray(priorStore?.releases) ? priorStore.releases : [];
  const nextReleases = Array.isArray(nextStore?.releases) ? nextStore.releases : [];

  const priorById = new Map(priorReleases.filter((r) => typeof r?.release_id === "string").map((r) => [r.release_id, r]));
  const nextById = new Map(nextReleases.filter((r) => typeof r?.release_id === "string").map((r) => [r.release_id, r]));

  // Append-only: an existing release_id may not disappear.
  for (const [id, priorRelease] of priorById) {
    check();
    if (!nextById.has(id)) {
      fail(`Append-only violation: release ${describeRelease(priorRelease)} exists in the prior store but is absent from the proposed store. Releases may never be removed.`);
    }
  }

  for (const [id, nextRelease] of nextById) {
    const priorRelease = priorById.get(id);
    if (!priorRelease) continue; // new release — validated separately by validateReleaseStore.

    check();
    const changedFrozenFields = FROZEN_RELEASE_FIELDS.filter((field) => !deepEqual(priorRelease[field], nextRelease[field]));
    if (changedFrozenFields.length > 0) {
      fail(`Attempted overwrite of release_id "${id}": frozen field(s) [${changedFrozenFields.join(", ")}] differ between the prior and proposed release. Create a NEW release row (with predecessor_release_id/superseded_by) instead of editing this one in place.`);
    }

    // evidence is append-only PER ELEMENT: every prior element must still be
    // present unchanged; new elements may be added.
    check();
    const priorEvidence = Array.isArray(priorRelease.evidence) ? priorRelease.evidence : [];
    const nextEvidence = Array.isArray(nextRelease.evidence) ? nextRelease.evidence : [];
    const missingOrAltered = priorEvidence.filter((ev) => !nextEvidence.some((n) => deepEqual(ev, n)));
    if (missingOrAltered.length > 0) {
      fail(`Release "${id}": evidence[] lost or altered ${missingOrAltered.length} previously recorded element(s) — evidence may only grow, and existing elements are frozen per element.`);
    }

    // confirmation_status may never revert once "confirmed".
    check();
    const priorRank = CONFIRMATION_RANK[priorRelease.confirmation_status] ?? 0;
    const nextRank = CONFIRMATION_RANK[nextRelease.confirmation_status] ?? 0;
    if (priorRank > 0 && nextRank < priorRank) {
      fail(`Release "${id}": confirmation_status regressed from "${priorRelease.confirmation_status}" to "${nextRelease.confirmation_status}" — confirmed may never revert.`);
    }
  }

  if (nextReleases.length === priorReleases.length && failures.length === 0) {
    warn("No new releases were added in this transition (release count unchanged).");
  }

  return { failures, warnings, checksRun };
}
