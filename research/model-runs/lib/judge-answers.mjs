// research/model-runs/lib/judge-answers.mjs
//
// Validation of judge answer files against the blinding key. This validates what the HARNESS defines:
// every response in a batch rated exactly once, no extras, an integer rating, and an evidence_quote
// that is a verbatim substring of the response. Rules that belong to the scorer (anchor_matched must
// equal the item's published label for that level; quote of at least three words) are deliberately NOT
// duplicated here -- cb-probe enforces them when the rating is recorded, and assemble.mjs attributes
// any such refusal to the exact response and judge.

import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { isValidRating } from "../../../tools/cb-probe/lib/validate-estimate.mjs";
import { parseJsonLenient, HarnessError } from "./common.mjs";
import { defaultRatingSource } from "./reroute.mjs";

const FILE_KEYS = new Set(["batch_id", "ratings"]);
const RATING_KEYS = new Set(["response_id", "rating_1_5", "anchor_matched", "evidence_quote"]);

const collapseWs = (s) => String(s).replace(/\s+/g, " ").trim();

/**
 * Verbatim: the quote, with whitespace runs collapsed and ends trimmed, appears CASE-SENSITIVELY in the
 * response with whitespace runs collapsed. (Collapsing whitespace only absorbs line-wrapping and JSON
 * transport; the characters themselves must match.) Stricter than the scorer's own check, which is
 * case-insensitive, so anything that passes here passes there.
 */
export function isVerbatimSubstring(response, quote) {
  if (typeof response !== "string" || typeof quote !== "string") return false;
  const q = collapseWs(quote);
  return q.length > 0 && collapseWs(response).includes(q);
}

/**
 * @param {object} parsed          the parsed judge answer file
 * @param {object} batchKey        the batch's entry in the judge key
 * @param {Map<string, {response: string}>} responsesById  response_id -> response record
 * @returns {{errors: string[], ratings: object[]}}
 */
export function validateJudgeAnswers(parsed, batchKey, responsesById, label) {
  const errors = [];
  const ratings = [];
  const fail = (m) => errors.push(`${label}: ${m}`);

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    fail("must be a JSON object");
    return { errors, ratings };
  }
  for (const k of Object.keys(parsed)) if (!FILE_KEYS.has(k)) fail(`unexpected top-level key "${k}"`);
  if (parsed.batch_id !== batchKey.batch_id) {
    fail(`batch_id ${JSON.stringify(parsed.batch_id)} does not match the batch this file was matched to (${batchKey.batch_id})`);
  }
  if (!Array.isArray(parsed.ratings)) {
    fail("`ratings` must be an array");
    return { errors, ratings };
  }

  const inBatch = new Set(batchKey.response_ids);
  const seen = new Map();
  parsed.ratings.forEach((r, i) => {
    if (!r || typeof r !== "object" || Array.isArray(r)) {
      fail(`ratings[${i}] must be an object`);
      return;
    }
    for (const k of Object.keys(r)) if (!RATING_KEYS.has(k)) fail(`ratings[${i}] has unexpected key "${k}"`);
    const id = r.response_id;
    if (typeof id !== "string" || !inBatch.has(id)) {
      fail(`ratings[${i}]: response_id ${JSON.stringify(id)} is not in this batch`);
      return;
    }
    if (seen.has(id)) {
      fail(`response_id ${id} is rated more than once (ratings[${seen.get(id)}] and ratings[${i}])`);
      return;
    }
    seen.set(id, i);
    let ok = true;
    if (!isValidRating(r.rating_1_5)) {
      fail(`${id}: rating_1_5 must be an integer 1-5, got ${JSON.stringify(r.rating_1_5)}`);
      ok = false;
    }
    if (typeof r.anchor_matched !== "string" || r.anchor_matched.trim().length === 0) {
      fail(`${id}: anchor_matched must be a non-empty string`);
      ok = false;
    }
    if (typeof r.evidence_quote !== "string" || r.evidence_quote.trim().length === 0) {
      fail(`${id}: evidence_quote must be a non-empty string`);
      ok = false;
    } else if (!isVerbatimSubstring(responsesById.get(id)?.response, r.evidence_quote)) {
      fail(`${id}: evidence_quote is not a verbatim substring of the response it rates`);
      ok = false;
    }
    if (ok) {
      ratings.push({
        response_id: id,
        judge: batchKey.judge,
        rating_1_5: r.rating_1_5,
        anchor_matched: r.anchor_matched,
        evidence_quote: r.evidence_quote,
      });
    }
  });

  const missing = batchKey.response_ids.filter((id) => !seen.has(id));
  if (missing.length > 0) {
    fail(`${missing.length} response_id(s) not rated: ${missing.slice(0, 6).join(", ")}${missing.length > 6 ? ", ..." : ""}`);
  }
  return { errors, ratings };
}

