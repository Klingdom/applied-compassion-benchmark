/**
 * lint-rules.mjs — Shared rule set for daily-briefing linting.
 *
 * SINGLE SOURCE OF TRUTH for the PUBLIC DAILY JSON RULES enforced by
 * `lint-daily-briefings.mjs` and tested by `test-lint-briefings.mjs`.
 *
 * If you change a rule here, both consumers pick it up automatically
 * — no manual sync needed.
 *
 * The canonical authoring rules (BAD/GOOD examples, observer-voice
 * guidance, status taxonomy) live in `.claude/agents/overnight-digest.md`
 * under "PUBLIC DAILY JSON RULES (NON-NEGOTIABLE)". This file is the
 * machine-readable enforcement layer.
 *
 * Added: Improvement Loop 6, 2026-05-22.
 */

// ──────────────────────────────────────────────────────────────────────────
// Reviewer-facing phrases (case-insensitive substring match against any string).
// ──────────────────────────────────────────────────────────────────────────

export const FORBIDDEN_PHRASES = [
  "human review required",
  "requires human review",
  "pending human review",
  "human review",                       // catches all variants
  "founder decision",
  "founder review",
  "requires founder review",
  "requires founder",
  "flagged for review",
  "needs review",
  "requires editorial judgment",
  "requires editorial sign-off",
  "requires editorial",
  "apply requires human review",
  "warrants human review",
  "review queue",
  "requires reviewer",
  "awaiting reviewer",
  "pending baseline reconciliation",
  "flagged for human review",
  "pending founder",
  "awaiting founder",
];

// ──────────────────────────────────────────────────────────────────────────
// Forbidden status/actionType/cycleType string values.
// ──────────────────────────────────────────────────────────────────────────

export const FORBIDDEN_STATUS_VALUES = new Set([
  "requires-human-review",
  "band-crossing-human-review-pending",
  "human-review-methodology-ambiguity",
  "human-review-band-crossing",
  "held",
  "pending-review",
  "requires-review",
  "flagged",
  "escalated",
]);

// ──────────────────────────────────────────────────────────────────────────
// Forbidden top-level keys inside the `pipeline` object.
// ──────────────────────────────────────────────────────────────────────────

export const FORBIDDEN_PIPELINE_KEYS = new Set([
  "scoreChangesPendingHumanReview",
  "bandChangesPendingReview",
  "humanReviewFlags",
  "mathHygieneFlags",
  "baselineCorrections",
  "holdsReleased",
  "holdsActive",
  "priorityAssessments",
  "rotationAssessments",
]);

// ──────────────────────────────────────────────────────────────────────────
// Reusable recursive scanner.
// Returns an array of violation objects: { path, rule, detail, snippet }
// ──────────────────────────────────────────────────────────────────────────

export function scanForViolations(node, path = "") {
  const violations = [];
  scan(node, path, violations);
  return violations;
}

function scan(node, path, violations) {
  if (node === null || node === undefined) return;

  if (typeof node === "string") {
    const lower = node.toLowerCase();
    for (const phrase of FORBIDDEN_PHRASES) {
      if (lower.includes(phrase)) {
        violations.push({
          path,
          rule: "forbidden-phrase",
          detail: phrase,
          snippet: node.slice(0, 160),
        });
      }
    }
    if (lower.includes("(human review required)")) {
      violations.push({
        path,
        rule: "forbidden-cycle-type-parenthetical",
        detail: "(human review required)",
        snippet: node.slice(0, 160),
      });
    }
    return;
  }

  if (Array.isArray(node)) {
    node.forEach((child, i) => scan(child, `${path}[${i}]`, violations));
    return;
  }

  if (typeof node === "object") {
    for (const key of Object.keys(node)) {
      const childPath = path ? `${path}.${key}` : key;
      const value = node[key];

      // Forbidden status/actionType/cycleType values
      if ((key === "status" || key === "actionType" || key === "cycleType") &&
          typeof value === "string" &&
          FORBIDDEN_STATUS_VALUES.has(value)) {
        violations.push({
          path: childPath,
          rule: "forbidden-status-value",
          detail: value,
          snippet: value,
        });
      }

      // Forbidden top-level pipeline keys
      if (path === "pipeline" && FORBIDDEN_PIPELINE_KEYS.has(key)) {
        violations.push({
          path: childPath,
          rule: "forbidden-pipeline-key",
          detail: key,
          snippet: `pipeline.${key}`,
        });
      }

      // Empty pendingReview arrays at any level
      if (key === "pendingReview" && Array.isArray(value) && value.length === 0) {
        violations.push({
          path: childPath,
          rule: "empty-pendingReview-array",
          detail: "pendingReview=[]",
          snippet: "[]",
        });
      }

      scan(value, childPath, violations);
    }
  }
}
