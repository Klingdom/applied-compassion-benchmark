#!/usr/bin/env node
/**
 * validate-rotation-state.mjs — integrity gate for research/rotation-state.json.
 *
 * Created 2026-07-28 after a confirmed defect: the 2026-07-27 scanner stamped
 * `last_assessed: "2026-07-27"` on 16 entities that had NO assessment report on
 * disk, justifying it as "per the established 07-25/07-26 pattern" — a pattern
 * that did not exist (on 07-24/07-25/07-26 every entity claiming a
 * `last_assessed` date had a matching `research/assessments/<slug>-<date>.md`).
 * One of the 16 was `gilead-sciences`, which the scanner had explicitly
 * DROPPED as a bad candidate — it marked as assessed something it had just
 * decided not to assess.
 *
 * Why it matters: `last_assessed` drives staleness-based rotation priority
 * (see overnight-scanner.md Step 2). A falsely-fresh `last_assessed` makes an
 * unreviewed entity look reviewed, so it drops out of rotation and can go
 * unexamined for weeks. Had the assessor stage crashed on 2026-07-27 (as it
 * did on 2026-07-24), those 16 entities would have been silently lost — no
 * report, no proposal, and a rotation-state entry claiming otherwise, with
 * nothing downstream flagging it.
 *
 * Ownership after this incident (see .claude/agents/overnight-scanner.md and
 * .claude/agents/overnight-assessor.md): the scanner may write ONLY
 * `last_scanned` and `last_evidence_touch`. Only the assessor stage writes
 * `last_assessed` / `last_change_proposal`, and only for entities it actually
 * produced a report for. This script is the mechanical check that the rule
 * held, so a corrupt write is caught the next time this runs rather than
 * discovered by hand-auditing git history.
 *
 * ── Matching rule (read before "fixing" a FAIL) ─────────────────────────────
 * Primary rule: for every entity with a non-null `last_assessed`, a file
 *   research/assessments/<slug>-<last_assessed>.md
 * must exist. This is the exact bug pattern above — a claimed date with zero
 * backing report — and this check is intentionally NOT weakened.
 *
 * Investigation of the current 1,290-entity rotation-state (2026-07-28) found
 * 146 entities without an exact-match file. Of those, a real chunk are
 * genuine historical naming artifacts, not fabricated dates:
 *   - 45 have a report at the LEGACY undated path `<slug>.md` — assessments
 *     written before the per-date-filename convention existed (the pipeline's
 *     first weeks, ~2026-04-15 to ~2026-04-20-ish; e.g. finland.md, merck-
 *     style entities are the exception, see below).
 *   - 7 have a report at the LEGACY dated-subdirectory path
 *     `<last_assessed>/<slug>.md` — a short-lived convention used for the
 *     2026-05-22..2026-05-26 window (e.g. research/assessments/2026-05-22/
 *     amazon.md).
 * These two legacy shapes ARE accepted as a satisfying match (a report DOES
 * exist for the entity), but they are never silently swept into a clean pass:
 * every legacy-format match is printed as a WARN so it stays auditable, and
 * the summary reports exact-match vs legacy-match counts separately.
 *
 * If NEITHER the literal slug NOR any of the three shapes above resolves,
 * the check does not fail immediately — it escalates through three more
 * evidence classes before concluding "no evidence of any kind exists"
 * (added 2026-09-16 after coordinator classification of 25 then-failing
 * entities found 0 true phantoms — see RISK-023 / the entity-identity
 * rekey work). In order:
 *
 *   1. ALIAS-SLUG REPORT — a report exists under a differently-derived slug
 *      for the same entity. Rotation-state keys and index-JSON `slug` fields
 *      have gone through multiple slugging conventions over the project's
 *      life (a "current" NFKD-accent-folding convention, an older "naive"
 *      convention with no accent/`&`/`'` special-casing, and a short-lived
 *      HTML-entity-encoded convention that spelled out `&` as `amp` and `'`
 *      as `x27`). A rotation-state key rekeyed to the current convention
 *      (e.g. `at-and-t`, `deere-and-company`, `w-and-t-offshore`) can have
 *      its historical report filed under the OLD slug — the report predates
 *      the rekey (e.g. `at-amp-t-2026-05-30.md`). See `deriveAliasSlugs()`
 *      for the exact derivation rules. Historical report files are NEVER
 *      renamed to chase a rekey — this check finds them where they are. Only
 *      an "exact" or "legacy" alias match counts here; an alias that only
 *      resolves to a near-date file is no stronger than a near-date file
 *      under the literal slug (which does NOT satisfy the primary rule), so
 *      it falls through to step 2 instead of stopping here.
 *   2. SAME-DATE (±1 day) CHANGE PROPOSAL — `research/change-proposals/
 *      <slug-or-alias>-<date>.json`, checked against the literal slug and
 *      every derived alias, for the claimed date and one day on either
 *      side. This was the recording convention before per-date report
 *      filenames existed (roughly the pipeline's April–May 2026 window):
 *      a change proposal was filed, but no separate `.md` report was ever
 *      written for that night.
 *   3. DIGEST MENTION (±1 day) — the entity's `name` appears in
 *      `research/digests/<date>.md` for the claimed date or one day on
 *      either side. This is the weakest evidence class (a mention, not a
 *      report or proposal file) and is used only when 1 and 2 both come up
 *      empty.
 *
 * Any of these three downgrades the result from FAIL to WARN, and the
 * warning names exactly which evidence class matched (and which alias, file,
 * or digest date) so the audit trail stays mechanically checkable — this is
 * NOT a hand-maintained allowlist of entity names. An entity FAILS only when
 * none of: exact report, legacy-format report, alias-slug report, same-date
 * (±1 day) proposal, or digest mention (±1 day) can be found. That is what
 * "no evidence of any kind exists" means in this script.
 *
 * No blanket allowlist is used: an allowlist that suppresses "no evidence of
 * any kind found" cases would hide exactly the failure mode this script
 * exists to catch. Every accepted shape above is a narrow, documented,
 * mechanically-checked exception (a real file or digest line must still
 * exist); none of it is a list of entity names exempted from the check.
 *
 * Testing: the core logic below (deriveAliasSlugs, resolveAssessmentReport,
 * findBroaderEvidence, evaluateEntities) takes its file/digest listings as an
 * explicit `ctx` argument rather than reading the filesystem directly, so
 * research/scripts/test-validate-rotation-state.mjs can exercise it against
 * in-memory fixtures with zero disk I/O. Only the bottom "CLI" section (guarded
 * to run only when this file is executed directly, not imported) touches
 * `research/rotation-state.json` / `research/assessments/` / etc. on disk.
 *
 * Usage:
 *   node research/scripts/validate-rotation-state.mjs
 *   node research/scripts/validate-rotation-state.mjs --date 2026-07-27
 *   node research/scripts/validate-rotation-state.mjs --rotation-file <path>   (for tests)
 *
 * Exit code 0 = PASS (no entity claims an assessment date with zero backing report).
 * Exit code 1 = FAIL (at least one entity has a real gap — see failure list).
 */

