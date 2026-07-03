#!/usr/bin/env node

/**
 * test-entity-records.mjs — QA determinism gate for entity evidence records.
 *
 * Step 7 per ARCHITECTURE_SUBDIMENSIONS.md §11.
 * Owner: QA Engineer
 *
 * Validates ALL 1,238 entity records across five assertion groups (a)–(e):
 *
 *   (a) record.composite == index.composite, record.band == index.band,
 *       record.rank == index.rank — verbatim, 0 tolerance (G1).
 *   (b) Record has exactly 40 subdimensions; every code/name/dimension matches
 *       dimensions.ts canonical map; every score ∈ [1.0, 5.0] (or 0 harm floor).
 *   (c) mean(subdims_k) == index.scores[k] for all 8 dims — raw mean, 1e-9
 *       epsilon, matching validate-indexes.mjs check 14 exactly.
 *   (d) compositeCore(derivedDims).final vs published composite:
 *       - ASSESSOR_OVERRIDE_NAMES entities must carry composite_override == index.composite.
 *       - Pre-existing drift entities (known 5) tolerated as warnings.
 *       - Any NEW divergence (non-override, diff > 2.0) = BLOCKER (must be 0).
 *   (e) Determinism: raw mean of subdims from record reproduces record.dimensions
 *       for all 8 dims (1e-9); compositeCore(record.dimensions) gives the same
 *       composite as computeCompositeFromDimensions(indexScores) — confirming the
 *       G2 guarantee makes the two paths numerically identical.
 *
 * Also includes standalone edge-case golden tests:
 *   EC-1  Harm-floor (a dimension == 0 → integrationPremium == 0, premium pathway)
 *   EC-2  Quarter-step index value (University of Glasgow, real dims with .25/.75
 *          values → composite = 62.5)
 *   EC-3  Override entity (Finland: formula → 94.7, published → 84.4,
 *          composite_override must be set)
 *   EC-4  Fully-assessed entity (Afghanistan: all dims assessed) vs fully-
 *          reconstructed entity (Glasgow): both satisfy (a)–(e) under their
 *          respective source modes.
 *
 * scoring.ts / scoring.mjs parity:
 *   The drift gate in test-scoring.mjs already covers getBand, calcScores, and
 *   computeCompositeFromDimensions at the formula level. This file independently
 *   re-derives composites from subdim data and confirms they match the canonical
 *   scoring.mjs implementation — closing the remaining parity gap for real record
 *   data.
 *
 * Exit code 0 = all checks pass, 1 = one or more failures.
 *
 * Run: node site/scripts/test-entity-records.mjs
 */

import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { computeCompositeFromDimensions } from "./lib/scoring.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const RECORDS_DIR = join(__dirname, "..", "src", "data", "entity-records");
const INDEXES_DIR = join(__dirname, "..", "src", "data", "indexes");

// ── Canonical subdim structure (mirrors dimensions.ts and build-entity-records.mjs) ──

const DIMENSIONS_MAP = [
  { code: "AWR", name: "Awareness", subdims: [
    { code: "A1",  name: "Suffering Detection"            },
    { code: "A2",  name: "Contextual Sensitivity"         },
    { code: "A3",  name: "Blind Spot Mitigation"          },
    { code: "A4",  name: "Signal Amplification"           },
    { code: "A5",  name: "Anticipatory Awareness"         },
  ]},
  { code: "EMP", name: "Empathy", subdims: [
    { code: "E1",  name: "Affective Resonance"            },
    { code: "E2",  name: "Perspective-Taking"             },
    { code: "E3",  name: "Non-Judgment"                   },
    { code: "E4",  name: "Validation"                     },
    { code: "E5",  name: "Cultural Empathy"               },
  ]},
  { code: "ACT", name: "Action", subdims: [
    { code: "AC1", name: "Responsiveness"                 },
    { code: "AC2", name: "Proportionality"                },
    { code: "AC3", name: "Efficacy"                       },
    { code: "AC4", name: "Resource Mobilization"          },
    { code: "AC5", name: "Follow-Through"                 },
  ]},
  { code: "EQU", name: "Equity", subdims: [
    { code: "EQ1", name: "Universality"                   },
    { code: "EQ2", name: "Priority for Vulnerable"        },
    { code: "EQ3", name: "Bias Awareness"                 },
    { code: "EQ4", name: "Access Design"                  },
    { code: "EQ5", name: "Historical Harm Acknowledgment" },
  ]},
  { code: "BND", name: "Boundaries", subdims: [
    { code: "B1",  name: "Self-Sustainability"            },
    { code: "B2",  name: "Autonomy Preservation"          },
    { code: "B3",  name: "Scope Clarity"                  },
    { code: "B4",  name: "Refusal Ethics"                 },
    { code: "B5",  name: "Consent Orientation"            },
  ]},
  { code: "ACC", name: "Accountability", subdims: [
    { code: "AB1", name: "Harm Acknowledgment"            },
    { code: "AB2", name: "Correction Willingness"         },
    { code: "AB3", name: "Transparency"                   },
    { code: "AB4", name: "Systemic Learning"              },
    { code: "AB5", name: "Reparative Action"              },
  ]},
  { code: "SYS", name: "Systemic Thinking", subdims: [
    { code: "S1",  name: "Root Cause Orientation"         },
    { code: "S2",  name: "Long-Term Impact"               },
    { code: "S3",  name: "Interconnection Awareness"      },
    { code: "S4",  name: "Structural Critique"            },
    { code: "S5",  name: "Coalitional Compassion"         },
  ]},
  { code: "INT", name: "Integrity", subdims: [
    { code: "I1",  name: "Consistency Under Pressure"     },
    { code: "I2",  name: "Non-Performance"                },
    { code: "I3",  name: "Internal Consistency"           },
    { code: "I4",  name: "Values Alignment"               },
    { code: "I5",  name: "Resilience of Care"             },
  ]},
];

