---
entity: "Abbott Laboratories"
type: "Company"
sector: "Healthcare (Medical Devices / Pharmaceuticals / Nutrition)"
date: "2026-09-15"
composite_score: 50
band: "Functional"
scores:
  AWR: 3.2
  EMP: 2.8
  ACT: 3.4
  EQU: 2.8
  BND: 2.8
  ACC: 2.6
  SYS: 3.6
  INT: 2.8
published_index: "fortune-500"
published_rank: 60
published_composite: 57.8
published_band: "functional"
published_dimensions:
  AWR: 3.5
  EMP: 3.3
  ACT: 3.5
  EQU: 3
  BND: 3.3
  ACC: 3
  SYS: 3.8
  INT: 3.3
assessed_composite: 50
score_delta: -7.8
band_change: false
filing_trigger_met: true
outcome: "measured-not-filed"
recommendation: "downgrade"
change_proposal: false
confidence: "medium"
subdim_sidecar: true
watch_flag: "Sturgis False Claims Act allegations (testing avoidance, FDA non-disclosure). Any admission, FDA finding or consent-decree violation would support moving AB3 and AB1 below the pending proposal's values."
calibration_flag: null
source: "priority"
scan_file: "research/scans/2026-09-15.json"
integration_premium: 0
published_formula_reconstruction: 58.4
math_hygiene_reconstruction_diff: 0.6
assessor_override_registered: true
evidence_density: { moved: 0, held_with_evidence: 4, held_no_evidence: 36 }
base_sidecar: "research/assessments/abbott-laboratories-2026-08-26.subdims.json"
---

# Compassion Benchmark Assessment: Abbott Laboratories

**Entity type:** Company  
**Sector/Domain:** Healthcare (Medical Devices / Pharmaceuticals / Nutrition)  
**Assessment date:** 2026-09-15  
**Composite score:** 50/100  
**Band:** Functional  
**Cycle:** nightly, lookback 2026-09-01 to 2026-09-15 (scan `research/scans/2026-09-15.json`, source: priority)  
**Outcome:** measured-not-filed (recommendation: downgrade)

## Why this entity was assessed

The scanner flagged Abbott (priority 60) on its 14 September 2026 agreement to pay nearly $385 million over the Sturgis infant-formula plant. Abbott has a PENDING change proposal from 2026-08-26 (57.8 to 50.0, downgrade).

## Evidence-date, provenance, attribution and screening checks

**PENDING PROPOSAL / BASELINE DRIFT.** `research/change-proposals/abbott-laboratories-2026-08-26.json` is pending (status 'pending', no decision). Its published baseline (57.8, rank 60, identical dimensions) matches today's index, so drift is 0.0. This cycle starts from that proposal's sidecar and makes NO new moves. The in-window settlement resolves allegations without admitted liability. The measurement (50.0) therefore reproduces the pending proposal exactly. Per the Spain 2026-09-14 precedent, NO duplicate proposal is filed and the existing file is untouched. Outcome: measured-not-filed.

**OVERRIDE.** Abbott is in the registered ASSESSOR_OVERRIDE_NAMES set. Published 57.8 vs formula 58.4 (0.6), which validate-indexes reports as a warning. Not a math-hygiene issue.

**SCAN SOURCE CHECK.** The scan's DOJ district URL (`usao-wdmi`) returned an empty page. The DOJ Office of Public Affairs release of the same date was fetched and used instead. The amount (nearly $385M), components and 'no determination of liability' are verified. The Baltimore Sun was not fetched.

**ALLEGATION VS FINDING.** The DOJ release sets out government contentions about roof leaks, dryer cleaning, testing avoidance and FDA non-disclosure. All are allegations. None is scored as a finding.

**DIRECTIONALITY.** Negative evidence. No upward move. Measured equals pending.

## Corrections to the scan and to prior cycles (append-only)

- Scan: 'DOJ, whistleblower, and multistate allegations'. Verified: federal FCA $348.7M including a $69M relator share; states $36.3M; total $384,999,040.

## Score Summary

