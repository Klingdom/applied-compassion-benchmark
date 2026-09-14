# PR/FAQ Review — System Architecture Lens

**Reviewer:** system-architect
**Date:** 2026-09-14
**Scope:** CB-MODEL (AI model benchmarking) and the continuous research and scoring pipeline
**Mode:** read-only. No builds, scripts, git operations or edits. This file is the only thing written.

**How to read the evidence.** Every claim cites `file:line`. "Derived" means arithmetic from cited
values. "UNVERIFIED" means not confirmed in this pass. Figures the coordinator verified on 2026-09-14
are cited as "(coordinator)". **CB-MODEL has not evaluated or scored any model.** Nothing below
suggests otherwise.

---

## 1. Scope reviewed (files read)

**Pipeline and research**
- `research/run-pipeline.sh` (whole file)
- `research/SCHEDULING.md` (lines 1–40)
- `research/SYSTEM_HEALTH.md` (header)
- `research/rotation-state.json` (header, plus grep for Singapore, Georgia, Cabo Verde / Cape Verde, São Tomé, DRC, Hong Kong)
- `research/scripts/validate-scan.mjs` (whole file)
- `research/scripts/validate-rotation-state.mjs` (whole file)
- `research/APPLIED_CHANGES.md` (grep: Hong Kong)
- `research/change-proposals/*.json` (grep counts only: `status: approved`, veto phrases), `cohere.json` (grep)
- `research/digests/` (file listing, July–September)

**Scoring, data export and validation**
- `site/scripts/lib/scoring.mjs` (whole file)
- `site/src/lib/scoring.ts` (whole file)
- `site/scripts/test-scoring.mjs` (lines 30–50, plus grep)
- `site/scripts/export-public-data.mjs` (whole file)
- `site/scripts/build-entity-records.mjs` (whole file)
- `site/scripts/validate-indexes.mjs` (lines 420–444, plus grep)
- `site/scripts/apply-changes.mjs` (header)
- `site/package.json`
- `site/public/data/scores/singapore.json`, `georgia.json`
- `site/src/data/entity-records/singapore.json` (grep)
- `site/src/data/indexes/countries.json`, `us-states.json`, `ai-labs.json` (grep)

**Product-separation guard and CB-MODEL data**
- `site/scripts/lib/product-separation.mjs` (whole file)
- `site/scripts/lib/separation-waivers.mjs` (lines 1–80)
- `site/scripts/product-separation-waivers.json` (whole file)
- `site/scripts/validate-product-separation.mjs` (grep)
- `site/scripts/lib/model-registry-validator.mjs` (whole file)
- `site/scripts/validate-model-registry.mjs` (grep)
- `site/scripts/validate-model-releases.mjs` (whole file)
- `site/scripts/validate-evaluation-run.mjs` (header)
- `site/src/data/model-benchmark/registry-v1.json`, `releases-v1.json` (whole files), `tasks-v1.json` (meta)

**Model harness**
- `research/scripts/model-harness/core/{manifest,evidence,executor,planner,run-record}.mjs` (whole files)
- `research/scripts/model-harness/bin/run.mjs`, `adapters/replay.mjs` (whole files)

**Agents, deploy and Worker**
- `.claude/agents/score-updater.md` (grep)
- `.claude/agents/overnight-assessor.md`, `overnight-scanner.md`, `overnight-digest.md` (grep for validator calls and scoring)
- `.github/workflows/deploy.yml` (whole file; it is the only workflow)
- `worker/src/index.ts` (grep: badge path)

**Governance and ops**
- `.benchmark-ops/CURRENT_STATE.md`, `BLOCKERS.md`, `MODEL_REGISTRY.md`, `LAST_SUCCESSFUL_RUN.json` (whole files)
- `.benchmark-ops/WORK_QUEUE.md` (grep)
- `docs/ARCHITECTURE_MODEL_BENCHMARK.md` (§0 and §2.6–§4 read; heading grep)
- `docs/MODEL_EVALUATION_HARNESS_DESIGN.md` (heading grep)
- `DECISIONS.md` (D-07, D-13, D-16, D-23, D-29, D-30)
- `INCIDENTS.md` (INC-001 to INC-008 headers and summaries)
- `OBSERVABILITY.md` (§3–§4)
- `AUTONOMY.md` (grep)

**Not read:** `PENDING_CHANGES.md` and scan JSON bodies (per instruction), the PRD / UX / SEO / market docs, `docs/ARCHITECTURE_RELEASE_WATCH_AND_BYO.md`, `docs/SECURITY_BYO_SCORING.md`, and `evaluation-statistics.mjs` internals.

---

## 2. What works (with evidence)

### CB-MODEL: the provenance machinery is genuinely strong

- **Tamper-evident evidence.**
  - Every harness artifact is written as canonical JSON, so the bytes on disk are exactly the bytes that get hashed. A one-byte edit always changes the hash (`research/scripts/model-harness/core/evidence.mjs:11-19`, `:136-143`).
  - The hash tree covers sorted `[path, sha256]` pairs (`evidence.mjs:198-210`). `LOCK` is written last and blocks every later write through the guarded writers (`evidence.mjs:127-129`; `core/manifest.mjs:145-152`).
- **Manifest discipline.** Required fields are checked by presence, not truthiness, so an honest `null` counts as recorded (`manifest.mjs:22-32`, `:37-50`). Fields can only be added at lock time, never changed (`manifest.mjs:103-113`).
- **Deterministic execution.**
  - Trial order is a seeded shuffle (`core/planner.mjs:158-201`).
  - Backoff jitter uses a separate seeded stream (`bin/run.mjs:198`).
  - Content-filter responses are never retried, by construction (`core/executor.mjs:18-21`, `:77-97`).
