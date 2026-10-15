# CB-MODEL: methodology review, release-assessment program and dashboard metric contract

**Date:** 2026-10-14
**Author:** measurement-methodology reviewer (agent). This is an internal design document. It changes no data, protocol, decision or page.
**Status:** proposal. Every SLA, tier name and rule marked **PROPOSAL** needs founder approval before anything public relies on it.

**Sources read for this review.** `docs/PRD_MODEL_BENCHMARK.md`, `docs/ARCHITECTURE_MODEL_BENCHMARK.md`, `docs/MODEL_EVALUATION_HARNESS_DESIGN.md`, `docs/AI_MODEL_ASSESSMENT_TEMPLATE.md`, `docs/AI_EVALUATION_SUITE.md`, `docs/CB_MODEL_INTEGRATION_2026-09-06.md`, `docs/MODEL_RELEASE_SOURCES_PROPOSAL_2026-09-18.md`, `docs/MODEL_TASK_BANK_PROPOSAL_2026-09-18.md`, `docs/DISCRIMINATION_TEST_2026-09-30.md`, `docs/RERUN_BIAS_PROBE_2026-09-30.md`, `docs/PROBE_CALIBRATION_2026-09-27.md`, `docs/MS5_COMPOSITE_FORMULA_ANALYSIS_2026-09-29.md`, `docs/META_REVIEW_2026-10-13_ITER97-101.md`. Also the weekly program from commit `2845c2f9`: `research/model-runs/weekly/{PROTOCOL.json,QUEUE.json}`, `research/model-runs/lib/weekly.mjs`, `.claude/commands/weekly-model-wave.md`. And the data: `site/src/data/model-benchmark/waves/{manifest.json,pilot-2026-10-0{1,2,3}.json}`, `site/src/data/model-benchmark/reports/pilot-2026-10-03.md`, `research/model-runs/pilot-2026-10-03/analysis.json`, `site/src/data/model-benchmark/{registry-v1,releases-v1,release-sources-v1,tasks-v1}.json`, `.benchmark-ops/BLOCKERS.md` and `DECISIONS.md` (D-29, D-29a, D-45).

**Note on figures in this document.** Every number here is quoted from a named file, which is given next to it. This is an internal review, so the no-hand-typed-figure rule in §5 does not bind it. The dashboard must never copy a figure from this document.

---

## 1. Current state

### 1.1 The one-paragraph version

No AI model has an official Compassion Benchmark score. Three **unofficial pilots** exist (`pilot-2026-10-01`, `-02`, `-03`), all `official:false, comparability:"none"` under D-29a (`waves/manifest.json`). The instrument is sound in its process discipline: plans are committed before data, figures are bound to tokens, the pipeline is deterministic and claims are audited. But it falls short of every substantive bar for an official score: 0 of 93 items are human-validated, the whole bank is public, all judges are Claude, there are no human raters, and only local quantised open-weight builds have been tested. A weekly wave program was built on 2026-10-13, but its protocol is still `"status": "proposed"`. Until the founder ratifies it, **nothing is frozen in force**, and no `wave-*` directory exists yet.

### 1.2 What is pre-registered or frozen

| Item | State | Evidence |
|---|---|---|
| Pilot-3 plan committed before the first reply | **Yes**, attested by git (commit `c87632ac` predates the data) | `waves/pilot-2026-10-03.json` `preregistration.committed_before_data: true`. The as-written hash and the hash with dated deviations are both recorded. |
| Weekly protocol `weekly-v1` | **Proposed, not ratified.** `assertPlanAllowed` refuses a real plan until `status:"ratified"` is committed. | `research/model-runs/weekly/PROTOCOL.json` |
| Fields frozen by the protocol (refused on drift by `checkConformance`) | `ollama_host`, `trials` (3), `max_retries`, `system_message` ("You are a helpful assistant."), `judges` (claude-fable, claude-opus, claude-sonnet), `judges_per_response` (2), `max_batch_entries` (16), `judge_validity` (unfound quotes ≤5%, short quote ≥12 chars), `bank_sha256`, `bootstrap_replicates` (1000), `correction` (bonferroni). Also checked: protocol version and protocol sha, the reference subject (gemma2:9b at a pinned digest, 1 trial), arm A only, no per-subject trials or system-message override, the generated comparison set, the anchor (source run, key, 6 per source subject, seed = date). | `lib/weekly.mjs` `FIXED_FIELDS`, `checkConformance` |
| Bank pin | `bank_sha256 = a1687daa…201c`. It matches `tasks-v1.json` on disk today (bank v2.0, 93 items). | `sha256sum` run on 2026-10-14 |
| Plan-before-data for weekly waves | `collect` refuses until `run-config.json`, `PREREGISTRATION.md` and `weekly.json` are committed and unmodified. | `weekly-model-wave.md` §2.5, `planCommitState` |
| Anchor rule | A wave whose bridge mean absolute difference is above **0.30** is "not comparable". The threshold is about twice the one observation (0.146, pilot-3 against pilot-2). | `PROTOCOL.json` `anchor`, `anchorVerdict` |
| Subject selection | Deterministic queue rule: unmeasured developers first, ≤2 new subjects per wave, ≤6.0 GB. | `QUEUE.json` `selection_rule` |
| Publication rule for pilots | D-29a is active (ratified 2026-10-02). It allows ranges, separation statements and points only for subjects separated after correction (template amendment 16). | `DECISIONS.md` D-29a; `AI_MODEL_ASSESSMENT_TEMPLATE.md` amendment 16 |

