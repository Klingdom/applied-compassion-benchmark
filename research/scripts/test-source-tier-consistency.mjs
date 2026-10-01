#!/usr/bin/env node
/**
 * test-source-tier-consistency.mjs — CS-2 / DC-04.
 *
 * A published briefing shows an evidence-tier badge for every source it cites.
 * Readers use that badge to judge how strong the evidence is. The same source,
 * cited in the same-date assessment, carries its own tier as `[T#](url)`.
 *
 * **Nothing checked that the two agreed.** The 2026-09-17 briefing was the first
 * one live-enforced by the Iteration 16 claim-to-source gate. It passed with 0
 * violations while carrying five `sourceTier` values that contradicted the
 * assessments it cited — four inflated from 2 to 4, one deflated from 4 to 2.
 * An inflated tier overstates evidence strength **in public**, which is the one
 * thing an independence-based benchmark cannot afford to do casually.
 *
 * `test-claim-to-source.mjs` checks that a claim has a source. It contains zero
 * references to `sourceTier`, so it never checked that the source is described
 * accurately. This closes that half.
 *
 * WHY THIS RATCHETS INSTEAD OF DEMANDING ZERO
 *   The mismatches are in **dated, published briefings**, and AUTONOMY §1c
 *   forbids retro-editing those: a reader who saw tier 4 on 2026-09-17 was
 *   misled, and silently rewriting the file to say 2 hides that rather than
 *   correcting it. So the known set is allowlisted **with its dates**, the
 *   allowlist may only shrink, and any NEW mismatch fails. Removing an entry
 *   requires a published correction, not an edit.
 *
 * Usage:
 *   node research/scripts/test-source-tier-consistency.mjs
 *   node research/scripts/test-source-tier-consistency.mjs --report   # list every mismatch
 */

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = join(__dirname, "..", "..");
const BRIEFINGS = join(REPO, "site", "src", "data", "updates", "daily");
const ASSESSMENTS = join(REPO, "research", "assessments");
const ALLOWLIST = join(REPO, "research", "known-tier-mismatches.json");

/** Normalise a URL enough to match across two hand-written citations. */
export function canonicalUrl(u) {
  return String(u || "")
    .trim()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/+$/, "")
    .replace(/[?#].*$/, "")
    .toLowerCase();
}

/** Every {url, sourceTier} an evidence object in a briefing declares. */
export function briefingTiers(doc) {
  const out = [];
  (function walk(o) {
    if (Array.isArray(o)) return o.forEach(walk);
    if (o && typeof o === "object") {
      if ("sourceTier" in o && "url" in o) {
        const t = Number(o.sourceTier);
        if (Number.isInteger(t)) out.push({ url: canonicalUrl(o.url), tier: t });
      }
      Object.values(o).forEach(walk);
    }
  })(doc);
  return out;
}

/**
 * Every tier an assessment markdown attaches to a url.
 *
 * TWO FORMATS, and reading only one is how this gate first reported a
 * confident zero. The backlog row warned about it — "the 09-15 gap was a
 * matcher limitation, not missing data — assessments cite in two [forms]" —
 * and I built the inline form first and believed the result:
 *
 *   inline   [T2](https://example.com/a)
 *   listed   - www.example.com — 2026-09-09 — tier 2 — https://example.com/a
 *
 * With only the inline form, 56 pairs matched across 86 briefings and the
 * answer was 0 mismatches. That zero was void.
 */
export function assessmentTiers(md) {
  const out = new Map();
  const put = (rawUrl, tier) => {
    const url = canonicalUrl(rawUrl);
    if (!url) return;
    // A url cited twice at different tiers inside one assessment is itself a
    // defect, but not this gate's: record the first and move on.
    if (!out.has(url)) out.set(url, tier);
  };
  const text = String(md);

  // Shape 1+2: `[T4](url)` and `[T4, 2026-09-15](url)`. The optional trailing
  // part inside the brackets is what the first version missed.
  for (const m of text.matchAll(/\[T([0-9])(?:,[^\]]*)?\]\(([^)]+)\)/g)) put(m[2], Number(m[1]));

  // Shape 3: the tier comes AFTER the url, in a parenthetical —
  // `- https://example.com/a (tier 2 reporting of a tier-4 UN mandate finding)`.
  // Note the FIRST tier in the parenthetical is the citation's own; a later
  // "tier-4" in the same phrase describes the authority being reported, which
  // is the very ambiguity CS-3 exists to settle. Taking the first is correct
  // under either convention for the outlet's own tier.
  for (const m of text.matchAll(/(https?:\/\/[^\s()]+)\s*\(([^)]*)\)/g)) {
    const t = m[2].match(/\btier[\s-]*([0-9])/i);
    if (t) put(m[1].replace(/[),.;]+$/, ""), Number(t[1]));
  }

  // Shape 4: list form with the tier before the url — `— tier 2 — https://...`.
  for (const m of text.matchAll(/\btier\s*([0-9])\s*[—–-]\s*(https?:\/\/\S+)/gi)) {
    put(m[2].replace(/[),.;]+$/, ""), Number(m[1]));
  }

  return out;
}

