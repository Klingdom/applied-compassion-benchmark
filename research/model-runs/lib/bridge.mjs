// research/model-runs/lib/bridge.mjs
//
// The bridge sample (PREREGISTRATION.md section 6, descriptive only): first-pilot replies that are rated again,
// by the same judge(s), inside this run's judge batches, so that judge drift between sessions can be described.
//
// Nothing here can reach a composite:
//   - bridge entries live in the judge key under `bridge`, never under `responses`;
//   - the assembler builds scorer rows from `responses` only and demands that the rated pairs equal the routed
//     pairs of `responses` exactly, so a bridge rating has nowhere to go (tests/judging-prep.test.mjs proves it).

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { readJson, refuse, sha256, mulberry32, seedFromString, shuffle } from "./common.mjs";

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

  const pool = [];
  for (const subject of [...sourceKey.subjects].sort()) {
    const auditFile = path.join(sourceRoot, "scorecards", `${subject}.assembly-audit.json`);
    if (!existsSync(auditFile)) refuse(`bridge: ${auditFile} does not exist`);
    const audit = JSON.parse(readFileSync(auditFile, "utf8"));
    if (audit.subject !== subject) refuse(`bridge: ${auditFile} is for ${audit.subject}, not ${subject}`);
    const ratings = new Map();
    for (const row of audit.row_mapping) {
      const key = byId.get(row.response_id);
      if (!key || key.subject !== subject || key.item_id !== row.item_id || key.trial !== row.subject_trial) {
        refuse(`bridge: audit row for ${row.response_id} does not match the first pilot's key`);
      }
      if (!ratings.has(row.response_id)) ratings.set(row.response_id, {});
      ratings.get(row.response_id)[row.judge] = row.rating_1_5;
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
