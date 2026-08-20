---
entity: "Home Depot"
type: "Company"
sector: "Retail"
date: "2026-08-18"
composite_score: 41.3
band: "Functional"
scores:
  AWR: 2.8
  EMP: 2.6
  ACT: 3.2
  EQU: 2.6
  BND: 2.6
  ACC: 2.2
  SYS: 2.6
  INT: 2.6
published_index: "fortune-500"
published_rank: 64
published_composite: 57.8
published_band: "Functional"
assessment_type: "first full assessment"
recommendation: "flag-for-review"
confidence: "medium"
change_proposal: true
score_delta: -16.5
band_change: false
source: "rotation"
scan_file: "research/scans/2026-08-18.json"
watch_flag: "first measurement of an original-build baseline — no in-window evidence drove the movement"
---

# Compassion Benchmark Assessment: Home Depot

**Entity type:** Company
**Sector/Domain:** Retail
**Assessment date:** 2026-08-18
**Composite score:** 41.3/100
**Band:** Functional
**Cycle source:** rotation (scan `research/scans/2026-08-18.json`)

## Why this entity was assessed

Home Depot entered this cycle on rotation, not on evidence. The scanner searched it individually and found no compassion-relevant evidence in the 14-day window, recommending reassessment on staleness grounds alone (`last_assessed: null`). This is therefore a first full assessment.

## Evidence-date and attribution checks

**Baseline provenance — checked before any proposal, per the anti-false-positive screen.** Home Depot's published composite of 57.8 carries a **unique** dimension vector in `fortune-500.json`; it is not part of the 22-company 60.9 seed cluster. There is no entry for Home Depot in `research/APPLIED_CHANGES.md` and no prior assessment file. The 57.8 therefore originates from the **original index build**, not from a nightly-pipeline assessment. It is a differentiated but never-evidenced value.

**Directionality — recorded honestly.** There was **no in-window evidence** of any kind. This assessment is a first measurement against the two-to-three-year evidence horizon, not a response to new conduct. No "stale baseline" rationale is used; the claim is simply that the value has never been measured against this methodology.

**Attribution.** All findings scored here are Home Depot's own conduct: its litigation position, its layoff notice, its consumer and privacy litigation exposure, its associate programmes.

## Score Summary

| Dimension | Code | Raw (1-5) | Scaled (0-100) | Band |
|---|---|---|---|---|
| Awareness | AWR | 2.80 | 45 | Functional |
| Empathy | EMP | 2.60 | 40 | Developing |
| Action | ACT | 3.20 | 55 | Functional |
| Equity | EQU | 2.60 | 40 | Developing |
| Boundaries | BND | 2.60 | 40 | Developing |
| Accountability | ACC | 2.20 | 30 | Developing |
| Systemic Thinking | SYS | 2.60 | 40 | Developing |
| Integrity | INT | 2.60 | 40 | Developing |
| **Composite** | — | — | **41.3** | **Functional** |

Integration premium applied: 0. Composite computed with the canonical `computeCompositeFromDimensions` implementation in `site/scripts/lib/scoring.mjs`; it is not a simple mean of the eight dimensions.

## Dimension Details

