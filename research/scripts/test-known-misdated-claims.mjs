#!/usr/bin/env node
/**
 * test-known-misdated-claims.mjs — unit tests for the known-misdated-claims
 * ledger (research/known-misdated-claims.json) and the checker in
 * validate-scan.mjs (checkKnownMisdatedClaims / validateLedgerSchema).
 *
 * Written for backlog item SC-1 / defect class DC-13: the nightly scanner
 * had no memory of claims it already disproved (Meta "8,000 layoffs" and
 * China's "Ethnic Unity Law" each recurred and were re-verified from
 * scratch across multiple cycles). This suite proves:
 *   1. The ledger file on disk validates against its own schema.
 *   2. Every ACTIVE ledger entry is actually caught by the checker (V8
 *      positive control — a matcher that never fires would be worthless).
 *   3. A plausible GENUINE item about the same entity, that does not carry
 *      the claim-specific tokens, is NOT caught (proves the matchers are
 *      conservative, not just keyed on entity name).
 *   4. A scan that correctly dropped a known claim (i.e. it appears only in
 *      stats.dropped_candidates, not in top_entities) does not fail.
 *   5. A malformed or empty ledger fails loudly rather than vacuously
 *      passing.
 *   6. The real committed scans (2026-09-15, 2026-09-17, 2026-09-18) pass
 *      the checker, because each of them correctly dropped its known claim
 *      before it ever reached top_entities.
 *
 * NO NETWORK ACCESS. Reads only the checked-in ledger and the three named
 * committed scan fixtures under research/scans/ — no writes anywhere.
 *
 * Run: node research/scripts/test-known-misdated-claims.mjs
 */

import { readFileSync } from "node:fs";
import path from "node:path";
import { checkKnownMisdatedClaims, validateLedgerSchema } from "./validate-scan.mjs";

const REPO = path.resolve(import.meta.dirname, "..", "..");
const LEDGER_PATH = path.join(REPO, "research", "known-misdated-claims.json");

let passed = 0;
let failed = 0;
function assert(cond, message) {
  if (cond) {
    passed++;
  } else {
    failed++;
    console.error(`  FAIL: ${message}`);
  }
}

function candidate({ slug, name, index = "countries", news_summary }) {
  return { slug, name, index, priority_score: 50, tier: "T2", news_summary, evidence_date: "2026-09-18", recommendation: "assess" };
}

function scanWith(topEntities) {
  return { scan_date: "2026-09-20", top_entities: topEntities, stats: { dropped_candidates: [] } };
}

// ── Load the real, checked-in ledger ────────────────────────────────────────
const ledgerRaw = readFileSync(LEDGER_PATH, "utf8");
const ledger = JSON.parse(ledgerRaw);

// ── Test 1: the checked-in ledger validates against its own schema ─────────
console.log("Test 1: research/known-misdated-claims.json validates against its own schema");
{
  const errors = validateLedgerSchema(ledger);
  assert(errors.length === 0, `expected zero schema errors, got: ${errors.join("; ")}`);
  assert(Array.isArray(ledger.claims) && ledger.claims.length >= 10, "ledger should carry at least the 10 SC-1 claims");
  assert(typeof ledger.meta?.brief_addendum === "string" && ledger.meta.brief_addendum.length > 0, "ledger.meta.brief_addendum must exist for the coordinator to paste into the scanner brief");
}

// Fixture text drawn from each entry's own claimed_framing/description, built
// independently of the matcher arrays themselves (so this test cannot just be
// echoing the matcher back at itself).
const KNOWN_ITEM_TEXT = {
  "meta-8000-layoffs": candidate({ slug: "meta-platforms", name: "Meta Platforms", index: "fortune-500", news_summary: "Meta Platforms confirmed it cut 8,000 jobs this week as part of a restructuring, the company said in a filing." }),
  "china-ethnic-unity-law": candidate({ slug: "china", name: "China", news_summary: "China released a draft Ethnic Unity Law this week, according to state media." }),
  "paypal-dei-settlement": candidate({ slug: "paypal", name: "PayPal", index: "fortune-500", news_summary: "PayPal reached a DEI settlement with the Department of Justice worth roughly $30 million, sources said." }),
  "qatar-doha-strike": candidate({ slug: "qatar", name: "Qatar", news_summary: "An airstrike hit a group of ceasefire negotiators meeting in Doha, officials confirmed." }),
  "freeport-mcmoran-grasberg": candidate({ slug: "freeport-mcmoran", name: "Freeport-McMoRan", index: "fortune-500", news_summary: "A mud rush at the Grasberg mine caused several fatalities, the company disclosed in a securities filing." }),
  "cambridge-protest-injunction": candidate({ slug: "university-of-cambridge", name: "University of Cambridge", index: "universities", news_summary: "The University of Cambridge secured a High Court injunction against protest encampments on campus grounds." }),
  "venezuela-maduro-captured": candidate({ slug: "venezuela", name: "Venezuela", news_summary: "Maduro was captured by US forces in a joint operation, officials said." }),
  "zambia-opposition-killing": candidate({ slug: "zambia", name: "Zambia", news_summary: "Opposition figure Kafwaya was killed during a security services raid, rights groups reported." }),
  "xai-baltimore-lawsuit": candidate({ slug: "xai-grok", name: "xAI", index: "ai-labs", news_summary: "Baltimore filed a lawsuit against xAI over Grok-generated deepfake images, the city said." }),
  "anthropic-pentagon-suit": candidate({ slug: "anthropic", name: "Anthropic", index: "ai-labs", news_summary: "Anthropic's Pentagon supply-chain-risk lawsuit against the Department of Defense was ruled unlawful by a federal judge." }),
};

