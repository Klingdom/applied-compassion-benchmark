// Judging-stage preparation for pilot-2026-10-02: explicit judge set, family rule, balance, bridge sample,
// judge validity measurement, and the assembly gate. SYNTHETIC bank, FAKE replies, FAKE ratings. No model, no network.
// Every guard has a planted negative control proving the detector fires.

import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { mulberry32, sha256, bankSha256, servedItems, exclusionRule, HarnessError } from "../lib/common.mjs";
import { parseJudgingConfig } from "../lib/judging-config.mjs";
import { routeToJudgeSet, checkRouting, routingStats, eligibleJudges } from "../lib/judge-routing.mjs";
import { loadBridgePool, drawBridge } from "../lib/bridge.mjs";
import { buildJudgeBatches, assertBatchesBlind, renderBatchMarkdown } from "../lib/judge-batches.mjs";
import { rerouteJudges } from "../lib/reroute.mjs";
import { judgeVerdict, isQuoteFound, buildValidityReport, quoteLength, assertValidityFresh } from "../lib/judge-validity.mjs";
import {
  makeSyntheticBank,
  tmp,
  cleanup,
  writeJsonFile,
  readJsonFile,
  runBin,
  listJson,
  fakeReply,
  writeFakeJudgeAnswers,
  writeFakeProbeAnswers,
  FAKE_QUOTE,
} from "./helpers.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const REAL_RUN = path.resolve(here, "..", "pilot-2026-10-02");

const JUDGES = ["claude-fable", "claude-opus", "claude-sonnet"];
const SUBJ = ["qwen-x", "llama-y"];
const FAMILY = { "claude-fable": "claude", "claude-opus": "claude", "claude-sonnet": "claude", "qwen-x": "qwen", "llama-y": "llama" };
const RUN = "judging-e2e";

// ---------------------------------------------------------------------------
// Config: read from run-config.json, tied to the pre-registration text
// ---------------------------------------------------------------------------
test("the real run-config.json judging block parses, is disjoint, excludes haiku, and agrees with PREREGISTRATION.md", () => {
  const config = readJsonFile(path.join(REAL_RUN, "run-config.json"));
  const prereg = readFileSync(path.join(REAL_RUN, "PREREGISTRATION.md"), "utf8");
  const j = parseJudgingConfig(config);
  assert.deepEqual(j.judges, ["claude-fable", "claude-opus", "claude-sonnet"]);
  assert.ok(!j.judges.includes("claude-haiku"), "haiku is not a judge (pre-registered)");
  for (const s of j.subjects) assert.ok(!j.judges.includes(s));
  for (const label of j.judges) assert.ok(prereg.includes(`\`${label}\``), `${label} not named in section 4`);
  assert.match(prereg, /`claude-haiku` is \*\*not\*\* a judge/);
  assert.equal(j.maxBatchEntries, 16);
  assert.match(prereg, /at most 16 entries/);
  assert.equal(j.validity.maxUnfoundPercent, 5);
  assert.ok(prereg.includes("5.0%"), "the 5.0% threshold is in section 5");
  assert.equal(j.validity.shortQuoteMinChars, 12);
  assert.ok(prereg.includes("under 12 characters"));
  assert.equal(j.bridge.seed, 20261002);
  assert.ok(prereg.includes("seed 20261002"));
  assert.equal(j.bridge.total, 24);
  assert.equal(j.bridge.perSourceSubject * 4, 24);
  assert.match(prereg, /\*\*24\*\* first-pilot replies: 6 per first-pilot subject/);
  assert.equal(j.judgesPerResponse, 2);
  assert.match(prereg, /\*\*2 of the 3 judges\*\*/);
  // the threshold is not typed in code
  for (const f of ["lib/judge-validity.mjs", "bin/judge-validity.mjs", "lib/assemble.mjs"]) {
    const src = readFileSync(path.resolve(here, "..", f), "utf8");
    assert.ok(!/5\.0\b|=\s*0\.05\b/.test(src.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "")), `${f} hard-codes the threshold`);
  }
});

test("config refusals: overlap of subjects and judges, missing family, too few eligible judges, bad validity block", () => {
  const good = () => structuredClone(readJsonFile(path.join(REAL_RUN, "run-config.json")));
  let c = good();
  c.judges.push({ label: c.subjects[0].label, family: "x" });
  assert.throws(() => parseJudgingConfig(c), /disjoint/);
  c = good();
  delete c.subjects[0].family;
  assert.throws(() => parseJudgingConfig(c), /family missing/);
  c = good();
  c.subjects[0].family = "claude"; // every judge now shares its family: 0 eligible
  assert.throws(() => parseJudgingConfig(c), /outside its family/);
  c = good();
  c.judge_validity.max_unfound_quote_rate_percent = "5";
  assert.throws(() => parseJudgingConfig(c), /max_unfound_quote_rate_percent/);
  c = good();
  c.judges_per_response = 3;
  assert.throws(() => parseJudgingConfig(c), /judges_per_response/);
});

// ---------------------------------------------------------------------------
// Routing: disjoint sets, family rule (property), balance
// ---------------------------------------------------------------------------
const cells = (subjects, items, trials) => {
  const out = [];
  for (const s of subjects) for (let i = 0; i < items; i += 1) for (let t = 0; t < trials; t += 1) out.push({ subject: s, item_id: `I-${i}` });
  return out;
};

test("PROPERTY: routing uses only the judge set, never a subject, never a same-family judge, exactly 2 distinct judges", () => {
  let checked = 0;
  for (let seed = 1; seed <= 40; seed += 1) {
    for (const [items, trials] of [[1, 1], [3, 3], [24, 3], [83, 3], [7, 4]]) {
      const responses = cells(SUBJ, items, trials);
      const routes = routeToJudgeSet(responses, { judges: JUDGES, familyOf: FAMILY }, mulberry32(seed));
      assert.deepEqual(checkRouting({ responses, routes, judges: JUDGES, familyOf: FAMILY }), []);
      routes.forEach((r, i) => {
        assert.equal(r.length, 2);
        assert.equal(new Set(r).size, 2);
        for (const j of r) {
          assert.ok(JUDGES.includes(j));
          assert.ok(!SUBJ.includes(j));
          assert.notEqual(FAMILY[j], FAMILY[responses[i].subject]);
        }
        checked += 1;
      });
    }
  }
  assert.ok(checked > 10000);
});

test("family rule with a mixed judge set: a judge of the subject's family is never used, and too few eligible judges refuses", () => {
  const family = { ...FAMILY, "qwen-judge": "qwen", "other-judge": "other" };
  const judges = [...JUDGES, "qwen-judge", "other-judge"];
  assert.deepEqual(eligibleJudges({ subject: "qwen-x", judges, familyOf: family }).sort(), [...JUDGES, "other-judge"].sort());
  const responses = cells(["qwen-x"], 30, 3);
  const routes = routeToJudgeSet(responses, { judges, familyOf: family }, mulberry32(5));
  assert.ok(routes.every((r) => !r.includes("qwen-judge")), "same-family judge was used");
  // a claude subject against an all-claude panel: nobody eligible -> refuse (fail closed)
  const claudeSubject = { ...FAMILY, "claude-subj": "claude" };
  assert.throws(() => routeToJudgeSet([{ subject: "claude-subj", item_id: "I-0" }], { judges: JUDGES, familyOf: claudeSubject }, mulberry32(1)), /eligible judge/);
  // an unknown family fails closed
  assert.throws(() => routeToJudgeSet([{ subject: "mystery", item_id: "I-0" }], { judges: JUDGES, familyOf: FAMILY }, mulberry32(1)), /no family recorded/);
});

