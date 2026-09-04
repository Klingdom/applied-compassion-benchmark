---
entity: "Bangladesh"
type: "Country"
sector: "Government (national)"
date: "2026-09-01"
composite_score: 35
band: "Developing"
scores:
  AWR: 2.4
  EMP: 2.4
  ACT: 2.4
  EQU: 2.4
  BND: 2.6
  ACC: 2.2
  SYS: 2.6
  INT: 2.2
published_index: "countries"
published_rank: 70
published_composite: 39.8
published_band: "developing"
assessed_composite: 35
score_delta: -4.8
band_change: false
recommendation: "confirm"
change_proposal: false
confidence: "low"
subdim_sidecar: true
source: "priority"
scan_file: "research/scans/2026-09-01.json"
watch_flag: "downward — assessed composite sits 0.2 points inside the filing threshold for a second consecutive assessment; a single corroborated tier-3-or-above source on state-attributable violence would make the next cycle filable"
---

# Compassion Benchmark Assessment: Bangladesh

**Entity type:** Country  
**Sector/Domain:** Government (national)  
**Assessment date:** 2026-09-01  
**Composite score:** 35/100  
**Band:** Developing  
**Cycle source:** priority (scan `research/scans/2026-09-01.json`)

## Why this entity was assessed

The scanner flagged Bangladesh on a report by the Dhaka-based Manabadhikar Shongskriti Foundation dated 1 September 2026 documenting a surge in killings, political violence and attacks on minorities during August 2026. Bangladesh was last assessed on 2026-07-24 (assessed 35.0 against a published 39.8, confirmation) and was upgraded +5.4 on 2026-06-16 on labour-law reform.

## Evidence-date, lifecycle and attribution checks

**GATE WARNING 2 — SOURCE INDEPENDENCE FAILS. This is the decisive finding for Bangladesh.**

The scanner lists two sources and marks both `date_verified: true`. They are **not two independent sources.** `ianslive.in` is the Indo-Asian News Service wire. `socialnews.xyz` is a syndication site republishing the same IANS item — same headline, same figures, same structure, one day earlier by timestamp. **Bangladesh's entire in-window evidence base is one wire story about one NGO report.**

The gate warning for this cycle requires a dated second source for corroboration, and directs that where corroboration is unavailable the finding be **downgraded to a confirmation**. That is what is done here. Two syndications of one wire do not corroborate each other.

**ATTRIBUTION — the report makes no state attribution, and this was checked directly.** On re-fetch, the IANS item documents killings, political violence and attacks on minorities but **does not attribute them to state forces or to the interim government**. It describes political violence, gang violence and various crimes without naming state actors as perpetrators. Scoring this against the Bangladeshi state as state conduct would be unsupported. What could legitimately be scored is protective failure — but a single un-corroborated NGO tally, with no state attribution and no independent verification, is not a sufficient basis to move a national score.

**FIGURES VERIFIED VERBATIM.** The scan's numbers check out against the source: "91 women and children were killed in August, up from 52 in July"; "267 people were injured in political violence in August compared to 95 in July" (the 181% increase the scan cites); "71 bodies found during the month, compared to 56 in July". The scan's characterisation of a "75% rise" in killings of women and children is arithmetically correct against 52 to 91.

**DATE CHECK.** The IANS URL timestamp encodes 2026-09-01; the syndication carries 2026-08-31. `evidence_date: 2026-09-01` matches the wire. Both carry explicit 2026. No year-confusion.

**SOURCE TIER.** Manabadhikar Shongskriti Foundation is a small Dhaka-based rights organisation. Its monthly tallies are a legitimate civil-society instrument but sit at tier 2, not at the tier-3 watchdog level of Human Rights Watch or Amnesty International. **No tier-3-or-above source on August 2026 Bangladesh was located.**

## Score Summary

