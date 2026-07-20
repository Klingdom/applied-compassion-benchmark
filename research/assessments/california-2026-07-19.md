---
entity: "California"
type: "State"
sector: "Government"
date: "2026-07-19"
composite_score: 54.4
band: "Functional"
scores:
  AWR: 3.8
  EMP: 3.0
  ACT: 3.2
  EQU: 3.2
  BND: 2.4
  ACC: 3.2
  SYS: 4.0
  INT: 2.6
published_index: "us-states"
published_rank: 5
published_composite: 87.7
published_band: "Exemplary"
---

# Compassion Benchmark Assessment: California

**Entity type:** State
**Sector/Domain:** Government (US state jurisdiction)
**Assessment date:** 2026-07-19
**Composite score:** 54.4/100
**Band:** Functional

## Score Summary

| Dimension | Code | Raw (1–5) | Scaled (0–100) | Band |
|-----------|------|-----------|----------------|------|
| Awareness | AWR | 3.8 | 70.0 | Established |
| Empathy | EMP | 3.0 | 50.0 | Functional |
| Action | ACT | 3.2 | 55.0 | Functional |
| Equity | EQU | 3.2 | 55.0 | Functional |
| Boundaries | BND | 2.4 | 35.0 | Developing |
| Accountability | ACC | 3.2 | 55.0 | Functional |
| Systemic Thinking | SYS | 4.0 | 75.0 | Established |
| Integrity | INT | 2.6 | 40.0 | Developing |
| **Composite** | — | — | **54.4** | **Functional** |

Composite verified by running `computeCompositeFromDimensions` from `site/scripts/lib/scoring.mjs` (methodology v1.2). Output: `{"composite":54.4,"band":"Functional","integrationPremium":0}`. All eight dimensions sit below 4.0 except SYS, which sits exactly at 4.0, so seven of eight count as weak dimensions, the weakness factor is 0, and no integration premium applies.

## Dimension Details

### AWR: Awareness (3.8/5 · 70/100)

California detects suffering better than it fixes it. The state runs an unusually dense measurement apparatus. What it does with the findings is a separate question, scored under Accountability.

