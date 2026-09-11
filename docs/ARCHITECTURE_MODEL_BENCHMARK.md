# Architecture — AI Model Compassion Benchmarking as Primary Value Proposition

**Date:** 2026-09-10
**Author:** system-architect
**Status:** DESIGN ONLY. No route created, no data file written, no index modified, no commit performed.
**Extends (does not replace):** `docs/MODEL_EVALUATION_HARNESS_DESIGN.md` (2026-09-07), `docs/CB_MODEL_INTEGRATION_2026-09-06.md`
**Downstream:** frontend-engineer (routes, components), backend-engineer (generators, validators), devops-engineer (workflows), qa-engineer (gates)

---

## 0. Ground truth — re-verified this session, not assumed

Every fact in the commissioning brief was checked against the files. All hold, with three material corrections and one previously-unrecorded finding.

| Claim | Verdict | Evidence |
|---|---|---|
| `registry-v1.json` has 0 entries | **Confirmed** | `meta.entryCount: 0`, `entries: []`, `meta.status: "empty"` |
| `tasks-v1.json` has 33 items, all unvalidated | **Confirmed, with a correction** | 33 items. `validationStatus` distribution: **28 `unvalidated`**, **5 `draft-authored-unreviewed`** (ACC-1-A, INT-1-B, INT-1-C, INT-3-A, AWR-2-A). **Zero validated.** The bank is at `bankVersion: "v1.1"`, not v1 — the four unfilled-placeholder items and the AWR-2-A intent leak have been repaired since the harness design was written (`meta.unfilledPlaceholderItemIds: []`). All 33 remain `pool: "core-public"`, `exposureStatus: "public-permanent"`. |
| `validate-product-separation.mjs` → FAIL: 8 blocking, 10 warnings | **Confirmed by derivation** (no shell in this session; derived by reading the detector and the live index data row by row — full enumeration in §6, each of the 8 named with file, rank and composite) | 2 fusions + 6 duplicate groups = 8 blocking; 10 deployed-audit subjects = 10 warnings |
| `model-registry-validator.mjs` — 17 frozen fields, derived `registry_id` | **Confirmed** | `FROZEN_FIELDS` length 17; `computeRegistryId` = `slugify(developer)--slugify(family)--slugify(exact_snapshot)`; `MUTABLE_FIELDS = ["status","superseded_by"]`; `APPEND_ONLY_GROWABLE_FIELDS = ["test_dates"]` |
| `evaluation-scorer.ts` imports the canonical composite | **Confirmed** | `import { computeCompositeFromDimensions } from "@/lib/scoring"` — no second formula |
| `evaluation-statistics.mjs` — alpha, bootstrap CI, mulberry32 | **Confirmed** | `krippendorffAlpha`, `bootstrapCompositeUncertainty`, `createSeededRng`, `THRESHOLDS`, `COMPLETENESS_GATE_FIELDS` (12 fields), `validateRunCompleteness` |
| `research/scripts/model-harness/` — replay adapter, acceptance tests | **Confirmed** | 11 files; `adapters/replay.mjs`; `tests/acceptance.test.mjs` wired as `npm run test:model-harness` and included in `npm test` |
| Existing route `site/src/app/ai-evaluation-suite/` | **Confirmed, with a correction** | The page is no longer inert. It now reads `tasks-v1.json` at build time and mounts a real client component `EvaluationScorer`, honouring `isNonScorableValidationStatus`. RISK-009 ("advertises capabilities it does not have") is **substantially closed**. It still hardcodes its own non-canonical 40-subdimension `DIMS` array — CONFLICT-05 is **still live on this page**. |

### 0.1 New finding, not in any prior document — the guard is not wired to anything

`site/package.json`:

- `npm test` runs `test:product-separation` — the **fixture** test of the detector.
- `npm run build` runs `validate-indexes`, `lint-daily-briefings`, `validate-daily-briefings`, `build-manifest`, `next build`, `build-search-index`.
- **Neither `build` nor `test` ever runs `validate:product-separation` against the live index data.** Same for `validate:model-registry` (only `test:model-registry`, the fixture test, is wired).

So: the separation detector's unit tests pass in CI on every push, while the live data it exists to police has never been checked by CI. `.github/workflows/deploy.yml` runs `npm test` then `npm run build`; a commit that introduces a ninth separation failure deploys green.

This is the highest-leverage finding in this document. It is filed as **F0** in §6 and is the first item in the sequencing plan.

### 0.2 Second new finding — the deploy freshness assertion is blind to model content

`.github/workflows/deploy.yml` step *"Live site serves this commit's content (freshness assertion)"* compares exactly one thing: `site/src/data/updates/manifest.json`'s `.latest` against the first item date in the live `/updates/feed.json`. It exists because between 2026-08-16 and 2026-08-19 the live site served stale scores across six pushes with every other probe green.

A commit that publishes **only** a model result changes no briefing date. The assertion compares `expected == live` on an unchanged value, passes, and cannot detect a cached-layer stale deploy. The release-trigger pipeline in §3 terminates in exactly that kind of commit. Filed as a required change in §3.6 and sequenced at P1.6.

---

## 1. Route map

### 1.1 Design constraint that drives the whole map

`next.config.ts` sets `output: 'export'`. There is no server. Every route is a file on disk at build time. Therefore:

- Dynamic segments must be enumerable by `generateStaticParams` from committed data.
- With 0 registry entries, `generateStaticParams` returns `[]` and **zero** pages are emitted. This is correct, automatic, and requires no special-casing — the empty state lives in the *collection* pages, never in a phantom detail page.
- There is no runtime fetch path for a benchmark result. A published number is a build artifact. See §3.

### 1.2 New routes

| Route | Type | Purpose | `generateStaticParams` today |
|---|---|---|---|
| `/model-index` | static | **The primary value proposition page.** Cohort ranking table + staged empty state (§7). | — |
| `/model-index/methodology` | static | How a model is evaluated: harness, trials, blinding, rating, statistics, gates. Distinct from `/methodology`, which is the institutional method. Cross-links, never merges. | — |
| `/model-index/scope` | static | The three-product boundary, reader-facing. What a Model Index score covers, what it does not, and what the AI Labs Index and Deployed AI Audit are instead. Copy is product's; the page's existence is architectural. | — |
| `/model-index/releases` | static | **Release watch, public.** Every detected release, its classification, its evaluation status, and any decision not to evaluate. This is where "re-runs on every release" becomes auditable rather than asserted. | — |
| `/model-index/[registryId]` | dynamic | One evaluated model snapshot. `registryId` is the derived `registry_id`, used verbatim as the slug — no second slug function, no drift. | **`[]` — 0 pages** |
| `/model-index/[registryId]/results/[resultId]` | dynamic | One result for that snapshot, including superseded ones. Result history is a first-class URL, not a tooltip. | **`[]` — 0 pages** |
| `/model-index/runs/[runId]` | dynamic | Run evidence page: manifest summary, hash-tree root, bank version, item hashes, determinism probe, adapter version, retry policy. The traceability spine. | **`[]` — 0 pages** |

### 1.3 Relationship to `/ai-evaluation-suite`

**Keep the route. Subordinate it. Do not duplicate the task bank.**

`/ai-evaluation-suite` is a working self-serve manual scoring tool over the public pool. It is a *tool*, not a *result*, and it already says so in the component's own disclaimer string. Under the new IA:

