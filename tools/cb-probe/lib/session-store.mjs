// lib/session-store.mjs
//
// Resolves and guards the local artifact root, and reads/writes session
// files under it. This is J3 from ARCHITECTURE_RELEASE_WATCH_AND_BYO.md
// §5.3: the promotion-proof property starts with "the server refuses to
// start (or write) with a write root that resolves inside a directory
// containing a .git folder, or inside the CB repo working tree."
//
// Zero network I/O. Only node:fs, node:path, node:os, node:crypto.

import { existsSync, mkdirSync, writeFileSync, readFileSync, readdirSync, renameSync, realpathSync } from "node:fs";
import path from "node:path";
import os from "node:os";
import { randomUUID } from "node:crypto";
import { REPO_ROOT } from "./paths.mjs";

const DEFAULT_ARTIFACT_ROOT = path.join(os.homedir(), "compassion-probe-sessions");
const SESSION_ID_RE = /^[a-zA-Z0-9-]+$/;

/**
 * JSON.parse a value read from disk (session/run/trial/estimate files,
 * expected to be user-editable), stripping any literal "__proto__" /
 * "constructor" / "prototype" own key encountered during parsing. Defense
 * in depth: JSON.parse itself does not trigger prototype pollution (a
 * "__proto__" key becomes an ordinary own data property, per spec), but
 * downstream code that later uses a value read from one of these files as a
 * bracket-notation key (e.g. dimensionCounts[dimension]) can. Stripping the
 * dangerous key names here closes the direct case (a literal `{"__proto__":
 * {...}}` in a file); Object.create(null) at each such accumulator site
 * (lib/judge-estimate.mjs, lib/self-run-scorecard.mjs) closes the indirect
 * case (a *value*, e.g. `"dimension": "__proto__"`, later used as a key).
 * @param {string} text
 */
export function safeJsonParse(text) {
  return JSON.parse(text, (key, value) => {
    if (key === "__proto__" || key === "constructor" || key === "prototype") return undefined;
    return value;
  });
}

/**
 * @param {NodeJS.ProcessEnv} env
 * @returns {string} resolved (but not yet validated) artifact root
 */
export function resolveArtifactRoot(env = process.env) {
  const raw = env.CB_ARTIFACT_ROOT && env.CB_ARTIFACT_ROOT.trim().length > 0
    ? env.CB_ARTIFACT_ROOT.trim()
    : DEFAULT_ARTIFACT_ROOT;
  const expanded = raw === "~" || raw.startsWith("~/") || raw.startsWith("~\\")
    ? path.join(os.homedir(), raw.slice(1))
    : raw;
  return path.resolve(expanded);
}

function findGitAncestor(dir) {
  let current = dir;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (existsSync(path.join(current, ".git"))) return current;
    const parent = path.dirname(current);
    if (parent === current) return null;
    current = parent;
  }
}

function isInside(parent, child) {
  const relative = path.relative(parent, child);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

/**
 * Resolve `p` through the real filesystem (following symlinks/junctions) as
 * far as it exists, then re-attach any trailing path segments that don't
 * exist yet. A junction/symlink whose TARGET resolves inside the repo must
 * be caught even though the junction's own path is outside it -- without
 * this, `path.resolve` alone accepts the junction's lexical path and the
 * subsequent isInside()/findGitAncestor() checks never see the real
 * location (docs/reviews/CB_PROBE_SECURITY_2026-09-24.md SEC-01).
 * @param {string} p
 */
function realpathOrNearestAncestor(p) {
  let current = path.resolve(p);
  const trailingSegments = [];
  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (existsSync(current)) {
      let real;
      try {
        real = realpathSync.native(current);
      } catch {
        real = current;
      }
      return trailingSegments.length > 0 ? path.join(real, ...trailingSegments) : real;
    }
    const parent = path.dirname(current);
    if (parent === current) {
      // Reached the filesystem root without finding an existing ancestor --
      // give up and return the original lexical resolution.
      return path.resolve(p);
    }
    trailingSegments.unshift(path.basename(current));
    current = parent;
  }
}

/**
 * Refuse a write root that resolves inside any git working tree, or inside
 * the Compassion Benchmark repo specifically. Throws with a clear message.
 * @param {string} root - a path, not yet validated (may not exist yet)
 * @param {string} [repoRoot] - defaults to this checkout's repo root
 * @returns {string} the validated, real (symlink/junction-resolved) root
 */
