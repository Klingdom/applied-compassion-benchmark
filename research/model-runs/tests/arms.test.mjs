// ARMS: one run holding the same model build as several subject variants that differ only in system message and
// trial count (pilot-2026-10-03 design). No Ollama, no network: the model client is a mock; the MCP probe tests use
// the real cb-probe server over stdio exactly like mcp-probe.test.mjs.
import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { makeSyntheticBank, tmp, cleanup, readJsonFile, writeJsonFile } from "./helpers.mjs";
import { HarnessError, REPO_ROOT, loadBankFile, servedItems, DEFAULT_BANK_PATH } from "../lib/common.mjs";
import {
  loadRunConfig,
  buildPlan,
  runSubjects,
  finalizeRun,
  deriveSeed,
  recordPath,
  usesArms,
  resolveSubject,
  buildSubjectMessages,
} from "../lib/local-subjects.mjs";
import { ingestAnswersDir } from "../lib/ingest.mjs";
import { parseJudgingConfig } from "../lib/judging-config.mjs";
import { buildJudgeBatches, assertBatchesBlind } from "../lib/judge-batches.mjs";
import { checkRouting } from "../lib/judge-routing.mjs";
import { planBuildProbes, runProbePhase, writeUnscoredRatingMap, subjectPaths, scorerTrialsFor, SCORER_MIN_TRIALS } from "../lib/mcp-probe.mjs";
import { pairedBootstrap, pairedComparisons } from "../lib/paired-bootstrap.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const REAL_RUN = path.resolve(here, "..", "pilot-2026-10-02");
const sha = (s) => createHash("sha256").update(s).digest("hex");

const DG = "a".repeat(64);
const DM = "b".repeat(64);
const NEUTRAL = "You are a helpful assistant.";
const LONG = `${NEUTRAL} Reply in about 250 words.`;

/** 2 builds x 2 arms, listed INTERLEAVED on purpose so that grouping by build is a real test. */
function armsConfig() {
  return {
    run_id: "arms-unit",
    trials: 3,
    max_retries: 2,
    master_seed: 7,
    system_message: NEUTRAL,
    subjects: [
      { label: "gemma-A", tag: "gemma:1", digest: DG, family: "google", arm: "A" },
      { label: "mistral-A", tag: "mistral:1", digest: DM, family: "mistral", arm: "A" },
      { label: "gemma-B", tag: "gemma:1", digest: DG, family: "google", arm: "B", trials: 1, system_message: LONG },
      { label: "mistral-B", tag: "mistral:1", digest: DM, family: "mistral", arm: "B", trials: 1, system_message: LONG },
    ],
    comparisons: [
      { a: "gemma-A", b: "gemma-B", kind: "arm" },
      { a: "gemma-A", b: "mistral-A", kind: "build" },
    ],
  };
}

function load(cfg) {
  const dir = tmp("arms-cfg-");
  try {
    const f = path.join(dir, "run-config.json");
    writeJsonFile(f, cfg);
    return loadRunConfig(f);
  } finally {
    cleanup(dir);
  }
}
const mutate = (fn) => { const c = armsConfig(); fn(c); return c; };

function mockClient() {
  const calls = [];
  return {
    calls,
    async version() { return "0.0.test"; },
    async listModels() { return [{ name: "gemma:1", digest: DG }, { name: "mistral:1", digest: DM }]; },
    async chat({ model, messages, options }) {
      calls.push({ model, messages, options });
      return { message: { role: "assistant", content: `a considered reply number ${calls.length}` }, done_reason: "stop", eval_count: 7 };
    },
  };
}

// ---------------------------------------------------------------------------
// 1. Config validation
// ---------------------------------------------------------------------------
test("arms config: the example loads; a variant may override system_message and trials", () => {
  const c = load(armsConfig());
  assert.equal(usesArms(c), true);
  const b = resolveSubject(c, c.subjects[2]);
  assert.deepEqual([b.arm, b.trials, b.systemMessage, b.systemSource], ["B", 1, LONG, "subject"]);
  const a = resolveSubject(c, c.subjects[0]);
  assert.deepEqual([a.arm, a.trials, a.systemMessage, a.systemSource], ["A", 3, NEUTRAL, "run"]);
  assert.equal(a.build, `gemma:1@sha256:${DG}`);
});

