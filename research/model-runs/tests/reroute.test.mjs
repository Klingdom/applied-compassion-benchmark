// Judge exclusion + re-routing. SYNTHETIC bank, FAKE answers, FAKE ratings. No model is run.

import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync } from "node:fs";

import { computeCompositeFromDimensions } from "../../../tools/cb-probe/lib/canonical.mjs";
import { validateSelfRunScorecard } from "../../../tools/cb-probe/lib/validate-scorecard.mjs";
import { routeResponses } from "../lib/judge-batches.mjs";
import { rerouteJudges, applyRequotes, validateRoutingKey, PROVENANCE } from "../lib/reroute.mjs";
import { mulberry32, sha256 } from "../lib/common.mjs";
import {
  makeSyntheticBank,
  tmp,
  cleanup,
  writeJsonFile,
  readJsonFile,
  runBin,
  writeFakeSubjectAnswers,
  writeFakeJudgeAnswers,
  writeFakeProbeAnswers,
  listJson,
  SUBJECT_LABELS,
} from "./helpers.mjs";

const EXCL = "claude-haiku";

// ---------------------------------------------------------------------------
// Pure routing
// ---------------------------------------------------------------------------
function syntheticRouting(seed, per) {
  const responses = [];
  for (const s of SUBJECT_LABELS) for (let i = 0; i < per; i += 1) responses.push({ subject: s, response_id: `r-${s}-${i}` });
  const routes = routeResponses(responses, SUBJECT_LABELS, mulberry32(seed));
  return responses.map((r, i) => ({ ...r, judges: routes[i] }));
}

test("PROPERTY: reroute picks exactly the unique eligible judge, never self / excluded / a duplicate, over many synthetic routings", () => {
  let rerouted = 0;
  let untouched = 0;
  for (let seed = 1; seed <= 40; seed += 1) {
    for (const per of [1, 3, 24, 83]) {
      const input = syntheticRouting(seed, per);
      const out = rerouteJudges(input, SUBJECT_LABELS, EXCL);
      out.forEach((o, i) => {
        const r = input[i];
        assert.equal(o.response_id, r.response_id);
        assert.equal(o.judges.length, 2);
        assert.equal(new Set(o.judges).size, 2, "duplicate judge on one response");
        assert.ok(!o.judges.includes(EXCL), "routed to the excluded judge");
        assert.ok(!o.judges.includes(r.subject), "routed to its own subject");
        if (r.judges.includes(EXCL)) {
          const other = r.judges.find((j) => j !== EXCL);
          const unique = SUBJECT_LABELS.filter((j) => j !== EXCL && j !== r.subject && j !== other);
          assert.equal(unique.length, 1);
          assert.deepEqual(o.judges, [other, unique[0]].sort());
          assert.equal(o.judge_provenance[other], PROVENANCE.ORIGINAL);
          assert.equal(o.judge_provenance[unique[0]], PROVENANCE.REROUTED);
          rerouted += 1;
        } else {
          assert.deepEqual(o.judges, r.judges.slice().sort(), "a response the excluded judge never judged must not change");
          assert.ok(Object.values(o.judge_provenance).every((p) => p === PROVENANCE.ORIGINAL));
          untouched += 1;
        }
      });
    }
  }
  assert.ok(rerouted > 1000 && untouched > 500, `${rerouted}/${untouched}`);
});

