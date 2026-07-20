---
entity: "North Carolina"
type: "State"
sector: "Government"
date: "2026-07-19"
composite_score: 45.0
band: "Functional"
scores:
  AWR: 3.4
  EMP: 2.4
  ACT: 2.8
  EQU: 3.2
  BND: 2.0
  ACC: 3.0
  SYS: 3.2
  INT: 2.4
published_index: null
published_rank: null
published_composite: null
published_band: null
---

# Compassion Benchmark Assessment: North Carolina

**Entity type:** State
**Sector/Domain:** Government (US state jurisdiction)
**Assessment date:** 2026-07-19
**Composite score:** 45.0/100
**Band:** Functional
**Assessment type:** First baseline. North Carolina does not appear in any published Compassion Benchmark index, so there is no prior composite to compare against.

## Headline

North Carolina builds excellent new programs and delivers old promises badly. In one year the state erased $6.5 billion in medical debt for 2.5 million people, the first program of its kind in the country. In that same year its own auditor found the state took an average of 936 days just to decide whether a hurricane survivor qualified for help. Both facts are true. They are not opposites to be averaged. They describe one state that designs well and executes poorly, and that loses its best work first when money gets tight.

## Score Summary

| Dimension | Code | Score | Band |
|-----------|------|-------|------|
| Awareness | AWR | 60.0 | Functional |
| Empathy | EMP | 35.0 | Developing |
| Action | ACT | 45.0 | Functional |
| Equity | EQU | 55.0 | Functional |
| Boundaries | BND | 25.0 | Developing |
| Accountability | ACC | 50.0 | Functional |
| Systemic Thinking | SYS | 55.0 | Functional |
| Integrity | INT | 35.0 | Developing |
| **Composite** | — | **45.0** | **Functional** |

Dimension scores above are on the 0-100 scale, converted from the raw 1-5 means with `scaled = ((raw - 1) / 4) * 100`. The raw 1-5 means used by the scoring function are AWR 3.4, EMP 2.4, ACT 2.8, EQU 3.2, BND 2.0, ACC 3.0, SYS 3.2, INT 2.4.

**Composite verification.** Computed by running `computeCompositeFromDimensions` from `site/scripts/lib/scoring.mjs` (methodology v1.2), not by hand. Output: `{"composite":45,"band":"Functional","integrationPremium":0}`. baseComposite 45.0; stdDev 0.458, so consistencyMult is 1.0; 8 of 8 dimensions fall below 4.0, so weaknessFactor is 0 and the integration premium is 0.0.

## Scope and attribution

This is a desk-based assessment of North Carolina state conduct from 2021 through July 2026, weighting the most recent twelve months most heavily. It scores the jurisdiction, not one administration. North Carolina had divided government for the entire window: a Democratic governor (Roy Cooper through 2024, Josh Stein from January 2025) and a Republican General Assembly able to override vetoes.

Three scored items are laws enacted over a governor's veto: Senate Bill 266 and House Bill 318 (both 2025-07-29) and Senate Bill 558 (2026-06-24). These count as state conduct. The veto is recorded as mitigating evidence inside the same subdimension.

Senate Bill 382 (December 2024) is treated as an attribution caution and scored narrowly. It is scored only under I4 Values Alignment, for the documented fact that Hurricane Helene money and transfers of executive appointment power travelled in one bill. It is not scored as harm to a served population, because the constitutional fight it started is a court matter, not a service-delivery outcome.

Federal policy imposed on the state is excluded. The 2025 federal reconciliation law changed Medicaid rules nationwide and is not charged to North Carolina. What is scored is state discretion: the trigger clause the General Assembly wrote into its own 2023 expansion statute, the Attorney General's choice to reject the June 2026 federal Chemours settlement and keep suing, and the state's July 2026 choice to extend Helene disaster case management through January 2027.

## Dimension Details

### AWR: Awareness (Score: 60.0/100 — raw mean 3.4)

