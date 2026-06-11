#!/usr/bin/env node

/**
 * validate-daily-briefings.mjs — Build-time schema contract enforcer.
 *
 * Validates every briefing date in site/src/data/updates/manifest.json
 * against the DAILY_BRIEFING_SCHEMA.md contract.
 *
 * Policy:
 *   RICH_REQUIRED_FROM = "2026-05-26"
 *
 *   ALL dates  : minimum contract (parse, non-empty date, renderable lead content).
 *                Violations → ERROR (fail).
 *
 *   date >= RICH_REQUIRED_FROM : full rich contract enforced.
 *                                Violations → ERROR (fail).
 *
 *   date <  RICH_REQUIRED_FROM that are flat (missing topSignals):
 *                                Violations → WARNING only (never fail).
 *                                Printed as "legacy, grandfathered".
 *
 * Output style mirrors lint-daily-briefings.mjs:
 *   - Per-file violations with field path
 *   - PASS/FAIL summary
 *   - Non-zero exit on any ERROR
 *
 * Contract doc: docs/DAILY_BRIEFING_SCHEMA.md
 * Usage:
 *   node site/scripts/validate-daily-briefings.mjs
 *   npm run validate:briefings   (from site/)
 */

import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const MANIFEST_PATH = join(__dirname, "..", "src", "data", "updates", "manifest.json");
const DAILY_DIR = join(__dirname, "..", "src", "data", "updates", "daily");

// ─────────────────────────────────────────────────────────────────────────────
// CUTOFF CONSTANT — do not lower this to hide failures
// ─────────────────────────────────────────────────────────────────────────────
const RICH_REQUIRED_FROM = "2026-05-26";

// ─────────────────────────────────────────────────────────────────────────────
// APPROVED STATUS VALUES for recentAssessments[].status
// ─────────────────────────────────────────────────────────────────────────────
const APPROVED_ASSESSMENT_STATUSES = new Set([
  "applied",
  "documented",
  "band-crossing-finding",
  "band-crossing-proposed",
  "boundary-watch",
  "floor-confirmed",
  "methodology-evolution",
]);

const APPROVED_SEVERITY_VALUES = new Set(["critical", "high", "medium", "low"]);
const APPROVED_PRIORITY_VALUES = new Set(["critical", "high", "medium", "low"]);

// ─────────────────────────────────────────────────────────────────────────────
// VIOLATION BUILDER
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @param {"ERROR"|"WARNING"} level
 * @param {string} path  — JSON field path, e.g. "topSignals[2].title"
 * @param {string} detail
 */
function violation(level, path, detail) {
  return { level, path, detail };
}

// ─────────────────────────────────────────────────────────────────────────────
// MINIMUM CONTRACT (all dates)
// ─────────────────────────────────────────────────────────────────────────────

function checkMinimumContract(data) {
  const violations = [];

  // date must be a non-empty string
  if (typeof data.date !== "string" || data.date.trim() === "") {
    violations.push(violation("ERROR", "date", "must be a non-empty string"));
  }

  // Renderable lead: at least one of topSignals, scoreChanges, highlights, confirmations must be non-empty
  const hasTopSignals =
    Array.isArray(data.topSignals) && data.topSignals.length > 0;
  const hasScoreChanges =
    Array.isArray(data.scoreChanges) && data.scoreChanges.length > 0;
  const hasHighlights =
    Array.isArray(data.highlights) && data.highlights.length > 0;
  const hasConfirmations =
    Array.isArray(data.confirmations) && data.confirmations.length > 0;

  if (!hasTopSignals && !hasScoreChanges && !hasHighlights && !hasConfirmations) {
    violations.push(
      violation(
        "ERROR",
        "<root>",
        "renderable lead content missing: needs non-empty topSignals[], scoreChanges[], highlights[], or confirmations[]"
      )
    );
  }

  return violations;
}

