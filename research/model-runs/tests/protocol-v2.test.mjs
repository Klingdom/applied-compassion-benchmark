// protocol-v2.test.mjs -- WP-1 (docs/model-eval/ARCHITECTURE_EVAL_V2.md). The proposed v2 protocol validates while
// "proposed", cannot be ratified while any of O1..O15 is open, and carries every v1 field. All probes mutate
// in-memory copies only; no file is written.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  PROTOCOL_V2_FILE, OPEN_VALUE_PATHS, V1_TO_V2_PATHS, loadProtocolV2, validateProtocolV2
} from "../lib/protocol-v2.mjs";

const V1_FILE = new URL("../weekly/PROTOCOL.json", import.meta.url);
const real = () => JSON.parse(readFileSync(PROTOCOL_V2_FILE, "utf8"));
const getPath = (o, p) => p.split(".").reduce((x, k) => x?.[k], o);
const setPath = (o, p, v) => {
  const ks = p.split(".");
  const last = ks.pop();
  ks.reduce((x, k) => x[k], o)[last] = v;
};
const problemsOf = (obj) => validateProtocolV2(obj).problems.join(" | ");

test("the real file validates as proposed with 15 open values O1..O15", () => {
  const r = loadProtocolV2();
  assert.equal(r.ok, true, r.problems.join("; "));
  assert.equal(r.protocol.status, "proposed");
  assert.equal(r.protocol.protocol_version, "weekly-v2");
  assert.equal(r.openValues.length, 15);
  assert.deepEqual(r.openValues.map((o) => o.id), Array.from({ length: 15 }, (_, i) => `O${i + 1}`));
});

test("O1 offers the local single-family option and a 3-family option", () => {
  const o1 = real().judges;
  assert.ok(o1.options.some((s) => s.startsWith("v2.0-local: three current Claude judges by hand, single-family, no key")));
  assert.ok(o1.options.some((s) => s.startsWith("v2-3family")));
});

test("every v1 field of PROTOCOL.json is carried at its v2 path with the v1 value, unless v2 documents a change", () => {
  const v1 = JSON.parse(readFileSync(V1_FILE, "utf8"));
  const v2 = real();
  for (const k of Object.keys(v1)) assert.ok(k in V1_TO_V2_PATHS, `v1 key ${k} has no v2 mapping`);
  for (const [k, p] of Object.entries(V1_TO_V2_PATHS)) assert.notEqual(getPath(v2, p), undefined, `${k} -> ${p}`);
  // Fields with no change in v2 are equal to v1.
  for (const k of ["ollama_host", "trials", "max_retries", "system_message", "arm", "bank_sha256", "judges_per_response",
    "max_batch_entries", "judge_validity", "bootstrap_replicates", "correction", "reference"]) {
    assert.deepEqual(v2[k], v1[k], k);
  }
  assert.equal(v2.local.vram_budget_gb, v1.vram_budget_gb);
  assert.equal(v2.local.max_model_size_gb, v1.max_model_size_gb);
  assert.equal(v2.local.size_unit, v1.size_unit);
  assert.equal(v2.anchor.max_mean_abs_difference, v1.anchor.max_mean_abs_difference);
  assert.equal(v2.max_new_subjects_per_wave.options.includes(v1.max_new_subjects_per_wave), true);
});

test("proposed_requirements never claims an implementation", () => {
  const pr = real().proposed_requirements;
  const flags = [];
  const walk = (n) => {
    if (Array.isArray(n)) n.forEach(walk);
    else if (n && typeof n === "object") {
      if ("implemented" in n) flags.push(n.implemented);
      Object.values(n).forEach(walk);
    }
  };
  walk(pr);
  assert.ok(flags.length >= 5);
  assert.ok(flags.every((f) => f === false));
});

test("probe: status ratified with open values is refused and names every open path", () => {
  const p = real();
  p.status = "ratified";
  const r = validateProtocolV2(p);
  assert.equal(r.ok, false);
  assert.equal(r.openValues.length, 15);
  for (const [id, path] of Object.entries(OPEN_VALUE_PATHS)) assert.match(r.problems.join(" | "), new RegExp(`${id} \\(${path.replace(/\./g, "\\.")}\\)`));
});

test("probe: a missing O-id is refused", () => {
  const p = real();
  delete p.gates.family_gap_max_composite;
  assert.match(problemsOf(p), /O10 is missing/);
});

test("probe: a duplicated O-id is refused", () => {
  const p = real();
  p.gates.extra = structuredClone(p.gates.agreement_floor_exact);
  assert.match(problemsOf(p), /O9 appears 2 times/);
});

test("probe: an open block that is not an O-id, or sits at the wrong path, is refused", () => {
  const p = real();
  p.cost.stray = { open: true, id: "O99", proposed_default: 1, options: [1], source: "x" };
  assert.match(problemsOf(p), /O99 is not one of O1\.\.O15|not one of O1\.\.O15/);
  const q = real();
  q.cost.monthly_ceiling.id = "O3";
  assert.match(problemsOf(q), /O3 appears 2 times/);
});

test("probe: an unknown top-level key is refused", () => {
  const p = real();
  p.surprise = 1;
  assert.match(problemsOf(p), /unknown top-level key "surprise"/);
});

test("probe: flipping protocol_version is refused", () => {
  const p = real();
  p.protocol_version = "weekly-v1";
  assert.match(problemsOf(p), /protocol_version must be "weekly-v2"/);
});

test("probe: a bad status and a missing v1 field are refused", () => {
  const p = real();
  p.status = "retired";
  delete p.local.vram_budget_gb;
  const s = problemsOf(p);
  assert.match(s, /status must be "proposed" or "ratified"/);
  assert.match(s, /v1 field vram_budget_gb is missing at local\.vram_budget_gb/);
});

test("positive control: a fully closed copy with status ratified is accepted", () => {
  const p = real();
  p.status = "ratified";
  for (const [id, path] of Object.entries(OPEN_VALUE_PATHS)) {
    const b = getPath(p, path);
    assert.equal(b.id, id);
    setPath(p, path, { id, open: false, value: b.proposed_default });
  }
  const r = validateProtocolV2(p);
  assert.equal(r.ok, true, r.problems.join("; "));
  assert.equal(r.openValues.length, 0);
});

test("a closed block without a value is refused", () => {
  const p = real();
  p.cost.monthly_ceiling = { id: "O15", open: false };
  assert.match(problemsOf(p), /O15: a closed block needs a value/);
});

test("non-object input is refused without throwing", () => {
  assert.equal(validateProtocolV2(null).ok, false);
  assert.equal(validateProtocolV2([]).ok, false);
});
