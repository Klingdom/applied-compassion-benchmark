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

---

## Batch 6 — 2026-04-21

**Applied by:** Score-updater agent (founder approval)
**Indexes affected:** ai-labs.json
**Entities updated:** 2

### Changes

| Entity | Index | Old Score | New Score | Delta | Band Change | New Rank |
|--------|-------|-----------|-----------|-------|-------------|----------|
| Meta AI | ai-labs | 40.6 | 29.4 | -11.2 | Yes: Functional → Developing | 43 |
| OpenAI | ai-labs | 38.8 | 31.3 | -7.5 | No (Developing stays) | 42 |

### Notes

- **Meta AI:** First full reassessment as a distinct ai-labs entry. Published 40.6 Functional pre-dates the 2026 verdict cluster. Proposed 29.4 Developing reflects three convergent child-harm legal findings: Massachusetts SJC Commonwealth v. Meta Platforms (Apr 10, in-window anchor) holding Section 230 does not shield Instagram design features — court found design "capitalizes on developmental vulnerabilities of children"; New Mexico $375M civil verdict (Mar 24, 2026) for consumer-protection violations tied to child safety; Los Angeles $3M negligence verdict (Mar 25, 2026) with Meta 70% responsible for social-media addiction harm. Design-features-as-harm theory now validated by a state supreme court. High confidence. Band change Functional → Developing. Rank falls from #29 to #43.
- **OpenAI:** Evidence-based downgrade anchored on Illinois SB 3444 backing (Apr 10–17, 2026 coverage) — OpenAI actively supports liability shield exempting AI firms from mass-casualty responsibility (>100 deaths, >$1B damage, CBRN events); described by experts as "markedly weak approach to corporate liability." Musk v. OpenAI fraud trial begins Apr 27 in Oakland (jury selection); trial record itself weakens INT/I4 values-alignment regardless of outcome. Perplexity class action (Apr 1) adds B5 consent concern re: user chat data shared with Google/Meta. Medium confidence; upgrade to high if SB 3444 advances Apr 24 Illinois committee vote with OpenAI support. Stays Developing band. Rank falls from #30 to #42 (ties with Anduril and C3.ai at 31.3; ordered alphabetically).

### ai-labs Meta Changes (post-Batch 6)

- Functional band: 15 → 14 entities (−1; Meta AI exits Functional)
- Developing band: 18 → 19 entities (+1; Meta AI enters Developing; OpenAI stays Developing)
- Mean score: 45.4 → 45.0
- Median score: 47.7 (unchanged)

### Validation

- `validate-indexes.mjs`: 12,751 checks, 0 errors, 116 warnings (1 fewer than prior run — Meta AI composite delta eliminated)
- `test-scoring.mjs`: 44/44 pass

---

## Batch 7 — 2026-04-22

**Applied by:** Pending founder review (10 proposals generated; none applied yet)
**Indexes affected:** ai-labs.json, fortune-500.json, countries.json
**Entities assessed:** 19 (1 deferred: South Sudan)
**First-time baselines:** 6 (IBM, Palantir AI, Scale AI, Waymo, Norway, New Zealand)

### Proposals Pending Review

| Entity | Index | Old Score | Proposed Score | Delta | Band Change | Confidence |
|--------|-------|-----------|----------------|-------|-------------|------------|
| Anthropic | ai-labs | 90.9 | 61.6 | -29.3 | Yes: Exemplary → Established | Medium |
| Amazon | fortune-500 | 21.6 | 17.8 | -3.8 | Yes: Developing → Critical | High |
| IBM | fortune-500 | 62.5 | 51.3 | -11.2 | Yes: Established → Functional | High |
| Interpublic Group | fortune-500 | 53.0 | 40.0 | -13.0 | Yes: Functional → Developing | Medium |
| New Zealand | countries | 92.5 | 78.4 | -14.1 | Yes: Exemplary → Established | Medium |
| Norway | countries | 100.0 | 84.7 | -15.3 | No (Exemplary stays) | High |
| Palantir AI | ai-labs | 19.9 | 12.8 | -7.1 | No (Critical stays) | High |
| DRC | countries | 10.9 | 4.4 | -6.5 | No (Critical stays) | Medium |
| Deere & Company | fortune-500 | 56.2 | 48.1 | -8.1 | No (Functional stays) | Medium |
| Macy's | fortune-500 | 53.0 | 41.3 | -11.7 | No (Functional stays) | Medium |

### Confirmations (9)

| Entity | Index | Published | Assessed | Delta |
|--------|-------|-----------|----------|-------|
| OpenAI | ai-labs | 31.3 | 28.8 | -2.5 |
| Meta AI | ai-labs | 29.4 | 26.9 | -2.5 |
| xAI/Grok | ai-labs | 2.2 | 2.2 | 0.0 |
| Scale AI | ai-labs | 33.9 | 30.0 | -3.9 |
| Waymo | ai-labs | 48.4 | 46.3 | -2.1 |
| UnitedHealth Group | fortune-500 | 10.9 | 13.1 | +2.2 |
| United States | countries | 25.0 | 22.5 | -2.5 |
| Sudan | countries | 0.0 | 0.0 | 0.0 |
| Israel | countries | 8.8 | 7.8 | -1.0 |

### Deferred (1)

- **South Sudan:** UNMISS mandate vote pending before April 30. Re-queue immediately after Security Council vote result.

### Key Notes

