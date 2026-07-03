# ARCHITECTURE — Subdimension Canonicalization (Evidence Records)

Status: DESIGN / SPEC (no scoring logic, index data, or entity scores are changed by this document)
Owner: System Architect
Methodology baseline: v1.2 (`compositeCore` in `site/src/lib/scoring.ts`, mirrored in `site/scripts/lib/scoring.mjs`)
Decision mode: **Option A — Reconstruct-to-preserve.** All 1,256 published composites and ranks MUST remain mathematically unchanged after migration.

---

## 0. TL;DR (decisions locked by this spec)

1. **Storage location:** canonical per-entity records live in a NEW, source-controlled directory
   `site/src/data/entity-records/<slug>.json`. NOT in `public/data/scores/` (that is build output, regenerated
   every build and therefore unsuitable for canonical input). A DERIVED, published copy is emitted to
   `public/data/records/<slug>.json` by the existing export step for the site/API to fetch.
2. **Subdim scale:** subdim `score` is a **continuous value in [1.0, 5.0]** (stored to 2 decimals), NOT integer-only.
   Reason: the dimension-value audit (§4) shows ~54.5% of published dimension values are not multiples of 0.2 and
   thus cannot be the mean of five integers; 415 values are quarter-steps that cannot even be the mean of five
   half-integers. Integer subdims cannot preserve composites for essentially any entity. Real assessed subdims are
   recorded at their true anchor value (1–5 integers where the assessor used anchors); reconstructed subdims are
   continuous.
3. **Source-of-truth flip (forward):** subdims are canonical → dimension = mean(5 subdims) → composite via existing
   `compositeCore`. For the BACKFILL, published composite/band/rank are **frozen and copied verbatim** into each
   record; they are never recomputed. The index JSON remains the authoritative ranking source until a later,
   separate cutover.
4. **Composite-invariance guarantee:** exact. Reconstructed records set every subdim in a dimension equal to the
   published dimension value, so `mean(subdims) == published_dim` bit-for-bit; the composite recomputed from those
   dims is identical to the published composite. Assessor-override entities (~40) carry a `composite_override` so
   their intentionally-divergent published composite is preserved unchanged. No published composite or rank moves.

---

## 1. Problem statement

Today the 8 dimension scores are the only stored scoring input (`site/src/data/indexes/*.json`, 0–5 scale). The 40
subdimensions exist only in `dimensions.ts` (as rubric anchors) and, for some entities, as prose tables inside
`research/assessments/*.md`. `calcScores(subdimScores)` already computes dimension → composite, and
`computeCompositeFromDimensions(dimScores)` is the dimension-level entry; both share `compositeCore`, so the two
paths are numerically identical.

We want the 40 subdimension scores to become the CANONICAL scoring input, stored with their evidence on per-entity
"evidence records," while preserving every currently published composite and rank exactly.

---

## 2. Application boundary and components

This is a static-export Next.js 16 site plus Node build/validation scripts plus a Cloudflare Worker badge endpoint.
No runtime server. The change is entirely in the **data + build + validation** layer, plus **agent output
contracts**. No new services.

Components touched:

| Component | Change |
|---|---|
| `site/src/data/entity-records/<slug>.json` (NEW) | Canonical evidence records, source-controlled |
| `site/src/data/indexes/*.json` | UNCHANGED by migration; remains ranking source of truth |
| `site/scripts/lib/scoring.mjs` / `site/src/lib/scoring.ts` | UNCHANGED formula; used read-only for validation/derivation |
| `site/scripts/build-entity-records.mjs` (NEW) | Backfill + reconstruction generator (dry-run capable) |
| `site/scripts/validate-indexes.mjs` | EXTENDED: record↔index consistency + mean(subdims)==dim checks |
| `site/scripts/export-public-data.mjs` | EXTENDED: emit `public/data/records/<slug>.json` derived copy |
| `.claude/agents/benchmark-research.md`, `overnight-assessor.md`, `score-updater.md` | Output-contract additions (40 structured subdims + per-subdim evidence) |
| Entity detail page (frontend) | LATER: optional per-subdim evidence display; fetches one record |

