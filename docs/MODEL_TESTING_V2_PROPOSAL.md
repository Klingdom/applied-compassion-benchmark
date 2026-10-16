# Model testing v2: a proposal for testing and publishing AI models

**Date:** 2026-10-15. **Author:** system-architect. **Status:** PROPOSAL. It changes no protocol, data, score, page or decision.
**Directive (founder, 2026-10-15):** "FIGURE out a better way to test models and publish."
**Scope:** how a model gets from "queued" to a public, unofficial pilot page. Methodology and publication stay founder decisions. This document proposes them and does not make them.

Price, rate-limit and model-availability figures do not appear in this repo. Wherever one is needed it is marked **UNVERIFIED — check before approval**. No price is stated as fact (NA-001).

---

## 1. Diagnosis: why nothing gets tested or published

**R1. Judging is manual work inside a session, and it is the largest step.** Every rating comes from a Claude Code subagent. Each subagent call is accepted only if its completion notice shows `tool_uses == 2`, and any other call is voided and re-run (`.claude/commands/weekly-model-wave.md` §3.2; `research/model-runs/README.md`, "Delivery as parts"). One wave of 581 replies needs about 75 batches plus re-quote, supplement and anchor rounds (`docs/FOUNDER_DECISION_PACKET_2026-10-15_AI_MODELS.md` §1). Pilot-3 needed 171 first-round batch files (`research/model-runs/pilot-2026-10-03/judge-batches/`). The claim audit is also manual (runbook §3.9). Even with collection fully automated, a wave still costs one or more long sessions of hand judging.

**R2. All judges are Claude, and the protocol makes that structural.** `weekly/PROTOCOL.json` lists three judges, all with `family: "claude"`. The routing rule excludes the subject's family (README, "Explicit judge set"), so a Claude model can never be a subject, and every result carries a shared-taste limit (`docs/ai-dashboard/METHODOLOGY_RELEASE_ASSESSMENT_2026-10-14.md` §4, P0). Without an API route there is no non-Claude judge.

**R3. The only host that can run a subject is a 16 GB desktop that is also the founder's workstation.** Collection defers unless free RAM covers the largest model plus 1.5 GiB of headroom (`research/model-runs/lib/weekly.mjs` `DEFAULT_HEADROOM_BYTES`). On 2026-10-15 that meant 6.57 GiB needed against 0.72 GiB free (`ITERATION_LOG.md` Iteration 106 D). The 02:00 task is not registered (same entry). Builds are capped at 6.0 GB (`PROTOCOL.json` `max_model_size_gb`), so no frontier model and no larger open-weight model can run. No provider key exists and Ollama is not signed in (BLK-002, open since 2026-09-06).

**R4. The pace is set by the protocol, not by capacity.** `max_new_subjects_per_wave: 2` means the 9 queued builds take about 5 weeks (packet M-FD-4). That is roughly 4–5 hours of GPU time spread over 5 weeks, each week with its own approval cycle.

**R5. A wave needs five or more separate founder approvals, and the publication decision does not exist yet.** For each wave, the runbook stops for ratification, the plan commit, the pull, the result commit and publication (runbook §2.1, §2.3, §2.5, §4). Publishing needs two gates to open:
- the wave's manifest entry must be `decision_status: "active"` under D-29a (`site/scripts/lib/pilot-render-gate.mjs`);
- the dashboard decision must be `active` under D-29b (`site/scripts/lib/dashboard-render-gate.mjs`, `site/src/data/model-benchmark/dashboard-decision.json`).

D-29b exists only as a draft (`docs/ai-dashboard/PRD_AI_MODEL_DASHBOARD.md` Appendix A). `DECISIONS.md` has no entry for it. Because approvals are serial and asked one at a time, a single unanswered question stops the whole chain.

---

## 2. Alternatives