test("NEGATIVE CONTROL: checkRouting flags a same-family judge, the subject itself, a duplicate, an outsider and a wrong count", () => {
  const responses = [{ subject: "qwen-x", item_id: "I-0" }];
  const run = (route, familyOf = FAMILY, judges = JUDGES) => checkRouting({ responses, routes: [route], judges, familyOf });
  assert.deepEqual(run(["claude-fable", "claude-opus"]), []);
  assert.match(run(["claude-fable", "claude-opus"], { ...FAMILY, "claude-opus": "qwen" }).join(), /same family/);
  assert.match(run(["claude-fable", "qwen-x"], FAMILY, [...JUDGES, "qwen-x"]).join(), /own subject/);
  assert.match(run(["claude-fable", "claude-fable"]).join(), /duplicate/);
  assert.match(run(["claude-fable", "gpt-z"], { ...FAMILY, "gpt-z": "gpt" }).join(), /not in the judge set/);
  assert.match(run(["claude-fable"]).join(), /not 2 judges/);
});

const spread = (obj) => {
  const v = Object.values(obj);
  return Math.max(...v) - Math.min(...v);
};

test("BALANCE (full design): 2 subjects x 83 items x 3 trials -> per-subject judge load equal, every pair used equally, every item uses each pair twice", () => {
  for (let seed = 1; seed <= 12; seed += 1) {
    const responses = cells(SUBJ, 83, 3);
    const routes = routeToJudgeSet(responses, { judges: JUDGES, familyOf: FAMILY }, mulberry32(seed));
    const st = routingStats({ responses, routes });
    for (const s of SUBJ) {
      assert.ok(spread(st.perSubjectJudge[s]) <= 1, `${s}: ${JSON.stringify(st.perSubjectJudge[s])}`);
      assert.ok(spread(st.perSubjectPair[s]) <= 1);
      assert.equal(Object.keys(st.perSubjectPair[s]).length, 3, "all three pairs are used");
    }
    assert.ok(spread(st.pairs) <= 1);
    for (const [item, p] of Object.entries(st.perItemPair)) {
      assert.deepEqual(Object.values(p).sort(), [2, 2, 2], `${item}: ${JSON.stringify(p)}`);
    }
  }
});

test("PROPERTY (ragged data, partial runs): per-subject judge load stays within 1 of equal whatever the cell sizes", () => {
  for (let seed = 1; seed <= 60; seed += 1) {
    const rng = mulberry32(seed * 7919);
    const responses = [];
    for (const s of SUBJ) {
      const items = 1 + Math.floor(rng() * 40);
      for (let i = 0; i < items; i += 1) for (let t = 0, n = 1 + Math.floor(rng() * 5); t < n; t += 1) responses.push({ subject: s, item_id: `I-${i}` });
    }
    const routes = routeToJudgeSet(responses, { judges: JUDGES, familyOf: FAMILY }, mulberry32(seed));
    const st = routingStats({ responses, routes });
    for (const s of Object.keys(st.perSubjectJudge)) {
      for (const j of JUDGES) st.perSubjectJudge[s][j] ??= 0;
      assert.ok(spread(st.perSubjectJudge[s]) <= 1, `seed ${seed} ${s}: ${JSON.stringify(st.perSubjectJudge[s])}`);
    }
  }
});

test("NEGATIVE CONTROL: the balance measure fires on a routing that sends everything to one pair", () => {
  const responses = cells(SUBJ, 30, 3);
  const routes = responses.map(() => ["claude-fable", "claude-opus"]);
  const st = routingStats({ responses, routes });
  st.perSubjectJudge[SUBJ[0]]["claude-sonnet"] ??= 0;
  assert.ok(spread(st.perSubjectJudge[SUBJ[0]]) > 1, "a skewed routing must be detectable by the same measure the property tests use");
  for (const p of ["claude-fable+claude-sonnet", "claude-opus+claude-sonnet"]) st.pairs[p] ??= 0;
  assert.ok(spread(st.pairs) > 1);
});

// ---------------------------------------------------------------------------
// Fixtures: a synthetic first pilot (bridge source) and a synthetic run root
// ---------------------------------------------------------------------------
const SRC_SUBJECTS = ["claude-fable", "claude-haiku", "claude-opus", "claude-sonnet"];

/** Four source subjects x 3 trials x every served item. Some replies were rated ONLY by claude-haiku (not a judge here). */
function makeSourceRun(dir, bank, bankSha) {
  const items = servedItems(bank).map((i) => i.id);
  const responses = [];
  const ingested = [];
  const rows = Object.fromEntries(SRC_SUBJECTS.map((s) => [s, []]));
  const haikuOnly = new Set();
  let n = 0;
  for (const subject of SRC_SUBJECTS) {
    for (let trial = 1; trial <= 3; trial += 1) {
      items.forEach((item, idx) => {
        n += 1;
        const response_id = `src-${subject}-${trial}-${item}`;
        const code = `q-src-${n}`;
        const brief_id = `b-src-${subject}-${trial}`;
        const text = fakeReply(brief_id, code);
        responses.push({ response_id, subject, trial, item_id: item, brief_id, code, response_sha256: sha256(text) });
        ingested.push({ subject, trial, brief_id, code, item_id: item, response: text });
        const others = SRC_SUBJECTS.filter((s) => s !== subject);
        let judges = others.filter((_, k) => k !== (n % 3));
        if (idx < 2 && trial === 1) {
          judges = ["claude-haiku"]; // planted: rated only by a non-judge
          if (subject === "claude-haiku") judges = ["claude-fable"];
          else haikuOnly.add(response_id);
        }
        for (const judge of judges) rows[subject].push({ item_id: item, scorer_trial_index: 1, response_id, subject_trial: trial, judge, judge_provenance: "original", rating_1_5: 1 + ((n + judge.length) % 5) });
      });
    }
  }
  writeJsonFile(path.join(dir, "keys", "subject-brief-key.json"), { bank_sha256: bankSha, subjects: SRC_SUBJECTS });
  writeJsonFile(path.join(dir, "keys", "judge-key.reroute-2.json"), { subjects: SRC_SUBJECTS, responses });
  writeJsonFile(path.join(dir, "keys", "ingested", "answers.json"), { responses: ingested });
  for (const s of SRC_SUBJECTS) writeJsonFile(path.join(dir, "scorecards", `${s}.assembly-audit.json`), { subject: s, row_mapping: rows[s] });
  return { haikuOnly };
}

