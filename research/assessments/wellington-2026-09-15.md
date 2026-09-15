---
entity: "Wellington"
type: "City"
sector: "Municipal Government (Wellington City Council)"
date: "2026-09-15"
composite_score: 71.3
band: "Established"
scores:
  AWR: 3.8
  EMP: 4
  ACT: 3.8
  EQU: 3.4
  BND: 4
  ACC: 4.2
  SYS: 3.8
  INT: 3.8
published_index: "global-cities"
published_rank: 13
published_composite: 83
published_band: "exemplary"
published_dimensions:
  AWR: 4
  EMP: 4
  ACT: 4
  EQU: 3.5
  BND: 4
  ACC: 4.5
  SYS: 4
  INT: 4
assessed_composite: 71.3
score_delta: -11.7
band_change: true
filing_trigger_met: true
outcome: "proposal"
recommendation: "downgrade"
change_proposal: true
confidence: "medium"
subdim_sidecar: true
watch_flag: "Implementation of the six Crown Review recommendations by Wellington City Council and Tiaki Wai (consent compliance, communication, governance, asset stewardship, risk-investment linkage). Evidence of remediation and repair to South Coast residents and businesses would support re-testing AB4, AC4 and AB5 upward."
calibration_flag: null
source: "priority"
scan_file: "research/scans/2026-09-15.json"
integration_premium: 0
published_formula_reconstruction: 83
math_hygiene_reconstruction_diff: 0
assessor_override_registered: false
evidence_density: { moved: 5, held_with_evidence: 4, held_no_evidence: 31 }
base: "published placeholder, integer grid rounded down"
---

# Compassion Benchmark Assessment: Wellington

**Entity type:** City  
**Sector/Domain:** Municipal Government (Wellington City Council)  
**Assessment date:** 2026-09-15  
**Composite score:** 71.3/100  
**Band:** Established  
**Cycle:** nightly, lookback 2026-09-01 to 2026-09-15 (scan `research/scans/2026-09-15.json`, source: priority)  
**Outcome:** proposal (recommendation: downgrade)

## Why this entity was assessed

The scanner flagged Wellington (priority 58) on the Crown Review into the Moa Point wastewater plant failure, released 2 September 2026. Wellington has never been individually assessed (rotation-state `last_assessed: null`); the published 83.0 (Exemplary, rank 13 of 250) is a placeholder vector.

## Evidence-date, provenance, attribution and screening checks

**BASELINE PROVENANCE.** No APPLIED_CHANGES entry, digest mention, prior assessment or proposal exists for Wellington. The published 83.0 is the original placeholder. This proposal does not rely on a stale-baseline argument. It rests on an official review of the council's own conduct, published in window.

**DATES.** The plant flooded and failed on 4 February 2026 (pre-window). The Minister appointed the statutory Crown Review Team on 12 March 2026 under sections 255(3) and 258 of the Local Government Act 2002 (NZ Gazette). The final report and the government's release came out on 2 September 2026, in window. RNZ, ODT and 1News are all dated 2 September; The Spinoff is dated 3 September. The scanner's only source (democracyproject.org.nz, `date_verified: false`) was not used; every fact here was re-verified from dated sources.

**ATTRIBUTION.** The Moa Point plant is owned by Wellington City Council, which also holds its resource consent. ODT reports the review found the council 'remained ultimately accountable'. Wellington Water (now Tiaki Wai) and the operator Veolia share the failures, but only the council's own governance conduct is scored here. The mayor and the acting chief executive both accepted this.

**DIRECTIONALITY.** Surfaced on negative in-window evidence, and the proposal is a downgrade. The positive in-window conduct (the apology, acceptance of findings, the new monitoring role) is credited explicitly: AB1 is held at 5 and AB2 at 4.

**BAND-CROSSING EVIDENCE TEST (passes).** There are more than 2 distinct sources. The tier-5 source is the NZ Government release of 2 September 2026, cited through its verbatim republication on Mirage News, which links the Beehive original. The Beehive page returned empty to automated fetch twice. The NZ Gazette appointment notice (tier 5) establishes the review's statutory basis. RNZ, ODT, 1News and The Spinoff (tier 2) independently report the findings and the council's response.

