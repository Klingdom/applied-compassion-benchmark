# Experiments E1–E6 on pilot data: report (2026-10-22)

**INTERNAL (PRD FDM-1).** Pilot data, unofficial: not a score, with no comparability claim. No model is ordered here, and
no withheld point estimate appears. Item IDs are given, never item text.

The experiments agent produced this content. Its harness refused to write report files, so the coordinator saved it
and verified it as follows (V2, 2026-10-22):
- `sha256(PREREGISTRATION.md)` = `efa1b958…5c376e`, the value in `PREREG_HASH.txt`.
- File times: the pre-registration was written at 20:02:14 local, before `run-experiments.mjs` (20:06:54) and
  `results.json` (20:07:22).
- A coordinator re-run gave a byte-identical `results.json`: sha256 `68251746ea6592133f08ec129c9b4fd665170259f7ca8feb1ddd0b79ff33b627`.
- `results.json` contains 0 `"composite` keys.
- The pilot-2026-10-03 directory is unchanged (git status empty).
- The E4 headline was checked independently: across the 193 `*.answers.json` files in pilot-2026-10-03, the ratings
  are 1:771, 2:1236, 3:618 and 4:100, with **no 5**. The count of 4s is the positive control.

Pre-registration: `PREREGISTRATION.md` (section 0 lists the summary figures that were known before hashing).
Deviations: `DEVIATIONS.md` (D1–D6). The script `run-experiments.mjs` has sha256 `bb3fc816…720527`.

**Reproduction check:** the published-method re-run (c0, seed 20261003) reproduces all 16 published "separated" flags
and all 6 Bonferroni flags. The scorer-style widths match the stored scorecards (ratio 1.00 to 1.07), and the bridge
figures match `bridgeDrift`.

## Findings

**E1, batch position.**
- **Finding:** one judge (sonnet) shows a position effect: ratings fall 0.164 across a 16-entry batch (permutation
  p = 0.005, outside the null band of ±0.11). The other two judges show none (p = 0.26 and 0.42).
- **Interpretation:** batch order is shuffled per judge, so the effect adds noise, not bias toward a subject.

**E2, leniency.**
- **Finding:** sonnet is the strictest judge. fable − sonnet = +0.095 [0.043, 0.147] and opus − sonnet = +0.050
  [0.002, 0.098], both under the 0.10 threshold.
- **Agreement 0.759 against 0.867:** highest − lowest = +0.108 [0.008, 0.213], but that statistic selects the extremes
  after looking. Under one pooled rate of 0.821, the lowest of 8 subjects falls at or below 0.759 in **22.9%** of waves,
  and 5 of 8 per-subject intervals contain 0.759.

**E3, length.**
- **Finding:** no length effect for any judge. Every interval contains 0, but power is low (about ±0.27).
- **Exploratory arm B − arm A:** −0.095 [−0.341, 0.178].

**E4, items.**
- **Finding:** **no rating of 5 in pilot-3, so 0 items are at the ceiling. 18 of 83 items are at the floor.**
  - 133 of 664 subject-item cells are all 1s, and the median item mean is 1.94.
  - 49 items do not separate builds beyond judge noise, and 27 have a negative item-rest correlation.
  - 1 item shows judge disagreement (EQU-5-B), and 27 items carry two or more flags (`results.json`
    `E4.items_with_two_or_more_flags`).

**E5, intervals.**
- **Scorer-style intervals are about 4 times too narrow** (median width ratio 0.23), which confirms README limit 1.
  Most of the narrowing comes from holding items fixed.
- **Adding reply resampling** on top of items adds 0 to 1.5% to single ranges, and about 9 to 13% to paired
  differences between 3-trial subjects (exploratory, D1).
- **Under item-then-reply resampling,** these published separations survive:
  - arm-A uncorrected: 4 of 5. `llama3.2-3b-A | mistral-7b-A` fails under every seed;
  - arm-A Bonferroni: 3 of 3 (borderline in 1 of 5 seeds);
  - arm-B: 3 of 3.
- **No new separations appear.**

**E6, bridge drift.**
- **Pilot-2:** MAD 0.229 [0.104, 0.375], signed +0.021 [−0.083, 0.125].
- **Pilot-3:** MAD 0.146 [0.042, 0.292], signed +0.063 [−0.021, 0.188].
- **No judge's signed interval excludes 0.** The closest is pilot-3 sonnet at +0.214 [0, 0.455].
- **Day-to-day re-rate drift is about the size of same-day disagreement between judges** (ratios 1.26 and 0.80).

## What this means for PROTOCOL.v2 (proposals for PROTOCOL-V2-2; nothing is changed)

- **O9, agreement floor:** a fixed 0.759 would fire on noise in about 1 wave in 4. Use a floor that depends on n (the
  binomial lower 5% point at the wave's pooled rate: 0.747 at n = 83, 0.779 at n = 249), or a pooled-only floor.
- **O11, signed drift:** keep it report-only for the first v2 wave. A calibration candidate, if a number is wanted:
  0.20 rating units, from 2 bridges.
- **v1 anchor threshold of 0.30:** too tight for a 48-pair bridge (pilot-2's upper bound is 0.375). Options: a larger
  anchor sample, a threshold tested against the upper bound and scaled to n, or about 0.40.
- **Interval method:** never quote scorer trial-level intervals. Item-clustered intervals are adequate for single
  ranges; use item-then-reply for paired differences.
- **Batch position:** a mandatory per-judge shuffle (already the practice), plus a reported position check at ±0.10.
- **Length:** no length-adjusted composite is needed on this evidence.
- **Judge pairs:** report the signed differences alongside agreement.
- **Instrument (new):** a floor-heavy bank with no top ratings limits what any wave can show. This feeds the item-fix
  register (W-1) and a future bank version. It is not a reason to change scoring.

## For the founder
The published uncorrected separation `llama3.2-3b-A | mistral-7b-A` (pilot-3) holds under the published item-only method
and does not survive item-then-reply resampling. The published statement is correct for its stated method. Whether to
add a dated methods note is a founder decision under D-29a item 7. No published report was changed.
