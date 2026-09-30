# Pre-registration — does the strengthened cold-arm brief lift items that already passed?

**Written:** 2026-09-30, **before** any answer or score for this probe existed. **Backlog:** TRI-12.
**Iteration:** 63.

## The problem this exists to fix

Iteration 61 tested 40 items, flagged 7, and then re-ran 2 of them (`EMP-2-A`, `SYS-5-A`) with a writer brief
asking for the *most substantively complete* cold answer it could produce. `SYS-5-A` moved from 3/2 to 1/4 and I
recorded it as discriminating.

That re-run was applied **only to failures**, so it could only ever move results toward clearing items. I said so
in the record and quoted the pre-registered 33/35 rather than 34/35 — but saying so is not the same as knowing.
There are two explanations for `SYS-5-A`'s improvement and the published record cannot distinguish them:

1. **Repair.** Its original cold arm was genuinely badly written, and the stronger brief produced the answer the
   item deserved. The item discriminates.
2. **Artefact.** The strengthened brief lifts *any* cold arm, because it asks for more content and more content
   scores higher. Then `SYS-5-A`'s gain says nothing about that item, and the re-run was a method for clearing
   whatever it was pointed at.

Explanation 2 is testable: apply the same strengthened brief to items that **already passed** and see whether
their cold arms improve too.

## Design

**Sample: 8 items, stratified by headroom, not randomly drawn from all 33.**

- **All 4** passing in-scope items whose cold arm scored **3**: `EQU-2-B`, `BND-5-B`, `AWR-5-B`, `ACC-5-B`.
  These have +2 of headroom and are the closest available analogue to `SYS-5-A`, whose original cold arm scored 2.
- **4 drawn from the 18** whose cold arm scored **4**, selected by seeded shuffle (mulberry32, **seed 63**,
  recorded here before the draw) so the choice is reproducible and not mine.
- **The 11 items already at 5 are excluded, deliberately.** They have zero headroom. Including them would drive
  the mean change toward zero by arithmetic and let me announce a null result I had built in advance. Excluding
  them makes the test *easier to fail*, which is the direction an honest check should lean.

**Conditions:** the writer receives the same prompts-only brief and the **same strengthened wording** used in the
Iteration 61 re-run, verbatim, including the sentence about a previous attempt being narrow. Blind scoring, key
in a separate directory, scorer on a different model tier from the writer, each scorer given a directory
containing one file.

**Measure:** per item, Δ = (strengthened cold-arm score) − (original cold-arm score). Paired, same item, same
rubric. The warm arm is regenerated too, so the pair stays comparable, but Δ on the cold arm is the quantity of
interest.

## Decision rule — fixed now

| mean Δ across the 8 | conclusion | consequence |
|---|---|---|
| **≥ +1.0** | the brief is a general improver | `SYS-5-A`'s flip is withdrawn; it returns to **flagged**, and the Iteration 61 re-run is recorded as an invalid method for clearing items |
| **≤ +0.5** | the brief is not a general improver | `SYS-5-A`'s flip stands as a genuine repair; 34/35 becomes quotable alongside 33/35 |
| **between +0.5 and +1.0** | inconclusive | `SYS-5-A` stays **flagged** pending human review; neither figure is upgraded |

Ties break against my earlier result: anything short of a clear null leaves `SYS-5-A` flagged. The asymmetry is
deliberate, because the earlier result is the one I have an interest in.

**Both outcomes will be published.** A probe that could only confirm what I already wrote would not be one.

## What this cannot settle

- 8 items, one pair each, one rater. A null result here does not prove the brief never inflates a score; it
  bounds the effect at roughly half a point on items with headroom.
- `EMP-2-A` is unaffected either way. It held at 1/2 across two attempts, so no result here clears it; it remains
  referred to human review (TRI-13).
- If the strengthened brief turns out to be a general improver, that is also a finding about **the bank's ceiling
  behaviour** — it would mean the rubrics reward volume — and that is a larger question than TRI-12.

## The draw (executed 2026-09-30, seed 63 as registered above)

- **blunt=3 stratum, all four:** EQU-2-B, BND-5-B, AWR-5-B, ACC-5-B
- **blunt=4 stratum, drawn by seeded shuffle:** EMP-5-A, BND-3-A, INT-4-B, EQU-3-B

Reproduce with the mulberry32 shuffle at seed 63 over the 18-item stratum in the order listed in
`results.json`.

## Deviation recorded — the first scoring run was discarded unread

The scorer prompt I first dispatched contained an extra rule the Iteration 61 scorer never received:
*do not reward length or volume of content for its own sake.*

That rule is defensible on its own terms, and including it here would have been a mistake, because the whole
measurement is a difference between two administrations. Any wording that differs between them shows up in the
delta and is indistinguishable from the effect being measured — and this particular rule points straight at the
hypothesis under test, since the artefact explanation is precisely *more content scores higher*. Adding an
instruction that suppresses the predicted effect, and then reporting a null, would have been a rigged null.

It was caught before any score was read. The first run's output was **discarded without being opened**, and the
scoring was re-dispatched with the Iteration 61 rater wording reproduced verbatim. Recording it here rather than
silently re-running, because *which* administration got discarded, and whether anyone looked first, is exactly
what a reader would need to know to trust the delta.

**Discarded:** `scores.json` (unread) — **Used:** `scores-v2.json`.
