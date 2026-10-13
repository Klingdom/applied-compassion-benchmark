# Meta-Review 11: Improvement Loop, Iterations 97–101 (2026-10-13)

Called by the cadence gate. Five iterations were unreviewed, and Iteration 102 would have been the sixth. The
founder's new direction arrived at the same time: "Continue to expand and improve the AI model analysis. Figure out
how you can do this every week." This review answers what the last five loops imply for that.

---

## 1. The headline: Meta-review 10's recommendations paid for themselves within days

| MR-10 rec | Done in | First real catch |
|---|---|---|
| R1: clean-worktree pre-push | It. 97 | It. 98: `e1fc2328` FAILED on 4 raw 0x08 bytes an agent had written into `test-model-pilot-figures.mjs` (DC-23 occurrence 10). They had silently disarmed the ban on "first/second arm" wording. Once repaired, the assertion caught "second-arm" twice in a shipped component. The working-tree chain had passed. |
| R2: plan committed before data | It. 98 | Pilot 3's plan is commit `c87632ac`, which predates its first reply. Git attests the order, and nobody's word is needed. |
| R3: audits run the tools and re-derive | It. 98 | The pilot-3 audit re-counted self-identification from raw replies: 14 flagged, 1 real. That is DC-18 occurrence 4, the first in the **over-reporting** direction. It also found a host stop with no deviation entry (D2). |
| R4: cadence 5 | held | This review is on time. |

Each one found a defect that every other gate had passed. The pattern from Meta-reviews 9 and 10 still holds: move the
check to where the truth is. Here that was a clean checkout, the raw replies, and the commit graph.

## 2. What Iterations 97–101 did

| It. | Work | Selection |
|---|---|---|
| 97 | `prepush:clean` (MR-10 R1) | forced, S10 (DC-08 second occurrence) |
| 98 | pilot 3: four developers, length-matched arm, plan committed first, report deployed (`c5b53451`) | founder |
| 99 | founder approvals; first sale recorded ($195, Countries Index); `prepush:records`; orphan-worktree sweep | founder |
| 100 | `--steps` slices so the full chain fits a foreground command | founder ("continue") |
| 101 | AUT-3: the unattended nightly script can no longer push or deploy without opt-in | **ranked**, top live v1 item |

That is the first ranked selection since Iteration 91. The founder-directed streak was productive, and every
departure was logged. But it means the ranked queue went unread for ten loops, and that is how it went stale (§4).

## 3. The binding constraint is now this machine, not the method

Memory pressure stopped background work four times in this window: two subject runs, one clean chain and one build.
One stop orphaned a worktree that held a junction to the real `node_modules`. It survived by luck, and the sweep now
makes that safe by design. Today free RAM read **about 450 MB of 16 GB** before any model was loaded.

What fixed it was **not retrying**:
- foreground chunks of under nine minutes;
- `--steps` slices;
- a resumable runner that writes each record atomically.

Every long job is now resumable and chunkable. That is the precondition for anything that runs every week.

**Lesson.** Interactive sessions are the wrong place for long model runs. Collection, which is Ollama only and has no
judgement, can run outside the session, under the operating system's scheduler. The session should do only what needs
an agent: judging, analysis, audit and the approval packet.

## 4. The backlog rots when nobody ranks from it

Iteration 101's backlog review found **nine stale MCP rows** describing tools that had shipped weeks earlier. Two
founder rows are probably moot. It also found AUT-3: a live authority gap. The nightly script pushed to `main` and
rebuilt production from cron, on its own authority. It had been there since the script was written, and only a
ranked read of the backlog surfaced it.

**Rule:** every meta-review includes a stale-row sweep of the backlog's top 15. Any row whose deliverable exists is
closed, with the evidence named.

## 5. The model benchmark: three pilots, each one hand-built

| Pilot | Subjects | Ratings | Batches voided / re-run | Hand-built parts |
|---|---|---|---|---|
| 10-01 | 4 Claude | ~2,000 | 41 files | briefs, routing, validity gate |
| 10-02 | 2 open (local) | 996 | some | local runner, MCP probe driver |
| 10-03 | 4 open, 2 arms | 2,656 | 8 (+jb004 twice) | arms, comparisons, plan-first commit |

Each pilot added a tool, and each tool is now tested in CI (147 harness tests). But each pilot was also **designed from
scratch**: a new plan, a new config, a new report shape. At that cost, "every week" would consume the whole loop.

To run weekly, the benchmark needs four things it does not have yet:

1. **A frozen protocol.** Bank version, served-item rule, system message, trials, judges, batch size, validity
   threshold, bootstrap and correction all stay fixed across waves. A wave may change only its subjects. A gate
   compares each wave's config with the protocol and refuses any other difference. Changing the protocol is a
   versioned, founder-approved event, never a weekly edit.
2. **A templated plan.** The weekly plan is generated from the protocol and the queue, then committed before
   collection. It is not written by hand.
3. **A cross-wave anchor.** Composites from different weeks are comparable only if judging has not drifted. Each wave
   re-judges a fixed anchor set of stored replies from an earlier wave, and reports the drift beside the results. The
   pilot-2/3 bridge (mean |Δ| 0.146) is the prototype. Without an anchor, weekly results do not accumulate, they just
   pile up.
4. **A split between scheduled and session work.**
   - The scheduler collects replies unattended. It needs no network, no keys, no git writes and no publication.
   - The session judges, analyses, audits, and writes the approval packet.
   - Publication stays founder-approved (AUTONOMY §1b).

**What a week can honestly add.** The same digest-pinned build gives the same model every week, so re-running it
measures sampling noise, not change. Weekly value comes from:
- **new subjects:** new open releases that fit 8 GB of VRAM, and developers not yet covered;
- **the anchor drift series:** is the instrument stable over time?

It does not come from re-ranking the same models.

## 6. Recommendations

1. **R1: WEEKLY-WAVE.** The four elements of §5 are:
   - a frozen protocol file;
   - a subject queue with a written selection rule;
   - a wave orchestrator (`init`, `collect`, `status`) that refuses protocol drift;
   - a Task Scheduler entry that runs `collect` only;
   - a runbook the session follows for judging through to the approval packet.

   It is done when a planted protocol change is refused and a dry run plans a wave from the queue.
2. **R2: the anchor is part of the protocol.** It is reported in every wave, and a drift threshold marks a wave
   not comparable.
3. **R3: run the first weekly wave under the protocol.** Run it only after R1 passes, and check free memory before
   loading a model.
4. **R4: backlog stale-row sweep** in every meta-review (§4).
5. **R5: keep the cadence at 5.** This review was forced by the gate, one loop later than Meta-review 10's.

**Bottom line.** Across five loops the system shipped a third pilot, its first revenue, and two pieces of safety
tooling. Each of the three Meta-review 10 recommendations it tested caught a real defect on first use. The next
constraint is the cost of each wave, not its rigour. Weekly analysis is feasible if the protocol is frozen, collection
is scheduled outside the session, and every wave carries a drift anchor. Then results accumulate instead of starting
over.
