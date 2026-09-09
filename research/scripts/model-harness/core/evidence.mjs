/**
 * evidence.mjs — canonical JSON, sha256 hashing, and the append-only,
 * lock-aware artifact writer for one evaluation run's evidence directory.
 *
 * Per docs/MODEL_EVALUATION_HARNESS_DESIGN.md §2.4: "SHA-256 over canonical
 * JSON: keys sorted lexicographically, UTF-8, LF newlines, no insignificant
 * whitespace, numbers in shortest round-trip form. One helper,
 * core/evidence.mjs#canonical(), used by every hash so the definition cannot
 * drift."
 *
 * IMPLEMENTATION NOTE on hashing (a design decision this file makes
 * explicit, since the design doc does not spell out the mechanics): every
 * artifact is WRITTEN in its canonical form (this is the only form this
 * module ever writes), so the raw bytes on disk already ARE the canonical
 * JSON. Verification therefore hashes the raw bytes read back from disk,
 * not a re-serialization of parsed content. This is deliberate: it is what
 * makes "editing one byte of one trial file" (acceptance test 3) change the
 * hash unconditionally, including a whitespace-only edit that a
 * parse-then-reserialize scheme would miss.
 *
 * LOCK semantics: a run directory containing a `LOCK` file forbids all
 * further writes through this module's writer functions (Invariant: "LOCK
 * — presence forbids all further writes to this run_id" — §2.4 table). This
 * module does not itself decide WHEN to lock (core/manifest.mjs owns that);
 * it only enforces the consequence.
 *
 * Zero packages. Node built-ins only: node:crypto, node:fs, node:path.
 */

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync, appendFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname, relative, sep } from "node:path";

// ── Canonical JSON ─────────────────────────────────────────────────────────

function sortKeysDeep(value) {
  if (Array.isArray(value)) return value.map(sortKeysDeep);
  if (value !== null && typeof value === "object") {
    const sorted = {};
    for (const key of Object.keys(value).sort()) sorted[key] = sortKeysDeep(value[key]);
    return sorted;
  }
  return value;
}

/** Deep-sorts object keys. Exported so callers can compare structures without re-hashing. */
export function canonicalize(value) {
  return sortKeysDeep(value);
}

/**
 * Canonical JSON string: sorted keys, no insignificant whitespace (plain
 * JSON.stringify with no indent argument already emits none), UTF-8 when
 * written to disk. JS's JSON.stringify already emits numbers in their
 * shortest round-trip form for standard doubles, so no separate numeric
 * formatting step is needed.
 */
export function canonicalJSONStringify(value) {
  return JSON.stringify(canonicalize(value));
}

export function sha256Hex(input) {
  return createHash("sha256").update(input, "utf8").digest("hex");
}

/** SHA-256 of a value's canonical JSON serialization. */
export function canonicalHash(value) {
  return sha256Hex(canonicalJSONStringify(value));
}

// ── Item content hashing (§2.4: "item_hash covers {id, itemVersion, prompt, anchors}") ──

export function computeItemHash({ id, itemVersion, prompt, anchors }) {
  return canonicalHash({ id, itemVersion, prompt, anchors });
}

/**
 * Minimal placeholder for what the (not-yet-built) analysis layer
 * (research/scripts/model-analysis, per §2.2's component boundary) must do
 * before comparing the same item across two runs: refuse if item_hash
 * differs. §2.4: "If a prompt is edited, the hash changes, and a
 * comparison across runs with different item hashes is rejected by the
 * analysis layer rather than silently performed." Phase A's scope is the
 * harness, not the analysis program — this function proves the hash
 * changes correctly and that a comparison CAN be refused mechanically; it
 * is deliberately NOT a general-purpose run-comparison API.
 */
export class IncomparableItemHashError extends Error {
  constructor(itemId, hashA, hashB) {
    super(
      `Cannot compare item "${itemId}" across runs: item_hash differs ("${hashA}" vs "${hashB}") — the prompt text ` +
        `(or itemVersion/anchors) changed between runs, so any comparison would be comparing two different items, ` +
        `not two attempts at the same one.`
    );
    this.name = "IncomparableItemHashError";
    this.itemId = itemId;
    this.hashA = hashA;
    this.hashB = hashB;
  }
}

export function assertComparableItemHash(itemId, hashA, hashB) {
  if (hashA !== hashB) throw new IncomparableItemHashError(itemId, hashA, hashB);
}

// ── Filesystem helpers ─────────────────────────────────────────────────────

export function ensureDirSync(dirPath) {
  mkdirSync(dirPath, { recursive: true });
}

const LOCK_FILENAME = "LOCK";

export function isLocked(runDir) {
  return existsSync(join(runDir, LOCK_FILENAME));
}

export class RunLockedError extends Error {
  constructor(runDir, attemptedPath) {
    super(`Run at "${runDir}" is LOCKED — refusing to write "${attemptedPath}". Presence of LOCK forbids all further writes to this run_id (docs/MODEL_EVALUATION_HARNESS_DESIGN.md §2.4).`);
    this.name = "RunLockedError";
    this.runDir = runDir;
    this.attemptedPath = attemptedPath;
  }
}

