// research/model-runs/lib/assemble.mjs
//
// Step 4: unblind via the keys and hand everything to cb-probe's scorer, one scored run per subject.
// NO SCORING ARITHMETIC LIVES HERE. The composite, band, dimension means, intervals and judge_panel are
// all produced by tools/cb-probe/lib (startScoredRun / recordItemRating / runExposureProbe /
// finishScoredRun -> buildSelfRunScorecard -> computeCompositeFromDimensions). This file orders data,
// calls those functions, and refuses on any inconsistency.
//
// HOW A 2-JUDGE PANEL IS REPRESENTED (read computeJudgePanel, scored-run.mjs):
//   cb-probe has one rating row per (item, trial_index), capped at trials_per_item, and judge_panel
//   groups an item's rows by judge_label. So a panel run is opened with trials = trials x judges and
//   every (response, judge) rating is one row, labelled with that judge. Item means, dimension means
//   and the composite are then the means over all rating rows, which -- because every response has
//   exactly two judges -- weights every response equally. What the scorer cannot represent is the
//   response as the unit of replication; the scorer_representation_caveat in provenance.mjs records that, and
//   the audit file carries the response-level mapping the scorer's row indices cannot.
//
// TWO PHASES, because the scorer will not finish a run without the subject's own exposure probe:
//   phase 1 (no assembly-state.json): validate all judge answers, record all ratings, write state, issue
//            each subject's probe brief, and STOP (status "awaiting-probe") unless probe answers exist.
//   phase 2 (state exists):          validate probe answers, complete the probes, finish, write scorecards.

import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import { startScoredRun, recordItemRating, runExposureProbe, finishScoredRun } from "../../../tools/cb-probe/lib/scored-run.mjs";
import { listRunTrials, readRunFile } from "../../../tools/cb-probe/lib/scored-run-store.mjs";
import { validateSelfRunScorecard } from "../../../tools/cb-probe/lib/validate-scorecard.mjs";
import { computeCompositeFromDimensions } from "../../../tools/cb-probe/lib/canonical.mjs";
import { ToolError } from "../../../tools/cb-probe/lib/tools.mjs";
import { assertSafeWriteRoot } from "../../../tools/cb-probe/lib/session-store.mjs";

import { JUDGES_PER_RESPONSE, HarnessError, refuse, readJson, writeJson, writeText, sha256 } from "./common.mjs";
import { loadJudgeAnswers, loadRoutedAnswers } from "./judge-answers.mjs";
import { validateRoutingKey } from "./reroute.mjs";
import { buildProbeBrief, validateProbeAnswers } from "./probe.mjs";
import {
  subjectProvenanceLabel,
  panelProvenanceLabel,
  provenanceNote,
  PROVENANCE_REQUIRED_FRAGMENTS,
  crossRequiredFragments,
} from "./provenance.mjs";
import { assertValidityFresh } from "./judge-validity.mjs";
import { bridgeDrift } from "./bridge.mjs";
import { checkRouting } from "./judge-routing.mjs";

export const EXIT_AWAITING_PROBE = 3;

export function loadInputs(keysDir, routingFile = null) {
  const subjectKey = readJson(path.join(keysDir, "subject-brief-key.json"));
  const originalKeyFile = path.join(keysDir, "judge-key.json");
  const originalKey = readJson(originalKeyFile);
  // With --routing, the amended key (validated against the original) replaces the original routing; the
  // original file is only read. Without it nothing changes.
  let judgeKey = routingFile ? validateRoutingKey(readJson(routingFile), originalKey) : originalKey;
  // The explicit-judge-set fields (pilot-2026-10-02) live in the original key; an amended key does not copy them.
  if (routingFile) {
    for (const f of ["judges", "family_of", "bridge", "validity_required"]) {
      if (originalKey[f] !== undefined && judgeKey[f] === undefined) judgeKey = { ...judgeKey, [f]: originalKey[f] };
    }
  }
  const ingested = readJson(path.join(keysDir, "ingested", "answers.json"));
  if (subjectKey.run_id !== judgeKey.run_id || subjectKey.run_id !== ingested.run_id) {
    refuse(`keys disagree on run_id: subject key ${subjectKey.run_id}, judge key ${judgeKey.run_id}, ingested ${ingested.run_id}`);
  }
  const text = new Map(ingested.responses.map((r) => [`${r.subject}|${r.trial}|${r.item_id}`, r]));
  const responsesById = new Map();
  for (const k of judgeKey.responses) {
    const rec = text.get(`${k.subject}|${k.trial}|${k.item_id}`);
    if (!rec) refuse(`response ${k.response_id} (${k.subject} trial ${k.trial} ${k.item_id}) is missing from the ingested answers`);
    if (sha256(rec.response) !== k.response_sha256) {
      refuse(`response ${k.response_id}: ingested text no longer matches the hash recorded when the judge batches were built`);
    }
    responsesById.set(k.response_id, { ...k, response: rec.response });
  }
  if (responsesById.size !== ingested.responses.length) {
    refuse(`judge key covers ${responsesById.size} responses but ${ingested.responses.length} were ingested`);
  }
  return { subjectKey, judgeKey, originalKeyFile, ingested, responsesById };
}