Data flow (forward / new assessments):

```
assessor (40 subdim scores + evidence)
  → entity record (canonical)
    → mean(5 subdims)  = dimension score (0–5)
      → compositeCore  = composite + band
        → (proposed) index JSON update  → rankings
```

Data flow (backfill / this migration):

```
index JSON dimension scores (frozen)  ─┐
research/assessments/*.md subdim tables ┤→ build-entity-records.mjs → entity records
                                        │   (real subdims where present, else reconstructed)
published composite/band/rank (frozen) ─┘   composite/rank copied verbatim; never recomputed
```

---

## 3. Storage-location decision (with justification)

**Decision: NEW source-controlled directory `site/src/data/entity-records/<slug>.json`. Do NOT extend
`public/data/scores/<slug>.json` as the canonical home.**

Rationale:

1. **Canonical input must be version-controlled and diffable.** Records are the new source of truth for scoring
   input. `public/data/scores/` is GENERATED by `export-public-data.mjs` as the `prebuild` step and is overwritten
   on every `npm run build`. Canonical data cannot live in a build-output directory — it would be clobbered and its
   provenance (git history, PR diffs) lost. This directly serves the Ledgerium principles: traceability of every
   requirement/evidence change to a commit.
2. **Index JSON stays the ranking source of truth.** Records are stored separately so the index files remain the
   authoritative, human-reviewed ranking artifact during and after transition. Records validate/derive dimensions;
   they do not (yet) replace the index as the order-of-record.
3. **Build-time cost is bounded if records are NOT bundled.** 1,256 files at ~2–6 KB each (40 subdims + evidence)
   ≈ 3–8 MB of source JSON — trivial for git. The risk is bundle bloat if a module `import`s all 1,256. **Rule:
   records must never be statically imported en masse into the client bundle.** They are read at build time by
   scripts and by `generateStaticParams`/per-route file reads, and served to the client only as individual fetched
   JSON (`public/data/records/<slug>.json`). This keeps the JS bundle flat regardless of entity count.
4. **Separation of source vs published artifact.** `export-public-data.mjs` gains a step that emits a DERIVED,
   trimmed copy to `public/data/records/<slug>.json` (subdims + evidence + derived dims + frozen composite). The
   existing `public/data/scores/<slug>.json` (composite/band/rank only, consumed by the Worker badge) is unchanged
   in shape for backward compatibility.

Rejected alternative — extend `public/data/scores/<slug>.json`: fails (1) because it is regenerated output;
storing evidence there would be lost on next build and would couple the Worker badge contract to a much larger
payload it does not need.

---

## 4. CRITICAL — dimension-value audit result

Audit method: classified every dimension value across all 8 index files (`AWR…INT` per entity), 1,256 entities ×
8 = **10,048 values**. A mean of five integers on a 1–5 scale is always a multiple of 0.2 (i.e. `value*5` is an
integer). Result (~10,037 classified; ~11 float-format edge cases unclassified, <0.2%):

| Class | Count | Multiple of 0.2? | Reconstructible from 5 integers? |
|---|---:|---|---|
| Bare integers (1,2,3,4,5; 0 = harm floor) | 4,332 | yes | yes |
| One-decimal even tenth (.0/.2/.4/.6/.8) | 232 | yes | yes |
| One-decimal odd tenth (.1/.3/.5/.7/.9) | 5,058 | **no** | no |
| Two-decimal quarter-step (.25/.75) | 415 | **no** | no (nor from 5 half-integers) |

**Multiples of 0.2 (integer-reconstructible): 4,564 / 10,048 = 45.4%.**
**NOT multiples of 0.2: 5,473 / 10,048 = 54.5%.**

Consequences:

- More than half of all dimension values cannot be produced as the mean of five integer subdimension scores.
- The 415 quarter-step values (concentrated in `universities.json`, some `ai-labs`/`countries`/`fortune-500`)
  cannot be produced as the mean of five half-integers either.
