// research/model-runs/lib/local-subjects.mjs
//
// Subject-answering stage for pilot-2026-10-02 (PREREGISTRATION.md sections 2, 3, 9).
//
// One fresh conversation per (subject, item, trial): a single user message holding the item prompt text
// ONLY. Seed = first 31 bits of sha256(`${run_id}|${subject}|${item}|${trial}`). Modelfile defaults
// otherwise. TOOLING ONLY: it asks a model and stores what came back; no scoring happens here.
//
// Items: servedItems(bank) from common.mjs, i.e. the same cb-probe predicates pilot-2026-10-01 used.
//
// Storage (all under <runRoot>/):
//   subject-answers/records/<subject>/<item_id>__t<trial>.json   one record per call chain (ok or failed)
//   subject-answers/<subject>-trial-<n>.answers.json              finalised, ingest-answers.mjs format
//   keys/subject-brief-key.json                                   code -> item key the ingest stage reads
//   operations/subject-run-summary.json                           counts, failure rates, section 9 verdicts
// Records name the subject and the item: they are operator files. Judges only ever see what
// build-judge-batches.mjs derives from keys/ingested/answers.json, which carries opaque codes.

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, writeFileSync } from "node:fs";
import path from "node:path";

import {
  HarnessError,
  refuse,
  readJson,
  assertNoControlBytes,
  findControlByte,
  idFactory,
  mulberry32,
  seedFromString,
  shuffle,
  servedItems,
  exclusionRule,
  assertAdministrable,
  bankSha256,
  sha256,
  RULE_DESCRIPTION,
  DEFAULT_BANK_PATH,
} from "./common.mjs";
import { findSubjectLeaks } from "./leak-check.mjs";
import { verifyPinnedDigest } from "./ollama.mjs";

const SEED_MODULUS = 2 ** 31;
const SAFE_NAME = /^[A-Za-z0-9._-]+$/;

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
export function loadRunConfig(file) {
  const c = readJson(file);
  const bad = (m) => refuse(`${file}: ${m}`);
  if (typeof c.run_id !== "string" || !SAFE_NAME.test(c.run_id)) bad("run_id missing or unsafe");
  if (!Number.isInteger(c.trials) || c.trials < 1) bad("trials must be a positive integer");
  if (!Number.isInteger(c.max_retries) || c.max_retries < 0) bad("max_retries must be a non-negative integer");
  if (!Number.isInteger(c.master_seed)) bad("master_seed must be an integer");
  if (!Array.isArray(c.subjects) || c.subjects.length === 0) bad("subjects must be a non-empty array");
  const labels = new Set();
  for (const s of c.subjects) {
    if (!s || typeof s.label !== "string" || !SAFE_NAME.test(s.label)) bad("every subject needs a safe label");
    if (typeof s.tag !== "string" || s.tag.length === 0) bad(`subject ${s.label}: tag missing`);
    if (typeof s.digest !== "string" || !/^[0-9a-f]{64}$/.test(s.digest)) bad(`subject ${s.label}: digest must be 64 lowercase hex chars`);
    if (labels.has(s.label)) bad(`duplicate subject label ${s.label}`);
    labels.add(s.label);
  }
  // RUN-SYS-1 (Iteration 95). pilot-2026-10-02 sent no system message, so each build's own default applied, and
  // Qwen2.5's names its developer while Llama3.2's does not: the subjects ran under different framings without
  // anyone choosing that. Every run must now state its system message explicitly (a string, "" allowed, sent
  // identically to every subject). The one exception is a recorded legacy flag for runs made before this rule.
  const hasSystem = Object.prototype.hasOwnProperty.call(c, "system_message");
  if (hasSystem && typeof c.system_message !== "string") bad("system_message must be a string (an empty string is allowed)");
  if (!hasSystem && c.system_message_legacy_absent !== true) {
    bad("system_message is required: state the exact system message sent to every subject (\"\" for an explicit empty one). " +
      "Without it each model build's own default system line applies silently and may differ between subjects (RUN-SYS-1).");
  }
  if (hasSystem && c.system_message_legacy_absent === true) bad("system_message and system_message_legacy_absent are mutually exclusive");
  return c;
}

