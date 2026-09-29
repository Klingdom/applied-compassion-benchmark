#!/usr/bin/env node
/**
 * ingest-triage.mjs — MB-2-TRIAGE full pass.
 *
 * Parses agent triage output into site/src/data/model-benchmark/item-triage-v1.json.
 *
 * WHY A SCRIPT AND NOT COPY-PASTE
 *   The pilot produced 20 records and I transcribed none of them, deliberately:
 *   hand-copying 186 records is exactly the kind of work that introduces a
 *   defect into the record of defects. Agents emit strict JSON; this reads it,
 *   validates it against the bank, refuses anything malformed, and appends.
 *
 * REFUSALS (all of these fail rather than warn)
 *   - an item id not in the bank
 *   - an item that appears twice for the same agent
 *   - a suspicion with no reason
 *   - a criterion outside 1-5
 *   - INCOMPLETE COVERAGE: a batch whose agent did not return every item in it.
 *     A partial pass silently reported as complete is the worst outcome here,
 *     because the queue would look authoritative while missing items entirely.
 *
 * Usage:
 *   node research/scripts/ingest-triage.mjs --staging <dir> --pass <id> [--dry-run]
 *
 * Staging layout: one file per agent per batch, named
 *   batch-<NN>--<agent_id>.json
 * containing the raw JSON array the agent emitted.
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateItemTriage, validateTriageAgainstPrevious, deriveTriageQueue, computeTriageAgreement } from "../../site/scripts/lib/item-triage-validator.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = join(__dirname, "..", "..");
const STORE = join(REPO, "site", "src", "data", "model-benchmark", "item-triage-v1.json");
const BANK = join(REPO, "site", "src", "data", "model-benchmark", "tasks-v1.json");

function arg(name, fallback = null) {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 && process.argv[i + 1] && !process.argv[i + 1].startsWith("--") ? process.argv[i + 1] : fallback;
}
const DRY = process.argv.includes("--dry-run");
const STAGING = arg("staging");
const PASS_ID = arg("pass");
/**
 * Targeted re-triage of named items, e.g. after a harness bug misrepresented
 * one. Coverage is then checked against this explicit list instead of the whole
 * batch. It is opt-in and must be named on the command line, because a partial
 * pass that silently satisfied the coverage check would be indistinguishable
 * from a complete one — which is the failure the coverage guard exists for.
 */
const ONLY = (arg("only", "") || "").split(",").map((x) => x.trim()).filter(Boolean);

if (!STAGING || !PASS_ID) {
  console.error("usage: ingest-triage.mjs --staging <dir> --pass <id> [--dry-run]");
  process.exit(2);
}

const bank = JSON.parse(readFileSync(BANK, "utf8"));
const bankIds = new Set(bank.items.map((i) => i.id));
const store = JSON.parse(readFileSync(STORE, "utf8"));

/** Which items belong to which batch, recomputed from the bank the same way
 *  the batch files were generated. Coverage is checked against THIS, not
 *  against what the agent happened to return. */
const SIZE = 12;
const batchOf = new Map();
bank.items.forEach((it, idx) => batchOf.set(it.id, Math.floor(idx / SIZE) + 1));
const itemsInBatch = (n) => bank.items.filter((it) => batchOf.get(it.id) === n).map((it) => it.id);

const errors = [];
const records = [];
const seenPerAgent = new Map();

const files = readdirSync(STAGING).filter((f) => f.endsWith(".json")).sort();
if (files.length === 0) {
  console.error(`No .json files in ${STAGING}. Refusing to report an empty ingest as success.`);
  process.exit(1);
}

