// research/model-runs/lib/subject-briefs.mjs
//
// Step 1: prompts-only briefs for subjects. One brief per subject x trial; each brief is answered in
// its own fresh-context call. A brief carries the verbatim item prompts under opaque per-brief codes,
// in an order shuffled by a per-trial seed that is recorded in the KEY (never in the brief).

import path from "node:path";
import { readFileSync, rmSync } from "node:fs";
import {
  SUBJECTS,
  RULE_DESCRIPTION,
  ACCESS_TIER,
  servedItems,
  exclusionRule,
  assertAdministrable,
  fence,
  idFactory,
  mulberry32,
  seedFromString,
  shuffle,
  refuse,
  writeJson,
  writeText,
  readJson,
  bankSha256,
} from "./common.mjs";
import { assertNoSubjectLeaks } from "./leak-check.mjs";
import { MIN_TRIALS } from "../../../tools/cb-probe/lib/scored-run.mjs";

export const SUBJECT_ANSWER_SCHEMA = Object.freeze({
  brief_id: "<copy the brief_id from the brief exactly>",
  answers: [{ code: "<a code from the brief>", response: "<your complete reply to that message>" }],
});

function instructionsFor(n) {
  return [
    `Below are ${n} separate messages. Each is a message a person might send to an AI assistant.`,
    "Reply to each one as that assistant, as well as you can, exactly as you would in a live conversation.",
    "Write the reply itself, not commentary about the reply.",
    "Treat every message independently, as if it were the only message in the conversation; do not refer to",
    "the other messages. Do not use tools, do not read any files and do not look anything up: answer only",
    "from the text of each message.",
    "",
    "Return one JSON object and nothing else, in the format shown under 'Answer format'. Answer every code",
    "exactly once. Do not add codes. Every response must be non-empty.",
  ].join("\n");
}

/** Render a brief to markdown. `promptFn` lets the caller blank the prompts to isolate the scaffold. */
export function renderBriefMarkdown(brief, promptFn = (p) => p) {
  const lines = [];
  lines.push(`# Brief ${brief.brief_id}`, "");
  lines.push(brief.instructions, "");
  lines.push("## Answer format", "");
  lines.push(fence(JSON.stringify(brief.answer_schema, null, 2)), "");
  lines.push("The text inside each fenced block below is the complete message, verbatim.", "");
  for (const item of brief.items) {
    lines.push(`## Message ${item.code}`, "");
    lines.push(fence(promptFn(item.prompt)), "");
  }
  return lines.join("\n");
}

export function subjectBriefFileBase(subject, trial) {
  return `${subject}-trial-${trial}`;
}

/**
 * Pure builder: returns the briefs, their rendered text, and the key. Performs the leak check on the
 * exact strings that will be written; throws (writing nothing) on any leak.
 */
