# AI model weekly cycle plan: analyse and score AI models every week

**Date:** 2026-10-21. **Author:** product-manager. **Status:** PLAN (internal). It changes no protocol, data, score, page or decision.
**Directive (founder, 2026-10-21):** "publish a virtuous weekly cycle plan to analyze and score AI models."
**Public counterpart:** `research/ai-model-cycle/weekly-cycle-public.md` (copy for a frontend engineer; route not yet decided, see C-FD-3).

Every statement below traces to a repo file. Where the repo has no figure, this plan says "baseline to be set in week 1". Price, rate-limit and hosted-model availability figures do not exist in the repo and are not stated (MODEL_TESTING_V2_PROPOSAL §2, NA-001).

---

## 0. Read this first: what "score" means in this plan

1. **No model ranking, rank, band or composite is published today.** D-29 and D-29a forbid it. `/ai-models/leaderboards` says "No model ranking is published". The conditions for opening one are in section 7.
2. In this plan "score" means only the existing per-item rubric scoring used in unofficial pilot runs: each reply is rated 1 to 5 against that item's five-anchor rubric. Results are reported as 95% ranges, models listed alphabetically, "Not separated" groups first, every figure labelled "unofficial pilot ... not a score, comparability none" (D-29a items 2 to 4).
3. Nothing in this cycle makes a model comparable to another model, or to a lab. Waves have `comparability: none` until the founder decides otherwise (FD-2).
4. A weekly wave is therefore a **measurement**, not a **ranking**. The cycle's job is to make each week's measurement more trustworthy than the last, until the conditions in section 7 are met. Whether they ever are is a founder decision.

### State legend (used for every stage)

| Tag | Meaning |
|---|---|
| **RUNS TODAY** | Code or runbook exists and has been used, or can be used now with no new decision. |
| **READY, AWAITING <ID>** | Built, but blocked on a named founder decision. |
| **NOT BUILT** | No code or process exists. Named with the build item that creates it. |

### Hard lines carried into every stage

- Model Watch summarises and never assesses. Safety and welfare disclosures are the provider's words, with a source (PRD §3 edition format item 3; runbook line 11).
- Crisis-adjacent items locate failures. We do not advise which model to use (`DUTY_OF_CARE`, `site/src/components/model-benchmark/dutyOfCare.ts:9-10`). Five sensitive items are not served to subjects in the pilots (`pilot-2026-10-03.json:16`).
- Providers never pay for inclusion, testing priority, wording or scores (`INDEPENDENCE_LINE`, `site/src/components/model-watch/parts.tsx:8-9`; PRD C7). Queue order is a written deterministic rule (`QUEUE.json:4`). A release in Model Watch can make a build **eligible**. It never moves a build up the queue.
- Commit, push, deploy, any score write and any methodology change need founder approval (AUTONOMY §1b, lines 49-66). This cycle never writes `site/src/data/indexes/*.json`.

---

## 1. The loop (text diagram)

```
                       +--------------------------------------------------+
                       |  F5  METRICS -> BACKLOG  (Sat/Sun, every week)   |
                       +----------------------+---------------------------+
                                              ^   ^
     reader / provider corrections            |   |  weekly indicators (section 6)
     (info@ inbox, mailto link)               |   |
          |  F4                               |   |
          v                                   |   |
 +-----------------+  F1 new open-weight   +--+---+----------+  F6 reference build +
 |  A. MODEL WATCH |  releases = eligible  |  B. WAVE        |  + anchor drift     |
 |  Mon-Wed        +---------------------->|  Tue-Fri        +---------+           |
 |  scan, fact-    |  candidates (rule-    |  plan, collect, |         |           |
 |  check, edition |  ordered, never       |  judge, analyse,|         v           |
 |                 |  re-ordered)          |  audit, gates   |  stability series   |
 +--------^--------+                       +--+----+----+----+  (feeds protocol    |
          |                                   |    |    |        thresholds, by     |
          | F1b "Tested by us" label          |    |    |        new version only)  |
          | derived from queue + manifest     |    |    |                           |
          +-----------------------------------+    |    |                           |
                                                   |    |  F3 judge disagreement    |
                         F2 item and rubric        |    +-------------------+       |
                         defects found by runs     v                        v       |
                     +--------------------+  +--------------------+  +--------------+--+
                     | ITEM-FIX REGISTER  |  | JUDGE-PANEL        |  | HUMAN-VALIDATION |
                     | batched into next  |  | REGISTER           |  | QUEUE (items for |
                     | bank + protocol    |  | (family shift,     |  | first human      |
                     | version (founder)  |  | validity, drift)   |  | reviewers)       |
                     +---------+----------+  +---------+----------+  +--------+---------+
                               |                       |                      |
                               +-----------+-----------+----------------------+
                                           v
                       NEXT PROTOCOL VERSION  /  NEXT WAVE PLAN
                       (only by founder-approved version bump; frozen inside a week)
                                           |
                                           v
                     FRIDAY: ONE APPROVAL PACKET -> ship edition + wave that passed gates
```

### The seven feedback channels (what makes the cycle virtuous)

