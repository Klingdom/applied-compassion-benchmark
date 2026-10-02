// system-message.test.mjs -- RUN-SYS-1 (Iteration 95).
// pilot-2026-10-02 sent no system message, so each local build applied its own default: Qwen2.5 7B's names its
// developer, Llama3.2 3B's does not. A run must now state its system message explicitly, and it is sent
// identically to every subject. The legacy flag exists only for runs made before the rule.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { loadRunConfig, buildMessages } from "../lib/local-subjects.mjs";

const DIGEST = "a".repeat(64);
const base = { run_id: "run-x", trials: 3, max_retries: 2, master_seed: 1, subjects: [{ label: "m1", tag: "m:1", digest: DIGEST }] };

function load(cfg) {
  const dir = mkdtempSync(join(tmpdir(), "sysmsg-"));
  try {
    const f = join(dir, "run-config.json");
    writeFileSync(f, JSON.stringify(cfg));
    return loadRunConfig(f);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

test("a config with no system_message and no legacy flag is refused (the 10-02 situation cannot recur silently)", () => {
  assert.throws(() => load(base), /system_message is required/);
});

test("an explicit empty system_message is accepted and sent as a system turn", () => {
  const c = load({ ...base, system_message: "" });
  assert.deepEqual(buildMessages(c, "hello"), [{ role: "system", content: "" }, { role: "user", content: "hello" }]);
});

test("a non-empty system_message is sent verbatim before the prompt", () => {
  const c = load({ ...base, system_message: "Reply to the message." });
  assert.deepEqual(buildMessages(c, "p"), [{ role: "system", content: "Reply to the message." }, { role: "user", content: "p" }]);
});

test("a non-string system_message is refused", () => {
  assert.throws(() => load({ ...base, system_message: null }), /must be a string/);
});

test("the legacy flag reproduces the pre-rule request shape exactly (one user turn)", () => {
  const c = load({ ...base, system_message_legacy_absent: true });
  assert.deepEqual(buildMessages(c, "p"), [{ role: "user", content: "p" }]);
});

test("system_message and the legacy flag together are refused", () => {
  assert.throws(() => load({ ...base, system_message: "", system_message_legacy_absent: true }), /mutually exclusive/);
});

test("the real pilot-2026-10-02 config loads (it carries the recorded legacy flag)", () => {
  const c = loadRunConfig(join(import.meta.dirname, "..", "pilot-2026-10-02", "run-config.json"));
  assert.equal(c.system_message_legacy_absent, true);
});
