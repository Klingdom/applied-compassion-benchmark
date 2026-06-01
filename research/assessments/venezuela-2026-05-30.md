---
entity: "Venezuela"
type: "Country"
sector: "Government"
date: "2026-05-30"
composite_score: 18.0
band: "Critical"
scores:
  AWR: 1.8
  EMP: 1.8
  ACT: 1.6
  EQU: 1.6
  BND: 1.5
  ACC: 1.9
  SYS: 1.8
  INT: 1.9
published_index: "countries"
published_rank: 154
published_composite: 18.0
published_band: "critical"
assessment_kind: "carry-forward-confirmation-mixed-signal-net-neutral"
---

# Compassion Benchmark Assessment: Venezuela (2026-05-30)

**Trigger:** Priority flag (priority_score 47, T1). Scanner: NPR May 25 — prisoner releases fall short, 500+ remain per Foro Penal; UN FFM — 87 new politically motivated detentions since Jan 3; amnesty bill lacks accountability mechanisms; UN — repressive state apparatus intact; Maduro arraigned Manhattan federal court Jan 5; 621 released as of March 8.

## Drift-Guard Check

Published composite 18.0; canonical reconstruction of published dims = 18.4 (diff +0.4, within rounding tolerance, below the 0.5 math-hygiene gate). Working baseline = 18.0. Drift = 0.4 (sub-gate) -> **ACCEPT** (no math-hygiene flag).

## Carry-Forward Confirmation — Mixed Signal Nets Neutral

Two opposing-valence signals net to neutral:
- (+) Prisoner releases (621 as of March 8) — a partial, documented release.
- (−) Releases fall short (500+ still held per Foro Penal); 87 new politically motivated detentions since Jan 3 (UN FFM); amnesty bill lacks accountability mechanisms; UN assesses the repressive state apparatus as intact.

The release activity is offset by concurrent new detentions and the absence of structural accountability — a "churn" pattern (releasing some while detaining others) that does not constitute a creditable structural improvement. No new dated institutional act since the existing baseline window. Hold at 18.0.

| Dimension | Code | Raw | Evidence | Source |
|-----------|------|-----|----------|--------|
| AWR | AWR | 1.8 | Repression apparatus intact | UN FFM Mar 2026 |
| EMP | EMP | 1.8 | Partial releases; continued detentions | NPR May 25 |
| ACT | ACT | 1.6 | 87 new political detentions since Jan 3 | UN FFM |
| EQU | EQU | 1.6 | Political targeting | OHCHR |
| BND | BND | 1.5 | No consent/autonomy for detainees | (baseline) |
| ACC | ACC | 1.9 | Amnesty bill lacks accountability mechanisms | NPR May 25 |
| SYS | SYS | 1.8 | Structural repression unaddressed | UN |
| INT | INT | 1.9 | Release-and-detain churn undercuts commitments | NPR May 25 |

**Composite:** 18.0 (carry-forward; recon 18.4 within rounding, no flag).

## Key Findings
- Mixed signal nets neutral: 621 released vs 500+ still held + 87 new detentions since Jan 3.
- Amnesty bill lacks accountability mechanisms; UN: repressive apparatus intact.
- "Release-and-detain churn" is not a creditable structural improvement.
- Minor reconstruction diff (+0.4) within rounding tolerance — no math-hygiene flag.

## Recommendation
**CONFIRM at 18.0 (carry-forward, mixed signal net-neutral).** Open watch: a verified, structural release with accountability mechanisms (upward) or a documented escalation of political detentions (downward). Confidence: MEDIUM-HIGH.

## Sources
- https://www.npr.org/2026/05/25/nx-s1-5831506/venezuelas-government-prisoners-us
- https://news.un.org/en/story/2026/03/1167126
- https://www.ohchr.org/en/press-releases/2026/03/venezuela-uncertainty-venezuela-must-give-way-meaningful-human-rights-change

*This assessment is based on publicly available information and does not constitute a formal Compassion Benchmark Certified Assessment.*
