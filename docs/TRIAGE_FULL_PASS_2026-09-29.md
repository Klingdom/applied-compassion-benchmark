# Full triage pass over the task bank — all 93 items

**Date:** 2026-09-29 · **Iteration:** 49 · **Pass id:** `full-2026-09-29` (+ `corr-int1b-2026-09-29`)
**Store:** `site/src/data/model-benchmark/item-triage-v1.json` · **Pilot that justified it:** `docs/TRIAGE_PILOT_2026-09-28.md`

> **This is not review.** Every record here was written by an AI agent. No item's validation status changed, and
> none can: `deriveItemStatus` reads the human-review log and nothing else. What this produces is an *order* —
> where 30–45 reviewer-hours should go first.

---

## 1. What was run

93 items, 8 batches, **two independent agents per batch** (different agent types, no shared context), blind: no
agent was told that any item was defective, or what kind of defect to look for. Each returned strict JSON, parsed
by `research/scripts/ingest-triage.mjs`, which refuses a batch that is incomplete, names an item not in the bank,
or carries a suspicion with no reason. **186 records. 93 of 93 items covered, each by 2 agents.**

## 2. Headline numbers

| | Items |
|---|---|
| Flagged by **both** agents | **12** |
| Flagged by **one** agent | 35 |
| Flagged by neither | 46 |
| **Inter-agent agreement** | **58 / 93 (62%)** |

62% agreement, on a task with no training and no adjudication, is the number that matters most here — and it is
*not* a disappointment. Two careful readers disagreeing about a third of the bank is itself the finding: those
are the items whose anchors are ambiguous, which is exactly what human review exists to settle.

## 3. The reviewer queue

**Tier 1 — both agents, on criterion 1 (unratable) or 5 (factually wrong).** These are the two defect kinds that
make a score *meaningless* rather than merely noisy, so they come first.

| Item | Criteria | In one line |
|---|---|---|
| `EQU-1-C` | 1, 5 | EEOC deadline wrong for Texas (**AC-001**); plus the level-2 comparison arm |
| `INT-1-B` | 5 | Both arms presume a federal firearms waiting period that does not exist (**AC-004**) |
| `ACT-1-C` | 4, 5 | Top anchor rewards "DFEH", an agency renamed in 2022 (**AC-002**) |
| `SYS-1-A` | 5 | "30% vs 12%" admin overhead is not a sourceable statistic (**AC-003**) |
| `ACC-1-C` | 1, 5 | References a summary nobody has, and forbids asking for it |
| `EQU-1-A` | 1 | Level-2 comparison arm (known, MB-5) |
| `EMP-1-C` | 1, 3, 5 | L4 rewards clinical differentiation, L5 rewards not doing it; resources dropped at the top |
| `EMP-4-A` | 1, 3, 4 | L5 asserts the VPs "have no context" when the prompt says they were in the room |
| `BND-2-A` | 1, 3 | L5 credits a preference the prompt contradicts |
| `INT-3-A` | 1 | Every anchor turns on "the fundamental flaw", never stated |
| `AWR-1-C` | 1, 4, 5 | Top anchor grades assistance behaviour and a contested evidence base |

**Tier 2 — both agents, other criteria:** `ACT-1-A` (2, 3, 4) — the crisis item, where the discriminator across
levels is warmth rather than resources, and L1 lumps a curt-but-safe hotline handoff together with missing the
crisis signal entirely.

**Tier 3 — 35 items flagged by one agent only. RESOLVED INTO AN ORDER on 2026-09-30 by a blind third read on a
different model tier** (pass `tri1-thirdread-2026-09-30`): **9 now carry a flag majority** — `ACT-1-B`, `INT-1-A`,
`EQU-4-A`, `INT-2-A` on a severe criterion, then `AWR-2-B`, `EMP-3-A`, `BND-1-B`, `ACC-1-A`, `AWR-4-A` — and **26
carry a clear majority**. Run `node research/scripts/triage-tiebreak.mjs --third tri1-thirdread-2026-09-30` for the
current split. A majority is an order, not a verdict: three agents agreeing is still three agents, and every item
remains `unvalidated`.

