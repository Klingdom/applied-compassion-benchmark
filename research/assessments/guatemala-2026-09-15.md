---
entity: "Guatemala"
type: "Country"
sector: "Government"
date: "2026-09-15"
composite_score: 23.1
band: "Developing"
scores:
  AWR: 2
  EMP: 2
  ACT: 2
  EQU: 1.4
  BND: 2
  ACC: 2
  SYS: 2
  INT: 2
published_index: "countries"
published_rank: 130
published_composite: 23.4
published_band: "developing"
published_dimensions:
  AWR: 2
  EMP: 2
  ACT: 2
  EQU: 1.5
  BND: 2
  ACC: 2
  SYS: 2
  INT: 2
assessed_composite: 23.1
score_delta: -0.3
band_change: false
filing_trigger_met: false
outcome: "confirmation"
recommendation: "confirm"
change_proposal: false
confidence: "medium"
subdim_sidecar: true
watch_flag: "Protest-rights and use of force: preventive army-police deployments against 'new demonstrations', any state of prevention, and the prosecutions announced against blockade organisers. Re-test B2, I1 and AB1 on any documented abuse or rights-ombudsman finding."
calibration_flag: null
source: "priority"
scan_file: "research/scans/2026-09-15.json"
integration_premium: 0
published_formula_reconstruction: 23.4
math_hygiene_reconstruction_diff: 0
assessor_override_registered: false
evidence_density: { moved: 0, held_with_evidence: 5, held_no_evidence: 35 }
base: "published placeholder, integer grid rounded down"
---

# Compassion Benchmark Assessment: Guatemala

**Entity type:** Country  
**Sector/Domain:** Government  
**Assessment date:** 2026-09-15  
**Composite score:** 23.1/100  
**Band:** Developing  
**Cycle:** nightly, lookback 2026-09-01 to 2026-09-15 (scan `research/scans/2026-09-15.json`, source: priority)  
**Outcome:** confirmation (recommendation: confirm)

## Why this entity was assessed

The scanner flagged Guatemala (priority 62) on fuel-price protests and blockades from late August into September 2026 and President Arévalo's 13 September address. Guatemala has never been individually assessed as a country; Guatemala City was assessed on 2026-07-27.

## Evidence-date, provenance, attribution and screening checks

**BASELINE PROVENANCE.** No APPLIED_CHANGES entry. The 2026-08-18 digest mentions Guatemala only as a peer reference in a Paraguay calibration note. Published 23.4 is a placeholder (all dimensions 2.0, EQU 1.5).

