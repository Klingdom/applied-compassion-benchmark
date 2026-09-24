---
entity: "West Virginia"
type: "State"
sector: "Government (US state)"
date: "2026-09-24"
composite_score: 36.9
band: "Developing"
scores:
  AWR: 2.6
  EMP: 2.0
  ACT: 2.6
  EQU: 2.4
  BND: 2.4
  ACC: 2.8
  SYS: 2.8
  INT: 2.2
published_index: "us-states"
published_rank: 43
published_composite: 35.6
published_band: "developing"
published_dimensions:
  AWR: 2.6
  EMP: 2.0
  ACT: 2.6
  EQU: 2.4
  BND: 2.4
  ACC: 2.4
  SYS: 2.8
  INT: 2.2
assessed_composite: 36.9
score_delta: 1.3
band_change: false
filing_trigger_met: false
outcome: "confirmation"
recommendation: "confirm"
change_proposal: false
confidence: "medium"
subdim_sidecar: true
subdim_sidecar_coverage: "ACC only (the one dimension re-scored in full); the other seven dimensions are carried unchanged from the 2026-07-19 sidecar and are deliberately omitted"
assessment_type: "targeted re-assessment"
watch_flag: true
source: "priority"
scan_file: "research/scans/2026-09-24.json"
integration_premium: 0
methodology_version: "v1.2"
math_hygiene_reconstruction_diff: 0
---

# Compassion Benchmark Assessment: West Virginia (Confirmation)

**Entity type:** State
**Sector/Domain:** Government (US state jurisdiction)
**Assessment date:** 2026-09-24
**Composite score:** 36.9/100
**Band:** Developing
**Cycle:** catch-up nightly, lookback 2026-09-10 to 2026-09-24 (scan `research/scans/2026-09-24.json`, source: priority)
**Outcome:** confirmation (recommendation: confirm). Measured 36.9 against published 35.6, a difference of +1.3. No band change. **No filing trigger met.**

## Why this entity was assessed

Two in-window items. The West Virginia Department of Human Services Bureau for Social Services published its Child Fatalities and Near Fatalities Annual Report for federal fiscal year 2025 on 21 September 2026. Governor Patrick Morrisey requested a federal Major Disaster Declaration for three counties on 13-14 September 2026.

## Evidence-date, provenance, attribution and screening checks

**THE TWO ITEMS ARE SEPARATED, AS THEY MUST BE.**

**Item 1 — the child fatality data is NOT in-window conduct.** The report covers federal fiscal year 2025, which ended 30 September 2025. Twelve children died from abuse or neglect and eleven more survived life-threatening injuries during that year. **Those deaths are outside this cycle's window and are not scored as in-window conduct.** They are also not new information about the state's performance in the way a fresh incident would be.

**What IS in-window about item 1 is the act of publishing it.** On 21 September 2026 the state's own agency disclosed, in a structured annual report, that its child protection system failed twelve children. It disclosed the pattern too: more than 80% of victims were under five, infants accounted for more than half the cases, substance abuse was implicated in 52% of incidents, 83% of affected families had prior Child Protective Services involvement, 48% involved families "with a prior history of substantiated maltreatment, while 17% had five or more prior referrals," and "unsafe sleeping environments, drug overdoses and non-accidental physical trauma were among the leading causes." It also named corrective actions: implementation of the Safety Assessment and Family Evaluation (SAFE) model and a partnership with the Restore Hope Initiative for community-based prevention. Self-disclosure of failure with named corrective action is exactly what the Accountability dimension is built to detect.

**Item 2 — the disaster declaration request IS in-window conduct.** On 13-14 September 2026 the Governor requested a federal Major Disaster Declaration for Harrison, Fayette and Kanawha counties following floods and severe storms of 14-18 August 2026, seeking individual assistance for the three counties and Hazard Mitigation Grant Program assistance statewide. Joint preliminary damage assessments identified 624 affected residences: 22 destroyed, 60 with major damage, 261 with minor damage and 281 otherwise affected.

**BASELINE PROVENANCE (read first).** The published 35.6 was set by the **2026-07-19 first-baseline assessment**, a full 40-subdimension evidence-based measurement with a sidecar on disk. It is nine weeks old and is not a seed. `research/APPLIED_CHANGES.md` has no West Virginia entry, meaning the 35.6 has never been revised. No stale-baseline argument is available or used here.

**ATTRIBUTION: CLEAN ON BOTH ITEMS.** Child protection is a state function delivered by a state agency. Requesting a federal declaration is an act of the state governor. Both are West Virginia's own conduct.

## Targeted re-assessment

Seven dimensions are held. One is re-scored.

### ACC: Accountability — 2.4 to 2.8

| Subdimension | Prior | New | Evidence | Source |
|---|---|---|---|---|
| AB1 Harm Acknowledgment | 2 | **2** held | The report acknowledges the deaths, but only through a statutory annual reporting obligation, not before it. Anchor 2: acknowledged after external establishment. | WTAP, 2026-09-21 |
| AB2 Correction Willingness | 3 | **3** held | SAFE model implementation and the Restore Hope partnership are course corrections following harm evidence — already scored at anchor 3. | WTAP, 2026-09-21 |
| AB3 Transparency | 3 | **4** +1 | Anchor 4 exactly: an annual report that includes failures, gaps and corrective actions. The FFY2025 report discloses twelve child deaths, disaggregates by age, substance involvement and prior-referral count, and names the corrective actions taken. | WTAP, 2026-09-21 |
| AB4 Systemic Learning | 2 | **3** +1 | Anchor 3: a formal systemic review process with at least two documented systemic changes. The annual fatality review is the formal process; the SAFE model and the Restore Hope prevention partnership are the two named changes. | WTAP, 2026-09-21 |
| AB5 Reparative Action | 2 | **2** held | No reparative action toward bereaved or surviving families located. | (evidence gap) |

