# PRD: AI model evaluation workflow (D-60 programme)

**Date:** 2026-10-22. **Author:** product-manager. **Status:** PROPOSAL (internal). It changes no protocol, data, score, page or decision.
**Directive:** D-60 (`DECISIONS.md:72-94`). It authorises design documents, research tooling kept "proposed", experiments on pilot-1 to pilot-3 data, and a results-review procedure. It does not authorise a commit, a key or spend, a ratified protocol, a model ranking, band or official score (`DECISIONS.md:89-94`; D-29, D-29a), or any change to published copy or `site/src/data/**`.
**Sources:** `docs/MODEL_TESTING_V2_PROPOSAL.md` (V2), `docs/AI_MODEL_WEEKLY_CYCLE_PLAN.md` (CYC), `docs/PRD_AI_MODEL_WATCH.md`, `research/model-runs/README.md`, `research/model-runs/weekly/{PROTOCOL,QUEUE}.json`, `site/src/data/model-ranking-conditions.ts`, `IMPROVEMENT_BACKLOG.md`.
**Wording rule:** this PRD measures a workflow. "Score" means only the per-item rubric rating in an unofficial pilot (CYC:13-16). Nothing here ranks or compares models for a reader.

---

## 1. Problem and users

**Problem.** The repo has a complete pilot harness but no running evaluation loop. Three pilots exist; no weekly wave has run; judging is manual hand work done by Claude subagents; every judge is one family; no item has been seen by a human; and a wave needs five or more founder approvals (V2:13-21). The result is that new models are listed (Model Watch) but not tested, and the instrument is not improving from its own results because no review procedure or register exists (CYC:82-83, 244-245).

**Job to be done.** Turn a newly released model into a reviewed, pre-registered, publishable-or-not measurement with the fewest founder stops, and turn each result into a concrete fix to the instrument.

**Why now.** The founder asked for it (D-60). V2 and the cycle plan are approved in principle (D-59, `DECISIONS.md:106-114`), but PROTOCOL.v2 has no file (`IMPROVEMENT_BACKLOG.md:97-103`). Four weeks of agent-doable work remain possible without a key.

| Persona | Role | Need | Cannot do today |
|---|---|---|---|
| **Founder-operator** (primary) | Approves waves, publication, spend, protocol | One reply per week with every approvable item, its gate result and a default | Get one packet: approvals are serial, "a single unanswered question stops the whole chain" (V2:25) |
| **Reviewer** (agent now; human later) | Checks validity, audits claims, reviews items | A fixed procedure and a register to write findings to | Review against a checklist: the claim audit is manual (V2:13); item-fix and judge-panel registers do not exist (CYC:82-83); only humans may author item reviews (`item-reviews-v1.json:15`) |
| **Public reader of pilot reports** | Reads `/ai-models/reports/*` | Ranges, caveats, "unofficial pilot", no advice on which model to use | Know what a pilot can and cannot support; `comparability: "none"` (`waves/manifest.json:6`) |
| **Provider** | Wants a fair, factual record | Correction route; proof that payment cannot change testing | Be told when a build is queued or tested other than via a label (`PRD_AI_MODEL_WATCH.md:31`) |

Buyer: not applicable. No revenue is attributed to this work (CYC:208). Independence applies throughout: providers never pay for inclusion, queue priority, wording or scores (CYC:30).

---

## 2. Success metrics

Baselines were measured on 2026-10-22 from the repo. Targets are **proposed**, bounded by D-60 (no key, no ratification, no ranking), and for the founder to adjust. "Not measured" means the repo holds no figure; the target is to start measuring.

