---
entity: "Plains All American"
type: "Company"
sector: "Energy (crude oil pipelines and midstream)"
date: "2026-09-18"
composite_score: 17.5
band: "Critical"
scores:
  AWR: 1.4
  EMP: 2
  ACT: 2
  EQU: 1.4
  BND: 2
  ACC: 1.4
  SYS: 2
  INT: 1.4
published_index: "fortune-500"
published_rank: 403
published_composite: 18.8
published_band: "critical"
published_dimensions:
  AWR: 1.5
  EMP: 2
  ACT: 2
  EQU: 1.5
  BND: 2
  ACC: 1.5
  SYS: 2
  INT: 1.5
assessed_composite: 17.5
score_delta: -1.3
band_change: false
filing_trigger_met: false
outcome: "confirmation"
recommendation: "confirm"
change_proposal: false
confidence: "low"
subdim_sidecar: true
watch_flag: true
calibration_flag: null
source: "rotation"
scan_file: "research/scans/2026-09-18.json"
integration_premium: 0
grid_only_composite: 17.5
math_hygiene_reconstruction_diff: 0
---

# Compassion Benchmark Assessment: Plains All American

**Entity type:** Company  
**Sector/Domain:** Energy (crude oil pipelines and midstream)  
**Assessment date:** 2026-09-18  
**Composite score:** 17.5/100  
**Band:** Critical  
**Cycle:** nightly, lookback 2026-09-03 to 2026-09-18 (scan `research/scans/2026-09-18.json`, source: rotation)  
**Outcome:** confirmation (recommendation: confirm)

## Why this entity was assessed

Plains All American entered on rotation backfill (priority 50, T1): never assessed, `last_assessed` null, highest-staleness class. The scanner searched it individually this cycle and surfaced no evidence.

## Evidence-date, provenance, attribution and screening checks

**NO IN-WINDOW EVIDENCE LOCATED.** One targeted search on 2026 spills, settlements, safety and workers returned nothing dated inside the 2026-09-03 to 2026-09-18 window. Everything located predates the window by years.

**OUT-OF-WINDOW EVIDENCE, RECORDED NOT SCORED.** Three items are on the record and all are historical. The 19 May 2015 Line 901 rupture near Refugio State Beach discharged about 2,934 barrels of crude; the United States Department of Justice settlement states the discharge 'was caused by Plains' failure to address external corrosion and have adequate control-room procedures in place, and was further exacerbated by Plains' failure to respond properly to the release'. In 2022 Plains agreed to pay 230 million dollars to settle class actions -- 184 million to a Fisherpeople Class and 46 million to a Property Class. Plains and Copperhead also reached a 1.75-million-dollar settlement with the Equal Employment Opportunity Commission. All three are consistent with the published Critical profile and none is new, so none is re-scored. Re-scoring old conduct as though it were new would double-count.

**BASELINE PROVENANCE (read first).** Published 18.8 (Critical, rank 403) has never moved. No `APPLIED_CHANGES.md` entry and no proposal on disk. The vector is differentiated (1.5 and 2.0 mixed) rather than uniform, so it is not one of the flat seed clusters, but it has never been individually assessed either. No stale-baseline argument is used.

**DIRECTIONALITY.** Plains surfaced on staleness, not on evidence. No move in either direction is supported. The historical record supports the low published score rather than contradicting it.

**FILING.** Measured 17.5 against published 18.8 is a delta of -1.3, entirely integer-grid rounding, with no band change (both Critical). Neither filing trigger is met. Confirmation.

## Score Summary

| Dimension | Code | Raw (1-5) | Scaled (0-100) | Published raw | Delta (raw) | Band |
|---|---|---|---|---|---|---|
| Awareness | AWR | 1.4 | 10 | 1.5 | -0.1 | Critical |
| Empathy | EMP | 2 | 25 | 2 | 0 | Developing |
| Action | ACT | 2 | 25 | 2 | 0 | Developing |
| Equity | EQU | 1.4 | 10 | 1.5 | -0.1 | Critical |
| Boundaries | BND | 2 | 25 | 2 | 0 | Developing |
| Accountability | ACC | 1.4 | 10 | 1.5 | -0.1 | Critical |
| Systemic Thinking | SYS | 2 | 25 | 2 | 0 | Developing |
| Integrity | INT | 1.4 | 10 | 1.5 | -0.1 | Critical |
| **Composite** | — | — | **17.5** | **18.8** | **-1.3** | **Critical** |

