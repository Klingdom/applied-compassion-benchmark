#!/usr/bin/env node
// research/model-runs/bin/wave-ready.mjs -- run every publication gate for one run directory (WP-8, D-60 Stream B).
//
//   node research/model-runs/bin/wave-ready.mjs <runDir> [--json] [--protocol <file>]
//
// Prints a table of gates (lib/wave-gates.mjs) and a verdict: READY when every gate is pass or n/a, otherwise HOLD.
// A "pass" marked * is REPORT-ONLY: it measured something but no ratified threshold exists to test it against.
// "not-built" and "hold" gates always make the verdict HOLD.
//
// Read-only: it never writes into the run directory (or anywhere). Git is used read-only (log, ls-files, diff --cached).
// --protocol <file> supplies thresholds (anchor.max_mean_abs_difference, gates.agreement_floor_exact...). OPEN values in
// it are not thresholds. Without it, only thresholds in the run's own run-config.json apply.
//
// Exit: 0 READY, 3 HOLD, 1 error.

import { readFileSync } from "node:fs";
import path from "node:path";
import { loadRunContext, runAllGates, verdictOf } from "../lib/wave-gates.mjs";
import { makeRunGit } from "../lib/weekly.mjs";

function parseArgs(argv) {
  const out = { runDir: null, json: false, protocol: null };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === "--json") out.json = true;
    else if (a === "--protocol") out.protocol = argv[(i += 1)];
    else if (a.startsWith("--")) throw new Error(`unknown option ${a}`);
    else if (!out.runDir) out.runDir = a;
    else throw new Error(`unexpected argument ${a}`);
  }
  if (!out.runDir) throw new Error("usage: wave-ready.mjs <runDir> [--json] [--protocol <file>]");
  return out;
}

try {
  const args = parseArgs(process.argv.slice(2));
  const runDir = path.resolve(args.runDir);
  const protocol = args.protocol ? JSON.parse(readFileSync(path.resolve(args.protocol), "utf8")) : null;
  const ctx = loadRunContext(runDir, { runGit: makeRunGit(), protocol });
  const results = runAllGates(ctx);
  const v = verdictOf(results);
  if (args.json) {
    process.stdout.write(`${JSON.stringify({ kind: "wave-ready", run_id: ctx.runId, verdict: v.verdict, holding: v.holding, report_only: v.report_only, load_problems: ctx.loadProblems, gates: results }, null, 2)}\n`);
  } else {
    const idw = Math.max(...results.map((r) => r.id.length));
    console.log(`wave-ready: ${ctx.runId} (${ctx.records.length} records)`);
    console.log(`${"GATE".padEnd(idw)}  ${"STATUS".padEnd(9)}  DETAIL`);
    for (const r of results) {
      const status = r.status === "pass" && r.evidence?.report_only ? "pass*" : r.status;
      console.log(`${r.id.padEnd(idw)}  ${status.padEnd(9)}  ${r.detail}`);
    }
    if (v.report_only.length > 0) console.log(`* report-only (no ratified threshold): ${v.report_only.join(", ")}`);
    if (ctx.loadProblems.length > 0) console.log(`load problems: ${ctx.loadProblems.join("; ")}`);
    console.log(`VERDICT: ${v.verdict}${v.holding.length ? ` (holding: ${v.holding.join(", ")})` : ""}`);
  }
  process.exit(v.verdict === "READY" ? 0 : 3);
} catch (e) {
  console.error(`wave-ready: ${e.message}`);
  process.exit(1);
}
