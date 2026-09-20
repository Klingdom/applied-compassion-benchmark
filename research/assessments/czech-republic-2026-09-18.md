---
entity: "Czech Republic"
type: "Country"
sector: "Government (national)"
date: "2026-09-18"
composite_score: 60.6
band: "Established"
scores:
  AWR: 3.4
  EMP: 3.4
  ACT: 3.4
  EQU: 3
  BND: 4
  ACC: 3.4
  SYS: 3.4
  INT: 3.4
published_index: "countries"
published_rank: 27
published_composite: 62.5
published_band: "established"
published_dimensions:
  AWR: 3.5
  EMP: 3.5
  ACT: 3.5
  EQU: 3
  BND: 4
  ACC: 3.5
  SYS: 3.5
  INT: 3.5
assessed_composite: 60.6
score_delta: -1.9
band_change: false
filing_trigger_met: false
outcome: "confirmation"
recommendation: "confirm"
change_proposal: false
confidence: "low"
subdim_sidecar: true
watch_flag: true
calibration_flag: "Czech Republic is a near-uniform 62.5 placeholder (six dimensions at 3.5). Grid rounding gives 60.6, which stays Established by 0.6 points under the canonical band rule. Refer to the 62.5 placeholder cohort alongside Harmonic Bionics (2026-09-17), Chile, France, Slovenia, Netflix and Bridgetown."
source: "rotation"
scan_file: "research/scans/2026-09-18.json"
integration_premium: 0
grid_only_composite: 60.6
math_hygiene_reconstruction_diff: 0
---

# Compassion Benchmark Assessment: Czech Republic

**Entity type:** Country  
**Sector/Domain:** Government (national)  
**Assessment date:** 2026-09-18  
**Composite score:** 60.6/100  
**Band:** Established  
**Cycle:** nightly, lookback 2026-09-03 to 2026-09-18 (scan `research/scans/2026-09-18.json`, source: rotation)  
**Outcome:** confirmation (recommendation: confirm)

## Why this entity was assessed

The Czech Republic entered on rotation backfill (priority 47, T1): never assessed, `last_assessed` null, highest-staleness class. The scanner searched it individually this cycle and surfaced no evidence.

## Evidence-date, provenance, attribution and screening checks

**NO IN-WINDOW EVIDENCE LOCATED.** One targeted search on Czech human rights, social policy, Roma, housing and healthcare returned no item dated inside the 2026-09-03 to 2026-09-18 window.

**OUT-OF-WINDOW EVIDENCE, RECORDED NOT SCORED.** Two Council of Europe findings are on the record and both are undated in the material located. The European Committee of Social Rights concluded there is a violation of Article 16 of the 1961 European Social Charter on access to housing for vulnerable groups, in particular Roma, holding that the authorities had not shown sufficient measures to improve Roma access to social housing without discrimination in practice. The Council of Europe Commissioner for Human Rights has called for systemic change on long-standing human rights issues for Roma and persons with disabilities. These are tier 4 findings and they are consistent with the published Equity 3.0, the profile's lowest dimension. Because their dates could not be fixed, they are not scored as new and they do not move Equity.

**BASELINE PROVENANCE (read first).** Published 62.5 (Established, rank 27) has never moved. No `APPLIED_CHANGES.md` entry and no proposal on disk. Six of eight dimensions sit at exactly 3.5, with Equity 3.0 and Boundaries 4.0 -- a near-uniform 62.5 placeholder with a light Roma-related Equity adjustment. No stale-baseline argument is used.

**BAND BOUNDARY, CHECKED.** Grid rounding returns 60.6, which `getBand()` resolves to Established. Unlike Nasdaq on the same seed value, the Czech vector's Equity 3.0 and Boundaries 4.0 keep it 0.6 points clear of the disputed 60.0 boundary, so there is no RISK-006 problem here and no withholding is needed.

**DIRECTIONALITY.** The Czech Republic surfaced on staleness, not on evidence. No move in either direction is supported.

**FILING.** Measured 60.6 against published 62.5 is a delta of -1.9, entirely integer-grid rounding, with no band change. Neither filing trigger is met. Confirmation.

## Score Summary

| Dimension | Code | Raw (1-5) | Scaled (0-100) | Published raw | Delta (raw) | Band |
|---|---|---|---|---|---|---|
| Awareness | AWR | 3.4 | 60 | 3.5 | -0.1 | Functional |
| Empathy | EMP | 3.4 | 60 | 3.5 | -0.1 | Functional |
| Action | ACT | 3.4 | 60 | 3.5 | -0.1 | Functional |
| Equity | EQU | 3 | 50 | 3 | 0 | Functional |
| Boundaries | BND | 4 | 75 | 4 | 0 | Established |
| Accountability | ACC | 3.4 | 60 | 3.5 | -0.1 | Functional |
| Systemic Thinking | SYS | 3.4 | 60 | 3.5 | -0.1 | Functional |
| Integrity | INT | 3.4 | 60 | 3.5 | -0.1 | Functional |
| **Composite** | — | — | **60.6** | **62.5** | **-1.9** | **Established** |