| Dimension | Code | Raw (1-5) | Scaled (0-100) | Published raw | Delta (raw) | Band |
|---|---|---|---|---|---|---|
| Awareness | AWR | 3.2 | 55 | 3.5 | -0.3 | Functional |
| Empathy | EMP | 2.8 | 45 | 3.3 | -0.5 | Functional |
| Action | ACT | 3.4 | 60 | 3.5 | -0.1 | Functional |
| Equity | EQU | 2.8 | 45 | 3 | -0.2 | Functional |
| Boundaries | BND | 2.8 | 45 | 3.3 | -0.5 | Functional |
| Accountability | ACC | 2.6 | 40 | 3 | -0.4 | Developing |
| Systemic Thinking | SYS | 3.6 | 65 | 3.8 | -0.2 | Established |
| Integrity | INT | 2.8 | 45 | 3.3 | -0.5 | Functional |
| **Composite** | — | — | **50** | **57.8** | **-7.8** | **Functional** |

Composite computed with `computeCompositeFromDimensions` (site/scripts/lib/scoring.mjs, strict 8-dimension check). Integration premium: 0. Canonical reconstruction of the published dimensions: 58.4 (published 57.8; diff 0.6). The entity is in the registered ASSESSOR_OVERRIDE_NAMES set in validate-indexes.mjs, so the reconstruction gap is a registered override, not a math-hygiene error.

## Dimension Details

### AWR: Awareness (Raw 3.2; Score: 55/100)