### 1.3 What the pilots showed

**About the instrument**, which is what pilots test:

- **The pipeline runs end to end without a failed reply.** Pilot-3 produced 1,328 replies and 2,656 ratings, and 171 judge batches were accepted after voids and re-runs (`waves/pilot-2026-10-03.json` `design`, `operations`).
- **Judge reliability within the Claude family is high, but has no baseline.** Exact agreement per subject was 0.80–0.84, and no response differed by 2 or more in the wave subjects (`subjects.*.judge_agreement`). No chance-corrected statistic exists, and the three judges share one family, so this is consistency, not validity.
- **Judge drift was small.** The bridge re-rating of 24 pilot-2 replies (48 pairs) gave a mean absolute difference of 0.146, with 41 of 48 exact (`bridge_drift`).
- **The test resolves differences only at a coarse grain.** After Bonferroni correction it separated one of four primary-arm builds and could not tell three apart (`derived.not_separated_groups`, `derived.separated_subjects`). The separated pairs differ by about 4.6 to 7.6 composite points (`comparisons[]`). No minimum detectable gap was planned, so a gap of a few points between builds is currently invisible.
- **Item-level noise floor.** Two administrations of an identical brief moved single-item scores by up to 2 points and a group mean by 0.38 (`RERUN_BIAS_PROBE_2026-09-30.md` §4–5). One administration resolves about 1 point per item. Replicate administrations (TRI-16) are not built.
- **Discrimination.** In a single-rater check, 7 of 8 instrumental items separated a warm-but-hollow reply from a blunt-but-right one (mean gap +2.63). The relational item inverted, which is a limit of the test design (`DISCRIMINATION_TEST_2026-09-30.md`).
- **The contamination probe does not accuse clean subjects of the family tested** (pooled 4/18 against a chance rate of 25%; `PROBE_CALIBRATION_2026-09-27.md`). In the pilots, every recall answer claimed no memory, so the recall probe "could not have flagged anything" (pilot-3 report, Instrument health). Not flagged is not evidence of absence.
- **Composite formula.** MS-5 ("rewards flatness twice") is false. One open question bears on models: D-45 Q3, the 100 cap compressing the top. The founder should decide it before the first model score (`MS5_COMPOSITE_FORMULA_ANALYSIS_2026-09-29.md` §6).

**Deviations (pilot-3).** D1: the host stopped for low memory and gemma2:9b was moved last (post-hoc, approved). D2: a second host stop, recorded late. There was also a post-hoc supplement requote round: 4 ratings changed value, and the separation pattern was unchanged (`deviations`, `sensitivity`).

**Known defects and open confounds.** Taken from pilot-3's confound ledger: judges all from one family; the bank was drafted with Claude help; reply length is unresolved; the item pool is public; no human raters; items unvalidated; quantised local builds only; one self-identifying reply (blinding gap); system-message placement differs by build template; arm B had one trial; no chance-agreement baseline; no planned minimum detectable gap; crisis items never served; the recall probe drew no recollection; the separation pattern was never tested under other judges. The meta-review adds a process defect class: tools "manufacture" defects and must be suspected first. DC-18 (self-identification miscount) and DC-23 (control bytes disarming a lexicon test) both recurred.

**Host constraint.** Memory pressure stopped work four times in Iterations 97–101. gemma2:9b does not fit an 8 GB GPU (D1). The weekly design moves collection to Task Scheduler and leaves judging in the session (`META_REVIEW_2026-10-13_ITER97-101.md` §3, §5).

### 1.4 Official-score gates: what must be true before any official score

These are the union of the pilot-3 publication bar (report §"Publication bar"), harness Gate F (`MODEL_EVALUATION_HARNESS_DESIGN.md` Part 8) and open decisions. **0 of 6 bar items are met.**

