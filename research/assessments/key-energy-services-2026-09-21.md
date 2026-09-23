---
entity: "Key Energy Services"
type: "Company"
sector: "Energy Services (oilfield well services)"
date: "2026-09-21"
composite_score: null
band: null
scores: null
published_index: "fortune-500"
published_rank: 389
published_composite: 21.9
published_band: "developing"
published_dimensions:
  AWR: 2.0
  EMP: 2.0
  ACT: 2.0
  EQU: 1.5
  BND: 2.0
  ACC: 1.5
  SYS: 2.0
  INT: 2.0
assessed_composite: null
score_delta: null
band_change: false
filing_trigger_met: false
outcome: "entity-status defect flagged; no score issued"
assessment_type: "entity-status screen (not scoreable)"
recommendation: "flag-for-review"
change_proposal: false
confidence: "low"
subdim_sidecar: false
entity_status_defect: true
watch_flag: true
source: "rotation"
scan_file: "research/scans/2026-09-21.json"
methodology_version: "v1.2"
---

# Compassion Benchmark Entity-Status Screen: Key Energy Services

**Entity type:** Company (Houston-based oilfield well services; private since December 2020)
**Assessment date:** 2026-09-21
**Outcome:** entity-status defect; no score issued
**Published:** 21.9/100 (developing), fortune-500 rank 389 of 447, listed at `f500Rank: 500`

> This assessment is based on publicly available information and does not constitute a formal Compassion Benchmark Certified Assessment. For a comprehensive, assessor-led evaluation, visit compassionbenchmark.com/certified-assessments.

## Why this entity was assessed

Rotation backfill. Key Energy Services has never been assessed (`last_assessed: null`) and the scanner searched it individually this cycle recording `evidence_found: false`. A first-ever baseline was attempted on the public record. It could not responsibly be completed, and the reason is an entity-record problem rather than an evidence problem.

## The finding: this company stopped being a public reporting company nearly six years ago

**Key Energy Services filed a Form 15 with the US Securities and Exchange Commission on 14 December 2020, deregistering from SEC reporting requirements.** It has made no public SEC filings since. Before that it filed for Chapter 11 bankruptcy protection in 2016, emerged and relisted on the NYSE, then reached a restructuring support agreement with lenders to cut long-term debt by roughly 80% out of court, and went private.

The consequences for a benchmark score are direct and unavoidable:

- **No 10-K, no proxy statement, no workforce data.** The dimensions that depend on published institutional data (AB3 Transparency, EQ3 Bias Awareness, I3 Internal Consistency, B1 Self-Sustainability) have no possible source.
- **No corporate responsibility or sustainability report** was located.
- **No current employee count, safety record or OSHA data** was located for 2025 or 2026.
- **No community, customer or worker testimony** was located.

**Scoring 40 subdimensions on this basis would be scoring a company's invisibility, not its conduct.** The methodology's instruction to default to lower anchors on absent evidence is written for a subdimension inside an otherwise evidenced assessment. Applied to an entire entity with no public record at all, it produces a number that looks like a measurement and is not one. No score is issued.

## The deeper problem: the index entry itself

Key Energy Services is published in the **Fortune 500 index at `f500Rank: 500`** with a composite of 21.9. A company that deregistered from SEC reporting in December 2020 and is described in financial-data sources as delisted, with a probability of financial distress above 80%, is not plausibly a current Fortune 500 constituent.

This is the same class of defect as the Halodi Robotics / 1X Technologies duplicate recorded on 2026-08-17 and still open in `research/APPLIED_CHANGES.md`: **an entity-record problem that must be resolved before any score attached to it is corrected.** Correcting 21.9 to some other number would give a more precise score to a row that may not belong in the index.

## Score Summary

**No score is issued.** The published 21.9 / developing / rank 389 stands unchanged pending an entity-record decision.

**Math hygiene:** canonical reconstruction of the published dimension set returns exactly 21.9. No math-hygiene issue in the arithmetic.

**Baseline drift:** `research/rotation-state.json` records rank 390; the index records rank 389. Composite (21.9) and band (developing) agree. Rank drift reported, not written.

## Anti-false-positive screening (§3e-bis)

1. **Baseline provenance.** No APPLIED_CHANGES entry and no prior assessment. The 21.9 is an unrevised extraction value.
2. **No stale-baseline rationale used** to move anything.
3. **Directionality.** Surfaced on no evidence. No movement in either direction. In particular, no downgrade is taken from the company's disappearance from public reporting — going private is not conduct that harms anyone.
4. **Rationale consistency.** Nothing conflicts.
5. **Calibration.** Whether delisted and deregistered private companies belong in the Fortune 500 index at all is a catalogue-integrity question, referred as such.

**No filing trigger met.** No proposal is written.

## Key Findings

- Why it matters: Key Energy Services stopped filing with US securities regulators in December 2020. It filed a Form 15 on 14 December 2020 to deregister. There has been no public financial or workforce reporting since.
- Why it matters: that makes a real score impossible, so none was issued. There is no annual report, no employee data, no safety record and no responsibility report to read. Scoring the company anyway would measure its silence, not its behaviour.
- Why it matters: the bigger problem is the index entry, not the score. Key Energy Services is published inside the Fortune 500 list at position 500 with a score of 21.9 out of 100, despite having gone private nearly six years ago.
- Why it matters: this is the second entity-record defect this workstream has surfaced. Halodi Robotics was found in August 2026 to be the same company as 1X Technologies, published twice with scores 18.9 points apart. That case is still open.
- Why it matters: the right fix is a catalogue decision, not a score change. Giving a more precise number to a row that may not belong in the index would make the ranking look more accurate while making it less true.

## Evidence Gaps

The entire assessment is an evidence gap, by design of the entity's status:

- No SEC filings since 14 December 2020.
- No corporate responsibility, ESG or sustainability report located.
- No 2025 or 2026 OSHA, safety or workforce data located.
- No current ownership, headcount or revenue figure verified.
- Financial-distress indicators came from an aggregator (tier 1) and are not relied on for any score.

## Watch Flag / Referral

**Referred for a catalogue-integrity decision, not a score change.** Recommended: verify Key Energy Services' current corporate status and Fortune 500 eligibility, and decide whether the row should be removed, marked as unscoreable, or retained with an explicit data-availability caveat. Until that decision is made, this entity should be **suppressed from rotation backfill** so it does not resurface each cycle as a never-assessed candidate that cannot be assessed. The same treatment is recommended for any other fortune-500 row whose company has deregistered.

## Sources

- https://en.wikipedia.org/wiki/Key_Energy_Services (tier 1 — Form 15 filed 2020-12-14, Chapter 11 in 2016)
- https://www.bamsec.com/companies/318996/key-energy-services-inc (tier 2 — filings history)
- https://seekingalpha.com/news/3534783-key-energy-to-restructure-outside-of-bankruptcy-court (tier 2 — out-of-court restructuring, ~80% debt reduction)
- https://scarincihollenbeck.com/law-firm-insights/key-energy-services-plans-chapter-11 (tier 2)
- Precedent for entity-record defects: `research/assessments/halodi-robotics-2026-08-17.md`; `research/APPLIED_CHANGES.md`

## Recommended Next Steps

Not applicable pending an entity-record decision.
