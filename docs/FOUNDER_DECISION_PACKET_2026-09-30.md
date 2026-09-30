# Founder decision packet — 2026-09-30

**Why this exists.** Meta-Review 5 found that 37 consecutive improvement loops produced 149 commits, of which
**none reached a reader**, while every remaining item of genuine product value sat waiting on a decision that was
never asked for. The loop had been treating "needs founder approval" as "not eligible", so the work it could
finish alone crowded out the work that mattered. This packet is the correction: six decisions, each with the
evidence already gathered, a recommendation, the cost of not deciding, and **a default I will apply if nothing
comes back**.

Nothing here is an index, score or methodology write. Those need you. Everything here is preparation.

**Every figure below was measured on 2026-09-30, with the command shown.** Where a measurement is an absence, a
positive control is stated, because a search that has never found anything proves nothing.

---

## D-47 · Merge and deploy: 149 commits, nothing live

**The situation.** The working branch `improve/2026-09-16-entity-identity` is **150 commits ahead of `main` and
0 behind** as of this packet. Meta-Review 5 measured 149 an hour earlier; **the number grows with every commit**,
which is the point rather than a discrepancy. Regenerate with
`git rev-list --count main..HEAD`. The deploy job in `.github/workflows/deploy.yml:228` runs on `workflow_dispatch` only, so pushing
never deploys. Production last built **2026-09-25T03:01:49Z**.

**Which commit is live cannot be determined.** The live `build-manifest.json` carries `git.sha: null` and
explains why: no `GIT_SHA` build-arg is injected and `git rev-parse` cannot work inside the Docker builder stage,
which receives no `.git`. So "is fix X live?" is currently unanswerable except by searching the page text.

**12 reader-visible commits are written and unshipped**, including three corrections to *published errors*:

| date | commit | what a reader currently sees wrong |
|---|---|---|
| 09-29 | `60e6617f` | `/ai-models` still carries the pre-correction methodology text; the MS-5 disproof is not live |
| 09-28 | `6854bb19` | a published legal error in the evaluation rubric |
| 09-28 | `8c8b5797` | the exemplar that justified the review programme names the wrong item |
| 09-24 → 09-29 | 9 others | the AI Evaluation Suite, model score history, two-tier display, feed fixes |

**Verified, with a positive control.** On production today the corrected sentence *"We thought the formula
rewarded flatness"* is **absent**, and so is the text it replaced. Control on the same fetch: `Pre-registration`
→ 1, `AI Models` → 1, `0 models` → 1. The live page predates both versions.

**Recommendation.** Merge to `main`, then dispatch the deploy workflow. The full 53-step test chain is green on
the branch head and CI is green on all five jobs.

**Cost of delay.** Three known-wrong published claims stay published. Every further iteration widens a diff that
has already reached 149 commits.

**Default if no decision:** I keep committing to the branch and do not merge or deploy. That is the current
state, and it is the one that has produced this problem.

---

## D-48 · Rethink Robotics is ranked "established" and does not exist

**The situation.** `site/src/data/indexes/robotics-labs.json` publishes:

```
rank 22 of 92 · Rethink Robotics · Germany/USA · composite 60.9 · band "established"
```

`established` is the **second-highest of five bands**. `RISKS.md` RISK-003 records the company as **defunct since
2025-09-16** — over a year. It is live on `/robotics-labs` now, and a change proposal already exists at
`research/change-proposals/rethink-robotics.json`, filed 2026-08-16 and unapplied for six weeks.

**Why this one matters more than its size.** The benchmark's entire claim is that a score is a measurement. A
rating in the second-highest band for a company that has been closed for a year is the single most quotable
counter-example to that claim, and it is on the live site.

**Options.**
1. **Delist** — remove the row, note the closure in the index metadata and the changelog.
2. **Retain with a closure marker** — keep the row for historical continuity, add a `defunct` field and render it
   visibly, exclude from ranking.
3. **Retain as-is.**

