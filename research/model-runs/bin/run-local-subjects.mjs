#!/usr/bin/env node
/**
 * run-local-subjects.mjs -- subject-answering stage of pilot-2026-10-02 (PREREGISTRATION.md sections 2, 3, 9).
 *
 * Each subject x item x trial is ONE fresh Ollama conversation: a single user message holding the prompt
 * text only. Seed = first 31 bits of sha256(run_id|subject|item|trial); Modelfile defaults otherwise.
 * Resumable (completed records are skipped), atomic writes, failed trials recorded and never imputed.
 * Any leak-check hit on an outgoing message stops the run with a non-zero exit.
 *
 *   node research/model-runs/bin/run-local-subjects.mjs [--run-id pilot-2026-10-02] [--dry-run]
 *        [--limit N] [--retry-failed] [--finalize] [--config <file>] [--bank <file>] [--run-root <dir>]
 *
 *   --dry-run       print the plan; no model call, no Ollama needed
 *   --limit N       at most N NEW calls per subject (smoke test); the first N in the recorded order
 *   --retry-failed  redo trials recorded as failed (the earlier attempts are kept in previous_failed)
 *   --finalize      only (re)write keys/subject-brief-key.json, the ingest-format answer files and the summary
 */
import path from "node:path";
import { parse, runRoot, mainAsync } from "../lib/cli.mjs";
import { DEFAULT_BANK_PATH, loadBankFile, refuse } from "../lib/common.mjs";
import { createOllamaClient } from "../lib/ollama.mjs";
import { buildPlan, countExisting, finalizeRun, loadRunConfig, runSubjects } from "../lib/local-subjects.mjs";

const DEFAULT_RUN_ID = "pilot-2026-10-02";

mainAsync(async () => {
  const v = parse({
    "run-id": { type: "string", default: DEFAULT_RUN_ID },
    config: { type: "string" },
    bank: { type: "string" },
    "run-root": { type: "string" },
    limit: { type: "string" },
    "dry-run": { type: "boolean", default: false },
    "retry-failed": { type: "boolean", default: false },
    finalize: { type: "boolean", default: false },
  });
  const root = runRoot(v);
  const config = loadRunConfig(path.resolve(v.config ?? path.join(root, "run-config.json")));
  if (config.run_id !== v["run-id"]) refuse(`config is for run ${config.run_id}, not ${v["run-id"]}`);
  const bankPath = path.resolve(v.bank ?? DEFAULT_BANK_PATH);
  const bank = loadBankFile(bankPath);

  let limit;
  if (v.limit !== undefined) {
    limit = Number(v.limit);
    if (!Number.isInteger(limit) || limit < 1) refuse("--limit must be a positive integer");
  }

  if (v.finalize) {
    const { summary, answerFiles } = finalizeRun({ bank, bankPath, config, runRoot: root });
    console.log(`Finalised: ${answerFiles.length} answer file(s); complete=${summary.complete}`);
    console.log(JSON.stringify(summary.per_subject, null, 2));
    console.log(JSON.stringify(summary.verdicts, null, 2));
    return 0;
  }

  if (v["dry-run"]) {
    const plan = buildPlan({ bank, config });
    const existing = countExisting({ plan, runRoot: root });
    console.log(`Run:        ${config.run_id}   bank ${bank.meta.bankVersion}, ${bank.items.length} items, ${plan.items.length} served`);
    console.log(`Ollama:     ${config.ollama_host} (not contacted in a dry run)`);
    console.log(`Per call:   one fresh conversation, one user message (prompt text only), options {seed}, up to ${config.max_retries} retries (seed + attempt)`);
    for (const s of plan.subjects) {
      const n = s.trials.length * plan.items.length;
      const e = existing[s.label];
      console.log(
        `  ${s.label.padEnd(14)} ${s.tag.padEnd(17)} digest ${s.digest.slice(0, 12)}...  ${plan.items.length} items x ${config.trials} trials = ${n} calls` +
          `  (already ok ${e.ok}, failed ${e.failed}, pending ${n - e.ok - e.failed})`
      );
    }
    console.log(`Total:      ${plan.total_calls} calls${limit ? `; --limit ${limit} would make at most ${limit * plan.subjects.length} new calls` : ""}`);
    for (const s of plan.subjects) for (const t of s.trials) console.log(`  order ${s.label} t${t.trial}: seed ${t.order_seed}, first items ${t.entries.slice(0, 3).map((e) => e.item_id).join(", ")}`);
    return 0;
  }

  const client = createOllamaClient({ host: config.ollama_host });
  const { stats, ollama_version: ver } = await runSubjects({
    bank,
    config,
    client,
    runRoot: root,
    limit,
    retryFailed: v["retry-failed"],
    log: (m) => console.log(m),
  });
  console.log(`Ollama ${ver}. Per subject: ${JSON.stringify(stats)}`);
  const pending = Object.values(stats).some((s) => s.already_ok + s.already_failed + s.new_ok + s.new_failed < s.planned);
  if (pending) {
    console.log("Not finalised: trials remain (resume by re-running without --limit, or use --finalize to write what is complete).");
    return 0;
  }
  const { summary } = finalizeRun({ bank, bankPath, config, runRoot: root });
  console.log(`Finalised: ${summary.answer_files_written} answer file(s); complete=${summary.complete}`);
  for (const [label, vd] of Object.entries(summary.verdicts)) console.log(`  ${label}: ${vd.section_9_throughput} (${(vd.failed_or_missing_rate * 100).toFixed(1)}%)`);
  return 0;
});
