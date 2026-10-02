#!/usr/bin/env node
/**
 * build-judge-batches.mjs -- step 3.
 *
 * Anonymises every ingested response (random response id) and routes each to exactly two judges drawn
 * from the OTHER models, never its own subject, load-balanced. A batch quotes the item prompt, the
 * full anchor ladder and the response verbatim; it carries no subject, trial, brief code or item id.
 * Entries are shuffled. The blinding key is written outside --out.
 *
 *   node research/model-runs/bin/build-judge-batches.mjs --run-id <id> --out <dir> [--batch-size 40]
 *        [--key-out <dir>] [--keys <dir>] [--seed <n>] [--bank <file>] [--run-root <dir>] [--force]
 */
import path from "node:path";
import { existsSync } from "node:fs";
import { parse, runRoot, main } from "../lib/cli.mjs";
import { readJson, loadBankFile, DEFAULT_BANK_PATH, assertKeyOutsideOut, randomSeed, refuse, SUBJECTS } from "../lib/common.mjs";
import { buildJudgeBatches, writeJudgeBatches } from "../lib/judge-batches.mjs";

main(() => {
  const v = parse({
    "run-id": { type: "string" },
    out: { type: "string" },
    "batch-size": { type: "string", default: "40" },
    "key-out": { type: "string" },
    keys: { type: "string" },
    seed: { type: "string" },
    bank: { type: "string" },
    "run-root": { type: "string" },
    force: { type: "boolean", default: false },
  });
  if (!v["run-id"] || !v.out) {
    console.error("usage: build-judge-batches.mjs --run-id <id> --out <dir> [--batch-size 40] [--key-out <dir>] [--keys <dir>] [--seed <n>]");
    return 2;
  }
  const root = runRoot(v);
  const keysDir = path.resolve(v.keys ?? path.join(root, "keys"));
  const outDir = path.resolve(v.out);
  const keyOut = path.resolve(v["key-out"] ?? keysDir);
  assertKeyOutsideOut(outDir, keyOut);
  if (existsSync(path.join(keyOut, "judge-key.json")) && !v.force) {
    refuse("judge-key.json already exists; rebuilding would re-randomise every response id and orphan judge answers. Pass --force to overwrite deliberately.");
  }

  const subjectKey = readJson(path.join(keysDir, "subject-brief-key.json"));
  if (subjectKey.run_id !== v["run-id"]) refuse(`key is for run ${subjectKey.run_id}, not ${v["run-id"]}`);
  const ingestedFile = path.join(keysDir, "ingested", "answers.json");
  const ingested = readJson(ingestedFile);
  if (ingested.run_id !== v["run-id"]) refuse(`ingested answers are for run ${ingested.run_id}`);

  const bank = loadBankFile(path.resolve(v.bank ?? DEFAULT_BANK_PATH));
  const seed = v.seed === undefined ? randomSeed() : Number(v.seed);
  const result = buildJudgeBatches({
    bank,
    responses: ingested.responses,
    subjects: subjectKey.subjects ?? SUBJECTS,
    seed,
    batchSize: Number(v["batch-size"]),
    runId: v["run-id"],
  });
  const keyFile = writeJudgeBatches({ result, outDir, keyDir: keyOut, ingestedFile });

  console.log(`Responses:  ${result.key.responses.length}, each routed to ${result.key.judges_per_response} other-model judges`);
  console.log(`Batches:    ${result.batches.length} (size <= ${v["batch-size"]}) in ${outDir}`);
  console.log(`Load:       ${Object.entries(result.key.judge_load).map(([j, n]) => `${j}=${n}`).join("  ")}`);
  console.log(`Key:        ${keyFile}   -- never send this to a judge (seed ${seed})`);
  return 0;
});