// Plausible GENUINE items about the same entity that do NOT carry the
// claim-specific tokens — proves the matcher is not keyed on entity name
// alone (requirement: guard against over-matching).
const GENUINE_ITEM_TEXT = {
  "meta-8000-layoffs": candidate({ slug: "meta-platforms", name: "Meta Platforms", index: "fortune-500", news_summary: "Meta Platforms announced a $2 billion data center investment and a new AI research lab this week." }),
  "china-ethnic-unity-law": candidate({ slug: "china", name: "China", news_summary: "China announced new tariffs on semiconductor imports effective next quarter." }),
  "paypal-dei-settlement": candidate({ slug: "paypal", name: "PayPal", index: "fortune-500", news_summary: "PayPal disclosed a data breach affecting customer accounts and pledged free credit monitoring." }),
  "qatar-doha-strike": candidate({ slug: "qatar", name: "Qatar", news_summary: "Qatar Airways cabin crew held a one-day labor strike over new scheduling rules." }),
  "freeport-mcmoran-grasberg": candidate({ slug: "freeport-mcmoran", name: "Freeport-McMoRan", index: "fortune-500", news_summary: "Freeport-McMoRan reported quarterly earnings above analyst expectations on higher copper prices." }),
  "cambridge-protest-injunction": candidate({ slug: "university-of-cambridge", name: "University of Cambridge", index: "universities", news_summary: "The University of Cambridge announced a new scholarship fund for low-income students." }),
  "venezuela-maduro-captured": candidate({ slug: "venezuela", name: "Venezuela", news_summary: "Venezuela's central bank devalued the bolivar amid rising inflation, officials said." }),
  "zambia-opposition-killing": candidate({ slug: "zambia", name: "Zambia", news_summary: "Zambia's electoral commission announced a new voter registration drive ahead of next year's election." }),
  "xai-baltimore-lawsuit": candidate({ slug: "xai-grok", name: "xAI", index: "ai-labs", news_summary: "xAI opened a new office in Austin and announced a hiring push for the Grok engineering team." }),
  "anthropic-pentagon-suit": candidate({ slug: "anthropic", name: "Anthropic", index: "ai-labs", news_summary: "Anthropic announced a new enterprise partnership with a hospital network to pilot Claude for clinical documentation." }),
};

// ── Test 2: every ACTIVE entry is caught by a matching top_entities item (V8 positive control) ──
console.log("\nTest 2: each active ledger entry is caught when its known claim resurfaces in top_entities");
{
  const activeEntries = ledger.claims.filter((e) => e.status === "active");
  assert(activeEntries.length === ledger.claims.length, "expected all 10 SC-1 entries to be status:active at this point");
  for (const entry of activeEntries) {
    const item = KNOWN_ITEM_TEXT[entry.id];
    assert(item !== undefined, `test fixture missing a KNOWN_ITEM_TEXT case for entry "${entry.id}"`);
    if (!item) continue;
    const result = checkKnownMisdatedClaims(scanWith([item]), ledger);
    assert(result.failures.length >= 1, `entry "${entry.id}" should be caught but produced zero failures`);
    assert(
      result.failures.some((f) => f.includes(`"${entry.id}"`) && f.includes(entry.true_date ?? "unknown")),
      `failure for "${entry.id}" should cite the entry id and its true date; got: ${JSON.stringify(result.failures)}`,
    );
    assert(
      result.failures.some((f) => entry.occurrences.every((d) => f.includes(d))),
      `failure for "${entry.id}" should list the cycles it already surfaced in (${entry.occurrences.join(", ")})`,
    );
  }
}

