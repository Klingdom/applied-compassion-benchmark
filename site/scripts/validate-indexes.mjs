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
 *  - US States: 21 of 51 entries (ranks 9-38 missing from source HTML)
 *    Band counts reflect the full 51-state distribution.
 *
 * Exit code 0 = all checks pass, 1 = failures found.
 */

import { readFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import {
  DIMENSION_CODES,
  computeCompositeFromDimensions as computeCompositeFromDimensionsCanonical,
} from "./lib/scoring.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const INDEXES_DIR = join(__dirname, "..", "src", "data", "indexes");

// Wraps the canonical scoring function to return just the composite number
// (validate-indexes.mjs only compares the composite field, not the band).
function computeCompositeFromDimensions(scores) {
  return computeCompositeFromDimensionsCanonical(scores).composite;
}

// Band boundaries use integer ranges. Composites are decimals, so we use
// strict ranges for clear violations and a 1-point tolerance zone at
// each boundary for warnings (legacy data has inconsistent boundary assignment).
const VALID_BANDS = [
  { name: "Exemplary", range: "81-100", min: 81, max: 100 },
  { name: "Established", range: "61-80", min: 61, max: 80 },
  { name: "Functional", range: "41-60", min: 41, max: 60 },
  { name: "Developing", range: "21-40", min: 21, max: 40 },
  { name: "Critical", range: "0-20", min: 0, max: 20 },
];
const BAND_BOUNDARY_TOLERANCE = 1.0; // points of tolerance at band edges

// Known exceptions: files where rankings.length != meta.entityCount
// US States has 21 entries but entityCount/bands reflect full 51-state set
// US States: 21 entries in rankings (ranks 9-38 missing from source HTML)
// meta.entityCount = 21 (matches rankings), but band counts sum to 51
// (reflecting the full US state set). This is a known source data inconsistency.
const KNOWN_PARTIAL = {
  "us-states.json": { rankingsCount: 21, entityCount: 21, bandTotal: 51 },
};

// Entities whose composite was set by assessor judgment and intentionally
// diverges from the formula output. These are skipped in check 10 formula
// comparison — they are logged as warnings rather than errors.
const ASSESSOR_OVERRIDE_NAMES = new Set([
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
]);

// Required fields per index (common + index-specific)
const COMMON_FIELDS = ["rank", "name", "scores", "composite", "band"];
const INDEX_SPECIFIC_FIELDS = {
  "ai-labs.json": ["hq", "sector"],
  "countries.json": ["region"],
  "fortune-500.json": ["sector"], // f500Rank is optional
  "global-cities.json": ["country", "region"],
  "robotics-labs.json": ["country", "category"],
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
      const match = VALID_BANDS.find((vb) => vb.name === band.name && vb.range === band.range);
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
