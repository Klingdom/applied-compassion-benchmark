---
entity: "Progressive"
type: "Company"
sector: "Insurance (personal auto, property)"
date: "2026-09-24"
composite_score: 36.9
band: "Developing"
scores:
  AWR: 2.6
  EMP: 2.4
  ACT: 2.4
  EQU: 2.4
  BND: 2.8
  ACC: 1.8
  SYS: 2.6
  INT: 2.8
published_index: "fortune-500"
published_rank: 21
published_composite: 76.3
published_band: "established"
published_dimensions:
  AWR: 4.0
  EMP: 4.0
  ACT: 4.0
  EQU: 3.0
  BND: 4.0
  ACC: 4.0
  SYS: 4.0
  INT: 3.5
assessed_composite: 36.9
score_delta: -39.4
band_change: true
filing_trigger_met: true
filing_trigger: "magnitude (-39.4) and band crossing (Established -> Developing, two bands)"
outcome: "proposal"
recommendation: "downgrade"
change_proposal: true
confidence: "medium"
subdim_sidecar: true
seed_baseline_recalibration: true
watch_flag: true
calibration_flag: "fortune-500 insurance seed plateau (Allstate 48.4; Hartford/Travelers/MetLife/Unum 60.9; Progressive 76.3; Aflac 92.4) warrants band-wide review"
source: "priority"
scan_file: "research/scans/2026-09-24.json"
integration_premium: 0
methodology_version: "v1.2"
math_hygiene_reconstruction_diff: 0
---

# Compassion Benchmark Assessment: Progressive

**Entity type:** Company
**Sector/Domain:** Insurance — personal automobile and property
**Assessment date:** 2026-09-24
**Composite score:** 36.9/100
**Band:** Developing
**Cycle:** catch-up nightly, lookback 2026-09-10 to 2026-09-24 (scan `research/scans/2026-09-24.json`, source: priority)
**Outcome:** change proposal (recommendation: downgrade)

## Why this entity was assessed

On 11 September 2026 a federal jury in the Northern District of Oklahoma returned a $40 million verdict against Progressive for breaching its duty of good faith and fair dealing in handling Mary Paulding's underinsured-motorist claim. Progressive has never been individually assessed (`last_assessed: null`).

## Evidence-date, provenance, attribution and screening checks

**EVIDENCE TIER: THIS IS A COURT FINDING, NOT AN ALLEGATION.** A jury verdict on the merits is a tier-5 adjudicated finding. It is materially firmer than the pre-trial litigation items that recent cycles correctly declined to score. The scored fact is the verdict and the trial evidence the court accepted, not the plaintiff's pleadings.

**BASELINE PROVENANCE (read first).** `research/APPLIED_CHANGES.md` has no Progressive entry. No Progressive proposal exists on disk. The published vector is `4.0 / 4.0 / 4.0 / 3.0 / 4.0 / 4.0 / 4.0 / 3.5` — six dimensions at exactly 4.0. This is an **unassessed placeholder**. This is Progressive's first evidence-based baseline.

**COMPOSITE MECHANICS MATTER HERE.** The published 76.3 is 70.3 base plus a 6.0 integration premium (standard deviation under 1.5, two dimensions below 4.0, so the weakness factor is 0.6). Canonical reconstruction returns 76.3 exactly — **no math-hygiene issue.** Because the premium depends on dimensions staying at or above 4.0, any evidence-based move below that line removes the premium as well as lowering the base. Reviewers should read the -39.4 with that in mind: 33.4 points of it is base movement and 6.0 is the premium that the base movement extinguishes.

**APPEAL STATUS.** Tulsa World reports that Progressive is seeking post-verdict relief in Tulsa federal court. Reporting indicates an appeal is expected and that post-judgment interest is accruing. **The judgment is therefore not final.** This is recorded, and it is why AB5 Reparative Action scores at the floor rather than being credited: no repair has been made.

