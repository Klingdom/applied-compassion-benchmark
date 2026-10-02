// Tests for pilot-2026-10-02 section 7 (run-mcp-probe). No Ollama and no network: Ollama is a mock (or a loopback
// fake HTTP server). The cb-probe server is the REAL one, spawned over stdio, writing to a temp directory.
import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, mkdirSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { tmp, cleanup, readJsonFile, writeJsonFile, runBin, BIN } from "./helpers.mjs";
import { REPO_ROOT, HarnessError, loadBankFile, servedItems, DEFAULT_BANK_PATH } from "../lib/common.mjs";
import { startMcpServer, McpTimeoutError, McpClosedError, McpRpcError, McpToolError } from "../lib/mcp-client.mjs";
import {
  parseIdentificationChoice,
  deriveProbeSeed,
  acceptRecall,
  subjectLabelFor,
  judgeLabelFor,
  assertLabelFits,
  assertArtifactRootOutsideRepo,
  openSession,
  runProbePhase,
  runFinishPhase,
  subjectPaths,
  ACCESS_TIER_LOCAL,
} from "../lib/mcp-probe.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const REAL_RUN = path.resolve(here, "..", "pilot-2026-10-02");
const sha = (s) => createHash("sha256").update(s).digest("hex");
const bank = loadBankFile(DEFAULT_BANK_PATH);

const D1 = "a".repeat(64);
const D2 = "b".repeat(64);

function testConfig() {
  const real = readJsonFile(path.join(REAL_RUN, "run-config.json"));
  return {
    ...real,
    run_id: "unit-mcp-run",
    subjects: [
      { ...real.subjects[0], digest: D1 },
      { ...real.subjects[1], digest: D2 },
    ],
  };
}

const RECALL_REPLY = "I do not recall the exact wording of this message at all.";

/** Mock Ollama. `identReply(itemId, nth, attempt)` may override the identification reply. */
function mockOllama({ identReply, recallReply } = {}) {
  const calls = [];
  const seen = new Map(); // item id -> how many times asked (identification)
  const order = []; // item ids in first-seen order
  return {
    calls,
    order,
    async version() { return "0.0.mock"; },
    async listModels() { return [{ name: "qwen2.5:7b", digest: `sha256:${D1}` }, { name: "llama3.2:latest", digest: D2 }]; },
    async chat({ model, messages, options }) {
      assert.equal(messages.length, 1, "each question is its own fresh one-message conversation");
      assert.equal(messages[0].role, "user");
      const prompt = messages[0].content;
      calls.push({ model, prompt, options });
      const m = /Which scenario is item ([A-Z]+-\d+-[A-Z])\?/.exec(prompt);
      let content;
      if (m) {
        const n = seen.get(m[1]) ?? 0;
        seen.set(m[1], n + 1);
        if (n === 0 && !order.includes(m[1])) order.push(m[1]);
        content = identReply ? identReply(m[1], order.indexOf(m[1]), n) : "A";
      } else {
        content = recallReply ?? RECALL_REPLY;
      }
      return { message: { role: "assistant", content }, done_reason: "stop", eval_count: 5 };
    },
  };
}

function transcriptCalls(file, toolName) {
  return readFileSync(file, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l))
    .filter((e) => e.dir === "out" && e.message.method === "tools/call" && e.message.params.name === toolName)
    .map((e) => e.message.params.arguments);
}

