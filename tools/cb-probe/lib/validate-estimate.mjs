// lib/validate-estimate.mjs
//
// Pure validator for the JudgeEstimate artifact. No I/O. This is the
// separation guarantee: it must be built, and its tests must be written,
// before any tool that produces a JudgeEstimate (MCP_SERVER_PLAN_2026-09-20.md
// "Build order").
//
// Two independent mechanisms, both mechanical, matching
// ARCHITECTURE_RELEASE_WATCH_AND_BYO.md §5.1 (J1, "two-way vocabulary ban"):
//
//   1. DENY-LIST: no key, anywhere in the artifact (at any nesting depth),
//      may exactly equal one of the words that would imply this is an
//      official Compassion Benchmark result (score, composite, band, rank,
//      benchmark, rate, rating [bare], registry_id, result_id, cohort,
//      run_id, publishable, authorized_by).
//
//      This is an EXACT key-name match, not a substring match. A key like
//      `publishable_as_a_compassion_benchmark_score` is deliberately exempt:
//      it exists precisely to assert the negative ("this is NOT publishable
//      as a score"), and substring-banning would forbid the header field
//      whose entire job is to say so. A key like `rating_1_5` is exempt for
//      the same reason: it is the tool's own self-reported 1-5 scale, named
//      in the ratified tool contract, not an "official noun" standing in for
//      a Compassion Benchmark rating.
//
//      Because this is a key scan (not a value scan), free-text fields the
//      user pastes in (response_text, rationale, subject_label,
//      judge_model_label) are never inspected for vocabulary — a model's
//      pasted answer is allowed to contain the word "score" without failing
//      validation. Only the STRUCTURE we emit is bound by the ban.
//
//   2. ALLOW-LIST: the top-level artifact may contain only a fixed, declared
//      set of keys. Any key outside that set fails validation, whether or
//      not it happens to appear in the deny-list above. This catches
//      official-side vocabulary we did not think to deny-list by name (e.g.
//      `result`, `rater`, `evaluation`, `cohort` at the top level) simply by
//      never having allowed it in.
//
// A record that renames judge vocabulary into official vocabulary (J1's
// mirrored-validator idea, applied inside this one package since cb-probe
// does not touch the official validators under site/) is caught by (2); a
// record that sneaks banned words in at any depth is caught by (1). Together
// they are the two-way ban.

export const BANNED_KEYS = Object.freeze([
  "score",
  "composite",
  "band",
  "rank",
  "benchmark",
  "rate",
  "rating",
  "registry_id",
  "result_id",
  "cohort",
  "run_id",
  "publishable",
  "authorized_by",
]);

const BANNED_KEY_SET = new Set(BANNED_KEYS);

export const ALLOWED_TOP_LEVEL_KEYS = Object.freeze([
  // mandatory header (ARCHITECTURE_RELEASE_WATCH_AND_BYO.md §5.5)
  "artifact_kind",
  "official",
  "is_index_entry",
  "publishable_as_a_compassion_benchmark_score",
  "comparability",
  "what_this_is",
  "what_an_official_score_requires",
  "exposure_warning",
  "duty_of_care",
  "subject_label_self_reported",
  "judge_model_label_self_reported",
  // session content
  "session_id",
  "subject_label",
  "judge_model_label",
  "bank_version",
  "tool_version",
  "opened_at",
  "summarised_at",
  "item_count",
  "item_estimates",
  "dimension_counts",
]);

const ALLOWED_TOP_LEVEL_SET = new Set(ALLOWED_TOP_LEVEL_KEYS);

export const ALLOWED_ITEM_ESTIMATE_KEYS = Object.freeze([
  "item_id",
  "dimension",
  "construct",
  "rating_1_5",
  "rationale",
  "response_text",
  "recorded_at",
]);

const ALLOWED_ITEM_ESTIMATE_SET = new Set(ALLOWED_ITEM_ESTIMATE_KEYS);

/** Recursively collect every object key present in `value`. */
export function collectAllKeys(value, acc = new Set()) {
  if (value && typeof value === "object") {
    if (Array.isArray(value)) {
      for (const entry of value) collectAllKeys(entry, acc);
    } else {
      for (const [key, entry] of Object.entries(value)) {
        acc.add(key);
        collectAllKeys(entry, acc);
      }
    }
  }
  return acc;
}

/**
 * Return the subset of `bannedKeys` present anywhere in `value`. Defaults to
 * this module's own BANNED_KEYS (the JudgeEstimate ban), but is reused by
 * lib/validate-scorecard.mjs with a precisely-extended list (see that file's
 * SCORECARD_BANNED_KEYS): composite/band are permitted there and nowhere
 * else, and this function stays the single implementation both schemas share
 * rather than two independent copies drifting apart.
 */
