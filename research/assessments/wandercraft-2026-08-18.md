---
entity: "Wandercraft"
type: "Company"
sector: "Medical Robotics"
date: "2026-08-18"
composite_score: 46.2
band: "Functional"
scores:
  AWR: 3.8
  EMP: 2.6
  ACT: 3
  EQU: 3
  BND: 2.8
  ACC: 2.2
  SYS: 3.2
  INT: 2.2
published_index: "robotics-labs"
published_rank: 9
published_composite: 83
published_band: "Exemplary"
assessment_type: "reproduced-evidence confirmation (open proposal collision)"
recommendation: "confirm"
confidence: "high"
change_proposal: false
score_delta: -36.8
band_change: true
source: "priority"
scan_file: "research/scans/2026-08-18.json"
watch_flag: "open proposal wandercraft.json (83.0 -> 46.2, flag-for-review, filed 2026-08-17) stands unchanged"
---

# Compassion Benchmark Assessment: Wandercraft

**Entity type:** Company
**Sector/Domain:** Medical Robotics
**Assessment date:** 2026-08-18
**Composite score:** 46.2/100
**Band:** Functional
**Cycle source:** priority (scan `research/scans/2026-08-18.json`)

## Why this entity was assessed

The scanner flagged Wandercraft on **positive** evidence: FDA clearance for Eve, the first self-balancing personal exoskeleton, reported 2026-08-11, with a US commercial launch scheduled for 2026-09-17. Wandercraft has an open, unapplied change proposal (`research/change-proposals/wandercraft.json`, 83.0 to 46.2, `flag-for-review`, filed 2026-08-17). The first task was therefore to establish whether the scanner's evidence is new or reproduced.

## Evidence-date and attribution checks

**Reproduced evidence — verified, and this is the decisive finding.** The 2026-08-17 assessment already considered the Eve FDA clearance. `research/assessments/wandercraft-2026-08-17.md` cites the MobiHealthNews report "FDA clears Wandercraft's Eve exoskeleton for wheelchair users" at four separate subdimensions: E1, E2, EQ1 and B2. The scanner's 2026-08-11 evidence is the same event, already scored. **No second proposal is filed and no net-new queue entry is created.**

**Date-hygiene correction inherited from the prior file.** The 2026-08-17 assessment recorded the MobiHealthNews Eve item with a placeholder date of `2025-01-01`, which is the default it applied to undated sources. The correct date is **2026-08-11**. This is corrected in the present record. It does not change any score, but the earlier file understated how recent that evidence was.

**Future-date verification — the scanner's "September 17" warning is resolved.** The 2026-09-17 date is a **genuinely scheduled future action**, not a misdated past event. Wandercraft plans to launch Eve commercially in the United States on 17 September 2026, with an unveiling at the Cure healthcare innovation campus in New York City presented with the United Spinal Association. It has not happened and is not scored.

**Mixed dated/undated sourcing.** The scanner listed one undated source (massdevice.com). A dated version of the same report and three further independently dated sources were located, so the finding rests on dated sourcing.

**Directionality.** The flagged evidence is positive. It was assessed as positive and it is already reflected in the pending proposal's scores for E2, EQ1 and B2. It does not justify a further upgrade, because the pending proposal already credits it.

**Scope note.** No subdimension was re-scored. All 40 values are carried forward from 2026-08-17. **The sidecar is omitted**; the 2026-08-17 sidecar stands.

## Score Summary

| Dimension | Code | Raw (1-5) | Scaled (0-100) | Band |
|---|---|---|---|---|
| Awareness | AWR | 3.80 | 70 | Established |
| Empathy | EMP | 2.60 | 40 | Developing |
| Action | ACT | 3.00 | 50 | Functional |
| Equity | EQU | 3.00 | 50 | Functional |
| Boundaries | BND | 2.80 | 45 | Functional |
| Accountability | ACC | 2.20 | 30 | Developing |
| Systemic Thinking | SYS | 3.20 | 55 | Functional |
| Integrity | INT | 2.20 | 30 | Developing |
| **Composite** | — | — | **46.2** | **Functional** |

Integration premium applied: 0. Composite computed with the canonical `computeCompositeFromDimensions` implementation in `site/scripts/lib/scoring.mjs`; it is not a simple mean of the eight dimensions.