test("reroute FAILS CLOSED unless exactly one candidate exists", () => {
  // two candidates (five judges): ambiguous
  const five = ["a", "b", "c", "d", "e"];
  assert.throws(() => rerouteJudges([{ response_id: "r1", subject: "a", judges: ["b", "c"] }], five, "b"), /exactly one eligible replacement judge, found 2/);
  // zero candidates (three judges; the only other judge is already used)
  assert.throws(() => rerouteJudges([{ response_id: "r1", subject: "a", judges: ["b", "c"] }], ["a", "b", "c"], "b"), /found 0/);
  // excluded judge is not a judge of the run
  assert.throws(() => rerouteJudges([], SUBJECT_LABELS, "claude-nope"), /not one of the run's judges/);
  // an original key that already breaks the rules is not laundered
  assert.throws(() => rerouteJudges([{ response_id: "r1", subject: "claude-opus", judges: [EXCL, "claude-opus"] }], SUBJECT_LABELS, EXCL), /own subject/);
  assert.throws(() => rerouteJudges([{ response_id: "r1", subject: "claude-opus", judges: [EXCL, EXCL] }], SUBJECT_LABELS, EXCL), /distinct/);
});

test("applyRequotes marks only existing original pairs and refuses an unknown pair", () => {
  const routed = rerouteJudges([{ response_id: "r1", subject: "claude-opus", judges: [EXCL, "claude-sonnet"] }], SUBJECT_LABELS, EXCL);
  const ok = applyRequotes(routed, new Set(["r1|claude-sonnet"]));
  assert.equal(ok.requoted, 1);
  assert.equal(ok.routed[0].judge_provenance["claude-sonnet"], PROVENANCE.REQUOTED);
  assert.throws(() => applyRequotes(routed, new Set(["r1|claude-opus"])), /not a final/);
  // the freshly rerouted slot has no original rating to requote
  assert.throws(() => applyRequotes(routed, new Set(["r1|claude-fable"])), /already rerouted/);
});

// ---------------------------------------------------------------------------
// End to end through the CLIs
// ---------------------------------------------------------------------------
function setup(t) {
  const base = tmp();
  t.after(() => cleanup(base));
  const bankFile = path.join(base, "bank.json");
  writeJsonFile(bankFile, makeSyntheticBank());
  const root = path.join(base, "run");
  return {
    base,
    bankFile,
    root,
    briefs: path.join(root, "subject-briefs"),
    keys: path.join(root, "keys"),
    answers: path.join(base, "subject-answers"),
    batches: path.join(root, "judge-batches"),
    ratings: path.join(root, "judge-answers"),
    rerouteBatches: path.join(root, "judge-batches-reroute"),
    rerouteRatings: path.join(root, "judge-answers-reroute"),
    routingKey: path.join(root, "keys", "judge-key.reroute.json"),
    probeAnswers: path.join(base, "probe-answers"),
    artifacts: path.join(base, "artifacts"),
    scorecards: path.join(root, "scorecards"),
  };
}
const common = (p) => ["--run-id", "rr", "--run-root", p.root];
const withBank = (p) => [...common(p), "--bank", p.bankFile];

/** Build briefs -> ingest -> judge batches -> fake original answers, then corrupt haiku quotes (and optionally one sonnet quote). */
function pipeline(t, { badSonnetQuote = false } = {}) {
  const p = setup(t);
  let r = runBin("build-subject-briefs", [...withBank(p), "--out", p.briefs, "--seed", "11"]);
  assert.equal(r.status, 0, r.stderr + r.stdout);
  writeFakeSubjectAnswers(p.briefs, p.answers);
  r = runBin("ingest-answers", [...common(p), "--answers", p.answers]);
  assert.equal(r.status, 0, r.stderr + r.stdout);
  r = runBin("build-judge-batches", [...withBank(p), "--out", p.batches, "--batch-size", "40", "--seed", "12"]);
  assert.equal(r.status, 0, r.stderr + r.stdout);
  writeFakeJudgeAnswers(p.batches, p.ratings);
  let haikuBad = 0;
  let sonnetBad = null;
  for (const f of readdirSync(p.ratings)) {
    const file = path.join(p.ratings, f);
    const doc = readJsonFile(file);
    if (f.startsWith(EXCL)) {
      doc.ratings.forEach((x, i) => {
        if (i % 2 === 0) {
          x.evidence_quote = "a paraphrase that was never in the reply";
          haikuBad += 1;
        }
      });
      writeJsonFile(file, doc);
    } else if (badSonnetQuote && f.startsWith("claude-sonnet") && !sonnetBad) {
      doc.ratings[0].evidence_quote = "this is not in the reply at all";
      sonnetBad = doc.ratings[0].response_id;
      writeJsonFile(file, doc);
    }
  }
  return { p, haikuBad, sonnetBad };
}

function hashDir(dir, prefix = "") {
  const out = {};
  for (const e of readdirSync(dir, { withFileTypes: true }).sort((x, y) => x.name.localeCompare(y.name))) {
    const rel = prefix + e.name;
    if (e.isDirectory()) Object.assign(out, hashDir(path.join(dir, e.name), `${rel}/`));
    else out[rel] = sha256(readFileSync(path.join(dir, e.name), "utf8"));
  }
  return out;
}

const reroute = (p, extra = []) => runBin("reroute-judges", [...withBank(p), "--exclude-judge", EXCL, ...extra, "--seed", "5"]);

function answerReroute(p) {
  writeFakeJudgeAnswers(p.rerouteBatches, p.rerouteRatings);
}

const assemble = (p, extra = []) =>
  runBin("assemble-run", [
    ...withBank(p),
    "--artifact-root", p.artifacts,
    "--ratings", p.ratings,
    "--ratings", p.rerouteRatings,
    "--routing", p.routingKey,
    "--out", p.scorecards,
    ...extra,
  ]);

test("CLI reroute: right responses rerouted, small batches, no leaks, original key and answers untouched, amended key outside the batch dir", (t) => {
  const { p, sonnetBad } = pipeline(t, { badSonnetQuote: true });
  const keyBefore = hashDir(p.keys);
  const answersBefore = hashDir(p.ratings);
  const orig = readJsonFile(path.join(p.keys, "judge-key.json"));
  const haikuJudged = orig.responses.filter((r) => r.judges.includes(EXCL)).length;

  const r = reroute(p, ["--requote"]);
  assert.equal(r.status, 0, r.stderr + r.stdout);
  assert.match(r.stdout, new RegExp(`Rerouted ratings \\(excluded judge ${EXCL}\\): ${haikuJudged}`));
  assert.match(r.stdout, /Requoted ratings:\s+1\b/);

  // originals untouched; the only new key file is the amended one
  const keyAfter = hashDir(p.keys);
  for (const [f, h] of Object.entries(keyBefore)) assert.equal(keyAfter[f], h, `${f} was modified`);
  assert.deepEqual(Object.keys(keyAfter).sort(), [...Object.keys(keyBefore), "judge-key.reroute.json"].sort());
  assert.deepEqual(hashDir(p.ratings), answersBefore);
  assert.ok(!readdirSync(p.rerouteBatches).some((f) => /key/.test(f)), "key must not be inside the batch dir");

  const rk = readJsonFile(p.routingKey);
  assert.equal(rk.summary.ratings_rerouted, haikuJudged);
  assert.equal(rk.summary.ratings_requoted, 1);
  const subj = new Map(rk.responses.map((x) => [x.response_id, x.subject]));
  const sonnetRow = rk.responses.find((x) => x.response_id === sonnetBad);
  assert.equal(sonnetRow.judge_provenance["claude-sonnet"], PROVENANCE.REQUOTED);
  for (const x of rk.responses) {
    assert.equal(x.judges.length, 2);
    assert.equal(new Set(x.judges).size, 2);
    assert.ok(!x.judges.includes(EXCL) && !x.judges.includes(x.subject));
  }
  assert.doesNotThrow(() => validateRoutingKey(rk, orig));

  // batches: <= 8 entries, <= 70 KB, only for the judges that need them, never for the excluded judge, no identity text
  const files = listJson(p.rerouteBatches);
  const assigned = new Set();
  for (const f of files) {
    const judge = f.split("__")[0];
    assert.notEqual(judge, EXCL);
    const batch = readJsonFile(path.join(p.rerouteBatches, f));
    assert.ok(batch.entries.length >= 1 && batch.entries.length <= 8);
    const md = readFileSync(path.join(p.rerouteBatches, f.replace(/\.json$/, ".md")), "utf8");
    assert.ok(Buffer.byteLength(md) < 70000);
    assert.doesNotMatch(md + JSON.stringify(batch), /haiku|sonnet|opus|fable|trial/i);
    for (const e of batch.entries) {
      assert.notEqual(subj.get(e.response_id), judge, "self-judging in a reroute batch");
      assigned.add(`${e.response_id}|${judge}`);
    }
  }
  assert.equal(assigned.size, haikuJudged + 1);
  assert.ok(files.length >= Math.ceil((haikuJudged + 1) / 8));

  // refuses to overwrite without --force
  const again = reroute(p, ["--requote"]);
  assert.equal(again.status, 1);
  assert.match(again.stderr, /already exists/);
});

test("CLI reroute without --requote leaves a non-verbatim quote of a kept judge alone, and the assembler then refuses it", (t) => {
  const { p } = pipeline(t, { badSonnetQuote: true });
  let r = reroute(p);
  assert.equal(r.status, 0, r.stderr + r.stdout);
  assert.match(r.stdout, /Requoted ratings:\s+0\b/);
  answerReroute(p);
  r = assemble(p);
  assert.equal(r.status, 1, r.stderr + r.stdout);
  assert.match(r.stderr, /evidence_quote is not a verbatim substring/);
  assert.ok(!existsSync(path.join(p.keys, "assembly-state.json")));
});

test("ASSEMBLE --routing: complete fixture accepted; haiku's bad ratings ignored; superseded quote ignored; composite equals computeCompositeFromDimensions; audit shows the exclusion", (t) => {
  const { p, haikuBad } = pipeline(t, { badSonnetQuote: true });
  assert.ok(haikuBad > 0);
  let r = reroute(p, ["--requote"]);
  assert.equal(r.status, 0, r.stderr + r.stdout);
  answerReroute(p);

  // control: the ORIGINAL assembly path still refuses these answers (bad quotes are not relaxed anywhere)
  const control = runBin("assemble-run", [...withBank(p), "--artifact-root", p.artifacts, "--ratings", p.ratings, "--out", p.scorecards]);
  assert.equal(control.status, 1);
  assert.match(control.stderr, /not a verbatim substring/);

  r = assemble(p);
  assert.equal(r.status, 3, r.stderr + r.stdout);
  const probeDir = path.join(p.scorecards, "probe-briefs");
  writeFakeProbeAnswers(probeDir, p.probeAnswers);
  r = assemble(p, ["--probe-answers", p.probeAnswers]);
  assert.equal(r.status, 0, r.stderr + r.stdout);

  const rk = readJsonFile(p.routingKey);
  const respInfo = new Map(rk.responses.map((x) => [x.response_id, x]));
  let totalRerouted = 0;
  let totalRequoted = 0;
  for (const subject of SUBJECT_LABELS) {
    const sc = readJsonFile(path.join(p.scorecards, `${subject}.scorecard.json`));
    const audit = readJsonFile(path.join(p.scorecards, `${subject}.assembly-audit.json`));
    assert.deepEqual(validateSelfRunScorecard(sc), { valid: true, errors: [] });
    assert.equal(sc.official, false);
    assert.notEqual(sc.composite, null);
    assert.equal(sc.composite, computeCompositeFromDimensions(sc.dimensions).composite);
    assert.equal(sc.band, computeCompositeFromDimensions(sc.dimensions).band);

    const per = new Map();
    for (const row of audit.row_mapping) {
      assert.notEqual(row.judge, EXCL);
      assert.notEqual(row.judge, subject);
      per.set(row.response_id, [...(per.get(row.response_id) ?? []), row.judge]);
      assert.equal(row.judge_provenance, respInfo.get(row.response_id).judge_provenance[row.judge]);
    }
    for (const [id, judges] of per) {
      assert.equal(judges.length, 2);
      assert.deepEqual(judges.slice().sort(), respInfo.get(id).judges);
    }
    const jr = audit.judge_routing;
    assert.equal(jr.responses, 72);
    assert.equal(Object.values(jr.responses_by_judge_pair).reduce((a, b) => a + b, 0), 72);
    for (const k of Object.keys(jr.responses_by_judge_pair)) assert.ok(!k.includes(EXCL) && !k.includes(subject));
    assert.equal(jr.ratings_by_provenance.original + jr.ratings_rerouted + jr.ratings_requoted, 144);
    totalRerouted += jr.ratings_rerouted;
    totalRequoted += jr.ratings_requoted;
    assert.deepEqual(jr.judge_exclusion.excluded_judges, [EXCL]);
    const st = jr.judge_exclusion.original_answer_judge_stats;
    assert.equal(st[EXCL].quote_not_verbatim, haikuBad);
    assert.equal(st["claude-sonnet"].quote_not_verbatim, 1);
    assert.equal(st["claude-opus"].quote_not_verbatim, 0);
    assert.equal(st[EXCL].dropped, 0);
    assert.ok(jr.judge_exclusion.exclusion_record.disclosure.includes("not by scores"));
    assert.ok(!audit.provenance_note.judge_models.includes(EXCL));
  }
  assert.equal(totalRerouted, rk.summary.ratings_rerouted);
  assert.equal(totalRequoted, 1);
});

test("ASSEMBLE --routing refuses when a rerouted response is missing its replacement rating (whole file, and a single rating)", (t) => {
  const { p } = pipeline(t);
  assert.equal(reroute(p).status, 0);
  answerReroute(p);

  // a single missing rating inside a reroute answer file
  const files = readdirSync(p.rerouteRatings).sort();
  const first = path.join(p.rerouteRatings, files[0]);
  const doc = readJsonFile(first);
  const dropped = doc.ratings.pop();
  writeJsonFile(first, doc);
  let r = assemble(p);
  assert.equal(r.status, 1, r.stderr + r.stdout);
  assert.match(r.stderr, new RegExp(`not rated: .*${dropped.response_id}|${dropped.response_id}`));
  assert.ok(!existsSync(path.join(p.keys, "assembly-state.json")));

  // a whole reroute answer file missing
  rmSync(first);
  r = assemble(p);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /no answer file for batch/);
  assert.ok(!existsSync(path.join(p.keys, "assembly-state.json")));
});

