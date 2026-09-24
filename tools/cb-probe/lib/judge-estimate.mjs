// lib/judge-estimate.mjs
//
// Builds the JudgeEstimate artifact returned by summarise_judge_session.
// Emits per-item estimates and per-dimension COUNTS only. Never a composite,
// never a band, never a mean. The caller function itself has nowhere to put
// one: there is no such field in HEADER or in the object literal below.

import { HEADER } from "./separation-statement.mjs";
import { validateJudgeEstimate } from "./validate-estimate.mjs";
import { PACKAGE_VERSION } from "./paths.mjs";

/**
 * @param {object} session - { session_id, subject_label, judge_model_label, opened_at, bank_version }
 * @param {Array<object>} estimates - recorded item_estimate rows, already in ALLOWED_ITEM_ESTIMATE_KEYS shape
 * @returns {object} JudgeEstimate artifact
 */
export function buildJudgeEstimate(session, estimates) {
  // Object.create(null), not {}: `estimate.dimension` is read back from a
  // user-editable file on disk (estimates/<item_id>.json), so a dimension
  // value of "__proto__" would otherwise trigger dimensionCounts's [[Set]]
  // special case and reassign Object.prototype itself via bracket-notation
  // assignment (SEC-06). A plain object literal is not safe here because
  // the key comes from disk, not from a fixed, trusted list.
  const dimensionCounts = Object.create(null);
  for (const estimate of estimates) {
    const dimension = estimate.dimension;
    if (!dimensionCounts[dimension]) {
      dimensionCounts[dimension] = { n: 0 };
    }
    dimensionCounts[dimension].n += 1;
  }

  const artifact = {
    ...HEADER,
    session_id: session.session_id,
    subject_label: session.subject_label,
    judge_model_label: session.judge_model_label,
    bank_version: session.bank_version,
    tool_version: PACKAGE_VERSION,
    opened_at: session.opened_at,
    summarised_at: new Date().toISOString(),
    item_count: estimates.length,
    item_estimates: estimates,
    dimension_counts: dimensionCounts,
  };

  const { valid, errors } = validateJudgeEstimate(artifact);
  if (!valid) {
    // This should be unreachable in normal operation: it means this builder
    // itself drifted from the schema it is supposed to satisfy. Fail loudly
    // rather than write a non-compliant artifact to disk.
    throw new Error(
      `cb-probe: refusing to emit a non-compliant JudgeEstimate: ${errors.join("; ")}`
    );
  }

  return artifact;
}
