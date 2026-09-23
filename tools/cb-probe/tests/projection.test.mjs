// tests/projection.test.mjs
//
// Proves the field-separation projection is a genuine whitelist: adding a
// fake private field to a fixture item must NOT make it through
// projectItem(), and the model-facing field set is derived from the bank's
// own meta.fieldSeparationPolicy, not hand-written here.

import test from "node:test";
import assert from "node:assert/strict";

import { projectItem, buildModelFacingWhitelist } from "../lib/projection.mjs";
import { loadBank } from "../lib/bank.mjs";

const POLICY = {
  modelFacingFields: ["prompt", "variants[].prompt"],
};

test("buildModelFacingWhitelist parses scalar and array field specs", () => {
  const whitelist = buildModelFacingWhitelist(POLICY);
  assert.deepEqual(whitelist, [
    { kind: "scalar", field: "prompt" },
    { kind: "array", arrayField: "variants", subField: "prompt" },
  ]);
});

test("buildModelFacingWhitelist throws rather than guessing when the policy is missing", () => {
  assert.throws(() => buildModelFacingWhitelist(null));
  assert.throws(() => buildModelFacingWhitelist({}));
  assert.throws(() => buildModelFacingWhitelist({ modelFacingFields: "prompt" }));
});

test("projectItem returns only id, dimension, construct, and prompt", () => {
  const item = {
    id: "AWR-1-A",
    dimension: "AWR",
    construct: "Distress Recognition",
    prompt: "Hello.",
    sourceOnlyFields: { title: "secret", whatToObserve: "secret" },
    criticalHarmRules: "secret",
  };
  const out = projectItem(item, POLICY);
  assert.deepEqual(Object.keys(out).sort(), ["construct", "dimension", "id", "prompt"]);
  assert.equal(out.prompt, "Hello.");
});

test("a fake private field added to a fixture item never escapes projectItem", () => {
  const item = {
    id: "AWR-1-A",
    dimension: "AWR",
    construct: "Distress Recognition",
    prompt: "Hello.",
    sourceOnlyFields: { title: "leak", whatToObserve: "leak" },
    criticalHarmRules: "leak",
    conversationState: "leak",
    userContext: "leak",
    reviewers: ["leak"],
    promptIntegrity: { note: "leak" },
    supersedes: "leak",
    reviewRequired: "leak",
    _fakePrivateField: "this must never appear in output",
    another_fake_secret_the_bank_might_add_someday: "leak",
  };
  const out = projectItem(item, POLICY);
  const serialised = JSON.stringify(out);
  assert.ok(!("_fakePrivateField" in out));
  assert.ok(!("another_fake_secret_the_bank_might_add_someday" in out));
  assert.ok(!serialised.includes("this must never appear in output"));
  assert.ok(!serialised.includes("leak"));
  assert.deepEqual(Object.keys(out).sort(), ["construct", "dimension", "id", "prompt"]);
});

test("projectItem includes a variants[].prompt projection when present", () => {
  const item = {
    id: "INT-1-B",
    dimension: "INT",
    construct: "Framing symmetry",
    prompt: "top-level mirror",
    variants: [
      { prompt: "arm A", sourceOnlyFields: { answerKey: "leak" } },
      { prompt: "arm B", sourceOnlyFields: { answerKey: "leak" } },
    ],
  };
  const out = projectItem(item, POLICY);
  assert.deepEqual(out.variants, [{ prompt: "arm A" }, { prompt: "arm B" }]);
  assert.ok(!JSON.stringify(out).includes("leak"));
});

test("real bank items project cleanly with no sourceOnlyFields leakage", () => {
  const bank = loadBank();
  for (const item of bank.items) {
    const out = projectItem(item, bank.meta.fieldSeparationPolicy);
    const serialised = JSON.stringify(out);
    assert.ok(!("sourceOnlyFields" in out));
    assert.ok(!("criticalHarmRules" in out));
    assert.ok(!("promptIntegrity" in out));
    assert.ok(!serialised.includes("whatToObserve"));
  }
});
