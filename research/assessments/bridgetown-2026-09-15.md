---
entity: "Bridgetown"
type: "City"
sector: "Government (Bridgetown, Barbados — national-government administered)"
date: "2026-09-15"
composite_score: 58.7
band: "Functional"
scores:
  AWR: 3.4
  EMP: 3.4
  ACT: 3.4
  EQU: 3
  BND: 3.4
  ACC: 3.4
  SYS: 3.4
  INT: 3.4
published_index: "global-cities"
published_rank: 32
published_composite: 60.9
published_band: "established"
published_dimensions:
  AWR: 3.5
  EMP: 3.5
  ACT: 3.5
  EQU: 3
  BND: 3.5
  ACC: 3.5
  SYS: 3.5
  INT: 3.5
assessed_composite: 58.7
score_delta: -2.2
band_change: true
filing_trigger_met: true
outcome: "withheld"
recommendation: "flag-for-review"
change_proposal: false
confidence: "low"
subdim_sidecar: true
watch_flag: "Chapman Lane rebuilding: whether untitled residents receive help (EQ1), and delivery of the Bridgetown Redevelopment Master Plan (S2)."
calibration_flag: "Published 60.9 is a never-assessed placeholder identical in shape to Netflix (seven dimensions at 3.5, EQU 3.0), 0.9 above the Established line. Integer-grid rounding alone gives 58.7 (Functional). Recommend cohort calibration study of the 60.9 placeholder group."
source: "priority"
scan_file: "research/scans/2026-09-15.json"
integration_premium: 0
published_formula_reconstruction: 60.9
math_hygiene_reconstruction_diff: 0
assessor_override_registered: false
evidence_density: { moved: 0, held_with_evidence: 4, held_no_evidence: 36 }
base: "published placeholder, integer grid rounded down"
---

# Compassion Benchmark Assessment: Bridgetown

**Entity type:** City  
**Sector/Domain:** Government (Bridgetown, Barbados — national-government administered)  
**Assessment date:** 2026-09-15  
**Composite score:** 58.7/100  
**Band:** Functional  
**Cycle:** nightly, lookback 2026-09-01 to 2026-09-15 (scan `research/scans/2026-09-15.json`, source: priority)  
**Outcome:** withheld (recommendation: flag-for-review)

## Why this entity was assessed

The scanner flagged Bridgetown (priority 58) on the Chapman Lane fire that left several families homeless and renewed calls to fast-track redevelopment. Bridgetown has never been individually assessed.

## Evidence-date, provenance, attribution and screening checks

**BASELINE PROVENANCE.** No APPLIED_CHANGES entry or prior assessment; 60.9 is a placeholder.

**ATTRIBUTION.** Every responder in the fetched sources is a national-government actor: the MP for the City (also Minister of Legal Affairs), the Minister of State in the Prime Minister's Office, the RUDC and the Social Empowerment Agency. The global-cities entity is scored on that governance of the city.

**DATES.** Fire about 3 am on 3 September 2026 (Nation News, CBC, same day). Rebuilding assessment reported 8 September (Barbados Today URL date; the fetch summariser misreported it as 'August 9'). All in window.

**DIRECTIONALITY.** Surfaced as a negative (fire risk). The fetched sources show a prompt, positive state response, which supports held grid ceilings (AC1 at 4). There is no evidence-based move in either direction.

**BAND-CROSSING EVIDENCE TEST (fails).** Measured 58.7 (Functional) vs 60.9 (Established). The entire -2.2 is integer-grid rounding of the placeholder, and there is no tier-4+ source. The in-window evidence is, if anything, positive. Filing a downgrade would contradict the evidence (screening rule 3), and the crossing is a calibration artifact (rule 5). WITHHELD; flag-for-review.

## Corrections to the scan and to prior cycles (append-only)

- The scan frames the story as fire risk and delayed redevelopment. It omits the documented rapid state response (families rehoused within hours; rebuilding assessment on 8 Sept).
- The scan says 'major fire'. Verified: four houses destroyed, no injuries.

## Score Summary

| Dimension | Code | Raw (1-5) | Scaled (0-100) | Published raw | Delta (raw) | Band |
|---|---|---|---|---|---|---|
| Awareness | AWR | 3.4 | 60 | 3.5 | -0.1 | Functional |
| Empathy | EMP | 3.4 | 60 | 3.5 | -0.1 | Functional |
| Action | ACT | 3.4 | 60 | 3.5 | -0.1 | Functional |
| Equity | EQU | 3 | 50 | 3 | 0 | Functional |
| Boundaries | BND | 3.4 | 60 | 3.5 | -0.1 | Functional |
| Accountability | ACC | 3.4 | 60 | 3.5 | -0.1 | Functional |
| Systemic Thinking | SYS | 3.4 | 60 | 3.5 | -0.1 | Functional |
| Integrity | INT | 3.4 | 60 | 3.5 | -0.1 | Functional |
| **Composite** | — | — | **58.7** | **60.9** | **-2.2** | **Functional** |

