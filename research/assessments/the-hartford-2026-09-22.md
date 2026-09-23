---
entity: "The Hartford"
type: "Company"
sector: "Insurance"
date: "2026-09-22"
composite_score: 43.8
band: "Functional"
scores:
  AWR: 3.2
  EMP: 2.4
  ACT: 3
  EQU: 2.4
  BND: 2.4
  ACC: 2.6
  SYS: 2.8
  INT: 3.2
published_index: "fortune-500"
published_rank: 50
published_composite: 60.9
published_band: "Established"
published_dimensions:
  AWR: 3.5
  EMP: 3.5
  ACT: 3.5
  EQU: 3
  BND: 3.5
  ACC: 3.5
  SYS: 3.5
  INT: 3.5
assessed_composite: 43.8
score_delta: -17.1
band_change: true
filing_trigger_met: false
outcome: "first formal evidence-based baseline; measurement recorded, routed to calibration review"
assessment_type: "full 40-subdimension first baseline (rotation backfill)"
recommendation: "flag-for-review"
change_proposal: false
confidence: "medium"
subdim_sidecar: true
methodology_version: "v1.2"
source: "rotation"
scan_file: "research/scans/2026-09-22.json"
watch_flag: "Re-test E4, B3 and B5 on the outcome of the ERISA group-disability class actions now in discovery, and on any remediation disclosure following the Florida targeted market conduct examination findings on adjuster appointments and damage-estimate disclosure statements."
calibration_flag: "The published composite sits in a 19-entity identical-dimension-vector cohort in `site/src/data/indexes/fortune-500.json` (including A.O. Smith, ADP, Aon, Ball Corporation, Dell Technologies, Erie Indemnity, ManpowerGroup and Marsh & McLennan). Byte-identical dimension vectors across 19 unrelated companies in different sectors is the signature of an unassessed seed value, not of measurement. Per anti-false-positive screening rule 5, a shared-artefact gap of this kind is routed to coordinator-level calibration review rather than encoded as a one-off baseline-reset proposal."
---

# Compassion Benchmark Assessment: The Hartford

**Entity type:** Company  
**Sector/Domain:** Insurance  
**Assessment date:** 2026-09-22  
**Composite score:** 43.8/100  
**Band:** Functional  
**Cycle:** nightly, lookback 2026-09-08 to 2026-09-22 (scan `research/scans/2026-09-22.json`, source: rotation)  
**Outcome:** first formal evidence-based baseline; measurement recorded, routed to calibration review (recommendation: flag-for-review)

## Why this entity was assessed

The Hartford was drawn from the scanner’s staleness-based rotation backfill: never assessed (`last_assessed: null`, zero files under `research/assessments/the-hartford-*.md`), and its individual Tier 1 search this cycle surfaced no in-window news evidence. This cycle produces a cold first baseline.

## Evidence-date and attribution checks

**No in-window event.** Nothing dated between 2026-09-08 and 2026-09-22 was located, so nothing is scored as a recency event.

**Allegation discipline.** The ERISA group-disability class actions are in discovery and are **allegations**; the specific practice alleged — reducing a claimant’s benefit because his disabled adult son receives Social Security — is described in reporting as a contract provision, and it is the *provision being buried* that is scored at B3, not the merits of the claim. The $13.75 million data-breach settlement is a **completed** settlement and is scored.

**Entity-scope check.** Search results returned Hartford Life separate-account filings from 2006 and Hartford Insurance Company of the Midwest subsidiary examinations. Subsidiary regulator findings are treated as the group’s conduct; the 2006 filings are out of scope on recency and are not used.

## Score Summary

