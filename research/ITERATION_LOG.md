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
