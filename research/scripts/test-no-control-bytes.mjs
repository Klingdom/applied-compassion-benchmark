#!/usr/bin/env node
/**
 * test-no-control-bytes.mjs — DC-21.
 *
 * Fails if a tracked text file contains a C0 control byte other than newline,
 * carriage return or tab.
 *
 * WHY
 *   Control bytes get into source by accident, they are invisible in every
 *   diff and review, and they break things in ways that look like something
 *   else entirely. Three occurrences before this gate existed:
 *
 *   1. Earlier in 2026: raw 0x1e/0x1f bytes landed in a script via inline
 *      shell. Three separate "fixes" reported success while `od -c` disagreed.
 *   2. 2026-09-29: a heredoc collapsed the two characters backslash-b into a
 *      literal 0x08 inside a regex in `test-bank-claims.mjs`. The regex could
 *      never match, so a drift check returned a confident zero while the thing
 *      it checked was full of matches. The same regex returned 22 when typed
 *      by hand. Diagnosed only by `od -c`.
 *   3. 2026-09-29, found by the baseline scan for this gate: `--pretty=%h?%ad?%s`
 *      in `test-iteration-log-silence.mjs` and the item-hash separator in
 *      `validate-submission.mjs` were both raw bytes rather than escapes. Both
 *      worked — but the second defines a hash in the submission protocol, so an
 *      editor silently eating that byte would change every item hash and reject
 *      valid submissions with no visible cause.
 *
 * THE RULE
 *   A control character in source is written as an explicit escape —
 *   `String.fromCharCode(31)` — never embedded raw. The escape survives copy,
 *   paste, diff, review and editors; the raw byte survives none of them
 *   reliably.
 *
 * BASELINE, measured before this gate was written: 2 files of 5,828 tracked
 * text files contained one. Both were repaired first, so this is a ratchet from
 * zero rather than a cleanup with an allowlist.
 */

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = join(__dirname, "..", "..");

const TEXT = /\.(mjs|cjs|js|ts|tsx|json|md|yml|yaml|sh|conf|css|html)$/;

/** Newline, carriage return and tab are the only C0 bytes allowed in text. */
const ALLOWED = new Set([9, 10, 13]);

function isControl(byte) {
  return byte < 32 && !ALLOWED.has(byte);
}

let failures = 0;
const fail = (msg) => {
  failures += 1;
  console.log(`FAIL: ${msg}`);
};

// ---- Check A: the scan works at all (V8) -------------------------------
console.log("Check A — the detector is not vacuous");
{
  const probe = Buffer.from(`ok${String.fromCharCode(8)}ok`);
  const found = [...probe].filter(isControl).length;
  if (found !== 1) fail(`positive control: a planted 0x08 was not detected (found ${found}). Any clean result below is meaningless.`);
  else console.log("  ok: a planted 0x08 is detected");

  const clean = Buffer.from("ordinary text\n\twith a tab\r\n");
  const falsePositives = [...clean].filter(isControl).length;
  if (falsePositives !== 0) fail(`negative control: newline/tab/CR flagged as control bytes (${falsePositives})`);
  else console.log("  ok: newline, tab and carriage return are not flagged");
}

// ---- Check B: no tracked text file carries one -------------------------
console.log("\nCheck B — no tracked text file contains a control byte");
let files;
try {
  files = execFileSync("git", ["ls-files"], { cwd: REPO, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 })
    .split(/\r?\n/)
    .filter(Boolean)
    .filter((f) => TEXT.test(f));
} catch (e) {
  fail(`could not list tracked files — ${e.message}`);
  files = [];
}

if (files.length < 500) {
  fail(`VACUOUS: only ${files.length} tracked text files found. Refusing to report clean on a scan that saw almost nothing.`);
} else {
  console.log(`  scanning ${files.length} tracked text files`);
}

let offenders = 0;
for (const rel of files) {
  let buf;
  try {
    buf = readFileSync(join(REPO, rel));
  } catch {
    continue;
  }
  for (let i = 0; i < buf.length; i += 1) {
    if (isControl(buf[i])) {
      offenders += 1;
      const hex = `0x${buf[i].toString(16).padStart(2, "0")}`;
      fail(
        `${rel} contains ${hex} at byte offset ${i}. Write it as an explicit escape ` +
          `(e.g. String.fromCharCode(${buf[i]})) instead of embedding the raw byte — it is invisible in a diff ` +
          "and some editors eat it silently."
      );
      break;
    }
  }
}
if (offenders === 0 && files.length >= 500) console.log("  ok: none found");

console.log("");
if (failures > 0) {
  console.log(`FAIL — ${failures} failure(s)`);
  process.exit(1);
}
console.log("PASS — no raw control bytes in tracked source.");