- **Answer keys cannot reach a model.** `buildModelFacingRequest` only accepts a bare `promptText` string, so evaluator-only fields have no way in (`planner.mjs:75-104`). This is the right way to enforce `tasks-v1.json` `meta.fieldSeparationPolicy`.
- **Built to refuse fabrication.**
  - The replay adapter throws rather than invent a response (`adapters/replay.mjs:124-131`).
  - The CLI refuses any adapter other than replay (`bin/run.mjs:217-219`).
  - `publishable` is hard-coded to `false` (`core/run-record.mjs:159-162`).
  - Run records say "not rated" and "not analysed" in the data itself (`run-record.mjs:137-151`).
- **Immutable model identity.**
  - `registry_id` is derived from developer, family and snapshot, never hand-assigned (`site/scripts/lib/model-registry-validator.mjs:134-136`, `:183-192`).
  - 17 fields are frozen, two are mutable, and `test_dates` can only grow (`:67-96`).
  - A transition validator rejects in-place edits and deletions (`:375-433`).
  - The five-field evidence rule is defined once and imported by the release store (`:108`).
- **The empty states are honest.**
  - `releases-v1.json` separates "never scanned" from "no releases" (`releases-v1.json:9-16`; D-30, `DECISIONS.md:63-69`).
  - `registry-v1.json` is empty and says why (`registry-v1.json:5-8`).
  - `LAST_SUCCESSFUL_RUN.json:88` makes it a fabrication to record a run that is not in the ledger.
- **Kept apart from the entity system.** The Model Index is deliberately excluded from `INDEX_REGISTRY` and `EntityKind`, so a model cannot become badge-able by accident (D-29, `DECISIONS.md:112-116`).

### Continuous research: validators that learned from incidents

- **`validate-scan.mjs` is incident-driven.** Each check names the failure that motivated it (`research/scripts/validate-scan.mjs:5-33`):
  - the source rule (`:294-317`)
  - the recency window (`:319-346`)
  - URL-date vs claimed-date cross-check (`:451-526`)
  - a search ceiling derived from the entity count instead of a magic number (`:536-544`)
  - declared vs actual tier counts (`:568-615`)
  - explicitly no incentive to pad the findings list (`:646-684`)
- **`validate-rotation-state.mjs` uses no name allowlist.** It accepts two documented legacy file shapes but warns on every use (`validate-rotation-state.mjs:69-73`, `:199-239`).
- **The score-updater has hard guards.**
  - It refuses to apply if drift exceeds 2.0, or if the sign flips (`.claude/agents/score-updater.md:52-71`).
  - `last_assessed` belongs to the assessor only (`score-updater.md:122-127`, the INC-003 fix).
  - An apply is incomplete without an entity record and a clean `validate-indexes` run (`score-updater.md:204`).
- **Sidecar matching respects index scope.** Structured subdimension files are matched on `(slug, index)`, so Georgia the country and Georgia the US state do not contaminate each other (`site/scripts/build-entity-records.mjs:403-412`, `:459-466`). The team already understands the namespace problem (Finding F1). The fix just hasn't reached the public namespaces.
- **The separation guard is now a real gate.** `validate-product-separation.mjs` runs in both `npm test` and `npm run build` (`site/package.json:8`, `:26`).
  - Known debt is handled by named, owned, expiring waivers, and unmatched failures still block (`site/scripts/lib/separation-waivers.mjs:5-13`).
  - The two name-fusion rows are resolved: `ai-labs.json` now publishes "Google DeepMind" (`:270`) and "xAI" (`:980`).
- **Deploy verification learned from INC-001 and INC-002.**
  - Node is pinned to 24 (`.github/workflows/deploy.yml:62-71`).
  - Deploys run one at a time (`:13-15`).
  - A freshness assertion compares what the commit expects against what the live site serves (`:178-216`).
- **A strict scoring path exists in TypeScript.** `computeCompositeFromDimensionsStrict` refuses incomplete input, and the file says the lenient `?? 1` path must never produce a published third-party score (`site/src/lib/scoring.ts:80-99`, `:275-280`).

---

## 3. Findings: gaps, risks, contradictions

### Summary

| ID | Sev | System | Finding |
|---|---|---|---|
| F1 | **High** | Both | No canonical entity identity; three incompatible slug namespaces, last write wins |
| F2 | **High** | Continuous Research | No referential integrity between `rotation-state.json` and the index files |
| F3 | **High** | Continuous Research | Stage gates are run by the agents they gate, not by the orchestrator |
| F4 | **High** | Continuous Research | Published institutional scores have no run manifest and are not reproducible |
| F5 | Med | Both | The "single source of truth" formula is three copies; the drift gate doesn't test the canonical one |
| F6 | Med | Both | The CB-MODEL guard can freeze all institutional deploys on 2026-12-10; build outcome depends on the wall clock |
| F7 | Med | CB-MODEL | Append-only transition checks do nothing in CI; the registry validator is not wired |
| F8 | Med | CB-MODEL | Harness evidence chain gaps: unhashed run record, dirty-tree blindness, item version tied to bank version |
| F9 | Med | CB-MODEL | Much of the architecture is designed but not built; release detection shares the research budget |
| F10 | Med | Both | Freshness checks key on the briefing date only; per-entity `updatedAt` is build time |
| F11 | Med | Continuous Research | Scaling ceilings: shared search cap, fixed 14-day lookback, throughput far below entity count |
| F12 | Med | Continuous Research | Proposal hold state lives in prose; 37 "approved" files are held |
| F13 | Low | Both | Governance-state files are stale and contradict the code and each other |
| F14 | Low | Continuous Research | Generated public data is non-deterministic and written before validation |

---

### F1 — No canonical entity identity; three slug namespaces, last write wins
**Severity: High · System: Both**

**Evidence**
- **Three identity schemes coexist.**
  - `rotation-state.json` keys add an index suffix to disambiguate: `"singapore-global-cities"` (`research/rotation-state.json:10443`) and `"georgia-us-states"` (`:14176`).
  - `us-states.json` carries an explicit `"slug": "georgia-us-states"` (`site/src/data/indexes/us-states.json:905`). The global-cities Singapore row does not.
  - `export-public-data.mjs` uses `row.slug ?? slugify(row.name)` (`:130`), writes to one flat folder (`:163`), and on a cross-index collision only warns that "the LAST written file" wins (`:141-149`).
