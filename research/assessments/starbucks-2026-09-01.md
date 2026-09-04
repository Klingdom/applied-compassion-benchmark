---
entity: "Starbucks"
type: "Company"
sector: "Restaurants / food and beverage retail"
date: "2026-09-01"
composite_score: 43.1
band: "Functional"
scores:
  AWR: 2.8
  EMP: 2.8
  ACT: 2.8
  EQU: 2.8
  BND: 3
  ACC: 2.2
  SYS: 2.8
  INT: 2.6
published_index: "fortune-500"
published_rank: 152
published_composite: 48.4
published_band: "functional"
assessed_composite: 43.1
score_delta: -5.3
band_change: false
recommendation: "flag-for-review"
change_proposal: true
confidence: "low"
subdim_sidecar: true
source: "priority"
scan_file: "research/scans/2026-09-01.json"
---

# Compassion Benchmark Assessment: Starbucks

**Entity type:** Company  
**Sector/Domain:** Restaurants / food and beverage retail  
**Assessment date:** 2026-09-01  
**Composite score:** 43.1/100  
**Band:** Functional  
**Cycle source:** priority (scan `research/scans/2026-09-01.json`)

## Why this entity was assessed

The scanner flagged Starbucks on Starbucks Workers United announcing a boycott campaign on 25 August 2026 to pressure the company into signing a first contract with roughly 12,000 unionised baristas, with the AFL-CIO and the 25,000-member Chicago Teachers Union joining. Starbucks was last assessed on 2026-06-21 and is published at 48.4.

## Evidence-date, lifecycle and attribution checks

**ATTRIBUTION — THE FLAGGED EVENT IS NOT COMPANY CONDUCT, AND MOST OF IT IS EXCLUDED.** Per the cycle instruction: a union boycott is a **campaign against** Starbucks, not something Starbucks did. Neither the boycott's launch, nor the AFL-CIO joining, nor the Chicago Teachers Union vote is scored against the company. Those are the acts of other organisations.

**What IS scored is Starbucks' own conduct**, and after the exclusion the in-window set is thin:
- **No first contract has been concluded with a bargaining unit that organised in late 2021** — approaching five years. Verified independently by CNBC and by the Texarkana Gazette wire report, not only by union sources.
- **Starbucks' own public statement**, from spokesperson Jaci Anderson: "As we have always been, we're committed to engaging in productive bargaining." The company also said it had seen no impact to its business from the boycott, and pointed to "competitive pay, industry-leading benefits, and meaningful opportunities to grow a career."

**UNION-ASSERTED FIGURES WERE DELIBERATELY NOT RELIED ON.** Labor Notes reports "550 still unresolved" unfair labor practice charges; Starbucks Workers United's own site says "more than 700"; other advocacy sources cite "more than 400 labor law violations" found by administrative law judges. **These figures come from a party to the dispute, they disagree with each other, and none was verifiable against a primary National Labor Relations Board record.** No subdimension in this assessment rests on them. Had they been relied on, the movement would have been substantially larger.

**COUNTERVAILING EVIDENCE — recorded.** A United States Court of Appeals for the Fifth Circuit decision in 2026 vacated an NLRB unfair labor practice ruling against Starbucks. The adjudicated picture is contested, not settled against the company. Starbucks also provides health coverage to part-time workers and tuition support, which are genuine structural benefits and are scored as such under Boundaries.

**DATE CHECK.** `evidence_date: 2026-08-26`. The Labor Notes item resolves to 27 August 2026 and the Restaurant Dive item — which the scanner marked `date_verified: false` — is dated 26 August 2026. The boycott was announced 25 August and the Chicago Teachers Union voted 26 August. All within the window; no year-confusion.

## Score Summary

