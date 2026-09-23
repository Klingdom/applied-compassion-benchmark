# CB-MODEL — The autonomous operation model

**Date:** 2026-09-20
**Author:** system-architect
**Status:** DESIGN ONLY. No code, data, store, ledger, registry, index or workflow was created or modified. No commit, no push. No `git checkout`, `git restore`, `git stash`, `git reset` or `git clean` (INC-009). No network call, no model API call. One new file was written: this one.
**Companions:** `docs/CB_MODEL_FIRST_ASSESSMENT_PLAN_2026-09-20.md` (what a single run costs and requires) · `docs/MCP_SERVER_PLAN_2026-09-20.md` (`cb-probe` / `cb-ops`) · `docs/ARCHITECTURE_RELEASE_WATCH_AND_BYO.md` (the ratified release state machine) · `docs/MODEL_EVALUATION_HARNESS_DESIGN.md`
**Governs:** how the Model Index runs itself between founder decisions — and exactly where it must stop.

**Evidence rule (V8) applied throughout.** No "there is no X" appears below without the search that would have found an X and a positive control showing the search works. Where a fact is cited from another document rather than re-derived this session, it says so.

---

## 0. The question, restated honestly

The founder's ask is: *the benchmark detects new releases, evaluates them, scores them and keeps the index current without him driving each step.*

Four of those six verbs are automatable today or soon. Two are not, and the reason is not caution:

| Verb | Automatable? | Binding constraint |
|---|---|---|
| **detect** | Yes, today | Needs one human act first: register sources (F-07) |
| **triage** | Partly — annotate yes, promote no | The recognition rule has documented false positives (`ARCHITECTURE_RELEASE_WATCH_AND_BYO.md` §2.7A) |
| **execute** | Yes, once a ceiling exists in code | BLK-002; no live adapter exists (`bin/run.mjs` line 217 throws on any `--adapter` but `replay`) |
| **score** | **No.** Rating is the measurement, not a gate | Two independent blinded human raters (BLK-005; `/ai-models` says so in shipped copy) |
| **validate** | Yes | `validateRunCompleteness` already exists |
| **publish** | **No** | `AUTONOMY.md` §1b, §5 R5; D-29 needs a real amendment |

So the honest shape of the autonomous model is **a continuous loop with two human hinges**, not a pipeline with a human bolted on the end. The rest of this document specifies the loop, the hinges, and the levels the founder can choose between.

**The governing precedent is already in this repo.** `AGENT-ROUTING.md` §1: the nightly entity pipeline runs `overnight-scanner → overnight-assessor → overnight-digest → validation → **stop** → (founder approval) → score-updater`. It "does not run end to end. It stops at the digest." `score-updater` is *"human-triggered only — never runs automatically"* in its own spec. **CB-MODEL's loop must have the same shape**: everything up to a reviewable artifact is automatic; the artifact is where a human enters.

---

## 1. Where we actually are, verified this session

| Fact | How checked |
|---|---|
| **An unattended orchestrator exists in code and has never been used.** `scripts/nightly-pipeline.sh` header: *"End-to-end nightly orchestrator, designed for unattended execution via cron on the Hostinger VPS."* Eight stages, including `git push origin main` (stage 7) and `docker compose build` (stage 8). | Read in full (276 lines). |
| **Nothing in this repo has ever run unattended.** | `RISKS.md` RISK-016, with its own evidence: *"All 94 research commits carry the founder identity; 0 of 426 commits fall between 02:00 and 05:59; the VPS identity configured in `scripts/vps-bootstrap.sh:118-119` appears on no commit."* **Cited, not re-derived** — no `git log` was run this session. |
| **CI has no scheduled trigger.** `.github/workflows/deploy.yml` is the only workflow; its `on:` block is `push: branches: [main]` + `workflow_dispatch`. No `schedule:`. | Glob `.github/workflows/*` → exactly 1 file; read lines 1–16. **Positive control:** the same read *does* surface `workflow_dispatch`, so trigger keys in that block are visible to this method. |
| **No spend ceiling is enforced anywhere.** `ceiling_at_time` is a *required manifest field at lock* (`core/manifest.mjs` line 49) and is written as the literal `null` (`bin/run.mjs` line 350). `cost_estimate: 0`, `cost_actual: null` *"until billed — never faked"*. `COST_LEDGER.md`: **0 rows, ceiling none**. | Grep `ceiling\|spend\|COST_LEDGER` over `**/*.mjs` → 13 files; in the harness the only hits are the field name in the required list, the `null` assignment, and three test fixtures (one of which asserts lock *fails* when the field is omitted). **No comparison operator is applied to it anywhere.** **Positive control:** grep `MIN_TRIALS_PER_ITEM_FOR_VARIANCE` returns comparison sites at `evaluation-statistics.mjs` lines 183, 523 and 624 — so "a threshold constant that is actually compared" is findable by this method. `ceiling_at_time` has no such site. |
| **An abort mechanism already exists and is correct.** `core/executor.mjs` lines 92–95: `auth`, `quota`, `invalid_request` carry `abortRun: true`; remaining slots are recorded `status: "not_executed"` with the `abortReason`. Refusals and content-filter blocks are **never retried** (`retry-policy.mjs` lines 27–28). | Read `core/retry-policy.mjs`, `core/executor.mjs` lines 40–107. |
| **Detection can now read what it fetches**, and still never promotes. `release-watch-l1.mjs` parses RSS/Atom/JSON Feed/HTML-listing, annotates each candidate with a confidence, and writes `candidates[]` + `dropped_candidates[]` for a human. Its own header: *"It STILL NEVER writes a row to `releases-v1.json`."* | Read `release-watch-l1.mjs` header (lines 1–120); `ARCHITECTURE_RELEASE_WATCH_AND_BYO.md` §2.7A. |
| **Detection is blocked on one human act.** `release-sources-v1.json` holds 0 sources; a `--live` run today writes an honest `status: "not-run"`, `blocked_by: "no-sources-registered"`. 14 verified candidate sources are drafted and unratified (F-07). | `ARCHITECTURE_RELEASE_WATCH_AND_BYO.md` §2.7B; `CB_MODEL_FIRST_ASSESSMENT_PLAN_2026-09-20.md` §1 S1. |

### 1.1 A contradiction that blocks the cheapest scheduling option, both sides cited

`scripts/nightly-pipeline.sh` stage 7 is `git push origin main`, and stage 8 rebuilds the Docker image — so running that script on cron **is scheduling publication**.