| ID | From (week N output) | To (week N+1 input) | Mechanism today | State |
|---|---|---|---|---|
| **F1** | Watch releases and catalog (`catalog-<d>.json`, `releases-<d>.json`) | Testing queue candidates: open-weight builds that fit `max_model_size_gb` 6.0 (PROTOCOL.json:44) become `queued` entries; hosted-tier candidates are listed for a later tier | The catalog does not link to `QUEUE.json`; adding a candidate is a manual edit. Selection stays rule-based (`QUEUE.json:4`) | Manual step **RUNS TODAY**; automatic feed **NOT BUILT** |
| **F1b** | Wave published and queue changed | Tracker "Tested by us" label (pilot / queued / not yet), derived from `QUEUE.json` and the waves manifest, no figure shown | `build-model-watch-data.mjs` writes `queue-snapshot.json` from `QUEUE.json` (ARCHITECTURE §3, lines 47-49); rule in PRD line 60 | **RUNS TODAY** |
| **F2** | Run results and claim audit: items whose rubric cannot be applied, replies that expose a defective prompt | **Item-fix register**, batched into a new bank version and a new protocol version. Never edited inside a week: `bank_sha256` is frozen in the protocol (PROTOCOL.json:11) and a methodology change needs founder approval (AUTONOMY line 65) | Bank versioning exists (`tasks-v1.json:4-5` v2.0, with `supersedes`); the register and batching process do not | Register **NOT BUILT**; bank change **READY, AWAITING a founder-approved protocol version** |
| **F3** | Judge disagreement, judge-validity failures, and (v2) the signed Claude-minus-non-Claude rating gap | **Judge-panel register** (who to add or exclude, which family) and **human-validation queue** (items to give the first human reviewers first) | Per-subject `judge_agreement` is already in every wave file (`pilot-2026-10-03.json:245-246`); validity rule in PROTOCOL.json:19-22; the registers and the queue do not exist. Only humans may author review records (`item-reviews-v1.json:15`) | Agreement figures **RUNS TODAY**; registers and queue **NOT BUILT** |
| **F4** | Reader and provider corrections | A dated, append-only correction on the affected page; a defect class if it repeats | Channel exists: mailto link and "Corrections are published as new dated records" (`parts.tsx:21-28`; D-29a item 7); edition corrections via `--append-correction` (runbook line 32) | **RUNS TODAY** (each publication needs founder approval) |
| **F5** | Weekly indicators (section 6) | Backlog rows scored in the existing v1/v2 format (`IMPROVEMENT_BACKLOG.md:116-122`) | Manual today. No script computes the indicators | Manual **RUNS TODAY**; script **NOT BUILT** (build item W-6, section 8) |
| **F6** | Reference build (re-run each wave, 1 trial) and anchor re-judging (6 stored replies per source subject) | Evidence for revising the anchor threshold 0.30, by a new protocol version only (PROTOCOL.json:25-41) | Code exists (`anchorVerdict`); no wave has run | **READY, AWAITING M-FD-1 (or v2 ask 2)** |

Independence check on the loop: no channel takes input that a provider can purchase or steer. F4 accepts factual corrections to sourced statements. It cannot change a wave figure except through a documented defect in the record, and then as a dated correction.

---

## 2. Weekly calendar (Monday to Sunday)

Target cadence is one Model Watch edition per seven days (PRD line 72; MW-WEEKLY, `IMPROVEMENT_BACKLOG.md:120`). It is a target, not a public promise (the signup copy says "No promise of weekly timing", `leaderboards/page.tsx:200,202`). Edition 2026-10-23 is the next due (window starts 2026-10-17, `IMPROVEMENT_BACKLOG.md:121`). 2026-10-21 is a Wednesday, so this week is a partial start and the first full cycle begins Monday 2026-10-26.

The wave column assumes the **v2 target design**. Under today's v1 path the judging step is hand work in sessions (about 75 batches per wave, `FOUNDER_DECISION_PACKET:38`) and a wave may slip a week. The edition does not wait for the wave.

