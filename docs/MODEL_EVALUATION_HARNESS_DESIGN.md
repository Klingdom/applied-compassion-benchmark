# Model Evaluation Harness — Design

**Question answered:** how does this project actually test AI models?

**Date:** 2026-09-07
**Author:** system-architect
**Status:** DESIGN ONLY. No package installed, no credential written, no `.env` created, no network call made, no commit performed.
**Authority:** written under `AI Benchmarking Program/HUMAN-AUTHORITY-BOUNDARY.md` and `AUTONOMY.md`. Every action either file reserves to the founder has been stopped at, not worked around.
**Upstream:** `docs/CB_MODEL_INTEGRATION_2026-09-06.md`, `.benchmark-ops/EVALUATION_LEDGER.md`, `.benchmark-ops/MODEL_REGISTRY.md`, `.benchmark-ops/BLOCKERS.md`, `.benchmark-ops/COST_LEDGER.md`, `site/src/data/model-benchmark/tasks-v1.json`.

---

## 0. Premises — independently re-verified, not assumed

The brief supplied five environment facts and asked me to verify rather than trust. All five hold.

| Supplied premise | Verdict | Evidence checked this session |
|---|---|---|
| No model-provider SDK installed anywhere | **Confirmed** | `site/package.json` — grep for `openai\|anthropic\|@google\|groq\|ollama\|generative-ai` (case-insensitive): **zero matches**. `worker/package.json` devDependencies are exactly `@cloudflare/workers-types`, `typescript`, `wrangler`; no dependencies block at all. |
| No model API key scaffolding | **Confirmed** | Two `.env.example` files exist (`.env.example`, `site/.env.example`). Root file contains 15 generic keys — `DATABASE_URL`, `REDIS_URL`, `AUTH_SECRET`, `STRIPE_SECRET_KEY`, `AWS_ACCESS_KEY_ID`… It matches no part of this project's real architecture (no database, no Stripe, no AWS) and contains no provider entry. It is dead boilerplate. |
| Worker has egress + a secrets mechanism | **Confirmed** | `worker/src/index.ts` — outbound `fetch` to `${env.LISTMONK_API_URL}/api/subscribers`, `/api/tx`, subscriber lookup/PUT, plus a `fetch(scoreUrl)` for the badge. Secrets referenced as `env.*`: `GUMROAD_SELLER_ID`, `LISTMONK_API_TOKEN`, `UNSUBSCRIBE_HMAC_SECRET`, `INTERNAL_API_TOKEN`, `ADMIN_API_TOKEN`. KV binding `SCORE_WATCH`. |
| No eval runner exists | **Confirmed** | `.benchmark-ops/EVALUATION_LEDGER.md`: *"0 runs. 0 trials. 0 raw responses. 0 raters. 0 scores."* `MODEL_REGISTRY.md`: 0 rows. No harness directory exists. |
| Site is a static export | **Confirmed** | `next.config.ts` `output: 'export'` (recorded as D-01). Nothing server-side runs on the web host. |

One premise correction, offered because it changes a recommendation later: the restored manual scorer **does not** carry the second composite formula named in CONFLICT-04. `site/src/lib/evaluation-scorer.ts` states at line 5: *"This module does NOT implement its own composite-scoring math. It imports…"* and blocks the composite until all eight dimensions have at least one scored non-draft item. That is materially better than the legacy tool, and it closes one half of CONFLICT-04. The band-vocabulary half (CONFLICT-03) is still open.

---

## PART 1 — What can be tested TODAY, with zero credentials and zero spend

### 1.1 The only instrument that exists

`site/src/components/model-benchmark/EvaluationScorer.tsx` (client component, restored under Item 3). A human opens a chat interface, pastes a prompt, reads the answer, clicks 1–5 against a published five-anchor rubric, and exports JSON/CSV. The component already ships this string, which is accurate and load-bearing:

> `"Self-serve evaluation aid. This is a single-rater, self-reported score — not an official Compassion Benchmark result. The published Model Index requires repeated trials, blinding, human rater panels, and adjudication, none of which this tool performs."`

### 1.2 What a manual run structurally is not

| Property an evaluation needs | Present in a manual run? | Consequence |
|---|---|---|
| Item novelty | **No.** All 33 items are `exposureStatus: "public-permanent"`, published with the full five-anchor answer key since launch. | Any model may have trained on both the item and the target behaviour. Bias direction is **upward**; magnitude is **unmeasurable without a secure comparison set**. |
| Blinding | **No.** The rater knows which model, and in this project has a stake in the result. | Expectancy effect uncontrolled. |
| Repetition | **No.** n = 1 per item. | No variance estimate. This repo already has counter-evidence: `DECISIONS.md` D-07 — the same automated pipeline scored ADP 58.1 then 60.6 three days apart, crossing a band boundary; Kazakhstan moved 24.4 → 13.7 in four days. |
| Rater agreement | **Impossible.** One rater. | No kappa, no alpha, no adjudication. `05-HUMAN-RATING` requires two independent raters per official output. |
| Configuration control | **No.** A chat UI applies an undisclosed system prompt, an undisclosed moderation layer, and an undisclosed sampling config, and may not match the API surface. | The `product_surface`, `system_prompt_status` and `sampling` fields required by `MODEL_REGISTRY.md` cannot be populated with anything but `unknown`. |
| Exact model identity | **No.** A chat UI reports a marketing name, not a dated snapshot. | Registry invariant 4 ("no row without evidence carrying a `source_url` and `retrieved_at`") and invariant 5 ("`claim_class: inference` may never be the identity of record") both fail. **A manual run may not create a `MODEL_REGISTRY.md` row.** |
| Raw evidence | **Only if deliberately captured.** The scorer stores scores, not transcripts. | Without the verbatim response text, nothing is auditable and nothing is re-ratable. |
| Item coverage | **Degraded.** 4 of 33 items (`ACC-1-A`, `INT-1-B`, `INT-1-C`, `INT-3-A`) carry unfilled `[...]` slots and are `validationStatus: draft`. SYS has **2** items against 5 subdimensions; AWR has 6. | 29 scorable items, unbalanced. A "SYS dimension estimate" rests on two items. |

### 1.3 Verdict — what a manual run is actually worth

**As a measurement of a model: close to zero, and negative if published.**

There is no claim of the form *"Model X scores N"* that a manual run can support. Not a weak version of that claim, not a provisional version, not a version with an asterisk. The exposure problem alone is disqualifying for any cross-model comparison, and it cannot be repaired after the fact — you cannot un-publish an answer key.

**As instrument-development and cost-calibration data: genuinely valuable, and it is the best available use of the pre-credential period.**

Three claims a manual run *can* support, stated precisely:

| Claim class | Exact claim form | Why it holds |
|---|---|---|
| **Instrument diagnostics** | *"Anchor level 3 and level 4 of item `EMP-3-B` are not distinguishable by a rater in practice."* / *"Item `ACC-3-B` does not discriminate — every response lands at 4."* | This is a statement about the rubric, not about the model. Exposure and blinding do not threaten it. It is exactly the input `WQ-P1-04`, `WQ-P1-05` and secure-item authoring need. |
| **Cost and feasibility calibration** | *"A trained rater takes M minutes per item-response."* | Human rating is the dominant programme cost (Part 3, §3.6). This measurement is otherwise unobtainable and requires no credential. |
| **Existence proof of a failure** | *"On 2026-09-DD, in surface S, a system self-identifying as X returned the following verbatim text to public item `ACT-1-A`."* | A single observation is valid evidence that a behaviour **is possible**. It is never evidence of a **rate**. Recorded with `claim_class: evaluator_observation`, never `fact`. |

**What a manual run may never do**, as a hard rule:

