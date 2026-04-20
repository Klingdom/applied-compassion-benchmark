# Iteration Log

Record of score-update batches applied to the published index files.

---

## Loop — 2026-04-20 — Methodology v1.1 H1 (Integration Premium Cap)

**Trigger:** Determinism fix earlier today exposed the +20 integration premium was too aggressive. Seven entities (Target, Germany, Amsterdam, Munich, Massachusetts, Washington, Hugging Face) computed to 100 despite documented gaps (Target DEI rollback most visible). Bundled with determinism release to prevent an awkward "Target = 100" production window.

**Agents:** backend-engineer

**What changed:**
- `site/src/lib/scoring.ts` — integration premium constant changed from `20` to `10` in both `calcScores()` and `computeCompositeFromDimensions()`
- Mirrored to `site/scripts/test-scoring.mjs`, `site/scripts/recompute-composites.mjs`, `site/scripts/validate-indexes.mjs`
- `site/scripts/test-scoring.mjs` — 44 test expected values updated to reflect new formula; all 44 pass
- All 7 index JSONs recomputed with new cap

**Scope:**
- 90 entities adjusted by |Δ| ≥ 0.5
- 16 band transitions — all Exemplary → Established
- No entity now reaches exactly 100 (requires all-5 dim scores, which no entity has)

**Notable changes:**
- Target 100 → 92.8 (still Exemplary, but evidence-defensible within band)
- Germany 100 → 95.9
- Hugging Face 100 → 95.9
- Amsterdam / Massachusetts / Washington 100 → 94.4
- Munich 99.7 → 89.7 (Exemplary → Established)
- 11 F500 entities dropped from 89.4 → 81.4

**Validation:**
- `validate-indexes.mjs`: 12,750 checks, 0 errors, 117 warnings
- `test-scoring.mjs`: 44/44 pass
- Idempotent

**Outcome:** Integration premium is now bounded at +10, preventing uniform-high-dim profiles from auto-maxing to 100. Combined with today's determinism fix, Methodology v1.1 provides a principled, reproducible scoring layer.

**Remaining Tier H candidates (deferred to future loops):**
- H2 — Evidence-of-excellence gate (require documented dim=5 rationale for full premium)
- H3 — Qualitative override layer (allow documented regressions like Target DEI rollback to trigger visible named adjustments)
- H4 — Harm floor escalation (treat dim=1 as partial harm signal)

---

## Loop — 2026-04-20 — Methodology Determinism Fix

**Trigger:** Improvement loop selection. 2026-04-19 assessor flagged "four confirmed cases of display-layer floor clamping" (Haiti, South Sudan, Russia, North Korea). Investigation revealed the issue was systemic: all 1,155 stored composites had drifted from the canonical formula in `site/src/lib/scoring.ts`.

**Agents:** backend-engineer

**What changed:**
- Added `computeCompositeFromDimensions()` to `site/src/lib/scoring.ts` (pure function operating on 8 dim scores)
- New `site/scripts/recompute-composites.mjs` — recomputes every composite from dim scores as source of truth; dry-run + `--apply` modes; re-ranks each index deterministically
- Updated `site/scripts/validate-indexes.mjs` check #10 to enforce full-formula composite correctness (tolerance 2.0 for errors, 1.0 for warnings, downgraded to warning for assessor-override entities)
- Applied recomputation across all 7 index JSONs

**Scope:**
- 871 of 1,155 entities had material changes (|Δ| ≥ 0.5)
- 206 band changes
- 14 entities protected (Batch 4 + Batch 5 assessor-approved scores)

**Notable results:**
- Floor-clamp fix: Haiti, Libya, Somalia, CAR moved from 0.0 → 4.7
- South Sudan / North Korea / Russia remained at 0.0 (dim scores genuinely all 1 — formula-correct)
- 206 entities dropped exactly −3.0 (formula correctly removes integration premium when 6+ dims < 4.0)
- Top upward moves exposed a separate issue: integration premium too aggressive at top. Target (documented DEI rollback) computes to 100; Germany, Amsterdam, Munich, Massachusetts also hit 100.