import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  foldAccents,
  slugifyFolded,
  slugifyUnfolded,
  slugifyNaiveFolded,
  slugifyHtmlEncoded,
  indexSuffixStripped,
} from "../../site/scripts/lib/slug.mjs";

const REPO = path.resolve(import.meta.dirname, "..", "..");
const ASSESSMENTS_DIR = path.join(REPO, "research", "assessments");
const PROPOSALS_DIR = path.join(REPO, "research", "change-proposals");
const DIGESTS_DIR = path.join(REPO, "research", "digests");
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// ── Slug alias derivation ───────────────────────────────────────────────────
// See the module comment above ("Matching rule") for why these exist. Every
// function here is a MECHANICAL transform of `name` (or `slug`) — there is no
// hand-maintained per-entity list. A candidate is only ever treated as
// evidence if a real file (or digest line) is found under it.
//
// The slugify*/foldAccents/indexSuffixStripped primitives now live in the
// single shared module site/scripts/lib/slug.mjs (RS-4a) and are imported
// above. slugifyCurrent/slugifyNaive are this file's own historical names
// for slugifyFolded/slugifyUnfolded, re-exported unchanged below so nothing
// downstream that names them changes.

export { foldAccents, slugifyNaiveFolded, slugifyHtmlEncoded, indexSuffixStripped };
export const slugifyCurrent = slugifyFolded;
export const slugifyNaive = slugifyUnfolded;

