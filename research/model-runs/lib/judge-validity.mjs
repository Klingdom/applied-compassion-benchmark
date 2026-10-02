// research/model-runs/lib/judge-validity.mjs
//
// The pre-registered judge validity rule (PREREGISTRATION.md section 5), as code.
//
//   unfound-quote rate (per judge) = share of that judge's ratings whose evidence quote is not found in the reply
//   it rates, after the shared normaliser (lib/normalise.mjs). A judge whose rate EXCEEDS the configured percent
//   is excluded for the whole run. Exactly at the threshold passes. The threshold comes from run-config.json.
//
// This is a measurement over raw answer files. It computes no score. It must run before assembly, and the
// assembler refuses unless a report made from exactly the answer files it is about to use exists.

import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { NORM } from "./normalise.mjs";
import { refuse, sha256, parseJsonLenient, readJson } from "./common.mjs";

export const VALIDITY_REPORT_KIND = "judge-validity-report";

const collapse = (s) => String(s).replace(/\s+/g, " ").trim();

/** Length of a quote as the supplement rule counts it: whitespace collapsed, ends trimmed. */
export const quoteLength = (q) => (typeof q === "string" ? collapse(q).length : 0);

/** Found = a substring of the reply as written, or after the shared normaliser. An empty (or all-markup) quote is never found. */
export function isQuoteFound(text, quote) {
  if (typeof text !== "string" || typeof quote !== "string" || quote.length === 0) return false;
  if (text.includes(quote)) return true;
  const nq = NORM(quote);
  return nq.length > 0 && NORM(text).includes(nq);
}

/**
 * Strictly greater than the threshold fails. Integer-exact for any threshold with a short decimal form:
 * unfound/total > percent/100  <=>  unfound*100 > percent*total  (no division, so 5.0% exactly can never round either way).
 */
export function judgeVerdict({ unfound, total }, maxPercent) {
  if (!(total > 0)) return "NOT-MEASURED";
  return unfound * 100 > maxPercent * total ? "FAIL" : "PASS";
}

/**
 * Gather the rating each (judge, reply) pair ends with across the supplied answer files, in order (a later file
 * supersedes an earlier one for the same pair: that is how a requote supplement replaces a rating).
 * @param {{judgeKey: object, files: {ref: string, parsed: any}[]}} p
 * @returns {{pairs: Map<string, object>, problems: string[], superseded: number}}
 */
export function collectRatings({ judgeKey, files }) {
  const problems = [];
  const byBatch = new Map(judgeKey.batches.map((b) => [b.batch_id, b]));
  const claimed = new Map();
  const pairs = new Map();
  let superseded = 0;
  for (const { ref, parsed } of files) {
    const batchKey = byBatch.get(parsed && parsed.batch_id);
    if (!batchKey) {
      problems.push(`${ref}: batch_id ${JSON.stringify(parsed && parsed.batch_id)} is not a batch of the key`);
      continue;
    }
    if (claimed.has(batchKey.batch_id)) {
      problems.push(`${ref}: batch ${batchKey.batch_id} is already answered by ${claimed.get(batchKey.batch_id)}`);
      continue;
    }
    claimed.set(batchKey.batch_id, ref);
    if (!Array.isArray(parsed.ratings)) {
      problems.push(`${ref}: no ratings array`);
      continue;
    }
    const main = new Set(batchKey.response_ids);
    const bridge = new Set(batchKey.bridge_response_ids ?? []);
    const seen = new Set();
    for (const r of parsed.ratings) {
      const id = r && r.response_id;
      if (typeof id !== "string" || (!main.has(id) && !bridge.has(id))) {
        problems.push(`${ref}: rating for ${JSON.stringify(id)} which is not in this batch`);
        continue;
      }
      if (seen.has(id)) {
        problems.push(`${ref}: ${id} is rated more than once`);
        continue;
      }
      seen.add(id);
      const k = `${batchKey.judge}|${id}`;
      if (pairs.has(k)) superseded += 1;
      pairs.set(k, {
        judge: batchKey.judge,
        response_id: id,
        rating_1_5: r.rating_1_5,
        anchor_matched: r.anchor_matched,
        evidence_quote: r.evidence_quote,
        batch_id: batchKey.batch_id,
        ref,
        bridge: bridge.has(id),
      });
    }
    for (const id of [...main, ...bridge]) if (!seen.has(id)) problems.push(`${ref}: no rating for ${id} (entry dropped; the batch must be voided and re-run)`);
  }
  for (const b of judgeKey.batches) if (!claimed.has(b.batch_id)) problems.push(`no answer file for batch ${b.batch_id} (judge ${b.judge})`);
  return { pairs, problems, superseded };
}