**COUNTERVAILING EVIDENCE SOUGHT AND FOUND, AND IT IS STRONG.** Progressive ranked #19 on Fortune's 100 Best Companies to Work For 2026 — its ninth consecutive year and the highest-ranked insurer — and #1 on Forbes America's Best Employers for Company Culture 2026, from a survey of 217,000 workers. It reports performing in the 98th percentile of Gallup's engagement survey. This is independent third-party evidence and it is scored upward in B1 and I3. **The split it reveals is the finding:** Progressive treats its own staff demonstrably well and, on the court's finding, incentivised those staff to underpay policyholders.

**SCREENING RULE 3 (directionality).** Progressive surfaced on negative in-window evidence and this proposal is a downgrade. Directionality matches.

## Score Summary

| Dimension | Code | Raw (1-5) | Scaled (0-100) | Published raw | Change |
|-----------|------|-----------|----------------|---------------|--------|
| Awareness | AWR | 2.6 | 40.0 | 4.0 | -1.4 |
| Empathy | EMP | 2.4 | 35.0 | 4.0 | -1.6 |
| Action | ACT | 2.4 | 35.0 | 4.0 | -1.6 |
| Equity | EQU | 2.4 | 35.0 | 3.0 | -0.6 |
| Boundaries | BND | 2.8 | 45.0 | 4.0 | -1.2 |
| Accountability | ACC | 1.8 | 20.0 | 4.0 | -2.2 |
| Systemic Thinking | SYS | 2.6 | 40.0 | 4.0 | -1.4 |
| Integrity | INT | 2.8 | 45.0 | 3.5 | -0.7 |
| **Composite** | — | — | **36.9** | **76.3** | **-39.4** |

## Dimension Details

### AWR: Awareness (2.6 raw / 40.0 scaled)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| A1 Suffering Detection | 3/5 | Progressive runs claims and telematics data at scale and launched "Progressive Listens" for employees. But a policyholder in documented medical and financial distress was not detected across four years; the court found the company already held the records it kept demanding. Some proactive mechanisms, inconsistent. | RepairerDrivenNews, 2026-09-11 |
| A2 Contextual Sensitivity | 3/5 | Multilingual service and multiple intake channels; no evidence of differentiated claims pathways for 3+ vulnerable groups. | (company disclosure) |
| A3 Blind Spot Mitigation | 2/5 | The court found adjusters "lacked a basic understanding of how to handle Oklahoma underinsured motorist claims." A competence gap of that kind is what a blind-spot process exists to find. No such process is evidenced. | RepairerDrivenNews, 2026-09-11 |
| A4 Signal Amplification | 2/5 | A policyholder seeking $25,000 had to litigate for four years to be heard. No alternative channel for low-power claimants is evidenced. | RepairerDrivenNews, 2026-09-11 |
| A5 Anticipatory Awareness | 3/5 | Actuarial and model governance are mature. But the profit-share incentive that the court found drove underpayment shows no harm assessment was applied to a major incentive design decision. | RepairerDrivenNews, 2026-09-11 |

### EMP: Empathy (2.4 raw / 35.0 scaled)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| E1 Affective Resonance | 3/5 | Claims-satisfaction measurement and service training exist; the adjudicated case is the counter-example. Training exists, performance inconsistent. | RepairerDrivenNews, 2026-09-11 |
| E2 Perspective-Taking | 2/5 | The court found Progressive demanded medical records, wage verification and policy-limit proof it "either already possessed or didn't actually need." No structural perspective-taking process is evidenced. | RepairerDrivenNews, 2026-09-11 |
| E3 Non-Judgment | 3/5 | Employee resource groups and inclusion reporting exist; no disaggregated claims-outcome data is published. | (company disclosure) |
| E4 Validation | 1/5 | Anchor 1 exactly: harm reports met with legal review before acknowledgment. Against a $25,000 claim, the plaintiff's counsel states Progressive's response was an offer of $710, and the dispute went to trial. | RepairerDrivenNews, 2026-09-11 |
| E5 Cultural Empathy | 3/5 | Bilingual service and community programs; adaptation is at the marketing and access layer. | (company disclosure) |

