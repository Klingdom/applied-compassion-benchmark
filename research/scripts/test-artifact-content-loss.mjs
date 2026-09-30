#!/usr/bin/env node
/**
 * test-artifact-content-loss.mjs — DC-23.
 *
 * Catches the RESULT of a defect whose cause lives outside the repository.
 *
 * THE CLASS
 *   A backtick or a backslash inside a quoted shell command silently executes
 *   or vanishes, and the file that gets written is quietly wrong. There is no
 *   error and the exit code is zero. Five occurrences on 2026-09-30, all mine — the
 *   fifth while applying a fix to this very file:
 *
 *     1. A heredoc ate a backslash out of a regex, so a probe mutation matched
 *        nothing. Caught only because `withPlanted` refuses a no-op mutation.
 *     2. The debug command written to diagnose (1) mangled the same escape a
 *        DIFFERENT way, so the first explanation was also wrong.
 *     3. Backticks executed inside a double-quoted string and deleted the
 *        priority score off the end of a backlog row, leaving a bare full stop.
 *        Bash printed `I3: command not found` — easy to read past — and the
 *        file was written successfully, without the score.
 *     4. The same thing again in a pre-registration record, removing two
 *        filenames and leaving `**Discarded:**  (unread) - **Used:** .`
 *     5. While applying a fix to THIS file: a heredoc ate the escapes out of
 *        the replacement pattern, and the assertion reported its target
 *        missing. Re-applied with an editing tool that does not pass through a
 *        shell at all — which is the actual prevention, and is not this gate.
 *
 *   The practice rule (compose prose in a file, never in a shell string; read
 *   the write back) was adopted after occurrence 1 and broken four more times
 *   the same day. A rule broken four times after adoption is not a control.
 *
 * WHAT THIS CAN AND CANNOT DO
 *   It cannot see the cause — that is how a tool call is composed, which leaves
 *   no trace in the repo. It can see the shape of the wound: structure left
 *   standing with its content removed. All three signatures below were measured
 *   at ZERO across 2,220 tracked markdown files and 333,280 prose lines before
 *   this was written, so each ratchets from zero with no allowlist.
 *
 *   Signatures that were MEASURED AND REJECTED, because a gate that fires on
 *   legitimate text gets switched off: unbalanced inline backticks (107 real
 *   line-wrapped code spans), doubled interior spaces (93, mostly deliberate
 *   alignment), empty inline-code pairs (7, all nested ``` fences in prose),
 *   and `=` followed by punctuation (3, all inside code spans).
 *
 * Usage:
 *   node research/scripts/test-artifact-content-loss.mjs                # checks + negative controls
 *   node research/scripts/test-artifact-content-loss.mjs --checks-only  # checks only (used by the controls)
 */

import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = join(__dirname, "..", "..");

/** `**Some label:**` then whitespace then punctuation — the content is gone. */
export const ORPHANED_LABEL = /\*\*[A-Za-z][^*\n]{0,80}:\*\*[ \t]+[.,;:)\]]/;

/** A dash joining two clauses, with the second clause missing. */
export const ORPHAN_DASH = /\s[-—–]\s+[.,;:]/;

/** A priority score that starts and never finishes. */
export const SCORE_START = /\bI[1-5]\s+S[1-5]\s+L[1-5]\s+C[1-5]/;
export const SCORE_FULL =
  /\bI[1-5]\s+S[1-5]\s+L[1-5]\s+C[1-5]\s*(?:[-−–—]\s*)?E[1-5]\s*(?:[-−–—]\s*)?R[1-5]\s*=\s*\*{0,2}\s*-?\d+/;

/**
 * Prose lines only: fenced and indented code are excluded, because a shell
 * snippet in a document legitimately contains all of these shapes.
 */
