---
entity: "Australia"
type: "Country"
sector: "Government (national)"
date: "2026-09-24"
composite_score: 48.8
band: "Functional"
scores:
  AWR: 3.4
  EMP: 2.8
  ACT: 3.0
  EQU: 2.8
  BND: 2.8
  ACC: 3.0
  SYS: 3.2
  INT: 2.6
published_index: "countries"
published_rank: 23
published_composite: 62.5
published_band: "established"
published_dimensions:
  AWR: 3.5
  EMP: 3.5
  ACT: 3.5
  EQU: 3.0
  BND: 4.0
  ACC: 3.5
  SYS: 3.5
  INT: 3.5
assessed_composite: 48.8
score_delta: -13.7
band_change: true
filing_trigger_met: true
filing_trigger: "magnitude (-13.7) and band crossing (Established -> Functional)"
outcome: "proposal"
recommendation: "downgrade"
change_proposal: true
confidence: "medium"
subdim_sidecar: true
seed_baseline_recalibration: true
watch_flag: true
source: "priority"
scan_file: "research/scans/2026-09-24.json"
integration_premium: 0
methodology_version: "v1.2"
math_hygiene_reconstruction_diff: 0
---

# Compassion Benchmark Assessment: Australia

**Entity type:** Country
**Sector/Domain:** Government (national)
**Assessment date:** 2026-09-24
**Composite score:** 48.8/100
**Band:** Functional
**Cycle:** catch-up nightly, lookback 2026-09-10 to 2026-09-24 (scan `research/scans/2026-09-24.json`, source: priority)
**Outcome:** change proposal (recommendation: downgrade)

## Why this entity was assessed

The scanner flagged Australia (priority 74) on two items. Human Rights Watch published *"25 Years of Abusive Offshore Detention"* on 10 September 2026. Home Affairs Minister Tony Burke announced an immigration enforcement expansion on 17-18 September 2026. Australia was last assessed on 2026-04-29.

## Evidence-date, provenance, attribution and screening checks

**BASELINE PROVENANCE (read first).** `research/APPLIED_CHANGES.md` contains no Australia entry. No Australia change proposal exists on disk. The published vector is `3.5 / 3.5 / 3.5 / 3.0 / 4.0 / 3.5 / 3.5 / 3.5` — six of eight dimensions at exactly 3.5, which is the uniform 62.5 seed pattern named in the 2026-08-20 applied batch. The published 62.5 is therefore an **unassessed placeholder**, not a prior measurement. This is the first evidence-based baseline for Australia.

**No stale-baseline argument is used for the direction of travel.** The movement is downward, which is the direction the in-window evidence points. Screening rule 3 is satisfied: the entity surfaced on negative within-window evidence and the proposal is a downgrade.

**HISTORICAL RECORD SEPARATED FROM IN-WINDOW CONDUCT.** The HRW report covers 25 years. Most of its content (over 5,000 people transferred since 2001, at least 14 deaths since 2012, the 2024 Migration Act amendment, the 2025 Nauru agreement) is **historical context**, not in-window conduct. It is used here only where it establishes a *continuing* state of affairs that in-window conduct confirms. The genuinely in-window conduct is: the publication of the report itself (10 September, an external finding), and the 17-18 September enforcement announcement.

**IN-WINDOW CONDUCT SCORED.** Al Jazeera (18 September 2026) reports 100 additional compliance officers, 250 new detention beds, a "No Further Stay" condition blocking onshore tourist-visa applications, and student-visa progression rules. Approximately 77,000 people in Australia without a valid visa face detention or forced departure. The Human Rights Law Centre warned the measures could deter exploited undocumented workers from reporting workplace abuse.

**NAURU DEPORTATION FIGURE NOT USED.** The scan cites "~350 people" agreed for deportation to Nauru. Neither fetched source states that figure. The Al Jazeera article contains no Nauru content. The HRW report describes the 2025 Nauru agreement and ~110 current detainees, not 350 deportations. **The 350 figure is not corroborated and is not scored.**

