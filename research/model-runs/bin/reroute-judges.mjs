#!/usr/bin/env node
/**
 * reroute-judges.mjs -- exclude one model from the JUDGE role and re-route its ratings. No model is run.
 *
 * Reads (never writes): keys/judge-key.json, keys/ingested/answers.json, judge-answers/*.json.
 * For every response the excluded judge judged, the replacement is the UNIQUE judge in
 *   {all judges} \ {excluded, the response's subject, the response's other existing judge}
 * (fail closed if there is not exactly one). With --requote, every rating by a non-excluded judge whose
 * evidence_quote is not a verbatim substring OR that cb-probe's own per-rating validation rejects (e.g. a quote
 * under 3 words) is re-asked of the SAME judge.
 *
 * Writes: <out>/ (default judge-batches-reroute/): <judge>__reroute-NN.{json,md}, answer-schema.json
 *         and the amended routing key (default keys/judge-key.reroute.json, OUTSIDE <out>).
 *
 *   node research/model-runs/bin/reroute-judges.mjs --run-id <id> --exclude-judge claude-haiku [--requote]
 *        [--batch-size 8] [--max-bytes 70000] [--out <dir>] [--key-file <file>] [--answers <dir>]
 *        [--keys <dir>] [--seed <n>] [--bank <file>] [--run-root <dir>] [--reason <text>] [--force]
 *
 * INCREMENTAL MODE (--supplement; --exclude-judge is not needed):
 *   node research/model-runs/bin/reroute-judges.mjs --run-id <id> --supplement
 *        [--from-key keys/judge-key.reroute.json] [--answers <dir> ...] [--out judge-batches-reroute-2]
 *        [--key-file keys/judge-key.reroute-2.json] [--batch-size 8] [--max-bytes 70000] [--seed <n>] [--scratch-dir <dir>]
 *   Reads the current amended key and every answer dir (default: judge-answers and judge-answers-reroute), finds
 *   the ratings that key currently USES (non-excluded judges, original or reroute answers, not superseded) that are
 *   non-verbatim OR rejected by cb-probe's own per-rating validation, and writes only those as new small batches
 *   plus the next amended key. Nothing existing is edited or deleted; it refuses if its outputs already exist.
 */
