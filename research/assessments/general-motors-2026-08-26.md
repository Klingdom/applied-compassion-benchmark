---
entity: "General Motors"
type: "Company"
sector: "Automotive / Manufacturing"
date: "2026-08-26"
composite_score: 33.7
band: "Developing"
scores:
  AWR: 2.2
  EMP: 2.4
  ACT: 2.4
  EQU: 2.4
  BND: 2.8
  ACC: 2.0
  SYS: 2.2
  INT: 2.4
published_index: "fortune-500"
published_rank: 176
published_composite: 40.6
published_band: "functional"
published_dimensions:
  AWR: 2.5
  EMP: 2.5
  ACT: 3.0
  EQU: 2.5
  BND: 3.0
  ACC: 2.5
  SYS: 2.5
  INT: 2.5
assessed_composite: 33.7
score_delta: -6.9
band_change: true
recommendation: "flag-for-review"
change_proposal: true
confidence: "medium"
subdim_sidecar: true
source: "priority"
scan_file: "research/scans/2026-08-26.json"
---

# Compassion Benchmark Assessment: General Motors

**Entity type:** Company
**Sector/Domain:** Automotive / Manufacturing
**Assessment date:** 2026-08-26
**Composite score:** 33.7/100
**Band:** Developing
**Cycle source:** priority (scan `research/scans/2026-08-26.json`)

> This assessment is based on publicly available information and does not constitute a formal Compassion Benchmark Certified Assessment. For a comprehensive, assessor-led evaluation, visit compassionbenchmark.com/certified-assessments.

## Why this entity was assessed

The scanner flagged General Motors on an expanded federal safety investigation into its 6.2-litre L87 V8 engine after owners reported the recall repair had not worked. GM was last assessed on 2026-05-30, as a rotation confirmation that made no change.

## Evidence-date and attribution checks

**DATE CORRECTED.** The scan recorded `evidence_date` 2026-08-21 against a Detroit News URL dated 2026-08-21 and a Claims Journal URL dated 2026-08-24. The actual regulatory act is dated one day earlier: auto123, published 2026-08-24, states verbatim that "The National Highway Traffic Safety Administration (NHTSA) opened an Engineering Analysis last week, on **August 20, 2026**." Independent trade coverage (gm-trucks.com, Fuels & Lubes) agrees on 20 August. Some coverage says 21 August, which appears to track the news-publication date rather than the docket date. **Corrected `evidence_date`: 2026-08-20.** Both dates are inside the window and the correction does not affect any score. All sources are explicit 2026; no year confusion.

**ATTRIBUTION — the regulator's act is not the conduct being scored.** Opening Engineering Analysis EA26005 is NHTSA's action, not GM's, and it is not scored as GM conduct. What is scored as GM conduct is: (1) the design and manufacture of the L87 engine; (2) the remedy GM chose under Recall 25V-274, which for 473 of 499 complaining owners was an oil-viscosity change; and (3) GM's response to 690 subsequent failure reports. NHTSA's docket is used only as the evidentiary record of those facts.

**NO INJURY EVIDENCE LOCATED — AND THAT LIMITS THE MOVEMENT.** No source located reports crashes, injuries or deaths from L87 failures. The documented harm is loss of the vehicle and a repair that did not hold. Several subdimensions are therefore scored at 2 rather than 1, and Boundaries is held at 2.80.

**BOUNDARY PROXIMITY — DISCLOSED.** The 2026-05-30 assessment recorded that 40.6 sits 0.6 points above the Functional/Developing boundary at 40.0. **Any downward movement of any size crosses the band.** This is stated up front because the band change here is arithmetically near-inevitable, not a dramatic judgement.

## Score Summary

| Dimension | Code | Raw (1-5) | Scaled (0-100) | Band |
|---|---|---|---|---|
| Awareness | AWR | 2.20 | 30.0 | Developing |
| Empathy | EMP | 2.40 | 35.0 | Developing |
| Action | ACT | 2.40 | 35.0 | Developing |
| Equity | EQU | 2.40 | 35.0 | Developing |
| Boundaries | BND | 2.80 | 45.0 | Functional |
| Accountability | ACC | 2.00 | 25.0 | Developing |
| Systemic Thinking | SYS | 2.20 | 30.0 | Developing |
| Integrity | INT | 2.40 | 35.0 | Developing |
| **Composite** | — | — | **33.7** | **Developing** |