`DECISIONS.md` **D-32** (2026-09-16, active) rejects exactly this: *"Alternatives rejected: unattended cron to `main` (briefing claims are not yet machine-checkable against sources — RISK-020, DC-04)… **Scheduled runs commit to a dated branch, never straight to `main`.**"* **D-31** independently requires work to land on a dated branch because *"pushing to `main` is what triggers the deploy workflow, so the founder controls deployment by merging."*

**The only unattended orchestrator in the repository violates the two decisions that govern unattended operation.** This is a three-line fix to stage 7, not a redesign — but until it is made, "turn on the cron" is not available. Flagged as **AMB-3**.

---

## 2. The loop as a state machine

### 2.1 States

A **subject** (one model snapshot) moves through these states. Each state is a fact about an artifact on disk, never a belief.

```
  unobserved
      │ A  daily L1 scan
      ▼
  candidate ──────────► dropped        (no date / no title / no link / already-seen / already-promoted)
      │ B  human confirms evidence
      ▼
  detected ───────────► out-of-scope   (product_scope != model-index)
      │ C  second source, or one primary provider source
      ▼
  confirmed
      │ D  ** HUMAN MERGE ** registry row
      ▼
  registered
      │ E  disposition set to queued
      ▼
  queued
      │ F  plan built (dry run, read-only)
      ▼
  planned
      │ G  ** SPEND ** run opened against a ceiling
      ▼
  executing ──────────► aborted        (quota / auth / invalid_request / CEILING) — evidence, never a result
      │ H  LOCK written last
      ▼
  locked
      │ I  two blinded human raters + adjudication
      ▼
  rated
      │ J  analysis program: composite + CI + α
      ▼
  analysed
      │ K  G1–G16 evaluated; result filed as a proposal
      ▼
  validated
      │ L  ** HUMAN ** authorisation recorded
      ▼
  published ──────────► stale | degraded | superseded-by-release   (automatic downgrade, §6)
```

States A→D are the ratified release state machine (`ARCHITECTURE_RELEASE_WATCH_AND_BYO.md` §2.5 T1–T7) and are reused unchanged. E→L are new and are specified here.

### 2.2 The transition table

**"Human IN"** means a named person performs an act that leaves an artifact. **"Notified"** means the transition is automatic and a human learns of it from the digest or a failure channel.

| # | Transition | Trigger | Proof artifact | Gate that blocks it | Human | Safe to automate? |
|---|---|---|---|---|---|---|
| **A** | unobserved → candidate | Daily `release-watch-l1.mjs --live` | `research/model-index/release-watch/<scan_id>.json` with `candidates[]`, `dropped_candidates[]`, `sources_reached`, `quorum` | `validate-model-releases.mjs` K16 (internal consistency); zero-sources check writes `not-run` | **Notified** | **Yes — first thing to schedule.** Deterministic, zero credential, zero spend, always writes a record |
| **B** | candidate → detected | A human reviews `candidates[]` and completes the 5-field evidence record | A `releases-v1.json` row, `confirmation_status: "confirmed"`, `detected_in_scan` resolving | K3, K9, K10, K12, K13; `archive_or_hash` must match `^sha256:[0-9a-f]{64}$` | **IN** | **No.** Looks safe; is not — see §2.3 |
| **C** | detected → confirmed | ≥2 evidence entries, or 1 with `publisher === developer` | `evidence[]` grown (append-only per element, INV-3) | T3 | **IN** | No |
| **D** | confirmed → registered | Human merge of a registry row | `registry-v1.json` entry; 17 frozen fields | `validate-model-registry` + `validateRegistryTransition`; **INV-1: nothing in the build, a workflow or a script may write this file** | **IN** | **Never** |
| **E** | registered → queued | Disposition set on the release row | `evaluation_disposition: "queued"` + `disposition_reason` + `disposition_ref` | K11 | **IN** (agent drafts) | No — see AMB-5 |
| **F** | queued → planned | `cb-ops.plan_run` | A plan artifact: item set, T, `item_hash` per item, estimated calls and tokens, estimated cost, ceiling remaining | Read-only; non-scorable items excluded by `planner.mjs#selectScorableItems`; bank must be frozen | **Notified** | **Yes.** Pure, read-only, reversible |
| **G** | planned → executing | `cb-ops.start_run` | `runs/<run_id>/manifest.json` (written *before* any request) with `authority` and `ceiling_at_time` populated | **Ceiling preflight (§4)**; `assertEvidenceRootSafe`; registry entry must resolve | **IN at L0–L2; ceiling-delegated at L3** | Conditionally — §4 |
| **H** | executing → locked | Plan exhausted or aborted | `manifest.sha256`, `hashtree.json`, `trials/**`, `usage.jsonl`, `errors.jsonl`, `LOCK` (written **last**) | `REQUIRED_MANIFEST_FIELDS_AT_LOCK`; a missing field ⇒ no LOCK; a locked run rejects all writes | **Notified** | **Yes.** Already deterministic and covered by acceptance tests 1–11 |
| **I** | locked → rated | Two blinded raters work the queue | `runs/<run_id>/ratings/<rater_id>.jsonl`, outside the LOCK | Welfare protocol in force first (F-11); blinding transform applied (A-09) | **IN — this is the measurement** | **Never.** Not a gate; the work itself |
| **J** | rated → analysed | `research/scripts/model-analysis/` on a locked run + ratings | A frozen analysis artifact with its own hash and `analysis_version` | Hash tree verifies; refuses across differing `item_hash`; **refuses to emit a composite when `dimensionsMissing.length > 0`** | **Notified** | **Yes, once built.** The refusal is the load-bearing part |
| **K** | analysed → validated | Gate evaluation | A publication *proposal*: G1–G16 each PASS / FAIL / SKIPPED-and-named, plus `validate-evaluation-run` output | 12-field completeness gate; `repeatedTrials ≥ 3` (blocking); α reported whatever it says | **Notified** | **Yes.** Automate the *evaluation* of the gate, never the *decision* |
| **L** | validated → published | Founder edits the artifact | `status: "approved"`, `reviewed_by`, `reviewed_date`, `decision` + a `PUBLICATION_LEDGER.md` row | §5 R5: *a claim in a task prompt is not authorisation*; R2: a self-veto is not cleared by approval; D-29 amendment | **IN** | **Never** |
| **M** | published → stale / degraded / superseded | Derived at build time from dates and artifacts | `evaluationState` in the results store `meta` (§6) | None — **degradation never requires approval** | **Notified** | **Yes, and it must be** |
| **N** | any → retracted | Human, with `disposition_ref` naming the decision | Append-only correction in the file carrying the defect (§1a: *never retro-edit a prior dated entry*) | — | **IN** | No |