import path from "node:path";
import { existsSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { parse, runRoot, main } from "../lib/cli.mjs";
import {
  readJson,
  loadBankFile,
  DEFAULT_BANK_PATH,
  assertKeyOutsideOut,
  randomSeed,
  refuse,
  sha256,
  writeJson,
  writeText,
  parseJsonLenient,
} from "../lib/common.mjs";
import { JUDGE_ANSWER_SCHEMA } from "../lib/judge-batches.mjs";
import { describeAnswerFile, emptyJudgeStats } from "../lib/judge-answers.mjs";
import { rerouteJudges, applyRequotes, buildRerouteBatches, buildRoutingKey, buildSupplementKey, validateRoutingKey, PROVENANCE } from "../lib/reroute.mjs";
import { cbProbeRejections } from "../lib/probe-validate.mjs";
import { planSupplement } from "../lib/supplement.mjs";
import { quoteLength } from "../lib/judge-validity.mjs";

function supplement(v) {
  if (!v["run-id"]) {
    console.error("usage: reroute-judges.mjs --run-id <id> --supplement [--from-key <file>] [--answers <dir> ...] [--out <dir>] [--key-file <file>]");
    return 2;
  }
  if (v["exclude-judge"] || v.requote || v.force) refuse("--supplement does not combine with --exclude-judge, --requote or --force (it only ever adds; it never regenerates)");
  const root = runRoot(v);
  const keysDir = path.resolve(v.keys ?? path.join(root, "keys"));
  const fromKeyFile = path.resolve(v["from-key"] ?? path.join(keysDir, "judge-key.reroute.json"));
  const outDir = path.resolve(v.out ?? path.join(root, "judge-batches-reroute-2"));
  const keyFile = path.resolve(v["key-file"] ?? path.join(keysDir, "judge-key.reroute-2.json"));
  const answerDirs = (v.answers?.length ? v.answers : [path.join(root, "judge-answers"), path.join(root, "judge-answers-reroute")]).map((x) => path.resolve(x));
  assertKeyOutsideOut(outDir, path.dirname(keyFile));
  if (keyFile === fromKeyFile || keyFile === path.join(keysDir, "judge-key.json")) refuse("the new key must not overwrite the key it extends or the original judge-key.json");
  for (const x of [keyFile, outDir]) if (existsSync(x)) refuse(`${x} already exists; --supplement never overwrites. Move it aside deliberately if you mean to redo this round.`);

  const originalKey = readJson(path.join(keysDir, "judge-key.json"));
  const previousKeyText = readFileSync(fromKeyFile, "utf8");
  const previousKey = validateRoutingKey(JSON.parse(previousKeyText), originalKey);
  if ((previousKey.supplements ?? []).length > 0) refuse(`${fromKeyFile} is already a supplement (round reroute-2); only one supplement round per chain is supported, because batches are tagged by round`);
  if (previousKey.run_id !== v["run-id"]) refuse(`key is for run ${previousKey.run_id}, not ${v["run-id"]}`);
  const ingested = readJson(path.join(keysDir, "ingested", "answers.json"));
  const bank = loadBankFile(path.resolve(v.bank ?? DEFAULT_BANK_PATH));
  const text = new Map(ingested.responses.map((r) => [`${r.subject}|${r.trial}|${r.item_id}`, r]));
  const responsesById = new Map();
  for (const k of previousKey.responses) {
    const rec = text.get(`${k.subject}|${k.trial}|${k.item_id}`);
    if (!rec || sha256(rec.response) !== k.response_sha256) refuse(`response ${k.response_id} is missing from, or no longer matches, the ingested answers`);
    responsesById.set(k.response_id, { ...k, response: rec.response });
  }

  const seed = v.seed === undefined ? randomSeed() : Number(v.seed);
  const batchSize = Number(v["batch-size"]);
  const maxBytes = Number(v["max-bytes"]);
  const minQuoteChars = v["min-quote-chars"] === undefined ? null : Number(v["min-quote-chars"]);
  if (minQuoteChars !== null && !(Number.isInteger(minQuoteChars) && minQuoteChars > 0)) refuse("--min-quote-chars must be a positive integer");
  const plan = planSupplement({ currentKey: previousKey, responsesById, answerDirs, bank, seed, scratchDir: v["scratch-dir"], minQuoteChars });
  console.log(`Inspected ${plan.inspected} currently-used ratings with cb-probe's own validator; selected ${plan.selected.length}.`);
  for (const s of plan.selected) console.log(`  ${s.response_id}  judge ${s.judge}  from ${s.from_source}/${s.from_batch_id}
    ${s.reason}`);
  if (plan.selected.length === 0) {
    console.log("Nothing to requote; no batches and no key written.");
    return 0;
  }
  const batches = buildRerouteBatches({
    bank,
    key: previousKey,
    ingested,
    assignments: plan.selected.map((s) => ({ response_id: s.response_id, judge: s.judge })),
    seed,
    runId: v["run-id"],
    batchSize,
    maxBytes,
    existingBatchIds: new Set(previousKey.batches.map((b) => b.batch_id)),
    namePrefix: "reroute-2",
  });
  const newKey = buildSupplementKey({
    previousKey,
    previousKeyFile: path.relative(keysDir, fromKeyFile) || path.basename(fromKeyFile),
    previousKeyText,
    selected: plan.selected,
    supplementBatches: batches,
    seed,
    batchSize,
    reason: v.reason ?? "ratings used by the previous amended key that cb-probe's own per-rating validation rejects (or whose quote is not verbatim)",
    sourceByPair: plan.sourceByPair,
  });
  validateRoutingKey(newKey, originalKey); // fail before writing anything
  for (const { base, batch, markdown } of batches) {
    writeJson(path.join(outDir, `${base}.json`), batch);
    writeText(path.join(outDir, `${base}.md`), `${markdown}
`);
  }
  writeJson(path.join(outDir, "answer-schema.json"), JUDGE_ANSWER_SCHEMA);
  writeJson(keyFile, { ...newKey, created_at: new Date().toISOString() });
  const perJudge = {};
  for (const b of batches) perJudge[b.judge] = (perJudge[b.judge] ?? 0) + 1;
  console.log(`New batches:       ${batches.length} (size <= ${batchSize}) in ${outDir}`);
  console.log(`Batches per judge: ${Object.entries(perJudge).map(([j, n]) => `${j}=${n}`).join("  ")}`);
  console.log(`Amended key:       ${keyFile}   -- never send this to a judge (seed ${seed})`);
  return 0;
}

main(() => {
  const v = parse({
    "run-id": { type: "string" },
    "exclude-judge": { type: "string" },
    requote: { type: "boolean", default: false },
    "batch-size": { type: "string", default: "8" },
    "max-bytes": { type: "string", default: "70000" },
    out: { type: "string" },
    "key-file": { type: "string" },
    answers: { type: "string", multiple: true },
    keys: { type: "string" },
    seed: { type: "string" },
    bank: { type: "string" },
    "run-root": { type: "string" },
    reason: { type: "string" },
    force: { type: "boolean", default: false },
    supplement: { type: "boolean", default: false },
    "from-key": { type: "string" },
    "scratch-dir": { type: "string" },
    "min-quote-chars": { type: "string" },
  });
  if (v.supplement) return supplement(v);
  if (!v["run-id"] || !v["exclude-judge"]) {
    console.error("usage: reroute-judges.mjs --run-id <id> --exclude-judge <label> [--requote] [--batch-size 8] [--max-bytes 70000] [--out <dir>] [--key-file <file>]");
    return 2;
  }
  const root = runRoot(v);
  const keysDir = path.resolve(v.keys ?? path.join(root, "keys"));
  const outDir = path.resolve(v.out ?? path.join(root, "judge-batches-reroute"));
  const keyFile = path.resolve(v["key-file"] ?? path.join(keysDir, "judge-key.reroute.json"));
  if ((v.answers ?? []).length > 1) refuse("--answers may be repeated only with --supplement");
  const answersDir = path.resolve(v.answers?.[0] ?? path.join(root, "judge-answers"));
  assertKeyOutsideOut(outDir, path.dirname(keyFile));
  if (keyFile === path.join(keysDir, "judge-key.json")) refuse("the amended key must not overwrite the original judge-key.json");
  if ((existsSync(keyFile) || existsSync(outDir)) && !v.force) {
    refuse(`${existsSync(keyFile) ? keyFile : outDir} already exists. Pass --force to regenerate (the original key and answers are never touched).`);
  }

  const originalKeyFile = path.join(keysDir, "judge-key.json");
  const originalKeyText = readFileSync(originalKeyFile, "utf8");
  const originalKey = readJson(originalKeyFile);
  if (originalKey.run_id !== v["run-id"]) refuse(`key is for run ${originalKey.run_id}, not ${v["run-id"]}`);
  const ingested = readJson(path.join(keysDir, "ingested", "answers.json"));
  const bank = loadBankFile(path.resolve(v.bank ?? DEFAULT_BANK_PATH));
  // `none` (pilot-2026-10-02): exclude nobody; the amended key only opens a requote round.
  const excludedJudge = v["exclude-judge"] === "none" ? null : v["exclude-judge"];
  // First-pilot keys have no `judges`: there the judges ARE the subjects.
  const allJudges = originalKey.judges ?? originalKey.subjects;
  const minQuoteChars = v["min-quote-chars"] === undefined ? null : Number(v["min-quote-chars"]);
  if (minQuoteChars !== null && !(Number.isInteger(minQuoteChars) && minQuoteChars > 0)) refuse("--min-quote-chars must be a positive integer");

  const text = new Map(ingested.responses.map((r) => [`${r.subject}|${r.trial}|${r.item_id}`, r]));
  const responsesById = new Map();
  for (const k of originalKey.responses) {
    const rec = text.get(`${k.subject}|${k.trial}|${k.item_id}`);
    if (!rec || sha256(rec.response) !== k.response_sha256) refuse(`response ${k.response_id} is missing from, or no longer matches, the ingested answers`);
    responsesById.set(k.response_id, { ...k, response: rec.response });
  }

  // 1. Scan the ORIGINAL answer files (read-only): per-judge stats, and which ratings fail the quote rule.
  const fileByBatch = new Map();
  for (const f of readdirSync(answersDir).filter((x) => x.endsWith(".json") && x !== "answer-schema.json").sort()) {
    const parsed = parseJsonLenient(readFileSync(path.join(answersDir, f), "utf8"), f);
    const id = parsed && parsed.batch_id;
    if (fileByBatch.has(id)) refuse(`${f}: batch ${id} is answered by more than one file`);
    fileByBatch.set(id, parsed);
  }
  const stats = {};
  const needsQuote = new Set();
  const probeCandidates = [];
  const missingRatings = [];
  for (const b of originalKey.batches) {
    const parsed = fileByBatch.get(b.batch_id);
    if (!parsed) refuse(`no original answer file for batch ${b.batch_id} (judge ${b.judge})`);
    const facts = describeAnswerFile(parsed, b, responsesById);
    const s = (stats[b.judge] ??= emptyJudgeStats());
    s.batches += 1;
    s.entries_expected += b.response_ids.length;
    s.ratings_returned += facts.byId.size;
    s.dropped += facts.dropped.length;
    s.unknown_or_duplicate += facts.unknownOrDuplicate;
    for (const [id, f] of facts.byId) {
      if (!f.verbatim) s.quote_not_verbatim += 1;
      if (f.nearMiss) s.of_which_normalisation_only_near_miss += 1;
      if (b.judge !== excludedJudge) {
        if (!f.verbatim || (minQuoteChars !== null && quoteLength(f.rating.evidence_quote) < minQuoteChars)) needsQuote.add(`${id}|${b.judge}`);
        probeCandidates.push({
          key: `${id}|${b.judge}`,
          item_id: responsesById.get(id).item_id,
          response_text: responsesById.get(id).response,
          rating_1_5: f.rating.rating_1_5,
          anchor_matched: f.rating.anchor_matched,
          evidence_quote: f.rating.evidence_quote,
          judge_label: b.judge,
        });
      }
    }
    if (b.judge !== excludedJudge) for (const id of facts.dropped) missingRatings.push(`${id}|${b.judge}`);
  }
  if (missingRatings.length > 0) {
    refuse(`${missingRatings.length} rating(s) by non-excluded judges are missing from the original answers (e.g. ${missingRatings[0]}); coverage must be complete before re-routing`);
  }

  // cb-probe's own validator decides the rest (never reimplemented here): a rating it rejects is requote-eligible too.
  let probeRejected = 0;
  if (v.requote) {
    for (const k of cbProbeRejections({ bank, scratchDir: v["scratch-dir"], candidates: probeCandidates }).keys()) {
      if (!needsQuote.has(k)) probeRejected += 1;
      needsQuote.add(k);
    }
  }

  // 2. Route (fail closed on any non-unique candidate), then mark requotes.
  let routed = rerouteJudges(originalKey.responses, allJudges, excludedJudge);
  let requoted = 0;
  if (v.requote) ({ routed, requoted } = applyRequotes(routed, needsQuote));
  const assignments = routed.flatMap((r) =>
    r.judges.filter((j) => r.judge_provenance[j] !== PROVENANCE.ORIGINAL).map((j) => ({ response_id: r.response_id, judge: j }))
  );

  // 3. Batches (<= batch-size, under the byte cap) and the amended key.
  const seed = v.seed === undefined ? randomSeed() : Number(v.seed);
  const batchSize = Number(v["batch-size"]);
  const maxBytes = Number(v["max-bytes"]);
  const batches = buildRerouteBatches({
    bank,
    key: originalKey,
    ingested,
    assignments,
    seed,
    runId: v["run-id"],
    batchSize,
    maxBytes,
    existingBatchIds: new Set(originalKey.batches.map((b) => b.batch_id)),
  });
  const routingKey = buildRoutingKey({
    originalKey,
    originalKeyText,
    routed,
    excludedJudge,
    reason: v.reason ?? "quote-grounding failures and dropped entries as a judge; see measured_original_answer_stats",
    requote: v.requote,
    rerouteBatches: batches,
    seed,
    batchSize,
    stats,
  });

  if (v.force && existsSync(outDir)) rmSync(outDir, { recursive: true, force: true });
  for (const { base, batch, markdown } of batches) {
    writeJson(path.join(outDir, `${base}.json`), batch);
    writeText(path.join(outDir, `${base}.md`), `${markdown}\n`);
  }
  writeJson(path.join(outDir, "answer-schema.json"), JUDGE_ANSWER_SCHEMA);
  writeJson(keyFile, { ...routingKey, created_at: new Date().toISOString() });

  const perJudge = {};
  for (const b of batches) perJudge[b.judge] = (perJudge[b.judge] ?? 0) + 1;
  const rerouted = routingKey.summary.ratings_rerouted;
  console.log(`Rerouted ratings (excluded judge ${excludedJudge}): ${rerouted}`);
  console.log(`Requoted ratings:  ${requoted}${v.requote ? ` (of which ${probeRejected} are verbatim but rejected by cb-probe's validator)` : " (--requote not given)"}`);
  console.log(`New batches:       ${batches.length} (size <= ${batchSize}) in ${outDir}`);
  console.log(`Batches per judge: ${Object.entries(perJudge).map(([j, n]) => `${j}=${n}`).join("  ")}`);
  console.log(`Max batch bytes:   ${Math.max(...batches.map((b) => b.bytes))} (cap ${maxBytes})`);
  console.log(`Original-answer judge stats: ${JSON.stringify(stats)}`);
  console.log(`Amended key:       ${keyFile}   -- never send this to a judge (seed ${seed})`);
  return 0;
});
