# Seed Placeholder Inventory — 2026-08-20

Current exposure across all eight published indexes, and a priority order grounded in what
the seven completed de-seeding studies actually measured.

**Method:** an entity is counted as seeded if its 8-dimension vector is byte-identical to at
least two others in the same index. Entities carrying a **pending proposal** are counted as
*already assessed* — they have been measured, and await founder approval, not research.

---

## Headline

| | Count |
|---|---:|
| Entities in identical-vector clusters | **834** |
| Already assessed (pending proposal) | 75 |
| **Remaining un-assessed** | **759** |

Of 1,289 published entities, roughly **59% still sit on a placeholder**.

**ai-labs and robotics-labs are effectively finished.** ai-labs has 4 remaining (3 of them the
composite-0.0 trio, which is not a seeding question — see §4). robotics-labs has 1. That is the
programme working: two complete indexes in a week.

---

## The empirical rule, from seven studies

| Study | Seed | Mean signed | Mean abs | Direction |
|---|---|---:|---:|---|
| countries 20.3 | 1.81 dim-mean | −1.18 | 7.08 | 7 down, **5 up** |
| ai-labs 35.9/32.8 | 2.44 | −4.13 | 6.47 | 5 down, **2 up** |
| robotics 35.9 (cluster C) | 2.44 | −9.02 | 9.02 | 5 down |
| robotics 48.4 | 2.94 | −21.63 | 21.63 | 6 down |
| ai-labs 60.9/48.4 | 3.19 | −22.73 | 22.73 | 15 down |
| robotics 60.9 | 3.44 | −30.04 | 30.04 | 10 down |
| robotics 62.5 | 3.50 | −35.63 | 35.63 | 3 down |
| robotics 83.0/81.4 | 4.32 | −46.37 | 46.37 | 10 down |

Two findings, both replicated:

1. **Seed error scales with seed height, monotonically.** Where signed and absolute delta
   coincide, the seed was *biased*; where they diverge, it was merely *uninformative*. They
   diverge only at the two lowest seeds.
2. **Seed height sets the magnitude; entity type sets the direction.** A 35.9 seed is a *floor*
   for a state (Papua New Guinea rose +12.8) and a *ceiling* for a small private company
   (robotics cluster C fell −9.02). Do not predict direction from seed value alone.

**Consequence for prioritisation:** low-seed clusters are not urgent on accuracy grounds. High
seeds are wrong in one direction for every member, and the error grows with the value.

---

## Priority order

Ranked by **published claim at risk** — seed height × band-boundary proximity × rank visibility —
not by cluster size.

### Tier 1 — highest published claim on a placeholder

| Index | Seed | Band | Remaining | Ranks | Why |
|---|---:|---|---:|---|---|
| fortune-500 | **92.4** | Exemplary | **4** | **2–5** | The four highest-ranked companies in the flagship index. Highest unearned claim anywhere in the benchmark. Cheapest possible study. |
| countries | **83.0** | Exemplary | **5** | **6–10** | Only **2.0 points** above the Exemplary cutoff. The robotics 83.0 cluster fell −46.37 from this exact value. |
| global-cities | 75.9 | Established | 3 | 18–20 | Top-20 claim, small cluster. |
| countries | 62.5 | Established | 13 | 22–35 | 1.5 above the Established line; 13 countries. |
| fortune-500 | 60.9 | Established | 17 | 35–56 | **0.9 above the boundary** — the tightest margin in the benchmark. Cerebras (−22.1) and Baxter (−5.9) both came from this value. |

**Tier 1 total: 42 entities.** Clearing it removes every remaining Exemplary-band placeholder
and the two tightest Established margins.

### Tier 2 — large mid-band clusters

fortune-500 48.4 (80) · fortune-500 35.9 (115) · us-cities 35.9 (52) · fortune-500 23.4 (38) ·
global-cities 18.8 (29) · fortune-500 25.0 (28) · countries 35.9 (27)

Large but mid-band. Being wrong here misstates a **rank**, not a **label**. Run as one
cross-index study per seed value so a single standard applies.

### Tier 3 — low seeds

Everything at or below ~25. Evidence says these are uninformative rather than biased, so the
expected band-correction rate is low. Prioritise only where within ~7 points of a boundary.

---

## §4 — Not a seeding problem: the composite-0.0 entities

**12 countries, 7 global-cities and 3 ai-labs** (Character AI, Palantir AI, xAI/Grok) sit at
composite 0.0 on a flat 1.0 vector.

Cluster detection cannot distinguish a **deliberate floor designation** from a placeholder, and
these carry documented harm records consistent with intentional flooring. **Re-scoring them as a
de-seeding exercise risks raising entities that were floored on purpose.**

Resolve by **provenance inspection** — why was each set to 0.0 — not re-assessment.

This connects to the 2026-08-20 floor finding: five countries at 0.0 have all 40 subdimensions at
the minimum and are **evidence-insensitive**. Any work here is a scale-expressiveness question,
not a scoring one.

---

## §5 — Band-boundary ambiguity at 60.9

The methodology documents bands as `41–60 Functional`, `61–80 Established`. **60.9 falls in the
undefined gap**, and `computeCompositeFromDimensions` resolves it to Established.

The code's choice is defensible; the documentation is silent. This affects the 17 remaining
fortune-500 entities at 60.9 plus smaller clusters in global-cities, countries and us-cities —
around 30 entities whose published band label rests on an undocumented boundary decision.

Carried as the "Erie Indemnity band-boundary label gap" since 2026-07-30. **Recommend fixing the
boundary table before de-seeding the 60.9 clusters**, so the study is not scored against an
ambiguous target.

---

## §6 — Recommended sequence

1. **Fix the band-boundary table** (§5) — cheap, unblocks Tier 1.
2. **fortune-500 92.4** (4 entities) — highest claim, smallest study.
3. **countries 83.0** (5) — tightest Exemplary margin.
4. **fortune-500 60.9** (17) — tightest boundary, best-evidenced prior.
5. **countries 62.5** (13) + **global-cities 75.9** (3).
6. Provenance inspection of the 0.0 entities (§4) — no re-scoring.
7. Tier 2 by seed value, cross-index, one standard per value.

Every study must carry the anti-confirmation-bias guard. Three of the seven completed studies
produced upward movers, and the 20.3 study broke a 2-for-2 downward pattern outright.