- **Anthropic delta is primarily a calculation artifact.** Published 90.9 includes integration premium ~+27 exceeding v1.1 H1 cap of +10. Canonical formula score ~63.4. Genuine event-driven delta is approximately −2 (INT regression on Ballard Partners hire). Requires two separate founder decisions at review.
- **Amazon band crossing Developing → Critical** is the most reputationally significant finding for a rank-2 F500 entity. High confidence.
- **IBM first baseline** is the first DOJ FCA settlement under the Civil Rights Fraud Initiative — operationalizes the DEI enforcement theory effective April 25.
- **F500 Gen-2 artifact confirmed for 4th consecutive night** across IBM (3.5×8), Deere (near-uniform 3.5), Macy's (3.0×8), Interpublic (3.0×8). Pattern spans 11 entities. Formal batch re-scoring recommended.
- **Norway perfect-100 ceiling** is a methodology artifact — recommend empirical ceiling of ~95 across all indexes.
- **Interpublic Group entity-existence issue:** IPG acquired by Omnicom November 26, 2025; F500 index still carries as standalone. Founder decision required: remove, merge, or annotate.
- **Record 10 proposals in a single run.** Prior record was 8 (Batch 5, April 20).

---

## Batch 8 — 2026-04-23

**Applied by:** Digest agent (awaiting founder approval — all proposals pending)
**Indexes affected:** fortune-500.json (3 proposals), ai-labs.json (4 proposals), countries.json (3 proposals)
**Entities assessed:** 13 (9 proposals, 6 confirmations, 1 existence-flag, 2 deferrals)
**Proposals generated:** 9

### Proposals Pending Founder Review

| Entity | Index | Published | Proposed | Delta | Band Change |
|--------|-------|-----------|----------|-------|-------------|
| TIAA | fortune-500 | 97.5 | 58.6 | -38.9 | Exemplary → Functional |
| Masimo Corporation | fortune-500 | 81.4 | 48.4 | -33.0 | Exemplary → Functional |
| Fannie Mae | fortune-500 | 62.5 | 31.6 | -30.9 | Established → Developing |
| DeepMind/Google | ai-labs | 81.4 | 65.0 | -16.4 | Exemplary → Established |
| Germany | countries | 95.9 | 72.8 | -23.1 | Exemplary → Established |
| Netherlands | countries | 95.9 | 74.4 | -21.5 | Exemplary → Established |
| Singapore | countries | 74.3 | 62.2 | -12.1 | No (Established maintained) |
| Palantir AI | ai-labs | 19.9 | 10.3 | -9.6 | No (Critical maintained) |
| OpenAI | ai-labs | 31.3 | 27.5 | -3.8 | No (Developing maintained) |

### Notes

- **TIAA:** Largest composite delta in F500 pipeline history at −38.9. Published 97.5 is a 4.5×8 Gen-2 artifact at rank 1. Forensic anchor case for the F500 index. SEC enforcement (2021 $97M), active AARP-Foundation-backed ERISA class action, and multi-year whistleblower pattern. Mission is genuinely long-horizon (SYS 68.8 assessed). This is a methodology-disclosure event: the top-ranked F500 entity is proposed to move from Exemplary to Functional.
- **Masimo Corporation:** Published 81.4 is a 4×7+3.5×1 Gen-2 cluster shared by 8 entities at ranks 10-17. Second forensic anchor. Dual DOJ (Feb 2024) and SEC (March 2024) subpoenas, 16-employee whistleblower lawsuit, CEO undisclosed stock-pledge. Invalidates the entire cluster as a reliable score profile.
- **Fannie Mae:** First full baseline and Gen-2 correction combined. Published 62.5 is a 3.5×8 artifact. Real-world event (700 mass firings with ethnic concentration, congressional inquiry, Westfall Act immunity defense) establishes this as not purely a methodology correction.
- **DeepMind/Google:** First full baseline. Cross-index Gen-2 discovery — 81.4 profile in ai-labs is identical to F500 Masimo cluster. This is the first confirmed instance of Gen-2 batched scoring crossing indexes. Medium confidence; AlphaFold and FSF are genuine Exemplary-tier work.
- **Germany / Netherlands:** Countries-index top-rank ceiling artifact confirmed. Follows Norway correction (April 22). Three of top-10 countries corrected in two nights. Both proposals are partially artifact, partially real policy regression.
- **Singapore:** First baseline. UN High Commissioner formal moratorium call (April 22) is the in-window anchor. No band change; Established maintained.
- **Palantir AI:** 22-point manifesto is self-declared values-divergence — the rarest evidence type in the index. No audit required; entity stated its values publicly. Score drops to 10.3 Critical.
- **OpenAI:** Brockman diary ("it was a lie") is Tier-5 founder-contemporaneous evidence cited in federal court. INT drops 25.0 → 17.5. Trial starts April 27; reassess weekly through May 25.
- **Anthropic:** Held at 61.6 day-of-vote. Post-vote reassessment mandatory April 24.
- **Interpublic Group:** Entity-existence flag only. Omnicom acquisition completed November 26, 2025. No score proposal. Requires founder decision: archive vs. merge with Omnicom.

### Methodology Artifacts Surfaced

1. F500 Gen-2 forensic audit confirmed over 5 consecutive nights: estimated 46+ entities in 4 distinct uniform-score clusters. TIAA and Masimo as forensic anchors invalidate the 97.5 and 81.4 clusters respectively.
2. Cross-index Gen-2 spread confirmed: DeepMind/Google ai-labs profile is identical to F500 Masimo cluster.
3. Countries-index top-rank ceiling artifact: Germany, Netherlands, Norway all corrected; ranks 1-10 audit recommended.
4. Tier-5 evidence precedent (OpenAI/Brockman): founder-contemporaneous documentation cited in federal court is now formally in the index evidence record.
5. Self-declared values-divergence precedent (Palantir): corporate manifesto as primary evidence of I1-I4 misalignment.

