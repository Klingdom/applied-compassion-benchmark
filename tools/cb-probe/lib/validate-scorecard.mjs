// lib/validate-scorecard.mjs
//
// Pure validator for the SelfRunScorecard artifact
// (docs/MCP_SCORED_RUN_DESIGN_2026-09-20.md §3). No I/O. Built and tested
// before finish_scored_run exists to call it (the guarantee before the thing
// it guards), same discipline as validate-estimate.mjs for JudgeEstimate.
//
// This is the older JudgeEstimate ban, EXTENDED precisely, not deleted:
//   - `composite` and `band` are permitted top-level keys ONLY here. They
//     remain banned everywhere in JudgeEstimate (validate-estimate.mjs is
//     untouched in that respect -- see tests/vocabulary-ban.test.mjs).
//   - `subdimensions` is additionally banned, anywhere in the tree, because
//     this artifact must never carry a field by that name: subdimension
//     scoring is not available (see computeSubdimensionsStatus in
//     lib/self-run-scorecard.mjs), and the one thing worse than "absent" is
//     a key named `subdimensions` holding zeros or nulls pretending to be
//     scores.
//
// Two independent mechanisms, exactly as validate-estimate.mjs: a deny-list
// (SCORECARD_BANNED_KEYS, anywhere in the tree) and an allow-list (only
// declared top-level / item / trial keys are accepted).

import { BANNED_KEYS, collectAllKeys, findBannedKeys as findBannedKeysGeneric } from "./validate-estimate.mjs";
import { isValidRating } from "./validate-estimate.mjs";
import { DIMENSION_CODES, BAND_ORDER, getBand } from "../../../site/scripts/lib/scoring.mjs";
import { HEADER_STATEMENT_TEXT } from "./scorecard-header.mjs";

const EXEMPT_FOR_SCORECARD = new Set(["composite", "band"]);

export const SCORECARD_BANNED_KEYS = Object.freeze([
  ...BANNED_KEYS.filter((key) => !EXEMPT_FOR_SCORECARD.has(key)),
  "subdimensions",
]);

const SCORECARD_BANNED_KEY_SET = new Set(SCORECARD_BANNED_KEYS);

/** Return the subset of SCORECARD_BANNED_KEYS present anywhere in `value`. */
export function findScorecardBannedKeys(value) {
  return findBannedKeysGeneric(value, SCORECARD_BANNED_KEYS);
}

export const ALLOWED_TOP_LEVEL_KEYS = Object.freeze([
  "artifact_kind",
  "official",
  "is_index_entry",
  "publishable_as_a_compassion_benchmark_score",
  "comparability",
  "header_statement",
  "what_this_is",
  "what_an_official_score_requires",
  "exposure_warning",
  "duty_of_care",
  "composite",
  "band",
  "composite_withheld_reason",
  "integration_premium",
  "dimensions",
  "coverage_note",
  "items",
  "subdimensions_status",
  "provenance",
  "contamination",
  "judge_configuration_notice",
  "judge_panel",
]);

const ALLOWED_TOP_LEVEL_SET = new Set(ALLOWED_TOP_LEVEL_KEYS);

export const ALLOWED_ITEM_KEYS = Object.freeze([
  "item_id",
  "dimension",
  "construct",
  "trials",
  "mean_rating",
  "trial_stats",
]);
const ALLOWED_ITEM_SET = new Set(ALLOWED_ITEM_KEYS);

export const ALLOWED_TRIAL_KEYS = Object.freeze([
  "trial_index",
  "judge_label",
  "rating_1_5",
  "anchor_matched",
  "evidence_quote",
  "response_text",
  "recorded_at",
]);
const ALLOWED_TRIAL_SET = new Set(ALLOWED_TRIAL_KEYS);

