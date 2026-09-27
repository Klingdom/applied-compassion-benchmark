/**
 * model-score-history-validator.mjs
 *
 * Validates site/src/data/model-benchmark/score-history-v1.json — the
 * append-only record of every score ever produced for every exact model
 * snapshot.
 *
 * WHY THIS EXISTS BEFORE ANY SCORE DOES
 *   A score history built after scores start arriving has already lost the
 *   first ones. The founder's requirement is that previous model scores are
 *   always kept; the only way to guarantee that is to make overwriting
 *   structurally invalid before there is anything to overwrite.
 *
 * THE LOAD-BEARING DESIGN DECISION
 *   There is no "current score" field anywhere. A model's current score is
 *   DERIVED as its most recent non-superseded record. Storing a current value
 *   next to a history is how the two drift apart — the same defect class
 *   (DC-15) as a gate that compares two copies instead of specifying the truth.
 *
 * WHAT APPEND-ONLY MEANS HERE
 *   Records are never edited and never deleted. A correction is a NEW record
 *   whose `supersedes` names the one it replaces, and the superseded record
 *   stays in the file. `validateAgainstPrevious` compares a new file against
 *   the committed one and fails if any existing record changed or vanished.
 */

import { DIMENSION_CODES } from "./scoring.mjs";
import { DIMENSIONS_MAP } from "./task-bank-validator.mjs";

export const SUBDIMENSION_CODES = Object.freeze(DIMENSIONS_MAP.flatMap((d) => d.subdims));

const JUDGE_CONFIGS = new Set(["cross", "panel", "self"]);
const COVERAGE_LEVELS = new Set(["complete", "dimension-only", "insufficient"]);
const COMPARABILITY = new Set(["none", "within-bank", "cross-model"]);

const REQUIRED_STRINGS = [
  "record_id",
  "registry_id",
  "evaluated_at",
  "bank_version",
  "tool_version",
  "judge_configuration",
  "coverage_level",
  "comparability",
  "artifact_ref",
];

const MIN_TRIALS = 3;

/** Stable serialisation used to detect mutation of an existing record. */
export function recordFingerprint(record) {
  return JSON.stringify(record, Object.keys(record).sort());
}

/**
 * @param {object} history parsed score-history file
 * @param {object} [registry] parsed registry, for foreign-key checking
 */