- At the entity level: because ~54.5% of individual values fail, virtually every entity has at least one
  non-0.2 dimension. **Integer-only subdim reconstruction is not viable for the corpus.**
- Newer, fully-assessed entities (e.g. Iran, whose frontmatter dims are 1.0/1.2 — clean multiples of 0.2) ARE
  integer-reconstructible; the failures are dominated by the legacy bulk import.

**Decision (subdim scale): continuous subdims in [1.0, 5.0], stored to 2 decimals.** This is the only scale that
guarantees exact reconstruction for the whole corpus.

---

## 5. Source-of-truth flip and derivation contract

Forward (new assessments) — subdims canonical:

```
dimension_score[k] = round( mean(subdim_score[k][1..5]), 2 )        # 0–5 scale, 2 dp
composite          = compositeCore([dimension_score[AWR..INT]]).final # existing formula, 1 dp
band               = getBand(composite)
```

Rounding placement (must match `compositeCore` exactly — see §8):

- subdim → dimension mean: round to **2 decimals** (dimension scores are stored at ≤2 dp; index legacy has 1–2 dp).
- dimension → composite: `compositeCore` internally rounds the final to **1 decimal** (`Math.round(final*10)/10`).
  Do NOT pre-round dimension values to 1 dp before feeding `compositeCore`; feed full-precision dimension means so
  the composite matches the formula the validator uses.

Relationship of index JSON to records:

- During transition the index `scores{}` (8 dims) is **duplicated-but-validated**: it is the ranking source of
  truth; the record's derived dims must equal it within tolerance (§7). The record is the canonical INPUT; the
  index is the canonical RANKING artifact. They are kept consistent by the validator, not by silent recompute.
- The record additionally stores the **frozen** published `composite`, `band`, `rank`, `index_slug` so a record is
  self-describing and auditable without joining back to the index.

Authoritative-for-rankings: **`site/src/data/indexes/*.json`** remains authoritative for order and published
composite until a future, separately-approved cutover flips ranking derivation onto records. This spec does NOT
perform that cutover.

---

## 6. Composite-invariance guarantee (exact statement)

Let `PUB_C(e)` and `PUB_R(e)` be the currently published composite and rank of entity `e` (from the index JSON).
After migration:

> **G1.** Every entity record stores `composite = PUB_C(e)` and `rank = PUB_R(e)` copied verbatim. The migration
> performs zero arithmetic on these values. Therefore no published composite or rank changes. (Bitwise identical.)

> **G2.** For every dimension `k`, the record's subdims satisfy `round(mean(subdims_k), 2) == index.scores[k]`
> exactly:
> - For **reconstructed** dimensions, all five subdims are set equal to `index.scores[k]`, so the mean is
>   `index.scores[k]` with no rounding error.
> - For **assessed** dimensions (real subdims parsed from prose), the migration only accepts the parsed subdims if
>   `round(mean, 2)` already equals `index.scores[k]`; otherwise it falls back to reconstruction (and reports the
>   entity). So the derived dim always equals the published dim.

> **G3.** Consequently `compositeCore(derivedDims).final == compositeCore(indexDims).final`. For non-override
> entities this equals `PUB_C(e)` within the existing validator tolerance (the same ≤1.0-point legacy rounding the
> validator already tolerates today — see check 10). For the ~40 `ASSESSOR_OVERRIDE_NAMES` entities, whose
> `PUB_C(e)` intentionally diverges from the formula, the record sets `composite_override = PUB_C(e)` and the
> validator treats the derived-vs-published gap as a warning, exactly as it does today.

Net guarantee: **published composites and ranks are unchanged (exact, G1); reconstructed dimension means reproduce
the published dimensions exactly (G2); the recompute pipeline reproduces the published composite within the
existing validator tolerance, and where it structurally cannot (overrides + legacy rounding) the frozen published
value remains authoritative via `composite`/`composite_override` (G3).** No entity is silently shipped with a
changed number; any record whose reconstruction cannot meet G2/G3 is reported by the dry-run and excluded.

---

## 7. Migration / backfill plan

