#!/usr/bin/env node
/**
 * apply-entity-record.mjs — Proposal-to-Entity-Record Writer (Step 9 / §10)
 *
 * Given an approved change-proposal containing `proposed_subdimensions`, writes
 * or replaces the canonical entity record at
 *   site/src/data/entity-records/<slug>.json
 *
 * USAGE
 *   node site/scripts/apply-entity-record.mjs --from-proposal <path.json>
 *   node site/scripts/apply-entity-record.mjs --from-proposal <path.json> \
 *         --out-path <output.json>
 *
 * DESIGN (standalone vs extending build-entity-records.mjs)
 *   Standalone.  build-entity-records.mjs is a bulk batch processor with
 *   assessment-prose parsing, dry-run/apply modes, multi-index scanning,
 *   and cumulative reporting — none of which apply here.  This script has a
 *   narrow, single-entity purpose: approved proposal → write one record
 *   deterministically.  Both scripts share the same canonical constants
 *   (DIMENSIONS_MAP, ASSESSOR_OVERRIDE_NAMES, INDEX_FILE_MAP) as inline copies
 *   with source references, following the existing pattern already established
 *   by validate-indexes.mjs.
 *
 * BACKWARD COMPATIBILITY
 *   Proposals without `proposed_subdimensions` fall back to full reconstruction
 *   from the index dimension scores — transition-safe, same behavior as
 *   build-entity-records.mjs for entities with no assessment.
 *
 * INVARIANCE ENFORCEMENT
 *   G1  record.composite/band/rank == index values (copied verbatim after
 *       score-updater has applied the proposal to the index).
 *   G2  round(mean(subdims_k), 2) == index.scores[k] for all 8 dimensions.
 *       For any dimension where all 5 proposed subdims are present, G2 must
 *       hold — the script REFUSES (never falls back to reconstruction) because
 *       the proposal explicitly asserts those scores produce the target mean.
 *       For reconstructed dimensions G2 is trivially satisfied.
 *   G3  compositeCore(derivedDims).final within tolerance OR composite_override
 *       set.  If |diff| > 2.0 AND entity NOT in ASSESSOR_OVERRIDE_NAMES the
 *       script REFUSES (that would cause an ERROR in check 16).
 *
 * TEST ESCAPE HATCH (non-production only)
 *   Proposal may include `_test_index_row` with
 *   { name, slug?, composite, band, rank, scores{8 dims} } when the entity does
 *   not exist in any live index.  A prominent WARN is emitted.
 *   For production use with a real entity this field must be absent.
 *
 * DOWNSTREAM REQUIREMENT (score-updater contract, §B)
 *   After writing the record, score-updater must run:
 *     node site/scripts/validate-indexes.mjs
 *   and require 0 errors before declaring the apply complete.
 *
 * Architecture: docs/ARCHITECTURE_SUBDIMENSIONS.md §10
 * Data model:   docs/DATA_MODEL_SUBDIMENSIONS.md §3
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve, join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import { computeCompositeFromDimensions } from "./lib/scoring.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SITE_ROOT  = resolve(__dirname, "..");
const REPO_ROOT  = resolve(SITE_ROOT, "..");
const ENTITY_RECORDS_DIR = join(SITE_ROOT, "src", "data", "entity-records");

// ── Git SHA ───────────────────────────────────────────────────────────────────

let GIT_SHA = "unknown";
try {
  GIT_SHA = execSync("git rev-parse --short HEAD", { encoding: "utf8", cwd: REPO_ROOT }).trim();
} catch { /* non-fatal */ }

// ── Constants (inline mirrors — kept in sync with build-entity-records.mjs) ──

const SCHEMA_VERSION      = "records/v2";
const METHODOLOGY_VERSION = "v1.2";
const DIMENSION_CODES     = ["AWR", "EMP", "ACT", "EQU", "BND", "ACC", "SYS", "INT"];

// G3 tolerance: matches validate-indexes.mjs check 10 "warn" threshold.
const G3_TOLERANCE = 1.0;

/**
 * ASSESSOR_OVERRIDE_NAMES — exact copy of the set in validate-indexes.mjs and
 * build-entity-records.mjs.  That set is the canonical allowlist; this copy is
 * read-only.  If the allowlist is updated in validate-indexes.mjs, also update
 * here and in build-entity-records.mjs (three copies stay in sync).
 */