| Dimension | Code | Raw (1-5) | Scaled (0-100) | Published raw | Delta (raw) |
|---|---|---|---|---|---|
| Awareness | AWR | 2.4 | 35 | 2.5 | -0.1 |
| Empathy | EMP | 2.4 | 35 | 2.5 | -0.1 |
| Action | ACT | 2.4 | 35 | 2.5 | -0.1 |
| Equity | EQU | 2.4 | 35 | 2.25 | 0.15 |
| Boundaries | BND | 2.6 | 40 | 3 | -0.4 |
| Accountability | ACC | 2.2 | 30 | 2.75 | -0.55 |
| Systemic Thinking | SYS | 2.6 | 40 | 2.75 | -0.15 |
| Integrity | INT | 2.2 | 30 | 2.5 | -0.3 |
| **Composite** | — | — | **35** | **39.8** | **-4.8** |

**Band:** Developing (published: developing). Integration premium: 0.

## Dimension Details

### AWR: Awareness (raw 2.4/5 — scaled 35/100)

| Subdimension | Score | Evidence and anchor match | Source |
|---|---|---|---|
| A1 Suffering Detection | 3/5 | Bangladeshi civil society organisations continue to compile and publish monthly violence tallies — the Manabadhikar Shongskriti Foundation counted 91 women and children killed in August against 52 in July. Detection mechanisms exist and function, though they are civil-society rather than state instruments. Anchor 3, held. | [T2](https://ianslive.in/bangladesh-sees-surge-in-killings-political-violence-attacks-on-minorities-in-august-report--20260901102239) 2026-09-01 |
| A2 Contextual Sensitivity | 2/5 | Held at the 2026-07-24 assessment value of 2. No movement: the sole in-window source is a single news-agency wire report of one NGO tally, with no state attribution and no tier-3-or-above corroboration. Per the cycle gate warning, uncorroborated sourcing is downgraded to a confirmation rather than scored. | [T1](https://www.socialnews.xyz/2026/08/31/bangladesh-sees-surge-in-killings-political-violence-attacks-on-minorities-in-august-report/) 2026-08-31 |
| A3 Blind Spot Mitigation | 3/5 | The recovery and counting of 71 bodies in a single month, published, indicates a process that surfaces findings. Anchor 3, held. NOT moved down: the report makes no state attribution and is un-corroborated. | [T2](https://ianslive.in/bangladesh-sees-surge-in-killings-political-violence-attacks-on-minorities-in-august-report--20260901102239) 2026-09-01 |
| A4 Signal Amplification | 2/5 | Held at the 2026-07-24 assessment value of 2. No movement: the sole in-window source is a single news-agency wire report of one NGO tally, with no state attribution and no tier-3-or-above corroboration. Per the cycle gate warning, uncorroborated sourcing is downgraded to a confirmation rather than scored. | [T1](https://www.socialnews.xyz/2026/08/31/bangladesh-sees-surge-in-killings-political-violence-attacks-on-minorities-in-august-report/) 2026-08-31 |
| A5 Anticipatory Awareness | 2/5 | Held at the 2026-07-24 assessment value of 2. No movement: the sole in-window source is a single news-agency wire report of one NGO tally, with no state attribution and no tier-3-or-above corroboration. Per the cycle gate warning, uncorroborated sourcing is downgraded to a confirmation rather than scored. | [T1](https://www.socialnews.xyz/2026/08/31/bangladesh-sees-surge-in-killings-political-violence-attacks-on-minorities-in-august-report/) 2026-08-31 |

### EMP: Empathy (raw 2.4/5 — scaled 35/100)

| Subdimension | Score | Evidence and anchor match | Source |
|---|---|---|---|
| E1 Affective Resonance | 2/5 | Held at the 2026-07-24 assessment value of 2. No movement: the sole in-window source is a single news-agency wire report of one NGO tally, with no state attribution and no tier-3-or-above corroboration. Per the cycle gate warning, uncorroborated sourcing is downgraded to a confirmation rather than scored. | [T1](https://www.socialnews.xyz/2026/08/31/bangladesh-sees-surge-in-killings-political-violence-attacks-on-minorities-in-august-report/) 2026-08-31 |
| E2 Perspective-Taking | 3/5 | Held at the 2026-07-24 assessment value of 3. No movement: the sole in-window source is a single news-agency wire report of one NGO tally, with no state attribution and no tier-3-or-above corroboration. Per the cycle gate warning, uncorroborated sourcing is downgraded to a confirmation rather than scored. | [T1](https://www.socialnews.xyz/2026/08/31/bangladesh-sees-surge-in-killings-political-violence-attacks-on-minorities-in-august-report/) 2026-08-31 |
| E3 Non-Judgment | 2/5 | Held at the 2026-07-24 assessment value of 2. No movement: the sole in-window source is a single news-agency wire report of one NGO tally, with no state attribution and no tier-3-or-above corroboration. Per the cycle gate warning, uncorroborated sourcing is downgraded to a confirmation rather than scored. | [T1](https://www.socialnews.xyz/2026/08/31/bangladesh-sees-surge-in-killings-political-violence-attacks-on-minorities-in-august-report/) 2026-08-31 |
| E4 Validation | 2/5 | Held at the 2026-07-24 assessment value of 2. No movement: the sole in-window source is a single news-agency wire report of one NGO tally, with no state attribution and no tier-3-or-above corroboration. Per the cycle gate warning, uncorroborated sourcing is downgraded to a confirmation rather than scored. | [T1](https://www.socialnews.xyz/2026/08/31/bangladesh-sees-surge-in-killings-political-violence-attacks-on-minorities-in-august-report/) 2026-08-31 |
| E5 Cultural Empathy | 3/5 | Held at the 2026-07-24 assessment value of 3. No movement: the sole in-window source is a single news-agency wire report of one NGO tally, with no state attribution and no tier-3-or-above corroboration. Per the cycle gate warning, uncorroborated sourcing is downgraded to a confirmation rather than scored. | [T1](https://www.socialnews.xyz/2026/08/31/bangladesh-sees-surge-in-killings-political-violence-attacks-on-minorities-in-august-report/) 2026-08-31 |

### ACT: Action (raw 2.4/5 — scaled 35/100)

| Subdimension | Score | Evidence and anchor match | Source |
|---|---|---|---|
| AC1 Responsiveness | 3/5 | Held at the 2026-07-24 assessment value of 3. No movement: the sole in-window source is a single news-agency wire report of one NGO tally, with no state attribution and no tier-3-or-above corroboration. Per the cycle gate warning, uncorroborated sourcing is downgraded to a confirmation rather than scored. | [T1](https://www.socialnews.xyz/2026/08/31/bangladesh-sees-surge-in-killings-political-violence-attacks-on-minorities-in-august-report/) 2026-08-31 |
| AC2 Proportionality | 2/5 | Held at the 2026-07-24 assessment value of 2. No movement: the sole in-window source is a single news-agency wire report of one NGO tally, with no state attribution and no tier-3-or-above corroboration. Per the cycle gate warning, uncorroborated sourcing is downgraded to a confirmation rather than scored. | [T1](https://www.socialnews.xyz/2026/08/31/bangladesh-sees-surge-in-killings-political-violence-attacks-on-minorities-in-august-report/) 2026-08-31 |
| AC3 Efficacy | 2/5 | Held at the 2026-07-24 assessment value of 2. No movement: the sole in-window source is a single news-agency wire report of one NGO tally, with no state attribution and no tier-3-or-above corroboration. Per the cycle gate warning, uncorroborated sourcing is downgraded to a confirmation rather than scored. | [T1](https://www.socialnews.xyz/2026/08/31/bangladesh-sees-surge-in-killings-political-violence-attacks-on-minorities-in-august-report/) 2026-08-31 |
| AC4 Resource Mobilization | 2/5 | Held at the 2026-07-24 assessment value of 2. No movement: the sole in-window source is a single news-agency wire report of one NGO tally, with no state attribution and no tier-3-or-above corroboration. Per the cycle gate warning, uncorroborated sourcing is downgraded to a confirmation rather than scored. | [T1](https://www.socialnews.xyz/2026/08/31/bangladesh-sees-surge-in-killings-political-violence-attacks-on-minorities-in-august-report/) 2026-08-31 |
| AC5 Follow-Through | 3/5 | Held at the 2026-07-24 assessment value of 3. No movement: the sole in-window source is a single news-agency wire report of one NGO tally, with no state attribution and no tier-3-or-above corroboration. Per the cycle gate warning, uncorroborated sourcing is downgraded to a confirmation rather than scored. | [T1](https://www.socialnews.xyz/2026/08/31/bangladesh-sees-surge-in-killings-political-violence-attacks-on-minorities-in-august-report/) 2026-08-31 |

### EQU: Equity (raw 2.4/5 — scaled 35/100)

| Subdimension | Score | Evidence and anchor match | Source |
|---|---|---|---|
| EQ1 Universality | 2/5 | Held at the 2026-07-24 assessment value of 2. No movement: the sole in-window source is a single news-agency wire report of one NGO tally, with no state attribution and no tier-3-or-above corroboration. Per the cycle gate warning, uncorroborated sourcing is downgraded to a confirmation rather than scored. | [T1](https://www.socialnews.xyz/2026/08/31/bangladesh-sees-surge-in-killings-political-violence-attacks-on-minorities-in-august-report/) 2026-08-31 |
| EQ2 Priority for Vulnerable | 2/5 | Held at the 2026-07-24 assessment value of 2. No movement: the sole in-window source is a single news-agency wire report of one NGO tally, with no state attribution and no tier-3-or-above corroboration. Per the cycle gate warning, uncorroborated sourcing is downgraded to a confirmation rather than scored. | [T1](https://www.socialnews.xyz/2026/08/31/bangladesh-sees-surge-in-killings-political-violence-attacks-on-minorities-in-august-report/) 2026-08-31 |
| EQ3 Bias Awareness | 2/5 | Held at the 2026-07-24 assessment value of 2. No movement: the sole in-window source is a single news-agency wire report of one NGO tally, with no state attribution and no tier-3-or-above corroboration. Per the cycle gate warning, uncorroborated sourcing is downgraded to a confirmation rather than scored. | [T1](https://www.socialnews.xyz/2026/08/31/bangladesh-sees-surge-in-killings-political-violence-attacks-on-minorities-in-august-report/) 2026-08-31 |
| EQ4 Access Design | 3/5 | Held at the 2026-07-24 assessment value of 3. No movement: the sole in-window source is a single news-agency wire report of one NGO tally, with no state attribution and no tier-3-or-above corroboration. Per the cycle gate warning, uncorroborated sourcing is downgraded to a confirmation rather than scored. | [T1](https://www.socialnews.xyz/2026/08/31/bangladesh-sees-surge-in-killings-political-violence-attacks-on-minorities-in-august-report/) 2026-08-31 |
| EQ5 Historical Harm Acknowledgment | 3/5 | Held at the 2026-07-24 assessment value of 3. No movement: the sole in-window source is a single news-agency wire report of one NGO tally, with no state attribution and no tier-3-or-above corroboration. Per the cycle gate warning, uncorroborated sourcing is downgraded to a confirmation rather than scored. | [T1](https://www.socialnews.xyz/2026/08/31/bangladesh-sees-surge-in-killings-political-violence-attacks-on-minorities-in-august-report/) 2026-08-31 |

### BND: Boundaries (raw 2.6/5 — scaled 40/100)

| Subdimension | Score | Evidence and anchor match | Source |
|---|---|---|---|
| B1 Self-Sustainability | 2/5 | Held at the 2026-07-24 assessment value of 2. No movement: the sole in-window source is a single news-agency wire report of one NGO tally, with no state attribution and no tier-3-or-above corroboration. Per the cycle gate warning, uncorroborated sourcing is downgraded to a confirmation rather than scored. | [T1](https://www.socialnews.xyz/2026/08/31/bangladesh-sees-surge-in-killings-political-violence-attacks-on-minorities-in-august-report/) 2026-08-31 |
| B2 Autonomy Preservation | 3/5 | Held at the 2026-07-24 assessment value of 3. No movement: the sole in-window source is a single news-agency wire report of one NGO tally, with no state attribution and no tier-3-or-above corroboration. Per the cycle gate warning, uncorroborated sourcing is downgraded to a confirmation rather than scored. | [T1](https://www.socialnews.xyz/2026/08/31/bangladesh-sees-surge-in-killings-political-violence-attacks-on-minorities-in-august-report/) 2026-08-31 |
| B3 Scope Clarity | 3/5 | Held at the 2026-07-24 assessment value of 3. No movement: the sole in-window source is a single news-agency wire report of one NGO tally, with no state attribution and no tier-3-or-above corroboration. Per the cycle gate warning, uncorroborated sourcing is downgraded to a confirmation rather than scored. | [T1](https://www.socialnews.xyz/2026/08/31/bangladesh-sees-surge-in-killings-political-violence-attacks-on-minorities-in-august-report/) 2026-08-31 |
| B4 Refusal Ethics | 3/5 | Held at the 2026-07-24 assessment value of 3. No movement: the sole in-window source is a single news-agency wire report of one NGO tally, with no state attribution and no tier-3-or-above corroboration. Per the cycle gate warning, uncorroborated sourcing is downgraded to a confirmation rather than scored. | [T1](https://www.socialnews.xyz/2026/08/31/bangladesh-sees-surge-in-killings-political-violence-attacks-on-minorities-in-august-report/) 2026-08-31 |
| B5 Consent Orientation | 2/5 | Held at the 2026-07-24 assessment value of 2. No movement: the sole in-window source is a single news-agency wire report of one NGO tally, with no state attribution and no tier-3-or-above corroboration. Per the cycle gate warning, uncorroborated sourcing is downgraded to a confirmation rather than scored. | [T1](https://www.socialnews.xyz/2026/08/31/bangladesh-sees-surge-in-killings-political-violence-attacks-on-minorities-in-august-report/) 2026-08-31 |

### ACC: Accountability (raw 2.2/5 — scaled 30/100)

| Subdimension | Score | Evidence and anchor match | Source |
|---|---|---|---|
| AB1 Harm Acknowledgment | 2/5 | Held at the 2026-07-24 assessment value of 2. No movement: the sole in-window source is a single news-agency wire report of one NGO tally, with no state attribution and no tier-3-or-above corroboration. Per the cycle gate warning, uncorroborated sourcing is downgraded to a confirmation rather than scored. | [T1](https://www.socialnews.xyz/2026/08/31/bangladesh-sees-surge-in-killings-political-violence-attacks-on-minorities-in-august-report/) 2026-08-31 |
| AB2 Correction Willingness | 2/5 | Injuries from political violence rose from 95 to 267 month on month. This would bear on correction willingness if corroborated, but rests on a single un-corroborated wire report and is therefore held at 2 rather than moved down. Anchor 2, held. | [T2](https://ianslive.in/bangladesh-sees-surge-in-killings-political-violence-attacks-on-minorities-in-august-report--20260901102239) 2026-09-01 |
| AB3 Transparency | 3/5 | Held at the 2026-07-24 assessment value of 3. No movement: the sole in-window source is a single news-agency wire report of one NGO tally, with no state attribution and no tier-3-or-above corroboration. Per the cycle gate warning, uncorroborated sourcing is downgraded to a confirmation rather than scored. | [T1](https://www.socialnews.xyz/2026/08/31/bangladesh-sees-surge-in-killings-political-violence-attacks-on-minorities-in-august-report/) 2026-08-31 |
| AB4 Systemic Learning | 2/5 | Held at the 2026-07-24 assessment value of 2. No movement: the sole in-window source is a single news-agency wire report of one NGO tally, with no state attribution and no tier-3-or-above corroboration. Per the cycle gate warning, uncorroborated sourcing is downgraded to a confirmation rather than scored. | [T1](https://www.socialnews.xyz/2026/08/31/bangladesh-sees-surge-in-killings-political-violence-attacks-on-minorities-in-august-report/) 2026-08-31 |
| AB5 Reparative Action | 2/5 | Held at the 2026-07-24 assessment value of 2. No movement: the sole in-window source is a single news-agency wire report of one NGO tally, with no state attribution and no tier-3-or-above corroboration. Per the cycle gate warning, uncorroborated sourcing is downgraded to a confirmation rather than scored. | [T1](https://www.socialnews.xyz/2026/08/31/bangladesh-sees-surge-in-killings-political-violence-attacks-on-minorities-in-august-report/) 2026-08-31 |

### SYS: Systemic Thinking (raw 2.6/5 — scaled 40/100)

| Subdimension | Score | Evidence and anchor match | Source |
|---|---|---|---|
| S1 Root Cause Orientation | 3/5 | Held at the 2026-07-24 assessment value of 3. No movement: the sole in-window source is a single news-agency wire report of one NGO tally, with no state attribution and no tier-3-or-above corroboration. Per the cycle gate warning, uncorroborated sourcing is downgraded to a confirmation rather than scored. | [T1](https://www.socialnews.xyz/2026/08/31/bangladesh-sees-surge-in-killings-political-violence-attacks-on-minorities-in-august-report/) 2026-08-31 |
| S2 Long-Term Impact | 3/5 | Held at the 2026-07-24 assessment value of 3. No movement: the sole in-window source is a single news-agency wire report of one NGO tally, with no state attribution and no tier-3-or-above corroboration. Per the cycle gate warning, uncorroborated sourcing is downgraded to a confirmation rather than scored. | [T1](https://www.socialnews.xyz/2026/08/31/bangladesh-sees-surge-in-killings-political-violence-attacks-on-minorities-in-august-report/) 2026-08-31 |
| S3 Interconnection Awareness | 2/5 | Held at the 2026-07-24 assessment value of 2. No movement: the sole in-window source is a single news-agency wire report of one NGO tally, with no state attribution and no tier-3-or-above corroboration. Per the cycle gate warning, uncorroborated sourcing is downgraded to a confirmation rather than scored. | [T1](https://www.socialnews.xyz/2026/08/31/bangladesh-sees-surge-in-killings-political-violence-attacks-on-minorities-in-august-report/) 2026-08-31 |
| S4 Structural Critique | 2/5 | Held at the 2026-07-24 assessment value of 2. No movement: the sole in-window source is a single news-agency wire report of one NGO tally, with no state attribution and no tier-3-or-above corroboration. Per the cycle gate warning, uncorroborated sourcing is downgraded to a confirmation rather than scored. | [T1](https://www.socialnews.xyz/2026/08/31/bangladesh-sees-surge-in-killings-political-violence-attacks-on-minorities-in-august-report/) 2026-08-31 |
| S5 Coalitional Compassion | 3/5 | Held at the 2026-07-24 assessment value of 3. No movement: the sole in-window source is a single news-agency wire report of one NGO tally, with no state attribution and no tier-3-or-above corroboration. Per the cycle gate warning, uncorroborated sourcing is downgraded to a confirmation rather than scored. | [T1](https://www.socialnews.xyz/2026/08/31/bangladesh-sees-surge-in-killings-political-violence-attacks-on-minorities-in-august-report/) 2026-08-31 |

### INT: Integrity (raw 2.2/5 — scaled 30/100)

| Subdimension | Score | Evidence and anchor match | Source |
|---|---|---|---|
| I1 Consistency Under Pressure | 2/5 | Held at the 2026-07-24 assessment value of 2. No movement: the sole in-window source is a single news-agency wire report of one NGO tally, with no state attribution and no tier-3-or-above corroboration. Per the cycle gate warning, uncorroborated sourcing is downgraded to a confirmation rather than scored. | [T1](https://www.socialnews.xyz/2026/08/31/bangladesh-sees-surge-in-killings-political-violence-attacks-on-minorities-in-august-report/) 2026-08-31 |
| I2 Non-Performance | 3/5 | Held at the 2026-07-24 assessment value of 3. No movement: the sole in-window source is a single news-agency wire report of one NGO tally, with no state attribution and no tier-3-or-above corroboration. Per the cycle gate warning, uncorroborated sourcing is downgraded to a confirmation rather than scored. | [T1](https://www.socialnews.xyz/2026/08/31/bangladesh-sees-surge-in-killings-political-violence-attacks-on-minorities-in-august-report/) 2026-08-31 |
| I3 Internal Consistency | 2/5 | Held at the 2026-07-24 assessment value of 2. No movement: the sole in-window source is a single news-agency wire report of one NGO tally, with no state attribution and no tier-3-or-above corroboration. Per the cycle gate warning, uncorroborated sourcing is downgraded to a confirmation rather than scored. | [T1](https://www.socialnews.xyz/2026/08/31/bangladesh-sees-surge-in-killings-political-violence-attacks-on-minorities-in-august-report/) 2026-08-31 |
| I4 Values Alignment | 2/5 | Held at the 2026-07-24 assessment value of 2. No movement: the sole in-window source is a single news-agency wire report of one NGO tally, with no state attribution and no tier-3-or-above corroboration. Per the cycle gate warning, uncorroborated sourcing is downgraded to a confirmation rather than scored. | [T1](https://www.socialnews.xyz/2026/08/31/bangladesh-sees-surge-in-killings-political-violence-attacks-on-minorities-in-august-report/) 2026-08-31 |
| I5 Resilience of Care | 2/5 | Held at the 2026-07-24 assessment value of 2. No movement: the sole in-window source is a single news-agency wire report of one NGO tally, with no state attribution and no tier-3-or-above corroboration. Per the cycle gate warning, uncorroborated sourcing is downgraded to a confirmation rather than scored. | [T1](https://www.socialnews.xyz/2026/08/31/bangladesh-sees-surge-in-killings-political-violence-attacks-on-minorities-in-august-report/) 2026-08-31 |

## Published Index Comparison

**Published index:** countries | **Published rank:** #70 | **Published composite:** 39.8/100 | **Published band:** developing

Canonical reconstruction of the published dimension vector returns **39.8**, against a published composite of **39.8**. Difference is within 0.5 points, so there is no math-hygiene issue.

Assessed 35.0 against published 39.8 — delta -4.8, no band change. Confirmation.

**The dimension vector is held identical to the 2026-07-24 assessment.** Nothing moved. That is a deliberate decision on evidence quality, not an oversight: the only in-window evidence is a single wire report of a single NGO tally with no state attribution and no tier-3 corroboration.

**A note the reviewer should not miss.** Bangladesh has now been assessed at 35.0 against a published 39.8 twice — on 2026-07-24 and again here. **The gap is -4.8, which is 0.2 points inside the 5.0 filing threshold.** A single additional subdimension moving down anywhere in the vector would push it to -5.4 and make it filable. That has not been done, because the evidence to justify moving a specific subdimension does not exist at the required quality. But the position should be visible rather than buried: Bangladesh is one corroborated source away from a filable downgrade, and it has been for two cycles.

Bangladesh's published 39.8 also sits 0.2 points below the Functional band floor at 40.0. It is a narrow entity in both directions.

## Key Findings

- A Dhaka rights group counted 91 women and children killed in Bangladesh in August 2026, up from 52 in July. Injuries from political violence rose from 95 to 267. Seventy-one bodies were recovered, up from 56.
- The benchmark did not move Bangladesh's score on this, and the reason is sourcing. The scan's two sources are the same news-agency story republished. One wire item is not two sources.
- The report does not blame the state. It documents political violence, gang violence and crime without naming government forces as perpetrators. Scoring it against the interim government would not be supported by the evidence.
- Bangladesh's assessed score is 35.0 against a published 39.8 — a gap of 4.8 points. The benchmark files a change at 5.0. Bangladesh has sat 0.2 points inside that line for two assessments running.
- Bangladesh's published 39.8 is also 0.2 points below the Functional band. It is finely balanced on both edges, and that is worth watching rather than acting on now.

## Strongest Dimensions

**Boundaries (2.6)** and **Systemic Thinking (2.6)**, both held. These carry the 2026-06-16 upgrade: the November 2025 labour-law reforms that eased union formation to a 20-worker threshold, added 120-day maternity leave, extended coverage to domestic, agricultural and shipbreaking workers, and the ratification of ILO Conventions C155, C187 and C190. Those are structural changes and they have not been reversed.

## Weakest Dimensions

**Accountability (2.2)** and **Integrity (2.2)**, both held. Bangladesh retains an ITUC Rating 5 — "no guarantee of rights" — and special economic zone workers remain excluded from union rights. The August violence tally, if it were corroborated at a higher tier, would bear most directly on these two dimensions.

## Evidence Gaps

- THE PRIMARY GAP: Bangladesh has one in-window source, republished twice. No independent corroboration of the Manabadhikar Shongskriti Foundation figures was located.
- No tier-3-or-above source (Human Rights Watch, Amnesty International, a UN body) on August 2026 Bangladesh was located.
- The report makes no attribution of the violence to state or non-state actors, so no attribution-based scoring was possible in either direction.
- No evidence was located on the interim government's response to the reported surge, which would be the scorable conduct if it existed.

## Disclosure — what this score measures

**This assessment deliberately declines to move a score it could have moved.** The reported figures are severe — a 75% month-on-month rise in killings of women and children. Moving Bangladesh down on them would have been easy and would have produced a filable proposal. It is not done, because the evidence is one wire report of one small NGO's tally, with no state attribution and no independent corroboration.

The scoring convention is applied unchanged: absence of disclosure scores 2, never 1. Nothing here is scored 1 on absence.

The near-threshold position (-4.8 against a 5.0 trigger) is disclosed explicitly rather than resolved by nudging a subdimension. Manufacturing the extra 0.6 points would have been the false positive this cycle was warned against.

## Recommendation

**Confirm. No change proposal.** Delta -4.8, inside the threshold; no band crossing. Filed as a confirmation on the gate-warning instruction that uncorroborated sourcing be downgraded to confirmation.

**Watch flag (downward), second consecutive cycle at -4.8.** If a single tier-3-or-above source corroborates the August 2026 violence figures, or attributes any of it to state action or state failure to protect, the next cycle becomes filable immediately. The scanner should be directed to seek HRW, Amnesty or UN sourcing on Bangladesh specifically.

**Confidence: low**, on source quality — not on the analysis.

## Sources

- [IANS Live — "Bangladesh sees surge in killings, political violence, attacks on minorities in August: Report", 2026-09-01](https://ianslive.in/bangladesh-sees-surge-in-killings-political-violence-attacks-on-minorities-in-august-report--20260901102239) (tier 2, reporting Manabadhikar Shongskriti Foundation)
- [Social News XYZ, 2026-08-31](https://www.socialnews.xyz/2026/08/31/bangladesh-sees-surge-in-killings-political-violence-attacks-on-minorities-in-august-report/) (tier 1 — SYNDICATION OF THE SAME IANS WIRE, not independent corroboration)
- Prior cycle record: `research/assessments/bangladesh-2026-07-24.md` (assessed 35.0, same vector)
- Baseline provenance: `research/APPLIED_CHANGES.md` 2026-06-16 (Bangladesh 34.4 to 39.8, +5.4, labour-law reform)

## Recommended Next Steps

- **Critical/Developing**: Consider a [Certified Assessment](/certified-assessments) for a structured improvement roadmap.

---

*This assessment is based on publicly available information and does not constitute a formal Compassion Benchmark Certified Assessment. For a comprehensive, assessor-led evaluation, visit compassionbenchmark.com/certified-assessments.*