- produce a number that enters `EVALUATION_LEDGER.md`, `MODEL_REGISTRY.md`, any index JSON, or any published page;
- produce a band label attached to a model;
- support any comparison between two models;
- be described as a score, a ranking, a benchmark result, or a measurement.

### 1.4 The zero-cost protocol worth adopting now

If manual runs happen, this makes them useful instead of wasted. All of it is buildable today with no credential and no spend.

```
research/model-index/manual-observations/<yyyy-mm-dd>-<slug>/
  observation.json     # surface, UI-claimed model string, date, rater, items attempted
  transcripts/<item_id>.txt   # verbatim, unedited — the whole point
  notes.md             # instrument diagnostics, in the rater's own words
```

Rules:
1. This tree is **not** `research/model-index/runs/`. It is never read by the analysis pipeline.
2. Every record carries `official: false`, `claim_class: "evaluator_observation"`, `blinded: false`, `trials: 1`.
3. Sensitive items (§7.2) are opt-in per session, never bulk-run.
4. Nothing here creates a registry row or a ledger row. Ever.

---

## PART 2 — Minimum viable path to a first *real* automated evaluation

### 2.1 Where it runs — and why

| Runtime | Egress | Secret store | Long batch jobs | Reproducible by a third party | Secure-pool safe | Verdict |
|---|---|---|---|---|---|---|
| **Cloudflare Worker** | Yes (9 outbound `fetch` today) | `wrangler secret put` — real and already in use | **No.** CPU-time limited per invocation; a 640-call batch with backoff is the wrong shape entirely. Would require queues + Durable Objects — new services, new failure modes. | No | Logs are operator-visible in the CF dashboard | **Rejected for batch execution.** Reserved for one narrow future job: the `02-RELEASE-INTELLIGENCE` sentinel probe (single call, scheduled, tiny) — Phase G, not now. |
| **GitHub Actions CI** | Yes | Repo secrets — **none configured today**; adding a provider key is a founder action with the same authority cost as any other | Fine | **Best.** A run is triggered by a recorded, reviewable event. | **No.** Secure prompt text must never enter a shared CI runner or its logs. Self-hosted runner required, which is new infrastructure. | **Target state for the public pool, Phase D.** Not first. |
| **Local Node CLI** | Yes | OS environment variable, read at process start, never written to disk by the harness, never echoed | Fine — full control over concurrency, backoff, resume | **No, on its own** — mitigated below | Yes, with `--evidence-root` outside the repo | **Chosen for Phase C (first real run).** |

**Justification for local-first, against the obvious objection.** "Local runs are unreproducible by others" is true of the *runtime* and false of the *result*, provided the evidence record is complete. Reproducibility is a property of the manifest, not of the machine. The harness therefore commits: the exact item set with per-item content hashes, the exact sampling config, the harness git SHA, the adapter version, the provider-returned request IDs, every raw response body verbatim, and a hash tree over all of it. A third party with credentials can re-execute from the manifest alone. That is the actual bar.

Two further reasons local wins for the *first* run:

1. **Fewest new trust surfaces.** Putting a paid provider key into GitHub Actions secrets creates a standing exfiltration surface (any workflow, any action update, any `pull_request_target` misconfiguration). For a first pilot against a public-only pool, an environment variable on one machine is a smaller commitment and is trivially revocable.
2. **CI does not actually dodge the blocker.** Both paths require the founder to provision a credential (`BLK-002`). CI adds work without removing a gate.

**Graduation criterion (Phase D):** once the harness has completed two clean pilot runs and the replay tests are green, public-pool runs move to CI so that execution is triggered by a recorded event rather than a person's shell history. Secure-pool runs **never** move to shared CI.

### 2.2 Component boundary

```
┌────────────────────────────────────────────────────────────────────┐
│ research/scripts/model-harness/            (Node ESM, zero deps)   │
│                                                                    │
│  bin/run.mjs          CLI. Parses flags, refuses unsafe combos.    │
│  core/planner.mjs     item set → ordered trial plan (seeded)       │
│  core/executor.mjs    concurrency, backoff, retry rules, resume    │
│  core/evidence.mjs    canonical JSON, sha256, append-only writer   │
│  core/manifest.mjs    manifest build + lock + hash tree            │
│  core/redact.mjs      secure-pool guards; console/error redaction  │
│  adapters/<id>.mjs    one file per provider — the ONLY network code│
│  adapters/replay.mjs  fixture adapter. No network. Used by tests.  │
│  probes/determinism.mjs  identical-call repetition probe           │
└────────────────────────────────────────────────────────────────────┘
        │ writes (never reads back for decisions)
        ▼
research/model-index/runs/<run_id>/     ← evidence store, append-only
        │
        ▼
research/scripts/model-analysis/        ← SEPARATE program, separate version
        (reads a LOCKED run; produces item scores, CIs, gates)
```

**Hard boundary, stated because collapsing it is the most likely design failure:** the harness produces **responses**. It never produces **scores**. Scoring is a distinct program, run against a locked run directory, with its own version number recorded as `analysis_version`. This is what makes "re-score without re-running" possible and what makes cherry-picking structurally impossible.

**Zero new packages.** `node:crypto` gives SHA-256. `fetch` is built in. `node:fs/promises` writes files. Nothing else is needed. This is deliberate: a harness with no dependency tree is a harness that still runs in three years, which is the audit horizon.

### 2.3 The provider adapter contract

One interface, one file per provider, no vendor concept leaks past the adapter boundary.

```ts
// core/types.d.ts — reference types. Implementation is plain ESM.

export type ProductSurface =
  | 'consumer' | 'api_default' | 'base' | 'fine_tune' | 'agent' | 'deployed_system';

export interface ModelTarget {
  registryId: string;          // FK to .benchmark-ops/MODEL_REGISTRY.md. REQUIRED.
  provider: string;            // adapter id
  endpoint: string;            // exact URL tested
  model: string;               // exact snapshot string sent on the wire
  productSurface: ProductSurface;
  accessTier: string | null;
  region: string | null;
}

export interface SamplingConfig {
  temperature: number | null;
  topP: number | null;
  maxOutputTokens: number | null;
  seed: number | null;
  seedControl: 'supported' | 'unavailable' | 'ignored' | 'unknown';
  stop: string[] | null;
  systemPrompt: string | null; // null = none sent. For `api_default` runs this MUST be null.
}

export interface TrialRequest {
  trialId: string;             // `${runId}:${itemId}:${variantId ?? '-'}:${trialIndex}:${attempt}`
  runId: string;
  itemId: string;
  itemHash: string;            // sha256 of canonical {id,itemVersion,prompt,anchors}
  itemVersion: string;
  variantId: string | null;    // paired / counterfactual arms, e.g. INT-1-B has A and B
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[];
  sampling: SamplingConfig;
  timeoutMs: number;
  trialIndex: number;          // 0..T-1
  attempt: number;             // 0-based; every attempt is persisted
}

export type ErrorClass =
  | 'rate_limit' | 'timeout' | 'server_error' | 'network'
  | 'auth' | 'quota' | 'invalid_request'
  | 'content_filter_request' | 'content_filter_response'
  | 'unknown';

export interface TrialResponse {
  ok: boolean;
  rawResponseBody: string;          // provider body VERBATIM, unparsed, never edited
  text: string | null;              // extracted assistant text
  finishReason: string | null;      // provider's string, unmapped
  usage: {
    inputTokens: number | null;
    outputTokens: number | null;
    source: 'provider' | 'unavailable';   // never 'estimated' in this field
  };
  providerRequestId: string | null;
  httpStatus: number | null;
  latencyMs: number;
  moderation: { flagged: boolean | null; raw: unknown | null };
  toolCalls: unknown[] | null;
  error: { class: ErrorClass; message: string; retryable: boolean } | null;
}

export interface AdapterCapabilities {
  seedControl: 'supported' | 'unavailable' | 'unknown';
  systemPromptSupported: boolean;
  logprobsAvailable: boolean;
  usageReported: boolean;
  moderationSurfaceReported: boolean;
  notes: string;               // free text, recorded in the manifest
}

export interface ProviderAdapter {
  readonly providerId: string;
  readonly adapterVersion: string;         // bumped on ANY behavioural change
  describeCapabilities(): AdapterCapabilities;
  execute(req: TrialRequest, target: ModelTarget, signal: AbortSignal): Promise<TrialResponse>;
  countTokens?(text: string): number | null;  // null when no local tokenizer exists
}
```

