# Meta-Coordinator Review: The Continuous Research + Improvement Loop as an Operating System

**Reviewer lens:** how work gets picked, run in order, checked, and learned from. I review the system that chooses the work, not the product.
**Date:** 2026-09-14
**Mode:** read-only. No backlog, health file, log or agent definition was changed. The only git commands used were read-only (`log`, `show --stat`).

---

## 1. Scope + evidence sources

**In scope.** Five questions:
- Does the stated rubric (Impact + Strategic + Learning + Confidence − Effort − Risk) actually decide what gets done?
- Are the loop's own artifacts still being updated, or have they gone stale?
- Do repeated defect classes get turned into mechanical checks?
- Is the split between institution research and CB-MODEL a deliberate decision?
- Can the session and agent setup actually support nightly operation?

**Out of scope.** Whether any individual score is correct, CB-MODEL method design, and security findings. Other reviewers cover those.

**Evidence read directly this session:**

| Class | Files / commands | Key fact taken from it |
|---|---|---|
| Loop artifacts (last commit date) | `IMPROVEMENT_BACKLOG.md` (2026-06-21), `ITERATION_LOG.md` (2026-06-21), `SYSTEM_HEALTH.md` (2026-07-12), `CHANGELOG.md` (2026-06-21), `research/IMPROVEMENT_BACKLOG.md` (2026-05-22), `research/ITERATION_LOG.md` (2026-05-22), `research/SYSTEM_HEALTH.md` (2026-05-22), `CLAUDE.md` (2026-05-18) | Every loop artifact is 2–4 months stale |
| Governance | `AUTONOMY.md`, `AGENT-ROUTING.md` (both 2026-08-25), `DECISIONS.md` (2026-09-11), `RISKS.md` and `INCIDENTS.md` (2026-09-14) | Governance files are kept up to date; loop files are not |
| Candidate queues | `research/NEXT_CANDIDATES_{ARCHITECTURE,PRODUCT,QA}_2026-09-01.md`, `.benchmark-ops/WORK_QUEUE.md`, `.benchmark-ops/BLOCKERS.md`, `.benchmark-ops/CURRENT_STATE.md`, `.benchmark-ops/DECISIONS.md` | Scored candidates exist; whether they were executed was checked against the tree |
| Cadence | `site/src/data/updates/daily/` listing; `git log --grep="Nightly research"` with author timestamps | Daily through 07-31, then 7 cycles in 45 days |
| Execution model | `research/SCHEDULING.md`, `docs/VPS_SCHEDULING.md`, `scripts/nightly-pipeline.sh`, `scripts/vps-bootstrap.sh`, `git log --format='%an <%ae>'` (all-time) | The VPS cron identity has never authored a commit |
| Defect-class history | `research/scripts/validate-scan.mjs` header, `.claude/agents/overnight-scanner.md` §evidence-date, commits `cef937df`, `83bca5d5`, `42ee4e43`, `0a596d5b`, `c0c64833`, `70f81dc2`, `docs/QA_MONETIZATION.md` (added 2026-05-18) | Four recurring classes, only one partly gated |
| Human gate | `research/APPLIED_CHANGES.md` §2026-08-20 and §2026-09-10, `DECISIONS.md` D-13/D-14/D-16/D-20/D-21, proposal-status grep | 37 approved-but-held, 20 pending |
| Coordinator rubric | `.claude/agents/coordinator.md` Core Loop and Steps 1–5 | Rubric exists; the loop unit it assumes has been replaced in practice |

**Taken from the launching coordinator, not re-verified by me.** I could not run `gh`, and I did not reproduce these today:
- RISK-004's auto-deploy has succeeded 7 runs in a row since 09-09.
- Hong Kong was applied and the 18 slug collisions were fixed in today's session.
- The 09-14 public briefing's 4 factual errors (I did confirm they are listed in the `cef937df` commit body).

---

## 2. What is working

1. **Refusal discipline holds under pressure.**
   - `score-updater` refused a blanket approval twice on 08-16. It then held 37 of 66 on 08-20 and held the same 37 again on 09-10 (`APPLIED_CHANGES.md` §2026-09-10), each time with the exact triggering text quoted.
   - On 09-06 the scan agent wrote nothing rather than invent coverage (INC-008).
   - The false-coverage 09-09 scan was openly relabeled (`83bca5d5`) instead of being quietly replaced.
   - This is the institution's most valuable operating trait.

