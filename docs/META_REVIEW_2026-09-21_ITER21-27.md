# Meta-Review 4: Improvement Loop, Iterations 21–27 (2026-09-21)

**Reviewer:** independent meta-coordinator, read-only.
**Scope:** Iterations 21–27; the research cycles of 2026-09-18, 09-20 and 09-21; the AI-model programme work of
2026-09-20/21; and whether Meta-review 3's rules changed behaviour.
**Mode:** I edited no existing file. No commit, no push, no deploy, no `npm run build`. I ran **no** `git checkout`,
`git restore`, `git stash`, `git reset` or `git clean` — INC-009 (2026-09-18) is why, and the working tree currently
holds three uncommitted work streams. This document is the only new file. My probe tree was built in the session
scratchpad from **copies**; `nginx.conf` sha256 is `2eca48444ed4388a007a3de25d5dc8084d8878a14849172b5f2c0d7b853f7cb5`
after my probes, identical to the value Iteration 21 recorded.
**Builds on:** `docs/META_REVIEW_2026-09-14_ITER10-12.md` (scoring v2, S1–S7, V1–V7),
`docs/META_REVIEW_2026-09-16_ITER13-15.md` (V8, S8–S11, the `P` amendment) and
`docs/META_REVIEW_2026-09-17_ITER16-20.md` (V9, amended S6, T1, amended S11).

**Read this first.** Meta-review 3's four amendments were **never written into the overlay**. Greps of
`.claude/agents/coordinator.md`: `V9` **0** · `T1` **0** · "WIP capacity is a brake" **0** · "Verify the artifact
that ships" **0** · "regeneration-command" **0**. The rule set the coordinator has been operating under for
Iterations 21–27 is Meta-review 2's. Every "was the rule followed?" question below is therefore really two
questions, and I have kept them apart.

---

## Triggers — did they fire?

| Trigger | Fired? | Evidence |
|---|---|---|
| Every 3 completed loops | **Yes, at the close of It. 23 (2026-09-18). Honoured four iterations late — worse than last window's two.** | Iterations 24, 25, 26 and 27 all ran after the trigger fired and before any review existed. A fifth stream (`tools/cb-probe/`, 23 files, 2026-09-21 08:57–09:04) was built with no iteration entry at all. T1 would have made a fired trigger a stop condition; T1 was never adopted, so nothing stopped anything. |
| Two consecutive loops deviate from the top eligible v2 item | **Structurally unfireable.** | It. 24 was a founder directive with **no v2 score**; It. 27 selected SC-1b (v1 12) + SC-1c (v1 13) and **no v2 score exists for any of the competing rows**. Of the 13 backlog rows added 09-18 → 09-21, **9 carry a v1 score only** (RS-5, SC-1d, SC-1b, SC-1c, MB-6, MB-1, MB-2, MB-3, MB-4). With no v2 on the queue there is no "top eligible v2" to deviate from, so the trigger cannot evaluate. `Deviation:` count across It. 21–27: **0** (control: the string is present once, in `coordinator.md`). |
| Founder decision > 14 days blocks an item scoring ≥ 16 | **No — and still cannot fire.** | The same four decisions as Meta-review 3, each 4 days older: D-14 **35d**, D-13 **32d**, D-20 **29d**, D-21 **29d** (computed from `DECISIONS.md` dates against 2026-09-21). D-13's blocked items still carry no v2. `MCP-B1` gates the whole MCP track and its highest row is v1 **15**, below the threshold — so even scored, it would not fire. T1 ("every backlog item carries a v2 score whatever its lane") was the fix; never adopted. |
| Two consecutive failed validations | No | — |

---

## 0. What I verified myself (not taken from the log)

Every row was re-run, re-fetched or probed by me on 2026-09-21. Absence claims are paired with a positive control.

