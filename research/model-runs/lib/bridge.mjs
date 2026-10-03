// research/model-runs/lib/bridge.mjs
//
// The bridge sample (PREREGISTRATION.md section 6, descriptive only): first-pilot replies that are rated again,
// by the same judge(s), inside this run's judge batches, so that judge drift between sessions can be described.
//
// Nothing here can reach a composite:
//   - bridge entries live in the judge key under `bridge`, never under `responses`;
//   - the assembler builds scorer rows from `responses` only and demands that the rated pairs equal the routed
//     pairs of `responses` exactly, so a bridge rating has nowhere to go (tests/judging-prep.test.mjs proves it).

import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { readJson, refuse, sha256, mulberry32, seedFromString, shuffle } from "./common.mjs";
import { loadRoutedAnswers } from "./judge-answers.mjs";
import { validateRoutingKey } from "./reroute.mjs";

/**
 * The source run's final used ratings from its routed judge answers: the amended key (`sourceKeyRel`, validated
 * against the run's original judge key) plus every judge-answers / judge-answers-reroute* directory of the run.
 * Any validation error refuses; nothing is guessed. Ratings the source run itself made on ITS bridge replies are
 * validated by the loader and are never returned (they are not final ratings of scored replies).
 */
export function loadSourceRatingsFromRoutedAnswers({ sourceRoot, sourceKeyRel, sourceKey }) {
  if (sourceKey.kind !== "judge-routing-key-amended") {
    refuse(`bridge: ${sourceKeyRel} is not an amended routing key and ${sourceRoot} has no assembly audits; cannot find the final ratings`);
  }
  const keysDir = path.join(sourceRoot, "keys");
  const originalKey = readJson(path.join(keysDir, "judge-key.json"));
  const routingKey = validateRoutingKey(sourceKey, originalKey);
  const bridgeById = new Map();
  for (const b of originalKey.bridge?.entries ?? []) bridgeById.set(b.response_id, { ...b });
  const ingested = readJson(path.join(keysDir, "ingested", "answers.json"));
  const text = new Map(ingested.responses.map((r) => [`${r.subject}|${r.trial}|${r.item_id}`, r]));
  const responsesById = new Map();
  for (const k of routingKey.responses) {
    const rec = text.get(`${k.subject}|${k.trial}|${k.item_id}`);
    if (!rec || sha256(rec.response) !== k.response_sha256) {
      refuse(`bridge: source reply ${k.response_id} is missing from, or no longer matches, its ingested text`);
    }
    responsesById.set(k.response_id, { ...k, response: rec.response });
  }
  const dirs = readdirSync(sourceRoot, { withFileTypes: true })
    .filter((d) => d.isDirectory() && /^judge-answers(-reroute(-\d+)?)?$/.test(d.name))
    .map((d) => path.join(sourceRoot, d.name))
    .sort();
  if (dirs.length === 0) refuse(`bridge: ${sourceRoot} has neither assembly audits nor judge-answers directories`);
  const loaded = loadRoutedAnswers({ routingKey, dirs, responsesById, bridgeById });
  if (loaded.errors.length > 0) {
    refuse(`bridge: the source run's judge answers did not validate (${loaded.errors.length}): ${loaded.errors.slice(0, 3).join("; ")}`);
  }
  return loaded.ratings;
}

/**
 * Every first-pilot reply that was rated, in the first pilot's FINAL used ratings, by at least one judge in `runJudges`.
 * Original ratings come from the first pilot's assembly audits (row_mapping = the ratings that entered its composites).
 */
