# Chapter 8: How Assessment Works

A composite score of 46.9 looks like a precise thing, and precision invites suspicion. Where does the .9 come from? Who decided it was not 51, or 38? The honest answer, and the one that separates this benchmark from the indices a reader has learned to distrust, is that no one decided it. The number is built from the bottom up by a published formula, and anyone holding the eight underlying scores can reconstruct it exactly. This chapter shows the construction, using the illustrative AI lab from the last two chapters so the arithmetic has something to bite on. Every number below is illustrative, built to demonstrate the mechanism rather than to report a published score.

Scoring starts not at the composite but at the floor, with a single behavior. Each of the forty subdimensions is rated on the same six-point anchor scale, where each level is a described pattern of conduct rather than a vibe.

[GRAPHIC: The 0–5 anchor strip. Six labeled steps left to right with their behavioral descriptions: 0 Active Harm, 1 Absent, 2 Minimal, 3 Developing, 4 Established, 5 Exemplary. The 0 step is set apart to mark it as a separate documented-harm floor rather than a continuation of the scale.]

- **0 Active Harm.** Specific, documented harm. A separate floor, requiring written evidence and a second assessor's sign-off.
- **1 Absent.** No meaningful capacity.
- **2 Minimal.** A nominal capacity that fails under any pressure.
- **3 Developing.** Genuine capacity in some cases, but inconsistent.
- **4 Established.** Consistent capacity across most cases, confirmed by the people served.
- **5 Exemplary.** Outstanding, independently verified, and sustained when it was costly.

The anchors are written so that two assessors reading the same evidence land in the same place, and the gap between a 3 and a 4 is not a matter of generosity. A 3 is real but uneven. A 4 requires evidence that the behavior held up across most cases and was confirmed from outside the institution. The higher anchors carry an evidentiary cost that the lower ones do not, which is the first place the evidence hierarchy from the previous chapter does its work.

The five subdimension ratings within a dimension average into that dimension's score, so each of the eight dimensions arrives as a number on the same 1-to-5 scale. For the illustrative lab, assessment produces these eight:

| AWR | EMP | ACT | EQU | BND | ACC | SYS | INT |
|---|---|---|---|---|---|---|---|
| 3.5 | 2.5 | 3.5 | 2.5 | 3.0 | 2.5 | 3.0 | 2.5 |

Now the composite. Scoring model v1.2 turns these eight numbers into a 0-to-100 score in two moves.

**The base.** Take the mean of the eight dimension scores, then stretch the 1-to-5 range onto a 0-to-100 scale. The formula is `((mean − 1) / 4) × 100`. The subtraction of 1 sets the bottom of the behavioral scale to zero, so that an institution sitting at the lowest anchor on every dimension scores 0 rather than 20.

- Mean = (3.5 + 2.5 + 3.5 + 2.5 + 3.0 + 2.5 + 3.0 + 2.5) ÷ 8 = 2.875.
- Base = ((2.875 − 1) ÷ 4) × 100 = 46.9.

**The integration premium.** On top of the base, an entity can earn up to ten additional points, and the premium is where the standard encodes what it values. It is `10 × a consistency factor × a balance factor`. The consistency factor rewards an even profile: low variation across the eight dimensions earns the full multiplier, high variation shrinks it toward nothing. The balance factor subtracts 0.2 for every dimension that falls below the exemplary threshold of 4.0, with a floor of zero. And one override governs both: if any single dimension sits at exactly 0, active documented harm, the premium is canceled entirely, no matter how even the rest of the profile looks.

For the illustrative lab, the eight scores are tightly clustered, so the consistency factor is at its maximum of 1.0. But not one dimension reaches 4.0, so the balance factor is `max(0, 1 − 8 × 0.2)`, which is 0. The premium is `10 × 1.0 × 0 = 0`.

[GRAPHIC: The composite-formula callout. The two-line equation set large: `base = ((mean of 8 dimension scores − 1) / 4) × 100`, then `final = base + integration premium (0 to +10)`, with the illustrative lab's numbers substituted beneath each term.]

The lab's final composite is `46.9 + 0 = 46.9`. That lands it in the third of five bands, each twenty points wide: **Critical 0–20, Developing 20–40, Functional 40–60, Established 60–80, Exemplary 80–100.** At 46.9 the lab is Functional: core practices exist and clear a basic bar, with significant gaps still open. It earned no premium because no single dimension reached the exemplary threshold, and that is the common case, not a glitch. The premium is hard to earn on purpose.

How hard, and why it is shaped this way, is clearest when two entities with very different profiles are set side by side.

| Profile | Dimension scores | Base | Premium | Final | Band |
|---|---|---|---|---|---|
| Balanced | all eight at 4.0 | 75.0 | +10.0 | 85.0 | Exemplary |
| Spiky | four at 5.0, four at 2.0 | 62.5 | +2.0 | 64.5 | Established |

The spiky entity has four perfect scores. The balanced entity has none. The balanced entity wins, by twenty points and a full band, because its care is even and sustained while the spiky entity is brilliant in four places and failing in four others. A standard that simply averaged the eight would rank these two far closer together. The premium is the benchmark's deliberate statement that consistency is itself a form of compassion: an institution strong everywhere is doing something an institution with four spikes and four holes is not.

Every composite on this page is reconstructable. Hand any reader the eight dimension scores and the published formula and they will arrive at the same final number, which is the honesty proof. A successor could redo the math and reach 46.9, 85.0, and 64.5 without trusting anyone's judgment about the result.

One distinction has to be stated plainly before this is mistaken for something it is not. The 1,256 public scores are produced by an automated nightly pipeline that applies this exact framework and formula at scale, with a human approving any change before it is published. That pipeline is built and running. It is not a room of analysts hand-assessing twelve hundred institutions. A separate and more intensive method, the seven-session Human Assessment Battery conducted by credentialed assessors in the field, is the aspirational standard that will underpin a future paid certification. The two pathways share these anchors and this formula. They are not the same process, and the next chapter, which is about what a score is for, applies to both.