Generator: `site/scripts/build-entity-records.mjs` — idempotent, dry-run-capable.

For each entity across all 8 index files:

1. **Load frozen published data** from the index row: `name`, `slug` (explicit `slug` field or `slugify(name)` per
   `export-public-data.mjs`), `scores{8 dims}`, `composite`, `band`, `rank`, `index_slug`, `kind`.
2. **Locate the newest assessment** `research/assessments/<slug>*.md` (handle dated filenames like
   `iran-2026-06-30.md`; pick the latest by date suffix). Optional; many entities have none.
3. **Parse real subdims where present.** From the assessment's "Dimension Details" tables (benchmark-research
   Step 6 format: rows `| A1 Suffering Detection | X/5 | evidence | source |`). Capture per-subdim `score` (X/5),
   and best-effort `evidence` quote + `source` URL + evidence `tier` if stated. Screening/near-floor assessments
   (e.g. reinforcement screens) that omit the 40-subdim tables yield NO real subdims → treat as absent.
   - Scale note / ambiguity: assessment frontmatter `scores{}` is inconsistent in the corpus (DATA_MODEL.md says
     0–100; recent files such as `iran-2026-06-30.md` store 0–5). The parser MUST read subdims from the per-subdim
     tables (always X/5), not from frontmatter, and MUST detect and normalize frontmatter scale by range when it
     needs it as a cross-check. Flag files whose scale is ambiguous.
4. **Validate parsed subdims per dimension.** Accept the parsed 5 subdims for dimension `k` only if
   `round(mean, 2) == index.scores[k]`. If accepted → mark that dimension `subdims_source: "assessed"`. If the mean
   disagrees with the published dim (stale assessment, since re-scored) → discard parsed subdims for that dimension
   and fall through to reconstruction; add entity to a `dimension_mismatch` report list.
5. **Reconstruct absent/rejected dimensions.** Set all five subdims equal to `index.scores[k]`
   (`subdims_source: "reconstructed"`, `confidence: "low"`, empty `evidence[]`, `assessed_date: null`). This is the
   honest representation: we know the dimension mean, not the subdim breakdown — do NOT fabricate a spread that
   implies subdim-level evidence we lack. (A future real assessment overwrites reconstructed subdims.)
6. **Freeze composite/band/rank verbatim** from the index (never recompute). Set `composite_override` iff the
   entity name is in `ASSESSOR_OVERRIDE_NAMES` OR `|compositeCore(dims).final - published_composite| > tolerance`.
7. **Self-check per entity (invariance gate):**
   - `round(mean(subdims_k),2) == index.scores[k]` for all k (G2). Fail → entity REPORTED, not written.
   - `compositeCore(derivedDims).final` vs published composite: within tolerance OR flagged override (G3).
   - Record `entity.record.composite === index.composite` and `.rank === index.rank` (G1).
8. **Write** `site/src/data/entity-records/<slug>.json` (only in apply mode).

Modes:

- `--dry-run` (default): computes and writes a REPORT only (`research/integrity-reports/subdim-backfill-<date>.md`
  or stdout), listing: total entities, #assessed dims, #reconstructed dims, entities with `dimension_mismatch`,
  entities failing G2/G3 (would-be-blocked), and slug collisions. Writes no record files.
- `--apply`: writes record files for all entities that PASS G1–G3. Entities that fail are listed and skipped
  (never silently shipped).
- `--only <slug>` / `--index <indexSlug>`: scope for incremental runs.

Backfill acceptance criterion: dry-run reports **0 entities failing G1/G2** and the G3 warning set equals the
existing `ASSESSOR_OVERRIDE_NAMES` set (plus any pre-existing ≤1.0 legacy-rounding warnings already tolerated by
`validate-indexes.mjs` check 10). Any new failure is a blocker to be resolved before apply.

---

## 8. Rounding / precision (must not introduce drift)

Single source of formula: `compositeCore` (`scoring.ts`) / `computeCompositeFromDimensions` (`scoring.mjs`). Do not
re-implement. Rules:

