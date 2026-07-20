---
entity: "New Jersey"
type: "State"
sector: "Government"
date: "2026-07-19"
composite_score: 60.6
band: "Established"
scores:
  AWR: 3.8
  EMP: 3.4
  ACT: 3.4
  EQU: 3.6
  BND: 2.6
  ACC: 3.4
  SYS: 4.0
  INT: 3.2
published_index: null
published_rank: null
published_composite: null
published_band: null
---

# Compassion Benchmark Assessment: New Jersey

**Entity type:** State
**Sector/Domain:** Government (US state government)
**Assessment date:** 2026-07-19
**Composite score:** 60.6/100
**Band:** Established

This is a **first baseline**. New Jersey does not appear in the published Compassion Benchmark US States index. No prior composite exists, so there is no score change to report.

## Score Summary

| Dimension | Code | Score (raw 1-5) | Scaled (0-100) | Band |
|-----------|------|-----------------|----------------|------|
| Awareness | AWR | 3.8 | 70.0 | Established |
| Empathy | EMP | 3.4 | 60.0 | Functional |
| Action | ACT | 3.4 | 60.0 | Functional |
| Equity | EQU | 3.6 | 65.0 | Established |
| Boundaries | BND | 2.6 | 40.0 | Developing |
| Accountability | ACC | 3.4 | 60.0 | Functional |
| Systemic Thinking | SYS | 4.0 | 75.0 | Established |
| Integrity | INT | 3.2 | 55.0 | Functional |
| **Composite** | — | — | **60.6** | **Established** |

Composite verified with `computeCompositeFromDimensions` in `site/scripts/lib/scoring.mjs`: base composite 60.625, standard deviation 0.393 (consistency multiplier 1.0), 7 of 8 dimensions below 4.0 so the weakness factor is 0 and the integration premium is 0. Final composite 60.6.

### Band warning: this result sits on a knife edge

New Jersey scores 60.6. The line between Functional and Established is 60.0. Moving any single subdimension down by one point drops New Jersey back into Functional. Two verified sensitivity cases, both run through the canonical formula:

- Lower S3 Interconnection Awareness from 4 to 3: composite 60.0, band Functional.
- Lower E2 Perspective-Taking from 4 to 3: composite 60.0, band Functional.
- Raise A5 Anticipatory Awareness from 4 to 5: composite 61.2, band Established.

Treat the Established label as provisional. The score itself, 60.6, is the reliable figure. New Jersey is best described as sitting at the top of the Functional range rather than as a settled Established performer.

## Dimension Details

### AWR: Awareness (3.8/5, scaled 70.0/100)