---

## Batch 9 — 2026-04-24

**Applied by:** Digest agent (awaiting founder approval — all proposals pending)
**Indexes affected:** fortune-500.json (1 proposal), countries.json (2 proposals), us-states.json (2 proposals), ai-labs.json (1 proposal)
**Entities assessed:** 13 (6 proposals, 7 confirmations including DRC reaffirmation and South Sudan deferral)
**Proposals generated:** 6
**Deferrals:** 1 (South Sudan — UNMISS vote pending before April 30)

### Proposals Pending Founder Review

| Entity | Index | Published | Proposed | Delta | Band Change | Confidence |
|--------|-------|-----------|----------|-------|-------------|------------|
| Becton Dickinson | fortune-500 | 81.4 | 54.1 | -27.3 | Yes: Exemplary → Functional | High |
| Luxembourg | countries | 97.5 | 81.3 | -16.2 | No (Exemplary maintained) | Medium |
| Iceland | countries | 100.0 | 87.5 | -12.5 | No (Exemplary maintained) | High |
| Minnesota | us-states | 95.9 | 84.4 | -11.5 | No (Exemplary maintained) | Medium |
| Vermont | us-states | 97.5 | 87.5 | -10.0 | No (Exemplary maintained) | Medium |
| Hugging Face | ai-labs | 95.9 | 88.1 | -7.8 | No (Exemplary maintained) | High |

### Confirmations (7)

| Entity | Index | Published | Assessed | Delta | Basis |
|--------|-------|-----------|----------|-------|-------|
| Anthropic | ai-labs | 61.6 | 61.6 | 0.0 | Illinois SB 3261 vote deferred to May 15 |
| OpenAI | ai-labs | 27.5 | 27.5 | 0.0 | Illinois SB 3444 vote deferred to May 15 |
| xAI/Grok | ai-labs | 2.2 | 2.2 | 0.0 | Critical floor; new financial-fraud dimension noted |
| DRC | countries | 4.4 | 4.4 | 0.0 | Reaffirmation — live score matches proposed |
| South Sudan | countries | 0.0 | 0.0 | — | Deferred: UNMISS vote not yet held |
| Myanmar | countries | 0.0 | 3.1 | +3.1 | April 23 confirmation stands; earthquake date flag |
| Meta AI | ai-labs | 29.4 | 27.8 | -1.6 | EU GDPR fine within threshold |

### Key Notes

- **Becton Dickinson:** Third Gen-2 forensic anchor in two nights. $20M cancer verdict for ethylene oxide exposure; 402 pending cases; residential-adjacent industrial harm. Dual-trigger: methodology artifact + independent real-world harm evidence. The 81.4 cluster (8 entities, ranks 10-17) is now fully invalidated by three independent anchors.
- **US-States ceiling artifact (first surface):** Vermont and Minnesota are the first us-states first-baselines, and both immediately exhibit the ceiling-artifact pattern. Third index confirmed with systematic uniform-score inflation at the top of the rank distribution. Ranks 3-10 audit recommended before next index build.
- **Countries ceiling Night 4:** Luxembourg and Iceland extend the streak to five corrections across three nights. Five of the top 10 countries by published score have received evidence-based corrections; Denmark, Sweden, and Finland are unassessed T2 candidates.
- **Illinois vote deferral:** SB 3261 and SB 3444 both moved to May 15 via Rule 2-10. Both Anthropic (61.6, 1.6pts above Established/Functional boundary) and OpenAI (27.5) held — correct protocol application. Next mandatory reassessment: May 15.
- **DRC reaffirmation:** Assessor change-proposal from stale 10.9 baseline produced proposed 4.4 matching live score exactly. Classified as reaffirmation, not new change. Fresh evidence (M23 immunity demand, 500K+ displaced, UN Security Council emergency session) re-grounds the April 22 correction.
- **xAI/Grok floor limitation:** New financial-fraud dimension (Musk Paris non-appearance; SEC/DOJ IPO manipulation alert) documented but cannot be expressed at the 2.2 index floor. Floor-escalation methodology (Tier H4) prioritized for next index build.
- **Hugging Face:** Rotation audit correction within Exemplary band (95.9 → 88.1). Not a governance failure finding. Remains highest-scoring ai-labs entity by evidence-based assessment. INT rises to 95.0 on honest governance disclosure — counter-intuitive but methodology-correct.
- **F500 Gen-2 sprint:** Six consecutive nights without coordinated sprint. Six entities remain in the invalidated 81.4 cluster. Sprint recommendation is now overdue.

### Methodology Artifacts Surfaced

1. US-States ceiling artifact: first documented case. Vermont (rank 1, 97.5) and Minnesota (rank 2, 95.9) both carry uniform-score ceiling profiles as first baselines.
2. Third-index pattern confirmed: fortune-500, countries, and us-states all exhibit systematic uniform-score inflation at the top of rank distributions.
3. Index-floor limitation documented: xAI/Grok (2.2) evidence cluster has expanded to 9+ documented regulatory/criminal actions but the composite cannot decrease further. Tier H4 floor-escalation should be prioritized.
4. Pipeline integrity case: DRC stale-baseline change proposal correctly classified as reaffirmation when proposed score matches live score.

---

## Batch 10 — 2026-04-25

**Applied by:** Digest agent (awaiting founder approval — all proposals pending)
**Indexes affected:** fortune-500.json (4 proposals), countries.json (3 proposals)
**Entities assessed:** 11 (7 proposals, 3 confirmations: OpenAI, xAI/Grok, DRC)
**Proposals generated:** 7
**Deferrals:** 1 (South Sudan — third consecutive deferral; UNMISS mandate expires April 30)

