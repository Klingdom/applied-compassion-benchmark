# 06 — Data visualisation brief (Learn)

**Lens:** the pictures and hands-on widgets at the heart of the experiments. **Scope:** hand-rolled static SVG plus
minimal client state, drawn only from our own data, with a CC-BY "Compassion Benchmark" caption inside every SVG.
Priority = Impact + Strategic + Learning + Confidence − Effort − Risk (each 1–5).

## What the formula actually does (checked line by line)

`site/src/lib/scoring.ts` (`compositeCore`, l.32–69) matches `site/scripts/lib/scoring.mjs` (l.66–93):
`base = (mean−1)/4×100`; `premium = hasHarm ? 0 : 10 × consistencyMult × weaknessFactor`; the result is clamped to
0–100. `computeCompositeFromDimensions` already returns every intermediate value (`baseComposite`, `stdDev`,
`consistencyMult`, `weaknessFactor`, `weakDims`, `hasHarm`), so a widget can draw each part **without re-implementing
anything**. I recomputed these cases by hand:

| Case | Profile | Composite |
|---|---|---|
| Shape doesn't matter above 4 | `[4.5×8]` vs `[5,5,5,5,4,4,4,4]` | 97.5 vs 97.5 |
| **Flat loses** | `[3×8]` vs `[1,1,1,1,5,5,5,5]` | 50.0 vs **51.5** (CHANGELOG 2026-09-14, RISK-019) |
| The 4.0 cliff | `[4×8]` vs `[3.9×8]` | 85.0 (Exemplary) vs 72.5 (Established) |
| One dimension slips | `[4×7, 3.9]` | 82.7 (−2.3: 1.3 base, 2.0 premium) |
| Spread finally bites | `[5×7, 0.5]` vs `[5×7, 0.4]` | 93.9 vs 91.6 (σ crosses 1.5) |
| The zero switch | `[5×7, 0.1]` vs `[5×7, 0]` | 90.7 vs 84.4 |
| Floor and ceiling | `[0.5×8]` · `[4.6×8]` | 0 (clamped) · 100 (clamped) |

**The MS-5 trap** (`IMPROVEMENT_BACKLOG.md` l.772; `docs/MS5_COMPOSITE_FORMULA_ANALYSIS_2026-09-29.md`): the formula
does **not** reward flatness. It rewards *every dimension at or above 4.0*.

- σ can never exceed 2.5, so two of the consistency steps can never occur.
- The 0.75 step has never fired on real data: the largest σ among published entities is 0.768.
- The consistency effect is real but small. It can change a score by **at most 2.0 points**, and only in invented
  profiles.
- A widget must never imply otherwise.

## VIZ-R1 — Build-a-score: the "score machine" (Investigators up; Explorer variant)
A client component with 8 sliders (0–5, step 0.1, keyboard operable). It calls `computeCompositeFromDimensions` from
`@/lib/scoring`. It draws three linked parts:

- **Stacked bar:** a grey *base* segment, then a premium segment in the band colour, then a dashed clamp line at 100.
- **Premium meter:** 10 cells. Each weak dimension (below 4.0) greys out 2 cells. A σ needle with a red line at 1.5;
  past that line, a quarter of the remaining cells hatch out. A "harm switch" lights up when any slider sits at 0,
  and the whole meter goes dark.
- **Weak-dimension dots:** 8 dots, filled when that dimension is below 4.0. Each dot is labelled with its dimension
  code, so colour is never the only signal.

