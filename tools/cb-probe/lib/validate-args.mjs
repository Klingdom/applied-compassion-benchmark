// lib/validate-args.mjs
//
// Enforces each tool's own `inputSchema` (lib/tool-definitions.mjs) at
// `tools/call`, before the handler ever runs. Until this module existed,
// `inputSchema` was returned to the host in `tools/list` and never
// enforced anywhere -- every `required`, `minimum`/`maximum`, `enum`, and
// `additionalProperties: false` was advisory to a well-behaved client only
// (see docs/reviews/CB_PROBE_SILENT_FAILURES_2026-09-24.md finding #4 and
// docs/reviews/CB_PROBE_SECURITY_2026-09-24.md SEC-04). This is the root
// cause that let a `recall_attempts` entry omit `recalled_text` entirely
// and a 60 MB `item_id` echo straight back into a host's context.
//
// Deliberately a small, hand-rolled subset of JSON Schema -- exactly the
// keywords lib/tool-definitions.mjs actually uses (type, properties,
// required, additionalProperties, enum, minimum, maximum, minLength,
// maxLength, maxItems, items). No runtime dependency; this is not a
// general-purpose JSON Schema validator.
//
// Error messages never echo a full user-supplied value back verbatim --
// only its length or a short, capped preview -- so a validation failure on
// an oversized field cannot itself become a multi-megabyte echo channel.

const DISPLAY_MAX = 80;

function shortDisplay(value) {
  let s;
  try {
    s = typeof value === "string" ? value : JSON.stringify(value);
  } catch {
    s = String(value);
  }
  if (typeof s !== "string") s = String(s);
  if (s.length > DISPLAY_MAX) {
    return `${s.slice(0, DISPLAY_MAX)}... (${s.length} chars total)`;
  }
  return s;
}

function describeType(value) {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value;
}

function matchesType(value, type) {
  switch (type) {
    case "object":
      return value !== null && typeof value === "object" && !Array.isArray(value);
    case "array":
      return Array.isArray(value);
    case "string":
      return typeof value === "string";
    case "boolean":
      return typeof value === "boolean";
    case "number":
      return typeof value === "number" && Number.isFinite(value);
    case "integer":
      return typeof value === "number" && Number.isFinite(value) && Number.isInteger(value);
    default:
      return true;
  }
}

/**
 * @param {object} schema - a JSON-Schema-shaped object (see tool-definitions.mjs)
 * @param {unknown} value - the value at this node
 * @param {string} label - human-readable path for error messages ("" at the root)
 * @param {string[]} errors - accumulator
 */
function validateNode(schema, value, label, errors) {
  if (!schema || typeof schema !== "object") return;
  const displayLabel = label || "(root)";

  if (schema.type && !matchesType(value, schema.type)) {
    errors.push(`${displayLabel}: expected type "${schema.type}", got ${describeType(value)}`);
    return; // wrong shape -- do not recurse into it
  }

  if (Array.isArray(schema.enum) && !schema.enum.includes(value)) {
    errors.push(`${displayLabel}: must be one of ${JSON.stringify(schema.enum)}, got ${shortDisplay(value)}`);
  }

  if (typeof value === "number") {
    if (typeof schema.minimum === "number" && value < schema.minimum) {
      errors.push(`${displayLabel}: must be >= ${schema.minimum}, got ${value}`);
    }
    if (typeof schema.maximum === "number" && value > schema.maximum) {
      errors.push(`${displayLabel}: must be <= ${schema.maximum}, got ${value}`);
    }
  }

  if (typeof value === "string") {
    if (typeof schema.minLength === "number" && value.length < schema.minLength) {
      errors.push(`${displayLabel}: must be at least ${schema.minLength} character(s), got ${value.length}`);
    }
    if (typeof schema.maxLength === "number" && value.length > schema.maxLength) {
      errors.push(`${displayLabel}: must be at most ${schema.maxLength} character(s), got ${value.length}`);
    }
  }

  if (Array.isArray(value)) {
    if (typeof schema.maxItems === "number" && value.length > schema.maxItems) {
      errors.push(`${displayLabel}: must have at most ${schema.maxItems} item(s), got ${value.length}`);
    }
    if (schema.items) {
      value.forEach((entry, index) => {
        validateNode(schema.items, entry, `${displayLabel}[${index}]`, errors);
      });
    }
  }

  if (schema.type === "object" && value && typeof value === "object" && !Array.isArray(value)) {
    const props = schema.properties || {};

    if (Array.isArray(schema.required)) {
      for (const requiredKey of schema.required) {
        if (!(requiredKey in value) || value[requiredKey] === undefined) {
          const fieldLabel = label ? `${label}.${requiredKey}` : requiredKey;
          errors.push(`${fieldLabel}: required field is missing`);
        }
      }
    }

    if (schema.additionalProperties === false) {
      for (const key of Object.keys(value)) {
        if (!(key in props)) {
          const fieldLabel = label ? `${label}.${shortDisplay(key)}` : shortDisplay(key);
          errors.push(`${fieldLabel}: unexpected field, not declared in this tool's inputSchema`);
        }
      }
    }

    for (const [key, subSchema] of Object.entries(props)) {
      if (key in value && value[key] !== undefined) {
        validateNode(subSchema, value[key], label ? `${label}.${key}` : key, errors);
      }
    }
  }
}

/**
 * Validate `args` against a tool's declared `inputSchema`.
 * @param {object} schema - def.inputSchema
 * @param {unknown} args - the parsed `arguments` object from a tools/call request
 * @returns {string[]} error messages; empty means valid
 */
export function validateToolArgs(schema, args) {
  const errors = [];
  validateNode(schema, args, "", errors);
  return errors;
}