// ─────────────────────────────────────────────────────────────────────────────
// FULL RICH CONTRACT (dates >= RICH_REQUIRED_FROM)
// ─────────────────────────────────────────────────────────────────────────────

function checkRichContract(data) {
  const violations = [];

  // ── 2a: Required scalars ──────────────────────────────────────────────────

  for (const field of ["title", "headline", "summary"]) {
    if (typeof data[field] !== "string" || data[field].trim() === "") {
      violations.push(
        violation("ERROR", field, `must be a non-empty string (rich contract requires ${field})`)
      );
    }
  }

  // ── 2b: pipeline object ───────────────────────────────────────────────────

  if (
    data.pipeline === null ||
    typeof data.pipeline !== "object" ||
    Array.isArray(data.pipeline)
  ) {
    violations.push(
      violation("ERROR", "pipeline", "must be a non-null object")
    );
  }

  // ── 2c: topSignals[] — required and non-empty ─────────────────────────────

  if (!Array.isArray(data.topSignals)) {
    violations.push(
      violation("ERROR", "topSignals", "must be an array")
    );
  } else if (data.topSignals.length === 0) {
    violations.push(
      violation("ERROR", "topSignals", "must be non-empty (at least 1 item required)")
    );
  } else {
    // Validate each item
    for (let i = 0; i < data.topSignals.length; i++) {
      const item = data.topSignals[i];
      const base = `topSignals[${i}]`;

      if (typeof item !== "object" || item === null) {
        violations.push(violation("ERROR", base, "must be an object"));
        continue;
      }

      for (const f of ["title", "description", "index", "slug", "actionType"]) {
        if (typeof item[f] !== "string" || item[f].trim() === "") {
          violations.push(
            violation("ERROR", `${base}.${f}`, "must be a non-empty string")
          );
        }
      }

      if (!APPROVED_SEVERITY_VALUES.has(item.severity)) {
        violations.push(
          violation(
            "ERROR",
            `${base}.severity`,
            `must be one of: ${[...APPROVED_SEVERITY_VALUES].join(", ")} (got: ${JSON.stringify(item.severity)})`
          )
        );
      }

      if (typeof item.actionRequired !== "boolean") {
        violations.push(
          violation("ERROR", `${base}.actionRequired`, "must be a boolean")
        );
      }
    }
  }

  // ── 2d: boundaryWatch[] — must be present as array ───────────────────────

  if (!Array.isArray(data.boundaryWatch)) {
    violations.push(
      violation("ERROR", "boundaryWatch", "must be an array (may be empty)")
    );
  } else {
    for (let i = 0; i < data.boundaryWatch.length; i++) {
      const item = data.boundaryWatch[i];
      const base = `boundaryWatch[${i}]`;

      if (typeof item !== "object" || item === null) {
        violations.push(violation("ERROR", base, "must be an object"));
        continue;
      }

      for (const f of ["entity", "slug", "index", "fromBand", "toBand", "direction", "status", "trigger", "note"]) {
        if (typeof item[f] !== "string" || item[f].trim() === "") {
          violations.push(
            violation("ERROR", `${base}.${f}`, "must be a non-empty string")
          );
        }
      }

      if (typeof item.score !== "number") {
        violations.push(violation("ERROR", `${base}.score`, "must be a number"));
      }
      if (typeof item.distance !== "number") {
        violations.push(violation("ERROR", `${base}.distance`, "must be a number"));
      }
      if (typeof item.cycle !== "number") {
        violations.push(violation("ERROR", `${base}.cycle`, "must be a number"));
      }
    }
  }

  // ── 2e: recentAssessments[] — must be present as array ───────────────────

  if (!Array.isArray(data.recentAssessments)) {
    violations.push(
      violation("ERROR", "recentAssessments", "must be an array (may be empty)")
    );
  } else {
    for (let i = 0; i < data.recentAssessments.length; i++) {
      const item = data.recentAssessments[i];
      const base = `recentAssessments[${i}]`;

      if (typeof item !== "object" || item === null) {
        violations.push(violation("ERROR", base, "must be an object"));
        continue;
      }

      for (const f of ["entity", "slug", "index", "date"]) {
        if (typeof item[f] !== "string" || item[f].trim() === "") {
          violations.push(
            violation("ERROR", `${base}.${f}`, "must be a non-empty string")
          );
        }
      }

      for (const f of ["published", "assessed", "delta"]) {
        if (typeof item[f] !== "number") {
          violations.push(
            violation("ERROR", `${base}.${f}`, "must be a number")
          );
        }
      }

      if (typeof item.status !== "string" || !APPROVED_ASSESSMENT_STATUSES.has(item.status)) {
        violations.push(
          violation(
            "ERROR",
            `${base}.status`,
            `must be one of: ${[...APPROVED_ASSESSMENT_STATUSES].join(", ")} (got: ${JSON.stringify(item.status)})`
          )
        );
      }
    }
  }

  // ── 2f: emergingRisks[] — must be present as array ───────────────────────

  if (!Array.isArray(data.emergingRisks)) {
    violations.push(
      violation("ERROR", "emergingRisks", "must be an array (may be empty)")
    );
  } else {
    for (let i = 0; i < data.emergingRisks.length; i++) {
      const item = data.emergingRisks[i];
      const base = `emergingRisks[${i}]`;

      if (typeof item !== "object" || item === null) {
        violations.push(violation("ERROR", base, "must be an object"));
        continue;
      }

      for (const f of ["risk", "detail", "forwardDate"]) {
        if (typeof item[f] !== "string" || item[f].trim() === "") {
          violations.push(
            violation("ERROR", `${base}.${f}`, "must be a non-empty string")
          );
        }
      }

      if (!APPROVED_PRIORITY_VALUES.has(item.priority)) {
        violations.push(
          violation(
            "ERROR",
            `${base}.priority`,
            `must be one of: ${[...APPROVED_PRIORITY_VALUES].join(", ")} (got: ${JSON.stringify(item.priority)})`
          )
        );
      }

      if (!Array.isArray(item.entitiesAffected) || item.entitiesAffected.length === 0) {
        violations.push(
          violation("ERROR", `${base}.entitiesAffected`, "must be a non-empty array of slugs")
        );
      }
    }
  }

  // ── 2g: sectorAlerts[] — must be present as array ────────────────────────

  if (!Array.isArray(data.sectorAlerts)) {
    violations.push(
      violation("ERROR", "sectorAlerts", "must be an array (may be empty)")
    );
  } else {
    for (let i = 0; i < data.sectorAlerts.length; i++) {
      const item = data.sectorAlerts[i];
      const base = `sectorAlerts[${i}]`;

      if (typeof item !== "object" || item === null) {
        violations.push(violation("ERROR", base, "must be an object"));
        continue;
      }

      for (const f of ["sector", "headline"]) {
        if (typeof item[f] !== "string" || item[f].trim() === "") {
          violations.push(
            violation("ERROR", `${base}.${f}`, "must be a non-empty string")
          );
        }
      }

      if (!Array.isArray(item.observations) || item.observations.length === 0) {
        violations.push(
          violation("ERROR", `${base}.observations`, "must be a non-empty string array")
        );
      }
    }
  }

  // ── 2h: methodologyNotes[] — must be present as array ────────────────────

  if (!Array.isArray(data.methodologyNotes)) {
    violations.push(
      violation("ERROR", "methodologyNotes", "must be an array (may be empty)")
    );
  } else {
    for (let i = 0; i < data.methodologyNotes.length; i++) {
      const item = data.methodologyNotes[i];
      const base = `methodologyNotes[${i}]`;

      if (typeof item !== "object" || item === null) {
        violations.push(violation("ERROR", base, "must be an object"));
        continue;
      }

      for (const f of ["name", "description", "version", "status"]) {
        if (typeof item[f] !== "string" || item[f].trim() === "") {
          violations.push(
            violation("ERROR", `${base}.${f}`, "must be a non-empty string")
          );
        }
      }
    }
  }

  // ── 2i: forwardTriggers[] — must be present as array ─────────────────────

  if (!Array.isArray(data.forwardTriggers)) {
    violations.push(
      violation("ERROR", "forwardTriggers", "must be an array (may be empty)")
    );
  } else {
    for (let i = 0; i < data.forwardTriggers.length; i++) {
      const item = data.forwardTriggers[i];
      const base = `forwardTriggers[${i}]`;

      if (typeof item !== "object" || item === null) {
        violations.push(violation("ERROR", base, "must be an object"));
        continue;
      }

      for (const f of ["date", "entity", "slug", "trigger"]) {
        if (typeof item[f] !== "string" || item[f].trim() === "") {
          violations.push(
            violation("ERROR", `${base}.${f}`, "must be a non-empty string")
          );
        }
      }

      if (!APPROVED_PRIORITY_VALUES.has(item.priority)) {
        violations.push(
          violation(
            "ERROR",
            `${base}.priority`,
            `must be one of: ${[...APPROVED_PRIORITY_VALUES].join(", ")} (got: ${JSON.stringify(item.priority)})`
          )
        );
      }
    }
  }

  // ── 2j: dailyOpeningQuestion — must be present (null or object) ───────────

  if (!("dailyOpeningQuestion" in data)) {
    violations.push(
      violation(
        "ERROR",
        "dailyOpeningQuestion",
        "field must be present (set to null if no publishable question, or provide full object)"
      )
    );
  } else if (data.dailyOpeningQuestion !== null) {
    const q = data.dailyOpeningQuestion;
    const base = "dailyOpeningQuestion";

    if (typeof q !== "object" || Array.isArray(q)) {
      violations.push(violation("ERROR", base, "must be null or an object"));
    } else {
      if (typeof q.text !== "string" || q.text.trim() === "") {
        violations.push(
          violation("ERROR", `${base}.text`, "must be a non-empty string")
        );
      }

      if (!Array.isArray(q.themes) || q.themes.length === 0) {
        violations.push(
          violation("ERROR", `${base}.themes`, "must be a non-empty array of 1–3 thematic labels")
        );
      }

      if (!Array.isArray(q.tiedToEntities) || q.tiedToEntities.length === 0) {
        violations.push(
          violation("ERROR", `${base}.tiedToEntities`, "must be a non-empty array with at least 1 entity slug")
        );
      }

      if (
        typeof q.forwardResolutionDate !== "string" &&
        q.forwardResolutionDate !== null
      ) {
        violations.push(
          violation(
            "ERROR",
            `${base}.forwardResolutionDate`,
            "must be a YYYY-MM-DD string or null"
          )
        );
      }

      if (q.eveningResolution !== null) {
        violations.push(
          violation(
            "ERROR",
            `${base}.eveningResolution`,
            "must always be null (reserved for future pipeline feature)"
          )
        );
      }
    }
  }

  return violations;
}