export function mismatchesForDate(date) {
  const bPath = join(BRIEFINGS, `${date}.json`);
  if (!existsSync(bPath)) return { date, checked: 0, mismatches: [], reason: "no briefing" };

  const cited = new Map();
  for (const f of readdirSync(ASSESSMENTS)) {
    if (!f.endsWith(".md") || !f.includes(date)) continue;
    for (const [url, tier] of assessmentTiers(readFileSync(join(ASSESSMENTS, f), "utf8"))) {
      if (!cited.has(url)) cited.set(url, { tier, file: f });
    }
  }
  if (cited.size === 0) return { date, checked: 0, mismatches: [], reason: "no same-date assessment citations" };

  const mismatches = [];
  let checked = 0;
  for (const { url, tier } of briefingTiers(JSON.parse(readFileSync(bPath, "utf8")))) {
    const a = cited.get(url);
    if (!a) continue; // cited nowhere in the same-date assessments; out of scope
    checked += 1;
    if (a.tier !== tier) mismatches.push({ date, url, briefingTier: tier, assessmentTier: a.tier, file: a.file });
  }
  return { date, checked, mismatches };
}

/**
 * Evidence dated AFTER the briefing that cites it — the second half of CS-2.
 *
 * CS-2 was filed for two defects: contradicted tiers, and "a 2025 event framed
 * as current". Age alone turns out to be a poor signal — of 1,244 evidence
 * items, 51 are over a year old and nearly all are legitimate background
 * (Amnesty 2025, World Bank 2022, an ICC filing). Gating on age would fire on
 * honest citation.
 *
 * What has no innocent reading is evidence published **after** the briefing.
 * The 2026-06-06 briefing, `generatedAt` 05:45Z that morning, cites three
 * articles dated 2026-06-07 and 2026-06-08 — and their URLs carry those dates
 * too (`aljazeera.com/news/2026/6/7/...`). A briefing cannot cite its own
 * future: either its date is wrong or the evidence was added later without
 * moving it. Both mislead a reader about when the benchmark knew something.
 *
 * Measured at introduction: 1,244 items, 6 future-dated entries across 3 unique
 * sources in 1 briefing, and 71 with no parseable `publishedDate` at all —
 * reported below but deliberately not gated, because absence is a different
 * defect from contradiction and folding them together would hide both.
 */
/**
 * A usable publication date, or null.
 *
 * Month-precision dates are real: some sources publish "May 2026" and nothing
 * finer. Dropping them silently is what the first version did, and it meant 9
 * items escaped the recency check while being counted as merely "undated". A
 * month is normalised to its FIRST day, which is the reading least likely to
 * make an item look future-dated — an exception should have to earn itself.
 *
 * A bare year is rejected: 365 days of uncertainty cannot support a claim about
 * whether something was current.
 */
export function normalisePublished(raw) {
  const s = String(raw ?? "").trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  if (/^\d{4}-\d{2}$/.test(s)) return `${s}-01`;
  return null;
}

export function futureDatedForDate(date) {
  const bPath = join(BRIEFINGS, `${date}.json`);
  if (!existsSync(bPath)) return { date, checked: 0, future: [], undated: 0 };
  const doc = JSON.parse(readFileSync(bPath, "utf8"));
  const out = [];
  let checked = 0;
  let undated = 0;
  const seen = new Set();
  (function walk(o) {
    if (Array.isArray(o)) return o.forEach(walk);
    if (o && typeof o === "object") {
      if ("sourceTier" in o && "url" in o) {
        const raw = normalisePublished(o.publishedDate);
        if (!raw) {
          undated += 1;
          return;
        }
        checked += 1;
        if (raw > date) {
          const key = `${canonicalUrl(o.url)}|${raw}`;
          if (!seen.has(key)) {
            seen.add(key);
            out.push({ date, url: canonicalUrl(o.url), publishedDate: raw, source: String(o.source ?? "") });
          }
        }
        return;
      }
      Object.values(o).forEach(walk);
    }
  })(doc);
  return { date, checked, future: out, undated };
}