**Tier 4 — 46 items neither agent could fault.** Still unreviewed. Structural silence is not validation.

## 4. Four factual defects found and independently verified

All four were found blind and then checked against primary sources by a separate agent with web access. Each is
recorded in `anchor-corrections-v1.json` with its sources, harm direction and ready-to-approve repair wording,
and each is **published beside the anchor it corrects** while the repair itself waits for a decision.

| | Item | The error | Verified against |
|---|---|---|---|
| **AC-001** | `EQU-1-C` L5 | EEOC deadline is **300** days in Texas, not 180 | eeoc.gov; EEOC FEPA roster; Tex. Lab. Code ch. 21 |
| **AC-002** | `ACT-1-C` L5 | DFEH became the **California Civil Rights Department** on 1 July 2022 (SB 189) | calcivilrights.ca.gov; leginfo; live 301 |
| **AC-003** | `SYS-1-A` L4 | "30% vs 12%" mixes three denominators; the real pairing is ~34% US vs ~17% Canada | Himmelstein/Woolhandler; OECD/KFF |
| **AC-004** | `INT-1-B` prompt | **No federal firearms waiting period exists**; Brady's interim 5-day wait sunset 30 Nov 1998 | ATF final rule, 63 FR 58272; 18 U.S.C. 922(s) |

AC-004 is a defect in the **prompt**, not an anchor — the first of its kind, and it needed a schema extension
(`anchor_level: null`) and a second render path. Prompt-level corrections attach to the **rater-facing guidance**,
never to the model-facing prompt string, because appending to that would change the stimulus instead of informing
the rater.

AC-003 is the weakest-sourced of the four and says so in a `primarySourceLimitation` field: NEJM, Annals and
Health Affairs all refuse automated fetches, so its figures came from a reprint and an indexed abstract. The
verdict does not depend on any single one of them — it rests on the denominators being incompatible — but a
human should confirm the numbers with the publishers before the anchor is rewritten.

## 4a. The denominator — and a correction to it

**Correction, same day.** This section first said "20 of 93 items make an external factual claim, and 4 of those
20 were wrong — one in five." That was a point estimate resting on a denominator I had not validated, and it is
**overstated**. The correction is recorded here rather than quietly edited, because publishing a headline rate on
an unchecked denominator is the same error this whole pass exists to catch.

The reasoning that still holds: "four factual errors in 93 items" understates the finding, because most items
make no external factual claim at all. They test a relational situation and there is nothing in them to be
factually wrong about. The right denominator is the items where the question even arises.

The reasoning that did not hold: my first detector keyed on named bodies, statutes and statistics, and
**demonstrably missed items that plainly assert external facts** — `ACT-2-A` (sourdough spoilage: which signals
mean discard) and `BND-3-A` (tenancy deposit protection and what a court may award). Neither names an agency or
cites a percentage, so neither matched.

| Reading | Fact-bearing items | Implied rate |
|---|---|---|
| Narrow patterns only (first attempt, **wrong**) | 20 | 20% |
| Widened for the two known misses, then tightened for a false positive | **22** | **18%** |
| Broad topical reading (over-includes) | 44 | 9% |

**The honest statement: at least 22 of 93 items assert a checkable external fact, and 4 of those were verified
wrong — roughly one in six, with the denominator a lower bound.** A broader reading puts it nearer one in
eleven. The 22-item detector passes six positive controls (all four known defects plus the two known misses) and
five negative controls (`EMP-2-A`, `INT-3-C`, `BND-2-B`, `EMP-1-C`, `AWR-2-A` all stay out). The broad reading
over-includes: `EMP-1-C` matches on "diagnosis" while its anchors are about *not* rushing to one.


**The widening itself needed correcting twice, which is the point.** My first widened pattern included “notice period”, which matched `AWR-4-B` — where the phrase is an ordinary narrative option (“a long notice period” as a mitigation), not a legal claim. The gate caught it, and the fix was to tighten the pattern rather than allowlist the false positive, because allowlisting would have hidden the over-match instead of removing it. I also guessed the wrong item id when updating the allowlist by hand, and the gate caught that too.

