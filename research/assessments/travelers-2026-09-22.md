---
entity: "Travelers"
type: "Company"
sector: "Insurance"
date: "2026-09-22"
composite_score: 48.1
band: "Functional"
scores:
  AWR: 3.4
  EMP: 2.4
  ACT: 3.2
  EQU: 2.6
  BND: 2.4
  ACC: 2.8
  SYS: 3.6
  INT: 3
published_index: "fortune-500"
published_rank: 51
published_composite: 60.9
published_band: "Established"
published_dimensions:
  AWR: 3.5
  EMP: 3.5
  ACT: 3.5
  EQU: 3
  BND: 3.5
  ACC: 3.5
  SYS: 3.5
  INT: 3.5
assessed_composite: 48.1
score_delta: -12.8
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
watch_flag: "Re-test AB1, E4 and B3 on the outcome of the March 2026 bad-faith action in the Southern District of Illinois (currently an allegation, not scored), and re-test AC1/EQ4 when the Travelers Institute availability-and-affordability initiative publishes measurable results rather than convenings."
calibration_flag: "The published composite sits in a 19-entity identical-dimension-vector cohort in `site/src/data/indexes/fortune-500.json` (including A.O. Smith, ADP, Aon, Ball Corporation, Dell Technologies, Erie Indemnity, ManpowerGroup and Marsh & McLennan). Byte-identical dimension vectors across 19 unrelated companies in different sectors is the signature of an unassessed seed value, not of measurement. Per anti-false-positive screening rule 5, a shared-artefact gap of this kind is routed to coordinator-level calibration review rather than encoded as a one-off baseline-reset proposal."
---

# Compassion Benchmark Assessment: Travelers

**Entity type:** Company  
**Sector/Domain:** Insurance  
**Assessment date:** 2026-09-22  
**Composite score:** 48.1/100  
**Band:** Functional  
**Cycle:** nightly, lookback 2026-09-08 to 2026-09-22 (scan `research/scans/2026-09-22.json`, source: rotation)  
**Outcome:** first formal evidence-based baseline; measurement recorded, routed to calibration review (recommendation: flag-for-review)

## Why this entity was assessed

Travelers was drawn from the scanner’s staleness-based rotation backfill: never assessed (`last_assessed: null`, zero files under `research/assessments/travelers-*.md`), and its individual Tier 1 search this cycle surfaced no in-window news evidence. This cycle produces a cold first baseline.

## Evidence-date and attribution checks

**No in-window event.** Nothing dated between 2026-09-08 and 2026-09-22 was located, so nothing is scored as a recency event.

**Allegation discipline.** A bad-faith action filed in March 2026 in the Southern District of Illinois seeking more than 3.5 billion dollars, alleging Travelers abandoned its insured, is an **allegation** and is **not** scored as a finding. What is scored are two *settled* class actions where the practice at issue is established by the settlement itself.

**Attribution.** Rising catastrophe losses and the wider property-casualty affordability crisis are market conditions, not Travelers’ conduct. What is scored is Travelers’ own response to them.

## Score Summary

| Dimension | Code | Raw (1-5) | Scaled (0-100) | Band |
|-----------|------|-----------|----------------|------|
| Awareness | AWR | 3.4 | 60 | Functional |
| Empathy | EMP | 2.4 | 35 | Developing |
| Action | ACT | 3.2 | 55 | Functional |
| Equity | EQU | 2.6 | 40 | Developing |
| Boundaries | BND | 2.4 | 35 | Developing |
| Accountability | ACC | 2.8 | 45 | Functional |
| Systemic Thinking | SYS | 3.6 | 65 | Established |
| Integrity | INT | 3 | 50 | Functional |
| **Composite** | — | — | **48.1** | **Functional** |

**Composite derivation (canonical formula, methodology v1.2, `site/scripts/lib/scoring.mjs::computeCompositeFromDimensions`):** mean of the 8 raw dimension scores = 2.925; baseComposite = 48.13; dimensions below 4.0 = 8; integration premium applied by the canonical function. Final composite **48.1** (Functional).

## Dimension Details

### AWR: Awareness (Raw 3.4/5 — Scaled 60/100)