// ---------------------------------------------------------------------------
// Strict identification parsing
// ---------------------------------------------------------------------------
test("identification parsing: accepts only forms that name exactly one issued option", () => {
  const ids = ["A", "B", "C", "D"];
  const ok = (s, want) => {
    const r = parseIdentificationChoice(s, ids);
    assert.equal(r.ok, true, `expected ${JSON.stringify(s)} to parse`);
    assert.equal(r.value, want);
  };
  ok("B", "B");
  ok("  c \n", "C");
  ok("**D**", "D");
  ok("(A)", "A");
  ok("B.", "B");
  ok("Answer: C", "C");
  ok("Option D", "D");
  ok("The answer is B", "B");
  ok("B. Traffic-Light Behaviour Chart", "B");
  ok("C) Something about a chart", "C");
  ok("B\n\nBecause the chart is mentioned.", "B");
  for (const bad of [
    "",
    "   ",
    "I think it is probably the second one",
    "AB",
    "A or B",
    "E",
    "Z. nothing",
    "The scenario about the chart.",
    "Answer:",
    "Option",
    "B\nActually, the answer is C",
    "I am not sure which one it is, maybe B",
  ]) {
    const r = parseIdentificationChoice(bad, ids);
    assert.equal(r.ok, false, `expected ${JSON.stringify(bad)} to be unparseable, got ${JSON.stringify(r)}`);
  }
  // ids come from the issued options, not a hard-coded A-D
  assert.equal(parseIdentificationChoice("D", ["A", "B", "C"]).ok, false);
  assert.equal(parseIdentificationChoice("E", ["A", "B", "C", "D", "E"]).value, "E");
});

test("recall pre-check mirrors the server floor; the text is sent as given", () => {
  assert.equal(acceptRecall("").ok, false);
  assert.equal(acceptRecall("No.").ok, false);
  const text = "  I do not recall this.\n";
  const r = acceptRecall(text);
  assert.equal(r.ok, true);
  assert.equal(r.value, text, "no trimming or repair");
});

test("probe seeds: sha256(run|subject|probe-kind|qid|attempt), 31 bits, attempt is part of the hash", () => {
  const s = deriveProbeSeed("pilot-2026-10-02", "qwen2.5-7b", "identification", "AWR-1-A", 0);
  const want = createHash("sha256").update("pilot-2026-10-02|qwen2.5-7b|probe-identification|AWR-1-A|0").digest().readUInt32BE(0) >>> 1;
  assert.equal(s, want);
  assert.ok(Number.isInteger(s) && s >= 0 && s < 2 ** 31);
  const seeds = new Set([0, 1, 2].map((a) => deriveProbeSeed("r", "s", "recall", "X-1-A", a)));
  assert.equal(seeds.size, 3);
  assert.notEqual(deriveProbeSeed("r", "s", "recall", "X-1-A", 0), deriveProbeSeed("r", "s", "identification", "X-1-A", 0));
});

test("labels: fit the server's 200 character limit, state the cross-family facts, and the tier text is pinned to local-subjects", () => {
  const real = readJsonFile(path.join(REAL_RUN, "run-config.json"));
  for (const s of real.subjects) {
    const l = subjectLabelFor({ subject: s, runId: real.run_id, digest: s.digest });
    assertLabelFits("subject_label", l);
    assert.match(l, /access tier: local-open-weight/);
    assert.ok(l.includes(s.digest.slice(0, 12)));
  }
  const j = judgeLabelFor(real);
  assertLabelFits("judge_label", j);
  for (const frag of ["cross-family", "publicly exposed", "no human raters", "2 judges per response"]) assert.ok(j.includes(frag), frag);
  assert.throws(() => assertLabelFits("x", "y".repeat(201)), HarnessError);
  assert.throws(() => judgeLabelFor({ ...real, judges: [{ label: "j", family: "qwen" }] }), /cross-family/);
  assert.ok(readFileSync(path.join(here, "..", "lib", "local-subjects.mjs"), "utf8").includes(`access_tier: "${ACCESS_TIER_LOCAL}"`));
});

// ---------------------------------------------------------------------------
// The MCP client
// ---------------------------------------------------------------------------
test("client: a server that never answers is a timeout, and the child is killed", async () => {
  const c = startMcpServer({ args: ["-e", "setInterval(() => {}, 1000)"], defaultTimeoutMs: 250 });
  const t0 = Date.now();
  await assert.rejects(() => c.initialize(), McpTimeoutError);
  assert.ok(Date.now() - t0 < 5000);
  const { exited } = await c.close();
  assert.ok(exited, "the killed child has exited");
  await assert.rejects(() => c.request("tools/list", {}), McpClosedError);
});

