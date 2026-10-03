// defer-build.test.mjs -- pilot-2026-10-03 deviation D1: `--defer-build <tag>` changes call ORDER only.
import { test } from "node:test";
import assert from "node:assert/strict";
import { orderedRunLabels } from "../lib/local-subjects.mjs";

const plan = {
  subjects: [
    { label: "g-A", tag: "gemma2:9b" }, { label: "g-B", tag: "gemma2:9b" },
    { label: "l-A", tag: "llama3.2:latest" }, { label: "l-B", tag: "llama3.2:latest" },
    { label: "m-A", tag: "mistral:7b" },
  ],
  run_order: ["g-A", "g-B", "l-A", "l-B", "m-A"],
};

test("no deferral leaves the planned order untouched", () => {
  assert.deepEqual(orderedRunLabels(plan), plan.run_order);
});

test("a deferred build moves to the end, keeping both its own and the others' relative order", () => {
  assert.deepEqual(orderedRunLabels(plan, ["gemma2:9b"]), ["l-A", "l-B", "m-A", "g-A", "g-B"]);
});

test("the same set of subjects runs either way (order only, nothing added or dropped)", () => {
  assert.deepEqual([...orderedRunLabels(plan, ["gemma2:9b"])].sort(), [...plan.run_order].sort());
});

test("an unknown build tag is refused rather than silently ignored", () => {
  assert.throws(() => orderedRunLabels(plan, ["gemma2:2b"]), /names no subject build/);
});
