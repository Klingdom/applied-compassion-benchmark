---
entity: "SEI Investments"
type: "Company"
sector: "Financial services"
date: "2026-09-22"
composite_score: 31.3
band: "Developing"
scores:
  AWR: 2.4
  EMP: 2
  ACT: 2.4
  EQU: 2
  BND: 2.2
  ACC: 2.4
  SYS: 2.6
  INT: 2
published_index: "fortune-500"
published_rank: 49
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
assessed_composite: 31.3
score_delta: -29.6
band_change: true
filing_trigger_met: false
outcome: "first formal evidence-based baseline; measurement recorded, routed to calibration review"
assessment_type: "full 40-subdimension first baseline (rotation backfill)"
recommendation: "flag-for-review"
change_proposal: false
confidence: "low"
subdim_sidecar: true
methodology_version: "v1.2"
source: "rotation"
scan_file: "research/scans/2026-09-22.json"
watch_flag: "Re-test AB3 immediately if SEI Investments publishes a corporate sustainability report for 2024, 2025 or 2026 — the most recent located is for 2023, and a resumed report would raise transparency materially. Re-test E1, E3 and I3 against any independent workplace survey."
calibration_flag: "The published composite sits in a 19-entity identical-dimension-vector cohort in `site/src/data/indexes/fortune-500.json` (including A.O. Smith, ADP, Aon, Ball Corporation, Dell Technologies, Erie Indemnity, ManpowerGroup and Marsh & McLennan). Byte-identical dimension vectors across 19 unrelated companies in different sectors is the signature of an unassessed seed value, not of measurement. Per anti-false-positive screening rule 5, a shared-artefact gap of this kind is routed to coordinator-level calibration review rather than encoded as a one-off baseline-reset proposal."
---

# Compassion Benchmark Assessment: SEI Investments

**Entity type:** Company  
**Sector/Domain:** Financial services  
**Assessment date:** 2026-09-22  
**Composite score:** 31.3/100  
**Band:** Developing  
**Cycle:** nightly, lookback 2026-09-08 to 2026-09-22 (scan `research/scans/2026-09-22.json`, source: rotation)  
**Outcome:** first formal evidence-based baseline; measurement recorded, routed to calibration review (recommendation: flag-for-review)

## Why this entity was assessed

SEI Investments was drawn from the scanner’s staleness-based rotation backfill: never assessed (`last_assessed: null`, zero files under `research/assessments/sei-investments-*.md`), and its individual Tier 1 search this cycle surfaced no in-window news evidence. This cycle produces a cold first baseline.

## Evidence-date and attribution checks

**No in-window event.** Nothing dated between 2026-09-08 and 2026-09-22 was located, so nothing is scored as a recency event.

**Confidence is explicitly low.** This is the thinnest evidence base of the five rotation entities. SEI Investments is a business-to-business asset and wealth management infrastructure provider with roughly 5,000 employees, which means it has fewer public-facing compassion-relevant touchpoints than the insurers and less disclosure than the two industrial companies. Several subdimensions are scored at lower anchors on absence of evidence rather than on adverse findings, and every one of those is listed in the evidence gaps.

**Entity disambiguation.** Search results repeatedly surfaced the Stockholm Environment Institute (also "SEI") and its 2025 annual report. Those are a different organisation and are excluded. Only SEI Investments Company (NASDAQ: SEIC, Oaks, Pennsylvania) is scored.

**Allegation versus finding.** The ERISA self-dealing action is scored on the basis of its **settlement** — 6.8 million dollars paid into a qualified settlement fund — not on the plaintiffs’ characterisations.

## Score Summary

| Dimension | Code | Raw (1-5) | Scaled (0-100) | Band |
|-----------|------|-----------|----------------|------|
| Awareness | AWR | 2.4 | 35 | Developing |
| Empathy | EMP | 2 | 25 | Developing |
| Action | ACT | 2.4 | 35 | Developing |
| Equity | EQU | 2 | 25 | Developing |
| Boundaries | BND | 2.2 | 30 | Developing |
| Accountability | ACC | 2.4 | 35 | Developing |
| Systemic Thinking | SYS | 2.6 | 40 | Developing |
| Integrity | INT | 2 | 25 | Developing |
| **Composite** | — | — | **31.3** | **Developing** |