**COUNTERVAILING EVIDENCE SOUGHT AND FOUND.** The Productivity Commission's sixth Closing the Gap Annual Data Compilation Report (29 July 2026) reports that of 19 targets, one is met, three are on track, five are improving but off track, and four are worsening — suicide, adult imprisonment, children in out-of-home care, and children developmentally on track. That a government agency publishes four worsening outcomes against its own commitments is genuine transparency and is scored upward in AB3.

## Score Summary

| Dimension | Code | Raw (1-5) | Scaled (0-100) | Published raw | Change |
|-----------|------|-----------|----------------|---------------|--------|
| Awareness | AWR | 3.4 | 60.0 | 3.5 | -0.1 |
| Empathy | EMP | 2.8 | 45.0 | 3.5 | -0.7 |
| Action | ACT | 3.0 | 50.0 | 3.5 | -0.5 |
| Equity | EQU | 2.8 | 45.0 | 3.0 | -0.2 |
| Boundaries | BND | 2.8 | 45.0 | 4.0 | -1.2 |
| Accountability | ACC | 3.0 | 50.0 | 3.5 | -0.5 |
| Systemic Thinking | SYS | 3.2 | 55.0 | 3.5 | -0.3 |
| Integrity | INT | 2.6 | 40.0 | 3.5 | -0.9 |
| **Composite** | — | — | **48.8** | **62.5** | **-13.7** |

Integration premium: 0.0 (eight dimensions below 4.0, so the weakness factor is zero). Canonical reconstruction of the published vector returns 62.5 exactly — **no math-hygiene issue.**

## Dimension Details

### AWR: Awareness (3.4 raw / 60.0 scaled)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| A1 Suffering Detection | 4/5 | Closing the Gap dashboard publishes 19 disaggregated targets, reviewed annually by an independent statutory body. Multiple formal pathways with regular review. | Productivity Commission, 2026-07-29 |
| A2 Contextual Sensitivity | 3/5 | Differentiated services exist (Aboriginal Community Controlled Health Organisations, NDIS individualised plans), but the 2023 Voice referendum defeat removed the proposed structural co-design channel. Genuine effort, gaps remain. | Productivity Commission, 2026-07-29 |
| A3 Blind Spot Mitigation | 4/5 | Royal Commissions into Robodebt, Disability and Aged Care were external assessments that found significant harm and produced course correction. Offshore detention is not a blind spot but a maintained choice. | HRW, 2026-09-10 |
| A4 Signal Amplification | 3/5 | The Australian Human Rights Commission has a statutory role and reports regularly, but its detention findings are routinely not acted on. Designated role, limited influence. | HRW, 2026-09-10 |
| A5 Anticipatory Awareness | 3/5 | Statements of compatibility with human rights are required for all bills, but the 2024 third-country-removal amendment proceeded despite adverse assessment. Formal assessment for some decisions. | HRW, 2026-09-10 |

### EMP: Empathy (2.8 raw / 45.0 scaled)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| E1 Affective Resonance | 3/5 | Training and service standards exist across Services Australia; the Robodebt scheme showed purely transactional treatment at scale. Inconsistent. | HRW, 2026-09-10 |
| E2 Perspective-Taking | 3/5 | Royal Commissions used lived-experience commissioners and changed policy; the Voice, which would have made community members decision-makers, was rejected. | Productivity Commission, 2026-07-29 |
| E3 Non-Judgment | 3/5 | Disaggregated outcome data published; Indigenous adult imprisonment is worsening with no effective correction. | Productivity Commission, 2026-07-29 |
| E4 Validation | 2/5 | HRW records 25 years in which harm reports were met with legal and legislative responses rather than acknowledgment. A refugee is quoted: "Mentally, I lost everything, I lost my golden age, I lost my health, lost my time". | HRW, 2026-09-10 |
| E5 Cultural Empathy | 3/5 | ACCHOs are genuine community-designed adaptations in health. Not extended to the border regime. | Productivity Commission, 2026-07-29 |

