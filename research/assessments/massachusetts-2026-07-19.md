---
entity: "Massachusetts"
type: "State"
sector: "Government"
date: "2026-07-19"
composite_score: 59.4
band: "Functional"
scores:
  AWR: 3.8
  EMP: 3.2
  ACT: 3.6
  EQU: 3.6
  BND: 2.4
  ACC: 3.4
  SYS: 3.8
  INT: 3.2
published_index: "us-states"
published_rank: 2
published_composite: 94.4
published_band: "Exemplary"
---

# Compassion Benchmark Assessment: Commonwealth of Massachusetts

**Entity type:** State
**Sector/Domain:** Government
**Assessment date:** 2026-07-19
**Composite score:** 59.4/100
**Band:** Functional (unstable — 0.6 points below the Established boundary)

## Important note on the published score

Massachusetts is currently published at rank 2 with a composite of 94.4 and the band "exemplary." That number is a bulk-import placeholder. It carries `last_assessed: null` and has no evidentiary basis. This assessment is the first evidence-based baseline for Massachusetts. The 35-point drop measures the correction of a data defect, not a decline in how Massachusetts treats people.

## Score Summary

| Dimension | Code | Raw (1-5) | Score (0-100) | Band |
|-----------|------|-----------|---------------|------|
| Awareness | AWR | 3.8 | 70.0 | Established |
| Empathy | EMP | 3.2 | 55.0 | Functional |
| Action | ACT | 3.6 | 65.0 | Established |
| Equity | EQU | 3.6 | 65.0 | Established |
| Boundaries | BND | 2.4 | 35.0 | Developing |
| Accountability | ACC | 3.4 | 60.0 | Functional |
| Systemic Thinking | SYS | 3.8 | 70.0 | Established |
| Integrity | INT | 3.2 | 55.0 | Functional |
| **Composite** | — | — | **59.4** | **Functional** |

Composite verified by running `computeCompositeFromDimensions` from `site/scripts/lib/scoring.mjs` (methodology v1.2). Output: `{"composite":59.4,"band":"Functional","integrationPremium":0}`. Base composite 59.375; standard deviation across dimensions 0.429, so the consistency multiplier is 1.0; all 8 dimensions fall below 4.0, so the weakness factor is 0 and the integration premium is 0.

**Band is unstable.** 59.4 sits 0.6 points below the 60.0 Functional/Established boundary. Sensitivity cases, all run through the scoring function rather than computed by hand:

| Case | Composite | Band |
|------|-----------|------|
| Baseline | 59.4 | Functional |
| BND 2.4 to 3.0 (shelter and Bridgewater remediated) | 61.2 | Established |
| AB3 3 to 2 (Virginia transparency rule rejected) | 58.7 | Functional |
| All dimensions minus 0.2 | 54.4 | Functional |
| All dimensions plus 0.2 | 64.4 | Established |

A single improvement in Boundaries alone moves Massachusetts into Established. Treat the band as provisional.

## Dimension Details

### AWR: Awareness (Score: 70/100)

