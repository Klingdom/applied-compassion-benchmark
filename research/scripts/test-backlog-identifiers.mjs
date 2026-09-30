#!/usr/bin/env node
/**
 * test-backlog-identifiers.mjs — ID-3 / ID-3a.
 *
 * ONE LIVE ROW PER IDENTIFIER.
 *
 * WHY
 *   `IMPROVEMENT_BACKLOG.md` is the queue the improvement loop selects from. On
 *   2026-09-30 it carried **8 duplicated identifiers**, and five of them had a
 *   row describing finished work as still open — D1-1, GI-3, MS-5, MS-3 and
 *   GI-2 all had a "COMPLETED" row and a separate "here is the problem" row,
 *   because completing work had been recorded by ADDING a row rather than
 *   marking the original.
 *
 *   That is not untidiness. Meta-Review 5 found the loop had spent 37
 *   iterations ranking its own follow-ups above the product backlog, and this
 *   is one mechanism: the highest-scoring "open" pre-existing row was RS-1 at
 *   v2 18, which had already been implemented. **A queue that lists finished
 *   work cannot be ranked honestly.**
 *
 *   The same session also produced three identifier collisions of my own —
 *   CI-1, OBS-1 and RS-5 — each filed on an id that was already live, because
 *   I was not reading the file I was appending to.
 *
 * THE INVARIANT, AND WHY IT IS THIS ONE
 *   Not "every id appears once": history is worth keeping, and a superseded row
 *   should stay readable next to the row that replaced it. What must be unique
 *   is the number of rows that still claim to be OPEN. So: for each identifier,
 *   at most one row lacks a resolution marker.
 *
 * WHAT THIS CANNOT DO
 *   It cannot tell that a *unique* row is stale. RS-1 was a single open row
 *   describing work that was already finished, and this gate would pass it
 *   without comment. Detecting that needs someone to read the row against the
 *   system, which is what Iteration 69 did by hand. The gate stops the
 *   mechanism that produced eight of them; it does not replace the reading.
 *
 * Usage:
 *   node research/scripts/test-backlog-identifiers.mjs                # checks + negative control
 *   node research/scripts/test-backlog-identifiers.mjs --checks-only  # checks only
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = join(__dirname, "..", "..");
const BACKLOG = join(REPO, "IMPROVEMENT_BACKLOG.md");

/**
 * A top-level backlog row: `- **ID — text`.
 *
 * The separator must be an em/en dash or " - ". Requiring it is what stops
 * `BM-1 folded in ...` being read as an id of `BM` with `-1` as the separator —
 * a false duplicate my first version of this measurement reported, and the
 * reason the corrected count is 8 rather than 10.
 */
export const ROW = /^- \*\*([A-Z][A-Za-z0-9]*(?:-[0-9]+[a-z]?)*)\s+(?:[—–]|-\s)/;

/** Any of these in the row's block means it no longer claims to be open. */
export const RESOLVED =
  /\bDONE\b|\bCOMPLETED\b|\bGATED\b|\bCLOSED\b|\bPREPARED\b|\bCORRECTED\b|\bANSWERED\b|\bSUPERSEDED\b|\bRESTATEMENT\b|~~/;

export function parseRows(text) {
  const lines = text.split("\n");
  const rows = [];
  for (let i = 0; i < lines.length; i += 1) {
    const m = lines[i].match(ROW);
    if (!m) continue;
    let block = lines[i];
    for (let j = i + 1; j < lines.length && !/^- \*\*/.test(lines[j]) && !/^#{2,3}\s/.test(lines[j]); j += 1) {
      block += ` ${lines[j]}`;
    }
    rows.push({ id: m[1], line: i + 1, resolved: RESOLVED.test(block) });
  }
  return rows;
}