### Proposals Pending Founder Review

| Entity | Index | Published | Proposed | Delta | Band Change | Confidence |
|--------|-------|-----------|----------|-------|-------------|------------|
| Danaher | fortune-500 | 81.4 | 54.7 | -26.7 | Yes: Exemplary → Functional | High |
| General Mills | fortune-500 | 81.4 | 53.1 | -28.3 | Yes: Exemplary → Functional | High |
| Eli Lilly | fortune-500 | 81.4 | 56.3 | -25.1 | Yes: Exemplary → Functional | High |
| Booz Allen Hamilton | fortune-500 | 48.4 | 36.7 | -11.7 | Yes: Functional → Developing | High |
| Denmark | countries | 100.0 | 81.3 | -18.7 | No (Exemplary maintained) | High |
| Sweden | countries | 97.2 | 81.3 | -15.9 | No (Exemplary maintained) | Medium |
| Finland | countries | 100.0 | 84.4 | -15.6 | No (Exemplary maintained) | Medium |

### Confirmations (3)

| Entity | Index | Published | Assessed | Delta | Basis |
|--------|-------|-----------|----------|-------|-------|
| OpenAI | ai-labs | 27.5 | 27.5 | 0.0 | Musk dropped fraud claims April 25; case narrowed; score held pre-trial |
| xAI/Grok | ai-labs | 2.2 | 2.2 | 0.0 | Critical floor; SpaceX S-1 IPO filing documents Grok risk to SEC investors (Tier-4 evidence upgrade); floor limits expression |
| DRC | countries | 4.4 | 4.4 | 0.0 | Re-confirmed; M23 immunity demand, 500K+ displaced, no resolution signal |

### Key Notes

- **F500 Night-7 Triple Anchor (Danaher, General Mills, Eli Lilly):** First time three forensic anchors assessed in a single pipeline run. The 4×7+3.5×1=81.4 cluster at F500 ranks 10-17 now has six confirmed forensic anchors. Mean correction across six anchors: approximately -29.9 points. Three remain: Cummins, US Bancorp, American Express.
- **Danaher:** $172.5M D.D.C. shareholder settlement (April 22-23, 2026) — largest D.D.C. securities settlement since 1996. INT 37.5 — executive misleading-statements pattern. SYS 62.5 retained on genuine life-sciences diagnostics infrastructure.
- **General Mills:** Dual-trigger — WARN Act violation (163 workers, St. Charles MO, 60-day notice failure) + Davis racial-harassment class action survived dismissal April 22 ('Good Ole Boy network' characterization by federal judge). EMP 50.0, EQU 43.8 — lowest equity score in Night-7 batch.
- **Eli Lilly:** SCOTUS petition No. 25-1126 to eliminate FCA qui tam whistleblower mechanism. Second application of Palantir-2026-04-23 values-divergence precedent — first pharmaceutical company. ACC 37.5, INT 43.8. SYS/ACT 68.8 retained on therapeutic-access mission.
- **Booz Allen Hamilton:** First pipeline capture. Treasury cancelled all 31 contracts ($21M) January 26, 2026 over Littlejohn IRS breach (406K taxpayers affected). Maryland federal court refused to dismiss class action April 2026. INT 12.5 — lowest on record for a federal consulting entity. Band change Functional → Developing. April 25 is the DEI EO 14398 effective date; sector-wide accountability context now in force.
- **Nordic ceiling sweep complete:** Denmark (-18.7, ECJ ghetto-law ruling + March 2026 visa ban), Sweden (-15.9, April 17 'honest living' Aliens Act proposal + abolition of permanent residence permits), Finland (-15.6, April 16 deportation-enforcement + pre-emptive entry-ban legislation + Border Security Act extension). Eight of the top 10 countries corrected in five nights. Mean correction: approximately -17.4 points. Only New Zealand remains in top-10 cluster.
- **OpenAI:** Musk dropped fraud claims April 25, hours before April 27 trial. Case narrowed to unjust enrichment + breach of charitable trust. Score held at 27.5; breach-of-charitable-trust claim is harder but more institutionally damaging. Reassess weekly.
- **xAI/Grok:** SpaceX S-1 IPO filing (April 1, reported April 23) formally documents Grok regulatory risk to SEC investors — Tier-3-to-Tier-4 evidence quality upgrade. Composite at 2.2 floor cannot express this. Floor-escalation Tier H4 is materially overdue.
- **South Sudan:** Third consecutive deferral. UNMISS mandate expires April 30 in five days. This is now the most time-sensitive deferred item in the pipeline.

### Methodology Artifacts Surfaced

1. F500 81.4 cluster invalidation complete (6 of 9 entities assessed): mean correction -29.9 points; dimension variance confirms the cluster masked distinct failure modes — information integrity (Danaher), constitutional attack on accountability (Eli Lilly), dual worker/equity failure (General Mills).
2. Nordic ceiling sweep closed (8 of 10 top countries corrected): the EQU dimension is the most consistently depressed across all eight corrections, with a modal bottom-dimension value of 68.8.
3. Palantir values-divergence precedent applied to second entity (Eli Lilly): affirmative legal action to dismantle accountability infrastructure is INT/ACC evidence regardless of outcome. Precedent now spans sectors (AI labs → Pharmaceuticals).
4. Federal-contractor rotation gap confirmed: Booz Allen Hamilton ($7B+ federal revenue, public Littlejohn event, Treasury contract cancellation) was not in rotation queue prior to this capture. Rotation methodology must enforce a federal-contractor revenue threshold as a standing T1 priority.
5. Floor-escalation methodology (Tier H4) is now 7+ days overdue from the perspective of the xAI/Grok evidence cluster. The SEC S-1 disclosure adds a regulated-filing evidence tier that the current composite floor cannot reflect.

