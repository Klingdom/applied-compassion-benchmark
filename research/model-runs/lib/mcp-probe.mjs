// research/model-runs/lib/mcp-probe.mjs
//
// PREREGISTRATION.md section 7: drive cb-probe's MCP server over its real stdio protocol for each local subject.
//
//   --phase probe   start_scored_run -> run_exposure_probe (challenge) -> the LOCAL model answers every recall and
//                   identification question, each in its own fresh conversation, with a fixed seed ->
//                   run_exposure_probe (answers). If any question has no valid answer the probe is INCOMPLETE: nothing
//                   is guessed, the answers call is never made, and finish_scored_run is called once only to record
//                   the server's own refusal.
//   --phase finish  (needs the judge validity gate and validated judge ratings) next_item -> record_item_rating for
//                   every (item, scorer trial) -> finish_scored_run. Refuses unless the validity report is fresh.
//
// THE SERVER IS DRIVEN ONLY OVER STDIO: nothing here calls a cb-probe function to start, probe, rate or finish a run.
// (The harness helpers imported below, common.mjs and assemble.mjs, load cb-probe modules for their own purposes: the
// row-building and the serving-rule cross-check.) The server is a child process; the only coupling is the tool schemas it
// publishes via tools/list (checked below) and the JSON it returns. The one exception is clearly labelled:
// posthocScorecardChecks() loads cb-probe's validator AFTER the run, to check the artifact the server produced.
//
// LEAK CHECK DECISION (recorded in every mcp-state.json): the subject-brief leak check is NOT applied to the probe
// questions. The probe challenge names item ids and scenario titles by design (that is what recall and identification
// test), so a rubric/id/construct leak check would fire on legitimate content. What the probe must not contain is
// anchors, and the server's challenge never carries them. Trial prompts (the 83 served items) were leak-checked in
// lib/local-subjects.mjs and are re-verified here by hash: the prompt the server serves for next_item must hash to
// the outgoing_message_sha256 recorded when the subject actually answered it.