| # | Metric | BEFORE (2026-10-22) | Command / file used | AFTER target (4 weeks) |
|---|---|---|---|---|
| M1 | Founder approvals needed per wave | **5 or more** (ratify, plan commit, pull, result commit, publish) | `docs/MODEL_TESTING_V2_PROPOSAL.md:21`; `CYC:128-141` | A generated Friday packet (W-5) lists exactly 1 per-wave approval item; the one-time asks are listed once. Measured on a fixture, since no wave may run |
| M2 | Days from model release to test | **Not measurable.** `QUEUE.json` holds no release date. Example: `qwen3:8b` is queued, released 2025-04-29, so 541 days old and untested on 2026-10-22 | `catalog-v1.json:26` (`releaseDate`), `:58` (`benchmarkLocalTag`); `weekly/QUEUE.json:70-78`; date arithmetic is mine | W-2 report prints release date, age in days and queue state for every queued build (9). A target for days-to-test is set after the first wave |
| M3 | Weekly waves run | **0** (no `research/model-runs/wave-*` entry). Pilot directories: **3** (`pilot-2026-10-01`, `-02`, `-03`); manifest lists 3 | Glob `research/model-runs/wave-*` (empty); `site/src/data/model-benchmark/waves/manifest.json:1-29` | 0 real waves (not authorised). 1 fixture rehearsal that passes `check` and every runnable gate |
| M4 | Judge families | **1** (all three judges `claude`) | `weekly/PROTOCOL.json:12-16` | 1 (cannot change without a key). The gap is quantified, not hidden: E2 reports the signed gap among the three Claude judges |
| M5 | Items with human review | **0 of 93** | `item-reviews-v1.json:5,8,39` | 0 (agents may not author reviews). Human-validation queue exists listing ids only (W-4) |
| M6 | Ranking conditions met | **0 of 11** (8 not met, 1 in progress, 2 unknown) | `model-ranking-conditions.ts:38-120`, counts derived by hand and equal to `CYC:246` | 0 met. Condition 9 (claim audits) moves from "unknown" to a computed value once `audit-wave.mjs` and a register exist. Condition 1 may move to "in progress", dated, when PROTOCOL.v2 lands as proposed (`IMPROVEMENT_BACKLOG.md:102-103`) |
| M7 | Publication gates automated | **0 of 10** (`wave-ready.mjs` and `audit-wave.mjs` do not exist) | Glob `research/model-runs/**/{wave-ready,audit-wave}*.mjs` (none); V2 §4 gates | **5 of 10** (gates 1, 3, 5, 7, 8; MT-V2-1 acceptance, V2:160), each with a planted defect that fails it |
| M8 | Manual judging load | **171 judge batches, 2,656 ratings** in pilot-3; 8 batches voided and re-run | `ITERATION_LOG.md:1039-1041` | Unchanged (needs a key). Real judge token counts measured on stored batches, replacing estimates (V2:59-61) |
| M9 | Judge exact agreement | Overall **0.821** over 1,328 responses; per subject **0.759 to 0.867** | `pilot-2026-10-03/analysis.json:1719-1724`, `:488`, `:571` | E2 gives a bootstrap interval for each, so a floor can be judged against noise |
| M10 | Days since last measurement | **19** (last report 2026-10-03) | `waves/manifest.json:7`; date arithmetic is mine | No target until waves run; reported weekly by W-6 |
| M11 | Queue | **9 queued, 4 measured** | `weekly/QUEUE.json:13-114` | Unchanged (only the founder-approved session edits it) |
| M12 | Pilot experiments pre-registered and reported | **0** | `docs/model-eval/` holds no experiment file | **At least 5 of the 6** in section 5 registered before analysis and reported with a decision recommendation |
| M13 | Registers and procedures | Item-fix register, judge-panel register, human-validation queue, results-review procedure: **0 of 4** exist | `CYC:244-245` | **4 of 4** exist, each with one test row |

Launch metric: M7 at 5 of 10 and M13 at 4 of 4. Post-launch metric: the first wave's Friday packet needs one per-wave reply (M1) and M6 is recomputed from files, not by hand.

**Missing assumption:** the cost of a wave in money and judge tokens is unmeasured (V2:66-68). Metric M8 starts that measurement. No price is stated (NA-001).

---

## 3. Scope

### 3a. MVP: next 4 weeks, under D-60 limits (no key, no ratification, no ranking, no commit)

All items are agent-doable, internal and "proposed". Files live in `docs/model-eval/` or `research/model-runs/` and are disjoint from Iterations 112-113 (`DECISIONS.md:85-87`).

| Week | Must have | Maps to |
|---|---|---|
| 1 | `wave-ready.mjs` gate runner and judge-token measurement on pilot-3 (MT-V2-1). `PROTOCOL.v2` as a **proposed** file listing every open value and its default (PROTOCOL-V2-1). Experiments E1, E2, E3 | M7, M8, M9, M12 |
| 2 | Signed-drift anchor metric, reporting only (V2 item 2). `audit-wave.mjs` (V2 item 3). Experiments E4, E5, E6 | M6, M7, M12 |
| 3 | W-1 item-fix register; W-3 judge-panel register; W-4 human-validation queue export (ids only); results-review procedure (section 4, story 6) | M5, M13 |
| 4 | W-6 weekly indicators script; W-2 catalog-to-queue report; W-5 Friday packet generator; fixture-only hosted-adapter and judge-adapter designs (no key is read; tests use recorded fixtures only, V2:163-164). One fixture rehearsal of the whole loop | M1, M2, M3 |