function makeRun(t, { suffix = "" } = {}) {
  const base = tmp();
  t.after(() => cleanup(base));
  const bank = makeSyntheticBank();
  const bankFile = path.join(base, "bank.json");
  writeJsonFile(bankFile, bank);
  const bankSha = bankSha256(bankFile);
  const srcRoot = path.join(base, "src-run");
  const { haikuOnly } = makeSourceRun(srcRoot, bank, bankSha);
  const root = path.join(base, "run");
  const config = {
    run_id: RUN,
    trials: 3,
    max_retries: 2,
    master_seed: 20261002,
    subjects: SUBJ.map((label) => ({ label, tag: `${label}:1`, digest: "a".repeat(64), family: FAMILY[label], identity_terms: [`as ${label.split("-")[0]}`] })),
    judges: JUDGES.map((label) => ({ label, family: "claude" })),
    judges_per_response: 2,
    max_batch_entries: 16,
    judge_validity: { max_unfound_quote_rate_percent: 5.0, short_quote_min_chars: 12 },
    bridge: { source_run: "src-run", source_key: "keys/judge-key.reroute-2.json", seed: 20261002, per_source_subject: 6, total: 24 },
  };
  writeJsonFile(path.join(root, "run-config.json"), config);
  const served = servedItems(bank).map((i) => i.id);
  writeJsonFile(path.join(root, "keys", "subject-brief-key.json"), {
    kind: "subject-brief-key",
    run_id: RUN,
    master_seed: config.master_seed,
    bank_version: bank.meta.bankVersion,
    bank_sha256: bankSha,
    served_item_ids: served,
    excluded_items: exclusionRule(bank),
    subjects: SUBJ,
    trials_per_item: 3,
    access_tier: "local-open-weight (test)",
    snapshot_id: Object.fromEntries(SUBJ.map((s) => [s, `${s}:1@sha256:${"a".repeat(64)}`])),
    briefs: [],
  });
  const responses = [];
  let n = 0;
  for (const subject of SUBJ) {
    for (let trial = 1; trial <= 3; trial += 1) {
      for (const item of served) {
        n += 1;
        const brief_id = `b-${subject}-${trial}`;
        const code = `q-${n}`;
        const response = fakeReply(brief_id, code);
        responses.push({ subject, trial, brief_id, code, item_id: item, response, response_sha256: sha256(response) });
      }
    }
  }
  writeJsonFile(path.join(root, "keys", "ingested", "answers.json"), { kind: "ingested-subject-answers", run_id: RUN, count: responses.length, responses });
  return { base, bank, bankFile, bankSha, srcRoot, root, config, haikuOnly, responses, served, art: path.join(base, `artifacts${suffix}`) };
}

const common = (f) => ["--run-id", RUN, "--run-root", f.root, "--bank", f.bankFile];
const buildArgs = (f, extra = []) => [...common(f), "--out", path.join(f.root, "judge-batches"), "--bridge-root", f.srcRoot, ...extra];

function bridgePool(f, judges = JUDGES) {
  return loadBridgePool({ sourceRoot: f.srcRoot, sourceKeyRel: "keys/judge-key.reroute-2.json", runJudges: judges, currentBankSha: f.bankSha });
}

// ---------------------------------------------------------------------------
// Bridge draw
// ---------------------------------------------------------------------------
test("BRIDGE: 24 replies, 6 per first-pilot subject, only replies rated by a judge of this run, routed to the original judge(s); deterministic", (t) => {
  const f = makeRun(t);
  const pool = bridgePool(f);
  const a = drawBridge({ pool, seed: 20261002, perSourceSubject: 6, expectedTotal: 24 });
  const b = drawBridge({ pool: [...pool].reverse(), seed: 20261002, perSourceSubject: 6, expectedTotal: 24 });
  assert.deepEqual(a.map((x) => x.source_response_id), b.map((x) => x.source_response_id), "the draw must not depend on pool order");
  assert.equal(a.length, 24);
  for (const s of SRC_SUBJECTS) assert.equal(a.filter((x) => x.source_subject === s).length, 6);
  for (const x of a) {
    assert.ok(!f.haikuOnly.has(x.source_response_id), "a reply rated only by a non-judge was drawn");
    const judges = Object.keys(x.original_ratings);
    assert.ok(judges.length >= 1 && judges.every((j) => JUDGES.includes(j)), "only this run's judges are kept");
    assert.ok(!judges.includes(x.source_subject), "never routed to the reply's own source subject");
  }
  const other = drawBridge({ pool, seed: 20261003, perSourceSubject: 6, expectedTotal: 24 });
  assert.notDeepEqual(other.map((x) => x.source_response_id), a.map((x) => x.source_response_id), "a different seed gives a different draw");
  // the pool honours "rated by at least one judge here" exactly: haiku-only replies are absent, others present
  const ids = new Set(pool.map((p) => p.source_response_id));
  for (const h of f.haikuOnly) assert.ok(!ids.has(h));
  // replies that two of this run's judges rated keep BOTH judges
  assert.ok(pool.some((p) => Object.keys(p.original_ratings).length === 2));
  // NEGATIVE CONTROL: with claude-haiku wrongly treated as one of this run's judges, the haiku-only replies DO enter the pool,
  // so it is the judge-set filter, and nothing else, that keeps them out above.
  const wrong = new Set(bridgePool(f, [...JUDGES, "claude-haiku"]).map((p) => p.source_response_id));
  assert.ok([...f.haikuOnly].every((h) => wrong.has(h)));
  // wrong expected total and a too-small pool both refuse
  assert.throws(() => drawBridge({ pool, seed: 1, perSourceSubject: 6, expectedTotal: 25 }), /pre-registration says 25/);
  assert.throws(() => drawBridge({ pool: pool.slice(0, 3), seed: 1, perSourceSubject: 6 }), /need 6/);
});

test("BRIDGE: refuses when the first pilot's bank is not the bank in use", (t) => {
  const f = makeRun(t);
  assert.throws(() => loadBridgePool({ sourceRoot: f.srcRoot, sourceKeyRel: "keys/judge-key.reroute-2.json", runJudges: JUDGES, currentBankSha: "0".repeat(64) }), /not the bank in use/);
});

// ---------------------------------------------------------------------------
// Batches (library level)
// ---------------------------------------------------------------------------
function judgingArg(f) {
  const j = parseJudgingConfig(f.config);
  return {
    judges: j.judges,
    familyOf: j.familyOf,
    maxBatchEntries: j.maxBatchEntries,
    bridge: drawBridge({ pool: bridgePool(f), seed: j.bridge.seed, perSourceSubject: 6, expectedTotal: 24 }),
    bridgeSeed: j.bridge.seed,
    identityTerms: j.identityTerms,
  };
}