| Subdimension | Score | Evidence | Source |
|-------------|-------|----------|--------|
| A1 Suffering Detection | 4/5 | Biennial Massachusetts Health Insurance Survey by the independent Center for Health Information and Analysis; Community Behavioral Health Centers reported serving more than 112,000 unique members by September 2025. Offset: the state's own finding that "DCF Does Not Report All Critical Incidents Affecting Children in Its Care to the Office of the Child Advocate." | [CHIA](https://www.chiamass.gov/massachusetts-health-insurance-survey/); [CPBHAC 2025-09-15](https://www.mass.gov/doc/cpbhac-presentation-september-15-2025-0/download); [Mass.gov](https://www.mass.gov/info-details/dcf-does-not-report-all-critical-incidents-affecting-children-in-its-care-to-the-office-of-the-child-advocate) |
| A2 Contextual Sensitivity | 4/5 | Behavioral Health Help Line runs 365 days a year "in over 200 languages"; the 2023 data equity law requires agencies to break race data down "by every major Asian, Pacific Islander, Black and African American, Latino, and white or Caucasian subgroup"; the HERO Act addresses veterans. | [Roadmap](https://www.mass.gov/roadmap-for-behavioral-health-reform); [Mass.gov](https://www.mass.gov/info-details/disaggregating-data-and-assessing-inequities) |
| A3 Blind Spot Mitigation | 4/5 | The State Auditor found hospital financial conditions "not appropriately monitored," including at Steward facilities, and a new hospital oversight law followed. A Boston Globe investigation into group homes produced what officials called the most comprehensive revision of group home regulations in 30 years. | [State Auditor](https://www.mass.gov/news/audit-reveals-financial-conditions-not-appropriately-monitored-at-hospitals-including-steward-facilities); [Healthcare Dive 2025-01-09](https://www.healthcaredive.com/news/after-steward-crisis-new-massachusetts-law-strengthen-oversight-hospitals/736945/); [Globe 2025-11-12](https://www.bostonglobe.com/2025/11/12/metro/massachusetts-dcf-group-homes-abuse-children/) |
| A4 Signal Amplification | 4/5 | The Office of the Child Advocate is a statutory body that publishes fatality reviews naming state failure, including the A'zella Ortiz report. A state portal to report ICE misconduct launched in 2026. Offset: departing child advocate faced public "debate over watchdog's toughness." | [Boston 25 2025-12](https://www.boston25news.com/news/local/mass-dcf-missed-warning-signs-child-suffered-chronic-neglect-before-death-report-says/YRZ7NHY3MZHPZMDG7N4BXOTFRM/); [Mass.gov](https://www.mass.gov/news/governor-healey-and-attorney-general-campbell-launch-state-portal-to-report-ice-misconduct); [Globe 2025-12-30](https://www.bostonglobe.com/2025/12/30/metro/massachusetts-child-advocate-mossaides-dcf-children/) |
| A5 Anticipatory Awareness | 3/5 | ResilientMass Metrics track resilience gaps and direct resources; annual Climate Report Card published. But the Spotlight investigation showed regulators missed years of Steward warning signs, and the shelter capacity crisis was not anticipated. | [ResilientMass](https://www.mass.gov/info-details/resilientmass-metrics); [Globe Spotlight 2024-09](https://apps.bostonglobe.com/metro/investigations/spotlight/2024/09/steward-hospitals/regulators/) |

### EMP: Empathy (Score: 55/100)

| Subdimension | Score | Evidence | Source |
|-------------|-------|----------|--------|
| E1 Affective Resonance | 3/5 | Crisis teams delivered more than 66,000 crisis evaluations to over 38,000 people. Against that: Bridgewater houses "nearly 250 men with serious mental health conditions living in a crumbling, filthy facility," and advocates say shelter policy left "families sleeping in their cars or being sent to hospital emergency rooms for the night." | [CPBHAC](https://www.mass.gov/doc/cpbhac-presentation-september-15-2025-0/download); [Globe 2026-03-12](https://www.bostonglobe.com/2026/03/12/metro/bridgewater-corrections-mental-health-massachusetts-prison/); [WBUR 2026-03-11](https://www.wbur.org/news/2026/03/11/massachusetts-shelter-system-more-cuts-restrictions-hearing) |
| E2 Perspective-Taking | 3/5 | The 2024 maternal health law expanded midwifery, birth centres and doulas after sustained advocacy by affected communities. But lawmakers of both parties objected that shelter cuts left "half the beds empty while some homeless families were turned away," and the policy proceeded. | [Mass.gov 2024-08-22](https://www.mass.gov/news/governor-healey-signs-maternal-health-bill-expanding-access-to-midwifery-birth-centers-and-doulas-in-massachusetts); [WBUR 2026-03-11](https://www.wbur.org/news/2026/03/11/massachusetts-shelter-system-more-cuts-restrictions-hearing) |
| E3 Non-Judgment | 3/5 | Massachusetts has strong disaggregated data and a court-commissioned Harvard study. That study found Black people "imprisoned at a rate 7.9 times that of white people." Disparities widened after the 2018 reforms, and DCF racial disparities are worsening as of February 2026. | [Harvard Law 2020-09-09](https://hls.harvard.edu/wp-content/uploads/2022/08/Massachusetts-Racial-Disparity-Report-FINAL.pdf); [Globe 2026-02-06](https://www.bostonglobe.com/2026/02/06/metro/dcf-massachusetts-children/); [PLN 2024-08-15](https://www.prisonlegalnews.org/news/2024/aug/15/massachusetts-prison-closure-reflects-success-criminal-justice-reforms/) |
| E4 Validation | 3/5 | Massachusetts paid $56 million to Holyoke families. But the Disability Law Center has found unlawful practices persisting at Bridgewater across four years of reports, and the Globe found "a pattern of child sexual abuse at Mass. group homes." | [WBUR 2022-05-12](https://www.wbur.org/news/2022/05/12/holyoke-soldiers-home-settlement-baker-covid-outbreak); [DLC 2025-02-06](https://www.dlc-ma.org/2025/02/06/disability-law-center-finds-unlawful-violent-practices-and-unsafe-environmental-conditions-persist-at-bridgewater-state-hospital/); [Globe 2026-04-27](https://www.bostonglobe.com/2026/04/27/metro/massachusetts-group-homes-child-sexual-abuse-residential-facilities-dcf/) |
| E5 Cultural Empathy | 4/5 | MassHealth covers doula services through 12 months postpartum, and enrolment ran at three times the state's own target. The data equity law is described as "the most expansive data equity policy in the nation." | [Mass.gov](https://www.mass.gov/news/masshealth-announces-coverage-of-doula-services); [Berkshire Eagle 2024-12-20](https://www.berkshireeagle.com/news/local/masshealth-doula-program-marks-one-year-milestone/article_e297693e-bcb7-11ef-b75e-933bae7d332b.html) |

### ACT: Action (Score: 65/100)

| Subdimension | Score | Evidence | Source |
|-------------|-------|----------|--------|
| AC1 Responsiveness | 4/5 | 27 Community Behavioral Health Centers opened in 2023 "covering every city and town throughout the Commonwealth," delivering over 1.4 million outpatient visits. The MBTA eliminated all subway slow zones by December 2024. | [Roadmap](https://www.mass.gov/roadmap-for-behavioral-health-reform); [Bay State Banner 2024-12-31](https://www.baystatebanner.com/2024/12/31/mbta-announces-elimination-of-all-subway-slow-zones/) |
| AC2 Proportionality | 3/5 | The Student Opportunity Act directs money to the highest-need districts. But the shelter system ran "at roughly half capacity while some families still could not access shelter," and the FY2027 budget proposes cuts to Adult Foster Care, Personal Care Attendant and Adult Day Health. | [DESE](https://www.doe.mass.edu/soa/); [WBUR 2026-03-11](https://www.wbur.org/news/2026/03/11/massachusetts-shelter-system-more-cuts-restrictions-hearing); [Arc of Mass 2026-01-28](https://thearcofmass.org/post/the-arcs-initial-response-governor-healey-releases-fy27-budget-proposal/) |
| AC3 Efficacy | 4/5 | The FTA gave the state rail oversight body a favorable review after previously citing major lapses. MCI-Concord closed on population data. Massachusetts recorded its "largest single-year decline in opioid-related overdose deaths in two decades." | [Mass.gov](https://www.mass.gov/news/dpu-receives-favorable-report-on-rail-safety-management-from-the-fta); [GBH 2024-07-18](https://www.wgbh.org/news/local/2024-07-18/mci-concord-closes-after-nearly-150-years); [MedicalXpress 2024-06](https://medicalxpress.com/news/2024-06-massachusetts-largest-year-decline-opioid.html) |
| AC4 Resource Mobilization | 4/5 | Fair Share revenue exceeded $3 billion in the first ten months of FY2026, up 20 percent. Nearly 100,000 housing units are under development a year after the Affordable Homes Act. Offset: only 44.2 percent of the Act's $5.16 billion had been budgeted at the two-year mark. | [Raise Up MA 2026-05](https://www.raiseupma.org/news/dor-fair-share-revenue-up-20-over-first-10-months-of-fy26-already-exceeding-3-billion); [Mass.gov 2025-08-06](https://www.mass.gov/news/one-year-after-signing-affordable-homes-act-nearly-100000-new-housing-units-under-development-to-lower-costs-in-massachusetts); [MassBudget 2025-11-19](https://massbudget.org/2025/11/19/aha-at-one-year/) |
| AC5 Follow-Through | 3/5 | Sustained multi-year delivery on the MBTA track programme and HERO Act implementation. But "528 families [were] forced to leave shelters after reaching the six-month time limit between July and December" 2025. | [MBTA](https://www.mbta.com/projects/track-improvement-program); [WBUR 2026-03-11](https://www.wbur.org/news/2026/03/11/massachusetts-shelter-system-more-cuts-restrictions-hearing) |

### EQU: Equity (Score: 65/100)

| Subdimension | Score | Evidence | Source |
|-------------|-------|----------|--------|
| EQ1 Universality | 4/5 | Uninsured rate of 2.1 percent against 8.2 percent nationally; universal free school meals and free community college funded by the surtax. Capped at 4 because 2025 shelter rules condition access on "proof of legal status in the U.S." | [Greenfield Recorder 2025-12-24](https://recorder.com/2025/12/24/massachusetts-health-insurance-challenges/); [MassBudget](https://massbudget.org/fairshare/); [EA policy FAQ](https://www.mass.gov/doc/ea-family-shelter-policy-faq/download) |
| EQ2 Priority for Vulnerable | 3/5 | The Student Opportunity Act is a documented prioritisation framework. But under fiscal pressure the state shrank shelter capacity toward 3,200 units while turning families away, as homelessness rose 53 percent in a year to about 29,300. | [WBUR 2026-03-11](https://www.wbur.org/news/2026/03/11/massachusetts-shelter-system-more-cuts-restrictions-hearing); [Globe 2025-01-02](https://www.bostonglobe.com/2025/01/02/data/massachusetts-homeless-population-charts/) |
| EQ3 Bias Awareness | 3/5 | Disparities are measured in detail. Correction lags: on the data equity law, "over two years since the law's passage, there has been little progress." Black women's C-section rate rose from 31 percent in 2019 to 39 percent in 2024. | [CommonWealth Beacon](https://commonwealthbeacon.org/opinion/massachusetts-lagging-on-implementation-of-data-equity-policy/); [Globe 2026-04-03](https://www.bostonglobe.com/2026/04/03/metro/birth-massachusetts-falling-rates-rising-risks-racial-divides/) |
| EQ4 Access Design | 4/5 | A 24/7 free multilingual help line plus behavioral health centres in every municipality; free school meals; ranked first nationally for health care affordability and access. | [Roadmap](https://www.mass.gov/roadmap-for-behavioral-health-reform); [Mass.gov](https://www.mass.gov/news/massachusetts-ranks-1-for-health-care-affordability-and-access) |
| EQ5 Historical Harm Acknowledgment | 4/5 | For the Holyoke Soldiers' Home deaths the state settled at $56 million with a minimum of $400,000 per deceased veteran's estate, then required both veterans homes to obtain DPH licensure and passed the HERO Act. Criminal accountability failed: charges were dismissed. | [WBUR 2022-05-12](https://www.wbur.org/news/2022/05/12/holyoke-soldiers-home-settlement-baker-covid-outbreak); [Berkshire Eagle 2024-08-08](https://www.berkshireeagle.com/state/gov-maura-healey-signs-the-hero-act-into-law-heres-what-it-means-for-massachusetts-veterans/article_58f8e86c-581a-11ef-8f95-0759fb63278f.html); [WAMC 2024-03-27](https://www.wamc.org/news/2024-03-27/criminal-cases-settled-in-covid-19-outbreak-that-killed-76-at-holyoke-soldiers-home) |

### BND: Boundaries (Score: 35/100)

| Subdimension | Score | Evidence | Source |
|-------------|-------|----------|--------|
| B1 Self-Sustainability | 3/5 | "Social workers have quit DCF in droves." Turnover is at least tracked and published monthly. Correctional vacancies fell 48 percent after the MCI-Concord closure. | [Globe 2024-11-19](https://www.bostonglobe.com/2024/11/19/metro/dcf-foster-children-parents-massachusetts/); [Mass Legal Services](https://www.masslegalservices.org/content/dcf-monthly-caseload-staffing-report) |
| B2 Autonomy Preservation | 3/5 | Free community college and universal school meals continued into FY2026; housing production builds long-run capacity. No published measurement of autonomy outcomes. | [MassBudget](https://massbudget.org/fairshare/); [Mass.gov 2025-08-06](https://www.mass.gov/news/one-year-after-signing-affordable-homes-act-nearly-100000-new-housing-units-under-development-to-lower-costs-in-massachusetts) |
| B3 Scope Clarity | 2/5 | Massachusetts promised shelter as a legal right from 1983, then halted the guarantee. Families discovered the limit after arriving and relying on it. A class action followed. | [NPQ 2023-11](https://nonprofitquarterly.org/massachusetts-governor-halts-decades-old-right-to-shelter-for-homeless-families/); [Lawyers for Civil Rights](https://lawyersforcivilrights.org/our-impact/housing/right-to-shelter-lawsuit-filed-in-massachusetts/) |
| B4 Refusal Ethics | 2/5 | Families are refused and put on a waitlist. Overflow stays are capped at five days, and those who use them "are ineligible to be placed on the waitlist for longer-term placements until six months after their stay" — a refusal that carries a penalty rather than an alternative. | [WBUR 2025-02-13](https://www.wbur.org/news/2025/02/13/massachusetts-senate-shelter-funding-restrictions); [NBC Boston 2023-10-31](https://www.nbcboston.com/news/local/massachusetts-to-begin-denying-shelter-beds-to-homeless-families-putting-names-on-a-waitlist/3185170/) |
| B5 Consent Orientation | 2/5 | At Bridgewater, staff used forced medication as restraint "on 299 occasions" in six months, up 62 percent, and the circumstances "didn't always meet the legal standards." Separately, prison officials were sued for evading solitary confinement limits. | [Globe 2026-03-12](https://www.bostonglobe.com/2026/03/12/metro/bridgewater-corrections-mental-health-massachusetts-prison/); [DLC 2025-02-06](https://www.dlc-ma.org/2025/02/06/disability-law-center-finds-unlawful-violent-practices-and-unsafe-environmental-conditions-persist-at-bridgewater-state-hospital/); [PLS](https://plsma.org/state-prison-officials-sued-again-for-evading-laws-that-restrict-solitary-confinement/) |

### ACC: Accountability (Score: 60/100)

| Subdimension | Score | Evidence | Source |
|-------------|-------|----------|--------|
| AB1 Harm Acknowledgment | 3/5 | The state settled Holyoke for $56 million and its own Auditor documented the Steward regulatory failure. But on Steward "the state took no legal action to hold Steward accountable for past violations." | [WBUR 2022-05-12](https://www.wbur.org/news/2022/05/12/holyoke-soldiers-home-settlement-baker-covid-outbreak); [Petrie-Flom 2024-11-22](https://petrieflom.law.harvard.edu/2024/11/22/a-health-care-betrayal-the-ethical-crisis-surrounding-steward-health-and-the-demise-of-community-hospitals/) |
| AB2 Correction Willingness | 4/5 | A documented pattern of major course corrections: the MBTA Track Improvement Program was created "in direct response to the FTA's Safety Management Inspection"; a new hospital oversight law followed Steward; group home regulations were rewritten after journalism. | [MBTA](https://www.mbta.com/quality-compliance-oversight/fta-safety-management-inspection-response); [Healthcare Dive 2025-01-09](https://www.healthcaredive.com/news/after-steward-crisis-new-massachusetts-law-strengthen-oversight-hospitals/736945/); [Globe 2025-11-12](https://www.bostonglobe.com/2025/11/12/metro/massachusetts-dcf-group-homes-abuse-children/) |
| AB3 Transparency | 3/5 | Massachusetts is "the only state in the country where the governor, Legislature, and judiciary all claim to be completely exempt" from the public records law, and the Auditor had to sue to enforce a voter-approved audit. Held at 3 rather than 2 because the Auditor and Inspector General still publish damaging findings, including the IG's "opaque, chaotic and deeply flawed" sheriffs report. See the cross-state consistency test below. | [Globe 2025-03-17](https://www.bostonglobe.com/2025/03/17/metro/massachusetts-legislature-public-records-survey-exempt/); [Globe 2026-02-10](https://www.bostonglobe.com/2026/02/10/metro/dizoglio-audit-massachusetts-state-legislature/); [WBUR 2026-02-27](https://www.wbur.org/news/2026/02/27/massachusetts-sheriffs-budget-opaque-legislature) |
| AB4 Systemic Learning | 4/5 | Three or more practices changed because of failure analysis: the child welfare bill "updates the state's child fatality review process"; both veterans homes obtained DPH licensure after Holyoke; the MBTA replaced 248,000 feet of track under a corrective action plan. | [WAMC 2025-10-28](https://www.wamc.org/news/2025-10-28/massachusetts-house-passes-reform-bill-to-address-gaps-failures-in-state-child-welfare-oversight); [Berkshire Eagle 2024-08-08](https://www.berkshireeagle.com/state/gov-maura-healey-signs-the-hero-act-into-law-heres-what-it-means-for-massachusetts-veterans/article_58f8e86c-581a-11ef-8f95-0759fb63278f.html); [MBTA](https://www.mbta.com/projects/track-improvement-program) |
| AB5 Reparative Action | 3/5 | Substantial money repair at Holyoke plus increased veteran annuities. Families did not get criminal accountability: "a Massachusetts judge cited no reasonably trustworthy evidence and dismissed charges for both." | [WBUR 2022-05-12](https://www.wbur.org/news/2022/05/12/holyoke-soldiers-home-settlement-baker-covid-outbreak); [WAMC 2024-03-27](https://www.wamc.org/news/2024-03-27/criminal-cases-settled-in-covid-19-outbreak-that-killed-76-at-holyoke-soldiers-home) |

### SYS: Systemic Thinking (Score: 70/100)

| Subdimension | Score | Evidence | Source |
|-------------|-------|----------|--------|
| S1 Root Cause Orientation | 4/5 | The Fair Share Amendment "constitutionally dedicates the funds to be spent on transportation and public education" — a permanent upstream revenue stream. Behavioral health reform and 100,000 housing units in development target causes rather than symptoms. | [MassBudget](https://massbudget.org/fairshare/); [Roadmap](https://www.mass.gov/roadmap-for-behavioral-health-reform); [Mass.gov 2025-08-06](https://www.mass.gov/news/one-year-after-signing-affordable-homes-act-nearly-100000-new-housing-units-under-development-to-lower-costs-in-massachusetts) |
| S2 Long-Term Impact | 4/5 | ResilientMass runs a public action tracker with a five-year update cycle and 2028 refresh; an annual Climate Report Card measures progress; the Student Opportunity Act runs a seven-year funding ramp to FY2027. | [Climate Report Card](https://www.mass.gov/info-details/2025-massachusetts-climate-report-card); [Action Tracker](https://resilient.mass.gov/actiontracker); [MTF](https://www.masstaxpayers.org/student-opportunity-act-implementation-3-year-progress-report) |
| S3 Interconnection Awareness | 3/5 | The state coordinated across agencies to move five Steward hospitals to new operators. But it did not prevent a foreseeable cross-system effect: shelter restrictions pushed families into hospital emergency rooms. | [Mass.gov](https://www.mass.gov/steward-health-care-transitions); [WBUR 2026-03-11](https://www.wbur.org/news/2026/03/11/massachusetts-shelter-system-more-cuts-restrictions-hearing) |
| S4 Structural Critique | 4/5 | The state took public positions carrying real institutional risk: an executive order and bill to keep federal immigration enforcement out of schools, hospitals, courthouses and places of worship, against a backdrop of 614 courthouse immigration arrests in 2025, up from 282 in 2024. The Fair Share Amendment restructured the state's own revenue base. | [Mass.gov 2026-01-29](https://www.mass.gov/news/governor-healey-takes-action-to-keep-ice-out-of-schools-hospitals-courthouses-and-places-of-worship); [Globe 2026-03-26](https://www.bostonglobe.com/2026/03/26/metro/ice-immigration-massachusetts-courthouses/) |
| S5 Coalitional Compassion | 4/5 | The Municipal Vulnerability Preparedness program shares state resources with small municipalities, and the ECO One Stop consolidated seven grant programs in January 2026 "to simplify access to funding and reduce administrative burdens for municipalities." | [MVP](https://www.mass.gov/municipal-vulnerability-preparedness-mvp-program); [ResilientMass](https://www.mass.gov/info-details/resilientmass-metrics) |

### INT: Integrity (Score: 55/100)

| Subdimension | Score | Evidence | Source |
|-------------|-------|----------|--------|
| I1 Consistency Under Pressure | 3/5 | Massachusetts bore real cost before retreating: a $425 million supplemental shelter budget, and a costly stance against federal immigration enforcement. But it did halt a 42-year statutory guarantee under fiscal pressure. | [Providers' Council 2025-02-27](https://providers.org/news-article/govenor-maura-healey-signs-425-million-supplemental-ea-shelter-budget/); [GBH 2026-01-29](https://www.wgbh.org/news/local/2026-01-29/healey-seeks-to-limit-courthouse-immigration-arrests-cooperation-with-ice); [NPQ 2023-11](https://nonprofitquarterly.org/massachusetts-governor-halts-decades-old-right-to-shelter-for-homeless-families/) |
| I2 Non-Performance | 4/5 | The state publishes findings that damage itself with no reputational upside: the child advocate's report that "DCF did not adjust its approach" before a child's death, and the IG's finding of a $110 million sheriffs deficit against more than $725 million budgeted. | [Boston 25 2025-12](https://www.boston25news.com/news/local/mass-dcf-missed-warning-signs-child-suffered-chronic-neglect-before-death-report-says/YRZ7NHY3MZHPZMDG7N4BXOTFRM/); [WBUR 2026-02-27](https://www.wbur.org/news/2026/02/27/massachusetts-sheriffs-budget-opaque-legislature) |
| I3 Internal Consistency | 3/5 | DCF caseworker turnover "spiked since the COVID pandemic." At Bridgewater, a corporate restructuring left "same staff, same problems," meaning the state changed the contractor's name without changing the working conditions. | [Globe 2024-11-19](https://www.bostonglobe.com/2024/11/19/metro/dcf-foster-children-parents-massachusetts/); [Globe 2026-03-12](https://www.bostonglobe.com/2026/03/12/metro/bridgewater-corrections-mental-health-massachusetts-prison/) |
| I4 Values Alignment | 2/5 | Voters gave the Auditor power to audit the Legislature by 72 percent; legislative leaders refused, and she sued them in 2026. Only 12 percent of legislators say they should be covered by the public records law. Decisions contradict stated values and the contradiction is defended rather than acknowledged. | [Globe 2026-02-10](https://www.bostonglobe.com/2026/02/10/metro/dizoglio-audit-massachusetts-state-legislature/); [Globe 2025-03-17](https://www.bostonglobe.com/2025/03/17/metro/massachusetts-legislature-public-records-survey-exempt/); [Globe 2026-03-04](https://www.bostonglobe.com/2026/03/04/metro/massachusetts-public-records-law/) |
| I5 Resilience of Care | 4/5 | Near-universal health coverage has survived four governors of both parties across two decades. The Student Opportunity Act ramp survived a change of administration. Marked down from 5 because the right-to-shelter guarantee, in place since 1983, did degrade. | [Greenfield Recorder 2025-12-24](https://recorder.com/2025/12/24/massachusetts-health-insurance-challenges/); [DESE](https://www.doe.mass.edu/soa/); [MGL c.23B s.30](https://malegislature.gov/Laws/GeneralLaws/PartI/TitleII/Chapter23B/Section30) |

## Cross-state consistency test: the AB3 transparency rule

The Virginia assessment (2026-07-19) proposed a rule: where a broad executive or legislative records exemption sits alongside an independently funded body publishing damaging findings, cap AB3 Transparency at 3 rather than flooring it at 2. Massachusetts is the decisive test, because its exemptions are the widest in the country while its Auditor and Inspector General are unusually active.

**Finding: the rule holds, with one rider.**

On exemption breadth alone Massachusetts would score 2. It is the only state where all three branches claim complete exemption from the public records law. The Globe found "loopholes, delays, poor enforcement" across what remains.

But the oversight bodies are not decorative. Within eighteen months, the State Auditor published a finding that hospital financial conditions were not properly monitored, including at Steward, and the Inspector General published a report calling the sheriffs' budget process "opaque, chaotic and deeply flawed," with a $110 million deficit against more than $725 million budgeted. Nobody compelled either disclosure. That output meets the anchor-3 standard of at least one report disclosing an unflattering finding, and clearly exceeds anchor 2, where failures surface only when the law requires it.

**The rider Massachusetts adds:** the Legislature is actively obstructing the very body the rule depends on. Voters granted legislative audit authority by 72 percent in 2024, and the Auditor still had to sue legislative leaders in February 2026. The rule should be adopted benchmark-wide with this amendment: the cap of 3 applies only while the oversight body is still producing published findings. If obstruction reduces that output to nothing, the floor of 2 becomes correct again. In Massachusetts the obstruction has not yet stopped output, so 3 stands.

**Scoring effect:** AB3 at 3 rather than 2 raises ACC from 3.2 to 3.4 and the composite from 58.7 to 59.4, a difference of 0.7 points. Both values sit in the Functional band, so the rule matters for the score but does not decide the band.

## Published Index Comparison

**Published index:** us-states | **Published rank:** #2 of 21 listed | **Published composite:** 94.4/100 | **Published band:** Exemplary

| Dimension | Published (raw) | Published (scaled) | Research Score | Difference | Explanation |
|-----------|----------------|-------------------|---------------|------------|-------------|
| AWR | 4.5 | 87.5 | 70.0 | -17.5 | Placeholder. Real detection infrastructure is strong but the state's own findings show DCF underreporting critical incidents and regulators missing Steward for years. |
| EMP | 4.5 | 87.5 | 55.0 | -32.5 | Placeholder. Bridgewater conditions and widening racial disparities in DCF and incarceration are inconsistent with an exemplary empathy score. |
| ACT | 4.5 | 87.5 | 65.0 | -22.5 | Placeholder. Delivery is genuinely strong on transit, behavioral health and opioids, but shelter proportionality and follow-through fail. |
| EQU | 4.0 | 75.0 | 65.0 | -10.0 | Placeholder. Closest of the eight. Near-universal coverage is real; shelter eligibility rules and lagging data-equity implementation pull it down. |
| BND | 4.5 | 87.5 | 35.0 | -52.5 | Placeholder. The largest gap. Refusal ethics, scope clarity and consent are the state's weakest area by a wide margin. |
| ACC | 4.0 | 75.0 | 60.0 | -15.0 | Placeholder. Correction and systemic learning are strong; transparency is structurally constrained. |
| SYS | 4.5 | 87.5 | 70.0 | -17.5 | Placeholder. Genuinely strong; the closest the published number comes to being defensible. |
| INT | 4.5 | 87.5 | 55.0 | -32.5 | Placeholder. The right-to-shelter reversal and the legislative audit standoff are direct integrity failures. |
| **Composite** | — | **94.4** | **59.4** | **-35.0** | Correction of a data defect, not a decline. |

### Score Difference Analysis

Every dimension differs by more than 10 points, so no per-dimension forensic comparison is meaningful. The published record was never derived from evidence. It carries `last_assessed: null`, and it came from a bulk import whose rank column is itself an artifact of a broken legacy extraction that lost 30 of 51 jurisdictions.

The substantive point is where Massachusetts actually lands. At 59.4 it is near the top of the 17 states assessed at full depth — above New York at 56.9, below Illinois at 60.0 and New Jersey at 60.6. That is a defensible position for a state with the lowest uninsured rate in the country, a constitutionally dedicated upstream revenue stream, and behavioral health infrastructure in every municipality, but which also ended its right-to-shelter guarantee, cannot subject three branches of its own government to its public records law, and holds people in a facility where forced medication rose 62 percent in six months.

The published score was not merely too high. It described a different state.

### Recommendation

The published score is unsupportable and should be replaced with 59.4, band Functional, rank null. The rank of 2 must not be carried forward under any circumstances; the index contains only 21 of 51 jurisdictions and its rank column is not a national rank.

## Key Findings

- **Massachusetts covers more of its people than any other state, and that is its single strongest fact.** The uninsured rate is 2.1 percent against 8.2 percent nationally, per the state's independent health data agency in December 2025. Universal free school meals and free community college run on a constitutionally dedicated surtax that raised over $3 billion in ten months.

- **The state stopped keeping its most famous promise.** Massachusetts was the first state to make shelter a legal right, in 1983. It halted that guarantee, and by March 2026 planned to shrink family shelter to about 3,200 units. Lawmakers from both parties noted half the beds were empty while families were still turned away. Between July and December 2025, 528 families were forced out at the six-month limit.

- **Massachusetts cannot inspect its own government.** It is the only state where the governor, Legislature and judiciary all claim complete exemption from the public records law. Voters ordered a legislative audit by 72 percent in 2024; leaders refused, and the State Auditor had to sue them in February 2026. Only 12 percent of legislators say the records law should apply to them.

- **When outside bodies force the issue, Massachusetts does fix things.** Federal regulators cited major MBTA safety lapses; the state replaced 248,000 feet of track, cleared every subway slow zone by December 2024, and earned a favorable federal review. Steward's collapse produced a new hospital oversight law. A newspaper investigation produced the biggest rewrite of group home rules in 30 years.

- **The worst treatment goes to people the state holds in custody.** At Bridgewater State Hospital, staff used forced medication as restraint 299 times in six months, a 62 percent rise, and the state's federally designated disability watchdog found the legal standard was not always met. A corporate restructuring left "same staff, same problems."

## Strongest Dimensions

- **Awareness (70) and Systemic Thinking (70).** Massachusetts measures itself thoroughly and plans past the budget cycle. The Fair Share Amendment, ResilientMass with a public action tracker, and the Student Opportunity Act's seven-year ramp are all structural, long-horizon commitments rather than gestures.
- **Action (65) and Equity (65).** Delivery infrastructure is real and measurable: behavioral health centres in every municipality, a 24/7 helpline in over 200 languages, the largest single-year drop in opioid deaths in two decades.

## Weakest Dimensions

- **Boundaries (35), by a wide margin.** This is the only dimension in the Developing band. Refusing shelter and then barring the refused family from the waitlist for six months is a refusal with a penalty attached, not a refusal with an alternative. Forced medication at Bridgewater is a consent failure at scale.
- **Empathy (55) and Integrity (55).** Racial disparities in incarceration and child welfare are measured, acknowledged, and widening. The legislative audit standoff is a values failure that the Legislature defends rather than concedes.

## Evidence Gaps

- No published state-wide employee turnover or burnout dataset comparable to what other states release, so B1 and I3 rest on agency-specific reporting (mainly DCF) and are scored at medium confidence.
- No direct community testimony was available on whether Holyoke families consider the $56 million settlement adequate repair, which caps AB5 at 3 rather than supporting a 4.
- The 2026 legislative session was still in progress at assessment date. The public records ballot question and the sensitive-locations bill were both pending, so neither is scored as an outcome.
- B2 Autonomy Preservation has no published outcome measurement in Massachusetts; it is scored on program design alone at medium confidence.

## Recommended Next Steps

Massachusetts sits in the **Functional** band, 0.6 points below Established. Consider [Advisory Support](/advisory) to translate these findings into strategic action. The single highest-leverage change is in Boundaries: adopting a refusal protocol that guarantees every turned-away family a concrete alternative, and removing the six-month waitlist penalty, would on its own move the Commonwealth into the Established band.

---

*This assessment is based on publicly available information and does not constitute a formal Compassion Benchmark Certified Assessment. For a comprehensive, assessor-led evaluation, visit compassionbenchmark.com/certified-assessments.*
