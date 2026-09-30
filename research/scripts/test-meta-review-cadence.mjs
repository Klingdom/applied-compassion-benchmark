#!/usr/bin/env node
/**
 * test-meta-review-cadence.mjs — META-1.
 *
 * The operating spec says: call `meta-coordinator` every 3 completed
 * improvement loops. On 2026-09-30 the most recent meta-review was
 * `docs/META_REVIEW_2026-09-21_ITER21-27.md`, and the loop had reached
 * Iteration 64.
 *
 * **Thirty-seven iterations without a meta-review, against a rule that says
 * three.** Not one of those 37 entries noted the trigger was due.
 *
 * This is the third artifact in this project found to have silently drifted
 * because its upkeep depended on somebody remembering, after DC-16 (work
 * shipping with no log entry, 3 occurrences) and DC-22 (SYSTEM_HEALTH.md, 19).
 * The pattern is now unambiguous: **in this system, a governance step with no
 * gate does not happen.** It is not a motivation problem — the loop was busy
 * and productive throughout those 37 iterations. The review is simply the one
 * task with no downstream consumer to notice its absence, and it is precisely
 * the task whose job is to notice that kind of thing.
 *
 * WHY THE TOLERANCE IS NOT 3
 *   The spec's cadence is "every 3 loops", but a gate that fires on the fourth
 *   would block work mid-stride and be switched off. It allows a backlog of
 *   `MAX_UNREVIEWED` and fails beyond that, which keeps the drift bounded at
 *   something a reader can still reconstruct. The point is to make skipping
 *   visible, not to make it impossible.
 *
 * Usage:
 *   node research/scripts/test-meta-review-cadence.mjs                # checks + negative controls
 *   node research/scripts/test-meta-review-cadence.mjs --checks-only  # checks only (used by the controls)
 */

import { readFileSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = join(__dirname, "..", "..");
const DOCS = join(REPO, "docs");
const LOG = join(REPO, "ITERATION_LOG.md");

/** How many iterations may pass unreviewed before this fails. */
export const MAX_UNREVIEWED = 8;

/** `META_REVIEW_<date>_ITER<from>-<to>.md` */
export function reviewedThrough(filenames) {
  let highest = null;
  for (const f of filenames) {
    const m = f.match(/^META_REVIEW_\d{4}-\d{2}-\d{2}_ITER(\d+)[-–](\d+)\.md$/);
    if (!m) continue;
    const to = Number(m[2]);
    if (highest === null || to > highest.to) highest = { file: f, from: Number(m[1]), to };
  }
  return highest;
}

export function newestIteration(logText) {
  const nums = [...logText.matchAll(/^##\s*Iteration\s*(\d+)/gm)].map((m) => Number(m[1]));
  return nums.length === 0 ? null : Math.max(...nums);
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

if (process.argv[1] && process.argv[1].endsWith("test-meta-review-cadence.mjs")) {
  console.log("META-1 — is the meta-review cadence being honoured?\n");

  const files = readdirSync(DOCS);
  const latest = reviewedThrough(files);
  const newest = newestIteration(readFileSync(LOG, "utf8"));

  // Positive control before any conclusion: the parser must be able to find a
  // review at all, and must reject a name that is not one (V8).
  check("the filename parser works in both directions", () => {
    const probe = reviewedThrough(["META_REVIEW_2026-01-02_ITER1-3.md", "META_REVIEW_notes.md", "README.md"]);
    assert(probe !== null, "parser found no review in a list that contains one");
    assert(probe.to === 3, `parser read the wrong range: ${JSON.stringify(probe)}`);
    assert(reviewedThrough(["README.md", "META_REVIEW_draft.md"]) === null, "parser accepted a non-review name");
  });

  check("a meta-review exists at all", () => {
    assert(latest !== null, `no META_REVIEW_<date>_ITER<from>-<to>.md found in ${DOCS}`);
  });

  check("the iteration log is readable", () => {
    assert(newest !== null, "no '## Iteration N' heading found in ITERATION_LOG.md");
  });

  if (latest && newest !== null) {
    const unreviewed = newest - latest.to;
    console.log(`\n      latest review: ${latest.file} (through Iteration ${latest.to})`);
    console.log(`      newest iteration: ${newest}`);
    console.log(`      unreviewed: ${unreviewed} (tolerance ${MAX_UNREVIEWED}, spec cadence 3)\n`);

    check(`no more than ${MAX_UNREVIEWED} iterations are unreviewed`, () => {
      assert(
        unreviewed <= MAX_UNREVIEWED,
        `${unreviewed} iterations since the last meta-review (${latest.to} -> ${newest}). ` +
          `The spec says every 3. Write the next META_REVIEW_<date>_ITER${latest.to + 1}-${newest}.md, ` +
          "or if the cadence itself is wrong, change the cadence deliberately rather than by drifting past it."
      );
    });

    check("the reviews leave no gap in coverage", () => {
      const ranges = files
        .map((f) => f.match(/^META_REVIEW_\d{4}-\d{2}-\d{2}_ITER(\d+)[-–](\d+)\.md$/))
        .filter(Boolean)
        .map((m) => ({ from: Number(m[1]), to: Number(m[2]) }))
        .sort((a, b) => a.from - b.from);
      const gaps = [];
      for (let i = 1; i < ranges.length; i += 1) {
        if (ranges[i].from > ranges[i - 1].to + 1) gaps.push(`${ranges[i - 1].to + 1}-${ranges[i].from - 1}`);
      }
      assert(gaps.length === 0, `iterations reviewed by nobody: ${gaps.join(", ")}`);
    });
  }

  // -------------------------------------------------------------------------
  // The gap check cannot be exercised end-to-end, because proving it needs a
  // review FILE to appear and disappear and withPlanted only mutates contents.
  // So it is unit-tested against fixtures, and the staleness check — the one
  // that actually failed in reality — gets a planted end-to-end control.
  //
  // Recording the asymmetry rather than claiming a uniform proof: one check is
  // verified against the repository, the other against fixtures only.
  // -------------------------------------------------------------------------
  console.log("\nfixture tests for the coverage-gap logic\n");

  function gapsIn(names) {
    const ranges = names
      .map((f) => f.match(/^META_REVIEW_\d{4}-\d{2}-\d{2}_ITER(\d+)[-\u2013](\d+)\.md$/))
      .filter(Boolean)
      .map((m) => ({ from: Number(m[1]), to: Number(m[2]) }))
      .sort((a, b) => a.from - b.from);
    const gaps = [];
    for (let i = 1; i < ranges.length; i += 1) {
      if (ranges[i].from > ranges[i - 1].to + 1) gaps.push(`${ranges[i - 1].to + 1}-${ranges[i].from - 1}`);
    }
    return gaps;
  }

  check("contiguous ranges report no gap", () => {
    const g = gapsIn(["META_REVIEW_2026-01-01_ITER1-3.md", "META_REVIEW_2026-01-02_ITER4-9.md"]);
    assert(g.length === 0, `expected no gap, got ${g.join(",")}`);
  });
  check("a missing middle range IS reported", () => {
    const g = gapsIn(["META_REVIEW_2026-01-01_ITER1-3.md", "META_REVIEW_2026-01-02_ITER7-9.md"]);
    assert(g.length === 1 && g[0] === "4-6", `expected 4-6, got ${g.join(",") || "nothing"}`);
  });
  check("MAX_UNREVIEWED is a real threshold, not decoration", () => {
    assert(Number.isInteger(MAX_UNREVIEWED) && MAX_UNREVIEWED > 0, "tolerance is not a positive integer");
    assert(MAX_UNREVIEWED < 20, `tolerance ${MAX_UNREVIEWED} is so loose the gate could not have caught the 37`);
  });

  if (!process.argv.includes("--checks-only")) {
    const { assertGateCatches } = await import("./lib/probe.mjs");
    const self = fileURLToPath(import.meta.url);
    const runChecks = () => {
      try {
        execFileSync(process.execPath, [self, "--checks-only"], { stdio: "ignore" });
        return true;
      } catch {
        return false;
      }
    };

    console.log("\nnegative control — plant the staleness that actually happened\n");
    try {
      await assertGateCatches({
        file: LOG,
        label: "an unreviewed backlog of iterations is caught",
        // One new iteration heading past the tolerance is enough. This is the
        // real failure: the log runs ahead and no review is written.
        // The number is COMPUTED, for two reasons. It is the smallest value
        // that exceeds the tolerance, so the probe tests the boundary rather
        // than an absurdity. And a literal high number written into this file
        // would be read by `test:iteration-log-coverage` as a reference to an
        // iteration that has no log entry — which is exactly what happened
        // when this said 999, and that gate caught it.
        mutate: (t) => {
          const planted = (newest ?? 0) + MAX_UNREVIEWED + 1;
          return `# ITERATION LOG — probe\n\n## ${"Iteration"} ${planted} — planted\n\n${t}`;
        },
        run: runChecks,
      });
      passed += 1;
      console.log("  ok  an unreviewed backlog of iterations is caught");
    } catch (e) {
      failures.push(`negative control: ${e.message}`);
      console.log(`  FAIL negative control: ${e.message}`);
    }
  }

  console.log(`\n${passed} passed, ${failures.length} failed`);
  if (failures.length > 0) {
    console.log("");
    console.log("The meta-review is the one task in the loop with no downstream consumer to notice its");
    console.log("absence — and its job is to notice exactly that kind of thing. That is why it needs a gate");
    console.log("rather than an intention.");
    process.exit(1);
  }
}
