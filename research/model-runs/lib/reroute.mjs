// research/model-runs/lib/reroute.mjs
//
// Judge exclusion and re-routing. A post-hoc protocol change (disclosed in the run record) that removes one
// model from the JUDGE role while leaving it a SUBJECT. Nothing here weakens a check:
//   - a response never goes to its own subject, to the excluded judge, or to the same judge twice;
//   - every response must end with exactly JUDGES_PER_RESPONSE distinct judges;
//   - the replacement judge must be UNIQUE (fail closed otherwise);
//   - the evidence_quote rule stays "verbatim substring" -- there is no normalisation anywhere that can
//     make a rating acceptable (normalisation exists only to COUNT near-misses for the audit record).
// The original judge-key.json and the original answer files are read, never written.

import { JUDGES_PER_RESPONSE, refuse, sha256, mulberry32, seedFromString, idFactory, shuffle } from "./common.mjs";
import { JUDGE_ANSWER_SCHEMA, judgeInstructions, buildEntry, renderBatchMarkdown, assertBatchesBlind } from "./judge-batches.mjs";

/** Where a (response, judge) rating is read from: judge-answers/ | judge-answers-reroute/ | judge-answers-reroute-2/. */
export const RATING_SOURCES = Object.freeze(["original", "reroute", "reroute-2"]);

/** The batch source implied by provenance alone (keys written before `rating_source` existed). */
export const defaultRatingSource = (provenance) => (provenance === "original" ? "original" : "reroute");

export const PROVENANCE = Object.freeze({
  ORIGINAL: "original",
  REROUTED: "rerouted-excluded-judge",
  REQUOTED: "requoted",
});

/**
 * Pure routing step. For each response return its final judges and the provenance of each judge slot.
 * @param {{response_id: string, subject: string, judges: string[]}[]} responses
 * @param {string[]} allJudges
 * @param {string} excludedJudge
 * @returns {{response_id: string, judges: string[], judge_provenance: Record<string,string>}[]}
 */
export function rerouteJudges(responses, allJudges, excludedJudge) {
  if (!allJudges.includes(excludedJudge)) {
    refuse(`--exclude-judge ${JSON.stringify(excludedJudge)} is not one of the run's judges (${allJudges.join(", ")})`);
  }
  return responses.map((r) => {
    const current = r.judges;
    if (!Array.isArray(current) || current.length !== JUDGES_PER_RESPONSE || new Set(current).size !== JUDGES_PER_RESPONSE) {
      refuse(`response ${r.response_id} is not routed to exactly ${JUDGES_PER_RESPONSE} distinct judges in the original key`);
    }
    if (current.includes(r.subject)) refuse(`response ${r.response_id} is routed to its own subject ${r.subject} in the original key`);
    if (!current.includes(excludedJudge)) {
      return {
        response_id: r.response_id,
        judges: current.slice().sort(),
        judge_provenance: Object.fromEntries(current.map((j) => [j, PROVENANCE.ORIGINAL])),
      };
    }
    const others = current.filter((j) => j !== excludedJudge);
    const candidates = allJudges.filter((j) => j !== excludedJudge && j !== r.subject && !others.includes(j));
    if (candidates.length !== 1) {
      refuse(
        `response ${r.response_id}: expected exactly one eligible replacement judge, found ${candidates.length} ` +
          `(${candidates.join(", ") || "none"}). Failing closed.`
      );
    }
    const judges = [...others, candidates[0]].sort();
    const provenance = Object.fromEntries(others.map((j) => [j, PROVENANCE.ORIGINAL]));
    provenance[candidates[0]] = PROVENANCE.REROUTED;
    return { response_id: r.response_id, judges, judge_provenance: provenance };
  });
}

/** Mark ratings that must be re-asked of the same judge. `needsQuote` is a Set of `${response_id}|${judge}`. */
export function applyRequotes(routed, needsQuote) {
  const byId = new Map(routed.map((r) => [r.response_id, r]));
  for (const k of needsQuote) {
    const [rid, j] = k.split("|");
    const r = byId.get(rid);
    if (!r || !r.judges.includes(j)) refuse(`requote requested for ${k}, which is not a final (response, judge) pair`);
  }
  let n = 0;
  const out = routed.map((r) => {
    const prov = { ...r.judge_provenance };
    for (const j of r.judges) {
      if (needsQuote.has(`${r.response_id}|${j}`)) {
        if (prov[j] !== PROVENANCE.ORIGINAL) refuse(`response ${r.response_id}: ${j} is already ${prov[j]}; cannot requote it`);
        prov[j] = PROVENANCE.REQUOTED;
        n += 1;
      }
    }
    return { ...r, judge_provenance: prov };
  });
  return { routed: out, requoted: n };
}

