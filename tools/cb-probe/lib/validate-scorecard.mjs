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
//   - `subdimensions` WAS banned anywhere in the tree, because subdimension
//     scoring did not exist and the one thing worse than "absent" is a key
//     named `subdimensions` holding zeros or nulls pretending to be scores.
//     Bank v2.0 (2026-09-24) changed the underlying fact: all 40 subdimension
//     codes are now carried by real items, so real per-subdimension means can
//     be reported. The ban is therefore REPLACED, not deleted, by a stronger
//     check (validateSubdimensions below): the key is permitted at the top
//     level only, every value must be null or a rating in [1,5], and a
//     non-null mean must be backed by a non-zero item count in
//     `subdimension_item_counts`. A fabricated or unbacked number now fails
//     by name, which is more than absence ever proved.
//
// Two independent mechanisms, exactly as validate-estimate.mjs: a deny-list
// (SCORECARD_BANNED_KEYS, anywhere in the tree) and an allow-list (only
// declared top-level / item / trial keys are accepted).

import { BANNED_KEYS, collectAllKeys, findBannedKeys as findBannedKeysGeneric } from "./validate-estimate.mjs";
import { isValidRating } from "./validate-estimate.mjs";
import { DIMENSION_CODES, BAND_ORDER, getBand } from "../../../site/scripts/lib/scoring.mjs";
import { HEADER_STATEMENT_TEXT } from "./scorecard-header.mjs";

// The item-coverage floor a composite requires, ON TOP OF all 8 dimensions
// being present: DECISIONS.md D-40 (2026-09-24, founder-directed), grounded
// in docs/MCP_SCORED_RUN_DESIGN_2026-09-20.md §2 ("one item per subdimension
// is a single point of failure; two gives disagreement signal, three gives a
// mean") and in the measured sensitivity docs/reviews/
// CB_PROBE_METHODOLOGY_2026-09-24.md reports: a single rating changed by 1 on
// a 2-item dimension moves the composite 2.5 points -- the same swing
// DECISIONS.md D-07 treats as disqualifying for machine-only scoring. Lives
// here (the schema-contract module), not in lib/self-run-scorecard.mjs, so
// this file and that one can import it without a circular dependency.
export const MIN_ITEMS_PER_DIMENSION_FOR_COMPOSITE = 3;

const EXEMPT_FOR_SCORECARD = new Set(["composite", "band"]);

