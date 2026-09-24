---
entity: "Penn Virginia"
type: "Company (defunct)"
sector: "Oil and gas exploration and production"
date: "2026-09-24"
assessment_type: "screening-note"
composite_score: null
band: null
published_index: "fortune-500"
published_rank: 402
published_composite: 18.8
published_band: "critical"
assessed_composite: null
score_delta: null
band_change: false
filing_trigger_met: false
outcome: "not-assessable-entity-defunct"
recommendation: "flag-for-review"
change_proposal: false
subdim_sidecar: false
last_assessed_stamped: false
entity_status: "ceased to exist as an independent company in 2023"
watch_flag: false
source: "rotation"
scan_file: "research/scans/2026-09-24.json"
math_hygiene_reconstruction_diff: 0
---

# Screening Note: Penn Virginia — entity no longer exists

**Assessment date:** 2026-09-24
**Outcome:** not assessable. The company is defunct. No proposal; referred for catalogue review.
**Published:** 18.8/100, Critical, rank #402 of 447. Canonical reconstruction returns 18.8 exactly — no math-hygiene issue.

## The finding

Penn Virginia Corporation **no longer exists as an assessable entity.**

- Penn Virginia Corporation was renamed **Ranger Oil Corporation** in October 2021.
- On 27 February 2023 Ranger Oil entered an Agreement and Plan of Merger with **Baytex Energy Corp.**, under which Ranger merged with and into a wholly owned Baytex subsidiary, surviving as a wholly owned subsidiary of Baytex (SEC Form DEFM14A and Form 425 filings, 2023).
- The transaction closed in the second quarter of 2023. **Ranger Oil ceased to exist as an independent public company.**

There is no current management, no current workforce, no current disclosure, and no conduct after mid-2023 to assess. A 40-subdimension compassion assessment of a dissolved corporate shell would measure nothing.

## Why this matters more than one row

Penn Virginia's published vector is `1.5 / 2.0 / 2.0 / 1.5 / 2.0 / 1.5 / 2.0 / 1.5`. This cycle independently established that **the identical vector is published for Rex Energy (#404) and for Tronox (#405)** — and Rex Energy is also defunct, while Tronox is a live company with a detailed sustainability report.

A placeholder score shared between two dissolved companies and one operating company is not a measurement of any of them. That is recorded in `research/assessments/tronox-2026-09-24.md` as the reason an isolated upgrade of Tronox was withheld.

## Disposition

**`flag-for-review` for catalogue hygiene, not for scoring.** Removing or re-pointing a published index row is an entity-identity and catalogue decision, and index writes are outside the assessor's remit. This is referred to the coordinator, and specifically to the entity-identity workstream on the current branch.

Options for the reviewer, listed without recommending one: delist the row; merge it into Baytex Energy if Baytex is or should be in scope; or retain it with an explicit "historical entity, score not current" marker.

`last_assessed` is **not** stamped. Stamping it would mark a defunct row as freshly assessed and would suppress it from rotation for months, which is the opposite of what should happen. The row should keep surfacing until the catalogue decision is made.

## Sources

- SEC Form DEFM14A, Ranger Oil Corp, FY2023 (merger proxy) — tier 5 — https://www.sec.gov/Archives/edgar/data/77159/000110465923062323/tm2316195-1_defm14a.htm
- SEC Form 425, Ranger Oil Corp, 2023-02-28 (merger announcement) — tier 5 — https://www.sec.gov/Archives/edgar/data/77159/000119312523052134/d461415dex991.htm
- SEC Form 10-Q, Ranger Oil Corp, Q1 FY2023 — tier 5 — https://www.sec.gov/Archives/edgar/data/77159/000007715923000012/rocc-20230331.htm

---

*This assessment is based on publicly available information and does not constitute a formal Compassion Benchmark Certified Assessment. For a comprehensive, assessor-led evaluation, visit compassionbenchmark.com/certified-assessments.*