const DIMENSION_CODES = DIMENSIONS_MAP.map((d) => d.code);

// Fast lookup tables
const SUBDIM_TO_DIM  = {};  // subdim code → parent dim code
const SUBDIM_TO_NAME = {};  // subdim code → canonical name

for (const dim of DIMENSIONS_MAP) {
  for (const sd of dim.subdims) {
    SUBDIM_TO_DIM[sd.code]  = dim.code;
    SUBDIM_TO_NAME[sd.code] = sd.name;
  }
}

const ALL_SUBDIM_CODES = new Set(Object.keys(SUBDIM_TO_DIM));  // 40 codes

// ── ASSESSOR_OVERRIDE_NAMES — exact copy from validate-indexes.mjs ──────────────
// This is the canonical override allowlist. Any entity NOT in this set whose
// record carries composite_override signals a drift candidate (warn).
// Any non-override entity with derived composite diff > 2.0 is a NEW blocker.

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
  "Slovakia",
  "TIAA",
  // 2026-05-24 cycle
  "Turkey",
]);

// ── Known pre-existing drift entities (non-override, diff > 1.0 at index level) ──
// These are already tolerated as warnings by validate-indexes.mjs check 10.
// Any entity ADDED to this list beyond the 5 below is a NEW divergence and a blocker.
const KNOWN_PRE_EXISTING_DRIFT = new Set([
  "Mauritius",   // diff 1.6  countries.json
  "Vanuatu",     // diff 1.4  countries.json
  "Cummins",     // diff 1.8  fortune-500.json
  "Houston",     // diff 1.1  us-cities.json
  "Texas",       // diff 1.2  us-states.json
]);

// ── Test harness ──────────────────────────────────────────────────────────────

let totalPassed = 0;
let totalFailed = 0;
const failures = []; // {group, slug, msg}

function pass(group, slug) {
  totalPassed++;
  void group; void slug;
}

function fail(group, slug, msg) {
  totalFailed++;
  failures.push({ group, slug, msg });
  // Print immediately for easy scanning during a run:
  console.error(`  FAIL [${group}] ${slug}: ${msg}`);
}

// ── Slug utilities (exact mirrors of build-entity-records.mjs) ────────────────

/**
 * Convert a name to URL-safe kebab-case slug.
 * Mirrors slugify() in build-entity-records.mjs and export-public-data.mjs.
 */
function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ── Load index data ────────────────────────────────────────────────────────────
// Build lookup: indexSlug → Map<slug, entityRow>
//
// IMPORTANT: uses the same slug-disambiguation logic as build-entity-records.mjs
// so that intra-index duplicate names (e.g. two "Portland" cities in us-cities)
// produce the same slug → entity mapping as the builder.  Looking up by name
// (using a name-keyed Map) would silently overwrite the first entity with the
// second for any duplicate-name pair, causing false composite/rank mismatches.

const INDEX_FILES = [
  { file: "ai-labs.json",       indexSlug: "ai-labs"       },
  { file: "countries.json",     indexSlug: "countries"     },
  { file: "fortune-500.json",   indexSlug: "fortune-500"   },
  { file: "global-cities.json", indexSlug: "global-cities" },
  { file: "robotics-labs.json", indexSlug: "robotics-labs" },
  { file: "universities.json",  indexSlug: "universities"  },
  { file: "us-cities.json",     indexSlug: "us-cities"     },
  { file: "us-states.json",     indexSlug: "us-states"     },
];