**Validation:**
- `validate-indexes.mjs`: 12,750 checks passed, 0 errors, 117 warnings (all expected band-boundary cases)
- `test-scoring.mjs`: 44/44 tests passed
- Idempotency confirmed (second run produces 0 changes)

**Outcome:** System is now deterministic — stored composite = formula(dim scores) for all 1,155 entities, enforced by validator going forward. This is a core product claim ("evidence-based, reproducible scoring") finally backed by the data layer.

**Follow-up queued:** Methodology v1.1 — cap integration premium. See IMPROVEMENT_BACKLOG_2026-04-18.md (added as new tier D item).

---

## Batch 5 — 2026-04-20

**Applied by:** Score-updater agent (founder approval)
**Indexes affected:** fortune-500.json, countries.json
**Entities updated:** 8

### Changes

| Entity | Index | Old Score | New Score | Delta | Band Change | New Rank |
|--------|-------|-----------|-----------|-------|-------------|----------|
| State Street | fortune-500 | 92.5 | 60.2 | -32.3 | Exemplary → Functional | 76 |
| Abbott Laboratories | fortune-500 | 87.4 | 57.8 | -29.6 | Exemplary → Functional | 82 |
| Microsoft | fortune-500 | 87.8 | 66.4 | -21.4 | Exemplary → Established | 34 |
| Nucor | fortune-500 | 87.4 | 66.4 | -21.0 | Exemplary → Established | 35 |
| Ecolab | fortune-500 | 87.4 | 68.8 | -18.6 | Exemplary → Established | 32 |
| Walt Disney | fortune-500 | 60.8 | 52.2 | -8.6 | Established → Functional | 90 |
| Pfizer | fortune-500 | 65.5 | 57.8 | -7.7 | Established → Functional | 83 |
| Saudi Arabia | countries | 4.4 | 9.4 | +5.0 | No change (Critical) | 158 |

### Notes

- **State Street:** Two-band downgrade (Exemplary → Functional). F500 rank falls from #1 to #76. Published uniform 4.5 dimension profile confirmed as reputational baseline artifact. Core drivers: 900 AI-efficiency layoffs in Q2 2025, further 20–30% Global Delivery cuts projected, $7.5M Connecticut AG settlement for inflated fees, TCFD/SASB endorsement rolled back under political pressure. Genuine SYS strength (Sustainability Stewardship Service) preserved at 68.8.
- **Abbott Laboratories:** Two-band downgrade (Exemplary → Functional). Rank falls from #4 to #82. 782 NEC cases pending in MDL 3026, $495M + $70M verdicts. Company continues to deny NEC-formula link despite verdicts. 2022 Similac powder formula recall (Salmonella, Cronobacter). Medical device innovation (FreeStyle Libre) anchors SYS at 68.8.
- **Microsoft:** One-band downgrade (Exemplary → Established). Rank falls from #3 to #34. 11,000–22,000 planned layoffs (January 2026), February 2026 RTO mandate, removal of DEI from performance criteria, no diversity report published. Responsible AI Transparency Report and accessibility product leadership (Xbox Adaptive Controller, Seeing AI) anchor Established band.
- **Nucor:** One-band downgrade (Exemplary → Established). Rank falls from #9 to #35. No-layoff policy and EAF steel sustainability remain genuine strengths (SYS 75.0). Contractor fatalities 2023–2024 indicate oversight gap. F500 DEI disclosure decline applies.
- **Ecolab:** One-band downgrade (Exemplary → Established). Rank falls from #6 to #32. Strongest of five first-time baselines (SYS 81.3 Exemplary-dimension). PFAS phase-out commitment, 2030 Positive Impact framework, Water.org partnership are genuine. DEI disclosure decline applies; EQU 62.5 reflects published raw 3.5.
- **Walt Disney:** Band change Established → Functional. April 14, 2026 layoffs of ~1,000 employees with explicit AI-efficiency CEO rationale. Severance above sector median prevents Critical drop. Orlando UNITE HERE contract and Disneyland wage settlement provide structural EMP floor.
- **Pfizer:** Band change Established → Functional. Led 2026 US drug price increases (80 products). Washington State drug-pricing law. Patient-assistance infrastructure (RxPathways, PAP Connect) prevents deeper downgrade.
- **Saudi Arabia:** Floor-clamping methodology correction. Delta +5.0 is NOT a substantive improvement — execution record is worsening (356 executions in 2025, second consecutive record). INT score set to 1.0 (0.0 scaled) reflecting no independent oversight of detention practices. Founder accepted low-confidence flag.