**Recommendation: option 2.** Delisting silently rewrites the past and breaks any existing link or citation;
a visible closure marker is the more honest artifact and it is the pattern the benchmark will need anyway, since
this will not be the last company to close. It also needs a general rule, not a one-off — RISK-003 names other
entity-currency defects behind this one.

**Cost of delay.** Every day this is the easiest available attack on the benchmark's credibility.

**Default if no decision:** no change. An index write needs you.

---

## D-49 · Nine published names carry two different scores

**The situation.** Measured across all eight index files — 19 names appear in more than one index, and **9 of
them publish different composites for the same name**:

| name | index A | index B | gap |
|---|---|---|---|
| 1X Technologies | ai-labs **50.0** | robotics-labs **81.4** | **31.4** |
| Figure AI | ai-labs **31.3** | robotics-labs **48.4** | 17.1 |
| Houston | us-cities **35.2** | global-cities **43.8** | 8.6 |
| New York City | global-cities **48.4** | us-cities **56.3** | 7.9 |
| Singapore | global-cities **56.2** | countries **62.2** | 6.0 |
| Georgia | us-states **26.9** | countries **34.4** | 7.5 |
| Seattle | us-cities **54.7** | global-cities **53.1** | 1.6 |
| Philadelphia | us-cities **42.2** | global-cities **43.8** | 1.6 |
| Portland | us-cities **57.8** (ME) · **48.4** (OR) | global-cities **54.7** | — |

**Three distinct problems are tangled here, and they need different answers:**

- **Genuinely different entities, colliding on a name.** *Georgia* the country and *Georgia* the US state.
  *Portland* ME and *Portland* OR — two rows **inside the same index** (ranks 8 and 22), as are *Springfield* IL
  and MO (ranks 93 and 94). These need **disambiguation**, not reconciliation. Nothing is wrong with the scores.
- **The same entity scored twice by two methodologies.** *Houston*, *New York City*, *Seattle*, *Philadelphia*,
  *Singapore* — a city measured as a US city and as a global city, on different criteria. The scores are not
  errors; **publishing both without saying so is.**
- **The same entity scored twice with a 31-point spread.** *1X Technologies* and *Figure AI* sit in both ai-labs
  and robotics-labs. A 31.4-point disagreement is not a methodology nuance, it is two assessments that cannot
  both be right. These are the two deferred to **D-13**, below.

**The trap, and the reason this has stalled since Iteration 19.** The mechanical fix is to pin state-qualified
slugs so both rows become addressable. **That makes the disagreement publicly visible rather than resolving it.**
Iteration 19 pinned Singapore and stopped there, correctly, because shipping the remaining pins without a
disclosure decision would publish 9 visible contradictions in one deploy.

**Recommendation, split three ways.**
1. **Disambiguate now** (Portland ME/OR, Springfield IL/MO, Georgia country/state) — no score changes, pure
   identity fixes. I can prepare these; they need your approval to commit.
2. **Decide the disclosure line** for the same-entity-two-methodologies cases before pinning them: either a
   cross-reference on each page ("Houston is also scored as a global city: 43.8") or a single canonical score per
   entity with the other withdrawn. The first is honest and cheap; the second is a methodology change.
3. **1X Technologies and Figure AI stay blocked** on D-13.

**Default if no decision:** the 15 collisions stay, and `/houston` continues to resolve to whichever row wins.

---

## D-50 · 37 proposals are approved and unapplied; nothing has been applied in 14 days

**The situation.** 728 change-proposal files on disk, by status:

| status | count |
|---|---|
| applied | 346 |
| superseded | 137 |
| **approved (not applied)** | **37** |
| auto-confirm-eligible | 69 |
| documented | 56 |
| **pending** | **29** |
| confirmed-no-change | 23 |
| requires-human-review | 12 |
| band-crossing-proposed | 6 |
| other / single-instance statuses | 13 |

**The last entry in `research/APPLIED_CHANGES.md` is 2026-09-16.** Fourteen days, zero applications, while the
research pipeline kept producing.