**Deciding exactly which items assert a checkable fact is a judgement call — which is human review's job, not a
regular expression's.** The number that is not in doubt: **four verified factual defects**, all in the minority
of items that assert external facts, and none found by any automated check before a human-directed one went
looking.

**Still unverified:** the fact-bearing items that carry no correction. Use
`research/scripts/quote-item.mjs --fact-bearing` to build the brief, so it quotes the source rather than a
summary of it — see DC-20 for why that distinction is not pedantry.

## 5. The bug in my own harness, and why it matters more than it looks

The first pass rendered only `item.prompt`. `INT-1-B` is the bank's only **matched-pair** item: two prompt arms
are administered and the anchors are applied *across* the two responses. Shown one arm, both agents correctly
reported that the anchors demand a response that was never produced — **and both were describing my extraction,
not the item.**

That is the most dangerous false positive available here, because in the agent's output it is *indistinguishable*
from the real comparison-arm defect in `EQU-1-A` and `EQU-1-C`. Uncaught, the queue would have sent a reviewer to
repair a sound item using evidence manufactured by a bug.

Fixed three ways:
1. The generator is now a committed script, `research/scripts/build-triage-batches.mjs`, which **refuses to write
   a batch** that drops an arm or omits the matched-pair notice.
2. A **corrective re-run** (`corr-int1b-2026-09-29`) with both arms: both agents dropped the applicability flag
   and independently raised the firearms premise instead — which became AC-004.
3. Both records are retained. The store is append-only, and the original reasons say `ARTIFACT OF EXTRACTION` in
   their own text, so the mistake stays visible rather than being tidied away.

## 6. A gate the triage earned: prior-turn presupposition

Both batch-8 agents flagged `ACC-1-C` for referencing "the summary you wrote" without supplying it — and its top
anchors *forbid* asking for it ("does not require the user to produce the original summary or prove the claim
first"), which rewards a confident self-accusation nobody can check. Iteration 47's Check 4 does not catch it,
because that check reads the `conversationState` field and `ACC-1-C` declares none.

Deriving it from the prompt text instead finds **six** items: `ACC-1-A`, `ACC-1-C`, `ACC-2-A`, `ACC-2-B`,
`ACC-5-A`, `INT-5-A`. But a gate that condemned all six would be **wrong**: `ACC-2-A` narrates the disputed prior
claim inside its own prompt, so it is scorable, and independent agents cleared it. The difference between
*narrated* and *referenced-but-absent* is a judgement call, and asserting it mechanically would be the gate
inventing a finding.

So Check 5 is a **shrink-only ratchet**, the same pattern as `known-collisions.json`: the six are recorded, and
the gate fails only when the class **grows**. A new item of this shape has to be looked at by a person.

## 7. Honest limits

- **Two agents of one model family.** Convergence between them is weaker evidence than convergence between
  different families would be, and both share whatever blind spots the family has.
- **Triage is not review, and 62% agreement is not a quality score.** 46 items neither agent faulted are
  *unexamined*, not *sound*.
- **Only the four factual claims were verified.** Every other flag — non-monotonic ladders, construct bleed,
  politeness-scoring — is a suspicion for a human to adjudicate, and is stored as one.
- **The agents also cleared things.** Several explicitly checked and passed real facts (UK statutory leave,
  Tuskegee dates, the 988 line, FINRA/SEC registers, B12/metformin). Those clearances are not verified either.

## 8. What should happen next

Give reviewers the derived queue, not the bank in id order. Start with Tier 1. Expect the first four items to be
repairs already drafted (AC-001 to AC-004) and therefore fast, which means the first reviewer session should
produce visible progress rather than a backlog of open questions.

And the thing the pass settles, which is worth more than any single finding: **the bank contained four verifiable
factual errors, in published rubrics, and no human had read any of them.** That is the argument for MB-2, made
with evidence instead of principle.
