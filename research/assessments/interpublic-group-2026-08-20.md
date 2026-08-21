---
entity: "Interpublic Group"
type: "Company"
sector: "Advertising / Marketing Services"
date: "2026-08-20"
composite_score: 31.3
band: "Developing"
scores:
  AWR: 2.4
  EMP: 2.2
  ACT: 2.4
  EQU: 2.2
  BND: 2
  ACC: 2.2
  SYS: 2.4
  INT: 2.2
published_index: "fortune-500"
published_rank: 179
published_composite: 40
published_band: "developing"
assessed_composite: 31.3
score_delta: -8.7
band_change: false
recommendation: "flag-for-review"
change_proposal: true
confidence: "low"
subdim_sidecar: true
source: "rotation"
scan_file: "research/scans/2026-08-20.json"
entity_record_defect: "Interpublic Group was ACQUIRED BY OMNICOM GROUP and the merger completed in November 2025. IPG no longer exists as an independent Fortune-500 company. Its standalone index entry at rank 179 is a stale entity record. This is the dominant finding for this entity and should be resolved before any score is applied."
---

# Compassion Benchmark Assessment: Interpublic Group

**Entity type:** Company
**Sector/Domain:** Advertising / Marketing Services
**Assessment date:** 2026-08-20
**Composite score:** 31.3/100
**Band:** Developing
**Cycle source:** rotation (scan `research/scans/2026-08-20.json`)

## Why this entity was assessed

Interpublic Group entered the queue as **rotation backfill on staleness grounds alone**. The scanner searched it individually and found no compassion-relevant evidence in the last 14 days. IPG has **never been individually assessed** and, unlike the other four rotation entities, carries a **unique vector rather than a seed value** — its 40.0 traces to the original index build.

## Evidence-date and attribution checks

**ENTITY-RECORD DEFECT — THIS IS THE DOMINANT FINDING AND OUTWEIGHS THE SCORE.**

**Interpublic Group no longer exists as an independent Fortune-500 company.** Omnicom Group entered into an Agreement and Plan of Merger with IPG on 8 December 2024, and **the acquisition completed in November 2025**. IPG now operates as part of Omnicom. Its standalone entry in the Fortune-500 index at rank 179 is a **stale entity record**.

This is structurally the same class of defect as the duplicate Fortune-500 record ("Automatic Data Process" merged into "ADP") that a cleanup resolved on 2026-08-17, cutting that index from 448 to 447 entities. **It is recorded here for coordinator resolution and is not silently fixed.** The correct remedy is an entity-record decision — merge, retire or retain-with-annotation — not a score change. A score applied to a company that no longer independently exists would be misleading whatever its value.

**ATTRIBUTION.** The 3,200 roles IPG cut globally in 2025, including 800 in the September quarter, were **IPG's own conduct** while it was still an independent company, and are scored. The further "more than 4,000" post-merger layoffs and the retiring of several major advertising brands are **Omnicom conduct**, announced by Omnicom, and are **not** scored against IPG. Omnicom's $1,247.0 million of 2025 operating expenses for severance, real-estate repositioning and contract cancellations spans the combined entity and is used only as scale context.

**Date check.** Merger agreement 2024-12-08; completion November 2025; Omnicom 8-K filings across 2025; Omnicom DEF 14A FY2026. Dates verified against SEC filing archives. No year-confusion found.

**CONFIDENCE IS LOW.** No compassion-relevant evidence was found in the scan window, and the entity's corporate status is unresolved.

## Score Summary

| Dimension | Code | Raw (1-5) | Scaled (0-100) | Band |
|---|---|---|---|---|
| Awareness | AWR | 2.40 | 35 | Developing |
| Empathy | EMP | 2.20 | 30 | Developing |
| Action | ACT | 2.40 | 35 | Developing |
| Equity | EQU | 2.20 | 30 | Developing |
| Boundaries | BND | 2.00 | 25 | Developing |
| Accountability | ACC | 2.20 | 30 | Developing |
| Systemic Thinking | SYS | 2.40 | 35 | Developing |
| Integrity | INT | 2.20 | 30 | Developing |
| **Composite** | — | — | **31.3** | **Developing** |

## Dimension Details

