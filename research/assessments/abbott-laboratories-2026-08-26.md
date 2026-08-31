---
entity: "Abbott Laboratories"
type: "Company"
sector: "Medical Devices / Pharmaceuticals / Nutrition"
date: "2026-08-26"
composite_score: 50.0
band: "Functional"
scores:
  AWR: 3.2
  EMP: 2.8
  ACT: 3.4
  EQU: 2.8
  BND: 2.8
  ACC: 2.6
  SYS: 3.6
  INT: 2.8
published_index: "fortune-500"
published_rank: 60
published_composite: 57.8
published_band: "functional"
published_dimensions:
  AWR: 3.5
  EMP: 3.3
  ACT: 3.5
  EQU: 3.0
  BND: 3.3
  ACC: 3.0
  SYS: 3.8
  INT: 3.3
assessed_composite: 50.0
score_delta: -7.8
band_change: false
recommendation: "downgrade"
change_proposal: true
confidence: "medium"
subdim_sidecar: true
source: "priority"
scan_file: "research/scans/2026-08-26.json"
---

# Compassion Benchmark Assessment: Abbott Laboratories

**Entity type:** Company
**Sector/Domain:** Medical Devices / Pharmaceuticals / Nutrition
**Assessment date:** 2026-08-26
**Composite score:** 50.0/100
**Band:** Functional
**Cycle source:** priority (scan `research/scans/2026-08-26.json`)

> This assessment is based on publicly available information and does not constitute a formal Compassion Benchmark Certified Assessment. For a comprehensive, assessor-led evaluation, visit compassionbenchmark.com/certified-assessments.

## Why this entity was assessed

The scanner flagged Abbott on a $670 million settlement of roughly 2,000 lawsuits alleging its preterm-infant formula concealed the risk of necrotizing enterocolitis. Abbott was last assessed on 2026-04-20.

## Evidence-date and attribution checks

**Date: RESOLVED IN FAVOUR OF THE SCANNER.** The scan recorded `evidence_date` 2026-08-20 against two URLs dated 2026-08-21. Bloomberg's URL carries 2026-08-20 and the Claims Journal report describes "Thursday's settlement". **20 August 2026 was a Thursday.** The settlement was reached on Thursday 20 August 2026; the 21 August URLs are next-day wire pickups. The scanner's `evidence_date` is correct as the event date. No year confusion; both URLs are explicit 2026.

**THIS IS A SETTLEMENT, NOT AN ADMISSION — AND THAT CUTS BOTH WAYS.** Claims Journal states verbatim: "Abbott did not admit liability in Thursday's settlement, saying it remains confident in the safety of its infant formula products." Nothing here treats the $670 million as proof that Abbott's formula caused necrotizing enterocolitis. Two separate facts are scored:

1. **Adverse and new:** Abbott dropped its appeal *after a Missouri appeals court upheld the $495 million verdict in May 2026*. That converts what was, at the April baseline, a contested trial-court verdict into a **final civil judgment on a failure-to-warn theory**. The evidentiary weight of the underlying harm finding has genuinely increased since April.
2. **Favourable and new:** Abbott actually paid, and stopped fighting. At the April baseline the record was pure denial. Paying $670 million and abandoning an appeal is a real course correction, and it is scored upward at AB2 (Correction Willingness), from the denial-only picture April recorded.

**Not double-counted.** The April 2026 baseline already priced the NEC litigation, the original $495 million verdict, the $70 million Cook County verdict, the 2022 Sturgis recall and Abbott's denial pattern. Those facts are **not** re-scored here as if new. Only the four developments since April move anything: the appellate affirmance, the dropped appeal, the $670 million payment, and the disclosed remaining exposure of about 1,700 suits covering up to 12,700 infants.

## Score Summary

| Dimension | Code | Raw (1-5) | Scaled (0-100) | Band |
|---|---|---|---|---|
| Awareness | AWR | 3.20 | 55.0 | Functional |
| Empathy | EMP | 2.80 | 45.0 | Functional |
| Action | ACT | 3.40 | 60.0 | Functional |
| Equity | EQU | 2.80 | 45.0 | Functional |
| Boundaries | BND | 2.80 | 45.0 | Functional |
| Accountability | ACC | 2.60 | 40.0 | Developing |
| Systemic Thinking | SYS | 3.60 | 65.0 | Established |
| Integrity | INT | 2.80 | 45.0 | Functional |
| **Composite** | — | — | **50.0** | **Functional** |

