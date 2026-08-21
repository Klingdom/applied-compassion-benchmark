---
entity: "Kazakhstan"
type: "Country"
sector: "Government (national)"
date: "2026-08-20"
composite_score: 13.7
band: "Critical"
scores:
  AWR: 1.6
  EMP: 1.6
  ACT: 2
  EQU: 1.4
  BND: 1.6
  ACC: 1.4
  SYS: 1.6
  INT: 1.2
published_index: "countries"
published_rank: 140
published_composite: 20.3
published_band: "developing"
assessed_composite: 13.7
score_delta: -6.6
band_change: true
recommendation: "downgrade"
change_proposal: true
confidence: "medium"
subdim_sidecar: true
source: "priority"
scan_file: "research/scans/2026-08-20.json"
---

# Compassion Benchmark Assessment: Kazakhstan

**Entity type:** Country
**Sector/Domain:** Government (national)
**Assessment date:** 2026-08-20
**Composite score:** 13.7/100
**Band:** Critical
**Cycle source:** priority (scan `research/scans/2026-08-20.json`)

## Why this entity was assessed

The scanner flagged Kazakhstan on the sentencing of Gulnara Bazhkenova, former editor-in-chief of the independent outlet Orda, to eight years in prison. **Kazakhstan has never been individually assessed by this pipeline** (`last_assessed: null` in rotation state). Its published score of 20.3 is a **seed placeholder shared byte-for-byte with eleven other countries** — Algeria, Cameroon, Djibouti, Gabon, Guinea, Honduras, Mauritania, Papua New Guinea, Republic of Congo, Uzbekistan and Zimbabwe all carry the identical vector {2, 2, 2, 1.5, 2, 1.5, 2, 1.5}. This is therefore a **first real measurement**, not a finding that Kazakhstan got worse.

## Evidence-date and attribution checks

**PLACEHOLDER FRAMING — this matters for how the number should be read.** Kazakhstan's published 20.3 was never an individual assessment. It is a seed value shared with eleven other countries. Three members of the same cluster have already been de-seeded by this pipeline: Djibouti and Mauritania (both to 17.5, Developing to Critical, on 2026-08-16) and Zimbabwe (to 10.0, Developing to Critical, on 2026-08-16). **A large gap between a never-measured placeholder and a first real assessment is not evidence of decline.** It is the correction of a value that was never measured.

**DATE MISMATCH RESOLVED (gate warning 3).** The scanner recorded `evidence_date: 2026-08-18` against a radiofree.org URL carrying **2026-08-19**. There is no conflict: the **sentencing date is 18 August 2026**, per CPJ's own report; the radiofree.org item is a next-day syndicated republication of the CPJ text. The 18 August conduct date is used.

**FUTURE-DATED MENTION VERIFIED (gate warning 4).** The scan referenced parliamentary elections on **23 August 2026**. This is a **genuinely scheduled future event**, confirmed independently by the OSCE Office for Democratic Institutions and Human Rights, which has opened an observation activity titled "Kazakhstan, Early Parliamentary Elections, 23 August 2026". These are the first elections to the new unicameral Kurultai created under the constitution approved by referendum in March 2026. **A scheduled future election is not scoreable conduct and is not scored here.** It is used only to date the crackdown as pre-electoral.

**MIXED DATED/UNDATED SOURCING RESOLVED (gate warning 2).** All three scanner-supplied sources were listed as `date_verified: true`. Independent dated corroboration was added from CPJ's 14 August joint statement, the IPHR joint NGO statement, Human Rights Watch's World Report 2026 chapter, and Amnesty International's Kazakhstan country report.

**ATTRIBUTION.** All conduct scored here is Kazakhstani state conduct: court sentencing, prosecutorial action, constitutional drafting, and social-assistance administration. No third-party harm is attributed to Kazakhstan.

## Score Summary