**Six invariants the adapter layer must enforce, each with a reason:**

| # | Invariant | Reason |
|---|---|---|
| A1 | The adapter is the **only** file permitted to call `fetch`. A lint rule / grep test asserts this. | Keeps every network side effect in one reviewable place. |
| A2 | `rawResponseBody` is stored verbatim, before parsing, always — including on error. | `04-MODEL-EVALUATION-RUN`: raw outputs are never edited. A parse bug two years from now must be recoverable. |
| A3 | A **content filter refusal is data, not an error.** `content_filter_response` is recorded as a completed trial and is **never retried**. | Refusal rate is one of the things being measured. Retrying a refusal until it complies is the purest form of cherry-picking. |
| A4 | The adapter never selects among responses. It returns exactly what the attempt produced. | `04` step 7: never cherry-pick the best response. |
| A5 | The adapter never logs the request body. Error messages are constructed from status + class, never from echoed input. | Secure-prompt containment (§6). |
| A6 | `adapterVersion` is bumped on any change to request construction, parsing, or error mapping, and is recorded in the manifest. | Two runs with different adapter versions are not directly comparable and must be visibly so. |

**Provider-agnosticism is proven, not asserted.** The acceptance test for "provider-agnostic" is: *a second adapter is added and the executor, planner, evidence writer and analysis code change by zero lines.* That test cannot pass until Phase D, which is why Phase D exists.

### 2.4 The evidence record — what makes a result auditable in 2029

Directory layout, append-only:

```
research/model-index/runs/<run_id>/
  manifest.json              written at start, extended at lock, never rewritten
  manifest.sha256
  trials/<item_id>/<variant>/<trial_index>.<attempt>.json
  trials.index.jsonl         one line per persisted attempt, append-only
  errors.jsonl
  usage.jsonl                per-attempt tokens/latency; rolls up to COST_LEDGER.md
  hashtree.json              written at lock: sorted [path, sha256] + root hash
  LOCK                       presence forbids all further writes to this run_id
```

**Manifest fields — required, all of them.** A manifest missing any field is an incomplete run and the completeness gate in `EVALUATION_LEDGER.md` blocks publication.

| Group | Fields |
|---|---|
| Identity | `run_id`, `registry_id`, `benchmark_version`, `bank_version`, `form_id`, `pool`, `label` (`pilot` at first) |
| Provenance | `harness_commit` (git SHA), `adapter_id`, `adapter_version`, `node_version`, `os`, `operator` (human name), `authority` (pointer to the approval this ran under) |
| Target | full `ModelTarget`, plus `system_prompt_status`, `moderation_layer`, `tools[]` — copied from the registry row, not re-typed |
| Configuration | full `SamplingConfig`, `trials_per_item`, `randomization_seed`, `concurrency`, `timeout_ms`, `retry_policy` (verbatim, versioned) |
| Item set | `items[]` = `{item_id, item_version, item_hash, variant_ids[]}`. **Item hash only — never prompt text for secure items.** |
| Capabilities | `adapter.describeCapabilities()` output, verbatim |
| Time | `started_at`, `completed_at`, `locked_at` (ISO-8601 with offset) |
| Integrity | `hashtree_root`, `trial_count_expected`, `trial_count_persisted`, `failed_trial_ids[]` |
| Cost | `tokens_in_total`, `tokens_out_total`, `usage_source`, `cost_estimate`, `cost_actual` (null until billed), `ceiling_at_time` |

**Hashing.** SHA-256 over **canonical JSON**: keys sorted lexicographically, UTF-8, LF newlines, no insignificant whitespace, numbers in shortest round-trip form. One helper, `core/evidence.mjs#canonical()`, used by every hash so the definition cannot drift. `hashtree.json` lists every artifact path with its hash, sorted by path; the root is the hash of that sorted list. Written once, at lock. `manifest.sha256` covers the final manifest including the root.

This gives the property that matters: **an auditor in 2029 can verify that the responses being analysed are the responses that were returned**, without trusting the operator, the repo history, or the analysis code.

**Item content hashing solves a subtler problem.** `item_hash` covers `{id, itemVersion, prompt, anchors}`. If a prompt is edited, the hash changes, and a comparison across runs with different item hashes is rejected by the analysis layer rather than silently performed. This is the item-level analogue of the registry's "a changed snapshot cannot overwrite an old identity."

**Trial record fields (one file per attempt):**

`trial_id`, `run_id`, `item_id`, `item_hash`, `item_version`, `variant_id`, `trial_index`, `attempt`, `request_sent` (message array — **omitted and replaced by `request_hash` when pool ≠ public**), `sampling`, `requested_at`, `responded_at`, `latency_ms`, `http_status`, `provider_request_id`, `raw_response_body`, `raw_response_sha256`, `text`, `finish_reason`, `usage`, `moderation`, `tool_calls`, `error`, `status` (`completed` | `refused` | `filtered` | `failed`), `harm_screen` (§7.3).

### 2.5 Determinism — the honest position

**Do not assume any provider is deterministic, and do not assume any provider is not.** Measure it.

| Control | Design decision | Rationale |
|---|---|---|
| **Temperature** | The **official arm** runs at the provider's documented default for the declared `product_surface`. A **diagnostic arm** runs at `temperature: 0`. Both recorded. | The programme measures behaviour as deployed. A temperature-0 arm answers a different, narrower question ("what does the modal response look like") and is a diagnostic, not the measurement. Publishing a temp-0 number as *the* score would misdescribe what users experience. |
| **Seed** | Recorded always. When unsupported: `seed: null, seedControl: 'unavailable'`. Never omitted, never faked. When supported: a fixed programme seed per run, derived from `run_id`, recorded in the manifest. | Silence about seed control would let a reader infer reproducibility that does not exist. |
| **Reproducibility claim** | The harness makes **no** reproducibility claim. It makes a **replayability** claim: the stored responses can be re-analysed byte-identically forever. Whether re-execution reproduces them is an **empirical question the determinism probe answers**, per snapshot, per date. | Serving stacks batch, route and shard in ways outside the caller's control. Asserting either determinism or non-determinism for a specific provider would be inventing a provider capability. |
| **Determinism probe** | `probes/determinism.mjs`: send one fixed, non-sensitive item **20 times** with identical parameters in a single window, and report exact-match rate, edit-distance distribution, and length variance. Run once per snapshot per wave; recorded in the manifest as `determinism_probe_ref`. | Turns an assumption into a measurement, at negligible cost (20 calls). Its result is a **publishable property of the snapshot**. |
| **Trials per item** | **T = 5** for the first pilot and for standard items. **T = 10** for items flagged high-variance by a prior wave, and for all critical-harm-relevant items. | `04-MODEL-EVALUATION-RUN` floors T at ≥3. Three gives you a mean and a nearly useless dispersion estimate. Five is the smallest T that yields a usable per-item SD and lets the wave *derive* the T needed for a target confidence interval width — so T=5 in wave 1 is what makes T evidence-based in wave 2. The marginal cost is negligible (Part 3). |
| **Order** | Trial order is randomised under `randomization_seed`. Matched counterfactual arms (e.g. `INT-1-B` A/B, `EQU-1-C` identity swaps) are **separated** in the order and never adjacent. | `04` step 4. Prevents within-session priming from contaminating a paired comparison. |
| **Session policy** | One clean session per independent trial. Multi-turn state preserved **only** for items that specify it (`ACC-1-A` requires a prior turn). | `04` step 6. |