/** The exact messages array sent for one item: an explicit system message (when configured) and the prompt. */
export function buildMessages(config, prompt) {
  const hasSystem = Object.prototype.hasOwnProperty.call(config, "system_message");
  return hasSystem
    ? [{ role: "system", content: config.system_message }, { role: "user", content: prompt }]
    : [{ role: "user", content: prompt }];
}

// ---------------------------------------------------------------------------
// Seeds
// ---------------------------------------------------------------------------
/** First 31 bits (big-endian) of sha256(`${runId}|${subject}|${itemId}|${trial}`), as an integer. */
export function deriveSeed(runId, subject, itemId, trial) {
  const digest = createHash("sha256").update(`${runId}|${subject}|${itemId}|${trial}`).digest();
  return digest.readUInt32BE(0) >>> 1;
}

/** Retry n uses seed + attempt index (section 3), kept inside 31 bits. Attempt 0 is the derived seed. */
export function attemptSeed(seed, attempt) {
  return (seed + attempt) % SEED_MODULUS;
}

// ---------------------------------------------------------------------------
// Plan
// ---------------------------------------------------------------------------
export function buildPlan({ bank, config }) {
  const items = servedItems(bank);
  assertAdministrable(items);
  if (items.length === 0) refuse("the serving rule yields no items");
  const nextBriefId = idFactory(mulberry32(seedFromString(`brief-id:${config.run_id}`)), "b-", 8);
  const subjects = config.subjects.map((s) => {
    const trials = [];
    for (let trial = 1; trial <= config.trials; trial += 1) {
      const orderSeed = seedFromString(`order:${config.run_id}:${s.label}:${trial}`);
      const rng = mulberry32(orderSeed);
      const order = shuffle(items, rng);
      const nextCode = idFactory(rng, "q-", 8);
      const entries = order.map((item) => ({ item_id: item.id, code: nextCode() }));
      trials.push({ trial, brief_id: nextBriefId(), order_seed: orderSeed, entries });
    }
    return { label: s.label, tag: s.tag, digest: s.digest, trials };
  });
  return { items, subjects, total_calls: subjects.reduce((n, s) => n + s.trials.length * items.length, 0) };
}

// ---------------------------------------------------------------------------
// Leak checks (the existing check, applied to the exact outgoing text and to saved replies)
// ---------------------------------------------------------------------------
/** The outgoing message must be exactly the prompt, and must pass the existing subject leak check. */
export function outgoingLeaks({ bank, item, message }) {
  const leaks = findSubjectLeaks({ text: message, promptTexts: [item.prompt], bank });
  if (message !== item.prompt) leaks.push("outgoing message is not exactly the verbatim item prompt");
  return leaks;
}

export function assertOutgoingClean({ bank, item, message }) {
  const leaks = outgoingLeaks({ bank, item, message });
  if (leaks.length > 0) {
    throw new HarnessError(
      `LEAK on an outgoing message for item ${item.id}: ${leaks.length} hit(s):\n  ${leaks.join("\n  ")}\n` +
        "Section 9: any leak-check hit on an outgoing message stops the run."
    );
  }
}

export function replyLeaks({ bank, item, reply }) {
  return findSubjectLeaks({ text: reply, promptTexts: [item.prompt], bank });
}

// ---------------------------------------------------------------------------
// Storage
// ---------------------------------------------------------------------------
export function writeJsonAtomic(file, data) {
  mkdirSync(path.dirname(file), { recursive: true });
  const text = `${JSON.stringify(data, null, 2)}\n`;
  assertNoControlBytes(text, file);
  const tmp = `${file}.tmp-${process.pid}`;
  writeFileSync(tmp, text, "utf8");
  renameSync(tmp, file);
}

