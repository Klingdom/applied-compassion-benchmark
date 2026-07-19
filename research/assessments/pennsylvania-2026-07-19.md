---
entity: "Pennsylvania"
type: "US State"
sector: "Government (Mid-Atlantic)"
date: "2026-07-19"
composite_score: 54.4
band: "Functional"
scores:
  AWR: 3.6
  EMP: 3.2
  ACT: 3.0
  EQU: 3.4
  BND: 2.8
  ACC: 3.0
  SYS: 3.6
  INT: 2.8
published_index: null
published_rank: null
published_composite: null
published_band: null
---

# Compassion Benchmark Assessment: Pennsylvania

**Entity type:** US State
**Sector/Domain:** Government (Mid-Atlantic)
**Assessment date:** 2026-07-19 (first-ever baseline; entity absent from published index)
**Composite score:** 54.4/100
**Band:** Functional
**Confidence:** Medium-High (34 of 40 subdimensions backed by Tier 3+ dated public evidence)

> This assessment is based on publicly available information and does not constitute a formal Compassion Benchmark Certified Assessment. For a comprehensive, assessor-led evaluation, visit compassionbenchmark.com/certified-assessments.

---

## Calibration Note

Pennsylvania does not appear in `site/src/data/indexes/us-states.json`. That file publishes only the top 8 (Hawaii 95.9 through Connecticut 83.0) and the bottom 13 (Idaho 25.0 through Mississippi 12.5) of the original ranking. Ranks 9 through 38 are missing entirely. There is a 58-point hole in the published distribution between rank 8 and rank 9.

This means the published set is **not** a usable distribution for calibration. It is two clusters with the entire middle removed. Scoring Pennsylvania against that shape would force it artificially toward one pole.

This assessment therefore calibrates to the behavioral anchors directly, then sanity-checks against named peers:

- **Upper anchor:** Connecticut (83.0, dimensions 3.5-4.5). Pennsylvania is clearly below Connecticut. Connecticut has a statutory civil-rights framework with a functioning enforcement commission, a $16+ minimum wage, and no chronic budget impasse. Pennsylvania fails all three tests.
- **Lower anchor:** Louisiana (21.9, dimensions 1.5-2.0), Alabama and Mississippi (12.5, dimensions 1.0-2.0). Pennsylvania is clearly and substantially above these. Pennsylvania expanded Medicaid, funds an environmental justice office with a 32-indicator screening tool, publishes disaggregated maternal mortality data, and commissioned independent third-party audits of its own state police. The bottom cluster does none of this.

Pennsylvania lands mid-pack. A 54.4 composite would place it approximately rank 9-12 of 51 in a fully populated index — the top of the missing middle, immediately below the exemplary cluster.

---

## Score Summary

| Dimension | Code | Raw (1-5) | Score (0-100) | Band |
|-----------|------|-----------|---------------|------|
| Awareness | AWR | 3.6 | 65.0 | Established |
| Empathy | EMP | 3.2 | 55.0 | Functional |
| Action | ACT | 3.0 | 50.0 | Functional |
| Equity | EQU | 3.4 | 60.0 | Functional |
| Boundaries | BND | 2.8 | 45.0 | Functional |
| Accountability | ACC | 3.0 | 50.0 | Functional |
| Systemic Thinking | SYS | 3.6 | 65.0 | Established |
| Integrity | INT | 2.8 | 45.0 | Functional |
| **Composite** | — | **3.175** | **54.4** | **Functional** |

**Composite derivation (canonical `computeCompositeFromDimensions`, methodology v1.2):**
- baseComposite = ((3.175 − 1) / 4) × 100 = 54.375
- stdDev across 8 dimensions = 0.307 → consistencyMult = 1.0
- dimensions below 4.0 = 8 of 8 → weaknessFactor = max(0, 1 − 8 × 0.2) = **0**
- integrationPremium = 10 × 1.0 × 0 = **0**
- composite = 54.375 → **54.4**

Pennsylvania earns no integration bonus. The state is consistent (low spread) but consistently mid — every one of its 8 dimensions sits below the 4.0 threshold. Consistency only pays when the consistent level is high.

---

## Dimension Details

### AWR: Awareness (Score: 65.0/100 | Raw 3.6)

