---
entity: "Marsh & McLennan"
type: "Company"
sector: "Professional Services (insurance broking and risk advisory)"
date: "2026-09-21"
composite_score: null
band: null
scores: null
indicative_scores:
  AWR: 2.4
  EMP: 2.4
  ACT: 2.6
  EQU: 2.4
  BND: 2.4
  ACC: 2.2
  SYS: 3.0
  INT: 2.2
indicative_composite: 36.3
indicative_band: "Developing"
published_index: "fortune-500"
published_rank: 42
published_composite: 60.9
published_band: "established"
published_dimensions:
  AWR: 3.5
  EMP: 3.5
  ACT: 3.5
  EQU: 3.0
  BND: 3.5
  ACC: 3.5
  SYS: 3.5
  INT: 3.5
indicative_delta: -24.6
band_change: false
filing_trigger_met: false
proposal_withheld_rule: "Indicative first-pass only. A -24.6 move on four searches is not a defensible proposal; escalated for a dedicated full assessment instead."
outcome: "seed-vector defect flagged; no score movement"
assessment_type: "indicative first pass (NOT a 40-subdimension contract)"
recommendation: "flag-for-review"
change_proposal: false
confidence: "low"
subdim_sidecar: false
watch_flag: true
source: "rotation"
scan_file: "research/scans/2026-09-21.json"
seed_vector_suspected: true
methodology_version: "v1.2"
---

# Compassion Benchmark Indicative First Pass: Marsh & McLennan

**Entity type:** Company (global insurance broker and risk advisor)
**Assessment date:** 2026-09-21
**Outcome:** suspected seed-vector defect flagged; no score movement; full assessment requested
**Published:** 60.9/100 (established), fortune-500 rank 42 of 447

> This assessment is based on publicly available information and does not constitute a formal Compassion Benchmark Certified Assessment. For a comprehensive, assessor-led evaluation, visit compassionbenchmark.com/certified-assessments.

## Why this entity was assessed, and why this is not a full baseline

Rotation backfill. Marsh & McLennan has never been assessed (`last_assessed: null`), and the scanner searched it individually this cycle recording `evidence_found: false` — no compassion-relevant evidence in the 7–21 September 2026 window. A first-ever baseline was attempted on the public record. **It is not published as one, and the reason is stated below rather than buried.**

## What was found: a probable seed vector at rank 42

Marsh & McLennan's published dimension vector is **3.5 on seven of the eight dimensions, with EQU at 3.0**. `research/APPLIED_CHANGES.md` contains no Marsh & McLennan entry, and no assessment exists on disk. So the 60.9 is an original extraction value that has never been revised or researched.

A near-flat 3.5 vector is the signature the 2026-08-17 robotics-labs de-seeding study identified: several entities carrying a byte-identical dimension vector and the same composite, none of them measured. The Halodi Robotics case in that study moved −37.5 once it was actually researched. **Marsh & McLennan at 60.9 and rank 42 of 447 is the highest-placed suspected seed vector surfaced in this cycle.**

## The indicative reading, and why it is not filed

A four-search desk pass produced an indicative dimension reading of AWR 2.4, EMP 2.4, ACT 2.6, EQU 2.4, BND 2.4, ACC 2.2, SYS 3.0, INT 2.2 — an indicative composite of **36.3 (Developing)**, some **24.6 points below** the published 60.9, crossing two band lines.

**That number is not filed, and it should not be treated as a measurement.** Four reasons:

1. **A −24.6 move cannot be justified on four web searches.** The magnitude alone demands a dedicated assessment. Filing it would be the largest single downgrade in the fortune-500 index on the thinnest evidence base in tonight's run.
2. **Third-party ratings point the other way and were not reconciled.** Marsh & McLennan holds an MSCI ESG rating of **AA (Leader)** and a Sustainalytics risk score of **19.5** (low risk). Those are independent assessments at a tier the benchmark takes seriously, and they are inconsistent with a 2.45 mean. Until that inconsistency is worked through, the indicative reading is unsafe.
3. **The company's own reporting was not read.** Marsh McLennan publishes ESG reports — the most recent located is the 2023 "Empowering Sustainable Futures" edition. It was not fetched. Scoring AB3 Transparency at 2/5 while its transparency document sits unread is an artefact of research depth, not a finding.
4. **No 40-subdimension sidecar is written.** Under §3g, an assessment that does not confidently score all 40 must not emit a machine-readable contract. Publishing a sidecar I do not stand behind would let a low-confidence reading flow into an entity record.

## What the pass did establish, on the record

**Negative, documented:**
- A three-year restructuring programme, "Thrive", launched in Q3 2025, with **$187 million of restructuring costs incurred through 31 March 2026, primarily severance**, per the company's own Form 10-Q — a tier-5 primary document.
- Roughly **$400 million in cost cuts** through layoffs and other measures amid a broking revenue slowdown.
- Glassdoor reviews describing layoff decisions taken "behind close doors with little to no communication", an organisation that "reacts to problems instead of planning ahead", and offshoring with US employees laid off at higher rates because EU law makes EU redundancies harder.
- An ERISA **health-plan fiduciary-breach case that Marsh & McLennan must face** rather than having dismissed, per Bloomberg Law — directly relevant to how the firm treats its own colleagues' health coverage.
- A separate ERISA suit by the Oregon Potato Company alleging excessive fees.