---

## Batch 11 — 2026-04-26

**Applied by:** Digest agent (awaiting founder approval — all proposals pending)
**Indexes affected:** fortune-500.json (3 proposals), countries.json (2 proposals)
**Entities assessed:** 12 (5 proposals, 7 confirmations: Palantir AI, OpenAI, xAI/Grok, Sudan, Israel, DRC, Anthropic)
**Proposals generated:** 5
**Deferrals:** 2 (South Sudan — fourth consecutive deferral; UNMISS mandate expires April 30 — 4 days; Interpublic Group — entity-existence decision pending)

### Proposals Pending Founder Review

| Entity | Index | Published | Proposed | Delta | Band Change | Confidence |
|--------|-------|-----------|----------|-------|-------------|------------|
| Cummins | fortune-500 | 81.4 | 53.1 | -28.3 | Yes: Exemplary → Functional | High |
| American Express | fortune-500 | 81.4 | 55.5 | -25.9 | Yes: Exemplary → Functional | High |
| U.S. Bancorp | fortune-500 | 81.4 | 54.7 | -26.7 | Yes: Exemplary → Functional | High |
| New Zealand | countries | 78.4 | 70.3 | -8.1 | No (Established maintained) | Medium |
| Norway | countries | 84.7 | 78.1 | -6.6 | Yes: Exemplary → Established | Medium |

### Confirmations (7)

| Entity | Index | Published | Assessed | Delta | Basis |
|--------|-------|-----------|----------|-------|-------|
| Palantir AI | ai-labs | 10.3 | 10.3 | 0.0 | EFF Apr 25 + congressional non-response Apr 24 are INT/ACC upgrades; held at Critical-band floor |
| OpenAI | ai-labs | 27.5 | 27.5 | 0.0 | Pre-trial hold; jury selection April 27; proceedings out of window |
| xAI/Grok | ai-labs | 2.2 | 2.2 | 0.0 | Critical floor; fourth consecutive night with floor limitation |
| Sudan | countries | 0 | 0 | 0.0 | RSF Al-Jabalain Hospital drone attack + OHCHR/ACHPR-AU warning + 16%-funded appeal; evidence upgrades only |
| Israel | countries | 8.8 | 8.8 | 0.0 | Gaza closures since Feb 28 + 2,400+ ceasefire violations; delta below 5pt threshold |
| DRC | countries | 4.4 | 4.4 | 0.0 | Apr 18 humanitarian statement offset by Apr 25 continued South Kivu fighting; net delta < 5pt |
| Anthropic | ai-labs | 61.6 | 61.6 | 0.0 | Pentagon appeals denial Apr 8 + NSA/Mythos paradox Apr 20; DC Circuit May hearing is next inflection |

### Key Notes

- **F500 Gen-2 Sprint Complete:** All 8 entities in the uniform 4x7+3.5x1=81.4 cluster have been forensically corrected across Nights 1-8. Tonight's three completers close the sprint.
- **Cummins:** $1.675B EPA Clean Air Act civil penalty (Jan 2024) — largest in CAA history, second-largest environmental penalty in U.S. history. Deliberate defeat-device software across ~1M diesel trucks (2013-2023). INT 31.3 — the lowest in the Gen-2 forensic anchor series. BND 37.5 on highway-corridor NOx population-level harm. April 16 Green v. Cummins sex-discrimination suit survives dismissal. SYS/ACT 62.5 retained on genuine Accelera/Destination Zero zero-emission pivot.
- **American Express:** $230M combined DOJ civil + criminal NPA settlement (Jan 2025) for 2014-2017 deceptive small-business credit card marketing — dummy EINs ('123456788'), falsified income, unauthorized credit checks, inaccurate tax advice. Active $17.5M antitrust settlement (claim deadline April 29, in-window). 200 employees fired (self-remediation). INT 50.0; ACC 43.8.
- **U.S. Bancorp:** $37.5M CFPB sham-accounts settlement (Jul 2022); CFPB found "over a decade" of organizational awareness. Wells Fargo-pattern violation. CEO Andy Cecere in active shareholder derivative suit (2026). April 2026 cash-sweep litigation is secondary ongoing BND concern. INT/ACC 43.8. Sprint closure: the eighth and final 81.4-cluster forensic anchor.
- **Norway (second-pass):** NOT a ceiling-sweep correction. Norway was corrected from 100 to 84.7 on April 22 (Generation-1 ceiling artifact). Tonight's -6.6 reflects new in-window governance regression: March 27 formal TCP ban for Ukrainian men 18-60 (effective May 5) + late-April welfare-cut consultation. First entity in countries index to receive two distinct correction types in a single sprint. Band changes Exemplary to Established.
- **New Zealand (first baseline):** NOT a top-10 ceiling correction. NZ is rank 16, Established band (78.4). April 19-20 Cabinet decision to reduce Treaty of Waitangi clauses across ~28 laws from 'give effect to' to 'take into account'. Waitangi Tribunal October 2025 found review process likely breaches Treaty principles. EQU 56.3 — lowest for any Established-band country in the sprint. Band held Established.
- **Floor-limitation cluster:** Five entities (xAI/Grok, Sudan, South Sudan, Israel, Palantir AI) had evidence upgrades that cannot be expressed downward. Largest single-night floor-limitation cluster in pipeline history. Tier H4 methodology is now critically overdue — fourth consecutive night.
- **South Sudan:** Fourth consecutive deferral. UNMISS mandate expires April 30 in 4 days. April 26 'on the brink' report and April 22 civil-war reignition coverage are sustained crisis evidence. Night 9 deferral is not viable; resolution required.

