# AI model evaluation v2: architecture, contracts and work packages

**Date:** 2026-10-22. **Author:** system-architect. **Status:** DESIGN under D-60. It changes no protocol, data, score, page or decision.
**Inputs read:** `DECISIONS.md` D-60 (l.72-94), D-59 (l.98-123), D-29a (l.794-815), D-29 (l.817+); `research/model-runs/README.md`; every file in `research/model-runs/bin` and `lib` (headers and exports); `weekly/{PROTOCOL,QUEUE,READINESS_2026-10-15}.json`; `.claude/commands/weekly-model-wave.md`; `docs/MODEL_TESTING_V2_PROPOSAL.md`; `docs/AI_MODEL_WEEKLY_CYCLE_PLAN.md`; pilot-2026-10-01/02/03; `site/src/data/model-benchmark/waves/manifest.json`; `IMPROVEMENT_BACKLOG.md` MR-4 (l.86), PROTOCOL-V2 (l.97-103), CYC-W1..W6 (l.118-125), MT-V2-1 (l.236-239).
**Limits that hold for everything below (D-60 l.88-94):** no commit, push or deploy; no protocol becomes ratified; no hosted key or spend; no ranking, band or official score; no write to `site/src/data/**` or to published copy; no scheduler run.

### Verification notes (V8: each absence claim was checked with a positive control in the same query)
| Claim | Query | Positive control that matched |
|---|---|---|
| `wave-ready.mjs` and `audit-wave.mjs` do not exist anywhere | Glob `**/{wave-ready,audit-wave,weekly-wave}.mjs` | `research/model-runs/bin/weekly-wave.mjs` |
| No `PROTOCOL.v2*` file and no `wave-*` directory | Glob `research/model-runs/{wave-*,weekly/PROTOCOL*}` | `weekly/PROTOCOL.json` |
| No hosted client, API key handling or `thinking` capture in the harness | Grep `globalThis\.fetch\|openrouter\|anthropic\.com\|API_KEY\|thinking` in `lib/` | `lib/ollama.mjs:20` (`globalThis.fetch`) |
| No harness code mentions `wave-ready`, `audit-wave`, `PROTOCOL.v2` or `weekly-v2` | Grep in `research/model-runs` (`*.{mjs,json,ps1,md}`) | the same glob with `weekly-v1` matched 3 files |
| No script produces the readiness check | Grep `model-readiness-check` in `research/` | only the data file `READINESS_2026-10-15.json:2` |

Process note: a first Grep with glob `{lib,bin}/*.mjs` returned nothing, and so did its control `globalThis.fetch`. That brace glob matches nothing on this host. Every absence result above comes from a query whose control did match.

---

## 1. Current state: the pipeline as built today

Legend. **A**: automated script. **M**: manual agent work in a session. **F**: founder-gated. Pilot runs used the same scripts, but their configs were written by hand.