test("ASSEMBLE --routing refuses a non-verbatim quote in a reroute file (no normalisation)", (t) => {
  const { p } = pipeline(t);
  assert.equal(reroute(p).status, 0);
  answerReroute(p);
  const f = path.join(p.rerouteRatings, readdirSync(p.rerouteRatings).sort()[0]);
  const doc = readJsonFile(f);
  doc.ratings[0].evidence_quote = "THIS IS A FABRICATED ANSWER"; // case-only difference: near-miss, still refused
  writeJsonFile(f, doc);
  const r = assemble(p);
  assert.equal(r.status, 1, r.stderr + r.stdout);
  assert.match(r.stderr, /evidence_quote is not a verbatim substring/);
});

test("ASSEMBLE --routing: ratings from an excluded judge are ignored ONLY if the amended key says so", (t) => {
  const { p } = pipeline(t);
  assert.equal(reroute(p).status, 0);
  answerReroute(p);

  // 1. strip the exclusion from the key: the dropped original judge is no longer explained -> refused
  const rk = readJsonFile(p.routingKey);
  const noExcl = { ...rk, excluded_judges: [] };
  writeJsonFile(p.routingKey, noExcl);
  let r = assemble(p);
  assert.equal(r.status, 1, r.stderr + r.stdout);
  assert.match(r.stderr, /not all excluded judges/);

  // 2. a stray rating by an excluded-or-not judge that the key does not account for -> refused
  writeJsonFile(p.routingKey, rk);
  const stray = path.join(p.rerouteRatings, "stray.json");
  const some = readJsonFile(path.join(p.rerouteRatings, readdirSync(p.rerouteRatings).sort()[0]));
  writeJsonFile(stray, { batch_id: "jb-unknown", ratings: some.ratings });
  r = assemble(p);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /is not a batch of the routing key/);
  rmSync(stray);

  // 3. an amended key that routes a response to the excluded judge is refused
  const hacked = readJsonFile(p.routingKey);
  const victim = hacked.responses.find((x) => x.judge_provenance && Object.values(x.judge_provenance).includes(PROVENANCE.REROUTED));
  const repl = Object.keys(victim.judge_provenance).find((j) => victim.judge_provenance[j] === PROVENANCE.REROUTED);
  delete victim.judge_provenance[repl];
  victim.judges = victim.judges.filter((j) => j !== repl).concat(EXCL);
  victim.judge_provenance[EXCL] = PROVENANCE.ORIGINAL;
  writeJsonFile(p.routingKey, hacked);
  r = assemble(p);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /excluded judge/);

  // 4. a duplicate judge on one response is refused
  const dup = readJsonFile(p.routingKey);
  const v2 = dup.responses[0];
  v2.judges = [v2.judges[0], v2.judges[0]];
  writeJsonFile(p.routingKey, dup);
  r = assemble(p);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /distinct judges/);
});