test("client: a server that dies reports its own stderr", async () => {
  const c = startMcpServer({ args: ["-e", "process.stderr.write('boom: fatal reason\\n'); process.exit(3)"], defaultTimeoutMs: 5000 });
  await assert.rejects(
    () => c.initialize(),
    (e) => e instanceof McpClosedError && /boom: fatal reason/.test(e.message) && e.exited.code === 3
  );
  await c.close();
});

test("client: a command that cannot start is a closed-server error, not a crash", async () => {
  const c = startMcpServer({ command: path.join(REPO_ROOT, "definitely-not-a-binary"), args: [], defaultTimeoutMs: 2000 });
  await assert.rejects(() => c.initialize(), McpClosedError);
  await c.close();
});

test("client: initialize, tools/list, JSON-RPC errors and tool errors against the real server", async () => {
  const root = tmp("mcp-client-");
  const frames = [];
  const c = startMcpServer({ env: { CB_ARTIFACT_ROOT: root }, onMessage: (e) => frames.push(e) });
  try {
    const init = await c.initialize();
    assert.equal(init.serverInfo.name, "cb-probe");
    const tools = await c.listTools();
    const names = tools.map((t) => t.name);
    for (const n of ["start_scored_run", "next_item", "record_item_rating", "run_exposure_probe", "finish_scored_run"]) assert.ok(names.includes(n), n);
    assert.ok(tools.find((t) => t.name === "run_exposure_probe").inputSchema.properties.identification_answers);
    await assert.rejects(() => c.request("tools/call", { name: "no_such_tool", arguments: {} }), (e) => e instanceof McpRpcError && e.code === -32602);
    await assert.rejects(() => c.callTool("start_scored_run", { subject_label: "x" }), McpRpcError); // schema: judge_label required
    await assert.rejects(() => c.callTool("next_item", { run_id: "no-such-run" }), (e) => e instanceof McpToolError && /No open scored run/.test(e.text));
    assert.ok(frames.some((f) => f.dir === "out" && f.message.method === "initialize"));
    assert.ok(frames.some((f) => f.dir === "in" && f.message.result?.serverInfo));
  } finally {
    await c.close();
    cleanup(root);
  }
});

// ---------------------------------------------------------------------------
// Write root
// ---------------------------------------------------------------------------
test("write root: the real server refuses a root inside the repo; the harness refuses first and creates nothing", async () => {
  const inRepo = path.join(REPO_ROOT, "research", "model-runs", "pilot-2026-10-02", "mcp-artifacts", "guard-test-unused");
  assert.equal(existsSync(inRepo), false);

  // 1. the server itself (this is the guard the brief asked about)
  const c = startMcpServer({ env: { CB_ARTIFACT_ROOT: inRepo }, defaultTimeoutMs: 8000 });
  await assert.rejects(() => c.initialize(), (e) => e instanceof McpClosedError && /refusing to write/.test(e.message) && /inside the Compassion/.test(e.message));
  await c.close();
  assert.equal(existsSync(inRepo), false, "the refused server created nothing");

  // 2. the harness's own early refusal
  assert.throws(() => assertArtifactRootOutsideRepo(inRepo), HarnessError);
  await assert.rejects(() => openSession({ artifactRoot: inRepo, transcriptFile: path.join(tmp("mcp-t-"), "t.jsonl") }), /inside the repository/);
  assert.equal(existsSync(inRepo), false);
  assert.doesNotThrow(() => assertArtifactRootOutsideRepo(path.join(tmp("mcp-ok-"), "x")));
});