### Hold Item

- UnitedHealth Group: Q1 2026 earnings call April 21 under returned CEO Hemsley. Proposed +0.4 preview confirm direction. HELD — do not apply until transcript reviewed.

### F500 Meta Changes (post-Batch 5)

- Exemplary band: 14 → 9 entities (-5)
- Established band: 63 → 65 entities (+2)
- Functional band: 105 → 108 entities (+3)
- Mean score: 38.8 → 38.5
- Median score: 33.9 (unchanged)

---

## Batch 4 — 2026-04-19

**Applied by:** Score-updater agent (founder approval)
**Indexes affected:** countries.json, fortune-500.json, ai-labs.json
**Entities updated:** 6

### Changes

| Entity | Index | Old Score | New Score | Delta | Band Change | New Rank |
|--------|-------|-----------|-----------|-------|-------------|----------|
| Venezuela | countries | 4.4 | 18.0 | +13.6 | No (Critical) | 139 |
| Alphabet/Google | fortune-500 | 42.2 | 40.6 | -1.6 | Yes: Functional → Developing | 183 |
| Anthropic | ai-labs | 68.8 | 62.2 | -6.6 | No (Established) | 14 |
| Character AI | ai-labs | 30.8 | 23.8 | -7.0 | No (Developing) | 44 |
| GEO Group | fortune-500 | 7.5 | 6.6 | -0.9 | No (Critical) | 447 |
| Core Civic | fortune-500 | 7.5 | 7.0 | -0.5 | No (Critical) | 446 |

### Notes

- Venezuela: Regime-change reset. First 100-day transitional baseline under Acting President Rodríguez. HRW/WOLA caution weighting applied. Band crossover to Developing (20.0) is 2.0 points away. Follow-up scheduled no later than June 2026.
- Alphabet/Google: Sub-threshold delta (-1.6) but crosses Functional/Developing boundary at 41.0. Founder confirmed band-boundary interpretation. AdX structural remedy proceedings still pending — next assessment is high priority when ruling lands.
- Anthropic: New-spec 14-day window result. RSP rollback (Apr 7) + Illinois SB 3261 filing (Apr 17) + Pentagon litigation (Apr 8 appeals ruling). Supersedes old-spec +1.5 confirm from same date. Remains highest-scoring frontier AI lab at 62.2 Established.
- Character AI: Score correction post-January 2026 Google settlement. Pre-settlement EMP/SYS/INT scores were more generous than the Garcia case record supports.
- GEO Group / Core Civic: First-time baseline corrections (no formal proposal files). Assessed composite refined from initial 7.5 placeholder. GEO Group Adelanto trial April 30 is next binary event.

### Hold Item

- UnitedHealth Group: Proposed confirm +1.0 (10.9 → 11.9). HELD pending April 21 earnings call review.

---

## Batch 3 — 2026-04-18

**Indexes affected:** fortune-500.json, countries.json, ai-labs.json, us-cities.json
**Entities updated:** 6 (Target, Meta Platforms, Ford Motor, Iran, New York City, OpenAI)

---

## Batch 2 — 2026-04-17

**Indexes affected:** fortune-500.json, countries.json, ai-labs.json
**Entities updated:** 4 (CVS Health, United States, OpenAI, Amazon)

---

## Batch 1 — 2026-04-15 / 2026-04-16

**Indexes affected:** ai-labs.json, fortune-500.json, countries.json
**Entities updated:** 9 (OpenAI, xAI/Grok, Johnson & Johnson, Israel, Mistral AI, Anthropic, Rwanda, Alphabet/Google, UnitedHealth Group, Walmart)