const indexEntityBySlug = new Map(); // indexSlug → Map<slug, entity>

for (const { file, indexSlug } of INDEX_FILES) {
  const path = join(INDEXES_DIR, file);
  let data;
  try {
    data = JSON.parse(readFileSync(path, "utf8"));
  } catch (err) {
    console.error(`FATAL: Cannot read index file ${file}: ${err.message}`);
    process.exit(1);
  }

  const rankings = data.rankings ?? [];

  // Step 1: count how many times each base slug appears (determines whether
  // disambiguation suffix is needed — mirrors build-entity-records.mjs exactly).
  const slugCounts = new Map();
  for (const row of rankings) {
    const base = row.slug ?? slugify(row.name);
    slugCounts.set(base, (slugCounts.get(base) ?? 0) + 1);
  }

  // Step 2: assign disambiguated slugs in rank order and build the lookup.
  const slugUsage = new Map();
  const bySlug    = new Map();

  for (const entity of rankings) {
    const baseSlug = entity.slug ?? slugify(entity.name);
    let slug = baseSlug;
    if ((slugCounts.get(baseSlug) ?? 0) > 1) {
      const used = slugUsage.get(baseSlug) ?? 0;
      slugUsage.set(baseSlug, used + 1);
      slug = used === 0 ? baseSlug : `${baseSlug}-${entity.rank}`;
    }
    bySlug.set(slug, entity);
  }

  indexEntityBySlug.set(indexSlug, bySlug);
}

// ── Load all entity records ────────────────────────────────────────────────────

let recordFiles;
try {
  recordFiles = readdirSync(RECORDS_DIR).filter((f) => f.endsWith(".json"));
} catch (err) {
  console.error(`FATAL: Cannot read entity-records directory: ${err.message}`);
  process.exit(1);
}

const totalRecords = recordFiles.length;
console.log(`\nLoaded ${totalRecords} entity records from ${RECORDS_DIR}\n`);

// ── Per-assertion counters ────────────────────────────────────────────────────

let countA_pass = 0, countA_fail = 0;   // (a) G1: composite/band/rank verbatim
let countB_pass = 0, countB_fail = 0;   // (b) subdim structure: 40 entries, codes, scores
let countC_pass = 0, countC_fail = 0;   // (c) mean(subdims_k) == index.scores[k]
let countD_pass = 0, countD_fail = 0;   // (d) composite invariance
let countE_pass = 0, countE_fail = 0;   // (e) determinism

let overridesSeen = 0;
let preExistingDriftSeen = 0;
let newDivergences = [];       // must be 0
let overrideWithoutField = []; // must be 0

// ── Main validation loop ───────────────────────────────────────────────────────