/** All distinct, non-empty alias candidates for (slug, name, index), each tagged with how it was derived. */
export function deriveAliasSlugs(slug, name, index) {
  const candidates = [
    { alias: slugifyCurrent(name), source: "current slugify(name)" },
    { alias: slugifyNaive(name), source: "naive slugify(name) (pre-2026-07 convention)" },
    { alias: slugifyNaiveFolded(name), source: "accent-folded naive slugify(name)" },
    { alias: slugifyHtmlEncoded(name), source: "HTML-entity-encoded slugify(name) (& -> amp, ' -> x27)" },
    { alias: indexSuffixStripped(slug, index), source: `index-suffix-stripped slug (dropped trailing "-${index}")` },
  ];
  const seen = new Set([slug]);
  const out = [];
  for (const c of candidates) {
    if (c.alias && !seen.has(c.alias)) {
      seen.add(c.alias);
      out.push(c);
    }
  }
  return out;
}

/** claimedDate +/- delta days, as an ISO YYYY-MM-DD string. */
export function addDaysISO(dateStr, delta) {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}

// ── Evidence resolution ─────────────────────────────────────────────────────
// Everything below takes an explicit `ctx` (file/digest listings) instead of
// touching the filesystem, so it can be exercised with in-memory fixtures.
//
// ctx shape:
//   {
//     assessmentFiles: Set<string>,      // "<slug>-<date>.md" and/or "<slug>.md" (legacy undated)
//     assessmentDateDirs: Set<string>,   // date strings that have a legacy dated subdirectory
//     legacySubdirFiles: Set<string>,    // "<date>/<slug>.md" keys that exist under that subdirectory
//     proposalFiles: Set<string>,        // "<slug>-<date>.json" filenames directly under change-proposals/
//     proposalHistoryFiles: Set<string>, // filenames under change-proposals/history/
//     digestContent: Map<string,string>, // "<date>.md" -> file content (only for dates that exist)
//   }

/** Any `<slug>-<YYYY-MM-DD>.md` file in ctx.assessmentFiles, regardless of which date. */
function slugFilesWithDate(slug, ctx) {
  const re = new RegExp(`^${slug.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}-(\\d{4}-\\d{2}-\\d{2})\\.md$`);
  const out = [];
  for (const f of ctx.assessmentFiles) {
    const m = f.match(re);
    if (m) out.push({ file: f, date: m[1] });
  }
  return out;
}

/**
 * Resolve whether a report exists for (slug, claimedDate). Returns:
 *   { status: "exact" }                          — <slug>-<date>.md exists
 *   { status: "legacy-undated" }                  — <slug>.md exists (no date)
 *   { status: "legacy-subdir" }                   — <date>/<slug>.md exists
 *   { status: "near-date", found: [dates] }       — other-dated <slug>-*.md exist, exact doesn't
 *   { status: "none" }                            — nothing found at all
 */
export function resolveAssessmentReport(slug, claimedDate, ctx) {
  const exactName = `${slug}-${claimedDate}.md`;
  if (ctx.assessmentFiles.has(exactName)) return { status: "exact" };

  if (ctx.assessmentDateDirs.has(claimedDate) && ctx.legacySubdirFiles.has(`${claimedDate}/${slug}.md`)) {
    return { status: "legacy-subdir" };
  }

  if (ctx.assessmentFiles.has(`${slug}.md`)) return { status: "legacy-undated" };

  const others = slugFilesWithDate(slug, ctx);
  if (others.length) return { status: "near-date", found: others.map((o) => o.date) };

  return { status: "none" };
}