Integration premium: 0.0 (all eight dimensions below 4.0).

## Dimension Details

### AWR: Awareness (3.20 raw / 55.0 scaled)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| A1 Suffering Detection | 4/5 | Abbott operates FDA-regulated adverse-event and complaint systems across a large device, diagnostics and nutrition portfolio, with formal pathways and regular review. The 2022 consent decree added mandated environmental monitoring and contamination notification. | [DOJ 2022-05-16](https://www.justice.gov/Usao-wdmi/pr/2022_0516_Abbott) |
| A2 Contextual Sensitivity | 3/5 | Preterm infants are served by a dedicated hospital-channel product line separate from retail formula — genuine differentiation. Gaps remain: NEC has "an estimated mortality rate of more than 20%" in exactly this population. | [Claims Journal 2026-08-21](https://www.claimsjournal.com/news/national/2026/08/21/339713.htm) |
| A3 Blind Spot Mitigation | 3/5 | The 2022 consent decree required Abbott to retain an independent expert to review Sturgis operations — a process that has produced findings. Court-compelled rather than self-initiated. | [FDA testimony 2022-05-26](https://www.fda.gov/media/158736/download) |
| A4 Signal Amplification | 3/5 | Parents' NEC concerns reached Abbott primarily through litigation rather than an internal low-power channel; some formal complaint pathways exist. | [Quartz 2026-08-21](https://qz.com/abbott-670-million-settlement-preterm-baby-formula-lawsuits-082126) |
| A5 Anticipatory Awareness | 3/5 | Abbott runs formal pre-market risk assessment under FDA regulation. But a now-final failure-to-warn judgment indicates that assessment did not translate into a warning for this product line. Anchor 3 held rather than dropped: the structure exists and functions across most of the portfolio. | [Claims Journal 2026-08-21](https://www.claimsjournal.com/news/national/2026/08/21/339713.htm) |

### EMP: Empathy (2.80 raw / 45.0 scaled)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| E1 Affective Resonance | 3/5 | No independent testimony located either way; Abbott maintains patient-support programmes. Mixed, scored at the middle anchor. | [Quartz 2026-08-21](https://qz.com/abbott-670-million-settlement-preterm-baby-formula-lawsuits-082126) |
| E2 Perspective-Taking | 3/5 | Settlement terms were negotiated with three plaintiffs' firms, which is a formal mechanism that modified Abbott's position. Not co-design. | [Bloomberg 2026-08-20](https://www.bloomberg.com/news/articles/2026-08-20/abbott-will-pay-670-million-to-end-2-000-infant-formula-claims) |
| E3 Non-Judgment | 3/5 | No evidence of differential treatment by identity; no disaggregated outcome data published either. | [Claims Journal 2026-08-21](https://www.claimsjournal.com/news/national/2026/08/21/339713.htm) |
| E4 Validation | 2/5 | **Down.** On the day it agreed to pay $670 million, Abbott stated it "remains confident in the safety of its infant formula products." Harm reports are met with legal contestation, then payment without validation. | [Claims Journal 2026-08-21](https://www.claimsjournal.com/news/national/2026/08/21/339713.htm) |
| E5 Cultural Empathy | 3/5 | Abbott operates global nutrition programmes with local adaptation; no evidence of core practice change driven by non-dominant cultural knowledge. | [Quartz 2026-08-21](https://qz.com/abbott-670-million-settlement-preterm-baby-formula-lawsuits-082126) |

### ACT: Action (3.40 raw / 60.0 scaled)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| AC1 Responsiveness | 4/5 | Recall and field-action standards are published and regulator-supervised, with documented response timelines under the consent decree. | [DOJ 2022-05-16](https://www.justice.gov/Usao-wdmi/pr/2022_0516_Abbott) |
| AC2 Proportionality | 3/5 | The $670 million resolves the roughly 2,000 claims that were furthest advanced; about 1,700 suits covering up to 12,700 infants remain unaddressed. Needs assessment informs response, but resources drive scope. | [Bloomberg 2026-08-20](https://www.bloomberg.com/news/articles/2026-08-20/abbott-will-pay-670-million-to-end-2-000-infant-formula-claims) |
| AC3 Efficacy | 3/5 | Post-2022 sanitation, environmental-monitoring and training programmes have outcome requirements written into the decree and are reviewed. | [FDA testimony 2022-05-26](https://www.fda.gov/media/158736/download) |
| AC4 Resource Mobilization | 4/5 | Substantial resources were mobilized: $670 million plus an abandoned appeal on a verdict Abbott says interest would have grown to about $600 million. Annual review against need is documented for the regulated operations. | [Bloomberg 2026-08-20](https://www.bloomberg.com/news/articles/2026-08-20/abbott-will-pay-670-million-to-end-2-000-infant-formula-claims) |
| AC5 Follow-Through | 3/5 | Abbott has stayed engaged through a multi-year litigation and remediation cycle; no longitudinal outcome data for affected families published. | [Quartz 2026-08-21](https://qz.com/abbott-670-million-settlement-preterm-baby-formula-lawsuits-082126) |

### EQU: Equity (2.80 raw / 45.0 scaled)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| EQ1 Universality | 3/5 | Broad global product access with some coverage data; no disaggregated coverage reporting located. | [Quartz 2026-08-21](https://qz.com/abbott-670-million-settlement-preterm-baby-formula-lawsuits-082126) |
| EQ2 Priority for Vulnerable | 3/5 | Preterm infants are the most vulnerable population Abbott serves, and it maintains a dedicated hospital product line for them; prioritization under scarcity is not independently verified. | [Claims Journal 2026-08-21](https://www.claimsjournal.com/news/national/2026/08/21/339713.htm) |
| EQ3 Bias Awareness | 3/5 | Some disaggregation exists in Abbott's public reporting; no investigation of disparities in NEC outcomes located. | [Bloomberg 2026-08-20](https://www.bloomberg.com/news/articles/2026-08-20/abbott-will-pay-670-million-to-end-2-000-infant-formula-claims) |
| EQ4 Access Design | 3/5 | Hospital-channel distribution and global access programmes remove real barriers; no co-design evidence. | [Quartz 2026-08-21](https://qz.com/abbott-670-million-settlement-preterm-baby-formula-lawsuits-082126) |
| EQ5 Historical Harm Acknowledgment | 2/5 | **Held down.** Abbott has now paid $670 million and abandoned an appeal, but has acknowledged no historical harm — it reaffirms product safety. Anchor 2: vague acknowledgment only. | [Claims Journal 2026-08-21](https://www.claimsjournal.com/news/national/2026/08/21/339713.htm) |

### BND: Boundaries (2.80 raw / 45.0 scaled)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| B1 Self-Sustainability | 3/5 | No new workforce-sustainability evidence this window; prior whistleblower litigation noted at the April baseline. Middle anchor held. | [Quartz 2026-08-21](https://qz.com/abbott-670-million-settlement-preterm-baby-formula-lawsuits-082126) |
| B2 Autonomy Preservation | 3/5 | Nutrition products are designed for clinician-directed use with defined exit; no autonomy outcome measurement published. | [Bloomberg 2026-08-20](https://www.bloomberg.com/news/articles/2026-08-20/abbott-will-pay-670-million-to-end-2-000-infant-formula-claims) |
| B3 Scope Clarity | 3/5 | Abbott communicates product indications through regulated labelling; the dispute is about a specific omitted risk, not about general scope overstatement. | [Claims Journal 2026-08-21](https://www.claimsjournal.com/news/national/2026/08/21/339713.htm) |
| B4 Refusal Ethics | 3/5 | Standard regulated referral practice; no adverse evidence located. | [Quartz 2026-08-21](https://qz.com/abbott-670-million-settlement-preterm-baby-formula-lawsuits-082126) |
| B5 Consent Orientation | 2/5 | **Down.** A now-final failure-to-warn judgment, plus a separate $70 million April 2026 verdict, indicate parents of preterm infants were not given the risk information a genuinely informed consent requires. This is the subdimension most directly on point. | [Chicago Sun-Times 2026-04-10](https://chicago.suntimes.com/2026/04/10/abbott-laboratories-to-pay-70m-in-damages-infant-formula-lawsuits) |

### ACC: Accountability (2.60 raw / 40.0 scaled)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| AB1 Harm Acknowledgment | 2/5 | Abbott "did not admit liability … saying it remains confident in the safety of its infant formula products." Acknowledgment has not followed even external establishment by an appellate court. | [Claims Journal 2026-08-21](https://www.claimsjournal.com/news/national/2026/08/21/339713.htm) |
| AB2 Correction Willingness | 3/5 | **UP — this is the favourable half of the new evidence.** Abbott dropped its appeal and settled: "Abbott said interest on the 2024 verdict would have entitled the plaintiff to about $600 million, and the company chose to reach a settlement." That is one significant course correction based on harm evidence. | [Claims Journal 2026-08-21](https://www.claimsjournal.com/news/national/2026/08/21/339713.htm) |
| AB3 Transparency | 3/5 | Abbott discloses litigation exposure, including the remaining ~1,700 suits and up to 12,700 claimants — an unflattering disclosure. | [DOJ 2022-05-16](https://www.justice.gov/Usao-wdmi/pr/2022_0516_Abbott) |
| AB4 Systemic Learning | 3/5 | The 2022 consent decree produced documented systemic changes: sanitation plan, environmental monitoring, employee training, root-cause investigation before resuming production. Externally compelled. | [FDA testimony 2022-05-26](https://www.fda.gov/media/158736/download) |
| AB5 Reparative Action | 2/5 | $670 million to roughly 2,000 claimants exceeds a minimal legal settlement, but it was court-driven, not co-designed with harmed families, and no claimant testimony describing it as adequate was located. | [Bloomberg 2026-08-20](https://www.bloomberg.com/news/articles/2026-08-20/abbott-will-pay-670-million-to-end-2-000-infant-formula-claims) |

### SYS: Systemic Thinking (3.60 raw / 65.0 scaled)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| S1 Root Cause Orientation | 4/5 | The consent decree required root-cause investigation as a precondition of resuming production, and Abbott implemented it. | [FDA testimony 2022-05-26](https://www.fda.gov/media/158736/download) |
| S2 Long-Term Impact | 4/5 | Permanent-injunction compliance obligations create a multi-year horizon with independent expert review. | [DOJ 2022-05-16](https://www.justice.gov/Usao-wdmi/pr/2022_0516_Abbott) |
| S3 Interconnection Awareness | 3/5 | Abbott's 2022 plant shutdown triggered a national formula shortage — a second-order effect it identified and responded to, but did not anticipate. | [Bloomberg 2026-08-20](https://www.bloomberg.com/news/articles/2026-08-20/abbott-will-pay-670-million-to-end-2-000-infant-formula-claims) |
| S4 Structural Critique | 3/5 | Abbott participates in public-health policy debate; no position located that runs against its short-term interest. | [Quartz 2026-08-21](https://qz.com/abbott-670-million-settlement-preterm-baby-formula-lawsuits-082126) |
| S5 Coalitional Compassion | 4/5 | Documented joint work with FDA, CDC and hospital systems on formula supply and safety, with resource sharing. | [FDA testimony 2022-05-26](https://www.fda.gov/media/158736/download) |

### INT: Integrity (2.80 raw / 45.0 scaled)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| I1 Consistency Under Pressure | 3/5 | Abbott bore a real cost — $670 million and an abandoned appeal — rather than litigate to exhaustion. One case of bearing cost. | [Claims Journal 2026-08-21](https://www.claimsjournal.com/news/national/2026/08/21/339713.htm) |
| I2 Non-Performance | 3/5 | Some safety practices are maintained regardless of visibility under the consent decree; the litigation posture is reputationally managed. | [Quartz 2026-08-21](https://qz.com/abbott-670-million-settlement-preterm-baby-formula-lawsuits-082126) |
| I3 Internal Consistency | 3/5 | No new internal-culture evidence this window. Middle anchor held. | [Bloomberg 2026-08-20](https://www.bloomberg.com/news/articles/2026-08-20/abbott-will-pay-670-million-to-end-2-000-infant-formula-claims) |
| I4 Values Alignment | 2/5 | **Down.** Abbott paid $670 million and dropped an appeal of an affirmed verdict while publicly reaffirming that the product is safe. The decision and the stated value are not reconciled anywhere in the public record. | [Claims Journal 2026-08-21](https://www.claimsjournal.com/news/national/2026/08/21/339713.htm) |
| I5 Resilience of Care | 3/5 | Consent-decree obligations are structural and survive leadership change; not independently assessed as sustained. | [DOJ 2022-05-16](https://www.justice.gov/Usao-wdmi/pr/2022_0516_Abbott) |

## Published Index Comparison

**Published index:** fortune-500 | **Published rank:** #60 of 447 | **Published composite:** 57.8/100 | **Published band:** Functional

| Dimension | Published (raw) | Published (scaled) | Research (raw) | Difference (raw) |
|---|---|---|---|---|
| AWR | 3.5 | 62.5 | 3.20 | -0.30 |
| EMP | 3.3 | 57.5 | 2.80 | -0.50 |
| ACT | 3.5 | 62.5 | 3.40 | -0.10 |
| EQU | 3.0 | 50.0 | 2.80 | -0.20 |
| BND | 3.3 | 57.5 | 2.80 | -0.50 |
| ACC | 3.0 | 50.0 | 2.60 | -0.40 |
| SYS | 3.8 | 70.0 | 3.60 | -0.20 |
| INT | 3.3 | 57.5 | 2.80 | -0.50 |
| **Composite** | — | **57.8** | **50.0** | **-7.8** |

### Score difference analysis

Three dimensions fall by half a raw point: Empathy, Boundaries and Integrity.

**Boundaries** falls because B5 (Consent Orientation) is the subdimension the failure-to-warn judgment lands on most directly. Parents of premature infants were not given a risk disclosure a court has now finally held was owed. At the April baseline that judgment was on appeal; it is now final because Abbott stopped appealing it.

**Empathy** and **Integrity** fall on the same fact from different angles. E4 (Validation) drops because Abbott's response to harm reports is legal contestation followed by payment without validation. I4 (Values Alignment) drops because paying $670 million while reaffirming product safety is a decision Abbott has not reconciled with its stated values in any public document.

**Accountability** falls by 0.4 despite one subdimension rising. AB2 (Correction Willingness) goes **up** to 3 — Abbott genuinely corrected course. That is offset by AB1 and AB5 sitting at 2 for continued non-acknowledgment and court-driven rather than co-designed repair.

**No band change.** Abbott remains Functional at both the published and assessed values.

### Recommendation

**Downgrade.** The published 57.8 is overstated by about 8 points against evidence available since April 2026. A change proposal is filed under the magnitude trigger. Confidence: medium — the strongest single fact (appellate affirmance, May 2026) is reported by trade press rather than obtained from the court record directly.

## Key Findings

- **Abbott will pay $670 million to settle about 2,000 lawsuits over its formula for premature babies.** The deal was reached on 20 August 2026. Abbott admitted no wrongdoing.
- **Abbott also gave up its appeal of a $495 million verdict.** A Missouri appeals court upheld that verdict in May 2026. Dropping the appeal makes the failure-to-warn finding final.
- **The disease at issue kills more than one in five babies who get it.** Necrotizing enterocolitis destroys bowel tissue and mostly strikes premature newborns.
- **About 1,700 more lawsuits remain, covering up to 12,700 infants.** The August settlement resolves roughly a tenth of the claimants.
- **One part of Abbott's score went up.** Paying and dropping the appeal is a genuine course correction after a period of pure denial, and Correction Willingness rose from the denial-only picture recorded in April. The overall score still falls 7.8 points, to 50.0 out of 100.

## Strongest Dimensions

Systemic Thinking (3.60) — root-cause investigation, permanent-injunction compliance and joint work with FDA and CDC. This is the one dimension still in the Established range.

## Weakest Dimensions

Accountability (2.60, Developing) — Abbott has now twice paid large sums without acknowledging harm. Empathy, Boundaries and Integrity all sit at 2.80.

## Evidence Gaps

- The Missouri Court of Appeals opinion affirming the $495 million verdict was not obtained directly; the affirmance is reported by trade press.
- Abbott's own statement on the settlement was located only as quoted by third parties, not in a company release.
- No claimant testimony on whether the $670 million is considered adequate repair. This caps AB5 at 2.
- No independent audit of Sturgis quality improvements since 2022 was located — a gap flagged at the April 2026 baseline and still open.

## Recommended Next Steps

**Functional/Established**: Consider [Advisory Support](/advisory) to translate benchmark insights into strategic action.

---

*This assessment is based on publicly available information and does not constitute a formal Compassion Benchmark Certified Assessment. For a comprehensive, assessor-led evaluation, visit compassionbenchmark.com/certified-assessments.*
