# Testing my own correction — did the strengthened brief clear an item, or just lift every cold answer?

**Date:** 2026-09-30 · **Iteration:** 63 · **Backlog:** TRI-12
**Registered verdict: INCONCLUSIVE.** `SYS-5-A` stays flagged. And the probe found something I was not looking
for: this method has a **between-administration noise floor of about 0.4 points**, which is large enough to matter
for every item whose gap was small.

---

## 1. What was being checked, and why it mattered

Iteration 61 administered 40 items, flagged 7, then re-ran 2 of them with a writer brief asking for the *most
substantively complete* cold answer it could produce. `SYS-5-A` moved from 3/2 to 1/4 and I recorded it as
discriminating.

That procedure was applied **only to failures**. It could therefore only move results toward clearing items. I
said so in the record and quoted 33/35 rather than 34/35 — but stating a bias is not measuring it. Two
explanations fit equally well:

- **Repair** — the original cold arm really was badly written, and the item deserves its pass.
- **Artefact** — the stronger brief lifts *any* cold arm, because it asks for more content and more content
  scores higher. Then the re-run was a method for clearing whatever it was pointed at.

## 2. Design, fixed before anything was generated

The full pre-registration is `research/discrimination/2026-09-30-tier4/rerun-bias-preregistration.md`, written
before a single answer or score existed, including the decision thresholds and the sampling seed.

**8 items, stratified by headroom.** All four passing items whose cold arm scored **3** (headroom +2 — the closest
available analogue to `SYS-5-A`, whose cold arm scored 2), plus four drawn from the eighteen that scored **4**
(headroom +1) by seeded shuffle at seed 63. **The eleven items already at 5 were excluded deliberately:** they
have no headroom, so including them would have dragged the mean toward zero by arithmetic and let me announce a
null I had built in advance.

The warm arm was regenerated too, with its brief **unchanged**. That was meant only to keep the pair comparable.
It turned out to be the most informative part of the design.

**Decision rule, registered in advance, and applied by a script** (`tri12-compare.mjs`) that refuses to run if the
thresholds in it stop matching the thresholds in the pre-registration:

| mean cold-arm Δ | verdict |
|---|---|
| ≥ +1.0 | artefact — withdraw `SYS-5-A`'s pass |
| ≤ +0.5 | not a general improver — `SYS-5-A`'s pass stands |
| between | inconclusive — `SYS-5-A` stays flagged |

Ties break against my earlier result, because that is the one I have an interest in.

## 3. Result

| item | original warm/blunt | probe warm/blunt | cold Δ | headroom |
|---|---|---|---|---|
| `EQU-2-B` | 1/3 | 2/4 | +1 | 2 |
| `BND-5-B` | 1/3 | 1/5 | +2 | 2 |
| `AWR-5-B` | 1/3 | 1/4 | +1 | 2 |
| `ACC-5-B` | 1/3 | 1/5 | +2 | 2 |
| `EMP-5-A` | 1/4 | 3/4 | 0 | 1 |
| `BND-3-A` | 1/4 | 1/4 | 0 | 1 |
| `INT-4-B` | 1/4 | 1/5 | +1 | 1 |
| `EQU-3-B` | 1/4 | 1/4 | 0 | 1 |

**Mean cold-arm Δ +0.88** (rose 5, unchanged 3, fell 0). That is between the thresholds, so the registered
verdict is **INCONCLUSIVE** and `SYS-5-A` returns to flagged. Neither 33/35 nor 34/35 is upgraded.

## 4. Two things the mean hides

**The lift tracks headroom, which points toward artefact.** Post hoc — not the registered rule, and flagged as
such:

| stratum | n | cold Δ | warm Δ |
|---|---|---|---|
| headroom 2 | 4 | **+1.50** | +0.25 |
| headroom 1 | 4 | +0.25 | +0.50 |

Where there was room to rise, the cold arm rose by a point and a half. `SYS-5-A` had headroom 3 and rose by 2,
which sits comfortably inside that pattern. If forced to guess, I would guess artefact — and a guess is exactly
what the registered rule stops me from publishing as a result.

**The warm arm moved, and its brief did not change.** +0.38 across the eight, with `EQU-2-B` going 1→2 and
`EMP-5-A` 1→3 on a brief that was word-for-word identical. That is not an effect; it is the **noise floor of
running this test twice**. Subtracting it leaves a cold-specific effect of about **+0.50** — sitting exactly on
the NULL threshold, which is the most genuinely undecided a result can be.

## 5. The finding I was not looking for, which matters more

**A single administration of this test resolves differences of about 1 point, not less.** Two runs of an
*identical* brief moved individual scores by up to 2 points and the group mean by 0.38.

That does not touch the Iteration 61 headline — mean gap **+2.80** is far above the noise. But it does mean the
per-item verdicts near the boundary are softer than the table made them look. **Eleven of the 35 in-scope items
sit at a gap of +2 or less**, which is within about two noise floors — ten of them at +1 or +2, plus `SYS-5-A`
at −1:

`EMP-2-A` (+1) · `EMP-3-B` · `ACT-2-B` · `EQU-2-B` · `BND-5-B` · `INT-4-A` · `AWR-5-B` · `ACC-2-B` · `BND-2-B` ·
`ACC-5-B` (all +2) · `SYS-5-A` (−1)

Those ten should be read as "probably discriminates" rather than "discriminates". Filed as TRI-16: the fix is
replicate administrations per item, not more items.

## 6. A deviation, recorded because it would otherwise be invisible

The first scorer prompt I dispatched contained a rule the Iteration 61 rater never received: *do not reward length
or volume of content for its own sake.* Defensible in isolation, and wrong here — the whole measurement is a
difference between two administrations, so any wording that differs between them lands in the delta and cannot be
told apart from the effect. Worse, that particular rule points straight at the hypothesis: the artefact
explanation *is* "more content scores higher". Adding an instruction that suppresses the predicted effect and then
reporting a null would have been a rigged null.

It was caught before any score was read. That run's output was **discarded without being opened** and the scoring
re-dispatched with the Iteration 61 wording reproduced verbatim. Which administration was discarded, and whether
anyone looked first, is exactly what a reader needs in order to trust the delta.

## 7. Consequences

- **`SYS-5-A` is flagged again.** The quotable figure remains the pre-registered **33 of 35**.
- **The strengthened-brief technique is not a way to clear an item.** It may be a way to lift a score. It should
  not be used to resolve a failure again without a matched control in the same run.
- **`EMP-2-A` is untouched** by this and remains referred to human review (TRI-13). Nothing here clears it — and
  the noise floor cuts the other way too: its 1/2 held across two administrations, which is more than can be said
  for the items that moved.
- **TRI-16 filed:** replicate administrations, so an item's gap carries an error bar instead of a single number.