| Day | Stage | Inputs | Outputs / artifacts | Owner | Gate | State |
|---|---|---|---|---|---|---|
| **Mon** | S1 Status and intake | `weekly-wave.mjs status` (exit 3 is reported to the founder first, `weekly-model-wave.md:28`); corrections inbox; last week's metrics sheet | Intake note; list of open corrections | agent | none | S1 **RUNS TODAY** |
| **Mon** | S2 Watch research | Last edition `window.to` (from `editions-manifest.json`); provider pages opened this session | `research/ai-model-tracker/catalog-<d>.json`, `releases-<d>.json`, `RESEARCH_NOTES_<d>.md`. Unverifiable fields are `null` | general-purpose agent with web tools | Every row has a source opened this session; a release row has a primary source (runbook line 16) | **RUNS TODAY** (used for 2026-10-16) |
| **Tue** | S3 Independent fact-check | S2 files | `FACT_CHECK_<d>.md` (every release, at least 20 catalog rows, all new or changed rows); MUST FIX and SHOULD DROP lists | second agent | Corrections applied through a parser, never by hand; secondary-only rows go to `heldOut` (runbook lines 19-20) | **RUNS TODAY** |
| **Tue** | S4 Import and validate | S2 and S3 files | `site/src/data/model-watch/` stores; `validate:model-watch` at 0 failures | agent | MW-L1 lexicon findings fixed by rewording data, never by weakening the rule (runbook line 25) | **RUNS TODAY** |
| **Tue** | S5 Queue candidates (F1) | S4 catalog, `QUEUE.json` | A proposed list of new `queued` entries with size and licence notes; non-commercial licences flagged (M-FD-5) | agent | Entries added only on approval in Friday packet; order follows the written rule | Manual **RUNS TODAY**; automatic **NOT BUILT** |
| **Tue** | S6 Plan the wave | Protocol, `QUEUE.json`, installed builds (`ollama /api/tags`) | `research/model-runs/wave-<date>/{run-config.json, PREREGISTRATION.md, weekly.json}`; cost estimate (v2) | agent | Plan committed before any reply exists. v1: founder approves the plan commit. v2: narrow standing authority pushes `waves/*` branches (CI only, never deploys, v2 §3 stage 2, §5 ask 3) | Dry run **RUNS TODAY**. Real plan **READY, AWAITING M-FD-1** (v1) or **V2 ask 2 + ask 3** (v2). Plan generator for "every eligible build" **NOT BUILT** (v2 build item 6) |
| **Tue night to Wed night** | S7 Collect, local | Committed plan | One record per call; `operations/collect-status.json` | scheduler (`CompassionBenchmark-WeeklyCollect`, 02:00 daily) | Defers unless free RAM covers the largest model plus 1.5 GiB; plan unmodified (`weekly-wave.mjs collect`) | **READY, AWAITING M-FD-3(a)** (task not registered as of 2026-10-15, `ITERATION_LOG.md:623-624`; Iteration 106) |
| **Tue night to Wed night** | S7h Collect, hosted | Committed plan | Same record schema plus raw response body, cost ledger | scheduler | Spend ceiling; collector stops at the ceiling and records a deviation | **NOT BUILT** (v2 build item 4) and **AWAITING V2 ask 1 / BLK-002** |
| **Wed** | S8 Compile edition | S4 data | `research/model-watch/editions/<d>.json`, compiled edition; lead 90 words or fewer; `coverage.notScanned` honest; `measuredNote` matches the waves manifest (runbook lines 26-30) | agent | A compiled edition is immutable once published (runbook line 31) | **RUNS TODAY** |
| **Wed to Thu** | S9 Judge | Collected replies | Judge answers (v1: Claude subagent batches, exactly 2 tool calls each, others voided. v2: scripted API calls, 2 judges per reply from 2 different families, neither the subject's) | agent (v1) / script (v2) | Judge validity: no more than 5% unfound quotes per judge; re-quote, supplement and reroute rules (PROTOCOL.json:19-22) | v1 **RUNS TODAY** (manual, heavy). v2 **NOT BUILT** (v2 build item 5) and **AWAITING V2 ask 1 and M-FD-8** |
| **Thu** | S10 Analyse | Judge answers | `analysis.json` (`analyze-pilot`), anchor verdict (comparable or NOT COMPARABLE), MCP probe, wave export, draft report | agent | Anchor drift at or below 0.30 (PROTOCOL.json:39) | Code built. **Not yet run on a wave-shaped config** (`ITERATION_LOG.md:648`) |
| **Thu** | S11 Claim audit | Draft report and raw records | Every number re-derived from raw files; deviations appended to `PREREGISTRATION.md` as dated `D<n>` | agent (qa-engineer second pair for v2) | Zero open items (`weekly-model-wave.md:73`) | Manual **RUNS TODAY**. `audit-wave.mjs` **NOT BUILT** (v2 build item 3) |
| **Thu** | S12 Feed the registers (F2, F3) | Analysis, audit, judge disagreement | Item-fix register rows; judge-panel register rows; human-validation queue rows (items only, no review text) | agent | Agents never write review records or rate items as validated | **NOT BUILT** (build item W-3, W-4) |
| **Fri** | S13 Gates and approval packet | All of the above | `operations/publication-gates.json` (v2: `wave-ready.mjs`); one packet: edition files, wave files, gates, deviations, cost, queue changes, pulls for next week, corrections to publish, exact pathspec | agent | v2 §4 gates 1-10, plus the Model Watch build gates (`npm run build`, `npm test`) | Manual gate-by-gate **RUNS TODAY**. `wave-ready.mjs` **NOT BUILT** (v2 build item 1, needs no founder decision) |
| **Fri** | S14 **Founder approval** | The packet | One reply, "ship week-<date>", authorises the items the packet lists. Items that failed a gate are left out and the rest still ships | **founder** | AUTONOMY §1b: commit, push, deploy | **RUNS TODAY** for the edition (every edition). For the wave: **READY, AWAITING V2 ask 4 / D-29b** |
| **Fri** | S15 Ship and verify | Approved packet | Commit (explicit pathspec), push, deploy, live check of `/ai-models/watch/<date>` and the wave report | agent, on approval | Pre-push chain clean; live URL returns the new edition | **RUNS TODAY** on approval |
| **Sat** | S16 Corrections and live check | Inbox; live site | Corrections drafted for next Friday packet (urgent factual error: out-of-cycle approval request, which is an extra approval and is logged as such) | agent | Append-only, dated (D-29a item 7) | **RUNS TODAY** |
| **Sat to Sun** | S17 Metrics and retrospective (F5, F6) | Section 6 indicators | Weekly metrics sheet; backlog rows for any indicator past its threshold; ranking-condition statuses re-checked (the hand-held ones carry a "last checked" date, `model-ranking-conditions.ts:20`) | agent | None. Writes `docs/` and backlog only (AUTONOMY §1a, line 39) | Manual **RUNS TODAY**. Script **NOT BUILT** (W-6) |
| **Sun** | S18 Seed next week | S17 output, queue | Next week's candidate picks (dry run), pulls to request on Friday | agent | none | Dry run **RUNS TODAY** |

Memory note: free memory is the binding constraint on this host. Heavy builds and collection must not overlap. Collection runs at 02:00 with apps closed; `npm run build` and `npm test` run in daytime with no model loaded (`weekly-model-wave.md:20`; Iteration 108 addendum, `ITERATION_LOG.md:150-151`: one run was killed for low memory).

---

## 3. Approvals: where each one sits

Rule: **one approval per wave**. The edition is a separate artefact with its own approval today (runbook line 9). This plan proposes they ride in one Friday reply (C-FD-2).

| Approval | Today (weekly-v1 path) | Target (weekly-v2 path, defaults accepted) |
|---|---|---|
| Ratify protocol | M-FD-1, once | V2 ask 2, once |
| Commit the plan (proves plan before data) | **Per wave**, M-FD-2 | None per wave, covered by V2 ask 3 (narrow standing authority, `waves/*` branches only) |
| Pull a new build | **Per new build** (runbook line 50) | In the Friday packet, listed for the next wave |
| Start collection | M-FD-3, once (register the scheduled task) | V2 ask 5, once |
| Hosted key and spend ceiling | not applicable | V2 ask 1, once (BLK-002); the ceiling stops the collector |
| Commit the result files | **Per wave** | Part of the Friday reply |
| Publish the wave (manifest entry `active`, push, deploy) | **Per wave** | The Friday reply ("publish wave-YYYY-MM-DD", v2 §4) |
| Dashboard route | M-FD-9 | V2 ask 4 (D-29b), once |
| Commit and deploy the edition | **Per edition** (runbook line 34) | Part of the same Friday reply (C-FD-2) |
| Weekly scheduler and unattended commits | FD-4: not yet | Same |

Count: under v1 the proposal counts "five or more separate founder approvals" per wave (v2 §1 R5, line 21). Under v2 with all defaults accepted it is one per wave after the one-time asks. A standing auto-publish is **not** proposed before two consecutive clean waves under per-wave approval (v2 §4, line 118).

The Friday reply is not a blanket. The packet lists each item with its gate result, and the founder can strike any line. A line that failed a gate cannot be added by the reply.

---

## 4. Stage inventory by state (what is ready, what waits, what is missing)

### RUNS TODAY (no new decision needed)
S1, S2, S3, S4, S8 (Model Watch weekly edition, one used: 2026-10-16). Manual S5, S11, S13, S16, S17. Plan dry run (S6, S18). Corrections channel (F4). Tracker label from queue (F1b). Judge step in v1 form (hand batches, Claude judges only). Wave file export and pilot report rendering for D-29a pilots (three exist).

### READY, AWAITING a named founder decision
| Stage | Decision | What it unlocks |
|---|---|---|
| S6 real plan | **M-FD-1** (ratify weekly-v1) or **V2 ask 2** (weekly-v2) | A real plan is refused while the protocol is `proposed` (`PROTOCOL.json:3`; `ITERATION_LOG.md:638-641`) |
| S6 plan commit | **M-FD-2** (v1) / **V2 ask 3** (v2) | The commit before collection that proves the plan preceded the data |
| S7 local collect | **M-FD-3(a)** | Scheduler registered; needs about 6.6 GiB free on run nights |
| S14 wave publication | **V2 ask 4** (D-29b) and per-wave reply | Dashboard route stays closed while `dashboard-decision.json:3` is `proposed` |
| Weekly automation | **FD-4** | Default: not yet |
| Email notification per edition | **FD-5** | Default: create list, no cadence promise |
| Non-commercial-licence builds | **M-FD-5** | Two queued builds are held until counsel answers |
| qwen3 thinking traces | **M-FD-6** | Harness change before its wave |

### NOT BUILT (and who builds it)
| Item | Build owner | Needs a founder decision first? |
|---|---|---|
| `wave-ready.mjs` gate runner and judge-token measurement on stored pilot-3 data | backend-engineer (v2 item 1) | No |
| Signed-drift anchor metric, reporting only | backend-engineer (v2 item 2) | No |
| `audit-wave.mjs` claim re-derivation | backend-engineer + qa-engineer (v2 item 3) | No |
| Hosted subject adapter, cost ledger | backend-engineer + security-engineer (v2 item 4) | Not to build against fixtures. Key and ceiling needed to run (V2 ask 1) |
| Judge API adapter, cross-family routing | backend-engineer (v2 item 5) | Not to build. Key needed to run |
| `PROTOCOL.v2` as a proposed file and a planner for every eligible build | backend-engineer (v2 item 6) | No (stays `proposed`) |
| Dashboard support for access tier and judge family | frontend-engineer + dataviz-architect (v2 item 7) | No |
| Scheduler covers hosted collection; runbook rewritten for v2 | devops-engineer (v2 item 10) | No |
| **W-1** Item-fix register (format + where it lives) | backend-engineer | No (internal doc/data) |
| **W-2** Catalog-to-queue candidate report (F1) | backend-engineer | No |
| **W-3** Judge-panel register from wave analysis (F3) | backend-engineer | No |
| **W-4** Human-validation queue export (F3) | backend-engineer | No. It is a list of item ids. Reviewers need BLK-005 |
| **W-5** One-reply Friday packet generator | backend-engineer | C-FD-2 to use it |
| **W-6** Weekly indicators script (section 6) | analytics + backend-engineer | No |

W-1 to W-6 are labelled "W" for this plan. They are not backlog rows until the coordinator files them.

As of 2026-10-21: no `research/model-runs/wave-*` directory exists, so no weekly wave has been planned or run (directory listing; consistent with `ITERATION_LOG.md:641`, `FOUNDER_DECISION_PACKET:6-7`). `wave-ready.mjs` and `audit-wave.mjs` do not exist (file search).

---

## 5. Stage specification: gates and failure behaviour

| Stage | Pass | If it fails |
|---|---|---|
| S2/S3 | Every row sourced; fact-check lists closed | Row to `heldOut` or dropped. The edition says what was not scanned (`coverage.notScanned`) |
| S4 | `validate:model-watch` 0 failures; `--check` exits 0 | Fix the data. Never weaken a rule |
| S6 | `weekly-wave.mjs check` OK; plan commit older than first record | No collection. Replan |
| S7 | Every planned call has an `ok` record or a pre-registered failure class | Wave remains `collecting`; no publication; deviation logged |
| S9 | At most 5% unfound quotes per judge (PROTOCOL.json:21) | One failing judge is excluded and rerouted. Two failing: instrument findings only (`weekly-model-wave.md:67`) |
| S10 | Anchor mean absolute drift at or below 0.30 | Wave labelled NOT COMPARABLE and not compared with earlier weeks (`weekly-model-wave.md:71`) |
| S11 | Zero open audit items | Wave not in the packet |
| S13 | All v2 §4 gates (plan-before-data, completeness, judge validity, agreement floor, anchor, variance, leak and blinding, claim audit, cost, content rules) | A wave failing a gate ships nothing for the wave. The edition can still ship |
| S14 | Founder reply | Nothing is committed, pushed or deployed |

A failed wave is itself an output: the failure goes into the weekly metrics sheet and, if repeated, the judge-panel or item-fix registers.

---

## 6. Weekly indicators

Baselines are from the repo on 2026-10-21. "Set in week 1" means the repo holds no figure. No indicator is a revenue claim; PRD §8 states revenue cannot be attributed to this work.

### Loop A: Model Watch

| # | Indicator | Definition | Baseline | Target / threshold | Source | If breached |
|---|---|---|---|---|---|---|
| A1 | Edition on time | Edition published within 7 days of the previous `window.to` | 1 edition (2026-10-16); next due 2026-10-23 | 90% of weeks over an 8-week view (PRD line 113) | `editions-manifest.json` | Backlog row; next edition states the gap in its window (PRD line 72) |
| A2 | Freshness | Days between build date and newest catalog `asOf` or edition date | 5 days (2026-10-16 to 2026-10-21) | At most 10 days; MW-W1 warns, never fails (ARCHITECTURE line 138) | catalog, editions | Warning triggers S2 |
| A3 | Sourcing | Rows with a source; release rows with a primary source; rows held out | 62 catalog rows and 21 release rows imported with 0 unsourced; 1 item held out (secondary only) | 100% sourced | `ITERATION_LOG.md:116-117` | Row removed |
| A4 | Fact-check yield | Corrections found per row checked | 5 corrected of 47 checked (22 releases and 25 catalog rows), 0 dropped | No target until three editions exist; direction: falling | `FACT_CHECK_2026-10-16.md`; `ITERATION_LOG.md:110-111` | Review source-handling rules |
| A5 | Lexicon findings | MW-L1 findings at import | 8 phrases reworded (2026-10-16) | Trend only | `ITERATION_LOG.md:115` | Check the research prompt wording |
| A6 | Gate integrity | Gate exemptions or loosened rules added | 0 | 0 (PRD line 118) | CI | Block |

### Loop B: testing waves

| # | Indicator | Definition | Baseline | Target / threshold | Source | If breached |
|---|---|---|---|---|---|---|
| B1 | Weekly waves collected | Waves under the weekly protocol | 0 | Set after protocol ratified; v1 pace is 2 new builds per wave (PROTOCOL.json:42) | `research/model-runs/wave-*` | Escalate blocker (Meta-review 12 §5) |
| B2 | Days since last measurement | Today minus last wave report date | 18 (pilot-3 report 2026-10-03; waves manifest) | Falling toward 7 once waves run | `waves/manifest.json:5-7` | Backlog row |
| B3 | Queue | Queued and measured builds | 9 queued, 4 measured | Burn rate set in week 1 (v1 allows 2 per wave: 5 weeks for 9, packet M-FD-4) | `QUEUE.json` | Re-plan |
| B4 | Completeness | Planned calls with an `ok` record | Not measured (no wave) | Failure-rate threshold to be set in v2 | `collect-status.json` | Wave held |
| B5 | Judge validity | Unfound-quote rate per judge | Not read for this plan; stored in pilot-3 analysis | At most 5% per judge (PROTOCOL.json:21) | `analysis.json` | Exclude and reroute |
| B6 | Judge exact agreement | Per subject | Pilot-3: 0.759 to 0.867 across 8 subjects | Floor proposed: pilot-3 lowest, 0.759 (v2 line 125). Not ratified | `pilot-2026-10-03.json:245-789` | Wave published only as judge-disagreement findings if v2 threshold set |
| B7 | Anchor drift | Mean absolute difference vs pilot-3 ratings | 0.146 (41 of 48 pairs exact), one observation | At most 0.30 (PROTOCOL.json:39-41) | `analysis.json` `bridge_drift` | NOT COMPARABLE |
| B8 | Reference stability | Weekly composite of the reference build | Set in week 1 (no threshold exists) | Threshold proposed in v2 | wave files | Investigate judging or host |
| B9 | Judge families | Distinct families judging | 1 (all Claude, PROTOCOL.json:12-16) | 3 (`model-ranking-conditions.ts:14`) | PROTOCOL | Condition stays not met |
| B10 | Spend vs ceiling | Cost ledger | No ledger (no key, BLK-002) | Within ceiling; judge tokens measured by v2 item 1 | cost ledger | Collector stops |
| B11 | Founder approvals per wave | Count of approval requests per wave | 5 or more (v2 line 21) | 1 | approval log | Backlog row |
| B12 | Plan-to-packet time | Hours from plan commit to packet | Set in week 1 | Set after week 4 | wave logs | Backlog row |

### Loop C: instrument quality

| # | Indicator | Definition | Baseline | Target | Source |
|---|---|---|---|---|---|
| C1 | Items human-validated | Two independent human reviews | 0 of 93 (`item-reviews-v1.json:8`; `tasks-v1.json:6`) | At least 3 rated items in every dimension (D-40; `model-ranking-conditions.ts:15`) | review log |
| C2 | Items served | Served vs not served | 83 served; 10 not served (5 sensitive, 5 unreviewed) (`pilot-2026-10-03.json:12-17`) | Trend only | wave file |
| C3 | Item-fix register | Rows opened, closed, batched | 0 (does not exist) | Set in week 1 | register |
| C4 | Human-validation queue | Items queued for first reviewers | 0 (does not exist) | Set in week 1 | queue |
| C5 | Ranking conditions met | Of 11 | **0 met, 1 in progress, 2 unknown, 8 not met** (derived from `model-ranking-conditions.ts` on 2026-10-21) | Never a goal in itself; reported | `model-ranking-conditions.ts` |

### Loop D: readers and providers

| # | Indicator | Definition | Baseline | Target |
|---|---|---|---|---|
| D1 | Corrections | Received; published; days to publish | Set in week 1 | Every accepted correction published dated, original kept |
| D2 | Signups by `model-watch-*` source | Newsletter events | Not instrumented for these sources (PRD line 115) | Baseline over first 2 weeks, then set |
| D3 | Page views on new routes | Analytics | 0 / not instrumented | Baseline over first 2 weeks |
| D4 | Provider contact | Requests to influence inclusion, order, wording or scores | Set in week 1 | All declined and logged; zero influence |

Launch metric for this plan: two consecutive full weeks with an edition shipped and a weekly metrics sheet written. Post-launch metric: four consecutive editions (PRD line 120) and, once ratified, two consecutive waves published under per-wave approval (`model-ranking-conditions.ts:16`).

---

## 7. From unofficial pilots to an official ranking

No stage here has a date. Each is conditional, and the last is a founder decision (FD-2, "Not yet" by default, PRD line 164).

### The 11 conditions, as of 2026-10-21

Statuses are those in `site/src/data/model-ranking-conditions.ts`. Hand-held statuses were last checked 2026-10-16 (line 20). I re-checked the evidence below on 2026-10-21 and found no change.

| # | Condition | Status | Evidence | What moves it | Who |
|---|---|---|---|---|---|
| 1 | weekly-v2 protocol ratified | **Not met** | `PROTOCOL.json:3` is `weekly-v1`, `proposed`; v2 exists only as a proposal | V2 ask 2 | founder |
| 2 | Dashboard decision ratified and active (D-29b) | **Not met** (derived) | `dashboard-decision.json:3` is `proposed`; no D-29b entry in `DECISIONS.md` (v2 line 25) | V2 ask 4 / M-FD-9 | founder |
| 3 | Judge panel of 3 families operating | **Not met** | All three judges are family `claude` (`PROTOCOL.json:12-16`) | V2 ask 1, adapter build (v2 item 5), M-FD-8 | founder + backend |
| 4 | Blinded or secure item pool exists | **Not met** (derived) | All items are `public-permanent` (`tasks-v1.json`, 93 of 93 matches); `allItemsPublic` (`model-index-facts.ts:140`) | A new secure pool authored and held; never routed through a hosted API without a no-retention setting (v2 line 43) | founder + item authors |
| 5 | Items human-validated, 3 or more rated per dimension | **Not met** (derived) | 0 reviews recorded (`item-reviews-v1.json:5,8,39`) | Two independent humans per item; agents may not author reviews | human panel |
| 6 | Human rating panel exists | **Not met** | BLK-005 OPEN (`.benchmark-ops/BLOCKERS.md:20`); rater welfare protocols must exist before recruiting (BLOCKERS lines 184-189) | Funding, recruitment, calibration | founder |
| 7 | Variance checks and agreement floors met | **Not met** | Floors only proposed (`model-ranking-conditions.ts:88-89`; v2 line 125) | Ratify v2, then meet floors | founder + waves |
| 8 | 2 consecutive waves published under per-wave approval, no open defects | **Not met** | No wave exists | Two clean Friday cycles after v2 | cycle |
| 9 | Open claim audits equal 0 | **Unknown** | A manual pilot-3 audit exists (`docs/ai-model-report/2026-10-03-pilot-3-claim-audit.md`) but there is no register of open items | `audit-wave.mjs` plus a register | backend + qa |
| 10 | Hosted and local never on one axis unless declared | **In progress** (manual) | No hosted wave exists. v2 labels access tier and keeps hosted a separate build (v2 lines 98, 166) | Dashboard support (v2 item 7) | frontend + dataviz |
| 11 | Legal and duty-of-care review complete | **Unknown** | The counsel question on two non-commercial-licence builds is open (M-FD-5); nonprofit formation documents are untracked in git status | Counsel answer; duty-of-care review | founder |

### Path

| Phase | Entry | What happens weekly | Unlocks (conditions) |
|---|---|---|---|
| **P0 (now)** | Today | Model Watch editions. Three unofficial pilots published. No weekly wave | none |
| **P1 Local weekly waves** | M-FD-1/2/3(a) (or V2 asks 2, 3, 5) | S6, S7, S9 (Claude judges), S10, S11, S13, S14 each week. Reference build and anchor run | Starts the series for #8. Still Claude-only judges |
| **P2 Hosted tier and cross-family judges** | V2 ask 1 (key, ceiling), build items 4 and 5 | Hosted subjects with variance check; 2 judges per reply from 2 families | #3, #7, #10 |
| **P3 Dashboard and clean-wave count** | V2 ask 4 (D-29b) after a first wave passes the gates (see C-FD-4) | Per-wave publication, two clean waves | #2, #8, #9 |
| **P4 Instrument** | Funding (BLK-005), rater welfare protocol, secure pool, counsel | F2 and F3 registers feed the first human review round; item-fix batches become new bank versions | #4, #5, #6, #11 |
| **P5 Decision** | All 11 met | Founder decides FD-2. First form: groupings with ranges, not an ordered list (`leaderboards/page.tsx:133-136`) | Any model comparison page |

P4 is the long pole. It is not agent-doable: it needs funding, humans and counsel. The cycle only prepares the inputs (the human-validation queue and the item-fix batches).

---

## 8. Build plan for the cycle itself

Order by dependency. Items 1 to 3 need no founder decision.

| # | Work | Owner | Done when |
|---|---|---|---|
| 1 | v2 item 1: `wave-ready.mjs` and judge-token measurement on pilot-3 | backend-engineer | Gates 1, 3, 5, 7, 8 run on pilot-2026-10-03; one planted defect per gate fails; real token counts replace the estimates |
| 2 | W-6: weekly indicators script for section 6, reading repo files only | analytics + backend-engineer | Each indicator in section 6 with a repo source prints a value; indicators with none print "not measured" |
| 3 | W-1: item-fix register format | backend-engineer | Register file exists; one pilot-3 finding entered as a test row |
| 4 | v2 items 2, 3, 6 | backend-engineer, qa-engineer | As in `MODEL_TESTING_V2_PROPOSAL.md` §6 |
| 5 | W-2, W-3, W-4 | backend-engineer | Reports derive from wave and catalog files; no review text is generated |
| 6 | v2 items 4, 5, 7, 10 | per proposal | Per proposal; none runs against a live key without V2 ask 1 |
| 7 | W-5 Friday packet generator | backend-engineer | One packet lists each approvable item with its gate result and pathspec |
| 8 | Public page from `weekly-cycle-public.md` | frontend-engineer | Counts and condition statuses derived at build, never typed (CLAUDE.md data notes; PRD C5) |

---

## 9. Risks

| # | Risk | Mitigation |
|---|---|---|
| R1 | The loop gets stuck on founder decisions. A single unanswered question stops the chain (v2 line 25) | Decision table in section 10 has one default per question; Friday reply carries everything |
| R2 | Shared judge taste: all judges are Claude, so a Claude model cannot be a subject (v2 line 15) | Cross-family panel (P2); the limit is stated on every pilot page |
| R3 | Host memory. Collection needs about 6.6 GiB free, 0.72 GiB was free on 2026-10-15 (`MODEL_TESTING_V2_PROPOSAL.md:17`, citing Iteration 106) | Run nights with apps closed; deferral is a reported status, not a silent skip |
| R4 | Hosted serving can change silently (v2 line 171) | Variance check, logged model strings, access-tier label |
| R5 | Item fixes in a loop become teaching to a public bank. The bank is public-permanent | Fixes batched into versions by the founder; secure pool is a ranking condition; fixes never edit the frozen protocol inside a week |
| R6 | Feedback channels become a pressure route for providers | Corrections accepted for factual errors in sourced statements only; queue order is a written rule; provider contact logged (D4); independence line on every page |
| R7 | Cadence promise exceeds capacity | Public copy says "aim", not "promise" (signup copy: "No promise of weekly timing"). Missed week states the gap in the next window |
| R8 | Bundled Friday approval reduces scrutiny | Packet lists each item separately; any line can be struck; failed gates cannot be added |
| R9 | Duty of care: results about crisis-adjacent items read as advice | Items locate failures only; no "which model" statements anywhere; crisis line on every page; rater welfare protocol before any human rating (BLOCKERS 184-189) |
| R10 | Agents' self-checks mistaken for human validation | Review records may only be authored by people (`item-reviews-v1.json:15`); the queue lists item ids only |
| R11 | Packet and proposal give conflicting defaults (Meta-review 12 §5, lines 128-136) | C-FD-1 below resolves it in one decision |
| R12 | Hand-held condition statuses go stale | Re-checked every Sunday (S17); status carries a date |
| R13 | The edition leaks assessment ("tested" read as "good") | "Tested by us" shows pilot / queued / not yet only; no figure outside pilot reports (PRD C1) |
| R14 | Public page raises expectations before anything runs | Every future stage marked planned and conditional; "no weekly run has taken place" stated |
| R15 | The Model Watch work shipped in Iteration 108 is committed (`47a1fa00`) but live deployment is not confirmed by the repo in this plan; public links assume it is live | Frontend engineer confirms the routes exist on the deployed site before publishing the page |

---

## 10. Founder decisions that unlock each stage, with defaults

Existing IDs keep their meaning. New IDs (C-FD-n) are proposed by this plan.

| ID | Decision | Default | Unlocks |
|---|---|---|---|
| **C-FD-1** | Resolve the v1/v2 conflict in one answer. Packet defaults say keep v1, 2 per week, Ollama signin, hold D-29b. Proposal says ratify v2, OpenRouter key, ratify D-29b (Meta-review 12 §5) | **Ratify weekly-v2 (V2 ask 2).** No v1 wave exists, so no series is lost (v2 line 141). Use v1 only if the founder wants a local-only start before a key exists | S6 real plan, P1 |
| **C-FD-2** | One Friday reply per week covering the edition and the wave that passed gates | **Yes** | One approval per wave in practice |
| **C-FD-3** | Public page route and publication of `weekly-cycle-public.md`. A new route extends D-57's route list | **Yes**, route `/ai-models/cycle` (proposal only), added to nav/sitemap by the frontend engineer | Public plan |
| **C-FD-4** | D-29b timing | **Ratify D-29b in the first wave's approval packet**, not before a wave exists. This honours M-FD-9 ("hold until the first weekly wave exists") and ask 4 together | P3 |
| V2 ask 1 | Hosted key and monthly ceiling (BLK-002) | Yes, key stored outside the repo; ceiling founder-chosen | S7h, S9 (v2), P2 |
| V2 ask 2 | Ratify weekly-v2 | Yes | S6 |
| V2 ask 3 | Narrow standing commit authority (`waves/*` branches, three files; needs AUTONOMY §1b amendment) | Yes | Removes per-wave plan-commit approval |
| V2 ask 4 | Ratify D-29b with the §4 gates as publication conditions; per-wave publish reply | Yes (timing: C-FD-4) | S14 for waves, dashboard |
| V2 ask 5 / M-FD-3(a) | Register the 02:00 task; leave PC on, heavy apps closed | Yes | S7 |
| M-FD-5 | Non-commercial-licence builds | Hold both until counsel answers; skip them at week 3 if no answer | Queue moves on |
| M-FD-6 | qwen3 thinking traces | Keep default, store trace, never show judges | Its wave |
| M-FD-8 | Non-Claude judge | Yes once a key exists | #3 |
| FD-2 | Open a model comparison | **Not yet** | P5 |
| FD-4 | Weekly scheduler and unattended commits | Not yet (the 02:00 collect task is the only unattended piece, V2 ask 5) | Standing auto-publish, after two clean waves |
| FD-5 | Weekly email list | Create list, no cadence promise | Notifications |
| BLK-005 | Human panel funding and recruitment | Founder-owned; welfare protocol first | #5, #6 |