// ── Test 3: a plausible genuine same-entity item is NOT caught ─────────────
console.log("\nTest 3: a plausible genuine item about the same entity, without the claim-specific tokens, passes clean");
{
  for (const entry of ledger.claims) {
    const item = GENUINE_ITEM_TEXT[entry.id];
    assert(item !== undefined, `test fixture missing a GENUINE_ITEM_TEXT case for entry "${entry.id}"`);
    if (!item) continue;
    const result = checkKnownMisdatedClaims(scanWith([item]), ledger);
    assert(result.failures.length === 0, `entry "${entry.id}"'s matcher over-matched a genuine, unrelated same-entity item: ${JSON.stringify(result.failures)}`);
  }
}

// ── Test 4: a correctly-dropped candidate does not fail the scan ───────────
console.log("\nTest 4: a candidate present only in stats.dropped_candidates (not top_entities) does not fail");
{
  const scan = {
    scan_date: "2026-09-20",
    top_entities: [], // the scanner correctly did NOT promote the known claim
    stats: {
      dropped_candidates: [{ slug: "meta-platforms (possible)", reason: "'Meta cuts 8,000 jobs' claim recurred again; confirmed as the 20 May 2026 announcement, not September. Dropped again." }],
    },
  };
  const result = checkKnownMisdatedClaims(scan, ledger);
  assert(result.failures.length === 0, `a correctly-dropped candidate must not fail the scan; got: ${JSON.stringify(result.failures)}`);
}

// ── Test 5: malformed / empty ledger fails loudly (no vacuous pass) ────────
console.log("\nTest 5: malformed or empty ledger fails loudly rather than silently passing");
{
  const scanWithKnownClaim = scanWith([KNOWN_ITEM_TEXT["meta-8000-layoffs"]]);

  const emptyClaims = { claims: [] };
  const r1 = checkKnownMisdatedClaims(scanWithKnownClaim, emptyClaims);
  assert(r1.failures.length > 0, "empty claims[] must fail loudly, not silently pass");

  const notAnObject = null;
  const r2 = checkKnownMisdatedClaims(scanWithKnownClaim, notAnObject);
  assert(r2.failures.length > 0, "a null ledger must fail loudly, not silently pass");

  const missingClaimsKey = { meta: {} };
  const r3 = checkKnownMisdatedClaims(scanWithKnownClaim, missingClaimsKey);
  assert(r3.failures.length > 0, "a ledger with no claims[] key must fail loudly, not silently pass");

  const malformedEntry = { claims: [{ id: "broken-entry" /* missing every other required field */ }] };
  const r4 = checkKnownMisdatedClaims(scanWithKnownClaim, malformedEntry);
  assert(r4.failures.length > 0, "a ledger with a structurally invalid entry must fail loudly, not silently pass");
  const schemaErrors = validateLedgerSchema(malformedEntry);
  assert(schemaErrors.length > 0, "validateLedgerSchema should itself enumerate the broken entry's missing fields");

  // Sanity: none of the above malformed-ledger failures should be confused
  // with an actual known-claim match (they must fail on ledger validity,
  // not accidentally succeed at matching).
  assert(r1.checkedEntries === 0 && r2.checkedEntries === 0, "malformed-ledger paths must report zero checked entries, not fabricate a check result");
}

// ── Test 6: retiring an entry stops it from matching ────────────────────────
console.log("\nTest 6: a retired entry (status: 'retired') no longer triggers a match");
{
  const retiredLedger = {
    ...ledger,
    claims: ledger.claims.map((e) => (e.id === "meta-8000-layoffs" ? { ...e, status: "retired", retired_reason: "test: superseded" } : e)),
  };
  const result = checkKnownMisdatedClaims(scanWith([KNOWN_ITEM_TEXT["meta-8000-layoffs"]]), retiredLedger);
  assert(result.failures.length === 0, "a retired entry must not fail the scan even if its old text resurfaces");
  assert(result.checkedEntries === ledger.claims.length - 1, "retiring one entry should reduce the active-entry count checked by exactly one");
}

// ── Test 7: the real committed scans pass the checker (each correctly dropped its claim) ──
console.log("\nTest 7: the real committed 09-15 / 09-17 / 09-18 scans pass the known-misdated-claims checker");
{
  for (const date of ["2026-09-15", "2026-09-17", "2026-09-18"]) {
    const scanPath = path.join(REPO, "research", "scans", `${date}.json`);
    const scan = JSON.parse(readFileSync(scanPath, "utf8"));
    const result = checkKnownMisdatedClaims(scan, ledger);
    assert(
      result.failures.length === 0,
      `real scan ${date}.json should pass the known-misdated-claims checker (it correctly dropped its claim(s) before top_entities); got: ${JSON.stringify(result.failures)}`,
    );
  }
}

console.log(`\n${passed} passed, ${failed} failed\n`);
process.exit(failed === 0 ? 0 : 1);
