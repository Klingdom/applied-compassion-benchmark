#!/usr/bin/env node
/**
 * build-subject-briefs.mjs -- step 1 of the blinded cross-model pilot.
 *
 * One prompts-only brief per subject x trial: verbatim item prompts under opaque per-brief codes, in an
 * order shuffled by a per-trial seed. No anchors, rubric, construct, indicator, dimension or item id.
 * The leak check runs on the exact text before it is written, and again on the files after; any leak
 * deletes the output and exits non-zero. The key (code -> item id, seeds, exclusions) goes OUTSIDE --out.
 *
 *   node research/model-runs/bin/build-subject-briefs.mjs --run-id <id> --out <dir> [--key-out <dir>]
 *        [--seed <n>] [--trials 3] [--bank <file>] [--run-root <dir>] [--force]
 *
 * Defaults: --run-root research/model-runs/<run-id>; --key-out <run-root>/keys.
 */
import path from "node:path";
import { parse, runRoot, main } from "../lib/cli.mjs";
import {
  SUBJECTS,
  DEFAULT_BANK_PATH,
  loadBankFile,
  assertKeyOutsideOut,
  randomSeed,
  refuse,
  servedItems,
  exclusionRule,
  RULE_DESCRIPTION,
} from "../lib/common.mjs";
import { buildSubjectBriefs, writeSubjectBriefs } from "../lib/subject-briefs.mjs";
import { MIN_TRIALS } from "../../../tools/cb-probe/lib/scored-run.mjs";

main(() => {
  const v = parse({
    "run-id": { type: "string" },
    out: { type: "string" },
    "key-out": { type: "string" },
    seed: { type: "string" },
    trials: { type: "string" },
    bank: { type: "string" },
    "run-root": { type: "string" },
    force: { type: "boolean", default: false },
  });
  if (!v["run-id"] || !v.out) {
    console.error("usage: build-subject-briefs.mjs --run-id <id> --out <dir> [--key-out <dir>] [--seed <n>] [--trials 3] [--bank <file>] [--force]");
    return 2;
  }
  const root = runRoot(v);
  const outDir = path.resolve(v.out);
  const keyDir = path.resolve(v["key-out"] ?? path.join(root, "keys"));
  assertKeyOutsideOut(outDir, keyDir);

  const bankPath = path.resolve(v.bank ?? DEFAULT_BANK_PATH);
  const bank = loadBankFile(bankPath);
  const trials = v.trials === undefined ? MIN_TRIALS : Number(v.trials);
  const seed = v.seed === undefined ? randomSeed() : Number(v.seed);
  if (!Number.isInteger(seed)) refuse("--seed must be an integer");

  const result = buildSubjectBriefs({ bank, runId: v["run-id"], subjects: SUBJECTS, trials, seed });
  const { written, keyFile } = writeSubjectBriefs({ result, bank, bankPath, outDir, keyDir, force: v.force });

  const served = servedItems(bank);
  const excluded = exclusionRule(bank);
  console.log(`Run:        ${v["run-id"]}   bank ${bank.meta.bankVersion}, ${bank.items.length} items`);
  console.log(`Served:     ${served.length} items per brief; ${excluded.length} excluded`);
  console.log(`Rule:       ${RULE_DESCRIPTION}`);
  for (const e of excluded) console.log(`  excluded  ${e.id}: ${e.reasons.join("; ")}`);
  console.log(`Briefs:     ${result.briefs.length} (${SUBJECTS.length} subjects x ${trials} trials), ${written.length} files in ${outDir}`);
  console.log(`Key:        ${keyFile}   -- never send this to a subject (master seed ${seed})`);
  console.log("Leak check: PASSED on every brief, before writing and again on the written files.");
  return 0;
});