test("arms config: a subject sharing a build with another but carrying no arm label is refused", () => {
  assert.throws(() => load(mutate((c) => { delete c.subjects[2].arm; })), /every subject needs an arm label.*gemma-B/);
  // ...even a subject of a build that is NOT shared (the label is required on every subject)
  assert.throws(() => load(mutate((c) => { delete c.subjects[1].arm; })), /every subject needs an arm label.*mistral-A/);
});

test("arms config: a duplicate (build, arm) pair is refused; an unsafe arm label is refused", () => {
  assert.throws(() => load(mutate((c) => { c.subjects[2].arm = "A"; })), /arm "A" is used twice/);
  assert.throws(() => load(mutate((c) => { c.subjects[2].arm = "B C"; })), /arm must be a safe name/);
  assert.throws(() => load(mutate((c) => { c.subjects[2].arm = 7; })), /arm must be a safe name/);
  // the same arm label under DIFFERENT builds is fine (that is the design)
  load(armsConfig());
});

test("arms config: RUN-SYS-1 holds per subject: no subject may end up without an explicit system message", () => {
  // run-level removed, and a subject without its own: refused, naming it
  assert.throws(() => load(mutate((c) => { delete c.system_message; })), /system_message is required.*Subjects with none: gemma-A, mistral-A/);
  // run-level removed but EVERY subject states its own: accepted
  const c = load(mutate((x) => { delete x.system_message; x.subjects[0].system_message = NEUTRAL; x.subjects[1].system_message = NEUTRAL; }));
  assert.equal(resolveSubject(c, c.subjects[0]).systemSource, "subject");
  // an explicit empty string is explicit
  load(mutate((x) => { x.subjects[0].system_message = ""; }));
  // a non-string override is refused
  assert.throws(() => load(mutate((x) => { x.subjects[2].system_message = null; })), /subject gemma-B: system_message must be a string/);
  // the legacy flag stays exclusive of any explicit message, run-level or subject-level
  assert.throws(() => load(mutate((x) => { x.system_message_legacy_absent = true; })), /mutually exclusive/);
  assert.throws(
    () => load(mutate((x) => { delete x.system_message; x.system_message_legacy_absent = true; })),
    /exclusive of explicit messages/
  );
});

test("arms config: variants must differ; trials must be positive integers; one build, one family", () => {
  assert.throws(() => load(mutate((c) => { c.subjects[2].trials = 3; c.subjects[2].system_message = NEUTRAL; })), /same system message and trial count/);
  assert.throws(() => load(mutate((c) => { c.subjects[2].trials = 0; })), /trials must be a positive integer/);
  assert.throws(() => load(mutate((c) => { c.subjects[2].trials = 1.5; })), /trials must be a positive integer/);
  assert.throws(() => load(mutate((c) => { c.subjects[2].family = "other"; })), /same family/);
});

test("arms config: comparisons are validated (kinds, labels, duplicates)", () => {
  assert.throws(() => load(mutate((c) => { c.comparisons[0].kind = "weird"; })), /kind must be/);
  assert.throws(() => load(mutate((c) => { c.comparisons[0].b = "nobody"; })), /subject labels/);
  assert.throws(() => load(mutate((c) => { c.comparisons[0].b = "gemma-A"; })), /same subject/);
  assert.throws(() => load(mutate((c) => { c.comparisons[0] = { a: "gemma-A", b: "mistral-B", kind: "arm" }; })), /two arms of the same build/);
  assert.throws(() => load(mutate((c) => { c.comparisons[1] = { a: "gemma-A", b: "mistral-B", kind: "build" }; })), /same arm label/);
  assert.throws(() => load(mutate((c) => { c.comparisons[1] = { a: "gemma-B", b: "gemma-A", kind: "arm" }; })), /listed twice/);
  assert.throws(() => load(mutate((c) => { c.comparisons = "x"; })), /comparisons must be an array/);
});

test("legacy configs are untouched: the real pilot-2026-10-02 config loads, uses no arms, and keeps its one-user-turn request shape", () => {
  const c = loadRunConfig(path.join(REAL_RUN, "run-config.json"));
  assert.equal(usesArms(c), false);
  assert.deepEqual(buildSubjectMessages(c, c.subjects[0], "p"), [{ role: "user", content: "p" }]);
  assert.equal(resolveSubject(c, c.subjects[0]).hasSystem, false);
});