### ACT: Action (2.4 raw / 35.0 scaled)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| AC1 Responsiveness | 2/5 | The court ruled the investigation was "unnecessarily delayed" and that the company "lacked justification for withholding payment." Standards exist but were not met. | RepairerDrivenNews, 2026-09-11 |
| AC2 Proportionality | 2/5 | Trial evidence showed adjusters "were incentivized through a company-wide profit share program to reduce loss payouts and claim costs." Resources drive the response, not need. | RepairerDrivenNews, 2026-09-11 |
| AC3 Efficacy | 3/5 | Cycle-time and claims metrics are tracked and reported in the corporate sustainability report; no evidence of a program changed on harm outcomes. | (company disclosure) |
| AC4 Resource Mobilization | 3/5 | Progressive is strongly capitalised and pays claims at very large scale; allocation follows historical and margin patterns rather than a published need analysis. | (company disclosure) |
| AC5 Follow-Through | 2/5 | Engagement with this claimant extended for four years as litigation, not as help. Follow-up is not systematic. | RepairerDrivenNews, 2026-09-11 |

### EQU: Equity (2.4 raw / 35.0 scaled)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| EQ1 Universality | 3/5 | Progressive's non-standard auto book genuinely insures higher-risk drivers other carriers decline — a real access strength. Coverage data by population is not published. | (company disclosure) |
| EQ2 Priority for Vulnerable | 2/5 | A profit-share incentive to reduce loss payouts is the opposite of prioritising highest need under constraint. | RepairerDrivenNews, 2026-09-11 |
| EQ3 Bias Awareness | 2/5 | No disaggregated claims-outcome data located; long-standing consumer-advocacy critique of insurance credit scoring is unaddressed in disclosure. | (evidence gap) |
| EQ4 Access Design | 3/5 | Digital quoting, "Name Your Price" and low-premium tiers remove real cost and complexity barriers. | (company disclosure) |
| EQ5 Historical Harm Acknowledgment | 2/5 | No acknowledgment located of historical auto-insurance pricing harms in redlined areas. Vague values language only. | (evidence gap) |

### BND: Boundaries (2.8 raw / 45.0 scaled)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| B1 Self-Sustainability | 4/5 | Independently recognised: #19 on Fortune's 100 Best Companies to Work For 2026 for a ninth consecutive year, highest-ranked insurer; 98th-percentile Gallup engagement. Structures exist and are used. | Progressive/Fortune, 2026-04-01 |
| B2 Autonomy Preservation | 3/5 | Indemnity restores capacity by design; no autonomy outcome measurement published. | (company disclosure) |
| B3 Scope Clarity | 2/5 | A policyholder who bought underinsured-motorist cover discovered its practical limits only after a claim, and was asked for proof the court found unnecessary. Limitations discovered after investment. | RepairerDrivenNews, 2026-09-11 |
| B4 Refusal Ethics | 2/5 | A $710 response to a $25,000 claim, with no accepted justification, is a refusal without a concrete alternative. Generally respectful process, no structured alternative. | RepairerDrivenNews, 2026-09-11 |
| B5 Consent Orientation | 3/5 | Policy documents are state-regulated and disclosure requirements are met; forms are designed primarily to protect the institution. | (company disclosure) |

### ACC: Accountability (1.8 raw / 20.0 scaled)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| AB1 Harm Acknowledgment | 1/5 | Progressive contested the claim through trial and is seeking post-verdict relief. No acknowledgment of harm is located at any point. | RepairerDrivenNews, 2026-09-11; Tulsa World |
| AB2 Correction Willingness | 2/5 | No change to the profit-share incentive structure the court identified has been announced. Correction, if any, will follow external pressure. | RepairerDrivenNews, 2026-09-11 |
| AB3 Transparency | 3/5 | Progressive publishes an annual corporate sustainability report using SASB and TCFD material topics, and discloses litigation in its 10-K. At least one report discloses unflattering findings. | Progressive investor relations |
| AB4 Systemic Learning | 2/5 | The court's finding was about company-wide adjuster training and incentives, not one adjuster. No systemic-learning process addressing prior bad-faith findings is evidenced. | RepairerDrivenNews, 2026-09-11 |
| AB5 Reparative Action | 1/5 | No repair beyond a contested court judgment now under post-verdict challenge. Anchor 1. | Tulsa World |

