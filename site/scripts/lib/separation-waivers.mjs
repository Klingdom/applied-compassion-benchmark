/**
 * separation-waivers.mjs — named, owned, dated, EXPIRING exceptions for the
 * product-separation validator.
 *
 * Design intent: a disabled guard is not a governable state. Six named exceptions
 * with owners and expiry dates is. This module downgrades KNOWN, ADJUDICATED
 * failures to visible waived findings, while any unmatched failure still blocks.
 *
 * Three properties this must preserve, in priority order:
 *   1. A waived failure is NEVER silent. It prints on every run.
 *   2. An EXPIRED waiver blocks again. Expiry is the forcing function.
 *   3. A waiver matching nothing is reported STALE, so the list cannot rot into
 *      fiction describing violations that no longer exist.
 */

import { readFileSync } from "node:fs";

const REQUIRED_FIELDS = ["id", "check", "entityKey", "owner", "created", "expires", "reason"];
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Load and structurally validate the waiver document.
 * Throws on a malformed waiver — a waiver file that cannot be trusted is worse
 * than no waiver file, because it silently weakens the guard.
 */
export function loadWaivers(path) {
  let doc;
  try {
    doc = JSON.parse(readFileSync(path, "utf8"));
  } catch (err) {
    throw new Error(`separation-waivers: cannot read or parse ${path}: ${err.message}`);
  }

  const waivers = Array.isArray(doc?.waivers) ? doc.waivers : null;
  if (!waivers) {
    throw new Error(`separation-waivers: ${path} has no "waivers" array`);
  }

  const seen = new Set();
  for (const w of waivers) {
    for (const f of REQUIRED_FIELDS) {
      if (typeof w?.[f] !== "string" || w[f].trim() === "") {
        throw new Error(
          `separation-waivers: waiver ${JSON.stringify(w?.id ?? "(no id)")} is missing required field "${f}". ` +
            `Every waiver must be named, owned, dated and justified.`,
        );
      }
    }
    for (const f of ["created", "expires"]) {
      if (!ISO_DATE.test(w[f])) {
        throw new Error(`separation-waivers: waiver "${w.id}" has non-ISO ${f}: ${w[f]}`);
      }
    }
    if (w.expires <= w.created) {
      throw new Error(`separation-waivers: waiver "${w.id}" expires (${w.expires}) on or before created (${w.created}).`);
    }
    if (seen.has(w.id)) {
      throw new Error(`separation-waivers: duplicate waiver id "${w.id}".`);
    }
    seen.add(w.id);
  }

  return waivers;
}

/** A waiver matches a failure on check identity plus the canonical entity key. */
function matches(failure, waiver) {
  if (failure.check !== waiver.check) return false;
  if (failure.key && failure.key === waiver.id) return true;
  // Canonical entity names are emitted quoted and are stable across rank/score drift,
  // unlike the surrounding message text.
  return String(failure.message ?? "").includes(`"${waiver.entityKey}"`);
}

/**
 * Partition failures against the waiver list.
 *
 * @returns {{blocking: Array, waived: Array, expired: Array, stale: Array}}
 *   blocking — must fail the run (unmatched, or matched only by an expired waiver)
 *   waived   — matched by a live waiver; reported, not blocking
 *   expired  — waivers past their expiry that matched something (their failures block)
 *   stale    — live waivers that matched nothing (reported so the list stays honest)
 */
// ── Advance expiry warning tiers ────────────────────────────────────────────
//
// A waived failure only stays non-blocking while its waiver is live. Before this,
// there was no signal at all before a waiver lapsed — the first sign anyone got
// was a broken build the day after expiry (RISK-015). These tiers give notice
// while there is still time to remediate or consciously extend.

export const WARNING_TIER_DAYS = 30;
export const CRITICAL_TIER_DAYS = 7;