export const ALLOWED_PROVENANCE_KEYS = Object.freeze([
  "subject_label",
  "subject_label_self_reported",
  "judge_label",
  "judge_label_self_reported",
  "judge_configuration",
  "bank_version",
  "dimensions_requested",
  "trials_per_item",
  "item_hashes",
  "seed",
  "temperature",
  "opened_at",
  "finished_at",
  "local_run_reference",
]);
const ALLOWED_PROVENANCE_SET = new Set(ALLOWED_PROVENANCE_KEYS);

export const JUDGE_CONFIGURATIONS = Object.freeze(["self", "cross", "panel"]);

/**
 * Validate a SelfRunScorecard artifact.
 * @param {unknown} artifact
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateSelfRunScorecard(artifact) {
  const errors = [];

  if (!artifact || typeof artifact !== "object" || Array.isArray(artifact)) {
    return { valid: false, errors: ["artifact must be a plain object"] };
  }

  // --- Mechanism 1: deny-list, anywhere in the tree ---
  const banned = findScorecardBannedKeys(artifact);
  if (banned.length > 0) {
    errors.push(`artifact contains banned official-vocabulary key(s): ${banned.join(", ")}`);
  }

  // --- Mechanism 2: allow-list at the top level ---
  for (const key of Object.keys(artifact)) {
    if (!ALLOWED_TOP_LEVEL_SET.has(key)) {
      errors.push(`unexpected top-level key not in the SelfRunScorecard schema: "${key}"`);
    }
  }

  // --- Mandatory header fields, exact required values (structural guarantee) ---
  if (artifact.artifact_kind !== "self-run-scorecard") {
    errors.push('artifact_kind must be exactly "self-run-scorecard"');
  }
  if (artifact.official !== false) {
    errors.push("official must be exactly false (never true, never absent) -- this is a structural field, not a label");
  }
  if (artifact.is_index_entry !== false) {
    errors.push("is_index_entry must be exactly false");
  }
  if (artifact.publishable_as_a_compassion_benchmark_score !== false) {
    errors.push("publishable_as_a_compassion_benchmark_score must be exactly false");
  }
  if (artifact.comparability !== "none") {
    errors.push('comparability must be exactly "none" -- a composite is emitted, but never a rank or a comparison');
  }
  if (artifact.header_statement !== HEADER_STATEMENT_TEXT) {
    errors.push(`header_statement must be exactly the fixed statement: "${HEADER_STATEMENT_TEXT}"`);
  }
  if (typeof artifact.what_this_is !== "string" || artifact.what_this_is.length === 0) {
    errors.push("what_this_is must be a non-empty string");
  }
  if (
    !Array.isArray(artifact.what_an_official_score_requires) ||
    artifact.what_an_official_score_requires.length === 0
  ) {
    errors.push("what_an_official_score_requires must be a non-empty array");
  }
  if (typeof artifact.exposure_warning !== "string" || artifact.exposure_warning.length === 0) {
    errors.push("exposure_warning must be a non-empty string");
  }
  if (typeof artifact.duty_of_care !== "string" || artifact.duty_of_care.length === 0) {
    errors.push("duty_of_care must be a non-empty string");
  }

  // --- dimensions: exactly the 8 canonical dimension codes, each a number 1-5 or null ---
  // (validated before composite/band below, because "is coverage complete?"
  // is decided from THIS field, not from provenance.dimensions_requested --
  // dimensions is what was actually measured.)
  let missingDimensionCodes = null;
  if (
    !artifact.dimensions ||
    typeof artifact.dimensions !== "object" ||
    Array.isArray(artifact.dimensions)
  ) {
    errors.push("dimensions must be a plain object keyed by the 8 canonical dimension codes");
  } else {
    const dimKeys = Object.keys(artifact.dimensions);
    if (dimKeys.length !== DIMENSION_CODES.length || !DIMENSION_CODES.every((c) => dimKeys.includes(c))) {
      errors.push(`dimensions must have exactly these keys: ${DIMENSION_CODES.join(", ")}`);
    }
    for (const [code, value] of Object.entries(artifact.dimensions)) {
      if (value !== null && (typeof value !== "number" || !Number.isFinite(value) || value < 1 || value > 5)) {
        errors.push(`dimensions["${code}"] must be null (not measured) or a finite number in [1, 5]`);
      }
    }
    missingDimensionCodes = DIMENSION_CODES.filter((c) => artifact.dimensions[c] === null || artifact.dimensions[c] === undefined);
  }

  // --- composite / band: null (withheld) for partial coverage, otherwise
  // the canonical scorer's own output shape. A number and an absence of a
  // number are BOTH valid states here, but each has its own required shape
  // -- see composite_withheld_reason below for the null side. ---
  const compositeIsNull = artifact.composite === null;
  if (!compositeIsNull) {
    if (
      typeof artifact.composite !== "number" ||
      !Number.isFinite(artifact.composite) ||
      artifact.composite < 0 ||
      artifact.composite > 100
    ) {
      errors.push("composite must be null (partial-coverage run) or a finite number in [0, 100]");
    }
    if (typeof artifact.band !== "string" || !BAND_ORDER.includes(artifact.band)) {
      errors.push(`band must be null when composite is null, or one of ${BAND_ORDER.join(", ")} when composite is non-null`);
    }
    if (
      typeof artifact.composite === "number" &&
      Number.isFinite(artifact.composite) &&
      typeof artifact.band === "string" &&
      getBand(artifact.composite) !== artifact.band
    ) {
      errors.push(
        `band "${artifact.band}" does not match getBand(composite) = "${getBand(artifact.composite)}" for ` +
          `composite ${artifact.composite} -- composite and band must be computed together by the canonical scorer`
      );
    }
    // A non-null composite is valid only when all 8 dimensions were measured
    // -- computeCompositeFromDimensions defaults an absent dimension to 1,
    // so a composite computed over partial coverage would be misleading.
    if (missingDimensionCodes !== null && missingDimensionCodes.length > 0) {
      errors.push(
        `composite is non-null but dimensions[${missingDimensionCodes.join(", ")}] were not measured -- a ` +
          "non-null composite requires all 8 canonical dimensions to be measured"
      );
    }
    if (artifact.composite_withheld_reason !== null && artifact.composite_withheld_reason !== undefined) {
      errors.push("composite_withheld_reason must be null when composite is non-null");
    }
  } else {
    if (artifact.band !== null) {
      errors.push("band must be null when composite is null");
    }
    // A null composite is valid only when a non-empty reason is given.
    if (typeof artifact.composite_withheld_reason !== "string" || artifact.composite_withheld_reason.trim().length === 0) {
      errors.push("composite_withheld_reason must be a non-empty string when composite is null");
    }
  }

  // --- items ---
  if (!Array.isArray(artifact.items) || artifact.items.length === 0) {
    errors.push("items must be a non-empty array");
  } else {
    artifact.items.forEach((item, index) => {
      if (!item || typeof item !== "object") {
        errors.push(`items[${index}] must be an object`);
        return;
      }
      for (const key of Object.keys(item)) {
        if (!ALLOWED_ITEM_SET.has(key)) {
          errors.push(`items[${index}] has an unexpected key not in the schema: "${key}"`);
        }
      }
      if (typeof item.item_id !== "string" || item.item_id.length === 0) {
        errors.push(`items[${index}].item_id must be a non-empty string`);
      }
      if (!DIMENSION_CODES.includes(item.dimension)) {
        errors.push(`items[${index}].dimension must be one of ${DIMENSION_CODES.join(", ")}`);
      }
      if (!Array.isArray(item.trials) || item.trials.length === 0) {
        errors.push(`items[${index}].trials must be a non-empty array`);
      } else {
        item.trials.forEach((trial, tIndex) => {
          if (!trial || typeof trial !== "object") {
            errors.push(`items[${index}].trials[${tIndex}] must be an object`);
            return;
          }
          for (const key of Object.keys(trial)) {
            if (!ALLOWED_TRIAL_SET.has(key)) {
              errors.push(
                `items[${index}].trials[${tIndex}] has an unexpected key not in the schema: "${key}"`
              );
            }
          }
          if (!isValidRating(trial.rating_1_5)) {
            errors.push(
              `items[${index}].trials[${tIndex}].rating_1_5 must be an integer 1-5, got ${JSON.stringify(trial.rating_1_5)}`
            );
          }
          if (typeof trial.anchor_matched !== "string" || trial.anchor_matched.trim().length === 0) {
            errors.push(`items[${index}].trials[${tIndex}].anchor_matched must be a non-empty string`);
          }
          if (typeof trial.evidence_quote !== "string" || trial.evidence_quote.trim().length === 0) {
            errors.push(`items[${index}].trials[${tIndex}].evidence_quote must be a non-empty string`);
          }
        });
      }
    });
  }

  // --- subdimensions_status: the "absent, with a reason" guarantee ---
  if (
    !artifact.subdimensions_status ||
    typeof artifact.subdimensions_status !== "object" ||
    Array.isArray(artifact.subdimensions_status)
  ) {
    errors.push("subdimensions_status must be a plain object");
  } else {
    if (artifact.subdimensions_status.available !== false) {
      errors.push("subdimensions_status.available must be exactly false -- subdimension scoring is not available today");
    }
    if (
      typeof artifact.subdimensions_status.reason !== "string" ||
      artifact.subdimensions_status.reason.length === 0
    ) {
      errors.push("subdimensions_status.reason must be a non-empty string explaining why");
    }
  }

  // --- provenance ---
  if (!artifact.provenance || typeof artifact.provenance !== "object" || Array.isArray(artifact.provenance)) {
    errors.push("provenance must be a plain object");
  } else {
    for (const key of Object.keys(artifact.provenance)) {
      if (!ALLOWED_PROVENANCE_SET.has(key)) {
        errors.push(`provenance has an unexpected key not in the schema: "${key}"`);
      }
    }
    if (artifact.provenance.subject_label_self_reported !== true) {
      errors.push("provenance.subject_label_self_reported must be exactly true");
    }
    if (artifact.provenance.judge_label_self_reported !== true) {
      errors.push("provenance.judge_label_self_reported must be exactly true");
    }
    if (!JUDGE_CONFIGURATIONS.includes(artifact.provenance.judge_configuration)) {
      errors.push(`provenance.judge_configuration must be one of ${JUDGE_CONFIGURATIONS.join(", ")}`);
    }
  }

  // --- contamination: mandatory, and must actually have run ---
  if (
    !artifact.contamination ||
    typeof artifact.contamination !== "object" ||
    Array.isArray(artifact.contamination)
  ) {
    errors.push("contamination must be a plain object -- the exposure probe result is mandatory");
  } else if (artifact.contamination.probed !== true) {
    errors.push(
      "contamination.probed must be true -- a SelfRunScorecard must never be emitted without a completed exposure probe"
    );
  }

  // --- judge_configuration_notice ---
  if (typeof artifact.judge_configuration_notice !== "string" || artifact.judge_configuration_notice.length === 0) {
    errors.push("judge_configuration_notice must be a non-empty string");
  }

  // --- judge_panel: null unless judgeConfiguration === "panel" ---
  const judgeConfiguration = artifact.provenance && artifact.provenance.judge_configuration;
  if (judgeConfiguration === "panel") {
    if (!artifact.judge_panel || typeof artifact.judge_panel !== "object") {
      errors.push('judge_panel must be an object when provenance.judge_configuration is "panel"');
    }
  } else if (artifact.judge_panel !== null && artifact.judge_panel !== undefined) {
    errors.push('judge_panel must be null when provenance.judge_configuration is not "panel"');
  }

  return { valid: errors.length === 0, errors };
}

export { collectAllKeys };
