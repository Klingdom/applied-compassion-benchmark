---
entity: "Unum Group"
type: "Company"
sector: "Insurance (group disability, life, leave management)"
date: "2026-09-24"
composite_score: 39.4
band: "Developing"
scores:
  AWR: 2.4
  EMP: 2.2
  ACT: 3.0
  EQU: 2.6
  BND: 2.8
  ACC: 2.8
  SYS: 2.6
  INT: 2.2
published_index: "fortune-500"
published_rank: 52
published_composite: 60.9
published_band: "established"
published_dimensions:
  AWR: 3.5
  EMP: 3.5
  ACT: 3.5
  EQU: 3.0
  BND: 3.5
  ACC: 3.5
  SYS: 3.5
  INT: 3.5
assessed_composite: 39.4
score_delta: -21.5
band_change: true
filing_trigger_met: true
filing_trigger: "magnitude (-21.5) and band crossing (Established -> Developing)"
outcome: "proposal"
recommendation: "downgrade"
change_proposal: true
confidence: "medium"
subdim_sidecar: true
seed_baseline_recalibration: true
watch_flag: true
calibration_flag: "60.9 uniform-seed plateau (Hartford, Travelers, MetLife, Unum all identical) warrants band-wide review"
source: "rotation"
scan_file: "research/scans/2026-09-24.json"
integration_premium: 0
methodology_version: "v1.2"
math_hygiene_reconstruction_diff: 0
---

# Compassion Benchmark Assessment: Unum Group

**Entity type:** Company
**Sector/Domain:** Insurance — group disability, life and leave management
**Assessment date:** 2026-09-24
**Composite score:** 39.4/100
**Band:** Developing
**Cycle:** catch-up nightly, lookback 2026-09-10 to 2026-09-24 (scan `research/scans/2026-09-24.json`, source: rotation — never assessed)
**Outcome:** change proposal (recommendation: downgrade)

## Why this entity was assessed

Rotation backfill: `last_assessed: null`, staleness score 25. No in-window news event. This is a first evidence-based baseline for a never-assessed row.

## Evidence-date, provenance, attribution and screening checks

**BASELINE PROVENANCE (read first).** `research/APPLIED_CHANGES.md` has no Unum entry. The published vector is `3.5 / 3.5 / 3.5 / 3.0 / 3.5 / 3.5 / 3.5 / 3.5` — **byte-identical to The Hartford, Travelers and MetLife**, all four at composite 60.9 and adjacent ranks 43, 50, 51, 52. This is the 60.9 uniform seed cluster, not a measurement. Canonical reconstruction returns 60.9 exactly — **no math-hygiene issue.**

**SOURCE-DIRECTION DISCIPLINE.** This entity surfaced on rotation, not on negative news, so screening rule 3 does not constrain the direction. The evidence located points down, and the proposal is a downgrade.

**HISTORICAL RECORD SEPARATED FROM CURRENT CONDUCT.** The 2004 multistate regulatory settlement (48 states, $15 million, plus a separate California agreement and $8 million fine, requiring claims-procedure restructuring and reassessment of roughly 200,000 claims) is 22 years old. It is **not** scored as current conduct. It is used only where it establishes what the company has already been required to do, which bears on whether later practice shows systemic learning. The reported outcome — over 45% of reassessed claims reversed and more than $558 million in additional benefits paid — is cited from a claimant-side law firm and is therefore **tier 1-2 advocacy sourcing**. It is treated as indicative, not as a scoring anchor.

**THE FIRMEST RECENT EVIDENCE IS A COURT-APPROVED SETTLEMENT ABOUT UNUM'S OWN STAFF.** On 17 April 2025 the federal district court for the Eastern District of Tennessee granted final approval of a $14.8 million wage-and-hour class settlement. The class were disability benefits specialists — the people who process short- and long-term disability claims — who alleged they had been misclassified as exempt and denied overtime under federal and Maine law. Roughly 910 participating class members averaged over $10,000 each, with 52 receiving more than $30,000. This is a tier-4/5 adjudicated item and it is scored in B1, I3 and AB1.