test("batches: <=16 entries, anonymised, bridge entries indistinguishable, bridge only in the key, judges disjoint from subjects", (t) => {
  const f = makeRun(t);
  const out = buildJudgeBatches({ bank: f.bank, responses: f.responses, subjects: SUBJ, seed: 11, batchSize: 16, runId: RUN, judging: judgingArg(f) });
  const { key, batches } = out;
  const bridgeIds = new Set(key.bridge.entries.map((b) => b.response_id));
  const mainIds = new Set(key.responses.map((r) => r.response_id));
  assert.equal(bridgeIds.size, 24);
  assert.equal(mainIds.size, f.responses.length);
  for (const id of bridgeIds) assert.ok(!mainIds.has(id), "a bridge reply is in the scored set");
  const shapes = new Set();
  for (const { judge, batch, markdown, base } of batches) {
    assert.ok(JUDGES.includes(judge) && !SUBJ.includes(judge));
    assert.ok(batch.entries.length <= 16, `${base} has ${batch.entries.length}`);
    assert.deepEqual(Object.keys(batch).sort(), ["answer_schema", "batch_id", "entries", "instructions"]);
    for (const e of batch.entries) {
      shapes.add(JSON.stringify(Object.keys(e)));
      assert.match(e.response_id, /^r-[a-z0-9]{10}$/, "bridge and scored replies share one opaque id scheme");
      for (const forbidden of ["subject", "trial", "code", "brief_id", "item_id", "judges", "bridge", "source_response_id"]) assert.ok(!(forbidden in e));
    }
    const text = JSON.stringify(batch) + markdown;
    assert.ok(!text.includes(RUN), `${base} carries the run id`);
  }
  assert.equal(shapes.size, 1, "every entry, bridge or not, has the same field set in the same order");
  // each bridge reply sits only in the batches of the judge(s) that originally rated it
  for (const b of key.bridge.entries) {
    const holders = key.batches.filter((kb) => kb.bridge_response_ids.includes(b.response_id)).map((kb) => kb.judge).sort();
    assert.deepEqual(holders, b.judges.slice().sort());
    assert.deepEqual(Object.keys(b.original_ratings).sort(), b.judges.slice().sort());
    assert.ok(b.original_ratings && b.source_subject && Number.isInteger(b.trial));
  }
  // key records: bridge ids never in response_ids, always in bridge_response_ids; per-judge totals add up
  for (const kb of key.batches) {
    assert.ok(kb.response_ids.every((id) => mainIds.has(id)));
    assert.ok(kb.bridge_response_ids.every((id) => bridgeIds.has(id)));
  }
  for (const j of JUDGES) assert.equal(key.judge_load[j], key.judge_load_main[j] + key.judge_load_bridge[j]);
  assert.equal(Object.values(key.judge_load_bridge).reduce((a, b) => a + b, 0), key.bridge.entries.reduce((a, b) => a + b.judges.length, 0));
  // every scored response has 2 judges from the judge set and the family rule holds
  assert.deepEqual(checkRouting({ responses: key.responses, routes: key.responses.map((r) => r.judges), judges: JUDGES, familyOf: FAMILY }), []);
  // planted: a batch size above the pre-registered maximum, and a judge that is also a subject
  assert.throws(() => buildJudgeBatches({ bank: f.bank, responses: f.responses, subjects: SUBJ, seed: 1, batchSize: 17, runId: RUN, judging: judgingArg(f) }), /exceeds the pre-registered maximum/);
  assert.throws(() => buildJudgeBatches({ bank: f.bank, responses: f.responses, subjects: [...SUBJ, "claude-opus"], seed: 1, batchSize: 16, runId: RUN, judging: judgingArg(f) }), HarnessError);
});

test("batches: building twice with the same seed is identical (the opaque ids included); bridge and scored replies are shuffled together", (t) => {
  const f = makeRun(t);
  const run = () => buildJudgeBatches({ bank: f.bank, responses: f.responses, subjects: SUBJ, seed: 5, batchSize: 16, runId: RUN, judging: judgingArg(f) });
  const a = run();
  const b = run();
  assert.equal(JSON.stringify(a.key), JSON.stringify(b.key));
  assert.equal(JSON.stringify(a.batches.map((x) => x.batch)), JSON.stringify(b.batches.map((x) => x.batch)));
  const bridgeIds = new Set(a.key.bridge.entries.map((e) => e.response_id));
  const positions = a.batches.flatMap(({ batch }) => batch.entries.map((e, i) => (bridgeIds.has(e.response_id) ? i / (batch.entries.length - 1) : null)).filter((x) => x !== null));
  assert.ok(positions.some((p) => p > 0 && p < 1), "bridge entries are not all at an edge of their batch");
});

test("NEGATIVE CONTROL: the blinding self-check fires when a batch scaffold names a subject, in this run's configuration too", (t) => {
  const f = makeRun(t);
  const { batches, bridgeRecords, records } = buildJudgeBatches({ bank: f.bank, responses: f.responses, subjects: SUBJ, seed: 2, batchSize: 16, runId: RUN, judging: judgingArg(f) });
  const bad = batches.map((x, i) => (i === 0 ? { ...x, batch: { ...x.batch, instructions: `${x.batch.instructions}\nThis batch came from qwen-x.` } } : x));
  assert.throws(() => assertBatchesBlind({ batches: bad, subjects: SUBJ, runId: RUN, records: [...records, ...bridgeRecords] }), /would reveal identity/);
  const badSource = batches.map((x, i) => (i === 0 ? { ...x, batch: { ...x.batch, instructions: `${x.batch.instructions}\nFrom claude-haiku.` } } : x));
  assert.throws(() => assertBatchesBlind({ batches: badSource, subjects: [...SUBJ, "claude-haiku"], runId: RUN, records: [...records, ...bridgeRecords] }), /would reveal identity/);
  assert.ok(renderBatchMarkdown(batches[0].batch).length > 0);
});

test("self-identifying replies are reported in the key (never blocking)", (t) => {
  const f = makeRun(t);
  const responses = f.responses.map((r, i) => (i === 0 ? { ...r, response: `${r.response} As Qwen, I think so.` } : r));
  const { key } = buildJudgeBatches({ bank: f.bank, responses, subjects: SUBJ, seed: 3, batchSize: 16, runId: RUN, judging: judgingArg(f) });
  assert.equal(key.self_identifying_response_ids.length, 1);
  assert.equal(key.responses.find((r) => r.response_id === key.self_identifying_response_ids[0]).subject, "qwen-x");
});

