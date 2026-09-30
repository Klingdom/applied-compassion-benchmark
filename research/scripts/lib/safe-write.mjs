/**
 * safe-write.mjs — SAFE-1.
 *
 * Writing a file should not be able to destroy it.
 *
 * WHY THIS EXISTS (INCIDENTS.md INC-012, 2026-09-30)
 *   A coordinator script appended an iteration entry with:
 *
 *     io.open(path, "w").write(s[:i] + (entry % args) + s[i:])
 *
 *   Python evaluates `io.open(path, "w")` FIRST. The open truncated
 *   `ITERATION_LOG.md` to zero bytes; then the argument expression raised,
 *   because the prose contained a literal per-cent sign. The write never ran.
 *   **One call, 330 KB of governance record gone**, and a traceback that said
 *   nothing about the file.
 *
 *   It was recovered byte-identical from `git show HEAD:ITERATION_LOG.md` — but
 *   only because it happened to have been committed minutes earlier. The same
 *   tree held an uncommitted briefing rewrite that would have been
 *   unrecoverable.
 *
 * THE RULE, and it is not "be careful"
 *   **Compute the output, verify it, then open the file.** Three properties, in
 *   this order:
 *
 *     1. The content must already exist as a complete string. A caller that
 *        passes an expression which can throw has already lost.
 *     2. It must be non-empty. No governance artifact is ever legitimately
 *        emptied by a script.
 *     3. It must not have collapsed. An append-only log that suddenly holds
 *        half its bytes is a bug, not an edit.
 *
 *   Only then is the file opened — and via a temporary file and a rename, so a
 *   crash during the write leaves the original intact rather than a truncated
 *   stump. `renameSync` is atomic on the same filesystem.
 *
 * WHAT THIS CANNOT DO
 *   It cannot protect a file written by something that does not call it. The
 *   companion gate `test:artifact-shrink` catches the result — a tracked
 *   governance file that is empty or has halved against `HEAD` — for exactly
 *   that reason.
 */

import { readFileSync, writeFileSync, existsSync, renameSync, unlinkSync } from "node:fs";

export class UnsafeWriteError extends Error {
  constructor(message) {
    super(message);
    this.name = "UnsafeWriteError";
  }
}

/**
 * @param {string} file        absolute path to write
 * @param {string} content     the COMPLETE new contents, already computed
 * @param {object} [opts]
 * @param {number} [opts.minRatio=0.5]   refuse if content < this fraction of the existing size
 * @param {boolean} [opts.allowShrink=false]  set true for a deliberate large deletion
 * @returns {{before: number, after: number}}
 */
export function safeWrite(file, content, opts = {}) {
  const { minRatio = 0.5, allowShrink = false } = opts;

  if (typeof content !== "string") {
    throw new UnsafeWriteError(`${file}: content must be a string, got ${typeof content}. Compute it before writing.`);
  }
  if (content.trim() === "") {
    throw new UnsafeWriteError(`${file}: refusing to write empty content. No artifact is legitimately emptied.`);
  }

  const before = existsSync(file) ? readFileSync(file, "utf8").length : 0;
  if (before > 0 && !allowShrink && content.length < before * minRatio) {
    throw new UnsafeWriteError(
      `${file}: refusing to shrink ${before} → ${content.length} characters ` +
        `(below ${Math.round(minRatio * 100)}% of the original). If the deletion is deliberate, ` +
        `pass { allowShrink: true } and say why in the commit.`
    );
  }

  // Atomic: write beside the target, then rename over it. A crash mid-write
  // leaves the original untouched instead of a truncated stump.
  const tmp = `${file}.safe-write-tmp`;
  try {
    writeFileSync(tmp, content, "utf8");
    renameSync(tmp, file);
  } catch (e) {
    if (existsSync(tmp)) {
      try {
        unlinkSync(tmp);
      } catch {
        /* leave the temp file rather than mask the original error */
      }
    }
    throw e;
  }

  return { before, after: content.length };
}

/**
 * Read → transform → write, with the transform run BEFORE the file is opened.
 *
 * The shape the incident wanted: `mutate` receives the current text and returns
 * the whole new text. If it throws, nothing has been touched.
 */
export function safeRewrite(file, mutate, opts = {}) {
  if (!existsSync(file)) throw new UnsafeWriteError(`${file}: does not exist`);
  const current = readFileSync(file, "utf8");
  const next = mutate(current);
  if (next === current) return { before: current.length, after: current.length, unchanged: true };
  return safeWrite(file, next, opts);
}
