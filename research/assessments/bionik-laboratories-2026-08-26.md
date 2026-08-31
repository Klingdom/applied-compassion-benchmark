---
entity: "Bionik Laboratories"
type: "Company"
sector: "Robotics / Rehabilitation"
date: "2026-08-26"
composite_score: null
band: null
assessment_outcome: "WITHHELD — corporate status unresolved"
published_index: "robotics-labs"
published_rank: 14
published_composite: 62.5
published_band: "established"
score_delta: null
band_change: false
recommendation: "flag-for-review"
change_proposal: false
existing_unapplied_proposal: "research/change-proposals/bionik-laboratories.json"
subdim_sidecar: false
confidence: null
source: "rotation"
corporate_status: "unresolved"
scan_file: "research/scans/2026-08-26.json"
---

# Compassion Benchmark Assessment: Bionik Laboratories — WITHHELD

**Entity type:** Company
**Sector/Domain:** Robotics / Rehabilitation
**Assessment date:** 2026-08-26
**Composite score:** *withheld — not scored*
**Band:** *withheld*
**Cycle source:** rotation backfill (mechanical staleness, `last_assessed: null`)

> This assessment is based on publicly available information and does not constitute a formal Compassion Benchmark Certified Assessment. For a comprehensive, assessor-led evaluation, visit compassionbenchmark.com/certified-assessments.

## Outcome: NO SCORE IS PRODUCED

**Bionik Laboratories was not scored tonight.** Its corporate status cannot be resolved from public sources, and AUTONOMY.md §3 is explicit: *"If the row does not name one real, currently-operating, singly-published entity, no composite for that row can be true."* An unresolvable status is a withhold, not a guess.

This follows the **Hocoma precedent of 2026-08-21**, where an entity was fully researched, found to have an unresolvable corporate status, and deliberately not inserted with `corporate_status: "unresolved"` and `composite: null`.

## Why it was surfaced

Mechanical staleness only. `last_assessed` is null in `research/rotation-state.json`, which the priority formula reads as never-assessed. **The scanner confirmed no new evidence of any kind for this entity in the 2026-08-21 to 2026-08-26 window.** It was not surfaced on conduct.

## Two independent status checks — required by AUTONOMY.md §3, step 1

**Check 1 — securities filings. NEGATIVE.** Bionik Laboratories Corp. filed **Form 15-12G with the US Securities and Exchange Commission on 30 June 2023**, terminating its duty to file public reports, and has filed nothing since. This is recorded in the `corporate_status` field of the existing proposal `research/change-proposals/bionik-laboratories.json` and is not re-derived here. Days before that filing, four of seven directors resigned amid cost-cutting and the company borrowed on convertible notes at 1% per month.

**Check 2 — current commercial presence. INCONCLUSIVE, AND ONE SIGNAL IS ADVERSE.** A fresh search located only marketing and product material: BioSpace and Business Wire releases from 2019 and 2023, a Hong Kong distribution agreement dated May 2023, and undated product pages on `bioniklabs.com`. **No dated evidence of operation after 2024 was located.** One search-index result renders the company's own overview page with the title fragment *"InMotion® Therapy | BIONIK - Beste nettcasino"* — Norwegian for "best online casino" — which is a recognised signature of an abandoned or compromised domain. **This is reported as an unverified signal, not a finding:** `bioniklabs.com` returned HTTP 403 and could not be fetched to confirm what the page actually contains.

**Conclusion: current operating status cannot be confirmed.** Neither check establishes that Bionik Laboratories is a currently-operating entity, and one points the other way.

## Consequences

1. **No composite, band or dimension score is produced.** None is asserted, estimated, adjusted or averaged.
2. **The published 62.5 is not confirmed either.** This assessment makes no statement about whether 62.5 is right. It states that no number can be true for a row whose subject cannot be shown to exist as a currently-operating company.
3. **The published 62.5 is separately suspect on its face.** It is byte-identical to Halodi Robotics and Harmonic Bionics at consecutive alphabetical ranks 15 to 17 — the placeholder signature identified by the 2026-08-16/17 de-seeding studies.

## An unapplied proposal already exists — no second queue entry is created

`research/change-proposals/bionik-laboratories.json` is open with `status: "pending"`, filed 2026-08-17, proposing 62.5 → 25.6 (delta −36.9). Its own notes carry a **self-veto**:

> "FLAG FOR REVIEW — SEED CORRECTION PLUS A CORPORATE-STATUS DEFECT. … Before any score is applied, the record should be checked: this company stopped filing with its securities regulator on 30 June 2023. No score change is proposed for application by this study."

**Tonight adds nothing that changes that proposal**, so it is left exactly as it is — untouched, including `recommendation` and `notes`, per AUTONOMY.md Rule R8. No duplicate entry is created.

## Recommended remedy — in order, per AUTONOMY.md §3

1. **Verify independently** whether Bionik Laboratories Corp. is currently operating. Neither check available from open web search resolves it. This needs a corporate-registry lookup (Delaware and Ontario) rather than a news search.
2. **Do not score** until that is resolved.
3. **Escalate for a disposition decision** — rename in place, delist, or confirm operating. That decision is the founder's.
4. **Execute the disposition as a structural operation**, separate from any score change.
5. **Only then** run a fresh assessment against a corrected record.

## Reporting note

This is an **entity-record defect, not a downgrade.** Nothing here says Bionik Laboratories treats anyone badly. It says the benchmark cannot currently show that the row refers to a company that exists and operates, and therefore must not publish a number against it.

---

*This assessment is based on publicly available information and does not constitute a formal Compassion Benchmark Certified Assessment. For a comprehensive, assessor-led evaluation, visit compassionbenchmark.com/certified-assessments.*
