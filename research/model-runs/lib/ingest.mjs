// research/model-runs/lib/ingest.mjs
//
// Step 2: validate subject answer files against the subject-brief key. No silent partials: any
// problem in any file, or any brief with no answer file, refuses the whole ingest and writes nothing.

import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { parseJsonLenient, findControlByte, HarnessError, writeJson, readJson, sha256 } from "./common.mjs";

const ANSWER_FILE_KEYS = new Set(["brief_id", "answers"]);
const ANSWER_KEYS = new Set(["code", "response"]);

/**
 * @returns {{errors: string[], responses: object[]}} errors is empty iff the file is a complete, exact
 * answer set for the brief.
 */
export function validateSubjectAnswers(parsed, briefKey, label) {
  const errors = [];
  const responses = [];
  const fail = (m) => errors.push(`${label}: ${m}`);

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    fail("must be a JSON object");
    return { errors, responses };
  }
  for (const k of Object.keys(parsed)) if (!ANSWER_FILE_KEYS.has(k)) fail(`unexpected top-level key "${k}"`);
  if (parsed.brief_id !== briefKey.brief_id) {
    fail(`brief_id ${JSON.stringify(parsed.brief_id)} does not match the brief this file was matched to (${briefKey.brief_id})`);
  }
  if (!Array.isArray(parsed.answers)) {
    fail("`answers` must be an array");
    return { errors, responses };
  }

  const expected = new Set(Object.keys(briefKey.codes));
  const seen = new Map();
  parsed.answers.forEach((a, i) => {
    if (!a || typeof a !== "object" || Array.isArray(a)) {
      fail(`answers[${i}] must be an object`);
      return;
    }
    for (const k of Object.keys(a)) if (!ANSWER_KEYS.has(k)) fail(`answers[${i}] has unexpected key "${k}"`);
    if (typeof a.code !== "string") {
      fail(`answers[${i}].code must be a string`);
      return;
    }
    if (!expected.has(a.code)) {
      fail(`answers[${i}]: code "${a.code}" is not in this brief (extra code)`);
      return;
    }
    if (seen.has(a.code)) {
      fail(`code "${a.code}" is answered more than once (answers[${seen.get(a.code)}] and answers[${i}])`);
      return;
    }
    seen.set(a.code, i);
    if (typeof a.response !== "string" || a.response.trim().length === 0) {
      fail(`code "${a.code}": response must be a non-empty string`);
      return;
    }
    const cb = findControlByte(a.response);
    if (cb !== -1) {
      fail(`code "${a.code}": response contains a raw control byte at offset ${cb} (DC-21); re-collect it`);
      return;
    }
    responses.push({
      subject: briefKey.subject,
      trial: briefKey.trial,
      brief_id: briefKey.brief_id,
      code: a.code,
      item_id: briefKey.codes[a.code],
      response: a.response,
    });
  });

  const missing = [...expected].filter((c) => !seen.has(c));
  if (missing.length > 0) {
    fail(`${missing.length} code(s) not answered: ${missing.slice(0, 8).join(", ")}${missing.length > 8 ? ", ..." : ""}`);
  }
  return { errors, responses };
}

/** Read every *.json in `answersDir` (non-recursive) and match each to a brief by its brief_id. */
export function ingestAnswersDir({ subjectKey, answersDir }) {
  const errors = [];
  const byBrief = new Map(subjectKey.briefs.map((b) => [b.brief_id, b]));
  const files = readdirSync(answersDir).filter((f) => f.endsWith(".json")).sort();
  const claimed = new Map();
  const all = [];

  for (const f of files) {
    const label = f;
    let parsed;
    try {
      parsed = parseJsonLenient(readFileSync(path.join(answersDir, f), "utf8"), label);
    } catch (e) {
      if (e instanceof HarnessError) {
        errors.push(e.message);
        continue;
      }
      throw e;
    }
    const briefKey = byBrief.get(parsed && parsed.brief_id);
    if (!briefKey) {
      errors.push(`${label}: brief_id ${JSON.stringify(parsed && parsed.brief_id)} is not a brief of run ${subjectKey.run_id}`);
      continue;
    }
    if (claimed.has(briefKey.brief_id)) {
      errors.push(`${label}: brief ${briefKey.brief_id} (${briefKey.subject} trial ${briefKey.trial}) is already answered by ${claimed.get(briefKey.brief_id)}`);
      continue;
    }
    claimed.set(briefKey.brief_id, f);
    const r = validateSubjectAnswers(parsed, briefKey, `${label} (${briefKey.subject} trial ${briefKey.trial})`);
    errors.push(...r.errors);
    all.push(...r.responses);
  }

  for (const b of subjectKey.briefs) {
    if (!claimed.has(b.brief_id)) errors.push(`no answer file for ${b.subject} trial ${b.trial} (brief ${b.brief_id})`);
  }
  return { errors, responses: all };
}

export function writeIngested({ subjectKey, responses, outFile }) {
  const sorted = [...responses].sort(
    (a, b) => a.subject.localeCompare(b.subject) || a.trial - b.trial || a.item_id.localeCompare(b.item_id)
  );
  writeJson(outFile, {
    kind: "ingested-subject-answers",
    run_id: subjectKey.run_id,
    ingested_at: new Date().toISOString(),
    count: sorted.length,
    responses: sorted.map((r) => ({ ...r, response_sha256: sha256(r.response) })),
  });
  return sorted.length;
}

export function readIngested(file) {
  return readJson(file);
}