| Subdimension | Score | Evidence | Source | Tier |
|-------------|-------|----------|--------|------|
| A1 Suffering Detection | 4/5 | Multiple channels with formal pathways and regular review: Customer Experience, Disaster Preparedness and Response and Safety and Health are named and reported value drivers, with wildfire claims response documented in the 2025 report. | [Insurance Business — Travelers sustainability report highlights wildfire claims response](https://www.insurancebusinessmag.com/us/news/catastrophe/travelers-sustainability-report-highlights-ai-push-wildfire-claims-response-581447.aspx) | 3 |
| A2 Contextual Sensitivity | 3/5 | Genuine effort to adapt with gaps: differentiated approaches for personal, small-commercial and large-commercial insureds, and catastrophe-specific response protocols. No differentiated process for low-income policyholders documented. | [Travelers 2025 Sustainability Report](https://sustainability.travelers.com/) | 4 |
| A3 Blind Spot Mitigation | 3/5 | A process exists that has produced findings: the sustainability report reviews 16 named value drivers annually, and the availability-and-affordability work names a gap the industry had not been addressing. | [Travelers — property casualty availability and affordability](https://sustainability.travelers.com/illustrative-initiatives/property-casualty-availability-affordability) | 4 |
| A4 Signal Amplification | 3/5 | Designated structures with some reach: the Travelers Institute convenes policymakers, agents, brokers, carriers and consumers on affordability — consumers are named participants rather than subjects. | [Travelers — property casualty availability and affordability](https://sustainability.travelers.com/illustrative-initiatives/property-casualty-availability-affordability) | 4 |
| A5 Anticipatory Awareness | 4/5 | Anticipatory assessment required for major decisions and consulting outside communities: the Travelers Institute launched a multiyear initiative in September 2025 specifically to examine how insurance becomes unavailable or unaffordable before that failure fully manifests. | [Travelers — property casualty availability and affordability](https://sustainability.travelers.com/illustrative-initiatives/property-casualty-availability-affordability) | 4 |

### EMP: Empathy (Raw 2.4/5 — Scaled 35/100)

| Subdimension | Score | Evidence | Source | Tier |
|-------------|-------|----------|--------|------|
| E1 Affective Resonance | 3/5 | Training and expectation exist and some staff do this well: catastrophe response is organised around presence with affected policyholders. Inconsistent, given two settled class actions over systematic underpayment. | [Insurance Business — Travelers sustainability report highlights wildfire claims response](https://www.insurancebusinessmag.com/us/news/catastrophe/travelers-sustainability-report-highlights-ai-push-wildfire-claims-response-581447.aspx) | 3 |
| E2 Perspective-Taking | 3/5 | At least one formal mechanism used with a decision modified: the Travelers Institute initiative was designed around consumer and agent input on affordability. | [Travelers — property casualty availability and affordability](https://sustainability.travelers.com/illustrative-initiatives/property-casualty-availability-affordability) | 4 |
| E3 Non-Judgment | 2/5 | Non-judgment stated but not measured. No disaggregated claims-outcome data by policyholder group was located, and the settled UM/UIM exclusion practice applied categorically rather than case by case. | [ClaimDepot — Travelers denied insurance claims class action settlement](https://www.claimdepot.com/settlements/frazer-settlement) | 3 |
| E4 Validation | 2/5 | Harm reports met with legal review before acknowledgment. Travelers paid 1 million dollars to settle allegations that it denied uninsured and underinsured motorist claims on household and regular-use exclusions, and settled a New Jersey action over paying personal injury protection claimants less than their policy limits. | [Top Class Actions — Travelers personal injury protection class action settlement](https://topclassactions.com/lawsuit-settlements/closed-settlements/travelers-personal-injury-protection-class-action-settlement/) | 3 |
| E5 Cultural Empathy | 2/5 | Cultural competency is not documented as required and no adaptation co-designed with a non-dominant community was located. Scored at the lower anchor with the gap recorded. | [Travelers 2025 Sustainability Report](https://sustainability.travelers.com/) | 2 |

### ACT: Action (Raw 3.2/5 — Scaled 55/100)

| Subdimension | Score | Evidence | Source | Tier |
|-------------|-------|----------|--------|------|
| AC1 Responsiveness | 3/5 | Standards are met for most cases with escalation authority in catastrophe events, evidenced by the documented wildfire claims response. Response data is not published disaggregated. | [Insurance Business — Travelers sustainability report highlights wildfire claims response](https://www.insurancebusinessmag.com/us/news/catastrophe/travelers-sustainability-report-highlights-ai-push-wildfire-claims-response-581447.aspx) | 3 |
| AC2 Proportionality | 3/5 | Needs assessment genuinely informs response in most cases through catastrophe triage and severity-based claim handling. Against this, two settlements establish that some payments were calibrated to policy mechanics rather than to loss. | [ClaimDepot — Travelers denied insurance claims class action settlement](https://www.claimdepot.com/settlements/frazer-settlement) | 3 |
| AC3 Efficacy | 3/5 | Outcome data reviewed annually with at least one programme modified: the 2025 report reviews all 16 value drivers and the claims-handling practices at issue in both class actions were changed through settlement. | [Travelers press release — 2025 Sustainability Report](https://investor.travelers.com/newsroom/press-releases/news-details/2026/Travelers-Publishes-Its-2025-Sustainability-Report/default.aspx) | 4 |
| AC4 Resource Mobilization | 4/5 | Documented reallocation reviewed annually against need: approximately 24 million dollars given to local communities by Travelers and the Travelers Foundation, with more than 125,000 employee volunteer hours logged. | [Travelers — our giving priorities](https://sustainability.travelers.com/drivers-of-sustained-value/community/our-giving-priorities) | 4 |
| AC5 Follow-Through | 3/5 | Defined follow-through protocols: the Travelers Institute initiative is explicitly multiyear rather than a single convening, and catastrophe recovery support extends past initial claim payment. | [Travelers — property casualty availability and affordability](https://sustainability.travelers.com/illustrative-initiatives/property-casualty-availability-affordability) | 4 |

### EQU: Equity (Raw 2.6/5 — Scaled 40/100)

| Subdimension | Score | Evidence | Source | Tier |
|-------------|-------|----------|--------|------|
| EQ1 Universality | 3/5 | Coverage data exists for some populations with documented outreach attempts, and the affordability initiative is aimed squarely at people being priced out of cover. Coverage gaps are not published. | [Travelers — property casualty availability and affordability](https://sustainability.travelers.com/illustrative-initiatives/property-casualty-availability-affordability) | 4 |
| EQ2 Priority for Vulnerable | 3/5 | At least one documented prioritisation decision: giving priorities direct community investment toward specified need areas rather than distributing pro rata. | [Travelers — our giving priorities](https://sustainability.travelers.com/drivers-of-sustained-value/community/our-giving-priorities) | 4 |
| EQ3 Bias Awareness | 2/5 | Some disaggregation exists in the Diversity and Inclusion value driver but disparities are not shown to be investigated with corrective action attached. | [Travelers 2025 Sustainability Report](https://sustainability.travelers.com/) | 4 |
| EQ4 Access Design | 3/5 | Barrier mapping completed and barriers addressed: the availability-and-affordability programme identifies the specific mechanisms that put property-casualty cover out of reach and works on them with regulators and agents. | [Travelers — property casualty availability and affordability](https://sustainability.travelers.com/illustrative-initiatives/property-casualty-availability-affordability) | 4 |
| EQ5 Historical Harm Acknowledgment | 2/5 | Vague acknowledgment only. No formal acknowledgment of a specific historical harm was located. | [Travelers 2025 Sustainability Report](https://sustainability.travelers.com/) | 2 |

### BND: Boundaries (Raw 2.4/5 — Scaled 35/100)

| Subdimension | Score | Evidence | Source | Tier |
|-------------|-------|----------|--------|------|
| B1 Self-Sustainability | 3/5 | At least one structural intervention and evidence of use: Human Capital Management and Safety and Health are reported value drivers, and more than 150 employees hold civic leadership positions as of May 2026, which implies real discretionary capacity. | [Travelers — our giving priorities](https://sustainability.travelers.com/drivers-of-sustained-value/community/our-giving-priorities) | 4 |
| B2 Autonomy Preservation | 3/5 | At least one programme designed to build capacity and exit: loss-prevention and risk-mitigation services aim to stop claims happening rather than to keep policyholders dependent on claims handling. | [Travelers 2025 Sustainability Report](https://sustainability.travelers.com/) | 4 |
| B3 Scope Clarity | 2/5 | Scope overstated, with limitations discovered only after investment. Both settled class actions turn on policy mechanics — household and regular-use exclusions, and personal injury protection limit treatment — that policyholders did not understand until they claimed. | [ClaimDepot — Travelers denied insurance claims class action settlement](https://www.claimdepot.com/settlements/frazer-settlement) | 3 |
| B4 Refusal Ethics | 2/5 | Refusals are procedurally respectful but no structured alternatives process for declined or reduced claims is documented, and no warm-referral rate is published. | [Top Class Actions — Travelers personal injury protection class action settlement](https://topclassactions.com/lawsuit-settlements/closed-settlements/travelers-personal-injury-protection-class-action-settlement/) | 3 |
| B5 Consent Orientation | 2/5 | Consent functions as legal formality: the exclusions at issue in the 1 million dollar settlement were policy terms rather than informed choices, and no verification that consent was genuinely informed is documented. | [ClaimDepot — Travelers denied insurance claims class action settlement](https://www.claimdepot.com/settlements/frazer-settlement) | 3 |

### ACC: Accountability (Raw 2.8/5 — Scaled 45/100)

| Subdimension | Score | Evidence | Source | Tier |
|-------------|-------|----------|--------|------|
| AB1 Harm Acknowledgment | 2/5 | Acknowledged only after external establishment: both practices were changed through class-action settlement, and the March 2026 bad-faith action is being contested. | [Salvi, Schostok & Pritchard — bad faith lawsuit against Travelers](https://www.salvilaw.com/press-release/travelers-bad-faith-lawsuit-dry-ice-death/) | 2 |
| AB2 Correction Willingness | 3/5 | At least one significant course correction based on harm evidence: Travelers settled the Pennsylvania UM/UIM denial class action with final approval on 20 August 2025 and the New Jersey personal injury protection class action with final approval on 17 April 2026, changing the practices at issue. | [Top Class Actions — Travelers personal injury protection class action settlement](https://topclassactions.com/lawsuit-settlements/closed-settlements/travelers-personal-injury-protection-class-action-settlement/) | 3 |
| AB3 Transparency | 4/5 | An annual report including gaps and corrective actions: the 2025 Sustainability Report reviews 16 named value drivers including Ethics and Responsible Business Practices and Governance Practices, alongside SEC filings disclosing litigation. | [Travelers press release — 2025 Sustainability Report](https://investor.travelers.com/newsroom/press-releases/news-details/2026/Travelers-Publishes-Its-2025-Sustainability-Report/default.aspx) | 4 |
| AB4 Systemic Learning | 2/5 | Some post-incident review that rarely translates into systemic change: two class actions of the same type — claimants paid less than their entitlement through policy mechanics — resolved roughly eight months apart. | [Travelers Form 10-Q, Q1 2026](https://www.sec.gov/Archives/edgar/data/86312/000008631226000111/trv-20260331.htm) | 4 |
| AB5 Reparative Action | 3/5 | At least one case of reparative action the harmed parties treated as meaningful: a 1 million dollar settlement fund distributed to the Pennsylvania class, and a claims process with a June 2026 deadline for the New Jersey class. | [ClaimDepot — Travelers denied insurance claims class action settlement](https://www.claimdepot.com/settlements/frazer-settlement) | 3 |

### SYS: Systemic Thinking (Raw 3.6/5 — Scaled 65/100)

| Subdimension | Score | Evidence | Source | Tier |
|-------------|-------|----------|--------|------|
| S1 Root Cause Orientation | 4/5 | Explicit root-cause strategy with resources behind it: the availability-and-affordability initiative addresses why property-casualty cover becomes unobtainable, which is the upstream cause of uninsured loss rather than a symptom of it. | [Travelers — property casualty availability and affordability](https://sustainability.travelers.com/illustrative-initiatives/property-casualty-availability-affordability) | 4 |
| S2 Long-Term Impact | 4/5 | Long-term outcome data influencing strategy: Scope 1 and 2 emissions from owned operations cut 54% since 2011 against a 2030 carbon-neutrality target, with a named multiyear affordability programme. | [Travelers press release — 2025 Sustainability Report](https://investor.travelers.com/newsroom/press-releases/news-details/2026/Travelers-Publishes-Its-2025-Sustainability-Report/default.aspx) | 4 |
| S3 Interconnection Awareness | 3/5 | At least one case of identifying and responding to a cross-system effect: the affordability work explicitly maps the interaction between regulation, agent and broker distribution, carrier capacity and consumer outcomes. | [Travelers — property casualty availability and affordability](https://sustainability.travelers.com/illustrative-initiatives/property-casualty-availability-affordability) | 4 |
| S4 Structural Critique | 4/5 | Active advocacy documented, taking positions against short-term interest: a carrier convening policymakers and consumers on insurance availability and affordability is arguing for constraints on its own pricing freedom. | [Travelers — property casualty availability and affordability](https://sustainability.travelers.com/illustrative-initiatives/property-casualty-availability-affordability) | 4 |
| S5 Coalitional Compassion | 3/5 | Active coalition member with documented contributions: the Institute initiative pools agents, brokers, carriers, regulators and consumer bodies rather than acting alone. | [Travelers — property casualty availability and affordability](https://sustainability.travelers.com/illustrative-initiatives/property-casualty-availability-affordability) | 4 |

### INT: Integrity (Raw 3/5 — Scaled 50/100)

| Subdimension | Score | Evidence | Source | Tier |
|-------------|-------|----------|--------|------|
| I1 Consistency Under Pressure | 3/5 | At least one case of bearing real cost to maintain a commitment: sustaining roughly 24 million dollars in community giving and a public affordability programme through a period of elevated catastrophe losses. | [Travelers — our giving priorities](https://sustainability.travelers.com/drivers-of-sustained-value/community/our-giving-priorities) | 4 |
| I2 Non-Performance | 3/5 | Some practices maintained regardless of visibility: more than 125,000 employee volunteer hours and more than 150 employees serving as firefighters, first responders, election officials and zoning commissioners are low-visibility civic work. | [Travelers — our giving priorities](https://sustainability.travelers.com/drivers-of-sustained-value/community/our-giving-priorities) | 4 |
| I3 Internal Consistency | 3/5 | Meaningful effort to apply the same values to staff: Human Capital Management is a reported value driver and the civic-service participation figures indicate genuine encouragement rather than policy language. | [Travelers — our giving priorities](https://sustainability.travelers.com/drivers-of-sustained-value/community/our-giving-priorities) | 4 |
| I4 Values Alignment | 3/5 | Values explicitly considered in some major decisions: the 2025 report ties strategy to named drivers including ethics and public policy. Against this, the settled claims practices contradicted stated customer-experience commitments. | [Travelers press release — 2025 Sustainability Report](https://investor.travelers.com/newsroom/press-releases/news-details/2026/Travelers-Publishes-Its-2025-Sustainability-Report/default.aspx) | 4 |
| I5 Resilience of Care | 3/5 | Core practices in policy: the Foundation, the Institute and the emissions target are institutional structures with multi-year track records spanning leadership changes. | [Travelers 2025 Sustainability Report](https://sustainability.travelers.com/) | 4 |

## Published Index Comparison

**Published index:** fortune-500 | **Published rank:** #51 | **Published composite:** 60.9/100 | **Published band:** Established

| Dimension | Published (raw) | Published (scaled) | Research (raw) | Research (scaled) | Difference (scaled) |
|-----------|----------------|-------------------|----------------|-------------------|---------------------|
| AWR | 3.5 | 62.5 | 3.4 | 60 | -2.5 |
| EMP | 3.5 | 62.5 | 2.4 | 35 | -27.5 |
| ACT | 3.5 | 62.5 | 3.2 | 55 | -7.5 |
| EQU | 3 | 50 | 2.6 | 40 | -10 |
| BND | 3.5 | 62.5 | 2.4 | 35 | -27.5 |
| ACC | 3.5 | 62.5 | 2.8 | 45 | -17.5 |
| SYS | 3.5 | 62.5 | 3.6 | 65 | +2.5 |
| INT | 3.5 | 62.5 | 3 | 50 | -12.5 |
| **Composite** | — | **60.9** | — | **48.1** | **-12.8** |

**Math-hygiene reconstruction:** the canonical formula applied to the published dimension vector returns 60.9 against a published 60.9 (difference 0). Within the 0.5-point tolerance — no math-hygiene issue.

### Score Difference Analysis

This is the closest match of the five rotation entities, and the direction of the gaps is informative. **SYS comes out slightly ABOVE the published value (published 3.5 / 83.3 scaled; research 3.6 / 86.7)**, because the Travelers Institute availability-and-affordability initiative is genuine structural work: S1 and S4 both score 4, since a carrier arguing publicly about why cover becomes unobtainable is arguing against its own short-term pricing freedom. **AWR holds close (3.5 to 3.4).** The gaps are in **EMP (3.5 / 83.3 to 2.4 / 35.0)** and **BND (3.5 / 83.3 to 2.4 / 35.0)**, and both trace to the same two facts: Travelers settled a Pennsylvania class action over denying uninsured and underinsured motorist claims on household and regular-use exclusions, and a New Jersey action over paying personal injury protection claimants less than their limits. Both concern policy mechanics the policyholder did not understand until the moment of loss, which is exactly what B3 (scope clarity) and E4 (validation) measure.

### Recommendation

The published 60.9 (Established) is **overstated** by this first measurement of 48.1 (Functional), a delta of -12.8 across a band boundary. **No change proposal is filed.** The published composite sits in a 19-entity identical-dimension-vector cohort in `site/src/data/indexes/fortune-500.json` (including A.O. Smith, ADP, Aon, Ball Corporation, Dell Technologies, Erie Indemnity, ManpowerGroup and Marsh & McLennan). Byte-identical dimension vectors across 19 unrelated companies in different sectors is the signature of an unassessed seed value, not of measurement. Per anti-false-positive screening rule 5, a shared-artefact gap of this kind is routed to coordinator-level calibration review rather than encoded as a one-off baseline-reset proposal. Of the five rotation entities assessed tonight this is the smallest gap and the one where the published value is closest to defensible; a coordinator reviewing the cohort may reasonably conclude Travelers needs the least adjustment.

## Screening checks (§3e-bis)

1. **Baseline provenance — checked.** `research/APPLIED_CHANGES.md` contains no row for this entity, no assessment files exist on disk, and `research/rotation-state.json` records `last_assessed: null`. The published composite has never been set by an evidence-based assessment.
2. **No "stale baseline" rationale against the record.** The rationale is that the score has never been measured. The history confirms this.
3. **Directionality.** This entity surfaced through staleness-based rotation backfill, not through negative news; the scanner recorded that its individual Tier 1 search produced no evidence for this cycle. The measurement below is therefore a cold first baseline built from the entity's own disclosures, regulator and court records, and employee testimony — searched for positive and negative evidence alike. No movement is taken on absence of harm.
4. **Rationale-versus-history consistency.** There is no prior finding for this to contradict.
5. **Calibration handling — THIS IS THE OPERATIVE RULE TONIGHT.** The published composite sits in a 19-entity identical-dimension-vector cohort in `site/src/data/indexes/fortune-500.json` (including A.O. Smith, ADP, Aon, Ball Corporation, Dell Technologies, Erie Indemnity, ManpowerGroup and Marsh & McLennan). Byte-identical dimension vectors across 19 unrelated companies in different sectors is the signature of an unassessed seed value, not of measurement. Per anti-false-positive screening rule 5, a shared-artefact gap of this kind is routed to coordinator-level calibration review rather than encoded as a one-off baseline-reset proposal. **No change proposal is filed.** The measurement is recorded on disk with a full subdimension sidecar so it is auditable and reusable, and the gap is surfaced to the coordinator as a `flag-for-review` finding in `research/scans/2026-09-22-assessor-summary.json`.
6. **Confidence discipline.** A single-cycle desk review is not a sufficient basis for a 25-to-35-point unilateral reset of a Fortune 500 entity. The recommendation is `flag-for-review`, not `downgrade`.

## Key Findings

- Travelers works on a problem most insurers would rather not name. In September 2025 the Travelers Institute launched a multiyear initiative on whether property and casualty insurance is available and affordable at all — which means arguing in public about constraints on its own pricing freedom.
- Its community and civic numbers are unusually concrete: about 24 million dollars given by Travelers and the Travelers Foundation, more than 125,000 employee volunteer hours, and more than 150 employees serving as firefighters, first responders, election officials or zoning commissioners as of May 2026.
- It has twice settled class actions over paying claimants less than they were owed. A Pennsylvania case over denying uninsured and underinsured motorist claims on household and regular-use exclusions settled for 1 million dollars in August 2025, and a New Jersey case over personal injury protection payments below policy limits received final approval in April 2026.
- Both settled cases turn on policy terms customers did not understand until they claimed, which is why the Boundaries score is low: an insurance contract whose limits are discovered at the moment of loss is a scope-clarity failure.
- A bad-faith action filed in March 2026 seeking more than 3.5 billion dollars is an allegation and is not scored. So is the wider affordability crisis, which is a market condition rather than this company’s conduct.

## Strongest Dimensions

**SYS (3.6 raw)**, which comes out marginally above the published value, and **AWR (3.4)**. S1, S4 and A5 all score 4: Travelers anticipates the failure of insurance availability before it fully arrives and advocates publicly on it.

## Weakest Dimensions

**EMP (2.4 raw)** and **BND (2.4)**. Two settled class actions establish that some claimants were systematically paid less than their entitlement through policy mechanics they had no realistic way to understand in advance.

## Evidence Gaps

- The 2025 Sustainability Report’s full text across all 16 value drivers was not read; the Customer Experience and Diversity and Inclusion sections could move E1, E3 and EQ3.
- No Glassdoor or employee-sentiment data was gathered for Travelers this cycle, so B1, I3 and E1 rest on company disclosure and civic-participation figures rather than on staff testimony.
- No state market-conduct examination findings for Travelers were located this cycle, which would be the strongest available evidence on AC1 and E4.
- Claims-outcome data disaggregated by policyholder income or geography is not published, which caps EQ3 at 2 on absence rather than on a finding.

## Recommended Next Steps

- **Functional/Established**: Consider [Advisory Support](/advisory) to translate benchmark insights into strategic action.

## Sources

- [Insurance Business — Travelers sustainability report highlights wildfire claims response](https://www.insurancebusinessmag.com/us/news/catastrophe/travelers-sustainability-report-highlights-ai-push-wildfire-claims-response-581447.aspx)
- [Travelers 2025 Sustainability Report](https://sustainability.travelers.com/)
- [Travelers — property casualty availability and affordability](https://sustainability.travelers.com/illustrative-initiatives/property-casualty-availability-affordability)
- [ClaimDepot — Travelers denied insurance claims class action settlement](https://www.claimdepot.com/settlements/frazer-settlement)
- [Top Class Actions — Travelers personal injury protection class action settlement](https://topclassactions.com/lawsuit-settlements/closed-settlements/travelers-personal-injury-protection-class-action-settlement/)
- [Travelers press release — 2025 Sustainability Report](https://investor.travelers.com/newsroom/press-releases/news-details/2026/Travelers-Publishes-Its-2025-Sustainability-Report/default.aspx)
- [Travelers — our giving priorities](https://sustainability.travelers.com/drivers-of-sustained-value/community/our-giving-priorities)
- [Salvi, Schostok & Pritchard — bad faith lawsuit against Travelers](https://www.salvilaw.com/press-release/travelers-bad-faith-lawsuit-dry-ice-death/)
- [Travelers Form 10-Q, Q1 2026](https://www.sec.gov/Archives/edgar/data/86312/000008631226000111/trv-20260331.htm)

---

*This assessment is based on publicly available information and does not constitute a formal Compassion Benchmark Certified Assessment. For a comprehensive, assessor-led evaluation, visit compassionbenchmark.com/certified-assessments.*
