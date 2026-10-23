# Pre-registration: instrument experiments E1-E6 on pilot data (D-60, Stream C)

**Date:** 2026-10-22. **Author:** analytics agent (D-60 Stream C). **Status:** internal, PRD FDM-1 default (results are
not cited publicly). **Data:** pilot-2026-10-03 (all experiments) and pilot-2026-10-02 (E6, second bridge).
Every output carries the label "pilot data, unofficial, not a score, comparability none".

This file is written before any rating row was opened. Its sha256 and an ISO timestamp are in `PREREG_HASH.txt`.
It is not edited after hashing. Any change of plan is recorded in `DEVIATIONS.md` with its reason.

## 0. What the author knew before writing this

- **Structure only was inspected** (`inspect-structure.mjs` prints keys, types and array lengths, never a value).
- **Summary figures already printed in design documents were seen** while reading the brief:
  - the per-subject exact agreement range 0.759 to 0.867 (`docs/model-eval/METRICS_EVAL.md`);
  - the pooled within-item length slope (-0.074);
  - bridge mean absolute differences 0.229 (pilot-2) and 0.146 (pilot-3), with exact counts 37/48 and 41/48;
  - pooled signed bridge drift +0.021 and +0.063, and the per-judge range -0.062 to +0.214;
  - the count of pre-existing separations (5 of 6 arm-A build pairs uncorrected, 3 of 6 Bonferroni);
  - which subjects have published points withheld (`site/public/data/model-waves/*.json`).
- **No raw rating, no per-item figure, no batch-position figure and no analysis.json rating field was read.**
- Thresholds below are therefore fixed before any figure this plan produces is known. They are not fixed blind to the
  summaries listed above. The report must say so.

## 1. Common rules

1. **Inputs (read only).**
   - Final rating rows: `pilot-2026-10-03/mcp-scorecards/<subject>/mcp-rating-map.json`, `rows[]`, fields `item_id`,
     `subject_trial`, `response_id`, `judge`, `judge_provenance`, `rating_1_5`. These are the rows `bin/analyze-pilot.mjs`
     uses.
   - Reply text, for word counts only: `keys/ingested/answers.json` `responses[].{subject,trial,item_id,response}`.
     Words = `response.trim().split(/\s+/).length` (as in `analyze-pilot.mjs`).
   - Item dimension: `site/src/data/model-benchmark/tasks-v1.json` `items[].{id,dimension}`.
   - Batch order (E1): `judge-batches/<judge>__batch-NN.json` `entries[]` (order as presented), joined by
     `response_id` to `judge-answers/<judge>__batch-NN.answers.json` `ratings[]` (original answers, before any requote
     or reroute). Subject and item of a reply come from `keys/judge-key.json` `responses[]`. Bridge entries are
     `keys/judge-key.json` `bridge.entries[]`.
   - Batch delivery: `operations/judge-batches.map.tsv` (column 4 = `whole` or `split2`) and
     `operations/judge-batches.ledger.tsv` (ids ending `h1`/`h2` = a half delivered separately).
   - Bridge (E6): loaded with the harness's own functions, exactly as `analyze-pilot.mjs` does: `lib/assemble.mjs`
     `loadInputs` and `bridgeTexts`, and `lib/judge-answers.mjs` `loadRoutedAnswers`, on the final routed key
     (pilot-3: `judge-key.reroute-2.json` with answer dirs `judge-answers`, `judge-answers-reroute`,
     `judge-answers-reroute-2`; pilot-2: `judge-key.reroute.json` with `judge-answers`, `judge-answers-reroute`).
     Original ratings: `bridge.entries[].original_ratings`.
   - Pre-existing separation statements (E5): `pilot-2026-10-03/analysis.json` `comparisons[]` fields `a`, `b`,
     `kind`, `separated`, `bonferroni.separated`, `b_minus_a.separated`. Read only after this file is hashed.
   - Composite: `computeCompositeFromDimensions` from `site/scripts/lib/scoring.mjs`, unmodified; dimension = mean of
     item means (as in `analyze-pilot.mjs`).
2. **Resampling.** `B = 1000` bootstrap replicates (`PROTOCOL.json` `bootstrap_replicates`). Percentile intervals at
   sorted ranks `floor(0.025 B)` and `floor(0.975 B)` (0-based), as in `analyze-pilot.mjs`. Permutation tests use
   2000 permutations. PRNG: mulberry32. Seeds are fixed per experiment: E1 20261101, E2 20261102, E3 20261103,
   E4 none (no resampling), E5 20261105, E6 20261106. The reproduction check in E5 uses the published seed 20261003
   with the published generator (`lib/paired-bootstrap.mjs`).
