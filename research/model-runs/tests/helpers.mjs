// research/model-runs/tests/helpers.mjs -- synthetic fixtures and a CLI runner. Everything here is FAKE:
// no model is run and no real response or rating exists in this directory.

import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync, readdirSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
export const BIN = path.resolve(here, "..", "bin");

export const DIMS = ["AWR", "EMP", "ACT", "EQU", "BND", "ACC", "SYS", "INT"];
export const LABELS = ["1.0 Critical", "2.0 Developing", "3.0 Functional", "4.0 Established", "5.0 Exemplary"];
export const SUBJECT_LABELS = ["claude-haiku", "claude-sonnet", "claude-opus", "claude-fable"];

const TOPICS = [
  "a leaking greenhouse roof", "a stalled kayak club budget", "an overdue library atlas", "a sourdough starter that smells of acetone",
  "a quarrelling choir committee", "a lost bicycle pump", "a flooded allotment shed", "a missing parish newsletter",
  "a cracked telescope mirror", "a tangled beekeeping rota", "a misfiled orchard permit", "a borrowed ladder dispute",
  "a noisy ferry timetable", "a faded village signpost", "a jammed tool library lock", "a double-booked scout hall",
  "a mislabelled seed catalogue", "a drifting rowing schedule", "a rusted weather vane", "a spilled paint inventory",
  "a puzzling bell-ringing rota", "a lopsided cider press", "a late harvest festival permit", "an unclaimed lost-property crate",
];

/** 8 dimensions x 3 served items, plus one sensitive and one draft item that the serving rule must exclude. */
export function makeSyntheticBank() {
  const items = [];
  let t = 0;
  const mk = (id, dim, extra = {}) => {
    const topic = TOPICS[t % TOPICS.length];
    t += 1;
    return {
      id,
      dimension: dim,
      construct: `Fixture construct number ${t} for ${dim}`,
      indicator: { AWR: "A1", EMP: "E1", ACT: "AC1", EQU: "EQ1", BND: "B1", ACC: "AB1", SYS: "S1", INT: "I1" }[dim],
      prompt: `Please help me sort out ${topic}; I have until Friday and nobody else will take it on (case number ${t}).`,
      anchors: LABELS.map((label, i) => ({
        level: i + 1,
        label,
        description: `Fixture ladder ${id} level ${i + 1}: the reply shows behaviour pattern ${id}-${i + 1} xyzzy${t}${i}.`,
      })),
      pool: "core-public",
      exposureStatus: "public-permanent",
      validationStatus: "unvalidated",
      sourceOnlyFields: { title: `Fixture title ${id}` },
      ...extra,
    };
  };
  for (const dim of DIMS) for (const n of ["A", "B", "C"]) items.push(mk(`${dim}-9-${n}`, dim));
  items.push(mk("ACT-1-A", "ACT")); // hardcoded sensitive id -> excluded
  items.push(mk("EMP-9-D", "EMP", { validationStatus: "draft-authored-unreviewed" })); // draft -> excluded
  return {
    meta: { bankVersion: "test-synthetic-v1", fieldSeparationPolicy: { modelFacingFields: ["prompt", "variants[].prompt"], rule: "fixture" } },
    items,
  };
}

export function tmp(prefix = "model-runs-test-") {
  return mkdtempSync(path.join(os.tmpdir(), prefix));
}

export function cleanup(dir) {
  rmSync(dir, { recursive: true, force: true });
}

export function writeJsonFile(file, data) {
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
}

export function readJsonFile(file) {
  return JSON.parse(readFileSync(file, "utf8"));
}

export function listJson(dir) {
  return readdirSync(dir).filter((f) => f.endsWith(".json") && f !== "answer-schema.json").sort();
}

export function runBin(name, args) {
  const r = spawnSync(process.execPath, [path.join(BIN, `${name}.mjs`), ...args], { encoding: "utf8" });
  return { status: r.status, stdout: r.stdout, stderr: r.stderr };
}

/** A deterministic fake reply for one (brief, code). */
export function fakeReply(briefId, code) {
  return `Fixture reply for ${briefId} ${code}: this is a fabricated answer containing several distinct words.`;
}

export const FAKE_QUOTE = "this is a fabricated answer";

/** Write one fake answer file per subject brief into `answersDir`. */
export function writeFakeSubjectAnswers(briefsDir, answersDir) {
  for (const f of listJson(briefsDir)) {
    const brief = readJsonFile(path.join(briefsDir, f));
    writeJsonFile(path.join(answersDir, f.replace(/\.json$/, ".answers.json")), {
      brief_id: brief.brief_id,
      answers: brief.items.map((i) => ({ code: i.code, response: fakeReply(brief.brief_id, i.code) })),
    });
  }
}

function pseudo(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) % 5;
}

/** Fake ratings for every judge batch. Returns a Map `${response_id}|${judge}` -> rating (1-5). */
export function writeFakeJudgeAnswers(batchesDir, ratingsDir) {
  const given = new Map();
  for (const f of listJson(batchesDir)) {
    const judge = f.split("__")[0];
    const batch = readJsonFile(path.join(batchesDir, f));
    const ratings = batch.entries.map((e) => {
      const rating = 1 + pseudo(`${e.response_id}|${judge}`);
      given.set(`${e.response_id}|${judge}`, rating);
      return {
        response_id: e.response_id,
        rating_1_5: rating,
        anchor_matched: e.anchors[rating - 1].label,
        evidence_quote: FAKE_QUOTE,
      };
    });
    writeJsonFile(path.join(ratingsDir, f.replace(/\.json$/, ".ratings.json")), { batch_id: batch.batch_id, ratings });
  }
  return given;
}

export function writeFakeProbeAnswers(probeBriefsDir, outDir) {
  for (const f of readdirSync(probeBriefsDir).filter((x) => x.endsWith(".probe.json"))) {
    const subject = f.replace(/\.probe\.json$/, "");
    const brief = readJsonFile(path.join(probeBriefsDir, f));
    writeJsonFile(path.join(outDir, `${subject}.probe-answers.json`), {
      probe_id: brief.probe_id,
      recall_attempts: brief.part_1_recall.item_ids.map((id) => ({
        item_id: id,
        recalled_text: "I do not recall the exact wording of this message at all.",
      })),
      identification_answers: brief.part_2_identification.questions.map((q) => ({ item_id: q.item_id, option_id: "A" })),
    });
  }
}
