#!/usr/bin/env node
/**
 * test-probe-helper.mjs — GI-3.
 *
 * The probe helper exists so that restoring a planted file is shorter to type
 * than `git checkout -- <path>`. That only holds if it is trustworthy, so its
 * own guarantees are tested here — above all that a restore is byte-exact and
 * that a failure inside the probe body cannot leave the defect behind.
 */

import { writeFileSync, readFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { withPlanted, assertGateCatches } from "./lib/probe.mjs";

let passed = 0;
let failed = 0;
const assert = (label, cond, detail = "") => {
  if (cond) {
    passed += 1;
    console.log(`  PASS  ${label}`);
  } else {
    failed += 1;
    console.log(`  FAIL  ${label}${detail ? ` — ${detail}` : ""}`);
  }
};
const sha = (b) => createHash("sha256").update(b).digest("hex");

const dir = mkdtempSync(join(tmpdir(), "probe-test-"));
const file = join(dir, "subject.txt");
const ORIGINAL = "line one\nline two\nline three\n";

function reset() {
  writeFileSync(file, ORIGINAL);
  return sha(readFileSync(file));
}

console.log("\nTest 1: the planted mutation is visible inside the body, and gone after");
{
  const before = reset();
  let sawPlanted = false;
  await withPlanted(
    file,
    (t) => t.replace("line two", "MUTATED"),
    () => {
      sawPlanted = readFileSync(file, "utf8").includes("MUTATED");
    }
  );
  assert("the body sees the mutated file", sawPlanted);
  assert("the file is byte-identical afterwards", sha(readFileSync(file)) === before);
}

console.log("\nTest 2: a throw inside the body STILL restores the file");
{
  const before = reset();
  let threw = false;
  try {
    await withPlanted(file, (t) => t.replace("line one", "BROKEN"), () => {
      throw new Error("assertion failed inside the probe");
    });
  } catch (e) {
    threw = /assertion failed inside the probe/.test(e.message);
  }
  assert("the error propagates to the caller", threw);
  assert(
    "the file is restored despite the throw — a failing probe cannot leave the defect behind",
    sha(readFileSync(file)) === before,
    "this is the whole point of the finally block"
  );
  assert("contents are exactly the original", readFileSync(file, "utf8") === ORIGINAL);
}

console.log("\nTest 3: a no-op mutation is refused");
{
  reset();
  let msg = "";
  try {
    await withPlanted(file, (t) => t, () => {});
  } catch (e) {
    msg = e.message;
  }
  assert("an identical mutation throws", /prove nothing/.test(msg), msg);
}

console.log("\nTest 4: a missing file is refused");
{
  let msg = "";
  try {
    await withPlanted(join(dir, "does-not-exist.txt"), (t) => `${t}x`, () => {});
  } catch (e) {
    msg = e.message;
  }
  assert("planting into a non-existent file throws", /does not exist/.test(msg), msg);
}

console.log("\nTest 5: assertGateCatches enforces BOTH halves of V3");
{
  reset();
  // A gate that genuinely detects the planted string.
  const realGate = () => !readFileSync(file, "utf8").includes("MUTATED");
  const ok = await assertGateCatches({
    file,
    mutate: (t) => t.replace("line two", "MUTATED"),
    run: realGate,
    label: "real gate",
  });
  assert("a gate that detects the defect is accepted", ok === true);

  // A gate that always passes must be rejected, not congratulated.
  let msg = "";
  try {
    await assertGateCatches({ file, mutate: (t) => t.replace("line two", "MUTATED"), run: () => true, label: "blind gate" });
  } catch (e) {
    msg = e.message;
  }
  assert("a gate that always passes is rejected", /PASSED with the defect planted/.test(msg), msg);

  // A gate that fails even on the clean file proves nothing either.
  let msg2 = "";
  try {
    await assertGateCatches({ file, mutate: (t) => `${t}x`, run: () => false, label: "broken gate" });
  } catch (e) {
    msg2 = e.message;
  }
  assert("a gate that fails on the clean file is rejected", /does not pass on the clean file/.test(msg2), msg2);

  assert("the subject file survived all of that intact", readFileSync(file, "utf8") === ORIGINAL);
}

console.log("\nTest 6: this helper contains no git command");
{
  const src = readFileSync(new URL("./lib/probe.mjs", import.meta.url), "utf8");
  // Structural, not textual. The file DISCUSSES `git checkout` in its own
  // explanation, so a prose scan false-positives on the very comment that tells
  // the next person not to add one. What matters is that it cannot run a
  // subprocess at all.
  assert("probe.mjs does not import child_process", !/node:child_process|require\(["']child_process["']\)/.test(src));
  assert("probe.mjs calls no exec or spawn function", !/\b(execFileSync|execSync|spawnSync|spawn|exec)\s*\(/.test(src));
  assert("probe.mjs says why, so the next person does not add one", /INC-010|never from git|banned for agents/.test(src));
}

rmSync(dir, { recursive: true, force: true });

console.log(`\n${"-".repeat(60)}`);
console.log(`TOTAL: ${passed} passed, ${failed} failed`);
console.log("-".repeat(60));
if (failed > 0) process.exit(1);
console.log("\nAll probe-helper tests passed.");