3. **Determinism.** No clock in outputs, sorted keys, fixed iteration orders (subjects, judges, items sorted by
   label/id), numbers rounded to 4 decimals. The script is run twice; `results.json` must be byte-identical.
4. **Disclosure limits.**
   - No ordering, ranking or "best/worst" of models anywhere. Per-subject figures are listed alphabetically by stored label.
   - No per-subject composite point, dimension point or composite-difference point is printed for any subject. Pilot-3
     has seven subjects with a withheld point, so the rule is applied to all eight for simplicity. E5 reports interval
     widths, width ratios and separated booleans only, never interval endpoints.
   - No item prompt, construct text or anchor text is quoted. Items are named by id only.
5. **Same-family caveat.** All three judges are Claude. Nothing here can show a bias the three share.

## 2. E1: rating vs position within a judge batch

- **Hypothesis.** A rating depends on its reply's position in the batch (1 to 16) after removing item and subject effects.
- **Data.**
  - Original batches and their answers, main entries only. Bridge entries keep their positions but are not analysed.
  - Position = 1-based index in `entries[]`.
- **Residual.** `e = rating - itemMean(item) - subjectMean(subject) + grandMean`. The means are over all original main
  ratings: an additive item plus subject fixed-effect adjustment.
- **Statistic, per judge.**
  - OLS slope of `e` on position. The effect over a full batch is `slope x 15`.
  - Secondary: mean `e` in the pre-fixed bins 1-4, 5-8, 9-12 and 13-16.
- **Test.**
  - Within each batch of that judge, permute the residuals across that batch's main-entry positions.
  - 2000 permutations; recompute the slope each time.
  - Two-sided p = (count of |perm slope| >= |observed slope|, plus 1) / (2000 + 1).
- **Decision rule.**
  - A position effect is **present** for a judge if p < 0.05/3 (Bonferroni over 3 judges) **and** |slope x 15| >= 0.10
    rating points.
  - It is **absent (not detected)** otherwise. The report also gives the permutation 2.5 to 97.5 percentile band of
    `slope x 15` as the detectable range.
- **Sensitivity.** The same test excluding batches delivered as halves (map `split2`, or a ledger id ending `h1`/`h2`).
  Reported, not used for the decision.
- **v2 proposal.**
  - Present for any judge: make the per-judge entry shuffle mandatory and add a position check, slope x 15 within
    plus or minus 0.10, as a reported gate field.
  - Absent for all: keep shuffling as a cheap default (absence is not proof), and make the position check report-only.

## 3. E2: judge leniency and agreement noise

- **Data.** Final rating rows. Each reply has exactly two ratings from two different judges.
- **(i) Signed leniency.**
  - For each judge pair (alphabetical orientation, first minus second), take the mean of `r_first - r_second` over the
    replies both rated.
  - For each judge, take the mean of `r_j - r_other` over all replies it rated.
  - 95% interval: item-clustered bootstrap. Resample the 83 items with replacement and include every reply of each
    drawn item. B = 1000.
  - Decision: a pair or judge is **lenient or severe** if its interval excludes 0 **and** |mean| >= 0.10. It is
    **detectable but small** if the interval excludes 0 and |mean| < 0.10.
- **(ii) Per-subject exact agreement.**
  - Exact agreement = share of replies whose two ratings are equal.
  - For each subject, a 95% item-clustered bootstrap interval: resample items, keep all that subject's replies on each
    drawn item. B = 1000; the draws are paired across subjects.
  - Difference test: the subject with the highest observed exact agreement minus the lowest, on the same paired draws.
    The report names neither subject in this test.
  - Decision: the gap is **within noise** if the 95% interval of the difference includes 0.
- **(iii) Floor test for O9 (proposed floor 0.759).**
  - Null: every subject shares the pooled exact-agreement rate `p0`, the pooled share over all replies.
  - Simulate 20000 waves from the binomial model: each subject draws Binomial(n_s, p0)/n_s with its own reply count n_s.
  - Statistic: P(the minimum over the 8 subjects <= 0.759).
  - Also report each n's one-sided 5% lower quantile under `p0`, for n = 83 and n = 249.
  - Decision: if P >= 0.05, a fixed floor at 0.759 is **within the noise of a homogeneous panel**, so O9 as proposed is
    contradicted as a fixed number. The proposal is then an n-aware floor: the 5% lower quantile at the subject's n
    under the pooled rate of the wave, or a pooled-rate floor. If P < 0.05, 0.759 is not explained by sampling noise
    alone, and O9 is supported as a sanity floor.
  - The binomial model ignores item clustering, so it understates noise. The item-clustered intervals in (ii) are the
    check on that.