**A. Hosted only.** Every subject (open-weight and frontier) and every judge goes through one gateway, for example OpenRouter, or through direct provider APIs. Each request pins the provider, the exact dated model id (never an alias such as `-latest`), the quantisation and "no fallback". The record logs the model string, provider and fingerprint the response returns. Whether a given gateway supports provider pinning, quantisation filters, `seed`, or returns a system fingerprint is **UNVERIFIED — check before approval**.

**B. Local batch.** Keep Ollama. Run every queued build in one scheduled, unattended overnight batch, so one wave holds all eligible builds. Judges stay Claude subagents, or become Claude API calls.

**C. Hybrid (recommended).** Local Ollama, digest-pinned, for the reference build and open-weight builds of 6 GB or less. A hosted gateway for frontier models and for open-weight models too large for the host. All judging moves to scripted API calls from a cross-family panel.

| | A. Hosted only | B. Local batch | C. Hybrid |
|---|---|---|---|
| Throughput | High: parallel calls, limited by provider rate limits (UNVERIFIED) | 9 builds in about 4–5 h of GPU time, but only on nights with about 6.6 GiB free; judging still manual if subagents | Local part as B; hosted part in parallel; judging scripted |
| Cash cost | Every call paid (formula below) | None for subjects; judging uses the subscription | Subjects: frontier only. Judges: all paid |
| Determinism / provenance | Weakest: no weights digest; the provider may change serving silently; seed support varies (UNVERIFIED) | Strongest: `model_digest`, `ollama_version`, fixed seed per call (`lib/local-subjects.mjs`) | Strong for local builds; hosted builds are labelled as a separate access tier and checked for variance |
| Judge independence | Cross-family possible | Claude only (unchanged limit) | Cross-family, 3 families |
| Contamination | Bank items leave the machine for third parties. Today's bank is already public (`public-permanent`), so the new risk is small, but a future secure pool must never use this route without a no-retention, no-training setting (UNVERIFIED per provider) | None new | As A, for hosted subjects and all judging |
| Founder touch-points | Key + ceiling once; 1 per wave | Close apps on run nights; 1 per wave | Key + ceiling once; 1 per wave |
| Build effort | Medium: hosted adapter, judge adapter, cost ledger | Small: batch-wave planner | Medium (same parts as A; local stays as is) |
| Frontier models tested | Yes | No | Yes |

B alone does not fix R1 if judges stay subagents, and it does not fix R2 or the frontier gap. A gives up the digest pinning that is the harness's best provenance, and it breaks continuity with the `gemma2:9b` reference series. C keeps what already works and adds only what is missing.

### Cost formula (all inputs from the repo; prices UNVERIFIED)

Measured from pilot-3 records (`ITERATION_LOG.md` Iteration 106): **93 input and 379 output tokens per subject call**.

- **Subject, per build at 3 trials:** 83 items × 3 trials = 249 calls.
  - Input: 249 × 93 ≈ 23,200 tokens. Output: 249 × 379 × R ≈ 94,400 × R tokens.
  - R is a reasoning-token multiplier for models that think before answering. It is 1 for the pilot models. For hosted reasoning models R is **unmeasured**, and the variance-check sample (§3) measures it.
- **Judges, per build:** 249 replies × 2 judges = 498 ratings.
  - Judge token counts are **not measured anywhere in the repo**. As an estimate, input per rating is 93 (prompt) + L (scale) + 379 (reply) + P/16 (batch preamble shared over 16 entries).
  - From one batch file (`pilot-2026-10-03/judge-batches/claude-fable__batch-01.md`), L ≈ 450 and P ≈ 350 tokens, so input ≈ 940 tokens per rating. These are estimates, not measurements.
  - Output per rating: Ĵ ≈ 150, the design parameter in `docs/MODEL_EVALUATION_HARNESS_DESIGN.md` (line 386), not a measurement.
  - So per build, about 470,000 judge input tokens and 75,000 judge output tokens, split between 2 judge models.