/** Whole days from `fromISO` to `toISO` (both YYYY-MM-DD, UTC, date-only). */
function daysBetween(fromISO, toISO) {
  const from = Date.parse(`${fromISO}T00:00:00Z`);
  const to = Date.parse(`${toISO}T00:00:00Z`);
  return Math.round((to - from) / 86_400_000);
}

/** The calendar day after `dateISO` (YYYY-MM-DD, UTC, date-only). */
export function addOneDayISO(dateISO) {
  const d = new Date(`${dateISO}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

/**
 * Advance-expiry warnings for every LIVE waiver (expires >= todayISO — the same
 * "still live" boundary applyWaivers uses, so a waiver expiring today is still
 * live and falls in the "critical" tier, not treated as already gone).
 *
 * Tiers (nearer tier wins; they do not stack):
 *   - daysRemaining <= CRITICAL_TIER_DAYS (7)  → "critical"
 *   - daysRemaining <= WARNING_TIER_DAYS (30)  → "warning"
 *   - otherwise                                → no warning (not returned)
 *
 * Already-expired waivers are not included here — that debt is real and blocks
 * again, handled by applyWaivers' `expired`/`blocking` outputs, not an advance
 * notice.
 *
 * @returns {Array<{waiver: object, daysRemaining: number, tier: "warning"|"critical"}>}
 *   sorted soonest-expiry first.
 */
export function computeExpiryWarnings(waivers, todayISO) {
  if (!ISO_DATE.test(String(todayISO ?? ""))) {
    throw new Error(`separation-waivers: computeExpiryWarnings requires an ISO date, got ${todayISO}`);
  }

  const out = [];
  for (const w of waivers) {
    if (w.expires < todayISO) continue; // expired — not an advance warning, see applyWaivers
    const daysRemaining = daysBetween(todayISO, w.expires);
    let tier = null;
    if (daysRemaining <= CRITICAL_TIER_DAYS) tier = "critical";
    else if (daysRemaining <= WARNING_TIER_DAYS) tier = "warning";
    if (tier) out.push({ waiver: w, daysRemaining, tier });
  }
  out.sort((a, b) => a.daysRemaining - b.daysRemaining);
  return out;
}

/**
 * Summarise the nearest expiry among a set of waivers currently suppressing a
 * live failure (the `waived` output of applyWaivers), for the final RESULT
 * line. Returns null if nothing is waived.
 */
export function summarizeNextExpiry(waivedEntries, todayISO) {
  const byId = new Map();
  for (const { waiver } of waivedEntries) {
    if (!byId.has(waiver.id)) byId.set(waiver.id, waiver);
  }
  const list = [...byId.values()];
  if (list.length === 0) return null;

  let soonest = list[0];
  for (const w of list) {
    if (w.expires < soonest.expires) soonest = w;
  }
  return { waiver: soonest, nextExpiry: soonest.expires, daysRemaining: daysBetween(todayISO, soonest.expires) };
}

export function applyWaivers(failures, waivers, todayISO) {
  if (!ISO_DATE.test(String(todayISO ?? ""))) {
    throw new Error(`separation-waivers: applyWaivers requires an ISO date, got ${todayISO}`);
  }

  const live = waivers.filter((w) => w.expires >= todayISO);
  const dead = waivers.filter((w) => w.expires < todayISO);

  const blocking = [];
  const waived = [];
  const expired = [];
  const usedLive = new Set();

  for (const f of failures) {
    const liveHit = live.find((w) => matches(f, w));
    if (liveHit) {
      usedLive.add(liveHit.id);
      waived.push({ failure: f, waiver: liveHit });
      continue;
    }
    const deadHit = dead.find((w) => matches(f, w));
    if (deadHit) {
      // Expired: the debt is still real and now blocks again.
      expired.push({ failure: f, waiver: deadHit });
      blocking.push(f);
      continue;
    }
    blocking.push(f);
  }

  const stale = live.filter((w) => !usedLive.has(w.id));

  return { blocking, waived, expired, stale };
}