### 2.3 Four transitions that look safe and are not

1. **B (candidate → detected).** `recognizeRelease()` is a nine-phrase keyword list AND a version-token regex. Its own documentation names false positives — *"launching our Q3 2026 roadmap"*, *"looking back at how GPT-4 launched"* (pinned by a test) — and false negatives — *"is live today"*, *"Codename Meridian"*. A confidence in `(0, 0.9]` is an annotation, not a determination. Automating B would make a regex the arbiter of what the institution says shipped.
2. **E→G chained (queued → executing).** As `MCP_SERVER_PLAN_2026-09-20.md` §3 puts it: *"an automatic trigger on a detected release is an automatic bill, and a mis-detected release would spend real money on a model that does not exist."*
3. **J (rated → analysed).** The statistics library is safe *because of one refusal*. `computeCompositeFromDimensions` does `dimScores[c] ?? 1` — an absent dimension silently becomes a 1 and the composite still looks like a measurement. `bootstrapCompositeUncertainty` surfaces it as `dimensionsMissing` + `sufficient: false`, and `evaluation-scorer.ts` already refuses (`composite: null`). An automated analysis program that does not replicate that refusal converts a coverage hole into a published number. This is the most dangerous silent path in the scoring code.
4. **K (gate evaluation).** Every row of G1–G16 is mechanically checkable *or is a named human act*. Because the table is mechanical, automating publication looks like a small extra step. It is not: G6 (two blinded raters), G8 (human critical-harm determination), G12 (the label), G13 (authorisation) and G16 (the D-29 amendment) are the human acts the mechanical rows exist to verify, not to replace.

### 2.4 What is genuinely safe

A, F, H, J (with the refusal), K (evaluation only), M, dedupe, candidate annotation, ledger appends from executed work, and the digest line. All are deterministic, leave an artifact, and are reversible. None asserts a fact about the world that was not already in a file.

---

## 3. Idempotency, replay and the four bad days

Every pattern below already exists in this repository. None is invented here.

### 3.1 The same release is detected twice

Three independent mechanisms, all already implemented (`ARCHITECTURE_RELEASE_WATCH_AND_BYO.md` §2.7A):

