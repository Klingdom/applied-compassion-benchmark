# IMPROVEMENT BACKLOG — Compassion Benchmark

Generated: 2026-04-14 | Last updated: **Iteration 9 (2026-06-20)** — Methodology-page hardening

## Scoring Model

Priority Score = Impact + Strategic Alignment + Learning Value + Confidence − Effort − Risk

---

## Iteration 9 — Methodology-Page Hardening (founder-authorized multi-item push)

Source: 5-lens review (system-architect, benchmark-research, ux-designer, knowledge-architect,
frontend-engineer) of `/methodology` on 2026-06-20. Founder authorized "all improvements + quick-wins."
Split into **Tranche A** (doc/page/code-only — NO published-score change, implemented this iteration in
validated waves) and **Tranche B** (changes the scoring formula or published scores — GATED behind the
editorial human-approval rule; `score-updater` is human-triggered only and must NOT auto-run).

### Tranche A — ✅ COMPLETE (Iteration 9, 2026-06-20 — no score changes; tsc clean, build 1,880 pages)
> Plus a coordinator-found correction: the page's systemic "base /80" formula model was incoherent and
> contradicted `scoring.ts`; corrected site-wide (page + both chart components). Worked example reconciles.

| # | Item | Type | Score | Wave | Source |
|---|------|------|-------|------|--------|
| A7 | Show integration-premium arithmetic in Abridge worked example (formula already in `dimensions.ts:634`) | Improvement | **14** | 3 | knowledge R1 |
| A1 | Fix anchor-table header "0·1·2·3·4 = Exemplary" → correct 0–5 scale (page.tsx:811) — unanimous | Fix | **13** | 1 | all 4 lenses |
| A3 | Version sync: hero stat + changelog v1.1 → **v1.2** to match live engine (`scoring.mjs:22`) | Fix | **13** | 1/2 | arch W1, research C4 |
| A6 | Document the 3 hidden governing rules: victim/perpetrator attribution, near-floor limitation, harm-flag (0.0) floor | Improvement | **13** | 2 | arch W2/W3, research G1-3 |
| A2 | Complete TOC + fix broken `#continuous-pipeline` anchor + dedupe "Framework overview" label | Fix | **12** | 1 | ux P2/P3, frontend I2/I3/I8 |
| A8 | Evidence notes: recency/decay rule, "served population" per entity type, positive-evidence search | Improvement | **12** | 2 | research R2/R5/C3 |
| A5 | Data-drift: derive worked-example rows + "Assessors in practice" from `DIMENSIONS` | Fix | **11** | 1 | frontend R4/R7 |
| A9 | "3-minute summary" panel above the fold for journalists | Improvement | **10** | 3 | ux R4, knowledge R2 |
| A10 | Move newsletter signup out of mid-stream scoring explanation | Fix | **9** | 3 | ux R3 |
| A11 | "Two kinds of scores" (normal vs floor) + "if you remember one thing" closer | Improvement | **9** | 3 | knowledge R4/R5 |
| A4 | Gate back-to-top button on scroll threshold (comment claims CSS gating that doesn't exist) | Fix | **8** | 1 | ux P6, frontend I6 |

### Tranche B — GATED (changes published scores / scoring math — awaiting founder approval)

| # | Item | Score | Why gated |
|---|------|-------|-----------|
| B2 | Resolve band-boundary semantics (`getBand` upper-inclusive vs `BANDS.min/max` lower-inclusive) | 10 | Reclassifies entities sitting exactly on 20/40/60/80 (Nigeria 18, Humana 40.6 are live boundary cases) |
| B3 | Harm trigger `=== 0` → band (`<= threshold`) — closes "0.1 keeps the bonus" loophole | 10 | Changes integration premium → recomputes composites catalog-wide |
| B5 | Persist integration-premium breakdown into per-entity public JSON | 10 | Additive (no composite change) but touches export pipeline — sequence after Tranche A |
| B1 | Make harm-flag/0.0 floor explicit in `scoring.ts` (`harmFlag`/`floorDesignated` clamp) | 9 | Re-baselines all floor entities; must reproduce existing 0.0s exactly + extend 69-case test suite |
| B7 | Evidence-saturation / scope-of-probe pathway for near-floor entities (the UHG problem) | 9 | Highest risk — loosens adjudication trigger; risks scoring on allegation |
| B6 | Replace "default to lower anchor on absence" with explicit Insufficient-Evidence status | 10 | Changes published scores/display for low-transparency + placeholder entities |
| B8 | Define 4 confidence levels and make them consequential (bar low-confidence from rankings) | 8 | Changes ranking display/score authority |
| B4 | Smooth/justify step-function cliffs (consistency & weakness multipliers) | 6 | Re-scores entire catalog |

---

## Top 10 Candidates (legacy — April Loops 1–3 / Revenue Cycle 1)

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
- **Status:** ✅ COMPLETE (Revenue Cycle 1 — 2026-04-16) — Product cards now link directly to Gumroad; configurator already had Gumroad routing from prior fix

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
- **Status:** ✅ COMPLETE (Loop 3 — 2026-04-16) — `npm run validate` checks 12,686 data points across all 7 files

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
