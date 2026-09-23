---
entity: "CenterPoint Energy"
type: "Company"
sector: "Utilities (electric and gas delivery)"
date: "2026-09-21"
composite_score: 33.8
band: "Developing"
scores:
  AWR: 2.2
  EMP: 2.2
  ACT: 2.4
  EQU: 2.4
  BND: 2.2
  ACC: 2.6
  SYS: 2.4
  INT: 2.4
published_index: "fortune-500"
published_rank: 199
published_composite: 35.9
published_band: "developing"
published_dimensions:
  AWR: 2.5
  EMP: 2.5
  ACT: 2.5
  EQU: 2.0
  BND: 2.5
  ACC: 2.5
  SYS: 2.5
  INT: 2.5
assessed_composite: 33.8
score_delta: -2.1
band_change: false
filing_trigger_met: false
outcome: "confirmation"
assessment_type: "first-ever full baseline (40 subdimensions)"
recommendation: "confirm"
change_proposal: false
confidence: "medium"
subdim_sidecar: true
watch_flag: true
source: "priority"
scan_file: "research/scans/2026-09-21.json"
methodology_version: "v1.2"
---

# Compassion Benchmark Assessment: CenterPoint Energy

**Entity type:** Company (regulated electric and gas utility, 8 states, 7M+ metered customers)
**Assessment date:** 2026-09-21
**Composite score:** 33.8/100
**Band:** Developing
**Published:** 35.9/100 (Developing), fortune-500 rank 199

> This assessment is based on publicly available information and does not constitute a formal Compassion Benchmark Certified Assessment. For a comprehensive, assessor-led evaluation, visit compassionbenchmark.com/certified-assessments.

## Why this entity was assessed

The scanner flagged CenterPoint on the legal and disclosure response to a customer-data breach: at least five proposed federal class actions filed 10–13 September 2026, and an SEC Form 8-K filed 14 September 2026. CenterPoint has never been assessed before (`last_assessed: null`), so this is a first-ever full baseline resting on the public record, not only on in-window evidence.

## Evidence-quality discipline applied

**The 8-K is the firm fact; the class actions are allegations.** Five proposed federal class actions were filed between 10 and 13 September 2026 by Shamis & Gentile and Lippe & Associates for customers in Texas, Indiana and Minnesota, pleading that the utility "failed to maintain basic data security standards." Nothing in those complaints has been decided. They are scored as allegations only.

The firmer fact is CenterPoint's own disclosure. Its Form 8-K of 14 September 2026 confirms "a portion of its customers' personal information was stolen in a data breach earlier this month." That is a tier-5 primary document — the company's own statement to a securities regulator — and it establishes that a breach occurred.

**The 7.49M-record figure is NOT used.** That number is a threat actor's claim. The scanner's third source (cyberinsider.com) is undated and carries `date_verified: false`; it is not relied on anywhere in this assessment. CenterPoint has not confirmed the figure or the dataset's authenticity. The claimed API weaknesses ("no web application firewall, no rate limiting, no certification checks, and no authentication token") are also the claimant's characterisation, reported at tier 2, and are weighted as such.

## Score Summary

| Dimension | Code | Raw (1–5) | Scaled (0–100) | Band |
|---|---|---|---|---|
| Awareness | AWR | 2.2 | 30.0 | Developing |
| Empathy | EMP | 2.2 | 30.0 | Developing |
| Action | ACT | 2.4 | 35.0 | Developing |
| Equity | EQU | 2.4 | 35.0 | Developing |
| Boundaries | BND | 2.2 | 30.0 | Developing |
| Accountability | ACC | 2.6 | 40.0 | Developing |
| Systemic Thinking | SYS | 2.4 | 35.0 | Developing |
| Integrity | INT | 2.4 | 35.0 | Developing |
| **Composite** | — | **2.35 mean** | **33.8** | **Developing** |

Integration premium 0.0 (all eight dimensions below 4.0, so `weaknessFactor` = 0).

## Dimension Details

### AWR: Awareness (2.2/5)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| A1 Suffering Detection | 2/5 | The breach was surfaced by a threat actor's public claim, not by CenterPoint's own monitoring. The Texas PUC's Hurricane Beryl investigative report was externally initiated. Reactive detection. | helpnetsecurity 2026-09-16; Texas PUC report 2024-11-23 |
| A2 Contextual Sensitivity | 3/5 | Differentiated programmes for income-qualified households: LIHEAP, the Gas Affordability Program, the Customer Assistance Fund, and Indiana levelized-billing auto-enrolment under HEA 1002. Genuine adaptation with gaps. | centerpointenergy.com assistance programs; 14news 2026-04-01 |
| A3 Blind Spot Mitigation | 2/5 | Findings came from the PUC, not from internal assessment; an internet-facing customer API was reportedly exposed. Acknowledgment in principle only. | helpnetsecurity 2026-09-16; PUC report |
| A4 Signal Amplification | 2/5 | Low-power customer concerns surfaced through a Minnesota PUC complaint and an advocacy investigation, not a company channel. | energyandpolicy.org |
| A5 Anticipatory Awareness | 2/5 | 2.2M customers lost power in Beryl; prolonged outages contributed to 40-plus regional deaths. No evidence of pre-deployment security review of the customer API. | utilitydive 2025-01-31; helpnetsecurity |