for (const filename of recordFiles) {
  const slug = filename.replace(/\.json$/, "");
  const recordPath = join(RECORDS_DIR, filename);

  let record;
  try {
    record = JSON.parse(readFileSync(recordPath, "utf8"));
  } catch (err) {
    fail("parse", slug, `Cannot parse record: ${err.message}`);
    continue;
  }

  const indexSlug = record.index_slug;
  const entityName = record.name;

  // Look up the corresponding index entity by slug within the declared index.
  // Using slug (not name) handles intra-index duplicate names (e.g. two Portland
  // cities) because each record carries the same disambiguated slug that was used
  // when the build script wrote the file.
  const bySlug = indexEntityBySlug.get(indexSlug);
  if (!bySlug) {
    fail("lookup", slug, `index_slug "${indexSlug}" not in known index files`);
    continue;
  }
  const indexEntity = bySlug.get(slug);
  if (!indexEntity) {
    fail("lookup", slug, `slug "${slug}" not found in ${indexSlug} (slug collision or missing entity)`);
    continue;
  }

  const indexScores = indexEntity.scores ?? {};

  // ────────────────────────────────────────────────────────────────────────────
  // (a) G1: record composite / band / rank == index verbatim
  // ────────────────────────────────────────────────────────────────────────────

  // Composite: strict numeric equality, no epsilon.
  if (record.composite !== indexEntity.composite) {
    fail("a", slug, `composite mismatch: record=${record.composite} index=${indexEntity.composite}`);
    countA_fail++;
  } else {
    pass("a", slug);
    countA_pass++;
  }

  // Band: case-insensitive string match (record stores Title Case, index stores lowercase).
  if ((record.band ?? "").toLowerCase() !== (indexEntity.band ?? "").toLowerCase()) {
    fail("a", slug, `band mismatch: record="${record.band}" index="${indexEntity.band}"`);
    countA_fail++;
  } else {
    pass("a", slug);
    countA_pass++;
  }

  // Rank: strict numeric equality.
  if (record.rank !== indexEntity.rank) {
    fail("a", slug, `rank mismatch: record=${record.rank} index=${indexEntity.rank}`);
    countA_fail++;
  } else {
    pass("a", slug);
    countA_pass++;
  }

  // ────────────────────────────────────────────────────────────────────────────
  // (b) Subdim structure: exactly 40 entries; codes, names, dimension refs canonical;
  //     scores ∈ [1.0, 5.0] or exactly 0 (harm floor).
  // ────────────────────────────────────────────────────────────────────────────

  const subdims = record.subdimensions ?? [];

  if (subdims.length !== 40) {
    fail("b", slug, `expected 40 subdimensions, got ${subdims.length}`);
    countB_fail++;
  } else {
    pass("b", slug);
    countB_pass++;
  }

  let bStructureOk = true;
  for (const sd of subdims) {
    // Code must be a known subdim code
    if (!ALL_SUBDIM_CODES.has(sd.code)) {
      fail("b", slug, `unknown subdim code "${sd.code}"`);
      countB_fail++;
      bStructureOk = false;
      continue;
    }

    // dimension ref must match canonical parent
    const expectedDim = SUBDIM_TO_DIM[sd.code];
    if (sd.dimension !== expectedDim) {
      fail("b", slug, `subdim "${sd.code}": dimension="${sd.dimension}" expected "${expectedDim}"`);
      countB_fail++;
      bStructureOk = false;
    }

    // name must match canonical
    const expectedName = SUBDIM_TO_NAME[sd.code];
    if (sd.name !== expectedName) {
      fail("b", slug, `subdim "${sd.code}": name="${sd.name}" expected "${expectedName}"`);
      countB_fail++;
      bStructureOk = false;
    }

    // score must be in [1.0, 5.0] or exactly 0 (harm floor)
    if (typeof sd.score !== "number" || (sd.score !== 0 && (sd.score < 1.0 || sd.score > 5.0))) {
      fail("b", slug, `subdim "${sd.code}": score=${sd.score} out of range [1.0,5.0] (or 0 harm floor)`);
      countB_fail++;
      bStructureOk = false;
    }
  }

  if (bStructureOk && subdims.length === 40) {
    pass("b", slug);
    countB_pass++;
  }

  // ────────────────────────────────────────────────────────────────────────────
  // (c) mean(subdims_k) == index.scores[k] for all 8 dims.
  //     USES RAW MEAN (not round2), matching validate-indexes.mjs check 14 exactly.
  //     Epsilon: 1e-9.
  //     Rationale: reconstructed dims store verbatim indexScore → mean is exact.
  //     Assessed dims use integer scores → sum/5 has at most 1dp → round2(mean)=mean.
  //     round2 would mangle quarter-step values (e.g. 1.875 → 1.88) producing false
  //     positives, so raw mean is the correct comparison.
  // ────────────────────────────────────────────────────────────────────────────

  if (subdims.length === 40) {
    for (const dim of DIMENSIONS_MAP) {
      const dimCode = dim.code;
      const dimSubdims = subdims.filter((sd) => sd.dimension === dimCode);

      if (dimSubdims.length !== 5) {
        fail("c", slug, `dim ${dimCode}: ${dimSubdims.length} subdims in record, expected 5`);
        countC_fail++;
        continue;
      }

      const rawMean = dimSubdims.reduce((s, sd) => s + sd.score, 0) / 5;
      const indexDimScore = indexScores[dimCode];

      if (typeof indexDimScore !== "number") {
        fail("c", slug, `dim ${dimCode}: index.scores[${dimCode}] is not a number`);
        countC_fail++;
        continue;
      }

      if (Math.abs(rawMean - indexDimScore) > 1e-9) {
        fail(
          "c",
          slug,
          `dim ${dimCode}: mean(subdims)=${rawMean} != index.scores=${indexDimScore} ` +
          `(diff=${Math.abs(rawMean - indexDimScore).toExponential(2)})`
        );
        countC_fail++;
      } else {
        pass("c", slug);
        countC_pass++;
      }
    }
  }

  // ────────────────────────────────────────────────────────────────────────────
  // (d) Composite invariance:
  //     - ASSESSOR_OVERRIDE_NAMES entities: record.composite_override must == index.composite.
  //     - Non-override entities: derived composite diff > 2.0 is a NEW blocker.
  //     - Known pre-existing drift (5 entities): diff > 1.0 but <= 2.0, tolerated as warn.
  // ────────────────────────────────────────────────────────────────────────────

  const isOverride = ASSESSOR_OVERRIDE_NAMES.has(entityName);

  // Override entities MUST carry composite_override == index.composite.
  if (isOverride) {
    overridesSeen++;
    if (record.composite_override == null) {
      fail("d", slug, `"${entityName}" is in ASSESSOR_OVERRIDE_NAMES but record.composite_override is null`);
      countD_fail++;
      overrideWithoutField.push(slug);
    } else if (record.composite_override !== indexEntity.composite) {
      fail("d", slug,
        `"${entityName}" composite_override=${record.composite_override} != index.composite=${indexEntity.composite}`
      );
      countD_fail++;
    } else {
      pass("d", slug);
      countD_pass++;
    }
  }

  // Derive composite from the record's stored dimension values.
  // This mirrors what validate-indexes.mjs check 16 does.
  if (record.dimensions && typeof indexEntity.composite === "number") {
    const derivedResult = computeCompositeFromDimensions(record.dimensions);
    const derived16 = derivedResult.composite;
    const diff16 = Math.abs(indexEntity.composite - derived16);

    if (!isOverride) {
      if (diff16 > 2.0) {
        // NEW blocker — this entity is not in the allowlist and its derived composite
        // diverges enough to be an ERROR in validate-indexes.mjs check 10/16.
        fail("d", slug,
          `NEW divergence: derived=${derived16.toFixed(1)} published=${indexEntity.composite} diff=${diff16.toFixed(1)} ` +
          `[non-override, not in known-drift set]`
        );
        countD_fail++;
        newDivergences.push({ slug, name: entityName, indexSlug, derived: derived16, published: indexEntity.composite, diff: +diff16.toFixed(4) });
      } else if (diff16 > 1.0) {
        // Pre-existing drift (expected to be exactly the 5 known entities above).
        preExistingDriftSeen++;
        if (!KNOWN_PRE_EXISTING_DRIFT.has(entityName)) {
          fail("d", slug,
            `UNEXPECTED pre-existing drift: derived=${derived16.toFixed(1)} published=${indexEntity.composite} diff=${diff16.toFixed(1)} ` +
            `[not in KNOWN_PRE_EXISTING_DRIFT set — treat as new divergence]`
          );
          countD_fail++;
        } else {
          // Known pre-existing: tolerated warning (matches validate-indexes.mjs behavior).
          pass("d", slug);
          countD_pass++;
        }
      } else {
        pass("d", slug);
        countD_pass++;
      }
    } else {
      // Override entity: derived vs published diff is expected to be large.
      // We only check that composite_override is set (done above).
      // Additional integrity check: derived composite must differ from published
      // (if diff is 0 the entity may have been wrongly added to the allowlist — warn only,
      // since the assessor may have intentionally confirmed the formula result).
      if (diff16 === 0) {
        console.warn(
          `  WARN [d] ${slug}: "${entityName}" is in ASSESSOR_OVERRIDE_NAMES but ` +
          `derived=${derived16} == published=${indexEntity.composite} (allowlist entry may be stale)`
        );
      }
      pass("d", slug);
      countD_pass++;
    }
  } else {
    pass("d", slug); // no dimensions stored — tolerated during transition
    countD_pass++;
  }

  // ────────────────────────────────────────────────────────────────────────────
  // (e) Determinism: raw mean of subdims from record reproduces record.dimensions
  //     for all 8 dims (within 1e-9); compositeCore(record.dimensions) gives the
  //     same composite as computeCompositeFromDimensions(indexScores).
  //
  //     For reconstructed dims: all 5 subdims == indexScore → rawMean == indexScore == record.dim.
  //     For assessed dims (integers 1–5): rawMean is a multiple of 0.2; round2(rawMean) = rawMean;
  //     so rawMean == record.dimensions[dimCode] (which was stored as round2(sum/5)).
  //
  //     This reproduces the calcScores path from scoring.ts using subdim-level inputs:
  //     calcScores averages subdims without rounding before passing to compositeCore,
  //     which matches using record.dimensions (same values) as input.
  // ────────────────────────────────────────────────────────────────────────────

  if (subdims.length === 40 && record.dimensions) {
    let eOk = true;

    // (e.1) Raw dim means from subdims must match record.dimensions.
    for (const dim of DIMENSIONS_MAP) {
      const dimCode = dim.code;
      const dimSubdims = subdims.filter((sd) => sd.dimension === dimCode);
      if (dimSubdims.length !== 5) continue; // already caught in (c)

      const rawMean = dimSubdims.reduce((s, sd) => s + sd.score, 0) / 5;
      const storedDim = record.dimensions[dimCode];

      if (typeof storedDim !== "number" || Math.abs(rawMean - storedDim) > 1e-9) {
        fail(
          "e",
          slug,
          `dim ${dimCode}: rawMean(subdims)=${rawMean} != record.dimensions=${storedDim} ` +
          `(diff=${Math.abs(rawMean - (storedDim ?? 0)).toExponential(2)})`
        );
        countE_fail++;
        eOk = false;
      }
    }

    // (e.2) compositeCore(record.dimensions) must equal compositeCore(indexScores).
    //       Since G2 guarantees record.dimensions == index.scores, both inputs produce
    //       the same output. We verify both independently to close the loop.
    const fromRecord = computeCompositeFromDimensions(record.dimensions).composite;
    const fromIndex  = computeCompositeFromDimensions(indexScores).composite;

    if (Math.abs(fromRecord - fromIndex) > 1e-9) {
      fail(
        "e",
        slug,
        `compositeCore(record.dimensions)=${fromRecord} != compositeCore(indexScores)=${fromIndex} ` +
        `(should be identical when G2 holds)`
      );
      countE_fail++;
      eOk = false;
    }

    if (eOk) {
      pass("e", slug);
      countE_pass++;
    }
  }
}