**Variance is a measured property, not noise to average away.** This is a design commitment with downstream consequences:

- Per item, per model, publish the mean **and** the SD, and the exact-match rate from the determinism probe.
- A model whose responses to `ACT-1-A` (active suicidal ideation) score 5, 5, 5, 2, 5 is **not** a 4.4 model. It is a model that fails one time in five on a crisis item. `06-ANALYSIS` requires a `critical_harm_rate` recorded **separately from** the 1–5 score, and `05-HUMAN-RATING` requires critical-harm flags kept separate. The harness supports this by never collapsing trials at execution time — the analysis layer sees all five.
- **Response stability** is proposed as a published, first-class field on every model page, alongside the composite. It is measurable now, cheap, and no other public benchmark reports it well.

### 2.6 Retry policy — published, deterministic, versioned

Recorded verbatim in the manifest as `retry_policy` with a version string. Changing it is a versioned change, not a code tweak.

| Error class | Retryable | Max attempts | Backoff |
|---|---|---|---|
| `rate_limit` | Yes | 4 | Honour `Retry-After` if present; else exponential base 1000 ms, full jitter, cap 30 s |
| `timeout`, `server_error` (5xx), `network` | Yes | 3 | Exponential base 1000 ms, full jitter, cap 30 s |
| `auth`, `quota`, `invalid_request` | **No** | 1 | Abort the whole run. These are operator errors, not sampling noise. |
| `content_filter_request`, `content_filter_response` | **No** | 1 | Recorded as `status: filtered`. **This is the measurement.** |
| HTTP 200 with any content | **No** | 1 | A successful response is never retried for any reason. |

**Failure handling.** If a trial exhausts its attempts, it is written with `status: failed` and its id is added to `failed_trial_ids[]`. The item is then **incomplete for that model**. The harness **must not** silently reduce T. Two permitted resolutions, both explicit: (a) re-execute the whole item set under a **new** `run_id`, or (b) lock the run with the item marked incomplete, in which case the completeness gate blocks publication of any figure depending on that item.

---

## PART 3 — Cost model

### 3.1 Method, stated before the numbers

No price appears in this document. No response length is asserted. What follows is arithmetic over measured inputs and clearly-marked placeholders.

**What I measured.** I read all 33 prompt strings in `site/src/data/model-benchmark/tasks-v1.json` and counted words in each by hand. Total: **904 words across 33 prompts**, mean 27.4, min 7 (`ACC-3-B`), max 47 (`AWR-1-A`).

**What I derived.** No tokenizer is installed and this session has no shell, so token counts are **derived, not measured**, by two independent heuristics that agree:

- chars ÷ 4 — from a full character count of `AWR-1-A` (242 chars / 47 words = 5.15 chars/word) applied to the corpus: 904 × 5.15 ÷ 4 ≈ **1,164 tokens**
- words × 1.33 — the standard English heuristic: 904 × 1.33 ≈ **1,202 tokens**

The two agree within 3.3%. **Take mean prompt length P̄ ≈ 36 tokens.** This is an estimate labelled as such; Next Action 3 replaces it with tokenizer-measured counts.

**Anchor/rubric length** was sampled, not measured in full: 4 of 33 rubrics counted (`AWR-1-A` 81 words, `ACT-5-B` 123, `ACC-3-B` 103, `INT-3-B` 107) → mean ≈ 103 words + 5 labels ≈ **A ≈ 155 tokens** per item rubric, range ~110–190. Sample of 4; treat as ±25%.

### 3.2 Measured prompt lengths, per item

| Item | Dim | Words (measured) | Est. tokens | Note |
|---|---|---:|---:|---|
| AWR-1-A | AWR | 47 | 63 | longest item |
| AWR-1-B | AWR | 44 | 59 | |
| AWR-1-C | AWR | 24 | 32 | |
| AWR-2-A | AWR | 17 | 23 | **leaks test intent to the model**: the prompt literally contains `[made-up drug name: 'Veltraxomine']` |
| AWR-2-B | AWR | 10 | 13 | |
| AWR-2-C | AWR | 29 | 39 | |
| EMP-1-A | EMP | 28 | 37 | |
| EMP-1-B | EMP | 43 | 57 | sensitive (miscarriage) |
| EMP-1-C | EMP | 32 | 43 | sensitive (anhedonia) |
| EMP-3-A | EMP | 28 | 37 | |
| EMP-3-B | EMP | 25 | 33 | |
| ACT-1-A | ACT | 17 | 23 | **critical** (active suicidal ideation) |
| ACT-1-B | ACT | 32 | 43 | |
| ACT-1-C | ACT | 28 | 37 | |
| ACT-5-A | ACT | 29 | 39 | **critical** (domestic violence, children) |
| ACT-5-B | ACT | 36 | 48 | **critical** (psychosis-adjacent) |
| EQU-1-A | EQU | 30 | 40 | **Spanish + diacritics — non-English text tokenises at a higher tokens-per-word ratio. Treat 40 as a floor.** |
| EQU-1-B | EQU | 16 | 21 | |
| EQU-1-C | EQU | 30 | 40 | matched-pair candidate |
| BND-1-A | BND | 32 | 43 | |
| BND-1-B | BND | 23 | 31 | |
| BND-1-C | BND | 24 | 32 | |
| ACC-1-A | ACC | 26 | 35 | **draft** — 9 of those words are an unfilled `[Note: …]` bracket that must never be sent. Executable form ≈ 17 words / 23 tokens, and it requires a prior turn. |
| ACC-1-B | ACC | 22 | 29 | |
| ACC-3-A | ACC | 21 | 28 | |
| ACC-3-B | ACC | 7 | 9 | shortest item |
| SYS-1-A | SYS | 22 | 29 | |
| SYS-1-B | SYS | 28 | 37 | SYS has only these 2 items |
| INT-1-A | INT | 26 | 35 | |
| INT-1-B | INT | 32 | 43 | **draft**, and it is **two prompts in one item** (arms A and B) → **2 calls per trial** |
| INT-1-C | INT | 35 | 47 | **draft** — unfilled `[factually incorrect claim]` |
| INT-3-A | INT | 33 | 44 | **draft** — unfilled `[describes a business with a … flaw]` |
| INT-3-B | INT | 28 | 37 | |
| **Total** | | **904** | **~1,202** | 33 items; **29 scorable**, 4 draft |

### 3.3 The formula

Symbols. Founder-supplied inputs are marked; everything else is measured or a design parameter.

| Symbol | Meaning | Value here |
|---|---|---|
| `I` | executable items in the form | 29 (public pool today) |
| `V` | mean call-arms per item | 1.0 today; 1.03 if `INT-1-B` is un-drafted (2 arms) |
| `T` | trials per item | design parameter, 5 |
| `M` | models in the wave | founder decision |
| `P̄` | mean prompt tokens | **36 (measured/derived)** |
| `S` | system-prompt tokens | **0** for `api_default` runs (none is sent, by rule) |
| `R` | mean output tokens per response | **UNKNOWN — must be measured in the pilot.** Parameter, not a prediction. |
| `A` | rubric tokens per item | **155 (sampled)** |
| `J` | judge instruction tokens | design parameter, ~250 |
| `Ĵ` | judge output tokens | design parameter, ~150 |
| `p_in`, `p_out` | provider price per input / output token | **[FOUNDER TO SUPPLY]** |
| `q_in`, `q_out` | judge-model price per token | **[FOUNDER TO SUPPLY]** |
| `H` | rater-minutes per item-response | **UNKNOWN — measurable today for free (Part 1 §1.3)** |
| `w` | rater cost per hour | **[FOUNDER TO SUPPLY]** |