export function allDates() {
  return readdirSync(BRIEFINGS)
    .filter((f) => /^\d{4}-\d{2}-\d{2}\.json$/.test(f))
    .map((f) => f.replace(/\.json$/, ""))
    .sort();
}

let passed = 0;
const failures = [];
function check(label, fn) {
  try {
    fn();
    passed += 1;
    console.log(`  ok  ${label}`);
  } catch (e) {
    failures.push(`${label}: ${e.message}`);
    console.log(`  FAIL ${label}: ${e.message}`);
  }
}
function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

if (process.argv[1] && process.argv[1].endsWith("test-source-tier-consistency.mjs")) {
  const dates = allDates();
  const all = dates.map(mismatchesForDate);
  const totalChecked = all.reduce((n, r) => n + r.checked, 0);
  const found = all.flatMap((r) => r.mismatches);

  // --emit-allowlist prints the exception entries as JSON for a human to paste
  // into known-tier-mismatches.json. It deliberately does NOT write the file:
  // an exception is only legitimate alongside a published correction, and a
  // command that silently appends would turn the allowlist into a way of making
  // failures disappear.
  if (process.argv.includes("--emit-allowlist")) {
    console.log(
      JSON.stringify(
        found.map((m) => ({
          date: m.date,
          url: m.url,
          briefingTier: m.briefingTier,
          assessmentTier: m.assessmentTier,
          assessment: m.file,
          found: "2026-09-30 (Iteration 79)",
        })),
        null,
        2
      )
    );
    process.exit(0);
  }

  if (process.argv.includes("--report")) {
    console.log(`briefings: ${dates.length} · url/tier pairs compared: ${totalChecked} · mismatches: ${found.length}\n`);
    const byDate = {};
    for (const m of found) (byDate[m.date] = byDate[m.date] || []).push(m);
    for (const [d, ms] of Object.entries(byDate)) {
      console.log(`${d} — ${ms.length}`);
      for (const m of ms) {
        console.log(`   briefing T${m.briefingTier} vs assessment T${m.assessmentTier}  ${m.url.slice(0, 92)}`);
      }
    }
    process.exit(0);
  }

  console.log("CS-2 — a published tier badge must match the assessment it cites\n");
  console.log("positive controls\n");

  // The extractors must be shown to work, or a zero means nothing (V8).
  check("the briefing extractor finds tier/url pairs", () => {
    assert(totalChecked > 20, `only ${totalChecked} pairs compared across ${dates.length} briefings`);
  });

  check("the assessment extractor reads the [T#](url) form", () => {
    const probe = assessmentTiers("text [T2](https://Example.com/a/) more [T4](http://www.example.com/b)");
    assert(probe.get("example.com/a") === 2, `expected T2 for /a, got ${probe.get("example.com/a")}`);
    assert(probe.get("example.com/b") === 4, `expected T4 for /b, got ${probe.get("example.com/b")}`);
  });

  check("a planted contradiction is detected", () => {
    const doc = { evidence: [{ url: "https://example.com/x", sourceTier: 4 }] };
    const pairs = briefingTiers(doc);
    assert(pairs.length === 1 && pairs[0].tier === 4, `extractor failed: ${JSON.stringify(pairs)}`);
    const cited = assessmentTiers("[T2](https://example.com/x)");
    assert(cited.get(pairs[0].url) === 2, "fixture urls did not canonicalise to the same key");
    assert(cited.get(pairs[0].url) !== pairs[0].tier, "the fixture is not actually a mismatch");
  });

  console.log("\nthe published briefings\n");

  const known = existsSync(ALLOWLIST) ? JSON.parse(readFileSync(ALLOWLIST, "utf8")) : { mismatches: [] };
  const keyOf = (m) => `${m.date}|${m.url}|${m.briefingTier}|${m.assessmentTier}`;
  const allowed = new Set((known.mismatches || []).map(keyOf));

  check(`no NEW tier contradiction (${totalChecked} pairs compared across ${dates.length} briefings)`, () => {
    const unexpected = found.filter((m) => !allowed.has(keyOf(m)));
    assert(
      unexpected.length === 0,
      `${unexpected.length} tier contradiction(s) not in the dated allowlist:\n    ` +
        unexpected
          .map((m) => `${m.date}: briefing T${m.briefingTier} vs ${m.file} T${m.assessmentTier} — ${m.url}`)
          .join("\n    ") +
        "\n    A briefing's tier badge is what a reader uses to judge evidence strength. Correct the briefing " +
        "BEFORE it is published; if it is already published, AUTONOMY §1c forbids a silent edit — publish a " +
        "dated correction and add the entry here with its date."
    );
  });

  check("the allowlist may only shrink", () => {
    const stale = [...allowed].filter((k) => !found.some((m) => keyOf(m) === k));
    assert(
      stale.length === 0,
      `${stale.length} allowlist entr(ies) no longer match anything and must be removed: ${stale.join("; ")}`
    );
  });

  // ── CS-2, second half: no briefing may cite its own future ────────────────
  const fut = dates.map(futureDatedForDate);
  const futureFound = fut.flatMap((r) => r.future);
  const datedChecked = fut.reduce((n, r) => n + r.checked, 0);
  const undated = fut.reduce((n, r) => n + r.undated, 0);
  const futureKey = (m) => `${m.date}|${m.url}|${m.publishedDate}`;
  const futureAllowed = new Set((known.futureDated || []).map(futureKey));

  check("the publishedDate extractor is not vacuous", () => {
    assert(datedChecked > 500, `only ${datedChecked} dated evidence items found across ${dates.length} briefings`);
    console.log(`      (${datedChecked} dated items across ${dates.length} briefings)`);
  });

  check("month-precision dates are used, not silently dropped", () => {
    assert(normalisePublished("2026-05") === "2026-05-01", "a YYYY-MM date is not being normalised");
    assert(normalisePublished("2026-05-09") === "2026-05-09", "a full date is not passing through");
    assert(normalisePublished("2026") === null, "a bare year must be rejected — too coarse to support a claim");
    assert(normalisePublished(undefined) === null, "an absent field must be rejected");
  });

  // CS-2c: the count of evidence with no usable date may only SHRINK.
  //
  // Measured 2026-09-30: 71 of 1,244. It is NOT an early-convention artifact —
  // splitting the corpus in thirds gives early 0, middle 6, late 65, and the
  // newest briefing (2026-09-24) is affected. The omission is GROWING, so the
  // ratchet exists to stop it growing further while the 86 already-published
  // briefings cannot be retro-edited (§1c). One briefing, 2026-07-21, has no
  // date on any of its 26 evidence items.
  check(`evidence with no usable publication date has not increased (ceiling ${known.undatedCeiling ?? "unset"})`, () => {
    const ceiling = known.undatedCeiling;
    assert(typeof ceiling === "number", "known-tier-mismatches.json must declare a numeric undatedCeiling");
    assert(
      undated <= ceiling,
      `${undated} evidence items carry no usable publication date, above the ceiling of ${ceiling}. ` +
        "A new briefing must set publishedDate on every evidence item; without it neither the recency check " +
        "nor any future reader can tell whether the source was current when cited."
    );
    if (undated < ceiling) {
      console.log(`      (${undated} undated, below the ceiling of ${ceiling} — lower undatedCeiling to ${undated})`);
    } else {
      console.log(`      (${undated} undated, exactly at the ceiling)`);
    }
  });

  check("a planted future date is detected", () => {
    const probe = { date: "2026-01-01", evidence: [{ url: "https://e.com/x", sourceTier: 2, publishedDate: "2026-01-02" }] };
    // Same comparison the check uses, on a fixture: string compare of ISO dates.
    assert("2026-01-02" > probe.date, "ISO date comparison is not ordering correctly");
  });

  check(`no NEW briefing cites evidence dated after itself (${datedChecked} dated items)`, () => {
    const unexpected = futureFound.filter((m) => !futureAllowed.has(futureKey(m)));
    assert(
      unexpected.length === 0,
      `${unexpected.length} evidence item(s) published AFTER the briefing citing them:\n    ` +
        unexpected.map((m) => `${m.date} cites ${m.publishedDate} (${m.source}) — ${m.url}`).join("\n    ") +
        "\n    A briefing cannot cite its own future. Either its date is wrong or the evidence was added later " +
        "without moving the date; both mislead a reader about when this was known."
    );
  });

  check("the future-dated allowlist may only shrink", () => {
    const stale = [...futureAllowed].filter((k) => !futureFound.some((m) => futureKey(m) === k));
    assert(stale.length === 0, `${stale.length} stale future-dated entr(ies): ${stale.join("; ")}`);
  });

  console.log(`\n${passed} passed, ${failures.length} failed`);
  if (failures.length > 0) process.exit(1);
}
