// review-packet.test.mjs -- the generated results-review packet (lib/review-packet.mjs, bin/review-packet.mjs).
// In-memory fixtures; no model is run. A real-data block at the end runs the CLI on pilot-2026-10-03 into a temp dir.

import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { BANNED_WORDS, MAX_ASKS, PUBLISHABLE_ITEMS, TEXT, buildPacket, collectOpenValues, lintPacket } from "../lib/review-packet.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const BIN = path.resolve(here, "..", "bin", "review-packet.mjs");
const PILOT3 = "pilot-2026-10-03";

const g = (id, status, detail = `${id} ${status}`, evidence = {}) => ({ id, status, detail, evidence });
const ALL_IDS = [...new Set(PUBLISHABLE_ITEMS.flatMap((i) => i.requires))];
const allPass = () => ALL_IDS.map((id) => g(id, "pass", `${id} measured and passing`));
const cleanAudit = () => ({
  kind: "claim-audit-run", run_id: "w", records: 4, first_record: "2026-01-01T00:00:00.000Z", last_record: "2026-01-01T01:00:00.000Z",
  deviations: [{ id: "D1", date: "2026-01-01", title: "order changed" }], gaps: [], checks: [{ id: "truncation", status: "confirmed", detail: "all records ended stop" }], open_items: [],
});
const protocol = { a: { id: "O9", open: true, proposed_default: 0.759, options: [0.759] }, b: { c: { id: "O11", open: true, proposed_default: null, options: ["report-only"] } }, z: { id: "O1", open: false, value: 3 } };
const base = (over = {}) => ({
  waveId: "w", gates: allPass(), audit: cleanAudit(), openValues: collectOpenValues(protocol), subjects: ["zeta-9b", "alpha-3b", "mid-7b"],
  waivers: {}, loadProblems: [], files: [{ path: "x/run-config.json", sha256: "ab".repeat(32) }], tools: [{ name: "t", sha256: "cd".repeat(32) }],
  command: "node research/model-runs/bin/review-packet.mjs w", date: null, ...over,
});

test("collectOpenValues finds open blocks only, in O-number order", () => {
  assert.deepEqual(collectOpenValues(protocol).map((o) => o.id), ["O9", "O11"]);
});

test("HOLD fixture: nothing may be published, no item and no subject listed", () => {
  const gates = allPass().map((x) => (x.id === "G-agreement" ? g("G-agreement", "fail", "exact agreement under the floor 0.8: s 0.7") : x));
  const p = buildPacket(base({ gates }));
  assert.equal(p.json.verdict, "HOLD");
  assert.match(p.markdown, /Nothing may be published from this wave/);
  assert.equal(p.json.publishable.may_publish_nothing, true);
  assert.deepEqual(p.json.publishable.items, []);
  assert.deepEqual(p.json.publishable.subjects, []);
  assert.doesNotMatch(p.markdown, /alpha-3b/);
  assert.ok(p.json.gates.fail.some((x) => x.id === "G-agreement"));
});

test("a not-built gate keeps HOLD, and is generic: the same id as pass flips the verdict with no code change", () => {
  const nb = allPass().map((x) => (x.id === "G-claim-audit" ? g(x.id, "not-built", "not built yet") : x));
  const a = buildPacket(base({ gates: nb }));
  assert.equal(a.json.verdict, "HOLD");
  assert.equal(a.json.gates["not-built"][0].id, "G-claim-audit");
  const b = buildPacket(base({ gates: allPass() }));
  assert.equal(b.json.verdict, "READY");
});

test("READY fixture lists the publishable items and the subjects alphabetically", () => {
  const p = buildPacket(base());
  assert.equal(p.json.verdict, "READY");
  assert.deepEqual(p.json.publishable.items.map((i) => i.id), PUBLISHABLE_ITEMS.map((i) => i.id).filter((id) => id !== "anchor-drift" || ALL_IDS.includes("G-drift-signed")));
  assert.deepEqual(p.json.publishable.subjects, ["alpha-3b", "mid-7b", "zeta-9b"]);
  assert.ok(p.markdown.indexOf("alpha-3b") < p.markdown.indexOf("mid-7b") && p.markdown.indexOf("mid-7b") < p.markdown.indexOf("zeta-9b"));
  assert.match(p.markdown, /not a score, comparability none/);
  assert.doesNotMatch(p.markdown, /Nothing may be published/);
});

