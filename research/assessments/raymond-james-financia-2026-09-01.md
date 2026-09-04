---
entity: "Raymond James Financia"
type: "Company"
sector: "Financial services / wealth management"
date: "2026-09-01"
composite_score: 25.6
band: "Developing"
scores:
  AWR: 2
  EMP: 2
  ACT: 2
  EQU: 2
  BND: 2
  ACC: 2.2
  SYS: 2
  INT: 2
published_index: "fortune-500"
published_rank: 47
published_composite: 60.9
published_band: "established"
assessed_composite: 25.6
score_delta: -35.3
band_change: true
recommendation: "flag-for-review"
change_proposal: false
confidence: "low"
subdim_sidecar: true
source: "rotation"
scan_file: "research/scans/2026-09-01.json"
watch_flag: "CALIBRATION — assessed 25.6 against a published 60.9 never-assessed uniform seed. NOT filed. Routed for the four-entity cohort de-seeding study. SEPARATE RECORD DEFECT: the index name "Raymond James Financia" appears truncated."
---

# Compassion Benchmark Assessment: Raymond James Financia

**Entity type:** Company  
**Sector/Domain:** Financial services / wealth management  
**Assessment date:** 2026-09-01  
**Composite score:** 25.6/100  
**Band:** Developing  
**Cycle source:** rotation (scan `research/scans/2026-09-01.json`)

## Why this entity was assessed

Raymond James Financial was carried into this cycle by the rotation backfill on mechanical staleness, with no material compassion-relevant evidence located and `last_assessed: null`.

## Evidence-date, lifecycle and attribution checks

**NEVER-ASSESSED UNIFORM SEED — THIS IS THE CENTRAL FINDING, AND IT IS NOT UNIQUE TO THIS ENTITY.**

This entity's published composite is **60.9**, produced by a dimension vector of exactly 3.5 on seven dimensions and 3.0 on Equity. `research/rotation-state.json` records `last_assessed: null`: **it has never been individually assessed.**

**Four entities in this single rotation backfill carry that identical vector and identical composite:** Nationwide (rank 44), Principal Financial (rank 46), Raymond James Financial (rank 47) and Regions Financial (rank 48). They are consecutive in the Fortune 500 index ranking. All four have `last_assessed: null`. All four were surfaced by mechanical staleness with, in the scanner's own words, "No material compassion-relevant evidence located".

This is the same defect class the benchmark has already documented twice: **Cerebras Systems** (2026-08-16, published 60.9 on a never-assessed uniform seed with seven of eight dimensions identical at 3.5, moved -22.1 with "zero" adverse evidence in either direction), and the **20.3 seed cluster** de-seeded on 2026-08-20. The value 60.9 is, arithmetically, what a uniform 3.5 vector with Equity at 3.0 produces. It is a placeholder shape, not a finding.

**ENTITY-RECORD DEFECT — REPORTED, NOT ACTED ON.** The index name is **"Raymond James Financia"**, and the slug is `raymond-james-financia`. Both appear to be a **truncation of "Raymond James Financial"** — the string is cut one character short of a complete word. This is a cosmetic record defect, not an identity defect: the entity is unambiguously identifiable and there is no duplicate or merged-company problem. Per AUTONOMY.md §1b, any rename is an index write requiring founder approval, and per §3 a record question is escalated rather than fixed by an assessor. **It is reported here and nothing was changed.** All file names in this assessment use the existing slug so the pipeline resolves correctly.

**EVIDENCE SEARCH.** Located: a corporate responsibility and sustainability section on the company's own website; an SEC-filed operating-data press release dated 19 August 2026 reporting record client assets under administration of $1.93 trillion, up 17% year on year. **The corporate responsibility material is self-published and is excluded from any band-crossing test.** No quantified outcome data was located behind it. **No adverse conduct finding, enforcement action or consent order was located.**

**DIRECTIONALITY.** Surfaced on rotation staleness with **no evidence in either direction**. De-seeding, **not a downgrade for new misconduct**.

**NO PROPOSAL IS FILED**, per screening check 5.