export function proseLines(text) {
  const out = [];
  let inFence = false;
  const lines = text.split("\n");
  for (let i = 0; i < lines.length; i += 1) {
    const l = lines[i];
    if (/^\s*```/.test(l)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    if (/^\s{4,}\S/.test(l)) continue;
    out.push({ n: i + 1, text: l });
  }
  return out;
}

/**
 * Paragraphs, for checks that must survive a line wrap.
 *
 * The score check needs this: five backlog rows wrap mid-score, so a
 * line-by-line version reported them as truncated. Measuring that before
 * building is the only reason this gate does not ship with five false
 * positives.
 */
export function proseParagraphs(text) {
  const paras = [];
  let cur = null;
  for (const { n, text: l } of proseLines(text)) {
    if (l.trim() === "") {
      cur = null;
      continue;
    }
    if (cur === null) {
      cur = { n, text: l };
      paras.push(cur);
    } else {
      cur.text += ` ${l.trim()}`;
    }
  }
  return paras;
}

/**
 * Remove inline code spans. Text inside backticks is a SPECIMEN, not prose.
 *
 * The fifth time in this project that a check on prose has fired on the prose
 * explaining it — after the probe.mjs git check, the destructive-git gate, the
 * preflight read-only check, and both SYSTEM_HEALTH prose checks, which needed
 * stripCitations() for exactly this reason.
 *
 * Here the collision was immediate and total: the Iteration 64 log entry quotes
 * the real corrupted line, `**Discarded:**  (unread) - **Used:** .`, as evidence
 * that the pattern works. The gate then reported it as a live defect. A defect
 * registry that cannot quote its own defects is useless, so the quotation has to
 * win and the check has to get narrower.
 *
 * The placeholder is a WORD, not a space. Substituting a space collapsed
 * "**Basis:** <code span>." into "**Basis:**  ." and manufactured 132 false
 * positives out of ordinary labelled prose — the narrowing created the exact
 * signature it was narrowing away from. A structural check has to preserve
 * structure while removing content.
 *
 * NOT applied to the score check. Priority scores are written inside backticks
 * (`I3 S4 L3 C5 - E2 - R1 = 12`), so stripping code spans there would delete
 * every score and leave the check reporting a confident zero over nothing —
 * which is the void-check failure this project keeps meeting. The distinction is
 * deliberate and is why this is a separate function rather than part of
 * proseLines().
 */
export function stripInlineCode(text) {
  return text.replace(/`[^`\n]*`/g, "CODE");
}

function trackedMarkdown() {
  return execFileSync("git", ["ls-files", "*.md"], { cwd: REPO, encoding: "utf8" })
    .split("\n")
    .filter(Boolean);
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

if (process.argv[1] && process.argv[1].endsWith("test-artifact-content-loss.mjs")) {
  console.log("DC-23 — content removed from a written artifact, leaving its structure\n");

  // --- positive controls FIRST. V8: a zero from a search that has never found
  // --- anything proves nothing. These are the four real losses, verbatim.
  console.log("positive controls — each signature must fire on the real defect it is named for\n");

  check("ORPHANED_LABEL fires on the real It. 63 loss", () => {
    assert(
      ORPHANED_LABEL.test("**Discarded:**  (unread) - **Used:** ."),
      "did not match the actual corrupted line from the TRI-12 pre-registration"
    );
  });
  check("ORPHANED_LABEL does not fire on ordinary labelled prose", () => {
    for (const ok of [
      "**Selected:** **TRI-12**, filed in Iteration 61.",
      "**Status:** unresolved — needs a founder decision.",
      "**Result:** 7 of 8 items demonstrably discriminate.",
    ]) {
      assert(!ORPHANED_LABEL.test(ok), `false positive on: ${ok}`);
    }
  });
  check("stripInlineCode spares a quoted specimen but not a bare one", () => {
    const quoted = "the real loss was `**Discarded:**  (unread) - **Used:** .` and it is now gated";
    const bare = "**Discarded:**  (unread) - **Used:** .";
    assert(!ORPHANED_LABEL.test(stripInlineCode(quoted)), "a backticked specimen is still reported as a defect");
    assert(ORPHANED_LABEL.test(stripInlineCode(bare)), "a bare corrupted line is no longer caught — too narrow");
    assert(
      SCORE_FULL.test("`I3 S4 L4 C4 \u2212 E2 \u2212 R1 = 12`"),
      "the score check must NOT strip inline code, or it reports zero over nothing"
    );
  });
  check("SCORE_FULL matches every real score spelling", () => {
    for (const ok of [
      "v1: I3 S4 L3 C5 − E2 − R1 = **12**.",
      "`I3 S4 L4 C4 − E2 − R1 = 12`",
      "Type: fix · I4 S5 L3 C5 E1 R1 = **15**",
      "v1: I3 S5 L2 C5 - E1 - R1 = **13**.",
    ]) {
      assert(SCORE_FULL.test(ok), `did not match a valid score: ${ok}`);
    }
  });
  check("SCORE_FULL rejects the real It. 62 loss", () => {
    assert(
      !SCORE_FULL.test("and intending to remember has now failed seven times in a row. ."),
      "matched a line whose score had been deleted"
    );
    assert(SCORE_START.test("I3 S4 L3 C5"), "SCORE_START cannot find a score opening");
  });

  // --- the scan itself ---
  console.log("\nscan of tracked markdown\n");

  const files = trackedMarkdown();
  const hits = { label: [], dash: [] };
  let lineCount = 0;

  for (const f of files) {
    const text = readFileSync(join(REPO, f), "utf8");
    for (const { n, text: l } of proseLines(text)) {
      lineCount += 1;
      // Structural checks read prose only: a backticked specimen of the defect
      // is documentation, not an instance of it.
      const prose = stripInlineCode(l);
      if (ORPHANED_LABEL.test(prose)) hits.label.push(`${f}:${n}  ${l.trim().slice(0, 100)}`);
      if (ORPHAN_DASH.test(prose)) hits.dash.push(`${f}:${n}  ${l.trim().slice(0, 100)}`);
    }
  }

  check(`no orphaned labels across ${files.length} files / ${lineCount} prose lines`, () => {
    assert(
      hits.label.length === 0,
      `${hits.label.length} line(s) where a bold label is followed by punctuation and nothing else:\n    ` +
        hits.label.join("\n    ")
    );
  });

  check("no dashes joining a clause to nothing", () => {
    assert(hits.dash.length === 0, `${hits.dash.length} line(s):\n    ${hits.dash.join("\n    ")}`);
  });

  check("every priority score in IMPROVEMENT_BACKLOG.md is complete", () => {
    const text = readFileSync(join(REPO, "IMPROVEMENT_BACKLOG.md"), "utf8");
    const paras = proseParagraphs(text);
    const starting = paras.filter((p) => SCORE_START.test(p.text));
    assert(starting.length > 50, `only ${starting.length} score-bearing paragraphs found — the format changed`);
    const bad = starting.filter((p) => !SCORE_FULL.test(p.text));
    assert(
      bad.length === 0,
      `${bad.length} score(s) that start and never finish (line ${bad.map((b) => b.n).join(", ")}). ` +
        "A truncated score is the DC-23 signature: the row was written successfully with its number removed."
    );
    console.log(`      (${starting.length} scores checked, all complete)`);
  });

  // -------------------------------------------------------------------------
  // Negative controls. The positive controls above prove each pattern fires on
  // the real defect text; these prove the gate as a whole fails when the defect
  // is in a real tracked file, and passes again once it is gone. probe.mjs
  // verifies the restore by sha256 and refuses a mutation that changes nothing,
  // which is what caught a broken probe of mine earlier the same day.
  // -------------------------------------------------------------------------
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

    console.log("\nnegative controls\n");

    const BACKLOG = join(REPO, "IMPROVEMENT_BACKLOG.md");
    const controls = [
      {
        label: "an orphaned bold label is caught",
        file: BACKLOG,
        // Verbatim shape of the It. 63 loss.
        mutate: (t) => t.replace("## Scoring model", "**Discarded:**  (unread) - **Used:** .\n\n## Scoring model"),
      },
      {
        label: "a dash joining a clause to nothing is caught",
        file: BACKLOG,
        mutate: (t) => t.replace("## Scoring model", "The record says this - .\n\n## Scoring model"),
      },
      {
        label: "a truncated priority score is caught",
        file: BACKLOG,
        // The It. 62 loss: everything from the score marker to the number gone.
        mutate: (t) => t.replace("`I3 S4 L3 C5 \u2212 E2 \u2212 R1 = 12`", "I3 S4 L3 C5 and then nothing."),
      },
    ];

    for (const c of controls) {
      try {
        await assertGateCatches({ file: c.file, mutate: c.mutate, run: runChecks, label: c.label });
        passed += 1;
        console.log(`  ok  ${c.label}`);
      } catch (e) {
        failures.push(`${c.label}: ${e.message}`);
        console.log(`  FAIL ${c.label}: ${e.message}`);
      }
    }
  }

  console.log(`\n${passed} passed, ${failures.length} failed`);
  if (failures.length > 0) {
    console.log("");
    console.log("This gate sees the wound, not the weapon. If it fires, the likely cause is prose composed");
    console.log("inside a shell string: a backtick that executed, or a backslash that vanished. Re-derive the");
    console.log("lost content from its source rather than retyping it from memory.");
    process.exit(1);
  }
}