// ---------------------------------------------------------------------------
// 2-4. Plan, order, seeds, records
// ---------------------------------------------------------------------------
test("plan: per-subject trials are honoured in the counts; builds are grouped", () => {
  const bank = makeSyntheticBank();
  const plan = buildPlan({ bank, config: armsConfig() });
  const n = plan.items.length;
  const trialsOf = Object.fromEntries(plan.subjects.map((s) => [s.label, s.trials.length]));
  assert.deepEqual(trialsOf, { "gemma-A": 3, "mistral-A": 3, "gemma-B": 1, "mistral-B": 1 });
  assert.equal(plan.total_calls, n * (3 + 3 + 1 + 1));
  assert.equal(plan.builds.length, 2);
  assert.deepEqual(plan.builds.map((b) => b.variants), [["gemma-A", "gemma-B"], ["mistral-A", "mistral-B"]]);
  assert.deepEqual(plan.run_order, ["gemma-A", "gemma-B", "mistral-A", "mistral-B"]);
  // arm B carries its own message hash; A inherits the run-level one
  const by = Object.fromEntries(plan.subjects.map((s) => [s.label, s]));
  assert.equal(by["gemma-A"].system_message_sha256, sha(NEUTRAL));
  assert.equal(by["gemma-B"].system_message_sha256, sha(LONG));
  // briefs are all distinct and the plan is deterministic
  const ids = plan.subjects.flatMap((s) => s.trials.map((t) => t.brief_id));
  assert.equal(new Set(ids).size, ids.length);
  assert.deepEqual(buildPlan({ bank, config: armsConfig() }), plan);
});

test("legacy plan: with no arms the plan, run order and call order are the config's, unchanged", () => {
  const bank = makeSyntheticBank();
  const legacy = { run_id: "u", trials: 2, max_retries: 2, master_seed: 1, subjects: [{ label: "s-a", tag: "m-a:1", digest: DG }, { label: "s-b", tag: "m-b:1", digest: DM }] };
  const plan = buildPlan({ bank, config: legacy });
  assert.deepEqual(plan.run_order, ["s-a", "s-b"]);
  assert.equal(plan.total_calls, 2 * 2 * plan.items.length);
  assert.ok(plan.subjects.every((s) => s.arm === null && !("system_message" in s)));
});

test("run: calls are grouped by BUILD (one model swap per build), each arm gets its own system message, seeds, and record fields", async () => {
  const bank = makeSyntheticBank();
  const root = tmp("arms-run-");
  try {
    const client = mockClient();
    const config = armsConfig();
    const r = await runSubjects({ bank, config, client, runRoot: root });
    const plan = r.plan;
    assert.equal(client.calls.length, plan.total_calls);

    // build-grouped: the model changes exactly once; within a build, arm A (3 trials) runs before arm B (1 trial)
    const models = client.calls.map((c) => c.model);
    const swaps = models.filter((m, i) => i > 0 && m !== models[i - 1]).length;
    assert.equal(swaps, 1, "interleaved config order must still run build by build");
    assert.deepEqual([...new Set(models)], ["gemma:1", "mistral:1"]);
    const n = plan.items.length;
    const gemma = client.calls.slice(0, n * 4);
    assert.ok(gemma.slice(0, n * 3).every((c) => c.messages[0].content === NEUTRAL));
    assert.ok(gemma.slice(n * 3).every((c) => c.messages[0].content === LONG));

    // the request shape: system message then exactly the prompt
    const prompts = new Set(servedItems(bank).map((i) => i.prompt));
    for (const c of client.calls) {
      assert.equal(c.messages.length, 2);
      assert.equal(c.messages[0].role, "system");
      assert.equal(c.messages[1].role, "user");
      assert.ok(prompts.has(c.messages[1].content));
      assert.deepEqual(Object.keys(c.options), ["seed"]);
    }

    // seeds come from the variant LABEL: the same build, item and trial under two arms gets two seeds
    const item = plan.subjects[0].trials[0].entries[0].item_id;
    assert.notEqual(deriveSeed(config.run_id, "gemma-A", item, 1), deriveSeed(config.run_id, "gemma-B", item, 1));
    const recA = readJsonFile(recordPath(root, "gemma-A", item, 1));
    const recB = readJsonFile(recordPath(root, "gemma-B", item, 1));
    assert.equal(recA.derived_seed, deriveSeed(config.run_id, "gemma-A", item, 1));
    assert.equal(recB.derived_seed, deriveSeed(config.run_id, "gemma-B", item, 1));
    assert.notEqual(recA.derived_seed, recB.derived_seed);
    assert.deepEqual([recA.arm, recB.arm], ["A", "B"]);
    assert.equal(recA.build, `gemma:1@sha256:${DG}`);
    assert.equal(recA.system_message_sha256, sha(NEUTRAL));
    assert.equal(recB.system_message_sha256, sha(LONG));
    assert.equal(recA.model_digest, DG);
    assert.equal(readJsonFile(recordPath(root, "mistral-B", item, 1)).trial, 1);
    assert.equal(existsSync(recordPath(root, "gemma-B", item, 2)), false, "arm B has one trial only");

    // resumable as before: a second pass makes no call
    const again = mockClient();
    await runSubjects({ bank, config, client: again, runRoot: root });
    assert.equal(again.calls.length, 0);

    // finalise: the key carries the arm structure; answer files stay free of identity; ingest accepts them
    const { key, summary } = finalizeRun({ bank, config, runRoot: root });
    assert.equal(summary.complete, true);
    assert.deepEqual(key.trials_by_subject, { "gemma-A": 3, "mistral-A": 3, "gemma-B": 1, "mistral-B": 1 });
    assert.deepEqual(key.builds.map((b) => b.variants.map((v) => [v.label, v.arm, v.trials])), [
      [["gemma-A", "A", 3], ["gemma-B", "B", 1]],
      [["mistral-A", "A", 3], ["mistral-B", "B", 1]],
    ]);
    assert.equal(key.briefs.length, 8);
    assert.ok(key.briefs.every((b) => typeof b.arm === "string"));
    const { errors, responses } = ingestAnswersDir({ subjectKey: key, answersDir: path.join(root, "subject-answers") });
    assert.deepEqual(errors, []);
    assert.equal(responses.length, plan.total_calls);
    for (const s of ["gemma-A", "gemma-B", "mistral-A", "mistral-B"]) assert.equal(responses.filter((x) => x.subject === s).length, n * (s.endsWith("A") ? 3 : 1));
  } finally { cleanup(root); }
});

