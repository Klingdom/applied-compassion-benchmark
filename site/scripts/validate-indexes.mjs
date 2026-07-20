#!/usr/bin/env node

/**
 * validate-indexes.mjs — Data integrity checks for all index JSON files.
 *
 * Validates:
 *  1. JSON parses correctly
 *  2. Required meta fields present and typed
 *  3. Required ranking fields present per index
 *  4. All 8 dimension codes present in every entity's scores
 *  5. Score ranges: raw 1-5, composite 0-100
 *  6. Rank contiguity (1..n with no gaps or duplicates)
 *  7. meta.entityCount matches rankings.length (with known exceptions)
 *  8. Band counts sum to meta.entityCount (with known exceptions)
 *  9. Band name/range validity
 * 10. Composite score approximately equals mean of scaled dimension scores
 * 11. Band assignment matches composite score
 *
 * Known data characteristics:
 *  - US States: COMPLETE as of 2026-07-19 (all 51, evidence-based, ranks 1-51)
 *    Band counts reflect the full 51-state distribution.
 *
 * Exit code 0 = all checks pass, 1 = failures found.
 */

import { readFileSync, readdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import {
  DIMENSION_CODES,
  computeCompositeFromDimensions as computeCompositeFromDimensionsCanonical,
} from "./lib/scoring.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const INDEXES_DIR = join(__dirname, "..", "src", "data", "indexes");
const ENTITY_RECORDS_DIR = join(__dirname, "..", "src", "data", "entity-records");

// Wraps the canonical scoring function to return just the composite number
// (validate-indexes.mjs only compares the composite field, not the band).
function computeCompositeFromDimensions(scores) {
  return computeCompositeFromDimensionsCanonical(scores).composite;
}

// Band boundaries use integer ranges. Composites are decimals, so we use
// strict ranges for clear violations and a 1-point tolerance zone at
// each boundary for warnings (legacy data has inconsistent boundary assignment).
// CORRECTED 2026-07-19. computeCompositeFromDimensions assigns bands on
// EXCLUSIVE upper thresholds (>20, >40, >60, >80), so a composite of 40.6 is
// Functional and 60.6 is Established. The legacy integer labels ("21-40",
// "41-60", "61-80", "81-100") contradict that for scores in the gap.
//
// us-states.json was rebuilt 2026-07-19 with corrected labels. The other 7
// index files still carry legacy labels, so BOTH forms are accepted here
// during the transition. Legacy labels are deprecated - see
// research/LEGACY_INDEX_DEFECTS_2026-07-19.md.
const VALID_BANDS = [
  { name: "Exemplary",   range: "80.1-100", legacyRange: "81-100", min: 80, max: 100 },
  { name: "Established", range: "60.1-80",  legacyRange: "61-80",  min: 60, max: 80 },
  { name: "Functional",  range: "40.1-60",  legacyRange: "41-60",  min: 40, max: 60 },
  { name: "Developing",  range: "20.1-40",  legacyRange: "21-40",  min: 20, max: 40 },
  { name: "Critical",    range: "0-20",     legacyRange: "0-20",   min: 0,  max: 20 },
];
const BAND_BOUNDARY_TOLERANCE = 1.0; // points of tolerance at band edges

// Known exceptions: files where rankings.length != meta.entityCount
// US States: 21 entries in rankings (ranks 9-38 missing from source HTML).
// meta.entityCount = 21 (matches rankings); band counts also reflect only
// the 21 published states. The full 51-state distribution is not currently
// published — when the missing 30 entries are backfilled, both entityCount
// and bandTotal should be updated to 51.
// us-states.json was COMPLETED 2026-07-19: all 51 jurisdictions assessed from
// evidence, true national ranks 1-51 assigned, placeholders replaced. It is no
// longer a partial index and its entry has been removed, as this block's
// original comment anticipated.
const KNOWN_PARTIAL = {};

// Entities whose composite was set by assessor judgment and intentionally
// diverges from the formula output. These are downgraded to warnings
// rather than errors in check 10 (composite-vs-formula).
//
// Categories:
//  - Top-band ceiling overrides (countries/states where the formula maxes
//    out near 100 but the assessor caps at a realistic ceiling reflecting
//    documented gaps that the dimension scores don't capture).
//  - Negative pressure overrides (assessor lowered composite below formula
//    to flag specific harm patterns or floor-adjacent risk).
//  - Positive override (assessor raised composite above formula to credit
//    documented integration premium that the formula's harm-flag logic
//    suppresses prematurely).
const ASSESSOR_OVERRIDE_NAMES = new Set([
  // Original cluster (negative-pressure overrides)
  "Venezuela",
  "Alphabet/Google",
  "Anthropic",
  "Character AI",
  "GEO Group",
  "Core Civic",
  "Walt Disney",
  "Pfizer",
  "Saudi Arabia",
  "State Street",
  "Abbott Laboratories",
  "Microsoft",
  "Nucor",
  "Ecolab",
  // Top-band ceiling overrides (countries) — formula → 84-98, assessor → 70-87
  "Iceland",
  "Finland",
  "Denmark",
  "Luxembourg",
  "Sweden",
  "Norway",
  "Germany",
  "New Zealand",
  // Top-band ceiling overrides (us-states)
  "Vermont",
  "Minnesota",
  // Mid-band assessor judgments
  "Hugging Face",
  "Becton Dickinson",
  // 2026-05-07 cycle — assessor judgment diverges from formula reconstruction
  // (carried until robotics-labs/countries math-hygiene formula audit completes)
  "Slovakia",
  "TIAA",
  // 2026-05-24 cycle — Turkey: physical-seizure-of-opposition-HQ second event;
  // assessor composite 15.1 diverges from formula (16.6) by 1.5pt per floor-proximity
  // conservative scoring discipline and second-event-at-floor convention.
  "Turkey",
]);

// ── Helpers for checks 12–16 ──────────────────────────────────────────────────

/**
 * Convert a name to URL-safe kebab-case slug.
 * Exact mirror of slugify in build-entity-records.mjs and export-public-data.mjs.
 */
function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Round to 2 decimal places — canonical subdim → dimension mean rounding
 * per ARCHITECTURE_SUBDIMENSIONS.md §8.1.
 */
function round2(v) {
  return Math.round(v * 100) / 100;
}

/**
 * 40 subdimensions in canonical order — mirrors dimensions.ts and
 * build-entity-records.mjs.  Used for check 13 (subdim structure validation).
 */
const DIMENSIONS_MAP_VALIDATOR = [
  { code: "AWR", subdims: [
    { code: "A1",  name: "Suffering Detection"            },
    { code: "A2",  name: "Contextual Sensitivity"         },
    { code: "A3",  name: "Blind Spot Mitigation"          },
    { code: "A4",  name: "Signal Amplification"           },
    { code: "A5",  name: "Anticipatory Awareness"         },
  ]},
  { code: "EMP", subdims: [
    { code: "E1",  name: "Affective Resonance"            },
    { code: "E2",  name: "Perspective-Taking"             },
    { code: "E3",  name: "Non-Judgment"                   },
    { code: "E4",  name: "Validation"                     },
    { code: "E5",  name: "Cultural Empathy"               },
  ]},
  { code: "ACT", subdims: [
    { code: "AC1", name: "Responsiveness"                 },
    { code: "AC2", name: "Proportionality"                },
    { code: "AC3", name: "Efficacy"                       },
    { code: "AC4", name: "Resource Mobilization"          },
    { code: "AC5", name: "Follow-Through"                 },
  ]},
  { code: "EQU", subdims: [
    { code: "EQ1", name: "Universality"                   },
    { code: "EQ2", name: "Priority for Vulnerable"        },
    { code: "EQ3", name: "Bias Awareness"                 },
    { code: "EQ4", name: "Access Design"                  },
    { code: "EQ5", name: "Historical Harm Acknowledgment" },
  ]},
  { code: "BND", subdims: [
    { code: "B1",  name: "Self-Sustainability"            },
    { code: "B2",  name: "Autonomy Preservation"          },
    { code: "B3",  name: "Scope Clarity"                  },
    { code: "B4",  name: "Refusal Ethics"                 },
    { code: "B5",  name: "Consent Orientation"            },
  ]},
  { code: "ACC", subdims: [
    { code: "AB1", name: "Harm Acknowledgment"            },
    { code: "AB2", name: "Correction Willingness"         },
    { code: "AB3", name: "Transparency"                   },
    { code: "AB4", name: "Systemic Learning"              },
    { code: "AB5", name: "Reparative Action"              },
  ]},
  { code: "SYS", subdims: [
    { code: "S1",  name: "Root Cause Orientation"         },
    { code: "S2",  name: "Long-Term Impact"               },
    { code: "S3",  name: "Interconnection Awareness"      },
    { code: "S4",  name: "Structural Critique"            },
    { code: "S5",  name: "Coalitional Compassion"         },
  ]},
  { code: "INT", subdims: [
    { code: "I1",  name: "Consistency Under Pressure"     },
    { code: "I2",  name: "Non-Performance"                },
    { code: "I3",  name: "Internal Consistency"           },
    { code: "I4",  name: "Values Alignment"               },
    { code: "I5",  name: "Resilience of Care"             },
  ]},
];

// Fast lookup tables derived from DIMENSIONS_MAP_VALIDATOR.
const SUBDIM_TO_DIM = {};     // subdim code → parent dim code
const SUBDIM_NAMES_MAP = {};  // subdim code → canonical name
for (const dim of DIMENSIONS_MAP_VALIDATOR) {
  for (const sd of dim.subdims) {
    SUBDIM_TO_DIM[sd.code] = dim.code;
    SUBDIM_NAMES_MAP[sd.code] = sd.name;
  }
}

// ---------------------------------------------------------------------------

// Required fields per index (common + index-specific)
const COMMON_FIELDS = ["rank", "name", "scores", "composite", "band"];
const INDEX_SPECIFIC_FIELDS = {
  "ai-labs.json": ["hq", "sector"],
  "countries.json": ["region"],
  "fortune-500.json": ["sector"], // f500Rank is optional
  "global-cities.json": ["country", "region"],
  "robotics-labs.json": ["country", "category"],
  "universities.json": ["country", "type"],
  "us-cities.json": ["state", "region"],
  "us-states.json": ["region"],
};

let totalErrors = 0;
let totalWarnings = 0;
let totalChecks = 0;

function error(file, msg) {
  console.error(`  ❌ ${file}: ${msg}`);
  totalErrors++;
}

function warn(file, msg) {
  console.warn(`  ⚠️  ${file}: ${msg}`);
  totalWarnings++;
}

function pass(count = 1) {
  totalChecks += count;
}

// ---------------------------------------------------------------------------

const files = readdirSync(INDEXES_DIR).filter((f) => f.endsWith(".json"));

if (files.length === 0) {
  console.error("No JSON files found in", INDEXES_DIR);
  process.exit(1);
}

console.log(`\nValidating ${files.length} index files in ${INDEXES_DIR}\n`);

for (const file of files) {
  const path = join(INDEXES_DIR, file);
  let data;

  // 1. Parse
  try {
    data = JSON.parse(readFileSync(path, "utf8"));
    pass();
  } catch (e) {
    error(file, `JSON parse failed: ${e.message}`);
    continue; // Can't validate further
  }

  // 2. Meta fields
  const meta = data.meta;
  if (!meta) {
    error(file, "Missing 'meta' object");
    continue;
  }
  for (const field of ["title", "year", "entityCount", "dimensions"]) {
    if (meta[field] === undefined) {
      error(file, `meta.${field} is missing`);
    } else {
      pass();
    }
  }
  if (typeof meta.entityCount !== "number" || meta.entityCount < 1) {
    error(file, `meta.entityCount must be a positive number, got ${meta.entityCount}`);
  } else {
    pass();
  }
  if (!Array.isArray(meta.dimensions) || meta.dimensions.length !== 8) {
    error(file, `meta.dimensions must have exactly 8 entries, got ${meta.dimensions?.length}`);
  } else {
    // Check all dimension codes present
    for (const code of DIMENSION_CODES) {
      if (!meta.dimensions.includes(code)) {
        error(file, `meta.dimensions missing code: ${code}`);
      } else {
        pass();
      }
    }
  }

  // 3. Rankings array
  if (!Array.isArray(data.rankings) || data.rankings.length === 0) {
    error(file, "Missing or empty 'rankings' array");
    continue;
  }

  const rankings = data.rankings;
  const requiredFields = [...COMMON_FIELDS, ...(INDEX_SPECIFIC_FIELDS[file] || [])];

  // Pre-scan: build intra-index slug disambiguation maps for checks 12–16.
  // Mirrors build-entity-records.mjs slug resolution exactly.
  const slugCounts12 = new Map();
  for (const row of rankings) {
    const base = row.slug ?? slugify(row.name);
    slugCounts12.set(base, (slugCounts12.get(base) ?? 0) + 1);
  }
  const slugUsage12 = new Map();

  for (const entity of rankings) {
    // Required fields
    for (const field of requiredFields) {
      if (entity[field] === undefined) {
        error(file, `Entity "${entity.name || "unknown"}" (rank ${entity.rank}) missing field: ${field}`);
      }
    }

    // 4. Dimension scores
    if (entity.scores && typeof entity.scores === "object") {
      for (const code of DIMENSION_CODES) {
        if (!(code in entity.scores)) {
          error(file, `"${entity.name}" missing dimension score: ${code}`);
        } else {
          const val = entity.scores[code];
          // 5. Score range: raw 1-5 (or 0 for edge cases like xAI at floor)
          if (typeof val !== "number" || val < 0 || val > 5) {
            error(file, `"${entity.name}" ${code}=${val} out of range [0,5]`);
          } else {
            pass();
          }
        }
      }
    }

    // 5b. Composite range
    if (typeof entity.composite !== "number" || entity.composite < 0 || entity.composite > 100) {
      error(file, `"${entity.name}" composite=${entity.composite} out of range [0,100]`);
    } else {
      pass();
    }

    // 10. Composite score matches canonical formula (computeCompositeFromDimensions)
    // Uses the full formula including integration premium — not just scaled mean.
    // Assessor-override entities are downgraded to warnings even with large diffs.
    if (entity.scores && typeof entity.composite === "number") {
      const dimValues = DIMENSION_CODES.map((c) => entity.scores[c]).filter((v) => typeof v === "number");
      if (dimValues.length === 8) {
        const scoreObj = Object.fromEntries(DIMENSION_CODES.map((c, i) => [c, dimValues[i]]));
        const calculated = computeCompositeFromDimensions(scoreObj);
        const diff = Math.abs(entity.composite - calculated);
        const isOverride = ASSESSOR_OVERRIDE_NAMES.has(entity.name);
        if (diff > 2.0 && !isOverride) {
          // Major discrepancy — likely a data error
          error(file, `"${entity.name}" composite=${entity.composite} vs formula=${calculated.toFixed(1)} (diff=${diff.toFixed(1)})`);
        } else if (diff > 1.0 || (diff > 0.5 && isOverride)) {
          // Moderate discrepancy — assessor override or rounding at band boundary
          warn(file, `"${entity.name}" composite=${entity.composite} vs formula=${calculated.toFixed(1)} (diff=${diff.toFixed(1)})`);
        } else {
          pass();
        }
      }
    }

    // 11. Band matches composite
    if (typeof entity.composite === "number" && entity.band) {
      const bandDef = VALID_BANDS.find((b) => b.name.toLowerCase() === entity.band.toLowerCase());
      if (!bandDef) {
        error(file, `"${entity.name}" has invalid band: "${entity.band}"`);
      } else {
        const c = entity.composite;
        const tol = BAND_BOUNDARY_TOLERANCE;
        if (c < bandDef.min - tol || c > bandDef.max + tol) {
          // Clearly wrong — composite is far outside the band range
          error(file, `"${entity.name}" composite=${c} doesn't match band "${entity.band}" (${bandDef.range})`);
        } else if (c < bandDef.min || c > bandDef.max) {
          // Within tolerance — boundary case (known issue in legacy data)
          warn(file, `"${entity.name}" composite=${c} is at band boundary for "${entity.band}" (${bandDef.range})`);
        } else {
          pass();
        }
      }
    }

    // ── Checks 12–16: entity record validation ────────────────────────────────
    // Resolve entity slug (mirrors build-entity-records.mjs exactly).
    const baseSlug12 = entity.slug ?? slugify(entity.name);
    let entitySlug12 = baseSlug12;
    if ((slugCounts12.get(baseSlug12) ?? 0) > 1) {
      const used12 = slugUsage12.get(baseSlug12) ?? 0;
      slugUsage12.set(baseSlug12, used12 + 1);
      entitySlug12 = used12 === 0 ? baseSlug12 : `${baseSlug12}-${entity.rank}`;
    }

    // Check 12 — record presence.
    // TRANSITION-AWARE: missing record emits a WARNING (not ERROR) during rollout.
    // After full backfill, flip to ERROR via --require-records (future flag).
    const recordPath12 = join(ENTITY_RECORDS_DIR, `${entitySlug12}.json`);
    if (!existsSync(recordPath12)) {
      warn(file, `[12] No entity record for "${entity.name}" (slug: ${entitySlug12})`);
    } else {
      let record12;
      try {
        record12 = JSON.parse(readFileSync(recordPath12, "utf8"));
      } catch (e) {
        error(file, `[12] Cannot parse entity record for "${entity.name}" (${entitySlug12}): ${e.message}`);
        record12 = null;
      }

      if (record12) {
        // Cross-index slug collision guard: if the record at this path belongs to a
        // different index (same slug collision across indexes), warn and skip 13–16.
        // Same behavior as export-public-data.mjs — last-written index wins.
        const currentIndexSlug = file.replace(/\.json$/, "");
        if (record12.index_slug !== currentIndexSlug) {
          warn(file, `[12] "${entity.name}" (${entitySlug12}): cross-index slug collision — ` +
            `record.index_slug="${record12.index_slug}" vs expected "${currentIndexSlug}", checks 13–16 skipped`);
        } else {
          pass(); // record present and belongs to this index

          // Check 13 — subdim structure: exactly 40 subdims; every code, dimension, name,
          // and score must match dimensions.ts; scores must be in [1.0,5.0] (or 0 harm floor).
          if (!Array.isArray(record12.subdimensions) || record12.subdimensions.length !== 40) {
            error(file, `[13] "${entity.name}" record has ${record12.subdimensions?.length ?? 0} subdims, expected 40`);
          } else {
            let c13ok = true;
            for (const sd of record12.subdimensions) {
              const expectedDim  = SUBDIM_TO_DIM[sd.code];
              const expectedName = SUBDIM_NAMES_MAP[sd.code];
              if (!expectedDim) {
                error(file, `[13] "${entity.name}" subdim code "${sd.code}" is not a valid code`);
                c13ok = false;
              } else if (sd.dimension !== expectedDim) {
                error(file, `[13] "${entity.name}" subdim "${sd.code}" dimension="${sd.dimension}" expected "${expectedDim}"`);
                c13ok = false;
              } else if (sd.name !== expectedName) {
                error(file, `[13] "${entity.name}" subdim "${sd.code}" name="${sd.name}" expected "${expectedName}"`);
                c13ok = false;
              } else if (typeof sd.score !== "number" || (sd.score !== 0 && (sd.score < 1.0 || sd.score > 5.0))) {
                error(file, `[13] "${entity.name}" subdim "${sd.code}" score=${sd.score} out of range [1.0,5.0] (or 0 harm floor)`);
                c13ok = false;
              } else {
                pass();
              }
            }
            if (c13ok) pass(); // all 40 subdim entries are structurally valid
          }

          // Check 14 — mean(subdims_k) == index.scores[k] for all 8 dims (G2 gate).
          // Failure is an ERROR; reconstructed dims trivially pass (five equal values → exact mean).
          //
          // Note: we compare the RAW mean (not round2(mean)) against the stored index value.
          // The build script stores subdims verbatim for reconstructed dims (no round2 applied),
          // so mean = indexScore exactly.  For assessed dims (integer scores 1–5), the build gate
          // already requires round2(mean) == indexScore before writing, so round2(mean) = mean
          // for any rational produced by integer-score averages.  Using raw mean + 1e-9 epsilon
          // correctly validates both cases and avoids false positives from round2's behaviour on
          // 3-decimal quarter-step values (e.g. 1.875 → round2 gives 1.88, not 1.875).
          if (Array.isArray(record12.subdimensions) && record12.subdimensions.length === 40 && entity.scores) {
            for (const dimCode of DIMENSION_CODES) {
              const dimSubdims = record12.subdimensions.filter((sd) => sd.dimension === dimCode);
              if (dimSubdims.length !== 5) {
                error(file, `[14] "${entity.name}" dim "${dimCode}": ${dimSubdims.length} subdims in record, expected 5`);
              } else {
                const mean14   = dimSubdims.reduce((s, sd) => s + sd.score, 0) / 5;
                const indexDim = entity.scores[dimCode];
                if (typeof indexDim === "number" && Math.abs(mean14 - indexDim) > 1e-9) {
                  error(file, `[14] "${entity.name}" dim "${dimCode}": mean(subdims)=${mean14} != index.scores=${indexDim} (diff=${Math.abs(mean14-indexDim).toExponential(2)})`);
                } else {
                  pass();
                }
              }
            }
          }

          // Check 15 — record.composite / band / rank == index values verbatim (G1).
          if (record12.composite !== entity.composite) {
            error(file, `[15] "${entity.name}" record.composite=${record12.composite} != index.composite=${entity.composite}`);
          } else {
            pass();
          }
          if ((record12.band ?? "").toLowerCase() !== (entity.band ?? "").toLowerCase()) {
            error(file, `[15] "${entity.name}" record.band="${record12.band}" != index.band="${entity.band}"`);
          } else {
            pass();
          }
          if (record12.rank !== entity.rank) {
            error(file, `[15] "${entity.name}" record.rank=${record12.rank} != index.rank=${entity.rank}`);
          } else {
            pass();
          }

          // Check 16 — derived composite vs published composite.
          // Reuses the EXACT thresholds and ASSESSOR_OVERRIDE_NAMES from check 10.
          // ASSESSOR_OVERRIDE_NAMES is the single canonical override registry:
          //   • entity in set MUST carry composite_override in its record → ERROR if missing.
          //   • composite_override set but entity NOT in set → WARN (drift candidate).
          if (record12.dimensions && typeof entity.composite === "number") {
            const derived16  = computeCompositeFromDimensions(record12.dimensions);
            const diff16     = Math.abs(entity.composite - derived16);
            const isOverride16 = ASSESSOR_OVERRIDE_NAMES.has(entity.name);

            if (isOverride16 && record12.composite_override == null) {
              error(file, `[16] "${entity.name}" is in ASSESSOR_OVERRIDE_NAMES but record.composite_override is null`);
            }
            if (!isOverride16 && record12.composite_override != null) {
              warn(file, `[16] "${entity.name}" record.composite_override is set but entity is not in ASSESSOR_OVERRIDE_NAMES (drift candidate)`);
            }

            // Check-10 thresholds reused exactly (diff>2.0 non-override=ERROR; >1.0 or >0.5 override=WARN).
            if (diff16 > 2.0 && !isOverride16) {
              error(file, `[16] "${entity.name}" derived=${derived16.toFixed(1)} vs published=${entity.composite} (diff=${diff16.toFixed(1)})`);
            } else if (diff16 > 1.0 || (diff16 > 0.5 && isOverride16)) {
              warn(file, `[16] "${entity.name}" derived=${derived16.toFixed(1)} vs published=${entity.composite} (diff=${diff16.toFixed(1)})`);
            } else {
              pass();
            }
          }
        }
      }
    }
  }

  // 6. Rank contiguity
  const ranks = rankings.map((r) => r.rank).sort((a, b) => a - b);
  const uniqueRanks = new Set(ranks);
  if (uniqueRanks.size !== ranks.length) {
    error(file, `Duplicate ranks found. Count: ${ranks.length}, unique: ${uniqueRanks.size}`);
  } else {
    pass();
  }

  const known = KNOWN_PARTIAL[file];
  if (!known) {
    // Standard: ranks should be 1..n contiguous
    for (let i = 0; i < ranks.length; i++) {
      if (ranks[i] !== i + 1) {
        error(file, `Rank gap: expected ${i + 1}, got ${ranks[i]} (not contiguous 1..${ranks.length})`);
        break;
      }
    }
    pass();
  } else {
    // Known partial: ranks exist but may have gaps. Just check no duplicates and all within 1..total
    const maxExpected = known.bandTotal ?? known.entityCount;
    for (const r of ranks) {
      if (r < 1 || r > maxExpected) {
        error(file, `Rank ${r} out of expected range [1,${maxExpected}]`);
      }
    }
    pass();
  }

  // 7. entityCount consistency
  if (!known) {
    if (meta.entityCount !== rankings.length) {
      error(file, `meta.entityCount (${meta.entityCount}) != rankings.length (${rankings.length})`);
    } else {
      pass();
    }
  } else {
    // Known partial: entityCount should match actual rankings array
    if (meta.entityCount !== known.entityCount) {
      warn(file, `meta.entityCount (${meta.entityCount}) != expected (${known.entityCount}) [known partial]`);
    } else {
      pass();
    }
    if (rankings.length !== known.rankingsCount) {
      error(file, `Expected ${known.rankingsCount} rankings entries for partial file, got ${rankings.length}`);
    } else {
      pass();
    }
  }

  // 8. Band counts
  if (!Array.isArray(data.bands) || data.bands.length === 0) {
    error(file, "Missing or empty 'bands' array");
  } else {
    const bandSum = data.bands.reduce((s, b) => s + b.count, 0);
    const expectedBandSum = known?.bandTotal ?? (known ? known.entityCount : rankings.length);

    if (bandSum !== expectedBandSum) {
      error(file, `Band count sum (${bandSum}) != expected (${expectedBandSum})`);
    } else {
      pass();
    }

    // 9. Band validity
    for (const band of data.bands) {
      const match = VALID_BANDS.find((vb) => vb.name === band.name && (vb.range === band.range || vb.legacyRange === band.range));
      if (!match) {
        error(file, `Invalid band: name="${band.name}" range="${band.range}"`);
      } else {
        pass();
      }
      if (typeof band.count !== "number" || band.count < 0) {
        error(file, `Band "${band.name}" count must be non-negative number`);
      }
    }
  }

  // Summary line per file
  console.log(`  ✓ ${file}: ${rankings.length} entities validated`);
}

// ---------------------------------------------------------------------------

console.log(`\n${"─".repeat(60)}`);
console.log(`Results: ${totalChecks} checks passed, ${totalErrors} errors, ${totalWarnings} warnings`);

if (totalErrors > 0) {
  console.error(`\n💥 VALIDATION FAILED — ${totalErrors} error(s) found\n`);
  process.exit(1);
} else if (totalWarnings > 0) {
  console.log(`\n⚠️  Validation passed with ${totalWarnings} warning(s)\n`);
  process.exit(0);
} else {
  console.log(`\n✅ All index files are valid\n`);
  process.exit(0);
}
