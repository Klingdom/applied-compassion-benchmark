# Learn brief 02: Curriculum and learning design

**Lens:** learning design. This brief covers what each band should be able to do, in what order, at what reading load, and how each page checks understanding.
**Sources:** `docs/learn/PANEL_BRIEF.md`, `site/src/data/dimensions.ts`, `site/src/app/methodology/page.tsx`, `site/src/app/dimensions/`, `site/src/app/glossary/page.tsx`, `site/scripts/lib/scoring.mjs`, `CHANGELOG.md`.

## Three source problems the curriculum must not inherit

1. **The band edges disagree.** In `site/src/data/dimensions.ts:596`, `BANDS` is "lower-inclusive / upper-exclusive", so 20 counts as Developing. In `site/scripts/lib/scoring.mjs:43`, `getBand(20)` returns Critical, and `BAND_RANGES` reads "21-40". A band-sorting activity that uses exact edge values would teach one of the two rules, and the other would contradict it.
2. **There are two scales for one dimension score.** `methodology/page.tsx:244,323` says a dimension is scored "out of 10". The formula then averages dimensions "on the 0–5 scale" (line 358). For anyone below the Researchers band, this is pure extraneous load.
3. **The site still teaches a corrected idea.** The `ConsistencyStepChart` caption says "lower variance … earns a higher premium multiplier" (`methodology/page.tsx:272`). `INTEGRATION_PREMIUM.detail` says the same (`dimensions.ts:635`). The 2026-09-29 CHANGELOG entry says this part of the formula has never moved off its maximum: the premium rewards clearing 4.0 on every dimension, not evenness. The reason is that the σ thresholds of 1.5, 3.0 and 5.0 (`scoring.mjs:78-81`) are measured on a 0–5 scale, where σ cannot go above 2.5.

## The progression (prerequisite chain)

| Rung | Concept | Must already know | Signature experiment | Explorers | Inv. | Anal. | Res. |
|---|---|---|---|---|---|---|---|
| 1 | Noticing suffering or need | none | "Who got missed?" picture hunt | yes | yes | yes | yes |
| 2 | Evidence: showing beats telling | 1 | Evidence-tier card sort | yes | yes | yes | yes |
| 3 | A rubric: same question, described steps | 2 | Score one question on a 5-step ladder | yes | yes | yes | yes |
| 4 | Averaging, then weighting | 3 | Build-a-score sliders (`scoring.mjs`) | averaging only | yes | yes | yes |
| 5 | Uncertainty | 4 | Dice or bootstrap re-scoring | "we might be a bit off" | yes | yes | yes |
| 6 | Bands as honest coarseness | 5 | Band sorting, away from the edges | yes | yes | yes | yes |
| 7 | Correction | all | Design a corrective action, and read a real correction | yes | yes | yes | yes |

Uncertainty deliberately comes *before* bands. The reason for bands is that scores are not exact. Taught the other way round, bands look like grades.

"Weighting" has two meanings in the benchmark, and both should be taught as such:
- **Evidence is weighted.** The tiers are weighted (`EvidencePyramid.tsx`).
- **Dimensions are not.** All eight count equally (`scoring.mjs:70`). The only non-linear part is the premium.

The most likely misconception is that "some dimensions matter more", so it gets named explicitly.

## Objective matrix (4 bands × 5 topics)

Each cell reads: **objective** / *the misconception it targets* / example used. Explorers use invented examples only. Every page links up a band and finally to `/methodology`.

### 1. Methodology
| Band | Objective / misconception / example |
|---|---|
| Explorers | **We judge what a place does, not what it says.** / *Saying kind things is the same as being kind.* / The invented Bramblewick Library has an "Everyone welcome!" sign but only steps; a second library has a ramp and a reading helper. |
| Investigators | **Compassion is eight separate questions, and each one can be answered separately.** / *Compassion is a single feeling you have or don't have.* / The eight `DIMENSIONS[].desc` questions, matched to scenes from an invented town. |
| Analysts | **Scores of 4 and 5 need pressure-test evidence. Being good when it is easy is not enough.** / *A good record in calm times proves good character.* / The rule in `methodology/page.tsx:257`, applied to the I1 "Consistency Under Pressure" anchors. |
| Researchers | **Critique the instrument: anchor wording, the attribution rule, the served population.** / *A published rubric must be a valid one.* / Compare the A1 anchors with the AB1 anchors (`dimensions.ts:32,382`) and find where they overlap. |

### 2. Analysis
| Band | Objective / misconception / example |
|---|---|
| Explorers | **Some clues are stronger than others.** / *Whoever says it loudest is right.* / Was the playground fair? Three clues: a poster, one friend's story, and a count of who got a turn. |
| Investigators | **Rank evidence by how independent it is.** / *An official statement is the strongest evidence.* / A sort of the five tiers, from audit down to self-report (`EvidencePyramid.tsx:13`). |
| Analysts | **A scan flags an entity, and an assessment scores it. Old findings persist, and unproven claims fade.** / *Evidence expires after 14 days.* / `methodology/page.tsx:516-520` (the 14-day window is the scan cadence). |
| Researchers | **Read a real assessment against its subdimension file and check one anchor call.** / *Desk research is neutral.* / A file pair in `research/assessments/*.md` + `.subdims.json`, plus the positive-evidence search (`methodology/page.tsx:566`). |

