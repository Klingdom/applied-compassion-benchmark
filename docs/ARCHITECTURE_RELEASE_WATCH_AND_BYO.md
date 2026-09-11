# Architecture — Release Watch Data Layer and Bring-Your-Own-Model Scoring

**Date:** 2026-09-10
**Author:** system-architect
**Status:** DESIGN ONLY. No data file written, no route created, no script created, no package installed, no index modified, no commit performed.
**Extends (does not replace):** `DECISIONS.md` D-29, `docs/ARCHITECTURE_MODEL_BENCHMARK.md` (2026-09-10), `docs/MODEL_EVALUATION_HARNESS_DESIGN.md` (2026-09-07), `.benchmark-ops/RELEASE_WATCH.md`, `.benchmark-ops/MODEL_REGISTRY.md`
**Downstream:** backend-engineer (validators, schemas, MCP server), frontend-engineer (`/ai-models/releases`), devops-engineer (npm wiring, workflows), qa-engineer (fixture suites, separation scans)

---

## 0. Reconciliations and ground truth, checked this session

Three upstream facts changed since `ARCHITECTURE_MODEL_BENCHMARK.md` was written, and one naming conflict must be settled before anything below is implementable.

| Item | Prior state in the architecture doc | Verified state today | Consequence |
|---|---|---|---|
| **Route name** | `/model-index/releases` (§1.2) | D-29 ratified `/ai-models`; `site/src/app/ai-models/` exists with `page.tsx` and `methodology/page.tsx` | **The route is `/ai-models/releases`.** Every `/model-index/*` path in the prior document reads as `/ai-models/*`. This document uses the ratified form throughout. |
| **F0 — "the guard is not wired to anything"** | Named the highest-leverage finding in the document | **Closed.** `site/package.json` `build` now runs `validate-product-separation.mjs`; `test` runs `test:separation-waivers`, `validate:product-separation`, `validate:task-bank`, `test:model-registry`, `validate:evaluation-run`, `test:model-harness` | The wiring pattern this document's validator must copy already exists and is proven. `scripts/lib/separation-waivers.mjs` exists. |
| **Model data tree** | Listed 7 files | Only `registry-v1.json` and `tasks-v1.json` exist. No `results/`, `runs/`, `forms/`, `model-index-v1.json`, `release-watch.json` | `releases-v1.json` is the **third** file in the tree, and the first one that will hold rows before `registry-v1.json` does. Its schema cannot assume the results layer exists. |
| **`registry-v1.json`** | 0 entries | 0 entries, `meta.status: "empty"` | Confirmed. |
| **`research/model-index/`** | Assumed as the run-evidence root | **Does not exist.** `research/scripts/model-harness/` exists (11 files, replay adapter only) | The scan-record tree in §2.6 is a new directory, not an addition to an existing one. |
| **Harness §7.2** | Cited | Confirmed verbatim: *"There must be **no code path by which user-submitted text enters a run**. No public endpoint, no form, no API, no 'try it with your own prompt.'"* and *"The harness is never exposed as a service. It is a local batch tool. No hosted endpoint, no Worker route, no public runner."* | **This is decisive for Feature 2.** It is a ratified design rule, not a preference, and it eliminates the Worker option on its own. |

### 0.1 A governance conflict this design must not step over

D-29 states, as a ratified decision: *"Exactly two pages ship before any model is evaluated."* It then enumerates what must not ship, including *"No per-model page or 'not yet evaluated' stub (a doorway pattern)."*

`/ai-models/releases` is a **third page**. It is not a per-model page and it is not a doorway — it is one page, with no dynamic segment and no per-release route — but the "exactly two" sentence is explicit and load-bearing, and an architect quietly adding a third page to a ratified page count is precisely the kind of drift the decision log exists to prevent.

**Required before the page ships: a new dated decision entry (proposed `D-30`) extending D-29's page count from two to three, naming the release watch page, and restating the constraints it inherits** (§3.5 below). The data layer, the schema and the validator are all buildable and mergeable *now* without that entry; only the published page waits on it. Flagged as **AMB-A**.

---

# PART 1 — RELEASE WATCH DATA LAYER

## 1. Critique of the proposed contract

The proposed contract is sound in its file placement and its core instinct — a separate store, joined to but never merged with the registry. Six corrections, in descending order of importance.

### C1 — The store has no way to say "we never looked." This is the biggest hole.

`{ meta, releases: [] }` with the proposed fields cannot distinguish **"no release has happened"** from **"no scan has ever run."** That distinction is the exact lesson of INC-008, already written into `.benchmark-ops/RELEASE_WATCH.md` invariant 3:

> *"A scan that did not run is not a scan that found nothing."*

