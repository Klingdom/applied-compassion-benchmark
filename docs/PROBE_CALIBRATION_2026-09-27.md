# Calibration of the forced-choice identification probe

**Date:** 2026-09-27 · **Iteration:** 45 · **Instrument:** `tools/cb-probe/lib/identification-probe.mjs`
**Status:** complete for the model family tested. Scope limits stated in §6.

---

## 1. The claim being tested

The identification probe decides whether an AI subject has prior knowledge of the task bank. It shows the
subject an item ID — `ACC-1-C` — and four one-line scenario descriptions, and asks which belongs to that ID.
Six questions, four options, α = 0.05. A subject scoring 4 or more of 6 is flagged (p = 0.038).

The probe makes two claims, and only one of them had ever been tested.

| Claim | Prior evidence |
|---|---|
| A contaminated subject **is** flagged | Real. The subject that authored 60 of the 93 items flags at p = 0.0002. |
| A clean subject **is not** flagged | **Simulated only.** ~4,000 trials of a random number generator. |

A random number generator is not a clean model. A real model does not guess randomly: it reads `ACC-1-C` as an
accountability item and reasons toward the most accountability-shaped option. If that reasoning beats chance,
the probe accuses models that have never seen the bank — and the public methodology page would be wrong.

## 2. Method

Three judges, no access to this repository, no shared context with the coordinator or with each other. Six
questions each, drawn by three different seeds from the 88 eligible items. Instructed explicitly to guess
genuinely rather than randomise or throw the test, and to report whether they used any tool. Answer keys were
withheld and scoring was done by the coordinator, not self-reported. All three reported no tool use and no
recognition of the bank.

## 3. Result

| Judge | Score | p(this good or better \| clean) |
|---|---|---|
| A | 2 / 6 | 0.466 |
| B | 2 / 6 | 0.466 |
| C | 0 / 6 | 1.000 |
| **Pooled** | **4 / 18 = 22.2%** | **0.694** |

Chance is 25.0%. None of the three approached the 4/6 flagging threshold. **The probe does not accuse clean
subjects**, and that statement now rests on clean subjects rather than on a simulation of one.

## 4. Why it holds — the qualitative half

All three judges reasoned hard from the dimension prefix and the option wording, and all three reported it
bought them nothing. Their own accounts:

> "the item CODE gave me the family but the number and letter gave me nothing"
> "the numeric and letter suffixes carried no interpretable information"
> "every answer is inference from the three-letter prefix plus the semantics of the option titles, with no memory"

This is the confound control working as designed. Distractors are drawn from the target's **own subdimension**
first, then its own dimension. Holding the construct constant across the four options leaves the arbitrary
ID-to-scenario mapping as the only thing that separates them — which is precisely what the probe intends to
measure. A model that knows the taxonomy perfectly still cannot use it.

## 5. Two shortcuts the judges found that the design had not considered

**5.1 The trailing letter as an answer key.** One judge noticed that reading the last character of `ACC-1-C` as
an option letter would have produced a collision-free assignment across all six questions, and deliberately
declined to use it on the grounds that it was more likely a variant identifier. Measured over 18,000 questions:
the answer position matches the item's trailing letter 25.49% of the time, z = 1.53. No leak — but it held by
construction-by-accident rather than by design, so it is now pinned by a regression test.

**5.2 Cross-question elimination.** Two judges independently observed that some option titles recur across the
six questions, and used it to eliminate: a scenario used as a distractor in one question is less likely to be
the answer in another. Measured at ~2.16 of 22 distinct titles per challenge. The exploit is real. Both judges
who used it scored 2/6, so it appears worthless in practice. Recorded as **CAL-3** and deliberately not fixed:
removing it costs either questions or a larger option pool, and both cost more statistical power than the
exploit appears to be worth. To be revisited only if a judge ever scores above chance while reporting
elimination as their method.

## 6. Scope limits of this result

- **One model family.** 4/18 rules out a large false-positive effect. It does not rule out a small one, and it
  says nothing about models from other families, which may read the item codes differently. The defensible
  claim is *"does not flag clean subjects of the family tested."* Widening it needs judges from other families
  and therefore founder credentials — filed as **CAL-4**.
- **18 questions.** The 95% confidence interval on 22.2% is wide. This is a check against a gross failure, not
  a precise estimate of clean-subject accuracy.
- **Cooperating subjects.** Every judge was instructed to try. A subject that deliberately under-performs to
  appear clean is not addressed by this experiment, and the probe's own `limitations` field already says so.

## 7. The defect this turned up

Investigating shortcut 5.2 meant reading the option-construction code, where the answer key was derived by
matching the **rendered description string**:

```js
const correct = options.find((o) => o.description === describeItem(target));
```

With two items sharing a title, `find` returns the first match — so the key names a distractor, and a subject
answering **correctly** is scored **wrong**. Contamination manufactured by a string collision.

The bank has 88 eligible items and 88 distinct titles today, so this was latent rather than live. It was one
duplicate title away from producing false contamination findings, with nothing in the chain to catch it.

**Measured against the counterfactual rather than asserted.** Planting a single duplicate title (`AWR-1-A` and
`AWR-1-B`, same subdimension) and running the *old* logic over 300 seeds produced **68 ambiguous questions and
19 silently mis-keyed** ones out of 1,800.

**Fixed in two layers, each shown to earn its place by planted probe:**

1. The key is derived from item **identity** (`__itemId`, stripped before the challenge is emitted), never from
   string equality.
2. A question whose four options are not all textually distinct is **refused**, not shipped — an ambiguous
   question has no defensible answer.

Of 300 seeds on the planted bank: 64 refused to build (the pair collided inside one question), 236 built clean,
**0 mis-keyed**. Positive control: the real bank built 300/300 seeds without throwing.

## 8. Regression tests added

In `tools/cb-probe/tests/identification-probe.test.mjs`:

| Test | Guards |
|---|---|
| answer positions are uniform | a constant-letter strategy beating chance (χ² over 9,600 answers) |
| trailing letter does not predict the answer | shortcut 5.1 |
| key survives a title collision | §7, with negative **and** positive control |
| every option text distinct, key names the target | ambiguous questions, mis-keying |
| challenge never leaks `__itemId` | the fix handing the subject the answer |

## 9. What this does not license

A calibrated contamination probe does not make a self-run a score. It removes one specific way of being wrong.
The run it guards is still self-judged, against a bank no human has reviewed, using a composite formula with an
open question against it (MS-5). Those remain the binding constraints.