test("PROPERTY: amended key never has duplicate judges per response, never self, never excluded (CLI output over several seeds)", (t) => {
  const { p } = pipeline(t);
  for (const seed of ["1", "2", "3"]) {
    const r = runBin("reroute-judges", [...withBank(p), "--exclude-judge", EXCL, "--seed", seed, "--force"]);
    assert.equal(r.status, 0, r.stderr + r.stdout);
    const rk = readJsonFile(p.routingKey);
    for (const x of rk.responses) {
      assert.equal(new Set(x.judges).size, x.judges.length);
      assert.equal(x.judges.length, 2);
      assert.ok(!x.judges.includes(x.subject) && !x.judges.includes(EXCL));
    }
    const orig = readJsonFile(path.join(p.keys, "judge-key.json"));
    assert.equal(orig.batches.length, rk.batches.filter((b) => b.source === "original").length);
  }
});

test("--ratings with two directories is refused unless --routing is given", (t) => {
  const { p } = pipeline(t);
  assert.equal(reroute(p).status, 0);
  answerReroute(p);
  const r = runBin("assemble-run", [...withBank(p), "--artifact-root", p.artifacts, "--ratings", p.ratings, "--ratings", p.rerouteRatings, "--out", p.scorecards]);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /only accepted together with --routing/);
});

