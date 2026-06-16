# Special Briefing — The Middle of the Scale

**How to Read a Score, Where Almost Every Entity Actually Lives**

- **Edition:** How-to-Read-a-Score (one-off on-ramp; pairs with a planned "Why a Score Doesn't Move")
- **Date:** 2026-06-16
- **Author:** Special-Briefing agent (interpretive synthesis over the canonical record; read-only of index JSONs and the scoring formula)
- **Scope:** All 7 indexes, 1,156 entities. The 783 entities in the Developing band (composite 20–40) and the Functional band (composite 40–60) — the 67.7% the floor and exemplars briefings deliberately skipped.
- **Method note:** This is a structural + comprehension analysis of the *existing* record. It interprets published scores and the canonical composite formula; it does not re-score. Where it surfaces a reading ambiguity, that ambiguity is recorded as a methodology question, not applied.

---

## publicSummary

> **Title:** The Middle of the Scale — What a 50 Actually Means
>
> **Dek:** The benchmark's two foundational briefings spent the extremes: the 23 at the floor and the 64 at the top, together under 9% of the field. But almost every entity a reader looks up — their employer, their city, their country — lives in the vast Developing and Functional middle. This briefing is the on-ramp: what a middling score actually measures, why a balanced 50 and a spiky 50 are not the same thing, and why the "boring" middle is the hardest band to read.
>
> **The cohort:**
> - 1,156 entities assessed across 7 indexes.
> - **783 sit in the middle** — Developing (20–40) or Functional (40–60): **67.7% of the field.**
> - The single most common band is **Developing: 535 entities (46.3%)**. The field median composite is **35.9** — a high-Developing score. The typical assessed institution in the world is Developing, not Functional.
> - Per band: Critical 177 (15.3%) · **Developing 535 (46.3%)** · **Functional 248 (21.5%)** · Established 133 (11.5%) · Exemplary 63 (5.4%).
>
> **Key findings (observer voice):**
> 1. **The middle is the benchmark — the extremes are the exception.** Two-thirds of all assessed entities (783 of 1,156) sit in the Developing or Functional band, and the field median is 35.9. The dramatic floor and ceiling cases are real, but they describe one entity in five. The score a reader is most likely to encounter is a middling one, and it is the least explained.
> 2. **A 50 is not "half compassionate" — it is a profile of partial systems.** A Functional score means, in the benchmark's own words, that "core practices exist and meet a basic bar, with significant gaps remaining." It is the band of *we started, but we cannot prove it worked* — systems that exist on paper or in pilot, without the disaggregated data, independent audit, or sustained-under-pressure evidence that the higher bands require.
> 3. **In the entire middle of the scale, the consistency bonus is switched off.** The composite is `base score + integration premium`. For all 783 mid-band entities, that premium is **0.0** — because the bonus requires strong dimensions, and 778 of the 783 have every one of their eight dimensions scoring below the 4.0 "strong" threshold. In the middle, the composite *is* the plain average of the eight dimensions. The premium that shapes the top of the scale is a top-of-scale mechanic.
> 4. **A balanced 50 and a spiky 50 mean different things — but the middle is almost never spiky.** Because the premium is dead in the middle, two entities with the same dimension average land at nearly the same composite regardless of shape. In practice mid-band profiles are strikingly flat: the "spikiest" entities near 50 still vary by only a quarter-point across all eight dimensions. The middle is where institutions are *uniformly mediocre*, not lopsided.
> 5. **The difference between a 39 and a 41 is a band boundary, not a margin of merit.** Alphabet/Google sits at exactly 40.0 — one-tenth of a point inside Developing. Croatia at 40.6 is Functional; Greece at 39.1 is Developing. These neighbors differ by a rounding step, not by a meaningful gap in conduct. The band label is a useful summary, not a verdict on the last decimal.
> 6. **A Functional score can describe a country being actively attacked.** Ukraine holds at 50.0 while under sustained assault, because the benchmark scores Ukraine's *own* conduct toward its people, not the harm inflicted on it. The middle is full of these contestable, context-heavy judgments — which is exactly why it is harder to read than the extremes.
> 7. **The fastest climb in the record still only reached the middle.** Hungary recovered across multiple cycles to 50.2 — and remains Functional, two full bands below "good." The benchmark does not grade on trajectory or effort; it grades on proven, sustained conduct. Reaching the middle is not the same as being good, and the middle is where most recovery stories stall.