1. **Subdim → dimension:** `dim = round(sum(5 subdims)/5, 2)`. For reconstructed dims (all equal) this is exact.
   For assessed dims it must equal the stored index dim exactly (§7.4), so no new rounding is introduced relative
   to the published value.
2. **Dimension → composite:** feed FULL-PRECISION dimension means (not pre-rounded to 1 dp) into `compositeCore`,
   which applies the only composite rounding: `Math.round(final*10)/10` (1 dp). This reproduces the value the
   validator computes today.
3. **Do not round twice.** Never round the dimension to 1 dp and then feed it to the composite — the index already
   stores dims at their native precision (1–2 dp) and the validator already matches published composites against
   `computeCompositeFromDimensions(indexDims)`. Records must reuse the index dim values verbatim as the composite
   input so record-derived and index-derived composites are identical.
4. **Float determinism:** comparisons use an epsilon of `1e-9` for equality (matches JS float behavior for
   `value*5` integrality tests) and the existing point tolerances for composite comparison.

---

## 9. Validator changes (`validate-indexes.mjs`)

Add, without weakening existing checks:

- **Check 12 — record presence (transition-aware):** for each index entity, if a record file exists, validate it;
  if not, WARN (during transition records may be partial). After full backfill, flip to ERROR on missing record via
  a `--require-records` flag.