export const SCORECARD_BANNED_KEYS = Object.freeze([...BANNED_KEYS.filter((key) => !EXEMPT_FOR_SCORECARD.has(key))]);

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
  "dimension_item_counts",
  "subdimensions",
  "subdimension_item_counts",
  "coverage",
  "uncertainty",
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
  "tool_version",
  "dimensions_requested",
  "trials_per_item",
  "item_hashes",
  "include_sensitive",
  "sensitive_items_excluded",
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

  // --- dimension_item_counts: how many rated items fed each dimension's
  // mean -- the field a reader (or a test) can check the >=3 composite floor
  // against without counting the items[] array by hand (DECISIONS.md D-40). ---
  let shortfallDimensionCodes = null;
  if (
    !artifact.dimension_item_counts ||
    typeof artifact.dimension_item_counts !== "object" ||
    Array.isArray(artifact.dimension_item_counts)
  ) {
    errors.push("dimension_item_counts must be a plain object keyed by the 8 canonical dimension codes");
  } else {
    const countKeys = Object.keys(artifact.dimension_item_counts);
    if (countKeys.length !== DIMENSION_CODES.length || !DIMENSION_CODES.every((c) => countKeys.includes(c))) {
      errors.push(`dimension_item_counts must have exactly these keys: ${DIMENSION_CODES.join(", ")}`);
    }
    for (const [code, value] of Object.entries(artifact.dimension_item_counts)) {
      if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
        errors.push(`dimension_item_counts["${code}"] must be a non-negative integer`);
        continue;
      }
      const dimValue = artifact.dimensions && artifact.dimensions[code];
      if (value === 0 && dimValue !== null && dimValue !== undefined) {
        errors.push(`dimension_item_counts["${code}"] is 0 but dimensions["${code}"] is measured -- these must agree`);
      }
      if (value > 0 && (dimValue === null || dimValue === undefined)) {
        errors.push(`dimension_item_counts["${code}"] is ${value} but dimensions["${code}"] is null -- these must agree`);
      }
    }
    shortfallDimensionCodes = DIMENSION_CODES.filter((c) => {
      const n = artifact.dimension_item_counts[c];
      return typeof n === "number" && n > 0 && n < MIN_ITEMS_PER_DIMENSION_FOR_COMPOSITE;
    });
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
    // DECISIONS.md D-40: a non-null composite ALSO requires every dimension
    // to rest on >= MIN_ITEMS_PER_DIMENSION_FOR_COMPOSITE rated items, not
    // merely a non-null mean -- a mean of 1 or 2 items is not the floor the
    // design doc calls "three gives a mean".
    if (shortfallDimensionCodes !== null && shortfallDimensionCodes.length > 0) {
      errors.push(
        `composite is non-null but dimension_item_counts[${shortfallDimensionCodes.join(", ")}] are below the ` +
          `${MIN_ITEMS_PER_DIMENSION_FOR_COMPOSITE}-item floor -- a non-null composite requires every dimension ` +
          `to rest on at least ${MIN_ITEMS_PER_DIMENSION_FOR_COMPOSITE} rated items (DECISIONS.md D-40)`
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

  // --- uncertainty: a bootstrap interval for every measured dimension mean,
  // and for the composite when (and only when) the coverage floor is met
  // (DECISIONS.md D-40; site/scripts/lib/evaluation-statistics.mjs
  // bootstrapCompositeUncertainty). Not exhaustively shape-checked field by
  // field -- the point here is the STRUCTURAL guarantee (an interval exists
  // exactly where a mean exists; the composite interval exists exactly when
  // the composite does), not re-deriving the bootstrap's own arithmetic. ---
  if (!artifact.uncertainty || typeof artifact.uncertainty !== "object" || Array.isArray(artifact.uncertainty)) {
    errors.push("uncertainty must be a plain object with 'dimensions' and 'composite_interval' keys");
  } else {
    const unexpectedUncertaintyKeys = Object.keys(artifact.uncertainty).filter(
      (k) => k !== "dimensions" && k !== "composite_interval"
    );
    if (unexpectedUncertaintyKeys.length > 0) {
      errors.push(`uncertainty has unexpected key(s): ${unexpectedUncertaintyKeys.join(", ")}`);
    }
    if (
      !artifact.uncertainty.dimensions ||
      typeof artifact.uncertainty.dimensions !== "object" ||
      Array.isArray(artifact.uncertainty.dimensions)
    ) {
      errors.push("uncertainty.dimensions must be a plain object keyed by the 8 canonical dimension codes");
    } else {
      const udimKeys = Object.keys(artifact.uncertainty.dimensions);
      if (udimKeys.length !== DIMENSION_CODES.length || !DIMENSION_CODES.every((c) => udimKeys.includes(c))) {
        errors.push(`uncertainty.dimensions must have exactly these keys: ${DIMENSION_CODES.join(", ")}`);
      }
      for (const code of DIMENSION_CODES) {
        const entry = artifact.uncertainty.dimensions[code];
        const dimValue = artifact.dimensions && artifact.dimensions[code];
        const dimensionIsMeasured = typeof dimValue === "number";
        if (!dimensionIsMeasured) {
          if (entry !== null) {
            errors.push(`uncertainty.dimensions["${code}"] must be null -- dimensions["${code}"] was not measured`);
          }
          continue;
        }
        if (!entry || typeof entry !== "object") {
          errors.push(`uncertainty.dimensions["${code}"] must be an object -- dimensions["${code}"] was measured`);
          continue;
        }
        if (
          typeof entry.ci !== "object" ||
          !Array.isArray(entry.ci) ||
          entry.ci.length !== 2 ||
          typeof entry.ci[0] !== "number" ||
          typeof entry.ci[1] !== "number" ||
          entry.ci[0] > entry.ci[1] ||
          entry.ci[0] < 1 - 1e-9 ||
          entry.ci[1] > 5 + 1e-9
        ) {
          errors.push(`uncertainty.dimensions["${code}"].ci must be a [lo, hi] pair with lo <= hi, both in [1, 5]`);
        }
        if (typeof entry.point_estimate !== "number" || !Number.isFinite(entry.point_estimate)) {
          errors.push(`uncertainty.dimensions["${code}"].point_estimate must be a finite number`);
        }
        if (typeof entry.method !== "string" || entry.method.length === 0) {
          errors.push(`uncertainty.dimensions["${code}"].method must be a non-empty string naming which method produced this interval`);
        }
        if (typeof entry.sufficient !== "boolean") {
          errors.push(`uncertainty.dimensions["${code}"].sufficient must be a boolean`);
        }
      }
    }

    // NOTE: this field is `composite_interval`, NOT `composite` --
    // lib/outbound-guard.mjs treats ANY object anywhere in a tool result
    // that carries a bare `composite` key as a candidate SelfRunScorecard
    // needing its own independent validateSelfRunScorecard pass. A nested
    // `uncertainty.composite` would trip that generic walk against an
    // object that was never meant to BE a scorecard.
    if (compositeIsNull) {
      if (artifact.uncertainty.composite_interval !== null) {
        errors.push("uncertainty.composite_interval must be null when composite is null");
      }
    } else {
      const uc = artifact.uncertainty.composite_interval;
      if (!uc || typeof uc !== "object") {
        errors.push("uncertainty.composite_interval must be an object when composite is non-null");
      } else {
        if (
          !Array.isArray(uc.ci) ||
          uc.ci.length !== 2 ||
          typeof uc.ci[0] !== "number" ||
          typeof uc.ci[1] !== "number" ||
          uc.ci[0] > uc.ci[1] ||
          uc.ci[0] < -1e-9 ||
          uc.ci[1] > 100 + 1e-9
        ) {
          errors.push("uncertainty.composite_interval.ci must be a [lo, hi] pair with lo <= hi, both in [0, 100]");
        }
        if (typeof uc.method !== "string" || uc.method.length === 0) {
          errors.push(
            "uncertainty.composite_interval.method must be a non-empty string naming which method produced this interval"
          );
        }
      }
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

  // --- subdimensions_status: a reason is required whether or not it is available ---
  if (
    !artifact.subdimensions_status ||
    typeof artifact.subdimensions_status !== "object" ||
    Array.isArray(artifact.subdimensions_status)
  ) {
    errors.push("subdimensions_status must be a plain object");
  } else {
    if (typeof artifact.subdimensions_status.available !== "boolean") {
      errors.push("subdimensions_status.available must be a boolean");
    }
    if (
      typeof artifact.subdimensions_status.reason !== "string" ||
      artifact.subdimensions_status.reason.length === 0
    ) {
      errors.push("subdimensions_status.reason must be a non-empty string explaining the coverage position");
    }
  }

  // --- subdimensions: every reported mean must be real and backed ---
  //
  // This replaces the old blanket ban on a key named `subdimensions`. The ban
  // existed because no item carried a subdimension code, so any such key would
  // have been fabricated. Bank v2.0 changed that fact. What must never happen
  // is unchanged: a per-subdimension number that is not backed by rated items.
  if (artifact.subdimensions !== undefined) {
    const subs = artifact.subdimensions;
    const counts = artifact.subdimension_item_counts;
    if (!subs || typeof subs !== "object" || Array.isArray(subs)) {
      errors.push("subdimensions must be a plain object keyed by subdimension code");
    } else if (!counts || typeof counts !== "object" || Array.isArray(counts)) {
      errors.push("subdimension_item_counts must accompany subdimensions -- a mean with no item count is unbacked");
    } else {
      for (const [code, value] of Object.entries(subs)) {
        const n = counts[code];
        if (typeof n !== "number" || !Number.isInteger(n) || n < 0) {
          errors.push(`subdimension_item_counts["${code}"] must be a non-negative integer`);
          continue;
        }
        if (value === null) {
          if (n !== 0) {
            errors.push(
              `subdimensions["${code}"] is null but subdimension_item_counts says ${n} item(s) were rated -- ` +
                `a rated subdimension must report its mean`
            );
          }
          continue;
        }
        if (typeof value !== "number" || !Number.isFinite(value) || value < 1 || value > 5) {
          errors.push(`subdimensions["${code}"] must be null or a number in [1,5], got ${JSON.stringify(value)}`);
          continue;
        }
        if (n === 0) {
          errors.push(
            `subdimensions["${code}"] reports a mean of ${value} but subdimension_item_counts says 0 items were ` +
              `rated -- this is exactly the fabricated number the schema exists to prevent`
          );
        }
      }
    }
  }

  // --- coverage: the honest three-state level ---
  if (artifact.coverage !== undefined) {
    const cov = artifact.coverage;
    if (!cov || typeof cov !== "object" || Array.isArray(cov)) {
      errors.push("coverage must be a plain object");
    } else {
      const LEVELS = ["complete", "dimension-only", "insufficient"];
      if (!LEVELS.includes(cov.level)) {
        errors.push(`coverage.level must be one of ${LEVELS.join(", ")}, got ${JSON.stringify(cov.level)}`);
      }
      if (typeof cov.note !== "string" || cov.note.length === 0) {
        errors.push("coverage.note must be a non-empty string");
      }
      // "complete" is a claim about the whole taxonomy, so it is checked, not trusted.
      if (cov.level === "complete") {
        if (artifact.composite === null || artifact.composite === undefined) {
          errors.push('coverage.level "complete" requires a composite -- it asserts the D-40 floor was met');
        }
        if (Array.isArray(cov.unratedSubdimensions) && cov.unratedSubdimensions.length > 0) {
          errors.push(
            `coverage.level "complete" contradicts unratedSubdimensions (${cov.unratedSubdimensions.length} unrated)`
          );
        }
        if (artifact.subdimension_item_counts) {
          const unrated = Object.entries(artifact.subdimension_item_counts).filter(([, n]) => !n);
          if (unrated.length > 0) {
            errors.push(
              `coverage.level "complete" is false: ${unrated.length} subdimension(s) have 0 rated items ` +
                `(${unrated.slice(0, 5).map(([c]) => c).join(", ")}${unrated.length > 5 ? ", ..." : ""})`
            );
          }
        }
      }
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
    if (typeof artifact.provenance.tool_version !== "string" || artifact.provenance.tool_version.length === 0) {
      errors.push("provenance.tool_version must be a non-empty string (this package's own version, for provenance)");
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
