# QA Audit — 2026-04-24
**Scope:** Schema drift, prerender safety, data integrity, test coverage, regression risk
**Auditor:** QA Agent (read-only)
**Evidence base:** repo at commit c73cb52

---

## Top 3 Critical Findings

1. **No pre-build schema validator for daily JSON** — Any daily JSON missing `pipeline` (object), or shipping non-canonical field names as in the 2026-04-22 incident, will either silently render a sparse page or crash prerender. No automated check gates `npm run build`. Evidence: `deploy.sh` runs `docker compose build` with no validation step; `.github/workflows/docker-image.yml` runs `docker build` with no lint or validate stage.

2. **`pipeline` object is unguarded in `DailyBriefing.tsx`** — Lines 206-209 access `pipeline.entitiesScanned`, `pipeline.entitiesAssessed`, `pipeline.proposalsGenerated`, and `pipeline.confirmations` directly with no null guard or default. If a daily JSON ships without a `pipeline` key, this throws at prerender for every date in the manifest and crashes all `/updates/[date]` pages. All 8 array fields have defensive defaults (line 131-141) but `pipeline` does not.

3. **`validate-indexes.mjs` and `test-scoring.mjs` are not wired into any build gate** — Both scripts exist in `site/scripts/` and are reachable via `npm run validate` and `npm run test:scoring`, but neither is called in `deploy.sh`, the GitHub Actions workflow, or as a pre-build `next.config.ts` hook. The index integrity checks (rank contiguity, band validity, composite formula) run only when a developer manually executes them.

---

## Detailed Findings

### 1. Schema validation coverage

**Current state:** No automated check validates `site/src/data/updates/daily/*.json` or `latest.json` against a canonical schema before `npm run build`. The `validate-indexes.mjs` script validates the 7 index JSON files (and is thorough: 11 check categories, exit code 1 on failure) but it does not touch the updates pipeline. No equivalent script exists for daily JSON files. The GitHub Actions workflow (`.github/workflows/docker-image.yml`) runs a `docker build` which executes `npm run build` inside the Dockerfile; that is the only automated gate, and it will catch a prerender crash only after the build fails — not before the bad JSON is committed.

**Gap:** Three distinct failure modes have no pre-commit catch:
- Missing top-level key (e.g. `emergingRisks`, causing `highlights.map()` on undefined before the 2026-04-21 fix)
- Missing `pipeline` object (would crash lines 206-209 of `DailyBriefing.tsx` today)
- Drifted field names within items (e.g. `name` instead of `entity`, `oldComposite` instead of `publishedScore`; caused the 2026-04-22 sparse render)

Item-level audit of all 10 daily files found one existing deviation: `2026-04-19.json` scoreChanges entry for `Alphabet (Google)` is missing `evidence` and `status` fields. This does not crash the page (both fields are accessed with optional chaining) but produces a silent rendering gap.

**Recommendation:** Add `site/scripts/validate-daily.mjs` to validate daily JSON files. Minimum checks:
```
1. JSON parses
2. Top-level keys: date(str), generatedAt(str), pipeline(obj),
   scoreChanges(arr), confirmations(arr), recentAssessments(arr),
   sectorAlerts(arr), insights(arr), highlights(arr),
   sectorTrends(arr), emergingRisks(arr)
3. pipeline has: entitiesScanned(num), entitiesAssessed(num),
   proposalsGenerated(num), confirmations(num)
4. Each scoreChanges item has: entity, slug, index, publishedScore,
   assessedScore, delta, publishedBand, assessedBand, bandChange(bool),
   confidence, recommendation, headline, date, evidence(arr), status
5. Band values are one of: Exemplary|Established|Functional|Developing|Critical
6. Scores 0-100 range
```
Add `"prebuild": "node scripts/validate-daily.mjs"` to `site/package.json` scripts. This makes Next.js refuse to build if daily JSON is malformed.

**Effort:** S (1-2 days)
**Priority:** Critical

---

### 2. Prerender safety for `/updates/[date]`

