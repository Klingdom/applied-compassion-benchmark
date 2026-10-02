// Tests for the subject-answering stage (pilot-2026-10-02). No Ollama needed: the client is a mock.
import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { makeSyntheticBank, tmp, cleanup, readJsonFile } from "./helpers.mjs";
import { HarnessError, servedItems } from "../lib/common.mjs";
import { createOllamaClient, verifyPinnedDigest } from "../lib/ollama.mjs";
import {
  deriveSeed,
  attemptSeed,
  buildPlan,
  outgoingLeaks,
  assertOutgoingClean,
  runSubjects,
  finalizeRun,
  loadRunConfig,
  recordPath,
} from "../lib/local-subjects.mjs";
import { ingestAnswersDir } from "../lib/ingest.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const REAL_RUN = path.resolve(here, "..", "pilot-2026-10-02");

const D1 = "a".repeat(64);
const D2 = "b".repeat(64);
const config = () => ({
  run_id: "unit-run",
  trials: 2,
  max_retries: 2,
  master_seed: 1,
  subjects: [
    { label: "subj-a", tag: "model-a:1", digest: D1 },
    { label: "subj-b", tag: "model-b:1", digest: D2 },
  ],
});

/** Mock client. `reply(model, messages, options, callNo)` returns a string or throws. */
function mockClient({ digests = { "model-a:1": D1, "model-b:1": D2 }, reply } = {}) {
  const calls = [];
  return {
    calls,
    async version() { return "0.0.test"; },
    async listModels() { return Object.entries(digests).map(([name, digest]) => ({ name, digest })); },
    async chat({ model, messages, options }) {
      calls.push({ model, messages, options });
      const content = reply ? reply(model, messages, options, calls.length) : `a considered reply number ${calls.length}`;
      return { message: { role: "assistant", content }, done_reason: "stop", eval_count: 7, total_duration: 1 };
    },
  };
}

test("seed derivation: sha256(run|subject|item|trial), top 31 bits, deterministic and distinct", () => {
  const s = deriveSeed("pilot-2026-10-02", "qwen2.5-7b", "AWR-1-A", 1);
  assert.equal(s, deriveSeed("pilot-2026-10-02", "qwen2.5-7b", "AWR-1-A", 1));
  assert.ok(Number.isInteger(s) && s >= 0 && s < 2 ** 31);
  // independent recomputation from the spec text
  const d = createHash("sha256").update("pilot-2026-10-02|qwen2.5-7b|AWR-1-A|1").digest("hex");
  assert.equal(s, Number(BigInt("0x" + d.slice(0, 8)) >> 1n));
  assert.notEqual(s, deriveSeed("pilot-2026-10-02", "qwen2.5-7b", "AWR-1-A", 2));
  assert.notEqual(s, deriveSeed("pilot-2026-10-02", "llama3.2-3b", "AWR-1-A", 1));
  assert.equal(attemptSeed(s, 0), s);
  assert.equal(attemptSeed(s, 2), (s + 2) % 2 ** 31);
  assert.equal(attemptSeed(2 ** 31 - 1, 1), 0);
});

test("plan: served set only, per-subject-trial shuffles are deterministic and recorded", () => {
  const bank = makeSyntheticBank();
  const a = buildPlan({ bank, config: config() });
  const b = buildPlan({ bank, config: config() });
  assert.deepEqual(a, b);
  assert.equal(a.items.length, 24); // sensitive + draft excluded
  assert.equal(a.total_calls, 2 * 2 * 24);
  const ids = a.subjects[0].trials[0].entries.map((e) => e.item_id).sort();
  assert.deepEqual(ids, servedItems(bank).map((i) => i.id).sort());
  assert.notDeepEqual(a.subjects[0].trials[0].entries.map((e) => e.item_id), a.subjects[0].trials[1].entries.map((e) => e.item_id));
});