---

## 1. Frame

The Compassion Benchmark has, to date, told its story through the extremes. The foundational briefing examined the 23 entities at the 0.0 floor and the 176 in the Critical band; the exemplars briefing examined the 64 at the top. These are the dramatic cases, and they are genuinely instructive. But together the floor-and-ceiling story covers a minority of the field. The two extreme bands — Critical and Exemplary — account for **240 of 1,156 entities (20.8%)**. The other **79.2%** live between them.

And the bulk of that is the **middle**: the **Developing band (composite 20–40)** and the **Functional band (composite 40–60)** together hold **783 entities — 67.7% of everything the benchmark assesses.** This is where a reader's own employer, city, and country almost certainly sit. It is the highest-traffic, most-searched region of the record, and it is the least explained.

This briefing is the on-ramp — *how to read a score* — and it asks three questions of the existing record:

1. **What does a middling score actually measure** — is a 50 "half compassionate," or something else entirely?
2. **Why is the middle the hardest band to read** — and what mechanic of the composite formula explains it?
3. **When does the difference between two mid-band scores matter, and when is it noise** — a 39 vs. a 41, a balanced 50 vs. a spiky 50?

The central thesis: **a middle score is not a fraction of goodness — it is a portrait of partial systems, and in the middle the composite collapses to the plain average of the eight dimensions because the consistency bonus that shapes the top of the scale is switched off everywhere below it.** Once a reader understands that, the middle stops being "the boring part" and becomes the most legible — and most contestable — region of the benchmark.

---

## 2. The cohort

Recomputed directly from `rankings[]` in each index and reconciled against the canonical composite formula (`scoring.mjs::computeCompositeFromDimensions`). Mid-band = Developing (composite > 20 and ≤ 40) + Functional (composite > 40 and ≤ 60).

| Index | Total | Developing | Functional | Mid total | Mid % | Median composite |
|-------|------:|-----------:|-----------:|----------:|------:|-----------------:|
| countries | 193 | 79 | 29 | 108 | 56.0% | 35.9 |
| fortune-500 | 448 | 215 | 117 | 332 | 74.1% | 35.9 |
| global-cities | 250 | 105 | 36 | 141 | 56.4% | 31.3 |
| ai-labs | 50 | 18 | 15 | 33 | 66.0% | 46.9 |
| robotics-labs | 50 | 10 | 10 | 20 | 40.0% | 60.9 |
| us-states | 21 | 9 | 0 | 9 | 42.9% | 25.0 |
| us-cities | 144 | 99 | 41 | 140 | 97.2% | 35.9 |
| **Total** | **1,156** | **535** | **248** | **783** | **67.7%** | **35.9 (field)** |

**The single most important framing fact:** the modal band is **Developing**, not Functional. 535 entities (46.3%) are Developing — nearly half the entire field — and the field-wide median composite is **35.9**, a *high-Developing* score. The intuition that institutions average out somewhere around "Functional / 50" is wrong by a full band. The center of gravity of the assessed world sits at roughly 36.

Two structural notes on the cohort, both load-bearing for §3–§4:

- **The middle is heavily quantized.** The mid-band composites are not smoothly distributed: **219 entities sit at exactly 35.9** and **127 at exactly 48.4** — the two most common values in the entire middle. These correspond to near-uniform dimension profiles (all dimensions near 2.5 → 35.9; all near 3.0 → 48.4). Only 54 distinct composite values cover all 783 mid-band entities. The middle is a set of plateaus, not a gradient.
- **us-cities is almost entirely mid-band (97.2%).** US cities are scored on a domestic-service basis that rarely reaches either extreme; they are the purest expression of the "uniformly middling" pattern. By contrast, robotics-labs is the *least* mid-band index (40.0%) — its scores bunch at the harm-frontier extremes instead (the subject of a separate candidate briefing).

---

## 3. What a 50 actually means — the band vocabulary

The benchmark's five bands are defined once, canonically, in `dimensions.ts` (`BANDS` / `BAND_DESCS`). Read in order, they describe an *evidentiary* ladder — not a moral percentage:

| Band | Range | Canonical one-line definition |
|------|-------|-------------------------------|
| Critical | 0–20 | "Foundational compassion practices are absent or documented active harm is present." |
| **Developing** | **20–40** | **"Some practices are emerging but remain inconsistent, reactive, or unevenly applied."** |
| **Functional** | **40–60** | **"Core practices exist and meet a basic bar, with significant gaps remaining."** |
| Established | 60–80 | "Practices are systematic, documented, and supported by consistent evidence." |
| Exemplary | 80–100 | "Practices are independently verified, consistent, and sustained under pressure." |

Three things follow that a newcomer almost always gets wrong:

**(a) A 50 is not "half compassionate."** The scale is not a percentage of goodness. A Functional 50 means the institution has *core practices that exist and meet a basic bar* — and that those practices have *significant gaps*. The defining feature of the middle is not "half-effort" but **partial systems**: a process that exists on paper but is not consistently applied (Developing), or one that genuinely operates but lacks the disaggregated data, independent audit, or under-pressure track record the higher bands demand (Functional).

**(b) The middle is the band of "we started, but we can't prove it worked."** Look at what *moves* an entity from the middle to Established. Across the subdimension anchors in `dimensions.ts`, the jump from the mid-tier anchor (level 3) to the Established anchor (level 4) is almost always a jump from *existence* to *evidence*: from "some proactive mechanisms, inconsistent" to "multiple channels, formal pathways, regular review" (Suffering Detection); from "≥1 report disclosing an unflattering finding" to "annual report includes failures, gaps, corrective actions" (Transparency). The middle is where systems exist but the *proof of efficacy* is thin. That is the single most useful sentence a reader can carry away: **a middle score means the systems are present and the evidence is not.**

**(c) Developing and Functional differ by consistency, not by intent.** Developing is "emerging but inconsistent, reactive, unevenly applied." Functional is "core practices meet a basic bar." The boundary between them — the 40-point line — marks the transition from *ad-hoc and reactive* to *reliably meeting a floor*. A high-Developing entity has good practices that fire unevenly; a low-Functional entity has adequate practices that fire reliably. That distinction is real, but it is a distinction of *reliability*, and at the boundary it is fine-grained (see §5).

---

## 4. Why the middle is the hardest band to read — the dead premium

This is the mechanical heart of the briefing, and the most under-taught fact in the entire benchmark.

The canonical composite is two terms added together:

> **composite = baseComposite + integrationPremium**

where `baseComposite = ((mean_of_8_dimensions − 1) / 4) × 100` — the plain, rescaled average of the eight dimension scores — and the **integration premium** is a *bonus of up to +10 points* for an entity whose dimensions are both **strong** and **even**. The premium is `10 × consistencyMult × weaknessFactor`, where:

- `consistencyMult` rewards low variance across the eight dimensions, and
- `weaknessFactor = max(0, 1 − weakDims × 0.2)`, where `weakDims` is the count of dimensions scoring **below 4.0**.

That `weaknessFactor` is the key. It hits **zero the moment an entity has five or more dimensions below 4.0**:

| Dimensions below 4.0 | weaknessFactor | Max possible premium |
|---------------------:|---------------:|---------------------:|
| 0 | 1.0 | +10.0 |
| 1 | 0.8 | +8.0 |
| 2 | 0.6 | +6.0 |
| 3 | 0.4 | +4.0 |
| 4 | 0.2 | +2.0 |
| **5 or more** | **0.0** | **0.0** |

Now the decisive empirical fact, recomputed across the cohort: **of the 783 mid-band entities, the integration premium is 0.0 for all 783 — every single one.** The reason is direct: **778 of the 783 have all eight dimensions scoring below 4.0** (weakDims = 8, weaknessFactor = 0), and the remaining five have six or seven weak dimensions (weaknessFactor still 0). A dimension at 4.0+ is the benchmark's threshold for *systematic, evidenced, "Established"-grade* performance — and a mid-band entity, by definition, does not have that on any dimension.

The consequence is the single most important reading rule for the middle:

> **In the Developing and Functional bands, the composite is exactly the rescaled average of the eight dimensions. The integration premium — the bonus that shapes the top of the scale — is switched off everywhere below ~60.**