### EMP: Empathy (2.2/5)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| E1 Affective Resonance | 2/5 | Documented billing disputes in which payments were applied to an unregulated business before regulated gas charges. Transactional handling. | energyandpolicy.org |
| E2 Perspective-Taking | 3/5 | The $3.2B resiliency settlement was negotiated with Houston-area cities after CenterPoint withdrew a rate increase; a formal mechanism changed a decision. | Houston Public Media 2025-06-17 |
| E3 Non-Judgment | 2/5 | EEI/AGA ESG template reporting exists but no disaggregated service-outcome data by population. | sustainability.centerpointenergy.com |
| E4 Validation | 2/5 | The 8-K acknowledged the theft but framed it around "no material impact on the Company's financial condition"; the customer harm is described second. | helpnetsecurity 2026-09-16; hoodline |
| E5 Cultural Empathy | 2/5 | Multi-state footprint with translated materials; no evidence of co-designed cultural adaptation. | sustainability.centerpointenergy.com |

### ACT: Action (2.4/5)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| AC1 Responsiveness | 2/5 | Beryl restoration ran a week or more for hundreds of thousands of customers; standards existed but were not met. | utilitydive; PUC report |
| AC2 Proportionality | 2/5 | Independent reporting questioned whether the multi-billion upgrade plan would prevent outages. Needs assessment on paper. | houstonlanding.org |
| AC3 Efficacy | 2/5 | Same: outcome doubt is documented publicly and by the PUC audit; limited published outcome measurement. | houstonlanding.org |
| AC4 Resource Mobilization | 3/5 | A $5.75B systemwide resiliency plan proposed, settled at $3.2B with Houston-area cities; a documented attempt to mobilise additional resources. | Houston Public Media |
| AC5 Follow-Through | 3/5 | Greater Houston Resiliency Initiative plus a three-year system resiliency plan starting 2026. Defined protocols. | Houston Public Media; utilitydive |

### EQU: Equity (2.4/5)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| EQ1 Universality | 2/5 | Universal service obligation, but documented disconnections of customers actively paying. Coverage not measured against need. | energyandpolicy.org |
| EQ2 Priority for Vulnerable | 3/5 | The Gas Affordability Program credits current gas charges above 6% of annual household income — a documented prioritisation rule. | centerpointenergy.com |
| EQ3 Bias Awareness | 2/5 | Some workforce disaggregation via EEO filings; no service-outcome disparity investigation located. | sustainability.centerpointenergy.com |
| EQ4 Access Design | 2/5 | Billing practices that placed paying customers at disconnection risk created an access barrier rather than removing one. | energyandpolicy.org |
| EQ5 Historical Harm Acknowledgment | 3/5 | Beryl failure formally acknowledged; rate increase withdrawn; resiliency programme negotiated with affected cities. | Houston Public Media; PUC report |

### BND: Boundaries (2.2/5)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| B1 Self-Sustainability | 2/5 | No public turnover or frontline-wellbeing data located. Evidence gap; scored at the lower anchor. | sustainability.centerpointenergy.com |
| B2 Autonomy Preservation | 2/5 | Efficiency and weatherization offerings exist; autonomy outcomes not measured. | centerpointenergy.com |
| B3 Scope Clarity | 2/5 | Breach scope still unconfirmed a week after disclosure; customers cannot establish their own exposure. | hoodline |
| B4 Refusal Ethics | 3/5 | Disconnection is paired with structured referral: the Customer Assistance Fund runs through The Salvation Army with case management. | salvationarmyusa.org |
| B5 Consent Orientation | 2/5 | Cross-sold unregulated Home Service Plus charges applied ahead of regulated gas charges — forms serving the institution. | energyandpolicy.org |