/** Read every *.json in `ratingsDir`, match by batch_id, require every batch to be present exactly once. */
export function loadJudgeAnswers({ judgeKey, ratingsDir, responsesById }) {
  const errors = [];
  const byBatch = new Map(judgeKey.batches.map((b) => [b.batch_id, b]));
  const claimed = new Map();
  const all = [];

  for (const f of readdirSync(ratingsDir).filter((x) => x.endsWith(".json")).sort()) {
    let parsed;
    try {
      parsed = parseJsonLenient(readFileSync(path.join(ratingsDir, f), "utf8"), f);
    } catch (e) {
      if (e instanceof HarnessError) {
        errors.push(e.message);
        continue;
      }
      throw e;
    }
    const batchKey = byBatch.get(parsed && parsed.batch_id);
    if (!batchKey) {
      errors.push(`${f}: batch_id ${JSON.stringify(parsed && parsed.batch_id)} is not a batch of run ${judgeKey.run_id}`);
      continue;
    }
    if (claimed.has(batchKey.batch_id)) {
      errors.push(`${f}: batch ${batchKey.batch_id} is already answered by ${claimed.get(batchKey.batch_id)}`);
      continue;
    }
    claimed.set(batchKey.batch_id, f);
    const r = validateJudgeAnswers(parsed, batchKey, responsesById, `${f} (judge ${batchKey.judge})`);
    errors.push(...r.errors);
    all.push(...r.ratings);
  }
  for (const b of judgeKey.batches) {
    if (!claimed.has(b.batch_id)) errors.push(`no answer file for batch ${b.batch_id} (judge ${b.judge})`);
  }
  return { errors, ratings: all };
}

// ---------------------------------------------------------------------------
// Routed (amended-key) loading: judge exclusion / re-routing
// ---------------------------------------------------------------------------

/**
 * REPORTING ONLY. Normalises case, quotes, dashes, punctuation and whitespace so the audit can say how many
 * of the failed quotes were formatting-only near-misses. Nothing is ever accepted on this basis.
 */
const normaliseForStats = (s) =>
  String(s)
    .toLowerCase()
    .replace(/[‘’‚‛]/g, "'")
    .replace(/[“”„‟]/g, '"')
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

function readAnswerFile(dir, f) {
  return parseJsonLenient(readFileSync(path.join(dir, f), "utf8"), f);
}

/**
 * Per-rating facts about one parsed answer file against its batch, with no acceptance decision:
 * which batch response_ids were rated (valid, unique), which quotes are not verbatim, which of those
 * are normalisation-only near-misses.
 */
export function describeAnswerFile(parsed, batchKey, responsesById) {
  const inBatch = new Set(batchKey.response_ids);
  const byId = new Map();
  let unknownOrDuplicate = 0;
  const list = parsed && Array.isArray(parsed.ratings) ? parsed.ratings : [];
  for (const r of list) {
    const id = r && r.response_id;
    if (typeof id !== "string" || !inBatch.has(id) || byId.has(id)) {
      unknownOrDuplicate += 1;
      continue;
    }
    const resp = responsesById.get(id)?.response;
    const verbatim = typeof r.evidence_quote === "string" && isVerbatimSubstring(resp, r.evidence_quote);
    const nearMiss =
      !verbatim &&
      typeof r.evidence_quote === "string" &&
      normaliseForStats(r.evidence_quote).length > 0 &&
      normaliseForStats(resp ?? "").includes(normaliseForStats(r.evidence_quote));
    byId.set(id, { rating: r, verbatim, nearMiss });
  }
  return { byId, dropped: batchKey.response_ids.filter((id) => !byId.has(id)), unknownOrDuplicate };
}

export const emptyJudgeStats = () => ({
  batches: 0,
  entries_expected: 0,
  ratings_returned: 0,
  dropped: 0,
  unknown_or_duplicate: 0,
  quote_not_verbatim: 0,
  of_which_normalisation_only_near_miss: 0,
});

/**
 * Load ratings for an amended routing key from one or more answer directories.
 *
 * A (response, judge) rating is USED only if the key lists that judge for that response and the batch it
 * came from is the batch the key's provenance names (original batch for `original`, reroute batch for
 * `rerouted-excluded-judge` / `requoted`). Everything used is validated in full (verbatim quote, integer
 * rating, shape). A rating is IGNORED only if the key says so: its judge is in `excluded_judges`, or the key
 * marks that pair `requoted` and the rating came from the original batch. Any other rating is an error.
 */