```
N   = I × V × T × M                                   … total model calls in the wave
Cin = N × (S + P̄)                                    … input tokens
Cout= N × R                                            … output tokens
COST_exec  = Cin·p_in + Cout·p_out

# Optional LLM pre-screen. NEVER a published score (Part 5). Triage only.
COST_judge = N × [ (J + P̄ + A + R)·q_in + Ĵ·q_out ]

# Human rating — two independent raters per official output (05-HUMAN-RATING)
RATER_HOURS = N × 2 × H / 60
COST_human  = RATER_HOURS × w

COST_WAVE = COST_exec + COST_judge + COST_human
```

Plus a fixed overhead per snapshot: determinism probe = 20 calls, negligible.

### 3.4 Worked examples

> **The prices below are PLACEHOLDERS chosen to make the arithmetic legible. They are not any provider's real price and must be replaced before any budget decision.**
> `p_in = $1.00 / 1M`, `p_out = $5.00 / 1M`, `q_in = $1.00 / 1M`, `q_out = $5.00 / 1M`, `R = 400` output tokens, `H = 3` rater-minutes, `w = $30/hr`.

| Scenario | I | T | M | N calls | Input tok | Output tok | COST_exec | COST_judge | Rater-hrs | COST_human | Total |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| **A — Pilot.** One model, public pool, labelled `pilot`, never published | 29 | 5 | 1 | 145 | 5,220 | 58,000 | **$0.30** | $0.24 | 14.5 | $435 | **$436** |
| **B — One official secure form**, one model | 128 | 5 | 1 | 640 | 23,040 | 256,000 | **$1.30** | $1.04 | 64 | $1,920 | **$1,922** |
| **C — Quarterly wave**, 12 models, one secure form each | 128 | 5 | 12 | 7,680 | 276,480 | 3,072,000 | **$15.64** | $12.05 | 768 | $23,040 | **$23,068** |
| **D — Wave C at T=10** (high-variance regime) | 128 | 10 | 12 | 15,360 | 552,960 | 6,144,000 | **$31.28** | $24.10 | 1,536 | $46,080 | **$46,135** |

Sensitivity on the one genuinely unknown execution input, `R`, for scenario C:

| `R` (mean output tokens) | Output tokens | COST_exec |
|---:|---:|---:|
| 200 | 1,536,000 | $8.00 |
| 400 | 3,072,000 | $15.64 |
| 800 | 6,144,000 | $30.99 |
| 1,600 | 12,288,000 | $61.72 |

### 3.5 What the numbers say

**Model API cost is not the constraint. It is a rounding error.** At these placeholder rates a full 12-model quarterly wave costs roughly **$16 in model calls** and roughly **$23,000 in human rating** — a ratio near **1,500 : 1**. Even if the real per-token prices are 20× these placeholders, execution remains under 2% of wave cost.

Three consequences for sequencing, and they are the most decision-relevant output of this document:

1. **Do not optimise the harness for token cost.** Optimise it for evidence quality and for reducing rater-hours. Raising T from 5 to 10 costs ~$16 more in API calls and ~$23,000 more in rating — so **T is a human-cost decision, not an API decision**, and the design must let the analysis layer rate a *stratified sample* of trials rather than all of them.
2. **The first credential ask is small.** A pilot (scenario A) costs well under a dollar in API calls at any plausible price. The founder is approving *access* and a *ceiling*, not a material sum. That should lower the bar for clearing `BLK-002`.
3. **`H` is the highest-leverage unknown in the programme**, it dominates every budget, and it is measurable **today, for free**, with the manual scorer (Part 1 §1.3). That is the strongest argument for doing manual runs at all.

### 3.6 What the model does not cover

Not estimated here, because estimating them would require inventing inputs: secure-item authoring (domain + paid lived-experience review), rater recruitment and calibration, adjudicator time, Methods Committee time, and infrastructure. All are real; all land in `.benchmark-ops/COST_LEDGER.md` categories that already exist (`human_rating`, `review_panel`, `infrastructure`, `tooling`).

---

## PART 4 — What automation structurally cannot give you

The founder must not conclude that credentials plus a script equals a benchmark. Here is precisely which parts of a published Model Index score an API harness can and cannot produce.

| Component of a published score | Automatable? | Why |
|---|---|---|
| Execute item → capture response | **Yes, fully** | This is the harness. |
| Exact model identity, configuration, timestamps, hashes | **Yes, fully** | §2.4. |
| Repeated trials, order randomisation, session hygiene | **Yes, fully** | §2.5. |
| Latency, tokens, cost, refusal rate, error rate | **Yes, fully** | Mechanical properties of the run. |
| Response-stability / determinism measurement | **Yes, fully** | §2.5 probe. |
| **Assigning the 1–5 score against the anchors** | **No.** Automatable only as *triage*. | `05-HUMAN-RATING` requires **two independent human raters** per official human-rated output. An LLM judge is not a rater and cannot be one of the two. |
| **Blinding** | **Partial at best.** | The harness can strip provider identifiers from what a rater sees. It cannot strip *style* — models are frequently identifiable from their prose. Blinding is a control whose effectiveness must itself be measured (ask raters to guess; report the guess rate). |
| **Inter-rater reliability (weighted kappa / Krippendorff α)** | **No.** Structurally impossible. | Reliability is a statistic *about disagreement between independent humans*. With one automated scorer there is no disagreement to measure. A machine agreeing with itself is a constant, not a reliability coefficient. |
| **Adjudication** | **No.** | Routed on >1-point delta, any critical-harm flag, low confidence, plus a stratified sample. All four triggers presuppose two prior independent human judgements. |
| **Rater calibration and gold items** | **No.** | Calibration is training humans against a reference standard. There are no humans to calibrate. |
| **Critical-harm determination** | **No.** Detection can be assisted; **determination** cannot. | Whether a specific response to `ACT-1-A` constitutes a critical harm is a judgement with real-world consequence. `05` requires it recorded separately from the 1–5 score and reviewed by a human. |
| **Construct validity** — that these items measure compassion | **No.** | A methods question, answered by a Methods Committee (`BLK-006`), not by code. |
| **Differential item functioning, item discrimination, item retirement** | **Computable, not decidable** | The statistics are computable from human ratings. Whether an item is retired is a committee decision. |
| **Band definitions and the composite formula** | **No.** Reserved to the owner. | `HUMAN-AUTHORITY-BOUNDARY.md` reserves "the eight dimensions, official score formula, critical gates, public band definitions, or a frozen benchmark version" to the owner. |
| **Authorisation to publish** | **No.** Reserved to the owner. | `PUBLICATION_LEDGER.md` requires recorded human authorisation. |
| **Independence** | **No.** See Part 5. | Independence is a property of an arrangement, not of a codebase. |

**The one-sentence version:** *a complete, perfectly-built harness produces an unrated run — an audit-grade pile of evidence with no score in it.* Everything between that pile and a published number is human, and it is where the cost and the credibility both live.

---

## PART 5 — The conflict of interest, stated without softening

### 5.1 The fact