export function validateScoreHistory(history, registry = null) {
  const errors = [];
  const warnings = [];
  let checks = 0;
  const check = () => (checks += 1);

  if (!history || typeof history !== "object") return { valid: false, errors: ["history is not an object"], warnings, checks };
  if (!history.meta || typeof history.meta !== "object") errors.push("meta must be an object");
  if (!Array.isArray(history.records)) {
    return { valid: false, errors: [...errors, "records must be an array"], warnings, checks };
  }

  const records = history.records;

  check();
  if (history.meta && history.meta.recordCount !== records.length) {
    errors.push(`meta.recordCount is ${history.meta?.recordCount} but records holds ${records.length} — a typed count that disagrees with the data`);
  }

  const seenIds = new Set();
  const byRegistry = new Map();
  const registryIds = registry && Array.isArray(registry.entries) ? new Set(registry.entries.map((e) => e && e.registry_id)) : null;

  records.forEach((r, idx) => {
    const at = `records[${idx}]${r && r.record_id ? ` (${r.record_id})` : ""}`;
    if (!r || typeof r !== "object") {
      errors.push(`${at}: not an object`);
      return;
    }

    check();
    for (const f of REQUIRED_STRINGS) {
      if (typeof r[f] !== "string" || r[f].length === 0) errors.push(`${at}: ${f} must be a non-empty string`);
    }

    check();
    if (seenIds.has(r.record_id)) errors.push(`${at}: duplicate record_id "${r.record_id}"`);
    seenIds.add(r.record_id);

    check();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(r.evaluated_at))) errors.push(`${at}: evaluated_at must be an ISO date`);

    check();
    if (!JUDGE_CONFIGS.has(r.judge_configuration)) {
      errors.push(`${at}: judge_configuration must be one of ${[...JUDGE_CONFIGS].join(", ")}`);
    }
    if (!Array.isArray(r.judge_labels) || r.judge_labels.length === 0) {
      errors.push(`${at}: judge_labels must be a non-empty array`);
    }

    check();
    if (!COVERAGE_LEVELS.has(r.coverage_level)) errors.push(`${at}: coverage_level must be one of ${[...COVERAGE_LEVELS].join(", ")}`);
    if (!COMPARABILITY.has(r.comparability)) errors.push(`${at}: comparability must be one of ${[...COMPARABILITY].join(", ")}`);

    // --- composite / band must agree, and must respect the D-40 gate ---
    check();
    const hasComposite = r.composite !== null && r.composite !== undefined;
    const hasBand = r.band !== null && r.band !== undefined;
    if (hasComposite !== hasBand) {
      errors.push(`${at}: composite and band must both be present or both be null (composite=${r.composite}, band=${r.band})`);
    }
    if (hasComposite) {
      if (typeof r.composite !== "number" || !Number.isFinite(r.composite) || r.composite < 0 || r.composite > 100) {
        errors.push(`${at}: composite must be a number in [0,100], got ${JSON.stringify(r.composite)}`);
      }
      if (r.coverage_level === "insufficient") {
        errors.push(`${at}: coverage_level "insufficient" cannot carry a composite (DECISIONS.md D-40)`);
      }
    }

    // --- dimension and subdimension means must be in range and backed ---
    check();
    for (const [label, codes, means, counts] of [
      ["dimension", DIMENSION_CODES, r.dimensions, r.dimension_item_counts],
      ["subdimension", SUBDIMENSION_CODES, r.subdimensions, r.subdimension_item_counts],
    ]) {
      if (means === undefined) continue;
      if (!means || typeof means !== "object") {
        errors.push(`${at}: ${label}s must be an object`);
        continue;
      }
      for (const code of Object.keys(means)) {
        if (!codes.includes(code)) errors.push(`${at}: unknown ${label} code "${code}"`);
      }
      for (const code of codes) {
        const v = means[code];
        if (v === undefined || v === null) continue;
        if (typeof v !== "number" || v < 1 || v > 5) {
          errors.push(`${at}: ${label} ${code} must be null or a number in [1,5], got ${JSON.stringify(v)}`);
          continue;
        }
        const n = counts ? counts[code] : undefined;
        if (counts && (typeof n !== "number" || n <= 0)) {
          errors.push(`${at}: ${label} ${code} reports a mean of ${v} but ${n === undefined ? "no" : n} rated items — an unbacked number`);
        }
      }
    }

    check();
    if (typeof r.trials_per_item !== "number" || r.trials_per_item < MIN_TRIALS) {
      errors.push(`${at}: trials_per_item must be an integer >= ${MIN_TRIALS}`);
    }

    // --- the honesty fields are required, not optional ---
    check();
    if (typeof r.contamination_indicated !== "boolean") {
      errors.push(`${at}: contamination_indicated must be a boolean — a score with no contamination verdict is not interpretable`);
    }
    if (!r.contamination_detail || typeof r.contamination_detail !== "object") {
      errors.push(`${at}: contamination_detail must be an object recording what the probes actually returned`);
    }
    if (typeof r.official !== "boolean") errors.push(`${at}: official must be a boolean`);

    check();
    if (r.official === true) {
      if (r.judge_configuration === "self") errors.push(`${at}: a self-judged run can never be official`);
      if (r.contamination_indicated === true) errors.push(`${at}: a contaminated run can never be official`);
      if (r.comparability === "none") errors.push(`${at}: official requires comparability better than "none"`);
    }

    check();
    if (r.comparability === "cross-model" && r.contamination_indicated !== false) {
      errors.push(`${at}: cross-model comparability requires a clean contamination verdict`);
    }

    check();
    if (registryIds && !registryIds.has(r.registry_id)) {
      errors.push(`${at}: registry_id "${r.registry_id}" has no entry in the model registry — a score for a snapshot that was never registered`);
    }

    if (!byRegistry.has(r.registry_id)) byRegistry.set(r.registry_id, []);
    byRegistry.get(r.registry_id).push(r);
  });

  // --- supersedes must point at a real, earlier record for the same snapshot ---
  for (const r of records) {
    if (!r || r.supersedes === null || r.supersedes === undefined) continue;
    check();
    const target = records.find((x) => x && x.record_id === r.supersedes);
    if (!target) {
      errors.push(`${r.record_id}: supersedes "${r.supersedes}" names no record in this file — a superseded record must be retained, never deleted`);
      continue;
    }
    if (target.registry_id !== r.registry_id) {
      errors.push(`${r.record_id}: supersedes a record for a different snapshot (${target.registry_id})`);
    }
    if (target.record_id === r.record_id) errors.push(`${r.record_id}: supersedes itself`);
  }

  return { valid: errors.length === 0, errors, warnings, checks, recordCount: records.length, modelsWithHistory: byRegistry.size };
}

/**
 * The append-only guarantee, checked against the committed file.
 *
 * Every record present in `previous` must still be present in `next`, byte-for-
 * byte. New records may be appended. Nothing may be edited or removed.
 */
export function validateAgainstPrevious(previous, next) {
  const errors = [];
  const prevRecords = Array.isArray(previous?.records) ? previous.records : [];
  const nextById = new Map((Array.isArray(next?.records) ? next.records : []).map((r) => [r && r.record_id, r]));

  for (const before of prevRecords) {
    const after = nextById.get(before.record_id);
    if (!after) {
      errors.push(`record "${before.record_id}" was REMOVED. Score history is append-only; a correction is a new record with supersedes, not a deletion.`);
      continue;
    }
    if (recordFingerprint(before) !== recordFingerprint(after)) {
      errors.push(`record "${before.record_id}" was EDITED. Score history is append-only; publish a new record whose supersedes names this one.`);
    }
  }
  return { valid: errors.length === 0, errors, previousCount: prevRecords.length, nextCount: nextById.size };
}

/**
 * A model's current score is derived, never stored.
 *
 * @returns the most recent non-superseded record for each registry_id
 */
export function deriveCurrentScores(history) {
  const records = Array.isArray(history?.records) ? history.records : [];
  const superseded = new Set(records.map((r) => r && r.supersedes).filter(Boolean));
  const live = records.filter((r) => r && !superseded.has(r.record_id));

  const byRegistry = new Map();
  for (const r of live) {
    const held = byRegistry.get(r.registry_id);
    if (!held || String(r.evaluated_at) > String(held.evaluated_at)) byRegistry.set(r.registry_id, r);
  }
  return byRegistry;
}