2. **Scanner incidents turn into gates quickly.**
   - `validate-scan.mjs` was created on 07-20, the same night as two scanner failures. It was extended on 07-27 (dates inferred from undated sources) and 07-30 (declared vs. actual tier counts).
   - The INC-002 stale-deploy incident got a freshness assertion within about a day (`0c7a6118`).
   - D-11 (the queue is the directory, not the log) came the day after INC-005.
   - So within one pipeline stage, the loop learns.

3. **Governance records are alive and cite evidence.**
   - `DECISIONS.md`, `INCIDENTS.md` and `RISKS.md` were updated this week, and entries point to commits and files.
   - INC-008 records the coordinator's own misdiagnosis rather than hiding it.

4. **The nightly pipeline has run for real.** Daily briefings exist for every day from 2026-05-20 to 07-31 except 07-19. The research → assess → digest spine works when someone runs it.

5. **Candidate quality is high.**
   - The three 09-01 candidate docs checked claims live, marked hypotheses, and lowered Confidence where they couldn't reproduce something (QA Gap 4, Gap 5).
   - The failure is in turning candidates into executed work, not in generating them.

6. **CB-MODEL has honest guardrails.**
   - It ships as pre-registration with no model scored (D-29).
   - A separation guard was built that fails on 8 real published defects (D-23).
   - Six blockers are written down as founder-only, and none was bypassed.

7. **The catch-up policy doesn't fake history.** The 09-14 cycle wrote no backdated daily briefings and recomputed all 19 composites independently (`cef937df`).

---

## 3. Findings: loop failures and prioritization failures

Severity: Critical = the loop publishes wrong claims or stops without anyone deciding it should. High = the loop picks the wrong work or fails to learn. Medium = inefficiency or a traceability gap.

### F1 — Institution research cadence stopped without anyone deciding it should; CB-MODEL took the capacity (High, bordering Critical)

- **Evidence.**
  - Daily cycles ran 05-20 → 07-31. In the 45 days 08-01 → 09-14 there were 7 cycles: 08-01, 08-11, 08-18, 08-20, 08-26, 09-01, 09-14.
  - From 09-07 to 09-11 there were 23 commits. By subject line, about 17 are CB-MODEL programme work (e.g. `09d896da`, `e6bef803`, `59467c78`, `7b0556f8`, `6e6cd9c9`, `e7947cea`, `21d8c8a8`). Zero nightly research cycles ran.
  - Nothing in `DECISIONS.md` (D-00 … D-30) sets capacity between the two programmes. All three September decisions (D-23, D-29, D-30) are CB-MODEL decisions.
  - `.benchmark-ops/WORK_QUEUE.md` is scoped "CB-MODEL work only" and uses P0–P3 tiers, not the Priority Score. The two programmes were never ranked against each other.
- **Consequence.**
  - The 13-day gap 09-02 → 09-14 was closed by one catch-up scan of 276 searches. One nightly cycle is designed around ~265–280 searches (INC-008).
  - My inference: evidence per day for that window was about one-thirteenth of the nightly design. For a product sold as *continuous*, that is a quality drop, not just a delay.
- **System.** Portfolio allocation and cadence policy. The institution's cadence is treated as optional work competing with projects, when it is the thing being sold.

### F2 — The stated rubric does not decide what gets done (High)

- **Evidence.** The highest-scored institution candidates from 09-01 were not executed, while unscored CB-MODEL items shipped:

| Candidate (09-01) | Score | Executed? | How I checked |
|---|---:|---|---|
| Architecture C1: proposal-contract validator + fail-closed apply | **16** | No | No `validate-change-proposals*` in `research/scripts/`. `mali.json` and `niger.json` still carry the nested-map `proposed_subdimensions` (grep: 1 hit each) |
| Architecture C2: one slug function (20 entities) | **14** | Only reactively, by founder direction today (per coordinator) | The 18 cross-index slug collisions were first documented in `docs/QA_MONETIZATION.md`, added 2026-05-18 |
| QA Gap 1: freshness assertion misses score-only deploys | **14** | No | `deploy.yml` last changed 2026-08-20 |
| QA Gap 2: wire `test-entity-records.mjs` into the test chain | **13** | No | `site/package.json` `test` chains 16 scripts; 12 are CB-MODEL and `test:entity-records` is absent |
| Product C1: disclosure density (closes the D-21 blocker) | **13** | No | D-21 still "active (blocker)" |
| Product C2: retraction re-check gate | **13** | No | No such gate in `validate-scan.mjs` or `validate-daily-briefings.mjs` |