| Subdimension | Score | Evidence | Source |
|-------------|-------|----------|--------|
| A1 Suffering Detection | 4/5 | The New Jersey Department of Health published updated maternal health data on 2026-01-16 covering 2019-2023, broken out by race and ethnicity. The Attorney General runs a public ARRIVE Together dashboard for mental health crisis response. Multiple formal channels with regular review. | [NJ DOH, 2026-01-16](https://www.nj.gov/health/news/2026/approved/20260116c.shtml); [NJ OAG ARRIVE dashboard](https://www.njoag.gov/attorney-general-platkin-announces-the-launch-of-the-new-arrive-together-dashboard/) |
| A2 Contextual Sensitivity | 4/5 | NJ FamilyCare covers all children to age 19 regardless of immigration status. Nurture NJ targets maternal and infant outcomes for Black and Latina women specifically. Differentiated processes for three or more groups. | [New Jersey Monitor, 2023-01-19](https://newjerseymonitor.com/2023/01/19/n-j-expands-health-care-coverage-to-all-children-regardless-of-immigration-status/); [Nurture NJ](https://nurturenj.nj.gov/) |
| A3 Blind Spot Mitigation | 4/5 | The Office of the State Comptroller found on 2026-01-14 that about 60 police and fire pension members with misconduct records were drawing benefits, and 21 had never had a required honorable-service review. The state's own maternal review found 27.6% of pregnancy-related deaths involved discrimination or racism. | [NJ Comptroller, 2026-01-14](https://www.nj.gov/comptroller/reports/2025/approved/20260114.shtml); [NJ DOH, 2026-01-16](https://www.nj.gov/health/news/2026/approved/20260116c.shtml) |
| A4 Signal Amplification | 3/5 | The Environmental Justice Law gives overburdened communities a structural role in permit decisions. But Disability Rights New Jersey had to sue in federal court to surface conditions in four state psychiatric hospitals, which the suit calls closer to "psychiatric incarceration" than care. | [Earthjustice, 2026-01-05](https://earthjustice.org/press/2026/victory-nj-appellate-court-affirms-legality-of-environmental-justice-law); [Disability Rights NJ](https://disabilityrightsnj.org/news/federal-lawsuit-alleges-harrowing-conditions-abuse-in-new-jersey-psychiatric-hospitals/) |
| A5 Anticipatory Awareness | 4/5 | New Jersey's Environmental Justice Law requires a harm assessment before permits in overburdened communities and lets the state deny permits outright. The Appellate Division upheld the rules on 2026-01-05 and rejected economic benefit as a tradeoff for pollution. Scored 4 rather than 5 because the requirement covers permits, not all major state decisions. | [New Jersey Monitor, 2026-01-06](https://newjerseymonitor.com/2026/01/06/environmentalists-court-ruling-regulations/) |

### EMP: Empathy (3.4/5, scaled 60.0/100)

| Subdimension | Score | Evidence | Source |
|-------------|-------|----------|--------|
| E1 Affective Resonance | 3/5 | ARRIVE Together records more than 6,500 crisis interactions with no serious injuries and no uses of force. That is strong. But it is offset by litigation describing four state psychiatric hospitals as punitive, and by a shelter system turning people away. Training exists and some parts of the system do this well, inconsistently. | [NJ OAG, 2025-02](https://www.njoag.gov/attorney-general-platkin-announces-that-new-jerseys-top-15-most-populous-municipalities-are-participating-in-the-arrive-together-alternative-response-program/) |
| E2 Perspective-Taking | 4/5 | The Sherrill-Caldwell transition ran action teams spanning labor, veterans, health care, environment and education, publishing final reports on 2026-02-18. Nurture NJ embeds affected women in strategic planning. | [NJ Governor, 2026-02-18](https://www.nj.gov/governor/news/2026/approved/20260218c.shtml) |
| E3 Non-Judgment | 3/5 | New Jersey has the worst Black-white youth incarceration disparity in the United States. A Black young person is 18 times more likely to be locked up than a white one. The state collects and publishes the disparity data, but the outcome remains the nation's worst. | [NJ Institute for Social Justice](https://njisj.org/reports/youth-incarceration-disaster/); [The Sentencing Project](https://www.sentencingproject.org/fact-sheet/black-disparities-in-youth-incarceration/) |
| E4 Validation | 3/5 | The US Justice Department, not the state, established that systemic failures at the Menlo Park and Paramus veterans homes let COVID-19 spread "virtually unchecked." The state's published death counts were lower than the real toll. | [US DOJ findings, 2023-09-07](https://content.govdelivery.com/attachments/USDOJUSAO/2023/09/07/file_attachments/2607463/NJVeteransHomesFindings.Report.pdf); [New Jersey Monitor, 2024-10-02](https://newjerseymonitor.com/2024/10/02/oversight-in-store-for-two-veterans-homes-where-hundreds-died-in-pandemic/) |
| E5 Cultural Empathy | 4/5 | The state publishes that Black women die of pregnancy-related causes at 7.6 times the white rate and names racism as a cause. Cover All Kids was designed around immigrant families, including explicit public-charge protection. | [NJ DOH, 2026-01-16](https://www.nj.gov/health/news/2026/approved/20260116c.shtml); [Cover All Kids](https://nj.gov/coverallkids/faqs/) |

### ACT: Action (3.4/5, scaled 60.0/100)

| Subdimension | Score | Evidence | Source |
|-------------|-------|----------|--------|
| AC1 Responsiveness | 4/5 | Governor Sherrill declared a state of emergency on utility costs on her first day, 2026-01-20, and ordered the Board of Public Utilities to issue the first wave of bill credits by 2026-07-01. Dated, deadline-bound response. | [NJ Governor, 2026-01-20](https://www.nj.gov/governor/news/2026/20260120a.shtml); [New Jersey Monitor, 2026-01-20](https://newjerseymonitor.com/2026/01/20/governor-sherrill-order-electricity/) |
| AC2 Proportionality | 3/5 | The FY2027 budget proposes cutting diversions from the Affordable Housing Trust Fund, which is an admission that money dedicated to the highest-need group was previously spent elsewhere. Meanwhile the 2025 count found 13,748 people homeless. | [NJ Governor, 2026-04-30](https://www.nj.gov/governor/news/2026/20260430b.shtml); [Monarch Housing PIT report, 2025-07](https://monarchhousing.org/wp-content/uploads/2025/07/PIT-Report-2025-New-Jersey.pdf) |
| AC3 Efficacy | 4/5 | Overdose deaths fell across every racial and ethnic group as the state authorized harm reduction centers in all 21 counties. The Education Commissioner said in April 2026 that the school funding formula must change after years of destabilizing swings, which is a program modified because of outcome evidence. | [NJ DOH, 2025-03-26](https://www.nj.gov/health/news/2025/approved/20250326a.shtml); [New Jersey Monitor, 2026-04-15](https://newjerseymonitor.com/2026/04/15/nj-school-funding-formula/) |
| AC4 Resource Mobilization | 3/5 | The FY2027 budget puts a record $12.4 billion into K-12 schools. But homelessness has risen for several years running, and unsheltered homelessness is up 103% since 2022. Resources are large but the largest gap is still widening. | [NJ Governor, 2026-03-10](https://www.nj.gov/governor/news/2026/20260310b.shtml); [New Jersey Monitor, 2025-07-29](https://newjerseymonitor.com/2025/07/29/homelessness-up-again-in-new-jersey-as-federal-cuts-loom/) |
| AC5 Follow-Through | 3/5 | New Jersey exited 20 years of federal child welfare oversight in October 2023 with a successor oversight body, which is genuine persistence. But Edna Mahan took six years from Murphy's 2021 closure order to a groundbreaking in October 2025, with full completion set for 2029. | [CSSP, 2023-10-30](https://cssp.org/new-jersey-child-welfare-system-ends-federal-court-oversight/); [New Jersey Monitor, 2025-10-15](https://newjerseymonitor.com/2025/10/15/nj-new-womens-prison/) |

### EQU: Equity (3.6/5, scaled 65.0/100)

| Subdimension | Score | Evidence | Source |
|-------------|-------|----------|--------|
| EQ1 Universality | 4/5 | Cover All Kids extends NJ FamilyCare to every income-eligible child under 19 regardless of immigration status. Coverage gains are tracked and reported. | [Cover All Kids](https://nj.gov/coverallkids/faqs/); [Milbank Memorial Fund, 2025-09](https://www.milbank.org/2025/09/covering-uninsured-children-state-solutions-for-immigrant-children/) |
| EQ2 Priority for Vulnerable | 4/5 | The Department of Community Affairs published binding fourth-round affordable housing obligations for every municipality covering 2025-2035. School aid flows toward historically underfunded districts, though 167 districts lose aid under the first FY2027 proposal. | [NJ DCA methodology, 2024-10-20](https://www.nj.gov/dca/dlps/pdf/FourthRoundCalculation_Methodology.pdf); [NJ 101.5, 2026-03](https://nj1015.com/new-jersey-school-funding-2027/) |
| EQ3 Bias Awareness | 3/5 | ARRIVE Together eliminated racial disparities in crisis-response outcomes, a verified correction. Against that, the state has litigated the Latino Action Network school segregation case for eight years; mediation failed in February 2025. | [New Jersey Monitor, 2025-04-21](https://newjerseymonitor.com/2025/04/21/after-failed-mediation-talks-school-desegregation-case-could-return-to-court/); [NJ OAG ARRIVE](https://www.njoag.gov/programs/arrive-together/) |
| EQ4 Access Design | 4/5 | The Health Department authorized 54 harm reduction centers with at least one in each of the 21 counties, and Naloxone365 gives free anonymous naloxone at more than 700 pharmacies to anyone 14 or older. Multiple concrete barriers removed. | [NJ DOH, 2025-03-26](https://www.nj.gov/health/news/2025/approved/20250326a.shtml); [New Jersey Monitor, 2026-03-03](https://newjerseymonitor.com/2026/03/03/nj-harm-reduction-addiction/) |
| EQ5 Historical Harm Acknowledgment | 3/5 | Murphy ordered Edna Mahan closed in 2021 after officers assaulted incarcerated women, and a $310 million replacement is under construction. But on school segregation the state is defending itself rather than acknowledging, after a 2023 trial ruling found "marked and persistent racial imbalance." | [New Jersey Monitor, 2025-10-15](https://newjerseymonitor.com/2025/10/15/nj-new-womens-prison/); [Latino Action Network v. New Jersey](https://en.wikipedia.org/wiki/Latino_Action_Network_v._New_Jersey) |

### BND: Boundaries (2.6/5, scaled 40.0/100)

| Subdimension | Score | Evidence | Source |
|-------------|-------|----------|--------|
| B1 Self-Sustainability | 3/5 | The state settled a four-year contract with its largest union giving 3.5% annual raises, the biggest in over a decade. Against that, a whistleblower suit alleges patient deaths at Greystone Park during stalled investigations. | [New Jersey Monitor](https://newjerseymonitor.com/briefs/new-jersey-state-workers-union-reach-deal-for-largest-wage-hikes-in-a-decade/); [Patch, Morristown](https://patch.com/new-jersey/morristown/patients-died-morris-facility-official-delayed-probe-lawsuit) |
| B2 Autonomy Preservation | 3/5 | Corrections added body cameras, trauma-informed training and expanded vocational and educational programs after Edna Mahan. ANCHOR, Senior Freeze and Stay NJ deliver $4.2 billion as cash relief people control themselves. | [New Jersey Monitor](https://newjerseymonitor.com/briefs/judge-federal-oversight-nj-womens-prison/); [NJ Governor, 2026-03-10](https://www.nj.gov/governor/news/2026/20260310b.shtml) |
| B3 Scope Clarity | 2/5 | The state's own Education Commissioner said the funding formula needs to be "more predictable and transparent" after years of aid swings that forced school closures. Districts discovered the limits of state support only after committing to budgets. | [New Jersey Monitor, 2026-04-15](https://newjerseymonitor.com/2026/04/15/nj-school-funding-formula/) |
| B4 Refusal Ethics | 2/5 | The shelter system runs above 90% capacity daily and cannot take the households arriving. Unsheltered homelessness rose 103% between 2022 and 2025. People are turned away without a concrete alternative. | [Monarch Housing PIT report, 2025-07](https://monarchhousing.org/wp-content/uploads/2025/07/PIT-Report-2025-New-Jersey.pdf) |
| B5 Consent Orientation | 3/5 | Cover All Kids states plainly that enrolling will not count as a public charge against a green card application. Harm reduction centers are explicitly non-stigmatizing and anonymous. Genuine explanation, not independently verified. | [Cover All Kids](https://nj.gov/coverallkids/faqs/); [NJ DOH, 2025-03-26](https://www.nj.gov/health/news/2025/approved/20250326a.shtml) |

### ACC: Accountability (3.4/5, scaled 60.0/100)

| Subdimension | Score | Evidence | Source |
|-------------|-------|----------|--------|
| AB1 Harm Acknowledgment | 3/5 | Murphy ordered Edna Mahan closed in 2021 before any court compelled it, which is acknowledgment ahead of legal obligation. But at the veterans homes the acknowledgment came only after federal investigators established the failures. | [New Jersey Monitor, 2025-10-15](https://newjerseymonitor.com/2025/10/15/nj-new-womens-prison/); [US DOJ, 2023-09-07](https://content.govdelivery.com/attachments/USDOJUSAO/2023/09/07/file_attachments/2607463/NJVeteransHomesFindings.Report.pdf) |
| AB2 Correction Willingness | 4/5 | After the Comptroller's January 2026 pension report, nearly all 21 flagged members received the honorable-service reviews they had been denied. The Senate President withdrew his bill to strip the Comptroller's investigative powers after public objection. | [NJ Comptroller, 2026-01-14](https://www.nj.gov/comptroller/reports/2025/approved/20260114.shtml); [New Jersey Monitor](https://newjerseymonitor.com/briefs/nj-senator-bill-state-comptroller/) |
| AB3 Transparency | 3/5 | The Comptroller publishes unflattering findings about the state. But Murphy signed S2930 on 2024-06-05, narrowing the Open Public Records Act: it removed the clause requiring the law be read in favor of public access and limited attorney-fee recovery to unreasonable denial, bad faith, or knowing and willful violation. A documented regression. | [Epstein Becker Green, 2024-06](https://www.healthlawadvisor.com/opra-reform-bill-signed-by-gov-phil-murphy-has-potential-to-severely-limit-nj-public-record-transparency); [NJ Comptroller, 2026-01-14](https://www.nj.gov/comptroller/reports/2025/approved/20260114.shtml) |
| AB4 Systemic Learning | 4/5 | A federal judge terminated the 2021 Edna Mahan consent decree after the state fully complied and a monitor agreed. Child welfare exited federal oversight with a standing successor review committee. Three or more practices changed because of failure analysis. | [New Jersey Monitor](https://newjerseymonitor.com/briefs/judge-federal-oversight-nj-womens-prison/); [CSSP, 2023-10-30](https://cssp.org/new-jersey-child-welfare-system-ends-federal-court-oversight/) |
| AB5 Reparative Action | 3/5 | New Jersey paid $53 million in 2021 to settle claims tied to more than 100 veterans home deaths. Meaningful, but the repair was negotiated in litigation rather than co-designed with families. | [New Jersey Monitor, 2024-10-02](https://newjerseymonitor.com/2024/10/02/oversight-in-store-for-two-veterans-homes-where-hundreds-died-in-pandemic/) |

### SYS: Systemic Thinking (4.0/5, scaled 75.0/100)

| Subdimension | Score | Evidence | Source |
|-------------|-------|----------|--------|
| S1 Root Cause Orientation | 4/5 | The Environmental Justice Law attacks the source of pollution burden rather than treating illness afterward. Harm reduction centers served over 5,800 people in 2024, up 122% in two years, and overdose deaths fell. | [Earthjustice, 2026-01-05](https://earthjustice.org/press/2026/victory-nj-appellate-court-affirms-legality-of-environmental-justice-law); [NJ DOH, 2025-03-26](https://www.nj.gov/health/news/2025/approved/20250326a.shtml) |
| S2 Long-Term Impact | 4/5 | Affordable housing obligations are set on a ten-year horizon covering 2025 to 2035, with published methodology. Nurture NJ operates on a multi-year strategic plan with measured outcomes. | [NJ DCA, 2024-10-20](https://www.nj.gov/dca/dlps/pdf/FourthRoundCalculation_Methodology.pdf); [Nurture NJ](https://nurturenj.nj.gov/) |
| S3 Interconnection Awareness | 4/5 | ARRIVE Together is jointly planned across the Attorney General's office, NJ Transit, municipal police and mental health screeners, with outcomes tracked publicly. The January 2026 energy orders link bill relief to generation policy. | [NJ OAG Newark expansion](https://www.njoag.gov/ag-platkin-announces-expansion-of-arrive-together-to-the-city-of-newark-in-partnership-with-nj-transit-and-the-newark-department-of-public-safety/); [NJ Governor, 2026-01-20](https://www.nj.gov/governor/news/2026/20260120a.shtml) |
| S4 Structural Critique | 4/5 | New Jersey defended the Environmental Justice rules through sustained industry litigation and won on 2026-01-05, holding a position directly against short-term economic interest. It also became the 10th state to bar local ICE detention contracts. | [New Jersey Monitor, 2026-01-06](https://newjerseymonitor.com/2026/01/06/environmentalists-court-ruling-regulations/); [Bolts](https://boltsmag.org/new-jersey-immigrant-protections-codified-into-law/) |
| S5 Coalitional Compassion | 4/5 | ARRIVE Together now covers all 21 counties and more than 60% of New Jersey's 9.5 million residents, built through funding and joint operation with local agencies, and studied nationally as a model. | [NJ OAG ARRIVE](https://www.njoag.gov/programs/arrive-together/); [Brookings](https://www.brookings.edu/articles/new-jersey-arrive-together-program-could-reform-policing-as-we-know-it/) |

### INT: Integrity (3.2/5, scaled 55.0/100)

| Subdimension | Score | Evidence | Source |
|-------------|-------|----------|--------|
| I1 Consistency Under Pressure | 4/5 | New Jersey defended the Environmental Justice rules through multi-year industry litigation and prevailed. It settled the May 2025 NJ Transit engineers strike with a wage increase and no fare increase, absorbing the cost rather than passing it to riders. | [Earthjustice, 2026-01-05](https://earthjustice.org/press/2026/victory-nj-appellate-court-affirms-legality-of-environmental-justice-law); [NJ Transit, 2025-05-18](https://www.njtransit.com/press-releases/governor-murphy-nj-transit-president-ceo-kris-kolluri-announce-tentative-agreement) |
| I2 Non-Performance | 4/5 | The state published that 27.6% of pregnancy-related deaths involved discrimination and racism, which is a publicly unflattering self-disclosure. The Comptroller published that the state's own pension board reached decisions that "appeared illogical or inconsistent." | [NJ DOH, 2026-01-16](https://www.nj.gov/health/news/2026/approved/20260116c.shtml); [NJ Comptroller, 2026-01-14](https://www.nj.gov/comptroller/reports/2025/approved/20260114.shtml) |
| I3 Internal Consistency | 3/5 | The largest state union secured 3.5% annual raises for four years. But a whistleblower suit alleges the state retaliated against staff who reported unsafe conditions and delayed investigations into patient deaths. | [New Jersey Monitor](https://newjerseymonitor.com/briefs/new-jersey-state-workers-union-reach-deal-for-largest-wage-hikes-in-a-decade/); [Patch, Morristown](https://patch.com/new-jersey/morristown/patients-died-morris-facility-official-delayed-probe-lawsuit) |
| I4 Values Alignment | 2/5 | The OPRA rollback of June 2024 contradicts the state's stated transparency commitments and was signed without a values reckoning. On his final day, 2026-01-20, Murphy left two of the three immigrant protection bills unsigned after the Legislature passed them. | [NJ Association of Counties, 2024-06-05](https://njac.org/murphy-signs-controversial-opra-overhaul-into-law/); [NJ Alliance for Immigrant Justice](https://www.njaij.org/immigrant_protections_package_passes_2026) |
| I5 Resilience of Care | 3/5 | The Murphy-to-Sherrill handover in January 2026 did not degrade the core compassion infrastructure. Environmental justice rules, ARRIVE Together, Cover All Kids and the housing obligations all survived. But the new administration is only six months old, so durability is not yet tested. | [NJ Governor, 2026-04-30](https://www.nj.gov/governor/news/2026/20260430b.shtml); [NJ Governor, 2026-02-18](https://www.nj.gov/governor/news/2026/approved/20260218c.shtml) |

## Published Index Comparison

New Jersey does not currently appear in any published Compassion Benchmark index. The published `us-states.json` file contains only 21 of 51 jurisdictions; ranks 9 through 38 were lost in the original extraction from legacy HTML and the surviving entries were renumbered contiguously. The displayed rank column is therefore not a national rank.

**Recommendation:** add New Jersey to the `us-states` index as a new entity at composite 60.6, with `rank` set to null until the index is rebuilt with all 51 jurisdictions.

## Key Findings

- **New Jersey writes strong law and then delivers it slowly.** Murphy ordered the Edna Mahan women's prison closed in 2021 after officers assaulted incarcerated women. The $310 million replacement broke ground in October 2025 and will not be fully complete until 2029. That is a six-to-eight year gap between the promise and the building.

- **The state made its own transparency worse while its watchdog was working well.** Murphy signed S2930 on June 5, 2024. It deleted the clause requiring the Open Public Records Act to be read in favor of public access, narrowed when requesters can recover legal fees, and stretched agency deadlines to 14 and 21 business days. In the same period the Office of the State Comptroller published findings the state did not want, including a January 14, 2026 report that about 60 police and fire pension members with misconduct records were drawing benefits.

- **New Jersey has the worst Black-white youth incarceration gap in the country.** A Black young person in New Jersey is 18 times more likely to be locked up than a white one. The state measures this openly. It has not closed it. It has also spent eight years defending itself in the Latino Action Network school segregation case; mediation collapsed in February 2025 and the state Supreme Court declined in May 2026 to fast-track it.

- **The Environmental Justice Law is the single strongest thing New Jersey has built.** Signed September 18, 2020, it was the first US law requiring the state to deny pollution permits that would disproportionately burden overburdened communities. The Appellate Division upheld it on January 5, 2026 and specifically refused to let economic benefit outweigh community health.

- **The January 2026 change of governor did not break anything.** Mikie Sherrill took office on January 20, 2026 and declared a state of emergency on utility costs on day one, ordering bill credits by July 1. Environmental justice rules, ARRIVE Together, Cover All Kids and the housing obligations all carried over intact. Six months is too short to call this durable, but nothing degraded.

## Strongest Dimensions

- **Systemic Thinking (4.0/5, 75/100)** — the only dimension at or above 4.0. New Jersey attacks causes, not just symptoms: environmental justice permitting, ten-year binding housing obligations, harm reduction in all 21 counties, and ARRIVE Together reaching more than 60% of the state's 9.5 million residents.
- **Awareness (3.8/5, 70/100)** — the state finds problems it was not forced to find. Its own maternal review named racism as a contributing cause in 27.6% of pregnancy-related deaths.
- **Equity (3.6/5, 65/100)** — Cover All Kids and the fourth-round housing obligations are genuine universal-access design.

## Weakest Dimensions

- **Boundaries (2.6/5, 40/100)** — the clearest failure. The shelter system runs above 90% capacity every day and cannot take the households arriving, and unsheltered homelessness rose 103% between 2022 and 2025. People are refused help without an alternative. School districts also discovered the limits of state aid only after budgeting on it.
- **Integrity (3.2/5, 55/100)** — pulled down by Values Alignment at 2 of 5. The OPRA rollback and the two unsigned immigrant protection bills both cut against New Jersey's stated commitments.

## Evidence Gaps

- No public data was found on staff turnover or burnout rates inside the New Jersey Department of Corrections or the state psychiatric hospital system, so B1 Self-Sustainability rests on partial evidence and is marked medium confidence.
- No independent community testimony was found confirming or denying that ARRIVE Together participants felt cared for, only outcome statistics. E1 was scored conservatively at 3 as a result.
- The Disability Rights New Jersey psychiatric hospital lawsuit is not yet decided in court. The allegations are treated as an unresolved signal, not as established fact, and were not used to drive any score below 3 on their own.
- The Sherrill administration is six months old. I5 Resilience of Care is capped at 3 because one partial term is not a tested record.

## Recommended Next Steps

New Jersey lands at 60.6, at the boundary between Functional and Established. Consider [Advisory Support](/advisory) to translate these benchmark findings into strategic action, focusing on the Boundaries dimension, where the shelter capacity gap is the single largest drag on the composite.

---

*This assessment is based on publicly available information and does not constitute a formal Compassion Benchmark Certified Assessment. For a comprehensive, assessor-led evaluation, visit compassionbenchmark.com/certified-assessments.*
