---
entity: "Berkshire Hathaway"
type: "Company"
sector: "Conglomerate (insurance, energy, rail, manufacturing, retail)"
date: "2026-09-20"
composite_score: 40
band: "Developing"
scores:
  AWR: 2.2
  EMP: 2.4
  ACT: 3
  EQU: 2.4
  BND: 3
  ACC: 2.6
  SYS: 2.4
  INT: 2.8
published_index: "fortune-500"
published_rank: 169
published_composite: 43.8
published_band: "functional"
published_dimensions:
  AWR: 2.5
  EMP: 2.5
  ACT: 3
  EQU: 2.5
  BND: 3
  ACC: 3
  SYS: 2.5
  INT: 3
assessed_composite: 40
score_delta: -3.8
band_change: true
filing_trigger_met: true
outcome: "proposal"
recommendation: "flag-for-review"
change_proposal: true
confidence: "low"
subdim_sidecar: true
watch_flag: true
source: "rotation"
scan_file: "research/scans/2026-09-20.json"
integration_premium: 0
methodology_version: "v1.2"
---

# Compassion Benchmark Assessment: Berkshire Hathaway

**Entity type:** Company
**Sector/Domain:** Conglomerate (insurance, energy, rail, manufacturing, retail)
**Assessment date:** 2026-09-20
**Composite score:** 40/100
**Band:** Developing
**Cycle:** catch-up, lookback 2026-09-06 to 2026-09-20 (scan `research/scans/2026-09-20.json`, source: rotation)
**Outcome:** proposal (recommendation: flag-for-review)

## Why this entity was assessed

Rotation backfill. Berkshire Hathaway has never been individually assessed (rotation-state last_assessed: null) and no in-window evidence was surfaced. This is a first-ever evidence-based baseline resting on the public record, principally Berkshire's own SEC filings.

## Evidence-date, provenance, attribution and screening checks

- **FIRST-EVER BASELINE, NO IN-WINDOW EVIDENCE.** Rotation backfill. Every score rests on the public record, chiefly Berkshire's own SEC filings and annual report.
- **NOT A CALIBRATION RESET.** Dimensions were anchored at the published profile and moved only where evidence was located: AWR down on the board's documented refusal of parent-level workforce oversight, ACC down on the absence of consolidated disclosure, INT down on the gap between the net-zero ambition and the disclosure refusal.
- **BAND-BOUNDARY CAUTION.** The measured composite is exactly 40.0, the Developing/Functional line. A single subdimension moving one point in either direction changes the band label. Confidence is therefore low and the recommendation is flag-for-review rather than downgrade.
- **DIRECTIONALITY.** This entity was surfaced by staleness, not by negative news. The downward movement rests on located structural evidence about Berkshire's own governance choices, not on absence of good news.
- **FILED UNDER THE BAND-CROSSING TRIGGER.** Delta is -3.8, below the 5-point magnitude trigger. The proposal is filed solely because the assessed band (Developing) differs from the published band (Functional), which section 3f makes filable at any delta.

## Score Summary

| Dimension | Code | Raw (1-5) | Scaled (0-100) | Published raw | Delta (raw) | Band |
|---|---|---|---|---|---|---|
| Awareness | AWR | 2.2 | 30 | 2.5 | -0.3 | Developing |
| Empathy | EMP | 2.4 | 35 | 2.5 | -0.1 | Developing |
| Action | ACT | 3 | 50 | 3 | 0 | Functional |
| Equity | EQU | 2.4 | 35 | 2.5 | -0.1 | Developing |
| Boundaries | BND | 3 | 50 | 3 | 0 | Functional |
| Accountability | ACC | 2.6 | 40 | 3 | -0.4 | Developing |
| Systemic Thinking | SYS | 2.4 | 35 | 2.5 | -0.1 | Developing |
| Integrity | INT | 2.8 | 45 | 3 | -0.2 | Functional |
| **Composite** | — | — | **40** | — | **-3.8** | **Developing** |

Composite computed with `computeCompositeFromDimensions` (methodology v1.2). Integration premium: 0.

## Dimension Details