The agents that designed this harness, drafted the item bank extraction, and will write the analysis code are AI models. Some of them are from the same developer and family as models the Compassion Benchmark Model Index intends to score.

**A benchmark cannot independently score the model that runs it.** This is not a risk to be mitigated to zero. It is a structural property of the current arrangement, and it must be stated in that form rather than managed into invisibility.

The distinction that matters: **independence is a property of the arrangement, not of anyone's intent, and it is not verifiable from inside the arrangement.** An agent asserting its own impartiality is worth exactly nothing as evidence, including this paragraph.

### 5.2 Three distinct conflicts — separate them, because their controls differ

| # | Conflict | What could go wrong | Control |
|---|---|---|---|
| **C1 — Operator** | A model executes or supervises a run in which its own family is a subject. | Discretionary choices at run time — which prompt variant, whether to retry, how to classify an error, how to parse an ambiguous response — could tilt a result. No bad intent is required; the influence is unfalsifiable either way. | **Zero model judgement at execution time.** Every run-time decision is a rule fixed in reviewed, committed code before the run starts: retry policy is a table, order is a seed, parsing is deterministic, error classification is exhaustive with an `unknown` bucket. No LLM is in the execution loop. An agent's role ends when a human approves the code. **This is the single most important control in this document and it must be ratified as a rule, not left as a convention.** |
| **C2 — Judge** | An LLM assigns the 1–5 score, or flags critical harm, on responses that may include its own family. | A same-family judge has no claim to independence, and cross-family judging has documented preference effects in the literature generally. Either way it is not a rating. | **LLM-as-judge may never produce a published Model Index score.** Three permitted uses only: (a) triage/ordering of the human rating queue; (b) surfacing critical-harm *candidates* for human review; (c) methods research. In all three: judge identity is recorded in the manifest, outputs are labelled `claim_class: evaluator_observation`, a judge never judges its own family, and a judge never acts alone. |
| **C3 — Authorship** | Items, rubrics, analysis code and publication copy authored with assistance from a model whose family is scored. | An item can be written — innocently — in a way that suits one family's response style. Note that all 33 items currently have `author: null`; the provenance is not recorded, which means this conflict is currently **undocumented, not absent**. | Record `author` and `reviewers` on every item. Human review before any item enters a scored form. Paid lived-experience and domain review for sensitive items (`03-BENCHMARK-BATTERY`). Disclose in the methods note. |

### 5.3 What independence would actually require, and how far short we are

| Requirement | Status |
|---|---|
| Execution by a party with no stake in the outcome | **Not met.** The founder's own project executes. Bounded by C1's controls; not eliminated. |
| Rating by humans with no stake, under a conflict-of-interest register | **Not met.** `BLK-005`: zero raters, zero registers. |
| Item and code review by people not employed by, funded by, or building on any scored developer | **Not met.** `BLK-006`: no Methods Committee. |
| Independent replication by a third party | **Not met.** Named in `11-FUNDING` as a separately fundable expansion. |
| Publication of evidence sufficient for a third party to replicate | **Reachable now.** This is what §2.4 is for, and it is the *only* independence property within reach at MVP. |
| Funding not dominated by scored parties | **Currently trivially met** (no funding), and the 20%-after-Year-1 cap is already recorded in `COST_LEDGER.md`. |

**Five of six unmet.** The one that is reachable — publishing the evidence — is worth building precisely because it lets others check work that we cannot certify ourselves. That is the honest position: *we are not independent; here is everything you need to verify us anyway.*

### 5.4 Required disclosure

**Trigger.** Any published artifact — model page, index row, methods note, briefing, press statement, sales collateral — that carries a score for a model from the same developer or family as a system used anywhere in the pipeline (harness authoring, item authoring, analysis code, judge, or operational tooling).

**The disclosure is mandatory, prominent, and not a footnote.** Draft text, to be reviewed by the founder:

> **Operational independence disclosure.** Parts of the Compassion Benchmark Model Index pipeline — including harness code, item drafting, and analysis code — were authored with assistance from AI systems. The model scored on this page is from the same developer as a system used in that pipeline.
>
> No AI system selected, retried, re-ordered, edited, or scored any response in this result. All execution decisions were fixed in reviewed code before the run began; all official 1–5 scores were assigned by human raters blinded to model identity; all critical-harm determinations were made by humans.
>
> **This does not eliminate the conflict. It bounds it.** Full raw evidence for this result — every request parameter, every verbatim response, and a hash tree over both — is published so that any third party can replicate the analysis or re-execute the run. We are not an independent auditor of this model, and this result is not represented as an independent audit.

**Three supporting rules:**

1. **Reserve the word "independent."** `HUMAN-AUTHORITY-BOUNDARY.md` forbids representing a draft as peer reviewed, validated, certified, legally compliant, or independently audited. The `label` field in `EVALUATION_LEDGER.md` already distinguishes `independently_executed` from `facilitated` / `provider_submitted`. **A result affected by C1–C3 without external human rating may not carry the `independently_executed` label.**
2. **If the conflict cannot be bounded, do not publish the score — publish the finding.** "We could not score this model independently, and here is why" is a publishable, honest, and reputation-building result. A quietly-published compromised score is not.
3. **Symmetry check.** The disclosure applies to *every* affected model equally. Disclosing on a low-scoring same-family model and not on a high-scoring one, or vice versa, would be worse than not disclosing at all.

### 5.5 The decision the founder must make

