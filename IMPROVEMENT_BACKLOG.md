# IMPROVEMENT BACKLOG — Compassion Benchmark

Generated: 2026-04-14 | Last updated: **Iteration 10 (2026-09-14)** — RISK-019 false formula claim removed

## Scoring Model

Priority Score = Impact + Strategic Alignment + Learning Value + Confidence − Effort − Risk

---

## Scoring model v2 — ADOPTED 2026-09-14 as a trial for Iterations 13–15

Source: `docs/META_REVIEW_2026-09-14_ITER10-12.md` §5–§7 (coordinator-verified; one factual correction:
the uncommitted America-at-250 edit dates from **2026-09-03** (source `.md` mtime), not July).
v1 scores are kept for comparability; log **v1 and v2** for the selected item and top two alternatives.

```
Base     = I + S + L + C − E − R          (unchanged)
Adjusted = Base + K + P + Rc + Ag + Dl
K  risk closed (RISKS.md): High/High +3 · one High +2 · Medium/Medium +1; −1 if only reduced; cite RISK ID
P  live exposure: +1 if on production now, confirmed by a recorded BEFORE check;  K + P ≤ 4
Rc recurrence (docs/DEFECT_CLASS_REGISTRY.md): +2 installs a gate for a ≥2-occurrence class; −1 fixes an instance without one
Ag aging: +1 per 14 days eligible and unstarted (Base ≥ 13), cap +3
Dl deadline: ≤30d +3 · ≤90d +2 · ≤180d +1
Tie-break: Dl → K → forward exposure → Rc → lower Effort
Lane (not score): eligible | blocked-on-founder (never selected; appears in the decision packet)
```

**Selection rules:** S1 no double-counting ease (deviations must cite a non-formula reason) · S2 split gated
items into agent-doable X-1 and gated X-2 · S3 mid-session discoveries pre-empt only if logged + scored first,
≥ top eligible (or live score/formula/identity/money error), max 1 per 3 loops · S4 recurring class → gate or
dated waiver · S5 scope expansion accepted only for same class + same verification + no new authority class +
no new hand-written claim + ≤ ~30% files, logged · S6 ≤ 1 validated-uncommitted iteration unless file sets are
disjoint; every log entry names its commit pathspec · S7 RISK-015 T-30 (**2026-11-09**) forces R-1.

**Verification checklist per iteration:** V1 production BEFORE · V2 coordinator re-runs agent claims · V3
negative-control proof for new guards · V4 grep built output · V5 dated-content check (AUTONOMY §1c) · V6
diff scope review · V7 post-deploy AFTER.

### v2 shortlist (Iterations 13–15)

| Order | Item | v1 | v2 | Lane | Status |
|---|---|---:|---:|---|---|
| 13 | **D-1** `unapplied-score-movement` lint rule, forward-dated ≥ 2026-09-15 (RISK-020 reduce K+2 · P+1 · Rc+2, DC-03 = 2 verified occurrences) | 16 | **21** | eligible (file set disjoint from It. 12) | **✅ COMPLETE Iteration 13** (validated after 2 rework rounds; uncommitted pending founder). New follow-up: require `pipeline.scoreChangesApplied` in `validate-daily-briefings.mjs` |
| 14 | **A-1** wire `test-entity-records.mjs` into `npm run test` + slug-collision ratchet (RISK-017/018 · Rc+2 DC-05) | 15 | 19 | eligible — **waits for It. 12 commit** (both edit `site/package.json`) | Queued |
| 15 | **U-1** coverage/freshness generator, report-only (RISK-001/016). U-2 site publication = founder decision | 15 | 17 | eligible (U-2 blocked-on-founder) | Queued |
| — | L cross-links / overclaiming | 15 | 16 | eligible, held back (no RISKS entry) | Queued |
| — | R-1 waiver T-30 warning + PASS-with-waivers distinct (RISK-015 · Dl+2) | 12 | 16 | eligible; forced 2026-11-09 | Queued |

### New backlog item (coordinator discovery, 2026-09-15 — logged and scored before any work, per S3)
- **RS-1 — make `validate-rotation-state.mjs` fail only on real gaps.** Its 22 blocking FAILs are all false: 20 are
  evidenced by same-date change-proposal JSON + digest (early convention), 1 by a report under a different slug
  (`procter-gamble` vs key `procter-amp-gamble`, an HTML-entity leak in the stored name), 1 by a digest entry only
  (`c-te-divoire`, accent slug, RISK-018). Fix: accept same-date proposal JSON as WARN evidence; resolve slug aliases;
  keep FAIL for true zero-evidence; add fixtures for each class (V3). Does NOT write `last_assessed`.
  v1: I4 S5 L4 C5 − E2 − R1 = **15** · v2: K+1 (RISK-008/016 observability, reduce) · P 0 · Rc +2 (DC-09, ≥ 2 dead-guard
  occurrences) → **18**. Lane: eligible, but **S6 blocks implementation** until It. 12/13 are committed.
- **RS-2 — 20 Fortune 500 names published with HTML entities (RISK-023)** — checked 2026-09-15: live and visible
  ("Procter &amp; Gamble" in title/H1; /fortune-500 ranking; 143 built pages), three slugs per company, natural URL
  → 301 `/404`. Split per S2:
  - **RS-2a (X-1, agent-doable):** validator failing on HTML entities in any published entity name, with the 20 known
    cases as a dated, shrinking waiver list; remediation spec (old/new name, page/score/record/rotation slugs, 301 map).
    v1 I4 S5 L3 C5 − E2 − R1 = 14 · v2 K+1 (reduces RISK-023) · P+1 · Rc+2 (DC-05) → **18**. S6 blocks the code
    half; the spec is docs.
  - **RS-2b (X-2, founder-gated, AUTONOMY §1b renames/slugs):** decode the 20 names in `fortune-500.json` and entity
    records, migrate to clean slugs with 301s from both old slugs, rekey rotation-state. Recommended default: approve.