### ACC: Accountability (2.6/5)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| AB1 Harm Acknowledgment | 2/5 | Acknowledgment followed external establishment: the threat-actor claim and five filed class actions preceded the 14 September 8-K. | hoodline; helpnetsecurity |
| AB2 Correction Willingness | 3/5 | Rate increase withdrawn, GHRI launched, resiliency plan settled after the Beryl harm was documented. One significant course correction. | Houston Public Media |
| AB3 Transparency | 3/5 | Publishes a corporate sustainability report, an ESG data centre and EEI/AGA template reports; disclosed the breach in an 8-K. | sustainability.centerpointenergy.com; hoodline |
| AB4 Systemic Learning | 3/5 | PUC recommendations translated into a multi-year hardening programme. Formal systemic review with documented changes. | PUC report; Houston Public Media |
| AB5 Reparative Action | 2/5 | No repair located for Beryl-affected households; no credit monitoring announced for breach-affected customers as of this date. Gesture-level only. | hoodline |

### SYS: Systemic Thinking (2.4/5)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| S1 Root Cause Orientation | 3/5 | Grid hardening and undergrounding address a root cause of outage suffering, with real resources attached. | Houston Public Media |
| S2 Long-Term Impact | 3/5 | Multi-state emissions-reduction commitment and a three-year resiliency plan; specific long-term goals with some tracking. | sustainability.centerpointenergy.com |
| S3 Interconnection Awareness | 2/5 | Beryl exposed coordination failures with local emergency management; adjacent systems identified but not systematically tracked. | PUC report |
| S4 Structural Critique | 1/5 | No public position located that questions the regulated-monopoly structure sustaining the harm; documented lobbying runs the other way. | energyandpolicy.org |
| S5 Coalitional Compassion | 3/5 | Mutual-assistance arrangements with peer utilities; assistance delivered through The Salvation Army and state agencies. | salvationarmyusa.org |

### INT: Integrity (2.4/5)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| I1 Consistency Under Pressure | 2/5 | The rate-increase reversal came under political pressure rather than as a commitment held at cost; the 8-K leads with no material financial impact. | helpnetsecurity |
| I2 Non-Performance | 3/5 | LIHEAP, GAP and the Customer Assistance Fund are long-standing and maintained regardless of visibility. | centerpointenergy.com; salvationarmyusa.org |
| I3 Internal Consistency | 2/5 | No independent internal-culture evidence located. Evidence gap; lower anchor. | sustainability.centerpointenergy.com |
| I4 Values Alignment | 2/5 | Deceptive billing practice and a reportedly unauthenticated customer API sit against stated customer-first values, without acknowledgment. | energyandpolicy.org; helpnetsecurity |
| I5 Resilience of Care | 3/5 | Assistance programmes and the resiliency programme persisted through the post-Beryl leadership change. | Houston Public Media |

## Published Index Comparison

**Published index:** fortune-500 | **Rank:** #199 of 447 | **Published composite:** 35.9 | **Published band:** developing

| Dimension | Published (raw) | Research (raw) | Difference (raw) |
|---|---|---|---|
| AWR | 2.5 | 2.2 | −0.3 |
| EMP | 2.5 | 2.2 | −0.3 |
| ACT | 2.5 | 2.4 | −0.1 |
| EQU | 2.0 | 2.4 | +0.4 |
| BND | 2.5 | 2.2 | −0.3 |
| ACC | 2.5 | 2.6 | +0.1 |
| SYS | 2.5 | 2.4 | −0.1 |
| INT | 2.5 | 2.4 | −0.1 |
| **Composite** | **35.9** | **33.8** | **−2.1** |

No dimension differs by more than 10 scaled points. The published vector is a flat 2.5 across seven dimensions with EQU at 2.0 — a pattern consistent with an unresearched seed rather than a measurement. This first researched baseline lands 2.1 points below it and moves EQU up (the income-based affordability rules are real) while moving AWR, EMP and BND down.

**Math hygiene:** canonical reconstruction of the published dimension set returns exactly 35.9. No math-hygiene issue.