- It becomes a child in the information hierarchy while keeping its URL (no redirect, no broken inbound links, no duplicated bank rendering).
- `/model-index/task-bank` is **not created**. `/model-index/methodology` links to `/ai-evaluation-suite` as *the public reference pool*. One rendering of 33 items, one place to maintain.
- `/ai-evaluation-suite` gains a required upward reference: a `CrossProductReference` banner (§5, S5) stating that this tool produces a self-reported single-rater score, that it is not a Model Index result, and linking to `/model-index/methodology` for what an official result requires.
- Its `<link rel="canonical">` stays on itself. Its breadcrumb parent becomes `/model-index`.

Open question for product, not architecture: whether the page is renamed. Flagged as **AMB-4** in §9.

### 1.4 Relationship to the existing indexes

Three changes, all structural rather than cosmetic:

1. **`/indexes` gains a second section, not a ninth row.** The current page imports the eight institutional index JSONs and lists them as peers. The Model Index is added under a separate heading with its own measurement-class label. Listing it as a ninth peer in one sorted list is precisely the "aggregation by reader inference" that `00-MASTER-CONDUCTOR` forbids — nine rows in one list assert commensurability by layout.
2. **`/ai-labs` and every `/ai-lab/[slug]` page gain a disambiguation block.** Fixed copy slot stating that this is an organisational governance score, plus — only once that developer has an evaluated snapshot — a `CrossProductReference` to `/model-index?developer=…`. That component is architecturally incapable of rendering a number (§5, S5).
3. **`mainNav` and `footerLinks`.** `/model-index` belongs in `mainNav` if it is the primary value proposition — that is a product call. Architecturally: it must **not** be added to `footerLinks.indexes`, because that array is generated from `INDEX_REGISTRY.map(...)`, and adding the Model Index to `INDEX_REGISTRY` has consequences far beyond the footer (§5, S2). It goes in as an explicit top-level entry.

### 1.5 Routes explicitly not created

- No `/model/[slug]` short route. One canonical path per model, under `/model-index/`, so the URL itself carries the product boundary.
- No `/compare` spanning products.
- No API route of any kind. The harness "is never exposed as a service" (`MODEL_EVALUATION_HARNESS_DESIGN.md` §7.2), and static export has no server anyway.

---

## 2. Data model

### 2.1 Where the data lives, and why not in `site/src/data/indexes/`

**Model benchmark data must never be placed in `site/src/data/indexes/`.** This is not stylistic. Four scripts glob that directory by `readdirSync`:

| Script | Behaviour if a model index file were present |
|---|---|
| `scripts/validate-indexes.mjs` (in `npm run build`) | Requires `meta.entityCount >= 1` and `meta.dimensions.length === 8` on **every** file. An empty model index **fails the build**; a populated one is validated against the institutional entity schema. |
| `scripts/build-manifest.mjs` (in `npm run build`) | Enumerates index files into the site manifest — model snapshots would be advertised as an institutional index. |
| `scripts/apply-us-states.mjs` | Iterates all index files. |
| `scripts/archive/recompute-composites.mjs` | Would recompute model composites under the institutional pipeline. |

So the canonical tree is:

```
site/src/data/model-benchmark/
  registry-v1.json                      # EXISTS — 0 entries
  tasks-v1.json                         # EXISTS — 33 items, bankVersion v1.1
  forms/<form_id>.json                  # NEW — the item subset a run executed
  results/<registry_id>/<result_id>.json  # NEW — append-only, one per (snapshot × cohort × analysis)
  results/<registry_id>/current.json    # NEW — pointer: which result_id is published
  runs/<run_id>.summary.json            # NEW — committed, redacted summary of a locked run
  model-index-v1.json                   # NEW — GENERATED, never hand-edited
  release-watch.json                    # NEW — GENERATED from research/model-index/release-watch/**
```

Full-fidelity run evidence stays where the harness design put it (`research/model-index/runs/<run_id>/`, and outside the repo entirely for any non-public pool). Only the redacted summary is committed to `site/`.

### 2.2 Registry entry — no schema change

`registry-v1.json` entries are governed unchanged by `site/scripts/lib/model-registry-validator.mjs`. Restated here because downstream code must treat it as fixed:

- **Identity:** `registry_id = slugify(developer)--slugify(family)--slugify(exact_snapshot)`, derived and asserted, never hand-assigned.
- **17 frozen fields:** `registry_id, developer, family, exact_snapshot, aliases, endpoint, product_surface, access_tier, region, system_prompt_status, moderation_layer, tools, sampling, first_seen, lineage, evidence, claim_class`. A change to any of these across a transition is a blocking failure; a materially changed snapshot is a **new entry** with `lineage.predecessor` pointing back.
- **2 mutable fields:** `status` (`candidate|active|superseded|retracted`), `superseded_by`.
- **1 append-only-growable:** `test_dates`.
- **Evidence required:** non-empty `evidence[]`, each with `source_url, publisher, published_at, retrieved_at, archive_or_hash`.
- **Join cardinality:** `developer` must resolve to **at most one** AI Labs Index row. This single check is what stops the Model Index and the AI Labs Index becoming one product by join.

The registry is the **only** place a model identity may be created. No result, no page, no index row may name a model that has no registry entry. Enforced in §2.6.

### 2.3 Evaluation run record — no schema change

Two artifacts already specified and implemented:

- **Manifest** (`research/scripts/model-harness/core/manifest.mjs`): `REQUIRED_MANIFEST_FIELDS_AT_START` (24 fields) and `REQUIRED_MANIFEST_FIELDS_AT_LOCK` (+13). Additive-only after open; `extendManifestAtLock` throws on any changed value; lock builds the hash tree and writes `LOCK` last.
- **Run record** (`core/run-record.mjs` → validated by `evaluation-statistics.mjs#validateRunCompleteness`): the 12 `COMPLETENESS_GATE_FIELDS` — `modelIdentity, configuration, benchmarkVersion, taskManifest, repeatedTrials, rawOutputs, ratingStatus, criticalHarmReview, analysisVersion, uncertainty, limitations, auditHashes` — plus the `repeatedTrials >= 3` floor and the rule that `publishable: true` is impossible while any gate field is missing.

**New: the committed run summary** `site/src/data/model-benchmark/runs/<run_id>.summary.json`, which is what `/model-index/runs/[runId]` renders. It is a projection of the locked manifest, never an independent source:

```jsonc
{
  "run_id": "…", "registry_id": "…",
  "benchmark_version": "…", "bank_version": "v1.1", "form_id": "…", "pool": "core-public",
  "label": "pilot" | "official",
  "harness_commit": "…", "adapter_id": "…", "adapter_version": "…",
  "retry_policy_version": "…", "randomization_seed": 0, "trials_per_item": 5,
  "items": [{ "item_id": "AWR-1-A", "item_version": "…", "item_hash": "sha256:…", "variant_ids": [] }],
  "determinism_probe_ref": "…" | null,
  "started_at": "…", "completed_at": "…", "locked_at": "…",
  "hashtree_root": "sha256:…", "manifest_sha256": "sha256:…",
  "trial_count_expected": 0, "trial_count_persisted": 0, "failed_trial_ids": [],
  "evidence_location": "public-repo" | "restricted",
  "prompt_text_included": false
}
```

