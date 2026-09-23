// lib/bank.mjs
//
// Loads the Compassion Benchmark model task bank (tasks-v1.json). One bank,
// no copy: this reads the repo's real file, resolved relative to this module
// (lib/paths.mjs), never a bundled duplicate. Fails with a clear, actionable
// message if the file is missing, rather than a raw ENOENT stack.

import { readFileSync, existsSync } from "node:fs";
import { TASK_BANK_PATH } from "./paths.mjs";

let cachedBank = null;

export function loadBank({ forceReload = false } = {}) {
  if (cachedBank && !forceReload) return cachedBank;

  if (!existsSync(TASK_BANK_PATH)) {
    throw new Error(
      `cb-probe: could not find the Compassion Benchmark task bank at:\n` +
        `  ${TASK_BANK_PATH}\n` +
        `This tool reads that file directly and does not ship its own copy. ` +
        `Make sure you are running cb-probe from inside a checkout of ` +
        `applied-compassion-benchmark, with site/src/data/model-benchmark/tasks-v1.json present.`
    );
  }

  let raw;
  try {
    raw = readFileSync(TASK_BANK_PATH, "utf8");
  } catch (err) {
    throw new Error(`cb-probe: failed to read task bank at ${TASK_BANK_PATH}: ${err.message}`);
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new Error(`cb-probe: task bank at ${TASK_BANK_PATH} is not valid JSON: ${err.message}`);
  }

  if (!parsed || !parsed.meta || !Array.isArray(parsed.items)) {
    throw new Error(
      `cb-probe: task bank at ${TASK_BANK_PATH} does not have the expected { meta, items[] } shape.`
    );
  }

  if (!parsed.meta.fieldSeparationPolicy || !Array.isArray(parsed.meta.fieldSeparationPolicy.modelFacingFields)) {
    throw new Error(
      `cb-probe: task bank at ${TASK_BANK_PATH} has no meta.fieldSeparationPolicy.modelFacingFields. ` +
        `cb-probe refuses to guess a field whitelist and will not serve items without it.`
    );
  }

  cachedBank = parsed;
  return parsed;
}

export function findItem(bank, itemId) {
  return bank.items.find((item) => item.id === itemId) || null;
}

// The bank-wide "planner convention" (docs/MCP_SCORED_RUN_DESIGN_2026-09-20.md
// §2, and the item bank's own meta.changelog): items whose validationStatus
// is "draft-authored-unreviewed" are repaired-but-not-yet-human-reviewed and
// are excluded from any scored denominator, exactly as EvaluationScorer
// excludes them. Verified 2026-09-23: 28 of 33 items are scorable under this
// rule (5 draft-authored-unreviewed), spanning all 8 dimensions.
export const EXCLUDED_VALIDATION_STATUS = "draft-authored-unreviewed";

export function isScorableItem(item) {
  return !!item && item.validationStatus !== EXCLUDED_VALIDATION_STATUS;
}

export function getScorableItems(bank) {
  return bank.items.filter(isScorableItem);
}