### ACT: Action (3.0 raw / 50.0 scaled)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| AC1 Responsiveness | 3/5 | Service standards published and largely met for mainstream programs; claim backlogs recur. | Productivity Commission, 2026-07-29 |
| AC2 Proportionality | 3/5 | NDIS is individually needs-assessed; cost-control reforms have reduced supports for some participants. | HRW, 2026-09-10 (context) |
| AC3 Efficacy | 4/5 | The Robodebt scheme was discontinued and repaid after evidence of harm — a program ended because of data. | HRW, 2026-09-10 (context) |
| AC4 Resource Mobilization | 3/5 | HRW reports the annual cost per person detained on Nauru reached A$9 million (US$6.5 million) in 2025, and A$2.5 billion (US$1.8 billion) paid to Nauru. Allocation does not follow need. | HRW, 2026-09-10 |
| AC5 Follow-Through | 2/5 | HRW documents people on rolling six-month visas a decade after release, and the Nauru agreement converting a transit arrangement into a permanent endpoint. Follow-up is not systematic. | HRW, 2026-09-10 |

### EQU: Equity (2.8 raw / 45.0 scaled)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| EQ1 Universality | 2/5 | Medicare is near-universal for residents, but maritime arrivals are barred by statute from settlement and 77,000 people without valid visas now face detention or departure. Universal access stated, whole populations excluded. | Al Jazeera, 2026-09-18 |
| EQ2 Priority for Vulnerable | 3/5 | Documented prioritisation decisions exist (NDIS, Closing the Gap funding) alongside A$2.5bn to Nauru. | HRW, 2026-09-10 |
| EQ3 Bias Awareness | 3/5 | Disparities identified annually and investigated; four targets worsening without effective correction. | Productivity Commission, 2026-07-29 |
| EQ4 Access Design | 3/5 | Disability Discrimination Act obligations, interpreter and Easy Read provision; barrier mapping partial. | Productivity Commission, 2026-07-29 |
| EQ5 Historical Harm Acknowledgment | 3/5 | The 2008 Apology, the National Redress Scheme and Stolen Generations redress are formal acknowledgments of specific harms with community involvement. Treaty and truth-telling remain incomplete. | Productivity Commission, 2026-07-29 |

### BND: Boundaries (2.8 raw / 45.0 scaled)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| B1 Self-Sustainability | 3/5 | Public service and health workforce structures exist; turnover and burnout data not published against need. | (evidence gap) |
| B2 Autonomy Preservation | 3/5 | NDIS is explicitly capacity-building; mutual-obligation welfare conditionality works the other way. | (mixed) |
| B3 Scope Clarity | 3/5 | Eligibility rules are published and communicated at intake for mainstream programs. | Al Jazeera, 2026-09-18 |
| B4 Refusal Ethics | 2/5 | The in-window finding. Australia's answer to people it will not help is to pay another state to hold them permanently. HRW: Nauru received an estimated A$2.5 billion "to accept people whom Australia rejects and expels", turning it into a permanent endpoint. Refusal without a concrete alternative. | HRW, 2026-09-10 |
| B5 Consent Orientation | 3/5 | Health and research consent frameworks (NHMRC) are strong; detention transfers occur without consent. | HRW, 2026-09-10 |

### ACC: Accountability (3.0 raw / 50.0 scaled)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| AB1 Harm Acknowledgment | 2/5 | 14 deaths in offshore detention since 2012 with no acknowledgment of responsibility; Robodebt acknowledged only after a Royal Commission established it. | HRW, 2026-09-10 |
| AB2 Correction Willingness | 3/5 | Robodebt was abolished and repaid — at least one significant course correction on harm evidence. Offshore detention continues after 25 years of documented harm. | HRW, 2026-09-10 |
| AB3 Transparency | 4/5 | The Productivity Commission's own 2026 report states four Closing the Gap targets are worsening. Annual government reporting that includes failures, gaps and corrective actions. | Productivity Commission, 2026-07-29 |
| AB4 Systemic Learning | 3/5 | Formal systemic review through Royal Commissions with documented changes; detention failures recur across two decades. | HRW, 2026-09-10 |
| AB5 Reparative Action | 3/5 | Robodebt repayment and the National Redress Scheme are meaningful repair in at least one case; offshore detainees received minimal settlement relative to documented harm. | HRW, 2026-09-10 |