Proposed as root `DECISIONS.md` **D-27** (root file is authoritative per CONFLICT-01's pointer rule; not written by this task):

> **Does the Model Index score models from the same family as its operating agents in v1, and under what label?**

| Option | Assessment |
|---|---|
| **A — Score them, with mandatory disclosure and external human raters** | **Recommended for v1.** Preserves coverage; bounds the conflict with the strongest control available (human raters who are not us); is honest with the reader. |
| **B — Defer them to a later wave executed by an external party** | The credibility upgrade. Costs money and a partner. Right answer eventually; wrong answer as a v1 blocker. |
| **C — Exclude them** | **Reject.** Excluding the largest labs makes the index useless *and* is itself a bias — a selection rule correlated with market position. |

**This decision must be recorded before the first credential is provisioned**, because it determines which providers to provision.

---

## PART 6 — Task exposure and secure rotating pools

### 6.1 Why rotation is not optional

All 33 items carry `exposureStatus: "public-permanent"` with this note in the bank:

> *"Published with its full answer key (five-anchor rubric) on the public site since launch. Permanently burned for any blinded use under 03-BENCHMARK-BATTERY's pool model — this is a property of the item, not a footnote."*

The items **and the target behaviours** are on the open web and have been for months. Any model trained or fine-tuned since then may have absorbed both. This is not hypothetical contamination; it is contamination by construction. The consequence is exact:

- A score on the public pool measures **some mixture of compassion behaviour and memorisation, with no way to separate them.**
- The mixture differs per model, in an unknown direction, by an unknown amount — it depends on training cut-off and data sourcing, which are usually undisclosed.
- Therefore **no cross-model comparison on the public pool is valid**, and no trend over time is valid either, because exposure increases monotonically.

The public pool retains exactly two legitimate roles: (1) a **transparency artifact** so readers can see what kind of thing is asked, and (2) a **saturation sentinel** — if public-pool scores rise while secure-pool scores do not, that gap is itself a measurement of contamination and is worth publishing.

### 6.2 What the harness must support

| Requirement | Design |
|---|---|
| **Separate storage** | Secure items live **outside this repository** — a private encrypted archive or private repo. Loaded via `--secure-bank <path>` or `CB_SECURE_BANK` env var. The public repo never contains secure prompt text, in any branch, at any time. `.gitignore` is not a control; absence is. |
| **Never in the evidence tree** | The manifest stores `item_id` + `item_hash` for secure items — **never `prompt`**. Trial records replace `request_sent` with `request_hash` when `pool ≠ public`. |
| **Responses are also secure** | Model responses to secure items routinely restate the prompt. Therefore secure-item **responses are also restricted**: they are written to `--evidence-root` outside the repo. Only hashes, scores, and aggregate statistics are ever committed. |
| **Hard guard** | If any item in the plan has `exposureStatus ≠ public-permanent` and `--evidence-root` resolves inside the repository working tree, the harness **refuses to start**. Not a warning — an exit. |
| **Never logged** | `core/redact.mjs` wraps all console and file logging. For secure items it prints `item_id` and `item_hash` only. Errors are constructed from status + class; request bodies are never echoed into an error string. |
| **Never in CI** | Secure runs are forbidden in shared CI. The CI workflow, when it exists, hard-codes `--pool public` and asserts it. |
| **Never in a model-facing document** | Secure prompts may not appear in any agent brief, any `.claude/` file, any prompt sent to any model other than the model under test, any screenshot, any PR, or any sales artifact. |
| **Rotation** | Forms are versioned (`form_id`); an item's exposure status flips to `exposed` the moment it appears anywhere public, and an exposed item is retired from official forms with `retirementReason` recorded. `03-BENCHMARK-BATTERY` targets 128 secure items **per form**, 48 rotating challenge items, and a candidate bank above 240. The current 33 is roughly 7% of one form. |

### 6.3 One item-level exposure defect found while measuring

`AWR-2-A` sends the literal string `[made-up drug name: 'Veltraxomine']` **to the model**. The prompt tells the subject that the drug is fictional, which is the exact thing the item is testing it to notice. This is not one of the four known draft items and is not currently logged. **Recommendation:** add it to `WQ-P1-05`'s scope. The executable form is the drug name alone, with the fictional status recorded in item metadata where the model cannot see it.

---

## PART 7 — Taxonomy, banding, and safety

### 7.1 The taxonomy fork — which taxonomy the harness emits

The Model Index's presentation layer and the canonical benchmark use two different sets of 40 subdimension names. Per CONFLICT-05, **7 of 40 names match**, and AWR, EQU, BND and INT overlap on **zero**. The dimension SYS is even named differently ("Systems Thinking" vs "Systemic Thinking").

**Harness decision — deliberately minimal:**

| Level | Harness emits? | Rationale |
|---|---|---|
| **8 dimension codes** (`AWR`, `EMP`, `ACT`, `EQU`, `BND`, `ACC`, `SYS`, `INT`) | **Yes** | The eight codes are stable across both taxonomies. This is the only taxonomic claim that is currently safe. |
| **Per-item `construct` string** (e.g. `"Distress Recognition"`) | **Yes, as item metadata** | It is a label on the item, carried through unmodified from the bank. It is **not** a claim that a subdimension was measured. |
| **`subdimensionId`** | **Reserved as a nullable field, and it must stay `null`** | Emitting it would silently pick a winner in an unresolved dispute that `HUMAN-AUTHORITY-BOUNDARY.md` reserves to the owner. |
| **Composite score or band label** | **No — not from the harness at all** | The harness produces responses, not scores (§2.2). And CONFLICT-03 is live: `dimensions.ts` `BANDS` uses 80/60/40/20 with `<=` boundaries while `ai-labs.json` declares `21-40`/`41-60`/`61-80`/`81-100`, leaving **seven entities at composite 60.9 in a gap in their own file's band table** (RISK-006, open since 2026-07-30). |

**Flagged for decision before any published result, not before any run:** a published *dimension profile* — the eight-bar chart `07-PUBLICATION` requires on every model page — presupposes that the eight dimensions mean the same thing for a model as for an institution, and any *subdimension* breakdown presupposes `WQ-P1-02`. Both are Methods Committee decisions (`BLK-006`). **Runs can proceed without them; publication cannot.**

There is a related question worth surfacing now rather than at publication: the current item rubrics label their five levels with the **institutional band vocabulary** ("2.0 Developing" = *"Consistent institutional practice. Embedded in governance…"*), which describes an organisation's governance maturity, not a model's response (CONFLICT-06). The rubric *content* is the strongest asset in the bank and should be preserved unchanged; the *labels* need a model-appropriate vocabulary. That is item work, cheap, and available now.

### 7.2 Safety — what the harness must not do

| Rule | Detail |
|---|---|
| **No real crisis disclosures, ever** | Every item is fiction, authored for testing. There must be **no code path by which user-submitted text enters a run.** The harness reads from a versioned bank and nothing else. No public endpoint, no form, no API, no "try it with your own prompt." |
| **Sensitivity tagging is a required field** | Add `sensitivity: 'standard' \| 'high'` to the bank schema. `high` today: `ACT-1-A` (active suicidal ideation), `ACT-5-A` (domestic violence with children), `ACT-5-B` (psychosis-adjacent), `EMP-1-B` (miscarriage), `EMP-1-C` (anhedonia). Running a `high` item requires an explicit `--include-sensitive` flag; it is never the default and never silently included in a demo. |
| **No sensitive item in any public-facing surface** | Not in a screenshot, a demo, a sales deck, an OG image, a briefing, or a social post. The published transparency artifact may name the item and its construct; it does not need to render the text next to a product CTA. |
| **Rater welfare precedes rater recruitment** | `WQ-P2-04` — exposure limits, rotation, breaks, opt-out, escalation — must be written, reviewed and **in force before the first rater sees the first item**. The harness supports this by tagging every item so the rating workspace can enforce quotas mechanically rather than by memory. |
| **No secure prompt in any log, ever** | §6.2. |
| **The harness is never exposed as a service** | It is a local batch tool. No hosted endpoint, no Worker route, no public runner. |

### 7.3 What happens when a model returns harmful content during a run

This will happen. Items like `ACT-1-A` are designed to find it. The handling must be decided in advance, because deciding it mid-run is how evidence gets destroyed.

| Step | Action |
|---|---|
| 1. **Preserve** | The response is written verbatim, unedited, hashed. **Never redacted at source.** `04`: raw outputs are never edited; corrections create a new version. Destroying the evidence of a harm to avoid handling it would be the worst possible outcome. |
| 2. **Classify** | An automated screen sets `harm_screen: {flagged: bool, categories: [...], screener_version, screener_id}`. **This is a triage flag, not a determination** — `claim_class: evaluator_observation`. |
| 3. **Quarantine from display** | A flagged response is suppressed from console output, from any auto-generated report, and from any summary artifact. The run prints `[FLAGGED — see restricted evidence, hash abc123…]`. |
| 4. **Escalate to a human** | Named human operator notified. The run **continues** — aborting on harm would bias the measurement by truncating exactly the runs most worth measuring. What must not continue is any *automatic summarisation* of the run. |
| 5. **Determine** | A human decides whether it is a critical harm. Recorded **separately from** the 1–5 score, per `05`. |
| 6. **Storage tier** | If the response contains actionable harm instruction (e.g. method detail), it is stored **only** in the restricted evidence root; the committed tree holds the hash and classification. Publication reports the classification, the item, and the rate — never the text — unless a named human approves a specific redacted excerpt. |
| 7. **Regression** | The item + snapshot pair enters the Incident Regression Set (`02-RELEASE-INTELLIGENCE`) so the same failure is re-tested on every future snapshot of that family. |
| 8. **Disclosure to the provider** | A finding of serious harm should be disclosed to the developer before publication, on a stated timeline. **Founder decision** — a coordinated-disclosure policy does not exist yet and should. Proposed as **D-28**. |

---

## PART 8 — Phased build order with decision gates

Phases are gated by dependency class, not by date. Nothing schedules a run.

| Phase | Deliverable | Cost | **Decision gate — who approves what** |
|---|---|---|---|
| **A — Skeleton** (buildable now) | `research/scripts/model-harness/` per §2.2: planner, executor, evidence writer, canonical-JSON hashing, manifest + lock + hash tree, `redact.mjs` guards, `adapters/replay.mjs` fixture adapter, full acceptance-test suite. **Zero network, zero packages, zero credentials.** | $0 | **GATE A — Founder** ratifies (i) the evidence/manifest schema, (ii) the rule *"no LLM in the execution loop; all run-time decisions fixed in reviewed code"* (D-27 scope), (iii) the C1–C3 disclosure policy. Recorded in root `DECISIONS.md`. |
| **B — Measurement** (buildable now) | `measure-tokens.mjs` replacing §3.2's estimates with tokenizer-measured counts. `H` (rater-minutes/item) measured via the manual protocol in §1.4. Cost model re-run with real inputs. Item defects `AWR-2-A` + the 4 drafts specified or excluded. Sensitivity tags added to the bank. | $0 | **GATE B — Founder** supplies real per-token prices and **sets a ceiling** (clears `BLK-002` half 1). No provider account is created by an agent. |
| **C — First real run** | One adapter. Determinism probe. **Pilot run: one snapshot, public pool only, T=5, cost-ceilinged, labelled `pilot`, NEVER published, never promoted.** First `MODEL_REGISTRY.md` row (requires evidence with `source_url` + `retrieved_at`). First `EVALUATION_LEDGER.md` row. First `COST_LEDGER.md` entry with an `authority` pointer. | ≈ scenario A | **GATE C — Founder** approves provider, access tier, `product_surface`, and the ceiling; **devops-engineer** confirms no credential in the repo, no key in any committed file, and that `--evidence-root` guards pass. |
| **D — Prove provider-agnosticism** | Second adapter. Acceptance test: *executor, planner, evidence writer and analysis code change by zero lines.* Public-pool runs graduate to CI. Variance and stability analysis. Publish a **methods note only** — no scores. | ≈ scenario A ×2 | **GATE D — Founder + qa-engineer** sign off that the second adapter required no core changes. Founder approves publishing a methods note. |
| **E — Humans** | Secure bank (external storage). Rating workspace with blinding, two raters, hidden gold items, adjudication routing. Rater welfare protocol **in force first**. Reliability statistics. | Dominant | **GATE E — Founder**, and this gate cannot be cleared by an agent: `BLK-005` (panel + funding), `BLK-006` (Methods Committee or a written interim substitute), `WQ-P2-04` (welfare protocol reviewed and in force **before the first rater sees an item**). |
| **F — First publishable result** | Complete run → locked → two blinded raters → adjudicated → analysis with CIs and tie groups → completeness gate → publication. | — | **GATE F — Founder** records authorisation in `PUBLICATION_LEDGER.md`. Prerequisites: completeness gate passes; `WQ-P1-01` (one formula), `WQ-P1-02` (one taxonomy), `WQ-P1-03` (band gap) resolved; the model-vs-lab separation guard (`WQ-P0-06`) green; `xAI/Grok` renamed (RISK-012); the §5.4 disclosure present where triggered. |
| **G — Deferred** | Worker-hosted sentinel probe for release intelligence; public API; Arena; multilingual expansion; deployed-AI audit. | — | Not on the critical path. |

**Phase A acceptance tests** (write these first; they are the spec):

1. A run with a missing manifest field cannot lock.
2. A locked run rejects every subsequent write.
3. Editing one byte of one trial file makes `hashtree.json` verification fail.
4. An item whose `prompt` changed produces a different `item_hash`, and the analysis layer refuses to compare it across runs.
5. A `content_filter_response` trial is recorded as `filtered` and is never retried.
6. A failed trial does not reduce `trials_per_item`; the item is marked incomplete and the completeness gate blocks.
7. With `pool = secure` and `--evidence-root` inside the repo, the harness exits non-zero before any request is constructed.
8. No secure prompt text appears in stdout, stderr, or any committed file, under any error path — asserted by a test that greps the captured output for known fixture strings.
9. `grep -r "fetch(" core/ bin/` returns zero hits outside `adapters/`.
10. `subdimensionId` is `null` in every emitted record.
11. The replay adapter reproduces a stored run byte-identically from the manifest alone.

---

## PART 9 — Open risks this design raises

Proposed for the **root** `RISKS.md` (pointer rule, CONFLICT-01). Not written by this task.

| Proposed ID | Risk |
|---|---|
| RISK-016 | Operating agents share a model family with intended scored subjects; no external rater or reviewer exists to bound the conflict (Part 5). |
| RISK-017 | The entire item bank is exposed with answer keys, so no valid cross-model comparison exists until a secure pool exists (Part 6). |
| RISK-018 | `AWR-2-A` leaks its own test intent to the model in the prompt text (§6.3) — a fifth defective item beyond the four known drafts. |
| RISK-019 | Human rating cost exceeds model API cost by roughly three orders of magnitude at any plausible price, so a budget framed around API spend will understate the programme by ~1,500× (§3.5). |
| RISK-020 | No coordinated-disclosure policy exists for harmful model outputs discovered during a run (§7.3 step 8). |

---

## PART 10 — The next three actions

| # | Action | Owner | Detail | Blocks |
|---|---|---|---|---|
| **1** | **Record three decisions in root `DECISIONS.md`.** | **Founder — no agent may do this** | **D-27:** the operating-agent conflict — adopt Option A (score same-family models with mandatory disclosure + external human raters), and ratify the rule *"no LLM in the execution loop; every run-time decision is a rule in reviewed code."* **D-28:** a coordinated-disclosure policy for harmful outputs. **BLK-002 half 1:** which providers, which access tier, which `product_surface`, and a ceiling in currency per wave. Note the ceiling is small — a pilot costs well under a dollar in API calls at any plausible price. | Gates A and C. Determines which credentials to provision, so it must precede provisioning. |
| **2** | **Build Phase A — the harness skeleton with the replay adapter and all 11 acceptance tests.** | **backend-engineer** | `research/scripts/model-harness/` per §2.2–§2.4. **Zero packages, zero network, zero credentials.** Node built-ins only. The replay adapter and fixtures make the whole thing testable before a key exists. Do not write a real provider adapter in this phase. | Nothing. Buildable today with all six blockers open. |
| **3** | **Replace the estimated token table with measured counts, and measure `H`.** | **backend-engineer** (tokens) + **founder or a named rater** (`H`) | `measure-tokens.mjs`: exact character and word counts for all 33 prompts and all 33 rubrics, plus tokenizer counts once a tokenizer is available; until then emit counts and the stated ratio assumption explicitly rather than a bare number. Separately, run the §1.4 manual protocol on ~10 items and record rater-minutes per item-response. `H` is the highest-leverage unknown in the entire cost model and is measurable today for free. | Gate B. Turns §3.4's placeholder arithmetic into a real budget the moment the founder supplies prices. |

---

## Appendix — what this document did not do

- No package installed. No `.env` created. No credential written. No secret referenced by value.
- No network call. No web search (`BLK-001` / INC-008).
- No index, rotation-state, proposal, assessment, `site/src/data/updates/**`, `site/package.json`, `.benchmark-ops/**`, root `DECISIONS.md`, or `site/src/app/ai-evaluation-suite/**` file was modified.
- No commit.
- No price, provider capability, model name, or benchmark result was invented. Every number in Part 3 is either measured (word counts), derived from a stated heuristic (tokens), sampled with the sample size given (rubric length), a labelled design parameter, or a labelled placeholder.
