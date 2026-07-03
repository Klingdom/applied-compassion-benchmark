# DATA MODEL v2 — Subdimension Evidence Records

Status: DESIGN / SPEC. Proposed successor section to `research/DATA_MODEL.md`. Do NOT overwrite the existing file.
Companion to `docs/ARCHITECTURE_SUBDIMENSIONS.md`.
Scope: adds a canonical per-entity evidence record. Does not change index JSON schema or any entity score.

---

## 1. New entity: Evidence Record

Canonical, source-controlled input for scoring. One file per entity.

- Location (canonical source): `site/src/data/entity-records/<slug>.json`
- Location (derived, published for site/API/badge fetch): `public/data/records/<slug>.json` (emitted by
  `export-public-data.mjs`; trimmed/identical shape, regenerated at build — NOT canonical)
- `slug`: identical to the slug logic in `export-public-data.mjs` (explicit `row.slug` if present, else
  `slugify(name)`, with `-{rank}` disambiguation on intra-index collision). Filenames must match badge/detail URLs.

### 1.1 Schema

```jsonc
{
  "schema_version": "records/v2",          // this record schema version
  "methodology_version": "v1.2",           // scoring formula version (compositeCore); mirrors scoring.mjs

  // ── Identity (frozen from index JSON) ──────────────────────────────────────
  "slug": "hugging-face",
  "name": "Hugging Face",
  "index_slug": "ai-labs",                 // one of the 8 index slugs
  "kind": "ai-lab",                        // mirrors export-public-data KIND_CONFIG

  // ── Published values (FROZEN, copied verbatim; never recomputed) ───────────
  "composite": 84.2,                        // == index.composite  (G1)
  "band": "Exemplary",                      // == index.band (normalized Title Case)
  "rank": 1,                                // == index.rank within index_slug (G1)
  "composite_override": null,               // number if published composite intentionally
                                            // diverges from compositeCore(dims); else null

  // ── Derived dimensions (mean of 5 subdims; must equal index.scores[k]) ──────
  "dimensions": {
    "AWR": 4.4, "EMP": 4.4, "ACT": 4.4, "EQU": 4.4,
    "BND": 4.4, "ACC": 4.4, "SYS": 4.4, "INT": 4.4
  },

  // ── 40 subdimensions (CANONICAL scoring input) ─────────────────────────────
  "subdimensions": [
    {
      "code": "A1",                         // matches dimensions.ts subdim code
      "dimension": "AWR",                   // parent dimension code
      "name": "Suffering Detection",        // matches dimensions.ts name
      "score": 4.4,                         // continuous [1.0,5.0], 2 dp (or 0 harm floor)
      "confidence": "low",                  // 'high' | 'medium' | 'low'
      "assessed_date": null,                // YYYY-MM-DD when assessed; null if reconstructed
      "subdims_source": "reconstructed",    // 'assessed' | 'reconstructed'   (per-subdim)
      "evidence": [                          // [] when reconstructed
        {
          "tier": 4,                         // 1..5 evidence hierarchy (5 strongest)
          "url": "https://…",
          "date": "2026-05-10",              // YYYY-MM-DD of the evidence
          "quote": "…verbatim supporting snippet…"
        }
      ]
    }
    // … 39 more, ordered by dimension (AWR A1..A5, EMP E1..E5, … INT I1..I5)
  ],

  // ── Provenance ─────────────────────────────────────────────────────────────
  "source_assessment": "research/assessments/hugging-face.md", // or null
  "subdims_source": "reconstructed",        // record-level roll-up: 'assessed' if ANY dim assessed,
                                            // else 'reconstructed' (see §1.3)
  "generated_at": "2026-07-01T00:00:00.000Z",
  "generator": "build-entity-records.mjs@<git-sha>"
}
```

### 1.2 Field rules

| Field | Rule |
|---|---|
| `subdimensions` | exactly 40; codes/names/order match `dimensions.ts`; 5 per dimension |
| `subdimensions[].score` | `[1.0,5.0]` 2 dp, OR exactly `0` only where the index dim is `0` (harm floor) |
| `dimensions[k]` | `round(mean(subdims of k), 2)`; MUST equal `index.scores[k]` exactly (±1e-9) — G2 |
| `composite`, `band`, `rank` | copied verbatim from index; migration performs no arithmetic — G1 |
| `composite_override` | set to published composite iff name ∈ `ASSESSOR_OVERRIDE_NAMES` OR `\|compositeCore(dims).final − published\| > tolerance`; else `null` |
| `subdims_source` (per subdim) | `assessed` only if parsed from an assessment AND the dimension mean equals the published dim; else `reconstructed` |
| `evidence` | non-empty only for `assessed` subdims; `[]` for reconstructed |
| `confidence` | assessor value for `assessed`; `low` for `reconstructed` |

### 1.3 Sources: assessed vs reconstructed

- **assessed** (per dimension): 5 real subdim scores parsed from the assessment "Dimension Details" table, whose
  `round(mean,2)` equals the published dimension. Carries real `evidence`, `confidence`, `assessed_date`.
