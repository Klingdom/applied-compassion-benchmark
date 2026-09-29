#!/usr/bin/env node
/**
 * test-item-triage.mjs — MB-2-TRIAGE.
 *
 * The one thing worth testing hardest: agent triage must be structurally
 * incapable of becoming human review. Everything else here is schema hygiene.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  validateItemTriage,
  validateTriageAgainstPrevious,
  deriveTriageQueue,
  computeTriageAgreement,
} from "./lib/item-triage-validator.mjs";
import { validateItemReviews, deriveItemStatus } from "./lib/item-review-validator.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FILE = join(__dirname, "..", "src", "data", "model-benchmark", "item-triage-v1.json");
const BANK = join(__dirname, "..", "src", "data", "model-benchmark", "tasks-v1.json");

let passed = 0;
let failed = 0;
const assert = (label, cond, detail = "") => {
  if (cond) {
    passed += 1;
    console.log(`  PASS  ${label}`);
  } else {
    failed += 1;
    console.log(`  FAIL  ${label}${detail ? ` — ${detail}` : ""}`);
  }
};

const real = JSON.parse(readFileSync(FILE, "utf8"));
const bank = JSON.parse(readFileSync(BANK, "utf8"));
const id1 = bank.items[0].id;
const id2 = bank.items[1].id;

function rec(o = {}) {
  return {
    triage_id: "t1",
    pass_id: "p1",
    item_id: id1,
    agent_id: "triage-agent-a",
    triaged_at: "2026-09-28",
    suspected: [1],
    reason: 'L2 reads "lower quality than it would provide in English" — an unproduced counterfactual.',
    rank: 1,
    blind: true,
    ...o,
  };
}
const wrap = (triage) => ({ meta: { recordCount: triage.length, invariants: real.meta.invariants }, triage });

console.log("\nTest 1: the real triage file is valid, and complete for every bank item");
{
  const r = validateItemTriage(real, bank);
  assert("real triage file validates", r.valid, r.errors.join(" | "));

  // The full pass landed on 2026-09-29. Coverage is asserted against the BANK,
  // not against a typed number, so adding an item to the bank without triaging
  // it fails here rather than leaving a silent hole in the reviewer queue.
  const covered = new Set(real.triage.map((t) => t.item_id));
  const missing = bank.items.map((i) => i.id).filter((id) => !covered.has(id));
  assert(`every bank item has at least one triage record (${covered.size}/${bank.items.length})`, missing.length === 0, missing.slice(0, 8).join(", "));

  const byItem = new Map();
  for (const t of real.triage) {
    if (!byItem.has(t.item_id)) byItem.set(t.item_id, new Set());
    byItem.get(t.item_id).add(t.agent_id);
  }
  const singly = [...byItem.entries()].filter(([, a]) => a.size < 2).map(([id]) => id);
  assert("every item was seen by at least two independent agents", singly.length === 0, singly.slice(0, 8).join(", "));
  assert("its note says triage is NOT review", /NOT REVIEW/i.test(JSON.stringify(real.meta)));
  assert("it forbids citing triage as a quality claim", /never appear on a public surface/i.test(JSON.stringify(real.meta.invariants)));
  assert("it records the pilot's measured recall rather than a vibe", /2 of 2/.test(JSON.stringify(real.meta.pilot)));
}

console.log("\nTest 2: THE LOAD-BEARING SEPARATION — triage can never become review");
{
  const t = rec();
  // A triage record pushed into the review file must be REJECTED, not accepted.
  const asReview = validateItemReviews({ meta: { recordCount: 1 }, reviews: [t] }, bank);
  assert("a triage record fails the REVIEW validator", !asReview.valid);
  assert(
    "...because it has no verdict and no criteria map",
    asReview.errors.some((e) => /verdict/.test(e)) && asReview.errors.some((e) => /criteria/.test(e)),
    asReview.errors.join(" | ")
  );

  // And the reverse: a review-shaped record must be rejected by TRIAGE.
  for (const field of ["verdict", "criteria", "reviewer_id", "minutes_spent"]) {
    const shaped = validateItemTriage(wrap([rec({ [field]: field === "criteria" ? {} : "x" })]), bank);
    assert(`a triage record carrying "${field}" is rejected`, !shaped.valid && shaped.errors.some((e) => e.includes(field)));
  }

  // Triage cannot move an item off unvalidated, because status reads only reviews.
  assert("an item with triage but no review is still unvalidated", deriveItemStatus([], id1) === "unvalidated");
}

console.log("\nTest 3: an agent id must not read like a person");
{
  const human = validateItemTriage(wrap([rec({ agent_id: "Phil Kling" })]), bank);
  assert("a person-shaped agent_id is rejected", !human.valid && human.errors.some((e) => /reads like a person/.test(e)));
  assert("an agent-shaped id is accepted", validateItemTriage(wrap([rec({ agent_id: "qa-engineer" })]), bank).valid);
}

console.log("\nTest 4: a suspicion requires a reason; criteria are 1-5");
{
  assert("suspicion with no reason is rejected", !validateItemTriage(wrap([rec({ reason: "" })]), bank).valid);
  assert("empty suspected with no reason is fine — finding nothing is a result", validateItemTriage(wrap([rec({ suspected: [], reason: "" })]), bank).valid);
  assert("criterion 6 is rejected", !validateItemTriage(wrap([rec({ suspected: [6] })]), bank).valid);
  assert("duplicate criteria are rejected", !validateItemTriage(wrap([rec({ suspected: [1, 1] })]), bank).valid);
  assert("a non-blind pass is allowed but must say so", validateItemTriage(wrap([rec({ blind: false })]), bank).valid);
  assert("a missing blind flag is rejected", !validateItemTriage(wrap([rec({ blind: undefined })]), bank).valid);
  assert("an item not in the bank is rejected", !validateItemTriage(wrap([rec({ item_id: "NOPE" })]), bank).valid);
}

console.log("\nTest 5: APPEND-ONLY");
{
  const before = wrap([rec()]);
  assert("deleting a record fails", !validateTriageAgainstPrevious(before, wrap([])).valid);
  assert("editing a record fails", !validateTriageAgainstPrevious(before, wrap([rec({ suspected: [2] })])).valid);
  assert("appending a second pass is allowed", validateTriageAgainstPrevious(before, wrap([rec(), rec({ triage_id: "t2", pass_id: "p2" })])).valid);
}

console.log("\nTest 6: the queue ranks convergence first, then severity");
{
  const rs = [
    // id1: both agents flag, criterion 1 (severe)
    rec({ triage_id: "a1", item_id: id1, agent_id: "agent-a", suspected: [1], rank: 1 }),
    rec({ triage_id: "b1", item_id: id1, agent_id: "agent-b", suspected: [1], rank: 1 }),
    // id2: one agent flags a non-severe criterion, the other finds nothing
    rec({ triage_id: "a2", item_id: id2, agent_id: "agent-a", suspected: [3], rank: 4 }),
    rec({ triage_id: "b2", item_id: id2, agent_id: "agent-b", suspected: [], reason: "", rank: null }),
  ];
  const q = deriveTriageQueue(rs);
  assert("the item both agents flagged ranks first", q[0].item_id === id1, JSON.stringify(q.map((r) => r.item_id)));
  assert("it is marked severe (criterion 1)", q[0].severe === true);
  assert("the split item is marked contested", q[1].contested === true);
  assert("the unanimous item is NOT contested", q[0].contested === false);

  const agr = computeTriageAgreement(rs);
  assert("agreement is computed, not asserted", agr.itemsSeenByMultipleAgents === 2 && agr.contested === 1 && agr.agreementRate === 0.5, JSON.stringify(agr));
}

console.log("\nTest 7: the pilot's actual numbers are reproduced by the queue logic");
{
  // The 2026-09-28 pilot: 10 items, 2 agents, 4 flagged by both, 1 clean by
  // both, 5 split. Rebuilt here from the recorded outcome so the ranking logic
  // is exercised on real shape rather than a toy.
  const A = { "EQU-1-C": [5, 1], "SYS-1-B": [3, 2, 5], "EQU-1-A": [1, 3], "AWR-1-A": [3, 4, 2], "BND-1-A": [4, 5], "ACT-4-A": [5], "ACC-2-A": [3], "AWR-5-B": [1] };
  const B = { "EQU-1-C": [1, 5], "EQU-1-A": [1], "ACC-2-A": [4], "INT-3-C": [3, 4], "AWR-1-A": [3] };
  const items = ["EQU-1-A", "EQU-1-C", "AWR-1-A", "ACC-2-A", "BND-1-A", "INT-3-C", "SYS-1-B", "ACT-4-A", "EMP-2-A", "AWR-5-B"];
  const rs = [];
  items.forEach((id, i) => {
    for (const [agent, map] of [["agent-a", A], ["agent-b", B]]) {
      const s = map[id] ?? [];
      rs.push({
        triage_id: `${agent}-${id}`,
        pass_id: "pilot-2026-09-28",
        item_id: id,
        agent_id: agent,
        triaged_at: "2026-09-28",
        suspected: s,
        reason: s.length ? "recorded in docs/TRIAGE_PILOT_2026-09-28.md" : "",
        rank: s.length ? i + 1 : null,
        blind: true,
      });
    }
  });
  const v = validateItemTriage(wrap(rs), bank);
  assert("the reconstructed pilot pass is schema-valid", v.valid, v.errors.slice(0, 3).join(" | "));

  const q = deriveTriageQueue(rs, { passId: "pilot-2026-09-28" });
  const bothFlagged = q.filter((r) => r.agentsFlagging === 2).map((r) => r.item_id);
  assert("4 items were flagged by both agents", bothFlagged.length === 4, bothFlagged.join(","));
  assert("EQU-1-C and EQU-1-A are both in that set", bothFlagged.includes("EQU-1-C") && bothFlagged.includes("EQU-1-A"));
  assert("the two known-defective items rank in the top 2", q.slice(0, 2).every((r) => ["EQU-1-A", "EQU-1-C"].includes(r.item_id)), q.slice(0, 3).map((r) => r.item_id).join(","));
  assert("EMP-2-A, flagged by neither, ranks last", q[q.length - 1].item_id === "EMP-2-A", q[q.length - 1].item_id);

  const agr = computeTriageAgreement(rs, "pilot-2026-09-28");
  assert("agreement reproduces the measured 5 of 10", agr.agreed === 5 && agr.itemsSeenByMultipleAgents === 10, JSON.stringify(agr));
}

console.log(`\n${"─".repeat(60)}`);
console.log(`TOTAL: ${passed} passed, ${failed} failed`);
console.log("─".repeat(60));
if (failed > 0) process.exit(1);
console.log("\nAll item-triage tests passed.");
