// End-to-end through the four real CLIs on a SYNTHETIC bank with FAKE answers and FAKE ratings.
// Nothing here is a model output or a score of any real model.

import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { existsSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { computeCompositeFromDimensions, DIMENSION_CODES } from "../../../tools/cb-probe/lib/canonical.mjs";
import { validateSelfRunScorecard } from "../../../tools/cb-probe/lib/validate-scorecard.mjs";
import { findControlByte } from "../lib/common.mjs";
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
  FAKE_QUOTE,
} from "./helpers.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));

function setup(t) {
  const base = tmp();
  t.after(() => cleanup(base));
  const bankFile = path.join(base, "bank.json");
  writeJsonFile(bankFile, makeSyntheticBank());
  const root = path.join(base, "run");
  const p = {
    base,
    bankFile,
    root,
    briefs: path.join(root, "subject-briefs"),
    keys: path.join(root, "keys"),
    answers: path.join(base, "subject-answers"),
    batches: path.join(root, "judge-batches"),
    ratings: path.join(base, "judge-answers"),
    probeAnswers: path.join(base, "probe-answers"),
    artifacts: path.join(base, "artifacts"),
    scorecards: path.join(root, "scorecards"),
  };
  return p;
}

const common = (p) => ["--run-id", "e2e", "--run-root", p.root];
const withBank = (p) => [...common(p), "--bank", p.bankFile];

function pipelineToBatches(p) {
  let r = runBin("build-subject-briefs", [...withBank(p), "--out", p.briefs, "--seed", "11"]);
  assert.equal(r.status, 0, r.stderr + r.stdout);
  writeFakeSubjectAnswers(p.briefs, p.answers);
  r = runBin("ingest-answers", [...common(p), "--answers", p.answers]);
  assert.equal(r.status, 0, r.stderr + r.stdout);
  r = runBin("build-judge-batches", [...withBank(p), "--out", p.batches, "--batch-size", "40", "--seed", "12"]);
  assert.equal(r.status, 0, r.stderr + r.stdout);
  return r;
}

test("key must live outside the output directory: --key-out inside --out is refused by both builders", (t) => {
  const p = setup(t);
  let r = runBin("build-subject-briefs", [...withBank(p), "--out", p.briefs, "--key-out", path.join(p.briefs, "keys")]);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /inside --out/);
  assert.ok(!existsSync(p.briefs), "nothing is written when the key location is refused");
  r = runBin("build-subject-briefs", [...withBank(p), "--out", p.root]); // default key dir <root>/keys is inside --out
  assert.equal(r.status, 1);
  assert.match(r.stderr, /inside --out/);
});

test("the subject-brief builder FAILS CLOSED over the CLI when a prompt carries an anchor (planted in the bank), and writes nothing", (t) => {
  const p = setup(t);
  const bank = makeSyntheticBank();
  // Plant: one item's prompt now contains another item's anchor text, as if the bank had been mis-edited.
  bank.items[0].prompt = `${bank.items[0].prompt} ${bank.items[5].anchors[3].description}`;
  writeJsonFile(p.bankFile, bank);
  const r = runBin("build-subject-briefs", [...withBank(p), "--out", p.briefs]);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /leaks rubric material/);
  assert.ok(!existsSync(path.join(p.keys, "subject-brief-key.json")));
  assert.ok(!existsSync(p.briefs) || readdirSync(p.briefs).length === 0);
});