Invariants: `prompt_text_included` is **false** for any pool other than `core-public`; no `raw_response_body` and no `request_sent` ever appear in this file; `hashtree_root` and `manifest_sha256` are copied, not recomputed, so a mismatch is detectable.

### 2.4 Per-model result record — new

This is the join point between the registry, the bank, the run, and the scorer. `site/src/data/model-benchmark/results/<registry_id>/<result_id>.json`:

```jsonc
{
  "result_id": "anthropic--claude--<snapshot>@bench-1.0+v1.1.form-core33+a1.0.0",
  "registry_id": "anthropic--claude--<snapshot>",   // FK → registry-v1.json. MUST exist.
  "measurement_class": "model-behaviour",           // constant. See §5 S4.

  "cohort": {                                        // the comparability key. See §4.3.
    "benchmark_version": "…",   // 8 dimensions + composite formula + band table version
    "bank_version": "v1.1",     // FK → tasks-v1.json meta.bankVersion
    "form_id": "…"              // FK → forms/<form_id>.json — the exact item subset
  },

  "provenance": {
    "run_ids": ["…"],                 // FK → runs/<run_id>.summary.json. >= 1.
    "hashtree_roots": ["sha256:…"],   // one per run, in run_ids order
    "analysis_version": "…",          // the scoring/statistics program version
    "scorer_module": "site/src/lib/scoring.ts#computeCompositeFromDimensions",
    "scorer_test_vector_sha256": "sha256:…",  // hash of test-scoring.mjs' 69 cases at build
    "rating": {
      "method": "two-independent-blinded-raters-plus-adjudication",
      "rater_count": 0, "doubly_rated_units": 0,
      "adjudicated_units": 0, "blinding_guess_rate": null,
      "ratings_hash": "sha256:…"
    }
  },

  "dimensions": { "AWR": 0, "EMP": 0, "ACT": 0, "EQU": 0, "BND": 0, "ACC": 0, "SYS": 0, "INT": 0 },
  "subdimensions": null,               // MUST stay null until CONFLICT-05 is resolved (AMB-3)

  "composite": {
    "value": 0,                        // from computeCompositeFromDimensions ONLY
    "integration_premium": 0,
    "band": "…",                       // model band vocabulary — see AMB-2
    "ci": { "level": 0.95, "low": 0, "high": 0, "method": "bootstrap", "iterations": 2000, "seed": 0 },
    "tie_group": "…"
  },

  "reliability": { "krippendorff_alpha": null, "n": 0, "sufficient": false, "threshold": 30 },
  "stability":  { "exact_match_rate": null, "per_item_sd": {}, "trials_per_item": 5 },
  "failures":   { "refusal_rate": null, "filtered_rate": null, "error_rate": null, "n": 0, "sufficient": false },
  "critical_harm": { "rate": null, "n": 0, "items": [], "determined_by": "human", "review_ref": "…" },

  "limitations": ["…"],                // non-empty, always
  "disclosures":  ["operational-independence"],  // §5.4 of the harness design, when triggered

  "publication": {
    "authorized_by": "…",              // human name. NEVER an agent.
    "authorized_at": "…",
    "ledger_ref": ".benchmark-ops/PUBLICATION_LEDGER.md#…",
    "label": "facilitated" | "independently_executed" | "provider_submitted"
  },

  "supersedes": null | "…",            // prior result_id
superseded_by: null
}
```

**`result_id` is derived, not assigned**, by the same discipline as `registry_id`:

```
result_id = `${registry_id}@${benchmark_version}+${bank_version}.${form_id}+a${analysis_version}`
```

A change to any versioned input necessarily produces a different `result_id`. Overwriting is therefore not a thing anyone can do by accident — it requires forging the derivation, which a validator rejects (§4.4).

**Nullability is load-bearing.** `null` means "not measured". It must never render as 0, "n/a" styled like a value, or a dash that reads as a score. `evaluation-statistics.mjs` already returns `{value, n, sufficient, threshold}` triples for exactly this reason; the result record preserves them and the UI must render `sufficient: false` visibly differently from `sufficient: true`.

### 2.5 Published index file — generated, never hand-edited

`site/src/data/model-benchmark/model-index-v1.json`, produced by a new `site/scripts/build-model-index.mjs` in `prebuild`:

```jsonc
{
  "meta": {
    "isModelIndex": true,            // MODEL_INDEX_META_FLAG — activates separation checks 1 and 4
    "measurementClass": "model-behaviour",
    "cohort": { "benchmark_version": "…", "bank_version": "…", "form_id": "…" },
    "modelCount": 0,
    "stage": "pre-registry",         // computed — see §7.2
    "generatedAt": "…",
    "generatedFrom": "site/src/data/model-benchmark/results/**/current.json",
    "ranksRendered": false           // false below the cohort floor — see §7.4
  },
  "rankings": []                     // each row carries snapshot_id === registry_id
}
```

Every row carries `snapshot_id` (= `registry_id`), which is on the validator's `DISCRIMINATOR_FIELDS` list, so separation check 4 stops being vacuous the moment this file exists (§5, S8).

The generator's rules: read only `current.json` pointers; assert every referenced `registry_id` exists and is `status: "active"`; assert every row shares `meta.cohort`; assert `publication.authorized_by` is present; recompute `composite.value` from `dimensions` via the Node scorer mirror and assert it equals the stored value; **never** write a row from anything but an authorized result.

### 2.6 Referential integrity, stated as assertions

Each is a build-time check, not a convention:

| # | Assertion | Where enforced |
|---|---|---|
| R1 | Every `results/**` `registry_id` exists in `registry-v1.json` | `build-model-index.mjs` |
| R2 | Every `run_ids[]` entry has a committed `runs/<run_id>.summary.json` | `build-model-index.mjs` |
| R3 | Every summary's `bank_version` equals the result's `cohort.bank_version` | `build-model-index.mjs` |
| R4 | Every `items[].item_hash` in a run matches the hash of that item at that `bank_version` | `validate-evaluation-run.mjs` (extend) |
| R5 | `result_id` equals its derivation from the record's own fields | new `lib/model-result-validator.mjs` |
| R6 | Composite recomputed from `dimensions` equals `composite.value` (tolerance 0) | `build-model-index.mjs` |
| R7 | `subdimensions` is `null` in every record | `lib/model-result-validator.mjs` |
| R8 | Every index row's `snapshot_id` is a discriminator field | `validate-product-separation.mjs` check 4 |
| R9 | Index rows all share one `cohort` | `build-model-index.mjs` |
| R10 | `publication.authorized_by` non-empty on every published row | `build-model-index.mjs` |

---

## 3. Release-trigger pipeline

### 3.1 The core constraint, stated plainly

A static export has no runtime. **A benchmark result reaches the public only as a git commit that triggers a build.** There is no "the site fetches new scores" path and there must not be one — it would break determinism (the served number would no longer be pinned to the built commit) and it would break the freshness assertion that already exists to catch stale deploys.

So the release-trigger pipeline is a **content pipeline terminating in a commit to `main`**, consumed by the existing `.github/workflows/deploy.yml`.

### 3.2 The eight stages