- **v2 proposal.** Covers O9 (above), and METH D-1, which reports signed judge-pair differences beside agreement.

## 4. E3: length and rating

- **Data.**
  - Final rating rows joined to the reply word count on (subject, trial, item).
  - `x = log(words)`.
- **Primary, per judge.**
  - Within-item slope: `x` centred on the item mean of `x` over all rows of that item, and the rating centred on the item
    mean rating over all rows.
  - OLS slope of the centred rating on the centred `x`, using that judge's rows.
  - 95% interval: item-clustered bootstrap, B = 1000.
- **Secondary, per judge.**
  - Within subject-item slope: centre `x` and the rating on the (subject, item) cell mean, using arm-A subjects only
    (3 trials; arm B has 1 trial and no within-cell variation).
  - This removes between-model differences that go with length.
  - Same interval method as the primary.
- **Units.** Rating points per unit of log(words). One unit is a 2.7-fold length change.
- **Decision rule.**
  - Length bias is **present** for a judge if the secondary interval excludes 0 **and** |slope| >= 0.10.
  - **Confounded only** if the primary interval excludes 0 but the secondary does not.
  - **Not detected** otherwise.
- **Exploratory: arm B minus arm A.**
  - Applies only to builds whose length instruction was effective. Effective is recomputed here from word counts by the
    pre-registered pilot-3 section 9 rule: the median for arm B is closer to the "about N words" target in its system
    message than the median for arm A.
  - Per item, per effective build: `dR = mean rating (B) - mean rating (A)` and `dL = mean x (B) - mean x (A)`.
  - Report only the across-item OLS slope of `dR` on `dL` and its correlation, with an item bootstrap interval.
  - No build's mean `dR` is printed, because it is a per-model difference point. No decision is attached, because the
    arms were not designed for this test.
- **v2 proposal.**
  - Present for any judge: report a length-adjusted composite beside the unadjusted one (reporting only), and add a
    length sentence to the judge instructions.
  - Otherwise: keep the existing within-item regression as a reported field and do not add an adjusted figure.

## 5. E4: item difficulty and discrimination

- **Data.** Final rating rows, all 8 subjects. Items are named by id only.
- **Per-item quantities.**
  - `mean_all`: mean over all rows of the item.
  - `share5`, `share1`: the share of the item's ratings equal to 5, and equal to 1.
  - `var_between_A`: the variance (population, divide by k) of the 4 arm-A subjects' item means. `var_between_all` is
    the same over all 8 subjects (secondary).
  - `var_within_reply`: the mean over the item's replies of `(r1 - r2)^2 / 2`, the judge variance within a reply.
  - `mad_judges`: the mean |r1 - r2| over the item's replies.
  - `disc_ratio`: `var_between_A / var_within_reply`. It is `null` when `var_within_reply = 0`.
  - `cells_all5`, `cells_all1`: the number of subjects, of 8, whose every rating on the item is 5, and is 1.
  - `item_rest_r`: the correlation, over the 16 subject-trial units, between the unit's item rating (mean of 2 judges)
    and the unit's mean rating on all other items.
- **Pre-fixed flags.**
  - **ceiling**: `mean_all >= 4.5` or `share5 >= 0.80`.
  - **floor**: `mean_all <= 1.5` or `share1 >= 0.80`.
  - **low_discrimination**: `var_between_A < 0.05`, or `disc_ratio < 1` (`disc_ratio` not null).
  - **judge_disagreement**: `mad_judges >= 0.50`.
  - **negative_item_rest**: `item_rest_r < 0`.
- **Report.**
  - Counts per flag; item ids per flag; distributions (min, median, max) of each quantity.
  - Pooled counts of (subject, item) cells that are all 5 and all 1. No per-subject breakdown.
- **v2 proposal.**
  - Flagged ids enter the item-fix register (W-1) and the front of the human-validation queue (W-4).
  - An item enters bank v3 only when two signals agree (FDM-4).
  - No item is dropped on this evidence alone.

## 6. E5: interval method

