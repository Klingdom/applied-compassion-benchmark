#!/usr/bin/env node
/**
 * test-unattended-authority.mjs — gate for backlog AUT-3 (Iteration 101).
 *
 * AUTONOMY.md §1b: every push and every deploy is a founder action. scripts/nightly-pipeline.sh is built to run
 * unattended from cron, so it must not push or rebuild production on its own authority. Each executable
 * `git push` must sit in a branch entered only when ALLOW_UNATTENDED_PUSH is "1". Each `docker compose build|up`
 * must sit in a branch entered only when ALLOW_UNATTENDED_DEPLOY is "1": either the then-branch of an
 * `= "1"` test, or an else-branch after a `!= "1"` test in the same if-chain.
 *
 * The checker tracks bash if/elif/else/fi nesting; comments and log strings are ignored. Planted probes run
 * first, through the same checker (V3/V8): an unguarded push, an unguarded rebuild and a guard on the wrong
 * variable must each fail, and the real file must pass.
 */
import { readFileSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(here, "..", "..");
const NL = String.fromCharCode(10);

const ACTIONS = [
  { name: "git push", re: /^\s*git\s+push\b/, variable: "ALLOW_UNATTENDED_PUSH" },
  { name: "docker compose build/up", re: /^\s*docker\s+compose\s+(build|up)\b/, variable: "ALLOW_UNATTENDED_DEPLOY" },
];

function positive(cond, v) { return cond.includes(v) && /=\s*"1"/.test(cond.slice(cond.indexOf(v))) && !/!=\s*"1"/.test(cond.slice(cond.indexOf(v))); }
function negative(cond, v) { return cond.includes(v) && /!=\s*"1"/.test(cond.slice(cond.indexOf(v))); }

export function check(text) {
  const problems = [];
  const stack = []; // frames: { conds: [string], inElse: bool }
  const lines = text.split(NL);
  let seen = 0;
  lines.forEach((raw, i) => {
    const line = raw.replace(/\r$/, "");
    const code = line.trim();
    if (code.startsWith("#")) return;
    if (/^if\s/.test(code)) stack.push({ conds: [code], inElse: false });
    else if (/^elif\s/.test(code) && stack.length) stack[stack.length - 1].conds.push(code);
    else if (/^else\b/.test(code) && stack.length) stack[stack.length - 1].inElse = true;
    else if (/^fi\b/.test(code)) stack.pop();
    for (const a of ACTIONS) {
      if (!a.re.test(line)) continue;
      seen += 1;
      const guarded = stack.some((f) => {
        const current = f.conds[f.conds.length - 1];
        if (!f.inElse) return positive(current, a.variable);
        return f.conds.some((c) => negative(c, a.variable));
      });
      if (!guarded) problems.push(`line ${i + 1}: ${a.name} is not guarded by ${a.variable}="1": ${code}`);
    }
  });
  if (seen === 0) problems.push("no push or rebuild found: the checker is looking at the wrong file (V8)");
  return problems;
}

let failures = 0;
const fail = (m) => { failures += 1; console.error("FAIL " + m); };
const ok = (m) => console.log("  ok   " + m);

const real = readFileSync(join(REPO, "scripts", "nightly-pipeline.sh"), "utf8");

// Planted probes on in-memory copies of the real file.
const probes = [
  ["an unguarded push", real.replace(/if \[ "\$\{ALLOW_UNATTENDED_PUSH:-\}" = "1" \]; then/, "if true; then")],
  ["an unguarded rebuild", real.replace(/elif \[ "\$\{ALLOW_UNATTENDED_DEPLOY:-\}" != "1" \]; then/, "elif false; then")],
  ["a push guarded by the wrong variable", real.replace(/ALLOW_UNATTENDED_PUSH:-\}" = "1"/, 'ALLOW_UNATTENDED_DEPLOY:-}" = "1"')],
];
for (const [label, text] of probes) {
  if (text === real) { fail(`probe "${label}" did not mutate the file (its pattern no longer matches)`); continue; }
  if (check(text).length === 0) fail(`probe "${label}" was NOT caught`);
  else ok(`probe caught: ${label}`);
}

const problems = check(real);
if (problems.length) for (const p of problems) fail(`scripts/nightly-pipeline.sh ${p}`);
else ok("scripts/nightly-pipeline.sh: every push and production rebuild requires an explicit founder opt-in");

if (failures) { console.error(`${failures} failure(s)`); process.exit(1); }
console.log("test-unattended-authority: PASS");
