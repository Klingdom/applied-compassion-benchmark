# ITERATION LOG — Compassion Benchmark

## Iteration 1 — 2026-04-14

### Selected Item
Fix 4 failing interactive tests (Backlog #1, Score: 14)

### Reason for Selection
Tests are the foundation of the improvement loop. The system was in a degraded state with 4 failing tests, blocking reliable validation of all future changes. Determinism principle: restore the ability to prove correctness before adding anything new.

### Root Cause Analysis
The 4 test failures were NOT caused by code bugs. Root cause: Playwright config had no `webServer` directive, requiring a manually-started dev server on port 3000. A stale/crashed server was returning 500 errors, causing all interactive component tests to fail.

### What Changed
- **`playwright.config.ts`**: Added `webServer` config to auto-start a static file server (`npx serve out -l 3000`) before tests run, with `reuseExistingServer` for local dev convenience
- **`test-results/`**: Cleaned up stale error artifacts from failed runs
- **SelfAssessment email gate** (pre-existing uncommitted change): Confirmed working — all SelfAssessment tests pass with the new email capture feature

### Agents Involved
- product-manager — candidate generation
- system-architect — candidate generation
- qa-engineer — candidate generation
- growth-strategist — candidate generation
- coordinator — root cause analysis, implementation, validation

### Validation Results
- Build: ✅ All 27 routes compile successfully
- Tests: ✅ 54/54 Playwright tests pass (8.5s)
- Determinism: ✅ Tests now auto-start their own server — no manual setup required
- Regression: ✅ No regressions detected

### Outcome
Test infrastructure is now self-contained and deterministic. Running `npx playwright test` works from a cold start without any manual server setup. This eliminates the class of "stale server" failures permanently.

### Follow-ups
- Backlog #2: Fix hardcoded `/8` in SelfAssessment scoring (Score: 14)
- Backlog #3: Fix homepage stat inconsistencies (Score: 13)
- Backlog #4: Add conversion CTA to SelfAssessment results (Score: 13)

---

## Iteration 2 — 2026-04-14

### Selected Item
Fix all factual errors, broken links, and internal copy on public pages

### Reason for Selection
A benchmark institution publishing wrong numbers and internal planning notes destroys the core value proposition. Every specialist agent rated this as the #1 priority. Combined as one item because all fixes are the same class (wrong/unprofessional content) and each is a 1-2 line change.

### What Changed
- **Homepage (`page.tsx`)**: Fixed "780" → "1,155" entities, "5" → "7" index families, "AI Labs: 25" → "50", "five primary" → "seven", added missing title metadata
- **Indexes page (`indexes/page.tsx`)**: Fixed broken Gumroad link (string literal → variable reference), removed duplicate import, fixed "780" → "1,155", "5" → "7", "five" → "seven", replaced internal planning copy with user-facing text, fixed meta description
- **Purchase research (`purchase-research/page.tsx`)**: Fixed "5" → "7" index families
- **SelfAssessment (`SelfAssessment.tsx`)**: Replaced hardcoded `/8` with `DIMENSIONS.length` in calcScores()
- **Test (`home.spec.ts`)**: Updated entity count assertion from 780 to 1,155

### Agents Involved
- Explore agent — deep codebase audit (every file)
- ux-designer — UX flow audit and prioritization
- qa-engineer — bug triage and severity rating
- coordinator — verification, implementation, validation

### Validation Results
- Build: ✅ All 27 routes compile
- Tests: ✅ 54/54 pass
- Regression: ✅ None

### Outcome
All publicly visible factual errors are corrected. The broken Gumroad purchase link now works. Internal planning notes replaced with professional copy. Scoring formula is now dynamic.

### Follow-ups
- Add post-assessment CTA flow to SelfAssessment results
- Add keyboard accessibility to Navbar Tools dropdown
- Add aria-label to RankingTable search input
- Add missing Gumroad links for US States and US Cities

---

## Iteration 3 — 2026-04-16

### Selected Item
Add data integrity validation for all 7 index JSON files (Backlog #7, Score: 15)

### Reason for Selection
The overnight research pipeline now modifies production JSON data nightly — 3 files were changed in the first run. No validation existed to catch structural corruption, rank errors, or score-out-of-range issues. Pre-implementation check found **2 real issues**: us-states rank gaps and band count mismatch (both known data characteristics, now documented). Determinism and traceability principles: prove data correctness before every deploy.

### What Changed
- **`scripts/validate-indexes.mjs`** (new): Comprehensive validation script with 11 check categories:
  1. JSON parse integrity
  2. Meta field presence and types
  3. Required ranking fields per index (with index-specific field maps)
  4. All 8 dimension codes present in every entity
  5. Score ranges: raw 0-5, composite 0-100
  6. Rank contiguity (1..n, no gaps, no duplicates)
  7. meta.entityCount vs rankings.length consistency
  8. Band count sum vs entity count
  9. Band name/range validity
  10. Composite ≈ mean of scaled dimension scores (with legacy tolerance)
  11. Band assignment matches composite (with boundary tolerance)
- **`package.json`**: Added `npm run validate` script
- **Known data handling**: US States partial data (21/51) documented with `KNOWN_PARTIAL` config; legacy composite formula offset (up to ~5 points) handled with warning thresholds
- **Test fixes**: Fixed 4 pre-existing test failures from prior UI changes:
  - `home.spec.ts`: Updated 1,155 stat locator for Stat component
  - `navigation.spec.ts`: Updated for Indexes dropdown button and /updates link
  - `interactive.spec.ts`: Updated for Gumroad direct-purchase default path
  - `ranking-table.spec.ts`: Fixed sort test to find Score column by header position

### Agents Involved
- qa-engineer — candidate generation (testing/quality gaps)
- system-architect — candidate generation (architecture/data safety gaps)
- product-manager — candidate generation (product value/revenue gaps)
- coordinator — scoring, selection, implementation, validation

### Validation Results
- Build: ✅ All 27 routes compile
- Tests: ✅ 54/54 Playwright tests pass (10.8s)
- Data validation: ✅ 12,686 checks passed, 0 errors, 181 warnings
- Warnings: All 181 are documented legacy data characteristics (composite formula offset, band boundary ambiguity)
- Regression: ✅ None

### Outcome
Every index file is now validated with 11 categories of structural checks. The `npm run validate` command can be run before any deploy or after any pipeline modification. The validation correctly distinguishes between errors (would catch corruption) and warnings (documents known legacy characteristics). Four pre-existing test failures were also fixed, restoring full green test suite.

### Follow-ups
- Integrate `npm run validate` into deploy.sh as a pre-deploy gate
- Add validation as a CI step when CI pipeline is created
- Self-Assessment results CTA (Score: 15)
- Analytics instrumentation (Score: 15)
- JSON schema validation at build time (Score: 14)
