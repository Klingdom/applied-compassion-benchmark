// lib/projection.mjs
//
// The field-separation projection for list_probe_items. Enforces
// tasks-v1.json's own meta.fieldSeparationPolicy mechanically, as a
// WHITELIST derived from the bank's declared policy -- never a hand-written
// field list (MCP_SERVER_PLAN_2026-09-20.md, "Tools for this build").
//
// Two kinds of fields ever reach the output:
//
//   1. A small, fixed set of IDENTITY fields (id, dimension, construct).
//      These are not governed by fieldSeparationPolicy -- that policy exists
//      to declare which fields may be copy-pasted INTO a model's context,
//      and id/dimension/construct are metadata about the item, not part of
//      what is sent to a model under test. They are always safe to return.
//
//   2. Whatever fieldSeparationPolicy.modelFacingFields declares, parsed at
//      runtime. If the bank's policy changes (a field is added or removed),
//      this module's output changes with it -- nothing here needs editing.
//
// Every other field on a raw item -- sourceOnlyFields, criticalHarmRules,
// conversationState, userContext, reviewers, promptIntegrity, supersedes,
// reviewRequired, and anything else present today or added later -- is
// structurally unreachable: the output object is built field-by-field from
// the whitelist, never by copying the item and deleting a blocklist.

const IDENTITY_FIELDS = Object.freeze(["id", "dimension", "construct"]);

const SCALAR_SPEC_RE = /^[a-zA-Z0-9_]+$/;
const ARRAY_SPEC_RE = /^([a-zA-Z0-9_]+)\[\]\.([a-zA-Z0-9_]+)$/;

function parseFieldSpec(spec) {
  const arrayMatch = spec.match(ARRAY_SPEC_RE);
  if (arrayMatch) {
    return { kind: "array", arrayField: arrayMatch[1], subField: arrayMatch[2] };
  }
  if (SCALAR_SPEC_RE.test(spec)) {
    return { kind: "scalar", field: spec };
  }
  throw new Error(
    `cb-probe: unrecognised meta.fieldSeparationPolicy.modelFacingFields entry: "${spec}". ` +
      `Expected a bare field name (e.g. "prompt") or an array projection (e.g. "variants[].prompt").`
  );
}

/**
 * Parse meta.fieldSeparationPolicy.modelFacingFields into a structured
 * whitelist. Exported for testing so the parser itself is directly checkable.
 */
export function buildModelFacingWhitelist(fieldSeparationPolicy) {
  if (!fieldSeparationPolicy || !Array.isArray(fieldSeparationPolicy.modelFacingFields)) {
    throw new Error(
      "cb-probe: fieldSeparationPolicy.modelFacingFields is missing or malformed; refusing to guess a field whitelist."
    );
  }
  return fieldSeparationPolicy.modelFacingFields.map(parseFieldSpec);
}

/**
 * Project a single raw bank item down to the public, model-safe shape:
 * identity fields plus whatever the bank's own policy declares model-facing.
 * @param {object} item - a raw item from tasks-v1.json
 * @param {object} fieldSeparationPolicy - bank.meta.fieldSeparationPolicy
 * @returns {object}
 */
export function projectItem(item, fieldSeparationPolicy) {
  const whitelist = buildModelFacingWhitelist(fieldSeparationPolicy);
  const out = {};

  for (const field of IDENTITY_FIELDS) {
    out[field] = item[field] ?? null;
  }

  for (const spec of whitelist) {
    if (spec.kind === "scalar") {
      if (item[spec.field] !== undefined) {
        out[spec.field] = item[spec.field];
      }
    } else if (spec.kind === "array") {
      const arr = item[spec.arrayField];
      if (Array.isArray(arr)) {
        out[spec.arrayField] = arr.map((entry) => ({
          [spec.subField]: entry ? entry[spec.subField] ?? null : null,
        }));
      }
    }
  }

  return out;
}

export { IDENTITY_FIELDS };
