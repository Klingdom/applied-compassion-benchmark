#!/usr/bin/env node
/**
 * test-model-runs.mjs — run the research/model-runs harness test suite inside `npm test`.
 *
 * Until 2026-10-02 (Iteration 95) the harness that produces every published model figure (subject runners,
 * judge routing, validity gate, MCP driver, analysis, pre-registration integrity) had 100+ tests that ran only
 * on the operator's machine: neither `npm test` nor CI invoked them. This wrapper enumerates the test files
 * explicitly (no shell glob, so it behaves the same under cmd.exe and bash) and fails on zero files (V8).
 */
import { readdirSync, existsSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const here = dirname(fileURLToPath(import.meta.url));
const dir = resolve(here, "..", "..", "research", "model-runs", "tests");
if (!existsSync(dir)) {
  if (process.env.ALLOW_MISSING_RESEARCH === "1") {
    console.warn("test-model-runs SKIPPED (not verified): " + dir + " is absent and ALLOW_MISSING_RESEARCH=1.");
    process.exit(0);
  }
  console.error("FAIL research/model-runs/tests not found at " + dir + " (set ALLOW_MISSING_RESEARCH=1 only on a site-only checkout).");
  process.exit(1);
}
const files = readdirSync(dir).filter((f) => f.endsWith(".test.mjs")).sort().map((f) => join(dir, f));
const MIN_FILES = 10;
if (files.length < MIN_FILES) {
  console.error("FAIL found only " + files.length + " test files in " + dir + " (expected >= " + MIN_FILES + ")");
  process.exit(1);
}
console.log("test-model-runs: " + files.length + " files");
const r = spawnSync(process.execPath, ["--test", ...files], { stdio: "inherit" });
process.exit(r.status === null ? 1 : r.status);