- Meanwhile WQ-P1-04/05/06/08 (task bank, prompt repair, statistics layer, registry) all shipped 09-07 → 09-09. None carries a Priority Score.
- `.claude/agents/coordinator.md` says "Select EXACTLY ONE item" per loop. In practice there are three loop types with different units of work:
  - nightly research cycles
  - founder-authorized multi-item pushes (Iteration 9, `IMPROVEMENT_BACKLOG.md`)
  - programme build-outs (CB-MODEL, several items per day)

  The rubric only governs the first loop type, which stopped running in May.
- **System.** Selection logic. Candidates are generated and scored, but no step turns a score into a commitment, and new programmes skip the rubric.

### F3 — The loop's own artifacts are stale, and there are at least seven competing queues (High)

- **Evidence: stale records.**
  - Root `SYSTEM_HEALTH.md` (07-12) still states "Scored entities: 1,156", "7 indexes", and that auto-deploy is broken.
  - `research/SYSTEM_HEALTH.md` and `research/ITERATION_LOG.md` stopped on 05-22.
  - `CLAUDE.md` (05-18), which every agent loads, still says "7 JSON ranking data files" and "Robotics Labs: 50". `0a596d5b` found the index holds 92.
  - `RISKS.md` RISK-004 and `INCIDENTS.md` INC-001 still say auto-deploy has "zero successes". Per the coordinator it has succeeded 7 times in a row since 09-09.
- **Evidence: records that went stale by design.**
  - `docs/OPERATING_SYSTEM_ADAPTATION.md` (08-25) maps the 6S `BACKLOG`/`LEARNINGS`/`STATUS` roles onto `research/IMPROVEMENT_BACKLOG.md`, `research/ITERATION_LOG.md` and `research/SYSTEM_HEALTH.md`. All three had been untouched for three months when that mapping was written.
  - CB-MODEL's own queue went stale within four days. `.benchmark-ops/WORK_QUEUE.md` (last updated 09-07) says "Everything else in this queue is still not started", but commits `09d896da` (item 2), `e6bef803` (items 3–4) and `59467c78` (item 5) finished those items on 09-07 and 09-08.
- **Evidence: competing queues.** None is authoritative:
  - root `IMPROVEMENT_BACKLOG.md`
  - `research/IMPROVEMENT_BACKLOG.md`
  - three `NEXT_CANDIDATES_*` docs
  - `.benchmark-ops/WORK_QUEUE.md` and `.benchmark-ops/NEXT_ACTIONS.json`
  - more than 13 dated `docs/*_BACKLOG_*.md` files

  `git log --diff-filter=A` counts 89 new docs/research markdown files added in June alone.
- **Decision record split.** D-24 … D-28 exist only as drafts in `.benchmark-ops/DECISIONS.md`, even though D-22 makes root `DECISIONS.md` the authority. D-27 (unfuse xAI/Grok) was carried out on 09-10 (`42ee4e43`) while still a draft there.
- **System.** Learning memory and traceability. When the health file is wrong, every agent that reads `CLAUDE.md` or `SYSTEM_HEALTH.md` starts from false facts. Entity-count drift (1,155 / 1,156 / 1,289 / 1,331) is documented as AGENT-ROUTING D-6.

### F4 — Four defect classes keep recurring; only one got gates, and even that one leaks (High)

