# Meta-Review 2 — Improvement Loop, Iterations 13–15 (2026-09-16)

**Reviewer:** independent meta-reviewer, read-only.
**Scope:** selection, verification and orchestration of Iterations 13, 14 and 15, the founder-approved
remediation batch of 2026-09-16, the 2026-09-15 governance pass and research preflight, and Meta-review 1's
own record.
**Mode:** no existing file was edited; no commit, push or deploy. This document is the only new file.
**Builds on:** `docs/META_REVIEW_2026-09-14_ITER10-12.md` (§5.2 scoring model v2, §6 rules S1–S7,
§7.1 checklist V1–V7, §7.3 metrics, §8 shortlist). The question this review had to answer is whether those
rules changed behaviour or were merely written down.

---

## 0. What I verified myself (not taken from the log)

Everything asserted below with a ✔ was re-run or re-fetched by me on 2026-09-16, because a review that
re-reads the coordinator's own report is the failure mode this review exists to catch (V2).

| Check | Result |
|---|---|
| `npm run test` full chain, from a clean working tree | ✔ exit 0; **23 steps** (not the 22 `SYSTEM_HEALTH.md` claims) |
| `test:method-claims`, `test:collision-ratchet`, `test:encoded-names` run individually | ✔ 33/0, 19/0, 9/0 |
| `gh run list` | ✔ four `Deploy to VPS` runs on 2026-09-16 (35112334235, 35114744386, 35118662309, 35122189972), all `success`; 12 consecutive successes listed, none failed |
| `git rev-parse HEAD` | ✔ `e678a2f8`, matching the log |
| Live `/methodology` | ✔ the σ-ceiling disclosure is live; `90/40` occurs **0** times; the corrected both-directions wording is live and matches `page.tsx:1294` |
| Live `/methodology` coverage sentence | ✔ renders "**811** of **1329** entities … (**61.0%**)" — the unformatted total is live, as logged |
| Live `/score-watch` | ✔ **0** Gumroad links; pause disclosed; the Step-2 copy is correctly conditional (`page.tsx:176–193`) and renders the paused branch |
| Live `/data/scores/singapore.json` | ✔ `"indexSlug": "global-cities"` — **the country is still not served; the city is**, `updatedAt` 2026-09-16T16:31 |
| Live `/build-manifest.json` | ✔ `git.sha: "unknown"`, `git.branch: "unknown"` — the deployed artifact cannot say which commit it is |
| `git status --short` | ✔ **24** paths, **0** attributable to any pending iteration |
| Proposal queue, counted from the directory | ✔ 37 `approved` + 20 `pending` — unchanged from Meta-review 1 |
| `RISKS.md` entry count | ✔ 18 (`SYSTEM_HEALTH.md` says 17, "all open") |
| Search for any claim-to-source gate (DC-04) | ✔ none exists; `lint-rules.mjs` carries `FORBIDDEN_PHRASES`, forbidden status/pipeline keys and the It. 13 movement rule only |
| `build-special-briefings.mjs:474` | ✔ still `generatedAt: new Date().toISOString()`; a sampled churn diff is **timestamp-only** (1 line) |
| ITERATION_LOG "commit pathspec" lines | ✔ present for It. 13 and the governance pass; **absent for It. 14 and It. 15** |

**Two of my own checks produced false readings before I corrected them**, and I record that deliberately
because it is the subject of §2: a `grep -c "out-earn a spiky"` on live `/methodology` returned 1 and looked
like a surviving false claim (it is the *corrected* sentence), and a `grep -o ".\{200\}79/yr.\{200\}"` on
`/score-watch` truncated mid-sentence and looked like the stale Subscribe instruction had survived (it had
not). In both cases the conclusion only became safe once I pulled full context. Three independent operators
— the coordinator twice, me twice — hit the same class inside 48 hours. That is not carelessness; it is a
missing rule.

---

## 1. Verdict — **Amber, clearly improving**

Selection is fixed. Iterations 13, 14 and 15 were each the top eligible v2 item, each reduced a High risk,
each installed a mechanical gate for a recurring class, and all three are deployed and verified live — an
unambiguous correction of Meta-review 1's central finding (3/3 site-copy, 0/3 pipeline, 3/3 below the top
item). S4 and S6 demonstrably *bound*: S4 is the stated reason It. 15 exists at all, and S6 blocked
implementation twice in writing. The founder answered nine of eleven packet items in one instruction, which
cleared the gate backlog Meta-review 1 could not clear. What keeps this Amber rather than Green is not the
selection layer: it is that **verification is still self-designed and self-graded** — two checks returned
false all-clears, and both were only caught by luck or by a later verification pass; that **the coordinator
caused two defects in one session** (DC-10 duplicate keys, history orphaning) and caught neither itself; that
**DC-04 — briefing claims contradicting their sources, the one class that publishes under the benchmark's
name every single cycle — is still ungated with no dated waiver**, which is a live violation of the loop's
own rule S4 after a cycle that needed 12 coordinator corrections; and that the loop has begun to **prefer
building gates over removing live defects**, which the v2 rubric actively rewards (Rc +2 for a gate, P +1 for
a live error). I verified that `/data/scores/singapore.json` still serves the city to anyone consuming the
benchmark's data. Iteration 14 froze that defect rather than fixing it, and entered no backlog row for the
remediation.