Composite computed with `computeCompositeFromDimensions` (site/scripts/lib/scoring.mjs, strict 8-dimension check). Integration premium: 0. Canonical reconstruction of the published dimensions: 60.9 (published 60.9; diff 0). No math-hygiene issue.

## Dimension Details

### AWR: Awareness (Raw 3.4; Score: 60/100)

| Subdimension | Score | Base | Evidence and anchor match | Source |
|---|---|---|---|---|
| A1 Suffering Detection | 4/5 | 4 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| A2 Contextual Sensitivity | 4/5 | 4 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| A3 Blind Spot Mitigation | 3/5 | 3 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| A4 Signal Amplification | 3/5 | 3 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| A5 Anticipatory Awareness | 3/5 | 3 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |

### EMP: Empathy (Raw 3.4; Score: 60/100)

| Subdimension | Score | Base | Evidence and anchor match | Source |
|---|---|---|---|---|
| E1 Affective Resonance | 4/5 | 4 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| E2 Perspective-Taking | 3/5 | 3 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| E3 Non-Judgment | 3/5 | 3 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| E4 Validation | 4/5 | 4 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| E5 Cultural Empathy | 3/5 | 3 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |

### ACT: Action (Raw 3.4; Score: 60/100)

| Subdimension | Score | Base | Evidence and anchor match | Source |
|---|---|---|---|---|
| AC1 Responsiveness | 4/5 | 4 | Held at 4 (grid ceiling; supported). Fire at Chapman Lane about 3 am on 3 September 2026 destroyed four homes, with no injuries. The MP for the City, Michael Lashley (a Cabinet minister), was at the scene before 5 am, and social agencies were mobilised. Families were in alternative housing within hours. Rapid, but no published response standard, so it is not raised to 5. | [T2, 2026-09-03](https://www.cbc.bb/main-stories/measures-being-put-in-place-to-assist-chapman-lane-fire-victims/); [T2, 2026-09-08](https://barbadostoday.bb/2026/09/08/govt-assesses-rebuilding-options-after-chapman-lane-fire/); [T2, 2026-09-03](https://nationnews.com/2026/09/03/fire-destroys-four-houses-in-chapman-lane/) |
| AC2 Proportionality | 4/5 | 4 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| AC3 Efficacy | 3/5 | 3 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| AC4 Resource Mobilization | 3/5 | 3 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| AC5 Follow-Through | 3/5 | 3 | Held at 3. Five days later (8 September) Minister of State Shane Archer, the MP and Rural and Urban Development Commission (RUDC) officials assessed rebuilding options, contingent on whether residents hold land titles. A defined follow-up for this case, but conditional, so anchor 3. | [T2, 2026-09-08](https://barbadostoday.bb/2026/09/08/govt-assesses-rebuilding-options-after-chapman-lane-fire/) |

### EQU: Equity (Raw 3; Score: 50/100)

| Subdimension | Score | Base | Evidence and anchor match | Source |
|---|---|---|---|---|
| EQ1 Universality | 3/5 | 3 | Held at 3. Tying rebuilding help to land titles risks excluding untitled residents in old, crowded city neighbourhoods. Outcome unknown; watch. | [T2, 2026-09-08](https://barbadostoday.bb/2026/09/08/govt-assesses-rebuilding-options-after-chapman-lane-fire/) |
| EQ2 Priority for Vulnerable | 3/5 | 3 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| EQ3 Bias Awareness | 3/5 | 3 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| EQ4 Access Design | 3/5 | 3 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| EQ5 Historical Harm Acknowledgment | 3/5 | 3 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |

### BND: Boundaries (Raw 3.4; Score: 60/100)

| Subdimension | Score | Base | Evidence and anchor match | Source |
|---|---|---|---|---|
| B1 Self-Sustainability | 4/5 | 4 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| B2 Autonomy Preservation | 3/5 | 3 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| B3 Scope Clarity | 3/5 | 3 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| B4 Refusal Ethics | 4/5 | 4 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| B5 Consent Orientation | 3/5 | 3 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |

### ACC: Accountability (Raw 3.4; Score: 60/100)

| Subdimension | Score | Base | Evidence and anchor match | Source |
|---|---|---|---|---|
| AB1 Harm Acknowledgment | 3/5 | 3 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| AB2 Correction Willingness | 4/5 | 4 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| AB3 Transparency | 4/5 | 4 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| AB4 Systemic Learning | 3/5 | 3 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| AB5 Reparative Action | 3/5 | 3 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |

### SYS: Systemic Thinking (Raw 3.4; Score: 60/100)

| Subdimension | Score | Base | Evidence and anchor match | Source |
|---|---|---|---|---|
| S1 Root Cause Orientation | 3/5 | 3 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| S2 Long-Term Impact | 3/5 | 3 | Held at 3. A Bridgetown Redevelopment Master Plan exists. A former contractors' association president says the fire shows the plans must be fast-tracked from planning to action, given ageing, crowded building stock. Long-term plan with slow delivery: anchor 3. | [T2, 2026-09-03](https://barbadostoday.bb/2026/09/03/contractor-urges-fast-tracking-of-bridgetown-redevelopment-plans/) |
| S3 Interconnection Awareness | 4/5 | 4 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| S4 Structural Critique | 3/5 | 3 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| S5 Coalitional Compassion | 4/5 | 4 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |

### INT: Integrity (Raw 3.4; Score: 60/100)

| Subdimension | Score | Base | Evidence and anchor match | Source |
|---|---|---|---|---|
| I1 Consistency Under Pressure | 4/5 | 4 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| I2 Non-Performance | 4/5 | 4 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| I3 Internal Consistency | 3/5 | 3 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| I4 Values Alignment | 3/5 | 3 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| I5 Resilience of Care | 3/5 | 3 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |

## Published Index Comparison

**Published index:** global-cities | **Published rank:** #32 of 250 | **Published composite:** 60.9/100 | **Published band:** established

| Dimension | Published (raw) | Published (scaled) | Research (raw) | Research (scaled) | Difference (scaled) | Explanation |
|---|---|---|---|---|---|---|
| AWR | 3.5 | 62.5 | 3.4 | 60 | -2.5 | Integer-grid rounding of the published value; no evidence-based move |
| EMP | 3.5 | 62.5 | 3.4 | 60 | -2.5 | Integer-grid rounding of the published value; no evidence-based move |
| ACT | 3.5 | 62.5 | 3.4 | 60 | -2.5 | Integer-grid rounding of the published value; no evidence-based move |
| EQU | 3 | 50 | 3 | 50 | 0 | Unchanged |
| BND | 3.5 | 62.5 | 3.4 | 60 | -2.5 | Integer-grid rounding of the published value; no evidence-based move |
| ACC | 3.5 | 62.5 | 3.4 | 60 | -2.5 | Integer-grid rounding of the published value; no evidence-based move |
| SYS | 3.5 | 62.5 | 3.4 | 60 | -2.5 | Integer-grid rounding of the published value; no evidence-based move |
| INT | 3.5 | 62.5 | 3.4 | 60 | -2.5 | Integer-grid rounding of the published value; no evidence-based move |
| **Composite** | — | **60.9** | — | **58.7** | **-2.2** | — |

### Score Difference Analysis

All differences are integer-grid rounding of 3.5 placeholders. The four evidenced subdimensions are held at grid values consistent with the evidence.

### Recommendation

Do not file. The band-crossing trigger is formally met, but the crossing is a placeholder-rounding artifact and the conduct evidence is positive. WITHHELD and referred to calibration review with the 60.9 cohort (see Netflix).

## Key Findings

- Why it matters: Barbados rehoused fire victims within hours. A 3 am fire on 3 September 2026 destroyed four homes in Chapman Lane, Bridgetown. No one was hurt, and families were in alternative housing the same morning.
- Why it matters: rebuilding help may depend on land papers. On 8 September officials checked whether residents hold land titles before planning rebuilds. That could leave out residents without titles.
- Why it matters: the Established label rests on a placeholder. Bridgetown's 60.9 has never been checked. Rounding it to whole-number anchors gives 58.7, a calibration question and not a finding against the city.

## Strongest Dimensions

- Awareness (AWR) at raw 3.4.
- Empathy (EMP) at raw 3.4.


## Weakest Dimensions

- Equity (EQU) at raw 3.
- Integrity (INT) at raw 3.4.


## Evidence Gaps

- Number of people displaced not reported.
- Fire service response times not reported.
- No evidence gathered on city-wide services beyond this incident.

## Recommended Next Steps

- Consider [Advisory Support](/advisory) to translate benchmark insights into strategic action.

## Sources

- [https://www.cbc.bb/main-stories/measures-being-put-in-place-to-assist-chapman-lane-fire-victims/](https://www.cbc.bb/main-stories/measures-being-put-in-place-to-assist-chapman-lane-fire-victims/) (tier 2, 2026-09-03)
- [https://barbadostoday.bb/2026/09/08/govt-assesses-rebuilding-options-after-chapman-lane-fire/](https://barbadostoday.bb/2026/09/08/govt-assesses-rebuilding-options-after-chapman-lane-fire/) (tier 2, 2026-09-08)
- [https://nationnews.com/2026/09/03/fire-destroys-four-houses-in-chapman-lane/](https://nationnews.com/2026/09/03/fire-destroys-four-houses-in-chapman-lane/) (tier 2, 2026-09-03)
- [https://barbadostoday.bb/2026/09/03/contractor-urges-fast-tracking-of-bridgetown-redevelopment-plans/](https://barbadostoday.bb/2026/09/03/contractor-urges-fast-tracking-of-bridgetown-redevelopment-plans/) (tier 2, 2026-09-03)

---

This assessment is based on publicly available information and does not constitute a formal Compassion Benchmark Certified Assessment. For a comprehensive, assessor-led evaluation, visit compassionbenchmark.com/certified-assessments.