test("outgoing leak check: a message carrying an item id, dimension code or anchor text is caught (planted probe)", () => {
  const bank = makeSyntheticBank();
  const item = servedItems(bank)[0];
  assert.deepEqual(outgoingLeaks({ bank, item, message: item.prompt }), []);
  assertOutgoingClean({ bank, item, message: item.prompt });

  const planted = `${item.prompt} (ref ${item.id})`;
  const leaks = outgoingLeaks({ bank, item, message: planted });
  assert.ok(leaks.some((l) => l.includes("item id") || l.includes("item-id shaped")), leaks.join("|"));
  assert.throws(() => assertOutgoingClean({ bank, item, message: planted }), HarnessError);

  const anchor = item.anchors[2].description;
  assert.ok(outgoingLeaks({ bank, item, message: `${item.prompt} ${anchor}` }).length > 0);
  assert.ok(outgoingLeaks({ bank, item, message: `${item.prompt} This is about EMP.` }).some((l) => l.includes("dimension code")));
  // anything other than the exact prompt is refused even if otherwise clean
  assert.ok(outgoingLeaks({ bank, item, message: `${item.prompt} Thanks.` }).some((l) => l.includes("not exactly")));
});

test("a leak on an outgoing message stops the whole run before any model call", async () => {
  const bank = makeSyntheticBank();
  const leaky = structuredClone(bank);
  const target = servedItems(leaky)[3];
  target.prompt = `${target.prompt} Context ${target.id}.`; // the prompt itself leaks its id
  const root = tmp();
  try {
    const client = mockClient();
    await assert.rejects(() => runSubjects({ bank: leaky, config: config(), client, runRoot: root }), /LEAK/);
    assert.equal(client.calls.length, 0);
  } finally { cleanup(root); }
});

test("each call is a fresh single-message conversation holding exactly the prompt, with only {seed} as options", async () => {
  const bank = makeSyntheticBank();
  const root = tmp();
  try {
    const client = mockClient();
    await runSubjects({ bank, config: config(), client, runRoot: root, limit: 3 });
    assert.equal(client.calls.length, 6);
    const prompts = new Set(servedItems(bank).map((i) => i.prompt));
    for (const c of client.calls) {
      assert.equal(c.messages.length, 1);
      assert.equal(c.messages[0].role, "user");
      assert.ok(prompts.has(c.messages[0].content));
      assert.deepEqual(Object.keys(c.options), ["seed"]);
    }
    const plan = buildPlan({ bank, config: config() });
    const first = plan.subjects[0].trials[0].entries[0].item_id;
    const rec = readJsonFile(recordPath(root, "subj-a", first, 1));
    assert.equal(rec.derived_seed, deriveSeed("unit-run", "subj-a", first, 1));
    assert.equal(rec.model_digest, D1);
    assert.equal(rec.ollama_version, "0.0.test");
    assert.equal(rec.status, "ok");
    assert.equal(rec.order_index, 0);
  } finally { cleanup(root); }
});

test("digest mismatch refuses before any model call", async () => {
  const bank = makeSyntheticBank();
  const root = tmp();
  try {
    const client = mockClient({ digests: { "model-a:1": D1, "model-b:1": "c".repeat(64) } });
    await assert.rejects(() => runSubjects({ bank, config: config(), client, runRoot: root }), /digest mismatch/);
    assert.equal(client.calls.length, 0);
    await assert.rejects(() => verifyPinnedDigest(mockClient({ digests: {} }), { tag: "model-a:1", digest: D1 }), /not installed/);
    assert.equal(await verifyPinnedDigest(mockClient(), { tag: "model-a:1", digest: `sha256:${D1.toUpperCase()}` }), D1);
  } finally { cleanup(root); }
});

test("resume skips completed trials and does not redo them", async () => {
  const bank = makeSyntheticBank();
  const root = tmp();
  try {
    const c1 = mockClient();
    const r1 = await runSubjects({ bank, config: config(), client: c1, runRoot: root, limit: 5 });
    assert.equal(c1.calls.length, 10);
    const plan = buildPlan({ bank, config: config() });
    const firstFile = recordPath(root, "subj-a", plan.subjects[0].trials[0].entries[0].item_id, 1);
    const before = readFileSync(firstFile, "utf8");

    const c2 = mockClient();
    const r2 = await runSubjects({ bank, config: config(), client: c2, runRoot: root });
    assert.equal(r2.stats["subj-a"].already_ok, 5);
    assert.equal(c2.calls.length, plan.total_calls - 10);
    assert.equal(readFileSync(firstFile, "utf8"), before, "completed record is untouched");

    const c3 = mockClient();
    await runSubjects({ bank, config: config(), client: c3, runRoot: root });
    assert.equal(c3.calls.length, 0);
    assert.equal(r1.stats["subj-a"].new_ok, 5);
  } finally { cleanup(root); }
});