Instructions to write alongside (under `docs/model-eval/`): intake, wave planning, running, judging, validity review, results review, publication decision, item fixes, experiment proposals. One page each; each states who may do it and what it may not do.

**Should wait:** dashboard access-tier display (V2 item 7), scheduler changes (V2 item 10), a public page about experiments.

### 3b. Later (after the key and ratification)

| Gate | Work |
|---|---|
| V2 ask 1 (key, ceiling) | Live hosted subjects, cross-family judge panel, variance check, cost ledger |
| PROTOCOL-V2-2 (ratify file) | First real plan, first v2 wave, `weekly.json` committed before any reply |
| V2 ask 3 and 5 | `waves/*` plan commits, the 02:00 task |
| First wave passes gates | D-29b in the first approval packet (D-59, `DECISIONS.md:109-111`) |
| BLK-005 and rater protections (CYC-RATERS) | Human item review, human rating panel |
| FD-2 | Any model comparison, which is not planned |

### 3c. Explicit non-goals

- No model ranking, leaderboard, band, "best model" or advice about which model to use (D-29, D-29a; `DUTY_OF_CARE`, CYC:29).
- No official score and no write to `site/src/data/indexes/*.json`.
- No hosted API call, key handling, spend, or scheduler registration.
- No change to a ratified or published protocol, bank (`bank_sha256`, `PROTOCOL.json:11`), or published copy.
- No agent-authored item review and no agent standing in for a human rater (`item-reviews-v1.json:15`).
- No provider access before publication, no provider-paid testing or priority (CYC:30).
- No commit, push or deploy (AUTONOMY §1b).
- No public claim from an experiment in section 5 until the founder approves it (FDM-1).

---

## 4. User stories and acceptance criteria

Each story's criteria are observable. "Gate" means a check that fails closed and has a planted-defect test.

**S1. Intake of a new model** (founder, provider)
As the founder I want each newly released model classified in the weekly edition so that I can see what can be tested.
- AC1. For every new open-weight release with a primary source, the W-2 report lists: catalog id, `releaseDate`, size in GB, licence, whether an Ollama tag exists, and `eligible` / `not eligible` with the rule that decided it (`max_model_size_gb` 6.0, `PROTOCOL.json:44`; non-commercial licence flag, M-FD-5).
- AC2. A hosted-only release is listed as "hosted tier, later" with no run.
- AC3. Queue order follows the written rule in `QUEUE.json:4`; the report cannot reorder it. A test supplies a release marked "sponsored" and shows no change in order.
- AC4. A release without a primary source is listed as "held out", not queued.

**S2. Wave planning** (founder, reviewer)
- AC1. `weekly-wave.mjs plan` on a fixture writes `run-config.json`, `PREREGISTRATION.md` and `weekly.json`, and prints the pathspec. It refuses a real plan while the protocol status is `proposed` (CYC:155).
- AC2. The plan names the protocol version, bank sha, each build by tag and digest, the reference build (1 trial) and the anchor sample (6 per source subject, `PROTOCOL.json:38`).
- AC3. `check` fails if any fixed field differs from the protocol. One planted difference per fixed field.
- AC4. The packet states the number of calls and an estimate in tokens (money is "unverified" until a price exists).

**S3. Running** (reviewer, operator)
- AC1. `status` exits 3 when the last collect failed or was deferred (`README.md:200`), and the Monday intake note reports it first.
- AC2. A deferral for low memory is a recorded status with free and needed GiB, never a silent skip.
- AC3. Every planned call has an `ok` record or a failure class registered in advance; otherwise the wave stays "collecting" and is not packet-eligible.
- AC4. Fixture rehearsal only in this MVP.

**S4. Judging** (reviewer)
- AC1. Routing gives each reply 2 judges, never the subject's family (`README.md:127-130`); the property test covers every subject.
- AC2. `judge-validity` runs before assembly; more than 5% unfound quotes fails a judge (`PROTOCOL.json:20`); two failures mean instrument findings only (CYC:196).
- AC3. A voided or re-run batch is logged with the reason. The judge-panel register (W-3) gets a row per failure, per judge, per wave.
- AC4. The report states "judges: 1 family" while it is true (M4).

**S5. Validity review** (reviewer, second pair)
- AC1. `wave-ready.mjs` writes `operations/publication-gates.json` for gates 1, 3, 5 (unsigned and signed), 7, 8; the other gates read "not run: reason".
- AC2. Anchor drift above 0.30 labels the wave NOT COMPARABLE (`PROTOCOL.json:39`); the signed drift per judge is shown beside it.
- AC3. The reviewer is a different session from the drafter of the report. A review by the drafter is marked "self-check".
- AC4. `audit-wave.mjs` re-derives every number in the draft from raw records; any mismatch is an open item. It reproduces the pilot-3 audit findings (`docs/ai-model-report/2026-10-03-pilot-3-claim-audit.md`).