- **The Singapore case, concretely.**
  - `site/public/data/scores/singapore.json:6-7` is `"indexSlug": "global-cities"`, `"kind": "city"`.
  - The country Singapore (rank 37 in `rotation-state.json:214-217`) has no score file.
  - The same thing happens to entity records: `site/src/data/entity-records/singapore.json:6` is `"index_slug": "global-cities"`. They are also written to one flat folder (`build-entity-records.mjs:968-973`, `:1067`).
- **The validator skips instead of failing.** `validate-indexes.mjs:431-437` downgrades a collision to a warning and skips checks 13–16 for the displaced entity. So the country Singapore's record is never structurally validated.
- **Customers can see this.** The Worker badge fetches `https://compassionbenchmark.com/data/scores/${slug}.json` with no index parameter (`worker/src/index.ts:324`). A badge for "singapore" renders the city's score (56.2, `singapore.json:4`).
- **Scale.** 18 cross-index collisions (coordinator).
- **Slugify is re-implemented at least three times**, each commented "must match": `export-public-data.mjs:66`, `build-entity-records.mjs:273`, `model-registry-validator.mjs:122`.
- **The index list is duplicated** by hand, marked "must stay in sync" (`export-public-data.mjs:43-52`, `build-entity-records.mjs:254-263`).

**Why it matters.** Traceability starts with identity. When two entities share one public key, a score, a badge, an evidence record and a subscriber alert can all attach to the wrong subject without any error. This also affects CB-MODEL: the registry's "developer resolves to at most one AI Labs row" join matches on names, not a stable ID (`model-registry-validator.mjs:273-276`).

---

### F2 — No referential integrity between rotation-state and the index files
**Severity: High · System: Continuous Research**

**Evidence**
- **Duplicate and phantom rows.** `rotation-state.json` holds both `"cape-verde"` (`:335-338`, rank 27) and `"cabo-verde"` (`:401-404`, rank 26). `countries.json` has only "Cabo Verde" (`:494`).
- **Truncated name.** `"democratic-republic-of-c"` / "Democratic Republic of C" (`rotation-state.json:1835-1837`) vs "Democratic Republic of the Congo" (`countries.json:3112`).
- **The scan validator defines coverage by rotation-state keys** (`validate-scan.mjs:267-286`). A phantom entity must be "reviewed" to pass, which spends search budget, while a real index row missing from rotation-state is invisible.
- **`validate-rotation-state.mjs` checks only `last_assessed` against report files** (`:31-34`, `:194-240`). It never checks that a rotation entity exists in an index, or the reverse. It has 23 pre-existing failures (coordinator).
- **Code comments give four different entity counts:**
  - `run-pipeline.sh:13-14`: ~1,160 scanned / 1,156 published
  - `build-entity-records.mjs:5`: 1,256
  - `product-separation.mjs:41`: ~1,327 rows
  - `rotation-state.json:3`: `entity_count: 1331`
  - The gap between ~1,327 index rows and 1,331 rotation entities fits the phantom rows above. **UNVERIFIED**: exact index row sum not computed in this pass.

**Why it matters.** `rotation-state.json` drives what gets scanned and when, but nothing checks it against what is published. Score fields are copied into it by hand, "in lockstep" (`score-updater.md:122`; `overnight-assessor.md:269`), with no validator.

---

### F3 — Stage gates are run by the agents they gate
**Severity: High · System: Continuous Research**

**Evidence**
- **After the scanner,** the orchestrator only checks that the file exists (`research/run-pipeline.sh:42-47`). Yet `validate-scan.mjs` defines exit 0 as "safe to spend the Opus assessor budget" (`validate-scan.mjs:38-39`). Only the scanner agent's own prompt runs it (`.claude/agents/overnight-scanner.md:286`).
- **After the assessor,** there is no check at all (`run-pipeline.sh:55-58`):
  - no proposal schema validation
  - no recompute of proposed composites with `scoring.mjs`
  - no `validate-rotation-state --date`
  - The assessor's prompt runs `validate-indexes.mjs` only (`overnight-assessor.md:95`). `normalise-proposal-schema.mjs` exists as a post-hoc repair script, not a gate.
- **Only the digest stage** gets an orchestrator gate (`run-pipeline.sh:73-74`).
- **Nothing records a cycle.** No per-cycle record of which stages ran, their exit codes, validator outputs or search counts.
- **The failure mode is real.** Today the scanner passed validation while carrying 2025 facts inside 2026-dated URLs; the assessor caught it (coordinator). The validator admits it cannot catch this, because it parses URL strings and does not fetch pages (`validate-scan.mjs:451-466`).
- **The history repeats it.** INC-005 (a 64-proposal undercount from writes that bypassed the digest, `INCIDENTS.md:62-74`) and INC-003 (the apply stage corrupting `last_assessed`, `INCIDENTS.md:129-136`) share this root cause: stage contracts are enforced by prompts, not by the orchestrator.

---

### F4 — Institutional scores have no run manifest and are not reproducible
**Severity: High · System: Continuous Research**

**Evidence**
- **Same pipeline, different answers.** Two runs three days apart gave ADP 58.1 and 60.6, across a band boundary. Kazakhstan went 24.4 → 13.7 in four days (D-07, `DECISIONS.md:598-607`; `BLOCKERS.md:191-194`).
- **No hashes or manifests.** "No hashes, no signed run manifests, no public/restricted partition" (`.benchmark-ops/CURRENT_STATE.md:42`). Append-only is "by convention, not by hash" (`:30`).
- **Published subdimensions may not be measurements.** When an assessment's markdown table can't be parsed or fails the mean check, all five subdimensions are set to the dimension value and labelled `confidence: "low"`, `subdims_source: "reconstructed"` (`build-entity-records.mjs:753-770`).
- **Formula divergence is tolerated.**
  - 29 names in `ASSESSOR_OVERRIDE_NAMES` intentionally publish a composite that differs from the formula (`build-entity-records.mjs:100-136`).
  - Non-override divergence up to 2.0 points is a warning, not an error (`validate-indexes.mjs:373-376`).
  - The allowlist is keyed by display name, not by index and slug. It is also copied by hand between two files (`build-entity-records.mjs:96-99`).
