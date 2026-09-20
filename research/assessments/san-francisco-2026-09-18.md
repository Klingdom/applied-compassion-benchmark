---
entity: "San Francisco"
type: "City"
sector: "Municipal government"
date: "2026-09-18"
composite_score: 45.6
band: "Functional"
scores:
  AWR: 3
  EMP: 3
  ACT: 3.4
  EQU: 2.4
  BND: 2.4
  ACC: 3
  SYS: 3.4
  INT: 2
published_index: "us-cities"
published_rank: 28
published_composite: 46.9
published_band: "functional"
published_dimensions:
  AWR: 3
  EMP: 3
  ACT: 3.5
  EQU: 2.5
  BND: 2.5
  ACC: 3
  SYS: 3.5
  INT: 2
assessed_composite: 45.6
score_delta: -1.3
band_change: false
filing_trigger_met: false
outcome: "confirmation"
recommendation: "confirm"
change_proposal: false
confidence: "medium"
subdim_sidecar: true
watch_flag: true
calibration_flag: null
source: "priority"
scan_file: "research/scans/2026-09-18.json"
integration_premium: 0
grid_only_composite: 45.6
math_hygiene_reconstruction_diff: 0
---

# Compassion Benchmark Assessment: San Francisco

**Entity type:** City  
**Sector/Domain:** Municipal government  
**Assessment date:** 2026-09-18  
**Composite score:** 45.6/100  
**Band:** Functional  
**Cycle:** nightly, lookback 2026-09-03 to 2026-09-18 (scan `research/scans/2026-09-18.json`, source: priority)  
**Outcome:** confirmation (recommendation: confirm)

## Why this entity was assessed

The scanner flagged San Francisco (priority 50, T2) after about a dozen protesters gathered outside San Francisco International Airport on 16 September 2026, following a San Francisco Chronicle investigation finding that Immigration and Customs Enforcement had held roughly 25 immigrants -- mostly green-card holders -- at an undisclosed facility at the airport for more than three days, against stated policy. San Francisco has never been individually assessed.

## Evidence-date, provenance, attribution and screening checks

**ICE AND CBP ARE FEDERAL (the decisive screen, stated explicitly).** The detaining agencies are United States Immigration and Customs Enforcement and United States Customs and Border Protection. Both are federal. The room is a Customs and Border Protection lounge used as a de facto detention space. The guideline breached -- a 72-hour limit on airport detention -- is a Customs and Border Protection guideline. The entity under assessment is the City and County of San Francisco. Federal conduct is not scored against the city. Not one subdimension moves on the detentions themselves.

**THE CITY'S OWN POSITION IN THE FACTS, STATED PLAINLY.** There is a genuine city connection and it must be named rather than glossed: San Francisco International Airport is owned and operated by the City and County of San Francisco through its Airport Commission. The city is the landlord. So the honest question is not whether the city detained anyone -- it did not -- but whether the city, as owner, knew and could have acted.

**WHAT THE CITY ITSELF DID.** Airport Director Mike Nakornkhet stated that federal agencies including the Department of Homeland Security hold extensive regulatory authority over United States airports and that the City and County of San Francisco and its Airport Commission do not have the authority to regulate such activities. That is a jurisdictional limit, not an excuse the benchmark has to accept uncritically, but no source contradicting it was located. The Board of Supervisors unanimously condemned the detention of a traveller and reaffirmed the city's sanctuary policies, on a resolution sponsored by Supervisor Bilal Mahmood. Mayor Daniel Lurie stated that local law enforcement does not participate in federal civil immigration enforcement and that those policies 'will not change as long as I'm mayor'.

**WHAT THE CITY DID NOT DO, AND WHY IT STILL DOES NOT MOVE.** The airport's response to travellers' rights was that it 'is considering adding signage' to inform them. Considering is a plan, not conduct, so it cannot lift a score. Nor is a merely-contemplated notice a scorable failure at the 25-detention scale, given the jurisdictional limit. The net is no move in either direction.