**Baseline drift:** `research/rotation-state.json` records rank 204 for CenterPoint; the index records rank 199. Composite and band agree. Rank drift reported, not written (rotation-state rank is outside this stage's write scope).

## Anti-false-positive screening (§3e-bis)

1. **Baseline provenance.** `research/APPLIED_CHANGES.md` contains no CenterPoint entry and there is no prior assessment on disk. The published 35.9 is an original extraction value, never revised. No history is contradicted.
2. **No stale-baseline rationale used.** The finding rests on current conduct, not on the age of the score.
3. **Directionality.** Surfaced on negative evidence; the measurement moved down. No upgrade taken.
4. **Rationale consistency.** Nothing in the record conflicts.
5. **Not a calibration case.** The −2.1 gap is within measurement noise for a first baseline.

**No filing trigger.** Delta −2.1 (below 5.0) and band unchanged (Developing → Developing). No change proposal is written.

## Key Findings

- Why it matters: CenterPoint told a securities regulator that customers' personal data was stolen. Its Form 8-K of 14 September 2026 says "a portion of its customers' personal information was stolen in a data breach earlier this month." That is the company's own word, and it is the firm fact here.
- Why it matters: the 7.49 million figure in circulation is a hacker's claim, not a confirmed count. CenterPoint has not verified it. This assessment does not use it, and neither should anyone quoting this score.
- Why it matters: five customer lawsuits were filed before the company disclosed. Filings ran 10 to 13 September 2026; the 8-K came on 14 September. Acknowledgment followed outside pressure, which is why Harm Acknowledgment scores 2 of 5.
- Why it matters: the affordability rules are the strongest thing here. CenterPoint credits gas charges above 6% of a household's yearly income, and Indiana now auto-enrols low-income customers in level billing. That lifted Equity above its published value.
- Why it matters: the 2024 Hurricane Beryl failure still sets the profile. Prolonged outages contributed to more than 40 regional deaths, and the $3.2 billion resiliency settlement is a correction made under regulatory pressure, not a self-started one.

## Strongest Dimensions

- **Accountability (2.6)** — the only dimension above the published value on the strength of published ESG reporting, the 8-K, and the PUC-driven systemic changes.
- **Action / Equity / Systemic Thinking / Integrity (2.4)** — carried by the $3.2B resiliency settlement and long-standing income-based affordability rules.

## Weakest Dimensions

- **Awareness, Empathy, Boundaries (2.2)** — problems are found by outsiders. The breach came from a threat actor's post, the Beryl failures from a state regulator, and the billing problems from an advocacy investigation and a customer's regulatory complaint.
- **S4 Structural Critique (1/5)** is the single lowest subdimension: no public position located that questions the structure sustaining the harm.

## Evidence Gaps

- The Form 8-K itself was not fetched from EDGAR; its content is read through two dated secondary reports.
- No breach notification letter, credit-monitoring offer, or affected-customer count has been published.
- No turnover, burnout or internal-culture data was located (B1, I3 scored at the lower anchor for absence).
- The Minnesota PUC docket on Home Service Plus payment allocation was not read directly.

## Watch Flag

Re-test AB1, AB5 and B3 when CenterPoint publishes its breach notification and any credit-monitoring offer, and on the affected-customer count. Re-test AC1 and A5 on the first named-storm season under the 2026–2028 resiliency plan. Re-test B5 and I4 on the Minnesota PUC's disposition of the Home Service Plus payment-allocation reforms. A confirmed CenterPoint disclosure of a multi-million-record breach with no reparative offer would make AB5 and B3 filable.

## Sources

- https://www.helpnetsecurity.com/2026/09/16/centerpoint-energy-data-breach-hacker-claims/ (tier 2, 2026-09-16)
- https://hoodline.com/2026/09/centerpoint-breach-may-have-hit-7-5-million-records-lawsuits-already-piling-up/ (tier 2, 2026-09-16)
- https://www.gilmermirror.com/2024/11/23/public-utility-commission-releases-investigative-report-on-centerpoint-energys-hurricane-beryl-response/ (tier 5, 2024-11-23)
- https://www.houstonpublicmedia.org/articles/infrastructure/2025/06/17/524284/centerpoint-energy-reaches-3-2-billion-resiliency-plan-agreement-with-houston-area-cities/ (tier 2, 2025-06-17)
- https://www.utilitydive.com/news/centerpoint-proposes-system-resiliency-plan-Houston/739125/ (tier 2, 2025)
- https://www.houstonlanding.org/centerpoint-has-a-2-2-billion-plan-for-avoiding-another-power-outage-disaster-will-it-help/ (tier 2)
- https://energyandpolicy.org/centerpoint-home-service-plus/ (tier 3)
- https://www.centerpointenergy.com/en-us/my-account/billing-payment/assistance-programs (tier 3)
- https://sustainability.centerpointenergy.com/esg-data-center/eei-aga-esg-reports/ (tier 4)
- https://www.salvationarmyusa.org/usa-central-territory/indiana/centerpoint-energy-assistance/ (tier 3)
- https://www.14news.com/2026/04/01/centerpoint-energy-making-billing-changes-some-customers-under-new-state-law/ (tier 2, 2026-04-01)
- NOT USED: https://cyberinsider.com/centerpoint-energy-confirms-data-breach-after-hacker-claims-7-49m-records/ (undated, `date_verified: false`)

**Sidecar:** `research/assessments/centerpoint-energy-2026-09-21.subdims.json`

## Recommended Next Steps

Developing band: consider a [Certified Assessment](/certified-assessments) for a structured improvement roadmap.
