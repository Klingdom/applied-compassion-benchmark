// research/model-runs/lib/supplement.mjs
//
// `reroute-judges --supplement`: find the ratings that are CURRENTLY USED under the latest amended key but that
// cb-probe would refuse, and plan to re-ask exactly those of the same judge. A rating is requote-eligible when
//   (a) its quote is not a verbatim substring of the response (the harness rule), OR
//   (b) cb-probe's own per-rating validation rejects it (see probe-validate.mjs: the rule is cb-probe's, not ours).
// "Currently used" means: for each (response, judge) in the amended key, the rating in the batch that key names as
// its source. Ratings of excluded judges and ratings already superseded by a requote are therefore never looked at.
// Pure reading: no key, batch or answer is written here.

import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { refuse, parseJsonLenient } from "./common.mjs";
import { isVerbatimSubstring } from "./judge-answers.mjs";
import { cbProbeRejections } from "./probe-validate.mjs";
import { defaultRatingSource } from "./reroute.mjs";

/** batch_id -> {parsed, label}, across every directory. A batch answered twice refuses. */
export function indexAnswerDirs(dirs) {
  const byBatch = new Map();
  for (const dir of dirs) {
    for (const f of readdirSync(dir).filter((x) => x.endsWith(".json") && x !== "answer-schema.json").sort()) {
      const parsed = parseJsonLenient(readFileSync(path.join(dir, f), "utf8"), f);
      const id = parsed && parsed.batch_id;
      if (byBatch.has(id)) refuse(`${path.basename(dir)}/${f}: batch ${id} is answered by more than one file (${byBatch.get(id).label})`);
      byBatch.set(id, { parsed, label: `${path.basename(dir)}/${f}` });
    }
  }
  return byBatch;
}

/**
 * @returns {{selected: object[], sourceByPair: Map<string,string>, inspected: number}}
 */
export function planSupplement({ currentKey, responsesById, answerDirs, bank, seed, scratchDir }) {
  const answers = indexAnswerDirs(answerDirs);
  const sourceByPair = new Map();
  const candidates = [];
  const facts = new Map();
  for (const r of currentKey.responses) {
    for (const judge of r.judges) {
      const pair = `${r.response_id}|${judge}`;
      const source = r.rating_source?.[judge] ?? defaultRatingSource(r.judge_provenance[judge]);
      sourceByPair.set(pair, source);
      const owning = currentKey.batches.filter((b) => b.source === source && b.judge === judge && b.response_ids.includes(r.response_id));
      if (owning.length !== 1) refuse(`${pair}: expected exactly one ${source} batch holding this pair, found ${owning.length}`);
      const file = answers.get(owning[0].batch_id);
      if (!file) refuse(`no answer file for batch ${owning[0].batch_id} (judge ${judge}, ${source}); every answered round must be supplied before a supplement`);
      const matches = (Array.isArray(file.parsed.ratings) ? file.parsed.ratings : []).filter((x) => x && x.response_id === r.response_id);
      if (matches.length !== 1) refuse(`${file.label}: expected exactly one rating for ${r.response_id}, found ${matches.length}`);
      const rating = matches[0];
      const text = responsesById.get(r.response_id)?.response;
      const verbatim = typeof rating.evidence_quote === "string" && isVerbatimSubstring(text, rating.evidence_quote);
      facts.set(pair, { source, batch_id: owning[0].batch_id, verbatim });
      candidates.push({
        key: pair,
        item_id: r.item_id,
        response_text: text,
        rating_1_5: rating.rating_1_5,
        anchor_matched: rating.anchor_matched,
        evidence_quote: rating.evidence_quote,
        judge_label: judge,
      });
    }
  }
  const rejections = cbProbeRejections({ bank, seed, scratchDir, candidates });
  const selected = [];
  for (const c of candidates) {
    const f = facts.get(c.key);
    const probeError = rejections.get(c.key);
    if (f.verbatim && !probeError) continue;
    const [response_id, judge] = c.key.split("|");
    selected.push({
      response_id,
      judge,
      from_source: f.source,
      from_batch_id: f.batch_id,
      reason: probeError ?? "evidence_quote is not a verbatim substring of the response (harness quote-grounding rule)",
    });
  }
  return { selected, sourceByPair, inspected: candidates.length };
}