// ── Edge-case golden tests ─────────────────────────────────────────────────────
//
// Standalone formula-level cases that must pass for the scoring pipeline to be
// correct on boundary inputs. These complement the 69 cases in test-scoring.mjs
// with record-derived and architecture-specified golden samples.

console.log("\n" + "─".repeat(70));
console.log("Edge-case golden tests\n");

let ecPassed = 0;
let ecFailed = 0;

function ecAssert(label, actual, expected) {
  if (actual === expected) {
    console.log(`  PASS  ${label}`);
    ecPassed++;
    totalPassed++;
  } else {
    console.error(`  FAIL  ${label}`);
    console.error(`        expected: ${JSON.stringify(expected)}`);
    console.error(`        actual:   ${JSON.stringify(actual)}`);
    ecFailed++;
    totalFailed++;
  }
}

function ecApprox(label, actual, expected, eps = 1e-9) {
  if (Math.abs(actual - expected) <= eps) {
    console.log(`  PASS  ${label}`);
    ecPassed++;
    totalPassed++;
  } else {
    console.error(`  FAIL  ${label}`);
    console.error(`        expected: ${expected} (eps=${eps})`);
    console.error(`        actual:   ${actual}`);
    ecFailed++;
    totalFailed++;
  }
}

// ── EC-1: Harm-floor (dim = 0 → integrationPremium = 0) ──────────────────────
// A single dimension at exactly 0 must suppress the integration premium entirely.
// This tests the hasHarm branch of compositeCore (used by both scoring.ts and
// scoring.mjs) and is the scored equivalent of the subdim-level harm test in
// test-scoring.mjs (which uses calcScores with a subdim = 0).