/** Group assignments (response_id, judge) per judge, and cut them into small batches under a byte cap. */
export function buildRerouteBatches({ bank, key, ingested, assignments, seed, runId, batchSize, maxBytes, existingBatchIds, namePrefix = "reroute" }) {
  if (!Number.isInteger(batchSize) || batchSize < 1 || batchSize > 8) {
    refuse("--batch-size for a reroute must be an integer from 1 to 8 (small batches are deliberate)");
  }
  // The default prefix keeps the original round's ids reproducible; any other prefix salts the id stream.
  const rng = mulberry32(seedFromString(namePrefix === "reroute" ? `reroute:${seed}:${runId}` : `${namePrefix}:${seed}:${runId}`));
  const nextBatchId = idFactory(rng, "jb-", 8);
  const items = new Map(bank.items.map((i) => [i.id, i]));
  const keyById = new Map(key.responses.map((r) => [r.response_id, r]));
  const text = new Map(ingested.responses.map((r) => [`${r.subject}|${r.trial}|${r.item_id}`, r]));

  const byJudge = new Map();
  for (const a of assignments) {
    if (!byJudge.has(a.judge)) byJudge.set(a.judge, []);
    byJudge.get(a.judge).push(a.response_id);
  }
  const batches = [];
  for (const judge of [...byJudge.keys()].sort()) {
    const ids = shuffle(byJudge.get(judge), rng);
    const entryOf = (id) => {
      const k = keyById.get(id);
      const rec = k && text.get(`${k.subject}|${k.trial}|${k.item_id}`);
      const item = k && items.get(k.item_id);
      if (!rec || !item) refuse(`cannot rebuild entry for ${id}`);
      if (sha256(rec.response) !== k.response_sha256) refuse(`response ${id}: ingested text no longer matches its recorded hash`);
      return buildEntry(item, { response_id: id, response: rec.response });
    };
    const entries = ids.map(entryOf);
    const slice = (n) => {
      const base = Math.floor(entries.length / n);
      const extra = entries.length % n;
      const out = [];
      let cursor = 0;
      for (let b = 0; b < n; b += 1) {
        const take = base + (b < extra ? 1 : 0);
        out.push(entries.slice(cursor, cursor + take));
        cursor += take;
      }
      return out;
    };
    const render = (es) => {
      const b = { batch_id: "jb-00000000", instructions: judgeInstructions(), answer_schema: JUDGE_ANSWER_SCHEMA, entries: es };
      return Buffer.byteLength(renderBatchMarkdown(b), "utf8");
    };
    let n = Math.max(1, Math.ceil(entries.length / batchSize));
    let parts = slice(n);
    while (Math.max(...parts.map(render)) > maxBytes && n < entries.length) {
      n += 1;
      parts = slice(n);
    }
    if (Math.max(...parts.map(render)) > maxBytes) refuse(`a single-entry reroute batch for ${judge} exceeds ${maxBytes} bytes`);
    parts.forEach((es, i) => {
      const batch = { batch_id: nextBatchId(), instructions: judgeInstructions(), answer_schema: JUDGE_ANSWER_SCHEMA, entries: es };
      if (existingBatchIds.has(batch.batch_id)) refuse(`reroute batch id ${batch.batch_id} collides with an existing batch id`);
      const base = `${judge}__${namePrefix}-${String(i + 1).padStart(2, "0")}`;
      const markdown = renderBatchMarkdown(batch);
      batches.push({ judge, base, batch, markdown, bytes: Buffer.byteLength(markdown, "utf8") });
    });
  }
  assertBatchesBlind({ batches, subjects: key.subjects, runId, records: key.responses });
  return batches;
}