test("empty or erroring replies are retried 2 times with seed + attempt, then recorded failed, never imputed", async () => {
  const bank = makeSyntheticBank();
  const root = tmp();
  try {
    const client = mockClient({
      reply: (model, _m, _o, n) => {
        if (n === 1) return "   "; // first call: empty, then fine on retry
        if (model === "model-b:1") throw new Error("runtime exploded");
        return "fine reply";
      },
    });
    await runSubjects({ bank, config: { ...config(), trials: 1 }, client, runRoot: root, limit: 1 }).catch((e) => { throw e; });
    const plan = buildPlan({ bank, config: { ...config(), trials: 1 } });

    const a = readJsonFile(recordPath(root, "subj-a", plan.subjects[0].trials[0].entries[0].item_id, 1));
    assert.equal(a.status, "ok");
    assert.equal(a.attempts.length, 2);
    assert.equal(a.attempts[0].empty, true);
    assert.equal(a.final_attempt, 1);
    assert.equal(a.attempts[1].options.seed, attemptSeed(a.derived_seed, 1));
    assert.equal(a.response, "fine reply");

    const b = readJsonFile(recordPath(root, "subj-b", plan.subjects[1].trials[0].entries[0].item_id, 1));
    assert.equal(b.status, "failed");
    assert.equal(b.attempts.length, 3);
    assert.deepEqual(b.attempts.map((x) => x.options.seed), [0, 1, 2].map((k) => attemptSeed(b.derived_seed, k)));
    assert.equal(b.response, null);
    assert.equal(b.response_sha256, null);
    assert.match(b.attempts[2].error, /runtime exploded/);
  } finally { cleanup(root); }
});

test("a failed trial is not resumed unless --retry-failed, and is never turned into an answer on finalise", async () => {
  const bank = makeSyntheticBank();
  const root = tmp();
  const cfg = { ...config(), trials: 1, subjects: [config().subjects[0]] };
  try {
    const dead = mockClient({ reply: () => "" });
    await runSubjects({ bank, config: cfg, client: dead, runRoot: root, limit: 1 });
    assert.equal(dead.calls.length, 3);
    const alive = mockClient();
    const r = await runSubjects({ bank, config: cfg, client: alive, runRoot: root, limit: 1 });
    assert.equal(r.stats["subj-a"].already_failed, 1);
    assert.equal(alive.calls.length, 1, "moved on to the next pending item");

    // finish the rest, then finalise: the failed one leaves its brief without an answers file
    await runSubjects({ bank, config: cfg, client: mockClient(), runRoot: root });
    const { summary, answerFiles } = finalizeRun({ bank, config: cfg, runRoot: root });
    assert.equal(summary.per_subject["subj-a"].failed, 1);
    assert.equal(summary.complete, false);
    assert.equal(answerFiles.length, 0);
    assert.match(summary.verdicts["subj-a"].section_9_throughput, /within/);

    const redo = mockClient();
    await runSubjects({ bank, config: cfg, client: redo, runRoot: root, retryFailed: true });
    assert.equal(redo.calls.length, 1);
    const f = finalizeRun({ bank, config: cfg, runRoot: root });
    assert.equal(f.summary.complete, true);
    assert.equal(f.answerFiles.length, 1);
    const plan = buildPlan({ bank, config: cfg });
    const rec = readJsonFile(recordPath(root, "subj-a", plan.subjects[0].trials[0].entries[0].item_id, 1));
    assert.equal(rec.previous_failed.length, 1);
  } finally { cleanup(root); }
});

test("finalised output is consumable by the existing ingest stage and carries no subject identity in answer files", async () => {
  const bank = makeSyntheticBank();
  const root = tmp();
  try {
    await runSubjects({ bank, config: config(), client: mockClient(), runRoot: root });
    const { key, summary } = finalizeRun({ bank, config: config(), runRoot: root });
    assert.equal(summary.complete, true);
    const { errors, responses } = ingestAnswersDir({ subjectKey: key, answersDir: path.join(root, "subject-answers") });
    assert.deepEqual(errors, []);
    assert.equal(responses.length, buildPlan({ bank, config: config() }).total_calls);
    for (const f of readdirSync(path.join(root, "subject-answers")).filter((x) => x.endsWith(".json"))) {
      const text = readFileSync(path.join(root, "subject-answers", f), "utf8");
      assert.doesNotMatch(text, /subj-a|subj-b|model-a|model-b/);
    }
    // deterministic key
    const again = finalizeRun({ bank, config: config(), runRoot: root }).key;
    assert.deepEqual(again, key);
  } finally { cleanup(root); }
});