- **reconstructed** (per dimension): no usable assessment for that dimension. All five subdims set equal to the
  published dimension value → mean is exact. `evidence:[]`, `confidence:"low"`, `assessed_date:null`. This is an
  honest "dimension-only, breakdown unknown" placeholder, not fabricated subdimension evidence. A record may be
  mixed (some dimensions assessed, others reconstructed); the record-level `subdims_source` is `assessed` iff ANY
  dimension is assessed.

### 1.4 Invariance obligations (validated, see ARCHITECTURE §6, §9)

- G1: `record.composite == index.composite` and `record.rank == index.rank` (verbatim).
- G2: `round(mean(subdims_k),2) == index.scores[k]` for all 8 k.
- G3: `compositeCore(record.dimensions).final` equals published composite within existing validator tolerance,
  except `composite_override` entities (the ~40 in `ASSESSOR_OVERRIDE_NAMES`).

---

## 2. Changed: Assessment output contract (`research/assessments/<slug>.md` + sidecar)

Additive to the existing benchmark-research format. Full assessments MUST also emit a machine-readable subdim block
so records are built from a contract, not prose scraping.

- New sidecar `research/assessments/<slug>.subdims.json` (or a fenced ```json block in the report) with the
  `subdimensions` array shape from §1.1 (40 entries, per-subdim evidence).
- Frontmatter `scores{}` standardized to **0–5 raw** (matching index JSON), ending the current 0–100 vs 0–5
  inconsistency (DATA_MODEL.md says 0–100; `iran-2026-06-30.md` uses 0–5). Conversion, if a 0–100 view is needed:
  `scaled = ((raw-1)/4)*100`.
- Screening/near-floor assessments that do not re-score all 40 subdims omit the sidecar; those dimensions are
  reconstructed at backfill time.

---

## 3. Changed: Change Proposal (`research/change-proposals/<slug>.json`)

A proposal that changes any dimension MUST include the 5 subdim scores (+ evidence) that produce the new dimension
mean, not only the dimension delta. Add:

```jsonc
"proposed_subdimensions": [
  {
    "code": "A1",              // subdim code from dimensions.ts (e.g. "A1", "AC3", "EQ4", "AB1")
    "dimension": "AWR",        // parent dimension code (one of 8)
    "name": "Suffering Detection",  // subdim name from dimensions.ts (must match verbatim)
    "score": 4.0,              // raw 1–5 value (continuous, stored to 2 dp; 0 for harm floor only)
    "confidence": "high",      // "high" | "medium" | "low"
    "assessed_date": "2026-07-01",  // YYYY-MM-DD date of the assessment
    "evidence": [
      { "tier": 5, "url": "…", "date": "2026-06-20", "quote": "…verbatim snippet…" }
    ]
  }
  // … one entry for every subdim (5 per changed dimension)
  // Unchanged dimensions do NOT require entries — those subdims are reconstructed.
]
```

**Coverage rule:** include all 5 subdimensions for every dimension whose raw score changes in
`proposed_scores.dimensions`. Unchanged dimensions may be omitted (they will be reconstructed from the
current index values when `apply-entity-record.mjs` runs).

**G2 invariance:** for each changed dimension, `round(mean(5 proposed scores), 2)` MUST equal
`proposed_scores.dimensions[dim]`. `apply-entity-record.mjs` enforces this and refuses to write if it fails.

**Backward compatibility:** proposals without `proposed_subdimensions` are valid during the transition period —
`apply-entity-record.mjs` will reconstruct all 40 subdimensions from the index dimension scores. Once the pipeline
fully adopts subdim-level assessments, proposals without this field for changed dimensions will be flagged.

`score-updater` applies the proposal to BOTH the index row (existing contract, §Index JSON Update Contract in
DATA_MODEL.md) AND the entity record (`subdimensions`, `dimensions`, frozen `composite`/`band`/`rank`), keeping
`record.composite == index.composite`. The writer (`apply-entity-record.mjs`) runs AFTER the index is updated;
it reads the current (post-apply) index row for the frozen composite/band/rank values.

---

## 4. Unchanged

- `site/src/data/indexes/*.json` schema (meta / bands / rankings). Remains the ranking source of truth.
- `public/data/scores/<slug>.json` (composite/band/rank only) — Worker badge contract unchanged.
- Scan result, rotation state, digest, PENDING/APPLIED changes schemas.

---

## 5. File lifecycle (additions in **bold**)

```
Entity enters scan   → scan result
Scan flags entity    → assessment report  (+ **subdims sidecar** for full assessments)
Assessment differs   → change proposal     (+ **proposed_subdimensions**)
Human approves       → index JSON updated  + **entity record updated**  (composite frozen == index)
Migration (one-time) → **build-entity-records.mjs** backfills all 1,256 records (assessed|reconstructed)
Build (prebuild)     → export-public-data emits scores/<slug>.json + **records/<slug>.json**
```

---

## 6. Corpus audit reference (drives the scale decision)

10,048 dimension values (1,256 × 8): 45.4% are multiples of 0.2 (integer-reconstructible); 54.5% are not
(5,058 odd-tenths + 415 quarter-steps). Quarter-steps are not even five-half-integer reconstructible. Therefore
subdim `score` is continuous [1.0,5.0], and reconstruction uses five-equal subdims for exact dimension-mean
preservation. See ARCHITECTURE_SUBDIMENSIONS.md §4.
