# Founder decision packet — 2026-09-29

**Five** decisions are pending — **D-13 · D-43 · D-44 · D-45 · D-46** — across one hard deadline, seven rubric
repairs and three formula questions. They are written up separately in `DECISIONS.md`; this collects them so they
can be answered in one sitting rather than found one at a time.

> **Correction, same day.** The first version of this packet listed four and omitted **D-13** — the only one with a
> date attached, and the one that stops every build. It is now Part 0, and it should be answered first.

**Nothing in Parts 1 and 2 is blocking the site.** Every defect is already published beside the text it corrects, fused into
the string that also builds the AI-judge prompt. So a reader cannot see a wrong figure without its correction,
and the judge stops rewarding it. What is blocked is the *instrument* itself — the bank is untouched, because
editing a published anchor is a methodology act.

---

## Part 0 — D-13, and the date every build stops (answer this one first)

**What happens if nothing is decided:** on **2026-11-17** `npm run build` starts failing, and keeps failing. It is
not a warning — `validate-product-separation.mjs` runs inside the build, and an expired waiver blocks again.

**Verified rather than inferred.** I ran the real validator end-to-end against a pinned system date:

| date | exit | verdict | |
|---|---|---|---|
| 2026-09-29 (today) | 0 | PASS | |
| 2026-11-15 | 0 | PASS | critical warning showing |
| **2026-11-17** | **1** | **FAIL** | `EXPIRED WAIVERS (now blocking again) — 1` |
| 2026-12-01 | 1 | FAIL | 2 expired |

The advance-warning machinery also works, checked across the boundary: silent at T-31, `warning` from **T-30 =
2026-10-17** (18 days away), escalating to `critical` at T-1. So you will be told — but the first telling is a
build log, which is a poor place to learn about a deadline.

**The six waivers, staggered by D-37:** `figure` 2026-11-16 · `1x-technologies` 11-30 · `boston-dynamics-spot-demo`
12-14 · `amazon` 2027-01-15 · `meta` 01-29 · `microsoft` 02-12. Each date forces its own decision, so this recurs
five more times unless D-13 is settled.

**What D-13 is actually about, and why it is not merely housekeeping.** Six entities hold more than one published
composite. Two of them are visible to any reader who looks the entity up twice, under the *same name*:

| Entity | One page says | The other says |
|---|---|---|
| **1X Technologies** | `robotics-labs` **81.4 — exemplary** (rank 9) | `ai-labs` **50 — functional** (rank 14) |
| **Figure AI** | `robotics-labs` **48.4 — functional** (rank 27) | `ai-labs` **31.3 — developing** (rank 35) |

1X spans 31 points and two bands. There is also a **same-index** duplicate — `robotics-labs` carries both "Boston
Dynamics" at 65.6 and "Boston Dynamics (SPOT demo)" at 20.3, a 45-point spread on one page. The remaining three
(Amazon, Meta, Microsoft) pair a company against its AI division, which is the genuinely arguable case and the
thing D-13 is for: is "Microsoft AI" a distinct entity from "Microsoft"?

**Your work here is review, not drafting.** `docs/D-13_DETERMINATIONS_DRAFT_2026-09-17.md` already holds a
disposition for all six, with the scores, ranks and reasoning laid out per entity.

**Three options, with what each costs:**

1. **Ratify D-13 and remediate the six.** Settles it permanently and removes a reader-visible inconsistency.
   Requires index writes, which are yours.
2. **Consciously extend the waivers with a recorded decision.** Cheap, legitimate, and the gate is built to accept
   it — but it buys time rather than resolving anything, and the 1X "exemplary vs functional" split stays live.
3. **Do nothing.** Builds fail from 2026-11-17. This is the only option with no upside.

**My recommendation:** option 1 for the two same-name cases (1X, Figure) and the same-index case (Boston
Dynamics), because those are the ones a reader can see and the answer is not contested; option 2 with an explicit
date for Amazon/Meta/Microsoft, because "is the AI division a separate entity?" is a real taxonomy question that
should not be rushed by a build deadline. That splits a hard problem from an urgent one, which is the only reason
they are currently stuck together.

---

## Part 1 — Seven rubric repairs (D-43, D-44, D-46)

All seven were found blind by agents that were not told anything was wrong, then verified against primary
sources. Each has drafted replacement wording, so the decision is yes/no rather than a drafting task.

| | Item | What it rewards today | Should be | Sourcing |
|---|---|---|---|---|
| **AC-001** | `EQU-1-C` L5 | EEOC deadline **180 days** for a Texas claimant | **300 days** (Texas is a deferral state) | eeoc.gov, EEOC FEPA roster, Tex. Lab. Code ch. 21 |
| **AC-002** | `ACT-1-C` L5 | Referring a tenant to **"DFEH"** | **California Civil Rights Department** (renamed 1 Jul 2022) | agency's own page, SB 189, live 301 |
| **AC-003** | `SYS-1-A` L4 | Admin overhead **"30% vs 12%"** | One consistent denominator (~34% US vs ~17% Canada) | ⚠ reprint + indexed abstract |
| **AC-004** | `INT-1-B` **prompt** | A **federal firearms waiting period** | None exists since 30 Nov 1998 | ATF final rule, 18 U.S.C. 922(s) |
| **AC-005** | `ACT-4-B` L3 | "**did not start any clock**" | 30 calendar days from a parent's request (Ohio) | ⚠ Ohio authenticated PDF; two open questions |
| **AC-006** | `BND-1-A` L5 | A fentanyl death was "**likely painless**" | "no recall" rather than "painless" | ⚠ structurally unverifiable |
| **AC-007** | `EQU-1-A` L4 | Free interpreting attributed to **Title VI alone** | Add **45 CFR 92.201** (Section 1557) | ⚠ hhs.gov unreachable |