| # | Stage | Implemented by (file:line) | Inputs to outputs | Mode |
|---|---|---|---|---|
| S0 | Intake (Model Watch to queue) | **No script.** Queue entries are added by hand edits (cycle plan F1, l.80). Readiness smoke: data only, `weekly/READINESS_2026-10-15.json:1-17`, with no generator | catalog rows to `QUEUE.json` entries | M, F (entries are approved in the Friday packet) |
| S1 | Queue selection | `lib/weekly.mjs:152-171` (`measuredDevelopersOf`, `selectSubjects`); rule text at `QUEUE.json:4` | `QUEUE.json` + protocol to at most `max_new_subjects_per_wave` picks (`PROTOCOL.json:42`, value 2) | A |
| S2 | Plan + preregistration | `bin/weekly-wave.mjs:83-197` (`plan`); `lib/weekly.mjs:270-359` (`buildWaveConfig`), `:409` (`renderPreregistration`), `:383-387` (as-written hash); bank pin `bin/weekly-wave.mjs:100-103`; Ollama pins `:105-123`, `lib/weekly.mjs:224-251` | protocol + queue + `/api/tags` to `wave-<date>/{run-config.json,PREREGISTRATION.md,weekly.json}` (`bin/weekly-wave.mjs:173-189`) | A. **F:** protocol must be `ratified` (`lib/weekly.mjs:202-210`; it is `proposed`, `PROTOCOL.json:3`). **F:** the founder commits the plan (`bin/weekly-wave.mjs:193-195`) |
| S3 | Conformance check | `bin/weekly-wave.mjs:200-242`; `lib/weekly.mjs:561-619` (`checkConformance`, `FIXED_FIELDS` `:36-48`), `:390-404` (`checkPreregistration`) | wave dir to OK/FAIL | A |
| S4 | Subject runs (local) | `collect`: `bin/weekly-wave.mjs:245-276` calls `lib/weekly.mjs:839-937`, which checks plan committed (`:857-860`), protocol ratified (`:862`), conformance (`:863-864`), lock (`:869-876`) and memory (`:893-895`, headroom fixed in code at `:23`), then spawns `bin/run-local-subjects.mjs:1-17` / `lib/local-subjects.mjs:352-486` | committed plan to one record per call, `subject-answers/records/<label>/<item>__t<n>.json` (fields at `lib/local-subjects.mjs:437-464`) and `operations/collect-status.json` | A under the OS scheduler. **F:** the task is registered by the founder (`weekly/register-task.ps1:20-23`), and it is not registered (cycle plan l.106). **F:** model pulls (runbook l.50) |
| S4' | Subject runs (agent tier, pilot-1 only) | `bin/build-subject-briefs.mjs`, `bin/split-brief.mjs`, `bin/merge-parts.mjs`, `bin/ingest-answers.mjs:1-9`; procedure at README l.58-81 | briefs to subagent replies to `subject-answers/` | M (accepted only when `tool_uses == 2`, README l.68) |
| S5 | Finalise and ingest | `lib/local-subjects.mjs:491` (`finalizeRun`, via `--finalize`); `lib/weekly.mjs:927-929` refuses `collected` if any trial failed | records to `keys/subject-brief-key.json`, `keys/ingested/answers.json`, `operations/subject-run-summary.json` | A |
| S6 | Judge batches and anchor sample | `bin/build-judge-batches.mjs:1-24`; routing `lib/judge-routing.mjs:43` (`routeToJudgeSet`); bridge draw `lib/bridge.mjs:136-152`; blinding `lib/judge-batches.mjs:148` (`assertBatchesBlind`); size split `bin/split-judge-batch.mjs:1-17` | ingested answers to `judge-batches/<judge>__batch-NN.{md,json}` + `keys/judge-key.json` | A, then M: staging under neutral `jbNNN` names outside the repo (runbook l.65) |
| S7 | **Judging** | **No script.** Claude subagents, one call per batch, exactly 2 tool calls each, others voided (README l.66-69; runbook l.66). Pilot-3 kept the evidence by hand: `pilot-2026-10-03/operations/judge-batches.ledger.tsv:1` (`jb058  2  ok`), `judge-batches.map.tsv`, `judge-batches.voided.txt` | batch files to `judge-answers/*.answers.json` | M (the largest step; about 75+ batches per wave, proposal l.13) |
| S8 | Judge validity | `bin/judge-validity.mjs:1-25` (exit 0/1/4/5, `:22-24`); verdict `lib/judge-validity.mjs:36-39`; freshness `:228` (`assertValidityFresh`) | answers + key to `operations/judge-validity.json` | A |
| S9 | Reroute / requote / supplement | `bin/reroute-judges.mjs:1-27`; `lib/reroute.mjs:34` (`rerouteJudges`), `:273` (`buildSupplementKey`); `lib/supplement.mjs:36`; rules at README l.83-119, l.143-145 | key + answers to `judge-batches-reroute*/` + `keys/judge-key.reroute*.json` | A to build; M to judge (as S7) |
| S10 | Score through cb-probe + contamination probe | `bin/run-mcp-probe.mjs:1-31` (arms and wave shape; Ollama client only, `:37`); `bin/assemble-run.mjs:1-25` (first-pilot shape; refuses an arms run, README l.184) | ratings + amended key to `mcp-scorecards/<label>/{scorecard.json,mcp-rating-map.json}` | A, with M probe answering for agent-tier subjects |
| S11 | Analysis | `bin/analyze-pilot.mjs:1-26`; composite only via `site/scripts/lib/scoring.mjs` (`:47`); bridge drift `:481-492` (per-judge signed mean at `:492`); agreement `:155-158` | run artefacts to `analysis.json` | A (M to run) |
| S12 | Anchor verdict | `lib/weekly.mjs:625-630` (`anchorVerdict`, mean absolute only); printed by `bin/weekly-wave.mjs:306-311` | `analysis.json.bridge_drift` to comparable / NOT COMPARABLE | A |
| S13 | Export | `bin/export-wave.mjs:1-31`; writes `site/src/data/model-benchmark/waves/` (`:40`), or a scratch copy via `CB_WAVES_DIR` (`:39`) | analysis to wave JSON + `manifest.json` | A; the output is committed only on founder approval. Under D-60, scratch copy only |
| S14 | Claim audit | **No script.** Runbook l.73; the pilot-3 audit was done by hand with scratch scripts (`docs/ai-model-report/2026-10-03-pilot-3-claim-audit.md:7`) | draft report + raw files to audit doc | M |
| S15 | Publication gates | **`wave-ready.mjs` absent** (verified above). Render gates exist: `site/scripts/lib/pilot-render-gate.mjs:58` (`renderableEntries`), `site/scripts/lib/dashboard-render-gate.mjs:54`; `dashboard-decision.json:3` is `proposed` | none for v2 gates 1-10 (proposal §4) | M, gate by gate |
| S16 | Approval packet and publish | Runbook l.75-86 (hand-written packet); manifest entry `decision_status` (`waves/manifest.json:9`) | packet to founder reply | M + **F** (AUTONOMY §1b) |
| -- | Phase machine | `lib/weekly.mjs:731-757`: the phases end at `analysed`; audit, gates and approval are not phases | wave dir to phase | A |