**DECOMPOSITION OF THE -11.7.** About -0.6 is integer-grid rounding of the placeholder (83.0 to 82.4). About -11.1 comes from five evidence-based moves (A5, AC4, S2, AB4, I4). The formula makes this nonlinear. The 'bonus for being strong across all 8 areas' (integration premium) is 10 points only when no dimension is below 4.0, and each dimension below 4.0 removes 2 points. The placeholder had one dimension below 4.0 (Equity). The five moves put four more below 4.0 (AWR, ACT, SYS, INT at 3.8), which removes the premium entirely. **Sensitivity (computed with the canonical function):** grid rounding alone gives 82.4 (Exemplary). Each of the four moves that take a dimension below 4.0 (A5, AC4, S2, I4) gives 79.8 on its own, which is already Established. AB4 alone gives 81.8 (still Exemplary), because Accountability stays at 4.2. The band crossing therefore holds if any one of A5, AC4, S2 or I4 is accepted, and it does not depend on AB4.

**MATH HYGIENE.** Canonical reconstruction of the published vector gives 83.0, which matches. Proposed composite computed with the strict canonical entry point.

## Corrections to the scan and to prior cycles (append-only)

- Scan summary says the review found 'systemic failures and leadership issues, compounding public anger over rising water bills'. The review findings are verified. The water-bill claim was not verified in any fetched source and is not used.
- RNZ and ODT report about 14 billion litres of raw sewage discharged since 4 February. 1News described 'millions of litres'. The larger figure is reported by two outlets but was not verified against the report, so it is recorded, not scored.

## Score Summary

| Dimension | Code | Raw (1-5) | Scaled (0-100) | Published raw | Delta (raw) | Band |
|---|---|---|---|---|---|---|
| Awareness | AWR | 3.8 | 70 | 4 | -0.2 | Established |
| Empathy | EMP | 4 | 75 | 4 | 0 | Established |
| Action | ACT | 3.8 | 70 | 4 | -0.2 | Established |
| Equity | EQU | 3.4 | 60 | 3.5 | -0.1 | Functional |
| Boundaries | BND | 4 | 75 | 4 | 0 | Established |
| Accountability | ACC | 4.2 | 80 | 4.5 | -0.3 | Established |
| Systemic Thinking | SYS | 3.8 | 70 | 4 | -0.2 | Established |
| Integrity | INT | 3.8 | 70 | 4 | -0.2 | Established |
| **Composite** | — | — | **71.3** | **83** | **-11.7** | **Established** |

Composite computed with `computeCompositeFromDimensions` (site/scripts/lib/scoring.mjs, strict 8-dimension check). Integration premium: 0. Canonical reconstruction of the published dimensions: 83 (published 83; diff 0). No math-hygiene issue.

## Dimension Details

### AWR: Awareness (Raw 3.8; Score: 70/100)