**ONGOING DENIAL LITIGATION IS NOT SCORED AS A FINDING.** Courts continued hearing ERISA denial challenges through 2025 and into 2026 (fibromyalgia, chronic fatigue syndrome, mental-health and back-injury claims) with mixed outcomes, including at least one appellate decision upholding Unum's denial. Unresolved or defence-favourable litigation is not a finding of harm and is not scored as one. Its volume is noted as context only.

## Score Summary

| Dimension | Code | Raw (1-5) | Scaled (0-100) | Published raw | Change |
|-----------|------|-----------|----------------|---------------|--------|
| Awareness | AWR | 2.4 | 35.0 | 3.5 | -1.1 |
| Empathy | EMP | 2.2 | 30.0 | 3.5 | -1.3 |
| Action | ACT | 3.0 | 50.0 | 3.5 | -0.5 |
| Equity | EQU | 2.6 | 40.0 | 3.0 | -0.4 |
| Boundaries | BND | 2.8 | 45.0 | 3.5 | -0.7 |
| Accountability | ACC | 2.8 | 45.0 | 3.5 | -0.7 |
| Systemic Thinking | SYS | 2.6 | 40.0 | 3.5 | -0.9 |
| Integrity | INT | 2.2 | 30.0 | 3.5 | -1.3 |
| **Composite** | — | — | **39.4** | **60.9** | **-21.5** |

## Dimension Details

### AWR: Awareness (2.4 raw / 35.0 scaled)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| A1 Suffering Detection | 3/5 | Claim intake, clinical review and return-to-work assessment are structured mechanisms that do detect functional impairment. Applied inconsistently across contested condition types. | ERISA litigation pattern, 2025-2026 |
| A2 Contextual Sensitivity | 3/5 | Leave-management products accommodate employer and jurisdiction differences; no evidence of differentiated pathways co-designed with claimant groups. | (evidence gap) |
| A3 Blind Spot Mitigation | 2/5 | No structured process for identifying whom the claims process misses was located. The conditions recurring in litigation (fibromyalgia, chronic fatigue syndrome, mental health) are the predictable blind spot. | (evidence gap) |
| A4 Signal Amplification | 2/5 | Claimants with contested conditions reach the company through counsel and the courts. No internal channel with authority for low-power claimants is evidenced. | (evidence gap) |
| A5 Anticipatory Awareness | 2/5 | No published harm assessment before major claims-policy or classification decisions. The 2025 misclassification settlement concerned a classification decision made without one. | McGillivary Steele Elkin, 2025-04 |

### EMP: Empathy (2.2 raw / 30.0 scaled)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| E1 Affective Resonance | 3/5 | Claims and vocational staff are trained and the return-to-work model requires sustained personal contact. Experience is mixed. | (company disclosure) |
| E2 Perspective-Taking | 2/5 | Perspective-taking is acknowledged in company language; no structural mechanism that changed a claims decision is evidenced. | (evidence gap) |
| E3 Non-Judgment | 2/5 | Some disaggregation exists in workforce reporting; no disaggregated claims-outcome data by condition type is published, and the contested-condition pattern is not investigated publicly. | (evidence gap) |
| E4 Validation | 2/5 | Denials are litigated rather than revisited. "We take all concerns seriously" language with an appeal process that is procedural rather than validating. | ERISA litigation pattern, 2025-2026 |
| E5 Cultural Empathy | 2/5 | Cultural competency is not a documented requirement in claims handling. Translation-level adaptation only. | (evidence gap) |