/** Amended routing key. Never overwrites the original; records final judges and provenance per response. */
export function buildRoutingKey({ originalKey, originalKeyText, routed, excludedJudge, reason, requote, rerouteBatches, seed, batchSize, stats }) {
  const byId = new Map(routed.map((r) => [r.response_id, r]));
  const responses = originalKey.responses.map((r) => {
    const x = byId.get(r.response_id);
    return { ...r, judges: x.judges, judge_provenance: x.judge_provenance };
  });
  const count = (p) => responses.reduce((a, r) => a + Object.values(r.judge_provenance).filter((v) => v === p).length, 0);
  return {
    kind: "judge-routing-key-amended",
    run_id: originalKey.run_id,
    source_key: { file: "judge-key.json", sha256: sha256(originalKeyText) },
    excluded_judges: [excludedJudge],
    exclusion_record: {
      role: "judge only; the model remains a subject",
      reason,
      disclosure: "post-hoc protocol change triggered by the harness's pre-existing quote-grounding check, not by scores",
      measured_original_answer_stats: stats,
    },
    requote,
    seed,
    reroute_batch_size: batchSize,
    subjects: originalKey.subjects,
    judges_per_response: originalKey.judges_per_response,
    summary: {
      responses: responses.length,
      ratings_original: count(PROVENANCE.ORIGINAL),
      ratings_rerouted: count(PROVENANCE.REROUTED),
      ratings_requoted: count(PROVENANCE.REQUOTED),
    },
    responses,
    batches: [
      ...originalKey.batches.map((b) => ({ ...b, source: "original" })),
      ...rerouteBatches.map(({ batch, judge, base }) => ({
        batch_id: batch.batch_id,
        judge,
        files: [`${base}.json`, `${base}.md`],
        response_ids: batch.entries.map((e) => e.response_id),
        source: "reroute",
      })),
    ],
  };
}

/** Consistency of an amended key against the original. Used by assemble-run; refuses on anything off. */
export function validateRoutingKey(routing, original) {
  const bad = (m) => refuse(`routing key: ${m}`);
  if (routing.kind !== "judge-routing-key-amended") bad(`kind is ${JSON.stringify(routing.kind)}`);
  if (routing.run_id !== original.run_id) bad(`run_id ${routing.run_id} != original ${original.run_id}`);
  if (!Array.isArray(routing.excluded_judges)) bad("excluded_judges must be an array");
  const excluded = new Set(routing.excluded_judges);
  const orig = new Map(original.responses.map((r) => [r.response_id, r]));
  if (routing.responses.length !== orig.size || new Set(routing.responses.map((r) => r.response_id)).size !== orig.size) {
    bad("response set differs from the original key");
  }
  for (const r of routing.responses) {
    const o = orig.get(r.response_id);
    if (!o) bad(`unknown response ${r.response_id}`);
    for (const f of ["subject", "trial", "item_id", "brief_id", "code", "response_sha256"]) {
      if (r[f] !== o[f]) bad(`response ${r.response_id}: ${f} differs from the original key`);
    }
    if (!Array.isArray(r.judges) || r.judges.length !== JUDGES_PER_RESPONSE || new Set(r.judges).size !== JUDGES_PER_RESPONSE) {
      bad(`response ${r.response_id} does not have exactly ${JUDGES_PER_RESPONSE} distinct judges`);
    }
    const prov = r.judge_provenance ?? {};
    if (Object.keys(prov).sort().join() !== r.judges.slice().sort().join()) bad(`response ${r.response_id}: judge_provenance keys differ from judges`);
    for (const j of r.judges) {
      if (j === r.subject) bad(`response ${r.response_id} is routed to its own subject ${j}`);
      if (excluded.has(j)) bad(`response ${r.response_id} is routed to excluded judge ${j}`);
      const p = prov[j];
      if (!Object.values(PROVENANCE).includes(p)) bad(`response ${r.response_id}: unknown provenance ${JSON.stringify(p)} for ${j}`);
      if ((p === PROVENANCE.ORIGINAL || p === PROVENANCE.REQUOTED) && !o.judges.includes(j)) {
        bad(`response ${r.response_id}: ${j} is marked ${p} but was not an original judge`);
      }
      if (p === PROVENANCE.REROUTED && o.judges.includes(j)) bad(`response ${r.response_id}: ${j} marked rerouted but was an original judge`);
    }
    const lost = o.judges.filter((j) => !r.judges.includes(j));
    const rerouted = r.judges.filter((j) => prov[j] === PROVENANCE.REROUTED);
    if (lost.length !== rerouted.length || lost.some((j) => !excluded.has(j))) {
      bad(`response ${r.response_id}: original judge(s) ${lost.join(",") || "-"} were dropped but are not all excluded judges / do not match the rerouted slots`);
    }
  }
  const ids = new Set(routing.batches.map((b) => b.batch_id));
  if (ids.size !== routing.batches.length) bad("duplicate batch_id");
  for (const b of routing.batches) {
    if (!RATING_SOURCES.includes(b.source)) bad(`batch ${b.batch_id} has unknown source`);
    if (b.source !== "original" && excluded.has(b.judge)) bad(`${b.source} batch ${b.batch_id} belongs to excluded judge ${b.judge}`);
  }
  // Optional explicit per-pair source (written by --supplement). Each named source must be backed by exactly one batch.
  for (const r of routing.responses) {
    if (r.rating_source === undefined) continue;
    if (!r.rating_source || Object.keys(r.rating_source).sort().join() !== r.judges.slice().sort().join()) {
      bad(`response ${r.response_id}: rating_source keys differ from judges`);
    }
    for (const j of r.judges) {
      const src = r.rating_source[j];
      if (!RATING_SOURCES.includes(src)) bad(`response ${r.response_id}: unknown rating_source ${JSON.stringify(src)} for ${j}`);
      if (r.judge_provenance[j] === PROVENANCE.ORIGINAL && src !== "original") bad(`response ${r.response_id}: ${j} is original provenance but rating_source ${src}`);
      const backing = routing.batches.filter((b) => b.source === src && b.judge === j && b.response_ids.includes(r.response_id));
      if (backing.length !== 1) bad(`response ${r.response_id}: rating_source ${src} for ${j} is backed by ${backing.length} batches, expected exactly 1`);
    }
  }
  return routing;
}

