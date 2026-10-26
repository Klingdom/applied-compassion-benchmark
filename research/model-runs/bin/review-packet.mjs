#!/usr/bin/env node
// research/model-runs/bin/review-packet.mjs -- generate the results-review packet for one wave (D-63 Stream D, EVAL-WP10).
//
//   node research/model-runs/bin/review-packet.mjs <wave-id> [--date YYYY-MM-DD] [--protocol <file>]
//        [--waive <gate-id>=<reason>]... [--gates-json <file>] [--audit-json <file>] [--out-dir <dir>] [--stdout]
//
// <wave-id> names a directory under research/model-runs/. It runs the wave gates and audit-wave in process (read-only;
// git only for log / ls-files / diff --cached), or reads their saved JSON with --gates-json (wave-ready --json output)
// and --audit-json (audit-wave output). Writes review-packets/<wave-id>.md and .json. Nothing is written into the run.
//
// Deterministic: no clock is read. The date line appears only with --date.
// Exit: 0 READY, 3 HOLD (the packet is still written), 1 error.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadRunContext, runAllGates } from "../lib/wave-gates.mjs";
import { makeRunGit } from "../lib/weekly.mjs";
import { auditRun } from "./audit-wave.mjs";
import { buildPacket, collectOpenValues, sha256Hex } from "../lib/review-packet.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const MODEL_RUNS = path.resolve(here, "..");
const REPO = path.resolve(MODEL_RUNS, "..", "..");
const rel = (p) => path.relative(REPO, p).split(path.sep).join("/");
const hashFile = (p) => (existsSync(p) ? sha256Hex(readFileSync(p)) : null);

function parseArgs(argv) {
  const o = { waveId: null, date: null, protocol: null, waive: {}, gatesJson: null, auditJson: null, outDir: null, stdout: false };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === "--date") o.date = argv[(i += 1)];
    else if (a === "--protocol") o.protocol = argv[(i += 1)];
    else if (a === "--gates-json") o.gatesJson = argv[(i += 1)];
    else if (a === "--audit-json") o.auditJson = argv[(i += 1)];
    else if (a === "--out-dir") o.outDir = argv[(i += 1)];
    else if (a === "--stdout") o.stdout = true;
    else if (a === "--waive") {
      const v = argv[(i += 1)] ?? "";
      const eq = v.indexOf("=");
      if (eq < 1 || !v.slice(eq + 1).trim()) throw new Error("--waive needs <gate-id>=<reason> with a non-empty reason");
      o.waive[v.slice(0, eq)] = v.slice(eq + 1).trim();
    } else if (a.startsWith("--")) throw new Error(`unknown option ${a}`);
    else if (!o.waveId) o.waveId = a;
    else throw new Error(`unexpected argument ${a}`);
  }
  if (!o.waveId) throw new Error("usage: review-packet.mjs <wave-id> [--date D] [--protocol F] [--waive id=reason] [--gates-json F] [--audit-json F] [--out-dir D] [--stdout]");
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(o.waveId)) throw new Error(`bad wave id ${o.waveId}`);
  if (o.date !== null && !/^\d{4}-\d{2}-\d{2}$/.test(o.date)) throw new Error("--date must be YYYY-MM-DD");
  return o;
}

