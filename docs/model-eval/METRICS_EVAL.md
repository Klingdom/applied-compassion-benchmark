# Evaluation-loop indicators (instrument health, not model quality)

**Date:** 2026-10-22. **Author:** analytics. **Status:** PROPOSAL (internal). Delivers build item W-6 of `docs/AI_MODEL_WEEKLY_CYCLE_PLAN.md` (sections 6 and 8). Directive D-60. Changes no protocol, data, score or page.

**Reading rules.** These indicators describe whether the measuring instrument is stable and trustworthy. None describes which model is better. Every wave is `official:false, comparability:none` (D-29a), so no value here is compared across waves as a model result.

**How the baseline was made.** The session that wrote this had no code-execution tool. Baseline values were read from the stored wave files and `analysis.json`, and the few derived values (means, sums, shares) were calculated by hand from those numbers. The Node script `C:\Users\philk\AppData\Local\Temp\claude\C--Users-philk-applied-compassion-benchmark\65564a78-d2e4-4f91-8239-694caf33ef48\scratchpad\eval-baseline.mjs` re-derives them and was **not run**. Confirm with:
`node C:\Users\philk\AppData\Local\Temp\claude\C--Users-philk-applied-compassion-benchmark\65564a78-d2e4-4f91-8239-694caf33ef48\scratchpad\eval-baseline.mjs C:\Users\philk\applied-compassion-benchmark`
Anything marked **NOT COMPUTED** needs raw rating rows that no stored wave field holds.

Wave files: `site/src/data/model-benchmark/waves/pilot-2026-10-0{1,2,3}.json` (P1, P2, P3). `S` = `subjects.<id>`. P1 = 4 Claude subjects, 3 trials, judged by Claude (haiku excluded as judge). P2 = 2 open-weight subjects, 3 trials. P3 = 4 builds x arms A (3 trials) and B (1 trial), 1,328 replies.

---

## 1. Indicator definitions

Schema differences between waves are real: P1 lacks `judge_validity`, `bridge_drift`, `subject_provenance`, `operations.subject_replies`. P1 has `quote_grounding` instead. The script must treat a missing block as "not measured", never as zero.

### I1 Judge exact agreement per subject
- **Formula:** share of a subject's replies on which the two judges gave the same 1-5 rating. Report per subject, plus the wave minimum and maximum.
- **Source:** `subjects.<id>.judge_agreement.exact` (exists in P1, P2, P3). Wave pooled value only in `research/model-runs/pilot-2026-10-03/analysis.json` `judge_agreement_overall.exact` (absent in P1 and P2 analysis files).
- **Unit:** fraction 0-1. **Threshold:** floor proposed = lowest P3 per-subject value, 0.759 (`MODEL_TESTING_V2_PROPOSAL.md` section 4 gate 4; `model-ranking-conditions.ts:88-89`). Not ratified.
- **Caution:** arm B subjects have 83 replies, arm A 249, so the arm B values are noisier. The proposed floor was set by an arm B subject (`pilot-2026-10-03.json:479`). Report n beside every value.

### I2 Judge mean absolute difference and large disagreements
- **Formula:** mean of |rating1 - rating2| per reply; count of replies differing by 2 or more.
- **Source:** `S.judge_agreement.mean_absolute_difference`, `S.judge_agreement.responses_differing_by_2_or_more`. **Unit:** rating points; count. **Threshold:** none.

### I3 Cross-family signed difference
- **Formula:** mean(Claude-judge rating - non-Claude-judge rating) on the same reply, in composite units, per subject family.
- **Source:** **MISSING.** No wave field holds it. All judges are `family: claude` (`PROTOCOL.json:12-16`; `judge_set.judge_families`), so the value is undefined in every stored wave. Needs v2 judge records with a `family` per rating. **Threshold:** a v2 threshold is promised but not set (`MODEL_TESTING_V2_PROPOSAL.md` gate 4).
- **Stand-in until v2 exists (I3b):** judge leniency range = max minus min of `judges.<j>.leniency_vs_item_mean` (exists P1, P2, P3). Within-family only.

### I4 Bridge re-rate drift
- **Formula:** mean |new - original| over re-rated stored replies (`bridge_drift.mean_abs_difference`); exact share = `exact_match / pairs`; pooled signed drift = sum over judges of `pairs x mean_signed_difference_new_minus_original`, divided by `pairs`.
- **Source:** `bridge_drift.{pairs,mean_abs_difference,max_abs_difference,exact_match,per_judge.<j>.*}` (P2, P3 only; P1 has no bridge).
- **Unit:** rating points; fraction. **Threshold:** mean absolute difference at most 0.30 (`PROTOCOL.json:35-41`, status `proposed`). The signed check (METH D-1) is proposed, no threshold.
- **Caution:** the protocol cites 0.146 as "the only observation so far". P2 gives a second one, 0.229, that the rationale does not mention. P3's per-judge sonnet value is +0.214 on all 14 pairs it differs on in one direction (mean abs equals mean signed), so a mean absolute check would not show direction.