### SYS: Systemic Thinking (2.6 raw / 40.0 scaled)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| S1 Root Cause Orientation | 3/5 | Telematics-based safe-driving programs address crash risk upstream, which is genuine root-cause work in this sector. | (company disclosure) |
| S2 Long-Term Impact | 3/5 | Multi-year capital and climate planning, including a carbon-neutrality goal for Scope 1 and 2 by end-2025. Long-term goals with some tracking. | Progressive investor relations |
| S3 Interconnection Awareness | 2/5 | Parts and repair-network practices have measurable effects on collision repairers; no systematic tracking of those second-order effects is evidenced. | (evidence gap) |
| S4 Structural Critique | 2/5 | No public position located that questions the rating and scoring structures on which its own model rests. | (evidence gap) |
| S5 Coalitional Compassion | 3/5 | Active industry-safety coalition participation and the Keys to Progress vehicle-donation program with documented contributions. | (company disclosure) |

### INT: Integrity (2.8 raw / 45.0 scaled)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| I1 Consistency Under Pressure | 2/5 | When the cost was $25,000, Progressive litigated for four years. Cost pressure produced unacknowledged compromise. | RepairerDrivenNews, 2026-09-11 |
| I2 Non-Performance | 3/5 | The Gallup survey and employee-listening program are acted on internally, away from public view. Some practices maintained regardless of visibility. | Progressive/Fortune, 2026-04-01 |
| I3 Internal Consistency | 4/5 | Staff culture broadly reflects stated values, independently corroborated: #1 on Forbes America's Best Employers for Company Culture 2026 from 217,000 worker responses. | Forbes/PR Newswire, 2026-04-21 |
| I4 Values Alignment | 2/5 | The court's central observation — that "policyholders are not simply a means to collect premiums and increase corporate profit" — describes a decision pattern contradicting stated values, unacknowledged. | RepairerDrivenNews, 2026-09-11 |
| I5 Resilience of Care | 3/5 | Core practices are in policy and have survived chief-executive transition. | (company disclosure) |

## Published Index Comparison

**Published index:** fortune-500 | **Published rank:** #21 of 447 | **Published composite:** 76.3/100 | **Published band:** Established

| Dimension | Published (raw) | Published (scaled) | Research | Difference | Explanation |
|---|---|---|---|---|---|
| AWR | 4.0 | 75.0 | 40.0 | -35.0 | A3 and A4 at 2/5: the court found a company-wide adjuster competence gap that no internal process caught. |
| EMP | 4.0 | 75.0 | 35.0 | -40.0 | E4 at 1/5: legal contest preceded any acknowledgment; $710 offered against $25,000. |
| ACT | 4.0 | 75.0 | 35.0 | -40.0 | AC1 and AC2 at 2/5 on the court's delay finding and the profit-share incentive. |
| EQU | 3.0 | 50.0 | 35.0 | -15.0 | EQ2 and EQ3 at 2/5; partly offset by genuine non-standard-market access at EQ1. |
| BND | 4.0 | 75.0 | 45.0 | -30.0 | B1 held at 4/5 on independent employer recognition; B3 and B4 at 2/5 on the claim handling. |
| ACC | 4.0 | 75.0 | 20.0 | -55.0 | Largest change. AB1 and AB5 at the floor: no acknowledgment, no repair, post-verdict relief sought. |
| SYS | 4.0 | 75.0 | 40.0 | -35.0 | S3 and S4 at 2/5; no structural critique of the entity's own rating model located. |
| INT | 3.5 | 62.5 | 45.0 | -17.5 | Smallest proportional change: I3 at 4/5 on independent culture recognition offsets I1 and I4 at 2/5. |
| **Composite** | — | **76.3** | **36.9** | **-39.4** | Two-band crossing: Established to Developing. |

### Score Difference Analysis

Two things drive this. The first is the verdict, and it is not a one-off. The trial evidence the court accepted was about company structure: adjuster training across a state's UIM book, and a company-wide profit-share program that paid staff to reduce loss payouts. That is an Accountability and Action finding, and it puts ACC at 1.8 — the single largest movement in the vector.