test("run: a system message that uses rubric vocabulary stops the run before any model call", async () => {
  const bank = makeSyntheticBank();
  const root = tmp("arms-run-");
  try {
    const client = mockClient();
    const config = mutate((c) => { c.subjects[2].system_message = `${NEUTRAL} Aim for the highest rating on the benchmark.`; });
    await assert.rejects(() => runSubjects({ bank, config, client, runRoot: root }), /LEAK in a system message/);
    assert.equal(client.calls.length, 0);
  } finally { cleanup(root); }
});

// ---------------------------------------------------------------------------
// 4. Judge side: arms are ordinary subjects; judges see no arm and no system message
// ---------------------------------------------------------------------------
function judgingConfig() {
  const c = armsConfig();
  return {
    ...c,
    judges: ["claude-fable", "claude-opus", "claude-sonnet"].map((label) => ({ label, family: "claude" })),
    judges_per_response: 2,
    max_batch_entries: 16,
    judge_validity: { max_unfound_quote_rate_percent: 5, short_quote_min_chars: 12 },
    bridge: { source_run: "src", source_key: "keys/judge-key.json", seed: 1, per_source_subject: 1, total: 1 },
  };
}

test("judging config: arms share their build's family and the config reports what judges must never see", () => {
  const j = parseJudgingConfig(judgingConfig());
  assert.deepEqual(j.subjects, ["gemma-A", "mistral-A", "gemma-B", "mistral-B"]);
  assert.equal(j.familyOf["gemma-A"], j.familyOf["gemma-B"]);
  assert.deepEqual(j.armLabels, ["A", "B"]);
  assert.deepEqual(j.hiddenSystemMessages.sort(), [LONG, NEUTRAL].sort());
  const bad = judgingConfig();
  bad.subjects[2].family = "other";
  assert.throws(() => parseJudgingConfig(bad), /variants carry different families/);
});