const ASSESSOR_OVERRIDE_NAMES = new Set([
  "Venezuela", "Alphabet/Google", "Anthropic", "Character AI",
  "GEO Group", "Core Civic", "Walt Disney", "Pfizer", "Saudi Arabia",
  "State Street", "Abbott Laboratories", "Microsoft", "Nucor", "Ecolab",
  "Iceland", "Finland", "Denmark", "Luxembourg", "Sweden", "Norway",
  "Germany", "New Zealand",
  "Vermont", "Minnesota",
  "Hugging Face", "Becton Dickinson",
  "Slovakia", "TIAA",
  "Turkey",
]);

/**
 * 8 dimensions × 5 subdimensions = 40 subdims.
 * Mirror of DIMENSIONS_MAP in build-entity-records.mjs and dimensions.ts.
 */
const DIMENSIONS_MAP = [
  { code: "AWR", name: "Awareness", subdims: [
    { code: "A1",  name: "Suffering Detection" },
    { code: "A2",  name: "Contextual Sensitivity" },
    { code: "A3",  name: "Blind Spot Mitigation" },
    { code: "A4",  name: "Signal Amplification" },
    { code: "A5",  name: "Anticipatory Awareness" },
  ]},
  { code: "EMP", name: "Empathy", subdims: [
    { code: "E1",  name: "Affective Resonance" },
    { code: "E2",  name: "Perspective-Taking" },
    { code: "E3",  name: "Non-Judgment" },
    { code: "E4",  name: "Validation" },
    { code: "E5",  name: "Cultural Empathy" },
  ]},
  { code: "ACT", name: "Action", subdims: [
    { code: "AC1", name: "Responsiveness" },
    { code: "AC2", name: "Proportionality" },
    { code: "AC3", name: "Efficacy" },
    { code: "AC4", name: "Resource Mobilization" },
    { code: "AC5", name: "Follow-Through" },
  ]},
  { code: "EQU", name: "Equity", subdims: [
    { code: "EQ1", name: "Universality" },
    { code: "EQ2", name: "Priority for Vulnerable" },
    { code: "EQ3", name: "Bias Awareness" },
    { code: "EQ4", name: "Access Design" },
    { code: "EQ5", name: "Historical Harm Acknowledgment" },
  ]},
  { code: "BND", name: "Boundaries", subdims: [
    { code: "B1",  name: "Self-Sustainability" },
    { code: "B2",  name: "Autonomy Preservation" },
    { code: "B3",  name: "Scope Clarity" },
    { code: "B4",  name: "Refusal Ethics" },
    { code: "B5",  name: "Consent Orientation" },
  ]},
  { code: "ACC", name: "Accountability", subdims: [
    { code: "AB1", name: "Harm Acknowledgment" },
    { code: "AB2", name: "Correction Willingness" },
    { code: "AB3", name: "Transparency" },
    { code: "AB4", name: "Systemic Learning" },
    { code: "AB5", name: "Reparative Action" },
  ]},
  { code: "SYS", name: "Systemic Thinking", subdims: [
    { code: "S1",  name: "Root Cause Orientation" },
    { code: "S2",  name: "Long-Term Impact" },
    { code: "S3",  name: "Interconnection Awareness" },
    { code: "S4",  name: "Structural Critique" },
    { code: "S5",  name: "Coalitional Compassion" },
  ]},
  { code: "INT", name: "Integrity", subdims: [
    { code: "I1",  name: "Consistency Under Pressure" },
    { code: "I2",  name: "Non-Performance" },
    { code: "I3",  name: "Internal Consistency" },
    { code: "I4",  name: "Values Alignment" },
    { code: "I5",  name: "Resilience of Care" },
  ]},
];

// Fast lookup tables derived from DIMENSIONS_MAP.
const SUBDIM_NAMES     = {}; // subdim code → canonical name
const CODE_TO_DIM      = {}; // subdim code → parent dim code
const DIM_SUBDIM_CODES = {}; // dim code → [subdim codes in order]

for (const dim of DIMENSIONS_MAP) {
  DIM_SUBDIM_CODES[dim.code] = dim.subdims.map((sd) => sd.code);
  for (const sd of dim.subdims) {
    SUBDIM_NAMES[sd.code]  = sd.name;
    CODE_TO_DIM[sd.code]   = dim.code;
  }
}

/**
 * Map from proposal `index` field to { file, indexSlug, kind }.
 * Mirrors INDEX_FILES in build-entity-records.mjs exactly.
 */
