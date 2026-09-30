#!/usr/bin/env node
/**
 * test-prompts-only.mjs — DC-20, the writer-brief route.
 *
 * `quote-item.mjs --prompts-only` builds the brief for the discrimination test
 * (TRI-9 / TRI-10). Its entire value rests on one property: the writer of the
 * candidate answers cannot see what its answers will be marked against.
 *
 * These are negative controls, not a demonstration. Each plants a defect that
 * the gate MUST catch, and confirms the clean file passes both before and
 * after — a check that only ever runs against a clean file proves nothing.
 */

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { assertGateCatches } from "./lib/probe.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = join(__dirname, "..", "..");
const TOOL = join(__dirname, "quote-item.mjs");
const BANK = join(REPO, "site", "src", "data", "model-benchmark", "tasks-v1.json");

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

/** Returns {status, stdout, stderr} without throwing on non-zero exit. */
function run(args) {
  try {
    const stdout = execFileSync(process.execPath, [TOOL, ...args], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
    return { status: 0, stdout, stderr: "" };
  } catch (e) {
    return { status: e.status ?? 1, stdout: e.stdout ?? "", stderr: e.stderr ?? "" };
  }
}

const bank = JSON.parse(readFileSync(BANK, "utf8"));
const SAMPLE = ["ACT-2-B", "BND-3-A", "EMP-2-A"];

console.log("quote-item.mjs --prompts-only\n");

check("emits the prompt verbatim", () => {
  const r = run(["--prompts-only", ...SAMPLE]);
  assert(r.status === 0, `exit ${r.status}: ${r.stderr}`);
  for (const id of SAMPLE) {
    const item = bank.items.find((i) => i.id === id);
    const want = String(item.prompt).replace(/\s+/g, " ");
    assert(r.stdout.includes(want), `${id}: prompt text not found verbatim in output`);
  }
});

check("emits no anchor text", () => {
  const r = run(["--prompts-only", ...SAMPLE]);
  for (const id of SAMPLE) {
    const item = bank.items.find((i) => i.id === id);
    for (const a of item.anchors ?? []) {
      // A whole anchor description must never appear.
      assert(!r.stdout.includes(a.description), `${id} L${a.level} anchor text is in the brief`);
    }
  }
});

check("emits no construct name", () => {
  const r = run(["--prompts-only", ...SAMPLE]);
  for (const id of SAMPLE) {
    const item = bank.items.find((i) => i.id === id);
    assert(
      !r.stdout.toLowerCase().includes(String(item.construct).toLowerCase()),
      `${id}: construct "${item.construct}" is in the brief — it names the thing being measured`
    );
  }
});

check("default mode still emits anchors (the two modes have not been confused)", () => {
  const r = run(SAMPLE);
  assert(r.status === 0, `exit ${r.status}: ${r.stderr}`);
  const item = bank.items.find((i) => i.id === SAMPLE[0]);
  assert(r.stdout.includes(item.anchors[0].description), "default mode lost its anchors");
  assert(r.stdout.includes("ANCHORS (verbatim"), "default mode lost its header");
});

check("unknown id still exits 1, bad usage still exits 2", () => {
  assert(run(["--prompts-only", "NOPE-9-Z"]).status === 1, "unknown id did not exit 1");
  assert(run(["--prompts-only"]).status === 2, "no ids did not exit 2");
});

// ---- negative control: the leak check must actually fire ----
await (async () => {
  console.log("\nnegative control — plant an anchor into the prompts-only renderer\n");
  const passes = () => run(["--prompts-only", ...SAMPLE]).status === 0;
  try {
    await assertGateCatches({
      file: TOOL,
      label: "anchor-leak check",
      // Make renderPromptOnly append the item's top anchor, which is precisely
      // the mistake the check exists to catch.
      //
      // String.raw, because the target line contains both `\s` and escaped
      // quotes. Written as an ordinary literal, `"\s"` is silently `"s"` and
      // the needle misses — which is how the first version of this control
      // failed: withPlanted refused a no-op mutation and reported that the
      // probe would prove nothing. That refusal is the only reason this is a
      // real control and not a green tick over an unexercised gate.
      mutate: (t) => {
        const target = String.raw`    out.push(String(item.prompt).replace(/\s+/g, " "));`;
        if (!t.includes(target)) throw new Error("mutate target not found — the probe needs updating");
        return t.replace(target, `${target}\n    out.push(String((item.anchors ?? []).at(-1)?.description ?? ""));`);
      },
      run: passes,
    });
    passed += 1;
    console.log("  ok  planted anchor text is refused; clean file passes before and after");
  } catch (e) {
    failures.push(`negative control: ${e.message}`);
    console.log(`  FAIL negative control: ${e.message}`);
  }
})();

console.log(`\n${passed} passed, ${failures.length} failed`);
if (failures.length > 0) process.exit(1);