**ONE ITEM NOT SCORED, AND THE REASON.** Mayor Lurie also said he believed an SFO incident was 'an isolated incident' with 'no reason to believe there is broader federal immigration enforcement at SFO', which sits awkwardly beside a documented pattern of about 25 prolonged detentions. That would bear on Suffering Detection (A1) and Validation (E4). It is not scored, because the quote is reported in connection with a separate viral arrest and its date could not be fixed against the Chronicle investigation's publication. Recorded as an evidence gap, not as a finding.

**BASELINE PROVENANCE (read first).** Published 46.9 (Functional, rank 28) has never moved. There is no San Francisco entry in `APPLIED_CHANGES.md` and no San Francisco change proposal on disk. The vector is a placeholder-style spread on the 0.5 grid. No stale-baseline argument is available or used.

**IDENTITY DEFECT, REPORTED NOT FIXED.** `validate-indexes.mjs` warns that the slug `san-francisco` collides across indexes: the global-cities row's entity record carries `index_slug="us-cities"`, so checks 13 to 16 are skipped for it. This is RISK-017. The row assessed here is the us-cities San Francisco at 46.9. Reported only; no index or record file is touched.

**DIRECTIONALITY.** San Francisco surfaced on negative evidence that belongs to a different actor. No upward move was made on the city's condemnation, because a resolution is a statement rather than a delivered service, and the published Accountability anchor already accommodates it.

## Score Summary

| Dimension | Code | Raw (1-5) | Scaled (0-100) | Published raw | Delta (raw) | Band |
|---|---|---|---|---|---|---|
| Awareness | AWR | 3 | 50 | 3 | 0 | Functional |
| Empathy | EMP | 3 | 50 | 3 | 0 | Functional |
| Action | ACT | 3.4 | 60 | 3.5 | -0.1 | Functional |
| Equity | EQU | 2.4 | 35 | 2.5 | -0.1 | Developing |
| Boundaries | BND | 2.4 | 35 | 2.5 | -0.1 | Developing |
| Accountability | ACC | 3 | 50 | 3 | 0 | Functional |
| Systemic Thinking | SYS | 3.4 | 60 | 3.5 | -0.1 | Functional |
| Integrity | INT | 2 | 25 | 2 | 0 | Developing |
| **Composite** | — | — | **45.6** | **46.9** | **-1.3** | **Functional** |

**Band:** Functional (published: functional). Integration premium (a bonus for being strong across all 8 areas): 0. Canonical reconstruction of the published vector: 46.9 (published 46.9; difference 0, so no math-hygiene issue). Baseline-only composite before any evidence move (integer-grid rounding of the published profile): 45.6.

**Evidence density:** 0 subdimensions moved on located evidence; 4 held with new located evidence; 36 held with no new evidence this cycle.

## Dimension Details

### AWR: Awareness (raw 3/5 — scaled 50/100)