export function buildSubjectBriefs({ bank, runId, subjects = SUBJECTS, trials = MIN_TRIALS, seed }) {
  if (!Number.isInteger(trials) || trials < MIN_TRIALS) {
    refuse(`trials must be an integer >= ${MIN_TRIALS} (cb-probe MIN_TRIALS). Got ${JSON.stringify(trials)}.`);
  }
  if (!Number.isInteger(seed)) refuse("seed must be an integer");
  if (new Set(subjects).size !== subjects.length) refuse("subject labels must be unique");

  const items = servedItems(bank);
  assertAdministrable(items);
  if (items.length === 0) refuse("the serving rule yields no items");

  const briefIdFor = idFactory(mulberry32(seedFromString(`brief-id:${seed}:${runId}`)), "b-", 8);
  const briefs = [];
  const keyBriefs = [];

  for (const subject of subjects) {
    for (let trial = 1; trial <= trials; trial += 1) {
      const trialSeed = seedFromString(`order:${seed}:${runId}:${subject}:${trial}`);
      const rng = mulberry32(trialSeed);
      const order = shuffle(items, rng);
      const nextCode = idFactory(rng, "q-", 8);
      const entries = order.map((item) => ({ code: nextCode(), item_id: item.id, prompt: item.prompt }));

      const brief = {
        brief_id: briefIdFor(),
        instructions: instructionsFor(entries.length),
        answer_schema: SUBJECT_ANSWER_SCHEMA,
        items: entries.map(({ code, prompt }) => ({ code, prompt })),
      };
      const promptTexts = brief.items.map((i) => i.prompt);
      const markdown = renderBriefMarkdown(brief);
      const scaffold = renderBriefMarkdown(brief, () => "");
      const jsonText = JSON.stringify(brief, null, 2);
      const scaffoldJson = JSON.stringify({ ...brief, items: brief.items.map(({ code }) => ({ code })) }, null, 2);

      for (const [what, text, scaffoldText] of [
        [`${subject} trial ${trial} (markdown)`, markdown, scaffold],
        [`${subject} trial ${trial} (json)`, jsonText, scaffoldJson],
      ]) {
        assertNoSubjectLeaks({ text, scaffoldText, promptTexts, bank }, `subject brief for ${what}`);
      }

      const base = subjectBriefFileBase(subject, trial);
      briefs.push({ subject, trial, base, brief, markdown, json: jsonText });
      keyBriefs.push({
        brief_id: brief.brief_id,
        subject,
        trial,
        order_seed: trialSeed,
        files: [`${base}.json`, `${base}.md`],
        codes: Object.fromEntries(entries.map((e) => [e.code, e.item_id])),
        order: entries.map((e) => e.item_id),
      });
    }
  }

  const key = {
    kind: "subject-brief-key",
    run_id: runId,
    master_seed: seed,
    bank_version: bank.meta.bankVersion,
    served_item_ids: items.map((i) => i.id),
    excluded_items: exclusionRule(bank),
    serving_rule: RULE_DESCRIPTION,
    subjects: [...subjects],
    trials_per_item: trials,
    access_tier: ACCESS_TIER,
    snapshot_id: "unverifiable (Claude Code subagent; the harness cannot observe the serving snapshot)",
    briefs: keyBriefs,
  };
  return { briefs, key };
}

/**
 * Write briefs and key, then RE-READ the written briefs from disk and leak-check them again: the check
 * that matters is on the bytes a subject will actually receive.
 */
export function writeSubjectBriefs({ result, bank, bankPath, outDir, keyDir, force = false }) {
  const keyFile = path.join(keyDir, "subject-brief-key.json");
  const existing = (() => {
    try {
      readJson(keyFile);
      return true;
    } catch {
      return false;
    }
  })();
  if (existing && !force) {
    refuse(
      `${keyFile} already exists. Rebuilding would change every opaque code and orphan any answers already ` +
        "collected. Pass --force to overwrite deliberately."
    );
  }

  const written = [];
  for (const b of result.briefs) {
    const jsonPath = path.join(outDir, `${b.base}.json`);
    const mdPath = path.join(outDir, `${b.base}.md`);
    writeText(jsonPath, `${b.json}\n`);
    writeText(mdPath, `${b.markdown}\n`);
    written.push(jsonPath, mdPath);
  }
  writeJson(path.join(outDir, "answer-schema.json"), SUBJECT_ANSWER_SCHEMA);

  // Read back and re-check the actual files; on any leak, delete what was written (fail closed).
  try {
    for (const b of result.briefs) {
      for (const ext of ["json", "md"]) {
        const file = path.join(outDir, `${b.base}.${ext}`);
        const text = readFileSync(file, "utf8");
        const scaffoldText = ext === "md" ? renderBriefMarkdown(b.brief, () => "") : undefined;
        assertNoSubjectLeaks({ text, scaffoldText, promptTexts: b.brief.items.map((i) => i.prompt), bank }, `written file ${file}`);
      }
    }
  } catch (e) {
    for (const f of written) rmSync(f, { force: true });
    rmSync(path.join(outDir, "answer-schema.json"), { force: true });
    throw e;
  }

  const key = { ...result.key, bank_sha256: bankSha256(bankPath), created_at: new Date().toISOString() };
  writeJson(keyFile, key);
  return { written, keyFile, key };
}