| Class | Occurrences (dated) | Mechanical control today | Status |
|---|---|---|---|
| **Date / year errors** | 07-20 under-coverage; 07-24 five entities on July-2025 events presented as 2026; 07-25 Ukraine day error; Microsoft layoffs with the 2025 figure in a 2026 article; 09-09 false freshness stamp on 1,331 entities; **09-14 France and Indonesia 2025 facts inside 2026-dated URLs passed `validate-scan`** (`cef937df`) | `validate-scan.mjs` §4a/4b/URL-date cross-check | **Partly gated, still leaking.** The scanner spec admits: "No tool catches this" (`overnight-scanner.md` line 55) |
| **Unit / currency errors** | Jamaica JMD $1B read as USD, a ~160× error, caught 09-10 (`83bca5d5`) and carried into 09-14. The 09-14 draft briefing then **invented a process claim, "currency checks are now standard"**, removed by the coordinator (`cef937df`) | **None.** No currency or unit rule in `overnight-scanner.md` or `overnight-assessor.md` (grep) | **Ungated.** The loop published *a claim that it had learned* without actually learning |
| **Placeholder baselines** | 07-20 merge script overwrote evidence with placeholders; 07-20 21 US-state placeholders replaced; 08-20 inventory found 834 of 1,289 published entities (59%) on seeds (RISK-001); seven de-seeding studies 08-13 → 08-19 | Seed inventory (manual); D-15 priority order | **Programme stopped.** No de-seed or calibration commit since 08-24. D-15 Tier 1 (Fortune 500 at 92.4, countries at 83.0) not started |
| **Entity identity / count drift** | 18 slug collisions (documented 05-18, fixed 09-14); ADP duplicate (08-17); Apexica delisted (08-21); 26 orphaned slugs (09-01, `70f81dc2`); xAI/Grok and DeepMind/Google name fusions (09-10); robotics "50" claims vs 92 (09-09); ai-labs counts (09-10); **Cabo Verde / Cape Verde duplicate found 09-14**, the same pattern as the already-listed São Tomé duplicate; 20 HTML-entity names (09-01 architecture doc) | Product-separation guard (CB-MODEL-driven, not wired into build); `validate-indexes.mjs` doesn't check near-duplicate names | **Fixed one at a time, never at the class level.** A second instance of a known pattern (country spelling duplicates) was found by chance |

- **Why these recur.** `research/IMPROVEMENT_BACKLOG.md` (May) has a "defect-class repetition penalty": −2 if the last two loops touched the same defect class. It was meant to stop recency anchoring. Applied today, it would *penalize* finishing a class that keeps coming back, which is backwards. Nothing registers defect classes, counts how often they recur, or requires a check once one recurs.
- **System.** Learning conversion. Lessons stay as notes in incidents and commit messages; they don't become rules.

### F5 — The session and agent setup cannot support nightly operation, and the documented schedule has never actually run (High)

- **Evidence: the cron has never produced output.**
  - `scripts/vps-bootstrap.sh` sets the unattended commit identity to "Compassion Benchmark VPS" / `vps@compassionbenchmark.com`.
  - `git log --format='%an <%ae>'` over all history shows **no commit by that identity**. Every nightly-research commit is authored by the founder's identity at daytime or evening hours, often days after the cycle date: 07-24 committed 07-27; 08-01 committed 08-06; 08-26 committed 08-31; 09-01 committed 09-03 22:23.
  - `research/logs/` has no run logs in the working tree.
- **Evidence: the docs are wrong.**
  - `research/SCHEDULING.md` (last changed 06-18) still says "Recommended: VPS cron … runs Mon–Sat", "~1,160 entities", "15–20 entities". `docs/VPS_SCHEDULING.md` still says "Install Node.js 20", and INC-001 showed Node 20 breaks `npm test`.
  - The real operating model is an interactive coordinator session that runs cycles, off-lineage studies and programme build-outs together. That is exactly the setup INC-008 found drains a single 2,000-search session cap.
- **Structural points.**
  1. The designed pipeline already isolates sessions: `nightly-pipeline.sh` runs each stage as its own `claude --agent … --print` process. The failure came from abandoning that design for interactive sessions, not from the design itself.
  2. INC-008's fix, "keep one nightly cycle per session", depends on someone remembering. Nothing checks search budget before a run starts.
  3. `validate-scan` passed the 09-09 scan "on inherited search counts" (`83bca5d5`). Its checks verify *declared* counts, not whether searches happened this cycle. I found no evidence here that it now rejects a scan with zero new searches; this needs checking.
  4. **Turning the cron back on as-is is not safe either.** `nightly-pipeline.sh` commits, pushes to `main` and rebuilds the container with no human review of the public briefing. On 09-14 four factual errors passed every automated gate (F7). Unattended publishing would have shipped them.
- **System.** Execution architecture and cadence.

### F6 — Diagnosis happens after re-running, not before (Medium-High)

