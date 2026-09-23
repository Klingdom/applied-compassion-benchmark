---
entity: "Amsterdam"
type: "City"
sector: "Government — municipal"
date: "2026-09-22"
composite_score: 72
band: "Established"
scores:
  AWR: 4.4
  EMP: 3.4
  ACT: 3.8
  EQU: 3.4
  BND: 3
  ACC: 4.2
  SYS: 4.2
  INT: 4
published_index: "global-cities"
published_rank: 8
published_composite: 94.4
published_band: "Exemplary"
published_dimensions:
  AWR: 4.5
  EMP: 4.5
  ACT: 4.5
  EQU: 4
  BND: 4.5
  ACC: 4.5
  SYS: 4.5
  INT: 4
assessed_composite: 72
score_delta: -22.4
band_change: true
filing_trigger_met: true
outcome: "first formal evidence-based baseline; change proposal filed"
assessment_type: "full 40-subdimension first baseline"
recommendation: "downgrade"
change_proposal: true
confidence: "medium"
subdim_sidecar: true
methodology_version: "v1.2"
source: "priority"
scan_file: "research/scans/2026-09-22.json"
watch_flag: "Upward watch. Re-test AC1, AC4, EQ4 and E1 if the Dutch national government grants any part of the G4 mayors’ 100 million euro annual request, and re-test EQ3 and B5 when the successor to the suspended Smart Check algorithm is specified. A funded G4 response would raise Action and Equity."
calibration_flag: "The published 94.4 ranked Amsterdam 8th of 250 global cities in the Exemplary band, which the methodology defines as \"practices independently verified, consistent, and sustained.\" Amsterdam has genuinely exceptional Accountability and Systemic Thinking, but its own independent ombudsman and its own mayor document consistency failures. Coordinator may wish to review whether other never-assessed Exemplary-band global cities carry the same overstatement."
---

# Compassion Benchmark Assessment: Amsterdam

**Entity type:** City  
**Sector/Domain:** Government — municipal  
**Assessment date:** 2026-09-22  
**Composite score:** 72/100  
**Band:** Established  
**Cycle:** nightly, lookback 2026-09-08 to 2026-09-22 (scan `research/scans/2026-09-22.json`, source: priority)  
**Outcome:** first formal evidence-based baseline; change proposal filed (recommendation: downgrade)

## Why this entity was assessed

The scanner flagged Amsterdam on an open letter dated 19 September 2026 in which the mayors of Amsterdam, Rotterdam, Utrecht and The Hague — the G4 — jointly asked the Dutch national government for concrete measures against a "dramatic" rise in homelessness, drug use and public-disorder pressure. The scanner explicitly classified this as an advocacy signal rather than a negative finding. Amsterdam had never been individually assessed (`last_assessed: null`), so this cycle produces the city's first formal evidence-based baseline.

## Evidence-date and attribution checks

**Date verified.** The open letter is dated 19 September 2026 and sits inside the window. Mayor Femke Halsema's earlier public warning is dated 31 August 2026, outside the window, and is used only as context.

**Directionality, and the fact that screening rule 3 cuts both ways.** The flagging event is the city naming a problem and asking for help. Read as conduct, it is compassion functioning, and it is scored *upward*: it is the basis for A1 at 5, A4 at 4 and S4 at 5. Amsterdam is not penalised one point for the G4 letter.

**So why does the composite fall?** Because the published 94.4 has never been measured. It is a seed value that places Amsterdam 8th of 250 cities in the Exemplary band, which this methodology defines as practices "independently verified, consistent, and sustained." Two independent bodies say otherwise, and neither is the G4 letter:

1. The **Ombudsman Metropool Amsterdam**, a statutory independent complaints body, reported 2,942 complaints, notifications and signals in its 2025 annual report, found that vulnerable residents get stuck in complicated rules, neighbourhood-team problems and slow procedures, and called for a rebuild of complaint handling. That is an independent verification of *inconsistency*, which is exactly what the Exemplary anchor forbids.
2. The **Smart Check** welfare-fraud algorithm, a 4.2-million-euro system the city intended to be among the fairest in the world, was found still to discriminate against residents with migrant backgrounds and lower incomes and was suspended by the city council in May 2025 after running live from March 2023.

**Attribution.** The national government's cuts to support services and its restrictive asylum policy are central-government conduct and are not charged to Amsterdam. Where the city has resisted them at its own cost, that resistance *is* Amsterdam's conduct and is credited (I1, S4). Utrecht's street-sleeping ban is Utrecht's conduct and is not scored here.

## Score Summary