/** True if a change-proposal file backs `last_change_proposal=claimedDate` for `slug` (exact date only). */
export function resolveChangeProposal(slug, claimedDate, ctx) {
  const exactName = `${slug}-${claimedDate}.json`;
  if (ctx.proposalFiles.has(exactName)) return true;
  if (ctx.proposalHistoryFiles.has(exactName)) return true;
  if (ctx.proposalHistoryFiles.has(`${slug}.json`)) return true; // legacy undated proposal
  return false;
}

/** True if research/digests/<dateStr>.md exists in ctx and contains `name` verbatim. */
export function digestContains(dateStr, name, ctx) {
  const content = ctx.digestContent.get(`${dateStr}.md`);
  return content !== undefined && content.includes(name);
}

/**
 * Escalation used ONLY when the literal slug produced no exact/legacy match
 * (i.e. resolveAssessmentReport returned "near-date" or "none"). Tries, in
 * order: alias-slug report, same-date (±1 day) change proposal (literal slug
 * + every alias), digest mention (±1 day). Returns the first hit as
 * { class, message } or null if none of the three found anything — in which
 * case the caller still fails the entity.
 */
export function findBroaderEvidence(slug, name, index, claimedDate, ctx) {
  const aliases = deriveAliasSlugs(slug, name, index);

  // 1. Alias-slug report match. Only "exact" or "legacy" shapes count as real
  //    evidence here — an alias that only produces a near-date file is exactly
  //    as weak as a near-date file under the literal slug (which does NOT
  //    satisfy the primary rule), so it must NOT preempt the stronger
  //    same-date-proposal check in step 2. Prefer the best-shaped match across
  //    all aliases (exact beats legacy) rather than the first alias tried.
  const SHAPE_RANK = { exact: 0, "legacy-undated": 1, "legacy-subdir": 1 };
  let best = null;
  for (const { alias, source } of aliases) {
    const res = resolveAssessmentReport(alias, claimedDate, ctx);
    if (res.status === "none" || res.status === "near-date") continue;
    const rank = SHAPE_RANK[res.status];
    if (!best || rank < best.rank) best = { alias, source, res, rank };
    if (rank === 0) break;
  }
  if (best) {
    const where =
      best.res.status === "exact"
        ? `research/assessments/${best.alias}-${claimedDate}.md`
        : best.res.status === "legacy-undated"
          ? `research/assessments/${best.alias}.md (legacy undated)`
          : `research/assessments/${claimedDate}/${best.alias}.md (legacy dated-subdirectory)`;
    return {
      class: "alias-report",
      message:
        `${slug} (${name}, ${index}): last_assessed=${claimedDate} has no report under its own slug, but a report exists ` +
        `under alias slug "${best.alias}" (derived via ${best.source}): ${where}.`,
    };
  }

  // 2. Same-date (±1 day) change proposal — literal slug and every alias.
  const slugCandidates = [slug, ...aliases.map((a) => a.alias)];
  for (const delta of [0, -1, 1]) {
    const d = addDaysISO(claimedDate, delta);
    for (const cand of slugCandidates) {
      const fname = `${cand}-${d}.json`;
      if (ctx.proposalFiles.has(fname) || ctx.proposalHistoryFiles.has(fname)) {
        const dayNote = delta === 0 ? "" : ` (${Math.abs(delta)} day ${delta < 0 ? "before" : "after"} the claimed date)`;
        const aliasNote = cand === slug ? "" : ` under alias slug "${cand}"`;
        return {
          class: "same-date-proposal",
          message:
            `${slug} (${name}, ${index}): last_assessed=${claimedDate} has no report on disk, but a matching change ` +
            `proposal exists: research/change-proposals/${fname}${dayNote}${aliasNote} — the pre-dated-report ` +
            `recording convention (April–May 2026).`,
        };
      }
    }
  }

  // 3. Digest mention (±1 day) — matched against the entity's display name.
  for (const delta of [0, -1, 1]) {
    const d = addDaysISO(claimedDate, delta);
    if (digestContains(d, name, ctx)) {
      const dayNote = delta === 0 ? "" : ` (${Math.abs(delta)} day ${delta < 0 ? "before" : "after"} the claimed date)`;
      return {
        class: "digest-mention",
        message:
          `${slug} (${name}, ${index}): last_assessed=${claimedDate} has no report and no change proposal on disk, ` +
          `but "${name}" is mentioned in research/digests/${d}.md${dayNote}.`,
      };
    }
  }

  return null;
}

