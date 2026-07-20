---
entity: "Minnesota"
type: "State"
sector: "Government"
date: "2026-07-19"
composite_score: 46.9
band: "Functional"
scores:
  AWR: 3.4
  EMP: 2.8
  ACT: 2.6
  EQU: 3.2
  BND: 2.4
  ACC: 2.6
  SYS: 3.4
  INT: 2.6
published_index: "us-states"
published_rank: 7
published_composite: 84.4
published_band: "Exemplary"
---

# Compassion Benchmark Assessment: Minnesota

**Entity type:** State
**Sector/Domain:** Government (US state government)
**Assessment date:** 2026-07-19
**Composite score:** 46.9/100
**Band:** Functional

## What this assessment is

This is Minnesota's first evidence-based score. The state's existing published score of 84.4 was a bulk-import placeholder with no evidence behind it. It was never researched. This assessment replaces it.

Minnesota is the clearest test case in the US States index of a state with high average wellbeing and severe internal disparity. It passed one of the largest social-policy expansions of any US state in 2023. It also lost hundreds of millions of dollars to fraud in three separate programs, and one of its agencies backdated documents during a state audit. The score reflects both.

## Score Summary

| Dimension | Code | Score | Band |
|-----------|------|-------|------|
| Awareness | AWR | 60.0 | Established |
| Empathy | EMP | 45.0 | Functional |
| Action | ACT | 40.0 | Developing |
| Equity | EQU | 55.0 | Functional |
| Boundaries | BND | 35.0 | Developing |
| Accountability | ACC | 40.0 | Developing |
| Systemic Thinking | SYS | 60.0 | Functional |
| Integrity | INT | 40.0 | Developing |
| **Composite** | — | **46.9** | **Functional** |

Dimension scores above are shown on the 0–100 scale. The raw 1–5 means used by the scoring formula are AWR 3.4, EMP 2.8, ACT 2.6, EQU 3.2, BND 2.4, ACC 2.6, SYS 3.4, INT 2.6.

**Composite verification.** Run through `computeCompositeFromDimensions` in `site/scripts/lib/scoring.mjs`. Output: `{"composite":46.9,"band":"Functional","integrationPremium":0}`. Base composite 46.9. Standard deviation across the 8 dimensions is 0.38, so the consistency multiplier is 1.0. All 8 dimensions fall below 4.0, so the weakness factor is 0 and the integration premium is 0. The composite sits 6.9 points above the Functional band floor and 13.1 points below the Established floor, so the band is stable.

## Dimension Details

### AWR: Awareness (Score: 60/100, raw 3.4)