- **Asymmetric rigor.** CB-MODEL, which has measured nothing, has canonical JSON, a hash tree, `LOCK`, seeded order and a completeness gate (see §2). The institutional product publishes ~1,300 scores without any of these.

**Why it matters.** "Why did this score change?" cannot be answered from artifacts alone. Nothing links a published composite to the exact evidence URLs retrieved, the agent definition version, the model, or the date the evidence was retrieved.

---

### F5 — The "single source of truth" formula is three copies
**Severity: Med · System: Both**

**Evidence**
- **The drift gate tests the wrong thing.**
  - `scoring.mjs` says it "Mirrors `site/src/lib/scoring.ts` exactly" and that `test-scoring.mjs` is the drift gate (`site/scripts/lib/scoring.mjs:7-14`).
  - But `test-scoring.mjs:37-39` declares its own "Re-implemented scoring functions (must stay in sync with src/lib/scoring.ts)".
  - The parity section compares `scoring.mjs` against that in-file copy (`test-scoring.mjs:633-697`), not against `scoring.ts`. A change made only in `scoring.ts` would not be caught. That's three implementations with two manual sync points.
  - Importing the TS file directly is feasible: `test-entity-href.mjs` already does it via Node type-stripping (`deploy.yml:62-68`).
- **No strict path in Node.** `scoring.mjs` has only the lenient path, `dimScores[c] ?? 1` (`scoring.mjs:67`). `scoring.ts` itself says the lenient path must never produce a published third-party score (`scoring.ts:94-99`). The Node pipeline scripts that validate published scores have no strict entry point.
- **Two formula tiers can never fire (derived).** Dimension values are 0–5 (`scoring.mjs:63`). For 8 values in [0,5], the largest possible population standard deviation is 2.5 (half at 0, half at 5). So the `stdDev <= 5.0 → 0.4` and `else → 0.1` branches (`scoring.mjs:78-81`; `scoring.ts:44-47`) are dead code.
  - This is not a bug to fix unilaterally. Changing the formula is reserved to the owner or a Methods Committee (`BLOCKERS.md:209-213`, BLK-006).
  - It should be recorded, because published methodology may describe four tiers. **UNVERIFIED**: `research/methodology.md` not read.

---

### F6 — The CB-MODEL guard can freeze all institutional deploys on 2026-12-10
**Severity: Med · System: Both (coupling)**

**Evidence**
- **All six waivers expire on the same day, 2026-12-09** (`site/scripts/product-separation-waivers.json:32`, `:43`, `:54`, `:65`, `:76`, `:87`). Five of them depend on D-13, which is "proposed, not ratified" (`DECISIONS.md:432`).
- **Expiry is checked against the wall clock:** `const today = new Date().toISOString().slice(0, 10)` (`validate-product-separation.mjs:225`). An expired waiver blocks again (`separation-waivers.mjs:11`).
- **The guard runs in both `npm test` and `npm run build`** (`package.json:8`, `:26`). The deploy workflow runs both before deploying (`deploy.yml:78-82`).
- **Consequences:**
  - From 2026-12-10, every push to `main` fails CI unless D-13 is ratified or the waivers are extended. That includes nightly briefings and score applies, which have nothing to do with the six rows.
  - The same commit passes on 12-09 and fails on 12-10, so the build is not deterministic in its inputs.
- **In fairness:** the forcing function is deliberate (`separation-waivers.mjs:11`), and D-30 names the danger itself: "a founder-owned blocker must not block every unrelated deploy, which is how guards get disabled permanently" (`DECISIONS.md:67-69`). Staggered expiries and advance warnings would keep the forcing function without a single freeze date.

---

### F7 — Append-only checks do nothing in CI; the registry validator isn't wired
**Severity: Med · System: CB-MODEL**

**Evidence**
- **Both transition checks compare against the wrong baseline.** `validate-model-releases.mjs:99-110` and `validate-model-registry.mjs:84` compare the working tree against `git show HEAD:<path>`.
  - In CI, the checkout is the commit under test, so working tree equals HEAD. An in-place overwrite that is already committed diffs against itself and passes.
  - The check only works on uncommitted local edits.
  - The design says the check should run as "`validateRegistryTransition(prior=git HEAD, next=PR)` in CI" (`docs/ARCHITECTURE_MODEL_BENCHMARK.md:295`). The prior state must be the parent or merge base, not HEAD.
- **The live registry is never validated.** `validate:model-registry` is in neither `build` nor `test`; only the fixture test `test:model-registry` runs (`package.json:8`, `:26`). The architecture doc raised this (`ARCHITECTURE_MODEL_BENCHMARK.md:32`) and it is still true.
- **Latent today** because the registry and release store are both empty (`registry-v1.json:5`, `releases-v1.json:5`). It becomes live on the first real entry.

---

### F8 — Harness evidence chain gaps
**Severity: Med · System: CB-MODEL (Phase A)**