Integration premium: 0.0 (all eight dimensions below 4.0).

## Dimension Details

### AWR: Awareness (2.20 raw / 30.0 scaled)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| A1 Suffering Detection | 2/5 | The failure of the remedy was established by owners filing complaints with a federal regulator, not by GM's own monitoring: "Regulators have logged 499 complaints of engine failure in vehicles that had already undergone recall repairs." Anchor 2: reactive detection. | [auto123 2026-08-24](https://www.auto123.com/en/news/nhtsa-investigation-gm-v8-engine/74166/) |
| A2 Contextual Sensitivity | 2/5 | The same oil-viscosity remedy was applied uniformly; no differentiation by failure mode or owner circumstance is evident. | [gm-trucks 2026-08-22](https://www.gm-trucks.com/nhtsa-gm-62l-v8-engine-investigation-expands/) |
| A3 Blind Spot Mitigation | 2/5 | GM's 31 May 2024 recall cutoff missed 191 later-built engines that also failed. No self-initiated process caught the boundary error. | [auto123 2026-08-24](https://www.auto123.com/en/news/nhtsa-investigation-gm-v8-engine/74166/) |
| A4 Signal Amplification | 2/5 | Individual owners had no effective channel other than the NHTSA complaint database. | [Detroit News 2026-08-21](https://www.detroitnews.com/story/business/autos/general-motors/2026/08/21/engine-failure-concerns-prompt-nhtsa-probe-of-gm-pickups-suvs/91401320007/) |
| A5 Anticipatory Awareness | 3/5 | GM operates formal pre-production validation typical of a regulated manufacturer. Independent analyses now point to "microscopic ridges on the L87's crankshaft" — a manufacturing-control issue its process did not catch. Anchor 3 held, not raised. | [auto123 2026-08-24](https://www.auto123.com/en/news/nhtsa-investigation-gm-v8-engine/74166/) |

### EMP: Empathy (2.40 raw / 35.0 scaled)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| E1 Affective Resonance | 2/5 | Owners whose engines failed a second time after a dealer repair describe a transactional process; no evidence of structural expectation otherwise. | [auto123 2026-08-24](https://www.auto123.com/en/news/nhtsa-investigation-gm-v8-engine/74166/) |
| E2 Perspective-Taking | 2/5 | The remedy chosen for most owners was the cheapest available intervention, not the one that models what a repeat failure costs an owner. | [gm-trucks 2026-08-22](https://www.gm-trucks.com/nhtsa-gm-62l-v8-engine-investigation-expands/) |
| E3 Non-Judgment | 3/5 | No evidence of differential treatment by identity; recall eligibility is applied by VIN. | [Claims Journal 2026-08-24](https://www.claimsjournal.com/news/national/2026/08/24/339741.htm) |
| E4 Validation | 2/5 | 499 owners reported a failure after being told their vehicle was fixed. No public GM acknowledgment that the remedy did not hold was located. | [auto123 2026-08-24](https://www.auto123.com/en/news/nhtsa-investigation-gm-v8-engine/74166/) |
| E5 Cultural Empathy | 3/5 | GM operates multilingual customer channels across global markets; no adverse or exceptional evidence located. | [Fuels & Lubes 2026-08-24](https://www.fuelsandlubes.com/u-s-regulator-probes-gm-engine-recall-fix-on-998000-vehicles/) |

### ACT: Action (2.40 raw / 35.0 scaled)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| AC1 Responsiveness | 3/5 | GM did act: Recall 25V-274 covered roughly 597,630 vehicles with defined dealer procedures. Standards were met for most cases. | [Detroit News 2026-08-21](https://www.detroitnews.com/story/business/autos/general-motors/2026/08/21/engine-failure-concerns-prompt-nhtsa-probe-of-gm-pickups-suvs/91401320007/) |
| AC2 Proportionality | 2/5 | **Down.** 473 of the 499 complaining owners received an oil-viscosity change for what independent analysis attributes to a crankshaft manufacturing defect. Anchor 2: needs assessment on paper, resources drive the response. | [auto123 2026-08-24](https://www.auto123.com/en/news/nhtsa-investigation-gm-v8-engine/74166/) |
| AC3 Efficacy | 2/5 | **Down — the central finding.** The help did not work. 499 post-remedy failures, including 26 in vehicles that had received a complete engine replacement. Outcome data exists and sits in a federal docket; no GM review acting on it was located. | [auto123 2026-08-24](https://www.auto123.com/en/news/nhtsa-investigation-gm-v8-engine/74166/) |
| AC4 Resource Mobilization | 3/5 | A ~600,000-vehicle recall is substantial resource mobilization, including 26 full engine replacements. | [Claims Journal 2026-08-24](https://www.claimsjournal.com/news/national/2026/08/24/339741.htm) |
| AC5 Follow-Through | 2/5 | Engagement ended when the presenting problem was declared resolved. The recall population has not been expanded despite 690 new failure reports. | [auto123 2026-08-24](https://www.auto123.com/en/news/nhtsa-investigation-gm-v8-engine/74166/) |

### EQU: Equity (2.40 raw / 35.0 scaled)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| EQ1 Universality | 3/5 | Recall remedies are offered to all owners of affected VINs without means testing. | [Fuels & Lubes 2026-08-24](https://www.fuelsandlubes.com/u-s-regulator-probes-gm-engine-recall-fix-on-998000-vehicles/) |
| EQ2 Priority for Vulnerable | 2/5 | An owner whose only vehicle fails twice bears far more than an owner with alternatives; no prioritization mechanism is evident. | [gm-trucks 2026-08-22](https://www.gm-trucks.com/nhtsa-gm-62l-v8-engine-investigation-expands/) |
| EQ3 Bias Awareness | 2/5 | No disaggregated remedy-outcome data published. | [Detroit News 2026-08-21](https://www.detroitnews.com/story/business/autos/general-motors/2026/08/21/engine-failure-concerns-prompt-nhtsa-probe-of-gm-pickups-suvs/91401320007/) |
| EQ4 Access Design | 3/5 | A national dealer network with no-cost recall service is a genuine access structure. | [Claims Journal 2026-08-24](https://www.claimsjournal.com/news/national/2026/08/24/339741.htm) |
| EQ5 Historical Harm Acknowledgment | 2/5 | No acknowledgment located of harm to owners whose repaired engines failed again. | [auto123 2026-08-24](https://www.auto123.com/en/news/nhtsa-investigation-gm-v8-engine/74166/) |

### BND: Boundaries (2.80 raw / 45.0 scaled)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| B1 Self-Sustainability | 3/5 | No new workforce evidence this window; middle anchor held from baseline. | [Claims Journal 2026-08-24](https://www.claimsjournal.com/news/national/2026/08/24/339741.htm) |
| B2 Autonomy Preservation | 3/5 | Recall service does not create dependency; owners retain full use once repaired. | [Fuels & Lubes 2026-08-24](https://www.fuelsandlubes.com/u-s-regulator-probes-gm-engine-recall-fix-on-998000-vehicles/) |
| B3 Scope Clarity | 2/5 | **Down.** Owners were told the remedy resolved the defect. For 499 of them it did not, and they discovered the limitation only after investing time and trust in a dealer visit. | [auto123 2026-08-24](https://www.auto123.com/en/news/nhtsa-investigation-gm-v8-engine/74166/) |
| B4 Refusal Ethics | 3/5 | Owners outside the recall population are told so and directed to warranty channels; no evidence of dismissal without alternatives. | [gm-trucks 2026-08-22](https://www.gm-trucks.com/nhtsa-gm-62l-v8-engine-investigation-expands/) |
| B5 Consent Orientation | 3/5 | Recall notices are regulated disclosures that explain the defect and the remedy. No adverse evidence located. | [Detroit News 2026-08-21](https://www.detroitnews.com/story/business/autos/general-motors/2026/08/21/engine-failure-concerns-prompt-nhtsa-probe-of-gm-pickups-suvs/91401320007/) |

### ACC: Accountability (2.00 raw / 25.0 scaled)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| AB1 Harm Acknowledgment | 2/5 | No GM statement acknowledging that the remedy failed was located. Acknowledgment, if it comes, will follow external establishment by NHTSA. | [auto123 2026-08-24](https://www.auto123.com/en/news/nhtsa-investigation-gm-v8-engine/74166/) |
| AB2 Correction Willingness | 2/5 | GM did recall ~597,630 vehicles, under regulatory pressure, with a minimal remedy for most. That is anchor 2 exactly. It is **not** scored at 1: GM is not obliged to expand a recall while an Engineering Analysis is open, so the absence of an expansion is not scored as documented refusal. | [auto123 2026-08-24](https://www.auto123.com/en/news/nhtsa-investigation-gm-v8-engine/74166/) |
| AB3 Transparency | 2/5 | Recall data reaches the public through the federal docket rather than GM's own reporting. Anchor 2: data shared when legally required. | [gm-trucks 2026-08-22](https://www.gm-trucks.com/nhtsa-gm-62l-v8-engine-investigation-expands/) |
| AB4 Systemic Learning | 2/5 | The same failure mode recurred after the remedy, and again in engines built after the recall cutoff. Anchor 2: post-incident review rarely translating to systemic change. | [auto123 2026-08-24](https://www.auto123.com/en/news/nhtsa-investigation-gm-v8-engine/74166/) |
| AB5 Reparative Action | 2/5 | 26 full engine replacements is real repair for a small group; most owners received an oil change and then failed again. | [Claims Journal 2026-08-24](https://www.claimsjournal.com/news/national/2026/08/24/339741.htm) |

### SYS: Systemic Thinking (2.20 raw / 30.0 scaled)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| S1 Root Cause Orientation | 2/5 | The remedy addressed a symptom (oil viscosity) rather than the suspected cause (crankshaft surface finish). Root cause is acknowledged in the technical literature, not in GM's remedy. | [auto123 2026-08-24](https://www.auto123.com/en/news/nhtsa-investigation-gm-v8-engine/74166/) |
| S2 Long-Term Impact | 2/5 | Failures continue into 2025 and 2026 model years, indicating the fix was not carried into production planning. | [gm-trucks 2026-08-22](https://www.gm-trucks.com/nhtsa-gm-62l-v8-engine-investigation-expands/) |
| S3 Interconnection Awareness | 2/5 | Supplier manufacturing controls are now the subject of federal technical evaluation; no evidence GM mapped this cross-system risk itself. | [Fuels & Lubes 2026-08-24](https://www.fuelsandlubes.com/u-s-regulator-probes-gm-engine-recall-fix-on-998000-vehicles/) |
| S4 Structural Critique | 2/5 | No public GM position located on the structures that produce under-scoped recall remedies. | [Detroit News 2026-08-21](https://www.detroitnews.com/story/business/autos/general-motors/2026/08/21/engine-failure-concerns-prompt-nhtsa-probe-of-gm-pickups-suvs/91401320007/) |
| S5 Coalitional Compassion | 3/5 | GM participates in industry safety and standards bodies with documented contributions. | [Claims Journal 2026-08-24](https://www.claimsjournal.com/news/national/2026/08/24/339741.htm) |

### INT: Integrity (2.40 raw / 35.0 scaled)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| I1 Consistency Under Pressure | 2/5 | Under cost pressure GM selected the cheapest qualifying remedy for most owners; the commitment to "fixed" was not maintained. | [auto123 2026-08-24](https://www.auto123.com/en/news/nhtsa-investigation-gm-v8-engine/74166/) |
| I2 Non-Performance | 2/5 | Safety practice largely tracks regulatory obligation; some genuine practice exists. | [gm-trucks 2026-08-22](https://www.gm-trucks.com/nhtsa-gm-62l-v8-engine-investigation-expands/) |
| I3 Internal Consistency | 3/5 | No new internal-culture evidence this window; middle anchor held. | [Claims Journal 2026-08-24](https://www.claimsjournal.com/news/national/2026/08/24/339741.htm) |
| I4 Values Alignment | 2/5 | A stated safety-first commitment sits against a remedy that left 499 owners with the same failure. Contradiction is not acknowledged. | [auto123 2026-08-24](https://www.auto123.com/en/news/nhtsa-investigation-gm-v8-engine/74166/) |
| I5 Resilience of Care | 3/5 | Recall obligations are structural and survive leadership change. | [Fuels & Lubes 2026-08-24](https://www.fuelsandlubes.com/u-s-regulator-probes-gm-engine-recall-fix-on-998000-vehicles/) |

## Published Index Comparison

**Published index:** fortune-500 | **Published rank:** #176 of 447 | **Published composite:** 40.6/100 | **Published band:** Functional

| Dimension | Published (raw) | Published (scaled) | Research (raw) | Difference (raw) |
|---|---|---|---|---|
| AWR | 2.5 | 37.5 | 2.20 | -0.30 |
| EMP | 2.5 | 37.5 | 2.40 | -0.10 |
| ACT | 3.0 | 50.0 | 2.40 | **-0.60** |
| EQU | 2.5 | 37.5 | 2.40 | -0.10 |
| BND | 3.0 | 50.0 | 2.80 | -0.20 |
| ACC | 2.5 | 37.5 | 2.00 | **-0.50** |
| SYS | 2.5 | 37.5 | 2.20 | -0.30 |
| INT | 2.5 | 37.5 | 2.40 | -0.10 |
| **Composite** | — | **40.6** | **33.7** | **-6.9** |

### Score difference analysis

**Action falls furthest, by 0.6 raw points.** The published 3.0 was carried from a rotation confirmation that recorded "recall responsiveness standards" as its evidence. That reading is no longer supportable at 3.0: the recall happened, but 499 owners had the same engine fail again afterwards, 26 of them after a complete engine replacement. AC3 (Efficacy) asks whether the help actually works. Here there is a direct federal record that it did not.

**Accountability falls by 0.5** on the same record seen from the responsibility side: no acknowledgment that the remedy failed, no self-published outcome data, and a recurrence of the identical failure mode in engines built after the recall cutoff.

**The band changes from Functional to Developing.** This is disclosed as arithmetically near-inevitable: the 2026-05-30 assessment recorded that 40.6 sat 0.6 points above the boundary, so any downward movement crosses it. The crossing is real but the boundary proximity means it should not be read as a dramatic reclassification.

### Recommendation

**Flag for review.** The conduct finding is not in doubt, but the band-crossing evidence test fails on sourcing tier: the primary record is NHTSA Engineering Analysis EA26005, a US federal docket, and `nhtsa.gov` could not be fetched (HTTP 403). Every source cited here is trade or general press reporting the docket's contents. Under the cycle rule requiring at least one tier-4-or-above source for a band crossing, this is recorded honestly as a failure. The routing follows the 2026-08-16 Microsoft AI precedent: flagged for the sourcing bar, not because the finding is disputed.

## Key Findings

- **A federal safety regulator has expanded its investigation into GM's 6.2-litre V8 engine to 997,743 vehicles.** The National Highway Traffic Safety Administration opened Engineering Analysis EA26005 on 20 August 2026.
- **The recall repair did not work for 499 owners.** Their engines failed again after the dealer fix. Twenty-six of them had already received a whole new engine.
- **Most owners got an oil change for what may be a metal defect.** Independent analyses point to "microscopic ridges on the L87's crankshaft"; 473 of the 499 complaining owners had received only an oil-viscosity change.
- **The problem did not stop when the recall did.** NHTSA logged 191 more failures in engines built after GM's 31 May 2024 recall cutoff — 690 new failure reports in total.
- **No injuries were found in any source.** The documented harm is a lost vehicle and a repair that did not hold, which is why several scores sit at 2 rather than at the bottom.

## Strongest Dimensions

Boundaries (2.80) — the only dimension still Functional. Recall notices are honest regulated disclosures and recall service creates no dependency.

## Weakest Dimensions

Accountability (2.00) — GM has not acknowledged that its remedy failed, publishes no remedy-outcome data of its own, and the same failure mode recurred in post-cutoff production.

## Evidence Gaps

- **The NHTSA docket itself could not be retrieved.** `nhtsa.gov` returned HTTP 403. All EA26005 details here come from trade and general press that consistently report the same figures. This is the reason confidence is medium and the band-crossing evidence test is recorded as failed.
- No GM statement on the expanded investigation was located.
- Sources disagree on whether the Engineering Analysis opened on 20 or 21 August 2026; the weight of reporting favours 20 August.
- No data on how many of the 997,743 owners have experienced any failure — 690 reports is a floor, not a rate.

## Recommended Next Steps

**Critical/Developing**: Consider a [Certified Assessment](/certified-assessments) for a structured improvement roadmap.

---

*This assessment is based on publicly available information and does not constitute a formal Compassion Benchmark Certified Assessment. For a comprehensive, assessor-led evaluation, visit compassionbenchmark.com/certified-assessments.*
