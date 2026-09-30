#!/usr/bin/env node
/**
 * test-health-freshness.mjs — HEALTH-1.
 *
 * SYSTEM_HEALTH.md is the file a reader checks to find out whether the system
 * is healthy. On 2026-09-30 it was found to have skipped Iterations 54 to 60:
 * its top status notes jumped from 53 to 61, and its last-change line claimed a
 * 45-step test chain against an actual 50. For seven consecutive iterations the
 * health file described a system several changes old, and nothing said so.
 *
 * That is the DC-16 shape — an artifact whose update depends on an author
 * remembering — and remembering has now failed seven times in a row. Seven
 * failures is not a lapse, it is the absence of a control.
 *
 * FOUR CHECKS, each chosen because it is mechanical and because the figure it
 * guards has already rotted:
 *
 *   1  FRESHNESS   The iteration named in "Last change:" must be the newest
 *                  iteration in ITERATION_LOG.md. This is the one that catches
 *                  the seven-iteration gap, and it catches it on the next
 *                  commit rather than seven later.
 *   2  CHAIN       The step count in the "## Tests" heading must equal the real
 *                  length of the npm test chain. It read 45 against 50.
 *   3  RISKS       The row count and highest id in the "## Risks" heading must
 *                  match RISKS.md. The heading publishes the command that
 *                  regenerates them, so there is no excuse for drift; S11 says
 *                  a status figure is generated, not typed.
 *
 *                  It deliberately does NOT check a resolved/closed count. The
 *                  heading used to claim "8 marked resolved/closed" and the
 *                  first version of this gate reported 6, which looked like a
 *                  catch and was not: the Status cells are free text —
 *                  "Mitigated (delivery) — Open (verification gap)", "Open,
 *                  deliberately unresolved pending a decision", "Open — one
 *                  face closed", "Open, actively mitigated". Literal
 *                  resolved|closed gives 5; adding mitigated|remediated|fixed
 *                  gives 10; the published figure was 8. Three defensible rules,
 *                  three answers, so the quantity does not exist. The fix was to
 *                  stop publishing it rather than to pick a rule and call the
 *                  other two wrong — and the near-miss is worth recording,
 *                  because a gate that "finds" a defect in a true claim is the
 *                  most expensive kind of false positive.
 *   4  COMMITTEDNESS  Any claim that a test script is "uncommitted" or "pending
 *                  commit" must still be true. Two such annotations survived
 *                  into a file where the scripts had long since been committed,
 *                  which makes a reader distrust the parts that are right.
 *
 * WHAT THIS DELIBERATELY DOES NOT CHECK
 *   The dated status notes and the archive. Those are historical records and
 *   are correct as of their dates by design; AUTONOMY §1c forbids retro-editing
 *   them. A freshness gate that demanded they be current would be demanding the
 *   one thing that must never happen.
 *
 * Usage:
 *   node research/scripts/test-health-freshness.mjs                # checks + negative controls
 *   node research/scripts/test-health-freshness.mjs --checks-only  # checks only (used by the controls)
 */

import { readFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = join(__dirname, "..", "..");
const HEALTH = join(REPO, "SYSTEM_HEALTH.md");
const LOG = join(REPO, "ITERATION_LOG.md");
const PKG = join(REPO, "site", "package.json");
const RISKS = join(REPO, "RISKS.md");

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

/**
 * Everything above the archive heading. The archive is verbatim history and is
 * out of scope; so are the dated notes, which is why callers slice further.
 */
export function liveSection(text) {
  const i = text.indexOf("## Archive");
  return i === -1 ? text : text.slice(0, i);
}

/** Status-note lines start with "> ". Strip them so history is not audited. */
export function auditableText(text) {
  return liveSection(text)
    .split("\n")
    .filter((l) => !l.startsWith(">"))
    .join("\n");
}

/**
 * Remove double-quoted spans. A citation is not an assertion.
 *
 * This exists because both prose-scanning checks below failed on the prose that
 * explains them. Correcting the file to say *the "pending commit" note here was
 * stale* made check 4 fire on the correction; rewriting the Risks heading to
 * say it no longer publishes "8 marked resolved/closed" made check 3b fire on
 * that sentence. It is the fourth time in this project that an assertion about
 * a document has matched the document's own description of the rule — after the
 * probe.mjs git check, the destructive-git gate and the preflight read-only
 * check.
 *
 * The lesson generalises past this file: when a check must read prose, it has
 * to distinguish a claim from a quotation of a claim, and the quotation marks
 * are the only mechanical signal available. Backticks are left alone, because
 * the identifiers the checks need to find live inside them.
 */
export function stripCitations(text) {
  return text.replace(/"[^"\n]*"/g, " ").replace(/“[^”\n]*”/g, " ");
}

export function healthLastChangeIteration(text) {
  const m = text.match(/^Last change:\s*Iteration\s*(\d+)/m);
  return m ? Number(m[1]) : null;
}

export function newestLoggedIteration(text) {
  const nums = [...text.matchAll(/^##\s*Iteration\s*(\d+)/gm)].map((m) => Number(m[1]));
  return nums.length === 0 ? null : Math.max(...nums);
}

export function healthChainSteps(text) {
  const m = text.match(/##\s*Tests\s*\(`npm run test`,\s*\*\*(\d+)\s*steps\*\*/);
  return m ? Number(m[1]) : null;
}

export function realChainSteps() {
  return JSON.parse(readFileSync(PKG, "utf8")).scripts.test.split("&&").length;
}

export function healthRiskFigures(text) {
  const m = text.match(/##\s*Risks\s*\(RISKS\.md\s*—\s*\*\*(\d+)\s*rows\*\*,\s*highest id\s*(RISK-\d+)/);
  return m ? { rows: Number(m[1]), highest: m[2] } : null;
}

export function realRiskFigures() {
  const text = readFileSync(RISKS, "utf8");
  const rowLines = text.split("\n").filter((l) => /^\|\s*RISK-\d+\s*\|/.test(l));
  const ids = rowLines.map((l) => l.match(/^\|\s*(RISK-\d+)\s*\|/)[1]);
  const highest = ids.reduce((a, b) => (Number(b.slice(5)) > Number(a.slice(5)) ? b : a), ids[0]);
  return { rows: rowLines.length, highest };
}

/**
 * Script paths claimed to be uncommitted.
 *
 * Scoped to the annotation, not the line. The first version scanned whole
 * lines, and the "## Tests" section is one very long line that lists every
 * script in the chain and happens to contain the word "uncommitted" twice — so
 * it reported all twelve scripts on that line as stale claims, of which ten
 * were nothing to do with the annotation. A check whose output is mostly noise
 * gets ignored, which is the same as not having it.
 *
 * So: for each annotation, look back a short window and take the NEAREST
 * preceding script reference. Both spellings occur in the file — `test:name`
 * (the npm script) and `test-name` (the file stem) — and only matching one of
 * them would silently miss half the cases.
 */
export function claimedUncommitted(text, scripts) {
  const body = stripCitations(auditableText(text));
  const out = [];
  const WINDOW = 90;
  for (const m of body.matchAll(/\buncommitted\b|\bpending commit\b/gi)) {
    const before = body.slice(Math.max(0, m.index - WINDOW), m.index);
    const refs = [...before.matchAll(/\btest[:-]([a-z0-9-]+)\b/g)];
    if (refs.length === 0) continue;
    const name = refs[refs.length - 1][1];
    const cmd = scripts[`test:${name}`];
    if (!cmd) continue;
    const rel = cmd.replace(/^node\s+/, "").split(/\s+/)[0];
    out.push({ script: `test:${name}`, path: rel, annotation: m[0] });
  }
  return out;
}

function isTracked(relFromSite) {
  // package.json commands are relative to site/.
  const p = join(REPO, "site", relFromSite);
  if (!existsSync(p)) return false;
  try {
    execFileSync("git", ["ls-files", "--error-unmatch", p], { cwd: REPO, stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------

if (process.argv[1] && process.argv[1].endsWith("test-health-freshness.mjs")) {
  const health = readFileSync(HEALTH, "utf8");
  const log = readFileSync(LOG, "utf8");
  const pkg = JSON.parse(readFileSync(PKG, "utf8"));

  console.log("SYSTEM_HEALTH.md freshness\n");

  check("1 the last-change line names the newest logged iteration", () => {
    const claimed = healthLastChangeIteration(health);
    const newest = newestLoggedIteration(log);
    assert(claimed !== null, 'no "Last change: Iteration N" line found in SYSTEM_HEALTH.md');
    assert(newest !== null, 'no "## Iteration N" heading found in ITERATION_LOG.md');
    assert(
      claimed === newest,
      `SYSTEM_HEALTH says Iteration ${claimed}, ITERATION_LOG's newest is ${newest}. ` +
        `The health file is ${newest - claimed} iteration(s) behind. Update it — or, if a change genuinely ` +
        `did not affect system health, say so on the last-change line rather than leaving it stale.`
    );
  });

  check("2 the Tests heading step count matches the real chain", () => {
    const claimed = healthChainSteps(health);
    const real = realChainSteps();
    assert(claimed !== null, 'could not parse the step count out of the "## Tests" heading');
    assert(claimed === real, `heading says ${claimed} steps, package.json chain has ${real}`);
  });

  check("3 the Risks heading figures match RISKS.md", () => {
    const claimed = healthRiskFigures(health);
    const real = realRiskFigures();
    assert(claimed !== null, 'could not parse the figures out of the "## Risks" heading');
    assert(claimed.rows === real.rows, `heading says ${claimed.rows} rows, RISKS.md has ${real.rows}`);
    assert(claimed.highest === real.highest, `heading says highest id ${claimed.highest}, RISKS.md has ${real.highest}`);
  });

  check("3b the Risks heading publishes no resolved/closed count", () => {
    const m = liveSection(health).match(/##\s*Risks\s*\([^)]*\)/);
    assert(m, 'could not find the "## Risks" heading');
    // A digit immediately before the phrase is the figure; the phrase alone is
    // the file explaining that it does not publish one.
    assert(
      !/\d+\s*(?:rows?\s+)?marked\s+resolved|\d+\s*resolved\/closed/i.test(stripCitations(m[0])),
      "the heading publishes a resolved/closed count again. RISKS.md Status cells are free text, and three " +
        "defensible rules give 5, 8 and 10 — so the figure cannot be regenerated and does not belong in a " +
        "status file. State the statuses in RISKS.md instead."
    );
  });

  check("4 nothing is described as uncommitted that has since been committed", () => {
    const claims = claimedUncommitted(health, pkg.scripts);
    const wrong = claims.filter((c) => isTracked(c.path));
    assert(
      wrong.length === 0,
      `${wrong.length} stale "uncommitted" annotation(s): ` +
        wrong.map((w) => `${w.script} -> ${w.path} is tracked by git`).join("; ")
    );
  });

  // -------------------------------------------------------------------------
  // Negative controls. A check that has only ever run against a clean file has
  // not been shown to detect anything. Each plants the exact defect the check
  // exists for, requires the gate to fail, and requires it to pass again after
  // restore — probe.mjs verifies the restore by sha256 and refuses a mutation
  // that changes nothing, which is what caught a broken probe earlier today.
  //
  // Skipped under --checks-only so the child process the controls spawn does
  // not recurse into its own controls.
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

    const controls = [
      {
        label: "1 a stale last-change line is caught",
        file: HEALTH,
        // The defect that went unnoticed for seven iterations.
        mutate: (t) => t.replace(/^Last change:\s*Iteration\s*\d+/m, "Last change: Iteration 1"),
      },
      {
        label: "2 a wrong chain step count is caught",
        file: HEALTH,
        mutate: (t) =>
          t.replace(/(##\s*Tests\s*\(`npm run test`,\s*\*\*)(\d+)(\s*steps\*\*)/, "$1999$3"),
      },
      {
        label: "2b adding a chain step without updating the heading is caught",
        file: PKG,
        mutate: (t) => {
          const pkgObj = JSON.parse(t);
          pkgObj.scripts.test += " && npm run test:lint";
          return `${JSON.stringify(pkgObj, null, 2)}\n`;
        },
      },
      {
        label: "3 a wrong risk row count is caught",
        file: HEALTH,
        mutate: (t) => t.replace(/(##\s*Risks\s*\(RISKS\.md\s*—\s*\*\*)(\d+)(\s*rows\*\*)/, "$1999$3"),
      },
      {
        label: "3c a new RISKS row without a heading update is caught",
        file: RISKS,
        mutate: (t) => `${t}\n| RISK-999 | probe | Low | Low | probe | probe | probe | Open |\n`,
      },
      {
        label: "3b re-publishing a resolved/closed figure is caught",
        file: HEALTH,
        mutate: (t) =>
          t.replace(
            /(##\s*Risks\s*\(RISKS\.md\s*—\s*\*\*\d+\s*rows\*\*, highest id RISK-\d+);/,
            "$1, 8 marked resolved/closed;"
          ),
      },
      {
        label: "4 a stale uncommitted annotation is caught",
        file: HEALTH,
        mutate: (t) => t.replace("- **Methodology:**", "- `test:no-stale-counts` is uncommitted.\n- **Methodology:**"),
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
    console.log("SYSTEM_HEALTH.md is the file a reader checks first. A stale figure there is worse than");
    console.log("no figure, because it is indistinguishable from a measured one.");
    process.exit(1);
  }
}