### Methodology Artifacts Surfaced

1. **F500 81.4 cluster invalidation complete (all 8 entities):** Nine total forensic anchors (including TIAA as the first at a different cluster) across eight nights. Mean correction across the eight 81.4-cluster entities: approximately -28.7 points. The cluster is confirmed as a methodology artifact. INT differentiation (range 31.3-50.0 across all 8) demonstrates the pipeline's ability to surface distinct failure modes behind uniform published scores.
2. **Second-pass correction category established (Norway):** The pipeline can now produce two distinct correction types on the same entity in sequence — methodology-artifact correction (April 22) followed by evidence-regression correction (April 26). The record must distinguish these clearly; both must be preserved in the change-proposal archive.
3. **Floor-limitation cluster at five simultaneous entities:** The largest single-night floor-limited cluster in the pipeline's history. Tier H4 must be scheduled as the next methodology loop item. The Critical band currently cannot differentiate institutional severity across a 0.0-10.3 range.
4. **New Zealand Treaty dimension — EQU at 56.3 for Established band:** The lowest EQU score for any Established-band country in the current sprint. Established-band entities can carry deeply depressed single dimensions (particularly EQU) if the broader institutional substrate remains strong. The composite (70.3) stays above the 60.0 Functional boundary; the dimension (56.3) is below the Functional boundary. This is expected and correct behavior under the scoring formula.
5. **Two-cycle (Nights 7-8) cumulative summary:** 12 score changes totaling approximately -213.5 composite-points. Mean correction per proposal: approximately -17.8 points. F500 Gen-2 cluster and countries ceiling sprint are both closed as of this batch.

---

## Batch 12 — 2026-04-27

**Applied by:** Digest agent (awaiting founder approval — all proposals pending)
**Indexes affected:** countries.json (1 proposal), us-states.json (1 proposal), us-cities.json (1 proposal), ai-labs.json (1 calibration proposal)
**Entities assessed:** 20 (4 proposals, 15 confirmations: OpenAI, Anthropic, xAI/Grok, Sudan, Israel, Germany, Canada, Ireland, US, DRC, Austria, Estonia, Taiwan, Hawaii, Massachusetts)
**Proposals generated:** 4
**Deferrals:** 1 (South Sudan — FIFTH consecutive deferral; UNMISS mandate expires April 30 — 3 days; HARD DEADLINE)

### Proposals Pending Founder Review

| Entity | Index | Published | Proposed | Delta | Band Change | Confidence |
|--------|-------|-----------|----------|-------|-------------|------------|
| Netherlands | countries | 74.4 | 65.6 | -8.8 | No (Established maintained) | High |
| Texas | us-states | 20.3 | 14.1 | -6.2 | Yes: Developing → Critical | High |
| Houston | us-cities | 43.8 | 35.2 | -8.6 | Yes: Functional → Developing | High |
| Palantir AI | ai-labs | 10.3 | 6.6 | -3.7 | No (Critical maintained) | Medium |

### Confirmations (15)

| Entity | Index | Published | Assessed | Delta | Basis |
|--------|-------|-----------|----------|-------|-------|
| OpenAI | ai-labs | 27.5 | 27.5 | 0.0 | Trial Day 1 jury selection only; PBC Foundation retains CONTROL via board+veto despite 26% equity |
| Anthropic | ai-labs | 61.6 | 61.6 | 0.0 | NSA Mythos confirmation = INT mitigation; CEO WH meeting; DoD deal "possible" |
| xAI/Grok | ai-labs | 2.2 | 2.2 | 0.0 | Floor-limited; FIFTH consecutive night |
| Sudan | countries | 0 | 0 | 0.0 | Floor-limited; UN "abandoned crisis" + Amnesty 2026 quasi-judicial finding |
| Israel | countries | 8.8 | 8.8 | 0.0 | Floor-limited; Amnesty 2026 genocide+apartheid finding; 60+ day Gaza aid blockade |
| Germany | countries | 72.8 | 72.8 | 0.0 | Live composite already reflects mixed profile; rotation-state drift flagged |
| Canada | countries | 84.6 | 84.6 | 0.0 | Indigenous Health Equity Fund + Housing Strategy + reconciliation gap; rotation-state drift flagged |
| Ireland | countries | 84.6 | 84.6 | 0.0 | IPA 2026 signed Apr 23 — net-neutral mixed signal; rotation-state drift flagged |
| United States | countries | 25 | 25 | 0.0 | EO 14398 began Apr 24 + Houston cascade + Amnesty protest repression; rotation-state drift flagged |
| DRC | countries | 4.4 | 4.4 | 0.0 | Amnesty M23 finding offset by Apr 18 COVM ceasefire mechanism |
| Austria | countries | 83.0 | 83.0 | 0.0 | T3 rotation; deportation hub participation; low confidence |
| Estonia | countries | 83.0 | 83.0 | 0.0 | T3 rotation; digital governance leadership; low confidence |
| Taiwan | countries | 83.0 | 83.0 | 0.0 | T3 rotation; democracy under PRC pressure; low confidence |
| Hawaii | us-states | 95.9 | 95.9 | 0.0 | T3 rotation; rank 1 US States after April 24 Vermont correction |
| Massachusetts | us-states | 94.4 | 94.4 | 0.0 | T3 rotation; salary transparency law; rank 4 US States |

### Key Notes