/**
 * Incremental amended key for `--supplement`: the previous amended key plus new requotes. `selected` is
 * [{response_id, judge, reason, from_source, from_batch_id}]. Provenance becomes `requoted` only where the slot was
 * `original`; a rerouted (or already requoted) slot keeps its provenance and records the new batch through
 * `rating_source`. Nothing is edited in place: the previous key is only read.
 */
export function buildSupplementKey({ previousKey, previousKeyFile, previousKeyText, selected, supplementBatches, seed, batchSize, reason, sourceByPair }) {
  const sel = new Map(selected.map((s) => [`${s.response_id}|${s.judge}`, s]));
  const batched = new Set();
  for (const { batch, judge } of supplementBatches) for (const e of batch.entries) batched.add(`${e.response_id}|${judge}`);
  for (const k of sel.keys()) if (!batched.has(k)) refuse(`selected rating ${k} has no supplement batch`);
  const responses = previousKey.responses.map((r) => {
    const prov = { ...r.judge_provenance };
    const src = {};
    const reasons = { ...(r.requote_reasons ?? {}) };
    for (const j of r.judges) {
      const pair = `${r.response_id}|${j}`;
      src[j] = sel.has(pair) ? "reroute-2" : sourceByPair.get(pair);
      if (sel.has(pair)) {
        if (prov[j] === PROVENANCE.ORIGINAL) prov[j] = PROVENANCE.REQUOTED;
        reasons[j] = [...(reasons[j] ?? []), { round: "reroute-2", reason: sel.get(pair).reason }];
      }
    }
    const out = { ...r, judge_provenance: prov, rating_source: src };
    if (Object.keys(reasons).length > 0) out.requote_reasons = reasons;
    return out;
  });
  const count = (p) => responses.reduce((a, r) => a + Object.values(r.judge_provenance).filter((v) => v === p).length, 0);
  return {
    ...previousKey,
    previous_key: { file: previousKeyFile, sha256: sha256(previousKeyText) },
    supplements: [
      ...(previousKey.supplements ?? []),
      {
        round: "reroute-2",
        reason,
        seed,
        batch_size: batchSize,
        selected: selected.map((s) => ({ response_id: s.response_id, judge: s.judge, from_source: s.from_source, from_batch_id: s.from_batch_id, reason: s.reason })),
      },
    ],
    summary: {
      ...previousKey.summary,
      ratings_original: count(PROVENANCE.ORIGINAL),
      ratings_rerouted: count(PROVENANCE.REROUTED),
      ratings_requoted: count(PROVENANCE.REQUOTED),
      ratings_requoted_in_supplements: (previousKey.summary?.ratings_requoted_in_supplements ?? 0) + selected.length,
    },
    responses,
    batches: [
      ...previousKey.batches,
      ...supplementBatches.map(({ batch, judge, base }) => ({
        batch_id: batch.batch_id,
        judge,
        files: [`${base}.json`, `${base}.md`],
        response_ids: batch.entries.map((e) => e.response_id),
        source: "reroute-2",
      })),
    ],
  };
}
