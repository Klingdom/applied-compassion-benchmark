/**
 * test-separation-waivers.mjs
 *
 * The waiver mechanism exists to keep the product-separation guard ARMED while
 * known adjudicated debt is outstanding. That is only true if an unwaived
 * failure still blocks. These tests pin that property.
 *
 * If someone later "simplifies" the waiver logic into a blanket allowlist,
 * these tests must fail.
 */

import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { writeFileSync, rmSync } from "node:fs";
import {
  applyWaivers,
  loadWaivers,
  computeExpiryWarnings,
  summarizeNextExpiry,
  addOneDayISO,
  WARNING_TIER_DAYS,
  CRITICAL_TIER_DAYS,
} from "./lib/separation-waivers.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

let pass = 0;
let fail = 0;
function assert(label, cond) {
  if (cond) {
    pass++;
    console.log(`  ok   ${label}`);
  } else {
    fail++;
    console.log(`  FAIL ${label}`);
  }
}
function throws(label, fn) {
  try {
    fn();
    fail++;
    console.log(`  FAIL ${label} (expected a throw, got none)`);
  } catch {
    pass++;
    console.log(`  ok   ${label}`);
  }
}

const W = (over = {}) => ({
  id: "W-test",
  check: "2-duplicate",
  entityKey: "acme",
  owner: "founder",
  created: "2026-01-01",
  expires: "2099-01-01",
  reason: "test fixture",
  ...over,
});

const F = (over = {}) => ({
  check: "2-duplicate",
  message: 'cross-index duplicate for canonical entity "acme": a.json "Acme" (rank 1, composite 50)',
  ...over,
});

console.log("\nseparation-waivers\n");

// ── The property that matters most ──────────────────────────────────────────
{
  const r = applyWaivers([F({ message: 'duplicate for canonical entity "newco": ...' })], [W()], "2026-09-10");
  assert("an UNWAIVED failure still blocks", r.blocking.length === 1 && r.waived.length === 0);
}
{
  const r = applyWaivers([F({ check: "1-fusion" })], [W()], "2026-09-10");
  assert("a waiver does NOT leak across checks", r.blocking.length === 1 && r.waived.length === 0);
}

// ── Waiving works ───────────────────────────────────────────────────────────
{
  const r = applyWaivers([F()], [W()], "2026-09-10");
  assert("a matching live waiver waives", r.waived.length === 1 && r.blocking.length === 0);
  assert("the waived finding retains its waiver for reporting", r.waived[0].waiver.id === "W-test");
}

// ── Expiry is the forcing function ──────────────────────────────────────────
{
  const r = applyWaivers([F()], [W({ expires: "2026-09-09" })], "2026-09-10");
  assert("an EXPIRED waiver blocks again", r.blocking.length === 1);
  assert("the expiry is reported, not silent", r.expired.length === 1);
  assert("an expired waiver does not count as waived", r.waived.length === 0);
}
{
  const r = applyWaivers([F()], [W({ expires: "2026-09-10" })], "2026-09-10");
  assert("a waiver expiring TODAY is still live (boundary)", r.waived.length === 1);
}

// ── Stale waivers keep the list honest ──────────────────────────────────────
{
  const r = applyWaivers([], [W()], "2026-09-10");
  assert("a waiver matching nothing is reported STALE", r.stale.length === 1 && r.blocking.length === 0);
}
{
  const r = applyWaivers([F()], [W()], "2026-09-10");
  assert("a used waiver is not stale", r.stale.length === 0);
}

// ── Malformed waivers must never weaken the guard silently ──────────────────
throws("missing owner throws", () => {
  const w = W();
  delete w.owner;
  applyWaiversViaLoad(w);
});
throws("non-ISO expiry throws", () => applyWaiversViaLoad(W({ expires: "Dec 2026" })));
throws("expires before created throws", () => applyWaiversViaLoad(W({ created: "2026-05-01", expires: "2026-01-01" })));
throws("applyWaivers rejects a non-ISO today", () => applyWaivers([], [W()], "today"));

function applyWaiversViaLoad(waiver) {
  // Exercise loadWaivers' validation on a real file, then clean up.
  const tmp = join(__dirname, `.waiver-test-${process.pid}.json`);
  writeFileSync(tmp, JSON.stringify({ waivers: [waiver] }));
  try {
    loadWaivers(tmp);
  } finally {
    rmSync(tmp, { force: true });
  }
}

// ── The real waiver file must itself be valid ───────────────────────────────
{
  const real = loadWaivers(join(__dirname, "product-separation-waivers.json"));
  assert("the committed waiver file loads and validates", Array.isArray(real) && real.length > 0);
  assert(
    "every committed waiver has a remediation path",
    real.every((w) => typeof w.remediation === "string" && w.remediation.length > 0),
  );
  const today = new Date().toISOString().slice(0, 10);
  assert("no committed waiver is already expired", real.every((w) => w.expires >= today));
}

// ── Advance expiry warnings ─────────────────────────────────────────────────
// FIXED fixture "today" — never the real clock, or these tests would only be
// meaningful for a few months around when they were written.
const TODAY = "2026-01-01";

assert("tier thresholds are 30 / 7 days as specified", WARNING_TIER_DAYS === 30 && CRITICAL_TIER_DAYS === 7);