### AWR: Awareness (Raw 2.40/5 — Scaled 35/100)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| A1 Suffering Detection | 3/5 | IPG operated standard corporate detection channels for employee concerns while independent; the scale of the 2025 reductions indicates detection was subordinate to restructuring economics. | [MM+M — IPG sheds 3,200 jobs](https://www.mmm-online.com/news/ipg-sheds-3200-jobs-vacates-office-space-ahead-of-omnicom-merger/) |
| A2 Contextual Sensitivity | 2/5 | No differentiated process for affected populations was located; the 2025 cuts spanned executive, regional, account management, creative, media and administrative functions without evidence of tailored support. | [MM+M — IPG sheds 3,200 jobs](https://www.mmm-online.com/news/ipg-sheds-3200-jobs-vacates-office-space-ahead-of-omnicom-merger/) |
| A3 Blind Spot Mitigation | 2/5 | No blind-spot process producing a published finding was located. **Absence-of-disclosure anchor.** | [Omnicom Form 8-K FY2025](https://www.sec.gov/Archives/edgar/data/29989/000121390025115098/ea026709101ex99-1_omnicom.htm) |
| A4 Signal Amplification | 2/5 | No structural role carrying low-power concerns into decisions was located during the restructuring. | [MarketechAPAC — Omnicom-IPG merger sparks 4,000 job cuts](https://marketech-apac.com/adland-shake-up-omnicom-ipg-merger-sparks-4000-job-cuts-consolidation-of-creative-networks/) |
| A5 Anticipatory Awareness | 3/5 | Formal pre-decision assessment occurred in the merger process through regulatory and shareholder review, though not as a harm assessment for staff. | [Omnicom Form DEF 14A FY2026](https://www.sec.gov/Archives/edgar/data/29989/000121390026034811/ea0274271-02.htm) |

### EMP: Empathy (Raw 2.20/5 — Scaled 30/100)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| E1 Affective Resonance | 2/5 | No independent evidence located that employees experienced the restructuring as anything other than transactional. | [MM+M — IPG sheds 3,200 jobs](https://www.mmm-online.com/news/ipg-sheds-3200-jobs-vacates-office-space-ahead-of-omnicom-merger/) |
| E2 Perspective-Taking | 2/5 | No formal perspective-taking mechanism modifying a decision was located. | [MarketechAPAC](https://marketech-apac.com/adland-shake-up-omnicom-ipg-merger-sparks-4000-job-cuts-consolidation-of-creative-networks/) |
| E3 Non-Judgment | 2/5 | No disaggregated outcome data on who was affected by the cuts was published. **Absence-of-disclosure anchor.** | [Omnicom Form 8-K FY2025](https://www.sec.gov/Archives/edgar/data/29989/000121390025115098/ea026709101ex99-1_omnicom.htm) |
| E4 Validation | 3/5 | Some validation exists through SEC-disclosed severance provisioning, which at least records the human cost in financial terms: $1,247.0 million in 2025 for severance, real-estate repositioning and contract cancellations across the combined entity. | [Omnicom Form 8-K FY2025](https://www.sec.gov/Archives/edgar/data/29989/000121390025115098/ea026709101ex99-1_omnicom.htm) |
| E5 Cultural Empathy | 2/5 | No cultural adaptation evidence located across IPG's global footprint. **Absence-of-disclosure anchor.** | [Omnicom Form DEF 14A FY2026](https://www.sec.gov/Archives/edgar/data/29989/000121390026034811/ea0274271-02.htm) |

### ACT: Action (Raw 2.40/5 — Scaled 35/100)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| AC1 Responsiveness | 3/5 | Response standards existed for most corporate processes; severance was provisioned and disclosed. | [Omnicom Form 8-K FY2025](https://www.sec.gov/Archives/edgar/data/29989/000121390025115098/ea026709101ex99-1_omnicom.htm) |
| AC2 Proportionality | 2/5 | Response was standard rather than calibrated to need: 3,200 roles cut globally in 2025 across all function types. | [MM+M — IPG sheds 3,200 jobs](https://www.mmm-online.com/news/ipg-sheds-3200-jobs-vacates-office-space-ahead-of-omnicom-merger/) |
| AC3 Efficacy | 2/5 | No outcome measurement of the restructuring's effects on affected staff was located. | [MarketechAPAC](https://marketech-apac.com/adland-shake-up-omnicom-ipg-merger-sparks-4000-job-cuts-consolidation-of-creative-networks/) |
| AC4 Resource Mobilization | 3/5 | Substantial resources were mobilised — the severance and repositioning provision is material — though directed at exit rather than retention. | [Omnicom Form 8-K FY2025](https://www.sec.gov/Archives/edgar/data/29989/000121390025115098/ea026709101ex99-1_omnicom.htm) |
| AC5 Follow-Through | 2/5 | No follow-through protocol for affected staff was located. **Absence-of-disclosure anchor.** | [MM+M — IPG sheds 3,200 jobs](https://www.mmm-online.com/news/ipg-sheds-3200-jobs-vacates-office-space-ahead-of-omnicom-merger/) |

### EQU: Equity (Raw 2.20/5 — Scaled 30/100)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| EQ1 Universality | 2/5 | Universal standards are stated in corporate policy; coverage is not measured. | [Omnicom Form DEF 14A FY2026](https://www.sec.gov/Archives/edgar/data/29989/000121390026034811/ea0274271-02.htm) |
| EQ2 Priority for Vulnerable | 2/5 | No evidence that those with least power were prioritised under the restructuring; 800 roles went in the September quarter alone. | [MM+M — IPG sheds 3,200 jobs](https://www.mmm-online.com/news/ipg-sheds-3200-jobs-vacates-office-space-ahead-of-omnicom-merger/) |
| EQ3 Bias Awareness | 3/5 | Some bias monitoring exists through SEC-disclosed governance and compensation processes. | [Omnicom Form DEF 14A FY2026](https://www.sec.gov/Archives/edgar/data/29989/000121390026034811/ea0274271-02.htm) |
| EQ4 Access Design | 2/5 | No access barrier mapping was located. **Absence-of-disclosure anchor.** | [MarketechAPAC](https://marketech-apac.com/adland-shake-up-omnicom-ipg-merger-sparks-4000-job-cuts-consolidation-of-creative-networks/) |
| EQ5 Historical Harm Acknowledgment | 2/5 | No formal acknowledgment of a specific historical harm was located. **Absence-of-disclosure anchor.** | [Omnicom Form 8-K FY2025](https://www.sec.gov/Archives/edgar/data/29989/000121390025115098/ea026709101ex99-1_omnicom.htm) |

### BND: Boundaries (Raw 2.00/5 — Scaled 25/100)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| B1 Self-Sustainability | 2/5 | Frontline staff sustainability is the clearest weakness: 3,200 roles cut in one year with office space vacated. No wellbeing monitoring data was published. | [MM+M — IPG sheds 3,200 jobs](https://www.mmm-online.com/news/ipg-sheds-3200-jobs-vacates-office-space-ahead-of-omnicom-merger/) |
| B2 Autonomy Preservation | 2/5 | No programme designed to build client or employee capacity and exit was located. **Absence-of-disclosure anchor.** | [MarketechAPAC](https://marketech-apac.com/adland-shake-up-omnicom-ipg-merger-sparks-4000-job-cuts-consolidation-of-creative-networks/) |
| B3 Scope Clarity | 2/5 | Scope communication during the merger was investor-facing; the post-merger structure was not outlined to staff until January 2026. | [MarketechAPAC](https://marketech-apac.com/adland-shake-up-omnicom-ipg-merger-sparks-4000-job-cuts-consolidation-of-creative-networks/) |
| B4 Refusal Ethics | 2/5 | No structured refusal or transition protocol with alternatives was located. **Absence-of-disclosure anchor.** | [Omnicom Form 8-K FY2025](https://www.sec.gov/Archives/edgar/data/29989/000121390025115098/ea026709101ex99-1_omnicom.htm) |
| B5 Consent Orientation | 2/5 | Consent processes exist for shareholders through the merger vote; none is evidenced for staff. **Absence-of-disclosure anchor for the staff dimension.** | [Omnicom Form DEF 14A FY2026](https://www.sec.gov/Archives/edgar/data/29989/000121390026034811/ea0274271-02.htm) |

### ACC: Accountability (Raw 2.20/5 — Scaled 30/100)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| AB1 Harm Acknowledgment | 2/5 | The restructuring was disclosed only through regulatory filing obligations rather than proactively acknowledged as a harm to staff. | [Omnicom Form 8-K FY2025](https://www.sec.gov/Archives/edgar/data/29989/000121390025115098/ea026709101ex99-1_omnicom.htm) |
| AB2 Correction Willingness | 2/5 | No course correction; the reductions continued and expanded through the merger. | [MarketechAPAC](https://marketech-apac.com/adland-shake-up-omnicom-ipg-merger-sparks-4000-job-cuts-consolidation-of-creative-networks/) |
| AB3 Transparency | 3/5 | Genuine transparency exists in the financial dimension: the severance and repositioning provision is quantified in SEC filings, which is an unflattering disclosure the company was required to make but made in detail. | [Omnicom Form 8-K FY2025](https://www.sec.gov/Archives/edgar/data/29989/000121390025115098/ea026709101ex99-1_omnicom.htm) |
| AB4 Systemic Learning | 2/5 | No systemic learning process from the restructuring was located. | [MM+M — IPG sheds 3,200 jobs](https://www.mmm-online.com/news/ipg-sheds-3200-jobs-vacates-office-space-ahead-of-omnicom-merger/) |
| AB5 Reparative Action | 2/5 | Reparative action is limited to contractual severance, which is minimal legal settlement rather than repair. | [Omnicom Form 8-K FY2025](https://www.sec.gov/Archives/edgar/data/29989/000121390025115098/ea026709101ex99-1_omnicom.htm) |

### SYS: Systemic Thinking (Raw 2.40/5 — Scaled 35/100)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| S1 Root Cause Orientation | 2/5 | Root causes of workforce displacement in the advertising sector are acknowledged in strategy but no resource is allocated to addressing them. | [MarketechAPAC](https://marketech-apac.com/adland-shake-up-omnicom-ipg-merger-sparks-4000-job-cuts-consolidation-of-creative-networks/) |
| S2 Long-Term Impact | 3/5 | Long-horizon planning genuinely exists: the merger was a multi-year strategic transaction with a published post-merger structure timeline. | [Omnicom Form DEF 14A FY2026](https://www.sec.gov/Archives/edgar/data/29989/000121390026034811/ea0274271-02.htm) |
| S3 Interconnection Awareness | 2/5 | Adjacent systems are identified in merger planning but employee-side second-order effects were not tracked publicly. | [MM+M — IPG sheds 3,200 jobs](https://www.mmm-online.com/news/ipg-sheds-3200-jobs-vacates-office-space-ahead-of-omnicom-merger/) |
| S4 Structural Critique | 2/5 | No public position carrying institutional risk was located. **Absence-of-disclosure anchor.** | [MarketechAPAC](https://marketech-apac.com/adland-shake-up-omnicom-ipg-merger-sparks-4000-job-cuts-consolidation-of-creative-networks/) |
| S5 Coalitional Compassion | 3/5 | Active industry coalition participation is documented through the agency network structure and industry bodies. | [Omnicom Form DEF 14A FY2026](https://www.sec.gov/Archives/edgar/data/29989/000121390026034811/ea0274271-02.htm) |

### INT: Integrity (Raw 2.20/5 — Scaled 30/100)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| I1 Consistency Under Pressure | 2/5 | Consistency under pressure is weak: commitments to staff gave way under merger-driven financial pressure without acknowledgment. | [MM+M — IPG sheds 3,200 jobs](https://www.mmm-online.com/news/ipg-sheds-3200-jobs-vacates-office-space-ahead-of-omnicom-merger/) |
| I2 Non-Performance | 2/5 | Practices appear substantially reputation-driven; disclosure was investor-facing. | [Omnicom Form 8-K FY2025](https://www.sec.gov/Archives/edgar/data/29989/000121390025115098/ea026709101ex99-1_omnicom.htm) |
| I3 Internal Consistency | 2/5 | Internal culture is not documented; the sole hard evidence about staff treatment is the scale of the reductions. | [MarketechAPAC](https://marketech-apac.com/adland-shake-up-omnicom-ipg-merger-sparks-4000-job-cuts-consolidation-of-creative-networks/) |
| I4 Values Alignment | 2/5 | Values alignment in major decisions is not evidenced; the merger was decided on financial grounds. | [Omnicom Form DEF 14A FY2026](https://www.sec.gov/Archives/edgar/data/29989/000121390026034811/ea0274271-02.htm) |
| I5 Resilience of Care | 3/5 | Some practices survived the corporate transition into the Omnicom structure, though several major agency brands were retired. | [MarketechAPAC](https://marketech-apac.com/adland-shake-up-omnicom-ipg-merger-sparks-4000-job-cuts-consolidation-of-creative-networks/) |

## Published Index Comparison

**Published index:** fortune-500 | **Published rank:** #179 | **Published composite:** 40/100 | **Published band:** developing

| Dimension | Published (raw) | Assessed (raw) | Difference (raw) |
|---|---|---|---|
| AWR | 2.7 | 2.40 | -0.30 |
| EMP | 2.8 | 2.20 | -0.60 |
| ACT | 2.6 | 2.40 | -0.20 |
| EQU | 2.5 | 2.20 | -0.30 |
| BND | 2.3 | 2.00 | -0.30 |
| ACC | 2.6 | 2.20 | -0.40 |
| SYS | 2.7 | 2.40 | -0.30 |
| INT | 2.6 | 2.20 | -0.40 |
| **Composite** | **40** | **31.3** | **-8.7** |

### Analysis

The assessed composite of 31.3 sits 8.7 points below the published 40.0, in the same Developing band. **The number should be treated as provisional and secondary.** The primary output of this assessment is the discovery that the entity being scored no longer independently exists. Of the 40 subdimensions, 13 are scored at the absence-of-disclosure anchor. The substantive evidence is narrow: a 3,200-role reduction in a single year, disclosed through regulatory filings rather than proactively, with severance quantified but no follow-through protocol located.

## Key Findings

- Interpublic Group was bought by Omnicom Group and the deal closed in November 2025. It no longer exists as an independent Fortune 500 company. Its standalone entry in the index is a stale record.
- That record problem matters more than the score. Publishing a compassion score for a company that no longer independently exists would be misleading at any value. This needs an entity-record decision before any number is applied.
- While still independent, IPG cut 3,200 roles globally in 2025, including 800 in a single quarter, across every function type, and vacated office space ahead of the merger. That is IPG's own conduct and it is scored.
- The further 4,000-plus job cuts and the retiring of several major advertising brands were announced by Omnicom after the merger. Those are Omnicom's acts, not IPG's, and they are not scored here.
- Thirteen of the forty measured areas are scored at the low anchor because nothing is published about them, not because harm was found.

## Strongest Dimensions

Awareness (AWR, raw 2.40), Action (ACT, raw 2.40) and Systemic Thinking (SYS, raw 2.40) are jointly strongest, chiefly on regulatory-disclosure quality and on the fact that the merger was a genuine multi-year strategic plan with a published timeline.

## Weakest Dimensions

Boundaries (BND, raw 2.00) is the weakest, with every subdimension at the low anchor. The one dimension where hard evidence exists — staff sustainability — is also the one where the evidence is adverse: 3,200 roles gone in a year.

## Evidence Gaps

- The single largest gap is the entity's corporate status. It is unclear what "Interpublic Group" now denotes as a scoreable entity.
- No compassion-relevant evidence was found in the 14-day scan window.
- No IPG-specific ESG, sustainability or workforce report post-dating the merger was located; disclosure now flows through Omnicom.
- IPG has never been individually assessed, so there is no prior pipeline baseline to test drift against.

## Sources

- [MM+M — IPG sheds 3,200 jobs, vacates office space ahead of Omnicom merger](https://www.mmm-online.com/news/ipg-sheds-3200-jobs-vacates-office-space-ahead-of-omnicom-merger/)
- [MarketechAPAC — Adland shake-up: Omnicom-IPG merger sparks 4,000 job cuts, consolidation of creative networks](https://marketech-apac.com/adland-shake-up-omnicom-ipg-merger-sparks-4000-job-cuts-consolidation-of-creative-networks/)
- [SEC — Omnicom Group Form 8-K FY2025 (severance and repositioning provision)](https://www.sec.gov/Archives/edgar/data/29989/000121390025115098/ea026709101ex99-1_omnicom.htm)
- [SEC — Omnicom Group Form DEF 14A FY2026](https://www.sec.gov/Archives/edgar/data/29989/000121390026034811/ea0274271-02.htm)

## Recommended Next Steps

**Developing band (assessed).** No commercial next step is proposed until the entity record is resolved. Institutional next step: a coordinator decision on whether to merge this record into an Omnicom entry, retire it, or retain it with an annotation — the same decision made for "Automatic Data Process" on 2026-08-17.

## Disclaimer

This assessment is based on publicly available information and does not constitute a formal Compassion Benchmark Certified Assessment. For a comprehensive, assessor-led evaluation, visit compassionbenchmark.com/certified-assessments.
