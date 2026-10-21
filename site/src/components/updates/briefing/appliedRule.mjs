// BRF-APPLIED-LEDGER: the single source of truth for "was this briefing row applied to the published index?".
// Imported by utils.ts (renderer) AND scripts/test-briefing-move-claims.mjs (test), so they cannot drift.
// Plain ESM with no imports so Node can load it directly; the ledger is passed in by the caller.
//
// Rule (same zero test as the DC-03 lint, scripts/lib/lint-rules.mjs scanUnappliedScoreMovement):
//   pipeline.scoreChangesApplied === 0                  -> nothing applied (no status or ledger entry is trusted)
//   otherwise a slug is applied when ANY of
//     - it is in appliedChanges
//     - it has status "applied" in recentAssessments / topSignals
//     - the ledger (research/APPLIED_CHANGES.md, via applied-ledger.json) has {slug, proposalDate === briefing date}

/** @param {any} updates @param {{entries?: Array<{slug: string, proposalDate: string}>} | null | undefined} ledger @returns {Set<string>} */
export function appliedSlugSet(updates, ledger) {
  const applied = new Set();
  if (!updates) return applied;
  const n = updates?.pipeline?.scoreChangesApplied;
  // Explicit 0 = nothing applied. A non-number or negative counter is malformed: trust nothing.
  if (n === 0) return applied;
  if (n !== undefined && n !== null && (typeof n !== "number" || n < 0)) return applied;
  /** @param {string} k @returns {any[]} */
  const list = (k) => (Array.isArray(updates[k]) ? updates[k] : []);
  for (const c of list("appliedChanges")) if (c?.slug) applied.add(c.slug);
  for (const c of [...list("recentAssessments"), ...list("topSignals")]) {
    if (c?.slug && c.status === "applied") applied.add(c.slug);
  }
  const date = typeof updates.date === "string" ? updates.date : null;
  if (date && Array.isArray(ledger?.entries)) {
    for (const e of ledger.entries) if (e?.slug && e.proposalDate === date) applied.add(e.slug);
  }
  return applied;
}

/** @param {any} updates @param {string | null | undefined} slug @param {any} ledger */
export function isAppliedByRule(updates, slug, ledger) {
  if (!slug || !updates) return false;
  return appliedSlugSet(updates, ledger).has(slug);
}