**Band:** Established (published: established). Integration premium (a bonus for being strong across all 8 areas): 0. Canonical reconstruction of the published vector: 62.5 (published 62.5; difference 0, so no math-hygiene issue). Baseline-only composite before any evidence move (integer-grid rounding of the published profile): 60.6.

**Evidence density:** 0 subdimensions moved on located evidence; 2 held with new located evidence; 38 held with no new evidence this cycle.

## Dimension Details

### AWR: Awareness (raw 3.4/5 — scaled 60/100)

| Subdimension | Score | Evidence and anchor match | Source |
|---|---|---|---|
| A1 Suffering Detection | 4/5 | Held at the integer-grid expansion of the published AWR 3.5, rounded down. No evidence located this cycle bears on this subdimension. | none located |
| A2 Contextual Sensitivity | 4/5 | Held at the integer-grid expansion of the published AWR 3.5, rounded down. No evidence located this cycle bears on this subdimension. | none located |
| A3 Blind Spot Mitigation | 3/5 | Held at the integer-grid expansion of the published AWR 3.5, rounded down. No evidence located this cycle bears on this subdimension. | none located |
| A4 Signal Amplification | 3/5 | Held at the integer-grid expansion of the published AWR 3.5, rounded down. No evidence located this cycle bears on this subdimension. | none located |
| A5 Anticipatory Awareness | 3/5 | Held at the integer-grid expansion of the published AWR 3.5, rounded down. No evidence located this cycle bears on this subdimension. | none located |

### EMP: Empathy (raw 3.4/5 — scaled 60/100)

| Subdimension | Score | Evidence and anchor match | Source |
|---|---|---|---|
| E1 Affective Resonance | 4/5 | Held at the integer-grid expansion of the published EMP 3.5, rounded down. No evidence located this cycle bears on this subdimension. | none located |
| E2 Perspective-Taking | 4/5 | Held at the integer-grid expansion of the published EMP 3.5, rounded down. No evidence located this cycle bears on this subdimension. | none located |
| E3 Non-Judgment | 3/5 | Held at the integer-grid expansion of the published EMP 3.5, rounded down. No evidence located this cycle bears on this subdimension. | none located |
| E4 Validation | 3/5 | Held at the integer-grid expansion of the published EMP 3.5, rounded down. No evidence located this cycle bears on this subdimension. | none located |
| E5 Cultural Empathy | 3/5 | Held at the integer-grid expansion of the published EMP 3.5, rounded down. No evidence located this cycle bears on this subdimension. | none located |

### ACT: Action (raw 3.4/5 — scaled 60/100)

| Subdimension | Score | Evidence and anchor match | Source |
|---|---|---|---|
| AC1 Responsiveness | 4/5 | Held at the integer-grid expansion of the published ACT 3.5, rounded down. No evidence located this cycle bears on this subdimension. | none located |
| AC2 Proportionality | 4/5 | Held at the integer-grid expansion of the published ACT 3.5, rounded down. No evidence located this cycle bears on this subdimension. | none located |
| AC3 Efficacy | 3/5 | Held at the integer-grid expansion of the published ACT 3.5, rounded down. No evidence located this cycle bears on this subdimension. | none located |
| AC4 Resource Mobilization | 3/5 | Held at the integer-grid expansion of the published ACT 3.5, rounded down. No evidence located this cycle bears on this subdimension. | none located |
| AC5 Follow-Through | 3/5 | Held at the integer-grid expansion of the published ACT 3.5, rounded down. No evidence located this cycle bears on this subdimension. | none located |

### EQU: Equity (raw 3/5 — scaled 50/100)

