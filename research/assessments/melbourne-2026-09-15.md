---
entity: "Melbourne"
type: "City"
sector: "Municipal Government (City of Melbourne)"
date: "2026-09-15"
composite_score: 75.9
band: "Established"
scores:
  AWR: 4
  EMP: 4
  ACT: 4.4
  EQU: 3.4
  BND: 3.4
  ACC: 4
  SYS: 4.4
  INT: 3.4
published_index: "global-cities"
published_rank: 17
published_composite: 77.4
published_band: "established"
published_dimensions:
  AWR: 4
  EMP: 4
  ACT: 4.5
  EQU: 3.5
  BND: 3.5
  ACC: 4
  SYS: 4.5
  INT: 3.5
assessed_composite: 75.9
score_delta: -1.5
band_change: false
filing_trigger_met: false
outcome: "confirmation"
recommendation: "confirm"
change_proposal: false
confidence: "low"
subdim_sidecar: true
watch_flag: null
calibration_flag: null
source: "priority"
scan_file: "research/scans/2026-09-15.json"
integration_premium: 4
published_formula_reconstruction: 77.4
math_hygiene_reconstruction_diff: 0
assessor_override_registered: false
evidence_density: { moved: 0, held_with_evidence: 4, held_no_evidence: 36 }
base: "published placeholder, integer grid rounded down"
---

# Compassion Benchmark Assessment: Melbourne

**Entity type:** City  
**Sector/Domain:** Municipal Government (City of Melbourne)  
**Assessment date:** 2026-09-15  
**Composite score:** 75.9/100  
**Band:** Established  
**Cycle:** nightly, lookback 2026-09-01 to 2026-09-15 (scan `research/scans/2026-09-15.json`, source: priority)  
**Outcome:** confirmation (recommendation: confirm)

## Why this entity was assessed

The scanner flagged Melbourne (priority 63) on an A$145 million federal crisis- and transitional-housing investment in Victoria announced on 4 September 2026. Melbourne has never been individually assessed.

## Evidence-date, provenance, attribution and screening checks

**BASELINE PROVENANCE.** No APPLIED_CHANGES entry or prior assessment; 77.4 is a placeholder.

**ATTRIBUTION (decisive).** The A$145 million comes from the Commonwealth, is directed by the Victorian government and providers, and is spread across four regions. The fetched ABC article does not mention the City of Melbourne. It is not city conduct and does not move any subdimension. The scan's framing as a Melbourne development is corrected.

**CITY'S OWN CONDUCT (pre-window background).** Homelessness Strategy 2024-30 (March 2024). A 2026-27 budget programme doubling frontline outreach with an Aboriginal community-controlled partner (June 2026, claim only; City page HTTP 403). Both support existing grid values and are not raised.

**DIRECTIONALITY.** Surfaced on positive evidence that is not attributable. No upgrade is warranted.

**TRIGGERS.** Measured 75.9 vs 77.4 (-1.5), same band. Confirmation.

## Corrections to the scan and to prior cycles (append-only)

- Scan presents the A$145 million as a Melbourne development. It is Commonwealth funding for Victoria-wide projects, with no City of Melbourne role in the fetched source.

## Score Summary

| Dimension | Code | Raw (1-5) | Scaled (0-100) | Published raw | Delta (raw) | Band |
|---|---|---|---|---|---|---|
| Awareness | AWR | 4 | 75 | 4 | 0 | Established |
| Empathy | EMP | 4 | 75 | 4 | 0 | Established |
| Action | ACT | 4.4 | 85 | 4.5 | -0.1 | Exemplary |
| Equity | EQU | 3.4 | 60 | 3.5 | -0.1 | Functional |
| Boundaries | BND | 3.4 | 60 | 3.5 | -0.1 | Functional |
| Accountability | ACC | 4 | 75 | 4 | 0 | Established |
| Systemic Thinking | SYS | 4.4 | 85 | 4.5 | -0.1 | Exemplary |
| Integrity | INT | 3.4 | 60 | 3.5 | -0.1 | Functional |
| **Composite** | — | — | **75.9** | **77.4** | **-1.5** | **Established** |

Composite computed with `computeCompositeFromDimensions` (site/scripts/lib/scoring.mjs, strict 8-dimension check). Integration premium: 4. Canonical reconstruction of the published dimensions: 77.4 (published 77.4; diff 0). No math-hygiene issue.