- **Per wave:**

  Cost = Σ hosted subjects (23.2k × Pin_s + 94.4k × R_s × Pout_s) + Σ judges (in_j × Pin_j + out_j × Pout_j) × (1 + h)

  Here h is the overhead for re-quote and supplement rounds, the 48 anchor ratings, the variance check and the contamination probe. h is unmeasured; take it from the first wave's ledger.

Local subjects cost no cash. Note that judging, not subjects, dominates token volume. Work item 1 measures the real judge token counts on stored pilot-3 batches before any money is spent.

---

## 3. Recommended design (C, hybrid)

### Pipeline

| Stage | What happens | Automated? | Evidence written |
|---|---|---|---|
| 1. Plan | `weekly-wave plan` picks **every** eligible queued build (local and hosted) under protocol v2. It pins local builds by tag and digest, and hosted builds by provider, exact model id and quantisation. It computes the cost estimate and refuses if the estimate exceeds the monthly ceiling. | Yes | `run-config.json`, `PREREGISTRATION.md`, cost estimate |
| 2. Preregister | Hash the plan (sha256 of `PREREGISTRATION.md` and `run-config.json`). Commit only that pathspec and push it to a `waves/<date>` branch. A push runs CI only; it never deploys (`.github/workflows/deploy.yml`: deploy runs only on `workflow_dispatch`). GitHub's push time is the external proof that the plan came before the data. | Yes, under a narrow standing authority (ask 3) | commit sha in `weekly.json` |
| 3. Collect | Local: the scheduled 02:00 task as today, deferring on low memory. It retries nightly and resumes per call because each call writes its own record. Hosted: the same task, over the same record schema. | Yes | one record per call |
| 4. Variance check | For each hosted subject, a seeded sample of 12 items is re-asked twice more (24 extra calls), after the main run. Report the exact-reply match rate and the spread of judge ratings, and measure R. Local builds keep the existing reference series. | Yes | `operations/variance.json` |
| 5. Judge | Scripted API calls with no tools by construction (a plain chat request, no tool schema). The `tool_uses == 2` ritual is then unnecessary. Temperature 0, batch of 16, same batch text as today. Each reply gets 2 judges from **2 different families**, neither the subject's family. Panel: Claude + 2 other families (UNVERIFIED which models; chosen at ratification). The existing validity, re-quote, supplement and reroute rules apply unchanged. | Yes | judge answers, raw API bodies |
| 6. Score | Existing chain: `ingest-answers` → `judge-validity` → `run-mcp-probe` (subject side now scripted) → `analyze-pilot` → `export-wave`. Scoring still comes only from `tools/cb-probe` `computeCompositeFromDimensions`. | Yes | `analysis.json`, wave file |
| 7. Audit and draft | A new `audit-wave.mjs` re-derives every token in the draft from raw records, the way the pilot-3 claim audit was done by hand. The agent writes only the narrative around the resolved tokens. | Script yes; prose by agent | audit file, draft report |
| 8. Gate | `wave-ready.mjs` runs every gate in §4 and writes a pass or fail packet | Yes | `operations/publication-gates.json` |
| 9. Publish | One founder approval per wave (§4) | Human | DECISIONS / ledger row |

### Traceability (what makes a result reproducible)

- **Every call record** keeps today's fields (`lib/local-subjects.mjs`): `outgoing_message_sha256`, `system_message_sha256`, `derived_seed`, `realised_options`, `response`, `response_sha256`, the attempts, and the timings.
- **Hosted records add** `access_tier: "hosted-api"`, `provider_requested`, `model_requested`, and the model, provider and fingerprint strings exactly as returned. They also add `request_params` (temperature, seed, max_tokens), `usage`, the billed cost if returned, and the **full raw response body**.
- **Raw bodies stay outside the published projection.** The public projection (`projectWavePublic`) is unchanged.
- **Sampling:**
  - Judges run at temperature 0.
  - Subjects: local builds keep their Modelfile defaults plus the derived seed, as in v1. Hosted subjects send one declared temperature, and a seed where the provider supports it.
  - The subject temperature for hosted models is a methodology choice inside ask 2.
