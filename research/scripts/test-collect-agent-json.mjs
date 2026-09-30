#!/usr/bin/env node
/**
 * test-collect-agent-json.mjs — TRI-7.
 *
 * The collector exists so that machine output is never retyped by a hand. That
 * only holds if it REFUSES rather than degrades: a collector that falls back to
 * "best effort" when the file is missing or malformed reintroduces exactly the
 * hand it was built to remove.
 */

import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT = fileURLToPath(new URL("./collect-agent-json.mjs", import.meta.url));

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

const dir = join(tmpdir(), `collect-test-${Date.now()}`);
const staging = join(dir, "staging");
mkdirSync(dir, { recursive: true });

/** @returns {{code:number, out:string}} */
function run(inFile, extra = []) {
  try {
    const out = execFileSync(
      process.execPath,
      [SCRIPT, "--in", inFile, "--agent", "probe", "--batch", "1", "--out", staging, ...extra],
      { encoding: "utf8", stdio: "pipe" }
    );
    return { code: 0, out };
  } catch (e) {
    return { code: e.status ?? 1, out: `${e.stdout ?? ""}${e.stderr ?? ""}` };
  }
}

const valid = '[{"item_id":"EQU-1-C","suspected":[5],"reason":"L5 rewards the wrong deadline.","rank":1},{"item_id":"ACT-1-C","suspected":[],"reason":"","rank":null}]';

console.log("\nTest 1: a well-formed file is parsed and staged");
{
  const f = join(dir, "good.json");
  writeFileSync(f, `${valid}\n`);
  const r = run(f);
  assert("exits 0", r.code === 0, r.out);
  const staged = existsSync(staging) ? readdirSync(staging) : [];
  assert("a staging file is written", staged.length === 1, staged.join(","));
  const parsed = JSON.parse(readFileSync(join(staging, staged[0]), "utf8"));
  assert("contents round-trip exactly", parsed.length === 2 && parsed[0].item_id === "EQU-1-C");
  assert("the filename carries batch and agent", /^batch-01--probe\.json$/.test(staged[0]), staged[0]);
  assert("it states its provenance", /Nothing was retyped/.test(r.out));
}

console.log("\nTest 2: it REFUSES rather than degrading");
{
  const missing = run(join(dir, "does-not-exist.json"));
  assert("a missing file exits non-zero", missing.code !== 0);
  assert(
    "and says not to transcribe the prose instead",
    /do not transcribe/i.test(missing.out),
    "the message is the control: the obvious wrong move must be named"
  );

  const prose = join(dir, "prose.txt");
  writeFileSync(prose, "I reviewed the four items and found two problems.\n");
  assert("prose instead of JSON exits non-zero", run(prose).code !== 0);

  const broken = join(dir, "broken.json");
  writeFileSync(broken, '[{"item_id":"X","suspected":[1],');
  assert("malformed JSON exits non-zero", run(broken).code !== 0);

  const empty = join(dir, "empty.json");
  writeFileSync(empty, "[]");
  assert("an empty array exits non-zero", run(empty).code !== 0, "an empty result is indistinguishable from no result");

  const notArray = join(dir, "obj.json");
  writeFileSync(notArray, '{"item_id":"X"}');
  assert("a bare object exits non-zero", run(notArray).code !== 0);
}

console.log("\nTest 3: shape problems are caught, not passed downstream");
{
  const noReason = join(dir, "noreason.json");
  writeFileSync(noReason, '[{"item_id":"X","suspected":[5],"reason":"","rank":1}]');
  const r = run(noReason);
  assert("a suspicion with no reason is refused", r.code !== 0 && /needs a reason/.test(r.out), r.out);

  const badCriterion = join(dir, "badcrit.json");
  writeFileSync(badCriterion, '[{"item_id":"X","suspected":[9],"reason":"x","rank":1}]');
  assert("a criterion outside 1-5 is refused", run(badCriterion).code !== 0);

  const noId = join(dir, "noid.json");
  writeFileSync(noId, '[{"item_id":"","suspected":[],"reason":"","rank":null}]');
  assert("an empty item_id is refused", run(noId).code !== 0);
}

console.log("\nTest 4: a fenced block inside the file is tolerated");
{
  // Agents fence by habit even when writing to a file. Refusing that would make
  // the tool fail on output that is actually correct.
  const fenced = join(dir, "fenced.json");
  writeFileSync(fenced, "```json\n" + valid + "\n```\n");
  const r = run(fenced);
  assert("a fenced array is still parsed", r.code === 0, r.out);
}

console.log("\nTest 5: usage errors are distinguishable from data errors");
{
  let code = 0;
  try {
    execFileSync(process.execPath, [SCRIPT], { encoding: "utf8", stdio: "pipe" });
  } catch (e) {
    code = e.status ?? 1;
  }
  assert("missing arguments exit 2, not 1", code === 2, `got ${code}`);
}

rmSync(dir, { recursive: true, force: true });

console.log(`\n${"-".repeat(60)}`);
console.log(`TOTAL: ${passed} passed, ${failed} failed`);
console.log("-".repeat(60));
if (failed > 0) process.exit(1);
console.log("\nAll collector tests passed.");
