/**
 * manifest.mjs — the run manifest lifecycle: open (write partial manifest
 * at start), extend (add fields at lock time, additive-only), lock (freeze
 * the run, build the hash tree, write LOCK).
 *
 * Field list mirrors docs/MODEL_EVALUATION_HARNESS_DESIGN.md §2.4's
 * manifest table exactly (Identity / Provenance / Target / Configuration /
 * Item set / Capabilities / Time / Integrity / Cost).
 *
 * ── "Written at start, extended at lock, never rewritten" ──────────────────
 * A single JSON file's bytes necessarily change between the start-time
 * write and the lock-time write (new keys are added). This module's reading
 * of "never rewritten": every key present in the start-time manifest MUST
 * still be present with a byte-identical (deep-equal) value in the
 * lock-time manifest. Changing or removing an already-recorded value is
 * rejected, not merely discouraged — extendManifestAtLock() throws if it
 * detects one. This is flagged explicitly in the Phase A report as an
 * interpretation, since the design doc's own phrasing is in tension with
 * JSON files being edited at all.
 *
 * ── Presence, not truthiness ────────────────────────────────────────────────
 * "Recorded always. Never omitted, never faked" (§2.5, of `seed`) applies
 * across the whole manifest: a field counts as present if the manifest
 * object OWNS the key, even if its value is null (e.g. `seed: null` when a
 * provider does not support seeding, or `cost_actual: null` "until
 * billed" — both explicitly sanctioned null values in the design doc).
 * This is a different, stricter contract than
 * site/scripts/lib/evaluation-statistics.mjs's `isRecorded()`, which is a
 * DIFFERENT contract (the higher-level run-record.json's completeness
 * gate, not this harness-internal execution manifest) and treats null as
 * "not recorded". Both are correct for what they each check; conflating
 * them would be the bug.
 */

import { buildHashTree, writeHashTreeSync, writeArtifactSync, writeRawTextSync, writeLockSync, isLocked, ensureDirSync } from "./evidence.mjs";

export const REQUIRED_MANIFEST_FIELDS_AT_START = Object.freeze([
  "run_id", "registry_id", "benchmark_version", "bank_version", "form_id", "pool", "label",
  "harness_commit", "adapter_id", "adapter_version", "node_version", "os", "operator", "authority",
  "target", "sampling", "trials_per_item", "randomization_seed", "concurrency", "timeout_ms", "retry_policy",
  "items", "capabilities",
  "started_at",
]);

export const REQUIRED_MANIFEST_FIELDS_AT_LOCK = Object.freeze([
  ...REQUIRED_MANIFEST_FIELDS_AT_START,
  "completed_at", "locked_at",
  "hashtree_root", "trial_count_expected", "trial_count_persisted", "failed_trial_ids",
  "tokens_in_total", "tokens_out_total", "usage_source", "cost_estimate", "cost_actual", "ceiling_at_time",
]);

function hasOwnField(obj, key) {
  return obj != null && typeof obj === "object" && Object.prototype.hasOwnProperty.call(obj, key);
}

function deepEqualJSON(a, b) {
  return JSON.stringify(sortForCompare(a)) === JSON.stringify(sortForCompare(b));
}
function sortForCompare(v) {
  if (Array.isArray(v)) return v.map(sortForCompare);
  if (v !== null && typeof v === "object") {
    const out = {};
    for (const k of Object.keys(v).sort()) out[k] = sortForCompare(v[k]);
    return out;
  }
  return v;
}

export class ManifestIncompleteError extends Error {
  constructor(missing) {
    super(`Cannot lock run: manifest is missing required field(s) at lock time: ${missing.join(", ")}`);
    this.name = "ManifestIncompleteError";
    this.missing = missing;
  }
}

/** @returns {{ok: boolean, missing: string[]}} */
export function validateManifestFields(manifest, requiredFields) {
  const missing = requiredFields.filter((k) => !hasOwnField(manifest, k));
  return { ok: missing.length === 0, missing };
}

