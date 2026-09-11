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
import { applyWaivers, loadWaivers } from "./lib/separation-waivers.mjs";

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

console.log(`\n  ${pass} passed, ${fail} failed\n`);
process.exit(fail === 0 ? 0 : 1);
