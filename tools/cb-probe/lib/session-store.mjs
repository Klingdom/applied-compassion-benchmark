// lib/session-store.mjs
//
// Resolves and guards the local artifact root, and reads/writes session
// files under it. This is J3 from ARCHITECTURE_RELEASE_WATCH_AND_BYO.md
// §5.3: the promotion-proof property starts with "the server refuses to
// start (or write) with a write root that resolves inside a directory
// containing a .git folder, or inside the CB repo working tree."
//
// Zero network I/O. Only node:fs, node:path, node:os, node:crypto.

import { existsSync, mkdirSync, writeFileSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import os from "node:os";
import { randomUUID } from "node:crypto";
import { REPO_ROOT } from "./paths.mjs";

const DEFAULT_ARTIFACT_ROOT = path.join(os.homedir(), "compassion-probe-sessions");
const SESSION_ID_RE = /^[a-zA-Z0-9-]+$/;

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
 * Refuse a write root that resolves inside any git working tree, or inside
 * the Compassion Benchmark repo specifically. Throws with a clear message.
 * @param {string} root - already-resolved absolute path
 * @param {string} [repoRoot] - defaults to this checkout's repo root
 * @returns {string} the validated root
 */
export function assertSafeWriteRoot(root, repoRoot = REPO_ROOT) {
  const resolvedRoot = path.resolve(root);

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

export function ensureSessionDir(root, sessionId) {
  const dir = sessionDir(root, sessionId);
  mkdirSync(dir, { recursive: true });
  return dir;
}

export function writeSessionFile(root, sessionId, filename, data) {
  const dir = ensureSessionDir(root, sessionId);
  const filePath = path.join(dir, filename);
  writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf8");
  return filePath;
}

export function readSessionFile(root, sessionId, filename) {
  const dir = sessionDir(root, sessionId);
  const filePath = path.join(dir, filename);
  if (!existsSync(filePath)) return null;
  return JSON.parse(readFileSync(filePath, "utf8"));
}

export function listSessionEstimates(root, sessionId) {
  const dir = sessionDir(root, sessionId);
  const estimatesDir = path.join(dir, "estimates");
  if (!existsSync(estimatesDir)) return [];
  return readdirSync(estimatesDir)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map((f) => JSON.parse(readFileSync(path.join(estimatesDir, f), "utf8")));
}

export function appendSessionEstimate(root, sessionId, itemId, estimate) {
  const dir = ensureSessionDir(root, sessionId);
  const estimatesDir = path.join(dir, "estimates");
  mkdirSync(estimatesDir, { recursive: true });
  const safeItemId = itemId.replace(/[^a-zA-Z0-9-]/g, "_");
  const filePath = path.join(estimatesDir, `${safeItemId}.json`);
  writeFileSync(filePath, JSON.stringify(estimate, null, 2) + "\n", "utf8");
  return filePath;
}

export { DEFAULT_ARTIFACT_ROOT };