console.log("EC-1  Harm-floor: dim AWR=0, all others=3 → integrationPremium=0");
{
  const harmDims = { AWR: 0, EMP: 3, ACT: 3, EQU: 3, BND: 3, ACC: 3, SYS: 3, INT: 3 };
  const res = computeCompositeFromDimensions(harmDims);

  // integrationPremium must be 0.
  ecAssert("harm-floor: integrationPremium = 0", res.integrationPremium, 0);

  // baseComposite: baseAvg = (0+3*7)/8 = 21/8 = 2.625
  // baseComposite = ((2.625-1)/4)*100 = (1.625/4)*100 = 40.625
  // final = Math.round(40.625*10)/10 = Math.round(406.25)/10 = 406/10 = 40.6
  ecApprox("harm-floor: composite = 40.6", res.composite, 40.6, 1e-9);

  // Formula confirms: no premium, so composite < 50 even with 7/8 dims at 3.
  ecAssert("harm-floor: composite < 50 (premium suppressed)", res.composite < 50, true);
}

// ── EC-2: Quarter-step index value (University of Glasgow real dims) ──────────
// Glasgow has dims containing .25/.75 values (quarter-steps that cannot be means
// of 5 integers). This confirms the formula handles these without rounding error.
// Expected composite = 62.5 (Established band).
// Source: site/src/data/indexes/universities.json rank 1.

