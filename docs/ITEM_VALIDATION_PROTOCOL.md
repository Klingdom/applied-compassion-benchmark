# Item validation protocol — MB-2

**Status:** protocol ready, review not started. **0 of 93 items validated.**
**Author:** coordinator, 2026-09-27. **Requires:** human reviewers. This is the one thing on the model track
that cannot be delegated to an agent, because the entire point is that a human checked what agents wrote.

---

## Why this is the most important open item

Everything else on the AI Evaluation Suite is now built: the bank covers all 40 subdimensions, the composite
is gated, contamination is detected, scores are append-only, submissions are re-scored on our side, and the
package installs. All of it rests on **93 items that no human has read.**

They were authored by AI agents against published rubrics and verified *structurally* — id integrity, anchor
count and ordering, mandated-null fields, prompt hygiene, duplicate scanning, crisis-vocabulary scanning.
Structural verification says the item is well-formed. It says nothing about whether the item measures what it
claims to, whether its anchors are applicable, or whether two careful raters would agree.

We already know structure is not enough, from inside our own bank: `EQU-1-A` and `EQU-1-C` are perfectly
well-formed and each carry **one anchor that cannot be applied** — their level-2 descriptors ask the rater to
judge the response against a counterfactual the run never produces ("lower quality *than it would provide in
English*"; "less specific *than it would for a non-racialized version*"). Levels 1, 3, 4 and 5 are applicable,
so the items are scorable except at the 1-to-2 boundary. That defect survived every automated check and was
found by reading.

<!-- BANK-CLAIM-OK: names EQU-1-B only to record the 2026-09-28 correction, not as an accusation -->
**Correction, 2026-09-28.** Every surface above previously named `EQU-1-B` here instead of `EQU-1-A`, and
<!-- BANK-CLAIM-OK: names EQU-1-B only to record the 2026-09-28 correction, not as an accusation -->
called the items wholly unscorable. Both were wrong: EQU-1-B's anchors reference "the stated literacy
context", which its prompt states, and it was scored 4.00 on trials 5, 4, 3 in the 2026-09-25 self-run — an
item that cannot be scored cannot also carry three ratings. The affected set is now **derived from the
anchors** by `site/scripts/test-bank-claims.mjs`, so this prose can no longer drift from the bank.

---

## What "validated" means

An item moves from `unvalidated` to `validated` when a human reviewer has confirmed **all five**:

| # | Criterion | The question |
|---|---|---|
| 1 | **Applicable** | Can every anchor be applied using only the response and the prompt? No anchor may require information the rater does not have, and none may require a comparison against a response the run never elicits — the `EQU-1-A` / `EQU-1-C` level-2 defect. |
| 2 | **Discriminating** | Would a warm-but-wrong response and a blunt-but-right response score *differently*? If any competent polite answer scores 4+, the item measures politeness. |
| 3 | **Monotonic** | Is each level a genuine improvement on the same axis, rather than a different virtue? Level 5 must be reachable by a real answer; level 1 must be a plausible real failure, not a strawman. |
| 4 | **On-construct** | Does it test its own subdimension rather than a neighbour's? Cross-dimension bleed was flagged by the authoring agents themselves on several items. |
| 5 | **Safe and accurate** | No crisis content outside the five flagged items. Any factual claim — a law, a drug, a statistic — is real and correctly stated. |

A reviewer who cannot answer yes to all five marks the item `needs-revision` with the failing criterion named.

## What a reviewer is NOT asked to do

- Not to judge whether the scenario is realistic *to them*. Variety of register and culture is deliberate.
- Not to rewrite. Flag and move on; revision is a separate pass by a different person.
- Not to score a model. This is instrument review, not evaluation.

---

## The two-rater requirement

Criterion 2 and 3 are judgement calls, and a single reviewer's judgement is exactly the thing that cannot be
checked. So:

- **Every item is read by two reviewers independently**, without seeing each other's verdict.
- Where they agree, the item takes that verdict.
- Where they disagree, a third reader adjudicates and **the disagreement is recorded on the item**, because an
  item two careful people read differently is a fact about the item.

Inter-rater agreement is itself a headline number for this bank and should be published alongside the
validated count. If agreement is poor, the anchors are the problem, not the reviewers.

---

## Order of review, so partial progress is still useful

Review is a long job. Sequenced so that stopping at any point leaves the bank better rather than half-done:

**Tranche 1 — the 5 crisis items.** `ACT-1-A`, `ACT-5-A`, `ACT-5-B`, `EMP-1-B`, `EMP-1-C`. They carry the most
duty-of-care risk and are excluded from default runs, so they are simultaneously the highest-stakes and the
least-exercised. Clinical review is worth paying for here.

**Tranche 2 — the 8 items the authoring agents flagged themselves.** Each agent named its own
least-confident item and why. That is a free, honest sampling frame and it should be used before random
selection. Known concerns: cross-dimension bleed (`AWR-5-B`, `SYS-4-B`), rater-knowledge dependence
(`ACC-2-A` needs UK holiday law; `ACT-4-A`/`ACT-4-B` reward jurisdiction-specific knowledge, a real DIF risk),
and one rubric-fit judgement call (`INT-3-C`, where the two pre-existing I3 items read the subdimension
differently from the published text).

**Tranche 3 — the known-broken pair.** `EQU-1-A` and `EQU-1-C`, level 2 only. Repair or retire. Repairing a
published rubric is a methodology act and needs a decision, not a patch. Note that the repair is narrow: each
needs one replacement level-2 descriptor that a rater can apply without a second run.

**Tranche 4 — the thin subdimensions.** Any subdimension resting on 2 items, where a single bad item is half
the evidence. Currently that is most of them.

**Tranche 5 — everything else**, in random order, two raters each.

---

## What happens to the data

A verdict is a **new record, never an edit**. Item `validationStatus` moves `unvalidated → validated` or
`unvalidated → needs-revision`, and the review itself is recorded with: reviewer identity, date, the five
criteria individually, the free-text concern, and the second reviewer's independent verdict.

`site/scripts/validate-task-bank.mjs` already enforces that a claimed subdimension is real and belongs to its
dimension. A review-record schema and its validator should be built **before** the first review, for the same
reason the score history was built before the first score: a review log that starts after the reviews do has
already lost some. That is filed as **MB-2a** and is agent-doable.

---

## What changes on the site when this starts

`model-index-facts.ts` already derives `reviewedItemCount`, and every page that mentions it reads from there.
The moment the first item is validated, `/ai-models` stops saying *"0 of 93 items have completed human
review"* on its own, with no page edit required. That was deliberate.

**What must not happen:** validated items must not quietly become a licence to publish a model score. Human
review of the instrument is necessary and not sufficient. A comparable score still needs an unpublished item
pool, cross-model judging, and the formula question (MS-5) answered.

---

## Estimated cost, stated so it can be planned rather than discovered

93 items × 2 reviewers. Applying the five criteria properly to one item — reading the prompt, reading five
anchors, imagining a strong and a weak response against each — is perhaps 10–15 minutes of genuine attention.
That is roughly **30–45 reviewer-hours**, plus adjudication.

It is not a weekend, and doing it badly is worse than not doing it, because a validated label on an unexamined
item is a stronger false claim than an honest zero.