### ACT: Action (3.0 raw / 50.0 scaled)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| AC1 Responsiveness | 3/5 | ERISA imposes defined decision timelines and Unum reports against them. Standards met for most cases. | (regulatory framework) |
| AC2 Proportionality | 3/5 | Benefit levels follow contractual formulae and assessed functional capacity, which genuinely informs the response in most cases. | (company disclosure) |
| AC3 Efficacy | 3/5 | Return-to-work and recovery outcomes are measured and reported at portfolio level, and reviewed annually. | (company disclosure) |
| AC4 Resource Mobilization | 3/5 | Reserves are adequate and benefits are paid at scale; no gap analysis against unmet claimant need is published. | (company disclosure) |
| AC5 Follow-Through | 3/5 | Vocational rehabilitation and return-to-work case management are defined multi-month protocols for specific claimant types — genuine persistence beyond the initial decision. | (company disclosure) |

### EQU: Equity (2.6 raw / 40.0 scaled)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| EQ1 Universality | 3/5 | Group cover reaches millions of workers through employers, with coverage data reported at portfolio level; access depends on employer purchase. | (company disclosure) |
| EQ2 Priority for Vulnerable | 2/5 | Priority is stated; allocation follows contract terms rather than need severity. | (evidence gap) |
| EQ3 Bias Awareness | 2/5 | Some disaggregation; disparities in approval rates by condition type are not investigated publicly. | (evidence gap) |
| EQ4 Access Design | 3/5 | Digital claim filing, leave-management portals and employer-side navigation remove real barriers. | (company disclosure) |
| EQ5 Historical Harm Acknowledgment | 3/5 | The 2004 multistate agreement produced a formal, regulator-supervised acknowledgment of a specific harm and a reassessment of roughly 200,000 claims. Compelled, but concrete and specific. | ERISA Law Group (tier 1-2), historical |

### BND: Boundaries (2.8 raw / 45.0 scaled)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| B1 Self-Sustainability | 2/5 | A court-approved settlement establishes that the staff who decide disability claims were themselves misclassified and worked unpaid overtime. Wellbeing resources may exist, but the structural evidence points the other way. | McGillivary Steele Elkin, 2025-04 |
| B2 Autonomy Preservation | 4/5 | Vocational rehabilitation and return-to-work are explicitly designed to restore earning capacity and end the claim. Autonomy outcomes are measured and stepping back is the documented goal. | (company disclosure) |
| B3 Scope Clarity | 3/5 | Policy definitions of disability and limitation periods are disclosed at enrolment; claimants routinely discover the practical effect later. | ERISA litigation pattern |
| B4 Refusal Ethics | 2/5 | Denials come with statutory appeal rights but no structured alternative or warm referral. | ERISA litigation pattern |
| B5 Consent Orientation | 3/5 | Authorisations for medical release are explained and withdrawal is communicated; forms are institution-protective. | (company disclosure) |

### ACC: Accountability (2.8 raw / 45.0 scaled)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| AB1 Harm Acknowledgment | 2/5 | Both the 2004 regulatory finding and the 2025 wage settlement were acknowledged only after external establishment. | McGillivary Steele Elkin, 2025-04 |
| AB2 Correction Willingness | 3/5 | Claims procedures were restructured after the 2004 settlement — at least one significant course correction on harm evidence, under pressure. | historical, tier 1-2 |
| AB3 Transparency | 3/5 | Annual report and SEC filings disclose litigation and reserve development, including unflattering items. | SEC filings |
| AB4 Systemic Learning | 3/5 | The reassessment of roughly 200,000 claims was a systemic rather than case-by-case remedy, with documented procedural changes. | historical, tier 1-2 |
| AB5 Reparative Action | 3/5 | Both the claims reassessment programme and the $14.8 million class settlement delivered concrete money to identified harmed parties. Compelled, not self-initiated. | McGillivary Steele Elkin, 2025-04 |

