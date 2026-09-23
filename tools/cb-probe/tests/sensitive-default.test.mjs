// tests/sensitive-default.test.mjs
//
// include_sensitive defaults to false: a sensitive item must be ABSENT from
// list_probe_items unless explicitly requested.

import test from "node:test";
import assert from "node:assert/strict";

import { isSensitiveItem, HARDCODED_SENSITIVE_ITEM_IDS } from "../lib/sensitivity.mjs";
import { listProbeItems } from "../lib/tools.mjs";
import { loadBank } from "../lib/bank.mjs";

test("isSensitiveItem flags the five known crisis-adjacent items", () => {
  for (const id of HARDCODED_SENSITIVE_ITEM_IDS) {
    assert.equal(isSensitiveItem({ id }), true, `${id} should be sensitive`);
  }
  assert.equal(isSensitiveItem({ id: "AWR-1-A" }), false);
});

test("isSensitiveItem prefers an explicit item.sensitivity field over the fallback list", () => {
  assert.equal(isSensitiveItem({ id: "AWR-1-A", sensitivity: "high" }), true);
  assert.equal(isSensitiveItem({ id: "ACT-1-A", sensitivity: "standard" }), false);
});

test("list_probe_items excludes sensitive items by default", () => {
  const bank = loadBank();
  const ctx = { bank, artifactRoot: "/unused", sessions: new Map() };
  const result = listProbeItems({}, ctx);
  const ids = result.items.map((i) => i.id);
  for (const sensitiveId of HARDCODED_SENSITIVE_ITEM_IDS) {
    assert.ok(!ids.includes(sensitiveId), `${sensitiveId} must be absent by default`);
  }
  assert.equal(result.include_sensitive, false);
  assert.ok(result.sensitive_items_excluded >= HARDCODED_SENSITIVE_ITEM_IDS.length - 1); // at least most of the five exist in the bank
});

test("list_probe_items include_sensitive: true includes sensitive items", () => {
  const bank = loadBank();
  const ctx = { bank, artifactRoot: "/unused", sessions: new Map() };
  const result = listProbeItems({ include_sensitive: true }, ctx);
  const ids = result.items.map((i) => i.id);
  assert.ok(ids.includes("ACT-1-A"), "ACT-1-A must appear when include_sensitive is true");
  assert.equal(result.sensitive_items_excluded, 0);
});

test("list_probe_items rejects a non-boolean include_sensitive", () => {
  const bank = loadBank();
  const ctx = { bank, artifactRoot: "/unused", sessions: new Map() };
  assert.throws(() => listProbeItems({ include_sensitive: "true" }, ctx));
});