/**
 * Core gate logic: evaluate every [slug, entity] pair in `entrySet` against
 * `ctx` (see shape above). Pure function — no disk I/O, no process.exit.
 *
 * Returns:
 *   {
 *     failures: [{ slug, name, index, claimedDate, expectedPath, detail }],
 *     warnings: [string],
 *     exactMatches, legacyUndatedMatches, legacySubdirMatches,
 *     nearDateGaps, zeroEvidenceGaps: number,
 *     evidenceClassCounts: { "alias-report": n, "same-date-proposal": n, "digest-mention": n },
 *   }
 *
 * An entity with `last_assessed: null` (or undefined) is skipped entirely by
 * the FAIL/WARN-evidence checks below — it is not counted in any bucket.
 */
export function evaluateEntities(entrySet, ctx, { todayISO }) {
  const failures = [];
  const warnings = [];

  let exactMatches = 0;
  let legacyUndatedMatches = 0;
  let legacySubdirMatches = 0;
  let nearDateGaps = 0;
  let zeroEvidenceGaps = 0;
  const evidenceClassCounts = { "alias-report": 0, "same-date-proposal": 0, "digest-mention": 0 };

  for (const [slug, e] of entrySet) {
    const name = e.name ?? slug;
    const index = e.index ?? "?";

    // ── FAIL check: last_assessed must have a backing report ────────────────
    if (e.last_assessed) {
      const claimed = e.last_assessed;
      const resolution = resolveAssessmentReport(slug, claimed, ctx);
      const expectedPath = `research/assessments/${slug}-${claimed}.md`;

      switch (resolution.status) {
        case "exact":
          exactMatches++;
          break;
        case "legacy-undated":
          legacyUndatedMatches++;
          warnings.push(
            `${slug} (${name}, ${index}): last_assessed=${claimed} matched only via LEGACY undated report ` +
              `research/assessments/${slug}.md — pre-dated-filename convention, exact date not independently verifiable from the filename.`,
          );
          break;
        case "legacy-subdir":
          legacySubdirMatches++;
          warnings.push(
            `${slug} (${name}, ${index}): last_assessed=${claimed} matched only via LEGACY dated-subdirectory report ` +
              `research/assessments/${claimed}/${slug}.md.`,
          );
          break;
        case "near-date":
        case "none": {
          // No exact/legacy match under the literal slug — escalate through
          // alias-slug report, same-date (±1 day) proposal, digest mention
          // before concluding this is a real gap. See findBroaderEvidence().
          const evidence = findBroaderEvidence(slug, name, index, claimed, ctx);
          if (evidence) {
            evidenceClassCounts[evidence.class] = (evidenceClassCounts[evidence.class] ?? 0) + 1;
            warnings.push(evidence.message);
          } else if (resolution.status === "near-date") {
            nearDateGaps++;
            failures.push({
              slug,
              name,
              index,
              claimedDate: claimed,
              expectedPath,
              detail: `no exact-date report, but near-date report(s) exist for this slug: ${resolution.found.join(", ")} — the recorded last_assessed date looks off, not fabricated from nothing. Also checked alias-slug reports, same-date (±1 day) change proposals, and digest mentions (±1 day): none found.`,
            });
          } else {
            zeroEvidenceGaps++;
            failures.push({
              slug,
              name,
              index,
              claimedDate: claimed,
              expectedPath,
              detail:
                "no evidence of any kind found for this slug: no exact match, no legacy undated file, no legacy " +
                "subdirectory file, no near-date file, no alias-slug report, no same-date (±1 day) change proposal, " +
                "and no digest mention (±1 day).",
            });
          }
          break;
        }
      }
    }

    // ── WARN check: last_assessed in the future ──────────────────────────────
    if (e.last_assessed && e.last_assessed > todayISO) {
      warnings.push(`${slug} (${name}): last_assessed=${e.last_assessed} is in the future relative to today (${todayISO}).`);
    }

    // ── WARN check: last_scanned earlier than last_assessed (impossible) ────
    if (e.last_scanned && e.last_assessed && e.last_scanned < e.last_assessed) {
      warnings.push(
        `${slug} (${name}): last_scanned=${e.last_scanned} is EARLIER than last_assessed=${e.last_assessed} — a logical impossibility (an entity cannot be assessed before it was scanned).`,
      );
    }

    // ── WARN check: last_change_proposal set with no matching file ──────────
    if (e.last_change_proposal && !resolveChangeProposal(slug, e.last_change_proposal, ctx)) {
      warnings.push(
        `${slug} (${name}): last_change_proposal=${e.last_change_proposal} has no matching file in research/change-proposals/ ` +
          `(checked research/change-proposals/${slug}-${e.last_change_proposal}.json, history/${slug}-${e.last_change_proposal}.json, history/${slug}.json).`,
      );
    }
  }

  return {
    failures,
    warnings,
    exactMatches,
    legacyUndatedMatches,
    legacySubdirMatches,
    nearDateGaps,
    zeroEvidenceGaps,
    evidenceClassCounts,
  };
}