New ACC raw: (2 + 3 + 4 + 3 + 2) / 5 = **2.8**.

### Dimensions reviewed and held

| Dimension | Raw | Reason held |
|---|---|---|
| AWR | 2.6 | A3 Blind Spot Mitigation was considered for an increase to 4 on the annual structured fatality review. **Held at 3 deliberately.** Anchor 4 requires that findings are acted upon, and the report's own data — 83% of families already known to CPS, 17% with five or more prior referrals — is evidence that previous years' findings were not effectively acted upon. Scoring conservatively. |
| EMP | 2.0 | No in-window empathy evidence. E4 Validation remains at 1. |
| ACT | 2.6 | AC1 Responsiveness reviewed: the declaration request came roughly four weeks after the floods, following joint preliminary damage assessments, which is standard FEMA sequencing. Standards met — anchor 3, already scored. AC5 Follow-Through held at 2; the prior-referral data is direct evidence against persistence. |
| EQU | 2.4 | No in-window equity evidence. |
| BND | 2.4 | No in-window boundaries evidence. |
| SYS | 2.8 | The Restore Hope prevention partnership was considered for S1. Held: S1 is already at 4, the highest in the vector. |
| INT | 2.2 | No in-window integrity evidence. |

## Score Summary

| Dimension | Code | Raw | Published raw | Change |
|-----------|------|-----|---------------|--------|
| Awareness | AWR | 2.6 | 2.6 | held |
| Empathy | EMP | 2.0 | 2.0 | held |
| Action | ACT | 2.6 | 2.6 | held |
| Equity | EQU | 2.4 | 2.4 | held |
| Boundaries | BND | 2.4 | 2.4 | held |
| Accountability | ACC | **2.8** | 2.4 | **+0.4** |
| Systemic Thinking | SYS | 2.8 | 2.8 | held |
| Integrity | INT | 2.2 | 2.2 | held |
| **Composite** | — | **36.9** | **35.6** | **+1.3** |

Canonical reconstruction of the published vector returns 35.6 exactly — **no math-hygiene issue.** Integration premium 0.0 on both vectors.

## Determination

**CONFIRM 35.6.** The measured 36.9 is 1.3 points above the published value, under the 5-point trigger, with no band change. The movement is a genuine but small credit for institutional honesty: West Virginia published an unflattering account of its own child-protection failures and named what it is changing. That is anchor-4 transparency and the benchmark should say so.

It should also say what the report does not change. Twelve children died, and 83% of their families were already known to the child protection system. Publishing that is better than hiding it. It is not the same as preventing it, which is why Empathy stays at 2.0 and Action stays at 2.6.

## Key Findings

- Why it matters: West Virginia's score of 35.6 out of 100 holds. The state published a report on 21 September 2026 showing 12 children died of abuse or neglect in the year to September 2025.
- Why it matters: the system had already seen most of these families. 83% had prior contact with Child Protective Services, and 17% had five or more prior referrals.
- Why it matters: the youngest children are most at risk. More than 80% of victims were under five, and infants under one accounted for more than half the cases.
- Why it matters: the state told the public itself. That self-disclosure raised its Transparency score to 4 out of 5, and is the reason the overall score ticks up rather than down.
- Why it matters: the state also acted quickly on flooding. The governor requested federal disaster aid for three counties on 13 September 2026, after damage assessments found 624 homes affected and 22 destroyed.

## Strongest Dimensions

Accountability and Systemic Thinking (both raw 2.8). Accountability rises on self-disclosed failure with named corrective action; Systemic Thinking carries a prevention and root-cause orientation from the prior baseline.

## Weakest Dimensions

Empathy (raw 2.0). E4 Validation remains at 1 out of 5, unchanged from the first baseline.

## Evidence Gaps

- The DoHS report was not retrieved directly; scoring relies on WTAP's reporting of it, which quotes its figures. A direct read could support or qualify AB3 and AB4.
- No independent evaluation of SAFE model implementation was located, which caps AB4 at 3.
- No evidence of reparative action toward affected families was located.

## Watch triggers

- Whether the federal Major Disaster Declaration was granted, and how quickly individual assistance reached the 624 affected households, is a direct AC1 and AC5 item for the next cycle.
- The FFY2026 child fatality report, due around September 2027, is the test of whether the SAFE model changed outcomes. If the count does not fall, AB4 should return to 2.

## Recommended Next Steps

**Developing** band: consider a [Certified Assessment](/certified-assessments) for a structured improvement roadmap.

## Sources

- WTAP, reporting the WV DoHS Bureau for Social Services Child Fatalities and Near Fatalities Annual Report FFY2025 — 2026-09-21 — tier 2 reporting a tier-5 state report — https://www.wtap.com/2026/09/21/12-children-died-abuse-neglect-west-virginia-2025-11-nearly-died-new-report-reveals/
- West Virginia Watch, Major Disaster Declaration request — 2026-09-14 — tier 2 — https://westvirginiawatch.com/2026/09/14/morrisey-requests-major-disaster-declaration-for-three-wv-counties/
- WV MetroNews, summer flooding recovery context — 2026-09-13 — tier 2 — https://wvmetronews.com/2026/09/13/summer-of-flooding-across-west-virginia-leads-to-ongoing-recovery-efforts/
- Prior baseline: `research/assessments/west-virginia-2026-07-19.md` and its subdimension sidecar

---

*This assessment is based on publicly available information and does not constitute a formal Compassion Benchmark Certified Assessment. For a comprehensive, assessor-led evaluation, visit compassionbenchmark.com/certified-assessments.*
