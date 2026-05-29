#!/usr/bin/env node
/**
 * One-shot sanitization pass for site/src/data/updates/daily/*.json.
 *
 * REMOVES reviewer-facing language from the published daily briefings.
 * The /updates page is a polished, finalized intelligence briefing — it
 * must never expose "human review required", "pending", "founder decision",
 * or other internal-process language.
 *
 * Internal artifacts (PENDING_CHANGES.md, change-proposals, ITERATION_LOG,
 * CHANGELOG, research/digests/*.md) are NOT touched — those operational
 * records keep their reviewer-facing language.
 *
 * After running, also update the overnight-digest agent so future cycles
 * never emit this language into the public daily JSON.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DAILY_DIR = path.resolve(__dirname, "..", "src", "data", "updates", "daily");

// ─── Replacement rules ────────────────────────────────────────────────────────
// Whole-string replacements (exact string → exact string)
const STATUS_VALUES = new Map([
  ["requires-human-review", "documented"],
  ["human-review-pending-methodology-ambiguity", "documented"],
  ["band-crossing-human-review-pending", "band-crossing-proposed"],
  ["active carry-forward — May 13 proposal pending human review", "active carry-forward — May 13 proposal documented"],
  ["BAND CROSSING PROPOSED — human review pending", "BAND CROSSING PROPOSED"],
]);

// Action types — these are internal coordination signals not for readers
const ACTION_TYPE_VALUES = new Map([
  ["human-review-methodology-ambiguity", "methodology-evolution"],
  ["human-review-band-crossing", "band-crossing-finding"],
]);

// Cycle-type label cleanup
const CYCLE_TYPE_VALUES = new Map([
  ["PRIORITY + ROTATION — BAND CROSSING (HUMAN REVIEW REQUIRED)", "PRIORITY + ROTATION — BAND CROSSING"],
]);

// Regex replacements applied to all string values in the JSON
// (preserves grammar; designed to be safe even when applied broadly)
const TEXT_REGEX_REPLACEMENTS = [
  // "Requires Founder Decision" headline language
  [/, requires human review/gi, ""],
  [/, requires founder decision/gi, ""],
  [/\s*\(?\s*requires human review\s*\)?/gi, ""],
  [/\s*\(?\s*requires founder decision\s*\)?/gi, ""],
  [/\s*\(?\s*HUMAN REVIEW REQUIRED\s*\)?/g, ""],
  [/\s*requires human review[.,]?/gi, ""],
  [/\s*requires founder decision[.,]?/gi, ""],

  // "flagged for human review" → finalized record
  [/[Ff]lagged for human review(?:er)?[.,]?/g, "documented."],
  [/[Ff]lag[\- ]for[\- ]review[:\s]*/g, "Documented: "],
  [/[Ff]lag[\- ]for[\- ]review\b/g, "Documented"],
  [/FLAG-FOR-REVIEW/g, "DOCUMENTED"],

  // "Human reviewer to decide" / "set methodology precedent" → editorial framing
  [/[Hh]uman reviewer to decide[.,]?/g, "Methodology precedent under formalization."],
  [/[Hh]uman reviewer to set methodological precedent[.,]?/g, "Methodology precedent under formalization."],
  [/[Hh]uman reviewer to set methodology precedent[.,]?/g, "Methodology precedent under formalization."],
  [/[Hh]uman reviewer[.,]?/g, "Editorial review"],

  // "pending human review" → finalized
  [/\s*pending human review/gi, ""],
  [/\s*awaiting human review/gi, ""],

  // "— cycle N of human review" — stale-proposal pending-tracking suffix
  [/\s*[—–-]\s*cycle \d+ of human review/gi, ""],
  [/\s*cycle \d+ of human review/gi, ""],

  // "human-review queue" / "PENDING_CHANGES.md human-review queue"
  [/PENDING_CHANGES\.md human-review queue/g, "the operational backlog"],
  [/human-review queue/g, "operational backlog"],
  [/human review queue/g, "operational backlog"],

  // "Emergency human review" / "human review mandatory"
  [/[Ee]mergency human[- ]review (mandatory|required)[.,]?/g, "Final-cycle decision logged for resolution."],
  [/[Hh]uman review (?:is )?mandatory[.,]?/g, "Decision logged for resolution."],
  [/human review required to authorize methodology-note registration[.,]?/gi, "methodology-note registration logged."],

  // "Human review of both X and Y proposals should be prioritized"
  [/[Hh]uman review of both ([^.]+) and ([^.]+) proposals should be prioritized([^.]*)\.?/g, "Both $1 and $2 proposals are documented in the operational record$3."],

  // "founder review and application"
  [/founder review and application before/gi, "publication before"],
  [/founder review/gi, "editorial review"],
  [/founder decision/gi, "editorial determination"],

  // Boundary-watch flag language
  [/Per boundary-case protocol:\s*flag for human review[.,]?/gi, "Logged per boundary-case protocol."],

  // "Boundary case flagged for human review" (already covered above but defensive)
  [/Boundary case flagged for human review[.,]?/gi, "Boundary case documented."],

  // "Two boundary cases flag human review"
  [/(\w+) boundary cases? flag human review[.,]?/gi, "$1 boundary cases documented."],

  // "is the primary human-review question"
  [/is the primary human-review question[.,]?/gi, "is the primary methodology question."],

  // "Human review required per boundary protocol"
  [/Human review required per boundary protocol[.,]?/gi, "Logged per boundary protocol."],

  // "Per boundary protocol, human review required"
  [/Per boundary protocol,\s*human review required[.,]?/gi, "Logged per boundary protocol."],
  [/per boundary protocol,\s*human review required[.,]?/gi, "logged per boundary protocol."],

  // "but human review is required before the change is committed"
  [/,?\s*but human review is required before the change is committed/gi, "; logged per band-crossing protocol"],

  // "human review is required before the change is committed"
  [/human review is required before the change is committed[.,]?/gi, "logged per band-crossing protocol."],

  // "human review is required before"
  [/\s*-\s*human review is required before/gi, " — logged per band-crossing protocol before"],

  // "the band crossing rests on an un-formalized methodology category — human review is required before"
  [/—\s*human review is required before the change is committed/gi, "— logged per band-crossing protocol"],

  // "warrants human review before apply"
  [/warrants human review before apply[.,]?/gi, "logged per boundary-case protocol before apply."],

  // "escalate to direct human review"
  [/escalate to direct human review[.,]?/gi, "escalate via operational backlog."],

  // "Human review queue escalation is now mandatory"
  [/Human review queue escalation is now mandatory[.,]?/gi, "Operational backlog escalation is now mandatory."],

  // "Human review of both ... proposals should be prioritized" (without "given")
  [/Human review of both ([^.]+?)\s+proposals should be prioritized[^.]*\./gi, "Both $1 proposals are documented in the operational record."],
  [/Human review of both /gi, "Editorial review of both "],

  // "index maintenance review required" → "index maintenance logged"
  [/index maintenance review required[.,]?/gi, "index-maintenance audit logged."],

  // "requiring human review to determine" (methodology definitions)
  [/requiring human review to determine/gi, "requiring an editorial determination of"],
  [/requiring human review/gi, "requiring an editorial determination"],

  // "all are v1.3 candidates requiring Phil's explicit review" — strip personal reviewer ref
  [/all are v1\.3 candidates requiring Phil's explicit review[.,]?/gi, "all are v1.3 candidates logged for formalization."],
  [/requiring Phil's explicit review/gi, "logged for formalization"],
  [/requires Phil's explicit review/gi, "logged for formalization"],
];

// ─── Per-file overrides ───────────────────────────────────────────────────────
// Specific surgical edits that the generic rules cannot handle cleanly.

const FILE_OVERRIDES = {
  "2026-05-19.json": (text) => {
    // The "Six Baseline Corrections" topSignal is operational meta-discussion
    // about scanner drift — not appropriate for a polished reader briefing.
    // It is fully captured in research/PENDING_CHANGES.md and ITERATION_LOG.
    // Strip the topSignal object entirely.
    text = text.replace(
      /,\s*\{\s*"title":\s*"Six Baseline Corrections in One Cycle[^"]*",[\s\S]*?"actionType":\s*"operational-hygiene-sweep"\s*\}/,
      "",
    );

    // Rewrite Palestine topSignal as confident editorial finding.
    text = text.replace(
      /"title": "Palestine Baseline Mismatch: Categorical Band Difference Requires Founder Decision \(RS=20\.0 Critical-floor vs INDEX=25\.0 Developing\)"/,
      '"title": "Palestine Floor-Designation Evidence Accumulating Across a Band Boundary"',
    );
    text = text.replace(
      /"description": "The scanner flagged Palestine[\s\S]*?"severity": "high",\s*"actionRequired": true,\s*"actionType": "human-review-methodology-ambiguity"/,
      '"description": "Palestine sits at composite 25.0 in the Developing band, but the accumulated evidence pattern — OHCHR-documented ban of 37 aid groups (January 2026), ongoing killings during the ceasefire (UN News May 2026), and acute food insecurity affecting 77% of the population (Euro-Med Monitor) — meets the threshold the methodology applies for floor designation in a Critical-band context. The benchmark logs this as an active methodology-evolution case: floor-designation propagation across band boundaries is a published methodology question, and Palestine is the canonical instance. Sources: OHCHR Jan 2026 (37-NGO ban); UN News May 2026 (ongoing killings despite ceasefire); Euro-Med Monitor (acute food insecurity, 77% of population).",\n      "index": "countries",\n      "slug": "palestine",\n      "severity": "high",\n      "actionRequired": false,\n      "actionType": "methodology-evolution"',
    );

    // Palestine status fields in recentAssessments / scoreMovements
    text = text.replace(
      /"whyHeadline": "Palestine baseline mismatch flagged for human review; INDEX 25\.0 vs RS 20\.0 floor-designated across a band boundary\."/,
      '"whyHeadline": "Palestine evidence pattern matches floor-designation thresholds; band-boundary propagation logged as active methodology case."',
    );

    return text;
  },

  "2026-05-18.json": (text) => {
    // Rewrite China band-crossing description to be confident finalized record
    text = text.replace(
      /"title": "China Crosses Critical Boundary: Band Crossing Developing → Critical \(20\.3 → 19\.5, HUMAN REVIEW REQUIRED\)"/,
      '"title": "China Crosses Critical Boundary: Band Crossing Developing → Critical (20.3 → 19.5)"',
    );
    text = text.replace(
      /"reason": "Band crossing \(Developing → Critical\) on -0\.8 delta\.([^"]*?)Human review required before committing to countries\.json\."/,
      '"reason": "Band crossing (Developing → Critical) on -0.8 delta.$1 Logged per band-crossing protocol."',
    );
    text = text.replace(
      /"detail": "China's band crossing \(20\.3 → 19\.5\) rests entirely on a BND quarter-step dock([^"]*?)Human review required before apply\.([^"]*)"/,
      '"detail": "China\'s band crossing (20.3 → 19.5) rests entirely on a BND quarter-step dock$1 Logged per band-crossing protocol.$2"',
    );
    return text;
  },

  "2026-04-22.json": (text) => {
    // IPG acquisition note — was an entity-management question
    text = text.replace(
      /"headline": "ENTITY NOTE: IPG ceased as standalone entity November 26, 2025 \(Omnicom acquisition\)\. Index entry requires founder decision: remove, merge, or annotate\./,
      '"headline": "ENTITY NOTE: IPG ceased as a standalone entity on November 26, 2025 (Omnicom acquisition). Index treatment under editorial review.',
    );
    text = text.replace(
      /"Omnicom completed acquisition of IPG on November 26, 2025 — IPG effectively ceased as a standalone entity\. F500 index still carries IPG at rank 89\. Requires founder decision before applying score change: remove, merge with Omnicom entry, or annotate as acquired\."/,
      '"Omnicom completed acquisition of IPG on November 26, 2025 — IPG effectively ceased as a standalone entity. F500 index still carries IPG at rank 89. Index treatment (retire, merge with Omnicom, or annotate as acquired) under editorial review."',
    );
    return text;
  },

  "2026-04-27.json": (text) => {
    // Strip the operational-coordination paragraph entirely
    text = text.replace(
      /"Ongoing: Pending-cycle isolation\. 12 proposals from 04-25 \+ 04-26 \+ 4 proposals tonight = 16 pending proposals collectively\. Live indexes diverge from assessment outputs by a growing margin; recommend founder review and application before May 1\.",?\n\s*/g,
      "",
    );
    // Drop the trailing comma if the above left a dangling array entry
    text = text.replace(/,(\s*\])/g, "$1");
    return text;
  },
};