## Dimension Details

### AWR: Awareness (Raw 4; Score: 75/100)

| Subdimension | Score | Base | Evidence and anchor match | Source |
|---|---|---|---|---|
| A1 Suffering Detection | 4/5 | 4 | Held at 4. Context on need: young people are 10% of Victoria's homeless population but hold 3% of beds (ABC). This is a state-level measure, not a city detection mechanism. | [T2, 2026-09-04](https://www.abc.net.au/news/2026-09-04/commonwealth-invests-millions-victoria-crisis-housing/107111648) |
| A2 Contextual Sensitivity | 4/5 | 4 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| A3 Blind Spot Mitigation | 4/5 | 4 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| A4 Signal Amplification | 4/5 | 4 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| A5 Anticipatory Awareness | 4/5 | 4 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |

### EMP: Empathy (Raw 4; Score: 75/100)

| Subdimension | Score | Base | Evidence and anchor match | Source |
|---|---|---|---|---|
| E1 Affective Resonance | 4/5 | 4 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| E2 Perspective-Taking | 4/5 | 4 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| E3 Non-Judgment | 4/5 | 4 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| E4 Validation | 4/5 | 4 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| E5 Cultural Empathy | 4/5 | 4 | Held at 4. The city's 2026-27 budget programme (announced June 2026 per search results) delivers its Melbourne Outreach Team with Ngwala Willumbong, described as the first Aboriginal Community Controlled Specialist Homelessness Organisation located in the city. Claim only: the City media page returned HTTP 403, so there is no verbatim quote. | [T3, date unverified](https://www.melbourne.vic.gov.au/media/boosting-frontline-support-people-sleeping-rough) |

### ACT: Action (Raw 4.4; Score: 85/100)

