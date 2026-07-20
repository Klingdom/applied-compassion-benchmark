---
entity: "Mississippi"
type: "State"
sector: "Government"
date: "2026-07-19"
composite_score: 40.0
band: "Developing"
scores:
  AWR: 2.8
  EMP: 2.0
  ACT: 2.6
  EQU: 2.6
  BND: 2.0
  ACC: 2.8
  SYS: 3.2
  INT: 2.8
published_index: "us-states"
published_rank: 21
published_composite: 12.5
published_band: "Critical"
---

# Compassion Benchmark Assessment: Mississippi

**Entity type:** State
**Sector/Domain:** Government (US state jurisdiction)
**Assessment date:** 2026-07-19
**Composite score:** 40.0/100
**Band:** Developing
**Band stability:** UNSTABLE — see the band-stability note below

## Score Summary

| Dimension | Code | Raw (1-5) | Score (0-100) | Band |
|-----------|------|-----------|---------------|------|
| Awareness | AWR | 2.8 | 45.0 | Functional |
| Empathy | EMP | 2.0 | 25.0 | Developing |
| Action | ACT | 2.6 | 40.0 | Developing |
| Equity | EQU | 2.6 | 40.0 | Developing |
| Boundaries | BND | 2.0 | 25.0 | Developing |
| Accountability | ACC | 2.8 | 45.0 | Functional |
| Systemic Thinking | SYS | 3.2 | 55.0 | Functional |
| Integrity | INT | 2.8 | 45.0 | Functional |
| **Composite** | — | — | **40.0** | **Developing** |

Composite verified by running `computeCompositeFromDimensions` from `site/scripts/lib/scoring.mjs` (methodology v1.2). Output: `{"composite":40,"band":"Developing","integrationPremium":0}`.

### Band-stability note

Mississippi lands on 40.0. The Developing band ends at 40 and the Functional band begins at 41. This is the narrowest possible margin, so the band label should be treated as unstable.

All four sensitivity cases were run through `computeCompositeFromDimensions`, not computed by hand:

| Case | Change | Function output |
|------|--------|-----------------|
| Base | as scored | `{"composite":40,"band":"Developing","integrationPremium":0}` |
| S1 | AB3 floored at 2 instead of capped at 3 (ACC 2.8 to 2.6) | `{"composite":39.4,"band":"Developing","integrationPremium":0}` |
| S2 | EMP 2.0 to 2.2 (one Empathy subdimension up one point) | `{"composite":40.6,"band":"Functional","integrationPremium":0}` |
| S3 | every dimension minus 0.2 | `{"composite":35,"band":"Developing","integrationPremium":0}` |
| S4 | every dimension plus 0.2 | `{"composite":45,"band":"Functional","integrationPremium":0}` |

A single subdimension moving one point in either direction changes the published band. Report the number, 40.0, ahead of the band label.

No integration premium applies. All 8 dimensions score below 4.0, so `weaknessFactor` is 0 and the premium is 0.0 regardless of consistency. Mississippi's dimension spread is actually tight (standard deviation 0.39, well inside the 1.5 threshold), but that consistency earns nothing because the underlying level is low. Mississippi is evenly mediocre rather than lopsided.

---

## Dimension Details

### AWR: Awareness (2.8 raw / 45.0 scaled)

Mississippi's measurement of its own suffering is the single most surprising finding in this assessment. The state publishes unusually candid mortality data about itself.