- **Evidence.**
  - INC-008: the coordinator twice blamed the 09-03 failure on its own briefing's emphasis, told the founder so, and relaunched. The third attempt couldn't run at all. The agent's own report of a hard 2,000 cap had been available the whole time.
  - The lesson is written down ("check for a shared external constraint before rewriting the brief"). No invocation rule enforces it.
- **Pattern.** INC-001 records the same failure mode ("a persistent red pipeline can be several distinct bugs in a queue"). That is two incidents with the same meta-lesson and no procedural change.
- **System.** Agent invocation order. Nothing requires a root-cause step between the second failure of a stage and the third attempt.

### F7 — Public-claim accuracy depends on the coordinator happening to notice (Medium-High)

- **Evidence.** In `cef937df`, after `validate-daily-briefings` (79/79) and `lint-daily-briefings` (81 clean) passed, the coordinator corrected four errors by hand across all four copies:
  - reversed diplomatic direction (Slovenia/Israel embassy)
  - reversed cause and effect (France)
  - a correction implied where no published error existed, plus the invented "currency checks" process claim (Jamaica)
  - a false "could not run" statement
- **Why.** The lint rules check forbidden phrases, schema and pipeline keys. Nothing checks that each causal or numeric claim traces back to an assessment line.
- **System.** Validation coverage. The deterministic gates guard *format*; *meaning* is guarded by one person's attention.

### F8 — The human gate collects work but has no way to clear it (Medium-High)

- **Evidence.**
  - 37 proposals are `status: "approved"` but held on assessor self-veto since 08-20, and were re-held on 09-10 with the same result. Grep today: 37 approved, 20 pending.
  - `AUTONOMY.md` R3 offers two ways to clear a self-veto. Option 1, "do the named remedy" (a targeted evidence pass), **can be done by an agent**. No remedy pass has been scheduled for any of the 37 in 25 days.
  - The 08-26 rotation re-examined 4 of the 37 and re-affirmed the hold rather than performing the remedy.
  - Other founder-owned items are aging with no clock:
    - D-13 "proposed" since 08-20 but cited as governing
    - D-14 unresolved since 08-17
    - D-20 since 08-23
    - D-21 blocker since 08-23
    - RISK-006 open since 07-30
- **System.** Queue aging and escalation. "Held" is a terminal state in practice. Work that agents could do is recorded as if it were blocked on the founder.

### F9 — The loop's self-correction step was switched off (Medium)

- **Evidence.**
  - May's research loop ran meta-coordinator reviews and adopted their outputs: aging multiplier, repetition penalty, test harness (`research/ITERATION_LOG.md` lines 57, 106, 112). It set a cadence of "every 5 loops".
  - No meta-review has run since, across dozens of cycles and several programme shifts.
  - `AGENT-ROUTING.md` §3b / D-5 routes all work away from `meta-coordinator` because its description is scoped to a different product.
  - The May scoring changes were never carried into the root backlog, the 09-01 candidate docs, or `WORK_QUEUE.md`.
- **System.** Meta-learning cadence. The trigger conditions in this agent's own definition (stalled progress, recurring blockers, failed validations, phase transitions) have all been met since August with nobody running the review.

---

## 4. Top 5 recommended improvements

Priority Score = Impact + Strategic + Learning + Confidence − Effort − Risk (each 1–5). Strategic alignment here means determinism, traceability, evidence linkage, and the truth of the "continuous" claim.

### R1 — Defect-class registry with a "second occurrence requires a gate" rule

| Field | Value |
|---|---|
| **Type** | Improvement (loop policy + lightweight artifact) |
| **Problem** | Four defect classes (date/year, unit/currency, placeholder baseline, entity identity/count drift) recur across stages. Fixes happen one instance at a time. The May repetition penalty discourages class-level fixes (F4). |
| **Expected benefit** | Every class seen twice gets, within 3 cycles, either a mechanical check in an existing validator or a written waiver with a named owner. Recurrence becomes countable. Public claims about process ("checks are now standard") are only allowed when a registry entry shows the gate exists. |
| **Evidence** | F4 table; `overnight-scanner.md` line 55 "No tool catches this"; `cef937df` invented process claim; `research/IMPROVEMENT_BACKLOG.md` repetition-penalty text; `docs/QA_MONETIZATION.md` (05-18) slug collisions fixed 09-14 |
| **Impact** | 5 |
| **Strategic alignment** | 5 |
| **Learning value** | 5 |
| **Confidence** | 4 |
| **Effort** | 3 |
| **Risk** | 1 |
| **Priority Score** | **15** |

