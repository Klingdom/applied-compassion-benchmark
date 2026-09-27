#!/usr/bin/env node
/**
 * test-iteration-log-silence.mjs — CAL-2. Iteration 46.
 *
 * WHY THIS EXISTS, WHEN A COVERAGE GATE ALREADY DOES
 *
 * `test-iteration-log-coverage.mjs` (It. 34, DC-16) checks two things: every
 * `Iteration N` REFERENCE resolves to a heading, and the logged sequence has no
 * hole below its own maximum. Both are reference-driven, and on 2026-09-27
 * both passed while Iterations 43 and 44 were entirely unlogged — commits
 * `82435143` (MB-2a) and `df3b3ba2` (SUB-1) changed no log file and cited no
 * iteration number, so there was no dangling reference to catch and no hole
 * below the maximum. That was DC-16's THIRD occurrence, with its own gate
 * already in the chain.
 *
 * A gate that detects broken references cannot detect silence. This one
 * detects silence, using the link the silent commits actually left behind:
 * both named their work item in the commit subject — "(MB-2a)", "(SUB-1)" —
 * and neither ID appeared anywhere in ITERATION_LOG.md.
 *
 * THE RULE
 *   If a commit subject names a work-item ID, that ID must appear in
 *   ITERATION_LOG.md.
 *
 * It is deliberately conditional. Plenty of commits legitimately carry no item
 * ID, and requiring one on every commit would be a different, more annoying
 * rule that this class does not justify. The conditional form is satisfiable
 * today and would have caught both misses.
 *
 * FORWARD-DATED, like the DC-17 gate: only commits on or after CUTOFF are
 * checked, so no dated commit is retro-failed (AUTONOMY §1c).
 *
 * KNOWN HOLE, stated rather than discovered: a commit cannot reference its own
 * SHA, and the log entry for an iteration ships in the same commit as the work.
 * So this gate reads the log as it exists in the WORKING TREE, not as it
 * existed at each commit — which is what makes it catch the miss on the very
 * next run rather than a commit late.
 */

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = join(__dirname, "..", "..");
const LOG = join(REPO, "ITERATION_LOG.md");
const BANK = join(REPO, "site", "src", "data", "model-benchmark", "tasks-v1.json");

/** Commits before this date predate the rule and are not retro-failed (§1c). */
const CUTOFF = "2026-09-24";

/**
 * Prefixes that name a REGISTRY entry rather than a unit of work. A commit may
 * legitimately cite the defect class or risk it addresses without the log
 * being keyed on that id — the log is keyed on the work.
 */
const REGISTRY_PREFIXES = new Set(["DC", "RISK", "INC", "D", "AMB", "WQ", "CI", "RS", "V", "S", "K", "P"]);

/** Looks like SUB-1, MB-2a, CAL-2, GI-1, MCP-B3, MS-5. */
const ID_PATTERN = /\b([A-Z][A-Z0-9]{0,5})-([A-Z]?\d+[a-z]?)\b/g;

function git(args) {
  return execFileSync("git", args, { cwd: REPO, encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });
}

/** Task-bank item ids (ACC-1-C, EQU-3-A...) are content, not work items. */
function bankItemIds() {
  try {
    const bank = JSON.parse(readFileSync(BANK, "utf8"));
    const ids = new Set();
    for (const it of bank.items ?? []) {
      if (typeof it?.id !== "string") continue;
      ids.add(it.id);
      // A subject citing "EQU-1" (the subdimension, not the item) is also content.
      const trimmed = it.id.replace(/-[A-Z]$/, "");
      ids.add(trimmed);
    }
    return ids;
  } catch {
    return new Set();
  }
}

export function extractWorkItemIds(subject, excluded) {
  const found = new Set();
  for (const m of String(subject).matchAll(ID_PATTERN)) {
    const [full, prefix] = m;
    if (REGISTRY_PREFIXES.has(prefix)) continue;
    if (excluded.has(full)) continue;
    found.add(full);
  }
  return [...found];
}

