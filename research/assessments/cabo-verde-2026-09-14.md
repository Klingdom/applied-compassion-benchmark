---
entity: "Cabo Verde"
type: "Country"
sector: "Government (national)"
date: "2026-09-14"
composite_score: 61.2
band: "Established"
scores:
  AWR: 3.4
  EMP: 3.6
  ACT: 3.4
  EQU: 3
  BND: 4
  ACC: 3.4
  SYS: 3.4
  INT: 3.4
published_index: "countries"
published_rank: 25
published_composite: 62.5
published_band: "established"
assessed_composite: 61.2
score_delta: -1.3
band_change: false
filing_trigger_met: false
outcome: "confirmation"
recommendation: "confirm"
change_proposal: false
confidence: "medium"
subdim_sidecar: true
watch_flag: true
calibration_flag: "countries-62.5-placeholder-cohort"
source: "priority"
scan_file: "research/scans/2026-09-14.json"
integration_premium: 0
math_hygiene_reconstruction_diff: 0
---

# Compassion Benchmark Assessment: Cabo Verde

**Entity type:** Country  
**Sector/Domain:** Government (national)  
**Assessment date:** 2026-09-14  
**Composite score:** 61.2/100  
**Band:** Established  
**Cycle:** catch-up, lookback 2026-09-02 to 2026-09-14 (scan `research/scans/2026-09-14.json`, source: priority)  
**Outcome:** confirmation (recommendation: confirm)

## Why this entity was assessed

The scanner flagged Cabo Verde (priority 62) on a bus carrying secondary-school students that fell about 30 metres into a ravine on Fogo on 5 September 2026. At least 25 people died and 14 were injured, the deadliest road accident in the country's history. Cabo Verde was last assessed on 2026-06-01 (confirmation).

## Evidence-date, provenance, attribution and screening checks

**PER COORDINATOR INSTRUCTION, THE STATE'S RESPONSE AND ACCOUNTABILITY ARE SCORED, NOT THE ACCIDENT.** A road accident is not state conduct. Mourning, emergency deployment, acknowledgment and the investigation are.

**FACTS VERIFIED.** 25 dead and 14 injured (The Peninsula, 6-7 September; Expresso das Ilhas, 6 September). The Prime Minister is named as Francisco Carvalho in the wire copy; the President is José Maria Neves. The Council of Ministers approved the investigation team on or before 10 September.

**DUPLICATE ENTITY - NOT ASSESSED.** countries.json publishes 'Cabo Verde' (rank 25) and 'Cape Verde' (rank 26) as two rows with identical scores (62.5). Per coordinator instruction only `cabo-verde` is assessed. No file was written for `cape-verde`. Recorded in the assessor summary for founder decision; no index was edited.

**BASELINE PROVENANCE.** 62.5 is the 14-country placeholder vector. The 2026-06-01 assessment confirmed it without an applied change.

**DIRECTIONALITY.** Cabo Verde surfaced on a tragedy, and the in-window state response is positive. A downgrade would contradict the in-window evidence (check 3). The small negative measured delta is integer-grid rounding of the placeholder, partly offset by one upward move.

## Calibration note (not encoded as a score change)

Cabo Verde and its duplicate row Cape Verde both carry the 62.5 placeholder. Resolving the duplicate should come before any cohort de-seeding, or a correction would have to be applied twice.

## Score Summary

| Dimension | Code | Raw (1-5) | Scaled (0-100) | Published raw | Delta (raw) | Band |
|---|---|---|---|---|---|---|
| Awareness | AWR | 3.4 | 60 | 3.5 | -0.1 | Functional |
| Empathy | EMP | 3.6 | 65 | 3.5 | 0.1 | Established |
| Action | ACT | 3.4 | 60 | 3.5 | -0.1 | Functional |
| Equity | EQU | 3 | 50 | 3 | 0 | Functional |
| Boundaries | BND | 4 | 75 | 4 | 0 | Established |
| Accountability | ACC | 3.4 | 60 | 3.5 | -0.1 | Functional |
| Systemic Thinking | SYS | 3.4 | 60 | 3.5 | -0.1 | Functional |
| Integrity | INT | 3.4 | 60 | 3.5 | -0.1 | Functional |
| **Composite** | — | — | **61.2** | **62.5** | **-1.3** | **Established** |

