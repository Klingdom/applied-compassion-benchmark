# Deviations from PREREGISTRATION.md (sha256 efa1b958...376e)

Append-only. `PREREGISTRATION.md` is unchanged since it was hashed. Every pre-registered statistic and decision rule was
computed as written. The items below are additions, clarifications, or implementation choices that the plan did not
specify.

- **D1 (2026-10-22, addition, exploratory). E5 common random numbers.**
  - *What happened.* After the first run, the primary two-stage interval (c) came out slightly narrower than the
    published item-only interval (c0) for several subjects. The median subject width ratio c/c0 was 0.958.
  - *Why that is not a method effect.* Adding a source of variation cannot narrow an interval in expectation, so this
    is Monte Carlo noise: (c) and (c0) use different generators and seeds.
  - *What was added.* An exploratory block, `E5.exploratory_D1_common_random_numbers`:
    - item draws come from one stream and reply draws from a second stream (seed + 7919);
    - two-stage and item-only therefore share identical item draws;
    - it was run for five seeds (20261105 to 20261109).
  - *What it changes.* Nothing in the pre-registered decision, which stays as computed ("propose_two_stage_c": false).
    The block only helps read it.
- **D2 (clarification). E6 "upper 95% bound of |pooled mean signed d|".** This is computed as max(|lo|, |hi|) of the
  95% interval of the pooled mean signed d. The plan did not state which construction to use.
- **D3 (implementation choice). E5 "separated".**
  - The uncorrected interval endpoints are rounded to 0.1 before the exclusion of 0 is tested.
  - The Bonferroni test uses unrounded replicates.
  - Both follow the published convention in `bin/analyze-pilot.mjs` and `lib/paired-bootstrap.mjs`, so that (c0)
    reproduces every published flag exactly. It does: 16 of 16 uncorrected flags and 6 of 6 Bonferroni flags.
  - The same convention is applied to (a), (b) and (c).
- **D4 (implementation choice). E5 (a) and (b) draws.** These are drawn per subject from one stream, in alphabetical
  subject order, with no pairing across subjects (the scorer resamples each subject on its own). In (c), the item draw is
  shared across subjects, as the plan states; the reply draws are per subject.
- **D5 (unspecified case). E4 `item_rest_r` is null** for 8 items whose ratings have zero variance across the 16
  subject-trial units, and `disc_ratio` is null for 15 items. A null value does not raise the corresponding flag. The plan
  fixed this rule for `disc_ratio` only; the same rule was applied to `item_rest_r`.
- **D6 (record). PREREG_HASH.txt timestamp.**
  - The timestamp is UTC: 2026-10-23T02:02:25Z, which is 2026-10-22 local time.
  - The plan file was hashed before `run-experiments.mjs` existed.
  - `inspect-structure.mjs`, which prints shapes only, is the only script that ran before the hash.
