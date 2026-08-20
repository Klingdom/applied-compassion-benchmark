---
entity: "Marriott International"
type: "Company"
sector: "Hospitality"
date: "2026-08-18"
composite_score: 44.4
band: "Functional"
scores:
  AWR: 3
  EMP: 2.6
  ACT: 3.2
  EQU: 2.6
  BND: 2.6
  ACC: 2.6
  SYS: 3
  INT: 2.6
published_index: "fortune-500"
published_rank: 44
published_composite: 60.9
published_band: "Established"
assessment_type: "first full assessment (seed de-seeding)"
recommendation: "flag-for-review"
confidence: "medium"
change_proposal: true
score_delta: -16.5
band_change: true
source: "rotation"
scan_file: "research/scans/2026-08-18.json"
watch_flag: "seed de-seeding — Philadelphia strike action continuing into 2026"
---

# Compassion Benchmark Assessment: Marriott International

**Entity type:** Company
**Sector/Domain:** Hospitality
**Assessment date:** 2026-08-18
**Composite score:** 44.4/100
**Band:** Functional
**Cycle source:** rotation (scan `research/scans/2026-08-18.json`)

## Why this entity was assessed

Marriott International entered this cycle on rotation. The scanner searched it individually and found no compassion-relevant evidence in the 14-day window, recommending reassessment on staleness grounds alone (`last_assessed: null`). This is a first full assessment and a de-seeding.

## Evidence-date and attribution checks

**SEED-BASELINE RECALIBRATION — NOT A CONDUCT DOWNGRADE.** The published composite of 60.9 is a **never-assessed uniform placeholder**. The vector {AWR 3.5, EMP 3.5, ACT 3.5, EQU 3, BND 3.5, ACC 3.5, SYS 3.5, INT 3.5} is shared **byte-for-byte by 22 Fortune-500 companies**, verified directly against `site/src/data/indexes/fortune-500.json`. It has never been individually measured. A large negative delta is the expected result of measuring a placeholder for the first time and does **not** mean this company has got worse. Two entities de-seeded from the same 60.9 value have already moved hard: Cerebras Systems 60.9 to 38.8 (applied) and Baxter International 60.9 to 55.0.

**Dates verified.** The Serve 360 reporting cycle is annual and the most recent published report available is the 2025 edition. The San Francisco strike and its 99.8% contract ratification are dated 2024-11 to 2024-12. Hotel Dive reports continuing strike action involving Marriott and Hilton workers in Philadelphia in 2026. None of this is in-window; there was no in-window evidence.

**Attribution.** The Serve 360 programme, the trafficking training, the Human Rights Council and the bargaining conduct are all Marriott's own. Strike action by UNITE HERE is worker conduct; what is scored is **Marriott's response** to it.

## Score Summary

| Dimension | Code | Raw (1-5) | Scaled (0-100) | Band |
|---|---|---|---|---|
| Awareness | AWR | 3.00 | 50 | Functional |
| Empathy | EMP | 2.60 | 40 | Developing |
| Action | ACT | 3.20 | 55 | Functional |
| Equity | EQU | 2.60 | 40 | Developing |
| Boundaries | BND | 2.60 | 40 | Developing |
| Accountability | ACC | 2.60 | 40 | Developing |
| Systemic Thinking | SYS | 3.00 | 50 | Functional |
| Integrity | INT | 2.60 | 40 | Developing |
| **Composite** | — | — | **44.4** | **Functional** |

Integration premium applied: 0. Composite computed with the canonical `computeCompositeFromDimensions` implementation in `site/scripts/lib/scoring.mjs`; it is not a simple mean of the eight dimensions.

## Dimension Details

