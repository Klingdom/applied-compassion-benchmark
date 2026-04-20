# Changelog

Public-facing record of published score updates to the Compassion Benchmark indexes.

---

## 2026-04-20 — Methodology v1.1 — Integration Premium Cap

**What changed:** The integration premium in the composite formula (bonus awarded to entities with clean, uniform, high dimension profiles) was reduced from a maximum of +20 to +10. This was bundled with today's determinism release to prevent entities with documented regressions (e.g., Target's 2025 DEI rollback) from computing to perfect 100.

**Effect:**
- 90 entities adjusted by |Δ| ≥ 0.5
- 16 band transitions (all Exemplary → Established)
- No entity now scores exactly 100 — a maximum score now requires all-5 dimension scores backed by evidence, which the dataset does not currently contain
- Target 100 → 92.8 (still Exemplary, but within evidence range)
- Germany / Hugging Face 100 → 95.9
- Amsterdam / Massachusetts / Washington 100 → 94.4
- Munich 99.7 → 89.7 (first Exemplary → Established band transition under the new cap)

**Methodology note:** The formula intent — to reward consistent, harm-free, high-performing profiles — is preserved. The cap simply ensures that the bonus does not override evidence quality at the ceiling. Further methodology refinements (evidence-of-excellence gate, qualitative override for documented regressions) are queued for future releases.

---

## 2026-04-20 — Methodology Determinism Release

**Systemic fix:** All 1,155 composite scores are now deterministically computed from their dimension scores using the canonical formula in `site/src/lib/scoring.ts`. Previously, stored composites had drifted from formula output — the most visible artifact being "floor-clamped" entities (Haiti, Libya, Somalia, Central African Republic) published at 0.0 despite dimension scores producing a formula composite of 4.7.