| Subdimension | Score | Evidence | Source |
|-------------|-------|----------|--------|
| A1 Suffering Detection | 4/5 | PA Department of Health publishes an annual Maternal Mortality Review report with race-disaggregated data (2025 report). PA DEP's PennEnviroScreen uses 32 indicators including asthma rates, cancer rates, race, income and diesel particulate exposure to designate Environmental Justice Areas. PA DHS runs public data dashboards. PA State Police collected and independently analyzed all 433,599 trooper-initiated traffic stops in 2024. Multiple formal channels with disaggregation and independent audit. | [2025 PA Maternal Mortality Review Report](https://www.pa.gov/content/dam/copapwp-pagov/en/health/documents/topics/documents/programs/2025%20MMR%20Report.pdf); [PennEnviroScreen](https://www.pa.gov/agencies/dep/public-participation/office-of-environmental-justice/pa-environmental-justice-areas); [PSP 2024 Traffic Stop Study](https://www.pa.gov/content/dam/copapwp-pagov/en/psp/documents/cdr/cdr_2024.pdf) |
| A2 Contextual Sensitivity | 4/5 | PA's first Maternal Health Strategic Plan (2025) sets differentiated priorities for rural residents, behavioral health and substance use populations, and communities in maternity care deserts. The Basic Education Funding Commission held 11 public hearings across the state in fall 2023 before issuing its remedy. DEP's EJ Policy ran a public comment period to 2025-11-30 before adoption 2026-01-03. Differentiated processes for 3+ groups with genuine community input. | [PA Maternal Health Strategic Plan](https://www.pa.gov/agencies/health/programs/maternal-health-and-infant-care/maternal-mortality); [Education Law Center on BEFC](https://www.elc-pa.org/historic-victory-in-the-fight-for-fair-funding/); [DEP EJ Policy](https://www.pa.gov/agencies/dep/public-participation/office-of-environmental-justice/ej-policy) |
| A3 Blind Spot Mitigation | 4/5 | Auditor General conducts structured recurring audits that surface findings: audits of nine county children and youth services agencies in Q1 2025; PennHOMES performance audit producing 2 findings and 24 recommendations; a 2025 audit of the Department of Aging's elder-abuse protection system. Findings are acted upon. Caveat: the Department of Aging probe followed Spotlight PA reporting rather than internal detection. | [Spotlight PA, 2025-06](https://www.spotlightpa.org/news/2025/06/pennsylvania-elder-abuse-protection-system-audit-investigation/); [PA Auditor General, PennHOMES audit](https://www.paauditor.gov/auditor-general-defoors-performance-audit-of-pennhomes-program-finds-inconsistent-record-keeping-makes-24-recommendations-for-improvement/) |
| A4 Signal Amplification | 3/5 | The PA Human Relations Commission is the designated structural channel for low-power voices and handles thousands of discrimination complaints annually with 101 staff and $14.5M. But it has received **no new commissioner appointments since 2018** and has fallen from seven commissioners to five, below the six required for a quorum. The DEP Office of Environmental Justice has 12 staff including six regional coordinators. Designated staff exist and have influenced decisions, but the flagship structural role currently lacks the authority to act. | [Pennsylvania Capital-Star / WITF, 2026-04-27](https://www.witf.org/2026/04/27/following-an-investigation-and-resignations-whats-next-for-pa-s-human-relations-commission/); [PA DEP OEJ](https://www.pa.gov/agencies/dep/public-participation/office-of-environmental-justice) |
| A5 Anticipatory Awareness | 3/5 | DEP's Environmental Justice Policy requires an Enhanced Public Participation Process for designated "Trigger" and "Opt-In" projects before permitting decisions. This is a formal pre-launch harm assessment, but applies to a defined subset of environmental permits rather than all major state decisions. No evidence of a general anticipatory harm-assessment requirement across executive agencies. | [DEP EJ Policy, adopted 2026-01-03](https://www.pa.gov/agencies/dep/public-participation/office-of-environmental-justice/ej-policy) |

**Dimension note:** Awareness is Pennsylvania's joint-strongest dimension. The state has built genuinely good instruments for seeing suffering — PennEnviroScreen and the Maternal Mortality Review Committee are Tier 4-5 infrastructure. What holds it below 4.0 is that its main amplification body cannot legally convene.

---

### EMP: Empathy (Score: 55.0/100 | Raw 3.2)

| Subdimension | Score | Evidence | Source |
|-------------|-------|----------|--------|
| E1 Affective Resonance | 3/5 | Mixed and largely undocumented at the state level. The 2021 Unemployment Compensation system rollout left claimants misidentified as incarcerated and hundreds of thousands waiting months — a transactional failure at scale. Subsequent L&I investments added call capacity and reduced backlog. Training and improvement exist; no independent testimony confirming people feel cared about across populations. Confidence: low. | [Spotlight PA, 2021-06](https://www.spotlightpa.org/news/2021/06/pa-unemployment-new-system-errors-issues/); [WESA, 2023-06-12](https://www.wesa.fm/politics-government/2023-06-12/pennsylvania-unemployment-compensation-staff) |
| E2 Perspective-Taking | 4/5 | The Basic Education Funding Commission held 11 public hearings statewide in fall 2023 and its January 2024 majority report — which quantified a $5.4 billion underfunding gap and recommended a seven-year closure plan — directly shaped subsequent budgets. Communities can name the decision that changed. Community members sat on the commission but were not the controlling decision-makers. | [Education Law Center, 2024-01-11](https://www.elc-pa.org/historic-victory-in-the-fight-for-fair-funding/); [Public Interest Law Center](https://pubintlaw.org/cases-and-projects/school-funding-lawsuit/) |
| E3 Non-Judgment | 4/5 | PA State Police commissioned Dr. Robin Engel of Ohio State's John Glenn College to independently analyze all 433,599 trooper-initiated stops from 2024. The analysis found no substantive racial or ethnic disparities in stop reasons or post-stop outcomes for Black and Hispanic drivers, and was published. This is Tier 5 evidence on the highest-stakes discretionary interaction the state has with residents. Offset by persistent 2.6x Black maternal mortality disparity, preventing a 5. | [PSP 2024 Traffic Stop Study](https://www.pa.gov/content/dam/copapwp-pagov/en/psp/documents/cdr/cdr_2024.pdf); [Spotlight PA, 2024-08](https://www.spotlightpa.org/news/2024/08/pennsylvania-state-police-traffic-stop-analysis-few-racial-differences/) |
| E4 Validation | 2/5 | A 2025 Resolve Philly / Spotlight PA investigation found nearly every Pennsylvania county took Social Security benefits owed to children in foster care — at least $15.7 million from at least 1,300 children over four years — and that youth were **often not directly notified**, which reporters and advocates characterized as a possible due process violation. The state did not surface, acknowledge, or validate this harm; journalists did. | [Spotlight PA, 2025-04](https://www.spotlightpa.org/news/2025/04/foster-care-social-security-resolve-philly/); [WPSU, 2025-04-03](https://radio.wpsu.org/2025-04-03/foster-care-agencies-pa-took-millions-owed-kids-their-care-often-keeping-them-dark) |
| E5 Cultural Empathy | 3/5 | The Maternal Health Strategic Plan includes "Expanding and Diversifying" the maternal care workforce as one of five named priority areas. DEP's EJ Policy includes a Proactive Community Engagement section built to sustain relationships with communities outside individual permit fights. At least one genuine adaptation co-designed with affected communities; not yet evidence that core state practices changed based on non-dominant cultural knowledge. | [PA Maternal Health Strategic Plan](https://www.pa.gov/agencies/health/programs/maternal-health-and-infant-care/maternal-mortality); [DEP EJ Policy](https://www.pa.gov/agencies/dep/public-participation/office-of-environmental-justice/ej-policy) |

---

### ACT: Action (Score: 50.0/100 | Raw 3.0)

| Subdimension | Score | Evidence | Source |
|-------------|-------|----------|--------|
| AC1 Responsiveness | 2/5 | Pennsylvania's 2025-26 budget was **135 days late**, signed 2025-11-12, making Pennsylvania the last state in the country to pass a funding deal. Schools waited on $5.3 billion. Rape crisis centers and domestic violence programs cut staff or reduced services. Jefferson-Clarion Head Start laid off staff and maxed a $750,000 credit line, jeopardizing services for 300+ families. The 2026-27 budget was late for the **fifth consecutive year**. Standards exist and are not met, and the failure lands hardest on the most acute-need providers. | [Philadelphia Inquirer, 2025-11-12](https://www.inquirer.com/politics/pennsylvania/pennsylvania-state-budget-deal-impasse-ends-20251112.html); [Spotlight PA, 2026-07](https://www.spotlightpa.org/news/2026/07/budget-pennsylvania-late-deadline-june-30-2026-shapiro-capitol/); [PA Capital-Star on impasse consequences](https://penncapital-star.com/government-politics/with-no-end-to-budget-impasse-in-sight-pa-school-districts-and-counties-warn-of-program-cuts/) |
| AC2 Proportionality | 4/5 | The intellectual disability and autism (ID/A) waiver system uses a documented tiered framework enrolling "emergency" category applicants before "critical" and "planning." A $354.8 million investment in the 2024-25 budget produced a 31% reduction in the adult emergency waiting list. Unmet need is tracked and published: 4,000+ on the emergency list, 13,000+ total. Documented augmented response with published unmet need. | [PA DHS, 2025](https://www.pa.gov/agencies/dhs/newsroom/shapiro-administration-reduces-emergency-waitlist-for-id-a-servi); [PA Waiting List Campaign](https://pawaitinglistcampaign.org/) |
| AC3 Efficacy | 3/5 | Pennsylvania overdose deaths fell from approximately 4,700 in 2023 to approximately 3,300 in 2024. A public dashboard launched August 2025 tracks opioid settlement spending, showing $80M+ spent on approved remediation as of 2024-12-31. Auditor General performance audits have driven program modification. Outcome data is reviewed and programs modified; no clear case of a program discontinued because data showed it did not work. | [Temple Center for Public Health Law Research, 2025-09](https://phlr.temple.edu/news/2025/09/new-website-tracks-how-pennsylvanias-22b-opioid-settlement-funds-being-spent); [PA Opioid Settlement Data](https://www.paopioidsettlementdata.org/) |
| AC4 Resource Mobilization | 3/5 | Gap analysis is genuinely completed and public: the $5.4 billion school funding shortfall is quantified with a seven-year closure plan, and the 2026-27 budget adds $565 million for adequacy and tax equity on top of $3 billion. DHS is the largest general fund line at $21.9 billion. **Counterweight:** Pennsylvania's minimum wage has been $7.25 since 2009 — the lowest of any of its neighbors (NY $17, NJ $15.92, MD $15, OH $11, WV $8.75). The state's single largest available anti-poverty lever has gone unused for 17 years. | [Spotlight PA, 2026-07](https://www.spotlightpa.org/news/2026/07/pennsylvania-budget-education-skill-games-data-centers-capitol/); [PA Budget and Policy Center, 2026-02](https://pennpolicy.org/wp-content/uploads/2026/02/2026_BudgetOverview_MinWagev3.pdf) |
| AC5 Follow-Through | 3/5 | Pennsylvania maintains multi-year commitments: a seven-year school funding plan, a multi-year ID/A growth strategy sustained across the 2024-25 and 2025-26 budgets, and opioid settlement distribution scheduled through 2038. Protocols are defined and longitudinal. But the recurring budget impasse interrupts execution annually, and the school funding plan has not yet been fully honored on schedule. | [PA DHS ID/A release](https://www.pa.gov/agencies/dhs/newsroom/shapiro-administration-reduces-emergency-waitlist-for-id-a-servi); [Education Law Center](https://edlawcenter.org/pennsylvania-court-rules-state-school-funding-system-unconstitutional-but-the-hard-work-continues/) |

**Dimension note:** Pennsylvania knows what to do and often funds it. The Action score is dragged down almost entirely by a single recurring institutional behavior: the state cannot pass its budget on time, and the cost of that lands on rape crisis centers, Head Start programs and school districts.

---

### EQU: Equity (Score: 60.0/100 | Raw 3.4)

| Subdimension | Score | Evidence | Source |
|-------------|-------|----------|--------|
| EQ1 Universality | 4/5 | Pennsylvania adopted Medicaid expansion and covers approximately 750,000 people through it, with more than 2.5 million covered at some point since 2015. Uninsured rate was 5.4% (672,800 people) per KFF 2022 data. Coverage is disaggregated and reported. Federal work-reporting requirements are projected to remove 310,000 Pennsylvanians beginning October 2026 — scored as federal imposition, not state conduct, but the state's mitigation response is not yet evidenced. | [healthinsurance.org, PA Medicaid](https://www.healthinsurance.org/medicaid/pennsylvania/); [PA Health Law Project](https://www.phlp.org/en/news/historic-medicaid-cuts-coming-to-pennsylvania-310-000-could-lose-coverage) |
| EQ2 Priority for Vulnerable | 4/5 | Two documented prioritization frameworks where higher need receives more: the ID/A waiver emergency-first enrollment sequence, and the school funding adequacy formula which directs the $565 million supplement specifically toward the lowest-wealth districts identified by the Commonwealth Court ruling. Allocation demonstrably follows need. Not independently verified as narrowing outcome disparities, holding it at 4. | [Spotlight PA, 2026-02](https://www.spotlightpa.org/news/2026/02/josh-shapiro-budget-address-school-marijuana-minimum-wage-capitol/); [PA DHS](https://www.pa.gov/agencies/dhs/newsroom/shapiro-administration-reduces-emergency-waitlist-for-id-a-servi) |
| EQ3 Bias Awareness | 3/5 | Disparities are identified and formally investigated: the PSP commissioned an independent external audit and published it; the Maternal Mortality Review Committee publishes race-disaggregated findings. **But the disparities themselves are not narrowing.** In 2021, Black birthing individuals died at 69.9 per 100,000 live births versus 26.6 for white counterparts — a 2.6x gap. Separately, the headline decline in overdose deaths masks continued increases among people of color. Investigation is real; correction is not yet verified. | [2025 PA Maternal Mortality Review Report](https://www.pa.gov/content/dam/copapwp-pagov/en/health/documents/topics/documents/programs/2025%20MMR%20Report.pdf); [Network for Public Health Law, Black Maternal Health in PA](https://www.networkforphl.org/wp-content/uploads/2023/05/Black-Maternal-Health-in-Pennsylvania.pdf) |
| EQ4 Access Design | 4/5 | Multiple barriers removed with evidence. Act 36 of 2023 created automatic expungement for certain non-violent felonies and shortened waiting periods for misdemeanors, removing a record-based barrier at population scale without requiring anyone to apply. Nursing home direct-care minimums rose from 2.7 to 2.87 hours (2023-07-01) then to 3.2 hours (2024-07-01). PennEnviroScreen designates EJ Areas for targeted resource prioritization. Ongoing program, not yet co-designed by the most access-challenged populations. | [PA Governor's Office, Clean Slate Act 36](https://www.pa.gov/governor/newsroom/2024-press-releases/governor-shapiro-hosts-legislative-leaders-and-reform-advocates-0); [WHYY, nursing home staffing](https://whyy.org/articles/pa-new-nursing-home-staffing-requirements-in-effect/) |
| EQ5 Historical Harm Acknowledgment | 2/5 | Pennhurst State School and Hospital operated from 1908 under explicitly eugenic premises, segregating people classified as "defective," and was the subject of landmark disability rights litigation. Pennsylvania's acknowledgment consists of a **historical marker dedicated in 2010**. There is no state apology, no reparative program, and no compensation framework for institutional survivors or their families. Symbolic acknowledgment only. Confidence: medium (searched for state apology and reparations programs; none found). | [Pennhurst Memorial and Preservation Alliance](http://www.preservepennhurst.org/default.aspx?pg=36); [Encyclopedia of Greater Philadelphia, Pennhurst](https://philadelphiaencyclopedia.org/essays/pennhurst-state-school-and-hospital/) |

---

### BND: Boundaries (Score: 45.0/100 | Raw 2.8)

| Subdimension | Score | Evidence | Source |
|-------------|-------|----------|--------|
| B1 Self-Sustainability | 4/5 | Documented structural interventions actually used: Executive Order 2023-01 removed four-year degree requirements from 92% of commonwealth jobs (~65,000 positions); paid parental leave increased from six to eight weeks; health benefits expanded; time-to-hire cut 35%. In the ID/A sector, the direct support worker vacancy rate reached its lowest level in 11 years. Turnover is tracked and interventions are structural rather than individual. | [PA Capital-Star, 2023-01-18](https://penncapital-star.com/government-politics/in-his-first-executive-order-shapiro-removes-degree-requirement-for-thousands-of-state-jobs/); [PA Office of Administration, paid parental leave](https://www.pa.gov/agencies/oa/newsroom/shapiro-administration-announces-increased-paid-parental-leave-new-work-life-benefits-for-commonwealth-employees) |
| B2 Autonomy Preservation | 3/5 | Programs designed to build capacity and exit: Clean Slate automatic expungement removes a permanent status barrier without ongoing state involvement; 2023 probation reform requires terms tailored to employment and child-care circumstances and establishes a "presumption against total confinement" for minor violations plus review conferences for early termination of supervision; the Person/Family Directed Support waiver is self-directed by design. Outcomes not yet systematically measured. | [Spotlight PA, 2023-12](https://www.spotlightpa.org/news/2023/12/pennsylvania-criminal-justice-clean-slate-probation-legislature-crime-septa/); [PA DHS, PFDS Waiver](https://www.pa.gov/agencies/dhs/resources/intellectual-disabilities-autism/pfds-waiver) |
| B3 Scope Clarity | 3/5 | Waiver waiting list categories (emergency, critical, planning) and totals are published, and expected waits are known to be seven or more years. This is honest about limits. But advocacy groups continue to report that families do not learn their realistic timeline at intake, and the state does not proactively communicate expected wait duration before families commit to the process. Confidence: medium. | [PA Waiting List Campaign](https://pawaitinglistcampaign.org/); [Medicaid Waiver, PA](https://www.medicaidwaiver.org/state/pennsylvania.html) |
| B4 Refusal Ethics | 2/5 | More than 13,000 Pennsylvanians are waiting for waiver services, with typical waits of seven or more years and no concrete alternative provided for most. This is effective refusal without alternative, at scale, for people with intellectual disabilities and autism. The 31% emergency-list reduction is real progress but does not change the structural position of the 9,000+ in the non-emergency categories. | [PA Waiting List Campaign](https://pawaitinglistcampaign.org/); [Times Observer, 2025-09](https://www.timesobserver.com/news/local-news/2025/09/state-touts-improvements-in-disability-services-waitlist/) |
| B5 Consent Orientation | 2/5 | The foster-care Social Security finding is a direct consent failure. Counties across nearly the entire state took benefits owed to at least 1,300 children — at least $15.7 million over four years — and youth were often not directly notified their money had been taken. Reporters and legal advocates identified this as a possible due process violation. Consent operated as a legal formality that did not inform the affected party. | [Spotlight PA, 2025-04](https://www.spotlightpa.org/news/2025/04/foster-care-social-security-resolve-philly/); [Spotlight PA methodology piece, 2025-04](https://www.spotlightpa.org/news/2025/04/behind-reporting-resolve-philly-foster-benefits/) |

**Dimension note:** Pennsylvania treats its own workforce noticeably better than it treats the people waiting for its services. B1 at 4 against B4 and B5 at 2 is the clearest internal contradiction in the state's profile.

---

### ACC: Accountability (Score: 50.0/100 | Raw 3.0)

| Subdimension | Score | Evidence | Source |
|-------------|-------|----------|--------|
| AB1 Harm Acknowledgment | 3/5 | Strongest case: after 42 residents died of COVID-19 at the state-run Southeastern Veterans Center — more than the state's five other veterans homes combined — the Governor's Office initiated an independent investigation, the commandant and director of nursing were indefinitely suspended in May 2020, an outside firm (Morgan, Lewis and Bockius) completed a 142-page audit on 2020-10-15, and the Department of Military and Veterans Affairs **released it publicly on 2020-12-29**, before litigation concluded. That is acknowledgment ahead of legal obligation. Offset: the foster-care diversion required journalists to surface it. | [The Center Square on SEVC report](https://www.thecentersquare.com/national/article_e44f4b4c-51d7-11eb-b4ae-1f3b1750f8b8.html); [Philadelphia Inquirer, 2020-07-21](https://www.inquirer.com/health/coronavirus/coronavirus-covid-19-southeastern-veterans-center-20200721.html) |
| AB2 Correction Willingness | 3/5 | At least one significant documented course correction, arguably several: nursing home direct-care minimums raised twice (2023, 2024) following COVID-era failures; the Unemployment Compensation system rebuilt with added examiner capacity after the 2021 collapse; probation and expungement law reformed in Act 36 of 2023. **But** the response to the foster-care finding — HB 151, introduced with bipartisan sponsorship from Reps. Krajewski and Delozier — had still not been enacted as of 2026, roughly a year after the finding. Correction happens, generally under external pressure. | [WESA, 2026-05-03](https://www.wesa.fm/politics-government/2026-05-03/foster-care-social-security-legislation-resolve-philly-capitol); [Spotlight PA, 2026-04](https://www.spotlightpa.org/news/2026/04/foster-care-social-security-legislation-resolve-philly-capitol/) |
| AB3 Transparency | 3/5 | Genuine transparency assets: the Auditor General publishes unflattering performance audits; the opioid settlement dashboard publishes spending; the Maternal Mortality Review and PHRC publish annual reports; the Office of Open Records handled a record 3,970 appeals in 2025, up 23%. **Active countervailing rollback:** the Right-to-Know Law has not been overhauled since 2008, and the 2024 traffic-stop data law — while mandating collection — **exempts that race data from the Right-to-Know Law**, routing it through State Police or a third party instead. Pennsylvania published a good faith audit and simultaneously narrowed the public's right to the underlying records. | [Spotlight PA, 2024-05](https://www.spotlightpa.org/news/2024/05/pennsylvania-state-police-departments-race-data-traffic-stops-public-information-law/); [WESA, 2026-03-29](https://www.wesa.fm/politics-government/2026-03-29/pa-public-records-transparency-right-to-know) |
| AB4 Systemic Learning | 4/5 | Three or more specific practices changed as a result of failure analysis. The SEVC audit produced an 11-point findings list addressing leadership, internal and external communication, and social distancing protocol; nursing home staffing regulation followed. The 2021 UC failure produced sustained investment in examiner staffing and call capacity. The 2023 criminal justice package changed probation practice following documented re-incarceration harms. Learning is institutional, not individual. | [The Center Square, SEVC 11-point findings](https://www.thecentersquare.com/national/article_e44f4b4c-51d7-11eb-b4ae-1f3b1750f8b8.html); [PA DLI, UC system investments](https://www.pa.gov/agencies/dli/newsroom/li-announces-continued-investments-to-improve-unemployment-compensation-system-adds-capacity-to-better-serve-pennsylvanians-) |
| AB5 Reparative Action | 2/5 | This is Pennsylvania's weakest accountability behavior. No repair has been made to the 1,300+ foster children whose $15.7 million was taken — the proposed HB 151 remedy is **prospective only**, stopping future interception and conserving funds going forward. It returns nothing. SEVC families pursued repair through a 2020-12-21 lawsuit rather than receiving it. Pennhurst survivors received a marker. The pattern is minimal legal settlement without co-designed repair. | [Spotlight PA, 2026-04](https://www.spotlightpa.org/news/2026/04/foster-care-social-security-legislation-resolve-philly-capitol/); [The Center Square on SEVC litigation](https://www.thecentersquare.com/national/article_e44f4b4c-51d7-11eb-b4ae-1f3b1750f8b8.html) |

---

### SYS: Systemic Thinking (Score: 65.0/100 | Raw 3.6)

| Subdimension | Score | Evidence | Source |
|-------------|-------|----------|--------|
| S1 Root Cause Orientation | 4/5 | Pennsylvania is pursuing structural rather than symptomatic remedies in its largest domain. Following the 2023-02-07 Commonwealth Court ruling that the school funding system was unconstitutional, the state adopted a seven-year plan to close a quantified $5.4 billion adequacy gap — addressing the property-wealth mechanism that generates educational deprivation rather than compensating for its effects. Clean Slate automatic expungement is explicitly upstream of recidivism. DEP's EJ Policy includes a Community Development and Investments section prioritizing resources to affected communities. | [Chalkbeat, 2023-02-07](https://www.chalkbeat.org/philadelphia/2023/2/7/23590018/pennsylvania-school-funding-court-unconstitutional-equity-property-values-student-opportunities/); [Education Law Center](https://www.elc-pa.org/historic-victory-in-the-fight-for-fair-funding/) |
| S2 Long-Term Impact | 3/5 | Multiple 5+ year planning horizons with tracking: the seven-year school funding closure plan, the multi-year ID/A growth strategy, and opioid settlement distribution scheduled through 2038 with published spending data. Long-term outcome data influences strategy. Held at 3 because the credibility of any long-horizon plan is undercut by a state that has failed to pass an on-time annual budget five years running. | [Temple PHLR, 2025-09](https://phlr.temple.edu/news/2025/09/new-website-tracks-how-pennsylvanias-22b-opioid-settlement-funds-being-spent); [Spotlight PA, 2026-07](https://www.spotlightpa.org/news/2026/07/budget-pennsylvania-late-deadline-june-30-2026-shapiro-capitol/) |
| S3 Interconnection Awareness | 4/5 | Cross-system effects are systematically mapped in at least two major instruments. PennEnviroScreen deliberately combines 32 indicators spanning environmental exposure (toxic air, diesel particulate, oil and gas wells), demographics (race, income, age) and health outcomes (asthma, cancer) — an explicit model of how adjacent systems compound. The Maternal Health Strategic Plan is jointly authored by the Department of Human Services, Department of Health and Insurance Department, and names social determinants of health as a priority area. | [PennEnviroScreen](https://www.pa.gov/agencies/dep/public-participation/office-of-environmental-justice/pa-environmental-justice-areas); [PA Maternal Health Strategic Plan](https://www.pa.gov/agencies/health/programs/maternal-health-and-infant-care/maternal-mortality) |
| S4 Structural Critique | 4/5 | Documented advocacy carrying real institutional and political risk. Pennsylvania sued the federal administration over a funding freeze affecting a claimed $2 billion (filed 2025-02-13), over the termination of $13 million in Local Food Purchase Assistance funds, over revoked Homeland Security funds, and joined 24 states plus DC challenging the November 2025 SNAP suspension affecting nearly 2 million Pennsylvanians. These positions ran against the state's short-term federal-relations interest. | [Philadelphia Inquirer, 2025-02-13](https://www.inquirer.com/news/pennsylvania/governor-shapiro-federal-funding-freeze-lawsuit-20250213.html); [ABC27, SNAP suit](https://www.abc27.com/pennsylvania-politics/gov-shapiro-sues-trump-administration-over-suspension-of-snap-benefits/); [PA Governor's Office](https://www.pa.gov/governor/newsroom/2025-press-releases/gov-shapiro-challenges-trump-admin-s-cuts-to-funding-that-keeps-) |
| S5 Coalitional Compassion | 3/5 | Active coalition member with documented contributions: joined the 25-jurisdiction SNAP litigation and multistate suits on Homeland Security and FEMA funds; partnered with Temple University's Center for Public Health Law Research to build the public opioid settlement tracker rather than building it in-house. No evidence of ceding leadership, credit or resources to a better-positioned organization. | [ABC27, multistate DHS suit](https://www.abc27.com/pennsylvania-politics/gov-shapiro-joins-lawsuit-seeking-millions-in-revoked-homeland-security-funds/); [Temple PHLR](https://phlr.temple.edu/news/2025/09/new-website-tracks-how-pennsylvanias-22b-opioid-settlement-funds-being-spent) |

**Dimension note:** Systemic Thinking ties Awareness as Pennsylvania's strongest dimension. The state genuinely reasons about causes and adjacent systems, and it will spend political capital externally.

---

### INT: Integrity (Score: 45.0/100 | Raw 2.8)

| Subdimension | Score | Evidence | Source |
|-------------|-------|----------|--------|
| I1 Consistency Under Pressure | 3/5 | Clear case of bearing real cost: when federal SNAP benefits were suspended in November 2025, threatening nearly 2 million Pennsylvanians, the state declared a disaster emergency, released **$5 million in commonwealth funds** to charitable food networks, litigated, and issued full November benefits within 24 hours of the shutdown ending. **But** the state simultaneously inflicted a comparable harm on itself: its own 135-day impasse cut off payments to rape crisis centers and domestic violence programs. Pennsylvania protects its residents from external shocks better than from its own legislature. | [City & State PA, 2025-10](https://www.cityandstatepa.com/politics/2025/10/what-know-pennsylvania-braces-loss-snap-benefits/409241/); [PA DHS, November 2025 SNAP issuance](https://www.pa.gov/agencies/dhs/newsroom/shapiro-administration-issues-full-november-2025-snap-benefits) |
| I2 Non-Performance | 3/5 | Some practices maintained regardless of visibility. PSP's traffic stop data collection is described as a **voluntary ongoing initiative** that predated any statutory mandate, and the state published a result that could have gone against it. The Auditor General audits the state's own agencies and publishes adverse findings. The EJ Office maintains 12 staff on unglamorous regional coordination. No documented instance of doing something compassionate that was publicly unflattering. | [PSP 2024 Traffic Stop Study](https://www.pa.gov/content/dam/copapwp-pagov/en/psp/documents/cdr/cdr_2024.pdf); [PA Auditor General](https://www.paauditor.gov/) |
| I3 Internal Consistency | 3/5 | Meaningful effort applied to state staff: degree requirements removed for 92% of jobs, parental leave to eight weeks, expanded health benefits, time-to-hire down 35%, plus targeted support services covering child and elder care, home and vehicle repair. **But** the Department of Corrections' chronic understaffing is documented as a contributing cause of rising preventable deaths — the state's own frontline staff and the people in their custody both bear that cost. Effort is real and unevenly distributed. | [Governing, PA workforce](https://www.governing.com/workforce/pennsylvania-focuses-on-attracting-keeping-workers); [Pennsylvania Prison Society, death rate analysis](https://www.prisonsociety.org/updates/death-rate-rising-in-pa-prisons-and-jails) |
| I4 Values Alignment | 3/5 | Pennsylvania states poverty reduction as a core commitment and has kept its minimum wage at $7.25 since 2009 — 17 years, and the lowest of any neighboring state. The Governor has proposed an increase in successive budgets including a $15 floor effective 2027-01-01, and the House passed a tiered increase bill, but it has not cleared the Senate. Divided government is genuine mitigation; a 17-year gap between stated value and delivered outcome is still a values-alignment failure. Values are consulted in major decisions but not consistently applied. | [PA Budget and Policy Center, 2026-02](https://pennpolicy.org/wp-content/uploads/2026/02/2026_BudgetOverview_MinWagev3.pdf); [Spotlight PA, 2025-06](https://www.spotlightpa.org/news/2025/06/minimum-wage-15-pennsylvania-house-senate-philadelphia/) |
| I5 Resilience of Care | 2/5 | Pennsylvania's compassion infrastructure is unusually dependent on who currently holds office rather than on durable structure. Two concrete indicators. First, the Human Relations Commission has received **no new commissioner appointments since 2018** and has fallen below the six-member quorum it needs to act — the state's civil rights enforcement body has been allowed to structurally decay across two administrations. Second, LGBTQ+ nondiscrimination protection rests on a **June 2023 PHRC regulation**, not statute; the General Assembly has never passed a statutory protection, and the regulation faces a constitutional challenge. A future commission could reverse it. | [WITF, 2026-04-27](https://www.witf.org/2026/04/27/following-an-investigation-and-resignations-whats-next-for-pa-s-human-relations-commission/); [PA Capital-Star, PHRC LGBTQ+ regulations](https://penncapital-star.com/civil-rights-social-justice/pa-human-relations-commission-announces-new-lgbtq-nondiscrimination-regulations/); [PA Capital-Star, constitutional challenge](https://penncapital-star.com/civil-rights-social-justice/suit-claims-pa-human-relations-commissions-lgbtq-protections-are-unconstitutional/) |

---

## Five-Year Trajectory: 2021 to 2026

**Direction: Improving, with a persistent structural drag.**

Pennsylvania has moved up roughly 15 to 18 composite points across the five-year window, driven almost entirely by three things: a court-forced education funding remedy, a rebuilt administrative state, and the construction of real measurement infrastructure. What has not improved is the state's legislative capacity to deliver on time or in statute.

| Year | Estimated composite | Defining events | Confidence |
|------|--------------------|-----------------|------------|
| **2021** | ~37 (Developing) | Unemployment Compensation system collapse: the June 2021 rebuild rejected already-approved claimants and misidentified people as incarcerated; hundreds of thousands waited months. Fallout from 42 COVID deaths at the state-run Southeastern Veterans Center. No statewide LGBTQ+ protection of any kind. School funding system still unchallenged. Minimum wage $7.25. | Medium |
| **2022** | ~40 (Developing) | UC backlog persists into a second year with tens of thousands unresolved; chronic examiner shortage documented. PHRC commissioner appointments already four years stalled. December 2022: Wolf administration moves to formalize LGBTQ+ protections by regulation. | Medium |
| **2023** | ~48 (Functional) | **Pivotal year.** 2023-02-07: Commonwealth Court rules the school funding system unconstitutional. June 2023: PHRC regulation explicitly bans sexual orientation and gender identity discrimination. 2023-07-01: nursing home direct-care minimum rises to 2.87 hours. September 2023: Interim Final EJ Policy adopted. December 2023: Act 36 expands Clean Slate and reforms probation. January 2023: degree requirements removed from 92% of state jobs. | High |
| **2024** | ~52 (Functional) | 2024-01-11: BEFC quantifies the $5.4 billion adequacy gap and recommends a seven-year plan. 2024-07-01: nursing home minimum rises to 3.2 hours. $354.8 million ID/A investment secured. Overdose deaths fall from ~4,700 to ~3,300. **Countervailing:** the new traffic-stop data law exempts race data from the Right-to-Know Law. | High |
| **2025** | ~53 (Functional) | Foster-care Social Security diversion exposed by Resolve Philly and Spotlight PA ($15.7M, 1,300+ children). Philadelphia CUA investigation documents ~70 lawsuits and 14 child deaths. Opioid settlement dashboard launches (August). ID/A emergency waitlist down 31%. **135-day budget impasse** — last state in the nation to pass a budget. Pennsylvania sues over the federal funding freeze and SNAP suspension, and commits $5M to food banks. | High |
| **2026** | **54.4 (Functional)** | 2026-01-03: final EJ Policy adopted. PHRC falls below quorum; executive director resigns effective June 2026 amid a Governor's Office review of agency purchases. Budget late for the fifth consecutive year. HB 151 (foster benefit protection) still not enacted. Minimum wage still $7.25. | High |

**What drove the gain (2021 to 2026):**
1. The school funding ruling converted a political question into a legal obligation with a quantified number and a schedule. This is the single largest structural improvement.
2. Administrative competence recovered sharply after 2021 — UC rebuilt, hiring accelerated 35%, ID/A waitlist reduced 31%.
3. Measurement infrastructure was built where none existed: PennEnviroScreen, the opioid settlement tracker, independent PSP analysis.

**What is not moving:**
1. **Minimum wage.** $7.25 in 2021. $7.25 in 2026. Every neighbor raised theirs.
2. **On-time budgets.** Late in 2022, 2023, 2024, 2025 and 2026. The trend worsened, culminating in 135 days.
3. **Statutory durability.** The most important civil rights advance of the period (June 2023) was made by regulation, is under constitutional challenge, and its enforcement body cannot currently convene.
4. **Reparative action.** No repair delivered to Pennhurst survivors, SEVC families, or foster youth whose benefits were taken.

**Projection:** Absent a statutory LGBTQ+ nondiscrimination law, PHRC quorum restoration, a minimum wage increase, or an on-time budget, Pennsylvania is likely to plateau in the low-to-mid 50s. Any two of those four would plausibly move it to the low 60s and into the Established band.

---

## Published Index Comparison

**This entity does not currently appear in any published Compassion Benchmark index.**

Pennsylvania is absent from `site/src/data/indexes/us-states.json`, which publishes 21 of 51 entities (the top 8 and bottom 13). Pennsylvania falls within the missing rank 9-38 range. It should be added to the `us-states` index.

**Estimated placement in the current published set:** A composite of 54.4 would rank **9th of 22** — immediately below Connecticut (83.0) and immediately above Idaho, Indiana, Missouri, North Dakota and South Dakota (all 25.0). Pennsylvania would be the **first and only entity in the Functional band** in the published set, which currently has zero entities in both the Established (61-80) and Functional (41-60) bands.

This is a meaningful data-quality contribution: adding Pennsylvania begins to populate the empty middle of the index and demonstrates that the 58-point gap between rank 8 and rank 9 is an artifact of extraction, not a real bimodal distribution of American state governance.

---

## Change Proposal

```yaml
proposal_type: new_entity_addition
index: us-states
entity: Pennsylvania
region: Mid-Atlantic
assessment_date: 2026-07-19
assessor: Compassion Benchmark Research Analyst (desk-based)
methodology_version: v1.2

proposed_record:
  name: "Pennsylvania"
  region: "Mid-Atlantic"
  composite: 54.4
  band: "functional"
  scores:
    AWR: 3.6
    EMP: 3.2
    ACT: 3.0
    EQU: 3.4
    BND: 2.8
    ACC: 3.0
    SYS: 3.6
    INT: 2.8

composite_verification:
  method: "computeCompositeFromDimensions (site/scripts/lib/scoring.mjs)"
  base_avg: 3.175
  base_composite: 54.375
  std_dev: 0.307
  consistency_mult: 1.0
  weak_dims: 8
  weakness_factor: 0.0
  integration_premium: 0.0
  final: 54.4
  band: "Functional"

index_impact:
  entity_count: 21 -> 22
  new_rank: 9
  displaces: "Idaho and below shift +1"
  band_distribution_change: "Functional band populated for the first time (0 -> 1)"
  note: >
    Pennsylvania is the first entity to occupy the empty middle of the
    US States index. Adding it demonstrates that the 58-point gap between
    rank 8 (Connecticut, 83.0) and rank 9 (Idaho, 25.0) reflects missing
    source data, not a real bimodal distribution.

meta_updates_required:
  entityCount: 22
  meanScore: "recompute (currently 46.9)"
  medianScore: "recompute (currently 25)"
  bands: "Functional count 0 -> 1, pct recalculation across all bands"

confidence: "Medium-High"
review_status: "PROPOSED — awaiting founder review. No index file modified."
```

**Constraint compliance:** `site/src/data/indexes/us-states.json` was read for calibration and **not modified**. This is a proposal only.

---

## Key Findings

- **Pennsylvania is a genuinely mid-pack state, and it earns that position honestly — it scores 54.4 out of 100, in the Functional band.** No dimension is failing and no dimension is excellent. All 8 dimensions land between 45 and 65 on the 0-100 scale. That flatness costs Pennsylvania the methodology's consistency bonus entirely, because the bonus only pays when every dimension clears 4.0 out of 5.

- **Pennsylvania sees suffering well and repairs it poorly.** The state scores 65 out of 100 on Awareness, its joint-best result, on the strength of tools like PennEnviroScreen, which combines 32 indicators to map environmental harm. But it scores 2 out of 5 on Reparative Action, its worst subdimension. When a 2025 investigation found Pennsylvania counties had taken at least $15.7 million in Social Security benefits from at least 1,300 foster children, the proposed fix, House Bill 151, only stops it happening again. It returns nothing to the children.

- **The state's own legislature is the largest single source of harm in this assessment.** Pennsylvania's 2025-26 budget was 135 days late, the last in the nation. Schools waited on $5.3 billion. Rape crisis centers and domestic violence programs cut staff. One Head Start program maxed a $750,000 credit line, putting services for over 300 families at risk. The 2026-27 budget was late for the fifth year running.

- **Pennsylvania's minimum wage has been $7.25 an hour since 2009 — the lowest of any neighboring state.** New York pays $17, New Jersey $15.92, Maryland $15, Ohio $11, and even West Virginia pays $8.75. Seventeen years of no change is the clearest gap between what Pennsylvania says about poverty and what it does.

- **The state's most important civil rights protections are structurally fragile.** Pennsylvania banned discrimination based on sexual orientation and gender identity in June 2023 — but by regulation, not by law. The legislature has never passed a statute. The regulation is being challenged in court. Meanwhile the body that enforces it, the Human Relations Commission, has had no new commissioners appointed since 2018 and has dropped to five members, below the six it needs to meet.

- **Pennsylvania defends its residents from federal harm more reliably than from its own.** The state sued over a $2 billion federal funding freeze, joined 24 states challenging the November 2025 SNAP suspension affecting nearly 2 million Pennsylvanians, declared a disaster emergency, and released $5 million of its own money to food banks. It did all that while its own budget impasse was defunding domestic violence programs.

---

## Strongest Dimensions

- **Awareness (65/100)** and **Systemic Thinking (65/100)** tie for highest. Pennsylvania has built real instruments for detecting suffering — the Maternal Mortality Review Committee publishes race-disaggregated death rates annually, PennEnviroScreen maps 32 environmental and health indicators, and the State Police voluntarily paid an outside university researcher to audit all 433,599 of its 2024 traffic stops and published the result.
- **Systemic Thinking** is strong because Pennsylvania reasons about causes. The seven-year plan to close a quantified $5.4 billion school funding gap addresses the property-wealth mechanism that produces educational deprivation, not just its symptoms. The state also spends political capital externally, suing the federal government four separate times to protect resident benefits.
- **Equity (60/100)** is supported by Medicaid expansion covering about 750,000 people, a documented emergency-first prioritization system for disability waivers, and Clean Slate automatic expungement, which removes a lifelong barrier without requiring anyone to apply.

## Weakest Dimensions

- **Boundaries (45/100)** and **Integrity (45/100)** tie for lowest.
- **Boundaries** fails on refusal and consent. More than 13,000 Pennsylvanians wait for disability waiver services, typically seven or more years, with no alternative offered. Foster children had money taken without being told. Notably, Pennsylvania treats its own employees far better than its service recipients: staff got eight weeks paid parental leave and degree requirements dropped from 92% of jobs, scoring 4 out of 5, while refusal ethics and consent both score 2 out of 5.
- **Integrity** fails on durability. Pennsylvania's compassion infrastructure depends heavily on who currently holds office. The Human Relations Commission was allowed to decay below quorum across two administrations. The state's landmark LGBTQ+ protection is a regulation under legal challenge rather than a law. Values Alignment is held down by the 17-year minimum wage freeze.
- **Action (50/100)** and **Accountability (50/100)** are both dragged down by single severe behaviors: chronic budget lateness for Action, and near-total absence of reparative action for Accountability.

## Evidence Gaps

- **E1 Affective Resonance (confidence: low).** No independent testimony exists about whether Pennsylvanians feel genuinely cared about when interacting with state services. Scored 3 of 5 as a conservative default from the mixed Unemployment Compensation record. A Certified Assessment with direct service-user interviews would resolve this.
- **B3 Scope Clarity (confidence: medium).** Waiver waitlist categories and totals are published, but no verifiable evidence was found on whether families are told realistic wait times at intake.
- **EQ5 Historical Harm Acknowledgment (confidence: medium).** Searched specifically for a Pennsylvania state apology or reparations program covering Pennhurst, eugenics-era institutional practice, or Native American boarding schools. Found only the 2010 historical marker. Absence of evidence is treated as absence of practice per the methodology, but a state action may exist that was not surfaced.
- **AB5 Reparative Action.** No systematic public accounting of state settlements or repair programs exists. Scoring relies on three documented cases, all of which show minimal or prospective-only repair.
- **Federal-state attribution.** The projected loss of Medicaid coverage for 310,000 Pennsylvanians from October 2026 stems from federal work-reporting requirements, and was scored as federal imposition per the assessment constraint. Pennsylvania's mitigation response is not yet evidenced and should be reassessed after October 2026.
- **County-level variance.** Pennsylvania administers child welfare and human services through 67 counties. The Philadelphia foster care findings reflect city and contractor conduct under state supervision. This assessment scores state supervisory conduct, but county-level variance is substantial and under-measured.

## Recommended Next Steps

Pennsylvania scores in the **Functional** band (41-60), where systems exist but have significant gaps.

- Consider [Advisory Support](/advisory) to translate these benchmark findings into strategic action. The score profile is unusually actionable: Pennsylvania is within reach of the Established band, and the analysis identifies four specific, discrete levers — statutory nondiscrimination protection, Human Relations Commission quorum restoration, a minimum wage increase, and on-time budget delivery. Any two would plausibly move the composite into the low 60s.
- The most cost-free improvement available is **PHRC quorum restoration**, which requires appointments rather than appropriations, and would lift A4, EQ3 and I5 simultaneously.
- The highest-integrity improvement available is **retrospective repair to the 1,300+ foster children whose benefits were taken**, which would move AB5 off the floor and materially lift Accountability.

---

## Source List

**Health and human services**
- [Medicaid eligibility and enrollment in Pennsylvania — healthinsurance.org](https://www.healthinsurance.org/medicaid/pennsylvania/)
- [At Least 310,000 Pennsylvanians Set to Lose Medicaid — PA Health Law Project](https://www.phlp.org/en/news/historic-medicaid-cuts-coming-to-pennsylvania-310-000-could-lose-coverage)
- [2025 Pennsylvania Maternal Mortality Review Annual Report — PA DOH](https://www.pa.gov/content/dam/copapwp-pagov/en/health/documents/topics/documents/programs/2025%20MMR%20Report.pdf)
- [Maternal Mortality program page — PA Department of Health](https://www.pa.gov/agencies/health/programs/maternal-health-and-infant-care/maternal-mortality)
- [Black Maternal Health in Pennsylvania — Network for Public Health Law, 2023](https://www.networkforphl.org/wp-content/uploads/2023/05/Black-Maternal-Health-in-Pennsylvania.pdf)
- [Shapiro Administration Reduces Emergency Waitlist for ID/A Services by 31 Percent — PA DHS](https://www.pa.gov/agencies/dhs/newsroom/shapiro-administration-reduces-emergency-waitlist-for-id-a-servi)
- [PA Waiting List Campaign](https://pawaitinglistcampaign.org/)
- [Stricter Pa. nursing home staffing regs just took effect — WHYY](https://whyy.org/articles/pa-new-nursing-home-staffing-requirements-in-effect/)
- [PA Set New Standards on Nursing Home Staffing: Are They Sufficient? — Penn LDI](https://ldi.upenn.edu/our-work/research-updates/pa-set-new-standards-on-nursing-home-staffing-are-they-sufficient/)

**Child welfare**
- [PA counties divert millions from foster kids' Social Security — Spotlight PA, 2025-04](https://www.spotlightpa.org/news/2025/04/foster-care-social-security-resolve-philly/)
- [How Spotlight PA and Resolve Philly reported 'For the Child' — Spotlight PA, 2025-04](https://www.spotlightpa.org/news/2025/04/behind-reporting-resolve-philly-foster-benefits/)
- [Bill would stop PA counties from taking foster kids' money — Spotlight PA, 2026-04](https://www.spotlightpa.org/news/2026/04/foster-care-social-security-legislation-resolve-philly-capitol/)
- [Lawmakers, Shapiro admin push to end practice — WESA, 2026-05-03](https://www.wesa.fm/politics-government/2026-05-03/foster-care-social-security-legislation-resolve-philly-capitol)
- [Philly removes neglected children from homes to keep them safe — Philadelphia Inquirer, 2025-04-09](https://www.inquirer.com/news/dhs-child-welfare-cua-failures-20250409.html)
- [Statement: Philly Child Welfare System is Failing Children — Children First](https://childrenfirstpa.org/news/statement_cw_reform_4-2025/)

**Education funding**
- [Pennsylvania's system of school funding is unconstitutional, judge rules — Chalkbeat, 2023-02-07](https://www.chalkbeat.org/philadelphia/2023/2/7/23590018/pennsylvania-school-funding-court-unconstitutional-equity-property-values-student-opportunities/)
- [Historic Victory in Fight for Fair Funding — Education Law Center](https://www.elc-pa.org/historic-victory-in-the-fight-for-fair-funding/)
- [School Funding Lawsuit — Public Interest Law Center](https://pubintlaw.org/cases-and-projects/school-funding-lawsuit/)
- [PA court rules school funding unconstitutional, but the hard work continues — Education Law Center](https://edlawcenter.org/pennsylvania-court-rules-state-school-funding-system-unconstitutional-but-the-hard-work-continues/)

**Budget**
- [Pa. lawmakers approve $50.1 billion budget, ending monthslong impasse — Philadelphia Inquirer, 2025-11-12](https://www.inquirer.com/politics/pennsylvania/pennsylvania-state-budget-deal-impasse-ends-20251112.html)
- [PA's budget is late for the 5th year in a row — Spotlight PA, 2026-07](https://www.spotlightpa.org/news/2026/07/budget-pennsylvania-late-deadline-june-30-2026-shapiro-capitol/)
- [With no end to budget impasse in sight — PA Capital-Star](https://penncapital-star.com/government-politics/with-no-end-to-budget-impasse-in-sight-pa-school-districts-and-counties-warn-of-program-cuts/)
- [Pa. adopts $50.8B budget — Spotlight PA, 2026-07](https://www.spotlightpa.org/news/2026/07/pennsylvania-budget-education-skill-games-data-centers-capitol/)
- [PA budget 2026: Shapiro pitches more money for poor schools — Spotlight PA, 2026-02](https://www.spotlightpa.org/news/2026/02/josh-shapiro-budget-address-school-marijuana-minimum-wage-capitol/)
- [Pennsylvania administrators warn of budget impasse's consequences on schools — WHYY](https://whyy.org/articles/pennsylvania-budget-impasse-education/)

**Minimum wage and labor**
- [Minimum Wage in the 2026-27 Proposed Pennsylvania Budget — PA Budget and Policy Center](https://pennpolicy.org/wp-content/uploads/2026/02/2026_BudgetOverview_MinWagev3.pdf)
- [PA House passes minimum wage bill with tiered county increases — Spotlight PA, 2025-06](https://www.spotlightpa.org/news/2025/06/minimum-wage-15-pennsylvania-house-senate-philadelphia/)
- [In his first executive order, Shapiro removes degree requirement — PA Capital-Star, 2023-01-18](https://penncapital-star.com/government-politics/in-his-first-executive-order-shapiro-removes-degree-requirement-for-thousands-of-state-jobs/)
- [Increased Paid Parental Leave, New Work-Life Benefits — PA Office of Administration](https://www.pa.gov/agencies/oa/newsroom/shapiro-administration-announces-increased-paid-parental-leave-new-work-life-benefits-for-commonwealth-employees)
- [Pennsylvania Focuses on Attracting, Keeping Workers — Governing](https://www.governing.com/workforce/pennsylvania-focuses-on-attracting-keeping-workers)
- [Jobless in Pa. livid over new unemployment system errors — Spotlight PA, 2021-06](https://www.spotlightpa.org/news/2021/06/pa-unemployment-new-system-errors-issues/)
- [Part of Pa.'s persistent Unemployment Compensation backlog? Not enough workers — WESA, 2022-03-28](https://www.wesa.fm/politics-government/2022-03-28/part-of-pennsylvanias-persistent-unemployment-compensation-backlog-not-enough-workers)
- [L&I Announces Continued Investments to Improve UC System — PA DLI](https://www.pa.gov/agencies/dli/newsroom/li-announces-continued-investments-to-improve-unemployment-compensation-system-adds-capacity-to-better-serve-pennsylvanians-)

**Civil rights**
- [PA Human Relations Commission announces new LGBTQ+ nondiscrimination regulations — PA Capital-Star](https://penncapital-star.com/civil-rights-social-justice/pa-human-relations-commission-announces-new-lgbtq-nondiscrimination-regulations/)
- [Suit claims PHRC's LGBTQ+ protections are unconstitutional — PA Capital-Star](https://penncapital-star.com/civil-rights-social-justice/suit-claims-pa-human-relations-commissions-lgbtq-protections-are-unconstitutional/)
- [Following an investigation and resignations, what's next for Pa.'s Human Relations Commission? — WITF, 2026-04-27](https://www.witf.org/2026/04/27/following-an-investigation-and-resignations-whats-next-for-pa-s-human-relations-commission/)
- [PHRC releases 2024-2025 Annual Report — PHRC](https://www.pa.gov/agencies/phrc/phrc-news---information/newsroom/pennsylvania-human-relations-commission-releases-2024-2025-annua)
- [LGBT rights in Pennsylvania — Wikipedia](https://en.wikipedia.org/wiki/LGBT_rights_in_Pennsylvania)

**Criminal justice and corrections**
- [PA passes a raft of criminal justice bills — Spotlight PA, 2023-12](https://www.spotlightpa.org/news/2023/12/pennsylvania-criminal-justice-clean-slate-probation-legislature-crime-septa/)
- [Governor Shapiro Ceremonial Bill Signing of Clean Slate Legislation — PA Governor's Office](https://www.pa.gov/governor/newsroom/2024-press-releases/governor-shapiro-hosts-legislative-leaders-and-reform-advocates-0)
- [2024 Annual Report, PSP Traffic Stop Study — PA State Police](https://www.pa.gov/content/dam/copapwp-pagov/en/psp/documents/cdr/cdr_2024.pdf)
- [Report: PA trooper traffic stops similar regardless of driver's race — Spotlight PA, 2024-08](https://www.spotlightpa.org/news/2024/08/pennsylvania-state-police-traffic-stop-analysis-few-racial-differences/)
- [Police stop race data to be exempt from PA's public records law — Spotlight PA, 2024-05](https://www.spotlightpa.org/news/2024/05/pennsylvania-state-police-departments-race-data-traffic-stops-public-information-law/)
- [Death rate rising in PA prisons and jails — Pennsylvania Prison Society](https://www.prisonsociety.org/updates/death-rate-rising-in-pa-prisons-and-jails)
- [Class Action Suit Seeks to End Solitary Confinement — PA Legal Aid Network](https://palegalaid.net/news/class-action-suit-seeks-end-solitary-confinement-hundreds-pa-department-corrections)
- [Ending Solitary Confinement in PA — Abolitionist Law Center](https://abolitionistlawcenter.org/ending-solitary-confinement-in-pa/)

**Environment**
- [Office of Environmental Justice — PA DEP](https://www.pa.gov/agencies/dep/public-participation/office-of-environmental-justice)
- [Environmental Justice Policy — PA DEP](https://www.pa.gov/agencies/dep/public-participation/office-of-environmental-justice/ej-policy)
- [PennEnviroScreen — PA DEP](https://www.pa.gov/agencies/dep/public-participation/office-of-environmental-justice/pa-environmental-justice-areas)
- [Pa.'s new environmental justice policy goes into effect — WHYY](https://whyy.org/articles/pennsylvania-expanded-environmental-justice-policy-in-effect-september-2023/)

**Opioids**
- [New website tracks how Pennsylvania's $2.2B in opioid settlement funds is being spent — Temple PHLR, 2025-09](https://phlr.temple.edu/news/2025/09/new-website-tracks-how-pennsylvanias-22b-opioid-settlement-funds-being-spent)
- [PA Opioid Settlement Data](https://www.paopioidsettlementdata.org/)
- [Pennsylvania Opioid Misuse and Addiction Abatement Trust](https://www.paopioidtrust.org/)
- [Pennsylvania opioid crisis: your questions answered — Spotlight PA, 2025-05](https://www.spotlightpa.org/news/2025/05/pennsylvania-drug-crisis-help-resources-settlement/)

**Oversight and transparency**
- [Pennsylvania Department of the Auditor General](https://www.paauditor.gov/)
- [Auditor General DeFoor's Performance Audit of PennHOMES Program — PA Auditor General](https://www.paauditor.gov/auditor-general-defoors-performance-audit-of-pennhomes-program-finds-inconsistent-record-keeping-makes-24-recommendations-for-improvement/)
- [Watchdog investigates PA's senior protection agency — Spotlight PA, 2025-06](https://www.spotlightpa.org/news/2025/06/pennsylvania-elder-abuse-protection-system-audit-investigation/)
- [Local governments, lawmakers and public advocates call for Right-to-Know update — WESA, 2026-03-29](https://www.wesa.fm/politics-government/2026-03-29/pa-public-records-transparency-right-to-know)
- [Pennsylvania's Right-to-Know Law 101 — ACLU of Pennsylvania](https://www.aclupa.org/pennsylvanias-right-know-law-101/)

**Veterans homes**
- [In aftermath of report on COVID-19 deaths at Pennsylvania veterans center — The Center Square](https://www.thecentersquare.com/national/article_e44f4b4c-51d7-11eb-b4ae-1f3b1750f8b8.html)
- ['Watching people die': Pa. vets' nursing home failed residents — Philadelphia Inquirer, 2020-07-21](https://www.inquirer.com/health/coronavirus/coronavirus-covid-19-southeastern-veterans-center-20200721.html)
- [Southeastern Veterans' Center cited for infection-control failures — Washington Post, 2020-07-21](https://www.washingtonpost.com/business/2020/07/21/inspection-finds-widespread-infection-control-failures-facility-that-dosed-veterans-with-hydroxychloroquine/)

**Federal-state litigation**
- [Gov. Josh Shapiro sues Trump administration over federal funding freeze — Philadelphia Inquirer, 2025-02-13](https://www.inquirer.com/news/pennsylvania/governor-shapiro-federal-funding-freeze-lawsuit-20250213.html)
- [Gov. Shapiro sues Trump administration over suspension of SNAP benefits — ABC27](https://www.abc27.com/pennsylvania-politics/gov-shapiro-sues-trump-administration-over-suspension-of-snap-benefits/)
- [Gov Shapiro Challenges Trump Admin's Cuts to Funding — PA Governor's Office](https://www.pa.gov/governor/newsroom/2025-press-releases/gov-shapiro-challenges-trump-admin-s-cuts-to-funding-that-keeps-)
- [Shapiro Administration Issues Full November 2025 SNAP Benefits — PA DHS](https://www.pa.gov/agencies/dhs/newsroom/shapiro-administration-issues-full-november-2025-snap-benefits)
- [What to know as Pennsylvania braces for loss of SNAP benefits — City & State PA, 2025-10](https://www.cityandstatepa.com/politics/2025/10/what-know-pennsylvania-braces-loss-snap-benefits/409241/)

**Historical harm**
- [About Pennhurst State School and Hospital — Pennhurst Memorial and Preservation Alliance](http://www.preservepennhurst.org/default.aspx?pg=36)
- [Pennhurst State School and Hospital — Encyclopedia of Greater Philadelphia](https://philadelphiaencyclopedia.org/essays/pennhurst-state-school-and-hospital/)
- [Eugenics — Encyclopedia of Greater Philadelphia](https://philadelphiaencyclopedia.org/essays/eugenics/)

---

*This assessment is based on publicly available information and does not constitute a formal Compassion Benchmark Certified Assessment. For a comprehensive, assessor-led evaluation, visit compassionbenchmark.com/certified-assessments.*