| Subdimension | Score | Evidence | Source |
|-------------|-------|----------|--------|
| A1 Suffering Detection | 4/5 | A statutorily independent State Auditor, an independent prison Inspector General, the Legislative Analyst's Office, and a statewide homelessness data system give California multiple formal detection channels with regular review. The same apparatus documented its own failure: the 2024 audit found the California Interagency Council on Homelessness had analyzed no spending past 2021. | [State Auditor 2023-102.1](https://www.auditor.ca.gov/reports/2023-102-1/), 2024-04-09; [CalMatters](https://calmatters.org/housing/homelessness/2024/04/california-homelessness-spending/), 2024-04-09 |
| A2 Contextual Sensitivity | 4/5 | Differentiated processes for immigration status, language, and disability. Medi-Cal was extended to all income-eligible adults regardless of status. The Department of Developmental Services runs a dedicated service-access-and-equity grant stream. | [UC Berkeley Labor Center](https://laborcenter.berkeley.edu/californias-uninsured-in-2024/), 2024; [DDS](https://www.dds.ca.gov/rc/disparities/disparity-funds-program/program-overview/), 2025 |
| A3 Blind Spot Mitigation | 4/5 | The State High-Risk Audit Program is an annual structured assessment that names the Governor's own administration. It found something significant and unflattering: three of five homelessness programs produced too little data to judge effectiveness at all. | [State Auditor 2025-601](https://www.auditor.ca.gov/reports/2025-601/), 2025-12-11 |
| A4 Signal Amplification | 4/5 | Structural roles with real authority and regular public reporting. The Office of the Inspector General published 28 public oversight reports on the prison system in 2025. Disability Rights California, the federally mandated protection and advocacy agency, publishes independent findings on regional centers. | [OIG 2025 Annual Report](https://www.oig.ca.gov/wp-content/uploads/2026/03/2025-Annual-Report.pdf), 2026-03; [Disability Rights California](https://www.disabilityrightsca.org/latest-news/from-navigation-to-transformation-addressing-inequities-in-californias-regional-center), 2025 |
| A5 Anticipatory Awareness | 3/5 | Formal pre-launch assessment applies to some decisions, not all. SB 1000 requires environmental justice analysis in local general plans. But the 2025 CEQA rewrite created an absolute exemption that removes projects from environmental review regardless of potential impact. | [CA DOJ SB 1000](https://oag.ca.gov/environment/sb1000), 2025; [Holland & Knight](https://www.hklaw.com/en/insights/publications/2025/07/california-legislature-enacts-major-ceqa-reforms-for-housing-rich), 2025-07 |

### EMP: Empathy (3.0/5 · 50/100)

| Subdimension | Score | Evidence | Source |
|-------------|-------|----------|--------|
| E1 Affective Resonance | 3/5 | Mixed and inconsistent. Wildfire survivors reported delays, denials, and miscommunication as the top complaints to the Department of Insurance after the January 2025 Los Angeles fires. Immigrant enrollees describe abrupt Medi-Cal loss. | [Insurance Journal](https://www.insurancejournal.com/news/west/2026/02/02/856594.htm), 2026-02-02; [Public Health Watch](https://publichealthwatch.org/2026/05/26/california-immigrants-medicaid-healthcare-uninsured/), 2026-05-26 |
| E2 Perspective-Taking | 3/5 | Formal mechanisms exist and have changed decisions. The reparations task force took years of community testimony; all 58 counties filed Proposition 1 integrated plans on time. But community members remained consultants, not decision-makers: five reparations bills were vetoed in October 2025. | [CalMatters](https://calmatters.org/justice/2025/10/reparations-what-next-after-newsom-signings/), 2025-10-20; [CHHS](https://www.chhs.ca.gov/blog/2026/07/02/california-reaches-major-milestone-in-modernizing-behavioral-healthcare-proposition-1-goes-into-effect-statewide/), 2026-07-02 |
| E3 Non-Judgment | 3/5 | Disparities are measured and investigated, but not corrected. Regional centers spend about 50 cents on services for a person of color with a developmental disability for every dollar spent on a white person. A six-year, $66 million state effort to close that gap was found largely ineffective. | [Public Counsel](https://publiccounsel.org/report-california-has-failed-in-effort-to-reduce-racial-disparities-in-services-for-children-with-developmental-disabilities/), 2025; [Disability Rights California](https://www.disabilityrightsca.org/publications/differences-in-regional-center-spending), 2025 |
| E4 Validation | 2/5 | The state's default posture toward its own alleged harms is legal defence first. California litigated official immunity over the 2020 San Quentin COVID transfer through the appellate courts. The FAIR Plan denied hundreds of smoke damage claims and failed 17 critical recommendations before the state forced compliance. | [Prison Legal News](https://www.prisonlegalnews.org/news/2023/dec/1/california-court-appeal-reinstates-lawsuit-san-quentin-prisoner-over-botched-transfer-sparked-covid-19-outbreak/), 2023-12-01; [Insurance Journal](https://www.insurancejournal.com/news/west/2026/02/02/856594.htm), 2026-02-02 |
| E5 Cultural Empathy | 4/5 | Multiple communities involved in genuine adaptations. The state issued a formal apology for slavery in 2024. Language access, cultural broker programs, and community-designed equity grants operate across several service systems. | [CalMatters](https://calmatters.org/politics/capitol/2024/09/california-reparations-slavery-apology/), 2024-09-26 |

### ACT: Action (3.2/5 · 55/100)

| Subdimension | Score | Evidence | Source |
|-------------|-------|----------|--------|
| AC1 Responsiveness | 3/5 | Standards exist and are met in some systems, missed badly in others. Proposition 1 beat its own bed target ahead of schedule, delivering 6,919 residential treatment beds against 6,800 promised. A 2025 state audit found child abuse investigations that should take 30 days taking three times longer. | [Governor of California](https://www.gov.ca.gov/2026/03/11/ahead-of-schedule-governor-newsoms-prop-1-is-exceeding-goals-to-expand-capacity-and-treatment-statewide-helping-5m-californians/), 2026-03-11; [NBC Bay Area](https://www.nbcbayarea.com/news/local/alameda-county-audit-protect-children/3971006/), 2025 |
| AC2 Proportionality | 3/5 | Need assessment informs response in most cases. The state awarded $291 million in March 2026 for supportive housing and behavioral health. But the 2026-27 budget proposed no significant new investment to offset federal health and food assistance cuts. | [Governor of California](https://www.gov.ca.gov/2026/03/02/governor-newsom-announces-new-care-court-accountability-measures-to-get-more-chronically-mentally-ill-off-our-streets-awards-291-million-in-funding-for-services-and-housing/), 2026-03-02; [California Budget & Policy Center](https://calbudgetcenter.org/resources/first-look-understanding-the-governors-proposed-2026-27-california-budget/), 2026-01-09 |
| AC3 Efficacy | 3/5 | This is California's central weakness. The State Auditor could not determine whether the state's main homelessness funding source worked. The state then modified the program: AB 799 was signed in September 2024 to require outcome data. That data is not due until February 2027 and not public until June 2027. | [State Auditor 2023-102.1](https://www.auditor.ca.gov/reports/2023-102-1/), 2024-04-09; [AB 799](https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=202320240AB799), 2024-09-19 |
| AC4 Resource Mobilization | 4/5 | Documented reallocation at genuine scale. California awarded $4.17 billion through the behavioral health infrastructure program across more than 330 projects, and spent roughly $24 billion on homelessness and housing over five fiscal years. | [CHHS](https://www.chhs.ca.gov/blog/2026/07/02/california-reaches-major-milestone-in-modernizing-behavioral-healthcare-proposition-1-goes-into-effect-statewide/), 2026-07-02; [CalMatters](https://calmatters.org/housing/homelessness/2024/04/california-homelessness-spending/), 2024-04-09 |
| AC5 Follow-Through | 3/5 | Protocols and longitudinal tracking exist for some populations, notably corrections, where the state reports record-low recidivism. They do not exist for others: nearly a third of people leaving state-funded homelessness placements left for destinations the state records as unknown. | [State Auditor 2023-102.1](https://www.auditor.ca.gov/reports/2023-102-1/), 2024-04-09; [Governor of California](https://www.gov.ca.gov/2026/06/30/honor-dorm-opens-as-california-reaches-record-high-rehabilitation-success-record-low-recidivism/), 2026-06-30 |

### EQU: Equity (3.2/5 · 55/100)

| Subdimension | Score | Evidence | Source |
|-------------|-------|----------|--------|
| EQ1 Universality | 4/5 | Coverage is disaggregated and gaps demonstrably narrowed. California's uninsured rate fell to 5.9 percent in 2024, a record low, driven by extending full-scope Medi-Cal regardless of immigration status. About 520,000 undocumented residents still earn too much to qualify and are barred from the state exchange. | [California Budget & Policy Center](https://calbudgetcenter.org/resources/california-health-coverage-progress-disparities-and-policy-threats/), 2025; [UC Berkeley Labor Center](https://laborcenter.berkeley.edu/californias-uninsured-in-2024/), 2024 |
| EQ2 Priority for Vulnerable | 2/5 | Under scarcity, allocation moved away from the most vulnerable. To close a $12 billion deficit the state froze new Medi-Cal enrollment for undocumented adults, added premiums, and cut dental. More than 86,000 people left or were denied coverage in January and February 2026, exiting at six times the rate of other enrollees. The 2026-27 proposal also cut in-home care backup providers. | [Public Health Watch](https://publichealthwatch.org/2026/05/26/california-immigrants-medicaid-healthcare-uninsured/), 2026-05-26; [Disability Rights California](https://www.disabilityrightsca.org/latest-news/disability-rights-californias-summary-of-the-governors-proposed-2026-27-budget), 2026-01 |
| EQ3 Bias Awareness | 3/5 | Disparities are identified and formally investigated, with corrective spending attached, but corrections are not verified as working. Spending gaps between Latino and white children improved at only 4 of 21 regional centers over six years and worsened at the other 17. | [Public Counsel](https://publiccounsel.org/report-california-has-failed-in-effort-to-reduce-racial-disparities-in-services-for-children-with-developmental-disabilities/), 2025; [DDS](https://www.dds.ca.gov/rc/disparities/disparity-funds-program/program-overview/), 2025 |
| EQ4 Access Design | 3/5 | Barrier mapping is real and some barriers were removed, including 2026 investment in county CalFresh eligibility staffing. Structural exclusions remain: undocumented residents above the Medi-Cal income line cannot buy exchange coverage at all. | [Assemblymember Lee](https://lee.asmdc.org/press-releases/20260708-california-steps-tackle-hunger-and-counter-federal-cuts-food-assistance), 2026-07-08; [UC Berkeley Labor Center](https://laborcenter.berkeley.edu/californias-uninsured-in-2024/), 2024 |
| EQ5 Historical Harm Acknowledgment | 4/5 | Formal acknowledgment co-developed with the affected community, plus concrete action. California apologised for slavery in 2024 and in October 2025 created the Bureau for Descendants of American Slavery and funded $6 million of descendant-verification research. | [CalMatters](https://calmatters.org/politics/capitol/2024/09/california-reparations-slavery-apology/), 2024-09-26; [Equal Justice Society](https://equaljusticesociety.org/2025/10/14/arrt-commends-governor-newsom-on-signing-into-law-historic-reparations-bills-sb-518-and-sb-437/), 2025-10-14 |

### BND: Boundaries (2.4/5 · 35/100)

California's weakest dimension. The state promises broadly, then narrows the promise after people have relied on it.

| Subdimension | Score | Evidence | Source |
|-------------|-------|----------|--------|
| B1 Self-Sustainability | 2/5 | Wellbeing structures exist but the state reduced its own workforce's terms under fiscal stress: a 3 percent pay reduction from July 2025 to June 2027 and a deferred general salary increase. A return-to-office mandate was imposed, then paused, generating documented internal conflict. | [SEIU Local 1000](https://www.seiu1000.org/budgetfight/), 2025; [CalMatters](https://calmatters.org/politics/2025/07/state-workers-return-to-office/), 2025-07 |
| B2 Autonomy Preservation | 3/5 | The California Model at San Quentin is a genuine capacity-building programme with measured outcomes, including record-low recidivism. Working against it, SB 43 and CARE Court expanded court-ordered intervention. | [Governor of California](https://www.gov.ca.gov/2026/02/20/governor-newsom-transforms-san-quentin-opens-nation-leading-learning-center/), 2026-02-20; [Governor of California](https://www.gov.ca.gov/2026/06/30/honor-dorm-opens-as-california-reaches-record-high-rehabilitation-success-record-low-recidivism/), 2026-06-30 |
| B3 Scope Clarity | 2/5 | Limitations acknowledged only when raised. California promoted universal Medi-Cal coverage, then froze new enrollment for undocumented adults. FAIR Plan policyholders discovered the limits of their coverage after the January 2025 fires, not before. | [CalMatters](https://calmatters.org/health/2025/05/newsom-freeze-medi-cal-undocumented-immigrants/), 2025-05; [Insurance Journal](https://www.insurancejournal.com/news/west/2026/02/02/856594.htm), 2026-02-02 |
| B4 Refusal Ethics | 2/5 | Refusals often lack a tracked alternative. Roughly a third of people exiting state-funded homelessness placements went to unknown destinations. The state's own 2025 encampment model urged cities to make encampments illegal, with a 48-hour warning, in a system that does not have enough shelter beds. | [State Auditor 2023-102.1](https://www.auditor.ca.gov/reports/2023-102-1/), 2024-04-09; [CalMatters](https://calmatters.org/housing/homelessness/2025/05/newsom-encampment-sweep-ordinance/), 2025-05 |
| B5 Consent Orientation | 3/5 | CARE Court provides counsel and a volunteer supporter, which is a genuine procedural protection. But SB 43 widened the definition of grave disability and lowered the threshold for involuntary conservatorship. Human Rights Watch opposed it as not rights-respecting. | [Human Rights Watch](https://www.hrw.org/news/2023/08/07/human-rights-watchs-opposition-sb-43), 2023-08-07; [Governor of California](https://www.gov.ca.gov/2023/10/10/modernizing-conservatorship-law-sb43/), 2023-10-10 |

### ACC: Accountability (3.2/5 · 55/100)

| Subdimension | Score | Evidence | Source |
|-------------|-------|----------|--------|
| AB1 Harm Acknowledgment | 3/5 | At least one significant harm was acknowledged inside government before any legal obligation. The Inspector General established that San Quentin had zero COVID cases before 122 men were transferred in on 30 May 2020, and blamed the department. The state nonetheless fought liability in court. | [Prison Legal News](https://www.prisonlegalnews.org/news/2023/dec/1/california-court-appeal-reinstates-lawsuit-san-quentin-prisoner-over-botched-transfer-sparked-covid-19-outbreak/), 2023-12-01; [OIG](https://www.oig.ca.gov/wp-content/uploads/2026/03/2025-Annual-Report.pdf), 2026-03 |
| AB2 Correction Willingness | 3/5 | One significant course correction based on harm evidence: AB 799 followed the 2024 audit. But correction is slow and incomplete. In the December 2025 high-risk update, not one agency was removed from the list. | [AB 799](https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=202320240AB799), 2024-09-19; [State Auditor 2025-601](https://www.auditor.ca.gov/reports/2025-601/), 2025-12-11 |
| AB3 Transparency | 4/5 | Annual public reporting includes failures, gaps and corrective actions, and names the executive. The Auditor placed the Governor's own administration and eight agencies on the high-risk list. Short of 5 because the Public Records Act carries a broad catch-all exemption and weak enforcement. | [State Auditor 2025-601](https://www.auditor.ca.gov/reports/2025-601/), 2025-12-11; [CalMatters commentary](https://calmatters.org/commentary/2026/07/public-records-law-weaken-california/), 2026-07 |
| AB4 Systemic Learning | 3/5 | A formal systemic review process exists, including the Inspector General's first cross-institution trend analysis of 31 prisons. But findings recur. The Auditor recorded insufficient progress on IT oversight across multiple cycles. | [OIG](https://www.oig.ca.gov/wp-content/uploads/2026/03/2025-Annual-Report.pdf), 2026-03; [State Auditor 2025-601](https://www.auditor.ca.gov/reports/2025-601/), 2025-12-11 |
| AB5 Reparative Action | 3/5 | Reparative action is real but partial. The state funded $6 million of descendant-verification research and created a bureau. It vetoed the bill that would have started a restitution process for people whose property was taken through racially motivated eminent domain. | [Equal Justice Society](https://equaljusticesociety.org/2025/10/14/arrt-commends-governor-newsom-on-signing-into-law-historic-reparations-bills-sb-518-and-sb-437/), 2025-10-14; [CalMatters](https://calmatters.org/justice/2025/10/reparations-what-next-after-newsom-signings/), 2025-10-20 |

### SYS: Systemic Thinking (4.0/5 · 75/100)

California's strongest dimension, and the one where its scale genuinely helps.

| Subdimension | Score | Evidence | Source |
|-------------|-------|----------|--------|
| S1 Root Cause Orientation | 4/5 | Explicit upstream strategy with at least one documented case of reducing downstream need. Unsheltered homelessness fell in 2025 against the national trend, and the 2025 housing laws attack supply, not just shelter. | [Governor of California](https://www.gov.ca.gov/2026/01/08/california-sees-drop-in-unsheltered-homelessness-bucking-national-trend-and-federal-headwinds/), 2026-01-08; [Governor of California](https://www.gov.ca.gov/2025/06/30/governor-newsom-signs-into-law-groundbreaking-reforms-to-build-more-housing-affordability/), 2025-06-30 |
| S2 Long-Term Impact | 4/5 | Long-horizon planning drives strategy. Proposition 1 restructured behavioral health financing statewide through a voter-approved constitutional-scale change, with published outcome-driven county plans. | [CHHS](https://www.chhs.ca.gov/blog/2026/07/02/california-reaches-major-milestone-in-modernizing-behavioral-healthcare-proposition-1-goes-into-effect-statewide/), 2026-07-02; [LAO](https://lao.ca.gov/Publications/Report/5101), 2026-01 |
| S3 Interconnection Awareness | 4/5 | Cross-system effects are systematically mapped. The Behavioral Health Services Act links housing, treatment, crisis care and prevention across all 58 counties. The Interagency Council on Homelessness has statutory cross-agency data authority. | [CHHS](https://www.chhs.ca.gov/blog/2026/07/02/california-reaches-major-milestone-in-modernizing-behavioral-healthcare-proposition-1-goes-into-effect-statewide/), 2026-07-02; [AB 799](https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=202320240AB799), 2024-09-19 |
| S4 Structural Critique | 4/5 | California takes positions that cost it politically. It rewrote its own landmark environmental law over the objection of long-standing allies, and its insurance regulator sued the industry-run FAIR Plan for illegally denying claims. | [Holland & Knight](https://www.hklaw.com/en/insights/publications/2025/07/california-legislature-enacts-major-ceqa-reforms-for-housing-rich), 2025-07; [Insurance Journal](https://www.insurancejournal.com/news/west/2026/02/02/856594.htm), 2026-02-02 |
| S5 Coalitional Compassion | 4/5 | Joint action with resource and legal sharing. California co-led 12 other states in guidance defending environmental justice programmes, and joined multistate litigation over frozen family assistance funding. | [CalEPA](https://calepa.ca.gov/envjustice/), 2025; [CWDA](https://www.cwda.org/federal-updates), 2026 |

### INT: Integrity (2.6/5 · 40/100)

| Subdimension | Score | Evidence | Source |
|-------------|-------|----------|--------|
| I1 Consistency Under Pressure | 2/5 | The clearest finding in this assessment. Facing a $12 billion deficit, California narrowed its signature compassion commitment: it froze Medi-Cal enrollment for undocumented adults, added premiums, and cut dental. It vetoed reparations bills citing legal risk and threats to federal funding. | [Public Health Watch](https://publichealthwatch.org/2026/05/26/california-immigrants-medicaid-healthcare-uninsured/), 2026-05-26; [CalMatters](https://calmatters.org/justice/2025/10/reparations-what-next-after-newsom-signings/), 2025-10-20 |
| I2 Non-Performance | 3/5 | Some practices are maintained regardless of visibility. The Inspector General published that the prison department's misconduct handling was inadequate in 45 percent of reviews. The developmental services department publishes its own unflattering spending disparity data. | [OIG](https://www.oig.ca.gov/wp-content/uploads/2026/03/2025-Annual-Report.pdf), 2026-03; [Disability Rights California](https://www.disabilityrightsca.org/publications/differences-in-regional-center-spending), 2025 |
| I3 Internal Consistency | 2/5 | A gap between external message and internal treatment, acknowledged but not closed. The state cut its own workers' take-home pay by 3 percent and deferred a raise, while union leadership described the return-to-office order as driven by politics rather than performance. | [SEIU Local 1000](https://www.seiu1000.org/budgetfight/), 2025; [CalMatters](https://calmatters.org/politics/2025/07/state-workers-return-to-office/), 2025-07 |
| I4 Values Alignment | 3/5 | Values are explicitly considered in some major decisions and explicitly overridden in others, with stated reasons. The Safety Net Reserve, built specifically to protect CalWORKs and Medi-Cal in a downturn, was drained to zero in the 2024-25 budget. | [CalMatters](https://calmatters.org/justice/2025/10/reparations-what-next-after-newsom-signings/), 2025-10-20; [SoCal Grantmakers](https://socalgrantmakers.org/media/blog/philanthropy-guide-governor-newsoms-proposed-2026-2027-california-budget), 2026-01 |
| I5 Resilience of Care | 3/5 | Core practices sit in statute and in the constitution-adjacent initiative process, not in personalities: the independent Auditor, the Inspector General, Medi-Cal expansion and Proposition 1. But this has not been tested by a gubernatorial transition inside the assessment window. | [CHHS](https://www.chhs.ca.gov/blog/2026/07/02/california-reaches-major-milestone-in-modernizing-behavioral-healthcare-proposition-1-goes-into-effect-statewide/), 2026-07-02; [State Auditor 2025-601](https://www.auditor.ca.gov/reports/2025-601/), 2025-12-11 |

## Published Index Comparison

**Published index:** us-states | **Published rank:** 5 (of 21 listed, not a national rank) | **Published composite:** 87.7/100 | **Published band:** Exemplary

The published California entry is a bulk-import placeholder with `last_assessed: null`. It has no evidentiary basis. The table below compares it to this first evidence-based baseline.

| Dimension | Published (raw) | Published (scaled) | Research (raw) | Research (scaled) | Difference (scaled) | Explanation |
|-----------|-----------------|--------------------|----------------|-------------------|---------------------|-------------|
| AWR | 4.5 | 87.5 | 3.8 | 70.0 | −17.5 | Detection apparatus is genuinely strong, but the state's own auditor found the flagship homelessness council had analysed no spending past 2021. |
| EMP | 4.5 | 87.5 | 3.0 | 50.0 | −37.5 | Validation is the failure point: the state defends legally before it acknowledges. Measured disparities persist and, in developmental services, worsened. |
| ACT | 4.5 | 87.5 | 3.2 | 55.0 | −32.5 | Resource mobilisation is genuinely strong (4/5). Efficacy is not: the auditor could not determine whether the main homelessness programme worked. |
| EQU | 4.0 | 75.0 | 3.2 | 55.0 | −20.0 | Universality is real (5.9 percent uninsured, a record low). Priority for the vulnerable failed under scarcity: 86,000 immigrants lost or were denied Medi-Cal in two months. |
| BND | 4.0 | 75.0 | 2.4 | 35.0 | −40.0 | Largest gap. Scope clarity, refusal ethics and staff sustainability are all documented weaknesses. A third of homelessness placement exits go to unknown destinations. |
| ACC | 3.5 | 62.5 | 3.2 | 55.0 | −7.5 | Closest match. Transparency is strong (4/5) but correction is slow: not one agency left the high-risk list in December 2025. |
| SYS | 4.5 | 87.5 | 4.0 | 75.0 | −12.5 | Genuinely California's strongest dimension. Reduced from the placeholder only because no subdimension reaches independently verified level 5. |
| INT | 4.0 | 75.0 | 2.6 | 40.0 | −35.0 | The 2025-26 Medi-Cal retrenchment and five reparations vetoes are direct consistency-under-pressure failures inside the weighted window. |
| **Composite** | — | **87.7** | — | **54.4** | **−33.3** | — |

### Score Difference Analysis

**The delta corrects a data defect, not institutional decline.** The published 87.7 was never derived from evidence. Reconstructing the published dimensions through `computeCompositeFromDimensions` returns exactly 87.7 with an 8.0 integration premium, so the placeholder is internally consistent arithmetic built on nothing. Nothing in this research suggests California got worse by 33 points.

**BND, −40 points, the largest gap.** A placeholder of 4.0 implies California communicates its limits honestly and refuses people with dignity and alternatives. The evidence contradicts this in three separate systems. Homelessness: nearly a third of people leaving state-funded placements go to destinations the state does not know. Health coverage: the state promoted universal Medi-Cal, then closed the door to new undocumented adult enrollees in January 2026. Insurance: FAIR Plan policyholders learned the limits of their coverage after the fires.

**INT, −35 points.** A placeholder of 4.0 implies commitments hold when costly. The most heavily weighted twelve months show the opposite. To close a $12 billion deficit, California cut the specific benefits going to the least powerful residents it had recently and publicly promised to cover.

**EMP, −37.5 points.** The placeholder implies community members shape decisions and harm reports are believed first. California measures the experience of marginalised residents unusually well and then acts on that measurement unusually slowly. The developmental services case is the clearest: six years, $66 million, and gaps widened at 17 of 21 regional centers.

**What holds up.** Systemic Thinking at 4.0 and Accountability at 3.2 are close to the placeholder. California's upstream orientation, cross-system planning, willingness to take structurally costly positions, and independent oversight infrastructure are all real and would score well against any peer state.

### Recommendation

The published score is substantially overstated and should be replaced. Recommended action: `update-entity` with composite 54.4, band Functional, and rank null pending a rebuild of the full 51-jurisdiction index. California would sit near the top of the 18 states assessed at full depth, below New Jersey at 60.6 and Illinois at 60.0, above Maryland and Virginia at 55.6.

## Key Findings

- **California measures its own failures better than almost any state, then fixes them slowly.** Its independent State Auditor put the Governor's own administration and eight agencies on the high-risk list in December 2025 — and removed no agency at all. Strong detection, weak correction.
- **The state spent about $24 billion on homelessness and housing over five years without knowing what worked.** The 2024 State Auditor report found the responsible council had analysed no spending past 2021, and three of five programmes produced too little data to judge. The fix, AB 799, does not require public outcome data until June 2027.
- **California's biggest compassion commitment narrowed the moment it got expensive.** Facing a $12 billion deficit, the state froze new Medi-Cal enrollment for undocumented adults. In January and February 2026 alone, more than 86,000 people left or were denied coverage, exiting at six times the rate of other enrollees.
- **Equity is measured, funded, and still not delivered in developmental services.** Regional centers spend about 50 cents per person of color for every dollar spent per white person. A six-year, $66 million state effort left gaps wider at 17 of 21 centers.
- **Where California leads is upstream.** Proposition 1 restructured behavioral health funding across all 58 counties, the 2025 housing laws rewrote a landmark environmental statute to increase supply, and unsheltered homelessness fell in 2025 against the national trend.

## Strongest Dimensions

- **Systemic Thinking (4.0/5, 75/100).** Consistent 4s across all five subdimensions. Root-cause orientation, long-horizon planning, cross-system mapping, structurally risky public positions, and multistate coalition work.
- **Awareness (3.8/5, 70/100).** Independent auditor, independent prison inspector general, federally mandated disability advocacy agency, statewide homelessness data system. The detection layer is the best-resourced of any state assessed to date.

## Weakest Dimensions

- **Boundaries (2.4/5, 35/100).** Scope clarity, refusal ethics and workforce sustainability all score 2. California promises broadly and narrows late.
- **Integrity (2.6/5, 40/100).** Consistency under pressure and internal consistency both score 2. The state cut benefits for its least powerful residents and take-home pay for its own workforce in the same fiscal cycle.

## Evidence Gaps

- **Community testimony is thin at tier 5.** Most evidence here is tier 4 institutional and journalistic reporting. Direct, systematic testimony from Medi-Cal disenrollees, FAIR Plan claimants and homelessness programme participants would sharpen E1, E4, AB5 and B4.
- **Child welfare evidence is partial.** The strongest available 2025 audit examined Alameda County, not the statewide system. AC1 and AC5 carry medium confidence as a result.
- **Prop 1 outcome data does not yet exist.** Bed and slot counts are outputs. Whether people got better is unmeasurable in July 2026, which caps AC3 and S2.
- **No leadership transition inside the window.** California had one governor across 2021–2026, so I5 Resilience of Care could not be tested and is scored conservatively at 3.
- **Band stability.** The composite of 54.4 sits 5.6 points from the nearest band boundary. Sensitivity cases run through `computeCompositeFromDimensions`: raising BND to 3.0 returns 56.3; raising INT to 3.2 returns 56.3; adding 0.5 to every dimension returns 66.9 (Established); subtracting 0.5 returns 41.9. The Functional band is stable against any plausible single-dimension correction.

## Recommended Next Steps

California scores in the **Functional** band. Systems exist across all eight dimensions and several are genuinely sector-leading, but the gap between measurement and correction is large and concentrated in Boundaries and Integrity.

- **Functional/Established**: Consider [Advisory Support](/advisory) to translate benchmark insights into strategic action — specifically on closing the audit-to-correction loop and on scope-clarity practice in benefit programmes facing fiscal contraction.

---

This assessment is based on publicly available information and does not constitute a formal Compassion Benchmark Certified Assessment. For a comprehensive, assessor-led evaluation, visit compassionbenchmark.com/certified-assessments.

## Sources

- California State Auditor, Report 2023-102.1, Homelessness in California — https://www.auditor.ca.gov/reports/2023-102-1/ (2024-04-09)
- California State Auditor, Report 2025-601, State High-Risk Audit Program — https://www.auditor.ca.gov/reports/2025-601/ (2025-12-11)
- California Office of the Inspector General, 2025 Annual Report — https://www.oig.ca.gov/wp-content/uploads/2026/03/2025-Annual-Report.pdf (2026-03)
- CalMatters, Audit: California fails to track its homelessness spending, outcomes — https://calmatters.org/housing/homelessness/2024/04/california-homelessness-spending/ (2024-04-09)
- CalMatters, Newsom proposes to freeze Medi-Cal enrollment for undocumented immigrants — https://calmatters.org/health/2025/05/newsom-freeze-medi-cal-undocumented-immigrants/ (2025-05)
- CalMatters, Newsom to cities: Make certain homeless encampments illegal — https://calmatters.org/housing/homelessness/2025/05/newsom-encampment-sweep-ordinance/ (2025-05)
- CalMatters, California to launch 'historic' reparations office as advocates regroup from 5 Newsom vetoes — https://calmatters.org/justice/2025/10/reparations-what-next-after-newsom-signings/ (2025-10-20)
- CalMatters, California reparations: State will apologize for slavery — https://calmatters.org/politics/capitol/2024/09/california-reparations-slavery-apology/ (2024-09-26)
- CalMatters, Gavin Newsom ordered state workers back to the office. Why he backtracked — https://calmatters.org/politics/2025/07/state-workers-return-to-office/ (2025-07)
- CalMatters commentary, Why California shouldn't weaken its public records law — https://calmatters.org/commentary/2026/07/public-records-law-weaken-california/ (2026-07)
- Public Health Watch, When New California Laws Kicked In, Thousands of Immigrants Dropped or Lost Medicaid Coverage — https://publichealthwatch.org/2026/05/26/california-immigrants-medicaid-healthcare-uninsured/ (2026-05-26)
- UC Berkeley Labor Center, California's Uninsured in 2024 — https://laborcenter.berkeley.edu/californias-uninsured-in-2024/ (2024)
- California Budget & Policy Center, The State of Health Coverage in California — https://calbudgetcenter.org/resources/california-health-coverage-progress-disparities-and-policy-threats/ (2025)
- California Budget & Policy Center, First Look: Governor's Proposed 2026-27 Budget — https://calbudgetcenter.org/resources/first-look-understanding-the-governors-proposed-2026-27-california-budget/ (2026-01-09)
- Legislative Analyst's Office, The 2026-27 Budget: Overview of the Governor's Budget — https://lao.ca.gov/Publications/Report/5101 (2026-01)
- California Health & Human Services, Proposition 1 goes into effect statewide — https://www.chhs.ca.gov/blog/2026/07/02/california-reaches-major-milestone-in-modernizing-behavioral-healthcare-proposition-1-goes-into-effect-statewide/ (2026-07-02)
- Governor of California, Prop 1 exceeding goals — https://www.gov.ca.gov/2026/03/11/ahead-of-schedule-governor-newsoms-prop-1-is-exceeding-goals-to-expand-capacity-and-treatment-statewide-helping-5m-californians/ (2026-03-11)
- Governor of California, CARE Court accountability measures and $291 million award — https://www.gov.ca.gov/2026/03/02/governor-newsom-announces-new-care-court-accountability-measures-to-get-more-chronically-mentally-ill-off-our-streets-awards-291-million-in-funding-for-services-and-housing/ (2026-03-02)
- Governor of California, Drop in unsheltered homelessness — https://www.gov.ca.gov/2026/01/08/california-sees-drop-in-unsheltered-homelessness-bucking-national-trend-and-federal-headwinds/ (2026-01-08)
- Governor of California, San Quentin Learning Center opening — https://www.gov.ca.gov/2026/02/20/governor-newsom-transforms-san-quentin-opens-nation-leading-learning-center/ (2026-02-20)
- Governor of California, Honor Dorm opens, record-low recidivism — https://www.gov.ca.gov/2026/06/30/honor-dorm-opens-as-california-reaches-record-high-rehabilitation-success-record-low-recidivism/ (2026-06-30)
- Governor of California, Housing and affordability reforms signed — https://www.gov.ca.gov/2025/06/30/governor-newsom-signs-into-law-groundbreaking-reforms-to-build-more-housing-affordability/ (2025-06-30)
- Governor of California, Modernizing Conservatorship Law (SB 43) — https://www.gov.ca.gov/2023/10/10/modernizing-conservatorship-law-sb43/ (2023-10-10)
- California Legislature, AB 799 (Luz Rivas) — https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=202320240AB799 (2024-09-19)
- Holland & Knight, California Legislature Enacts Major CEQA Reforms — https://www.hklaw.com/en/insights/publications/2025/07/california-legislature-enacts-major-ceqa-reforms-for-housing-rich (2025-07)
- Insurance Journal, Bill Introduced to Transform the California FAIR Plan — https://www.insurancejournal.com/news/west/2026/02/02/856594.htm (2026-02-02)
- Public Counsel, Report finds California Has Failed in Effort to Reduce Racial Disparities — https://publiccounsel.org/report-california-has-failed-in-effort-to-reduce-racial-disparities-in-services-for-children-with-developmental-disabilities/ (2025)
- Disability Rights California, Differences in Regional Center Spending — https://www.disabilityrightsca.org/publications/differences-in-regional-center-spending (2025)
- Disability Rights California, From Navigation to Transformation — https://www.disabilityrightsca.org/latest-news/from-navigation-to-transformation-addressing-inequities-in-californias-regional-center (2025)
- Disability Rights California, Summary of the Governor's Proposed 2026-27 Budget — https://www.disabilityrightsca.org/latest-news/disability-rights-californias-summary-of-the-governors-proposed-2026-27-budget (2026-01)
- California Department of Developmental Services, Disparity Funds Program — https://www.dds.ca.gov/rc/disparities/disparity-funds-program/program-overview/ (2025)
- Equal Justice Society, ARRT Commends Signing of SB 518 and SB 437 — https://equaljusticesociety.org/2025/10/14/arrt-commends-governor-newsom-on-signing-into-law-historic-reparations-bills-sb-518-and-sb-437/ (2025-10-14)
- Prison Legal News, Court of Appeal Reinstates San Quentin COVID Transfer Lawsuit — https://www.prisonlegalnews.org/news/2023/dec/1/california-court-appeal-reinstates-lawsuit-san-quentin-prisoner-over-botched-transfer-sparked-covid-19-outbreak/ (2023-12-01)
- Human Rights Watch, Opposition to SB 43 — https://www.hrw.org/news/2023/08/07/human-rights-watchs-opposition-sb-43 (2023-08-07)
- California Attorney General, Environmental Justice in Local Land Use Planning (SB 1000) — https://oag.ca.gov/environment/sb1000 (2025)
- CalEPA, Environmental Justice Program — https://calepa.ca.gov/envjustice/ (2025)
- NBC Bay Area, Audit shows Alameda County failing to protect at-risk children — https://www.nbcbayarea.com/news/local/alameda-county-audit-protect-children/3971006/ (2025)
- SEIU Local 1000, California Budget — May Revision — https://www.seiu1000.org/budgetfight/ (2025)
- SoCal Grantmakers, Philanthropy Guide to the Proposed 2026-2027 California Budget — https://socalgrantmakers.org/media/blog/philanthropy-guide-governor-newsoms-proposed-2026-2027-california-budget (2026-01)
- Assemblymember Alex Lee, California Steps Up To Tackle Hunger — https://lee.asmdc.org/press-releases/20260708-california-steps-tackle-hunger-and-counter-federal-cuts-food-assistance (2026-07-08)
- County Welfare Directors Association of California, Federal Updates — https://www.cwda.org/federal-updates (2026)