{
  // 31 days out — one day past the warning window — no warning at all.
  const r = computeExpiryWarnings([W({ id: "far", expires: "2026-02-01" })], TODAY);
  assert("a waiver 31 days out gets no warning", r.length === 0);
}
{
  // exactly 30 days out — the outer edge of the warning window.
  const r = computeExpiryWarnings([W({ id: "thirty", expires: "2026-01-31" })], TODAY);
  assert("a waiver exactly 30 days out gets a warning", r.length === 1 && r[0]?.tier === "warning");
  assert("its daysRemaining is computed as 30", r[0]?.daysRemaining === 30);
}
{
  // 25 days out — mid-window, used as the negative-control fixture: if the
  // tier logic is disabled/regressed, this is the case that must be caught.
  const r = computeExpiryWarnings([W({ id: "twentyfive", expires: "2026-01-26" })], TODAY);
  assert("a waiver 25 days out gets a warning (negative-control fixture)", r.length === 1 && r[0]?.tier === "warning");
}
{
  // exactly 8 days out — still "warning", one day above the critical boundary.
  const r = computeExpiryWarnings([W({ id: "eight", expires: "2026-01-09" })], TODAY);
  assert("a waiver 8 days out is still warning-tier, not critical", r.length === 1 && r[0]?.tier === "warning");
}
{
  // exactly 7 days out — the outer edge of the critical window.
  const r = computeExpiryWarnings([W({ id: "seven", expires: "2026-01-08" })], TODAY);
  assert("a waiver exactly 7 days out gets the stronger critical warning", r.length === 1 && r[0]?.tier === "critical");
  assert("its daysRemaining is computed as 7", r[0]?.daysRemaining === 7);
}
{
  // 6 days out — just inside the critical window on the other side of 7.
  const r = computeExpiryWarnings([W({ id: "six", expires: "2026-01-07" })], TODAY);
  assert("a waiver 6 days out is critical", r.length === 1 && r[0]?.tier === "critical");
}
{
  // exactly 1 day out.
  const r = computeExpiryWarnings([W({ id: "one", expires: "2026-01-02" })], TODAY);
  assert("a waiver 1 day out is critical", r.length === 1 && r[0]?.tier === "critical" && r[0]?.daysRemaining === 1);
}
{
  // Expires TODAY — still live per applyWaivers' own boundary semantics
  // ("a waiver expiring TODAY is still live", tested above) — so it must
  // still surface a (critical) warning, not be silently dropped.
  const r = computeExpiryWarnings([W({ id: "today", expires: TODAY })], TODAY);
  assert("a waiver expiring today is still live and gets a critical warning", r.length === 1 && r[0]?.tier === "critical");
  assert("its daysRemaining is 0", r[0]?.daysRemaining === 0);
}
{
  // Already expired (yesterday) — not an advance warning; that debt already
  // blocks the build via applyWaivers' `expired`/`blocking` path, tested above.
  const r = computeExpiryWarnings([W({ id: "gone", expires: "2025-12-31" })], TODAY);
  assert("an already-expired waiver produces no advance warning (it blocks instead, see above)", r.length === 0);
  const applied = applyWaivers([F()], [W({ id: "gone", expires: "2025-12-31", entityKey: "acme" })], TODAY);
  assert("...and that same expired waiver still blocks via applyWaivers, unchanged", applied.blocking.length === 1);
}
{
  const r = computeExpiryWarnings(
    [W({ id: "soon", expires: "2026-01-08" }), W({ id: "later", expires: "2026-01-31" }), W({ id: "safe", expires: "2026-02-01" })],
    TODAY,
  );
  assert("only the two in-window waivers are reported", r.length === 2);
  assert("results are sorted soonest-expiry first", r[0]?.waiver?.id === "soon" && r[1]?.waiver?.id === "later");
}
throws("computeExpiryWarnings rejects a non-ISO today", () => computeExpiryWarnings([W()], "not-a-date"));

// ── Summarising the next expiry for the RESULT line ─────────────────────────
{
  const waivedEntries = [
    { failure: F(), waiver: W({ id: "a", expires: "2026-01-31" }) },
    { failure: F(), waiver: W({ id: "b", expires: "2026-01-08" }) },
  ];
  const s = summarizeNextExpiry(waivedEntries, TODAY);
  assert("summarizeNextExpiry finds the soonest of several waived entries", s.waiver.id === "b" && s.nextExpiry === "2026-01-08");
  assert("...and reports its days remaining relative to the fixture today", s.daysRemaining === 7);
}
{
  const s = summarizeNextExpiry([], TODAY);
  assert("summarizeNextExpiry returns null when nothing is waived", s === null);
}
{
  // Duplicate waiver ids (same waiver backing multiple waived failures) must
  // only be counted once when finding the soonest expiry.
  const w = W({ id: "dup", expires: "2026-01-08" });
  const s = summarizeNextExpiry([{ failure: F(), waiver: w }, { failure: F(), waiver: w }], TODAY);
  assert("a waiver matching multiple failures is only counted once", s.waiver.id === "dup");
}

// ── addOneDayISO — the "from <date+1>..." consequence line ──────────────────
assert("addOneDayISO advances an ordinary day", addOneDayISO("2026-01-01") === "2026-01-02");
assert("addOneDayISO rolls over a month boundary", addOneDayISO("2026-11-30") === "2026-12-01");
assert("addOneDayISO rolls over a year boundary", addOneDayISO("2026-12-31") === "2027-01-01");

console.log(`\n  ${pass} passed, ${fail} failed\n`);
process.exit(fail === 0 ? 0 : 1);