export function liveDuplicates(rows) {
  const byId = new Map();
  for (const r of rows) {
    if (r.resolved) continue;
    if (!byId.has(r.id)) byId.set(r.id, []);
    byId.get(r.id).push(r.line);
  }
  return [...byId.entries()].filter(([, ls]) => ls.length > 1);
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

if (process.argv[1] && process.argv[1].endsWith("test-backlog-identifiers.mjs")) {
  console.log("ID-3 — one live row per backlog identifier\n");

  const text = readFileSync(BACKLOG, "utf8");
  const rows = parseRows(text);

  // Positive controls first: a parser that matches nothing would report a
  // clean file, and a resolution regex that matches everything would report
  // no live rows at all. Both must be shown to discriminate (V8).
  console.log("positive controls\n");

  check("the row parser finds rows, and rejects a sub-bullet id", () => {
    assert(rows.length > 50, `parsed only ${rows.length} rows — the format may have changed`);
    const probe = parseRows("- **BM-1 folded in (same file, same root cause):** text\n");
    assert(probe.length === 0, `read a sub-bullet as a row: ${JSON.stringify(probe)}`);
    const good = parseRows("- **RS-5 — the top-level scan stamp drifts.** text\n");
    assert(good.length === 1 && good[0].id === "RS-5", `failed on a real row: ${JSON.stringify(good)}`);
  });

  check("the resolution marker discriminates", () => {
    const resolved = rows.filter((r) => r.resolved).length;
    const live = rows.length - resolved;
    assert(resolved > 0, "no row reads as resolved — the marker regex matches nothing");
    assert(live > 0, "every row reads as resolved — the marker regex matches everything");
    console.log(`      (${rows.length} rows: ${live} live, ${resolved} resolved)`);
  });

  check("a planted collision is detected", () => {
    const planted = parseRows(
      "- **XX-9 — first one.** body\n- **XX-9 — second one.** body\n"
    );
    const dups = liveDuplicates(planted);
    assert(dups.length === 1 && dups[0][0] === "XX-9", `planted collision not detected: ${JSON.stringify(dups)}`);
    const okPair = parseRows(
      "- **XX-9 — DONE, first one.** body\n- **XX-9 — second one.** body\n"
    );
    assert(
      liveDuplicates(okPair).length === 0,
      "a done row plus a live row was reported as a collision — history must be allowed"
    );
  });

  console.log("\nthe backlog itself\n");

  check("no identifier has more than one live row", () => {
    const dups = liveDuplicates(rows);
    assert(
      dups.length === 0,
      `${dups.length} identifier(s) with multiple live rows:\n    ` +
        dups.map(([id, ls]) => `${id} at lines ${ls.join(", ")}`).join("\n    ") +
        "\n    Mark the superseded row (DONE / SUPERSEDED / RESTATEMENT), or renumber the newer item from the " +
        "register maximum. Do not delete the older row: the history is the point."
    );
  });

  // End-to-end control: the fixture probe above proves the DETECTOR works;
  // this proves the GATE fails on the real file, which is a different claim.
  if (!process.argv.includes("--checks-only")) {
    const { assertGateCatches } = await import("./lib/probe.mjs");
    const { execFileSync } = await import("node:child_process");
    const self = fileURLToPath(import.meta.url);
    const run = () => {
      try {
        execFileSync(process.execPath, [self, "--checks-only"], { stdio: "ignore" });
        return true;
      } catch {
        return false;
      }
    };
    console.log("\nnegative control\n");
    try {
      await assertGateCatches({
        file: BACKLOG,
        label: "a second live row for an existing id is caught",
        mutate: (t) => {
          // Duplicate a real, currently-live identifier.
          const live = parseRows(t).find((r) => !r.resolved);
          if (!live) throw new Error("no live row found to duplicate");
          return `- **${live.id} — planted duplicate for the negative control.** body\n\n${t}`;
        },
        run,
      });
      passed += 1;
      console.log("  ok  a second live row for an existing id is caught");
    } catch (e) {
      failures.push(`negative control: ${e.message}`);
      console.log(`  FAIL negative control: ${e.message}`);
    }
  }

  console.log(`\n${passed} passed, ${failures.length} failed`);
  if (failures.length > 0) {
    console.log("");
    console.log("A queue that lists finished work as open cannot be ranked honestly, and the loop ranks from");
    console.log("this file. Reconcile before selecting the next item.");
    process.exit(1);
  }
}