**Evidence**
- **The run record is outside the tamper-evident chain.** `run-record.json`, the artifact the analysis layer consumes, is written after `LOCK` and bypasses the lock-guarded writer (`bin/run.mjs:353-376`). The code documents this as an interpretation. The manifest hash and hash root are embedded in it (`run-record.mjs:153-156`), but the record itself is covered by no hash.
- **Harness code state is not really pinned.** `harness_commit` is read from `.git/HEAD` refs and does not record a dirty working tree (`bin/run.mjs:38-57`). A run made with uncommitted harness changes would claim a clean commit.
- **Request timing is not measured.** `requested_at` and `responded_at` are both stamped back-to-back at persistence time, after the response (`bin/run.mjs:132-133`). Only the adapter-reported `latency_ms` means anything.
- **Item version is really bank version.** `itemVersion` is the bank's `meta.bankVersion` for every item (`planner.mjs:147-150`; `bin/run.mjs:302`), and it is part of the item hash (`evidence.mjs:73-75`). Any bank bump changes every item's hash, so unchanged items can't be compared across bank versions. This matches the cohort rule (`ARCHITECTURE_MODEL_BENCHMARK.md:368-378`) but removes any longitudinal item-level analysis. The code flags it as an interpretation.
- **Low-grade: fixed `form_id`.** It is hard-coded to `"core-public-v1"` (`bin/run.mjs:272`) rather than derived from the bank.

---

### F9 — Designed but not built; release detection shares the research budget
**Severity: Med · System: CB-MODEL**

**Evidence**
- **Missing build scripts.** `ARCHITECTURE_MODEL_BENCHMARK.md` §2.6 assigns integrity checks R1–R10 to `build-model-index.mjs` and `lib/model-result-validator.mjs` (`:266-277`). §3.3 item 5 specifies a byte-compare of the regenerated model index in the build (`:310`). Neither file appears in the `site/scripts` listing.
- **Missing workflows.** §3.5 specifies `model-release-watch.yml` and `model-evaluate.yml` (`:325-331`). `.github/workflows/` contains only `deploy.yml`.
- **Missing folders.** `research/model-index/` does not exist (glob returned no files). The release validator prints SKIPPED for scan-record checks (`validate-model-releases.mjs:79-86`). `validate-evaluation-run.mjs` reports 0 runs as a pass (`:27-33`).
- **This gap is correctly sequenced** behind BLK-002, BLK-005 and BLK-006 (`BLOCKERS.md:14-23`). The architecture concern is different: release detection (stage 1) needs the same session-wide WebSearch cap as the institutional scanner (`BLOCKERS.md:66-91`; `ARCHITECTURE_MODEL_BENCHMARK.md:293`). The two products will compete for one budget, and no allocation rule exists.

---

### F10 — Freshness checks see only the briefing date; `updatedAt` is build time
**Severity: Med · System: Both**

**Evidence**
- **The deploy freshness check compares one value:** `manifest.json .latest` against the first item date in `/updates/feed.json` (`deploy.yml:193-216`).
  - A commit that only applies a score, such as Hong Kong 32.8 → 26.9 on 2026-09-14 (`research/APPLIED_CHANGES.md:900`), leaves that date unchanged if no new briefing is published in the same commit. A stale cached Docker layer would pass. That is the INC-002 failure mode (`INCIDENTS.md:168-180`).
  - The model-content version of this gap is already documented (`ARCHITECTURE_MODEL_BENCHMARK.md:38-42`).
- **`updatedAt` means "last build".** Every score file gets the same build-time `updatedAt` (`export-public-data.mjs:91`, `:160`; `singapore.json:9` shows `2026-09-14T16:41:05.463Z`). The only per-entity timestamp customers see carries no information about when the score last changed.
- **Stale reads compound.** The Worker caches score fetches for an hour (`worker/src/index.ts:325`).
- **No independent drift probe.** Nothing checks production against `main` outside a deploy run (`OBSERVABILITY.md:59`), and CI failures send no notification (`OBSERVABILITY.md:58`).

---

### F11 — Scaling ceilings: search cap, fixed lookback, throughput
**Severity: Med · System: Continuous Research**

**Evidence**
- **Search budget per cycle (derived).**
  - Floors are 150 T1 + ⌈(N−150)/12⌉ T2 + 15 T3 + 10 verification (`validate-scan.mjs:49-51`, `:61`, `:542-544`).
  - At N = 1,331: 150 + 99 + 15 + 10 = **274 searches per cycle**, consistent with the 276 run today (`INCIDENTS.md:272`).
  - T1 is fixed at 150, so about 1,181 entities (89%) get only batched coverage, 12 per search. Each 12 entities added cost one more search per cycle.
- **Session cap.** WebSearch is capped at 2,000 per session, shared across every agent run in that session (INC-008, `INCIDENTS.md:267-274`; `BLOCKERS.md:77-80`). The runbook is now "one nightly cycle per session".
- **Lookback is hard-coded at 14 days** (`validate-scan.mjs:46`, `:319-346`). A coverage gap longer than 14 days can't be closed by one catch-up cycle without either changing the validator or dropping evidence. Today's 12-day gap (09-02 → 09-14) had two days of margin.
- **Cadence has degraded.** Digests exist for every day from 07-01 to 08-01 except 07-19, then only 08-11, 08-18, 08-20, 08-26, 09-01 and 09-14 (`research/digests/` listing).
  - `SCHEDULING.md:9-10` says a VPS cron runs Mon–Sat autonomously with "no machine dependency". The observed cadence contradicts it.
  - Whether the cron is installed is **UNVERIFIED** (`scripts/vps-bootstrap.sh` and `docs/VPS_SCHEDULING.md` exist but were not read).
- **Assessment throughput (derived).** The default is 15 entities per cycle (`run-pipeline.sh:25`); 19 were assessed today (coordinator). 1,331 ÷ 19 ≈ 70 cycles for one full pass. At the current roughly weekly cadence, that is more than a year.
  - Example: Finland (rank 5) was last assessed 2026-04-25 but last scanned 2026-09-14 (`rotation-state.json:11-12`).
  - Scanning is not assessing, and nothing public distinguishes the two.

**Single points of failure**

