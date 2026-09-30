#!/usr/bin/env node
/**
 * test-artifact-shrink.mjs — SAFE-1, the half that catches what the library cannot.
 *
 * `lib/safe-write.mjs` protects files written THROUGH it. This protects the
 * governance artifacts from everything else: a throwaway script, a bad `sed`, a
 * shell redirect that truncated before its input was ready.
 *
 * WHY (INC-012, 2026-09-30)
 *   `ITERATION_LOG.md` went from 330 KB to **0 bytes** in one call, because the
 *   file was opened for writing before the content to write had been computed.
 *   Nothing in the chain would have noticed. It was found because I checked the
 *   size on a hunch, and recovered because it happened to be committed.
 *
 * WHAT IT ASSERTS
 *   For each tracked governance artifact: it is not empty, and it has not lost
 *   more than half its bytes against `HEAD`. These files are append-mostly —
 *   logs, registries, backlogs — so a halving is a bug, never an edit.
 *
 *   A deliberate large deletion is still possible: commit it, and the next run
 *   compares against the new `HEAD`. The gate constrains the working tree, which
 *   is where the accident happens.
 *
 * Usage:
 *   node research/scripts/test-artifact-shrink.mjs
 */

import { readFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = join(__dirname, "..", "..");

/** Append-mostly files whose sudden collapse is always a defect. */
export const GUARDED = [
  "ITERATION_LOG.md",
  "IMPROVEMENT_BACKLOG.md",
  "SYSTEM_HEALTH.md",
  "DECISIONS.md",
  "RISKS.md",
  "INCIDENTS.md",
  "CHANGELOG.md",
  "docs/DEFECT_CLASS_REGISTRY.md",
  "research/APPLIED_CHANGES.md",
];

/** Fraction of HEAD's size below which a working-tree file is a defect. */
export const MIN_RATIO = 0.5;

function headSize(rel) {
  try {
    return execFileSync("git", ["show", `HEAD:${rel}`], {
      cwd: REPO,
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
    }).length;
  } catch {
    return null; // not in HEAD (new file) — nothing to compare against
  }
}

let passed = 0;
const failures = [];
function check(label, fn) {
  try {
    fn();
    passed += 1;
    console.log(`  ok  ${label}`);
  } catch (e) {
    failures.push(`${label}: ${e.message}`);
    console.log(`  FAIL ${label}: ${e.message}`);
  }
}
function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

if (process.argv[1] && process.argv[1].endsWith("test-artifact-shrink.mjs")) {
  console.log("SAFE-1 — no governance artifact is empty or halved\n");

  // Positive control first: the comparison must be able to see real sizes, or
  // every "no shrink" verdict below is vacuous (V8).
  console.log("positive controls\n");

  const sizes = GUARDED.map((rel) => ({
    rel,
    head: headSize(rel),
    now: existsSync(join(REPO, rel)) ? readFileSync(join(REPO, rel), "utf8").length : 0,
  }));

  check("HEAD sizes are readable and non-trivial", () => {
    const seen = sizes.filter((s) => s.head !== null);
    assert(seen.length >= 5, `only ${seen.length} of ${GUARDED.length} guarded files resolve in HEAD`);
    const total = seen.reduce((n, s) => n + s.head, 0);
    assert(total > 100_000, `guarded files total only ${total} chars in HEAD — the comparison is not meaningful`);
    console.log(`      (${seen.length} files, ${total.toLocaleString()} chars in HEAD)`);
  });

  check("the ratio rule would reject a known-bad case", () => {
    // The exact INC-012 shape, as arithmetic rather than as prose.
    assert(0 < 330_000 * MIN_RATIO, "a zero-byte file must be below the threshold");
    assert(!(330_000 < 330_000 * MIN_RATIO), "an unchanged file must not be below the threshold");
  });

  console.log("\nthe working tree\n");

  for (const { rel, head, now } of sizes) {
    check(`${rel}`, () => {
      assert(existsSync(join(REPO, rel)), "missing from the working tree");
      assert(now > 0, "EMPTY — 0 bytes. This is the INC-012 shape: a write that truncated before its content existed.");
      if (head === null) {
        console.log(`      (new file, not in HEAD — nothing to compare)`);
        return;
      }
      assert(
        now >= head * MIN_RATIO,
        `collapsed from ${head.toLocaleString()} to ${now.toLocaleString()} chars ` +
          `(under ${Math.round(MIN_RATIO * 100)}% of HEAD). Recover with ` +
          `\`git show HEAD:${rel} > ${rel}\` — never retype it — then find the write that did this.`
      );
    });
  }

  console.log(`\n${passed} passed, ${failures.length} failed`);
  if (failures.length > 0) {
    console.log("");
    console.log("A governance artifact lost its contents. Recover it from git before doing anything else:");
    console.log("the record of what happened is the thing that cannot be reconstructed from memory.");
    process.exit(1);
  }
}