/** Hash of exactly the ratings a measurement covers, independent of file layout. */
export function ratingsHash(pairs) {
  const rows = [...pairs.values()]
    .map((p) => [p.response_id, p.judge, p.rating_1_5, p.anchor_matched, p.evidence_quote])
    .sort((a, b) => (a[0] + "|" + a[1]).localeCompare(b[0] + "|" + b[1]));
  return sha256(JSON.stringify(rows));
}

/** response_id -> reply text for every main and bridge reply the key knows. */
export function loadReplyTexts({ judgeKey, ingested }) {
  const text = new Map(ingested.responses.map((r) => [`${r.subject}|${r.trial}|${r.item_id}`, r]));
  const out = new Map();
  for (const k of judgeKey.responses) {
    const rec = text.get(`${k.subject}|${k.trial}|${k.item_id}`);
    if (!rec || sha256(rec.response) !== k.response_sha256) refuse(`reply ${k.response_id} is missing from, or no longer matches, the ingested answers`);
    out.set(k.response_id, rec.response);
  }
  for (const b of judgeKey.bridge?.entries ?? []) {
    if (sha256(b.response) !== b.response_sha256) refuse(`bridge reply ${b.response_id}: stored text does not match its hash`);
    out.set(b.response_id, b.response);
  }
  return out;
}

/**
 * @param {object} p
 * @param {object} p.judgeKey        the key whose batches the answer files answer
 * @param {{ref: string, sha256: string, parsed: any}[]} p.files
 * @param {Map<string,string>} p.texts
 * @param {{maxUnfoundPercent: number, shortQuoteMinChars: number}} p.rule
 */