test("ingest refuses a partial: missing code, missing file, duplicate code. Nothing is ingested.", (t) => {
  const p = setup(t);
  let r = runBin("build-subject-briefs", [...withBank(p), "--out", p.briefs, "--seed", "11"]);
  assert.equal(r.status, 0, r.stderr);
  writeFakeSubjectAnswers(p.briefs, p.answers);

  const files = readdirSync(p.answers).sort();
  const first = path.join(p.answers, files[0]);
  const doc = readJsonFile(first);
  const dropped = doc.answers.pop();
  writeJsonFile(first, doc);
  const second = path.join(p.answers, files[1]);
  const d2 = readJsonFile(second);
  d2.answers.push({ ...d2.answers[0] });
  writeJsonFile(second, d2);
  rmSync(path.join(p.answers, files[2]));

  r = runBin("ingest-answers", [...common(p), "--answers", p.answers]);
  assert.equal(r.status, 1);
  assert.match(r.stderr, new RegExp(`not answered: ${dropped.code}`));
  assert.match(r.stderr, /answered more than once/);
  assert.match(r.stderr, /no answer file for/);
  assert.ok(!existsSync(path.join(p.keys, "ingested", "answers.json")));
});

test("assemble refuses a judge answer whose evidence_quote is not in the response, and records nothing", (t) => {
  const p = setup(t);
  pipelineToBatches(p);
  writeFakeJudgeAnswers(p.batches, p.ratings);
  const f = path.join(p.ratings, readdirSync(p.ratings).sort()[0]);
  const doc = readJsonFile(f);
  doc.ratings[0].evidence_quote = "words that the reply never contained";
  writeJsonFile(f, doc);

  const r = runBin("assemble-run", [...withBank(p), "--artifact-root", p.artifacts, "--ratings", p.ratings, "--out", p.scorecards]);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /not a verbatim substring/);
  assert.ok(!existsSync(path.join(p.keys, "assembly-state.json")));
  assert.ok(!existsSync(p.scorecards));
});

test("assemble surfaces a SCORER rule (anchor_matched must equal the published label) attributed to response and judge, saving no state", (t) => {
  const p = setup(t);
  pipelineToBatches(p);
  writeFakeJudgeAnswers(p.batches, p.ratings);
  const f = path.join(p.ratings, readdirSync(p.ratings).sort()[0]);
  const doc = readJsonFile(f);
  doc.ratings[0].anchor_matched = "a made-up anchor name";
  writeJsonFile(f, doc);
  const r = runBin("assemble-run", [...withBank(p), "--artifact-root", p.artifacts, "--ratings", p.ratings, "--out", p.scorecards]);
  assert.equal(r.status, 1);
  assert.match(r.stderr, new RegExp(`response ${doc.ratings[0].response_id}, judge claude-`));
  assert.match(r.stderr, /does not EXACTLY match/);
  assert.ok(!existsSync(path.join(p.keys, "assembly-state.json")));
});