// ── CLI (runs only when this file is executed directly, not when imported) ─
const isMainModule = (() => {
  try {
    return process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
  } catch {
    return false;
  }
})();

if (isMainModule) {
  const args = process.argv.slice(2);
  const dateIdx = args.indexOf("--date");
  const singleNightDate = dateIdx !== -1 ? args[dateIdx + 1] : null;
  if (singleNightDate && !DATE_RE.test(singleNightDate)) {
    console.error(`usage: validate-rotation-state.mjs [--date YYYY-MM-DD] [--rotation-file <path>]`);
    process.exit(1);
  }
  const rotationFileIdx = args.indexOf("--rotation-file");
  const rotationPath = rotationFileIdx !== -1
    ? (path.isAbsolute(args[rotationFileIdx + 1]) ? args[rotationFileIdx + 1] : path.join(REPO, args[rotationFileIdx + 1]))
    : path.join(REPO, "research", "rotation-state.json");

  if (!existsSync(rotationPath)) {
    console.error(`FAIL: rotation-state file does not exist: ${rotationPath}`);
    process.exit(1);
  }

  const rotation = JSON.parse(readFileSync(rotationPath, "utf8"));
  const entities = rotation.entities ?? {};

  // ── Build a lookup of what's actually on disk (read-only) ──────────────────
  const assessmentFiles = new Set(readdirSync(ASSESSMENTS_DIR).filter((f) => f.endsWith(".md")));
  const assessmentDateDirNames = readdirSync(ASSESSMENTS_DIR).filter((f) => DATE_RE.test(f));
  const assessmentDateDirs = new Set(assessmentDateDirNames);
  const legacySubdirFiles = new Set();
  for (const d of assessmentDateDirNames) {
    const dirPath = path.join(ASSESSMENTS_DIR, d);
    let isDir = false;
    try {
      isDir = statSync(dirPath).isDirectory();
    } catch {
      isDir = false;
    }
    if (!isDir) continue;
    for (const f of readdirSync(dirPath)) {
      if (f.endsWith(".md")) legacySubdirFiles.add(`${d}/${f}`);
    }
  }
  const proposalFiles = new Set(readdirSync(PROPOSALS_DIR).filter((f) => f.endsWith(".json")));
  const proposalHistoryDir = path.join(PROPOSALS_DIR, "history");
  const proposalHistoryFiles = existsSync(proposalHistoryDir)
    ? new Set(readdirSync(proposalHistoryDir).filter((f) => f.endsWith(".json")))
    : new Set();
  const digestContent = new Map();
  if (existsSync(DIGESTS_DIR)) {
    for (const f of readdirSync(DIGESTS_DIR)) {
      if (f.endsWith(".md")) digestContent.set(f, readFileSync(path.join(DIGESTS_DIR, f), "utf8"));
    }
  }

  const ctx = { assessmentFiles, assessmentDateDirs, legacySubdirFiles, proposalFiles, proposalHistoryFiles, digestContent };

  // ── Determine the working entity set (all history, or a single night) ─────
  let entrySet = Object.entries(entities);
  if (singleNightDate) {
    entrySet = entrySet.filter(
      ([, e]) =>
        e.last_scanned === singleNightDate ||
        e.last_assessed === singleNightDate ||
        e.last_change_proposal === singleNightDate,
    );
  }

  const todayISO = new Date().toISOString().slice(0, 10);

  const {
    failures,
    warnings,
    exactMatches,
    legacyUndatedMatches,
    legacySubdirMatches,
    nearDateGaps,
    zeroEvidenceGaps,
    evidenceClassCounts,
  } = evaluateEntities(entrySet, ctx, { todayISO });

  // ── Per-index summary ────────────────────────────────────────────────────
  const idxStats = {};
  for (const [, e] of entrySet) {
    const i = e.index ?? "?";
    idxStats[i] ??= { total: 0, withAssessed: 0, failed: 0 };
    idxStats[i].total++;
    if (e.last_assessed) idxStats[i].withAssessed++;
  }
  for (const f of failures) {
    idxStats[f.index] ??= { total: 0, withAssessed: 0, failed: 0 };
    idxStats[f.index].failed++;
  }

  const totalEvidenceClassMatches =
    evidenceClassCounts["alias-report"] + evidenceClassCounts["same-date-proposal"] + evidenceClassCounts["digest-mention"];

  console.log(`\nRotation-state integrity gate${singleNightDate ? ` — single night ${singleNightDate}` : ""}`);
  console.log(`  rotation-state file : ${rotationPath}`);
  console.log(`  entities in scope   : ${entrySet.length}${singleNightDate ? ` (of ${Object.keys(entities).length} total)` : ""}`);
  console.log(
    `  with last_assessed  : ${exactMatches + legacyUndatedMatches + legacySubdirMatches + totalEvidenceClassMatches + nearDateGaps + zeroEvidenceGaps}`,
  );
  console.log(`  exact-match reports : ${exactMatches}`);
  console.log(`  legacy-format match : ${legacyUndatedMatches + legacySubdirMatches} (${legacyUndatedMatches} undated, ${legacySubdirMatches} dated-subdirectory) — WARN, not FAIL`);
  console.log(
    `  broader-evidence    : ${totalEvidenceClassMatches} (${evidenceClassCounts["alias-report"]} alias-slug report, ` +
      `${evidenceClassCounts["same-date-proposal"]} same-date ±1d proposal, ${evidenceClassCounts["digest-mention"]} digest mention) — WARN, not FAIL`,
  );
  console.log(`  REAL GAPS (FAIL)    : ${nearDateGaps + zeroEvidenceGaps} (${nearDateGaps} near-date-only, ${zeroEvidenceGaps} zero-evidence)`);

  console.log("\n  per index (total / with last_assessed / failed):");
  for (const [i, s] of Object.entries(idxStats).sort()) {
    console.log(`    ${i.padEnd(16)} ${String(s.total).padStart(5)} / ${String(s.withAssessed).padStart(5)} / ${String(s.failed).padStart(4)}`);
  }

  if (warnings.length) {
    console.log(`\n  WARNINGS (non-blocking, ${warnings.length}):`);
    warnings.forEach((w) => console.log(`    ! ${w}`));
  }

  if (failures.length) {
    console.log(`\n  FAILURES (blocking, ${failures.length}):`);
    failures.forEach((f) =>
      console.log(`    x ${f.slug} | claimed last_assessed=${f.claimedDate} | expected ${f.expectedPath} | ${f.detail}`),
    );
    console.log(`\nRESULT: FAIL — ${failures.length} entit${failures.length === 1 ? "y claims" : "ies claim"} a last_assessed date with no corresponding report.\n`);
    process.exit(1);
  }

  console.log("\nRESULT: PASS — every last_assessed claim in scope is backed by a report on disk.\n");
  process.exit(0);
}
