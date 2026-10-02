# Meta-Review 9: Improvement Loop, Iterations 86–91 (2026-10-02)

**Forced by the cadence gate** — and forced in the most useful place: it failed the deploy run for Iteration 91 on
GitHub's runner, after my local chain had passed *before* I wrote Iteration 91. The deploy job was skipped and
production was untouched. That is the first finding, so it goes first.

---

## 1. The headline: three times in two days, a check ran against the wrong state

| When | What ran | What it actually checked | What caught it |
|---|---|---|---|
| It. 90 | "no pilot leakage" grep after a build | a **stale `out/`** from an earlier build (the new build had failed) | the next build's parse error |
| It. 91 | full test chain, then "ready to commit" | the tree **before** the Iteration 91 log entry, which tipped the cadence gate | CI on the deploy run |
| It. 91 | `test-model-report-html` probes labelled "proposed" | the **live** manifest, which ratification flipped to "active" | the chain, once |

Each produced a confident pass about a state that no longer existed. **The rule this earns:** a validation result
is about the artifact it read, at the moment it read it. Any edit after the last full run voids it — including an
edit to a log. The deploy pipeline re-running everything on a clean runner is what made this survivable, and it
should be relied on as a backstop, never as the check.

## 2. What Iterations 86–91 did

All of 87–91 were **founder-directed**, not selected from the ranked queue (Meta-review 8 had found nothing
agent-doable at ≥ 13). That trips this spec's own meta-review trigger — "two consecutive loops deviate from the top
eligible v2 item" — five times over, and that is correct behaviour: the founder's directives were the highest-value
work available, and every deviation is logged with its reason.

| It. | Work | Outcome |
|---|---|---|
| 86 | Meta-review 8 | 13 of 23 "open" rows were already done; QUEUE-2 proposed falsifiable "done when" lines |
| 87 | Oct 1 research cycle | 1,329 reviewed, 7 pending proposals, all recomputed independently, zero baseline drift |
| 88 | /ai-models Part A | a published self-contradiction removed; count guard extended with a planted probe |
| 89 | first blinded cross-model pilot + a cb-probe defect | 996 replies, 1,992 ratings; cb-probe had been dropping its contamination result from every scorecard |
| 90 | 12-brief panel → assessment template → six-page report | report built behind a decision gate; 86 figures traced to data |
| 91 | D-29a ratified; commit; deploy | commits `d5ca2e5f`, `d77d6b39`; first deploy attempt correctly refused by CI |

## 3. DC-23 is the forced next selection (S10)

The escape-loss class recurred **three times** on 2026-10-01 (occurrences 6–8), two by me and one by a subagent,
**after** its practice rule — "code with backslashes goes through Write, never a shell string" — was in force. One
was silent and plausible (a normaliser that deleted the letter *s* and still produced believable counts). A targeted
regex scan missed two of three broken strings; **the parser caught all of them.** The class has ≥ 2 dated
occurrences and no mechanical gate and no dated waiver, so under S10 it pre-empts the queue: **DC23-PARSE** (a
chain step running `node --check` over every tracked script, with a planted raw line break) is the next loop.

## 4. What the review rounds were worth

Iteration 90's single review round (compassion-steward, a sentence-level claim audit, an SEO read) changed facts,
not just wording. Two statements the writer and I had both let through were false — "each item in a fresh
conversation" (items shared conversations in parts of up to 28) and silence about the crisis items (they were never
served, so the pilot says nothing about crisis responses). The pilot record had the first fact right; the narrative
compressed it into an untruth. One reviewer's question (does the result depend on the judge exclusion?) produced
the most important caveat in the report: the separation pattern survives, but the levels move 8–11 points.
**Recommendation: a sentence-level claim audit against the data is mandatory before any public report — not
optional polish.** It cost one agent run and found six blockers.

## 5. The fixture family, fourth appearance

Meta-review 8 recorded "a test whose expected value is read off the implementation verifies nothing" three times.
Iteration 91 adds a cousin: **a probe whose mode is read off the live data changes meaning when the data changes.**
Sixteen probes labelled "proposed" silently became "active" probes at ratification. Fix pattern: every synthetic
probe fixes its own inputs; only real-tree checks read live state.

## 6. Instrument findings worth carrying forward

- Judges differ in reliability in ways the scores alone cannot show: one judge failed quote grounding at 14.7% while
  the others were at or under 0.6%. A judge-validity check belongs **before** scores are computed, pre-registered.
- Absolute pilot levels are judge-dependent; only separation patterns should be reported as findings until judges
  span families and humans rate.
- The test bank's crisis items are excluded by default; any claim about crisis behaviour needs a separately
  governed run with a welfare protocol (F7).

## 7. Recommendations

1. **Next loop: DC23-PARSE** (forced, S10).
2. **"Last edit voids the run":** before any commit, the full chain runs after the final edit — including log and
   health edits. Candidate mechanism: a pre-commit check comparing the chain's last-run tree hash with the staged tree.
3. **Claim audit before publication** of any report or briefing that states figures (QA's audit format).
4. **Keep the cadence at 5.** It has now blocked a deploy that my own checks had passed. That is its job.

**Bottom line.** Six iterations produced the benchmark's first real look at AI models and a standard for every
future one. The failures were all of one kind — checking a state that no longer existed — and every one was caught
by a control downstream of the person who made it. The work now is to move those catches upstream.