**Band:** Established (published: established). Integration premium (a bonus for being strong across all 8 areas): 0. Canonical reconstruction of the published vector: 62.5 (published 62.5; difference 0, so no math-hygiene issue).

**Evidence density:** 1 subdimensions moved on located evidence; 7 held with located supporting evidence; 32 held with no evidence located this cycle (0 at a prior documented assessment value, 32 at the published-profile anchor).

## Dimension Details

### AWR: Awareness (raw 3.4/5 — scaled 60/100)

| Subdimension | Score | Evidence and anchor match | Source |
|---|---|---|---|
| A1 Suffering Detection | 4/5 | Held at the published-profile anchor (published AWR 3.5, expanded to the 1-5 integer grid and rounded down). No evidence located this cycle bears on this subdimension. | none located |
| A2 Contextual Sensitivity | 3/5 | Held at the published-profile anchor (published AWR 3.5, expanded to the 1-5 integer grid and rounded down). No evidence located this cycle bears on this subdimension. | none located |
| A3 Blind Spot Mitigation | 4/5 | Held at the published-profile anchor (published AWR 3.5, expanded to the 1-5 integer grid and rounded down). No evidence located this cycle bears on this subdimension. | none located |
| A4 Signal Amplification | 3/5 | Held at the published-profile anchor (published AWR 3.5, expanded to the 1-5 integer grid and rounded down). No evidence located this cycle bears on this subdimension. | none located |
| A5 Anticipatory Awareness | 3/5 | Held at the published-profile anchor (published AWR 3.5, expanded to the 1-5 integer grid and rounded down). No evidence located this cycle bears on this subdimension. | none located |

### EMP: Empathy (raw 3.6/5 — scaled 65/100)

