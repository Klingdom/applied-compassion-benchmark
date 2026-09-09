/**
 * run-record.mjs — builds the run-record.json object that
 * site/scripts/validate-evaluation-run.mjs reads and
 * site/scripts/lib/evaluation-statistics.mjs#validateRunCompleteness
 * validates. THAT function's field list is the binding contract; this file
 * exists to satisfy it, not to redefine it.
 *
 * ── Where this sits relative to the harness / analysis boundary ────────────
 * docs/MODEL_EVALUATION_HARNESS_DESIGN.md §2.2 draws a hard line: "the
 * harness produces responses. It never produces scores. Scoring is a
 * distinct program ... with its own version number recorded as
 * `analysis_version`." A run-record with real scores, real ratings, and a
 * real critical-harm determination is Phase E/F output (a rating workspace
 * + a separate analysis program), neither of which exists yet.
 *
 * This module produces the Phase A / pilot-run SHAPE of that record
 * honestly: every COMPLETENESS_GATE_FIELDS key is present and non-empty
 * (so the structural gate can be exercised end-to-end today), but the
 * rating/analysis/uncertainty/critical-harm fields all say, in the data
 * itself, "not yet performed" rather than fabricating a rating, a score,
 * or a determination. `publishable` is hardcoded `false` — this module
 * never sets it true; publication authorization is a human act recorded in
 * PUBLICATION_LEDGER.md, never a computed field.
 */

/**
 * Groups executor results by (itemId, variantId) and reports, per
 * itemMeta entry, whether every arm reached >= trialsPerItem trials that
 * were actually EXECUTED to a terminal outcome (completed / refused /
 * filtered — i.e. NOT "failed" and NOT "not_executed"). This is Required
 * behaviour #3 ("a run that executed one arm of a pair is incomplete") and
 * the design's failure-handling rule ("a failed trial ... does not reduce
 * trials_per_item; the item is marked incomplete").
 *
 * @returns {{incompleteItems: object[], failedTrialIds: string[], totalExpected: number, totalPersisted: number}}
 */
export function assessRunCompletion(itemMeta, results, trialsPerItem) {
  const byItemVariant = new Map();
  for (const r of results) {
    const key = `${r.slot.itemId}::${r.slot.variantId ?? "-"}`;
    if (!byItemVariant.has(key)) byItemVariant.set(key, []);
    byItemVariant.get(key).push(r);
  }

  const incompleteItems = [];
  const failedTrialIds = [];
  let totalExpected = 0;
  let totalPersisted = 0;

  for (const item of itemMeta) {
    const variantIds = item.variantIds.length > 0 ? item.variantIds : [null];
    const armReports = [];
    let itemIncomplete = false;

    for (const variantId of variantIds) {
      const key = `${item.itemId}::${variantId ?? "-"}`;
      const arm = byItemVariant.get(key) ?? [];
      totalExpected += trialsPerItem;

      const resolved = arm.filter((r) => r.status === "completed" || r.status === "refused" || r.status === "filtered");
      const failedOrMissing = arm.filter((r) => r.status === "failed" || r.status === "not_executed");
      totalPersisted += arm.filter((r) => r.status !== "not_executed").length;

      for (const f of failedOrMissing) {
        if (f.status === "failed" && f.request?.trialId) failedTrialIds.push(f.request.trialId);
      }

      const armComplete = resolved.length >= trialsPerItem;
      if (!armComplete) itemIncomplete = true;
      armReports.push({ variantId, executed: resolved.length, expected: trialsPerItem, complete: armComplete });
    }

    if (itemIncomplete) {
      incompleteItems.push({
        itemId: item.itemId,
        arms: armReports,
        reason: `at least one arm has fewer than ${trialsPerItem} trials that reached a terminal, non-failed outcome`,
      });
    }
  }

  return { incompleteItems, failedTrialIds, totalExpected, totalPersisted };
}

