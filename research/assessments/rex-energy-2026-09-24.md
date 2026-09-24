---
entity: "Rex Energy"
type: "Company (defunct)"
sector: "Oil and gas exploration and production"
date: "2026-09-24"
assessment_type: "screening-note"
composite_score: null
band: null
published_index: "fortune-500"
published_rank: 404
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
entity_status: "sold substantially all assets in bankruptcy, 2018-09-28"
watch_flag: false
source: "rotation"
scan_file: "research/scans/2026-09-24.json"
math_hygiene_reconstruction_diff: 0
---

# Screening Note: Rex Energy — entity no longer exists

**Assessment date:** 2026-09-24
**Outcome:** not assessable. The company is defunct. No proposal; referred for catalogue review.
**Published:** 18.8/100, Critical, rank #404 of 447. Canonical reconstruction returns 18.8 exactly — no math-hygiene issue.

## The finding

Rex Energy Corporation **no longer exists as an assessable entity.**

- Rex Energy filed voluntary Chapter 11 petitions on **18 May 2018** in the U.S. Bankruptcy Court for the Western District of Pennsylvania.
- The debtors cancelled the auction and selected PennEnergy Resources, LLC's bid as the successful bid, with the support of the creditors' committee, the prepetition first lien lenders and the ad hoc second lien group.
- The purchase agreement was signed on 24 August 2018, and on **28 September 2018 the debtors completed the disposition of substantially all of their assets to PennEnergy Resources, LLC for an aggregate purchase price of $600.5 million** (SEC Form 8-K, 2018).

There has been no operating company, no workforce, no management and no disclosure for eight years. There is nothing to assess.

## Why this matters more than one row

Rex Energy's published vector is `1.5 / 2.0 / 2.0 / 1.5 / 2.0 / 1.5 / 2.0 / 1.5`, **byte-identical to Penn Virginia (#402), which is also defunct, and to Tronox (#405), which is a live company.**

A published score shared between two dissolved companies and one operating company is a placeholder, not a measurement. It is the reason `research/assessments/tronox-2026-09-24.md` withheld an otherwise trigger-clearing +13.7 upgrade: the correct correction is to the cluster, not to one row at a time.

## Disposition

**`flag-for-review` for catalogue hygiene, not for scoring.** Index writes are outside the assessor's remit. Referred to the coordinator and the entity-identity workstream.

Options for the reviewer, listed without recommending one: delist the row; re-point it to PennEnergy Resources if that entity is in scope; or retain it with an explicit "historical entity, score not current" marker.

`last_assessed` is **not** stamped, so the row keeps surfacing in rotation until the catalogue decision is made.

## Sources

- SEC Form 8-K, Rex Energy Corp, 2018 (completion of asset sale to PennEnergy Resources, LLC for $600.5 million) — tier 5 — https://www.sec.gov/Archives/edgar/data/0001397516/000119312518304338/d622929d8k.htm
- SEC Form 8-K exhibit, Rex Energy Corp, 2018 (successful bid selection) — tier 5 — https://www.sec.gov/Archives/edgar/data/0001397516/000119312518258199/d614840dex21.htm
- SEC Form 10-Q, Rex Energy Corp, Q2 FY2018 (Chapter 11 filing, 2018-05-18) — tier 5 — https://www.sec.gov/Archives/edgar/data/0001397516/000156459018020532/rexx-10q_20180630.htm

---

*This assessment is based on publicly available information and does not constitute a formal Compassion Benchmark Certified Assessment. For a comprehensive, assessor-led evaluation, visit compassionbenchmark.com/certified-assessments.*