### SYS: Systemic Thinking (2.6 raw / 40.0 scaled)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| S1 Root Cause Orientation | 3/5 | Workplace absence prevention and early-intervention products address upstream drivers of disability, with some resourcing. | (company disclosure) |
| S2 Long-Term Impact | 3/5 | Long-duration liability modelling requires multi-decade horizons and is disclosed; social-impact goals are shorter and partly aspirational. | SEC filings |
| S3 Interconnection Awareness | 2/5 | Effects on the public disability system (Social Security offsets) are transactional rather than tracked as a cross-system outcome. | (evidence gap) |
| S4 Structural Critique | 2/5 | No public position located that questions the employer-sponsored coverage structure on which its model depends. | (evidence gap) |
| S5 Coalitional Compassion | 3/5 | Active participation in disability-employment and paid-leave policy coalitions with documented contributions. | (company disclosure) |

### INT: Integrity (2.2 raw / 30.0 scaled)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| I1 Consistency Under Pressure | 2/5 | No case located of Unum bearing real cost to honour a contested commitment. Compromises under margin pressure are not acknowledged. | (evidence gap) |
| I2 Non-Performance | 2/5 | Social-impact practice is documented mainly where it is reputationally visible. | (evidence gap) |
| I3 Internal Consistency | 2/5 | The sharpest finding in this assessment. A disability insurer was found, by court-approved settlement, to have underpaid the very staff who process disability claims. The internal-external gap is established and not addressed. | McGillivary Steele Elkin, 2025-04 |
| I4 Values Alignment | 2/5 | Stated commitment to "helping the working world thrive" sits against a 910-member unpaid-overtime class of its own benefits specialists, without acknowledgment. | McGillivary Steele Elkin, 2025-04 |
| I5 Resilience of Care | 3/5 | Core claims practices are embedded in policy and regulation and have survived leadership transitions. | (company disclosure) |

## Published Index Comparison

**Published index:** fortune-500 | **Published rank:** #52 of 447 | **Published composite:** 60.9/100 | **Published band:** Established

| Dimension | Published (raw) | Published (scaled) | Research | Difference | Explanation |
|---|---|---|---|---|---|
| AWR | 3.5 | 62.5 | 35.0 | -27.5 | A3 and A4 at 2/5: no blind-spot process, no channel with authority for contested-condition claimants. |
| EMP | 3.5 | 62.5 | 30.0 | -32.5 | E2, E3, E4, E5 all at 2/5. No structural perspective-taking or validation evidenced. |
| ACT | 3.5 | 62.5 | 50.0 | -12.5 | Smallest change. ERISA timelines and return-to-work case management are real operational strengths. |
| EQU | 3.0 | 50.0 | 40.0 | -10.0 | EQ5 held at 3/5 on the 2004 regulator-supervised reassessment. |
| BND | 3.5 | 62.5 | 45.0 | -17.5 | B2 held at 4/5 — capacity-building is the core product logic — against B1 at 2/5 on the staff settlement. |
| ACC | 3.5 | 62.5 | 45.0 | -17.5 | AB2, AB4, AB5 all at 3/5: real corrections and real money, but always compelled. |
| SYS | 3.5 | 62.5 | 40.0 | -22.5 | S3 and S4 at 2/5; no structural critique of employer-sponsored coverage. |
| INT | 3.5 | 62.5 | 30.0 | -32.5 | I3 at 2/5 on an adjudicated internal-consistency failure. |
| **Composite** | — | **60.9** | **39.4** | **-21.5** | Band crossing: Established to Developing. |

### Score Difference Analysis

Unum is not a floor case. Its Action score of 3.0 is genuine: statutory decision timelines are met, and vocational rehabilitation is one of the clearest examples in the Fortune 500 of help designed to end itself, which is what Boundaries subdimension B2 rewards. It scores 4/5 there, the highest single subdimension in the assessment.

What the published 60.9 cannot survive is Integrity and Empathy. The 2025 wage-and-hour settlement is unusually probative for this instrument, because the harmed class is the claims workforce itself. A disability insurer that misclassifies its own disability benefits specialists has an internal-consistency problem that is adjudicated rather than alleged.