| SPOF | Evidence | Affects |
|---|---|---|
| Session WebSearch cap | BLK-001; INC-008 | Scanner, and future release watch |
| Founder as sole approver and methods authority | BLK-006 (`BLOCKERS.md:207`); D-16 | Applies, D-13, waivers, formula |
| One operator starting sessions (cron status UNVERIFIED) | Digest cadence; `SCHEDULING.md:9` | Research freshness |
| One VPS static host, and the Worker badge reads from it | `deploy.yml:113-132`; `worker/src/index.ts:324` | Site and badges |
| Silent CI failure | `OBSERVABILITY.md:58`; INC-001 | Every gate above |

---

### F12 — Proposal hold state lives in prose
**Severity: Med · System: Continuous Research**

**Evidence**
- **37 proposal files say `status: "approved"`** (grep count over `research/change-proposals/*.json`), and all 37 are held by self-vetoes (coordinator; D-16, `DECISIONS.md:342-351`).
- **The veto exists only in the text.** D-16's test is whether the proposal's `notes` or `rationale` instruct against publication. That is a reading of prose, not a field.
- **The phrases aren't consistent (derived from grep).** A case-insensitive grep for "DO NOT APPLY | No score change is proposed | do not apply" matches 19 of the 37 approved files. **18 approved-and-held files contain none of those phrases**, so a script can't reliably tell a held proposal from an approved one.
- **No `held` status.** The applier writes `hold_reason` only for drift holds (`score-updater.md:58-61`). `cohere.json:99-100` shows the combination `recommendation: "flag-for-review"` with `status: "approved"`.
- **Cross-product entanglement.** Seven of the 37 (abridge, ai21-labs, cohere, isomorphic-labs, recursion-pharma, sakana-ai, tempus-ai) are the 60.9 band-gap cluster behind CB-MODEL WQ-P1-03, which is blocked on BLK-006 (`WORK_QUEUE.md:37`; `CURRENT_STATE.md:56`).

---

### F13 — Governance-state files are stale and contradictory
**Severity: Low · System: Both**

**Evidence**

| File and location | What it says | What is actually true |
|---|---|---|
| `CURRENT_STATE.md:7` | Last updated 2026-09-07 | — |
| `CURRENT_STATE.md:32` | Separation guard "not wired into `npm run build`" | It is (`package.json:8`) |
| `CURRENT_STATE.md:62` | "Auto-deploy has never succeeded" | 7 straight successes since 09-09 (coordinator) |
| `CURRENT_STATE.md:31` | Decisions "D-00…D-23" | D-30 exists |
| `LAST_SUCCESSFUL_RUN.json:38` | "No execution harness, provider adapter or run-manifest implementation exists" | `research/scripts/model-harness/` exists with a replay adapter and `core/manifest.mjs` |
| `WORK_QUEUE.md:42` | WQ-P1-08 registry schemas "OPEN" | Validator exists |
| `WORK_QUEUE.md:49` | WQ-P2-01 evidence hashing "OPEN" | `evidence.mjs` exists |
| `WORK_QUEUE.md:54` | Deploy "zero successes" | Superseded (see above) |
| `ARCHITECTURE_MODEL_BENCHMARK.md:26-34` | Guard "not wired to anything" | Fixed per `product-separation-waivers.json:6-11` |
| `research/SYSTEM_HEALTH.md:7` | Snapshot 2026-05-21, GREEN | Stale |

**Why it matters.** Agents read these files as ground truth. The repo already records a double misdiagnosis caused by reasoning from the wrong premise (`BLOCKERS.md:81-83`).

---

### F14 — Generated public data is non-deterministic and written before validation
**Severity: Low · System: Continuous Research**

**Evidence**
- **Timestamps change every build.** `export-public-data.mjs` stamps wall-clock time into every score file, catalog and index aggregate (`:91`, `:160`, `:212`, `:225`). Two builds of the same commit produce different bytes. `site/public/build-manifest.json` shows as modified in the session-start git status.
- **Data is written before it is validated.** npm runs `prebuild` (export, history, feeds, OG images, llms; `package.json:7`) before the `build` script's validators (`validate-indexes`, separation, releases, briefings; `package.json:8`). Locally, invalid data is written to `site/public/data` before validation fails.
- **CI still blocks the deploy** (`deploy.yml:90-92`), so this is hygiene, not a live exposure.

---

## 4. Top 5 recommended improvements

Scoring: each dimension is rated 1–5, and **Priority = Impact + Strategic + Learning + Confidence − Effort − Risk**.

### Scorecard

| Rank | Recommendation | Type | Imp | Str | Lrn | Conf | Eff | Risk | **Priority** |
|---|---|---|---|---|---|---|---|---|---|
| 1 | R2 — Orchestrator-enforced stage contracts plus a cycle manifest | fix | 5 | 4 | 4 | 4 | 2 | 1 | **14** |
| 2 | R3 — Assessment run manifests plus a published test-retest experiment | improvement + experiment | 5 | 5 | 5 | 3 | 3 | 2 | **13** |
| 3 | R1 — Canonical entity identity plus foreign-key validation | fix | 5 | 5 | 3 | 5 | 3 | 3 | **12** |
| 4 | R4 — Deterministic build and deploy verification | fix | 4 | 4 | 2 | 5 | 2 | 1 | **12** |
| 5 | R5 — Machine-readable proposal lifecycle and generated ops status | improvement | 4 | 4 | 3 | 4 | 2 | 1 | **12** |

R1, R4 and R5 tie at 12. They are ordered by Impact, then by Risk.

---

### R2 — Enforce stage contracts in the orchestrator and emit a cycle manifest
- **Type:** fix
- **Problem:** Validators run only if the gated agent's prompt remembers to run them. The assessor stage has no gate. Nothing records what a cycle actually did (F3; `run-pipeline.sh:42-58`).
- **Proposal:**
  1. In `run-pipeline.sh`, run `node research/scripts/validate-scan.mjs $DATE` after stage 1 and abort on non-zero.
  2. After stage 2, run `validate-rotation-state.mjs --date $DATE` and a new `validate-proposals.mjs`. It should check the JSON schema, recompute the composite with a *strict* `scoring.mjs` entry point (F5), confirm the `(index, slug)` exists in the index, check subdimension means, and enforce a machine-readable `status` enum (R5).
  3. Write `research/cycles/<date>.json` with each stage's start and end, the agent definition's sha256, the `claude` exit code, each validator's exit code and summary, search counts and output file hashes.
  4. Make a missing or failed cycle manifest visible on the next run.
