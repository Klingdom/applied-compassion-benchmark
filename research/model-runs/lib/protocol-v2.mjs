// protocol-v2.mjs -- loader and validator for weekly/PROTOCOL.v2.json (WP-1, docs/model-eval/ARCHITECTURE_EVAL_V2.md).
//
// STATUS: nothing reads this module yet. lib/weekly.mjs still reads only weekly/PROTOCOL.json (v1); the v2 planner is
// WP-2. This module only answers: is the proposed file well formed, and which values has the founder not yet chosen?
//
// OPEN encoding: a block {"id": "O<n>", "open": true|false, "proposed_default", "options", "source"} sits at the
// path it decides. A closed block is {"id", "open": false, "value"}. A "ratified" file may contain no open block.
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const PROTOCOL_V2_FILE = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "weekly", "PROTOCOL.v2.json");
export const PROTOCOL_VERSION_V2 = "weekly-v2";

export const TOP_LEVEL_KEYS = Object.freeze([
  "protocol_version", "status", "proposed_at", "ratified_at", "supersedes", "rationale",
  "ollama_host", "trials", "max_retries", "system_message", "arm", "bank_sha256",
  "served_items_sha256", "served_items_note", "judges", "judges_per_response", "judging",
  "max_batch_entries", "judge_validity", "gates", "bootstrap_replicates", "correction",
  "reference", "anchor", "max_new_subjects_per_wave", "selection", "local", "hosted", "cost",
  "comparisons", "publication", "proposed_requirements"
]);

/** The founder's open values, exactly as ARCHITECTURE_EVAL_V2.md section 3.2 lists them: id -> path of the block. */
export const OPEN_VALUE_PATHS = Object.freeze({
  O1: "judges",
  O2: "judging.transport_default",
  O3: "judging.temperature",
  O4: "hosted.enabled",
  O5: "hosted.temperature",
  O6: "hosted.seed_policy",
  O7: "hosted.variance.thresholds",
  O8: "gates.completeness_max_failed_percent",
  O9: "gates.agreement_floor_exact",
  O10: "gates.family_gap_max_composite",
  O11: "anchor.max_abs_signed_drift",
  O12: "max_new_subjects_per_wave",
  O13: "selection.hold_licence_classes",
  O14: "local.thinking",
  O15: "cost.monthly_ceiling"
});

/** Every field of weekly/PROTOCOL.json (v1) and the v2 path that carries it (the memory/size fields moved under local). */
export const V1_TO_V2_PATHS = Object.freeze({
  protocol_version: "protocol_version",
  status: "status",
  proposed_at: "proposed_at",
  rationale: "rationale",
  ollama_host: "ollama_host",
  trials: "trials",
  max_retries: "max_retries",
  system_message: "system_message",
  arm: "arm",
  bank_sha256: "bank_sha256",
  judges: "judges",
  judges_per_response: "judges_per_response",
  max_batch_entries: "max_batch_entries",
  judge_validity: "judge_validity",
  bootstrap_replicates: "bootstrap_replicates",
  correction: "correction",
  reference: "reference",
  anchor: "anchor",
  max_new_subjects_per_wave: "max_new_subjects_per_wave",
  vram_budget_gb: "local.vram_budget_gb",
  max_model_size_gb: "local.max_model_size_gb",
  size_unit: "local.size_unit",
  comparisons: "comparisons"
});

const isPlain = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const getPath = (obj, p) => p.split(".").reduce((o, k) => (isPlain(o) && Object.prototype.hasOwnProperty.call(o, k) ? o[k] : undefined), obj);

/** Collect every object that has an own "open" key, with its dotted path. Does not descend into a block. */
function collectBlocks(node, prefix, out) {
  if (Array.isArray(node)) {
    node.forEach((x, i) => collectBlocks(x, `${prefix}[${i}]`, out));
  } else if (isPlain(node)) {
    if (Object.prototype.hasOwnProperty.call(node, "open")) {
      out.push({ path: prefix, block: node });
      return;
    }
    for (const [k, v] of Object.entries(node)) collectBlocks(v, prefix ? `${prefix}.${k}` : k, out);
  }
  return out;
}