The -21.5 is mostly de-seeding. The published 3.5s asserted anchor-4 behaviour — community-confirmed care, disparities investigated, acknowledgment structurally prior to investigation. No evidence of any of that was located, and the methodology requires the lower anchor when evidence is absent.

**Calibration flag, not a proposal.** The Hartford, Travelers and MetLife carry the identical 60.9 seed vector. Nothing in this assessment speaks to those three, and none of them is moved here. The plateau is recorded for coordinator-level band review.

### Recommendation

The published score is **overstated**. Propose 39.4, Developing. Confidence medium: the direction is well supported and the 2025 settlement is adjudicated, but Unum's own sustainability and social-impact reporting was not retrieved in full, and several subdimensions rest on absence of evidence rather than adverse evidence.

## Key Findings

- Why it matters: the published score of 60.9 out of 100 was never measured. It is the same number, on the same eight figures, as The Hartford, Travelers and MetLife. This is Unum's first evidence-based score: 39.4 out of 100.
- Why it matters: a court approved a $14.8 million settlement in April 2025 for Unum's own disability claims staff. About 910 of them said they were wrongly classed as exempt and denied overtime.
- Why it matters: that finding is about the staff who decide whether disabled people get paid. A disability insurer underpaying its own disability specialists is an internal-consistency failure, not a technicality.
- Why it matters: Unum does one thing unusually well. Its return-to-work programme is built to end the claim and restore earning power, which is the benchmark's definition of help that does not create dependency.
- Why it matters: every correction Unum has made was compelled. The 2004 settlement with 48 states, and the 2025 settlement, both came after outside bodies established the problem.

## Strongest Dimensions

Action (raw 3.0), on statutory decision timelines and return-to-work case management.

## Weakest Dimensions

Empathy and Integrity (both raw 2.2). Contested-condition claimants are processed and litigated, not validated; and the 2025 staff settlement establishes an unaddressed internal-external gap.

## Evidence Gaps

- Unum's own sustainability and social-impact report was not retrieved in full. AB3, AC3, S2 and I2 may be understated.
- The 45%-reversal and $558 million figures from the 2004 reassessment come from claimant-side advocacy sources (tier 1-2) and are not used as scoring anchors.
- No independent audit of Unum's claims outcomes by condition type was located. EQ3 and E3 rest on absence of disclosure.

## Recommended Next Steps

**Developing** band: consider a [Certified Assessment](/certified-assessments) for a structured improvement roadmap.

## Sources

- McGillivary Steele Elkin LLP, final approval of $14.8m wage settlement (E.D. Tenn., 2025-04-17) — tier 2 reporting a court order — https://www.mselaborlaw.com/news/unum-disability-benefits-specialists-settle-overtime-lawsuit/
- Bloomberg Law, Unum $14.8 million wage settlement — tier 2 — https://news.bloomberglaw.com/daily-labor-report/unum-workers-agree-to-14-8-million-settlement-to-end-wage-suit
- ERISA Law Group, Unum regulatory history (2004 multistate settlement; claimant-side source, tier 1-2) — https://www.theerisalawgroup.com/what-we-do/who-we-fight/unum/
- Sokolove Law, Unum disability denial litigation overview 2026 (claimant-side source, tier 1-2) — https://www.sokolovelaw.com/disability-insurance-denial/long-term-disability-denial/insurance-providers/unum/
- Unum Group FY2025 annual report (Form ARS), SEC — tier 4 — https://www.sec.gov/Archives/edgar/data/5513/000000551326000030/unm-2025_ars.pdf

---

*This assessment is based on publicly available information and does not constitute a formal Compassion Benchmark Certified Assessment. For a comprehensive, assessor-led evaluation, visit compassionbenchmark.com/certified-assessments.*