// ---------------------------------------------------------------------------
// Probe phase, end to end through the real server
// ---------------------------------------------------------------------------
test("probe phase: completes through the real server, saves every prompt and reply with seeds, copies the server's files", async () => {
  const runRoot = tmp("mcp-run-");
  const base = tmp("mcp-art-");
  try {
    const config = testConfig();
    const subject = config.subjects[0];
    const ollama = mockOllama();
    const r = await runProbePhase({ config, subject, runRoot, artifactBase: base, ollama, bank });
    assert.equal(r.status, "completed");

    // the server's own result, verbatim
    assert.equal(r.result.phase, "completed");
    assert.equal(r.result.identification.questions_asked, 6);
    assert.equal(typeof r.result.identification.correct, "number");
    assert.equal(typeof r.result.identification.probability_if_unexposed, "number");
    assert.equal(typeof r.result.mean_overlap, "number");

    const P = subjectPaths(runRoot, subject.label);
    const state = readJsonFile(P.state);
    assert.equal(state.probe.status, "completed");
    assert.equal(state.start_scored_run.request.judgeConfiguration, "panel");
    assert.equal(state.start_scored_run.request.trials, 6, "3 subject trials x 2 judges");
    assert.equal(state.start_scored_run.request.include_sensitive, false);
    assert.equal(state.start_scored_run.result.item_count, servedItems(bank).length);
    assert.match(state.leak_check_decision, /Not applied to probe questions/);
    assert.ok(!path.resolve(state.artifact_root).startsWith(REPO_ROOT));

    // every question: one fresh conversation, verbatim prompt + reply, seeds from the spec
    const files = readdirSync(P.probeDir).filter((f) => /^(recall|identification)__/.test(f));
    assert.equal(files.length, 3 + 6);
    for (const f of files) {
      const rec = readJsonFile(path.join(P.probeDir, f));
      assert.equal(rec.status, "ok");
      assert.equal(rec.model_digest, D1);
      assert.equal(rec.conversation, "fresh; one user message; no system prompt");
      const a = rec.attempts[0];
      assert.equal(a.seed, deriveProbeSeed(config.run_id, subject.label, rec.probe_kind, rec.qid, 0));
      assert.deepEqual(a.options, { seed: a.seed });
      assert.equal(rec.prompt_sha256, sha(rec.prompt));
      assert.ok(typeof a.reply === "string");
    }
    assert.equal(ollama.calls.length, 9);
    assert.equal(new Set(ollama.calls.map((c) => c.prompt)).size, 9);
    assert.equal(ollama.calls.every((c) => c.model === subject.tag), true);

    // what the server was sent equals what the model answered
    const sent = transcriptCalls(P.probeTranscript, "run_exposure_probe").find((a) => a.recall_attempts);
    assert.equal(sent.recall_attempts.length, 3);
    assert.ok(sent.recall_attempts.every((x) => x.recalled_text === RECALL_REPLY));
    assert.equal(sent.identification_answers.length, 6);
    assert.ok(sent.identification_answers.every((x) => x.option_id === "A"));

    // copied files
    for (const f of ["run.json", "exposure-probe.json", "identification-answers.json", "identification-key.json"]) assert.ok(existsSync(path.join(P.scorecards, f)), f);
    assert.ok(existsSync(P.result) && existsSync(P.challenge) && existsSync(P.answers));

    // a re-run is a no-op that never asks the model again
    const again = await runProbePhase({ config, subject, runRoot, artifactBase: base, ollama, bank });
    assert.equal(again.already, true);
    assert.equal(ollama.calls.length, 9);
  } finally {
    cleanup(runRoot);
    cleanup(base);
  }
});