### AWR: Awareness (raw 2.2 / scaled 30)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| A1 Suffering Detection | 2/5 | Detection of workforce and community distress is delegated entirely to roughly 60 operating subsidiaries. No consolidated detection mechanism exists at the parent. | [T5, 2026-04-10](https://www.sec.gov/Archives/edgar/data/1067983/000119312526106253/d882687ddef14a.htm) |
| A2 Contextual Sensitivity | 2/5 | Adaptation happens at subsidiary level only, varying by geography and industry by explicit board design. | [T5, 2026-04-10](https://www.sec.gov/Archives/edgar/data/1067983/000119312526106253/d882687ddef14a.htm) |
| A3 Blind Spot Mitigation | 2/5 | A shareholder proposal asked the board to disclose its oversight framework for workforce and human-capital management across subsidiaries. The board answered that these matters belong to the businesses' own discretion. There is no parent-level process for finding what is missed. | [T5, 2026-04-10](https://www.sec.gov/Archives/edgar/data/1067983/000119312526106253/d882687ddef14a.htm) |
| A4 Signal Amplification | 2/5 | No structural channel by which subsidiary workers reach the parent. | [T5, 2026-04-10](https://www.sec.gov/Archives/edgar/data/1067983/000119312526106253/d882687ddef14a.htm) |
| A5 Anticipatory Awareness | 3/5 | Insurance and energy underwriting involve formal forward risk assessment for major decisions. | [T3, 2025-10-01](https://www.climateaction100.org/company-assessments/berkshire-hathaway-inc/) |

### EMP: Empathy (raw 2.4 / scaled 35)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| E1 Affective Resonance | 2/5 | No parent-level expectation of affective practice; culture varies entirely by subsidiary. | [T5, 2026-04-10](https://www.sec.gov/Archives/edgar/data/1067983/000119312526106253/d882687ddef14a.htm) |
| E2 Perspective-Taking | 2/5 | Perspective-taking acknowledged without a structural process at the parent. | [T5, 2026-04-10](https://www.sec.gov/Archives/edgar/data/1067983/000119312526106253/d882687ddef14a.htm) |
| E3 Non-Judgment | 3/5 | Non-discrimination policies exist across subsidiaries with some outcome data. | [T5, 2026-04-10](https://www.sec.gov/Archives/edgar/data/1067983/000119312526106253/d882687ddef14a.htm) |
| E4 Validation | 2/5 | Harm reports are handled at subsidiary level with no parent validation process. | [T5, 2026-04-10](https://www.sec.gov/Archives/edgar/data/1067983/000119312526106253/d882687ddef14a.htm) |
| E5 Cultural Empathy | 3/5 | Operations span many countries and cultures with local management. | [T4, 2026-02-28](https://www.berkshirehathaway.com/2025ar/2025ar.pdf) |

### ACT: Action (raw 3 / scaled 50)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| AC1 Responsiveness | 3/5 | Subsidiaries meet response standards in most cases with genuine local escalation authority. | [T4, 2026-02-28](https://www.berkshirehathaway.com/2025ar/2025ar.pdf) |
| AC2 Proportionality | 3/5 | Need genuinely informs response at operating level in most cases. | [T4, 2026-02-28](https://www.berkshirehathaway.com/2025ar/2025ar.pdf) |
| AC3 Efficacy | 3/5 | Operating subsidiaries review outcome data annually; results are reported financially. | [T4, 2026-02-28](https://www.berkshirehathaway.com/2025ar/2025ar.pdf) |
| AC4 Resource Mobilization | 3/5 | Capital is allocated to subsidiaries against documented need and return, including large infrastructure investment. | [T4, 2026-02-28](https://www.berkshirehathaway.com/2025ar/2025ar.pdf) |
| AC5 Follow-Through | 3/5 | Berkshire's explicit long-hold model means engagement persists well past the presenting problem. | [T4, 2026-02-28](https://www.berkshirehathaway.com/2025ar/2025ar.pdf) |

### EQU: Equity (raw 2.4 / scaled 35)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| EQ1 Universality | 2/5 | Universal access stated; coverage not measured at parent level. | [T5, 2026-04-10](https://www.sec.gov/Archives/edgar/data/1067983/000119312526106253/d882687ddef14a.htm) |
| EQ2 Priority for Vulnerable | 2/5 | Priority stated; allocation follows capital return rather than need. | [T5, 2026-04-10](https://www.sec.gov/Archives/edgar/data/1067983/000119312526106253/d882687ddef14a.htm) |
| EQ3 Bias Awareness | 3/5 | Some disaggregation exists at subsidiary level; disparities not centrally investigated. | [T5, 2026-04-10](https://www.sec.gov/Archives/edgar/data/1067983/000119312526106253/d882687ddef14a.htm) |
| EQ4 Access Design | 2/5 | No parent-level access barrier mapping located. | [T5, 2026-04-10](https://www.sec.gov/Archives/edgar/data/1067983/000119312526106253/d882687ddef14a.htm) |
| EQ5 Historical Harm Acknowledgment | 3/5 | Specific historical harms have been formally acknowledged by named subsidiaries. | [T4, 2026-02-28](https://www.berkshirehathaway.com/2025ar/2025ar.pdf) |

### BND: Boundaries (raw 3 / scaled 50)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| B1 Self-Sustainability | 3/5 | Turnover is tracked at subsidiary level, and the decentralised model gives operating managers real autonomy over working conditions. | [T4, 2026-02-28](https://www.berkshirehathaway.com/2025ar/2025ar.pdf) |
| B2 Autonomy Preservation | 3/5 | The parent deliberately builds subsidiary autonomy rather than dependence; managers run their own businesses. | [T4, 2026-02-28](https://www.berkshirehathaway.com/2025ar/2025ar.pdf) |
| B3 Scope Clarity | 3/5 | Berkshire communicates its scope with unusual directness: the parent states plainly what it will and will not do for subsidiaries. | [T4, 2026-02-28](https://www.berkshirehathaway.com/2025ar/2025ar.pdf) |
| B4 Refusal Ethics | 3/5 | Acquisition and capital-allocation refusals are explained publicly with reasons. | [T4, 2026-02-28](https://www.berkshirehathaway.com/2025ar/2025ar.pdf) |
| B5 Consent Orientation | 3/5 | Standard consent practice across regulated subsidiaries. | [T4, 2026-02-28](https://www.berkshirehathaway.com/2025ar/2025ar.pdf) |

### ACC: Accountability (raw 2.6 / scaled 40)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| AB1 Harm Acknowledgment | 3/5 | The annual shareholder letter has repeatedly acknowledged specific management errors before any legal obligation to do so. | [T4, 2026-02-28](https://www.berkshirehathaway.com/2025ar/2025ar.pdf) |
| AB2 Correction Willingness | 3/5 | Documented course corrections following acknowledged errors, including writedowns. | [T4, 2026-02-28](https://www.berkshirehathaway.com/2025ar/2025ar.pdf) |
| AB3 Transparency | 3/5 | The annual report discloses unflattering findings, but there is no consolidated sustainability or human-capital report, and requests for one have been declined. | [T5, 2025-12-30](https://www.sec.gov/files/corpfin/no-action/14a-8/ncpprberkshire123025.pdf) |
| AB4 Systemic Learning | 2/5 | Failures are addressed inside individual subsidiaries; no parent-level systemic review process exists. | [T5, 2026-04-10](https://www.sec.gov/Archives/edgar/data/1067983/000119312526106253/d882687ddef14a.htm) |
| AB5 Reparative Action | 2/5 | Repair beyond legal settlement is subsidiary-specific and not systematically evidenced. | [T5, 2026-04-10](https://www.sec.gov/Archives/edgar/data/1067983/000119312526106253/d882687ddef14a.htm) |

### SYS: Systemic Thinking (raw 2.4 / scaled 35)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| S1 Root Cause Orientation | 2/5 | Root causes are acknowledged in the energy subsidiaries but parent-level resource allocation to structural change is not evidenced. | [T3, 2025-10-01](https://www.climateaction100.org/company-assessments/berkshire-hathaway-inc/) |
| S2 Long-Term Impact | 3/5 | Berkshire's planning horizon is explicitly multi-decade, with specific long-term capital goals. | [T4, 2026-02-28](https://www.berkshirehathaway.com/2025ar/2025ar.pdf) |
| S3 Interconnection Awareness | 2/5 | Adjacent-system effects are identified in utility regulation but not systematically tracked at the parent. | [T3, 2025-10-01](https://www.climateaction100.org/company-assessments/berkshire-hathaway-inc/) |
| S4 Structural Critique | 2/5 | Structural critique appears in shareholder communications and is largely disconnected from parent action; disclosure proposals were omitted from the proxy. | [T3, 2025-11-06](https://www.asyousow.org/resolutions/2025/11/6-berkshire-hathaway-ghg-emissions-from-investments-and-underwriting-activities) |
| S5 Coalitional Compassion | 3/5 | Active participation in industry and regulatory bodies through subsidiaries, with documented contributions. | [T3, 2025-10-01](https://www.climateaction100.org/company-assessments/berkshire-hathaway-inc/) |

### INT: Integrity (raw 2.8 / scaled 45)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| I1 Consistency Under Pressure | 3/5 | Berkshire has borne real cost to maintain stated commitments, notably in holding businesses through downturns. | [T4, 2026-02-28](https://www.berkshirehathaway.com/2025ar/2025ar.pdf) |
| I2 Non-Performance | 3/5 | Practices are maintained regardless of visibility; Berkshire is notably indifferent to reputational fashion. | [T4, 2026-02-28](https://www.berkshirehathaway.com/2025ar/2025ar.pdf) |
| I3 Internal Consistency | 3/5 | Meaningful effort to apply the same principles to subsidiary managers as to shareholders. | [T4, 2026-02-28](https://www.berkshirehathaway.com/2025ar/2025ar.pdf) |
| I4 Values Alignment | 2/5 | A net-zero ambition for 2050 covering at least 95% of Scope 1 and 2 emissions sits alongside a refusal to disclose the oversight framework that would evidence it. | [T3, 2025-10-01](https://www.climateaction100.org/company-assessments/berkshire-hathaway-inc/) |
| I5 Resilience of Care | 3/5 | Core practices are set out in the Owner's Manual and have survived a chief-executive transition. | [T4, 2026-02-28](https://www.berkshirehathaway.com/2025ar/2025ar.pdf) |

## Published Index Comparison

**Published index:** fortune-500 | **Published rank:** #169 | **Published composite:** 43.8/100 | **Published band:** Functional

Canonical reconstruction of the published dimension set returns exactly 43.8, matching the published composite. **No math-hygiene issue.**

Measured composite 40 vs published 43.8: delta -3.8. Band CHANGES (Functional to Developing). Filing trigger MET.

## Key Findings

- Why it matters: Berkshire is run on purpose as a hands-off owner. Its board told shareholders that workforce and human-capital matters belong to the operating businesses' own discretion, not to the parent.
- Why it matters: that choice shows up as a blind spot. With no parent-level process for detecting problems across roughly 60 subsidiaries, Awareness measures 2.2 out of 5.
- Why it matters: Berkshire is honest about failure in a way few companies are. Its annual shareholder letter names specific management mistakes without being forced to, which keeps Accountability at 2.6 rather than lower.
- Why it matters: the band moves. The measured composite is 40.0, which falls in the Developing band, against a published 43.8 in Functional. The move is only 3.8 points but it lands exactly on the 40/41 band line.

## Strongest Dimensions

Action and Boundaries (raw 3.0 each). The decentralised model genuinely preserves subsidiary autonomy and the parent is unusually clear about its own scope.

## Weakest Dimensions

Awareness (raw 2.2). The parent has, by deliberate design, no mechanism to see distress inside its own operating companies.

## Evidence Gaps

- No in-window evidence exists for this entity; the baseline rests on the public record.
- Berkshire publishes no consolidated sustainability or human-capital report, so subsidiary-level conditions could not be assessed.
- SEC filings were located through search and not fetched in full.
- No employee-review or community-testimony evidence was gathered across subsidiaries.

## Watch Flag

Re-test AWR and ACC if Berkshire publishes any consolidated human-capital or sustainability disclosure, or if a shareholder proposal on oversight framework reaches a vote. Re-test INT on progress against the 2050 net-zero ambition.

## Sources

- [https://www.sec.gov/Archives/edgar/data/1067983/000119312526106253/d882687ddef14a.htm](https://www.sec.gov/Archives/edgar/data/1067983/000119312526106253/d882687ddef14a.htm) (tier 5, 2026-04-10)
- [https://www.climateaction100.org/company-assessments/berkshire-hathaway-inc/](https://www.climateaction100.org/company-assessments/berkshire-hathaway-inc/) (tier 3, 2025-10-01)
- [https://www.berkshirehathaway.com/2025ar/2025ar.pdf](https://www.berkshirehathaway.com/2025ar/2025ar.pdf) (tier 4, 2026-02-28)
- [https://www.sec.gov/files/corpfin/no-action/14a-8/ncpprberkshire123025.pdf](https://www.sec.gov/files/corpfin/no-action/14a-8/ncpprberkshire123025.pdf) (tier 5, 2025-12-30)
- [https://www.asyousow.org/resolutions/2025/11/6-berkshire-hathaway-ghg-emissions-from-investments-and-underwriting-activities](https://www.asyousow.org/resolutions/2025/11/6-berkshire-hathaway-ghg-emissions-from-investments-and-underwriting-activities) (tier 3, 2025-11-06)

## Recommended Next Steps

Critical/Developing: consider a [Certified Assessment](/certified-assessments) for a structured improvement roadmap.

---

*This assessment is based on publicly available information and does not constitute a formal Compassion Benchmark Certified Assessment. For a comprehensive, assessor-led evaluation, visit compassionbenchmark.com/certified-assessments.*