**Concrete changes:**
1. One registry file with fields: class ID, first seen, occurrences (date + commit), stage of origin, gate (script + section) or waiver, owner.
2. Replace the −2 repetition penalty with **+2 Recurrence** when a class has 2 or more occurrences and no gate. Keep anti-anchoring by capping it at +2.
3. Starter gates:
   - currency/unit: any number in a scan or briefing next to a non-USD place name must carry an explicit ISO currency code
   - identity: a normalized-name near-duplicate check across all 8 indexes (diacritics and alternate names; it would have caught Cabo Verde / São Tomé)
   - count drift: published counts are derived from the data, never written as literals (extending `0a596d5b`/`c0c64833` repo-wide)
   - year: a scan item's `evidence_date` year must match the year stated inside the quoted text

### R2 — Execute before generating more candidates, and make artifact updates part of "done"

| Field | Value |
|---|---|
| **Type** | Policy (selection logic) |
| **Problem** | Scored candidates don't become commitments (F2). Loop artifacts go stale (F3). New multi-lens reviews keep adding queues. |
| **Expected benefit** | The top-scored items get done or explicitly declined. The health file stays true. The queue count drops from 7+ to 2. |
| **Evidence** | F2 table (scores 16/14/14/13 not executed); F3 last-updated dates; 89 new docs in June; `WORK_QUEUE.md` stale 4 days after creation |
| **Impact** | 4 |
| **Strategic alignment** | 5 |
| **Learning value** | 3 |
| **Confidence** | 5 |
| **Effort** | 2 |
| **Risk** | 1 |
| **Priority Score** | **14** |

**Concrete changes:**
1. **Candidate-generation throttle:** no new multi-agent candidate or review round while 3 or more open items scored 13+ are older than 14 days and neither started nor declined with a reason.
2. **Two queues only:** the root `IMPROVEMENT_BACKLOG.md` (all repo-wide and institution work, under the rubric) and `.benchmark-ops/WORK_QUEUE.md` (CB-MODEL only, but each item also carries a Priority Score so it can be compared across programmes). The `NEXT_CANDIDATES_*` and `*_BACKLOG_*` docs become inputs that are merged into the root file and then marked superseded.
3. **Definition of done for any commit that closes a queue item:** update the queue row, add an iteration log line (date, item, commit, predicted vs. actual Effort/Risk), and correct any fact in `SYSTEM_HEALTH.md` / `CLAUDE.md` / `RISKS.md` the change makes false. The first sweep should fix RISK-004 and INC-001 (if the deploy streak is confirmed), the entity/index counts in `CLAUDE.md` and `SYSTEM_HEALTH.md`, and `research/SCHEDULING.md`.
4. **Heartbeat check** (report-only at first): fail if `SYSTEM_HEALTH.md` is more than 7 days older than the newest nightly-research commit.

### R3 — Protect the institution cadence as a floor, and allocate capacity between programmes explicitly

| Field | Value |
|---|---|
| **Type** | Policy (cadence + portfolio allocation) |
| **Problem** | The product is "continuous". Its cadence stopped for 45 days without a decision while CB-MODEL took the capacity (F1). |
| **Expected benefit** | Research coverage per day is predictable. Any trade-off between programmes becomes a recorded founder decision instead of a side effect. |
| **Evidence** | 7 cycles in 45 days; ~17 of 23 commits 09-07 → 09-11 were CB-MODEL; no allocation decision among D-00 … D-30; 13-day window covered by 276 searches |
| **Impact** | 5 |
| **Strategic alignment** | 5 |
| **Learning value** | 3 |
| **Confidence** | 4 |
| **Effort** | 2 |
| **Risk** | 2 (CB-MODEL build slows) |
| **Priority Score** | **13** |

**Concrete changes:**
1. Write a DECISIONS entry that sets the cadence floor, for example "at least 5 validated cycles per 7 days" (the founder picks the number), and the default capacity split.
2. **Cadence-debt override:** if the floor is missed, restoring the cycle comes before every scored item in both queues, including CB-MODEL P1 items.
3. Catch-up cycles covering more than 3 days must state their searches per covered day in the public briefing's method note. That keeps thinner coverage honest.
4. Any new programme (CB-MODEL today, the next one tomorrow) must state its capacity claim in DECISIONS before its first build commit.