| Dimension | Code | Raw (1-5) | Scaled (0-100) | Band |
|---|---|---|---|---|
| Awareness | AWR | 1.60 | 15 | Critical |
| Empathy | EMP | 1.60 | 15 | Critical |
| Action | ACT | 2.00 | 25 | Developing |
| Equity | EQU | 1.40 | 10 | Critical |
| Boundaries | BND | 1.60 | 15 | Critical |
| Accountability | ACC | 1.40 | 10 | Critical |
| Systemic Thinking | SYS | 1.60 | 15 | Critical |
| Integrity | INT | 1.20 | 5 | Critical |
| **Composite** | — | — | **13.7** | **Critical** |

## Dimension Details

### AWR: Awareness (Raw 1.60/5 — Scaled 15/100)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| A1 Suffering Detection | 2/5 | Kazakhstan runs a real detection apparatus for material need: as of early 2026 roughly 30,000 families (about 163,000 people) receive Targeted Social Assistance, and the National Statistics Bureau publishes poverty and subsistence-minimum data. Detection is reactive and the figures are contested by domestic analysts who say they "do not capture the real scale of poverty". | [Euronews (2026-04-08)](https://www.euronews.com/culture/2026/04/08/kazakhstan-strengthens-social-protection-and-public-welfare) |
| A2 Contextual Sensitivity | 2/5 | The assistance system does differentiate — unconditional support for those unable to work through caregiving or disability, conditional support tied to employment programmes. But rigid eligibility criteria and means tests exclude many who need support. | [HRW — Kazakhstan's deeply flawed safety net](https://www.hrw.org/news/2022/10/26/perspectives-kazakhstans-deeply-flawed-safety-net) |
| A3 Blind Spot Mitigation | 1/5 | Blind-spot mitigation is actively rejected. In May 2025 Kazakhstan's Ombudsman issued a public statement against the country's Coalition Against Torture, calling information the group submitted to the UN Special Rapporteur on Torture "biased" and "non-credible". | [Amnesty International — Kazakhstan country report](https://www.amnesty.org/en/location/europe-and-central-asia/eastern-europe-and-central-asia/kazakhstan/report-kazakhstan/) |
| A4 Signal Amplification | 1/5 | Signal amplification is being dismantled rather than built. The former editor-in-chief of the independent outlet Orda was sentenced to eight years and banned for five years from "activities related to media, journalism, blogging, public events, and other forms of public engagement". | [CPJ (2026-08-18)](https://cpj.org/2026/08/kazakhstan-sentences-journalist-gulnara-bazhkenova-to-eight-years-in-prison-as-pre-election-press-crackdown-intensifies/) |
| A5 Anticipatory Awareness | 2/5 | Formal pre-legislative processes exist — the March 2026 constitutional changes went to a national referendum. But Amnesty International found the proposed text "reflects erosion of human rights standards and rule of law" and concentrates presidential power, so the process did not function as a harm assessment. | [Amnesty International (2026-03)](https://www.amnesty.org/en/latest/news/2026/03/kazakhstan-proposed-new-constitution-reflects-erosion-of-human-rights-standards-and-rule-of-law/) |

### EMP: Empathy (Raw 1.60/5 — Scaled 15/100)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| E1 Affective Resonance | 2/5 | Some state services are delivered with formal courtesy standards, but no independent evidence was found that people feel genuinely cared about rather than processed. | [Euronews (2026-04-08)](https://www.euronews.com/culture/2026/04/08/kazakhstan-strengthens-social-protection-and-public-welfare) |
| E2 Perspective-Taking | 2/5 | A referendum was held on the constitution, which is a formal consultation mechanism. Independent assessment found it entrenched executive power rather than reflecting public perspective. | [Amnesty International (2026-03)](https://www.amnesty.org/en/latest/news/2026/03/kazakhstan-proposed-new-constitution-reflects-erosion-of-human-rights-standards-and-rule-of-law/) |
| E3 Non-Judgment | 1/5 | Non-judgment fails under pressure. In January 2026 Amnesty International called on Kazakhstan to drop criminal charges against 19 activists affiliated with the Atajurt human rights movement who face up to 10 years in prison for participating in a peaceful protest. | [Amnesty International — Kazakhstan country report](https://www.amnesty.org/en/location/europe-and-central-asia/eastern-europe-and-central-asia/kazakhstan/report-kazakhstan/) |
| E4 Validation | 1/5 | Validation is inverted: torture testimony submitted to a UN Special Rapporteur was publicly labelled non-credible by the state's own human-rights ombudsman. | [Amnesty International — Kazakhstan country report](https://www.amnesty.org/en/location/europe-and-central-asia/eastern-europe-and-central-asia/kazakhstan/report-kazakhstan/) |
| E5 Cultural Empathy | 2/5 | State services operate in Kazakh and Russian and accommodate the country's main linguistic communities — a baseline adaptation rather than a co-designed one. | [Euronews (2026-04-08)](https://www.euronews.com/culture/2026/04/08/kazakhstan-strengthens-social-protection-and-public-welfare) |

### ACT: Action (Raw 2.00/5 — Scaled 25/100)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| AC1 Responsiveness | 2/5 | Standards exist for social assistance delivery but are not consistently met; recipients fell about 22 percent year on year, attributed by the state to improved incomes and by rights groups to tighter exclusion. | [Euronews (2026-04-08)](https://www.euronews.com/culture/2026/04/08/kazakhstan-strengthens-social-protection-and-public-welfare) |
| AC2 Proportionality | 2/5 | Needs assessment exists on paper through the two-track conditional and unconditional structure, but rigid means-testing means resources rather than need drive the response. | [HRW — Kazakhstan's deeply flawed safety net](https://www.hrw.org/news/2022/10/26/perspectives-kazakhstans-deeply-flawed-safety-net) |
| AC3 Efficacy | 2/5 | Some outcome data is collected and published (poverty rate, subsistence-minimum households) but domestic analysts dispute that it measures real poverty, and no independent review has been acted upon. | [Euronews (2026-04-08)](https://www.euronews.com/culture/2026/04/08/kazakhstan-strengthens-social-protection-and-public-welfare) |
| AC4 Resource Mobilization | 2/5 | Kazakhstan is an upper-middle-income state with real fiscal capacity and works with UNDP on social protection for vulnerable groups, but coverage of about 163,000 people is small relative to need. | [Euronews (2026-04-08)](https://www.euronews.com/culture/2026/04/08/kazakhstan-strengthens-social-protection-and-public-welfare) |
| AC5 Follow-Through | 2/5 | Follow-up exists in some cases through conditional assistance linked to employment programmes, but it is not systematic and outcomes are not published. | [HRW — Kazakhstan's deeply flawed safety net](https://www.hrw.org/news/2022/10/26/perspectives-kazakhstans-deeply-flawed-safety-net) |

### EQU: Equity (Raw 1.40/5 — Scaled 10/100)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| EQ1 Universality | 2/5 | Universal access to health and education is stated and largely delivered, but coverage of the social safety net is not measured against unmet need. | [Euronews (2026-04-08)](https://www.euronews.com/culture/2026/04/08/kazakhstan-strengthens-social-protection-and-public-welfare) |
| EQ2 Priority for Vulnerable | 2/5 | Priority for the vulnerable is stated through the unconditional assistance track for carers and disabled people, but allocation does not follow need: the caseload contracted 22 percent. | [HRW — Kazakhstan's deeply flawed safety net](https://www.hrw.org/news/2022/10/26/perspectives-kazakhstans-deeply-flawed-safety-net) |
| EQ3 Bias Awareness | 1/5 | No disaggregated outcome data on bias exists, and bias against civil-society groups is denied. The UN Human Rights Committee, reviewing Kazakhstan in July 2026, recorded concern about the "use of force and acts of torture against members of civil society". | [Amnesty International — Kazakhstan country report, reporting UN HRCttee July 2026 Concluding Observations](https://www.amnesty.org/en/location/europe-and-central-asia/eastern-europe-and-central-asia/kazakhstan/report-kazakhstan/) |
| EQ4 Access Design | 1/5 | Access barriers are not systematically removed; rigid eligibility criteria and means tests are the documented barrier and remain in place. | [HRW — Kazakhstan's deeply flawed safety net](https://www.hrw.org/news/2022/10/26/perspectives-kazakhstans-deeply-flawed-safety-net) |
| EQ5 Historical Harm Acknowledgment | 1/5 | Historical harm acknowledgment fails at the central test. On 17 January an Almaty Region court convicted six police officers of torturing detainees after the January 2022 protests that left 238 dead, sentencing each to three years — but impunity persisted for the majority of serious violations, and the government has not carried out a comprehensive investigation. | [Amnesty International — Kazakhstan country report](https://www.amnesty.org/en/location/europe-and-central-asia/eastern-europe-and-central-asia/kazakhstan/report-kazakhstan/) |

### BND: Boundaries (Raw 1.60/5 — Scaled 15/100)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| B1 Self-Sustainability | 2/5 | No public monitoring of frontline public-service staff wellbeing or turnover was located; scored at the absence-of-disclosure anchor, not as evidence of harm. | [Euronews (2026-04-08)](https://www.euronews.com/culture/2026/04/08/kazakhstan-strengthens-social-protection-and-public-welfare) |
| B2 Autonomy Preservation | 2/5 | Conditional assistance is explicitly tied to employment programmes, which is an autonomy-building design intent, but autonomy outcomes are not measured. | [Euronews (2026-04-08)](https://www.euronews.com/culture/2026/04/08/kazakhstan-strengthens-social-protection-and-public-welfare) |
| B3 Scope Clarity | 2/5 | Eligibility rules are published, so scope is communicated at intake, but rights groups report people discover exclusion only after applying. | [HRW — Kazakhstan's deeply flawed safety net](https://www.hrw.org/news/2022/10/26/perspectives-kazakhstans-deeply-flawed-safety-net) |
| B4 Refusal Ethics | 1/5 | Refusal ethics fail: applications are rejected under rigid means tests with no structured alternative pathway documented. | [HRW — Kazakhstan's deeply flawed safety net](https://www.hrw.org/news/2022/10/26/perspectives-kazakhstans-deeply-flawed-safety-net) |
| B5 Consent Orientation | 1/5 | Consent is a legal formality. The five-year ban on journalism, blogging and "other forms of public engagement" imposed on a convicted journalist shows the state treating consent and expression as revocable. | [CPJ (2026-08-18)](https://cpj.org/2026/08/kazakhstan-sentences-journalist-gulnara-bazhkenova-to-eight-years-in-prison-as-pre-election-press-crackdown-intensifies/) |

### ACC: Accountability (Raw 1.40/5 — Scaled 10/100)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| AB1 Harm Acknowledgment | 1/5 | Harm is denied. The state ombudsman attacked the body that documented torture rather than acknowledging the torture. | [Amnesty International — Kazakhstan country report](https://www.amnesty.org/en/location/europe-and-central-asia/eastern-europe-and-central-asia/kazakhstan/report-kazakhstan/) |
| AB2 Correction Willingness | 1/5 | Documented harmful practice continues and escalates. Since late July 2026 authorities arrested political satirist Azamat Omarov, sentenced journalists Aset Matayev, Amir Kasenov and Aleksandra Alyokhova, and opened criminal probes into Lukpan Akhmedyarov and Dinara Yegeubayeva. | [CPJ (2026-08-14)](https://cpj.org/2026/08/cpj-partners-sound-alarm-over-pre-election-media-crackdown-in-kazakhstan/) |
| AB3 Transparency | 1/5 | Transparency is contested rather than delivered; at least a dozen leading journalists reported coordinated blocking of accounts and removal of publications through spurious copyright claims. | [CPJ (2026-08-14)](https://cpj.org/2026/08/cpj-partners-sound-alarm-over-pre-election-media-crackdown-in-kazakhstan/) |
| AB4 Systemic Learning | 2/5 | Some systemic learning is evidenced: several dozen police officers have been convicted for torture tied to the January 2022 events, which is more than most peers in the region have done. | [Amnesty International — Kazakhstan country report](https://www.amnesty.org/en/location/europe-and-central-asia/eastern-europe-and-central-asia/kazakhstan/report-kazakhstan/) |
| AB5 Reparative Action | 2/5 | Reparative action exists in individual cases through the torture convictions, but is not systematic and is not considered adequate by the victims' representatives. | [HRW World Report 2026 — Kazakhstan](https://www.hrw.org/world-report/2026/country-chapters/kazakhstan) |

### SYS: Systemic Thinking (Raw 1.60/5 — Scaled 15/100)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| S1 Root Cause Orientation | 2/5 | Some resources go upstream through employment-linked assistance and poverty-reduction programming, but no documented case of reduced downstream need was located. | [Euronews (2026-04-08)](https://www.euronews.com/culture/2026/04/08/kazakhstan-strengthens-social-protection-and-public-welfare) |
| S2 Long-Term Impact | 2/5 | Long-horizon national development strategies exist and the constitutional reform was framed as a generational change, but the long-term outcome measurement is aspirational. | [Amnesty International (2026-03)](https://www.amnesty.org/en/latest/news/2026/03/kazakhstan-proposed-new-constitution-reflects-erosion-of-human-rights-standards-and-rule-of-law/) |
| S3 Interconnection Awareness | 1/5 | No evidence of systematic mapping of second-order effects; the pre-election media crackdown's effect on public information quality is not assessed by the state. | [IPHR joint NGO statement](https://iphronline.org/articles/kazakhstan-escalating-pressure-on-independent-journalists-ahead-of-parliamentary-elections-joint-ngo-statement/) |
| S4 Structural Critique | 1/5 | Structural critique is criminalised rather than practised. The UN Human Rights Committee urged Kazakhstan to narrow Article 174 of the Criminal Code so it does not "suppress protected conduct and speech". | [Amnesty International — Kazakhstan country report, reporting UN HRCttee July 2026 Concluding Observations](https://www.amnesty.org/en/location/europe-and-central-asia/eastern-europe-and-central-asia/kazakhstan/report-kazakhstan/) |
| S5 Coalitional Compassion | 2/5 | Kazakhstan participates in international coalitions including UNDP social-protection programming and OSCE election observation — a documented, largely receiving, coalition role. | [OSCE ODIHR — Kazakhstan, Early Parliamentary Elections, 23 August 2026](https://odihr.osce.org/node/666284) |

### INT: Integrity (Raw 1.20/5 — Scaled 5/100)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| I1 Consistency Under Pressure | 1/5 | Commitments are abandoned under political pressure. CPJ and eight local and international partners describe political pressure on independent media reaching "an unprecedented level" in the run-up to the vote. | [CPJ (2026-08-14)](https://cpj.org/2026/08/cpj-partners-sound-alarm-over-pre-election-media-crackdown-in-kazakhstan/) |
| I2 Non-Performance | 1/5 | Compassionate practice appears where it is reputationally beneficial. Kazakhstan promotes its social-protection record internationally while jailing the journalists who scrutinise it. | [Human Rights Watch — Kazakhstan: Journalism, free expression in further peril](https://www.hrw.org/news/2025/12/17/kazakhstan-journalism-free-expression-in-further-peril) |
| I3 Internal Consistency | 1/5 | Internal consistency fails: in December 2025 police searched the newsroom of Orda.kz and detained media workers. | [Human Rights Watch (2025-12-17)](https://www.hrw.org/news/2025/12/17/kazakhstan-journalism-free-expression-in-further-peril) |
| I4 Values Alignment | 1/5 | Decisions regularly contradict stated values without acknowledgment. The new constitution was presented as modernisation; Amnesty International calls it "a blatant attempt to concentrate presidential power". | [Amnesty International (2026-03)](https://www.amnesty.org/en/latest/news/2026/03/kazakhstan-proposed-new-constitution-reflects-erosion-of-human-rights-standards-and-rule-of-law/) |
| I5 Resilience of Care | 2/5 | Some core practices are embedded in policy and have survived the 2019 and 2022 leadership and constitutional transitions — notably the social-assistance architecture — so care is not purely personality-dependent. | [Euronews (2026-04-08)](https://www.euronews.com/culture/2026/04/08/kazakhstan-strengthens-social-protection-and-public-welfare) |

## Published Index Comparison

**Published index:** countries | **Published rank:** #140 | **Published composite:** 20.3/100 | **Published band:** developing

| Dimension | Published (raw) | Assessed (raw) | Difference (raw) |
|---|---|---|---|
| AWR | 2 | 1.60 | -0.40 |
| EMP | 2 | 1.60 | -0.40 |
| ACT | 2 | 2.00 | +0.00 |
| EQU | 1.5 | 1.40 | -0.10 |
| BND | 2 | 1.60 | -0.40 |
| ACC | 1.5 | 1.40 | -0.10 |
| SYS | 2 | 1.60 | -0.40 |
| INT | 1.5 | 1.20 | -0.30 |
| **Composite** | **20.3** | **13.7** | **-6.6** |

### Analysis

The assessed composite of 13.7 sits 6.6 points below the published 20.3 and crosses from Developing into Critical. Every dimension falls, but the falls are concentrated in Integrity (2.0 to 1.2), Equity (1.5 to 1.4), Accountability (1.5 to 1.4) and Awareness (2.0 to 1.6). Action holds at exactly 2.0 because Kazakhstan's social-assistance machinery is real and differentiated, which distinguishes it from the poorer members of its former seed cluster. The gap is a placeholder correction, not a decline: the published value was never measured against evidence and was shared identically with eleven other countries whose circumstances differ enormously.

## Key Findings

- Kazakhstan's published score of 20.3 was never a real assessment. It is a placeholder shared letter-for-letter with eleven other countries, from Algeria to Zimbabwe. This is the first time the benchmark has actually measured Kazakhstan.
- An Almaty court sentenced Gulnara Bazhkenova, former editor of the independent outlet Orda, to eight years in prison on 18 August 2026, plus a five-year ban on journalism, blogging and public engagement.
- Since late July 2026 Kazakhstan has arrested a political satirist, sentenced three more journalists, opened criminal cases against two others, and — per a nine-organisation joint statement — coordinated the removal of at least a dozen leading journalists' accounts and publications.
- The UN Human Rights Committee, reviewing Kazakhstan in July 2026, recorded concern about the use of force and torture against civil-society members and told Kazakhstan to narrow a criminal-code article that suppresses protected speech.
- Kazakhstan does run a real social safety net — about 163,000 people receive targeted assistance — but the caseload shrank 22 percent in a year and rights groups say rigid means tests exclude many who need help. That functioning machinery is why Kazakhstan scores above regional peers Azerbaijan (9.4) and Tajikistan (7.8).

## Strongest Dimensions

Action (ACT, raw 2.00) is the strongest dimension. Kazakhstan operates a genuinely two-track social-assistance system with published eligibility rules and outcome statistics — machinery most Critical-band countries do not have.

## Weakest Dimensions

Integrity (INT, raw 1.20) is the weakest. Four of its five subdimensions sit at the minimum: commitments abandoned under pre-election pressure, compassionate practice concentrated where it is reputationally useful, a newsroom raided in December 2025, and a constitution presented as modernisation that independent assessment calls a concentration of presidential power. Accountability (ACC, 1.40) and Equity (EQU, 1.40) follow, driven by the ombudsman's public rejection of torture testimony and by unresolved impunity for the 238 deaths of January 2022.

## Evidence Gaps

- The UN Human Rights Committee's July 2026 Concluding Observations were cited via Amnesty International's reproduction; the primary OHCHR document could not be retrieved directly, so the tier is recorded conservatively as 4 rather than 5.
- The most detailed independent analysis of the Targeted Social Assistance scheme dates to 2022; more recent independent evaluation was not located.
- No Kazakhstani government response to the CPJ joint statement or to the sentencing was located.
- Kazakhstan has never been individually assessed, so there is no prior pipeline baseline against which to test drift.

## Sources

- [CPJ — Kazakhstan sentences journalist Gulnara Bazhkenova to eight years (2026-08-18)](https://cpj.org/2026/08/kazakhstan-sentences-journalist-gulnara-bazhkenova-to-eight-years-in-prison-as-pre-election-press-crackdown-intensifies/)
- [CPJ — CPJ, partners sound alarm over pre-election media crackdown in Kazakhstan (2026-08-14)](https://cpj.org/2026/08/cpj-partners-sound-alarm-over-pre-election-media-crackdown-in-kazakhstan/)
- [IPHR — Kazakhstan: Escalating pressure on independent journalists ahead of parliamentary elections, joint NGO statement](https://iphronline.org/articles/kazakhstan-escalating-pressure-on-independent-journalists-ahead-of-parliamentary-elections-joint-ngo-statement/)
- [Vlast.kz — Rights watchdogs condemn sentencing of Kazakhstani journalist](https://vlast.kz/english/70524-rights-watchdogs-condemn-sentencing-of-kazakhstani-journalist.html)
- [Amnesty International — Kazakhstan: Proposed new Constitution reflects erosion of human rights standards (2026-03)](https://www.amnesty.org/en/latest/news/2026/03/kazakhstan-proposed-new-constitution-reflects-erosion-of-human-rights-standards-and-rule-of-law/)
- [Amnesty International — Human rights in Kazakhstan (country report, incl. July 2026 UN HRCttee observations)](https://www.amnesty.org/en/location/europe-and-central-asia/eastern-europe-and-central-asia/kazakhstan/report-kazakhstan/)
- [Human Rights Watch — World Report 2026: Kazakhstan](https://www.hrw.org/world-report/2026/country-chapters/kazakhstan)
- [Human Rights Watch — Kazakhstan: Journalism, free expression in further peril (2025-12-17)](https://www.hrw.org/news/2025/12/17/kazakhstan-journalism-free-expression-in-further-peril)
- [OSCE ODIHR — Kazakhstan, Early Parliamentary Elections, 23 August 2026](https://odihr.osce.org/node/666284)
- [Euronews — Kazakhstan strengthens social protection and public welfare (2026-04-08)](https://www.euronews.com/culture/2026/04/08/kazakhstan-strengthens-social-protection-and-public-welfare)
- [Human Rights Watch — Perspectives: Kazakhstan's deeply flawed safety net](https://www.hrw.org/news/2022/10/26/perspectives-kazakhstans-deeply-flawed-safety-net)

## Recommended Next Steps

**Critical band.** A [Certified Assessment](/certified-assessments) would give a structured improvement roadmap. Institutional next step: extend the 20.3 de-seeding programme to the remaining eight cluster members — Algeria, Cameroon, Gabon, Guinea, Honduras, Papua New Guinea, Republic of Congo and Uzbekistan.

## Disclaimer

This assessment is based on publicly available information and does not constitute a formal Compassion Benchmark Certified Assessment. For a comprehensive, assessor-led evaluation, visit compassionbenchmark.com/certified-assessments.
