#!/usr/bin/env node
/**
 * collect-agent-json.mjs — TRI-7.
 *
 * Reads a JSON array an agent WROTE TO A FILE, validates its shape, and stages
 * it for `ingest-triage.mjs`. Nothing is retyped by hand at any point.
 *
 * WHY
 *   The agent hand-back channel strips fenced code blocks. On 2026-09-30 two
 *   agents returned prose summaries while stating their JSON had been
 *   delivered; `SendMessage` is disabled, so there was no way to ask again. A
 *   batch was re-run specifically to avoid reconstructing from prose, and the
 *   rerun's JSON was stripped too — so it is a property of the channel, not of
 *   the agents.
 *
 *   The record was therefore transcribed from the agent's own prose
 *   enumeration. That is weaker provenance than parsed JSON and was labelled as
 *   such, but "weaker provenance, honestly labelled" is a worse answer than "no
 *   retyping". Retyping machine output is the DC-20 shape: a hand in the middle
 *   of a pipeline, producing something indistinguishable from the real thing.
 *
 * THE CONVENTION
 *   A brief tells the agent: write your array to <path>, then reply with only
 *   that path. The path is worthless to fabricate — if the file is absent or
 *   malformed this refuses, loudly, rather than falling back to the prose.
 *
 * Usage:
 *   node research/scripts/collect-agent-json.mjs --in <file> --agent <id> --batch <NN> --out <staging dir>
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";

function arg(name, fallback = null) {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 && process.argv[i + 1] && !process.argv[i + 1].startsWith("--") ? process.argv[i + 1] : fallback;
}

const IN = arg("in");
const AGENT = arg("agent");
const BATCH = arg("batch");
const OUT = arg("out");

if (!IN || !AGENT || !BATCH || !OUT) {
  console.error("usage: collect-agent-json.mjs --in <file> --agent <id> --batch <NN> --out <staging dir>");
  process.exit(2);
}

if (!existsSync(IN)) {
  console.error(
    `REFUSED: ${IN} does not exist.\n` +
      "The agent was asked to WRITE its array to that path. If it replied with prose instead, re-run the brief —\n" +
      "do not transcribe the prose. Retyping machine output is exactly what this script exists to prevent."
  );
  process.exit(1);
}

const raw = readFileSync(IN, "utf8");

/** An agent may still wrap the array in a fence even when writing to a file. */
function extractArray(text) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const body = (fenced ? fenced[1] : text).trim();
  const start = body.indexOf("[");
  const end = body.lastIndexOf("]");
  if (start === -1 || end === -1 || end < start) return null;
  return body.slice(start, end + 1);
}

const slice = extractArray(raw);
if (!slice) {
  console.error(`REFUSED: no JSON array found in ${IN}. First 200 characters:\n${raw.slice(0, 200)}`);
  process.exit(1);
}

let parsed;
try {
  parsed = JSON.parse(slice);
} catch (e) {
  console.error(`REFUSED: ${IN} does not contain valid JSON — ${e.message}`);
  process.exit(1);
}
if (!Array.isArray(parsed) || parsed.length === 0) {
  console.error(`REFUSED: expected a non-empty array in ${IN}, got ${Array.isArray(parsed) ? "an empty array" : typeof parsed}`);
  process.exit(1);
}

// Shape checks only — ingest-triage does the bank-membership and coverage work.
const problems = [];
parsed.forEach((r, i) => {
  if (typeof r?.item_id !== "string" || !r.item_id) problems.push(`[${i}] item_id must be a non-empty string`);
  if (!Array.isArray(r?.suspected)) problems.push(`[${i}] suspected must be an array`);
  else if (r.suspected.some((c) => !Number.isInteger(c) || c < 1 || c > 5)) problems.push(`[${i}] suspected must hold integers 1-5`);
  if (Array.isArray(r?.suspected) && r.suspected.length > 0 && !String(r.reason ?? "").trim()) {
    problems.push(`[${i}] ${r.item_id}: a suspicion needs a reason`);
  }
});
if (problems.length > 0) {
  console.error(`REFUSED: ${problems.length} shape problem(s) in ${IN}:`);
  for (const p of problems.slice(0, 10)) console.error(`  ${p}`);
  process.exit(1);
}

mkdirSync(OUT, { recursive: true });
const dest = join(OUT, `batch-${String(BATCH).padStart(2, "0")}--${AGENT}.json`);
writeFileSync(dest, `${JSON.stringify(parsed, null, 2)}\n`);

const flagged = parsed.filter((r) => r.suspected.length > 0);
console.log(`Collected ${parsed.length} record(s) from ${IN}`);
console.log(`  flagged: ${flagged.length}${flagged.length ? ` (${flagged.map((r) => r.item_id).join(", ")})` : ""}`);
console.log(`  staged:  ${dest}`);
console.log("  provenance: parsed from a file the agent wrote. Nothing was retyped.");