**SCAN SOURCE CHECK.** UPI (the scan's first source) returned HTTP 403. The scan's figures ('at least 40 demonstrations across 27 cities in 11 of 22 departments between 31 Aug-4 Sept') could not be verified and are not used. Rio Times (`date_verified: false`) was not used. Facts were re-verified via Prensa Libre (13 Sept), Infobae (13 Sept) and La Hora (14 Sept).

**ATTRIBUTION.** Blockades are by protesters (non-state). Scored: the state's responses, meaning the price law, the policing and army deployment, compliance with the court order, and presidential rhetoric. The president's claim of narco-financing is an allegation by the government and is not treated as fact.

**DIRECTIONALITY.** Mixed. There is a responsive price law and no reported state killings, against a militarised clearance, preventive deployments and inflammatory allegations. Nothing clears the bar for a move either way.

**TRIGGERS.** Measured 23.1 vs 23.4 (-0.3), same band. Confirmation, with a watch.

## Corrections to the scan and to prior cycles (append-only)

- UPI-sourced counts in the scan summary are unverified (HTTP 403).
- Scan omits the Constitutional Court's six-hour order (11 Sept) and the injuries to two police officers; both verified.

## Score Summary

| Dimension | Code | Raw (1-5) | Scaled (0-100) | Published raw | Delta (raw) | Band |
|---|---|---|---|---|---|---|
| Awareness | AWR | 2 | 25 | 2 | 0 | Developing |
| Empathy | EMP | 2 | 25 | 2 | 0 | Developing |
| Action | ACT | 2 | 25 | 2 | 0 | Developing |
| Equity | EQU | 1.4 | 10 | 1.5 | -0.1 | Critical |
| Boundaries | BND | 2 | 25 | 2 | 0 | Developing |
| Accountability | ACC | 2 | 25 | 2 | 0 | Developing |
| Systemic Thinking | SYS | 2 | 25 | 2 | 0 | Developing |
| Integrity | INT | 2 | 25 | 2 | 0 | Developing |
| **Composite** | — | — | **23.1** | **23.4** | **-0.3** | **Developing** |

Composite computed with `computeCompositeFromDimensions` (site/scripts/lib/scoring.mjs, strict 8-dimension check). Integration premium: 0. Canonical reconstruction of the published dimensions: 23.4 (published 23.4; diff 0). No math-hygiene issue.

## Dimension Details

### AWR: Awareness (Raw 2; Score: 25/100)

| Subdimension | Score | Base | Evidence and anchor match | Source |
|---|---|---|---|---|
| A1 Suffering Detection | 2/5 | 2 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| A2 Contextual Sensitivity | 2/5 | 2 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| A3 Blind Spot Mitigation | 2/5 | 2 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| A4 Signal Amplification | 2/5 | 2 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| A5 Anticipatory Awareness | 2/5 | 2 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |

### EMP: Empathy (Raw 2; Score: 25/100)

| Subdimension | Score | Base | Evidence and anchor match | Source |
|---|---|---|---|---|
| E1 Affective Resonance | 2/5 | 2 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| E2 Perspective-Taking | 2/5 | 2 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| E3 Non-Judgment | 2/5 | 2 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| E4 Validation | 2/5 | 2 | Held at 2. On 13 September 2026 President Bernardo Arévalo accused local politicians of colluding with drug traffickers to pay blockade participants. He also distinguished legitimate public discontent from organised groups. His accusation is an unproven ALLEGATION and is not scored as fact. The mixed framing fits anchor 2. | [T2, 2026-09-13](https://www.prensalibre.com/guatemala/politica/arevalo-senala-a-politicos-y-narcotrafico-de-financiar-bloqueos-por-precio-de-combustibles-breaking/) |
| E5 Cultural Empathy | 2/5 | 2 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |

### ACT: Action (Raw 2; Score: 25/100)

| Subdimension | Score | Base | Evidence and anchor match | Source |
|---|---|---|---|---|
| AC1 Responsiveness | 2/5 | 2 | Held at 2. Police and army cleared 34 blockades by 11:30 pm on 11 September, ahead of the court deadline. Two police officers were shot near Cuyotenango; 14 people were charged (Infobae). No civilian deaths from state force were reported in fetched sources. | [T2, 2026-09-13](https://www.infobae.com/guatemala/2026/09/13/el-gobierno-de-guatemala-asegura-que-recupero-la-circulacion-tras-34-bloqueos-y-refuerza-vigilancia-ante-nuevas-protestas/) |
| AC2 Proportionality | 2/5 | 2 | Held at 2. The government's response to fuel-price hardship was a maximum consumer price law (Q39 per gallon of diesel and regular, Q41 superior) plus a compensation fund still being set up (Prensa Libre, 13 Sept). A flat price cap is not calibrated to need, so anchor 2. | [T2, 2026-09-13](https://www.prensalibre.com/guatemala/politica/arevalo-senala-a-politicos-y-narcotrafico-de-financiar-bloqueos-por-precio-de-combustibles-breaking/) |
| AC3 Efficacy | 2/5 | 2 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| AC4 Resource Mobilization | 2/5 | 2 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| AC5 Follow-Through | 2/5 | 2 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |

### EQU: Equity (Raw 1.4; Score: 10/100)

| Subdimension | Score | Base | Evidence and anchor match | Source |
|---|---|---|---|---|
| EQ1 Universality | 2/5 | 2 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| EQ2 Priority for Vulnerable | 2/5 | 2 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| EQ3 Bias Awareness | 1/5 | 1 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| EQ4 Access Design | 1/5 | 1 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| EQ5 Historical Harm Acknowledgment | 1/5 | 1 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |

### BND: Boundaries (Raw 2; Score: 25/100)

| Subdimension | Score | Base | Evidence and anchor match | Source |
|---|---|---|---|---|
| B1 Self-Sustainability | 2/5 | 2 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| B2 Autonomy Preservation | 2/5 | 2 | Held at 2. About 600 police with army support remain at former blockade points to prevent 'aglomeraciones o nuevas manifestaciones' (La Hora, 14 Sept). Preventive policing of gatherings is a protest-rights concern to watch. No documented abuse yet. | [T2, 2026-09-14](https://lahora.gt/nacionales/dguzman/2026/09/14/pnc-mantiene-operativos-con-cerca-de-600-agentes-en-puntos-que-fueron-bloqueados-now/) |
| B3 Scope Clarity | 2/5 | 2 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| B4 Refusal Ethics | 2/5 | 2 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| B5 Consent Orientation | 2/5 | 2 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |

### ACC: Accountability (Raw 2; Score: 25/100)

| Subdimension | Score | Base | Evidence and anchor match | Source |
|---|---|---|---|---|
| AB1 Harm Acknowledgment | 2/5 | 2 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| AB2 Correction Willingness | 2/5 | 2 | Held at 2. The Constitutional Court (3-2, 11 September) ordered the Interior Minister and police chief to clear blockades within six hours or be removed. A provisional order of 8 September had not been enforced. The executive acted under court compulsion, not on its own initiative. | [T2, 2026-09-11](https://www.prensalibre.com/guatemala/politica/cc-ordena-a-mingob-y-pnc-liberar-bloqueos-en-seis-horas-o-sus-altos-mandos-seran-destituidos/) |
| AB3 Transparency | 2/5 | 2 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| AB4 Systemic Learning | 2/5 | 2 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| AB5 Reparative Action | 2/5 | 2 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |

### SYS: Systemic Thinking (Raw 2; Score: 25/100)

| Subdimension | Score | Base | Evidence and anchor match | Source |
|---|---|---|---|---|
| S1 Root Cause Orientation | 2/5 | 2 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| S2 Long-Term Impact | 2/5 | 2 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| S3 Interconnection Awareness | 2/5 | 2 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| S4 Structural Critique | 2/5 | 2 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| S5 Coalitional Compassion | 2/5 | 2 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |

### INT: Integrity (Raw 2; Score: 25/100)

| Subdimension | Score | Base | Evidence and anchor match | Source |
|---|---|---|---|---|
| I1 Consistency Under Pressure | 2/5 | 2 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| I2 Non-Performance | 2/5 | 2 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| I3 Internal Consistency | 2/5 | 2 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| I4 Values Alignment | 2/5 | 2 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| I5 Resilience of Care | 2/5 | 2 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |

## Published Index Comparison

**Published index:** countries | **Published rank:** #130 of 193 | **Published composite:** 23.4/100 | **Published band:** developing

| Dimension | Published (raw) | Published (scaled) | Research (raw) | Research (scaled) | Difference (scaled) | Explanation |
|---|---|---|---|---|---|---|
| AWR | 2 | 25 | 2 | 25 | 0 | Unchanged |
| EMP | 2 | 25 | 2 | 25 | 0 | Unchanged |
| ACT | 2 | 25 | 2 | 25 | 0 | Unchanged |
| EQU | 1.5 | 12.5 | 1.4 | 10 | -2.5 | Integer-grid rounding of the published value; no evidence-based move |
| BND | 2 | 25 | 2 | 25 | 0 | Unchanged |
| ACC | 2 | 25 | 2 | 25 | 0 | Unchanged |
| SYS | 2 | 25 | 2 | 25 | 0 | Unchanged |
| INT | 2 | 25 | 2 | 25 | 0 | Unchanged |
| **Composite** | — | **23.4** | — | **23.1** | **-0.3** | — |

### Score Difference Analysis

Only difference: grid rounding of Equity (1.5 to 1.4). No evidence-based move.

### Recommendation

Confirm 23.4 / Developing, with a protest-rights watch.

## Key Findings

- Why it matters: Guatemala cleared protest blockades only after a court threatened to fire its police chief. On 11 September 2026 the Constitutional Court gave officials six hours to reopen roads. Police and soldiers then cleared 34 blockades; two officers were shot and 14 people were charged.
- Why it matters: the government answered fuel anger with a flat price cap. A maximum-price law set Q39 per gallon for diesel and regular petrol. That caps prices for everyone rather than targeting those in most need.
- Why it matters: the president blamed drug money, without proof. On 13 September President Bernardo Arévalo said local politicians and traffickers paid blockade participants. That claim is unproven and is not scored as fact.

## Strongest Dimensions

- Awareness (AWR) at raw 2.
- Empathy (EMP) at raw 2.


## Weakest Dimensions

- Equity (EQU) at raw 1.4.
- Integrity (INT) at raw 2.


## Evidence Gaps

- No human-rights ombudsman (PDH) statement located.
- Congressional passage details of the price law (Decree 21-2026 per search results) not fetched.
- Arrest conditions and due process for the 14 charged not examined.

## Recommended Next Steps

- Consider a [Certified Assessment](/certified-assessments) for a structured improvement roadmap.

## Sources

- [https://www.prensalibre.com/guatemala/politica/arevalo-senala-a-politicos-y-narcotrafico-de-financiar-bloqueos-por-precio-de-combustibles-breaking/](https://www.prensalibre.com/guatemala/politica/arevalo-senala-a-politicos-y-narcotrafico-de-financiar-bloqueos-por-precio-de-combustibles-breaking/) (tier 2, 2026-09-13)
- [https://www.infobae.com/guatemala/2026/09/13/el-gobierno-de-guatemala-asegura-que-recupero-la-circulacion-tras-34-bloqueos-y-refuerza-vigilancia-ante-nuevas-protestas/](https://www.infobae.com/guatemala/2026/09/13/el-gobierno-de-guatemala-asegura-que-recupero-la-circulacion-tras-34-bloqueos-y-refuerza-vigilancia-ante-nuevas-protestas/) (tier 2, 2026-09-13)
- [https://lahora.gt/nacionales/dguzman/2026/09/14/pnc-mantiene-operativos-con-cerca-de-600-agentes-en-puntos-que-fueron-bloqueados-now/](https://lahora.gt/nacionales/dguzman/2026/09/14/pnc-mantiene-operativos-con-cerca-de-600-agentes-en-puntos-que-fueron-bloqueados-now/) (tier 2, 2026-09-14)
- [https://www.prensalibre.com/guatemala/politica/cc-ordena-a-mingob-y-pnc-liberar-bloqueos-en-seis-horas-o-sus-altos-mandos-seran-destituidos/](https://www.prensalibre.com/guatemala/politica/cc-ordena-a-mingob-y-pnc-liberar-bloqueos-en-seis-horas-o-sus-altos-mandos-seran-destituidos/) (tier 2, 2026-09-11)
- [UPI (scan source, HTTP 403)](https://www.upi.com/Top_News/World-News/2026/09/14/latam-guatemala-violent-fuel-protests/9231789403436) (not fetched)

---

This assessment is based on publicly available information and does not constitute a formal Compassion Benchmark Certified Assessment. For a comprehensive, assessor-led evaluation, visit compassionbenchmark.com/certified-assessments.