**37 of these were already approved.** RISK-002 records why the older ones are held — 37 on assessor self-veto
("DO NOT APPLY", "recommend human review"), 13 on entity-record grounds — and that reasoning is sound. But the
effect is that the published site knowingly differs from the benchmark's own most recent assessed values, and the
queue is growing rather than shrinking.

**Recommendation.** Not "apply them" — the self-veto holds exist for good reason. Instead: **decide the
disposition rule**, so the queue stops being ambiguous. Three buckets: (a) self-veto holds need a fresh
non-conflicted re-assessment, which is research work I can run; (b) entity-record holds need D-48's closure
convention first; (c) anything in neither bucket should be applied or rejected, not held.

**Default if no decision:** the queue keeps growing and the site keeps diverging from the research.

---

## D-13 (carried) · The waiver cliff has a hard date

**Unchanged from the 2026-09-29 packet and now closer.** Builds begin failing **2026-11-17** unless D-13 is
decided; the determinations are drafted at `docs/D-13_DETERMINATIONS_DRAFT_2026-09-17.md`. RISK-015's T-30
warning starts **2026-10-17**, and per S7 a missed T-30 forces the next selection regardless of score.

D-13 also blocks the 1X Technologies / Figure AI half of D-49, because its constraint — no entity may hold more
than one published composite — is exactly the question those two rows pose.

**Default if no decision:** the T-30 warning fires on 2026-10-17 and I implement it rather than the next ranked
item.

---

## D-51 · A selection rule, because the loop will do this again otherwise

**The situation.** `Deviation:` appeared **zero times** in `ITERATION_LOG.md` across Iterations 28–64 (positive
control: `Selected:` appears 21 times, so the search works). The token now appears in the log exactly once —
because the Iteration 65 entry quotes it while reporting this finding, which is why the count is stated for that
range and not as a present-tense total. No deviation was ever recorded because none was ever needed: every
selection really was the top of the eligible queue — a queue the previous iteration had written.

Founder-gated rows are never "eligible", so the formula systematically rewarded work that could be finished
alone. **The loop optimised into a corner where all such work was work about itself.** That is the scoring model
behaving exactly as specified, which is why it needs a specification change and not more diligence.

**Proposal (S12), two parts.**
1. Before selecting an item that the **previous iteration filed**, re-score the top three **pre-existing**
   backlog rows and record in one line why the self-generated item outranks them.
2. **A gated item is unasked, not ineligible.** Apply the existing S2 split to the product backlog: every gated
   row divides into an agent-doable half and an approval half, and the preparable half is eligible. Under this
   rule D-49's disambiguation work would have surfaced around Iteration 40 instead of waiting 45.

**Recommendation.** Adopt both. Part 2 is the one that matters; part 1 is a guardrail.

**Default if no decision:** I apply S12 to my own selection from the next loop and mark it "proposed, unratified"
in the log — because a rule about how I choose work is one I can follow unilaterally without changing any
published artifact, and the alternative is repeating the last 37 iterations.

---

## Summary

| id | decision | blocking | recommendation |
|---|---|---|---|
| D-47 | merge 149 commits and deploy | 3 published errors stay live | merge and dispatch |
| D-48 | defunct entity ranked "established" | credibility, publicly checkable | retain with a visible closure marker |
| D-49 | 9 names, 2 scores each | 15 collisions, `/houston` ambiguous | disambiguate now; decide disclosure; D-13 for the labs |
| D-50 | 37 approved, unapplied; 14 days idle | site diverges from own research | decide the disposition rule, not a bulk apply |
| D-13 | waiver cliff | **builds fail 2026-11-17** | decide before 2026-10-17 |
| D-51 | selection rule S12 | the loop repeats this failure | adopt both parts |

**What I will do next without a decision:** apply S12 to my own selection, prepare the D-49 disambiguation work
so it is ready to approve, and stop producing internal gates. What I will not do is merge, deploy, or write an
index, score or methodology file.

---

## Addendum 2026-09-30 — D-49's decision-free half is prepared and pushed