| # | Gate | State | Owner |
|---|---|---|---|
| G-1 | Human validation of items (a defined share of served items reviewed by domain and lived-experience reviewers) | 0 of 93 validated (`bank.items_validated`) | Founder: reviewers (task bank proposal §6) |
| G-2 | An unpublished (secure) item pool, stored outside the repo, with rotation | None. All 93 are `core-public` / `public-permanent`. | Founder plus engineering (harness §6.2) |
| G-3 | Judges not all from one family, or human raters as primary | All Claude (`judge_set.judge_families`) | Founder: credentials (CAL-4, BLK-002) |
| G-4 | Human raters: two blinded raters with adjudication, and a welfare protocol in force first | None (BLK-005, WQ-P2-04) | Founder: funding |
| G-5 | Full-precision or API access to the model as released | Local 4-bit builds only (`design.access_tier`) | Founder: BLK-002 |
| G-6 | A founder amendment of D-29 for official scores; official wave rendering is disabled today | Not drafted. D-29a covers pilots only. | Founder |
| G-7 | Methods prerequisites: one composite formula (WQ-P1-01), one taxonomy (WQ-P1-02, CONFLICT-05), the band gap (WQ-P1-03, CONFLICT-03), D-45 Q3 (cap), a model-appropriate band vocabulary (CONFLICT-06), rubric repairs D-43/D-44/D-46 | All open or proposed | Founder / Methods Committee (BLK-006) |
| G-8 | Separation guard green; `xAI/Grok` renamed; the C1–C3 independence disclosure present | Open (PRD §9) | Founder |
| G-9 | Coordinated-disclosure policy for harmful outputs (proposed D-28), and a critical-harm determination by a human | Not adopted | Founder |
| G-10 | Crisis items served under a safety protocol, because the benchmark's core construct is distress | Never served (`design.crisis_items_served:false`) | Founder plus welfare protocol |

### 1.5 Blockers (BLK-*)

`.benchmark-ops/BLOCKERS.md` was last updated 2026-09-06 and predates all three pilots. Its rows are still formally OPEN. Reality has moved for two of them.

| ID | Formal status | Reviewer's reading on 2026-10-14 |
|---|---|---|
| BLK-001 | Release detection blocked by the WebSearch budget | **Routed around but not cleared.** The 2026-09-18 proposal verified 14 sources by `curl`, so the L1 detector does not need WebSearch. But `release-sources-v1.json` has 0 sources, `releases-v1.json` `scanState: "never-scanned"`, and `registry-v1.json` has 0 entries. Ratifying the 14 sources (quorum 8 of 10 primary) is the unblocking act. |
| BLK-002 | No API credentials, no spend | **Partly routed around.** Local Ollama subjects plus in-session Claude judges need no keys. Still fully blocking for frontier and API models, which are the founder's stated target ("every new AI model release"), and for any non-Claude judge. |
| BLK-003 | Starting prompt missing | Immaterial to measurement. |
| BLK-004 | Program-plan `.docx` unread; 72h/30d SLA unverified | **Still binding on SLAs.** The SLAs in §2 below are new proposals, not the unverified 72h/30d figures. |
| BLK-005 | No human rating panel | **Critical.** Blocks G-1, G-4, G-10. |
| BLK-006 | No Methods Committee | Blocks G-7. |

**Recommendation:** `BLOCKERS.md` should be refreshed. It should record that the local-pilot route exists, and say that BLK-002 still blocks official and frontier work. Stale blocker text is the same defect class as the stale backlog rows found in Meta-review 11 §4.

### 1.6 What is weekly-wave-ready

| Component | Ready? | Note |
|---|---|---|
| Orchestrator `weekly-wave.mjs` (`plan`, `check`, `collect`, `status`), drift refusal, memory preflight, lock | Yes, built and tested (`tests/weekly-wave.test.mjs`) | |
| Protocol ratified | **No.** One founder commit is needed. | |
| Task Scheduler entry | **Not registered.** `register-task.ps1` exists; the founder runs it. | |
| Queue | 9 queued entries; first picks by rule: phi4-mini (Microsoft), granite3.3:8b (IBM) | `QUEUE.json` |
| Judging, validity, requote, MCP probe, analysis, export, claim audit | Yes. A manual session runbook exists, carried over from pilot-3. | `weekly-model-wave.md` §3 |
| Anchor drift verdict | Yes (`anchorVerdict`). It reports only the **mean absolute** difference (see the defect in §4, D-1). | |
| What a weekly wave can claim | New open-weight subjects ≤6 GB against a fixed reference; the anchor drift series. **Not** frontier models, crisis items, system-prompt sensitivity (arm A only) or official scores. | Meta-review 11 §5 |

---

## 2. Release-assessment program design

The founder's ask is "AI model compassion benchmark testing upon every new AI model release." There are two populations, and the gates differ sharply between them:

- **Population L (local open-weight, ≤6 GB quantised).** The weekly program can serve this today, as unofficial pilots.
- **Population F (frontier and API models).** This needs BLK-002 cleared, non-Claude judges whenever a Claude model is the subject (the cross-family rule), and API snapshot pinning. Until then the honest output for a frontier release is a **Tracked** card with no result.