| Dimension | Code | Raw (1-5) | Scaled (0-100) | Published raw | Delta (raw) |
|---|---|---|---|---|---|
| Awareness | AWR | 2.8 | 45 | 3 | -0.2 |
| Empathy | EMP | 2.8 | 45 | 3 | -0.2 |
| Action | ACT | 2.8 | 45 | 3.5 | -0.7 |
| Equity | EQU | 2.8 | 45 | 3 | -0.2 |
| Boundaries | BND | 3 | 50 | 3 | 0 |
| Accountability | ACC | 2.2 | 30 | 2.5 | -0.3 |
| Systemic Thinking | SYS | 2.8 | 45 | 3 | -0.2 |
| Integrity | INT | 2.6 | 40 | 2.5 | 0.1 |
| **Composite** | — | — | **43.1** | **48.4** | **-5.3** |

**Band:** Functional (published: functional). Integration premium: 0.

## Dimension Details

### AWR: Awareness (raw 2.8/5 — scaled 45/100)

| Subdimension | Score | Evidence and anchor match | Source |
|---|---|---|---|
| A1 Suffering Detection | 3/5 | Starbucks runs partner surveys and publishes an annual impact report; the union also submitted a written contract proposal in March 2026, so worker concerns reach the company in structured form. Some proactive mechanisms, inconsistent — anchor 3. | [T2](https://www.cnbc.com/2026/03/13/starbucks-workers-united-union-contract-proposal.html) 2026-03-13 |
| A2 Contextual Sensitivity | 3/5 | Differentiated policies exist across store formats and worker categories, with real gaps. Anchor 3. | [T2](https://www.cnbc.com/2026/03/13/starbucks-workers-united-union-contract-proposal.html) 2026-03-13 |
| A3 Blind Spot Mitigation | 3/5 | Starbucks publishes impact reporting that has disclosed unflattering findings in the past. Anchor 3. Not 4: no annual structured blind-spot assessment with documented action located. | [T2](https://www.texarkanagazette.com/news/2026/aug/27/starbucks-union-calls-for-boycott-as-contract/) 2026-08-27 |
| A4 Signal Amplification | 2/5 | Baristas’ concerns reach company decision-making principally through strikes and now a national boycott — after nearly five years of bargaining. Alternative channels exist but are rarely effective. Anchor 2. | [T1](https://labornotes.org/2026/08/baristas-ask-organizations-boycott-until-starbucks-signs-contract) 2026-08-27 |
| A5 Anticipatory Awareness | 3/5 | Formal pre-launch assessment exists for some major decisions. Anchor 3. | [T2](https://www.texarkanagazette.com/news/2026/aug/27/starbucks-union-calls-for-boycott-as-contract/) 2026-08-27 |

### EMP: Empathy (raw 2.8/5 — scaled 45/100)

| Subdimension | Score | Evidence and anchor match | Source |
|---|---|---|---|
| E1 Affective Resonance | 3/5 | Training exists and many partners report positive store-level experience, but consistency is contested. Anchor 3. | [T2](https://www.texarkanagazette.com/news/2026/aug/27/starbucks-union-calls-for-boycott-as-contract/) 2026-08-27 |
| E2 Perspective-Taking | 3/5 | The union submitted a written contract proposal and the company returned to the table in 2026 — at least one formal mechanism used. Anchor 3. Not 4: no decision the union names as changed. | [T2](https://www.cnbc.com/2026/03/13/starbucks-workers-united-union-contract-proposal.html) 2026-03-13 |
| E3 Non-Judgment | 3/5 | Required training and some disaggregated outcome data. Anchor 3. | [T2](https://www.texarkanagazette.com/news/2026/aug/27/starbucks-union-calls-for-boycott-as-contract/) 2026-08-27 |
| E4 Validation | 2/5 | Starbucks responds to the dispute by restating its own position — "competitive pay, industry-leading benefits" — rather than affirming the legitimacy of the baristas’ account. "We take all concerns seriously" without a process that resolves them — anchor 2. | [T2](https://www.texarkanagazette.com/news/2026/aug/27/starbucks-union-calls-for-boycott-as-contract/) 2026-08-27 |
| E5 Cultural Empathy | 3/5 | Multiple genuine cultural adaptations across markets. Anchor 3. | [T2](https://www.texarkanagazette.com/news/2026/aug/27/starbucks-union-calls-for-boycott-as-contract/) 2026-08-27 |

### ACT: Action (raw 2.8/5 — scaled 45/100)

| Subdimension | Score | Evidence and anchor match | Source |
|---|---|---|---|
| AC1 Responsiveness | 3/5 | Starbucks returned to the bargaining table in 2026 after the largest strike in its history. A response occurred; it was not timely by any ordinary standard. Anchor 3. | [T2](https://www.texarkanagazette.com/news/2026/aug/27/starbucks-union-calls-for-boycott-as-contract/) 2026-08-27 |
| AC2 Proportionality | 3/5 | The union’s core asks — three people on the floor at all times, $17 starting pay, 4% annual raises — are staffing and pay levels the company has not matched. Needs assessment exists on paper; resources drive the response. Anchor 3. | [T1](https://labornotes.org/2026/08/baristas-ask-organizations-boycott-until-starbucks-signs-contract) 2026-08-27 |
| AC3 Efficacy | 3/5 | Outcome data reviewed and programmes modified; the withdrawal of a respiratory-hazard blending powder after worker complaints is a documented modification. Anchor 3. | [T2](https://www.texarkanagazette.com/news/2026/aug/27/starbucks-union-calls-for-boycott-as-contract/) 2026-08-27 |
| AC4 Resource Mobilization | 3/5 | Substantial resources are committed to pay and benefits, though not to the level sought. Anchor 3. | [T2](https://www.texarkanagazette.com/news/2026/aug/27/starbucks-union-calls-for-boycott-as-contract/) 2026-08-27 |
| AC5 Follow-Through | 2/5 | Workers have "been trying to get a contract with the coffee giant since late 2021" and there is still no agreement. Engagement has not persisted to resolution across nearly five years. Anchor 2. **This is the largest single movement in this assessment.** | [T1](https://labornotes.org/2026/08/baristas-ask-organizations-boycott-until-starbucks-signs-contract) 2026-08-27 |

### EQU: Equity (raw 2.8/5 — scaled 45/100)

| Subdimension | Score | Evidence and anchor match | Source |
|---|---|---|---|
| EQ1 Universality | 3/5 | Benefits including health coverage extend to part-time workers, which is broader coverage than the sector norm. Coverage data for some populations — anchor 3. | [T2](https://www.texarkanagazette.com/news/2026/aug/27/starbucks-union-calls-for-boycott-as-contract/) 2026-08-27 |
| EQ2 Priority for Vulnerable | 3/5 | Part-time health coverage and tuition support are documented prioritisation decisions favouring lower-paid workers. Anchor 3. | [T2](https://www.texarkanagazette.com/news/2026/aug/27/starbucks-union-calls-for-boycott-as-contract/) 2026-08-27 |
| EQ3 Bias Awareness | 3/5 | Some disaggregation with formal processes. Anchor 3. | [T2](https://www.texarkanagazette.com/news/2026/aug/27/starbucks-union-calls-for-boycott-as-contract/) 2026-08-27 |
| EQ4 Access Design | 3/5 | Accessibility programmes with documented barrier removal. Anchor 3. | [T2](https://www.texarkanagazette.com/news/2026/aug/27/starbucks-union-calls-for-boycott-as-contract/) 2026-08-27 |
| EQ5 Historical Harm Acknowledgment | 2/5 | No acknowledgment located of the company’s own role in the five-year bargaining failure. Vague acknowledgment only — anchor 2. | [T1](https://labornotes.org/2026/08/baristas-ask-organizations-boycott-until-starbucks-signs-contract) 2026-08-27 |

### BND: Boundaries (raw 3/5 — scaled 50/100)

| Subdimension | Score | Evidence and anchor match | Source |
|---|---|---|---|
| B1 Self-Sustainability | 3/5 | Staffing adequacy is contested — the union seeks "three people on the floor at all times" — but Starbucks provides health coverage to part-time workers and tracks turnover. Anchor 3. | [T1](https://labornotes.org/2026/08/baristas-ask-organizations-boycott-until-starbucks-signs-contract) 2026-08-27 |
| B2 Autonomy Preservation | 3/5 | Tuition support is explicitly designed to build capacity beyond the employment relationship. Anchor 3. | [T2](https://www.texarkanagazette.com/news/2026/aug/27/starbucks-union-calls-for-boycott-as-contract/) 2026-08-27 |
| B3 Scope Clarity | 3/5 | Starbucks states its position on bargaining plainly and publicly. Anchor 3. | [T2](https://www.texarkanagazette.com/news/2026/aug/27/starbucks-union-calls-for-boycott-as-contract/) 2026-08-27 |
| B4 Refusal Ethics | 3/5 | Structured processes with alternatives in most cases. Anchor 3. | [T2](https://www.texarkanagazette.com/news/2026/aug/27/starbucks-union-calls-for-boycott-as-contract/) 2026-08-27 |
| B5 Consent Orientation | 3/5 | Bargaining proceeds through a recognised union with a written proposal exchange — a genuine consent structure, however slow. Anchor 3. | [T2](https://www.cnbc.com/2026/03/13/starbucks-workers-united-union-contract-proposal.html) 2026-03-13 |

### ACC: Accountability (raw 2.2/5 — scaled 30/100)

| Subdimension | Score | Evidence and anchor match | Source |
|---|---|---|---|
| AB1 Harm Acknowledgment | 2/5 | Starbucks does not acknowledge the bargaining delay as its own: "As we have always been, we're committed to engaging in productive bargaining." Acknowledgment only after external establishment — anchor 2. | [T2](https://www.texarkanagazette.com/news/2026/aug/27/starbucks-union-calls-for-boycott-as-contract/) 2026-08-27 |
| AB2 Correction Willingness | 2/5 | The central complaint — no first contract since late 2021 — persists through a national strike and now a national boycott. Correction eventually, under pressure, minimal. Anchor 2. | [T1](https://labornotes.org/2026/08/baristas-ask-organizations-boycott-until-starbucks-signs-contract) 2026-08-27 |
| AB3 Transparency | 3/5 | Starbucks publishes annual impact reporting including unflattering findings, and speaks publicly about the dispute. Anchor 3. | [T2](https://www.texarkanagazette.com/news/2026/aug/27/starbucks-union-calls-for-boycott-as-contract/) 2026-08-27 |
| AB4 Systemic Learning | 2/5 | The same bargaining failure recurs across successive rounds without evidenced systemic change. Some post-incident review, rarely translating to systemic change — anchor 2. | [T1](https://labornotes.org/2026/08/baristas-ask-organizations-boycott-until-starbucks-signs-contract) 2026-08-27 |
| AB5 Reparative Action | 2/5 | No reparative action toward the bargaining unit located. Gestures in high-visibility cases only — anchor 2. | [T1](https://labornotes.org/2026/08/baristas-ask-organizations-boycott-until-starbucks-signs-contract) 2026-08-27 |

### SYS: Systemic Thinking (raw 2.8/5 — scaled 45/100)

| Subdimension | Score | Evidence and anchor match | Source |
|---|---|---|---|
| S1 Root Cause Orientation | 3/5 | Sourcing and farmer-support programmes address upstream causes with allocated resources. Anchor 3. | [T2](https://www.texarkanagazette.com/news/2026/aug/27/starbucks-union-calls-for-boycott-as-contract/) 2026-08-27 |
| S2 Long-Term Impact | 3/5 | Published long-term commitments with some tracking. Anchor 3. | [T2](https://www.texarkanagazette.com/news/2026/aug/27/starbucks-union-calls-for-boycott-as-contract/) 2026-08-27 |
| S3 Interconnection Awareness | 3/5 | The company tracks second-order effects on its business — it stated the boycott had produced no impact — and on its supply chain. Anchor 3. | [T2](https://www.restaurantdive.com/news/starbucks-workers-united-boycott-investor-board-chair-ceo-proposal/829158/) 2026-08-26 |
| S4 Structural Critique | 2/5 | No public position located that carries institutional risk against the company’s own short-term interest. Anchor 2. | [T1](https://labornotes.org/2026/08/baristas-ask-organizations-boycott-until-starbucks-signs-contract) 2026-08-27 |
| S5 Coalitional Compassion | 3/5 | Active coalition participation in sourcing and sustainability initiatives with documented contributions. Anchor 3. | [T2](https://www.texarkanagazette.com/news/2026/aug/27/starbucks-union-calls-for-boycott-as-contract/) 2026-08-27 |

### INT: Integrity (raw 2.6/5 — scaled 40/100)

| Subdimension | Score | Evidence and anchor match | Source |
|---|---|---|---|
| I1 Consistency Under Pressure | 2/5 | The commitment to reach a first contract has not held across nearly five years of pressure. Pressure occasionally causes unacknowledged compromises — anchor 2. | [T1](https://labornotes.org/2026/08/baristas-ask-organizations-boycott-until-starbucks-signs-contract) 2026-08-27 |
| I2 Non-Performance | 3/5 | Benefits such as part-time health coverage are maintained regardless of visibility and predate the dispute. Anchor 3. | [T2](https://www.texarkanagazette.com/news/2026/aug/27/starbucks-union-calls-for-boycott-as-contract/) 2026-08-27 |
| I3 Internal Consistency | 3/5 | Starbucks offers genuine structural benefits to staff, which is internal-facing compassion. But 12,000 unionised workers have gone five years without a contract. Meaningful effort to apply the same values to staff, imperfectly realised — anchor 3. | [T2](https://www.texarkanagazette.com/news/2026/aug/27/starbucks-union-calls-for-boycott-as-contract/) 2026-08-27 |
| I4 Values Alignment | 2/5 | The company states "industry-leading benefits" while its unionised workforce has no contract after five years. Values consulted for communications, not consistently applied — anchor 2. | [T2](https://www.texarkanagazette.com/news/2026/aug/27/starbucks-union-calls-for-boycott-as-contract/) 2026-08-27 |
| I5 Resilience of Care | 3/5 | Core benefit practices have persisted across leadership change including a chief-executive transition. Anchor 3. | [T2](https://www.texarkanagazette.com/news/2026/aug/27/starbucks-union-calls-for-boycott-as-contract/) 2026-08-27 |

## Published Index Comparison

**Published index:** fortune-500 | **Published rank:** #152 | **Published composite:** 48.4/100 | **Published band:** functional

Canonical reconstruction of the published dimension vector returns **48.4**, against a published composite of **48.4**. Difference is within 0.5 points, so there is no math-hygiene issue.

Assessed 43.1 against published 48.4 — **delta -5.3**. Both values are in the Functional band (41-60); **no band crossing**, though 43.1 sits only 2.1 points above the Developing boundary.

The movement is concentrated in Awareness (3.0 to 2.8), Empathy (3.0 to 2.8), Action (3.5 to 2.8), Accountability (2.5 to 2.2) and Boundaries (3.0 to 3.0, held). The largest single fall is Action, on AC5 (follow-through): a bargaining process that has run since late 2021 without producing a contract is engagement that has not persisted to resolution.

**The reviewer should weigh one thing carefully.** After the boycott and its endorsements are correctly excluded as third-party conduct, the genuinely new in-window company conduct is: another month passing without a contract, and a spokesperson statement. That is thin evidence for a 5.3-point move. The movement rests principally on the **accumulated five-year bargaining failure**, which is not new and is already partly reflected in the published Accountability and Integrity scores of 2.5.

That is why this is filed as `flag-for-review` and not as a recommended downgrade.

## Key Findings

- Starbucks and its unionised baristas have gone almost five years without a first contract. The union organised in late 2021. There is still no agreement.
- The boycott is not something Starbucks did — it is something done to Starbucks. The benchmark does not score it against the company, and most of the flagged evidence was excluded on that basis.
- The union's numbers were not used. Labor Notes says 550 unresolved labour charges; the union's own site says more than 700. They disagree, they come from a party to the dispute, and none could be checked against a primary labour board record.
- Starbucks says it is "committed to engaging in productive bargaining" and that the boycott has not hurt its business. Both statements are company conduct and both are scored.
- Starbucks falls 5.3 points to 43.1 of 100 and stays in the Functional band. The move is filed for human review, not as a recommendation, because once the boycott is excluded the new evidence is thin.

## Strongest Dimensions

**Boundaries (3.0)**, held unchanged. Starbucks provides health coverage to part-time workers and tuition support — genuine structural benefits that most of its sector does not offer, and that are not contingent on the labour dispute.

## Weakest Dimensions

**Accountability (2.2)**. Five years of bargaining without a contract, with each side attributing the failure to the other, and an adjudicated record that is contested rather than settled. The company has not been shown to have corrected course on the central complaint, and it has not acknowledged the delay as its own.

## Evidence Gaps

- THE PRIMARY GAP: no primary National Labor Relations Board record was obtained. Every unfair-labor-practice count in circulation comes from a party to the dispute, and the figures disagree with each other by 150 or more.
- No independent assessment of which side is responsible for the bargaining failure was located. Both parties blame the other and the benchmark cannot adjudicate it.
- The Fifth Circuit decision vacating an NLRB ruling was not read in full; it is recorded as countervailing context, not scored in detail.
- No in-window independent employee survey or third-party workplace assessment was located.

## Disclosure — what this score measures

**This assessment scores what Starbucks did, not what was done to Starbucks.** The boycott, the AFL-CIO endorsement and the Chicago Teachers Union vote are excluded entirely. A company is not marked down for being the target of a campaign.

**It also declines to use the most damaging figures available**, because they come from a party to the dispute and contradict each other. Using them would have produced a larger movement on weaker evidence.

Absence of disclosure is scored 2 or 3 rather than 1 throughout; **no subdimension is scored 1 in this assessment.** The movement measures documented conduct — an unconcluded five-year negotiation and the company's public statements about it — not silence.

## Recommendation

**Filed as `flag-for-review`, not as a recommended downgrade.** Delta -5.3 meets the magnitude trigger; no band crossing, so the band-crossing evidence test does not apply.

The routing reason is evidential weight, not doubt about the facts. Once the boycott is correctly excluded as third-party conduct, the new in-window company conduct amounts to another month without a contract and a spokesperson statement. The -5.3 rests mainly on the cumulative five-year failure, which the published score already partly reflects. A founder may reasonably conclude that this is better handled as a confirmation with a watch flag.

**Confidence: low**, on evidence quality — specifically the absence of any primary labour-board record.

**Watch:** a concluded first contract would be significant positive conduct. A published, verifiable NLRB record of unresolved charges would convert the largest evidence gap in this file into scorable evidence in either direction.

## Sources

- [Texarkana Gazette — "Starbucks union calls for boycott as contract negotiations drag", 2026-08-27](https://www.texarkanagazette.com/news/2026/aug/27/starbucks-union-calls-for-boycott-as-contract/) (tier 2; source of the company statement)
- [CNBC — "Starbucks union sent the company a proposed contract. Here's what baristas want", 2026-03-13](https://www.cnbc.com/2026/03/13/starbucks-workers-united-union-contract-proposal.html) (tier 2)
- [Restaurant Dive, 2026-08-26](https://www.restaurantdive.com/news/starbucks-workers-united-boycott-investor-board-chair-ceo-proposal/829158/) (tier 2; scanner marked date_verified false — re-checked and dated)
- [Labor Notes — "Baristas ask organizations to boycott until Starbucks signs contract", 2026-08-27](https://labornotes.org/2026/08/baristas-ask-organizations-boycott-until-starbucks-signs-contract) (tier 1, labour-movement publication; union-asserted figures in this source were NOT relied on)

## Recommended Next Steps

- **Functional/Established**: Consider [Advisory Support](/advisory) to translate benchmark insights into strategic action.

---

*This assessment is based on publicly available information and does not constitute a formal Compassion Benchmark Certified Assessment. For a comprehensive, assessor-led evaluation, visit compassionbenchmark.com/certified-assessments.*