This is why the middle is the hardest band to read. At the *top*, the premium does real work: a balanced 70/70/70 profile beats a spiky 90/40 one, and the composite encodes *consistency* as well as level. A reader at the top must reason about shape. In the *middle*, there is no premium to reason about — the composite is the mean, full stop — and so the only information in the number is the *average level* of partial systems. The number is simpler, but it is also flatter and less discriminating: a 35.9 tells you "uniformly Developing," and almost nothing about which dimensions are the problem. To read a mid-band entity at all, you must look *past the composite to the dimension profile* — which is precisely the move newcomers don't make.

A worked illustration of the formula behavior makes the asymmetry concrete:

| Uniform profile (all 8 dims) | baseComposite | premium | composite | band |
|------------------------------|--------------:|--------:|----------:|------|
| 2.5 | 37.5 | 0.0 | 37.5 | Developing |
| 3.0 | 50.0 | 0.0 | 50.0 | Functional |
| 3.5 | 62.5 | 0.0* | 62.5 | Established |
| 4.0 | 75.0 | **+10.0** | 85.0 | Exemplary |

*At 3.5 uniform, all dimensions are still below 4.0, so the premium remains 0 — the premium only ignites once dimensions cross the 4.0 "strong" line, which is why it is effectively an Established-and-above mechanic. The jump from a uniform 3.5 to a uniform 4.0 moves the composite by **22.5 points** (12.5 of base + 10 of newly-unlocked premium): the entire architecture of the scale rewards crossing into *evidenced* performance, and the middle is everything before that crossing.

---

## 5. Balanced vs. spiky, and the band-boundary question

Two practical reading questions follow from the dead premium.

**(a) Does a balanced 50 differ from a spiky 50?** In principle, yes — but the mechanic that would distinguish them is mostly inert in the middle, and in the *record* the middle is almost never spiky. Examine every entity sitting at composite 49–51:

- The **flattest** — Omnicom Group, 1X Technologies, Together AI — are perfectly uniform (`3/3/3/3/3/3/3/3`, standard deviation 0.0).
- The **"spikiest"** near 50 — Kyiv, Schunk, SoftBank Robotics, Ståubli Robotics — vary by only a **quarter-point** across all eight dimensions (standard deviation 0.25), almost always a single Equity dimension pulled down to 2.5 against an otherwise-flat 3.0.

There is no genuinely lopsided entity in the middle of the scale. The middle is where institutions are *uniformly mediocre* — adequate-ish across the board — rather than excellent-on-some-and-failing-on-others. (Genuine spikiness, where the premium would do real work, is a feature of the *top* of the scale.) The one subtlety worth flagging: because the premium can flicker positive once an entity gets four or fewer weak dimensions, a profile that pushes several dimensions to 4.0+ while leaving others low can actually *outscore* a flat profile of the same mean — but no current mid-band entity is shaped that way, which is itself a finding about how institutions improve (broadly, not in spikes).

**(b) Is the difference between a 39 and a 41 meaningful?** This is the band-boundary question, and the honest answer is: *the band label flips, but the conduct barely differs.* Twenty entities sit within two points of the Developing/Functional line (38–42). At the line itself:

| Entity | Composite | Band | Note |
|--------|----------:|------|------|
| Greece (country) | 39.1 | Developing | one rounding step below the line |
| **Alphabet/Google** (F500) | **40.0** | **Developing** | exactly one-tenth inside Developing |
| Croatia (country) | 40.6 | Functional | one rounding step above the line |
| General Motors (F500) | 40.6 | Functional | — |

Alphabet/Google at exactly 40.0 is the cleanest case: a tenth of a point higher and the public-facing band label would read "Functional" instead of "Developing." The dimension profiles of Greece (39.1) and Croatia (40.6) are near-identical bundles of low-3s and high-2s. **The band is a useful summary; the last decimal is not a verdict.** A reader should treat a band as a bucket of conduct that looks broadly alike, and should never read a 1–2 point gap across the boundary as a meaningful difference in compassion. (This is the within-band analog of the cross-type incommensurability the floor briefing raised: the number can be more precise than the judgment it represents.)

---

## 6. The middle's marquee cases — and why they are contestable