| Dimension | Code | Raw (1-5) | Scaled (0-100) | Band |
|-----------|------|-----------|----------------|------|
| Awareness | AWR | 4.4 | 85 | Exemplary |
| Empathy | EMP | 3.4 | 60 | Functional |
| Action | ACT | 3.8 | 70 | Established |
| Equity | EQU | 3.4 | 60 | Functional |
| Boundaries | BND | 3 | 50 | Functional |
| Accountability | ACC | 4.2 | 80 | Established |
| Systemic Thinking | SYS | 4.2 | 80 | Established |
| Integrity | INT | 4 | 75 | Established |
| **Composite** | — | — | **72** | **Established** |

**Composite derivation (canonical formula, methodology v1.2, `site/scripts/lib/scoring.mjs::computeCompositeFromDimensions`):** mean of the 8 raw dimension scores = 3.800; baseComposite = 70.00; dimensions below 4.0 = 4; integration premium applied by the canonical function. Final composite **72** (Established).

## Dimension Details

### AWR: Awareness (Raw 4.4/5 — Scaled 85/100)

| Subdimension | Score | Evidence | Source | Tier |
|-------------|-------|----------|--------|------|
| A1 Suffering Detection | 5/5 | Disaggregated, published and independently audited detection. The city publishes its own homelessness research at openresearch.amsterdam, including the admission that the number of homeless EU citizens and undocumented people in the city is not known, and an independent ombudsman logged 2,942 complaints and signals in 2025. | [City of Amsterdam / openresearch.amsterdam — info on homelessness](https://openresearch.amsterdam/en/page/110950/info-on-homelessness-by-the-city-of-amsterdam) | 4 |
| A2 Contextual Sensitivity | 4/5 | Differentiated awareness for well over three groups: economically homeless residents, refused asylum seekers, undocumented migrants, homeless EU migrant workers, people with crack addiction, and children through a dedicated children’s ombudsman. | [NL Times — mayors of 4 biggest cities ask government for help](https://nltimes.nl/2026/09/19/mayors-4-biggest-cities-ask-government-help-tackle-homelessness-problem) | 2 |
| A3 Blind Spot Mitigation | 5/5 | Anchor 5 met precisely. An external investigation (Lighthouse Reports with MIT Technology Review, given extensive access by the city) found the city’s flagship "fair" welfare-fraud algorithm still discriminated against residents with migrant backgrounds and lower incomes, and a course correction followed: the council suspended the programme in May 2025. | [MIT Technology Review — inside Amsterdam’s high-stakes experiment](https://www.technologyreview.com/2025/06/11/1118233/amsterdam-fair-welfare-ai-discriminatory-algorithms-failure/) | 5 |
| A4 Signal Amplification | 4/5 | A structural role with genuine authority: a statutory independent Ombudsman and children’s ombudsman for the Amsterdam metropolitan region, reporting publicly and annually, whose 2025 report names care, debt, housing and social support as the dominant complaint areas. | [Ombudsman Metropool Amsterdam — Jaarverslag 2025](https://www.ombudsmanmetropool.nl/nl/publicatie/jaarverslag-2025-klachtbehandeling-30) | 5 |
| A5 Anticipatory Awareness | 4/5 | Pre-launch harm assessment was required and extensive for a major decision — Smart Check was bias-tested before and during rollout, and was built specifically to replace SyRI after a court banned it. Held at 4 rather than 5 because the assessment did not prevent a discriminatory system from running live for roughly two years. | [Lighthouse Reports — how we investigated Amsterdam’s fairness attempt](https://www.lighthousereports.com/methodology/amsterdam-fairness/) | 5 |

### EMP: Empathy (Raw 3.4/5 — Scaled 60/100)

| Subdimension | Score | Evidence | Source | Tier |
|-------------|-------|----------|--------|------|
| E1 Affective Resonance | 3/5 | Training and expectation exist but the independent ombudsman finds the experience is inconsistent: vulnerable residents get stuck in complicated rules, waiting times and complicated procedures, and the report explains why residents sometimes cannot find their way to the municipality at all. | [Ombudsman Metropool Amsterdam — Jaarverslag 2025](https://www.ombudsmanmetropool.nl/nl/publicatie/jaarverslag-2025-klachtbehandeling-30) | 5 |
| E2 Perspective-Taking | 4/5 | Perspective-taking embedded in major decisions: peer-reviewed research documents sustained back-stage consultation with undocumented migrant groups shaping Amsterdam’s policy, alongside front-stage contestation with the national government. | [Comparative Migration Studies — front stage contestation and back stage consultation](https://link.springer.com/article/10.1186/s40878-025-00492-6) | 4 |
| E3 Non-Judgment | 3/5 | Anchor 3 exactly: a disparity was identified, formally investigated and corrected. Smart Check was found to discriminate against migrant-background and lower-income residents and was stopped. But it was live from March 2023 to May 2025, so non-judgment did not hold under pressure. | [Racism and Technology Center — how Amsterdam tried to roll out a "fair" algorithm](https://racismandtechnology.center/2025/07/02/racist-technology-in-action-how-the-municipality-of-amsterdam-tried-to-roll-out-a-fair-fraud-detection-algorithm-spoiler-alert-it-was-a-disaster/) | 3 |
| E4 Validation | 3/5 | Some staff validate first, experience is mixed. The ombudsman’s 2025 report is an explicit call to rebuild complaint handling ("klachtbehandeling 3.0"), which indicates acknowledgment does not yet structurally precede investigation. | [Ombudsman Metropool Amsterdam — Jaarverslag 2025](https://www.ombudsmanmetropool.nl/nl/publicatie/jaarverslag-2025-klachtbehandeling-30) | 5 |
| E5 Cultural Empathy | 4/5 | Multiple communities genuinely involved and the confirmations are independent: academic research documents Amsterdam consulting undocumented migrant groups directly, and the city maintains dedicated provisions for refused asylum seekers. | [City of Amsterdam — provisions for asylum seekers who were refused](https://www.amsterdam.nl/en/refugees/provisions-asylum/) | 4 |

### ACT: Action (Raw 3.8/5 — Scaled 70/100)

| Subdimension | Score | Evidence | Source | Tier |
|-------------|-------|----------|--------|------|
| AC1 Responsiveness | 3/5 | Standards exist but are not consistently met. More than 600 vulnerable people sit on a waiting list for social shelter and protection, and the independent ombudsman names slow procedures and waiting times as a primary complaint driver. | [Institute of Current World Affairs — Dutch housing shelters](https://www.icwa.org/dutch-housing-shelters/) | 3 |
| AC2 Proportionality | 4/5 | Documented augmented response with unmet need tracked and published: bed-bath-bread provision for refused asylum seekers, a stated 18-month maximum support period designed to widen reach over time, and public disclosure of both the waiting list and the fact that some homeless populations are uncounted. | [Moving Cities — Amsterdam’s support for non-documented migrants](https://moving-cities.eu/amsterdam/amsterdam-s-support-for-non-documented-migrants-a-fresh-start-in-adversity) | 3 |
| AC3 Efficacy | 4/5 | Anchor 4 met: at least one programme discontinued because of data. The city council suspended the 4.2-million-euro Smart Check system in May 2025 when evidence showed it discriminated, rather than defending the investment. | [MIT Technology Review — inside Amsterdam’s high-stakes experiment](https://www.technologyreview.com/2025/06/11/1118233/amsterdam-fair-welfare-ai-discriminatory-algorithms-failure/) | 5 |
| AC4 Resource Mobilization | 4/5 | Annual review against need data with the gap publicly disclosed: the city runs a funded multi-year homelessness strategy for 2023-2026 and, with the other G4 cities, publicly quantified the remaining shortfall at roughly 100 million euros a year on 19 September 2026. | [NL Times — mayors of 4 biggest cities ask government for help](https://nltimes.nl/2026/09/19/mayors-4-biggest-cities-ask-government-help-tackle-homelessness-problem) | 2 |
| AC5 Follow-Through | 4/5 | Protocols applied consistently over years rather than episodically: a housing-led approach in which shelter and housing are treated as health care, plus a documented 2023-2026 strategy with continuity across budget cycles. | [City of Amsterdam / openresearch.amsterdam — strengthening the approach to homelessness 2023-2026](https://openresearch.amsterdam/en/page/100445/strengthening-the-approach-to-homelessness-2023-2026) | 4 |

### EQU: Equity (Raw 3.4/5 — Scaled 60/100)

| Subdimension | Score | Evidence | Source | Tier |
|-------------|-------|----------|--------|------|
| EQ1 Universality | 4/5 | Coverage is disaggregated and exclusion gaps have been reduced: Amsterdam commits to supporting 500 undocumented migrants, the largest number of any Dutch city. Short of anchor 5 because the city itself states the number of homeless EU citizens and undocumented people is not known. | [Moving Cities — Amsterdam’s support for non-documented migrants](https://moving-cities.eu/amsterdam/amsterdam-s-support-for-non-documented-migrants-a-fresh-start-in-adversity) | 3 |
| EQ2 Priority for Vulnerable | 4/5 | A documented prioritisation framework under which the most precarious get more, backed by litigation: on 3 June 2025 a court held that 28 people must be allowed to remain in Amsterdam’s bed-bath-bread shelter and that the national minister must keep funding it. | [Housing Rights Watch — legal victory in Amsterdam](https://www.housingrightswatch.org/news/legal-victory-amsterdam-continued-shelter-access-28-undocumented-migrants) | 4 |
| EQ3 Bias Awareness | 3/5 | Anchor 3: disparities identified, formally investigated, corrective action taken. But a city system that scored welfare applicants was discriminating against migrant-background and lower-income residents for roughly two years before it was stopped, so ongoing monitoring did not catch it in time. | [Racism and Technology Center — how Amsterdam tried to roll out a "fair" algorithm](https://racismandtechnology.center/2025/07/02/racist-technology-in-action-how-the-municipality-of-amsterdam-tried-to-roll-out-a-fair-fraud-detection-algorithm-spoiler-alert-it-was-a-disaster/) | 3 |
| EQ4 Access Design | 3/5 | Barrier mapping exists and barriers have been removed, but the independent finding is that barriers persist for exactly the residents who most need access: complicated rules, neighbourhood-team problems and slow procedures, concentrated in care, debt, housing and social support. | [Ombudsman Metropool Amsterdam — Jaarverslag 2025](https://www.ombudsmanmetropool.nl/nl/publicatie/jaarverslag-2025-klachtbehandeling-30) | 5 |
| EQ5 Historical Harm Acknowledgment | 3/5 | Formal acknowledgment of a specific historical harm with community involvement: on 1 July 2021 Mayor Femke Halsema apologised for the Amsterdam city council’s active involvement in colonial slavery, following research the municipality itself commissioned in 2019, at the annual Keti Koti commemoration. Held at 3 because a recovery fund was recommended by the advisory commission rather than shown to be delivered at scale. | [NL Times — Amsterdam mayor apologizes for city’s role in slavery](https://nltimes.nl/2021/07/01/amsterdam-mayor-apologizes-citys-role-slavery) | 2 |

### BND: Boundaries (Raw 3/5 — Scaled 50/100)

| Subdimension | Score | Evidence | Source | Tier |
|-------------|-------|----------|--------|------|
| B1 Self-Sustainability | 3/5 | Structural strain is tracked and named rather than treated as an individual problem: the ombudsman identifies neighbourhood-team dysfunction as a systemic cause of resident harm, and the G4 letter asks for reversal of cuts to mental healthcare. No published turnover or burnout data for city social-care staff was located. | [Ombudsman Metropool Amsterdam — Jaarverslag 2025](https://www.ombudsmanmetropool.nl/nl/publicatie/jaarverslag-2025-klachtbehandeling-30) | 5 |
| B2 Autonomy Preservation | 4/5 | Autonomy outcomes are designed in and reasoned publicly: Amsterdam caps undocumented-migrant support at 18 months with the explicit intent that more people can be supported over time, and its housing-led model treats stable housing as the route to independence rather than to continued service contact. | [Moving Cities — Amsterdam’s support for non-documented migrants](https://moving-cities.eu/amsterdam/amsterdam-s-support-for-non-documented-migrants-a-fresh-start-in-adversity) | 3 |
| B3 Scope Clarity | 3/5 | Scope is communicated and referral routes exist, but the ombudsman’s central 2025 finding is that residents sometimes cannot find their way to the municipality with a complaint — which is a scope-clarity failure at the front door. | [Ombudsman Metropool Amsterdam — Jaarverslag 2025](https://www.ombudsmanmetropool.nl/nl/publicatie/jaarverslag-2025-klachtbehandeling-30) | 5 |
| B4 Refusal Ethics | 3/5 | A refusal protocol with concrete alternatives in most cases: the city publishes dedicated provisions for asylum seekers whose applications were refused, so a national refusal does not leave people with nothing at municipal level. No published warm-referral rate. | [City of Amsterdam — provisions for asylum seekers who were refused](https://www.amsterdam.nl/en/refugees/provisions-asylum/) | 4 |
| B5 Consent Orientation | 2/5 | Welfare applicants were assigned algorithmic fraud-risk scores by a city system trained on prior investigations, with no sourced informed-consent architecture or withdrawal route for that profiling. Consent appears to have protected the institution rather than informing the resident. | [MIT Technology Review — inside Amsterdam’s high-stakes experiment](https://www.technologyreview.com/2025/06/11/1118233/amsterdam-fair-welfare-ai-discriminatory-algorithms-failure/) | 5 |

### ACC: Accountability (Raw 4.2/5 — Scaled 80/100)

| Subdimension | Score | Evidence | Source | Tier |
|-------------|-------|----------|--------|------|
| AB1 Harm Acknowledgment | 4/5 | Acknowledgment was structurally early and self-exposed: the city gave outside journalists and researchers extensive access to Smart Check while it was still running, and acknowledged the discrimination finding rather than contesting it. Short of anchor 5 because the finding itself was established by external analysts. | [Lighthouse Reports — how we investigated Amsterdam’s fairness attempt](https://www.lighthousereports.com/methodology/amsterdam-fairness/) | 5 |
| AB2 Correction Willingness | 5/5 | Anchor 5: self-initiated correction before external compulsion. No court, regulator or national authority ordered Amsterdam to stop Smart Check; the city council suspended a 4.2-million-euro flagship programme in May 2025 on fairness grounds alone. | [MIT Technology Review — inside Amsterdam’s high-stakes experiment](https://www.technologyreview.com/2025/06/11/1118233/amsterdam-fair-welfare-ai-discriminatory-algorithms-failure/) | 5 |
| AB3 Transparency | 5/5 | Comprehensive, independently verifiable transparency. Amsterdam invited external investigators into a failing algorithm and let the failure be published in detail, publishes its own homelessness research openly including what it does not know, and funds an independent ombudsman that publishes criticism of it. | [City of Amsterdam / openresearch.amsterdam — policies for homelessness](https://openresearch.amsterdam/en/page/78567/policies-for-homelessness) | 4 |
| AB4 Systemic Learning | 4/5 | Documented institutional learning across incidents: Smart Check was itself an attempt to build a lawful successor to SyRI after a court banned SyRI in 2020 for human-rights violations, and its failure in turn fed a national framework for reviewing public-sector algorithmic decision-making. | [Racism and Technology Center — how Amsterdam tried to roll out a "fair" algorithm](https://racismandtechnology.center/2025/07/02/racist-technology-in-action-how-the-municipality-of-amsterdam-tried-to-roll-out-a-fair-fraud-detection-algorithm-spoiler-alert-it-was-a-disaster/) | 3 |
| AB5 Reparative Action | 3/5 | At least one case of reparative action the harmed parties treated as meaningful: continued shelter for the 28 people whose cases the national government had not individually considered, secured through the June 2025 ruling. Repair to residents wrongly risk-scored by Smart Check is not documented as delivered. | [Housing Rights Watch — legal victory in Amsterdam](https://www.housingrightswatch.org/news/legal-victory-amsterdam-continued-shelter-access-28-undocumented-migrants) | 4 |

### SYS: Systemic Thinking (Raw 4.2/5 — Scaled 80/100)

| Subdimension | Score | Evidence | Source | Tier |
|-------------|-------|----------|--------|------|
| S1 Root Cause Orientation | 4/5 | Explicit root-cause strategy: a housing-led approach treating housing as health care, and a G4 request aimed squarely upstream — shelter capacity, medication to manage crack addiction, support for homeless migrant workers, and reversal of mental-healthcare cuts. | [NL Times — mayors of 4 biggest cities ask government for help](https://nltimes.nl/2026/09/19/mayors-4-biggest-cities-ask-government-help-tackle-homelessness-problem) | 2 |
| S2 Long-Term Impact | 4/5 | Long-horizon planning with published research behind it: a named 2023-2026 homelessness strategy with an open research base the city maintains and updates, influencing strategy rather than decorating it. | [City of Amsterdam / openresearch.amsterdam — strengthening the approach to homelessness 2023-2026](https://openresearch.amsterdam/en/page/100445/strengthening-the-approach-to-homelessness-2023-2026) | 4 |
| S3 Interconnection Awareness | 4/5 | Cross-system effects systematically mapped in a major decision: the G4 letter explicitly links homelessness, addiction, migrant labour, mental-health funding and public order across four cities and national policy, and asks for a dexamfetamine treatment pilot rather than an enforcement response. | [NL Times — mayors of 4 biggest cities ask government for help](https://nltimes.nl/2026/09/19/mayors-4-biggest-cities-ask-government-help-tackle-homelessness-problem) | 2 |
| S4 Structural Critique | 5/5 | Anchor 5: contributed to a structural change while acknowledging its own model’s limits. Amsterdam litigated against its own national government over shelter for refused asylum seekers and won a ruling in June 2025 compelling the minister to keep funding it, and the G4 letter states plainly that the cities cannot solve this alone. | [Housing Rights Watch — legal victory in Amsterdam](https://www.housingrightswatch.org/news/legal-victory-amsterdam-continued-shelter-access-28-undocumented-migrants) | 4 |
| S5 Coalitional Compassion | 4/5 | Joint outcomes and shared advocacy rather than solo lobbying: Amsterdam acted as one of four co-signatories with Rotterdam, Utrecht and The Hague in a single collective letter, pooling credit and leverage. Short of anchor 5, which requires ceding leadership to a better-positioned body. | [TheMayor.EU — four largest cities in the Netherlands demand action](https://www.themayor.eu/en/a/view/the-four-largest-cities-in-the-netherlands-demand-action-against-homelessness-3620) | 2 |

### INT: Integrity (Raw 4/5 — Scaled 75/100)

| Subdimension | Score | Evidence | Source | Tier |
|-------------|-------|----------|--------|------|
| I1 Consistency Under Pressure | 4/5 | A pattern of maintaining commitments at real cost: Amsterdam has sustained bed-bath-bread shelter for undocumented and refused-asylum residents against an increasingly restrictive national policy, and pursued it through the courts rather than quietly complying. | [Housing Rights Watch — legal victory in Amsterdam](https://www.housingrightswatch.org/news/legal-victory-amsterdam-continued-shelter-access-28-undocumented-migrants) | 4 |
| I2 Non-Performance | 5/5 | Anchor 5: has done something compassionate that was publicly unflattering. Amsterdam let journalists and researchers document in detail that its own 4.2-million-euro attempt at the world’s fairest welfare algorithm had failed and discriminated — an act with no reputational upside. | [MIT Technology Review — inside Amsterdam’s high-stakes experiment](https://www.technologyreview.com/2025/06/11/1118233/amsterdam-fair-welfare-ai-discriminatory-algorithms-failure/) | 5 |
| I3 Internal Consistency | 3/5 | Meaningful effort is visible but internal consistency is not evidenced. No published staff-culture, turnover or wellbeing data for the city organisation was located, and the ombudsman identifies neighbourhood-team problems that imply internal strain. | [Ombudsman Metropool Amsterdam — Jaarverslag 2025](https://www.ombudsmanmetropool.nl/nl/publicatie/jaarverslag-2025-klachtbehandeling-30) | 5 |
| I4 Values Alignment | 4/5 | A values-alignment review that actually reversed a major decision: Smart Check was cancelled on fairness grounds against the sunk cost. Held at 4 rather than 5 because one documented reversal does not yet establish routine testing of major decisions. | [MIT Technology Review — inside Amsterdam’s high-stakes experiment](https://www.technologyreview.com/2025/06/11/1118233/amsterdam-fair-welfare-ai-discriminatory-algorithms-failure/) | 5 |
| I5 Resilience of Care | 4/5 | Practices sit in policy and survive political change: the slavery apology (2021), the homelessness strategy (2023-2026) and the undocumented-migrant provision have persisted across municipal electoral cycles including the 2026 Dutch municipal elections. | [DutchNews.nl — Amsterdam mayor apologises for slavery past](https://www.dutchnews.nl/2021/07/amsterdam-mayor-apologises-for-slavery-past-as-advisory-group-calls-for-action/) | 2 |

## Published Index Comparison

**Published index:** global-cities | **Published rank:** #8 | **Published composite:** 94.4/100 | **Published band:** Exemplary

| Dimension | Published (raw) | Published (scaled) | Research (raw) | Research (scaled) | Difference (scaled) |
|-----------|----------------|-------------------|----------------|-------------------|---------------------|
| AWR | 4.5 | 87.5 | 4.4 | 85 | -2.5 |
| EMP | 4.5 | 87.5 | 3.4 | 60 | -27.5 |
| ACT | 4.5 | 87.5 | 3.8 | 70 | -17.5 |
| EQU | 4 | 75 | 3.4 | 60 | -15 |
| BND | 4.5 | 87.5 | 3 | 50 | -37.5 |
| ACC | 4.5 | 87.5 | 4.2 | 80 | -7.5 |
| SYS | 4.5 | 87.5 | 4.2 | 80 | -7.5 |
| INT | 4 | 75 | 4 | 75 | 0 |
| **Composite** | — | **94.4** | — | **72** | **-22.4** |

**Math-hygiene reconstruction:** the canonical formula applied to the published dimension vector returns 94.4 against a published 94.4 (difference 0). Within the 0.5-point tolerance — no math-hygiene issue.

### Score Difference Analysis

The published 94.4 is an unassessed seed value. It is worth being precise about what it asserts: 94.4 is rank 8 of 250 global cities and sits in the Exemplary band, which this methodology defines as "practices independently verified, consistent, and sustained."

**ACC holds almost exactly (published 4.5 / 87.5 scaled; research 4.2 / 80.0; -7.5).** This is the finding that matters most and it is a *vindication* of the published score. Amsterdam's accountability behaviour is genuinely near the top of the instrument: AB2 and AB3 both score 5. A city that invites outside investigators into a failing algorithm, publishes the failure, scrapps a 4.2-million-euro flagship programme on fairness grounds with no external compulsion, and funds an independent ombudsman to criticise it in public is doing something very few institutions in this benchmark do.

**SYS holds (published 4.5 / 87.5; research 4.2 / 80.0; -7.5).** S4 scores 5. Amsterdam took its own national government to court over shelter for refused asylum seekers and won.

**EMP falls hardest (published 4.5 / 87.5; research 3.4 / 60.0; -27.5).** The published value asserts that people consistently feel genuinely cared about. The city's own statutory ombudsman, in its 2025 annual report, says vulnerable residents get stuck in complicated rules, waiting times and complicated procedures, that many complaints concern care, debt, housing and social support, and that residents sometimes cannot find their way to the municipality at all. An independent body finding inconsistency is definitionally incompatible with an Exemplary rating on Empathy.

**BND falls (published 4.5 / 87.5; research 3.0 / 50.0; -37.5).** Two causes. B5 scores 2: the city assigned algorithmic fraud-risk scores to welfare applicants with no sourced consent architecture. B1 and B3 sit at 3 on the ombudsman's front-door findings and on absent staff data.

**EQU falls (published 4.0 / 75.0; research 3.4 / 60.0; -15.0).** Amsterdam's universality and prioritisation are strong (both 4, both litigated for), but EQ3 and EQ4 are capped by a live discriminatory system that ran for roughly two years and by persisting access barriers for the most vulnerable.

**ACT falls modestly (4.5 to 3.8)**, driven by AC1 at 3: more than 600 vulnerable people on a shelter waiting list, and slow procedures named independently.

**Crucially, the flagging event itself moved scores up, not down.** The 19 September G4 letter is the evidence behind A1 at 5, A4 at 4, S1 at 4, S3 at 4 and S4 at 5, and behind AC4 at 4 for publicly quantifying its own funding gap. The composite falls because the Exemplary band asks for independently verified consistency and Amsterdam's own independent bodies report the opposite — not because four mayors asked for help.

### Recommendation

The published 94.4 (Exemplary) is **overstated** on current evidence. The measured baseline is 72.0 (Established), a delta of -22.4 with a band crossing from Exemplary to Established. A change proposal is filed on both the magnitude and band-crossing triggers.

To be clear about the direction of travel: this is not a finding that Amsterdam handles suffering badly. Established is the band for practices that are "systematic, documented, and improving," which is an accurate description of this city. Amsterdam's Accountability and Systemic Thinking scores are among the strongest this benchmark records. What the evidence does not support is Exemplary, because Exemplary requires independently verified consistency and Amsterdam's own ombudsman independently verifies inconsistency.

Confidence is **medium**: the evidence is Tier 4-5 and plentiful, but the ombudsman's 2025 annual report was read in Dutch-language secondary reporting rather than in full, and a funded national response to the G4 request would raise Action and Equity materially. An upward watch flag is attached for exactly that reason.

## Screening checks (§3e-bis)

1. **Baseline provenance — checked.** `research/APPLIED_CHANGES.md` contains no Amsterdam row, no Amsterdam assessment files exist on disk, and `rotation-state.json` records `last_assessed: null`. The published 94.4 has never been set by an evidence-based assessment.
2. **No "stale baseline" rationale.** The rationale is that the score has never been measured, which the history confirms rather than contradicts.
3. **Directionality — examined carefully, because the scan warned it cuts both ways.** Amsterdam was surfaced on *positive* advocacy evidence, and that evidence is scored *upward* (A1 5, A4 4, S1 4, S3 4, S4 5, AC4 4). The downward composite movement is driven by different, independent evidence: the ombudsman's 2025 annual report and the Smart Check discrimination finding. No downward movement is charged to the G4 letter, and no upward movement is taken on the absence of harm.
4. **Rationale-versus-history consistency.** There is no prior Amsterdam finding for this to contradict.
5. **Calibration handled separately.** A `calibration_flag` is recorded asking whether other never-assessed Exemplary-band global cities carry the same overstatement. That question is *not* used as the basis for Amsterdam's score move, which rests on entity-specific Tier 4-5 evidence.
6. **Sub-band honesty.** The proposal states explicitly that Established is a strong result and that four of Amsterdam’s eight dimensions remain at or above 4.0 (AWR 4.4, ACC 4.2, SYS 4.2, INT 4.0).

## Key Findings

- Amsterdam does something almost no institution in this benchmark does: it publishes its own failures. It gave outside journalists extensive access to a 4.2-million-euro city algorithm, let them document that it discriminated against residents with migrant backgrounds and lower incomes, and then scrapped it in May 2025 with no court or regulator forcing the decision.
- The city’s own independent ombudsman says the service experience is inconsistent for the people who need it most. Its 2025 annual report logged 2,942 complaints and signals and found vulnerable residents stuck in complicated rules, waiting times and slow procedures, mostly over care, debt, housing and social support.
- On 19 September 2026 the mayors of Amsterdam, Rotterdam, Utrecht and The Hague asked the Dutch government for about 100 million euros a year, describing homeless people they see as "confused, addicted, and visibly desperate." Naming a problem you cannot fix is scored as compassion working, and it raised this city’s Awareness and Systemic Thinking scores.
- Amsterdam takes real costs to keep commitments. It sustained shelter for undocumented and refused-asylum residents against a restrictive national policy and won a court ruling on 3 June 2025 requiring the national minister to keep funding shelter for 28 people.
- The weakest score is Consent (2 of 5): Amsterdam assigned algorithmic fraud-risk scores to welfare applicants with no documented consent route or way to object. More than 600 vulnerable people also sit on a waiting list for social shelter.

## Strongest Dimensions

**ACC (4.2 raw)** and **SYS (4.2)**, both near the top of the instrument. AB2 (self-initiated correction), AB3 (transparency), S4 (structural critique) and I2 (non-performance) all score 5 of 5. Amsterdam corrects itself before it is forced to, discloses what it does not know, and litigates against its own national government on behalf of people with no vote.

## Weakest Dimensions

**BND (3.0 raw)** and **EMP (3.4)**. Boundaries is dragged down by consent: welfare applicants were algorithmically risk-scored with no documented consent or objection route (B5 = 2). Empathy is capped by the ombudsman's independent finding that vulnerable residents remain stuck in rules, waiting times and complicated procedures.

## Evidence Gaps

- The Ombudsman Metropool Amsterdam 2025 annual report was read through Dutch-language secondary reporting rather than in full. Reading the primary report could move E1, E4, EQ4 and B3 in either direction.
- No published staff turnover, caseload or wellbeing data for the Amsterdam city organisation was located, which holds B1 and I3 at 3.
- The successor arrangement to the suspended Smart Check system has not been specified in sources located, so B5 and EQ3 cannot yet be re-tested.
- Whether the recovery fund recommended by the slavery advisory commission was funded at scale is not established, which holds EQ5 at 3 rather than 4.

## Recommended Next Steps

- **Functional/Established**: Consider [Advisory Support](/advisory) to translate benchmark insights into strategic action.

## Sources

- [City of Amsterdam / openresearch.amsterdam — info on homelessness](https://openresearch.amsterdam/en/page/110950/info-on-homelessness-by-the-city-of-amsterdam)
- [NL Times — mayors of 4 biggest cities ask government for help](https://nltimes.nl/2026/09/19/mayors-4-biggest-cities-ask-government-help-tackle-homelessness-problem)
- [MIT Technology Review — inside Amsterdam’s high-stakes experiment](https://www.technologyreview.com/2025/06/11/1118233/amsterdam-fair-welfare-ai-discriminatory-algorithms-failure/)
- [Ombudsman Metropool Amsterdam — Jaarverslag 2025](https://www.ombudsmanmetropool.nl/nl/publicatie/jaarverslag-2025-klachtbehandeling-30)
- [Lighthouse Reports — how we investigated Amsterdam’s fairness attempt](https://www.lighthousereports.com/methodology/amsterdam-fairness/)
- [Comparative Migration Studies — front stage contestation and back stage consultation](https://link.springer.com/article/10.1186/s40878-025-00492-6)
- [Racism and Technology Center — how Amsterdam tried to roll out a "fair" algorithm](https://racismandtechnology.center/2025/07/02/racist-technology-in-action-how-the-municipality-of-amsterdam-tried-to-roll-out-a-fair-fraud-detection-algorithm-spoiler-alert-it-was-a-disaster/)
- [City of Amsterdam — provisions for asylum seekers who were refused](https://www.amsterdam.nl/en/refugees/provisions-asylum/)
- [Institute of Current World Affairs — Dutch housing shelters](https://www.icwa.org/dutch-housing-shelters/)
- [Moving Cities — Amsterdam’s support for non-documented migrants](https://moving-cities.eu/amsterdam/amsterdam-s-support-for-non-documented-migrants-a-fresh-start-in-adversity)
- [City of Amsterdam / openresearch.amsterdam — strengthening the approach to homelessness 2023-2026](https://openresearch.amsterdam/en/page/100445/strengthening-the-approach-to-homelessness-2023-2026)
- [Housing Rights Watch — legal victory in Amsterdam](https://www.housingrightswatch.org/news/legal-victory-amsterdam-continued-shelter-access-28-undocumented-migrants)
- [NL Times — Amsterdam mayor apologizes for city’s role in slavery](https://nltimes.nl/2021/07/01/amsterdam-mayor-apologizes-citys-role-slavery)
- [City of Amsterdam / openresearch.amsterdam — policies for homelessness](https://openresearch.amsterdam/en/page/78567/policies-for-homelessness)
- [TheMayor.EU — four largest cities in the Netherlands demand action](https://www.themayor.eu/en/a/view/the-four-largest-cities-in-the-netherlands-demand-action-against-homelessness-3620)
- [DutchNews.nl — Amsterdam mayor apologises for slavery past](https://www.dutchnews.nl/2021/07/amsterdam-mayor-apologises-for-slavery-past-as-advisory-group-calls-for-action/)

---

*This assessment is based on publicly available information and does not constitute a formal Compassion Benchmark Certified Assessment. For a comprehensive, assessor-led evaluation, visit compassionbenchmark.com/certified-assessments.*