| # | Stage | Automated? | Output artifact | Gate |
|---|---|---|---|---|
| 1 | **Detect** | Automated (scheduled) | `research/model-index/release-watch/<date>.json` | Blocked today by `BLK-001` (WebSearch budget 2000/2000, INC-008) |
| 2 | **Classify** | Automated, rules-only | candidate event with `classification`, `materiality_basis`, `priority`, `confirmation_status` | Rumours are never releases. `dedup_against` an existing `registry_id`. |
| 3 | **Register** | Agent drafts, **human merges** | new `registry-v1.json` entry | `validateRegistryState` + `validateRegistryTransition(prior=git HEAD, next=PR)` in CI |
| 4 | **Evaluate** | Automated execution, **human-authorized** | locked run dir + `runs/<run_id>.summary.json` | Cost ceiling (`BLK-002`); secure pool never in shared CI |
| 5 | **Rate** | **Human. Not automatable.** | ratings set + adjudications + critical-harm determinations | Two independent blinded raters (`BLK-005`) |
| 6 | **Score** | Automated, deterministic | `results/<registry_id>/<result_id>.json` | `validateRunCompleteness` 12-field gate |
| 7 | **Authorize** | **Human only** | `publication` block + `PUBLICATION_LEDGER.md` row | `publishable` is never computed |
| 8 | **Publish** | Automated | `current.json` pointer commit → `prebuild` regenerates `model-index-v1.json` → deploy workflow | All validators in `npm run build`; freshness assertion (§3.6) |

### 3.3 Where determinism is enforced

Five distinct places. Each already exists or is specified; none is new invention:

1. **Execution.** No LLM in the execution loop. Retry policy is a versioned table; trial order is a seeded permutation; error classification is exhaustive with an `unknown` bucket; a `content_filter_response` is recorded, never retried; an HTTP 200 is never retried. (`MODEL_EVALUATION_HARNESS_DESIGN.md` §2.5–2.6, `core/retry-policy.mjs`.)
2. **Evidence.** Canonical JSON (sorted keys, UTF-8, LF, shortest round-trip numbers) → SHA-256 → hash tree → `LOCK`. One `canonical()` helper so the definition cannot drift.
3. **Statistics.** `createSeededRng` (mulberry32); bootstrap seed recorded in `composite.ci.seed`. No `Math.random()` anywhere in `evaluation-statistics.mjs` or its tests.
4. **Scoring.** One composite implementation, `computeCompositeFromDimensions`, with a Node mirror and 69 test cases. The result record records `scorer_test_vector_sha256` so a silent formula change invalidates every result that claims the old vector.
5. **Build.** `model-index-v1.json` is regenerated in `prebuild` from committed inputs. If regeneration produces a different file than the committed one, the build fails. (Implement as: generate to a temp path, byte-compare, fail on diff — the same discipline as a lockfile check.)

### 3.4 What is manual, and why that bounds the promise

The founder's requirement is that the benchmark re-runs on every new model release. That is achievable for stages 1–4 and 6 and impossible for stage 5 at release cadence, because stage 5 is two humans reading responses.

The honest architecture is a **two-tier public commitment**, both rendered on `/model-index/releases`:

- **Tier 1 — Coverage, automated, hours.** Within a stated window of a confirmed release, the model appears on the Model Index with `status: registered`, its evidence, its lineage, and an explicit "not yet evaluated" state. This is a promise about *coverage and transparency* and it is fully automatable.
- **Tier 2 — Result, human-gated, weeks.** A scored, rated, adjudicated, authorized result. Its latency is a function of rater capacity, and it must be published as a range derived from measured throughput, never as a fixed SLA.

Do **not** implement the 72-hour / 30-day figures. `ASM-002` / `BLK-004`: those numbers appear in none of the 15 readable package files and rest on recollection of an unextracted `.docx`. An SLA is a public promise; this one has no verified source. Flagged as **AMB-1**.

### 3.5 Workflows to add

```
.github/workflows/model-release-watch.yml   # cron. Detect + classify. Opens a PR with candidate events.
                                            #   NEVER touches registry-v1.json directly.
.github/workflows/model-evaluate.yml        # workflow_dispatch ONLY. Inputs: registry_id, form_id, pool.
                                            #   Hard-asserts pool == "core-public"; refuses otherwise.
                                            #   Publishes the run summary as a PR.
```

Both open pull requests. Neither pushes to `main`. The human merge is the authorization boundary, and it is the same boundary the repo already uses for index writes.

Secure-pool runs never enter these workflows. `MODEL_EVALUATION_HARNESS_DESIGN.md` §6.2: "Secure runs are forbidden in shared CI. The CI workflow, when it exists, hard-codes `--pool public` and asserts it."

### 3.6 Required change to the deploy workflow

Per §0.2, the freshness assertion cannot see model content. Add a second assertion in the `verify` job:

- Expected: `require('./site/src/data/model-benchmark/model-index-v1.json').meta.generatedAt` (or a `contentHash` over `rankings`, which is more robust than a timestamp).
- Live: fetch a small generated file the export writes to `site/public/data/model-index/index.json` and compare the same field.
- Skip cleanly when `modelCount === 0` — but assert the *stage* string matches, so even the empty state is freshness-checked.

Without this, the first model-only deploy is exactly the 2026-08-16 failure mode again, on the page that is now the primary value proposition.

---

## 4. Versioning and immutability

### 4.1 The four version axes

| Axis | Field | Owner | Changing it means |
|---|---|---|---|
| **Snapshot identity** | `registry_id` (derived from 3 frozen fields) | Provider reality + evidence | A new model. New entry, `lineage.predecessor` set. Never an edit. |
| **Instrument** | `benchmark_version` | Owner / Methods Committee (`HUMAN-AUTHORITY-BOUNDARY.md`) | The 8 dimensions, the composite formula, the critical gates, or the band table changed. |
| **Item set** | `bank_version` + `form_id` | Bank maintainer + review | Different questions were asked. |
| **Analysis** | `analysis_version` | Engineering | Same responses, different statistics. |

Plus two execution-provenance axes recorded but not part of result identity: `adapter_version` and `harness_commit`. Two runs with different adapter versions are not directly comparable and are visibly so.

### 4.2 Snapshot freezing

Already implemented and correct. The property that matters: `registry_id` **is** the identity, not a label attached to one. `validateRegistryState` asserts `registry_id === computeRegistryId(entry)`; `validateRegistryTransition` deep-compares all 17 frozen fields against the last committed state and rejects any difference, and rejects any disappearance. A provider silently re-pointing a name at a new checkpoint produces a new `exact_snapshot`, hence a new `registry_id`, hence a new row — or, if the provider gives no distinguishing string, a new row with a date-qualified `exact_snapshot` and `lineage.materiality_basis` recording why.

### 4.3 Bank pinning and the cohort rule

A rank is only meaningful among results produced by the same instrument on the same questions. Therefore:

> **Cohort rule.** A ranking table may contain only results sharing an identical `cohort = (benchmark_version, bank_version, form_id)`. `model-index-v1.json` carries exactly one cohort in `meta`. A result outside it cannot be a row.

This makes bank rotation safe by construction rather than by care. When the bank rotates:

- A **new cohort index** is generated. Old results remain published at their own URLs (`/model-index/[registryId]/results/[resultId]`) and remain in the archive, but they leave the ranking table.
- Models not yet re-run on the new bank simply do not appear in the new cohort's table, and `/model-index/releases` shows them as pending re-evaluation. Absence is visible and explained, not silently backfilled with an old number.
- Cross-cohort comparison is **not rendered as a delta**. A "score went from X to Y" line across different `bank_version`s is a category error; the model page shows two results side by side with their cohorts labelled, and an explicit note that the change is not attributable to the model.