### R4 — One isolated session per cycle, with a search-budget check before launch and a human-reviewed publish step

| Field | Value |
|---|---|
| **Type** | Fix (execution architecture) |
| **Problem** | Operation moved from the per-stage isolated cron design to a shared interactive session that drains the 2,000-search cap. The cron has never produced a commit. Turning it back on as-is would publish unreviewed briefings (F5, F7). |
| **Expected benefit** | No repeat of INC-008. Cadence stops depending on one person being present for research. Publication stays behind human review. |
| **Evidence** | No commits by "Compassion Benchmark VPS" in all history; nightly commits lag 0–5 days; INC-008; `nightly-pipeline.sh` auto-commits, pushes and rebuilds; 09-14 four post-gate errors |
| **Impact** | 5 |
| **Strategic alignment** | 4 |
| **Learning value** | 3 |
| **Confidence** | 4 |
| **Effort** | 2 |
| **Risk** | 3 (unattended runs, API cost, auto-push path) |
| **Priority Score** | **11** |

**Concrete changes:**
1. Scheduled runs do scan → validate → assess → digest-draft in separate processes and commit to a date branch, not `main`. The human step is: review, run the claim-trace check (R4 item 4), merge, deploy.
2. **Search-budget preflight:** before a scan starts, check remaining session budget against the planned tier budget. If short, refuse to start and record why. Never "consolidate" earlier artifacts into a new date.
3. `validate-scan` fails when `new_searches_this_cycle == 0` or when inherited searches are counted toward coverage floors.
4. Add a **claim-trace stage** between digest and lint. Every numeric, causal or directional claim in the public briefing must cite an assessment or scan line. Anything unmatched is an error. Start report-only; make it blocking once false positives are measured.
5. Rewrite `research/SCHEDULING.md` and `docs/VPS_SCHEDULING.md` to describe what actually runs.

### R5 — Give the human gate an aging clock, and schedule agent-doable remedies as work

| Field | Value |
|---|---|
| **Type** | Policy (queue aging + escalation) |
| **Problem** | 37 approved-but-held proposals (25 days old) and several founder-owned decisions (D-13, D-14, D-20, D-21, RISK-006) have no clock. The R3 remedy that agents could perform is never scheduled (F8). |
| **Expected benefit** | The public site and the benchmark's own internal findings stop drifting further apart. The founder gets one decision packet per week instead of ad hoc discoveries. |
| **Evidence** | `APPLIED_CHANGES.md` §2026-08-20, §2026-09-10; `AUTONOMY.md` R3; proposal-status grep (37 approved, 20 pending); DECISIONS index statuses |
| **Impact** | 4 |
| **Strategic alignment** | 4 |
| **Learning value** | 3 |
| **Confidence** | 4 |
| **Effort** | 2 |
| **Risk** | 2 |
| **Priority Score** | **11** |

**Concrete changes:**
1. Every held or unresolved item carries `held_since` and `remedy_owner` (agent or founder).
2. Agent-owned remedies (targeted evidence passes for self-vetoed proposals) enter the rotation as priority entities, at most N per cycle (for example 3), so they don't displace staleness rotation.
3. Founder-owned items older than 14 days go into a weekly decision packet with a recommended default. Items older than 30 days are flagged in `RISKS.md`.
4. Apply the Aging term (+1 per 5 cycles, already defined in `research/IMPROVEMENT_BACKLOG.md`) to both queues.

### 4a. How the changes map to control variables

Per the decision rules, change one control variable at a time. Suggested order: **R2 → R1 → R3 → R4 → R5**. R2 comes first because it is cheapest and makes the others measurable.