| Subdimension | Score | Evidence | Source |
|-------------|-------|----------|--------|
| A1 Suffering Detection | 4/5 | The Maternal Mortality Review Committee reviewed 224 pregnancy-associated deaths from 2019-2023 and found 73, or 33%, were pregnancy-related. The committee met six times in 2025. The infant mortality report records 323 infant deaths in 2024 at a rate of 9.7 per 1,000. On 2025-08-21 the State Health Officer declared a public health emergency on the state's own worsening numbers. | [MSDH Maternal Mortality Report 2025](https://msdh.ms.gov/msdhsite/index.cfm/29,21452,299,pdf/Maternal_Mortality_Report_2025.pdf); [MSDH Infant Mortality Report 2025](https://msdh.ms.gov/msdhsite/index.cfm/29,21453,299,pdf/Infant_Mortality_Report_2025.pdf); [Mississippi Today 2025-08-21](https://mississippitoday.org/2025/08/21/mississippi-health-emergency-infant-mortality/) |
| A2 Contextual Sensitivity | 3/5 | The OB System of Care, in development since 2023, designates birthing hospitals by care level and adds transport for high-risk mothers. The Department of Mental Health reports intensive community support services in all 82 counties. Genuine adaptation, but welfare intake applies one uniform barrier set. | [WLBT 2025-08-25](https://www.wlbt.com/2025/08/25/how-state-health-officer-plans-address-infant-mortality-ms/); [MS DMH](https://www.dmh.ms.gov/service-options/community-services/intensive-community-services/) |
| A3 Blind Spot Mitigation | 3/5 | The state's own infant mortality report names a 3x Black-White death gap. But the Olivia Y. federal monitor, not the state, found 30 miscoded child-abuse records in 2024 — the state reported 59 children abused in custody, the monitor found 89. Findings exist; the biggest one came from outside. | [MSDH Infant Mortality Report 2025](https://msdh.ms.gov/msdhsite/index.cfm/29,21453,299,pdf/Infant_Mortality_Report_2025.pdf); [WLOX 2026-05-26](https://www.wlox.com/2026/05/26/is-mississippis-cps-fixed-state-seeks-end-federal-oversight/) |
| A4 Signal Amplification | 2/5 | Incarcerated people's conditions reached daylight through a federal investigation, not a state channel. Welfare applicants have no comparable amplifier: 9% of monthly applicants complete the process. | [DOJ findings report 2024-02-26](https://www.justice.gov/d9/2024-02/2024.02.26_ms_doc_findings_report_it_508_reviewed_0.pdf); [Mississippi Today 2024-10-16](https://mississippitoday.org/2024/10/16/tanf-mississippi-unspent-red-tape/) |
| A5 Anticipatory Awareness | 2/5 | A fiscal analysis of House Bill 1 existed before passage and projected general fund revenue growth falling from 3.3% to 0.6% a year through FY2040. The analysis did not change the bill. Harm was projected, then accepted. | [IHL fiscal analysis of HB 1](https://www.mississippi.edu/sites/default/files/ihl/files/HB1final.pdf); [Mississippi Today 2025-03-24](https://mississippitoday.org/2025/03/24/policy-analyst-income-tax-elimination-risks-significant-harm-to-mississippis-future/) |

### EMP: Empathy (2.0 raw / 25.0 scaled)

Mississippi's weakest dimension, tied with Boundaries. The state's default posture toward people who report harm is legal defence.

| Subdimension | Score | Evidence | Source |
|-------------|-------|----------|--------|
| E1 Affective Resonance | 2/5 | About 90% of people who apply for cash welfare in Mississippi do not get it. The 2017 HOPE Act built what Mississippi Today called "a maze of bureaucratic red tape." The interaction is processing, not care. | [Mississippi Today 2022-10-05](https://mississippitoday.org/2022/10/05/mississippi-reject-most-welfare-applicants/); [Mississippi Today 2024-10-16](https://mississippitoday.org/2024/10/16/tanf-mississippi-unspent-red-tape/) |
| E2 Perspective-Taking | 3/5 | Senate Bill 2212, signed 2023-03-16, extended postpartum Medicaid from 60 days to 12 months. More than two-thirds of Mississippi babies are born to people on Medicaid. A formal review mechanism changed a real decision. | [Medicaid.gov SPA 23-0015, 2023-12-13](https://www.medicaid.gov/medicaid-spa/2023-12-13/156951); [Mississippi Center for Justice](https://mscenterforjustice.org/beyond-the-first-60-days-closing-the-gap-in-postpartum-care-access/) |
| E3 Non-Judgment | 2/5 | Six former Rankin County officers were sentenced to a combined 132 years for the 2023 torture of two Black men. The county settled for $2.5 million on 2025-05-01. The prosecutions were federal. Disaggregated health outcomes are published, but state-level bias-training and corrective infrastructure is not evident. | [Mississippi Today 2025-05-01](https://mississippitoday.org/2025/05/01/goon-squad-lawsuit-settled-for-2-5m/); [MSDH Infant Mortality Report 2025](https://msdh.ms.gov/msdhsite/index.cfm/29,21453,299,pdf/Infant_Mortality_Report_2025.pdf) |
| E4 Validation | 1/5 | The Department of Corrections answered federal findings of unconstitutional conditions with "we disagree with the findings." The Attorney General moved on 2026-05-12 to dismiss the Olivia Y. foster-care case after decades of monitoring. The state contested the federal mental health case to a successful appeal. Legal review precedes acknowledgment as a matter of pattern. | [Mississippi Today 2024-02-28](https://mississippitoday.org/2024/02/28/justice-department-slams-unconstitutional-conditions-at-mississippi-prisons/); [Mississippi Today 2026-05-11](https://mississippitoday.org/2026/05/11/olivia-y-foster-care-dismiss/) |
| E5 Cultural Empathy | 2/5 | Community health worker programs and home visits form part of the infant mortality response. No evidence found of core practices redesigned with non-dominant community knowledge. Scored low on thin evidence. | [WLBT 2025-08-25](https://www.wlbt.com/2025/08/25/how-state-health-officer-plans-address-infant-mortality-ms/) |

### ACT: Action (2.6 raw / 40.0 scaled)

| Subdimension | Score | Evidence | Source |
|-------------|-------|----------|--------|
| AC1 Responsiveness | 3/5 | The August 2025 emergency declaration was used to accelerate the OB System of Care by roughly six months. Against that, the court monitor found people "still wait in jail without charges for treatment." | [WLBT 2025-08-25](https://www.wlbt.com/2025/08/25/how-state-health-officer-plans-address-infant-mortality-ms/); [Mississippi Today 2022-03-08](https://mississippitoday.org/2022/03/08/mental-health-lawsuit-report/) |
| AC2 Proportionality | 2/5 | Mississippi held unspent federal welfare money while rejecting more than 90% of applicants. It has declined for a fourth consecutive session to cover roughly 74,000 people in the coverage gap. Resources do not follow need. | [Mississippi Today 2024-10-16](https://mississippitoday.org/2024/10/16/tanf-mississippi-unspent-red-tape/); [Mississippi Today 2026-03-15](https://mississippitoday.org/2026/03/15/medicaid-expansion-legislature-one-big-beautiful-bill/) |
| AC3 Efficacy | 3/5 | Early literacy is independently measured and it works. Adjusted for demographics, Mississippi ranked first in the nation in both reading and maths on the 2024 NAEP. A peer-reviewed 2024 study evaluated the policy. A December 2025 critique argues part of the gain reflects grade-retention selection, so the effect is real but contested at the margin. Most other programs lack outcome measurement. | [ScienceDirect 2024](https://www.sciencedirect.com/science/article/abs/pii/S027277572400092X); [Mississippi First](https://www.mississippifirst.org/contextualizing-mississippis-2024-naep-scores/); [Gelman 2025-12-01](https://statmodeling.stat.columbia.edu/2025/12/01/how-much-of-mississippis-education-miracle-is-an-artifact-of-selection-bias/) |
| AC4 Resource Mobilization | 2/5 | House Bill 1, signed 2025-03-27, removes about $2.7 billion a year from state revenue when fully phased in. The 2024 expansion negotiation collapsed over work requirements. The state is reducing, not mobilising, its capacity to fund need. | [ITEP analysis of HB 1](https://itep.org/mississippi-hb-1-tax-cuts-analysis/); [NPR 2024-05-16](https://www.npr.org/sections/health-shots/2024/05/16/1251691921/medicaid-expansion-mississippi-alabama-south) |
| AC5 Follow-Through | 3/5 | The Literacy-Based Promotion Act has run since 2013 with published longitudinal NAEP tracking. Mississippi students went from a full grade level behind the national average in 2013 to roughly half a grade level ahead by 2024. Thirteen years of sustained follow-through in one policy area. | [The 74](https://www.the74million.org/article/there-really-was-a-mississippi-miracle-in-reading-states-should-learn-from-it/); [Mississippi First](https://www.mississippifirst.org/contextualizing-mississippis-2024-naep-scores/) |

### EQU: Equity (2.6 raw / 40.0 scaled)

| Subdimension | Score | Evidence | Source |
|-------------|-------|----------|--------|
| EQ1 Universality | 2/5 | Roughly 74,000 Mississippians sit in a coverage gap the state has chosen not to close. They earn too much for Medicaid and cannot afford private cover. This is a defined population excluded by state decision, not by federal rule. | [Mississippi Today 2026-03-15](https://mississippitoday.org/2026/03/15/medicaid-expansion-legislature-one-big-beautiful-bill/); [healthinsurance.org](https://www.healthinsurance.org/medicaid/mississippi/) |
| EQ2 Priority for Vulnerable | 3/5 | The 2023 postpartum extension is a documented decision to direct scarce coverage to a high-mortality group. Against it, obstetric care in rural Mississippi kept thinning through 2025. | [Medicaid.gov SPA 23-0015, 2023-12-13](https://www.medicaid.gov/medicaid-spa/2023-12-13/156951); [Mississippi Today 2025-08-07](https://mississippitoday.org/2025/08/07/pregnant-people-rural-care/) |
| EQ3 Bias Awareness | 3/5 | The state health department publishes the 3x Black-White infant death gap in its own report and the State Health Officer cited "growing racial disparities" as grounds for the emergency. Identified, named publicly, some corrective action. Not yet independently audited. | [MSDH Infant Mortality Report 2025](https://msdh.ms.gov/msdhsite/index.cfm/29,21453,299,pdf/Infant_Mortality_Report_2025.pdf); [Forbes 2025-08-28](https://www.forbes.com/sites/angelicageter/2025/08/28/mississippi-declares-public-health-emergency-over-infant-mortality/) |
| EQ4 Access Design | 2/5 | Mississippi added barriers rather than removing them: a mandatory 30-day up-front job search and drug screening for all welfare applicants. 68% of the state's rural hospitals have no labour and delivery unit. | [Mississippi Today 2024-10-16](https://mississippitoday.org/2024/10/16/tanf-mississippi-unspent-red-tape/); [Mississippi Today 2025-05-13](https://mississippitoday.org/2025/05/13/rural-hospitals-labor-and-delivery/) |
| EQ5 Historical Harm Acknowledgment | 3/5 | On 2020-06-28 the Legislature removed the Confederate emblem from the state flag after 126 years, seated a nine-member design commission, and put the replacement to a referendum. A formal acknowledgment of a specific harm with community involvement. No reparative action followed, and the trigger was sports-body pressure. | [Mississippi Today 2020-06-28](https://mississippitoday.org/2020/06/28/mississippi-furls-state-flag-with-confederate-emblem-after-126-years/); [Mississippi Free Press](https://www.mississippifreepress.org/you-white-people-dont-get-it-mississippis-long-ugly-road-to-changing-its-state-flag/) |

### BND: Boundaries (2.0 raw / 25.0 scaled)

Mississippi's weakest dimension, tied with Empathy, and the site of its single lowest subdimension score.

| Subdimension | Score | Evidence | Source |
|-------------|-------|----------|--------|
| B1 Self-Sustainability | 2/5 | Federal investigators found prison staff vacancy rates up to 64%, leaving areas unsupervised and guards afraid to enter units. The state did act: a 6% across-the-board pay rise took effect 2025-07-01. One structural intervention against a depleted baseline. | [DOJ findings report 2024-02-26](https://www.justice.gov/d9/2024-02/2024.02.26_ms_doc_findings_report_it_508_reviewed_0.pdf); [MSPB FY2026 compensation plan](https://www.mspb.ms.gov/sites/mspb/files/MSPB_File/Resources%20for%20HR/Policies/FY%202026%20Policies/FY%202026%20VCP.pdf) |
| B2 Autonomy Preservation | 3/5 | Crisis stabilisation beds rose from 128 in 2018 to 180, designed to divert people from state hospitals. Early literacy builds a capacity that does not require continued state involvement. | [Mental Health Mississippi](https://mentalhealthms.com/crisis-stabilization-units/); [Mississippi First](https://www.mississippifirst.org/contextualizing-mississippis-2024-naep-scores/) |
| B3 Scope Clarity | 2/5 | A substantial share of welfare applicants abandon their applications rather than being refused. People invest effort before discovering what the programme will not do for them. | [Mississippi Today 2022-10-05](https://mississippitoday.org/2022/10/05/mississippi-reject-most-welfare-applicants/) |
| B4 Refusal Ethics | 1/5 | Mississippi turns away more than 90% of cash-welfare applicants — no other state exceeds 90%. Only 125 applications a month clear the process. No structured alternative or referral pathway was found for the roughly 1,250 monthly applicants who do not. This is the assessment's lowest score. | [Mississippi Today 2024-10-16](https://mississippitoday.org/2024/10/16/tanf-mississippi-unspent-red-tape/); [Mississippi Today 2022-10-05](https://mississippitoday.org/2022/10/05/mississippi-reject-most-welfare-applicants/) |
| B5 Consent Orientation | 2/5 | All welfare applicants must submit to drug screening to receive benefits. Consent conditioned on surrendering a right is a legal formality rather than genuine informed consent. Thin evidence overall; low confidence. | [Mississippi Today 2024-10-16](https://mississippitoday.org/2024/10/16/tanf-mississippi-unspent-red-tape/) |

### ACC: Accountability (2.8 raw / 45.0 scaled)

| Subdimension | Score | Evidence | Source |
|-------------|-------|----------|--------|
| AB1 Harm Acknowledgment | 3/5 | The State Auditor exposed what he called the largest public embezzlement in state history — about $77 million in misused welfare funds — pursuing well-connected figures with no legal compulsion to do so. The State Health Officer separately declared an emergency on his own agency's worst-in-nation numbers. Both are self-initiated disclosure. | [WDAM 2025-12-05](https://www.wdam.com/2025/12/05/state-auditor-shad-white-provides-update-mississippi-welfare-scandal/); [Mississippi Today 2025-08-21](https://mississippitoday.org/2025/08/21/mississippi-health-emergency-infant-mortality/) |
| AB2 Correction Willingness | 3/5 | The 2023 postpartum extension is a real course correction driven by the state's own mortality evidence. Set against a flat refusal to accept the prison findings. | [Medicaid.gov SPA 23-0015, 2023-12-13](https://www.medicaid.gov/medicaid-spa/2023-12-13/156951); [Mississippi Today 2024-02-28](https://mississippitoday.org/2024/02/28/justice-department-slams-unconstitutional-conditions-at-mississippi-prisons/) |
| AB3 Transparency | 3/5 | **Cross-state AB3 rule applied — capped at 3.** All Mississippi state executives are exempt from the Public Records Act, and the Legislature reserves the right to regulate access to its own records. That is limb (a): branches exempting themselves. Limb (b) is clearly met: the State Auditor and the health department both keep publishing damaging, uncompelled findings, including a state committee recommending Medicaid expansion the state refuses to enact. Cap, not floor. | [Reporters Committee](https://www.rcfp.org/open-government-guide/mississippi/); [MuckRock](https://www.muckrock.com/place/united-states-of-america/mississippi/); [MSDH Maternal Mortality Report 2025](https://msdh.ms.gov/msdhsite/index.cfm/29,21452,299,pdf/Maternal_Mortality_Report_2025.pdf) |
| AB4 Systemic Learning | 3/5 | Early literacy is a genuine institutional-learning case now studied as a model elsewhere. But corrections shows the opposite pattern: federal findings against Parchman in April 2022 were followed by findings against three more prisons in February 2024. The same failure recurred at new sites. | [The Conversation](https://theconversation.com/mississippis-education-miracle-a-model-for-global-literacy-reform-251895); [Prison Legal News 2024-09-15](https://www.prisonlegalnews.org/news/2024/sep/15/doj-declares-conditions-three-more-mississippi-prisons-unconstitutional/) |
| AB5 Reparative Action | 2/5 | Recovery of the misused welfare money has stalled in an internal turf fight. On 2026-06-11 the state Supreme Court ruled unanimously that the Auditor has no authority to sue; only the Attorney General does. The $2.5 million Goon Squad settlement was paid by Rankin County, not the state. | [Mississippi Today 2026-06-11](https://mississippitoday.org/2026/06/11/lynn-fitch-shad-white-welfare-supreme-court/); [Mississippi Today 2025-05-01](https://mississippitoday.org/2025/05/01/goon-squad-lawsuit-settled-for-2-5m/) |

### SYS: Systemic Thinking (3.2 raw / 55.0 scaled)

Mississippi's strongest dimension, carried almost entirely by early literacy.

| Subdimension | Score | Evidence | Source |
|-------------|-------|----------|--------|
| S1 Root Cause Orientation | 4/5 | The 2013 Literacy-Based Promotion Act is a textbook upstream intervention: teach children to read by third grade and reduce demand for everything downstream. It has a documented, peer-reviewed effect and it is now the case other states study. | [ScienceDirect 2024](https://www.sciencedirect.com/science/article/abs/pii/S027277572400092X); [Mississippi First](https://www.mississippifirst.org/contextualizing-mississippis-2024-naep-scores/) |
| S2 Long-Term Impact | 3/5 | Thirteen years of tracked literacy outcomes shows genuine long-horizon capacity. But the state's own fiscal analysis projects general fund revenue about $3.0 billion lower by FY2040 under House Bill 1, with no published long-horizon service model to match. The state plans long-term for reading and long-term for revenue reduction, and has not reconciled the two. | [IHL fiscal analysis of HB 1](https://www.mississippi.edu/sites/default/files/ihl/files/HB1final.pdf); [The 74](https://www.the74million.org/article/there-really-was-a-mississippi-miracle-in-reading-states-should-learn-from-it/) |
| S3 Interconnection Awareness | 3/5 | The state recognises the mental-health-to-jail pipeline and built diversion services in response. The 2026 Metro Jackson Water Authority Act shows cross-system engagement, though the Senate reduced the city's own representation on the board. | [Mississippi Today 2022-03-08](https://mississippitoday.org/2022/03/08/mental-health-lawsuit-report/); [Mississippi Today 2026-03-30](https://mississippitoday.org/2026/03/30/jackson-water-authority-bill/) |
| S4 Structural Critique | 3/5 | The state's own Maternal Mortality Review Committee publicly urges Medicaid expansion — a position directly against the position of the government that convenes it. The State Auditor pursued powerful figures at real institutional cost. Public positions carrying genuine risk. | [MSDH Maternal Mortality Report 2025](https://msdh.ms.gov/msdhsite/index.cfm/29,21452,299,pdf/Maternal_Mortality_Report_2025.pdf); [WDAM 2025-12-05](https://www.wdam.com/2025/12/05/state-auditor-shad-white-provides-update-mississippi-welfare-scandal/) |
| S5 Coalitional Compassion | 3/5 | Mississippi's literacy model is now documented as a template for other states and internationally. That is a real contribution of learning to the wider field. Crisis unit expansion involved federal and regional partners. | [The Conversation](https://theconversation.com/mississippis-education-miracle-a-model-for-global-literacy-reform-251895); [Mental Health Mississippi](https://mentalhealthms.com/crisis-stabilization-units/) |

### INT: Integrity (2.8 raw / 45.0 scaled)

| Subdimension | Score | Evidence | Source |
|-------------|-------|----------|--------|
| I1 Consistency Under Pressure | 3/5 | Mississippi held the literacy programme through the pandemic while national scores fell, at real political cost — third-grade retention is unpopular. Against that, Medicaid expansion momentum collapsed the moment federal incentives shifted. | [The 74](https://www.the74million.org/article/there-really-was-a-mississippi-miracle-in-reading-states-should-learn-from-it/); [Mississippi Today 2026-03-15](https://mississippitoday.org/2026/03/15/medicaid-expansion-legislature-one-big-beautiful-bill/) |
| I2 Non-Performance | 3/5 | Declaring a public health emergency over your own worst-in-a-decade infant death rate is publicly unflattering and was done anyway. That is genuine. But the 2020 flag change followed SEC and NCAA pressure on championship hosting, which is reputational. Mixed motive, scored at the midpoint. | [Mississippi Today 2025-08-21](https://mississippitoday.org/2025/08/21/mississippi-health-emergency-infant-mortality/); [Mississippi Free Press](https://www.mississippifreepress.org/you-white-people-dont-get-it-mississippis-long-ugly-road-to-changing-its-state-flag/) |
| I3 Internal Consistency | 2/5 | Prison vacancy rates of 30% to 50%, reaching 64% in places. Child protection asked for an additional $52 million to meet its own settlement obligations. The people delivering care are under-resourced relative to what the state says it is delivering. | [DOJ findings report 2024-02-26](https://www.justice.gov/d9/2024-02/2024.02.26_ms_doc_findings_report_it_508_reviewed_0.pdf); [Daily Journal](https://www.djournal.com/mississippi-today/cps-requests-additional-million-to-comply-with-olivia-y-settlement/article_77bda126-cf10-55ee-82e9-e7bbc8b8e8c8.html) |
| I4 Values Alignment | 2/5 | On 2025-03-27 the state signed away its income tax while declining to insure 74,000 people and while its own committees asked for more money for mothers and infants. An independent distributional analysis titled its review "A Windfall for the Wealthy." | [Governor Reeves 2025-03-27](https://governorreeves.ms.gov/gov-reeves-signs-historic-legislation-eliminating-mississippis-individual-income-tax/); [ITEP](https://itep.org/mississippi-hb-1-tax-cuts-analysis/) |
| I5 Resilience of Care | 4/5 | The literacy policy has survived multiple governors, multiple state superintendents and a pandemic since 2013, and improved throughout. It is written into statute rather than dependent on a personality. Mississippi's highest subdimension score. | [The 74](https://www.the74million.org/article/there-really-was-a-mississippi-miracle-in-reading-states-should-learn-from-it/); [Mississippi First](https://www.mississippifirst.org/contextualizing-mississippis-2024-naep-scores/) |

---

## Published Index Comparison

**Published index:** US States | **Published rank:** 21 (of 21 entries present, not a national rank) | **Published composite:** 12.5/100 | **Published band:** Critical

| Dimension | Published (raw) | Published (scaled) | Research (raw) | Research (scaled) | Difference | Explanation |
|-----------|----------------|-------------------|----------------|-------------------|------------|-------------|
| AWR | 1.5 | 12.5 | 2.8 | 45.0 | +32.5 | State publishes candid, disaggregated mortality data and declared an emergency on it |
| EMP | 1.5 | 12.5 | 2.0 | 25.0 | +12.5 | Postpartum extension is real; validation failures keep it low |
| ACT | 1.5 | 12.5 | 2.6 | 40.0 | +27.5 | Literacy programme is independently measured and works |
| EQU | 1.0 | 0.0 | 2.6 | 40.0 | +40.0 | Published 1.0 implies total exclusion; postpartum coverage and flag change contradict it |
| BND | 2.0 | 25.0 | 2.0 | 25.0 | 0.0 | Coincidental agreement; the placeholder had no basis |
| ACC | 1.5 | 12.5 | 2.8 | 45.0 | +32.5 | State Auditor's uncompelled welfare investigation is a strong signal |
| SYS | 1.5 | 12.5 | 3.2 | 55.0 | +42.5 | Early literacy is upstream work of national significance |
| INT | 1.5 | 12.5 | 2.8 | 45.0 | +32.5 | Literacy policy survived 13 years and multiple leadership changes |
| **Composite** | — | **12.5** | — | **40.0** | **+27.5** | — |

### Score Difference Analysis

**The published 12.5 is a bulk-import placeholder, not a finding.** Alabama, Arkansas and Mississippi all carry an identical composite of 12.5 with byte-identical dimension scores. Three different states cannot produce the same eight numbers from evidence. The entry carries `last_assessed: null`. Alabama, published at this same 12.5, returned 31.9 when assessed on evidence. This assessment therefore treats Mississippi as a first baseline and does not anchor to 12.5 or to Alabama's result.

**SYS, +42.5, the largest gap.** A published 1.5 implies a state that does not discuss root causes. Mississippi runs one of the most-studied upstream interventions in American education. The Literacy-Based Promotion Act, passed 2013, produced the largest state score gains in the country. Adjusted for demographics, Mississippi ranked first nationally in both reading and maths on the 2024 NAEP. Black students in Mississippi outperform Black students in 47 other states in reading. This is independently measured by a federal assessment, evaluated in peer-reviewed work, and now studied as a model internationally. A December 2025 statistical critique argues grade retention inflates part of the measured gain; that is a real caveat and is why S1 is scored 4 rather than 5. It does not move the score anywhere near 1.5.

**EQU, +40.0, from a published 1.0.** A dimension score of 1.0 is the floor of the scale. It asserts that entire populations are effectively excluded, that resources flow to the easiest to serve, that bias is denied, that access barriers are unexamined, and that historical harms are denied as irrelevant. Mississippi extended postpartum Medicaid to 12 months in 2023, publishes its own racial disparity data, and removed the Confederate emblem from its flag in 2020 through a legislated commission and referendum. The published 1.0 is factually wrong on at least three of five subdimensions.

**AWR, ACC and INT, each +32.5.** These three share a cause. Mississippi has institutions that tell the truth about Mississippi. The State Auditor pursued the misuse of about $77 million in welfare funds against politically powerful people with no external compulsion. The State Health Officer declared a public health emergency over the state's own worst-in-a-decade infant mortality figure. The Maternal Mortality Review Committee publicly recommends a Medicaid expansion the state government refuses. These are Tier 4 institutional disclosures of unflattering facts, and the placeholder captured none of them.

**Where the published score was directionally right.** The placeholder correctly implied severe failure, and this assessment confirms severe failure in specific places. Boundaries lands at exactly the published 2.0. Refusal Ethics scores 1 out of 5: Mississippi rejects more than 90% of cash-welfare applicants, the highest rate in the nation, with no structured alternative. Validation scores 1 out of 5: the state's reflex when told it has caused harm is to contest it. The placeholder was right that something is badly wrong; it was wrong about what, and wrong by 27.5 points about how much.

### Recommendation

**Update the entity.** The published composite of 12.5 is understated by 27.5 points and should be replaced with 40.0. The band should move from Critical to Developing. The correction is a **data-defect fix, not a record of institutional improvement** — Mississippi did not change between the placeholder and this assessment; the placeholder was never based on evidence.

Rank should be set to null. The published us-states index contains only 21 of 51 jurisdictions and the surviving entries were renumbered contiguously, so "rank 21" is not a national rank and must not be presented as one.

Note also the peer context: at 40.0 Mississippi scores **above** Georgia (26.9) and Iowa (30.6), and just above Arizona (36.2). No state has yet scored below Georgia's 26.9, and Mississippi does not become the new floor. The widely held assumption that Mississippi sits at the bottom of any US state ranking is not supported by this evidence.

---

## Key Findings

- **The published score of 12.5 out of 100 was invented, not measured.** Mississippi, Alabama and Arkansas all carry the same 12.5 with identical dimension scores in the published index, and Mississippi's entry has never been assessed. On evidence, Mississippi scores 40.0 out of 100 — 27.5 points higher. This is a correction to a data defect. Mississippi did not improve; the old number was never real.

- **Mississippi is not the worst-scoring US state assessed so far.** At 40.0 it ranks above Georgia at 26.9, Iowa at 30.6 and Arizona at 36.2. Readers expect Mississippi at the bottom. The evidence does not put it there.

- **Early literacy is the largest thing the placeholder missed.** Mississippi passed the Literacy-Based Promotion Act in 2013 and held it for 13 years through four governors and a pandemic. Adjusted for student demographics, Mississippi ranked first in the nation in reading and maths on the 2024 federal NAEP test. Black students in Mississippi now outperform Black students in 47 other states in reading. This is independently measured and drives the state's strongest dimension.

- **Mississippi turns away more than nine in ten people who ask it for cash welfare.** Only about 125 applications a month clear the process. No other state rejects more than 90% of applicants. This produced the assessment's lowest subdimension score, 1 out of 5 for Refusal Ethics, because no structured alternative exists for the roughly 1,250 monthly applicants who are refused or give up.

- **The state's own watchdogs tell the truth about it, and that is the reason the score is not lower.** The State Auditor exposed about $77 million in misused welfare funds while pursuing well-connected people. The State Health Officer declared a public health emergency on 2025-08-21 over the state's own infant death rate of 9.7 per 1,000, the worst in a decade. A state committee publicly urges a Medicaid expansion the state government refuses. Truth-telling institutions raise Awareness, Accountability and Integrity well above the placeholder.

- **When told it has caused harm, Mississippi's reflex is to fight.** Corrections answered federal findings of unconstitutional prison conditions with "we disagree with the findings." The Attorney General moved in May 2026 to dismiss a decades-old foster-care case. The state contested the federal mental health case through to a successful appeal in 2023. Validation scored 1 out of 5.

## Strongest Dimensions

- **Systemic Thinking, 3.2 out of 5 (55.0/100).** Almost entirely early literacy. A sustained upstream intervention with peer-reviewed evidence and national influence.
- **Awareness, Accountability and Integrity, each 2.8 out of 5 (45.0/100).** All three rest on the same foundation: state institutions that publish damaging facts about the state without being made to.

## Weakest Dimensions

- **Empathy, 2.0 out of 5 (25.0/100).** Driven by Validation at 1 out of 5. Harm reports meet legal defence before acknowledgment, across corrections, foster care and mental health.
- **Boundaries, 2.0 out of 5 (25.0/100).** Driven by Refusal Ethics at 1 out of 5. The nation's highest welfare rejection rate, with no alternative offered.

## Evidence Gaps

- **Cultural Empathy (E5) and Consent Orientation (B5) are scored on thin evidence and marked low confidence.** No state-level cultural competency requirement or consent-quality review was found either way. Both were scored conservatively at 2 per the absence-of-evidence rule, which may understate them.
- **No independent audit of state employee turnover was located.** B1 and I3 rest on federal prison-vacancy findings and a published pay-rise policy, which cover corrections well and the rest of state government poorly.
- **The Mississippi Department of Mental Health's current-year annual report is not published online.** The department directs requests to a phone number. Mental health scoring therefore leans on the 2023 court monitor report and secondary reporting, which is older than ideal for a fast-moving service area.
- **Post-2023 mental health trajectory is genuinely uncertain.** The Fifth Circuit vacated the remedial order on 2023-09-20 and removed the monitor's mandate. What replaced that oversight is not publicly documented, so improvement or decline since cannot be verified either way.
- **Effect of federal actions on state data capacity.** The federal suspension of the Pregnancy Risk Assessment Monitoring System in 2025 may degrade the maternal data Mississippi's A1 score depends on. That is federal action, not state conduct, and is not scored against the state, but it puts the A1 score of 4 at forward risk.

## Recommended Next Steps

Mississippi scores 40.0, in the Developing band and one point from Functional. Based on this profile:

- **Developing band:** Consider a [Certified Assessment](/certified-assessments) for a structured improvement roadmap. The two lowest subdimensions — Refusal Ethics and Validation, both 1 out of 5 — are the highest-leverage targets, and both are process failures that do not require new appropriations to address.
- Given the band sits exactly on the 40/41 boundary, a certified assessment would also resolve whether Mississippi belongs in Developing or Functional. A single subdimension moving one point decides it.

---

## Sources

- Mississippi State Department of Health, Maternal Mortality Report, review of 2019-2023 — https://msdh.ms.gov/msdhsite/index.cfm/29,21452,299,pdf/Maternal_Mortality_Report_2025.pdf
- Mississippi State Department of Health, Infant Mortality Report, review of 2023-2024 — https://msdh.ms.gov/msdhsite/index.cfm/29,21453,299,pdf/Infant_Mortality_Report_2025.pdf
- Mississippi Today, health emergency over infant mortality, 2025-08-21 — https://mississippitoday.org/2025/08/21/mississippi-health-emergency-infant-mortality/
- Forbes, Mississippi declares public health emergency, 2025-08-28 — https://www.forbes.com/sites/angelicageter/2025/08/28/mississippi-declares-public-health-emergency-over-infant-mortality/
- WLBT, how the State Health Officer plans to address infant mortality, 2025-08-25 — https://www.wlbt.com/2025/08/25/how-state-health-officer-plans-address-infant-mortality-ms/
- US Department of Justice, findings report on three Mississippi prisons, 2024-02-26 — https://www.justice.gov/d9/2024-02/2024.02.26_ms_doc_findings_report_it_508_reviewed_0.pdf
- Mississippi Today, DOJ slams unconstitutional conditions, 2024-02-28 — https://mississippitoday.org/2024/02/28/justice-department-slams-unconstitutional-conditions-at-mississippi-prisons/
- Prison Legal News, DOJ declares conditions at three more prisons unconstitutional, 2024-09-15 — https://www.prisonlegalnews.org/news/2024/sep/15/doj-declares-conditions-three-more-mississippi-prisons-unconstitutional/
- Mississippi Today, TANF unspent millions and high denial rate, 2024-10-16 — https://mississippitoday.org/2024/10/16/tanf-mississippi-unspent-red-tape/
- Mississippi Today, Mississippi rejects most welfare applicants, 2022-10-05 — https://mississippitoday.org/2022/10/05/mississippi-reject-most-welfare-applicants/
- Mississippi Today, Supreme Court rules Fitch not White has authority, 2026-06-11 — https://mississippitoday.org/2026/06/11/lynn-fitch-shad-white-welfare-supreme-court/
- WDAM, State Auditor update on welfare scandal, 2025-12-05 — https://www.wdam.com/2025/12/05/state-auditor-shad-white-provides-update-mississippi-welfare-scandal/
- Mississippi Today, Medicaid expansion momentum is gone, 2026-03-15 — https://mississippitoday.org/2026/03/15/medicaid-expansion-legislature-one-big-beautiful-bill/
- NPR, why Medicaid expansion failed in Mississippi and Alabama, 2024-05-16 — https://www.npr.org/sections/health-shots/2024/05/16/1251691921/medicaid-expansion-mississippi-alabama-south
- Medicaid.gov, Mississippi SPA 23-0015 postpartum coverage, 2023-12-13 — https://www.medicaid.gov/medicaid-spa/2023-12-13/156951
- Mississippi Center for Justice, closing the gap in postpartum care access — https://mscenterforjustice.org/beyond-the-first-60-days-closing-the-gap-in-postpartum-care-access/
- Mississippi First, contextualizing Mississippi's 2024 NAEP scores — https://www.mississippifirst.org/contextualizing-mississippis-2024-naep-scores/
- The 74, there really was a Mississippi Miracle in reading — https://www.the74million.org/article/there-really-was-a-mississippi-miracle-in-reading-states-should-learn-from-it/
- ScienceDirect, comprehensive early literacy policy and the Mississippi Miracle, 2024 — https://www.sciencedirect.com/science/article/abs/pii/S027277572400092X
- The Conversation, Mississippi's education miracle as a model for global literacy reform — https://theconversation.com/mississippis-education-miracle-a-model-for-global-literacy-reform-251895
- Gelman, selection bias critique of the Mississippi miracle, 2025-12-01 — https://statmodeling.stat.columbia.edu/2025/12/01/how-much-of-mississippis-education-miracle-is-an-artifact-of-selection-bias/
- ITEP, a windfall for the wealthy, distributional analysis of Mississippi HB 1 — https://itep.org/mississippi-hb-1-tax-cuts-analysis/
- Mississippi Institutions of Higher Learning, fiscal and economic analysis of HB 1 — https://www.mississippi.edu/sites/default/files/ihl/files/HB1final.pdf
- Office of Governor Tate Reeves, signing of income tax elimination, 2025-03-27 — https://governorreeves.ms.gov/gov-reeves-signs-historic-legislation-eliminating-mississippis-individual-income-tax/
- Mississippi Today, policy analyst on income tax elimination risk, 2025-03-24 — https://mississippitoday.org/2025/03/24/policy-analyst-income-tax-elimination-risks-significant-harm-to-mississippis-future/
- Mississippi Today, Olivia Y. foster care dismissal motion, 2026-05-11 — https://mississippitoday.org/2026/05/11/olivia-y-foster-care-dismiss/
- WLOX, is Mississippi's CPS fixed, 2026-05-26 — https://www.wlox.com/2026/05/26/is-mississippis-cps-fixed-state-seeks-end-federal-oversight/
- Daily Journal, CPS requests additional $52 million — https://www.djournal.com/mississippi-today/cps-requests-additional-million-to-comply-with-olivia-y-settlement/article_77bda126-cf10-55ee-82e9-e7bbc8b8e8c8.html
- Mississippi Today, court overturns DOJ mental health effort, 2023-09-21 — https://mississippitoday.org/2023/09/21/federal-court-overturns-efforts-to-revamp-mental-health-system/
- Mississippi Today, mental health services report, 2022-03-08 — https://mississippitoday.org/2022/03/08/mental-health-lawsuit-report/
- Mental Health Mississippi, crisis stabilization units — https://mentalhealthms.com/crisis-stabilization-units/
- Mississippi Department of Mental Health, intensive community services — https://www.dmh.ms.gov/service-options/community-services/intensive-community-services/
- Mississippi Today, Goon Squad lawsuit settled for $2.5M, 2025-05-01 — https://mississippitoday.org/2025/05/01/goon-squad-lawsuit-settled-for-2-5m/
- Mississippi Today, rural hospitals and labor and delivery, 2025-05-13 — https://mississippitoday.org/2025/05/13/rural-hospitals-labor-and-delivery/
- Mississippi Today, obstetrics care is dwindling, 2025-08-07 — https://mississippitoday.org/2025/08/07/pregnant-people-rural-care/
- Mississippi Today, state flag removed after 126 years, 2020-06-28 — https://mississippitoday.org/2020/06/28/mississippi-furls-state-flag-with-confederate-emblem-after-126-years/
- Mississippi Free Press, Mississippi's long road to changing its state flag — https://www.mississippifreepress.org/you-white-people-dont-get-it-mississippis-long-ugly-road-to-changing-its-state-flag/
- Mississippi Today, Jackson water authority bill heads to governor, 2026-03-30 — https://mississippitoday.org/2026/03/30/jackson-water-authority-bill/
- Reporters Committee for Freedom of the Press, open government guide Mississippi — https://www.rcfp.org/open-government-guide/mississippi/
- MuckRock, Mississippi public records guide — https://www.muckrock.com/place/united-states-of-america/mississippi/
- Mississippi State Personnel Board, FY 2026 variable compensation plan — https://www.mspb.ms.gov/sites/mspb/files/MSPB_File/Resources%20for%20HR/Policies/FY%202026%20Policies/FY%202026%20VCP.pdf
- healthinsurance.org, Medicaid eligibility and enrollment in Mississippi — https://www.healthinsurance.org/medicaid/mississippi/

---

*This assessment is based on publicly available information and does not constitute a formal Compassion Benchmark Certified Assessment. For a comprehensive, assessor-led evaluation, visit compassionbenchmark.com/certified-assessments.*