**Band:** Critical (published: critical). Integration premium (a bonus for being strong across all 8 areas): 0. Canonical reconstruction of the published vector: 18.8 (published 18.8; difference 0, so no math-hygiene issue). Baseline-only composite before any evidence move (integer-grid rounding of the published profile): 17.5.

**Evidence density:** 0 subdimensions moved on located evidence; 3 held with new located evidence; 37 held with no new evidence this cycle.

## Dimension Details

### AWR: Awareness (raw 1.4/5 — scaled 10/100)

| Subdimension | Score | Evidence and anchor match | Source |
|---|---|---|---|
| A1 Suffering Detection | 2/5 | Held at the integer-grid expansion of the published AWR 1.5, rounded down. No evidence located this cycle bears on this subdimension. | none located |
| A2 Contextual Sensitivity | 2/5 | Held at the integer-grid expansion of the published AWR 1.5, rounded down. No evidence located this cycle bears on this subdimension. | none located |
| A3 Blind Spot Mitigation | 1/5 | Held at the integer-grid expansion of the published AWR 1.5, rounded down. No evidence located this cycle bears on this subdimension. | none located |
| A4 Signal Amplification | 1/5 | Held at the integer-grid expansion of the published AWR 1.5, rounded down. No evidence located this cycle bears on this subdimension. | none located |
| A5 Anticipatory Awareness | 1/5 | Held at 1. The Department of Justice settlement attributes the 2015 Line 901 discharge to failure to address external corrosion and inadequate control-room procedures -- an anticipatory-awareness failure. Out of window, already consistent with the published anchor, not re-scored. | [T5](https://www.justice.gov/archives/opa/pr/us-pipeline-company-modify-its-national-operations-implement-safeguards-resulting-oil-spill) 2020-01-01 |

### EMP: Empathy (raw 2/5 — scaled 25/100)

| Subdimension | Score | Evidence and anchor match | Source |
|---|---|---|---|
| E1 Affective Resonance | 2/5 | Held at the integer-grid expansion of the published EMP 2, rounded down. No evidence located this cycle bears on this subdimension. | none located |
| E2 Perspective-Taking | 2/5 | Held at the integer-grid expansion of the published EMP 2, rounded down. No evidence located this cycle bears on this subdimension. | none located |
| E3 Non-Judgment | 2/5 | Held at the integer-grid expansion of the published EMP 2, rounded down. No evidence located this cycle bears on this subdimension. | none located |
| E4 Validation | 2/5 | Held at the integer-grid expansion of the published EMP 2, rounded down. No evidence located this cycle bears on this subdimension. | none located |
| E5 Cultural Empathy | 2/5 | Held at the integer-grid expansion of the published EMP 2, rounded down. No evidence located this cycle bears on this subdimension. | none located |

### ACT: Action (raw 2/5 — scaled 25/100)

| Subdimension | Score | Evidence and anchor match | Source |
|---|---|---|---|
| AC1 Responsiveness | 2/5 | Held at the integer-grid expansion of the published ACT 2, rounded down. No evidence located this cycle bears on this subdimension. | none located |
| AC2 Proportionality | 2/5 | Held at the integer-grid expansion of the published ACT 2, rounded down. No evidence located this cycle bears on this subdimension. | none located |
| AC3 Efficacy | 2/5 | Held at the integer-grid expansion of the published ACT 2, rounded down. No evidence located this cycle bears on this subdimension. | none located |
| AC4 Resource Mobilization | 2/5 | Held at the integer-grid expansion of the published ACT 2, rounded down. No evidence located this cycle bears on this subdimension. | none located |
| AC5 Follow-Through | 2/5 | Held at the integer-grid expansion of the published ACT 2, rounded down. No evidence located this cycle bears on this subdimension. | none located |

### EQU: Equity (raw 1.4/5 — scaled 10/100)

| Subdimension | Score | Evidence and anchor match | Source |
|---|---|---|---|
| EQ1 Universality | 2/5 | Held at the integer-grid expansion of the published EQU 1.5, rounded down. No evidence located this cycle bears on this subdimension. | none located |
| EQ2 Priority for Vulnerable | 2/5 | Held at the integer-grid expansion of the published EQU 1.5, rounded down. No evidence located this cycle bears on this subdimension. | none located |
| EQ3 Bias Awareness | 1/5 | Held at the integer-grid expansion of the published EQU 1.5, rounded down. No evidence located this cycle bears on this subdimension. | none located |
| EQ4 Access Design | 1/5 | Held at the integer-grid expansion of the published EQU 1.5, rounded down. No evidence located this cycle bears on this subdimension. | none located |
| EQ5 Historical Harm Acknowledgment | 1/5 | Held at the integer-grid expansion of the published EQU 1.5, rounded down. No evidence located this cycle bears on this subdimension. | none located |

### BND: Boundaries (raw 2/5 — scaled 25/100)

| Subdimension | Score | Evidence and anchor match | Source |
|---|---|---|---|
| B1 Self-Sustainability | 2/5 | Held at the integer-grid expansion of the published BND 2, rounded down. No evidence located this cycle bears on this subdimension. | none located |
| B2 Autonomy Preservation | 2/5 | Held at the integer-grid expansion of the published BND 2, rounded down. No evidence located this cycle bears on this subdimension. | none located |
| B3 Scope Clarity | 2/5 | Held at the integer-grid expansion of the published BND 2, rounded down. No evidence located this cycle bears on this subdimension. | none located |
| B4 Refusal Ethics | 2/5 | Held at the integer-grid expansion of the published BND 2, rounded down. No evidence located this cycle bears on this subdimension. | none located |
| B5 Consent Orientation | 2/5 | Held at the integer-grid expansion of the published BND 2, rounded down. No evidence located this cycle bears on this subdimension. | none located |

### ACC: Accountability (raw 1.4/5 — scaled 10/100)

| Subdimension | Score | Evidence and anchor match | Source |
|---|---|---|---|
| AB1 Harm Acknowledgment | 2/5 | Held at the integer-grid expansion of the published ACC 1.5, rounded down. No evidence located this cycle bears on this subdimension. | none located |
| AB2 Correction Willingness | 2/5 | Held at the integer-grid expansion of the published ACC 1.5, rounded down. No evidence located this cycle bears on this subdimension. | none located |
| AB3 Transparency | 1/5 | Held at the integer-grid expansion of the published ACC 1.5, rounded down. No evidence located this cycle bears on this subdimension. | none located |
| AB4 Systemic Learning | 1/5 | Held at the integer-grid expansion of the published ACC 1.5, rounded down. No evidence located this cycle bears on this subdimension. | none located |
| AB5 Reparative Action | 1/5 | Held at 1. Plains paid 230 million dollars in 2022 to a Fisherpeople Class and a Property Class. That is a substantial legal settlement rather than co-designed repair, and it is four years out of window. Not re-scored. | [T2](https://www.businesswire.com/news/home/20220514005014/en/Keller-Rohrback-L.L.P-Plains-All-American-Pipeline-Agrees-to-Pay-230-Million-to-Settle-Class-Action-Lawsuit-Relating-to-2015-Santa-Barbara-Oil-Spill-Disaster) 2022-05-14 |

### SYS: Systemic Thinking (raw 2/5 — scaled 25/100)

| Subdimension | Score | Evidence and anchor match | Source |
|---|---|---|---|
| S1 Root Cause Orientation | 2/5 | Held at the integer-grid expansion of the published SYS 2, rounded down. No evidence located this cycle bears on this subdimension. | none located |
| S2 Long-Term Impact | 2/5 | Held at the integer-grid expansion of the published SYS 2, rounded down. No evidence located this cycle bears on this subdimension. | none located |
| S3 Interconnection Awareness | 2/5 | Held at the integer-grid expansion of the published SYS 2, rounded down. No evidence located this cycle bears on this subdimension. | none located |
| S4 Structural Critique | 2/5 | Held at the integer-grid expansion of the published SYS 2, rounded down. No evidence located this cycle bears on this subdimension. | none located |
| S5 Coalitional Compassion | 2/5 | Held at the integer-grid expansion of the published SYS 2, rounded down. No evidence located this cycle bears on this subdimension. | none located |

### INT: Integrity (raw 1.4/5 — scaled 10/100)

| Subdimension | Score | Evidence and anchor match | Source |
|---|---|---|---|
| I1 Consistency Under Pressure | 2/5 | Held at the integer-grid expansion of the published INT 1.5, rounded down. No evidence located this cycle bears on this subdimension. | none located |
| I2 Non-Performance | 2/5 | Held at the integer-grid expansion of the published INT 1.5, rounded down. No evidence located this cycle bears on this subdimension. | none located |
| I3 Internal Consistency | 1/5 | Held at 1. Plains and Copperhead reached a 1.75-million-dollar settlement with the Equal Employment Opportunity Commission. Date not established; treated as out of window and not re-scored. | [T5](https://www.eeoc.gov/newsroom/plains-and-copperhead-pipeline-companies-reach-settlement-eeoc-175-million) 2020-01-01 |
| I4 Values Alignment | 1/5 | Held at the integer-grid expansion of the published INT 1.5, rounded down. No evidence located this cycle bears on this subdimension. | none located |
| I5 Resilience of Care | 1/5 | Held at the integer-grid expansion of the published INT 1.5, rounded down. No evidence located this cycle bears on this subdimension. | none located |

## Published Index Comparison

**Published index:** fortune-500 | **Published rank:** #403 | **Published composite:** 18.8/100 | **Published band:** critical

| Dimension | Published (raw) | Published (scaled) | Research Score (raw) | Research (scaled) | Difference (scaled) |
|---|---|---|---|---|---|
| AWR | 1.5 | 12.5 | 1.4 | 10 | -2.5 |
| EMP | 2 | 25 | 2 | 25 | 0 |
| ACT | 2 | 25 | 2 | 25 | 0 |
| EQU | 1.5 | 12.5 | 1.4 | 10 | -2.5 |
| BND | 2 | 25 | 2 | 25 | 0 |
| ACC | 1.5 | 12.5 | 1.4 | 10 | -2.5 |
| SYS | 2 | 25 | 2 | 25 | 0 |
| INT | 1.5 | 12.5 | 1.4 | 10 | -2.5 |
| **Composite** | — | **18.8** | — | **17.5** | **-1.3** |

### Recommendation

The published score appears accurate on current evidence. Measured 17.5 against published 18.8 is a delta of -1.3, which does not meet the 5-point magnitude trigger, and the band is unchanged. No change proposal is filed.

## Key Findings

- Plains All American's published score of 18.8 out of 100 is confirmed. The measured 17.5 is 1.3 points lower, and that gap is pure rounding, not a finding.
- Nothing dated inside the two-week window was found. One targeted search returned only historical material.
- The history is severe and it supports the low score rather than changing it. A United States Department of Justice settlement blames the 2015 Refugio Beach rupture -- about 2,934 barrels of crude -- on Plains failing to address pipe corrosion and having inadequate control-room procedures, then failing to respond properly.
- Plains paid 230 million dollars in 2022 to settle fisher and property-owner class actions, and 1.75 million dollars to settle with the Equal Employment Opportunity Commission. Both are years old and neither is re-scored; counting old conduct twice would inflate the movement.
- This row has never been individually assessed, so confidence is low. It stays in the Critical band.

## Strongest Dimensions

Empathy, Action, Boundaries and Systemic Thinking (raw 2.0 each), held from the published profile with no located evidence.

## Weakest Dimensions

Awareness, Equity, Accountability and Integrity (raw 1.4 each after grid rounding), consistent with the documented corrosion, spill-response and discrimination record.

## Evidence Gaps

- No 2026 Plains sustainability, safety or emissions report was located.
- The date of the Equal Employment Opportunity Commission settlement was not established, so it is treated as out of window.
- No employee testimony was located.
- Whether the Department of Justice-mandated national operational safeguards were implemented and verified was not established. That is the fact that would justify any upward move.
- Plains has never been individually assessed; all 40 subdimensions are grid expansions of the published vector.

## Scanner and source corrections

- The scan reports no evidence found for Plains All American. Confirmed independently for the window; substantial pre-window material exists and is recorded above.

## Watch flag

Upward only on independently verified implementation of the Department of Justice-mandated safeguards. Downward on any new release, enforcement action or worker-safety finding dated in a future window.

## Recommended Next Steps

Consider a [Certified Assessment](/certified-assessments) for a structured improvement roadmap.

## Sources

- United States Department of Justice, Office of Public Affairs — 2020-01-01 — tier 5 — https://www.justice.gov/archives/opa/pr/us-pipeline-company-modify-its-national-operations-implement-safeguards-resulting-oil-spill
- United States Equal Employment Opportunity Commission — 2020-01-01 — tier 5 — https://www.eeoc.gov/newsroom/plains-and-copperhead-pipeline-companies-reach-settlement-eeoc-175-million
- Business Wire (Keller Rohrback) — 2022-05-14 — tier 2 — https://www.businesswire.com/news/home/20220514005014/en/Keller-Rohrback-L.L.P-Plains-All-American-Pipeline-Agrees-to-Pay-230-Million-to-Settle-Class-Action-Lawsuit-Relating-to-2015-Santa-Barbara-Oil-Spill-Disaster

---

*This assessment is based on publicly available information and does not constitute a formal Compassion Benchmark Certified Assessment. For a comprehensive, assessor-led evaluation, visit compassionbenchmark.com/certified-assessments.*