| Subdimension | Score | Base | Evidence and anchor match | Source |
|---|---|---|---|---|
| A1 Suffering Detection | 4/5 | 4 | Carried forward from the 2026-08-26 assessment; no new in-window evidence for this subdimension. | [T5, 2022-05-16](https://www.justice.gov/Usao-wdmi/pr/2022_0516_Abbott) |
| A2 Contextual Sensitivity | 3/5 | 3 | Carried forward from the 2026-08-26 assessment; no new in-window evidence for this subdimension. | [T2, 2026-08-21](https://www.claimsjournal.com/news/national/2026/08/21/339713.htm) |
| A3 Blind Spot Mitigation | 3/5 | 3 | Carried forward from the 2026-08-26 assessment; no new in-window evidence for this subdimension. | [T5, 2022-05-26](https://www.fda.gov/media/158736/download) |
| A4 Signal Amplification | 3/5 | 3 | Carried forward from the 2026-08-26 assessment; no new in-window evidence for this subdimension. | [T2, 2026-08-21](https://qz.com/abbott-670-million-settlement-preterm-baby-formula-lawsuits-082126) |
| A5 Anticipatory Awareness | 3/5 | 3 | Held at 3. The government alleges that dryer cleaning cycles were lengthened to raise output and that roof leaks were patched temporarily. These are allegations about pre-2023 conduct and are not scored as findings. | [T5, 2026-09-14](https://www.justice.gov/opa/pr/abbott-agrees-pay-over-384m-settle-allegations-related-contaminated-infant-formula) |

### EMP: Empathy (Raw 2.8; Score: 45/100)

| Subdimension | Score | Base | Evidence and anchor match | Source |
|---|---|---|---|---|
| E1 Affective Resonance | 3/5 | 3 | Carried forward from the 2026-08-26 assessment; no new in-window evidence for this subdimension. | [T2, 2026-08-21](https://qz.com/abbott-670-million-settlement-preterm-baby-formula-lawsuits-082126) |
| E2 Perspective-Taking | 3/5 | 3 | Carried forward from the 2026-08-26 assessment; no new in-window evidence for this subdimension. | [T2, 2026-08-20](https://www.bloomberg.com/news/articles/2026-08-20/abbott-will-pay-670-million-to-end-2-000-infant-formula-claims) |
| E3 Non-Judgment | 3/5 | 3 | Carried forward from the 2026-08-26 assessment; no new in-window evidence for this subdimension. | [T2, 2026-08-21](https://www.claimsjournal.com/news/national/2026/08/21/339713.htm) |
| E4 Validation | 2/5 | 2 | Carried forward from the 2026-08-26 assessment; no new in-window evidence for this subdimension. | [T2, 2026-08-21](https://www.claimsjournal.com/news/national/2026/08/21/339713.htm) |
| E5 Cultural Empathy | 3/5 | 3 | Carried forward from the 2026-08-26 assessment; no new in-window evidence for this subdimension. | [T2, 2026-08-21](https://qz.com/abbott-670-million-settlement-preterm-baby-formula-lawsuits-082126) |

### ACT: Action (Raw 3.4; Score: 60/100)

| Subdimension | Score | Base | Evidence and anchor match | Source |
|---|---|---|---|---|
| AC1 Responsiveness | 4/5 | 4 | Carried forward from the 2026-08-26 assessment; no new in-window evidence for this subdimension. | [T5, 2022-05-16](https://www.justice.gov/Usao-wdmi/pr/2022_0516_Abbott) |
| AC2 Proportionality | 3/5 | 3 | Carried forward from the 2026-08-26 assessment; no new in-window evidence for this subdimension. | [T2, 2026-08-20](https://www.bloomberg.com/news/articles/2026-08-20/abbott-will-pay-670-million-to-end-2-000-infant-formula-claims) |
| AC3 Efficacy | 3/5 | 3 | Carried forward from the 2026-08-26 assessment; no new in-window evidence for this subdimension. | [T5, 2022-05-26](https://www.fda.gov/media/158736/download) |
| AC4 Resource Mobilization | 4/5 | 4 | Carried forward from the 2026-08-26 assessment; no new in-window evidence for this subdimension. | [T2, 2026-08-20](https://www.bloomberg.com/news/articles/2026-08-20/abbott-will-pay-670-million-to-end-2-000-infant-formula-claims) |
| AC5 Follow-Through | 3/5 | 3 | Carried forward from the 2026-08-26 assessment; no new in-window evidence for this subdimension. | [T2, 2026-08-21](https://qz.com/abbott-670-million-settlement-preterm-baby-formula-lawsuits-082126) |

### EQU: Equity (Raw 2.8; Score: 45/100)

| Subdimension | Score | Base | Evidence and anchor match | Source |
|---|---|---|---|---|
| EQ1 Universality | 3/5 | 3 | Carried forward from the 2026-08-26 assessment; no new in-window evidence for this subdimension. | [T2, 2026-08-21](https://qz.com/abbott-670-million-settlement-preterm-baby-formula-lawsuits-082126) |
| EQ2 Priority for Vulnerable | 3/5 | 3 | Carried forward from the 2026-08-26 assessment; no new in-window evidence for this subdimension. | [T2, 2026-08-21](https://www.claimsjournal.com/news/national/2026/08/21/339713.htm) |
| EQ3 Bias Awareness | 3/5 | 3 | Carried forward from the 2026-08-26 assessment; no new in-window evidence for this subdimension. | [T2, 2026-08-20](https://www.bloomberg.com/news/articles/2026-08-20/abbott-will-pay-670-million-to-end-2-000-infant-formula-claims) |
| EQ4 Access Design | 3/5 | 3 | Carried forward from the 2026-08-26 assessment; no new in-window evidence for this subdimension. | [T2, 2026-08-21](https://qz.com/abbott-670-million-settlement-preterm-baby-formula-lawsuits-082126) |
| EQ5 Historical Harm Acknowledgment | 2/5 | 2 | Carried forward from the 2026-08-26 assessment; no new in-window evidence for this subdimension. | [T2, 2026-08-21](https://www.claimsjournal.com/news/national/2026/08/21/339713.htm) |

### BND: Boundaries (Raw 2.8; Score: 45/100)

| Subdimension | Score | Base | Evidence and anchor match | Source |
|---|---|---|---|---|
| B1 Self-Sustainability | 3/5 | 3 | Carried forward from the 2026-08-26 assessment; no new in-window evidence for this subdimension. | [T2, 2026-08-21](https://qz.com/abbott-670-million-settlement-preterm-baby-formula-lawsuits-082126) |
| B2 Autonomy Preservation | 3/5 | 3 | Carried forward from the 2026-08-26 assessment; no new in-window evidence for this subdimension. | [T2, 2026-08-20](https://www.bloomberg.com/news/articles/2026-08-20/abbott-will-pay-670-million-to-end-2-000-infant-formula-claims) |
| B3 Scope Clarity | 3/5 | 3 | Carried forward from the 2026-08-26 assessment; no new in-window evidence for this subdimension. | [T2, 2026-08-21](https://www.claimsjournal.com/news/national/2026/08/21/339713.htm) |
| B4 Refusal Ethics | 3/5 | 3 | Carried forward from the 2026-08-26 assessment; no new in-window evidence for this subdimension. | [T2, 2026-08-21](https://qz.com/abbott-670-million-settlement-preterm-baby-formula-lawsuits-082126) |
| B5 Consent Orientation | 2/5 | 2 | Carried forward from the 2026-08-26 assessment; no new in-window evidence for this subdimension. | [T2, 2026-04-10](https://chicago.suntimes.com/2026/04/10/abbott-laboratories-to-pay-70m-in-damages-infant-formula-lawsuits) |

### ACC: Accountability (Raw 2.6; Score: 40/100)

| Subdimension | Score | Base | Evidence and anchor match | Source |
|---|---|---|---|---|
| AB1 Harm Acknowledgment | 2/5 | 2 | Held at 2. On 14 September 2026 Abbott agreed to pay $384,999,040 to resolve False Claims Act and state claims tied to the Sturgis, Michigan infant-formula plant (2018-2022). The DOJ release states the claims are allegations only, with no determination of liability. Abbott again made no admission, so anchor 2 holds. | [T5, 2026-09-14](https://www.justice.gov/opa/pr/abbott-agrees-pay-over-384m-settle-allegations-related-contaminated-infant-formula) |
| AB2 Correction Willingness | 3/5 | 3 | Carried forward from the 2026-08-26 assessment; no new in-window evidence for this subdimension. | [T2, 2026-08-21](https://www.claimsjournal.com/news/national/2026/08/21/339713.htm) |
| AB3 Transparency | 3/5 | 3 | Held at 3. The government alleges Abbott deliberately avoided testing for bacterial growth and did not disclose certain contamination results to the FDA in 2019 and 2022. These are ALLEGATIONS, not findings, so AB3 is not moved. They go directly to transparency; watch. | [T5, 2026-09-14](https://www.justice.gov/opa/pr/abbott-agrees-pay-over-384m-settle-allegations-related-contaminated-infant-formula) |
| AB4 Systemic Learning | 3/5 | 3 | Carried forward from the 2026-08-26 assessment; no new in-window evidence for this subdimension. | [T5, 2022-05-26](https://www.fda.gov/media/158736/download) |
| AB5 Reparative Action | 2/5 | 2 | Held at 2. The settlement pays the United States ($348.7M), state Medicaid and WIC programmes ($36.3M), and includes a $69M whistleblower share. It is not repair to affected families; the separate NEC settlement (20 Aug) was scored on 2026-08-26. | [T5, 2026-09-14](https://www.justice.gov/opa/pr/abbott-agrees-pay-over-384m-settle-allegations-related-contaminated-infant-formula) |

### SYS: Systemic Thinking (Raw 3.6; Score: 65/100)

| Subdimension | Score | Base | Evidence and anchor match | Source |
|---|---|---|---|---|
| S1 Root Cause Orientation | 4/5 | 4 | Carried forward from the 2026-08-26 assessment; no new in-window evidence for this subdimension. | [T5, 2022-05-26](https://www.fda.gov/media/158736/download) |
| S2 Long-Term Impact | 4/5 | 4 | Carried forward from the 2026-08-26 assessment; no new in-window evidence for this subdimension. | [T5, 2022-05-16](https://www.justice.gov/Usao-wdmi/pr/2022_0516_Abbott) |
| S3 Interconnection Awareness | 3/5 | 3 | Carried forward from the 2026-08-26 assessment; no new in-window evidence for this subdimension. | [T2, 2026-08-20](https://www.bloomberg.com/news/articles/2026-08-20/abbott-will-pay-670-million-to-end-2-000-infant-formula-claims) |
| S4 Structural Critique | 3/5 | 3 | Carried forward from the 2026-08-26 assessment; no new in-window evidence for this subdimension. | [T2, 2026-08-21](https://qz.com/abbott-670-million-settlement-preterm-baby-formula-lawsuits-082126) |
| S5 Coalitional Compassion | 4/5 | 4 | Carried forward from the 2026-08-26 assessment; no new in-window evidence for this subdimension. | [T5, 2022-05-26](https://www.fda.gov/media/158736/download) |

### INT: Integrity (Raw 2.8; Score: 45/100)

| Subdimension | Score | Base | Evidence and anchor match | Source |
|---|---|---|---|---|
| I1 Consistency Under Pressure | 3/5 | 3 | Carried forward from the 2026-08-26 assessment; no new in-window evidence for this subdimension. | [T2, 2026-08-21](https://www.claimsjournal.com/news/national/2026/08/21/339713.htm) |
| I2 Non-Performance | 3/5 | 3 | Carried forward from the 2026-08-26 assessment; no new in-window evidence for this subdimension. | [T2, 2026-08-21](https://qz.com/abbott-670-million-settlement-preterm-baby-formula-lawsuits-082126) |
| I3 Internal Consistency | 3/5 | 3 | Carried forward from the 2026-08-26 assessment; no new in-window evidence for this subdimension. | [T2, 2026-08-20](https://www.bloomberg.com/news/articles/2026-08-20/abbott-will-pay-670-million-to-end-2-000-infant-formula-claims) |
| I4 Values Alignment | 2/5 | 2 | Carried forward from the 2026-08-26 assessment; no new in-window evidence for this subdimension. | [T2, 2026-08-21](https://www.claimsjournal.com/news/national/2026/08/21/339713.htm) |
| I5 Resilience of Care | 3/5 | 3 | Carried forward from the 2026-08-26 assessment; no new in-window evidence for this subdimension. | [T5, 2022-05-16](https://www.justice.gov/Usao-wdmi/pr/2022_0516_Abbott) |

## Published Index Comparison

**Published index:** fortune-500 | **Published rank:** #60 of 447 | **Published composite:** 57.8/100 | **Published band:** functional

| Dimension | Published (raw) | Published (scaled) | Research (raw) | Research (scaled) | Difference (scaled) | Explanation |
|---|---|---|---|---|---|---|
| AWR | 3.5 | 62.5 | 3.2 | 55 | -7.5 | Integer-grid rounding of the published value; no evidence-based move |
| EMP | 3.3 | 57.5 | 2.8 | 45 | -12.5 | Integer-grid rounding of the published value; no evidence-based move |
| ACT | 3.5 | 62.5 | 3.4 | 60 | -2.5 | Integer-grid rounding of the published value; no evidence-based move |
| EQU | 3 | 50 | 2.8 | 45 | -5 | Integer-grid rounding of the published value; no evidence-based move |
| BND | 3.3 | 57.5 | 2.8 | 45 | -12.5 | Integer-grid rounding of the published value; no evidence-based move |
| ACC | 3 | 50 | 2.6 | 40 | -10 | Integer-grid rounding of the published value; no evidence-based move |
| SYS | 3.8 | 70 | 3.6 | 65 | -5 | Integer-grid rounding of the published value; no evidence-based move |
| INT | 3.3 | 57.5 | 2.8 | 45 | -12.5 | Integer-grid rounding of the published value; no evidence-based move |
| **Composite** | — | **57.8** | — | **50** | **-7.8** | — |

### Score Difference Analysis

Identical to the pending 2026-08-26 proposal (50.0): AB1 2, AB2 3, AB3 3, AB4 3, AB5 2, and so on. The new settlement adds tier-5 detail on allegations that bear on Accountability. Because it resolves them without liability, it does not move any subdimension.

### Recommendation

No new proposal. The pending 2026-08-26 downgrade (57.8 to 50.0) remains the vehicle and is corroborated by today's independent measurement. Reviewer note: the 14 September DOJ settlement is new tier-5 context for that proposal, and it strengthens the case without changing the numbers.

## Key Findings

- Why it matters: Abbott paid nearly $385 million but admitted nothing. On 14 September 2026 Abbott agreed to pay $384,999,040 over its Sturgis, Michigan baby-formula plant. The Justice Department says the claims are allegations with 'no determination of liability'.
- Why it matters: the allegations concern hiding contamination. The government alleges Abbott avoided testing for bacteria to prevent positive results and withheld some results from the FDA in 2019 and 2022.
- Why it matters: today's check matches the pending downgrade. An independent measurement gives 50.0, the same as the 26 August proposal, so no second proposal is filed.

## Strongest Dimensions

- Systemic Thinking (SYS) at raw 3.6.
- Action (ACT) at raw 3.4.


## Weakest Dimensions

- Accountability (ACC) at raw 2.6.
- Integrity (INT) at raw 2.8.


## Evidence Gaps

- Settlement agreement text not read; whether it includes compliance obligations beyond the existing FDA consent decree is unknown.
- Abbott's public statement on the settlement not fetched.

## Recommended Next Steps

- Consider [Advisory Support](/advisory) to translate benchmark insights into strategic action.

## Sources

- [https://www.justice.gov/opa/pr/abbott-agrees-pay-over-384m-settle-allegations-related-contaminated-infant-formula](https://www.justice.gov/opa/pr/abbott-agrees-pay-over-384m-settle-allegations-related-contaminated-infant-formula) (tier 5, 2026-09-14)
- [DOJ W.D. Mich. release (scan source; page returned empty)](https://www.justice.gov/usao-wdmi/pr/2026_0914_Abbott_Settlement_PR) (tier 5, 2026-09-14, empty on fetch)
- [Pending proposal](research/change-proposals/abbott-laboratories-2026-08-26.json) (status pending)

---

This assessment is based on publicly available information and does not constitute a formal Compassion Benchmark Certified Assessment. For a comprehensive, assessor-led evaluation, visit compassionbenchmark.com/certified-assessments.