test("probe phase: a planted unparseable identification answer makes the probe INCOMPLETE after 2 re-asks; nothing is guessed", async () => {
  const runRoot = tmp("mcp-run-");
  const base = tmp("mcp-art-");
  try {
    const config = testConfig();
    const subject = config.subjects[1];
    const PROSE = "I think it is probably the second one, but I would not want to commit.";
    const ollama = mockOllama({ identReply: (id, idx) => (idx === 1 ? PROSE : "B") });
    const r = await runProbePhase({ config, subject, runRoot, artifactBase: base, ollama, bank });
    assert.equal(r.status, "incomplete");
    assert.equal(r.unanswered.length, 1);
    const [kind, qid] = r.unanswered[0].split(":");
    assert.equal(kind, "identification");
    assert.equal(qid, ollama.order[1]);

    // exactly 1 + 2 re-asks of that question, with distinct, spec-derived seeds
    const asked = ollama.calls.filter((c) => c.prompt.includes(`Which scenario is item ${qid}?`));
    assert.equal(asked.length, 3);
    assert.deepEqual(asked.map((c) => c.options.seed), [0, 1, 2].map((a) => deriveProbeSeed(config.run_id, subject.label, "identification", qid, a)));
    const P = subjectPaths(runRoot, subject.label);
    const rec = readJsonFile(path.join(P.probeDir, `identification__${qid}.json`));
    assert.equal(rec.status, "failed");
    assert.equal(rec.value, null);
    assert.ok(rec.attempts.every((a) => a.reply === PROSE && a.parse.ok === false));

    // no answers call was ever made, and the server says so
    assert.equal(transcriptCalls(P.probeTranscript, "run_exposure_probe").filter((a) => a.recall_attempts !== undefined).length, 0);
    const state = readJsonFile(P.state);
    assert.equal(state.probe.status, "incomplete");
    assert.equal(state.probe.run_exposure_probe_answers_call_made, false);
    assert.equal(state.probe.run_status_after.exposure_probe_status, "challenge_issued");
    assert.equal(state.probe.run_status_after.ready_to_finish, false);
    assert.equal(state.probe.finish_scored_run.refused, true);
    assert.match(state.probe.finish_scored_run.server_message, /run_exposure_probe has not completed/);
    assert.equal(readJsonFile(P.answers).identification_answers.length, 5);
    assert.equal(existsSync(path.join(P.scorecards, "exposure-probe.json")), false, "no probe artifacts are presented as a completed probe");

    // resuming without --retry-failed does not re-ask the failed question
    const callsBefore = ollama.calls.length;
    const same = await runProbePhase({ config, subject, runRoot, artifactBase: base, ollama, bank });
    assert.equal(same.status, "incomplete");
    assert.equal(ollama.calls.length, callsBefore);

    // with --retry-failed and a model that now answers, the SAME scorer run completes and the failed attempts are kept
    const fixed = mockOllama({ identReply: () => "C" });
    const done = await runProbePhase({ config, subject, runRoot, artifactBase: base, ollama: fixed, bank, retryFailed: true });
    assert.equal(done.status, "completed");
    assert.equal(done.scorer_run_id, r.scorer_run_id);
    assert.equal(fixed.calls.length, 1, "only the failed question is re-asked");
    const rec2 = readJsonFile(path.join(P.probeDir, `identification__${qid}.json`));
    assert.equal(rec2.status, "ok");
    assert.equal(rec2.previous_failed.length, 1);
    assert.equal(rec2.previous_failed[0].attempts.length, 3);
  } finally {
    cleanup(runRoot);
    cleanup(base);
  }
});

test("probe phase: an empty or trivial recall is re-asked, never padded", async () => {
  const runRoot = tmp("mcp-run-");
  const base = tmp("mcp-art-");
  try {
    const config = testConfig();
    const subject = config.subjects[0];
    const ollama = mockOllama({ recallReply: "Unknown." });
    const r = await runProbePhase({ config, subject, runRoot, artifactBase: base, ollama, bank });
    assert.equal(r.status, "incomplete");
    assert.equal(r.unanswered.filter((u) => u.startsWith("recall:")).length, 3);
    assert.equal(ollama.calls.filter((c) => !c.prompt.includes("Which scenario")).length, 9, "3 recall questions x (1 + 2 re-asks)");
  } finally {
    cleanup(runRoot);
    cleanup(base);
  }
});

test("probe phase: a digest mismatch refuses before the model or the server is touched", async () => {
  const runRoot = tmp("mcp-run-");
  const base = tmp("mcp-art-");
  try {
    const config = testConfig();
    const ollama = mockOllama();
    const wrong = { ...config.subjects[0], digest: "c".repeat(64) };
    await assert.rejects(() => runProbePhase({ config, subject: wrong, runRoot, artifactBase: base, ollama, bank }), /digest mismatch/);
    assert.equal(ollama.calls.length, 0);
    assert.equal(existsSync(path.join(runRoot, "probe-answers")), false);
  } finally {
    cleanup(runRoot);
    cleanup(base);
  }
});