export const recordsDir = (runRoot) => path.join(runRoot, "subject-answers", "records");
export function recordPath(runRoot, subject, itemId, trial) {
  if (!SAFE_NAME.test(subject) || !SAFE_NAME.test(itemId)) refuse(`unsafe name in record path: ${subject} / ${itemId}`);
  return path.join(recordsDir(runRoot), subject, `${itemId}__t${trial}.json`);
}

export function readRecord(file) {
  if (!existsSync(file)) return null;
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch {
    // A half-written record cannot exist (atomic rename), so an unreadable one is real damage: do not guess.
    return refuse(`${file} exists but is not valid JSON; refusing to resume over it. Inspect it by hand.`);
  }
}

// ---------------------------------------------------------------------------
// Running
// ---------------------------------------------------------------------------
const CIRCUIT_BREAKER = 5; // consecutive failed trials: the runtime is down, not the model unwilling
const REVERIFY_EVERY = 50; // calls between digest re-checks

/**
 * @param {object} p
 * @param {object} p.bank
 * @param {object} p.config            from loadRunConfig
 * @param {object} p.client            { version(), listModels(), chat() }
 * @param {string} p.runRoot
 * @param {number} [p.limit]           at most this many NEW calls per subject
 * @param {boolean} [p.retryFailed]    redo trials previously recorded as failed
 * @param {(m:string)=>void} [p.log]
 * @param {()=>Date} [p.now]
 */
