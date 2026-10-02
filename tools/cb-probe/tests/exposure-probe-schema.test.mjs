// tests/exposure-probe-schema.test.mjs
//
// P2 (docs/MCP_AND_MODEL_BENCHMARK_PAGES_SPEC_2026-10-02.md F2): the
// run_exposure_probe handler reads `args.identification_answers`, but the
// inputSchema did not declare it. Because lib/validate-args.mjs enforces the
// schema (additionalProperties: false) before dispatch, a host could not send
// the stronger of the two contamination tests at all.
//
// Two guards:
//   1. every `args.<key>` / `{ key } = args` the handler reads is declared in
//      the tool's inputSchema (catches this class of drift for any key);
//   2. a real call carrying identification_answers passes schema validation
//      and its answers reach the scorer.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

import { TOOL_DEFINITIONS_BY_NAME } from "../lib/tool-definitions.mjs";
import { validateToolArgs } from "../lib/validate-args.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SOURCE = readFileSync(path.join(HERE, "..", "lib", "scored-run.mjs"), "utf8");

function handlerBody(source, fnName) {
  const start = source.indexOf("export function " + fnName + "(");
  assert.ok(start >= 0, "could not find " + fnName + " in scored-run.mjs");
  const next = source.indexOf("\nexport function ", start + 1);
  return source.slice(start, next === -1 ? undefined : next);
}

function keysReadFromArgs(body) {
  const keys = new Set();
  for (const m of body.matchAll(/\bargs\.([A-Za-z_][A-Za-z0-9_]*)/g)) keys.add(m[1]);
  // destructuring: const { a: x, b } = args;
  for (const m of body.matchAll(/const\s*\{([^}]*)\}\s*=\s*args\b/g)) {
    for (const part of m[1].split(",")) {
      const name = part.split(":")[0].trim();
      if (name) keys.add(name);
    }
  }
  return keys;
}

test("run_exposure_probe: every argument the handler reads is declared in its inputSchema", () => {
  const def = TOOL_DEFINITIONS_BY_NAME.get("run_exposure_probe");
  assert.ok(def, "run_exposure_probe must exist");
  const read = keysReadFromArgs(handlerBody(SOURCE, "runExposureProbe"));
  assert.ok(read.size >= 3, "positive control: the scan must find the handler's arguments, found " + [...read]);
  assert.ok(read.has("identification_answers"), "positive control: scan must see identification_answers");
  const declared = new Set(Object.keys(def.inputSchema.properties));
  const undeclared = [...read].filter((k) => !declared.has(k));
  assert.deepEqual(undeclared, [], "handler reads arguments the schema does not declare: " + undeclared.join(", "));
});

test("run_exposure_probe: identification_answers with { item_id, option_id } passes schema validation", () => {
  const def = TOOL_DEFINITIONS_BY_NAME.get("run_exposure_probe");
  const ok = validateToolArgs(def.inputSchema, {
    run_id: "run-x",
    recall_attempts: [{ item_id: "AWR-1-A", recalled_text: "I do not recall this item well." }],
    identification_answers: [{ item_id: "AWR-1-A", option_id: "B" }],
  });
  assert.deepEqual(ok, []);
});

test("run_exposure_probe: a malformed identification_answers entry is rejected by the schema", () => {
  const def = TOOL_DEFINITIONS_BY_NAME.get("run_exposure_probe");
  const missingOption = validateToolArgs(def.inputSchema, {
    run_id: "run-x",
    identification_answers: [{ item_id: "AWR-1-A" }],
  });
  assert.ok(missingOption.length > 0, "an entry without option_id must be rejected");
  const extraKey = validateToolArgs(def.inputSchema, {
    run_id: "run-x",
    identification_answers: [{ item_id: "AWR-1-A", option_id: "A", note: "x" }],
  });
  assert.ok(extraKey.length > 0, "an entry with an unknown key must be rejected");
  const notArray = validateToolArgs(def.inputSchema, { run_id: "run-x", identification_answers: "A" });
  assert.ok(notArray.length > 0, "a non-array must be rejected");
});
