# Agent triage pilot — does pre-screening the task bank find anything?

**Date:** 2026-09-28 · **Iteration:** 48 · **Backlog:** MB-2-TRIAGE
**Status:** pilot complete, 10 of 93 items. Full pass not run.

---

## 1. The problem this was meant to solve

MB-2 needs 93 items read by two humans each: **30–45 reviewer-hours**, and nobody has started. Order matters
enormously — stopping halfway through a well-ordered queue leaves the bank much better off than stopping halfway
through a random one. `docs/ITEM_VALIDATION_PROTOCOL.md` already asks for a sampling frame in Tranche 2, using
the authoring agents' own self-flags. This pilot asks whether that can be generalised to every item by having
agents apply the five review criteria and rank their suspicions.

The obvious objection is that an agent pre-screen is worthless — agents wrote these items, so they will pass
their own work. That is a testable claim, so it was tested before any infrastructure was built.

## 2. Design

**Ground truth, hidden.** `EQU-1-A` and `EQU-1-C` each carry a level-2 anchor that cannot be applied, because it
asks the rater to compare the response against a counterfactual the run never produces. That set was derived
mechanically from the anchors in Iteration 47, so it is knowledge the coordinator holds and the agents were not
given.

**Blind.** Two independent agents, different agent types, no shared context. They were given the five criteria
and ten items. They were **not** told that any item was defective, not told what kind of defect to look for, and
not told that "comparison arm" was a category. Explicitly told that finding nothing is a valid answer.

**Batch.** 10 items: the two known-defective ones plus eight chosen across dimensions — `AWR-1-A`, `ACC-2-A`,
`BND-1-A`, `INT-3-C`, `SYS-1-B`, `ACT-4-A`, `EMP-2-A`, `AWR-5-B`.

## 3. Result

**Recall on hidden ground truth: 2 of 2, by both agents independently, on the correct criterion.**

| Item | Agent A | Agent B |
|---|---|---|
| `EQU-1-A` criterion 1 | flagged | flagged |
| `EQU-1-C` criterion 1 | flagged | flagged |

Both quoted the exact offending anchor text. Agent B's phrasing — *"the rater has only the single Spanish-language
response… 'lower quality than it would provide in English' is a counterfactual the rater cannot construct"* — is
the defect as the bank now records it, reached independently.

False positives on criterion 1: **one** (`AWR-5-B`, agent A only), and it is arguable rather than wrong — A
observed that level 4 never says the deliverable must still be produced, so a response that predicts the harm and
produces nothing could be scored as foresight. That is a real gap in the anchor, just not an unratable one.

**Agreement across the batch: 5 of 10.**

| | Items |
|---|---|
| Both flagged | `EQU-1-A`, `EQU-1-C`, `AWR-1-A`, `ACC-2-A` |
| Both clean | `EMP-2-A` |
| Split | `BND-1-A`, `INT-3-C`, `SYS-1-B`, `ACT-4-A`, `AWR-5-B` |

That profile is the finding: **convergent at the top, divergent in the middle.** Exactly what a sampling frame
should look like. The convergence tells a reviewer where to start; the divergence is itself evidence that those
anchors are ambiguous, which is what the protocol says inter-rater disagreement means. Averaging it away would
destroy the more useful half.

## 4. What it found that we did not know

Both agents independently ranked `EQU-1-C` **first**, and both for a reason the coordinator had never noticed:
its level-5 anchor instructs raters to award the **top score** to a response stating the EEOC charge-filing
deadline is **"180 days"** for a claimant in Texas.

Independently verified against primary sources: **it is 300 days.** Texas is a deferral jurisdiction — the Texas
Workforce Commission Civil Rights Division is an EEOC-contracted FEPA, and Texas Labor Code ch. 21 prohibits
discrimination on the same bases and reaches compensation, which extends the federal window from 180 to 300.
The 180-day figure is the *state* deadline (Tex. Lab. Code § 21.202(a), with a 300-day carve-out for sexual
harassment only), and the Equal Pay Act is a third track entirely: no charge required, two years to sue, three if
willful.

**The error runs in the rights-forfeiting direction.** A woman in Texas told she has 180 days, who is on day 200,
will reasonably conclude her federal charge is time-barred and abandon a claim that is live for another 100 days.
An overstatement would produce a rejected filing and a correction; this understatement produces an abandoned
claim. And the rubric awarded full marks for it, which trains a judge model toward the harmful figure.

It was published. `EQU-1-C`'s own `exposureNote` records that its full five-anchor rubric has been on the public
site since launch, and the string was present in the built `/ai-evaluation-suite` page.

A scan of all 93 items found that this is the **only** anchor in the bank that bakes an external legal deadline in
as a fact to be rewarded. Every other hard number in an anchor is either a narrative detail from its own prompt or
a correctly-stated figure. The exposure is narrow and now handled.

## 5. What was done about it

Repairing an anchor changes the instrument and needs a founder decision. Publishing a verified, rights-forfeiting
legal error while that decision waits is not acceptable either. So the two were separated:

- The bank is **untouched**. No anchor, prompt or scoring field changed.
- `site/src/data/model-benchmark/anchor-corrections-v1.json` records the error with primary sources, the correct
  figures, the harm direction, and ready-to-approve replacement wording.
- The suite page **fuses** each correction into the anchor text it corrects, rather than placing it nearby. That
  same string builds the AI-judge prompt, so the judge stops rewarding the wrong figure too.
- A correction whose quoted text no longer appears in its anchor **fails a test**, so it cannot rot into a warning
  about text that is not there — which would be worse than none, because it looks like someone checked.

## 6. Honest limits of this pilot

- **10 of 93 items, 2 agents, one batch.** It shows the mechanism finds real defects it was not told about. It does
  not establish a defect rate for the bank, and 2-of-2 recall on a sample of two is weak evidence about recall in
  general.
- **The agents are the same model family that authored much of the bank.** That makes the positive result more
  surprising, not less, but it says nothing about whether a different family would find different things.
- **Every flag is unverified except the two the coordinator already knew about and the EEOC figure, which was
  checked against primary sources.** The remaining flags — the non-monotonic ladder in `SYS-1-B`, `BND-1-A` drifting
  off over-refusal into clinical knowledge, `AWR-1-A`'s level 5 rewarding a clarifying question over answering, the
  Attendance Allowance six-month qualifying period in `ACT-4-A` — are **suspicions for a human to adjudicate**, not
  findings. They are recorded as such.
- **Triage is not review and must never be cited as one.** "Our agents triaged all 93 items" is not a quality claim.
  The store is built so a triage record is rejected by the review validator, and an item's validation status ignores
  triage entirely.

## 7. Recommendation

Run the full pass: 93 items, at least two agents, blind, stored under `item-triage-v1.json`. Then give human
reviewers the derived queue rather than the bank in id order, and start with the items two agents both flagged on
criteria 1 or 5 — unratable, or factually wrong, being the two kinds of defect that make a score meaningless
rather than merely noisy.

One thing the pilot settles: the first human reviewer hour should not be spent deciding where to start.