**S6. Results review** (reviewer, founder)
- AC1. A written procedure (`docs/model-eval/RESULTS_REVIEW.md`) lists, in order: gates, deviations, judge validity, agreement against floor, anchor, length check (`analysis.json:1546-1559`), separation claims after Bonferroni, claim audit.
- AC2. Every finding is filed as one of: item fix, judge-panel change, protocol change, correction, or "no action". Each row names its evidence file and line.
- AC3. The review produces no sentence of the form "model X is better than model Y". The language gate (DC-25, `IMPROVEMENT_BACKLOG.md:109-114`) passes.
- AC4. Open items count feeds ranking condition 9 (M6).

**S7. Publication decision** (founder)
- AC1. The Friday packet (W-5) lists each approvable item with its gate result and exact pathspec. A line that failed a gate cannot be added by the reply (CYC:143).
- AC2. The founder can strike any line and the rest still ships.
- AC3. A wave that fails a gate ships nothing for the wave; the edition can ship (CYC:199).
- AC4. Publication labels follow D-29a: ranges, alphabetical order, "Not separated" first, "unofficial pilot", `comparability: none` (CYC:14).
- AC5. Approvals per wave are counted in the packet (M1).

**S8. Item fixes** (reviewer, founder)
- AC1. The register (W-1) has fields: item id, defect, evidence (file:line), signals (judge disagreement, E4 flags, reply exposure), status, first seen, proposed fix, `bank_version_target`.
- AC2. No row edits the live bank. Fixes are batched into a new bank version and protocol version, founder-approved (CYC:82).
- AC3. The register never contains review text from an agent presented as human review. W-4 exports ids only.
- AC4. One pilot-3 finding is entered as a test row.

**S9. Experiment proposals** (any agent; founder approves public use)
- AC1. A proposal file `docs/model-eval/experiments/EXP-<n>.md` states hypothesis, data files, method, the decision it informs, and an analysis plan, **before** any result is read.
- AC2. It is hashed (sha256) and the hash and time are written into the file before analysis. The data are the already-collected pilots only.
- AC3. Results are marked "exploratory" unless the plan fixed the test in advance. No experiment changes a stored rating or score.
- AC4. The output ends with a recommended decision and the founder decision it feeds, never a ranking.

---

## 5. Experiment backlog (on existing pilot data, no new model run, no key)

Common rules (pre-registration): write the plan file and its sha256 before opening the rating fields; fix seeds; use `bootstrap_replicates` 1000 (`PROTOCOL.json:23`); report intervals not just points; label every output "pilot-3 data, unofficial, not a score". Field names below must be checked against the files before the plan is hashed.

| ID | Experiment | Hypothesis | Data | Method | Decision it informs | Pre-registration |
|---|---|---|---|---|---|---|
| **E1** | Judge-order (position) effect | A rating depends on where its reply sits in a 16-entry batch (`PROTOCOL.json:18`) | `pilot-2026-10-03/judge-batches/*.json` (entry order), `judge-answers/*.json`, `keys/judge-key*.json` | Regress rating on within-batch position with item and subject fixed effects, per judge; permutation test over positions | Whether batch size or shuffling must change in v2; whether position is a gate | **Required.** Fix the position bins and test before reading ratings |
| **E2** | Judge leniency and agreement noise | Fable, Opus and Sonnet differ in signed leniency; the lowest per-subject exact agreement (0.759, `analysis.json:488`) is within sampling noise of the highest (0.867) | Same files; `analysis.json:230-830` | Signed mean difference per judge pair on shared replies; bootstrap interval for each subject's exact agreement | Whether the proposed floor (lowest observed, V2:125) is a real floor or noise; signed-drift gate threshold (METH D-1) | **Required.** The floor under test is fixed in the plan |
| **E3** | Length bias | Longer replies get higher ratings after controlling for item; the "length is not a criterion" instruction (README:174-175) does not remove it | `analysis.json:155` (existing within-item log-words regression), subject answers, judge answers; arm B vs arm A for llama3.2 and qwen2.5 where the length instruction worked (`analysis.json:1570-1595`) | Within-item slope per judge; natural experiment: B minus A rating change against word change, effective builds only | Whether v2 reports a length-adjusted figure; whether batch text needs a new length sentence | **Required** (exploratory for the natural experiment, since arms were not designed for it) |
| **E4** | Item difficulty and discrimination | Some items are at ceiling or floor, or do not separate builds, so they add noise | 83 served items (`pilot-2026-10-03.json:12-17`), all ratings across 8 variants | Per item: mean, spread across variants, spread across judges for the same reply; ratio of between-variant to within-reply variance; flag by pre-set rule | Item-fix register rows (W-1); order of the human-validation queue (W-4); bank v3 content | **Required.** Flag thresholds are fixed in the plan, not tuned on results |
| **E5** | Bootstrap stability | The scorer's trial-level intervals are too narrow because two judges' ratings of one reply are treated as independent trials (`README.md:268-276`); response-clustered intervals are wider | Rating rows via judge key; pairwise separations (`ITERATION_LOG.md:1052`: 5 of 6 uncorrected, 3 of 6 Bonferroni) | Recompute composites with reply-clustered and item-clustered bootstrap, 1000 replicates; compare which separations survive | Interval method in v2; wording of every "separated" claim in pilot reports | **Required.** Which clustering is primary is fixed first. Any change to a published report is a separate founder-approved correction |
| **E6** | Re-judge drift calibration | The anchor threshold 0.30 (about twice one observation, `PROTOCOL.json:40`) is too loose or too tight, and drift has a sign | Bridge ratings: 48 pairs, mean 0.146, 41 exact (`PROTOCOL.json:40`; `analysis.json:1663`); `scorecards/bridge-drift.json` | Resample the 48 pairs for an interval on mean drift; signed drift per judge; compare with within-run agreement (E2) | Threshold in PROTOCOL.v2 (a new version only); METH D-1 signed-drift gate | **Required.** Only one observation exists, so the output is labelled "calibration, n = 1 bridge" |