### SYS: Systemic Thinking (3.2 raw / 55.0 scaled)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| S1 Root Cause Orientation | 3/5 | Closing the Gap Priority Reforms and justice reinvestment target structural causes; resourcing is partial. | Productivity Commission, 2026-07-29 |
| S2 Long-Term Impact | 4/5 | Closing the Gap runs to 2031 with tracked targets and published annual progress; the Intergenerational Report models a 40-year horizon. | Productivity Commission, 2026-07-29 |
| S3 Interconnection Awareness | 3/5 | Housing, health and NDIS interface effects are identified in review reports; systematic mapping is incomplete. | Productivity Commission, 2026-07-29 |
| S4 Structural Critique | 3/5 | The Productivity Commission publicly criticised governments' own failure to share decision-making power — a position carrying institutional risk. | Productivity Commission, 2026-07-29 |
| S5 Coalitional Compassion | 3/5 | Active regional coalition member with documented contributions; the Nauru arrangement is extractive rather than collaborative. | HRW, 2026-09-10 |

### INT: Integrity (2.6 raw / 40.0 scaled)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| I1 Consistency Under Pressure | 2/5 | Refugee commitments have been abandoned under political pressure across successive governments for 25 years; the in-window announcement expands enforcement amid migration politics. | HRW, 2026-09-10; Al Jazeera, 2026-09-18 |
| I2 Non-Performance | 3/5 | Medicare and Closing the Gap reporting are maintained regardless of reputational benefit, including when the data is unflattering. | Productivity Commission, 2026-07-29 |
| I3 Internal Consistency | 3/5 | Public sector conditions broadly reflect stated values; no independent assessment located. | (evidence gap) |
| I4 Values Alignment | 2/5 | The 2024 Migration Act amendment enabling third-country reception, and the 2025 Nauru agreement, contradict Australia's stated human-rights commitments without acknowledgment. | HRW, 2026-09-10 |
| I5 Resilience of Care | 3/5 | Medicare and the NDIS have survived multiple leadership transitions in policy; so has offshore detention. | HRW, 2026-09-10 |

## Published Index Comparison

**Published index:** countries | **Published rank:** #23 of 191 | **Published composite:** 62.5/100 | **Published band:** Established

| Dimension | Published (raw) | Published (scaled) | Research | Difference | Explanation |
|---|---|---|---|---|---|
| AWR | 3.5 | 62.5 | 60.0 | -2.5 | Broadly confirmed; Closing the Gap reporting carries this dimension. |
| EMP | 3.5 | 62.5 | 45.0 | -17.5 | E4 Validation at 2/5 on the in-window HRW finding of 25 years of non-acknowledgment. |
| ACT | 3.5 | 62.5 | 50.0 | -12.5 | AC5 Follow-Through at 2/5: HRW documents indefinite limbo and permanent third-country placement. |
| EQU | 3.0 | 50.0 | 45.0 | -5.0 | EQ1 at 2/5: statutory exclusion of maritime arrivals plus 77,000 people facing detention. |
| BND | 4.0 | 75.0 | 45.0 | -30.0 | Largest single change. **The published 4.0 had no evidence base — it is the seed value.** B4 Refusal Ethics at 2/5 is directly evidenced by the Nauru arrangement. |
| ACC | 3.5 | 62.5 | 50.0 | -12.5 | AB1 at 2/5 on 14 unacknowledged deaths, partly offset by AB3 at 4/5 on genuine transparency. |
| SYS | 3.5 | 62.5 | 55.0 | -7.5 | Broadly confirmed; long-horizon planning is real. |
| INT | 3.5 | 62.5 | 40.0 | -22.5 | I1 and I4 at 2/5 on a documented pattern of abandoning stated commitments under political pressure. |
| **Composite** | — | **62.5** | **48.8** | **-13.7** | Band crossing: Established to Functional. |

### Score Difference Analysis