/** Returns { ok, problems, openValues }. Never throws on bad content. */
export function validateProtocolV2(obj) {
  const problems = [];
  const openValues = [];
  if (!isPlain(obj)) return { ok: false, problems: ["not an object"], openValues };

  for (const k of Object.keys(obj)) if (!TOP_LEVEL_KEYS.includes(k)) problems.push(`unknown top-level key ${JSON.stringify(k)}`);
  if (obj.protocol_version !== PROTOCOL_VERSION_V2) problems.push(`protocol_version must be "${PROTOCOL_VERSION_V2}" (got ${JSON.stringify(obj.protocol_version)})`);
  if (obj.status !== "proposed" && obj.status !== "ratified") problems.push(`status must be "proposed" or "ratified" (got ${JSON.stringify(obj.status)})`);

  for (const [v1Key, v2Path] of Object.entries(V1_TO_V2_PATHS)) {
    if (getPath(obj, v2Path) === undefined) problems.push(`v1 field ${v1Key} is missing at ${v2Path}`);
  }

  const blocks = collectBlocks(obj, "", []);
  const seen = new Map();
  for (const { path: p, block } of blocks) {
    if (typeof block.open !== "boolean") { problems.push(`${p}: open must be a boolean`); continue; }
    if (typeof block.id !== "string" || !Object.prototype.hasOwnProperty.call(OPEN_VALUE_PATHS, block.id)) {
      problems.push(`${p}: block id ${JSON.stringify(block.id)} is not one of O1..O15`);
      continue;
    }
    if (!seen.has(block.id)) seen.set(block.id, []);
    seen.get(block.id).push(p);
    if (OPEN_VALUE_PATHS[block.id] !== p) problems.push(`${block.id} must sit at ${OPEN_VALUE_PATHS[block.id]} (found at ${p})`);
    if (block.open) {
      for (const f of ["proposed_default", "options", "source"]) {
        if (!Object.prototype.hasOwnProperty.call(block, f)) problems.push(`${block.id}: open block lacks ${f}`);
      }
      if (!Array.isArray(block.options) || block.options.length === 0) problems.push(`${block.id}: options must be a non-empty array`);
      if (typeof block.source !== "string" || block.source.length === 0) problems.push(`${block.id}: source must be a non-empty string`);
      openValues.push({ id: block.id, path: p, proposed_default: block.proposed_default });
    } else if (!Object.prototype.hasOwnProperty.call(block, "value")) {
      problems.push(`${block.id}: a closed block needs a value`);
    }
  }
  for (const id of Object.keys(OPEN_VALUE_PATHS)) {
    const at = seen.get(id) ?? [];
    if (at.length === 0) problems.push(`${id} is missing (expected at ${OPEN_VALUE_PATHS[id]})`);
    else if (at.length > 1) problems.push(`${id} appears ${at.length} times (${at.join(", ")})`);
  }

  if (obj.status === "ratified" && openValues.length > 0) {
    problems.push(`status is "ratified" but ${openValues.length} value(s) are still open: ${openValues.map((o) => `${o.id} (${o.path})`).join(", ")}`);
  }
  openValues.sort((a, b) => Number(a.id.slice(1)) - Number(b.id.slice(1)));
  return { ok: problems.length === 0, problems, openValues };
}

/** Reads and validates a file. Returns { protocol, ok, problems, openValues }; throws only if the file is unreadable or not JSON. */
export function loadProtocolV2(file = PROTOCOL_V2_FILE) {
  const protocol = JSON.parse(readFileSync(file, "utf8"));
  return { protocol, ...validateProtocolV2(protocol) };
}

function main(argv) {
  const args = argv.slice(2);
  if (!args.includes("--check")) {
    console.error("usage: node research/model-runs/lib/protocol-v2.mjs --check [file]");
    return 2;
  }
  const file = args.find((a) => a !== "--check") ?? PROTOCOL_V2_FILE;
  let r;
  try {
    r = loadProtocolV2(file);
  } catch (e) {
    console.error(`FAIL ${file}: ${e.message}`);
    return 1;
  }
  if (!r.ok) {
    console.error(`FAIL ${file}`);
    for (const p of r.problems) console.error(`  - ${p}`);
    return 1;
  }
  console.log(`${file}: valid, status ${r.protocol.status}, ${r.openValues.length} open value(s)`);
  for (const o of r.openValues) console.log(`  ${o.id}  ${o.path}  default=${JSON.stringify(o.proposed_default)}`);
  return 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exit(main(process.argv));
