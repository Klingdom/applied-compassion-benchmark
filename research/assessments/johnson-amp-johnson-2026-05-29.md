---
entity: "Johnson & Johnson"
type: "Company"
sector: "Pharmaceuticals / Consumer Health"
date: "2026-05-29"
composite_score: 28.4
band: "Developing"
scores:
  AWR: 2.2
  EMP: 2.2
  ACT: 2.4
  EQU: 2.1
  BND: 2.5
  ACC: 1.6
  SYS: 2.2
  INT: 1.9
published_index: "fortune-500"
published_rank: 317
published_composite: 27.5
published_band: "developing"
assessment_kind: "framing-correction-with-partial-reparative-credit"
---

# Compassion Benchmark Assessment: Johnson & Johnson (2026-05-29)

**Trigger:** Priority flag (priority_score 55, T2). Bankruptcy court approved the $10.5B talc settlement plan Feb 14, 2026 (third bankruptcy attempt, succeeded); 62,847 registered claimants as of March; settlement administrator began accepting claims March 1; settlement does NOT require admission of wrongdoing or liability.

## ENTITY-MAPPING NOTE (DATA HYGIENE)

The scanner slug `johnson-amp-johnson` maps to the fortune-500.json entry **"Johnson &amp; Johnson"** (composite **27.5**, rank 317) — NOT "Johnson Controls" (composite 50, rank 87). This assessment uses the correct J&J baseline of 27.5.

## FRAMING CORRECTION (METHODOLOGY)

The prior scan's framing of "bankruptcy escape denied" was **factually wrong**. The $10.5B talc settlement was **approved** by Judge Kaplan (D.N.J.) on Feb 14, 2026 (claimants voted 83% in favor; fund distributed over 25 years to ovarian-cancer and mesothelioma claimants). This must be corrected in the evidence base: J&J did not have its bankruptcy route denied — it succeeded in channeling claims through a court-approved settlement.

## Drift-Guard Check

Published composite 27.5; canonical reconstruction = 27.5 (exact). Working baseline = 27.5. Drift = 0 → **ACCEPT**.

## SETTLEMENT-WITHOUT-ADMISSION Methodology Question

The settlement is genuinely two-sided for compassion scoring:
- **Reparative element (AB5/EQU5 partial credit):** A $10.5B fund reaching 62,847+ claimants over 25 years is a concrete, large-scale reparative mechanism delivering compensation to harmed parties. This is more than "minimal legal settlement" (AB5 anchor 1) and approaches "≥1 case of reparative action considered meaningful by those harmed" (AB5 anchor 3), tempered by claimant criticism of the 25-year horizon and per-claimant adequacy.
- **Accountability-avoidance element (AB1/AB3 limiter):** The settlement explicitly carries **no admission of wrongdoing or liability**, and the route was a third-attempt "Texas two-step" bankruptcy that critics characterize as accountability-avoidance via legal procedure. This caps the ACC credit.

Net dimensional impact (modest upward, framing-corrected):
- **ACC 1.4 → 1.6:** Partial credit for delivering a court-approved compensation mechanism, capped by the no-admission structure.
- **EQU 2.0 → 2.1:** Compensation flows to a harmed class (cancer claimants), modestly improving distributive equity.
- Other dimensions held.

| Dimension | Code | Raw | Evidence | Source |
|-----------|------|-----|----------|--------|
| AWR | AWR | 2.2 | Long-running awareness of talc-harm claims | Lawfold |
| EMP | EMP | 2.2 | Claimant treatment largely procedural | Sokolove Law |
| ACT | ACT | 2.4 | Settlement fund operational; claims accepted Mar 1 | Lawfold |
| EQU | EQU | 2.1 | $10.5B reaching 62,847+ harmed claimants | Lawfold |
| BND | BND | 2.5 | Scope communicated via settlement terms | SEC 10-Q FY2026 |
| ACC | ACC | 1.6 | Reparative fund, but NO admission of liability | Lawfold / Consumer Notice |
| SYS | SYS | 2.2 | Litigation channeled, root product-safety unaddressed | Lawsuit-Info-Center |
| INT | INT | 1.9 | Third-attempt bankruptcy route; consistency concerns | Consumer Notice |

**Composite (canonical formula):** 28.4. From baseline 27.5: delta **+0.9**. Remains Developing (no band crossing).

## Key Findings
- FRAMING CORRECTION: the $10.5B talc settlement was APPROVED Feb 14, 2026 — prior "bankruptcy escape denied" framing was wrong.
- 62,847+ claimants; 83% approval vote; 25-year distribution; claims accepted from Mar 1.
- Settlement carries NO admission of wrongdoing or liability — caps accountability credit.
- ENTITY-MAPPING: confirm baseline is "Johnson &amp; Johnson" (27.5), not "Johnson Controls" (50).

## Recommendation
**APPLY modest upgrade to 28.4** (delta +0.9, framing-corrected partial reparative credit). Sub-5pt; dimension-specific (ACC, EQU). Remains Developing. Confidence: MEDIUM (no-admission structure limits credit; claimant-adequacy disputed).

## Sources
- https://lawfold.com/jj-talc-lawsuit-2026-settlement-payout-updates/
- https://www.lawsuit-information-center.com/2-billion-verdict-in-missouri-motivates-jj-to-settle-talcum-powder-lawsuits.html
- https://www.consumernotice.org/news/what-another-verdict-against-jj-means-for-the-talcum-powder-lawsuits/
- https://www.sec.gov/Archives/edgar/data/0000200406/000020040626000087/jnj-20260329.htm

*This assessment is based on publicly available information and does not constitute a formal Compassion Benchmark Certified Assessment.*