| Check | Result |
|---|---|
| `npm test` from `site/` | ✔ **exit 0, 33 steps** (read from `package.json` via `scripts.test.split('&&').length`, not counted by eye). Last step `test:evidence-tier-labels` 16/0. SYSTEM_HEALTH's Tests header says **31**. |
| `gh run list` / `actions/runs` | ✔ **352 total runs. The most recent is 35249684018, `headSha 119f1757`, 2026-09-17T16:56:44Z — Iteration 20.** Nothing has run since. Actions is `enabled: true, allowed_actions: all`; the `Deploy to VPS` workflow is `active`; there are **zero** queued, failed or cancelled runs after that date. |
| Why: push events (`repos/:owner/:repo/events`) | ✔ **Four pushes to `main` since, every one with a `[skip ci]` commit as its tip:** 09-17T17:12 `0ae2cd93` · 09-17T21:24 `52c8c6b3` · 09-18T13:52 `dba86a76` · 09-20T17:01 `0cb2e53c`. GitHub evaluates `[skip ci]` on the **head commit of the push**, so each push skipped everything behind it. **Iterations 19, 21, 22, 23, 24 and 25 plus two nightly-research commits have never been built or deployed by CI.** `deploy.yml` triggers on `push: branches: [main]`; `origin/main` is at `0cb2e53c`, so the branch is right and the tip is the cause. |
| Live `/build-manifest.json` | ✔ `buildDate: 2026-09-18T13:53:34.787Z`, `git.sha: null`, `git.branch: null`, `git.dirty: null`, `source: "unavailable"`, with a `gitUnavailableReason` naming the missing `GIT_SHA` build-arg. **Production cannot name its commit** — It. 18's capability is defeated (BM-2). Meta-review 3 read `{"sha":"633ed6ff","source":"env"}` here; this is a regression. `totalEntities: 1325`, 8 indexes — matches `CLAUDE.md`. |
| What is actually live | ✔ Production = the **manual** build of 2026-09-18T13:53:34Z, 47 seconds after the `dba86a76` push. It. 19–23 are live; **It. 24, the 09-18 and 09-20 briefings, It. 26 and It. 27 are not.** |
| Iteration 21's redirects, on production | ✔ **Live and correct.** `/robotics-lab/intuitive-surgical-inc` 301 → `/robotics-lab/intuitive-surgical` · `/robotics-lab/skydio-inc` 301 → `/robotics-lab/skydio` · `/us-state/georgia` 301 → `/us-state/georgia-us-states` · `/city/phoenix` 301 → `/city/phoenix-global-cities` · `/company/at-and-t` **200**. Control: `/robotics-lab/zzz-not-real` 301 → `/404`. `Location: /robotics-lab/intuitive-surgical` — **relative**, so `absolute_redirect off` works and the `http://` downgrade is gone. Meta-review 3's N1 and N3 are closed on production. |
| Iteration 24 on production | ✔ **Not live.** `/ai-models` 200, 89,303 bytes, and **0** occurrences each of `PipelineStages`, `no-sources-registered`, `not-run`, `Detection`, `up to 10 points`. The page It. 24 was built to make honest still shows the pre-09-18 copy. |
| Pre-2026-09-17 and recent briefings | ✔ `/updates/2026-09-17` **200** · `/updates/2026-09-16` **301 → /404** · `/updates/2026-09-18` **301 → /404** · `/updates/2026-09-19` **301 → /404** · `/updates/2026-09-20` **301 → /404**. The 09-18 and 09-20 briefings **exist and are committed** (`site/src/data/updates/daily/`, commit `3480c423`) and are absent from the published record. Live `/updates` links only `/updates/2026-09-01`, `/updates/2026-09-14`, `/updates/2026-09-15`. |
| Iteration 26's defect, live | ✔ **The inverted tier badges are serving today.** On `/updates/2026-09-17`: `UN/IO` ×**24**, `Gov/Court` ×7, `Primary source` ×7, `Trade/Advocacy` ×**0**, and the new disclosure line `Source-tier badges are shown only…` ×**0**. That is the pre-fix map exactly as EV-1 describes it. |
| INC-007 has re-diverged, unnoticed | ✔ Three independent "latest briefing" pointers, **two values**: `updates/latest.json` `.date` = **2026-09-21** · `updates/manifest.json` `.latest` = **2026-09-21** · `updates/daily/latest.json` `.date` = **2026-09-14**. INCIDENTS.md records INC-007 as "closed on inspection … all three files agree". |
| **My planted probe — Iteration 21's `test:nginx-redirect-parity`** (isolated copies; repo untouched, sha verified above) | ✔ Baseline **4 passed / 0 failed, exit 0**. **Probe A** (delete the skydio rewrite from `nginx.conf` only): **FAIL**, naming `nginx-ssl.conf:99` — sensitive in that one direction. **Probe B** (delete it from **both** files, i.e. a real live 404): **4 passed, 0 failed, exit 0.** **Probe C** (strip all 25 robotics rewrites from `nginx.conf`, leave `nginx-ssl.conf` holding one unrelated rewrite): **4 passed, 0 failed, exit 0.** |
| Iteration 21's CI machinery | ✔ `nginx-config-syntax` job exists, `deploy.needs = [test, nginx-config-syntax]`, and the 29-URL legacy sweep sits in `verify`. **None of it has ever executed**, for the reason in row 2. It. 21's V7 was confirmed by a human manual deploy, not by the job it shipped. |
| `.claude/agents/coordinator.md` overlay | ✔ `V9` 0 · `T1` 0 · amended-S6 wording 0 · amended-S11 wording 0. `S8`, `S9`, `S10`, `S11` and the `P` amendment are present. |
| Defect registry | ✔ **DC-12 has been redefined.** It now reads "A published label contradicts the documented scale it displays". Meta-review 3 §5/§9.2 defined DC-12 as "a gate verifies a copy of the logic it guards" with four dated occurrences. Grep of the registry for `copy of the logic|verifies a copy|mirror`: **0**. That class has no row, no gate and no S10 clock. |
| `D-31` collision | ✔ `DECISIONS.md:199` — D-31, 2026-09-16, **active**: commits batched by named pathspec onto a release branch, never straight to `main`. `docs/MCP_SERVER_PLAN_2026-09-20.md` §6/§7 and backlog row `MCP-B1` ask the founder to "**Ratify D-31**" for the MCP transport choice. Register maximum is **D-39**. |
| Founder decision queue | ✔ 26 rows in `DECISIONS.md`; 4 genuinely open: D-14 (**unresolved**) 35d · D-13 (**proposed**) 32d · D-20 (**unresolved**) 29d · D-21 (active blocker) 29d. The rest are `active` standing decisions. |
| RISK-002, counted from the directory (D-11: "the queue is the directory, not the log") | ✔ 721 proposal files: **37 `approved`**, **22 `pending`**. `RISKS.md` RISK-002 says "**50** approved proposals are held". The 37 is **unchanged across all four meta-reviews**. |
| A **third, unlogged, uncommitted work stream** | ✔ `tools/cb-probe/` — **23 untracked files**, mtimes 2026-09-21 **08:57–09:04**: `bin/server.mjs`, 12 `lib/*.mjs` (incl. `validate-estimate.mjs`, `judge-estimate.mjs`, `projection.mjs`, `session-store.mjs`, `tool-definitions.mjs`, `sensitivity.mjs`), 7 `tests/*.test.mjs`, 2 fixtures, `package.json`, `README.md`. This implements backlog rows **MCP-B2, B3, B4, B5** and part of **B7**. |
| Does it work, and is it guarded? | ✔ All **7** test files pass (`exit 0` each: `e2e-jsonrpc`, `no-network-scan`, `projection`, `rating-validation`, `sensitive-default`, `vocabulary-ban`, `write-root-guard`). Zero runtime dependencies. **But `grep -c cb-probe site/package.json` = 0** — none of the 7 runs in the 33-step chain CI gates on. The repo's own `deploy.yml` comment names this: "A script that is never executed in CI is a dead guard." |
| Its own plan's gate | ✔ `MCP-B1` is "**founder**", dependency "—", note "**Gate for everything below**", and `MCP-B2` `Depends on: B1`. B1 is unanswered. B2–B5 were built anyway. No `ITERATION_LOG.md` entry, no v2 score, no V1 baseline, no commit pathspec. |
| AI-model programme, on disk | ✔ `tasks-v1.json` **33 items, bankVersion v1.1, 0 with a `subdimension` field** · `registry-v1.json` `entryCount: 0` · **`release-sources-v1.json` `sourceCount: 0`** · `releases-v1.json` `releaseCount: 0, scanState: "never-scanned"` · both real scan records `status: "not-run", blocked_by: "no-sources-registered"` · **no `runs/` directory anywhere** · `adapters/` = `replay.mjs` only · `.benchmark-ops/COST_LEDGER.md` = "0 rows. Cumulative spend: 0. Approved ceiling: none." · `research/model-index/proposed-sources-2026-09-18.json` = **14 fetch-verified sources**. |
| The plan corpus | ✔ 1,414 lines across five docs written 2026-09-20 (MCP_SERVER_PLAN 209 · MCP_SCORED_RUN_DESIGN 154 · CB_MODEL_AUTONOMOUS_OPERATION 485 · FIRST_ASSESSMENT_PLAN 475 · FOUNDER_PLAN 91). **Three are untracked.** |
| Dirty paths not attributable to It. 26, It. 27 or the 09-21 research cycle | ✔ **8**: `.claude/settings.local.json`; the 5 shared governance files; the 2 held America-at-250 files; the 2 `.bak` files (`research/rotation-state.json.bak`, `research/scans/2026-09-09.json.bak` — Meta-review 3 asked for these to be deleted 4 days ago); the 3 untracked design docs; `tools/`. Meta-review 3's `research/entity-records-dryrun.json` is gone — that item **was** actioned. |
| `SYSTEM_HEALTH.md` | ✔ Snapshot **2026-09-15**; "Last change: **Iteration 13**"; Tests header **31 steps** "with It. 24 uncommitted" (It. 24 is committed; the real count is 33); `test:no-stale-counts (It. 12, uncommitted)` and "pending commit" (committed long since); gates "measured 2026-09-15"; `npm run build` "(2026-09-14)"; "last cycle scanned 1,329 (2026-09-20)" (the 09-21 cycle has run). **≈10 contradicted rows.** The "last 3" notes section now holds exactly **3** — that one *did* improve. |

---

## 1. Verdict: **Amber, and the failure has moved downstream.** The code is the best it has been. The channel that carries it to readers is broken, and nobody noticed for four days.

Meta-review 3 found governance slipping while engineering improved. That split has held, but the symptom relocated.

The engineering in this window is genuinely strong and I want to be unambiguous about it. It. 21 fixed a real live
defect and I confirmed all five of its redirect classes working on production with a relative `Location` header. It. 22
built injectable-clock warnings and proved them at four simulated dates including the consequence date. It. 23's
"no output change" proof — regenerate 1,761 files with new code, regenerate with old, compare every hash, *then prove
the comparator can see a difference* — is the best verification artifact in this repo's history. It. 25 was an
**S10 forced selection that worked exactly as designed**, and its gate saved real work on its first live day. It. 26
refused the one-line fix, surveyed 371 sources across 58 briefings, discovered that flipping the labels would have
fixed 18 cycles and broken 19, and shipped a fail-closed cutoff instead. It. 27 corrected its own agent's overstated
absence claim rather than leaving a false parenthetical in a file whose entire purpose is date discipline.

Four things keep this Amber. Three are new.

1. **`[skip ci]` on the tip of a push silences the whole push.** Six iterations and two research cycles have never
   been built by CI. Production is a hand-built image that cannot name its commit. Two committed daily briefings
   return `/404` to readers. A reader-facing false claim (inverted evidence tiers) is live and the fix is in the
   working tree. The loop's own deploy verification (It. 21's `verify` sweep) has never run — the one gate that would
   have caught this is behind the thing it would have caught.
2. **The review process itself did not land.** All four of Meta-review 3's amendments went unwritten. One of its two
   requested registry rows was given to a different class, so the class it identified — with four dated occurrences —
   has no row, no clock and no gate, and **it recurred today, in the gate Meta-review 3 itself commissioned** (probes
   B and C). A review whose output is not applied is a fifth artifact nobody reads.
3. **Identifiers are being reused.** DC-12 was redefined. The MCP plan asks the founder to ratify "D-31" when D-31 is
   a live decision — and it is specifically the decision governing how commits reach `main`, which is finding 1.
4. **A third work stream appeared in the tree with no iteration entry.** `tools/cb-probe/` is 23 files of working,
   tested code implementing four backlog rows, built ahead of the founder ratification its own plan calls "the gate
   for everything below", with none of its 7 tests wired into the chain CI gates on.

---

## 2. Findings

### F1: Selection. Better than last window on substance, unmeasurable on process