### AWR: Awareness (Raw 2.80/5 — Scaled 45/100)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| A1 Suffering Detection | 3/5 | Associate engagement surveys and an open-door mechanism are described in the published ESG report; detection is proactive but inconsistent, and the first union petition was driven by wage and condition concerns the company had not surfaced. | [The Home Depot — 2022 ESG Report (self-published)](https://corporate.homedepot.com/sites/default/files/2022-08/2022_ESG_Report_FINAL_0.pdf) — tier 3, 2022-08-01 |
| A2 Contextual Sensitivity | 3/5 | Differentiated provision exists across store, distribution and corporate populations; adaptation is largely on request. | [The Home Depot — 2022 ESG Report (self-published)](https://corporate.homedepot.com/sites/default/files/2022-08/2022_ESG_Report_FINAL_0.pdf) — tier 3, 2022-08-01 |
| A3 Blind Spot Mitigation | 2/5 | No structured process for identifying who is missed is published, and no finding from one is disclosed. Absence of disclosure, scored at the low anchor. | [The Home Depot — 2022 ESG Report (self-published)](https://corporate.homedepot.com/sites/default/files/2022-08/2022_ESG_Report_FINAL_0.pdf) — tier 3, 2022-08-01 |
| A4 Signal Amplification | 3/5 | The Homer Fund provides a direct route for associates in hardship to reach the company, and it operates at scale. | [The Home Depot — 2022 ESG Report (self-published)](https://corporate.homedepot.com/sites/default/files/2022-08/2022_ESG_Report_FINAL_0.pdf) — tier 3, 2022-08-01 |
| A5 Anticipatory Awareness | 3/5 | Pre-decision assessment is evidenced for store and supply-chain decisions; the January 2026 Atlanta mass layoff was notified under the WARN Act, which is a legal minimum rather than an assessment. | [Strauss Borrelli — Home Depot Atlanta WARN Act mass-layoff notice](https://straussborrelli.com/2026/01/30/home-depot-atlanta-warn-act-investigation/) — tier 2, 2026-01-30 |

### EMP: Empathy (Raw 2.60/5 — Scaled 40/100)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| E1 Affective Resonance | 3/5 | Frontline training investment is substantial — 10 million hours committed to associates and 2.5 million to leaders by 2028 — and supports a consistent, non-transactional expectation. | [PR Newswire — The Home Depot publishes its ESG report and training goals](https://www.prnewswire.com/news-releases/the-home-depot-publishes-esg-report-announces-new-goals-to-reduce-carbon-emissions-invests-more-training-in-frontline-associates-and-leaders-301886849.html) — tier 2, 2023-07-25 |
| E2 Perspective-Taking | 3/5 | The ESG report describes mechanisms that have modified decisions; associates are consulted rather than deciding. | [The Home Depot — 2022 ESG Report (self-published)](https://corporate.homedepot.com/sites/default/files/2022-08/2022_ESG_Report_FINAL_0.pdf) — tier 3, 2022-08-01 |
| E3 Non-Judgment | 2/5 | Home Depot litigated to the Eighth Circuit to defend restrictions on employees wearing union insignia. Non-judgment under pressure is stated but not demonstrated. | [Duane Morris — Eighth Circuit decision in Home Depot U.S.A., Inc. v. NLRB on union insignia](https://www.duanemorris.com/articles/national_labor_relations_act_protections_special_circumstances_home_depot_0226.html) — tier 5, 2025-11-01 |
| E4 Validation | 2/5 | Concerns are received through formal channels; acknowledgment does not structurally precede investigation. | [The Home Depot — 2022 ESG Report (self-published)](https://corporate.homedepot.com/sites/default/files/2022-08/2022_ESG_Report_FINAL_0.pdf) — tier 3, 2022-08-01 |
| E5 Cultural Empathy | 3/5 | Cultural adaptation is evidenced across a large multilingual workforce and customer base. | [The Home Depot — 2022 ESG Report (self-published)](https://corporate.homedepot.com/sites/default/files/2022-08/2022_ESG_Report_FINAL_0.pdf) — tier 3, 2022-08-01 |

### ACT: Action (Raw 3.20/5 — Scaled 55/100)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| AC1 Responsiveness | 3/5 | Response standards exist across store operations and are met for most cases, with some frontline escalation authority. | [The Home Depot — 2022 ESG Report (self-published)](https://corporate.homedepot.com/sites/default/files/2022-08/2022_ESG_Report_FINAL_0.pdf) — tier 3, 2022-08-01 |
| AC2 Proportionality | 3/5 | Needs assessment genuinely informs the Homer Fund and disaster response in most cases. | [The Home Depot — 2022 ESG Report (self-published)](https://corporate.homedepot.com/sites/default/files/2022-08/2022_ESG_Report_FINAL_0.pdf) — tier 3, 2022-08-01 |
| AC3 Efficacy | 3/5 | Outcome data is reviewed annually through the ESG reporting cycle and at least one programme has been modified. | [Home Improvement Retailer — The Home Depot releases ESG report details](https://www.homeimprovementretailer.com/the-home-depot-releases-esg-report-details/) — tier 2, 2023-07-26 |
| AC4 Resource Mobilization | 4/5 | Approximately $739 million paid in bonuses to non-management employees, plus 10 million committed training hours for frontline associates — documented reallocation at scale against a stated need. | [PR Newswire — The Home Depot publishes its ESG report and training goals](https://www.prnewswire.com/news-releases/the-home-depot-publishes-esg-report-announces-new-goals-to-reduce-carbon-emissions-invests-more-training-in-frontline-associates-and-leaders-301886849.html) — tier 2, 2023-07-25 |
| AC5 Follow-Through | 3/5 | Defined follow-through protocols exist for associate hardship and disaster response; longitudinal outcome data is not published. | [The Home Depot — 2022 ESG Report (self-published)](https://corporate.homedepot.com/sites/default/files/2022-08/2022_ESG_Report_FINAL_0.pdf) — tier 3, 2022-08-01 |

### EQU: Equity (Raw 2.60/5 — Scaled 40/100)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| EQ1 Universality | 3/5 | Coverage of associate benefit programmes is reported for some populations with active outreach; near-universal coverage is not evidenced. | [The Home Depot — 2022 ESG Report (self-published)](https://corporate.homedepot.com/sites/default/files/2022-08/2022_ESG_Report_FINAL_0.pdf) — tier 3, 2022-08-01 |
| EQ2 Priority for Vulnerable | 3/5 | The Homer Fund is an explicit prioritisation mechanism directing resources to associates in acute hardship. | [The Home Depot — 2022 ESG Report (self-published)](https://corporate.homedepot.com/sites/default/files/2022-08/2022_ESG_Report_FINAL_0.pdf) — tier 3, 2022-08-01 |
| EQ3 Bias Awareness | 2/5 | No disaggregated outcome data on who receives promotion, discipline or benefit awards is published. Absence of disclosure, scored at the low anchor. | [The Home Depot — 2022 ESG Report (self-published)](https://corporate.homedepot.com/sites/default/files/2022-08/2022_ESG_Report_FINAL_0.pdf) — tier 3, 2022-08-01 |
| EQ4 Access Design | 3/5 | Access-barrier work is evidenced in the training and benefits programmes, with at least two barriers removed. | [PR Newswire — The Home Depot publishes its ESG report and training goals](https://www.prnewswire.com/news-releases/the-home-depot-publishes-esg-report-announces-new-goals-to-reduce-carbon-emissions-invests-more-training-in-frontline-associates-and-leaders-301886849.html) — tier 2, 2023-07-25 |
| EQ5 Historical Harm Acknowledgment | 2/5 | Historical harms — including a $1.7 million civil penalty in September 2024 for charging above advertised prices — are acknowledged only in settlement terms, not as harms. | [Home Improvement Retailer — The Home Depot releases ESG report details](https://www.homeimprovementretailer.com/the-home-depot-releases-esg-report-details/) — tier 2, 2023-07-26 |

### BND: Boundaries (Raw 2.60/5 — Scaled 40/100)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| B1 Self-Sustainability | 3/5 | Turnover is tracked and structural interventions exist through the training and bonus programmes; sustainability is not independently assessed. | [PR Newswire — The Home Depot publishes its ESG report and training goals](https://www.prnewswire.com/news-releases/the-home-depot-publishes-esg-report-announces-new-goals-to-reduce-carbon-emissions-invests-more-training-in-frontline-associates-and-leaders-301886849.html) — tier 2, 2023-07-25 |
| B2 Autonomy Preservation | 3/5 | Training and tuition programmes are designed to build associate capacity and mobility. | [PR Newswire — The Home Depot publishes its ESG report and training goals](https://www.prnewswire.com/news-releases/the-home-depot-publishes-esg-report-announces-new-goals-to-reduce-carbon-emissions-invests-more-training-in-frontline-associates-and-leaders-301886849.html) — tier 2, 2023-07-25 |
| B3 Scope Clarity | 3/5 | Scope is communicated at intake for associate programmes and structured referral exists. | [The Home Depot — 2022 ESG Report (self-published)](https://corporate.homedepot.com/sites/default/files/2022-08/2022_ESG_Report_FINAL_0.pdf) — tier 3, 2022-08-01 |
| B4 Refusal Ethics | 2/5 | No structured refusal-with-alternatives protocol is published for associates affected by the January 2026 Atlanta mass layoff. | [Strauss Borrelli — Home Depot Atlanta WARN Act mass-layoff notice](https://straussborrelli.com/2026/01/30/home-depot-atlanta-warn-act-investigation/) — tier 2, 2026-01-30 |
| B5 Consent Orientation | 2/5 | Consent practice is contested: class actions filed in 2026 allege licence-plate-reading cameras in California car parks shared driver data with law enforcement, and that hidden trackers in marketing emails collected recipient data without proper consent. | [Home Improvement Retailer — The Home Depot releases ESG report details](https://www.homeimprovementretailer.com/the-home-depot-releases-esg-report-details/) — tier 2, 2023-07-26 |

### ACC: Accountability (Raw 2.20/5 — Scaled 30/100)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| AB1 Harm Acknowledgment | 2/5 | Harm is acknowledged after external establishment rather than before it, including in the 2024 pricing penalty. | [Home Improvement Retailer — The Home Depot releases ESG report details](https://www.homeimprovementretailer.com/the-home-depot-releases-esg-report-details/) — tier 2, 2023-07-26 |
| AB2 Correction Willingness | 2/5 | Correction comes under pressure and is minimal: a March 2026 consumer class action echoes the same deceptive-checkout complaints that produced the September 2024 penalty. | [Home Improvement Retailer — The Home Depot releases ESG report details](https://www.homeimprovementretailer.com/the-home-depot-releases-esg-report-details/) — tier 2, 2023-07-26 |
| AB3 Transparency | 3/5 | The annual ESG report discloses progress against stated goals including shortfalls, which clears the "at least one report disclosing an unflattering finding" anchor. | [PR Newswire — The Home Depot publishes its ESG report and training goals](https://www.prnewswire.com/news-releases/the-home-depot-publishes-esg-report-announces-new-goals-to-reduce-carbon-emissions-invests-more-training-in-frontline-associates-and-leaders-301886849.html) — tier 2, 2023-07-25 |
| AB4 Systemic Learning | 2/5 | Post-incident review exists; the recurrence of the pricing complaint indicates it does not reliably translate into systemic change. | [Home Improvement Retailer — The Home Depot releases ESG report details](https://www.homeimprovementretailer.com/the-home-depot-releases-esg-report-details/) — tier 2, 2023-07-26 |
| AB5 Reparative Action | 2/5 | Repair is largely confined to legal settlement, notably the $1.7 million civil penalty. | [Home Improvement Retailer — The Home Depot releases ESG report details](https://www.homeimprovementretailer.com/the-home-depot-releases-esg-report-details/) — tier 2, 2023-07-26 |

### SYS: Systemic Thinking (Raw 2.60/5 — Scaled 40/100)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| S1 Root Cause Orientation | 2/5 | Root causes of associate hardship are addressed downstream through the Homer Fund rather than upstream through wage structure; a store organising drive cited a starting wage of about $14.50. | [In These Times — Home Depot workers file to form the company's first union](https://inthesetimes.com/article/home-depot-workers-union-labor-independent-nlrb) — tier 3, 2022-11-01 |
| S2 Long-Term Impact | 3/5 | Multi-year planning with specific goals to 2028 is published and tracked. | [PR Newswire — The Home Depot publishes its ESG report and training goals](https://www.prnewswire.com/news-releases/the-home-depot-publishes-esg-report-announces-new-goals-to-reduce-carbon-emissions-invests-more-training-in-frontline-associates-and-leaders-301886849.html) — tier 2, 2023-07-25 |
| S3 Interconnection Awareness | 3/5 | Cross-system effects are mapped in supply-chain and climate planning within major decisions. | [The Home Depot — 2022 ESG Report (self-published)](https://corporate.homedepot.com/sites/default/files/2022-08/2022_ESG_Report_FINAL_0.pdf) — tier 3, 2022-08-01 |
| S4 Structural Critique | 2/5 | Home Depot does not question the structures that sustain low frontline pay; it litigated against union insignia rights rather than for them. | [Duane Morris — Eighth Circuit decision in Home Depot U.S.A., Inc. v. NLRB on union insignia](https://www.duanemorris.com/articles/national_labor_relations_act_protections_special_circumstances_home_depot_0226.html) — tier 5, 2025-11-01 |
| S5 Coalitional Compassion | 3/5 | Active coalition member in disaster response and supplier programmes with documented contributions. | [The Home Depot — 2022 ESG Report (self-published)](https://corporate.homedepot.com/sites/default/files/2022-08/2022_ESG_Report_FINAL_0.pdf) — tier 3, 2022-08-01 |

### INT: Integrity (Raw 2.60/5 — Scaled 40/100)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| I1 Consistency Under Pressure | 2/5 | Under cost pressure the company conducted a mass layoff at its Atlanta facility in January 2026 while maintaining shareholder returns; commitments give way. | [Strauss Borrelli — Home Depot Atlanta WARN Act mass-layoff notice](https://straussborrelli.com/2026/01/30/home-depot-atlanta-warn-act-investigation/) — tier 2, 2026-01-30 |
| I2 Non-Performance | 3/5 | The Homer Fund operates continuously and largely out of public view, which supports genuine rather than reputational practice. | [The Home Depot — 2022 ESG Report (self-published)](https://corporate.homedepot.com/sites/default/files/2022-08/2022_ESG_Report_FINAL_0.pdf) — tier 3, 2022-08-01 |
| I3 Internal Consistency | 3/5 | Staff-facing investment is real and substantial, though the union litigation shows the limits of how far internal voice is welcomed. | [PBS NewsHour — Home Depot workers petition the NLRB to form a store-wide union](https://www.pbs.org/newshour/economy/home-depot-workers-petition-the-federal-labor-board-to-form-1st-store-wide-union) — tier 4, 2022-11-01 |
| I4 Values Alignment | 2/5 | Values alignment is asserted in the ESG report; the decision to litigate union insignia restrictions to a federal appellate court was not tested against it in any published way. | [Duane Morris — Eighth Circuit decision in Home Depot U.S.A., Inc. v. NLRB on union insignia](https://www.duanemorris.com/articles/national_labor_relations_act_protections_special_circumstances_home_depot_0226.html) — tier 5, 2025-11-01 |
| I5 Resilience of Care | 3/5 | Core practices sit in policy — the Homer Fund dates to 1999 — and have survived multiple leadership transitions. | [The Home Depot — 2022 ESG Report (self-published)](https://corporate.homedepot.com/sites/default/files/2022-08/2022_ESG_Report_FINAL_0.pdf) — tier 3, 2022-08-01 |

## Published Index Comparison

**Published index:** fortune-500 | **Published rank:** #64 | **Published composite:** 57.8/100 | **Published band:** Functional

| Dimension | Published (raw) | Assessed (raw) | Difference (raw) |
|---|---|---|---|
| AWR | 3.5 | 2.80 | -0.7 |
| EMP | 3.5 | 2.60 | -0.9 |
| ACT | 3.5 | 3.20 | -0.3 |
| EQU | 2.5 | 2.60 | +0.1 |
| BND | 3.5 | 2.60 | -0.9 |
| ACC | 3 | 2.20 | -0.8 |
| SYS | 3.5 | 2.60 | -0.9 |
| INT | 3.5 | 2.60 | -0.9 |
| **Composite** | **57.8** | **41.3** | **-16.5** |

**Math-hygiene check:** the published dimension vector reconstructs to 57.8 under the canonical formula against a published composite of 57.8 (difference 0.0 points). This is within the 0.5-point tolerance, so no math-hygiene issue is raised.

### Analysis

The assessed composite is 41.3 against a published 57.8 — a fall of 16.5 points, with no band change. Both values sit inside the Functional band.

Home Depot's real strengths are concentrated in Action (3.20 of 5), and they are substantial. Roughly $739 million was paid in bonuses to non-management employees. The company has committed 10 million training hours to frontline associates and 2.5 million to leaders by 2028. The Homer Fund, which makes direct hardship grants to associates, has run since 1999 and largely out of public view — which is why it supports Integrity's non-performance subdimension as well as Action.

The weaknesses are concentrated in Accountability (2.20 of 5) and cluster around a single pattern: correction that does not stick. Home Depot paid a $1.7 million civil penalty in September 2024 for charging customers more than advertised, and a fresh consumer class action making the same complaint was filed in March 2026. It faces 2026 class actions alleging that licence-plate-reading cameras in California car parks shared driver data with law enforcement, and that hidden trackers in marketing emails collected recipient data without consent.

The finding that most affects the score is not a settlement but a choice. Home Depot litigated to the Eighth Circuit to defend restrictions on employees wearing union insignia, and won an expanded "special circumstances" exception. That is a company spending money to narrow its own workers' rights, and it sits directly against the S4 (Structural Critique) and E3 (Non-Judgment) anchors. A store organising drive cited a starting wage of about $14.50, below the Walmart in the same shopping centre.

**Why this is filed as flag-for-review rather than downgrade.** The delta is large and no in-window evidence produced it. The movement reflects a first measurement of a value that was never evidenced, and human review should confirm that reading before it is applied.

### Recommendation

**Flag for review at 41.3 / Functional.** Delta -16.5, which exceeds the 5.0-point magnitude trigger. No band change: both values are Functional. A change proposal is filed. The recommendation is `flag-for-review` because this is a first measurement of an original-build baseline with no in-window evidence, not a response to new conduct.

## Key Findings

- Why it matters: Home Depot spent money in court to stop its own staff wearing union badges. The Eighth Circuit's 2025 decision in Home Depot U.S.A., Inc. v. NLRB expanded the exception letting employers restrict union insignia.
- The company also pays well below the top of its market at entry level. A store organising drive cited a starting wage of about $14.50 — lower than the Walmart in the same shopping centre.
- Why it matters: the good side is real and large. Home Depot paid about $739 million in bonuses to non-management employees and has committed 10 million training hours to frontline associates by 2028. Its Homer Fund has made hardship grants to associates since 1999.
- Corrections do not stick. Home Depot paid a $1.7 million civil penalty in September 2024 for charging more than advertised. A new class action making the same complaint was filed in March 2026.
- The score falls 16.5 points, from 57.8 to 41.3. It stays in the Functional band. No new evidence appeared in the last 14 days — this is the first time the value has been measured at all.

## Strongest Dimensions

Action (3.20 of 5). Resource mobilisation reaches 4 of 5 on the combination of large-scale hourly bonuses, a committed 10-million-hour training programme and a long-running associate hardship fund.

## Weakest Dimensions

Accountability (2.20 of 5). Harm acknowledgment and correction willingness both sit at 2 of 5: the same consumer complaint that produced a 2024 penalty returned as a 2026 class action.

## Evidence Gaps

Home Depot's most recent published ESG report available in the public record predates 2026, so several subdimensions rest on that reporting cycle rather than on current disclosure. No disaggregated data on promotion, discipline or benefit outcomes is published. Privacy and consumer class actions are unadjudicated and are scored as allegations. Where disclosure is simply absent, the low anchor was applied and is stated as an absence of disclosure, not as evidence of harm.

## Sources

- [The Home Depot — 2022 ESG Report (self-published)](https://corporate.homedepot.com/sites/default/files/2022-08/2022_ESG_Report_FINAL_0.pdf) — tier 3, 2022-08-01
- [Strauss Borrelli — Home Depot Atlanta WARN Act mass-layoff notice](https://straussborrelli.com/2026/01/30/home-depot-atlanta-warn-act-investigation/) — tier 2, 2026-01-30
- [PR Newswire — The Home Depot publishes its ESG report and training goals](https://www.prnewswire.com/news-releases/the-home-depot-publishes-esg-report-announces-new-goals-to-reduce-carbon-emissions-invests-more-training-in-frontline-associates-and-leaders-301886849.html) — tier 2, 2023-07-25
- [Duane Morris — Eighth Circuit decision in Home Depot U.S.A., Inc. v. NLRB on union insignia](https://www.duanemorris.com/articles/national_labor_relations_act_protections_special_circumstances_home_depot_0226.html) — tier 5, 2025-11-01
- [Home Improvement Retailer — The Home Depot releases ESG report details](https://www.homeimprovementretailer.com/the-home-depot-releases-esg-report-details/) — tier 2, 2023-07-26
- [In These Times — Home Depot workers file to form the company's first union](https://inthesetimes.com/article/home-depot-workers-union-labor-independent-nlrb) — tier 3, 2022-11-01
- [PBS NewsHour — Home Depot workers petition the NLRB to form a store-wide union](https://www.pbs.org/newshour/economy/home-depot-workers-petition-the-federal-labor-board-to-form-1st-store-wide-union) — tier 4, 2022-11-01

## Recommended Next Steps

Functional band. Consider [Advisory Support](/advisory) to translate benchmark insights into strategic action.

---

*This assessment is based on publicly available information and does not constitute a formal Compassion Benchmark Certified Assessment. For a comprehensive, assessor-led evaluation, visit compassionbenchmark.com/certified-assessments.*