export function loadRoutedAnswers({ routingKey, dirs, responsesById }) {
  const errors = [];
  const batches = new Map(routingKey.batches.map((b) => [b.batch_id, b]));
  const excluded = new Set(routingKey.excluded_judges);
  const wantSource = new Map(); // pair -> "original" | "reroute"
  const requotedPairs = new Set();
  for (const r of routingKey.responses) {
    for (const j of r.judges) {
      const p = r.judge_provenance[j];
      const pair = `${r.response_id}|${j}`;
      const src = r.rating_source?.[j] ?? defaultRatingSource(p);
      wantSource.set(pair, src);
      // "Requoted" if provenance says so, or if the rating now comes from a later round than provenance implies.
      if (p === "requoted" || src !== defaultRatingSource(p)) requotedPairs.add(pair);
    }
  }

  const claimed = new Map();
  const files = [];
  for (const dir of dirs) {
    for (const f of readdirSync(dir).filter((x) => x.endsWith(".json") && x !== "answer-schema.json").sort()) files.push([dir, f]);
  }

  const used = [];
  const ignored = [];
  const judgeStats = {};
  for (const [dir, f] of files) {
    const label = `${path.basename(dir)}/${f}`;
    let parsed;
    try {
      parsed = readAnswerFile(dir, f);
    } catch (e) {
      if (e instanceof HarnessError) {
        errors.push(e.message);
        continue;
      }
      throw e;
    }
    const batchKey = batches.get(parsed && parsed.batch_id);
    if (!batchKey) {
      errors.push(`${label}: batch_id ${JSON.stringify(parsed && parsed.batch_id)} is not a batch of the routing key`);
      continue;
    }
    if (claimed.has(batchKey.batch_id)) {
      errors.push(`${label}: batch ${batchKey.batch_id} is already answered by ${claimed.get(batchKey.batch_id)}`);
      continue;
    }
    claimed.set(batchKey.batch_id, label);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed) || !Array.isArray(parsed.ratings)) {
      errors.push(`${label}: must be an object with a \`ratings\` array`);
      continue;
    }

    const facts = describeAnswerFile(parsed, batchKey, responsesById);
    if (batchKey.source === "original") {
      const s = (judgeStats[batchKey.judge] ??= emptyJudgeStats());
      s.batches += 1;
      s.entries_expected += batchKey.response_ids.length;
      s.ratings_returned += facts.byId.size;
      s.dropped += facts.dropped.length;
      s.unknown_or_duplicate += facts.unknownOrDuplicate;
      for (const v of facts.byId.values()) {
        if (!v.verbatim) s.quote_not_verbatim += 1;
        if (v.nearMiss) s.of_which_normalisation_only_near_miss += 1;
      }
    }

    // classify every returned rating
    const useIds = new Set();
    for (const r of parsed.ratings) {
      const id = r && r.response_id;
      if (typeof id !== "string" || !batchKey.response_ids.includes(id)) {
        errors.push(`${label}: rating for response_id ${JSON.stringify(id)} which is not in this batch`);
        continue;
      }
      const pair = `${id}|${batchKey.judge}`;
      if (wantSource.get(pair) === batchKey.source) useIds.add(id);
      else if (batchKey.source === "original" && excluded.has(batchKey.judge)) ignored.push({ response_id: id, judge: batchKey.judge, reason: "excluded-judge" });
      else if (requotedPairs.has(pair)) ignored.push({ response_id: id, judge: batchKey.judge, reason: "superseded-by-requote" });
      else errors.push(`${label}: rating by ${batchKey.judge} for ${id} is not accounted for by the routing key (not a routed pair, not an excluded judge, not a requoted pair)`);
    }
    const expectedHere = batchKey.response_ids.filter((id) => wantSource.get(`${id}|${batchKey.judge}`) === batchKey.source);
    if (expectedHere.length === 0) continue; // nothing in this batch is used
    const extraKeys = Object.keys(parsed).filter((k) => !FILE_KEYS.has(k));
    for (const k of extraKeys) errors.push(`${label}: unexpected top-level key "${k}"`);
    const subset = { batch_id: parsed.batch_id, ratings: parsed.ratings.filter((r) => r && useIds.has(r.response_id)) };
    const v = validateJudgeAnswers(subset, { ...batchKey, response_ids: expectedHere }, responsesById, `${label} (judge ${batchKey.judge}, ${batchKey.source})`);
    errors.push(...v.errors);
    used.push(...v.ratings.map((r) => ({ ...r, source: batchKey.source })));
  }

  for (const b of routingKey.batches) {
    if (claimed.has(b.batch_id)) continue;
    const needed = b.response_ids.some((id) => wantSource.get(`${id}|${b.judge}`) === b.source);
    if (needed) errors.push(`no answer file for batch ${b.batch_id} (judge ${b.judge}, ${b.source})`);
  }
  return { errors, ratings: used, ignored, judgeStats };
}
