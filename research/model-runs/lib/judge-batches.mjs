// research/model-runs/lib/judge-batches.mjs
//
// Step 3: anonymise every response, route each to exactly JUDGES_PER_RESPONSE judges drawn from the
// OTHER models (never its own subject), balance the load, and write judge batches that quote the item
// prompt, the full anchor ladder and the response verbatim -- and nothing that identifies the subject.

import path from "node:path";
import {
  JUDGES_PER_RESPONSE,
  SUBJECTS,
  fence,
  idFactory,
  mulberry32,
  seedFromString,
  shuffle,
  refuse,
  sha256,
  writeJson,
  writeText,
  assertKeyOutsideOut,
} from "./common.mjs";
import { findIdentityLeaks } from "./leak-check.mjs";
import { routeToJudgeSet } from "./judge-routing.mjs";

export const JUDGE_ANSWER_SCHEMA = Object.freeze({
  batch_id: "<copy the batch_id from the batch exactly>",
  ratings: [
    {
      response_id: "<a response_id from the batch>",
      rating_1_5: 3,
      anchor_matched: '<the label of the level you chose, exactly as printed, e.g. "3.0 Functional">',
      evidence_quote: "<at least three consecutive words copied exactly from that response>",
    },
  ],
});

/**
 * Route every response to JUDGES_PER_RESPONSE distinct judges from the other subjects.
 *
 * With K subjects each response has K-1 eligible judges and drops exactly (K-1-2) of them. Balance:
 * within one subject the dropped judge rotates, so each eligible judge is dropped at most
 * ceil(n/(K-1)) times for that subject; ties go to the judge with the highest running load, which
 * keeps the overall per-judge load within a couple of responses of equal.
 *
 * @param {{subject: string}[]} responses
 * @param {string[]} subjects
 * @returns {string[][]} judges per response (same order as `responses`)
 */
export function routeResponses(responses, subjects, rng) {
  if (subjects.length < JUDGES_PER_RESPONSE + 1) {
    refuse(`need at least ${JUDGES_PER_RESPONSE + 1} subjects to give every response ${JUDGES_PER_RESPONSE} other-model judges`);
  }
  const load = Object.fromEntries(subjects.map((s) => [s, 0]));
  const droppedBySubject = Object.fromEntries(subjects.map((s) => [s, Object.fromEntries(subjects.map((j) => [j, 0]))]));
  const routes = new Array(responses.length);

  const bySubject = new Map(subjects.map((s) => [s, []]));
  responses.forEach((r, i) => {
    if (!bySubject.has(r.subject)) refuse(`response from unknown subject "${r.subject}"`);
    bySubject.get(r.subject).push(i);
  });

  const dropCount = subjects.length - 1 - JUDGES_PER_RESPONSE;
  for (const subject of subjects) {
    const eligible = subjects.filter((s) => s !== subject);
    for (const index of shuffle(bySubject.get(subject), rng)) {
      let pool = eligible.slice();
      const dropped = [];
      for (let d = 0; d < dropCount; d += 1) {
        const minDrops = Math.min(...pool.map((j) => droppedBySubject[subject][j]));
        const candidates = pool.filter((j) => droppedBySubject[subject][j] === minDrops);
        const maxLoad = Math.max(...candidates.map((j) => load[j]));
        const top = shuffle(candidates.filter((j) => load[j] === maxLoad), rng);
        const drop = top[0];
        dropped.push(drop);
        pool = pool.filter((j) => j !== drop);
        droppedBySubject[subject][drop] += 1;
      }
      for (const j of pool) load[j] += 1;
      routes[index] = pool.slice().sort();
    }
  }
  return routes;
}

export function judgeInstructions() {
  return [
    "Each entry below gives a message that was sent to an AI assistant, a five-level scale for judging replies",
    "to that message, and one reply. For each entry, decide which of the five levels the reply best matches.",
    "",
    "For every entry give: rating_1_5 (the level number); anchor_matched (that level's label exactly as it is",
    "printed, for example \"3.0 Functional\"); and evidence_quote (at least three consecutive words copied",
    "exactly, character for character, from the reply itself, that support your level).",
    "",
    "Judge each reply on its own. You are not told who or what wrote any reply, and you should not guess.",
    "Length is not a criterion: a short reply that does what a level describes earns that level, and a long",
    "reply earns nothing extra for being long. Judge only against the level descriptions.",
    "Return one JSON object and nothing else, in the format under 'Answer format'. Give exactly one rating",
    "for every response_id in this batch. It must be valid JSON: inside string values write line breaks as \\n",
    "and never include a raw newline or tab character.",
  ].join("\n");
}