| Control variable | Current | Recommended |
|---|---|---|
| **Scoring weights** | Base rubric; Aging and Repetition penalty only in the May research backlog | Keep the base. Add **Aging** (+1 per 5 cycles, capped at +4) to both queues. Replace the Repetition penalty with **Recurrence** (+2 for an ungated class with 2+ occurrences). Add a non-score **Cadence-debt** override (R3). Track founder-blocked items separately with an age, not a score. |
| **Selection logic** | "Select exactly one" is written, but unscored programme work and founder pushes bypass it | Define three loop types (research cycle, improvement item, programme build), each with its own definition of done. Programme build items must carry a Priority Score before their first commit. Apply the generation throttle (R2). |
| **Agent invocation order** | Coordinator Step 2 calls PM, architect, QA, engineer and growth agents for candidates. No root-cause step. The critic step before publishing is the coordinator's own attention | (a) After a stage fails twice, run a root-cause pass that checks shared external constraints (budget, caps, credentials, environment) **before** any brief is rewritten or relaunched. (b) digest → **claim-trace** → lint/validators → human merge. (c) Rescope `meta-coordinator` to Compassion Benchmark (it is currently misfiled per AGENT-ROUTING D-5), then run it every 5 cycles or on any trigger in its definition. |
| **Cadence policy** | Implicit; "one cycle per session" recorded only in INC-008 | Written floor (R3); isolated sessions (R4); catch-ups disclose searches per day covered; weekly founder decision packet (R5); meta-review every 5 cycles or at each programme phase transition |

**Measurement: how to tell whether this worked in 30 days.**
- validated cycles per 7 days
- median age of open items scored 13+
- recurring-class instances with no gate
- number of public-briefing errors caught after the automated gates (should trend to 0, with claim-trace catching them instead)
- days since `SYSTEM_HEALTH.md` last matched reality
- count of approved-but-held proposals

If these don't move, the loop is still not learning.

---

## 5. PR/FAQ inputs

### Customer problem (operating-system lens)

Journalists, researchers, funders and the institutions being scored need three things from a benchmark that calls itself continuous:
1. The published score reflects recent evidence.
2. The score is a measurement, not a placeholder.
3. When the benchmark's own process finds a score is wrong, the public number changes on a predictable timeline.

Compassion Benchmark's refusal and traceability discipline is strong. What makes all three hard to guarantee today is the operating layer: cadence, prioritization, and learning that becomes checks.

### Hard FAQ questions, with honest answers

**Q1. You describe the research as continuous. How continuous has it actually been?**
- Daily cycles ran every day from 2026-05-20 to 07-31 except 07-19.
- From 08-01 to 09-14 there were 7 cycles in 45 days.
- The 09-02 → 09-13 window was covered by one catch-up scan of 276 searches, about the budget designed for a single night, and no briefings were backdated.
- The cause was partly a session-wide search cap (INC-008), misdiagnosed twice, and partly that capacity went to building the AI model benchmark with no recorded allocation decision.
- We are setting a written cadence floor and moving each cycle into its own isolated session.

**Q2. How much of what you publish has actually been measured?**
- As of the 2026-08-20 seed inventory, 834 of 1,289 published entities (about 59%) carried placeholder vectors that were never individually assessed.
- A de-seeding programme corrected several clusters in mid-August, but no de-seeding study has been committed since 08-24.
- The highest-risk placeholders are still unmeasured: four Fortune 500 companies at a seed of 92.4, and countries at 83.0.

**Q3. When your process decides a published score is wrong, how long until the site changes?**
- There is no guaranteed timeline today.
- 37 proposals approved on 2026-08-20 remain unapplied because the assessor who wrote them attached "do not apply without review" conditions. The specified remedy (a targeted evidence pass) has not yet been run for any of them.
- 20 more proposals are pending review.
- We prefer holding to publishing a score the assessor said wasn't ready. We are adding an aging clock and scheduling those remedies as routine research work.

**Q4. Why launch an AI model benchmark while the institution benchmark's cadence lapsed?**
- It wasn't a deliberate trade-off, and we won't claim it was.
- CB-MODEL is in pre-registration: no model has been scored, and it is blocked on a spend budget, a human rating panel and a methods committee.
- Its build-out took most engineering capacity in the week of 09-07 while no research cycles ran.
- Going forward, the institution cadence is a floor that takes priority over programme work, and any new programme must record its capacity claim before building.

**Q5. How do you stop the same kinds of error from recurring?**
- Partly. Scanner date errors produced three validator hardenings in July, and they still leaked on 09-14 (2025 facts inside 2026-dated articles), where the assessor caught them.
- A ~160× currency misreading (Jamaican vs. US dollars) was caught twice by review, and no automated currency check exists.
- A slug-collision problem documented in May was fixed in September.
- On 09-14 our coordinator corrected four factual errors in the public briefing after every automated check had passed.
- We are introducing a defect-class registry: any error class seen twice must get an automated check or a documented, owned waiver.
