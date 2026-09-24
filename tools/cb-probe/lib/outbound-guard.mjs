// lib/outbound-guard.mjs
//
// The single choke point every tool RESULT passes through, in
// lib/rpc-handler.mjs, before it is serialised and sent to the host. Until
// this existed, the honest-labelling rules (official: false, no ranking,
// composite/band only inside a validated SelfRunScorecard) were enforced
// only INSIDE the two artifact builders (judge-estimate.mjs,
// self-run-scorecard.mjs) -- so a twelfth tool that built and returned a
// plain object without going through either builder would bypass every
// rule with nothing to stop it (see
// docs/reviews/CB_PROBE_ARCHITECTURE_2026-09-24.md §6.3, and §2.4's account
// of exactly this already happening once: start_scored_run inherited none
// of list_probe_items' sensitivity gating because the gate lived in one
// handler, not in a shared boundary).
//
// This module is deliberately conservative: it does not attempt a general
// semantic "is this a ranking?" detector. It mechanically enforces the
// specific structural guarantees this package exists to make:
//   1. `official` must never be `true`, anywhere in the returned tree.
//   2. `comparability`, wherever it appears, must be exactly "none".
//   3. `rank` / `ranking` / `leaderboard` must never appear as a key,
//      anywhere -- these are the official-vocabulary nouns for the one
//      thing cb-probe must never produce.
//   4. Any object anywhere in the tree carrying a `composite` or `band` key
//      must itself pass validateSelfRunScorecard -- the only way a number
//      may travel is inside an artifact that satisfies every other rule
//      (partial-coverage withholding, mandatory contamination, provenance,
//      the vocabulary ban) at the same time.

import { validateSelfRunScorecard } from "./validate-scorecard.mjs";

const ALWAYS_BANNED_KEYS = Object.freeze(["rank", "ranking", "leaderboard"]);

function walk(value, visit) {
  if (!value || typeof value !== "object") return;
  if (Array.isArray(value)) {
    for (const entry of value) walk(entry, visit);
    return;
  }
  visit(value);
  for (const entry of Object.values(value)) walk(entry, visit);
}

/**
 * @param {string} toolName
 * @param {unknown} result - whatever a tool handler returned
 * @throws {Error} if the result violates a structural honesty guarantee
 */
export function assertHonestToolResult(toolName, result) {
  if (!result || typeof result !== "object") return;

  const violations = [];

  walk(result, (node) => {
    if (node.official === true) {
      violations.push('carries "official: true"');
    }
    if (Object.prototype.hasOwnProperty.call(node, "comparability") && node.comparability !== "none") {
      violations.push(`carries comparability !== "none" (${JSON.stringify(node.comparability)})`);
    }
    for (const bannedKey of ALWAYS_BANNED_KEYS) {
      if (Object.prototype.hasOwnProperty.call(node, bannedKey)) {
        violations.push(`carries a banned key "${bannedKey}"`);
      }
    }
    if (Object.prototype.hasOwnProperty.call(node, "composite") || Object.prototype.hasOwnProperty.call(node, "band")) {
      const { valid, errors } = validateSelfRunScorecard(node);
      if (!valid) {
        violations.push(
          `carries composite/band but does not pass validateSelfRunScorecard: ${errors.slice(0, 3).join("; ")}`
        );
      }
    }
  });

  if (violations.length > 0) {
    throw new Error(
      `cb-probe internal integrity check failed for tool "${toolName}" -- refusing to emit this result: ` +
        violations.join(" | ")
    );
  }
}
