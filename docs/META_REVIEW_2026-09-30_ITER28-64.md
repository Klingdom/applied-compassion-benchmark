# Meta-Review 5: Improvement Loop, Iterations 28–64 (2026-09-30)

**Scope:** Iterations 28–64 — 37 iterations, 57 commits since Meta-Review 4.
**Trigger:** overdue. The spec says call `meta-coordinator` every 3 completed loops. The last review covered
Iterations 21–27 on 2026-09-21. **This one is 37 iterations late**, and not one of those 37 entries noted the
trigger was due.

**Verdict: the loop is working correctly and has been pointed at the wrong thing.** Verification discipline
improved sharply across the window. What it was verifying was, almost entirely, itself.

Every figure below was measured by the coordinator directly, with a positive control where the measurement is an
absence. An independent agent review is at §8; where its numbers and mine differ, both are shown.

---

## 1. The finding that matters most: nothing has reached a reader

| measurement | value | how |
|---|---|---|
| Commits ahead of `main` | **149** | `git rev-list --count main..HEAD` |
| Commits `main` has that we lack | **0** | same |
| Deploy job trigger | `workflow_dispatch` only | `.github/workflows/deploy.yml:228` |
| Production last built | **2026-09-25T03:01:49Z** | live `build-manifest.json` |
| Deployed commit | **unknowable** — `git.sha: null` | same file; cause recorded as OBS-1 |
| Consecutive internal-only commits from HEAD | **21** | per-commit file-path classification |

**The work is on a branch that has never been merged.** 149 commits, zero of them on `main`, and the deploy job
does not fire on push. So the question "is this live?" has had the answer "no" for the entire window, and the
follow-up question "what *is* live?" cannot be answered at all, because the manifest records `git.sha: null`.

**Verified example.** Iteration 50 disproved MS-5 — the claim that the composite rewards a flat profile — and
corrected `/ai-models` on 2026-09-29. On production today, the corrected sentence *"We thought the formula
rewarded flatness"* is **absent**, and so is the text it replaced. Positive control on the same fetch:
`"Pre-registration"` → 1, `"AI Models"` → 1, `"0 models"` → 1, so the fetch and the search both work. The live
page predates both versions.

**12 reader-visible commits are written and not live**, including three corrections to published errors.

## 2. Where the effort went

Classifying all 57 commits since Meta-Review 4 by whether they touch `site/src/app`, `site/src/components`,
published index/briefing/update data, or `site/public`:

| | commits | share |
|---|---|---|
| Internal only — scripts, docs, governance, gates, tests | **43** | **74%** |
| Touches a surface a reader could see | 15 | 26% |

The independent review scored this more harshly — **75–80% internal**, and **zero of 37 iterations touching the
core rankings** — because it excluded `/ai-models` and `/ai-evaluation-suite` from "product" on the grounds that
they are a pre-launch feature with 0 of 93 items human-reviewed. That is a fair reading and the two are not in
conflict: **all 15 of my reader-visible commits are on that one feature or on the RSS feed.** By either count,
the eight published rankings that `CLAUDE.md` names as the product received **nothing**.

**Corroborating, verified:** the last entry in `research/APPLIED_CHANGES.md` is **2026-09-16**. Fourteen days,
zero score applications, against 728 change-proposal files on disk.

## 3. Two live, reader-facing defects that sat untouched for all 37 iterations

**Rethink Robotics.** Published at **rank 22 of 92, composite 60.9, band `established`** — the second-highest
band the benchmark issues. `RISKS.md` RISK-003 records it as **defunct since 2025-09-16**. A change proposal
(`research/change-proposals/rethink-robotics.json`) exists. It is live on `/robotics-labs` right now. A benchmark
that sells rankings is publishing a rating for a company that does not exist, in its second-highest band.

**Houston has two different scores.** `us-cities.json` publishes **35.2 / developing**; `global-cities.json`
publishes **43.8 / functional**. Same name, same benchmark, 8.6 points apart. RISK-017/018 records 15 such
collisions; the backlog has carried the fix as **eligible** since Iteration 19.

Neither is blocked on a founder. Both are *gated* on a founder — an index write needs approval — which is a
different thing, and the loop never once put them in front of one.

## 4. Why the loop stopped looking at its own backlog

**`Deviation:` appears zero times in `ITERATION_LOG.md`.** Positive control: `Selected:` appears 21 times, so the
search works. S1 requires any non-top selection to record a deviation reason. Nothing recorded one — not because
the rule was defied, but because **every selection felt like the top of a queue**. It was: a queue the previous
iteration had written.