function main() {
  const failures = [];
  const notes = [];

  const logText = readFileSync(LOG, "utf8");
  const excluded = bankItemIds();

  const raw = git(["log", `--since=${CUTOFF}`, "--no-merges", "--pretty=%h%ad%s", "--date=short"]);
  const commits = raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const [sha, date, subject] = l.split("");
      return { sha, date, subject };
    })
    .filter((c) => c.date >= CUTOFF);

  // --- Check C first: the scan must not be vacuous (V8) ---
  console.log("Check C — the scan is not vacuous (V8)");

  // A shallow clone cannot see history. `actions/checkout` defaults to depth 1,
  // so say so loudly rather than scanning one commit and reporting a clean
  // history — the same degradation the commit-token gate makes, for the same
  // reason. The workflow sets fetch-depth: 0 precisely so this branch is not
  // taken in CI; if it ever is, the note below is the warning that the gate
  // has quietly stopped checking anything.
  let shallow = "unknown";
  try {
    shallow = git(["rev-parse", "--is-shallow-repository"]).trim();
  } catch {
    /* older git; treat as unknown */
  }
  if (shallow === "true") {
    console.log("  note: SHALLOW clone — history is truncated, so this gate is INDETERMINATE, not green.");
    console.log("        Set fetch-depth: 0 on the checkout step to restore it.");
    notes.push("shallow clone — the silence check could not run over real history");
  }

  // A shallow clone reports INDETERMINATE no matter how many commits happen to
  // be reachable. An earlier revision returned early only at zero commits, and
  // a depth-1 clone whose single commit happened to carry a work-item id
  // printed "PASS — no work shipped silently", which is a green that means
  // nothing: one commit cannot evidence the absence of silence across history.
  // Found by running the gate against a real shallow clone rather than
  // reasoning about one.
  if (shallow === "true") {
    console.log(
      `  INDETERMINATE: only ${commits.length} commit(s) reachable; a truncated history cannot evidence ` +
        "the absence of silence. Not a pass and not a failure."
    );
    console.log("\nINDETERMINATE — shallow clone; this gate checked nothing.");
    return;
  }

  if (commits.length === 0) {
    failures.push(
      `VACUOUS: no commits found on or after ${CUTOFF}. Either the cutoff is in the future or the clone is ` +
        "shallow (actions/checkout defaults to depth 1). Refusing to report green on an empty scan."
    );
    console.log(`  VACUOUS: 0 commits scanned`);
  } else {
    console.log(`  ok: scanned ${commits.length} commits on or after ${CUTOFF}`);
  }

  const withIds = commits
    .map((c) => ({ ...c, ids: extractWorkItemIds(c.subject, excluded) }))
    .filter((c) => c.ids.length > 0);

  if (commits.length > 0 && withIds.length === 0) {
    failures.push(
      "VACUOUS: not one commit in range named a work-item id, so this gate checked nothing. " +
        "Either the id pattern is broken or the commit convention has changed."
    );
    console.log("  VACUOUS: 0 commits carried a work-item id");
  } else if (withIds.length > 0) {
    console.log(`  ok: ${withIds.length} of them name a work-item id (${withIds.reduce((n, c) => n + c.ids.length, 0)} ids)`);
  }

  // Positive control: the extractor must find a known-present id in a real subject.
  const control = extractWorkItemIds("Build the two-tier display before the first submission arrives (SUB-1)", excluded);
  if (!control.includes("SUB-1")) {
    failures.push("VACUOUS: the id extractor failed its positive control — it did not find SUB-1 in a real commit subject.");
    console.log("  VACUOUS: positive control failed");
  } else {
    console.log("  ok: positive control — extractor finds SUB-1 in a real commit subject");
  }
  // Negative control: a registry citation must NOT be treated as a work item.
  if (extractWorkItemIds("Gate the class I wrote a rule against (DC-14)", excluded).length !== 0) {
    failures.push("the extractor treats a registry citation (DC-14) as a work item; it should not.");
  } else {
    console.log("  ok: negative control — a registry citation (DC-14) is not treated as a work item");
  }

  // --- Check A: every work item named in a commit appears in the log ---
  console.log("\nCheck A — work named in a commit is written down in ITERATION_LOG.md");
  let checked = 0;
  for (const c of withIds) {
    for (const id of c.ids) {
      checked += 1;
      // Word-boundary match so CAL-2 does not satisfy a search for CAL-20.
      const present = new RegExp(`\\b${id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(logText);
      if (!present) {
        failures.push(
          `commit ${c.sha} (${c.date}) "${c.subject}" names work item ${id}, but ITERATION_LOG.md never mentions ` +
            `${id}. Work shipped without a log entry — DC-16. Write the entry; do not remove the id from the commit.`
        );
      }
    }
  }
  if (checked > 0 && failures.filter((f) => f.startsWith("commit ")).length === 0) {
    console.log(`  ok: all ${checked} work-item reference(s) in commit subjects are written up`);
  }

  // --- Report ---
  console.log("");
  if (notes.length) notes.forEach((n) => console.log(`note: ${n}`));
  if (failures.length) {
    for (const f of failures) console.log(`FAIL: ${f}`);
    console.log(`\nFAIL — ${failures.length} failure(s)`);
    process.exit(1);
  }
  console.log("PASS — no work shipped silently since the cutoff.");
}

const invokedDirectly = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (invokedDirectly) main();