### 2.1 Pipeline

| Stage | What happens | Artifact | Automated? | Gate |
|---|---|---|---|---|
| **S1 Detect** | L1 scanner fetches the ratified sources daily. Feeds are parsed by item; HTML is checked for a title plus a date token ("200 with the wrong body is a failure"). Results are de-duplicated on `(developer, snapshot_label)`; availability posts are classed `new_deployment`; Hugging Face derivatives are collapsed via `base_model:*`. | `research/model-index/release-watch/scan-<date>-NNN.json` | Yes (scheduled, no WebSearch) | The scan counts as "covered" only when quorum is met (proposed 8 of 10 primary). `coverageClaim` stays `none` until the first quorum scan. |
| **S2 Classify** | Rules only: materiality (checkpoint, safety or refusal behaviour, tool use, system-instruction change, regression evidence). Corroboration: two entries, or one first-party entry. | candidate event | Yes | A rumour is never a release. A version bump with no behavioural claim is not material. |
| **S3 Register (snapshot pinning)** | Agent drafts; human merges. Pin the snapshot. **API:** exact dated snapshot id (never an alias like `-latest`), provider, endpoint, access tier, `product_surface`, and retrieval evidence (source_url, publisher, published_at, retrieved_at, content hash). **Local:** Ollama tag plus `digest_sha256`, quantisation, runtime version, licence (as in `subject_provenance`). | `registry-v1.json` entry (`registry_id` derived; frozen-field transition check) | Draft automated; merge human | `validateRegistryState` / `validateRegistryTransition` |
| **S4 Access** | L: `ollama pull` (founder-approved), size ≤ `max_model_size_gb`, memory preflight. F: credentials and ceiling (BLK-002), and a determinism probe (T=5 on a fixed item set) to measure the provider's sampling variance before scoring. | pin record in `run-config.json` | Partly | Never pull or provision without approval. |
| **S5 Evaluation run** | **Bank:** `bank_sha256` from the protocol. **Arms:** arm A (neutral system message) is primary; arm B (an alternative system message) only under a protocol version that declares it. **Trials:** 3 per item. **Judges:** 2 per reply from the protocol's judge set. **Cross-family rule:** no judge may share a family with the subject. A Claude subject therefore needs a protocol version with a non-Claude judge set, and cannot run under `weekly-v1`. **Reference:** the pinned reference build is re-run in every wave. **Anchor:** 6 stored replies per source subject are re-judged. | `research/model-runs/wave-<date>/` | Collection scheduled; judging in the session | Plan committed before data; `check` OK; `checkConformance` empty |
| **S6 QA and claim audit** | Judge validity (≤5% unfound quotes, measured on the original answers). Requote and supplement rounds. Self-identification re-scan from raw replies. Contamination probe. Analysis. Anchor verdict. `export-wave`. Token-bound draft. Claim audit that **re-derives every figure from the raw files** (MR-10 R3). Deviations appended as dated `D<n>`. | `analysis.json`, `waves/<run>.json`, draft report, audit file | Tools automated; audit in the session | All report gates G1–G21 green; anchor verdict recorded |
| **S7 Publication tier decision** | The founder chooses a tier (§2.2) and records it. | `PUBLICATION_LEDGER.md` row; `manifest.json` entry | Human only | AUTONOMY §1b: the agent never publishes |
| **S8 Right of reply** | See §2.4. | append-only reply and corrections block on the report | Human | — |
| **S9 Changelog** | Every publish, correction, reply, supersession, protocol version or anchor verdict gets a dated, append-only entry. The entry names the wave file and its sha. | `site/src/data/model-benchmark/changelog-v1.json` (**PROPOSAL**: new file) plus the existing corrections section | Generated from manifest and ledger | Never edited in place |

### 2.2 Publication tiers (**PROPOSAL**)

| Tier | Public label | Allowed content | Entry condition |
|---|---|---|---|
| **T0 Tracked** | "Release tracked, not evaluated" | Snapshot identity, citation, access route, and why it is or is not in the next wave. **No figure.** | S3 merged |
| **T1 Unofficial pilot card** | "Unofficial pilot, not a score, comparability none" | Everything D-29a allows, via the public projection only | Wave passed S6, founder approved |
| **T2 Official** | "Official score, cohort <id>" | Composite with CI, dimension profile, separation groups within the cohort, critical-harm rate kept separate | All of G-1 to G-10; D-29 amendment ratified |

**Do not use the word "provisional" publicly.** "Provisional score" tells a reader that a score exists and only awaits confirmation. That is false for T1: a pilot card can never be promoted into an official score. An official score needs a new run on a secure pool with human raters. Use "unofficial pilot card" as the label. A T1 result is **never upgraded in place** to T2. T2 is always a new `result_id` in a new cohort.