export function buildValidityReport({ runId, judgeKey, keyFile, keyText, judgeKeyText, files, texts, rule, now = () => new Date() }) {
  const { pairs, problems, superseded } = collectRatings({ judgeKey, files });
  const judges = {};
  const bridge = {};
  const shortQuotes = [];
  const slot = (m, j) => (m[j] ??= { ratings: 0, found_as_written: 0, found_after_normalisation_only: 0, unfound: 0 });
  for (const p of pairs.values()) {
    const g = slot(p.bridge ? bridge : judges, p.judge);
    const text = texts.get(p.response_id);
    if (text === undefined) {
      problems.push(`no reply text for ${p.response_id}`);
      continue;
    }
    g.ratings += 1;
    if (typeof p.evidence_quote === "string" && p.evidence_quote.length > 0 && text.includes(p.evidence_quote)) g.found_as_written += 1;
    else if (isQuoteFound(text, p.evidence_quote)) g.found_after_normalisation_only += 1;
    else g.unfound += 1;
    if (!p.bridge && quoteLength(p.evidence_quote) < rule.shortQuoteMinChars) {
      shortQuotes.push({ response_id: p.response_id, judge: p.judge, batch_id: p.batch_id, quote_chars: quoteLength(p.evidence_quote), file: p.ref });
    }
  }
  for (const j of judgeKey.judges ?? []) slot(judges, j);
  for (const [j, g] of Object.entries(judges)) {
    g.unfound_rate_percent = g.ratings > 0 ? (g.unfound * 100) / g.ratings : null;
    g.verdict = judgeVerdict({ unfound: g.unfound, total: g.ratings }, rule.maxUnfoundPercent);
    judges[j] = g;
  }
  for (const g of Object.values(bridge)) g.unfound_rate_percent = g.ratings > 0 ? (g.unfound * 100) / g.ratings : null;

  const failing = Object.entries(judges).filter(([, g]) => g.verdict === "FAIL").map(([j]) => j).sort();
  const unmeasured = Object.entries(judges).filter(([, g]) => g.verdict === "NOT-MEASURED").map(([j]) => j).sort();
  const complete = problems.length === 0 && unmeasured.length === 0;
  let runVerdict;
  if (!complete) runVerdict = "INCOMPLETE: the answer set has problems; no verdict";
  else if (failing.length === 0) runVerdict = "ALL-JUDGES-VALID";
  else if (failing.length === 1) runVerdict = `EXCLUDE ${failing[0]} and reroute its batches to the remaining judges`;
  else runVerdict = "INSTRUMENT-FINDINGS-ONLY: two or more judges failed; no composite is computed (section 5, edge cases)";

  return {
    kind: VALIDITY_REPORT_KIND,
    run_id: runId,
    generated_at: now().toISOString(),
    rule: {
      source: "PREREGISTRATION.md section 5, values read from run-config.json judge_validity",
      max_unfound_quote_rate_percent: rule.maxUnfoundPercent,
      comparison: "a judge fails only if its unfound rate is strictly greater than the threshold; exactly at the threshold passes",
      short_quote_min_chars: rule.shortQuoteMinChars,
      normaliser: "research/model-runs/lib/normalise.mjs (NORM)",
    },
    judge_key_sha256: sha256(judgeKeyText),
    key_file: path.basename(keyFile),
    key_sha256: sha256(keyText),
    answer_files: files.map((f) => ({ ref: f.ref, sha256: f.sha256 })),
    ratings_sha256: ratingsHash(pairs),
    ratings_measured: [...pairs.values()].filter((p) => !p.bridge).length,
    bridge_ratings_seen: [...pairs.values()].filter((p) => p.bridge).length,
    pairs_superseded_by_a_later_file: superseded,
    complete,
    problems,
    judges,
    bridge_judges_informational: bridge,
    failing_judges: failing,
    run_verdict: runVerdict,
    short_quotes_for_supplement: {
      note: "Quotes under short_quote_min_chars, as the supplement round must requote them before this measurement is final (section 5). Main ratings only.",
      count: shortQuotes.length,
      entries: shortQuotes.sort((a, b) => a.judge.localeCompare(b.judge) || a.response_id.localeCompare(b.response_id)),
    },
  };
}

/** Read the answer files in the given directories (ref = `<dirname>/<file>`), in the order given. */
export function readAnswerFiles(dirs) {
  const files = [];
  for (const dir of dirs) {
    if (!existsSync(dir)) refuse(`answers directory ${dir} does not exist`);
    for (const f of readdirSync(dir).filter((x) => x.endsWith(".json") && x !== "answer-schema.json").sort()) {
      const raw = readFileSync(path.join(dir, f), "utf8");
      files.push({ ref: `${path.basename(dir)}/${f}`, abs: path.join(dir, f), sha256: sha256(raw), parsed: parseJsonLenient(raw, `${path.basename(dir)}/${f}`) });
    }
  }
  return files;
}

/**
 * Assembly gate. Refuses unless a report exists, is complete, was made from exactly the answer files about to be
 * used, and its verdict agrees with the routing in force.
 *
 * @param {object} p
 * @param {string|null} p.validityFile
 * @param {string} p.keysDir
 * @param {string} p.originalKeyText             bytes of keys/judge-key.json
 * @param {string[]} p.ratingsDirs
 * @param {object|null} p.routingKey              the amended key, when --routing is given
 * @param {string} p.runId
 */