**Composite derivation (canonical formula, methodology v1.2, `site/scripts/lib/scoring.mjs::computeCompositeFromDimensions`):** mean of the 8 raw dimension scores = 2.250; baseComposite = 31.25; dimensions below 4.0 = 8; integration premium applied by the canonical function. Final composite **31.3** (Developing).

## Dimension Details

### AWR: Awareness (Raw 2.4/5 — Scaled 35/100)

| Subdimension | Score | Evidence | Source | Tier |
|-------------|-------|----------|--------|------|
| A1 Suffering Detection | 3/5 | Some proactive mechanisms, inconsistently applied: the 2023 corporate sustainability report describes client and colleague engagement processes, but no current detection reporting exists and the report has not been refreshed since. | [SEI Investments 2023 Corporate Sustainability Report](https://d1io3yog0oux5.cloudfront.net/_cbc3c2bc7dab47bb5387abc1b895807a/seic/db/947/9539/corporate_responsibility_report/SEI-2023-Corporate-Sustainability-Report.pdf) | 4 |
| A2 Contextual Sensitivity | 2/5 | Largely uniform processes with accommodation on request: distinct client segments are served (advisors, institutions, nonprofits and healthcare, community foundations) but no differentiated awareness process for any vulnerable population is documented. | [SEI Investments — our commitment to community foundations](https://www.seic.com/institutional-investors/nonprofits-and-healthcare/our-commitment-community-foundations) | 3 |
| A3 Blind Spot Mitigation | 2/5 | Blind-spot acknowledgment in principle only. No structured assessment producing a finding in the last three years was located, and the company’s own sustainability reporting has lapsed since 2023. | [SEI Investments 2023 Corporate Sustainability Report (SEC filing)](https://www.sec.gov/Archives/edgar/data/350894/000035089424000115/a2023corporatesustainabi.htm) | 4 |
| A4 Signal Amplification | 2/5 | Alternative channels for low-power voices are not documented as effective. The clearest low-power group here is SEI’s own retirement plan participants, and their concerns reached the company through federal litigation. | [PLANADVISER — SEI faces ERISA self-dealing lawsuit in district court](https://www.planadviser.com/sei-faces-erisa-self-dealing-lawsuit-district-court/) | 3 |
| A5 Anticipatory Awareness | 3/5 | Formal pre-launch assessment for some decisions: investment risk and climate-related engagement processes are described, and SEI is a member of Climate Action 100+ engaging clients on climate risk. | [SEI Investments — sustainable investing](https://www.seic.com/our-commitment/sustainable-investing) | 3 |

### EMP: Empathy (Raw 2/5 — Scaled 25/100)

| Subdimension | Score | Evidence | Source | Tier |
|-------------|-------|----------|--------|------|
| E1 Affective Resonance | 2/5 | Occasional acknowledgment with no structural expectation, and sentiment is deteriorating: 3.3 of 5 across 1,452 employee reviews, down 7% over a year; compensation and benefits 2.7 of 5, down 12% over twelve months. | [Glassdoor — SEI Investments reviews](https://www.glassdoor.com/Reviews/SEI-Investments-Reviews-E1851.htm) | 3 |
| E2 Perspective-Taking | 2/5 | Perspective-taking acknowledged without a structural process. No mechanism was located through which client or employee perspective demonstrably changed a decision. | [SEI Investments 2023 Corporate Sustainability Report](https://d1io3yog0oux5.cloudfront.net/_cbc3c2bc7dab47bb5387abc1b895807a/seic/db/947/9539/corporate_responsibility_report/SEI-2023-Corporate-Sustainability-Report.pdf) | 2 |
| E3 Non-Judgment | 2/5 | Non-judgment stated but not measured. Diversity initiatives are described in the 2023 report; no disaggregated outcome data or disparity investigation was located. | [SEI Investments 2023 Corporate Sustainability Report](https://d1io3yog0oux5.cloudfront.net/_cbc3c2bc7dab47bb5387abc1b895807a/seic/db/947/9539/corporate_responsibility_report/SEI-2023-Corporate-Sustainability-Report.pdf) | 2 |
| E4 Validation | 2/5 | "We take all concerns seriously" with no process evidenced. The self-dealing claims were litigated for years before settlement rather than validated when raised. | [PLANSPONSOR — ERISA self-dealing lawsuit calls SEI plan a "captive customer"](https://www.plansponsor.com/erisa-self-dealing-lawsuit-calls-sei-plan-captive-customer/) | 3 |
| E5 Cultural Empathy | 2/5 | Operations span the United States, United Kingdom, Ireland, Canada, continental Europe, India and South Africa, but no cultural adaptation beyond localisation was located. | [SEI Investments — about SEI](https://www.seic.com/about-sei/about-sei) | 3 |

### ACT: Action (Raw 2.4/5 — Scaled 35/100)

| Subdimension | Score | Evidence | Source | Tier |
|-------------|-------|----------|--------|------|
| AC1 Responsiveness | 3/5 | Standards are met for most cases with some escalation authority through a regulated service-centre operating model across seven geographies. No response data published. | [SEI Investments — about SEI](https://www.seic.com/about-sei/about-sei) | 3 |
| AC2 Proportionality | 2/5 | Needs assessment exists on paper but resources drive response. No evidence of augmented response for higher-need clients or participants was located. | [SEI Investments 2023 Corporate Sustainability Report](https://d1io3yog0oux5.cloudfront.net/_cbc3c2bc7dab47bb5387abc1b895807a/seic/db/947/9539/corporate_responsibility_report/SEI-2023-Corporate-Sustainability-Report.pdf) | 2 |
| AC3 Efficacy | 2/5 | Some outcome data is collected but not shown to be reviewed and published. Sustainability reporting has not been refreshed since 2023, so no recent outcome review exists. | [SEI Investments 2023 Corporate Sustainability Report (SEC filing)](https://www.sec.gov/Archives/edgar/data/350894/000035089424000115/a2023corporatesustainabi.htm) | 4 |
| AC4 Resource Mobilization | 3/5 | Gap analysis completed with at least one attempt to mobilise additional resources: SEI Cares operates as a global philanthropic and volunteer programme with employee-led groups, and the community foundations commitment directs service to nonprofit clients. | [SEI Investments — our commitment to community foundations](https://www.seic.com/institutional-investors/nonprofits-and-healthcare/our-commitment-community-foundations) | 3 |
| AC5 Follow-Through | 2/5 | Follow-up occurs in some cases but is not systematic, and no longitudinal outcome data was located. | [SEI Investments 2023 Corporate Sustainability Report](https://d1io3yog0oux5.cloudfront.net/_cbc3c2bc7dab47bb5387abc1b895807a/seic/db/947/9539/corporate_responsibility_report/SEI-2023-Corporate-Sustainability-Report.pdf) | 2 |

### EQU: Equity (Raw 2/5 — Scaled 25/100)

| Subdimension | Score | Evidence | Source | Tier |
|-------------|-------|----------|--------|------|
| EQ1 Universality | 2/5 | Universal access is stated but coverage is not measured. As a business-to-business provider SEI reaches end investors indirectly, and no coverage data for underserved savers was located. | [SEI Investments — about SEI](https://www.seic.com/about-sei/about-sei) | 2 |
| EQ2 Priority for Vulnerable | 2/5 | Priority is stated but allocation does not follow need. The settled self-dealing claims concerned resources flowing from plan participants toward the firm’s own products, which is the inverse of prioritisation. | [PLANSPONSOR — ERISA self-dealing lawsuit calls SEI plan a "captive customer"](https://www.plansponsor.com/erisa-self-dealing-lawsuit-calls-sei-plan-captive-customer/) | 3 |
| EQ3 Bias Awareness | 2/5 | Some disaggregation is described in the 2023 report; disparities are not shown to be investigated with corrective action attached. | [SEI Investments 2023 Corporate Sustainability Report](https://d1io3yog0oux5.cloudfront.net/_cbc3c2bc7dab47bb5387abc1b895807a/seic/db/947/9539/corporate_responsibility_report/SEI-2023-Corporate-Sustainability-Report.pdf) | 2 |
| EQ4 Access Design | 2/5 | Some access features are present but no community input or barrier mapping was located. An employee review alleges an entry-level hiring route presented as full-time that operated as temporary-to-permanent, which is an access-design failure at the front door. | [Glassdoor — SEI Investments employee review](https://www.glassdoor.com/Reviews/Employee-Review-SEI-Investments-E1851-RVW16968634.htm) | 2 |
| EQ5 Historical Harm Acknowledgment | 2/5 | Vague acknowledgment only. No formal acknowledgment of a specific historical harm was located. | [SEI Investments 2023 Corporate Sustainability Report](https://d1io3yog0oux5.cloudfront.net/_cbc3c2bc7dab47bb5387abc1b895807a/seic/db/947/9539/corporate_responsibility_report/SEI-2023-Corporate-Sustainability-Report.pdf) | 2 |

### BND: Boundaries (Raw 2.2/5 — Scaled 30/100)

| Subdimension | Score | Evidence | Source | Tier |
|-------------|-------|----------|--------|------|
| B1 Self-Sustainability | 3/5 | Turnover-relevant sentiment is mixed with one genuine strength: employees rate work-life balance 3.7 of 5, the highest of SEI’s subscores, against culture and values at 3.2 and career opportunities at 3.1. | [Glassdoor — SEI Investments reviews](https://www.glassdoor.com/Reviews/SEI-Investments-Reviews-E1851.htm) | 3 |
| B2 Autonomy Preservation | 2/5 | Autonomy-building is stated but not measured. SEI’s outsourced operating platform model increases rather than reduces client dependence on continued institutional involvement, and no capacity-and-exit programme was located. | [SEI Investments — about SEI](https://www.seic.com/about-sei/about-sei) | 2 |
| B3 Scope Clarity | 2/5 | Limitations acknowledged when raised rather than proactively. The employee account of an entry-level role presented as permanent and operated as temporary-to-permanent is a scope-clarity failure discovered only after commitment. | [Glassdoor — SEI Investments employee review](https://www.glassdoor.com/Reviews/Employee-Review-SEI-Investments-E1851-RVW16968634.htm) | 2 |
| B4 Refusal Ethics | 2/5 | Refusals are generally respectful but no structured alternatives process was located. | [SEI Investments 2023 Corporate Sustainability Report](https://d1io3yog0oux5.cloudfront.net/_cbc3c2bc7dab47bb5387abc1b895807a/seic/db/947/9539/corporate_responsibility_report/SEI-2023-Corporate-Sustainability-Report.pdf) | 2 |
| B5 Consent Orientation | 2/5 | Consent functioned to protect the institution: the settled action alleged SEI’s own retirement plan operated as a captive customer of SEI-affiliated funds, meaning participants’ consent to the plan was not consent to that arrangement. | [PLANSPONSOR — ERISA self-dealing lawsuit calls SEI plan a "captive customer"](https://www.plansponsor.com/erisa-self-dealing-lawsuit-calls-sei-plan-captive-customer/) | 3 |

### ACC: Accountability (Raw 2.4/5 — Scaled 35/100)

| Subdimension | Score | Evidence | Source | Tier |
|-------------|-------|----------|--------|------|
| AB1 Harm Acknowledgment | 2/5 | Acknowledged only after external establishment: the fiduciary-breach claims were established through federal litigation and resolved by settlement rather than self-disclosed. | [Pensions & Investments — SEI agrees to $6.8 million settlement in fiduciary breach case](https://www.pionline.com/courts/sei-agrees-68-million-settlement-fiduciary-breach-case/) | 3 |
| AB2 Correction Willingness | 3/5 | At least one significant course correction: SEI entered into a settlement agreement paying 6.8 million dollars into a qualified settlement fund to resolve the ERISA self-dealing claims concerning its own Capital Accumulation Plan. | [Pensions & Investments — SEI agrees to $6.8 million settlement in fiduciary breach case](https://www.pionline.com/courts/sei-agrees-68-million-settlement-fiduciary-breach-case/) | 3 |
| AB3 Transparency | 2/5 | Some data shared, and failures disclosed where legally required. SEI files Form 11-K for its employee plan and filed its 2023 sustainability report with the SEC — but that 2023 report is the most recent located, so current-period performance is not publicly disclosed at all. | [SEI Investments Form 11-K, FY2025](https://www.sec.gov/Archives/edgar/data/0000350894/000035089426000039/seic-20260623.htm) | 4 |
| AB4 Systemic Learning | 2/5 | Some post-incident review that has not been shown to translate into systemic change. No published remediation of the plan-governance arrangements that produced the self-dealing claims was located. | [PLANADVISER — SEI faces ERISA self-dealing lawsuit in district court](https://www.planadviser.com/sei-faces-erisa-self-dealing-lawsuit-district-court/) | 3 |
| AB5 Reparative Action | 3/5 | At least one case of reparative action: 6.8 million dollars paid into a qualified settlement fund for the benefit of the affected plan participants. | [Pensions & Investments — SEI agrees to $6.8 million settlement in fiduciary breach case](https://www.pionline.com/courts/sei-agrees-68-million-settlement-fiduciary-breach-case/) | 3 |

### SYS: Systemic Thinking (Raw 2.6/5 — Scaled 40/100)

| Subdimension | Score | Evidence | Source | Tier |
|-------------|-------|----------|--------|------|
| S1 Root Cause Orientation | 2/5 | Root causes are acknowledged, principally through climate engagement language, but no resources directed at an upstream intervention were located. | [SEI Investments — sustainable investing](https://www.seic.com/our-commitment/sustainable-investing) | 2 |
| S2 Long-Term Impact | 3/5 | 5-plus year planning with specific goals and some tracking: the 2023 report sets multi-year sustainability commitments, and Climate Action 100+ membership implies a multi-year engagement horizon. No long-horizon outcome data published. | [SEI Investments 2023 Corporate Sustainability Report](https://d1io3yog0oux5.cloudfront.net/_cbc3c2bc7dab47bb5387abc1b895807a/seic/db/947/9539/corporate_responsibility_report/SEI-2023-Corporate-Sustainability-Report.pdf) | 4 |
| S3 Interconnection Awareness | 3/5 | At least one case of identifying and responding to a cross-system effect: SEI discloses that it collectively engages its own clients on climate change, which is an explicit attempt to act on an adjacent system rather than only its own footprint. | [SEI Investments — sustainable investing](https://www.seic.com/our-commitment/sustainable-investing) | 3 |
| S4 Structural Critique | 2/5 | Structural critique appears in communications but is disconnected from action. No public position carrying institutional risk was located. | [World Benchmarking Alliance — SEI Investments](https://www.worldbenchmarkingalliance.org/publication/financial-system/companies/sei-investments/) | 3 |
| S5 Coalitional Compassion | 3/5 | Active coalition member with documented contributions: membership of Climate Action 100+ with disclosed collective client engagement, and assessment participation with the World Benchmarking Alliance. | [World Benchmarking Alliance — SEI Investments](https://www.worldbenchmarkingalliance.org/publication/financial-system/companies/sei-investments/) | 3 |

### INT: Integrity (Raw 2/5 — Scaled 25/100)

| Subdimension | Score | Evidence | Source | Tier |
|-------------|-------|----------|--------|------|
| I1 Consistency Under Pressure | 2/5 | Pressure has caused unacknowledged compromises: employee-rated compensation fell 12% over twelve months to 2.7 of 5 while sustainability reporting lapsed after 2023, both without public acknowledgment. | [Glassdoor — SEI Investments reviews](https://www.glassdoor.com/Reviews/SEI-Investments-Reviews-E1851.htm) | 3 |
| I2 Non-Performance | 2/5 | Some genuine practice, primarily reputation-motivated. SEI Cares volunteering is real, but the compassion-relevant disclosure that carries reputational weight — the sustainability report — is the thing that stopped. | [SEI Investments 2023 Corporate Sustainability Report (SEC filing)](https://www.sec.gov/Archives/edgar/data/350894/000035089424000115/a2023corporatesustainabi.htm) | 4 |
| I3 Internal Consistency | 2/5 | A gap acknowledged but not addressed. The firm’s own employees were the plaintiffs in a self-dealing action over their retirement plan, and employee-rated pay has fallen sharply while overall sentiment declined 7% in a year. | [PLANSPONSOR — ERISA self-dealing lawsuit calls SEI plan a "captive customer"](https://www.plansponsor.com/erisa-self-dealing-lawsuit-calls-sei-plan-captive-customer/) | 3 |
| I4 Values Alignment | 2/5 | Values consulted for communications but not consistently applied to decisions: a firm publishing a sustainable-investing commitment while its own plan participants litigated over fund selection. | [SEI Investments — sustainable investing](https://www.seic.com/our-commitment/sustainable-investing) | 2 |
| I5 Resilience of Care | 2/5 | Most practices depend on current leadership rather than embedded structure, evidenced by sustainability reporting lapsing entirely after 2023. | [SEI Investments 2023 Corporate Sustainability Report (SEC filing)](https://www.sec.gov/Archives/edgar/data/350894/000035089424000115/a2023corporatesustainabi.htm) | 4 |

## Published Index Comparison

**Published index:** fortune-500 | **Published rank:** #49 | **Published composite:** 60.9/100 | **Published band:** Established

| Dimension | Published (raw) | Published (scaled) | Research (raw) | Research (scaled) | Difference (scaled) |
|-----------|----------------|-------------------|----------------|-------------------|---------------------|
| AWR | 3.5 | 62.5 | 2.4 | 35 | -27.5 |
| EMP | 3.5 | 62.5 | 2 | 25 | -37.5 |
| ACT | 3.5 | 62.5 | 2.4 | 35 | -27.5 |
| EQU | 3 | 50 | 2 | 25 | -25 |
| BND | 3.5 | 62.5 | 2.2 | 30 | -32.5 |
| ACC | 3.5 | 62.5 | 2.4 | 35 | -27.5 |
| SYS | 3.5 | 62.5 | 2.6 | 40 | -22.5 |
| INT | 3.5 | 62.5 | 2 | 25 | -37.5 |
| **Composite** | — | **60.9** | — | **31.3** | **-29.6** |

**Math-hygiene reconstruction:** the canonical formula applied to the published dimension vector returns 60.9 against a published 60.9 (difference 0). Within the 0.5-point tolerance — no math-hygiene issue.

### Score Difference Analysis

Every dimension measures below the published value, and the gaps are large: **EMP (published 3.5 / 83.3 scaled; research 2.0 / 25.0)**, **EQU (3.0 / 66.7 to 2.0 / 25.0)**, **INT (3.5 / 83.3 to 2.0 / 25.0)**. Three things drive this. First, transparency: the most recent SEI Investments corporate sustainability report located is for 2023, so there is no current public account of performance at all, which caps AB3, AC3 and A3. Second, the settled ERISA self-dealing action concerning SEI’s own Capital Accumulation Plan, resolved for 6.8 million dollars — SEI’s own employees were the plaintiffs, which is the clearest possible internal-consistency signal (I3 = 2). Third, deteriorating employee sentiment: 3.3 of 5 and falling, with compensation rated 2.7 and down 12% in a year. **The honest caveat is that this is also the thinnest evidence base of the five.** A business-to-business infrastructure provider has fewer compassion-relevant public touchpoints, and roughly a dozen subdimensions here are scored at 2 on absence of located evidence rather than on an adverse finding. That is why confidence is recorded as **low** and why no proposal is filed.

### Recommendation

The published 60.9 (Established) is **not supported** by this first measurement of 31.3 (Developing), a delta of -29.6 spanning two band boundaries. **No change proposal is filed, and this entity in particular should not be reset on tonight’s evidence.** The published composite sits in a 19-entity identical-dimension-vector cohort in `site/src/data/indexes/fortune-500.json` (including A.O. Smith, ADP, Aon, Ball Corporation, Dell Technologies, Erie Indemnity, ManpowerGroup and Marsh & McLennan). Byte-identical dimension vectors across 19 unrelated companies in different sectors is the signature of an unassessed seed value, not of measurement. Per anti-false-positive screening rule 5, a shared-artefact gap of this kind is routed to coordinator-level calibration review rather than encoded as a one-off baseline-reset proposal. Confidence is **low**: a 29.6-point gap resting substantially on absence of located evidence is a research-coverage finding as much as a conduct finding. The single highest-value next step is to establish whether SEI Investments has published any sustainability report since 2023; if it has, AB3, AC3, A3 and several Equity subdimensions should be re-scored before any recalibration.

## Screening checks (§3e-bis)

1. **Baseline provenance — checked.** `research/APPLIED_CHANGES.md` contains no row for this entity, no assessment files exist on disk, and `research/rotation-state.json` records `last_assessed: null`. The published composite has never been set by an evidence-based assessment.
2. **No "stale baseline" rationale against the record.** The rationale is that the score has never been measured. The history confirms this.
3. **Directionality.** This entity surfaced through staleness-based rotation backfill, not through negative news; the scanner recorded that its individual Tier 1 search produced no evidence for this cycle. The measurement below is therefore a cold first baseline built from the entity's own disclosures, regulator and court records, and employee testimony — searched for positive and negative evidence alike. No movement is taken on absence of harm.
4. **Rationale-versus-history consistency.** There is no prior finding for this to contradict.
5. **Calibration handling — THIS IS THE OPERATIVE RULE TONIGHT.** The published composite sits in a 19-entity identical-dimension-vector cohort in `site/src/data/indexes/fortune-500.json` (including A.O. Smith, ADP, Aon, Ball Corporation, Dell Technologies, Erie Indemnity, ManpowerGroup and Marsh & McLennan). Byte-identical dimension vectors across 19 unrelated companies in different sectors is the signature of an unassessed seed value, not of measurement. Per anti-false-positive screening rule 5, a shared-artefact gap of this kind is routed to coordinator-level calibration review rather than encoded as a one-off baseline-reset proposal. **No change proposal is filed.** The measurement is recorded on disk with a full subdimension sidecar so it is auditable and reusable, and the gap is surfaced to the coordinator as a `flag-for-review` finding in `research/scans/2026-09-22-assessor-summary.json`.
6. **Confidence discipline.** A single-cycle desk review is not a sufficient basis for a 25-to-35-point unilateral reset of a Fortune 500 entity. The recommendation is `flag-for-review`, not `downgrade`.

7. **Absence-of-evidence discipline, stated explicitly.** Roughly a dozen subdimensions here sit at 2 because nothing was located, not because something adverse was found. The methodology directs scoring to the lower anchor in that situation, but it also directs that the gap be recorded and that confidence reflect it. Both are done: confidence is `low`, no proposal is filed, and every absence is itemised in the evidence gaps.

## Key Findings

- SEI Investments settled claims that it made its own employees’ retirement plan a captive customer of its own funds. The company paid 6.8 million dollars into a qualified settlement fund to resolve the ERISA self-dealing action over its Capital Accumulation Plan — its own staff were the plaintiffs.
- The company appears to have stopped publishing sustainability reports. The most recent one located is for 2023, filed with the SEC in 2024. That means there is no current public account of its social or environmental performance, which is the single largest driver of its low transparency score.
- Employee sentiment is falling. SEI rates 3.3 of 5 across 1,452 reviews, down 7% over a year, with compensation and benefits at 2.7 of 5, down 12% over twelve months. Work-life balance at 3.7 is the one clear bright spot.
- It does participate in genuine collective work: SEI is a member of Climate Action 100+ and discloses that it engages its own clients on climate change, which is acting on an adjacent system rather than only its own footprint.
- This is the thinnest evidence base of the five companies assessed tonight, and the score reflects that as well as the conduct. Confidence is recorded as low, about a dozen subdimensions rest on absence of located evidence, and no score change is proposed.

## Strongest Dimensions

**SYS (2.6 raw)** and **ACC (2.4)**. AB2, AB5 and S3/S5 score 3: SEI did settle the self-dealing claims with a real 6.8 million dollar fund for the affected participants, and its Climate Action 100+ client engagement is documented collective work rather than a statement.

## Weakest Dimensions

**EMP (2.0 raw)**, **EQU (2.0)** and **INT (2.0)**. The defining evidence is that SEI’s own employees had to sue over their retirement plan, that employee-rated pay has fallen 12% in a year, and that the company has published no sustainability report since 2023.

## Evidence Gaps

- Whether SEI Investments has published a sustainability report for 2024, 2025 or 2026 was not established; the most recent located is 2023. This is the highest-value gap and directly caps AB3, AC3 and A3.
- No client or end-investor outcome data was located, so EQ1, AC2 and AC5 are scored at lower anchors on absence rather than on findings.
- No independent workplace audit, union evidence or regulatory employment finding was located; internal-culture scores rest on Tier 3 employee testimony.
- No SEC enforcement, FINRA or state regulatory action against SEI Investments was located this cycle; its absence is not evidence of good conduct and was not scored as such.
- The 2023 corporate sustainability report PDF was identified but not read in full, which would likely raise several Equity and Empathy subdimensions from 2 to 3.

## Recommended Next Steps

- **Critical/Developing**: Consider a [Certified Assessment](/certified-assessments) for a structured improvement roadmap.

## Sources

- [SEI Investments 2023 Corporate Sustainability Report](https://d1io3yog0oux5.cloudfront.net/_cbc3c2bc7dab47bb5387abc1b895807a/seic/db/947/9539/corporate_responsibility_report/SEI-2023-Corporate-Sustainability-Report.pdf)
- [SEI Investments — our commitment to community foundations](https://www.seic.com/institutional-investors/nonprofits-and-healthcare/our-commitment-community-foundations)
- [SEI Investments 2023 Corporate Sustainability Report (SEC filing)](https://www.sec.gov/Archives/edgar/data/350894/000035089424000115/a2023corporatesustainabi.htm)
- [PLANADVISER — SEI faces ERISA self-dealing lawsuit in district court](https://www.planadviser.com/sei-faces-erisa-self-dealing-lawsuit-district-court/)
- [SEI Investments — sustainable investing](https://www.seic.com/our-commitment/sustainable-investing)
- [Glassdoor — SEI Investments reviews](https://www.glassdoor.com/Reviews/SEI-Investments-Reviews-E1851.htm)
- [PLANSPONSOR — ERISA self-dealing lawsuit calls SEI plan a "captive customer"](https://www.plansponsor.com/erisa-self-dealing-lawsuit-calls-sei-plan-captive-customer/)
- [SEI Investments — about SEI](https://www.seic.com/about-sei/about-sei)
- [Glassdoor — SEI Investments employee review](https://www.glassdoor.com/Reviews/Employee-Review-SEI-Investments-E1851-RVW16968634.htm)
- [Pensions & Investments — SEI agrees to $6.8 million settlement in fiduciary breach case](https://www.pionline.com/courts/sei-agrees-68-million-settlement-fiduciary-breach-case/)
- [SEI Investments Form 11-K, FY2025](https://www.sec.gov/Archives/edgar/data/0000350894/000035089426000039/seic-20260623.htm)
- [World Benchmarking Alliance — SEI Investments](https://www.worldbenchmarkingalliance.org/publication/financial-system/companies/sei-investments/)

---

*This assessment is based on publicly available information and does not constitute a formal Compassion Benchmark Certified Assessment. For a comprehensive, assessor-led evaluation, visit compassionbenchmark.com/certified-assessments.*