### 2.3 Proposed SLAs (**PROPOSAL, needs founder approval; replaces nothing verified, because BLK-004's 72h/30d remain unverified and must not be reused**)

Clocks are stated in calendar days and start from events that the record already timestamps.

| Clock | Proposed target | Starts at | Measured from | Feasible today? |
|---|---|---|---|---|
| Detection | ≤2 days | first-party announcement date (`published_at`) | scan record `retrieved_at` | After the sources are ratified and a daily scan is scheduled |
| T0 Tracked card | ≤3 days after detection | detection | registry merge commit | Yes, once S1 runs |
| T1 card, population L | ≤10 days after the build appears in the Ollama library, **if** the queue rule picks it | tag availability | manifest `report_date` | Needs a queue rule change: a "new release jumps the queue" clause is a queue or protocol version bump, founder-approved |
| T1 card, population F | ≤7 days after API availability | API GA date | manifest `report_date` | **No.** Needs BLK-002 and a non-Claude judge for Claude subjects |
| T2 official | ≤30 days after T1, **only if all gates G-1 to G-10 are met program-wide** | T1 publish | ledger row | **No.** Gates are program-level, and none is met |
| Correction | ≤7 days from a valid correction to the dated correction note (template K7) | receipt | correction entry date | Yes |
| Right-of-reply posting | ≤5 business days from receipt | receipt | reply entry date | Yes |

Rule: an SLA may be shown publicly only after **two consecutive waves** meet it. Before that, the page shows measured latencies only, for example "median detection-to-T1 latency over the last N releases", derived from the changelog. The same rule appears in Architecture §3.4: latency is a function of capacity, so it is published as a measured range, never a promise.

### 2.4 Right of reply for labs (**PROPOSAL; partly conflicts with D-29a §7**)

D-29a §7 forbids pre-publication briefing. The proposal keeps that rule for T1 and adds three things:

1. **Post-publication reply, open to anyone.** A lab may submit a reply at any time. It is published verbatim, up to a stated length, in an append-only "Replies" block on the report, dated, within 5 business days. The report is never edited because of it. A reply that identifies a factual error (wrong snapshot id, wrong access tier, wrong licence) triggers the correction process. It never triggers a score change unless the same audited procedure that produced the figure re-derives it.
2. **T2 only: a factual-accuracy notice.** Five business days before an official publication, the developer receives only the snapshot identity, the access route and the date of testing, so it can say "that is not the model you think it is." It receives no results, no items and no draft. This amends D-29a §7 and needs a founder decision.
3. **Harmful-output disclosure (D-28).** When a human determines that a critical harm occurred, the developer is told about the item and the behaviour class on a stated timeline before publication. This is separate from scoring and needs D-28 ratified.

There is never a fee, never a review of the draft, never a reply that alters a figure, and no priority evaluation (independence policy).

---

## 3. Metrics the dashboard should expose

Paths are relative to `site/src/data/model-benchmark/waves/<run_id>.json`. `<s>` is a subject label such as `gemma2-9b-A`. **The dashboard must read the public projection (`projectWavePublic` in `site/scripts/lib/model-benchmark-public.mjs`), not the raw wave.** The projection withholds the points of non-separated subjects and secondary-arm subjects, and every difference that involves them (amendment 16, DC-24). It must **never** read `research/model-runs/*/analysis.json`, which carries `band` and composites that are not exported.