**Positive, documented:**
- Comprehensive health insurance and a 24/7 Employee Assistance Programme reaching **over 80% of colleagues** — which also means roughly one colleague in five is outside it.
- MSCI AA (Leader) and Sustainalytics 19.5.
- Genuine upstream systemic work: the firm's core business is mapping cross-system risk, including climate risk, which is why SYS is the one dimension the indicative pass placed at 3.0.

## Score Summary

**No score is issued.** The published 60.9 / established / rank 42 stands unchanged. The indicative reading above is recorded for the coordinator's use and is explicitly not a measurement.

**Math hygiene:** canonical reconstruction of the published dimension set returns exactly 60.9, and the canonical band function returns Established at 60.9 (the threshold is `> 60`, so 60.9 is correctly labelled established despite the documented "41–60 Functional" range text). No math-hygiene issue.

**Baseline drift:** `research/rotation-state.json` records rank **49** for Marsh & McLennan; the index records rank **42** — a 7-place drift, the largest in tonight's set. Composite (60.9) and band (established) agree. Rank drift reported, not written.

## Anti-false-positive screening (§3e-bis)

1. **Baseline provenance.** No APPLIED_CHANGES entry, no prior assessment. The 60.9 is an unrevised extraction value. Established and reported, not assumed.
2. **No stale-baseline rationale used** to move anything. The staleness is reported as a defect for dedicated work, which is the correct route.
3. **Directionality.** Surfaced on no evidence. No movement taken in either direction.
4. **Rationale consistency.** Nothing conflicts.
5. **Calibration.** The flat-3.5 seed cohort in fortune-500 is a cohort-level question and is referred as such.

**No filing trigger met.** No proposal is written.

## Key Findings

- Why it matters: Marsh & McLennan sits 42nd of 447 companies on a score nobody has ever researched. Seven of its eight area scores read exactly 3.5 out of 5. There is no assessment on file and no record of the score ever being revised.
- Why it matters: a quick first pass suggests the score may be far too high, and that is precisely why it is not being changed tonight. An indicative reading came out 24.6 points lower. Four web searches is not enough to move the 42nd-ranked company in the index.
- Why it matters: independent raters disagree with the low reading, and that has to be resolved first. MSCI rates Marsh & McLennan AA, a leader grade. Sustainalytics puts its risk at 19.5, which is low.
- Why it matters: the firm has cut $187 million in restructuring costs, mostly severance. That figure comes from its own filing with the US securities regulator for the period to 31 March 2026, under a programme called Thrive.
- Why it matters: its staff wellbeing programme misses about one in five colleagues. Marsh McLennan says over 80% have 24/7 access to its employee assistance programme.
- Why it matters: the company must answer a claim about its own employees' health plan. Bloomberg Law reported the health-plan fiduciary-breach case was not dismissed.

## Evidence Gaps

- The 2023 ESG report "Empowering Sustainable Futures" was not fetched; no 2025 or 2026 edition was located.
- The Form 10-Q and Form 10-K were read only through search summaries.
- No employee turnover data, no colleague engagement survey results, and no community-investment outcome data.
- Glassdoor review material is tier 2 and unverified.
- The ERISA health-plan case docket was not read.
- **Consequence: 30 or more of the 40 subdimensions could not be scored with acceptable confidence, which is why no sidecar exists.**

## Watch Flag / Referral

**Referred for a dedicated full assessment.** Recommended scope: fetch the most recent Marsh McLennan ESG report and Form 10-K, reconcile against the MSCI AA and Sustainalytics 19.5 ratings, obtain the ERISA health-plan case status, and score all 40 subdimensions. This entity should be handled as part of a **fortune-500 flat-vector de-seeding study**, on the model of the 2026-08-17 robotics-labs study, rather than by a nightly rotation pass. Separately, the 7-place rotation-state rank drift should be corrected by whichever stage owns that field.

## Sources

- https://www.sec.gov/Archives/edgar/data/62709/000006270926000098/mrsh-20260331.htm (tier 5, Form 10-Q, period to 2026-03-31)
- https://knowesg.com/esg-ratings/marsh-and-mclennan-cos-inc (tier 3, 2026 — MSCI AA, Sustainalytics 19.5)
- https://news.bloomberglaw.com/health-law-and-business/marsh-mclennan-must-face-health-plan-fiduciary-breach-case (tier 2)
- https://www.marsh.com/en/corp/about/news/marsh-mcLennan-issues-2023-esg-report-empowering-sustainable-futures.html (tier 4, 2024-04 — NOT FETCHED)
- https://www.glassdoor.com/Reviews/Marsh-McLennan-layoff-Reviews-EI_IE426.0,14_KH15,21.htm (tier 2)
- https://www.psca.org/news/psca-news/2026/3/march-litigation-roundup/ (tier 2, 2026-03)
- Precedent for the seed-vector pattern: `research/assessments/halodi-robotics-2026-08-17.md`

## Recommended Next Steps

Established band as published: consider purchasing the [full benchmark report](/purchase-research) for peer comparison — with the caveat that this entity's published placement is flagged for verification.