| Subdimension | Score | Base | Evidence and anchor match | Source |
|---|---|---|---|---|
| AC1 Responsiveness | 5/5 | 5 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| AC2 Proportionality | 5/5 | 5 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| AC3 Efficacy | 4/5 | 4 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| AC4 Resource Mobilization | 4/5 | 4 | Held at 4. The in-window A$145 million (4 September 2026) is FEDERAL money through the Housing Australia Future Fund, delivered under the direction of the Victorian government, community housing providers and First Nations organisations, for 234 homes across Melbourne, Geelong, Mildura and Swan Hill. The ABC article does not mention the City of Melbourne. Not attributed to the city. | [T2, 2026-09-04](https://www.abc.net.au/news/2026-09-04/commonwealth-invests-millions-victoria-crisis-housing/107111648) |
| AC5 Follow-Through | 4/5 | 4 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |

### EQU: Equity (Raw 3.4; Score: 60/100)

| Subdimension | Score | Base | Evidence and anchor match | Source |
|---|---|---|---|---|
| EQ1 Universality | 3/5 | 3 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| EQ2 Priority for Vulnerable | 4/5 | 4 | Held at 4 (grid ceiling). The city's Homelessness Strategy 2024-30 names four priority cohorts: Aboriginal people, people in long-term homelessness, women, and young people aged 15-25. The consultation committed to tailored engagement with people with lived experience. | [T2, 2024-03-05](https://www.southbanklocalnews.com.au/city-of-melbourne-releases-new-homelessness-strategy/) |
| EQ3 Bias Awareness | 3/5 | 3 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| EQ4 Access Design | 4/5 | 4 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| EQ5 Historical Harm Acknowledgment | 3/5 | 3 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |

### BND: Boundaries (Raw 3.4; Score: 60/100)

| Subdimension | Score | Base | Evidence and anchor match | Source |
|---|---|---|---|---|
| B1 Self-Sustainability | 3/5 | 3 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| B2 Autonomy Preservation | 3/5 | 3 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| B3 Scope Clarity | 4/5 | 4 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| B4 Refusal Ethics | 4/5 | 4 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| B5 Consent Orientation | 3/5 | 3 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |

### ACC: Accountability (Raw 4; Score: 75/100)

| Subdimension | Score | Base | Evidence and anchor match | Source |
|---|---|---|---|---|
| AB1 Harm Acknowledgment | 4/5 | 4 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| AB2 Correction Willingness | 4/5 | 4 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| AB3 Transparency | 4/5 | 4 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| AB4 Systemic Learning | 4/5 | 4 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| AB5 Reparative Action | 4/5 | 4 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |

### SYS: Systemic Thinking (Raw 4.4; Score: 85/100)

| Subdimension | Score | Base | Evidence and anchor match | Source |
|---|---|---|---|---|
| S1 Root Cause Orientation | 5/5 | 5 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| S2 Long-Term Impact | 4/5 | 4 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| S3 Interconnection Awareness | 4/5 | 4 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| S4 Structural Critique | 4/5 | 4 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| S5 Coalitional Compassion | 5/5 | 5 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |

### INT: Integrity (Raw 3.4; Score: 60/100)

| Subdimension | Score | Base | Evidence and anchor match | Source |
|---|---|---|---|---|
| I1 Consistency Under Pressure | 3/5 | 3 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| I2 Non-Performance | 3/5 | 3 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| I3 Internal Consistency | 4/5 | 4 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| I4 Values Alignment | 3/5 | 3 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| I5 Resilience of Care | 4/5 | 4 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |

## Published Index Comparison

**Published index:** global-cities | **Published rank:** #17 of 250 | **Published composite:** 77.4/100 | **Published band:** established

| Dimension | Published (raw) | Published (scaled) | Research (raw) | Research (scaled) | Difference (scaled) | Explanation |
|---|---|---|---|---|---|---|
| AWR | 4 | 75 | 4 | 75 | 0 | Unchanged |
| EMP | 4 | 75 | 4 | 75 | 0 | Unchanged |
| ACT | 4.5 | 87.5 | 4.4 | 85 | -2.5 | Integer-grid rounding of the published value; no evidence-based move |
| EQU | 3.5 | 62.5 | 3.4 | 60 | -2.5 | Integer-grid rounding of the published value; no evidence-based move |
| BND | 3.5 | 62.5 | 3.4 | 60 | -2.5 | Integer-grid rounding of the published value; no evidence-based move |
| ACC | 4 | 75 | 4 | 75 | 0 | Unchanged |
| SYS | 4.5 | 87.5 | 4.4 | 85 | -2.5 | Integer-grid rounding of the published value; no evidence-based move |
| INT | 3.5 | 62.5 | 3.4 | 60 | -2.5 | Integer-grid rounding of the published value; no evidence-based move |
| **Composite** | — | **77.4** | — | **75.9** | **-1.5** | — |

### Score Difference Analysis

All differences are integer-grid rounding of 4.5 and 3.5 placeholder values. No evidence-based moves.

### Recommendation

Confirm 77.4 / Established.

## Key Findings

- Why it matters: the new housing money is federal, not the city's. On 4 September 2026 Australia's government committed A$145 million for 234 crisis and transitional homes across Victoria. The City of Melbourne is not named as a partner.
- Why it matters: the city's own homelessness work supports its current score. The City of Melbourne prioritises Aboriginal people, women and young people, and works with an Aboriginal community-controlled provider. That is consistent with its Established score of 77.4.

## Strongest Dimensions

- Action (ACT) at raw 4.4.
- Systemic Thinking (SYS) at raw 4.4.


## Weakest Dimensions

- Integrity (INT) at raw 3.4.
- Boundaries (BND) at raw 3.4.


## Evidence Gaps

- City of Melbourne media release (HTTP 403) not read; no outcome data on rough-sleeping numbers after 2021; local-law enforcement against rough sleepers not examined.

## Recommended Next Steps

- Consider [Advisory Support](/advisory) to translate benchmark insights into strategic action.

## Sources

- [https://www.abc.net.au/news/2026-09-04/commonwealth-invests-millions-victoria-crisis-housing/107111648](https://www.abc.net.au/news/2026-09-04/commonwealth-invests-millions-victoria-crisis-housing/107111648) (tier 2, 2026-09-04)
- [https://www.melbourne.vic.gov.au/media/boosting-frontline-support-people-sleeping-rough](https://www.melbourne.vic.gov.au/media/boosting-frontline-support-people-sleeping-rough) (tier 3, date unverified)
- [https://www.southbanklocalnews.com.au/city-of-melbourne-releases-new-homelessness-strategy/](https://www.southbanklocalnews.com.au/city-of-melbourne-releases-new-homelessness-strategy/) (tier 2, 2024-03-05)

---

This assessment is based on publicly available information and does not constitute a formal Compassion Benchmark Certified Assessment. For a comprehensive, assessor-led evaluation, visit compassionbenchmark.com/certified-assessments.