export async function runSubjects({ bank, config, client, runRoot, limit, retryFailed = false, log = () => {}, now = () => new Date() }) {
  const plan = buildPlan({ bank, config });
  const byId = new Map(plan.items.map((i) => [i.id, i]));

  // Preflight 1: every outgoing message is leak-checked before any model is called.
  for (const item of plan.items) assertOutgoingClean({ bank, item, message: item.prompt });
  // Preflight 2: every pinned digest matches the live one before any model is called.
  const digests = {};
  for (const s of plan.subjects) digests[s.label] = await verifyPinnedDigest(client, s);
  const ollamaVersion = await client.version();

  const stats = {};
  let consecutiveFailures = 0;

  for (const subject of plan.subjects) {
    const st = (stats[subject.label] = { planned: subject.trials.length * plan.items.length, already_ok: 0, already_failed: 0, new_ok: 0, new_failed: 0 });
    let newCalls = 0;
    let sinceVerify = 0;
    let liveDigest = digests[subject.label];

    outer: for (const t of subject.trials) {
      for (let idx = 0; idx < t.entries.length; idx += 1) {
        const itemId = t.entries[idx].item_id;
        const item = byId.get(itemId);
        const file = recordPath(runRoot, subject.label, itemId, t.trial);
        const existing = readRecord(file);
        let previousFailed;
        if (existing) {
          if (existing.status === "ok") { st.already_ok += 1; continue; }
          if (!retryFailed) { st.already_failed += 1; continue; }
          previousFailed = [...(existing.previous_failed ?? []), { attempts: existing.attempts, recorded_at: existing.finished_at }];
        }
        if (limit !== undefined && newCalls >= limit) break outer;

        if (sinceVerify >= REVERIFY_EVERY) {
          liveDigest = await verifyPinnedDigest(client, subject);
          sinceVerify = 0;
        }

        const message = item.prompt;
        assertOutgoingClean({ bank, item, message }); // stops the whole run on any hit
        const seed = deriveSeed(config.run_id, subject.label, itemId, t.trial);
        const attempts = [];
        let reply = null;
        const startedAt = now().toISOString();

        for (let attempt = 0; attempt <= config.max_retries; attempt += 1) {
          const options = { seed: attemptSeed(seed, attempt) };
          const a = { attempt, options, started_at: now().toISOString() };
          const t0 = Date.now();
          try {
            const r = await client.chat({ model: subject.tag, messages: buildMessages(config, message), options });
            const content = r && r.message && typeof r.message.content === "string" ? r.message.content : "";
            Object.assign(a, {
              error: null,
              empty: content.trim().length === 0,
              reply_chars: content.length,
              done_reason: r.done_reason ?? null,
              eval_count: r.eval_count ?? null,
              prompt_eval_count: r.prompt_eval_count ?? null,
              total_duration_ns: r.total_duration ?? null,
              load_duration_ns: r.load_duration ?? null,
              prompt_eval_duration_ns: r.prompt_eval_duration ?? null,
              eval_duration_ns: r.eval_duration ?? null,
            });
            if (!a.empty) reply = { content, attempt };
          } catch (e) {
            Object.assign(a, { error: String(e && e.message ? e.message : e), empty: null });
          }
          a.wall_ms = Date.now() - t0;
          a.ended_at = now().toISOString();
          attempts.push(a);
          if (reply) break;
        }

        const ok = reply !== null;
        const record = {
          kind: "subject-answer-record",
          run_id: config.run_id,
          subject: subject.label,
          item_id: itemId,
          trial: t.trial,
          status: ok ? "ok" : "failed",
          order_index: idx,
          derived_seed: seed,
          model_tag: subject.tag,
          model_digest: liveDigest,
          ollama_version: ollamaVersion,
          outgoing_message_sha256: sha256(message),
          conversation: Object.prototype.hasOwnProperty.call(config, "system_message")
            ? "fresh; explicit system message (sha256 in system_message_sha256) then one user message holding the prompt text only"
            : "fresh; one user message; prompt text only; no system prompt",
          ...(Object.prototype.hasOwnProperty.call(config, "system_message") ? { system_message_sha256: sha256(config.system_message) } : {}),
          attempts,
          final_attempt: ok ? reply.attempt : null,
          realised_options: ok ? attempts[reply.attempt].options : null,
          eval_count: ok ? attempts[reply.attempt].eval_count : null,
          response: ok ? reply.content : null,
          response_sha256: ok ? sha256(reply.content) : null,
          reply_leak_hits: ok ? replyLeaks({ bank, item, reply: reply.content }) : [],
          started_at: startedAt,
          finished_at: now().toISOString(),
        };
        if (previousFailed) record.previous_failed = previousFailed;
        writeJsonAtomic(file, record);

        newCalls += 1;
        sinceVerify += 1;
        if (ok) { st.new_ok += 1; consecutiveFailures = 0; } else { st.new_failed += 1; consecutiveFailures += 1; }
        const last = attempts[attempts.length - 1];
        log(
          `[${subject.label} t${t.trial} ${idx + 1}/${t.entries.length}] ${itemId} ${ok ? "ok" : "FAILED"} ` +
            `attempts=${attempts.length} ${(last.wall_ms / 1000).toFixed(1)}s eval_count=${last.eval_count ?? "-"}`
        );
        if (consecutiveFailures >= CIRCUIT_BREAKER) {
          throw new HarnessError(
            `${CIRCUIT_BREAKER} consecutive failed trials (last error: ${last.error ?? "empty reply"}). Stopping: the runtime looks down. ` +
              "Records so far are kept; fix the cause and re-run to resume (use --retry-failed to redo the failed ones)."
          );
        }
      }
    }
  }
  return { plan, stats, ollama_version: ollamaVersion, digests };
}