test("more than 10% failed trials is reported as an instrument failure for that subject", async () => {
  const bank = makeSyntheticBank();
  const root = tmp();
  const cfg = { ...config(), trials: 1, subjects: [config().subjects[0]] };
  try {
    // calls 1-9 are empty: 3 items x 3 attempts fail = 3 of 24 trials (12.5%)
    const client = mockClient({ reply: (_m, _p, _o, n) => (n <= 9 ? "" : "ok reply") });
    await runSubjects({ bank, config: cfg, client, runRoot: root });
    const { summary } = finalizeRun({ bank, config: cfg, runRoot: root });
    assert.equal(summary.per_subject["subj-a"].failed, 3);
    assert.match(summary.verdicts["subj-a"].section_9_throughput, /INSTRUMENT FAILURE/);
  } finally { cleanup(root); }
});

test("five consecutive failures stop the run (runtime down) and keep the records", async () => {
  const bank = makeSyntheticBank();
  const root = tmp();
  try {
    const client = mockClient({ reply: () => { throw new Error("connection refused"); } });
    await assert.rejects(() => runSubjects({ bank, config: config(), client, runRoot: root }), /consecutive failed trials/);
    assert.equal(client.calls.length, 15);
  } finally { cleanup(root); }
});

test("records are written atomically (no temp files left behind)", async () => {
  const bank = makeSyntheticBank();
  const root = tmp();
  try {
    await runSubjects({ bank, config: config(), client: mockClient(), runRoot: root, limit: 2 });
    const all = readdirSync(root, { recursive: true });
    assert.ok(!all.some((f) => String(f).includes(".tmp-")));
  } finally { cleanup(root); }
});

test("ollama client: posts one non-streaming chat, reads version and tags (mock fetch)", async () => {
  const seen = [];
  const fetchImpl = async (url, init) => {
    seen.push({ url, init });
    const body = url.endsWith("/api/version") ? { version: "9.9" } : url.endsWith("/api/tags") ? { models: [{ name: "m", digest: D1 }] } : { message: { content: "hi" } };
    return { ok: true, status: 200, text: async () => JSON.stringify(body) };
  };
  const c = createOllamaClient({ host: "http://x:1/", fetchImpl });
  assert.equal(await c.version(), "9.9");
  assert.equal((await c.listModels())[0].digest, D1);
  await c.chat({ model: "m", messages: [{ role: "user", content: "p" }], options: { seed: 5 } });
  const chat = seen.find((s) => s.url.endsWith("/api/chat"));
  assert.equal(chat.url, "http://x:1/api/chat");
  assert.deepEqual(JSON.parse(chat.init.body), { model: "m", messages: [{ role: "user", content: "p" }], options: { seed: 5 }, stream: false });
});

test("run-config digests are the ones pinned in PREREGISTRATION.md (pinned once, in the config)", () => {
  const cfg = loadRunConfig(path.join(REAL_RUN, "run-config.json"));
  const prereg = readFileSync(path.join(REAL_RUN, "PREREGISTRATION.md"), "utf8");
  for (const s of cfg.subjects) {
    assert.ok(prereg.includes(s.digest), `${s.label} digest not found in the pre-registration`);
    assert.ok(prereg.includes(`\`${s.tag}\``), `${s.tag} not found`);
    assert.ok(prereg.includes(`\`${s.label}\``), `${s.label} not found`);
  }
  assert.equal(cfg.trials, 3);
  assert.equal(cfg.max_retries, 2);
  // the digests are not retyped in code
  for (const f of ["lib/local-subjects.mjs", "lib/ollama.mjs", "bin/run-local-subjects.mjs"]) {
    const src = readFileSync(path.resolve(here, "..", f), "utf8");
    for (const s of cfg.subjects) assert.ok(!src.includes(s.digest), `${f} retypes a digest`);
  }
  assert.ok(existsSync(path.join(REAL_RUN, "run-config.json")));
});