| Subdimension | Score | Evidence and anchor match | Source |
|---|---|---|---|
| E1 Affective Resonance | 4/5 | IN-WINDOW: two days of national mourning were declared. The Prime Minister, the health and justice ministers and the President travelled to Fogo the next day, and the President called for psychological support for those affected. Profile anchor 4 supported; held. | [T2](http://thepeninsulaqatar.com/article/07/09/2026/two-days-of-national-mourning-declared-in-cabo-verde-following-fogo-island-bus-accident) 2026-09-07 |
| E2 Perspective-Taking | 3/5 | Held at the published-profile anchor (published EMP 3.5, expanded to the 1-5 integer grid and rounded down). No evidence located this cycle bears on this subdimension. | none located |
| E3 Non-Judgment | 4/5 | Held at the published-profile anchor (published EMP 3.5, expanded to the 1-5 integer grid and rounded down). No evidence located this cycle bears on this subdimension. | none located |
| E4 Validation | 4/5 | IN-WINDOW: the Prime Minister publicly called the crash the greatest tragedy since independence and announced an emergency team, before any finding on cause. Acknowledgment preceded investigation. Anchor 4. Moved from profile anchor 3. **MOVED this cycle.** | [T2](https://observador.pt/2026/09/07/cabo-verde-acidente-primeiro-ministro-considera-tragedia-no-fogo-a-maior-desde-a-independencia-e-anuncia-equipa-de-emergencia/) 2026-09-07 |
| E5 Cultural Empathy | 3/5 | Held at the published-profile anchor (published EMP 3.5, expanded to the 1-5 integer grid and rounded down). No evidence located this cycle bears on this subdimension. | none located |

### ACT: Action (raw 3.4/5 — scaled 60/100)

| Subdimension | Score | Evidence and anchor match | Source |
|---|---|---|---|
| AC1 Responsiveness | 4/5 | IN-WINDOW: a crisis response team and a 16-member medical unit were deployed to reinforce local services within a day of the 5 September crash. Profile anchor 4 supported; held. | [T2](http://thepeninsulaqatar.com/article/07/09/2026/two-days-of-national-mourning-declared-in-cabo-verde-following-fogo-island-bus-accident) 2026-09-07 |
| AC2 Proportionality | 3/5 | Held at the published-profile anchor (published ACT 3.5, expanded to the 1-5 integer grid and rounded down). No evidence located this cycle bears on this subdimension. | none located |
| AC3 Efficacy | 4/5 | Held at the published-profile anchor (published ACT 3.5, expanded to the 1-5 integer grid and rounded down). No evidence located this cycle bears on this subdimension. | none located |
| AC4 Resource Mobilization | 3/5 | Officials contacted international partners about possible evacuation of patients needing specialised treatment. That is an attempt to mobilise beyond domestic capacity. Anchor 3; held. | [T2](http://thepeninsulaqatar.com/article/07/09/2026/two-days-of-national-mourning-declared-in-cabo-verde-following-fogo-island-bus-accident) 2026-09-07 |
| AC5 Follow-Through | 3/5 | Held at the published-profile anchor (published ACT 3.5, expanded to the 1-5 integer grid and rounded down). No evidence located this cycle bears on this subdimension. | none located |

### EQU: Equity (raw 3/5 — scaled 50/100)

| Subdimension | Score | Evidence and anchor match | Source |
|---|---|---|---|
| EQ1 Universality | 3/5 | Held at the published-profile anchor (published EQU 3, expanded to the 1-5 integer grid and rounded down). No evidence located this cycle bears on this subdimension. | none located |
| EQ2 Priority for Vulnerable | 3/5 | Held at the published-profile anchor (published EQU 3, expanded to the 1-5 integer grid and rounded down). No evidence located this cycle bears on this subdimension. | none located |
| EQ3 Bias Awareness | 3/5 | Held at the published-profile anchor (published EQU 3, expanded to the 1-5 integer grid and rounded down). No evidence located this cycle bears on this subdimension. | none located |
| EQ4 Access Design | 3/5 | Held at the published-profile anchor (published EQU 3, expanded to the 1-5 integer grid and rounded down). No evidence located this cycle bears on this subdimension. | none located |
| EQ5 Historical Harm Acknowledgment | 3/5 | Held at the published-profile anchor (published EQU 3, expanded to the 1-5 integer grid and rounded down). No evidence located this cycle bears on this subdimension. | none located |

### BND: Boundaries (raw 4/5 — scaled 75/100)

| Subdimension | Score | Evidence and anchor match | Source |
|---|---|---|---|
| B1 Self-Sustainability | 4/5 | Held at the published-profile anchor (published BND 4, expanded to the 1-5 integer grid and rounded down). No evidence located this cycle bears on this subdimension. | none located |
| B2 Autonomy Preservation | 4/5 | Held at the published-profile anchor (published BND 4, expanded to the 1-5 integer grid and rounded down). No evidence located this cycle bears on this subdimension. | none located |
| B3 Scope Clarity | 4/5 | The health minister said the inquiry would be thorough and careful, to avoid releasing false or incorrect information. Limits on what is known are communicated honestly. Profile anchor 4 supported; held. | [T2](https://expressodasilhas.cv/pais/2026/09/10/fogoacidente-equipa-multidisciplinar-chega-a-ilha-ainda-esta-semana-para-investigar-causas-do-acidente/104557) 2026-09-10 |
| B4 Refusal Ethics | 4/5 | Held at the published-profile anchor (published BND 4, expanded to the 1-5 integer grid and rounded down). No evidence located this cycle bears on this subdimension. | none located |
| B5 Consent Orientation | 4/5 | Held at the published-profile anchor (published BND 4, expanded to the 1-5 integer grid and rounded down). No evidence located this cycle bears on this subdimension. | none located |

### ACC: Accountability (raw 3.4/5 — scaled 60/100)

| Subdimension | Score | Evidence and anchor match | Source |
|---|---|---|---|
| AB1 Harm Acknowledgment | 4/5 | Immediate public acknowledgment of the scale of the tragedy, with the cause stated as under investigation rather than assigned. Profile anchor 4 supported; held. | [T2](https://observador.pt/2026/09/07/cabo-verde-acidente-primeiro-ministro-considera-tragedia-no-fogo-a-maior-desde-a-independencia-e-anuncia-equipa-de-emergencia/) 2026-09-07; [T2](http://thepeninsulaqatar.com/article/07/09/2026/two-days-of-national-mourning-declared-in-cabo-verde-following-fogo-island-bus-accident) 2026-09-07 |
| AB2 Correction Willingness | 3/5 | Held at the published-profile anchor (published ACC 3.5, expanded to the 1-5 integer grid and rounded down). No evidence located this cycle bears on this subdimension. | none located |
| AB3 Transparency | 4/5 | Held at the published-profile anchor (published ACC 3.5, expanded to the 1-5 integer grid and rounded down). No evidence located this cycle bears on this subdimension. | none located |
| AB4 Systemic Learning | 3/5 | IN-WINDOW (10 September): the Council of Ministers approved a multidisciplinary investigation team. It draws on the Judicial Police, National Police, the road transport directorate, the Armed Forces and Cabo Verde Roads engineers, and will examine road construction and inspection conditions. A formal systemic review has started; no practice has changed yet. Anchor 3; held. | [T2](https://expressodasilhas.cv/pais/2026/09/10/fogoacidente-equipa-multidisciplinar-chega-a-ilha-ainda-esta-semana-para-investigar-causas-do-acidente/104557) 2026-09-10 |
| AB5 Reparative Action | 3/5 | No support programme for bereaved families or injured survivors was documented in located sources. Held at the profile anchor; recorded as an evidence gap, not a failure. | none located |

### SYS: Systemic Thinking (raw 3.4/5 — scaled 60/100)

| Subdimension | Score | Evidence and anchor match | Source |
|---|---|---|---|
| S1 Root Cause Orientation | 4/5 | The inquiry's remit covers road construction, evaluation and inspection, which is root-cause oriented. It is consistent with, but does not yet evidence, anchor 4. Profile anchor held. | [T2](https://expressodasilhas.cv/pais/2026/09/10/fogoacidente-equipa-multidisciplinar-chega-a-ilha-ainda-esta-semana-para-investigar-causas-do-acidente/104557) 2026-09-10 |
| S2 Long-Term Impact | 3/5 | Held at the published-profile anchor (published SYS 3.5, expanded to the 1-5 integer grid and rounded down). No evidence located this cycle bears on this subdimension. | none located |
| S3 Interconnection Awareness | 4/5 | Held at the published-profile anchor (published SYS 3.5, expanded to the 1-5 integer grid and rounded down). No evidence located this cycle bears on this subdimension. | none located |
| S4 Structural Critique | 3/5 | Held at the published-profile anchor (published SYS 3.5, expanded to the 1-5 integer grid and rounded down). No evidence located this cycle bears on this subdimension. | none located |
| S5 Coalitional Compassion | 3/5 | Held at the published-profile anchor (published SYS 3.5, expanded to the 1-5 integer grid and rounded down). No evidence located this cycle bears on this subdimension. | none located |

### INT: Integrity (raw 3.4/5 — scaled 60/100)

| Subdimension | Score | Evidence and anchor match | Source |
|---|---|---|---|
| I1 Consistency Under Pressure | 4/5 | Held at the published-profile anchor (published INT 3.5, expanded to the 1-5 integer grid and rounded down). No evidence located this cycle bears on this subdimension. | none located |
| I2 Non-Performance | 3/5 | Held at the published-profile anchor (published INT 3.5, expanded to the 1-5 integer grid and rounded down). No evidence located this cycle bears on this subdimension. | none located |
| I3 Internal Consistency | 4/5 | Held at the published-profile anchor (published INT 3.5, expanded to the 1-5 integer grid and rounded down). No evidence located this cycle bears on this subdimension. | none located |
| I4 Values Alignment | 3/5 | Held at the published-profile anchor (published INT 3.5, expanded to the 1-5 integer grid and rounded down). No evidence located this cycle bears on this subdimension. | none located |
| I5 Resilience of Care | 3/5 | Held at the published-profile anchor (published INT 3.5, expanded to the 1-5 integer grid and rounded down). No evidence located this cycle bears on this subdimension. | none located |

## Published Index Comparison

**Published index:** countries | **Published rank:** #25 of 193 | **Published composite:** 62.5/100 | **Published band:** established

| Dimension | Published (raw) | Published (scaled) | Research (raw) | Research (scaled) | Difference (scaled) | Explanation |
|---|---|---|---|---|---|---|
| AWR | 3.5 | 62.5 | 3.4 | 60 | -2.5 | Within 10 points; see dimension table. |
| EMP | 3.5 | 62.5 | 3.6 | 65 | 2.5 | Within 10 points; see dimension table. |
| ACT | 3.5 | 62.5 | 3.4 | 60 | -2.5 | Within 10 points; see dimension table. |
| EQU | 3 | 50 | 3 | 50 | 0 | Within 10 points; see dimension table. |
| BND | 4 | 75 | 4 | 75 | 0 | Within 10 points; see dimension table. |
| ACC | 3.5 | 62.5 | 3.4 | 60 | -2.5 | Within 10 points; see dimension table. |
| SYS | 3.5 | 62.5 | 3.4 | 60 | -2.5 | Within 10 points; see dimension table. |
| INT | 3.5 | 62.5 | 3.4 | 60 | -2.5 | Within 10 points; see dimension table. |
| **Composite** | — | **62.5** | — | **61.2** | **-1.3** | — |

### Recommendation

CONFIRM 62.5 (Established). Measured 61.2 (-1.3): about -1.9 grid rounding partly offset by +0.6 for in-window acknowledgment. The response was prompt, visible and investigation-led.

## Key Findings

- Cabo Verde's government responded fast after its deadliest road crash. Twenty-five people, mostly students, died on Fogo Island on 5 September 2026.
- Leaders showed up and spoke plainly. The Prime Minister, two ministers and the President went to Fogo the next day, and the Prime Minister called it the country's greatest tragedy since independence.
- A formal inquiry is under way. On 10 September 2026 the cabinet approved a team of police, army and road engineers to examine the cause, including road building and inspection.
- No support scheme for families of the victims was found in public reporting yet.
- The benchmark lists this country twice, as 'Cabo Verde' and 'Cape Verde'. Only one entry was assessed, and the duplicate was sent to the founder to resolve.

## Strongest Dimensions

Boundaries (raw 4.0) and Empathy (3.6). Empathy moved up on in-window public acknowledgment.

## Weakest Dimensions

Equity (raw 3.0) at the profile anchor. No located evidence this cycle.

## Evidence Gaps

- No victim-family support programme or compensation was documented.
- The investigation report deadline set by the Council of Ministers was not stated in located sources.
- The US News and Washington Post copies cited by the scanner were not fetched (timeout). Equivalent wire and Lusa copies were used.

## Scanner and source corrections

- The scan is accurate.
- Wikipedia's claim that the trip 'was not organized by the schools' surfaced only in search synthesis and was not fetched or scored.

## Watch flag

Accountability: the multidisciplinary inquiry report and whether road-inspection or school-trip transport rules change as a result.

## Recommended Next Steps

Consider [Advisory Support](/advisory) to translate benchmark insights into strategic action.

## Sources

- The Peninsula (Qatar), wire report — 2026-09-07 — tier 2 — http://thepeninsulaqatar.com/article/07/09/2026/two-days-of-national-mourning-declared-in-cabo-verde-following-fogo-island-bus-accident
- Expresso das Ilhas — 2026-09-10 — tier 2 — https://expressodasilhas.cv/pais/2026/09/10/fogoacidente-equipa-multidisciplinar-chega-a-ilha-ainda-esta-semana-para-investigar-causas-do-acidente/104557
- Observador (Lusa) — 2026-09-07 — tier 2 — https://observador.pt/2026/09/07/cabo-verde-acidente-primeiro-ministro-considera-tragedia-no-fogo-a-maior-desde-a-independencia-e-anuncia-equipa-de-emergencia/

---

*This assessment is based on publicly available information and does not constitute a formal Compassion Benchmark Certified Assessment. For a comprehensive, assessor-led evaluation, visit compassionbenchmark.com/certified-assessments.*