// ---------------------------------------------------------------------------
// --supplement: cb-probe's own per-rating validation decides, without touching earlier files
// ---------------------------------------------------------------------------
const supplement = (p, extra = []) => runBin("reroute-judges", [...withBank(p), "--supplement", "--seed", "9", ...extra]);
const p2 = (p) => ({
  batches: path.join(p.root, "judge-batches-reroute-2"),
  ratings: path.join(p.root, "judge-answers-reroute-2"),
  key: path.join(p.keys, "judge-key.reroute-2.json"),
});
const assemble2 = (p, extra = []) =>
  runBin("assemble-run", [
    ...withBank(p),
    "--artifact-root", p.artifacts,
    "--ratings", p.ratings,
    "--ratings", p.rerouteRatings,
    "--ratings", p2(p).ratings,
    "--routing", p2(p).key,
    "--out", p.scorecards,
    ...extra,
  ]);

/** Overwrite the evidence_quote of one response's rating inside the answer files of one directory. */
function setQuote(dir, responseId, quote, judge = "") {
  for (const f of readdirSync(dir)) {
    if (!f.endsWith(".json") || f === "answer-schema.json" || !f.startsWith(judge)) continue;
    const file = path.join(dir, f);
    const doc = readJsonFile(file);
    const hit = doc.ratings.find((x) => x.response_id === responseId);
    if (hit) {
      hit.evidence_quote = quote;
      writeJsonFile(file, doc);
      return true;
    }
  }
  return false;
}

