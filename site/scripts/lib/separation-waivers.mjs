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