The extremes are dramatic but simple; the middle is undramatic but *contestable*, and that is what makes it interesting. Three marquee mid-band cases, all verified from the index JSONs, show the kinds of judgment the middle is full of:

| Entity | Composite | Band | Profile (AWR/EMP/ACT/EQU/BND/ACC/SYS/INT) |
|--------|----------:|------|-------------------------------------------|
| Ukraine (country) | 50.0 | Functional | 3 / 3 / 3.5 / 2.5 / 3 / 3 / 3 / 3 |
| Hungary (country) | 50.2 | Functional | 3 / 2.9 / 3 / 2.7 / 3.1 / 3.1 / 3.1 / 3.15 |
| Microsoft (F500) | 65.3 | Established | 4 / 3.2 / 3.9 / 3.2 / 3.8 / 3.8 / 4 / 3 |

- **Ukraine, 50.0, Functional — under active attack.** Ukraine holds a Functional score *while being attacked*, because the benchmark scores Ukraine's own conduct toward its people, not the harm inflicted on it by an external aggressor. The June 14–15 daily record confirms the hold: a June 2 Russian mass strike killing 22+ civilians is documented, but the delta is 0 — "no structural change to state compassion infrastructure in-window." The naive read ("a country at war must be near the floor") is exactly wrong, and the middle is where that attribution logic is most visible.
- **Hungary, 50.2, Functional — the recovery that stalled in the middle.** Hungary's tracked history climbs across cycles (from the low-40s in mid-May to 50.2) on documented improvement — and it is *still* Functional, two bands below "good." The benchmark does not grade on trajectory or effort; it grades on proven, sustained conduct, and the fastest climbs in the record top out in the middle. (Hungary's profile is also the textbook flat mid-band shape: every dimension within a third of a point of 3.0.)
- **Microsoft, 65.3, Established — but with a dead premium.** Just *above* the middle, Microsoft is the cusp case that proves the §4 rule. Its premium is **0.0** — six of its eight dimensions are still below 4.0 (EMP 3.2, EQU 3.2, INT 3.0 among them) — so even an Established score here is *pure base*, carried entirely by two dimensions reaching 4.0 (AWR, SYS) lifting the average. Microsoft shows that the premium does not switch on the instant you leave the middle; it stays off until an entity assembles *several* evidenced dimensions, not just one or two.

The throughline: every mid-band score is a *judgment about partial systems under specific context*, and the context (a war, a recovery, a single strong dimension) is doing as much work as the number. That is why the middle is harder to read than the floor — and why reading it well means reading the profile, not the composite.

---

## 7. Methodology flags (for human review — NOT auto-applied)

These are the reading ambiguities the middle-of-the-scale analysis exposes. They are recorded here for human decision and are **not** applied, and — because this briefing is an unpublished draft — they are **not** appended to `research/PENDING_CHANGES.md`; they will be filed into the review queue only if and when this draft is approved for publication. Numbering continues the existing SBQ series (max SBQ-19) for traceability.

- **SBQ-20 — Should the band-boundary precision be communicated as a tolerance?** Alphabet/Google at exactly 40.0 (Developing) and Croatia at 40.6 (Functional) differ by a rounding step, not by a meaningful difference in conduct, yet they carry different public band labels. Consider publishing a stated "boundary tolerance" note (e.g., entities within ±1.0 of a band line are functionally equivalent) so readers do not over-read a label flip. Decision needed on whether to surface this on entity pages or only in the methodology.
- **SBQ-21 — Is the integration premium effectively a top-of-scale-only mechanic, and should that be stated?** The premium is 0.0 for 100% of the 783 mid-band entities (and only ignites once dimensions cross 4.0, i.e. into Established-and-above territory). This means the "consistency is rewarded" framing in `INTEGRATION_PREMIUM.short` describes a mechanic that does nothing for two-thirds of the field. Consider documenting explicitly that, below ~60, the composite is the plain dimension average — so readers of mid-band scores know to read the profile, not look for a hidden consistency signal. This is a comprehension/transparency question, not a formula change.
- **SBQ-22 — Should the mid-band quantization clusters be flagged for re-baselining?** 219 mid-band entities sit at exactly 35.9 and 127 at exactly 48.4, on near-uniform dimension profiles. As in the floor briefing's F500 quantization finding (SBQ-5/Q5), these uniform-anchor values are consistent with placeholder first-baseline profiles rather than independently measured ones. Flag the largest clusters for first-baseline re-assessment; this is a data-quality question, not an interpretive one.
- **SBQ-23 — Does "Developing" as the modal band warrant a public framing note?** The single most common band is Developing (46.3%) and the field median is 35.9 — i.e., the *typical* assessed institution is Developing, not Functional. Readers anchoring on "50 = average" are off by a full band. Consider a one-line public framing ("the median assessed institution scores ~36 — Developing") so the middle is read against the true center of gravity rather than the scale midpoint.