test("SUPPLEMENT: applies cb-probe's own rule (a verbatim 1-word quote is selected, a verbatim 3+ word quote is not), earlier files are byte-identical, and the three-dir assembly completes", (t) => {
  const { p, sonnetBad } = pipeline(t, { badSonnetQuote: true });
  assert.equal(reroute(p, ["--requote"]).status, 0);
  answerReroute(p);

  const rk = readJsonFile(p.routingKey);
  const usedOriginal = [];
  const usedRerouted = [];
  for (const r of rk.responses) {
    for (const j of r.judges) {
      if (r.judge_provenance[j] === PROVENANCE.ORIGINAL) usedOriginal.push({ id: r.response_id, judge: j });
      if (r.judge_provenance[j] === PROVENANCE.REROUTED) usedRerouted.push({ id: r.response_id, judge: j });
    }
  }
  const oneWordOriginal = usedOriginal.find((x) => x.id !== sonnetBad);
  const oneWordRerouted = usedRerouted[0];
  const threeWords = usedOriginal.find((x) => x.id !== sonnetBad && x.id !== oneWordOriginal.id);

  // Both pairs must be edited in the file of the judge actually used for the pair, so edit by (response, judge).
  const setPairQuote = (dir, pair, quote) => {
    for (const f of readdirSync(dir)) {
      if (!f.endsWith(".json") || f === "answer-schema.json") continue;
      if (!f.startsWith(pair.judge)) continue;
      const file = path.join(dir, f);
      const doc = readJsonFile(file);
      const hit = doc.ratings.find((x) => x.response_id === pair.id);
      if (hit) {
        hit.evidence_quote = quote;
        writeJsonFile(file, doc);
        return true;
      }
    }
    return false;
  };
  // "fabricated" is verbatim in every fake reply; cb-probe refuses it as a non-substantive excerpt.
  assert.ok(setPairQuote(p.ratings, oneWordOriginal, "fabricated"));
  assert.ok(setPairQuote(p.rerouteRatings, oneWordRerouted, "fabricated"));
  assert.ok(setPairQuote(p.ratings, threeWords, "answer containing several")); // verbatim, 3 words: cb-probe accepts

  const before = { keys: hashDir(p.keys), ratings: hashDir(p.ratings), rr: hashDir(p.rerouteRatings), rb: hashDir(p.rerouteBatches) };
  const r = supplement(p);
  assert.equal(r.status, 0, r.stderr + r.stdout);
  assert.match(r.stdout, /selected 2\./);
  assert.match(r.stdout, /substantive excerpt/);

  // earlier artefacts byte-identical; the only new key file is reroute-2
  const after = { keys: hashDir(p.keys), ratings: hashDir(p.ratings), rr: hashDir(p.rerouteRatings), rb: hashDir(p.rerouteBatches) };
  for (const k of ["ratings", "rr", "rb"]) assert.deepEqual(after[k], before[k], `${k} changed`);
  for (const [f, h] of Object.entries(before.keys)) assert.equal(after.keys[f], h, `${f} was modified`);
  assert.deepEqual(Object.keys(after.keys).sort(), [...Object.keys(before.keys), "judge-key.reroute-2.json"].sort());

  const k2 = readJsonFile(p2(p).key);
  const chosen = k2.supplements[0].selected.map((s) => `${s.response_id}|${s.judge}`).sort();
  assert.deepEqual(chosen, [`${oneWordOriginal.id}|${oneWordOriginal.judge}`, `${oneWordRerouted.id}|${oneWordRerouted.judge}`].sort());
  assert.ok(!chosen.includes(`${threeWords.id}|${threeWords.judge}`));
  assert.ok(k2.supplements[0].selected.every((s) => /substantive excerpt/.test(s.reason)));
  assert.equal(k2.previous_key.sha256, sha256(readFileSync(p.routingKey, "utf8")));
  const oRow = k2.responses.find((x) => x.response_id === oneWordOriginal.id);
  assert.equal(oRow.judge_provenance[oneWordOriginal.judge], PROVENANCE.REQUOTED);
  assert.equal(oRow.rating_source[oneWordOriginal.judge], "reroute-2");
  const rRow = k2.responses.find((x) => x.response_id === oneWordRerouted.id);
  assert.equal(rRow.judge_provenance[oneWordRerouted.judge], PROVENANCE.REROUTED); // provenance not rewritten
  assert.equal(rRow.rating_source[oneWordRerouted.judge], "reroute-2");
  // every earlier batch is carried over verbatim; new batches are tagged reroute-2
  assert.deepEqual(k2.batches.slice(0, rk.batches.length), rk.batches);
  assert.ok(k2.batches.slice(rk.batches.length).every((b) => b.source === "reroute-2"));
  assert.doesNotThrow(() => validateRoutingKey(k2, readJsonFile(path.join(p.keys, "judge-key.json"))));

  // new batches: blind, and hold exactly the two selected pairs
  const seen = [];
  for (const f of listJson(p2(p).batches)) {
    const batch = readJsonFile(path.join(p2(p).batches, f));
    const md = readFileSync(path.join(p2(p).batches, f.replace(/\.json$/, ".md")), "utf8");
    assert.doesNotMatch(md + JSON.stringify(batch), /haiku|sonnet|opus|fable|trial/i);
    for (const e of batch.entries) seen.push(`${e.response_id}|${f.split("__")[0]}`);
  }
  assert.deepEqual(seen.sort(), chosen);

  // never overwrites
  const again = supplement(p);
  assert.equal(again.status, 1);
  assert.match(again.stderr, /already exists/);

  // the three-directory assembly refuses before the fresh answers exist, and completes after
  let a = assemble2(p);
  assert.equal(a.status, 1, a.stderr + a.stdout);
  assert.match(a.stderr, /does not exist/);
  mkdirSync(p2(p).ratings, { recursive: true });
  a = assemble2(p);
  assert.equal(a.status, 1, a.stderr + a.stdout);
  assert.match(a.stderr, /no answer file for batch/);
  writeFakeJudgeAnswers(p2(p).batches, p2(p).ratings);
  a = assemble2(p);
  assert.equal(a.status, 3, a.stderr + a.stdout);
  writeFakeProbeAnswers(path.join(p.scorecards, "probe-briefs"), p.probeAnswers);
  a = assemble2(p, ["--probe-answers", p.probeAnswers]);
  assert.equal(a.status, 0, a.stderr + a.stdout);
  for (const subject of SUBJECT_LABELS) {
    const sc = readJsonFile(path.join(p.scorecards, `${subject}.scorecard.json`));
    assert.deepEqual(validateSelfRunScorecard(sc), { valid: true, errors: [] });
    assert.equal(sc.composite, computeCompositeFromDimensions(sc.dimensions).composite);
  }
});