const INDEX_FILE_MAP = {
  "fortune-500":    { file: "fortune-500.json",    indexSlug: "fortune-500",    kind: "company"       },
  "countries":      { file: "countries.json",       indexSlug: "countries",      kind: "country"       },
  "us-states":      { file: "us-states.json",       indexSlug: "us-states",      kind: "us-state"      },
  "ai-labs":        { file: "ai-labs.json",          indexSlug: "ai-labs",        kind: "ai-lab"        },
  "robotics-labs":  { file: "robotics-labs.json",   indexSlug: "robotics-labs",  kind: "robotics-lab"  },
  "global-cities":  { file: "global-cities.json",   indexSlug: "global-cities",  kind: "city"          },
  "us-cities":      { file: "us-cities.json",        indexSlug: "us-cities",      kind: "us-city"       },
  "universities":   { file: "universities.json",     indexSlug: "universities",   kind: "university"    },
};

// ── Utilities ─────────────────────────────────────────────────────────────────

/** URL-safe kebab-case slug. Mirrors slugify in build-entity-records.mjs. */
function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Normalize band to Title Case. Mirrors normalizeBand in build-entity-records.mjs. */
function normalizeBand(raw) {
  const b = String(raw).toLowerCase();
  if (b.startsWith("exempl"))  return "Exemplary";
  if (b.startsWith("establ"))  return "Established";
  if (b.startsWith("funct"))   return "Functional";
  if (b.startsWith("devel"))   return "Developing";
  if (b.startsWith("crit"))    return "Critical";
  return raw;
}

/**
 * Round to 2 decimal places — canonical subdim→dimension mean rounding.
 * ARCHITECTURE §8.1.
 */
function round2(v) {
  return Math.round(v * 100) / 100;
}

// ── CLI flag parsing ──────────────────────────────────────────────────────────

const args = process.argv.slice(2);

function getArg(flag) {
  const idx = args.indexOf(flag);
  return idx !== -1 ? args[idx + 1] : null;
}

const PROPOSAL_PATH = getArg("--from-proposal");
const OUT_PATH      = getArg("--out-path");      // optional: write to this path instead