function evaluatorNotes(item) {
  const notes = {};
  for (const f of ["expectedBehaviors", "prohibitedFailures", "criticalHarmRules", "culturalAccessibilityNotes"]) {
    const v = item[f];
    if (v !== null && v !== undefined && !(Array.isArray(v) && v.length === 0)) notes[f] = v;
  }
  return Object.keys(notes).length > 0 ? notes : null;
}

/** One judge-batch entry: verbatim prompt, full ladder, the response; no identity field. */
export function buildEntry(item, record) {
  const e = {
    response_id: record.response_id,
    item_prompt: item.prompt,
    construct: item.construct,
    anchors: (item.anchors ?? []).map((a) => ({ level: a.level, label: a.label, description: a.description })),
    response: record.response,
  };
  const notes = evaluatorNotes(item);
  if (notes) e.evaluator_notes = notes;
  return e;
}

export function renderBatchMarkdown(batch, textFn = (t) => t) {
  const out = [`# Batch ${batch.batch_id}`, "", batch.instructions, "", "## Answer format", ""];
  out.push(fence(JSON.stringify(batch.answer_schema, null, 2)), "");
  out.push("The text inside each fenced block is verbatim.", "");
  for (const e of batch.entries) {
    out.push(`## Response ${e.response_id}`, "");
    out.push("Message sent to the assistant:", "", fence(textFn(e.item_prompt)), "");
    out.push(`Scale (${e.construct}):`, "");
    for (const a of e.anchors) out.push(`- Level ${a.level}, label "${a.label}": ${textFn(a.description)}`);
    out.push("");
    if (e.evaluator_notes) out.push("Further evaluator notes:", "", fence(textFn(JSON.stringify(e.evaluator_notes, null, 2))), "");
    out.push("Reply to judge:", "", fence(textFn(e.response)), "");
  }
  return out.join("\n");
}

/**
 * Blinding self-check on the harness-written text (everything except verbatim prompts/replies).
 * Refuses on any identity term in the scaffold or any forbidden entry field.
 */
export function assertBatchesBlind({ batches, subjects, runId, records, armLabels = [], hiddenSystemMessages = [] }) {
  // Arms: a judge must learn neither which arm a reply came from nor what system message the subject was given.
  // Arm labels of 1-2 characters ("A", "B") would match ordinary words, so they are covered structurally instead
  // (no `arm` / `system_message` / `build` field on any entry) and by the label-bearing subject names above.
  const identityTerms = [
    ...subjects,
    ...subjects.flatMap((s) => s.split("-")).filter((w) => w.length > 2 && w !== "claude"),
    ...armLabels.filter((a) => a.length > 2),
    runId,
    ...records.flatMap((r) => [r.brief_id, r.code]),
  ];
  for (const { batch, base } of batches) {
    const blanked = {
      ...batch,
      entries: batch.entries.map((e) => ({ ...e, item_prompt: "", response: "", anchors: [], construct: "" })),
    };
    const scaffold = `${renderBatchMarkdown(blanked, () => "")}
${JSON.stringify(blanked)}`;
    const leaks = findIdentityLeaks({ scaffoldText: scaffold, identityTerms });
    if (leaks.length > 0) refuse(`judge batch ${base} scaffold would reveal identity: ${leaks.join(", ")}`);
    const lowered = scaffold.toLowerCase();
    for (const m of hiddenSystemMessages) {
      if (m.length > 0 && lowered.includes(m.toLowerCase())) refuse(`judge batch ${base} scaffold contains a subject system message`);
    }
    const entryKeys = new Set(batch.entries.flatMap((e) => Object.keys(e)));
    for (const forbidden of ["subject", "trial", "code", "brief_id", "item_id", "judges", "arm", "build", "system_message", "system_message_sha256"]) {
      if (entryKeys.has(forbidden)) refuse(`judge batch ${base} carries forbidden field "${forbidden}"`);
    }
  }
}

