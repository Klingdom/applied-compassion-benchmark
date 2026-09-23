---
entity: "Waste Management"
type: "Company"
sector: "Environmental services"
date: "2026-09-22"
composite_score: 46.3
band: "Functional"
scores:
  AWR: 3
  EMP: 2.4
  ACT: 3.4
  EQU: 2.4
  BND: 2.6
  ACC: 2.8
  SYS: 3.2
  INT: 3
published_index: "fortune-500"
published_rank: 19
published_composite: 77.9
published_band: "Established"
published_dimensions:
  AWR: 4
  EMP: 4
  ACT: 4
  EQU: 3.5
  BND: 4
  ACC: 4
  SYS: 4
  INT: 3.5
assessed_composite: 46.3
score_delta: -31.6
band_change: true
filing_trigger_met: false
outcome: "first formal evidence-based baseline; measurement recorded, routed to calibration review"
assessment_type: "full 40-subdimension first baseline (rotation backfill)"
recommendation: "flag-for-review"
change_proposal: false
confidence: "medium"
subdim_sidecar: true
methodology_version: "v1.2"
source: "rotation"
scan_file: "research/scans/2026-09-22.json"
watch_flag: "Re-test AB1, AB5 and EQ2 on progress under the EPA’s May 2026 unilateral order for the San Jacinto River Waste Pits Superfund site, and on the outcome of the appealed Arkansas odour suit and the Texas county action to close the Hawthorn landfill."
calibration_flag: "The published composite sits in a 11-entity identical-dimension-vector cohort in `site/src/data/indexes/fortune-500.json` (including Agilent Technologies, Ally Financial, Corning, Huntington Bancshares, Hyatt Hotels, IDEXX Laboratories, Jack Henry & Associates and Northwestern Mutual). Byte-identical dimension vectors across 11 unrelated companies in different sectors is the signature of an unassessed seed value, not of measurement. Per anti-false-positive screening rule 5, a shared-artefact gap of this kind is routed to coordinator-level calibration review rather than encoded as a one-off baseline-reset proposal."
---

# Compassion Benchmark Assessment: Waste Management

**Entity type:** Company  
**Sector/Domain:** Environmental services  
**Assessment date:** 2026-09-22  
**Composite score:** 46.3/100  
**Band:** Functional  
**Cycle:** nightly, lookback 2026-09-08 to 2026-09-22 (scan `research/scans/2026-09-22.json`, source: rotation)  
**Outcome:** first formal evidence-based baseline; measurement recorded, routed to calibration review (recommendation: flag-for-review)

## Why this entity was assessed

Waste Management was drawn from the scanner’s staleness-based rotation backfill: it had never been assessed (`last_assessed: null`, zero files under `research/assessments/waste-management-*.md`) and its individual Tier 1 search this cycle surfaced no in-window news evidence. This cycle produces a cold first baseline.

## Evidence-date and attribution checks

**No in-window event.** Nothing dated between 2026-09-08 and 2026-09-22 was located for this entity, so nothing is scored as a recency event. The evidence base is the company’s own 2025 Sustainability Report and Data Center, its FY2025 Form 10-K, regulator and court records from 2025-2026, and 4,023 employee reviews.

**Attribution check.** A July 2025 OSHA confined-space fatality citation that surfaced in searching was for Clean Harbors Environmental Services, a different company, and is **not** charged to Waste Management. Sector-wide waste and recycling hazard patterns are context, not conduct.

## Score Summary

| Dimension | Code | Raw (1-5) | Scaled (0-100) | Band |
|-----------|------|-----------|----------------|------|
| Awareness | AWR | 3 | 50 | Functional |
| Empathy | EMP | 2.4 | 35 | Developing |
| Action | ACT | 3.4 | 60 | Functional |
| Equity | EQU | 2.4 | 35 | Developing |
| Boundaries | BND | 2.6 | 40 | Developing |
| Accountability | ACC | 2.8 | 45 | Functional |
| Systemic Thinking | SYS | 3.2 | 55 | Functional |
| Integrity | INT | 3 | 50 | Functional |
| **Composite** | — | — | **46.3** | **Functional** |