### 3. Scoring
| Band | Objective / misconception / example |
|---|---|
| Explorers | **Score each question on a ladder, then average.** / *One great thing makes everything great.* / A class pet-care chart: three questions, sticker steps 1–5, then share the stickers out evenly. |
| Investigators | **Step 0 means harm, which is different from "nothing" (that is step 1).** / *Zero means "didn't do anything".* / The anchor table, `methodology/page.tsx:450-455`. |
| Analysts | **Reproduce a composite. The bonus rewards clearing 4.0 everywhere, not sameness.** / *An even profile is rewarded twice.* (The benchmark itself believed this; see CHANGELOG 2026-09-29.) / Abridge at 60.9 (`methodology/page.tsx:358-384`), entered into sliders that call `computeCompositeFromDimensions`. |
| Researchers | **Probe how sensitive the formula is: the unreachable σ tiers, the ceiling at an average of 4.6, and the band edges.** / *A formula that has been published has also been stress-tested.* / `scoring.mjs:77-89` and the "three narrower questions" in CHANGELOG 2026-09-29. |

### 4. Insights
| Band | Objective / misconception / example |
|---|---|
| Explorers | **A score describes what a place does. It does not say whether its people are good.** / *Low score = bad people.* / The invented Bramblewick bakery: kind staff, but no way to know who went without. |
| Investigators | **Ranks next to each other are often within the uncertainty of one another.** / *Rank 10 is clearly better than rank 11.* / Two adjacent rows of a real index, read from the JSON at build time (never typed by hand). |
| Analysts | **A seed is a starting guess, and a measurement comes later. Guesses can be biased in one direction.** / *Every published number is equally measured.* / Backlog RC-2: most first assessments came in *below* their seed (`IMPROVEMENT_BACKLOG.md:91`). This example is internal, so see Open question 3. |
| Researchers | **Say what the data cannot support: causal claims, cross-index league tables, or merging models with institutions.** / *Comparable numbers mean comparable things.* / CHANGELOG 2026-10-01, the entry on not merging model and institution scores. |

### 5. Corrective actions
| Band | Objective / misconception / example |
|---|---|
| Explorers | **(a) Say sorry, fix it, and change the rule. (b) Scorekeepers fix their own mistakes in public.** / *Grown-ups and experts are never wrong.* / An invented referee who miscounted and announces the correction. |
| Investigators | **(a) An apology is the first rung of repair, not the last. (b) A correction is evidence that checking works.** / *Sorry = fixed. A correction = untrustworthy.* / The AB1–AB5 anchors as a ladder, and the CHANGELOG 2026-09-28 entry "we named the wrong item as broken". |
| Analysts | **(a) Fixing one case is different from fixing the system. (b) Some corrections fix a description and leave the scores alone.** / *Correction always means scores changed.* / AB4 vs AB5, and CHANGELOG 2026-09-29 (the formula was right and the description was wrong). |
| Researchers | **(a) How repair is measured, and who judges it adequate. (b) How a correction regime works: dated entries, originals left as written, and tests that stop the error recurring.** / *Science gets things right first time.* / CHANGELOG 2026-04-20 (a recompute that reassigned bands) and the regression test in the 2026-09-28 entry. |

## Recommendations

**LD-R1. Teach corrective actions as one ladder used twice.** The four steps are:
1. **Notice and admit** (AB1);
2. **Fix it for the people affected** (AB5);
3. **Fix the system** (AB2/AB4);
4. **Tell everyone what changed** (AB3).

The benchmark's own CHANGELOG entries already follow this shape ("What was wrong / How it was found / What we have done / What it does not change"). Showing the same ladder on an institution and then on the benchmark means the schema is learned once and reused. Present it as *how science works*, never as "so trust us". Also show the honest limits, for example "not faulted ≠ sound" (CHANGELOG 2026-09-29). [I5 A5 L5 C4 E2 R1 → **P16**]

**LD-R2. Below Researchers, use a single dimension scale (0–5).** Do not show "/10" anywhere in Learn until the Researchers band, and add it to the methodology-page backlog as a load defect. [I4 A4 L5 C5 E1 R1 → **P16**]

**LD-R3. Hold the band-edge activities until the edge rule is settled.** Reconcile `BANDS` and `getBand` first. Until then, band-sorting cards avoid values within 0.5 of 20, 40, 60 or 80, and Learn always calls `getBand`, never `BANDS.min/max`. [I4 A5 L3 C5 E1 R1 → **P15**]

**LD-R4. Teach the premium as "clear 4.0 on every dimension", which is the corrected statement.** Do not reuse `ConsistencyStepChart` or `INTEGRATION_PREMIUM.detail` below Researchers. At Researchers, use them *as* the case study. [I4 A5 L4 C5 E1 R1 → **P16**]