## Score Summary

| Dimension | Code | Raw (1-5) | Scaled (0-100) | Published raw | Delta (raw) |
|---|---|---|---|---|---|
| Awareness | AWR | 2 | 25 | 3.5 | -1.5 |
| Empathy | EMP | 2 | 25 | 3.5 | -1.5 |
| Action | ACT | 2 | 25 | 3.5 | -1.5 |
| Equity | EQU | 2 | 25 | 3 | -1 |
| Boundaries | BND | 2 | 25 | 3.5 | -1.5 |
| Accountability | ACC | 2.2 | 30 | 3.5 | -1.3 |
| Systemic Thinking | SYS | 2 | 25 | 3.5 | -1.5 |
| Integrity | INT | 2 | 25 | 3.5 | -1.5 |
| **Composite** | — | — | **25.6** | **60.9** | **-35.3** |

**Band:** Developing (published: established). Integration premium: 0.

## Dimension Details

### AWR: Awareness (raw 2/5 — scaled 25/100)

| Subdimension | Score | Evidence and anchor match | Source |
|---|---|---|---|
| A1 Suffering Detection | 2/5 | ABSENCE OF DISCLOSURE, NOT EVIDENCE OF HARM. Raymond James publishes self-described corporate responsibility material without located quantified outcomes, and was surfaced by staleness with no evidence in either direction. No published material was located that would let an assessor score Suffering Detection above the low anchor, and nothing adverse was found either. Scored 2 per the standing convention, never 1. | [T5](https://www.sec.gov/Archives/edgar/data/720005/000072000526000073/exhibit991rjf2026julyopdat.htm) 2026-08-19 |
| A2 Contextual Sensitivity | 2/5 | ABSENCE OF DISCLOSURE, NOT EVIDENCE OF HARM. Raymond James publishes self-described corporate responsibility material without located quantified outcomes, and was surfaced by staleness with no evidence in either direction. No published material was located that would let an assessor score Contextual Sensitivity above the low anchor, and nothing adverse was found either. Scored 2 per the standing convention, never 1. | [T5](https://www.sec.gov/Archives/edgar/data/720005/000072000526000073/exhibit991rjf2026julyopdat.htm) 2026-08-19 |
| A3 Blind Spot Mitigation | 2/5 | ABSENCE OF DISCLOSURE, NOT EVIDENCE OF HARM. Raymond James publishes self-described corporate responsibility material without located quantified outcomes, and was surfaced by staleness with no evidence in either direction. No published material was located that would let an assessor score Blind Spot Mitigation above the low anchor, and nothing adverse was found either. Scored 2 per the standing convention, never 1. | [T5](https://www.sec.gov/Archives/edgar/data/720005/000072000526000073/exhibit991rjf2026julyopdat.htm) 2026-08-19 |
| A4 Signal Amplification | 2/5 | ABSENCE OF DISCLOSURE, NOT EVIDENCE OF HARM. Raymond James publishes self-described corporate responsibility material without located quantified outcomes, and was surfaced by staleness with no evidence in either direction. No published material was located that would let an assessor score Signal Amplification above the low anchor, and nothing adverse was found either. Scored 2 per the standing convention, never 1. | [T5](https://www.sec.gov/Archives/edgar/data/720005/000072000526000073/exhibit991rjf2026julyopdat.htm) 2026-08-19 |
| A5 Anticipatory Awareness | 2/5 | ABSENCE OF DISCLOSURE, NOT EVIDENCE OF HARM. Raymond James publishes self-described corporate responsibility material without located quantified outcomes, and was surfaced by staleness with no evidence in either direction. No published material was located that would let an assessor score Anticipatory Awareness above the low anchor, and nothing adverse was found either. Scored 2 per the standing convention, never 1. | [T5](https://www.sec.gov/Archives/edgar/data/720005/000072000526000073/exhibit991rjf2026julyopdat.htm) 2026-08-19 |

### EMP: Empathy (raw 2/5 — scaled 25/100)

| Subdimension | Score | Evidence and anchor match | Source |
|---|---|---|---|
| E1 Affective Resonance | 2/5 | ABSENCE OF DISCLOSURE, NOT EVIDENCE OF HARM. Raymond James publishes self-described corporate responsibility material without located quantified outcomes, and was surfaced by staleness with no evidence in either direction. No published material was located that would let an assessor score Affective Resonance above the low anchor, and nothing adverse was found either. Scored 2 per the standing convention, never 1. | [T5](https://www.sec.gov/Archives/edgar/data/720005/000072000526000073/exhibit991rjf2026julyopdat.htm) 2026-08-19 |
| E2 Perspective-Taking | 2/5 | ABSENCE OF DISCLOSURE, NOT EVIDENCE OF HARM. Raymond James publishes self-described corporate responsibility material without located quantified outcomes, and was surfaced by staleness with no evidence in either direction. No published material was located that would let an assessor score Perspective-Taking above the low anchor, and nothing adverse was found either. Scored 2 per the standing convention, never 1. | [T5](https://www.sec.gov/Archives/edgar/data/720005/000072000526000073/exhibit991rjf2026julyopdat.htm) 2026-08-19 |
| E3 Non-Judgment | 2/5 | ABSENCE OF DISCLOSURE, NOT EVIDENCE OF HARM. Raymond James publishes self-described corporate responsibility material without located quantified outcomes, and was surfaced by staleness with no evidence in either direction. No published material was located that would let an assessor score Non-Judgment above the low anchor, and nothing adverse was found either. Scored 2 per the standing convention, never 1. | [T5](https://www.sec.gov/Archives/edgar/data/720005/000072000526000073/exhibit991rjf2026julyopdat.htm) 2026-08-19 |
| E4 Validation | 2/5 | ABSENCE OF DISCLOSURE, NOT EVIDENCE OF HARM. Raymond James publishes self-described corporate responsibility material without located quantified outcomes, and was surfaced by staleness with no evidence in either direction. No published material was located that would let an assessor score Validation above the low anchor, and nothing adverse was found either. Scored 2 per the standing convention, never 1. | [T5](https://www.sec.gov/Archives/edgar/data/720005/000072000526000073/exhibit991rjf2026julyopdat.htm) 2026-08-19 |
| E5 Cultural Empathy | 2/5 | ABSENCE OF DISCLOSURE, NOT EVIDENCE OF HARM. Raymond James publishes self-described corporate responsibility material without located quantified outcomes, and was surfaced by staleness with no evidence in either direction. No published material was located that would let an assessor score Cultural Empathy above the low anchor, and nothing adverse was found either. Scored 2 per the standing convention, never 1. | [T5](https://www.sec.gov/Archives/edgar/data/720005/000072000526000073/exhibit991rjf2026julyopdat.htm) 2026-08-19 |

### ACT: Action (raw 2/5 — scaled 25/100)

| Subdimension | Score | Evidence and anchor match | Source |
|---|---|---|---|
| AC1 Responsiveness | 2/5 | ABSENCE OF DISCLOSURE, NOT EVIDENCE OF HARM. Raymond James publishes self-described corporate responsibility material without located quantified outcomes, and was surfaced by staleness with no evidence in either direction. No published material was located that would let an assessor score Responsiveness above the low anchor, and nothing adverse was found either. Scored 2 per the standing convention, never 1. | [T5](https://www.sec.gov/Archives/edgar/data/720005/000072000526000073/exhibit991rjf2026julyopdat.htm) 2026-08-19 |
| AC2 Proportionality | 2/5 | ABSENCE OF DISCLOSURE, NOT EVIDENCE OF HARM. Raymond James publishes self-described corporate responsibility material without located quantified outcomes, and was surfaced by staleness with no evidence in either direction. No published material was located that would let an assessor score Proportionality above the low anchor, and nothing adverse was found either. Scored 2 per the standing convention, never 1. | [T5](https://www.sec.gov/Archives/edgar/data/720005/000072000526000073/exhibit991rjf2026julyopdat.htm) 2026-08-19 |
| AC3 Efficacy | 2/5 | ABSENCE OF DISCLOSURE, NOT EVIDENCE OF HARM. Raymond James publishes self-described corporate responsibility material without located quantified outcomes, and was surfaced by staleness with no evidence in either direction. No published material was located that would let an assessor score Efficacy above the low anchor, and nothing adverse was found either. Scored 2 per the standing convention, never 1. | [T5](https://www.sec.gov/Archives/edgar/data/720005/000072000526000073/exhibit991rjf2026julyopdat.htm) 2026-08-19 |
| AC4 Resource Mobilization | 2/5 | ABSENCE OF DISCLOSURE, NOT EVIDENCE OF HARM. Raymond James publishes self-described corporate responsibility material without located quantified outcomes, and was surfaced by staleness with no evidence in either direction. No published material was located that would let an assessor score Resource Mobilization above the low anchor, and nothing adverse was found either. Scored 2 per the standing convention, never 1. | [T5](https://www.sec.gov/Archives/edgar/data/720005/000072000526000073/exhibit991rjf2026julyopdat.htm) 2026-08-19 |
| AC5 Follow-Through | 2/5 | ABSENCE OF DISCLOSURE, NOT EVIDENCE OF HARM. Raymond James publishes self-described corporate responsibility material without located quantified outcomes, and was surfaced by staleness with no evidence in either direction. No published material was located that would let an assessor score Follow-Through above the low anchor, and nothing adverse was found either. Scored 2 per the standing convention, never 1. | [T5](https://www.sec.gov/Archives/edgar/data/720005/000072000526000073/exhibit991rjf2026julyopdat.htm) 2026-08-19 |

### EQU: Equity (raw 2/5 — scaled 25/100)

| Subdimension | Score | Evidence and anchor match | Source |
|---|---|---|---|
| EQ1 Universality | 2/5 | ABSENCE OF DISCLOSURE, NOT EVIDENCE OF HARM. Raymond James publishes self-described corporate responsibility material without located quantified outcomes, and was surfaced by staleness with no evidence in either direction. No published material was located that would let an assessor score Universality above the low anchor, and nothing adverse was found either. Scored 2 per the standing convention, never 1. | [T5](https://www.sec.gov/Archives/edgar/data/720005/000072000526000073/exhibit991rjf2026julyopdat.htm) 2026-08-19 |
| EQ2 Priority for Vulnerable | 2/5 | ABSENCE OF DISCLOSURE, NOT EVIDENCE OF HARM. Raymond James publishes self-described corporate responsibility material without located quantified outcomes, and was surfaced by staleness with no evidence in either direction. No published material was located that would let an assessor score Priority for Vulnerable above the low anchor, and nothing adverse was found either. Scored 2 per the standing convention, never 1. | [T5](https://www.sec.gov/Archives/edgar/data/720005/000072000526000073/exhibit991rjf2026julyopdat.htm) 2026-08-19 |
| EQ3 Bias Awareness | 2/5 | ABSENCE OF DISCLOSURE, NOT EVIDENCE OF HARM. Raymond James publishes self-described corporate responsibility material without located quantified outcomes, and was surfaced by staleness with no evidence in either direction. No published material was located that would let an assessor score Bias Awareness above the low anchor, and nothing adverse was found either. Scored 2 per the standing convention, never 1. | [T5](https://www.sec.gov/Archives/edgar/data/720005/000072000526000073/exhibit991rjf2026julyopdat.htm) 2026-08-19 |
| EQ4 Access Design | 2/5 | ABSENCE OF DISCLOSURE, NOT EVIDENCE OF HARM. Raymond James publishes self-described corporate responsibility material without located quantified outcomes, and was surfaced by staleness with no evidence in either direction. No published material was located that would let an assessor score Access Design above the low anchor, and nothing adverse was found either. Scored 2 per the standing convention, never 1. | [T5](https://www.sec.gov/Archives/edgar/data/720005/000072000526000073/exhibit991rjf2026julyopdat.htm) 2026-08-19 |
| EQ5 Historical Harm Acknowledgment | 2/5 | ABSENCE OF DISCLOSURE, NOT EVIDENCE OF HARM. Raymond James publishes self-described corporate responsibility material without located quantified outcomes, and was surfaced by staleness with no evidence in either direction. No published material was located that would let an assessor score Historical Harm Acknowledgment above the low anchor, and nothing adverse was found either. Scored 2 per the standing convention, never 1. | [T5](https://www.sec.gov/Archives/edgar/data/720005/000072000526000073/exhibit991rjf2026julyopdat.htm) 2026-08-19 |

### BND: Boundaries (raw 2/5 — scaled 25/100)

| Subdimension | Score | Evidence and anchor match | Source |
|---|---|---|---|
| B1 Self-Sustainability | 2/5 | ABSENCE OF DISCLOSURE, NOT EVIDENCE OF HARM. Raymond James publishes self-described corporate responsibility material without located quantified outcomes, and was surfaced by staleness with no evidence in either direction. No published material was located that would let an assessor score Self-Sustainability above the low anchor, and nothing adverse was found either. Scored 2 per the standing convention, never 1. | [T5](https://www.sec.gov/Archives/edgar/data/720005/000072000526000073/exhibit991rjf2026julyopdat.htm) 2026-08-19 |
| B2 Autonomy Preservation | 2/5 | ABSENCE OF DISCLOSURE, NOT EVIDENCE OF HARM. Raymond James publishes self-described corporate responsibility material without located quantified outcomes, and was surfaced by staleness with no evidence in either direction. No published material was located that would let an assessor score Autonomy Preservation above the low anchor, and nothing adverse was found either. Scored 2 per the standing convention, never 1. | [T5](https://www.sec.gov/Archives/edgar/data/720005/000072000526000073/exhibit991rjf2026julyopdat.htm) 2026-08-19 |
| B3 Scope Clarity | 2/5 | ABSENCE OF DISCLOSURE, NOT EVIDENCE OF HARM. Raymond James publishes self-described corporate responsibility material without located quantified outcomes, and was surfaced by staleness with no evidence in either direction. No published material was located that would let an assessor score Scope Clarity above the low anchor, and nothing adverse was found either. Scored 2 per the standing convention, never 1. | [T5](https://www.sec.gov/Archives/edgar/data/720005/000072000526000073/exhibit991rjf2026julyopdat.htm) 2026-08-19 |
| B4 Refusal Ethics | 2/5 | ABSENCE OF DISCLOSURE, NOT EVIDENCE OF HARM. Raymond James publishes self-described corporate responsibility material without located quantified outcomes, and was surfaced by staleness with no evidence in either direction. No published material was located that would let an assessor score Refusal Ethics above the low anchor, and nothing adverse was found either. Scored 2 per the standing convention, never 1. | [T5](https://www.sec.gov/Archives/edgar/data/720005/000072000526000073/exhibit991rjf2026julyopdat.htm) 2026-08-19 |
| B5 Consent Orientation | 2/5 | ABSENCE OF DISCLOSURE, NOT EVIDENCE OF HARM. Raymond James publishes self-described corporate responsibility material without located quantified outcomes, and was surfaced by staleness with no evidence in either direction. No published material was located that would let an assessor score Consent Orientation above the low anchor, and nothing adverse was found either. Scored 2 per the standing convention, never 1. | [T5](https://www.sec.gov/Archives/edgar/data/720005/000072000526000073/exhibit991rjf2026julyopdat.htm) 2026-08-19 |

### ACC: Accountability (raw 2.2/5 — scaled 30/100)

| Subdimension | Score | Evidence and anchor match | Source |
|---|---|---|---|
| AB1 Harm Acknowledgment | 2/5 | ABSENCE OF DISCLOSURE, NOT EVIDENCE OF HARM. Raymond James publishes self-described corporate responsibility material without located quantified outcomes, and was surfaced by staleness with no evidence in either direction. No published material was located that would let an assessor score Harm Acknowledgment above the low anchor, and nothing adverse was found either. Scored 2 per the standing convention, never 1. | [T5](https://www.sec.gov/Archives/edgar/data/720005/000072000526000073/exhibit991rjf2026julyopdat.htm) 2026-08-19 |
| AB2 Correction Willingness | 2/5 | ABSENCE OF DISCLOSURE, NOT EVIDENCE OF HARM. Raymond James publishes self-described corporate responsibility material without located quantified outcomes, and was surfaced by staleness with no evidence in either direction. No published material was located that would let an assessor score Correction Willingness above the low anchor, and nothing adverse was found either. Scored 2 per the standing convention, never 1. | [T5](https://www.sec.gov/Archives/edgar/data/720005/000072000526000073/exhibit991rjf2026julyopdat.htm) 2026-08-19 |
| AB3 Transparency | 3/5 | Raymond James publishes corporate responsibility and sustainability reporting. Scored 3 for the fact of publication only — no quantified outcomes were located behind it, and the material is self-published. Anchor 3 at its weakest reading. | [T2](https://www.raymondjames.com/about-us/corporate-responsibility) 2026-09-01 |
| AB4 Systemic Learning | 2/5 | ABSENCE OF DISCLOSURE, NOT EVIDENCE OF HARM. Raymond James publishes self-described corporate responsibility material without located quantified outcomes, and was surfaced by staleness with no evidence in either direction. No published material was located that would let an assessor score Systemic Learning above the low anchor, and nothing adverse was found either. Scored 2 per the standing convention, never 1. | [T5](https://www.sec.gov/Archives/edgar/data/720005/000072000526000073/exhibit991rjf2026julyopdat.htm) 2026-08-19 |
| AB5 Reparative Action | 2/5 | ABSENCE OF DISCLOSURE, NOT EVIDENCE OF HARM. Raymond James publishes self-described corporate responsibility material without located quantified outcomes, and was surfaced by staleness with no evidence in either direction. No published material was located that would let an assessor score Reparative Action above the low anchor, and nothing adverse was found either. Scored 2 per the standing convention, never 1. | [T5](https://www.sec.gov/Archives/edgar/data/720005/000072000526000073/exhibit991rjf2026julyopdat.htm) 2026-08-19 |

### SYS: Systemic Thinking (raw 2/5 — scaled 25/100)

| Subdimension | Score | Evidence and anchor match | Source |
|---|---|---|---|
| S1 Root Cause Orientation | 2/5 | ABSENCE OF DISCLOSURE, NOT EVIDENCE OF HARM. Raymond James publishes self-described corporate responsibility material without located quantified outcomes, and was surfaced by staleness with no evidence in either direction. No published material was located that would let an assessor score Root Cause Orientation above the low anchor, and nothing adverse was found either. Scored 2 per the standing convention, never 1. | [T5](https://www.sec.gov/Archives/edgar/data/720005/000072000526000073/exhibit991rjf2026julyopdat.htm) 2026-08-19 |
| S2 Long-Term Impact | 2/5 | ABSENCE OF DISCLOSURE, NOT EVIDENCE OF HARM. Raymond James publishes self-described corporate responsibility material without located quantified outcomes, and was surfaced by staleness with no evidence in either direction. No published material was located that would let an assessor score Long-Term Impact above the low anchor, and nothing adverse was found either. Scored 2 per the standing convention, never 1. | [T5](https://www.sec.gov/Archives/edgar/data/720005/000072000526000073/exhibit991rjf2026julyopdat.htm) 2026-08-19 |
| S3 Interconnection Awareness | 2/5 | ABSENCE OF DISCLOSURE, NOT EVIDENCE OF HARM. Raymond James publishes self-described corporate responsibility material without located quantified outcomes, and was surfaced by staleness with no evidence in either direction. No published material was located that would let an assessor score Interconnection Awareness above the low anchor, and nothing adverse was found either. Scored 2 per the standing convention, never 1. | [T5](https://www.sec.gov/Archives/edgar/data/720005/000072000526000073/exhibit991rjf2026julyopdat.htm) 2026-08-19 |
| S4 Structural Critique | 2/5 | ABSENCE OF DISCLOSURE, NOT EVIDENCE OF HARM. Raymond James publishes self-described corporate responsibility material without located quantified outcomes, and was surfaced by staleness with no evidence in either direction. No published material was located that would let an assessor score Structural Critique above the low anchor, and nothing adverse was found either. Scored 2 per the standing convention, never 1. | [T5](https://www.sec.gov/Archives/edgar/data/720005/000072000526000073/exhibit991rjf2026julyopdat.htm) 2026-08-19 |
| S5 Coalitional Compassion | 2/5 | ABSENCE OF DISCLOSURE, NOT EVIDENCE OF HARM. Raymond James publishes self-described corporate responsibility material without located quantified outcomes, and was surfaced by staleness with no evidence in either direction. No published material was located that would let an assessor score Coalitional Compassion above the low anchor, and nothing adverse was found either. Scored 2 per the standing convention, never 1. | [T5](https://www.sec.gov/Archives/edgar/data/720005/000072000526000073/exhibit991rjf2026julyopdat.htm) 2026-08-19 |

### INT: Integrity (raw 2/5 — scaled 25/100)

| Subdimension | Score | Evidence and anchor match | Source |
|---|---|---|---|
| I1 Consistency Under Pressure | 2/5 | ABSENCE OF DISCLOSURE, NOT EVIDENCE OF HARM. Raymond James publishes self-described corporate responsibility material without located quantified outcomes, and was surfaced by staleness with no evidence in either direction. No published material was located that would let an assessor score Consistency Under Pressure above the low anchor, and nothing adverse was found either. Scored 2 per the standing convention, never 1. | [T5](https://www.sec.gov/Archives/edgar/data/720005/000072000526000073/exhibit991rjf2026julyopdat.htm) 2026-08-19 |
| I2 Non-Performance | 2/5 | ABSENCE OF DISCLOSURE, NOT EVIDENCE OF HARM. Raymond James publishes self-described corporate responsibility material without located quantified outcomes, and was surfaced by staleness with no evidence in either direction. No published material was located that would let an assessor score Non-Performance above the low anchor, and nothing adverse was found either. Scored 2 per the standing convention, never 1. | [T5](https://www.sec.gov/Archives/edgar/data/720005/000072000526000073/exhibit991rjf2026julyopdat.htm) 2026-08-19 |
| I3 Internal Consistency | 2/5 | ABSENCE OF DISCLOSURE, NOT EVIDENCE OF HARM. Raymond James publishes self-described corporate responsibility material without located quantified outcomes, and was surfaced by staleness with no evidence in either direction. No published material was located that would let an assessor score Internal Consistency above the low anchor, and nothing adverse was found either. Scored 2 per the standing convention, never 1. | [T5](https://www.sec.gov/Archives/edgar/data/720005/000072000526000073/exhibit991rjf2026julyopdat.htm) 2026-08-19 |
| I4 Values Alignment | 2/5 | ABSENCE OF DISCLOSURE, NOT EVIDENCE OF HARM. Raymond James publishes self-described corporate responsibility material without located quantified outcomes, and was surfaced by staleness with no evidence in either direction. No published material was located that would let an assessor score Values Alignment above the low anchor, and nothing adverse was found either. Scored 2 per the standing convention, never 1. | [T5](https://www.sec.gov/Archives/edgar/data/720005/000072000526000073/exhibit991rjf2026julyopdat.htm) 2026-08-19 |
| I5 Resilience of Care | 2/5 | ABSENCE OF DISCLOSURE, NOT EVIDENCE OF HARM. Raymond James publishes self-described corporate responsibility material without located quantified outcomes, and was surfaced by staleness with no evidence in either direction. No published material was located that would let an assessor score Resilience of Care above the low anchor, and nothing adverse was found either. Scored 2 per the standing convention, never 1. | [T5](https://www.sec.gov/Archives/edgar/data/720005/000072000526000073/exhibit991rjf2026julyopdat.htm) 2026-08-19 |

## Published Index Comparison

**Published index:** fortune-500 | **Published rank:** #47 | **Published composite:** 60.9/100 | **Published band:** established

Canonical reconstruction of the published dimension vector returns **60.9**, against a published composite of **60.9**. Difference is within 0.5 points, so there is no math-hygiene issue.

Assessed 25.6 against published 60.9 — a nominal gap of **-35.3** spanning three bands. This is the distance between a placeholder and an evidence floor, not a finding about the company.

The canonical formula reproduces 60.9 exactly from the seed vector. No math-hygiene issue.

## Key Findings

- Raymond James Financial has never been assessed. Its 60.9 is a placeholder shared with three other companies in this same batch.
- The company's name in the index is cut short — "Raymond James Financia", missing the final letter. Reported for founder decision; nothing was changed, because names are not this stage's to edit.
- Raymond James publishes corporate responsibility material, but it is self-published and carries no quantified outcomes an outsider can check. It cannot lift the score on its own.
- Nothing adverse was found. The company reported record client assets of $1.93 trillion in August 2026, which says nothing about compassion either way.
- No score change is proposed. This belongs in a four-company cohort review.

## Strongest Dimensions

**Accountability (2.2)**, marginally, on the existence of published corporate responsibility reporting. It is scored 3 on one subdimension for existing, not for its content — no quantified outcomes were located behind it.

## Weakest Dimensions

Not meaningfully rankable. Seven of eight dimensions sit at a uniform 2.0 reflecting an information vacuum.

## Evidence Gaps

- 39 of 40 subdimensions rest on absence of disclosure.
- The corporate responsibility material is self-published with no located quantified outcomes, so it cannot support scores above the absence anchor except on the bare fact of publication.
- No independent assessment, regulatory action or adverse finding was located in either direction.
- The index entity name appears truncated, which was reported and not corrected.

## Disclosure — what this score measures

**RULE R9 DISCLOSURE — REQUIRED, AND STATED IN THE PRESCRIBED WORDS.**

Where this assessment scores below the published value, **the movement measures absence of disclosure, not misconduct.** No adverse conduct finding underlies it. Reporting any part of this gap as a decline in this company's behaviour would be **factually wrong**.

The standing convention is applied without exception: **absence of disclosure scores 2, never 1.** A score of 1 requires positive documented evidence of a specific failure. Where no such evidence exists, the low anchor 2 is used and the row says so.

**Disclosure density: 39 of 40 subdimensions rest on absence of disclosure.** This is the emptiest file in the cohort. Raymond James may practise far better than 25.6 of 100 implies; the benchmark cannot see it and says so.

## Recommendation

**Confirm the published score. NO CHANGE PROPOSAL FILED. Routed `flag-for-review` for calibration only.**

Handle inside the four-entity cohort de-seeding study.

**Separately escalated (not a score matter):** the index name "Raymond James Financia" appears truncated by one character. Renaming an entity is an index write requiring founder approval under AUTONOMY.md §1b. It was not changed.

## Sources

- [Raymond James — Corporate Responsibility](https://www.raymondjames.com/about-us/corporate-responsibility) (tier 2, SELF-PUBLISHED — excluded from any band-crossing test)
- [U.S. Securities and Exchange Commission — Raymond James Financial operating data press release, 2026-08-19](https://www.sec.gov/Archives/edgar/data/720005/000072000526000073/exhibit991rjf2026julyopdat.htm) (tier 5; no compassion-relevant finding)
- Published seed verified directly in `site/src/data/indexes/fortune-500.json` (composite 60.9, rank 47)
- Precedent: `research/APPLIED_CHANGES.md` 2026-08-16 (Cerebras Systems); 2026-08-20 (20.3 seed cluster)

## Recommended Next Steps

- **Critical/Developing**: Consider a [Certified Assessment](/certified-assessments) for a structured improvement roadmap.

---

*This assessment is based on publicly available information and does not constitute a formal Compassion Benchmark Certified Assessment. For a comprehensive, assessor-led evaluation, visit compassionbenchmark.com/certified-assessments.*