- **The wave file and report name** the protocol version, the preregistration sha, the bank sha, and each subject's access tier.
- **Hosted results are never placed on an axis with local results** unless the protocol declares the comparison. "Build" stays defined by tag + digest; a hosted build is a different build.

### Automated vs human

- **Automated:** everything from plan to gate packet, including spend tracking against the ceiling. The collector stops when the ledger reaches the ceiling and records the stop as a deviation.
- **Human (founder):**
  - one-time: the key, the ceiling, ratifying v2 and D-29b, the narrow commit authority, and registering the scheduled task;
  - per wave: one "publish wave X" approval.
- **Human (agent session):** reading the gate packet, writing the narrative, and appending any deviation as a dated `D<n>` (runbook §3.9 rules unchanged).

---

## 4. Publish design

**One founder approval per wave.** When `wave-ready.mjs` passes, the session prepares a single approval packet: wave id, gate results, deviations, cost, files, and a preview build. The founder's one reply ("publish wave-YYYY-MM-DD") authorises all of:

1. committing the wave directory, the wave export and the report source;
2. adding the manifest entry with `decision_status: "active"` under D-29a;
3. pushing, then dispatching the deploy workflow.

The dashboard needs no per-wave change once D-29b is `active`, because `dashboardEntries` already includes every renderable dashboard wave. A **standing approval** (publish automatically when every gate passes) is possible later. This document does not recommend it before two consecutive waves have published cleanly under per-wave approval, because AUTONOMY §1b treats every deploy as an escalation.

**Gates.** All must pass. None replaces or relaxes an existing gate.

1. **Plan-before-data:** `weekly-wave.mjs check` OK, and the preregistration commit is older than the first record.
2. **Completeness:** every planned call has an `ok` record, or a failure classified under a pre-registered rule. The failure-rate threshold is set in v2.
3. **Judge validity:** at most 5% unfound quotes per judge (existing, `PROTOCOL.json` `judge_validity`). Every response ends with exactly 2 non-self, cross-family ratings.
4. **Judge agreement:** exact agreement per subject at or above a floor ratified in v2. The proposed floor is the lowest per-subject `judge_agreement.exact` observed in pilot-3, read from `waves/pilot-2026-10-03.json`. Also reported: the signed Claude-minus-non-Claude rating difference in composite units. Above a v2 threshold, the wave is published only as "judge-family disagreement" findings.
5. **Anchor:** the existing mean-absolute verdict **plus** the signed-drift check proposed as METH D-1 (`METHODOLOGY_RELEASE_ASSESSMENT_2026-10-14.md` §4). A non-comparable wave is labelled as such.
6. **Variance check** (hosted subjects): exact-match and rating spread within v2 thresholds. Otherwise the subject is shown as "unstable under re-ask" with no separation claims.
7. **Leak and blinding:** the existing brief leak checks, the reply self-identification scan, `test-model-html-leak.mjs`, `model-report-html-gates` (G1–G21) and `test-model-dashboard` on a preview build.
8. **Claim audit:** `audit-wave.mjs` reports zero open items.
9. **Cost:** the ledger total is within the ceiling.
10. **Content rules:** D-29a and the draft D-29b items 2–5 (ranges, no ranks, pilot label on every figure, no cross-wave axis), as the existing gates already enforce.

---

## 5. Founder asks (minimal)

1. **Provide one hosted-API key (OpenRouter recommended) and a monthly spend ceiling.**
   - Default: one OpenRouter key, stored outside the repo as a machine-level environment variable or in the Windows credential store, with a ceiling you choose.
   - The planner shows the formula-based estimate before every wave and refuses anything above the ceiling.
   - Before approval, check pricing, provider pinning, data retention and training policy (UNVERIFIED).