## Dimension Details

### AWR: Awareness (Raw 3.80/5 — Scaled 70/100)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| A1 Suffering Detection | 4/5 | Carried forward unchanged from the 2026-08-17 robotics de-seeding assessment. No new in-window evidence bears on this subdimension. | [PubMed — retrospective safety evaluation of the Atalante exoskeleton](https://pubmed.ncbi.nlm.nih.gov/42547495/) — tier 5, 2025-01-01 |
| A2 Contextual Sensitivity | 4/5 | Carried forward unchanged from the 2026-08-17 robotics de-seeding assessment. No new in-window evidence bears on this subdimension. | [PubMed — retrospective safety evaluation of the Atalante exoskeleton](https://pubmed.ncbi.nlm.nih.gov/42547495/) — tier 5, 2025-01-01 |
| A3 Blind Spot Mitigation | 4/5 | Carried forward unchanged from the 2026-08-17 robotics de-seeding assessment. No new in-window evidence bears on this subdimension. | [PubMed — retrospective safety evaluation of the Atalante exoskeleton](https://pubmed.ncbi.nlm.nih.gov/42547495/) — tier 5, 2025-01-01 |
| A4 Signal Amplification | 3/5 | Carried forward unchanged from the 2026-08-17 robotics de-seeding assessment. No new in-window evidence bears on this subdimension. | [PubMed — retrospective safety evaluation of the Atalante exoskeleton](https://pubmed.ncbi.nlm.nih.gov/42547495/) — tier 5, 2025-01-01 |
| A5 Anticipatory Awareness | 4/5 | Carried forward unchanged from the 2026-08-17 robotics de-seeding assessment. No new in-window evidence bears on this subdimension. | [PubMed — retrospective safety evaluation of the Atalante exoskeleton](https://pubmed.ncbi.nlm.nih.gov/42547495/) — tier 5, 2025-01-01 |

### EMP: Empathy (Raw 2.60/5 — Scaled 40/100)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| E1 Affective Resonance | 3/5 | Carried forward unchanged from the 2026-08-17 robotics de-seeding assessment. No new in-window evidence bears on this subdimension. | [PubMed — retrospective safety evaluation of the Atalante exoskeleton](https://pubmed.ncbi.nlm.nih.gov/42547495/) — tier 5, 2025-01-01 |
| E2 Perspective-Taking | 4/5 | Carried forward. The Eve clearance covers eligible wheelchair users with spinal cord injuries at any level, extending the device to people previously excluded by injury level. | [GlobeNewswire via The Manila Times — FDA clearance for Eve](https://www.manilatimes.net/2026/08/11/tmt-newswire/globenewswire/wandercraft-receives-fda-clearance-for-eve-the-worlds-first-self-balancing-personal-exoskeleton-for-eligible-wheelchair-users-living-with-spinal-cord-injuries-at-any-level/2403113) — tier 4, 2026-08-11 |
| E3 Non-Judgment | 2/5 | Carried forward unchanged from the 2026-08-17 robotics de-seeding assessment. No new in-window evidence bears on this subdimension. | [PubMed — retrospective safety evaluation of the Atalante exoskeleton](https://pubmed.ncbi.nlm.nih.gov/42547495/) — tier 5, 2025-01-01 |
| E4 Validation | 2/5 | Carried forward unchanged from the 2026-08-17 robotics de-seeding assessment. No new in-window evidence bears on this subdimension. | [PubMed — retrospective safety evaluation of the Atalante exoskeleton](https://pubmed.ncbi.nlm.nih.gov/42547495/) — tier 5, 2025-01-01 |
| E5 Cultural Empathy | 2/5 | Carried forward unchanged from the 2026-08-17 robotics de-seeding assessment. No new in-window evidence bears on this subdimension. | [PubMed — retrospective safety evaluation of the Atalante exoskeleton](https://pubmed.ncbi.nlm.nih.gov/42547495/) — tier 5, 2025-01-01 |

### ACT: Action (Raw 3.00/5 — Scaled 50/100)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| AC1 Responsiveness | 2/5 | Carried forward unchanged from the 2026-08-17 robotics de-seeding assessment. No new in-window evidence bears on this subdimension. | [PubMed — retrospective safety evaluation of the Atalante exoskeleton](https://pubmed.ncbi.nlm.nih.gov/42547495/) — tier 5, 2025-01-01 |
| AC2 Proportionality | 3/5 | Carried forward unchanged from the 2026-08-17 robotics de-seeding assessment. No new in-window evidence bears on this subdimension. | [PubMed — retrospective safety evaluation of the Atalante exoskeleton](https://pubmed.ncbi.nlm.nih.gov/42547495/) — tier 5, 2025-01-01 |
| AC3 Efficacy | 4/5 | Carried forward. Wandercraft published a peer-reviewed retrospective safety evaluation of Atalante in patients with tetraplegia and high paraplegia and used it to extend the label. | [PubMed — retrospective safety evaluation of the Atalante exoskeleton](https://pubmed.ncbi.nlm.nih.gov/42547495/) — tier 5, 2025-01-01 |
| AC4 Resource Mobilization | 3/5 | Carried forward unchanged from the 2026-08-17 robotics de-seeding assessment. No new in-window evidence bears on this subdimension. | [PubMed — retrospective safety evaluation of the Atalante exoskeleton](https://pubmed.ncbi.nlm.nih.gov/42547495/) — tier 5, 2025-01-01 |
| AC5 Follow-Through | 3/5 | Carried forward unchanged from the 2026-08-17 robotics de-seeding assessment. No new in-window evidence bears on this subdimension. | [PubMed — retrospective safety evaluation of the Atalante exoskeleton](https://pubmed.ncbi.nlm.nih.gov/42547495/) — tier 5, 2025-01-01 |

### EQU: Equity (Raw 3.00/5 — Scaled 50/100)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| EQ1 Universality | 3/5 | Carried forward. Eve is cleared for level indoor surfaces and immediately adjacent level open-air areas under the supervision of a specially trained companion — a real but bounded expansion of coverage. | [MobiHealthNews — FDA clears Wandercraft's Eve exoskeleton](https://www.mobihealthnews.com/news/fda-clears-wandercrafts-eve-exoskeleton-wheelchair-users) — tier 4, 2026-08-11 |
| EQ2 Priority for Vulnerable | 4/5 | Carried forward unchanged from the 2026-08-17 robotics de-seeding assessment. No new in-window evidence bears on this subdimension. | [PubMed — retrospective safety evaluation of the Atalante exoskeleton](https://pubmed.ncbi.nlm.nih.gov/42547495/) — tier 5, 2025-01-01 |
| EQ3 Bias Awareness | 2/5 | Carried forward unchanged from the 2026-08-17 robotics de-seeding assessment. No new in-window evidence bears on this subdimension. | [PubMed — retrospective safety evaluation of the Atalante exoskeleton](https://pubmed.ncbi.nlm.nih.gov/42547495/) — tier 5, 2025-01-01 |
| EQ4 Access Design | 4/5 | Carried forward unchanged from the 2026-08-17 robotics de-seeding assessment. No new in-window evidence bears on this subdimension. | [PubMed — retrospective safety evaluation of the Atalante exoskeleton](https://pubmed.ncbi.nlm.nih.gov/42547495/) — tier 5, 2025-01-01 |
| EQ5 Historical Harm Acknowledgment | 2/5 | Carried forward unchanged from the 2026-08-17 robotics de-seeding assessment. No new in-window evidence bears on this subdimension. | [PubMed — retrospective safety evaluation of the Atalante exoskeleton](https://pubmed.ncbi.nlm.nih.gov/42547495/) — tier 5, 2025-01-01 |

### BND: Boundaries (Raw 2.80/5 — Scaled 45/100)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| B1 Self-Sustainability | 2/5 | Carried forward unchanged from the 2026-08-17 robotics de-seeding assessment. No new in-window evidence bears on this subdimension. | [PubMed — retrospective safety evaluation of the Atalante exoskeleton](https://pubmed.ncbi.nlm.nih.gov/42547495/) — tier 5, 2025-01-01 |
| B2 Autonomy Preservation | 4/5 | Carried forward. Eve is a personal-use device intended to let users walk and perform activities of daily living upright, which builds capacity rather than requiring continued clinical involvement. | [MassDevice — Wandercraft wins FDA clearance for its self-balancing exoskeleton](https://www.massdevice.com/wandercraft-wins-fda-clearance-for-self-balancing-exoskeleton/) — tier 3, 2026-08-11 |
| B3 Scope Clarity | 3/5 | Carried forward unchanged from the 2026-08-17 robotics de-seeding assessment. No new in-window evidence bears on this subdimension. | [PubMed — retrospective safety evaluation of the Atalante exoskeleton](https://pubmed.ncbi.nlm.nih.gov/42547495/) — tier 5, 2025-01-01 |
| B4 Refusal Ethics | 2/5 | Carried forward unchanged from the 2026-08-17 robotics de-seeding assessment. No new in-window evidence bears on this subdimension. | [PubMed — retrospective safety evaluation of the Atalante exoskeleton](https://pubmed.ncbi.nlm.nih.gov/42547495/) — tier 5, 2025-01-01 |
| B5 Consent Orientation | 3/5 | Carried forward unchanged from the 2026-08-17 robotics de-seeding assessment. No new in-window evidence bears on this subdimension. | [PubMed — retrospective safety evaluation of the Atalante exoskeleton](https://pubmed.ncbi.nlm.nih.gov/42547495/) — tier 5, 2025-01-01 |

### ACC: Accountability (Raw 2.20/5 — Scaled 30/100)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| AB1 Harm Acknowledgment | 2/5 | Carried forward unchanged from the 2026-08-17 robotics de-seeding assessment. No new in-window evidence bears on this subdimension. | [PubMed — retrospective safety evaluation of the Atalante exoskeleton](https://pubmed.ncbi.nlm.nih.gov/42547495/) — tier 5, 2025-01-01 |
| AB2 Correction Willingness | 2/5 | Carried forward unchanged from the 2026-08-17 robotics de-seeding assessment. No new in-window evidence bears on this subdimension. | [PubMed — retrospective safety evaluation of the Atalante exoskeleton](https://pubmed.ncbi.nlm.nih.gov/42547495/) — tier 5, 2025-01-01 |
| AB3 Transparency | 3/5 | Carried forward unchanged from the 2026-08-17 robotics de-seeding assessment. No new in-window evidence bears on this subdimension. | [PubMed — retrospective safety evaluation of the Atalante exoskeleton](https://pubmed.ncbi.nlm.nih.gov/42547495/) — tier 5, 2025-01-01 |
| AB4 Systemic Learning | 2/5 | Carried forward unchanged from the 2026-08-17 robotics de-seeding assessment. No new in-window evidence bears on this subdimension. | [PubMed — retrospective safety evaluation of the Atalante exoskeleton](https://pubmed.ncbi.nlm.nih.gov/42547495/) — tier 5, 2025-01-01 |
| AB5 Reparative Action | 2/5 | Carried forward unchanged from the 2026-08-17 robotics de-seeding assessment. No new in-window evidence bears on this subdimension. | [PubMed — retrospective safety evaluation of the Atalante exoskeleton](https://pubmed.ncbi.nlm.nih.gov/42547495/) — tier 5, 2025-01-01 |

### SYS: Systemic Thinking (Raw 3.20/5 — Scaled 55/100)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| S1 Root Cause Orientation | 3/5 | Carried forward unchanged from the 2026-08-17 robotics de-seeding assessment. No new in-window evidence bears on this subdimension. | [PubMed — retrospective safety evaluation of the Atalante exoskeleton](https://pubmed.ncbi.nlm.nih.gov/42547495/) — tier 5, 2025-01-01 |
| S2 Long-Term Impact | 3/5 | Carried forward unchanged from the 2026-08-17 robotics de-seeding assessment. No new in-window evidence bears on this subdimension. | [PubMed — retrospective safety evaluation of the Atalante exoskeleton](https://pubmed.ncbi.nlm.nih.gov/42547495/) — tier 5, 2025-01-01 |
| S3 Interconnection Awareness | 3/5 | Carried forward unchanged from the 2026-08-17 robotics de-seeding assessment. No new in-window evidence bears on this subdimension. | [PubMed — retrospective safety evaluation of the Atalante exoskeleton](https://pubmed.ncbi.nlm.nih.gov/42547495/) — tier 5, 2025-01-01 |
| S4 Structural Critique | 3/5 | Carried forward unchanged from the 2026-08-17 robotics de-seeding assessment. No new in-window evidence bears on this subdimension. | [PubMed — retrospective safety evaluation of the Atalante exoskeleton](https://pubmed.ncbi.nlm.nih.gov/42547495/) — tier 5, 2025-01-01 |
| S5 Coalitional Compassion | 4/5 | Carried forward unchanged from the 2026-08-17 robotics de-seeding assessment. No new in-window evidence bears on this subdimension. | [PubMed — retrospective safety evaluation of the Atalante exoskeleton](https://pubmed.ncbi.nlm.nih.gov/42547495/) — tier 5, 2025-01-01 |

### INT: Integrity (Raw 2.20/5 — Scaled 30/100)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| I1 Consistency Under Pressure | 2/5 | Carried forward unchanged from the 2026-08-17 robotics de-seeding assessment. No new in-window evidence bears on this subdimension. | [PubMed — retrospective safety evaluation of the Atalante exoskeleton](https://pubmed.ncbi.nlm.nih.gov/42547495/) — tier 5, 2025-01-01 |
| I2 Non-Performance | 3/5 | Carried forward unchanged from the 2026-08-17 robotics de-seeding assessment. No new in-window evidence bears on this subdimension. | [PubMed — retrospective safety evaluation of the Atalante exoskeleton](https://pubmed.ncbi.nlm.nih.gov/42547495/) — tier 5, 2025-01-01 |
| I3 Internal Consistency | 2/5 | Carried forward unchanged from the 2026-08-17 robotics de-seeding assessment. No new in-window evidence bears on this subdimension. | [PubMed — retrospective safety evaluation of the Atalante exoskeleton](https://pubmed.ncbi.nlm.nih.gov/42547495/) — tier 5, 2025-01-01 |
| I4 Values Alignment | 2/5 | Carried forward unchanged from the 2026-08-17 robotics de-seeding assessment. No new in-window evidence bears on this subdimension. | [PubMed — retrospective safety evaluation of the Atalante exoskeleton](https://pubmed.ncbi.nlm.nih.gov/42547495/) — tier 5, 2025-01-01 |
| I5 Resilience of Care | 2/5 | Carried forward unchanged from the 2026-08-17 robotics de-seeding assessment. No new in-window evidence bears on this subdimension. | [PubMed — retrospective safety evaluation of the Atalante exoskeleton](https://pubmed.ncbi.nlm.nih.gov/42547495/) — tier 5, 2025-01-01 |

## Published Index Comparison

**Published index:** robotics-labs | **Published rank:** #9 | **Published composite:** 83/100 | **Published band:** Exemplary

| Dimension | Published (raw) | Assessed (raw) | Difference (raw) |
|---|---|---|---|
| AWR | 4 | 3.80 | -0.2 |
| EMP | 4.5 | 2.60 | -1.9 |
| ACT | 4 | 3.00 | -1 |
| EQU | 3.5 | 3.00 | -0.5 |
| BND | 4 | 2.80 | -1.2 |
| ACC | 4 | 2.20 | -1.8 |
| SYS | 4 | 3.20 | -0.8 |
| INT | 4 | 2.20 | -1.8 |
| **Composite** | **83** | **46.2** | **-36.8** |

**Math-hygiene check:** the published dimension vector reconstructs to 83 under the canonical formula against a published composite of 83 (difference 0.0 points). This is within the 0.5-point tolerance, so no math-hygiene issue is raised.

### Analysis

This is a confirmation of an open proposal, not a new finding.

Wandercraft's published composite of 83.0 is a never-assessed uniform placeholder shared with five other robotics labs at consecutive alphabetical ranks. The 2026-08-17 de-seeding study assessed it at 46.2 and filed a `flag-for-review` proposal. That proposal already incorporates the Eve clearance the scanner surfaced.

Against the **published** 83.0, the assessed value of 46.2 is a delta of -36.8 with a band crossing from Exemplary to Functional. Against the **pending** proposal of 46.2, the delta is 0.0. The correct action is to confirm the pending proposal rather than file a duplicate.

On the substance, the Eve clearance is genuinely good. It is the first self-balancing personal exoskeleton cleared by the FDA, it covers spinal cord injuries at any level, and Wandercraft expects Medicare reimbursement eligibility within 60 to 90 days under the existing durable medical equipment programme. That matters because reimbursement, not clearance, determines who can actually get one.

It does not lift the score, for the reason the 08-17 study already identified: Wandercraft's clinical evidence is strong and its **institutional** disclosure is not. Accountability sits at 2.20 of 5 and Integrity at 2.20 of 5 because the company publishes no data on harm, correction, repair, staff wellbeing or values governance. A device clearance does not fill those gaps.

### Recommendation

**Confirm. Do not file a second proposal.** The scanner's evidence is reproduced, not new: the 2026-08-17 assessment already scored the Eve FDA clearance at four subdimensions. The open proposal `research/change-proposals/wandercraft.json` (83.0 to 46.2, `flag-for-review`) stands unchanged and is not modified. Rotation state records `last_assessed: 2026-08-18`; `last_change_proposal` remains at its existing value.

## Key Findings

- Why it matters: the news is real and good, but the benchmark already counted it. The 17 August 2026 assessment of Wandercraft had already scored the Eve FDA clearance in four places, so it cannot move the score again.
- Eve is the first self-balancing personal exoskeleton cleared by the US Food and Drug Administration. It covers eligible wheelchair users with spinal cord injuries at any level.
- Wandercraft expects Eve to qualify for Medicare reimbursement within 60 to 90 days. That matters more than the clearance itself: reimbursement decides who can actually afford one.
- Why the score still does not rise: Wandercraft publishes strong clinical evidence and almost no institutional evidence. Accountability scores 2.20 of 5 and Integrity 2.20 of 5, because there is no public data on harm, repair, staff wellbeing or values governance.
- The published score of 83.0 was never measured. It is a placeholder shared with five other robotics labs at consecutive ranks. A proposal to correct it to 46.2 is already open and unapplied.

## Strongest Dimensions

Awareness (3.80 of 5). Wandercraft is the only lab in its cohort that published a peer-reviewed safety evaluation of its device in patients outside its cleared indication, and then used that evidence to extend the label to them.

## Weakest Dimensions

Accountability (2.20 of 5) and Integrity (2.20 of 5). Sixteen of forty subdimensions sit at the low anchor because no disclosure exists — an absence of disclosure, not a finding of harm.

## Evidence Gaps

Wandercraft publishes no institutional social-performance data: no harm register, no grievance data, no staff wellbeing data, no values-governance disclosure. Pricing and access terms for Eve are not public, and Medicare eligibility is expected rather than confirmed. The 17 September 2026 launch has not occurred and is not scored.

## Sources

- [PubMed — retrospective safety evaluation of the Atalante exoskeleton](https://pubmed.ncbi.nlm.nih.gov/42547495/) — tier 5, 2025-01-01
- [GlobeNewswire via The Manila Times — FDA clearance for Eve](https://www.manilatimes.net/2026/08/11/tmt-newswire/globenewswire/wandercraft-receives-fda-clearance-for-eve-the-worlds-first-self-balancing-personal-exoskeleton-for-eligible-wheelchair-users-living-with-spinal-cord-injuries-at-any-level/2403113) — tier 4, 2026-08-11
- [MobiHealthNews — FDA clears Wandercraft's Eve exoskeleton](https://www.mobihealthnews.com/news/fda-clears-wandercrafts-eve-exoskeleton-wheelchair-users) — tier 4, 2026-08-11
- [MassDevice — Wandercraft wins FDA clearance for its self-balancing exoskeleton](https://www.massdevice.com/wandercraft-wins-fda-clearance-for-self-balancing-exoskeleton/) — tier 3, 2026-08-11

## Recommended Next Steps

Functional band on the assessed value. Consider [Advisory Support](/advisory) to translate benchmark insights into strategic action, with priority on institutional disclosure to match the clinical disclosure.

---

*This assessment is based on publicly available information and does not constitute a formal Compassion Benchmark Certified Assessment. For a comprehensive, assessor-led evaluation, visit compassionbenchmark.com/certified-assessments.*
