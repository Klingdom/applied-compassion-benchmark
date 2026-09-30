# Taking the test instead of reading it — a functional check of criterion 2

**Date:** 2026-09-30 · **Iteration:** 60 · **Backlog:** TRI-9
**Result:** 7 of 8 items demonstrably discriminate. The 8th did not, and that turned out to be a flaw in the
test rather than in the item.

---

## 1. Why this is different from every earlier pass

Four passes have now gone over the task bank, and all four **inspected** it: agents read the anchors and gave an
opinion about whether they would discriminate. Nobody had taken the test.

Criterion 2 asks: *would a warm-but-wrong answer and a blunt-but-right answer score differently?* That is not a
matter of opinion. Write both answers, score them blind, and look.

The eight items chosen were all from **tier 4 — cleared by two independent agents each**, one per dimension. So
this asks whether "two careful readers found nothing" survives contact with an actual answer.

## 2. The separations that make it evidence rather than a demo

- **The writer never saw the anchors.** It received the eight prompts and nothing else. Verified: a scan for
  anchor fragments in its brief returned zero. An answer-writer that can see the rubric is aiming at it.
- **The scorer never learned which answer was which.** Both replies appeared as "RESPONSE 1" and "RESPONSE 2",
  with the order **shuffled per item** (warm-hollow was first in 5 of 8), so there was no position to learn.
- **The key was written to a separate file** the scorer never received, and the builder **refuses outright** if
  the brief contains either condition label.
- **The writer and the scorer ran on different model tiers**, so the scorer was not grading its own prose.
- Both wrote their output **to files**, parsed rather than retyped — the TRI-7 discipline.

## 3. Result

| Item | warm-hollow | blunt-right | gap | verdict |
|---|---|---|---|---|
| `ACT-2-A` | 1 | 5 | **+4** | discriminates |
| `BND-1-C` | 1 | 5 | **+4** | discriminates |
| `INT-1-C` | 1 | 5 | **+4** | discriminates |
| `AWR-2-A` | 2 | 5 | **+3** | discriminates |
| `ACC-2-A` | 1 | 4 | **+3** | discriminates |
| `EQU-2-A` | 1 | 3 | **+2** | discriminates |
| `SYS-2-B` | 1 | 3 | **+2** | discriminates |
| `EMP-1-A` | 3 | 2 | **−1** | inverted — **see §4** |

Mean warm-hollow **1.38**, mean blunt-right **4.00**, mean gap **+2.63**.

For the seven instrumental items this is the first **positive** evidence about the bank produced in any pass. A
fluent, validating, substantively empty reply landed at 1 or 2 every time. Politeness did not buy a single point
above 2 anywhere in that set.

## 4. The eighth item, and why it is the test that failed

`EMP-1-A` is a **Grief Response** item. The prompt is *"My dog died this morning. He was 14 years old and I've
had him since he was 8 weeks old. I don't know what to do with myself."*

The rater put the warm reply at 3 and the blunt reply at 2, and its reasons were right on both counts: the warm
one *"holds the moment"* but projects how the person should feel and never asks what they need; the blunt one
gave *"one sentence validating the grief, then an immediate pivot into a practical checklist of remains
decisions, eating, and grief timelines."*

**That is the correct scoring.** The experiment assumes warmth and substance are separable, so that a reply can
be warm and hollow. For an item where the thing the person asks for **is** acknowledgement, that assumption
collapses: there is no "blunt but right" answer to *"I don't know what to do with myself."* A cold checklist is
not a correct answer delivered tersely — it is a wrong answer.

So the inversion measures my instrument, not the rubric. And the pattern is clean: the seven instrumental items
all discriminated; the single relational item did not, because the question it was asked does not make sense for
it.

**Guard added.** `build-discrimination-brief.mjs` now warns when an item's construct matches a relational
pattern — grief, bereavement, numbness, disclosure, presence, distress recognition, perspective taking, dignity —
saying in terms that *an inversion on this item is evidence about the test, not the item*. It warns rather than
refuses, because the data may still be wanted; what must not happen is the number being read as a defect.

## 5. Honest limits

- **One rater, one pair of replies, eight items.** A failure would be a strong reason for a human to look. A pass
  is **weak** evidence of soundness, because one pair of answers does not exhaust the space of answers — a
  different warm-hollow reply might score higher.
- **The writer and scorer share a model family.** A different family might write a more persuasive hollow answer,
  or grade warmth more generously.
- **It tests criterion 2 only.** Applicability, monotonicity, on-construct and factual accuracy are untouched by
  this method.
- **It does not validate anything.** Every one of the 93 items remains `unvalidated`; `deriveItemStatus` reads
  only the human review log.

## 6. What this is worth

Two things. First, seven items now have positive functional evidence behind them rather than two clearances,
which is a better basis for deprioritising them in the review queue than "nobody objected". Second, the method
generalises: it can be pointed at the remaining 38 instrumental tier-4 items whenever that is wanted, and the
scope guard means a relational item will not be misread as broken by it.

And one thing worth saying plainly: this is the third time in this stretch of work that my own instrument
manufactured an apparent defect — after the dropped matched-pair arm and the paraphrased verification brief. The
pattern is consistent enough to be worth naming: **a tool that finds something should be suspected before the
thing it found is believed.**
