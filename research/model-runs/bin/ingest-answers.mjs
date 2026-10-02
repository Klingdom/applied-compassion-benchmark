#!/usr/bin/env node
/**
 * ingest-answers.mjs -- step 2. Validate every subject answer file; refuse on any problem.
 *
 * Every code answered exactly once, no extra codes, non-empty responses, one file per brief. A single
 * problem anywhere refuses the whole ingest and writes nothing: there are no silent partials.
 *
 *   node research/model-runs/bin/ingest-answers.mjs --run-id <id> --answers <dir> [--keys <dir>] [--run-root <dir>]
 */
import path from "node:path";
import { existsSync } from "node:fs";
import { parse, runRoot, main } from "../lib/cli.mjs";
import { readJson, refuse, HarnessError } from "../lib/common.mjs";
import { ingestAnswersDir, writeIngested } from "../lib/ingest.mjs";

main(() => {
  const v = parse({
    "run-id": { type: "string" },
    answers: { type: "string" },
    keys: { type: "string" },
    "run-root": { type: "string" },
  });
  if (!v["run-id"] || !v.answers) {
    console.error("usage: ingest-answers.mjs --run-id <id> --answers <dir> [--keys <dir>]");
    return 2;
  }
  const root = runRoot(v);
  const keysDir = path.resolve(v.keys ?? path.join(root, "keys"));
  const answersDir = path.resolve(v.answers);
  if (!existsSync(answersDir)) refuse(`${answersDir} does not exist`);

  const subjectKey = readJson(path.join(keysDir, "subject-brief-key.json"));
  if (subjectKey.run_id !== v["run-id"]) refuse(`key is for run ${subjectKey.run_id}, not ${v["run-id"]}`);

  const { errors, responses } = ingestAnswersDir({ subjectKey, answersDir });
  if (errors.length > 0) {
    throw new HarnessError(`REFUSED: ${errors.length} problem(s); nothing was ingested:\n  ${errors.join("\n  ")}`);
  }
  const outFile = path.join(keysDir, "ingested", "answers.json");
  const n = writeIngested({ subjectKey, responses, outFile });
  console.log(`Ingested ${n} responses from ${subjectKey.briefs.length} briefs -> ${outFile}`);
  return 0;
});