### AWR: Awareness (Raw 3.00/5 — Scaled 50/100)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| A1 Suffering Detection | 3/5 | Marriott conducted a human rights mapping exercise in 2024 with a third-party consultancy to identify risks across the hospitality value chain, with findings presented to its Human Rights Council. | [Marriott International — annual Serve 360 report release](https://marriott.gcs-web.com/news-releases/news-release-details/marriott-international-releases-annual-serve-360-report) — tier 4, 2025-07-01 |
| A2 Contextual Sensitivity | 3/5 | Training and provision are differentiated across managed, franchised and on-property populations in more than 100 markets. | [Marriott International — 2025 Serve 360 report highlights](https://serve360.marriott.com/wp-content/uploads/2025/07/2025AroundTheWorld.pdf) — tier 4, 2025-07-01 |
| A3 Blind Spot Mitigation | 3/5 | The 2024 mapping exercise was explicitly designed to find risks not already visible, and its initial findings went to a standing governance body for consideration of next steps. | [Marriott International — annual Serve 360 report release](https://marriott.gcs-web.com/news-releases/news-release-details/marriott-international-releases-annual-serve-360-report) — tier 4, 2025-07-01 |
| A4 Signal Amplification | 3/5 | The Human Rights Council is a structural role with standing authority; whether it changes decisions is reported by Marriott rather than independently confirmed. | [Marriott International — annual Serve 360 report release](https://marriott.gcs-web.com/news-releases/news-release-details/marriott-international-releases-annual-serve-360-report) — tier 4, 2025-07-01 |
| A5 Anticipatory Awareness | 3/5 | Human trafficking risk assessment is embedded ahead of property operations rather than applied after incidents. | [Marriott International — Modern Slavery Statement 2024](https://serve360.marriott.com/wp-content/uploads/2024/06/Marriott_Statement_2024.pdf) — tier 4, 2024-06-01 |

### EMP: Empathy (Raw 2.60/5 — Scaled 40/100)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| E1 Affective Resonance | 3/5 | Front-line training is consistent and at very large scale; workers striking over understaffing indicate the experience is uneven. | [Hospitality Net — Marriott highlights ESG progress in its Serve 360 report](https://www.hospitalitynet.org/news/4122845.html) — tier 2, 2025-07-02 |
| E2 Perspective-Taking | 3/5 | Bargaining produced named changes, including new protections against understaffing in the ratified contract. | [UNITE HERE — Marriott workers ratify a new contract by 99.8%](https://unitehere.org/press-releases/marriott-workers-vote-by-99-8-to-ratify-new-contract-strikes-continue-at-hilton-and-hyatt/) — tier 3, 2024-12-19 |
| E3 Non-Judgment | 2/5 | Non-judgment is stated across a global workforce but disaggregated outcome data is not published. | [Marriott International — Modern Slavery Statement 2024](https://serve360.marriott.com/wp-content/uploads/2024/06/Marriott_Statement_2024.pdf) — tier 4, 2024-06-01 |
| E4 Validation | 2/5 | Worker concerns about understaffing required a near three-month strike before they were addressed. Acknowledgment did not structurally precede escalation. | [UNITE HERE — San Francisco hotel strike expands to the Marriott Marquis](https://unitehere.org/press-releases/san-francisco-hotel-strike-expands-as-500-workers-at-san-francisco-marriott-marquis-walk-off-the-job/) — tier 3, 2024-11-25 |
| E5 Cultural Empathy | 3/5 | Genuine cultural adaptation is documented across a workforce operating in more than 100 countries. | [Marriott International — 2025 Serve 360 report highlights](https://serve360.marriott.com/wp-content/uploads/2025/07/2025AroundTheWorld.pdf) — tier 4, 2025-07-01 |

### ACT: Action (Raw 3.20/5 — Scaled 55/100)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| AC1 Responsiveness | 3/5 | Response standards for property-level incidents are defined and met for most cases. | [Marriott International — Modern Slavery Statement 2024](https://serve360.marriott.com/wp-content/uploads/2024/06/Marriott_Statement_2024.pdf) — tier 4, 2024-06-01 |
| AC2 Proportionality | 3/5 | Training intensity is calibrated to assessed trafficking risk by market and property type. | [Marriott International — Modern Slavery Statement 2024](https://serve360.marriott.com/wp-content/uploads/2024/06/Marriott_Statement_2024.pdf) — tier 4, 2024-06-01 |
| AC3 Efficacy | 3/5 | Serve 360 reports outcome data annually against stated 2025 goals, with programme modification where targets were missed. | [Marriott International — annual Serve 360 report release](https://marriott.gcs-web.com/news-releases/news-release-details/marriott-international-releases-annual-serve-360-report) — tier 4, 2025-07-01 |
| AC4 Resource Mobilization | 4/5 | More than 1.2 million managed and franchised associates trained in human trafficking awareness since 2016, against a goal of training all on-property associates by 2025 — documented reallocation at very large scale. | [Hospitality Net — Marriott highlights ESG progress in its Serve 360 report](https://www.hospitalitynet.org/news/4122845.html) — tier 2, 2025-07-02 |
| AC5 Follow-Through | 3/5 | Multi-year follow-through on the trafficking training goal is documented across a decade with published progress. | [Marriott International — 2025 Serve 360 report highlights](https://serve360.marriott.com/wp-content/uploads/2025/07/2025AroundTheWorld.pdf) — tier 4, 2025-07-01 |

### EQU: Equity (Raw 2.60/5 — Scaled 40/100)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| EQ1 Universality | 3/5 | Coverage of the trafficking training programme is reported across the managed and franchised estate with documented gap reduction. | [Hospitality Net — Marriott highlights ESG progress in its Serve 360 report](https://www.hospitalitynet.org/news/4122845.html) — tier 2, 2025-07-02 |
| EQ2 Priority for Vulnerable | 3/5 | Higher-risk markets and property types receive more intensive training and assessment — a documented prioritisation framework. | [Marriott International — Modern Slavery Statement 2024](https://serve360.marriott.com/wp-content/uploads/2024/06/Marriott_Statement_2024.pdf) — tier 4, 2024-06-01 |
| EQ3 Bias Awareness | 2/5 | No disaggregated outcome data on promotion, discipline or pay equity is published. Absence of disclosure, scored at the low anchor. | [Marriott International — annual Serve 360 report release](https://marriott.gcs-web.com/news-releases/news-release-details/marriott-international-releases-annual-serve-360-report) — tier 4, 2025-07-01 |
| EQ4 Access Design | 3/5 | Multiple access barriers to reporting trafficking and exploitation concerns have been removed with evidence across the estate. | [Marriott International — Modern Slavery Statement 2024](https://serve360.marriott.com/wp-content/uploads/2024/06/Marriott_Statement_2024.pdf) — tier 4, 2024-06-01 |
| EQ5 Historical Harm Acknowledgment | 2/5 | Historical harms in the hospitality labour model are not addressed as harms requiring repair; the programme is forward-looking. | [Workers of Marriott — United States campaign page](https://www.workersofmarriott.org/campaigns/united-states/) — tier 3, 2026-01-01 |

### BND: Boundaries (Raw 2.60/5 — Scaled 40/100)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| B1 Self-Sustainability | 2/5 | Around 2,000 Marriott workers in San Francisco struck for nearly three months, 1,500 of them continuously, over pay and understaffing. Depletion was structural, not individual. | [UNITE HERE — San Francisco hotel strike expands to the Marriott Marquis](https://unitehere.org/press-releases/san-francisco-hotel-strike-expands-as-500-workers-at-san-francisco-marriott-marquis-walk-off-the-job/) — tier 3, 2024-11-25 |
| B2 Autonomy Preservation | 3/5 | Training and career-progression programmes are designed to build worker capacity within the industry. | [Marriott International — 2025 Serve 360 report highlights](https://serve360.marriott.com/wp-content/uploads/2025/07/2025AroundTheWorld.pdf) — tier 4, 2025-07-01 |
| B3 Scope Clarity | 3/5 | Serve 360 sets out programme scope and limitations before commitment, and the Modern Slavery Statement states what the programme does and does not cover. | [Marriott International — Modern Slavery Statement 2024](https://serve360.marriott.com/wp-content/uploads/2024/06/Marriott_Statement_2024.pdf) — tier 4, 2024-06-01 |
| B4 Refusal Ethics | 2/5 | No structured refusal-with-alternatives protocol is published for workers or communities whose concerns fall outside programme scope. | [Workers of Marriott — United States campaign page](https://www.workersofmarriott.org/campaigns/united-states/) — tier 3, 2026-01-01 |
| B5 Consent Orientation | 3/5 | The trafficking programme is built on informed reporting and explicit staff training on when and how to escalate. | [Marriott International — Modern Slavery Statement 2024](https://serve360.marriott.com/wp-content/uploads/2024/06/Marriott_Statement_2024.pdf) — tier 4, 2024-06-01 |

### ACC: Accountability (Raw 2.60/5 — Scaled 40/100)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| AB1 Harm Acknowledgment | 2/5 | Harm acknowledgment on understaffing followed external establishment through strike action rather than preceding it. | [UNITE HERE — San Francisco hotel strike expands to the Marriott Marquis](https://unitehere.org/press-releases/san-francisco-hotel-strike-expands-as-500-workers-at-san-francisco-marriott-marquis-walk-off-the-job/) — tier 3, 2024-11-25 |
| AB2 Correction Willingness | 3/5 | A significant course correction based on harm evidence: the ratified four-year contract created new protections against understaffing, addressing the cause of the dispute. | [UNITE HERE — Marriott workers ratify a new contract by 99.8%](https://unitehere.org/press-releases/marriott-workers-vote-by-99-8-to-ratify-new-contract-strikes-continue-at-hilton-and-hyatt/) — tier 3, 2024-12-19 |
| AB3 Transparency | 3/5 | The annual Serve 360 report discloses progress against 2025 goals including shortfalls, clearing the "at least one report disclosing an unflattering finding" anchor. | [Marriott International — annual Serve 360 report release](https://marriott.gcs-web.com/news-releases/news-release-details/marriott-international-releases-annual-serve-360-report) — tier 4, 2025-07-01 |
| AB4 Systemic Learning | 3/5 | A formal systemic review process exists — the Human Rights Council reviewing mapping findings — with documented systemic changes. | [Marriott International — annual Serve 360 report release](https://marriott.gcs-web.com/news-releases/news-release-details/marriott-international-releases-annual-serve-360-report) — tier 4, 2025-07-01 |
| AB5 Reparative Action | 2/5 | Repair is delivered through collective bargaining outcomes rather than through a systematic reparative approach. | [The San Francisco Standard — Marriott makes a deal with the union to end the strike](https://sfstandard.com/2024/12/19/marriot-hotel-strike/) — tier 2, 2024-12-19 |

### SYS: Systemic Thinking (Raw 3.00/5 — Scaled 50/100)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| S1 Root Cause Orientation | 3/5 | Marriott addresses trafficking as a root-cause issue in the hospitality value chain and commits resources upstream to it. | [Marriott International — Modern Slavery Statement 2024](https://serve360.marriott.com/wp-content/uploads/2024/06/Marriott_Statement_2024.pdf) — tier 4, 2024-06-01 |
| S2 Long-Term Impact | 3/5 | Multi-year goals to 2025 and beyond are published with tracked progress that influences strategy. | [Marriott International — 2025 Serve 360 report highlights](https://serve360.marriott.com/wp-content/uploads/2025/07/2025AroundTheWorld.pdf) — tier 4, 2025-07-01 |
| S3 Interconnection Awareness | 3/5 | Cross-system effects across owned, managed and franchised properties are mapped in the human rights work. | [Marriott International — annual Serve 360 report release](https://marriott.gcs-web.com/news-releases/news-release-details/marriott-international-releases-annual-serve-360-report) — tier 4, 2025-07-01 |
| S4 Structural Critique | 3/5 | Marriott has taken a documented public position against human trafficking in its own industry, which carries commercial and reputational cost with property owners. | [Marriott International — Modern Slavery Statement 2024](https://serve360.marriott.com/wp-content/uploads/2024/06/Marriott_Statement_2024.pdf) — tier 4, 2024-06-01 |
| S5 Coalitional Compassion | 3/5 | Active coalition member in industry anti-trafficking bodies with documented contributions and shared training resources. | [Marriott International — Modern Slavery Statement 2024](https://serve360.marriott.com/wp-content/uploads/2024/06/Marriott_Statement_2024.pdf) — tier 4, 2024-06-01 |

### INT: Integrity (Raw 2.60/5 — Scaled 40/100)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| I1 Consistency Under Pressure | 2/5 | Under cost pressure Marriott let a near three-month strike run before settling; commitments to workers gave way until the cost of the dispute exceeded the cost of settling. | [The San Francisco Standard — Marriott makes a deal with the union to end the strike](https://sfstandard.com/2024/12/19/marriot-hotel-strike/) — tier 2, 2024-12-19 |
| I2 Non-Performance | 3/5 | The trafficking training programme has run continuously since 2016 across franchised properties Marriott does not own, much of it out of public view. | [Marriott International — Modern Slavery Statement 2024](https://serve360.marriott.com/wp-content/uploads/2024/06/Marriott_Statement_2024.pdf) — tier 4, 2024-06-01 |
| I3 Internal Consistency | 2/5 | Internal culture is materially less compassionate than external messaging in the disputed markets; strikes have continued into 2026 in Philadelphia. | [Hotel Dive — Marriott and Hilton workers strike in Philadelphia](https://www.hoteldive.com/news/union-hotel-workers-strike-philadelphia/802157/) — tier 2, 2026-02-01 |
| I4 Values Alignment | 3/5 | Values were explicitly considered in the decision to create anti-understaffing protections in the ratified contract. | [UNITE HERE — Marriott workers ratify a new contract by 99.8%](https://unitehere.org/press-releases/marriott-workers-vote-by-99-8-to-ratify-new-contract-strikes-continue-at-hilton-and-hyatt/) — tier 3, 2024-12-19 |
| I5 Resilience of Care | 3/5 | Core practices are embedded in the Serve 360 framework and the Modern Slavery Statement and have survived leadership transitions since 2016. | [Marriott International — annual Serve 360 report release](https://marriott.gcs-web.com/news-releases/news-release-details/marriott-international-releases-annual-serve-360-report) — tier 4, 2025-07-01 |

## Published Index Comparison

**Published index:** fortune-500 | **Published rank:** #44 | **Published composite:** 60.9/100 | **Published band:** Established

| Dimension | Published (raw) | Assessed (raw) | Difference (raw) |
|---|---|---|---|
| AWR | 3.5 | 3.00 | -0.5 |
| EMP | 3.5 | 2.60 | -0.9 |
| ACT | 3.5 | 3.20 | -0.3 |
| EQU | 3 | 2.60 | -0.4 |
| BND | 3.5 | 2.60 | -0.9 |
| ACC | 3.5 | 2.60 | -0.9 |
| SYS | 3.5 | 3.00 | -0.5 |
| INT | 3.5 | 2.60 | -0.9 |
| **Composite** | **60.9** | **44.4** | **-16.5** |

**Math-hygiene check:** the published dimension vector reconstructs to 60.9 under the canonical formula against a published composite of 60.9 (difference 0.0 points). This is within the 0.5-point tolerance, so no math-hygiene issue is raised.

### Analysis

The assessed composite is 44.4 against a published 60.9 — a fall of 16.5 points and a crossing from Established into Functional. The published value was never a measurement.

Marriott has the strongest documented social programme of the three seed companies assessed this cycle, and the score reflects it. More than 1.2 million managed and franchised associates have been trained in human trafficking awareness since 2016, against a stated goal of training every on-property associate. In 2024 Marriott commissioned a third-party human rights consultancy to map risks across the hospitality value chain and took the findings to a standing Human Rights Council. It publishes an annual Serve 360 report and a Modern Slavery Statement. Action reaches 3.20 of 5 and resource mobilisation reaches 4 of 5 on that record.

What holds it below the Established band is the gap between that programme and Marriott's own workers. Roughly 2,000 Marriott workers in San Francisco struck for nearly three months over pay and understaffing, 1,500 of them continuously. They then ratified a four-year contract by 99.8% — a contract that created new protections against understaffing. Read together, those two facts say something precise: the remedy was available, and it took a three-month strike to obtain it. AB1 scores 2 of 5 and I1 scores 2 of 5 for exactly that. Strike action involving Marriott workers continued into 2026 in Philadelphia.

Equity holds at 2.60 rather than higher because Marriott publishes no disaggregated data on promotion, discipline or pay equity — an absence of disclosure, scored at the low anchor and stated as such.

### Recommendation

**Flag for review at 44.4 / Functional.** Delta -16.5 with a band crossing from Established to Functional. Both filing triggers are met and a change proposal is filed. The recommendation is `flag-for-review` because this is a seed-baseline recalibration, not a conduct downgrade. The band-crossing evidence test is recorded as **failed**: no independent source at tier 4 or above, excluding Marriott's own publications, supports the band change.

## Key Findings

- Why it matters: Marriott's published score was never measured. Its eight dimension values are identical, digit for digit, to those of 21 other Fortune-500 companies.
- Marriott has trained more than 1.2 million associates in human trafficking awareness since 2016, across hotels it owns, manages and franchises. In 2024 it hired an outside human rights consultancy to map risks across its whole value chain.
- Why it matters: the programme for guests and suppliers is stronger than the deal for its own staff. About 2,000 Marriott workers in San Francisco struck for nearly three months over pay and understaffing.
- They then ratified a new four-year contract by 99.8% — one that created new protections against understaffing. The remedy existed. It took a three-month strike to get it.
- The score falls 16.5 points, from 60.9 to 44.4, and moves from the Established band to the Functional band. This corrects a placeholder. It does not mean Marriott has got worse.

## Strongest Dimensions

Action (3.20 of 5) and Awareness (3.00 of 5). Training 1.2 million people over a decade is resource mobilisation at a scale few companies match, and the third-party risk mapping is genuine detection rather than assertion.

## Weakest Dimensions

Empathy (2.60 of 5), Equity (2.60 of 5), Boundaries (2.60 of 5) and Integrity (2.60 of 5). Self-sustainability scores 2 of 5 on the understaffing dispute, and validation scores 2 of 5 because worker concerns required a strike before they were addressed.

## Evidence Gaps

Marriott publishes no disaggregated pay, promotion or discipline data, and no independent verification of worker experience. Its published Serve 360 targets ran to 2025; the successor goal set was not available in the public record at assessment. Where disclosure is simply absent, the low anchor was applied and is stated as an absence of disclosure, not as evidence of harm.

## Sources

- [Marriott International — annual Serve 360 report release](https://marriott.gcs-web.com/news-releases/news-release-details/marriott-international-releases-annual-serve-360-report) — tier 4, 2025-07-01
- [Marriott International — 2025 Serve 360 report highlights](https://serve360.marriott.com/wp-content/uploads/2025/07/2025AroundTheWorld.pdf) — tier 4, 2025-07-01
- [Marriott International — Modern Slavery Statement 2024](https://serve360.marriott.com/wp-content/uploads/2024/06/Marriott_Statement_2024.pdf) — tier 4, 2024-06-01
- [Hospitality Net — Marriott highlights ESG progress in its Serve 360 report](https://www.hospitalitynet.org/news/4122845.html) — tier 2, 2025-07-02
- [UNITE HERE — Marriott workers ratify a new contract by 99.8%](https://unitehere.org/press-releases/marriott-workers-vote-by-99-8-to-ratify-new-contract-strikes-continue-at-hilton-and-hyatt/) — tier 3, 2024-12-19
- [UNITE HERE — San Francisco hotel strike expands to the Marriott Marquis](https://unitehere.org/press-releases/san-francisco-hotel-strike-expands-as-500-workers-at-san-francisco-marriott-marquis-walk-off-the-job/) — tier 3, 2024-11-25
- [Workers of Marriott — United States campaign page](https://www.workersofmarriott.org/campaigns/united-states/) — tier 3, 2026-01-01
- [The San Francisco Standard — Marriott makes a deal with the union to end the strike](https://sfstandard.com/2024/12/19/marriot-hotel-strike/) — tier 2, 2024-12-19
- [Hotel Dive — Marriott and Hilton workers strike in Philadelphia](https://www.hoteldive.com/news/union-hotel-workers-strike-philadelphia/802157/) — tier 2, 2026-02-01

## Recommended Next Steps

Functional band. Consider [Advisory Support](/advisory) to translate benchmark insights into strategic action, with priority on closing the gap between the value-chain programme and the direct-employment record.

---

*This assessment is based on publicly available information and does not constitute a formal Compassion Benchmark Certified Assessment. For a comprehensive, assessor-led evaluation, visit compassionbenchmark.com/certified-assessments.*