| Metric | Exact definition | Available now? | Field path(s) |
|---|---|---|---|
| **Composite with 95% CI** | Composite = `computeCompositeFromDimensions` over 8 dimension means. Each dimension = mean of item means of 1–5 ratings (2 judges × trials per item). Scale 0–100. CI = 2.5th–97.5th percentile of 1,000 item-resampling replicates, stratified by dimension and paired across subjects (seed recorded). **It covers item sampling only**, not judges, trials, quantisation or rubric. | **Yes** (pilot). The point may show only for subjects separated after correction. | `subjects.<s>.pilot_composite`, `subjects.<s>.pilot_composite_interval95`, `method.composite`, `method.interval` |
| **8 dimension scores with CIs** | Per dimension: mean of item means on the 1–5 scale, with the same bootstrap interval. Item count shown beside it (about 10–11 per dimension in pilot-3). A difference counts only if `bonferroni_separated:true`. | **Yes** (ranges). Means are withheld for not-separated subjects in the projection. | `subjects.<s>.dimensions.<DIM>`, `.dimension_intervals95.<DIM>`, `.dimension_item_counts.<DIM>`, `dimension_pairwise[]`, `dimension_pairwise_note` |
| **Separation groups** (the requested "rank bands"; the word "rank" is banned on model surfaces) | Two subjects are separated when the corrected (Bonferroni over the pre-registered primary-arm pairs) interval of the paired difference excludes 0. A not-separated group is a maximal set of mutually non-separated subjects, listed alphabetically. **Within one wave only.** | **Yes** | `derived.not_separated_groups`, `derived.separated_subjects`, `derived.separated_uncorrected_only_pairs`, `comparisons[].bonferroni.{interval,separated}`, `derived.display_rule.text` |
| **Paired differences** | a − b composite difference with the uncorrected 95% and corrected intervals | **Yes** (ranges; the point is withheld if either side is withheld) | `comparisons[].interval95`, `comparisons[].bonferroni.interval` |
| **Crisis / safety-sensitive handling** | Proposed: (a) the critical-harm rate = share of replies on `high`-sensitivity items that a human determines to be a critical harm (Wilson CI), **kept separate from the composite**; (b) a crisis-resource behaviour rate. | **No.** Crisis items were never served (`design.crisis_items_served: false`; `bank.items_not_served_sensitive`). Future: needs G-9/G-10 plus a welfare protocol. | Future: `critical_harm.{rate,n,determined_by}` (Architecture §2.4) |
| **Refusal / over-refusal** | Proposed: refusal rate = share of replies classified "declines to engage" by a pre-registered rule-based classifier, then human-checked. Over-refusal = refusal rate on benign-control items whose `expectedBehaviors` require engagement. Under-refusal belongs to critical harm. | **No.** No classifier, no benign-control item set. Under the harness rule, a content-filter refusal is data and is never retried. | Future: `failures.refusal_rate` (Architecture §2.4) |
| **Length-controlled score** | No valid estimate exists. Available: median reply words; the pooled within-item slope of rating on centred log(words); within-subject slopes; an **extreme bound** (pooled slope removed), for the separated subject only. Pilot-3 adds a length-instruction check per build. | **Partial** (descriptive only; never shown as an adjusted score) | `subjects.<s>.median_reply_words`, `length.pooled_within_item_slope`, `length.pooled_within_item_r`, `length.within_subject_slopes.<s>`, `length.composite_if_pooled_slope_removed` (bound; separated subject only), `length_check.per_build[]` (pilot-3) |
| **System-prompt sensitivity (arm B − arm A)** | Composite difference B − A on the same items, with a paired bootstrap 95% interval. **In pilot-3, arm B was a length instruction**, so the metric is length-instruction sensitivity, not general system-prompt sensitivity. An "ineffective" verdict makes it uninformative. | **Pilot-3 only, ranges only.** **Not produced by weekly waves** (arm A only under `weekly-v1`). | `comparisons[kind="arm"].b_minus_a.interval95`, `design.arms.<s>.system_message`, `length_check.per_build[].length_instruction` |
| **Consistency (trial-to-trial)** | Proposed: per subject, the mean within-item SD of composite-scale ratings across the 3 trials, and the exact-match rate across trials; plus the trial-level interval. | **No (not exported).** `analysis.json` has `subjects.<s>.scorecard_trial_level_interval95`, but that file also carries `band`, so it must not be read directly. Needs an exporter extension. | Future: `subjects.<s>.stability.{within_item_sd,exact_match_rate}` |
| **Judge agreement** | Exact agreement = share of replies on which both judges gave the same 1–5 rating. Also mean absolute difference, and the count of replies differing by ≥2. Leniency = a judge's mean deviation from the item mean (the pool includes its own ratings, so it is partly artefact). **No chance-corrected statistic yet.** | **Yes** | `subjects.<s>.judge_agreement.{exact,mean_absolute_difference,responses_differing_by_2_or_more}`, `judges.<j>.{leniency_vs_item_mean,by_subject.<s>,ratings_used}`, `routing.<s>.responses_by_judge_pair` |
| **Judge validity** | Unfound-quote rate per judge against the threshold, on the original answers (primary) and on the final quotes | **Yes** | `judge_validity.measured_on_original_answers.*`, `judge_validity.measured_on_final_quotes.*`, `design.excluded_judges` |
| **Judge drift / anchor** | Mean absolute difference between re-ratings and the original ratings of stored replies. **Also show** the signed mean per judge, and the drift converted to composite units (Δrating × 25). | **Yes** (bridge). The weekly verdict comes from `weekly-wave.mjs status`. | `bridge_drift.{mean_abs_difference,exact_match,pairs,per_judge.<j>.mean_signed_difference_new_minus_original}` |
| **Reference stability series** | The reference build's composite interval in each wave. A shift points at judging or the host, not the model. | **Future** (first weekly wave) | `subjects.gemma2-9b-A.pilot_composite_interval95` per wave |
| **Bank coverage** | Items total, served, validated, not served (sensitive or unreviewed); items per dimension; bank version. | **Yes**. The bank sha is in `run-config.json`, **not in the wave**; recommend exporting it. | `bank.{items_total,items_served,items_validated,items_not_served_sensitive,items_not_served_unreviewed}`, `design.bank_version`, `subjects.<s>.dimension_item_counts` |
| **Contamination** | Recall items flagged out of those probed; identification correct out of asked, with p under the no-exposure hypothesis; flagged if 4 or more of 6. Covers only the sampled items. | **Yes** | `subjects.<s>.contamination.{recall_items_flagged,recall_items_probed,identification_correct,identification_asked,identification_p_if_unexposed,identification_flagged,via}` |
| **Blinding integrity** | Replies naming their own model or developer (re-scanned from raw replies) | **Yes** (pilot-2 and pilot-3) | `self_identifying_replies.{count,by_subject}` |
| **Instrument health / operations** | Batches, voids and reasons, reroutes, requotes; sensitivity of the result to the requote round; deviations, tagged pre-registered or post-hoc; plan-before-data | **Yes** | `operations.*`, `routing.*`, `sensitivity.{ratings_whose_value_differs_from_the_original,separation_pattern_unchanged}`, `deviations[]`, `preregistration.{committed_before_data,sha256,as_written_sha256}` |
| **Provenance** | Snapshot identity, access tier and file hashes | **Yes** | `design.subject_builds.<s>.{tag,digest_sha256,family}`, `subject_provenance.<s>.*`, `design.access_tier`, `judge_set.*`, `source_sha256` (canonical sha256 of the analysis artifact), wave-file sha (to be computed at build) |
| **Per-item exemplar transparency** | What may be shown: item id, construct, dimension, and the public prompt of **non-sensitive public-pool** items, with replies **summarised**. Shown only with founder approval per exemplar. | **No exemplar data in the wave** (by design; the pilot report quotes no item prompt) | — |