/**
 * @param {object} args
 * @param {object} args.manifest the LOCKED manifest (must already carry
 *   hashtree_root, trial_count_expected, trial_count_persisted, failed_trial_ids)
 * @param {string} args.manifestHash sha256 of the locked manifest
 * @param {object[]} args.itemMeta from core/planner.mjs#buildTrialPlan
 * @param {object[]} args.results from core/executor.mjs#executeTrialPlan
 * @returns {object} a run-record.json object satisfying
 *   evaluation-statistics.mjs#COMPLETENESS_GATE_FIELDS
 */
export function buildRunRecord({ manifest, manifestHash, itemMeta, results }) {
  const trialsPerItem = manifest.trials_per_item;
  const completion = assessRunCompletion(itemMeta, results, trialsPerItem);

  const rawOutputs = results
    .filter((r) => r.status !== "not_executed")
    .map((r) => ({
      itemId: r.slot.itemId,
      dimension: r.slot.dimension,
      variantId: r.slot.variantId,
      trialIndex: r.slot.trialIndex,
      trialId: r.request.trialId,
      status: r.status,
      rawResponseSha256: r.response?.rawResponseSha256 ?? null,
    }));

  const limitations = [
    "Phase A / harness-only output: no human rating has occurred (Phase E does not exist yet). No 1-5 score is recorded anywhere in this record.",
    `Pool = "${manifest.pool}": ${manifest.pool === "public" ? "every item in this run is exposureStatus public-permanent, i.e. published with its own answer key — no cross-model or cross-time comparison is valid on this pool (docs/MODEL_EVALUATION_HARNESS_DESIGN.md Part 6.1)." : "secure-pool run — request/response text is withheld from this repository per §6.2."}`,
    `label = "${manifest.label}" — a run labelled "pilot" or "demo" is never published and never promoted, per the design's Phase gates.`,
  ];
  if (completion.incompleteItems.length > 0) {
    limitations.push(
      `${completion.incompleteItems.length} item(s) incomplete: ${completion.incompleteItems.map((i) => i.itemId).join(", ")} — see incompleteItems for per-arm detail.`
    );
  }

  return {
    runId: manifest.run_id,
    modelIdentity: manifest.target,
    configuration: {
      sampling: manifest.sampling,
      trialsPerItem,
      randomizationSeed: manifest.randomization_seed,
      concurrency: manifest.concurrency,
      timeoutMs: manifest.timeout_ms,
      retryPolicy: manifest.retry_policy,
    },
    benchmarkVersion: manifest.benchmark_version,
    taskManifest: manifest.items,
    repeatedTrials: { trialsPerItem },
    rawOutputs,
    ratingStatus: {
      status: "not_rated",
      raters: 0,
      note: "No rating workspace exists yet (Phase E). This run has zero human ratings by construction, not by omission.",
    },
    criticalHarmReview: {
      reviewed: false,
      automatedFlagCount: results.filter((r) => r.response?.moderation?.flagged === true).length,
      note: "Automated moderation flags (if any) are triage only, per docs/MODEL_EVALUATION_HARNESS_DESIGN.md §7.3 — a human critical-harm DETERMINATION has not occurred.",
    },
    analysisVersion: "none — Phase A harness output only. Scoring is a separate program (research/scripts/model-analysis), not yet built.",
    uncertainty: {
      computed: false,
      note: "No scores exist yet to bootstrap a confidence interval over — see site/scripts/lib/evaluation-statistics.mjs#bootstrapCompositeUncertainty, which this run does not invoke.",
    },
    limitations,
    auditHashes: {
      manifestSha256: manifestHash,
      hashtreeRoot: manifest.hashtree_root,
    },
    incompleteItems: completion.incompleteItems,
    failedTrialIds: completion.failedTrialIds,
    // Hardcoded, never computed to true by this module: publication
    // authorization is a human act recorded in root PUBLICATION_LEDGER.md,
    // never a field this harness sets.
    publishable: false,
  };
}
