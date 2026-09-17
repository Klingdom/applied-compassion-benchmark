---
entity: "Starbucks"
type: "Company"
sector: "Food/Retail"
date: "2026-09-17"
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
filing_trigger_met: true
outcome: "measured-not-filed"
recommendation: "downgrade"
change_proposal: false
confidence: "low"
subdim_sidecar: true
watch_flag: true
calibration_flag: null
source: "priority"
scan_file: "research/scans/2026-09-17.json"
integration_premium: 0
grid_only_composite: 43.1
math_hygiene_reconstruction_diff: 0
---

# Compassion Benchmark Assessment: Starbucks

**Entity type:** Company  
**Sector/Domain:** Food/Retail  
**Assessment date:** 2026-09-17  
**Composite score:** 43.1/100  
**Band:** Functional  
**Cycle:** nightly, lookback 2026-09-03 to 2026-09-17 (scan `research/scans/2026-09-17.json`, source: priority)  
**Outcome:** measured-not-filed (recommendation: downgrade)

## Why this entity was assessed

The scanner flagged Starbucks (priority 40) on a 4 September 2026 ruling by the US Court of Appeals for the 5th Circuit. The court refused to enforce most of a National Labor Relations Board (NLRB) ruling about a Wichita, Kansas store. It upheld the finding that Starbucks illegally threatened to deny maternity leave benefits to a pregnant employee if workers unionized. Starbucks was last assessed on 2026-09-01, which filed a proposal (48.4 to 43.1, flag-for-review) that is still pending.

## Evidence-date, provenance, attribution and screening checks

**PENDING PROPOSAL EXISTS - NOT DUPLICATED, NOT MODIFIED.** `research/change-proposals/starbucks-2026-09-01.json` (status pending) proposes 48.4 to 43.1. Its baseline equals the live index (drift 0.0). This cycle starts from that sidecar and measures 43.1, the same value. The magnitude trigger is met (-5.3), but a second filing would duplicate the queue item. Outcome: measured-not-filed, corroborating.

**THE RULING CUTS BOTH WAYS.** The 5th Circuit (2-0, Judge Stephen Higginson writing) rejected the NLRB's findings that the store closed its hiring portal and cut hours because of union activity. It upheld one finding: an illegal threat to deny maternity leave benefits to a pregnant employee. A court-upheld unlawful threat is scorable company conduct. But the conduct is old (the Wichita campaign) and most claims failed. The published ACC and INT of 2.5 already encode the labour dispute, as the pending proposal notes. So nothing moves.

**NO STALE-BASELINE ARGUMENT; DIRECTION MATCHES.** Mixed evidence, net negative on the upheld finding. Only a downward move would be considered, and none is warranted beyond the pending proposal.

## Score Summary

| Dimension | Code | Raw (1-5) | Scaled (0-100) | Published raw | Delta (raw) | Band |
|---|---|---|---|---|---|---|
| Awareness | AWR | 2.8 | 45 | 3 | -0.2 | Functional |
| Empathy | EMP | 2.8 | 45 | 3 | -0.2 | Functional |
| Action | ACT | 2.8 | 45 | 3.5 | -0.7 | Functional |
| Equity | EQU | 2.8 | 45 | 3 | -0.2 | Functional |
| Boundaries | BND | 3 | 50 | 3 | 0 | Functional |
| Accountability | ACC | 2.2 | 30 | 2.5 | -0.3 | Developing |
| Systemic Thinking | SYS | 2.8 | 45 | 3 | -0.2 | Functional |
| Integrity | INT | 2.6 | 40 | 2.5 | 0.1 | Developing |
| **Composite** | — | — | **43.1** | **48.4** | **-5.3** | **Functional** |

**Band:** Functional (published: functional). Integration premium (a bonus for being strong across all 8 areas): 0. Canonical reconstruction of the published vector: 48.4 (published 48.4; difference 0, so no math-hygiene issue). Baseline-only composite before any evidence move (prior sidecar): 43.1.