// ─────────────────────────────────────────────────────────────────────────────
// EVIDENCE INTEGRITY CHECKS
//
// When set to a date string (YYYY-MM-DD), scored topSignals/recentAssessments
// (those with a delta or band-crossing) on or after that date WARN if they
// have no evidence[]. Set to null to disable the completeness warning — leave
// null until backfill is complete so nothing breaks.
// ─────────────────────────────────────────────────────────────────────────────

const EVIDENCE_REQUIRED_FROM = null;

const HTTP_URL_RE = /^https?:\/\//i;

/**
 * Count words in a string (whitespace-delimited).
 * @param {string} str
 * @returns {number}
 */
function wordCount(str) {
  return str.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Validate a single EvidenceItem object.
 *
 * @param {object} item
 * @param {string} basePath  — e.g. "topSignals[0].evidence[1]"
 * @returns {{ errors: object[], warnings: object[] }}
 */
function checkEvidenceItem(item, basePath) {
  const errors = [];
  const warnings = [];

  if (typeof item !== "object" || item === null) {
    errors.push(violation("ERROR", basePath, "must be an object"));
    return { errors, warnings };
  }

  // source is required
  if (typeof item.source !== "string" || item.source.trim() === "") {
    errors.push(violation("ERROR", `${basePath}.source`, "must be a non-empty string (source is required on every EvidenceItem)"));
  }

  // quote⇒url: if quote is non-empty, url is REQUIRED (core anti-fabrication guard)
  const hasQuote = typeof item.quote === "string" && item.quote.trim().length > 0;
  if (hasQuote && (typeof item.url !== "string" || item.url.trim() === "")) {
    errors.push(violation("ERROR", `${basePath}.url`, "REQUIRED when quote is present — every verbatim quote must have a source URL (anti-fabrication guard)"));
  }

  // url and archivedUrl must be valid http(s) URLs if present
  for (const urlField of ["url", "archivedUrl"]) {
    const val = item[urlField];
    if (val !== undefined && val !== null && val !== "") {
      if (typeof val !== "string" || !HTTP_URL_RE.test(val)) {
        errors.push(violation("ERROR", `${basePath}.${urlField}`, `must be a valid http(s) URL (got: ${JSON.stringify(val)})`));
      }
    }
  }

  // quote word-count ceiling (~50 words) — WARNING only
  if (hasQuote && wordCount(item.quote) > 50) {
    warnings.push(violation("WARNING", `${basePath}.quote`, `exceeds ~50-word ceiling (${wordCount(item.quote)} words) — paraphrase-creep guard; shorten to verbatim extract`));
  }

  // sourceTier must be 1–5 if present
  if (item.sourceTier !== undefined && item.sourceTier !== null) {
    const tier = item.sourceTier;
    if (!Number.isInteger(tier) || tier < 1 || tier > 5) {
      warnings.push(violation("WARNING", `${basePath}.sourceTier`, `must be an integer 1–5 if present (got: ${JSON.stringify(tier)})`));
    }
  }

  return { errors, warnings };
}

/**
 * Walk every evidence[] array on topSignals[] and recentAssessments[].
 * These checks apply to ALL dates — integrity applies whenever evidence is
 * present. They must NOT fail current briefings that have no evidence[] yet.
 *
 * @param {object} data  — parsed briefing JSON
 * @param {string} date  — YYYY-MM-DD (used for EVIDENCE_REQUIRED_FROM warn)
 * @returns {{ errors: object[], warnings: object[] }}
 */
function checkEvidence(data, date) {
  const errors = [];
  const warnings = [];

  const topSignals = Array.isArray(data.topSignals) ? data.topSignals : [];
  const recentAssessments = Array.isArray(data.recentAssessments) ? data.recentAssessments : [];

  // Validate evidence[] items on topSignals
  for (let i = 0; i < topSignals.length; i++) {
    const signal = topSignals[i];
    if (!Array.isArray(signal.evidence)) continue; // absent = valid (optional field)
    for (let j = 0; j < signal.evidence.length; j++) {
      const { errors: e, warnings: w } = checkEvidenceItem(
        signal.evidence[j],
        `topSignals[${i}].evidence[${j}]`
      );
      errors.push(...e);
      warnings.push(...w);
    }
  }

  // Validate evidence[] items on recentAssessments
  for (let i = 0; i < recentAssessments.length; i++) {
    const assessment = recentAssessments[i];
    if (!Array.isArray(assessment.evidence)) continue; // absent = valid
    for (let j = 0; j < assessment.evidence.length; j++) {
      const { errors: e, warnings: w } = checkEvidenceItem(
        assessment.evidence[j],
        `recentAssessments[${i}].evidence[${j}]`
      );
      errors.push(...e);
      warnings.push(...w);
    }
  }

  // Completeness warn: when EVIDENCE_REQUIRED_FROM is set, scored
  // topSignals/recentAssessments on or after that date should have evidence[].
  if (EVIDENCE_REQUIRED_FROM && date >= EVIDENCE_REQUIRED_FROM) {
    for (let i = 0; i < topSignals.length; i++) {
      const s = topSignals[i];
      const isScored = s.actionType === "band-crossing-finding" ||
        s.actionType === "band-crossing-proposed" ||
        s.actionType === "applied";
      if (isScored && (!Array.isArray(s.evidence) || s.evidence.length === 0)) {
        warnings.push(violation("WARNING", `topSignals[${i}].evidence`, "scored signal on/after EVIDENCE_REQUIRED_FROM has no evidence[] — completeness recommended"));
      }
    }
    for (let i = 0; i < recentAssessments.length; i++) {
      const a = recentAssessments[i];
      const isScored = typeof a.delta === "number" && a.delta !== 0;
      if (isScored && (!Array.isArray(a.evidence) || a.evidence.length === 0)) {
        warnings.push(violation("WARNING", `recentAssessments[${i}].evidence`, "scored assessment on/after EVIDENCE_REQUIRED_FROM has no evidence[] — completeness recommended"));
      }
    }
  }

  return { errors, warnings };
}

// ─────────────────────────────────────────────────────────────────────────────
// PER-FILE VALIDATOR
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @param {string} date  YYYY-MM-DD
 * @returns {{ errors: object[], warnings: object[], isLegacyFlat: boolean }}
 */
function validateDate(date) {
  const filePath = join(DAILY_DIR, `${date}.json`);
  let data;

  // Parse
  try {
    data = JSON.parse(readFileSync(filePath, "utf8"));
  } catch (e) {
    return {
      errors: [violation("ERROR", "<root>", `JSON parse failed: ${e.message}`)],
      warnings: [],
      isLegacyFlat: false,
    };
  }

  const errors = [];
  const warnings = [];

  // Minimum contract (all dates) — always ERRORs
  const minViolations = checkMinimumContract(data);
  errors.push(...minViolations);

  const isRichRequired = date >= RICH_REQUIRED_FROM;
  const hasTopSignals = Array.isArray(data.topSignals) && data.topSignals.length > 0;
  const isLegacyFlat = !isRichRequired && !hasTopSignals;

  if (isRichRequired) {
    // Full rich contract — always ERRORs for post-cutoff dates
    const richViolations = checkRichContract(data);
    errors.push(...richViolations);
  } else if (isLegacyFlat) {
    // Legacy flat: run rich contract but demote all to WARNINGs
    const richViolations = checkRichContract(data);
    // Only emit warnings for fields that are actually missing (not the minimum contract re-checks)
    for (const v of richViolations) {
      warnings.push({ ...v, level: "WARNING" });
    }
  }
  // else: pre-cutoff date that IS already rich — minimum contract errors already captured above

  // Evidence integrity — runs on ALL dates, whenever evidence[] is present.
  // Must NOT fail briefings that have no evidence[] yet.
  const { errors: evErrors, warnings: evWarnings } = checkEvidence(data, date);
  errors.push(...evErrors);
  warnings.push(...evWarnings);

  return { errors, warnings, isLegacyFlat };
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────

function main() {
  // Load manifest
  let manifest;
  try {
    manifest = JSON.parse(readFileSync(MANIFEST_PATH, "utf8"));
  } catch (e) {
    console.error(`[validate-daily-briefings] FATAL: cannot read manifest: ${e.message}`);
    process.exit(2);
  }

  const dates = Array.isArray(manifest.dates) ? manifest.dates : [];
  if (dates.length === 0) {
    console.log("[validate-daily-briefings] No dates in manifest — nothing to validate.");
    return;
  }

  // Sort oldest-first for readable output
  const sortedDates = [...dates].sort();

  let totalErrors = 0;
  let totalWarnings = 0;
  const failingDates = [];
  const warningDates = [];
  const passDates = [];

  for (const date of sortedDates) {
    const { errors, warnings, isLegacyFlat } = validateDate(date);

    if (errors.length > 0) {
      totalErrors += errors.length;
      failingDates.push({ date, errors, warnings, isLegacyFlat });
    } else if (warnings.length > 0) {
      totalWarnings += warnings.length;
      warningDates.push({ date, errors, warnings, isLegacyFlat });
    } else {
      passDates.push(date);
    }
  }

  // ── Output passing dates ────────────────────────────────────────────────

  if (passDates.length > 0) {
    console.log(
      `[validate-daily-briefings] PASS (${passDates.length} dates): ` +
      passDates.join(", ")
    );
  }

  // ── Output warnings (legacy grandfathered) ──────────────────────────────

  if (warningDates.length > 0) {
    console.log(
      `\n[validate-daily-briefings] WARNINGS — ${warningDates.length} legacy flat briefing(s) ` +
      `(grandfathered, pre-${RICH_REQUIRED_FROM} — will roll off the 30-day window):\n`
    );
    for (const { date, warnings: ws } of warningDates) {
      console.log(
        `  ${date}  [legacy, grandfathered — flat schema pre-${RICH_REQUIRED_FROM}]`
      );
      for (const w of ws.slice(0, 3)) {
        // Show up to 3 warnings per file to avoid noise
        console.log(`    ⚠  ${w.path}: ${w.detail}`);
      }
      if (ws.length > 3) {
        console.log(`    ⚠  ... and ${ws.length - 3} more field warnings (all non-fatal)`);
      }
    }
  }

  // ── Output errors ───────────────────────────────────────────────────────

  if (failingDates.length > 0) {
    const richFails = failingDates.filter((r) => r.date >= RICH_REQUIRED_FROM);
    const minFails = failingDates.filter((r) => r.date < RICH_REQUIRED_FROM);

    if (richFails.length > 0) {
      console.error(
        `\n[validate-daily-briefings] FAIL — ${richFails.length} post-cutoff briefing(s) ` +
        `fail the FULL RICH CONTRACT (date >= ${RICH_REQUIRED_FROM}):\n`
      );
      for (const { date, errors: errs } of richFails) {
        console.error(`  ${date}  [RICH CONTRACT REQUIRED — must be backfilled]`);
        for (const e of errs) {
          console.error(`    ✗  ${e.path}: ${e.detail}`);
        }
        console.error("");
      }
    }

    if (minFails.length > 0) {
      console.error(
        `\n[validate-daily-briefings] FAIL — ${minFails.length} briefing(s) fail the ` +
        `MINIMUM CONTRACT (all dates must pass):\n`
      );
      for (const { date, errors: errs } of minFails) {
        console.error(`  ${date}  [MINIMUM CONTRACT VIOLATION]`);
        for (const e of errs) {
          console.error(`    ✗  ${e.path}: ${e.detail}`);
        }
        console.error("");
      }
    }

    console.error(
      `[validate-daily-briefings] SUMMARY: ${totalErrors} error(s) across ` +
      `${failingDates.length} date(s). ${totalWarnings} warning(s) across ` +
      `${warningDates.length} legacy date(s).\n`
    );
    console.error(
      `[validate-daily-briefings] Post-cutoff briefings must satisfy the full rich schema ` +
      `defined in docs/DAILY_BRIEFING_SCHEMA.md. Backfill required before build will pass.`
    );
    process.exit(1);
  }

  // ── All errors resolved ─────────────────────────────────────────────────

  console.log(
    `\n[validate-daily-briefings] PASS — ${passDates.length + warningDates.length} of ${dates.length} briefings validated.` +
    (totalWarnings > 0
      ? ` ${warningDates.length} legacy flat date(s) grandfathered with warnings (not failures).`
      : "")
  );
}

main();