Preset buttons load the seven cases above, side by side, with a one-line takeaway each ("Same average, flat lost by
1.5"). The "spread finally bites" preset carries a fixed note: "never happened in real data (largest spread 0.768)".

Analysts get a **"Reproduce a real score"** mode. It loads one entity's 8 dimensions from `site/src/data/indexes/*.json`
and shows the computed and published composites side by side. Lisbon reproduces 60.9.

The **Explorer variant** shows 8 jars of counters for a fictional library, with no formula. It says: "Bonus points
when every jar reaches 4. Each jar under 4 takes some bonus away. An empty jar takes it all." That is simplified but
true. An `aria-live` region announces the composite, the band and the premium after the slider settles. A version stamp
reads from `METHODOLOGY_VERSION`.
```
 AWR ──●──── 3.5   EMP ────●── 4.2  … (8)        PRESETS [flat loses][4.0 cliff][zero switch]…
 [■■■■■■■■■ base 62.5 ■■■■■■|▓▓ +2.0|           ]¦100   = 64.5  Established
 premium: 10 × consistency[1.0] × weakness[■■□□□□□□□□ 4 weak → 0.2]   harm: off
 spread σ 0.9 |----●------|1.5 (never crossed by a real entity)
```
**I5 S5 L5 C5 − E3 − R1 = 16.**

## VIZ-R2 — Bands as a number line, by age
**Shared primitive:** a 0–100 line with 5 segments. Each segment carries its band colour, its name, and a texture
pattern (so print and colour-blind readers can tell them apart). One marker, shared with VIZ-R1. A zoom lens at each
boundary reads "20.0 → Critical; 20.1 → Developing", derived from `getBand`, never typed by hand.

The edge rule disagrees in three places:
- `getBand` puts the upper edge inside the band, so 20 is Critical;
- the comment on `BANDS` (`dimensions.ts` l.596–601) says the lower edge is inside, so 20 would be Developing;
- `BAND_RANGES` reads "21-40", which leaves 20.1–20.9 unlabelled.

| Band | Visual |
|---|---|
| Explorers | 5-rung ladder with band names and invented examples only ("the library that lends wheelchairs"). No numbers beyond 0–100. |
| Investigators | Reuse `charts/BandScaleStrip.tsx`, plus the draggable marker. |
| Analysts | Real distribution: `BandDistributionBar` and `BandPositionStrip` for one index. Add a mean→composite mapping line that shows the dead zone: any average up to 1.0 scores 0. |
| Researchers | Rounding and edge precision; link to `/methodology`. |
```
 0 ▒▒Critical▒▒ 20│ Developing 40│ Functional 60│ Established 80│ Exemplary 100
                    ▲ 20.0 = Critical (edge belongs to the lower band)
```
**I4 S4 L4 C4 − E2 − R1 = 13.**

## VIZ-R3 — Uncertainty, from coin to 95% range (four steps)
1. **Explorers: "Two judges".** Two cards score the same invented poster 3 and 4. A dot plot shows both scores, their
   average, and the gap. A coin flip picks which judge you listen to: "the answer depended on the judge."
2. **Investigators: dice bootstrap.** 10 invented "question scores". **Redraw** rolls dice to pick 10 with
   replacement and drops one dot on a dot plot of averages. Buttons run ×1, ×20 and ×1000; then the middle 95% is
   shaded. It uses a seeded PRNG and shows the seed, so a class sees identical results.
3. **Analysts: overlap means "can't tell apart".** Two ranges are drawn as whiskers using the report's `HWhisker`
   shape (`model-benchmark/pilot/figure-kit.tsx`). Overlap is labelled "Not separated", the report's own vocabulary.
   - Real anchor: judge agreement in `waves/pilot-2026-10-03.json` (`exact` 0.839, mean difference 0.16). It is drawn
     as a 100-square waffle.
   - Per D-29a (`DECISIONS.md` l.691–697), any real model figure is **reused intact** with its in-SVG
     "UNOFFICIAL PILOT · not a ranking" footer. It is never redrawn, ranked or band-coloured.
4. **Researchers:** link to `/ai-models/reports/pilot-2026-10-03`, quoting "covers one source of doubt only"
   (`reports/pilot-2026-10-03.md` l.69).

**Honesty card:** published entity composites carry **no** interval yet. They are drawn as a dot labelled "range not
yet measured", never with an invented band.
```
 averages of redraws:  ·  ·· ·:::|::::::|::: ··  ·      [Redraw ×1][×20][×1000] seed 4271
                               [—— middle 95% ——]
```
**I5 S5 L5 C4 − E3 − R2 = 14.**

## VIZ-R4 — Evidence tiers as a ladder (words only until numbering is fixed)
A 5-rung ladder labelled "stronger ↑", with icons and kinds of source on each rung. It carries **no tier numbers**,
because the repo has at least four incompatible schemes:
- `charts/EvidencePyramid.tsx`: 1 = independent audit (strongest), 5 = self-report;
- `updates/briefing/evidence/index.tsx` `TIER_LABELS`: 5 = Gov/Court (strongest), after the EV-1 fix of 2026-09-21;
- `entity/EntityDetail.tsx` l.264: letters A–D;
- `data/glossary.ts` l.226: three tiers.

`research/change-proposals/lisbon-2026-10-14.json` also tags the same RTP URL `sourceTier: 2` at the top level and
`tier: 5` in subdimension A5.

The experiment is **spot-the-rung**: drag invented sources (a school newsletter boast, an inspector's report, a
parent's letter) onto rungs, then check your answer.
```
 ↑ stronger   [court / official investigator]
              [international body]  [watchdog group]  [newspaper]
 ↓ weaker     [the organisation talking about itself]
```
**I4 S4 L4 C2 − E2 − R2 = 10** (Confidence is low until a numbering convention is chosen).

## VIZ-R5 — "Seed versus measurement"
A dumbbell on the band line:
- a **hollow, dashed** dot: "starting value 60.9 — a placeholder, not a finding";
- a **solid** dot: "measured 35.0 — proposed, not applied, low confidence";
- a sensitivity bracket from 35.0 to 41.9: what the score would be if the 11 evidence-gap defaults were 3 instead of 2.

Beneath it, two 8-bar profiles: a seed with **seven bars at 3.5 and EQU at 3.0**, beside the varied measured profile.
The near-flat seed is the visual tell.

The **second panel** shows Porto: also seed 60.9, measured 32.5 (`porto-2026-10-14.json`). The point: "two cities,
same number to one decimal, because neither had been measured."

I checked every figure against `lisbon-2026-10-14.json`:
- seed mean 3.4375 → 60.9;
- measured mean 2.4 → 35.0;
- sensitivity 2.675 → 41.9.

The status comes from the file: `status: "pending"`, held for RC-2.

**Duty of care:**
- Explorers get a fictional "Seedville library" instead.
- Investigators get the scores only, with no incident detail.
- Analysts may read the evidence links.
```
 0 ────────────── 35.0 ●━━━━━┫41.9 ·············· ○ 60.9 (starting value) ──── 100
                  measured (pending)               not a finding
```
**I5 S5 L5 C4 − E2 − R2 = 15.**

## VIZ-R6 — Correction timelines
A horizontal four-stop timeline: **We said → We checked → We corrected publicly → What changed**. The last stop is a
"No score changed" badge when that is true. Each stop cites one `CHANGELOG.md` heading.

The data lives in a curated `learn/corrections` data file, and a build-time test checks that every cited heading
exists. Seed entries:
- **MS-5:** the false FAQ claim removed (2026-09-14); the full correction "We were wrong about our own scoring
  formula" (2026-09-29).
- **EV-1:** the tier scale was inverted (fixed 2026-09-21, reliability cutoff 2026-09-17).

Explorers get a fictional four-panel "oops-to-fixed" strip. Score histories use a **fixed 0–100 axis**. The existing
`entity/CompositeSparkline.tsx` auto-scales its y-axis, and that exaggerates small moves for young readers.
```
 ●──────────────●────────────────●───────────────[No score changed]
 claim made      FAQ fixed         "We were wrong…"
 (Iter. 38)      2026-09-14        2026-09-29
```
**I4 S5 L5 C4 − E2 − R1 = 15.**

## VIZ-R7 — Shared conventions
Every figure gets:
- `role="img"`, a `<title>`, and an `aria-label` that carries the numbers;
- a visible data table in `<details>`;
- shape and text alongside colour;
- motion only on user action, with `prefers-reduced-motion` respected;
- a print/black-and-white variant.

Interactive widgets: state never leaves the browser, and no analytics events fire from slider or dice actions.

**Copy guard:** do not reuse three existing strings in Learn, because each half-repeats MS-5:
- `INTEGRATION_PREMIUM.short` ("strong, even performance…") in `dimensions.ts` l.632;
- the "Typical" label for σ≈1.94 in `charts/integrationPremiumExamples.ts`. No real entity reaches that spread.
- the 2026-09-29 CHANGELOG line "Evenness does not enter the composite at all". It is true on real data but false in
  general (`[4,4,4,4,2,2,2,2]` = 52.0 vs `[5,5,5,5,1,1,1,1]` = 51.5).

**I3 S4 L3 C5 − E1 − R1 = 13.**

## Top 3
1. **VIZ-R1 Build-a-score.** Readers finally see that the score rewards *reaching 4 everywhere*, not sameness. The
   real cliffs (4.0, zero) and the dormant spread rule become visible instead of rumoured.
2. **VIZ-R5 Seed versus measurement.** Readers learn that a published number can be a placeholder, and why two cities
   shared 60.9.
3. **VIZ-R3 Coin → dice → 95% range.** Readers understand "can't tell apart" before they ever meet an AI pilot
   interval.

## What I would refuse to build
- **Radar charts for any learner band.** Area misleads, and `charts/DimensionRadar.tsx` should stay off Learn.
- **A "what would Lisbon need to rank higher?" slider on real entities.** It breaks the education firewall.
- **Any ranked, sorted or band-coloured AI model figure, or a bare model score** (D-29/D-29a).
- **Fake confidence bands on entity scores.**
- **A "60.9 club" chart.** 49 published entities sit at exactly 60.9 (grep of `indexes/*.json`), but the index has no
  per-entity seed flag, so calling them all seeds would be a fabrication.
- **A numbered tier ladder** before the convention is settled.
- **Real-entity examples or leaderboards on Explorer pages.**

## Open questions for the founder (with defaults)
1. **Which tier numbering is canonical?** *Default:* the Learn ladder uses words only, strongest at the top.
2. **Add a CHANGELOG addendum sharpening "evenness does not enter at all"?** *Default:* Learn says "never mattered on
   real data; in invented profiles at most 2 points". File it for the founder; do not edit the published entry.
3. **Show the dormant consistency step even though D-45 Q1 may remove it?** *Default:* yes, labelled "dormant" and
   stamped with `METHODOLOGY_VERSION`, so the widget follows any formula change automatically.
4. **Use Lisbon/Porto while they are held for RC-2?** *Default:* yes, labelled "proposed, not applied, low confidence",
   for Investigators upward, with no incident detail below Analysts.
5. **Which band-edge rule is canonical?** *Default:* `getBand` (upper edge inclusive). Fix the `BANDS` comment and
   `BAND_RANGES` to match.
6. **Umami on Learn?** *Default:* off on Explorer and Investigator pages; pageviews only elsewhere; never interaction
   events.