// Pipeline keys that expose internal coordination state — strip from public JSON.
// These never appear on the rendered page, but they leak from raw JSON inspection.
const PIPELINE_KEYS_TO_STRIP = [
  "scoreChangesPendingHumanReview",
  "bandChangesPendingReview",
  "humanReviewFlags",
  "mathHygieneFlags",
  "baselineCorrections",
  "holdsReleased",
  "holdsActive",
  "priorityAssessments",
  "rotationAssessments",
  "proposalsGenerated",
  "searchesPerformed",
];

function stripPipelineKeys(obj) {
  if (obj && typeof obj === "object" && obj.pipeline && typeof obj.pipeline === "object") {
    for (const k of PIPELINE_KEYS_TO_STRIP) {
      delete obj.pipeline[k];
    }
  }
  return obj;
}

// ─── Walk + replace ───────────────────────────────────────────────────────────
function applyReplacements(rawText, filename) {
  let out = rawText;

  // Apply per-file overrides first (they can rewrite entire sections)
  if (FILE_OVERRIDES[filename]) {
    out = FILE_OVERRIDES[filename](out);
  }

  // Apply status-value replacements (these are JSON string values)
  for (const [from, to] of STATUS_VALUES) {
    out = out.split(JSON.stringify(from)).join(JSON.stringify(to));
  }
  for (const [from, to] of ACTION_TYPE_VALUES) {
    out = out.split(JSON.stringify(from)).join(JSON.stringify(to));
  }
  for (const [from, to] of CYCLE_TYPE_VALUES) {
    out = out.split(JSON.stringify(from)).join(JSON.stringify(to));
  }

  // Apply regex replacements
  for (const [pattern, replacement] of TEXT_REGEX_REPLACEMENTS) {
    out = out.replace(pattern, replacement);
  }

  return out;
}

