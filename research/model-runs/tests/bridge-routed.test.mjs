// Bridge source read from a run's ROUTED judge answers (no assembly audits): the pilot-2026-10-03 -> pilot-2026-10-02 case.
// SYNTHETIC replies and ratings. No model, no network. The audit path is covered in judging-prep.test.mjs and is unchanged.

import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { readFileSync, rmSync } from "node:fs";

import { sha256 } from "../lib/common.mjs";
import { loadBridgePool, drawBridge } from "../lib/bridge.mjs";
import { tmp, cleanup, writeJsonFile, fakeReply, FAKE_QUOTE } from "./helpers.mjs";

const JUDGES = ["claude-fable", "claude-opus", "claude-sonnet"];
const SUBJ = ["qwen-s", "llama-s"];
const BANK_SHA = "b".repeat(64);
const KEY_REL = "keys/judge-key.reroute.json";
const ITEMS = Array.from({ length: 16 }, (_, i) => `ITEM-${String(i + 1).padStart(2, "0")}`);

/** The rating the synthetic judge gave to the n-th reply: deterministic and distinguishable. */
const ratingOf = (n, judge) => 1 + ((n + judge.length) % 5);

/** A source run with NO scorecards directory: only keys and routed answers (original + one reroute directory). */
function makeRoutedSource(dir) {
  const responses = [];
  const ingested = [];
  const planted = new Map(); // `${response_id}|${judge}` -> rating
  let n = 0;
  for (const subject of SUBJ) {
    for (const item of ITEMS) {
      n += 1;
      const response_id = `r-src-${n}`;
      const brief_id = `b-${subject}`;
      const code = `q-${n}`;
      const text = fakeReply(brief_id, code);
      const judges = [JUDGES[n % 3], JUDGES[(n + 1) % 3]].sort();
      responses.push({
        response_id, subject, trial: 1, item_id: item, brief_id, code, response_sha256: sha256(text),
        judges, judge_provenance: Object.fromEntries(judges.map((j) => [j, "original"])),
      });
      ingested.push({ subject, trial: 1, brief_id, code, item_id: item, response: text });
      for (const j of judges) planted.set(`${response_id}|${j}`, ratingOf(n, j));
    }
  }
  const batches = [];
  const answers = [];
  for (const judge of JUDGES) {
    const mine = responses.filter((r) => r.judges.includes(judge));
    for (let i = 0; i < mine.length; i += 8) {
      const ids = mine.slice(i, i + 8).map((r) => r.response_id);
      const batch_id = `jb-${judge}-${i / 8}`;
      batches.push({ batch_id, judge, response_ids: ids, bridge_response_ids: [], source: "original" });
      answers.push({
        file: `${judge}__batch-${i / 8}.answers.json`,
        body: {
          batch_id,
          ratings: ids.map((id) => ({
            response_id: id,
            rating_1_5: planted.get(`${id}|${judge}`),
            anchor_matched: "Some anchor",
            evidence_quote: FAKE_QUOTE,
          })),
        },
      });
    }
  }
  const original = { kind: "judge-routing-key", run_id: "src-mcp", subjects: SUBJ, responses, batches };
  const amended = {
    kind: "judge-routing-key-amended", run_id: "src-mcp", excluded_judges: [], requote: true,
    subjects: SUBJ, responses, batches,
  };
  writeJsonFile(path.join(dir, "keys", "subject-brief-key.json"), { run_id: "src-mcp", bank_sha256: BANK_SHA, subjects: SUBJ });
  writeJsonFile(path.join(dir, "keys", "judge-key.json"), original);
  writeJsonFile(path.join(dir, KEY_REL), amended);
  writeJsonFile(path.join(dir, "keys", "ingested", "answers.json"), { run_id: "src-mcp", responses: ingested });
  for (const a of answers) writeJsonFile(path.join(dir, "judge-answers", a.file), a.body);
  // an empty-but-present reroute directory, as the real run has: it must not break discovery
  writeJsonFile(path.join(dir, "judge-answers-reroute", "answer-schema.json"), {});
  return { planted, responses };
}

function fixture(t) {
  const base = tmp();
  t.after(() => cleanup(base));
  const root = path.join(base, "src-mcp");
  const src = makeRoutedSource(root);
  return { base, root, ...src };
}

const load = (f, runJudges = JUDGES) => loadBridgePool({ sourceRoot: f.root, sourceKeyRel: KEY_REL, runJudges, currentBankSha: BANK_SHA });