The window's selections are almost all self-generated follow-ups — TRI-1…TRI-12, GI-1…GI-5, CAL-1/2, HEALTH-1,
DC-23-GATE. Each was filed by the iteration before it, each genuinely scored well, and each was genuinely the
highest-scoring *eligible* item, because the pre-existing rows needing founder approval are never "eligible".
**The formula rewarded work the loop could finish alone, and the loop optimised into a corner where everything it
could finish alone was work about itself.**

This is not a motivation failure. It is the scoring model working exactly as written.

## 5. What improved, and it is not trivial

Verification discipline got much stronger across the window, and the record is unusually honest:

- Every gate shipped in the last ten iterations carries a **planted-probe negative control**, and several caught
  their own installation (`test:health-freshness` failed on the chain count it had just changed).
- **Baselines measured before building.** `test:content-loss` rejected four of seven candidate signatures on
  measured counts (107 / 93 / 7 / 3 legitimate uses) rather than shipping a noisy gate.
- **Published figures were withdrawn when they failed re-testing** — TRI-12 re-flagged `SYS-5-A` against the
  coordinator's own earlier result, under a rule fixed before the data existed.
- **A figure was deleted rather than corrected** when three defensible rules computed it three ways.
- Eight defect classes were registered and gated, including DC-22 and DC-23, both found by auditing rather than
  by a failure.

The loop learned to check its work. That capability is real and should be kept; it is pointed inward.

## 6. Recurring patterns worth naming

**"My instrument manufactured the defect" — 6 times on 2026-09-30 alone.** A dropped matched-pair arm, a
paraphrased verification brief, a test premise that did not fit an item class, a score regex that reported 72 of
118 failures that were its own fault, a loose regex that nearly "corrected" a true claim, and a trailing-slash
404 that briefly looked like a dead page. Rule, earned: **a tool that finds something should be suspected before
the thing it found is believed.**

**"A prose check fires on the prose explaining it" — 5 times.** Now has a general fix in two places
(`stripCitations`, `stripInlineCode`) rather than a fifth special case.

**A governance step with no gate does not happen — 3 artifacts.** DC-16 (work shipping unlogged, 3×), DC-22
(SYSTEM_HEALTH stale, 19×), and now the meta-review cadence itself (37×). Gated this iteration by
`test:meta-review-cadence`.

## 7. Recommendations

**1. The next loop must not produce another internal gate.** The highest-value agent-doable action is a
**founder decision packet** that unblocks reader-visible value, because every remaining item of real product
value is gated on approval and none has ever been presented. It should contain, with evidence: the merge-to-`main`
and deploy decision for 149 commits; Rethink Robotics; the A-2a slug pins *and* the disclosure question they
raise (8 of 12 expose contradictory composites); the 728-proposal application backlog; and D-13, whose deadline
is 2026-11-17.

**2. Propose S12 — an eligibility correction, not a new rule.** Before selecting an item that the *previous*
iteration filed, re-score the top three **pre-existing** backlog rows and record in one line why the
self-generated item outranks them. The deeper fix is to stop treating founder-gated items as ineligible: an item
that needs approval is not ineligible, it is **unasked**. Splitting it (S2) into "prepare" and "approve" makes
the preparable half eligible — which is what should have happened to A-2a around Iteration 40. *Adopting a
selection rule is a methodology change and therefore founder's to ratify; this is a proposal.*

**3. Require a CI-environment planted probe before a registry row may say "Gated."** A local probe proved nothing
about CI for DC-16 and DC-17, which were silently neutered by a shallow clone until an audit found it.

## 8. Independent review

Full text: `docs/META_REVIEW_2026-09-30_ITER28-64_INDEPENDENT.md`. Its central claim — that the loop fed on a
self-generated queue while an eligible live defect sat untouched for 37 iterations — is **verified** and is §4
above. Its ratio differs from mine for a stated reason (§2). Two of its supporting figures are **not** reproduced
here because I did not verify them: a pending-proposal count of 22→29, and `rotation-state.json`'s
`last_updated`. What I did verify is that 728 proposal files sit on disk and nothing has been applied since
2026-09-16.

---

**Bottom line.** Thirty-seven iterations built a genuinely rigorous verification culture and spent it almost
entirely on the verification culture. Meanwhile a defunct company is ranked in the second-highest band, one city
has two different scores, and 149 commits — including three corrections to published errors — have never reached
`main`. The loop did not fail. **It was never pointed at the product, and it never asked to be.**