test("an item whose required gate is absent, waived or report-only is withheld or labelled, never silently listed", () => {
  const noDrift = allPass().filter((x) => x.id !== "G-drift-signed");
  const p = buildPacket(base({ gates: noDrift }));
  assert.equal(p.json.verdict, "READY");
  assert.ok(p.json.publishable.withheld.some((w) => w.id === "anchor-drift" && w.missing_gates.includes("G-drift-signed")));
  const ro = allPass().map((x) => (x.id === "G-agreement" ? g(x.id, "pass", "REPORT-ONLY (O9 open): 0.759", { report_only: true }) : x));
  const q = buildPacket(base({ gates: ro }));
  assert.ok(q.json.publishable.items.find((i) => i.id === "subject-ranges").report_only_gates.includes("G-agreement"));
  const waived = allPass().map((x) => (x.id === "G-keys" ? g(x.id, "fail", "tracked keys") : x));
  const w = buildPacket(base({ gates: waived, waivers: { "G-keys": "founder accepted, public pool" } }));
  assert.equal(w.json.verdict, "READY");
  assert.equal(w.json.gates.waived[0].waiver_reason, "founder accepted, public pool");
  assert.ok(w.json.publishable.withheld.some((x) => x.id === "subject-ranges"));
});

test("an open audit item, a missing audit and a load problem each force HOLD", () => {
  const open = { ...cleanAudit(), open_items: [{ check: "gap-1", detail: "no deviation explains it" }] };
  assert.equal(buildPacket(base({ audit: open })).json.verdict, "HOLD");
  assert.equal(buildPacket(base({ audit: null })).json.verdict, "HOLD");
  assert.equal(buildPacket(base({ loadProblems: ["bank: gone"] })).json.verdict, "HOLD");
  assert.match(buildPacket(base({ audit: null })).markdown, /OPEN, never a pass/);
});

test("asks: generated from failing gates and named open protocol values, each with a default", () => {
  const gates = allPass().map((x) => (x.id === "G-agreement" ? g(x.id, "pass", "REPORT-ONLY (no floor, O9 open): 0.759", { report_only: true }) : x.id === "G-drift-signed" ? g(x.id, "pass", "REPORT-ONLY (O11 open)", { report_only: true }) : x.id === "G-complete" ? g(x.id, "fail", "2 calls missing") : x));
  const p = buildPacket(base({ gates }));
  assert.deepEqual(p.json.asks.shown.map((a) => a.gate), ["G-complete", "G-agreement", "G-drift-signed"]);
  for (const a of p.json.asks.shown) assert.ok(a.default && a.default.length > 5);
  assert.match(p.json.asks.shown[1].default, /0\.759/);
  assert.match(p.json.asks.shown[2].default, /No default exists/);
});