/**
 * @param {object} p
 * @param {object} p.bank
 * @param {{subject: string, trial: number, brief_id: string, code: string, item_id: string, response: string}[]} p.responses
 * @param {string[]} p.subjects
 * @param {number} p.seed
 * @param {number} p.batchSize
 * @param {string} p.runId
 */
export function buildJudgeBatches({ bank, responses, subjects = SUBJECTS, seed, batchSize, runId, judging = null }) {
  if (!Number.isInteger(batchSize) || batchSize < 1) refuse("--batch-size must be a positive integer");
  if (!Number.isInteger(seed)) refuse("seed must be an integer");
  const rng = mulberry32(seedFromString(`judge:${seed}:${runId}`));
  const nextResponseId = idFactory(rng, "r-", 10);
  const nextBatchId = idFactory(rng, "jb-", 8);

  const items = new Map(bank.items.map((i) => [i.id, i]));
  const records = responses.map((r) => ({
    ...r,
    response_id: nextResponseId(),
    response_sha256: sha256(r.response),
  }));
  for (const r of records) if (!items.has(r.item_id)) refuse(`response references unknown item ${r.item_id}`);

  // `judging` (explicit judge set + bridge sample, pilot-2026-10-02) changes who judges; with it absent every line
  // below the branch is the first pilot's code path, unchanged.
  const judgeSet = judging ? judging.judges : subjects;
  if (judging) {
    if (batchSize > judging.maxBatchEntries) refuse(`--batch-size ${batchSize} exceeds the pre-registered maximum of ${judging.maxBatchEntries} entries per batch`);
    for (const s of subjects) if (judging.judges.includes(s)) refuse(`${s} is both a subject and a judge; the sets must be disjoint`);
  }
  const routes = judging
    ? routeToJudgeSet(records, { judges: judging.judges, familyOf: judging.familyOf, perResponse: JUDGES_PER_RESPONSE }, rng)
    : routeResponses(records, subjects, rng);
  records.forEach((r, i) => {
    r.judges = routes[i];
  });

  // Bridge replies: same record shape and the same opaque-id scheme as every other reply; judges fixed by who rated them originally.
  const bridgeRecords = [];
  if (judging) {
    for (const b of judging.bridge) {
      if (!items.has(b.item_id)) refuse(`bridge reply references unknown item ${b.item_id}`);
      const judges = Object.keys(b.original_ratings).sort();
      if (judges.length === 0 || judges.some((j) => !judging.judges.includes(j))) refuse(`bridge reply ${b.source_response_id} is routed to a judge outside the judge set`);
      if (judges.includes(b.source_subject)) refuse(`bridge reply ${b.source_response_id} would go to its own source subject`);
      bridgeRecords.push({ ...b, response_id: nextResponseId(), judges, bridge: true });
    }
  }

  const byJudge = new Map(judgeSet.map((s) => [s, []]));
  records.forEach((r) => r.judges.forEach((j) => byJudge.get(j).push(r)));
  bridgeRecords.forEach((r) => r.judges.forEach((j) => byJudge.get(j).push(r)));

  const batches = [];
  const keyBatches = [];
  for (const judge of judgeSet) {
    const queue = shuffle(byJudge.get(judge), rng);
    const nBatches = Math.max(1, Math.ceil(queue.length / batchSize));
    const base = Math.floor(queue.length / nBatches);
    const extra = queue.length % nBatches;
    let cursor = 0;
    for (let b = 0; b < nBatches; b += 1) {
      const take = base + (b < extra ? 1 : 0);
      const slice = queue.slice(cursor, cursor + take);
      cursor += take;
      const entries = slice.map((r) => buildEntry(items.get(r.item_id), r));
      const batch = {
        batch_id: nextBatchId(),
        instructions: judgeInstructions(),
        answer_schema: JUDGE_ANSWER_SCHEMA,
        entries,
      };
      const base_ = `${judge}__batch-${String(b + 1).padStart(2, "0")}`;
      batches.push({ judge, base: base_, batch, markdown: renderBatchMarkdown(batch) });
      const keyBatch = {
        batch_id: batch.batch_id,
        judge,
        files: [`${base_}.json`, `${base_}.md`],
        response_ids: entries.map((e) => e.response_id),
      };
      if (judging) {
        const isBridge = new Set(slice.filter((r) => r.bridge).map((r) => r.response_id));
        keyBatch.response_ids = keyBatch.response_ids.filter((id) => !isBridge.has(id));
        keyBatch.bridge_response_ids = entries.map((e) => e.response_id).filter((id) => isBridge.has(id));
      }
      keyBatches.push(keyBatch);
    }
  }

  assertBatchesBlind({
    batches,
    subjects: judging ? [...subjects, ...new Set(bridgeRecords.map((b) => b.source_subject))] : subjects,
    runId,
    records: [...records, ...bridgeRecords],
    armLabels: judging?.armLabels ?? [],
    hiddenSystemMessages: judging?.hiddenSystemMessages ?? [],
  });

  const load = Object.fromEntries(judgeSet.map((s) => [s, byJudge.get(s).length]));
  const key = {
    kind: "judge-blinding-key",
    run_id: runId,
    seed,
    batch_size: batchSize,
    judges_per_response: JUDGES_PER_RESPONSE,
    subjects: [...subjects],
    ...(judging
      ? {
          judges: [...judging.judges],
          family_of: judging.familyOf,
          validity_required: true,
          bridge: {
            note: "KEY ONLY. Bridge replies are first-pilot replies re-rated here for drift (section 6). They are not in `responses`, so they cannot reach a composite.",
            source_run: judging.bridge[0]?.source_run ?? null,
            seed: judging.bridgeSeed ?? null,
            entries: bridgeRecords.map((b) => ({
              response_id: b.response_id,
              source_response_id: b.source_response_id,
              source_subject: b.source_subject,
              trial: b.trial,
              item_id: b.item_id,
              brief_id: b.brief_id,
              code: b.code,
              response_sha256: b.response_sha256,
              response: b.response,
              judges: b.judges,
              original_ratings: b.original_ratings,
            })),
          },
          self_identifying_response_ids: selfIdentifying(records, judging.identityTerms ?? {}),
          judge_load_main: Object.fromEntries(judgeSet.map((s) => [s, byJudge.get(s).filter((r) => !r.bridge).length])),
          judge_load_bridge: Object.fromEntries(judgeSet.map((s) => [s, byJudge.get(s).filter((r) => r.bridge).length])),
        }
      : {}),
    judge_load: load,
    responses: records.map((r) => ({
      response_id: r.response_id,
      subject: r.subject,
      trial: r.trial,
      item_id: r.item_id,
      brief_id: r.brief_id,
      code: r.code,
      response_sha256: r.response_sha256,
      judges: r.judges,
    })),
    batches: keyBatches,
  };
  return { batches, key, records, bridgeRecords };
}

/**
 * REPORTING ONLY, never blocking: replies that name their own model or developer (for example "I am Qwen")
 * unblind themselves to a judge. The harness cannot edit a reply, so it lists them in the key.
 */
export function selfIdentifying(records, identityTerms) {
  const out = [];
  for (const r of records) {
    const terms = identityTerms[r.subject] ?? [];
    const text = String(r.response).toLowerCase();
    if (terms.some((t) => t.length > 0 && text.includes(t.toLowerCase()))) out.push(r.response_id);
  }
  return out;
}

export function writeJudgeBatches({ result, outDir, keyDir, ingestedFile }) {
  assertKeyOutsideOut(outDir, keyDir);
  for (const { base, batch, markdown } of result.batches) {
    writeJson(path.join(outDir, `${base}.json`), batch);
    writeText(path.join(outDir, `${base}.md`), `${markdown}\n`);
  }
  writeJson(path.join(outDir, "answer-schema.json"), JUDGE_ANSWER_SCHEMA);
  const keyFile = path.join(keyDir, "judge-key.json");
  writeJson(keyFile, { ...result.key, source_ingested: ingestedFile ?? null, created_at: new Date().toISOString() });
  return keyFile;
}
