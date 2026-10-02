#!/usr/bin/env node
/**
 * test-script-syntax.mjs — DC23-PARSE (Meta-review 9, forced selection under S10).
 *
 * DC-23 ("escape lost in shell transit") has 8 dated occurrences. A targeted regex scan
 * missed two of three broken strings on 2026-10-01; `node --check` caught all of them.
 * So the gate is the parser itself, run over EVERY git-tracked JavaScript module in the
 * repository (not a hand-kept list, which would rot as scripts are added).
 *
 * Positive controls run first, through the same checkFile() used for the real scan:
 *   1. a planted file with a raw line break inside a string literal MUST fail;
 *   2. a planted valid file MUST pass.
 * If either control misbehaves, the scan's verdict means nothing and the test fails (V8).
 *
 * Note: `node --check` parses; it does not catch the silent variant (a lost backslash
 * that still parses, e.g. a regex losing its escape). That variant is guarded by the
 * unit tests that own each normaliser (research/model-runs/tests/normalise.test.mjs).
 */
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "..", "..");
const NL = String.fromCharCode(10);

function checkFile(path) {
  const r = spawnSync(process.execPath, ["--check", path], { encoding: "utf8" });
  return { ok: r.status === 0, stderr: (r.stderr || "").trim() };
}

let failures = 0;
const fail = (msg) => { failures += 1; console.error("FAIL " + msg); };

// ---- Positive controls -------------------------------------------------------------
const tmp = mkdtempSync(join(tmpdir(), "cb-syntax-"));
try {
  const broken = join(tmp, "planted-broken.mjs");
  // A string literal split by a raw line feed: exactly what DC-23 occurrences 6-8 produced.
  writeFileSync(broken, 'const s = "line one' + NL + 'line two";' + NL + "export default s;" + NL);
  const valid = join(tmp, "planted-valid.mjs");
  writeFileSync(valid, "const s = String.fromCharCode(10);" + NL + "export default s;" + NL);

  if (checkFile(broken).ok) fail("control: planted raw line break inside a string was NOT rejected");
  else console.log("ok   control: planted raw line break rejected");
  if (!checkFile(valid).ok) fail("control: planted valid module was rejected");
  else console.log("ok   control: planted valid module accepted");
} finally {
  rmSync(tmp, { recursive: true, force: true });
}

// ---- Real scan ---------------------------------------------------------------------
let files;
try {
  const out = execFileSync("git", ["ls-files", "-z", "--", "*.mjs", "*.js", "*.cjs"], {
    cwd: repoRoot, encoding: "utf8", maxBuffer: 64 * 1024 * 1024,
  });
  files = out.split(String.fromCharCode(0)).filter(Boolean);
} catch (e) {
  fail("could not enumerate tracked files with git ls-files: " + e.message);
  files = [];
}

// Excluded: archived reference HTML assets (not executed by anything in this repo).
const EXCLUDE = [/^legacy-html\//];
const scan = files.filter((f) => !EXCLUDE.some((re) => re.test(f)));

// Floor, not an exact count: proves the enumeration actually found the tree (V8).
const MIN_EXPECTED = 150;
if (scan.length < MIN_EXPECTED) {
  fail("enumerated only " + scan.length + " tracked scripts (expected >= " + MIN_EXPECTED + "); the scan is not looking at the repo");
}

let checked = 0;
for (const rel of scan) {
  const abs = join(repoRoot, rel);
  if (!existsSync(abs)) continue; // deleted in the working tree but still in the index
  const r = checkFile(abs);
  checked += 1;
  if (!r.ok) fail(rel + NL + "     " + r.stderr.split(NL).slice(0, 4).join(NL + "     "));
}

console.log("checked " + checked + " of " + files.length + " tracked scripts (" + (files.length - scan.length) + " excluded by rule)");
if (failures > 0) {
  console.error(failures + " failure(s)");
  process.exit(1);
}
console.log("test-script-syntax: PASS");