Each experiment is cheap to run offline. Judge-token counts (M8) are a by-product of reading the stored batches and are not an experiment.

---

## 6. Founder decisions (not already in `FOUNDER_DECISION_PACKET_2026-10-23_FRIDAY.md`)

V2 asks 1, 3 and 5, FD-2, FD-4 and BLK-005 are already open and listed in that packet (lines 74-78); they are not repeated. The decisions below are new to this PRD.

| ID | Decision | Default | Unlocks |
|---|---|---|---|
| **FDM-1** | May experiment results (section 5) be cited publicly? | **No.** Internal only. A public use needs a dated founder approval and its own claim audit | E1-E6 may run now; no public wording risk |
| **FDM-2** | Standard for "eligible within 7 days of release": a model is listed as a candidate in the next Friday packet if it has a primary source and an Ollama tag of 6.0 GB or less | **Yes.** Queue order stays the written rule (`QUEUE.json:4`); candidates never jump the queue | M2 reporting, S1 |
| **FDM-3** | Provider courtesy notice: after a pilot page is published, send the provider a plain notice with the correction route (mailto). No pre-publication access, no preview | **Yes, after publication only** | Provider story; independence preserved |
| **FDM-4** | Trigger for a new bank version: an item enters the next bank version only when two independent signals agree (for example an E4 flag and a judge-disagreement row), and only when the founder approves the batch | **Yes** | W-1 register becomes actionable without editing inside a week |
| **FDM-5** | Reviewer independence until humans exist: the reviewer of a wave must be a different session from the drafter; the report states "no human review" | **Yes** | S5 AC3; stops self-check passing as review |

---

## 7. Risks and open assumptions

| # | Risk or gap | Handling |
|---|---|---|
| 1 | Experiments tempt a public claim from pilot data | FDM-1; AC S9.4 |
| 2 | Position, length or leniency findings imply the published pilot reports were wrong | Findings go to the correction path (new dated record, D-29a item 7), never a silent edit |
| 3 | Tooling built against fixtures hides live-API failures | Marked "fixture-only" until V2 ask 1; live smoke test is V2 item 8 |
| 4 | All judges are Claude, so shared taste cannot be seen in agreement figures (`README.md:279-280`) | Stated in every result; M4 stays at 1 |
| 5 | Hand-held ranking-condition statuses go stale | W-6 recomputes derivable ones; the others carry a date (`model-ranking-conditions.ts:20`) |
| 6 | Release dates are in the catalog, not in the queue | W-2 joins them; no new data file in `site/src/data/**` is written |
| 7 | Cost per wave is unknown | M8 measures judge tokens on stored batches; no price is asserted |

**Handoffs.** system-architect: PROTOCOL.v2 open values; backend-engineer: MT-V2-1, V2 items 2, 3, W-1 to W-6; qa-engineer: planted-defect tests and second-pair audit; analytics: M1-M13 and E1-E6 analysis plans; ux-designer: Friday packet layout; frontend-engineer: none in this MVP.
