# Assessment Coverage — Full Sizing

**Created:** 2026-07-19
**Method:** Zero web searches. Derived entirely from `research/rotation-state.json`, `site/src/data/indexes/*.json`, and `site/src/data/entity-records/*.json`.
**Trigger:** Runbook open item — "`last_assessed: null` sweep on us-cities, global-cities and universities — same extraction origin, likely same defect."

The defect is confirmed and is substantially larger than the open item implies.

---

## Never individually assessed (`last_assessed: null`)

`last_assessed` lives in `research/rotation-state.json`, **not** in the index JSONs. All 1,256 published index rows lack the field entirely, so any sweep run against the indexes returns a false 100%. Use rotation-state.

| Index | Total | Never assessed | % |
|---|---|---|---|
| global-cities | 250 | **250** | **100.0%** |
| us-cities | 144 | **139** | **96.5%** |
| universities | 100 | 89 | 89.0% |
| robotics-labs | 50 | 41 | 82.0% |
| fortune-500 | 448 | 332 | 74.1% |
| us-states | 21 | 15 | 71.4% |
| ai-labs | 54 | 31 | 57.4% |
| countries | 193 | 44 | 22.8% |
| **TOTAL** | **1,260** | **941** | **74.7%** |

**Validation:** the us-states figure of 15 of 21 matches the runbook's independently-derived number exactly. The method is sound.

### This reframes the priority question

The runbook states "The US States index is the most defective dataset in the benchmark." That is true on **structural** grounds — 30 of 51 jurisdictions missing, ranks 9–38 lost, survivors renumbered contiguously so displayed rank is not national rank.

It is **not** true on assessment coverage. Two indexes are worse:

- **global-cities: 250 of 250 never assessed.** Not one of the 250 published city scores rests on an individual assessment.
- **us-cities: 139 of 144.**

Both are published, ranked, and sold. Neither carries a coverage disclosure — us-states does (`PartialCoverageDisclosure.tsx`, commit `88052892`).

**The disclosure asymmetry is the sharper problem.** The one index whose defects are disclosed is the one being fixed; the two with worse coverage are silently presented as complete.

---

## Evidence population in entity records

`site/src/data/entity-records/*.json` backs every entity detail page. The schema supports per-subdimension `evidence[]`. Almost nothing populates it.

| Kind | Records | With any evidence |
|---|---|---|
| country | 192 | 13 |
| company | 448 | 5 |
| ai-lab | 48 | 0 |
| city | 236 | 0 |
| robotics-lab | 50 | 0 |
| university | 100 | 0 |
| us-city | 144 | 0 |
| us-state | 20 | 0 |
| **TOTAL** | **1,238** | **18 (1.5%)** |

Every detail page for a US state, US city, global city, university, AI lab and robotics lab currently renders 40 subdimension scores with **zero supporting evidence**, marked `subdims_source: "reconstructed"`, `confidence: "low"`, `assessed_date: null`.

Wave 1's six states are the first US states with real per-subdimension evidence — but it sits in `research/`, not in the entity records, and will not reach a page until proposals are applied.

---

## Related discrepancy confirmed

`rotation-state.json` holds **1,260** entities; the indexes publish **1,256**. The gap is ai-labs: **54 in rotation, 50 published.** This matches the runbook's open item naming `nvidia-ai`, `oracle-ai`, `spacex-ai`, `reflection-ai` as having real assessment dates but no published row. Confirmed — publish or retire.

---

## What this implies for sequencing

The nightly pipeline assesses ~15 entities a night. At that rate, 941 unassessed entities is roughly **63 nights** of pipeline output, assuming zero re-assessment of the 319 already covered and no new entities.

The runbook already identifies the cheapest available lever:

> The nightly pipeline already produces dated, cited evidence for ~15 entities a night and currently discards it after the digest. Wiring that into `evidence[]` would populate records as a by-product of work already happening.

That remains the highest-leverage unblocked change. It does not require search budget, and it converts existing nightly work into permanent record improvement rather than a one-off digest.

**Recommended order, given a finite search budget:**

1. **Wire nightly evidence into `evidence[]`** — no search cost, compounding benefit, addresses 1,238 records rather than 51.
2. **Coverage disclosure for global-cities and us-cities** — no search cost. Closes the asymmetry where only the index being fixed is the one that admits its defects.
3. **Finish us-states (39 remaining)** — search-bound, already in flight, structurally worst.
4. **Publish-or-retire the 4 ai-labs entities** — no search cost, small.