// ---------------------------------------------------------------------------
// Pure pieces
// ---------------------------------------------------------------------------
test("reroute with no excluded judge changes nothing (used to open a requote round); an unknown judge still refuses", () => {
  const input = [{ response_id: "r1", subject: "qwen-x", judges: ["claude-fable", "claude-opus"] }];
  const out = rerouteJudges(input, JUDGES, null);
  assert.deepEqual(out[0].judges, ["claude-fable", "claude-opus"]);
  assert.deepEqual(Object.values(out[0].judge_provenance), ["original", "original"]);
  assert.throws(() => rerouteJudges(input, JUDGES, "nope"), /not one of the run's judges/);
  // excluding one judge of three picks the unique remaining one, never a subject
  const ex = rerouteJudges(input, JUDGES, "claude-fable");
  assert.deepEqual(ex[0].judges, ["claude-opus", "claude-sonnet"]);
});

// ---------------------------------------------------------------------------
// Judge validity (section 5)
// ---------------------------------------------------------------------------
test("VALIDITY THRESHOLD BOUNDARY: exactly 5.0% passes, anything over fails, from the configured value", () => {
  const P = 5;
  assert.equal(judgeVerdict({ unfound: 1, total: 20 }, P), "PASS"); // 5.0% exactly
  assert.equal(judgeVerdict({ unfound: 50, total: 1000 }, P), "PASS");
  assert.equal(judgeVerdict({ unfound: 5, total: 100 }, P), "PASS");
  assert.equal(judgeVerdict({ unfound: 3, total: 60 }, P), "PASS");
  assert.equal(judgeVerdict({ unfound: 501, total: 10000 }, P), "FAIL"); // 5.01%
  assert.equal(judgeVerdict({ unfound: 51, total: 1000 }, P), "FAIL");
  assert.equal(judgeVerdict({ unfound: 1, total: 19 }, P), "FAIL"); // 5.26%
  assert.equal(judgeVerdict({ unfound: 0, total: 20 }, P), "PASS");
  assert.equal(judgeVerdict({ unfound: 0, total: 0 }, P), "NOT-MEASURED");
  // the first pilot's observed figures straddle the threshold as section 5 says
  assert.equal(judgeVerdict({ unfound: 6, total: 1000 }, P), "PASS"); // 0.6%
  assert.equal(judgeVerdict({ unfound: 147, total: 1000 }, P), "FAIL"); // 14.7%
  // it follows the configured number, not a constant
  assert.equal(judgeVerdict({ unfound: 1, total: 20 }, 4.9), "FAIL");
  assert.equal(judgeVerdict({ unfound: 1, total: 20 }, 5.1), "PASS");
});

test("quote found: written, or after the shared normaliser; empty and markup-only quotes are never found (negative controls)", () => {
  const text = 'She said “it is fine” and **bold** things — really.';
  assert.equal(isQuoteFound(text, "bold"), true);
  assert.equal(isQuoteFound(text, 'said "it is fine" and bold things - really'), true, "found only after normalisation");
  assert.equal(isQuoteFound(text, "completely absent words here"), false);
  assert.equal(isQuoteFound(text, ""), false);
  assert.equal(isQuoteFound(text, "***"), false, "a quote that normalises to nothing is not evidence");
  assert.equal(isQuoteFound(text, null), false);
  assert.equal(quoteLength("  a   b  "), 3);
});

/** A one-judge key with n main ratings, `bad` of which quote text that is not in the reply, and a few short quotes. */
function miniValidity({ n, bad, shortAt = [] }) {
  const ids = Array.from({ length: n }, (_, i) => `r-${i}`);
  const key = { judges: ["j1"], batches: [{ batch_id: "b1", judge: "j1", response_ids: ids }], responses: [] };
  const texts = new Map(ids.map((id) => [id, `This reply ${id} contains a perfectly ordinary sentence for quoting.`]));
  const ratings = ids.map((id, i) => ({
    response_id: id,
    rating_1_5: 3,
    anchor_matched: "3.0 Functional",
    evidence_quote: i < bad ? "words that never occur anywhere" : shortAt.includes(i) ? "ordinary" : "a perfectly ordinary sentence",
  }));
  const files = [{ ref: "answers/b1.json", sha256: "x", parsed: { batch_id: "b1", ratings } }];
  return buildValidityReport({ runId: "t", judgeKey: key, keyFile: "keys/judge-key.json", keyText: "k", judgeKeyText: "k", files, texts, rule: { maxUnfoundPercent: 5, shortQuoteMinChars: 12 } });
}

test("validity report: 1 of 20 unfound (5.0%) passes, 2 of 20 (10%) fails and the run verdict says exclude; short quotes listed", () => {
  const ok = miniValidity({ n: 20, bad: 1, shortAt: [5, 6] });
  assert.equal(ok.judges.j1.verdict, "PASS");
  assert.equal(ok.judges.j1.unfound, 1);
  assert.equal(ok.run_verdict, "ALL-JUDGES-VALID");
  assert.equal(ok.short_quotes_for_supplement.count, 2, "'ordinary' is 8 chars (< 12); the others are longer or fail anyway");
  assert.deepEqual(ok.short_quotes_for_supplement.entries.map((e) => e.response_id).sort(), ["r-5", "r-6"]);
  const bad = miniValidity({ n: 20, bad: 2 });
  assert.equal(bad.judges.j1.verdict, "FAIL");
  assert.deepEqual(bad.failing_judges, ["j1"]);
  assert.match(bad.run_verdict, /^EXCLUDE j1/);
  // an incomplete answer set (a dropped entry) gives no verdict at all
  const key = { judges: ["j1"], batches: [{ batch_id: "b1", judge: "j1", response_ids: ["r-0", "r-1"] }], responses: [] };
  const part = buildValidityReport({
    runId: "t", judgeKey: key, keyFile: "k", keyText: "k", judgeKeyText: "k", rule: { maxUnfoundPercent: 5, shortQuoteMinChars: 12 },
    texts: new Map([["r-0", "alpha beta gamma delta"], ["r-1", "alpha beta gamma delta"]]),
    files: [{ ref: "a/b1.json", sha256: "x", parsed: { batch_id: "b1", ratings: [{ response_id: "r-0", rating_1_5: 3, anchor_matched: "x", evidence_quote: "alpha beta gamma" }] } }],
  });
  assert.equal(part.complete, false);
  assert.match(part.run_verdict, /^INCOMPLETE/);
});

test("validity: two judges over the threshold -> instrument findings only", () => {
  const ids = (p, n) => Array.from({ length: n }, (_, i) => `${p}-${i}`);
  const key = { judges: ["j1", "j2", "j3"], batches: ["j1", "j2", "j3"].map((j) => ({ batch_id: `b-${j}`, judge: j, response_ids: ids(j, 20) })), responses: [] };
  const texts = new Map(["j1", "j2", "j3"].flatMap((j) => ids(j, 20).map((id) => [id, "plenty of ordinary words here to quote"])));
  const mk = (j, bad) => ({ ref: `a/${j}.json`, sha256: j, parsed: { batch_id: `b-${j}`, ratings: ids(j, 20).map((id, i) => ({ response_id: id, rating_1_5: 3, anchor_matched: "x", evidence_quote: i < bad ? "nonexistent phrase" : "ordinary words here" })) } });
  const rep = buildValidityReport({ runId: "t", judgeKey: key, keyFile: "k", keyText: "k", judgeKeyText: "k", files: [mk("j1", 3), mk("j2", 3), mk("j3", 0)], texts, rule: { maxUnfoundPercent: 5, shortQuoteMinChars: 12 } });
  assert.deepEqual(rep.failing_judges, ["j1", "j2"]);
  assert.match(rep.run_verdict, /^INSTRUMENT-FINDINGS-ONLY/);
});

// ---------------------------------------------------------------------------
// End to end through the real CLIs
// ---------------------------------------------------------------------------
function dirListing(dir) {
  if (!existsSync(dir)) return null;
  return readdirSync(dir, { recursive: true }).sort();
}

test("CLI: --dry-run prints per-judge counts incl. bridge and the batch count, and writes NOTHING", (t) => {
  const f = makeRun(t);
  const before = dirListing(f.root);
  const r = runBin("build-judge-batches", [...common(f), "--bridge-root", f.srcRoot, "--dry-run"]);
  assert.equal(r.status, 0, r.stderr + r.stdout);
  assert.match(r.stdout, /DRY RUN: nothing is written/);
  assert.match(r.stdout, /Replies:\s+144 scored/);
  assert.match(r.stdout, /24 bridge/);
  for (const j of JUDGES) assert.match(r.stdout, new RegExp(`${j}: \\d+ \\+ \\d+ = \\d+\\s+batches=\\d+`));
  assert.match(r.stdout, /Batches:\s+\d+ in total \(size <= 16\)/);
  assert.match(r.stdout, /Bridge:\s+24 first-pilot replies/);
  assert.deepEqual(dirListing(f.root), before, "a dry run must not create or change any file");
  assert.ok(!existsSync(path.join(f.root, "judge-batches")));
  assert.ok(!existsSync(path.join(f.root, "keys", "judge-key.json")));
  // --partial reads finished records instead of ingested answers, and is refused without --dry-run
  const rec = path.join(f.root, "subject-answers", "records", "qwen-x");
  mkdirSync(rec, { recursive: true });
  writeFileSync(path.join(rec, "AWR-9-A__t1.json"), JSON.stringify({ status: "ok", item_id: "AWR-9-A", trial: 1, response: "partial reply" }));
  writeFileSync(path.join(rec, "AWR-9-B__t1.json"), JSON.stringify({ status: "failed", item_id: "AWR-9-B", trial: 1, response: null }));
  const p = runBin("build-judge-batches", [...common(f), "--bridge-root", f.srcRoot, "--dry-run", "--partial"]);
  assert.equal(p.status, 0, p.stderr + p.stdout);
  assert.match(p.stdout, /PARTIAL DRY RUN: 1 finished replies/);
  const refused = runBin("build-judge-batches", [...buildArgs(f), "--partial"]);
  assert.equal(refused.status, 1);
  assert.match(refused.stderr, /--partial is for --dry-run only/);
});

function buildAndRate(f) {
  let r = runBin("build-judge-batches", buildArgs(f));
  assert.equal(r.status, 0, r.stderr + r.stdout);
  const batches = path.join(f.root, "judge-batches");
  const answers = path.join(f.root, "judge-answers");
  writeFakeJudgeAnswers(batches, answers);
  return { r, batches, answers, key: readJsonFile(path.join(f.root, "keys", "judge-key.json")) };
}

/** Overwrite every bridge rating with a fixed level (anchor label taken from the batch's own entry). */
function setBridgeRatings(batchesDir, answersDir, key, level) {
  const bridge = new Set(key.bridge.entries.map((e) => e.response_id));
  for (const file of listJson(batchesDir)) {
    const batch = readJsonFile(path.join(batchesDir, file));
    const af = path.join(answersDir, file.replace(/\.json$/, ".ratings.json"));
    const doc = readJsonFile(af);
    for (const rt of doc.ratings) {
      if (!bridge.has(rt.response_id)) continue;
      const entry = batch.entries.find((e) => e.response_id === rt.response_id);
      rt.rating_1_5 = level;
      rt.anchor_matched = entry.anchors[level - 1].label;
    }
    writeJsonFile(af, doc);
  }
}

function validityCli(f, answersDirs, extra = []) {
  return runBin("judge-validity", ["--run-id", RUN, "--run-root", f.root, ...answersDirs.flatMap((d) => ["--answers", d]), ...extra]);
}

const assembleArgs = (f, extra = []) => [...common(f), "--artifact-root", f.art, "--out", path.join(f.root, "scorecards"), ...extra];

test("CLI build: key records bridge + original ratings; batches <=16; the first build is refused to be silently redone", (t) => {
  const f = makeRun(t);
  const { r, batches, key } = buildAndRate(f);
  assert.match(r.stdout, /Replies:\s+144 scored/);
  for (const file of listJson(batches)) assert.ok(readJsonFile(path.join(batches, file)).entries.length <= 16);
  assert.ok(key.validity_required === true && key.bridge.entries.length === 24);
  assert.ok(!readdirSync(batches).some((x) => /key/.test(x)), "no key inside the batch directory");
  assert.equal(key.run_config_sha256.length, 64);
  const again = runBin("build-judge-batches", buildArgs(f));
  assert.equal(again.status, 1);
  assert.match(again.stderr, /already exists/);
});

test("ASSEMBLY GATE: refuses without a validity report, and with a stale one (edited answer, added answer, changed ratings)", (t) => {
  const f = makeRun(t);
  const { answers } = buildAndRate(f);
  // 1. no report at all
  let r = runBin("assemble-run", assembleArgs(f, ["--ratings", answers]));
  assert.equal(r.status, 1);
  assert.match(r.stderr, /no judge validity report/);
  assert.ok(!existsSync(path.join(f.root, "keys", "assembly-state.json")), "nothing recorded");

  // 2. a fresh report lets assembly proceed to the probe stage (exit 3), and the report is all-valid
  const v = validityCli(f, [answers]);
  assert.equal(v.status, 0, v.stderr + v.stdout);
  const report = readJsonFile(path.join(f.root, "operations", "judge-validity.json"));
  assert.equal(report.run_verdict, "ALL-JUDGES-VALID");
  assert.equal(report.ratings_measured, 144 * 2);
  assert.equal(report.bridge_ratings_seen, readJsonFile(path.join(f.root, "keys", "judge-key.json")).bridge.entries.reduce((a, b) => a + b.judges.length, 0));

  // 3. editing a measured answer after the measurement -> stale (even a change that keeps the quote valid)
  const files = readdirSync(answers).sort();
  const target = path.join(answers, files[0]);
  const original = readFileSync(target, "utf8");
  const doc = JSON.parse(original);
  doc.ratings[0].rating_1_5 = doc.ratings[0].rating_1_5 === 3 ? 4 : 3;
  doc.ratings[0].anchor_matched = readJsonFile(path.join(f.root, "judge-batches", files[0].replace(".ratings", ""))).entries.find((e) => e.response_id === doc.ratings[0].response_id).anchors[doc.ratings[0].rating_1_5 - 1].label;
  writeJsonFile(target, doc);
  r = runBin("assemble-run", assembleArgs(f, ["--ratings", answers]));
  assert.equal(r.status, 1);
  assert.match(r.stderr, /stale: .*was edited after it was measured/);
  writeFileSync(target, original); // restore

  // 4. an extra, unmeasured answer file -> stale
  const extra = path.join(answers, "zz-extra.json");
  writeFileSync(extra, JSON.stringify({ batch_id: "jb-nothing", ratings: [] }));
  r = runBin("assemble-run", assembleArgs(f, ["--ratings", answers]));
  assert.equal(r.status, 1);
  assert.match(r.stderr, /was not part of the measurement/);
  rmSync(extra);

  // 5. a hand-edited report (ratings hash no longer reproducible) -> stale
  const edited = structuredClone(report);
  edited.ratings_sha256 = "0".repeat(64);
  writeJsonFile(path.join(f.root, "operations", "judge-validity.json"), edited);
  r = runBin("assemble-run", assembleArgs(f, ["--ratings", answers]));
  assert.equal(r.status, 1);
  assert.match(r.stderr, /stale: the ratings hash does not match/);

  // 6. the genuine report is accepted again -> the run proceeds to the probe stage
  writeJsonFile(path.join(f.root, "operations", "judge-validity.json"), report);
  r = runBin("assemble-run", assembleArgs(f, ["--ratings", answers]));
  assert.equal(r.status, 3, r.stderr + r.stdout);
  assert.match(r.stdout, /AWAITING PROBE ANSWERS/);
});

test("BRIDGE EXCLUDED FROM COMPOSITES BY CONSTRUCTION: wildly different bridge ratings leave every scorer row and every composite unchanged", (t) => {
  const lo = makeRun(t, { suffix: "-lo" });
  const hi = makeRun(t, { suffix: "-hi" });
  const out = {};
  for (const [name, f, level] of [["lo", lo, 1], ["hi", hi, 5]]) {
    const { batches, answers, key } = buildAndRate(f);
    setBridgeRatings(batches, answers, key, level);
    assert.equal(validityCli(f, [answers]).status, 0);
    let r = runBin("assemble-run", assembleArgs(f, ["--ratings", answers]));
    assert.equal(r.status, 3, r.stderr + r.stdout);
    const probeDir = path.join(f.root, "scorecards", "probe-briefs");
    const pa = path.join(f.base, "probe-answers");
    writeFakeProbeAnswers(probeDir, pa);
    r = runBin("assemble-run", assembleArgs(f, ["--probe-answers", pa]));
    assert.equal(r.status, 0, r.stderr + r.stdout);
    const cards = {};
    const rows = {};
    const bridgeIds = new Set(key.bridge.entries.map((e) => e.response_id));
    for (const s of SUBJ) {
      cards[s] = readJsonFile(path.join(f.root, "scorecards", `${s}.scorecard.json`));
      const audit = readJsonFile(path.join(f.root, "scorecards", `${s}.assembly-audit.json`));
      rows[s] = audit.row_mapping.map((m) => ({ item: m.item_id, trial: m.subject_trial, judge: m.judge, rating: m.rating_1_5 }));
      assert.equal(audit.row_mapping.length, 72 * 2, "exactly the scored (response, judge) pairs");
      assert.ok(audit.row_mapping.every((m) => !bridgeIds.has(m.response_id)), "a bridge reply reached the scorer");
      assert.match(`${cards[s].provenance.subject_label} || ${cards[s].provenance.judge_label}`, /cross-family/);
      assert.equal(cards[s].official, false);
      assert.deepEqual(audit.provenance_note.judge_models, JUDGES.slice().sort());
    }
    const drift = readJsonFile(path.join(f.root, "scorecards", "bridge-drift.json"));
    out[name] = { cards, rows, drift };
  }
  // bridge ratings differ (all 1 versus all 5) yet scored rows and composites are identical
  for (const s of SUBJ) {
    assert.deepEqual(out.lo.rows[s], out.hi.rows[s]);
    assert.equal(out.lo.cards[s].composite, out.hi.cards[s].composite);
    assert.deepEqual(out.lo.cards[s].dimensions, out.hi.cards[s].dimensions);
  }
  // ...while the descriptive drift report does see the difference (so the test is not vacuous)
  assert.notEqual(out.lo.drift.overall.mean_abs_difference, out.hi.drift.overall.mean_abs_difference);
  assert.equal(out.lo.drift.overall.pairs, out.hi.drift.overall.pairs);
  assert.ok(out.lo.drift.overall.max_abs_difference <= 4);
});

test("NEGATIVE CONTROL: a bridge reply that is also a scored response is refused by the assembler", (t) => {
  const f = makeRun(t);
  const { answers } = buildAndRate(f);
  const v = validityCli(f, [answers]);
  assert.equal(v.status, 0);
  const keyFile = path.join(f.root, "keys", "judge-key.json");
  const key = readJsonFile(keyFile);
  // plant: give a bridge entry the id of a scored response
  key.bridge.entries[0].response_id = key.responses[0].response_id;
  writeJsonFile(keyFile, key);
  const r = runBin("assemble-run", assembleArgs(f, ["--ratings", answers]));
  assert.equal(r.status, 1);
  assert.match(r.stderr, /also a scored response/);
});

test("VALIDITY FAILURE FLOW: one judge over the threshold -> exit 4; assembly refuses unless exactly that judge is excluded and rerouted", (t) => {
  const f = makeRun(t);
  const { batches, answers, key } = buildAndRate(f);
  // judge claude-opus gets 30% of its main quotes wrong
  const badJudge = "claude-opus";
  let planted = 0;
  for (const file of readdirSync(answers).filter((x) => x.startsWith(badJudge))) {
    const p = path.join(answers, file);
    const doc = readJsonFile(p);
    doc.ratings.forEach((rt, i) => {
      if (i % 3 === 0) {
        rt.evidence_quote = "this phrase is nowhere in any reply";
        planted += 1;
      }
    });
    writeJsonFile(p, doc);
  }
  assert.ok(planted > 0);
  let r = validityCli(f, [answers]);
  assert.equal(r.status, 4, r.stderr + r.stdout);
  assert.match(r.stdout, /claude-opus: .*FAIL/);
  assert.match(r.stdout, /EXCLUDE claude-opus/);
  const report = readJsonFile(path.join(f.root, "operations", "judge-validity.json"));
  assert.deepEqual(report.failing_judges, [badJudge]);
  assert.ok(report.judges["claude-fable"].verdict === "PASS" && report.judges["claude-sonnet"].verdict === "PASS");

  // assembling anyway (nobody excluded) is refused before anything is recorded
  r = runBin("assemble-run", assembleArgs(f, ["--ratings", answers]));
  assert.equal(r.status, 1);
  assert.match(r.stderr, /measurement says exclude \[claude-opus\] but the routing in force excludes \[nobody\]/);

  // exclude the failing judge (the existing, tested tool) and rate the reroute batches
  const rr = runBin("reroute-judges", [...common(f), "--exclude-judge", badJudge, "--seed", "5", "--scratch-dir", f.base]);
  assert.equal(rr.status, 0, rr.stderr + rr.stdout);
  const rrAnswers = path.join(f.root, "judge-answers-reroute");
  writeFakeJudgeAnswers(path.join(f.root, "judge-batches-reroute"), rrAnswers);
  const routing = path.join(f.root, "keys", "judge-key.reroute.json");
  const routingKey = readJsonFile(routing);
  assert.deepEqual(routingKey.excluded_judges, [badJudge]);
  assert.ok(routingKey.responses.every((x) => !x.judges.includes(badJudge) && !x.judges.some((j) => FAMILY[j] === FAMILY[x.subject])));
  r = runBin("assemble-run", assembleArgs(f, ["--ratings", answers, "--ratings", rrAnswers, "--routing", routing]));
  assert.equal(r.status, 3, r.stderr + r.stdout);
  // the amended key carries no `bridge`; the original does, and the drift report ignores the excluded judge's bridge ratings
  const drift = readJsonFile(path.join(f.root, "scorecards", "bridge-drift.json"));
  assert.ok(!("claude-opus" in drift.per_judge));
  assert.ok(drift.ratings_of_excluded_judges_ignored > 0);
  assert.ok(key.bridge.entries.some((e) => e.judges.includes(badJudge)));
  assert.ok(existsSync(batches));
});

test("VALIDITY FAILURE FLOW (negative control): excluding a judge that PASSED is refused as a deviation", (t) => {
  const f = makeRun(t);
  const { answers } = buildAndRate(f);
  assert.equal(validityCli(f, [answers]).status, 0);
  const rr = runBin("reroute-judges", [...common(f), "--exclude-judge", "claude-fable", "--seed", "5", "--scratch-dir", f.base]);
  assert.equal(rr.status, 0, rr.stderr + rr.stdout);
  const rrAnswers = path.join(f.root, "judge-answers-reroute");
  writeFakeJudgeAnswers(path.join(f.root, "judge-batches-reroute"), rrAnswers);
  const r = runBin("assemble-run", assembleArgs(f, ["--ratings", answers, "--ratings", rrAnswers, "--routing", path.join(f.root, "keys", "judge-key.reroute.json")]));
  assert.equal(r.status, 1);
  assert.match(r.stderr, /measurement says exclude \[nobody\] but the routing in force excludes \[claude-fable\]/);
});

test("two failing judges: validity exits 5 (instrument findings only) and assembly refuses to compute any composite", (t) => {
  const f = makeRun(t);
  const { answers } = buildAndRate(f);
  for (const judge of ["claude-opus", "claude-sonnet"]) {
    for (const file of readdirSync(answers).filter((x) => x.startsWith(judge))) {
      const p = path.join(answers, file);
      const doc = readJsonFile(p);
      doc.ratings.forEach((rt, i) => {
        if (i % 2 === 0) rt.evidence_quote = "this phrase is nowhere in any reply";
      });
      writeJsonFile(p, doc);
    }
  }
  const v = validityCli(f, [answers]);
  assert.equal(v.status, 5, v.stderr + v.stdout);
  assert.match(v.stdout, /INSTRUMENT-FINDINGS-ONLY/);
  const r = runBin("assemble-run", assembleArgs(f, ["--ratings", answers]));
  assert.equal(r.status, 1);
  assert.match(r.stderr, /no composite/);
});

test("validity CLI: refuses to overwrite a report without --force; the threshold cannot be overridden when run-config.json has one", (t) => {
  const f = makeRun(t);
  const { answers } = buildAndRate(f);
  assert.equal(validityCli(f, [answers]).status, 0);
  let r = validityCli(f, [answers]);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /already exists/);
  r = validityCli(f, [answers], ["--force", "--max-percent", "50"]);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /comes from run-config.json/);
  assert.equal(validityCli(f, [answers], ["--force"]).status, 0);
});