---

## 2. Findings

### F1 — v2 and S1–S7 changed selection. They did not merely describe it. (Q1)

**The selections were genuinely top-of-queue, and the queue was genuinely followed.**

| It. | Item | v1 | v2 | Alternatives recorded | Top eligible? | Deviation cited? |
|---|---|---:|---:|---|---|---|
| 13 | D-1 unapplied-movement lint | 16 | **21** | A-1 19, U-1 17 | Yes | None needed |
| 14 | A-1 entity-records test + collision ratchet | 15 | **19** | RS-2a 18, RS-1 18 | Yes | None needed |
| 15 | G-3 + DC-02 gate | 13 | **17** | L 16, D-2 15 | Yes (U-1 17 was consumed by the founder batch first, commit `76dda01f`, before It. 15's `fa01db72`) | None needed |

**S6 bound, and it bound hard.** Three separate pieces of evidence, none of them coincidental:
- The 2026-09-15 governance pass opens "It. 12 and It. 13 are validated and uncommitted; rule S6 forbids new
  implementation. Did the meta-review §10 governance items instead." The loop did non-implementation work
  *because of the rule*.
- The research preflight entry is headed "not an iteration (S6 still binding)".
- It. 14's own entry: "unblocked the moment It. 12 was committed (both edit `site/package.json`)" — S6's
  disjoint-file-set exception was used correctly in It. 13 and correctly *withheld* in It. 14.

**S4 bound, and it selected an item.** It. 15's stated reason is "DC-02 reaches its third occurrence … rule
S4 therefore requires a mechanical check, not another prose patch." Without S4, a v2 17 item would have lost
to L at 16. S4 changed the outcome.

**But the rubric has an endogeneity hole.** Rc (+2) is awarded for *installing a gate*, and the coordinator
decides which item installs a gate. Any item can be lifted by +2 simply by attaching a check to it. G-3's
base was 13 — the lowest-scoring item selected in six iterations — and it reached the top of the queue on
K+P+Rc. That is not an accusation of gaming; It. 15 was the right call and the gate is a good one. It is a
statement that the rubric no longer discriminates: with Rc available to almost anything, "top eligible v2
score" is close to "whatever the coordinator decides to gate". The counterweight is §2.2 below.

**Finally: §7.3 was adopted as prose and never as measurement.** The previous review defined eight metrics
with targets for exactly these three iterations. No loop recorded a single one. I have filled the table in
§6; it should have been filled continuously, and three of the eight fail.

### F2 — The verification protocol is not sufficient, and the gap is structural (Q2)

V1–V7 were followed diligently: V3 negative controls are real and were run by the coordinator against the
*real exported functions*, not mocks (It. 14's planted 17th collision; It. 15's `reachable: true` flip with
a byte-identical restore afterwards; RS-1's six-way negative control set explicitly reasoned as "0 FAIL must
not mean the gate went blind"). That is a genuinely high standard and it is working.

The gap is elsewhere. **V1–V7 govern what is checked. Nothing governs whether the check itself works.** Both
coordinator misses were checks that could not have detected the thing they were looking for:

1. `grep "79 / year"` against a page whose string is `$79/yr` → 0 matches, reported as clear. The check had
   **zero sensitivity**; it would have returned 0 on a page saturated with the defect.
2. `ls | head -4` truncating before `history.html` → "not there", reported as clear. A **truncating command
   used to prove an absence** is incapable of proving one.

Both produced confident false all-clears, and both were caught only afterwards — one by a later verification
pass, one by an mtime comparison the coordinator happened to run. I then reproduced the same class twice
myself (§0). Four instances, three operators, two days. "Be careful" is not a fix. The mechanical fix is a
**positive control**: prove the check can see the thing before trusting it when it sees nothing. Exact
wording in §5, rule **V8**.

A second, narrower gap: **V4 has quietly lapsed**. It. 13 skipped the build deliberately (DC-08 churn),
It. 14 deferred it, It. 15 could not run it (host memory exhausted twice). CI is a legitimate substitute for
"does it build", but CI does not grep the built output for the defect, which is what V4 is for. Three
consecutive iterations with no V4 evidence should have been flagged in the log as a checklist gap rather
than passed over. V7 partially covers it — It. 15's production curls are real and I reproduced them — so the
practical exposure is low, but the checklist is now claiming a step that is not being performed.

### F3 — Two coordinator-caused defects in one session is a pattern, not noise (Q3)

It is tempting to call two defects acceptable at this throughput — eleven commits, four deploys, a score
apply, a 20-entity migration and three iterations in one day. I do not accept that framing, for one reason:
**neither defect was caught by the coordinator.** DC-10 was caught by `score-updater` refusing to take the
instruction's word for the file's contents; the history orphaning was caught by post-deploy verification.
The error rate is arguable; the *detection* rate is the finding. Both defects were in the coordinator's own
blind spot, and both were in the same authority class — hand-editing a structured record, and changing a key
without re-deriving its consumers.

To the loop's credit, both were self-reported in full, with root cause, and both were fixed the same day —
the history fix (`c43cc037`) went further than the regression, merging a pre-existing `xai-grok`/`xai` split
and adding output pruning. That disclosure discipline is why this is fixable rather than dangerous.

Two mechanical rules prevent both without slowing the loop (exact wording in §5):
- **S8** — structured records are written by a parser that re-serialises, so a duplicate key is impossible,
  plus a duplicate-key linter in `npm run test`. Cost: one script, once.
- **S9** — a key change is not done until every consumer of that key has been re-run and the **set of output
  paths** diffed before/after. The history bug is exactly a path-set diff: `johnson-amp-johnson.json` still
  written, `johnson-and-johnson.json` absent. Cost: minutes per rename, and only on renames.

### F4 — Gate coverage: DC-04 is the dangerous hole, and it is an active S4 violation (Q4)

Classes with ≥ 2 occurrences and **neither a gate nor a dated waiver**:

| Class | Occurrences | State | Verdict |
|---|---|---|---|
| **DC-04 — briefing claim contradicts its sources** | 2 cycles (4 errors 09-14, **12 errors 09-15**) | Ungated. Registry itself says "Ungated — S4 now applies" | **Highest risk. S4 violated.** |
| DC-06 — date/year errors, both directions | ≥ 4 | "Partly gated" by `validate-scan.mjs` date checks; the 2026-09-15 over-correction (Lesotho AGOA) is not covered by any check; no dated waiver | Under-gated |
| DC-07 — currency/unit | unknown | No verified occurrence at all | Needs evidence or deletion from the registry |
| DC-08 — build writes tracked files | every build | Ungated; I verified the churn is timestamp-only and still live | Ungated, cheap to fix |

DC-10 (1 occurrence) correctly carries no gate yet, and the registry already names the right one.

**DC-04 is the highest-risk ungated class, and it is not close.** Every other gated class protects a surface
that changes occasionally. DC-04 sits on the path that publishes *new text under the benchmark's name every
cycle*, it has already published errors that are live today (the four in `updates/daily/2026-09-14.json`),
and on 2026-09-15 it took **12 coordinator corrections** to stop a briefing going out with, among others, a
false superlative ("Oracle at the bottom of the benchmark" — there are 120 entities below it), a formula
claim contradicted by `scoring.mjs`, and an unsourced adjustment history. Every one of those passed
`validate-daily-briefings` **and** `lint-daily-briefings`. The only thing standing between that class and
the public record is one human reading carefully at the end of a long session — the least reliable control
in the system, and the one that already failed twice this week in a different form (F2).

**What its gate should assert.** Not prose quality — the DC-02 lesson is that string-matching is what let a
class recur three times. It should assert *checkable claims against the data that produced them*:
1. **Superlative and rank claims** ("at the bottom", "lowest", "the only", "first", "worst", "N of M") must
   resolve against the index JSON at build time; a claim that does not resolve fails.
2. **Any score, delta, band or rank stated in a briefing** must equal the value in the index (or the
   proposal, if qualified as proposed) — recomputed, not string-matched.
3. **Any quoted rule about the methodology** must be checked against `scoring.mjs` the way
   `test-method-claims.mjs` already checks `/methodology` — the machinery exists and is proven.
4. **Any reference to a prior briefing** ("last night's briefing said…") must resolve to the published JSON
   for that date and contain the referenced subject; the 09-15 cycle got this exactly wrong and it was
   caught by hand.
5. **Every named source URL** in the cycle's digest must appear in the cycle's assessment files — a
   claim-to-evidence join, which is the cheapest 80% of RISK-020.

Run report-only over the existing 80 briefings first, seed must-pass fixtures from real sentences, and
forward-date enforcement — the exact recipe It. 13 arrived at after two failed validation rounds.

### F5 — Portfolio: correctly rebalanced, then over-rotated into gate-building (Q6)

| Area | It. 10–12 | It. 13–15 | With the founder batch |
|---|---|---|---|
| Site copy / derivation | 3 | 1 (It. 15) | 1 |
| Research / briefing pipeline | 0 | 1 (It. 13) | 2 (+ the 09-15 cycle corrections) |
| Entity identity / data | 0 | 1 (It. 14) | 2 (+ RISK-023 migration) |
| Coverage observability | 0 | 0 | 1 (D-33, coverage published) |
| Commerce integrity | 0 | 0 | 1 (D-34, Score-Watch paused) |
| Deadline de-risking | 0 | 0 | 1 (D-37, waiver stagger) |
| Gates installed | 1 | **3 of 3** | 6 new `npm test` steps |

The mix is now pointed at the right risks — Meta-review 1's §8 "favour" list has four entries and all four
were hit. That is a real success and it should be said plainly.

The over-rotation is this: **3 of 3 iterations installed a gate, and 2 of 3 fixed no live defect.**
- It. 13's rule is forward-dated only; the ≥ 5 cycles of already-published unapplied-movement claims remain
  live (correctly — §1c forbids retro-editing — but the live error count did not fall).
- It. 14 freezes 16 cross-index collisions in an allowlist. I verified today that
  `/data/scores/singapore.json` still serves the city to every badge and data consumer. The allowlist is
  described as shrink-only, but **nothing is scheduled to shrink it**: there is no backlog row for the 16,
  only a follow-up bullet inside It. 14's entry, so the v2 queue cannot select it.
- It. 15 is the exception: 3 live false claims → 0, verified on production.

Meanwhile the live-defect inventory is flat: 37 held + 20 pending proposals (I counted both today —
identical to Meta-review 1), 16 collisions, 13 accented-slug mismatches, 5 briefing references resolving to
no entity (UAE in 7 briefings), 4 tracked-but-unpublished ai-labs.

**The rubric is causing this.** Rc pays +2 for a gate; P pays +1 for a live error. Building a gate is worth
twice as much as fixing a wrong answer that is being served right now. A-2 (remediate the 16 collisions)
scores 13 under v2 and cannot win a selection, while its defect is verifiably live. That is a rubric bug,
not a judgement bug, and §5 fixes it in two lines.

### F6 — S6's stop-work half bound; its traceability half lapsed under blanket approval (Q1, orchestration)

S6.3 requires every ITERATION_LOG entry to name a commit pathspec. It. 13 and the governance pass do.
**It. 14 and It. 15 do not** (verified by grep). The lapse begins exactly at the founder's "approve all and
fix all" instruction — the same day D-31 was recorded, which says "Every approval names its files. 'commit
all' is never used, because the working tree routinely holds build churn, held content and unrelated edits."

In practice the discipline held where it mattered: the eleven commits are topically scoped, the held
America-at-250 rewrite was correctly excluded and preserved as a patch, and the 24 dirty paths I counted
prove nothing unrelated was swept in. So this is a record-keeping failure, not a control failure. But D-31
was written the previous day precisely to survive a blanket approval, and it did not survive the first one.

### F7 — Status artifacts decay at loop speed (N6 recurring)

`SYSTEM_HEALTH.md` was fully rewritten as a measured snapshot on 2026-09-15 — a direct, competent response
to Meta-review 1's N6. Within 24 hours it was stale again. Measured today:

1. "Tests (`npm run test`, **22 steps**)" → the chain has **23** (It. 15 added `test:method-claims`).
2. "`test:no-stale-counts` (It. 12, **uncommitted**)" → committed in `9c169766`.
3. "Last deployed commit **376b0f85**" / "**9** consecutive successful runs … → 2026-09-14" → four more
   deploys since; `gh` shows 12 consecutive successes; live content is `fa01db72`.
4. "Risks (`RISKS.md` — **17 entries, all open**)" → **18** entries, and not all open: RISK-023 remediated,
   RISK-015 mitigated, RISK-014 sales paused, RISK-018 one face closed.
5. "**WIP limit (S6): reached** — no new implementation until commits are approved" → false; everything is
   merged and deployed.
6. "`npm run build` ✅ exit 0 (2026-09-14), 1,978 static pages" → superseded (1,989 on 09-15), and local
   builds now OOM on this host.

Target was 0 contradicted rows. Measured: ≥ 5. The cause is not negligence — it is that these figures are
hand-typed into a status file, which is precisely the DC-01 class the loop already gated for public pages
but not for its own governance artifacts. Fix in §5, rule **S11**.

Related and smaller, but worth one line: **the deployed `build-manifest.json` reports `git.sha: "unknown"`**
(the Docker build has no `.git`, so `execSync("git rev-parse")` falls back). The single artifact whose job is
to say what is deployed cannot say what is deployed. That directly weakens V7 and RISK-004: today the only
proof that production is at `fa01db72` is that its *copy* matches. Passing the SHA in as a build arg is a
ten-line fix.

### F8 — Founder-gated backlog: the jam broke, and S2 is applied to old items but not new ones (Q7)

**The jam broke.** Nine of the eleven packet items from `docs/founder-briefings/2026-09-14.md` were answered
on 2026-09-16 and recorded as D-31 … D-37. Meta-review 1's N4 ("founder decision latency has no clock and
no delivery channel") is substantially resolved for the packet; the recommended defaults were accepted
almost wholesale, which suggests the packet format works and should be reused verbatim.

**Still open, with age at 2026-09-16:**

| Item | Open since | Days | Blocks |
|---|---|---:|---|
| D-14 — absence-of-disclosure scores 2 vs the convention Cerebras was applied under | 2026-08-17 | **30** | RISK-005 comparability; 56 peer entities are not comparable to Cerebras |
| D-13 — index demarcation / primary-product test (status: *proposed*, never ratified) | 2026-08-20 | **27** | 3 of 6 staggered waivers (amazon, meta, microsoft); the 1X/Figure cross-index duplicates; part of RISK-003 |
| D-20 — Zimmer Biomet index destination (*unresolved*) | 2026-08-23 | **24** | one assessed entity cannot be published |
| D-21 — disclosure density must publish before robotics batches go live (*active blocker*) | 2026-08-23 | **24** | the robotics batches |
| RISK-006 — band boundary at 60.9 and at exact integers | long-standing | — | de-seeding the 60.9 clusters (the largest placeholder concentration) |
| RISK-002 — 37 held + 20 pending proposals (counted today) | 2026-08-20 | 27 | published scores diverge from the benchmark's own latest values |
| Branch protection on `main` | 2026-09-14 | 2 | RISK-021; **blocked on a repo permission this session lacks**, command ready |
| Gumroad sales-history check (did any purchase go unfulfilled?) | 2026-09-14 | 2 | RISK-014's remaining half — the only item with real money exposure |
| Delete two `.bak` files | 2026-09-14 | 2 | hygiene; blocked on the same permission class |
| RS-3 — publish or delist 4 tracked ai-labs (Reflection AI, Nvidia AI, SpaceX AI, Oracle AI) | 2026-09-16 | 0 | the 1,329/1,325 gap; Oracle AI was unassessable on 09-15 |
| America-at-250 — republish as dated correction, or discard | rewrite made 2026-09-03 | 13 | §1c compliance; patch preserved |

**Is S2 (split the gate from the work) being applied? Partly — and only where Meta-review 1 pre-split it.**
- Applied well: **U-1/U-2** (generator shipped, publication approved), **RS-2a/RS-2b** (validator shipped
  agent-side, rename went to the founder and was approved), **RS-3** (the backlog explicitly marks the audit
  half eligible and the publish-or-delist half gated).
- Not applied: the **16 collisions** have no split and no backlog row at all, despite being founder-approved
  on 2026-09-16 — the remediation is agent-doable *today* and is tracked only as a bullet. The three
  **D-13-blocked waivers** have no identified agent-doable half either, though drafting the primary-product
  determination for each of the three cases is plainly docs work under §1a.

So S2 is a habit inherited from the previous review rather than a reflex applied to new items. The rule is
sound; its application needs to be part of the intake step for every new backlog row, not the shortlist step.

---

## 3. What is working — keep unchanged

| # | Strength | Evidence |
|---|---|---|
| K1 | **Negative controls run against the real exported API, and reasoned about adversarially** | RS-1's author wrote that "0 FAIL must not mean the gate went blind" and then produced six negative and four positive controls; It. 14 planted a 17th collision *and* removed a known one to prove both directions; It. 15 restored the probe and confirmed the file was byte-identical afterwards. This is a better standard than most production teams hold. |
| K2 | **Gates that check numbers, not prose** | `test-method-claims.mjs` recomputes against `scoring.mjs` and shares constants with the components, so copy and data cannot drift. The stated reason — "it checks numbers, not prose, which is what let this class recur three times" — is the correct lesson, correctly generalised. I re-ran it: 33/0. |
| K3 | **Self-disclosure of the coordinator's own defects, in full, with root cause** | DC-10 and the history orphaning are both recorded with evidence, mtime reasoning, and the process note about the two false-comfort checks. A loop that hides these cannot be reviewed; this one can. |
| K4 | **Refusal discipline downstream** | `score-updater` refused to accept the instruction's characterisation of the Wellington file, applied on the intact gate only, and disclosed the contradiction. AUTONOMY R6 working exactly as designed, against the coordinator. |
| K5 | **Post-deploy verification finds real defects** | Two of the day's defects were found *by* V7, not by tests. The four green deploys and the live checks I reproduced are real. |
| K6 | **Fixes go one level past the symptom** | The history fix also merged a pre-existing `xai-grok`/`xai` split, added output pruning, and *reported* the 5 unresolvable references rather than widening fuzzy matching — the engineer's refusal to widen matching (risking merged entities) is the right call and was correctly preserved. |
| K7 | **The founder packet format works** | 9 of 11 items answered in one instruction, each with a recommended default. Reuse it verbatim. |

---

## 4. What is not working

| # | Problem | Severity |
|---|---|---|
| N1 | No rule makes a check prove it can detect the thing before a zero result is trusted. Four instances in 48 hours. | **High** |
| N2 | DC-04 — the class that publishes under the benchmark's name every cycle — is ungated with no dated waiver, in violation of the loop's own S4. Human review is the only control, after a cycle needing 12 corrections. | **High** |
| N3 | The rubric pays more for a gate (+2) than for a live wrong answer (+1), so live defects are frozen rather than fixed. 16 collisions verified still mis-serving; no backlog row exists for them. | **High** |
| N4 | Hand-edited structured records and un-swept renames — both coordinator blind spots, both already realised as defects. | **High** |
| N5 | `SYSTEM_HEALTH.md` went stale within 24 hours of a full rewrite; ≥ 5 rows contradicted by repo facts today. | Medium-High |
| N6 | §7.3 metrics were adopted as text and never measured; the loop could not have known it was passing or failing its own targets. | Medium-High |
| N7 | S6.3 pathspec recording lapsed for It. 14 and It. 15 under a blanket approval — the exact scenario D-31 was written for. | Medium |
| N8 | V4 (grep the built output) not performed for three consecutive iterations; the checklist claims a step that is not happening. Local builds OOM; no fallback defined. | Medium |
| N9 | 24 dirty paths, 0 attributable to a pending iteration; 18 of them are DC-08 build churn that has never been fixed and that has twice hidden real content (the America-at-250 rewrite sat in the noise for 13 days). | Medium |
| N10 | Deployed `build-manifest.json` carries `git.sha: "unknown"` — production cannot identify its own commit. | Medium |

---

## 5. Rule changes — exact wording, ready to adopt

Append to the Compassion Benchmark overlay in `.claude/agents/coordinator.md`. V8 joins the V-checklist;
S8–S11 join S1–S7; the two rubric amendments replace the corresponding lines of §5.2.

> **V8 — No zero without a positive control.**
> A check whose passing result is an *absence* — a zero count, "no matches", an empty listing, "file not
> found" — may not be recorded as evidence until the same check has been shown to return a non-zero result
> on a case that must match. Procedure: (1) run the identical check against something you have already
> confirmed is present — the defect itself in a scratch copy, or a known-present control on the same page;
> (2) record both the control result and the real result on the same ITERATION_LOG line, in the form
> `control: N>0 · target: 0`; (3) if the control returns zero, the check is broken — fix the check, never
> the conclusion. Truncating and paginating commands (`head`, `tail`, `-m`, `--max-count`, any listing that
> can elide rows) are forbidden in a check whose conclusion is "absent"; use a counting form (`grep -c`,
> `rg --count`, `… | wc -l`) that cannot silently truncate. A conclusion of absence drawn from a truncated
> command is void regardless of how it looks.

> **S8 — Structured records are written by a parser, never by hand.**
> Any change to a `.json` record under `research/change-proposals/**`, `research/rotation-state.json`,
> `site/src/data/indexes/**`, `site/src/data/entity-records/**` or `site/scripts/*.json` must be made by
> parsing the file, mutating the object and re-serialising it, so that a duplicate key is structurally
> impossible. A hand-typed insertion into these files is a stop-and-report condition. Note that `JSON.parse`
> alone does **not** protect you: it accepts duplicate keys silently and keeps the last one — which is
> exactly how DC-10 nulled an approval. Add a duplicate-key linter (a parse with a duplicate-detecting
> reviver) over those paths, wired into `npm run test`, and prove it with a planted duplicate.

> **S9 — A key change is not done until every derived artifact is re-derived and its path set diffed.**
> Renaming, re-slugging, merging or delisting an entity changes a key that other generators consume.
> Before such a change is proposed for commit: list every consumer of that key, run each one, and diff the
> **set of output paths** before and after. Any output path that disappears, or that is still written under
> the old key, is a regression and blocks the change. Record the before/after path-set diff in the
> ITERATION_LOG entry. The consumer list is maintained in one committed file — today it is
> `export-public-data.mjs`, `build-entity-history.mjs`, `apply-entity-record.mjs`,
> `research/rotation-state.json`, the `nginx.conf` / `nginx-ssl.conf` redirect maps,
> `site/scripts/known-collisions.json` and the badge Worker — and any new generator keyed on an entity slug
> must be added to it in the same commit that introduces it.

> **S10 — An ungated recurring class is a forced selection, not a note.**
> When a class in `docs/DEFECT_CLASS_REGISTRY.md` reaches 2 dated occurrences, the coordinator has until the
> end of the *next* iteration to record either a mechanical gate (with a planted-probe proof) or a dated
> waiver naming an owner and an expiry no more than 60 days out. If neither exists when the following item
> is selected, that class's gate becomes the forced selection regardless of score — the same forcing S7
> applies to dated risks. A waiver may be renewed once; a second renewal is a founder decision.
> *First application: DC-04, overdue as of this review.*

> **S11 — Status artifacts carry generated figures, or no figures.**
> Every count, test-step number, deploy streak, commit SHA, page total and risk tally in `SYSTEM_HEALTH.md`
> must be emitted by a committed script run as the last step of each loop, or be replaced by a pointer to
> where the figure lives. A hand-typed figure in a status artifact is the DC-01 class applied to the loop's
> own governance files and is treated as an occurrence of it. Prose narrative blocks are exempt; numbers are
> not.

**Two amendments to scoring model v2 §5.2** (these are the smallest change that stops N3):

> **P (live exposure) — amended.** +1 if the defect is on production now and was confirmed by a recorded
> BEFORE check. **+2 instead of +1 where the live defect serves a wrong value under the benchmark's name to
> a machine consumer — a score file, badge, feed, `llms.txt`, JSON-LD — or states a wrong score, rank or
> method rule in published copy.** Cap K + P ≤ 4 is unchanged.

> **Rc (recurrence) — amended.** +2 installs a mechanical gate for a class with ≥ 2 registry occurrences and
> no gate. **−1 of that if the gate ships while known live instances of the same class remain unremediated
> and no dated remediation item with an owner exists in `IMPROVEMENT_BACKLOG.md`** — freezing a defect is
> worth less than removing it, and the backlog row is the cheap way to keep the +2. −1 if the item fixes an
> instance of such a class without adding a gate. 0 otherwise.

*(Under the amended Rc, It. 14 would have scored 18 rather than 19 — still top, still correctly selected —
and the missing backlog row for the 16 collisions would have been created. That is the intended size of the
correction: it changes bookkeeping, not selection.)*

**One process change, no new rule needed:** fill in the §6 metrics table at the end of every loop. It took
me under an hour to measure all eight. A target nobody measures is a target nobody has.

---

## 6. Metrics — Meta-review 1 §7.3, measured for Iterations 13–15

| Metric | Baseline (10–12) | Target (13–15) | **Measured (13–15)** | Verdict |
|---|---|---|---|---|
| Loops that reduce or close a RISKS.md High item | 1/3 | ≥ 2/3 | **3/3** — It. 13 RISK-020, It. 14 RISK-017/018, It. 15 RISK-019 | ✅ **PASS** |
| Loops touching the research or data pipeline | 0/3 | ≥ 2/3 | **2/3** — It. 13 (briefing lint), It. 14 (export + entity records); It. 15 is site copy + test | ✅ **PASS** |
| Selections below the top eligible v2 score | 3/3 (v1) | 0/3 without a non-formula reason | **0/3** — each was top eligible; no deviation needed | ✅ **PASS** (see F1 on Rc endogeneity) |
| Validated-uncommitted iterations at loop end | 1–2 | ≤ 1 | **0** — all three committed, merged and deployed 2026-09-16 | ✅ **PASS** |
| Dirty paths not attributable to a pending iteration | ~24 | 0 | **24** — 18 DC-08 build churn, 2 held America-at-250, 1 stale dry-run, 2 `.bak` (blocked on permission), 1 settings | ❌ **FAIL** (unchanged) |
| SYSTEM_HEALTH rows contradicted by repo facts | ≥ 6 | 0 | **≥ 5** (F7) — rewritten 09-15, stale again within 24h | ❌ **FAIL** |
| Founder decisions open > 14 days | ≥ 5 | falling; each has a default | **4** (D-13 27d, D-14 30d, D-20 24d, D-21 24d) + 9 of 11 packet items answered | ✅ **PASS** (falling) |
| Recurring classes (≥ 2) with neither gate nor waiver | ≥ 4 | ≤ 2 | **3–4** — DC-04 (hard), DC-08 (hard), DC-06 (partial, no waiver), DC-07 (no evidence) | ❌ **FAIL** (marginal) |

**5 of 8 pass.** The three failures are the same three artefacts of hygiene and forcing: churn that never
gets fixed, a status file that cannot stay true, and a recurring class nobody is forced to gate. S10, S11
and the DC-08 item in the shortlist below close all three.

---

## 7. Recommended next-3 shortlist

Scored with the amended v2 (§5). Arithmetic is shown so it can be checked.

| Order | Item | v1 base | v2 | Why this, now | Founder-gated? |
|---|---|---:|---:|---|---|
| **16** | **CS-1 — claim-to-source gate for daily briefings (DC-04 / RISK-020).** Assert the five checkable classes in F4: superlative/rank claims resolved against index JSON; every stated score, delta, band and rank recomputed against the index or the cited proposal; quoted method rules checked against `scoring.mjs` (reuse `test-method-claims.mjs`); references to a prior briefing resolved against that date's published JSON; every digest source URL joined to the cycle's assessment files. Report-only over the existing 80 briefings first; must-pass fixtures seeded from real sentences; enforcement forward-dated. | I5 S5 L4 C4 − E3 − R2 = **13** | **18** = 13 + K 2 (RISK-020 High/High, reduce) + P 1 (four errors live in `updates/daily/2026-09-14.json`) + Rc 2 (DC-04, 2 occurrences, ungated) | **Forced by S10.** The only defect class on a surface that publishes new text every cycle, still guarded by one human reading carefully — which failed twice this week in a different form. 12 corrections were needed on 09-15 and every error passed both existing validators. | **No** (commit/deploy approval only) |
| **17** | **DC-08 — deterministic `generatedAt` in `build-special-briefings.mjs:474`.** Derive from the source content hash or the source commit date, not `new Date()`. | I3 S5 L2 C5 − E1 − R1 = **13** | **15** = 13 + Rc 2 (registry class, recurs every build, ungated) | Cheap, and it closes a metric that has failed twice: 18 of 24 dirty paths are this. It is also a *safety* item — this churn is what let an unrecorded rewrite of a published briefing sit unnoticed for 13 days, and it forces every loop to exclude files by hand, which is where S6.3 slips. | **No** |
| **18** | **A-2 — remediate the 16 cross-index slug collisions** (RISK-017). Pin index-suffixed slugs with 301s on the Cape Verde / Phoenix / RISK-023 precedent, shrink `known-collisions.json` toward 0, and let the It. 14 ratchet enforce it. | I4 S5 L2 C5 − E3 − R3 = **10** | **14** = 10 + K 2 (RISK-017 High, reduce) + P 2 (amended: `/data/scores/singapore.json` verifiably serves the city to every data consumer today) + Rc 0 | The gate exists; nothing is scheduled to use it. This is the largest *live* wrong-answer surface left, it is already founder-approved (2026-09-16, alongside RISK-023), the migration playbook was executed successfully two days ago on 20 entities, and **it currently has no backlog row at all** — create the row whether or not it is selected. | **No** — renames are §1b but were approved 2026-09-16 |

**Also eligible and deliberately not in the top 3:** **L — cross-links / `/ai-evaluation-suite`
overclaiming, v2 16.** It outranks items 17 and 18 on score. It is demoted for a reason that is not a term
in the formula, as S1 requires: *it is the only candidate whose defect surface does not publish or serve new
errors between now and the next meta-review* — CS-1's does every night, DC-08's does every build, A-2's does
on every data request. L should be selected immediately after these three, or sooner if a founder decision
stalls them.

**Standing forcing rules to honour:** S7 — if no waiver decision exists by **2026-11-09**, R-1 pre-empts.
Under D-37 the first staggered expiry is now **2026-11-16** (figure), so the T-30 trigger for that date is
**2026-10-17** — earlier than the old cliff, and it should be diarised.

**Next meta-review:** after Iteration 18, or earlier on the existing triggers (two consecutive deviations
from the top eligible item; any founder decision older than 14 days blocking a v2 ≥ 16 item — D-13 and D-14
already qualify on age but do not currently block a ≥ 16 item).

---

## 8. Founder decision packet — what is still blocked

Numbered for yes/no/alternative replies, defaults recommended. Items 1–3 are new or newly urgent; 4–8 are
carried and ageing; the previous packet's other nine items were answered on 2026-09-16 and recorded as
D-31 … D-37.

| # | Decision | Recommended default | Unblocks / risk | Age |
|---|---|---|---|---|
| 1 | **Gumroad sales history — did any Score-Watch purchase go unfulfilled?** Sales are paused (D-34) but this is unverified, and `research/alert-deliveries/` shows no alert was ever delivered. | Check the Gumroad account and, if any purchase exists, refund or fulfil it and record the disposition. This is the only open item with money and a named customer on the other side. | RISK-014's remaining half | 2 days |
| 2 | **Branch protection on `main`** — the session lacks the repository permission. The exact `gh api` command is in `docs/founder-briefings/2026-09-14.md` addendum 8. | Run it. Require founder-approved PRs for `site/src/data/indexes/**` and `research/change-proposals/**`. | RISK-021; approval provenance is currently unverifiable by design | 2 days |
| 3 | **RS-3 — publish or delist 4 tracked-but-unpublished ai-labs** (Reflection AI, Nvidia AI, SpaceX AI, Oracle AI). Oracle AI holds an unpublished 21.9 and could not be assessed on 09-15 because it has no published row. | Delist all four from research tracking unless you want them scored; that closes the 1,329 vs 1,325 gap cleanly. Publishing them is an index write and needs a baseline assessment first. | Coverage denominator; the published-only rule | 0 days |
| 4 | **D-13 — index demarcation / primary-product test** (status *proposed*, never ratified). | Ratify or reject. While it sits, three staggered waivers (amazon 2027-01-15, meta 01-29, microsoft 02-12) cannot resolve and the 1X / Figure duplicates stay published twice. Agent-doable half available now: draft the determination for each of the three cases as a docs artifact for you to approve. | RISK-015 remainder, RISK-003 | **27 days** |
| 5 | **D-14 — absence of disclosure scores 2, in live conflict with the convention Cerebras was applied under.** | Re-assess Cerebras under the 2-convention rather than adjusting the 56 peers scored under it — the fix the source study itself recommends. | RISK-005; cross-entity comparability inside ai-labs | **30 days** |
| 6 | **D-21 — disclosure density must publish before the robotics batches go live** (*active blocker*); **D-20 — Zimmer Biomet's index destination** (*unresolved*). | Take both in one sitting; each blocks published work that is otherwise finished. | Robotics batches; one assessed entity | **24 days** each |
| 7 | **RISK-002 — 37 approved-but-held + 20 pending proposals** (I counted both today; unchanged since 2026-09-14). Published scores knowingly diverge from the benchmark's own latest assessed values. | Pick one class and clear it: the 37 self-vetoes need the named remedy re-run (AUTONOMY R3), not an override. Authorise a de-veto assessment batch for the 10 largest divergences. | The benchmark's core currency claim | 27 days |
| 8 | **America-at-250 — the unrecorded rewrite of the published 2026-07-04 briefing**, preserved at `research/held-changes/america-at-250-unrecorded-rewrite-2026-09-03.patch`. | Publish the improved content as a dated correction/addendum, not a silent rewrite (§1c) — or discard it and delete the patch. Either answer closes it; leaving it held keeps two files permanently dirty. | §1c compliance; 2 of the 24 dirty paths | 13 days |
| 9 | *Low urgency:* delete the two `.bak` files (permission this session lacks). | Delete after confirming they match quarantined artifacts. | Hygiene; 2 dirty paths | 2 days |

---

## 9. Changes for the coordinator to apply, if accepted

1. `.claude/agents/coordinator.md` overlay: add **V8** to the V-checklist; add **S8–S11** after S7; replace
   the **P** and **Rc** lines of the v2 block with the amended wording in §5.
2. `docs/DEFECT_CLASS_REGISTRY.md`: record that **DC-04 is overdue under S10** as of 2026-09-16; either
   delete **DC-07** or attach a dated occurrence; note that DC-06's gate does not cover the over-correction
   direction.
3. `IMPROVEMENT_BACKLOG.md`: add the missing row for **A-2 (the 16 collisions)** with its v2 score and the
   date of its founder approval; add **CS-1** with the five assertions from §F4; score the DC-08 item.
4. `SYSTEM_HEALTH.md`: correct the six rows in §F7, then implement **S11** so this is the last time it has
   to be done by hand.
5. `ITERATION_LOG.md`: from Iteration 16, record the **commit pathspec** for every entry (S6.3, missed twice),
   the **V8 control/target pair** for every absence-based check, and the **§6 metrics table** at the end of
   each loop.
6. Pass the commit SHA into the Docker build as a build arg so `build-manifest.json` stops reporting
   `git.sha: "unknown"` in production (supports V7 and RISK-004).
7. Deliver §8 as a single packet, in the same format that got 9 of 11 answered last time.