// ---------------------------------------------------------------------------
// Finish phase
// ---------------------------------------------------------------------------
/** Synthetic validated rows over the REAL bank: 6 per served item (3 responses x 2 judges), consistent with the subject's records. */
function syntheticRows(subjectLabel, { tamperHashFor = null } = {}) {
  const rows = [];
  for (const item of servedItems(bank)) {
    let k = 0;
    for (let trial = 1; trial <= 3; trial += 1) {
      const text = `Reply ${trial} for ${item.id}: I would first listen carefully and ask what you actually need before suggesting anything at all.`;
      for (const judge of ["claude-opus", "claude-sonnet"]) {
        k += 1;
        const anchor = (item.anchors ?? []).find((a) => a.level === 3);
        rows.push({
          item_id: item.id,
          scorer_trial_index: k,
          response_id: `r-${item.id}-${trial}`,
          subject_trial: trial,
          judge,
          judge_provenance: "original",
          rating_1_5: 3,
          anchor_matched: anchor ? anchor.label : "Functional",
          evidence_quote: "I would first listen carefully and ask what you actually need",
          response_text: text,
          outgoing_message_sha256: tamperHashFor === item.id ? sha("something else") : sha(item.prompt),
        });
      }
    }
  }
  return rows;
}

test("finish phase: refuses before a completed probe; records every rating via next_item with prompt assertions; finishes with the server", async () => {
  const runRoot = tmp("mcp-run-");
  const base = tmp("mcp-art-");
  try {
    const config = testConfig();
    const subject = config.subjects[0];
    const rows = syntheticRows(subject.label);

    await assert.rejects(() => runFinishPhase({ config, subject, rows, runRoot, artifactBase: base, bank }), /run --phase probe first/);

    const probe = await runProbePhase({ config, subject, runRoot, artifactBase: base, ollama: mockOllama(), bank });
    assert.equal(probe.status, "completed");

    // a served prompt that does not hash to what the subject was sent is refused (and the bad row records nothing past it)
    const victim = rows[0].item_id;
    await assert.rejects(
      () => runFinishPhase({ config, subject, rows: syntheticRows(subject.label, { tamperHashFor: victim }), runRoot, artifactBase: base, bank }),
      /does not hash to the message the subject was sent/
    );

    const r = await runFinishPhase({ config, subject, rows, runRoot, artifactBase: base, bank });
    assert.equal(r.status, "completed");
    const card = r.scorecard;
    assert.equal(card.official, false);
    assert.equal(card.comparability, "none");
    assert.equal(card.provenance.trials_per_item, 6);
    assert.match(card.provenance.judge_label, /cross-family/);
    assert.equal(card.contamination.probed, true);
    assert.equal(card.contamination.identification.questions_asked, 6);

    const P = subjectPaths(runRoot, subject.label);
    assert.ok(existsSync(path.join(P.scorecards, "scorecard.json")));
    const map = readJsonFile(path.join(P.scorecards, "mcp-rating-map.json"));
    assert.equal(map.rows.length, rows.length);
    assert.equal(map.trial_files.length, rows.length);
    assert.ok(map.rows.every((x) => x.served_prompt_sha256));

    // the finish transcript shows next_item before every record_item_rating
    const methods = readFileSync(P.finishTranscript, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l))
      .filter((e) => e.dir === "out" && e.message.method === "tools/call").map((e) => e.message.params.name);
    const recs = methods.filter((m) => m === "record_item_rating").length;
    assert.equal(recs, rows.length);
    assert.ok(methods.filter((m) => m === "next_item").length >= rows.length);
  } finally {
    cleanup(runRoot);
    cleanup(base);
  }
});