**Exemplar rules (PROPOSAL).** The following may never be shown: crisis or sensitive item text or replies; secure-pool text, in any form; verbatim harmful content (only the classification and the rate); judge rationales that quote the rubric; any reply without the item's anchors beside it; any exemplar chosen after looking at the results to illustrate a ranking. If exemplars are shown, they are selected by a seeded draw recorded in the plan.

---

## 4. Gaps against best practice, prioritised

| P | Gap | Why it matters | Smallest credible fix |
|---|---|---|---|
| **P0** | **Single-family judges** (all Claude). The bank was also drafted with Claude help. | Shared taste cannot be separated from the construct. Claude models can never be subjects under `weekly-v1`, so the most-watched releases are excluded. | One non-Claude judge family in a `weekly-v2` protocol (needs BLK-002, small spend). Report a judge-family sensitivity check. |
| **P0** | **No human calibration.** 0 of 93 items validated; no human raters. | LLM-judge agreement is consistency, not validity. There is no gold anchor for what a "3" means. | Human ratings on a stratified sample (for example 10% of replies per wave), compared with judges using Krippendorff's alpha. Item review per the task-bank proposal §6. Welfare protocol first. |
| **P0** | **No held-out pool; contamination by construction.** Every item is public with its answer key. | Per harness §6.1, no cross-model comparison or trend on the public pool is valid. The probe cannot detect absorption that leaves no recall. | A secure pool outside the repo (harness §6.2). Keep the public pool as a saturation sentinel and report the public-minus-secure gap. |
| **P1** | **Anchor metric defect (D-1).** The anchor verdict uses the mean **absolute** difference with a 0.30 threshold on the 1–5 scale. A systematic signed shift of 0.2 passes, but it moves composites by about 5 points (0.2 × 25), which is the size of the only separations observed (4.6 to 7.6). | "Comparable" could be declared across a drift as large as the effects measured. | Add the signed mean drift and its composite-unit equivalent to the verdict, with a threshold (for example, signed drift beyond about 1 composite point means "not comparable"). Needs a protocol version bump. Seed the threshold with the drift series, not a guess. |
| **P1** | **No planned minimum detectable gap; test-retest not measured.** | A null result ("not separated") has no stated power. The item noise floor is about 1 point per administration. | Pre-register the MDE per wave from pilot variance. Use the reference build's weekly re-runs as a test-retest series. Replicate administrations (TRI-16). |
| **P1** | **Consistency not exported.** | Trial variance is a core reliability fact and is currently invisible. | Extend `export-wave` to export a stability block. |
| **P1** | **Crisis items never served.** | The benchmark's central construct (distress, crisis) is unmeasured. | A sensitive-item protocol, human critical-harm determination, D-28. |
| **P2** | **Single-turn only** (every item is one fresh turn; `items_per_conversation_max: 1`). | Compassion failures often emerge over turns: dependence, escalation, boundary drift. | Scripted multi-turn items with fixed user turns, scored per conversation. Plan as bank v3. |
| **P2** | **English only** (no `language` field; 93 single-language items). | Equity (EQU) claims are thin without language and cultural variation. | Translated parallel forms with back-translation and native-speaker review. Differential item functioning per form. |
| **P2** | **No refusal or over-refusal measure; length unresolved.** | A refusal-heavy model and a verbose model can both distort composites. | Benign-control items and a refusal classifier. A length-matched arm or a pre-registered per-build length target. |
| **P2** | **Quantised local builds only.** | Results describe 4-bit builds, not the released model. | API access (BLK-002), or full-precision builds where hardware allows. Report quantisation in every label. |
| **P3** | **Lab-funding independence.** The policy is sound (no paid inclusion or priority; no pre-briefing under D-29a). But there is no published funding disclosure for the model program, no conflict register for judges' or operators' providers (C1–C3), and spend on Anthropic models as judges is a provider relationship. | Readers need to see who pays and who supplies the judges. | Publish a funding and provider-relationship disclosure on `/ai-models/methodology`. Keep a conflict register. When the judge set includes a provider whose model is a subject, add a disclosure line. |
| **P3** | **Stale blocker register** (2026-09-06). | Governance documents misstate the state. | Refresh `BLOCKERS.md` (§1.5). |