export function findBannedKeys(value, bannedKeys = BANNED_KEYS) {
  const bannedSet = bannedKeys === BANNED_KEYS ? BANNED_KEY_SET : new Set(bannedKeys);
  const keys = collectAllKeys(value);
  return [...keys].filter((key) => bannedSet.has(key));
}

/**
 * Validate a JudgeEstimate artifact.
 * @param {unknown} artifact
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateJudgeEstimate(artifact) {
  const errors = [];

  if (!artifact || typeof artifact !== "object" || Array.isArray(artifact)) {
    return { valid: false, errors: ["artifact must be a plain object"] };
  }

  // --- Mechanism 1: deny-list, anywhere in the tree ---
  const banned = findBannedKeys(artifact);
  if (banned.length > 0) {
    errors.push(
      `artifact contains banned official-vocabulary key(s): ${banned.join(", ")}`
    );
  }

  // --- Mechanism 2: allow-list at the top level ---
  for (const key of Object.keys(artifact)) {
    if (!ALLOWED_TOP_LEVEL_SET.has(key)) {
      errors.push(`unexpected top-level key not in the JudgeEstimate schema: "${key}"`);
    }
  }

  // --- Mandatory header fields, exact required values ---
  if (artifact.artifact_kind !== "judge-estimate") {
    errors.push('artifact_kind must be exactly "judge-estimate"');
  }
  if (artifact.official !== false) {
    errors.push("official must be exactly false (never true, never absent)");
  }
  if (artifact.is_index_entry !== false) {
    errors.push("is_index_entry must be exactly false");
  }
  if (artifact.publishable_as_a_compassion_benchmark_score !== false) {
    errors.push("publishable_as_a_compassion_benchmark_score must be exactly false");
  }
  if (artifact.comparability !== "none") {
    errors.push('comparability must be exactly "none"');
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
  if (artifact.subject_label_self_reported !== true) {
    errors.push("subject_label_self_reported must be exactly true");
  }
  if (artifact.judge_model_label_self_reported !== true) {
    errors.push("judge_model_label_self_reported must be exactly true");
  }

  // --- Session identity ---
  if (typeof artifact.session_id !== "string" || artifact.session_id.length === 0) {
    errors.push("session_id must be a non-empty string");
  }
  if (typeof artifact.tool_version !== "string" || artifact.tool_version.length === 0) {
    errors.push("tool_version must be a non-empty string (this package's own version, for provenance)");
  }

  // --- item_estimates shape, if present ---
  if (artifact.item_estimates !== undefined) {
    if (!Array.isArray(artifact.item_estimates)) {
      errors.push("item_estimates must be an array");
    } else {
      artifact.item_estimates.forEach((estimate, index) => {
        if (!estimate || typeof estimate !== "object") {
          errors.push(`item_estimates[${index}] must be an object`);
          return;
        }
        for (const key of Object.keys(estimate)) {
          if (!ALLOWED_ITEM_ESTIMATE_SET.has(key)) {
            errors.push(
              `item_estimates[${index}] has an unexpected key not in the schema: "${key}"`
            );
          }
        }
        const rating = estimate.rating_1_5;
        if (
          typeof rating !== "number" ||
          !Number.isInteger(rating) ||
          rating < 1 ||
          rating > 5
        ) {
          errors.push(
            `item_estimates[${index}].rating_1_5 must be an integer 1-5, got ${JSON.stringify(rating)}`
          );
        }
      });
    }
  }

  // --- dimension_counts shape, if present: no means, no composite ---
  if (artifact.dimension_counts !== undefined) {
    if (
      typeof artifact.dimension_counts !== "object" ||
      artifact.dimension_counts === null ||
      Array.isArray(artifact.dimension_counts)
    ) {
      errors.push("dimension_counts must be a plain object keyed by dimension code");
    } else {
      for (const [dimension, entry] of Object.entries(artifact.dimension_counts)) {
        if (
          !entry ||
          typeof entry !== "object" ||
          typeof entry.n !== "number" ||
          !Number.isInteger(entry.n) ||
          entry.n < 0
        ) {
          errors.push(
            `dimension_counts["${dimension}"] must be { n: <non-negative integer> }`
          );
        }
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate a `rating_1_5` value in isolation. Used by record_item_estimate
 * before anything is written to disk.
 * @param {unknown} value
 * @returns {boolean}
 */
export function isValidRating(value) {
  return typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 5;
}