This is the presentation-layer lift of the harness's item-hash rule: "an item whose prompt changed produces a different `item_hash`, and the analysis layer refuses to compare it across runs" (acceptance test 4).

### 4.4 Distinguishing a re-run on an updated bank from the original

Three mechanisms, in order of strength:

1. **Different `result_id` by derivation.** `bank_version` is a component of the id. There is no filename collision to resolve, no "overwrite?" decision, no last-write-wins.
2. **Explicit `supersedes` / `superseded_by` chain.** The new result names the old one; the old one is patched **only** in its `superseded_by` field. Everything else is frozen. Enforced by a `validateResultTransition` mirroring `validateRegistryTransition`: frozen = every field except `superseded_by`.
3. **A typed reason.** `supersession_reason ∈ {bank_rotation, instrument_revision, analysis_revision, re_execution_same_cohort, retraction}`. This drives what the UI is allowed to say. `re_execution_same_cohort` is the only one for which a delta may be described as a change in the model — and even then, only against the stability figure, since two runs of the same cohort differ by sampling variance whose magnitude the determinism probe measures.

`current.json` is a one-field pointer (`{"result_id": "…"}`) and is the *only* mutable file in the results tree. Mutating a pointer is auditable in git; mutating a record is not distinguishable from a correction. That asymmetry is the point.

---

## 5. Separation enforcement — structural, not documentary

Nine mechanisms. Each is a thing that fails a build, not a thing a reviewer must remember.

**S1 — Directory separation.** Model data lives in `site/src/data/model-benchmark/`, never `site/src/data/indexes/`. Rationale and the four globbing scripts: §2.1. Test: assert no file matching `model*` exists in `src/data/indexes/`.

**S2 — Registry separation.** The Model Index is **not** added to `INDEX_REGISTRY`, `KIND_TABLE`, or the `EntityKind` union. Those types drive `entityHref`, `EntitySearch`, `NavbarSearch`, `footerLinks.indexes`, `build-entity-history.mjs`, `export-public-data.mjs`, and the Cloudflare Worker badge endpoint — every one of which assumes a commensurable institutional composite. A model snapshot entering `EntityKind` would automatically become badge-able, searchable, and history-charted alongside countries, with no code change and no review. A parallel `site/src/data/modelIndexRegistry.ts` carries model display metadata. Test: `ALL_ENTITY_KINDS` must contain no model kind — asserted, so a future contributor's "just add it to the registry" fails loudly.

**S3 — Import-graph separation.** A lint test asserts that no module imports from both `@/data/indexes/*` and `@/data/model-benchmark/*`. Allowlist: exactly one file, the `/model-index/scope` page, which explains the boundary and is permitted to import metadata only (`meta`, not `rankings`). Implementation: a static scan mirroring the existing `grep -r "fetch(" core/` harness test — the same technique, a different forbidden edge.

**S4 — The typed score primitive.** Both products emit a 0–100 number from the same formula with the same five band names. Identical formatting on adjacent surfaces *is* the merge, regardless of what any caption says. Fix: a single `<Score>` component whose props are `{ value: number; measurementClass: MeasurementClass; ... }` where

```ts
type MeasurementClass = "institutional-governance" | "model-behaviour" | "deployed-config";
```