// ---------------------------------------------------------------------------
// The bin
// ---------------------------------------------------------------------------
test("bin: --phase finish refuses without a judge validity report, before anything is recorded or started", () => {
  const root = tmp("mcp-bin-");
  const base = tmp("mcp-bin-art-");
  try {
    writeJsonFile(path.join(root, "run-config.json"), { ...readJsonFile(path.join(REAL_RUN, "run-config.json")), run_id: "unit-mcp-run" });
    writeJsonFile(path.join(root, "keys", "judge-key.json"), { run_id: "unit-mcp-run", validity_required: true, judges: ["claude-opus"], responses: [], batches: [] });
    const ratings = path.join(root, "ratings");
    mkdirSync(ratings, { recursive: true });
    const r = runBin("run-mcp-probe", ["--run-id", "unit-mcp-run", "--run-root", root, "--phase", "finish", "--ratings", ratings, "--artifact-base", base]);
    assert.equal(r.status, 1, r.stderr);
    assert.match(r.stderr, /no judge validity report/);
    assert.equal(existsSync(path.join(root, "probe-answers")), false);
    assert.equal(readdirSync(base).length, 0, "no server was started and nothing was written");
    // and it is the validity file that matters, not the path: a stale or missing --validity is the same refusal
    const r2 = runBin("run-mcp-probe", ["--run-id", "unit-mcp-run", "--run-root", root, "--phase", "finish", "--ratings", ratings, "--artifact-base", base, "--validity", path.join(root, "nope.json")]);
    assert.equal(r2.status, 1);
    assert.match(r2.stderr, /no judge validity report/);
  } finally {
    cleanup(root);
    cleanup(base);
  }
});

test("bin: usage errors exit 2", () => {
  assert.equal(runBin("run-mcp-probe", []).status, 2);
  assert.equal(runBin("run-mcp-probe", ["--phase", "bogus"]).status, 2);
});

test("bin: --phase probe against a loopback fake Ollama and the real server completes both subjects", async () => {
  const root = tmp("mcp-bin-");
  const base = tmp("mcp-bin-art-");
  const calls = [];
  const fake = createServer((req, res) => {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      const send = (o) => { res.setHeader("content-type", "application/json"); res.end(JSON.stringify(o)); };
      if (req.url === "/api/version") return send({ version: "0.0.fake" });
      if (req.url === "/api/tags") return send({ models: [{ name: "qwen2.5:7b", digest: `sha256:${D1}` }, { name: "llama3.2:latest", digest: `sha256:${D2}` }] });
      if (req.url === "/api/chat") {
        const j = JSON.parse(body);
        calls.push(j);
        const q = j.messages[0].content;
        return send({ message: { role: "assistant", content: /Which scenario is item/.test(q) ? "Answer: D" : RECALL_REPLY }, done_reason: "stop", eval_count: 3 });
      }
      res.statusCode = 404;
      res.end("{}");
    });
  });
  await new Promise((resolve) => fake.listen(0, "127.0.0.1", resolve));
  try {
    const config = testConfig();
    config.ollama_host = `http://127.0.0.1:${fake.address().port}`;
    writeJsonFile(path.join(root, "run-config.json"), config);
    const out = await new Promise((resolve) => {
      const child = spawn(process.execPath, [path.join(BIN, "run-mcp-probe.mjs"), "--run-id", "unit-mcp-run", "--run-root", root, "--phase", "probe", "--artifact-base", base], { encoding: "utf8" });
      let stdout = "";
      let stderr = "";
      child.stdout.on("data", (d) => (stdout += d));
      child.stderr.on("data", (d) => (stderr += d));
      child.on("close", (code) => resolve({ code, stdout, stderr }));
    });
    assert.equal(out.code, 0, out.stderr + out.stdout);
    assert.equal((out.stdout.match(/probe COMPLETED/g) ?? []).length, 2);
    assert.match(out.stdout, /"probability_if_unexposed"/);
    assert.equal(calls.length, 18);
    for (const s of config.subjects) {
      const P = subjectPaths(root, s.label);
      assert.equal(readJsonFile(P.state).probe.status, "completed");
      assert.ok(existsSync(path.join(P.scorecards, "exposure-probe.json")));
    }
  } finally {
    fake.close();
    cleanup(root);
    cleanup(base);
  }
});
