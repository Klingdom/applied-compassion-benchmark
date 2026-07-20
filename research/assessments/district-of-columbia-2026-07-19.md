---
entity: "Washington DC"
type: "State"
sector: "Government"
date: "2026-07-19"
composite_score: 52.5
band: "Functional"
scores:
  AWR: 3.8
  EMP: 3.0
  ACT: 3.0
  EQU: 3.2
  BND: 2.4
  ACC: 3.4
  SYS: 3.6
  INT: 2.4
published_index: "us-states"
published_rank: 4
published_composite: 92.8
published_band: "Exemplary"
---

# Compassion Benchmark Assessment: Washington DC

**Entity type:** State (District of Columbia — a federal district scored in the US States index)
**Sector/Domain:** Government
**Assessment date:** 2026-07-19
**Composite score:** 52.5/100
**Band:** Functional

## Score Summary

| Dimension | Code | Score (raw 1-5) | Score (0-100) | Band |
|-----------|------|-----------------|---------------|------|
| Awareness | AWR | 3.8 | 70.0 | Established |
| Empathy | EMP | 3.0 | 50.0 | Functional |
| Action | ACT | 3.0 | 50.0 | Functional |
| Equity | EQU | 3.2 | 55.0 | Functional |
| Boundaries | BND | 2.4 | 35.0 | Developing |
| Accountability | ACC | 3.4 | 60.0 | Functional |
| Systemic Thinking | SYS | 3.6 | 65.0 | Established |
| Integrity | INT | 2.4 | 35.0 | Developing |
| **Composite** | — | — | **52.5** | **Functional** |

Composite verified by `computeCompositeFromDimensions` in `site/scripts/lib/scoring.mjs`. Output: `{"composite":52.5,"band":"Functional","integrationPremium":0}`. All 8 dimensions sit below 4.0, so the weakness factor is 0 and the integration premium is 0.

---

## The attribution problem, stated plainly

Washington DC is not a state, and this changes what the score means. Congress can override District laws, controls the District's budget review, and in 2025 took direct control of District policing. If an assessor scores federal action against the District, the resulting number measures Congress, not the District government.

This assessment scores only what the District government itself chose to do.

**Excluded — federal conduct, not scored against Washington DC:**