| Subdimension | Score | Base | Evidence and anchor match | Source |
|---|---|---|---|---|
| A1 Suffering Detection | 4/5 | 4 | Held at 4. The statutory Crown Review was commissioned by the Minister of Local Government, so detection of this failure was external. The council's general distress-detection channels were not re-examined this cycle. | [T5, 2026-03-12](https://gazette.govt.nz/notice/id/2026-go1238) |
| A2 Contextual Sensitivity | 4/5 | 4 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| A3 Blind Spot Mitigation | 4/5 | 4 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| A4 Signal Amplification | 4/5 | 4 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| A5 Anticipatory Awareness | 3/5 (moved 4->3) | 4 | MOVED 4->3. Anchor 4 needs harm assessment required for all major decisions. The Crown Review found risk management weaknesses, and RNZ reports that warnings about flooding risk during the UV-system upgrade were not escalated. Anchor 3 (formal assessment for some decisions) fits: frameworks existed but drifted. | [T5, 2026-09-02](https://www.miragenews.com/moa-point-plant-failure-review-report-released-1737009/); [T2, 2026-09-02](https://www.1news.co.nz/2026/09/02/longstanding-weaknesses-led-to-moa-point-failure-report-finds/) |

### EMP: Empathy (Raw 4; Score: 75/100)

| Subdimension | Score | Base | Evidence and anchor match | Source |
|---|---|---|---|---|
| E1 Affective Resonance | 4/5 | 4 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| E2 Perspective-Taking | 4/5 | 4 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| E3 Non-Judgment | 4/5 | 4 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| E4 Validation | 4/5 | 4 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| E5 Cultural Empathy | 4/5 | 4 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |

### ACT: Action (Raw 3.8; Score: 70/100)

| Subdimension | Score | Base | Evidence and anchor match | Source |
|---|---|---|---|---|
| AC1 Responsiveness | 4/5 | 4 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| AC2 Proportionality | 4/5 | 4 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| AC3 Efficacy | 4/5 | 4 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| AC4 Resource Mobilization | 3/5 (moved 4->3) | 4 | MOVED 4->3. Anchor 4 needs annual review against need with documented reallocation. ODT reports the review found no detailed management plan and no adequate funding plan for the plant, which the council owns. Anchor 3 is the conservative fit: gaps were known from condition ratings but not funded. | [T2, 2026-09-02](https://www.odt.co.nz/news/national/damning-report-blames-systemic-leadership-failures-for-wellington-sewage-disaster-i4xcrqst) |
| AC5 Follow-Through | 4/5 | 4 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |

### EQU: Equity (Raw 3.4; Score: 60/100)

| Subdimension | Score | Base | Evidence and anchor match | Source |
|---|---|---|---|---|
| EQ1 Universality | 4/5 | 4 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| EQ2 Priority for Vulnerable | 4/5 | 4 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| EQ3 Bias Awareness | 3/5 | 3 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| EQ4 Access Design | 3/5 | 3 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| EQ5 Historical Harm Acknowledgment | 3/5 | 3 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |

### BND: Boundaries (Raw 4; Score: 75/100)

| Subdimension | Score | Base | Evidence and anchor match | Source |
|---|---|---|---|---|
| B1 Self-Sustainability | 4/5 | 4 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| B2 Autonomy Preservation | 4/5 | 4 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| B3 Scope Clarity | 4/5 | 4 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| B4 Refusal Ethics | 4/5 | 4 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| B5 Consent Orientation | 4/5 | 4 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |

### ACC: Accountability (Raw 4.2; Score: 80/100)

| Subdimension | Score | Base | Evidence and anchor match | Source |
|---|---|---|---|---|
| AB1 Harm Acknowledgment | 5/5 | 5 | Held at 5 (positive in-window conduct). The mayor apologised without qualification, accepted the failure was preventable and avoidable, and accepted the findings for the council. The acting chief executive acknowledged the council should have done better. Anchor 5's 'self-initiated' element is only partly met because the apology followed the review, so this is the anchor 4-5 boundary and was not raised. | [T2, 2026-09-03](https://thespinoff.co.nz/the-bulletin/03-09-2026/moa-point-disaster-systemic-failures-not-one-mistake-caused-sewage-plant-collapse); [T2, 2026-09-02](https://insidegovernment.co.nz/moa-point-wastewater-plant-failure-review-released/) |
| AB2 Correction Willingness | 4/5 | 4 | Held at 4. Acting chief executive Anna Calver announced recruitment of a new role to monitor Tiaki Wai's performance, a documented correction after the review. | [T2, 2026-09-02](https://www.rnz.co.nz/news/regions_wellington/1224096/moa-point-disaster-caused-by-systemic-leadership-failures-damning-report-finds) |
| AB3 Transparency | 4/5 | 4 | Held at 4, not at the 5 the grid would allow. The review found the council lacked the internal capability to understand the reports it received. That is a transparency-to-itself failure, which rules out anchor 5. The mayor publicly committed to transparency. | [T2, 2026-09-02](https://www.odt.co.nz/news/national/damning-report-blames-systemic-leadership-failures-for-wellington-sewage-disaster-i4xcrqst) |
| AB4 Systemic Learning | 3/5 (moved 4->3) | 4 | MOVED 4->3. Anchor 4 needs 3+ practices changed because of failure analysis. The failure followed years of reported flaws that were not acted on; Mayor Andrew Little said under-performance was treated as normal. Recurring, unaddressed weakness is anchor 2-3; held at 3 because the council has now created a role to monitor Tiaki Wai. | [T2, 2026-09-02](https://www.rnz.co.nz/news/regions_wellington/1224096/moa-point-disaster-caused-by-systemic-leadership-failures-damning-report-finds) |
| AB5 Reparative Action | 5/5 | 5 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |

### SYS: Systemic Thinking (Raw 3.8; Score: 70/100)

| Subdimension | Score | Base | Evidence and anchor match | Source |
|---|---|---|---|---|
| S1 Root Cause Orientation | 4/5 | 4 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| S2 Long-Term Impact | 3/5 (moved 4->3) | 4 | MOVED 4->3. Anchor 4 needs long-term outcome data to drive strategy. The review attributes the failure to longstanding weaknesses in asset management and infrastructure resilience. The Spinoff reports the plant ran below capacity from 1998 and was rated 'poor' by 2021. Long-horizon asset stewardship failed, so anchor 3. | [T5, 2026-09-02](https://www.miragenews.com/moa-point-plant-failure-review-report-released-1737009/) |
| S3 Interconnection Awareness | 4/5 | 4 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| S4 Structural Critique | 4/5 | 4 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| S5 Coalitional Compassion | 4/5 | 4 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |

### INT: Integrity (Raw 3.8; Score: 70/100)

| Subdimension | Score | Base | Evidence and anchor match | Source |
|---|---|---|---|---|
| I1 Consistency Under Pressure | 4/5 | 4 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| I2 Non-Performance | 4/5 | 4 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| I3 Internal Consistency | 4/5 | 4 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |
| I4 Values Alignment | 3/5 (moved 4->3) | 4 | MOVED 4->3. Anchor 4 needs values-alignment review in major decisions. ODT reports the council, as owner and consent holder, remained ultimately accountable yet maintained that it did not control the plant, and relied on Wellington Water's notifications instead of setting its own standards. Stated stewardship was not applied in practice: anchor 3. | [T2, 2026-09-02](https://www.rnz.co.nz/news/regions_wellington/1224096/moa-point-disaster-caused-by-systemic-leadership-failures-damning-report-finds) |
| I5 Resilience of Care | 4/5 | 4 | No entity-specific evidence located this cycle; held at the published placeholder level on the integer grid (rounded down). | — |

## Published Index Comparison

**Published index:** global-cities | **Published rank:** #13 of 250 | **Published composite:** 83/100 | **Published band:** exemplary

| Dimension | Published (raw) | Published (scaled) | Research (raw) | Research (scaled) | Difference (scaled) | Explanation |
|---|---|---|---|---|---|---|
| AWR | 4 | 75 | 3.8 | 70 | -5 | Moved on evidence: A5 4->3 |
| EMP | 4 | 75 | 4 | 75 | 0 | Unchanged |
| ACT | 4 | 75 | 3.8 | 70 | -5 | Moved on evidence: AC4 4->3 |
| EQU | 3.5 | 62.5 | 3.4 | 60 | -2.5 | Integer-grid rounding of the published value; no evidence-based move |
| BND | 4 | 75 | 4 | 75 | 0 | Unchanged |
| ACC | 4.5 | 87.5 | 4.2 | 80 | -7.5 | Moved on evidence: AB4 4->3 |
| SYS | 4 | 75 | 3.8 | 70 | -5 | Moved on evidence: S2 4->3 |
| INT | 4 | 75 | 3.8 | 70 | -5 | Moved on evidence: I4 4->3 |
| **Composite** | — | **83** | — | **71.3** | **-11.7** | — |

### Score Difference Analysis

AWR, ACT, SYS and INT each fall 0.2 raw (4.0 to 3.8) on one evidence-based move apiece. ACC falls from 4.5 to 4.2: 0.1 is grid rounding and 0.2 is the AB4 move. EQU is grid rounding only (3.5 to 3.4). EMP and BND are unchanged. The composite falls more than the dimension changes suggest, because four dimensions now sit just below 4.0. The methodology's bonus for being strong in all 8 areas requires every dimension at 4.0 or above; with five below it, the bonus is zero. That is the canonical v1.2 formula working as designed: the Exemplary label means independently verified, consistent practice, and a statutory review finding longstanding governance weakness contradicts it.

### Recommendation

File a downgrade proposal: 83.0 Exemplary to 71.3 Established (-11.7). Both the magnitude trigger and the band-crossing trigger are met. Confidence is medium, not high: (1) the base is a never-assessed placeholder; (2) the tier-5 release is cited through a verbatim republication, because the Beehive page could not be fetched; (3) the full PDF report was not read. Positive conduct is credited: the mayor's apology and acceptance of the findings hold AB1 at 5.

## Key Findings

- Why it matters: a government review found Wellington's sewage disaster was preventable. On 2 September 2026 New Zealand's Crown Review said the Moa Point plant failure came from 'longstanding weaknesses in governance, accountability, asset management, risk management and infrastructure resilience'.
- Why it matters: the city council owned the plant and was accountable. The review found Wellington City Council 'remained ultimately accountable' as owner and consent holder, even though it relied on Wellington Water to run it. RNZ and ODT report about 14 billion litres of raw sewage reached the south coast after 4 February 2026.
- Why it matters: the city owned up. Mayor Andrew Little apologised and called the failure 'preventable and avoidable'. The council is recruiting a role to monitor the new water entity, Tiaki Wai.
- Why it matters: the Exemplary label does not survive the finding. Wellington's 83.0 was a placeholder. Five evidence-based changes give 71.3, which is Established (61-80). Any one of four of those changes (A5, AC4, S2 or I4) would on its own drop it below Exemplary.

## Strongest Dimensions

- Accountability (ACC) at raw 4.2.
- Empathy (EMP) at raw 4.


## Weakest Dimensions

- Equity (EQU) at raw 3.4.
- Integrity (INT) at raw 3.8.


## Evidence Gaps

- The Crown Review PDF was not read directly; findings come from the government release (via verbatim republication) and four news outlets.
- Wellington City Council's own response page returned HTTP 403.
- EMP, BND and EQU subdimensions were not re-examined this cycle and sit at placeholder grid values.
- No evidence was gathered on repair to South Coast residents or businesses (AB5). RNZ headlines report businesses still paying the price eight months on, but that article was not fetched.

## Recommended Next Steps

- Consider [Advisory Support](/advisory) to translate benchmark insights into strategic action.

## Sources

- [https://gazette.govt.nz/notice/id/2026-go1238](https://gazette.govt.nz/notice/id/2026-go1238) (tier 5, 2026-03-12)
- [https://www.miragenews.com/moa-point-plant-failure-review-report-released-1737009/](https://www.miragenews.com/moa-point-plant-failure-review-report-released-1737009/) (tier 5, 2026-09-02)
- [https://www.1news.co.nz/2026/09/02/longstanding-weaknesses-led-to-moa-point-failure-report-finds/](https://www.1news.co.nz/2026/09/02/longstanding-weaknesses-led-to-moa-point-failure-report-finds/) (tier 2, 2026-09-02)
- [https://www.odt.co.nz/news/national/damning-report-blames-systemic-leadership-failures-for-wellington-sewage-disaster-i4xcrqst](https://www.odt.co.nz/news/national/damning-report-blames-systemic-leadership-failures-for-wellington-sewage-disaster-i4xcrqst) (tier 2, 2026-09-02)
- [https://thespinoff.co.nz/the-bulletin/03-09-2026/moa-point-disaster-systemic-failures-not-one-mistake-caused-sewage-plant-collapse](https://thespinoff.co.nz/the-bulletin/03-09-2026/moa-point-disaster-systemic-failures-not-one-mistake-caused-sewage-plant-collapse) (tier 2, 2026-09-03)
- [https://insidegovernment.co.nz/moa-point-wastewater-plant-failure-review-released/](https://insidegovernment.co.nz/moa-point-wastewater-plant-failure-review-released/) (tier 2, 2026-09-02)
- [https://www.rnz.co.nz/news/regions_wellington/1224096/moa-point-disaster-caused-by-systemic-leadership-failures-damning-report-finds](https://www.rnz.co.nz/news/regions_wellington/1224096/moa-point-disaster-caused-by-systemic-leadership-failures-damning-report-finds) (tier 2, 2026-09-02)
- [NZ Government release (Beehive original; returned empty to automated fetch)](https://www.beehive.govt.nz/release/independent-review-released-moa-point-plant-failure) (tier 5, 2026-09-02)
- [Wellington City Council response (HTTP 403)](https://wellington.govt.nz/news-and-events/news-and-information/our-wellington/2026/09/moa-point) (tier 5, not fetched)

---

This assessment is based on publicly available information and does not constitute a formal Compassion Benchmark Certified Assessment. For a comprehensive, assessor-led evaluation, visit compassionbenchmark.com/certified-assessments.