### Gaps found (each is cited; WP = the work package in §4 that closes it)
- **G1.** No gate runner and no claim-audit script (verification table). Closes in WP-7 and WP-8.
- **G2.** No judge transport: judging is hand dispatch with a hand-kept `tool_uses` ledger (S7). Closes in WP-4.
- **G3.** Routing excludes only the subject's family (`lib/judge-routing.mjs:29-35`). No rule makes a reply's two judges come from two different families, and the excluded-judge reroute assumes one unique candidate (`bin/reroute-judges.mjs:6-8`). Closes in WP-4.
- **G4.** No hosted client. The record keeps only `message.content` (`lib/local-subjects.mjs:413`), so qwen3's separate `thinking` field (`READINESS_2026-10-15.json:14`) would be silently dropped. Closes in WP-3.
- **G5.** The anchor verdict is mean-absolute only (`lib/weekly.mjs:625-630`). Signed drift exists per judge only, descriptively (`analyze-pilot.mjs:492`; pilot-3 values -0.062 / +0.056 / +0.214, `pilot-2026-10-03/analysis.json:3109-3123`). There is no overall signed figure and nothing in composite units. Closes in WP-6.
- **G6.** The queue has no licence or hold field (`lib/weekly.mjs:126-145`). The two non-commercial licences are recorded only in `READINESS_2026-10-15.json:16`, so `selectSubjects` would pick them. Closes in WP-2.
- **G7.** The memory headroom (1.5 GiB) is fixed in code (`lib/weekly.mjs:23`) and is not part of the frozen protocol. Closes in WP-1.
- **G8.** The phases stop at `analysed` (`lib/weekly.mjs:731`), so `status` cannot say "audited", "gated" or "awaiting approval". Closes in WP-9.
- **G9.** A hosted build has no weights digest, but `loadRunConfig` requires a 64-hex `digest` (`lib/local-subjects.mjs:62`). §3.3 defines a stand-in. Closes in WP-3.
- **G10.** The MCP probe host is Ollama-only (`bin/run-mcp-probe.mjs:37`), so hosted subjects cannot be probed. Closes in WP-15 (needs a key).
- **G11.** README l.253-254 says the harness tests are not in the `test` chain. That is stale: `site/package.json:39` has `test:model-runs`, and `site/scripts/test-model-runs.mjs:1-9` enumerates the tests. Closes in WP-9.
- **G12.** `analyze-pilot.mjs:62-64` hard-codes pilot-2's primary comparison for any non-arms config with a judge set. Waves pass only because they always carry `comparisons` (`:61`). Noted; WP-2 adds a test that every v2 config carries `comparisons`.
- **G13 (MR-4).** Unblinding keys are committed (for example `pilot-2026-10-03/keys/judge-key.json`), and no guard refuses staging keys of an unpublished-pool run. Closes in WP-12.
- **G14.** No cost ledger exists, and judge tokens are estimates only (proposal §2, l.58-61). Closes in WP-5.

---

## 2. Target v2 workflow for testing a NEW model