- The President's invocation of section 740 of the DC Home Rule Act on 11 August 2025, which put the Metropolitan Police Department under federal control for the first time in the Act's history ([CNN, 2025-08-12](https://www.cnn.com/2025/08/12/politics/trump-federalized-dc-crime-home-rule-act-hnk)).
- The deployment of about 2,300 National Guard troops from seven states ([DC Office of the Attorney General, 2025-09-04](https://oag.dc.gov/release/attorney-general-schwalb-sues-end-illegal-national)).
- Encampment clearings run by federal agencies — the White House counted 48 sites ([CNN, 2025-08-14](https://www.cnn.com/2025/08/14/politics/washington-dc-homeless-trump)).
- The congressional restriction that cut the District off from $347 million of its own local tax revenue.
- Congressional disapproval resolutions, including H.J.Res.42 against the District's own 2022 policing reform law ([Congress.gov, 2023-03-09](https://www.congress.gov/bill/118th-congress/house-joint-resolution/42)).

**Included — District discretion, and scored:**

- The Mayor's choice on 6 March 2025 to clear an encampment with one day's notice, when District policy promises 14 days. Federal pressure prompted it; the District chose the response ([Washington Post, 2025-03-06](https://www.washingtonpost.com/dc-md-va/2025/03/06/homeless-trump-dc-bowser/)).
- Which programs absorbed the FY2026 budget gap: the Child Tax Credit was eliminated, Baby Bonds halted, and rental assistance cut.
- The Council's own Secure DC Omnibus Amendment Act of 2024.
- The $434 million Cedar Hill hospital in Ward 8, funded by the District.
- Medicaid eligibility set at 215% of the federal poverty level — a District policy choice.
- The Attorney General's decision to sue the federal government over the Guard deployment. That is District discretion, and it counts in the District's favour.

**One more caveat.** Washington DC runs municipal services and state services through one government. States devolve schools, police and sanitation to cities and counties. So the District is scored on frontline delivery failures that a state government would never be scored on. The Ward 3 versus Ward 8 school gap is the clearest case: here it lands on the District, whereas in a state it would land on a school district. Read EQU and ACT as covering a wider span of responsibility than the same codes cover elsewhere.

---

## Dimension Details

### AWR: Awareness (Score: 3.8/5 — 70/100)

| Subdimension | Score | Evidence | Source |
|-------------|-------|----------|--------|
| A1 Suffering Detection | 4/5 | Annual point-in-time homelessness count disaggregated by family, individual and youth; 2026 count published a 4.4% overall rise and a 15.8% rise in family homelessness. Police complaints tracked and published annually. | [Mayor's Office, 2026](https://mayor.dc.gov/release/2026-point-time-results-provide-latest-snapshot-homelessness-district); [OPC FY25 Annual Report](https://policecomplaints.dc.gov/sites/default/files/dc/sites/office%20of%20police%20complaints/publication/attachments/OPC%20FY25%20Annual%20Report_Final.pdf) |
| A2 Contextual Sensitivity | 4/5 | Homelessness data broken out by transition-age youth (18-24), families and unaccompanied individuals; Homeward DC names eliminating racial inequity in the shelter system as an explicit goal. | [ICH Homeward DC 2.0](https://ich.dc.gov/page/homeward-dc-20-ich-strategic-plan-fy2021-fy2025) |
| A3 Blind Spot Mitigation | 4/5 | The DC Auditor runs continuous structured review and publishes findings the District did not ask for — including that 96% of one commission's spending broke District rules. | [ODCA, 2025-04-25](https://dcauditor.org/wp-content/uploads/2025/04/ANC8E.Report.4.25.25.Web_.pdf); [ODCA, 2025-01-28](https://dcauditor.org/wp-content/uploads/2025/01/2025.Recommendation.Compliance.1.28.25.web_.pdf) |
| A4 Signal Amplification | 4/5 | Four standing bodies carry low-power voices into government: the Corrections Information Council inspects jails, the Office of Police Complaints has issued 79 sets of recommendations to date. | [CIC, 2025](https://cic.dc.gov/sites/default/files/dc/sites/cic/page_content/attachments/YRA%20report%202025.pdf); [OPC, 2026](https://policecomplaints.dc.gov/release/office-police-complaints-releases-fiscal-year-2025-annual-report) |
| A5 Anticipatory Awareness | 3/5 | Formal review exists for legislation, but the FY2026 budget passed without visible harm assessment. The DC Fiscal Policy Institute called it "an inequality agenda". | [DCFPI, 2025-05](https://dcfpi.org/all/a-first-look-at-the-mayors-budget-an-inequality-agenda/) |

### EMP: Empathy (Score: 3.0/5 — 50/100)

| Subdimension | Score | Evidence | Source |
|-------------|-------|----------|--------|
| E1 Affective Resonance | 3/5 | The DC General shelter replacement was explicitly designed around dignity, with private family rooms and homework space. But in November 2025 hundreds of residents queued in person for a chance at rental aid. | [DHS](https://dhs.dc.gov/page/closing-dc-general-family-shelter-storyboard); [Washington Post, 2025-11-21](https://www.washingtonpost.com/dc-md-va/2025/11/21/emergency-rental-aid-dc-erap-eviction/) |
| E2 Perspective-Taking | 3/5 | The Interagency Council on Homelessness built a 100-strategy plan with provider and consumer input; rental aid was redesigned to an appointment system after the queue problem. Consultation, not shared decision power. | [Homeward DC report](https://dmhhs.dc.gov/sites/default/files/dc/sites/dmhhs/page_content/attachments/Homeward-DC-Report_FY2021-2025.pdf); [Street Sense, 2025-11](https://streetsensemedia.org/article/erap-reopens-nov20/) |
| E3 Non-Judgment | 3/5 | Complaint data is collected and published, which is more than most jurisdictions do. But of 1,065 complaints in FY2025, misconduct was sustained in 10 — under 1%. Harassment was 51% of all allegations. | [OPC FY25 Annual Report](https://policecomplaints.dc.gov/sites/default/files/dc/sites/office%20of%20police%20complaints/publication/attachments/OPC%20FY25%20Annual%20Report_Final.pdf) |
| E4 Validation | 2/5 | The District gave encampment residents one day to move when its own published policy promises 14 days. The residents' need for time was not treated as legitimate. | [NBC4, 2025-03](https://www.nbcwashington.com/news/local/trump-says-dc-must-clear-unsightly-homeless-encampments/3860501/); [Washington Post, 2025-03-06](https://www.washingtonpost.com/dc-md-va/2025/03/06/homeless-trump-dc-bowser/) |
| E5 Cultural Empathy | 4/5 | Cedar Hill hospital was built around Black maternal health needs in Wards 7 and 8, with a Level II NICU, after the District's own maternal mortality review identified the gap. Core service design changed. | [Washington Informer, 2025](https://www.washingtoninformer.com/cedar-hill-regional-medical/); [WJLA, 2025](https://wjla.com/newsletter-daily/maternal-mortality-rates-women-color-black-pregnant-pregnancy-ward-7-undeserved-community-hospital-east-anacostia-river-rochanda-mitchell-howard-university-donald-trump-federal-funds) |

### ACT: Action (Score: 3.0/5 — 50/100)

| Subdimension | Score | Evidence | Source |
|-------------|-------|----------|--------|
| AC1 Responsiveness | 2/5 | Rental assistance opened once in all of FY2025, versus four times in prior years. Residents applied for over $20 million in under six hours, and the portal shut for the rest of the year. | [DHS ERAP](https://dhs.dc.gov/service/emergency-rental-assistance-program); [Washington Post, 2025-11-21](https://www.washingtonpost.com/dc-md-va/2025/11/21/emergency-rental-aid-dc-erap-eviction/) |
| AC2 Proportionality | 3/5 | The District put $434 million into a hospital in its poorest ward — resources genuinely following need. In the same period it proposed an 80% cut to rental aid for people under 40% of area median income. | [Washington Post, 2025-02-06](https://www.washingtonpost.com/dc-md-va/2025/02/06/dc-new-cedar-hill-hospital-april-opening/); [DCFPI, 2025-05](https://dcfpi.org/all/a-first-look-at-the-mayors-budget-an-inequality-agenda/) |
| AC3 Efficacy | 3/5 | Independent researchers evaluated the District's two violence interruption programs in a peer-reviewed journal. The District publishes outcome data that makes it look bad, including the 2026 homelessness rise. | [American Journal of Epidemiology, 2026](https://academic.oup.com/aje/advance-article/doi/10.1093/aje/kwag023/8454589); [Mayor's Office, 2026](https://mayor.dc.gov/release/2026-point-time-results-provide-latest-snapshot-homelessness-district) |
| AC4 Resource Mobilization | 3/5 | Major capital mobilised for Ward 8 health care. Offset by underfunding the child care subsidy program into a FY2026 shortfall. | [Mayor's Office](https://mayor.dc.gov/release/mayor-bowser-announces-new-cedar-hill-regional-medical-center-gw-health-st-elizabeths-east); [DCFPI, 2025](https://dcfpi.org/all/cutting-reimbursement-rates-in-the-dc-child-care-subsidy-program-would-cripple-budgets-and-force-classrooms-to-close/) |
| AC5 Follow-Through | 4/5 | Eleven years of continuous published homelessness tracking. Family homelessness is down 54.8% since 2015 and 35.5% since 2020 — sustained work across multiple strategic plans. | [Mayor's Office, 2026](https://mayor.dc.gov/release/2026-point-time-results-provide-latest-snapshot-homelessness-district); [ICH](https://ich.dc.gov/page/homeward-dc-20-ich-strategic-plan-fy2021-fy2025) |

### EQU: Equity (Score: 3.2/5 — 55/100)

| Subdimension | Score | Evidence | Source |
|-------------|-------|----------|--------|
| EQ1 Universality | 4/5 | The District sets Medicaid eligibility at 215% of the federal poverty level. Most states stop at 138%. Its uninsured rate is among the lowest in the country. | [healthinsurance.org, 2025](https://www.healthinsurance.org/medicaid/dc/); [US Census Bureau, 2025-09](https://www.census.gov/library/stories/2025/09/uninsured-rates.html) |
| EQ2 Priority for Vulnerable | 3/5 | Cedar Hill sited east of the Anacostia is a documented prioritisation decision. But when money got tight in FY2026, the programs cut were the ones serving the poorest residents. | [Washington Post, 2025-02-06](https://www.washingtonpost.com/dc-md-va/2025/02/06/dc-new-cedar-hill-hospital-april-opening/); [DCFPI, 2025-05](https://dcfpi.org/all/a-first-look-at-the-mayors-budget-an-inequality-agenda/) |
| EQ3 Bias Awareness | 3/5 | Disparities are measured and published in detail. They are also enormous and persistent: 7 of 10 Ward 3 students met reading expectations against 2 of 10 in Ward 8, and 1 of 10 in Ward 8 for maths. | [DC Policy Center, 2025](https://www.dcpolicycenter.org/publications/stateofdcschools2024-25/); [DCPS, 2025](https://dcps.dc.gov/release/nation%E2%80%99s-report-card-shows-continued-improvement-district%E2%80%99s-public-schools) |
| EQ4 Access Design | 3/5 | Services are sited well — hospital and family shelters placed in the wards that need them. Rental aid access design is the opposite: an overnight physical queue is a barrier the District created itself. | [Washington Post, 2025-11-21](https://www.washingtonpost.com/dc-md-va/2025/11/21/emergency-rental-aid-dc-erap-eviction/); [Street Sense, 2025-11](https://streetsensemedia.org/article/erap-reopens-nov20/) |
| EQ5 Historical Harm Acknowledgment | 3/5 | The District named DC General shelter as a failure and closed it. Cedar Hill answers the loss of maternity care east of the river. Concrete, but not framed as reparative and not co-developed with those harmed. | [DHS](https://dhs.dc.gov/page/closing-dc-general-family-shelter-storyboard); [Washington Informer, 2025](https://www.washingtoninformer.com/cedar-hill-regional-medical/) |

### BND: Boundaries (Score: 2.4/5 — 35/100)

| Subdimension | Score | Evidence | Source |
|-------------|-------|----------|--------|
| B1 Self-Sustainability | 2/5 | No published District workforce sustainability data was found. The FY2026 budget avoided furloughs but froze hiring, and District job openings rose to 33,000 in December 2025. Low confidence. | [BLS, 2025-12](https://www.bls.gov/regions/mid-atlantic/news-release/jobopeningslaborturnover_dc.htm) |
| B2 Autonomy Preservation | 3/5 | Short-term family housing is built to stabilise and exit, with wrap-around services. The stated goal is homelessness that is "rare, brief, and nonrecurring". Exit outcomes are not independently verified. | [DHS](https://dhs.dc.gov/page/closing-dc-general-family-shelter-storyboard); [ICH](https://ich.dc.gov/page/homeward-dc-20-ich-strategic-plan-fy2021-fy2025) |
| B3 Scope Clarity | 2/5 | The District advertised rental assistance it could not deliver. Residents applied for over $20 million in six hours and the program closed for the year. People invested effort before learning the limit. | [DHS ERAP](https://dhs.dc.gov/service/emergency-rental-assistance-program); [Washington Post, 2025-11-21](https://www.washingtonpost.com/dc-md-va/2025/11/21/emergency-rental-aid-dc-erap-eviction/) |
| B4 Refusal Ethics | 2/5 | The District removed the requirement that judges pause eviction proceedings for tenants with a pending aid application. People are refused without an alternative, and now without a delay either. | [Street Sense, 2025](https://streetsensemedia.org/article/erap-reform-limits-eviction-delays/); [NBC4, 2025-03](https://www.nbcwashington.com/news/local/trump-says-dc-must-clear-unsightly-homeless-encampments/3860501/) |
| B5 Consent Orientation | 3/5 | Eligibility rules and encampment protocol are published in plain terms on District sites. No evidence of verification that residents actually understand them. Low confidence. | [DMHHS Encampments](https://dmhhs.dc.gov/page/encampments); [DHS ERAP](https://dhs.dc.gov/service/emergency-rental-assistance-program) |

### ACC: Accountability (Score: 3.4/5 — 60/100)

| Subdimension | Score | Evidence | Source |
|-------------|-------|----------|--------|
| AB1 Harm Acknowledgment | 3/5 | The Mayor published rising homelessness numbers rather than burying them. But the housing agency's answer to a damning audit was titled to ask readers to "remember unprecedented successes" — deflection alongside acknowledgment. | [DHCD](https://dhcd.dc.gov/release/dhcd-response-odca-report-housing-production-trust-fund-remember-unprecedented-affordable); [Mayor's Office, 2026](https://mayor.dc.gov/release/2026-point-time-results-provide-latest-snapshot-homelessness-district) |
| AB2 Correction Willingness | 4/5 | On 4 February 2025 the Council voted unanimously to expel a sitting member facing a federal bribery charge — the first expulsion in its modern history, and taken before any court decided the case. | [Washington Times, 2025-02-04](https://www.washingtontimes.com/news/2025/feb/4/d-c-council-votes-unanimously-expel-trayon-white-b/) |
| AB3 Transparency | 4/5 | Four independent bodies publish damaging findings nobody compelled. The Auditor publishes its own recommendation compliance rate — 64% in place or in progress, meaning it also publishes the 36% that is not. | [ODCA, 2025-01-28](https://dcauditor.org/wp-content/uploads/2025/01/2025.Recommendation.Compliance.1.28.25.web_.pdf); [OPC FY25](https://policecomplaints.dc.gov/sites/default/files/dc/sites/office%20of%20police%20complaints/publication/attachments/OPC%20FY25%20Annual%20Report_Final.pdf); [RCFP](https://www.rcfp.org/open-government-guide/district-of-columbia/) |
| AB4 Systemic Learning | 4/5 | The Auditor tracks whether its own past recommendations were actually implemented, across multi-year windows, and publishes the rate. That is a structural learning loop, not a one-off review. | [ODCA](https://dcauditor.org/report/54-of-auditor-recommendations-implemented-or-in-progress/); [ODCA, 2025-01-28](https://dcauditor.org/wp-content/uploads/2025/01/2025.Recommendation.Compliance.1.28.25.web_.pdf) |
| AB5 Reparative Action | 2/5 | Federal inspectors found in 2021 that the DC jail failed minimum confinement standards, with food and water denied as punishment. No evidence was found of concrete repair to the people held there. | [US Marshals Service, 2021-11](https://www.usmarshals.gov/news/press-release/statement-us-marshals-service); [CIC, 2025](https://cic.dc.gov/sites/default/files/dc/sites/cic/page_content/attachments/YRA%20report%202025.pdf) |

### SYS: Systemic Thinking (Score: 3.6/5 — 65/100)

| Subdimension | Score | Evidence | Source |
|-------------|-------|----------|--------|
| S1 Root Cause Orientation | 4/5 | The District funds upstream work at scale: Birth-to-Three, universal pre-K, and paid family leave paying up to $1,190 a week. Family homelessness has fallen 54.8% since 2015 — downstream demand actually dropped. | [ZERO TO THREE, 2018](https://www.zerotothree.org/resource/washington-d-c-passes-birth-to-three-for-all-dc-act-of-2018/); [DOES, 2025-09-28](https://does.dc.gov/page/dc-paid-family-leave); [Mayor's Office, 2026](https://mayor.dc.gov/release/2026-point-time-results-provide-latest-snapshot-homelessness-district) |
| S2 Long-Term Impact | 4/5 | Homeward DC uses system modelling and housing inventory projections across 12 strategic goals, with outcomes tracked continuously against a 2015 baseline. | [Homeward DC report](https://dmhhs.dc.gov/sites/default/files/dc/sites/dmhhs/page_content/attachments/Homeward-DC-Report_FY2021-2025.pdf); [Mayor's Office, 2026](https://mayor.dc.gov/release/2026-point-time-results-provide-latest-snapshot-homelessness-district) |
| S3 Interconnection Awareness | 3/5 | The District recognised that rental aid applications were interacting with the eviction court system and changed the law. It recognised the connection, then resolved it against tenants. | [Street Sense, 2025](https://streetsensemedia.org/article/erap-reform-limits-eviction-delays/); [ICH](https://ich.dc.gov/page/homeward-dc-20-ich-strategic-plan-fy2021-fy2025) |
| S4 Structural Critique | 4/5 | The District's Attorney General sued the federal government over the Guard deployment and won at district court on 20 November 2025. That is a position taken at real institutional risk against a far more powerful actor. | [OAG, 2025-09-04](https://oag.dc.gov/release/attorney-general-schwalb-sues-end-illegal-national); [OAG, 2025-11-20](https://oag.dc.gov/release/attorney-general-schwalb-issues-statement-court) |
| S5 Coalitional Compassion | 3/5 | The Interagency Council and Building Blocks DC both route District money and coordination to community organisations. No evidence of the District ceding leadership or credit. | [Building Blocks DC](https://www.buildingblocks.dc.gov/community-violence-intervention); [Homeward DC report](https://dmhhs.dc.gov/sites/default/files/dc/sites/dmhhs/page_content/attachments/Homeward-DC-Report_FY2021-2025.pdf) |

### INT: Integrity (Score: 2.4/5 — 35/100)

| Subdimension | Score | Evidence | Source |
|-------------|-------|----------|--------|
| I1 Consistency Under Pressure | 3/5 | Both directions in the same year. The Attorney General bore real cost suing the federal government in September 2025. Six months earlier the Mayor abandoned the District's own 14-day encampment notice policy within hours of federal pressure. | [Axios, 2025-09-04](https://www.axios.com/local/washington-dc/2025/09/04/dc-lawsuit-remove-national-guard-attorney-general-brian-schwalb); [Washington Post, 2025-03-06](https://www.washingtonpost.com/dc-md-va/2025/03/06/homeless-trump-dc-bowser/) |
| I2 Non-Performance | 3/5 | The District publishes numbers that embarrass it — rising homelessness, a 64% recommendation compliance rate. Much of that comes from independent bodies rather than the executive. | [Mayor's Office, 2026](https://mayor.dc.gov/release/2026-point-time-results-provide-latest-snapshot-homelessness-district); [ODCA, 2025-01-28](https://dcauditor.org/wp-content/uploads/2025/01/2025.Recommendation.Compliance.1.28.25.web_.pdf) |
| I3 Internal Consistency | 2/5 | No published evidence found on whether District staff experience the values the District states externally. Hiring freeze and rising vacancies are the only signal. Low confidence — this is an evidence gap, not a finding of failure. | [BLS, 2025-12](https://www.bls.gov/regions/mid-atlantic/news-release/jobopeningslaborturnover_dc.htm) |
| I4 Values Alignment | 2/5 | In 2022 the Council passed policing reform unanimously. In March 2024 the same Council passed Secure DC, expanding pretrial detention. Advocacy groups that had backed the earlier bill condemned the reversal. | [The Eagle, 2024-03-05](https://www.theeagleonline.com/article/2024/03/dc-council-votes-to-pass-secure-dc-crime-bill); [The Sentencing Project, 2024-03](https://www.sentencingproject.org/press-releases/the-sentencing-project-condemns-dc-councils-passage-of-secure-dc-crime-bill/) |
| I5 Resilience of Care | 2/5 | Core practices sit in policy and have survived. But Washington DC has had one mayor since 2015, so no leadership transition has ever tested whether they survive a change of leader. Untested, not proven. | [ICH](https://ich.dc.gov/page/homeward-dc-20-ich-strategic-plan-fy2021-fy2025); [Axios, 2025-07-16](https://www.axios.com/local/washington-dc/2025/07/16/trayon-white-wins-ward-8-election) |

---

## Published Index Comparison

**Published index:** US States | **Published rank:** #4 of 21 listed | **Published composite:** 92.8/100 | **Published band:** Exemplary

The published entry is a bulk-import placeholder. Its `last_assessed` field is null and it has no evidentiary basis. It was never an assessment. This report is the first evidence-based baseline for Washington DC.

| Dimension | Published (raw) | Published (scaled) | Research (raw) | Research (scaled) | Difference | Explanation |
|-----------|----------------|-------------------|----------------|-------------------|------------|-------------|
| AWR | 4.5 | 87.5 | 3.8 | 70.0 | -17.5 | Detection is genuinely strong, but no harm assessment preceded the FY2026 budget. |
| EMP | 4.5 | 87.5 | 3.0 | 50.0 | -37.5 | One-day encampment notice against a 14-day policy; under 1% of police complaints sustained. |
| ACT | 4.5 | 87.5 | 3.0 | 50.0 | -37.5 | Rental assistance opened once all year and closed in six hours. |
| EQU | 4.0 | 75.0 | 3.2 | 55.0 | -20.0 | Near-universal health coverage offset by a Ward 3 to Ward 8 school gap of 7-in-10 versus 2-in-10. |
| BND | 4.5 | 87.5 | 2.4 | 35.0 | -52.5 | Largest gap. Scope overstated, refusals without alternatives, eviction protection removed. |
| ACC | 4.0 | 75.0 | 3.4 | 60.0 | -15.0 | Smallest gap. Oversight infrastructure is real; repair to harmed people is not evidenced. |
| SYS | 4.5 | 87.5 | 3.6 | 65.0 | -22.5 | Strong upstream investment; no evidence of ceding leadership to better-placed partners. |
| INT | 4.0 | 75.0 | 2.4 | 35.0 | -40.0 | Values reversal on policing; resilience untested across 11 years of one mayoralty. |
| **Composite** | — | **92.8** | — | **52.5** | **-40.3** | Data-defect correction, not institutional decline. |

### Score Difference Analysis

**BND, -52.5 points — the largest gap.** The placeholder implied that District help is sustainable and preserves autonomy. The evidence shows the opposite at the point of contact. The District advertised rental assistance, took over $20 million in applications in six hours, then shut the program for the rest of the year. It then removed the rule requiring judges to pause eviction cases for tenants with pending applications. A resident can now be refused aid and evicted in the same window. That is a boundaries failure in the specific sense the methodology means: help promised beyond capacity, refusal without alternative.

**INT, -40.0 points.** The placeholder implied consistent, non-performative compassion. Two findings contradict it. First, the Council passed policing reform unanimously in 2022 and then expanded pretrial detention in March 2024 through Secure DC, which the Sentencing Project condemned. Second, Washington DC has had the same mayor since 2015, so no leadership transition has ever tested whether its practices survive one. Untested is not the same as fragile, but the methodology does not award points for untested.

**EMP and ACT, -37.5 points each.** Both turn on the same underlying pattern: the District's strategy documents are more compassionate than its counters. Homeward DC is a serious plan. The point-in-time count shows family homelessness up 15.8% in 2026. The Office of Police Complaints received 1,065 complaints and sustained 10.

**ACC, -15.0 points — the smallest gap, and the published score was closest to right.** Washington DC funds four independent oversight bodies that publish findings damaging to the District, uncompelled. The Auditor publishes its own recommendation compliance rate, which means publishing the share not implemented. The Council expelled one of its own members before any court ruled. This is the dimension where the District most nearly deserves its placeholder.

### Cross-state rule disposition — AB3 Transparency (v3)

**Declined. The precondition is not met.**

The rule needs both limbs. Limb (b) is met easily: independently funded bodies are publishing damaging findings. Limb (a) is not. No branch of District government exempts itself from the DC Freedom of Information Act — the Council publishes its own FOIA process and the Mayor's Office of Legal Counsel publishes appeal summaries. The District's use of the deliberative process exemption is an enumerated carve-out, and the Idaho refinement says enumerated exemptions alone do not trigger the cap. No evidence was found that any oversight body had its remit narrowed, its independence removed, or its funding cut between 2021 and 2026.

Following the Connecticut counter-case, AB3 is scored on the merits at 4, not capped at 3.

**Scoring effect:** AB3 at 4 gives ACC 3.4 and composite 52.5. Had the cap applied and AB3 scored 3, ACC would be 3.2 and composite 51.9. Both are Functional. The difference is 0.6 points.

### Recommendation

The published 92.8 is overstated by roughly 40 points and should be replaced. The correction is a data defect fix, not a finding that Washington DC declined. Recommended action: `update-entity`, with rank set to null until the index is rebuilt with all 51 jurisdictions.

---

## Key Findings

- **Washington DC scores 52.5 out of 100 — "Functional" — not the 92.8 currently published.** The published figure was a bulk-import placeholder with no evidence behind it. It was never an assessment of anything. The 40-point drop measures a data defect, not a decline in how the District treats people.

- **The District's biggest weakness is what happens when it says no.** Boundaries scored 2.4 out of 5, its joint-lowest. In fiscal year 2025 the District opened rental assistance once instead of four times. Residents applied for more than $20 million in under six hours and the program closed for the year. The District then removed the rule requiring judges to pause eviction cases for tenants waiting on that aid.

- **Washington DC invests upstream better than almost any jurisdiction assessed, and the numbers show it working.** Family homelessness is down 54.8% since 2015. The District funds paid family leave at up to $1,190 a week, universal pre-K, and the Birth-to-Three programme. Systemic Thinking scored 3.6 out of 5, one of its two strongest areas.

- **The District built a $434 million hospital in its poorest ward, and still runs one of the widest internal gaps in the country.** Cedar Hill opened in Ward 8 on 15 April 2025 — the first new hospital in the city in 25 years. In the same city, 7 of 10 Ward 3 students met reading expectations against 2 of 10 in Ward 8.

- **Federal intervention was excluded from the score, and that exclusion is the whole methodology here.** The 2025 police takeover, the 2,300 National Guard troops, and the $347 million congressional revenue cut are Congress's conduct, not the District's. What was scored includes the District's own choice to clear an encampment with one day's notice when its policy promises 14 — and its Attorney General's choice to sue the federal government and win.

## Strongest Dimensions

- **Awareness (3.8/5).** The District measures its own suffering seriously — annual homelessness counts broken out by household type, published police complaint data, four independent oversight bodies feeding findings back in.
- **Systemic Thinking (3.6/5).** Long-horizon planning with real modelling, sustained upstream investment, and an Attorney General willing to challenge a far more powerful actor in court.
- **Accountability (3.4/5).** The Auditor publishes how many of its own recommendations were ignored. The Council expelled a sitting member before any court ruled.

## Weakest Dimensions

- **Boundaries (2.4/5) and Integrity (2.4/5), tied.** Boundaries fails on scope honesty and refusal ethics. Integrity fails on values consistency — a unanimous 2022 policing reform partly reversed by the same Council in 2024 — and on resilience that 11 years of one mayoralty has never tested.
- **Empathy (3.0/5) and Action (3.0/5).** Both reflect a gap between strategy documents and counters. Under 1% of police complaints sustained; family homelessness up 15.8% in the 2026 count.

## Evidence Gaps

- **District workforce sustainability (B1) and internal culture (I3).** No published District-specific turnover, vacancy or staff-experience data was found. Both scored 2 with low confidence. These are gaps, not findings of failure; direct institutional engagement could move either.
- **Consent practice (B5).** Eligibility rules are published clearly, but no evidence was found on whether residents with low literacy or limited English actually understand them. Scored 3, low confidence.
- **Housing Production Trust Fund audit currency.** The most recent comprehensive audit located dates from 2017. It is cited under AB1 for the agency's deflecting response, weighted lightly, and dated at year precision.
- **Jail conditions since 2021.** The US Marshals findings are well documented for 2021. Current conditions and any repair to those held are not evidenced, which drove AB5 to 2.

## Recommended Next Steps

Washington DC lands in the **Functional** band. Systems exist and several are genuinely strong, but they have significant gaps — most sharply at the point where the District tells a resident no.

- Consider [Advisory Support](/advisory) to translate these findings into action, prioritising Boundaries: scope honesty in benefit programs, and a refusal protocol that guarantees a concrete alternative.
- The two lowest-confidence areas — workforce sustainability and internal culture — would benefit most from a [Certified Assessment](/certified-assessments), which involves direct institutional engagement rather than desk research.

---

## Sources

- [Mayor's Office — 2026 Point-In-Time Results](https://mayor.dc.gov/release/2026-point-time-results-provide-latest-snapshot-homelessness-district)
- [DHS — 2025 Point-In-Time Results](https://dhs.dc.gov/release/2025-point-time-results-show-decrease-homelessness-highlighting-continued-success-key)
- [Interagency Council on Homelessness — Homeward DC 2.0](https://ich.dc.gov/page/homeward-dc-20-ich-strategic-plan-fy2021-fy2025)
- [Homeward DC Strategic Plan FY2021-FY2025 (PDF)](https://dmhhs.dc.gov/sites/default/files/dc/sites/dmhhs/page_content/attachments/Homeward-DC-Report_FY2021-2025.pdf)
- [Office of Police Complaints — FY2025 Annual Report (PDF)](https://policecomplaints.dc.gov/sites/default/files/dc/sites/office%20of%20police%20complaints/publication/attachments/OPC%20FY25%20Annual%20Report_Final.pdf)
- [Office of Police Complaints — FY2025 Annual Report release](https://policecomplaints.dc.gov/release/office-police-complaints-releases-fiscal-year-2025-annual-report)
- [Office of the DC Auditor — Recommendation Compliance, 2025-01-28 (PDF)](https://dcauditor.org/wp-content/uploads/2025/01/2025.Recommendation.Compliance.1.28.25.web_.pdf)
- [Office of the DC Auditor — ANC 8E Report, 2025-04-25 (PDF)](https://dcauditor.org/wp-content/uploads/2025/04/ANC8E.Report.4.25.25.Web_.pdf)
- [Office of the DC Auditor — Recommendation implementation](https://dcauditor.org/report/54-of-auditor-recommendations-implemented-or-in-progress/)
- [Corrections Information Council — YRA Report 2025 (PDF)](https://cic.dc.gov/sites/default/files/dc/sites/cic/page_content/attachments/YRA%20report%202025.pdf)
- [US Marshals Service — statement on DC jail inspection](https://www.usmarshals.gov/news/press-release/statement-us-marshals-service)
- [DHS — Closing DC General Family Shelter](https://dhs.dc.gov/page/closing-dc-general-family-shelter-storyboard)
- [DHS — Emergency Rental Assistance Program](https://dhs.dc.gov/service/emergency-rental-assistance-program)
- [Washington Post — Hundreds wait in line for emergency rental assistance, 2025-11-21](https://www.washingtonpost.com/dc-md-va/2025/11/21/emergency-rental-aid-dc-erap-eviction/)
- [Street Sense — ERAP reopens with appointment system](https://streetsensemedia.org/article/erap-reopens-nov20/)
- [Street Sense — DC Council seeks to redefine ERAP](https://streetsensemedia.org/article/erap-reform-limits-eviction-delays/)
- [Washington Post — DC speeds up clearing homeless encampment, 2025-03-06](https://www.washingtonpost.com/dc-md-va/2025/03/06/homeless-trump-dc-bowser/)
- [NBC4 Washington — One day to leave encampment](https://www.nbcwashington.com/news/local/trump-says-dc-must-clear-unsightly-homeless-encampments/3860501/)
- [DMHHS — Encampments policy](https://dmhhs.dc.gov/page/encampments)
- [CNN — Trump federalized DC police, 2025-08-12](https://www.cnn.com/2025/08/12/politics/trump-federalized-dc-crime-home-rule-act-hnk)
- [CNN — Crackdown hits DC's homeless population, 2025-08-14](https://www.cnn.com/2025/08/14/politics/washington-dc-homeless-trump)
- [DC Office of the Attorney General — Suit to end Guard deployment, 2025-09-04](https://oag.dc.gov/release/attorney-general-schwalb-sues-end-illegal-national)
- [DC Office of the Attorney General — Statement on court ruling, 2025-11-20](https://oag.dc.gov/release/attorney-general-schwalb-issues-statement-court)
- [Axios — DC Attorney General sues to block Guard deployment, 2025-09-04](https://www.axios.com/local/washington-dc/2025/09/04/dc-lawsuit-remove-national-guard-attorney-general-brian-schwalb)
- [Military.com — Appeals court pauses ruling, 2025-12-05](https://www.military.com/daily-news/2025/12/05/court-decision-calling-end-national-guard-deployment-dc-paused-appeals-court.html)
- [Congress.gov — H.J.Res.42, 118th Congress](https://www.congress.gov/bill/118th-congress/house-joint-resolution/42)
- [Washington Post — Cedar Hill to open in Ward 8, 2025-02-06](https://www.washingtonpost.com/dc-md-va/2025/02/06/dc-new-cedar-hill-hospital-april-opening/)
- [Mayor's Office — Cedar Hill opening announcement](https://mayor.dc.gov/release/mayor-bowser-announces-new-cedar-hill-regional-medical-center-gw-health-st-elizabeths-east)
- [Washington Informer — Cedar Hill and maternal health disparities](https://www.washingtoninformer.com/cedar-hill-regional-medical/)
- [WJLA — DC plans to combat maternal mortality among women of color](https://wjla.com/newsletter-daily/maternal-mortality-rates-women-color-black-pregnant-pregnancy-ward-7-undeserved-community-hospital-east-anacostia-river-rochanda-mitchell-howard-university-donald-trump-federal-funds)
- [US Census Bureau — Uninsured rates, 2025-09](https://www.census.gov/library/stories/2025/09/uninsured-rates.html)
- [healthinsurance.org — Medicaid eligibility in DC](https://www.healthinsurance.org/medicaid/dc/)
- [DC Policy Center — State of DC Schools 2024-25](https://www.dcpolicycenter.org/publications/stateofdcschools2024-25/)
- [DCPS — Nation's Report Card results](https://dcps.dc.gov/release/nation%E2%80%99s-report-card-shows-continued-improvement-district%E2%80%99s-public-schools)
- [DC Fiscal Policy Institute — A First Look at the Mayor's Budget](https://dcfpi.org/all/a-first-look-at-the-mayors-budget-an-inequality-agenda/)
- [DC Fiscal Policy Institute — Child care subsidy reimbursement cuts](https://dcfpi.org/all/cutting-reimbursement-rates-in-the-dc-child-care-subsidy-program-would-cripple-budgets-and-force-classrooms-to-close/)
- [Mayor's Office — FY2026 Budget: Grow DC, 2025-05-27](https://mayor.dc.gov/release/mayor-bowser-presents-fiscal-year-2026-budget-grow-dc)
- [DOES — DC Paid Family Leave](https://does.dc.gov/page/dc-paid-family-leave)
- [ZERO TO THREE — Birth-to-Three for All DC Act of 2018](https://www.zerotothree.org/resource/washington-d-c-passes-birth-to-three-for-all-dc-act-of-2018/)
- [Washington Times — Council expels Trayon White, 2025-02-04](https://www.washingtontimes.com/news/2025/feb/4/d-c-council-votes-unanimously-expel-trayon-white-b/)
- [Axios — Trayon White wins Ward 8 election, 2025-07-16](https://www.axios.com/local/washington-dc/2025/07/16/trayon-white-wins-ward-8-election)
- [The Eagle — DC Council passes Secure DC, 2024-03](https://www.theeagleonline.com/article/2024/03/dc-council-votes-to-pass-secure-dc-crime-bill)
- [The Sentencing Project — Condemnation of Secure DC](https://www.sentencingproject.org/press-releases/the-sentencing-project-condemns-dc-councils-passage-of-secure-dc-crime-bill/)
- [American Journal of Epidemiology — Violence interruption programs in Washington DC](https://academic.oup.com/aje/advance-article/doi/10.1093/aje/kwag023/8454589)
- [Building Blocks DC — Community Violence Intervention](https://www.buildingblocks.dc.gov/community-violence-intervention)
- [DHCD — Response to ODCA Housing Production Trust Fund report](https://dhcd.dc.gov/release/dhcd-response-odca-report-housing-production-trust-fund-remember-unprecedented-affordable)
- [Reporters Committee — Open Government Guide, District of Columbia](https://www.rcfp.org/open-government-guide/district-of-columbia/)
- [Bureau of Labor Statistics — DC job openings and labor turnover, December 2025](https://www.bls.gov/regions/mid-atlantic/news-release/jobopeningslaborturnover_dc.htm)
- [ACLU of DC — DC Home Rule explainer](https://www.acludc.org/news/dc-home-rule-what-it-how-it-works-and-why-it-matters/)

---

*This assessment is based on publicly available information and does not constitute a formal Compassion Benchmark Certified Assessment. For a comprehensive, assessor-led evaluation, visit compassionbenchmark.com/certified-assessments.*