| Subdimension | Score | Evidence and anchor match | Source |
|---|---|---|---|
| A1 Suffering Detection | 3/5 | Held at 3. The prolonged detentions were surfaced by a newspaper investigation, not by a city detection mechanism -- which would point toward anchor 1. But the detentions occurred in a federally controlled space the city says it cannot regulate, so the detection failure is not properly the city's. Held with the reason stated. | [T2](https://sfist.com/2026/09/01/ice-has-held-25-immigrants-at-sfo-for-more-than-three-days-in-2026-in-violation-of-policy/) 2026-09-01 |
| A2 Contextual Sensitivity | 3/5 | Held at the integer-grid expansion of the published AWR 3, rounded down. No evidence located this cycle bears on this subdimension. | none located |
| A3 Blind Spot Mitigation | 3/5 | Held at the integer-grid expansion of the published AWR 3, rounded down. No evidence located this cycle bears on this subdimension. | none located |
| A4 Signal Amplification | 3/5 | Held at 3. The Board of Supervisors unanimously condemned the detention of a traveller and reaffirmed sanctuary policies. That amplifies a low-power concern, but a resolution is not shown to have changed a decision, so it does not reach anchor 4. | [T2](https://www.kqed.org/news/12082395/san-francisco-condemns-immigration-and-customs-enforcement-actions-at-sfo-airport) 2026-09-16 |
| A5 Anticipatory Awareness | 3/5 | Held at the integer-grid expansion of the published AWR 3, rounded down. No evidence located this cycle bears on this subdimension. | none located |

### EMP: Empathy (raw 3/5 — scaled 50/100)

| Subdimension | Score | Evidence and anchor match | Source |
|---|---|---|---|
| E1 Affective Resonance | 3/5 | Held at the integer-grid expansion of the published EMP 3, rounded down. No evidence located this cycle bears on this subdimension. | none located |
| E2 Perspective-Taking | 3/5 | Held at the integer-grid expansion of the published EMP 3, rounded down. No evidence located this cycle bears on this subdimension. | none located |
| E3 Non-Judgment | 3/5 | Held at the integer-grid expansion of the published EMP 3, rounded down. No evidence located this cycle bears on this subdimension. | none located |
| E4 Validation | 3/5 | Held at the integer-grid expansion of the published EMP 3, rounded down. No evidence located this cycle bears on this subdimension. | none located |
| E5 Cultural Empathy | 3/5 | Held at the integer-grid expansion of the published EMP 3, rounded down. No evidence located this cycle bears on this subdimension. | none located |

### ACT: Action (raw 3.4/5 — scaled 60/100)

| Subdimension | Score | Evidence and anchor match | Source |
|---|---|---|---|
| AC1 Responsiveness | 4/5 | Held at the integer-grid expansion of the published ACT 3.5, rounded down. No evidence located this cycle bears on this subdimension. | none located |
| AC2 Proportionality | 4/5 | Held at the integer-grid expansion of the published ACT 3.5, rounded down. No evidence located this cycle bears on this subdimension. | none located |
| AC3 Efficacy | 3/5 | Held at the integer-grid expansion of the published ACT 3.5, rounded down. No evidence located this cycle bears on this subdimension. | none located |
| AC4 Resource Mobilization | 3/5 | Held at the integer-grid expansion of the published ACT 3.5, rounded down. No evidence located this cycle bears on this subdimension. | none located |
| AC5 Follow-Through | 3/5 | Held at the integer-grid expansion of the published ACT 3.5, rounded down. No evidence located this cycle bears on this subdimension. | none located |

### EQU: Equity (raw 2.4/5 — scaled 35/100)

| Subdimension | Score | Evidence and anchor match | Source |
|---|---|---|---|
| EQ1 Universality | 3/5 | Held at the integer-grid expansion of the published EQU 2.5, rounded down. No evidence located this cycle bears on this subdimension. | none located |
| EQ2 Priority for Vulnerable | 3/5 | Held at the integer-grid expansion of the published EQU 2.5, rounded down. No evidence located this cycle bears on this subdimension. | none located |
| EQ3 Bias Awareness | 2/5 | Held at the integer-grid expansion of the published EQU 2.5, rounded down. No evidence located this cycle bears on this subdimension. | none located |
| EQ4 Access Design | 2/5 | Held at the integer-grid expansion of the published EQU 2.5, rounded down. No evidence located this cycle bears on this subdimension. | none located |
| EQ5 Historical Harm Acknowledgment | 2/5 | Held at the integer-grid expansion of the published EQU 2.5, rounded down. No evidence located this cycle bears on this subdimension. | none located |

### BND: Boundaries (raw 2.4/5 — scaled 35/100)

| Subdimension | Score | Evidence and anchor match | Source |
|---|---|---|---|
| B1 Self-Sustainability | 3/5 | Held at the integer-grid expansion of the published BND 2.5, rounded down. No evidence located this cycle bears on this subdimension. | none located |
| B2 Autonomy Preservation | 3/5 | Held at the integer-grid expansion of the published BND 2.5, rounded down. No evidence located this cycle bears on this subdimension. | none located |
| B3 Scope Clarity | 2/5 | Held at 2. The airport 'is considering adding signage' to tell travellers their data is passed to the Transportation Security Administration, Customs and Border Protection and Immigration and Customs Enforcement. A contemplated notice is not a scope limitation communicated before commitment. Anchor 2 holds; plans are not conduct. | [T2](https://missionlocal.org/2026/08/san-francisco-airport-commission-ice-sfo-data-sharing/) 2026-08-01 |
| B4 Refusal Ethics | 2/5 | Held at the integer-grid expansion of the published BND 2.5, rounded down. No evidence located this cycle bears on this subdimension. | none located |
| B5 Consent Orientation | 2/5 | Held at the integer-grid expansion of the published BND 2.5, rounded down. No evidence located this cycle bears on this subdimension. | none located |

### ACC: Accountability (raw 3/5 — scaled 50/100)

| Subdimension | Score | Evidence and anchor match | Source |
|---|---|---|---|
| AB1 Harm Acknowledgment | 3/5 | Held at the integer-grid expansion of the published ACC 3, rounded down. No evidence located this cycle bears on this subdimension. | none located |
| AB2 Correction Willingness | 3/5 | Held at the integer-grid expansion of the published ACC 3, rounded down. No evidence located this cycle bears on this subdimension. | none located |
| AB3 Transparency | 3/5 | Held at the integer-grid expansion of the published ACC 3, rounded down. No evidence located this cycle bears on this subdimension. | none located |
| AB4 Systemic Learning | 3/5 | Held at the integer-grid expansion of the published ACC 3, rounded down. No evidence located this cycle bears on this subdimension. | none located |
| AB5 Reparative Action | 3/5 | Held at the integer-grid expansion of the published ACC 3, rounded down. No evidence located this cycle bears on this subdimension. | none located |

### SYS: Systemic Thinking (raw 3.4/5 — scaled 60/100)

| Subdimension | Score | Evidence and anchor match | Source |
|---|---|---|---|
| S1 Root Cause Orientation | 4/5 | Held at the integer-grid expansion of the published SYS 3.5, rounded down. No evidence located this cycle bears on this subdimension. | none located |
| S2 Long-Term Impact | 4/5 | Held at the integer-grid expansion of the published SYS 3.5, rounded down. No evidence located this cycle bears on this subdimension. | none located |
| S3 Interconnection Awareness | 3/5 | Held at 3. The Airport Director stated the city and its Airport Commission lack authority to regulate federal activity at the airport, which is an accurate account of an adjacent system's limits rather than joint planning with it. Anchor 3. | [T2](https://missionlocal.org/2026/08/san-francisco-airport-commission-ice-sfo-data-sharing/) 2026-08-01 |
| S4 Structural Critique | 3/5 | Held at the integer-grid expansion of the published SYS 3.5, rounded down. No evidence located this cycle bears on this subdimension. | none located |
| S5 Coalitional Compassion | 3/5 | Held at the integer-grid expansion of the published SYS 3.5, rounded down. No evidence located this cycle bears on this subdimension. | none located |

### INT: Integrity (raw 2/5 — scaled 25/100)

| Subdimension | Score | Evidence and anchor match | Source |
|---|---|---|---|
| I1 Consistency Under Pressure | 2/5 | Held at the integer-grid expansion of the published INT 2, rounded down. No evidence located this cycle bears on this subdimension. | none located |
| I2 Non-Performance | 2/5 | Held at the integer-grid expansion of the published INT 2, rounded down. No evidence located this cycle bears on this subdimension. | none located |
| I3 Internal Consistency | 2/5 | Held at the integer-grid expansion of the published INT 2, rounded down. No evidence located this cycle bears on this subdimension. | none located |
| I4 Values Alignment | 2/5 | Held at the integer-grid expansion of the published INT 2, rounded down. No evidence located this cycle bears on this subdimension. | none located |
| I5 Resilience of Care | 2/5 | Held at the integer-grid expansion of the published INT 2, rounded down. No evidence located this cycle bears on this subdimension. | none located |

## Published Index Comparison

**Published index:** us-cities | **Published rank:** #28 | **Published composite:** 46.9/100 | **Published band:** functional

| Dimension | Published (raw) | Published (scaled) | Research Score (raw) | Research (scaled) | Difference (scaled) |
|---|---|---|---|---|---|
| AWR | 3 | 50 | 3 | 50 | 0 |
| EMP | 3 | 50 | 3 | 50 | 0 |
| ACT | 3.5 | 62.5 | 3.4 | 60 | -2.5 |
| EQU | 2.5 | 37.5 | 2.4 | 35 | -2.5 |
| BND | 2.5 | 37.5 | 2.4 | 35 | -2.5 |
| ACC | 3 | 50 | 3 | 50 | 0 |
| SYS | 3.5 | 62.5 | 3.4 | 60 | -2.5 |
| INT | 2 | 25 | 2 | 25 | 0 |
| **Composite** | — | **46.9** | — | **45.6** | **-1.3** |

### Recommendation

The published score appears accurate on current evidence. Measured 45.6 against published 46.9 is a delta of -1.3, which does not meet the 5-point magnitude trigger, and the band is unchanged. No change proposal is filed.

## Key Findings

- San Francisco's published score of 46.9 out of 100 holds. Nothing moved, and the reason is worth stating plainly: the city did not do this.
- Immigration and Customs Enforcement and Customs and Border Protection held about 25 immigrants, mostly green-card holders, in a Customs and Border Protection lounge at San Francisco International Airport, some for more than three days. Both agencies are federal. The 72-hour limit they broke is a federal guideline.
- The city is the airport's owner, so the fair question is what the owner did. The Airport Director said the city and its Airport Commission have no authority to regulate federal activity at airports, and no source contradicted him.
- What the city itself did was condemn it. The Board of Supervisors passed a unanimous resolution, and Mayor Daniel Lurie restated that local police do not take part in federal civil immigration enforcement.
- One city act was too weak to count: the airport is 'considering' signage telling travellers their data goes to federal agencies. Considering something is not doing it, so it raises no score.

## Strongest Dimensions

Action and Systemic Thinking (raw 3.4 each after grid rounding), held from the published profile.

## Weakest Dimensions

Integrity (raw 2.0), then Equity and Boundaries (raw 2.4 each).

## Evidence Gaps

- The San Francisco Chronicle investigation itself is paywalled and was read only through SFist and KION secondary reporting.
- The date of Mayor Lurie's 'isolated incident' remark could not be fixed against the Chronicle investigation, so a potentially material contradiction is left unscored.
- Whether the Airport Commission has any lease or permit lever over the Customs and Border Protection space was not established. That is the fact that would decide whether the city could have acted.
- San Francisco has never been individually assessed; all 40 subdimensions are grid expansions of a placeholder vector.
- No tier 4 or tier 5 source (court filing, Department of Homeland Security Office of Inspector General report, congressional finding) on the SFO detentions was located.

## Scanner and source corrections

- The scan calls it 'an undisclosed detention facility at SFO'. Sources describe a Customs and Border Protection lounge used as a de facto detention space -- not a purpose-built facility. The distinction matters for who controls it.
- The scan says 'in violation of stated policy'. The policy is a Customs and Border Protection guideline generally limiting airport detention to 72 hours, so the violation is federal, not municipal.
- The scan's framing gives the reader no signal that the conduct is federal. That is the single most important correction here and is stated explicitly in this report, as instructed.

## Watch flag

Downward only on city conduct: evidence the Airport Commission had and declined a lease or permit lever, or a failure of city services to affected residents. Upward on installed rights signage, or a city legal action to restrict federal access at SFO.

## Recommended Next Steps

Consider [Advisory Support](/advisory) to translate benchmark insights into strategic action.

## Sources

- SFist — 2026-09-01 — tier 2 — https://sfist.com/2026/09/01/ice-has-held-25-immigrants-at-sfo-for-more-than-three-days-in-2026-in-violation-of-policy/
- KION Central Coast (reporting the San Francisco Chronicle investigation) — 2026-09-02 — tier 2 — https://kioncentralcoast.com/news/2026/09/02/ice-keeping-detainees-at-sfo-for-days-san-francisco-chronicle-investigation-finds/
- KQED — 2026-09-16 — tier 2 — https://www.kqed.org/news/12082395/san-francisco-condemns-immigration-and-customs-enforcement-actions-at-sfo-airport
- Mission Local — 2026-08-01 — tier 2 — https://missionlocal.org/2026/08/san-francisco-airport-commission-ice-sfo-data-sharing/
- San Francisco Standard — 2026-09-01 — tier 2 — https://sfstandard.com/2026/09/01/sfo-hidden-detention-center/

---

*This assessment is based on publicly available information and does not constitute a formal Compassion Benchmark Certified Assessment. For a comprehensive, assessor-led evaluation, visit compassionbenchmark.com/certified-assessments.*
