# CB-MODEL — Validation Ledger

Single-authority file. The record of whether the benchmark measures what it claims to measure.

> ## EMPTY — NO VALIDATION STUDY HAS BEEN RUN
>
> **0 validity studies. 0 reliability statistics. 0 bridge studies. 0 replications.**
>
> Nothing has been executed and nothing has been rated, so no reliability coefficient, no
> correlation and no discriminant test exists. `05-HUMAN-RATING`: *"Do not conceal weak
> reliability."* There is no reliability to conceal or report — there is none.
>
> **A validity claim in this file that is not backed by a completed study is exactly the kind of
> claim `HUMAN-AUTHORITY-BOUNDARY.md` forbids**: *"Representing a draft as peer reviewed, validated,
> certified, legally compliant, or independently audited."*

**Last updated:** 2026-09-07 — added the product-separation guard row below. This is a mechanical
data-integrity/naming check, not a validity study (it does not belong to the schema in the next
section, which is reserved for `content`/`structural`/`convergent`/etc. validity studies against
model behaviour data — there is no model behaviour data yet). Recorded here anyway because it is
the closest existing home for "did we mechanically check that the instrument's structure holds."

---

## Mechanical structural checks (not validity studies — see note above)

| Check | Tool | First-run result (2026-09-07) | Severity |
|---|---|---|---|
| Product-separation guard | `site/scripts/validate-product-separation.mjs` | **FAIL** — 8 blocking findings, 10 warnings against live `site/src/data/indexes/*.json` | See `DECISIONS.md` D-23 for the full finding list |

---

## Schema this file will hold

Per `06-ANALYSIS-AND-VALIDATION` §"validation program".

| Field | Notes |
|---|---|
| `study_id` | immutable |
| `validity_type` | `content` \| `structural` \| `convergent` \| `discriminant` \| `criterion` \| `known_groups` \| `reliability` \| `fairness` \| `sensitivity_to_change` \| `adversarial` |
| `question` | the specific falsifiable question |
| `design` | sample, comparators, pre-registered analysis plan |
| `frozen_inputs_hash` | analysis runs from version-controlled code against hashed inputs |
| `result` | |
| `uncertainty` | 95% bootstrap CI where applicable |
| `limitations` | required, never empty |
| `conclusion_class` | `supported` \| `not_supported` \| `inconclusive`. **`inconclusive` is a legitimate and expected outcome.** |
| `reviewed_by` | Methods Committee where the finding affects constructs or scoring (`BLK-006`) |
| `date` | |

## The discriminant tests that matter most — named now, before there is data to flatter

`06-ANALYSIS` states the requirement precisely: *"Specifically test whether the benchmark is
measuring compassion rather than verbosity, politeness, general intelligence, harmlessness, or brand
preference."*

Written down at scaffold time deliberately. If these are only designed after the first results
arrive, they will be designed to pass.

| Study | Question | Why it is a live risk for *this* instrument |
|---|---|---|
| VAL-D-01 (planned) | Does composite correlate with **response length**? | Several of the 33 rubrics reward naming specifics (`AWR-1-A` level 5: "names specific dimensions"; `ACT-1-B` level 5: names four Dallas shelters). Longer answers may score higher by construction. `05-HUMAN-RATING` requires raters to distinguish warmth from verbosity — but the rubric text must not require length to earn a 5. |
| VAL-D-02 (planned) | Does composite correlate with **general capability** on unrelated benchmarks? | If it does, the instrument measures capability, not compassion. |
| VAL-D-03 (planned) | Does composite correlate with **politeness / affective tone** independent of usefulness? | `05`: *"Never reward hollow empathy that fails to help or prevent harm."* |
| VAL-D-04 (planned) | Does composite correlate with **refusal rate**? | `BND-1-A` (over-refusal) and `BND-1-B` (harm refusal) pull in opposite directions by design — this is the instrument's own test of that, and it should be checked. |
| VAL-D-05 (planned) | Does composite correlate with **brand preference** or rater-guessed provider identity? | Requires blinding to be verified, not assumed. |
| VAL-R-01 (planned) | Test–retest stability of the same snapshot across runs | **Priority.** `DECISIONS.md` D-07: two runs of the repo's *existing* pipeline assessed ADP three days apart at 58.1 and 60.6, landing on opposite sides of a band boundary. Kazakhstan swung 24.4 → 13.7 in four days. This instrument has a demonstrated stability problem in its institutional form and no reason to assume its model form will be better. |
| VAL-C-01 (planned) | Content validity: does item coverage match the construct? | **Currently fails on its face.** Item counts per dimension are AWR 6, EMP 5, ACT 5, INT 5, ACC 4, EQU 3, BND 3, **SYS 2**. `06` requires dimension estimates "balanced across task families". |
| VAL-A-01 (planned) | Saturation and memorisation of the public pool | All 33 items and all 165 rubric anchors are published on `/ai-evaluation-suite`, permanently, with the answer key. Any model trained after that page went live may have seen them. **This is the single strongest argument for the secure pool.** |

## Invariants

1. **Freeze the execution and rating datasets before unblinding model identity** (`06`).
2. **Never compare incompatible major benchmark versions without a bridge study** (`06`).
3. **Never add decimals that exceed measurement precision** (`06`). With no CI computed, the current
   institution indexes' one-decimal composites already imply precision that has never been
   demonstrated — a pre-existing issue CB-MODEL must not inherit.
4. **Report reliability whatever it says.** If thresholds fail, diagnose ambiguous anchors, poor
   training, invalid items or rater drift, and rerate only under a documented corrective protocol
   (`05`).

## Studies

*(empty)*

| study_id | validity_type | question | result | conclusion | date |
|---|---|---|---|---|---|
| — | — | — | — | — | — |

**0 rows.**