| Subdimension | Score | Evidence | Source |
|-------------|-------|----------|--------|
| A1 Suffering Detection | 3/5 | Minnesota runs strong disaggregated data infrastructure, including the Minnesota EHR Consortium Health Trends Across Communities dashboard showing health conditions by demographic group and geography. But detection of individual harm reports failed repeatedly. The Office of the Legislative Auditor found the Department of Education received more than 30 complaints about Feeding Our Future between June 2018 and December 2021 and did not act. State regulators found at least 183 reports of suspected child sexual abuse were wrongly routed to Family Assessment since 2015. | [OLA](https://www.auditor.leg.state.mn.us/sreview/2024/mdefof.htm), [MN EHR Consortium](https://mnehrconsortium.org/health-trends-across-communities-minnesota-dashboard), [Star Tribune](https://www.startribune.com/minnesotas-child-protection-system-needs-fixes-legislators-are-starting-with-these-changes/600367517) |
| A2 Contextual Sensitivity | 4/5 | Differentiated structures for at least three distinct populations: the Missing and Murdered Indigenous Relatives Office for Indigenous Minnesotans, the Health Equity Advisory and Leadership Council reporting annually to the Legislature, and driver's licenses available regardless of immigration status since 2023. | [MN DPS](https://dps.mn.gov/divisions/ojp/offices-missing-murdered/mmir-office/about-mmir), [HEAL Council 2025 report](https://www.lrl.mn.gov/docs/2026/mandated/260201.pdf), [Minnesota Reformer](https://minnesotareformer.com/briefs/drivers-licenses-for-all-voting-rights-restoration-bills-clear-final-hurdle-walz-will-sign/) |
| A3 Blind Spot Mitigation | 4/5 | The Office of the Legislative Auditor is an unusually strong within-state independent auditor. It published the damaging Feeding Our Future special review in June 2024, a 72-page audit of Department of Human Services behavioral health grants in January 2026, and a July 2026 finding that the Department of Agriculture certified producers who had not met water quality standards. Findings are heard in legislative committee and have driven structural change. | [OLA special review](https://www.auditor.leg.state.mn.us/sreview/pdf/2024-mdefof.pdf), [MPR News](https://www.mprnews.org/story/2026/01/06/audit-finds-weak-oversight-fraud-risk-in-dhs-grants), [OLA 2026 reports](https://www.auditor.leg.state.mn.us/fad/fdrt2026.htm) |
| A4 Signal Amplification | 4/5 | The 20-person MMIR Advisory Council is made up of victims, family members of victims and subject experts, and advises the MMIR Office director, the Public Safety Commissioner and the Tribal Liaison directly. The Department of Human Rights investigated the Minneapolis Police Department and secured a court-enforceable agreement in 2023. | [MMIR Advisory Council](https://dps.mn.gov/divisions/ojp/offices-missing-murdered/mmir-office/about-mmir/mmir-advisory-council), [MDHR](https://mn.gov/mdhr/mpd/agreement/) |
| A5 Anticipatory Awareness | 2/5 | The Housing Stabilization Services program was forecast at $2.6 million a year when created in 2017 and cost $107 million by 2024, a 41-fold miss with no fraud-risk assessment. KARE 11 reported the Department of Human Services missed or ignored repeated warnings. Paid Leave did use actuarial forecasting by Milliman, projecting 131,868 first-year approvals. | [Minnesota Reformer](https://minnesotareformer.com/briefs/state-shuts-down-100-million-housing-stabilization-program-citing-fraud/), [KARE 11](https://www.kare11.com/article/news/investigations/kare-11-investigates-flying-blind-state-agency-missed-or-ignored-repeated-housing-fraud-warnings/89-795f7dc0-8848-4560-aefa-e91d8f8c033d) |

### EMP: Empathy (Score: 45/100, raw 2.8)

| Subdimension | Score | Evidence | Source |
|-------------|-------|----------|--------|
| E1 Affective Resonance | 3/5 | Paid Leave approved roughly 75,000 of 100,000 applications in its first six months, which is real service at scale. Against that, the state moved to shut the Housing Stabilization Services program with more than 21,000 people relying on it, and reporting describes child protection returning severely abused children to unsafe homes. | [KTTC](https://www.kttc.com/2026/07/07/first-6-months-mn-paid-leave-program-draws-100000-applications/), [KARE 11](https://www.kare11.com/article/news/investigations/kare-11-investigates-minnesota-moves-to-shut-down-housing-stabilization-services-program-amid-widespread-fraud/89-62a186ad-9a48-474a-91b0-576cd54ec021) |
| E2 Perspective-Taking | 3/5 | Formal mechanisms exist. The MMIR Advisory Council and the HEAL Council both advise senior officials and report publicly. Community members advise; they are not decision-makers, which caps this at 3. | [MMIR Advisory Council](https://dps.mn.gov/divisions/ojp/offices-missing-murdered/mmir-office/about-mmir/mmir-advisory-council), [HEAL Council](https://www.lrl.mn.gov/docs/2026/mandated/260201.pdf) |
| E3 Non-Judgment | 3/5 | Minnesota measures and publishes disparities. Its incarcerated population is 39.4 percent Black in a state where Black residents are roughly 7 percent of the population. Of the first 16 people released under the 2023 early-release law, none were Black or Hispanic. The Department of Corrections itself named racial disparities in prison discipline as a likely cause. | [Prison Policy Initiative](https://www.prisonpolicy.org/profiles/MN.html), [KARE 11](https://www.kare11.com/article/news/local/mn-early-release-program-draws-scrutiny-as-rollout-lags-alleged-disparities-emerge/89-2a50a77b-f6ca-475a-befd-8850d8f1efdc) |
| E4 Validation | 2/5 | The Office of the Legislative Auditor found the Department of Education at one point asked Feeding Our Future to investigate complaints about itself, and that some complaints were not looked into at all "despite their frequency and seriousness." KARE 11 found the same pattern at Human Services on housing fraud warnings. People who reported harm were not believed. | [OLA](https://www.auditor.leg.state.mn.us/sreview/2024/mdefof.htm), [CBS Minnesota](https://www.cbsnews.com/minnesota/news/feeding-our-future-legislative-auditor-report-minnesota-department-of-education/) |
| E5 Cultural Empathy | 3/5 | The MMIR Office is a genuine structural change built with Indigenous communities. But on 2025-06-09 the Legislature repealed MinnesotaCare eligibility for undocumented adults, ending coverage for an estimated 16,500 people on 2025-12-31. | [MN DPS](https://dps.mn.gov/divisions/ojp/offices-missing-murdered/mmir-office), [Minnesota Reformer](https://minnesotareformer.com/2025/06/09/legislature-to-repeal-minnesotacare-for-undocumented-adults/), [Minnesota Budget Project](https://mnbudgetproject.org/resource/minnesotas-rollback-of-health-coverage-for-immigrants-will-harm-people-health-care-systems-and-the-economy) |

### ACT: Action (Score: 40/100, raw 2.6)

| Subdimension | Score | Evidence | Source |
|-------------|-------|----------|--------|
| AC1 Responsiveness | 3/5 | Paid Leave publishes running response data: 38,336 applications and 13,706 approvals by 2026-01-31, and roughly 75,000 approvals by mid-year. Against that, two years after the 2023 early-release law passed, only six people had been released. | [KTTC Feb 2026](https://www.kttc.com/2026/02/09/deed-mns-new-paid-leave-program-has-received-more-than-38-thousand-applications/), [Star Tribune](https://www.startribune.com/minnesota-rehabilitative-prison-early-release-program-not-implemented-protests/601488395) |
| AC2 Proportionality | 2/5 | Under budget pressure the state cut long-term care waivers by $275 million, disability services by $280 million, nursing facilities by $68 million and behavioral health by $11 million. It also terminated Housing Stabilization Services outright rather than fixing controls, affecting more than 21,000 people. Risk drove the response, not need. | [MN House Session Daily](https://www.house.mn.gov/sessiondaily/Story/18478), [KARE 11](https://www.kare11.com/article/news/investigations/kare-11-investigates-minnesota-moves-to-shut-down-housing-stabilization-services-program-amid-widespread-fraud/89-62a186ad-9a48-474a-91b0-576cd54ec021) |
| AC3 Efficacy | 3/5 | Outcome data is collected and published: 150 million meals in the first year of universal school meals, annual Department of Corrections performance reports, and OLA evaluations. One program was ended on the evidence, though for fraud rather than for failure to help. | [Governor's Office](https://mn.gov/governor/newsroom/press-releases/?id=1055-650288), [MN DHS](https://mn.gov/dhs/media/news/?id=1053-711321) |
| AC4 Resource Mobilization | 3/5 | The 2023 session mobilized historic new resources, including a payroll-tax-funded paid leave program and statewide free school meals. The 2025 budget then cut $270 million from human services. The three-year trend runs toward need and then away from it. | [MN House](https://www.house.mn.gov/NewLaws/story/2023/5501), [MN House Session Daily](https://www.house.mn.gov/sessiondaily/Story/18767) |
| AC5 Follow-Through | 2/5 | Recommendations from a 2015 state child protection task force, including caseload limits, were never fully implemented. Child mortality reviews "have led to no significant policy changes in recent years." The 2023 early-release law remained largely undelivered two years on. | [Star Tribune](https://www.startribune.com/minnesotas-child-protection-system-needs-fixes-legislators-are-starting-with-these-changes/600367517), [Albert Lea Tribune](https://www.albertleatribune.com/2025/10/two-years-after-law-passed-minnesota-still-lacks-early-prison-release-program/) |

### EQU: Equity (Score: 55/100, raw 3.2)

| Subdimension | Score | Evidence | Source |
|-------------|-------|----------|--------|
| EQ1 Universality | 3/5 | Free school meals reach every public school district plus 167 charter and 163 private schools, with no application required. Driver's licenses are available regardless of immigration status. But an entire population was newly excluded inside the assessment window: undocumented adults lost MinnesotaCare eligibility after 2025-12-31, roughly 16,500 people. | [MDE](https://education.mn.gov/MDE/dse/FNS/SNP/free/), [MN House Session Daily](https://www.house.mn.gov/sessiondaily/Story/18830) |
| EQ2 Priority for Vulnerable | 2/5 | When resources tightened, the largest single cut fell on Medical Assistance long-term care waivers at $275 million, and the immigrant health rollback saved $56.9 million. Under scarcity, resources moved away from the highest-need groups. | [MN House Session Daily](https://www.house.mn.gov/sessiondaily/Story/18478), [MinnPost](https://www.minnpost.com/state-government/2025/06/legislature-with-gop-and-4-dfl-votes-ends-minnesotacare-for-undocumented-adults/) |
| EQ3 Bias Awareness | 4/5 | The Department of Human Rights investigated the Minneapolis Police Department, found a pattern of race-based policing, and secured a court-enforceable agreement approved on 2023-07-13. An independent evaluator now publishes semi-annual progress reports, three as of late 2025. The Department of Corrections identified and named the racial skew in its own early-release pilot. | [MDHR](https://mn.gov/mdhr/mpd/agreement/), [City of Minneapolis](https://www.minneapolismn.gov/resident-services/public-safety/police-public-safety/investigations-settlement-agreement/court-enforceable-settlement-agreement/) |
| EQ4 Access Design | 4/5 | Multiple structural barriers removed with evidence: no-application universal school meals, automatic voter registration tied to driver's licence applications, driver's licences regardless of immigration status, and automatic voting rights restoration on release from prison. | [MDE](https://education.mn.gov/MDE/dse/FNS/SNP/free/), [MN House Session Daily](https://www.house.mn.gov/SessionDaily/Story/13753) |
| EQ5 Historical Harm Acknowledgment | 3/5 | Formal acknowledgment of specific harms with community involvement: the MMIR Office addresses what the state calls a "deeply rooted" epidemic, and 2023 legislation restored voting rights automatically on release. Public attribution of the Black homeownership gap to racial covenants is documented. Reparative substance remains limited relative to the size of the disparities. | [MN DPS](https://dps.mn.gov/divisions/ojp/offices-missing-murdered/mmir-office/about-mmir), [Brennan Center](https://www.brennancenter.org/our-work/research-reports/voting-rights-restoration-efforts-minnesota), [KTTC](https://www.kttc.com/2026/06/17/minnesota-black-homeownership-gap-rooted-racial-covenants/?outputType=amp) |

### BND: Boundaries (Score: 35/100, raw 2.4)

| Subdimension | Score | Evidence | Source |
|-------------|-------|----------|--------|
| B1 Self-Sustainability | 3/5 | Turnover is tracked and published. A state-commissioned Department of Corrections staffing analysis found six facilities above 30 percent correctional officer turnover, with Rush City and Shakopee above 40 percent, and 33 percent of the workforce having under five years of experience. Minnesota Management and Budget publishes workforce planning reports. Tracking is real; the depletion is also real. | [DOC Staffing Analysis](https://www.lrl.mn.gov/docs/2024/other/241275.pdf), [MMB Workforce Planning Report](https://mn.gov/mmb-stat/workforce-reports/2023.pdf) |
| B2 Autonomy Preservation | 2/5 | The 2023 Rehabilitation and Reinvestment Act was designed to build capacity and shorten sentences by up to 17 percent, but produced six releases in two years. Housing Stabilization Services was designed to move people into independent housing and was terminated on 2025-10-31. Autonomy-building is stated and largely undelivered. | [Star Tribune](https://www.startribune.com/minnesota-rehabilitative-prison-early-release-program-not-implemented-protests/601488395), [MN DHS](https://mn.gov/dhs/media/news/?id=1053-711321) |
| B3 Scope Clarity | 2/5 | Roughly a quarter of Paid Leave applications were denied or withdrawn in the first six months, and the Minnesota Chamber of Commerce reported complexity and slow execution two months in. Reporting on the housing program shutdown focused on who would be "left behind," indicating limits were discovered late. | [KTTC](https://www.kttc.com/2026/07/07/first-6-months-mn-paid-leave-program-draws-100000-applications/), [InForum](https://www.inforum.com/news/minnesota/heres-who-could-be-left-behind-if-minnesota-shuts-down-its-housing-stabilization-program), [FOX 9](https://www.fox9.com/news/paid-family-leave-act-strains-minnesota-businesses-chamber-says) |
| B4 Refusal Ethics | 2/5 | Two large-scale withdrawals of service inside twelve months. Housing Stabilization Services ended 2025-10-31 for a client base above 21,000, and MinnesotaCare eligibility ended 2026-01-01 for roughly 16,500 adults. Formal notice was given in both cases. Structured alternatives for the people cut off are not documented at scale. | [MN DHS](https://mn.gov/dhs/media/news/?id=1053-711321), [Immigrant Law Center of Minnesota](https://www.ilcm.org/latest-news/mncare-for-undocumented-minnesotans-update/) |
| B5 Consent Orientation | 3/5 | The Minnesota Government Data Practices Act (Minnesota Statutes Chapter 13) requires notice when government collects private data from an individual, and the Department of Administration runs a Data Practices Office. This is a genuine statewide statutory consent structure. No evidence was found that comprehension is independently verified, so it does not reach 4. Confidence is low. | [Minn. Stat. 13.03](https://www.revisor.mn.gov/statutes/cite/13.03), [MN Data Practices Office](https://mn.gov/admin/data-practices/) |

### ACC: Accountability (Score: 40/100, raw 2.6)

| Subdimension | Score | Evidence | Source |
|-------------|-------|----------|--------|
| AB1 Harm Acknowledgment | 2/5 | Acknowledgment consistently followed external establishment of the harm. The OLA had to establish that the Department of Education "failed to act on warning signs known to the department." KARE 11 had to establish the housing fraud. Most seriously, the January 2026 OLA audit found the Behavioral Health Administration backdated or created documents after the audit began. | [OLA](https://www.auditor.leg.state.mn.us/sreview/2024/mdefof.htm), [CBS Minnesota](https://www.cbsnews.com/minnesota/news/behavioral-health-administration-minnnesota-dhs-audit/) |
| AB2 Correction Willingness | 3/5 | Real course corrections did follow. The Legislature passed an independent Office of Inspector General on 2026-05-11 by 66-0 in the Senate and 127-5 in the House, funded at $11–12 million a year with about 40 staff. The Governor announced a comprehensive anti-fraud package. Human Services terminated the compromised housing program. All of this came under sustained external pressure. | [CBS Minnesota](https://www.cbsnews.com/minnesota/news/minnesota-senate-approves-office-of-inspector-general/), [Governor's Office](https://mn.gov/governor/newsroom/press-releases/?id=1055-727986) |
| AB3 Transparency | 4/5 | The Office of the Legislative Auditor is statutorily independent, publishes unflattering findings on a schedule, and its findings are heard publicly. The January 2026 audit listed 13 separate internal control findings across $426 million in grants. Legislative Auditor Judy Randall publicly named the document fabrication as "frankly unacceptable." Agency-level obstruction is why this is not a 5. | [OLA reports](https://www.auditor.leg.state.mn.us/allreports.htm), [MPR News](https://www.mprnews.org/story/2026/01/06/audit-finds-weak-oversight-fraud-risk-in-dhs-grants) |
| AB4 Systemic Learning | 2/5 | The same failure recurs across agencies and across a decade. Education missed Feeding Our Future complaints from 2018 to 2021. Human Services missed housing fraud warnings through 2025. The Behavioral Health Administration audit covered July 2022 to December 2024. Child protection recommendations from 2015 were never implemented and mortality reviews produced no policy change. In December 2025 the US Attorney estimated fraud in Minnesota-run Medicaid services likely exceeds $9 billion. | [Star Tribune](https://www.startribune.com/minnesotas-child-protection-system-needs-fixes-legislators-are-starting-with-these-changes/600367517), [Minnesota Reformer](https://minnesotareformer.com/2025/12/18/u-s-attorney-fraud-likely-exceeds-9-billion-in-minnesota-run-medicaid-services/) |
| AB5 Reparative Action | 2/5 | Automatic voting rights restoration is genuine repair to a specific harmed group. But no documented repair reached the people harmed by the state's own oversight failures: recovered fraud money returns to state and federal programs, and no compensation or transition package is documented for the 21,000 housing clients or the 16,500 losing coverage. | [Brennan Center](https://www.brennancenter.org/our-work/research-reports/voting-rights-restoration-efforts-minnesota), [Star Tribune](https://www.startribune.com/heres-what-to-know-about-minnesotas-fraud-crisis/601542128) |

### SYS: Systemic Thinking (Score: 60/100, raw 3.4)

| Subdimension | Score | Evidence | Source |
|-------------|-------|----------|--------|
| S1 Root Cause Orientation | 4/5 | The 2023 package is a coherent upstream strategy backed by significant resources: universal school meals serving 150 million meals in year one and saving families about $1,000 per student, up to 20 weeks of paid family and medical leave, driver's licences regardless of status, and automatic voting rights restoration. These address causes, not symptoms. | [Governor's Office](https://mn.gov/governor/newsroom/press-releases/?id=1055-650288), [MN House](https://www.house.mn.gov/NewLaws/story/2023/5501) |
| S2 Long-Term Impact | 3/5 | The One Minnesota Plan sets measurable multi-year goals and Minnesota Management and Budget publishes forward budget outlooks, including the worsening long-term outlook in December 2025 and the improved $3.7 billion balance in February 2026. Long-horizon planning is real; a published 10-year impact model reviewed against outcomes was not found. | [One Minnesota Plan](https://mn.gov/mmb/one-mn-plan/measurable-goals/workforce-shortage.jsp), [MN House Session Daily](https://www.house.mn.gov/SessionDaily/Story/18919) |
| S3 Interconnection Awareness | 3/5 | At least one clear case of identifying an unintended cross-system effect: the Department of Corrections traced low early-release uptake among people of colour to racial disparities in prison discipline. The Medicaid-housing interaction was identified once the program collapsed rather than before. | [KARE 11](https://www.kare11.com/article/news/local/mn-early-release-program-draws-scrutiny-as-rollout-lags-alleged-disparities-emerge/89-2a50a77b-f6ca-475a-befd-8850d8f1efdc), [InForum](https://www.inforum.com/news/minnesota/heres-who-could-be-left-behind-if-minnesota-shuts-down-its-housing-stabilization-program) |
| S4 Structural Critique | 4/5 | The state's own civil rights agency investigated a major municipal police department, found race-based policing, and bound it to a court-enforceable agreement approved on 2023-07-13 with independent monitoring. That is a state agency taking a position with real institutional risk and contributing to structural change. | [MDHR](https://mn.gov/mdhr/mpd/agreement/), [KSTP](https://kstp.com/kstp-news/local-news/judge-to-approve-consent-decree-between-minneapolis-minnesota-department-of-human-rights/) |
| S5 Coalitional Compassion | 3/5 | Active, documented collaboration: the Minnesota EHR Consortium pools health system data into a public equity dashboard, and the MMIR structure links the Department of Public Safety, Indian Affairs and tribal nations. No documented case of ceding leadership or resources to a better-positioned organisation. | [MN EHR Consortium](https://mnehrconsortium.org/health-trends-across-communities-minnesota-dashboard), [MN Indian Affairs](https://mn.gov/indian-affairs/resources/mn-agency-resources/mmiwr-.jsp) |

### INT: Integrity (Score: 40/100, raw 2.6)

| Subdimension | Score | Evidence | Source |
|-------------|-------|----------|--------|
| I1 Consistency Under Pressure | 3/5 | Minnesota launched Paid Leave on schedule on 2026-01-01 through a projected multi-billion-dollar deficit and organised business opposition, which is a real cost borne to keep a commitment. In the same window it abandoned health coverage for 16,500 undocumented adults, a commitment barely two years old, with DFL leadership saying "this one hurt." | [Minnesota Paid Leave](https://paidleave.mn.gov/), [MinnPost](https://www.minnpost.com/state-government/2025/06/legislature-with-gop-and-4-dfl-votes-ends-minnesotacare-for-undocumented-adults/), [KTTC](https://www.kttc.com/2025/06/10/this-one-hurt-dfl-leadership-grapples-with-vote-revoke-healthcare-undocumented-immigrants/) |
| I2 Non-Performance | 3/5 | The state funds and publishes an auditor that produces genuinely unflattering findings about itself, which is compassion practice maintained regardless of visibility. Universal school meals continued through the deficit. But the large anti-fraud response arrived alongside national scrutiny and congressional attention. | [OLA](https://www.auditor.leg.state.mn.us/sreview/pdf/2024-mdefof.pdf), [Star Tribune](https://www.startribune.com/heres-what-to-know-about-minnesotas-fraud-crisis/601542128) |
| I3 Internal Consistency | 2/5 | Internal conditions fall short of external commitments. Two prisons ran above 40 percent officer turnover. The January 2026 audit found a Behavioral Health Administration grant manager approved a payment of nearly $700,000, left the agency days later, and now works for the same grant recipient. | [DOC Staffing Analysis](https://www.lrl.mn.gov/docs/2024/other/241275.pdf), [MPR News](https://www.mprnews.org/story/2026/01/06/audit-finds-weak-oversight-fraud-risk-in-dhs-grants) |
| I4 Values Alignment | 2/5 | A single 2025 budget both removed immigrant health coverage and cut long-term care waivers by $275 million, while the state's stated frame is "One Minnesota" and health equity. A state agency backdating documents during an audit is a direct contradiction of stated values with no acknowledgment at the time. | [Minnesota Reformer](https://minnesotareformer.com/2025/06/09/legislature-to-repeal-minnesotacare-for-undocumented-adults/), [CBS Minnesota](https://www.cbsnews.com/minnesota/news/behavioral-health-administration-minnnesota-dhs-audit/) |
| I5 Resilience of Care | 3/5 | Core practices are embedded in statute rather than in personalities: free school meals, paid leave, the Data Practices Act and the Office of the Legislative Auditor are all statutory. But no gubernatorial transition has occurred in the 2021–2026 window, so structural durability has not been tested. | [MDE](https://education.mn.gov/MDE/dse/FNS/SNP/free/), [Minn. Stat. Ch. 13](https://www.revisor.mn.gov/statutes/cite/13/full), [About OLA](https://www.auditor.leg.state.mn.us/bkgd.htm) |

## Published Index Comparison

**Published index:** US States | **Published rank:** #7 of 21 listed | **Published composite:** 84.4/100 | **Published band:** Exemplary

The published score is a bulk-import placeholder with `last_assessed: null`. It has no evidentiary basis. The comparison below documents a data defect, not institutional decline.

| Dimension | Published (raw) | Published (scaled) | Research Score | Difference | Explanation |
|-----------|----------------|-------------------|---------------|------------|-------------|
| AWR | 4.4 | 85.0 | 60.0 | -25.0 | Strong data infrastructure and a strong auditor, but repeated failure to act on complaints the state already had |
| EMP | 4.4 | 85.0 | 45.0 | -40.0 | An agency asked a suspected fraudster to investigate complaints about itself |
| ACT | 4.4 | 85.0 | 40.0 | -45.0 | Landmark laws passed; delivery lagged badly, most starkly six early releases in two years |
| EQU | 3.8 | 70.0 | 55.0 | -15.0 | Universal access gains offset by removing coverage from 16,500 people and cutting $275M in waivers |
| BND | 4.4 | 85.0 | 35.0 | -50.0 | Two programs withdrawn from more than 37,000 people inside twelve months |
| ACC | 4.4 | 85.0 | 40.0 | -45.0 | The same oversight failure recurred across three agencies and a decade |
| SYS | 4.4 | 85.0 | 60.0 | -25.0 | Genuine upstream strategy, but no published long-horizon impact model |
| INT | 3.8 | 70.0 | 40.0 | -30.0 | A state agency backdated documents during a state audit |
| **Composite** | — | **84.4** | **46.9** | **-37.5** | — |

### Score Difference Analysis

**Every dimension differs by more than 10 points.** That is expected: the published values were never researched. The analysis below explains what an evidence-based reading found.

**Boundaries (-50).** The published 4.4 implies Minnesota reliably tells people what it can do and declines with dignity. Inside twelve months, Minnesota withdrew two services from more than 37,000 people. Housing Stabilization Services ended on 2025-10-31 for a client base above 21,000. MinnesotaCare eligibility ended on 2026-01-01 for about 16,500 undocumented adults. Formal notice was given. Documented alternatives at scale were not.

**Action (-45) and Accountability (-45).** The published 4.4 on each implies systematic delivery and reliable self-correction. Minnesota's 2023 laws were genuinely ambitious, and two delivered: 150 million school meals in year one, and about 75,000 paid leave approvals in six months. A third did not. The Rehabilitation and Reinvestment Act produced six releases in two years. On accountability, the pattern is a decade long. Education ignored 30-plus complaints from 2018 to 2021. Human Services ignored housing fraud warnings through 2025. The Behavioral Health Administration failed 13 internal control tests across $426 million from 2022 to 2024, and then backdated documents once the auditor arrived.

**Empathy (-40).** The single most damaging finding is that the Department of Education asked Feeding Our Future to investigate complaints about itself, and left other complaints unexamined "despite their frequency and seriousness."

**Integrity (-30).** Minnesota bore real cost to keep two commitments and abandoned a third. Legislative Auditor Judy Randall said the document fabrication was something she had not seen in 27 years at the office.

**Equity (-15), the smallest gap.** The published 3.8 already flagged equity as Minnesota's relative weakness, and that instinct was directionally right, though for incomplete reasons. Minnesota genuinely leads on access design: no-application school meals, automatic voter registration, licences regardless of status, automatic rights restoration. It also holds one of the widest racial gaps in the country, with 77 percent white and 29 percent Black homeownership and the largest Black-white homeownership gap of any US metropolitan area in the Twin Cities at 51 percentage points. Strong averages mask that. The methodology's equity dimension is where the tension has to sit, and it does.

### Recommendation

The published score of 84.4 is a placeholder and is not defensible on any evidence. It should be replaced with 46.9 and the band changed from Exemplary to Functional. The rank should be set to null pending an index rebuild.

## Key Findings

- **Minnesota passed landmark laws and delivered about two-thirds of them.** Free school meals reached every public school district and served 150 million meals in year one. Paid Leave approved roughly 75,000 of 100,000 applications in its first six months. But the 2023 law letting prisoners shorten sentences through rehabilitation produced six releases in two years. Passing a law and delivering it are separate achievements, and Minnesota's score reflects the gap.

- **The state lost control of oversight in at least three programs, and the same failure repeated for a decade.** The Office of the Legislative Auditor found the Department of Education received more than 30 complaints about Feeding Our Future between 2018 and 2021 and did not act, enabling roughly $250 million in fraud. The Department of Human Services then missed warnings on a housing program that cost $107 million against a $2.6 million forecast. In December 2025 the US Attorney estimated total fraud in Minnesota-run Medicaid services likely exceeds $9 billion.

- **A Minnesota agency backdated documents during a state audit.** In January 2026 the Office of the Legislative Auditor found the Behavioral Health Administration created or backdated records after the audit started, across a grant portfolio worth $426 million. Legislative Auditor Judy Randall said she had not seen this in 27 years at the office. This is the single strongest piece of evidence against Minnesota's integrity score.

- **Minnesota removed health coverage from about 16,500 people it had covered two years earlier.** On 2025-06-09 the Legislature repealed MinnesotaCare eligibility for undocumented adults, effective 2025-12-31, saving $56.9 million. Children kept coverage. DFL leadership described the vote as "this one hurt." A commitment made in 2023 did not survive a budget deficit.

- **High averages hide the widest gaps in the country.** Minnesota has the 10th highest homeownership rate in the United States and one of the largest Black-white homeownership gaps, at 77 percent versus 29 percent. Its prison population is 39.4 percent Black in a state roughly 7 percent Black. Of the first 16 people released under the 2023 early-release law, none were Black or Hispanic. The state measures these gaps honestly, which is why the equity score is not lower.

## Strongest Dimensions

- **Awareness (60) and Systemic Thinking (60).** Minnesota's Office of the Legislative Auditor is genuinely independent and publishes damaging findings that lawmakers act on. Its 2023 legislative package targets causes rather than symptoms. Its Department of Human Rights investigated a major police department and bound it to a court-enforceable agreement with independent monitoring.

- **Equity (55).** Minnesota removes access barriers structurally rather than by application: universal school meals with no form to fill in, automatic voter registration, driver's licences regardless of immigration status, and automatic restoration of voting rights on release.

## Weakest Dimensions

- **Boundaries (35).** Two large service withdrawals inside twelve months affecting more than 37,000 people, with no documented alternatives at scale.

- **Action (40), Accountability (40) and Integrity (40).** Delivery lags legislation. Oversight failures repeat across agencies and across a decade. Acknowledgment consistently followed rather than preceded external investigation, and one agency actively obstructed an auditor.

## Evidence Gaps

- **Consent orientation (B5) is scored at low confidence.** The Data Practices Act is a genuine statewide consent structure, but no independent review of whether people actually understand what they consent to was found.

- **No gubernatorial transition occurred in the 2021–2026 window.** Resilience of Care (I5) is therefore untested and scored on statutory embedding alone.

- **Community testimony is thin.** Most evidence is Tier 4 institutional publication or Tier 5 audit. Direct testimony from people served by Minnesota programs was found mainly through journalism, not through independent survey. A Certified Assessment would close this gap.

- **Long-term care and nursing home outcome data was not obtained at the depth the $68 million cut warrants.** AC2 and EQ2 rest on budget documents rather than on outcome measurement.

## Recommended Next Steps

Minnesota scores in the Functional band. Systems exist but have significant gaps, concentrated in delivery and accountability rather than in intent or design.

- Consider [Advisory Support](/advisory) to translate these findings into a delivery-and-oversight roadmap, with priority on the recurring oversight failure pattern documented in AB4 and on the gap between enacted and delivered programs documented in AC1 and AC5.

## Sources

- Minnesota Office of the Legislative Auditor, Oversight of Feeding Our Future special review, June 2024 — https://www.auditor.leg.state.mn.us/sreview/2024/mdefof.htm
- Minnesota Office of the Legislative Auditor, special review PDF — https://www.auditor.leg.state.mn.us/sreview/pdf/2024-mdefof.pdf
- Minnesota Office of the Legislative Auditor, 2026 reports — https://www.auditor.leg.state.mn.us/fad/fdrt2026.htm
- Minnesota Office of the Legislative Auditor, all reports — https://www.auditor.leg.state.mn.us/allreports.htm
- Minnesota Office of the Legislative Auditor, about OLA — https://www.auditor.leg.state.mn.us/bkgd.htm
- MPR News, Audit finds weak oversight, fraud risk in DHS grants, 2026-01-06 — https://www.mprnews.org/story/2026/01/06/audit-finds-weak-oversight-fraud-risk-in-dhs-grants
- CBS Minnesota, Audit of Minnesota DHS grant programs, 2026-01-06 — https://www.cbsnews.com/minnesota/news/behavioral-health-administration-minnnesota-dhs-audit/
- CBS Minnesota, Feeding Our Future audit, 2024-06 — https://www.cbsnews.com/minnesota/news/feeding-our-future-legislative-auditor-report-minnesota-department-of-education/
- CBS Minnesota, Senate approves Office of Inspector General, 2026-05-11 — https://www.cbsnews.com/minnesota/news/minnesota-senate-approves-office-of-inspector-general/
- Office of Governor Tim Walz, comprehensive anti-fraud package — https://mn.gov/governor/newsroom/press-releases/?id=1055-727986
- Office of Governor Tim Walz, universal free school meals impact — https://mn.gov/governor/newsroom/press-releases/?id=1055-650288
- Minnesota Department of Education, Free School Meals for Kids Program — https://education.mn.gov/MDE/dse/FNS/SNP/free/
- Minnesota Paid Leave — https://paidleave.mn.gov/
- KTTC, Paid Leave first six months, 2026-07-07 — https://www.kttc.com/2026/07/07/first-6-months-mn-paid-leave-program-draws-100000-applications/
- KTTC, Paid Leave January data, 2026-02-09 — https://www.kttc.com/2026/02/09/deed-mns-new-paid-leave-program-has-received-more-than-38-thousand-applications/
- Minnesota Reformer, paid leave demand, 2026-07-07 — https://minnesotareformer.com/briefs/many-minnesotans-claim-paid-leave-benefits-but-agency-expects-demand-to-taper-off/
- FOX 9, Paid Family Leave Act strains Minnesota businesses — https://www.fox9.com/news/paid-family-leave-act-strains-minnesota-businesses-chamber-says
- Minnesota House, family and medical leave law, 2023 — https://www.house.mn.gov/NewLaws/story/2023/5501
- Minnesota House Session Daily, human services budget cuts, 2025 — https://www.house.mn.gov/sessiondaily/Story/18478
- Minnesota House Session Daily, House passes human services budget bill — https://www.house.mn.gov/sessiondaily/Story/18767
- Minnesota House Session Daily, $7 billion HHS budget agreement — https://www.house.mn.gov/SessionDaily/Story/18828
- Minnesota House Session Daily, MinnesotaCare eligibility bill — https://www.house.mn.gov/sessiondaily/Story/18830
- Minnesota House Session Daily, budget outlook worsens, 2025-12 — https://www.house.mn.gov/SessionDaily/Story/18566
- Minnesota House Session Daily, $3.7 billion surplus, 2026-02 — https://www.house.mn.gov/SessionDaily/Story/18919
- Minnesota House Session Daily, omnibus elections bill, 2023 — https://www.house.mn.gov/SessionDaily/Story/13753
- Minnesota Reformer, Legislature repeals MinnesotaCare for undocumented adults, 2025-06-09 — https://minnesotareformer.com/2025/06/09/legislature-to-repeal-minnesotacare-for-undocumented-adults/
- MinnPost, Legislature ends MinnesotaCare for undocumented adults, 2025-06 — https://www.minnpost.com/state-government/2025/06/legislature-with-gop-and-4-dfl-votes-ends-minnesotacare-for-undocumented-adults/
- KTTC, "This one hurt", 2025-06-10 — https://www.kttc.com/2025/06/10/this-one-hurt-dfl-leadership-grapples-with-vote-revoke-healthcare-undocumented-immigrants/
- Minnesota Budget Project, rollback of health coverage for immigrants — https://mnbudgetproject.org/resource/minnesotas-rollback-of-health-coverage-for-immigrants-will-harm-people-health-care-systems-and-the-economy
- Immigrant Law Center of Minnesota, MNCare update — https://www.ilcm.org/latest-news/mncare-for-undocumented-minnesotans-update/
- Minnesota Reformer, state shuts down housing stabilization program, 2025-08 — https://minnesotareformer.com/briefs/state-shuts-down-100-million-housing-stabilization-program-citing-fraud/
- Minnesota DHS, moves to terminate Housing Stabilization Services — https://mn.gov/dhs/media/news/?id=1053-700501
- Minnesota DHS, Housing Stabilization Services program ends Oct. 31 — https://mn.gov/dhs/media/news/?id=1053-711321
- KARE 11, Minnesota moves to shut down Housing Stabilization Services — https://www.kare11.com/article/news/investigations/kare-11-investigates-minnesota-moves-to-shut-down-housing-stabilization-services-program-amid-widespread-fraud/89-62a186ad-9a48-474a-91b0-576cd54ec021
- KARE 11, DHS ignored fraud warnings — https://www.kare11.com/article/news/investigations/kare-11-investigates-flying-blind-state-agency-missed-or-ignored-repeated-housing-fraud-warnings/89-795f7dc0-8848-4560-aefa-e91d8f8c033d
- KARE 11, early release program disparities — https://www.kare11.com/article/news/local/mn-early-release-program-draws-scrutiny-as-rollout-lags-alleged-disparities-emerge/89-2a50a77b-f6ca-475a-befd-8850d8f1efdc
- InForum, who could be left behind — https://www.inforum.com/news/minnesota/heres-who-could-be-left-behind-if-minnesota-shuts-down-its-housing-stabilization-program
- Minnesota Daily, housing stabilization shutdown — https://mndaily.com/296365/city/minnesota-housing-stabilization-service-shutdown-leaves-many-without-future-housing/
- Minnesota Reformer, US Attorney on Medicaid fraud, 2025-12-18 — https://minnesotareformer.com/2025/12/18/u-s-attorney-fraud-likely-exceeds-9-billion-in-minnesota-run-medicaid-services/
- Star Tribune, Minnesota's fraud crisis, 2025-12 — https://www.startribune.com/heres-what-to-know-about-minnesotas-fraud-crisis/601542128
- Star Tribune, child protection system fixes — https://www.startribune.com/minnesotas-child-protection-system-needs-fixes-legislators-are-starting-with-these-changes/600367517
- Star Tribune, early release program not implemented — https://www.startribune.com/minnesota-rehabilitative-prison-early-release-program-not-implemented-protests/601488395
- Albert Lea Tribune, two years after law passed — https://www.albertleatribune.com/2025/10/two-years-after-law-passed-minnesota-still-lacks-early-prison-release-program/
- Sahan Journal, advocates urge faster action on early release — https://sahanjournal.com/public-safety/minnesota-prison-early-release-minnesota-rehabilitation-reinvestment-act/
- Invisible Children, Minnesota child protection reporting, 2026-06-04 — https://invisiblechildren.org/2026/06/04/minnesota-child-protection-system-failing-kids/
- Minnesota Department of Human Rights, MPD agreement — https://mn.gov/mdhr/mpd/agreement/
- City of Minneapolis, court-enforceable settlement agreement — https://www.minneapolismn.gov/resident-services/public-safety/police-public-safety/investigations-settlement-agreement/court-enforceable-settlement-agreement/
- KSTP, judge approves MDHR agreement — https://kstp.com/kstp-news/local-news/judge-to-approve-consent-decree-between-minneapolis-minnesota-department-of-human-rights/
- Minnesota DPS, MMIR Office — https://dps.mn.gov/divisions/ojp/offices-missing-murdered/mmir-office
- Minnesota DPS, About MMIR — https://dps.mn.gov/divisions/ojp/offices-missing-murdered/mmir-office/about-mmir
- Minnesota DPS, MMIR Advisory Council — https://dps.mn.gov/divisions/ojp/offices-missing-murdered/mmir-office/about-mmir/mmir-advisory-council
- Minnesota Indian Affairs, MMIWR — https://mn.gov/indian-affairs/resources/mn-agency-resources/mmiwr-.jsp
- HEAL Council 2025 legislative report — https://www.lrl.mn.gov/docs/2026/mandated/260201.pdf
- Minnesota EHR Consortium, Health Trends Across Communities dashboard — https://mnehrconsortium.org/health-trends-across-communities-minnesota-dashboard
- Minnesota DOC staffing analysis — https://www.lrl.mn.gov/docs/2024/other/241275.pdf
- Minnesota DOC 2024 performance report — https://mn.gov/doc/assets/2024%20DOC%20Performance%20Report%20Final%20Accessible_tcm1089-665169.pdf
- Minnesota DOC 2023 legislative session impact brief — https://mn.gov/doc/about/legislative-info/impact-brief.jsp
- Minnesota Management and Budget, workforce planning report FY2023 — https://mn.gov/mmb-stat/workforce-reports/2023.pdf
- One Minnesota Plan, workforce shortage goal — https://mn.gov/mmb/one-mn-plan/measurable-goals/workforce-shortage.jsp
- Prison Policy Initiative, Minnesota profile — https://www.prisonpolicy.org/profiles/MN.html
- Brennan Center, voting rights restoration in Minnesota — https://www.brennancenter.org/our-work/research-reports/voting-rights-restoration-efforts-minnesota
- Minnesota Reformer, driver's licenses and voting rights bills — https://minnesotareformer.com/briefs/drivers-licenses-for-all-voting-rights-restoration-bills-clear-final-hurdle-walz-will-sign/
- CBS Minnesota, Senate passes felon voting rights and licenses for all — https://www.cbsnews.com/minnesota/news/mn-senate-passes-voting-rights-for-felons-drivers-licenses-for-all/
- KTTC, Black homeownership gap rooted in racial covenants, 2026-06-17 — https://www.kttc.com/2026/06/17/minnesota-black-homeownership-gap-rooted-racial-covenants/?outputType=amp
- Minnesota Statutes Chapter 13 (Government Data Practices Act) — https://www.revisor.mn.gov/statutes/cite/13/full
- Minnesota Statutes 13.03 — https://www.revisor.mn.gov/statutes/cite/13.03
- Minnesota Department of Administration, Data Practices Office — https://mn.gov/admin/data-practices/

## Attribution Note

This assessment scores Minnesota state conduct only, across both political branches. Minnesota was under unified DFL control in 2023, when the assessed legislative package passed, and under a tied House and divided legislature from 2025. Both are scored as state conduct, since the benchmark scores the jurisdiction rather than an administration. The 2025 MinnesotaCare repeal passed 68-65 in the House and 37-30 in the Senate with cross-party votes and was signed as part of a negotiated $66 billion budget; it is scored as state conduct.

The Minneapolis Police Department's own conduct is city conduct and is not scored against Minnesota. What is scored is the state Department of Human Rights' discretionary decision to investigate, to find a pattern of race-based policing, and to bind the city to a court-enforceable agreement with independent monitoring. Federal action is excluded: the federal criminal prosecutions arising from Feeding Our Future and the US Attorney's Medicaid fraud estimate are federal conduct. What is scored is Minnesota's own oversight failure that preceded them, as established by the state's own Legislative Auditor.

## Disclaimer

This assessment is based on publicly available information and does not constitute a formal Compassion Benchmark Certified Assessment. For a comprehensive, assessor-led evaluation, visit compassionbenchmark.com/certified-assessments.