**LD-R5. Worked example before abstraction, on every page.** Order: concrete numbers → a faded example (the learner fills one step) → the formula last. For Explorers there is never a formula, only "share the stickers out evenly". [I4 A4 L5 C5 E2 R1 → **P15**]

**LD-R6. Reading and load rules per band:**

| Band | Target level | Avg / max sentence | Words per screen | New terms per screen | Codes (AWR, AB1) |
|---|---|---|---|---|---|
| Explorers | about FK grade 3, read-aloud | 10 / 14 | ≤ 60 | 1 | never |
| Investigators | FK 6–7 | 14 / 20 | ≤ 120 | ≤ 2, defined inline | shown faintly beside names |
| Analysts | FK 9–10 | 18 / 25 | ≤ 200 | ≤ 3 | allowed |
| Researchers | plain adult English | 20 / 30 | unlimited, collapsible sections | glossary links | allowed |

Rules for every band:
- one idea per screen, with a heading that states it;
- one "If you remember one thing" line per page;
- every page opens with one recall question from the page before (spaced retrieval). [I4 A4 L5 C4 E2 R1 → **P14**]

**LD-R7. Keep anchor names apart from band names until Investigators.** Both scales use "Developing", "Established" and "Exemplary" (`methodology/page.tsx:433`). Explorers see ladder *step numbers* for anchors and band names only for the overall result. From Investigators up, the collision is taught explicitly. [I3 A4 L4 C5 E1 R1 → **P14**]

**LD-R8. Pages end with "Check your understanding", which never collects anything.** Allowed formats (React state only; no storage, no typing, all reset on reload):
- tap-to-sort cards;
- "which clue is stronger?" pairs;
- predict, then reveal (move a slider, guess the band, see `getBand`);
- spot the error in a mock correction notice;
- an "explain it to someone" prompt done aloud or on paper, with a printable version.

Feedback explains *why* an answer is right or wrong. There are no points, streaks or badges. [I4 A5 L5 C5 E2 R1 → **P16**]

**LD-R9. Explorers use invented examples only, and each invented setting is reused.** Bramblewick (library, bakery, school) appears on all five Explorer pages so that context costs nothing after the first page. Its scenarios mirror real subdimensions: B4 refusal, EQ4 access, AB1 apology. [I3 A5 L4 C4 E2 R1 → **P13**]

**LD-R10. Real entities appear from Investigators up, and only through the data and the method.** Show anchor text and dimension scores, never harm narratives. Every real example carries the duty-of-care framing in `site/src/components/model-benchmark/dutyOfCare.ts`. [I3 A5 L3 C4 E2 R2 → **P11**]

**LD-R11. Every experiment uses the real formula, and each page states its simplification.** The sliders import `computeCompositeFromDimensions`. Every simplified page carries a "What we left out" line and a link to the full version. [I3 A5 L4 C5 E2 R1 → **P14**]

**LD-R12. Educator sheet per topic.** It sets out the objectives per band, the misconception, a 10-minute offline version of the experiment, and the answer key. [I4 A4 L4 C4 E2 R1 → **P13**]

## Top 3
1. **LD-R1:** one repair ladder, applied first to institutions and then to the benchmark's own CHANGELOG.
2. **LD-R8:** an ending at the bottom of every page that checks understanding and collects nothing.
3. **LD-R2 + LD-R4 + LD-R3:** do not teach the three things the site's own sources currently get wrong or contradict (the two scales, premium-as-evenness, and the band edges).

## What I would refuse to build
- **Quizzes with scores, leaderboards, streaks or badges.** They contradict LD-R8 and the education firewall: a "score" for learning invites confusion with benchmark scores.
- **"Grade your country" or "grade a real company" for Explorers and Investigators.**
- **A re-implemented formula** of any kind, including a "simplified" one that would give different numbers.
- **The `ConsistencyStepChart` shown to under-18s** as if it described how the formula actually behaves.
- **Free-text "explain your answer" boxes.** Explanations happen aloud or on paper.

## Open questions for the founder (with defaults)
1. **Band edge: is 20 Critical or Developing?** *Default:* treat `getBand` (upper-inclusive) as canonical, correct the `BANDS` comment and range strings, and log it as a public correction.
2. **Should the "/10" dimension score be removed from `/methodology`?** *Default:* yes. Use one 0–5 scale sitewide, and file it as a methodology-page copy fix.
3. **May Analysts be taught RC-2 (seeds mostly above first assessments) before the calibration study is published?** *Default:* no. Teach "seed vs measurement" with an invented example until the RC-2 study doc exists, then swap the real example in.
4. **Can Explorers see one real benchmark correction?** *Default:* no. Use invented examples only, plus one sentence: "The real scorekeepers at this website do this too", linking to the Investigators page.
5. **Should the Explorers band be split at age 10?** *Default:* no. Keep one band, read-aloud first, with the parent or teacher as co-reader.
