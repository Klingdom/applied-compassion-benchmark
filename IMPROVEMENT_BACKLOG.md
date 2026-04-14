# IMPROVEMENT BACKLOG — Compassion Benchmark

Generated: 2026-04-14 | Loop: 1

## Scoring Model

Priority Score = Impact + Strategic Alignment + Learning Value + Confidence − Effort − Risk

---

## Top 10 Candidates

### 1. Fix 4 failing interactive tests
- **Type:** Fix
- **Problem:** `last-run.json` shows `status: "failed"` with 4 failures — 3 ResearchConfigurator tests and 1 SelfAssessment test. The "54 tests passing" claim is now false. Uncommitted SelfAssessment.tsx changes likely caused the regression.
- **Expected benefit:** Restores test integrity baseline — prerequisite for all other validation.
- **Evidence:** `test-results/.last-run.json` status: failed; 4 untracked error directories in test-results/
- **Impact:** 5 | **Strategic Alignment:** 5 | **Learning Value:** 3 | **Confidence:** 5 | **Effort:** 2 | **Risk:** 2
- **SCORE: 14**
- **Status:** ✅ COMPLETE (Loop 1 — 2026-04-14)

### 2. SelfAssessment hardcoded dimension count (/8)
- **Type:** Fix
- **Problem:** `calcScores` divides by literal `8` in two places instead of `DIMENSIONS.length`. Silent score corruption if dimensions change.
- **Expected benefit:** Self-consistent scoring formula; correctness guarantee.
- **Evidence:** SelfAssessment.tsx lines 26, 29 — `/ 8` hardcoded vs dynamic DIMENSIONS array.
- **Impact:** 4 | **Strategic Alignment:** 5 | **Learning Value:** 2 | **Confidence:** 5 | **Effort:** 1 | **Risk:** 1
- **SCORE: 14**
- **Status:** Queued

### 3. Homepage stat claims inconsistent with data
- **Type:** Fix
- **Problem:** Homepage says "25 AI labs" (actual: 50) and "5 index families" (actual: 7). Credibility-damaging for a benchmark institution.
- **Expected benefit:** Prevents first-impression credibility damage with press, researchers, executives.
- **Evidence:** Homepage page.tsx vs data files and rendered index pages.
- **Impact:** 4 | **Strategic Alignment:** 4 | **Learning Value:** 2 | **Confidence:** 5 | **Effort:** 1 | **Risk:** 1
- **SCORE: 13**
- **Status:** Queued

### 4. Self-Assessment results dead-end — no conversion CTA
- **Type:** Fix
- **Problem:** Users who complete the 40-question assessment see a score but no next step — no link to certified assessments, contact sales, or reports.
- **Expected benefit:** Converts highest-intent user action into revenue signal.
- **Evidence:** SelfAssessment.tsx results state has no CTA; no link to /certified-assessments or /contact-sales post-result.
- **Impact:** 5 | **Strategic Alignment:** 4 | **Learning Value:** 3 | **Confidence:** 4 | **Effort:** 2 | **Risk:** 1
- **SCORE: 13**
- **Status:** Queued

### 5. ResearchConfigurator routes to contact-sales, not Gumroad
- **Type:** Fix
- **Problem:** Configurator builds a contact-sales URL instead of Gumroad purchase link. Blocks self-serve revenue despite 5 live Gumroad URLs existing unused.
- **Expected benefit:** Removes full sales-cycle friction; enables first unassisted revenue.
- **Evidence:** ResearchConfigurator.tsx line 49 href → /contact-sales; gumroad.ts has 5 product URLs unused in this flow.
- **Impact:** 5 | **Strategic Alignment:** 4 | **Learning Value:** 3 | **Confidence:** 4 | **Effort:** 2 | **Risk:** 1
- **SCORE: 13**
- **Status:** Queued

### 6. JSON data schema validation at build time
- **Type:** Fix
- **Problem:** 7 JSON files have no schema enforcement. Typos in dimension codes or missing fields silently produce broken UI.
- **Expected benefit:** Deterministic build failures on malformed data.
- **Evidence:** ai-labs.json dimension codes must match dimensions.ts — coupling is entirely implicit.
- **Impact:** 4 | **Strategic Alignment:** 5 | **Learning Value:** 3 | **Confidence:** 4 | **Effort:** 2 | **Risk:** 1
- **SCORE: 13**
- **Status:** Queued

### 7. Data integrity tests (entity counts, rank contiguity)
- **Type:** Fix
- **Problem:** No test validates data correctness — e.g., 447 Fortune 500 entries exist, ranks are contiguous, scores sum correctly.
- **Expected benefit:** Catches data extraction regressions before deployment.
- **Evidence:** meta.entityCount in JSON is never asserted against actual array length.
- **Impact:** 4 | **Strategic Alignment:** 5 | **Learning Value:** 2 | **Confidence:** 5 | **Effort:** 1 | **Risk:** 1
- **SCORE: 14**
- **Status:** Queued

### 8. Homepage missing title tag
- **Type:** Fix
- **Problem:** Homepage metadata has description but no title. Search engines and social previews show fallback.
- **Expected benefit:** Immediate improvement in search snippet and social share quality.
- **Evidence:** page.tsx metadata object has only description field.
- **Impact:** 3 | **Strategic Alignment:** 3 | **Learning Value:** 1 | **Confidence:** 5 | **Effort:** 1 | **Risk:** 1
- **SCORE: 10**
- **Status:** Queued

### 9. Entity search on ranking pages
- **Type:** Improvement
- **Problem:** No name search on ranking tables. Users looking for a specific company must scroll 447 rows.
- **Expected benefit:** Increases engagement, reduces bounce, creates conversion moment.
- **Evidence:** RankingTable has sector filter but no text search. Fortune 500 has 447 rows.
- **Impact:** 4 | **Strategic Alignment:** 3 | **Learning Value:** 3 | **Confidence:** 4 | **Effort:** 3 | **Risk:** 1
- **SCORE: 10**
- **Status:** Queued

### 10. SelfAssessment scoring unit tests
- **Type:** Improvement
- **Problem:** calcScores and getBand contain multi-step math with no unit tests. Edge cases untested.
- **Expected benefit:** Catches regressions in score calculation.
- **Evidence:** No unit test files exist in repo; calcScores is a pure function.
- **Impact:** 4 | **Strategic Alignment:** 4 | **Learning Value:** 3 | **Confidence:** 4 | **Effort:** 2 | **Risk:** 1
- **SCORE: 12**
- **Status:** Queued
