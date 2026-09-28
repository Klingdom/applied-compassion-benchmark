/**
 * item-triage-validator.mjs — MB-2-TRIAGE.
 *
 * Validates site/src/data/model-benchmark/item-triage-v1.json, the append-only
 * record of AI-agent PRE-SCREENING over the task bank.
 *
 * THE ONE THING THIS FILE EXISTS TO PREVENT
 *   Triage looks like review. Both are "someone applied five criteria to an
 *   item and wrote down what they thought". The difference is that one of them
 *   is evidence and the other is a to-do list. If they ever merge, the bank
 *   acquires 93 "reviewed" items that no human read — which is a far stronger
 *   false claim than an honest zero.
 *
 *   So the separation is STRUCTURAL, not a convention:
 *
 *   - A triage record has NO `verdict` and NO `criteria` boolean map. The
 *     review validator requires both, so a triage record pasted into the review
 *     file is REJECTED rather than silently accepted. Asserted by test.
 *   - The field is `suspected`, not `failed`. An agent suspects; only a human
 *     reviewer or a mechanical gate with a positive control finds.
 *   - `agent_id` is required and must not look like a person, because
 *     attributing a triage record to a human is exactly how it becomes a review.
 *   - `deriveItemStatus` in the review validator never reads this file, so no
 *     amount of triage can move an item off `unvalidated`.
 *
 * WHY IT IS WORTH HAVING AT ALL
 *   93 items, two reviewers each, 10-15 minutes per item: 30-45 hours. Order
 *   matters enormously, and a blind pilot on 2026-09-28 showed agent triage
 *   recovers known defects it was not told about (2 of 2, two agents
 *   independently) while agreeing on only 5 of 10 items overall. That profile —
 *   convergent at the top, divergent in the middle — is what a sampling frame
 *   should look like: it tells you where to start, and its disagreements tell
 *   you which anchors are ambiguous.
 */

export const TRIAGE_CRITERIA = Object.freeze([1, 2, 3, 4, 5]);

/** Fields the REVIEW schema requires. A triage record must never have them. */
const REVIEW_ONLY_FIELDS = Object.freeze(["verdict", "criteria", "reviewer_id", "minutes_spent"]);

const REQUIRED_STRINGS = ["triage_id", "pass_id", "item_id", "agent_id", "triaged_at"];

export function triageFingerprint(r) {
  return JSON.stringify(r, Object.keys(r).sort());
}

/**
 * @param {object} file parsed triage file
 * @param {object} [bank] parsed task bank, for foreign-key checking
 */
export function validateItemTriage(file, bank = null) {
  const errors = [];
  const warnings = [];
  let checks = 0;
  const check = () => (checks += 1);

  if (!file || typeof file !== "object") return { valid: false, errors: ["file is not an object"], warnings, checks };
  if (!Array.isArray(file.triage)) return { valid: false, errors: ["triage must be an array"], warnings, checks };

  const records = file.triage;
  check();
  if (file.meta && file.meta.recordCount !== records.length) {
    errors.push(`meta.recordCount is ${file.meta?.recordCount} but triage holds ${records.length}`);
  }

  check();
  const inv = JSON.stringify(file.meta?.invariants ?? []);
  if (!/NOT A REVIEW/i.test(inv)) {
    errors.push("meta.invariants must state that a triage record is not a review — the separation is the point of this file");
  }

  const bankIds = bank && Array.isArray(bank.items) ? new Set(bank.items.map((i) => i.id)) : null;
  const seen = new Set();

  records.forEach((r, idx) => {
    const at = `triage[${idx}]${r?.triage_id ? ` (${r.triage_id})` : ""}`;
    if (!r || typeof r !== "object") {
      errors.push(`${at}: not an object`);
      return;
    }

    check();
    for (const f of REQUIRED_STRINGS) {
      if (typeof r[f] !== "string" || !r[f]) errors.push(`${at}: ${f} must be a non-empty string`);
    }
    if (seen.has(r.triage_id)) errors.push(`${at}: duplicate triage_id`);
    seen.add(r.triage_id);

    // --- the load-bearing check: triage must not be shaped like review ---
    check();
    for (const f of REVIEW_ONLY_FIELDS) {
      if (f in r) {
        errors.push(
          `${at}: has "${f}", which belongs to the REVIEW schema. A triage record must not be shaped like a ` +
            "review, because shape is what gets copied by mistake. Agent triage never validates an item."
        );
      }
    }

    check();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(r.triaged_at))) errors.push(`${at}: triaged_at must be an ISO date`);
    if (typeof r.blind !== "boolean") errors.push(`${at}: blind must be a boolean — a non-blind pass cannot measure recall`);

    check();
    if (bankIds && !bankIds.has(r.item_id)) errors.push(`${at}: item_id "${r.item_id}" is not in the task bank`);

    check();
    if (!Array.isArray(r.suspected)) {
      errors.push(`${at}: suspected must be an array of criterion numbers (may be empty)`);
    } else {
      for (const c of r.suspected) {
        if (!TRIAGE_CRITERIA.includes(c)) errors.push(`${at}: "${c}" is not a criterion number 1-5`);
      }
      if (new Set(r.suspected).size !== r.suspected.length) errors.push(`${at}: suspected has duplicates`);
      if (r.suspected.length > 0 && (typeof r.reason !== "string" || !r.reason.trim())) {
        errors.push(`${at}: a suspicion requires a reason quoting the anchor text at issue`);
      }
    }

    check();
    if (r.rank !== null && r.rank !== undefined && (!Number.isInteger(r.rank) || r.rank < 1)) {
      errors.push(`${at}: rank must be a positive integer or null`);
    }

    // An agent id that reads like a person is how triage becomes review.
    check();
    if (typeof r.agent_id === "string" && /^[A-Z][a-z]+ [A-Z][a-z]+$/.test(r.agent_id)) {
      errors.push(`${at}: agent_id "${r.agent_id}" reads like a person's name. Triage is never attributable to a human.`);
    }
  });

  return { valid: errors.length === 0, errors, warnings, checks, recordCount: records.length };
}