is a required, non-defaulted prop. Each class renders a distinct visual token and a distinct scale prefix (proposed `CB-I` / `CB-M` / `CB-D`; naming is product's). Every existing bare `{composite}` render migrates. Test: a source scan asserting no template literal or JSX expression renders a raw `composite`/`score` field outside `<Score>`. This is the mechanism that makes "one score covers everything" visually impossible rather than merely disclaimed.

**S5 — `CrossProductReference`, a component that cannot render a number.** The only sanctioned way to link between products. Its prop type has no numeric field — not optional, absent — so no caller can pass a score into it even by mistake. It renders the target's name, its measurement class, and a link. TypeScript enforces this at compile time; a runtime check is unnecessary.

**S6 — Join cardinality.** Already implemented: `developer` must resolve to at most one AI Labs row, or `validateRegistryState` fails with a message that names the reason ("This join key is what keeps the Model Index and the AI Labs Index from being merged into one product"). Extend to the result layer: a model page may render its developer's *name* and a `CrossProductReference`; the page's props type must not include the lab's composite.

**S7 — Wire the guard to the build.** `validate:product-separation`, `validate:model-registry`, `validate:evaluation-run`, and a new `validate:model-results` go into `npm run build`, ahead of `next build`. Today none of the first two run against live data anywhere (§0.1). Because 8 failures are live, this requires the waiver mechanism in S9 — otherwise the correct fix is indefinitely deferred, which is how it got here.

**S8 — De-vacuate check 4.** `validate-product-separation.mjs` currently loads only `src/data/indexes/*.json`, so a model index living in `model-benchmark/` would be invisible to checks 1 and 4 and the "VACUOUS PASS" message would print forever. Extend the loader to read both directories into `indexDataByFile` (keys prefixed by directory so messages stay unambiguous). Checks 1 and 4 then apply automatically — `detectFusedNames` already auto-includes any file with `meta.isModelIndex === true`, and `checkModelDiscriminator` already keys on the same flag. Check 2's `ORG_DUPLICATE_SCOPE_FILES` stays as-is: a model snapshot legitimately shares a developer name with a lab row, and adding the model index to the duplicate scope would generate false positives on exactly the relationship the products are designed to have.

**S9 — Explicit, dated, expiring waivers.** `site/src/data/model-benchmark/separation-waivers.json`:

```jsonc
{ "findingId": "F4", "check": "2-duplicate", "canonical": "amazon",
  "reason": "…", "owner": "founder", "decisionRef": "DECISIONS.md#D-13",
  "expires": "2026-12-31" }
```

The validator downgrades a finding to a warning only on an exact, unexpired match, and **fails on an expired waiver**. An unwaived finding blocks. A blanket waiver is impossible — the match key includes the specific canonical/name. This converts "the guard is off" into "eight named, owned, dated exceptions", which is a governable state; the current state is not.

---

## 6. The 8 product-separation failures, enumerated

Derived by reading `lib/product-separation.mjs` and applying it by hand to the live index files. Failures = check 1 (2) + check 2 (6). Warnings = check 3 (10).

### F0 — meta-failure: the validator does not run (not counted in the 8)

`validate:product-separation` is absent from `npm run build` and `npm test`; only the fixture test `test:product-separation` runs. **Real gap.** Fix: S7 + S9. This is the first thing to fix, because every item below is currently unenforced regardless of its own resolution.

### Check 1 — name fusion (2 blocking)

| # | Finding | Classification | Fix |
|---|---|---|---|
| **F1** | `ai-labs.json` rank 13, `"DeepMind/Google"`, composite **56.9** — organisation/organisation fusion | **Real violation.** One published composite standing in for two organisations. Not the model/lab violation, but the same structural defect. | Rename the row to a single legal organisation — **"Google DeepMind"**. Verified safe against the detector: normalizes to `google deepmind`, which collides with nothing in the three org indexes (`fortune-500.json`'s `"Alphabet/Google"` normalizes to `alphabet google`). No score change, no re-assessment. **Index write — founder/index-owner authority, per `AUTONOMY.md` §1b. Not executable by this agent.** Note the separate, unresolved editorial question of whether `Alphabet/Google` in `fortune-500.json` is itself a fusion; it is out of check 1's scan scope today, which is a scoping decision worth revisiting (see F9-candidate below). |
| **F2** | `ai-labs.json` rank 50, `"xAI/Grok"`, composite **0.0** — organisation/model fusion | **Real violation, and the named one.** The row's own name fuses an organisation and a model into one published composite. It is the lowest-ranked row on the page, so the reputational stakes of the conflation are maximal: a reader arrives at "Grok — 0.0 — Critical" for a model that has **never been evaluated** and could not have been, since the registry is empty. | Rename to **"xAI"**. The 0.0 is an institutional governance score and stays in the AI Labs Index attached to the organisation. Grok acquires a score only through a registry entry and an authorized result, and then on `/model-index/`. **P0 — this must land before any `/model-index` route ships**, or day one of the Model Index publishes a lab page and a model page for the same brand with no reader-facing distinction (RISK-014). Index write — founder authority. |

### Check 2 — duplicate composite publication (6 blocking)

All six are violations of `DECISIONS.md` **D-13** ("no entity may hold more than one published composite anywhere in the Compassion Benchmark"), whose status is still `proposed` while its subsidiary rules R-SUB-1..4 have been enforced against new candidates since 2026-08-21. Enforcing a rule against newcomers while grandfathering its existing violations is the governance defect underneath all six.

| # | Canonical | Occurrences (file, rank, composite) | Gap | Classification | Fix |
|---|---|---|---|---|---|
| **F3** | `1x technologies` | `ai-labs.json` r14 **50.0** · `robotics-labs.json` r9 **81.4** · `robotics-labs.json` r15 `"Halodi Robotics"` **62.5** | **31.4 pts, 3 bands** | **Real violation, compound.** One company published three times, twice in the same index under two names (1X Technologies is Halodi Robotics's post-rebrand name — a maintained fact in `KNOWN_NAME_ALIASES`, correctly resolved). Not a validator artifact. | Two acts: (a) merge the intra-index pair in `robotics-labs.json` — retire `"Halodi Robotics"` with a recorded reason, keep the rebranded identity; (b) resolve the cross-index duplicate under D-13/R-SUB. Requires D-13 ratification. Index writes — founder authority. Waive with expiry until then. |
| **F4** | `amazon` | `ai-labs.json` r31 `"Amazon AWS AI"` **35.9** · `fortune-500.json` `"Amazon"` **12.8** | **23.1 pts, 2 bands** | **Real violation.** Both sides are institutional governance scores of the same corporate parent. Already `RISK-003`; explicitly named by R-SUB-3 ("a published parent blocks the division"). | Apply R-SUB-3: the published parent survives, the business-unit row is retired or reclassified. Requires D-13 ratification. Waive with expiry. |
| **F5** | `boston dynamics` | `robotics-labs.json` r13 `"Boston Dynamics"` **65.6** · `robotics-labs.json` r90 `"Boston Dynamics (SPOT demo)"` **20.3** | **45.3 pts, 3 bands** | **Real violation *and* a validator-semantics gap — the only mixed case.** The second row is not a duplicate organisation; it is a **deployed product configuration** — a Deployed AI Audit subject filed inside a labs index. That is a *three-product* failure that check 3 should have caught but did not, because check 3 only scans `ai-labs.json` and only matches a maintained list. The validator raised the right alarm through the wrong check: `PARENTHETICAL_SUFFIX_RE` strips `(SPOT demo)` and turns a configuration into a name-duplicate. Note the same regex is *correct* for `"Universal Robots (Teradyne)"` and `"Aethon (Teradyne)"` (ownership annotations) — one regex, two different semantics. | **Three-part fix.** (a) **Data:** reclassify the SPOT demo row as a deployed-configuration subject, not a second organisational score. (b) **Validator gap:** distinguish ownership parentheticals from configuration parentheticals — do not infer it from the string; add an explicit optional `configurationOf` field on a row, and have the detector treat a row carrying it as a configuration (check 3 severity) rather than a duplicate (check 2 severity). (c) **Validator gap:** extend check 3's scan from `ai-labs.json` alone to all organisational indexes, and extend `deployed-ai-audit-subjects.mjs` accordingly — it is a maintained list by design, so this is an editorial addition, not a heuristic. Depends on **AMB-5**. |
| **F6** | `figure` | `ai-labs.json` r35 `"Figure AI"` **31.3** · `robotics-labs.json` r27 `"Figure AI"` **48.4** | **17.1 pts, 2 bands** | **Real violation.** Same company, same name, two indexes, two composites. Held under D-17 per `CB_MODEL_INTEGRATION_2026-09-06.md` §2.3 — known, unratified, unresolved. | Decide which index owns the entity (it is both an AI lab and a robotics company — a genuine taxonomy question, not a data error) and retire the other row with a recorded reason. Requires D-13/D-17 ratification. Waive with expiry. |
| **F7** | `meta` | `ai-labs.json` r40 `"Meta AI"` **26.3** · `fortune-500.json` `"Meta Platforms"` **7.8** | **18.5 pts, 2 bands** | **Real violation.** Same shape as F4. Already `RISK-003`. | Apply R-SUB-3. Waive with expiry. |
| **F8** | `microsoft` | `ai-labs.json` r4 `"Microsoft AI"` **75.9** · `fortune-500.json` `"Microsoft"` **65.3** | **10.6 pts, same band** | **Real violation.** Smallest gap and the same band, which makes it the *least* visible and arguably the most misleading — a reader can see both numbers and conclude the benchmark is merely imprecise rather than measuring two different subjects. | Apply R-SUB-3. Waive with expiry. |

### Classification summary

| Verdict | Count | Items |
|---|---:|---|
| Real violation, data fix required | 7 | F1, F2, F3, F4, F6, F7, F8 |
| Real violation **and** validator gap | 1 | F5 |
| False positive / validator noise | **0** | — |

**The detector is not noisy.** Every one of the eight corresponds to a defect a reader could find. Two (F1, F2) are fixable by rename with no scoring implication and no committee — they should be done first and are the cheapest credibility repair available. Five (F3, F4, F6, F7, F8) are blocked on ratifying D-13, which is a founder decision that has been pending since the rule started being enforced against new candidates. One (F5) needs a product decision (AMB-5) plus two validator improvements.

### The 10 warnings

`ai-labs.json` rows on the maintained Deployed AI Audit subject list: **Abridge** (r5, 60.9), **Harvey AI** (r19, 48.4), **Typeface** (r23, 48.4), **Perplexity AI** (r26, 45.3), **Waymo** (r27, 42.5), **Pika Labs** (r42, 25.0), **Midjourney** (r44, 21.9), **Replika** (r45, 21.9), **Clearview AI** (r47, 10.9), **Character AI** (r48, 0.0).

**All real; correctly non-blocking today; must become blocking at Model Index launch.** They are configured products ranked against organisational governance. Today the site has two products in view and the conflation is a taxonomy debt (WQ-P3-01). The day `/model-index` ships, the site has three products in view, a reader can compare "Character AI 0.0" (a deployed product, in a labs index) against a model snapshot score and an organisational score on one visit, and the warning becomes the live violation the whole rule exists to prevent. Recommendation: waivers for these ten carry an expiry no later than the Model Index launch date.

### A ninth candidate this analysis surfaced

`fortune-500.json` contains `"Alphabet/Google"`, `"Anthem/Elevance"`, `"PolyOne/Avient"`, `"Cablevision/Altice"` — four rows matching the fusion pattern, invisible because `FUSION_SCAN_STATIC_FILES = ["ai-labs.json"]`. Three are plausibly rebrand annotations rather than fusions (old name / new name), which is a *different* legitimate meaning of the slash. Recommendation: extend check 1's scan to all organisational indexes and add an explicit `formerName` field so a rebrand is expressed structurally instead of punctuationally — the same fix shape as F5(b). Not part of the 8; recorded so a scope extension does not later arrive as a surprise regression.

---

## 7. Empty-state architecture

### 7.1 The requirement

`/model-index` is to be the primary value proposition of the site, and today it would have zero rows. The failure mode to avoid is precisely the one already documented as RISK-009: a page describing a capability that does not exist, next to a commercial CTA.

### 7.2 Stage is computed, never authored

The page has four variants selected by a value derived at build time from the actual files. Nobody edits a stage string.

```
stage = "pre-registry"           when registry.entries.length === 0
      | "registered-unevaluated" when entries exist and no locked run summary exists
      | "piloted-unpublished"    when run summaries exist but every one is label: "pilot"
      | "published"              when >= 1 result has publication.authorized_by
```

Today: `pre-registry`. Transition to the next stage is a *data* change, so the page cannot go stale relative to reality, and no one has to remember to rewrite it.

### 7.3 What the `pre-registry` page renders

A **readiness ledger**, generated from the real files, not prose:

| Rendered fact | Derived from |
|---|---|
| Models registered: **0** | `registry-v1.json` `meta.entryCount` |
| Evaluation runs completed: **0** | count of `runs/*.summary.json` |
| Published results: **0** | count of `results/**/current.json` |
| Task bank: **33 items**, `v1.1`, **0 validated** (28 unvalidated, 5 authored-unreviewed) | `tasks-v1.json` |
| Item exposure: **33 of 33 public-permanent** — published with full answer keys | `tasks-v1.json` `exposureStatus` |
| Secure items: **0** | `pool` field counts |
| Harness: replay adapter + acceptance suite, **0 provider adapters** | `research/scripts/model-harness/adapters/` |
| Human raters: **0** | `.benchmark-ops/BLOCKERS.md` BLK-005 |
| Open blockers | `.benchmark-ops/BLOCKERS.md` |

Plus, in plain prose: **why there are zero results**, naming the real reasons — no model API credential and no approved spend ceiling (BLK-002); no rating panel (BLK-005); no Methods Committee (BLK-006); the entire public item bank published with its answer keys, which makes any cross-model comparison on it a saturation measurement rather than a benchmark (RISK-017); and no release scan has run (BLK-001).

This is not an apology. Published honestly, "here is exactly what we have not yet built and why" is the strongest possible demonstration of the evidence discipline the product sells. A benchmark that publishes its own empty state precisely is more credible than one that publishes numbers.

**Commercial rules for the empty state, stated as constraints:**

- **No CTA that sells model data.** No "License the Model Index", no "Buy the report", no pricing for a dataset with zero rows.
- **Permitted:** Score-Watch / notify-me signup (the Worker subscriber API already exists), a link to `/model-index/methodology`, a link to the harness design docs, a research-collaboration or funding contact, and a link to `/ai-evaluation-suite` as the self-serve tool it actually is.
- A build-time assertion enforces this: when `stage !== "published"`, the page's component tree must contain no `gumroad.ts` URL. Cheap to test, and it is the exact defect RISK-009 recorded.

### 7.4 What changes as stages advance

| Stage | Table | Ranks | Composite | CTA |
|---|---|---|---|---|
| `pre-registry` | absent | — | — | notify / methods only |
| `registered-unevaluated` | roster of registered snapshots with evidence links and `status`, **no score column at all** | — | — | notify / methods only |
| `piloted-unpublished` | same roster; pilot runs linked as *evidence*, prominently labelled non-results | — | — | notify / methods only |
| `published` | cohort ranking | only when cohort size ≥ 5 **and** rendered as statistical tie groups | with CI, stability, refusal rate, critical-harm rate, α and its `sufficient` flag | full |

**The rank-suppression rule matters.** "Rank 1 of 2" is not information. Below the cohort floor the page shows scores with intervals and no ordinal position, and `meta.ranksRendered` is `false`. Above it, ranks are tie-grouped from the bootstrap intervals — `06-ANALYSIS` requires tie groups, and rendering a strict 1..N ordering over overlapping confidence intervals would contradict the statistics the same page publishes.

**First-wave transition is a data commit.** Adding the first authorized result changes `stage` to `published`, generates the first row, emits the first `/model-index/[registryId]` page, and triggers the deploy. No page rewrite, no template swap, no forgotten placeholder.

---

## 8. Implementation sequencing

Phases are gated by dependency, not date. **P0 is fully unblocked and should start now; it does not depend on credentials, raters, or committees.**

### P0 — Make the guard real (no external dependencies)

| # | Item | Owner | Depends on |
|---|---|---|---|
| P0.1 | Build the waiver mechanism (S9) — `separation-waivers.json` + validator support for exact-match, expiring waivers that fail when expired | backend-engineer | — |
| P0.2 | **F2: rename `xAI/Grok` → `xAI`.** P0 within P0 — highest reputational exposure, zero scoring impact | **founder** (index write) | decision D-26 |
| P0.3 | **F1: rename `DeepMind/Google` → `Google DeepMind`** | **founder** (index write) | decision |
| P0.4 | Record dated, owned waivers for F3–F8 and the 10 warnings, expiring no later than Model Index launch | **founder** + backend-engineer | P0.1 |
| P0.5 | **Wire `validate:product-separation`, `validate:model-registry`, `validate:evaluation-run` into `npm run build` and `npm test`** — the F0 fix | devops-engineer | P0.2–P0.4 |
| P0.6 | F5(b)(c): `configurationOf` field, check-3 scan extended to all org indexes, ownership-vs-configuration parenthetical distinction | backend-engineer | AMB-5 for the data half; the code half is unblocked |
| P0.7 | Extend `validate-product-separation.mjs`'s loader to `model-benchmark/` (S8) | backend-engineer | — |

### P1 — Build the surface with zero models

| # | Item | Owner | Depends on |
|---|---|---|---|
| P1.1 | `<Score>` primitive with required `measurementClass`; migrate every existing score render; source-scan test (S4) | frontend-engineer | — |
| P1.2 | `CrossProductReference` component with no numeric prop (S5) | frontend-engineer | P1.1 |
| P1.3 | `modelIndexRegistry.ts`; assertion that `EntityKind` contains no model kind (S2) | frontend-engineer | — |
| P1.4 | Import-graph lint test (S3) | qa-engineer | — |
| P1.5 | `lib/model-result-validator.mjs` (R5, R7) + `build-model-index.mjs` (R1–R3, R6, R9, R10) + regenerate-and-byte-compare build check | backend-engineer | P0.7 |
| P1.6 | **Extend the deploy freshness assertion to model content (§3.6)** | devops-engineer | P1.5 |
| P1.7 | Routes: `/model-index` (4 computed stages), `/model-index/methodology`, `/model-index/scope`, `/model-index/releases`, and the three dynamic routes returning `[]` | frontend-engineer | P1.1, P1.3, P1.5 |
| P1.8 | `/ai-evaluation-suite` subordination banner + breadcrumb; `/indexes` two-section split; `/ai-labs` disambiguation block | frontend-engineer | P1.2 |
| P1.9 | Empty-state commercial assertion (no Gumroad URL below `stage: published`) | qa-engineer | P1.7 |

**End of P1 the site truthfully presents AI model compassion benchmarking as its primary value proposition, with zero fabricated numbers.** That is a shippable state and it is reachable without spending a dollar or hiring a rater.

### P2 — Release trigger (needs founder decisions and a credential)

| # | Item | Depends on |
|---|---|---|
| P2.1 | Record D-27 (operating-agent conflict + "no LLM in the execution loop"), D-28 (coordinated disclosure), and the BLK-002 provider/tier/ceiling decision | **founder only** |
| P2.2 | Clear BLK-001 (WebSearch budget) so a release scan can run | **founder** (config) |
| P2.3 | `model-release-watch.yml` — detect + classify → PR | P2.2 |
| P2.4 | First registry entries from confirmed evidence; `validateRegistryTransition` in CI against git HEAD | P2.3 |
| P2.5 | First provider adapter; determinism probe; pilot run, public pool, label `pilot`, never published | P2.1 |
| P2.6 | `model-evaluate.yml` (dispatch-only, `--pool public` hard-asserted) after two clean pilots | P2.5 |

At the end of P2 the site is at `stage: registered-unevaluated` or `piloted-unpublished` — real models, real evidence, no scores. **This already satisfies Tier 1 of the release-trigger promise (§3.4).**

### P3 — Humans (needs money and people)

Rater panel + welfare protocol in force before the first rater sees an item (BLK-005, WQ-P2-04); Methods Committee or a written interim substitute (BLK-006); secure item bank in external storage; band vocabulary and taxonomy decisions (AMB-2, AMB-3).

### P4 — First publishable result

Locked run → two blinded raters → adjudication → analysis with CIs and tie groups → 12-field completeness gate → separation guard green with **no waivers remaining** → founder authorization in `PUBLICATION_LEDGER.md` → `current.json` commit → deploy.

### Dependency graph, critical path

```
P0.2/P0.3 ─┐
P0.1 ──────┼─→ P0.4 ─→ P0.5 ─────────────────────────────┐
P0.7 ──────┴─────────────────→ P1.5 ─→ P1.6 ─┐           │
P1.1 ─→ P1.2 ─→ P1.8                          ├─→ P1.7 ─→ P1.9
P1.3 ─────────────────────────────────────────┘
                                    P2.1/P2.2 ─→ P2.3 ─→ P2.4 ─→ P2.5 ─→ P2.6
                                                                    P3 ─→ P4
```

### Highest technical risks

| Risk | Why it is the top of the list |
|---|---|
| **The guard is off (F0)** | Every separation control in this document is worthless until `validate:product-separation` runs in CI. It is one line of `package.json` and it is blocked only by the eight live failures — which is exactly why S9's waiver mechanism exists. |
| **Model-blind freshness assertion (§0.2)** | The deploy pipeline's only real staleness detector cannot see model content. The first model-only deploy risks silently serving nothing, on the primary value-proposition page. Precedent: six green pushes serving stale scores, 2026-08-16 to 08-19. |
| **Rating throughput vs the release promise** | Stage 5 is two humans. Any published SLA that implies a scored result at release cadence will be missed. Mitigation is the two-tier promise (§3.4), and it is a product commitment, not a technical one. |
| **One formula, two products, one visual language** | The composite reuse is an asset for consistency and a liability for separation. S4 is the whole mitigation; if `<Score>` is not adopted universally, the boundary reverts to disclaimers. |
| **Bank exposure (RISK-017)** | All 33 items are public with answer keys. No valid cross-model comparison exists until a secure pool exists. The cohort rule (§4.3) makes this survivable — the public pool becomes its own labelled cohort and a saturation sentinel — but it must never be presented as the benchmark. |

---

## 9. Ambiguities to resolve before locking architecture

Flagged rather than decided, per the rule that architecture is not locked over an ambiguous requirement.

| ID | Ambiguity | Blocks | Recommendation |
|---|---|---|---|
| **AMB-1** | "The benchmark must re-run on every new model release" — does that mean coverage (registry + status, hours) or a scored result (weeks)? | The public promise on `/model-index/releases`; whether the 72h/30d figures are implemented at all | Adopt the two-tier promise (§3.4). Do **not** implement 72h/30d — `ASM-002`/`BLK-004`, unverified against any primary source. |
| **AMB-2** | Which band vocabulary applies to models? The institutional bands describe governance maturity ("Consistent institutional practice. Embedded in governance…"), which is a category error for a model response (CONFLICT-06). Compounded by the live 60.9 boundary gap (CONFLICT-03 / RISK-006). | Publication only; does not block P0 or P1 | Author a model-appropriate band vocabulary; keep the rubric *content* unchanged. Owner-reserved decision. |
| **AMB-3** | Which 40-subdimension taxonomy? `/ai-evaluation-suite` still hardcodes a set matching the canonical one on **7 of 40** names, and renames SYS. | Any subdimension display on a model page; keeps `subdimensions: null` (R7) | Owner/Methods decision (`WQ-P1-02`). Until then, dimension-level only, and the divergent taxonomy on the suite page should be reconciled to the canonical source. |
| **AMB-4** | Does `/ai-evaluation-suite` keep its name and identity as a subordinate tool, get renamed, or fold into `/model-index/methodology`? | Nav labels, breadcrumbs, canonical tags | Keep URL, subordinate it (§1.3). Renaming is a product/SEO call. |
| **AMB-5** | Is the Deployed AI Audit a v1 product, a v2 product, or a classification-only label? | F5's data fix; the disposition of the 10 warnings; whether `/deployed-ai-audit` routes ever exist | Needed before Model Index launch, because launch is when the three-product boundary becomes reader-visible. `WQ-P3-01`. |
| **AMB-6** | Is D-13 ratified? It is enforced against new candidates and grandfathered for six existing violations. | F3, F4, F6, F7, F8 — five of the eight | Ratify or withdraw. The current asymmetric state is worse than either. |
| **AMB-7** | Does the Model Index score models from the same family as the agents that built the pipeline, and under what label (D-27 / harness design §5.5)? | Which providers to provision; whether the mandatory disclosure renders | Must be decided **before** the first credential is provisioned, because it determines which credentials to provision. |

---

## Appendix — what this task did and did not do

**Did:** read the two prior design documents in full; independently verified all eight ground-truth claims against the files; derived the exact 8 blocking failures and 10 warnings by applying the detector's logic to live index data row by row; wrote this document.

**Did not:** modify `site/src/data/indexes/**`, `research/rotation-state.json`, `research/entity-records*`, `research/change-proposals/**`, `research/assessments/**`, `site/src/data/updates/**`, `.benchmark-ops/**`, root `DECISIONS.md` or `RISKS.md`, `site/package.json`, or `.github/workflows/**`. Created no route, no component, no data file. Ran no shell command (none available this session — the validator result was derived by reading, and the derivation is shown so it can be checked). Performed no web search. Invented no model, no score, no band, no provider capability, and no release date.
