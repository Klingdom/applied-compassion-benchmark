// research/model-runs/lib/probe.mjs
//
// cb-probe refuses to finish a run until its exposure probe has completed (finish_scored_run). The
// probe needs the SUBJECT's own recall attempts and forced-choice answers, so for this pilot it is a
// separate fresh-context call per subject, made AFTER the trial briefs (its challenge names item ids
// and scenario titles, which the trial briefs must never contain). The harness fabricates nothing here:
// no probe answer file for a subject means that subject's run is left unfinished.

import { fence, refuse, parseJsonLenient, findControlByte } from "./common.mjs";
import { findSubjectLeaks } from "./leak-check.mjs";

export const PROBE_ANSWER_SCHEMA = Object.freeze({
  probe_id: "<copy the probe_id from the probe brief exactly>",
  recall_attempts: [{ item_id: "<an item id listed under Part 1>", recalled_text: "<your best reconstruction, or an honest statement that you do not recall it>" }],
  identification_answers: [{ item_id: "<an item id from Part 2>", option_id: "<A, B, C or D>" }],
});

function scaffoldLines(probeId) {
  return {
    intro: [
      `# Recall check ${probeId}`,
      "",
      "This is a short memory check, in two parts. Answer from memory only: do not use tools, do not read",
      "any files and do not look anything up -- looking things up defeats the purpose.",
      "",
      "Part 1. For each id listed, write as closely as you can recall it the exact wording of the message with",
      "that id. If you have no memory of it, say so plainly in a full sentence rather than inventing text",
      "that merely sounds plausible; a blank or one-word reply is not accepted.",
      "",
      "Part 2. For each question, choose the option you believe is correct. If you do not know, guess;",
      "guessing is expected and is not a failure.",
    ],
  };
}

export function buildProbeBrief({ challenge, probeId, bank }) {
  const recallIds = challenge.probe_item_ids;
  const ident = challenge.identification ?? { available: false, questions: [] };
  const brief = {
    probe_id: probeId,
    part_1_recall: { item_ids: recallIds },
    part_2_identification: ident.available
      ? { questions: ident.questions.map((q) => ({ item_id: q.item_id, question: q.question, options: q.options })) }
      : { questions: [], note: ident.reason ?? "no identification challenge was issued" },
    answer_schema: PROBE_ANSWER_SCHEMA,
  };

  const md = [...scaffoldLines(probeId).intro, "", "## Part 1: ids to recall", ""];
  for (const id of recallIds) md.push(`- ${id}`);
  md.push("", "## Part 2: questions", "");
  for (const q of brief.part_2_identification.questions) {
    md.push(`${q.question}`, "");
    for (const o of q.options) md.push(`- ${o.option_id}: ${o.description}`);
    md.push("");
  }
  if (brief.part_2_identification.note) md.push(brief.part_2_identification.note, "");
  md.push("## Answer format", "", fence(JSON.stringify(PROBE_ANSWER_SCHEMA, null, 2)), "");
  const markdown = md.join("\n");

  // Scoring material must still not be in here: anchors and construct names stay out. Item ids and
  // scenario titles are the challenge itself, so ids/constructs are not checked for this brief.
  const leaks = findSubjectLeaks({
    text: markdown,
    scaffoldText: scaffoldLines(probeId).intro.join("\n"),
    bank,
    checkIds: false,
    checkConstructs: false,
  });
  if (leaks.length > 0) refuse(`probe brief for ${probeId} leaks rubric material:\n  ${leaks.join("\n  ")}`);
  return { brief, markdown };
}

export function validateProbeAnswers(text, challenge, probeId, label) {
  const errors = [];
  let parsed;
  try {
    parsed = parseJsonLenient(text, label);
  } catch (e) {
    return { errors: [e.message], recall_attempts: null, identification_answers: null };
  }
  const fail = (m) => errors.push(`${label}: ${m}`);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    fail("must be a JSON object");
    return { errors };
  }
  for (const k of Object.keys(parsed)) {
    if (!["probe_id", "recall_attempts", "identification_answers"].includes(k)) fail(`unexpected top-level key "${k}"`);
  }
  if (parsed.probe_id !== probeId) fail(`probe_id ${JSON.stringify(parsed.probe_id)} does not match this subject's probe (${probeId})`);

  const recall = Array.isArray(parsed.recall_attempts) ? parsed.recall_attempts : null;
  if (!recall) fail("`recall_attempts` must be an array");
  else {
    const seen = new Set();
    for (const a of recall) {
      if (!a || typeof a.item_id !== "string" || typeof a.recalled_text !== "string") {
        fail("each recall attempt needs string item_id and recalled_text");
        continue;
      }
      if (!challenge.probe_item_ids.includes(a.item_id)) fail(`recall attempt for ${a.item_id}, which was not asked`);
      if (seen.has(a.item_id)) fail(`${a.item_id} recalled more than once`);
      seen.add(a.item_id);
      if (findControlByte(a.recalled_text) !== -1) fail(`${a.item_id}: recalled_text contains a raw control byte`);
    }
    for (const id of challenge.probe_item_ids) if (!seen.has(id)) fail(`no recall attempt for ${id}`);
  }

  const ident = Array.isArray(parsed.identification_answers) ? parsed.identification_answers : null;
  const questions = challenge.identification?.available ? challenge.identification.questions : [];
  if (questions.length > 0) {
    if (!ident) fail("`identification_answers` must be an array");
    else {
      const seen = new Set();
      for (const a of ident) {
        const q = questions.find((x) => x.item_id === a?.item_id);
        if (!q) {
          fail(`identification answer for ${a?.item_id}, which was not asked`);
          continue;
        }
        if (seen.has(a.item_id)) fail(`${a.item_id} answered more than once`);
        seen.add(a.item_id);
        if (!q.options.some((o) => o.option_id === a.option_id)) fail(`${a.item_id}: option_id ${JSON.stringify(a.option_id)} is not an offered option`);
      }
      for (const q of questions) if (!seen.has(q.item_id)) fail(`no identification answer for ${q.item_id}`);
    }
  }
  return {
    errors,
    recall_attempts: recall,
    identification_answers: ident ?? [],
  };
}