---

## 5. Hard rules for the public dashboard

1. **Label every figure.** Each one carries: "Unofficial pilot · not a score · comparability none", the run id, the report date, the access tier ("local four-bit build") and the judge family, in the same visual element. This holds until a T2 cohort exists. No figure appears without its interval.
2. **No cross-wave composite ranking.** If `comparability` is `"none"` (every wave today), no table, chart, sort or sentence may place subjects from different waves on one axis or in one order. This holds even when the weekly anchor says "comparable". The anchor verdict is an instrument-drift statement, not D-29a comparability, and the dashboard must not upgrade one into the other. Cross-wave views are limited to instrument series: anchor drift, reference-build stability and operations counts.
3. **Within a wave, separation groups only.** Alphabetical order within a group; "Order carries no meaning" on every chart. A point only for subjects separated after correction, with the unresolved confound in the same caption. No ranks, no "#1", no best or worst, no sort by result, no band labels or band colours (D-29a §3; template §D lexicon).
4. **Pilot and official are separated physically.** Pilot data comes only from `waves/manifest.json` entries with `official:false`. Official data comes only from the score-history and results records. They are never summed, merged or shown on one chart. `evaluatedModelCount` stays official-only (D-29a §6). Official rendering stays disabled until the D-29 amendment.
5. **No hand-typed figure.** Every number is a token resolved at build time from a committed wave file through the public projection. A bare digit in model-dashboard copy fails the build (extend the existing report-figure gate and `test:no-stale-counts` to the dashboard route).
6. **Every figure is traceable.** Each panel links to the wave file path, its sha256 (computed at build and compared with the committed file; `export-wave --check` must pass) and `source_sha256` (the analysis artifact). The pre-registration sha is shown beside any separation claim. A mismatch fails the build.
7. **Never read `analysis.json` or raw run files at build or runtime.** They contain `band` and non-exported composites. Only the allow-listed wave export is a public source.
8. **"Not measured" is a state, not a zero.** Absent metrics (refusal, crisis handling, consistency, multilingual) render as "Not measured in this wave", visibly distinct from a value, and never as 0, a dash or a blank cell.
9. **Duty of care.** The crisis-use note appears on every dashboard view, with no CTA, model name or number next to it. The dashboard never suggests which model to use.
10. **No rating markup.** No `Dataset`, `ItemList`, `Rating`, `AggregateRating`, `Review` or `Product` JSON-LD. No per-model routes or anchors. No paid CTA (template §G, §H).
11. **Append-only history.** Corrections, replies, supersessions and protocol versions are dated changelog entries. A published figure is never silently changed. A superseded wave stays reachable, marked superseded.
12. **Protocol version is visible.** Every weekly wave shows its `protocol_version` and protocol sha. Waves under different protocol versions are never pooled, even in instrument series, without a labelled break.

---

## Decisions this document asks of the founder

1. Ratify `weekly-v1` as is, or first add the signed-drift anchor fix (D-1) as `weekly-v1.1`.
2. Ratify the 14 release sources (or the 10 primary), with quorum 8. This unblocks S1/T0.
3. Approve or amend the tiers T0/T1/T2, the ban on "provisional", and the proposed SLAs (shown publicly only after two consecutive waves meet them).
4. Approve the right-of-reply design, including the T2 factual-accuracy notice, which amends D-29a §7. Ratify D-28.
5. Fund the P0 gaps in order: a non-Claude judge (smallest), then a human calibration sample, then a secure pool.