- **Composites.** Per subject, from the final rows, with the canonical composite.
- **Methods.** Each is run with B = 1000, seed 20261105, the same draws for every subject where a draw is shared:
  - **(a) Scorer-style rows.** Item set fixed. Within each item, resample that subject's rating rows (2 per reply) as if
    each were an independent trial.
  - **(b) Reply-clustered.** Item set fixed. Within each item, resample that subject's replies with both their ratings.
    For arm-B subjects (1 trial) this has no variation, which is a real property of the design.
  - **(c) Item-clustered, two-stage: PRIMARY.**
    - Resample items within dimension, with the same item draw for every subject (paired, as published).
    - Then, within each drawn item, resample that subject's replies with both ratings kept together.
    - This nests both sources of variation.
  - **(c0) Item-only (the published method), as a reproduction check.**
    - `lib/paired-bootstrap.mjs`, published seed 20261003, B = 1000.
    - It must reproduce every published `separated` and `bonferroni.separated` boolean. If it does not, that is a
      deviation, reported, and E5's survival counts are still given.
- **Comparisons.**
  - The 16 pre-registered comparisons in `run-config.json` `comparisons`: 6 arm-A build pairs, 6 arm-B build pairs and
    4 arm comparisons.
  - Each is a paired difference on the same draws.
  - Separated = the 95% percentile interval excludes 0.
  - For the 6 arm-A build pairs, the Bonferroni-over-6 interval uses the published rank rule, with tails at
    `floor((alpha/2) B)` and `ceil((1 - alpha/2) B) - 1`, and alpha = 0.05/6.
- **Outputs.**
  - Per subject, alphabetical: the widths of (a), (b), (c) and (c0), and the ratios a/c, b/c and c0/c.
  - Per comparison kind: the median width ratio of the difference intervals.
  - The counts of pre-existing separations (from `analysis.json`) that survive under (c), uncorrected and Bonferroni.
  - The count of new separations under (c) that were not separated before.
  - Pairs are named, if at all, only by stored label.
  - No endpoint is printed, and no point is printed.
- **Sanity check.** Width (a) for the arm-A subjects is compared with the width of the stored scorecard trial-level
  interval (`scorecard.json` `uncertainty.composite_interval.ci`). Only the width ratio is reported.
- **Decision rule.**
  - (c) is the interval method to propose for v2 if its median width ratio c/c0 >= 1.10, meaning the reply level adds
    at least 10%.
  - Otherwise, (c0) item-only is adequate. Item-level resampling is kept in both cases.
  - Each pre-existing "separated" statement that does not survive (c) is listed for the correction path (D-29a item 7).
    It is a founder decision; no published report is edited here.
  - If width a/c < 0.9 for the median subject, the scorer-style interval is confirmed too narrow (README limit 1).

## 7. E6: bridge drift

- **Data.**
  - Both bridges: pilot-2, re-rating pilot-1 replies, and pilot-3, re-rating pilot-2 replies.
  - Each bridge has 24 replies, with 2 judge ratings each, so 48 pairs.
  - `d = new - original` per (reply, judge).
- **Statistics, per bridge, pooled and per judge.**
  - Mean signed `d`, mean |d|, and the count exact.
  - 95% interval: reply-clustered bootstrap. Resample the 24 bridge replies with both their pairs. B = 1000.
- **Decision rules.**
  - **Signed drift has a sign** for a judge in a bridge if the 95% interval of its mean signed `d` excludes 0.
  - **O11 calibration candidate.**
    - Take the largest, over the 2 bridges, of the upper 95% bound of |pooled mean signed d|.
    - Round it up to the next 0.05 rating units.
    - Also state it in base-composite units (x 25: the linear part of the composite, before the integration premium).
    - It is labelled "calibration, n = 2 bridges".
    - If any per-judge signed interval excludes 0, E6 supports an active signed-drift gate. Otherwise it supports
      report-only for the first v2 wave.
  - **The 0.30 mean-|d| threshold** (v1 anchor):
    - **contradicted (too tight)** if either bridge's upper 95% bound of mean |d| is above 0.30;
    - **possibly loose** if both upper bounds are at or below 0.15;
    - **consistent** otherwise.
- **Comparison with within-run judge agreement.**
  - The ratio of bridge mean |d| (same judge, other day) to the pilot-3 within-run mean |r1 - r2| (other judge, same day).
  - Descriptive only.
- **v2 proposal.** O11 and the anchor threshold. A new protocol version only.

## 8. What this plan does not do

- It changes no data, published page or protocol file.
- It computes no ranking and no model point.
- It makes no public claim.
- Every v2 implication is a proposal for the founder's PROTOCOL-V2-2 step.