/**
 * Writes the start-time manifest.json. Fails loudly (not silently) if the
 * caller omitted a field required even at open time — better to fail at
 * open than discover it only at lock.
 */
export function openRun(runDir, startManifest) {
  ensureDirSync(runDir);
  if (isLocked(runDir)) throw new Error(`Cannot open run at "${runDir}": already locked.`);
  const check = validateManifestFields(startManifest, REQUIRED_MANIFEST_FIELDS_AT_START);
  if (!check.ok) {
    throw new Error(`Cannot open run: manifest is missing required field(s) at start time: ${check.missing.join(", ")}`);
  }
  writeArtifactSync(runDir, "manifest.json", startManifest);
  return { manifestPath: "manifest.json" };
}

/**
 * Merges additionalFields into startManifest. Additive-only: rejects any
 * key already present with a different value.
 */
export function extendManifestAtLock(startManifest, additionalFields) {
  for (const key of Object.keys(additionalFields)) {
    if (hasOwnField(startManifest, key) && !deepEqualJSON(startManifest[key], additionalFields[key])) {
      throw new Error(
        `Cannot extend manifest at lock: key "${key}" already exists in the start-time manifest with a different ` +
          `value — manifest fields are additive-only once written (docs/MODEL_EVALUATION_HARNESS_DESIGN.md §2.4).`
      );
    }
  }
  return { ...startManifest, ...additionalFields };
}

/**
 * Locks a run: validates completeness (test 1 — "A run with a missing
 * manifest field cannot lock"), builds the hash tree over every artifact
 * already written, writes the final manifest.json + manifest.sha256 +
 * hashtree.json, and writes LOCK LAST (so a crash mid-lock never leaves a
 * LOCK file with a stale/partial manifest). Throws (does not silently
 * no-op) if the run is already locked (test 2 territory, at the manifest
 * layer — evidence.mjs's writer functions enforce the same rule for every
 * other artifact).
 *
 * @returns {{manifest: object, manifestHash: string, hashtreeRoot: string}}
 */
export function lockRun(runDir, startManifest, additionalFieldsWithoutHashtree) {
  if (isLocked(runDir)) throw new Error(`Cannot lock run at "${runDir}": already locked.`);

  // additionalFieldsWithoutHashtree must not itself declare hashtree_root —
  // it is computed here, after every trial/evidence artifact is on disk,
  // specifically BEFORE hashtree.json exists (hashtree.json excludes
  // itself from its own listing) and BEFORE manifest.json is finalized
  // (manifest.sha256 must cover the manifest INCLUDING hashtree_root).
  if (hasOwnField(additionalFieldsWithoutHashtree, "hashtree_root")) {
    throw new Error("lockRun computes hashtree_root itself; do not pass it in additionalFieldsWithoutHashtree.");
  }

  const tree = buildHashTree(runDir);
  const merged = extendManifestAtLock(startManifest, { ...additionalFieldsWithoutHashtree, hashtree_root: tree.root });

  const check = validateManifestFields(merged, REQUIRED_MANIFEST_FIELDS_AT_LOCK);
  if (!check.ok) throw new ManifestIncompleteError(check.missing);

  // Write hashtree.json first (bypasses the lock-guarded writer — see
  // evidence.mjs#writeHashTreeSync's doc comment for why), then the final
  // manifest (still pre-lock, so the guarded writer is fine here), then
  // manifest.sha256 over the exact bytes just written, then LOCK last.
  writeHashTreeSync(runDir, tree);
  const manifestHash = writeArtifactSync(runDir, "manifest.json", merged);
  writeRawTextSync(runDir, "manifest.sha256", manifestHash + "\n");
  writeLockSync(runDir, { lockedAt: merged.locked_at, manifestSha256: manifestHash });

  return { manifest: merged, manifestHash, hashtreeRoot: tree.root };
}
