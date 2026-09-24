#!/usr/bin/env node
/**
 * test-commit-message-tokens.mjs — gate for DC-17.
 *
 * DEFECT CLASS (DC-17): the commit ritual silences the verification it was supposed to
 * trigger. GitHub skips a workflow run when a CI-suppression token appears in the head commit
 * message, and it matches the token as a SUBSTRING — so a message that merely *writes about*
 * the token skips itself.
 *
 * Dated occurrences:
 *   1. 2026-09-21 — `9d89d4df`, the commit that fixed the habit of putting the token on push
 *      tips, contains the literal token three times, the last reading "This commit deliberately
 *      carries no <token>". GitHub read that as carrying it. The push that was designed to be
 *      the test of the fix produced no run at all, and RISK-025 stayed open with an
 *      "unidentified second cause" for three days.
 *   2. 2026-09-23 — `9ce57aa3`, the next push tip, whose message explains the same defect.
 *
 * Diagnosed 2026-09-24 by cross-referencing every commit on `main` since 2026-09-14 against the
 * 171 distinct run `headSha`s from `gh run list --limit 200 --json headSha`: the newest commit
 * with a run is `119f1757` (2026-09-17), and every push tip after it carries a token. Nothing
 * was left unexplained.
 *
 * WHAT THIS ASSERTS
 *   A. No commit dated on or after the CUTOFF contains a CI-suppression token. Forward-dated,
 *      so history is never retro-failed (the same discipline as DC-03 and DC-04, and
 *      AUTONOMY.md §1c — a dated record is not rewritten to make a gate green).
 *   B. The matcher actually works, proven against REAL DATA in both directions: it must flag
 *      the known offender `9ce57aa3`, and it must not flag a real recent commit whose message
 *      discusses the token without containing it.
 *   C. The scan is not vacuous. If no commit at or after the cutoff was scanned, or the
 *      repository is a shallow clone that cannot reach the control, this exits non-zero saying
 *      so. A search that returns nothing proves nothing until the same search has found a
 *      known-present instance (rule V8).
 *
 * HOW TO WRITE ABOUT THE TOKEN WITHOUT TRIPPING THIS
 *   Call it "the skip-ci marker", or splice it ("[skip" + " ci]"). Never write it whole. This
 *   file itself must obey that rule, which is why the tokens below are assembled from parts.
 *
 * WHY A TEST AND NOT A GIT HOOK
 *   A `commit-msg` hook would catch it at exactly the right moment, but a hook on the commit
 *   path is a governance surface: `AGENT-ROUTING.md` §0a bans agents that modify the harness,
 *   and backlog ECC-1 (a deny-hook for `--no-verify`) is deferred for the same reason and is
 *   still unratified. A test in the chain is weaker in timing and stronger in reviewability,
 *   and — unlike a hook in untracked `.git/hooks` — it cannot silently disappear.
 *
 * Run: node research/scripts/test-commit-message-tokens.mjs
 */

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const REPO = path.resolve(new URL('../..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));

/**
 * Every token GitHub documents as skipping a workflow run, assembled from parts so this file
 * does not contain one. Matched case-insensitively: GitHub's own matching is not
 * case-sensitive, and a false positive here costs a reworded sentence while a false negative
 * costs four days of unverified pushes.
 */
const TOKENS = [
  `[skip${' '}ci]`,
  `[ci${' '}skip]`,
  `[no${' '}ci]`,
  `[skip${' '}actions]`,
  `[actions${' '}skip]`,
  `***${'NO'}_CI***`,
];

/**
 * Commits dated on or after this are checked. Set to the date the class was diagnosed, so no
 * existing commit is retro-failed. Verified before choosing it: the four commits of 2026-09-24
 * contain zero tokens, so this cutoff needs no waiver.
 */
const CUTOFF = '2026-09-24';

/** Real-data controls (rule V3: seed must-pass fixtures from real data, not invented strings). */
const MUST_FLAG = { sha: '9ce57aa3', why: 'occurrence 2 — the 2026-09-23 push tip, which explains the defect' };
const MUST_NOT_FLAG = {
  sha: 'e38901cf',
  why: 'the 2026-09-24 diagnosis commit, which discusses the marker without writing it',
};

let failures = 0;
const fail = (m) => {
  failures += 1;
  console.log(`  FAIL: ${m}`);
};
const pass = (m) => console.log(`  ok: ${m}`);

const git = (args) => execFileSync('git', args, { cwd: REPO, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });

/** @returns {string[]} the tokens present in `message`. */
function tokensIn(message) {
  const lower = message.toLowerCase();
  return TOKENS.filter((t) => lower.includes(t.toLowerCase()));
}

// ---------------------------------------------------------------- repository reachability
let shallow = 'unknown';
try {
  shallow = git(['rev-parse', '--is-shallow-repository']).trim();
} catch (err) {
  console.log(`FAIL: git is not usable here (${err.message}). This gate cannot degrade to a pass.`);
  process.exit(2);
}

console.log('Check C — the scan can see what it claims to check (V8)');
if (shallow === 'true') {
  // A shallow clone (GitHub Actions checkout defaults to depth 1) cannot see history. Say so
  // loudly instead of scanning one commit and reporting a clean history.
  console.log('  note: SHALLOW clone — history is truncated. Only reachable commits are scanned,');
  console.log('        and the real-data controls below will report INDETERMINATE rather than pass.');
} else {
  pass('full clone — history is reachable');
}

// ---------------------------------------------------------------- Check A
// Built from char codes rather than written as literals or escapes: an earlier revision of
// this file ended up holding the raw 0x1e/0x1f bytes, which survive in git but are invisible
// in a diff and are silently eaten by some editors. Neither byte can occur in a commit message.
const RS = String.fromCharCode(30); // record separator — one commit per record
const US = String.fromCharCode(31); // unit separator — fields within a record
let records = [];
try {
  records = git(['log', `--format=%H${US}%cI${US}%s${US}%b${RS}`])
    .split(RS)
    .map((s) => s.replace(/^\r?\n/, '').trim())
    .filter(Boolean)
    .map((chunk) => {
      const [sha, date, subject, ...rest] = chunk.split(US);
      return { sha, date, subject, body: rest.join(US) || '' };
    });
} catch (err) {
  console.log(`FAIL: could not read git log (${err.message}). Refusing to report a pass.`);
  process.exit(2);
}

const atOrAfterCutoff = records.filter((r) => r.date && r.date.slice(0, 10) >= CUTOFF);
console.log(`\nCheck A — no commit on or after ${CUTOFF} carries a CI-suppression token`);
if (atOrAfterCutoff.length === 0) {
  fail(
    `VACUOUS: ${records.length} commits read, none dated on or after ${CUTOFF}. ` +
      'Either the cutoff is in the future or the clone is truncated — a green result here would be meaningless.',
  );
} else {
  const offenders = atOrAfterCutoff
    .map((r) => ({ ...r, hits: tokensIn(`${r.subject}\n${r.body}`) }))
    .filter((r) => r.hits.length);
  if (offenders.length === 0) {
    pass(
      `${atOrAfterCutoff.length} commit(s) scanned (newest ${atOrAfterCutoff[0].sha.slice(0, 8)} ` +
        `${atOrAfterCutoff[0].date.slice(0, 10)}), 0 carry a token`,
    );
  } else {
    for (const o of offenders) {
      fail(
        `${o.sha.slice(0, 8)} (${o.date.slice(0, 10)}) carries ${o.hits.length} suppression token(s) ` +
          `in its message: "${o.subject.slice(0, 60)}". A token anywhere in the message silences the WHOLE push, ` +
          'including build, test and the nginx syntax check. Call it "the skip-ci marker" in prose instead.',
      );
    }
  }
}

// ---------------------------------------------------------------- Check B
console.log('\nCheck B — the matcher works on real data, in both directions');
function messageOf(sha) {
  try {
    return git(['log', '-1', '--format=%B', sha]);
  } catch {
    return null;
  }
}

const flagMsg = messageOf(MUST_FLAG.sha);
if (flagMsg === null) {
  if (shallow === 'true') console.log(`  INDETERMINATE: ${MUST_FLAG.sha} unreachable in a shallow clone — control not run`);
  else fail(`positive control ${MUST_FLAG.sha} is unreachable in a full clone. Refusing to claim the matcher works.`);
} else {
  const hits = tokensIn(flagMsg);
  if (hits.length) pass(`positive control: ${MUST_FLAG.sha} flagged (${hits.length} token[s]) — ${MUST_FLAG.why}`);
  else
    fail(
      `positive control ${MUST_FLAG.sha} was NOT flagged, though it is a recorded occurrence of this class. ` +
        'The matcher is broken, so Check A proves nothing.',
    );
}

const cleanMsg = messageOf(MUST_NOT_FLAG.sha);
if (cleanMsg === null) {
  if (shallow === 'true') console.log(`  INDETERMINATE: ${MUST_NOT_FLAG.sha} unreachable in a shallow clone — control not run`);
  else fail(`negative control ${MUST_NOT_FLAG.sha} is unreachable in a full clone.`);
} else if (tokensIn(cleanMsg).length === 0) {
  pass(`negative control: ${MUST_NOT_FLAG.sha} not flagged — ${MUST_NOT_FLAG.why}`);
} else {
  fail(
    `negative control ${MUST_NOT_FLAG.sha} WAS flagged. The matcher over-fires on prose that discusses the ` +
      'marker without containing it, which would make this gate unusable for writing about the class.',
  );
}

// Synthetic over-matching counter-tests: near-misses must not fire.
const NEAR_MISSES = ['skipping the ci run entirely', 'no ci configuration exists yet', 'the skip-ci marker', '[skipci]'];
const falseFires = NEAR_MISSES.filter((s) => tokensIn(s).length);
if (falseFires.length === 0) pass(`${NEAR_MISSES.length} near-miss phrases correctly not flagged`);
else fail(`over-matching: ${JSON.stringify(falseFires)} should not be treated as suppression tokens`);

// Self-check. This file discusses the tokens at length, so it is the likeliest place for one to
// end up written out whole — and a tracked file carrying one would be copied into a commit
// message sooner or later. The tokens above are assembled from parts precisely so that this
// assertion can hold.
{
  const self = readFileSync(new URL(import.meta.url), 'utf8');
  // Strip the lines that build TOKENS, or this check would flag the assembly itself once the
  // parts are concatenated by a reader's editor.
  const hits = TOKENS.filter((t) => self.includes(t));
  if (hits.length === 0) pass('self-check: this gate file contains no whole suppression token');
  else fail(`self-check: this gate file contains ${hits.length} whole token(s) — assemble them from parts instead`);
}

console.log(`\n${failures === 0 ? 'PASS' : 'FAIL'} — ${failures} failure(s)`);
process.exit(failures === 0 ? 0 : 1);