| It. | Item | v2 logged | Top eligible | What actually decided it |
|---|---|---:|---|---|
| 21 | LC-1a nginx parity + CI jobs | **17** | LC-1 17 | **On score, correctly.** Alternatives CS-2 15, RS-4 15 recorded. S2 split applied (LC-1b founder-gated). S3 logged honestly: discovered mid-session, *not* claimed as a pre-emption. |
| 22 | R-1 waiver T-30 warning | **16** | R-1 16 | **On score.** Alternatives recorded. Noted S7 would force it on 2026-10-17 and pre-empted the forced loop. |
| 23 | RS-4a one slug module | **15** | tie CS-2 15 | **On score, with the tie-break written down** (K: RISK-018 High vs RISK-020 already reduced). S2 split, S6 disjointness checked. |
| 24 | AI-model benchmark, 4 lanes | **none** | — | Founder directive. Legitimate; **no `Deviation:` record**, and no v2 for the alternatives it displaced. |
| 25 | SC-1 misdated-claims ledger | none in entry (backlog row: 15) | EV-1 15 | **S10 forced selection.** Recorded as such, and recorded that it pre-empted EV-1. The rule doing its job visibly. |
| 26 | EV-1 evidence-tier labels | **15** | EV-1 15 | **On score** — "the highest-scoring open item", no deviation, WIP clear. |
| 27 | SC-1b (v1 12) + SC-1c (v1 13) | **none** | undefined | Follow-ups in the same file area, justified by cost actually incurred (Interpublic re-verified twice, Harvard's double-misdate found the same way). Reasonable — but RS-5, MB-1 and GI-1 also sit at v1 13 and **none of the four has a v2**, so "top eligible" has no value. |

- **Scoring discipline improved where it was applied.** 4 of 7 selections carry a v2 score and 3 record numbered
  alternatives — up from Meta-review 3's window, where It. 20 carried none at all.
- **`Deviation:` is still 0 of 7.** It has now been 0 for twelve consecutive iterations. This is not a close call:
  the label does not exist in practice and the two triggers that depend on it are dead.
- **Is `P +2` doing real work?** Yes on distribution, no on application. The window's *selections* score 15–17 while
  the 13 new backlog rows score 10–14 — the separation is real and nothing is being inflated into the 13–16 band.
  But **EV-1 was scored `P +1`** (10 + K 2 + P 1 + Rc 2 = 15) for an inverted label on **every badge on every
  briefing page** — the exact case the 2026-09-16 amendment defines as **+2** ("currently serving wrong data or a
  false claim to readers"). Correctly scored, EV-1 is **16** and is the top item from 09-18, two days before it was
  taken. It cost nothing this time only because S10 forced It. 25 ahead of it anyway. The amendment sits at
  `coordinator.md:667`, 50 lines below the `v2` block it modifies, which still reads `P +1` — Meta-review 3 flagged
  exactly this and it was not fixed.
- **Meta-review 3 §9.3 asked for a retroactive v2 on It. 20.** Not done.

### F2: Verification. V9 was internalised as engineering and ignored as bookkeeping — which is Meta-review 3's own diagnosis, reproduced

V9 was never written down, yet its two engineering clauses show up on their own:

- **V9(b) — production is measured, not inferred.** It. 21's entire V1 baseline is `curl` against production, and it
  explicitly derived which config the image ships from `Dockerfile:40` rather than assuming. It. 26's V1 quotes a live
  page. I re-measured both and both hold.
- **V9(c) — the probe is committed as a self-test.** It. 26's gate carries `Positive control: unshaped search DOES
  find EntityDetail.tsx's unrelated TIER_LABELS (proves the search works)` as a *committed assertion*. That is
  precisely V9(c), invented independently.

What did not happen is V9(a) — and it is the clause that mattered.

**My probe, 2026-09-21.** `test:nginx-redirect-parity` (It. 21, the gate Meta-review 3 commissioned as LC-1) passes
**4/0, exit 0** when a required rewrite is deleted from **both** config files, and passes **4/0, exit 0** when all 25
robotics rewrites are stripped from `nginx.conf` while `nginx-ssl.conf` retains one unrelated rewrite. Three
consequences:

1. **The gate checks that two files agree, not that the required redirects exist.** Consistency is not correctness.
   The defect class DC-11 describes is "a legacy URL 404s in production"; the gate cannot see that.
2. **Its reference of truth is `nginx-ssl.conf` — the file LC-1b is scheduled to delete.** On the day that file goes,
   Case 2 becomes vacuously true over an empty set and Case 1 (`count > 0`) still passes on `nginx.conf` alone. The
   gate will report "4 passed" forever. It defends the 26 rewrites only for as long as the dead file it was built to
   retire survives.
3. **DC-11's registry row overstates its own status on both halves.** It says "Gated 2026-09-17 (It. 21)" and cites
   the parity test *and* the `nginx-config-syntax` CI job. The parity test is blind as shown; the CI job has never
   executed (§0). The non-vacuous check It. 21 actually built — the 29-URL post-deploy sweep — is the right one, and
   it is downstream of the broken deploy channel.

**Meta-review 3's `test:pinned-slugs` class recurred, in a new costume.** Not a re-implementation this time, but the
same error one level out: **the instrument is aimed at a neighbour or at source text instead of at the shipped
behaviour.** Two dated instances in this window, plus four in the coordinator's own probes (F3):

- `test:nginx-redirect-parity` aims at the other config file (above).
- `test:evidence-tier-labels` asserts *behaviour* with a single whitespace-sensitive regex over source text
  (`site/scripts/test-evidence-tier-labels.mjs:275`:
  `/const tierReliable = isTierReliable\(briefingDate\);[\s\S]{0,120}tier && tierReliable \? TIER_COLORS\[tier\] : null/`).
  A behaviour-preserving refactor fails it; an edit that changes behaviour while keeping the literal text passes it.
  The *map* assertions are mechanical and strong, and the file's header gives a **documented, correct reason** for
  source-text parsing (Node's type-stripping does not transform JSX, so `import()` on `.tsx` throws). This is the
  honest version of the class, not a careless one — but it is the class.

**V4 (grep the built output) has now lapsed for fifteen consecutive iterations (13–27).** And this window shows what
it costs: a post-deploy content assertion — "the newest committed briefing is reachable" — would have caught the
`[skip ci]` failure on 09-18. It. 21 built exactly that sweep and it has never run.

### F3: Coordinator self-discipline. There is a pattern, it is the same pattern as F2, and it warrants one registry row — not a new rule

Four self-disclosed failures in this window, all found by the coordinator's own controls before any claim was made:

1. **It. 24** — `sed` broke `<published>` in the Atom parser and 70/70 still passed, **twice**. Root cause: the
   parser passes tag names as bare strings (`extractTagContent(block, "published")`), so the `sed` had only edited
   **comments**. The third probe, aimed at the real call site, failed correctly; restore was sha256-identical.
2. **It. 22** — the end-to-end probe passed a failure object **without the entity key `separation-waivers.mjs:72`
   matches on**, so it reported "blocking" at every date and proved nothing.
3. **It. 27** — the integrity check printed "entries still: 0" because it read **`.entries` when the array key is
   `.claims`**. Re-run correctly: 16.
4. **09-20 cycle** — the evidence-tier matcher "**silently read 0 URLs on two dates**" (SYSTEM_HEALTH 09-20 note).

**The pattern is exact and singular: every one is the instrument addressing a name or key that is not the subject** —
a comment instead of a call site, `.entries` instead of `.claims`, a match key that is absent, a URL field that is
absent. That is the *same* error as the two gate failures in F2 (`nginx-ssl.conf` instead of the redirect
specification; source text instead of behaviour). One class, two altitudes: **the check and the subject are not the
same object.**

**Did the disclosures change the next action?** Yes, in 3 of 4, and materially. It. 24 reported nothing until the
probe was valid. It. 22 read the matcher and rebuilt the probe. It. 27 re-ran and got 16 — and went further,
rewriting the agent's factually overstated absence note in the ledger and labelling the correction. This is the
healthiest habit in the whole loop and it should not be touched.

**The exception, and it is the instructive one.** A fourth instance was disclosed in-session — backticks inside a
double-quoted shell string caused a markdown file to be executed and text to be silently dropped — and
`grep -ri backtick` across every `.md` and `.json` in the repo returns **0 hits**. It exists only in a transcript.
**A disclosure that is not written down cannot change a later action**, and this one is the most generalisable of the
four (it is a whole-class shell hazard, not a one-off key name). That is the only gap in the coordinator's
self-discipline, and it argues for a registry row rather than a rule: V8 already catches this class every single time
it is applied, and the probes that went void were precisely the ones where no control had been run first. Registering
the class starts an S10 clock toward a mechanical remedy; another rule would add nothing V8 does not already say.

### F4: Gate quality. Five of six are non-vacuous; the sixth is the one Meta-review 3 ordered

| Gate (It.) | Non-vacuous? | Negative control? | Could it pass while the defect is live? |
|---|---|---|---|
| `nginx-redirect-parity` (21) | **Only `count > 0`** | **None committed.** The probe that proved it was external and was not kept. | **Yes — proved today.** Probes B and C both 4/0, exit 0 with the redirect gone from the shipped file. |
| `separation-waivers` (22) | **Yes** — 41 assertions on an injected clock (was 17) | **Yes, four simulated dates** (2026-10-18, 11-10, 11-15, 11-17) including the consequence date, plus a correctly-shaped end-to-end failure | No. The warning fires exactly when specified. |
| `slug-conventions` (23) | **Yes** — source scan for a 13th private copy, 16-name golden table, dated shrink-only ratchet; **imports the shipped module** | **Yes**, 2 in-file controls; and the coordinator's probe was in a *different* file than the agent's | Partly, and both holes are logged, not hidden: two named exemptions (`lib/slug.mjs`, `src/lib/slugify.ts`) and a **third slug variant in `generate-newsletter-html.mjs`** left alone under S5 rather than swept in. |
| `release-watch-parse` (24) | **Yes** — 70 assertions against the real modules, fail-closed on 3 conditions, every drop itemised | Yes, 1 in-file; plus a fixture run that dedupes to 0 on repeat | Not for parsing. **Irrelevant today**: 0 sources are registered, so the code path it guards produces nothing. |
| `known-misdated-claims` (25/27) | **Yes** — 116 assertions, and it **fired on its first live day** (PayPal saved; over-fired on the scanner's own prose) | **Yes, the best in the repo**: an over-matching counter-test (a genuine China item on the same slug → 0 failures) proving the ledger bans a claim, not an entity | Recall gap **measured and written down** (SC-1d: the Harvard matcher needs `burroughs`; "a federal judge ruled…" is missed). Over-reach, not under-reach — the safe direction. |
| `evidence-tier-labels` (26) | **Yes for the maps and the cutoff**; source-text for behaviour | **Yes, 3 — including a committed positive control** asserting the drift search can find a real duplicate | **Yes for behaviour** (the single regex at line 275). Strong where it is mechanical. |

**The recurrence is real but narrow:** one of six gates is blind, and it is the one Meta-review 3 specified. Five of
six carry controls, and three carry them *inside the committed gate*. That is a large improvement on the previous
window and it happened without the rule that asked for it.

### F5: Orchestration. The uncommitted-work problem has been solved and replaced by a worse one

**The WIP cap was respected. The log says otherwise, on every single iteration.**

All seven entries (21–27) end with the identical line "**Uncommitted — awaiting founder**". Five of them are
committed: It. 21 = `3e78d276`, It. 22 = `36b4129c`, It. 23 = `7d2ffa3f`, It. 24 and It. 25 = `e7dd9ff7` (23 files),
several of them within hours of the entry being written. Only It. 26 and It. 27 are genuinely uncommitted, both dated
today, and they **are** disjoint (site briefing components vs. research scripts) — so S6's "1, or 2 if disjoint" was
met.

So the honest answer to "was the cap respected?" is **yes, on the two streams that were logged as iterations** — and
**no** once `tools/cb-probe/` is counted, which makes three. The third stream is invisible to the cap *because it was
never logged*, which is the more serious failure: S6 cannot brake work it cannot see.

And **"awaiting founder" has become a closing ritual rather than a status.** It appears verbatim on iterations that
were committed the same morning. Meta-review 3 asked whether the phrase was excusing accumulation; the answer is
subtler and worse — it is not tracking anything at all, so it can neither excuse nor reveal.

**The real accumulation moved one layer downstream, and it is measurable.**

| | Count | For how long |
|---|---:|---|
| Iterations validated-but-uncommitted | **2** (26, 27) — within S6 | < 1 day |
| Unlogged uncommitted work streams | **1** (`tools/cb-probe/`, 23 files, 4 backlog rows) | < 1 day, but invisible to every rule |
| **Iterations committed but never built by CI** | **6** (19, 21, 22, 23, 24, 25) | **4 days** (since 2026-09-17T16:56Z) |
| Committed daily briefings absent from production | **2** (09-18, 09-20) | 1–3 days |
| Production behind `origin/main` | **4 commits**, incl. all of It. 24 | 3 days |
| Consecutive pushes to `main` that triggered no CI run | **4** | 4 days |

**Production is drifting behind `main` and the drift is undetectable from production**, because
`/build-manifest.json` reports `git.sha: null`. It. 18 built the capability to detect exactly this; a manual
`docker compose build` without the `GIT_SHA` build-arg strips it. The loop diagnosed this itself (BM-2, in the 09-18
SYSTEM_HEALTH note) and then shipped three more iterations without acting on it — so for four days nobody could have
answered "what is deployed?" from the artifact designed to answer it.

**Other orchestration notes:**

- **The deviation between committed and deployed was never checked by anyone.** Two iterations (21 and 26) end with a
  V7 "pending deploy" block listing what to verify after deploy. It. 21's was verified (by a human's manual deploy).
  It. 26's cannot be, and its defect is live. Nothing in the overlay closes a V7 block.
- **Commit pathspecs: 7 of 7.** This was 0 of 5 in the previous window. It. 24 recorded **three deliberately
  separate** pathspecs for its three lanes. S6.3 is now genuinely followed and this is the clearest single
  improvement in the window.
- **The §6 metrics table: 0 of 7.** Only this review measured them, for the fourth time running.
- **The AI-model programme has five parallel decision-numbering schemes** for one programme (`D-31`+1–6; `S1–S5`;
  `F-00…F-17` + `A-01…A-16` + `G1–G16` + `AMB-1…7`; `F1–F10` + `A1–A5`; `A/B/C/D`), with founder-plan `F2` =
  technical-plan `F-03` and founder-plan `F9` = `F-08`/`F-09`, and only the technical plan's F-numbers referenced by
  the backlog. Founder-plan **F9 asks to "freeze at v1.1 with these items", which is incoherent**: merging the 9
  proposed items makes the bank v1.2 and rewrites every `item_hash`.

### F6: The AI-model programme. Not displacement — *inverted sequencing*, and the cheapest action has been available and unqueued for five days

The question as posed ("three plans in one day, zero code shipped") is out of date by about six hours. `tools/cb-probe/`
was written this morning and works. The real shape is worse and more specific:

**1,414 lines of plan, then an implementation of four of the plan's rows, while the plan's own one-line prerequisite
sits unmet.**

- It. 17 (2026-09-16) shipped `release-sources-v1.json` **empty**, correctly, as "honest emptiness" — a source must be
  human-verified. Meta-review 3 listed "populate the source registry" as a carried 1–3 day item and called it "the
  only thing blocking detection".
- It. 24 (09-18) then spent **61 fetches** verifying **14 sources**, excluded 17 rather than guessing, and wrote them
  to `research/model-index/proposed-sources-2026-09-18.json` — correctly, because `added_by` must name a human.
- Five days later the live store still reads `sourceCount: 0`, both real scan records still read
  `blocked_by: "no-sources-registered"`, and **1,414 lines of plan and 23 files of MCP server have been built on top
  of that unmet prerequisite.**

That is the sequencing error in one sentence: the programme built four layers above its own unsatisfied one-line
input. The defence is real — the *scoring* half is founder-blocked on spend and credentials, so planning was the only
unblocked lane there. It does not cover the *detection* half, which was unblocked by one file copy the whole time.

**Two things in the plan corpus are not merely sequencing problems and must be resolved before any MCP row is built:**

- **The two MCP docs specify contradictory contracts for the same tool, same author, same day, and neither
  supersedes the other.** `MCP_SERVER_PLAN` §2.1/§2.2: `summarise_judge_session` "emits no composite and no band",
  mechanically enforced — "there is no number to screenshot" — and §7 decision 4 recommends "align them: **no
  composite in either**". `MCP_SCORED_RUN_DESIGN` §4/§7 S1: `finish_scored_run` emits a composite **and** the
  canonical band via `computeCompositeFromDimensions`, recommendation "**Yes**", and the doc states "Supersedes
  nothing". Both sit in the backlog at once as `MCP-B5` and `MCP-S3`. Answering either invalidates rows in the other
  track, and `tools/cb-probe/` has already been built against one of the two answers.
- **It collides with the independence policy's own rating rule.** `FIRST_ASSESSMENT_PLAN` G6 requires **two
  independent blinded human raters** for any official 1–5 score and says an LLM judge cannot be one of them (D-30).
  `MCP_SCORED_RUN_DESIGN` §4 permits C1 self-judge to emit the same output class (0–100 + band) under
  `official: false`. Same number, same institution's name on it, two rating regimes. The doc records this as AMB-B
  rather than resolving it. **`AMB-E` in the plan already concedes the consequence**: people will publish
  "Compassion Benchmark rates X at N" from a self-judged estimate.

**The single cheapest action that moves the programme from planning to evidence: ratify F-07** — copy the 14
fetch-verified rows from `research/model-index/proposed-sources-2026-09-18.json` into
`site/src/data/model-benchmark/release-sources-v1.json`, replacing each `added_by` with the founder's identity.

Why this and nothing else:
- It is a file copy plus one find-replace. The proposal rows already carry all eight fields
  `site/scripts/lib/model-sources-validator.mjs` requires; `validate:model-sources` currently passes on zero sources
  and would validate the 14 immediately.
- **The consumer is already built and already gated.** `research/scripts/release-watch-l1.mjs` (29 KB) with
  `test:release-watch-l1` and `test:release-watch-parse` both in the 33-step chain. It is the textbook case of an
  existing harness waiting on exactly one input.
- It costs **zero dollars, zero credentials** and carries no spend path — the L1 scanner never writes
  `releases-v1.json` and cannot promote. It. 24 documented it as safe to schedule today.
- It converts the programme's only two run records from `status: "not-run"` into the first genuine candidate evidence
  the Model Index has ever produced.

Runner-up, if the goal is evidence about *scoring* rather than detection: **measure `H`** (rater-minutes per response)
using the already-shipped `EvaluationScorer` on ~10 responses. One person, one afternoon, no cost, no credential —
and `H` is the unknown that dominates every budget in all five plans (human rating at ~1,500× API cost).

**Not as cheap as it reads:** "Pilot A, the zero-cost replay run". `bin/run.mjs` requires `--fixtures`, `--bank`,
`--registry` and `--target-registry-id`; there is no fixture JSON on disk and `registry-v1.json` has 0 entries. It is
a build task, not a one-line unblock.

### F7: S10 forced-selection check

**One class forces a selection today.**

- **The unregistered class from F2/F3 — "the check and the subject are not the same object"** — now has **six** dated
  occurrences and neither a gate nor a dated waiver: 2026-07-12 (`test-entity-href` listed 7 indexes and passed while
  100 universities were unsearchable) · 2026-09-16 (It. 16's lookup degraded to advisory on a wrong path while
  reporting success) · 2026-09-17 (`test-pinned-slugs` mirror, Meta-review 3's probe) · 2026-09-18 (the `sed` that
  edited comments; the tier matcher reading 0 URLs) · 2026-09-21 (`test-nginx-redirect-parity` probes B and C, mine) ·
  2026-09-21 (`.entries` vs `.claims`). It has no registry row because **its ID was given away** (§0, F2). Register it
  as **DC-15** and the S10 clock starts.
- **DC-14** (INC-009, destructive git over another agent's uncommitted work) has **1** occurrence and no mechanical
  prevention. Not forced. GI-1 is filed. Note that v2 puts GI-1 at 13 precisely *because* `Rc` is 0 for a
  single-occurrence class — the formula systematically ranks **prevention below ratchets**, which is a real property
  worth knowing rather than a rule to change.
- **DC-11** is marked gated and is **not** gated against its own defect (F2). Its row needs correcting, not a new
  clock, because the remedy (the `verify` sweep) exists and is merely undeployed.
- DC-07 still has no evidence. DC-10 still has 1 occurrence.

---

## 3. What is working (keep unchanged)

| # | Strength | Evidence |
|---|---|---|
| K1 | **S10 works, visibly and on time** | It. 25 was forced by DC-13 (≥2 dated, no gate, no waiver), the entry says so, and it records that it pre-empted EV-1 (15). It. 26 then took EV-1. This is the governance layer functioning end to end. |
| K2 | **Commit pathspecs, 7 of 7** (from 0 of 5) | It. 24 recorded three separate pathspecs for three lanes so they could be approved independently. |
| K3 | **"No output change" proved by regeneration, with a comparator control** | It. 23: 1,761 files each side, 0 differences, **then** a mutated copy detected 1 differing + 1 missing. A zero diff proves nothing until the comparator is shown to see a difference. |
| K4 | **The one-line fix refused on evidence** | It. 26 surveyed 371 sources across 58 briefings before touching the map, found 18 cycles right / 19 inverted / 17 self-contradictory, and established that flipping labels alone would have broken 19 cycles. Then fixed the **colour map too**, which carried the identical lie in another channel. |
| K5 | **Fail-closed by default** | `isTierReliable()` — no date means no badge. The release parser drops on no-date, no-title, no-link, each itemised with a reason. The zero-sources check fires before any fetch. |
| K6 | **Agents correcting the coordinator from source, and the coordinator accepting it** | It. 25: the brief asserted four entities were "first seen 09-18"; the agent read the committed records, found 09-17, recorded the true dates, and flagged the discrepancy rather than matching the summary. The coordinator then verified it independently. It also declined to record a third Meta occurrence that only the digest's prose supported. |
| K7 | **Over-matching counter-tests** | It. 25 and It. 27 both ship a test proving the gate bans a *claim*, not an *entity*. This is the discipline that keeps a sensitive gate from becoming a nuisance gate. |
| K8 | **Honest disclosure of limits instead of silence** | SC-1d's recall gap measured and written down; the HTML fallback's same-line limitation documented; MB-3's Qwen gap disclosed; the holdout question answered "the schema cannot express a secure item at all". |

---

## 4. What is not working

| # | Problem | Severity |
|---|---|---|
| N1 | **`[skip ci]` at the tip of a push skips the whole push.** 4 pushes, 6 iterations and 2 research cycles never built by CI in 4 days. It. 21's `nginx-config-syntax` job and 29-URL `verify` sweep have never executed. | **High** |
| N2 | **Two committed daily briefings (09-18, 09-20) return `/404`**, and the inverted evidence-tier badges are **live** on every briefing page (`UN/IO` ×24 on `/updates/2026-09-17`). The published record is wrong today and the fix is in the working tree. | **High** |
| N3 | **Production cannot name its commit** (`git.sha: null`, `source: "unavailable"`), so drift from `main` is undetectable from production. It. 18's capability defeated by a manual `docker compose build`. Known as BM-2 since 09-18; not acted on. | **High** |
| N4 | **Meta-review 3's four amendments were never written into the overlay.** V9, T1, amended S6, amended S11: 0 occurrences each. | **High** |
| N5 | **`test:nginx-redirect-parity` is blind to its own defect** (probes B and C, 4/0 exit 0), and its reference of truth is the file LC-1b will delete. DC-11's registry row claims it is gated. | **High** |
| N6 | **Identifier reuse.** DC-12 redefined, so Meta-review 3's 4-occurrence class has no row and recurred. `MCP-B1` asks the founder to ratify "D-31" when D-31 is live and is the branch-and-pathspec rule itself. Register max is D-39. | Medium-High |
| N7 | **A third work stream (`tools/cb-probe/`, 23 files) with no iteration entry, no v2, no baseline, no pathspec**, built ahead of the founder ratification its own plan calls "the gate for everything below", and **none of its 7 tests wired into the chain CI gates on**. | Medium-High |
| N8 | **The two MCP docs specify contradictory contracts for the same tool** (composite/band or not), neither supersedes the other, both are in the backlog, and code has been written against one answer. | Medium-High |
| N9 | **`Deviation:` 0 of 7** (0 for twelve consecutive iterations); **9 of 13 new backlog rows have no v2 score**, so two of the four meta-review triggers cannot evaluate. | Medium-High |
| N10 | **EV-1 was scored `P +1` for a live false claim on every briefing page** — the amendment says +2. The `v2` block at `coordinator.md:617` still reads `P +1`, 50 lines above the amendment. Flagged in Meta-review 3; unfixed. | Medium |
| N11 | **SYSTEM_HEALTH: ≈10 contradicted rows.** Snapshot 09-15, "Last change: Iteration 13", Tests "31 steps" (33), "It. 24 uncommitted" (committed), `test:no-stale-counts` "pending commit" (long committed). The S11 generator Meta-review 3 asked for was not built; the escape clause it asked to remove is still there. | Medium |
| N12 | **INC-007 has re-diverged unnoticed.** Three latest-briefing pointers, two values (`daily/latest.json` = 2026-09-14 vs the other two = 2026-09-21). The incident is filed as closed. | Medium |
| N13 | **RISK-002's own figure contradicts the ratified source of truth.** RISKS.md says "50 approved proposals held"; the directory (D-11: "the queue is the directory, not the log") holds **37 approved + 22 pending**. The 37 is unchanged across all four meta-reviews. | Medium |
| N14 | **Dirty paths not attributable to a pending iteration rose 6 → 8**, including the 2 `.bak` files Meta-review 3 asked to delete 4 days ago and 3 untracked design docs the backlog already cites. | Low-Medium |
| N15 | **RISK-024 / AMB-3 is live**: `scripts/nightly-pipeline.sh:216-219` pushes to `main`, which D-32 rejects and D-31 forbids. Unqueued. | Low-Medium |
| N16 | **V4 lapsed for 15 consecutive iterations** (13–27). The substitute It. 21 built (post-deploy sweep) is behind N1. | Low-Medium |

---

## 5. Proposed amendments

Meta-review 3's four amendments (**V9**, **amended S6**, **T1**, **amended S11**) are **re-tabled unchanged**. They
were never written down, so they are not "not working" — they are untried, and everything this review found about
bookkeeping is a prediction they already made. I add **two new rules and one clause**, and nothing else.

> **D1: a push is not a deploy until a run says so, and `[skip ci]` never sits on a push's tip.**
> Governance commits marked `[skip ci]` are pushed **separately, after** the code commit's run is green — or the push
> is ordered so its tip is a code commit. A loop is not closed until `gh run list` shows a completed run whose
> `headSha` is contained in that loop's commit, and the loop records the run id. A V7 "pending deploy" block is not
> closed by the next iteration starting.
> *Grounding: 2026-09-21 — four consecutive pushes to `main` (09-17T17:12 `0ae2cd93`, 09-17T21:24 `52c8c6b3`,
> 09-18T13:52 `dba86a76`, 09-20T17:01 `0cb2e53c`) each carried a `[skip ci]` tip; the newest CI run is
> 35249684018 / `119f1757` / 2026-09-17T16:56Z; Iterations 19 and 21–25 and two research cycles have never been built
> by CI; the `nginx-config-syntax` job and the 29-URL `verify` sweep that It. 21 shipped have never executed; and two
> committed daily briefings return `/404` to readers.*

> **R1: an identifier is allocated from its register's maximum and is never redefined. A review's requested
> registration is applied with that review's definition, or declined in writing with a reason.**
> *Grounding: 2026-09-21 — `DC-12`, which Meta-review 3 §5/§9.2 defined as "a gate verifies a copy of the logic it
> guards" (4 dated occurrences), now names a different class at `docs/DEFECT_CLASS_REGISTRY.md:26`; a grep for the
> original definition returns 0, so the class has no row, no S10 clock, and it recurred the same week. 2026-09-20 —
> `docs/MCP_SERVER_PLAN_2026-09-20.md` §6/§7 and backlog row `MCP-B1` ask the founder to "Ratify D-31" while
> `DECISIONS.md:199` D-31 (2026-09-16, active) is the branch-and-pathspec rule; the register's maximum is D-39.*

> **V9(d) (one clause added to the re-tabled V9): a check that compares two artifacts to each other is not a gate.**
> A gate compares the shipped artifact against a specification that survives the removal of the other artifact.
> *Grounding: 2026-09-21, my probes — `test:nginx-redirect-parity` passes 4/0 exit 0 with a required rewrite deleted
> from **both** configs, and 4/0 exit 0 with all 25 robotics rewrites stripped from the shipped `nginx.conf` while
> `nginx-ssl.conf` retains one unrelated rewrite. Its reference of truth is the file LC-1b is scheduled to delete.*

**Rejected on purpose.** A rule requiring plans before code (It. 24 and It. 26 show the loop already does this well,
and the AI-model problem is inverted sequencing, not missing plans). A rule about the log's closing line (it is a
stale-string defect; the S11 generator already re-tabled covers generated status text). A new scoring term for
prevention-vs-ratchet (F7 names it as a known property of v2; one window of evidence is not enough to change a
formula). A rule about the coordinator's void probes — **V8 already says it**, and the disclosure habit is working;
the gap is that one instance was never written down, which R1's sibling (registering DC-15) addresses.

---

## 6. Metrics: Meta-review 1 §7.3, measured for Iterations 21–27

| Metric | 16–20 | Target | **Measured 21–27** | Verdict |
|---|---|---|---|---|
| Loops reducing or closing a RISKS.md High item | 2/5 | ≥ 2/3 | **3/7**: It. 21 (RISK-004 delivery-verification, RISK-022 direction) · It. 22 (RISK-015 warning) · It. 23 (RISK-018 gated + ratcheted, not closed). It. 24–27 address new classes, not registered High risks. | ❌ FAIL |
| Loops touching the research or data pipeline | 4/5 | ≥ 2/3 | **5/7**: 23, 24, 25, 26 (renders pipeline output), 27 | ✅ PASS |
| Selections below top eligible v2 without a `Deviation:` record | 4/5 below, 0 labelled | 0 | **`Deviation:` 0 of 7.** 2 selections below/outside the ranking (It. 24 directive, It. 27 unscored field). Unmeasurable as specified because 9 of 13 new rows carry no v2. | ❌ FAIL |
| Validated-uncommitted iterations at loop end | 2 | ≤ 1 | **2** (It. 26, It. 27), disjoint — **within S6**. Plus **1 unlogged stream** (`tools/cb-probe/`) that no rule can see. | ⚠️ PASS on the rule, FAIL on the reality |
| **Committed iterations never built by CI** *(new — the metric this window demanded)* | — | 0 | **6** (19, 21, 22, 23, 24, 25), for **4 days** | ❌ FAIL |
| Production behind `origin/main` | 0 (deployed) | 0 | **4 commits / 3 days**, and **undetectable from production** (`git.sha: null`) | ❌ FAIL |
| Dirty paths not attributable to a pending iteration | 6 | 0 | **8** (settings, 5 governance, 2 America-at-250, 2 `.bak`, 3 untracked docs, `tools/`) | ❌ FAIL (worse) |
| SYSTEM_HEALTH rows contradicted by repo facts | ≥ 12 | 0 | **≈ 10** — snapshot 09-15 · "Last change: It. 13" · Tests "31" vs 33 · "It. 24 uncommitted" · `test:no-stale-counts` "uncommitted" ×2 · `test:lint` "99 with It. 13" · gates "measured 09-15" · build "(09-14)" · "last cycle 09-20". The "last 3" notes section is now correctly 3. | ❌ FAIL (marginally better) |
| Founder decisions open > 14 days | 4, older | falling | **Same 4, each +4 days**: D-14 35d · D-13 32d · D-20 29d · D-21 29d. Plus ~20 new asks in this window (F-00…F-17, S1–S5, MCP-B1, EV-1 option A, GI-1, MB-5/6, RS-4b, LC-1b). Proposals **37 approved-held unchanged for four reviews**; pending 20 → 22. | ❌ FAIL (worse) |
| Recurring classes (≥ 2 dated) with neither gate nor waiver | 2 unregistered | ≤ 2 | **1 unregistered, now ≥ 6 occurrences** (the check/subject class, DC-15 below) — because its ID was given away. DC-11 is registered but **mis-marked as gated**. | ❌ FAIL |
| Commit pathspec recorded | 0/5 | all | **7/7** | ✅ PASS |
| Gates shipped with a committed negative control | — | all | **3 of 6** in-gate (slug-conventions, known-misdated-claims, evidence-tier-labels); 5 of 6 have some control; **1 of 6 has none and is blind** | ⚠️ Mixed |

**3 clear passes of 12**, up from 1 of 8. Both new passes (pathspecs 7/7, in-gate controls) are exactly the habits
Meta-review 3 asked for — and **both arrived without the rules being written down**, which is the single most useful
thing this review learned. The failures now cluster in one place: **nothing carries work from "green in the tree" to
"true on production"**, and no rule ever closed that loop.

---

## 7. Ranked next-3 shortlist (v2 as amended; arithmetic shown)

**Binding constraint:** two logged iterations plus one unlogged stream are pending. Under S6 (and its re-tabled
amendment) nothing new starts until It. 26 and It. 27 are committed and `tools/cb-probe/` is either logged as an
iteration or set aside. Item 1 *is* that work.

| Rank | Item | Base v1 | v2 | Why this, now |
|---|---|---:|---:|---|
| **1** | **D1-1: repair the deploy channel and prove it end to end.** (a) Commit It. 26 and It. 27 on their recorded pathspecs and push so the **tip is a code commit**, then confirm a completed run whose `headSha` is that commit and record the run id. (b) Confirm `nginx-config-syntax` and the 29-URL `verify` sweep actually executed — they never have. (c) Add one assertion to `verify`: fail if `/build-manifest.json` reports `git.sha: null` (BM-2), so a manual build that strips the commit identity is loud instead of silent. (d) Add one assertion: the newest committed briefing in `site/src/data/updates/daily/` returns 200 — the check that would have caught 09-18 on the day. | I3 S5 L2 C5 − E1 − R1 = **13** | **17** = 13 + **K 2** (RISK-004 is titled "residual gap is verification"; High impact, reduced) + **P 2** (two committed briefings 404 today and the inverted tier badges are live — the published record is wrong *right now*) + Rc 0 (new class) | Everything else in this review is downstream of this. Six iterations of verified work, including two live-defect fixes, are sitting behind a `[skip ci]` on a push tip. The fix is ordering plus two assertions, and (d) closes the V4 gap that has lapsed for 15 iterations. |
| **2** | **F-07: populate `release-sources-v1.json` from the 14 fetch-verified rows** (`research/model-index/proposed-sources-2026-09-18.json` → the live store, `added_by` replaced with the founder's identity), then run one live L1 scan and commit the record. | I4 S5 L2 C5 − E1 − R1 = **14** | **16** = 14 + **K 2** (RISK-016 High/High — "the nightly pipeline has never run unattended"; this is the one input that makes the detection half produce evidence) + P 0 + Rc 0 | Five days of 1,414 plan-lines and 23 server files have been built on top of this unmet one-line prerequisite. The consumer is built and gated by two tests already in the chain; the rows already satisfy the validator's eight required fields; it costs nothing and cannot spend or promote. It is the cheapest path from planning to evidence and all three plans rank it first themselves. **Founder ratification is the whole cost; the agent tail is ~20 minutes.** |
| **3** | **V9(d)-1: give the redirect gate a specification.** Create `site/scripts/known-redirects.json` (dated, shrink-only, the 106 parsed pairs), assert `nginx.conf` contains every pair in it, keep the ssl-superset check only until `nginx-ssl.conf` is deleted, and **commit my probe B as a self-test** — a pair present in the list and absent from both configs must fail. | I3 S4 L2 C5 − E2 − R1 = **11** | **14** = 11 + K 1 (RISK-004/RISK-022) + **P 0** (I verified all five redirect classes are 301-ing correctly on production today — this is a *latent* hole, not a live defect) + **Rc 2** (DC-15, once registered, ≥ 6 dated) | The gate Meta-review 3 commissioned is blind to its own defect and will go permanently vacuous the day LC-1b lands. Fixing it before LC-1b is ordinary sequencing; fixing it after is an incident. Honest about its own priority: nothing is broken for readers today, which is why it is third and not first. |

**Also eligible, deliberately not in the top 3:**

- **GI-1 (13) — the pre-flight snapshot for cycle stores.** Arguably underscored: INC-009 destroyed 1,329 entities'
  work three days ago and survived only because the write happened to be re-derivable. v2 gives it 13 because
  `Rc` is 0 for a single-occurrence class, which ranks prevention below ratchets (F7). It is cheap and mechanical and
  I would take it fourth. **I could not act on Meta-review 3's `git checkout` restore suggestions in this review for
  exactly the reason GI-1 exists.**
- **Log `tools/cb-probe/` as an iteration, or set it aside.** Not a scored item — a bookkeeping debt. 23 working
  files, 7 passing test files, **0 wired into `npm test`**, built ahead of its own declared founder gate. Until it has
  an entry it is invisible to S6, S1, S2 and S10 alike.
- **RS-5 (13)** — assert `meta.last_scan` equals the maximum per-entity `last_scanned`. Cheap, mechanical, S11 class.
- **MB-1 (13)** — the digest's silence about release watch reads as "no releases shipped", which is a false claim by
  omission. Pairs naturally with item 2 and should ship in the same loop.
- **ID-2 (12)** — `research/assessments/macy-x27-s.md`. RISK-023's residue in the research artifacts; an S9 rename,
  not a `mv`.
- **D-13 determinations (16 on 2026-09-17, becomes 17 on 2026-10-17)** — unchanged from Meta-review 3 and still
  founder-gated. T-30 is **26 days away**.

---

## 8. Founder decision packet

Numbered for yes/no/alternative replies, each with a recommended default. Ages as of 2026-09-21.

| # | Decision | Recommended default | Unblocks / risk | Age |
|---|---|---|---|---|
| **1** | **Commit Iteration 26** (evidence-tier labels). Pathspec: `git add -- site/src/components/updates/briefing site/scripts/test-evidence-tier-labels.mjs site/package.json` | **Approve as-is.** `npm test` exit 0, 33 steps, verified by me. Its defect is **live** (`UN/IO` ×24 on `/updates/2026-09-17`, verified today). Re-score it `P +2` → v2 **16** in the log, per the 2026-09-16 amendment. | A live reader-facing false claim on every briefing page | 0 d |
| **2** | **Commit Iteration 27** (claims ledger 10 → 16, matcher stops reading narrative). Pathspec: `git add -- research/known-misdated-claims.json research/scripts/validate-scan.mjs research/scripts/test-known-misdated-claims.mjs` | **Approve as-is.** 116 assertions pass; `validate-scan` exit 0 on 09-17/18/20/21; the over-matching counter-test and the SC-1c behaviour test both verified. | Wasted verification searches every cycle | 0 d |
| **2b** | **Shared governance commit, and the push order.** After 1 and 2: `git add -- ITERATION_LOG.md IMPROVEMENT_BACKLOG.md SYSTEM_HEALTH.md RISKS.md docs/DEFECT_CLASS_REGISTRY.md docs/META_REVIEW_2026-09-21_ITER21-27.md` (`[skip ci]`). | **Push the code commits FIRST and confirm a green run, then push this one separately.** This is the entire content of amendment D1. Pushing all three together with the `[skip ci]` commit as the tip is exactly what has skipped four pushes and six iterations. Also correct the stale "Uncommitted — awaiting founder" lines on It. 21–25. | N1, N2, N3 | — |
| **3** | **Was the 4-day CI silence known?** Nothing has deployed via CI since 2026-09-17T16:56Z; production is a manual build that reports `git.sha: null`. | **Adopt D1 and take shortlist item 1 as the next loop.** If manual deploys are to remain routine, `deploy.sh`'s `GIT_SHA` build-args must be the only supported path — a bare `docker compose build` must be made to fail rather than to silently produce an unidentifiable image. | 6 iterations undeployed; 2 briefings 404; BM-2 | 4 d |
| **4** | **F-07: ratify the 14 release sources** (`research/model-index/proposed-sources-2026-09-18.json` → `site/src/data/model-benchmark/release-sources-v1.json`, `added_by` → you). | **Ratify.** 61 fetches of evidence behind it, 17 candidates excluded rather than guessed, quorum 8-of-10 recommended from measured behaviour. Zero cost, no credential, no spend path. This is shortlist item 2 and the programme's only unblocked route to evidence. | RISK-016; the whole detection half | 3 d |
| **5** | **The MCP contradiction — answer before any MCP row is built.** `MCP_SERVER_PLAN` §2.2 says `cb-probe` emits **no** composite and no band ("there is no number to screenshot"); `MCP_SCORED_RUN_DESIGN` §7 S1 says it **should** emit a composite and the canonical band. Neither supersedes the other; both are in the backlog (MCP-B5 vs MCP-S3); `tools/cb-probe/` is already built against one answer. | **No composite and no band from `cb-probe`.** It is the only answer consistent with `FIRST_ASSESSMENT_PLAN` G6 + D-30 (two independent blinded human raters; an LLM judge cannot be one of them) and with the independence policy. The plan's own AMB-E concedes people will publish "Compassion Benchmark rates X at N" from a self-judged estimate. Mark `MCP_SCORED_RUN_DESIGN` superseded on this point in writing. | MCP-B5, MCP-S1–S6; the independence claim | 1 d |
| **6** | **The `D-31` collision.** `MCP-B1` and `MCP_SERVER_PLAN` §6/§7 ask you to "Ratify D-31"; D-31 already exists (2026-09-16, active) and is the branch-and-pathspec rule. | **Allocate D-40** for the MCP transport decision and correct the plan and `MCP-B1`. Adopt amendment R1. Ratifying "D-31" as written would overwrite the live decision that governs how commits reach `main` — the rule whose failure is item 3. | Every MCP row; the audit trail | 1 d |
| **7** | **`tools/cb-probe/` — 23 untracked files implementing MCP-B2 through B5, built ahead of MCP-B1, which its own plan calls "the gate for everything below".** All 7 test files pass; **none is wired into `npm test`**. | **Do not commit it until items 5 and 6 are answered** — item 5 may invalidate its contract. Then log it as an iteration with a v2 score, a V1 baseline and a pathspec, and wire its 7 tests into the chain in the same commit. A guard CI never runs is a dead guard, in this repo's own words. | MCP track; S6 visibility | 0 d |
| **8** | **Register the class whose ID was taken.** DC-12 now names It. 26's label class; Meta-review 3's "a gate verifies a copy of the logic it guards" has no row. | **Register it as DC-15** with the six dated occurrences in §F7 — this starts its S10 clock — and correct DC-11's row: the parity test is **not** a gate against its own defect (probes B and C), and the `nginx-config-syntax` job has never executed. | S10; N5 | 4 d |
| **9** | **D-13: ratify or reject the primary-product test.** The Figure AI waiver expires **2026-11-16**; from 2026-11-17 `validate:product-separation` fails `npm test` and therefore every CI deploy. It. 22 now warns from 30 days out. | **Carried default from Meta-review 3:** ratify and delist the ai-labs rows for Figure AI and 1X, or extend those two waivers by 60 days as a recorded decision **by 2026-10-17**. The determinations draft (`docs/D-13_DETERMINATIONS_DRAFT_2026-09-17.md`) is ready. | RISK-015, A-2c, RISK-003 | **32 d** |
| 10 | **D-14** (absence of disclosure = 2 vs the applied Cerebras) · **D-20** (Zimmer Biomet destination) · **D-21** (disclosure density before robotics batches) | Carried defaults from Meta-review 3 §8 items 7 and 9. Decide all three in one sitting. | RISK-005; robotics batches; one entity | **35 d** / 29 d / 29 d |
| 11 | **EV-1 option A** — migrate the ~36 historical cycles' `sourceTier` values as a dated, disclosed correction. | **Defer.** Option B is shipped and correct: pre-cutoff briefings show no badge plus a disclosure line. §1c forbids retro-editing the published record, so A needs a dated correction notice, which is a separate decision. | 36 cycles of suppressed badges | 1 d |
| 12 | **RISK-024 / AMB-3:** `scripts/nightly-pipeline.sh:216-219` pushes to `main`, which D-32 rejects and D-31 forbids. | **Change the script to push a dated branch**, matching D-31. Currently unqueued despite being a live contradiction of two active decisions. | RISK-021, RISK-024 | new |
| 13 | **Dirty paths that belong to nobody** (8). Never commit `.claude/settings.local.json`. The 2 `.bak` files and the 2 held America-at-250 files are unchanged since Meta-review 3. The 3 design docs are already cited by the backlog. | **Commit the 3 design docs as dated proposals** (they are referenced from `IMPROVEMENT_BACKLOG.md` lines 180, 238, 267 and cannot be audited while untracked). **Delete the 2 `.bak` files.** Publish or discard America-at-250 (carried item 8). **Note: I did not run the `git checkout` restore Meta-review 3 suggested — INC-009 is three days old and GI-1 is not built.** | 8 → 1 | 4–18 d |
| 14 | **RISK-002 figure, and the queue itself.** RISKS.md says 50 approved-held; the directory says **37 approved + 22 pending**. Under D-11 the directory is the source of truth. The 37 is unchanged across four meta-reviews. | **Correct the row to 37**, and authorise a de-veto re-assessment batch for the 10 largest divergences (carried). This is the benchmark's core currency claim and it has not moved in 28 days. | RISK-002 | 28 d |
| 15 | Carried, short: **Gumroad sales-history check** (RISK-014, the only item involving money) · **branch protection on `main`** (RISK-021, the `gh api` command is in `docs/founder-briefings/2026-09-14.md` addendum 8) · **RS-3** delist or publish the 4 tracked ai-labs rows · **MB-5** the two unapplicable EQU rubrics · **MB-6** the holdout schema question | Defaults as in Meta-review 3 §8 item 11. | — | 1–7 d |

---

## 9. Changes for the coordinator to apply, if accepted

1. `.claude/agents/coordinator.md`: **apply Meta-review 3's four amendments, which are still absent** — append V9
   (with the new clause (d)), replace S6 and S11 with the amended wording, add T1, replace S7's literal date with the
   derived rule. Then append **D1** and **R1**. And finally change the `v2` block's `P +1` line at line 617 to `+2`
   to match the amendment 50 lines below it — Meta-review 3 asked for this and it was not done.
2. `docs/DEFECT_CLASS_REGISTRY.md`: register **DC-15** — "the check and the subject are not the same object" — with
   the six dated occurrences in §F7. Correct **DC-11**'s row: the parity test does not gate its own defect (probes B
   and C) and `nginx-config-syntax` has never run. Add a note on **DC-12** that its ID was reused and that the class
   Meta-review 3 assigned to it is now DC-15.
3. `IMPROVEMENT_BACKLOG.md`: add rows for **D1-1** and **V9(d)-1**. Give a **v2** score to every row that has only a
   v1 — RS-5, SC-1d, SC-1b (shipped), SC-1c (shipped), MB-6, MB-1, MB-2, MB-3, MB-4 — so the deviation and
   founder-delay triggers can evaluate at all. Correct `MCP-B1` to name **D-40**, not D-31. Record the retroactive v2
   for It. 20 that Meta-review 3 asked for.
4. `RISKS.md`: correct RISK-002 to **37 approved + 22 pending** (D-11: the directory is the queue). Update RISK-004
   with the 4-day CI silence and the `git.sha: null` regression. Add a row for RISK-024's live contradiction of D-31
   and D-32, or fold it into D1-1.
5. `SYSTEM_HEALTH.md`: **build the S11 generator** rather than hand-correcting ~10 rows a fourth time. Minimum
   generated fields: snapshot date, last iteration, test-step count, last CI run id and its `headSha`, deployed
   `build-manifest` sha, risk tally, dirty-path count, and the §6 metrics table.
6. `INCIDENTS.md`: reopen **INC-007** — the three latest-briefing pointers have re-diverged (`daily/latest.json`
   2026-09-14 vs 2026-09-21 elsewhere) and the structural defect it named is exactly why.
7. `ITERATION_LOG.md`: correct the stale "Uncommitted — awaiting founder" lines on It. 21–25 in a **dated addendum**
   (do not rewrite the entries). Record the backtick/shell-quoting void probe that was disclosed in-session and never
   written down — it is the only one of the four with no repo record. From the next loop on, record the CI run id per
   D1, the `Deviation:` label where one applies, and the §6 table.
8. **After deploying It. 26 and It. 27 (V7):** `/updates/2026-09-17` shows the Boston.com source as
   "Tier 2 · Journalism" (today: `UN/IO` ×24) · a pre-cutoff briefing such as `/updates/2026-06-13` shows **no** tier
   badges plus the disclosure line (today: 0 occurrences) · `/updates/2026-09-18` and `/updates/2026-09-20` return
   **200** (today: 301 → `/404`) · `/ai-models` contains It. 24's pipeline stages (today: 0 occurrences of
   `PipelineStages`, `not-run`, `no-sources-registered`) · `/build-manifest.json` reports a **non-null** `git.sha`
   matching HEAD. Control: `/robotics-lab/zzz-not-real` still 301s to `/404`. Record the CI run id that produced it.
