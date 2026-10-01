# Meta-Review 7: Improvement Loop, Iterations 74–79 (2026-09-30)

**Trigger:** `test:meta-review-cadence` at 6 unreviewed against the tolerance of **5** — the tolerance *this
loop lowered from 8 in Iteration 74 on this gate's own evidence*. It fired two iterations later than the old
setting would have, which is the point: the tightening worked.

**Verdict: the loop stopped building gates for their own sake and started finding published defects. It still
cannot fix any of them.**

---

## 1. What this window actually produced

| | |
|---|---|
| Contradicted tier badges found in published briefings | **43** |
| Citations dated after the briefing that cites them | **3** |
| Evidence items with no usable publication date | **72** (ceiling, shrink-only) |
| Legacy URLs now specified as must-resolve | **106** |
| Published entities with no independent freshness record | **16** |

Commits touching a published surface or its contract: **1 of 6** (CS-2d, which made `publishedDate` required in
the schema and the producer's brief). By the crude count that is barely better than Meta-Review 6's 1-of-13.

**But the crude count is now misleading, and I want to be careful not to hide behind that.** The difference is
that these iterations *found defects in published data* rather than building machinery around hypotheticals. 43
tier badges that tell a reader to trust a source more than the benchmark's own assessment does is a product
defect, found by a validator, and it was invisible before this window.

What has not changed: **none of it is fixed**, because all of it is in published briefings that §1c forbids
editing. Every one terminates in CS-2b, awaiting a founder.

## 2. The most important finding is about my own instruments

**Two vacuous zeros in one session, and the second was documented in advance.**

Iteration 71 built the tier-consistency gate, compared 72 pairs, found **0 mismatches**, and wrote in both the
log and the allowlist that *"the current count is genuinely 0, and that is not the gate being vacuous."*

It was. The matcher read **1,142 of 2,403** tier citations — one of four citation shapes the assessments actually
use. The CS-2 addendum, dated 2026-09-21 and sitting in the row I was working from, says in writing: the matcher
*"must handle three citation shapes, not one"*, and records that its predecessor *"silently read 0 URLs twice"*.
I read that row, built one shape, and reproduced the failure it documented. With all four shapes: **300 pairs,
43 mismatches.**

Earlier in the session the same shape appeared differently: a verification harness called `npm` without a shell
on a platform that needs one, and reported a passing test as failing and a finished item as indeterminate.

**Iteration 71 had positive controls.** It asserted the briefing extractor found pairs, that fixture URLs
canonicalised, that a fixture contradiction was detected. Every one passed. **None of them asked the only
question that mattered: what fraction of the corpus am I reading?**

## 3. Proposal: V10 — coverage before absence

The verification checklist has V8 — *no zero without a positive control.* That is necessary and it was satisfied
here, and it was not enough. A positive control proves an instrument **can** fire. It says nothing about **how
much** the instrument looks at.

> **V10.** An absence claim over a corpus must state the fraction of that corpus the instrument read, and that
> fraction must be independently derivable. "0 mismatches" is not a result; "0 mismatches over 300 of 2,403
> citations" is a result, and an obviously inadequate one.

Cheap to apply: count what you examined, count what exists, publish the ratio beside the finding. The tier gate
now prints its pair count, and the four extractor shapes each have a fixture. Had that line existed in Iteration
71, "72 pairs" against 2,403 citations would have been visibly wrong on the day.

This is a verification-checklist amendment, so it is the founder's to ratify. I will apply it to my own
absence claims from the next iteration regardless, and mark it unratified.

## 4. What the loop is doing well

- **Gates caught their author four times this window**: the cadence gate forced this review; `test:slug-conventions`
  caught a reimplemented slug rule within minutes of my writing it; the shared-key control caught a ceiling that
  counted the wrong thing and *passed with a defect planted*; the iteration-log gate caught a reference to an
  unwritten entry.
- **Measurement before building, consistently.** CS-2c's own row hypothesised a legacy artifact; measurement
  showed the opposite (early 0, middle 6, late 65) and the fix changed accordingly. V9d-1's spec was generated
  from `nginx.conf` rather than transcribed. The recency rule was chosen by measuring that age alone would fire
  on honest citation.
- **Corrections are published as prominently as the claims.** Iteration 79 exists only to correct Iteration 71.

## 5. Recommendations

**1. Unchanged from Meta-Review 6, and now more expensive to ignore: the decisions are the bottleneck.** The
founder queue now holds 43 tier corrections, 3 misdated citations, 72 undated items, 16 shared rotation keys, a
defunct company in the second-highest band, nine double-scored names, and a merge of 150+ commits. **Everything
this window found is in it.** D-13's deadline is 2026-11-17.

**2. Adopt V10** (§3) and **S13** (Meta-Review 6 §5, still unratified).

**3. Stop selecting rows whose fix is founder-gated, once the measurement exists.** Three of the last five
iterations ended "the remedy belongs to the founder". That is the right *conclusion* but a poor *selection
criterion* — it means the loop is doing reconnaissance it cannot act on. The remaining agent-doable rows (MB-1,
MS-2, TRI-16, HEALTH-2, CI-2) are all internal; if they are the queue, the queue is exhausted of product work
that does not need a decision.

---

**Bottom line.** The loop found 43 published defects it cannot fix, corrected one of its own false all-clears,
and tightened the rule that let the false all-clear through. That is a good window by every measure except the
one that matters: **nothing reached a reader, and the list of things waiting on one decision got longer.**