export function assertSafeWriteRoot(root, repoRoot = REPO_ROOT) {
  const resolvedRoot = realpathOrNearestAncestor(root);

  const resolvedRepo = path.resolve(repoRoot);
  if (isInside(resolvedRepo, resolvedRoot)) {
    throw new Error(
      `cb-probe: refusing to write under "${resolvedRoot}" -- it is inside the Compassion ` +
        `Benchmark repository working tree ("${resolvedRepo}"). Set CB_ARTIFACT_ROOT to a path ` +
        `outside the repo. cb-probe never writes under site/ or research/.`
    );
  }

  const gitAncestor = findGitAncestor(resolvedRoot);
  if (gitAncestor) {
    throw new Error(
      `cb-probe: refusing to write under "${resolvedRoot}" -- it is inside a git working tree ` +
        `(found .git at "${gitAncestor}"). Set CB_ARTIFACT_ROOT to a path outside any repository.`
    );
  }

  return resolvedRoot;
}

/**
 * Resolve the directory for a given session id, confined to `root`.
 * Guards against a crafted session_id (e.g. "../../etc") escaping the root,
 * independent of the fact that session ids we generate ourselves are always
 * safe UUIDs -- this is defense in depth against a client passing back an
 * arbitrary string.
 */
export function sessionDir(root, sessionId) {
  if (typeof sessionId !== "string" || !SESSION_ID_RE.test(sessionId)) {
    throw new Error(`cb-probe: invalid session_id "${sessionId}"`);
  }
  const resolvedRoot = path.resolve(root);
  const dir = path.resolve(resolvedRoot, sessionId);
  if (!isInside(resolvedRoot, dir)) {
    throw new Error(
      `cb-probe: refusing to write session "${sessionId}" -- its resolved path escapes the artifact root.`
    );
  }
  return dir;
}

export function newSessionId() {
  return randomUUID();
}

/**
 * Creates (or confirms) the directory for a session/run id, RE-CHECKING the
 * write-root guard here rather than trusting that it was checked once at
 * process startup (bin/server.mjs). Previously assertSafeWriteRoot was
 * called exactly once, at startup; every store function below trusted the
 * root it was handed with no further check, so a second entry point (a
 * different server reusing these functions, a test helper, a future
 * non-stdio transport) that constructed its own ctx without calling
 * assertSafeWriteRoot first would have no guard at all
 * (docs/reviews/CB_PROBE_ARCHITECTURE_2026-09-24.md §2.1). This is the one
 * function every write path in this module funnels through.
 */
export function ensureSessionDir(root, sessionId) {
  const safeRoot = assertSafeWriteRoot(root);
  const dir = sessionDir(safeRoot, sessionId);
  mkdirSync(dir, { recursive: true });
  return dir;
}

/**
 * Write `data` as JSON, atomically: write to a temp file in the same
 * directory, then rename over the target. A rename within one directory is
 * atomic on both POSIX and Windows (same volume), so a reader can never
 * observe a partially-written file, and a crash mid-write leaves the
 * previous version (or nothing) rather than a truncated one.
 */
export function writeSessionFile(root, sessionId, filename, data) {
  const dir = ensureSessionDir(root, sessionId);
  const filePath = path.join(dir, filename);
  const tmpPath = path.join(dir, `.${filename}.${process.pid}.${Date.now()}.${Math.random().toString(36).slice(2)}.tmp`);
  writeFileSync(tmpPath, JSON.stringify(data, null, 2) + "\n", "utf8");
  renameSync(tmpPath, filePath);
  return filePath;
}

export function readSessionFile(root, sessionId, filename) {
  const dir = sessionDir(root, sessionId);
  const filePath = path.join(dir, filename);
  if (!existsSync(filePath)) return null;
  return safeJsonParse(readFileSync(filePath, "utf8"));
}

export function listSessionEstimates(root, sessionId) {
  const dir = sessionDir(root, sessionId);
  const estimatesDir = path.join(dir, "estimates");
  if (!existsSync(estimatesDir)) return [];
  return readdirSync(estimatesDir)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map((f) => safeJsonParse(readFileSync(path.join(estimatesDir, f), "utf8")));
}

export function appendSessionEstimate(root, sessionId, itemId, estimate) {
  const dir = ensureSessionDir(root, sessionId);
  const estimatesDir = path.join(dir, "estimates");
  mkdirSync(estimatesDir, { recursive: true });
  const safeItemId = itemId.replace(/[^a-zA-Z0-9-]/g, "_");
  const filePath = path.join(estimatesDir, `${safeItemId}.json`);
  const tmpPath = path.join(estimatesDir, `.${safeItemId}.${process.pid}.${Date.now()}.tmp`);
  writeFileSync(tmpPath, JSON.stringify(estimate, null, 2) + "\n", "utf8");
  renameSync(tmpPath, filePath);
  return filePath;
}

export { DEFAULT_ARTIFACT_ROOT };
