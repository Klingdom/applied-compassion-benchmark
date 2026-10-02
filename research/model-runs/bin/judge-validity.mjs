#!/usr/bin/env node
/**
 * judge-validity.mjs -- the pre-registered judge validity measurement (PREREGISTRATION.md section 5).
 *
 * Reads (never writes) keys/judge-key.json (or an amended key via --key), keys/ingested/answers.json and the judge
 * answer directories. For each judge it counts the ratings whose evidence quote is not found in the reply it rates,
 * after the shared normaliser (lib/normalise.mjs), compares the rate with the threshold in run-config.json
 * (judge_validity.max_unfound_quote_rate_percent; strictly greater fails, exactly equal passes), lists the quotes under
 * judge_validity.short_quote_min_chars characters for the supplement round, and writes ONE report:
 *
 *   <run>/operations/judge-validity.json
 *
 * It must be run before assemble-run.mjs. The assembler refuses if the report is absent, or stale (any measured
 * answer file edited, any unmeasured answer file added, the key changed, or the ratings hash not reproducible).
 *
 *   node research/model-runs/bin/judge-validity.mjs --run-id <id> --answers <dir> [--answers <dir> ...]
 *        [--key <file inside keys/>] [--out <file>] [--keys <dir>] [--run-root <dir>] [--force]
 *        [--max-percent <n> --min-quote-chars <n>]      (ONLY for a run with no run-config.json judge_validity block)
 *
 * Order of --answers matters: a later directory supersedes an earlier one for the same (judge, reply), which is how a
 * requote supplement replaces a short or unfound quote before the measurement is final.
 * Exit codes: 0 every judge within the threshold; 1 refused or the answer set is incomplete (a report is still written
 * when the set could be read); 2 usage; 4 exactly one judge exceeds the threshold (exclude + reroute);
 * 5 two or more exceed it (instrument findings only, no composite).
 */
import path from "node:path";
import { existsSync, readFileSync } from "node:fs";
import { parse, runRoot, main } from "../lib/cli.mjs";
import { readJson, refuse, writeJson } from "../lib/common.mjs";
import { parseJudgingConfig, hasExplicitJudges } from "../lib/judging-config.mjs";
import { buildValidityReport, loadReplyTexts, readAnswerFiles } from "../lib/judge-validity.mjs";

main(() => {
  const v = parse({
    "run-id": { type: "string" },
    answers: { type: "string", multiple: true },
    key: { type: "string" },
    out: { type: "string" },
    keys: { type: "string" },
    "run-root": { type: "string" },
    force: { type: "boolean", default: false },
    "max-percent": { type: "string" },
    "min-quote-chars": { type: "string" },
  });
  if (!v["run-id"] || !(v.answers ?? []).length) {
    console.error("usage: judge-validity.mjs --run-id <id> --answers <dir> [--answers <dir> ...] [--key <file>] [--out <file>] [--force]");
    return 2;
  }
  const root = runRoot(v);
  const keysDir = path.resolve(v.keys ?? path.join(root, "keys"));
  const originalKeyFile = path.join(keysDir, "judge-key.json");
  const keyFile = path.resolve(v.key ?? originalKeyFile);
  if (path.dirname(keyFile) !== keysDir) refuse(`--key must be a file inside ${keysDir} (the assembler re-reads it from there)`);
  const outFile = path.resolve(v.out ?? path.join(root, "operations", "judge-validity.json"));
  if (existsSync(outFile) && !v.force) {
    refuse(`${outFile} already exists. A new measurement replaces the old one only on purpose: pass --force.`);
  }

  // The rule: from run-config.json. Flags exist only for a run that has no such block (e.g. re-measuring the first pilot).
  const configFile = path.join(root, "run-config.json");
  let rule;
  if (existsSync(configFile) && hasExplicitJudges(readJson(configFile))) {
    if (v["max-percent"] !== undefined || v["min-quote-chars"] !== undefined) refuse("the threshold comes from run-config.json; --max-percent / --min-quote-chars are not accepted here");
    rule = parseJudgingConfig(readJson(configFile), configFile).validity;
  } else {
    if (v["max-percent"] === undefined || v["min-quote-chars"] === undefined) refuse("no run-config.json judge_validity block: pass --max-percent and --min-quote-chars explicitly");
    rule = { maxUnfoundPercent: Number(v["max-percent"]), shortQuoteMinChars: Number(v["min-quote-chars"]) };
    if (!(rule.maxUnfoundPercent >= 0 && rule.maxUnfoundPercent < 100) || !Number.isInteger(rule.shortQuoteMinChars) || rule.shortQuoteMinChars < 1) refuse("--max-percent must be in [0,100) and --min-quote-chars a positive integer");
  }

  const judgeKeyText = readFileSync(originalKeyFile, "utf8");
  const keyText = readFileSync(keyFile, "utf8");
  let judgeKey = JSON.parse(keyText);
  if (judgeKey.run_id !== v["run-id"]) refuse(`key is for run ${judgeKey.run_id}, not ${v["run-id"]}`);
  if (keyFile !== originalKeyFile) {
    // An amended key does not copy the explicit-judge-set fields; they live in the original key (as in assemble.mjs).
    const original = JSON.parse(judgeKeyText);
    for (const f of ["judges", "family_of", "bridge", "validity_required"]) {
      if (original[f] !== undefined && judgeKey[f] === undefined) judgeKey = { ...judgeKey, [f]: original[f] };
    }
  }
  const ingested = readJson(path.join(keysDir, "ingested", "answers.json"));
  const texts = loadReplyTexts({ judgeKey, ingested });
  const files = readAnswerFiles(v.answers.map((x) => path.resolve(x)));

  const report = buildValidityReport({ runId: v["run-id"], judgeKey, keyFile, keyText, judgeKeyText, files, texts, rule });
  writeJson(outFile, report);

  console.log(`Threshold: unfound-quote rate > ${rule.maxUnfoundPercent}% fails (exactly ${rule.maxUnfoundPercent}% passes); short quote = under ${rule.shortQuoteMinChars} chars`);
  for (const [j, g] of Object.entries(report.judges)) {
    const rate = g.unfound_rate_percent === null ? "n/a" : `${g.unfound_rate_percent.toFixed(2)}%`;
    console.log(`  ${j}: ${g.unfound}/${g.ratings} unfound = ${rate}  (normalisation-only ${g.found_after_normalisation_only})  ${g.verdict}`);
  }
  console.log(`Short quotes for the supplement round: ${report.short_quotes_for_supplement.count}`);
  if (report.problems.length > 0) {
    console.error(`Answer set has ${report.problems.length} problem(s); first: ${report.problems[0]}`);
  }
  console.log(`Verdict: ${report.run_verdict}`);
  console.log(`Report: ${outFile}`);
  if (!report.complete) return 1;
  if (report.failing_judges.length >= 2) return 5;
  if (report.failing_judges.length === 1) return 4;
  return 0;
});