export function loadBridgePool({ sourceRoot, sourceKeyRel, runJudges, currentBankSha }) {
  const sourceSubjectKey = readJson(path.join(sourceRoot, "keys", "subject-brief-key.json"));
  if (sourceSubjectKey.bank_sha256 !== currentBankSha) {
    refuse(
      `bridge: the first pilot's bank (${sourceSubjectKey.bank_sha256}) is not the bank in use (${currentBankSha}); ` +
        "original ratings were made against different anchors, so they cannot be compared."
    );
  }
  const sourceKey = readJson(path.join(sourceRoot, sourceKeyRel));
  const ingested = readJson(path.join(sourceRoot, "keys", "ingested", "answers.json"));
  const text = new Map(ingested.responses.map((r) => [`${r.subject}|${r.trial}|${r.item_id}`, r]));
  const byId = new Map(sourceKey.responses.map((r) => [r.response_id, r]));
  const judgeSet = new Set(runJudges);

  // Where the source run's FINAL ratings come from:
  //   - its per-subject assembly audits (row_mapping) when every subject has one (runs finished by assemble-run);
  //   - otherwise its routed judge answers (runs finished through the MCP driver have no audit; their final ratings
  //     are the amended key's routed answers, read with the same loader the assembler and analyze-pilot use).
  // Audits win when present, so a run that has them is read exactly as before.
  const subjects = [...sourceKey.subjects].sort();
  const auditFileOf = (s) => path.join(sourceRoot, "scorecards", `${s}.assembly-audit.json`);
  const haveAudits = subjects.every((s) => existsSync(auditFileOf(s)));
  const routedRatings = haveAudits ? null : loadSourceRatingsFromRoutedAnswers({ sourceRoot, sourceKeyRel, sourceKey });

  const pool = [];
  for (const subject of subjects) {
    const ratings = new Map();
    if (haveAudits) {
      const auditFile = auditFileOf(subject);
      const audit = JSON.parse(readFileSync(auditFile, "utf8"));
      if (audit.subject !== subject) refuse(`bridge: ${auditFile} is for ${audit.subject}, not ${subject}`);
      for (const row of audit.row_mapping) {
        const key = byId.get(row.response_id);
        if (!key || key.subject !== subject || key.item_id !== row.item_id || key.trial !== row.subject_trial) {
          refuse(`bridge: audit row for ${row.response_id} does not match the first pilot's key`);
        }
        if (!ratings.has(row.response_id)) ratings.set(row.response_id, {});
        ratings.get(row.response_id)[row.judge] = row.rating_1_5;
      }
    } else {
      for (const r of routedRatings) {
        const key = byId.get(r.response_id);
        if (!key) refuse(`bridge: routed rating for ${r.response_id} does not match the source run's key`);
        if (key.subject !== subject) continue;
        if (!ratings.has(r.response_id)) ratings.set(r.response_id, {});
        ratings.get(r.response_id)[r.judge] = r.rating_1_5;
      }
    }
    for (const [responseId, all] of ratings) {
      const key = byId.get(responseId);
      const original_ratings = Object.fromEntries(Object.entries(all).filter(([j]) => judgeSet.has(j)).sort(([a], [b]) => a.localeCompare(b)));
      if (Object.keys(original_ratings).length === 0) continue; // rated only by judges that are not judges here
      const rec = text.get(`${subject}|${key.trial}|${key.item_id}`);
      if (!rec || sha256(rec.response) !== key.response_sha256) {
        refuse(`bridge: first-pilot reply ${responseId} is missing from, or no longer matches, its ingested text`);
      }
      pool.push({
        source_run: path.basename(sourceRoot),
        source_response_id: responseId,
        source_subject: subject,
        trial: key.trial,
        item_id: key.item_id,
        brief_id: key.brief_id,
        code: key.code,
        response: rec.response,
        response_sha256: key.response_sha256,
        original_ratings,
        original_all_judges: Object.keys(all).sort(),
      });
    }
  }
  return pool;
}

/**
 * Seeded draw: `perSourceSubject` per first-pilot subject. Each subject's draw uses its own generator seeded from
 * (seed, subject), over a pool sorted by (item, trial), so it depends on nothing but the pool and the seed.
 */
export function drawBridge({ pool, seed, perSourceSubject, expectedTotal }) {
  const subjects = [...new Set(pool.map((p) => p.source_subject))].sort();
  const drawn = [];
  for (const subject of subjects) {
    const eligible = pool
      .filter((p) => p.source_subject === subject)
      .sort((a, b) => a.item_id.localeCompare(b.item_id) || a.trial - b.trial);
    if (eligible.length < perSourceSubject) refuse(`bridge: only ${eligible.length} eligible replies for ${subject}, need ${perSourceSubject}`);
    const rng = mulberry32(seedFromString(`bridge:${seed}:${subject}`));
    drawn.push(...shuffle(eligible, rng).slice(0, perSourceSubject));
  }
  drawn.sort((a, b) => a.source_subject.localeCompare(b.source_subject) || a.item_id.localeCompare(b.item_id) || a.trial - b.trial);
  if (expectedTotal !== undefined && drawn.length !== expectedTotal) {
    refuse(`bridge: drew ${drawn.length} replies, the pre-registration says ${expectedTotal}`);
  }
  return drawn;
}

/** Descriptive drift: |new - original| per (bridge reply, judge). Never an input to any score. */
export function bridgeDrift({ bridgeEntries, bridgeRatings, excludedJudges = [] }) {
  const excluded = new Set(excludedJudges);
  const newBy = new Map(bridgeRatings.map((r) => [`${r.response_id}|${r.judge}`, r.rating_1_5]));
  const diffs = [];
  const perJudge = {};
  let ignored = 0;
  for (const e of bridgeEntries) {
    for (const j of e.judges) {
      if (excluded.has(j)) {
        ignored += 1;
        continue;
      }
      const now = newBy.get(`${e.response_id}|${j}`);
      if (now === undefined) refuse(`bridge: no new rating by ${j} for bridge reply ${e.response_id}`);
      const d = Math.abs(now - e.original_ratings[j]);
      diffs.push(d);
      (perJudge[j] ??= []).push(d);
    }
  }
  const summarise = (xs) => ({
    pairs: xs.length,
    mean_abs_difference: xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null,
    max_abs_difference: xs.length ? Math.max(...xs) : null,
    exact_match: xs.filter((d) => d === 0).length,
  });
  return {
    kind: "bridge-drift",
    note: "Descriptive only (PREREGISTRATION.md section 6). Bridge ratings are not in any composite of either run.",
    overall: summarise(diffs),
    per_judge: Object.fromEntries(Object.entries(perJudge).sort(([a], [b]) => a.localeCompare(b)).map(([j, xs]) => [j, summarise(xs)])),
    ratings_of_excluded_judges_ignored: ignored,
  };
}