---

## 8. Forward view — what to watch

- **The Developing/Functional boundary cluster.** The 20 entities within two points of the 40-point line (Greece 39.1, Alphabet/Google 40.0, Croatia 40.6, General Motors 40.6, and the rest) are the entities whose *public band label* is most fragile. A single documented improvement or deterioration can flip the label without much changing the underlying conduct — the band crossings most likely to generate "why did X change band?" reader questions. This is the cohort to watch for label volatility, not score volatility.
- **The first premium-earner in the middle.** No mid-band entity currently earns any integration premium. The first entity to assemble four or fewer weak dimensions while remaining below 60 — i.e., to develop *several* genuinely evidenced (4.0+) dimensions alongside weaker ones — would be the first real test of whether the premium behaves sensibly near the band boundaries. It would also be a signal of *uneven* improvement (some dimensions racing ahead), a pattern the record does not yet contain.
- **The recovery cases.** Hungary (50.2) and the broader set of mid-band entities on documented upward trajectories are the live test of "does climbing toward good stall in the middle?" If a recovery case crosses 60 into Established, it will be the first to switch the premium on — and the first chance to watch the mid-to-upper transition mechanic in a real entity rather than a hypothetical.
- **Quantization decay.** As first-baseline placeholder profiles (35.9, 48.4 clusters) are replaced by measured assessments, the middle should *de-quantize* — spreading off the plateaus into a smoother distribution. The rate at which the 35.9 cluster (219 entities) shrinks is a direct measure of how much of the middle is genuinely measured vs. still provisional.

---

## Sources

- **Canonical scores (ground truth):** `site/src/data/indexes/{countries,fortune-500,global-cities,ai-labs,robotics-labs,us-states,us-cities}.json` — all cohort counts (783 mid-band; 535 Developing / 248 Functional), the per-index medians, the field median of 35.9, the quantization histogram (219 at 35.9, 127 at 48.4), and every named dimension profile (Ukraine, Hungary, Microsoft, Alphabet/Google, Croatia, Greece) were recomputed directly from `rankings[]` and reconcile with the canonical formula (sparse top-band ruling caps aside, the mid-band reconciles within rounding).
- **Formula / methodology (the mechanic this briefing teaches):** `site/scripts/lib/scoring.mjs` and `site/src/lib/scoring.ts` (`computeCompositeFromDimensions`: `baseComposite + integrationPremium`, `weaknessFactor = max(0, 1 − weakDims × 0.2)`, the harm flag); `site/src/data/dimensions.ts` (the canonical `BANDS` / `BAND_DESCS` five-band vocabulary; `INTEGRATION_PREMIUM.short`/`.detail`; the 8 dimensions / 40 subdimension anchors showing the existence-to-evidence jump from level 3 to level 4).
- **Longitudinal / provenance:** `site/public/data/history/{ukraine,hungary,alphabet-google}.json` (Ukraine's June 14–15 zero-delta hold under attack; Hungary's multi-cycle climb to 50.2; Alphabet/Google's hold at 40.0); the published `floor-and-critical` and `exemplars` briefings (the extremes this briefing complements) in `research/special-briefings/`.
- **Methodology questions:** existing SBQ series in `research/PENDING_CHANGES.md` (max SBQ-19; this draft proposes SBQ-20 through SBQ-23 but does not file them while unpublished).
- **Fresh web evidence:** none required for this edition. This is a structural/comprehension analysis of the existing record and the canonical formula; no external grounding was needed, and the web-search budget was not drawn down.