test("END TO END: briefs -> ingest -> judge batches -> assemble (awaiting probe) -> probes -> scorecards that validate and agree with the canonical composite", (t) => {
  const p = setup(t);
  const bank = readJsonFile(p.bankFile);
  const built = pipelineToBatches(p);
  assert.match(built.stdout, /Responses:\s+288/); // 4 subjects x 3 trials x 24 served items

  // Key files are outside both distributable directories.
  assert.ok(existsSync(path.join(p.keys, "subject-brief-key.json")));
  assert.ok(existsSync(path.join(p.keys, "judge-key.json")));
  assert.ok(!existsSync(path.join(p.briefs, "subject-brief-key.json")));
  assert.ok(!readdirSync(p.batches).some((f) => /key/.test(f)));

  const given = writeFakeJudgeAnswers(p.batches, p.ratings);
  const judgeKey = readJsonFile(path.join(p.keys, "judge-key.json"));
  const subjectKey = readJsonFile(path.join(p.keys, "subject-brief-key.json"));
  assert.equal(subjectKey.served_item_ids.length, 24);
  assert.deepEqual(subjectKey.excluded_items.map((e) => e.id), ["ACT-1-A", "EMP-9-D"]);

  // pass 1: ratings recorded, probe briefs issued, scorecards not yet written
  let r = runBin("assemble-run", [...withBank(p), "--artifact-root", p.artifacts, "--ratings", p.ratings, "--out", p.scorecards]);
  assert.equal(r.status, 3, r.stderr + r.stdout);
  assert.match(r.stdout, /AWAITING PROBE ANSWERS/);
  assert.ok(existsSync(path.join(p.keys, "assembly-state.json")));
  assert.ok(!existsSync(path.join(p.scorecards, "claude-opus.scorecard.json")));
  const probeDir = path.join(p.scorecards, "probe-briefs");
  assert.equal(readdirSync(probeDir).filter((f) => f.endsWith(".probe.json")).length, 4);

  // pass 2 without the answers must not pretend: still awaiting
  r = runBin("assemble-run", [...withBank(p), "--artifact-root", p.artifacts, "--out", p.scorecards]);
  assert.equal(r.status, 3);

  writeFakeProbeAnswers(probeDir, p.probeAnswers);
  r = runBin("assemble-run", [...withBank(p), "--artifact-root", p.artifacts, "--probe-answers", p.probeAnswers, "--out", p.scorecards]);
  assert.equal(r.status, 0, r.stderr + r.stdout);

  // Independent expectation, derived from the fake ratings this test itself generated.
  const respInfo = new Map(judgeKey.responses.map((x) => [x.response_id, x]));
  for (const subject of SUBJECT_LABELS) {
    const sc = readJsonFile(path.join(p.scorecards, `${subject}.scorecard.json`));
    const audit = readJsonFile(path.join(p.scorecards, `${subject}.assembly-audit.json`));

    // schema + non-official + provenance
    assert.deepEqual(validateSelfRunScorecard(sc), { valid: true, errors: [] });
    assert.equal(sc.official, false);
    assert.equal(sc.comparability, "none");
    assert.equal(sc.provenance.judge_configuration, "panel");
    const prov = `${sc.provenance.subject_label} || ${sc.provenance.judge_label}`;
    for (const frag of ["access tier: agent", "same-family", "publicly exposed", "no human raters", "snapshot id unverifiable"]) {
      assert.ok(prov.includes(frag), `provenance should state "${frag}"`);
    }
    assert.equal(audit.provenance_note.human_raters, "none");
    assert.match(audit.provenance_note.scorer_representation_caveat, /one scorer trial/);

    // every scorer row is a (response, judge) pair; judges are never the subject; two per response
    assert.equal(sc.provenance.trials_per_item, 6);
    const perResponse = new Map();
    for (const row of audit.row_mapping) {
      assert.notEqual(row.judge, subject, "a judge rated its own subject's response");
      assert.equal(respInfo.get(row.response_id).subject, subject);
      perResponse.set(row.response_id, [...(perResponse.get(row.response_id) ?? []), row.judge]);
      assert.equal(row.rating_1_5, given.get(`${row.response_id}|${row.judge}`));
    }
    assert.equal(perResponse.size, 24 * 3);
    for (const judges of perResponse.values()) assert.equal(new Set(judges).size, 2);

    // dimension means recomputed from the FAKE ratings, then composite from the canonical function
    const dims = {};
    for (const code of DIMENSION_CODES) {
      const items = bank.items.filter((i) => i.dimension === code && audit.row_mapping.some((m) => m.item_id === i.id));
      const itemMeans = items.map((i) => {
        const rs = audit.row_mapping.filter((m) => m.item_id === i.id).map((m) => m.rating_1_5);
        return rs.reduce((a, b) => a + b, 0) / rs.length;
      });
      dims[code] = itemMeans.reduce((a, b) => a + b, 0) / itemMeans.length;
      assert.ok(Math.abs(sc.dimensions[code] - dims[code]) < 1e-9, `${subject} ${code}`);
      assert.equal(sc.dimension_item_counts[code], 3);
    }
    assert.notEqual(sc.composite, null);
    assert.equal(sc.composite, computeCompositeFromDimensions(sc.dimensions).composite);
    assert.equal(sc.band, computeCompositeFromDimensions(sc.dimensions).band);
    assert.ok(Math.abs(sc.composite - computeCompositeFromDimensions(dims).composite) < 1e-6);

    // panel block: scorer-computed, two or three distinct judges per item, none of them the subject
    assert.ok(sc.judge_panel);
    const judgesSeen = new Set();
    for (const entry of Object.values(sc.judge_panel.per_item)) {
      assert.ok(entry.distinct_judges >= 2);
      for (const j of entry.judges) judgesSeen.add(j.judge_label);
    }
    assert.ok(!judgesSeen.has(subject));
    assert.ok(audit.paired_judge_agreement.responses === 72);
    for (const item of sc.items) for (const tr of item.trials) assert.ok(tr.response_text.length > 0 && tr.evidence_quote === FAKE_QUOTE);
  }
});