| Subdimension | Score | Evidence | Source |
|-------------|-------|----------|--------|
| A1 Suffering Detection | 4/5 | NCDHHS published a Health Disparities Analysis Report (2024-09-18) covering social drivers, access, chronic and communicable disease, behavioral health and life-course outcomes, plus a 2025 State Health Assessment. The Innovations waitlist dashboard publishes the disability services backlog. Multiple channels, formal pathways, regular review. | [NCDHHS 2024-09-18](https://www.ncdhhs.gov/news/press-releases/2024/09/18/ncdhhs-releases-new-health-disparities-analysis-report-highlights-opportunities-improvement); [2025 State Health Assessment](https://schs.dph.ncdhhs.gov/units/ldas/docs/2025-NC-StateHealthAssessment.pdf); [Innovations Waitlist Dashboard](https://www.ncdhhs.gov/about/department-initiatives/inclusion-connects/innovations-waitlist-dashboard) |
| A2 Contextual Sensitivity | 3/5 | Helene disaster case management covers 39 counties and explicitly includes members of the Eastern Band of Cherokee Indians. Renew NC prioritises low-to-moderate income households, people 62 and older, families with children under 18, and households with a disabled member. Medical debt materials published in Spanish. Genuine adaptation, gaps remain. | [NC DPS Disaster Case Management](https://www.ncdps.gov/helene/dcm); [NC Governor 2026-06-25](https://governor.nc.gov/news/press-releases/2026/06/25/governor-stein-announces-application-western-north-carolina-multi-family-housing-construction-and) |
| A3 Blind Spot Mitigation | 4/5 | The independently elected State Auditor produced a 506-page performance audit in November 2025 finding errors so extensive that the full scale of waste could not be determined. Structural correction followed: NCORR was sidelined and a new Division of Community Revitalization created in Commerce. | [NC Auditor PER-2025-3005](https://www.auditor.nc.gov/documents/reports/performance/per-2025-3005/open); [Inside Climate News 2025-11-19](https://insideclimatenews.org/news/19112025/rebuildnc-was-a-disaster-auditor-says/) |
| A4 Signal Amplification | 3/5 | The Task Force for Racial Equity in Criminal Justice gave low-power communities a structural channel and produced the Office of Violence Prevention inside NC DPS plus provisions enacted in Senate Bill 300. Disability voices, by contrast, still needed litigation and advocacy campaigns to be heard on waiver funding in 2026. | [NC DPS 2024-01-23](https://www.ncdps.gov/news/press-releases/2024/01/23/task-force-racial-equity-criminal-justice-shares-2023-year-end-report); [NC Health News 2026-05-07](https://www.northcarolinahealthnews.org/2026/05/07/nc-families-advocates-disability-investment/) |
| A5 Anticipatory Awareness | 3/5 | The Flood Resiliency Blueprint models future precipitation and development and published advisory floodplain maps for five eastern river basins on 2026-04-01. Against this, the General Assembly repealed the 2030 carbon target after the Governor warned of up to $23 billion in added ratepayer cost. Formal pre-assessment for some decisions, not all. | [WRAL 2026-03-05](https://www.wral.com/weather/north-carolina-flood-plans-blueprint-march-2026/); [NC DEQ 2026-04-01](https://www.deq.nc.gov/news/press-releases/2026/04/01/new-advisory-floodplain-maps-available-five-eastern-north-carolina-river-basins) |

### EMP: Empathy (Score: 35.0/100 — raw mean 2.4)

| Subdimension | Score | Evidence | Source |
|-------------|-------|----------|--------|
| E1 Affective Resonance | 2/5 | Hurricane Matthew and Florence survivors waited an average of about four years, some living in motels, while the state averaged 936 days on the eligibility step alone. A Renew NC applicant left the programme in 2026 citing a lack of transparency. Disaster case management is the one survivor-centred counterweight. | [Carolina Journal 2025-11-20](https://www.carolinajournal.com/audit-details-ncorr-failures-boliek-calls-program-a-3rd-disaster/); [WLOS](https://wlos.com/news/local/renew-nc-north-carolina-hurricane-helene-housing-program-applicant-home-house-contractor-fema-federal-government-state-wnc-recovery-progress-damage-community-help) |
| E2 Perspective-Taking | 3/5 | Duke published a community-voices study of the Healthy Opportunities Pilots feeding participant experience back into programme design. Renew NC's written prioritisation criteria reflect who is least able to rebuild alone. One or more formal mechanisms exist and changed at least one decision. | [Duke Health Policy](https://healthpolicy.duke.edu/publications/community-voices-north-carolinas-healthy-opportunities-pilots-program-implications) |
| E3 Non-Judgment | 2/5 | In 2025 and 2026 the state banned diversity, equity and inclusion work in state agencies and public colleges, including required training. Anchor 3 requires mandatory bias training; the state legislated against it. Bias was named as a contributing factor in a large majority of the state's maternal deaths. | [WUNC 2025-04-30](https://www.wunc.org/politics/2025-04-30/north-carolina-ban-dei-house-state-government); [Higher Ed Dive 2026-06-24](https://www.highereddive.com/news/north-carolina-republicans-ban-dei-at-public-colleges/824025/) |
| E4 Validation | 2/5 | The auditor found that prior programme management told staff not to send ineligibility notices or close cases. The contractor was paid $480 per application per month until an application was formally marked ineligible. Roughly 1,500 applications were ultimately ineligible. Families' situations were not treated as legitimate claims requiring an answer. | [The Assembly 2025-11-19](https://www.theassemblync.com/news/politics/hurricane-recovery-rebuild-nc-ncorr/) |
| E5 Cultural Empathy | 3/5 | Twelve-month postpartum Medicaid coverage is permanent, and Eastern Band of Cherokee members are named in disaster case management eligibility. But doula coverage remains an optional extra from two of four Medicaid plans rather than a core benefit, and the enabling bill was still pending in June 2026. | [NC Health News 2026-06-18](https://www.northcarolinahealthnews.org/2026/06/18/lawmakers-north-carolina-maternal-health-crisis-reforms-stalling/); [NC DPS Disaster Case Management](https://www.ncdps.gov/helene/dcm) |

### ACT: Action (Score: 45.0/100 — raw mean 2.8)

| Subdimension | Score | Evidence | Source |
|-------------|-------|----------|--------|
| AC1 Responsiveness | 2/5 | Eight application steps, each averaging at least 100 days, with eligibility alone averaging 936 days against an 18-month goal for the entire rebuild. Renew NC had completed 89 homes against 7,924 active applications as of 2026-07-15, nearly 22 months after Helene. Standards exist and are not met. | [Carolina Journal 2025-11-20](https://www.carolinajournal.com/audit-details-ncorr-failures-boliek-calls-program-a-3rd-disaster/); [Carolina Journal 2026-07-15](https://www.carolinajournal.com/stein-touts-renew-nc-homebuilding-efforts-as-many-remain-on-waitlist/) |
| AC2 Proportionality | 3/5 | Medical debt relief is tiered by need: everyone on Medicaid, plus others at or below 350 percent of the federal poverty level or whose debt exceeds 5 percent of income. Renew NC prioritises by vulnerability. Against this, the auditor found the hurricane programme had no comprehensive needs assessment at all. | [NCDHHS 2025-02-05](https://www.ncdhhs.gov/news/press-releases/2025/02/05/hospital-payment-program-and-medical-debt-relief-initiative-approved-another-year); [Inside Climate News 2025-11-19](https://insideclimatenews.org/news/19112025/rebuildnc-was-a-disaster-auditor-says/) |
| AC3 Efficacy | 3/5 | The state runs real outcome measurement and publishes it: NCDHHS reported on 2026-06-02 that the Healthy Opportunities Pilots cut costs by $164 per member per month. It also published a 506-page audit condemning its own hurricane programme. But the programme proven to work was ended anyway, which is the opposite of acting on evidence. | [NCDHHS 2026-06-02](https://www.ncdhhs.gov/news/press-releases/2026/06/02/healthy-opportunities-pilots-lead-healthier-outcomes-and-reduce-nc-medicaid-costs); [NC Health News 2025-06-03](https://www.northcarolinahealthnews.org/2025/06/03/funding-cut-for-healthy-opportunities/) |
| AC4 Resource Mobilization | 3/5 | Over $700 million appropriated for Helene across three packages, with a further $792 million requested in April 2026, and $1.4 billion in opioid settlement funds flowing. But 18,950 people sat on the disability waiver waitlist in June 2025 against roughly 200 new slots proposed, and the state has run on a continuation budget since 2025-07-01. | [NC Newsline 2026-04-02](https://ncnewsline.com/2026/04/02/lawmakers-press-nc-disaster-recovery-officials-on-steins-792m-helene-request/); [NC Health News 2026-05-07](https://www.northcarolinahealthnews.org/2026/05/07/nc-families-advocates-disability-investment/) |
| AC5 Follow-Through | 3/5 | Disaster case management was extended through 2027-01-22 rather than allowed to lapse, and the medical debt programme was renewed for a further year in February 2025. Against this, the Healthy Opportunities Pilots stopped abruptly on 2025-07-01. Protocols exist for some populations; persistence is uneven. | [NC DPS 2026-07-09](https://www.ncdps.gov/news/press-releases/2026/07/09/north-carolinas-helene-disaster-case-management-program-extended-through-january-22-2027) |

### EQU: Equity (Score: 55.0/100 — raw mean 3.2)

| Subdimension | Score | Evidence | Source |
|-------------|-------|----------|--------|
| EQ1 Universality | 4/5 | Medicaid expansion took effect 2023-12-01 and covers roughly 680,000 people who previously had none. Medical debt relief reached more than 2.5 million residents with all 99 acute-care hospitals taking part. Documented, measured reduction in a coverage gap. Held below 5 by the state's own trigger clause. | [NC Governor 2025-10-13](https://governor.nc.gov/news/press-releases/2025/10/13/governor-stein-ncdhhs-announce-more-65-billion-medical-debt-erased-north-carolina-0); [KFF](https://www.kff.org/medicaid/a-closer-look-at-north-carolinas-implementation-of-the-2025-reconciliation-law-medicaid-provisions-and-other-changes-amid-medicaid-budget-shortfalls/) |
| EQ2 Priority for Vulnerable | 3/5 | Debt relief thresholds and Renew NC prioritisation both document deliberate choices in favour of higher need. But the programme aimed squarely at the highest-need Medicaid population, Healthy Opportunities, was the one cut when budgets tightened. | [NC Newsline 2025-10-13](https://ncnewsline.com/2025/10/13/ncs-medical-debt-relief-program-has-wiped-out-6-5b-owed-exceeding-expectations/); [WHQR 2025-06-05](https://www.whqr.org/local/2025-06-05/with-no-funding-in-senate-or-house-budgets-healthy-opportunities-pilot-services-set-to-expire) |
| EQ3 Bias Awareness | 3/5 | North Carolina has required statewide traffic-stop data since a 1999 legislative mandate, one of the earliest such regimes in the country, and analyses of it have documented large racial disparities. NCDHHS disaggregates health outcomes. Disparities are identified; corrective machinery was weakened by the 2025-26 DEI bans. | [ICPSR 4078](https://www.icpsr.umich.edu/web/NACJD/studies/4078); [NC Association of Chiefs of Police study](https://ncacp.org/sites/default/files/2020-03/RacialProfilingStudyReport.pdf) |
| EQ4 Access Design | 3/5 | Medical debt relief required no application: qualifying debt was cancelled automatically, removing the single largest access barrier at population scale. Against this, the hurricane programme's eight-step, multi-year process is an access barrier the state built itself. | [NC Governor 2025-10-13](https://governor.nc.gov/news/press-releases/2025/10/13/governor-stein-ncdhhs-announce-more-65-billion-medical-debt-erased-north-carolina-0) |
| EQ5 Historical Harm Acknowledgment | 3/5 | North Carolina formally acknowledged that roughly 7,600 people were sterilised under its Eugenics Board between 1929 and 1974, created an Office of Justice for Sterilization Victims, and paid compensation from a $10 million fund. Eligibility was drawn narrowly enough that many people sterilised under county or judicial authority were excluded. | [NC DOA](https://www.doa.nc.gov/about/special-programs/office-justice-sterilization-victims/about); [NPR 2014-10-31](https://www.npr.org/sections/health-shots/2014/10/31/360355784/payments-start-for-n-c-eugenics-victims-but-many-wont-qualify/) |

### BND: Boundaries (Score: 25.0/100 — raw mean 2.0)

| Subdimension | Score | Evidence | Source |
|-------------|-------|----------|--------|
| B1 Self-Sustainability | 2/5 | Prisons are short 4,703 officers of 9,682 needed, a vacancy rate near 49 percent, with 14 prisons at half-empty or worse. First-year state employee turnover was 33.7 percent in 2025. The state measures this carefully but the foundation is not stable: 2025 ended with 38 fewer filled officer posts than 2024 despite 1,530 hires. | [NC Health News 2026-02-05](https://www.northcarolinahealthnews.org/2026/02/05/nc-prisons-face-dire-staffing-crisis/); [NC OSHR 2025 report](https://oshr.nc.gov/2025-compensation-and-benefits-report/open) |
| B2 Autonomy Preservation | 3/5 | Medical debt relief is forward-looking: hospitals had to change charity-care and collections policy as a condition of enhanced payment, so the programme reduces future dependency rather than only clearing past balances. Healthy Opportunities aimed at the same logic before it ended. | [NCDHHS 2025-02-05](https://www.ncdhhs.gov/news/press-releases/2025/02/05/hospital-payment-program-and-medical-debt-relief-initiative-approved-another-year) |
| B3 Scope Clarity | 1/5 | The clearest floor finding in this assessment. Management told staff not to send ineligibility notices, leaving families waiting without the information they needed to look elsewhere, while a contractor was paid monthly per open application. A Renew NC applicant said she would have used other resources had she known up front that she must surrender her FEMA funds. Limitations were discovered only after investment. | [The Assembly 2025-11-19](https://www.theassemblync.com/news/politics/hurricane-recovery-rebuild-nc-ncorr/); [WLOS](https://wlos.com/news/local/renew-nc-north-carolina-hurricane-helene-housing-program-applicant-home-house-contractor-fema-federal-government-state-wnc-recovery-progress-damage-community-help) |
| B4 Refusal Ethics | 2/5 | Roughly 1,500 applications were eventually deemed ineligible, many after long silence and without a route to alternatives. The state does now fund coordinated disaster case management, extended to January 2027, which is a real referral structure. Refusals are respectful in the newer programme, unstructured in the failed one. | [The Assembly 2025-11-19](https://www.theassemblync.com/news/politics/hurricane-recovery-rebuild-nc-ncorr/); [NC DPS 2026-07-09](https://www.ncdps.gov/news/press-releases/2026/07/09/north-carolinas-helene-disaster-case-management-program-extended-through-january-22-2027) |
| B5 Consent Orientation | 2/5 | Thin evidence, scored conservatively. The one documented current case is a Renew NC participant who learned only late that entering the programme meant surrendering FEMA funds. The eugenics history is the state's own precedent for consent failure. No evidence found of independent review of consent materials. | [WLOS](https://wlos.com/news/local/renew-nc-north-carolina-hurricane-helene-housing-program-applicant-home-house-contractor-fema-federal-government-state-wnc-recovery-progress-damage-community-help) |

### ACC: Accountability (Score: 50.0/100 — raw mean 3.0)

| Subdimension | Score | Evidence | Source |
|-------------|-------|----------|--------|
| AB1 Harm Acknowledgment | 3/5 | Harm was acknowledged, but only after external bodies established it: a House Oversight report in July 2025 titled "Unkept Promises to Eastern North Carolina," then the 506-page audit in November 2025. Acknowledgment followed establishment rather than preceding it. | [NCGA House Oversight 2025-07](https://sites.ncleg.gov/houseoversight/2025/07/north-carolina-office-of-recovery-and-resiliency-unkept-promises-to-eastern-north-carolina/); [WUNC 2025-11-20](https://www.wunc.org/term/news/2025-11-20/auditor-report-hurricane-housing-program-failed-track-funds) |
| AB2 Correction Willingness | 3/5 | Real, measurable course correction: bringing programme management in-house cut administrative cost per project from about $41,000 to about $4,100, and the failing agency was sidelined for Helene in favour of a new Commerce division. The Fostering Care in NC Act likewise restructured child welfare oversight. All under sustained external pressure. | [Carolina Journal 2025-03-19](https://www.carolinajournal.com/stein-sidelines-ncorr-forms-new-office-to-lead-recovery-in-western-nc/); [WFAE 2025-06-27](https://www.wfae.org/charlotte-area/2025-06-27/governor-signs-overhaul-of-child-welfare-in-nc-state-gains-authority-over-local-dss-agencies) |
| AB3 Transparency | 3/5 | The executive side is genuinely strong: a nationally recognised opioid settlement dashboard, a daily Renew NC dashboard, a disability waitlist dashboard, and a self-published damning audit. The legislature, however, exempted itself from the public records law in 2023 and let each member destroy records at will. One branch is verifiable, one is not. | [NC DOJ 2024-10-29](https://ncdoj.gov/north-carolinians-can-now-get-a-more-detailed-view-of-local-governments-opioid-settlement-spending/); [NPR 2023-10-06](https://www.npr.org/2023/10/06/1204098157/n-c-legislature-is-criticized-for-exempting-itself-from-public-records-law) |
| AB4 Systemic Learning | 3/5 | At least two documented systemic changes traceable to failure analysis: the Fostering Care in NC Act giving the state authority over county social services after documented county-level abuses, and the contracting and in-house management changes in disaster recovery. Formal review exists; the field-level sharing that anchor 5 requires does not. | [Coates' Canons 2025-06-30](https://canons.sog.unc.edu/blog/2025/06/30/the-fostering-care-in-nc-act-changes-to-child-welfare-and-dss-that-are-effective-now/); [WRAL 2025-02](https://www.wral.com/news/investigates/federal-lawsuit-targets-north-carolina-broken-foster-care-system-february-2025/) |
| AB5 Reparative Action | 3/5 | Medical debt relief is repair at genuine scale and eugenics compensation is a formal reparative programme. But the people most clearly harmed by the state's own recovery failure — thousands who waited years — have no documented repair, and the auditor could not even quantify the shortfall. | [NC Governor 2025-10-13](https://governor.nc.gov/news/press-releases/2025/10/13/governor-stein-ncdhhs-announce-more-65-billion-medical-debt-erased-north-carolina-0); [Inside Climate News 2025-11-19](https://insideclimatenews.org/news/19112025/rebuildnc-was-a-disaster-auditor-says/) |

### SYS: Systemic Thinking (Score: 55.0/100 — raw mean 3.2)

| Subdimension | Score | Evidence | Source |
|-------------|-------|----------|--------|
| S1 Root Cause Orientation | 3/5 | North Carolina built a first-in-the-nation upstream Medicaid programme addressing housing, food, transport and interpersonal safety, and proved it lowered downstream cost by $164 per member per month. It then ended the programme. Real resources went upstream; the strategy did not hold. | [NCDHHS 2026-06-02](https://www.ncdhhs.gov/news/press-releases/2026/06/02/healthy-opportunities-pilots-lead-healthier-outcomes-and-reduce-nc-medicaid-costs); [NC Health News 2025-06-03](https://www.northcarolinahealthnews.org/2025/06/03/funding-cut-for-healthy-opportunities/) |
| S2 Long-Term Impact | 3/5 | The Flood Resiliency Blueprint is described as the largest statewide flood mitigation investment in state history and has funded 81 projects across six river basins since 2024, with river-basin action strategies in development. The Department of Adult Correction runs a 2025-2029 strategic plan. Against this, the 2030 carbon target was repealed. | [NC DEQ Flood Resiliency Blueprint](https://www.deq.nc.gov/energy-climate/flood-resiliency-blueprint); [WRAL 2025-07-29](https://www.wral.com/news/state/north-carolina-duke-energy-bill-carbon-cutting-july-2025/) |
| S3 Interconnection Awareness | 3/5 | The Healthy Opportunities design is explicitly cross-system, treating housing and food as health spending. CORE-NC links the Department of Justice, NCDHHS, county commissioners and a university research centre. The Fostering Care Act redraws the state-county boundary. Cross-system effects are recognised in specific programmes, not mapped systematically. | [UNC IPRC 2024-10-29](https://iprc.unc.edu/2024/10/29/north-carolinians-can-now-get-a-more-detailed-view-of-local-governments-opioid-settlement-spending/) |
| S4 Structural Critique | 3/5 | The Attorney General publicly called the June 2026 federal Chemours settlement "an insult to the people of eastern North Carolina" and kept the state's separate groundwater case going — a public position with institutional risk. Against this, the legislature repealed the interim carbon target and shifted fuel-price risk onto residential customers. | [NC Health News 2026-06-25](https://www.northcarolinahealthnews.org/2026/06/25/chemours-pfas-settlement-nc-excluded/); [NC Newsline 2026-07-14](https://ncnewsline.com/2026/07/14/a-key-forever-chemicals-lawsuit-settles-out-of-court-in-north-carolina/) |
| S5 Coalitional Compassion | 4/5 | CORE-NC is genuine resource sharing with smaller bodies: the state provides data infrastructure and technical assistance so all 100 counties can plan and report opioid settlement spending, built jointly with the county commissioners' association and UNC. The debt programme required coordinating 99 hospitals and a national nonprofit. | [NC DOJ 2024-10-29](https://ncdoj.gov/north-carolinians-can-now-get-a-more-detailed-view-of-local-governments-opioid-settlement-spending/); [ncopioidsettlement.org](https://ncopioidsettlement.org/) |

### INT: Integrity (Score: 35.0/100 — raw mean 2.4)

| Subdimension | Score | Evidence | Source |
|-------------|-------|----------|--------|
| I1 Consistency Under Pressure | 2/5 | Three commitments dropped under pressure in this window: Healthy Opportunities defunded in 2025 despite proven results, the interim 2030 carbon target repealed in July 2025, and nine years of Leandro school funding orders vacated in April 2026 removing enforcement of the state's own constitutional education duty. | [NC Health News 2025-06-03](https://www.northcarolinahealthnews.org/2025/06/03/funding-cut-for-healthy-opportunities/); [NC Newsline 2026-04-02](https://ncnewsline.com/2026/04/02/north-carolina-supreme-court-vacates-nine-years-of-leandro-school-funding-orders/) |
| I2 Non-Performance | 3/5 | Some practices are maintained regardless of how they look. The state published a 506-page audit condemning its own programme. The debt relief programme was built to run without state appropriations and exceeded its own forecast, which is the profile of a working programme rather than a launch event. | [NC Newsline 2025-10-13](https://ncnewsline.com/2025/10/13/ncs-medical-debt-relief-program-has-wiped-out-6-5b-owed-exceeding-expectations/); [WUNC 2025-11-20](https://www.wunc.org/term/news/2025-11-20/auditor-report-hurricane-housing-program-failed-track-funds) |
| I3 Internal Consistency | 2/5 | A state that markets public service runs prisons at 49 percent officer vacancy, loses a third of new employees within a year, and has carried 8,845 vacancies generating over $1.04 billion in lapsed salary. Budget offices acknowledge the gap in formal recommendations; it has not closed. | [NC Newsline 2026-05-15](https://ncnewsline.com/2026/05/15/state-employee-group-says-auditors-report-shows-pay-crisis-in-nc-government/); [NC OSBM](https://www.osbm.nc.gov/fy2026-27-budget-rec-highlight-employees/open) |
| I4 Values Alignment | 2/5 | Senate Bill 382 carried Hurricane Helene appropriations in the same bill as transfers of executive appointment power, drawing the description "a power grab disguised as hurricane relief" and two separation-of-powers lawsuits from the sitting and incoming governors. The legislature also exempted itself from public records rules. | [NC Governor 2024-12-12](https://governor.nc.gov/news/press-releases/2024/12/12/governor-cooper-governor-elect-stein-file-lawsuit-separation-powers); [NC Justice Center](https://www.ncjustice.org/sb-382-is-a-power-grab-disguised-as-hurricane-relief/) |
| I5 Resilience of Care | 3/5 | Medicaid expansion, the medical debt programme and the opioid transparency infrastructure all survived the Cooper-to-Stein transition in January 2025 intact, and the debt programme expanded afterwards. Core practices sit in policy and cleared one leadership change. Not yet tested across multiple transitions. | [NCDHHS 2025-02-05](https://www.ncdhhs.gov/news/press-releases/2025/02/05/hospital-payment-program-and-medical-debt-relief-initiative-approved-another-year); [NC Medicaid](https://medicaid.ncdhhs.gov/beneficiaries/impact-hr-1-and-federal-changes-medicaid) |

## Published Index Comparison

This entity does not currently appear in any published Compassion Benchmark index. It should be added to the US States index (`site/src/data/indexes/us-states.json`) as a new entity.

No rank is proposed. The published US States index contains only 21 of 51 jurisdictions, and the surviving entries were renumbered contiguously after ranks 9-38 were lost in the original extraction. The rank column in that file is therefore not a national rank, and assigning North Carolina a position in it would create a false comparison. A rank should be issued only once the index is rebuilt with all 51 jurisdictions.

## Key Findings

- **North Carolina designs better than it delivers, and the gap is the whole story.** The state erased $6.5 billion in medical debt for 2.5 million people in a single year, the first programme of its kind in the country, using no state money. In the same period its own auditor found it took an average of 936 days just to decide whether a hurricane survivor qualified for a rebuild, against an 18-month goal for finishing the job. New programmes score in the Established range. Delivery of existing promises scores near the bottom.

- **The worst finding is not slowness. It is silence.** The State Auditor found that management told staff not to send ineligibility notices. An outside contractor was paid $480 per application every month until an application was formally marked ineligible. About 1,500 applications were eventually rejected. Families waited without the one piece of information — that they did not qualify — that would have let them look elsewhere. That single fact sets Scope Clarity at 1 out of 5, the lowest score in this assessment.

- **The pattern is current, not historical.** As of 2026-07-15, nearly 22 months after Hurricane Helene, the successor programme had finished 89 homes against 7,924 active applications. The State Auditor said in January 2026: "We're not seeing hammers hitting nails." The state cannot yet claim the failure belongs to a previous administration.

- **North Carolina cut the programme that worked.** The Healthy Opportunities Pilots spent Medicaid money on housing, food and transport. The state's own June 2026 report showed it saved $164 per member per month. Services had already stopped a year earlier, on 2025-07-01, because no budget funded them. Proving something works and ending it anyway is why Integrity scores 35 out of 100.

- **Half the state's prison officer posts are empty.** North Carolina needs 9,682 correctional officers and is short 4,703 of them. Fourteen prisons are at half staffing or worse. A third of new state employees leave within a year. Compassionate work is being asked of a workforce that is not there.

## Strongest Dimensions

- **Awareness (60/100).** The state measures itself seriously: published health disparity analyses, a 2025 State Health Assessment, public dashboards for opioid spending, disability waitlists and rebuild progress, and one of the country's oldest statewide traffic-stop data mandates dating to 1999. An independently elected auditor produced the most damaging document about the state, and the state published it.
- **Equity (55/100) and Systemic Thinking (55/100).** Medicaid expansion plus automatic medical debt cancellation closed real gaps for millions without requiring anyone to apply. CORE-NC gives all 100 counties shared infrastructure to plan and report opioid settlement spending, which is genuine resource sharing with smaller bodies rather than coordination in name.

## Weakest Dimensions

- **Boundaries (25/100).** Driven by the withheld ineligibility notices and the contractor paid to keep applications open. This is the only dimension containing a score of 1.
- **Empathy (35/100) and Integrity (35/100).** Four-year waits, banned bias training, a proven programme defunded, a hurricane relief bill carrying executive power transfers, and a legislature that exempted itself from public records law.

## Evidence Gaps

- **B5 Consent Orientation** rests on a single documented case and is marked low confidence. No independent review of state consent materials was found.
- **E1 Affective Resonance** relies on programme outcomes and press accounts rather than systematic user testimony. No statewide survey of how served populations experience state services was located.
- **Employee culture** is measured through vacancy, turnover and lapsed-salary figures rather than direct staff testimony, so I3 rests on outcome proxies.
- **County variation is not captured.** North Carolina delivers much social service through 100 county departments. A state-level assessment averages over wide local differences.
- **The 2025-27 budget was unresolved at assessment date.** The state has run on a continuation budget since 2025-07-01, so several resource questions cannot be settled from published appropriations.

## Recommended Next Steps

Band: **Functional**. Systems exist but have significant gaps.

- Consider [Advisory Support](/advisory) to translate these findings into strategic action. The specific priority is the Boundaries dimension: notification, scope disclosure and refusal protocols in disaster recovery are the cheapest available correction and the one most directly named by the state's own auditor.
- A sensitivity case run through `computeCompositeFromDimensions` shows that lifting Boundaries alone from 2.0 to 3.0 moves the composite from 45.0 to 48.1, still Functional. Reaching the Established band requires broad improvement, not a single fix.

## Sources

- NC Office of the State Auditor, Performance Audit PER-2025-3005 (November 2025) — https://www.auditor.nc.gov/documents/reports/performance/per-2025-3005/open
- Inside Climate News, 2025-11-19 — https://insideclimatenews.org/news/19112025/rebuildnc-was-a-disaster-auditor-says/
- WUNC, 2025-11-20 — https://www.wunc.org/term/news/2025-11-20/auditor-report-hurricane-housing-program-failed-track-funds
- Carolina Journal, 2025-11-20 — https://www.carolinajournal.com/audit-details-ncorr-failures-boliek-calls-program-a-3rd-disaster/
- The Assembly, 2025-11-19 — https://www.theassemblync.com/news/politics/hurricane-recovery-rebuild-nc-ncorr/
- Office of Governor Josh Stein, 2025-10-13 — https://governor.nc.gov/news/press-releases/2025/10/13/governor-stein-ncdhhs-announce-more-65-billion-medical-debt-erased-north-carolina-0
- NC Newsline, 2025-10-13 — https://ncnewsline.com/2025/10/13/ncs-medical-debt-relief-program-has-wiped-out-6-5b-owed-exceeding-expectations/
- NCDHHS, 2025-02-05 — https://www.ncdhhs.gov/news/press-releases/2025/02/05/hospital-payment-program-and-medical-debt-relief-initiative-approved-another-year
- NCDHHS, 2026-06-02 — https://www.ncdhhs.gov/news/press-releases/2026/06/02/healthy-opportunities-pilots-lead-healthier-outcomes-and-reduce-nc-medicaid-costs
- North Carolina Health News, 2025-06-03 — https://www.northcarolinahealthnews.org/2025/06/03/funding-cut-for-healthy-opportunities/
- WHQR, 2025-06-05 — https://www.whqr.org/local/2025-06-05/with-no-funding-in-senate-or-house-budgets-healthy-opportunities-pilot-services-set-to-expire
- Duke Margolis Health Policy, Community Voices from the Healthy Opportunities Pilots — https://healthpolicy.duke.edu/publications/community-voices-north-carolinas-healthy-opportunities-pilots-program-implications
- Carolina Journal, 2026-07-15 — https://www.carolinajournal.com/stein-touts-renew-nc-homebuilding-efforts-as-many-remain-on-waitlist/
- NC Commerce, 2026-07-15 — https://www.commerce.nc.gov/news/press-releases/2026/07/15/governor-stein-welcomes-asheville-resident-back-home-after-helene
- NC Governor, 2026-06-25 — https://governor.nc.gov/news/press-releases/2026/06/25/governor-stein-announces-application-western-north-carolina-multi-family-housing-construction-and
- NC Newsline, 2026-04-02 (Helene funding request) — https://ncnewsline.com/2026/04/02/lawmakers-press-nc-disaster-recovery-officials-on-steins-792m-helene-request/
- WLOS, Renew NC applicant withdrawal — https://wlos.com/news/local/renew-nc-north-carolina-hurricane-helene-housing-program-applicant-home-house-contractor-fema-federal-government-state-wnc-recovery-progress-damage-community-help
- NBC24, State Auditor on Renew NC — https://nbc24.com/news/nation-world/state-auditor-questions-renew-nc-program-thousands-wait-hurricane-helene-damaged-home-repairs-single-family-housing-program-federal
- NC DPS, 2026-07-09 — https://www.ncdps.gov/news/press-releases/2026/07/09/north-carolinas-helene-disaster-case-management-program-extended-through-january-22-2027
- NC DPS, Helene Disaster Case Management — https://www.ncdps.gov/helene/dcm
- Carolina Journal, Stein sidelines NCORR — https://www.carolinajournal.com/stein-sidelines-ncorr-forms-new-office-to-lead-recovery-in-western-nc/
- NCGA House Oversight, July 2025 — https://sites.ncleg.gov/houseoversight/2025/07/north-carolina-office-of-recovery-and-resiliency-unkept-promises-to-eastern-north-carolina/
- NC DOJ, CORE-NC local view, 2024-10-29 — https://ncdoj.gov/north-carolinians-can-now-get-a-more-detailed-view-of-local-governments-opioid-settlement-spending/
- UNC Injury Prevention Research Center, 2024-10-29 — https://iprc.unc.edu/2024/10/29/north-carolinians-can-now-get-a-more-detailed-view-of-local-governments-opioid-settlement-spending/
- North Carolina Opioid Settlements — https://ncopioidsettlement.org/
- NCDHHS Health Disparities Analysis Report, 2024-09-18 — https://www.ncdhhs.gov/news/press-releases/2024/09/18/ncdhhs-releases-new-health-disparities-analysis-report-highlights-opportunities-improvement
- NC State Health Assessment 2025 — https://schs.dph.ncdhhs.gov/units/ldas/docs/2025-NC-StateHealthAssessment.pdf
- NCDHHS Office of Health Equity Data Resource Center — https://www.ncdhhs.gov/divisions/office-health-equity/data-resource-center
- NCDHHS Innovations Waitlist Dashboard — https://www.ncdhhs.gov/about/department-initiatives/inclusion-connects/innovations-waitlist-dashboard
- North Carolina Health News, 2026-05-07 (disability waiver advocacy) — https://www.northcarolinahealthnews.org/2026/05/07/nc-families-advocates-disability-investment/
- Disability Rights NC, Samantha R. litigation — https://disabilityrightsnc.org/news-events/public-reports/samantha-r-litigation/
- NCDHHS Olmstead Plan, 2026-03-05 — https://www.ncdhhs.gov/olmstead-and-north-carolinas-olmstead-plan-march-5-2026/open
- North Carolina Health News, 2026-02-05 (prison staffing) — https://www.northcarolinahealthnews.org/2026/02/05/nc-prisons-face-dire-staffing-crisis/
- Corrections1, rising prison suicides — https://www.corrections1.com/correctional-suicide/with-rising-inmate-suicides-n-c-prisons-reevaluate-mental-health-care
- NC DAC Strategic Plan 2025-2029 — https://www.dac.nc.gov/strategic-plan
- NC Office of State Human Resources, 2025 Compensation and Benefits Report — https://oshr.nc.gov/2025-compensation-and-benefits-report/open
- NC Newsline, 2026-05-15 (state pay crisis) — https://ncnewsline.com/2026/05/15/state-employee-group-says-auditors-report-shows-pay-crisis-in-nc-government/
- NC OSBM, Supporting State Employees recommendation — https://www.osbm.nc.gov/fy2026-27-budget-rec-highlight-employees/open
- WUNC, 2025-04-30 (state government DEI ban) — https://www.wunc.org/politics/2025-04-30/north-carolina-ban-dei-house-state-government
- Higher Ed Dive, 2026-06-24 (public college DEI ban, SL 2026-21) — https://www.highereddive.com/news/north-carolina-republicans-ban-dei-at-public-colleges/824025/
- NCGA, House Bill 318 / SL 2025-85 — https://www.ncleg.gov/BillLookup/2025/H318
- WHQR, 2026-02-23 (immigration enforcement) — https://www.whqr.org/local/2026-02-23/north-carolina-keeps-expanding-its-role-in-immigration-enforcement-heres-what-changed-and-why-it-matters
- North Carolina Health News, 2026-05-03 (Black maternal deaths) — https://www.northcarolinahealthnews.org/2026/05/03/attempts-to-lower-the-rate-of-black-maternal-deaths-in-nc-face-new-challenges/
- North Carolina Health News, 2026-06-18 (maternal health reforms stalling) — https://www.northcarolinahealthnews.org/2026/06/18/lawmakers-north-carolina-maternal-health-crisis-reforms-stalling/
- North Carolina Health News, 2025-06-27 (Medicaid expansion trigger) — https://www.northcarolinahealthnews.org/2025/06/27/bill-could-unravel-expansion/
- KFF, North Carolina Medicaid implementation analysis — https://www.kff.org/medicaid/a-closer-look-at-north-carolinas-implementation-of-the-2025-reconciliation-law-medicaid-provisions-and-other-changes-amid-medicaid-budget-shortfalls/
- NC Medicaid, impact of H.R. 1 — https://medicaid.ncdhhs.gov/beneficiaries/impact-hr-1-and-federal-changes-medicaid
- WRAL, 2025-07-29 (carbon goal repeal) — https://www.wral.com/news/state/north-carolina-duke-energy-bill-carbon-cutting-july-2025/
- Kilpatrick Townsend, 2025-07-02 (SB 266 veto analysis) — https://ktslaw.com/en/insights/alert/2025/7/governor%20stein%20vetoed%20north%20carolina%20senate%20bill%20266%20relating%20to%20energy%20policy
- NC DEQ, Flood Resiliency Blueprint — https://www.deq.nc.gov/energy-climate/flood-resiliency-blueprint
- NC DEQ, 2026-04-01 (advisory floodplain maps) — https://www.deq.nc.gov/news/press-releases/2026/04/01/new-advisory-floodplain-maps-available-five-eastern-north-carolina-river-basins
- WRAL, 2026-03-05 (flood strategy update) — https://www.wral.com/weather/north-carolina-flood-plans-blueprint-march-2026/
- NC Newsline, 2026-04-02 (Leandro vacated) — https://ncnewsline.com/2026/04/02/north-carolina-supreme-court-vacates-nine-years-of-leandro-school-funding-orders/
- WRAL, 2026-04-02 (Leandro ruling) — https://www.wral.com/news/education/nc-supreme-court-leandro-ruling-april-2026/
- NC DOJ, Task Force for Racial Equity in Criminal Justice — https://ncdoj.gov/trec/
- NC DPS, 2024-01-23 (TREC 2023 year-end report) — https://www.ncdps.gov/news/press-releases/2024/01/23/task-force-racial-equity-criminal-justice-shares-2023-year-end-report
- TREC 2023 Year-End Report (PDF) — https://ncdoj.gov/wp-content/uploads/2024/01/DPS_TREC_2023Annual-Report_digitalFINAL2.pdf
- ICPSR 4078, North Carolina Highway Traffic Study — https://www.icpsr.umich.edu/web/NACJD/studies/4078
- Racial and Ethnic Disparity in Traffic Stops in North Carolina — https://ncacp.org/sites/default/files/2020-03/RacialProfilingStudyReport.pdf
- NC Department of Administration, Office of Justice for Sterilization Victims — https://www.doa.nc.gov/about/special-programs/office-justice-sterilization-victims/about
- NPR, 2014-10-31 (eugenics compensation eligibility) — https://www.npr.org/sections/health-shots/2014/10/31/360355784/payments-start-for-n-c-eugenics-victims-but-many-wont-qualify/
- NPR, 2023-10-06 (legislative public records exemption) — https://www.npr.org/2023/10/06/1204098157/n-c-legislature-is-criticized-for-exempting-itself-from-public-records-law
- WUNC, 2023-10-05 (record destruction authority) — https://www.wunc.org/politics/2023-10-05/nc-lawmakers-exempt-public-records-laws-democrats-secret-police-powers
- NC Governor, 2024-12-12 (SB 382 separation of powers suit) — https://governor.nc.gov/news/press-releases/2024/12/12/governor-cooper-governor-elect-stein-file-lawsuit-separation-powers
- NC Justice Center, SB 382 — https://www.ncjustice.org/sb-382-is-a-power-grab-disguised-as-hurricane-relief/
- WFAE, 2025-06-27 (child welfare overhaul) — https://www.wfae.org/charlotte-area/2025-06-27/governor-signs-overhaul-of-child-welfare-in-nc-state-gains-authority-over-local-dss-agencies
- UNC School of Government Coates' Canons, 2025-06-30 — https://canons.sog.unc.edu/blog/2025/06/30/the-fostering-care-in-nc-act-changes-to-child-welfare-and-dss-that-are-effective-now/
- WRAL, February 2025 (foster care lawsuit) — https://www.wral.com/news/investigates/federal-lawsuit-targets-north-carolina-broken-foster-care-system-february-2025/
- North Carolina Health News, 2026-06-25 (Chemours settlement) — https://www.northcarolinahealthnews.org/2026/06/25/chemours-pfas-settlement-nc-excluded/
- NC Newsline, 2026-07-14 (Chemours out-of-court settlement) — https://ncnewsline.com/2026/07/14/a-key-forever-chemicals-lawsuit-settles-out-of-court-in-north-carolina/

## Disclaimer

This assessment is based on publicly available information and does not constitute a formal Compassion Benchmark Certified Assessment. For a comprehensive, assessor-led evaluation, visit compassionbenchmark.com/certified-assessments.
