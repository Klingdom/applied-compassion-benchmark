import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import os from "node:os";
import { mkdtempSync, rmSync } from "node:fs";

import { findSubjectLeaks, assertNoSubjectLeaks } from "../lib/leak-check.mjs";
import { buildSubjectBriefs, renderBriefMarkdown } from "../lib/subject-briefs.mjs";
import {
  servedItems,
  exclusionRule,
  assertAdministrable,
  loadBankFile,
  SUBJECTS,
  HarnessError,
} from "../lib/common.mjs";
import { startScoredRun } from "../../../tools/cb-probe/lib/scored-run.mjs";
import { makeSyntheticBank } from "./helpers.mjs";

const realBank = loadBankFile();

function cleanBrief(bank, seed = 1) {
  const r = buildSubjectBriefs({ bank, runId: "t", subjects: SUBJECTS, trials: 3, seed });
  return r;
}

test("leak check passes on clean briefs (synthetic bank, every subject x trial)", () => {
  const bank = makeSyntheticBank();
  const { briefs } = cleanBrief(bank);
  assert.equal(briefs.length, SUBJECTS.length * 3);
  for (const b of briefs) {
    const promptTexts = b.brief.items.map((i) => i.prompt);
    assert.deepEqual(
      findSubjectLeaks({ text: b.markdown, scaffoldText: renderBriefMarkdown(b.brief, () => ""), promptTexts, bank }),
      []
    );
  }
});

test("NEGATIVE CONTROL: a planted anchor in a subject brief is detected, with the item and level named", () => {
  const bank = makeSyntheticBank();
  const { briefs } = cleanBrief(bank);
  const b = briefs[0];
  const promptTexts = b.brief.items.map((i) => i.prompt);
  const planted = `${b.markdown}\n\nNote: ${bank.items[4].anchors[2].description}\n`;
  const leaks = findSubjectLeaks({ text: planted, scaffoldText: renderBriefMarkdown(b.brief, () => ""), promptTexts, bank });
  assert.ok(leaks.some((l) => l.startsWith(`${bank.items[4].id} L3`)), `expected the planted L3 anchor, got ${JSON.stringify(leaks)}`);
  assert.throws(() => assertNoSubjectLeaks({ text: planted, promptTexts, bank }), HarnessError);
});

test("negative controls: item id, dimension code, construct, anchor label and rubric vocabulary are each caught", () => {
  const bank = makeSyntheticBank();
  const { briefs } = cleanBrief(bank);
  const b = briefs[0];
  const promptTexts = b.brief.items.map((i) => i.prompt);
  const scaffold = renderBriefMarkdown(b.brief, () => "");
  const probe = (extra, scaffoldExtra = "") =>
    findSubjectLeaks({ text: `${b.markdown}\n${extra}`, scaffoldText: `${scaffold}\n${scaffoldExtra}`, promptTexts, bank });

  assert.ok(probe("see item AWR-9-B").some((l) => l.includes("item id")));
  assert.ok(probe("this is an EMP matter").some((l) => l.includes("dimension code")));
  assert.ok(probe(bank.items[7].construct).some((l) => l.includes("construct name")));
  assert.ok(probe("it earns 4.0 Established here").some((l) => l.includes("anchor label")));
  assert.ok(probe("the rubric", "the rubric").some((l) => l.includes("rubric vocabulary")));
});

test("anchor wording that the item's own prompt contains is exempt, but the same anchor planted elsewhere is not", () => {
  // AWR-4-A on the real bank: L1 shares "the booking email with the deposit" with its own prompt, and the
  // stock quote-item.mjs check refuses that item on its own.
  const item = realBank.items.find((i) => i.id === "AWR-4-A");
  const bank = { meta: realBank.meta, items: [item] };
  assert.ok(findSubjectLeaks({ text: item.prompt, bank, checkIds: false, checkConstructs: false }).length > 0, "unexempted, the prompt trips the shingle test");
  assert.deepEqual(findSubjectLeaks({ text: item.prompt, promptTexts: [item.prompt], bank, checkIds: false, checkConstructs: false }), []);
  const planted = `${item.prompt}\n${item.anchors[3].description}`;
  assert.ok(findSubjectLeaks({ text: planted, promptTexts: [item.prompt], bank, checkIds: false, checkConstructs: false }).length > 0);
});