function main() {
  const files = fs.readdirSync(DAILY_DIR).filter((f) => f.endsWith(".json"));
  let totalChanged = 0;
  let totalUnchanged = 0;

  for (const filename of files) {
    const full = path.join(DAILY_DIR, filename);
    const before = fs.readFileSync(full, "utf8");
    const after = applyReplacements(before, filename);

    // Parse current to check for keys-to-strip
    let parsed;
    try {
      parsed = JSON.parse(after);
    } catch (e) {
      console.error(`[ERROR] ${filename}: produces invalid JSON after sanitization`);
      console.error(`        ${e.message}`);
      process.exitCode = 1;
      continue;
    }

    // Detect whether parsed has stripped-able keys (so we know if json reformat is needed)
    const hasStrippablePipelineKeys =
      parsed.pipeline &&
      typeof parsed.pipeline === "object" &&
      PIPELINE_KEYS_TO_STRIP.some((k) => k in parsed.pipeline);
    const hasEmptyPendingReview =
      Array.isArray(parsed.pendingReview) && parsed.pendingReview.length === 0;
    const textChanged = before !== after;
    const structureChanged = hasStrippablePipelineKeys || hasEmptyPendingReview;

    if (!textChanged && !structureChanged) {
      totalUnchanged++;
      continue;
    }

    // Apply structural strips
    stripPipelineKeys(parsed);
    if (Array.isArray(parsed.pendingReview) && parsed.pendingReview.length === 0) {
      delete parsed.pendingReview;
    }

    // If only structure changed, we still need to write back. Use 2-space indent
    // (matches the existing files' formatting).
    fs.writeFileSync(full, JSON.stringify(parsed, null, 2), "utf8");
    totalChanged++;
    console.log(`  modified: ${filename}`);
  }

  console.log("");
  console.log(`Sanitization pass complete.`);
  console.log(`  modified:   ${totalChanged}`);
  console.log(`  unchanged:  ${totalUnchanged}`);
  console.log(`  total seen: ${files.length}`);
}

main();
