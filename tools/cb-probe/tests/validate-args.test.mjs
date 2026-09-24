// tests/validate-args.test.mjs
//
// item 1: lib/validate-args.mjs enforces each tool's own declared
// inputSchema at tools/call, before dispatch. Previously inputSchema was
// returned in tools/list and never enforced anywhere.

import test from "node:test";
import assert from "node:assert/strict";

import { validateToolArgs } from "../lib/validate-args.mjs";
import { TOOL_DEFINITIONS_BY_NAME } from "../lib/tool-definitions.mjs";

test("validateToolArgs: a required field missing is reported", () => {
  const schema = {
    type: "object",
    properties: { item_id: { type: "string" } },
    required: ["item_id"],
    additionalProperties: false,
  };
  const errors = validateToolArgs(schema, {});
  assert.equal(errors.length, 1);
  assert.match(errors[0], /item_id/);
  assert.match(errors[0], /required/);
});

test("validateToolArgs: a wrong-typed field is reported by type", () => {
  const schema = {
    type: "object",
    properties: { rating_1_5: { type: "integer", minimum: 1, maximum: 5 } },
    additionalProperties: false,
  };
  const errors = validateToolArgs(schema, { rating_1_5: "3" });
  assert.equal(errors.length, 1);
  assert.match(errors[0], /rating_1_5/);
  assert.match(errors[0], /type "integer"/);
});

test("validateToolArgs: an enum violation is reported", () => {
  const schema = {
    type: "object",
    properties: { judgeConfiguration: { type: "string", enum: ["self", "cross", "panel"] } },
    additionalProperties: false,
  };
  const errors = validateToolArgs(schema, { judgeConfiguration: "solo" });
  assert.equal(errors.length, 1);
  assert.match(errors[0], /judgeConfiguration/);
});

test("validateToolArgs: additionalProperties: false rejects an unexpected key", () => {
  const schema = {
    type: "object",
    properties: { run_id: { type: "string" } },
    required: ["run_id"],
    additionalProperties: false,
  };
  const errors = validateToolArgs(schema, { run_id: "x", extra_field: "should not be here" });
  assert.ok(errors.some((e) => e.includes("extra_field")));
});

test("validateToolArgs: minimum/maximum are enforced on numbers", () => {
  const schema = { type: "object", properties: { trials: { type: "integer", minimum: 3 } }, additionalProperties: false };
  assert.ok(validateToolArgs(schema, { trials: 2 }).length > 0);
  assert.equal(validateToolArgs(schema, { trials: 3 }).length, 0);
});

test("validateToolArgs: maxLength is enforced on strings, without echoing the full value", () => {
  const schema = { type: "object", properties: { item_id: { type: "string", maxLength: 10 } }, additionalProperties: false };
  const hugeValue = "x".repeat(60_000_000); // the 60 MB item_id planted probe from the security review
  const errors = validateToolArgs(schema, { item_id: hugeValue });
  assert.equal(errors.length, 1);
  assert.ok(!errors[0].includes(hugeValue), "the error message must never echo the full oversized value back");
  assert.ok(errors[0].length < 300, "the error message itself must stay small regardless of input size");
});

test("validateToolArgs: maxItems is enforced on arrays", () => {
  const schema = {
    type: "object",
    properties: { recall_attempts: { type: "array", maxItems: 2, items: { type: "object" } } },
    additionalProperties: false,
  };
  const errors = validateToolArgs(schema, { recall_attempts: [{}, {}, {}] });
  assert.ok(errors.some((e) => e.includes("recall_attempts")));
});

test("validateToolArgs: a fully valid object against a realistic schema produces no errors", () => {
  const schema = {
    type: "object",
    properties: {
      run_id: { type: "string", maxLength: 200 },
      item_id: { type: "string", maxLength: 200 },
      rating_1_5: { type: "integer", minimum: 1, maximum: 5 },
    },
    required: ["run_id", "item_id", "rating_1_5"],
    additionalProperties: false,
  };
  const errors = validateToolArgs(schema, { run_id: "r1", item_id: "AWR-1-A", rating_1_5: 4 });
  assert.deepEqual(errors, []);
});

// ---------------------------------------------------------------------------
// item 2's schema half: run_exposure_probe's recall_attempts items now
// require recalled_text, not just item_id.
// ---------------------------------------------------------------------------
test("run_exposure_probe's inputSchema requires recalled_text on each recall_attempts entry", () => {
  const def = TOOL_DEFINITIONS_BY_NAME.get("run_exposure_probe");
  const errors = validateToolArgs(def.inputSchema, {
    run_id: "r1",
    recall_attempts: [{ item_id: "AWR-1-A" }], // recalled_text omitted
  });
  assert.ok(errors.some((e) => e.includes("recalled_text")));
});