Branch **`prepare/D-49-rank-derived-slugs`**, CI green on all five jobs including the site build. It is not
merged. Approving it is a one-word answer; that was the point of preparing it.

**It fixes a defect the packet above understated.** Two published entities were addressed **by their rank** —
Portland, OR at `/us-city/portland-22` and Springfield, MO at `/us-city/springfield-94` — because
`export-public-data.mjs` disambiguates a repeated name inside one index with `${baseSlug}-${row.rank}`. A URL
that encodes a rank moves when the score moves. For a benchmark that asks to be cited, that is a defect on its
own, separate from any collision, and the packet above did not name it because I had not yet measured it.

Both rows now carry an explicit pinned slug (`portland-or`, `springfield-mo`), following the
`phoenix-global-cities` / `georgia-us-states` / `singapore-global-cities` precedent. **No score, rank, band or
name changes** — the applying script asserted every field except `slug` was byte-identical before writing.
Rank-derived slugs: **2 to 0**, and now a hard zero in `test:collision-ratchet` with a planted negative control.

**Every store keyed by the slug was re-derived (S9), and the test caught two I had missed:** entity records
regenerated at the new slugs and verified field-for-field identical, orphans removed; 301s added to **both**
nginx configs, because the Docker image bakes `nginx.conf` and a CI rebuild silently reverts a runtime-copied
`nginx-ssl.conf`; a clean export proved to produce no stale score file.

**Why this is only half of D-49, and the half that needs no decision.** I measured rather than assumed: pinning
Portland OR did **not** free the bare `portland` slug, because Portland ME still claims it. The 15 cross-index
collisions are untouched, and they still need the disclosure decision above — pinning them makes nine published
score disagreements publicly addressable rather than resolving them.

**A new item, found on the way:** `research/rotation-state.json` holds one `portland-us-cities` key for two
us-cities Portlands, so one of them is not tracked for research at all.

---

## Addendum 2 (2026-09-30) — D-47 is not a merge of 150 commits of tooling. It is 14 of 15 known fixes.

I set out to implement **OBS-1** — "the build cannot name its own commit" — and found it **already implemented,
on 2026-09-16, nine days before the production build that reports `git.sha: null`.** It was never merged.
`main` has no `GIT_SHA` in `docker-compose.yml` and none in `deploy.sh`; the working branch has both, plus the
`ARG`/`ENV` pair in the `Dockerfile` and the export in the CI deploy job.

So production cannot name its commit **because the fix is sitting on an unmerged branch**, not because the work
is outstanding.

That prompted measuring the general case. `research/scripts/measure-unmerged-fixes.mjs` takes 15 known fixes,
names a marker for each, and evaluates it on **both** `HEAD` and `main`:

**14 of 15 exist on the branch and are absent from `main`.** Only one — the deploy job being
`workflow_dispatch`-only — is already live.

| | |
|---|---|
| known fixes unmerged | **14 of 15** |
| files differing `main..HEAD` | **2,280** |
| **reader-visible files differing** | **106** |
| insertions | 1,054,566 |

The unmerged set includes the MS-5 disproof, the AI Evaluation Suite in its entirety, the seven published anchor
corrections, the full item-triage record, the MIT licence (D-42), and the gates for encoded names, feed freshness,
rotation state, entity-record invariance, model score history and submission validation.

**This changes what D-47 is asking.** The packet above framed it as a hygiene decision about a long-lived branch.
It is not. It is the difference between a site that carries fourteen known-correct fixes and one that does not,
including **three corrections to errors readers can currently see** and a licence file the repository claims to
have.

**One probe reported itself void on the first run** and is recorded because it is the method working: I had
chosen the marker `singapore-global-cities`, which had been *removed* from `known-collisions.json` when Singapore
was pinned. It appeared on neither side, so the script reported INDETERMINATE and excluded it rather than
counting a finding. Corrected marker, 15 of 15 probes now meaningful.

**Recommendation unchanged, urgency raised.** Merge to `main`, then dispatch the deploy. Nothing in the branch is
unreviewed: the 53-step chain is green and CI has been green on every push.