test("the ask cap is 6 and the overflow is summarised, not dropped", () => {
  const gates = [];
  for (let i = 1; i <= 9; i += 1) gates.push(g(`G-x${i}`, "fail", `cause ${i}`));
  const p = buildPacket(base({ gates }));
  assert.equal(MAX_ASKS, 6);
  assert.equal(p.json.asks.shown.length, 6);
  assert.equal(p.json.asks.overflow.length, 3);
  assert.equal((p.markdown.match(/^### Ask \d+\./gm) ?? []).length, 6);
  assert.match(p.markdown, /Not asked, to stay within the cap of 6: 3 further item/);
  for (const i of [7, 8, 9]) assert.ok(p.markdown.includes(`Gate G-x${i} is fail`));
  for (const i of [1, 9]) assert.ok(p.markdown.includes(`\`G-x${i}\``)); // still listed in section 2
});

test("determinism: same inputs give byte-identical markdown and JSON; the date appears only when passed", () => {
  const a = buildPacket(base());
  const b = buildPacket(base());
  assert.equal(a.markdown, b.markdown);
  assert.equal(a.jsonText, b.jsonText);
  assert.doesNotMatch(a.markdown, /Date:/);
  const d = buildPacket(base({ date: "2026-10-26" }));
  assert.match(d.markdown, /^Date: 2026-10-26$/m);
  assert.equal(d.json.date, "2026-10-26");
  // input order of subjects does not change the output
  assert.equal(buildPacket(base({ subjects: ["mid-7b", "zeta-9b", "alpha-3b"] })).markdown, a.markdown);
});

test("no ranking wording in any generated packet or in the fixed template", () => {
  const re = new RegExp(`\\b(?:${BANNED_WORDS.join("|")})\\b`, "i");
  for (const [k, v] of Object.entries(TEXT)) assert.doesNotMatch(v, re, `TEXT.${k}`);
  for (const p of [buildPacket(base()), buildPacket(base({ gates: [g("G-a", "fail", "x")] }))]) {
    assert.doesNotMatch(p.markdown, re);
    assert.doesNotMatch(p.jsonText, re);
  }
});

// ---- planted probes: each fault must make the lint (and so the build) fail ----------------------------------------
test("PROBE ranking word in the template: the build throws and the lint names it", () => {
  for (const word of ["Best", "winner", "Top", "ranking", "worst"]) {
    const text = { ...TEXT, publishNothing: `${word}: nothing may be published from this wave.` };
    assert.throws(() => buildPacket(base({ gates: [g("G-a", "fail", "x")] }), { text }), /banned wording/i, word);
    const raw = buildPacket(base({ gates: [g("G-a", "fail", "x")] }), { text, lint: false });
    assert.ok(lintPacket({ json: raw.json, markdown: raw.markdown, gates: [g("G-a", "fail", "x")] }).some((p) => p.includes("banned wording")), word);
  }
  // wording arriving from an upstream gate detail is caught as well
  assert.throws(() => buildPacket(base({ gates: [g("G-a", "fail", "the best model leads")] })), /banned wording/i);
});

test("PROBE failing gate omitted from the output: the lint reports it for markdown and JSON", () => {
  const gates = [...allPass(), g("G-keys", "fail", "tracked keys")].filter((x, i, arr) => arr.findIndex((y) => y.id === x.id) === i);
  const gatesWithFail = gates.map((x) => (x.id === "G-keys" ? g("G-keys", "fail", "tracked keys") : x));
  const p = buildPacket(base({ gates: gatesWithFail }));
  assert.deepEqual(lintPacket({ json: p.json, markdown: p.markdown, gates: gatesWithFail }), []);
  const noMd = p.markdown.split("\n").filter((l) => !l.includes("`G-keys`")).join("\n");
  assert.ok(lintPacket({ json: p.json, markdown: noMd, gates: gatesWithFail }).some((x) => /G-keys.*missing from the markdown/.test(x)));
  const noJson = { ...p.json, gates: { ...p.json.gates, fail: [] } };
  assert.ok(lintPacket({ json: noJson, markdown: p.markdown, gates: gatesWithFail }).some((x) => /G-keys.*missing from the JSON/.test(x)));
});

test("PROBE a 7th ask: the lint rejects it, and the default build can never emit one", () => {
  const gates = Array.from({ length: 8 }, (_, i) => g(`G-y${i + 1}`, "fail", `cause ${i + 1}`));
  assert.throws(() => buildPacket(base({ gates }), { maxAsks: 7 }), /exceed the cap of 6/);
  const raw = buildPacket(base({ gates }), { maxAsks: 7, lint: false });
  assert.equal(raw.json.asks.shown.length, 7);
  assert.ok(lintPacket({ json: raw.json, markdown: raw.markdown, gates }).length >= 2);
  assert.equal(buildPacket(base({ gates })).json.asks.shown.length, 6);
});

test("PROBE HOLD packet that lists a publishable item is rejected", () => {
  const p = buildPacket(base({ gates: [g("G-a", "fail", "x")] }));
  const bad = { ...p.json, publishable: { ...p.json.publishable, items: [{ id: "subject-ranges", label: "ranges", report_only_gates: [] }] } };
  assert.ok(lintPacket({ json: bad, markdown: p.markdown, gates: [g("G-a", "fail", "x")] }).some((x) => /HOLD packet lists publishable/.test(x)));
});

// ---- real data: the CLI on pilot-2026-10-03 -------------------------------------------------------------------
test("CLI on pilot-2026-10-03: writes a packet and a JSON twin, deterministic, HOLD while any gate is not passing", () => {
  const out = mkdtempSync(path.join(os.tmpdir(), "review-packet-"));
  try {
    const run = () => spawnSync(process.execPath, [BIN, PILOT3, "--out-dir", out], { encoding: "utf8" });
    const r1 = run();
    assert.ok([0, 3].includes(r1.status), r1.stderr);
    const md1 = readFileSync(path.join(out, `${PILOT3}.md`), "utf8");
    const js1 = readFileSync(path.join(out, `${PILOT3}.json`), "utf8");
    run();
    assert.equal(readFileSync(path.join(out, `${PILOT3}.md`), "utf8"), md1);
    assert.equal(readFileSync(path.join(out, `${PILOT3}.json`), "utf8"), js1);
    const j = JSON.parse(js1);
    assert.equal(j.verdict, r1.status === 0 ? "READY" : "HOLD");
    assert.ok(j.asks.shown.length <= 6);
    const sections = ["## 1. Verdict", "## 2. Gates", "## 3. Deviations and timeline gaps", "## 4. What may be published", "## 5. Founder asks", "## 6. Provenance"];
    const at = sections.map((s) => md1.indexOf(s));
    assert.ok(at.every((n) => n >= 0) && at.every((n, i) => i === 0 || n > at[i - 1]), "six sections in order");
    if (j.verdict === "HOLD") assert.match(md1, /Nothing may be published/);
    assert.doesNotMatch(md1, new RegExp(`\\b(?:${BANNED_WORDS.join("|")})\\b`, "i"));
  } finally { rmSync(out, { recursive: true, force: true }); }
});

test("CLI refuses a missing wave and a bad date, and the committed pilot-3 packet exists", () => {
  assert.equal(spawnSync(process.execPath, [BIN, "no-such-wave"], { encoding: "utf8" }).status, 1);
  assert.equal(spawnSync(process.execPath, [BIN, PILOT3, "--date", "yesterday"], { encoding: "utf8" }).status, 1);
  assert.ok(existsSync(path.resolve(here, "..", "review-packets", `${PILOT3}.md`)));
});