/** Bridge replies by their opaque id, with the text the judges saw (key-only; never in `responsesById`). */
export function bridgeTexts(judgeKey) {
  const entries = judgeKey.bridge?.entries ?? [];
  const ids = new Set(judgeKey.responses.map((r) => r.response_id));
  const map = new Map();
  for (const b of entries) {
    if (ids.has(b.response_id)) refuse(`bridge reply ${b.response_id} is also a scored response; bridge replies must never be scored`);
    if (sha256(b.response) !== b.response_sha256) refuse(`bridge reply ${b.response_id}: stored text does not match its hash`);
    map.set(b.response_id, { ...b });
  }
  return map;
}

/** Build the ordered rating rows for one subject: by item, then subject trial, then judge label. */
export function buildSubjectRows({ subject, subjectKey, responsesById, ratingsByPair }) {
  const byCell = new Map();
  for (const r of responsesById.values()) if (r.subject === subject) byCell.set(`${r.item_id}|${r.trial}`, r);
  const rows = [];
  for (const itemId of [...subjectKey.served_item_ids].sort()) {
    let k = 0;
    for (let trial = 1; trial <= subjectKey.trials_per_item; trial += 1) {
      const resp = byCell.get(`${itemId}|${trial}`);
      if (!resp) refuse(`no response for ${subject} trial ${trial} item ${itemId}`);
      if (resp.judges.length !== JUDGES_PER_RESPONSE || new Set(resp.judges).size !== JUDGES_PER_RESPONSE) {
        refuse(`response ${resp.response_id} is not routed to exactly ${JUDGES_PER_RESPONSE} distinct judges`);
      }
      if (resp.judges.includes(subject)) refuse(`response ${resp.response_id} is routed to its own subject model ${subject}`);
      for (const judge of [...resp.judges].sort()) {
        const rating = ratingsByPair.get(`${resp.response_id}|${judge}`);
        if (!rating) refuse(`no rating from ${judge} for response ${resp.response_id}`);
        k += 1;
        rows.push({
          item_id: itemId,
          scorer_trial_index: k,
          response_id: resp.response_id,
          subject_trial: trial,
          judge,
          judge_provenance: resp.judge_provenance?.[judge] ?? "original",
          rating_1_5: rating.rating_1_5,
          anchor_matched: rating.anchor_matched,
          evidence_quote: rating.evidence_quote,
          response_text: resp.response,
        });
      }
    }
  }
  return rows;
}

/** Descriptive paired-judge agreement for the audit file. Not part of, and never fed into, any score. */
export function pairedAgreement(rows) {
  const byResp = new Map();
  for (const r of rows) {
    if (!byResp.has(r.response_id)) byResp.set(r.response_id, []);
    byResp.get(r.response_id).push(r.rating_1_5);
  }
  const diffs = [...byResp.values()].map((v) => Math.abs(v[0] - v[1]));
  const n = diffs.length;
  return {
    note: "Descriptive only: within-response disagreement between the two judges. Not an input to any score.",
    responses: n,
    exact_agreement: n ? diffs.filter((d) => d === 0).length / n : null,
    mean_absolute_difference: n ? diffs.reduce((a, b) => a + b, 0) / n : null,
    responses_differing_by_2_or_more: diffs.filter((d) => d >= 2).length,
  };
}

function attribute(error, entries, rows) {
  const m = /ratings\[(\d+)\]/.exec(error.message);
  if (!m) return error.message;
  const row = rows[Number(m[1])];
  return row
    ? `response ${row.response_id}, judge ${row.judge} (${entries[Number(m[1])].item_id}): ${error.message}`
    : error.message;
}