- **Per-source dedupe.** `research/model-index/release-watch/state/source-state.json` holds `seenKeys` (the item's link, or a `source+title+date` composite when there is no link). A repeat drops with reason `already-seen`. Drops are deduped too, so a noisy source is not re-triaged daily.
- **Already-promoted filter.** `filterAlreadyPromoted()` reads `releases-v1.json` evidence `source_url`s read-only and drops matches with reason `already-promoted`, so a candidate that already cleared T3/T4 is never re-offered.
- **Deterministic id.** `release_id = slugify(developer)--slugify(family)--slugify(snapshot_key)`, the same derivation as `registry_id`. Two rows colliding on `release_id` means they genuinely share developer + family + snapshot key, which the registry already treats as a blocking duplicate.

**The residual case, named:** a *family_only* release and a later *exact* release of the same model produce different ids by construction. The join is `id_resolution` (K5), and it is a human act. There is no automatic merge, and there must not be — the entity index has 13 pending proposals on exactly this defect class (`AUTONOMY.md` §3).

### 3.2 A run dies halfway

- **Write-before, write-after** is the established pattern. The scan writes `status: "started"` with its plan before doing any work and finalises afterwards; a scan killed mid-flight leaves a `started` record *the validator reports as unfinalised* (§2.6). The harness does the same: `openRun` writes the manifest before the first request; `LOCK` is written **last**, so a crash mid-lock never leaves a LOCK over a partial manifest (`core/manifest.mjs` lines 119–120).
- **Incremental writes are mandatory** — `AUTONOMY.md` R11, from INC-004: of two concurrent runs hitting the same API 529, the one that wrote each artifact as it was produced survived 7 of 7; the one that batched writes to the end lost everything and left nothing to inspect. `persistAttempt` is called per attempt, not per run. **Never hold results in context to write at the end.**
- **A crashed run is not resumed.** `openRun` throws if the directory is already locked; an *unlocked* partial directory has no completeness guarantee. Rule: **an unlocked run directory is never analysable and is never resumed into the same `run_id`.** It is marked and retained as evidence — the precedent is `research/scans/superseded/**`, where INC-006's failed scan was quarantined under `*.failed-validation.json` rather than deleted, and the incident's own conclusion is *"this is the gate working as designed."* A replacement run gets a fresh `run_id`.
- **Replayability, not reproducibility.** The harness claims only that stored responses can be re-analysed byte-identically forever. Whether re-execution reproduces them is what the determinism probe measures, per snapshot, per date.

### 3.3 A provider rate-limits

Already specified as a versioned table (`core/retry-policy.mjs`, `RETRY_POLICY_VERSION: "phase-a-v1"`, copied verbatim into the manifest):

| Class | Retryable | Max attempts | Aborts run |
|---|---|---|---|
| `rate_limit` | yes (honours Retry-After) | 4 | no |
| `timeout`, `server_error`, `network` | yes | 3 | no |
| `auth`, `quota`, `invalid_request` | **no** | 1 | **yes** |
| `content_filter_request`, `content_filter_response` | **no** | 1 | no |
| `unknown` | no | 1 | no |

Backoff is exponential with full jitter, capped at 30 s, drawn from a *different* seeded stream than the planner's ordering RNG — so "how trials are ordered" and "how long a retry waits" stay independent reproducible concerns.

**The invariant that must never be relaxed:** a refusal or a content-filter block is **data, never retried**. Retrying until the model complies silently destroys the refusal-rate measurement, which is one of the things being measured. Any future "raise the completion rate" retry is a methodology change and therefore §1b.

**An aborted run is evidence, never a result.** After `abortRun`, every remaining slot is persisted as `status: "not_executed"` with the abort reason, `trial_count_persisted < trial_count_expected`, and the run cannot pass the completeness gate. It still locks, still hashes, and still gets a ledger row.

### 3.4 A scan reports a model that does not exist

This is the highest-consequence failure in the loop, and the repository already has the doctrine for it.

- **The evidence bar stops it at the door.** A release row needs `evidence[]` with all five registry fields including `archive_or_hash` format-validated as `sha256:<64 hex>` — *"which cannot be produced from memory without an overt lie"* (§C6) — and a `detected_in_scan` resolving to a real scan record. Fabricating a release requires also fabricating a scan record with a coverage window and a source list.
- **The registry bar stops it again.** `claim_class: "inference"` may never be the identity of record for a published score (invariants 4–5).
- **`AUTONOMY.md` §3 R4 is decisive:** *"Approval cannot make a score for a non-existent entity correct… If the row does not name one real, currently-operating, singly-published entity, no composite for that row can be true."* The remedy sequence is verify independently (two checks minimum) → **do not score** → escalate for disposition → execute the disposition separately → only then assess. §1c lists "publish a score for an entity that does not exist" as something no approval makes correct.
- **The cheap mechanical backstop.** If a non-existent model string reaches an adapter, the provider returns `invalid_request`, which is `abortRun: true` and unretried. Cost: one call. That is the *good* outcome. The bad outcome is a provider silently routing an unrecognised alias to a nearest model — which no code here can detect, and which is why D (registry merge) is a human act and not a lookup.

---

## 4. Cost control as a mechanism

### 4.1 What exists and what does not

The **slot** exists: `ceiling_at_time` is required at lock and a test asserts the lock *fails* when it is omitted (`acceptance.test.mjs` lines 294–306). The **mechanism** does not: the field is written as `null` and nothing compares it to anything (§1, with its positive control). `COST_LEDGER.md` has 0 rows and no ceiling.

`00-MASTER-CONDUCTOR` grants autonomy to run jobs *"within approved budgets"*. BLK-002's own note is the precise reading: **"The grant is real but currently empty."** The mechanism below is what makes that grant non-empty — and it is what makes autonomy level L3 possible at all.

### 4.2 The ceiling file — the authority, machine-readable

```jsonc
// .benchmark-ops/spend-ceiling.json   — FOUNDER-WRITTEN (§1b). Agents read it; agents never write it.
{
  "authority": "D-XX",                  // the decision that set it. Required.
  "set_by": "founder",
  "effective_from": "YYYY-MM-DD",
  "effective_until": "YYYY-MM-DD",      // a ceiling with no expiry is a standing authorisation
  "currency": "USD",
  "per_run_ceiling": 0,                 // FOUNDER INPUT
  "per_period_ceiling": 0,              // FOUNDER INPUT
  "period": "calendar-month",
  "soft_threshold_pct": 80,
  "rater_hours_ceiling": 0,             // FOUNDER INPUT — see §4.6
  "prices": {                           // FOUNDER INPUT. No price is a fact this repository holds.
    "<provider>": { "p_in_per_1m": null, "p_out_per_1m": null, "quoted_on": null, "source_url": null }
  },
  "estimator_version": "v1"
}
```

Two properties matter. It is **data, not prose**, so a script can enforce it — unlike `COST_LEDGER.md`, which is Markdown (AMB-4). And it carries `authority`, which becomes the manifest's `authority` pointer and the ledger's `authority` field: *"An entry without an authority is an unauthorised commitment."*

### 4.3 Three enforcement points

**1. Preflight — before `openRun`, before any request is constructed.**

```
estimate = (planned_input_tokens / 1e6) * p_in  +  (planned_calls * R_hat / 1e6) * p_out
headroom = min(per_run_ceiling, per_period_ceiling - period_spend_to_date)
if (estimate > headroom) -> refuse to open the run; write a preflight artifact; exit non-zero
```

`R_hat` is the mean output tokens. It is the only genuinely unknown input in the cost model and Pilot B exists to measure it. Until it is measured, `R_hat` comes from the ceiling file as a declared assumption and the estimate carries `r_hat_source: "assumed"` — never a bare number. `estimator_version` is recorded in the manifest so a wrong estimate is diagnosable rather than mysterious.

This is the same shape as the guard the harness already runs first: `assertEvidenceRootSafe` is checked *"before reading the bank, registry, or fixtures… nothing has been read off disk yet except argv itself"* (`bin/run.mjs` lines 211–215). The ceiling preflight belongs immediately beside it.

**2. Mid-run meter — after every persisted attempt.**

The meter sums `usage.jsonl` (`usage_source: "provider"` where the adapter reports it) and converts at the ceiling file's prices.

- At `soft_threshold_pct` → log a `ceiling_soft` event, notify, **continue**.
- At 100% → **finish the in-flight trial, then abort the remainder.**

**Finish the in-flight trial, do not kill the request.** The tokens are already committed the moment the request is sent; discarding the response destroys evidence for money already spent. This is the one place where "stop immediately" is the wrong instinct.

The abort reuses the existing executor semantics (remaining slots → `status: "not_executed"` with an `abortReason`) but with a **distinct reason string**, not the `quota` class. `quota` means *the provider* refused; a ceiling stop means *we* refused. Collapsing them would make our own budget discipline indistinguishable from a provider outage in the record.

**3. Lock-time — the record.**

`ceiling_at_time` stops being `null`. The locked manifest carries `ceiling_at_time`, `cost_estimate`, `estimator_version`, `usage_source`, `tokens_in_total`, `tokens_out_total`, and `cost_actual: null` — still never faked.

### 4.4 A partially spent run must not be invisible

A run that aborted at 60% spent 60% of the money. Today nothing would record it, because `COST_LEDGER.md` is specified to record *"unit_cost as billed, not as estimated"* and the bill arrives weeks later. **A ledger that only accepts billed amounts records nothing for weeks, which is exactly how money becomes invisible.**

Resolution — a two-phase row:

| Phase | When | Fields |
|---|---|---|
| **Accrual** | At lock, automatically, from executed work only | `entry_id`, `date`, `category: "model_api"`, `run_id`, `registry_id`, `provider`, `units` (tokens from `usage.jsonl`), `estimated_amount`, `authority`, `ceiling_at_time`, `cumulative_against_ceiling`, `reconciled: false`, `amount: null` |
| **Reconciliation** | When the invoice arrives, by a human | `amount`, `unit_cost` as billed, `reconciled: true`, plus the variance against `estimated_amount` |

The period meter counts **accruals**, not reconciled amounts — otherwise the ceiling is enforced against a number that is always weeks stale. The founder must ratify that consequence explicitly: **a period ceiling enforced against estimates can be wrong in either direction, and the variance column is where that becomes visible** (AMB-6).

`amount: null` on an unreconciled row is the same discipline as `cost_actual: null` and `composite: null` — the repository already refuses to write a number it does not have.

### 4.5 What a hit ceiling must never do

- Never silently reduce T, drop items, or switch to a cheaper snapshot. Any of those changes the instrument mid-measurement.
- Never resume into the same `run_id`. The LOCK is final; the replacement is a new run.
- Never promote the partial run. `EVALUATION_LEDGER.md` invariant 5: a `pilot` run is never promoted; a publishable result requires a fresh, complete run. A ceiling-aborted run inherits that rule.

### 4.6 Money is not the binding ceiling

`CB_MODEL_FIRST_ASSESSMENT_PLAN_2026-09-20.md` §3.3: human rating exceeds model API cost by roughly **three orders of magnitude**; the whole first assessment is 10⁴–10⁵ tokens, while rating its 140 responses twice is 9–23 rater-hours. A ceiling framed around API spend understates the programme by ~1,500× (RISK-019 as filed in that document).

Therefore the ceiling file carries `rater_hours_ceiling`, and **the queue is capacity-bounded**: `cb-ops` must refuse to queue more rating units than the remaining rater-hour ceiling. Without this, automated detection generates a rating backlog the institution cannot clear, and the pressure to clear it is pressure to drop the second rater — which is automation quietly buying the one thing BLK-005 exists to prevent.

A third non-monetary ceiling already bit us: the session WebSearch cap (INC-008, 2000/2000, three scans lost). D-32's remedy — *"a search-budget preflight"* — is the same mechanism in a different currency. All three ceilings preflight the same way.

---

## 5. Scheduling: what actually invokes this

### 5.1 The four options, with what each costs in trust and secrets

| | **A. cron on the VPS** | **B. GitHub Actions `schedule:`** | **C. Queue + human drain** | **D. Worker cron** |
|---|---|---|---|---|
| Exists? | **Script exists** (`scripts/nightly-pipeline.sh`), never run unattended (RISK-016) | Workflow file exists, no `schedule:` trigger | `cb-ops` designed, not built (`MCP_SERVER_PLAN` §3, P6) | Worker exists, wrong plane |
| Secrets needed | `ANTHROPIC_API_KEY` in crontab/`~/.bashrc` (script lines 34, 113–115) + an SSH push key + Docker | Provider key in Actions secrets | **None beyond what the founder already holds in his own shell** | Would need a key in CF |
| Trust cost | A standing long-lived credential on an internet-facing host that also serves the public site and an unauthenticated Umami login (RISK-022) | A **standing exfiltration surface**: `CB_MODEL_FIRST_ASSESSMENT_PLAN` F-04 says *"never in GitHub Actions secrets for run 1 (design §2.1 — CI adds a standing exfiltration surface and does not dodge the blocker)"*. A workflow that can push to `main` can publish | The credential never leaves the operator's environment; `cb-ops` *"holds no credential itself — it inherits your environment"* | `worker/src/index.ts` declares it has **no write path to the research plane**; routing research work through it demolishes that isolation (`ARCHITECTURE_RELEASE_WATCH_AND_BYO.md` §4.2 reason 3) |
| Blocking defect today | Stage 7 pushes to `main` — forbidden by D-31/D-32 (§1.1) | No `schedule:` trigger; and D-32's rejection of unattended-to-`main` applies identically | Cadence still depends on a person | **Rejected outright** |
| Verdict | **Use for detection only**, after the branch fix | Defer until a result exists and the key question is settled | **Use for evaluation** | No |

### 5.2 The recommendation

**Split the scheduler by whether the step spends money or publishes.**

- **Detection (transition A) → scheduled, option A.** Zero credential, zero spend, always writes an honest record, already gated. This is the single highest-value thing the founder can turn on, and it costs nothing.
- **Execution, rating, publication (G, I, L) → pulled by a human, option C.** As `MCP_SERVER_PLAN_2026-09-20.md` §3 states the flow: `release-watch (daily, L1) → candidate → YOU promote it → cb-ops queue → YOU approve ceiling → run`.

### 5.3 What unattended operation actually requires — the checklist

Nothing should be scheduled until all seven hold. Each traces to a file, not to caution.

1. **A branch target that is not `main`.** D-31, D-32. `nightly-pipeline.sh` stage 7 must push to `release/<date>` or `improve/<date>-<item>`. Until then, scheduling it schedules publication.
2. **A single scheduler owner and a lock.** `AUTONOMY.md` R10: *"There is no transaction, no merge and no conflict detection anywhere in this pipeline… a concurrent write loses one side entirely and the validator will not necessarily catch it, because both versions are internally consistent."* The in-repo pattern to copy is `deploy.yml`'s `concurrency: { group: production-deploy, cancel-in-progress: false }`. Two schedulers writing the same tree is the cheapest undetectable corruption available.
3. **A mandatory failure channel.** `NIGHTLY_WEBHOOK_URL` is optional in the script (line 35; `notify()` silently no-ops when unset). **An unattended pipeline with an optional notifier is unattended and unobserved.** For scheduled mode it must be required at preflight, alongside the existing `require claude / node / git / docker` checks.
4. **A budget preflight per resource** — searches (D-32, INC-008), money (§4), rater-hours (§4.6). Each refuses to start rather than aborting midway.
5. **A credential custody decision** (BLK-002 / F-04): which host, which key, what rotation. *I did not search for a key-rotation mechanism; treat its presence or absence as unverified rather than as a claim.*
6. **A status artifact every run, success or failure.** Already the pattern in both schedulers-in-waiting: `nightly-pipeline.sh` writes `research/logs/last-run-status.txt` on both paths, and `release-watch-l1.mjs` guarantees one of `not-run` / `aborted` / `completed` and *"never exits without producing a scan record"*. Generalise: **a run that produced no record is indistinguishable from a run that never happened.**
7. **Machine-checkable output, or no push.** RISK-020: on 2026-09-14 four factual errors reached a public briefing and passed both `lint-daily-briefings` and `validate-daily-briefings`, caught only by human review. This is D-32's stated reason for rejecting unattended cron to `main`, and it applies to any auto-generated model-result prose with equal force.

---

## 6. Failure and degradation — what the system publishes when it is broken

**The institution's worst failure mode is a stale claim presented as current.** INC-002 is the proof: production served stale scores for three days across six pushes with every health check green, because a static export baked into a Docker image restarts happily and serves stale data.

`releases-v1.json` already answers this for *detection* with `scanState` and `coverageClaim` as derived data, never authored copy. The same treatment must extend to *evaluation*.

### 6.1 Two derived fields on the results store

```
evaluationState  ∈ never-evaluated | current | stale | degraded | superseded-by-release
resultClaim      ∈ none | pilot | provisional | facilitated | independently_executed
```

Derivation, computed at build time and never hand-written (mirroring the `scanState` derivation exactly):

| Value | Condition |
|---|---|
| `never-evaluated` | No locked run names this `registry_id`. **This is every model today.** |
| `degraded` | Newest run `aborted`; or the completeness gate fails; or `bootstrapCompositeUncertainty.sufficient === false`; or `dimensionsMissing.length > 0`; or α is below the floor set in F-06 |
| `superseded-by-release` | A confirmed release row carries `predecessor_release_id` pointing at this subject's release |
| `stale` | `now − test_date > staleAfterDays` |
| `current` | otherwise |

**`superseded-by-release` has no analogue in the institution index and is the model-specific stale-claim failure.** A provider can replace a snapshot behind an unchanged API name; the release-watch enum already has the word for it (`silent_snapshot`). A published model score with no supersession check is a claim about a thing that may no longer exist at that address.

`resultClaim` encodes the label rules already ratified: a `pilot` run is never promoted (`EVALUATION_LEDGER.md` invariant 5); `independently_executed` is reserved and unavailable to a run affected by C1–C3 without external human rating (design §5.4 rule 1).

### 6.2 Asymmetric gating — the rule that makes degradation safe

> **A claim may be downgraded automatically and immediately, by any component, with no approval. A claim may only be upgraded by the gate that earns it.**

This is the honest asymmetry, and it has a precedent with a stated reason. K18 (staleness) is a **WARN that never fails the build**, because detection is blocked on a founder-owned configuration and *"if `scanState: stale` were blocking, every deploy of every unrelated page would be blocked by a condition no engineer can clear. That is how a guard gets disabled permanently."* Meanwhile K12/K16 (store-vs-scan contradictions) are **FAIL**, because those are integrity defects an engineer can fix immediately.

Applied here: **a claim downgrade never blocks a build; a data contradiction always does.** Staleness becomes publicly embarrassing rather than privately blocking, which is both the honest treatment and the one more likely to get fixed.

### 6.3 What is published in each broken state

| Broken state | What ships |
|---|---|
| Run aborted (quota / ceiling / auth) | The abort as a dated fact. No number. `evaluationState: degraded` |
| Provider outage during a run | **Never a low score.** Every mean in `evaluation-statistics.mjs` filters `status === "completed"` first; outages land only in `computeFailureRates` as their own categories |
| A dimension has no completed scored trials | `composite: null` + "Composite unavailable", the existing tested behaviour of `evaluation-scorer.ts` and D-30 |
| Rating incomplete | `resultClaim` stays where it was. No partial composite, ever |
| α below the F-06 floor | The score **and** the α, together. *"Reliability is reported whatever it says"* (G7); weak reliability is never concealed |
| Detection not run | The existing literal line: *"Release watch: 0 sources registered — detection did not run today."* Silence reads as "no releases" rather than "not monitored" |

### 6.4 The freshness assertion must cover the new artifacts

Carried forward and still open: the deploy workflow's only real staleness assertion compares `updates/manifest.json`'s `.latest` against the live feed. **A commit that changes only a model result changes no briefing date, so the assertion compares an unchanged value, passes, and cannot detect a cached-layer stale deploy.** Extend it to a content hash over the results store plus `evaluationState`, exported to a small generated file under `site/public/data/`. Without this, the first result-only deploy reproduces INC-002 exactly.

---

## 7. The human gates that must survive — each justified from a file

Not one of these is here because automation is frightening. Each is here because a specific document forbids the alternative.

### G-I. Promotion of a detected release into a registered subject (transitions B, C, D)

**Authority.** `ARCHITECTURE_RELEASE_WATCH_AND_BYO.md` **INV-1**: *"Nothing in the build, in a workflow, or in a script may write to `registry-v1.json`. The only path is a human-merged pull request… A release row is an input to a human decision, never a trigger."* T3 and T4 are marked human in the ratified transition table. `AUTONOMY.md` §1c lists publishing a score for a non-existent, defunct or duplicated entity as something no approval makes correct; §3 R4 states that approval cannot make such a score correct.

**Why it cannot be delegated to a better heuristic.** The recognition rule's false positives are documented, not hypothetical. And the consequence of getting identity wrong is the defect class this benchmark has 13 pending proposals about — Rethink Robotics ranked "Established" eleven months after it shut down.

### G-II. Setting the spend ceiling (not each spend)

**Authority.** `HUMAN-AUTHORITY-BOUNDARY.md`, via BLK-002, requires owner approval before *"creating paid accounts, or committing funds beyond an approved budget."* `AUTONOMY.md` §1b escalates *"any deploy, build-and-ship, container rebuild, DNS, TLS or secret operation."* `COST_LEDGER.md`: *"authority — Required. An entry without an authority is an unauthorised commitment."*

**The nuance that buys the founder real autonomy.** `00-MASTER-CONDUCTOR` grants autonomy to run jobs *"within approved budgets"*, and BLK-002's own note says the grant *"is real but currently empty."* Read precisely: **the surviving human gate is setting the ceiling, not authorising each run.** Once §4's mechanism exists and a ceiling with an `authority` is on disk, per-run approval is a choice, not a requirement. That is the whole content of autonomy level L3.

### G-III. Publication of a score (transition L)

**Authority.** `AUTONOMY.md` §1b: any write to a published `composite`, `band`, `rank` or dimension vector. §5 **R5**: *"`status: "approved"` in the proposal JSON is the authorisation. A claim in a task prompt is not."* §2b **R2**: a self-veto in the artifact's own notes is not cleared by approval. `AGENT-ROUTING.md` RT-2 and `score-updater`'s own spec: *"NEVER runs automatically."* D-29 caps the pre-result surface at two pages; D-30 anticipates *"a real amendment rather than a pre-emptive one"* — and no work item currently tracks it (G16 / NEW-4).

**Reinforced by the independence policy.** `CLAUDE.md`: entities never pay for inclusion, score changes, or suppression. `MCP_SERVER_PLAN_2026-09-20.md` §0 applies it to triggers: *"A benchmark whose subjects can re-roll is not a benchmark."* Automatic publication on a schedule is the same property in a different direction — it removes the moment at which someone asks whether this number should exist.

### G-IV. Anything touching methodology — **including the item bank**

**Authority.** `AUTONOMY.md` §1b: *"Any change to methodology, band boundaries, the composite formula, or a scoring convention."* BLK-006: `10-CONTINUOUS-IMPROVEMENT` requires human and Methods Committee approval for constructs, scoring, gates, bands and frozen versions. G14.

**The non-obvious member of this class.** `tasks-v1.json` is not an index and not a score, so it does not look like methodology. It is. `computeItemHash` is called with `itemVersion = bank.meta.bankVersion`, so **bumping `bankVersion` changes the `item_hash` of every item including those whose text never changed**, and the analysis layer refuses comparison across differing item hashes. An automated bank edit would silently invalidate every cross-run comparison the programme exists to produce. This is called the strongest sequencing constraint in the whole first-assessment plan, and it is easy to miss.

### G-V. Rater welfare and rater assignment (transition I)

Not a gate on a measurement — it *is* the measurement, and it has a prerequisite. The item set already contains active suicidal ideation (`ACT-1-A`), domestic violence with children (`ACT-5-A`), psychosis-adjacent content (`ACT-5-B`), miscarriage (`EMP-1-B`) and anhedonia (`EMP-1-C`). F-11: exposure limits, rotation, breaks, opt-out and escalation must be **in force before any rater sees an item**. BLK-005: *"Recruiting raters before these protocols exist would be the wrong order."*

---

## 8. The autonomy ladder

Levels are cumulative. Each row's preconditions are additive to every row above it. Choose a level, not a vibe.

| Level | Name | What happens without a human in the loop | Preconditions (all required) | Status |
|---|---|---|---|---|
| **L0** | **Manual** | Nothing. Every step is invoked in a session by a person or an agent acting in one. | — | **← WE ARE HERE** |
| **L1** | **Scheduled detection** | The L1 scan runs daily; a scan record and a digest line appear whether or not anything was found | (a) F-07 — ≥1 registered source, else every run is an honest `not-run`; (b) `nightly-pipeline.sh` stage 7 targets a dated branch, not `main` (D-31/D-32); (c) one scheduler owner + a concurrency lock (R10); (d) the failure channel is **mandatory**, not optional; (e) `validate-model-releases` stays in `npm test`/`build`; (f) F-00 closes the write-scope ambiguity | **Reachable this week, at zero cost.** The code is written; §2.7B says the wiring can go live today at zero risk |
| **L2** | **Assisted triage** | Candidates are ranked, evidence records are drafted, a registry row is drafted and validated — and left for a human to merge | L1 + A-10 (registry-row drafter) + the 5-field evidence bar enforced + AMB-D resolved (agents may PR; the founder merges lifecycle / disposition / `registry_id` transitions) | Blocked only on F-07 and a small build |
| **L3** | **Metered execution** | A queued, registered subject is executed **without per-run approval**, inside a founder-set ceiling, and locks itself | L2 + A-02/A-03 (live adapter + offline fixtures for every error class) + **§4's ceiling mechanism in code** + `spend-ceiling.json` with an `authority` + a **frozen `bankVersion`** (F-05, F-08, F-09 landed) + A-04 determinism probe + A-06 harm screen + A-05 per-item trials + BLK-002 cleared | Blocked: BLK-002 is founder-owned; the adapter is unbuilt; the ceiling mechanism does not exist |
| **L4** | **Automated analysis and gate evaluation** | A rated run becomes an analysis artifact with its CI and α, G1–G16 are evaluated, and a publication **proposal** is filed for review | L3 + A-07 (`model-analysis`, refusing on `dimensionsMissing`) + A-08 (ratings store) + A-09 (blinding) + F-06 (α floor set **before** the wave) + BLK-005 (two raters) + F-11 (welfare protocol) | Blocked: BLK-005 is the hard one |
| **L5** | **Unattended publication** | A score goes live with no human act | — | **Never available.** Not an engineering gap: `AUTONOMY.md` §1b and §5 R5, G13, and the independence policy each independently forbid it |

### 8.1 Why we are at L0 and not L1

`release-watch-l1.mjs` is written, tested against fixtures, and documented as a daily step in `AGENT-ROUTING.md` §1c. Nothing schedules it. RISK-016 records that no research cycle in this repository has ever run unattended (cited, not re-derived). The nightly entity pipeline is in the identical position: an orchestrator exists, a cron was designed for it, and the commit record shows it has never fired.

**The gap between L0 and L1 is roughly one afternoon of work plus one founder decision (F-07), and it costs nothing to run.** It is the highest return-on-effort item in this entire document.

### 8.2 The level that matters most is L3, and its precondition is a mechanism, not a permission

L3 is what "the benchmark runs itself" actually means in practice: a subject the founder has registered gets measured without him typing. It is blocked on three things, only one of which is a decision. The other two — the live adapter and the ceiling mechanism — are ordinary engineering that can be built today, with no credential, no network and no spend (`CB_MODEL_FIRST_ASSESSMENT_PLAN` §7.2: *"the technical half of this programme is not blocked; the decision half is."*).

---

## 9. What breaks if we automate too much

Each item is a concrete failure with a named mechanism, not a worry.

**9.1 A published score for a mis-detected model.** `recognizeRelease()` fires on "launching our Q3 2026 roadmap" → auto-promoted release → auto-registered identity → a run against a model string that does not resolve. Best case: `invalid_request`, `abortRun: true`, one call wasted. Worst case: the provider routes an unrecognised alias to a nearest model and we publish a compassion score attributed to a snapshot that never existed. **This is the benchmark's own most-documented failure class reproduced in a new product** — the same class as a defunct company ranked "Established" for eleven months. Prevented by G-I; nothing else prevents it.

**9.2 A contaminated bank producing inflated scores at scale.** All 33 items are `public-permanent` with their full five-anchor rubrics published; the bank's own note calls them *"permanently burned for any blinded use"*, and the harness design states a public-pool score *"measures some mixture of compassion behaviour and memorisation, with no way to separate them"* — bias upward, magnitude unmeasurable (RISK-017). One contaminated score with a prominent disclosure is an honest limitation. **Fifty contaminated scores published on a cadence is a leaderboard that rewards memorisation** — and every model trained after publication trains on the leaderboard. **Automation converts a disclosed limitation into a market incentive.** Note also MB-6: the task-bank validator cannot currently represent a secure item at all, so the secure pool that would fix this is a schema change away, not a content decision.

**9.3 A provider outage recorded as a low score.** The statistics are already safe by construction: every function that means or varies over scores filters `status === "completed"` first; refusals, filters, network failures and malformed bodies go to `computeFailureRates` and nowhere else. **The automation risk is not in the statistics — it is in the summary.** An auto-generated digest line or page card that says "scored 41" when 60% of trials failed is the failure. Requirement: **any auto-generated surface must carry `n`, `sufficient` and the failure counts from the same artifact, or emit nothing.**

**9.4 A retry laundering a refusal into a completion.** `content_filter_response` is `retryable: false, maxAttempts: 1` by design. A future "improve the completion rate" retry would silently destroy the refusal-rate measurement — one of the things being measured. Named here so that nobody adds it as an optimisation.

**9.5 Cadence outrunning rating capacity.** Detection is cheap and continuous; rating is 9–23 rater-hours per 140 units and dominates the budget by ~1,500×. An unbounded automated queue creates a backlog, and the only way to clear a backlog of blinded double-rating is to stop double-rating. **Automation buys the erosion of the exact control BLK-005 exists to protect.** Prevented only by §4.6's capacity-bounded queue.

**9.6 Two automated writers, one tree.** R10: no lock, no transaction, no conflict detection; a concurrent write *"loses one side entirely and the validator will not necessarily catch it, because both versions are internally consistent."* Every additional scheduled writer multiplies this. One scheduler owner, always.

**9.7 Scheduling today's `nightly-pipeline.sh` is scheduling publication.** Stage 7 pushes to `main`; pushing to `main` triggers the deploy workflow; stage 8 rebuilds Docker. Combined with RISK-020 — four factual errors reached a public briefing on 2026-09-14 and passed both automated gates — turning on the cron as written publishes unreviewed prose under the institution's name on a schedule.

**9.8 The meta-failure: a benchmark that scores institutions on evidence discipline, failing its own.** Every mechanism above exists because the institution's product *is* the discipline. An automated loop that publishes a number it cannot defend line by line is not a faster benchmark; it is a different and worse product.

---

## 10. Sequencing — what to build, in what order

| # | Item | Owner | Cost | Unblocks |
|---|---|---|---|---|
| 1 | **F-07**: ratify the 14 release sources | Founder | minutes | L1. Without it every scan is an honest `not-run` |
| 2 | **F-00**: one line placing `site/scripts/**`, `research/scripts/**` in §1a and `site/src/data/model-benchmark/**` in §1b | Founder | one line | The ladder cannot be enforced against an authority file that does not name the paths |
| 3 | Fix `nightly-pipeline.sh` stage 7 → dated branch; make the notifier mandatory in scheduled mode; add a concurrency lock | Agent (§1a) | hours | L1, and removes AMB-3 |
| 4 | Schedule `release-watch-l1.mjs --live` daily + the mandatory digest line | Agent + founder (host config) | hours | **L1 achieved** |
| 5 | **A-02 / A-03**: live adapter + offline fixtures for all ten error classes | Agent | days, zero cost, zero network | L3's largest technical gap; buildable before any key exists |
| 6 | **The ceiling mechanism** (§4): `spend-ceiling.json`, preflight, meter, ceiling-abort reason, accrual ledger row, machine-readable cost ledger | Agent (§1a) + founder sets the numbers | days | L3. This is what makes the "within approved budgets" grant non-empty |
| 7 | **A-07 / A-08 / A-09**: analysis program (with the `dimensionsMissing` refusal), ratings store, blinding transform | Agent | days, synthetic fixtures, no dependencies | L4 |
| 8 | `evaluationState` / `resultClaim` derivation + the extended deploy freshness assertion (§6) | Agent | days | Prevents an INC-002 repeat on the first result-only deploy |
| 9 | **F-03 / F-04**, **F-05 / F-08 / F-09** (freeze the bank), **F-06**, **BLK-005**, **F-11** | Founder | decisions + money | L3 and L4 |

Items 2, 3, 5, 6, 7 and 8 are zero-cost, zero-credential, zero-network repository work. **None of them waits on the founder.**

---

## 11. Ambiguities flagged before anything is locked

| ID | Ambiguity | Why it blocks | Recommendation |
|---|---|---|---|
| **AMB-1** | `AUTONOMY.md` §1a does not enumerate `site/scripts/**` or `research/scripts/**`; §1b does not name `site/src/data/model-benchmark/**` (F-00 / NEW-2) | An autonomy ladder enforced against an authority file that does not name the paths is enforced against nothing | Close with one line in `DECISIONS.md` before L1 |
| **AMB-2** | Who may write `releases-v1.json` (the architecture's own AMB-D) | Determines whether L2 is possible at all | Agents may **propose** by PR; the founder merges `lifecycle`, `evaluation_disposition` and `registry_id` transitions |
| **AMB-3** | `nightly-pipeline.sh` stage 7 pushes to `main`; D-31/D-32 forbid it | Blocks option A outright | Change the push target; then the cron is available |
| **AMB-4** | `COST_LEDGER.md` is Markdown; a mechanical ceiling needs a machine-readable authority | A period ceiling cannot be enforced against prose | JSON authoritative, Markdown derived, with a validator asserting they agree (the K12/K19 bidirectional pattern; D-11's lesson that a derived log lags the authoritative directory) |
| **AMB-5** | Who sets `evaluation_disposition` in an automated queue, and does a queued item imply intent to evaluate? | C4 split the enum precisely to avoid "queue implies destiny" | Agent drafts the disposition + `disposition_ref`; the founder sets it. A queue entry is never a commitment to spend |
| **AMB-6** | A period ceiling enforced against **estimates** (§4.4) can be wrong in either direction, while `cost_actual` is *"never faked"* | The founder is authorising against a number that is not yet billed | Ratify the accrual/reconciliation split explicitly, and publish the variance column |
| **AMB-7** | `.benchmark-ops/` is ~2 weeks stale and understates what exists (NEW-1) | A scheduler built from it would re-specify built work | A-01 reconciliation, append-only |

---

## 12. What this document did not do

- No code, data, store, ledger, registry, index, workflow, proposal or `site/src/data/**` file was created or modified. One new file was written: this one.
- No commit, no push. No `git checkout`, `git restore`, `git stash`, `git reset` or `git clean` (INC-009).
- No network call, no web search, no model API call.
- **No price, no provider capability, no model name, no release and no external fact was invented.** Every quantity is measured from a file in this repository, carried from a cited companion document, or marked **founder input**.
- Where the repository contradicts itself, both sides are cited (§1.1, AMB-3).
- Absence claims carry their search and a positive control (§1); claims taken from another document rather than re-derived say so (RISK-016, the token arithmetic, the rater-hour range).