export function assertValidityFresh({ validityFile, keysDir, originalKeyText, ratingsDirs, routingKey, runId }) {
  if (!validityFile || !existsSync(validityFile)) {
    refuse(
      `no judge validity report at ${validityFile ?? "(none given)"}. PREREGISTRATION.md section 5 requires the unfound-quote ` +
        "measurement before any composite: run bin/judge-validity.mjs first."
    );
  }
  const stale = (m) => refuse(`the judge validity report is stale: ${m}. Re-run bin/judge-validity.mjs on the answers being assembled.`);
  const report = readJson(validityFile);
  if (report.kind !== VALIDITY_REPORT_KIND) refuse(`${validityFile} is not a ${VALIDITY_REPORT_KIND}`);
  if (report.run_id !== runId) refuse(`validity report is for run ${report.run_id}, not ${runId}`);
  if (report.complete !== true) refuse(`the judge validity report is incomplete (${report.problems?.length ?? "?"} problem(s)); there is no verdict to rely on`);
  if (report.judge_key_sha256 !== sha256(originalKeyText)) stale("keys/judge-key.json changed after the measurement");

  const refs = new Map();
  for (const dir of ratingsDirs) {
    for (const f of readdirSync(dir).filter((x) => x.endsWith(".json") && x !== "answer-schema.json").sort()) {
      refs.set(`${path.basename(dir)}/${f}`, path.join(dir, f));
    }
  }
  const measured = new Set();
  for (const { ref, sha256: want } of report.answer_files) {
    const abs = refs.get(ref);
    if (!abs) stale(`measured file ${ref} is not among the answers being assembled`);
    if (sha256(readFileSync(abs, "utf8")) !== want) stale(`${ref} was edited after it was measured`);
    measured.add(ref);
  }
  for (const [ref, abs] of refs) {
    if (measured.has(ref)) continue;
    // The only unmeasured answers allowed are exclusion reroutes: new ratings by a kept judge that REPLACE an excluded judge's.
    const parsed = parseJsonLenient(readFileSync(abs, "utf8"), ref);
    const batch = routingKey?.batches?.find((b) => b.batch_id === parsed?.batch_id);
    const onlyRerouted =
      batch &&
      batch.source === "reroute" &&
      batch.response_ids.every((id) => routingKey.responses.find((r) => r.response_id === id)?.judge_provenance?.[batch.judge] === "rerouted-excluded-judge");
    if (!onlyRerouted) stale(`${ref} was not part of the measurement and is not an exclusion reroute`);
  }

  // The report's own ratings hash, recomputed from the key and files it names (guards a hand-edited report).
  const keyFile = path.join(keysDir, report.key_file);
  if (!existsSync(keyFile)) stale(`the key file ${report.key_file} the measurement used is missing`);
  const keyText = readFileSync(keyFile, "utf8");
  if (sha256(keyText) !== report.key_sha256) stale(`${report.key_file} changed after the measurement`);
  const files = report.answer_files.map(({ ref }) => ({ ref, parsed: parseJsonLenient(readFileSync(refs.get(ref), "utf8"), ref) }));
  const { pairs, problems } = collectRatings({ judgeKey: JSON.parse(keyText), files });
  if (problems.length > 0) stale(`re-reading the measured files raised ${problems.length} problem(s)`);
  if (ratingsHash(pairs) !== report.ratings_sha256) stale("the ratings hash does not match the ratings in the measured files");

  const failing = [...(report.failing_judges ?? [])].sort();
  if (failing.length >= 2) {
    refuse(`judge validity: ${failing.join(", ")} all exceed the threshold. Section 5: with two judges excluded the run reports instrument findings only and no composite.`);
  }
  const excluded = [...(routingKey?.excluded_judges ?? [])].sort();
  if (failing.join() !== excluded.join()) {
    refuse(
      `judge validity: the measurement says exclude [${failing.join(", ") || "nobody"}] but the routing in force excludes [${excluded.join(", ") || "nobody"}]. ` +
        "Excluding a judge that passed, or keeping one that failed, is a deviation from the pre-registration."
    );
  }
  return report;
}