The published 62.5 implies a country whose compassion practices are "systematic, documented, and improving" across the board. The evidence supports that description for Australia's domestic welfare, health and Indigenous-policy reporting machinery. It does not support it for how Australia treats people who arrive asking for protection — and the published vector contains no dimension that registers that split.

The two largest changes are BND (-30.0 scaled) and INT (-22.5 scaled). Both rest on the same underlying fact pattern: what Australia does when it decides not to help. B4 Refusal Ethics is the subdimension the benchmark provides for exactly this question, and the answer HRW documents — paying another state A$2.5 billion to take people permanently — is an anchor-2 answer, not an anchor-4 one. The published BND 4.0 asserted "warm referral in at least 80% of cases, outcomes tracked." No evidence for that assertion exists; it is the seed value.

The honest caveat: roughly half of the -13.7 movement is **de-seeding**, meaning it measures the absence of evidence for anchors 4 and 5 against a placeholder that asserted them. The other half rests on the in-window HRW finding and the 17-18 September enforcement announcement. This is the same category as the Cerebras Systems and Marriott International changes applied on 2026-08-20.

### Recommendation

The published score is **overstated**. Propose 48.8, Functional. Confidence medium: the direction and the evidence for each subdimension are solid, but the magnitude partly reflects replacement of an unassessed placeholder rather than a measured deterioration in conduct.

## Key Findings

- Why it matters: Australia runs two systems at once, and the benchmark should say so. Its domestic reporting is genuinely open — the government's own Productivity Commission published on 29 July 2026 that four Closing the Gap targets are getting worse.
- Why it matters: the border system has now been abusive for a quarter of a century. Human Rights Watch counted at least 14 deaths in offshore detention since 2012 and more than 5,000 people sent to Nauru and Manus Island since 2001.
- Why it matters: Australia's answer for people it refuses is to pay another country to keep them. Nauru received about A$2.5 billion to take people Australia rejects, permanently.
- Why it matters: the cost is not the constraint. Holding one person on Nauru cost A$9 million a year in 2025.
- Why it matters: the published score of 62.5 out of 100 was never measured. Six of its eight numbers were identical placeholders. This is Australia's first evidence-based score: 48.8 out of 100.

## Strongest Dimensions

Awareness (raw 3.4) and Systemic Thinking (raw 3.2), both carried by Closing the Gap's disaggregated public reporting and 2031 horizon.

## Weakest Dimensions

Integrity (raw 2.6). Australia's stated human-rights commitments and its migration legislation point in opposite directions, and the gap is not acknowledged.

## Evidence Gaps

- No independent assessment of Australian Public Service staff wellbeing was located, so B1 and I3 are scored at the middle anchor on stated-practice evidence only.
- The scan's "~350 deportations to Nauru" figure could not be corroborated in either fetched source and was excluded.
- HRW is a tier-3 watchdog source. No tier-4 or tier-5 treaty-body finding dated inside this window was located, which is why confidence is medium rather than high.

## Recommended Next Steps

**Functional** band: consider [Advisory Support](/advisory) to translate benchmark insights into strategic action.

## Sources

- Human Rights Watch — 2026-09-10 — tier 3 — https://www.hrw.org/news/2026/09/10/australia-25-years-of-abusive-offshore-detention-0
- Al Jazeera — 2026-09-18 — tier 2 — https://www.aljazeera.com/news/2026/9/18/australia-to-detain-tourists-who-overstay-visas-amid-immigration-crackdown
- Productivity Commission, Closing the Gap Annual Data Compilation Report — 2026-07-29 — tier 5 — https://www.pc.gov.au/closing-the-gap-data/annual-data-report/2025/
- National Indigenous Times — 2026-07-29 — tier 2 — https://nit.com.au/29-07-2026/25613/governments-urged-to-redouble-efforts-on-closing-the-gap-halfway-through-agreement

---

*This assessment is based on publicly available information and does not constitute a formal Compassion Benchmark Certified Assessment. For a comprehensive, assessor-led evaluation, visit compassionbenchmark.com/certified-assessments.*
