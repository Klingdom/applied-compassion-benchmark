# Meta-Review 8: Improvement Loop, Iterations 80–85 (2026-09-30)

**Trigger:** `test:meta-review-cadence` at 6 unreviewed against a tolerance of 5 — the third time this gate has
compelled a review, and the second since the tolerance was tightened.

**Verdict: the agent-doable queue is now empty at score ≥ 13, and more than half of it was never work at all.**

---

## 1. The headline number

Of the **23** high-scoring "open" rows this session began with, **13 were already finished.** Not stale by a
little — finished, gated, tested, and still listed as problems:

| row | what was already there |
|---|---|
| RS-1 | validator reporting `REAL GAPS (FAIL) : 0` |
| RS-2 | `test:encoded-names` 9/9, zero encoded sequences |
| GI-1 | `preflight-snapshot.mjs`, in the chain |
| SC-1 | 46 KB ledger, 9 references, **148** passing assertions |
| MB-2a | `test-item-reviews.mjs` in the chain, schema shipped |
| SC-1c | field-scope section **and** the exact fixture the row asked for |
| D1-1 (d) | commit identity wired end to end, 2026-09-16 |
| OBS-1 | duplicate of the above |
| MS-3, GI-2, GI-3, MS-5, MB-2 | superseded rows left beside their own completion notices |

**That is the finding of this session, and it is not a tidying matter.** Meta-Review 5 concluded the loop had
spent 37 iterations ranking its own follow-ups above the product backlog. One mechanism is now measured: the
product backlog's top rows were **fiction**, so every honest application of the formula ranked a real
self-generated item above an imaginary pre-existing one. The loop was not ignoring the queue. **It was reading a
queue that lied.**

## 2. What Iterations 80–85 closed

| iteration | row | outcome |
|---|---|---|
| 81 | CS-3 | **measured**: 48.7% of discriminating items use the outlet convention, 39.6% the authority convention — both live, near-equal. Decision founder's. |
| 82 | MB-1 | release-watch state now **required** in briefings, with two truthfulness invariants |
| 83 | MS-2 | trial-cache safety invariant **asserted** instead of argued, incl. the same-size rewrite case |
| 84 | D-35 | code now follows the **ratified decision** on `&`; 3 of 1,325 slugs changed, 0 published URLs moved |
| 85 | RS-5 | rotation header must agree with its entity stamps, both directions controlled |
| 85 | SC-1c | verified already done |

Six rows, four gates, no new defect introduced, every change with a planted control.

## 3. A rule earned three times, worth stating once

**A test whose expected value is read off the implementation verifies nothing except that the implementation has
not changed.**

- **V9a**: `test-pinned-slugs` tested its own *copy* of `rowSlug`. Meta-Review 3 broke the shipped function and
  the guard reported 10 passed, 0 failed.
- **V9d-1**: the redirect gate compared two nginx configs *to each other*. Deleting a rewrite from both passed 4/4
  while a legacy URL began 404ing.
- **D-35**: `test-slug-conventions` asserted `folded: "atandt"` — the code's behaviour — so a **founder-ratified
  decision** and its implementation drifted for two weeks with a green build.

In each case the expectation had to come from outside the code: a shipped export, a specification, a decision
record. This is the same family as V10 (coverage before absence) and belongs beside it.

## 4. The counter-lesson, which matters because I was about to over-apply the rule

Five times this session a prose-scanning check fired on the prose explaining it, and five times the fix was to
**narrow** the check — `stripCitations`, `stripInlineCode`, field scoping. SC-1c looked identical and the existing
fix did the **opposite**: it kept `news_summary` in scope *precisely because* that is where an author's
ledger-referencing aside lands.

The reasoning is the failure direction. Over-reach means re-flagging a candidate that was only discussing the
ledger, for a human to wave through. A miss means a resurfaced misdated claim reaching a published briefing.
**Narrowing a check is not automatically right; it depends which way the failure hurts.** I would have narrowed it.

## 5. State of the queue

Nothing agent-doable remains at score ≥ 13. What is left:

- **Founder-gated** (unchanged, and now the whole queue): D-47 merge/deploy, D-48 Rethink Robotics, D-49 disclosure,
  D-50 application backlog, CS-2b (43 tier badges + 3 misdated citations), CS-3 the tier rule, RS-7, D-13
  (**deadline 2026-11-17**), and the three proposals S13, V10, S12.
- **Agent-doable below 13**: MB-1b (rendering, needs the Next.js 16 guide read), TRI-16, CI-2, HEALTH-2, QUEUE-1's
  observation itself.

## 6. Recommendations

**1. Treat the backlog as a measured artifact, not a notebook.** `test:backlog-ids` now stops duplicate live rows,
but nothing detects a *unique* row describing finished work — that took thirteen hand verifications this session.
Candidate: require every row to carry a falsifiable "done when" line, so a script can ask the system whether it is
satisfied. That is a real piece of work and it would have saved this session days.

**2. The decisions are the only remaining bottleneck, and the list has stopped growing by accident.** Everything
found in the last twelve iterations is in it.

**3. Keep the cadence at 5.** It has now forced three reviews, each of which found something the loop would not
have volunteered — including this one.

---

**Bottom line.** This stretch finished the agent-doable queue and discovered that more than half of it had already
been finished. The loop's instruments are sound, its record is honest, and its reach ends where a decision
begins.