test("SUPPLEMENT: a clean run selects nothing and writes nothing; without a supplement the assembler refuses a verbatim 1-word quote", (t) => {
  const { p } = pipeline(t);
  assert.equal(reroute(p).status, 0);
  answerReroute(p);
  const rk = readJsonFile(p.routingKey);
  const victim = rk.responses.find((x) => Object.values(x.judge_provenance).includes(PROVENANCE.ORIGINAL));
  const vjudge = Object.keys(victim.judge_provenance).find((j) => victim.judge_provenance[j] === PROVENANCE.ORIGINAL);
  assert.ok(setQuote(p.ratings, victim.response_id, "fabricated", vjudge));
  const control = assemble(p);
  assert.equal(control.status, 1);
  assert.match(control.stderr, /substantive excerpt/);

  assert.ok(setQuote(p.ratings, victim.response_id, "this is a fabricated answer", vjudge));
  const r = supplement(p);
  assert.equal(r.status, 0, r.stderr + r.stdout);
  assert.match(r.stdout, /selected 0\./);
  assert.ok(!existsSync(p2(p).key) && !existsSync(p2(p).batches));
});

test("REQUOTE (first round) also uses cb-probe's rule; a superseded original is never reselected by --supplement; a second supplement refuses", (t) => {
  const { p } = pipeline(t);
  const orig = readJsonFile(path.join(p.keys, "judge-key.json"));
  const victim = orig.responses.find((x) => !x.judges.includes(EXCL));
  const vj = victim.judges[0];
  // setQuote edits the first file containing the response; both judges' files contain it, so pin to the victim judge's file.
  const f = readdirSync(p.ratings).find((x) => x.startsWith(vj) && readJsonFile(path.join(p.ratings, x)).ratings.some((y) => y.response_id === victim.response_id));
  const doc = readJsonFile(path.join(p.ratings, f));
  doc.ratings.find((y) => y.response_id === victim.response_id).evidence_quote = "fabricated";
  writeJsonFile(path.join(p.ratings, f), doc);

  let r = reroute(p, ["--requote"]);
  assert.equal(r.status, 0, r.stderr + r.stdout);
  assert.match(r.stdout, /Requoted ratings:\s+1 \(of which 1 are verbatim but rejected by cb-probe/);
  answerReroute(p);

  // the superseded one-word original is not looked at; nothing else is wrong
  r = supplement(p);
  assert.equal(r.status, 0, r.stderr + r.stdout);
  assert.match(r.stdout, /selected 0\./);

  // now make the reroute answer one word: only that pair is selected, from the reroute source
  const rf = readdirSync(p.rerouteRatings).find((x) => readJsonFile(path.join(p.rerouteRatings, x)).ratings.some((y) => y.response_id === victim.response_id));
  const rdoc = readJsonFile(path.join(p.rerouteRatings, rf));
  rdoc.ratings.find((y) => y.response_id === victim.response_id).evidence_quote = "answer";
  writeJsonFile(path.join(p.rerouteRatings, rf), rdoc);
  r = supplement(p);
  assert.equal(r.status, 0, r.stderr + r.stdout);
  const k2 = readJsonFile(p2(p).key);
  assert.deepEqual(k2.supplements[0].selected.map((s) => `${s.response_id}|${s.judge}|${s.from_source}`), [`${victim.response_id}|${vj}|reroute`]);

  // only one supplement round is supported per chain
  writeFakeJudgeAnswers(p2(p).batches, p2(p).ratings);
  r = supplement(p, ["--from-key", p2(p).key, "--out", path.join(p.root, "judge-batches-reroute-3"), "--key-file", path.join(p.keys, "judge-key.reroute-3.json")]);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /already a supplement/);
});