/** Per-subject routing record for the audit: judge pairs, rerouted/requoted counts. Descriptive only. */
export function routingAuditForSubject(rows) {
  const judgesByResp = new Map();
  const prov = { original: 0, "rerouted-excluded-judge": 0, requoted: 0 };
  for (const r of rows) {
    if (!judgesByResp.has(r.response_id)) judgesByResp.set(r.response_id, []);
    judgesByResp.get(r.response_id).push(r.judge);
    prov[r.judge_provenance ?? "original"] += 1;
  }
  const pairs = {};
  for (const j of judgesByResp.values()) {
    const k = j.slice().sort().join(" + ");
    pairs[k] = (pairs[k] ?? 0) + 1;
  }
  return {
    responses: judgesByResp.size,
    responses_by_judge_pair: pairs,
    ratings_by_provenance: prov,
    ratings_rerouted: prov["rerouted-excluded-judge"],
    ratings_requoted: prov.requoted,
  };
}

export function assembleRun({ keysDir, ratingsDir = null, ratingsDirs = null, routingFile = null, artifactRoot, outDir, probeAnswersDir = null, bank, validityFile = null, log = () => {} }) {
  const dirs = ratingsDirs ?? (ratingsDir ? [ratingsDir] : []);
  for (const d of dirs) if (!existsSync(d)) refuse(`--ratings directory ${d} does not exist`);
  if (!routingFile && dirs.length > 1) refuse("more than one --ratings directory is only accepted together with --routing (the amended key says which ratings count)");
  const { subjectKey, judgeKey, originalKeyFile, responsesById } = loadInputs(keysDir, routingFile);
  const runId = subjectKey.run_id;
  // Explicit-judge-set runs (pilot-2026-10-02): `judges` is in the key. First-pilot keys have none and take the old paths.
  const explicitJudges = Array.isArray(judgeKey.judges);
  const cross = explicitJudges
    ? {
        tier: subjectKey.access_tier,
        snapshot: "model build pinned by digest (keys/subject-brief-key.json snapshot_id)",
        judgeFamilies: [...new Set(judgeKey.judges.map((j) => judgeKey.family_of[j]))].sort(),
      }
    : null;
  const bridgeById = explicitJudges ? bridgeTexts(judgeKey) : null;
  const root = assertSafeWriteRoot(artifactRoot);
  const ctx = { bank, artifactRoot: root, runs: new Map(), sessions: new Map() };
  const stateFile = path.join(keysDir, "assembly-state.json");

  let state = existsSync(stateFile) ? readJson(stateFile) : null;
  if (state && path.resolve(state.artifact_root) !== path.resolve(root)) {
    refuse(`assembly-state.json was written for artifact root ${state.artifact_root}; this run used ${root}. Use the same --artifact-root.`);
  }

  // ---------------- phase 1: validate everything, record everything, or record nothing -------------
  if (!state) {
    if (dirs.length === 0) refuse("--ratings is required for the first assembly pass");
    // Section 5: the judge validity measurement comes BEFORE any composite. Absent or stale -> refuse, record nothing.
    if (judgeKey.validity_required) {
      assertValidityFresh({
        validityFile,
        keysDir,
        originalKeyText: readFileSync(originalKeyFile, "utf8"),
        ratingsDirs: dirs,
        routingKey: routingFile ? judgeKey : null,
        runId,
      });
    }
    if (explicitJudges) {
      // The family rule, re-checked on the key the scorer rows will be built from.
      const resp = judgeKey.responses;
      const problems = checkRouting({ responses: resp, routes: resp.map((r) => r.judges), judges: judgeKey.judges, familyOf: judgeKey.family_of });
      if (problems.length > 0) refuse(`routing breaks the family rule:\n  ${problems.slice(0, 8).join("\n  ")}`);
    }
    const { errors, ratings, ignored, judgeStats, bridgeRatings } = routingFile
      ? loadRoutedAnswers({ routingKey: judgeKey, dirs, responsesById, bridgeById })
      : { ...loadJudgeAnswers({ judgeKey, ratingsDir: dirs[0], responsesById, bridgeById }), ignored: [], judgeStats: null };
    if (errors.length > 0) {
      throw new HarnessError(`REFUSED: judge answers are invalid (${errors.length} problem(s)); nothing was recorded:\n  ${errors.join("\n  ")}`);
    }
    const ratingsByPair = new Map(ratings.map((r) => [`${r.response_id}|${r.judge}`, r]));
    // Exactly the routed pairs, nothing else.
    const expectedPairs = judgeKey.responses.flatMap((r) => r.judges.map((j) => `${r.response_id}|${j}`));
    if (expectedPairs.length !== ratingsByPair.size || !expectedPairs.every((p) => ratingsByPair.has(p))) {
      refuse("rating set does not equal the routed (response, judge) pairs");
    }

    const runs = {};
    const problems = [];
    const subjectRows = {};
    for (const subject of subjectKey.subjects) {
      const rows = buildSubjectRows({ subject, subjectKey, responsesById, ratingsByPair });
      const entries = rows.map((r) => ({
        item_id: r.item_id,
        response_text: r.response_text,
        rating_1_5: r.rating_1_5,
        anchor_matched: r.anchor_matched,
        evidence_quote: r.evidence_quote,
        judge_label: r.judge,
      }));
      const started = startScoredRun(
        {
          subject_label: subjectProvenanceLabel(subject, runId, cross),
          judge_label: panelProvenanceLabel(cross),
          judgeConfiguration: "panel",
          trials: subjectKey.trials_per_item * JUDGES_PER_RESPONSE,
          seed: subjectKey.master_seed,
        },
        ctx
      );
      const opened = ctx.runs.get(started.run_id).item_ids.slice().sort();
      const served = subjectKey.served_item_ids.slice().sort();
      if (opened.length !== served.length || opened.some((id, i) => id !== served[i])) {
        refuse(
          `the scorer opened a run over ${opened.length} items but the briefs served ${served.length}: the serving rule has drifted ` +
            "between cb-probe and this harness. Not recording anything for this subject."
        );
      }
      try {
        recordItemRating({ run_id: started.run_id, ratings: entries }, ctx);
      } catch (e) {
        if (e instanceof ToolError) {
          problems.push(`${subject}: ${attribute(e, entries, rows)}`);
          continue;
        }
        throw e;
      }
      // Read back and confirm the scorer's row (item, trial_index) is the row this harness intended.
      for (const t of listRunTrials(root, started.run_id)) {
        const want = rows.find((r) => r.item_id === t.item_id && r.scorer_trial_index === t.trial_index);
        if (!want || want.judge !== t.judge_label || want.rating_1_5 !== t.rating_1_5) {
          refuse(`scorer row ${t.item_id}#${t.trial_index} does not match the intended (judge, rating); aborting`);
        }
      }
      runs[subject] = started.run_id;
      subjectRows[subject] = rows.map(({ response_text, evidence_quote, anchor_matched, ...keep }) => keep);
    }
    if (problems.length > 0) {
      throw new HarnessError(
        `REFUSED: cb-probe rejected ${problems.length} subject batch(es); no state was saved and nothing was written to ${outDir}:\n  ${problems.join("\n  ")}`
      );
    }
    state = {
      kind: "assembly-state",
      run_id: runId,
      artifact_root: root,
      created_at: new Date().toISOString(),
      scorer_runs: runs,
      rows: subjectRows,
      routing: routingFile
        ? {
            routing_key_file: path.resolve(routingFile),
            excluded_judges: judgeKey.excluded_judges,
            exclusion_record: judgeKey.exclusion_record,
            ignored_ratings: {
              count: ignored.length,
              by_reason: ignored.reduce((a, x) => ({ ...a, [x.reason]: (a[x.reason] ?? 0) + 1 }), {}),
            },
            original_answer_judge_stats: judgeStats,
          }
        : null,
    };
    writeJson(stateFile, state);
    if (bridgeById && bridgeById.size > 0) {
      // Descriptive only. Computed from ratings that were split off before any scorer row was built.
      writeJson(path.join(outDir, "bridge-drift.json"), {
        run_id: runId,
        ...bridgeDrift({ bridgeEntries: [...bridgeById.values()], bridgeRatings, excludedJudges: judgeKey.excluded_judges ?? [] }),
      });
    }
    log(`recorded ${Object.values(subjectRows).reduce((a, r) => a + r.length, 0)} rating rows across ${subjectKey.subjects.length} scorer runs`);
  }

  // ---------------- phase 2: probes, finish, write -------------------------------------------------
  const probeDir = path.join(outDir, "probe-briefs");
  const challenges = {};
  for (const subject of subjectKey.subjects) {
    const sid = state.scorer_runs[subject];
    if (!sid) refuse(`assembly-state.json has no scorer run for ${subject}`);
    const issued = runExposureProbe({ run_id: sid }, ctx);
    challenges[subject] = issued;
    if (issued.phase === "challenge") {
      const { brief, markdown } = buildProbeBrief({ challenge: issued, probeId: sid, bank });
      writeJson(path.join(probeDir, `${subject}.probe.json`), brief);
      writeText(path.join(probeDir, `${subject}.probe.md`), `${markdown}\n`);
    }
  }

  const needAnswers = subjectKey.subjects.filter((s) => challenges[s].phase === "challenge");
  const answers = {};
  if (needAnswers.length > 0) {
    const problems = [];
    const missing = [];
    for (const s of needAnswers) {
      const file = probeAnswersDir ? path.join(probeAnswersDir, `${s}.probe-answers.json`) : null;
      if (!file || !existsSync(file)) {
        missing.push(s);
        continue;
      }
      const v = validateProbeAnswers(readFileSync(file, "utf8"), challenges[s], state.scorer_runs[s], `${s}.probe-answers.json`);
      if (v.errors.length > 0) problems.push(...v.errors);
      else answers[s] = v;
    }
    if (problems.length > 0) throw new HarnessError(`REFUSED: probe answers are invalid:\n  ${problems.join("\n  ")}`);
    if (missing.length > 0) {
      return {
        status: "awaiting-probe",
        run_id: runId,
        missing_probe_answers: missing,
        probe_briefs_dir: probeDir,
        expected_answer_file: "<probe-answers-dir>/<subject>.probe-answers.json",
      };
    }
  }

  const results = [];
  for (const subject of subjectKey.subjects) {
    const sid = state.scorer_runs[subject];
    if (answers[subject]) {
      try {
        runExposureProbe(
          { run_id: sid, recall_attempts: answers[subject].recall_attempts, identification_answers: answers[subject].identification_answers },
          ctx
        );
      } catch (e) {
        if (e instanceof ToolError) throw new HarnessError(`REFUSED: ${subject}: cb-probe rejected the probe answers: ${e.message}`);
        throw e;
      }
    }
    let scorecard;
    try {
      scorecard = finishScoredRun({ run_id: sid }, ctx);
    } catch (e) {
      if (e instanceof ToolError) throw new HarnessError(`REFUSED: ${subject}: cb-probe refused to finish the run: ${e.message}`);
      throw e;
    }

    // Independent checks on the artifact the scorer produced.
    const verdict = validateSelfRunScorecard(scorecard);
    if (!verdict.valid) refuse(`${subject}: scorecard fails validateSelfRunScorecard: ${verdict.errors.join("; ")}`);
    if (scorecard.official !== false || scorecard.comparability !== "none") refuse(`${subject}: scorecard is not official:false / comparability:none`);
    const prov = `${scorecard.provenance.subject_label} || ${scorecard.provenance.judge_label}`;
    for (const frag of cross ? crossRequiredFragments(cross) : PROVENANCE_REQUIRED_FRAGMENTS) {
      if (!prov.includes(frag)) refuse(`${subject}: provenance does not state "${frag}"`);
    }
    if (scorecard.composite !== null) {
      const again = computeCompositeFromDimensions(scorecard.dimensions);
      if (again.composite !== scorecard.composite || again.band !== scorecard.band) {
        refuse(`${subject}: scorecard composite does not equal computeCompositeFromDimensions(dimensions)`);
      }
    }

    const stored = readRunFile(root, sid, "scorecard.json");
    const scorecardPath = path.join(outDir, `${subject}.scorecard.json`);
    writeJson(scorecardPath, stored ?? scorecard);
    const rows = state.rows[subject];
    writeJson(path.join(outDir, `${subject}.assembly-audit.json`), {
      kind: "assembly-audit",
      run_id: runId,
      subject,
      scorer_run_id: sid,
      provenance_note: provenanceNote({
        subject,
        runId,
        judges: state.routing || explicitJudges ? [...new Set(rows.map((r) => r.judge))].sort() : subjectKey.subjects.filter((s) => s !== subject),
        cross,
      }),
      bank_version: subjectKey.bank_version,
      bank_sha256: subjectKey.bank_sha256 ?? null,
      served_items: subjectKey.served_item_ids.length,
      excluded_items: subjectKey.excluded_items,
      paired_judge_agreement: pairedAgreement(rows),
      judge_routing: {
        ...routingAuditForSubject(rows),
        judge_exclusion: state.routing ?? null,
      },
      contamination_indicated: scorecard.contamination.contamination_indicated,
      row_mapping: rows,
    });
    results.push({ subject, scorer_run_id: sid, scorecard_path: scorecardPath, composite: scorecard.composite, band: scorecard.band });
  }
  return { status: "complete", run_id: runId, results };
}

export function listFiles(dir) {
  return existsSync(dir) ? readdirSync(dir).sort() : [];
}
