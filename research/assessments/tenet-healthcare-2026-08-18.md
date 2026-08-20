---
entity: "Tenet Healthcare"
type: "Company"
sector: "Healthcare"
date: "2026-08-18"
composite_score: 31.9
band: "Developing"
scores:
  AWR: 2.4
  EMP: 2
  ACT: 3
  EQU: 2
  BND: 2.4
  ACC: 2
  SYS: 2.4
  INT: 2
published_index: "fortune-500"
published_rank: 185
published_composite: 37.5
published_band: "Developing"
assessment_type: "first full assessment"
recommendation: "flag-for-review"
confidence: "low"
change_proposal: true
score_delta: -5.6
band_change: false
source: "rotation"
scan_file: "research/scans/2026-08-18.json"
watch_flag: "evidence recency gap — several findings predate 2025; re-test when a 2026 ESG report is published"
---

# Compassion Benchmark Assessment: Tenet Healthcare

**Entity type:** Company
**Sector/Domain:** Healthcare
**Assessment date:** 2026-08-18
**Composite score:** 31.9/100
**Band:** Developing
**Cycle source:** rotation (scan `research/scans/2026-08-18.json`)

## Why this entity was assessed

Tenet Healthcare entered this cycle on rotation. The scanner searched it individually and found no compassion-relevant evidence in the 14-day window, recommending reassessment on staleness grounds alone (`last_assessed: null`). This is a first full assessment.

## Evidence-date and attribution checks

**Baseline provenance — checked.** Tenet's published vector {2.5, 2.5, 3, 2, 2.5, 2.5, 2.5, 2.5} is shared with one other company (Albemarle) rather than with a 22-company cluster, so it is treated as a genuinely differentiated baseline rather than a seed placeholder, consistent with the cycle brief. There is no Tenet entry in `research/APPLIED_CHANGES.md` and no prior assessment file.

**Evidence recency — recorded honestly and reflected in the confidence rating.** Several findings are older than the preferred two-to-three-year horizon: the $513 million Department of Justice settlement dates to 2016 and the St. Vincent nurses' suit to 2024. The most recent published ESG progress report covers 2023-2024. Current-cycle evidence is limited to the FY2026 proxy, second-quarter 2026 results and the ACA subsidy forecast. **Confidence is set to low** for this reason.

**Attribution.** The board's 2025 decision to disband its ESG Committee, the response to the whistleblower allegations, and the California contract settlements are all Tenet's own conduct. The expiry of ACA subsidies is federal policy and is **not** scored against Tenet; what is scored is whether Tenet has published a plan to hold coverage in response, and it has not.

## Score Summary

| Dimension | Code | Raw (1-5) | Scaled (0-100) | Band |
|---|---|---|---|---|
| Awareness | AWR | 2.40 | 35 | Developing |
| Empathy | EMP | 2.00 | 25 | Developing |
| Action | ACT | 3.00 | 50 | Functional |
| Equity | EQU | 2.00 | 25 | Developing |
| Boundaries | BND | 2.40 | 35 | Developing |
| Accountability | ACC | 2.00 | 25 | Developing |
| Systemic Thinking | SYS | 2.40 | 35 | Developing |
| Integrity | INT | 2.00 | 25 | Developing |
| **Composite** | — | — | **31.9** | **Developing** |

Integration premium applied: 0. Composite computed with the canonical `computeCompositeFromDimensions` implementation in `site/scripts/lib/scoring.mjs`; it is not a simple mean of the eight dimensions.

## Dimension Details