test("real bank: briefs build, leak check passes, every prompt is verbatim and no item is dropped", () => {
  const { briefs, key } = cleanBrief(realBank, 42);
  const served = servedItems(realBank);
  assert.equal(briefs.length, 12);
  const byId = new Map(realBank.items.map((i) => [i.id, i]));
  for (const kb of key.briefs) {
    assert.equal(Object.keys(kb.codes).length, served.length);
    assert.deepEqual([...Object.values(kb.codes)].sort(), served.map((i) => i.id));
    const brief = briefs.find((b) => b.brief.brief_id === kb.brief_id).brief;
    for (const entry of brief.items) assert.equal(entry.prompt, byId.get(kb.codes[entry.code]).prompt, "prompt must be verbatim");
  }
  // trial orders differ (independent shuffles), codes are not shared across briefs
  const orders = new Set(key.briefs.map((b) => b.order.join(",")));
  assert.equal(orders.size, 12);
  const codeSets = key.briefs.map((b) => Object.keys(b.codes).join(","));
  assert.equal(new Set(codeSets).size, 12);
});

test("the same seed reproduces the same briefs and a different seed does not", () => {
  const a = cleanBrief(makeSyntheticBank(), 5).key;
  const b = cleanBrief(makeSyntheticBank(), 5).key;
  const c = cleanBrief(makeSyntheticBank(), 6).key;
  assert.deepEqual(a, b);
  assert.notDeepEqual(a.briefs[0].order, c.briefs[0].order);
});

test("no subject brief contains anything that names the subject, a trial, an item id or a dimension", () => {
  const bank = makeSyntheticBank();
  const { briefs } = cleanBrief(bank);
  for (const b of briefs) {
    for (const text of [b.markdown, b.json]) {
      assert.doesNotMatch(text, /haiku|sonnet|opus|fable/i);
      assert.doesNotMatch(text, /trial/i);
      assert.doesNotMatch(text, /[A-Z]{3}-\d-[A-Z]/);
    }
    assert.deepEqual(Object.keys(b.brief).sort(), ["answer_schema", "brief_id", "instructions", "items"]);
    for (const i of b.brief.items) assert.deepEqual(Object.keys(i).sort(), ["code", "prompt"]);
  }
});

// ---------------------------------------------------------------------------
// Serving rule
// ---------------------------------------------------------------------------
test("serving rule == the item set cb-probe's startScoredRun opens (real bank), and is derived, not typed", () => {
  const root = mkdtempSync(path.join(os.tmpdir(), "model-runs-serving-"));
  try {
    const ctx = { bank: realBank, artifactRoot: root, runs: new Map(), sessions: new Map() };
    const started = startScoredRun({ subject_label: "s", judge_label: "j" }, ctx);
    const opened = ctx.runs.get(started.run_id).item_ids.slice().sort();
    assert.deepEqual(servedItems(realBank).map((i) => i.id).sort(), opened);
    assert.equal(started.item_count, servedItems(realBank).length);
    const excluded = exclusionRule(realBank);
    assert.equal(excluded.length, realBank.items.length - started.item_count);
    // every exclusion has a stated reason and the reasons are exactly the two cb-probe predicates
    for (const e of excluded) assert.ok(e.reasons.length >= 1);
    assert.ok(excluded.some((e) => e.reasons.some((r) => r.includes("draft-authored-unreviewed"))));
    assert.ok(excluded.some((e) => e.reasons.some((r) => r.includes("sensitive"))));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("a matched-pair item, or one needing conversation context, is refused rather than served with an arm or field dropped", () => {
  const bank = makeSyntheticBank();
  const pair = { ...bank.items[0], id: "INT-9-Z", variants: [{ variantId: "x", label: "x", prompt: "arm one" }, { variantId: "y", label: "y", prompt: "arm two" }] };
  assert.throws(() => assertAdministrable([pair]), /MATCHED-PAIR/);
  const ctxItem = { ...bank.items[1], id: "INT-9-Y", conversationState: "a prior assistant turn is required" };
  assert.throws(() => assertAdministrable([ctxItem]), /conversationState/);
  const withPair = { ...bank, items: [...bank.items, pair] };
  assert.throws(() => buildSubjectBriefs({ bank: withPair, runId: "t", trials: 3, seed: 1 }), /MATCHED-PAIR/);
});

test("fewer than MIN_TRIALS trials is refused", () => {
  assert.throws(() => buildSubjectBriefs({ bank: makeSyntheticBank(), runId: "t", trials: 2, seed: 1 }), /trials must be an integer >= 3/);
});