### I5 Judge validity failure rate
- **Formula:** unfound evidence quotes / ratings, per judge and pooled, measured on original answers (before requote).
- **Source:** P2, P3: `judge_validity.measured_on_original_answers.judges.<j>.{ratings,unfound,unfound_rate_percent}` and `.ratings_measured`. P1: `quote_grounding.judges.<j>.{ratings,not_found,not_found_rate}`.
- **Unit:** percent in P2/P3 but a **fraction** in P1. The script must normalise to percent. **Threshold:** at most 5% per judge (`PROTOCOL.json:19-22`, ratified in the pilots' preregistrations).
- **Companions:** requote share = `operations.ratings_requoted / design.ratings`; reroute share = `routing.<s>.ratings_by_provenance.rerouted-excluded-judge` summed / `design.ratings`; judge void share = `operations.judge_calls_voided / (judge_calls_accepted + judge_calls_voided)` (P2, P3 only; P1 has `judge_files_voided` and `judge_batches` but no accepted-call count).

### I6 Item-level variance and floor/ceiling counts
- **Formula:** for each item, variance of final ratings across trials and judges; floor count = items whose every rating is 1; ceiling count = items whose every rating is 5, per subject; also share of all ratings equal to 1 or 5.
- **Source:** **MISSING in wave JSON** (only dimension means and `dimension_item_counts` are stored). Raw inputs exist in `research/model-runs/pilot-*/judge-answers/*.answers.json` (`ratings[].{response_id,rating_1_5}`) and `keys/judge-key*.json`, plus `keys/ingested/answers.json` (`responses[].{subject,trial,item_id}`). The `response_id` to `item_id` join was not verified in this session; the implementer must confirm it in `lib/ingest.mjs` and the key files. **Threshold:** the variance gate is promised for v2 (gate 6 covers hosted subjects only); none set.

### I7 Reply length distribution
- **Formula:** words per reply (whitespace split) at p10, p50, p90, max, per subject; length-instruction check from `length_check.per_build`.
- **Source:** median only in wave: `S.median_reply_words`; `length.pooled_within_item_slope`, `length.pooled_within_item_r`, `length.within_subject_slopes.<s>`. Percentiles need `keys/ingested/answers.json` `responses[].response`. **Unit:** words. **Threshold:** none ratified; the pre-registered rule is section 9 of the P3 preregistration (arm B median closer to 250 than arm A).

### I8 Interval width
- **Formula:** `pilot_composite_interval95[1] - pilot_composite_interval95[0]` per subject; wave minimum, mean, maximum.
- **Source:** `S.pilot_composite_interval95` (all waves). **Unit:** composite points (0-100). **Threshold:** none. Width reflects item sampling and trial count, so compare arm A with arm A only.

### I9 Run completeness
- **Formula:** sum of `ok` / sum of `planned` over subjects; retries = sum of `retries_used`.
- **Source:** `operations.subject_replies.<s>.{planned,ok,failed,missing,retries_used}` and `operations.subject_run_complete` (P2, P3). P1 has `operations.subject_parts_planned` and `subject_files_voided` only. **Unit:** fraction. **Threshold:** failure-rate limit "within the 10% limit" is applied in P2/P3 (`section_9_throughput`); the v2 limit is not yet set (`MODEL_TESTING_V2_PROPOSAL.md` gate 2).

### I10 Time-to-wave
- **Formula:** hours from preregistration commit to approval packet (cycle plan B12).
- **Source:** **MISSING.** Wave JSON holds only `report_date` and dated `deviations[].date`. `research/model-runs/pilot-2026-10-03/operations/subject-run-summary.json` has `generated_at` (2026-10-04T03:46:09Z) for the end of collection only. No start, judging or packet timestamp is stored. The implementer should take commit times from git for the plan commit (v2 stage 2 records the sha in `weekly.json`) and add timestamps to `operations/` records. **Threshold:** set after week 4 (cycle plan).

### I11 Founder approvals per wave
- **Formula:** count of distinct approval requests answered per wave.
- **Source:** **MISSING.** No approval log exists. Proposed source: one line per approval in `research/model-runs/wave-<date>/approvals.jsonl` written by the packet generator (W-5). **Baseline:** "5 or more" under v1 is a design estimate (`MODEL_TESTING_V2_PROPOSAL.md` R5), not a count. **Target:** 1 (cycle plan B11).

---

## 2. Baseline, pilot-1 to pilot-3 (read from stored files; hand-derived where marked d)

| Indicator | P1 (4 Claude subjects) | P2 (2 subjects) | P3 (8 subjects) | Source |
|---|---|---|---|---|
| I1 exact agreement, min / max per subject | 0.655 / 0.791 | 0.835 / 0.839 | 0.759 / 0.867 | `S.judge_agreement.exact` |
| I1 mean of per-subject values (d, unweighted) | 0.729 | 0.837 | 0.815 | arithmetic on the above |
| I1 pooled over all replies | not stored | not stored | 0.821 (n=1,328) | P3 `analysis.json` `judge_agreement_overall.exact` |
| I2 mean abs difference, min / max per subject | 0.22 / 0.36 | 0.16 / 0.17 | 0.14 / 0.25 | `S.judge_agreement.mean_absolute_difference` |
| I2 replies differing by 2 or more (sum) | 15 | 2 | 3 | `S.judge_agreement.responses_differing_by_2_or_more` |
| I3 cross-family signed difference | undefined (no non-Claude judge) | undefined | undefined | `judge_set.judge_families` = claude only |
| I3b judge leniency range (max - min, d) | 0.176 (three kept judges) | 0.12 | 0.123 | `judges.<j>.leniency_vs_item_mean` |
| I4 bridge mean abs difference | none | 0.229 (vs P1) | 0.146 (vs P2) | `bridge_drift.mean_abs_difference` |
| I4 bridge exact pairs | none | 37 of 48 (0.771, d) | 41 of 48 (0.854, d) | `bridge_drift.exact_match`, `.pairs` |
| I4 bridge pooled signed (new minus original, d) | none | +0.021 | +0.063 | `per_judge.<j>.mean_signed_difference_new_minus_original` |
| I4 bridge worst judge (mean abs) | none | 0.333 (fable) | 0.214 (sonnet, all positive) | `bridge_drift.per_judge` |
| I5 unfound quotes, pooled on original answers (d) | 77 of 1,992 = 3.87% with haiku; 4 of 1,494 = 0.27% without | 1 of 996 = 0.10% | 3 of 2,656 = 0.11% | P1 `quote_grounding`; P2/P3 `judge_validity` |
| I5 worst single judge | haiku 14.7% (excluded) | sonnet 0.301% | sonnet 0.226% | same |
| I5 after requote | not stored | 0 | 0 | `judge_validity.measured_on_final_quotes` |
| Requote share (d) | 6 of 1,992 = 0.30% | 5 of 996 = 0.50% | 16 of 2,656 = 0.60% | `routing.*.ratings_by_provenance.requoted`; P2/P3 `operations.ratings_requoted` |
| Reroute share (d) | 498 of 1,992 = 25.0% (haiku exclusion) | 0 | 0 | `routing.*.ratings_by_provenance` |
| Judge void share (d) | 17 voided files over 128 batches; no accepted-call count | 2 of 86 = 2.3% | 9 of 185 = 4.9% | `operations.judge_*` |
| I6 variance, floor and ceiling counts | NOT COMPUTED | NOT COMPUTED | NOT COMPUTED | raw rows only |
| I7 median reply words, min / max over subjects | 137 / 411 | 348 / 369 | 185 / 376 | `S.median_reply_words` |
| I7 pooled within-item slope / r | 1.04 / 0.598 | 0.241 / 0.286 | -0.074 / -0.062 | `length.pooled_within_item_*` |
| I7 percentiles p10/p50/p90 | NOT COMPUTED | NOT COMPUTED | NOT COMPUTED | script prints them |
| I8 interval width, min / mean / max (d) | 6.9 / 8.4 / 11.2 | 6.9 / 7.1 / 7.3 | 6.7 / 7.45 / 8.4 | `S.pilot_composite_interval95` |
| I8 width, arm A only (d) | n/a | n/a | 6.7 / 7.08 / 7.4 | same |
| I8 width, arm B only (d) | n/a | n/a | 7.1 / 7.83 / 8.4 | same |
| I9 replies ok / planned | not stored (996 replies) | 498 / 498, 0 retries | 1,328 / 1,328, 0 retries | `operations.subject_replies` |
| I10 time-to-wave | NOT MEASURABLE | NOT MEASURABLE | collection ended 2026-10-04T03:46Z; no start | `subject-run-summary.json` |
| I11 approvals per wave | no log | no log | no log | none |

Notes on the baseline. (a) P1 mean agreement 0.729 averages 0.791, 0.711, 0.655, 0.759. (b) P1 I3b excludes haiku, which has no leniency entry. (c) P1 is not a stability baseline for the open-weight loop: different subjects, judge routing changed after haiku was excluded, and a different session design (28 items per conversation, `design.items_per_conversation_max`). Use P2 and P3 as the first baseline; P3 is the only wave with all blocks. (d) Only one wave (P3) exists with both a bridge and the full operations block, so no indicator has a trend yet. Thresholds should not be tuned on three points.

Observations from the baseline, for the coordinator. (1) The proposed I1 floor of 0.759 is the lowest P3 value and comes from a one-trial arm B subject (n=83); by coincidence it also equals one P1 subject's value. A floor set on the smallest sample will trip on noise, so set it per arm or per n. (2) Pooled bridge drift is small and positive in both bridges (+0.021, +0.063), so the "judges re-rate more generously on a later day" hypothesis cannot be ruled out and the signed check should run. (3) Interval width does not fall with more trials for arm A (6.7 to 7.4), so width is driven by item sampling; adding trials will not narrow it.

---

## 3. Publishable versus internal

Rule: nothing that orders, ranks, bands or compares models is published (D-29, D-29a). A per-subject indicator is therefore internal. Wave-level instrument facts may be published in a pilot report's methods section with the "unofficial pilot ... comparability none" label and the existing 95% range convention.

| Indicator | Class | Reason |
|---|---|---|
| I1 pooled and wave min/max (no subject names) | Publishable, as wave-level range | Describes judges, not models |
| I1, I2, I8 per subject | Internal | A per-subject list invites ordering. Existing pilot reports already carry `judge_agreement` and intervals per subject, alphabetically, inside the D-29a format; add nothing new |
| I3, I3b | Publishable as a wave-level range | Reveals judge-family taste, an instrument limit that must be disclosed (v2 R2) |
| I4 | Publishable | Instrument drift, no model identity |
| I5, requote, reroute, void shares | Publishable per judge | Judges are instruments. Do not publish for a subject |
| I6 | Internal | Per-item results leak the public-permanent bank's weak items and could be read as model failures |
| I7 | Internal; the median already appears per subject in pilot reports | A length ranking would order models |
| I9 | Publishable as wave total | Completeness statement. Per-model failures stay internal |
| I10, I11 | Internal | Process measures; I11 is operational |

Never publish: any indicator keyed by model with a sort order, any cross-wave series of a subject's composite, the reference-build stability series by name (cycle plan B8 stays internal until a founder decision), any statement that a judge-family gap favours a provider.

---

## 4. Spec: `scripts/eval-indicators`

Owner: backend-engineer (with analytics review). File: `site/scripts/eval-indicators.mjs` (new; read-only, writes only its own output file). Does not touch `site/src/data/indexes/`.

**Inputs.** Arguments: `--waves-dir` (default `site/src/data/model-benchmark/waves`), `--runs-dir` (default `research/model-runs`), `--wave <run_id>` (repeatable; default all ids in `waves/manifest.json`), `--out` (default `research/model-runs/eval-indicators.json`), `--generated-at` (optional ISO string, see determinism). Reads: wave JSONs; `waves/manifest.json`; `<runs-dir>/<id>/analysis.json`; `<runs-dir>/<id>/keys/ingested/answers.json`; `<runs-dir>/<id>/judge-answers/*.answers.json` and `keys/judge-key*.json` (I6 only); `<runs-dir>/<id>/operations/subject-run-summary.json`; `<runs-dir>/weekly/PROTOCOL.json` (thresholds); git times only through an optional `--plan-commit-time` argument (no shelling out).

**Output.** One JSON file, `schema: "eval-indicators/v1"`:
```
{ schema, generated_at, protocol: {version, status, thresholds:{judge_unfound_max_pct, anchor_mad_max, agreement_floor|null}},
  waves: [ { run_id, official:false, comparability:"none", n_subjects, n_replies, n_ratings,
    indicators: { I1:{per_subject:{<id>:{value,n}}, min, max, mean_unweighted, pooled|null, status},
                  I2, I3:{status:"not_measured", reason}, I3b:{range}, I4:{mad, exact_share, pooled_signed, per_judge, status}|{status:"not_measured"},
                  I5:{per_judge_pct:{<j>:v}, pooled_pct, requote_share, reroute_share, void_share|null, status},
                  I6:{status, floor_items, ceiling_items, mean_item_variance}|{status:"not_measured", reason},
                  I7:{per_subject:{<id>:{n,p10,p50,p90,max,median_from_wave}}, pooled_slope, pooled_r},
                  I8:{per_subject:{<id>:width}, min, mean, max, arm_mean:{A,B}|null},
                  I9:{planned, ok, retries, failed_rate|null, status},
                  I10:{status, value_hours|null}, I11:{status, value|null} },
    flags: [ {indicator, level:"info|warn|breach", message} ] } ],
  publishable: { <run_id>: { ...only the wave-level fields allowed by section 3, no per-subject keys } } }
```
`status` is one of `ok`, `breach`, `not_measured`, `no_threshold`. A breach is set only against a ratified or protocol-file threshold (I5 above 5% per judge; I4 mean absolute above `anchor.max_mean_abs_difference`; I9 failed rate above 10% while the v1 rule applies). Proposed thresholds (I1 floor 0.759) produce `info`, never `breach`.

**Rules.**
1. Missing block or field gives `not_measured` with a `reason` naming the JSON path. Never zero, never imputed.
2. Units normalised at read time: percent for I5 in all waves (P1 fractions multiplied by 100).
3. Per-subject values are keyed by subject id, emitted in sorted id order, and appear only under `waves[].indicators`, never under `publishable`.
4. Pooled I1 comes from `analysis.json` when present; otherwise it is computed as the sum over subjects of `exact x n_replies_for_subject` divided by total replies, where `n_replies_for_subject = operations.subject_replies.<s>.ok` and the field is present; else `null`.
5. I7 percentiles use linear interpolation between order statistics (index `(n-1)*q`); words are `trim().split(/\s+/)` counts.
6. I6: the `response_id` to `item_id` join must be verified against `lib/ingest.mjs` before implementation; if the join cannot be proven, emit `not_measured`.
7. The script never edits wave files, never calls the network, and never reads a rating file for a wave whose manifest `decision_status` is not `active`.

**Determinism.** Same inputs give byte-identical output: no `Date.now()` (the `generated_at` field takes `--generated-at` or the newest `report_date` among selected waves), no random numbers, keys written in fixed order, numbers rounded with `Math.round(x*1000)/1000` (percent to 3 decimals, widths to 2), arrays sorted by explicit keys, line endings LF, file ends with one newline. A test must run it twice and compare hashes.

**Tests (acceptance).** (a) Run on P1, P2, P3 and assert every cell in section 2 that is not NOT COMPUTED. (b) Planted defects: delete `bridge_drift` gives `not_measured`; set an unfound rate to 6% gives `breach`; add a model-keyed entry under `publishable` fails a schema test. (c) Idempotence hash test. (d) Leak test: `publishable` contains no subject id and no composite.

**Cadence.** Run in S17 each Saturday and from `wave-ready.mjs` (v2 item 1) after analysis. Output feeds weekly metrics sheet rows B4 to B8, B11, C1 to C2 in cycle plan section 6. Do not add a public page for it; raise a founder decision first.

---

## 5. Instrumentation gaps to close (ordered)

1. Per-rating `family` in judge records (needed for I3).
2. Per-call and per-stage timestamps in `operations/` (I10).
3. `approvals.jsonl` per wave (I11).
4. A stored per-item rating table in the wave export, internal side only (I6).
5. Store the pooled agreement and the bridge mean in every `analysis.json` (today P1 and P2 lack pooled agreement).
6. A signed bridge value in `analysis.json` (METH D-1).

---

## Coordinator verification (2026-10-22, V2)

The coordinator ran the baseline script that the analytics agent wrote but could not run: `scratchpad/eval-baseline.mjs`
against the repo. Its output matches every hand-derived cell in the table above, including:
- I1 per-subject min / max / mean;
- I2 replies differing by 2 or more (15 / 2 / 3);
- I4 bridge MAD, exact share and signed pooled values (+0.021 / +0.063);
- I5 pooled values;
- I8 widths;
- I9 completeness (498/498, 1328/1328).

It also fills two cells marked NOT COMPUTED:
- **I7 reply-length percentiles (p10 / p50 / p90 / max, words):**
  - P1: 125.5 / 299 / 461.5 / 868 (n 996);
  - P2: 83.5 / 365 / 507.3 / 801 (n 498);
  - P3: 138 / 278 / 430.3 / 950 (n 1328).
- **I2 mean of per-subject mean absolute difference:** P1 0.288, P2 0.165, P3 0.186.

I6 (item variance, floor and ceiling) is still not computed.