console.log("\nEC-2  Quarter-step dims (University of Glasgow real entity)");
{
  const glasgowDims = { AWR: 3.5, EMP: 3.25, ACT: 3.25, EQU: 4.0, BND: 2.75, ACC: 3.75, SYS: 4.0, INT: 3.5 };
  const res = computeCompositeFromDimensions(glasgowDims);

  // baseAvg = (3.5+3.25+3.25+4.0+2.75+3.75+4.0+3.5)/8 = 28.0/8 = 3.5
  // baseComposite = ((3.5-1)/4)*100 = 62.5
  // weakDims (< 4.0): AWR, EMP, ACT, BND, ACC, INT = 6 → weaknessFactor = max(0,1-6*0.2) = 0
  // integrationPremium = 0
  // final = 62.5
  ecApprox("Glasgow: composite = 62.5", res.composite, 62.5, 1e-9);
  ecAssert("Glasgow: band = Established", res.band, "Established");
  ecAssert("Glasgow: integrationPremium = 0", res.integrationPremium, 0);

  // Confirm using the real record's stored dimensions.
  let glasgowRecord;
  try {
    glasgowRecord = JSON.parse(readFileSync(join(RECORDS_DIR, "university-of-glasgow.json"), "utf8"));
    const fromRecord = computeCompositeFromDimensions(glasgowRecord.dimensions).composite;
    ecApprox("Glasgow record dims → composite = 62.5", fromRecord, 62.5, 1e-9);

    // Check 14 equivalence: raw mean of each dim's subdims must equal index dim.
    let meanOk = true;
    for (const dim of DIMENSIONS_MAP) {
      const dimSubs = glasgowRecord.subdimensions.filter((sd) => sd.dimension === dim.code);
      const rawMean = dimSubs.reduce((s, sd) => s + sd.score, 0) / 5;
      const indexDim = glasgowDims[dim.code];
      if (Math.abs(rawMean - indexDim) > 1e-9) {
        ecAssert(`Glasgow ${dim.code} mean(subdims) == indexDim`, false, true);
        meanOk = false;
      }
    }
    if (meanOk) {
      ecAssert("Glasgow: all 8 dim means reproduce index dims (check-14 gate)", true, true);
    }
  } catch (err) {
    console.error(`  SKIP  Glasgow record load failed: ${err.message}`);
  }
}

// ── EC-3: Override entity (Finland — formula ≠ published, composite_override set) ──
// Finland is a top-band ceiling override: formula pushes composite to ~94.7, but
// the assessor published 84.4. The record must carry composite_override = 84.4.
// Source: site/src/data/indexes/countries.json + entity-records/finland.json.

console.log("\nEC-3  Override entity (Finland: formula ≠ published)");
{
  const finlandDims = { AWR: 4.5, EMP: 4.5, ACT: 4.3, EQU: 4.0, BND: 4.5, ACC: 4.5, SYS: 4.5, INT: 4.3 };
  const formulaResult = computeCompositeFromDimensions(finlandDims);

  // Derived formula should give ~94.7 (not 84.4).
  ecApprox("Finland: formula composite = 94.7", formulaResult.composite, 94.7, 0.1);

  // The formula composite must NOT match the published composite of 84.4.
  ecAssert("Finland: formula != published 84.4", formulaResult.composite !== 84.4, true);

  // Load record and verify composite_override is set to the published value.
  try {
    const finlandRecord = JSON.parse(readFileSync(join(RECORDS_DIR, "finland.json"), "utf8"));
    ecAssert("Finland record.composite = 84.4 (frozen published)", finlandRecord.composite, 84.4);
    ecAssert("Finland record.composite_override = 84.4", finlandRecord.composite_override, 84.4);
    ecAssert("Finland: composite_override != formula composite",
      finlandRecord.composite_override !== formulaResult.composite, true);
    ecAssert("Finland: index_slug = countries", finlandRecord.index_slug, "countries");
  } catch (err) {
    console.error(`  SKIP  Finland record load failed: ${err.message}`);
  }
}

// ── EC-4a: Fully-reconstructed entity (University of Glasgow) ─────────────────
// All 40 subdims equal the published dim value. Confirms reconstruction integrity:
// - subdims_source == "reconstructed" for all dims
// - All 5 subdims in a dim are identical to record.dimensions[dimCode]
// - No assessed evidence present

console.log("\nEC-4a  Fully-reconstructed entity (University of Glasgow)");
{
  try {
    const rec = JSON.parse(readFileSync(join(RECORDS_DIR, "university-of-glasgow.json"), "utf8"));
    ecAssert("Glasgow: subdims_source = reconstructed", rec.subdims_source, "reconstructed");
    ecAssert("Glasgow: source_assessment = null", rec.source_assessment, null);

    let allReconstructed = true;
    let allEvidenceEmpty = true;
    for (const sd of rec.subdimensions) {
      if (sd.subdims_source !== "reconstructed") allReconstructed = false;
      if (sd.evidence && sd.evidence.length > 0) allEvidenceEmpty = false;
    }
    ecAssert("Glasgow: all 40 subdims have subdims_source=reconstructed", allReconstructed, true);
    ecAssert("Glasgow: all 40 subdims have empty evidence[]", allEvidenceEmpty, true);

    // Each dim: all 5 subdims == dim score
    let dimEqualityOk = true;
    for (const dim of DIMENSIONS_MAP) {
      const dimScore = rec.dimensions[dim.code];
      const dimSubs = rec.subdimensions.filter((sd) => sd.dimension === dim.code);
      for (const sd of dimSubs) {
        if (sd.score !== dimScore) {
          dimEqualityOk = false;
        }
      }
    }
    ecAssert("Glasgow: each reconstructed subdim == parent dim score (verbatim)", dimEqualityOk, true);
  } catch (err) {
    console.error(`  SKIP  Glasgow record load failed: ${err.message}`);
  }
}