test("a judge answer set missing a whole batch is refused (no silent partials)", (t) => {
  const p = setup(t);
  pipelineToBatches(p);
  writeFakeJudgeAnswers(p.batches, p.ratings);
  const files = readdirSync(p.ratings).sort();
  // drop one judge batch file entirely
  rmSync(path.join(p.ratings, files[0]));
  const r = runBin("assemble-run", [...withBank(p), "--artifact-root", p.artifacts, "--ratings", p.ratings, "--out", p.scorecards]);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /no answer file for batch/);
  assert.ok(!existsSync(path.join(p.keys, "assembly-state.json")));
});

// ---------------------------------------------------------------------------
// DC-21: no raw control bytes in this directory's source. With a positive control.
// ---------------------------------------------------------------------------
function walk(dir) {
  const out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === "node_modules") continue;
      out.push(...walk(full));
    } else if (/\.(mjs|md|json)$/.test(e.name)) out.push(full);
  }
  return out;
}

test("DC-21: no raw control byte in any model-runs source file (positive control: the detector fires)", () => {
  assert.notEqual(findControlByte(`a${String.fromCharCode(1)}b`), -1, "positive control: detector must fire on a planted byte");
  assert.equal(findControlByte("tab\tand\nnewline are fine"), -1);
  const root = path.resolve(here, "..");
  const sources = walk(root).filter((f) => !/pilot-/.test(path.relative(root, f)));
  assert.ok(sources.length >= 10, "must actually scan files");
  for (const f of sources) {
    const text = readFileSync(f, "utf8");
    const bad = text.search(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/);
    assert.equal(bad, -1, `${f} contains a raw control byte at offset ${bad}`);
  }
});

test("the harness contains no scoring arithmetic of its own: composite and band come from cb-probe only", () => {
  const root = path.resolve(here, "..");
  const libs = walk(path.join(root, "lib")).concat(walk(path.join(root, "bin"))).filter((f) => f.endsWith(".mjs"));
  const text = libs.map((f) => readFileSync(f, "utf8")).join("\n");
  assert.ok(!/function\s+(compute|calc)\w*(Composite|Band|Score)/i.test(text));
  // The canonical function is called in exactly these files, never re-implemented:
  //  - assemble.mjs: read-only cross-check of the scorer's output.
  //  - analyze-pilot.mjs (added 2026-10-01): recomputes each composite to verify the scorecard, and computes
  //    item-resampled bootstrap composites WITH the canonical function, so its intervals carry no scoring
  //    arithmetic of their own. It writes only analysis.json, never a scorecard or score store.
  const users = libs.filter((f) => /computeCompositeFromDimensions\(/.test(readFileSync(f, "utf8"))).map((f) => path.basename(f)).sort();
  assert.deepEqual(users, ["analyze-pilot.mjs", "assemble.mjs"]);
  // ...and every caller imports it from the one canonical module, not a copy.
  for (const f of libs.filter((x) => ["analyze-pilot.mjs", "assemble.mjs"].includes(path.basename(x)))) {
    assert.match(readFileSync(f, "utf8"), /site[\\/"', +]*scripts[\\/"', +]*lib[\\/"', +]*scoring\.mjs|from "\.\/scoring-bridge\.mjs"|cb-probe/, `${path.basename(f)} must import the canonical scorer`);
  }
});