// ---------------------------------------------------------------------------
// Finalise: key + ingest-format answer files + section 9 verdicts
// ---------------------------------------------------------------------------
export function finalizeRun({ bank, bankPath = DEFAULT_BANK_PATH, config, runRoot, now = () => new Date() }) {
  const plan = buildPlan({ bank, config });
  const keyBriefs = [];
  const perSubject = {};
  const answerFiles = [];
  const incompleteBriefs = [];

  for (const subject of plan.subjects) {
    const ps = (perSubject[subject.label] = {
      planned: subject.trials.length * plan.items.length,
      ok: 0,
      failed: 0,
      missing: 0,
      reply_leak_flagged: 0,
      replies_with_ingest_blocking_control_bytes: 0,
      total_attempts: 0,
      reply_chars_total: 0,
    });
    for (const t of subject.trials) {
      const answers = [];
      const codes = {};
      let complete = true;
      for (const e of t.entries) {
        codes[e.code] = e.item_id;
        const rec = readRecord(recordPath(runRoot, subject.label, e.item_id, t.trial));
        if (!rec) { ps.missing += 1; complete = false; continue; }
        ps.total_attempts += rec.attempts.length;
        if (rec.status !== "ok") { ps.failed += 1; complete = false; continue; }
        ps.ok += 1;
        ps.reply_chars_total += rec.response.length;
        if (rec.reply_leak_hits.length > 0) ps.reply_leak_flagged += 1;
        if (findControlByte(rec.response) !== -1) ps.replies_with_ingest_blocking_control_bytes += 1;
        answers.push({ code: e.code, response: rec.response });
      }
      const base = `${subject.label}-trial-${t.trial}`;
      keyBriefs.push({
        brief_id: t.brief_id,
        subject: subject.label,
        trial: t.trial,
        order_seed: t.order_seed,
        files: [`${base}.answers.json`],
        codes,
        order: t.entries.map((e) => e.item_id),
      });
      if (complete) {
        const file = path.join(runRoot, "subject-answers", `${base}.answers.json`);
        writeJsonAtomic(file, { brief_id: t.brief_id, answers });
        answerFiles.push(file);
      } else {
        incompleteBriefs.push(base);
      }
    }
  }

  const key = {
    kind: "subject-brief-key",
    run_id: config.run_id,
    note: "Written by research/model-runs/bin/run-local-subjects.mjs. Briefs are not files here: each subject x trial was served as one fresh single-message conversation per item; `codes` are opaque per-trial codes for ingest.",
    master_seed: config.master_seed,
    bank_version: bank.meta.bankVersion,
    bank_sha256: bankSha256(bankPath),
    served_item_ids: plan.items.map((i) => i.id),
    excluded_items: exclusionRule(bank),
    serving_rule: RULE_DESCRIPTION,
    subjects: config.subjects.map((s) => s.label),
    trials_per_item: config.trials,
    access_tier: "local-open-weight (Ollama, 4-bit quantised builds pinned by digest)",
    snapshot_id: Object.fromEntries(config.subjects.map((s) => [s.label, `${s.tag}@sha256:${s.digest}`])),
    briefs: keyBriefs,
  };
  writeJsonAtomic(path.join(runRoot, "keys", "subject-brief-key.json"), key);

  const verdicts = {};
  for (const [label, ps] of Object.entries(perSubject)) {
    const rate = ps.planned === 0 ? 0 : (ps.failed + ps.missing) / ps.planned;
    verdicts[label] = {
      failed_or_missing_rate: rate,
      section_9_throughput: rate > 0.1 ? "INSTRUMENT FAILURE: more than 10% failed trials; no composite for this subject" : "within the 10% limit",
    };
  }
  const summary = {
    kind: "subject-run-summary",
    run_id: config.run_id,
    generated_at: now().toISOString(),
    complete: incompleteBriefs.length === 0,
    incomplete_briefs: incompleteBriefs,
    per_subject: perSubject,
    verdicts,
    answer_files_written: answerFiles.length,
    note: "Failed trials are recorded, never imputed. A brief with a failed or missing trial gets no answers file, so ingest-answers.mjs refuses it loudly.",
  };
  writeJsonAtomic(path.join(runRoot, "operations", "subject-run-summary.json"), summary);
  return { key, summary, answerFiles };
}

/** Counts of existing records for a plan, for --dry-run. */
export function countExisting({ plan, runRoot }) {
  const out = {};
  for (const s of plan.subjects) {
    out[s.label] = { ok: 0, failed: 0 };
    for (const t of s.trials) {
      for (const e of t.entries) {
        const rec = readRecord(recordPath(runRoot, s.label, e.item_id, t.trial));
        if (rec) out[s.label][rec.status === "ok" ? "ok" : "failed"] += 1;
      }
    }
  }
  return out;
}

export function listRecordFiles(runRoot) {
  const dir = recordsDir(runRoot);
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { recursive: true }).filter((f) => String(f).endsWith(".json"));
}