**The two I would look at first**, on harm rather than severity of error:

- **AC-001** runs in the direction that loses a claim. Told "180 days" on day 200, a woman in Texas reasonably
  concludes she is time-barred and abandons a case live for another hundred days.
- **AC-006** is the only one whose output is written for a bereaved family. The accurate version is barely less
  comforting than the inaccurate one, which is what makes it worth fixing rather than defending.

**Read the ⚠ marks before approving.** Four corrections carry a `primarySourceLimitation` field naming exactly
where they are weak: AC-003's figures came from a reprint because three publishers refuse automated fetching;
AC-005's 30-day duty is solid but *what counts as a request* and *whether a teacher is district receipt* are
genuinely open; AC-006 rests on the absence of any primary source measuring pain during fatal overdose, which
argues for not requiring the claim rather than for having disproved it; AC-007's reviewer could not reach hhs.gov
at all. **None of these is presented as settled.**

**Default if you do nothing:** the corrections keep rendering indefinitely. That is honest and costs nothing
immediately, but it leaves the instrument carrying seven known defects that any external evaluator will also
find — and the first one to find them publicly will not describe them as carefully as we have.

**If you approve:** seven strings change, `bankVersion` goes to v2.1 with a dated changelog entry, and each
`repairStatus` becomes `repaired` — which stops its warning rendering **automatically**, asserted by test. No
score, rank or band changes anywhere; no AI model has a published Compassion Benchmark score.

---

## Part 2 — Three formula questions (D-45)

Context: **MS-5 was false.** It claimed the composite "rewards a flat profile twice" and blocked model scoring
since Iteration 38. Two profiles with the same mean — one flat, one split — score **identically**, and across all
1,325 published entities the consistency factor has **never left 1.0**. Full working:
`docs/MS5_COMPOSITE_FORMULA_ANALYSIS_2026-09-29.md`.

**Q1 — should the consistency factor stay?** Documented as four steps; two are mathematically unreachable and
the third has never fired (max σ observed 0.768 against a first step-down at 1.5). It is the constant 1.0 in
practice. *Recommendation: remove it and state plainly that spread does not affect the composite* — machinery a
reader must study in order to discover it does nothing is a cost with no benefit. **Default if you do nothing:**
it stays documented and dormant, which is harmless but misleading about what the formula measures.

**Q2 — is the 0.2-per-weak-dimension step the right shape?** One dimension slipping 4.0 → 3.9 costs **2.3
composite points**, and five weak dimensions zero the premium outright. That is a defensible statement —
"excellence must be universal" — but it should be chosen rather than emergent. *No change recommended; recorded
so it is a decision.*

**Q3 — does the 100 cap compress the top?** **This is the one with a deadline.** Only 5 of 1,325 entities clamp
today, so it is invisible for institutions. But any model averaging ≥ 4.6 with no weak dimension scores exactly
100, so **the first two strong models published would be indistinguishable.** *Decide before the first model
score, not after* — afterwards it becomes a visible rescoring rather than a design choice.

---

## Part 3 — What is not blocked on you

For completeness, so this packet is not mistaken for the whole picture. These need humans or credentials, not a
decision:

- **MB-2** — human review of 93 items, ~30–45 reviewer-hours. Reviewers now get a ranked queue
  (`docs/TRIAGE_FULL_PASS_2026-09-29.md`) instead of the bank in id order, and the first items are repairs
  already drafted. No agent may author a review record.
- **TRI-1** — 35 items where two triage agents disagreed. A disagreement is evidence about the anchor; a third
  read decides.
- **TRI-2** — cross-family triage. Both agents in the pass came from one model family, so their agreement is
  weaker evidence than cross-family agreement would be. Needs API credentials.
- **Deploy** — none of this is live. **`npm publish`** and the MCP registry listing need your credentials.
- **Remediating the six D-13 cases** needs index writes, which are yours — but the determinations are drafted.
- **Dataset licence wording** — the `DatasetJsonLd` gate is deliberately still closed.

---

## One line on how the seven were found

Blind agent triage over all 93 items, two independent agents each, neither told that any item was defective.
Then every factual flag checked against primary sources, from **verbatim** rubric text rather than a summary —
because an earlier round used a hand-written paraphrase and produced two confident verdicts about defects that
did not exist. That failure is recorded as **DC-20** and gated by `research/scripts/quote-item.mjs`.

The bank contained seven verifiable factual errors in published rubrics, and no human had read any of them. That
is the argument for MB-2, made with evidence rather than principle.