for (const f of files) {
  const m = f.match(/^batch-(\d+)--(.+)\.json$/);
  if (!m) {
    errors.push(`${f}: filename must be batch-<NN>--<agent_id>.json`);
    continue;
  }
  const batchNo = Number(m[1]);
  const agentId = m[2];

  let parsed;
  try {
    parsed = JSON.parse(readFileSync(join(STAGING, f), "utf8"));
  } catch (e) {
    errors.push(`${f}: not valid JSON — ${e.message}`);
    continue;
  }
  if (!Array.isArray(parsed)) {
    errors.push(`${f}: top level must be an array`);
    continue;
  }

  // A TARGETED pass (--only) re-triages named items, e.g. after a harness bug
  // misrepresented one. Coverage is then checked against that explicit list
  // rather than the whole batch. It must be opt-in and named on the command
  // line: a partial pass that silently passed the coverage check would be
  // indistinguishable from a complete one, which is the failure this guard
  // exists to prevent.
  const expected = ONLY.length > 0 ? ONLY : itemsInBatch(batchNo);
  if (expected.length === 0) {
    errors.push(`${f}: batch ${batchNo} matches no items in the bank`);
    continue;
  }

  const got = new Set();
  for (const r of parsed) {
    const id = r?.item_id;
    if (!bankIds.has(id)) {
      errors.push(`${f}: item_id "${id}" is not in the task bank`);
      continue;
    }
    const key = `${agentId}::${id}`;
    if (seenPerAgent.has(key)) {
      errors.push(`${f}: ${agentId} returned ${id} more than once`);
      continue;
    }
    seenPerAgent.set(key, true);
    got.add(id);

    const suspected = Array.isArray(r.suspected) ? [...new Set(r.suspected)] : null;
    if (suspected === null || suspected.some((c) => !Number.isInteger(c) || c < 1 || c > 5)) {
      errors.push(`${f}: ${id} has an invalid suspected array: ${JSON.stringify(r.suspected)}`);
      continue;
    }
    const reason = typeof r.reason === "string" ? r.reason.trim() : "";
    if (suspected.length > 0 && !reason) {
      errors.push(`${f}: ${id} is suspected on ${suspected.join(",")} with no reason`);
      continue;
    }

    records.push({
      triage_id: `${PASS_ID}--${id}--${agentId}`,
      pass_id: PASS_ID,
      item_id: id,
      agent_id: agentId,
      triaged_at: new Date().toISOString().slice(0, 10),
      suspected: suspected.sort((a, b) => a - b),
      reason: suspected.length > 0 ? reason : "",
      rank: Number.isInteger(r.rank) ? r.rank : null,
      blind: true,
    });
  }

  // COVERAGE: a partial batch reported as complete is the worst failure here.
  const missing = expected.filter((id) => !got.has(id));
  if (missing.length > 0) {
    errors.push(`${f}: INCOMPLETE — ${agentId} did not return ${missing.length} item(s) from batch ${batchNo}: ${missing.join(", ")}`);
  }
}

if (errors.length > 0) {
  console.error(`\nREFUSED — ${errors.length} problem(s):`);
  for (const e of errors) console.error(`  ${e}`);
  process.exit(1);
}

const next = {
  ...store,
  meta: { ...store.meta, recordCount: store.triage.length + records.length, status: "pass-ingested" },
  triage: [...store.triage, ...records],
};

const v = validateItemTriage(next, bank);
if (!v.valid) {
  console.error("\nREFUSED — the resulting file would be invalid:");
  for (const e of v.errors.slice(0, 20)) console.error(`  ${e}`);
  process.exit(1);
}
const ap = validateTriageAgainstPrevious(store, next);
if (!ap.valid) {
  console.error("\nREFUSED — append-only violated:");
  for (const e of ap.errors) console.error(`  ${e}`);
  process.exit(1);
}

// ---- report ----
const agents = new Set(records.map((r) => r.agent_id));
const itemsCovered = new Set(records.map((r) => r.item_id));
const targeted = ONLY.length > 0;
console.log(`\nIngest for pass "${PASS_ID}"${targeted ? ` — TARGETED re-triage of ${ONLY.join(", ")}` : ""}`);
console.log(`  files:           ${files.length}`);
console.log(`  records:         ${records.length}`);
console.log(`  distinct agents: ${agents.size} (${[...agents].join(", ")})`);
console.log(`  items covered:   ${itemsCovered.size} of ${targeted ? ONLY.length : bank.items.length}${targeted ? " targeted" : ""}`);

// For a targeted pass the other 92 items are not "uncovered" — they were never
// in scope, and printing them as a gap would make a correct run look broken.
const uncovered = targeted ? [] : bank.items.map((i) => i.id).filter((id) => !itemsCovered.has(id));
if (uncovered.length > 0) {
  console.log(`  NOT YET COVERED: ${uncovered.length} — ${uncovered.slice(0, 12).join(", ")}${uncovered.length > 12 ? " …" : ""}`);
}

const perItem = new Map();
for (const r of records) perItem.set(r.item_id, (perItem.get(r.item_id) ?? 0) + 1);
const singly = [...perItem.entries()].filter(([, n]) => n < 2).map(([id]) => id);
if (singly.length > 0) console.log(`  seen by <2 agents: ${singly.length} — ${singly.slice(0, 12).join(", ")}`);

const agr = computeTriageAgreement(records, PASS_ID);
const agrPct = agr.agreementRate === null ? "n/a" : `${(agr.agreementRate * 100).toFixed(0)}%`;
console.log(`  agreement:       ${agr.agreed}/${agr.itemsSeenByMultipleAgents} items (${agrPct})`);

const queue = deriveTriageQueue(records, { passId: PASS_ID });
const severe = queue.filter((r) => r.agentsFlagging >= 2 && r.severe);
console.log(`\n  TOP OF QUEUE — flagged by 2+ agents on criterion 1 or 5 (${severe.length}):`);
for (const r of severe.slice(0, 15)) console.log(`    ${r.item_id.padEnd(10)} criteria ${r.suspected.join(",")}`);

if (DRY) {
  console.log("\n--dry-run: nothing written.");
  process.exit(0);
}
writeFileSync(STORE, JSON.stringify(next, null, 2) + "\n");
console.log(`\nWrote ${records.length} records to ${STORE}`);
