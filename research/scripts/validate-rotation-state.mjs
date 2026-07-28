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
 * The remaining ~94 entities have NO report under any of the three shapes
 * above. These are real gaps and DO fail, split into two severities in the
 * failure output:
 *   - "near-date report(s) exist" — a report for the same slug exists, just
 *     under a different date (commonly off-by-one-day, e.g. state-street
 *     claims 2026-07-21 but the file on disk is state-street-2026-07-20.md).
 *     This looks like a day-boundary recording slip, not fabrication, but the
 *     exact claimed date is still unverifiable from disk, so it fails.
 *   - "no report of any kind found" — zero evidence anywhere for the slug
 *     (e.g. merck, home-depot, jpmorgan-chase, berkshire-hathaway: claimed
 *     last_assessed dates from 2026-04-21, the pipeline's first week, with no
 *     assessment file, no change-proposal, no APPLIED_CHANGES.md mention).
 *     These predate this script and are believed to be inherited from an
 *     early bulk-seed of rotation-state.json rather than the 07-27 defect
 *     pattern, but the honest answer is they cannot be distinguished from it
 *     by evidence alone — so they are reported, not silently allowlisted.
 *
 * No blanket allowlist is used: an allowlist that suppresses "no report of
 * any kind found" cases would hide exactly the failure mode this script
 * exists to catch. The two accepted legacy PATH SHAPES above are a narrow,
 * documented, mechanically-checked exception (a real file must still exist);
 * they are not a list of entity names exempted from the check.
 *
 * Usage:
 *   node research/scripts/validate-rotation-state.mjs
 *   node research/scripts/validate-rotation-state.mjs --date 2026-07-27
 *   node research/scripts/validate-rotation-state.mjs --rotation-file <path>   (for tests)
 *
 * Exit code 0 = PASS (no entity claims an assessment date with zero backing report).
 * Exit code 1 = FAIL (at least one entity has a real gap — see failure list).
 */

import { readFileSync, existsSync, readdirSync } from "node:fs";
import path from "node:path";

const REPO = path.resolve(import.meta.dirname, "..", "..");
const ASSESSMENTS_DIR = path.join(REPO, "research", "assessments");
const PROPOSALS_DIR = path.join(REPO, "research", "change-proposals");
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

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
const assessmentDateDirs = readdirSync(ASSESSMENTS_DIR).filter((f) => DATE_RE.test(f));
const proposalFiles = new Set(readdirSync(PROPOSALS_DIR).filter((f) => f.endsWith(".json")));
const proposalHistoryDir = path.join(PROPOSALS_DIR, "history");
const proposalHistoryFiles = existsSync(proposalHistoryDir)
  ? new Set(readdirSync(proposalHistoryDir).filter((f) => f.endsWith(".json")))
  : new Set();

function slugFilesWithDate(slug) {
  // Any `<slug>-<YYYY-MM-DD>.md` file, regardless of which date.
  const re = new RegExp(`^${slug.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}-(\\d{4}-\\d{2}-\\d{2})\\.md$`);
  const out = [];
  for (const f of assessmentFiles) {
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
function resolveAssessmentReport(slug, claimedDate) {
  const exactName = `${slug}-${claimedDate}.md`;
  if (assessmentFiles.has(exactName)) return { status: "exact" };

  if (assessmentDateDirs.includes(claimedDate)) {
    const subdirPath = path.join(ASSESSMENTS_DIR, claimedDate, `${slug}.md`);
    if (existsSync(subdirPath)) return { status: "legacy-subdir" };
  }

  if (assessmentFiles.has(`${slug}.md`)) return { status: "legacy-undated" };

  const others = slugFilesWithDate(slug);
  if (others.length) return { status: "near-date", found: others.map((o) => o.date) };

  return { status: "none" };
}

function resolveChangeProposal(slug, claimedDate) {
  const exactName = `${slug}-${claimedDate}.json`;
  if (proposalFiles.has(exactName)) return true;
  if (proposalHistoryFiles.has(exactName)) return true;
  if (proposalHistoryFiles.has(`${slug}.json`)) return true; // legacy undated proposal
  return false;
}

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

const failures = []; // { slug, name, index, claimedDate, expectedPath, detail }
const warnings = [];

// Track match-shape counts for the summary.
let exactMatches = 0;
let legacyUndatedMatches = 0;
let legacySubdirMatches = 0;
let nearDateGaps = 0;
let zeroEvidenceGaps = 0;

const TODAY = new Date();
const todayISO = TODAY.toISOString().slice(0, 10);

for (const [slug, e] of entrySet) {
  const name = e.name ?? slug;
  const index = e.index ?? "?";

  // ── FAIL check: last_assessed must have a backing report ────────────────
  if (e.last_assessed) {
    const claimed = e.last_assessed;
    const resolution = resolveAssessmentReport(slug, claimed);
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
        nearDateGaps++;
        failures.push({
          slug,
          name,
          index,
          claimedDate: claimed,
          expectedPath,
          detail: `no exact-date report, but near-date report(s) exist for this slug: ${resolution.found.join(", ")} — the recorded last_assessed date looks off, not fabricated from nothing`,
        });
        break;
      case "none":
        zeroEvidenceGaps++;
        failures.push({
          slug,
          name,
          index,
          claimedDate: claimed,
          expectedPath,
          detail: "no report of any kind found for this slug (no exact match, no legacy undated file, no legacy subdirectory file, no near-date file)",
        });
        break;
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
  if (e.last_change_proposal && !resolveChangeProposal(slug, e.last_change_proposal)) {
    warnings.push(
      `${slug} (${name}): last_change_proposal=${e.last_change_proposal} has no matching file in research/change-proposals/ ` +
        `(checked research/change-proposals/${slug}-${e.last_change_proposal}.json, history/${slug}-${e.last_change_proposal}.json, history/${slug}.json).`,
    );
  }
}

// ── Per-index summary ────────────────────────────────────────────────────
const idxStats = {};
for (const [slug, e] of entrySet) {
  const i = e.index ?? "?";
  idxStats[i] ??= { total: 0, withAssessed: 0, failed: 0 };
  idxStats[i].total++;
  if (e.last_assessed) idxStats[i].withAssessed++;
}
for (const f of failures) {
  idxStats[f.index] ??= { total: 0, withAssessed: 0, failed: 0 };
  idxStats[f.index].failed++;
}

console.log(`\nRotation-state integrity gate${singleNightDate ? ` — single night ${singleNightDate}` : ""}`);
console.log(`  rotation-state file : ${rotationPath}`);
console.log(`  entities in scope   : ${entrySet.length}${singleNightDate ? ` (of ${Object.keys(entities).length} total)` : ""}`);
console.log(`  with last_assessed  : ${exactMatches + legacyUndatedMatches + legacySubdirMatches + nearDateGaps + zeroEvidenceGaps}`);
console.log(`  exact-match reports : ${exactMatches}`);
console.log(`  legacy-format match : ${legacyUndatedMatches + legacySubdirMatches} (${legacyUndatedMatches} undated, ${legacySubdirMatches} dated-subdirectory) — WARN, not FAIL`);
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