import { appendFileSync, copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";

import { HarnessError, refuse, readJson, writeJson, sha256, isInside, REPO_ROOT, servedItems } from "./common.mjs";
import { verifyPinnedDigest } from "./ollama.mjs";
import { startMcpServer, McpError, McpToolError } from "./mcp-client.mjs";
import { loadInputs, bridgeTexts, buildSubjectRows } from "./assemble.mjs";
import { loadJudgeAnswers, loadRoutedAnswers } from "./judge-answers.mjs";
import { assertValidityFresh } from "./judge-validity.mjs";
import { checkRouting } from "./judge-routing.mjs";
import { readRecord, recordPath, buildMessages } from "./local-subjects.mjs";

export const REQUIRED_TOOLS = Object.freeze(["start_scored_run", "next_item", "record_item_rating", "run_exposure_probe", "run_status", "finish_scored_run"]);

/** Same text as keys/subject-brief-key.json access_tier (lib/local-subjects.mjs finalizeRun); a test pins them together. */
export const ACCESS_TIER_LOCAL = "local-open-weight (Ollama, 4-bit quantised builds pinned by digest)";

export const LEAK_CHECK_DECISION =
  "Not applied to probe questions: the challenge references item ids and scenario titles by design, which the " +
  "subject-brief leak check would flag. Anchors never appear in the challenge. Trial prompts are verified by " +
  "sha256 against the outgoing messages recorded when the subject answered (finish phase).";

const SAFE_ID = /^[A-Za-z0-9._-]+$/;
const SEED_MODULUS = 2 ** 31;

// ---------------------------------------------------------------------------
// Labels (server maxLength is 200 for both)
// ---------------------------------------------------------------------------
export function subjectLabelFor({ subject, runId, digest }) {
  return `${subject.label} (access tier: local-open-weight; ${subject.tag}@sha256:${digest.slice(0, 12)}, 4-bit; blinded cross-model pilot ${runId}; via MCP stdio)`;
}

/**
 * judgeConfiguration is "panel": every reply is rated by 2 judges (config.judges_per_response) from a set disjoint from
 * the subjects, and cb-probe documents "panel" as "two or more judge labels, with disagreement reported". "cross" would
 * describe ONE other model judging, and "self" is false. The families are read from the config, not typed here.
 */
export function judgeLabelFor(config) {
  const families = [...new Set(config.judges.map((j) => j.family))].sort();
  const subjectFamilies = new Set(config.subjects.map((s) => s.family));
  if (families.some((f) => subjectFamilies.has(f))) refuse("a judge family equals a subject family; the label would not be cross-family");
  return (
    `panel: ${config.judges_per_response} judges per response, all ${families.join("/")} family, subject not: cross-family; ` +
    "LLM-only, no human raters; item bank publicly exposed"
  );
}

export function assertLabelFits(name, value) {
  if (value.length > 200) refuse(`${name} is ${value.length} characters; cb-probe's start_scored_run schema allows 200: ${value}`);
}

// ---------------------------------------------------------------------------
// Seeds
// ---------------------------------------------------------------------------
/** First 31 bits (big-endian) of sha256(`run|subject|probe-<kind>|qid|attempt`). The attempt is in the hash, per the brief. */
export function deriveProbeSeed(runId, subject, kind, qid, attempt) {
  const digest = createHash("sha256").update(`${runId}|${subject}|probe-${kind}|${qid}|${attempt}`).digest();
  return (digest.readUInt32BE(0) >>> 1) % SEED_MODULUS;
}

// ---------------------------------------------------------------------------
// Prompts (one fresh conversation each; wording follows lib/probe.mjs's brief, one question at a time)
// ---------------------------------------------------------------------------
const PREAMBLE = "This is a short memory check. Answer from memory only: you have no tools and cannot look anything up.";

export function buildRecallPrompt(itemId) {
  return [
    PREAMBLE,
    "",
    `Write, as closely as you can recall it, the exact wording of the message with the id ${itemId}. If you have no memory of it, ` +
      "say so plainly in a full sentence rather than inventing text that merely sounds plausible; a blank or one-word reply is not accepted.",
  ].join("\n");
}

export function buildIdentificationPrompt(question) {
  const ids = question.options.map((o) => o.option_id);
  const list = ids.length > 1 ? `${ids.slice(0, -1).join(", ")} or ${ids[ids.length - 1]}` : ids[0];
  return [
    PREAMBLE,
    "",
    question.question,
    "",
    ...question.options.map((o) => `${o.option_id}: ${o.description}`),
    "",
    `Choose the option you believe is correct. If you do not know, guess; guessing is expected and is not a failure. Reply with ONLY the letter of your choice (${list}) and nothing else.`,
  ].join("\n");
}

// ---------------------------------------------------------------------------
// Strict answer parsing
// ---------------------------------------------------------------------------
const WRAP_START = /^[\s"'`*_(\[]+/;
const WRAP_END = /[\s"'`*_)\].!,;:]+$/;

/**
 * Identification: the reply must name exactly one of the ISSUED option ids. Accepted forms, nothing else:
 *   R1  the first non-empty line is just the id, optionally wrapped in quotes/bold/brackets/a trailing period, optionally
 *       prefixed "Answer:" / "Option" / "Choice" ("B", "**B**", "(B)", "B.", "Answer: B", "Option B", "The answer is B").
 *       Case-insensitive, because the whole line is a single letter and so unambiguous.
 *   R2  the first non-empty line starts with an UPPERCASE issued id followed by a delimiter and more text ("B. Foo", "C) Foo").
 * A later line that declares a DIFFERENT issued id ("Answer: C") makes the whole reply unparseable (a contradiction).
 * Anything else (prose, two letters, an id not offered, an empty reply) is unparseable. No fuzzy matching, no guessing.
 */
export function parseIdentificationChoice(reply, optionIds) {
  if (typeof reply !== "string" || reply.trim().length === 0) return { ok: false, reason: "empty reply" };
  const ids = new Set(optionIds);
  const lines = reply.split(/\r?\n/);
  const firstIdx = lines.findIndex((l) => l.trim().length > 0);
  const first = lines[firstIdx];
  const rest = lines.slice(firstIdx + 1).join("\n");

  let chosen = null;
  let rule = null;
  const core = first.replace(WRAP_START, "").replace(WRAP_END, "");
  const r1 = /^(?:(?:the\s+)?(?:answer|option|choice)\s*(?:is)?\s*[:\-]?\s*)?[(\[*_`"']*([A-Za-z])[)\]*_`"']*$/i.exec(core);
  if (r1 && ids.has(r1[1].toUpperCase())) {
    chosen = r1[1].toUpperCase();
    rule = "R1: the first line is just the option id";
  } else {
    const r2 = /^[\s"'`*_(\[]*([A-Z])[\s*_`"')\]]*[.):\-–—]\s+\S/.exec(first);
    if (r2 && ids.has(r2[1])) {
      chosen = r2[1];
      rule = "R2: the first line starts with the option id and a delimiter";
    }
  }
  if (chosen === null) return { ok: false, reason: "no issued option id found in the required forms" };

  const contra = /\b(?:[Aa]nswer|[Oo]ption|[Cc]hoice)\s*(?:is|:)\s*\**\(?([A-Z])\b/g;
  for (const m of rest.matchAll(contra)) {
    const other = m[1].toUpperCase();
    if (ids.has(other) && other !== chosen) return { ok: false, reason: `a later line declares ${other} after ${chosen} (contradiction)` };
  }
  return { ok: true, value: chosen, rule };
}

/** Local pre-check mirroring the server's floor (3 normalised tokens) so a trivial reply is re-asked, not sent. The server stays the authority. */
export function recallTokenCount(text) {
  return String(text ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter(Boolean).length;
}
export function acceptRecall(reply) {
  const n = recallTokenCount(reply);
  return n >= 3 ? { ok: true, value: reply, rule: "recall: sent as given", tokens: n } : { ok: false, reason: `not a substantive attempt (${n} token(s); the server needs 3)` };
}

// ---------------------------------------------------------------------------
// Paths and state
// ---------------------------------------------------------------------------
export function subjectPaths(runRoot, label) {
  if (!SAFE_ID.test(label)) refuse(`unsafe subject label ${label}`);
  const probeDir = path.join(runRoot, "probe-answers", label);
  return {
    probeDir,
    state: path.join(probeDir, "mcp-state.json"),
    challenge: path.join(probeDir, "challenge.json"),
    answers: path.join(probeDir, "answers.json"),
    result: path.join(probeDir, "probe-result.json"),
    probeTranscript: path.join(probeDir, "mcp-transcript.probe.jsonl"),
    finishTranscript: path.join(probeDir, "mcp-transcript.finish.jsonl"),
    scorecards: path.join(runRoot, "mcp-scorecards", label),
  };
}

/** cb-probe refuses a write root inside the repo or any git tree; refuse early with the same advice, before spawning anything. */
export function assertArtifactRootOutsideRepo(artifactRoot) {
  if (isInside(REPO_ROOT, artifactRoot)) {
    refuse(`artifact root ${artifactRoot} is inside the repository; cb-probe refuses to write there by design. Use a directory outside the repo (default: under your home directory).`);
  }
}

const loadState = (file) => (existsSync(file) ? readJson(file) : null);

// ---------------------------------------------------------------------------
// A cb-probe server session
// ---------------------------------------------------------------------------
export async function openSession({ artifactRoot, transcriptFile, serverOptions = {} }) {
  assertArtifactRootOutsideRepo(artifactRoot);
  mkdirSync(path.dirname(transcriptFile), { recursive: true });
  const client = startMcpServer({
    defaultTimeoutMs: 60000,
    ...serverOptions,
    env: { ...(serverOptions.env ?? {}), CB_ARTIFACT_ROOT: artifactRoot },
    onMessage: (e) => appendFileSync(transcriptFile, `${JSON.stringify(e)}\n`),
  });
  try {
    const init = await client.initialize();
    const tools = await client.listTools();
    const names = new Set(tools.map((t) => t.name));
    const missing = REQUIRED_TOOLS.filter((n) => !names.has(n));
    if (missing.length > 0) refuse(`the server does not publish the tool(s) ${missing.join(", ")}`);
    const probe = tools.find((t) => t.name === "run_exposure_probe");
    if (!probe.inputSchema?.properties?.identification_answers) {
      refuse("run_exposure_probe's published schema has no identification_answers; this server predates the 2026-10-02 change that requires them");
    }
    return { client, serverInfo: init.serverInfo, toolsSha256: sha256(JSON.stringify(tools)), artifactRoot };
  } catch (e) {
    await client.close();
    if (e instanceof McpError) throw new HarnessError(`could not use the cb-probe server with CB_ARTIFACT_ROOT=${artifactRoot}: ${e.message}`);
    throw e;
  }
}

// ---------------------------------------------------------------------------
// Asking the local model one question
// ---------------------------------------------------------------------------
async function askQuestion({ ollama, subject, runId, kind, qid, prompt, accept, maxRetries, file, retryFailed, meta, log, now, config = {} }) {
  if (!SAFE_ID.test(qid)) refuse(`unsafe question id ${qid}`);
  const promptHash = sha256(prompt);
  const existing = existsSync(file) ? readJson(file) : null;
  let previousFailed;
  if (existing) {
    if (existing.prompt_sha256 !== promptHash) refuse(`${file} was recorded for a different prompt; refusing to reuse it`);
    if (existing.status === "ok" || !retryFailed) return existing;
    previousFailed = [...(existing.previous_failed ?? []), { attempts: existing.attempts, recorded_at: existing.finished_at }];
  }

  const startedAt = now().toISOString();
  const attempts = [];
  let final = null;
  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    const seed = deriveProbeSeed(runId, subject.label, kind, qid, attempt);
    const options = { seed };
    const a = { attempt, seed, options, started_at: now().toISOString() };
    const t0 = Date.now();
    try {
      // RUN-SYS-1: same explicit system message as the subject answers (legacy runs: one user turn, as recorded).
      const r = await ollama.chat({ model: subject.tag, messages: buildMessages(config, prompt), options });
      const content = r && r.message && typeof r.message.content === "string" ? r.message.content : "";
      Object.assign(a, {
        error: null,
        reply: content, // verbatim, every attempt kept
        reply_chars: content.length,
        done_reason: r.done_reason ?? null,
        eval_count: r.eval_count ?? null,
        total_duration_ns: r.total_duration ?? null,
      });
      a.parse = accept(content);
      if (a.parse.ok) final = { attempt, value: a.parse.value, rule: a.parse.rule };
    } catch (e) {
      Object.assign(a, { error: String(e && e.message ? e.message : e), reply: null, parse: { ok: false, reason: "runtime error" } });
    }
    a.wall_ms = Date.now() - t0;
    a.ended_at = now().toISOString();
    attempts.push(a);
    if (final) break;
  }

  const record = {
    kind: "mcp-probe-question",
    run_id: runId,
    subject: subject.label,
    probe_kind: kind,
    qid,
    status: final ? "ok" : "failed",
    prompt, // verbatim
    prompt_sha256: promptHash,
    conversation: "fresh; one user message; no system prompt",
    model_tag: subject.tag,
    model_digest: meta.digest,
    ollama_version: meta.ollamaVersion,
    seed_rule: "first 31 bits of sha256(run_id|subject|probe-<kind>|qid|attempt)",
    attempts,
    final_attempt: final ? final.attempt : null,
    value: final ? final.value : null,
    parse_rule: final ? final.rule : null,
    started_at: startedAt,
    finished_at: now().toISOString(),
  };
  if (previousFailed) record.previous_failed = previousFailed;
  writeJson(file, record);
  log(`  ${kind} ${qid}: ${record.status} (${attempts.length} attempt(s))${final ? ` -> ${kind === "identification" ? final.value : `${final.value.length} chars`}` : ""}`);
  return record;
}

// ---------------------------------------------------------------------------
// Phase: probe
// ---------------------------------------------------------------------------
/**
 * @returns {Promise<{status: "completed"|"incomplete"|"server-refused", scorer_run_id: string, ...}>}
 */
export async function runProbePhase({ config, subject, runRoot, artifactBase, ollama, bank, serverOptions = {}, retryFailed = false, log = () => {}, now = () => new Date() }) {
  const P = subjectPaths(runRoot, subject.label);
  const artifactRoot = path.resolve(artifactBase, subject.label);
  assertArtifactRootOutsideRepo(artifactRoot);

  const digest = await verifyPinnedDigest(ollama, subject);
  const ollamaVersion = await ollama.version();
  const meta = { digest, ollamaVersion };

  let state = loadState(P.state);
  if (state) {
    if (path.resolve(state.artifact_root) !== artifactRoot) refuse(`${P.state} was written for artifact root ${state.artifact_root}; this invocation uses ${artifactRoot}`);
    if (state.run_id !== config.run_id) refuse(`${P.state} belongs to run ${state.run_id}`);
    if (state.probe?.status === "completed") return { status: "completed", scorer_run_id: state.scorer_run_id, already: true, result_file: P.result };
  }

  const session = await openSession({ artifactRoot, transcriptFile: P.probeTranscript, serverOptions });
  const { client } = session;
  try {
    const call = async (name, args) => {
      try {
        return await client.callTool(name, args);
      } catch (e) {
        if (e instanceof McpError && !(e instanceof McpToolError)) throw new HarnessError(`${name}: ${e.message}`);
        throw e;
      }
    };

    // ---- start (or re-attach to) the scored run
    if (!state) {
      const served = servedItems(bank);
      const args = {
        subject_label: subjectLabelFor({ subject, runId: config.run_id, digest }),
        judge_label: judgeLabelFor(config),
        judgeConfiguration: "panel",
        trials: config.trials * config.judges_per_response,
        seed: config.master_seed,
        include_sensitive: false,
      };
      assertLabelFits("subject_label", args.subject_label);
      assertLabelFits("judge_label", args.judge_label);
      const started = await call("start_scored_run", args);
      if (started.item_count !== served.length) {
        refuse(`start_scored_run planned ${started.item_count} items but the serving rule yields ${served.length}; the serving rule drifted between cb-probe and this harness`);
      }
      if (started.total_planned_trials !== served.length * args.trials) refuse(`start_scored_run planned ${started.total_planned_trials} trials, expected ${served.length * args.trials}`);
      if (started.judge_configuration !== "panel" || started.include_sensitive !== false) refuse("start_scored_run did not open a panel run with sensitive items excluded");
      state = {
        kind: "mcp-probe-state",
        run_id: config.run_id,
        subject: subject.label,
        scorer_run_id: started.run_id,
        artifact_root: artifactRoot,
        started_at: now().toISOString(),
        model_tag: subject.tag,
        model_digest: digest,
        ollama_version: ollamaVersion,
        server: { info: session.serverInfo, tools_list_sha256: session.toolsSha256 },
        start_scored_run: {
          request: args,
          result: started,
          judge_configuration_rationale:
            "panel: 2 judges rate every reply, so cross (one other model) would under-describe it and self is false. " +
            "trials = subject trials x judges per response, because cb-probe stores one rating per (item, trial_index) and has no per-response panel (same representation as lib/assemble.mjs).",
        },
        leak_check_decision: LEAK_CHECK_DECISION,
        probe: { status: "started" },
      };
      writeJson(P.state, state);
    } else {
      const st = await call("run_status", { run_id: state.scorer_run_id });
      if (st.finished) refuse(`scored run ${state.scorer_run_id} is already finished`);
    }
    const runId = state.scorer_run_id;

    // ---- challenge (idempotent on the server)
    const challenge = await call("run_exposure_probe", { run_id: runId });
    writeJson(P.challenge, challenge);
    if (challenge.phase === "completed") {
      // The answers call landed before a crash; the server is the record.
      writeJson(P.result, challenge);
      state.probe = { status: "completed", recovered_from_server: true, completed_at: now().toISOString() };
      writeJson(P.state, state);
      copyProbeArtifacts({ artifactRoot, runId, dest: P.scorecards });
      return { status: "completed", scorer_run_id: runId, result: challenge, result_file: P.result };
    }
    if (challenge.phase !== "challenge" || !Array.isArray(challenge.probe_item_ids) || challenge.probe_item_ids.length === 0) {
      refuse(`unexpected challenge shape from run_exposure_probe: ${JSON.stringify(challenge).slice(0, 300)}`);
    }
    const questions = challenge.identification && challenge.identification.available ? challenge.identification.questions : [];
    for (const q of questions) {
      if (!q || typeof q.item_id !== "string" || !Array.isArray(q.options) || q.options.length < 2) refuse(`malformed identification question: ${JSON.stringify(q).slice(0, 200)}`);
    }
    log(`[${subject.label}] challenge: ${challenge.probe_item_ids.length} recall, ${questions.length} identification question(s)`);

    // ---- ask the local model
    const common = { ollama, subject, runId: config.run_id, maxRetries: config.max_retries, retryFailed, meta, log, now, config };
    const recall = [];
    for (const id of challenge.probe_item_ids) {
      recall.push(
        await askQuestion({ ...common, kind: "recall", qid: id, prompt: buildRecallPrompt(id), accept: acceptRecall, file: path.join(P.probeDir, `recall__${id}.json`) })
      );
    }
    const ident = [];
    for (const q of questions) {
      const optionIds = q.options.map((o) => o.option_id);
      ident.push(
        await askQuestion({
          ...common,
          kind: "identification",
          qid: q.item_id,
          prompt: buildIdentificationPrompt(q),
          accept: (reply) => parseIdentificationChoice(reply, optionIds),
          file: path.join(P.probeDir, `identification__${q.item_id}.json`),
        })
      );
    }
    const failed = [...recall, ...ident].filter((r) => r.status !== "ok");
    const answers = {
      recall_attempts: recall.filter((r) => r.status === "ok").map((r) => ({ item_id: r.qid, recalled_text: r.value })),
      identification_answers: ident.filter((r) => r.status === "ok").map((r) => ({ item_id: r.qid, option_id: r.value })),
      unanswered: failed.map((r) => `${r.probe_kind}:${r.qid}`),
    };
    writeJson(P.answers, answers);

    // ---- incomplete: no guessing; ask the server to finish once, to record its refusal
    if (failed.length > 0) {
      let finishRefusal;
      try {
        const unexpected = await call("finish_scored_run", { run_id: runId });
        finishRefusal = { unexpected_success: true, note: "finish_scored_run returned a scorecard for an incomplete probe: a SERVER BUG", official: unexpected.official };
      } catch (e) {
        if (!(e instanceof McpToolError)) throw e;
        finishRefusal = { refused: true, server_message: e.text };
      }
      const st = await call("run_status", { run_id: runId });
      state.probe = {
        status: "incomplete",
        recorded_at: now().toISOString(),
        unanswered: answers.unanswered,
        run_exposure_probe_answers_call_made: false,
        run_status_after: { exposure_probe_status: st.exposure_probe_status, ready_to_finish: st.ready_to_finish, finished: st.finished },
        finish_scored_run: finishRefusal,
      };
      writeJson(P.state, state);
      return { status: "incomplete", scorer_run_id: runId, unanswered: answers.unanswered, finish_scored_run: finishRefusal };
    }

    // ---- complete: submit
    let result;
    try {
      result = await call("run_exposure_probe", {
        run_id: runId,
        recall_attempts: answers.recall_attempts,
        identification_answers: answers.identification_answers,
      });
    } catch (e) {
      if (!(e instanceof McpToolError)) throw e;
      state.probe = { status: "server-refused", recorded_at: now().toISOString(), server_message: e.text };
      writeJson(P.state, state);
      return { status: "server-refused", scorer_run_id: runId, server_message: e.text };
    }
    writeJson(P.result, result);
    state.probe = { status: "completed", completed_at: now().toISOString() };
    writeJson(P.state, state);
    copyProbeArtifacts({ artifactRoot, runId, dest: P.scorecards });
    return { status: "completed", scorer_run_id: runId, result, result_file: P.result };
  } finally {
    await client.close();
  }
}

const PROBE_FILES = ["run.json", "exposure-probe.json", "identification-answers.json", "identification-key.json"];

function copyProbeArtifacts({ artifactRoot, runId, dest }) {
  mkdirSync(dest, { recursive: true });
  const src = path.join(artifactRoot, runId);
  for (const f of PROBE_FILES) if (existsSync(path.join(src, f))) copyFileSync(path.join(src, f), path.join(dest, f));
}

// ---------------------------------------------------------------------------
// Phase: finish
// ---------------------------------------------------------------------------
/**
 * Gate + load. Refuses unless a fresh judge validity report exists (the same gate assemble-run.mjs uses), then returns
 * the SAME validated ratings assemble-run.mjs would record, as per-subject scorer rows in scorer order, each carrying the
 * outgoing-message hash recorded when the subject answered.
 */
export function loadFinishRows({ runRoot, keysDir, ratingsDirs, routingFile = null, validityFile }) {
  const originalKeyFile = path.join(keysDir, "judge-key.json");
  if (!existsSync(originalKeyFile)) refuse(`${originalKeyFile} does not exist; run the judging stage first`);
  const originalKeyText = readFileSync(originalKeyFile, "utf8");
  const originalKey = JSON.parse(originalKeyText);
  if (originalKey.validity_required !== true) refuse("this run's judge key does not require a validity report; --phase finish is only for explicit-judge-set runs");
  // Section 5: before any composite. Absent is refused up front, before anything is read or any server is started.
  if (!validityFile || !existsSync(validityFile)) {
    refuse(
      `no judge validity report at ${validityFile ?? "(none given)"}. PREREGISTRATION.md section 5 requires the unfound-quote ` +
        "measurement before any composite: run bin/judge-validity.mjs first. Nothing was recorded."
    );
  }
  if (ratingsDirs.length === 0) refuse("--ratings is required for --phase finish");
  for (const d of ratingsDirs) if (!existsSync(d)) refuse(`--ratings directory ${d} does not exist`);
  if (!routingFile && ratingsDirs.length > 1) refuse("more than one --ratings directory is only accepted together with --routing");

  const { subjectKey, judgeKey, responsesById } = loadInputs(keysDir, routingFile);
  assertValidityFresh({ validityFile, keysDir, originalKeyText, ratingsDirs, routingKey: routingFile ? judgeKey : null, runId: subjectKey.run_id });
  if (!Array.isArray(judgeKey.judges)) refuse("the judge key has no explicit judge set");
  const resp = judgeKey.responses;
  const routeProblems = checkRouting({ responses: resp, routes: resp.map((r) => r.judges), judges: judgeKey.judges, familyOf: judgeKey.family_of });
  if (routeProblems.length > 0) refuse(`routing breaks the family rule:\n  ${routeProblems.slice(0, 8).join("\n  ")}`);

  const bridgeById = bridgeTexts(judgeKey);
  const { errors, ratings } = routingFile
    ? loadRoutedAnswers({ routingKey: judgeKey, dirs: ratingsDirs, responsesById, bridgeById })
    : loadJudgeAnswers({ judgeKey, ratingsDir: ratingsDirs[0], responsesById, bridgeById });
  if (errors.length > 0) throw new HarnessError(`REFUSED: judge answers are invalid (${errors.length} problem(s)); nothing was recorded:\n  ${errors.slice(0, 10).join("\n  ")}`);
  const ratingsByPair = new Map(ratings.map((r) => [`${r.response_id}|${r.judge}`, r]));
  const expectedPairs = judgeKey.responses.flatMap((r) => r.judges.map((j) => `${r.response_id}|${j}`));
  if (expectedPairs.length !== ratingsByPair.size || !expectedPairs.every((p) => ratingsByPair.has(p))) {
    refuse("rating set does not equal the routed (response, judge) pairs");
  }

  const rowsBySubject = {};
  for (const subject of subjectKey.subjects) {
    const rows = buildSubjectRows({ subject, subjectKey, responsesById, ratingsByPair });
    rowsBySubject[subject] = rows.map((r) => {
      const rec = readRecord(recordPath(runRoot, subject, r.item_id, r.subject_trial));
      if (!rec || rec.status !== "ok") refuse(`no ok subject-answer record for ${subject} ${r.item_id} trial ${r.subject_trial}`);
      return { ...r, outgoing_message_sha256: rec.outgoing_message_sha256 };
    });
  }
  return { runId: subjectKey.run_id, subjectKey, rowsBySubject };
}

/**
 * Record every row through the real server and finish. Rows are consumed in the order the SERVER asks for them
 * (next_item), and each step asserts that the served prompt is the bank's prompt for the item the reply answered,
 * and is byte-identical (sha256) to the message the subject was actually sent.
 */
export async function runFinishPhase({ config, subject, rows, runRoot, artifactBase, bank, serverOptions = {}, log = () => {}, now = () => new Date() }) {
  const P = subjectPaths(runRoot, subject.label);
  const state = loadState(P.state);
  if (!state) refuse(`no ${P.state}; run --phase probe first`);
  if (state.probe?.status !== "completed") refuse(`${subject.label}: the probe is ${state.probe?.status ?? "not started"}; --phase finish needs a completed probe`);
  const artifactRoot = path.resolve(artifactBase, subject.label);
  if (path.resolve(state.artifact_root) !== artifactRoot) refuse(`${P.state} was written for artifact root ${state.artifact_root}; this invocation uses ${artifactRoot}`);
  assertArtifactRootOutsideRepo(artifactRoot);
  const runId = state.scorer_run_id;
  const trialsPerItem = config.trials * config.judges_per_response;

  const byItem = new Map();
  for (const r of rows) {
    if (!byItem.has(r.item_id)) byItem.set(r.item_id, []);
    byItem.get(r.item_id).push(r);
  }
  for (const [id, list] of byItem) {
    list.sort((a, b) => a.scorer_trial_index - b.scorer_trial_index);
    if (list.length !== trialsPerItem || list.some((r, i) => r.scorer_trial_index !== i + 1)) refuse(`${subject.label} ${id}: ${list.length} rows, expected ${trialsPerItem} numbered 1..${trialsPerItem}`);
  }
  const bankById = new Map(bank.items.map((i) => [i.id, i]));

  const session = await openSession({ artifactRoot, transcriptFile: P.finishTranscript, serverOptions });
  const { client } = session;
  try {
    const call = async (name, args) => {
      try {
        return await client.callTool(name, args);
      } catch (e) {
        if (e instanceof McpError && !(e instanceof McpToolError)) throw new HarnessError(`${name}: ${e.message}`);
        throw e;
      }
    };
    const status0 = await call("run_status", { run_id: runId });
    if (status0.exposure_probe_status !== "completed") refuse(`${subject.label}: the server says the exposure probe is ${status0.exposure_probe_status}`);
    if (status0.total_planned_trials !== rows.length) refuse(`${subject.label}: the server plans ${status0.total_planned_trials} trials but ${rows.length} validated ratings exist`);
    const planned = new Set(status0.items.map((i) => i.item_id));
    if (planned.size !== byItem.size || [...byItem.keys()].some((id) => !planned.has(id))) refuse(`${subject.label}: the server's item set differs from the rated item set`);

    const alreadyRecorded = status0.total_recorded_trials;
    let recordedNow = 0;
    const mapping = [];
    for (let guard = 0; ; guard += 1) {
      if (guard > rows.length) refuse(`${subject.label}: next_item never reported complete after ${guard} calls`);
      const next = await call("next_item", { run_id: runId });
      if (next.status === "complete") break;
      const list = byItem.get(next.item_id);
      const row = list && list[next.trial_index - 1];
      if (!row) refuse(`${subject.label}: the server asked for ${next.item_id} trial ${next.trial_index}, which has no validated rating`);
      const bankItem = bankById.get(next.item_id);
      if (!bankItem || next.prompt !== bankItem.prompt) refuse(`${subject.label}: the prompt next_item served for ${next.item_id} is not the bank prompt`);
      if (sha256(next.prompt) !== row.outgoing_message_sha256) {
        refuse(`${subject.label}: the prompt served for ${next.item_id} does not hash to the message the subject was sent for ${row.response_id}`);
      }
      const rec = await call("record_item_rating", {
        run_id: runId,
        item_id: row.item_id,
        response_text: row.response_text,
        rating_1_5: row.rating_1_5,
        anchor_matched: row.anchor_matched,
        evidence_quote: row.evidence_quote,
        judge_label: row.judge,
      });
      if (rec.status !== "recorded" || rec.item_id !== row.item_id || rec.trial_index !== next.trial_index || rec.judge_label !== row.judge) {
        refuse(`${subject.label}: record_item_rating's confirmation ${JSON.stringify(rec)} does not match the intended row ${row.item_id}#${row.scorer_trial_index} (${row.judge})`);
      }
      recordedNow += 1;
      mapping.push({
        item_id: row.item_id,
        scorer_trial_index: row.scorer_trial_index,
        response_id: row.response_id,
        subject_trial: row.subject_trial,
        judge: row.judge,
        judge_provenance: row.judge_provenance,
        rating_1_5: row.rating_1_5,
        response_sha256: sha256(row.response_text),
        served_prompt_sha256: sha256(next.prompt),
      });
    }
    if (alreadyRecorded + recordedNow !== rows.length) refuse(`${subject.label}: ${alreadyRecorded} earlier + ${recordedNow} new trials != ${rows.length} validated ratings`);
    log(`[${subject.label}] recorded ${recordedNow} rating(s) (${alreadyRecorded} were already on the server)`);

    const st = await call("run_status", { run_id: runId });
    if (!st.ready_to_finish) refuse(`${subject.label}: run_status says not ready to finish: ${st.next_step}`);
    const scorecard = await call("finish_scored_run", { run_id: runId });

    const problems = await posthocScorecardChecks(scorecard);
    for (const frag of ["access tier: local-open-weight"]) if (!scorecard.provenance?.subject_label?.includes(frag)) problems.push(`provenance.subject_label does not state "${frag}"`);
    for (const frag of ["cross-family", "publicly exposed", "no human raters"]) if (!scorecard.provenance?.judge_label?.includes(frag)) problems.push(`provenance.judge_label does not state "${frag}"`);
    if (problems.length > 0) throw new HarnessError(`REFUSED: ${subject.label}: the scorecard failed independent checks:\n  ${problems.join("\n  ")}`);

    mkdirSync(P.scorecards, { recursive: true });
    const src = path.join(artifactRoot, runId);
    copyFileSync(path.join(src, "scorecard.json"), path.join(P.scorecards, "scorecard.json"));
    copyProbeArtifacts({ artifactRoot, runId, dest: P.scorecards });
    const trialFiles = existsSync(path.join(src, "trials")) ? readdirSync(path.join(src, "trials")).filter((f) => f.endsWith(".json")).sort() : [];
    writeJson(path.join(P.scorecards, "mcp-rating-map.json"), {
      kind: "mcp-rating-map",
      run_id: config.run_id,
      subject: subject.label,
      scorer_run_id: runId,
      note: "Response-level mapping the scorer's (item, trial_index) rows cannot carry. Descriptive; never an input to any score.",
      rows_recorded_this_session: recordedNow,
      rows_already_recorded: alreadyRecorded,
      rows: mapping,
      trial_files: trialFiles.map((f) => ({ file: f, sha256: sha256(readFileSync(path.join(src, "trials", f), "utf8")) })),
    });
    state.finish = { status: "completed", completed_at: now().toISOString(), composite: scorecard.composite, band: scorecard.band };
    writeJson(P.state, state);
    return { status: "completed", scorer_run_id: runId, scorecard, scorecard_file: path.join(P.scorecards, "scorecard.json") };
  } finally {
    await client.close();
  }
}

/**
 * AFTER the run: check the artifact the server produced with cb-probe's own scorecard validator. This is verification,
 * not driving; it is the only place this file loads cb-probe code.
 */
export async function posthocScorecardChecks(scorecard) {
  const problems = [];
  const { validateSelfRunScorecard } = await import("../../../tools/cb-probe/lib/validate-scorecard.mjs");
  const verdict = validateSelfRunScorecard(scorecard);
  if (!verdict.valid) problems.push(`validateSelfRunScorecard: ${verdict.errors.join("; ")}`);
  if (scorecard.official !== false || scorecard.comparability !== "none") problems.push("scorecard is not official:false / comparability:none");
  // No composite recomputation here: the harness hygiene test allows the canonical composite function to be called only in
  // assemble.mjs and analyze-pilot.mjs. analyze-pilot.mjs re-verifies every composite from the scorecard it is given.
  return problems;
}

// ---------------------------------------------------------------------------
// Reporting
// ---------------------------------------------------------------------------
/** The server's own numbers, verbatim, for the console and the run report. */
export function summariseProbeResult(result) {
  const id = result.identification ?? {};
  return {
    recall: {
      mean_overlap: result.mean_overlap,
      max_overlap: result.max_overlap,
      per_item: (result.items ?? []).map((i) => ({ item_id: i.item_id, overlap: i.overlap, exposure_flag: i.exposure_flag })),
      high_exposure_item_ids: result.high_exposure_item_ids,
    },
    identification: { available: id.available, correct: id.correct, questions_asked: id.questions_asked, unanswered: id.unanswered, probability_if_unexposed: id.probability_if_unexposed, flagged: id.flagged },
    contamination_indicated: result.contamination_indicated,
  };
}