- **Three index-level firsts in one night:** Netherlands (countries first evidence baseline), Texas (us-states first individual assessment), Houston (us-cities first individual assessment). Most diverse single-night first-baseline output to date.
- **Netherlands:** Dutch Senate two-tier asylum system passed April 21 — A-status (persecution) vs B-status (war/climate); B-status holders denied family reunification 2 years, restricted to legal spouses + minor biological children. April 25 Loosdrecht: government cut intake 110→70 yielding to violent anti-asylum protests. April 10 ECOSOC vote elected Iran to UN human rights body. EQU drops most sharply (-12.5); INT (-13.7); ACC (-12.5); BND (-12.5). Composite 65.6, lower-middle Established. Implementation timed June 12 to coincide with EU Pact on Migration.
- **Texas:** April 24 5th Circuit vacated SB4 preliminary injunction (Las Americas v. Texas, plaintiffs lacked standing) — state-level parallel deportation system activated. April 22 Houston ordinance gut under Abbott $110M+ coercion. Texas holds 18,734 ICE detainees (>2× any other state); hosts nation's largest ICE detention facility (El Paso Camp East Montana, 2,505/day FY26). NPR April 3: ICE detention deaths at record pace, "one Texas facility bears the brunt." EQU/ACC/INT cross to Critical-band positioning (6.3 each). BAND CHANGE Developing → Critical. Calibration vs Florida (18.4 Critical) — Texas has more severe profile.
- **Houston:** 14-day reversal of sanctuary ordinance under state fiscal coercion. Apr 8: Council passes 12-5 with judicial-warrant protection language. Apr 13: Abbott threatens $110M public safety grant withdrawal. Apr 22: Same Council reverses 13-4, gutting the ordinance. Mayor Whitmire flipped from supporter to architect of repeal. ACC drops sharply (-18.7) — city's accountability infrastructure cannot withstand state coercion. INT drops (-12.5) — Whitmire integrity flip. BAND CHANGE Functional → Developing.
- **Palantir AI calibration:** April 24 Intercept (American Oversight FOIA) reveals $130M IRS Lead and Case Analytics contract since 2018. LCA aggregates tax returns + ACA data + bank statements + "all available" FinCEN data + dark-web crypto wallet data. Qualitatively distinct scope expansion from immigration to general-population financial surveillance. Below standard 5-pt threshold but submitted as calibration — floor-limitation methodology gap is 5+ nights overdue. BND/INT/EQU/ACC/AWR/ACT to floor; SYS holds 12.5 on continued operational deployment. Composite 6.6 places Palantir lower in Critical band.
- **OpenAI trial:** Trial Day 1 (April 27) procedural-only. Two claims survive: unjust enrichment + breach of charitable trust. CRITICAL evidence-base correction: October 2025 PBC restructuring kept OpenAI Foundation in CONTROL via board appointments and safety-veto rights despite holding only 26% equity (~$130B). Press "nonprofit loses controlling stake" framing conflates equity-minority with control-minority. Composite 27.5 holds. Mandatory post-remedy re-queue (1-2 weeks).
- **South Sudan FIFTH deferral:** UNMISS mandate expires April 30 (3 days). USUN explanation-of-vote page returns Technical Difficulties; press.un.org has no April 2026 renewal release. CANNOT BE DEFERRED BEYOND APRIL 30. Tomorrow's scanner must attempt direct retrieval with explicit fallback to human review.
- **US federal/state/local immigration enforcement cascade — first co-incident capture:** Federal (Palantir IRS scope expansion, EO 14398 Apr 24) + State (Texas SB4 5th Circuit Apr 24) + Local (Houston ordinance gut Apr 22). Pattern likely to recur in other Texas cities (Austin, San Antonio, Dallas) and other state-level deportation laws (Florida 287(g), Georgia HB 1105).
- **European asylum rights rollback sprint — 8 countries documented:** Netherlands joins Norway, Sweden, Finland, Denmark, Ireland, Austria, Germany. All implementations align with EU Pact on Migration June 12 entry-into-force. Rollback crosses center-right and center-left coalitions — institutional, not partisan.
- **Pending-cycle volume:** 12 proposals from Apr 25 + Apr 26 + 4 proposals tonight = 16 pending proposals collectively across 3 nights. Live indexes diverge from assessment outputs by a growing margin.

### Methodology Artifacts Surfaced