2. **Ratify protocol `weekly-v2` in place of `weekly-v1`.** No v1 wave exists, so no comparability series is lost. Default: yes. v2 contains:
   - all eligible builds per wave;
   - a hosted-subject class with pinning;
   - the cross-family API judge panel (3 families, 2 per reply);
   - temperature 0 for judges and one declared subject temperature for hosted models;
   - the signed-drift anchor;
   - the variance check, and thresholds for completeness and agreement.

   It also settles M-FD-5 (hold the two non-commercial builds until counsel answers) and M-FD-6 (store qwen3 thinking traces and never show them to judges) by default, so they need no separate decisions.
3. **Grant a narrow standing commit authority.** The agent may commit and push only `research/model-runs/wave-*/{run-config.json,PREREGISTRATION.md,weekly.json}` to `waves/*` branches. This needs an AUTONOMY §1b amendment. Default: yes. Without it, each plan commit is one more approval per wave.
4. **Ratify D-29b (draft Appendix A), with the §4 gate list as its publication conditions,** and approve publication per wave by one message. Default: yes, per-wave approval. Review a standing auto-publish after two clean waves.
5. **Register the scheduled task once** (`research/model-runs/weekly/register-task.ps1`, already M-FD-3a). On run nights, leave the PC on with heavy apps closed. Default: yes.

---

## 6. Build plan

| # | Work item | Owner | Acceptance criteria |
|---|---|---|---|
| 1 | **`wave-ready.mjs` gate runner and judge-token measurement, on stored pilot-3 data.** No founder decision needed. | backend-engineer | It runs gates 1, 3, 5 (both forms), 7 and 8 on `pilot-2026-10-03` and writes `publication-gates.json`. A planted defect for each gate fails it. It reports real judge input and output token counts (tokeniser estimate, method stated) to replace the estimates in §2. No data or protocol file changes. |
| 2 | Signed-drift anchor metric (reporting only until v2) | backend-engineer | `analysis.json` gains signed per-judge drift in composite units; tests pass; the v1 verdict is unchanged |
| 3 | `audit-wave.mjs`: automated claim re-derivation | backend-engineer, qa-engineer | It reproduces the pilot-3 claim audit's findings from raw files with zero manual steps |
| 4 | Hosted subject adapter (record schema above, raw bodies, no-fallback pinning, cost ledger, ceiling stop), tested against recorded fixtures only | backend-engineer, security-engineer | No key is read in tests. The key never appears in a record, log or commit (planted-secret test). The ledger refuses past the ceiling. |
| 5 | Judge API adapter and cross-family routing (2 distinct families, neither the subject's) | backend-engineer | A property test over every subject and family routing; the existing validity, reroute and supplement tests stay green; batch text is byte-identical to today's |
| 6 | Draft `PROTOCOL.v2` as a **proposed** file plus a planner that takes every eligible build | backend-engineer | `check` refuses any conformance difference; status stays `proposed` |
| 7 | Dashboard support for access tier and judge-family display | frontend-engineer, dataviz-architect | Hosted and local are never on one axis without a declared comparison; `test-model-dashboard` is green with new negative controls |
| 8 | After asks 1–3: a live 2-call smoke test per hosted subject with a non-bank prompt, as `READINESS` was done | backend-engineer | Returned model strings are logged; cost is within the ledger |
| 9 | First v2 wave end to end, then the publication packet | coordinator | All §4 gates pass, or the failures are reported; one founder approval |
| 10 | Scheduler task covers hosted collection; runbook rewritten for v2 | devops-engineer | `status` reports both routes; the runbook names exactly one per-wave stop |

**Highest risks.**
- Hosted serving can change silently. Mitigations: the variance check, logged model strings and the access-tier label.
- Judge cost is unmeasured until item 1.
- A new judge panel may move results relative to the pilots. That is acceptable, because the pilots have comparability "none" and no v1 wave exists. The first v2 wave starts the series.