**Evidence density:** 0 subdimensions moved on located evidence; 2 held with new located evidence; 38 held with no new evidence this cycle.

## Dimension Details

### AWR: Awareness (raw 2.8/5 — scaled 45/100)

| Subdimension | Score | Evidence and anchor match | Source |
|---|---|---|---|
| A1 Suffering Detection | 3/5 | Held at the prior documented assessment value (starbucks-2026-09-01.subdims.json). Prior evidence carried; no new in-window evidence located this cycle bears on this subdimension. | [T2](https://www.cnbc.com/2026/03/13/starbucks-workers-united-union-contract-proposal.html) 2026-03-13 |
| A2 Contextual Sensitivity | 3/5 | Held at the prior documented assessment value (starbucks-2026-09-01.subdims.json). Prior evidence carried; no new in-window evidence located this cycle bears on this subdimension. | [T2](https://www.cnbc.com/2026/03/13/starbucks-workers-united-union-contract-proposal.html) 2026-03-13 |
| A3 Blind Spot Mitigation | 3/5 | Held at the prior documented assessment value (starbucks-2026-09-01.subdims.json). Prior evidence carried; no new in-window evidence located this cycle bears on this subdimension. | [T2](https://www.texarkanagazette.com/news/2026/aug/27/starbucks-union-calls-for-boycott-as-contract/) 2026-08-27 |
| A4 Signal Amplification | 2/5 | Held at the prior documented assessment value (starbucks-2026-09-01.subdims.json). Prior evidence carried; no new in-window evidence located this cycle bears on this subdimension. | [T1](https://labornotes.org/2026/08/baristas-ask-organizations-boycott-until-starbucks-signs-contract) 2026-08-27 |
| A5 Anticipatory Awareness | 3/5 | Held at the prior documented assessment value (starbucks-2026-09-01.subdims.json). Prior evidence carried; no new in-window evidence located this cycle bears on this subdimension. | [T2](https://www.texarkanagazette.com/news/2026/aug/27/starbucks-union-calls-for-boycott-as-contract/) 2026-08-27 |

### EMP: Empathy (raw 2.8/5 — scaled 45/100)

| Subdimension | Score | Evidence and anchor match | Source |
|---|---|---|---|
| E1 Affective Resonance | 3/5 | Held at the prior documented assessment value (starbucks-2026-09-01.subdims.json). Prior evidence carried; no new in-window evidence located this cycle bears on this subdimension. | [T2](https://www.texarkanagazette.com/news/2026/aug/27/starbucks-union-calls-for-boycott-as-contract/) 2026-08-27 |
| E2 Perspective-Taking | 3/5 | Held at the prior documented assessment value (starbucks-2026-09-01.subdims.json). Prior evidence carried; no new in-window evidence located this cycle bears on this subdimension. | [T2](https://www.cnbc.com/2026/03/13/starbucks-workers-united-union-contract-proposal.html) 2026-03-13 |
| E3 Non-Judgment | 3/5 | Held at the prior documented assessment value (starbucks-2026-09-01.subdims.json). Prior evidence carried; no new in-window evidence located this cycle bears on this subdimension. | [T2](https://www.texarkanagazette.com/news/2026/aug/27/starbucks-union-calls-for-boycott-as-contract/) 2026-08-27 |
| E4 Validation | 2/5 | Held at the prior documented assessment value (starbucks-2026-09-01.subdims.json). Prior evidence carried; no new in-window evidence located this cycle bears on this subdimension. | [T2](https://www.texarkanagazette.com/news/2026/aug/27/starbucks-union-calls-for-boycott-as-contract/) 2026-08-27 |
| E5 Cultural Empathy | 3/5 | Held at the prior documented assessment value (starbucks-2026-09-01.subdims.json). Prior evidence carried; no new in-window evidence located this cycle bears on this subdimension. | [T2](https://www.texarkanagazette.com/news/2026/aug/27/starbucks-union-calls-for-boycott-as-contract/) 2026-08-27 |

### ACT: Action (raw 2.8/5 — scaled 45/100)

| Subdimension | Score | Evidence and anchor match | Source |
|---|---|---|---|
| AC1 Responsiveness | 3/5 | Held at the prior documented assessment value (starbucks-2026-09-01.subdims.json). Prior evidence carried; no new in-window evidence located this cycle bears on this subdimension. | [T2](https://www.texarkanagazette.com/news/2026/aug/27/starbucks-union-calls-for-boycott-as-contract/) 2026-08-27 |
| AC2 Proportionality | 3/5 | Held at the prior documented assessment value (starbucks-2026-09-01.subdims.json). Prior evidence carried; no new in-window evidence located this cycle bears on this subdimension. | [T1](https://labornotes.org/2026/08/baristas-ask-organizations-boycott-until-starbucks-signs-contract) 2026-08-27 |
| AC3 Efficacy | 3/5 | Held at the prior documented assessment value (starbucks-2026-09-01.subdims.json). Prior evidence carried; no new in-window evidence located this cycle bears on this subdimension. | [T2](https://www.texarkanagazette.com/news/2026/aug/27/starbucks-union-calls-for-boycott-as-contract/) 2026-08-27 |
| AC4 Resource Mobilization | 3/5 | Held at the prior documented assessment value (starbucks-2026-09-01.subdims.json). Prior evidence carried; no new in-window evidence located this cycle bears on this subdimension. | [T2](https://www.texarkanagazette.com/news/2026/aug/27/starbucks-union-calls-for-boycott-as-contract/) 2026-08-27 |
| AC5 Follow-Through | 2/5 | Held at the prior documented assessment value (starbucks-2026-09-01.subdims.json). Prior evidence carried; no new in-window evidence located this cycle bears on this subdimension. | [T1](https://labornotes.org/2026/08/baristas-ask-organizations-boycott-until-starbucks-signs-contract) 2026-08-27 |

### EQU: Equity (raw 2.8/5 — scaled 45/100)

| Subdimension | Score | Evidence and anchor match | Source |
|---|---|---|---|
| EQ1 Universality | 3/5 | Held at the prior documented assessment value (starbucks-2026-09-01.subdims.json). Prior evidence carried; no new in-window evidence located this cycle bears on this subdimension. | [T2](https://www.texarkanagazette.com/news/2026/aug/27/starbucks-union-calls-for-boycott-as-contract/) 2026-08-27 |
| EQ2 Priority for Vulnerable | 3/5 | Held at the prior documented assessment value (starbucks-2026-09-01.subdims.json). Prior evidence carried; no new in-window evidence located this cycle bears on this subdimension. | [T2](https://www.texarkanagazette.com/news/2026/aug/27/starbucks-union-calls-for-boycott-as-contract/) 2026-08-27 |
| EQ3 Bias Awareness | 3/5 | Held at the prior documented assessment value (starbucks-2026-09-01.subdims.json). Prior evidence carried; no new in-window evidence located this cycle bears on this subdimension. | [T2](https://www.texarkanagazette.com/news/2026/aug/27/starbucks-union-calls-for-boycott-as-contract/) 2026-08-27 |
| EQ4 Access Design | 3/5 | Held at the prior documented assessment value (starbucks-2026-09-01.subdims.json). Prior evidence carried; no new in-window evidence located this cycle bears on this subdimension. | [T2](https://www.texarkanagazette.com/news/2026/aug/27/starbucks-union-calls-for-boycott-as-contract/) 2026-08-27 |
| EQ5 Historical Harm Acknowledgment | 2/5 | Held at the prior documented assessment value (starbucks-2026-09-01.subdims.json). Prior evidence carried; no new in-window evidence located this cycle bears on this subdimension. | [T1](https://labornotes.org/2026/08/baristas-ask-organizations-boycott-until-starbucks-signs-contract) 2026-08-27 |

### BND: Boundaries (raw 3/5 — scaled 50/100)

| Subdimension | Score | Evidence and anchor match | Source |
|---|---|---|---|
| B1 Self-Sustainability | 3/5 | Held at the prior documented assessment value (starbucks-2026-09-01.subdims.json). Prior evidence carried; no new in-window evidence located this cycle bears on this subdimension. | [T1](https://labornotes.org/2026/08/baristas-ask-organizations-boycott-until-starbucks-signs-contract) 2026-08-27 |
| B2 Autonomy Preservation | 3/5 | Held at the prior documented assessment value (starbucks-2026-09-01.subdims.json). Prior evidence carried; no new in-window evidence located this cycle bears on this subdimension. | [T2](https://www.texarkanagazette.com/news/2026/aug/27/starbucks-union-calls-for-boycott-as-contract/) 2026-08-27 |
| B3 Scope Clarity | 3/5 | Held at the prior documented assessment value (starbucks-2026-09-01.subdims.json). Prior evidence carried; no new in-window evidence located this cycle bears on this subdimension. | [T2](https://www.texarkanagazette.com/news/2026/aug/27/starbucks-union-calls-for-boycott-as-contract/) 2026-08-27 |
| B4 Refusal Ethics | 3/5 | Held at the prior documented assessment value (starbucks-2026-09-01.subdims.json). Prior evidence carried; no new in-window evidence located this cycle bears on this subdimension. | [T2](https://www.texarkanagazette.com/news/2026/aug/27/starbucks-union-calls-for-boycott-as-contract/) 2026-08-27 |
| B5 Consent Orientation | 3/5 | Held at the prior documented assessment value (starbucks-2026-09-01.subdims.json). Prior evidence carried; no new in-window evidence located this cycle bears on this subdimension. | [T2](https://www.cnbc.com/2026/03/13/starbucks-workers-united-union-contract-proposal.html) 2026-03-13 |

### ACC: Accountability (raw 2.2/5 — scaled 30/100)

| Subdimension | Score | Evidence and anchor match | Source |
|---|---|---|---|
| AB1 Harm Acknowledgment | 2/5 | IN-WINDOW: Starbucks did not comment on the ruling. Harm is acknowledged only when established externally. Anchor 2; held. | [T2](https://www.texarkanagazette.com/news/2026/aug/27/starbucks-union-calls-for-boycott-as-contract/) 2026-08-27; [T2](https://www.bnnbloomberg.ca/business/company-news/2026/09/04/us-labour-relations-board-sees-setback-in-starbucks-anti-unionization-case/) 2026-09-04 |
| AB2 Correction Willingness | 2/5 | Held at the prior documented assessment value (starbucks-2026-09-01.subdims.json). Prior evidence carried; no new in-window evidence located this cycle bears on this subdimension. | [T1](https://labornotes.org/2026/08/baristas-ask-organizations-boycott-until-starbucks-signs-contract) 2026-08-27 |
| AB3 Transparency | 3/5 | Held at the prior documented assessment value (starbucks-2026-09-01.subdims.json). Prior evidence carried; no new in-window evidence located this cycle bears on this subdimension. | [T2](https://www.texarkanagazette.com/news/2026/aug/27/starbucks-union-calls-for-boycott-as-contract/) 2026-08-27 |
| AB4 Systemic Learning | 2/5 | Held at the prior documented assessment value (starbucks-2026-09-01.subdims.json). Prior evidence carried; no new in-window evidence located this cycle bears on this subdimension. | [T1](https://labornotes.org/2026/08/baristas-ask-organizations-boycott-until-starbucks-signs-contract) 2026-08-27 |
| AB5 Reparative Action | 2/5 | Held at the prior documented assessment value (starbucks-2026-09-01.subdims.json). Prior evidence carried; no new in-window evidence located this cycle bears on this subdimension. | [T1](https://labornotes.org/2026/08/baristas-ask-organizations-boycott-until-starbucks-signs-contract) 2026-08-27 |

### SYS: Systemic Thinking (raw 2.8/5 — scaled 45/100)

| Subdimension | Score | Evidence and anchor match | Source |
|---|---|---|---|
| S1 Root Cause Orientation | 3/5 | Held at the prior documented assessment value (starbucks-2026-09-01.subdims.json). Prior evidence carried; no new in-window evidence located this cycle bears on this subdimension. | [T2](https://www.texarkanagazette.com/news/2026/aug/27/starbucks-union-calls-for-boycott-as-contract/) 2026-08-27 |
| S2 Long-Term Impact | 3/5 | Held at the prior documented assessment value (starbucks-2026-09-01.subdims.json). Prior evidence carried; no new in-window evidence located this cycle bears on this subdimension. | [T2](https://www.texarkanagazette.com/news/2026/aug/27/starbucks-union-calls-for-boycott-as-contract/) 2026-08-27 |
| S3 Interconnection Awareness | 3/5 | Held at the prior documented assessment value (starbucks-2026-09-01.subdims.json). Prior evidence carried; no new in-window evidence located this cycle bears on this subdimension. | [T2](https://www.restaurantdive.com/news/starbucks-workers-united-boycott-investor-board-chair-ceo-proposal/829158/) 2026-08-26 |
| S4 Structural Critique | 2/5 | Held at the prior documented assessment value (starbucks-2026-09-01.subdims.json). Prior evidence carried; no new in-window evidence located this cycle bears on this subdimension. | [T1](https://labornotes.org/2026/08/baristas-ask-organizations-boycott-until-starbucks-signs-contract) 2026-08-27 |
| S5 Coalitional Compassion | 3/5 | Held at the prior documented assessment value (starbucks-2026-09-01.subdims.json). Prior evidence carried; no new in-window evidence located this cycle bears on this subdimension. | [T2](https://www.texarkanagazette.com/news/2026/aug/27/starbucks-union-calls-for-boycott-as-contract/) 2026-08-27 |

### INT: Integrity (raw 2.6/5 — scaled 40/100)

| Subdimension | Score | Evidence and anchor match | Source |
|---|---|---|---|
| I1 Consistency Under Pressure | 2/5 | Held at the prior documented assessment value (starbucks-2026-09-01.subdims.json). Prior evidence carried; no new in-window evidence located this cycle bears on this subdimension. | [T1](https://labornotes.org/2026/08/baristas-ask-organizations-boycott-until-starbucks-signs-contract) 2026-08-27 |
| I2 Non-Performance | 3/5 | Held at the prior documented assessment value (starbucks-2026-09-01.subdims.json). Prior evidence carried; no new in-window evidence located this cycle bears on this subdimension. | [T2](https://www.texarkanagazette.com/news/2026/aug/27/starbucks-union-calls-for-boycott-as-contract/) 2026-08-27 |
| I3 Internal Consistency | 3/5 | IN-WINDOW ADJUDICATION: an appeals court upheld the finding that a manager illegally threatened to deny maternity benefits to a pregnant employee if the store unionized. The same court rejected the hours and hiring-portal claims. One upheld store-level violation fits a real but incomplete effort to apply values to staff. Anchor 3; held. | [T2](https://www.texarkanagazette.com/news/2026/aug/27/starbucks-union-calls-for-boycott-as-contract/) 2026-08-27; [T5](https://www.bnnbloomberg.ca/business/company-news/2026/09/04/us-labour-relations-board-sees-setback-in-starbucks-anti-unionization-case/) 2026-09-04 |
| I4 Values Alignment | 2/5 | Held at the prior documented assessment value (starbucks-2026-09-01.subdims.json). Prior evidence carried; no new in-window evidence located this cycle bears on this subdimension. | [T2](https://www.texarkanagazette.com/news/2026/aug/27/starbucks-union-calls-for-boycott-as-contract/) 2026-08-27 |
| I5 Resilience of Care | 3/5 | Held at the prior documented assessment value (starbucks-2026-09-01.subdims.json). Prior evidence carried; no new in-window evidence located this cycle bears on this subdimension. | [T2](https://www.texarkanagazette.com/news/2026/aug/27/starbucks-union-calls-for-boycott-as-contract/) 2026-08-27 |

## Published Index Comparison

**Published index:** fortune-500 | **Published rank:** #152 | **Published composite:** 48.4/100 | **Published band:** functional

| Dimension | Published (raw) | Published (scaled) | Research (raw) | Research (scaled) | Difference (scaled) | Explanation |
|---|---|---|---|---|---|---|
| AWR | 3 | 50 | 2.8 | 45 | -5 | Within 10 points; see dimension table. |
| EMP | 3 | 50 | 2.8 | 45 | -5 | Within 10 points; see dimension table. |
| ACT | 3.5 | 62.5 | 2.8 | 45 | -17.5 | See dimension table and the provenance note above. |
| EQU | 3 | 50 | 2.8 | 45 | -5 | Within 10 points; see dimension table. |
| BND | 3 | 50 | 3 | 50 | 0 | Within 10 points; see dimension table. |
| ACC | 2.5 | 37.5 | 2.2 | 30 | -7.5 | Within 10 points; see dimension table. |
| SYS | 3 | 50 | 2.8 | 45 | -5 | Within 10 points; see dimension table. |
| INT | 2.5 | 37.5 | 2.6 | 40 | 2.5 | Within 10 points; see dimension table. |
| **Composite** | — | **48.4** | — | **43.1** | **-5.3** | — |

### Recommendation

MEASURED-NOT-FILED. Measured 43.1 (-5.3) equals the pending 2026-09-01 proposal. Review that proposal; do not open a second one.

## Key Findings

- Starbucks' published 48.4 out of 100 is already under review. A 2026-09-01 proposal to lower it to 43.1 is pending, and this cycle measures the same 43.1.
- On 4 September 2026 a federal appeals court upheld that Starbucks illegally threatened to deny maternity benefits to a pregnant worker if her store unionized.
- The same court threw out the other claims, about cut hours and a closed hiring portal. The mixed ruling adds support to the pending review but no new score change.

## Strongest Dimensions

Boundaries (raw 3.0) and several dimensions at 2.8, carried from the 2026-09-01 sidecar.

## Weakest Dimensions

Accountability (raw 2.2).

## Evidence Gaps

- The date of the Wichita manager's threat and whether Starbucks will seek further review were not established.
- No in-window bargaining update was located. A search returned only March-April 2026 material and a Canadian store's union certification (a third party's act, not scored).

## Scanner and source corrections

- None material. The underlying conduct predates the window; only the appeals ruling is in-window.

## Watch flag

Carried. The pending 43.1 sits 2.1 points above the Developing boundary. Any band crossing would need at least two sources including one at tier 4 or above.

## Recommended Next Steps

Consider [Advisory Support](/advisory) to translate benchmark insights into strategic action.

## Sources

- www.cnbc.com — 2026-03-13 — tier 2 — https://www.cnbc.com/2026/03/13/starbucks-workers-united-union-contract-proposal.html
- www.texarkanagazette.com — 2026-08-27 — tier 2 — https://www.texarkanagazette.com/news/2026/aug/27/starbucks-union-calls-for-boycott-as-contract/
- labornotes.org — 2026-08-27 — tier 1 — https://labornotes.org/2026/08/baristas-ask-organizations-boycott-until-starbucks-signs-contract
- BNN Bloomberg (Reuters) — 2026-09-04 — tier 2 — https://www.bnnbloomberg.ca/business/company-news/2026/09/04/us-labour-relations-board-sees-setback-in-starbucks-anti-unionization-case/
- www.restaurantdive.com — 2026-08-26 — tier 2 — https://www.restaurantdive.com/news/starbucks-workers-united-boycott-investor-board-chair-ceo-proposal/829158/
- US News (Reuters) - fetch timed out; not quoted — 2026-09-04 — tier 2 — https://www.usnews.com/news/top-news/articles/2026-09-04/starbucks-anti-unionization-case-brought-by-nlrb-narrowed-by-us-appeals-court

---

*This assessment is based on publicly available information and does not constitute a formal Compassion Benchmark Certified Assessment. For a comprehensive, assessor-led evaluation, visit compassionbenchmark.com/certified-assessments.*