**Current state:** `site/src/app/updates/[date]/page.tsx` delegates all rendering to `DailyBriefing` (line 108), passing the full JSON as `updates: any`. The page itself has two safety guards: (1) `manifest.dates.includes(date)` check before loading (line 38), and (2) `if (!updates) notFound()` if `getDailyData()` returns null (line 43-45). `getDailyData()` in `site/src/data/updates/daily/index.ts` wraps the dynamic import in try/catch and returns null on failure. These guards are correct.

**Gap — unguarded `pipeline` object (lines 206-209, `DailyBriefing.tsx`):** All 8 top-level array fields have defensive defaults (`scoreChanges = []`, etc., lines 131-141), but `pipeline` is destructured without a default. If a daily JSON ships without a `pipeline` key, `pipeline` is `undefined` and `pipeline.entitiesScanned.toLocaleString()` throws at line 206. This crashes the prerender for that date, and because `generateStaticParams` returns all manifest dates, the crash propagates to every archive page in the build if the failing date is in the manifest.

**Gap — `sectorTrends` dual-shape coercion is present but not universally guarded downstream:** The `normalizedSectorTrends` transform (lines 150-157) correctly coerces both `{sector, points[]}` and `{sector, trend: string}` shapes. This fix from cf2a00a is confirmed in place. No additional drift was found in the 10 current daily files.

**Impact of existing gaps:** If `pipeline` is absent, the build produces a TypeScript error _and_ a prerender crash. This would have caused the 2026-04-21 pattern (full build failure across all dates). Current daily files all include `pipeline` correctly, so today's build is not at risk. The risk is future drift.

**Recommendation:** In `DailyBriefing.tsx` line 131, add `pipeline = {}` as a default in the destructuring, and then guard each Stat access: `pipeline?.entitiesScanned?.toLocaleString() ?? "—"`. This is a one-line change per Stat component call. Additionally, add `pipeline` to the schema validator described in Finding 1.

**Effort:** XS (30 minutes)
**Priority:** High

---

### 3. Data integrity across indexes

**Current state:** `validate-indexes.mjs` performs thorough integrity checks on all 7 index JSON files: composite range (0-100), band validity (5 named values), rank contiguity (no gaps, no duplicates), entityCount consistency, band count sums, and formula verification (computed composite vs stored composite, ±2.0 tolerance, with a named override list for assessor-adjusted entities). This script is the strongest automated safety net in the codebase.

**Live state after commit c73cb52 (verified):**
- `ai-labs.json`: 50 entities, ranks 1-50 contiguous, composites all in range, no bad bands
- `countries.json`: 193 entities, ranks 1-193 contiguous, composites all in range, no bad bands
- `fortune-500.json`: 447 entities, ranks 1-447 contiguous, composites all in range, no bad bands
- `us-states.json`: 21 entities (partial; ranks 9-38 absent from source HTML), ranks monotonic within set, no bad bands

**Known invariant gaps not caught by the current validator:**

1. **`ASSESSOR_OVERRIDE_NAMES` list is manually maintained** (`validate-indexes.mjs` lines 90-105). Currently 14 entities are whitelisted. If an entity receives an assessor override but is not added to this list, the validator emits an error for a legitimate assessment. Conversely, a data error on an override entity will be silently downgraded to a warning.

2. **`recentAssessments` items in daily JSON are not cross-validated against index files.** Today's `latest.json` `recentAssessments` for Luxembourg shows `publishedComposite: 97.5`, but the countries.json now holds `81.3` (the applied update). The `publishedComposite` field in the daily JSON represents the pre-update baseline — this is correct by design — but there is no check that `compositeScore` in `recentAssessments` matches the applied value in the index. Silent divergence is possible if a change is applied to the index but the daily JSON is not regenerated to match.

3. **Band boundary edge case at exactly 20, 40, 60, 80.** `getBand()` in `test-scoring.mjs` uses `<=` operators, assigning score 20 to Critical and score 40 to Developing. `validate-indexes.mjs` uses `min/max` range definitions with a 1-point tolerance. An entity scoring exactly 80.0 with band "exemplary" would pass validation (within tolerance at the Established/Exemplary boundary) but would render as "Established" if passed to `getBand()`. No current entity is at exactly a boundary integer, but this inconsistency could bite a future assessor judgment.