function assertNotLocked(runDir, attemptedPath) {
  if (isLocked(runDir)) throw new RunLockedError(runDir, attemptedPath);
}

/**
 * Writes one JSON artifact in canonical form under `runDir/relPath`.
 * Refuses if the run is locked. Returns the sha256 of the exact bytes
 * written (i.e. of the canonical JSON string).
 */
export function writeArtifactSync(runDir, relPath, value) {
  assertNotLocked(runDir, relPath);
  const fullPath = join(runDir, relPath);
  ensureDirSync(dirname(fullPath));
  const content = canonicalJSONStringify(value);
  writeFileSync(fullPath, content, "utf8");
  return sha256Hex(content);
}

/** Appends one canonical-JSON line (JSON Lines) to `runDir/relPath`. Locked runs refuse. */
export function appendJsonLineSync(runDir, relPath, value) {
  assertNotLocked(runDir, relPath);
  const fullPath = join(runDir, relPath);
  ensureDirSync(dirname(fullPath));
  appendFileSync(fullPath, canonicalJSONStringify(value) + "\n", "utf8");
}

/** Writes a raw (non-JSON) text artifact, e.g. manifest.sha256. Locked runs refuse. */
export function writeRawTextSync(runDir, relPath, text) {
  assertNotLocked(runDir, relPath);
  const fullPath = join(runDir, relPath);
  ensureDirSync(dirname(fullPath));
  writeFileSync(fullPath, text, "utf8");
}

export function readArtifactRawSync(runDir, relPath) {
  return readFileSync(join(runDir, relPath), "utf8");
}

export function readArtifactJsonSync(runDir, relPath) {
  return JSON.parse(readArtifactRawSync(runDir, relPath));
}

export function hashArtifactSync(runDir, relPath) {
  return sha256Hex(readArtifactRawSync(runDir, relPath));
}

/** Writes the LOCK marker. Must be the LAST write to a run directory. */
export function writeLockSync(runDir, info) {
  assertNotLocked(runDir, LOCK_FILENAME);
  writeFileSync(join(runDir, LOCK_FILENAME), canonicalJSONStringify(info ?? { lockedAt: null }), "utf8");
}

// ── Hash tree (§2.4: "sorted [path, sha256] + root hash") ──────────────────

const EXCLUDED_FROM_HASHTREE = new Set(["manifest.json", "manifest.sha256", "hashtree.json", LOCK_FILENAME]);

function walkFiles(root, dir, out) {
  for (const name of readdirSync(dir).sort()) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walkFiles(root, full, out);
    else out.push(full);
  }
}

/**
 * Builds { entries: [[relPath, sha256], ...] (sorted by relPath), root }
 * over every artifact currently in `runDir` except the manifest/hashtree/
 * lock files themselves (which either don't exist yet at build time, or
 * would create a circular dependency on their own hash).
 */
export function buildHashTree(runDir) {
  const files = [];
  if (existsSync(runDir)) walkFiles(runDir, runDir, files);
  const entries = files
    .map((full) => {
      const relPath = relative(runDir, full).split(sep).join("/");
      return [relPath, sha256Hex(readFileSync(full, "utf8"))];
    })
    .filter(([relPath]) => !EXCLUDED_FROM_HASHTREE.has(relPath))
    .sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
  const root = sha256Hex(canonicalJSONStringify(entries));
  return { entries, root };
}

/**
 * Writes hashtree.json (bypasses the lock-guarded writer deliberately: this
 * is called exactly once, by core/manifest.mjs#lockRun, in the brief window
 * between "run is fully executed" and "LOCK file is written" — there is no
 * lock yet to violate, and using the guarded writer here would be circular
 * since hashtree.json is itself excluded from the tree it describes).
 */
export function writeHashTreeSync(runDir, tree) {
  const fullPath = join(runDir, "hashtree.json");
  writeFileSync(fullPath, canonicalJSONStringify(tree), "utf8");
}

/**
 * Re-walks the run directory, recomputes the hash tree, and compares it to
 * the hashtree.json actually on disk. Returns { ok, mismatches, missing,
 * extra } — never throws; it is a report, not an assertion.
 */
export function verifyHashTree(runDir) {
  const stored = readArtifactJsonSync(runDir, "hashtree.json");
  const recomputed = buildHashTree(runDir);
  const storedByPath = new Map(stored.entries);
  const recomputedByPath = new Map(recomputed.entries);

  const mismatches = [];
  const missing = []; // present in stored, absent on disk now
  const extra = []; // present on disk now, absent from stored manifest

  for (const [path, hash] of storedByPath) {
    if (!recomputedByPath.has(path)) missing.push(path);
    else if (recomputedByPath.get(path) !== hash) mismatches.push({ path, expected: hash, actual: recomputedByPath.get(path) });
  }
  for (const [path] of recomputedByPath) {
    if (!storedByPath.has(path)) extra.push(path);
  }

  const rootOk = stored.root === recomputed.root;
  const ok = rootOk && mismatches.length === 0 && missing.length === 0 && extra.length === 0;
  return { ok, rootOk, mismatches, missing, extra, storedRoot: stored.root, recomputedRoot: recomputed.root };
}