test("judge batches: no entry carries an arm or system message, no scaffold text reveals either, arms are routed like any subject", async () => {
  const bank = makeSyntheticBank();
  const root = tmp("arms-run-");
  try {
    const config = judgingConfig();
    await runSubjects({ bank, config, client: mockClient(), runRoot: root });
    const { key } = finalizeRun({ bank, config, runRoot: root });
    const { responses } = ingestAnswersDir({ subjectKey: key, answersDir: path.join(root, "subject-answers") });
    const j = parseJudgingConfig(config);
    const judging = { judges: j.judges, familyOf: j.familyOf, maxBatchEntries: 16, bridge: [], bridgeSeed: 1, identityTerms: j.identityTerms, armLabels: j.armLabels, hiddenSystemMessages: j.hiddenSystemMessages };
    const out = buildJudgeBatches({ bank, responses, subjects: j.subjects, seed: 5, batchSize: 16, runId: config.run_id, judging });

    // every response routed under the family rule (arms of one build have one family; the judges are not of it)
    assert.deepEqual(checkRouting({ responses: out.key.responses, routes: out.key.responses.map((r) => r.judges), judges: j.judges, familyOf: j.familyOf }), []);
    assert.equal(out.key.responses.length, responses.length);

    const allowed = new Set(["response_id", "item_prompt", "construct", "anchors", "response", "evaluator_notes"]);
    const everything = out.batches.map((b) => `${JSON.stringify(b.batch)}\n${b.markdown}`).join("\n");
    for (const { batch } of out.batches) for (const e of batch.entries) for (const k of Object.keys(e)) assert.ok(allowed.has(k), `unexpected entry field ${k}`);
    assert.ok(!everything.includes(NEUTRAL), "a system message reached a judge");
    assert.ok(!everything.includes("Reply in about 250 words"), "the arm-B instruction reached a judge");
    for (const label of ["gemma-A", "gemma-B", "mistral-A", "mistral-B", "gemma", "mistral", "arms-unit"]) {
      assert.ok(!everything.toLowerCase().includes(label.toLowerCase()), `batch text contains "${label}"`);
    }
    assert.ok(!/"(arm|build|system_message)/.test(everything));

    // NEGATIVE CONTROLS: the guards fire
    const sample = out.batches[0];
    const scaffoldPhrase = "Judge each reply on its own";
    assert.throws(
      () => assertBatchesBlind({ batches: out.batches, subjects: j.subjects, runId: config.run_id, records: out.records, hiddenSystemMessages: [scaffoldPhrase] }),
      /contains a subject system message/
    );
    const tampered = structuredClone(sample);
    tampered.batch.entries[0].arm = "B";
    assert.throws(() => assertBatchesBlind({ batches: [tampered], subjects: j.subjects, runId: config.run_id, records: out.records }), /forbidden field "arm"/);
    const tampered2 = structuredClone(sample);
    tampered2.batch.entries[0].system_message = NEUTRAL;
    assert.throws(() => assertBatchesBlind({ batches: [tampered2], subjects: j.subjects, runId: config.run_id, records: out.records }), /forbidden field "system_message"/);
    // a long arm label in harness-written text is caught as an identity term
    const leaky = structuredClone(sample);
    leaky.batch.instructions = `${leaky.batch.instructions} (control-arm)`;
    assert.throws(() => assertBatchesBlind({ batches: [leaky], subjects: j.subjects, runId: config.run_id, records: out.records, armLabels: ["control-arm"] }), /reveal identity/);
  } finally { cleanup(root); }
});

// ---------------------------------------------------------------------------
// 5. MCP contamination probe: once per BUILD
// ---------------------------------------------------------------------------
function probeConfig(overrides = {}) {
  const real = readJsonFile(path.join(REAL_RUN, "run-config.json"));
  const { system_message_legacy_absent, system_message_legacy_note, ...rest } = real;
  const s0 = real.subjects[0];
  const s1 = real.subjects[1];
  return {
    ...rest,
    run_id: "unit-arms-probe",
    system_message: NEUTRAL,
    subjects: [
      { ...s0, digest: DG, label: "q-A", arm: "A" },
      { ...s1, digest: DM, label: "l-A", arm: "A" },
      { ...s0, digest: DG, label: "q-B", arm: "B", trials: 1, system_message: LONG },
      { ...s1, digest: DM, label: "l-B", arm: "B", trials: 1, system_message: LONG },
    ],
    ...overrides,
  };
}

test("probe plan: one probe per BUILD, hosted by the first variant that can open a scored run, with that variant's system message", () => {
  const config = probeConfig();
  const plan = planBuildProbes(config);
  assert.equal(plan.length, 2, "two builds, so two probes, not four");
  const [q, l] = plan;
  assert.deepEqual([q.primary, q.probe_system_from, q.probe_system_message_sha256], ["q-A", "q-A", sha(NEUTRAL)]);
  assert.deepEqual(q.scored_runs.map((r) => [r.subject, r.role, r.scorer_trials]), [["q-A", "primary", 6]]);
  assert.deepEqual(q.ineligible, [{ subject: "q-B", arm: "B", scorer_trials: 2, probe_from: "q-A" }]);
  assert.deepEqual([l.primary, l.ineligible[0].subject, l.ineligible[0].probe_from], ["l-A", "l-B", "l-A"]);
  assert.equal(scorerTrialsFor(config, config.subjects[2]), 1 * config.judges_per_response);
  assert.ok(scorerTrialsFor(config, config.subjects[2]) < SCORER_MIN_TRIALS);
});

test("probe plan: a second eligible arm gets a server-required repeat probe with the SAME system message; no eligible arm is refused", () => {
  const both = probeConfig();
  both.subjects[2].trials = 3; // q-B now reaches the floor too
  const [q] = planBuildProbes(both);
  assert.deepEqual(q.scored_runs.map((r) => [r.subject, r.role]), [["q-A", "primary"], ["q-B", "server-required-repeat"]]);
  assert.equal(q.probe_system_from, "q-A");
  assert.equal(q.probe_system_message_sha256, sha(NEUTRAL), "the repeat probe still uses the primary's system message");
  assert.deepEqual(q.ineligible, []);

  const none = probeConfig();
  for (const s of none.subjects) s.trials = 1;
  assert.throws(() => planBuildProbes(none), /no scored run \(and no probe\) can be opened/);
  // the floor is a parameter of the plan, so a changed server floor is visible
  assert.equal(planBuildProbes(probeConfig(), { minTrials: 2 })[0].ineligible.length, 0);

  // a legacy (one subject per build) config plans exactly one probe per subject, in config order, none ineligible
  const legacy = planBuildProbes(readJsonFile(path.join(REAL_RUN, "run-config.json")));
  assert.deepEqual(legacy.map((b) => b.primary), ["qwen2.5-7b", "llama3.2-3b"]);
  assert.ok(legacy.every((b) => b.ineligible.length === 0 && b.probe_system_message_sha256 === null));
});

function mockOllamaArms() {
  const calls = [];
  return {
    calls,
    async version() { return "0.0.mock"; },
    async listModels() { return [{ name: "qwen2.5:7b", digest: `sha256:${DG}` }, { name: "llama3.2:latest", digest: DM }]; },
    async chat({ model, messages, options }) {
      calls.push({ model, messages, options });
      const prompt = messages[messages.length - 1].content;
      const m = /Which scenario is item ([A-Z]+-\d+-[A-Z])\?/.exec(prompt);
      return { message: { role: "assistant", content: m ? "A" : "I do not recall the exact wording of this message at all." }, done_reason: "stop", eval_count: 5 };
    },
  };
}

const bank = loadBankFile(DEFAULT_BANK_PATH);

test("probe phase: the build's probe sends the primary arm's system message on every question and records which; an arm below the floor opens no run", async () => {
  const runRoot = tmp("arms-mcp-run-");
  const base = tmp("arms-mcp-art-");
  try {
    const config = probeConfig();
    const [A, , B] = config.subjects;
    const ollama = mockOllamaArms();

    // the arm below the floor cannot host a probe: refused before the server or the model is touched
    await assert.rejects(() => runProbePhase({ config, subject: B, probeSubject: A, runRoot, artifactBase: base, ollama, bank }), /below cb-probe's floor/);
    assert.equal(ollama.calls.length, 0);
    // a probe system message must come from the same build
    await assert.rejects(() => runProbePhase({ config, subject: A, probeSubject: config.subjects[1], runRoot, artifactBase: base, ollama, bank }), /same build/);

    const r = await runProbePhase({ config, subject: A, probeSubject: A, runRoot, artifactBase: base, ollama, bank });
    assert.equal(r.status, "completed");
    assert.equal(ollama.calls.length, 9);
    for (const c of ollama.calls) {
      assert.equal(c.messages.length, 2);
      assert.deepEqual(c.messages[0], { role: "system", content: NEUTRAL });
      assert.equal(c.model, A.tag);
    }
    const P = subjectPaths(runRoot, A.label);
    const state = readJsonFile(P.state);
    assert.equal(state.start_scored_run.request.trials, 6, "arm A: 3 subject trials x 2 judges");
    assert.equal(state.probe_system_from, "q-A");
    assert.equal(state.probe_system_message_sha256, sha(NEUTRAL));
    assert.equal(state.build, `qwen2.5:7b@sha256:${DG}`);
    const rec = readJsonFile(path.join(P.probeDir, `recall__${readJsonFile(P.answers).recall_attempts[0].item_id}.json`));
    assert.equal(rec.system_message_sha256, sha(NEUTRAL));
    assert.match(rec.conversation, /explicit system message/);

    // the unscored arm: its ratings are recorded with scorecard:null and a pointer to the build's probe
    const rows = [];
    for (const item of servedItems(bank)) {
      let k = 0;
      for (const judge of ["claude-opus", "claude-sonnet"]) {
        k += 1;
        rows.push({
          item_id: item.id, scorer_trial_index: k, response_id: `r-${item.id}`, subject_trial: 1, judge, judge_provenance: "original",
          rating_1_5: 3, anchor_matched: "Functional", evidence_quote: "x", response_text: `reply for ${item.id}`, outgoing_message_sha256: sha(item.prompt),
        });
      }
    }
    const w = writeUnscoredRatingMap({ config, subject: B, probeSubject: A, rows, runRoot, bank });
    assert.equal(w.rows, rows.length);
    const map = readJsonFile(path.join(subjectPaths(runRoot, B.label).scorecards, "mcp-rating-map.json"));
    assert.equal(map.scorecard, null);
    assert.equal(map.subject, "q-B");
    assert.equal(map.probe_subject, "q-A");
    assert.equal(map.scorer_trials_per_item, 2);
    assert.equal(map.probe_scorer_run_id, state.scorer_run_id);
    assert.match(map.scorecard_ineligible_reason, /below cb-probe's start_scored_run floor/);
    assert.equal(map.rows.length, rows.length);
    assert.ok(map.rows.every((x) => x.served_prompt_sha256 && x.response_sha256));

    // refusals: wrong item count, a tampered hash, an eligible subject, a build whose probe has not completed
    await assert.rejects(async () => writeUnscoredRatingMap({ config, subject: B, probeSubject: A, rows: rows.slice(2), runRoot, bank }), HarnessError);
    const tampered = structuredClone(rows);
    tampered[0].outgoing_message_sha256 = sha("something else");
    assert.throws(() => writeUnscoredRatingMap({ config, subject: B, probeSubject: A, rows: tampered, runRoot, bank }), /does not hash to the message the subject was sent/);
    assert.throws(() => writeUnscoredRatingMap({ config, subject: A, probeSubject: A, rows, runRoot, bank }), /must finish through runFinishPhase/);
    const fresh = tmp("arms-mcp-run2-");
    try {
      assert.throws(() => writeUnscoredRatingMap({ config, subject: B, probeSubject: A, rows, runRoot: fresh, bank }), /run --phase probe first/);
    } finally { cleanup(fresh); }
  } finally {
    cleanup(runRoot);
    cleanup(base);
  }
});

// ---------------------------------------------------------------------------
// 6. Analysis: comparisons with the same paired item-resampling bootstrap
// ---------------------------------------------------------------------------
const DIMS = ["AWR", "EMP", "ACT", "EQU", "BND", "ACC", "SYS", "INT"];
const { computeCompositeFromDimensions, getBand } = await import(pathToFileURL(path.join(REPO_ROOT, "site", "scripts", "lib", "scoring.mjs")).href);
const comp = (d) => { const c = computeCompositeFromDimensions(d); return typeof c === "number" ? c : c.composite ?? c.score; };
const r1 = (x) => Math.round(x * 10) / 10;
const B = 1000;
const ci = (xs) => { const t = [...xs].sort((a, b) => a - b); return [r1(t[Math.floor(0.025 * B)]), r1(t[Math.floor(0.975 * B)])]; };

/** Synthetic run: 5 items per dimension; item means per variant from `fn(variant, itemIndex)`. */
function synthetic(variants, fn) {
  const items = [];
  const dimOf = {};
  const im = {};
  DIMS.forEach((d) => { for (let k = 0; k < 5; k += 1) { const id = `${d}-${k}`; items.push(id); dimOf[id] = d; } });
  for (const v of variants) items.forEach((id, i) => { im[`${v}|${id}`] = fn(v, i); });
  return { items: items.sort(), dimOf, im };
}
const pointComposite = (v, s) => comp(Object.fromEntries(DIMS.map((d) => [d, s.items.filter((i) => s.dimOf[i] === d).reduce((a, i) => a + s.im[`${v}|${i}`], 0) / 5])));

test("analysis comparisons: a real shift is separated, a null arm is not, orientation is a minus b, results are deterministic", () => {
  const variants = ["g-A", "g-B", "m-A"];
  const noise = (i) => ((i * 37) % 11) / 10 - 0.5; // shared item effect: paired design removes it
  const s = synthetic(variants, (v, i) => 2.5 + noise(i) + (v === "g-B" ? 0.8 : 0) + (v === "m-A" ? 0 : 0));
  const run = () => pairedBootstrap({ subjects: variants, items: s.items, dimOf: s.dimOf, im: s.im, dims: DIMS, seed: 20261003, B, comp });
  const { boots } = run();
  assert.deepEqual(run().boots, boots, "deterministic for a fixed seed");
  const composites = Object.fromEntries(variants.map((v) => [v, r1(pointComposite(v, s))]));
  const comparisons = [{ a: "g-B", b: "g-A", kind: "arm" }, { a: "g-A", b: "g-B", kind: "arm" }, { a: "g-A", b: "m-A", kind: "build" }];
  const out = pairedComparisons({ comparisons, boots, composites, ci, r1 });
  assert.equal(out.length, 3);
  assert.deepEqual(out.map((o) => [o.a, o.b, o.kind]), comparisons.map((c) => [c.a, c.b, c.kind]), "config order and orientation kept");
  assert.ok(out[0].difference > 0 && out[0].separated, JSON.stringify(out[0]));
  assert.ok(out[1].difference < 0 && out[1].separated);
  assert.equal(out[0].difference, -out[1].difference);
  assert.deepEqual(out[2], { a: "g-A", b: "m-A", kind: "build", difference: 0, interval95: [0, 0], separated: false });
  // the interval is the one from subtracting the SAME replicates, nothing else
  assert.deepEqual(out[0].interval95, ci(boots["g-B"].map((v, k) => v - boots["g-A"][k])));
  assert.equal(out[0].difference, r1(composites["g-B"] - composites["g-A"]));
  assert.ok(getBand(composites["g-A"]), "the band comes from the same canonical module");
  assert.throws(() => pairedComparisons({ comparisons: [{ a: "g-A", b: "nobody", kind: "arm" }], boots, composites, ci, r1 }), /not subjects of this run/);
});

test("analysis comparisons: the extracted bootstrap is the analysis's own (same draws for every subject; subject order does not change a subject's replicates)", () => {
  const s = synthetic(["x", "y"], (v, i) => 1 + ((i * 7 + (v === "x" ? 1 : 3)) % 5));
  const a = pairedBootstrap({ subjects: ["x", "y"], items: s.items, dimOf: s.dimOf, im: s.im, dims: DIMS, seed: 5, B: 200, comp });
  const b = pairedBootstrap({ subjects: ["y", "x"], items: s.items, dimOf: s.dimOf, im: s.im, dims: DIMS, seed: 5, B: 200, comp });
  assert.deepEqual(a.boots.x, b.boots.x);
  assert.deepEqual(a.boots.y, b.boots.y);
});

// ---------------------------------------------------------------------------
// 6b. Byte identity of prior analyses (the unchanged-output proof lives in analyze-pilot.test.mjs; these pin the shape)
// ---------------------------------------------------------------------------
test("prior analyses carry no arms fields: no `comparisons`, no `design.arms`, scalar trials_per_subject, primary comparison kept", () => {
  for (const run of ["pilot-2026-10-01", "pilot-2026-10-02"]) {
    const file = path.resolve(here, "..", run, "analysis.json");
    if (!existsSync(file)) continue;
    const a = JSON.parse(readFileSync(file, "utf8"));
    assert.equal(a.comparisons, undefined, run);
    assert.equal(a.comparisons_note, undefined, run);
    assert.equal(a.design.arms, undefined, run);
    assert.equal(a.design.trials_per_subject, 3, run);
    for (const s of Object.values(a.subjects)) {
      assert.equal(s.scorecard_ineligible_reason, undefined);
      assert.equal(s.contamination.from_build_probe_of, undefined);
    }
  }
  const a2 = JSON.parse(readFileSync(path.resolve(here, "..", "pilot-2026-10-02", "analysis.json"), "utf8"));
  assert.equal(a2.primary_comparison.a, "qwen2.5-7b");
});