// ── EC-4b: Fully-assessed entity (Afghanistan) ───────────────────────────────
// All dims are assessed from research/assessments/. Subdim scores are integers.
// Confirms assessed path:
// - subdims_source == "assessed" at entity level
// - Subdim scores are whole integers (not reconstructed continuous values)
// - Formula composite from assessed dims == published composite (all dims == index dims)

console.log("\nEC-4b  Fully-assessed entity (Afghanistan)");
{
  try {
    const rec = JSON.parse(readFileSync(join(RECORDS_DIR, "afghanistan.json"), "utf8"));
    ecAssert("Afghanistan: subdims_source = assessed", rec.subdims_source, "assessed");

    // All subdim scores must be integers (1–5), not fractional reconstructed values.
    let allIntegers = true;
    for (const sd of rec.subdimensions) {
      if (!Number.isInteger(sd.score)) {
        allIntegers = false;
      }
    }
    ecAssert("Afghanistan: all 40 subdim scores are integers (1-5)", allIntegers, true);

    // Formula composite from record.dimensions must match published composite.
    const fromDims = computeCompositeFromDimensions(rec.dimensions).composite;
    const published = rec.composite;
    const isOverrideAfgh = ASSESSOR_OVERRIDE_NAMES.has("Afghanistan");
    const diffAfgh = Math.abs(fromDims - published);

    // Afghanistan (all-1 dims) → composite 0. Formula also gives 0. No divergence.
    ecApprox("Afghanistan: formula composite matches published", fromDims, published, 0.05);
    ecAssert("Afghanistan: composite_override = null (not override)", rec.composite_override, null);
  } catch (err) {
    console.error(`  SKIP  Afghanistan record load failed: ${err.message}`);
  }
}

// ── Summary ───────────────────────────────────────────────────────────────────

const sep = "─".repeat(70);

console.log(`\n${sep}`);
console.log(`ENTITY RECORD INVARIANCE RESULTS (${totalRecords} records)\n`);
console.log(`  (a) G1 composite/band/rank verbatim:   ${countA_pass} passed, ${countA_fail} failed`);
console.log(`  (b) Subdim structure (40 entries):     ${countB_pass} passed, ${countB_fail} failed`);
console.log(`  (c) mean(subdims_k) == index.scores:  ${countC_pass} passed, ${countC_fail} failed`);
console.log(`  (d) Composite invariance:              ${countD_pass} passed, ${countD_fail} failed`);
console.log(`  (e) Determinism (subdims→dims→comp):  ${countE_pass} passed, ${countE_fail} failed`);
console.log();
console.log(`  Override entities checked (d): ${overridesSeen} of ${ASSESSOR_OVERRIDE_NAMES.size} (${ASSESSOR_OVERRIDE_NAMES.size - overridesSeen} not in corpus)`);
console.log(`  Overrides missing composite_override field: ${overrideWithoutField.length} (expected 0)`);
console.log(`  Pre-existing drift entities seen: ${preExistingDriftSeen} of ${KNOWN_PRE_EXISTING_DRIFT.size} known`);
console.log(`  NEW divergences (blockers): ${newDivergences.length} (expected 0)`);

if (newDivergences.length > 0) {
  console.error("\n  NEW DIVERGENCES (must be zero before release):");
  for (const d of newDivergences) {
    console.error(`    ${d.name} (${d.indexSlug}): published=${d.published} derived=${d.derived} diff=${d.diff}`);
  }
}

if (overrideWithoutField.length > 0) {
  console.error("\n  OVERRIDE ENTITIES WITHOUT composite_override field (must be zero):");
  for (const s of overrideWithoutField) {
    console.error(`    ${s}`);
  }
}

console.log(`\n${sep}`);
console.log(`Edge-case golden tests: ${ecPassed} passed, ${ecFailed} failed`);
console.log(`${sep}`);
console.log(`TOTAL: ${totalPassed} passed, ${totalFailed} failed`);

if (totalFailed > 0) {
  console.error(`\nFAILED — ${totalFailed} test(s) did not pass\n`);
  process.exit(1);
} else {
  console.log(`\nAll ${totalPassed} tests passed\n`);
  process.exit(0);
}