- **Check 13 — subdim structure:** record has exactly 8 dimensions × 5 subdims = 40; every subdim `score ∈ [1,5]`
  (or `0` harm floor mirroring the index's floor exception); `code`/`name` match `dimensions.ts`.
- **Check 14 — mean(subdims) == index dim:** `round(mean(subdims_k),2) == index.scores[k]` within `1e-9`. Failure
  is an ERROR (this is the G2 gate). Reconstructed dims should pass trivially.
- **Check 15 — record↔index composite consistency:** `record.composite === index.composite` and
  `record.rank === index.rank` (G1) — ERROR on mismatch.
- **Check 16 — derived composite vs published:** compute `compositeCore(derivedDims)` and compare to published,
  reusing the EXACT thresholds and the `ASSESSOR_OVERRIDE_NAMES` allowlist already in check 10. Interaction: an
  entity in `ASSESSOR_OVERRIDE_NAMES` MUST carry `composite_override` in its record; a record with
  `composite_override` set but NOT in the allowlist → WARN (drift candidate to reconcile the two lists). Keep the
  allowlist as the single canonical override registry; the record's `composite_override` is a mirror for
  self-description, not a second source of truth.

`ASSESSOR_OVERRIDE_NAMES` stays the authoritative override list. The migration reads it; it does not fork it.

---

## 10. Pipeline / agent contract changes

New required assessor output (fully-assessed entities): a machine-readable subdim block so records can be built
without re-parsing prose. Add to `benchmark-research` and `overnight-assessor` output an emitted JSON sidecar
`research/assessments/<slug>.subdims.json` (or a fenced ```json block) with the §DATA_MODEL record `subdimensions`
shape: 40 entries `{code,name,score,evidence:[{tier,url,date,quote}],confidence,assessed_date}`. Prose tables
remain for human readers; the sidecar is the contract.

- **benchmark-research.md:** Step 3/6 must ALSO emit the structured 40-subdim block (already scores 1–5 per subdim
  with evidence + source + tier). Frontmatter dimension scale must be standardized to 0–5 raw (matching index) to
  end the 0–100 vs 0–5 ambiguity; document the conversion.
- **overnight-assessor.md / score-updater.md:** a change proposal that alters a dimension MUST include the 5 subdim
  scores + evidence that produce the new dimension mean (not just the dimension delta). `score-updater` writes/
  updates BOTH the index row (existing contract) AND the entity record (`subdimensions`, derived dims, frozen
  composite/band/rank). It must keep `record.composite === index.composite` after applying (G1).
- **Backward compatibility:** dimension-level entities coexist with subdim-level records throughout transition.
  Entities without records are valid (validator WARN, not ERROR) until `--require-records` is enabled. No pipeline
  step is blocked by a missing record.

---

## 11. Sequenced implementation plan (owner per step)

| # | Step | Owner | Gate / artifact |
|---|---|---|---|
| 1 | Approve this spec + DATA_MODEL v2 | founder | sign-off |
| 2 | Add record TypeScript type + Zod/schema validator; wire `dimensions.ts` code/name map | backend-engineer | type compiles; schema unit test |
| 3 | Build `build-entity-records.mjs` with `--dry-run` (parse + reconstruct + G1–G3 self-check + report) | backend-engineer | dry-run report: 0 G1/G2 failures |
| 4 | Review dry-run report; reconcile any `dimension_mismatch` and any new G3 warnings vs `ASSESSOR_OVERRIDE_NAMES` | architect + founder | report signed off |
| 5 | `--apply`: generate 1,256 records under `site/src/data/entity-records/` | backend-engineer | files written; git diff reviewed |
| 6 | Extend `validate-indexes.mjs` (checks 12–16); run in CI/prebuild | backend-engineer | validator green (warnings = override set only) |
| 7 | QA determinism gate: extend `test-scoring.mjs` — record-derived dims → composite equals index composite for a golden sample (incl. override + quarter-step + harm-floor cases) | qa | `npm run test:scoring` passes |
| 8 | Extend `export-public-data.mjs` to emit `public/data/records/<slug>.json`; confirm `scores/<slug>.json` shape unchanged (Worker badge unaffected) | backend-engineer | build output diff; badge smoke test |
| 9 | Update agent contracts (§10) + standardize assessment frontmatter scale | agent-contracts / architect | agents emit subdim sidecar |
| 10 | (Optional, later) Frontend: entity detail shows per-subdim evidence, fetching one record | frontend-engineer | **must read `node_modules/next/dist/docs/` first (site/AGENTS.md)** |
| 11 | (Optional, later, separate approval) Cutover: derive rankings from records instead of index JSON | architect + backend | NOT in this spec |

---

## 12. Risks and open items

- **R1 — Stale assessments.** Parsed subdim means may disagree with the current published dim (entity re-scored
  since the assessment). Mitigation: §7.4 discards mismatched parses and reconstructs; entity is reported, not
  silently accepted.
- **R2 — Reconstructed subdims look like data.** Five-equal continuous subdims can be misread as real evidence.
  Mitigation: `subdims_source:"reconstructed"`, `confidence:"low"`, empty `evidence[]`; frontend must visually mark
  reconstructed subdims as "dimension-only, subdimension breakdown pending."
- **R3 — Override list / `composite_override` drift.** Two places encode overrides. Mitigation: allowlist is
  canonical; check 16 WARNs on any record override not in the list; single owner reconciles.
- **R4 — Bundle bloat.** Importing all records into the client bundle would balloon it. Mitigation: hard rule —
  records are read at build time / fetched per-slug only (§3.3).
- **R5 — Slug collisions.** `export-public-data.mjs` already handles intra/cross-index collisions; the record
  generator MUST reuse the identical slug logic (explicit `slug` field → else `slugify(name)`, `-{rank}` on
  duplicate) so record filenames align with badge/detail URLs.
- **R6 — Universities quarter-steps.** 379 of 415 quarter-step values are in `universities.json`; these are heavily
  reconstructed (few/no assessments). Expect near-100% reconstructed subdims there — acceptable, but flag in the
  report so the corpus quality is visible.
- **R7 — Two-decimal precision vs stored index precision.** Some index dims are 2 dp (2.75); records store subdims
  to 2 dp and reuse the index dim verbatim for composite input (§8.3), so no precision loss is introduced.

---

## 13. Handoff summary

- Architecture overview: §2, §5. Contracts: §5, §6, DATA_MODEL_SUBDIMENSIONS.md. Data model: DATA_MODEL_SUBDIMENSIONS.md.
- Sequencing: §11. Open risks: §12.
- Downstream: backend-engineer (steps 2–8), qa (step 7), agent-contracts (step 9), frontend-engineer (step 10,
  read Next docs first), devops (CI wiring of validator).