1. **First simultaneous capture across countries + us-states + us-cities + ai-labs:** Pipeline can now produce coordinated multi-index baselines that document cross-level structural patterns (federal/state/local enforcement cascade) in a single night. Prior multi-index nights surfaced independent events; tonight's four captures share an analytical thread.
2. **Calibration-proposal category formalized:** Sub-5-pt deltas can be submitted as "calibration proposals" when (a) qualitatively distinct evidence emerges that the prior assessment did not anchor against, (b) floor-limitation methodology gap is overdue, and (c) the entity is at the upper edge of expressive band-band scoring. Palantir AI is the first formal calibration proposal. This category documents the gap between methodology rigor and practical responsiveness while the floor-limitation framework is being developed.
3. **Floor-limitation methodology gap — 5+ nights overdue, severity escalated to HIGH:** Five entities (xAI 2.2, Palantir 10.3 → 6.6, Sudan 0, South Sudan 0, Israel 8.8) accumulating new evidence without expressive composite movement. Tonight's Palantir calibration is a partial response — does NOT address xAI/Sudan/South Sudan/Israel. Tier H4 IMPROVEMENT_BACKLOG item graduated to critical priority.
4. **Rotation-state vs live-index drift — pipeline integrity issue:** 8+ entities show drift (Netherlands, Germany, Canada, Ireland, US, OpenAI, Palantir, Texas). Six of eight are NOT in pending batches, meaning the drift is independent of pending-cycle isolation. Recommend dedicated reconciliation pass after all pending cycles applied.
5. **South Sudan UNMISS gate — severity escalated to CRITICAL:** Hard deadline April 30 (3 days). Five consecutive deferrals. If vote terms still unavailable tomorrow, escalate to direct human review.
6. **Three-cycle pending volume:** 16 score changes pending application across Apr 25 + Apr 26 + Apr 27 = approximately -157 composite-points pending. Mean per proposal: approximately -9.8 points (lower than prior batch mean because tonight's first-baseline corrections are smaller than F500 Gen-2 forensic anchors).

---

## Batch 13 — 2026-04-28

**Applied by:** Digest agent (no score changes — zero proposals generated)
**Indexes affected:** None
**Entities assessed:** 19 (18 confirmations + 1 deferral; 1 error-skip: Oracle)
**Proposals generated:** 0
**Deferrals:** 1 (South Sudan — SIXTH consecutive deferral; HARD DEADLINE BREACHED)

### Pipeline Summary

| Stage | Count |
|-------|-------|
| Entities scanned | 1,155 |
| Entities assessed | 19 |
| Proposals generated | 0 |
| Confirmations | 18 |
| T1 priority | 10 |
| T2 sector watch | 4 |
| T3 rotation | 5 |
| Deferrals | 1 |
| Errors (index gap) | 1 |

### Zero-Proposals Significance

Tonight is the first zero-proposal night in the pipeline's history. This reflects three simultaneous phenomena:

1. **Genuine stability** for Anthropic, DeepMind, Booz Allen Hamilton, Eli Lilly, and the five T3 rotation entities.
2. **Floor-limitation boundary effects** for xAI (2.2), Palantir (6.6), Sudan (0), and Israel (8.8) — all four have new material negative evidence in the April 14-28 window that the methodology cannot express downward.
3. **Pending-cycle isolation** — with 16 proposals pending application from April 25-27, several baselines are stale; confirmations tonight are anchored against live indexes, but scanner rotation-state continues to diverge.

The zero-proposal count does not indicate that the institutional landscape is uniformly stable. It indicates that (a) the April 14-28 evidence window did not produce new events crossing the 5-point composite threshold for any entity at the live baseline, and (b) the floor-limitation cluster is growing, not shrinking.

### Key Findings

- **DeepMind Frontier Safety Framework v3** (April 17): Tracked Capability Levels, new Critical Capability Level for harmful manipulation, internal-deployment safety case requirements. Most significant positive governance event of the night. Pre-EU AI Act positioning 96 days before enforcement.
- **Anthropic DC Circuit filing** (April 22, 96 pages): Explicitly defends Claude classified-network non-manipulability; maintains refusal of mass domestic surveillance and autonomous weapons use. Strongest positive INT/ACC signal from any AI lab in the April cycle.
- **AI-labor cascade**: Oracle 30K (March 31, pre-window, index gap), Meta 8K (April 23), Microsoft 8,750 voluntary buyouts (April 23) — approximately 47K in 30 days. All cite AI spending reallocation. Microsoft voluntariness modifier gap identified for EMP dimension.
- **Musk v. OpenAI trial Day 2** (April 28): opening arguments delivered; two claims survive (unjust enrichment, breach of charitable trust); liability phase to May 21; post-remedy mandatory re-queue.
- **Oracle index gap**: T2 priority with material layoff evidence; not in live F500 index; cannot process.

### Methodology Flags

1. **floor_limitation_methodology_gap** — CRITICAL (escalated from HIGH). 7 nights overdue. Five entities: xAI 2.2, Palantir 6.6, Sudan 0, South Sudan 0, Israel 8.8. Three options documented: (a) permanent-floor designation framework, (b) cumulative-evidence-tier weighting, (c) sub-score harm-scale qualifier. Recommend dedicated methodology development cycle within 7 days.

2. **south_sudan_unmiss_hard_deadline_breach** — CRITICAL. Sixth consecutive deferral. UNMISS mandate expires April 30 (T-2 days). Vote not retrievable in public sources. 2025 cycle precedent (Res 2778 technical rollover April 30, Res 2779 May 8) is most likely scenario but unconfirmed. Floor-limitation means any vote outcome requires methodology-note registration rather than composite change. Human review mandatory.

3. **rotation_state_drift** — HIGH. Microsoft (user-provided 76.8 vs live 66.4) and Masimo (rotation-state 76.4 vs live 48.4) confirmed tonight on live data. Drift will widen further until 16-proposal backlog is applied and reconciliation pass run.

4. **oracle_index_gap** — MEDIUM. Oracle not in live fortune-500 index. March 31 30K-layoff event is one of the most severe labor events in the F500 pool this cycle and cannot be processed. Recommend index reconciliation.

### South Sudan Escalation

HARD DEADLINE PROTOCOL ACTIVATED. Sixth consecutive deferral. UNMISS mandate expires April 30 (T-2 days). Cannot be deferred again. Escalated to PENDING_CHANGES.md human-review queue with explicit April 30 hard-deadline-breached marker. Floor-limitation means the appropriate response to any vote outcome is methodology-note registration (not a composite change proposal). Human review required to authorize the methodology note and decide whether to document the vote outcome as a formal evidence-tier event.

### Pending-Cycle Status (as of Night 10)

| Night | Proposals | Status |
|-------|-----------|--------|
| April 25 (Batch 10) | 7 | Pending founder review |
| April 26 (Batch 11) | 5 | Pending founder review |
| April 27 (Batch 12) | 4 | Pending founder review |
| April 28 (Batch 13) | 0 | N/A — no proposals |

Total pending: 16 proposals. Recommend founder review and application before May 1.