| Step | What happens | Component (new in bold) | Gate / stop |
|---|---|---|---|
| T1 Intake | A Model Watch catalog row becomes a proposed queue entry carrying size, licence class and family | **`bin/queue-candidates.mjs`** (WP-13) | The founder approves new entries in the Friday packet; release news never changes the order (cycle plan l.30) |
| T2 Readiness | A neutral non-bank prompt, as on 2026-10-15; records digest, size, GPU share, thinking field and licence header | **`bin/readiness-check.mjs`** (WP-13) | A build that fails to load or is over size is never planned |
| T3 Select | All eligible builds, minus licence holds | **`lib/weekly-v2.mjs`** `selectSubjectsV2` (WP-2) | Deterministic; the same queue gives the same picks |
| T4 Plan + prereg | As S2, from `PROTOCOL.v2.json`; adds the access tier, the hosted pin hash, the cost estimate and the gate thresholds | `bin/weekly-wave.mjs plan --protocol v2` (WP-2), **`lib/cost-ledger.mjs`** (WP-5) | **F:** v2 ratified (PROTOCOL-V2-2); plan commit (V2 ask 3 or per wave) |
| T5 Collect | Local as S4. Hosted through an adapter with the same record schema plus raw bodies, stopping at the ceiling | `lib/local-subjects.mjs` + **`lib/subject-adapter.mjs`, `lib/hosted-client.mjs`** (WP-3) | **F:** scheduler (V2 ask 5); key and ceiling (V2 ask 1) for hosted |
| T6 Variance (hosted) | 12 seeded items re-asked twice (proposal §3 stage 4) | WP-3 adapter + `operations/variance.json` | Thresholds OPEN (§3) |
| T7 Batches | As S6, with cross-family pairs | `lib/judge-routing.mjs` (WP-4) | `assertBatchesBlind` unchanged |
| T8 Judge | Transport `api` (plain chat, no tool schema, temperature 0) or `subagent-manual` (today's ritual, with the ledger checked by code) | **`bin/run-judges.mjs`, `lib/judge-runner.mjs`** (WP-4) | `tool_uses == 2` enforced from the ledger for manual; raw bodies kept for api |
| T9 Validity, reroute, probe, analyse | S8-S11 unchanged | existing | Existing exit codes |
| T10 Anchor | Absolute (v1) plus signed drift in rating and composite units | **`lib/anchor-v2.mjs`** (WP-6) | NOT COMPARABLE label |
| T11 Audit | Re-derives every report token and run invariant from raw files | **`bin/audit-wave.mjs`** (WP-7) | Zero open items |
| T12 Gates | G1-G10 to `operations/publication-gates.json` | **`bin/wave-ready.mjs`, `lib/gates.mjs`** (WP-8) | Exit 0 only if no FAIL and no NOT-RUN |
| T13 Packet | One Friday packet: each item with its gate result and exact pathspec | **`bin/wave-packet.mjs`** (WP-10) | **F:** one reply (C-FD-2, D-59 l.109) |
| T14 Export + publish | S13 + S16 after approval | existing | **F** (AUTONOMY §1b) |

### New components

"Key?" means a hosted API key is needed to run it live. "Now" means it can be built and tested under D-60 on fixtures or pilot data.

| Component | Purpose | Inputs | Outputs | Path | Key? | Founder? | Now? |
|---|---|---|---|---|---|---|---|
| PROTOCOL.v2 (proposed) | The frozen v2 rules, with every open value explicit | proposal §3-§5, `PROTOCOL.json` | proposed file | `research/model-runs/weekly/PROTOCOL.v2.json` | no | ratify (V2-2) | yes |
| protocol-v2 validator | Validate v2; refuse ratification while OPEN values remain | v2 file | throws / problem list | `research/model-runs/lib/protocol-v2.mjs` | no | no | yes |
| v2 planner | All-eligible selection, licence holds, v2 run-config + prereg | v2 protocol, queue, `/api/tags` | wave dir (dry run: stdout) | `research/model-runs/lib/weekly-v2.mjs`, `bin/weekly-wave.mjs` | no | real plan needs ratification | yes (dry run) |
| Subject adapter + hosted client | One `chat()` seam; capture `thinking`; hosted pinning, raw bodies, usage | run-config subject, fetch impl | record v2 (§3.4) | `research/model-runs/lib/subject-adapter.mjs`, `lib/hosted-client.mjs` | live only | ask 1 to run | yes (fixtures) |
| Judge runner | Scripted judging over 2 transports; same answer schema (`lib/judge-batches.mjs:26`) | batch JSON, judge spec | `judge-answers/*.answers.json` + `operations/judge-calls/*.json` | `research/model-runs/lib/judge-runner.mjs`, `bin/run-judges.mjs` | api only | ask 1 + M-FD-8 for api | yes (fixtures, pilot-3 ledger) |
| Cross-family routing | Pairs of 2 distinct families, neither the subject's | judges, familyOf | routes | `research/model-runs/lib/judge-routing.mjs`, `lib/reroute.mjs` | no | no | yes |
| Cost ledger + token meter | Estimate, ledger, stop at the ceiling; measure real judge chars/tokens | records, batches, prices (input) | `operations/cost-ledger.jsonl`, estimate | `research/model-runs/lib/cost-ledger.mjs`, `bin/measure-judge-tokens.mjs` | no | ceiling value | yes (pilot-3) |
| Anchor v2 | Signed drift (overall, per judge, composite units) | analysis.json, keys, answers | object for gates | `research/model-runs/lib/anchor-v2.mjs` | no | threshold OPEN | yes (pilot-3) |
| audit-wave | Automated claim audit | report source, wave JSON, analysis, raw files, git (read-only) | `claim-audit.json` | `research/model-runs/bin/audit-wave.mjs`, `lib/audit-wave.mjs` | no | no | yes (pilot-3) |
| wave-ready | Runs G1-G10 | all of the above | `publication-gates.json` | `research/model-runs/bin/wave-ready.mjs`, `lib/gates.mjs` | no | no | yes (pilot-3) |
| wave-packet | Friday packet generator (W-5) | gates, audit, collect status | packet Markdown | `research/model-runs/bin/wave-packet.mjs` | no | uses C-FD-2 | yes |
| Intake tools | Candidate report (W-2) + readiness generator | catalog JSON, Ollama | proposal list, `READINESS_<d>.json` | `research/model-runs/bin/{queue-candidates,readiness-check}.mjs`, `lib/intake.mjs` | no | no | yes (fixtures; a live readiness check needs Ollama and founder-approved pulls) |
| Keys staging guard (MR-4) | Refuse staging `*/keys/**` for unpublished-pool runs | staged paths, run-config | exit code | `research/model-runs/bin/check-staged-keys.mjs` | no | wiring into hooks | script yes |

**Output location for pilot experiments.** Tools that are run on `pilot-*` must take a required `--out` under `research/model-runs/eval-v2/<run_id>/`. They never write into a pilot directory, because pilot files are hash-checked evidence (`export-wave.mjs --check`, header l.22-24).

---

## 3. Data contracts

### 3.1 OPEN encoding
A value not yet chosen is written `{"$open": {"proposed_default": <value|null>, "source": "<file:line or doc §>", "decide": "<who>"}}`.
- `validateProtocolV2` accepts `$open` only while `status` is `proposed`.
- `assertRatifiableV2` lists every remaining `$open` path and refuses if there is one.
- A dry run substitutes `proposed_default` and prints `PROVISIONAL` beside each substituted path. A `null` default makes even the dry run refuse that block.

### 3.2 PROTOCOL.v2 fields

Fields that run-config carries stay **flat**, so `checkConformance` (`lib/weekly.mjs:561`) is reused with `FIXED_FIELDS_V2`.

| v2 field | Type | v1 counterpart | v2 value |
|---|---|---|---|
| `protocol_version` | string | same (`PROTOCOL.json:2`) | `"weekly-v2"` |
| `status` | proposed / ratified / retired | same (`:3`) | `"proposed"` |
| `proposed_at`, `ratified_at` | date / null | `proposed_at` (`:4`); none | `2026-10-2x`; `null` |
| `supersedes` | string | none | `"weekly-v1"` (no v1 wave exists: D-59 l.107-108) |
| `rationale` | string | same (`:5`) | new text |
| `ollama_host` | localhost URL | same (`:6`); rule at `lib/weekly.mjs:87` | unchanged |
| `trials`, `max_retries` | int | same (`:7-8`) | 3, 2 |
| `system_message`, `arm` | string | same (`:9-10`) | unchanged |
| `bank_sha256` | hex64 | same (`:11`) | unchanged; a new bank means a new version |
| `served_items_sha256` | hex64 | none (implicit in `lib/common.mjs:209` `servedItems`) | sha256 of the sorted served ids (83 today, README l.53), computed at authoring time |
| `judges[]` | {label, family, transport, model_id, provider} | {label, family} (`:12-16`) | **OPEN O1** |
| `judges_per_response` | int | same (`:17`) | 2 |
| `judging.distinct_families_per_response` | bool | none (G3) | `true` (proposal §3 stage 5) |
| `judging.transport_default` | "api" / "subagent-manual" | implicit subagent | **OPEN O2** |
| `judging.temperature` | number | none | **OPEN O3** |
| `max_batch_entries` | int | same (`:18`) | 16 |
| `judging.max_batch_bytes` | int | none (README l.92, runbook l.65: 70 KB) | 70000 |
| `judge_validity` | {max_unfound_quote_rate_percent, short_quote_min_chars} | same (`:19-22`) | 5, 12 |
| `gates.agreement_floor_exact` | number | none | **OPEN O9** |
| `gates.family_gap_max_composite` | number | none | **OPEN O10** |
| `gates.completeness_max_failed_percent` | number | implicit 0 (`lib/weekly.mjs:927-929`) | **OPEN O8** |
| `bootstrap_replicates`, `correction` | int, "bonferroni" | same (`:23-24`) | 1000, bonferroni |
| `reference{...}` | as v1 | same (`:25-34`) | unchanged (gemma2:9b, digest `ff02c370...`, 1 trial) |
| `anchor{source_run, source_key, per_source_subject, max_mean_abs_difference, rationale}` | as v1 | same (`:35-41`) | pilot-2026-10-03 / reroute-2 / 6 / 0.30 |
| `anchor.max_abs_signed_drift` | {rating_units, composite_units} | none (G5) | **OPEN O11** |
| `selection.mode` | "all-eligible" / "first-n" | implicit first-n (`lib/weekly.mjs:166`) | `"all-eligible"` (proposal §5 ask 2) |
| `max_new_subjects_per_wave` | int (cap) | same (`:42`, value 2) | **OPEN O12** |
| `selection.hold_licence_classes` | string[] | none (G6) | **OPEN O13** |
| `local.vram_budget_gb`, `local.max_model_size_gb`, `local.size_unit` | as v1 | top level (`:43-45`) | 8, 6.0, unchanged |
| `local.memory_headroom_gib` | number | code constant (`lib/weekly.mjs:23`) | 1.5 |
| `local.sampling` | string | implicit (Modelfile defaults + derived seed, `lib/local-subjects.mjs:402-408`) | `"modelfile-defaults+derived-seed"` |
| `local.thinking` | {mode, store_trace, show_to_judges} | none (G4) | **OPEN O14** |
| `hosted.enabled`, `hosted.gateway` | bool, string | none | **OPEN O4** |
| `hosted.pin` | {provider, model_id, quantization, allow_fallbacks:false} | none | per subject at plan time; `allow_fallbacks` fixed `false` |
| `hosted.temperature` | number | none | **OPEN O5** |
| `hosted.seed_policy` | string | none | **OPEN O6** |
| `hosted.variance` | {items, extra_reasks, max_rating_spread, min_exact_match} | none | items 12, re-asks 2 (proposal l.81); thresholds **OPEN O7** |
| `hosted.never_on_axis_with_local` | bool | none | `true` (proposal l.98) |
| `cost.monthly_ceiling`, `cost.currency` | number, string | none | **OPEN O15** |
| `comparisons{kind, rule}` | as v1 | same (`:46-49`) | kind `build`; rule extended to "each new subject vs reference, then each pair within the same access tier" |
| `publication.gate_ids` | string[] | none | G1-G10 (proposal §4) |
| `publication.per_wave_approval`, `publication.standing_auto_publish` | bool | none | `true`, `false` (proposal l.118) |

### OPEN values (decided at PROTOCOL-V2-2 by the founder)
| ID | Path | Proposed default | Source |
|---|---|---|---|
| O1 | `judges[]` | 3 families, 2 per reply: one Claude judge plus 2 non-Claude judges, models UNVERIFIED. Fallback "v2.0": the 3 v1 Claude judges, `transport: subagent-manual` (no key needed) | proposal §3 stage 5, §5 ask 2; `PROTOCOL.json:12-16` |
| O2 | `judging.transport_default` | `api` once V2 ask 1 is granted; `subagent-manual` under v2.0 | proposal l.82; README l.66-69 |
| O3 | `judging.temperature` | 0 | proposal l.82, l.94 |
| O4 | `hosted.enabled`, `hosted.gateway` | `false`; gateway OpenRouter (UNVERIFIED) | proposal §5 ask 1 |
| O5 | `hosted.temperature` | **no default in the repo**; one declared number | proposal l.95-96 |
| O6 | `hosted.seed_policy` | send the derived seed where the provider supports it; record whether it was honoured | proposal l.95 |
| O7 | variance thresholds | **no default**; first wave report-only | proposal §4 gate 6 |
| O8 | completeness max failed % | 0 (today's behaviour) | `lib/weekly.mjs:927-929` |
| O9 | agreement floor (exact) | 0.759, the pilot-3 lowest | `waves/pilot-2026-10-03.json:479`; proposal l.125 |
| O10 | family-gap threshold | **no default** (no cross-family observation); report-only in the first v2 wave | proposal l.125 |
| O11 | signed-drift threshold | **no default**; observed per-judge -0.062..+0.214 rating units | `pilot-2026-10-03/analysis.json:3109-3123` |
| O12 | per-wave cap | all eligible after holds: 7 today (9 queued minus 2 held, `QUEUE.json` + `READINESS:16`) | proposal §5 ask 2 |
| O13 | licence holds | hold `non-commercial` until counsel answers; skip at week 3 | M-FD-5, cycle plan l.352 |
| O14 | thinking | model default, store the trace, never show judges | M-FD-6, cycle plan l.353 |
| O15 | spend ceiling | **founder-only, no default** | proposal §5 ask 1 |

### 3.3 run-config v2 deltas (generated by plan; checked by `checkConformanceV2`)
- **Subject entries.** A subject adds `access_tier` (`"local-ollama"` or `"hosted-api"`). A hosted subject adds `pin` {provider, model_id, quantization}, and its `digest` = `sha256(canonicalJson(pin + gateway))`, labelled **pin hash, not weights**. This satisfies `lib/local-subjects.mjs:62` without faking a digest; `verifyPinnedDigest` is skipped for hosted subjects only. The allowed key set is `SUBJECT_KEYS_V2`, replacing `lib/weekly.mjs:54`.
- **Copied blocks.** `judging`, `gates` and `hosted` are copied verbatim from the protocol, and `weekly.cost_estimate` is added. Conformance compares every copied block byte for byte (canonical JSON).

### 3.4 Subject record v2 (additive; v1 fields unchanged, `lib/local-subjects.mjs:437-464`)
- **Every record.** It adds `access_tier`, plus `thinking` (string or null), `thinking_chars` and `thinking_sha256`, captured from `message.thinking`. `response` stays `message.content` only, and judge batches never include `thinking` (asserted in WP-3).
- **Hosted records.** They also add `provider_requested`, `model_requested`, `provider_returned`, `model_returned`, `system_fingerprint`, `request_params`, `usage`, `cost_reported` and `raw_body_path`. The raw body path is under `keys/raw/`, which is NEVER SEND and never exported. A test asserts that no field holds the key.

### 3.5 Judge call sidecar
`operations/judge-calls/<batch_id>.json`: {batch_id, judge, transport, started_at, finished_at, tool_uses (manual) | usage + model_returned + raw_body_path (api), status ok/void, void_reason}. Answer files keep today's schema (`lib/judge-batches.mjs:26`), so S8-S11 are untouched.

### 3.6 `publication-gates.json` and `claim-audit.json`
- **`publication-gates.json`.** {kind:"publication-gates", run_id, protocol_version, protocol_sha256 or null, inputs:{path: sha256}, gates:[{id, name, status: PASS / FAIL / NOT-APPLICABLE / NOT-RUN / OPEN-THRESHOLD, value, threshold, evidence, source}], verdict: ready / not-ready}. Exit codes: 0 ready; 1 refused; 2 usage; 3 any FAIL; 4 no FAIL but any NOT-RUN or OPEN-THRESHOLD. The content hash excludes `generated_at`.
- **`claim-audit.json`.** {kind:"claim-audit", run_id, report_source, checks:[{id, status, detail}], tokens:{resolved, unresolved:[]}, open_items:[{check, detail}]}.

---

## 4. Work packages (one agent each; file sets disjoint; no WP edits `tests/helpers.mjs`)

| WP | Scope | Files (exclusive) | Depends on | Now? | Done when (falsifiable) |
|---|---|---|---|---|---|
| **WP-1** PROTOCOL-V2-1 | v2 proposed file + validator + OPEN encoding | `weekly/PROTOCOL.v2.json`, `lib/protocol-v2.mjs`, `tests/protocol-v2.test.mjs` | none | **yes** | (a) The file validates while `proposed`. (b) Flipping `status` to `ratified` on a copy refuses and names all 15 OPEN paths of §3.2. (c) A test proves every v1 key of `PROTOCOL.json` maps to a v2 path. (d) `PROTOCOL.json` is byte-unchanged and `tests/weekly-wave.test.mjs` is green |
| **WP-2** v2 planner | `selectSubjectsV2` (all-eligible, licence holds), `buildWaveConfigV2`, `checkConformanceV2`, `--protocol v2` flag | `lib/weekly-v2.mjs`, `bin/weekly-wave.mjs`, `tests/weekly-v2.test.mjs`, `tests/fixtures/queue-v2.json` | WP-1 | **yes** (dry run only) | (a) `plan --protocol v2 --date 2026-10-27 --dry-run --allow-proposed` on the fixture queue (licence classes from READINESS) prints 7 picks and 7x249+83 = 1,826 calls. (b) The v1 plan output for the same date is byte-identical to before (snapshot). (c) Conformance refuses a run-config that omits an eligible build, includes a held one or lacks `comparisons` (G12). (d) A real plan refuses while v2 is `proposed` |
| **WP-3** subject adapter | `chat()` seam, thinking capture, hosted client, record v2, pin hash | `lib/subject-adapter.mjs`, `lib/hosted-client.mjs`, `lib/local-subjects.mjs`, `tests/subject-adapter.test.mjs`, `tests/fixtures/hosted/**` | none (reads WP-1 schema if present) | **yes** (fixtures) | (a) An Ollama fixture with `message.thinking` gives a record with `thinking` stored and `response` equal to content. (b) `buildJudgeBatches` output carries no thinking text. (c) Re-finalising pilot-3 records gives byte-identical `keys/ingested/answers.json` in a scratch root. (d) A planted-secret test: the env key value appears in no written file or log. (e) Tests make zero real network calls (an injected fetch counts the calls; global fetch is stubbed to throw) |
| **WP-4** judge runner + cross-family routing | transports `subagent-manual` (ledger import, `tool_uses == 2`) and `api` (fixtures); distinct-family pairs; reroute under the family rule | `lib/judge-runner.mjs`, `bin/run-judges.mjs`, `lib/judge-routing.mjs`, `lib/reroute.mjs`, `tests/judge-runner.test.mjs`, `tests/cross-family-routing.test.mjs`, `tests/fixtures/judge-api/**` | none | **yes** | (a) A property test over every subject family x 3-family panel: every reply has 2 judges of 2 families, neither the subject's. (b) With the rule off, pilot-3's `keys/judge-key.json` routing is reproduced exactly from its seed (scratch). (c) The pilot-3 ledger imports cleanly, and one planted row with `tool_uses` 3 is voided. (d) An api fixture writes answers that `judge-validity.mjs` accepts unchanged. (e) `reroute.test.mjs` stays green |
| **WP-5** cost + tokens (MT-V2-1 token part) | estimate formula, JSONL ledger, ceiling stop, judge-token measurement | `lib/cost-ledger.mjs`, `bin/measure-judge-tokens.mjs`, `tests/cost-ledger.test.mjs`, `docs/model-eval/JUDGE_TOKENS_PILOT3.md` | none | **yes** | (a) On every pilot-3 batch and answer file it reports per-rating input and output characters, plus tokens by two stated methods. (b) Subject in/out per call is recomputed from records (`prompt_eval_count`, `eval_count`) and compared with 93/379 (proposal l.52). (c) The ledger refuses the call that would cross a fixture ceiling and records a deviation stub |
| **WP-6** anchor v2 | overall + per-judge signed drift, composite-unit drift, eligible-pool size per candidate judge set | `lib/anchor-v2.mjs`, `tests/anchor-v2.test.mjs` | none | **yes** | (a) On pilot-3 it reproduces 0.146 / 41 of 48 / per-judge signed values (`analysis.json:3100-3123`) exactly. (b) Composite-unit drift is defined as composite(new) - composite(original) over the bridge replies via `scoring.mjs`; it is "not computable" when a dimension is absent. (c) It prints the eligible anchor pool for each single Claude judge on the pilot-3 reroute-2 key; this settles whether O1's one-Claude panel can still draw 6 per source subject. (d) `anchorVerdict` and the pilot `analysis.json` files are unchanged |
| **WP-7** audit-wave | token resolution; export regenerate (via `CB_WAVES_DIR`); composite recompute; record invariants (count, digest, seed rule, one version); timestamp gap to deviation map; self-ID recount; plan-before-data from git (read-only) | `bin/audit-wave.mjs`, `lib/audit-wave.mjs`, `tests/audit-wave.test.mjs` | none | **yes** | (a) On pilot-3 it detects exactly 2 gaps over 1 min (12.8 h and 9.3 h) and maps them to D1 and D2 (claim audit B2). (b) Self-ID count is 1 (`analysis.json:3132`). (c) On scratch copies, each planted defect gives an open item: D2 deleted, one rating altered, one token pointed at a missing path, one record digest changed |
| **WP-8** wave-ready (MT-V2-1) | G1-G10 runner; thresholds from the v2 protocol, else run-config, else OPEN-THRESHOLD | `bin/wave-ready.mjs`, `lib/gates.mjs`, `tests/wave-ready.test.mjs` | WP-6, WP-7 (WP-5 for G9) | **yes** | (a) On pilot-3, G1, G3, G5, G7 and G8 return a status with evidence; G6 and G9 are NOT-APPLICABLE; G4 is OPEN-THRESHOLD (value 0.759); G10 is NOT-RUN (needs a preview build). (b) One planted defect per gate turns it FAIL and the exit code to 3. (c) Pilot files are byte-unchanged afterwards |
| **WP-9** phases + runbook v2 | phases `audited`, `gated`, `awaiting-approval`; README fixes (G11); v2 runbook as a doc | `lib/weekly.mjs` (wavePhase/nextAction only), `research/model-runs/README.md`, `docs/model-eval/RUNBOOK_V2.md`, `tests/weekly-phases-v2.test.mjs` | WP-8 | **yes** (not `.claude/commands/`: outside D-60's list) | (a) Fixture wave dirs give each new phase. (b) Existing phase tests are green. (c) The README no longer says the tests are outside the chain |
| **WP-10** wave-packet (W-5) | one Friday packet from gates + audit + collect status | `bin/wave-packet.mjs`, `tests/wave-packet.test.mjs` | WP-8 | **yes** | On pilot-3 every listed item shows its gate status and pathspec. An item with a FAIL gate cannot appear as approvable (planted) |
| **WP-11** results-review procedure | the D-60 results-review steps, reviewer roles, what is never inferred (D-29a items 2-4) | `docs/model-eval/RESULTS_REVIEW.md` | WP-8 ids | **yes** | Each step names the gate or audit check that evidences it. Run on pilot-3, it reaches a verdict without a step needing judgement outside the doc |
| **WP-12** keys guard (MR-4) | refuse staged `research/model-runs/*/keys/**` for `pool: unpublished` runs | `bin/check-staged-keys.mjs`, `tests/check-staged-keys.test.mjs` | none | **yes** (wiring into hooks: founder) | A fixture staged list with an unpublished-pool key exits non-zero; the same list for a public-pool run exits 0 |
| **WP-13** intake (W-2 + readiness) | catalog-to-candidate report; readiness generator with injected fetch | `bin/queue-candidates.mjs`, `bin/readiness-check.mjs`, `lib/intake.mjs`, `tests/intake.test.mjs` | none | **yes** (fixtures) | (a) Replaying the 2026-10-15 replies as fixtures regenerates `READINESS_2026-10-15.json` results fields. (b) The candidate report flags non-commercial licences and over-size builds; it never reorders the queue |
| WP-14 | dashboard access-tier and judge-family display | `site/` components | WP-3, WP-4 | **no**: it changes published pages (D-60 l.93) | per proposal item 7 |
| WP-15 | hosted MCP probe host (G10) + live 2-call smoke per hosted subject | `lib/mcp-probe.mjs`, `bin/run-mcp-probe.mjs` | WP-3 | **no**: needs V2 ask 1 | returned model strings logged; cost within the ledger |
| WP-16 | first v2 wave end to end | wave dir | all, plus ratification | **no**: needs PROTOCOL-V2-2, scheduler (FD-4 / ask 5), plan commit | every gate PASS or reported; one founder reply |

**Order.** Parallel first wave: WP-1, WP-3, WP-4, WP-5, WP-6, WP-7, WP-12, WP-13. Then WP-2 (after WP-1) and WP-8 (after WP-6 and WP-7). Then WP-9, WP-10 and WP-11. Risk is highest in WP-4, which touches routing that pilot evidence depends on, and WP-3, which touches the record writer; both have byte-identical regression criteria. Every WP runs only `node --test "research/model-runs/tests/<its file>"` plus the existing tests for files it edits (host memory, runbook l.20).

---

## 5. Open risks and ambiguities (flagged before locking)
1. **What D-59 ratified.** D-59 item 1 "ratify weekly protocol v2" (l.107) approved v2 in principle, but no v2 file exists, and D-60 l.90 keeps PROTOCOL-V2-2 founder-owned. The proposal's v2 includes a cross-family API panel, which needs V2 ask 1, still open (D-59 l.119). **As specified, v2 cannot be operated without a key.** Recommendation: offer the founder O1's "v2.0" option (all-eligible, Claude-only manual judging, signed drift, gates) so that local waves can start, with the panel change as v2.1. That is a founder choice, not an architecture default.
2. **Anchor with a new panel.** Bridge replies go only to the judges that originally rated them (README l.131-132). A one-Claude panel shrinks the eligible pool; WP-6(c) measures it before O1 is chosen.
3. **Volume.** All-eligible means 1,826 calls per wave (WP-2(a)). olmo2 runs at 10.4 tok/s (`READINESS:15`), and collection needs about 6.6 GiB free (proposal l.17). A wave may need several nights; deferral is a reported state (`lib/weekly.mjs:895`).
4. **Hosted provenance.** A pin hash is not a weights digest. Hosted builds are a separate tier and are never on one axis with local builds (§3.3, O4-O7).
5. **Duty of care and independence.** No WP generates review text, rater records or model advice. Queue order stays rule-based (WP-13(b)).