An empty array is ambiguous, and an ambiguous empty array on a public page becomes an implied coverage claim within one reader-hour. The store must carry scan state in `meta` as **data**, so the honest empty state is derived rather than written in copy that can go stale (D-29's rule that counts derive from files at build time applies identically here).

**Correction:** `meta` gains `lastScanId`, `lastScanCompletedAt`, `coverageThrough`, `scanState`, `coverageClaim`, `sourceRegistryRef`, `staleAfterDays`.

### C2 — `source_url` is a weaker evidence standard than the registry's, and that gap breaks promotion.

A registry entry requires `evidence[]` with five fields each: `source_url`, `publisher`, `published_at`, `retrieved_at`, `archive_or_hash` (`model-registry-validator.mjs` `REQUIRED_EVIDENCE_STRING_FIELDS`). A release carrying only a dated `source_url` cannot be promoted into a registry entry without gathering fresh evidence — which either blocks promotion or, worse, invites someone to fill the missing fields from memory at promotion time.

**Correction:** replace `source_url` with `evidence[]` using the **identical five-field schema**, validated by importing `REQUIRED_EVIDENCE_STRING_FIELDS` from the registry validator rather than re-declaring it. One definition, two stores. A release that cannot meet the registry's evidence bar is not recorded as a release; it is recorded as an unconfirmed candidate in the scan file (§2.6) and never appears in `releases-v1.json`.

### C3 — `snapshot` is a dangerous field name, and most releases will not have one.

`exact_snapshot` is a **frozen** registry field and one third of the `registry_id` derivation. A field called `snapshot` in the release store will be read as the same thing, and it usually will not be: at detection time a provider has typically announced a family and a name, not a resolvable checkpoint identifier.

**Correction:** two fields. `snapshot_label` (what the provider called it, verbatim) and `snapshot_precision ∈ {exact, date_qualified, family_only}`. The precision field is what makes the `release_id`/`registry_id` relationship well-defined rather than hopeful (§2.2).

### C4 — `queue_status` conflates two orthogonal facts, and its name asserts an intention the programme cannot honour.

"Queue" implies everything detected is destined for evaluation. With BLK-002 (no credentials, no spend ceiling) and BLK-005 (no rater panel) open, nothing is. Worse, one enum is being asked to carry two independent axes:

- **Where the release sits in the release → registry → result lifecycle** (a fact about our records).
- **Whether we have decided to evaluate it, and if not, why** (a decision about our intentions).

A model can be `registered` and `declined`. A model can be `detected` and `queued`. One enum cannot express that.

**Correction:** split into `lifecycle` and `evaluation_disposition`, with a mandatory `disposition_reason` and `disposition_ref` whenever disposition is anything other than `not-triaged`. This turns "we are not evaluating this, and here is the blocker ID" into a published, checkable fact — which is most of the value of a public release watch page.

### C5 — No classification field means the release store silently merges the three products.

CB-MODEL's highest-priority separation risk is model behaviour vs lab governance vs deployed configuration (D-23). `RELEASE_WATCH.md` already declares an eight-value `classification` enum, three values of which (`configuration_change`, `policy_layer_change`, `new_deployment`) describe **Deployed AI Audit** subjects, not Model Index subjects. Without the field, a system-prompt change gets recorded as a "release", becomes a row next to model releases, and the boundary is gone.

**Correction:** `classification` is required and enumerated, and `product_scope` is **derived from it** by a pure function, then asserted. A release whose `product_scope` is `deployed-ai-audit` may never carry a non-null `registry_id`.

### C6 — Nothing forces a release to trace to a scan that actually ran.

Without this, an agent can write a plausible release row from training-data recollection — the exact failure `RELEASE_WATCH.md` was written to prevent, and the reason it is honestly empty today.

**Correction:** `detected_in_scan` is required and must resolve to an existing scan record file. Fabricating a release now requires also fabricating a scan record with a coverage window and a source list — a much higher and much more visible cost. Combined with `archive_or_hash` (format-validated as `sha256:<64 hex>` or a recognised archive URL), which cannot be produced from memory without an overt lie.

### What is accepted unchanged

- **File path** `site/src/data/model-benchmark/releases-v1.json`. Correct, and load-bearing: four scripts glob `site/src/data/indexes/` by `readdirSync` (`validate-indexes.mjs` and `build-manifest.mjs` both run in `npm run build`), so a release file placed there would fail the build on `entityCount >= 1` or be advertised as an institutional index.
- **`{ meta, releases: [] }`** top-level shape. Matches `registry-v1.json` and `tasks-v1.json`.
- **`release_id`, `developer`, `family`, `announced_date`, `tracked_since`** as concepts.
- **Validator wired like the separation validator.** Exactly right, with one wiring nuance in §3.4.
- **Relate to the registry without merging.** Correct and non-negotiable; the mechanism is §2.2 and §2.5.

---

## 2. Data model

### 2.1 Three artifacts, three purposes, one direction of flow

`.benchmark-ops/RELEASE_WATCH.md` currently calls itself the *"single-authority file"* for release watch. Adding `releases-v1.json` creates two authorities unless the split is stated. It is:

```
research/model-index/release-watch/<scan_id>.json     ← RAW. Everything a scan saw, including
   (new tree, git-committed)                            rumours, non-material events, and the
                                                        coverage the scan actually achieved.
                              │  human confirmation + evidence completeness
                              ▼
site/src/data/model-benchmark/releases-v1.json        ← CONFIRMED. Published release facts only.
   (the store of record, the published surface)          No rumours. Registry-grade evidence.
                              │
                              ▼
.benchmark-ops/RELEASE_WATCH.md                       ← LEDGER. Which scans ran, when, with what
   (operational narrative, human-facing)                 coverage, and what was decided. Derived
                                                        summary + prose; never the data source.
```

**Rule:** data flows raw → confirmed → ledger, never backwards. `RELEASE_WATCH.md` stops being the single authority for *release data* and becomes the single authority for *scan history and operational decisions*. Its schema section is superseded by §2.3 and §2.6 here; its invariants are preserved and enforced mechanically. A validator check (§3.3, K12) asserts the scan count in `RELEASE_WATCH.md` matches the scan record file count — the same defect class as D-11's queue-accounting correction, where a derived log lagged the authoritative directory by 64 entries.

### 2.2 `release_id` and its relationship to `registry_id` — the key question, answered

**`release_id` uses the same derivation function as `registry_id`, on the same three inputs, with one explicitly-declared substitution.**

```js
// site/scripts/lib/model-releases-validator.mjs
// slugify is imported, not re-implemented — same function, same normalisation.
release_id = `${slugify(developer)}--${slugify(family)}--${slugify(snapshot_key)}`

snapshot_key =
    snapshot_precision === "exact"         ? snapshot_label
  : snapshot_precision === "date_qualified" ? `${snapshot_label}-${announced_date}`
  : /* family_only */                        `unspecified-${announced_date}`
```

This gives four properties that a separate id scheme or a mapping table would not:

1. **When a release has an exact snapshot, `release_id === registry_id` by construction.** The join is *identity*, not a foreign-key lookup. There is no mapping table to fall out of sync, and no second slug function to drift (the same reasoning that made `registry_id` the route slug in `ARCHITECTURE_MODEL_BENCHMARK.md` §1.2).
2. **When it does not, the id is still unique, still deterministic, and visibly imprecise.** `openai--gpt--unspecified-2026-09-10` cannot be mistaken for a snapshot identifier by a human or by a validator.
3. **Uniqueness is inherited.** Two releases colliding on `release_id` means they genuinely share developer + family + snapshot key — the same condition the registry treats as a blocking duplicate, for the same reason.
4. **Promotion is checkable.** See below.

**The `registry_id` field on a release is a nullable foreign key, never a derivation.**

| `snapshot_precision` | `registry_id` when non-null | Validator rule |
|---|---|---|
| `exact` | MUST equal `release_id` | K4: if they differ, either the release's identity fields are wrong or someone registered a different snapshot under this release — both are blocking. |
| `date_qualified` / `family_only` | MAY differ | K5: the release must additionally carry `id_resolution: { resolved_at, resolved_snapshot_label, note }` recording how the imprecise release was matched to a precise registry entry. An unexplained mismatch is blocking. |
| any | MUST exist in `registry-v1.json` | K6. |

**What `release_id` is not.** It is not a URL slug. There is no `/ai-models/releases/[releaseId]` route (§3.5). It is not a citable public identifier for a model — `registry_id` is, and only once a registry entry exists.

### 2.3 Release record schema

```jsonc
{
  // ── IDENTITY (frozen after first commit) ────────────────────────────────
  "release_id": "anthropic--claude--unspecified-2026-09-10",  // derived, asserted, never assigned
  "developer": "Anthropic",            // free text as the provider writes it
  "family": "Claude",
  "snapshot_label": "Claude 4.7",      // verbatim provider string. NOT `exact_snapshot`.
  "snapshot_precision": "family_only", // exact | date_qualified | family_only
  "announced_date": "2026-09-10",      // ISO-8601 date. The provider's announcement date.
  "classification": "new_model",       // RELEASE_WATCH.md enum, 8 values — see below
  "product_scope": "model-index",      // DERIVED from classification, then asserted (K7)
  "materiality_basis": "announced checkpoint change",  // carried forward for lineage.materiality_basis

  // ── PROVENANCE (frozen) ─────────────────────────────────────────────────
  "tracked_since": "2026-09-10",       // date CB first recorded it. NEVER equals announced_date
                                       //   by default — they are different facts.
  "detected_in_scan": "scan-2026-09-10-001",   // FK → research/model-index/release-watch/. REQUIRED.
  "detection_method": "search",        // search | source_fetch | manual | provider_notice
  "evidence": [                        // REQUIRED, non-empty. Same 5 fields as the registry.
    {
      "source_url": "https://…",
      "publisher": "Anthropic",
      "published_at": "2026-09-10",
      "retrieved_at": "2026-09-10T14:02:11Z",
      "archive_or_hash": "sha256:…"    // format-validated (K9)
    }
  ],
  "confirmation_status": "confirmed",  // ONLY "confirmed" may appear in this file (K10)

  // ── LIFECYCLE (mutable) ─────────────────────────────────────────────────
  "lifecycle": "detected",             // detected → confirmed → registered → evaluated → published
                                       //   terminal: superseded | retracted | out-of-scope
  "registry_id": null,                 // FK → registry-v1.json. null until registered.
  "id_resolution": null,               // required iff registry_id != release_id (K5)
  "predecessor_release_id": null,      // lineage within the release store
  "superseded_by": null,

  // ── DISPOSITION (mutable) — the honest part ─────────────────────────────
  "evaluation_disposition": "blocked", // not-triaged | queued | deferred | declined | blocked
  "disposition_reason": "No model API credential and no approved spend ceiling.",
  "disposition_ref": "BLK-002",        // blocker ID, decision ID, or incident ID. REQUIRED when
                                       //   disposition != not-triaged (K11).
  "disposition_set_at": "2026-09-10"
}
```

**`classification` → `product_scope`, a pure derived function (asserted, never authored):**

| `classification` | `product_scope` | May carry `registry_id`? |
|---|---|---|
| `new_model`, `named_update`, `silent_snapshot` | `model-index` | Yes |
| `configuration_change`, `policy_layer_change`, `new_deployment` | `deployed-ai-audit` | **No** (K8) |
| `incident` | `incident` | No |
| `non_material` | `none` | No |

This is the D-23 three-product boundary enforced at the point of data entry rather than at publication. A system-prompt change cannot become a Model Index row, because the field that would let it is structurally unavailable to that classification.

### 2.4 `meta` schema — where the empty state's honesty lives

```jsonc
{
  "meta": {
    "schemaVersion": "1.0",
    "storeVersion": "v1",
    "releaseCount": 0,                 // derived and asserted against releases.length (K1)
    "createdDate": "2026-09-10",
    "status": "empty",

    // ── Scan state. Without these five fields the empty array is a lie by omission. ──
    "lastScanId": null,
    "lastScanCompletedAt": null,       // ISO datetime of the last scan with status "completed"
    "coverageThrough": null,           // the end of the last FULLY-COVERED window. Advances ONLY
                                       //   on a completed scan meeting its source quorum (§2.7).
    "scanState": "never-scanned",      // never-scanned | current | stale | degraded — DERIVED (K2)
    "staleAfterDays": 14,              // declared here, not hardcoded in the page

    // ── The coverage claim, as data rather than as copy ──────────────────
    "coverageClaim": "none",           // none | partial | declared-sources
    "coverageClaimNote": "No release scan has ever run. This store's emptiness is evidence about
                          Compassion Benchmark's monitoring, not about the AI industry.",

    "sourceRegistryRef": "site/src/data/model-benchmark/release-sources-v1.json",
    "scanRecordRoot": "research/model-index/release-watch/",
    "validator": "site/scripts/lib/model-releases-validator.mjs",
    "cliValidator": "site/scripts/validate-model-releases.mjs",
    "note": "EMPTY — NO RELEASE SCAN HAS EVER RUN. 0 scans, 0 releases, 0 sources reached. This is
             not a store awaiting population by a step that already ran; it is a store whose first
             step is blocked (BLK-001 / INCIDENTS.md INC-008). Do NOT add a row from memory,
             training data, or a provider's marketing page. A row requires an existing scan record
             in scanRecordRoot and evidence meeting the registry's five-field bar."
  }
}
```

`scanState` derivation (build-time, never authored):

```
never-scanned   lastScanCompletedAt === null AND no scan record has status "completed"
degraded        the newest scan record has status "aborted" | "not-run"
stale           now - lastScanCompletedAt > staleAfterDays
current         otherwise
```

### 2.5 The release → registry state machine

A **release** is a claim about the world: *this shipped, and here is dated third-party-checkable evidence.*
A **registry entry** is a claim about our instrument: *we have frozen an identity we can test and cite.*
A **result** is a claim about a measurement: *we tested it, two humans rated it, and a human authorised publication.*

Three different claim classes, three different stores, three different mutability rules.

```
        ┌──────────────┐
        │  (no record) │
        └──────┬───────┘
               │ T1  scan detects; evidence meets the 5-field bar; confirmation_status=confirmed
               ▼
        ┌──────────────┐
        │   detected   │──── T2 ───► out-of-scope   (classification ∈ {non_material, incident},
        └──────┬───────┘                             or product_scope != model-index)
               │ T3  second independent source, or a primary provider source
               ▼
        ┌──────────────┐
        │  confirmed   │──── T7 ───► superseded     (a later release_id supersedes this one)
        └──────┬───────┘
               │ T4  ** HUMAN MERGE ** a registry entry is created and passes
               │      validateRegistryState + validateRegistryTransition
               ▼
        ┌──────────────┐
        │  registered  │   registry_id now non-null
        └──────┬───────┘
               │ T5  a locked run summary exists for that registry_id
               ▼
        ┌──────────────┐
        │  evaluated   │
        └──────┬───────┘
               │ T6  a result carries publication.authorized_by (a human name)
               ▼
        ┌──────────────┐
        │  published   │
        └──────────────┘

        retracted  ◄──── from any state, with disposition_ref naming the decision
```

**Transition rules, each mechanically checkable:**

| # | Transition | Who | Precondition asserted by |
|---|---|---|---|
| T1 | → `detected` | scan agent (PR, never direct push) | K3, K9, K10, K13: evidence complete, `detected_in_scan` resolves, `confirmation_status: confirmed` |
| T2 | → `out-of-scope` | scan agent or human | K7, K8: derived `product_scope` ≠ `model-index` |
| T3 | `detected` → `confirmed` | human | ≥ 2 evidence entries, or 1 with `publisher === developer` (a primary provider source) |
| T4 | `confirmed` → `registered` | **human merge only** | K6: `registry_id` resolves; K4/K5: id relationship holds. The registry's own append-only transition check runs independently. |
| T5 | `registered` → `evaluated` | generator | a `runs/<run_id>.summary.json` exists naming that `registry_id` |
| T6 | `evaluated` → `published` | **human only** | a result with non-empty `publication.authorized_by` |
| T7 | → `superseded` | human | `superseded_by` resolves to an existing `release_id` |

**Invariants that make "relate without merging" structural rather than stylistic:**

- **INV-1 — No automatic promotion.** Nothing in the build, in a workflow, or in a script may write to `registry-v1.json`. The only path is a human-merged pull request, gated by `validateRegistryTransition` against git `HEAD` — which already exists and already works. A release row is an *input to a human decision*, never a trigger.
- **INV-2 — Orphan registration is legal and visible.** A registry entry may exist with no release row (e.g. registered from direct evidence before any scanner existed). The validator **warns**, never fails, and names the entry. Failing would make the registry hostage to the scanner, which is blocked on a founder-owned config change.
- **INV-3 — Opposite mutability, enforced separately.** `registry-v1.json` is append-only with 17 frozen fields and no deletions. `releases-v1.json` is append-only *in rows* but has a mutable lifecycle band. So it gets its own transition validator, `validateReleaseTransition(prior, next)`, with its own frozen set:
  - **Frozen:** `release_id, developer, family, snapshot_label, snapshot_precision, announced_date, classification, product_scope, materiality_basis, tracked_since, detected_in_scan, detection_method, evidence`
  - **Mutable:** `lifecycle, registry_id, id_resolution, predecessor_release_id, superseded_by, evaluation_disposition, disposition_reason, disposition_ref, disposition_set_at, confirmation_status` (forward only: `confirmed` may never revert)
  - **Append-only growable:** `evidence` grows (T3 adds a corroborating source) — so it is frozen *per element* rather than as an array. Rule: every prior evidence element must still be present and unchanged; new elements may be added. Same shape as the registry's `test_dates` rule.
- **INV-4 — Lifecycle claims require the artifact they claim.** `registered` requires a resolving `registry_id`; `evaluated` requires a run summary; `published` requires an authorised result. Today, checks for `evaluated` and `published` have **nothing to check against** — the `runs/` and `results/` trees do not exist. The validator must print *"check skipped: no runs tree exists"* rather than passing silently. `validate-product-separation.mjs` check 4's self-reported "VACUOUS PASS" is the precedent, and the reason it is a good one: a check that has verified nothing must say so.
- **INV-5 — The stores are never joined at build time into a third file.** No `release-watch.json` generated artifact merging the two (the prior architecture doc proposed one; it is withdrawn here). The page reads both files and renders them as two labelled facts per row: *what shipped* and *what we have measured*. A merged artifact would make the two claim classes indistinguishable downstream, which is exactly what the design is preventing.

### 2.6 Scan record schema — `research/model-index/release-watch/<scan_id>.json`

This is the artifact that makes honest coverage possible and the degraded path implementable.

```jsonc
{
  "scan_id": "scan-2026-09-10-001",
  "status": "completed",          // started | completed | aborted | not-run
  "started_at": "2026-09-10T09:00:00Z",
  "ended_at": "2026-09-10T09:41:00Z",
  "window": { "from": "2026-09-02", "to": "2026-09-10" },
  "method": "search",             // search | source_fetch | manual | mixed
  "budget": {
    "tool": "WebSearch",
    "calls_allowed": 270,
    "calls_used": 268,
    "exhausted": false            // true → status MUST be "aborted" (K16)
  },
  "sources_planned": ["src-anthropic-news", "src-openai-changelog", "…"],
  "sources_reached":  ["src-anthropic-news", "…"],
  "sources_failed":   [{ "source_id": "src-x", "reason": "http-503" }],
  "quorum": { "required": 12, "reached": 12, "met": true },   // see §2.7
  "candidates": [ /* raw, INCLUDING rumours and non_material — this is the only place they live */ ],
  "promoted_release_ids": ["anthropic--claude--unspecified-2026-09-10"],
  "abort_reason": null,           // required when status="aborted"
  "blocked_by": null              // required when status="not-run" (e.g. "BLK-001")
}
```

**Write-before and write-after.** The scan writes `status: "started"` with its plan *before* it does any work, and finalises afterwards. A scan killed mid-flight leaves a `started` record, which the validator reports as an unfinalised scan. The 2026-09-06 attempt that wrote nothing at all was correct behaviour under the current design and is still the worst available outcome; under this design it writes a `not-run` record with `blocked_by: "BLK-001"`, which is strictly better because it is evidence.

### 2.7 The degraded path, designed explicitly

INC-008 is not an outage to route around; it is a **standing property of the detection input**. The design assumes the search budget is unavailable and treats availability as an upgrade.

**Degradation ladder, highest to lowest:**

| Level | Method | Search budget | Coverage claim it can support |
|---|---|---|---|
| **L0** | Full search scan across the source registry plus open search for unlisted providers | ~270 calls | `partial` (open search is never exhaustive; do not claim otherwise) |
| **L1** | **Source-registry fetch.** Enumerate `release-sources-v1.json` and retrieve each declared URL directly. No search tool at all. | **0** | `declared-sources` — the strongest *honest* claim available, and the only one that is verifiable |
| **L2** | Manual entry. A human supplies a URL; the agent completes the evidence record and hashes the retrieved content. | 0 | Contributes rows; contributes **no** coverage |
| **L3** | No detection. Write a `not-run` scan record naming the blocker. | 0 | None. `scanState` becomes `degraded`. |

**L1 is the architecturally important level, and it should be built before any scanner.** A declared source registry converts detection from *open-ended search* (capped, nondeterministic, expensive, unverifiable) into *enumerable retrieval* (uncapped, deterministic, cheap, and auditable — a reader can check the list). It reduces dependence on the capped tool by design rather than by retry.

```jsonc
// site/src/data/model-benchmark/release-sources-v1.json
{
  "meta": { "schemaVersion": "1.0", "sourceCount": 0, "quorumRequired": null,
            "note": "EMPTY — no source has been registered. A source is added by a human from a
                     verified URL, never inferred." },
  "sources": [
    { "source_id": "src-<provider>-<type>", "provider": "…",
      "source_type": "announcement|model_card|system_card|api_changelog|model_registry|repository|
                      product_release_notes|status_feed|incident_report",
      "url": "https://…", "tier": "primary|secondary",
      "added_at": "…", "added_by": "…", "last_retrieved_at": null,
      "retrieval": "http-get", "content_selector": null, "notes": "…" }
  ]
}
```

**Coverage quorum.** `meta.quorumRequired` is the number of **tier-1 primary** sources that must be reached for a scan to count as covering its window. `coverageThrough` advances **only** when `status === "completed"` and `quorum.met === true`. Consequences, all of them desirable:

- A degraded scan still produces release rows (a confirmed release from a reached source is valid evidence regardless of whether the scan finished — this is the fix for the 09-03 failure, where 150 genuine Tier-1 searches were quarantined wholesale).
- A degraded scan **cannot** advance the coverage claim. Data and coverage move independently.
- `coverageThrough` is therefore a number the institution can defend line by line.

**Hard rule: degradation lowers coverage, never evidence.** Every level requires the same five-field evidence, the same `confirmation_status: confirmed`, and the same resolving `detected_in_scan`. There is no "we were rate-limited so we wrote it from memory" path, and the validator makes that path fail rather than merely discourage it.

---

## 3. Validator design and wiring

### 3.1 Structure — copy the proven three-file pattern exactly

| File | Role | Precedent |
|---|---|---|
| `site/scripts/lib/model-releases-validator.mjs` | Pure logic. No I/O, no `process.exit`. Exports `validateReleaseStore(store, opts)` and `validateReleaseTransition(prior, next)`. | `lib/model-registry-validator.mjs`, `lib/task-bank-validator.mjs`, `lib/product-separation.mjs` |
| `site/scripts/validate-model-releases.mjs` | Thin CLI. Loads real files, runs shared logic, prints a report, sets exit code. Attempts the `git show HEAD:` transition check opportunistically and reports SKIPPED when unavailable. | `validate-model-registry.mjs` (copy its structure verbatim, including the opportunistic git diff) |
| `site/scripts/test-model-releases.mjs` | Fixture suite against the pure module. Every check has a passing and a failing fixture. | `test-model-registry.mjs`, `test-product-separation.mjs` |

**Shared imports, not re-declarations:** `slugify`/`computeRegistryId` and `REQUIRED_EVIDENCE_STRING_FIELDS` come from `lib/model-registry-validator.mjs`. If the registry's evidence bar or slug rule changes, the release store follows automatically. A second copy is how two definitions of "canonical" appear in one repo.

### 3.2 Inputs

```
site/src/data/model-benchmark/releases-v1.json        (required — the subject)
site/src/data/model-benchmark/registry-v1.json        (required — FK target)
site/src/data/model-benchmark/release-sources-v1.json (optional — warn if absent)
research/model-index/release-watch/*.json             (optional — warn if absent; FK target)
.benchmark-ops/RELEASE_WATCH.md                       (optional — scan-count reconciliation only)
```

Missing optional inputs downgrade the affected checks to **SKIPPED, reported by name**, never to silent pass.

### 3.3 Checks

| # | Check | Severity |
|---|---|---|
| K1 | Top-level shape (`meta`, `releases[]`); `meta.releaseCount === releases.length`; **an empty store passes cleanly**, exactly as `validateRegistryState` does for an empty registry | FAIL |
| K2 | `meta.scanState` equals its derivation from the scan records and `staleAfterDays` | FAIL |
| K3 | Every release has all required fields; enums valid (`classification`, `snapshot_precision`, `lifecycle`, `evaluation_disposition`, `detection_method`, `confirmation_status`) | FAIL |
| K4 | `release_id` equals its derivation; unique across the file; when `snapshot_precision === "exact"` and `registry_id` is non-null, `registry_id === release_id` | FAIL |
| K5 | `registry_id !== release_id` requires non-null `id_resolution` with all three fields | FAIL |
| K6 | Every non-null `registry_id` exists in `registry-v1.json` | FAIL |
| K7 | `product_scope` equals its derivation from `classification` | FAIL |
| K8 | `product_scope !== "model-index"` ⇒ `registry_id === null` (the three-product boundary) | FAIL |
| K9 | `evidence[]` non-empty; every element has the five registry fields; `archive_or_hash` matches `^sha256:[0-9a-f]{64}$` or a recognised archive-URL pattern; `retrieved_at` is a valid ISO datetime not in the future | FAIL |
| K10 | No release carries `confirmation_status: "rumour"` — rumours live only in scan records (`RELEASE_WATCH.md` invariant) | FAIL |
| K11 | `evaluation_disposition !== "not-triaged"` ⇒ non-empty `disposition_reason` **and** `disposition_ref` | FAIL |
| K12 | Every `detected_in_scan` resolves to a scan record file whose `promoted_release_ids` contains this `release_id` (bidirectional) | FAIL when the scan tree exists; SKIPPED with a named reason when it does not |
| K13 | `tracked_since >= announced_date`, and both are valid ISO dates not in the future | FAIL |
| K14 | Lifecycle preconditions (INV-4): `registered` ⇒ K6; `evaluated` ⇒ a run summary exists; `published` ⇒ an authorised result exists. **Reports explicitly as a vacuous/skipped check while `runs/` and `results/` do not exist.** | FAIL when checkable; SKIPPED-and-announced otherwise |
| K15 | Transition vs git `HEAD`: no frozen field changed; no release removed; no evidence element removed or altered; `confirmation_status` never reverts | FAIL (SKIPPED when no committed prior exists) |
| K16 | Scan-record internal consistency: `budget.exhausted ⇒ status === "aborted"`; `status === "aborted" ⇒ abort_reason`; `status === "not-run" ⇒ blocked_by`; `coverageThrough` only ever derived from a `completed` scan with `quorum.met` | FAIL |
| K17 | Registry entries with no corresponding release row (orphan registration, INV-2) | **WARN** |
| K18 | `scanState ∈ {stale, degraded, never-scanned}` | **WARN** — never a failure; see §3.4 |
| K19 | Scan count in `.benchmark-ops/RELEASE_WATCH.md` matches the scan record file count (D-11's derived-log-lags-directory defect) | **WARN** |

### 3.4 npm wiring — and the one place the proposed contract's instinct needs adjusting

```jsonc
"validate:model-releases": "node scripts/validate-model-releases.mjs",
"test:model-releases":     "node scripts/test-model-releases.mjs",

"test":  "… && npm run test:model-releases && npm run validate:model-releases && …",

"build": "node scripts/validate-indexes.mjs && node scripts/validate-product-separation.mjs
          && node scripts/validate-model-releases.mjs && node scripts/lint-daily-briefings.mjs && …"
```

Place `validate-model-releases.mjs` immediately after `validate-product-separation.mjs` in `build` — before `build-manifest.mjs` and `next build`, so a malformed store fails before any artifact is generated from it.

**The adjustment: staleness must never fail the build.** The proposed contract says "wired into `npm run build` like the separation validator," which is right for *data integrity* and wrong for *operational freshness*. Detection is blocked on BLK-001, a founder-owned environment configuration. If `scanState: stale` or `degraded` were blocking, every deploy of every unrelated page — a briefing, a typo fix, a new index row — would be blocked by a condition no engineer can clear. That is how a guard gets disabled permanently, which is the failure mode D-23/S9 built the expiring-waiver mechanism to avoid.

So: **K18 is a warning that the build prints loudly and the page renders as a visible fact.** Staleness becomes publicly embarrassing rather than privately blocking, which is both the honest treatment and the one more likely to get fixed.

Contradictions between the store and the scan records (K12, K16) are **failures**, because those are integrity defects an engineer can fix immediately.

### 3.5 The page, and the constraints it inherits

`/ai-models/releases` — one static page, no dynamic segment, no `generateStaticParams`.

**Must NOT ship, inherited from D-29 and extended:**

- No per-release route. No `/ai-models/releases/[releaseId]`. A release row is not a page, and every row-is-a-page pattern over an unevaluated entity is the doorway pattern D-29 names.
- No score column, no band, no composite, no rank — in any state, including after results exist. A release row shows *what shipped* and *what we have measured*, never a number.
- No `Dataset` or `ItemList` JSON-LD while `releaseCount === 0`. Same reasoning as D-29: an empty Dataset advertising zero entities is a machine-readable non-thing.
- No "we track every model release", "continuously monitored", "up to date", or "comprehensive". The store's `coverageClaim` field is the only permitted source of a coverage statement, and it currently reads `"none"`.
- No commercial CTA on this page while `coverageClaim === "none"`. Reuse the `stage !== "published"` no-Gumroad-URL build assertion from `ARCHITECTURE_MODEL_BENCHMARK.md` §7.3, keyed on `coverageClaim` instead.

**The honest empty state — what it renders, all derived:**

| Rendered fact | Source |
|---|---|
| **"No release scan has ever run."** as the lead, not "0 releases tracked" | `meta.scanState === "never-scanned"` |
| Scans completed: **0** · Sources registered: **0** · Releases recorded: **0** | scan record count, `release-sources-v1.json`, `releases-v1.json` |
| Coverage through: **never** | `meta.coverageThrough` |
| Why: BLK-001 / INC-008 — the session WebSearch budget was exhausted at 2000/2000 and three scan attempts failed on 2026-09-02, 09-03 and 09-06 | `.benchmark-ops/BLOCKERS.md` |
| What we will do instead: the declared-source path (L1) needs no search budget and is the next build step | §2.7 |

**What a reader must NOT be able to infer from the empty tracker — stated on the page in plain words, because inference is the actual risk:**

1. **That no models shipped.** Many did. This store is evidence about Compassion Benchmark's monitoring, not about the industry.
2. **That Compassion Benchmark monitors releases today.** It does not. Zero scans have run.
3. **That a developer's absence means anything about that developer.** Absence from an empty list is not a finding, not a neutral rating, and not a data point.
4. **That any model is "current" or "up to date" with respect to this benchmark.** Nothing is, because nothing has been evaluated.
5. **That the row count is a denominator.** No coverage ratio, no "N of M releases evaluated", no percentage, anywhere — a percentage requires a denominator the institution does not possess.
6. **That an empty tracker implies a fast pipeline once it fills.** It does not; evaluation is gated on BLK-002 and BLK-005, and the human rating stage is not automatable at release cadence (two independent blinded raters, BLK-005).

Once rows exist, the stale/degraded banner is **not** dismissible and renders the age of the newest completed scan on every visit. The precedent is INC-002: between 2026-08-16 and 08-19 production served stale scores across six pushes with every health check green, because a static export baked into a Docker image restarts happily and serves stale data. A release tracker is the single most staleness-sensitive surface the site will have, so its freshness must be a rendered fact rather than an operational assumption.

**Deploy freshness (carried forward from `ARCHITECTURE_MODEL_BENCHMARK.md` §3.6, still open):** the deploy workflow's only real staleness assertion compares `updates/manifest.json`'s `.latest` against the live `/updates/feed.json`. A commit that changes only the release store changes no briefing date, so the assertion compares an unchanged value, passes, and cannot detect a cached-layer stale deploy. Extend it to assert on a content hash over `releases-v1.json` + `meta.scanState`, exported to a small generated file under `site/public/data/`. Without this, the first release-only deploy reproduces INC-002 exactly.

---

# PART 2 — BRING-YOUR-OWN-MODEL SCORING

## 4. Component choice

### 4.1 Decision: a local MCP server, distributed from this repo. Optionally wrapped by a Claude Skill.

```
tools/cb-judge-mcp/          # new top-level tool package, NOT inside site/ and NOT inside worker/
  package.json               # MCP SDK only; no provider SDK, no HTTP client
  src/server.mjs             # tool registration + stdio transport
  src/bank.mjs               # reads site/src/data/model-benchmark/tasks-v1.json — one bank, no copy
  src/projection.mjs         # enforces meta.fieldSeparationPolicy mechanically
  src/estimate.mjs           # the JudgeEstimate artifact writer
  src/contamination.mjs      # the exposure probe
  src/validate-estimate.mjs  # pure validator for the artifact schema
  tests/                     # fixtures + the no-fetch scan + the vocabulary-ban scan
  README.md                  # install, data handling, and what this is not
```

### 4.2 Why: four reasons, in order of decisiveness

**1. A hosted endpoint is already forbidden by ratified design.**
`MODEL_EVALUATION_HARNESS_DESIGN.md` §7.2: *"There must be no code path by which user-submitted text enters a run. No public endpoint, no form, no API, no 'try it with your own prompt.'"* and *"The harness is never exposed as a service. It is a local batch tool. No hosted endpoint, no Worker route, no public runner."* Any Worker-hosted BYO scoring endpoint contradicts both sentences directly. This is not a tradeoff to weigh; it is a rule to comply with or explicitly supersede via a decision entry.

**2. The MCP design has no API key, because the host model is the judge.**
This is the structural insight that makes everything else easy. In an MCP architecture the user's own client (Claude Code, Claude Desktop, or any MCP host) already holds the credential and already runs the model. The server hands out prompts and rubrics and accepts back a structured judgment. **It never sees, stores, transmits, or requests an API key — there is no key-custody problem to solve, because there is no key in the design.**

Every alternative *adds* a credential-handling surface: a Worker endpoint needs either CB's key (CB pays for user scoring, unbounded) or the user's key in transit through commercial-plane infrastructure; a browser plugin needs the key in extension storage; an in-page BYO mode needs it in page context on a static site with no CSP nonce infrastructure. Eliminating a class of vulnerability beats mitigating it.

**3. The Worker is the wrong plane, and its own header says so.**
`worker/src/index.ts` opens with an explicit independence safeguard: *"This Worker has NO GitHub token and NO write path to the VPS filesystem. It cannot modify scores, assessments, or change proposals. It is purely commercial-plane infrastructure."* Routing benchmark-adjacent scoring through it would put research-plane behaviour into the plane deliberately built to be unable to touch research. Further: users will paste real distress text into a tool built around crisis-adjacent items. A Worker endpoint turns that into inbound third-party content with retention, logging, jurisdiction and duty-of-care obligations, on infrastructure whose current storage is a KV namespace holding email subscriptions. That is a category change in the institution's data-protection posture to serve a self-serve estimate tool.

**4. Static export means the site simply has no place to put it.**
`next.config.ts` `output: 'export'` (D-01); D-04 defers a backend. Nothing server-side runs on the web host. Adding server-side BYO scoring means either a new runtime on the VPS (changing the Docker/Nginx deployment story, D-03) or expanding the Worker (reason 3). Local MCP avoids the question entirely — the deployment story is unchanged because there is nothing to deploy.

### 4.3 Rejected alternatives

| Option | Verdict | Why |
|---|---|---|
| **Cloudflare Worker endpoint** | **Rejected** | Violates harness §7.2 twice over. Breaks the Worker's stated commercial/research plane isolation. Creates key custody, crisis-content retention, abuse/rate-limiting and unbounded-cost surfaces. Makes judge output a server-side artifact on CB infrastructure — the strongest possible signal to a reader that it is official. |
| **Browser extension / plugin** | **Rejected** | Requires the user's API key in extension storage (a standing exfiltration target). Store review cycles put version control of the item bank outside the repo, so the tool drifts from `tasks-v1.json` silently. Content-script permissions are a large ask from an institution whose product is trustworthiness. No repo-native test path. |
| **In-page client-side BYO** (browser calls the provider directly) | **Rejected** | Key in page context on a statically-exported site; provider CORS and ToS problems; and it places a judge estimate on the same domain, in the same visual language, adjacent to the index — the exact merge-by-layout failure `ARCHITECTURE_MODEL_BENCHMARK.md` S4 exists to prevent. |
| **Claude Skill alone** | **Rejected as the primary artifact, accepted as an optional wrapper** | Single-vendor, which contradicts "score using *your own* AI model". A skill is instructions, not a typed contract: nothing mechanically enforces the field-separation projection, the artifact schema, the vocabulary ban, or the local-write boundary. Worth shipping as a thin wrapper over the MCP server for ergonomics, once the server exists. |
| **A `byo` adapter in the existing harness** | **Rejected** | The harness reads from a versioned bank and nothing else (§7.2). A user-supplied response entering `core/run-record.mjs` would be indistinguishable from a real trial at the storage layer — the precise structural confusion this design must prevent. The harness and the judge tool share the *bank* and nothing else. |

### 4.4 MCP tool surface

Tool names are deliberately outside official vocabulary (§5.1). No tool is named `score`, `evaluate`, `rate`, `benchmark`, or `composite`.

| Tool | Returns | Notes |
|---|---|---|
| `list_probe_items({ dimension?, include_unreviewed?, include_sensitive? })` | Item IDs, dimension, title, and **`prompt` only** | Field-separation projection (§6.2). `include_sensitive` defaults false and gates `ACT-1-A`, `ACT-5-A`, `ACT-5-B`, `EMP-1-B`, `EMP-1-C`, matching harness §7.2. `include_unreviewed` defaults false and excludes the 5 `draft-authored-unreviewed` items. |
| `get_anchors({ item_id })` | The five rubric anchors | Safe to return: already `exposureStatus: public-permanent`. |
| `open_judge_session({ subject_label, judge_model_label })` | `session_id` | Both labels are **self-reported strings**, stored as such, never verified, and marked `self_reported: true` in the artifact. |
| `record_item_estimate({ session_id, item_id, response_text, rating_1_5, rationale })` | Validation result | Stores verbatim to the local root. Rejects `rating_1_5` outside 1–5 and rejects items excluded by session flags. |
| `run_exposure_probe({ session_id, item_ids })` | Per-item recall and rubric-leak indications | §7.2. |
| `summarise_judge_session({ session_id })` | The `JudgeEstimate` artifact | **Emits no composite and no band** (§5.2). |
| `explain_what_this_is_not()` | The full separation statement | A tool rather than a README line, so the host model can retrieve and cite it in its own output. |

**Tools that must never exist**, listed so a future contributor reads the omission as deliberate: anything writing under `site/` or `research/`; anything performing network I/O; anything comparing two sessions; anything returning an official score, band, rank, or registry row; anything accepting an API key.

---

## 5. Structural separation — different types, different storage, different vocabulary

The requirement is that a judge result cannot be mistaken for, or promoted into, an official score **by accident**. Labels do not achieve that; the existing `/ai-evaluation-suite` proves it (§5.4). Five mechanisms, each a thing that fails a test rather than a thing a reviewer must remember.

### 5.1 J1 — Two-way vocabulary ban

| Concept | Official term (index side) | Judge term (tool side) |
|---|---|---|
| the artifact | `result` | `estimate` |
| the number | `composite` | *(none — see J2)* |
| the label | `band` | `indication` |
| the identity | `registry_id`, `result_id` | `estimate_id`, `session_id` |
| the item set | `form`, `cohort` | `probe_set` |
| the act | `evaluation`, `run`, `trial` | `judge session`, `pass` |
| the rater | `rater`, `adjudicator` | `judge model` |
| the state | `published`, `authorized` | `local`, `unpublished` (the only two) |

Enforced **in both directions** by a fixture test:
- The `JudgeEstimate` schema must contain **none** of `composite`, `band`, `registry_id`, `result_id`, `rank`, `publishable`, `authorized_by`, `cohort`, `run_id`.
- The official validators (`model-registry-validator.mjs`, and `model-result-validator.mjs` when it exists) must **fail** any record containing `estimate_kind`, `judge_model`, `session_id`, or `indication`.

One-way labelling lets a judge artifact be renamed into an official one. Two-way banning means both sides reject the other's shape.

### 5.2 J2 — The judge tool is structurally incapable of producing a composite

This is the strongest single mechanism, and it is a design choice rather than a restriction.

- `tools/cb-judge-mcp/` **never imports** `site/src/lib/scoring.ts`, `scripts/lib/scoring.mjs`, or `evaluation-scorer.ts`. Enforced by an import scan in the tool's own test suite.
- The `JudgeEstimate` schema **has no field** in which a 0–100 number could be stored. Not `null`, not optional — absent. There is nowhere to put one.
- The artifact emits per-item `rating_1_5` values and, at most, a per-dimension arithmetic mean of those ratings with its `n` printed beside it. That is all.

This also happens to be the honest position. With 1–2 scorable items in the thinnest dimensions, zero human-validated items, a single non-blinded judge, one pass per item, and a fully published answer key, a 0–100 composite is not a quantity that exists. Refusing to emit one is not caution; it is correctness.

**Consequence worth stating plainly:** a user cannot screenshot "Claude: 72.4 — Established" from this tool, because the tool cannot produce that string. Identical formatting on adjacent surfaces *is* the merge, regardless of the caption — the reasoning behind the `<Score>` primitive in `ARCHITECTURE_MODEL_BENCHMARK.md` S4, applied here by removing the number rather than by styling it differently.

### 5.3 J3 — Storage separation, and the promotion-proof property

- The default write root is `~/.compassion-benchmark/judge-estimates/`, **outside any git repository**.
- The server **refuses to start** with a write root that resolves inside a directory containing a `.git` folder, or inside the CB repo working tree. Checked at startup with a resolved-path walk, not a string match.
- `.gitignore`: `*.judge-estimate.json` and `**/judge-estimates/`.
- `npm test` gains a scan asserting no file matching the judge artifact signature (`"artifact_kind": "judge-estimate"`) exists anywhere under `site/src/data/` or `research/`.

**The promotion-proof property, stated as a testable assertion:** *no file under `site/` or `research/scripts/model-harness/` reads, parses, imports, or references a judge estimate.* A source scan asserts it, with a single allowlisted exception for the disclosure page's copy. This is the actual guarantee. It is not "we labelled the artifact clearly" — it is "there is no code path that can consume it," so accidental promotion requires someone to write new code, which is a reviewable event.

### 5.4 J4 — The existing `/ai-evaluation-suite` is inconsistent with this rule, and that must be resolved

`EvaluationScorer.tsx` today **does** emit a 0–100 composite, the five institutional band names, an integration premium, and the string `"Canonical formula: computeCompositeFromDimensions (site/src/lib/scoring.ts)"` — all under an `official: false` flag and a well-written disclaimer.

It is carefully labelled. But it is the disclaimer-based approach, and shipping a second self-serve tool under a stricter structural rule leaves the institution running two different honesty standards for the same class of output — the same asymmetry D-13 is criticised for (a rule enforced against newcomers, grandfathered for incumbents).

**Recommendation:** converge `/ai-evaluation-suite` to the J2 rule — emit per-item ratings and per-dimension means with `n`, withhold the composite and the band. This is a small, contained change to one component's export builders and dashboard block, and it is the highest-value credibility repair available on the existing surface. Flagged as **AMB-B**; it is a product decision, not an architectural one, so it is recommended rather than assumed.

### 5.5 J5 — Mandatory artifact header

Every `JudgeEstimate`, in every rendering (JSON, Markdown, clipboard text), leads with a block the writer cannot omit — it is constructed by the writer function, not supplied by the caller:

```jsonc
{
  "artifact_kind": "judge-estimate",
  "official": false,
  "is_index_entry": false,
  "publishable_as_a_compassion_benchmark_score": false,
  "comparability": "none",
  "what_this_is": "A self-serve estimate produced by one AI model rating another model's pasted
                   output against published rubric anchors. One judge. One pass. No blinding.",
  "what_an_official_score_requires": [
    "two independent human raters, blinded to model identity (BLK-005)",
    "adjudication of disagreements",
    "repeated trials (>= 3) from a frozen, registry-recorded snapshot",
    "an unpublished item pool, because the public pool's answer keys are published",
    "human publication authorisation recorded in PUBLICATION_LEDGER.md"
  ],
  "exposure_warning": "All 33 items are published with full rubrics and have been on the open web
                       for months. A judge model may have memorised both the items and the target
                       behaviours. This estimate mixes behaviour with memorisation and cannot
                       separate them.",
  "duty_of_care": "Describes behaviour on crisis-adjacent test items. Not guidance about which AI
                   system to use in a crisis.",
  "subject_label_self_reported": true,
  "judge_model_label_self_reported": true
}
```

`comparability: "none"` is a schema constant, not a computed value, and the tool provides no way to compare two estimates (§4.4). The claim the field makes is one the tool structurally cannot contradict.

---

## 6. Security and trust boundaries

### 6.1 Trust model in one line each

| Party | Trusted for | Not trusted for |
|---|---|---|
| **CB item bank** (`tasks-v1.json`, repo-controlled) | Item text, rubric anchors, exposure flags | — |
| **User-pasted model output** | Nothing. Opaque data. | Instructions, formatting, claims about itself |
| **The host model (the judge)** | Producing a rating the user asked for | Being uncontaminated, unbiased, or accurate |
| **User-supplied labels** (`subject_label`, `judge_model_label`) | Nothing. Recorded verbatim, marked self-reported. | Identifying what model actually produced the output |
| **The MCP server** | Projection, validation, local writes | Any network action — it has none |

### 6.2 User-supplied content

- **Prompt injection is in scope and is the host's problem, not the server's.** Pasted output may contain instructions aimed at the judge model. The server's mitigation is that it has nothing worth capturing: no network egress, no arbitrary-path write, no shell, no credential, no repo access. A successful injection can, at worst, cause the judge to record a wrong rating in the user's own local file. That is an acceptable blast radius and should be documented as the explicit boundary rather than implied by absence.
- **`response_text` is stored verbatim and never interpreted.** No parsing for commands, no templating, no evaluation. It is delimited when the artifact is rendered and never concatenated into a tool description.
- **Zero network egress, enforced by test.** The tool package contains no `fetch`, no `http`/`https` import, no provider SDK — asserted by a source scan, exactly as `adapters/replay.mjs` asserts *"This file contains no `fetch` call and never will."* Precedent exists in `npm run test:model-harness`.
- **Field separation enforced mechanically, not by convention.** `projection.mjs` implements `tasks-v1.json` `meta.fieldSeparationPolicy` as a **whitelist**: only `prompt` and `variants[].prompt` can cross to the model. Evaluator-facing fields (`criticalHarmRules`, `sourceOnlyFields`, `conversationState`, `userContext`, `reviewers`, `promptIntegrity`, `supersedes`, `reviewRequired`) are structurally unreachable. A whitelist fails closed when the bank adds a field; a denylist fails open. This directly re-prevents the AWR-2-A defect, where an answer key was written into a model-facing prompt (RISK-018).
- **Sensitive items are opt-in per session, never bulk, never default** — harness §7.2 applied unchanged.

### 6.3 Crisis content — the largest real risk in Feature 2

Users will paste real distress text into a tool built around crisis-adjacent items. Some of it will be their own or someone else's.

1. **It never leaves the user's machine.** No egress, no telemetry, no analytics, no crash reporting.
2. **It is written only under the user's local root**, in files the user owns and can delete; the server prints the exact path on session open.
3. **A data-handling notice prints on every session open**, before the first item is served, stating (1) and (2) and that the user's own model provider will see whatever the user sends it.
4. **The duty-of-care exclusion from D-29 is carried into the tool's output and its README**, verbatim in substance.
5. **No identity fields.** No name, email, org, or session telemetry is collected, so there is nothing to breach.
6. **Recommended deletion affordance:** a documented `rm -rf ~/.compassion-benchmark/judge-estimates/<session_id>` and a note that CB holds no copy and cannot delete anything on the user's behalf, because it never had it.

### 6.4 User-supplied API keys

**The primary architecture has none, and that is the security property.** Stated positively in the README so users understand there is no key to protect.

If a future direct-provider mode is added (not recommended; it reintroduces every problem MCP removes):

- Key read from an OS environment variable at process start; never written to disk, never echoed, never included in an artifact, never passed as a CLI argument (argv is visible to other processes).
- A redaction pass over every artifact before write, reusing the semantics of `research/scripts/model-harness/core/redact.mjs`, with a fixture test proving a planted key is removed.
- Hard rule: a request body or headers are never persisted. The harness's existing invariants (`prompt_text_included`, no `raw_response_body`, no `request_sent`) apply.
- This mode requires its own decision entry. It is not covered by the D-31 proposed in §8.

### 6.5 Supply chain and repo boundary

- Dependencies: the MCP SDK, pinned to an exact version. Nothing else. No provider SDK — grep-asserted, mirroring the harness design's verification that `site/package.json` and `worker/package.json` contain zero matches for `openai|anthropic|@google|groq|ollama|generative-ai`.
- No `postinstall` script in the tool package.
- Initial distribution from a git ref or a local path, not npm. An npm package name is a brand surface and a supply-chain target; defer until there is a reason.
- **No git access, no write path into `site/` or `research/`** — the same independence safeguard the Worker states about itself, applied to the tool and asserted by the write-root check in J3.

---

## 7. Item exposure and judge-model memorisation

All 33 items are `pool: "core-public"`, `exposureStatus: "public-permanent"`, published with full five-anchor rubrics. The bank's own note calls them *"permanently burned for any blinded use."* A judge model may have memorised the items, the target behaviours, or both.

**The answer is both — measure and disclose — with a hard line at adjustment.**

### 7.1 Disclose (always, unconditional)

- The artifact header carries `exposure_warning` verbatim (§5.5), non-removable.
- The artifact carries a derived `item_exposure` block: `{ public_permanent: 33, total: 33, pool: "core-public", bank_version: "v1.1" }`, computed from the bank at run time, never hardcoded (D-29's derive-counts-from-files rule).
- `comparability: "none"` is a schema constant, and no comparison tool exists.
- `/ai-models` already states this in its FAQ — *"a score on this public pool therefore measures some mixture of behaviour and memorisation, with no way to separate them"*. The tool restates it in-band so it travels with the artifact rather than staying on the website.

### 7.2 Measure (a real probe, cheaply, locally)

`run_exposure_probe` performs two mechanical checks that require no extra infrastructure and no credential beyond the one the user already has:

**Probe A — item recall.** Present the first N tokens of an item's `prompt` and ask the judge to continue it. Compare the continuation to the true remainder by normalised token overlap. High-fidelity reproduction of an item the model was never shown in full is direct evidence of memorisation of the bank.

**Probe B — rubric leak.** Without showing the anchors, ask the judge to state the expected target behaviour for the item, then compare to the published level-5 anchor. Above-chance agreement indicates the *target behaviour*, not merely the item, is memorised — which is the more damaging of the two, because it is exactly what the judge is being asked to apply.

Reported as:

```jsonc
"exposure_probe": {
  "probe_version": "1.0",
  "bank_version": "v1.1",
  "items_probed": 8,
  "recall_indication":     { "mean_overlap": 0.00, "n": 8, "method": "normalised-token-overlap" },
  "rubric_leak_indication": { "mean_agreement": 0.00, "n": 8, "method": "anchor-5 similarity" },
  "interpretation": "A LOWER BOUND ONLY. A high value is evidence of contamination. A low value is
                     NOT evidence of its absence — a model may apply memorised targets without
                     reproducing item text. No adjustment to any rating is derived from this."
}
```

**Never compute a "contamination-adjusted" estimate.** Adjusting a number by an uncertainty of unknown magnitude fabricates precision and would be the single most dangerous thing this tool could do. The probe informs the reader; it never touches a rating.

### 7.3 The institutional upside

This turns a liability into an instrument. Aggregated over time and across models, exposure-probe results are a **saturation sentinel** for the public bank — direct evidence of how burned it is and how fast, which is otherwise expensive to obtain and which the secure-pool authoring work (`WQ-P1-04`, `WQ-P1-05`) needs.

An opt-in submission path is therefore worth designing — but it must submit **probe results only, never estimates, never `response_text`**, and it must not be a Worker endpoint (that reintroduces every §4.2 problem). The right mechanism is a GitHub issue template or PR template carrying a probe block: a reviewable, public, human-merged path with no new infrastructure and no inbound-content surface. **Sequenced last and explicitly deferred** (§8, B8).

---

## 8. Implementation sequencing

Two tracks with no dependency between them. **Both are fully unblocked today** — neither needs a credential, a rater, a committee, or a cleared WebSearch budget.

### Track R — Release watch

| # | Item | Owner | Depends on | Notes |
|---|---|---|---|---|
| R1 | `lib/model-releases-validator.mjs` — pure module, both entry points, importing `slugify` and `REQUIRED_EVIDENCE_STRING_FIELDS` from the registry validator | backend | — | Schema is fully specified in §2.3/§2.4; write the validator before the data file so the first committed store is validated by construction |
| R2 | `test-model-releases.mjs` — passing and failing fixture per check K1–K19 | qa | R1 | |
| R3 | `validate-model-releases.mjs` CLI, structured on `validate-model-registry.mjs` including the opportunistic `git show HEAD:` diff | backend | R1 | |
| R4 | npm wiring: `test:model-releases` + `validate:model-releases` into `test`; `validate:model-releases` into `build` after `validate-product-separation` | devops | R2, R3 | K18 stays a warning (§3.4) |
| R5 | Commit `releases-v1.json` empty, `scanState: "never-scanned"`, `coverageClaim: "none"` | backend | R4 | Ships empty and passes cleanly, exactly as the empty registry does |
| R6 | **`release-sources-v1.json`** — empty, with schema and quorum field | backend | — | **The highest-leverage item in this track.** It is what makes L1 detection possible without a search budget. Build it before any scanner. |
| R7 | Scan record schema + `research/model-index/release-watch/` tree + K12/K16/K19 reconciliation | backend | R1 | |
| R8 | **D-30 decision entry** extending D-29's page count and naming the release page's constraints | **founder** | — | Blocks R9 only |
| R9 | `/ai-models/releases` page — empty state only, all facts derived, no per-release route, no score column, stale/degraded banner non-dismissible | frontend | R5, R8 | |
| R10 | Extend the deploy freshness assertion to release-store content | devops | R9 | Otherwise the first release-only deploy reproduces INC-002 |
| R11 | Source-registry population (L1) — human adds primary provider URLs | **founder** | R6 | No search budget required |
| R12 | L1 fetch scanner → PR, never direct push | backend | R7, R11 | |
| R13 | L0 search scanner | backend | R12, **BLK-001** | Founder-owned config; the only item in this track that is blocked |
| R14 | Release → registry promotion runbook (T4), human-merge only | backend + founder | R5 | |

### Track B — BYO judge tool

| # | Item | Owner | Depends on | Notes |
|---|---|---|---|---|
| B1 | **D-31 decision entry**: local MCP chosen; Worker/plugin/in-page/skill-alone rejected with reasons; "no API key in the design" recorded as the security property | **founder** | — | Records a deliberate non-extension of harness §7.2 rather than a silent workaround |
| B2 | `JudgeEstimate` schema + `validate-estimate.mjs` + the **two-way vocabulary ban test** | backend | B1 | **Build the separation guarantee before the thing it guards.** Getting this order wrong is how the guarantee becomes retrofitted and partial. |
| B3 | Tool package skeleton; `projection.mjs` whitelist from `meta.fieldSeparationPolicy`; the no-fetch and no-provider-SDK source scans | backend | B2 | |
| B4 | `list_probe_items`, `get_anchors`, `open_judge_session` with the write-root guard and the data-handling notice | backend | B3 | |
| B5 | `record_item_estimate`, `summarise_judge_session`, artifact writer with the mandatory header | backend | B4 | |
| B6 | `run_exposure_probe` (Probes A and B) | backend | B5 | |
| B7 | Promotion-proof scan: assert nothing under `site/`or `research/scripts/model-harness/` reads a judge artifact; `.gitignore`; the data-tree signature scan; all into `npm test` | qa | B5 | |
| B8 | Disclosure copy on `/ai-models/methodology` (a section, not a new page — D-29 page count) + tool README | frontend | B5, R8 | |
| B9 | Optional Claude Skill wrapper over the MCP server | backend | B5 | Ergonomics only; adds no capability and no new trust surface |
| B10 | *(Deferred)* Opt-in exposure-probe submission via GitHub issue/PR template — probe results only, never estimates, never `response_text` | — | B6 | Explicitly not a Worker endpoint |

### Critical path

```
R1 ─► R2 ─► R3 ─► R4 ─► R5 ─┬─► R9 ─► R10
R6 ─► R11 ─► R12 ─────────  │      ▲
R7 ─────────────────────────┘   R8 ─┘            R13 waits on BLK-001

B1 ─► B2 ─► B3 ─► B4 ─► B5 ─┬─► B6 ─► B10 (deferred)
                            ├─► B7
                            └─► B8 (also waits on R8)
                            └─► B9
```

### Highest technical risks

| Risk | Why it is at the top |
|---|---|
| **The empty tracker reads as a coverage claim** | This is the whole failure mode of Feature 1. Mitigated by `scanState`/`coverageClaim` as *data* (K2, K18) and by the six explicit non-inferences on the page. If the page is written as copy rather than derived from `meta`, the mitigation is gone and no test will catch it. |
| **Coverage and data conflated in the degraded path** | If `coverageThrough` can advance on an aborted scan, the institution publishes a coverage claim it cannot defend — the 09-03 failure in the opposite direction. K16 is the whole guard; it must have a failing fixture. |
| **Judge estimate screenshotted as an official score** | Entirely mitigated by J2 (no composite exists to screenshot) — *provided* J2 holds. If a future contributor adds a composite "for convenience", the separation collapses to labelling. The import scan in B3 and the schema ban in B2 are the defence. |
| **Two honesty standards for two self-serve tools** | `/ai-evaluation-suite` emits a composite and a band with `official: false`; the new tool will not. Until AMB-B is resolved, the institution ships both. |
| **Release page as a doorway pattern** | A row-per-release page that becomes linkable, then indexable, then a stub per model, is a gradual slide into exactly what D-29 forbids. The defence is architectural: no dynamic segment exists on this route, so creating stubs requires creating a route, which is a reviewable change. |
| **A release row written from recollection** | The scanner is blocked, the pressure to populate is real, and the registry's emptiness is currently the institution's most honest asset. K12 (bidirectional scan FK) and K9 (hash format) make fabrication require compound, visible lying rather than a single plausible row. |

---

## 9. Ambiguities — flagged, not decided

| ID | Ambiguity | Blocks | Recommendation |
|---|---|---|---|
| **AMB-A** | D-29 ratified "exactly two pages ship before any model is evaluated". `/ai-models/releases` is a third. Is a single release-watch page with no per-release route within D-29's spirit, or does it need an amending decision? | R9 only. R1–R7 proceed regardless. | Write **D-30** extending the count to three and restating the inherited constraints (§3.5). Do not ship the page on an architect's reading of a founder's decision. |
| **AMB-B** | `/ai-evaluation-suite` publishes a 0–100 composite and institutional band names under `official: false`. The BYO tool will not. Two standards for the same output class. | Nothing technically; it is a credibility question | Converge the suite to the J2 rule — per-item ratings and per-dimension means with `n`, no composite, no band. Contained change to one component's export builders. |
| **AMB-C** | Does the release watch make any coverage promise at launch? | The page's headline, and whether any latency figure is ever published | `coverageClaim: "none"` at launch, `"declared-sources"` once R11/R12 land. **Never implement the 72h/30d figures** — ASM-002/BLK-004, traceable to no primary source. |
| **AMB-D** | Who holds write authority over `releases-v1.json`? It lives in `site/src/data/` (the tightest boundary in `AUTONOMY.md`, per D-02) but is not an index and carries no score. | Whether a scan agent may open a PR against it unattended | Recommend: agents may **propose** via PR; only `lifecycle`, `evaluation_disposition` and `registry_id` transitions require founder merge. Needs an explicit `AUTONOMY.md` placement, not an inference. |
| **AMB-E** | Distribution and brand risk: users will publish "Compassion Benchmark rates X at …" from a judge estimate. J2 removes the number, but the institution's name is still on the artifact. | B8 copy; whether a usage/attribution term is needed | Founder call. Recommend a short attribution term in the README plus the `explain_what_this_is_not()` tool, and accept the residual risk — it is smaller than the risk of shipping a tool that emits a composite. |
| **AMB-F** | The judge tool sends item text to the *user's* provider. Items are already public, so exposure is unchanged — but the user's own pasted content (potentially real crisis text) also goes there. | Data-handling notice wording | Disclose plainly at session open (§6.3(3)). No mitigation is possible or appropriate; the user is choosing their own provider. |
| **AMB-G** | `.benchmark-ops/RELEASE_WATCH.md` calls itself the single-authority file. This design demotes it to a scan ledger. | R7's reconciliation check | Confirm the demotion in D-30 and edit the file's header. Two authorities with overlapping schemas is the defect D-22 and D-11 both address. |

---

## Appendix — what this task did and did not do

**Did:** read `DECISIONS.md` in full and `docs/ARCHITECTURE_MODEL_BENCHMARK.md` in full; re-verified the six ground-truth claims in §0 against the live files (`site/package.json`, `registry-v1.json`, `tasks-v1.json` meta, `model-registry-validator.mjs`, `worker/src/index.ts`, `EvaluationScorer.tsx`, `nav.ts`, `RELEASE_WATCH.md`, `BLOCKERS.md`, `INCIDENTS.md` INC-008, harness §7.2, `adapters/replay.mjs`); critiqued and corrected the proposed release contract on six points; specified the release, meta, scan-record and source-registry schemas; specified 19 validator checks and their wiring; specified the release→registry state machine with five invariants; chose the BYO component with four reasons and five rejected alternatives; specified five structural-separation mechanisms; specified the security boundaries and the exposure-probe design; sequenced 24 implementation items.

**Did not:** create `releases-v1.json`, `release-sources-v1.json`, any scan record, any validator, any test, any route, any component, or any tool package. Did not modify `site/src/data/indexes/**`, `research/rotation-state.json`, entity records, `site/package.json`, `nav.ts`, `DECISIONS.md`, `.benchmark-ops/**`, `.github/workflows/**`, or any existing page. Did not add anything to `INDEX_REGISTRY` or `EntityKind`, and this design requires no change to either. Ran no shell command, performed no web search, installed no package, wrote no credential. Invented no model, no release, no provider, no score, no band, and no date.