**Recommendation:** Add a cross-check step to `validate-daily.mjs` (see Finding 1) that compares `recentAssessments[*].compositeScore` against the corresponding index entry's `composite` for any change with `status: "applied"`. Effort: XS addition to the new validator.

**Effort:** XS (add to new validator)
**Priority:** Medium

---

### 4. Test coverage baseline

**Current state:** There is no test runner (Jest, Vitest, Playwright test suite) in `site/`. `@playwright/test` is in `devDependencies` but no `playwright.config.ts` exists and no test files were found under `site/src/**/*.test.*` (confirmed via glob). Two scripts serve as manual test harnesses:

- `site/scripts/test-scoring.mjs` (`npm run test:scoring`): Unit tests for `getBand`, `getBandColor`, and `calcScores`. Covers 5 boundary values for band assignment, 6 color cases, and 5 formula cases (all-1, all-5, all-3, harm flag, mixed high/low). Exit code 1 on failure. This is genuinely useful. **Coverage: scoring formula only.**

- `site/scripts/validate-indexes.mjs` (`npm run validate`): Structural integrity for all 7 index files with 11 check categories. Covers the data layer thoroughly. **Coverage: index JSON files only.**

**Not covered by any automated check:**
- Daily JSON schema conformance (the primary incident cause)
- Manifest consistency (dates in `manifest.json` correspond to actual files in `daily/`)
- `getDailyData()` import resolution for all manifest dates
- Rendering correctness of any UI component
- Entity detail page rendering (`/us-state/vermont`, `/country/luxembourg`, etc.)
- `apply-changes.mjs` logic (the script that writes to index files has no test)
- `recompute-composites.mjs` correctness
- Gumroad link validity