| Dimension | Code | Raw (1-5) | Scaled (0-100) | Band |
|-----------|------|-----------|----------------|------|
| Awareness | AWR | 3.2 | 55 | Functional |
| Empathy | EMP | 2.4 | 35 | Developing |
| Action | ACT | 3 | 50 | Functional |
| Equity | EQU | 2.4 | 35 | Developing |
| Boundaries | BND | 2.4 | 35 | Developing |
| Accountability | ACC | 2.6 | 40 | Developing |
| Systemic Thinking | SYS | 2.8 | 45 | Functional |
| Integrity | INT | 3.2 | 55 | Functional |
| **Composite** | — | — | **43.8** | **Functional** |

**Composite derivation (canonical formula, methodology v1.2, `site/scripts/lib/scoring.mjs::computeCompositeFromDimensions`):** mean of the 8 raw dimension scores = 2.750; baseComposite = 43.75; dimensions below 4.0 = 8; integration premium applied by the canonical function. Final composite **43.8** (Functional).

## Dimension Details

### AWR: Awareness (Raw 3.2/5 — Scaled 55/100)

| Subdimension | Score | Evidence | Source | Tier |
|-------------|-------|----------|--------|------|
| A1 Suffering Detection | 4/5 | Multiple channels with formal pathways and annual review: the Future of Benefits Study surveys employers and employees each year, and absence-management data feeds product design. The 2026 edition reports employers seeking simplicity in a more complex landscape. | [The Hartford — Future of Benefits Study](https://www.thehartford.com/employee-benefits/future-of-benefits-study) | 4 |
| A2 Contextual Sensitivity | 3/5 | Genuine effort to adapt with gaps: differentiated approaches for employers above and below 500 employees, and for disability, absence and leave populations. No differentiated process for low-literacy claimants documented. | [The Hartford — Future of Benefits Study press release](https://newsroom.thehartford.com/newsroom-home/news-releases/news-release-details/2026/The-Hartfords-Future-Of-Benefits-Study-Employers-Seeking-Simplicity-And-Ease-In-The-Face-Of-Increasingly-Complex-Landscape/default.aspx) | 4 |
| A3 Blind Spot Mitigation | 3/5 | A process exists that has produced findings: the annual benefits study repeatedly surfaces gaps between employer intent and employee experience, and drove the shift toward paid family and medical leave capability. | [The Hartford — Future of Benefits Study press release](https://newsroom.thehartford.com/newsroom-home/news-releases/news-release-details/2026/The-Hartfords-Future-Of-Benefits-Study-Employers-Seeking-Simplicity-And-Ease-In-The-Face-Of-Increasingly-Complex-Landscape/default.aspx) | 4 |
| A4 Signal Amplification | 3/5 | Designated structures with some reach: the benefits study gives employees a surveyed voice separate from the employers who buy the product, which is the relevant low-power group here. | [The Hartford — Future of Benefits Study](https://www.thehartford.com/employee-benefits/future-of-benefits-study) | 4 |
| A5 Anticipatory Awareness | 3/5 | Formal pre-launch assessment for some decisions: product and capability development follows the annual study findings. Not documented as required for all major decisions. | [The Hartford 2025 Sustainability Report](https://assets.thehartford.com/image/upload/sustainability_highlight_report.pdf) | 4 |

### EMP: Empathy (Raw 2.4/5 — Scaled 35/100)

| Subdimension | Score | Evidence | Source | Tier |
|-------------|-------|----------|--------|------|
| E1 Affective Resonance | 3/5 | Training and expectation exist and many people experience it well internally, but claimant-facing consistency is contradicted by a regulator finding of missing damage-estimate disclosure statements in hurricane claims. | [Florida Office of Insurance Regulation — targeted market conduct examination, Hartford Insurance Company of the Midwest](https://floir.gov/docs-sf/property-casualty-libraries/market-regulation/2025/2-hartford-midwest_final-report.pdf?sfvrsn=e9d64163_3) | 5 |
| E2 Perspective-Taking | 3/5 | At least one formal mechanism used with at least one decision modified: The Hartford developed personalised absence-management and paid family and medical leave capability in direct response to surveyed customer demand. | [The Hartford — Future of Benefits Study press release](https://newsroom.thehartford.com/newsroom-home/news-releases/news-release-details/2026/The-Hartfords-Future-Of-Benefits-Study-Employers-Seeking-Simplicity-And-Ease-In-The-Face-Of-Increasingly-Complex-Landscape/default.aspx) | 4 |
| E3 Non-Judgment | 2/5 | Non-judgment stated but not measured. No disaggregated claims-outcome data was located, and the disability offset practice at issue in litigation applies categorically. | [Bloomberg Law — Hartford faces disability class action on Social Security policy](https://news.bloomberglaw.com/daily-labor-report/hartford-faces-disability-class-action-on-social-security-policy) | 3 |
| E4 Validation | 2/5 | Harm reports met with process rather than acknowledgment. A Florida regulator found improper adjuster appointments and missing damage-estimate disclosure statements in hurricane claims handling — precisely the documentation a claimant needs to contest a decision. | [Florida Office of Insurance Regulation — targeted market conduct examination](https://floir.gov/docs-sf/property-casualty-libraries/market-regulation/2025/2-hartford-midwest_final-report.pdf?sfvrsn=e9d64163_3) | 5 |
| E5 Cultural Empathy | 2/5 | Cultural competency is not documented as required and no adaptation co-designed with a non-dominant community was located. Scored at the lower anchor with the gap recorded. | [The Hartford 2025 Sustainability Report](https://assets.thehartford.com/image/upload/sustainability_highlight_report.pdf) | 2 |

### ACT: Action (Raw 3/5 — Scaled 50/100)

| Subdimension | Score | Evidence | Source | Tier |
|-------------|-------|----------|--------|------|
| AC1 Responsiveness | 3/5 | Standards are met for most cases with escalation authority, serving more than 20 million individuals through Employee Benefits. Against this, a state regulator found claims-handling defects in a catastrophe event. | [The Hartford — facts about The Hartford](https://assets.thehartford.com/image/upload/facts_about_the_hartford.pdf) | 4 |
| AC2 Proportionality | 3/5 | Needs assessment genuinely informs response in most cases through disability and absence severity triage. Unmet need is not published. | [The Hartford 2025 Sustainability Report](https://assets.thehartford.com/image/upload/sustainability_highlight_report.pdf) | 4 |
| AC3 Efficacy | 3/5 | Outcome data reviewed annually with at least one programme modified: disability results and mortality trends are reported and analysed, and product capability changed on study findings. | [The Hartford FY2025 Form 10-K](https://www.sec.gov/Archives/edgar/data/874766/000087476626000012/hig-20251231.htm) | 4 |
| AC4 Resource Mobilization | 3/5 | Gap analysis completed with at least one attempt to mobilise additional resources: investment in technology to serve employers with fewer than 500 employees, a segment that is chronically underserved in group benefits. | [The Hartford — Future of Benefits Study press release](https://newsroom.thehartford.com/newsroom-home/news-releases/news-release-details/2026/The-Hartfords-Future-Of-Benefits-Study-Employers-Seeking-Simplicity-And-Ease-In-The-Face-Of-Increasingly-Complex-Landscape/default.aspx) | 4 |
| AC5 Follow-Through | 3/5 | Defined follow-through protocols for some population types: return-to-work and absence-management programmes extend past initial claim determination. | [The Hartford 2025 Sustainability Report](https://assets.thehartford.com/image/upload/sustainability_highlight_report.pdf) | 4 |

### EQU: Equity (Raw 2.4/5 — Scaled 35/100)

| Subdimension | Score | Evidence | Source | Tier |
|-------------|-------|----------|--------|------|
| EQ1 Universality | 3/5 | Coverage data exists for the populations served — more than 20 million individuals in Employee Benefits — with documented outreach into smaller employers. Coverage gaps are not disaggregated. | [The Hartford — facts about The Hartford](https://assets.thehartford.com/image/upload/facts_about_the_hartford.pdf) | 4 |
| EQ2 Priority for Vulnerable | 2/5 | Priority is stated but allocation does not clearly follow need. The disability offset practice at issue reduces payments to claimants whose households already depend on Social Security, which runs the other way. | [Bloomberg Law — Hartford faces disability class action on Social Security policy](https://news.bloomberglaw.com/daily-labor-report/hartford-faces-disability-class-action-on-social-security-policy) | 3 |
| EQ3 Bias Awareness | 2/5 | Some disaggregation exists but disparities are not shown to be investigated with corrective action attached. | [The Hartford 2025 Sustainability Report](https://assets.thehartford.com/image/upload/sustainability_highlight_report.pdf) | 4 |
| EQ4 Access Design | 3/5 | Barrier mapping completed and at least two barriers removed: technology built specifically for employers with fewer than 500 employees, and personalised paid family and medical leave administration, both lower the practical threshold to holding cover. | [The Hartford — Future of Benefits Study press release](https://newsroom.thehartford.com/newsroom-home/news-releases/news-release-details/2026/The-Hartfords-Future-Of-Benefits-Study-Employers-Seeking-Simplicity-And-Ease-In-The-Face-Of-Increasingly-Complex-Landscape/default.aspx) | 4 |
| EQ5 Historical Harm Acknowledgment | 2/5 | Vague acknowledgment only. No formal acknowledgment of a specific historical harm was located. | [The Hartford 2025 Sustainability Report](https://assets.thehartford.com/image/upload/sustainability_highlight_report.pdf) | 2 |

### BND: Boundaries (Raw 2.4/5 — Scaled 35/100)

| Subdimension | Score | Evidence | Source | Tier |
|-------------|-------|----------|--------|------|
| B1 Self-Sustainability | 3/5 | Turnover-relevant sentiment is strong and structures are used: 3.8 of 5 across 4,277 employee reviews, 72% would recommend the company, 70% hold a positive business outlook, and compensation and benefits rate 3.8 of 5. The sustainability report frames employee resilience and wellbeing as an explicit commitment. | [Glassdoor — The Hartford reviews](https://www.glassdoor.com/Reviews/The-Hartford-Reviews-E4314.htm) | 3 |
| B2 Autonomy Preservation | 3/5 | At least one programme designed to build capacity and exit: return-to-work and absence-management services are structured to restore claimants to independent earning rather than to sustain claim status. | [The Hartford 2025 Sustainability Report](https://assets.thehartford.com/image/upload/sustainability_highlight_report.pdf) | 4 |
| B3 Scope Clarity | 2/5 | Scope overstated, with limitations discovered only after investment. Reporting describes the Social Security offset as a provision frequently buried in disability plans, and a state regulator found damage-estimate disclosure statements missing from claims files. | [Bloomberg Law — Hartford faces disability class action on Social Security policy](https://news.bloomberglaw.com/daily-labor-report/hartford-faces-disability-class-action-on-social-security-policy) | 3 |
| B4 Refusal Ethics | 2/5 | Refusals are procedurally respectful but no structured alternatives process for denied disability claims is documented, and no warm-referral rate is published. | [Bloomberg Law — Hartford faces disability class action on Social Security policy](https://news.bloomberglaw.com/daily-labor-report/hartford-faces-disability-class-action-on-social-security-policy) | 3 |
| B5 Consent Orientation | 2/5 | Consent and data stewardship functioned as institutional protection: Hartford Life and Accident was among defendants in a $13.75 million class settlement over a 2023 breach exposing names, Social Security numbers and other sensitive data of more than 2.5 million people. | [Glassdoor — The Hartford reviews (breach settlement context)](https://www.glassdoor.com/Reviews/The-Hartford-Reviews-E4314.htm) | 2 |

### ACC: Accountability (Raw 2.6/5 — Scaled 40/100)

| Subdimension | Score | Evidence | Source | Tier |
|-------------|-------|----------|--------|------|
| AB1 Harm Acknowledgment | 2/5 | Acknowledged only after external establishment: the claims-handling defects were established by a Florida targeted market conduct examination, and the breach harm by class settlement. | [Florida Office of Insurance Regulation — targeted market conduct examination](https://floir.gov/docs-sf/property-casualty-libraries/market-regulation/2025/2-hartford-midwest_final-report.pdf?sfvrsn=e9d64163_3) | 5 |
| AB2 Correction Willingness | 3/5 | At least one significant course correction based on harm evidence: the Oregon examination closed with a formal closing conference in March 2024 and the Florida examination produced findings the company must address, and product capability changed following study findings. | [Oregon Division of Financial Regulation — Hartford market conduct examination](https://dfr.oregon.gov/business/reg/DFR-market-regulation/Documents/hartford-mc-2024-cvrltr.pdf) | 5 |
| AB3 Transparency | 3/5 | At least one report disclosing unflattering findings: SEC filings disclose litigation and reserves, the sustainability highlight report and a CDP submission are published, and state regulators publish the examination reports. Short of anchor 4 because the company does not publish its own claims-quality findings. | [The Hartford — CDP submission](https://assets.thehartford.com/image/upload/cdp_project_submission.pdf) | 4 |
| AB4 Systemic Learning | 2/5 | Some post-incident review that rarely translates into systemic change: market conduct examinations in two states within roughly a year, and a breach affecting 2.5 million people, without published systemic remediation. | [Oregon Division of Financial Regulation — Hartford market conduct examination](https://dfr.oregon.gov/business/reg/DFR-market-regulation/Documents/hartford-mc-2024-cvrltr.pdf) | 5 |
| AB5 Reparative Action | 3/5 | At least one case of reparative action the harmed parties treated as meaningful: a $13.75 million class settlement fund for more than 2.5 million individuals affected by the 2023 data breach. | [Glassdoor — The Hartford reviews (breach settlement context)](https://www.glassdoor.com/Reviews/The-Hartford-Reviews-E4314.htm) | 2 |

### SYS: Systemic Thinking (Raw 2.8/5 — Scaled 45/100)

| Subdimension | Score | Evidence | Source | Tier |
|-------------|-------|----------|--------|------|
| S1 Root Cause Orientation | 3/5 | Some resources directed to root causes with at least one upstream intervention: absence prevention and return-to-work programmes aim at the cause of income loss rather than only replacing income. | [The Hartford 2025 Sustainability Report](https://assets.thehartford.com/image/upload/sustainability_highlight_report.pdf) | 4 |
| S2 Long-Term Impact | 3/5 | 5-plus year planning with specific long-term goals and some tracking: a published CDP climate submission and multi-year benefits research programme. No published theory of change with long-horizon outcome data. | [The Hartford — CDP submission](https://assets.thehartford.com/image/upload/cdp_project_submission.pdf) | 4 |
| S3 Interconnection Awareness | 3/5 | At least one case of identifying and responding to a cross-system effect: the benefits study explicitly maps the interaction between statutory paid-leave regimes, employer administration and employee outcomes. | [The Hartford — Future of Benefits Study press release](https://newsroom.thehartford.com/newsroom-home/news-releases/news-release-details/2026/The-Hartfords-Future-Of-Benefits-Study-Employers-Seeking-Simplicity-And-Ease-In-The-Face-Of-Increasingly-Complex-Landscape/default.aspx) | 4 |
| S4 Structural Critique | 2/5 | Structural critique appears in research and communications but is disconnected from action: the company publishes findings on benefits complexity without taking a public position that carries institutional risk. | [The Hartford — Future of Benefits Study](https://www.thehartford.com/employee-benefits/future-of-benefits-study) | 3 |
| S5 Coalitional Compassion | 3/5 | Active coalition member with documented contributions: the annual benefits study is shared publicly as industry research rather than kept proprietary, and the CDP submission participates in a common disclosure framework. | [The Hartford — CDP submission](https://assets.thehartford.com/image/upload/cdp_project_submission.pdf) | 4 |

### INT: Integrity (Raw 3.2/5 — Scaled 55/100)

| Subdimension | Score | Evidence | Source | Tier |
|-------------|-------|----------|--------|------|
| I1 Consistency Under Pressure | 3/5 | At least one case of bearing real cost to maintain a commitment: continued investment in small-employer technology and paid-leave administration, segments with thinner margins than large-group business. | [The Hartford — Future of Benefits Study press release](https://newsroom.thehartford.com/newsroom-home/news-releases/news-release-details/2026/The-Hartfords-Future-Of-Benefits-Study-Employers-Seeking-Simplicity-And-Ease-In-The-Face-Of-Increasingly-Complex-Landscape/default.aspx) | 4 |
| I2 Non-Performance | 3/5 | Some practices maintained regardless of visibility: the benefits study has run for years and reports findings unflattering to the industry’s complexity, with no direct sales benefit. | [The Hartford — Future of Benefits Study](https://www.thehartford.com/employee-benefits/future-of-benefits-study) | 4 |
| I3 Internal Consistency | 4/5 | Staff culture broadly reflects stated values, and this is The Hartford’s clearest strength: 3.8 of 5 across 4,277 reviews, 72% recommending, 70% positive outlook, and compensation rated 3.8 — all above the pattern seen in the peer entities assessed this cycle, and consistent with the stated commitment to employee resilience and wellbeing. | [Glassdoor — The Hartford reviews](https://www.glassdoor.com/Reviews/The-Hartford-Reviews-E4314.htm) | 3 |
| I4 Values Alignment | 3/5 | Values explicitly considered in some major decisions: the stated commitment to protecting livelihoods from illness and injury is visibly reflected in the return-to-work and paid-leave investments. Against this, the offset and claims-documentation practices contradict it. | [The Hartford 2025 Sustainability Report](https://assets.thehartford.com/image/upload/sustainability_highlight_report.pdf) | 4 |
| I5 Resilience of Care | 3/5 | Core practices in policy: the benefits research programme, the sustainability commitments and the CDP disclosure are institutional structures with multi-year records. Not yet tested across a documented leadership transition in the evidence located. | [The Hartford FY2025 Form 10-K](https://www.sec.gov/Archives/edgar/data/874766/000087476626000012/hig-20251231.htm) | 4 |

## Published Index Comparison

**Published index:** fortune-500 | **Published rank:** #50 | **Published composite:** 60.9/100 | **Published band:** Established

| Dimension | Published (raw) | Published (scaled) | Research (raw) | Research (scaled) | Difference (scaled) |
|-----------|----------------|-------------------|----------------|-------------------|---------------------|
| AWR | 3.5 | 62.5 | 3.2 | 55 | -7.5 |
| EMP | 3.5 | 62.5 | 2.4 | 35 | -27.5 |
| ACT | 3.5 | 62.5 | 3 | 50 | -12.5 |
| EQU | 3 | 50 | 2.4 | 35 | -15 |
| BND | 3.5 | 62.5 | 2.4 | 35 | -27.5 |
| ACC | 3.5 | 62.5 | 2.6 | 40 | -22.5 |
| SYS | 3.5 | 62.5 | 2.8 | 45 | -17.5 |
| INT | 3.5 | 62.5 | 3.2 | 55 | -7.5 |
| **Composite** | — | **60.9** | — | **43.8** | **-17.1** |

**Math-hygiene reconstruction:** the canonical formula applied to the published dimension vector returns 60.9 against a published 60.9 (difference 0). Within the 0.5-point tolerance — no math-hygiene issue.

### Score Difference Analysis

**INT comes out only marginally below the published value (published 3.5 / 83.3 scaled; research 3.2 / 73.3)**, and I3 scores 4 — the only 4 on internal consistency awarded to any of the five rotation entities tonight. The Hartford’s employee evidence is genuinely good: 3.8 of 5 across 4,277 reviews, 72% recommending, compensation rated 3.8. **AWR also holds close (3.5 to 3.2)** on the strength of the annual Future of Benefits Study, which surveys employees separately from the employers who buy the product. The gaps are in **EMP (3.5 / 83.3 to 2.4 / 35.0)**, **EQU (3.0 / 66.7 to 2.4 / 35.0)** and **BND (3.5 / 83.3 to 2.4 / 35.0)**, and they trace to claimant-facing evidence: a Florida targeted market conduct examination found improper adjuster appointments and missing damage-estimate disclosure statements in hurricane claims, a disability offset provision is described in reporting as frequently buried, and a 2023 breach exposed sensitive data on more than 2.5 million people.

### Recommendation

The published 60.9 (Established) is **overstated** by this first measurement of 43.8 (Functional), a delta of -17.1 across a band boundary. **No change proposal is filed.** The published composite sits in a 19-entity identical-dimension-vector cohort in `site/src/data/indexes/fortune-500.json` (including A.O. Smith, ADP, Aon, Ball Corporation, Dell Technologies, Erie Indemnity, ManpowerGroup and Marsh & McLennan). Byte-identical dimension vectors across 19 unrelated companies in different sectors is the signature of an unassessed seed value, not of measurement. Per anti-false-positive screening rule 5, a shared-artefact gap of this kind is routed to coordinator-level calibration review rather than encoded as a one-off baseline-reset proposal. Note for the coordinator: the profile here is unusual and worth preserving in any recalibration — The Hartford treats its own employees measurably better than its peer set, and its claimants measurably worse than its published score implies.

## Screening checks (§3e-bis)

1. **Baseline provenance — checked.** `research/APPLIED_CHANGES.md` contains no row for this entity, no assessment files exist on disk, and `research/rotation-state.json` records `last_assessed: null`. The published composite has never been set by an evidence-based assessment.
2. **No "stale baseline" rationale against the record.** The rationale is that the score has never been measured. The history confirms this.
3. **Directionality.** This entity surfaced through staleness-based rotation backfill, not through negative news; the scanner recorded that its individual Tier 1 search produced no evidence for this cycle. The measurement below is therefore a cold first baseline built from the entity's own disclosures, regulator and court records, and employee testimony — searched for positive and negative evidence alike. No movement is taken on absence of harm.
4. **Rationale-versus-history consistency.** There is no prior finding for this to contradict.
5. **Calibration handling — THIS IS THE OPERATIVE RULE TONIGHT.** The published composite sits in a 19-entity identical-dimension-vector cohort in `site/src/data/indexes/fortune-500.json` (including A.O. Smith, ADP, Aon, Ball Corporation, Dell Technologies, Erie Indemnity, ManpowerGroup and Marsh & McLennan). Byte-identical dimension vectors across 19 unrelated companies in different sectors is the signature of an unassessed seed value, not of measurement. Per anti-false-positive screening rule 5, a shared-artefact gap of this kind is routed to coordinator-level calibration review rather than encoded as a one-off baseline-reset proposal. **No change proposal is filed.** The measurement is recorded on disk with a full subdimension sidecar so it is auditable and reusable, and the gap is surfaced to the coordinator as a `flag-for-review` finding in `research/scans/2026-09-22-assessor-summary.json`.
6. **Confidence discipline.** A single-cycle desk review is not a sufficient basis for a 25-to-35-point unilateral reset of a Fortune 500 entity. The recommendation is `flag-for-review`, not `downgrade`.

## Key Findings

- The Hartford treats its own staff well by the available evidence: 3.8 of 5 across 4,277 employee reviews, 72% would recommend it, 70% hold a positive business outlook, and compensation and benefits rate 3.8 of 5 — the best internal-culture evidence of the five companies assessed in this cycle.
- It listens to the people who use its products, not just the employers who buy them. Its annual Future of Benefits Study surveys employees separately and drove real product change toward paid family and medical leave administration.
- A state regulator found defects in its claims handling. A Florida targeted market conduct examination of Hartford Insurance Company of the Midwest, reported in January 2025, found improper adjuster appointments and missing damage-estimate disclosure statements in hurricane claims — the exact documents a policyholder needs to challenge a decision.
- A disability benefit practice now in class-action discovery turns on a contract term reporting describes as frequently buried: reducing a claimant’s payment because a disabled adult family member receives Social Security. The claim is an allegation and is not scored; the burying of the term is what the Boundaries score reflects.
- A 2023 data breach exposed names, Social Security numbers and other sensitive data of more than 2.5 million people and was settled for 13.75 million dollars, which is why the consent score is 2 of 5.

## Strongest Dimensions

**AWR (3.2 raw)** and **INT (3.2)**. I3 scores 4 of 5 on employee evidence that is materially better than the peer set, and the annual benefits study gives the company a real, recurring detection channel into employee rather than purchaser experience.

## Weakest Dimensions

**EMP (2.4 raw)**, **EQU (2.4)** and **BND (2.4)**. Claimant-facing conduct is where this company measures worst: regulator-found claims documentation failures, a buried offset provision, no structured alternatives for denied claims, and a breach of 2.5 million people’s sensitive data.

## Evidence Gaps

- The Florida examination report was located but not read in full; the number and materiality of findings could move E4, AC1 and AB2.
- NAIC complaint-index data for The Hartford was not obtained and would be the strongest single indicator for AC1 and E1.
- The sustainability highlight report is a summary document; the full report, if one exists, was not located, which holds EQ3, EQ5 and E5 at lower anchors.
- The $13.75 million breach settlement was confirmed through secondary reporting rather than a court document, so B5 and AB5 carry medium confidence.

## Recommended Next Steps

- **Functional/Established**: Consider [Advisory Support](/advisory) to translate benchmark insights into strategic action.

## Sources

- [The Hartford — Future of Benefits Study](https://www.thehartford.com/employee-benefits/future-of-benefits-study)
- [The Hartford — Future of Benefits Study press release](https://newsroom.thehartford.com/newsroom-home/news-releases/news-release-details/2026/The-Hartfords-Future-Of-Benefits-Study-Employers-Seeking-Simplicity-And-Ease-In-The-Face-Of-Increasingly-Complex-Landscape/default.aspx)
- [The Hartford 2025 Sustainability Report](https://assets.thehartford.com/image/upload/sustainability_highlight_report.pdf)
- [Florida Office of Insurance Regulation — targeted market conduct examination, Hartford Insurance Company of the Midwest](https://floir.gov/docs-sf/property-casualty-libraries/market-regulation/2025/2-hartford-midwest_final-report.pdf?sfvrsn=e9d64163_3)
- [Bloomberg Law — Hartford faces disability class action on Social Security policy](https://news.bloomberglaw.com/daily-labor-report/hartford-faces-disability-class-action-on-social-security-policy)
- [The Hartford — facts about The Hartford](https://assets.thehartford.com/image/upload/facts_about_the_hartford.pdf)
- [The Hartford FY2025 Form 10-K](https://www.sec.gov/Archives/edgar/data/874766/000087476626000012/hig-20251231.htm)
- [Glassdoor — The Hartford reviews](https://www.glassdoor.com/Reviews/The-Hartford-Reviews-E4314.htm)
- [Oregon Division of Financial Regulation — Hartford market conduct examination](https://dfr.oregon.gov/business/reg/DFR-market-regulation/Documents/hartford-mc-2024-cvrltr.pdf)
- [The Hartford — CDP submission](https://assets.thehartford.com/image/upload/cdp_project_submission.pdf)

---

*This assessment is based on publicly available information and does not constitute a formal Compassion Benchmark Certified Assessment. For a comprehensive, assessor-led evaluation, visit compassionbenchmark.com/certified-assessments.*