try {
  const args = parseArgs(process.argv.slice(2));
  const runDir = path.join(MODEL_RUNS, args.waveId);
  if (!existsSync(path.join(runDir, "run-config.json"))) throw new Error(`${rel(runDir)} has no run-config.json: not a wave directory`);
  const protocolFile = args.protocol ? path.resolve(args.protocol) : path.join(MODEL_RUNS, "weekly", "PROTOCOL.v2.json");
  const protocolObj = existsSync(protocolFile) ? JSON.parse(readFileSync(protocolFile, "utf8")) : null;

  const files = [];
  const track = (p) => files.push({ path: rel(p), sha256: hashFile(p) });
  let gates;
  let loadProblems = [];
  if (args.gatesJson) {
    const g = JSON.parse(readFileSync(path.resolve(args.gatesJson), "utf8"));
    if (g.kind !== "wave-ready" || !Array.isArray(g.gates)) throw new Error("--gates-json is not wave-ready --json output");
    if (g.run_id !== args.waveId) throw new Error(`--gates-json is for ${g.run_id}, not ${args.waveId}`);
    gates = g.gates;
    loadProblems = g.load_problems ?? [];
    track(path.resolve(args.gatesJson));
  } else {
    // wave-ready passes --protocol into the gates for thresholds; do the same only when asked.
    const thresholds = args.protocol ? protocolObj : null;
    const ctx = loadRunContext(runDir, { runGit: makeRunGit(), protocol: thresholds });
    gates = runAllGates(ctx);
    loadProblems = ctx.loadProblems;
  }
  let audit;
  if (args.auditJson) {
    audit = JSON.parse(readFileSync(path.resolve(args.auditJson), "utf8"));
    if (audit.kind !== "claim-audit-run") throw new Error("--audit-json is not audit-wave output");
    track(path.resolve(args.auditJson));
  } else {
    const actx = loadRunContext(runDir, { runGit: () => ({ status: 1, stdout: "", stderr: "not used" }), skipJudgeData: true });
    audit = auditRun(actx);
  }

  const runConfig = JSON.parse(readFileSync(path.join(runDir, "run-config.json"), "utf8"));
  for (const f of ["run-config.json", "PREREGISTRATION.md", "analysis.json", "weekly.json", path.join("operations", "judge-validity.json")]) {
    const p = path.join(runDir, f);
    if (existsSync(p)) track(p);
  }
  if (protocolObj) track(protocolFile);
  files.sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));

  const tools = ["bin/review-packet.mjs", "lib/review-packet.mjs", "lib/wave-gates.mjs", "bin/audit-wave.mjs"].map((n) => ({ name: `research/model-runs/${n}`, sha256: hashFile(path.join(MODEL_RUNS, n)) }));
  const command = ["node research/model-runs/bin/review-packet.mjs", args.waveId, ...(args.date ? [`--date ${args.date}`] : []), ...(args.protocol ? [`--protocol ${rel(path.resolve(args.protocol))}`] : []), ...Object.entries(args.waive).sort().map(([k, v]) => `--waive "${k}=${v}"`), ...(args.gatesJson ? [`--gates-json ${rel(path.resolve(args.gatesJson))}`] : []), ...(args.auditJson ? [`--audit-json ${rel(path.resolve(args.auditJson))}`] : [])].join(" ");

  const packet = buildPacket({
    waveId: args.waveId,
    gates,
    audit,
    openValues: protocolObj ? collectOpenValues(protocolObj) : [],
    subjects: (runConfig.subjects ?? []).map((s) => s.label),
    waivers: args.waive,
    loadProblems,
    files,
    tools,
    command,
    date: args.date,
  });

  if (args.stdout) process.stdout.write(packet.markdown);
  else {
    const outDir = args.outDir ? path.resolve(args.outDir) : path.join(MODEL_RUNS, "review-packets");
    const inRun = path.relative(runDir, outDir);
    if (inRun === "" || (!inRun.startsWith("..") && !path.isAbsolute(inRun))) throw new Error("--out-dir is inside the run directory; evidence directories are never written to");
    mkdirSync(outDir, { recursive: true });
    writeFileSync(path.join(outDir, `${args.waveId}.md`), packet.markdown, "utf8");
    writeFileSync(path.join(outDir, `${args.waveId}.json`), packet.jsonText, "utf8");
    console.log(`review-packet: ${args.waveId} ${packet.json.verdict}, ${packet.json.asks.shown.length} ask(s); wrote ${rel(path.join(outDir, `${args.waveId}.md`))} and .json`);
  }
  process.exit(packet.json.verdict === "READY" ? 0 : 3);
} catch (e) {
  console.error(`review-packet: ${e.message}`);
  process.exit(1);
}
