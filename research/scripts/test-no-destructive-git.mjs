#!/usr/bin/env node
/**
 * test-no-destructive-git.mjs — gate for DC-14 (backlog GI-2).
 *
 * DEFECT CLASS (DC-14): a script runs a destructive git command and discards
 * work that was never committed. Git cannot recover it, because it was never
 * given the chance to.
 *
 * Dated occurrences:
 *   1. 2026-09-18 (INC-009) — `overnight-assessor` misread the scanner's
 *      uncommitted 2,673-line `rotation-state.json` write as a reformat and ran
 *      `git checkout`, discarding all 1,329 `last_scanned` values from that
 *      cycle. Self-disclosed and reconstructed.
 *   2. 2026-09-24 (INC-010) — the coordinator's own It. 35 probe harness ran
 *      `git checkout -q --force <branch>` to return from a scratch branch and
 *      destroyed three uncommitted files, including the held America-at-250
 *      rewrite. Recovered only because an earlier iteration had committed that
 *      rewrite as a patch. Recovery was luck, not design.
 *
 * After INC-009 the rule was written into agent briefs as prose. After INC-010
 * it was clear that prose aimed at someone else is not a control: I wrote that
 * rule and then broke it, because I was not thinking of my own probe harness as
 * an agent. Two occurrences with no mechanical gate is what selection rule S4
 * (gate-or-waiver) and S10 (an ungated recurring class pre-empts the queue)
 * exist for.
 *
 * WHAT THIS ASSERTS
 *   No tracked executable file invokes git in a way that can destroy
 *   uncommitted work, unless the line carries a dated waiver.
 *
 * THE WAIVER
 *   A destructive verb is permitted when the line, or the line immediately
 *   above it, carries:
 *
 *       GIT-DESTRUCTIVE-OK YYYY-MM-DD <reason>
 *
 *   A date and a reason, not a bare suppression. If a script genuinely needs to
 *   reset a throwaway clone, that is a sentence someone can write and a later
 *   reader can date.
 *
 * WHY MARKDOWN IS OUT OF SCOPE
 *   Agent briefs and governance docs quote these commands in order to forbid
 *   them. Scanning prose would flag the prohibition itself, which is how a gate
 *   earns a permanent allowlist. Only executable file types are scanned.
 *
 * NON-VACUITY (rule V8)
 *   A scan that finds nothing proves nothing until the same scan has found a
 *   known-present instance. This file carries its own fixtures and asserts the
 *   matcher flags every one of them before trusting a clean result on the repo.
 *   It also requires a plausible number of scanned files, so a broken
 *   `git ls-files` cannot report all-clear.
 *
 * Run: node research/scripts/test-no-destructive-git.mjs
 */

import { readFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";

const REPO = path.resolve(new URL("../..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));

/** Executable file types. Markdown is deliberately excluded — see the header. */
const SCAN_EXT = new Set([".mjs", ".js", ".cjs", ".ts", ".sh", ".bash", ".yml", ".yaml", ".ps1"]);

const MIN_FILES_SCANNED = 100;

/**
 * The verbs that can destroy uncommitted work, assembled from parts so this
 * file does not trip its own gate — the same discipline the skip-ci marker gate
 * uses. Each entry is [label, RegExp].
 */
const G = "git";
const DESTRUCTIVE = [
  ["checkout --force", new RegExp(`\\b${G}\\b[^\\n;|&]*\\bcheckout\\b[^\\n;|&]*(--force|\\s-f\\b)`)],
  ["checkout <path> (discards working-tree changes)", new RegExp(`\\b${G}\\b\\s+checkout\\s+--\\s`)],
  ["reset --hard", new RegExp(`\\b${G}\\b[^\\n;|&]*\\breset\\b[^\\n;|&]*--hard`)],
  ["clean -f", new RegExp(`\\b${G}\\b[^\\n;|&]*\\bclean\\b[^\\n;|&]*\\s-[a-zA-Z]*f`)],
  ["stash", new RegExp(`\\b${G}\\b\\s+stash\\b`)],
  ["restore", new RegExp(`\\b${G}\\b\\s+restore\\b`)],
];

/** A line is waived by a dated marker on it or the line immediately above. */
const WAIVER = /GIT-DESTRUCTIVE-OK\s+(\d{4}-\d{2}-\d{2})\s+(\S.*)$/;

/** Fixtures that MUST match, so a clean repo result means something. */
const MUST_FLAG = [
  `${G} checkout --force main`,
  `${G} checkout -f some-branch`,
  `  ${G} reset --hard HEAD~1`,
  `${G} clean -fd`,
  `${G} clean -xfd`,
  `${G} stash pop`,
  `${G} restore .`,
  `execFileSync("${G}", ["checkout", "--force", branch])`,
];

/** Fixtures that must NOT match, so the gate does not cry wolf. */
const MUST_NOT_FLAG = [
  `${G} pull origin main`,
  `${G} status --porcelain`,
  `${G} log -1 --format=%H`,
  `${G} add -- some/path`,
  `${G} commit -q -m "message"`,
  `${G} rev-parse --abbrev-ref HEAD`,
  `${G} checkout -b new-branch`, // creating a branch does not discard anything
  `${G} diff --cached --numstat`,
  `restore the file from the patch`, // prose, no git invocation
  `${G}hub.com/example/stash-viewer`, // substring, not a verb
];

let failures = 0;
const fail = (m) => {
  failures += 1;
  console.log(`  FAIL: ${m}`);
};
const pass = (m) => console.log(`  ok: ${m}`);

function matchesOf(line) {
  return DESTRUCTIVE.filter(([, re]) => re.test(line)).map(([label]) => label);
}

// ---------------------------------------------------------------- self-test
console.log("Check A — the matcher works on known instances (V8)");
{
  const missed = MUST_FLAG.filter((s) => matchesOf(s).length === 0);
  if (missed.length) fail(`matcher missed ${missed.length} known-destructive fixture(s): ${JSON.stringify(missed)}`);
  else pass(`all ${MUST_FLAG.length} known-destructive fixtures flagged`);

  const wrong = MUST_NOT_FLAG.filter((s) => matchesOf(s).length > 0);
  if (wrong.length) fail(`matcher over-fires on safe fixture(s): ${JSON.stringify(wrong)}`);
  else pass(`all ${MUST_NOT_FLAG.length} safe fixtures correctly ignored`);
}

// ---------------------------------------------------------------- the scan
let tracked = [];
try {
  tracked = execFileSync("git", ["ls-files"], { cwd: REPO, encoding: "utf8" })
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
} catch (err) {
  console.log(`FAIL: could not list tracked files (${err.message}). Refusing to report a pass.`);
  process.exit(2);
}

const scanned = [];
const findings = [];
const waived = [];

for (const rel of tracked) {
  if (!SCAN_EXT.has(path.extname(rel).toLowerCase())) continue;
  const abs = path.join(REPO, rel);
  if (!existsSync(abs)) continue;
  scanned.push(rel);

  const lines = readFileSync(abs, "utf8").split(/\r?\n/);
  lines.forEach((line, i) => {
    const hits = matchesOf(line);
    if (hits.length === 0) return;
    const here = WAIVER.exec(line);
    const above = i > 0 ? WAIVER.exec(lines[i - 1]) : null;
    const waiver = here || above;
    if (waiver) waived.push({ file: rel, line: i + 1, hits, date: waiver[1], reason: waiver[2].trim() });
    else findings.push({ file: rel, line: i + 1, hits, text: line.trim().slice(0, 100) });
  });
}

console.log("\nCheck B — the scan is not vacuous");
if (scanned.length < MIN_FILES_SCANNED) {
  fail(
    `VACUOUS: scanned only ${scanned.length} executable files, floor is ${MIN_FILES_SCANNED}. ` +
      "git ls-files or the extension filter is probably broken, not the repo clean."
  );
} else {
  pass(`${scanned.length} tracked executable files scanned (floor ${MIN_FILES_SCANNED})`);
}

console.log("\nCheck C — no unwaived destructive git invocation");
if (findings.length === 0) {
  pass(`0 unwaived destructive git invocations across ${scanned.length} files`);
} else {
  for (const f of findings) {
    fail(
      `${f.file}:${f.line} invokes ${f.hits.join(", ")} — "${f.text}". This can destroy uncommitted work ` +
        "(DC-14: INC-009 2026-09-18, INC-010 2026-09-24). Use a non-destructive form, or add a dated waiver " +
        "comment on this line or the line above: GIT-DESTRUCTIVE-OK YYYY-MM-DD <reason>."
    );
  }
}

if (waived.length > 0) {
  console.log("\nWaived (each needs a date and a reason, and is worth re-reading periodically):");
  for (const w of waived) console.log(`  ${w.file}:${w.line} ${w.hits.join(", ")} — ${w.date}: ${w.reason}`);
}

console.log(`\n${failures === 0 ? "PASS" : "FAIL"} — ${failures} failure(s)`);
process.exit(failures === 0 ? 0 : 1);