The second is de-seeding. The published 4.0s asserted anchor-4 behaviour — published response data, acknowledgment structurally prior to investigation, annual reports including failures and corrective actions. No evidence for those assertions was located. Under the methodology's rule that absent evidence defaults to the lower anchor, those dimensions fall even before the verdict is considered.

**Peer calibration check.** Among insurers already assessed with evidence, State Farm sits at 13.8 and Cigna at 20.3, Centene at 32.8 and Humana at 35.2. Progressive at 36.9 sits above all of them, which is right: its documented adverse record is one major verdict, not a pattern of the UnitedHealth or State Farm kind, and its employer evidence is genuinely strong. The published 76.3 sat above Hartford, Travelers and MetLife (all 60.9) on no evidence at all.

**Calibration flag, not a proposal.** Allstate (48.4), Hartford, Travelers, MetLife and Unum (all 60.9) and Aflac (92.4) all sit on unassessed uniform plateaus in the same sector. That pattern is a band-wide calibration question for coordinator review. It is recorded here as a flag and is **not** used as a reason to move Progressive.

### Recommendation

The published score is **substantially overstated**. Propose 36.9, Developing. Confidence medium: the verdict is tier-5 and unambiguous, but it is under post-verdict challenge, and a large share of the movement is placeholder replacement rather than measured deterioration.

## Key Findings

- Why it matters: a federal jury has now found that Progressive handled a customer's claim in bad faith. On 11 September 2026 it awarded Mary Paulding $20 million in compensatory and $20 million in punitive damages.
- Why it matters: the claim was small and the offer was smaller. She asked her own insurer for $25,000 after an underinsured driver hit her in August 2022. Her lawyer says the response was $710.
- Why it matters: the court found this was about how the company is built, not one bad adjuster. Trial evidence showed staff were paid through a profit-share program to cut claim payouts.
- Why it matters: Progressive is a genuinely good employer and that makes the gap sharper. It was #1 on Forbes America's Best Employers for Company Culture 2026, from 217,000 worker responses.
- Why it matters: no repair has been made. Progressive is seeking post-verdict relief, so the $40 million has not been paid.

## Strongest Dimensions

Boundaries (raw 2.8) and Integrity (raw 2.8), both held up by independently verified staff-culture evidence rather than by policyholder-facing practice.

## Weakest Dimensions

Accountability (raw 1.8). No acknowledgment of harm, no announced correction to the incentive the court identified, and no repair.

## Evidence Gaps

- Progressive's 2025 corporate sustainability report was not retrieved in full. AB3, AC3 and S2 are scored on the report's existence and structure, which may understate them.
- No NAIC complaint-ratio series was retrieved for this cycle.
- The judgment is not final. A successful appeal would be material to AB1, AB5 and I4 and should trigger reassessment.

## Recommended Next Steps

**Developing** band: consider a [Certified Assessment](/certified-assessments) for a structured improvement roadmap.

## Sources

- Repairer Driven News — 2026-09-11 — tier 2 reporting a tier-5 court finding — https://www.repairerdrivennews.com/2026/09/11/policyholders-win-40-million-suit-against-progressive/
- Tulsa World (post-verdict relief sought; headline-level only, body not retrieved) — tier 2 — https://tulsaworld.com/news/local/crime-courts/article_aa82fe8d-d3aa-4842-8811-6e8b7e776e4d.html
- Progressive newsroom, Fortune 100 Best Companies to Work For 2026 (#19) — 2026-04-01 — tier 2 — https://progressive.mediaroom.com/2026-04-01-Progressive-Insurance-R-Ranks-19-on-Fortune-100-Best-Companies-to-Work-For-R-2026-List
- PR Newswire, Forbes America's Best Employers for Company Culture 2026 (#1) — 2026-04-21 — tier 2 — https://www.prnewswire.com/news-releases/progressive-insurance-ranks-no-1-on-forbes-americas-best-employers-for-company-culture-2026-list-302748944.html
- Progressive investor relations, sustainability reports — tier 3 — https://investors.progressive.com/sustainability/sustainability-report/default.aspx

---

*This assessment is based on publicly available information and does not constitute a formal Compassion Benchmark Certified Assessment. For a comprehensive, assessor-led evaluation, visit compassionbenchmark.com/certified-assessments.*