- **Expected benefit:** Stage contracts become explicit and checked mechanically. Silent partial cycles (OBSERVABILITY.md §3 row 6) become detectable. Every cycle becomes an auditable record.
- **Evidence:** F3; `validate-scan.mjs:38-39`; INC-003; INC-005; INC-006.

### R3 — Give institutional assessments run manifests, and publish test-retest reliability
- **Type:** improvement + experiment
- **Problem:** Published institutional scores can't be traced to retrieved evidence or instrument versions. Machine-only reliability is known to be weak but has never been measured on purpose (F4; D-07).
- **Proposal:**
  1. Reuse `model-harness/core/evidence.mjs` (canonical JSON, sha256) without modification.
  2. Per assessment, write `research/assessments/<index>/<slug>/<date>.manifest.json` containing: agent definition hash, model ID, the canonical formula version and test-vector hash, each search query, each retrieved URL with `retrieved_at` and a content hash where feasible, and the sidecar's sha256.
  3. Carry the manifest hash into the proposal, `APPLIED_CHANGES.md` and the entity record's `source_assessment`.
  4. **Experiment:** blind re-assessment of a stratified sample of about 30 entities against a frozen evidence snapshot. Report the test-retest spread per dimension, and the rate of band flips, against the D-07 cases.
- **Expected benefit:**
  - "Why did this change?" becomes answerable from artifacts.
  - The first measured reliability figure for the institutional product.
  - A shared evidence standard with CB-MODEL, which strengthens the independence and methodology story.
- **Evidence:** F4; `CURRENT_STATE.md:42`; `DECISIONS.md:598-607`; `evidence.mjs:136-143`, `:198-210`.
- **Caveat:** The search budget for the experiment competes with the nightly cycle (F11). Run it against frozen evidence snapshots so it needs no new searches.

### R1 — Introduce a canonical `entity_id` and enforce foreign keys across every store
- **Type:** fix
- **Problem:** Three incompatible identity schemes with last-write-wins public files. The Singapore country score and entity record are displaced. Phantom and truncated rotation-state rows exist, and nothing checks joins (F1, F2).
- **Proposal:**
  1. Define `entity_id = "<indexSlug>/<slug>"` and a single `site/scripts/lib/entity-identity.mjs` (slugify, index list, collision policy) imported by every generator and validator.
  2. Require an explicit `slug` on every index row.
  3. Fail the build, not warn, on any cross-index public-path collision. Resolve the 18 collisions with explicit slugs, following the `georgia-us-states` convention, plus nginx and Worker redirects.
  4. Key `rotation-state.json` by `entity_id`.
  5. Add `validate-entity-graph.mjs`: every rotation entity resolves to exactly one index row, every index row to exactly one rotation entity, no duplicate canonical names within an index (Cabo Verde / Cape Verde), and every entity record's `index_slug` matches its path.
  6. Wire it into `npm run build`.
- **Expected benefit:** Every downstream artifact (score file, badge, entity record, alert, proposal) is traceable to exactly one subject. This removes a whole class of silent misattribution and gives CB-MODEL's developer-to-lab join a stable key.
- **Evidence:** F1, F2; `export-public-data.mjs:141-149`; `validate-indexes.mjs:431-437`; `singapore.json:6`; `rotation-state.json:335`, `:401`, `:1835`.
- **Caveat:** A data change and deploy are in flight. Schedule this after they land. The URL and badge migration is the main risk.

### R4 — Make build and deploy verification deterministic and content-addressed
- **Type:** fix
- **Problem:** Several checks look solid but aren't (F6, F7, F10, F14):
  - freshness is keyed on the briefing date only
  - `updatedAt` is build time
  - waiver expiry depends on the wall clock, with six expiries on one day
  - append-only diffs compare HEAD to itself in CI
  - the live registry is never validated
- **Proposal:**
  1. The export writes `contentHash` (sha256 over canonical rankings) into `public/data/index.json`. The deploy verify job compares the commit's computed hash with the live one, which covers score-only and model-only commits.
  2. Derive per-entity `updatedAt` from the last applied change date in `APPLIED_CHANGES` or the entity-history data, not the build clock.
  3. Evaluate waiver expiry against the commit date (`git log -1 --format=%cs`). Warn at T−30 days, stagger the six expiries, or require a dated decision entry to extend.
  4. Run the transition validators with `fetch-depth: 2` against `HEAD~1` (or `github.event.before`).
  5. Add `validate:model-registry` to `npm run build`.
  6. Move validators ahead of `prebuild`'s data writes, or have `prebuild` write to a temp folder that is promoted after validation.
- **Expected benefit:** The same commit gives the same build result on any day. Stale-deploy detection covers every content type. CB-MODEL immutability is actually enforced when it matters.
- **Evidence:** F6, F7, F10, F14; `deploy.yml:193-216`; `validate-product-separation.mjs:225`; `validate-model-releases.mjs:99-110`; `package.json:7-8`, `:26`.

### R5 — Machine-readable proposal lifecycle, and ops status generated from data
- **Type:** improvement
- **Problem:** 37 "approved" proposals are held by prose vetoes that can't be reliably detected. State files agents treat as ground truth are stale and contradict each other (F12, F13).
- **Proposal:**
  1. Extend the proposal `status` enum with `held`, plus a `hold` object: `{kind: self-veto | drift | D-07-conflict | methods, reason, remedy, set_by, set_at}`.
  2. Migrate the 37 files. This is a data change, so it needs founder approval under AUTONOMY.
  3. `validate-proposals.mjs` (R2) rejects `approved` with non-null veto text or a hold block.
  4. Add `build-ops-status.mjs`, which generates `research/SYSTEM_HEALTH.md` and the counters in `.benchmark-ops/CURRENT_STATE.md` from source data: proposal counts by status, the last cycle manifest (R2), validator exit codes, waiver expiry dates, last deploy result and last scan date.
  5. Keep prose sections for judgement only.