test("bridge from routed answers: no assembly audit needed; original ratings are the routed ratings, opaque ids and texts from the source run", (t) => {
  const f = fixture(t);
  const pool = load(f);
  assert.equal(pool.length, SUBJ.length * ITEMS.length);
  for (const p of pool) {
    assert.equal(p.source_run, "src-mcp");
    assert.deepEqual(Object.keys(p.original_ratings), Object.keys(p.original_ratings).sort());
    for (const [j, r] of Object.entries(p.original_ratings)) assert.equal(r, f.planted.get(`${p.source_response_id}|${j}`));
    assert.equal(sha256(p.response), p.response_sha256);
    assert.equal(p.original_all_judges.length, 2);
  }
});

test("bridge from routed answers: candidates are replies rated by at least one judge of this run; only those judges are kept", (t) => {
  const f = fixture(t);
  const pool = load(f, ["claude-fable"]);
  const expected = f.responses.filter((r) => r.judges.includes("claude-fable")).map((r) => r.response_id).sort();
  assert.deepEqual(pool.map((p) => p.source_response_id).sort(), expected);
  for (const p of pool) {
    assert.deepEqual(Object.keys(p.original_ratings), ["claude-fable"]);
    assert.equal(p.original_all_judges.length, 2, "the full original judge list is still recorded");
  }
});

test("bridge from routed answers: the seeded draw (20261003) is deterministic, independent of pool order, and honours per_source_subject", (t) => {
  const f = fixture(t);
  const pool = load(f);
  const a = drawBridge({ pool, seed: 20261003, perSourceSubject: 6, expectedTotal: 12 });
  const b = drawBridge({ pool: [...pool].reverse(), seed: 20261003, perSourceSubject: 6, expectedTotal: 12 });
  assert.deepEqual(a.map((x) => x.source_response_id), b.map((x) => x.source_response_id));
  assert.deepEqual(a.map((x) => x.source_response_id), drawBridge({ pool: load(f), seed: 20261003, perSourceSubject: 6 }).map((x) => x.source_response_id));
  for (const s of SUBJ) assert.equal(a.filter((x) => x.source_subject === s).length, 6);
  const c = drawBridge({ pool, seed: 20261003, perSourceSubject: 12, expectedTotal: 24 });
  for (const s of SUBJ) assert.equal(c.filter((x) => x.source_subject === s).length, 12);
  assert.notDeepEqual(a.map((x) => x.source_response_id), drawBridge({ pool, seed: 20261004, perSourceSubject: 6 }).map((x) => x.source_response_id));
  assert.throws(() => drawBridge({ pool, seed: 1, perSourceSubject: 17 }), /need 17/);
  assert.throws(() => drawBridge({ pool, seed: 1, perSourceSubject: 6, expectedTotal: 13 }), /pre-registration says 13/);
});

test("bridge from routed answers: an unanswered batch, a bad quote, or a changed bank refuses; nothing is guessed", (t) => {
  const f = fixture(t);
  rmSync(path.join(f.root, "judge-answers", "claude-opus__batch-0.answers.json"));
  assert.throws(() => load(f), /did not validate/);
  const g = fixture(t);
  const file = path.join(g.root, "judge-answers", "claude-fable__batch-0.answers.json");
  const body = JSON.parse(readFileSync(file, "utf8"));
  body.ratings[0].evidence_quote = "text that is nowhere in the reply";
  writeJsonFile(file, body);
  assert.throws(() => load(g), /did not validate/);
  const h = fixture(t);
  assert.throws(() => loadBridgePool({ sourceRoot: h.root, sourceKeyRel: KEY_REL, runJudges: JUDGES, currentBankSha: "0".repeat(64) }), /not the bank in use/);
  // a source key that is not an amended routing key, with no audits, cannot be read
  const k = fixture(t);
  writeJsonFile(path.join(k.root, "keys", "plain.json"), { subjects: SUBJ, responses: [] });
  assert.throws(() => loadBridgePool({ sourceRoot: k.root, sourceKeyRel: "keys/plain.json", runJudges: JUDGES, currentBankSha: BANK_SHA }), /not an amended routing key/);
});

test("bridge: when every source subject has an assembly audit the audit is used (the path the first pilot always took)", (t) => {
  const f = fixture(t);
  for (const s of SUBJ) {
    const rows = f.responses
      .filter((r) => r.subject === s)
      .flatMap((r) => r.judges.map((j) => ({ item_id: r.item_id, response_id: r.response_id, subject_trial: 1, judge: j, rating_1_5: 5 })));
    writeJsonFile(path.join(f.root, "scorecards", `${s}.assembly-audit.json`), { subject: s, row_mapping: rows });
  }
  const pool = load(f);
  for (const p of pool) for (const r of Object.values(p.original_ratings)) assert.equal(r, 5, "the audit's rating, not the routed answer's");
});