| Subdimension | Score | Evidence and anchor match | Source |
|---|---|---|---|
| EQ1 Universality | 3/5 | Held at 3, in the profile's lowest dimension. The European Committee of Social Rights found a violation of Article 16 of the European Social Charter on access to housing for vulnerable groups, in particular Roma. Tier 4, but undated in the material located, so recorded rather than scored as new. | [T4](https://www.coe.int/en/web/portal/-/insufficient-protection-of-access-to-housing-for-vulnerable-groups-in-czechia-breaches-the-european-social-charter) 2020-01-01 |
| EQ2 Priority for Vulnerable | 3/5 | Held at the integer-grid expansion of the published EQU 3, rounded down. No evidence located this cycle bears on this subdimension. | none located |
| EQ3 Bias Awareness | 3/5 | Held at 3. The Council of Europe Commissioner for Human Rights has called for systemic change on long-standing human rights issues for Roma and persons with disabilities. Consistent with the published Equity 3.0. Undated in the material located; not scored as new. | [T4](https://www.coe.int/en/web/commissioner/-/czech-republic-systemic-change-needed-to-address-long-standing-human-rights-issues-for-roma-and-persons-with-disabilities) 2020-01-01 |
| EQ4 Access Design | 3/5 | Held at the integer-grid expansion of the published EQU 3, rounded down. No evidence located this cycle bears on this subdimension. | none located |
| EQ5 Historical Harm Acknowledgment | 3/5 | Held at the integer-grid expansion of the published EQU 3, rounded down. No evidence located this cycle bears on this subdimension. | none located |

### BND: Boundaries (raw 4/5 — scaled 75/100)

| Subdimension | Score | Evidence and anchor match | Source |
|---|---|---|---|
| B1 Self-Sustainability | 4/5 | Held at the integer-grid expansion of the published BND 4, rounded down. No evidence located this cycle bears on this subdimension. | none located |
| B2 Autonomy Preservation | 4/5 | Held at the integer-grid expansion of the published BND 4, rounded down. No evidence located this cycle bears on this subdimension. | none located |
| B3 Scope Clarity | 4/5 | Held at the integer-grid expansion of the published BND 4, rounded down. No evidence located this cycle bears on this subdimension. | none located |
| B4 Refusal Ethics | 4/5 | Held at the integer-grid expansion of the published BND 4, rounded down. No evidence located this cycle bears on this subdimension. | none located |
| B5 Consent Orientation | 4/5 | Held at the integer-grid expansion of the published BND 4, rounded down. No evidence located this cycle bears on this subdimension. | none located |

### ACC: Accountability (raw 3.4/5 — scaled 60/100)

| Subdimension | Score | Evidence and anchor match | Source |
|---|---|---|---|
| AB1 Harm Acknowledgment | 4/5 | Held at the integer-grid expansion of the published ACC 3.5, rounded down. No evidence located this cycle bears on this subdimension. | none located |
| AB2 Correction Willingness | 4/5 | Held at the integer-grid expansion of the published ACC 3.5, rounded down. No evidence located this cycle bears on this subdimension. | none located |
| AB3 Transparency | 3/5 | Held at the integer-grid expansion of the published ACC 3.5, rounded down. No evidence located this cycle bears on this subdimension. | none located |
| AB4 Systemic Learning | 3/5 | Held at the integer-grid expansion of the published ACC 3.5, rounded down. No evidence located this cycle bears on this subdimension. | none located |
| AB5 Reparative Action | 3/5 | Held at the integer-grid expansion of the published ACC 3.5, rounded down. No evidence located this cycle bears on this subdimension. | none located |

### SYS: Systemic Thinking (raw 3.4/5 — scaled 60/100)

| Subdimension | Score | Evidence and anchor match | Source |
|---|---|---|---|
| S1 Root Cause Orientation | 4/5 | Held at the integer-grid expansion of the published SYS 3.5, rounded down. No evidence located this cycle bears on this subdimension. | none located |
| S2 Long-Term Impact | 4/5 | Held at the integer-grid expansion of the published SYS 3.5, rounded down. No evidence located this cycle bears on this subdimension. | none located |
| S3 Interconnection Awareness | 3/5 | Held at the integer-grid expansion of the published SYS 3.5, rounded down. No evidence located this cycle bears on this subdimension. | none located |
| S4 Structural Critique | 3/5 | Held at the integer-grid expansion of the published SYS 3.5, rounded down. No evidence located this cycle bears on this subdimension. | none located |
| S5 Coalitional Compassion | 3/5 | Held at the integer-grid expansion of the published SYS 3.5, rounded down. No evidence located this cycle bears on this subdimension. | none located |

### INT: Integrity (raw 3.4/5 — scaled 60/100)

| Subdimension | Score | Evidence and anchor match | Source |
|---|---|---|---|
| I1 Consistency Under Pressure | 4/5 | Held at the integer-grid expansion of the published INT 3.5, rounded down. No evidence located this cycle bears on this subdimension. | none located |
| I2 Non-Performance | 4/5 | Held at the integer-grid expansion of the published INT 3.5, rounded down. No evidence located this cycle bears on this subdimension. | none located |
| I3 Internal Consistency | 3/5 | Held at the integer-grid expansion of the published INT 3.5, rounded down. No evidence located this cycle bears on this subdimension. | none located |
| I4 Values Alignment | 3/5 | Held at the integer-grid expansion of the published INT 3.5, rounded down. No evidence located this cycle bears on this subdimension. | none located |
| I5 Resilience of Care | 3/5 | Held at the integer-grid expansion of the published INT 3.5, rounded down. No evidence located this cycle bears on this subdimension. | none located |

## Published Index Comparison

**Published index:** countries | **Published rank:** #27 | **Published composite:** 62.5/100 | **Published band:** established

| Dimension | Published (raw) | Published (scaled) | Research Score (raw) | Research (scaled) | Difference (scaled) |
|---|---|---|---|---|---|
| AWR | 3.5 | 62.5 | 3.4 | 60 | -2.5 |
| EMP | 3.5 | 62.5 | 3.4 | 60 | -2.5 |
| ACT | 3.5 | 62.5 | 3.4 | 60 | -2.5 |
| EQU | 3 | 50 | 3 | 50 | 0 |
| BND | 4 | 75 | 4 | 75 | 0 |
| ACC | 3.5 | 62.5 | 3.4 | 60 | -2.5 |
| SYS | 3.5 | 62.5 | 3.4 | 60 | -2.5 |
| INT | 3.5 | 62.5 | 3.4 | 60 | -2.5 |
| **Composite** | — | **62.5** | — | **60.6** | **-1.9** |

### Recommendation

The published score appears accurate on current evidence. Measured 60.6 against published 62.5 is a delta of -1.9, which does not meet the 5-point magnitude trigger, and the band is unchanged. No change proposal is filed.

## Key Findings

- The Czech Republic's published score of 62.5 out of 100 is confirmed. The measured 60.6 is 1.9 points lower, and that gap is pure rounding, not a finding.
- Nothing dated inside the two-week window was found. One targeted search returned only undated Council of Europe material.
- That material matters even though it does not move the score. The Council of Europe's European Committee of Social Rights has found the Czech Republic in breach of the European Social Charter over Roma access to social housing, holding that the state had not shown it took sufficient measures.
- The Council of Europe's Human Rights Commissioner has separately called for systemic change on Roma and disability rights. Both are strong sources -- but neither could be dated, so the benchmark records them rather than scoring them as new.
- The Czech Republic has never been individually assessed. Six of its eight dimensions sit at exactly 3.5 out of 5, which is a placeholder pattern. Confidence is low and the row is referred for placeholder study.

## Strongest Dimensions

Boundaries (raw 4.0), the only dimension at or above 4.0, held from the published profile.

## Weakest Dimensions

Equity (raw 3.0), which carries the Roma housing and discrimination record and is corroborated -- though not moved -- by the Council of Europe findings located this cycle.

## Evidence Gaps

- Neither Council of Europe finding could be dated from the material located. Dating them is the single change that would let Equity move.
- No Czech government response to the European Committee of Social Rights conclusion was located.
- No 2026 progress report on the Strategy for Roma Equality, Inclusion and Participation 2021-2030 was located.
- The Czech Republic has never been individually assessed; all 40 subdimensions are grid expansions of a near-uniform placeholder. Confidence is low.

## Scanner and source corrections

- The scan reports no evidence found for the Czech Republic. Confirmed independently for the window; undated Council of Europe material exists and is recorded above.

## Watch flag

Downward on a dated Council of Europe or European Committee of Social Rights finding inside a future window, which would move Equity. Upward on dated evidence of Roma social-housing access improving in practice.

## Calibration referral

Czech Republic is a near-uniform 62.5 placeholder (six dimensions at 3.5). Grid rounding gives 60.6, which stays Established by 0.6 points under the canonical band rule. Refer to the 62.5 placeholder cohort alongside Harmonic Bionics (2026-09-17), Chile, France, Slovenia, Netflix and Bridgetown.

## Recommended Next Steps

Consider [Advisory Support](/advisory) to translate benchmark insights into strategic action.

## Sources

- Council of Europe, Commissioner for Human Rights — 2020-01-01 — tier 4 — https://www.coe.int/en/web/commissioner/-/czech-republic-systemic-change-needed-to-address-long-standing-human-rights-issues-for-roma-and-persons-with-disabilities
- Council of Europe, European Committee of Social Rights — 2020-01-01 — tier 4 — https://www.coe.int/en/web/portal/-/insufficient-protection-of-access-to-housing-for-vulnerable-groups-in-czechia-breaches-the-european-social-charter
- Government of the Czech Republic, Strategy for Roma Equality, Inclusion and Participation 2021-2030 — 2021-01-01 — tier 4 — https://vlada.gov.cz/assets/ppov/zalezitosti-romske-komunity/aktuality/Strategy-for-Roma-Equality--Inclusion-and-Participation-_Strategy-for-Roma-Integration_-2021-2030.pdf

---

*This assessment is based on publicly available information and does not constitute a formal Compassion Benchmark Certified Assessment. For a comprehensive, assessor-led evaluation, visit compassionbenchmark.com/certified-assessments.*