/** Append-only guarantee, checked against the committed file. */
export function validateTriageAgainstPrevious(previous, next) {
  const errors = [];
  const before = Array.isArray(previous?.triage) ? previous.triage : [];
  const after = new Map((Array.isArray(next?.triage) ? next.triage : []).map((r) => [r?.triage_id, r]));
  for (const b of before) {
    const a = after.get(b.triage_id);
    if (!a) errors.push(`triage record "${b.triage_id}" was REMOVED. Triage is append-only; add a new pass instead.`);
    else if (triageFingerprint(b) !== triageFingerprint(a)) {
      errors.push(`triage record "${b.triage_id}" was EDITED. Add a new pass rather than rewriting an old one.`);
    }
  }
  return { valid: errors.length === 0, errors };
}

/**
 * The ranked list human reviewers actually work from.
 *
 * Ordering, in priority order:
 *   1. how many agents suspected the item at all (convergence is the signal)
 *   2. whether criterion 1 or 5 is implicated (unratable, or factually wrong —
 *      the two kinds that make a score meaningless rather than merely noisy)
 *   3. mean rank across agents
 *
 * `contested` is surfaced separately and is NOT a tie-break: an item two agents
 * split on is evidence its anchors are ambiguous, which is its own finding.
 */
export function deriveTriageQueue(records, { passId = null } = {}) {
  const inPass = records.filter((r) => (passId ? r.pass_id === passId : true));
  const byItem = new Map();
  for (const r of inPass) {
    if (!r?.item_id) continue;
    if (!byItem.has(r.item_id)) byItem.set(r.item_id, []);
    byItem.get(r.item_id).push(r);
  }

  const rows = [];
  for (const [itemId, rs] of byItem) {
    const flagging = rs.filter((r) => (r.suspected ?? []).length > 0);
    const agents = new Set(rs.map((r) => r.agent_id));
    const suspected = new Set(flagging.flatMap((r) => r.suspected ?? []));
    const ranks = flagging.map((r) => r.rank).filter((n) => Number.isInteger(n));
    rows.push({
      item_id: itemId,
      agentsSeen: agents.size,
      agentsFlagging: new Set(flagging.map((r) => r.agent_id)).size,
      suspected: [...suspected].sort(),
      severe: suspected.has(1) || suspected.has(5),
      contested: flagging.length > 0 && flagging.length < rs.length,
      meanRank: ranks.length ? ranks.reduce((a, b) => a + b, 0) / ranks.length : null,
    });
  }

  rows.sort((a, b) => {
    if (b.agentsFlagging !== a.agentsFlagging) return b.agentsFlagging - a.agentsFlagging;
    if (a.severe !== b.severe) return a.severe ? -1 : 1;
    const ar = a.meanRank ?? Infinity;
    const br = b.meanRank ?? Infinity;
    return ar - br;
  });
  return rows;
}

/** Agreement between agents within a pass — a property of the ANCHORS. */
export function computeTriageAgreement(records, passId = null) {
  const rows = deriveTriageQueue(records, { passId });
  const multi = rows.filter((r) => r.agentsSeen > 1);
  const agreed = multi.filter((r) => !r.contested).length;
  return {
    itemsSeenByMultipleAgents: multi.length,
    agreed,
    contested: multi.length - agreed,
    agreementRate: multi.length > 0 ? agreed / multi.length : null,
  };
}