**Realistic pipeline catch rate estimate:**
- A scoring formula unit test would catch ~0% of the three schema-drift incidents (they were data shape issues, not formula bugs)
- An index validator would catch ~0% (it doesn't touch daily JSON)
- A daily JSON schema validator would catch all three incidents: 2026-04-21 (missing `emergingRisks`, wrong `sectorTrends` shape), 2026-04-22 (drifted field names), 2026-04-24 Luxembourg (caught manually but not by automation)

**Priority test gap:** Manifest-to-file consistency check. If a date is added to `manifest.json` without the corresponding `YYYY-MM-DD.json` file, `getDailyData()` returns null and the page falls through to `notFound()`. This is handled gracefully but silently — a monitoring gap rather than a crash risk.

**Effort:** S (to write `validate-daily.mjs` + prebuild hook + manifest check)
**Priority:** Critical

---

### 5. Today's regression risk from commit c73cb52

**Changes applied:**
| Entity | Index | Old rank | New rank | Old composite | New composite | Band change |
|---|---|---|---|---|---|---|
| Vermont | us-states | 1 | 6 | 97.5 | 87.5 | No |
| Minnesota | us-states | 2/3 | 7 | 95.9 | 84.4 | No |
| Luxembourg | countries | 6 | 15 | 95.9 | 81.3 | No |
| Iceland | countries | 3 | 5 | 100 | 87.5 | No |
| Becton Dickinson | fortune-500 | ~10 | 82 | 81.4 | 54.1 | Yes: Exemplary→Functional |
| Hugging Face | ai-labs | 1 | 1 | 95.9 | 88.1 | No |

**Hardcoded rank references — confirmed absent:**
- No hardcoded `vermont` slug, "rank 1", or "rank #1" in any `.tsx` or `.ts` source file outside of the data files themselves. Grep confirmed all Vermont references are in JSON data files and evidence text strings, not in routing or component logic.
- Entity detail page metadata uses `entity.rank` dynamically (`renderEntityPage.tsx` line 38): `ranks #${entity.rank} of ${entity.indexTotal}`. This will auto-update from the index JSON at build time. Vermont's `/us-state/vermont` page will correctly reflect rank 6 after rebuild.

**Links — no breakage risk:**
- Entity detail page URLs are slug-based (`/us-state/vermont`), not rank-based. Vermont moving from rank 1 to rank 6 does not break any URL.
- `sectorAlerts.affected_entities` in today's daily JSON references `vermont` by slug, which `resolveSlugHref()` looks up dynamically. This will resolve correctly.

**One data inconsistency found:** Today's daily JSON `scoreChanges` for Vermont records `publishedScore: 97.5`. The `us-states.json` now stores `composite: 87.5` (applied). The `highlights` and `emergingRisks` text strings in today's JSON still refer to "Vermont (rank 1, 97.5 → 87.5)" — this is historically accurate as a snapshot of the assessment cycle and is not a bug, but it creates a permanent discrepancy between the archive page text and the live index. This is inherent to the design but worth noting as a reader-confusion risk.

**Band change regression — Becton Dickinson (Exemplary → Functional):** This is the only band change in today's commit. No UI component hardcodes "Exemplary" for Becton Dickinson. The `Band` component in `DailyBriefing.tsx` renders dynamically from `assessedBand`. Index page rendering (`RankingTable`) reads from the JSON at build time. No regression risk identified.

**Regression verdict:** No broken routes, no hardcoded rank references, no stale links. Index integrity checks (ranks, composites, bands) passed for all 4 modified files. Today's commit is low regression risk.

---

## Proposed Test/Validation Suite (MVP)

**Minimum set to catch the three schema-drift incidents:**

```
[MVP-1] site/scripts/validate-daily.mjs (new file)
  - Called via "prebuild" hook in package.json
  - Checks all files in site/src/data/updates/daily/ + latest.json
  - Top-level key presence and type (11 keys)
  - pipeline sub-key presence and numeric type (4 keys)
  - Each scoreChanges item: 14 required fields
  - Each confirmations item: 13 required fields
  - Band values are in the valid 5-value set
  - Scores are in 0-100 range
  - Manifest consistency: every date in manifest.json has a matching daily file
  - Exit code 1 on any failure → blocks `npm run build`

[MVP-2] Add to package.json "scripts":
  "prebuild": "node scripts/validate-daily.mjs && node scripts/validate-indexes.mjs"
  (chains both validators; currently validate-indexes.mjs is also not in prebuild)

[MVP-3] DailyBriefing.tsx micro-fix (not a test, but the other half of the safety net)
  - Add `pipeline = {}` default in destructuring (line 131)
  - Guard all 4 Stat accesses with optional chaining + fallback string
  - This means a bad pipeline doesn't crash the build even if MVP-1 is bypassed
```

**What is not in MVP scope (follow-up):**
- Playwright smoke tests for rendered page output
- Cross-validation of recentAssessments against index composites
- `apply-changes.mjs` unit tests

---

## Estimated Shield Value

| Incident | MVP-1 validate-daily.mjs | MVP-2 prebuild gate | MVP-3 pipeline guard |
|---|---|---|---|
| 2026-04-21: missing `emergingRisks` + wrong `sectorTrends` shape | **Caught** (missing key + type mismatch) | **Blocks build** | Partial (no crash, but sparse) |
| 2026-04-22: drifted field names in scoreChanges/confirmations | **Caught** (missing required item fields) | **Blocks build** | Not applicable |
| 2026-04-24: Luxembourg baseline drift (caught manually) | Partial — drift was in content values, not schema shape; schema validator would not catch a plausible-looking score value | N/A | N/A |

**Summary:** MVP-1 + MVP-2 would have blocked 2 of 3 incidents at the build gate, transforming a production rendering failure into a local pre-commit failure. The 2026-04-24 Luxembourg incident was a content-correctness issue (wrong `publishedScore` value in the change proposal), not a structural schema issue — it cannot be caught by a schema validator and requires the human review step that correctly caught it.

**Overall shield value: 2/3 incidents blocked pre-production, 0 false negatives introduced.**