### AWR: Awareness (Raw 2.40/5 — Scaled 35/100)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| A1 Suffering Detection | 3/5 | Hospital operators report standardised patient-experience measures, and Tenet publishes ESG progress data — proactive detection mechanisms applied inconsistently. | [Tenet Healthcare — 2023-2024 ESG Progress Report](https://s23.q4cdn.com/674051945/files/doc_financials/2024/q1/2023-2024-Tenet-ESG-Report-030525.pdf) — tier 4, 2025-03-05 |
| A2 Contextual Sensitivity | 3/5 | Provision is differentiated across acute hospitals, ambulatory surgery and outpatient settings serving distinct populations. | [Tenet Healthcare — 2023-2024 ESG Progress Report](https://s23.q4cdn.com/674051945/files/doc_financials/2024/q1/2023-2024-Tenet-ESG-Report-030525.pdf) — tier 4, 2025-03-05 |
| A3 Blind Spot Mitigation | 2/5 | No structured blind-spot process is published and no finding from one is disclosed. Absence of disclosure, scored at the low anchor. | [Tenet Healthcare — 2023-2024 ESG Progress Report](https://s23.q4cdn.com/674051945/files/doc_financials/2024/q1/2023-2024-Tenet-ESG-Report-030525.pdf) — tier 4, 2025-03-05 |
| A4 Signal Amplification | 2/5 | Clinical staff who raised patient-safety concerns at St. Vincent Hospital allege they were dismissed for it — the amplification channel carries risk for those who use it. | [Massachusetts Nurses Association — eight St. Vincent nurses sue Tenet over unsafe patient care conditions](https://www.massnurses.org/2024/03/21/eight-nurses-from-st-vincent-hospital-filed-suit-today-in-worcester-superior-court-against-tenet-healthcare-for-wrongful-termination-after-blowing-the-whistle-on-unsafe-patient-care-conditions-that-j/) — tier 3, 2024-03-21 |
| A5 Anticipatory Awareness | 2/5 | Formal pre-decision assessment is evidenced for capital and portfolio decisions; the $250 million exposure from expiring ACA subsidies was forecast in advance. | [Healthcare Dive — Tenet expects a $250 million hit from lost ACA subsidies](https://www.healthcaredive.com/news/tenet-expects-250m-hit-loss-aca-subsidies/812014/) — tier 2, 2026-02-01 |

### EMP: Empathy (Raw 2.00/5 — Scaled 25/100)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| E1 Affective Resonance | 2/5 | No independent testimony that patients experience care rather than processing. Absence of disclosure, scored at the low anchor. | [Tenet Healthcare — 2023-2024 ESG Progress Report](https://s23.q4cdn.com/674051945/files/doc_financials/2024/q1/2023-2024-Tenet-ESG-Report-030525.pdf) — tier 4, 2025-03-05 |
| E2 Perspective-Taking | 2/5 | No published mechanism through which patient perspective has modified a named decision. Absence of disclosure, scored at the low anchor. | [Tenet Healthcare — 2023-2024 ESG Progress Report](https://s23.q4cdn.com/674051945/files/doc_financials/2024/q1/2023-2024-Tenet-ESG-Report-030525.pdf) — tier 4, 2025-03-05 |
| E3 Non-Judgment | 2/5 | Non-judgment is stated in policy; no disaggregated outcome data by payer or demographic is published. | [Tenet Healthcare — 2023-2024 ESG Progress Report](https://s23.q4cdn.com/674051945/files/doc_financials/2024/q1/2023-2024-Tenet-ESG-Report-030525.pdf) — tier 4, 2025-03-05 |
| E4 Validation | 2/5 | Eight nurses allege they were terminated after raising unsafe patient care conditions. Validation did not precede investigation. | [Massachusetts Nurses Association — eight St. Vincent nurses sue Tenet over unsafe patient care conditions](https://www.massnurses.org/2024/03/21/eight-nurses-from-st-vincent-hospital-filed-suit-today-in-worcester-superior-court-against-tenet-healthcare-for-wrongful-termination-after-blowing-the-whistle-on-unsafe-patient-care-conditions-that-j/) — tier 3, 2024-03-21 |
| E5 Cultural Empathy | 2/5 | Cultural adaptation across a national hospital footprint is asserted; no co-designed adaptation is documented. | [Tenet Healthcare — 2023-2024 ESG Progress Report](https://s23.q4cdn.com/674051945/files/doc_financials/2024/q1/2023-2024-Tenet-ESG-Report-030525.pdf) — tier 4, 2025-03-05 |

### ACT: Action (Raw 3.00/5 — Scaled 50/100)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| AC1 Responsiveness | 3/5 | Clinical response standards are defined and met for most cases across the acute network. | [Tenet Healthcare — 2023-2024 ESG Progress Report](https://s23.q4cdn.com/674051945/files/doc_financials/2024/q1/2023-2024-Tenet-ESG-Report-030525.pdf) — tier 4, 2025-03-05 |
| AC2 Proportionality | 3/5 | Clinical triage genuinely calibrates response to need in most cases. | [Tenet Healthcare — 2023-2024 ESG Progress Report](https://s23.q4cdn.com/674051945/files/doc_financials/2024/q1/2023-2024-Tenet-ESG-Report-030525.pdf) — tier 4, 2025-03-05 |
| AC3 Efficacy | 3/5 | Outcome data is reviewed annually through the ESG reporting cycle with at least one programme modified. | [Tenet Healthcare — 2023-2024 ESG Progress Report](https://s23.q4cdn.com/674051945/files/doc_financials/2024/q1/2023-2024-Tenet-ESG-Report-030525.pdf) — tier 4, 2025-03-05 |
| AC4 Resource Mobilization | 3/5 | Tenet operates about 50 hospitals and over 600 other facilities and reported strong second-quarter 2026 results while raising its outlook, giving it real capacity to allocate against need. | [Tenet Healthcare — second quarter 2026 results](https://investor.tenethealth.com/press-releases/press-release-details/2026/Tenet-Reports-Strong-Second-Quarter-2026-Results-Raises-2026-Financial-Outlook/default.aspx) — tier 4, 2026-07-01 |
| AC5 Follow-Through | 3/5 | Defined follow-through protocols exist across the care continuum, supported by the Tenet Care Fund for employees in hardship. | [Tenet Healthcare — Tenet Care Fund (self-published)](https://www.tenethealth.com/about/tenet-care-fund) — tier 3, 2026-01-01 |

### EQU: Equity (Raw 2.00/5 — Scaled 25/100)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| EQ1 Universality | 2/5 | Universal access is stated; the company forecasts a $250 million revenue hit and more uncompensated care as ACA subsidies expire, without a published plan to hold coverage. | [Healthcare Dive — Tenet expects a $250 million hit from lost ACA subsidies](https://www.healthcaredive.com/news/tenet-expects-250m-hit-loss-aca-subsidies/812014/) — tier 2, 2026-02-01 |
| EQ2 Priority for Vulnerable | 2/5 | Priority for uninsured and low-income patients is stated; allocation does not demonstrably follow need. | [Tenet Healthcare — 2023-2024 ESG Progress Report](https://s23.q4cdn.com/674051945/files/doc_financials/2024/q1/2023-2024-Tenet-ESG-Report-030525.pdf) — tier 4, 2025-03-05 |
| EQ3 Bias Awareness | 2/5 | No disaggregated outcome data on who receives care is published. Absence of disclosure, scored at the low anchor. | [Tenet Healthcare — 2023-2024 ESG Progress Report](https://s23.q4cdn.com/674051945/files/doc_financials/2024/q1/2023-2024-Tenet-ESG-Report-030525.pdf) — tier 4, 2025-03-05 |
| EQ4 Access Design | 2/5 | Some access features exist; no community input into access design or published barrier mapping. | [Tenet Healthcare — 2023-2024 ESG Progress Report](https://s23.q4cdn.com/674051945/files/doc_financials/2024/q1/2023-2024-Tenet-ESG-Report-030525.pdf) — tier 4, 2025-03-05 |
| EQ5 Historical Harm Acknowledgment | 2/5 | Historical harms are addressed through settlement rather than acknowledgment. Tenet paid over $513 million to resolve criminal charges and civil claims over kickbacks for patient referrals, with two subsidiaries pleading guilty. | [US Department of Justice — Tenet to pay over $513 million; two subsidiaries plead guilty](https://www.justice.gov/archives/opa/pr/hospital-chain-will-pay-over-513-million-defrauding-united-states-and-making-illegal-payments) — tier 5, 2016-10-03 |

### BND: Boundaries (Raw 2.40/5 — Scaled 35/100)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| B1 Self-Sustainability | 3/5 | More than 830 healthcare workers at three Southern California hospitals ratified contracts designed to boost pay, improve benefits and make the facilities safer — a documented structural intervention on staff conditions. | [Healthcare Finance News — caregivers at three California Tenet hospitals approve new contracts](https://www.healthcarefinancenews.com/news/caregivers-three-california-tenet-healthcare-hospitals-approve-double-digit-pay-raises-new) — tier 2, 2025-06-01 |
| B2 Autonomy Preservation | 2/5 | Autonomy-building through patient education is stated and not measured. | [Tenet Healthcare — 2023-2024 ESG Progress Report](https://s23.q4cdn.com/674051945/files/doc_financials/2024/q1/2023-2024-Tenet-ESG-Report-030525.pdf) — tier 4, 2025-03-05 |
| B3 Scope Clarity | 2/5 | Scope is communicated at intake; billing scope has historically been contested. | [US Department of Justice — Tenet to pay over $513 million; two subsidiaries plead guilty](https://www.justice.gov/archives/opa/pr/hospital-chain-will-pay-over-513-million-defrauding-united-states-and-making-illegal-payments) — tier 5, 2016-10-03 |
| B4 Refusal Ethics | 2/5 | No published structured refusal-with-alternatives protocol for patients who cannot pay. | [Healthcare Dive — Tenet expects a $250 million hit from lost ACA subsidies](https://www.healthcaredive.com/news/tenet-expects-250m-hit-loss-aca-subsidies/812014/) — tier 2, 2026-02-01 |
| B5 Consent Orientation | 3/5 | Clinical informed consent is a regulated and audited process across the hospital network. | [Tenet Healthcare — 2023-2024 ESG Progress Report](https://s23.q4cdn.com/674051945/files/doc_financials/2024/q1/2023-2024-Tenet-ESG-Report-030525.pdf) — tier 4, 2025-03-05 |

### ACC: Accountability (Raw 2.00/5 — Scaled 25/100)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| AB1 Harm Acknowledgment | 2/5 | Harm is acknowledged only after external establishment, through litigation and settlement. | [US Department of Justice — Tenet to pay over $513 million; two subsidiaries plead guilty](https://www.justice.gov/archives/opa/pr/hospital-chain-will-pay-over-513-million-defrauding-united-states-and-making-illegal-payments) — tier 5, 2016-10-03 |
| AB2 Correction Willingness | 2/5 | Correction comes under pressure and is minimal; the whistleblower allegations at St. Vincent were contested rather than acted on. | [Massachusetts Nurses Association — eight St. Vincent nurses sue Tenet over unsafe patient care conditions](https://www.massnurses.org/2024/03/21/eight-nurses-from-st-vincent-hospital-filed-suit-today-in-worcester-superior-court-against-tenet-healthcare-for-wrongful-termination-after-blowing-the-whistle-on-unsafe-patient-care-conditions-that-j/) — tier 3, 2024-03-21 |
| AB3 Transparency | 2/5 | The board disbanded its ESG Committee in 2025 and reassigned sustainability oversight to the Audit Committee and human-capital oversight to the HR Committee, reducing dedicated disclosure governance. | [Tenet Healthcare — FY2026 proxy statement filed with the SEC](https://www.sec.gov/Archives/edgar/data/70318/000119312526159118/d928614ddef14a.htm) — tier 4, 2026-04-01 |
| AB4 Systemic Learning | 2/5 | No published evidence that failure analysis produced systemic practice changes. Absence of disclosure, scored at the low anchor. | [Tenet Healthcare — 2023-2024 ESG Progress Report](https://s23.q4cdn.com/674051945/files/doc_financials/2024/q1/2023-2024-Tenet-ESG-Report-030525.pdf) — tier 4, 2025-03-05 |
| AB5 Reparative Action | 2/5 | Repair is confined to legal settlement and charitable contributions attached to settlement terms. | [US Department of Justice — Tenet to pay over $513 million; two subsidiaries plead guilty](https://www.justice.gov/archives/opa/pr/hospital-chain-will-pay-over-513-million-defrauding-united-states-and-making-illegal-payments) — tier 5, 2016-10-03 |

### SYS: Systemic Thinking (Raw 2.40/5 — Scaled 35/100)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| S1 Root Cause Orientation | 2/5 | Root causes of uncompensated care are acknowledged in financial guidance without upstream resource allocation. | [Healthcare Dive — Tenet expects a $250 million hit from lost ACA subsidies](https://www.healthcaredive.com/news/tenet-expects-250m-hit-loss-aca-subsidies/812014/) — tier 2, 2026-02-01 |
| S2 Long-Term Impact | 3/5 | Multi-year planning with specific goals is published in the ESG progress report with some tracking. | [Tenet Healthcare — 2023-2024 ESG Progress Report](https://s23.q4cdn.com/674051945/files/doc_financials/2024/q1/2023-2024-Tenet-ESG-Report-030525.pdf) — tier 4, 2025-03-05 |
| S3 Interconnection Awareness | 3/5 | Cross-system effects across acute, ambulatory and payer systems are mapped in portfolio decisions. | [Tenet Healthcare — second quarter 2026 results](https://investor.tenethealth.com/press-releases/press-release-details/2026/Tenet-Reports-Strong-Second-Quarter-2026-Results-Raises-2026-Financial-Outlook/default.aspx) — tier 4, 2026-07-01 |
| S4 Structural Critique | 2/5 | Tenet does not question the structures that sustain uncompensated care; it forecasts them as a revenue variable. | [Healthcare Dive — Tenet expects a $250 million hit from lost ACA subsidies](https://www.healthcaredive.com/news/tenet-expects-250m-hit-loss-aca-subsidies/812014/) — tier 2, 2026-02-01 |
| S5 Coalitional Compassion | 2/5 | Some coalition participation in industry bodies, primarily representative rather than contributory. | [Tenet Healthcare — 2023-2024 ESG Progress Report](https://s23.q4cdn.com/674051945/files/doc_financials/2024/q1/2023-2024-Tenet-ESG-Report-030525.pdf) — tier 4, 2025-03-05 |

### INT: Integrity (Raw 2.00/5 — Scaled 25/100)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| I1 Consistency Under Pressure | 2/5 | Under margin pressure the company has historically prioritised financial outcomes; commitments give way. | [US Department of Justice — Tenet to pay over $513 million; two subsidiaries plead guilty](https://www.justice.gov/archives/opa/pr/hospital-chain-will-pay-over-513-million-defrauding-united-states-and-making-illegal-payments) — tier 5, 2016-10-03 |
| I2 Non-Performance | 2/5 | Some genuine practice is maintained regardless of visibility, notably the Tenet Care Fund for employees in hardship. | [Tenet Healthcare — Tenet Care Fund (self-published)](https://www.tenethealth.com/about/tenet-care-fund) — tier 3, 2026-01-01 |
| I3 Internal Consistency | 2/5 | Internal culture is contested: nurses allege retaliation for raising safety concerns, while 830 workers secured improved contracts in California. | [Healthcare Finance News — caregivers at three California Tenet hospitals approve new contracts](https://www.healthcarefinancenews.com/news/caregivers-three-california-tenet-healthcare-hospitals-approve-double-digit-pay-raises-new) — tier 2, 2025-06-01 |
| I4 Values Alignment | 2/5 | Values alignment is asserted; disbanding the dedicated ESG Committee was not publicly tested against stated values. | [Tenet Healthcare — FY2026 proxy statement filed with the SEC](https://www.sec.gov/Archives/edgar/data/70318/000119312526159118/d928614ddef14a.htm) — tier 4, 2026-04-01 |
| I5 Resilience of Care | 2/5 | Core practices sit in policy and have survived leadership transitions, though governance of them was weakened in 2025. | [Tenet Healthcare — 2023-2024 ESG Progress Report](https://s23.q4cdn.com/674051945/files/doc_financials/2024/q1/2023-2024-Tenet-ESG-Report-030525.pdf) — tier 4, 2025-03-05 |

## Published Index Comparison

**Published index:** fortune-500 | **Published rank:** #185 | **Published composite:** 37.5/100 | **Published band:** Developing

| Dimension | Published (raw) | Assessed (raw) | Difference (raw) |
|---|---|---|---|
| AWR | 2.5 | 2.40 | -0.1 |
| EMP | 2.5 | 2.00 | -0.5 |
| ACT | 3 | 3.00 | 0 |
| EQU | 2 | 2.00 | 0 |
| BND | 2.5 | 2.40 | -0.1 |
| ACC | 2.5 | 2.00 | -0.5 |
| SYS | 2.5 | 2.40 | -0.1 |
| INT | 2.5 | 2.00 | -0.5 |
| **Composite** | **37.5** | **31.9** | **-5.6** |

**Math-hygiene check:** the published dimension vector reconstructs to 37.5 under the canonical formula against a published composite of 37.5 (difference 0.0 points). This is within the 0.5-point tolerance, so no math-hygiene issue is raised.

### Analysis

The assessed composite is 31.9 against a published 37.5 — a fall of 5.6 points, just over the filing trigger, with no band change. Both values are Developing.

Action holds at 3.00 of 5, matching the published value, and it is Tenet's strongest dimension. The company operates about 50 hospitals and more than 600 other facilities, reported strong second-quarter 2026 results while raising its outlook, and runs the Tenet Care Fund for employees in hardship. Clinical triage genuinely calibrates response to need.

Three findings pull the rest down.

Accountability falls to 2.00 of 5. The most decision-relevant fact is recent and structural: in 2025 Tenet's board **disbanded its ESG Committee**, reassigning sustainability oversight to the Audit Committee and human-capital oversight to the HR Committee. Reducing dedicated board-level oversight of social performance is a governance choice that runs directly against the AB3 anchors.

Equity falls to 2.00 of 5. Tenet forecasts a $250 million revenue hit and increased uncompensated care as ACA subsidies expire. The subsidy expiry is federal policy and is not scored against Tenet. What is scored is that Tenet has published no plan to hold coverage for the patients who will lose it, and treats the exposure as a revenue variable.

Integrity falls to 2.00 of 5. Eight nurses at St. Vincent Hospital allege they were terminated after raising unsafe patient care conditions — an unadjudicated allegation, scored as such. Against it, more than 830 healthcare workers at three Southern California hospitals ratified contracts designed to raise pay, improve benefits and make facilities safer. Both are Tenet's conduct and both are scored.

**Why confidence is low.** The delta is 0.6 points above the filing threshold and rests partly on evidence older than the preferred horizon. This is filed so the finding is visible and reviewable, not because it is settled.

### Recommendation

**Flag for review at 31.9 / Developing.** Delta -5.6, which clears the 5.0-point magnitude trigger by 0.6 points. No band change. A change proposal is filed with **low confidence**, because several findings predate 2025 and the current-cycle evidence base is thin. A re-test is recommended when Tenet publishes a 2026 ESG report.

## Key Findings

- Why it matters: Tenet's board reduced its own oversight of social performance. In 2025 it disbanded the ESG Committee and split its work between the Audit and HR Committees.
- Tenet expects a $250 million revenue hit and more unpaid care as ACA subsidies expire. The subsidy expiry is federal policy, not Tenet's doing — but Tenet has published no plan to keep those patients covered.
- Why it matters: staff who raise safety concerns face risk. Eight nurses at St. Vincent Hospital allege they were fired after blowing the whistle on unsafe patient care conditions. That is an allegation, not a court finding.
- The other side is real too. More than 830 healthcare workers at three Southern California Tenet hospitals ratified contracts designed to raise pay, improve benefits and make the facilities safer.
- The score falls 5.6 points, from 37.5 to 31.9, staying in the Developing band. Confidence is low: some of this evidence is older than the benchmark prefers, and the proposal is flagged for review rather than application.

## Strongest Dimensions

Action (3.00 of 5). A large operating footprint, strong 2026 financial performance and functioning clinical triage keep responsiveness, proportionality and resource mobilisation at the middle anchor.

## Weakest Dimensions

Empathy (2.00 of 5), Equity (2.00 of 5), Accountability (2.00 of 5) and Integrity (2.00 of 5). No independent patient-experience evidence, no disaggregated outcome data, no self-initiated harm acknowledgment, and a 2025 reduction in board-level social oversight.

## Evidence Gaps

Tenet's most recent published ESG progress report covers 2023-2024, and no 2026 report was available at assessment. It publishes no disaggregated patient outcome data, no charity-care policy outcomes and no grievance statistics. The St. Vincent allegations are unadjudicated. Where disclosure is simply absent, the low anchor was applied and is stated as an absence of disclosure, not as evidence of harm. This is the weakest evidence base of the five Fortune-500 entities assessed this cycle apart from MetLife.

## Sources

- [Tenet Healthcare — 2023-2024 ESG Progress Report](https://s23.q4cdn.com/674051945/files/doc_financials/2024/q1/2023-2024-Tenet-ESG-Report-030525.pdf) — tier 4, 2025-03-05
- [Massachusetts Nurses Association — eight St. Vincent nurses sue Tenet over unsafe patient care conditions](https://www.massnurses.org/2024/03/21/eight-nurses-from-st-vincent-hospital-filed-suit-today-in-worcester-superior-court-against-tenet-healthcare-for-wrongful-termination-after-blowing-the-whistle-on-unsafe-patient-care-conditions-that-j/) — tier 3, 2024-03-21
- [Healthcare Dive — Tenet expects a $250 million hit from lost ACA subsidies](https://www.healthcaredive.com/news/tenet-expects-250m-hit-loss-aca-subsidies/812014/) — tier 2, 2026-02-01
- [Tenet Healthcare — second quarter 2026 results](https://investor.tenethealth.com/press-releases/press-release-details/2026/Tenet-Reports-Strong-Second-Quarter-2026-Results-Raises-2026-Financial-Outlook/default.aspx) — tier 4, 2026-07-01
- [Tenet Healthcare — Tenet Care Fund (self-published)](https://www.tenethealth.com/about/tenet-care-fund) — tier 3, 2026-01-01
- [US Department of Justice — Tenet to pay over $513 million; two subsidiaries plead guilty](https://www.justice.gov/archives/opa/pr/hospital-chain-will-pay-over-513-million-defrauding-united-states-and-making-illegal-payments) — tier 5, 2016-10-03
- [Healthcare Finance News — caregivers at three California Tenet hospitals approve new contracts](https://www.healthcarefinancenews.com/news/caregivers-three-california-tenet-healthcare-hospitals-approve-double-digit-pay-raises-new) — tier 2, 2025-06-01
- [Tenet Healthcare — FY2026 proxy statement filed with the SEC](https://www.sec.gov/Archives/edgar/data/70318/000119312526159118/d928614ddef14a.htm) — tier 4, 2026-04-01

## Recommended Next Steps

Developing band. Consider a [Certified Assessment](/certified-assessments) for a structured improvement roadmap.

---

*This assessment is based on publicly available information and does not constitute a formal Compassion Benchmark Certified Assessment. For a comprehensive, assessor-led evaluation, visit compassionbenchmark.com/certified-assessments.*
