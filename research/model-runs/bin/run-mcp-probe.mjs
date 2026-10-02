#!/usr/bin/env node
/**
 * run-mcp-probe.mjs -- PREREGISTRATION.md section 7: the contamination check through cb-probe's MCP server, end to end,
 * over its REAL stdio JSON-RPC protocol (spawn server.mjs; initialize -> tools/list -> tools/call). The local Ollama
 * model answers the probe questions; this script is only the host.
 *
 *   node research/model-runs/bin/run-mcp-probe.mjs --phase probe  [--subject <label> ...] [--retry-failed]
 *   node research/model-runs/bin/run-mcp-probe.mjs --phase finish --ratings <dir> [--ratings <dir> ...] [--routing <key>]
 *        [--validity <file>] [--keys <dir>] [common options]
 *
 * Common options: [--run-id pilot-2026-10-02] [--config <file>] [--run-root <dir>] [--bank <file>]
 *                 [--artifact-base <dir outside the repo>]   (default ~/compassion-probe-sessions/<run-id>-mcp; one
 *                 sub-directory per subject becomes that server's CB_ARTIFACT_ROOT)
 *
 * --phase probe   start_scored_run (panel, trials = subject trials x judges per response) -> run_exposure_probe challenge ->
 *                 each recall and identification question asked of the local model in its own fresh conversation (fixed seed
 *                 per question and attempt, strict answer parsing, up to max_retries re-asks) -> run_exposure_probe answers.
 *                 An unanswerable question makes the probe INCOMPLETE: no guessing, the answers call is not made, and the
 *                 server's refusal to finish is recorded. Writes <run-root>/probe-answers/<subject>/ and copies the server's
 *                 probe files to <run-root>/mcp-scorecards/<subject>/.
 * --phase finish  Refuses unless a fresh judge validity report exists (the gate assemble-run.mjs uses). Then, per subject,
 *                 next_item -> record_item_rating for every (item, trial) with the validated judge ratings, asserting the
 *                 served prompt is the bank prompt the reply answered -> finish_scored_run. Writes scorecard.json beside the
 *                 probe files in <run-root>/mcp-scorecards/<subject>/.
 *
 * Exit codes: 0 done, 1 refused / error, 2 usage, 3 at least one probe INCOMPLETE.
 */
import os from "node:os";
import path from "node:path";
import { parse, runRoot, mainAsync } from "../lib/cli.mjs";
import { DEFAULT_BANK_PATH, loadBankFile, refuse } from "../lib/common.mjs";
import { createOllamaClient } from "../lib/ollama.mjs";
import { loadRunConfig } from "../lib/local-subjects.mjs";
import { loadFinishRows, runFinishPhase, runProbePhase, summariseProbeResult } from "../lib/mcp-probe.mjs";

const DEFAULT_RUN_ID = "pilot-2026-10-02";

mainAsync(async () => {
  const v = parse({
    "run-id": { type: "string", default: DEFAULT_RUN_ID },
    phase: { type: "string" },
    subject: { type: "string", multiple: true },
    config: { type: "string" },
    "run-root": { type: "string" },
    bank: { type: "string" },
    "artifact-base": { type: "string" },
    "retry-failed": { type: "boolean", default: false },
    ratings: { type: "string", multiple: true },
    routing: { type: "string" },
    validity: { type: "string" },
    keys: { type: "string" },
  });
  if (v.phase !== "probe" && v.phase !== "finish") {
    console.error("usage: run-mcp-probe.mjs --phase probe|finish [--subject <label> ...] [--artifact-base <dir>] (see the file header)");
    return 2;
  }
  const root = runRoot(v);
  const config = loadRunConfig(path.resolve(v.config ?? path.join(root, "run-config.json")));
  if (config.run_id !== v["run-id"]) refuse(`config is for run ${config.run_id}, not ${v["run-id"]}`);
  if (!Number.isInteger(config.judges_per_response) || config.judges_per_response < 1 || !Array.isArray(config.judges)) {
    refuse("the config has no judges / judges_per_response; section 7 needs the judging block");
  }
  const bank = loadBankFile(path.resolve(v.bank ?? DEFAULT_BANK_PATH));
  const wanted = v.subject ?? config.subjects.map((s) => s.label);
  const subjects = wanted.map((l) => config.subjects.find((s) => s.label === l) ?? refuse(`unknown subject ${l}`));
  const artifactBase = path.resolve(v["artifact-base"] ?? path.join(os.homedir(), "compassion-probe-sessions", `${config.run_id}-mcp`));
  const log = (m) => console.log(m);

  if (v.phase === "probe") {
    const ollama = createOllamaClient({ host: config.ollama_host });
    let exit = 0;
    for (const subject of subjects) {
      log(`== ${subject.label}: probe phase (artifact root ${path.join(artifactBase, subject.label)})`);
      const r = await runProbePhase({ config, subject, runRoot: root, artifactBase, ollama, bank, retryFailed: v["retry-failed"], log });
      if (r.status === "completed") {
        log(`${subject.label}: probe COMPLETED${r.already ? " (already, from an earlier invocation)" : ""}; scorer run ${r.scorer_run_id}`);
        if (r.result) log(JSON.stringify(summariseProbeResult(r.result), null, 2));
        log(`  server result (verbatim): ${r.result_file}`);
      } else if (r.status === "incomplete") {
        log(`${subject.label}: probe INCOMPLETE; unanswered: ${r.unanswered.join(", ")}`);
        log(`  server on finish_scored_run: ${JSON.stringify(r.finish_scored_run)}`);
        exit = Math.max(exit, 3);
      } else {
        log(`${subject.label}: the server REFUSED the probe answers: ${r.server_message}`);
        exit = 1;
      }
    }
    return exit;
  }

  const rows = loadFinishRows({
    runRoot: root,
    keysDir: path.resolve(v.keys ?? path.join(root, "keys")),
    ratingsDirs: (v.ratings ?? []).flatMap((x) => x.split(",")).filter(Boolean).map((x) => path.resolve(x)),
    routingFile: v.routing ? path.resolve(v.routing) : null,
    validityFile: path.resolve(v.validity ?? path.join(root, "operations", "judge-validity.json")),
  });
  for (const subject of subjects) {
    const subjectRows = rows.rowsBySubject[subject.label];
    if (!subjectRows) refuse(`no validated rows for ${subject.label}`);
    log(`== ${subject.label}: finish phase (${subjectRows.length} ratings)`);
    const r = await runFinishPhase({ config, subject, rows: subjectRows, runRoot: root, artifactBase, bank, log });
    log(`${subject.label}: finished; composite ${r.scorecard.composite}, band ${r.scorecard.band}, official ${r.scorecard.official}; ${r.scorecard_file}`);
  }
  return 0;
});