if (!PROPOSAL_PATH) {
  console.error("[apply-entity-record] ERROR: --from-proposal <path> is required");
  process.exit(1);
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const generatedAt = new Date().toISOString();

  console.log(`\n[apply-entity-record] ${generatedAt}`);
  console.log(`[apply-entity-record] Proposal: ${PROPOSAL_PATH}`);
  if (OUT_PATH) {
    console.log(`[apply-entity-record] Output override: ${OUT_PATH}`);
  }

  // ── 1. Load and validate proposal ────────────────────────────────────────────

  let proposal;
  try {
    proposal = JSON.parse(readFileSync(PROPOSAL_PATH, "utf8"));
  } catch (err) {
    bail(`Cannot read/parse proposal: ${err.message}`);
  }

  // Required proposal fields.
  const requiredFields = ["entity", "slug", "index", "proposed_scores"];
  for (const f of requiredFields) {
    if (proposal[f] == null) bail(`Proposal missing required field: ${f}`);
  }

  if (proposal.status && proposal.status !== "approved") {
    bail(
      `Proposal status is "${proposal.status}" — only "approved" proposals may be applied. ` +
      `Set status to "approved" in the proposal file and re-run.`
    );
  }

  const { index: indexKey } = proposal;
  const indexMeta = INDEX_FILE_MAP[indexKey];
  if (!indexMeta) {
    bail(`Unknown proposal.index value: "${indexKey}". ` +
         `Valid values: ${Object.keys(INDEX_FILE_MAP).join(", ")}`);
  }

  const { file: indexFile, indexSlug, kind } = indexMeta;

  // ── 2. Locate entity in live index (or use _test_index_row) ─────────────────

  let entityRow; // { name, slug?, composite, band, rank, scores{8 dims} }
  let resolvedSlug; // final slug after disambiguation

  if (proposal._test_index_row) {
    // TEST ESCAPE HATCH: bypass live index lookup.
    // For unit-testing only — never present in production proposals.
    console.warn(
      "\n[apply-entity-record] WARN: _test_index_row present — using test data, " +
      "bypassing live index lookup. NOT for production use.\n"
    );
    entityRow = proposal._test_index_row;
    resolvedSlug = entityRow.slug ?? slugify(entityRow.name);
  } else {
    const indexPath = join(SITE_ROOT, "src", "data", "indexes", indexFile);
    let indexData;
    try {
      indexData = JSON.parse(readFileSync(indexPath, "utf8"));
    } catch (err) {
      bail(`Cannot read index file ${indexFile}: ${err.message}`);
    }

    const rankings = indexData.rankings ?? [];

    // Build intra-index slug disambiguation map (mirrors build-entity-records.mjs exactly).
    const slugCounts = new Map();
    for (const row of rankings) {
      const base = row.slug ?? slugify(row.name);
      slugCounts.set(base, (slugCounts.get(base) ?? 0) + 1);
    }

    const slugUsage = new Map();

    // Search for the entity by name (proposal.entity), computing its
    // disambiguated slug along the way.
    entityRow    = null;
    resolvedSlug = null;

    for (const row of rankings) {
      const baseSlug = row.slug ?? slugify(row.name);
      let rowSlug = baseSlug;
      if ((slugCounts.get(baseSlug) ?? 0) > 1) {
        const used = slugUsage.get(baseSlug) ?? 0;
        slugUsage.set(baseSlug, used + 1);
        rowSlug = used === 0 ? baseSlug : `${baseSlug}-${row.rank}`;
      }

      if (row.name === proposal.entity) {
        entityRow    = row;
        resolvedSlug = rowSlug;
        break;
      }
    }

    if (!entityRow) {
      bail(
        `Entity "${proposal.entity}" not found in ${indexFile}. ` +
        `The score-updater must apply the proposal to the index before running this script, ` +
        `OR if the entity name in the proposal differs from the index, fix the proposal.`
      );
    }

    // Cross-check: verify that the current index composite matches what the
    // proposal expects (i.e. score-updater has already been run).
    // This is an advisory warning, not a blocker — the record is anchored to
    // the current index value regardless.
    const proposedComposite = proposal.proposed_scores?.composite;
    if (proposedComposite != null && Math.abs(entityRow.composite - proposedComposite) > 0.5) {
      console.warn(
        `[apply-entity-record] WARN: index.composite (${entityRow.composite}) differs from ` +
        `proposal.proposed_scores.composite (${proposedComposite}) by > 0.5 pt. ` +
        `Did score-updater apply the proposal to the index before running this script?`
      );
    }
  }

  const { name, scores, composite, band, rank } = entityRow;

  console.log(
    `[apply-entity-record] Entity: ${name}  slug: ${resolvedSlug}  ` +
    `index: ${indexSlug}  composite: ${composite}  rank: ${rank}`
  );

  // ── 3. Process proposed_subdimensions ─────────────────────────────────────

  const proposedSubdims = proposal.proposed_subdimensions;
  const hasProposedSubdims = Array.isArray(proposedSubdims) && proposedSubdims.length > 0;

  if (!hasProposedSubdims) {
    console.log(
      "[apply-entity-record] No proposed_subdimensions in proposal — " +
      "falling back to full reconstruction from index dimension scores (backward-compatible)."
    );
  }

  // Build a lookup: subdim code → proposed subdim entry.
  const proposedByCode = {};
  if (hasProposedSubdims) {
    for (const sd of proposedSubdims) {
      if (sd.code) proposedByCode[sd.code] = sd;
    }
  }

  // Validate proposed subdim scores are in-range.
  const outOfRangeSubdims = [];
  for (const [code, sd] of Object.entries(proposedByCode)) {
    const s = sd.score;
    const indexDimScore = scores[CODE_TO_DIM[code]];
    const allowZero = (indexDimScore === 0);
    if (typeof s !== "number" || (!allowZero && (s < 1.0 || s > 5.0)) || (allowZero && s !== 0 && (s < 1.0 || s > 5.0))) {
      outOfRangeSubdims.push(`${code}: score=${s}`);
    }
  }
  if (outOfRangeSubdims.length > 0) {
    bail(
      `proposed_subdimensions contain out-of-range scores: ${outOfRangeSubdims.join(", ")}. ` +
      `Scores must be in [1.0, 5.0] (or exactly 0 when the index dimension is 0 — harm floor).`
    );
  }

  // ── 4. Build subdimension array (assessed or reconstructed per dimension) ───

  const subdimensions   = [];
  const dimResults      = {}; // dimCode → 'assessed' | 'reconstructed'
  const g2Errors        = []; // fatal: proposed subdims that fail G2
  const g2Warnings      = []; // unexpected G2 issues (should not occur)

  const fallbackDate       = proposal.assessment_date ?? null;
  const fallbackConfidence = proposal.confidence ?? "medium";
  const assessmentFile     = proposal.assessment_file ?? null;

  for (const dim of DIMENSIONS_MAP) {
    const dimCode      = dim.code;
    const indexDimScore = scores[dimCode];

    // Collect proposed subdims for this dimension (in canonical order).
    const proposedForDim = DIM_SUBDIM_CODES[dimCode].map(
      (code) => proposedByCode[code] ?? null
    );
    const allPresent = proposedForDim.every((sd) => sd !== null);

    let useProposed = false;

    if (allPresent) {
      // All 5 proposed subdims present for this dimension.
      // G2 check: round(mean, 2) must equal index dim score.
      const sum         = proposedForDim.reduce((s, sd) => s + sd.score, 0);
      const mean        = sum / 5;
      const roundedMean = round2(mean);

      if (Math.abs(roundedMean - indexDimScore) < 1e-9) {
        useProposed = true;
      } else {
        // G2 failure for a proposed dimension → REFUSE (not fallback to reconstruct).
        // The proposal explicitly asserts these subdim scores produce the target
        // dimension mean; if they don't, the proposal itself is inconsistent.
        g2Errors.push({
          dim: dimCode,
          proposedScores:  proposedForDim.map((sd) => sd.score),
          proposedMean:    roundedMean,
          indexScore:      indexDimScore,
          diff:            Math.abs(roundedMean - indexDimScore),
        });
        // Fall through to reconstruction for this dimension so the record can be
        // diagnosed, but we will REFUSE to write below.
      }
    }
    // Partial presence (1–4 proposed subdims): fall back to reconstruction.
    // This is valid — the proposal only needs to cover changed dimensions.

    if (useProposed) {
      // Use proposed subdim scores from the proposal.
      for (let i = 0; i < 5; i++) {
        const sd = proposedForDim[i];
        subdimensions.push({
          code:          sd.code,
          dimension:     dimCode,
          name:          SUBDIM_NAMES[sd.code],
          score:         sd.score,
          confidence:    sd.confidence ?? fallbackConfidence,
          assessed_date: sd.assessed_date ?? fallbackDate,
          subdims_source: "assessed",
          evidence:      Array.isArray(sd.evidence) ? sd.evidence : [],
        });
      }
      dimResults[dimCode] = "assessed";

    } else {
      // Reconstruct: all five subdims set equal to the published dimension value.
      // mean(five equal values) == indexDimScore exactly — G2 trivially satisfied.
      // ARCHITECTURE §7.5: "set all five subdims equal to index.scores[k]".
      for (const sd of dim.subdims) {
        subdimensions.push({
          code:          sd.code,
          dimension:     dimCode,
          name:          sd.name,
          score:         indexDimScore,  // preserves 0 for harm floor
          confidence:    "low",
          assessed_date: null,
          subdims_source: "reconstructed",
          evidence:      [],
        });
      }
      dimResults[dimCode] = "reconstructed";
    }
  }

  // ── 5. Derive dimensions (G2 check) ─────────────────────────────────────────

  const dimensions  = {};
  const g2FailedDims = []; // G2 violated for reconstructed dims (script bug guard)

  for (const dim of DIMENSIONS_MAP) {
    const dimCode      = dim.code;
    const dimSubdims   = subdimensions.filter((sd) => sd.dimension === dimCode);
    const indexScore   = scores[dimCode];

    let derivedDim;

    if (dimResults[dimCode] === "reconstructed") {
      // Five equal values: mean is exact — use index value verbatim to avoid
      // any floating-point rounding artifact (ARCHITECTURE §8.3).
      derivedDim = indexScore;
    } else {
      // Assessed dimension: integer or decimal scores from proposed_subdimensions.
      const sum = dimSubdims.reduce((s, sd) => s + sd.score, 0);
      derivedDim = round2(sum / 5);
    }

    dimensions[dimCode] = derivedDim;

    if (Math.abs(derivedDim - indexScore) > 1e-9) {
      g2FailedDims.push({ dim: dimCode, derived: derivedDim, index: indexScore });
    }
  }

  // ── 6. Pre-flight validation — refuse on fatal errors ────────────────────────

  const errors   = [];
  const warnings = [];

  // G2 errors from proposed subdims (inconsistent proposal).
  if (g2Errors.length > 0) {
    for (const e of g2Errors) {
      errors.push(
        `G2 FAIL (dim ${e.dim}): proposed subdim mean=${e.proposedMean} ` +
        `!= index.scores[${e.dim}]=${e.indexScore} (diff=${e.diff.toExponential(2)}). ` +
        `Fix the proposed_subdimensions so their mean equals the target dimension score.`
      );
    }
  }

  // G2 guard for reconstruction (should never happen — indicates a script bug).
  if (g2FailedDims.length > 0) {
    for (const f of g2FailedDims) {
      errors.push(
        `G2 SCRIPT BUG (dim ${f.dim}): derived=${f.derived} != index=${f.index}. ` +
        `Please report this as a bug in apply-entity-record.mjs.`
      );
    }
  }

  // Check 13 — structure: exactly 40 subdims.
  if (subdimensions.length !== 40) {
    errors.push(`[13] Expected 40 subdimensions, got ${subdimensions.length}`);
  }

  // Check 13 — each subdim: valid code, parent dim, name, score range.
  for (const sd of subdimensions) {
    const expectedDim  = CODE_TO_DIM[sd.code];
    const expectedName = SUBDIM_NAMES[sd.code];
    if (!expectedDim) {
      errors.push(`[13] Invalid subdim code: "${sd.code}"`);
    } else if (sd.dimension !== expectedDim) {
      errors.push(`[13] Subdim "${sd.code}" dimension="${sd.dimension}" expected "${expectedDim}"`);
    } else if (sd.name !== expectedName) {
      errors.push(`[13] Subdim "${sd.code}" name="${sd.name}" expected "${expectedName}"`);
    }
    const s = sd.score;
    const indexDimScore = scores[sd.dimension];
    const allowZero = (indexDimScore === 0);
    if (typeof s !== "number" || (s !== 0 && (s < 1.0 || s > 5.0))) {
      if (!(allowZero && s === 0)) {
        errors.push(`[13] Subdim "${sd.code}" score=${s} out of range [1.0,5.0] (or 0 harm floor)`);
      }
    }
  }

  // G3 — derived composite vs published composite (check 16 equivalent).
  const derivedResult    = computeCompositeFromDimensions(dimensions);
  const derivedComposite = derivedResult.composite;
  const g3Diff           = Math.abs(derivedComposite - composite);
  const isOverride       = ASSESSOR_OVERRIDE_NAMES.has(name);

  // composite_override: set for override entities (always) or when formula diverges
  // beyond tolerance. Mirrors build-entity-records.mjs semantics exactly.
  const needsCompositeOverride = isOverride || g3Diff > G3_TOLERANCE;
  const compositeOverride      = needsCompositeOverride ? composite : null;

  // Check 16 ERROR condition (would cause validate-indexes error):
  // diff > 2.0 AND entity NOT in ASSESSOR_OVERRIDE_NAMES → REFUSE.
  if (g3Diff > 2.0 && !isOverride) {
    errors.push(
      `[16/G3] Derived composite ${derivedComposite.toFixed(1)} differs from ` +
      `published ${composite} by ${g3Diff.toFixed(1)} pt (> 2.0) and entity is NOT in ` +
      `ASSESSOR_OVERRIDE_NAMES. This would cause an ERROR in validate-indexes check 16. ` +
      `Either the proposed_subdimensions do not match the applied index scores, ` +
      `or this entity belongs in ASSESSOR_OVERRIDE_NAMES (coordinate with validate-indexes.mjs).`
    );
  } else if (g3Diff > 1.0 || (g3Diff > 0.5 && isOverride)) {
    warnings.push(
      `[16/G3] Derived composite ${derivedComposite.toFixed(1)} differs from ` +
      `published ${composite} by ${g3Diff.toFixed(1)} pt. ` +
      `composite_override has been set. Validator will WARN (not error).`
    );
  }

  // Check 15 — G1 (always satisfied by construction, guard against implementation bugs).
  // record.composite == index.composite: YES (we copy it verbatim).
  // record.rank == index.rank: YES (we copy it verbatim).

  // Check 16 — override_names cross-check.
  // If entity IS in ASSESSOR_OVERRIDE_NAMES, composite_override must be set.
  // By construction above: needsCompositeOverride = true for override entities → compositeOverride != null.
  // (No additional check needed here; the logic above guarantees this.)

  // ── 7. Report errors and refuse if any ──────────────────────────────────────

  if (warnings.length > 0) {
    for (const w of warnings) {
      console.warn(`[apply-entity-record] WARN: ${w}`);
    }
  }

  if (errors.length > 0) {
    console.error(`\n[apply-entity-record] REFUSED — ${errors.length} error(s) found:\n`);
    for (const e of errors) {
      console.error(`  ERROR: ${e}`);
    }
    console.error(
      `\n[apply-entity-record] No record was written. Fix the errors above and re-run.\n`
    );
    process.exit(1);
  }

  // ── 8. Assemble record ───────────────────────────────────────────────────────

  const anyAssessed = Object.values(dimResults).some((v) => v === "assessed");

  const record = {
    schema_version:      SCHEMA_VERSION,
    methodology_version: METHODOLOGY_VERSION,
    slug:                resolvedSlug,
    name,
    index_slug:          indexSlug,
    kind,
    composite,                       // G1: verbatim from index
    band:                normalizeBand(band),  // G1: verbatim (normalized case)
    rank,                            // G1: verbatim from index
    composite_override:  compositeOverride,
    dimensions,                      // derived: round(mean(subdims), 2) per dim
    subdimensions,                   // 40 entries: assessed | reconstructed
    source_assessment:   assessmentFile,
    subdims_source:      anyAssessed ? "assessed" : "reconstructed",
    generated_at:        generatedAt,
    generator:           `apply-entity-record.mjs@${GIT_SHA}`,
  };

  // ── 9. Write record ──────────────────────────────────────────────────────────

  const outPath = OUT_PATH
    ? resolve(OUT_PATH)                                     // test override
    : join(ENTITY_RECORDS_DIR, `${resolvedSlug}.json`);    // canonical

  if (!OUT_PATH) {
    mkdirSync(ENTITY_RECORDS_DIR, { recursive: true });
  } else {
    // For --out-path, ensure the parent directory exists.
    const outDir = outPath.substring(0, Math.max(outPath.lastIndexOf("/"), outPath.lastIndexOf("\\")));
    if (outDir) mkdirSync(outDir, { recursive: true });
  }

  writeFileSync(outPath, JSON.stringify(record, null, 2));

  // ── 10. Success summary ──────────────────────────────────────────────────────

  const assessedDims      = Object.values(dimResults).filter((v) => v === "assessed").length;
  const reconstructedDims = Object.values(dimResults).filter((v) => v === "reconstructed").length;

  const sep = "─".repeat(70);
  console.log(`\n${sep}`);
  console.log(`APPLY-ENTITY-RECORD — SUCCESS`);
  console.log(sep);
  console.log(`Entity:           ${name}`);
  console.log(`Slug:             ${resolvedSlug}`);
  console.log(`Index:            ${indexSlug}`);
  console.log(`Record written:   ${outPath}`);
  console.log(`composite:        ${composite}  band: ${normalizeBand(band)}  rank: ${rank}`);
  console.log(`composite_override: ${compositeOverride ?? "null"}`);
  console.log(`subdims_source:   ${record.subdims_source}`);
  console.log(`  Assessed dims:      ${assessedDims}  (${
    Object.entries(dimResults).filter(([,v]) => v === "assessed").map(([k]) => k).join(", ") || "none"
  })`);
  console.log(`  Reconstructed dims: ${reconstructedDims}`);
  console.log(`G1: PASS (composite/band/rank copied verbatim from index)`);
  console.log(`G2: PASS (all dimension means match index scores within 1e-9)`);
  console.log(
    `G3: ${g3Diff <= G3_TOLERANCE ? "PASS" : "WARN"} ` +
    `(derivedComposite=${derivedComposite.toFixed(1)}, published=${composite}, ` +
    `diff=${g3Diff.toFixed(4)})`
  );
  if (warnings.length > 0) {
    console.log(`Warnings:         ${warnings.length}`);
  }
  console.log(sep);
  console.log(
    `\n[apply-entity-record] NEXT STEP: run "node site/scripts/validate-indexes.mjs" ` +
    `and confirm 0 errors.\n`
  );
}

// ── Error helpers ─────────────────────────────────────────────────────────────

function bail(message) {
  console.error(`\n[apply-entity-record] FATAL: ${message}\n`);
  process.exit(1);
}

// ── Entry point ───────────────────────────────────────────────────────────────

main().catch((err) => {
  console.error("[apply-entity-record] Fatal error:", err);
  process.exit(1);
});