**What changed:**
- 871 of 1,155 entities had composite adjustments of |Δ| ≥ 0.5
- 206 band reassignments
- Floor-clamp correction: Haiti, Libya, Somalia, Central African Republic 0.0 → 4.7
- 206 entities moved exactly −3.0 (formula correctly removes integration premium when 6+ dimensions are below 4.0)
- 14 entities with recently-published evidence-based assessments (Venezuela, Alphabet, Anthropic, Character AI, GEO Group, CoreCivic + today's F500 batch) were protected from overwrite

**Why:** The core product claim — evidence-based, reproducible scoring — requires that stored composite = formula(dimension scores). This has now been enforced at the data layer with `site/scripts/validate-indexes.mjs` rejecting any drift above 2.0 points going forward.

**Known follow-up:** The recomputation exposed that the integration premium (+20 pts for clean, uniform, high dimension profiles) is too aggressive at the top end. Several entities with documented regressions (e.g., Target DEI rollback) compute to 100. Methodology v1.1 is queued in `research/IMPROVEMENT_BACKLOG_2026-04-18.md` (Tier H) to cap the premium and add a qualitative override layer.

---

## 2026-04-20

### Score Updates

**Fortune 500**
- **State Street** 92.5 → 60.2 (−32.3, Exemplary → **Functional**). First evidence-based assessment of this entity, replacing a reputational placeholder. Core findings: 900 AI-efficiency layoffs in Q2 2025 with further 20–30% Global Delivery reductions projected for 2026; $7.5M Connecticut AG settlement for inflated fees; TCFD/SASB endorsement language removed under political pressure. Genuine SYS strength acknowledged (Sustainability Stewardship Service). Rank falls from #1 to #76.
- **Abbott Laboratories** 87.4 → 57.8 (−29.6, Exemplary → **Functional**). First evidence-based assessment. 782 NEC (necrotizing enterocolitis) cases pending in federal MDL 3026; $495M (July 2024) and $70M (April 2026) jury verdicts against Abbott on Similac formulas; company continues to deny scientific link to NEC despite verdicts. 2022 Similac powder formula recall (Salmonella, Cronobacter) at Sturgis Michigan facility. Medical device innovation (FreeStyle Libre CGM) acknowledged in SYS score. Rank falls from #4 to #82.
- **Microsoft** 87.8 → 66.4 (−21.4, Exemplary → **Established**). First evidence-based assessment. January 2026 planned layoffs of 11,000–22,000 employees; February 2026 RTO mandate described by staff as "soft layoff"; 2025 removal of DEI from performance criteria; no diversity report published in 2025–26. Responsible AI Transparency Report, Xbox Adaptive Controller, and Seeing AI accessibility tools anchor the Established band. Rank falls from #3 to #34.
- **Nucor** 87.4 → 66.4 (−21.0, Exemplary → **Established**). First evidence-based assessment. No-layoff policy across economic cycles is a genuine and distinguishing EMP strength. Electric-arc furnace steel at 77% recycled content and 2050 net-zero SBTs support SYS score. Contractor fatalities in 2023–2024 indicate a gap between direct-employee and contractor safety cultures. DEI disclosure softened from prior years. Rank falls from #9 to #35.
- **Ecolab** 87.4 → 68.8 (−18.6, Exemplary → **Established**). First evidence-based assessment; strongest of the five first-time baselines in this batch. PFAS phase-out commitment (end of 2026), 2030 Positive Impact framework (300B gallons water/year; benefit for 3B people), Water.org partnership, and Global Sustainability Network (1,300+ employee associates) are substantive. SYS dimension scores Exemplary at 81.3. Rank falls from #6 to #32.
- **Walt Disney** 60.8 → 52.2 (−8.6, Established → **Functional**). April 14, 2026 layoffs of approximately 1,000 employees with explicit AI-efficiency rationale in CEO D'Amaro memo; $95–130M restructuring charge; entire marketing and home-entertainment teams eliminated across Hulu, FX, ESPN, ABC News. Severance package (4-month + prorated bonus + health continuation) is above sector median. 2025 Disneyland wage-theft settlement and active Orlando UNITE HERE contract provide structural labor floor. Rank moves from #78 to #90.
- **Pfizer** 65.5 → 57.8 (−7.7, Established → **Functional**). Led 2026 US drug price increases — 80 products raised, more than any other pharmaceutical company; Comirnaty up 15%. Washington State drug-pricing law signed March 2026; Senate Democrat report flagged contradictions with MFN agreement commitments. Patient-assistance infrastructure (RxPathways, PAP Connect) remains substantive and prevents a deeper downgrade. Rank moves from #48 to #83.

**Countries**
- **Saudi Arabia** 4.4 → 9.4 (+5.0, Critical). Floor-clamping methodology correction: several published subdimension scores were set at 1.0 (= 0.0 scaled), which did not reflect observed non-zero baseline practices. This adjustment is a methodology artifact, not a substantive improvement signal — execution record is worsening (356 executions in 2025, a second consecutive annual record; majority drug-related; majority foreign nationals). NEOM forced evictions continuing; academic died in prison April 2026. Rank moves from #174 to #158 within Critical band.

---

## 2026-04-19

### Score Updates

**Countries**
- **Venezuela** 4.4 → 18.0 (+13.6, Critical). Regime-change reset. First 100-day transitional baseline under Acting President Rodríguez following Maduro's capture (January 3, 2026). Amnesty law passed, 659+ political prisoners released. HRW/WOLA note that repressive architecture remains largely intact — transition is fragile. Band remains Critical; crossover to Developing (20.0) is 2 points away. Full reassessment scheduled Q2 2026.

**Fortune 500**
- **Alphabet/Google** 42.2 → 40.6 (−1.6, Functional → **Developing**). DOJ chose choice-screen/defaults remedy over structural breakup (April 8, 2026), reducing ACC ceiling. INT dimension dragging on Project Nimbus-type posture. Crosses the Functional/Developing boundary at 41.0.
- **GEO Group** 7.5 → 6.6 (−0.9, Critical). First-time baseline refined from initial placeholder. Adelanto detention conditions trial begins April 30.
- **Core Civic** 7.5 → 7.0 (−0.5, Critical). First-time baseline refined from initial placeholder.

**AI Labs**
- **Anthropic** 68.8 → 62.2 (−6.6, Established). RSP (Responsible Scaling Policy) rollback documented April 7; Illinois SB 3261 catastrophe-liability bill filed April 17; Pentagon supply-chain-risk litigation. Anthropic remains the highest-scoring frontier AI lab in the index.
- **Character AI** 30.8 → 23.8 (−7.0, Developing). Score correction following January 2026 Google-brokered settlement of teen-harm and suicide-related lawsuits (Garcia case). Pre-settlement EMP, SYS, and INT scores did not fully reflect the harm record.

---

## 2026-04-18

### Score Updates

**Fortune 500**
- **Target** 92.5 → 82.5 (−10.0, Exemplary). DEI program rollback under political pressure; material I1/EQU/ACC event.
- **Meta Platforms** 12.2 → 10.9 (−1.3, Critical). Confirmatory assessment.
- **Ford Motor** 48.4 → 42.5 (−5.9, Functional).

**Countries**
- **Iran** 2.8 → 2.5 (−0.3, Critical).

**US Cities**
- **New York City** 48.4 → 56.3 (+7.9, Functional). REP (Right to Shelter Expansion Program) implementation progress.

**AI Labs**
- **OpenAI** 30.5 → 38.8 (+8.3, Developing).

---

## 2026-04-17

### Score Updates

**Fortune 500**
- **CVS Health** 50.0 → 31.3 (−18.7, Functional → Developing). DOJ False Claims Act settlement ($290M + $45M), 900+ pharmacy closures.
- **Amazon** 21.6 → 17.2 (−4.4, Developing → Critical). NLRB bargaining order (first ever against Amazon).

**Countries**
- **United States** 35.5 → 25.0 (−10.5, Developing). USAID dissolution; estimated 781K deaths from discontinued aid programs.

**AI Labs**
- **OpenAI** 40.6 → 30.5 (−10.1, Functional → Developing).

---

## 2026-04-15 / 2026-04-16

### Score Updates

Initial major correction batch. Key changes:

- **xAI/Grok** 18.3 → 2.2 (−16.1, Critical)
- **Mistral AI** 76.4 → 46.9 (−29.5, Established → Functional)
- **Anthropic** 90.9 → 68.8 (−22.1, Exemplary → Established)
- **OpenAI** 60.8 → 40.6 (−20.2, Established → Functional)
- **Johnson & Johnson** 48.4 → 27.5 (−20.9, Functional → Developing)
- **Israel** 27.8 → 8.8 (−19.0, Developing → Critical)
- **Alphabet/Google** 51.6 → 42.2 (−9.4, Functional)
- **UnitedHealth Group** 16.9 → 10.9 (−6.0, Critical)
- **Rwanda** 41.8 → 30.0 (−11.8, Functional → Developing)