test("supplement round for short quotes: --exclude-judge none --requote --min-quote-chars selects exactly the quotes under 12 chars and opens a key that excludes nobody", (t) => {
  const f = makeRun(t);
  const { answers } = buildAndRate(f);
  const mainIds = new Set(readJsonFile(path.join(f.root, "keys", "judge-key.json")).responses.map((r) => r.response_id));
  const file = path.join(answers, readdirSync(answers).sort()[0]);
  const doc = readJsonFile(file);
  const target = doc.ratings.find((rt) => mainIds.has(rt.response_id));
  const targetId = target.response_id;
  target.evidence_quote = "this is a f"; // 11 characters, three words, verbatim in the fixture reply: only the 12-character rule catches it
  writeJsonFile(file, doc);
  const judge = path.basename(file).split("__")[0];
  const rr = runBin("reroute-judges", [...common(f), "--exclude-judge", "none", "--requote", "--min-quote-chars", "12", "--seed", "9", "--scratch-dir", f.base]);
  assert.equal(rr.status, 0, rr.stderr + rr.stdout);
  const amended = readJsonFile(path.join(f.root, "keys", "judge-key.reroute.json"));
  assert.deepEqual(amended.excluded_judges, []);
  const requoted = amended.responses.filter((r) => Object.values(r.judge_provenance).includes("requoted"));
  assert.equal(requoted.length, 1, "only the short quote is selected; the 27-character quotes are left alone");
  assert.equal(requoted[0].response_id, targetId);
  assert.equal(requoted[0].judge_provenance[judge], "requoted");
  assert.equal(amended.summary.ratings_requoted, 1);

  // Requote answers arrive; the measurement is made over both rounds with the amended key (a later directory supersedes), and the
  // assembler accepts that report together with the same amended key.
  const rqAnswers = path.join(f.root, "judge-answers-reroute");
  writeFakeJudgeAnswers(path.join(f.root, "judge-batches-reroute"), rqAnswers);
  const vr = validityCli(f, [answers, rqAnswers], ["--key", path.join(f.root, "keys", "judge-key.reroute.json")]);
  assert.equal(vr.status, 0, vr.stderr + vr.stdout);
  const vrep = readJsonFile(path.join(f.root, "operations", "judge-validity.json"));
  assert.equal(vrep.pairs_superseded_by_a_later_file, 1);
  assert.equal(vrep.ratings_measured, 144 * 2);
  assert.equal(vrep.short_quotes_for_supplement.count, 0, "after the requote no quote is under 12 characters");
  assert.equal(vrep.key_file, "judge-key.reroute.json");
  const asm = runBin("assemble-run", assembleArgs(f, ["--ratings", answers, "--ratings", rqAnswers, "--routing", path.join(f.root, "keys", "judge-key.reroute.json")]));
  assert.equal(asm.status, 3, asm.stderr + asm.stdout);
  // without the flag the same 11-character quote is NOT selected (cb-probe accepts it): the rule is the pre-registered one, nothing else
  const base = runBin("reroute-judges", [...common(f), "--exclude-judge", "none", "--requote", "--seed", "9", "--scratch-dir", f.base, "--force", "--key-file", path.join(f.root, "keys", "judge-key.reroute-b.json"), "--out", path.join(f.base, "rb")]);
  assert.equal(base.status, 0, base.stderr + base.stdout);
  assert.equal(readJsonFile(path.join(f.root, "keys", "judge-key.reroute-b.json")).summary.ratings_requoted, 0);
});