**Composite derivation (canonical formula, methodology v1.2, `site/scripts/lib/scoring.mjs::computeCompositeFromDimensions`):** mean of the 8 raw dimension scores = 2.850; baseComposite = 46.25; dimensions below 4.0 = 8; integration premium applied by the canonical function. Final composite **46.3** (Functional).

## Dimension Details

### AWR: Awareness (Raw 3/5 — Scaled 50/100)

| Subdimension | Score | Evidence | Source | Tier |
|-------------|-------|----------|--------|------|
| A1 Suffering Detection | 4/5 | Multiple formal channels with regular review and published metrics: Total Recordable Incident Rate, Days Away/Restricted/Transferred and Hourly Accident Recordable Rate are tracked and disclosed annually against a 2030 target. | [WM 2025 Sustainability Data Center](https://sustainability.wm.com/wp-content/uploads/WM_2025_Data_Center.pdf) | 4 |
| A2 Contextual Sensitivity | 3/5 | Genuine effort to adapt with gaps remaining: distinct programmes for drivers, facility staff and municipal customers, but no differentiated awareness process for fenceline residents documented. | [WM 2025 Sustainability Report](https://sustainability.wm.com/downloads/WM_2025_Sustainability_Report.pdf) | 4 |
| A3 Blind Spot Mitigation | 3/5 | A process exists that has produced findings: the sustainability programme reports against multi-year targets and the FY2025 10-K discloses environmental liabilities and contingencies. No external audit finding acted upon is documented. | [WM FY2025 Form 10-K](https://www.sec.gov/Archives/edgar/data/823768/000110465926012049/wm-20251231x10k.htm) | 4 |
| A4 Signal Amplification | 2/5 | Alternative channels for low-power voices are rarely effective: neighbouring communities’ odour and nuisance concerns have reached the company principally through litigation — Coconut Creek and Deerfield Beach suing over the Monarch Hill expansion, a Texas county suing to close the Hawthorn landfill. | [Wikipedia — Mount Trashmore (Florida)](https://en.wikipedia.org/wiki/Mount_Trashmore_(Florida)) | 3 |
| A5 Anticipatory Awareness | 3/5 | Formal pre-launch assessment for some decisions through permitting and environmental review, but the Monarch Hill expansion proceeded to approval before the affected municipalities’ objections were resolved. | [Waste Dive — Texas county sues to close WM landfill](https://www.wastedive.com/news/houston-texas-hawthorn-landfill-lawsuit-amarillo-fire-roundup/825534/) | 3 |

### EMP: Empathy (Raw 2.4/5 — Scaled 35/100)

| Subdimension | Score | Evidence | Source | Tier |
|-------------|-------|----------|--------|------|
| E1 Affective Resonance | 3/5 | Training and expectation exist and some staff experience it well: employees describe a "people first culture and very safety oriented" environment, but 3.5 of 5 across 4,023 reviews with 62% recommending indicates inconsistency. | [Glassdoor — WM reviews](https://www.glassdoor.com/Reviews/Waste-Management-Reviews-E2094.htm) | 3 |
| E2 Perspective-Taking | 3/5 | At least one formal mechanism used with decisions modified: safety programme design responds to incident data and driver input, and route assignment practice changed for experienced drivers. | [Glassdoor — WM reviews](https://www.glassdoor.com/Reviews/Waste-Management-Reviews-E2094.htm) | 3 |
| E3 Non-Judgment | 2/5 | Non-judgment stated but not measured at the level required. Employee reviews repeatedly cite "poor and biased management," and no disaggregated outcome data by worker group was located. | [Glassdoor — WM reviews](https://www.glassdoor.com/Reviews/Waste-Management-Reviews-E2094.htm) | 3 |
| E4 Validation | 2/5 | Harm reports are met with legal posture before acknowledgment: WM appealed the Arkansas landfill odour suit rather than acknowledging the residents’ account. | [Waste Dive — WM appeals Arkansas odor suit](https://www.wastedive.com/news/republic-offers-tennessee-landfill-settlement-wm-appeals-arkansas-odor-sui/757691/) | 3 |
| E5 Cultural Empathy | 2/5 | Cultural competency training is not documented as required, and no adaptation co-designed with a non-dominant community was located. Scored at the lower anchor with the gap recorded. | [WM 2025 Sustainability Report](https://sustainability.wm.com/downloads/WM_2025_Sustainability_Report.pdf) | 2 |

### ACT: Action (Raw 3.4/5 — Scaled 60/100)

| Subdimension | Score | Evidence | Source | Tier |
|-------------|-------|----------|--------|------|
| AC1 Responsiveness | 3/5 | Response standards are met for most cases with some escalation authority: "Life Critical Rules" give frontline staff stop-work authority, and service standards are contractually defined with municipalities. | [WM — safety ESG hub](https://sustainability.wm.com/esg-hub/social/safety/) | 4 |
| AC2 Proportionality | 3/5 | Needs assessment genuinely informs response in most cases: incident severity drives investigation depth and remediation scale. Unmet need is not published. | [WM — safety ESG hub](https://sustainability.wm.com/esg-hub/social/safety/) | 4 |
| AC3 Efficacy | 4/5 | At least one programme changed because of data, with performance benchmarked externally: WM set a Total Recordable Incident Rate target of 2.0 by 2030 in 2022 and reports outperforming the Bureau of Labor Statistics waste industry average. | [WM — safety ESG hub](https://sustainability.wm.com/esg-hub/social/safety/) | 4 |
| AC4 Resource Mobilization | 4/5 | Documented reallocation reviewed annually against need: more than 3 billion dollars committed to sustainability growth projects from 2022 through 2026, with 12 recycling facilities upgraded or newly built and five renewable natural gas facilities brought online. | [WM 2025 Sustainability Report](https://sustainability.wm.com/downloads/WM_2025_Sustainability_Report.pdf) | 4 |
| AC5 Follow-Through | 3/5 | Defined follow-through protocols for some categories: multi-year remediation and post-closure obligations are tracked and disclosed. No longitudinal community-outcome data published. | [WM FY2025 Form 10-K](https://www.sec.gov/Archives/edgar/data/823768/000110465926012049/wm-20251231x10k.htm) | 4 |

### EQU: Equity (Raw 2.4/5 — Scaled 35/100)

| Subdimension | Score | Evidence | Source | Tier |
|-------------|-------|----------|--------|------|
| EQ1 Universality | 3/5 | Coverage data exists for some populations and outreach is documented through municipal contracts. Coverage equity across served communities is not disaggregated. | [WM 2025 Sustainability Data Center](https://sustainability.wm.com/wp-content/uploads/WM_2025_Data_Center.pdf) | 4 |
| EQ2 Priority for Vulnerable | 2/5 | Priority is stated but allocation does not follow need. The burden of landfill siting falls on specific neighbouring communities, and no published equity analysis of siting or of remediation sequencing was located. | [Waste Dive — Texas county sues to close WM landfill](https://www.wastedive.com/news/houston-texas-hawthorn-landfill-lawsuit-amarillo-fire-roundup/825534/) | 3 |
| EQ3 Bias Awareness | 2/5 | Some disaggregation exists in workforce reporting but disparities are not shown to be investigated with corrective action attached. | [WM 2025 Sustainability Data Center](https://sustainability.wm.com/wp-content/uploads/WM_2025_Data_Center.pdf) | 4 |
| EQ4 Access Design | 3/5 | Barrier mapping completed and barriers removed: recycling facility upgrades and expanded service design improve access to recycling for served households. | [WM 2025 Sustainability Report](https://sustainability.wm.com/downloads/WM_2025_Sustainability_Report.pdf) | 4 |
| EQ5 Historical Harm Acknowledgment | 2/5 | Vague acknowledgment only. WM’s historical liabilities, including the San Jacinto River Waste Pits Superfund site, are disclosed as legal contingencies rather than acknowledged as harms to a named community. | [LegalClarity — Waste Management lawsuits, fraud, fines and settlements](https://legalclarity.org/waste-management-lawsuits-fraud-fines-and-settlements/) | 2 |

### BND: Boundaries (Raw 2.6/5 — Scaled 40/100)

| Subdimension | Score | Evidence | Source | Tier |
|-------------|-------|----------|--------|------|
| B1 Self-Sustainability | 3/5 | Turnover is tracked and at least one structural intervention exists: the "Life Critical Rules" framework plus safety leading-indicator reporting. Employees rate work-life balance 3.4 of 5, which is adequate rather than strong. | [Glassdoor — WM reviews](https://www.glassdoor.com/Reviews/Waste-Management-Reviews-E2094.htm) | 3 |
| B2 Autonomy Preservation | 3/5 | At least one programme designed to build capacity: route ownership and internal progression for drivers who meet performance standards, described by employees as a real path. | [Glassdoor — WM reviews](https://www.glassdoor.com/Reviews/Waste-Management-Reviews-E2094.htm) | 3 |
| B3 Scope Clarity | 3/5 | Scope is communicated at intake and referral routes exist through municipal contracting. Employees report inconsistent communication from managers, which limits this to anchor 3. | [Glassdoor — WM reviews](https://www.glassdoor.com/Reviews/Waste-Management-Reviews-E2094.htm) | 3 |
| B4 Refusal Ethics | 2/5 | Refusals are generally respectful but no structured alternatives process is documented for declined service or declined claims. | [WM 2025 Sustainability Report](https://sustainability.wm.com/downloads/WM_2025_Sustainability_Report.pdf) | 2 |
| B5 Consent Orientation | 2/5 | Consent functions as legal formality in contracting. No consent architecture for affected communities in siting decisions is documented. | [Wikipedia — Mount Trashmore (Florida)](https://en.wikipedia.org/wiki/Mount_Trashmore_(Florida)) | 2 |

### ACC: Accountability (Raw 2.8/5 — Scaled 45/100)

| Subdimension | Score | Evidence | Source | Tier |
|-------------|-------|----------|--------|------|
| AB1 Harm Acknowledgment | 2/5 | Acknowledged only after external establishment, and contested where possible: WM appealed the Arkansas odour suit, and the San Jacinto remediation proceeded only after the EPA issued a unilateral order in May 2026 with estimated costs of 210 to 262 million dollars. | [LegalClarity — Waste Management lawsuits, fraud, fines and settlements](https://legalclarity.org/waste-management-lawsuits-fraud-fines-and-settlements/) | 2 |
| AB2 Correction Willingness | 3/5 | At least one significant course correction on harm evidence: WM settled the High Acres landfill matter in New York for about 2.3 million dollars and settled the Monarch Hill expansion litigation with Coconut Creek and Deerfield Beach in August 2025. | [Waste Dive — WM expected to pay $2.3M in New York landfill settlement](https://www.wastedive.com/news/waste-management-settlement-2-million-high-acres-landfill-ny/581781/) | 3 |
| AB3 Transparency | 4/5 | An annual report including gaps and corrective actions: the 2025 Sustainability Report and separate Data Center publish incident rates, emissions and progress against targets, and the FY2025 10-K discloses environmental contingencies. | [WM 2025 Sustainability Data Center](https://sustainability.wm.com/wp-content/uploads/WM_2025_Data_Center.pdf) | 4 |
| AB4 Systemic Learning | 3/5 | A formal systemic review process with documented systemic changes: the 2022 incident-rate target with annual measurement against an external industry benchmark, and remediation practice changes following settlements. | [WM — safety ESG hub](https://sustainability.wm.com/esg-hub/social/safety/) | 4 |
| AB5 Reparative Action | 2/5 | Repair is largely compelled rather than offered. The 2.3 million dollar New York settlement is real reparative action, but the largest remediation — San Jacinto, 210 to 262 million dollars — began under an EPA unilateral order after documented delays. | [LegalClarity — Waste Management lawsuits, fraud, fines and settlements](https://legalclarity.org/waste-management-lawsuits-fraud-fines-and-settlements/) | 2 |

### SYS: Systemic Thinking (Raw 3.2/5 — Scaled 55/100)

| Subdimension | Score | Evidence | Source | Tier |
|-------------|-------|----------|--------|------|
| S1 Root Cause Orientation | 4/5 | An explicit upstream strategy with documented reduction in downstream need: recycling capacity and renewable natural gas facilities divert material and methane from landfill rather than managing the consequences, backed by more than 3 billion dollars of capital. | [WM 2025 Sustainability Report](https://sustainability.wm.com/downloads/WM_2025_Sustainability_Report.pdf) | 4 |
| S2 Long-Term Impact | 4/5 | Long-term outcome data influences strategy: a 2030 incident-rate target, a 22% reduction in Scope 1 and 2 emissions since 2021, and a 2022-2026 capital programme with published annual progress. | [WM 2025 Sustainability Report](https://sustainability.wm.com/downloads/WM_2025_Sustainability_Report.pdf) | 4 |
| S3 Interconnection Awareness | 3/5 | At least one case of identifying and responding to a cross-system effect: landfill gas capture converts a local emissions externality into energy supply for an adjacent system. | [WM 2025 Sustainability Report](https://sustainability.wm.com/downloads/WM_2025_Sustainability_Report.pdf) | 4 |
| S4 Structural Critique | 2/5 | Structural critique appears in communications but is disconnected from action: WM does not publicly question the waste-generation model that sustains demand for its landfill capacity, and litigates against communities seeking to constrain it. | [Waste Dive — Texas county sues to close WM landfill](https://www.wastedive.com/news/houston-texas-hawthorn-landfill-lawsuit-amarillo-fire-roundup/825534/) | 3 |
| S5 Coalitional Compassion | 3/5 | Active coalition member with documented contributions: participation in recycling infrastructure and renewable natural gas partnerships with municipalities and off-takers. | [WM 2025 Sustainability Report](https://sustainability.wm.com/downloads/WM_2025_Sustainability_Report.pdf) | 4 |

### INT: Integrity (Raw 3/5 — Scaled 50/100)

| Subdimension | Score | Evidence | Source | Tier |
|-------------|-------|----------|--------|------|
| I1 Consistency Under Pressure | 3/5 | At least one case of bearing real cost to keep a commitment: the 2022-2026 sustainability capital programme was sustained at more than 3 billion dollars across changing recycling-commodity economics. | [WM 2025 Sustainability Report](https://sustainability.wm.com/downloads/WM_2025_Sustainability_Report.pdf) | 4 |
| I2 Non-Performance | 3/5 | Some practices maintained regardless of visibility: safety leading-indicator reporting and stop-work authority are internal disciplines with little external reputational return. | [WM — safety ESG hub](https://sustainability.wm.com/esg-hub/social/safety/) | 4 |
| I3 Internal Consistency | 3/5 | Meaningful effort to apply the same values to staff: 3.5 of 5 across 4,023 reviews, 62% recommending, and safety framed as a core value with no compromise. Employees also report biased management and thin training for new hires. | [Glassdoor — WM reviews](https://www.glassdoor.com/Reviews/Waste-Management-Reviews-E2094.htm) | 3 |
| I4 Values Alignment | 3/5 | Values are explicitly considered in some major decisions: capital allocation is tied to published sustainability targets rather than only to returns. | [WM 2025 Sustainability Report](https://sustainability.wm.com/downloads/WM_2025_Sustainability_Report.pdf) | 4 |
| I5 Resilience of Care | 3/5 | Core practices are in policy: the incident-rate target, Life Critical Rules and the reporting architecture are documented commitments rather than leadership preferences. Not yet tested across a leadership transition in the evidence located. | [WM FY2025 Form 10-K](https://www.sec.gov/Archives/edgar/data/823768/000110465926012049/wm-20251231x10k.htm) | 4 |

## Published Index Comparison

**Published index:** fortune-500 | **Published rank:** #19 | **Published composite:** 77.9/100 | **Published band:** Established

| Dimension | Published (raw) | Published (scaled) | Research (raw) | Research (scaled) | Difference (scaled) |
|-----------|----------------|-------------------|----------------|-------------------|---------------------|
| AWR | 4 | 75 | 3 | 50 | -25 |
| EMP | 4 | 75 | 2.4 | 35 | -40 |
| ACT | 4 | 75 | 3.4 | 60 | -15 |
| EQU | 3.5 | 62.5 | 2.4 | 35 | -27.5 |
| BND | 4 | 75 | 2.6 | 40 | -35 |
| ACC | 4 | 75 | 2.8 | 45 | -30 |
| SYS | 4 | 75 | 3.2 | 55 | -20 |
| INT | 3.5 | 62.5 | 3 | 50 | -12.5 |
| **Composite** | — | **77.9** | — | **46.3** | **-31.6** |

**Math-hygiene reconstruction:** the canonical formula applied to the published dimension vector returns 77.9 against a published 77.9 (difference 0). Within the 0.5-point tolerance — no math-hygiene issue.

### Score Difference Analysis

The largest gaps are in **EMP (published 4.0 / 100.0 scaled; research 2.4 / 35.0)** and **EQU (published 3.5 / 83.3; research 2.4 / 35.0)**. A published 4.0 on Empathy asserts a consistent expectation that people feel heard, confirmed by community. What the record shows is that neighbouring communities reach Waste Management through courts: municipalities suing over the Monarch Hill expansion, a Texas county suing to close the Hawthorn landfill, and an Arkansas odour suit WM appealed rather than conceded. **ACC (4.0 to 2.8)** falls because repair is largely compelled — the San Jacinto Superfund remediation began under an EPA unilateral order in May 2026 after documented delays — even though AB3 genuinely scores 4 on disclosure quality. **ACT (4.0 to 3.4) and SYS (4.0 to 3.2) hold up best**, and deservedly: the incident-rate target benchmarked against Bureau of Labor Statistics data and the 3-billion-dollar upstream capital programme are exactly what anchors 4 describe.

### Recommendation

The published 77.9 (Established) is **not supported** by this first measurement, which lands at 46.3 (Functional), a delta of -31.6 across a band boundary. **No change proposal is filed.** The published composite sits in a 11-entity identical-dimension-vector cohort in `site/src/data/indexes/fortune-500.json` (including Agilent Technologies, Ally Financial, Corning, Huntington Bancshares, Hyatt Hotels, IDEXX Laboratories, Jack Henry & Associates and Northwestern Mutual). Byte-identical dimension vectors across 11 unrelated companies in different sectors is the signature of an unassessed seed value, not of measurement. Per anti-false-positive screening rule 5, a shared-artefact gap of this kind is routed to coordinator-level calibration review rather than encoded as a one-off baseline-reset proposal. The measurement is recorded for coordinator calibration review with a full subdimension sidecar. A single-cycle desk review should not unilaterally reset a Fortune 500 baseline by more than 30 points.

## Screening checks (§3e-bis)

1. **Baseline provenance — checked.** `research/APPLIED_CHANGES.md` contains no row for this entity, no assessment files exist on disk, and `research/rotation-state.json` records `last_assessed: null`. The published composite has never been set by an evidence-based assessment.
2. **No "stale baseline" rationale against the record.** The rationale is that the score has never been measured. The history confirms this.
3. **Directionality.** This entity surfaced through staleness-based rotation backfill, not through negative news; the scanner recorded that its individual Tier 1 search produced no evidence for this cycle. The measurement below is therefore a cold first baseline built from the entity's own disclosures, regulator and court records, and employee testimony — searched for positive and negative evidence alike. No movement is taken on absence of harm.
4. **Rationale-versus-history consistency.** There is no prior finding for this to contradict.
5. **Calibration handling — THIS IS THE OPERATIVE RULE TONIGHT.** The published composite sits in a 11-entity identical-dimension-vector cohort in `site/src/data/indexes/fortune-500.json` (including Agilent Technologies, Ally Financial, Corning, Huntington Bancshares, Hyatt Hotels, IDEXX Laboratories, Jack Henry & Associates and Northwestern Mutual). Byte-identical dimension vectors across 11 unrelated companies in different sectors is the signature of an unassessed seed value, not of measurement. Per anti-false-positive screening rule 5, a shared-artefact gap of this kind is routed to coordinator-level calibration review rather than encoded as a one-off baseline-reset proposal. **No change proposal is filed.** The measurement is recorded on disk with a full subdimension sidecar so it is auditable and reusable, and the gap is surfaced to the coordinator as a `flag-for-review` finding in `research/scans/2026-09-22-assessor-summary.json`.
6. **Confidence discipline.** A single-cycle desk review is not a sufficient basis for a 25-to-35-point unilateral reset of a Fortune 500 entity. The recommendation is `flag-for-review`, not `downgrade`.

## Key Findings

- Waste Management measures its own safety honestly and publishes the numbers. It set a Total Recordable Incident Rate target of 2.0 by 2030 back in 2022 and reports beating the Bureau of Labor Statistics average for the waste industry — an externally benchmarked claim, not a slogan.
- It invests upstream at real scale: more than 3 billion dollars in sustainability projects from 2022 through 2026, 12 recycling facilities built or upgraded, five renewable natural gas plants online, and Scope 1 and 2 emissions down 22% since 2021.
- The people who live next to its landfills mostly reach it through lawsuits. Coconut Creek and Deerfield Beach sued over the Monarch Hill expansion in February 2025, a Texas county sued to close the Hawthorn landfill, and WM appealed an Arkansas odour suit rather than acknowledging the residents’ account.
- Its largest single act of repair was compelled, not offered. The EPA issued a unilateral order in May 2026 requiring remediation of the San Jacinto River Waste Pits Superfund site, at an estimated 210 to 262 million dollars, after documented delays in approving a plan.
- The published score of 77.9 is not a measurement. It is byte-identical across 11 unrelated Fortune 500 companies in different sectors, which makes it a seed value; this assessment records a first real measurement and routes the gap to calibration review rather than filing a one-off reset.

## Strongest Dimensions

**ACT (3.4 raw)** and **SYS (3.2)**. AC3, AC4, S1 and S2 all score 4. WM measures outcomes against an external benchmark, moves capital at a scale proportionate to the problem, and aims it at diverting waste rather than only burying it.

## Weakest Dimensions

**EMP (2.4 raw)** and **EQU (2.4)**. Both are driven by the same structural fact: the communities bearing the concentrated burden of landfill siting have no effective channel into the company short of litigation, and no published equity analysis of siting or remediation sequencing exists.

## Evidence Gaps

- The 2025 Sustainability Report’s social and human-rights sections were identified but not read in full, which holds E5, EQ3 and EQ5 at lower anchors with the gap recorded.
- No community testimony from fenceline residents was located beyond litigation filings, which limits E1 and A4.
- No union or collective-bargaining evidence specific to WM was located; the 2025 Teamsters sanitation strike was against Republic Services, a different company, and is not scored here.
- Landfill-by-landfill environmental justice demographics were not obtained, which caps EQ2 at 2 on absence rather than on a finding.

## Recommended Next Steps

- **Functional/Established**: Consider [Advisory Support](/advisory) to translate benchmark insights into strategic action.

## Sources

- [WM 2025 Sustainability Data Center](https://sustainability.wm.com/wp-content/uploads/WM_2025_Data_Center.pdf)
- [WM 2025 Sustainability Report](https://sustainability.wm.com/downloads/WM_2025_Sustainability_Report.pdf)
- [WM FY2025 Form 10-K](https://www.sec.gov/Archives/edgar/data/823768/000110465926012049/wm-20251231x10k.htm)
- [Wikipedia — Mount Trashmore (Florida)](https://en.wikipedia.org/wiki/Mount_Trashmore_(Florida))
- [Waste Dive — Texas county sues to close WM landfill](https://www.wastedive.com/news/houston-texas-hawthorn-landfill-lawsuit-amarillo-fire-roundup/825534/)
- [Glassdoor — WM reviews](https://www.glassdoor.com/Reviews/Waste-Management-Reviews-E2094.htm)
- [Waste Dive — WM appeals Arkansas odor suit](https://www.wastedive.com/news/republic-offers-tennessee-landfill-settlement-wm-appeals-arkansas-odor-sui/757691/)
- [WM — safety ESG hub](https://sustainability.wm.com/esg-hub/social/safety/)
- [LegalClarity — Waste Management lawsuits, fraud, fines and settlements](https://legalclarity.org/waste-management-lawsuits-fraud-fines-and-settlements/)
- [Waste Dive — WM expected to pay $2.3M in New York landfill settlement](https://www.wastedive.com/news/waste-management-settlement-2-million-high-acres-landfill-ny/581781/)

---

*This assessment is based on publicly available information and does not constitute a formal Compassion Benchmark Certified Assessment. For a comprehensive, assessor-led evaluation, visit compassionbenchmark.com/certified-assessments.*
