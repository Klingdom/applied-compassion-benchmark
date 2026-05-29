---
entity: "UnitedHealth Group"
type: "Company"
sector: "Healthcare / Managed Care"
date: "2026-05-29"
composite_score: 10.2
band: "Critical"
scores:
  AWR: 1.75
  EMP: 1.25
  ACT: 1.5
  EQU: 1.25
  BND: 1.5
  ACC: 1.125
  SYS: 1.5
  INT: 1.375
published_index: "fortune-500"
published_rank: 445
published_composite: 11.4
published_band: "critical"
assessment_kind: "scored-event-downgrade-governance-under-criminal-probe"
---

# Compassion Benchmark Assessment: UnitedHealth Group (2026-05-29)

**Trigger:** Priority flag (priority_score 60, T2). DOJ criminal/civil Medicare probe expanding to Optum Rx physician-compensation practices; CEO Andrew Witty departed abruptly mid-May, replaced by former CEO Hemsley; securities-fraud class action in discovery; AI-claim-denial class action survived motion to dismiss; DOJ/HHS/SEC/FTC all active; stock -55% from all-time high.

## Drift-Guard Check

Published composite 11.4; canonical reconstruction of published dimensions = 11.3 (diff 0.1, within tolerance — no math-hygiene flag). Working baseline = 11.4. Drift negligible → **ACCEPT**.

## Scored Event — Governance Event Under Criminal Investigation

A CEO departure *while the company is under an expanding criminal investigation* is an ACC/INT governance signal. Dimensional impacts (quarter-step docks):
- **ACC 1.25 → 1.125:** DOJ criminal division widened scope to Optum Rx physician compensation; company reversed prior stance to confirm cooperation; no proactive harm acknowledgment — only forced disclosure.
- **INT 1.625 → 1.375:** Abrupt CEO exit under active criminal probe plus survival of the AI-claim-denial class action (a court found the denial-algorithm claims plausible enough to proceed) undermines values-consistency.

Other dimensions held: EMP 1.25 (claim-denial harms continue), AWR 1.75, ACT 1.5, EQU 1.25, BND 1.5, SYS 1.5.

| Dimension | Code | Raw | Evidence | Source |
|-----------|------|-----|----------|--------|
| AWR | AWR | 1.75 | Detection of member distress weak; claim-denial systemic | Lawfold 2026 |
| EMP | EMP | 1.25 | AI claim-denial litigation; transactional treatment | Lawfold 2026 |
| ACT | ACT | 1.5 | Responses driven by cost-containment | StarTribune |
| EQU | EQU | 1.25 | Medicare Advantage fraud probe; vulnerable enrollees | Fierce Healthcare |
| BND | BND | 1.5 | Scope/consent concerns in claim handling | Lawfold 2026 |
| ACC | ACC | 1.125 | Cooperation only after reversal; probe expanding | StarTribune |
| SYS | SYS | 1.5 | Cost-structure incentives drive denials | InsuranceNewsNet |
| INT | INT | 1.375 | CEO exit under criminal probe; AI-denial suit survives MTD | StarTribune / Lawfold |

**Composite (canonical formula):** 10.2. From baseline 11.4: delta **-1.2**. Remains Critical (no band crossing).

## Key Findings
- DOJ criminal probe expanded to Optum Rx physician compensation; UnitedHealth reversed to confirm cooperation.
- CEO Witty departed abruptly mid-May amid active criminal investigation; Hemsley returned.
- AI-claim-denial class action survived motion to dismiss — claims deemed plausible.
- Multi-agency exposure (DOJ, HHS, SEC, FTC); stock -55% from peak.

## Recommendation
**APPLY downgrade to 10.2** (delta -1.2). Sub-5pt but dimension-specific (ACC, INT). Remains Critical. Confidence: MEDIUM (probe outcomes pending; conservative quarter-step docks).

## Sources
- https://www.startribune.com/what-is-the-doj-investigating-at-unitedhealth-group/601442336
- https://lawfold.com/united-healthcare-lawsuit-2026/
- https://www.fiercehealthcare.com/payers/wsj-report-doj-interviewing-former-employees-about-medicare-billing-practices-unitedhealth
- https://insurancenewsnet.com/innarticle/unitedhealth-facing-more-lawsuits-from-disgruntled-shareholders

*This assessment is based on publicly available information and does not constitute a formal Compassion Benchmark Certified Assessment.*