- **Expected benefit:** Queue counts can't silently diverge again (INC-005 class). Agents start from true state. PR/FAQ claims about operational health become regenerable evidence.
- **Evidence:** F12, F13; `DECISIONS.md:342-351`; `score-updater.md:58-61`; `OBSERVABILITY.md:60`, `:71-74`.

---

## 5. PR/FAQ inputs

### (a) The customer problem, as seen through architecture

People who cite, buy on, or regulate against a compassion rating need to be able to defend the number. That includes journalists, procurement and ESG analysts, policy staff and AI buyers. A defensible number has four properties:

1. It is about exactly the entity named.
2. It links to the dated evidence behind it.
3. It comes from a versioned instrument, so a change can be attributed to the entity rather than to the method.
4. It was authorized by an accountable human, and would come out the same if re-run.

Most benchmarks publish the number but not those guarantees.

Compassion Benchmark's architecture currently delivers the guarantees unevenly:

- **CB-MODEL** has built most of the provenance machinery: immutable snapshot identity, hash-locked evidence, seeded execution and completeness gates. But it has measured nothing, and is blocked on budget, raters and a Methods Committee.
- **The institutional product** publishes about 1,300 scores with human approval and strong screening validators. But it lacks canonical identity, run manifests and measured reproducibility.

The PR/FAQ's credibility depends on closing that gap: bring the institutional pipeline up to the evidence standard CB-MODEL already demonstrates, before promising either product at release cadence.

### (b) Hard FAQ questions, with honest answers

**1. "If you re-ran your assessment of the same organization tomorrow, would you get the same score?"**

Not guaranteed. The composite formula is deterministic (`site/scripts/lib/scoring.mjs:66-93`), but its inputs are dimension judgments made by AI research agents reading web evidence.

- Two runs of the same pipeline three days apart scored ADP 58.1 and 60.6, on opposite sides of a band boundary (D-07, `DECISIONS.md:598-602`).
- Safeguards:
  - conflicting assessments trigger a fresh assessment rather than a pick (D-07)
  - proposals whose baseline has drifted more than 2 points are refused (`score-updater.md:52-71`)
  - every published change needs human approval
- Missing: test-retest reliability has never been measured deliberately, and assessments carry no run manifest (`CURRENT_STATE.md:42`). This is R3.

**2. "You've launched an AI model benchmark page but haven't evaluated a single model. What exactly am I looking at?"**

A pre-registration (D-29). It covers the method, a versioned 33-item task bank and the rules for what would count as a result, all published before any result exists.

- None of the 33 items is validated: 28 are unvalidated and 5 are draft (`ARCHITECTURE_MODEL_BENCHMARK.md:18`).
- The evaluation harness has only been exercised on synthetic replay fixtures. It cannot make network calls (`adapters/replay.mjs:1-15`; `bin/run.mjs:217-219`).
- The model registry is empty (`registry-v1.json:5-8`), and no release scan has ever run (`releases-v1.json:12`).
- Evaluation is blocked on:
  - model API budget and credentials (BLK-002)
  - a human rating panel (BLK-005)
  - a Methods Committee (BLK-006)
- No turnaround SLA is offered, because the 72-hour and 30-day figures have no readable source (BLK-004).

**3. "When I embed your badge or download the score file for an entity, how do I know it's that entity?"**

Today, not always.

- Public score files and entity records live in one flat folder keyed by name-derived slugs. When two indexes share a slug, the last-written index wins (`export-public-data.mjs:141-149`).
- `singapore.json` serves the city of Singapore, and the country Singapore has no score file (`site/public/data/scores/singapore.json:6`). The coordinator found 18 such collisions.
- `rotation-state.json` also holds a duplicate country (Cabo Verde / Cape Verde) and a truncated name for the DRC.
- R1 proposes a canonical `<index>/<slug>` identity, with collisions failing the build.

**4. "Your research is described as 'nightly'. How current is any given score?"**

It depends on the entity, and the site doesn't currently say.

- Daily digests ran through 2026-08-01. Since then cycles have been roughly weekly: 08-11, 08-18, 08-20, 08-26, 09-01, 09-14.
- A 12-day gap was caused by a session-wide web-search cap that one full scan nearly exhausts in combination with other work (INC-008).
- Each cycle scans every entity (150 individually, the rest in batches of 12), but fully re-assesses only 15–20.
- A full re-assessment pass therefore takes on the order of 70 cycles (derived). Finland was last scanned 2026-09-14 but last fully assessed 2026-04-25 (`rotation-state.json:11-12`).
- The per-entity `updatedAt` field in public score files is the build time, not the last score change (`export-public-data.mjs:91`).

**5. "How do you stop your AI model ratings and your AI lab governance ratings from contaminating each other?"**

Structurally, and with disclosed exceptions.

- **Kept separate by design:**
  - Model snapshots live in a separate registry, outside the entity system that drives badges and search (D-29).
  - A model's developer may map to at most one AI Labs row (`model-registry-validator.mjs:347-360`).
  - A separation guard runs in every build (`package.json:8`).
- **Known exceptions:**
  - The guard currently finds six organizations with two published composites each, up to 45.3 points apart (for example Figure AI at 31.3 in AI Labs and 48.4 in Robotics).
  - All six are covered by named, owned waivers that expire 2026-12-09 (`product-separation-waivers.json`).
  - Resolving them requires ratifying D-13, which is still only proposed.
  - If D-13 isn't ratified and the waivers aren't consciously extended, every site deploy will fail from 2026-12-10 (F6). That forcing function is intentional, but its blast radius should be reduced (R4).