### New backlog items (from meta-review §8)
- Deterministic `generatedAt` in `build-special-briefings.mjs` (DC-08) — v1 ≈ 13.
- Extend `test-no-stale-counts` to `site/scripts/` generators (DC-01 coverage gap).
- Method-page numeric-example test (DC-02; required by S4 before G-3 ships).

### Meta-review §10 application status (2026-09-15)
- ✅ 1–3 `.claude/agents/coordinator.md` overlay (v2, S1–S7, V1–V7, triggers) · ✅ 4 `docs/DEFECT_CLASS_REGISTRY.md`
  · ✅ 5 v2 shortlist above · ✅ 6 `SYSTEM_HEALTH.md` measured snapshot · ✅ 7 ITERATION_LOG v1/v2 + V-checklist +
  pathspec (from It. 13) · ⏳ 8 decision packet delivered in `docs/founder-briefings/2026-09-14.md`; no answers yet.
- ✅ meta-coordinator spec rescoped (§7.2 item 6).
- Not yet scored into the table: the full PR/FAQ top 20 with a v2 column. Deferred until after It. 15 per §5.4.

### Blocked-on-founder (decision packet, `docs/META_REVIEW_2026-09-14_ITER10-12.md` §9)
Commit It. 12 by pathspec · hold America-at-250 edit (dated 2026-09-03) · Score-Watch pause · publish never-assessed
share (U-2) · waiver extension · cadence floor · branch protection · batched approvals · refresh CLAUDE.md data
notes · `.bak` cleanup + branch naming.

---

## Iteration 10 — 2026-09-14 (source: PR/FAQ 2026-09-14 ranked table, 12 specialist reviews)

Candidate set is the PR/FAQ's deduplicated, reconciled table
(`docs/PRFAQ_AI_MODEL_BENCHMARK_AND_CONTINUOUS_RESEARCH_2026-09-14.md` §6) — not regenerated, to avoid
duplicate work on the same day. Top 10 by reconciled score, with this loop's selection:

| # | ID | Item | Score | Status |
|---|----|------|-------|--------|
| 1 | U | Coverage/freshness dashboard from `rotation-state.json` | 16 | Queued — **next** (PR/FAQ do-now #1) |
| 2 | D | Status ladder: measured vs published/applied/held | 15 | Queued (do-now #3) |
| 3 | I | Defect-class registry, second occurrence → mechanical gate | 15 | Queued |
| 4 | L | Cross-link `/ai-models` ↔ `/ai-evaluation-suite` ↔ `/ai-labs`; remove overclaiming | 15 | Queued |
| 5 | N | Verifiable founder-approval provenance | 14 | **Founder decision** |
| 6 | S | Fix `/cite` URL pattern; regenerate `llms.txt` | 14 | **S-1 ✅ COMPLETE Iteration 11** (dead pattern fixed on /cite, /media, /data; llms.txt count derived, /cite + /ai-models added). S-2 CompassionBench disambiguation → founder decision |
| 7 | C | Test-retest reliability study + run manifests | 13 | Queued (30 days) |
| 8 | E | Disclose placeholder/seed status publicly | 13 | Queued (30 days) |
| 9 | F | One evidence-tier scale | 13 | Queued (30 days) |
| 10 | G | Remove false "balanced beats spiky" claim; formula sensitivity note | 13 | **G-1 (claim removal) ✅ COMPLETE Iteration 10**; G-2 sensitivity note queued |

**Why G-1 was selected over higher-scored U/D/I:** it is the only top-10 item that is a *certain*,
currently-published factual error about the benchmark's own formula (RISK-019, "Certain / High"),
with Effort 1 and Risk 1 for the copy-only half, and no founder gate. Bias order: correctness/determinism
first. Effective score for the split sub-item G-1: I4 + S4 + L3 + C5 − E1 − R1 = **14**.

Follow-ups spawned (not implemented):
- (Iteration 11) `/media` hard-coded "1,156 entities" → `entityCount.ts`; llms.txt model-scored literal →
  derive from model-index facts; `/404` soft-404 (HTTP 200) → item T.
- **✅ COMPLETE Iteration 12 (derived counts + `test-no-stale-counts` guard; also added missing Universities
  rows on home/data/score-watch). Original entry:** NEW candidate (found during grant-request verification, 2026-09-14) — stale hard-coded entity counts on
  public pages.** "1,156 entities" (canonical 1,325) in `site/src/app/data/page.tsx` (5 places incl. meta
  description), `media/page.tsx` (4), `updates/special/page.tsx` (2 meta), `updates/special/[slug]/page.tsx`;
  "seven indexes" (8); "21 U.S. states" (51) in `data/page.tsx:35` and `pricing/page.tsx:299`; "50 humanoid
  robotics labs" (92) in `data/page.tsx:47`. Fix: route through `entityCount.ts`/`INDEX_REGISTRY` + add a
  build guard against literal counts. Type: fix · I4 S5 L3 C5 E1 R1 = **15** — ties the top of the queue.
- **Next selection:** U (coverage dashboard) if the founder approves publishing the never-assessed share;
  otherwise D (status ladder) or L (cross-links / overclaiming), both ungated.
- G-3: verify related wording in `site/src/app/methodology/page.tsx:1266`, `ConsistencyStepChart.tsx`,
  `dimensions.ts:635` ("balanced 70/70 can beat spiky 90/40" — different averages; likely true, unverified).
- Commit + deploy of Iteration 10 changes (founder approval, AUTONOMY §1b).

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
