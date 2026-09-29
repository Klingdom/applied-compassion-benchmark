# MS-5 resolved: the composite formula does not reward a flat profile

**Date:** 2026-09-29 · **Iteration:** 50 · **Backlog item:** MS-5, open since Iteration 38
**Verdict:** the premise is **false**. Three narrower questions remain, each decidable, and they are put to the
founder as **D-45**.

---

## 1. What MS-5 claimed

> "The composite rewards a flat profile twice (consistency multiplier and integration premium both key off low
> variance), which is how the self-run reached exactly 100. A rubric-aware subject outscores a genuinely strong
> but uneven one."

Filed after the first complete self-run scored 100 with a dimension spread of 0.121 points. It has blocked
publishing any model score since, and it is quoted on `/ai-models` as an open methodology question.

## 2. What the formula actually does

```
base      = ((mean(dims) − 1) / 4) × 100
σ         = population stdDev across the 8 dimensions
consistencyMult = σ ≤ 1.5 → 1.0 | ≤ 3.0 → 0.75 | ≤ 5.0 → 0.4 | else 0.1
weakDims  = count(dim < 4.0)
weaknessFactor  = max(0, 1 − 0.2 × weakDims)
premium   = hasHarm ? 0 : 10 × consistencyMult × weaknessFactor
composite = min(100, base + premium)
```

**`consistencyMult` is not a multiplier on the composite.** It appears in exactly one place — inside `premium` —
in both the `.mjs` and `.ts` implementations. So there is **one** variance-sensitive term, not two. The "twice"
in MS-5 does not exist.

## 3. Does variance affect the score at all? Worked examples

| Profile | mean | σ | base | premium | composite |
|---|---|---|---|---|---|
| `[4.5 × 8]` | 4.500 | 0.000 | 87.5 | 10 | **97.5** |
| `[5,5,5,5,4,4,4,4]` | 4.500 | 0.500 | 87.5 | 10 | **97.5** |

Same mean, one perfectly flat and one maximally split — **identical composite.** Spread is irrelevant once every
dimension clears 4.0.

The case that *looks* like a flatness reward is this one:

| Profile | mean | σ | base | premium | composite |
|---|---|---|---|---|---|
| `[4.0 × 8]` | 4.000 | 0.000 | 75.0 | 10 | **85.0** |
| `[5,5,5,5,3,3,3,3]` | 4.000 | 1.000 | 75.0 | 2 | **77.0** |

The flat profile wins by 8 — but not because it is flat. It wins because the spiky one has **four dimensions
below 4.0**, and `weaknessFactor` charges 0.2 for each. What the formula rewards is **clearing the 4.0 threshold
on every dimension**, which is a statement about *level*, not about *evenness*.

This is exactly what `/methodology` already says: *"the premium rewards dimensions that clear the 4.0 threshold,
not evenness by itself."* The published methodology was right; MS-5 was wrong about it.

## 4. Empirical check across all 1,325 published entities

| Finding | Value |
|---|---|
| Maximum σ observed | **0.768** (theoretical max for 8 dims in [0,5] is 2.5) |
| Entities with `consistencyMult` < 1.0 | **0 of 1,325** |
| Entities earning any premium | 78 of 1,325 (**5.9%**) |
| Mean premium across the corpus | **0.44** out of a possible 10 |
| Entities clamped by the 100 cap | 5 |

**The consistency factor is a constant on real data.** Not "only the first two steps occur" — only the *first*
occurs, by a wide margin. The first step-down needs σ > 1.5 and nothing in the corpus reaches half that.

Removing the integration premium entirely would change:

- **15 rank positions out of 1,325** (1.1%), largest single move 4 places
- **28 band assignments** (2.1%)

So the premium is not cosmetic — it moves bands for one entity in fifty — but it is a **top-end differentiator**:
the 78 entities that earn it average composite 84.8, against 35.9 for everyone else.

## 5. What actually produced the self-run's 100

Dimension means were 4.556 / 4.568 / 4.602 / 4.602 / 4.67 / 4.67 / 4.67 / 4.67 → mean **4.626**, base **90.65**,
premium **10**, raw 100.65, clamped to **100**.

The premium mattered; the *flatness* did not. Any profile with the same mean and every dimension ≥ 4.0 reaches
the same 100 — including a maximally split one. The 0.121-point spread was a symptom of the contaminated run, not
the mechanism that produced the score. **MS-5 attributed a real anomaly to the wrong cause.**

## 6. What is genuinely open

Three questions, each decidable, put as **D-45**:

**Q1 — Should `consistencyMult` stay?** It is documented as a four-step function. Two steps are mathematically
unreachable (σ ≤ 2.5), and the third has never fired across 1,325 entities. It is, in practice, the constant 1.0.
Keeping it costs nothing numerically but it is machinery a reader must understand in order to conclude it does
nothing. *Options:* keep and document as dormant; collapse to a two-step function; remove and state that spread
does not affect the composite.

**Q2 — Is the 0.2-per-weak-dimension step the right shape?** It is a cliff: five weak dimensions zero the premium
entirely, so an entity at `[4.125 mean, 5 weak]` scores 78.1 while `[4.5 mean, 0 weak]` scores 97.5. A single
dimension slipping from 4.0 to 3.9 costs **2.3 composite points** — 1.3 of base and 2.0 of premium. That is a
defensible design (it says "excellence must be universal") but it should be a *chosen* cliff, not an emergent one.

**Q3 — Does the 100 cap compress the top?** Only 5 entities clamp today, so this is not urgent. It becomes urgent
the moment model scores are published, because a model scoring ≥ 4.6 mean with no weak dimension is
indistinguishable from any other such model. Worth deciding *before* the first model score, not after.

## 7. Recommendation

**Close MS-5 as founded on a false premise**, and do not let it block model scoring any longer. The formula does
not reward rubric-aware flatness, so a rubric-aware subject gains nothing from evenness — it gains from being
genuinely ≥ 4.0 everywhere, which is what the benchmark means to reward.

The real barriers to publishing a model score are unchanged and elsewhere: no human-validated items, no
unpublished item pool, no cross-model judging, and four rubric defects awaiting repair (D-43, D-44).

## 8. One incidental finding, verified and harmless

`10 × 1.0 × 0.2` evaluates to `1.9999999999999996` in binary floating point, so some premiums are off by ~2e-16.
Checked against exact arithmetic across all 1,325 entities: **0 composites differ, 0 bands differ.** Cosmetic
only. Recorded so the next person who sees it in a debug output does not re-investigate it.
